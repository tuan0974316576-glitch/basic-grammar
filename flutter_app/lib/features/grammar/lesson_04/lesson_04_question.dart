class Lesson04Question {
  const Lesson04Question({
    required this.id,
    required this.zh,
    required this.forms,
  });

  factory Lesson04Question.fromJson(Map<String, dynamic> json) {
    final forms = (json['forms'] as Map<String, dynamic>? ?? const {})
        .map((key, value) => MapEntry(key, value.toString()));
    if (forms.length != 4) {
      throw const FormatException('Lesson 04 needs four pronoun forms');
    }
    return Lesson04Question(
      id: json['id']?.toString() ?? '',
      zh: json['zh']?.toString() ?? '',
      forms: forms,
    );
  }

  final String id;
  final String zh;
  final Map<String, String> forms;
}

class Lesson04Tile {
  const Lesson04Tile({required this.id, required this.text, this.answerRole});

  final String id;
  final String text;
  final String? answerRole;
}
