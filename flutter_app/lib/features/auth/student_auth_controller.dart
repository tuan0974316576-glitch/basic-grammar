import 'dart:async';
import 'dart:convert';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../firebase_options.dart';

enum StudentAuthStatus { initializing, signedOut, authenticated, unavailable }

const studentAvatarStyle = 'dicebear-critters-v10';
const studentAvatarBackgrounds = <String>[
  'ffd5dc',
  'ffe8a3',
  'bcebd7',
  'bfe3ff',
  'd9ccff',
  'ffd4ad',
];

String normalizeStudentDisplayName(String value) =>
    value.trim().replaceAll(RegExp(r'\s+'), ' ');

bool isValidStudentDisplayName(String value) {
  final name = normalizeStudentDisplayName(value);
  final length = name.runes.length;
  return length >= 2 &&
      length <= 20 &&
      RegExp(r"^[A-Za-z0-9\u00C0-\u024F\u3400-\u9FFF][A-Za-z0-9\u00C0-\u024F\u3400-\u9FFF .'-]*$")
          .hasMatch(name);
}

class StudentProfile {
  const StudentProfile({
    required this.studentId,
    required this.displayName,
    this.classId = '',
    this.role = 'student',
    this.avatarStyle = '',
    this.avatarSeed = '',
    this.avatarBackground = '',
    this.avatarOptions = const <String, String>{},
    this.profileSetupComplete = false,
  });

  factory StudentProfile.fromJson(Map<String, dynamic> json) {
    return StudentProfile(
      studentId: '${json['studentId'] ?? ''}'.trim().toUpperCase(),
      displayName: '${json['displayName'] ?? json['studentId'] ?? ''}'.trim(),
      classId: '${json['classId'] ?? ''}'.trim(),
      role: json['role'] == 'teacher' ? 'teacher' : 'student',
      avatarStyle: '${json['avatarStyle'] ?? ''}'.trim(),
      avatarSeed: '${json['avatarSeed'] ?? ''}'.trim(),
      avatarBackground:
          '${json['avatarBackground'] ?? ''}'.trim().toLowerCase(),
      avatarOptions: _readAvatarOptions(json['avatarOptions']),
      profileSetupComplete:
          json['role'] == 'teacher' || json['profileSetupComplete'] == true,
    );
  }

  final String studentId;
  final String displayName;
  final String classId;
  final String role;
  final String avatarStyle;
  final String avatarSeed;
  final String avatarBackground;
  final Map<String, String> avatarOptions;
  final bool profileSetupComplete;

  Map<String, dynamic> toJson() => {
        'studentId': studentId,
        'displayName': displayName,
        'classId': classId,
        'role': role,
        'avatarStyle': avatarStyle,
        'avatarSeed': avatarSeed,
        'avatarBackground': avatarBackground,
        'avatarOptions': avatarOptions,
        'profileSetupComplete': profileSetupComplete,
      };

  static Map<String, String> _readAvatarOptions(Object? raw) {
    if (raw is! Map) return const <String, String>{};
    return {
      for (final entry in raw.entries)
        if (entry.key is String && entry.value is String)
          entry.key as String: entry.value as String,
    };
  }
}

class StudentAuthController extends ChangeNotifier {
  StudentAuthController({
    FlutterSecureStorage? secureStorage,
    FirebaseAuth? auth,
    FirebaseFunctions? functions,
    FirebaseFirestore? firestore,
  })  : _secureStorage = secureStorage ?? const FlutterSecureStorage(),
        _auth = auth,
        _functions = functions,
        _firestore = firestore;

  static const _deviceSessionKey = 'dope_student_device_session_v1';
  static const _profileKey = 'dope_student_profile_v1';
  static const _rememberedStudentIdKey = 'dope_student_last_id_v1';
  static const _rememberedPinKey = 'dope_student_last_pin_v1';

  final FlutterSecureStorage _secureStorage;
  FirebaseAuth? _auth;
  FirebaseFunctions? _functions;
  FirebaseFirestore? _firestore;
  StudentAuthStatus _status = StudentAuthStatus.initializing;
  StudentProfile? _profile;
  String _message = '正在檢查登入狀態...';
  bool _isSubmitting = false;

  StudentAuthStatus get status => _status;
  StudentProfile? get profile => _profile;
  String get message => _message;
  bool get isSubmitting => _isSubmitting;
  bool get isAuthenticated => _status == StudentAuthStatus.authenticated;
  bool get needsProfileSetup =>
      isAuthenticated &&
      (_profile == null ||
          (_profile!.role != 'teacher' && !_profile!.profileSetupComplete));

