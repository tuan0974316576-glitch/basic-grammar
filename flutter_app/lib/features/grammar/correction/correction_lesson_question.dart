class CorrectionLessonQuestion {
  const CorrectionLessonQuestion({
    required this.id,
    required this.category,
    required this.categoryLabel,
    required this.sentence,
    required this.zh,
    required this.isCorrect,
    required this.answer,
    required this.acceptedAnswers,
    required this.explanation,
    required this.caseSensitive,
  });

  factory CorrectionLessonQuestion.fromJson(Map<String, dynamic> json) {
    final answer =
        json['answer']?.toString() ?? json['english']?.toString() ?? '';
    final accepted = (json['acceptedAnswers'] as List<dynamic>? ?? const [])
        .map((value) => value.toString())
        .where((value) => value.trim().isNotEmpty)
        .toList(growable: false);
    return CorrectionLessonQuestion(
      id: json['id']?.toString() ?? '',
      category: json['category']?.toString() ?? '',
      categoryLabel: json['categoryLabel']?.toString() ?? '',
      sentence: json['sentence']?.toString() ?? '',
      zh: json['zh']?.toString() ?? '',
      isCorrect: json['isCorrect'] == true,
      answer: answer,
      acceptedAnswers: accepted.isEmpty ? [answer] : accepted,
      explanation: json['explanation']?.toString() ?? '',
      caseSensitive: json['caseSensitive'] == true,
    );
  }

  final String id;
  final String category;
  final String categoryLabel;
  final String sentence;
  final String zh;
  final bool isCorrect;
  final String answer;
  final List<String> acceptedAnswers;
  final String explanation;
  final bool caseSensitive;

  bool accepts(String value) {
    final normalized = _normalize(value, preserveCase: caseSensitive);
    return acceptedAnswers.any(
      (answer) => _normalize(answer, preserveCase: caseSensitive) == normalized,
    );
  }

  static String _normalize(String value, {required bool preserveCase}) {
    var normalized = value
        .trim()
        .replaceAll(RegExp('[’‘]'), "'")
        .replaceAll(RegExp(r'\s+'), ' ')
        .replaceAllMapped(
          RegExp(r'\s+([.,!?])'),
          (match) => match.group(1)!,
        )
        .replaceAll(RegExp(r'[.?!]+$'), '');
    if (!preserveCase) normalized = normalized.toLowerCase();
    return normalized;
  }
}

class CorrectionLessonConfig {
  const CorrectionLessonConfig({
    required this.lessonNumber,
    required this.title,
    required this.assetPath,
    required this.categoryLabels,
    this.categoryFirst = false,
  });

  final int lessonNumber;
  final String title;
  final String assetPath;
  final Map<String, String> categoryLabels;
  final bool categoryFirst;

  String get lessonLabel => 'Lesson ${lessonNumber.toString().padLeft(2, '0')}';

  String categoryLabelFor(CorrectionLessonQuestion question) {
    return question.categoryLabel.isNotEmpty
        ? question.categoryLabel
        : categoryLabels[question.category] ?? title;
  }
}

const lesson06Config = CorrectionLessonConfig(
  lessonNumber: 6,
  title: '可數名詞的使用要點',
  assetPath: 'assets/data/lesson_06.json',
  categoryLabels: {'countable': '可數名詞'},
);

const lesson07Config = CorrectionLessonConfig(
  lessonNumber: 7,
  title: '名詞的類別',
  assetPath: 'assets/data/lesson_07.json',
  categoryLabels: {
    'countable': '可數名詞',
    'uncountable': '不可數名詞',
    'gerund': 'ING 做名詞',
    'proper-noun': '專有名詞',
  },
);

const lesson08Config = CorrectionLessonConfig(
  lessonNumber: 8,
  title: 'Modal Verb 的要訣',
  assetPath: 'assets/data/lesson_08.json',
  categoryLabels: {
    'base-verb': 'modal + 原型動詞',
    'be': 'modal + be',
    'position': 'modal 位置',
  },
);

const lesson09Config = CorrectionLessonConfig(
  lessonNumber: 9,
  title: 'Adjective 形容詞',
  assetPath: 'assets/data/lesson_09.json',
  categoryLabels: {
    'simple': '簡單形容詞',
    'hyphen': '有 - 的形容詞',
    'compound': '複合形容詞',
  },
);

const lesson10Config = CorrectionLessonConfig(
  lessonNumber: 10,
  title: 'Adverb 副詞',
  assetPath: 'assets/data/lesson_10.json',
  categoryLabels: {
    'front': '句首副詞',
    'end-time': '句尾時間詞',
    'end-place': '句尾地方詞',
    'end-order': '地方 + 時間',
    'end-manner': '句尾副詞',
    'middle': '句中副詞',
    'degree': '程度副詞',
  },
);

const lesson13Config = CorrectionLessonConfig(
  lessonNumber: 13,
  title: '「有」的主要用法',
  assetPath: 'assets/data/lesson_13.json',
  categoryFirst: true,
  categoryLabels: {
    'there-be': 'There be',
    'with-without': 'with / without',
    'have': 'have / has',
  },
);
