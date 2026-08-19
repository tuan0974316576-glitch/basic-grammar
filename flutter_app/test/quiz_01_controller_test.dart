import 'dart:math';

import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/grammar/quiz_01/quiz_01_controller.dart';
import 'package:dope_english/features/grammar/quiz_01/quiz_01_question.dart';

const question = Quiz01Question(
  id: 'q101',
  zh: '她吃蘋果。',
  answer: ['She', 'eats', 'apples.'],
  distractors: ['eat', 'is'],
);

String blockId(Quiz01Controller controller, String text) {
  return [...controller.availableBlocks, ...controller.selectedBlocks]
      .firstWhere((block) => block.text == text)
      .id;
}

void selectWords(Quiz01Controller controller, List<String> words) {
  for (final word in words) {
    controller.toggleBlock(blockId(controller, word));
  }
}

void main() {
  test('builds the sentence in the exact selected order', () {
    final controller = Quiz01Controller.forQuestions(
      [question],
      random: Random(1),
    );

    selectWords(controller, question.answer);
    expect(
      controller.selectedBlocks.map((block) => block.text),
      question.answer,
    );
    expect(controller.submit(), Quiz01Event.questionCorrect);
    expect(controller.score, 1);
    expect(controller.isResolved, isTrue);
  });

  test('a selected word can return to the bank before confirmation', () {
    final controller = Quiz01Controller.forQuestions([question]);
    final sheId = blockId(controller, 'She');

    expect(controller.toggleBlock(sheId), Quiz01Event.selectionChanged);
    expect(controller.selectedBlocks.single.text, 'She');
    expect(controller.toggleBlock(sheId), Quiz01Event.selectionChanged);
    expect(controller.selectedBlocks, isEmpty);
    expect(
        controller.availableBlocks.map((block) => block.id), contains(sheId));
  });

  test('a wrong order locks the question and reveals the right sentence', () {
    final controller = Quiz01Controller.forQuestions([question]);
    selectWords(controller, ['eats', 'She', 'apples.']);

    expect(controller.submit(), Quiz01Event.wrong);
    expect(controller.mistakes, 1);
    expect(controller.isResolved, isTrue);
    expect(controller.feedback?.answer, question.answerText);
    expect(
      controller.toggleBlock(blockId(controller, 'is')),
      Quiz01Event.ignored,
    );
  });

  test('using a distractor is wrong even if all answer words are present', () {
    final controller = Quiz01Controller.forQuestions([question]);
    selectWords(controller, [...question.answer, 'is']);

    expect(controller.submit(), Quiz01Event.wrong);
    expect(controller.score, 0);
  });

  test('empty confirmation is not counted as a genuine attempt', () {
    final controller = Quiz01Controller.forQuestions([question]);

    expect(controller.submit(), Quiz01Event.invalidInput);
    expect(controller.isResolved, isFalse);
    expect(controller.mistakes, 0);
  });
}
