enum EconReviewLanguage { zh, en }

extension EconReviewLanguageText on EconReviewLanguage {
  String get code => this == EconReviewLanguage.zh ? 'zh' : 'en';
}

enum EconConceptReviewExerciseType { reorder, symbol, trueFalse, type }

class EconConceptReviewExercise {
  const EconConceptReviewExercise({
    required this.id,
    required this.type,
    required this.concept,
    required this.prompt,
    required this.explanation,
    this.promptTitle = const {},
    this.promptMain = const {},
    this.tokens = const {},
    this.answerTokens = const {},
    this.options = const [],
    this.answer,
    this.acceptedAnswers = const {},
  });

  final String id;
  final EconConceptReviewExerciseType type;
  final String concept;
  final Map<String, String> prompt;
  final Map<String, String> promptTitle;
  final Map<String, String> promptMain;
  final Map<String, List<String>> tokens;
  final Map<String, List<String>> answerTokens;
  final List<String> options;
  final Object? answer;
  final Map<String, List<String>> acceptedAnswers;
  final Map<String, String> explanation;

  factory EconConceptReviewExercise.fromJson(Map<String, dynamic> json) {
    final type = switch (json['type'] as String?) {
      'reorder' => EconConceptReviewExerciseType.reorder,
      'symbol' => EconConceptReviewExerciseType.symbol,
      'trueFalse' => EconConceptReviewExerciseType.trueFalse,
      'type' => EconConceptReviewExerciseType.type,
      _ => throw const FormatException('Unknown ECON review exercise type.'),
    };
    return EconConceptReviewExercise(
      id: json['id'] as String? ?? '',
      type: type,
      concept: json['concept'] as String? ?? '',
      prompt: _localizedText(json['prompt']),
      promptTitle: _localizedText(json['promptTitle']),
      promptMain: _localizedText(json['promptMain']),
      tokens: _localizedLists(json['tokens']),
      answerTokens: _localizedLists(json['answerTokens']),
      options: _stringList(json['options']),
      answer: json['answer'],
      acceptedAnswers: _localizedLists(json['acceptedAnswers']),
      explanation: _localizedText(json['explanation']),
    );
  }

  String text(Map<String, String> values, EconReviewLanguage language) {
    return values[language.code] ?? values['en'] ?? values['zh'] ?? '';
  }

  List<String> localizedTokens(
    Map<String, List<String>> values,
    EconReviewLanguage language,
  ) {
    return List.unmodifiable(
      values[language.code] ?? values['en'] ?? values['zh'] ?? const [],
    );
  }

  String? answerText(EconReviewLanguage language) {
    final value = answer;
    if (value is String) return value;
    if (value is Map<String, dynamic>) {
      return value[language.code] as String? ?? value['en'] as String?;
    }
    return null;
  }
}

class EconConceptReviewLesson {
  const EconConceptReviewLesson({
    required this.id,
    required this.chapterNo,
    required this.title,
    required this.description,
    required this.exercises,
  });

  final String id;
  final int chapterNo;
  final Map<String, String> title;
  final Map<String, String> description;
  final List<EconConceptReviewExercise> exercises;

  EconConceptReviewLesson limitedTo(int count) {
    if (count <= 0 || count >= exercises.length) return this;
    return EconConceptReviewLesson(
      id: id,
      chapterNo: chapterNo,
      title: title,
      description: description,
      exercises: exercises.take(count).toList(growable: false),
    );
  }

  factory EconConceptReviewLesson.fromJson(Map<String, dynamic> json) {
    final rawExercises = json['exercises'];
    if (rawExercises is! List) {
      throw const FormatException('ECON review lesson has no exercises.');
    }
    final exercises = rawExercises
        .whereType<Map>()
        .map((item) => EconConceptReviewExercise.fromJson(
              Map<String, dynamic>.from(item),
            ))
        .toList(growable: false);
    if (exercises.isEmpty) {
      throw const FormatException('ECON review lesson is empty.');
    }
    return EconConceptReviewLesson(
      id: json['id'] as String? ?? '',
      chapterNo: (json['chapterNo'] as num?)?.toInt() ?? 0,
      title: _localizedText(json['title']),
      description: _localizedText(json['description']),
      exercises: exercises,
    );
  }

  String text(Map<String, String> values, EconReviewLanguage language) {
    return values[language.code] ?? values['en'] ?? values['zh'] ?? '';
  }
}

Map<String, String> _localizedText(Object? value) {
  if (value is! Map) return const {};
  return value.map(
    (key, item) => MapEntry(key.toString(), item?.toString() ?? ''),
  );
}

Map<String, List<String>> _localizedLists(Object? value) {
  if (value is! Map) return const {};
  return value.map((key, item) {
    final list = item is List
        ? item.whereType<Object>().map((e) => '$e').toList()
        : <String>[];
    return MapEntry(key.toString(), list);
  });
}

List<String> _stringList(Object? value) {
  return value is List
      ? value.whereType<Object>().map((item) => '$item').toList(growable: false)
      : const [];
}

bool econConceptReviewIsCorrect({
  required EconConceptReviewExercise exercise,
  required EconReviewLanguage language,
  required List<String> selectedTokens,
  required Object? selectedOption,
  required String response,
}) {
  switch (exercise.type) {
    case EconConceptReviewExerciseType.reorder:
      return _sameList(
        selectedTokens,
        exercise.localizedTokens(exercise.answerTokens, language),
      );
    case EconConceptReviewExerciseType.symbol:
      return selectedOption == exercise.answer;
    case EconConceptReviewExerciseType.trueFalse:
      return selectedOption == (exercise.answer == true);
    case EconConceptReviewExerciseType.type:
      final normalized = econConceptReviewNormalize(response);
      final accepted =
          exercise.localizedTokens(exercise.acceptedAnswers, language);
      final candidates = accepted.isNotEmpty
          ? accepted
          : [exercise.answerText(language) ?? ''];
      return candidates.any(
        (candidate) => econConceptReviewNormalize(candidate) == normalized,
      );
  }
}

String econConceptReviewNormalize(String value) {
  return value
      .trim()
      .toLowerCase()
      .replaceAll(RegExp(r'[\s\u3000]+'), '')
      .replaceAll(RegExp(r'''[，。！？、,.!?;；:：'"“”‘’()（）]'''), '');
}

bool _sameList(List<String> left, List<String> right) {
  if (left.length != right.length) return false;
  for (var index = 0; index < left.length; index++) {
    if (left[index] != right[index]) return false;
  }
  return true;
}
