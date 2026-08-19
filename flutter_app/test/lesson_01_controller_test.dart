import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/grammar/lesson_01/lesson_01_controller.dart';
import 'package:dope_english/features/grammar/lesson_01/lesson_01_question.dart';
import 'package:dope_english/features/grammar/lesson_01/lesson_01_repository.dart';

void main() {
  late List<Lesson01Question> questions;

  setUpAll(() {
    final source = File('assets/data/lesson_01.json').readAsStringSync();
    questions = Lesson01Repository.parseQuestions(source);
  });

  Lesson01Question question(String id) {
    return questions.firstWhere((item) => item.id == id);
  }

  test('action question requires identifying the action verb', () {
    final controller = Lesson01Controller.forQuestions([question('v01')]);

    expect(controller.answerVerbChoice(true), Lesson01Event.correctStep);
    expect(controller.stage, Lesson01Stage.actionVerb);

    final verbIndex = controller.currentQuestion.actionVerbTokens.indexOf('吃');
    expect(
        controller.toggleVerbToken(verbIndex), Lesson01Event.selectionChanged);
    expect(controller.submitVerbTokens(), Lesson01Event.questionCorrect);
    expect(controller.score, 1);
    expect(controller.stage, Lesson01Stage.resolved);
  });

  test('be question checks Cross, needs-be, and the exact be form', () {
    final controller = Lesson01Controller.forQuestions([question('b01')]);

    expect(controller.answerVerbChoice(false), Lesson01Event.correctStep);
    expect(controller.feedback?.title, '正確，「是」不算動詞');
    expect(controller.answerNeedsBe(true), Lesson01Event.correctStep);
    expect(controller.answerBeForm('am'), Lesson01Event.questionCorrect);
    expect(controller.score, 1);
  });

  test('adjective question uses subject-based is/am/are explanation', () {
    final controller = Lesson01Controller.forQuestions([question('a15')]);

    controller.answerVerbChoice(false);
    controller.answerNeedsBe(true);
    expect(controller.answerBeForm('is'), Lesson01Event.wrong);
    expect(controller.feedback?.lines.first, '你揀了 is。');
    expect(
      controller.feedback?.lines.last,
      contains('眾數名詞（They），所以應該用 are'),
    );
  });

  test('any wrong step locks the question and does not allow a retry', () {
    final controller = Lesson01Controller.forQuestions([question('b03')]);

    expect(controller.answerVerbChoice(true), Lesson01Event.wrong);
    expect(controller.isResolved, isTrue);
    expect(controller.answerVerbChoice(false), Lesson01Event.ignored);
    expect(controller.score, 0);
    expect(controller.mistakes, 1);
    expect(controller.missedQuestions.map((item) => item.id), ['b03']);
  });

  test('First Try counts only fully correct questions', () {
    final controller = Lesson01Controller.forQuestions([
      question('v01'),
      question('b01'),
    ]);

    controller.answerVerbChoice(false);
    expect(controller.next(), Lesson01Event.nextQuestion);

    controller.answerVerbChoice(false);
    controller.answerNeedsBe(true);
    controller.answerBeForm('am');
    expect(controller.next(), Lesson01Event.completed);

    expect(controller.score, 1);
    expect(controller.mistakes, 1);
    expect(controller.accuracy, 50);
  });

  test('review mode contains only questions missed in the completed round', () {
    final controller = Lesson01Controller.forQuestions([
      question('v01'),
      question('b01'),
    ]);

    controller.answerVerbChoice(false);
    controller.next();
    controller.answerVerbChoice(false);
    controller.answerNeedsBe(true);
    controller.answerBeForm('am');
    controller.next();

    expect(controller.reviewMistakes(), isTrue);
    expect(controller.isReviewMode, isTrue);
    expect(controller.questions.map((item) => item.id), ['v01']);
    expect(controller.score, 0);
    expect(controller.mistakes, 0);
  });
}
