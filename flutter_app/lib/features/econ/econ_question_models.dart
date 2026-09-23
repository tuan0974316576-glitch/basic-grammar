import 'dart:convert';

enum EconPaper { p1, p2 }

enum EconSourceMode { past, mock }

class EconChoice {
  const EconChoice({required this.id, required this.text});

  final String id;
  final String text;

  factory EconChoice.fromJson(Map<String, dynamic> json) {
    return EconChoice(
      id: json['id'] as String? ?? '',
      text: json['text'] as String? ?? '',
    );
  }
}

class EconQuestionPart {
  const EconQuestionPart({
    this.label,
    this.marks,
    this.prompt,
    this.modelAnswer,
    this.markingPoints = const [],
    this.rows,
    this.visuals = const [],
    this.answerVisuals = const [],
  });

  final String? label;
  final int? marks;
  final String? prompt;
  final String? modelAnswer;
  final List<String> markingPoints;
  final int? rows;
  final List<EconQuestionVisual> visuals;
  final List<EconQuestionVisual> answerVisuals;

  factory EconQuestionPart.fromJson(Map<String, dynamic> json) {
    return EconQuestionPart(
      label: json['label'] as String?,
      marks: (json['marks'] as num?)?.toInt(),
      prompt: json['prompt'] as String?,
      modelAnswer: json['modelAnswer'] as String?,
      markingPoints: _stringList(json['markingPoints']),
      rows: (json['rows'] as num?)?.toInt(),
      visuals: _visualList(json['visuals']),
      answerVisuals: _visualList(json['answerVisuals']),
    );
  }
}

class EconQuestionVisual {
  const EconQuestionVisual({
    required this.kind,
    this.src,
    this.alt,
    this.caption,
    this.title,
    this.body,
    this.text,
    this.note,
    this.showHeader,
    this.columns = const [],
    this.rows = const [],
    this.items = const [],
  });

  final String kind;
  final String? src;
  final String? alt;
  final String? caption;
  final String? title;
  final String? body;
  final String? text;
  final String? note;
  final bool? showHeader;
  final List<String> columns;
  final List<List<Object?>> rows;
  final List<String> items;

  factory EconQuestionVisual.fromJson(Map<String, dynamic> json) {
    return EconQuestionVisual(
      kind: json['kind'] as String? ?? 'text',
      src: json['src'] as String?,
      alt: json['alt'] as String?,
      caption: json['caption'] as String?,
      title: json['title'] as String?,
      body: json['body'] as String?,
      text: json['text'] as String?,
      note: json['note'] as String?,
      showHeader: json['showHeader'] as bool?,
      columns: _stringList(json['columns']),
      rows: json['rows'] is List
          ? (json['rows'] as List)
              .whereType<List>()
              .map((row) => row.cast<Object?>().toList(growable: false))
              .toList(growable: false)
          : const [],
      items: _stringList(json['items']),
    );
  }
}

class EconDiagramConfig {
  const EconDiagramConfig({
    required this.enabled,
    required this.kind,
    required this.mode,
    this.continuationKey,
    this.template,
    this.policy,
    this.requiresSplitPrice = false,
    this.requirements = const [],
    this.sourceSeed,
  });

  final bool enabled;
  final String kind;
  final String mode;
  final String? continuationKey;
  final String? template;
  final String? policy;
  final bool requiresSplitPrice;
  final List<Map<String, dynamic>> requirements;
  final Map<String, dynamic>? sourceSeed;

  factory EconDiagramConfig.fromJson(
    Map<String, dynamic> json, {
    String questionText = '',
  }) {
    final rawRequirements = json['requirements'];
    final explicitPolicy = json['policy'] as String?;
    final policy = explicitPolicy ?? _inferDiagramPolicy(questionText);
    return EconDiagramConfig(
      enabled: json['enabled'] == true,
      kind: json['kind'] as String? ?? 'demand-supply',
      mode: json['mode'] as String? ?? 'create',
      continuationKey: json['continuationKey'] as String?,
      template: json['template'] as String?,
      policy: policy,
      requiresSplitPrice: json.containsKey('requiresSplitPrice')
          ? json['requiresSplitPrice'] == true
          : _inferRequiresSplitPrice(questionText, policy),
      requirements: rawRequirements is List
          ? rawRequirements
              .whereType<Map>()
              .map((item) => Map<String, dynamic>.from(item))
              .toList(growable: false)
          : const [],
      sourceSeed: json['sourceSeed'] is Map
          ? Map<String, dynamic>.from(json['sourceSeed'] as Map)
          : null,
    );
  }
}

class EconQuestion {
  const EconQuestion({
    required this.id,
    required this.language,
    required this.chapterNo,
    required this.chapterTitle,
    required this.keyPoint,
    required this.paper,
    required this.year,
    required this.questionRef,
    required this.questionType,
    required this.stem,
    this.topicGroup,
    this.mockSet,
    this.sourceType,
    this.preVisualStem,
    this.postVisualStem,
    this.choices = const [],
    this.correctChoice,
    this.explanation,
    this.candidateCorrectRate,
    this.parts = const [],
    this.totalMarks,
    this.visuals = const [],
    this.answerVisuals = const [],
    this.diagramConfig,
  });

  final String id;
  final String language;
  final int chapterNo;
  final String chapterTitle;
  final String? topicGroup;
  final String keyPoint;
  final EconPaper paper;
  final Object year;
  final String? mockSet;
  final String? sourceType;
  final String questionRef;
  final String questionType;
  final String stem;
  final String? preVisualStem;
  final String? postVisualStem;
  final List<EconChoice> choices;
  final String? correctChoice;
  final String? explanation;
  final num? candidateCorrectRate;
  final List<EconQuestionPart> parts;
  final int? totalMarks;
  final List<EconQuestionVisual> visuals;
  final List<EconQuestionVisual> answerVisuals;
  final EconDiagramConfig? diagramConfig;

