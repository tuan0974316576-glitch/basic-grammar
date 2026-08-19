import 'dart:math';

import 'package:flutter/foundation.dart';

import 'quiz_01_question.dart';
import 'quiz_01_repository.dart';

enum Quiz01Event {
  ignored,
  selectionChanged,
  invalidInput,
  wrong,
  questionCorrect,
  nextQuestion,
  completed,
}

class Quiz01Feedback {
  const Quiz01Feedback({
    required this.isCorrect,
    required this.title,
    required this.answer,
    this.picked = '',
  });

  final bool isCorrect;
  final String title;
  final String answer;
  final String picked;
}

class Quiz01Controller extends ChangeNotifier {
  Quiz01Controller({
    required List<Quiz01Question> allQuestions,
    int roundSize = 10,
    Random? random,
  })  : _allQuestions = List.unmodifiable(allQuestions),
        _roundSize = roundSize,
        _random = random ?? Random() {
    _questions = Quiz01RoundBuilder.build(
      _allQuestions,
      count: _roundSize,
      random: _random,
    );
    _prepareQuestion();
  }

  Quiz01Controller.forQuestions(
    List<Quiz01Question> questions, {
    Random? random,
  })  : _allQuestions = List.unmodifiable(questions),
        _roundSize = questions.length,
        _random = random ?? Random(1),
        _questions = List.of(questions) {
    _prepareQuestion();
  }

  final List<Quiz01Question> _allQuestions;
  final int _roundSize;
  final Random _random;

  late List<Quiz01Question> _questions;
  late List<Quiz01WordBlock> _blocks;
  final List<String> _selectedBlockIds = [];
  final Set<String> _missedQuestionIds = {};
  int _index = 0;
  int _score = 0;
  int _mistakes = 0;
  bool _isResolved = false;
  bool _isComplete = false;
  bool _reviewMode = false;
  Quiz01Feedback? _feedback;

  List<Quiz01Question> get questions => List.unmodifiable(_questions);
  Quiz01Question get currentQuestion => _questions[_index];
  int get index => _index;
  int get total => _questions.length;
  int get score => _score;
  int get mistakes => _mistakes;
  int get accuracy => total == 0 ? 0 : ((_score / total) * 100).round();
  bool get isResolved => _isResolved;
  bool get isComplete => _isComplete;
  bool get isReviewMode => _reviewMode;
  Quiz01Feedback? get feedback => _feedback;
  bool get canSubmit => !_isResolved && _selectedBlockIds.isNotEmpty;

  double get progress {
    if (total == 0) return 0;
    final completed = _index + (_isResolved || _isComplete ? 1 : 0);
    return (completed / total).clamp(0, 1);
  }

  List<Quiz01WordBlock> get selectedBlocks =>
      _selectedBlockIds.map(_blockById).toList(growable: false);

  List<Quiz01WordBlock> get availableBlocks {
    final selected = _selectedBlockIds.toSet();
    return _blocks
        .where((block) => !selected.contains(block.id))
        .toList(growable: false);
  }

  List<Quiz01Question> get missedQuestions => _questions
      .where((question) => _missedQuestionIds.contains(question.id))
      .toList(growable: false);

  Quiz01Event toggleBlock(String blockId) {
    if (_isResolved || _isComplete) return Quiz01Event.ignored;
    if (!_blocks.any((block) => block.id == blockId)) {
      return Quiz01Event.ignored;
    }
    if (_selectedBlockIds.contains(blockId)) {
      _selectedBlockIds.remove(blockId);
    } else {
      _selectedBlockIds.add(blockId);
    }
    _feedback = null;
    notifyListeners();
    return Quiz01Event.selectionChanged;
  }

  Quiz01Event submit() {
    if (_isResolved || _isComplete) return Quiz01Event.ignored;
    if (_selectedBlockIds.isEmpty) {
      _feedback = const Quiz01Feedback(
        isCorrect: false,
        title: '請先揀字塊組成句子。',
        answer: '',
      );
      notifyListeners();
      return Quiz01Event.invalidInput;
    }

    final pickedWords = selectedBlocks.map((block) => block.text).toList();
    final matched = listEquals(pickedWords, currentQuestion.answer);
    _isResolved = true;
    if (matched) {
      _score += 1;
      _feedback = Quiz01Feedback(
        isCorrect: true,
        title: '句子次序正確！',
        answer: currentQuestion.answerText,
      );
      notifyListeners();
      return Quiz01Event.questionCorrect;
    }

    _mistakes += 1;
    _missedQuestionIds.add(currentQuestion.id);
    _feedback = Quiz01Feedback(
      isCorrect: false,
      title: '句子次序未正確。',
      picked: pickedWords.join(' '),
      answer: currentQuestion.answerText,
    );
    notifyListeners();
    return Quiz01Event.wrong;
  }

  Quiz01Event next() {
    if (!_isResolved || _isComplete) return Quiz01Event.ignored;
    if (_index >= _questions.length - 1) {
      _isComplete = true;
      notifyListeners();
      return Quiz01Event.completed;
    }
    _index += 1;
    _resetQuestion();
    notifyListeners();
    return Quiz01Event.nextQuestion;
  }

  void restart() {
    _reviewMode = false;
    _questions = Quiz01RoundBuilder.build(
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

  Quiz01WordBlock _blockById(String id) {
    return _blocks.firstWhere((block) => block.id == id);
  }

  void _prepareQuestion() {
    _blocks = currentQuestion.buildBlocks(_random);
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
    _selectedBlockIds.clear();
    _feedback = null;
    _isResolved = false;
    _prepareQuestion();
  }
}
