import 'dart:math';

import 'package:flutter/foundation.dart';

import 'vocab_models.dart';

enum VocabReviewKind {
  reading,
  listening,
  spelling,
  speakingWord,
  sentenceCloze,
  speakingSentence,
}

extension VocabReviewKindAudio on VocabReviewKind {
  bool get needsListening => this == VocabReviewKind.listening;

  bool get needsSpeaking =>
      this == VocabReviewKind.speakingWord ||
      this == VocabReviewKind.speakingSentence;

  bool get needsAudioOrMicrophone => needsListening || needsSpeaking;
}

enum VocabReviewEvent {
  ignored,
  invalidInput,
  correct,
  wrong,
  nextQuestion,
  retryIntro,
  completed,
}

class VocabReviewQuestion {
  const VocabReviewQuestion({
    required this.id,
    required this.kind,
    required this.item,
    required this.correctMeaning,
    required this.choices,
    this.sense,
    this.exampleSentence = '',
    this.fallbackChoices = const [],
  });

  final String id;
  final VocabReviewKind kind;
  final VocabItem item;
  final String correctMeaning;
  final List<String> choices;
  final VocabSense? sense;
  final String exampleSentence;
  final List<String> fallbackChoices;

  VocabReviewQuestion copyWith({
    String? id,
    VocabReviewKind? kind,
    List<String>? choices,
    List<String>? fallbackChoices,
  }) {
    return VocabReviewQuestion(
      id: id ?? this.id,
      kind: kind ?? this.kind,
      item: item,
      correctMeaning: correctMeaning,
      choices: choices ?? this.choices,
      sense: sense,
      exampleSentence: exampleSentence,
      fallbackChoices: fallbackChoices ?? this.fallbackChoices,
    );
  }
}

/// Owns the original web vocabulary stage sequence and answer state.
class VocabReviewController extends ChangeNotifier {
  static const maxSessionQuestions = 20;

  VocabReviewController({
    required List<VocabItem> items,
    Map<String, String> exampleByItemId = const {},
    Random? random,
    int stageSize = maxSessionQuestions,
    this.repeatWrongAnswers = false,
  }) : _random = random ?? Random() {
    final selected = [...items]..sort((left, right) {
        final leftUnseen = left.totalSeen == 0;
        final rightUnseen = right.totalSeen == 0;
        if (leftUnseen != rightUnseen) return leftUnseen ? -1 : 1;
        final leftAccuracy =
            left.totalSeen == 0 ? 0.0 : left.totalCorrect / left.totalSeen;
        final rightAccuracy =
            right.totalSeen == 0 ? 0.0 : right.totalCorrect / right.totalSeen;
        final accuracy = leftAccuracy.compareTo(rightAccuracy);
        if (accuracy != 0) return accuracy;
        final seen = left.totalSeen.compareTo(right.totalSeen);
        if (seen != 0) return seen;
        return left.word.toLowerCase().compareTo(right.word.toLowerCase());
      });

    final dueItems = selected.where((item) =>
        item.word.trim().isNotEmpty &&
        item.senses.isNotEmpty &&
        item.isDueForReview);
    final limited = dueItems
        .take(stageSize.clamp(1, maxSessionQuestions).toInt())
        .toList(growable: true);
    final mcPoolByPos = <String, List<VocabItem>>{};
    for (final item in selected.where(
      (item) => item.word.trim().isNotEmpty && item.senses.isNotEmpty,
    )) {
      final pos = _posGroupFor(item);
      mcPoolByPos.putIfAbsent(pos, () => []).add(item);
    }
    final baseQuestions = [
      for (var index = 0; index < limited.length; index++)
        () {
          final item = limited[index];
          // Keep the answer and its POS together. A saved word may have
          // several senses, but one question must test one sense at a time.
          final sense = item.senses.first;
          return VocabReviewQuestion(
            id: 'vocab-review-${item.id}-$index',
            kind: _kindFor(
              index,
              item: item,
              hasExample: (exampleByItemId[item.id] ?? '').isNotEmpty,
              allowChoice: _hasMcChoices(item, mcPoolByPos, sense: sense),
            ),
            item: item,
            sense: sense,
            correctMeaning: _meaningForSense(sense),
            choices: const [],
            exampleSentence: exampleByItemId[item.id] ?? '',
          );
        }(),
    ];
    _questions = baseQuestions
        .map((question) => _withChoices(question, mcPoolByPos))
        .toList(growable: true);
    _initialTotal = _questions.length;
  }

