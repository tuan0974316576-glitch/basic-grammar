import 'dart:convert';

import 'package:flutter/services.dart';

import 'econ_question_models.dart';

abstract interface class EconQuestionBankRepository {
  Future<List<EconQuestion>> loadQuestions();
}

class EconQuestionRepository implements EconQuestionBankRepository {
  const EconQuestionRepository({this.assetPath = _defaultAssetPath});

  static const _defaultAssetPath = 'assets/data/question-bank.json';

  final String assetPath;

  static final Map<String, Future<List<EconQuestion>>> _cache = {};
  static final Map<String, List<EconQuestion>> _resolved = {};

  static List<EconQuestion>? cachedQuestions(
          [String assetPath = _defaultAssetPath]) =>
      _resolved[assetPath];

  /// Finds the reviewed bilingual counterpart for an English/Chinese question.
  /// The exporter keeps the language as the first id segment, so swapping that
  /// segment is more reliable than matching translated stems or chapter text.
  static EconQuestion? pairedQuestion(EconQuestion question,
      [String assetPath = _defaultAssetPath]) {
    final loaded = _resolved[assetPath];
    if (loaded == null) return null;
    final id = pairedQuestionId(question.id, question.language);
    final candidates = loaded.where((candidate) {
      return candidate.language != question.language &&
          candidate.paper == question.paper &&
          '${candidate.year}' == '${question.year}' &&
          candidate.mockSet == question.mockSet &&
          candidate.sourceType == question.sourceType;
    }).toList(growable: false);
    if (candidates.isEmpty) return null;

    final direct = candidates.where((candidate) => candidate.id == id);
    final directMatch = direct.isEmpty ? null : direct.first;
    // Paper 1 imports retain matching ids even when chapter tagging differs.
    if (question.isP1 && directMatch != null) return directMatch;
    final sameChapter = candidates
        .where((candidate) => candidate.chapterNo == question.chapterNo)
        .toList(growable: false);
    final questionMarks = _questionMarks(question);
    final questionNumber = int.tryParse(
          RegExp(r'\d+').firstMatch(question.questionRef)?.group(0) ?? '',
        ) ??
        9999;
    final sameMarkCandidates = sameChapter
        .where((candidate) => _questionMarks(candidate) == questionMarks)
        .where((candidate) {
      final candidateNumber = int.tryParse(
            RegExp(r'\d+').firstMatch(candidate.questionRef)?.group(0) ?? '',
          ) ??
          9999;
      return (questionNumber - candidateNumber).abs() <= 2;
    }).toList(growable: false);
    // Prefer an exact id when it belongs to the same reviewed chapter. Some
    // bilingual mock imports use different mark allocations or renumber
    // subparts, so suffix/mark differences do not invalidate the counterpart.
    final pool = directMatch != null &&
            directMatch.chapterNo == question.chapterNo &&
            (_questionMarks(directMatch) == questionMarks ||
                sameChapter.length == 1)
        ? <EconQuestion>[directMatch]
        : sameMarkCandidates.isNotEmpty
            ? sameMarkCandidates
            : sameChapter.length == 1
                ? sameChapter
                : const <EconQuestion>[];
    if (pool.isEmpty) return null;
    pool.sort((left, right) {
      final leftScore = _pairScore(question, left, questionMarks);
      final rightScore = _pairScore(question, right, questionMarks);
      return rightScore.compareTo(leftScore);
    });
    final best = pool.first;
    // A same-chapter match is a reviewed counterpart. Exact marks and the
    // question/subpart reference decide between language files whose paper
    // numbering is offset by a missing subpart.
    return best;
  }

  static String pairedQuestionId(String questionId, String language) {
    final prefix = language == 'en' ? 'zh-' : 'en-';
    return questionId.replaceFirst(RegExp(r'^(?:en|zh)-'), prefix);
  }

  static int _questionMarks(EconQuestion question) {
    final explicit = question.totalMarks ?? 0;
    if (explicit > 0) return explicit;
    final parts = question.parts.fold<int>(
      0,
      (total, part) => total + (part.marks ?? 0),
    );
    return parts > 0 ? parts : 0;
  }

