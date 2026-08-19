import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/core/app_sfx.dart';
import 'package:dope_english/features/grammar/correction/correction_lesson_question.dart';
import 'package:dope_english/features/grammar/correction/correction_lesson_screen.dart';
import 'package:dope_english/features/grammar/lesson_03/lesson_03_screen.dart';
import 'package:dope_english/features/grammar/lesson_04/lesson_04_screen.dart';
import 'package:dope_english/features/grammar/lesson_05/lesson_05_screen.dart';
import 'package:dope_english/features/grammar/lesson_11/lesson_11_screen.dart';

void main() {
  testWidgets('Lesson 03 to 13 entry screens fit a compact phone',
      (tester) async {
    tester.view.devicePixelRatio = 1;
    tester.view.physicalSize = const Size(320, 568);
    addTearDown(tester.view.reset);

    final screens = <Widget>[
      const Lesson03Screen(sfx: SilentLessonSfx()),
      const Lesson04Screen(sfx: SilentLessonSfx()),
      const Lesson05Screen(sfx: SilentLessonSfx()),
      const CorrectionLessonScreen(
        config: lesson06Config,
        sfx: SilentLessonSfx(),
      ),
      const CorrectionLessonScreen(
        config: lesson07Config,
        sfx: SilentLessonSfx(),
      ),
      const CorrectionLessonScreen(
        config: lesson08Config,
        sfx: SilentLessonSfx(),
      ),
      const CorrectionLessonScreen(
        config: lesson09Config,
        sfx: SilentLessonSfx(),
      ),
      const CorrectionLessonScreen(
        config: lesson10Config,
        sfx: SilentLessonSfx(),
      ),
      const Lesson11Screen(sfx: SilentLessonSfx()),
      const CorrectionLessonScreen(
        config: lesson13Config,
        sfx: SilentLessonSfx(),
      ),
    ];

    for (final screen in screens) {
      await tester.pumpWidget(MaterialApp(home: screen));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 600));
      expect(find.byType(Scaffold), findsOneWidget);
      expect(tester.takeException(), isNull,
          reason: screen.runtimeType.toString());
    }
  });
}
