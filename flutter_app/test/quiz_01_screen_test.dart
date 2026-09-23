import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/core/app_palette.dart';
import 'package:dope_english/core/app_sfx.dart';
import 'package:dope_english/core/widgets/stationery_frame.dart';
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
    expect(find.text('♪'), findsNothing);
    expect(find.text('FIRST TRY'), findsNothing);
    expect(find.text('STREAK'), findsNothing);
    expect(find.text('BEST'), findsNothing);
    final wordBank = tester.widget<OriginalDashedSurface>(
      find.byKey(const Key('quiz-01-word-bank')),
    );
    expect(wordBank.backgroundColor, AppPalette.softSecondary);
    expect(
      tester.getSize(find.byKey(const Key('quiz-01-confirm'))).width,
      greaterThan(250),
    );
    Color blockFill(String word) {
      final material = find
          .ancestor(of: find.text(word), matching: find.byType(Material))
          .first;
      return tester.widget<Material>(material).color!;
    }

    expect(blockFill('apples.'), Colors.white);
    expect(blockFill('eats'), Colors.white);
    final wordBankFinder = find.byKey(const Key('quiz-01-word-bank'));
    final bankYPositions = controller.availableBlocks.map((block) {
      final text =
          find.descendant(of: wordBankFinder, matching: find.text(block.text));
      return tester.getTopLeft(text.first).dy;
    }).toList();
    expect(
      bankYPositions.any(
        (y) =>
            bankYPositions.where((other) => (other - y).abs() < 1).length >= 2,
      ),
      isTrue,
      reason: 'word bank pills should wrap side by side, not one per row',
    );
    expect(tester.takeException(), isNull);
  });

  testWidgets('word blocks move to the answer and confirm once',
      (tester) async {
    await setCompactPhoneSize(tester);
    final controller = Quiz01Controller.forQuestions([question]);
    await tester.pumpWidget(appFor(controller));

    await tester.tap(find.text(question.answer.first));
    await tester.pump(const Duration(milliseconds: 120));
    expect(
      find.byKey(const ValueKey('quiz-01-flight-answer-0')),
      findsOneWidget,
    );
    expect(
      tester
          .getSize(find.byKey(const ValueKey('quiz-01-flight-answer-0')))
          .width,
      lessThan(160),
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 390));
    final flightPosition = tester.getTopLeft(
      find.byKey(const ValueKey('quiz-01-flight-answer-0')),
    );
    final targetPosition = tester.getTopLeft(
      find.byKey(const ValueKey('quiz-01-flight-target-answer-0')),
    );
    expect((flightPosition - targetPosition).distance, lessThan(14));
    await tester.pumpAndSettle();
    final finalPosition = tester.getTopLeft(
      find.byKey(const ValueKey('answer-answer-0')),
    );
    expect((finalPosition - targetPosition).distance, lessThan(1));
    final answerRect = tester.getRect(
      find.byKey(const Key('quiz-01-answer-line')),
    );
    final finalPillRect = tester.getRect(
      find.byKey(const ValueKey('answer-answer-0')),
    );
    expect(finalPillRect.bottom, lessThan(answerRect.bottom - 8));
    expect(
      find.descendant(
        of: find.byKey(const Key('quiz-01-answer-line')),
        matching: find.byType(CustomPaint),
      ),
      findsWidgets,
    );

    for (final word in question.answer.skip(1)) {
      await tester.tap(find.text(word));
      await tester.pumpAndSettle();
    }

    expect(controller.selectedBlocks, hasLength(3));
    expect(find.byKey(const Key('quiz-01-confirm')), findsOneWidget);
    await tester.tap(find.byKey(const Key('quiz-01-confirm')));
    await tester.pumpAndSettle();

    expect(find.text('句子次序正確！'), findsOneWidget);
    expect(find.byKey(const Key('quiz-01-correct-answer')), findsOneWidget);
    final feedbackPanel = tester.widget<OriginalDashedSurface>(
      find.byKey(const Key('quiz-01-feedback-panel')),
    );
    expect(feedbackPanel.backgroundColor, AppPalette.softSecondary);
    expect(feedbackPanel.borderColor, AppPalette.secondaryDark);
    expect(feedbackPanel.strokeWidth, 4);
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
