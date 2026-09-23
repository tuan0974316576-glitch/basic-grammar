import 'dart:convert';

import 'package:flutter/services.dart';

import 'econ_concept_review_models.dart';

abstract interface class EconConceptReviewBankRepository {
  Future<EconConceptReviewLesson> loadLesson();
}

class EconConceptReviewRepository implements EconConceptReviewBankRepository {
  const EconConceptReviewRepository({this.assetPath = _defaultAssetPath});

  static const _defaultAssetPath = 'assets/data/concept-review.json';

  final String assetPath;

  @override
  Future<EconConceptReviewLesson> loadLesson() async {
    final raw = await rootBundle.loadString(assetPath);
    final decoded = jsonDecode(raw);
    if (decoded is! Map) {
      throw const FormatException('ECON review release is invalid.');
    }
    final lessons = decoded['lessons'];
    if (lessons is! List || lessons.isEmpty || lessons.first is! Map) {
      throw const FormatException('ECON review release has no lesson.');
    }
    return EconConceptReviewLesson.fromJson(
      Map<String, dynamic>.from(lessons.first as Map),
    );
  }
}
