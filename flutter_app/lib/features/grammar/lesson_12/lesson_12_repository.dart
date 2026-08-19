import 'dart:convert';

import 'package:flutter/services.dart';

import 'lesson_12_question.dart';

class Lesson12Repository {
  const Lesson12Repository();

  static const assetPath = 'assets/data/lesson_12.json';

  Future<List<Lesson12Question>> loadQuestions() async {
    return parseQuestions(await rootBundle.loadString(assetPath));
  }

  static List<Lesson12Question> parseQuestions(String source) {
    final decoded = jsonDecode(source);
    if (decoded is! List) {
      throw const FormatException('Lesson 12 data must be a list');
    }
    return decoded
        .map(
          (item) => Lesson12Question.fromJson(
            Map<String, dynamic>.from(item as Map),
          ),
        )
        .toList(growable: false);
  }
}
