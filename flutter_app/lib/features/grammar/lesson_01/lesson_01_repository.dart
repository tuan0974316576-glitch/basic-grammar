import 'dart:convert';
import 'dart:math';

import 'package:flutter/services.dart';

import 'lesson_01_question.dart';

class Lesson01Repository {
  const Lesson01Repository();

  static const assetPath = 'assets/data/lesson_01.json';

  Future<List<Lesson01Question>> loadQuestions() async {
    return parseQuestions(await rootBundle.loadString(assetPath));
  }

  static List<Lesson01Question> parseQuestions(String source) {
    final decoded = jsonDecode(source);
    if (decoded is! List) {
      throw const FormatException('Lesson 01 data must be a JSON array');
    }
    return decoded
        .map((item) => Lesson01Question.fromJson(item as Map<String, dynamic>))
        .toList(growable: false);
  }
}

class Lesson01RoundBuilder {
  const Lesson01RoundBuilder._();

  static List<Lesson01Question> build(
    List<Lesson01Question> questions, {
    int count = 20,
    Random? random,
  }) {
    if (questions.isEmpty || count <= 0) return const [];
    final generator = random ?? Random();
    final actualCount = min(count, questions.length);
    final actionCount = (actualCount * 0.5).round();
    final beCount = (actualCount * 0.3).round();
    final adjectiveCount = actualCount - actionCount - beCount;

    List<Lesson01Question> pick(Lesson01QuestionType type, int amount) {
      final pool = questions.where((question) => question.type == type).toList()
        ..shuffle(generator);
      return pool.take(amount).toList(growable: false);
    }

    final round = <Lesson01Question>[
      ...pick(Lesson01QuestionType.action, actionCount),
      ...pick(Lesson01QuestionType.be, beCount),
      ...pick(Lesson01QuestionType.adjective, adjectiveCount),
    ]..shuffle(generator);

    if (round.length != actualCount) {
      throw StateError('Lesson 01 does not contain enough questions per type');
    }
    return round;
  }
}
