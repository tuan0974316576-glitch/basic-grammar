import 'dart:async';
import 'dart:convert';

import 'package:cloud_firestore/cloud_firestore.dart';

/// Reads teacher-published grammar banks when available. Every caller keeps
/// its bundled asset as the offline and malformed-data fallback.
class GrammarQuestionBankService {
  const GrammarQuestionBankService._();

  static const collection = 'grammarQuestionBanks';

  static const _assetLessonIds = <String, String>{
    'lesson_01.json': 'lesson1',
    'lesson_02.json': 'lesson2',
    'quiz_01.json': 'quiz1',
    'lesson_03.json': 'sentence-underline',
    'lesson_04.json': 'pronoun-match',
    'lesson_05.json': 'pronoun-sentence',
    'lesson_06.json': 'countable-nouns',
    'lesson_07.json': 'noun-category',
    'lesson_08.json': 'modal-verb',
    'lesson_09.json': 'adjective-lesson',
    'lesson_10.json': 'adverb-lesson',
    'lesson_11.json': 'tenses',
    'lesson_12.json': 'verb-table',
    'lesson_13.json': 'have-usage',
    'verb_table_reference.json': 'verb-table-reference',
  };

  static Future<String?> loadPublishedForAsset(String assetPath) async {
    final filename = assetPath.split('/').last;
    final lessonId = _assetLessonIds[filename];
    if (lessonId == null) return null;

    try {
      final snapshot = await FirebaseFirestore.instance
          .collection(collection)
          .doc(lessonId)
          .get(const GetOptions(source: Source.server))
          .timeout(const Duration(seconds: 4));
      if (!snapshot.exists) return null;
      final data = snapshot.data();
      final questions = data?['questions'];
      if (questions is! List || questions.isEmpty) return null;
      return jsonEncode(questions);
    } catch (_) {
      return null;
    }
  }
}
