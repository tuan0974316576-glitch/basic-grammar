import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/core/app_sfx.dart';
import 'package:dope_english/core/app_palette.dart';
import 'package:dope_english/core/widgets/stationery_frame.dart';
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
    final tickSurface = find.descendant(
      of: find.byKey(const Key('verb-choice-tick')),
      matching: find.byType(OriginalDashedSurface),
    );
    expect(
      tester.widget<OriginalDashedSurface>(tickSurface).backgroundColor,
      Colors.white,
    );
    expect(
      tester.widget<OriginalDashedSurface>(tickSurface).strokeWidth,
      5,
    );
    expect(
      tester.widget<OriginalDashedSurface>(tickSurface).borderColor,
      AppPalette.tick,
    );
    final crossSurface = find.descendant(
      of: find.byKey(const Key('verb-choice-cross')),
      matching: find.byType(OriginalDashedSurface),
    );
    expect(
      tester.widget<OriginalDashedSurface>(crossSurface).borderColor,
      AppPalette.cross,
    );
    expect(tester.takeException(), isNull);
  });

  testWidgets('action verb question continues to the is/am/are check',
      (tester) async {
    await setCompactPhoneSize(tester);
    final controller = Lesson01Controller.forQuestions([
      const Lesson01Question(
        id: 'test-action',
        type: Lesson01QuestionType.action,
        zh: '妹妹畫畫。',
        english: 'My younger sister draws pictures.',
        note: '「畫畫」是動作動詞。',
        verbZh: '畫畫',
      ),
    ]);
    await tester.pumpWidget(appFor(controller));
    controller.answerVerbChoice(true);
    controller.toggleVerbToken(1);
    controller.submitVerbTokens();
    await tester.pump();

    expect(controller.stage, Lesson01Stage.needsBe);
    expect(find.text('英文句子要不要加 is / am / are？'), findsOneWidget);
    expect(find.text('要用 is / am / are'), findsOneWidget);
    expect(find.text('不用'), findsOneWidget);
    expect(find.byKey(const Key('token-confirm')), findsNothing);
  });

  testWidgets('correct answer reports progress before leaving the lesson',
      (tester) async {
    await setCompactPhoneSize(tester);
    var recorded = 0;
    final controller = Lesson01Controller.forQuestions([_beQuestion]);
    await tester.pumpWidget(
      MaterialApp(
        home: Lesson01Screen(
          controller: controller,
          sfx: const SilentLessonSfx(),
          onQuestionCorrect: () => recorded += 1,
        ),
      ),
    );

    await tester.tap(find.byKey(const Key('verb-choice-cross')));
    await tester.pump();
    await tester.tap(find.text('要用 is / am / are'));
    await tester.pump();
    await tester.tap(find.text('are'));
    await tester.pump();

    expect(recorded, 1);
  });

  testWidgets('resolved Lesson 01 uses two cute stationery panels',
      (tester) async {
    await setCompactPhoneSize(tester);
    final controller = Lesson01Controller.forQuestions([_beQuestion]);
    controller.answerVerbChoice(false);
    controller.answerNeedsBe(true);
    controller.answerBeForm('are');
    await tester.pumpWidget(appFor(controller));

    expect(find.byKey(const Key('lesson-01-feedback-panel')), findsOneWidget);
    expect(find.byKey(const Key('lesson-01-answer-panel')), findsOneWidget);
    final feedbackPanel = tester.widget<OriginalDashedSurface>(
      find.byKey(const Key('lesson-01-feedback-panel')),
    );
    expect(feedbackPanel.backgroundColor, AppPalette.softSecondary);
    expect(feedbackPanel.borderColor, AppPalette.secondaryDark);
    expect(feedbackPanel.strokeWidth, 4);
    expect(find.byType(Container), findsWidgets);
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
