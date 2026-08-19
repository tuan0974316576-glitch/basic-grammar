import 'dart:convert';

import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../firebase_options.dart';

enum StudentAuthStatus { initializing, signedOut, authenticated, unavailable }

class StudentProfile {
  const StudentProfile({
    required this.studentId,
    required this.displayName,
    this.classId = '',
    this.role = 'student',
  });

  factory StudentProfile.fromJson(Map<String, dynamic> json) {
    return StudentProfile(
      studentId: '${json['studentId'] ?? ''}'.trim().toUpperCase(),
      displayName: '${json['displayName'] ?? json['studentId'] ?? ''}'.trim(),
      classId: '${json['classId'] ?? ''}'.trim(),
      role: json['role'] == 'teacher' ? 'teacher' : 'student',
    );
  }

  final String studentId;
  final String displayName;
  final String classId;
  final String role;

  Map<String, dynamic> toJson() => {
        'studentId': studentId,
        'displayName': displayName,
        'classId': classId,
        'role': role,
      };
}

class StudentAuthController extends ChangeNotifier {
  StudentAuthController({
    FlutterSecureStorage? secureStorage,
    FirebaseAuth? auth,
    FirebaseFunctions? functions,
  })  : _secureStorage = secureStorage ?? const FlutterSecureStorage(),
        _auth = auth,
        _functions = functions;

  static const _deviceSessionKey = 'dope_student_device_session_v1';
  static const _profileKey = 'dope_student_profile_v1';

  final FlutterSecureStorage _secureStorage;
  FirebaseAuth? _auth;
  FirebaseFunctions? _functions;
  StudentAuthStatus _status = StudentAuthStatus.initializing;
  StudentProfile? _profile;
  String _message = '正在檢查登入狀態...';
  bool _isSubmitting = false;

  StudentAuthStatus get status => _status;
  StudentProfile? get profile => _profile;
  String get message => _message;
  bool get isSubmitting => _isSubmitting;
  bool get isAuthenticated => _status == StudentAuthStatus.authenticated;

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

      _profile = await _readProfile();
      if (_auth!.currentUser != null) {
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
}
