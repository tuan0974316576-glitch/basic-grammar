import 'dart:convert';

String normalizeVocabWord(String value) {
  return value
      .trim()
      .replaceAll(RegExp('[\u2018\u2019]'), "'")
      .replaceAll(RegExp('[\u2010-\u2015]'), '-')
      .replaceAll(RegExp(r'\s+'), ' ')
      .toLowerCase();
}

/// Student-facing vocabulary uses sentence-style lowercase for ordinary
/// words. Keep names and established proper-name phrases capitalised.
String displayVocabWord(String value) {
  var source = value.trim().replaceAll(RegExp(r'\s+'), ' ');
  if (source.isEmpty) return '';
  // POS belongs on the meaning line, never in the English headword. Older
  // teacher/live rows occasionally stored labels such as `rather (adv)` in
  // their display field, so clean those labels at every read boundary.
  source = source
      .replaceFirst(
        RegExp(
          r'\s*\((?:n|v|adj|adv|prep|conj|pron|det|modal\s*v|aux|exclam|num|ph|pt)\.?\)\s*$',
          caseSensitive: false,
        ),
        '',
      )
      .trim();
  if (source.isEmpty) return '';
  final key = source.toLowerCase();
  if (_properVocabNames.contains(key)) return source;
  final words = source.split(' ');
  final hasInteriorCapital = words.skip(1).any((word) {
    final letter = word.replaceFirst(RegExp(r'^[^A-Za-z]*'), '');
    return letter.isNotEmpty && letter[0] == letter[0].toUpperCase();
  });
  return hasInteriorCapital ? source : source.toLowerCase();
}

const _properVocabNames = <String>{
  'hong kong',
  'new york',
  'la tomatina',
  'la tomatina festival',
  'my neighbour totoro',
  'mtr',
  'english',
  'chinese',
  'japanese',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
};

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

List<String> splitVocabMeaningParts(String value) {
  final seen = <String>{};
  final parts = <String>[];
  for (final part in normalizeVocabMeaning(value).split(' / ')) {
    final meaning = part.trim();
    final key = normalizeMeaningKey(meaning);
    if (meaning.isNotEmpty && key.isNotEmpty && seen.add(key)) {
      parts.add(meaning);
    }
  }
  return parts;
}

bool vocabSenseCovers(VocabSense existing, VocabSense candidate) {
  if (!_sameVocabSenseCategory(existing, candidate)) return false;
  final existingParts =
      splitVocabMeaningParts(existing.meaning).map(normalizeMeaningKey).toSet();
  final candidateParts = splitVocabMeaningParts(candidate.meaning)
      .map(normalizeMeaningKey)
      .toSet();
  return candidateParts.isNotEmpty && existingParts.containsAll(candidateParts);
}

/// Removes repeated glosses such as `巨大的 / 大量的` plus another `巨大的`
/// sense for the same word, POS, and type.
List<VocabSense> dedupeVocabSenses(Iterable<VocabSense> senses) {
  final deduped = <VocabSense>[];
  for (final rawSense in senses) {
    if (rawSense.meaning.trim().isEmpty) continue;
    var candidate = rawSense;
    var index = 0;
    while (index < deduped.length) {
      final existing = deduped[index];
      if (!_sameVocabSenseCategory(existing, candidate)) {
        index += 1;
        continue;
      }
      final existingKeys = splitVocabMeaningParts(existing.meaning)
          .map(normalizeMeaningKey)
          .toSet();
      final candidateKeys = splitVocabMeaningParts(candidate.meaning)
          .map(normalizeMeaningKey)
          .toSet();
      if (existingKeys.intersection(candidateKeys).isEmpty) {
        index += 1;
        continue;
      }
      candidate = _mergeVocabSenses(existing, candidate);
      deduped.removeAt(index);
      index = 0;
    }
    deduped.add(candidate);
  }
  return deduped.toList(growable: false);
}

