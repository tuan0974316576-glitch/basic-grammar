import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/grammar/lesson_02/lesson_02_controller.dart';
import 'package:dope_english/features/grammar/lesson_02/lesson_02_question.dart';
import 'package:dope_english/features/grammar/lesson_02/lesson_02_repository.dart';

void main() {
  late List<Lesson02Question> questions;

  setUpAll(() {
    questions = Lesson02Repository.parseQuestions(
      File('assets/data/lesson_02.json').readAsStringSync(),
    );
  });

  Lesson02Question question(String sentence) {
    return questions.firstWhere((item) => item.sentence == sentence);
  }

  void typeAnswer(Lesson02Controller controller, String value) {
    for (final character in value.split('')) {
      controller.appendCharacter(character);
    }
  }

  test('correct sentence finishes after selecting verb count 1', () {
    final controller = Lesson02Controller.forQuestions([
      question('I eat breakfast.'),
    ]);

    expect(controller.answerJudgment(true), Lesson02Event.correctStep);
    expect(controller.answerVerbCount(1), Lesson02Event.questionCorrect);
    expect(controller.score, 1);
    expect(controller.feedback?.reason, contains('所以正確'));
  });

  test('zero-verb sentence opens correction keyboard and auto-capitalizes', () {
    final controller = Lesson02Controller.forQuestions([question('I happy.')]);

    controller.answerJudgment(false);
    expect(controller.answerVerbCount(0), Lesson02Event.correctStep);
    expect(controller.stage, Lesson02Stage.correction);
    typeAnswer(controller, 'i am happy');

    expect(controller.typedCorrection, 'I am happy');
    expect(controller.submitCorrection(), Lesson02Event.questionCorrect);
    expect(controller.score, 1);
  });

  test('two-verb sentence requires both verb tokens before correction', () {
    final controller = Lesson02Controller.forQuestions([
      question('You are go home.'),
    ]);

    controller.answerJudgment(false);
    controller.answerVerbCount(2);
    expect(controller.stage, Lesson02Stage.verbTokens);
    controller.toggleVerbToken(1);
    controller.toggleVerbToken(2);
    expect(controller.submitVerbTokens(), Lesson02Event.correctStep);
    expect(controller.stage, Lesson02Stage.correction);
    typeAnswer(controller, 'you go home');
    expect(controller.submitCorrection(), Lesson02Event.questionCorrect);
  });

  test('wrong judgment locks the whole question immediately', () {
    final controller = Lesson02Controller.forQuestions([
      question('I eat breakfast.'),
    ]);

    expect(controller.answerJudgment(false), Lesson02Event.wrong);
    expect(controller.isResolved, isTrue);
    expect(controller.answerJudgment(true), Lesson02Event.ignored);
    expect(controller.mistakes, 1);
    expect(controller.score, 0);
  });

  test('wrong verb count locks the question', () {
    final controller = Lesson02Controller.forQuestions([question('I happy.')]);

    controller.answerJudgment(false);
    expect(controller.answerVerbCount(1), Lesson02Event.wrong);
    expect(controller.isResolved, isTrue);
  });

  test('wrong verb tokens lock the question', () {
    final controller = Lesson02Controller.forQuestions([
      question('You are go home.'),
    ]);

    controller.answerJudgment(false);
    controller.answerVerbCount(2);
    controller.toggleVerbToken(0);
    expect(controller.submitVerbTokens(), Lesson02Event.wrong);
    expect(controller.isResolved, isTrue);
  });

  test('empty correction shows an error but is not counted as an attempt', () {
    final controller = Lesson02Controller.forQuestions([question('I happy.')]);
    controller.answerJudgment(false);
    controller.answerVerbCount(0);

    expect(controller.submitCorrection(), Lesson02Event.invalidInput);
    expect(controller.stage, Lesson02Stage.correction);
    expect(controller.mistakes, 0);
  });

  test('an incorrect typed sentence locks and reveals the correct answer', () {
    final controller = Lesson02Controller.forQuestions([question('I happy.')]);
    controller.answerJudgment(false);
    controller.answerVerbCount(0);
    typeAnswer(controller, 'I is happy');

    expect(controller.submitCorrection(), Lesson02Event.wrong);
    expect(controller.isResolved, isTrue);
    expect(controller.feedback?.answer, contains('I am happy'));
  });
}
