import 'dart:convert';

import 'grammar_workshop_answer_overrides.dart';

enum GrammarWorkshopKind { verb, fill, choice, rearrange, synonym }

enum GrammarWorkshopSource { bundle, cache, online }

const grammarWorkshopTopicOrder = <String>[
  'VERB_TABLE',
  'TENSES',
  'PRONOUN',
  'COMPARATIVE_SUPERLATIVE',
  'PREPOSITION_OF_PLACE',
  'PREPOSITION_OF_TIME',
  'INFINITIVE_GERUND',
  'DIRECT_QUESTION',
  'INDIRECT_QUESTION',
  'IT_IS',
  'CONDITIONAL',
  'REPORTED_SPEECH',
  'PARTICIPLE_PHRASES',
  'INVERSION',
  'QUESTION_TAG',
  'DE_STRUCTURE',
  'COMPOUND_ADJ',
  'PHRASAL_VERB',
  'DSE_SYNONYM',
];

const grammarWorkshopChineseLabels = <String, String>{
  'VERB_TABLE': '動詞四式',
  'TENSES': '時態',
  'PRONOUN': '代名詞',
  'COMPARATIVE_SUPERLATIVE': '比較級與最高級',
  'PREPOSITION_OF_PLACE': '地方介詞',
  'PREPOSITION_OF_TIME': '時間介詞',
  'INFINITIVE_GERUND': '不定詞與動名詞',
  'DIRECT_QUESTION': '直接問句',
  'INDIRECT_QUESTION': '間接問句',
  'IT_IS': 'It is 句式',
  'CONDITIONAL': '條件句',
  'REPORTED_SPEECH': '轉述句',
  'PARTICIPLE_PHRASES': '分詞片語',
  'INVERSION': '倒裝句',
  'QUESTION_TAG': '附加問句',
  'DE_STRUCTURE': '描述名詞的方法',
  'COMPOUND_ADJ': '形容詞配搭',
  'PHRASAL_VERB': '片語動詞',
  'DSE_SYNONYM': 'DSE 同義詞',
};

class GrammarWorkshopBank {
  const GrammarWorkshopBank({
    required this.releaseId,
    required this.version,
    required this.hash,
    required this.publishedAt,
    required this.topics,
    required this.source,
    this.syncError,
  });

  factory GrammarWorkshopBank.fromPackage(
    Map<String, dynamic> package, {
    required GrammarWorkshopSource source,
  }) {
    final manifest = _map(package['manifest']);
    final rawTopics = _map(package['topics']);
    final releaseId = '${manifest['releaseId'] ?? ''}'.trim();
    if (releaseId.isEmpty || rawTopics.isEmpty) {
      throw const FormatException('Grammar release is incomplete.');
    }
    final manifestTopics = _map(manifest['topics']);
    final topicKeys = <String>[
      ...grammarWorkshopTopicOrder.where(rawTopics.containsKey),
      ...rawTopics.keys.where(
        (key) => !grammarWorkshopTopicOrder.contains(key),
      ),
    ];
    final topics = <GrammarWorkshopTopic>[];
    for (final key in topicKeys) {
      final rawTopic = _map(rawTopics[key]);
      final expected = _map(manifestTopics[key]);
      final topic = GrammarWorkshopTopic.fromJson(key, rawTopic);
      final expectedCount = (expected['count'] as num?)?.toInt();
      if (expectedCount != null && expectedCount != topic.questions.length) {
        throw FormatException('$key question count does not match manifest.');
      }
      final expectedHash = '${expected['hash'] ?? ''}'.trim();
      if (expectedHash.isNotEmpty) {
        final rawQuestions = _orderedRawQuestions(rawTopic);
        final actualHash = grammarWorkshopContentHash(rawQuestions);
        if (actualHash != expectedHash) {
          throw FormatException('$key question hash does not match manifest.');
        }
      }
      topics.add(topic);
    }
    return GrammarWorkshopBank(
      releaseId: releaseId,
      version: (manifest['version'] as num?)?.toInt() ?? 0,
      hash: '${manifest['hash'] ?? ''}',
      publishedAt: DateTime.fromMillisecondsSinceEpoch(
        (manifest['publishedAt'] as num?)?.toInt() ?? 0,
      ),
      topics: topics,
      source: source,
    );
  }

