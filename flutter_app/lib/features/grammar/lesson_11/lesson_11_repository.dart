import 'dart:convert';

import 'package:flutter/services.dart';

import 'lesson_11_question.dart';

class Lesson11Repository {
  const Lesson11Repository();

  static const assetPath = 'assets/data/lesson_11.json';

  Future<List<Lesson11Question>> loadQuestions() async {
    return parseQuestions(await rootBundle.loadString(assetPath));
  }

  static List<Lesson11Question> parseQuestions(String source) {
    final decoded = jsonDecode(source);
    if (decoded is! List) {
      throw const FormatException('Lesson 11 data must be a list');
    }
    return decoded
        .map((item) => Lesson11Question.fromJson(item as Map<String, dynamic>))
        .toList(growable: false);
  }
}
