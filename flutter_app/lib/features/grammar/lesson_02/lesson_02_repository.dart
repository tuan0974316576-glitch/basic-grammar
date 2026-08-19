import 'dart:convert';
import 'dart:math';

import 'package:flutter/services.dart';

import 'lesson_02_question.dart';

class Lesson02Repository {
  const Lesson02Repository();

  static const assetPath = 'assets/data/lesson_02.json';

  Future<List<Lesson02Question>> loadQuestions() async {
    return parseQuestions(await rootBundle.loadString(assetPath));
  }

  static List<Lesson02Question> parseQuestions(String source) {
    final decoded = jsonDecode(source);
    if (decoded is! List) {
      throw const FormatException('Lesson 02 data must be a JSON array');
    }
    return decoded
        .map((item) => Lesson02Question.fromJson(item as Map<String, dynamic>))
        .toList(growable: false);
  }
}

class Lesson02RoundBuilder {
  const Lesson02RoundBuilder._();

  static List<Lesson02Question> build(
    List<Lesson02Question> questions, {
    int count = 20,
    Random? random,
  }) {
    if (questions.isEmpty || count <= 0) return const [];
    final generator = random ?? Random();
    final actualCount = min(count, questions.length);
    final oneCount = (actualCount * 0.34).round();
    final zeroCount = (actualCount * 0.33).round();
    final twoCount = actualCount - oneCount - zeroCount;

    List<Lesson02Question> pick(int verbCount, int amount) {
      final pool = questions
          .where((question) => question.verbCount == verbCount)
          .toList()
        ..shuffle(generator);
      return pool.take(amount).toList(growable: false);
    }

    final round = <Lesson02Question>[
      ...pick(0, zeroCount),
      ...pick(1, oneCount),
      ...pick(2, twoCount),
    ]..shuffle(generator);
    if (round.length != actualCount) {
      throw StateError('Lesson 02 does not contain enough questions per type');
    }
    return round;
  }
}