  final String releaseId;
  final int version;
  final String hash;
  final DateTime publishedAt;
  final List<GrammarWorkshopTopic> topics;
  final GrammarWorkshopSource source;
  final String? syncError;

  int get questionCount =>
      topics.fold(0, (total, topic) => total + topic.questions.length);

  GrammarWorkshopBank copyWith({
    GrammarWorkshopSource? source,
    String? syncError,
    bool clearSyncError = false,
  }) {
    return GrammarWorkshopBank(
      releaseId: releaseId,
      version: version,
      hash: hash,
      publishedAt: publishedAt,
      topics: topics,
      source: source ?? this.source,
      syncError: clearSyncError ? null : (syncError ?? this.syncError),
    );
  }
}

class GrammarWorkshopTopic {
  const GrammarWorkshopTopic({
    required this.key,
    required this.label,
    required this.chineseLabel,
    required this.kind,
    required this.questions,
  });

  factory GrammarWorkshopTopic.fromJson(
    String key,
    Map<String, dynamic> json,
  ) {
    final kind = switch ('${json['kind'] ?? ''}') {
      'verb' => GrammarWorkshopKind.verb,
      'fill' => GrammarWorkshopKind.fill,
      'choice' => GrammarWorkshopKind.choice,
      'rearrange' => GrammarWorkshopKind.rearrange,
      'synonym' => GrammarWorkshopKind.synonym,
      _ => throw FormatException('$key has an unknown question kind.'),
    };
    return GrammarWorkshopTopic(
      key: key,
      label: '${json['label'] ?? key}'.trim(),
      chineseLabel: grammarWorkshopChineseLabels[key] ?? key,
      kind: kind,
      questions: _orderedRawQuestions(json)
          .map((raw) => GrammarWorkshopQuestion.fromJson(kind, key, raw))
          .toList(growable: false),
    );
  }

  final String key;
  final String label;
  final String chineseLabel;
  final GrammarWorkshopKind kind;
  final List<GrammarWorkshopQuestion> questions;
}

class GrammarWorkshopQuestion {
  const GrammarWorkshopQuestion({
    required this.id,
    required this.topicKey,
    required this.kind,
    required this.chinese,
    required this.prompt,
    required this.answers,
    required this.answerSlots,
    required this.options,
    required this.correctIndex,
    this.acceptedAnswers = const [],
    required this.correctTokenSets,
    required this.distractors,
    required this.explanation,
    required this.present,
    required this.past,
    required this.pp,
    required this.ing,
  });

  factory GrammarWorkshopQuestion.fromJson(
    GrammarWorkshopKind kind,
    String topicKey,
    Map<String, dynamic> json,
  ) {
    final synonymWords = kind == GrammarWorkshopKind.synonym
        ? (json['words'] is List
            ? (json['words'] as List)
                .whereType<Map>()
                .map((word) => '${word['text'] ?? ''}'.trim())
                .where((word) => word.isNotEmpty)
                .toList(growable: false)
            : const <String>[])
        : const <String>[];
    final questionId = '${json['id'] ?? ''}'.trim();
    final reviewedChoice =
        grammarWorkshopChoiceAnswerOverrides['$topicKey/$questionId'];
    final sourceAnswers = kind == GrammarWorkshopKind.synonym
        ? synonymWords
        : _strings(json['answers']);
    final answerKeys = <String>{};
    final answers = [
      ...sourceAnswers,
      if (topicKey == 'QUESTION_TAG')
        ...sourceAnswers.map(_formalQuestionTag).whereType<String>(),
      ...?reviewedChoice?.acceptedAnswers,
    ].where((answer) {
      return answerKeys.add(normalizeGrammarWorkshopAnswer(answer));
    }).toList(growable: false);
    final acceptedAnswerKeys = <String>{};
    final acceptedAnswers = [
      ..._strings(json['acceptedAnswers']),
      ...?reviewedChoice?.acceptedAnswers,
    ].where((answer) {
      return acceptedAnswerKeys.add(normalizeGrammarWorkshopAnswer(answer));
    }).toList(growable: false);
    final slots = _strings(json['answerSlots']);
    final sourceTokenSets = <List<String>>[
      ..._tokenSets(json['correct_tokens']),
      ..._tokenSets(json['accepted']),
      ..._tokenSets(json['accepted_tokens']),
      ...?reviewedChoice?.acceptedTokenSets,
    ];
    final tokenSets = _withReviewedTokenVariants(
      topicKey,
      json,
      sourceTokenSets,
    );
    return GrammarWorkshopQuestion(
      id: questionId,
      topicKey: topicKey,
      kind: kind,
      chinese: reviewedChoice?.chinese ??
          '${json['chinese'] ?? json['meaning'] ?? ''}'.trim(),
      prompt: reviewedChoice?.question ??
          '${json['question'] ?? json['source_prompt'] ?? ''}'.trim(),
      answers: answers,
      answerSlots: slots,
      options: kind == GrammarWorkshopKind.synonym
          ? synonymWords
          : _strings(json['options']),
      correctIndex: (json['correctIndex'] as num?)?.toInt() ?? -1,
      acceptedAnswers: acceptedAnswers,
      correctTokenSets: tokenSets,
      distractors: _strings(json['distractors']),
      explanation: reviewedChoice?.explanation ??
          _questionExplanation(topicKey, json, tokenSets),
      present: reviewedChoice?.present ?? '${json['present'] ?? ''}'.trim(),
      past: reviewedChoice?.past ?? '${json['past'] ?? ''}'.trim(),
      pp: reviewedChoice?.pp ?? '${json['pp'] ?? ''}'.trim(),
      ing: reviewedChoice?.ing ?? '${json['pg'] ?? json['ing'] ?? ''}'.trim(),
    );
  }

