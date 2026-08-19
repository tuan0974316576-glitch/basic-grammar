import 'dart:math';

import 'package:flutter/foundation.dart';

import 'lesson_01_question.dart';
import 'lesson_01_repository.dart';

enum Lesson01Stage {
  verbChoice,
  actionVerb,
  needsBe,
  beForm,
  resolved,
  complete,
}

enum Lesson01Event {
  ignored,
  selectionChanged,
  correctStep,
  wrong,
  questionCorrect,
  nextQuestion,
  completed,
}

class Lesson01Feedback {
  const Lesson01Feedback({
    required this.isCorrect,
    required this.title,
    this.lines = const [],
  });

  final bool isCorrect;
  final String title;
  final List<String> lines;
}

class Lesson01Controller extends ChangeNotifier {
  Lesson01Controller({
    required List<Lesson01Question> allQuestions,
    int roundSize = 20,
    Random? random,
  })  : _allQuestions = List.unmodifiable(allQuestions),
        _roundSize = roundSize,
        _random = random ?? Random() {
    _questions = Lesson01RoundBuilder.build(
      _allQuestions,
      count: _roundSize,
      random: _random,
    );
  }

  Lesson01Controller.forQuestions(List<Lesson01Question> questions)
      : _allQuestions = List.unmodifiable(questions),
        _roundSize = questions.length,
        _random = Random(1),
        _questions = List.of(questions);

  final List<Lesson01Question> _allQuestions;
  final int _roundSize;
  final Random _random;

  late List<Lesson01Question> _questions;
  int _index = 0;
  int _score = 0;
  int _mistakes = 0;
  bool _reviewMode = false;
  bool? _resolvedCorrect;
  Lesson01Stage _stage = Lesson01Stage.verbChoice;
  Lesson01Feedback? _feedback;
  final Set<int> _selectedVerbIndexes = {};
  final Set<String> _missedQuestionIds = {};

  List<Lesson01Question> get questions => List.unmodifiable(_questions);
  Lesson01Question get currentQuestion => _questions[_index];
  int get index => _index;
  int get total => _questions.length;
  int get score => _score;
  int get mistakes => _mistakes;
  bool get isReviewMode => _reviewMode;
  bool? get resolvedCorrect => _resolvedCorrect;
  Lesson01Stage get stage => _stage;
  Lesson01Feedback? get feedback => _feedback;
  Set<int> get selectedVerbIndexes => Set.unmodifiable(_selectedVerbIndexes);
  bool get isComplete => _stage == Lesson01Stage.complete;
  bool get isResolved => _stage == Lesson01Stage.resolved;

  double get progress {
    if (total == 0) return 0;
    final completed = _index + (isResolved || isComplete ? 1 : 0);
    return (completed / total).clamp(0, 1);
  }

  int get accuracy => total == 0 ? 0 : ((_score / total) * 100).round();

  List<Lesson01Question> get missedQuestions {
    return _questions
        .where((question) => _missedQuestionIds.contains(question.id))
        .toList(growable: false);
  }

  Lesson01Event answerVerbChoice(bool hasActionVerb) {
    if (_stage != Lesson01Stage.verbChoice) return Lesson01Event.ignored;
    final question = currentQuestion;
    if (question.hasActionVerb != hasActionVerb) {
      return _resolveWrong(_verbChoiceExplanation(question, hasActionVerb));
    }

    if (question.type == Lesson01QuestionType.action) {
      _stage = Lesson01Stage.actionVerb;
      _feedback = const Lesson01Feedback(
        isCorrect: true,
        title: '正確，有動詞。',
      );
    } else {
      _stage = Lesson01Stage.needsBe;
      _feedback = Lesson01Feedback(
        isCorrect: true,
        title: question.type == Lesson01QuestionType.be
            ? '正確，「是」不算動詞'
            : '正確，句子沒有動詞。',
      );
    }
    notifyListeners();
    return Lesson01Event.correctStep;
  }

  Lesson01Event toggleVerbToken(int index) {
    if (_stage != Lesson01Stage.actionVerb) return Lesson01Event.ignored;
    if (_selectedVerbIndexes.contains(index)) {
      _selectedVerbIndexes.remove(index);
    } else {
      _selectedVerbIndexes.add(index);
    }
    notifyListeners();
    return Lesson01Event.selectionChanged;
  }

