import 'dart:convert';
import 'dart:math';

import 'package:flutter/services.dart';

import 'quiz_01_question.dart';

class Quiz01Repository {
  const Quiz01Repository();

  static const assetPath = 'assets/data/quiz_01.json';

  Future<List<Quiz01Question>> loadQuestions() async {
    return parseQuestions(await rootBundle.loadString(assetPath));
  }

  static List<Quiz01Question> parseQuestions(String source) {
    final decoded = jsonDecode(source);
    if (decoded is! List) {
      throw const FormatException('Quiz 01 data must be a JSON array');
    }
    return decoded
        .map((item) => Quiz01Question.fromJson(item as Map<String, dynamic>))
        .toList(growable: false);
  }
}

class Quiz01RoundBuilder {
  const Quiz01RoundBuilder._();

  static List<Quiz01Question> build(
    List<Quiz01Question> questions, {
    int count = 10,
    Random? random,
  }) {
    if (questions.isEmpty || count <= 0) return const [];
    final shuffled = List<Quiz01Question>.of(questions)
      ..shuffle(random ?? Random());
    return shuffled.take(min(count, shuffled.length)).toList(growable: false);
  }
}
