import 'dart:math';

import 'package:flutter/foundation.dart';

import 'lesson_11_question.dart';

enum Lesson11Stage { scope, tense, answer, resolved }

enum Lesson11Event {
  ignored,
  selectionChanged,
  started,
  inputChanged,
  invalidInput,
  correctStep,
  wrong,
  questionCorrect,
  nextQuestion,
  completed,
}

class Lesson11Controller extends ChangeNotifier {
  Lesson11Controller({
    required List<Lesson11Question> allQuestions,
    this.roundSize = 10,
    Random? random,
  })  : _allQuestions = List.unmodifiable(allQuestions),
        _random = random ?? Random() {
    for (final question in _allQuestions) {
      tenseLabels.putIfAbsent(question.tense, () => question.tenseLabel);
    }
    selectedTenses.addAll(tenseLabels.keys);
  }

  final List<Lesson11Question> _allQuestions;
  final int roundSize;
  final Random _random;
  final Map<String, String> tenseLabels = {};
  final Set<String> selectedTenses = {};
  List<Lesson11Question> _questions = const [];
  final Set<String> _missedIds = {};
  Lesson11Stage _stage = Lesson11Stage.scope;
  int _index = 0;
  int _score = 0;
  int _mistakes = 0;
  bool _complete = false;
  bool _reviewMode = false;
  bool _questionHadMistake = false;
  String _typedAnswer = '';
  String? _errorMessage;

  Lesson11Stage get stage => _stage;
  Lesson11Question get currentQuestion => _questions[_index];
  int get index => _index;
  int get total => _questions.length;
  int get score => _score;
  int get mistakes => _mistakes;
  bool get isComplete => _complete;
  bool get isReviewMode => _reviewMode;
  bool get isResolved => _stage == Lesson11Stage.resolved;
  bool get questionHadMistake => _questionHadMistake;
  String get typedAnswer => _typedAnswer;
  String? get errorMessage => _errorMessage;
  double get progress =>
      total == 0 ? 0 : (_index + (isResolved ? 1 : 0)) / total;
  List<Lesson11Question> get missedQuestions => _allQuestions
      .where((question) => _missedIds.contains(question.id))
      .toList(growable: false);

  Lesson11Event toggleTense(String tense) {
    if (_stage != Lesson11Stage.scope || !tenseLabels.containsKey(tense)) {
      return Lesson11Event.ignored;
    }
    if (selectedTenses.contains(tense)) {
      if (selectedTenses.length == 1) return Lesson11Event.ignored;
      selectedTenses.remove(tense);
    } else {
      selectedTenses.add(tense);
    }
    notifyListeners();
    return Lesson11Event.selectionChanged;
  }

  Lesson11Event start() {
    if (_stage != Lesson11Stage.scope || selectedTenses.isEmpty) {
      return Lesson11Event.ignored;
    }
    _questions = _buildRound(
      _allQuestions
          .where((question) => selectedTenses.contains(question.tense))
          .toList(),
    );
    _index = 0;
    _score = 0;
    _mistakes = 0;
    _complete = false;
    _missedIds.clear();
    _prepareQuestion();
    notifyListeners();
    return Lesson11Event.started;
  }

  Lesson11Event answerTense(String tense) {
    if (_stage != Lesson11Stage.tense) return Lesson11Event.ignored;
    if (tense != currentQuestion.tense) {
      _recordMistake();
      _stage = Lesson11Stage.resolved;
      notifyListeners();
      return Lesson11Event.wrong;
    }
    _stage = Lesson11Stage.answer;
    notifyListeners();
    return Lesson11Event.correctStep;
  }

  Lesson11Event updateAnswer(String value) {
    if (_stage != Lesson11Stage.answer) return Lesson11Event.ignored;
    final next = value.length > 60 ? value.substring(0, 60) : value;
    if (next == _typedAnswer) return Lesson11Event.ignored;
    _typedAnswer = next;
    _errorMessage = null;
    notifyListeners();
    return Lesson11Event.inputChanged;
  }

  Lesson11Event submitAnswer() {
    if (_stage != Lesson11Stage.answer) return Lesson11Event.ignored;
    if (_typedAnswer.trim().isEmpty) {
      _errorMessage = '請輸入空格內的動詞形式。';
      notifyListeners();
      return Lesson11Event.invalidInput;
    }
    if (!currentQuestion.accepts(_typedAnswer)) {
      _recordMistake();
      _stage = Lesson11Stage.resolved;
      notifyListeners();
      return Lesson11Event.wrong;
    }
    _stage = Lesson11Stage.resolved;
    if (!_questionHadMistake) _score += 1;
    notifyListeners();
    return Lesson11Event.questionCorrect;
  }

  Lesson11Event next() {
    if (!isResolved || _complete) return Lesson11Event.ignored;
    if (_index == _questions.length - 1) {
      _complete = true;
      notifyListeners();
      return Lesson11Event.completed;
    }
    _index += 1;
    _prepareQuestion();
    notifyListeners();
    return Lesson11Event.nextQuestion;
  }

  void restart() {
    _reviewMode = false;
    _questions = _buildRound(
      _allQuestions
          .where((question) => selectedTenses.contains(question.tense))
          .toList(),
    );
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

  void chooseScopeAgain() {
    _stage = Lesson11Stage.scope;
    _complete = false;
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
    _stage =
        selectedTenses.length == 1 ? Lesson11Stage.answer : Lesson11Stage.tense;
    _questionHadMistake = false;
    _typedAnswer = '';
    _errorMessage = null;
  }

  List<Lesson11Question> _buildRound(List<Lesson11Question> source) {
    final shuffled = List<Lesson11Question>.of(source)..shuffle(_random);
    return shuffled
        .take(min(roundSize, shuffled.length))
        .toList(growable: false);
  }
}
