import 'dart:math';

import 'package:flutter/foundation.dart';

import 'lesson_02_question.dart';
import 'lesson_02_repository.dart';

enum Lesson02Stage {
  judgment,
  verbCount,
  verbTokens,
  correction,
  resolved,
  complete,
}

enum Lesson02Event {
  ignored,
  inputChanged,
  selectionChanged,
  correctStep,
  invalidInput,
  wrong,
  questionCorrect,
  nextQuestion,
  completed,
}

class Lesson02Feedback {
  const Lesson02Feedback({
    required this.isCorrect,
    required this.title,
    this.reason = '',
    this.answer = '',
  });

  final bool isCorrect;
  final String title;
  final String reason;
  final String answer;
}

class Lesson02Controller extends ChangeNotifier {
  Lesson02Controller({
    required List<Lesson02Question> allQuestions,
    int roundSize = 20,
    Random? random,
  })  : _allQuestions = List.unmodifiable(allQuestions),
        _roundSize = roundSize,
        _random = random ?? Random() {
    _questions = Lesson02RoundBuilder.build(
      _allQuestions,
      count: _roundSize,
      random: _random,
    );
  }

  Lesson02Controller.forQuestions(List<Lesson02Question> questions)
      : _allQuestions = List.unmodifiable(questions),
        _roundSize = questions.length,
        _random = Random(1),
        _questions = List.of(questions);

  final List<Lesson02Question> _allQuestions;
  final int _roundSize;
  final Random _random;

  late List<Lesson02Question> _questions;
  int _index = 0;
  int _score = 0;
  int _mistakes = 0;
  bool _reviewMode = false;
  bool? _resolvedCorrect;
  Lesson02Stage _stage = Lesson02Stage.judgment;
  Lesson02Feedback? _feedback;
  String _typedCorrection = '';
  final Set<int> _selectedVerbIndexes = {};
  final Set<String> _missedQuestionIds = {};

  List<Lesson02Question> get questions => List.unmodifiable(_questions);
  Lesson02Question get currentQuestion => _questions[_index];
  int get index => _index;
  int get total => _questions.length;
  int get score => _score;
  int get mistakes => _mistakes;
  int get accuracy => total == 0 ? 0 : ((_score / total) * 100).round();
  bool get isReviewMode => _reviewMode;
  bool? get resolvedCorrect => _resolvedCorrect;
  Lesson02Stage get stage => _stage;
  Lesson02Feedback? get feedback => _feedback;
  String get typedCorrection => _typedCorrection;
  Set<int> get selectedVerbIndexes => Set.unmodifiable(_selectedVerbIndexes);
  bool get isResolved => _stage == Lesson02Stage.resolved;
  bool get isComplete => _stage == Lesson02Stage.complete;

  double get progress {
    if (total == 0) return 0;
    final completed = _index + (isResolved || isComplete ? 1 : 0);
    return (completed / total).clamp(0, 1);
  }

  List<Lesson02Question> get missedQuestions {
    return _questions
        .where((question) => _missedQuestionIds.contains(question.id))
        .toList(growable: false);
  }

  Lesson02Event answerJudgment(bool pickedCorrect) {
    if (_stage != Lesson02Stage.judgment) return Lesson02Event.ignored;
    final question = currentQuestion;
    if (pickedCorrect != question.isCorrect) {
      return _resolveWrong(
        question.isCorrect ? '句子本身正確。' : '句子其實錯誤。',
      );
    }
    _stage = Lesson02Stage.verbCount;
    _feedback = const Lesson02Feedback(
      isCorrect: true,
      title: '判斷正確，繼續數動詞。',
    );
    notifyListeners();
    return Lesson02Event.correctStep;
  }

  Lesson02Event answerVerbCount(int count) {
    if (_stage != Lesson02Stage.verbCount) return Lesson02Event.ignored;
    final question = currentQuestion;
    if (count != question.verbCount) {
      return _resolveWrong('動詞數目選錯了。');
    }
    if (question.isCorrect) {
      return _resolveCorrect();
    }
    if (question.verbCount == 0) {
      return _openCorrection('數目正確。請打返完整正確句子。');
    }
    _stage = Lesson02Stage.verbTokens;
    _feedback = const Lesson02Feedback(
      isCorrect: true,
      title: '數目正確，再揀出兩個動詞。',
    );
    notifyListeners();
    return Lesson02Event.correctStep;
  }

  Lesson02Event toggleVerbToken(int index) {
    if (_stage != Lesson02Stage.verbTokens) return Lesson02Event.ignored;
    if (_selectedVerbIndexes.contains(index)) {
      _selectedVerbIndexes.remove(index);
    } else {
      _selectedVerbIndexes.add(index);
    }
    notifyListeners();
    return Lesson02Event.selectionChanged;
  }

