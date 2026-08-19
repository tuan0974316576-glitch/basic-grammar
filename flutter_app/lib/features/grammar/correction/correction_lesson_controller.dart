import 'dart:math';

import 'package:flutter/foundation.dart';

import 'correction_lesson_question.dart';

enum CorrectionLessonStage { category, judgment, correction, resolved }

enum CorrectionLessonEvent {
  ignored,
  inputChanged,
  invalidInput,
  correctStep,
  wrong,
  questionCorrect,
  nextQuestion,
  completed,
}

class CorrectionLessonController extends ChangeNotifier {
  CorrectionLessonController({
    required this.config,
    required List<CorrectionLessonQuestion> allQuestions,
    int roundSize = 10,
    Random? random,
  })  : _allQuestions = List.unmodifiable(allQuestions),
        _roundSize = roundSize,
        _random = random ?? Random() {
    _questions = _buildRound();
    _prepareQuestion();
  }

  CorrectionLessonController.forQuestions({
    required this.config,
    required List<CorrectionLessonQuestion> questions,
  })  : _allQuestions = List.unmodifiable(questions),
        _roundSize = questions.length,
        _random = Random(1),
        _questions = List.of(questions) {
    _prepareQuestion();
  }

  final CorrectionLessonConfig config;
  final List<CorrectionLessonQuestion> _allQuestions;
  final int _roundSize;
  final Random _random;
  late List<CorrectionLessonQuestion> _questions;
  final Set<String> _missedIds = {};
  int _index = 0;
  int _score = 0;
  int _mistakes = 0;
  bool _complete = false;
  bool _reviewMode = false;
  bool _questionHadMistake = false;
  String _typedCorrection = '';
  String? _errorMessage;
  late CorrectionLessonStage _stage;

  CorrectionLessonQuestion get currentQuestion => _questions[_index];
  int get index => _index;
  int get total => _questions.length;
  int get score => _score;
  int get mistakes => _mistakes;
  bool get isComplete => _complete;
  bool get isReviewMode => _reviewMode;
  bool get isResolved => _stage == CorrectionLessonStage.resolved;
  bool get questionHadMistake => _questionHadMistake;
  String get typedCorrection => _typedCorrection;
  String? get errorMessage => _errorMessage;
  CorrectionLessonStage get stage => _stage;
  double get progress =>
      total == 0 ? 0 : (_index + (isResolved ? 1 : 0)) / total;
  List<CorrectionLessonQuestion> get missedQuestions => _allQuestions
      .where((question) => _missedIds.contains(question.id))
      .toList(growable: false);

  CorrectionLessonEvent answerCategory(String category) {
    if (_stage != CorrectionLessonStage.category) {
      return CorrectionLessonEvent.ignored;
    }
    if (category != currentQuestion.category) {
      _recordMistake();
      _stage = CorrectionLessonStage.resolved;
      notifyListeners();
      return CorrectionLessonEvent.wrong;
    }
    _stage = CorrectionLessonStage.judgment;
    notifyListeners();
    return CorrectionLessonEvent.correctStep;
  }

  CorrectionLessonEvent answerJudgment(bool saysCorrect) {
    if (_stage != CorrectionLessonStage.judgment) {
      return CorrectionLessonEvent.ignored;
    }
    if (saysCorrect != currentQuestion.isCorrect) {
      _recordMistake();
      _stage = CorrectionLessonStage.resolved;
      notifyListeners();
      return CorrectionLessonEvent.wrong;
    }
    if (currentQuestion.isCorrect) {
      _scoreQuestion();
      return CorrectionLessonEvent.questionCorrect;
    }
    _stage = CorrectionLessonStage.correction;
    notifyListeners();
    return CorrectionLessonEvent.correctStep;
  }

  CorrectionLessonEvent updateCorrection(String value) {
    if (_stage != CorrectionLessonStage.correction) {
      return CorrectionLessonEvent.ignored;
    }
    var next = value.length > 120 ? value.substring(0, 120) : value;
    if (next.isNotEmpty && RegExp(r'^[a-z]').hasMatch(next)) {
      next = '${next[0].toUpperCase()}${next.substring(1)}';
    }
    if (_typedCorrection == next) return CorrectionLessonEvent.ignored;
    _typedCorrection = next;
    _errorMessage = null;
    notifyListeners();
    return CorrectionLessonEvent.inputChanged;
  }

  CorrectionLessonEvent submitCorrection() {
    if (_stage != CorrectionLessonStage.correction) {
      return CorrectionLessonEvent.ignored;
    }
    if (_typedCorrection.trim().isEmpty) {
      _errorMessage = '請輸入正確英文句子。';
      notifyListeners();
      return CorrectionLessonEvent.invalidInput;
    }
    if (!currentQuestion.accepts(_typedCorrection)) {
      _recordMistake();
      _stage = CorrectionLessonStage.resolved;
      notifyListeners();
      return CorrectionLessonEvent.wrong;
    }
    _scoreQuestion();
    return CorrectionLessonEvent.questionCorrect;
  }

  CorrectionLessonEvent next() {
    if (!isResolved || _complete) return CorrectionLessonEvent.ignored;
    if (_index == _questions.length - 1) {
      _complete = true;
      notifyListeners();
      return CorrectionLessonEvent.completed;
    }
    _index += 1;
    _prepareQuestion();
    notifyListeners();
    return CorrectionLessonEvent.nextQuestion;
  }

  void restart() {
    _reviewMode = false;
    _questions = _buildRound();
    _resetRound();
  }

  bool reviewMistakes() {
    final questions = missedQuestions;
    if (questions.isEmpty) return false;
    _reviewMode = true;
    _questions = questions;
    _resetRound();
    return true;
  }

  void _scoreQuestion() {
    _stage = CorrectionLessonStage.resolved;
    if (!_questionHadMistake) _score += 1;
    notifyListeners();
  }

  void _recordMistake() {
    if (_questionHadMistake) return;
    _questionHadMistake = true;
    _mistakes += 1;
    _missedIds.add(currentQuestion.id);
  }

  void _resetRound() {
    _index = 0;
    _score = 0;
    _mistakes = 0;
    _complete = false;
    _missedIds.clear();
    _prepareQuestion();
    notifyListeners();
  }

  void _prepareQuestion() {
    _stage = config.categoryFirst
        ? CorrectionLessonStage.category
        : CorrectionLessonStage.judgment;
    _typedCorrection = '';
    _errorMessage = null;
    _questionHadMistake = false;
  }

  List<CorrectionLessonQuestion> _buildRound() {
    final buckets = <String, List<CorrectionLessonQuestion>>{};
    for (final question in _allQuestions) {
      buckets.putIfAbsent(question.category, () => []).add(question);
    }
    for (final bucket in buckets.values) {
      bucket.shuffle(_random);
    }
    final mixed = <CorrectionLessonQuestion>[];
    while (mixed.length < min(_roundSize, _allQuestions.length)) {
      var added = false;
      for (final bucket in buckets.values) {
        if (bucket.isEmpty || mixed.length >= _roundSize) continue;
        mixed.add(bucket.removeLast());
        added = true;
      }
      if (!added) break;
    }
    mixed.shuffle(_random);
    return mixed;
  }
}