  final String id;
  final String topicKey;
  final GrammarWorkshopKind kind;
  final String chinese;
  final String prompt;
  final List<String> answers;
  final List<String> answerSlots;
  final List<String> options;
  final int correctIndex;
  final List<String> acceptedAnswers;
  final List<List<String>> correctTokenSets;
  final List<String> distractors;
  final String explanation;
  final String present;
  final String past;
  final String pp;
  final String ing;

  int get responseFieldCount => answerSlots.isEmpty ? 1 : answerSlots.length;

  List<String> get verbForms => [present, past, pp, ing];

  bool isAcceptedChoice(int index) {
    if (index < 0 || index >= options.length) return false;
    if (index == correctIndex) return true;
    final option = normalizeGrammarWorkshopAnswer(options[index]);
    return acceptedAnswers.map(normalizeGrammarWorkshopAnswer).contains(option);
  }

  List<String> get acceptedChoiceAnswers {
    final values = <String>[
      if (correctIndex >= 0 && correctIndex < options.length)
        options[correctIndex],
      ...acceptedAnswers,
    ];
    final seen = <String>{};
    return values
        .where((value) => seen.add(normalizeGrammarWorkshopAnswer(value)))
        .toList(growable: false);
  }

  String get correctAnswerText {
    return switch (kind) {
      GrammarWorkshopKind.verb => verbForms.join(' / '),
      GrammarWorkshopKind.choice => acceptedChoiceAnswers.join(' / '),
      GrammarWorkshopKind.rearrange => correctTokenSets.isEmpty
          ? ''
          : grammarWorkshopTokensToSentence(correctTokenSets.first),
      GrammarWorkshopKind.fill => answerSlots.length == 1 && answers.length > 1
          ? answers.join(' / ')
          : answerSlots.isNotEmpty
              ? answerSlots.join(' / ')
              : answers.join(' / '),
      GrammarWorkshopKind.synonym => answers.join(' / '),
    };
  }
}

