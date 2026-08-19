import 'dart:io';
import 'dart:math';

import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/grammar/quiz_01/quiz_01_question.dart';
import 'package:dope_english/features/grammar/quiz_01/quiz_01_repository.dart';

void main() {
  late List<Quiz01Question> questions;

  setUpAll(() {
    questions = Quiz01Repository.parseQuestions(
      File('assets/data/quiz_01.json').readAsStringSync(),
    );
  });

  test('contains 50 unique, complete sentence-building questions', () {
    expect(questions, hasLength(50));
    expect(questions.map((question) => question.id).toSet(), hasLength(50));
    expect(questions.every((question) => question.distractors.length >= 2),
        isTrue);
  });

  test('keeps the singular Chinese prompts singular in English', () {
    final book = questions.firstWhere((question) => question.id == 'q141');
    final pen = questions.firstWhere((question) => question.id == 'q142');

    expect(book.answerText, 'My book is new.');
    expect(pen.answerText, 'Your pen is short.');
  });

  test('adds exactly two distinct distractors to each answer bank', () {
    for (final question in questions) {
      final blocks = question.buildBlocks(Random(7));
      expect(blocks, hasLength(question.answer.length + 2));
      expect(blocks.map((block) => block.id).toSet(), hasLength(blocks.length));
      expect(
        blocks.where((block) => block.id.startsWith('extra-')),
        hasLength(2),
      );
    }
  });

  test('builds a short 10-question round without repeats', () {
    final round = Quiz01RoundBuilder.build(questions, random: Random(8));

    expect(round, hasLength(10));
    expect(round.map((question) => question.id).toSet(), hasLength(10));
  });
}