  bool get isP1 => paper == EconPaper.p1;
  bool get isP2 => paper == EconPaper.p2;
  bool get isMock => sourceType == 'mock';
  String get setLabel => mockSet ?? '$year';
  String get diagramContinuationKey {
    final explicit = diagramConfig?.continuationKey;
    if (explicit?.isNotEmpty ?? false) return explicit!;
    final match = RegExp(r'^Q\s*\d+', caseSensitive: false)
        .firstMatch(questionRef.trim());
    final reference = match?.group(0)?.replaceAll(RegExp(r'\s+'), '') ?? id;
    return '$language|${paper.name.toUpperCase()}|$year|${mockSet ?? ''}|$reference';
  }

  factory EconQuestion.fromJson(Map<String, dynamic> json) {
    final rawVisuals = json['visuals'];
    final rawAnswerVisuals = json['answerVisuals'];
    final partPrompts = json['parts'] is List
        ? (json['parts'] as List)
            .whereType<Map>()
            .map((part) => '${part['prompt'] ?? ''}')
        : const Iterable<String>.empty();
    final diagramQuestionText = [
      '${json['topicGroup'] ?? ''}',
      '${json['keyPoint'] ?? ''}',
      '${json['stem'] ?? ''}',
      '${json['preVisualStem'] ?? ''}',
      '${json['postVisualStem'] ?? ''}',
      ...partPrompts,
    ].where((text) => text.trim().isNotEmpty).join('\n');
    return EconQuestion(
      id: json['id'] as String? ?? '',
      language: json['language'] as String? ?? 'en',
      chapterNo: (json['chapterNo'] as num?)?.toInt() ?? 0,
      chapterTitle: json['chapterTitle'] as String? ?? '',
      topicGroup: json['topicGroup'] as String?,
      keyPoint: json['keyPoint'] as String? ?? '',
      paper: json['paper'] == 'P2' ? EconPaper.p2 : EconPaper.p1,
      year: json['year'] ?? '',
      mockSet: json['mockSet'] as String?,
      sourceType: json['sourceType'] as String?,
      questionRef: json['questionRef'] as String? ?? '',
      questionType: json['questionType'] as String? ?? 'singleChoice',
      stem: json['stem'] as String? ?? '',
      preVisualStem: json['preVisualStem'] as String?,
      postVisualStem: json['postVisualStem'] as String?,
      choices: json['choices'] is List
          ? (json['choices'] as List)
              .whereType<Map>()
              .map((item) =>
                  EconChoice.fromJson(Map<String, dynamic>.from(item)))
              .toList(growable: false)
          : const [],
      correctChoice: json['correctChoice'] as String?,
      explanation: json['explanation'] as String?,
      candidateCorrectRate: json['candidateCorrectRate'] as num?,
      parts: json['parts'] is List
          ? (json['parts'] as List)
              .whereType<Map>()
              .map((item) =>
                  EconQuestionPart.fromJson(Map<String, dynamic>.from(item)))
              .toList(growable: false)
          : const [],
      totalMarks: (json['totalMarks'] as num?)?.toInt(),
      visuals: _visualList(rawVisuals),
      answerVisuals: _visualList(rawAnswerVisuals),
      diagramConfig: json['diagramConfig'] is Map
          ? EconDiagramConfig.fromJson(
              Map<String, dynamic>.from(json['diagramConfig'] as Map),
              questionText: diagramQuestionText,
            )
          : null,
    );
  }
}

String? _inferDiagramPolicy(String text) {
  if (RegExp(
    r'\b(?:per[- ]unit|unit) tax\b|\btax burden\b|\btax incidence\b|buyer.{0,12}tax|seller.{0,12}tax|從量稅|稅項負擔|買家.*稅|賣家.*稅',
    caseSensitive: false,
  ).hasMatch(text)) {
    return 'tax';
  }
  if (RegExp(
    r'\b(?:per[- ]unit|unit) subsid(?:y|ies)\b|\bsubsidy benefit\b|buyer.{0,12}subsid|seller.{0,12}subsid|從量津貼|津貼得益|買家.*津貼|賣家.*津貼',
    caseSensitive: false,
  ).hasMatch(text)) {
    return 'subsidy';
  }
  return null;
}

bool _inferRequiresSplitPrice(String text, String? policy) {
  if (policy == null) return false;
  return RegExp(
    r'tax burden|tax incidence|subsidy benefit|buyer.{0,18}(?:tax|subsid)|seller.{0,18}(?:tax|subsid)|稅項負擔|津貼得益|買家.*(?:稅|津貼)|賣家.*(?:稅|津貼)|負擔分配|負擔比例',
    caseSensitive: false,
  ).hasMatch(text);
}

List<EconQuestionVisual> _visualList(Object? value) {
  if (value is! List) return const [];
  final output = <EconQuestionVisual>[];
  for (final item in value) {
    if (item is Map) {
      output.add(EconQuestionVisual.fromJson(Map<String, dynamic>.from(item)));
    } else if (item is List) {
      for (final nested in item) {
        if (nested is Map) {
          output.add(
              EconQuestionVisual.fromJson(Map<String, dynamic>.from(nested)));
        }
      }
    }
  }
  return output;
}

List<String> _stringList(Object? value) {
  return value is List
      ? value.whereType<Object>().map((item) => '$item').toList(growable: false)
      : const [];
}

Map<String, dynamic> econQuestionJsonMap(Object value) {
  return jsonDecode(jsonEncode(value)) as Map<String, dynamic>;
}