List<List<String>> _withReviewedTokenVariants(
  String topicKey,
  Map<String, dynamic> json,
  List<List<String>> source,
) {
  final variants = <List<String>>[
    ...source.map((tokens) => [...tokens]),
  ];
  if (topicKey == 'INDIRECT_QUESTION' && '${json['rule'] ?? ''}' != '5') {
    for (final tokens in source) {
      final index = tokens.indexWhere(
        (token) => normalizeGrammarWorkshopAnswer(token) == 'whether',
      );
      if (index < 0) continue;
      final previous =
          index == 0 ? '' : normalizeGrammarWorkshopAnswer(tokens[index - 1]);
      final next = index >= tokens.length - 1
          ? ''
          : normalizeGrammarWorkshopAnswer(tokens[index + 1]);
      if (previous == 'about' || next == 'to') continue;
      final replacement = [...tokens]..[index] = 'if';
      variants.add(replacement);
    }
  }
  if (topicKey == 'CONDITIONAL' &&
      '${json['type'] ?? json['rule'] ?? ''}' == '2') {
    for (final tokens in source) {
      final nowIndex = tokens.indexWhere(
        (token) => normalizeGrammarWorkshopAnswer(token) == 'now',
      );
      final commaIndex = tokens.indexOf(',');
      if (nowIndex < 0 || commaIndex < 0) continue;
      final moved = [...tokens]..removeAt(nowIndex);
      if (nowIndex < commaIndex) {
        final endIndex = moved.indexOf('.');
        moved.insert(endIndex < 0 ? moved.length : endIndex, 'now');
      } else {
        moved.insert(moved.indexOf(','), 'now');
      }
      variants.add(moved);
    }
  }
  if (topicKey == 'CONDITIONAL') {
    for (final tokens in [...variants]) {
      final commaIndex = tokens.indexOf(',');
      if (commaIndex <= 0 || commaIndex >= tokens.length - 1) continue;
      final periodIndex = tokens.lastIndexOf('.');
      final firstClause = tokens.sublist(0, commaIndex);
      final secondClause = tokens.sublist(
        commaIndex + 1,
        periodIndex > commaIndex ? periodIndex : tokens.length,
      );
      if (firstClause.isEmpty || secondClause.isEmpty) continue;
      variants.add([...secondClause, ...firstClause, '.']);
    }
  }
  if (topicKey == 'REPORTED_SPEECH') {
    final type = '${json['type'] ?? ''}';
    for (final tokens in source) {
      if (type == 'statement') {
        final saidIndex = tokens.indexWhere(
          (token) => normalizeGrammarWorkshopAnswer(token) == 'said',
        );
        if (saidIndex >= 0 &&
            saidIndex < tokens.length - 1 &&
            normalizeGrammarWorkshopAnswer(tokens[saidIndex + 1]) != 'that') {
          variants.add([...tokens]..insert(saidIndex + 1, 'that'));
        }
      }
      if (type == 'question') {
        for (final pair in const [('if', 'whether'), ('whether', 'if')]) {
          final index = tokens.indexWhere(
            (token) => normalizeGrammarWorkshopAnswer(token) == pair.$1,
          );
          if (index < 0) continue;
          variants.add([...tokens]..[index] = pair.$2);
        }
      }
    }
  }
  if (topicKey == 'PARTICIPLE_PHRASES') {
    for (final tokens in source) {
      final commaIndex = tokens.indexOf(',');
      final periodIndex = tokens.lastIndexOf('.');
      if (commaIndex <= 0 || periodIndex <= commaIndex) continue;
      final phrase = tokens.sublist(0, commaIndex);
      final mainClause = tokens.sublist(commaIndex + 1, periodIndex);
      variants.add([...mainClause, ',', ...phrase, '.']);
    }
  }
  if (topicKey == 'DE_STRUCTURE') {
    variants.addAll(_deStructureVariants(json, source));
  }
  final seen = <String>{};
  return variants.where((tokens) {
    return seen.add(
      normalizeGrammarWorkshopAnswer(grammarWorkshopTokensToSentence(tokens)),
    );
  }).toList(growable: false);
}