  static const _kindPattern = [
    VocabReviewKind.reading,
    VocabReviewKind.listening,
    VocabReviewKind.spelling,
    VocabReviewKind.speakingWord,
    VocabReviewKind.reading,
    VocabReviewKind.listening,
    VocabReviewKind.spelling,
    VocabReviewKind.speakingWord,
    VocabReviewKind.sentenceCloze,
    VocabReviewKind.reading,
  ];

  final Random _random;
  final bool repeatWrongAnswers;
  late final List<VocabReviewQuestion> _questions;
  late final int _initialTotal;
  int _index = 0;
  int _score = 0;
  int _attemptCount = 0;
  int _wrongCount = 0;
  int _retrySequence = 0;
  final DateTime _startedAt = DateTime.now();
  String? _selectedChoice;
  String _spellingAnswer = '';
  bool _resolved = false;
  bool? _lastCorrect;
  bool _completed = false;
  bool _retryIntroVisible = false;
  bool _listeningQuestionsDisabled = false;
  bool _speakingQuestionsDisabled = false;

  List<VocabReviewQuestion> get questions => List.unmodifiable(_questions);
  int get index => _index;
  int get total => _questions.length;
  int get targetTotal => _initialTotal;
  int get score => _score;
  int get attemptCount => _attemptCount;
  int get wrongCount => _wrongCount;
  int get xpEarned => _score * 10;
  int get accuracyPercent => _attemptCount == 0
      ? 0
      : ((_score / _attemptCount) * 100).round().clamp(0, 100);
  Duration get elapsed => DateTime.now().difference(_startedAt);
  bool get repeatsWrong => repeatWrongAnswers;
  bool get isRetryIntro => _retryIntroVisible;
  bool get isResolved => _resolved;
  bool get isComplete => _completed;
  bool? get lastCorrect => _lastCorrect;
  String? get selectedChoice => _selectedChoice;
  String get spellingAnswer => _spellingAnswer;
  bool get listeningQuestionsDisabled => _listeningQuestionsDisabled;
  bool get speakingQuestionsDisabled => _speakingQuestionsDisabled;
  double get progress {
    if (_completed) return 1;
    if (total == 0 || _initialTotal == 0) return 0;
    if (repeatWrongAnswers) {
      return (_score / _initialTotal).clamp(0, 1).toDouble();
    }
    return (_index + (_resolved ? 1 : 0)) / total;
  }

  VocabReviewQuestion? get currentQuestion =>
      _questions.isEmpty || _completed || _retryIntroVisible
          ? null
          : _questions[_index];

  VocabReviewQuestion get resultQuestion =>
      _questions[_index.clamp(0, max(0, _questions.length - 1))];

  VocabReviewKind _kindFor(
    int index, {
    required VocabItem item,
    required bool hasExample,
    required bool allowChoice,
  }) {
    final kind = _kindPattern[index % _kindPattern.length];
    if (kind == VocabReviewKind.speakingWord &&
        item.listeningMastered &&
        item.spellingMastered &&
        hasExample) {
      return VocabReviewKind.speakingSentence;
    }
    if (item.listeningMastered && item.spellingMastered && hasExample) {
      return VocabReviewKind.sentenceCloze;
    }
    if (kind == VocabReviewKind.sentenceCloze) {
      return VocabReviewKind.spelling;
    }
    if (!allowChoice &&
        (kind == VocabReviewKind.reading ||
            kind == VocabReviewKind.listening)) {
      return VocabReviewKind.spelling;
    }
    return kind;
  }

  String _meaningForSense(VocabSense sense) {
    final meanings = <String>[];
    final seen = <String>{};
    for (final meaning in splitVocabMeaningParts(sense.meaning)) {
      if (seen.add(normalizeMeaningKey(meaning))) meanings.add(meaning);
    }
    return meanings.join(' / ');
  }

  static String _posGroupFor(VocabItem item) {
    return _posGroupForSense(item.senses.first);
  }

  static String _posGroupForSense(VocabSense sense) {
    final pos = sense.pos.trim().toLowerCase();
    return switch (pos) {
      'adjective' => 'adjective',
      'adverb' => 'adverb',
      'noun' => 'noun',
      'verb' => 'verb',
      _ => 'other',
    };
  }