  Lesson02Event submitVerbTokens() {
    if (_stage != Lesson02Stage.verbTokens || _selectedVerbIndexes.isEmpty) {
      return Lesson02Event.ignored;
    }
    if (!currentQuestion.isCorrectVerbSelection(_selectedVerbIndexes)) {
      return _resolveWrong('動詞選錯了。');
    }
    return _openCorrection('兩個動詞都揀對了。請打返完整正確句子。');
  }

  Lesson02Event appendCharacter(String character) {
    if (_stage != Lesson02Stage.correction || _typedCorrection.length >= 80) {
      return Lesson02Event.ignored;
    }
    if (!RegExp(r"^[a-zA-Z '\-]$").hasMatch(character)) {
      return Lesson02Event.ignored;
    }
    var next = character;
    if (RegExp(r'^[a-z]$').hasMatch(character) && _shouldCapitalizeNext) {
      next = character.toUpperCase();
    }
    _typedCorrection += next;
    _feedback = null;
    notifyListeners();
    return Lesson02Event.inputChanged;
  }

  Lesson02Event backspace() {
    if (_stage != Lesson02Stage.correction || _typedCorrection.isEmpty) {
      return Lesson02Event.ignored;
    }
    _typedCorrection =
        _typedCorrection.substring(0, _typedCorrection.length - 1);
    _feedback = null;
    notifyListeners();
    return Lesson02Event.inputChanged;
  }

  Lesson02Event updateCorrection(String value) {
    if (_stage != Lesson02Stage.correction) return Lesson02Event.ignored;
    var next = value.length > 80 ? value.substring(0, 80) : value;
    if (next.isNotEmpty && RegExp(r'^[a-z]').hasMatch(next)) {
      next = '${next[0].toUpperCase()}${next.substring(1)}';
    }
    if (next == _typedCorrection) return Lesson02Event.ignored;
    _typedCorrection = next;
    _feedback = null;
    notifyListeners();
    return Lesson02Event.inputChanged;
  }

  Lesson02Event submitCorrection() {
    if (_stage != Lesson02Stage.correction) return Lesson02Event.ignored;
    if (_typedCorrection.trim().isEmpty) {
      _feedback = const Lesson02Feedback(
        isCorrect: false,
        title: '請先輸入正確英文句子。',
      );
      notifyListeners();
      return Lesson02Event.invalidInput;
    }
    if (!currentQuestion.acceptsCorrection(_typedCorrection)) {
      return _resolveWrong('改寫未正確。');
    }
    return _resolveCorrect();
  }

  Lesson02Event next() {
    if (_stage != Lesson02Stage.resolved) return Lesson02Event.ignored;
    if (_index >= _questions.length - 1) {
      _stage = Lesson02Stage.complete;
      notifyListeners();
      return Lesson02Event.completed;
    }
    _index += 1;
    _resetQuestion();
    notifyListeners();
    return Lesson02Event.nextQuestion;
  }

  void restart() {
    _reviewMode = false;
    _questions = Lesson02RoundBuilder.build(
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

  bool get _shouldCapitalizeNext {
    final trimmed = _typedCorrection.replaceFirst(RegExp(r'\s+$'), '');
    return trimmed.isEmpty || RegExp(r'[.!?]$').hasMatch(trimmed);
  }

  Lesson02Event _openCorrection(String title) {
    _stage = Lesson02Stage.correction;
    _feedback = Lesson02Feedback(isCorrect: true, title: title);
    _typedCorrection = '';
    notifyListeners();
    return Lesson02Event.correctStep;
  }

  Lesson02Event _resolveCorrect() {
    _score += 1;
    _resolvedCorrect = true;
    _stage = Lesson02Stage.resolved;
    _feedback = _answerFeedback(true, '答對了！');
    notifyListeners();
    return Lesson02Event.questionCorrect;
  }

  Lesson02Event _resolveWrong(String title) {
    _mistakes += 1;
    _missedQuestionIds.add(currentQuestion.id);
    _resolvedCorrect = false;
    _stage = Lesson02Stage.resolved;
    _feedback = _answerFeedback(false, title);
    notifyListeners();
    return Lesson02Event.wrong;
  }

  Lesson02Feedback _answerFeedback(bool isCorrect, String title) {
    return Lesson02Feedback(
      isCorrect: isCorrect,
      title: title,
      reason: currentQuestion.reasonLine,
      answer: currentQuestion.answerLine,
    );
  }

  void _resetRound() {
    _index = 0;
    _score = 0;
    _mistakes = 0;
    _missedQuestionIds.clear();
    _resetQuestion();
    notifyListeners();
  }

  void _resetQuestion() {
    _stage = Lesson02Stage.judgment;
    _feedback = null;
    _resolvedCorrect = null;
    _typedCorrection = '';
    _selectedVerbIndexes.clear();
  }
}
