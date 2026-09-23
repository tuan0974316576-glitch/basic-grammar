import 'dart:async';
import 'dart:convert';

import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/app_notification_preferences.dart';

class NotificationController extends ChangeNotifier {
  NotificationController({
    FirebaseMessaging? messaging,
    FirebaseAuth? auth,
    FirebaseFunctions? functions,
    this.onStudyReminderOpened,
  })  : _messaging = messaging ?? FirebaseMessaging.instance,
        _auth = auth ?? FirebaseAuth.instance,
        _functions =
            functions ?? FirebaseFunctions.instanceFor(region: 'asia-east2');

  static const _preferencesKey = 'a1-buddy-notification-preferences-v2';
  static const _legacyEnabledKey = 'a1-buddy-notifications-enabled-v1';
  static const _activityCountKey = 'a1-buddy-notification-activity-count-v1';
  static const _offerShownKey = 'a1-buddy-notification-offer-shown-v1';
  final FirebaseMessaging _messaging;
  final FirebaseAuth _auth;
  final FirebaseFunctions _functions;
  final VoidCallback? onStudyReminderOpened;
  StreamSubscription<String>? _tokenSubscription;
  StreamSubscription<RemoteMessage>? _messageSubscription;
  String? _registeredToken;
  AppNotificationPreferences _preferences = const AppNotificationPreferences();
  bool _busy = false;
  String _message = '';
  int _activityCount = 0;
  bool _offerShown = false;
  bool _offerReady = false;

  bool get enabled => _preferences.anyEnabled;
  AppNotificationPreferences get preferences => _preferences;
  bool get busy => _busy;
  String get message => _message;
  bool get shouldOfferPermission => _offerReady;

  Future<void> initialize() async {
    final initialMessage = await _messaging.getInitialMessage();
    _handleMessage(initialMessage);
    _messageSubscription = FirebaseMessaging.onMessageOpenedApp.listen(
      _handleMessage,
    );
    final preferences = await SharedPreferences.getInstance();
    final suffix = _preferenceSuffix;
    final source = preferences.getString('$_preferencesKey$suffix');
    if (source != null && source.isNotEmpty) {
      try {
        _preferences = AppNotificationPreferences.fromJson(
          Map<String, dynamic>.from(jsonDecode(source) as Map),
        );
      } catch (_) {
        _preferences = const AppNotificationPreferences();
      }
    } else if (preferences.getBool(_legacyEnabledKey) == true) {
      _preferences = const AppNotificationPreferences(
        daily: true,
        streakRisk: true,
      );
      await _savePreferences(preferences);
    }
    _activityCount = preferences.getInt('$_activityCountKey$suffix') ?? 0;
    _offerShown = preferences.getBool('$_offerShownKey$suffix') ?? false;
    if (_preferences.anyEnabled && _auth.currentUser != null) {
      try {
        final settings = await _messaging.getNotificationSettings();
        if (settings.authorizationStatus == AuthorizationStatus.authorized ||
            settings.authorizationStatus == AuthorizationStatus.provisional) {
          await _registerCurrentToken();
          _listenForTokenRefresh();
        }
      } catch (error) {
        debugPrint('Notification restore failed: $error');
      }
    }
    notifyListeners();
  }

  void _handleMessage(RemoteMessage? message) {
    if (const {
      'study_reminder',
      'daily_reminder',
      'streak_risk',
      'achievement',
      'weekly_summary',
      'social',
    }.contains(message?.data['type'])) {
      onStudyReminderOpened?.call();
    }
  }

  Future<AppNotificationPreferences> setCategory(
    AppNotificationCategory category,
    bool value,
  ) async {
    if (_busy || _preferences.enabled(category) == value) return _preferences;
    return _applyPreferences(
      _preferences.setCategory(category, value),
      successMessage: value ? '通知已開啟。' : '通知已關閉。',
    );
  }

  Future<AppNotificationPreferences> enableRecommended() {
    return _applyPreferences(
      AppNotificationPreferences(
        daily: true,
        streakRisk: true,
        social: _preferences.social,
        achievements: _preferences.achievements,
        reminderMinutes: _preferences.reminderMinutes,
      ),
      successMessage: '每日提醒同火焰提示已開啟。',
    );
  }

  Future<AppNotificationPreferences> setReminderMinutes(int value) async {
    if (_busy) return _preferences;
    final next = _preferences.withReminderMinutes(value);
    _preferences = next;
    await _savePreferences();
    if (_preferences.anyEnabled) {
      try {
        await _registerCurrentToken();
      } catch (error) {
        debugPrint('Notification time sync failed: $error');
        _message = '時間已儲存，雲端設定會稍後再同步。';
      }
    }
    notifyListeners();
    return _preferences;
  }

  Future<void> noteLearningActivity({required int streakDays}) async {
    final store = await SharedPreferences.getInstance();
    _activityCount += 1;
    await store.setInt('$_activityCountKey$_preferenceSuffix', _activityCount);
    _offerReady = notificationPermissionOfferEligible(
      activityCount: _activityCount,
      streakDays: streakDays,
      offerShown: _offerShown,
      anyCategoryEnabled: _preferences.anyEnabled,
    );
    notifyListeners();
  }

