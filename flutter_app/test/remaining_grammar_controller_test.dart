import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/grammar/correction/correction_lesson_controller.dart';
import 'package:dope_english/features/grammar/correction/correction_lesson_question.dart';
import 'package:dope_english/features/grammar/lesson_03/lesson_03_controller.dart';
import 'package:dope_english/features/grammar/lesson_03/lesson_03_question.dart';
import 'package:dope_english/features/grammar/lesson_04/lesson_04_controller.dart';
import 'package:dope_english/features/grammar/lesson_04/lesson_04_question.dart';
import 'package:dope_english/features/grammar/lesson_05/lesson_05_controller.dart';
import 'package:dope_english/features/grammar/lesson_05/lesson_05_question.dart';
import 'package:dope_english/features/grammar/lesson_11/lesson_11_controller.dart';
import 'package:dope_english/features/grammar/lesson_11/lesson_11_question.dart';
import 'package:dope_english/features/grammar/lesson_12/lesson_12_controller.dart';
import 'package:dope_english/features/grammar/lesson_12/lesson_12_question.dart';

const sentenceQuestion = Lesson03Question(
  id: 's1',
  text: 'I play and you read.',
  segments: [
    ['I', 'play', 'and'],
    ['you', 'read.'],
  ],
);

const pronounRows = [
  Lesson04Question(
    id: 'p1',
    zh: '我',
    forms: {
      'subject': 'I',
      'object': 'me',
      'possessiveAdjective': 'my',
      'possessivePronoun': 'mine',
    },
  ),
  Lesson04Question(
    id: 'p2',
    zh: '你',
    forms: {
      'subject': 'You',
      'object': 'you',
      'possessiveAdjective': 'your',
      'possessivePronoun': 'yours',
    },
  ),
];

const pronounMc = Lesson05Question(
  id: 'mc1',
  sentence: '___ is a doctor.',
  zh: '他是一位醫生。',
  answer: 'He',
  choices: ['He', 'him', 'We', 'His'],
  slotType: 'subject',
  explanation: '空格是主語，所以用 He。',
);

const correctionQuestion = CorrectionLessonQuestion(
  id: 'c1',
  category: 'countable',
  categoryLabel: '可數名詞',
  sentence: 'I want apple.',
  zh: '我想要一個蘋果。',
  isCorrect: false,
  answer: 'I want an apple.',
  acceptedAnswers: ['I want an apple.'],
  explanation: 'apple 是單數可數名詞，前面要加 an。',
  caseSensitive: false,
);

const haveQuestion = CorrectionLessonQuestion(
  id: 'h1',
  category: 'there-be',
  categoryLabel: 'There be',
  sentence: 'There is a book.',
  zh: '有一本書。',
  isCorrect: true,
  answer: 'There is a book.',
  acceptedAnswers: ['There is a book.'],
  explanation: '句首「有」使用 There be。',
  caseSensitive: false,
);

const tenseQuestion = Lesson11Question(
  id: 't1',
  tense: 'present',
  tenseLabel: '現在式',
  zh: 'Tom 每天跑步。',
  sentence: 'Tom ___ every day.',
  answer: 'runs',
  english: 'Tom runs every day.',
  acceptedAnswers: ['runs'],
  explanation: 'every day 使用現在式。',
);

const verbTableQuestion = Lesson12Question(
  id: 'v1',
  zh: '開始',
  forms: {
    'present': 'begin',
    'past': 'began',
    'pp': 'begun',
    'ing': 'beginning',
  },
  imageAsset: '',
  audioAsset: '',
);