List<List<String>> _deStructureVariants(
  Map<String, dynamic> json,
  List<List<String>> source,
) {
  final category = '${json['category'] ?? json['rule'] ?? ''}';
  final id = '${json['id'] ?? ''}';
  final variants = <List<String>>[];
  for (final tokens in source) {
    if (category == 'simple_adjective' && tokens.length >= 5) {
      final conjunctionIndex = tokens.indexWhere(
        (token) => token == 'and' || token == 'but',
      );
      if (conjunctionIndex > 1 && conjunctionIndex < tokens.length - 2) {
        final swapped = [...tokens];
        final left = swapped[conjunctionIndex - 1];
        swapped[conjunctionIndex - 1] = swapped[conjunctionIndex + 1];
        swapped[conjunctionIndex + 1] = left;
        variants.add(swapped);
      }
    }
    if (category == 'with') {
      final index = tokens.indexOf('with');
      if (index >= 0) variants.add([...tokens]..[index] = 'having');
    }
    if (category == 'without') {
      final index = tokens.indexOf('without');
      if (index >= 0 && index < tokens.length - 1) {
        final tail = tokens.sublist(index + 1);
        if (tail.isNotEmpty &&
            {'a', 'an', 'any'}.contains(tail.first.toLowerCase())) {
          tail.removeAt(0);
        }
        variants.add([...tokens.sublist(0, index), 'having', 'no', ...tail]);
      }
    }
    if ({'modal_relative', 'active_relative'}.contains(category) ||
        (category == 'passive_relative' &&
            tokens.any(
                (token) => {'who', 'which'}.contains(token.toLowerCase())))) {
      final index = tokens.indexWhere(
        (token) => {'who', 'which'}.contains(token.toLowerCase()),
      );
      if (index >= 0) variants.add([...tokens]..[index] = 'that');
    }
    if (category == 'object_relative' && tokens.length > 2) {
      variants.add([...tokens]..insert(2, 'that'));
    }
    if (category == 'passive_relative' &&
        !tokens.any((token) =>
            {'who', 'which', 'that'}.contains(token.toLowerCase()))) {
      final headEnd = tokens.first == 'Chairs' ? 1 : 2;
      final plural = tokens.first == 'Chairs' || tokens.first == 'Some';
      final person = id == 'de_structure_052';
      final relative = person ? 'who' : 'which';
      final be = plural ? 'were' : 'was';
      variants.add([
        ...tokens.sublist(0, headEnd),
        relative,
        be,
        ...tokens.sublist(headEnd),
      ]);
      variants.add([
        ...tokens.sublist(0, headEnd),
        'that',
        be,
        ...tokens.sublist(headEnd),
      ]);
    }
    if (category == 'compound_relative') {
      final headEnd = tokens.first == 'Students' ? 1 : 2;
      final person = tokens.take(headEnd).any(
            (token) => {'student', 'students'}.contains(token.toLowerCase()),
          );
      final plural = tokens.first == 'Students';
      variants.add([
        ...tokens.sublist(0, headEnd),
        person ? 'who' : 'which',
        plural ? 'are' : 'is',
        ...tokens.sublist(headEnd),
      ]);
      variants.add([
        ...tokens.sublist(0, headEnd),
        'that',
        plural ? 'are' : 'is',
        ...tokens.sublist(headEnd),
      ]);
    }
  }
  const manual = <String, List<String>>{
    'de_structure_015': ['The', 'father', 'of', 'Tom'],
    'de_structure_016': ['The', 'aims', 'of', 'many', 'students'],
    'de_structure_017': ['The', 'account', 'of', 'my', 'father'],
    'de_structure_018': ['The', 'parents', 'of', 'those', 'children'],
    'de_structure_019': ['The', 'glasses', 'of', 'Tom'],
    'de_structure_020': ['The', 'dreams', 'of', 'many', 'students'],
    'de_structure_059': ["Yesterday's", 'meeting'],
    'de_structure_060': ["Today's", 'weather'],
    'de_structure_061': ["Tomorrow's", 'game'],
    'de_structure_062': ["Last", "night's", 'show'],
    'de_structure_063': ["Tomorrow's", 'exam'],
    'de_structure_064': ["Japan's", 'weather'],
    'de_structure_065': ['Tsuen', 'Wan', 'restaurants'],
    'de_structure_068': ['Airport', 'restaurants'],
    'de_structure_073': ['This', "computer's", 'price'],
    'de_structure_074': ['Those', "fruits'", 'colours'],
    'de_structure_075': ['This', "phone's", 'screen'],
    'de_structure_076': ['This', "chair's", 'design'],
    'de_structure_077': ['This', "jacket's", 'brand'],
  };
  final manualVariant = manual[id];
  if (manualVariant != null) variants.add(manualVariant);
  if (category == 'about') {
    for (final tokens in source) {
      final index = tokens.indexOf('about');
      if (index >= 0) variants.add([...tokens]..[index] = 'on');
    }
  }
  return variants;
}

String? _formalQuestionTag(String answer) {
  final normalized = answer
      .trim()
      .replaceAll(RegExp('[\u2018\u2019]'), "'")
      .replaceAll(RegExp(r'\s+'), ' ')
      .toLowerCase();
  final parts = normalized.split(' ');
  if (parts.length < 2) return null;
  const auxiliaries = <String, String>{
    "isn't": 'is',
    "aren't": 'are',
    "wasn't": 'was',
    "weren't": 'were',
    "won't": 'will',
    "can't": 'can',
    "couldn't": 'could',
    "shouldn't": 'should',
    "wouldn't": 'would',
    "haven't": 'have',
    "hasn't": 'has',
    "hadn't": 'had',
    "don't": 'do',
    "doesn't": 'does',
    "didn't": 'did',
  };
  final auxiliary = auxiliaries[parts.first];
  if (auxiliary == null) return null;
  final subject = parts.sublist(1).join(' ');
  if (parts.first == "aren't" && subject == 'i') return 'am I not';
  return '$auxiliary $subject not';
}

