import 'dart:math';

import 'package:flutter/foundation.dart';

import 'lesson_03_question.dart';
import 'lesson_03_repository.dart';

enum Lesson03Event {
  ignored,
  selectionChanged,
  invalidInput,
  wrong,
  questionCorrect,
  nextQuestion,
  completed,
}

class Lesson03Feedback {
  const Lesson03Feedback({
    required this.isCorrect,
    required this.title,
    required this.answerLines,
  });

  final bool isCorrect;
  final String title;
  final List<String> answerLines;
}

class Lesson03Controller extends ChangeNotifier {
  Lesson03Controller({
    required List<Lesson03Question> allQuestions,
    int roundSize = 10,
    Random? random,
  })  : _allQuestions = List.unmodifiable(allQuestions),
        _roundSize = roundSize,
        _random = random ?? Random() {
    _questions = Lesson03RoundBuilder.build(
      _allQuestions,
      count: _roundSize,
      random: _random,
    );
    _prepareQuestion();
  }

  Lesson03Controller.forQuestions(List<Lesson03Question> questions)
      : _allQuestions = List.unmodifiable(questions),
        _roundSize = questions.length,
        _random = Random(1),
        _questions = List.of(questions) {
    _prepareQuestion();
  }

  final List<Lesson03Question> _allQuestions;
  final int _roundSize;
  final Random _random;

  late List<Lesson03Question> _questions;
  late List<int?> _groups;
  final Set<String> _missedQuestionIds = {};
  int _index = 0;
  int _score = 0;
  int _mistakes = 0;
  int _nextColor = 0;
  int? _dragStart;
  int? _dragEnd;
  bool _isResolved = false;
  bool _isComplete = false;
  bool _reviewMode = false;
  Lesson03Feedback? _feedback;

  List<Lesson03Question> get questions => List.unmodifiable(_questions);
  Lesson03Question get currentQuestion => _questions[_index];
  int get index => _index;
  int get total => _questions.length;
  int get score => _score;
  int get mistakes => _mistakes;
  int get accuracy => total == 0 ? 0 : ((_score / total) * 100).round();
  int get nextColor => _nextColor;
  bool get isResolved => _isResolved;
  bool get isComplete => _isComplete;
  bool get isReviewMode => _reviewMode;
  bool get canSubmit => !_isResolved && _groups.any((group) => group != null);
  Lesson03Feedback? get feedback => _feedback;
  List<int?> get groups => List.unmodifiable(_groups);

  double get progress {
    if (total == 0) return 0;
    final completed = _index + (_isResolved || _isComplete ? 1 : 0);
    return (completed / total).clamp(0, 1);
  }

  List<Lesson03Question> get missedQuestions => _questions
      .where((question) => _missedQuestionIds.contains(question.id))
      .toList(growable: false);

  int? displayGroupFor(int tokenIndex) {
    if (_dragStart != null && _dragEnd != null) {
      final start = min(_dragStart!, _dragEnd!);
      final end = max(_dragStart!, _dragEnd!);
      if (tokenIndex >= start && tokenIndex <= end) return _nextColor;
    }
    return _groups[tokenIndex];
  }

  bool isDraftToken(int tokenIndex) {
    if (_dragStart == null || _dragEnd == null) return false;
    final start = min(_dragStart!, _dragEnd!);
    final end = max(_dragStart!, _dragEnd!);
    return tokenIndex >= start && tokenIndex <= end;
  }

  void startDrag(int tokenIndex) {
    if (_isResolved || _isComplete || !_isValidToken(tokenIndex)) return;
    _dragStart = tokenIndex;
    _dragEnd = tokenIndex;
    _feedback = null;
    notifyListeners();
  }

  void extendDrag(int tokenIndex) {
    if (_dragStart == null || !_isValidToken(tokenIndex)) return;
    if (_dragEnd == tokenIndex) return;
    _dragEnd = tokenIndex;
    notifyListeners();
  }