void main() {
  test('Lesson 03 accepts an unhighlighted optional connector', () {
    final controller = Lesson03Controller.forQuestions([sentenceQuestion]);
    controller.startDrag(0);
    controller.finishDrag(1);
    controller.startDrag(3);
    controller.finishDrag(4);

    expect(controller.submit(), Lesson03Event.questionCorrect);
    expect(controller.score, 1);
  });

  test('Lesson 04 marks only wrong slots and allows them to be replaced', () {
    final controller = Lesson04Controller(pronounRows);
    final wrongOrder = [
      'object',
      'subject',
      'possessiveAdjective',
      'possessivePronoun'
    ];
    for (var index = 0; index < Lesson04Controller.roles.length; index++) {
      final slot = Lesson04Controller.roles[index].$1;
      final tile = controller.tiles.firstWhere(
        (item) => item.answerRole == wrongOrder[index],
      );
      controller.selectTile(tile.id);
      controller.selectSlot(slot);
    }

    expect(controller.submit(), Lesson04Event.wrong);
    expect(controller.wrongSlots, containsAll(['subject', 'object']));
    expect(controller.isResolved, isFalse);

    controller.selectSlot('subject');
    controller.selectSlot('object');
    for (final role in ['subject', 'object']) {
      final tile =
          controller.tiles.firstWhere((item) => item.answerRole == role);
      controller.selectTile(tile.id);
      controller.selectSlot(role);
    }
    expect(controller.submit(), Lesson04Event.questionCorrect);
    expect(controller.score, 0, reason: 'First Try excludes corrected rows');
  });

  test('Lesson 05 locks after one choice and gives a precise him reason', () {
    final controller = Lesson05Controller.forQuestions([pronounMc]);
    expect(controller.answer('him'), Lesson05Event.wrong);
    expect(controller.answer('He'), Lesson05Event.ignored);
    expect(
      PronounChoiceExplainer.reason(pronounMc, 'him'),
      contains('只可放在動詞或介詞後的非主語位置'),
    );
  });

  test('Correction lessons require typed repair and lock a wrong repair', () {
    final controller = CorrectionLessonController.forQuestions(
      config: lesson06Config,
      questions: [correctionQuestion],
    );
    expect(controller.answerJudgment(false), CorrectionLessonEvent.correctStep);
    expect(controller.stage, CorrectionLessonStage.correction);
    controller.updateCorrection('i want a apple');
    expect(controller.typedCorrection, 'I want a apple');
    expect(controller.submitCorrection(), CorrectionLessonEvent.wrong);
    expect(controller.isResolved, isTrue);
  });

  test('Lesson 13 checks the have-usage category before judgment', () {
    final controller = CorrectionLessonController.forQuestions(
      config: lesson13Config,
      questions: [haveQuestion],
    );
    expect(controller.stage, CorrectionLessonStage.category);
    expect(
      controller.answerCategory('there-be'),
      CorrectionLessonEvent.correctStep,
    );
    expect(
      controller.answerJudgment(true),
      CorrectionLessonEvent.questionCorrect,
    );
  });

  test('Lesson 11 types directly when one tense group is selected', () {
    final controller = Lesson11Controller(allQuestions: [tenseQuestion]);
    expect(controller.start(), Lesson11Event.started);
    expect(controller.stage, Lesson11Stage.answer);
    controller.updateAnswer('runs');
    expect(controller.submitAnswer(), Lesson11Event.questionCorrect);
    expect(controller.score, 1);
  });

  test('Lesson 12 supplies the present initial and retries only wrong forms',
      () {
    final controller = Lesson12Controller.forQuestions([verbTableQuestion]);
    expect(controller.currentQuestion.presentFirstLetter, 'b');
    controller.updateAnswer('present', 'egin');
    controller.updateAnswer('past', 'begun');
    controller.updateAnswer('pp', 'begun');
    controller.updateAnswer('ing', 'beginning');

    expect(controller.submit(), Lesson12Event.wrong);
    expect(controller.wrongFields, {'past'});
    expect(controller.isResolved, isFalse);

    controller.updateAnswer('past', 'began');
    expect(controller.submit(), Lesson12Event.questionCorrect);
    expect(controller.score, 0, reason: 'First Try excludes corrected rows');
  });
}
