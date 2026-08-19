import 'dart:io';
import 'dart:math';

import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/grammar/lesson_01/lesson_01_question.dart';
import 'package:dope_english/features/grammar/lesson_01/lesson_01_repository.dart';

void main() {
  late List<Lesson01Question> questions;

  setUpAll(() {
    final source = File('assets/data/lesson_01.json').readAsStringSync();
    questions = Lesson01Repository.parseQuestions(source);
  });

  test('exports all 100 Lesson 01 questions with the expected mix', () {
    expect(questions, hasLength(100));
    expect(
      questions
          .where((question) => question.type == Lesson01QuestionType.action),
      hasLength(50),
    );
    expect(
      questions.where((question) => question.type == Lesson01QuestionType.be),
      hasLength(30),
    );
    expect(
      questions
          .where((question) => question.type == Lesson01QuestionType.adjective),
      hasLength(20),
    );
  });

  test('builds a 20-question round with an exact 10/6/4 mix', () {
    final round = Lesson01RoundBuilder.build(
      questions,
      random: Random(7),
    );

    expect(round, hasLength(20));
    expect(
      round.where((question) => question.type == Lesson01QuestionType.action),
      hasLength(10),
    );
    expect(
      round.where((question) => question.type == Lesson01QuestionType.be),
      hasLength(6),
    );
    expect(
      round
          .where((question) => question.type == Lesson01QuestionType.adjective),
      hasLength(4),
    );
  });

  test('extracts the complete action verb without splitting repeated text', () {
    final question = questions.firstWhere((question) => question.id == 'v10');

    expect(question.actionVerbText, '畫畫');
    expect(question.actionVerbTokens, ['妹妹', '畫畫']);
  });
}
