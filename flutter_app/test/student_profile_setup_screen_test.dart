import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/auth/student_auth_controller.dart';
import 'package:dope_english/features/profile/critter_avatar.dart';
import 'package:dope_english/features/profile/student_profile_setup_screen.dart';
import 'package:dope_english/main.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('Critters stay deterministic and vary by seed', () {
    final first = buildCritterAvatarSvg(
      seed: 'critter-student-a',
      background: 'ffd5dc',
    );
    final repeated = buildCritterAvatarSvg(
      seed: 'critter-student-a',
      background: 'ffd5dc',
    );
    final different = buildCritterAvatarSvg(
      seed: 'critter-student-b',
      background: 'ffd5dc',
    );

    expect(first, startsWith('<svg'));
    expect(first, repeated);
    expect(different, isNot(first));
    expect(first, contains('dbcr-fastest'));
  });

  test('student display names accept English and Traditional Chinese', () {
    expect(isValidStudentDisplayName('Cherry'), isTrue);
    expect(isValidStudentDisplayName('小明'), isTrue);
    expect(isValidStudentDisplayName('A'), isFalse);
    expect(isValidStudentDisplayName('<script>'), isFalse);
  });

  test('student profiles require setup once while teachers skip it', () {
    final student = StudentProfile.fromJson({
      'studentId': 'S001',
      'displayName': 'Student 1',
      'role': 'student',
    });
    final teacher = StudentProfile.fromJson({
      'studentId': 'T001',
      'displayName': 'Teacher 1',
      'role': 'teacher',
    });
    final complete = StudentProfile.fromJson({
      'studentId': 'S002',
      'displayName': 'Cherry',
      'role': 'student',
      'avatarStyle': studentAvatarStyle,
      'avatarSeed': 'critter-s002-ready',
      'avatarBackground': 'bfe3ff',
      'avatarOptions': {
        'body': 'round',
        'eyes': 'wide',
      },
      'profileSetupComplete': true,
    });

    expect(student.profileSetupComplete, isFalse);
    expect(teacher.profileSetupComplete, isTrue);
    expect(complete.profileSetupComplete, isTrue);
    expect(complete.avatarSeed, 'critter-s002-ready');
    expect(complete.avatarOptions['eyes'], 'wide');
  });

  testWidgets('authenticated student is gated by profile setup',
      (tester) async {
    final auth = _SetupRequiredAuthController();
    await tester.pumpWidget(DopeEnglishApp(authController: auth));
    await tester.pumpAndSettle();

    expect(find.byKey(const Key('profile-welcome-monster')), findsOneWidget);
    expect(find.byKey(const Key('original-section-frame-vocabulary')),
        findsNothing);
  });

  testWidgets('creates a name and Critter identity on a compact phone',
      (tester) async {
    tester.view.devicePixelRatio = 1;
    tester.view.physicalSize = const Size(320, 568);
    addTearDown(tester.view.reset);
    Map<String, String>? submitted;
    Map<String, String>? submittedOptions;

    await tester.pumpWidget(MaterialApp(
      home: StudentProfileSetupScreen(
        studentId: 'S001',
        onComplete: ({
          required displayName,
          required avatarSeed,
          required avatarBackground,
          avatarOptions = const <String, String>{},
        }) async {
          submitted = {
            'displayName': displayName,
            'avatarSeed': avatarSeed,
            'avatarBackground': avatarBackground,
          };
          submittedOptions = avatarOptions;
          return true;
        },
      ),
    ));
    await tester.pumpAndSettle();

    expect(find.byKey(const Key('profile-welcome-monster')), findsOneWidget);
    expect(find.text('Hello, A1 Buddy!'), findsOneWidget);
    expect(find.text('確認'), findsOneWidget);
    expect(find.byIcon(Icons.badge_outlined), findsNothing);
    expect(tester.takeException(), isNull);

    await tester.enterText(
      find.byKey(const Key('profile-name-field')),
      'Cherry',
    );
    await tester.tap(find.byKey(const Key('profile-name-next')));
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('profile-avatar-preview')), findsOneWidget);
    for (var index = 0; index < 4; index++) {
      await tester.tap(
        find.byKey(const Key('profile-avatar-category-next')),
      );
      await tester.pump();
    }
    await tester
        .ensureVisible(find.byKey(const Key('profile-avatar-eyes-dots')));
    await tester.tap(find.byKey(const Key('profile-avatar-eyes-dots')));
    for (var index = 0; index < 2; index++) {
      await tester.tap(
        find.byKey(const Key('profile-avatar-category-next')),
      );
      await tester.pump();
    }
    await tester.ensureVisible(
      find.byKey(const Key('profile-avatar-color-option-f08a5d')),
    );
    await tester
        .tap(find.byKey(const Key('profile-avatar-color-option-f08a5d')));
    await tester
        .ensureVisible(find.byKey(const Key('profile-avatar-color-bfe3ff')));
    await tester.tap(find.byKey(const Key('profile-avatar-color-bfe3ff')));
    await tester.ensureVisible(find.byKey(const Key('profile-setup-submit')));
    await tester.tap(find.byKey(const Key('profile-setup-submit')));
    await tester.pumpAndSettle();

    expect(submitted?['displayName'], 'Cherry');
    expect(submitted?['avatarSeed'], contains('critter-s001-'));
    expect(submitted?['avatarBackground'], 'bfe3ff');
    expect(submittedOptions?['eyes'], 'dots');
    expect(submittedOptions?['bodyColor'], 'f08a5d');
    expect(tester.takeException(), isNull);
  });

  testWidgets('blocks an invalid one-character name', (tester) async {
    var calls = 0;
    await tester.pumpWidget(MaterialApp(
      home: StudentProfileSetupScreen(
        studentId: 'S002',
        onComplete: ({
          required displayName,
          required avatarSeed,
          required avatarBackground,
          avatarOptions = const <String, String>{},
        }) async {
          calls += 1;
          return true;
        },
      ),
    ));
    await tester.enterText(find.byKey(const Key('profile-name-field')), 'A');
    await tester.tap(find.byKey(const Key('profile-name-next')));
    await tester.pump();

    expect(calls, 0);
    expect(find.text('請先輸入 2 至 20 個字嘅名稱。'), findsOneWidget);
  });

  testWidgets('settings avatar editor can rename the saved profile',
      (tester) async {
    String? savedName;
    await tester.pumpWidget(
      MaterialApp(
        home: StudentProfileSetupScreen(
          studentId: 'S003',
          initialName: 'Cherry',
          initialAvatarSeed: 'critter-s003-ready',
          initialAvatarBackground: 'ffd5dc',
          initialStep: 1,
          onComplete: ({
            required displayName,
            required avatarSeed,
            required avatarBackground,
            avatarOptions = const <String, String>{},
          }) async {
            savedName = displayName;
            return true;
          },
        ),
      ),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('profile-edit-name')));
    await tester.pumpAndSettle();
    await tester.enterText(
      find.byKey(const Key('profile-edit-name-field')),
      'Momo',
    );
    await tester.tap(find.text('確認').last);
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('profile-setup-submit')));
    await tester.pumpAndSettle();

    expect(savedName, 'Momo');
    expect(tester.takeException(), isNull);
  });
}

class _SetupRequiredAuthController extends StudentAuthController {
  final _student = const StudentProfile(
    studentId: 'S001',
    displayName: 'S001',
  );

  @override
  StudentAuthStatus get status => StudentAuthStatus.authenticated;

  @override
  StudentProfile get profile => _student;

  @override
  bool get isAuthenticated => true;

  @override
  bool get needsProfileSetup => true;

  @override
  String get message => '';
}
