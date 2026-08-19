import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/core/app_sfx.dart';
import 'package:dope_english/features/grammar/quiz_01/quiz_01_controller.dart';
import 'package:dope_english/features/grammar/quiz_01/quiz_01_question.dart';
import 'package:dope_english/features/grammar/quiz_01/quiz_01_screen.dart';

const question = Quiz01Question(
  id: 'q101',
  zh: '她吃蘋果。',
  answer: ['She', 'eats', 'apples.'],
  distractors: ['eat', 'is'],
);

void main() {
  Future<void> setCompactPhoneSize(WidgetTester tester) async {
    tester.view.devicePixelRatio = 1;
    tester.view.physicalSize = const Size(320, 568);
    addTearDown(tester.view.reset);
  }

  Widget appFor(Quiz01Controller controller) {
    return MaterialApp(
      home: Quiz01Screen(
        controller: controller,
        sfx: const SilentLessonSfx(),
      ),
    );
  }

  testWidgets('shows an unframed answer line and related word blocks',
      (tester) async {
    await setCompactPhoneSize(tester);
    final controller = Quiz01Controller.forQuestions([question]);

    await tester.pumpWidget(appFor(controller));

    expect(find.byKey(const Key('quiz-01-answer-line')), findsOneWidget);
    expect(find.byKey(const Key('quiz-01-word-bank')), findsOneWidget);
    expect(find.text('She'), findsOneWidget);
    expect(find.text('eat'), findsOneWidget);
    expect(find.text('is'), findsOneWidget);
    expect(find.text('重組英文句子，完成後按確認。'), findsNothing);
    expect(tester.takeException(), isNull);
  });

  testWidgets('word blocks move to the answer and confirm once',
      (tester) async {
    await setCompactPhoneSize(tester);
    final controller = Quiz01Controller.forQuestions([question]);
    await tester.pumpWidget(appFor(controller));

    for (final word in question.answer) {
      await tester.tap(find.text(word));
      await tester.pumpAndSettle();
    }

    expect(controller.selectedBlocks, hasLength(3));
    expect(find.byKey(const Key('quiz-01-confirm')), findsOneWidget);
    await tester.tap(find.byKey(const Key('quiz-01-confirm')));
    await tester.pumpAndSettle();

    expect(find.text('句子次序正確！'), findsOneWidget);
    expect(find.byKey(const Key('quiz-01-correct-answer')), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('wrong confirmation locks and shows the correct answer',
      (tester) async {
    await setCompactPhoneSize(tester);
    final controller = Quiz01Controller.forQuestions([question]);
    await tester.pumpWidget(appFor(controller));

    await tester.tap(find.text('eat'));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('quiz-01-confirm')));
    await tester.pumpAndSettle();

    expect(controller.isResolved, isTrue);
    expect(find.text('句子次序未正確。'), findsOneWidget);
    expect(find.text('正確答案：She eats apples.'), findsOneWidget);
    expect(find.byKey(const Key('quiz-01-next')), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