  Future<void> markPermissionOfferShown() async {
    _offerShown = true;
    _offerReady = false;
    final store = await SharedPreferences.getInstance();
    await store.setBool('$_offerShownKey$_preferenceSuffix', true);
    notifyListeners();
  }

  Future<AppNotificationPreferences> _applyPreferences(
    AppNotificationPreferences next, {
    required String successMessage,
  }) async {
    if (_busy) return _preferences;
    _busy = true;
    _message = '';
    notifyListeners();
    try {
      if (next.anyEnabled && !_preferences.anyEnabled) {
        final authorized = await _ensurePermission();
        if (!authorized) {
          _message = '未開啟通知，可以稍後在手機設定更改。';
          return _preferences;
        }
      }
      _preferences = next;
      await _savePreferences();
      if (_preferences.anyEnabled) {
        await _registerCurrentToken();
        _listenForTokenRefresh();
      } else {
        final token = await _messaging.getToken();
        if (token != null && token.isNotEmpty) await _unregisterToken(token);
        _registeredToken = null;
        await _tokenSubscription?.cancel();
        _tokenSubscription = null;
      }
      _message = successMessage;
      return _preferences;
    } catch (error) {
      debugPrint('Notification setting failed: $error');
      _message = '暫時未能更改通知設定，請稍後再試。';
      return _preferences;
    } finally {
      _busy = false;
      notifyListeners();
    }
  }

  Future<bool> _ensurePermission() async {
    var settings = await _messaging.getNotificationSettings();
    if (settings.authorizationStatus == AuthorizationStatus.notDetermined) {
      settings = await _messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );
    }
    return settings.authorizationStatus == AuthorizationStatus.authorized ||
        settings.authorizationStatus == AuthorizationStatus.provisional;
  }

  void _listenForTokenRefresh() {
    _tokenSubscription ??= _messaging.onTokenRefresh.listen((token) {
      unawaited(_replaceToken(token));
    });
  }

  Future<void> _replaceToken(String token) async {
    final previous = _registeredToken;
    if (previous != null && previous != token) {
      try {
        await _unregisterToken(previous);
      } catch (error) {
        debugPrint('Old notification token cleanup failed: $error');
      }
    }
    await _registerToken(token);
  }

  Future<void> _registerCurrentToken() async {
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.iOS) {
      for (var attempt = 0; attempt < 10; attempt += 1) {
        if (await _messaging.getAPNSToken() != null) break;
        await Future<void>.delayed(const Duration(milliseconds: 250));
      }
    }
    final token = await _messaging.getToken();
    if (token == null || token.isEmpty) {
      throw StateError('Notification token is unavailable.');
    }
    await _registerToken(token);
  }

  Future<void> _registerToken(String token) async {
    if (_auth.currentUser == null) return;
    await _functions.httpsCallable('registerNotificationToken').call<void>({
      'token': token,
      'platform': kIsWeb
          ? 'web'
          : defaultTargetPlatform == TargetPlatform.iOS
              ? 'ios'
              : 'android',
      'categories': {
        'daily': _preferences.daily,
        'streakRisk': _preferences.streakRisk,
        'social': _preferences.social,
        'achievements': _preferences.achievements,
      },
      'reminderMinutes': _preferences.reminderMinutes,
      'timeZone': 'Asia/Hong_Kong',
    });
    _registeredToken = token;
  }

  Future<void> _unregisterToken(String token) async {
    if (_auth.currentUser == null) return;
    await _functions.httpsCallable('unregisterNotificationToken').call<void>({
      'token': token,
    });
  }

  Future<void> unregisterForLogout() async {
    try {
      final token = _registeredToken ?? await _messaging.getToken();
      if (token != null && token.isNotEmpty) await _unregisterToken(token);
    } catch (error) {
      debugPrint('Notification logout cleanup failed: $error');
    }
    try {
      // Invalidating the device token is the fallback if the server-side
      // unregister call was offline, so the next student cannot receive the
      // previous student's reminders on this device.
      await _messaging.deleteToken();
    } catch (error) {
      debugPrint('Notification token deletion failed: $error');
    }
    await _tokenSubscription?.cancel();
    _tokenSubscription = null;
    _registeredToken = null;
  }

  String get _preferenceSuffix {
    final uid = _auth.currentUser?.uid ?? 'signed-out';
    return '-$uid';
  }

  Future<void> _savePreferences([SharedPreferences? preferences]) async {
    final store = preferences ?? await SharedPreferences.getInstance();
    await store.setString(
      '$_preferencesKey$_preferenceSuffix',
      jsonEncode(_preferences.toJson()),
    );
  }

  @override
  void dispose() {
    unawaited(_tokenSubscription?.cancel());
    unawaited(_messageSubscription?.cancel());
    super.dispose();
  }
}

@visibleForTesting
bool notificationPermissionOfferEligible({
  required int activityCount,
  required int streakDays,
  required bool offerShown,
  required bool anyCategoryEnabled,
}) {
  return !offerShown &&
      !anyCategoryEnabled &&
      activityCount >= 3 &&
      streakDays >= 2;
}
