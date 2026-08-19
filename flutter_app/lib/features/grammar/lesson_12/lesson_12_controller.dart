import 'dart:math';

import 'package:flutter/foundation.dart';

import 'lesson_12_question.dart';

enum Lesson12Event {
  ignored,
  inputChanged,
  invalidInput,
  wrong,
  questionCorrect,
  nextQuestion,
  completed,
}

class Lesson12Controller extends ChangeNotifier {
  Lesson12Controller({
    required List<Lesson12Question> allQuestions,
    this.roundSize = 10,
    Random? random,
  })  : _allQuestions = List.unmodifiable(allQuestions),
        _random = random ?? Random() {
    _questions = _buildRound(_allQuestions);
    _prepareQuestion();
  }

  Lesson12Controller.forQuestions(List<Lesson12Question> questions)
      : _allQuestions = List.unmodifiable(questions),
        roundSize = questions.length,
        _random = Random(0) {
    _questions = List.of(questions);
    _prepareQuestion();
  }

  final List<Lesson12Question> _allQuestions;
  final int roundSize;
  final Random _random;
  List<Lesson12Question> _questions = const [];
  final Map<String, String> _answers = {};
  final Set<String> _wrongFields = {};
  final Set<String> _missedIds = {};
  int _index = 0;
  int _score = 0;
  int _mistakes = 0;
  bool _complete = false;
  bool _resolved = false;
  bool _reviewMode = false;
  bool _questionHadMistake = false;
  String? _errorMessage;

  Lesson12Question get currentQuestion => _questions[_index];
  int get index => _index;
  int get total => _questions.length;
  int get score => _score;
  int get mistakes => _mistakes;
  bool get isComplete => _complete;
  bool get isResolved => _resolved;
  bool get isReviewMode => _reviewMode;
  bool get questionHadMistake => _questionHadMistake;
  String? get errorMessage => _errorMessage;
  Set<String> get wrongFields => Set.unmodifiable(_wrongFields);
  double get progress =>
      total == 0 ? 0 : (_index + (_resolved ? 1 : 0)) / total;
  List<Lesson12Question> get missedQuestions => _allQuestions
      .where((question) => _missedIds.contains(question.id))
      .toList(growable: false);

  String typedValue(String field) => _answers[field] ?? '';

  String submittedValue(String field) {
    final typed = typedValue(field).trim();
    if (field != 'present') return typed;
    return '${currentQuestion.presentFirstLetter}$typed';
  }

  bool isFieldCorrect(String field) {
    return normalize(submittedValue(field)) ==
        normalize(currentQuestion.form(field));
  }

  Lesson12Event updateAnswer(String field, String value) {
    if (_resolved || !Lesson12Question.fields.contains(field)) {
      return Lesson12Event.ignored;
    }
    final cleaned = value.length > 28 ? value.substring(0, 28) : value;
    if (_answers[field] == cleaned) return Lesson12Event.ignored;
    _answers[field] = cleaned;
    _wrongFields.remove(field);
    _errorMessage = null;
    notifyListeners();
    return Lesson12Event.inputChanged;
  }

  Lesson12Event submit() {
    if (_resolved) return Lesson12Event.ignored;
    final incomplete = Lesson12Question.fields.where((field) {
      if (field == 'present') {
        return submittedValue(field).length < 2;
      }
      return typedValue(field).trim().isEmpty;
    }).toSet();
    if (incomplete.isNotEmpty) {
      _wrongFields
        ..clear()
        ..addAll(incomplete);
      _errorMessage = '請完成四個動詞形式。';
      notifyListeners();
      return Lesson12Event.invalidInput;
    }

    final wrong = Lesson12Question.fields
        .where((field) => !isFieldCorrect(field))
        .toSet();
    if (wrong.isNotEmpty) {
      _wrongFields
        ..clear()
        ..addAll(wrong);
      _recordMistake();
      _errorMessage = '紅色格未正確，修改後再確定。';
      notifyListeners();
      return Lesson12Event.wrong;
    }

    _wrongFields.clear();
    _errorMessage = null;
    _resolved = true;
    if (!_questionHadMistake) _score += 1;
    notifyListeners();
    return Lesson12Event.questionCorrect;
  }

  Lesson12Event next() {
    if (!_resolved || _complete) return Lesson12Event.ignored;
    if (_index == _questions.length - 1) {
      _complete = true;
      notifyListeners();
      return Lesson12Event.completed;
    }
    _index += 1;
    _prepareQuestion();
    notifyListeners();
    return Lesson12Event.nextQuestion;
  }

  void restart() {
    _reviewMode = false;
    _questions = _buildRound(_allQuestions);
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
    _answers.clear();
    _wrongFields.clear();
    _resolved = false;
    _questionHadMistake = false;
    _errorMessage = null;
  }

  List<Lesson12Question> _buildRound(List<Lesson12Question> source) {
    final shuffled = List<Lesson12Question>.of(source)..shuffle(_random);
    return shuffled
        .take(min(roundSize, shuffled.length))
        .toList(growable: false);
  }

  static String normalize(String value) {
    return value.trim().toLowerCase().replaceAll(RegExp(r'\s+'), ' ');
  }
}