List<VocabSense> normalizeVocabSensesForWord(
  Iterable<VocabSense> senses, {
  required String word,
  String display = '',
}) {
  final parentWord = normalizeVocabWord(word);
  final parentDisplay = displayVocabWord(display.isEmpty ? word : display);
  return dedupeVocabSenses(senses.map((sense) {
    final senseWord = normalizeVocabWord(sense.word);
    final effectiveWord = senseWord.isEmpty ? parentWord : senseWord;
    final effectiveDisplay = displayVocabWord(
      sense.display.isEmpty
          ? (parentDisplay.isEmpty ? effectiveWord : parentDisplay)
          : sense.display,
    );
    final effectiveType = sense.type.trim().toLowerCase().isEmpty
        ? 'word'
        : sense.type.trim().toLowerCase();
    final effectivePos = sense.pos.trim().toLowerCase();
    final effectiveId = sense.id.trim().isNotEmpty
        ? sense.id.trim()
        : sense.sourceEntryId.trim().isNotEmpty
            ? sense.sourceEntryId.trim()
            : [
                effectiveWord,
                effectivePos,
                effectiveType,
                normalizeMeaningKey(sense.meaning),
              ].join('|');
    return VocabSense(
      id: effectiveId,
      word: effectiveWord,
      display: effectiveDisplay,
      meaning: normalizeVocabMeaning(sense.meaning),
      pos: effectivePos,
      type: effectiveType,
      level: sense.level,
      source: sense.source,
      sourceEntryId: sense.sourceEntryId,
    );
  }));
}

VocabItem normalizeSavedVocabItem(VocabItem item) {
  final display = displayVocabWord(item.word);
  return item.copyWith(
    word: display,
    senses: normalizeVocabSensesForWord(
      item.senses,
      word: display,
      display: display,
    ),
  );
}

bool _sameVocabSenseCategory(VocabSense left, VocabSense right) {
  return normalizeVocabWord(left.word) == normalizeVocabWord(right.word) &&
      left.pos.trim().toLowerCase() == right.pos.trim().toLowerCase() &&
      left.type.trim().toLowerCase() == right.type.trim().toLowerCase();
}

