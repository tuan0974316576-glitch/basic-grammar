import 'dart:convert';
import 'dart:math';

import 'package:flutter/services.dart';

import 'lesson_05_question.dart';

class Lesson05Repository {
  const Lesson05Repository();

  static const assetPath = 'assets/data/lesson_05.json';

  Future<List<Lesson05Question>> loadQuestions() async {
    return parseQuestions(await rootBundle.loadString(assetPath));
  }

  static List<Lesson05Question> parseQuestions(String source) {
    final decoded = jsonDecode(source);
    if (decoded is! List) {
      throw const FormatException('Lesson 05 data must be a list');
    }
    return decoded
        .map((item) => Lesson05Question.fromJson(item as Map<String, dynamic>))
        .toList(growable: false);
  }
}

List<Lesson05Question> buildLesson05Round(
  List<Lesson05Question> questions, {
  int count = 10,
  Random? random,
}) {
  final shuffled = List<Lesson05Question>.of(questions)
    ..shuffle(random ?? Random());
  return shuffled.take(min(count, shuffled.length)).toList(growable: false);
}