  Lesson03Event finishDrag([int? tokenIndex]) {
    if (_dragStart == null || _isResolved || _isComplete) {
      return Lesson03Event.ignored;
    }
    if (tokenIndex != null && _isValidToken(tokenIndex)) {
      _dragEnd = tokenIndex;
    }
    final start = min(_dragStart!, _dragEnd ?? _dragStart!);
    final end = max(_dragStart!, _dragEnd ?? _dragStart!);
    for (var index = start; index <= end; index++) {
      _groups[index] = _nextColor;
    }
    _dragStart = null;
    _dragEnd = null;
    _nextColor = (_nextColor + 1) % 4;
    _feedback = null;
    notifyListeners();
    return Lesson03Event.selectionChanged;
  }

  void cancelDrag() {
    if (_dragStart == null) return;
    _dragStart = null;
    _dragEnd = null;
    notifyListeners();
  }

  Lesson03Event reset() {
    if (_isResolved || !_groups.any((group) => group != null)) {
      return Lesson03Event.ignored;
    }
    _groups = List<int?>.filled(currentQuestion.tokens.length, null);
    _nextColor = 0;
    _dragStart = null;
    _dragEnd = null;
    _feedback = null;
    notifyListeners();
    return Lesson03Event.selectionChanged;
  }

  Lesson03Event submit() {
    if (_isResolved || _isComplete) return Lesson03Event.ignored;
    if (!_groups.any((group) => group != null)) {
      _feedback = const Lesson03Feedback(
        isCorrect: false,
        title: '請先拖拉 underline 每個句子。',
        answerLines: [],
      );
      notifyListeners();
      return Lesson03Event.invalidInput;
    }

    final matched = _isAnswerMatched();
    _isResolved = true;
    if (matched) {
      _score += 1;
      _feedback = Lesson03Feedback(
        isCorrect: true,
        title: '正確，這一句有 ${currentQuestion.sentenceCount} 個句子。',
        answerLines: currentQuestion.answerLines,
      );
      notifyListeners();
      return Lesson03Event.questionCorrect;
    }

    _mistakes += 1;
    _missedQuestionIds.add(currentQuestion.id);
    _feedback = Lesson03Feedback(
      isCorrect: false,
      title: '這一句有 ${currentQuestion.sentenceCount} 個句子。',
      answerLines: currentQuestion.answerLines,
    );
    notifyListeners();
    return Lesson03Event.wrong;
  }

  Lesson03Event next() {
    if (!_isResolved || _isComplete) return Lesson03Event.ignored;
    if (_index >= _questions.length - 1) {
      _isComplete = true;
      notifyListeners();
      return Lesson03Event.completed;
    }
    _index += 1;
    _resetQuestion();
    notifyListeners();
    return Lesson03Event.nextQuestion;
  }

  void restart() {
    _reviewMode = false;
    _questions = Lesson03RoundBuilder.build(
      _allQuestions,
      count: _roundSize,
      random: _random,
    );
    _resetRound();
  }

  bool reviewMistakes() {
    final reviewQuestions = missedQuestions;
    if (reviewQuestions.isEmpty) return false;
    _reviewMode = true;
    _questions = reviewQuestions;
    _resetRound();
    return true;
  }

  bool _isAnswerMatched() {
    final expectedTokens = currentQuestion.expectedTokens;
    if (_groups.length != expectedTokens.length) return false;

    final colorMap = <int, int>{};
    var nextExpectedGroup = 0;
    for (var index = 0; index < expectedTokens.length; index++) {
      final expected = expectedTokens[index];
      if (expected.optional) continue;
      final group = _groups[index];
      if (group == null) return false;
      colorMap.putIfAbsent(group, () => nextExpectedGroup++);
      if (colorMap[group] != expected.segmentIndex) return false;
    }
    return true;
  }

  bool _isValidToken(int tokenIndex) {
    return tokenIndex >= 0 && tokenIndex < _groups.length;
  }

  void _prepareQuestion() {
    _groups = List<int?>.filled(currentQuestion.tokens.length, null);
    _nextColor = 0;
    _dragStart = null;
    _dragEnd = null;
  }

  void _resetRound() {
    _index = 0;
    _score = 0;
    _mistakes = 0;
    _missedQuestionIds.clear();
    _isComplete = false;
    _resetQuestion();
    notifyListeners();
  }

  void _resetQuestion() {
    _feedback = null;
    _isResolved = false;
    _prepareQuestion();
  }
}