  Lesson01Event submitVerbTokens() {
    if (_stage != Lesson01Stage.actionVerb || _selectedVerbIndexes.isEmpty) {
      return Lesson01Event.ignored;
    }
    final question = currentQuestion;
    if (!question.isCorrectVerbSelection(_selectedVerbIndexes)) {
      return _resolveWrong(
        Lesson01Feedback(
          isCorrect: false,
          title: '動詞選錯了',
          lines: [
            question.note,
            '應該揀「${question.actionVerbText}」。',
          ],
        ),
      );
    }
    return _resolveCorrect(
      Lesson01Feedback(
        isCorrect: true,
        title: '答對了！',
        lines: [question.note],
      ),
    );
  }

  Lesson01Event answerNeedsBe(bool needsBe) {
    if (_stage != Lesson01Stage.needsBe) return Lesson01Event.ignored;
    if (!needsBe) {
      return _resolveWrong(
        const Lesson01Feedback(
          isCorrect: false,
          title: '英文句子要加 be 動詞',
          lines: ['句子沒有動詞，所以要加 is / am / are 作為動詞。'],
        ),
      );
    }

    _stage = Lesson01Stage.beForm;
    _feedback = const Lesson01Feedback(
      isCorrect: true,
      title: '正確，要加 is / am / are。',
    );
    notifyListeners();
    return Lesson01Event.correctStep;
  }

  Lesson01Event answerBeForm(String form) {
    if (_stage != Lesson01Stage.beForm) return Lesson01Event.ignored;
    final question = currentQuestion;
    if (form != question.beForm) {
      return _resolveWrong(
        Lesson01Feedback(
          isCorrect: false,
          title: 'be 動詞選錯了',
          lines: [
            '你揀了 $form。',
            question.beRuleExplanation,
          ],
        ),
      );
    }
    return _resolveCorrect(
      Lesson01Feedback(
        isCorrect: true,
        title: '答對了！',
        lines: [question.beRuleExplanation],
      ),
    );
  }

  Lesson01Event next() {
    if (_stage != Lesson01Stage.resolved) return Lesson01Event.ignored;
    if (_index >= _questions.length - 1) {
      _stage = Lesson01Stage.complete;
      notifyListeners();
      return Lesson01Event.completed;
    }
    _index += 1;
    _resetQuestion();
    notifyListeners();
    return Lesson01Event.nextQuestion;
  }

  void restart() {
    _reviewMode = false;
    _questions = Lesson01RoundBuilder.build(
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

  Lesson01Event _resolveCorrect(Lesson01Feedback feedback) {
    _score += 1;
    _resolvedCorrect = true;
    _stage = Lesson01Stage.resolved;
    _feedback = feedback;
    notifyListeners();
    return Lesson01Event.questionCorrect;
  }

  Lesson01Event _resolveWrong(Lesson01Feedback feedback) {
    _mistakes += 1;
    _missedQuestionIds.add(currentQuestion.id);
    _resolvedCorrect = false;
    _stage = Lesson01Stage.resolved;
    _feedback = feedback;
    notifyListeners();
    return Lesson01Event.wrong;
  }

  Lesson01Feedback _verbChoiceExplanation(
    Lesson01Question question,
    bool pickedHasVerb,
  ) {
    if (question.type == Lesson01QuestionType.action) {
      return Lesson01Feedback(
        isCorrect: false,
        title: '這句有主動動詞',
        lines: ['${question.note} 所以應該按 TICK。'],
      );
    }
    if (question.type == Lesson01QuestionType.be) {
      return const Lesson01Feedback(
        isCorrect: false,
        title: '「是」不算動詞',
        lines: ['所以應該按 CROSS。'],
      );
    }
    return Lesson01Feedback(
      isCorrect: false,
      title: '這句沒有主動動詞',
      lines: [
        pickedHasVerb ? '這句是在形容主語，所以應該按 CROSS。' : '再看一次句子的意思。',
      ],
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
    _stage = Lesson01Stage.verbChoice;
    _feedback = null;
    _resolvedCorrect = null;
    _selectedVerbIndexes.clear();
  }
}