String normalizeGrammarWorkshopAnswer(String value) {
  var normalized = value
      .trim()
      .replaceAll(RegExp('[\u2018\u2019]'), "'")
      .replaceAll(RegExp(r'\s+'), ' ')
      .replaceAll(RegExp(r'\s+([,.!?;:])'), r'$1')
      .toLowerCase();
  const contractions = <String, String>{
    "won't": 'will not',
    "can't": 'cannot',
    "don't": 'do not',
    "doesn't": 'does not',
    "didn't": 'did not',
    "isn't": 'is not',
    "aren't": 'are not',
    "wasn't": 'was not',
    "weren't": 'were not',
    "haven't": 'have not',
    "hasn't": 'has not',
    "hadn't": 'had not',
    "wouldn't": 'would not',
    "shouldn't": 'should not',
    "couldn't": 'could not',
  };
  for (final entry in contractions.entries) {
    normalized = normalized.replaceAll(entry.key, entry.value);
  }
  return normalized
      .replaceAll(RegExp(r'\bcan not\b'), 'cannot')
      .replaceAll(RegExp(r'\blearnt\b'), 'learned')
      .replaceAll('analys', 'analyz')
      .replaceAll('organis', 'organiz')
      .replaceAll('practis', 'practic')
      .replaceAll('criticis', 'criticiz')
      .replaceAll(RegExp(r'\bhonour\b'), 'honor')
      .replaceAll(RegExp(r'\bcancelled\b'), 'canceled')
      .replaceAll(RegExp(r'\bcancelling\b'), 'canceling')
      .replaceAll(RegExp(r'\btravelled\b'), 'traveled')
      .replaceAll(RegExp(r'\btravelling\b'), 'traveling')
      .replaceAll(RegExp(r'\s+'), ' ')
      .trim();
}

String grammarWorkshopTokensToSentence(List<String> tokens) {
  return tokens
      .join(' ')
      .replaceAll(RegExp(r'\s+([,.!?;:])'), r'$1')
      .replaceAll(RegExp(r'([("“])\s+'), r'$1')
      .trim();
}

String grammarWorkshopTopicTeachingPoint(String topicKey) {
  return switch (topicKey) {
    'VERB_TABLE' => '動詞四式要分清現在式、過去式、過去分詞和 -ing 形式。',
    'TENSES' => '先找時間提示和主詞，再決定時態、主被動和動詞形式。',
    'PRONOUN' => '先判斷代名詞在句中的角色，再配對單複數和人物。',
    'COMPARATIVE_SUPERLATIVE' => '兩者比較用比較級；三者或以上通常用最高級。',
    'PREPOSITION_OF_PLACE' => '按位置是範圍、接觸面還是具體地點選擇介詞。',
    'PREPOSITION_OF_TIME' => '鐘點、日期和較長時段要配對不同時間介詞。',
    'INFINITIVE_GERUND' => '留意前一個動詞要求接 to-infinitive 還是 V-ing。',
    'DIRECT_QUESTION' => '直接問句通常用疑問詞、助動詞、主詞、動詞的次序。',
    'INDIRECT_QUESTION' => '間接問句使用陳述句語序，主詞要放在動詞前。',
    'IT_IS' => '留意 It is + 形容詞 + for/of + 人 + to 動詞 的句式。',
    'CONDITIONAL' => '先判斷條件句類型，再配對 if 子句和結果子句時態。',
    'REPORTED_SPEECH' => '轉述別人的說話時，要按語境改代名詞和時態。',
    'PARTICIPLE_PHRASES' => '分詞片語和主句必須共用同一個動作執行者。',
    'INVERSION' => '限制或否定字詞放句首時，助動詞通常移到主詞前。',
    'QUESTION_TAG' => '主句肯定通常配否定尾句；主句否定則配肯定尾句。',
    'DE_STRUCTURE' => '先找中心名詞，再安排形容詞、片語和關係子句位置。',
    'COMPOUND_ADJ' => '形容詞和介詞常有固定配搭，要連同例句一起記。',
    'PHRASAL_VERB' => '片語動詞要整組理解，不能只按單一動詞猜意思。',
    'DSE_SYNONYM' => '比較詞義、語氣和句子配搭，找出可互換的同義詞。',
    _ => '核對正確答案，留意句子結構和字詞配搭。',
  };
}

