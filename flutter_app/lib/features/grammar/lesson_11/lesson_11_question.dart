class Lesson11Question {
  const Lesson11Question({
    required this.id,
    required this.tense,
    required this.tenseLabel,
    required this.zh,
    required this.sentence,
    required this.answer,
    required this.english,
    required this.acceptedAnswers,
    required this.explanation,
  });

  factory Lesson11Question.fromJson(Map<String, dynamic> json) {
    final answer = json['answer']?.toString() ?? '';
    final accepted = (json['acceptedAnswers'] as List<dynamic>? ?? const [])
        .map((value) => value.toString())
        .toList(growable: false);
    return Lesson11Question(
      id: json['id']?.toString() ?? '',
      tense: json['tense']?.toString() ?? '',
      tenseLabel: json['tenseLabel']?.toString() ?? '',
      zh: json['zh']?.toString() ?? '',
      sentence: json['sentence']?.toString() ?? '',
      answer: answer,
      english: json['english']?.toString() ?? '',
      acceptedAnswers: accepted.isEmpty ? [answer] : accepted,
      explanation: json['explanation']?.toString() ?? '',
    );
  }

  final String id;
  final String tense;
  final String tenseLabel;
  final String zh;
  final String sentence;
  final String answer;
  final String english;
  final List<String> acceptedAnswers;
  final String explanation;

  bool accepts(String value) {
    final normalized = normalize(value);
    return acceptedAnswers.any((answer) => normalize(answer) == normalized);
  }

  static String normalize(String value) {
    return value
        .trim()
        .toLowerCase()
        .replaceAll(RegExp('[’‘]'), "'")
        .replaceAll(RegExp(r'\s+'), ' ');
  }
}
