import 'dart:math';

import 'package:flutter/foundation.dart';

import 'lesson_05_question.dart';
import 'lesson_05_repository.dart';

enum Lesson05Event { ignored, wrong, questionCorrect, nextQuestion, completed }

class Lesson05Controller extends ChangeNotifier {
  Lesson05Controller({
    required List<Lesson05Question> allQuestions,
    int roundSize = 10,
    Random? random,
  })  : _allQuestions = List.unmodifiable(allQuestions),
        _roundSize = roundSize,
        _random = random ?? Random() {
    _questions =
        buildLesson05Round(_allQuestions, count: _roundSize, random: _random);
  }

  Lesson05Controller.forQuestions(List<Lesson05Question> questions)
      : _allQuestions = List.unmodifiable(questions),
        _roundSize = questions.length,
        _random = Random(1),
        _questions = List.of(questions);

  final List<Lesson05Question> _allQuestions;
  final int _roundSize;
  final Random _random;
  late List<Lesson05Question> _questions;
  final Set<String> _missedIds = {};
  int _index = 0;
  int _score = 0;
  int _mistakes = 0;
  String? _selectedChoice;
  bool _resolved = false;
  bool _complete = false;
  bool _reviewMode = false;

  Lesson05Question get currentQuestion => _questions[_index];
  int get index => _index;
  int get total => _questions.length;
  int get score => _score;
  int get mistakes => _mistakes;
  String? get selectedChoice => _selectedChoice;
  bool get isResolved => _resolved;
  bool get isComplete => _complete;
  bool get isReviewMode => _reviewMode;
  bool get answerWasCorrect => _selectedChoice == currentQuestion.answer;
  double get progress =>
      total == 0 ? 0 : (_index + (_resolved ? 1 : 0)) / total;
  List<Lesson05Question> get missedQuestions => _allQuestions
      .where((question) => _missedIds.contains(question.id))
      .toList(growable: false);

  Lesson05Event answer(String choice) {
    if (_resolved || _complete || !currentQuestion.choices.contains(choice)) {
      return Lesson05Event.ignored;
    }
    _selectedChoice = choice;
    _resolved = true;
    if (choice == currentQuestion.answer) {
      _score += 1;
      notifyListeners();
      return Lesson05Event.questionCorrect;
    }
    _mistakes += 1;
    _missedIds.add(currentQuestion.id);
    notifyListeners();
    return Lesson05Event.wrong;
  }

  Lesson05Event next() {
    if (!_resolved || _complete) return Lesson05Event.ignored;
    if (_index == _questions.length - 1) {
      _complete = true;
      notifyListeners();
      return Lesson05Event.completed;
    }
    _index += 1;
    _selectedChoice = null;
    _resolved = false;
    notifyListeners();
    return Lesson05Event.nextQuestion;
  }

  void restart() {
    _reviewMode = false;
    _questions =
        buildLesson05Round(_allQuestions, count: _roundSize, random: _random);
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

  void _resetRound() {
    _index = 0;
    _score = 0;
    _mistakes = 0;
    _selectedChoice = null;
    _resolved = false;
    _complete = false;
    _missedIds.clear();
    notifyListeners();
  }
}