  Future<({String studentId, String pin})?> readRememberedLogin() async {
    try {
      final studentId = (await _secureStorage.read(
                key: _rememberedStudentIdKey,
              ) ??
              '')
          .trim();
      final pin = await _secureStorage.read(key: _rememberedPinKey) ?? '';
      if (studentId.isEmpty || pin.isEmpty) return null;
      return (studentId: studentId, pin: pin);
    } catch (_) {
      return null;
    }
  }

  Future<void> initialize() async {
    _status = StudentAuthStatus.initializing;
    _message = '正在檢查登入狀態...';
    notifyListeners();
    try {
      if (Firebase.apps.isEmpty) {
        await Firebase.initializeApp(
          options: DefaultFirebaseOptions.currentPlatform,
        );
      }
      _auth ??= FirebaseAuth.instance;
      _functions ??= FirebaseFunctions.instanceFor(region: 'asia-east2');
      _firestore ??= FirebaseFirestore.instance;

      _profile = await _readProfile();
      if (_auth!.currentUser != null) {
        await _refreshProfileFromCloud();
        _status = StudentAuthStatus.authenticated;
        _message = '已自動登入。';
        notifyListeners();
        return;
      }

      final restored = await _restoreDeviceSession();
      if (restored) return;
      _status = StudentAuthStatus.signedOut;
      _message = '輸入學號同 PIN，就可以同步學習紀錄。';
    } catch (error) {
      debugPrint('Student auth initialization failed: $error');
      _status = StudentAuthStatus.unavailable;
      _message = '暫時連不到登入系統，請檢查網絡後再試。';
    }
    notifyListeners();
  }

