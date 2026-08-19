import 'dart:convert';
import 'dart:math';

import 'package:flutter/services.dart';

import 'lesson_03_question.dart';

class Lesson03Repository {
  const Lesson03Repository();

  static const assetPath = 'assets/data/lesson_03.json';

  Future<List<Lesson03Question>> loadQuestions() async {
    return parseQuestions(await rootBundle.loadString(assetPath));
  }

  static List<Lesson03Question> parseQuestions(String source) {
    final decoded = jsonDecode(source);
    if (decoded is! List) {
      throw const FormatException('Lesson 03 data must be a JSON array');
    }
    return decoded
        .map((item) => Lesson03Question.fromJson(item as Map<String, dynamic>))
        .toList(growable: false);
  }
}

class Lesson03RoundBuilder {
  const Lesson03RoundBuilder._();

  static List<Lesson03Question> build(
    List<Lesson03Question> questions, {
    int count = 10,
    Random? random,
  }) {
    if (questions.isEmpty || count <= 0) return const [];
    final shuffled = List<Lesson03Question>.of(questions)
      ..shuffle(random ?? Random());
    return shuffled.take(min(count, shuffled.length)).toList(growable: false);
  }
}
