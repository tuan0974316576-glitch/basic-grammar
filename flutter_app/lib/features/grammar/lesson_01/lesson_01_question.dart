enum Lesson01QuestionType { action, be, adjective }

class Lesson01Question {
  const Lesson01Question({
    required this.id,
    required this.type,
    required this.zh,
    required this.english,
    this.note = '',
    this.verbZh = '',
    this.beForm = '',
    this.subjectZh = '',
    this.subjectEn = '',
    this.subjectRole = '',
    this.pronoun = '',
  });

  factory Lesson01Question.fromJson(Map<String, dynamic> json) {
    final typeName = json['type'] as String? ?? '';
    final type = Lesson01QuestionType.values.where((value) {
      return value.name == typeName;
    }).firstOrNull;
    if (type == null) {
      throw FormatException('Unknown Lesson 01 question type: $typeName');
    }

    String requiredText(String key) {
      final value = (json[key] as String? ?? '').trim();
      if (value.isEmpty) {
        throw FormatException('Lesson 01 question is missing $key');
      }
      return value;
    }

    return Lesson01Question(
      id: requiredText('id'),
      type: type,
      zh: requiredText('zh'),
      english: requiredText('english'),
      note: (json['note'] as String? ?? '').trim(),
      verbZh: (json['verbZh'] as String? ?? '').trim(),
      beForm: (json['beForm'] as String? ?? '').trim(),
      subjectZh: (json['subjectZh'] as String? ?? '').trim(),
      subjectEn: (json['subjectEn'] as String? ?? '').trim(),
      subjectRole: (json['subjectRole'] as String? ?? '').trim(),
      pronoun: (json['pronoun'] as String? ?? '').trim(),
    );
  }

  final String id;
  final Lesson01QuestionType type;
  final String zh;
  final String english;
  final String note;
  final String verbZh;
  final String beForm;
  final String subjectZh;
  final String subjectEn;
  final String subjectRole;
  final String pronoun;

  bool get hasActionVerb => type == Lesson01QuestionType.action;

  String get actionVerbText {
    if (verbZh.isNotEmpty) return verbZh;
    final match = RegExp(r'「([^」]+)」').firstMatch(note);
    return match?.group(1)?.trim() ?? '';
  }

  List<String> get actionVerbTokens {
    final sentence = zh.replaceAll(RegExp(r'[。！？!?.,，]'), '').trim();
    final verb = actionVerbText;
    final verbIndex = sentence.indexOf(verb);
    if (sentence.isEmpty) return const [];
    if (verb.isEmpty || verbIndex < 0) return [sentence];

    return [
      sentence.substring(0, verbIndex).trim(),
      verb,
      sentence.substring(verbIndex + verb.length).trim(),
    ].where((token) => token.isNotEmpty).toList(growable: false);
  }

  bool isCorrectVerbSelection(Set<int> selectedIndexes) {
    final tokens = actionVerbTokens;
    return selectedIndexes.length == 1 &&
        tokens[selectedIndexes.single] == actionVerbText;
  }

  String get beRuleExplanation {
    if (subjectZh.isEmpty ||
        subjectEn.isEmpty ||
        subjectRole.isEmpty ||
        pronoun.isEmpty) {
      return '主語要配 $beForm。';
    }
    return '因為主語是$subjectZh（英文是 $subjectEn），即是$subjectRole'
        '（$pronoun），所以應該用 $beForm。';
  }
}