  Future<bool> login({required String studentId, required String pin}) async {
    final normalizedId = studentId.trim().toUpperCase();
    if (!RegExp(r'^[A-Z0-9_-]{2,16}$').hasMatch(normalizedId) ||
        !RegExp(r'^\d{4,8}$').hasMatch(pin)) {
      _message = '請輸入正確學號及 4 至 8 位數字 PIN。';
      notifyListeners();
      return false;
    }

    _isSubmitting = true;
    _message = '登入中...';
    notifyListeners();
    try {
      final callable = _functions!.httpsCallable(
        'studentLogin',
        options: HttpsCallableOptions(timeout: const Duration(seconds: 25)),
      );
      final result = await callable.call<Map<String, dynamic>>({
        'studentId': normalizedId,
        'pin': pin,
      });
      final data = Map<String, dynamic>.from(result.data);
      final email = '${data['email'] ?? ''}'.trim();
      final password = '${data['authPassword'] ?? ''}';
      if (email.isEmpty || password.isEmpty) {
        throw StateError('Student login did not return Firebase credentials.');
      }
      await _auth!.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      _profile = StudentProfile.fromJson(data);
      await _saveProfile(_profile!);
      await _rememberLogin(normalizedId, pin);
      final rawSession = data['deviceSession'];
      if (rawSession is Map) {
        await _saveDeviceSession({
          ...Map<String, dynamic>.from(rawSession),
          'studentId': _profile!.studentId,
        });
      }
      _status = StudentAuthStatus.authenticated;
      _message = '登入成功，之後會自動登入。';
      return true;
    } on FirebaseFunctionsException catch (error) {
      debugPrint('Student login callable failed: ${error.code}');
      _message =
          error.code == 'unavailable' || error.code == 'deadline-exceeded'
              ? '暫時連不到登入系統，請檢查網絡後再試。'
              : '學號或 PIN 不正確，請再試一次。';
      return false;
    } on FirebaseAuthException catch (error) {
      debugPrint('Firebase student sign-in failed: ${error.code}');
      _message = '登入資料未能驗證，請再試一次。';
      return false;
    } catch (error) {
      debugPrint('Student login failed: $error');
      _message = '暫時未能登入，請稍後再試。';
      return false;
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    try {
      await _auth?.signOut();
    } finally {
      await _secureStorage.delete(key: _deviceSessionKey);
      await _secureStorage.delete(key: _profileKey);
      _profile = null;
      _status = StudentAuthStatus.signedOut;
      _message = '已登出。';
      notifyListeners();
    }
  }

  Future<bool> completeProfile({
    required String displayName,
    required String avatarSeed,
    required String avatarBackground,
    Map<String, String> avatarOptions = const <String, String>{},
  }) async {
    final name = normalizeStudentDisplayName(displayName);
    final background =
        avatarBackground.trim().toLowerCase().replaceFirst('#', '');
    if (!isAuthenticated ||
        !isValidStudentDisplayName(name) ||
        !RegExp(r'^[A-Za-z0-9_-]{4,64}$').hasMatch(avatarSeed) ||
        !studentAvatarBackgrounds.contains(background) ||
        avatarOptions.length > 12 ||
        avatarOptions.keys.any((key) =>
            !RegExp(r'^[A-Za-z]+Color$|^(top|body|pattern|cheeks|eyes|mouth)$')
                .hasMatch(key)) ||
        avatarOptions.values.any(
            (value) => !RegExp(r'^[A-Za-z0-9_-]{1,32}$').hasMatch(value))) {
      _message = '請輸入 2 至 20 個字嘅名稱，再揀一個頭像。';
      notifyListeners();
      return false;
    }

    _isSubmitting = true;
    _message = '正在建立你嘅個人檔案...';
    notifyListeners();
    try {
      final callable = _functions!.httpsCallable(
        'completeStudentProfile',
        options: HttpsCallableOptions(timeout: const Duration(seconds: 20)),
      );
      final result = await callable.call<Map<String, dynamic>>({
        'displayName': name,
        'avatarStyle': studentAvatarStyle,
        'avatarSeed': avatarSeed,
        'avatarBackground': background,
        'avatarOptions': avatarOptions,
      });
      final data = Map<String, dynamic>.from(result.data);
      _profile = StudentProfile.fromJson({
        ...?_profile?.toJson(),
        ...data,
      });
      await _saveProfile(_profile!);
      _message = '個人檔案已完成。';
      return true;
    } on FirebaseFunctionsException catch (error) {
      debugPrint('Student profile setup failed: ${error.code}');
      _message = error.code == 'invalid-argument'
          ? '名稱或頭像格式唔正確，請再揀一次。'
          : '暫時未能儲存個人檔案，請檢查網絡後再試。';
      return false;
    } catch (error) {
      debugPrint('Student profile setup failed: $error');
      _message = '暫時未能儲存個人檔案，請稍後再試。';
      return false;
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }

  Future<bool> _restoreDeviceSession() async {
    final source = await _secureStorage.read(key: _deviceSessionKey);
    if (source == null || source.isEmpty) return false;
    try {
      final session = Map<String, dynamic>.from(jsonDecode(source) as Map);
      final expiresAt = (session['expiresAt'] as num?)?.toInt() ?? 0;
      if (expiresAt > 0 && expiresAt < DateTime.now().millisecondsSinceEpoch) {
        await _secureStorage.delete(key: _deviceSessionKey);
        return false;
      }
      final callable = _functions!.httpsCallable(
        'studentDeviceLogin',
        options: HttpsCallableOptions(timeout: const Duration(seconds: 20)),
      );
      final result = await callable.call<Map<String, dynamic>>({
        'studentId': session['studentId'],
        'sessionId': session['sessionId'],
        'token': session['token'],
      });
      final data = Map<String, dynamic>.from(result.data);
      final customToken = '${data['customToken'] ?? ''}';
      if (customToken.isEmpty) return false;
      await _auth!.signInWithCustomToken(customToken);
      _profile = StudentProfile.fromJson(data);
      await _saveProfile(_profile!);
      _status = StudentAuthStatus.authenticated;
      _message = '已自動登入。';
      notifyListeners();
      return true;
    } catch (error) {
      debugPrint('Saved student login restore failed: $error');
      await _secureStorage.delete(key: _deviceSessionKey);
      return false;
    }
  }

  Future<StudentProfile?> _readProfile() async {
    try {
      final source = await _secureStorage.read(key: _profileKey);
      if (source == null || source.isEmpty) return null;
      return StudentProfile.fromJson(
        Map<String, dynamic>.from(jsonDecode(source) as Map),
      );
    } catch (_) {
      return null;
    }
  }

  Future<void> _refreshProfileFromCloud() async {
    final uid = _auth?.currentUser?.uid;
    if (uid == null || uid.isEmpty || _firestore == null) return;
    try {
      final snapshot = await _firestore!
          .collection('users')
          .doc(uid)
          .get()
          .timeout(const Duration(seconds: 4));
      if (!snapshot.exists) return;
      _profile = StudentProfile.fromJson({
        ...?_profile?.toJson(),
        ...?snapshot.data(),
      });
      await _saveProfile(_profile!);
    } catch (error) {
      debugPrint('Student profile refresh skipped: $error');
    }
  }

  Future<void> _saveProfile(StudentProfile profile) {
    return _secureStorage.write(
      key: _profileKey,
      value: jsonEncode(profile.toJson()),
    );
  }

  Future<void> _saveDeviceSession(Map<String, dynamic> session) {
    return _secureStorage.write(
      key: _deviceSessionKey,
      value: jsonEncode(session),
    );
  }

  Future<void> _rememberLogin(String studentId, String pin) async {
    try {
      await _secureStorage.write(
        key: _rememberedStudentIdKey,
        value: studentId,
      );
      await _secureStorage.write(key: _rememberedPinKey, value: pin);
    } catch (_) {
      // Login remains successful if the platform secure storage is unavailable.
    }
  }
}
