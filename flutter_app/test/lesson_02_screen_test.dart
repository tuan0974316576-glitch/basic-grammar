import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/core/app_sfx.dart';
import 'package:dope_english/features/grammar/lesson_02/lesson_02_controller.dart';
import 'package:dope_english/features/grammar/lesson_02/lesson_02_question.dart';
import 'package:dope_english/features/grammar/lesson_02/lesson_02_screen.dart';

const _zeroVerbQuestion = Lesson02Question(
  id: 'zero',
  sentence: 'I happy.',
  zh: '我很開心。',
  isCorrect: false,
  verbCount: 0,
  verbIndexes: [],
  explanation: 'happy 是形容詞，所以句子沒有動詞。',
  correction: '正確寫法：I am happy.',
  correctSentence: 'I am happy.',
  acceptedAnswers: ['I am happy.'],
);

const _twoVerbQuestion = Lesson02Question(
  id: 'two',
  sentence: 'You are go home.',
  zh: '你回家。',
  isCorrect: false,
  verbCount: 2,
  verbIndexes: [1, 2],
  explanation: 'are 是 be 動詞，go 是現在式動詞，所以句子有 2 個動詞。',
  correction: 'are 是多餘的，應寫 You go home.',
  correctSentence: 'You go home.',
  acceptedAnswers: ['You go home.'],
);

void main() {
  Future<void> setCompactPhoneSize(WidgetTester tester) async {
    tester.view.devicePixelRatio = 1;
    tester.view.physicalSize = const Size(320, 568);
    addTearDown(tester.view.reset);
  }

  Widget appFor(Lesson02Controller controller) {
    return MaterialApp(
      home: Lesson02Screen(
        controller: controller,
        sfx: const SilentLessonSfx(),
      ),
    );
  }

  testWidgets('judgment controls fit a compact phone', (tester) async {
    await setCompactPhoneSize(tester);
    final controller = Lesson02Controller.forQuestions([_zeroVerbQuestion]);

    await tester.pumpWidget(appFor(controller));

    expect(find.byKey(const Key('sentence-correct')), findsOneWidget);
    expect(find.byKey(const Key('sentence-wrong')), findsOneWidget);
    expect(find.text('我很開心。'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('game keyboard is docked and has one confirm key',
      (tester) async {
    await setCompactPhoneSize(tester);
    final controller = Lesson02Controller.forQuestions([_zeroVerbQuestion]);
    controller.answerJudgment(false);
    controller.answerVerbCount(0);

    await tester.pumpWidget(appFor(controller));

    expect(find.byKey(const Key('lesson-02-answer-field')), findsOneWidget);
    expect(find.byKey(const Key('game-keyboard-submit')), findsOneWidget);
    expect(find.byIcon(Icons.backspace_rounded), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('two-line explanation fits and correct answer is visible',
      (tester) async {
    await setCompactPhoneSize(tester);
    final controller = Lesson02Controller.forQuestions([_twoVerbQuestion]);
    controller.answerJudgment(true);

    await tester.pumpWidget(appFor(controller));

    expect(find.textContaining('are 是 be 動詞'), findsOneWidget);
    expect(find.textContaining('are 是多餘的'), findsOneWidget);
    expect(find.byKey(const Key('lesson-02-next')), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