VocabSense _mergeVocabSenses(VocabSense left, VocabSense right) {
  final parts = <String>[];
  final seen = <String>{};
  for (final part in [
    ...splitVocabMeaningParts(left.meaning),
    ...splitVocabMeaningParts(right.meaning),
  ]) {
    if (seen.add(normalizeMeaningKey(part))) parts.add(part);
  }
  return VocabSense(
    id: left.id.isNotEmpty ? left.id : right.id,
    word: left.word.isNotEmpty ? left.word : right.word,
    display: left.display.isNotEmpty ? left.display : right.display,
    meaning: parts.join(' / '),
    pos: left.pos.isNotEmpty ? left.pos : right.pos,
    type: left.type.isNotEmpty ? left.type : right.type,
    level: left.level.isNotEmpty ? left.level : right.level,
    source: left.source.isNotEmpty ? left.source : right.source,
    sourceEntryId: left.sourceEntryId.isNotEmpty
        ? left.sourceEntryId
        : right.sourceEntryId,
  );
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

  factory VocabSense.fromJson(
    Map<String, dynamic> json, {
    String fallbackWord = '',
    String fallbackDisplay = '',
    String fallbackPos = '',
    String fallbackType = 'word',
  }) {
    final rawWord = '${json['word'] ?? ''}'.trim();
    final word = normalizeVocabWord(rawWord.isEmpty ? fallbackWord : rawWord);
    final rawDisplay = '${json['display'] ?? ''}'.trim();
    final display = displayVocabWord(
      rawDisplay.isNotEmpty
          ? rawDisplay
          : rawWord.isNotEmpty
              ? rawWord
              : fallbackDisplay.isNotEmpty
                  ? fallbackDisplay
                  : word,
    );
    final meaning = normalizeVocabMeaning('${json['meaning'] ?? ''}');
    final pos = '${json['pos'] ?? ''}'.trim().toLowerCase();
    final type = '${json['type'] ?? ''}'.trim().toLowerCase();
    final sourceEntryId = '${json['sourceEntryId'] ?? ''}'.trim();
    final rawId = '${json['id'] ?? ''}'.trim();
    final effectivePos = pos.isEmpty ? fallbackPos.trim().toLowerCase() : pos;
    final effectiveType = type.isEmpty
        ? (fallbackType.trim().toLowerCase().isEmpty
            ? 'word'
            : fallbackType.trim().toLowerCase())
        : type;
    return VocabSense(
      id: rawId.isNotEmpty
          ? rawId
          : sourceEntryId.isNotEmpty
              ? sourceEntryId
              : [
                  word,
                  effectivePos,
                  effectiveType,
                  normalizeMeaningKey(meaning)
                ].join('|'),
      word: word,
      display: display,
      meaning: meaning,
      pos: effectivePos,
      type: effectiveType,
      level: '${json['level'] ?? ''}'.trim().toUpperCase(),
      source: '${json['source'] ?? ''}'.trim(),
      sourceEntryId: sourceEntryId,
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
    this.reviewMastered = false,
    this.listeningMastered = false,
    this.spellingMastered = false,
    this.speakingMastered = false,
  });

  factory VocabItem.fromJson(Map<String, dynamic> json) {
    final itemWord = displayVocabWord('${json['word'] ?? ''}');
    final normalizedItemWord = normalizeVocabWord(itemWord);
    final itemDisplay = displayVocabWord('${json['display'] ?? itemWord}');
    final rawSenses = json['senses'] ?? json['meanings'];
    final senses = rawSenses is List
        ? rawSenses
            .whereType<Map>()
            .map((entry) => VocabSense.fromJson(
                  Map<String, dynamic>.from(entry),
                  fallbackWord: normalizedItemWord,
                  fallbackDisplay: itemDisplay,
                  fallbackPos: '${json['pos'] ?? ''}',
                  fallbackType: '${json['type'] ?? 'word'}',
                ))
            .where((entry) => entry.meaning.isNotEmpty)
            .toList(growable: false)
        : <VocabSense>[];
    return VocabItem(
      id: '${json['id'] ?? ''}',
      word: itemWord,
      senses: normalizeVocabSensesForWord(
        senses,
        word: normalizedItemWord,
        display: itemDisplay,
      ),
      createdAt: DateTime.fromMillisecondsSinceEpoch(
        (json['createdAt'] as num?)?.toInt() ?? 0,
      ),
      updatedAt: DateTime.fromMillisecondsSinceEpoch(
        (json['updatedAt'] as num?)?.toInt() ?? 0,
      ),
      totalSeen: (json['totalSeen'] as num?)?.toInt() ?? 0,
      totalCorrect: (json['totalCorrect'] as num?)?.toInt() ?? 0,
      reviewMastered: json.containsKey('reviewMastered')
          ? json['reviewMastered'] == true
          : ((json['totalSeen'] as num?)?.toInt() ?? 0) > 0 &&
              ((json['totalCorrect'] as num?)?.toInt() ?? 0) >=
                  ((json['totalSeen'] as num?)?.toInt() ?? 0),
      listeningMastered: json['listeningMastered'] == true,
      spellingMastered: json['spellingMastered'] == true,
      speakingMastered: json['speakingMastered'] == true,
    );
  }

  final String id;
  final String word;
  final List<VocabSense> senses;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int totalSeen;
  final int totalCorrect;
  final bool reviewMastered;
  final bool listeningMastered;
  final bool spellingMastered;
  final bool speakingMastered;

  String get normalizedWord => normalizeVocabWord(word);
  bool get isDueForReview => totalSeen == 0 || !reviewMastered;

  VocabItem copyWith({
    String? word,
    List<VocabSense>? senses,
    DateTime? updatedAt,
    int? totalSeen,
    int? totalCorrect,
    bool? reviewMastered,
    bool? listeningMastered,
    bool? spellingMastered,
    bool? speakingMastered,
  }) {
    return VocabItem(
      id: id,
      word: word ?? this.word,
      senses: senses ?? this.senses,
      createdAt: createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      totalSeen: totalSeen ?? this.totalSeen,
      totalCorrect: totalCorrect ?? this.totalCorrect,
      reviewMastered: reviewMastered ?? this.reviewMastered,
      listeningMastered: listeningMastered ?? this.listeningMastered,
      spellingMastered: spellingMastered ?? this.spellingMastered,
      speakingMastered: speakingMastered ?? this.speakingMastered,
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
        'reviewMastered': reviewMastered,
        'listeningMastered': listeningMastered,
        'spellingMastered': spellingMastered,
        'speakingMastered': speakingMastered,
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

/// Vocabulary-book order is based on when a word was added. `updatedAt` can
/// change after a review or cloud merge, but it must not move a word into a
/// different calendar-date section in the book.
int compareVocabItemsByRecentCreation(VocabItem left, VocabItem right) {
  final created = right.createdAt.compareTo(left.createdAt);
  if (created != 0) return created;
  final updated = right.updatedAt.compareTo(left.updatedAt);
  return updated != 0
      ? updated
      : left.normalizedWord.compareTo(right.normalizedWord);
}

class VocabWordSuggestion {
  const VocabWordSuggestion({required this.word, required this.display});

  factory VocabWordSuggestion.fromJson(Map<String, dynamic> json) {
    return VocabWordSuggestion(
      word: normalizeVocabWord('${json['word'] ?? ''}'),
      display: displayVocabWord('${json['display'] ?? json['word'] ?? ''}'),
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
