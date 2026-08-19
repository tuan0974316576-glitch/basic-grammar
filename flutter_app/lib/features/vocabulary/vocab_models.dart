import 'dart:convert';

String normalizeVocabWord(String value) {
  return value
      .trim()
      .replaceAll(RegExp('[\u2018\u2019]'), "'")
      .replaceAll(RegExp('[\u2010-\u2015]'), '-')
      .replaceAll(RegExp(r'\s+'), ' ')
      .toLowerCase();
}

String normalizeVocabMeaning(String value) {
  return value
      .trim()
      .replaceAll(RegExp(r'\s*[/／;；]\s*'), ' / ')
      .replaceAll(RegExp(r'\s+'), ' ');
}

String normalizeMeaningKey(String value) {
  return normalizeVocabMeaning(value)
      .replaceAll(RegExp(r'[\s/／]+'), '')
      .toLowerCase();
}

const vocabPosLabels = <String, String>{
  'noun': 'n.',
  'verb': 'v.',
  'adjective': 'adj.',
  'adverb': 'adv.',
  'preposition': 'prep.',
  'conjunction': 'conj.',
  'pronoun': 'pron.',
  'determiner': 'det.',
  'modal': 'modal v.',
  'auxiliary': 'aux.',
  'exclamation': 'exclam.',
  'number': 'num.',
  'phrase': 'ph.',
  'pattern': 'pt.',
};

class VocabSense {
  const VocabSense({
    required this.id,
    required this.word,
    required this.display,
    required this.meaning,
    required this.pos,
    required this.type,
    this.level = '',
    this.source = '',
    this.sourceEntryId = '',
  });

  factory VocabSense.fromJson(Map<String, dynamic> json) {
    return VocabSense(
      id: '${json['id'] ?? ''}',
      word: normalizeVocabWord('${json['word'] ?? json['display'] ?? ''}'),
      display: '${json['display'] ?? json['word'] ?? ''}'.trim(),
      meaning: normalizeVocabMeaning('${json['meaning'] ?? ''}'),
      pos: '${json['pos'] ?? ''}'.trim().toLowerCase(),
      type: '${json['type'] ?? 'word'}'.trim().toLowerCase(),
      level: '${json['level'] ?? ''}'.trim().toUpperCase(),
      source: '${json['source'] ?? ''}'.trim(),
      sourceEntryId: '${json['sourceEntryId'] ?? ''}'.trim(),
    );
  }

  final String id;
  final String word;
  final String display;
  final String meaning;
  final String pos;
  final String type;
  final String level;
  final String source;
  final String sourceEntryId;

  String get storageId =>
      [word, pos, type, normalizeMeaningKey(meaning)].join('|');

  String get metaLabel {
    if (type == 'pattern' && pos != 'verb') return 'pt.';
    if (pos.isNotEmpty) return vocabPosLabels[pos] ?? pos;
    if (type == 'phrase') return 'ph.';
    return '';
  }

  String get label => metaLabel.isEmpty ? meaning : '$metaLabel $meaning';

  Map<String, dynamic> toJson() => {
        'id': id,
        'word': word,
        'display': display,
        'meaning': meaning,
        'pos': pos,
        'type': type,
        'level': level,
        'source': source,
        'sourceEntryId': sourceEntryId,
      };
}

class VocabExample {
  const VocabExample({required this.english, required this.chinese});

  factory VocabExample.fromJson(Map<String, dynamic> json) {
    return VocabExample(
      english: '${json['source'] ?? ''}'.trim(),
      chinese: '${json['target'] ?? ''}'.trim(),
    );
  }

  final String english;
  final String chinese;
}

class VocabExampleSection {
  const VocabExampleSection({
    required this.sense,
    required this.examples,
  });

  final VocabSense sense;
  final List<VocabExample> examples;
}

class VocabItem {
  const VocabItem({
    required this.id,
    required this.word,
    required this.senses,
    required this.createdAt,
    required this.updatedAt,
    this.totalSeen = 0,
    this.totalCorrect = 0,
  });

  factory VocabItem.fromJson(Map<String, dynamic> json) {
    final rawSenses = json['senses'] ?? json['meanings'];
    final senses = rawSenses is List
        ? rawSenses
            .whereType<Map>()
            .map((entry) =>
                VocabSense.fromJson(Map<String, dynamic>.from(entry)))
            .where((entry) => entry.meaning.isNotEmpty)
            .toList(growable: false)
        : <VocabSense>[];
    return VocabItem(
      id: '${json['id'] ?? ''}',
      word: '${json['word'] ?? ''}'.trim(),
      senses: senses,
      createdAt: DateTime.fromMillisecondsSinceEpoch(
        (json['createdAt'] as num?)?.toInt() ?? 0,
      ),
      updatedAt: DateTime.fromMillisecondsSinceEpoch(
        (json['updatedAt'] as num?)?.toInt() ?? 0,
      ),
      totalSeen: (json['totalSeen'] as num?)?.toInt() ?? 0,
      totalCorrect: (json['totalCorrect'] as num?)?.toInt() ?? 0,
    );
  }

  final String id;
  final String word;
  final List<VocabSense> senses;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int totalSeen;
  final int totalCorrect;

  String get normalizedWord => normalizeVocabWord(word);

  VocabItem copyWith({
    String? word,
    List<VocabSense>? senses,
    DateTime? updatedAt,
    int? totalSeen,
    int? totalCorrect,
  }) {
    return VocabItem(
      id: id,
      word: word ?? this.word,
      senses: senses ?? this.senses,
      createdAt: createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      totalSeen: totalSeen ?? this.totalSeen,
      totalCorrect: totalCorrect ?? this.totalCorrect,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'word': word,
        'senses': senses.map((sense) => sense.toJson()).toList(),
        'createdAt': createdAt.millisecondsSinceEpoch,
        'updatedAt': updatedAt.millisecondsSinceEpoch,
        'totalSeen': totalSeen,
        'totalCorrect': totalCorrect,
      };

  static String encodeList(List<VocabItem> items) {
    return jsonEncode(items.map((item) => item.toJson()).toList());
  }

  static List<VocabItem> decodeList(String source) {
    final decoded = jsonDecode(source);
    if (decoded is! List) return const [];
    return decoded
        .whereType<Map>()
        .map((entry) => VocabItem.fromJson(Map<String, dynamic>.from(entry)))
        .where((item) =>
            item.id.isNotEmpty &&
            item.word.isNotEmpty &&
            item.senses.isNotEmpty)
        .toList(growable: false);
  }
}

class VocabWordSuggestion {
  const VocabWordSuggestion({required this.word, required this.display});

  factory VocabWordSuggestion.fromJson(Map<String, dynamic> json) {
    return VocabWordSuggestion(
      word: normalizeVocabWord('${json['word'] ?? ''}'),
      display: '${json['display'] ?? json['word'] ?? ''}'.trim(),
    );
  }

  final String word;
  final String display;
}

class VocabLookupResult {
  const VocabLookupResult({
    required this.senses,
    this.suggestions = const [],
  });

  final List<VocabSense> senses;
  final List<VocabWordSuggestion> suggestions;
}
