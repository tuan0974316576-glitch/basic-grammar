import 'dart:convert';

import 'package:flutter/services.dart';

import 'lesson_04_question.dart';

class Lesson04Repository {
  const Lesson04Repository();

  static const assetPath = 'assets/data/lesson_04.json';

  Future<List<Lesson04Question>> loadQuestions() async {
    return parseQuestions(await rootBundle.loadString(assetPath));
  }

  static List<Lesson04Question> parseQuestions(String source) {
    final decoded = jsonDecode(source);
    if (decoded is! List) {
      throw const FormatException('Lesson 04 data must be a JSON array');
    }
    return decoded
        .map((item) => Lesson04Question.fromJson(item as Map<String, dynamic>))
        .toList(growable: false);
  }
}
