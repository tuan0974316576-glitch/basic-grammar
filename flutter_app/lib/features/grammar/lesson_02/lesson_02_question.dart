class Lesson02Question {
  const Lesson02Question({
    required this.id,
    required this.sentence,
    required this.zh,
    required this.isCorrect,
    required this.verbCount,
    required this.verbIndexes,
    required this.explanation,
    required this.correction,
    required this.correctSentence,
    required this.acceptedAnswers,
  });

  factory Lesson02Question.fromJson(Map<String, dynamic> json) {
    String requiredText(String key) {
      final value = (json[key] as String? ?? '').trim();
      if (value.isEmpty) {
        throw FormatException('Lesson 02 question is missing $key');
      }
      return value;
    }

    final isCorrect = json['isCorrect'] as bool?;
    final verbCount = json['verbCount'] as int?;
    final indexes = (json['verbIndexes'] as List<dynamic>? ?? const [])
        .map((value) => value as int)
        .toList(growable: false);
    if (isCorrect == null ||
        verbCount == null ||
        verbCount < 0 ||
        verbCount > 2) {
      throw const FormatException('Lesson 02 question has invalid answer data');
    }
    if (indexes.length != verbCount) {
      throw const FormatException(
          'Lesson 02 verb indexes do not match verb count');
    }

    final sentence = requiredText('sentence');
    final correction = requiredText('correction');
    final correctSentence = (json['correctSentence'] as String? ?? '').trim();
    final acceptedAnswers =
        (json['acceptedAnswers'] as List<dynamic>? ?? const [])
            .map((value) => value.toString().trim())
            .where((value) => value.isNotEmpty)
            .toList(growable: false);
    if (!isCorrect && correctSentence.isEmpty) {
      throw const FormatException(
          'Incorrect Lesson 02 question needs a correction');
    }

    return Lesson02Question(
      id: requiredText('id'),
      sentence: sentence,
      zh: requiredText('zh'),
      isCorrect: isCorrect,
      verbCount: verbCount,
      verbIndexes: indexes,
      explanation: requiredText('explanation'),
      correction: correction,
      correctSentence: isCorrect ? sentence : correctSentence,
      acceptedAnswers: isCorrect
          ? [sentence]
          : acceptedAnswers.isEmpty
              ? [correctSentence]
              : acceptedAnswers,
    );
  }

  final String id;
  final String sentence;
  final String zh;
  final bool isCorrect;
  final int verbCount;
  final List<int> verbIndexes;
  final String explanation;
  final String correction;
  final String correctSentence;
  final List<String> acceptedAnswers;

  List<String> get tokens {
    return sentence
        .replaceAll(RegExp(r'[.?!]'), '')
        .split(RegExp(r'\s+'))
        .where((token) => token.isNotEmpty)
        .toList(growable: false);
  }

  bool isCorrectVerbSelection(Set<int> selectedIndexes) {
    final picked = selectedIndexes.toList()..sort();
    final expected = [...verbIndexes]..sort();
    return picked.length == expected.length &&
        picked.indexed.every((entry) => entry.$2 == expected[entry.$1]);
  }

  String get reasonLine {
    final base = explanation.replaceFirst(RegExp(r'。$'), '');
    return '$base，所以${isCorrect ? '正確' : '錯誤'}。';
  }

  String get answerLine {
    final answer = correction.replaceFirst(RegExp(r'^正確寫法：'), '');
    return '正確答案：$answer';
  }

  bool acceptsCorrection(String value) {
    final normalized = normalizeSentence(value);
    return acceptedAnswers
        .any((answer) => normalizeSentence(answer) == normalized);
  }

  static String normalizeSentence(String value) {
    return value
        .trim()
        .replaceAll(RegExp('[’‘]'), "'")
        .replaceAll(RegExp(r'\s+'), ' ')
        .replaceAllMapped(RegExp(r'\s+([.,!?])'), (match) => match.group(1)!)
        .replaceAll(RegExp(r'[.?!]+$'), '')
        .toLowerCase();
  }
}