  static String _meaningPartKey(String meaning) {
    return normalizeMeaningKey(meaning)
        .replaceAll(RegExp(r'[。,.，；;！!?！？]'), '')
        .replaceFirst(RegExp(r'的$'), '');
  }

  static Set<String> _meaningKeys(String meaning) => splitVocabMeaningParts(
        meaning,
      ).map(_meaningPartKey).where((key) => key.isNotEmpty).toSet();

  bool _hasMcChoices(VocabItem item, Map<String, List<VocabItem>> poolByPos,
      {VocabSense? sense}) {
    final targetSense = sense ?? item.senses.first;
    final candidates =
        poolByPos[_posGroupForSense(targetSense)] ?? const <VocabItem>[];
    // Four same-POS saved words and four distinct Chinese choices are needed
    // for a fair MC question (one answer plus three distractors).
    return candidates
                .map((candidate) => candidate.normalizedWord)
                .toSet()
                .length >=
            4 &&
        _distinctDistractorMeanings(item, candidates, targetSense: targetSense)
                .length >=
            3;
  }

  List<String> _distinctDistractorMeanings(
    VocabItem item,
    List<VocabItem> candidates, {
    bool shuffle = false,
    VocabSense? targetSense,
  }) {
    final targetPos = _posGroupForSense(targetSense ?? item.senses.first);
    final available = candidates
        .where((candidate) => candidate.normalizedWord != item.normalizedWord)
        .map((candidate) {
          final sense = candidate.senses.firstWhere(
            (candidateSense) => _posGroupForSense(candidateSense) == targetPos,
            orElse: () => candidate.senses.first,
          );
          final meaning = _meaningForSense(sense);
          return (meaning: meaning, keys: _meaningKeys(meaning));
        })
        .where((candidate) =>
            candidate.meaning.isNotEmpty && candidate.keys.isNotEmpty)
        .toList(growable: true);
    if (shuffle) available.shuffle(_random);
    available
        .sort((left, right) => left.keys.length.compareTo(right.keys.length));

    final usedKeys = _meaningKeys(
      _meaningForSense(targetSense ?? item.senses.first),
    );
    final meanings = <String>[];
    final displayed = <String>{};
    for (final candidate in available) {
      if (candidate.keys.any(usedKeys.contains)) continue;
      final displayKey = normalizeMeaningKey(candidate.meaning);
      if (!displayed.add(displayKey)) continue;
      meanings.add(candidate.meaning);
      usedKeys.addAll(candidate.keys);
    }
    return meanings;
  }

  VocabReviewQuestion _withChoices(
    VocabReviewQuestion question,
    Map<String, List<VocabItem>> poolByPos,
  ) {
    if (question.kind == VocabReviewKind.spelling ||
        question.kind == VocabReviewKind.sentenceCloze) {
      return question;
    }
    final correct = question.correctMeaning;
    final distractors = _distinctDistractorMeanings(
      question.item,
      poolByPos[_posGroupForSense(
              question.sense ?? question.item.senses.first)] ??
          const [],
      shuffle: true,
      targetSense: question.sense,
    );
    if (distractors.length < 3) {
      if (question.kind.needsSpeaking) return question;
      return VocabReviewQuestion(
        id: question.id,
        kind: VocabReviewKind.spelling,
        item: question.item,
        correctMeaning: correct,
        choices: const [],
        sense: question.sense,
        exampleSentence: question.exampleSentence,
      );
    }
    final choices = [correct, ...distractors.take(3)]..shuffle(_random);
    final isSpeaking = question.kind.needsSpeaking;
    return VocabReviewQuestion(
      id: question.id,
      kind: question.kind,
      item: question.item,
      correctMeaning: correct,
      choices: isSpeaking ? const [] : choices,
      sense: question.sense,
      exampleSentence: question.exampleSentence,
      fallbackChoices: isSpeaking ? choices : const [],
    );
  }

  VocabReviewEvent choose(String choice) {
    final question = currentQuestion;
    if (question == null ||
        _resolved ||
        (question.kind == VocabReviewKind.spelling ||
            question.kind == VocabReviewKind.sentenceCloze ||
            question.kind.needsSpeaking)) {
      return VocabReviewEvent.ignored;
    }
    final correct = choice == question.correctMeaning;
    _selectedChoice = choice;
    _resolve(correct);
    return correct ? VocabReviewEvent.correct : VocabReviewEvent.wrong;
  }

