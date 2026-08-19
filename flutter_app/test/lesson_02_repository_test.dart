import 'dart:io';
import 'dart:math';

import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/grammar/lesson_02/lesson_02_repository.dart';
import 'package:dope_english/features/grammar/lesson_02/lesson_02_question.dart';

void main() {
  late List<Lesson02Question> questions;

  setUpAll(() {
    final source = File('assets/data/lesson_02.json').readAsStringSync();
    questions = Lesson02Repository.parseQuestions(source);
  });

  test('contains 100 unique questions balanced across 0, 1, and 2 verbs', () {
    expect(questions, hasLength(100));
    expect(
        questions.where((question) => question.verbCount == 0), hasLength(33));
    expect(
        questions.where((question) => question.verbCount == 1), hasLength(34));
    expect(
        questions.where((question) => question.verbCount == 2), hasLength(33));
    expect(
        questions.map((question) => question.sentence).toSet(), hasLength(100));
  });

  test('builds every 20-question round with all three question types', () {
    final round = Lesson02RoundBuilder.build(questions, random: Random(9));

    expect(round, hasLength(20));
    expect(round.where((question) => question.verbCount == 0), hasLength(7));
    expect(round.where((question) => question.verbCount == 1), hasLength(7));
    expect(round.where((question) => question.verbCount == 2), hasLength(6));
  });

  test('uses precise present-tense and be-verb explanation labels', () {
    final oneVerb = questions.firstWhere(
      (question) => question.sentence == 'I eat breakfast.',
    );
    final twoVerbs = questions.firstWhere(
      (question) => question.sentence == 'You are go home.',
    );

    expect(oneVerb.reasonLine, contains('eat 是現在式動詞'));
    expect(twoVerbs.reasonLine, contains('are 是 be 動詞，go 是現在式動詞'));
  });

  test('typed corrections ignore case, spacing, and final punctuation', () {
    final question = questions.firstWhere(
      (item) => item.sentence == 'You are go home.',
    );

    expect(question.acceptsCorrection('  you go home  '), isTrue);
    expect(question.acceptsCorrection('You go home.'), isTrue);
    expect(question.acceptsCorrection('You are home.'), isFalse);
  });
}
