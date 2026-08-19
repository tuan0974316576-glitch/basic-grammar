class Lesson12Question {
  const Lesson12Question({
    required this.id,
    required this.zh,
    required this.forms,
    required this.imageAsset,
    required this.audioAsset,
  });

  factory Lesson12Question.fromJson(Map<String, dynamic> json) {
    final rawForms = Map<String, dynamic>.from(
      json['forms'] as Map? ?? const <String, dynamic>{},
    );
    return Lesson12Question(
      id: json['id']?.toString() ?? '',
      zh: json['zh']?.toString() ?? '',
      forms: {
        for (final field in fields) field: rawForms[field]?.toString() ?? '',
      },
      imageAsset: json['imageAsset']?.toString() ?? '',
      audioAsset: json['audioAsset']?.toString() ?? '',
    );
  }

  static const fields = ['present', 'past', 'pp', 'ing'];
  static const labels = {
    'present': '現在式',
    'past': '過去式',
    'pp': 'PP',
    'ing': 'ING',
  };

  final String id;
  final String zh;
  final Map<String, String> forms;
  final String imageAsset;
  final String audioAsset;

  String form(String field) => forms[field] ?? '';

  String get presentFirstLetter {
    final value = form('present');
    return value.isEmpty ? '' : value.substring(0, 1);
  }

  String get answerLine => fields.map(form).join(' / ');

  String get spokenLine => fields.map(form).join(', ');
}