  static int _pairScore(
      EconQuestion question, EconQuestion candidate, int questionMarks) {
    var score = 0;
    if (candidate.id == pairedQuestionId(question.id, question.language)) {
      score += 1000;
    }
    if (_questionMarks(candidate) == questionMarks) score += 300;
    final wanted = _refKey(question.questionRef);
    final found = _refKey(candidate.questionRef);
    if (wanted == found) {
      score += 220;
    } else if (wanted.startsWith(found) || found.startsWith(wanted)) {
      score += 170;
    }
    final wantedSuffix = wanted.replaceFirst(RegExp(r'^Q\d+'), '');
    final foundSuffix = found.replaceFirst(RegExp(r'^Q\d+'), '');
    if (wantedSuffix.isNotEmpty && wantedSuffix == foundSuffix) score += 180;
    score -= (_questionNumber(question.questionRef) -
            _questionNumber(candidate.questionRef))
        .abs();
    return score;
  }

  static String _refKey(String value) =>
      value.toUpperCase().replaceAll(RegExp(r'[^A-Z0-9]'), '');

  static int _questionNumber(String value) {
    return int.tryParse(RegExp(r'\d+').firstMatch(value)?.group(0) ?? '') ??
        9999;
  }

  @override
  Future<List<EconQuestion>> loadQuestions() {
    final cached = _cache[assetPath];
    if (cached != null) return cached;
    final future = _loadUncached();
    _cache[assetPath] = future;
    future.then((questions) => _resolved[assetPath] = questions);
    future.catchError((_) {
      _cache.remove(assetPath);
      return const <EconQuestion>[];
    });
    return future;
  }

  Future<List<EconQuestion>> _loadUncached() async {
    final raw = await rootBundle.loadString(assetPath);
    final decoded = jsonDecode(raw);
    if (decoded is! Map || decoded['questions'] is! List) {
      throw const FormatException('ECON question bank is invalid.');
    }
    return (decoded['questions'] as List)
        .whereType<Map>()
        .map((item) => EconQuestion.fromJson(Map<String, dynamic>.from(item)))
        .where((question) =>
            question.id.isNotEmpty &&
            (question.stem.trim().isNotEmpty ||
                question.parts
                    .any((part) => part.prompt?.trim().isNotEmpty ?? false)))
        .toList(growable: false);
  }
}

List<EconQuestion> filterEconQuestions(
  Iterable<EconQuestion> questions, {
  required String language,
  required EconPaper paper,
  EconSourceMode? sourceMode,
  int? chapterNo,
  String? keyPoint,
  String? setLabel,
}) {
  return questions.where((question) {
    if (question.language != language || question.paper != paper) return false;
    if (sourceMode == EconSourceMode.mock && !question.isMock) return false;
    if (sourceMode == EconSourceMode.past && question.isMock) return false;
    if (chapterNo != null && question.chapterNo != chapterNo) return false;
    if (keyPoint != null && question.keyPoint != keyPoint) return false;
    if (setLabel != null && question.setLabel != setLabel) return false;
    return true;
  }).toList(growable: false);
}

/// Orders questions the same way as the legacy ECON practice picker: from
/// the earliest paper/set to the latest, then by paper and printed question
/// reference.  The bundled JSON is grouped by import source, so its storage
/// order must not be used as the student's practice sequence.
List<EconQuestion> sortEconQuestionsByPublication(
  Iterable<EconQuestion> questions,
) {
  final ordered = questions.toList(growable: true);
  ordered.sort(_compareQuestionsByPublication);
  return ordered;
}

/// Reproduces the old `wrong -> unseen -> correct` topic-practice setting.
/// Each group remains in publication order so a student still moves through
/// the selected chapter chronologically within the selected progress bucket.
List<EconQuestion> prioritizeEconTopicQuestions(
  Iterable<EconQuestion> questions,
  Map<String, String> progress,
) {
  final wrong = <EconQuestion>[];
  final unseen = <EconQuestion>[];
  final correct = <EconQuestion>[];
  final other = <EconQuestion>[];
  for (final question in questions) {
    switch (progress[question.id]) {
      case 'incorrect':
        wrong.add(question);
      case 'correct':
        correct.add(question);
      case null:
        unseen.add(question);
      default:
        other.add(question);
    }
  }
  return [
    ...sortEconQuestionsByPublication(wrong),
    ...sortEconQuestionsByPublication(unseen),
    ...sortEconQuestionsByPublication(correct),
    ...sortEconQuestionsByPublication(other),
  ];
}

int _compareQuestionsByPublication(EconQuestion left, EconQuestion right) {
  return _compareSetLabelsChronologically(left.setLabel, right.setLabel) == 0
      ? _compareNatural(left.questionRef, right.questionRef) == 0
          ? left.id.compareTo(right.id)
          : _compareNatural(left.questionRef, right.questionRef)
      : _compareSetLabelsChronologically(left.setLabel, right.setLabel);
}