String grammarWorkshopContentHash(Object? value) {
  var high = 0xcbf29ce4;
  var low = 0x84222325;
  const mask = 0xffffffff;
  const lowPrime = 0x1b3;
  const highPrime = 0x100;
  const wordBase = 0x100000000;
  for (final byte in utf8.encode(_stableJson(value))) {
    low ^= byte;
    final lowProduct = low * lowPrime;
    final carry = lowProduct ~/ wordBase;
    high = (high * lowPrime + low * highPrime + carry) & mask;
    low = lowProduct & mask;
  }
  return '${high.toRadixString(16).padLeft(8, '0')}'
      '${low.toRadixString(16).padLeft(8, '0')}';
}

String _stableJson(Object? value) {
  if (value is Map) {
    final keys = value.keys.map((key) => '$key').toList()..sort();
    return '{${keys.map((key) => '${jsonEncode(key)}:${_stableJson(value[key])}').join(',')}}';
  }
  if (value is List) return '[${value.map(_stableJson).join(',')}]';
  return jsonEncode(value);
}

List<Map<String, dynamic>> _orderedRawQuestions(Map<String, dynamic> topic) {
  final raw = topic['questions'];
  final byId =
      raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{};
  final array = raw is List
      ? raw
          .whereType<Map>()
          .map((item) => Map<String, dynamic>.from(item))
          .toList()
      : <Map<String, dynamic>>[];
  final order = _strings(topic['order']);
  final values = array.isNotEmpty
      ? array
      : <Map<String, dynamic>>[
          ...order.where(byId.containsKey).map((id) => _map(byId[id])),
          ...byId.entries
              .where((entry) => !order.contains(entry.key))
              .map((entry) => _map(entry.value)),
        ];
  return values
      .where((question) => question['disabled'] != true)
      .toList(growable: false);
}

Map<String, dynamic> _map(Object? value) {
  return value is Map ? Map<String, dynamic>.from(value) : <String, dynamic>{};
}

List<String> _strings(Object? value) {
  return value is List
      ? value
          .map((item) => '$item'.trim())
          .where((item) => item.isNotEmpty)
          .toList()
      : const [];
}

List<List<String>> _tokenSets(Object? value) {
  if (value is! List || value.isEmpty) return const [];
  if (value.first is List) {
    return value
        .whereType<List>()
        .map(_strings)
        .where((tokens) => tokens.isNotEmpty)
        .toList(growable: false);
  }
  final tokens = _strings(value);
  return tokens.isEmpty ? const [] : [tokens];
}

String _questionExplanation(
  String topicKey,
  Map<String, dynamic> json,
  List<List<String>> tokenSets,
) {
  final supplied = '${json['explanation'] ?? json['exp'] ?? ''}'.trim();
  if (supplied.isNotEmpty) return supplied;
  return switch (topicKey) {
    'VERB_TABLE' => '記住現在式、過去式、過去分詞和 -ing 四種形式。',
    'DIRECT_QUESTION' => '直接問句通常用「疑問詞 + 助動詞 + 主詞 + 動詞」語序。',
    'INDIRECT_QUESTION' => '間接問句要改用陳述句語序，主詞放在動詞前面。',
    'IT_IS' => '留意 It is + 形容詞 + for/of + 人 + to 動詞 的句式。',
    'CONDITIONAL' => '先判斷條件句類型，再配對 if 子句和結果子句的時態。',
    'REPORTED_SPEECH' => '轉述別人的說話時，要按語境改代名詞和時態。',
    'PARTICIPLE_PHRASES' => '分詞片語要和主句共用同一個動作執行者。',
    'INVERSION' => '否定或限制字詞放句首時，助動詞要放到主詞前。',
    'DE_STRUCTURE' => '先找中心名詞，再把形容詞、片語或關係子句放到正確位置。',
    _ => tokenSets.isEmpty ? '核對正確答案和句子結構。' : '留意字詞次序和標點位置。',
  };
}
