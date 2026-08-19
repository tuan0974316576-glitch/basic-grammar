import 'package:flutter/foundation.dart';

import 'lesson_04_question.dart';

enum Lesson04Event {
  ignored,
  selectionChanged,
  placed,
  invalidInput,
  wrong,
  questionCorrect,
  nextQuestion,
  completed,
}

class Lesson04Controller extends ChangeNotifier {
  Lesson04Controller(List<Lesson04Question> questions)
      : _allQuestions = List.unmodifiable(questions),
        _questions = List.of(questions) {
    _prepareQuestion();
  }

  static const roles = [
    ('subject', '主語'),
    ('object', '非主語'),
    ('possessiveAdjective', '的'),
    ('possessivePronoun', '的東西'),
  ];

  final List<Lesson04Question> _allQuestions;
  List<Lesson04Question> _questions;
  late List<Lesson04Tile> _tiles;
  final Map<String, String> _placements = {};
  final Set<String> _wrongSlots = {};
  final Set<String> _missedIds = {};
  String? _selectedTileId;
  String? _selectedSlot;
  int _index = 0;
  int _score = 0;
  int _mistakes = 0;
  bool _resolved = false;
  bool _complete = false;
  bool _questionHadMistake = false;
  bool _reviewMode = false;
  bool _lastPlacementCorrect = false;

  Lesson04Question get currentQuestion => _questions[_index];
  List<Lesson04Tile> get tiles => List.unmodifiable(_tiles);
  Map<String, String> get placements => Map.unmodifiable(_placements);
  Set<String> get wrongSlots => Set.unmodifiable(_wrongSlots);
  String? get selectedTileId => _selectedTileId;
  String? get selectedSlot => _selectedSlot;
  int get index => _index;
  int get total => _questions.length;
  int get score => _score;
  int get mistakes => _mistakes;
  bool get isResolved => _resolved;
  bool get isComplete => _complete;
  bool get isReviewMode => _reviewMode;
  bool get canSubmit => _placements.length == roles.length && !_resolved;
  bool get isLastQuestion => _index == _questions.length - 1;
  double get progress =>
      total == 0 ? 0 : (_index + (_resolved ? 1 : 0)) / total;

  List<Lesson04Question> get missedQuestions => _allQuestions
      .where((question) => _missedIds.contains(question.id))
      .toList(growable: false);

  Lesson04Tile? tileById(String? id) {
    if (id == null) return null;
    for (final tile in _tiles) {
      if (tile.id == id) return tile;
    }
    return null;
  }

  bool get lastPlacementWasCorrect => _lastPlacementCorrect;

  int get correctPlacementCount => roles.where((role) {
        final tile = tileById(_placements[role.$1]);
        return tile?.text == currentQuestion.forms[role.$1];
      }).length;

  Lesson04Event selectTile(String tileId) {
    if (_resolved || _complete) return Lesson04Event.ignored;
    if (_placements.containsValue(tileId)) return Lesson04Event.ignored;
    _wrongSlots.clear();
    if (_selectedSlot != null) return _place(tileId, _selectedSlot!);
    _selectedTileId = _selectedTileId == tileId ? null : tileId;
    notifyListeners();
    return Lesson04Event.selectionChanged;
  }

  Lesson04Event selectSlot(String slot) {
    if (_resolved || _complete) return Lesson04Event.ignored;
    _wrongSlots.clear();
    if (_selectedTileId != null) return _place(_selectedTileId!, slot);
    if (_placements.containsKey(slot)) {
      _placements.remove(slot);
      _selectedSlot = null;
      notifyListeners();
      return Lesson04Event.selectionChanged;
    }
    _selectedSlot = _selectedSlot == slot ? null : slot;
    notifyListeners();
    return Lesson04Event.selectionChanged;
  }

  Lesson04Event _place(String tileId, String slot) {
    _placements.removeWhere((_, value) => value == tileId);
    _placements[slot] = tileId;
    _lastPlacementCorrect =
        tileById(tileId)?.text == currentQuestion.forms[slot];
    _selectedTileId = null;
    _selectedSlot = null;
    notifyListeners();
    return Lesson04Event.placed;
  }

  Lesson04Event reset() {
    if (_resolved || _placements.isEmpty) return Lesson04Event.ignored;
    _placements.clear();
    _wrongSlots.clear();
    _selectedTileId = null;
    _selectedSlot = null;
    notifyListeners();
    return Lesson04Event.selectionChanged;
  }

  Lesson04Event submit() {
    if (_resolved || _complete) return Lesson04Event.ignored;
    if (!canSubmit) return Lesson04Event.invalidInput;
    _wrongSlots
      ..clear()
      ..addAll(roles.where((role) {
        final tile = tileById(_placements[role.$1]);
        return tile?.text != currentQuestion.forms[role.$1];
      }).map((role) => role.$1));
    if (_wrongSlots.isNotEmpty) {
      if (!_questionHadMistake) {
        _questionHadMistake = true;
        _mistakes += 1;
        _missedIds.add(currentQuestion.id);
      }
      notifyListeners();
      return Lesson04Event.wrong;
    }
    _resolved = true;
    if (!_questionHadMistake) _score += 1;
    notifyListeners();
    return Lesson04Event.questionCorrect;
  }

  Lesson04Event next() {
    if (!_resolved || _complete) return Lesson04Event.ignored;
    if (isLastQuestion) {
      _complete = true;
      notifyListeners();
      return Lesson04Event.completed;
    }
    _index += 1;
    _prepareQuestion();
    notifyListeners();
    return Lesson04Event.nextQuestion;
  }

  void restart() {
    _reviewMode = false;
    _questions = List.of(_allQuestions);
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
    _complete = false;
    _missedIds.clear();
    _prepareQuestion();
    notifyListeners();
  }

  void _prepareQuestion() {
    _placements.clear();
    _wrongSlots.clear();
    _selectedTileId = null;
    _selectedSlot = null;
    _resolved = false;
    _questionHadMistake = false;
    _lastPlacementCorrect = false;
    final answerTiles = [
      for (final role in roles)
        Lesson04Tile(
          id: 'answer-${role.$1}',
          text: currentQuestion.forms[role.$1]!,
          answerRole: role.$1,
        ),
    ];
    final answerTexts =
        answerTiles.map((tile) => tile.text.toLowerCase()).toSet();
    final candidates = _allQuestions
        .expand((question) => question.forms.values)
        .where((text) => !answerTexts.contains(text.toLowerCase()))
        .toSet()
        .toList(growable: false);
    final distractors = <Lesson04Tile>[];
    for (var offset = 0;
        offset < candidates.length && distractors.length < 2;
        offset++) {
      final text = candidates[(_index * 3 + offset) % candidates.length];
      if (distractors.any(
        (tile) => tile.text.toLowerCase() == text.toLowerCase(),
      )) {
        continue;
      }
      distractors.add(Lesson04Tile(id: 'distractor-$offset', text: text));
    }
    _tiles = [...answerTiles, ...distractors]..shuffle();
  }
}