int _compareSetLabelsChronologically(String left, String right) {
  final leftOrder = _publicationOrder(left);
  final rightOrder = _publicationOrder(right);
  return leftOrder.$1.compareTo(rightOrder.$1) != 0
      ? leftOrder.$1.compareTo(rightOrder.$1)
      : leftOrder.$2.compareTo(rightOrder.$2) != 0
          ? leftOrder.$2.compareTo(rightOrder.$2)
          : _compareNatural(left, right);
}

(int, int) _publicationOrder(String label) {
  if (label == 'Sample Paper') return (2009, 0);
  if (label == 'Practice Paper') return (2012, 90);
  final mock = RegExp(r'Aristo Mock Test\s+(\d+)', caseSensitive: false)
      .firstMatch(label);
  if (mock != null) {
    // The Aristo catalog is explicitly chronological by test number.  The
    // test number is the tie-break order within its reviewed publication year.
    final number = int.parse(mock.group(1)!);
    return (_aristoMockPublicationYear(number), number);
  }
  final year = int.tryParse(label);
  if (year != null) return (year, 10000);
  return (1 << 30, 1 << 30);
}

int _aristoMockPublicationYear(int number) {
  if (number <= 1) return 2009;
  if (number <= 3) return 2010;
  if (number <= 5) return 2011;
  if (number <= 7) return 2012;
  if (number == 8) return 2013;
  if (number <= 10) return 2014;
  if (number <= 12) return 2015;
  if (number <= 14) return 2016;
  if (number <= 16) return 2017;
  if (number <= 18) return 2018;
  if (number <= 20) return 2019;
  if (number <= 23) return 2020;
  if (number <= 26) return 2021;
  if (number <= 29) return 2022;
  if (number <= 32) return 2023;
  if (number <= 37) return 2024;
  if (number <= 42) return 2025;
  return 2026;
}

int _compareNatural(String left, String right) {
  final leftTokens = RegExp(r'\d+|[A-Za-z]+').allMatches(left);
  final rightTokens = RegExp(r'\d+|[A-Za-z]+').allMatches(right);
  final leftValues = leftTokens.map((match) => match.group(0)!).toList();
  final rightValues = rightTokens.map((match) => match.group(0)!).toList();
  for (var index = 0;
      index < leftValues.length && index < rightValues.length;
      index++) {
    final leftNumber = int.tryParse(leftValues[index]);
    final rightNumber = int.tryParse(rightValues[index]);
    final comparison = leftNumber != null && rightNumber != null
        ? leftNumber.compareTo(rightNumber)
        : leftValues[index]
            .toUpperCase()
            .compareTo(rightValues[index].toUpperCase());
    if (comparison != 0) return comparison;
  }
  return leftValues.length.compareTo(rightValues.length);
}

List<String> econSetLabels(
  Iterable<EconQuestion> questions, {
  required String language,
  required EconPaper paper,
  required EconSourceMode sourceMode,
}) {
  final labels = filterEconQuestions(
    questions,
    language: language,
    paper: paper,
    sourceMode: sourceMode,
  ).map((question) => question.setLabel).toSet().toList();
  labels.sort(_compareSetLabels);
  return labels;
}

int _compareSetLabels(String left, String right) {
  final leftNumber = int.tryParse(left);
  final rightNumber = int.tryParse(right);
  if (leftNumber != null && rightNumber != null) {
    return leftNumber.compareTo(rightNumber);
  }
  final leftMock = RegExp(r'Mock Test\s+(\d+)', caseSensitive: false)
      .firstMatch(left)
      ?.group(1);
  final rightMock = RegExp(r'Mock Test\s+(\d+)', caseSensitive: false)
      .firstMatch(right)
      ?.group(1);
  if (leftMock != null && rightMock != null) {
    return int.parse(leftMock).compareTo(int.parse(rightMock));
  }
  return left.compareTo(right);
}

String econSetLabelForDisplay(String label, {required String language}) {
  final mock =
      RegExp(r'Mock Test\s+(\d+)', caseSensitive: false).firstMatch(label);
  if (mock != null) {
    return language == 'zh'
        ? '模擬試卷 ${mock.group(1)}'
        : 'Mock Test ${mock.group(1)}';
  }
  return label;
}
