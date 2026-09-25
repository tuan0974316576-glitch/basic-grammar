import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/auth/student_auth_controller.dart';
import 'package:dope_english/features/auth/student_login_screen.dart';

void main() {
  testWidgets('restores the remembered login fields after logout',
      (tester) async {
    tester.view.devicePixelRatio = 1;
    tester.view.physicalSize = const Size(400, 800);
    addTearDown(tester.view.reset);
    await tester.pumpWidget(
      MaterialApp(
        home: StudentLoginScreen(controller: _RememberedAuthController()),
      ),
    );
    await tester.pump();

    expect(
      tester
          .widget<TextField>(find.byKey(const Key('student-id-field')))
          .controller!
          .text,
      'S001',
    );
    expect(
      tester
          .widget<TextField>(find.byKey(const Key('student-pin-field')))
          .controller!
          .text,
      '1234',
    );
  });
}

class _RememberedAuthController extends StudentAuthController {
  @override
  StudentAuthStatus get status => StudentAuthStatus.signedOut;

  @override
  String get message => '已登出。';

  @override
  Future<({String studentId, String pin})?> readRememberedLogin() async =>
      (studentId: 'S001', pin: '1234');
}
