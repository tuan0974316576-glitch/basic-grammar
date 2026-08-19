import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/core/app_sfx.dart';
import 'package:dope_english/features/grammar/lesson_01/lesson_01_controller.dart';
import 'package:dope_english/features/grammar/lesson_01/lesson_01_question.dart';
import 'package:dope_english/features/grammar/lesson_01/lesson_01_screen.dart';

const _beQuestion = Lesson01Question(
  id: 'test-be',
  type: Lesson01QuestionType.be,
  zh: '蘋果是水果。',
  english: 'Apples are fruit.',
  beForm: 'are',
  subjectZh: '蘋果',
  subjectEn: 'Apples',
  subjectRole: '眾數名詞',
  pronoun: 'They',
);

void main() {
  Future<void> setCompactPhoneSize(WidgetTester tester) async {
    tester.view.devicePixelRatio = 1;
    tester.view.physicalSize = const Size(320, 568);
    addTearDown(tester.view.reset);
  }

  Widget appFor(Lesson01Controller controller) {
    return MaterialApp(
      home: Lesson01Screen(
        controller: controller,
        sfx: const SilentLessonSfx(),
      ),
    );
  }

  testWidgets('initial Tick/Cross screen fits a compact phone', (tester) async {
    await setCompactPhoneSize(tester);
    final controller = Lesson01Controller.forQuestions([_beQuestion]);

    await tester.pumpWidget(appFor(controller));

    expect(find.byKey(const Key('verb-choice-tick')), findsOneWidget);
    expect(find.byKey(const Key('verb-choice-cross')), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('wrong be-form explanation fits and locks the question',
      (tester) async {
    await setCompactPhoneSize(tester);
    final controller = Lesson01Controller.forQuestions([_beQuestion]);
    controller.answerVerbChoice(false);
    controller.answerNeedsBe(true);
    controller.answerBeForm('is');

    await tester.pumpWidget(appFor(controller));

    expect(find.text('你揀了 is。'), findsOneWidget);
    expect(find.textContaining('眾數名詞（They）'), findsOneWidget);
    expect(find.byKey(const Key('lesson-next')), findsOneWidget);
    expect(find.byKey(const Key('verb-choice-cross')), findsNothing);
    expect(tester.takeException(), isNull);
  });

  testWidgets('result stats use readable matching number sizes',
      (tester) async {
    await setCompactPhoneSize(tester);
    final controller = Lesson01Controller.forQuestions([_beQuestion]);
    controller.answerVerbChoice(false);
    controller.answerNeedsBe(true);
    controller.answerBeForm('are');
    controller.next();

    await tester.pumpWidget(appFor(controller));

    expect(find.text('Lesson 01 完成！'), findsOneWidget);
    expect(find.text('1/1'), findsOneWidget);
    expect(find.text('100%'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
