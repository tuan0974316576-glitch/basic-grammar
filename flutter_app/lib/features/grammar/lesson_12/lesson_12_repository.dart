import 'dart:convert';

import 'package:flutter/services.dart';

import 'lesson_12_question.dart';

class Lesson12Repository {
  const Lesson12Repository();

  static const assetPath = 'assets/data/lesson_12.json';
  static const referenceAssetPath = 'assets/data/verb_table_reference.json';

  Future<List<Lesson12Question>> loadQuestions() async {
    return parseQuestions(await rootBundle.loadString(assetPath));
  }

  Future<List<Lesson12Question>> loadReferenceQuestions() async {
    return parseReferenceQuestions(
      await rootBundle.loadString(referenceAssetPath),
    );
  }

  static List<Lesson12Question> parseQuestions(String source) {
    return _parse(source);
  }

  static List<Lesson12Question> parseReferenceQuestions(String source) {
    return _parse(source);
  }

  static List<Lesson12Question> _parse(String source) {
    final decoded = jsonDecode(source);
    if (decoded is! List) {
      throw const FormatException('Lesson 12 data must be a list');
    }
    final questions = decoded
        .map(
          (item) => Lesson12Question.fromJson(
            Map<String, dynamic>.from(item as Map),
          ),
        )
        .toList();
    questions.sort(_compareAlphabetically);
    return List.unmodifiable(questions);
  }

  static int _compareAlphabetically(
    Lesson12Question left,
    Lesson12Question right,
  ) {
    final present = left
        .form('present')
        .toLowerCase()
        .compareTo(right.form('present').toLowerCase());
    if (present != 0) return present;
    final forms = left.answerLine.toLowerCase().compareTo(
          right.answerLine.toLowerCase(),
        );
    if (forms != 0) return forms;
    return left.id.compareTo(right.id);
  }
}
