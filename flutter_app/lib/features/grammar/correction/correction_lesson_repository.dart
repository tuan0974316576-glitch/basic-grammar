import 'dart:convert';

import 'package:flutter/services.dart';

import 'correction_lesson_question.dart';

class CorrectionLessonRepository {
  const CorrectionLessonRepository();

  Future<List<CorrectionLessonQuestion>> loadQuestions(String assetPath) async {
    return parseQuestions(await rootBundle.loadString(assetPath));
  }

  static List<CorrectionLessonQuestion> parseQuestions(String source) {
    final decoded = jsonDecode(source);
    if (decoded is! List) {
      throw const FormatException('Correction lesson data must be a list');
    }
    return decoded
        .map(
          (item) => CorrectionLessonQuestion.fromJson(
            item as Map<String, dynamic>,
          ),
        )
        .toList(growable: false);
  }
}