  void updateSpelling(String value) {
    if (_resolved ||
        (currentQuestion?.kind != VocabReviewKind.spelling &&
            currentQuestion?.kind != VocabReviewKind.sentenceCloze)) {
      return;
    }
    _spellingAnswer = value;
    notifyListeners();
  }

  VocabReviewEvent submitSpelling() {
    final question = currentQuestion;
    if (question == null ||
        _resolved ||
        (question.kind != VocabReviewKind.spelling &&
            question.kind != VocabReviewKind.sentenceCloze)) {
      return VocabReviewEvent.ignored;
    }
    final answer = normalizeVocabWord(_spellingAnswer);
    if (answer.isEmpty) return VocabReviewEvent.invalidInput;
    final correct = answer == normalizeVocabWord(question.item.word);
    _resolve(correct);
    return correct ? VocabReviewEvent.correct : VocabReviewEvent.wrong;
  }

  VocabReviewEvent submitSpeaking(bool correct) {
    final question = currentQuestion;
    if (question == null || _resolved || !question.kind.needsSpeaking) {
      return VocabReviewEvent.ignored;
    }
    _resolve(correct);
    return correct ? VocabReviewEvent.correct : VocabReviewEvent.wrong;
  }

  bool disableQuestionsLike(VocabReviewKind kind) {
    if (_resolved || _completed) return false;
    final disableSpeaking = kind.needsSpeaking;
    final disableListening = kind.needsListening;
    if (!disableSpeaking && !disableListening) return false;
    var changed = false;
    for (var index = _index; index < _questions.length; index += 1) {
      final question = _questions[index];
      if ((disableSpeaking && !question.kind.needsSpeaking) ||
          (disableListening && !question.kind.needsListening)) {
        continue;
      }
      final fallbackChoices = question.choices.isNotEmpty
          ? question.choices
          : question.fallbackChoices;
      final fallbackKind = fallbackChoices.length >= 4
          ? VocabReviewKind.reading
          : VocabReviewKind.spelling;
      _questions[index] = question.copyWith(
        id: '${question.id}-quiet',
        kind: fallbackKind,
        choices: fallbackKind == VocabReviewKind.reading
            ? fallbackChoices
            : const [],
      );
      changed = true;
    }
    if (!changed) return false;
    if (disableSpeaking) _speakingQuestionsDisabled = true;
    if (disableListening) _listeningQuestionsDisabled = true;
    _selectedChoice = null;
    _spellingAnswer = '';
    notifyListeners();
    return true;
  }

  VocabReviewEvent next() {
    if (!_resolved || _completed || _retryIntroVisible) {
      return VocabReviewEvent.ignored;
    }
    // Wrong answers from the first pass are appended to the queue. Pause at
    // that boundary so the learner gets a short, encouraging transition
    // before the same questions return for mastery.
    if (repeatWrongAnswers &&
        _index == _initialTotal - 1 &&
        _questions.length > _initialTotal) {
      _retryIntroVisible = true;
      _resolved = false;
      _lastCorrect = null;
      _selectedChoice = null;
      _spellingAnswer = '';
      notifyListeners();
      return VocabReviewEvent.retryIntro;
    }
    if (_index >= _questions.length - 1) {
      _completed = true;
      notifyListeners();
      return VocabReviewEvent.completed;
    }
    _index += 1;
    _selectedChoice = null;
    _spellingAnswer = '';
    _resolved = false;
    _lastCorrect = null;
    notifyListeners();
    return VocabReviewEvent.nextQuestion;
  }

  /// Leaves the mistake transition and starts the retry queue.
  VocabReviewEvent startRetry() {
    if (!_retryIntroVisible || _completed) return VocabReviewEvent.ignored;
    _retryIntroVisible = false;
    _index = _initialTotal;
    _selectedChoice = null;
    _spellingAnswer = '';
    _resolved = false;
    _lastCorrect = null;
    notifyListeners();
    return VocabReviewEvent.nextQuestion;
  }

  void _resolve(bool correct) {
    _resolved = true;
    _lastCorrect = correct;
    _attemptCount += 1;
    if (correct) {
      _score += 1;
    } else {
      _wrongCount += 1;
      if (repeatWrongAnswers) {
        final question = currentQuestion;
        if (question != null) {
          _retrySequence += 1;
          _questions.add(
            question.copyWith(id: '${question.id}-retry-$_retrySequence'),
          );
        }
      }
    }
    notifyListeners();
  }
}
