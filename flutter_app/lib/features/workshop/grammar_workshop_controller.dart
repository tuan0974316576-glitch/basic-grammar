import 'dart:math' as math;

import 'package:flutter/foundation.dart';

import 'grammar_workshop_models.dart';

class GrammarWorkshopToken {
  const GrammarWorkshopToken({required this.id, required this.text});

  final String id;
  final String text;
}

class GrammarWorkshopPracticeController extends ChangeNotifier {
  GrammarWorkshopPracticeController({
    required this.topic,
    int questionCount = 10,
    math.Random? random,
  }) : _random = random ?? math.Random() {
    final questions = [...topic.questions]..shuffle(_random);
    _round = questions.take(math.min(questionCount, questions.length)).toList();
    _prepareQuestion();
  }

  final GrammarWorkshopTopic topic;
  final math.Random _random;
  late final List<GrammarWorkshopQuestion> _round;
  int _questionIndex = 0;
  int _correctCount = 0;
  bool _answered = false;
  bool _lastCorrect = false;
  bool _complete = false;
  int? _selectedOption;
  List<String> _responses = const [];
  List<GrammarWorkshopToken> _availableTokens = const [];
  List<GrammarWorkshopToken> _selectedTokens = const [];

  List<GrammarWorkshopQuestion> get round => List.unmodifiable(_round);
  GrammarWorkshopQuestion get current => _round[_questionIndex];
  int get questionIndex => _questionIndex;
  int get questionNumber => _questionIndex + 1;
  int get totalQuestions => _round.length;
  int get correctCount => _correctCount;
  bool get answered => _answered;
  bool get lastCorrect => _lastCorrect;
  bool get complete => _complete;
  int? get selectedOption => _selectedOption;
  List<String> get responses => List.unmodifiable(_responses);
  List<GrammarWorkshopToken> get availableTokens =>
      List.unmodifiable(_availableTokens);
  List<GrammarWorkshopToken> get selectedTokens =>
      List.unmodifiable(_selectedTokens);

  bool get canSubmit {
    if (_answered || _complete) return false;
    return switch (current.kind) {
      GrammarWorkshopKind.choice ||
      GrammarWorkshopKind.synonym =>
        _selectedOption != null,
      GrammarWorkshopKind.rearrange => _selectedTokens.isNotEmpty,
      GrammarWorkshopKind.fill ||
      GrammarWorkshopKind.verb =>
        _responses.isNotEmpty &&
            _responses.every((response) => response.trim().isNotEmpty),
    };
  }

  void selectOption(int index) {
    if (_answered || index < 0 || index >= current.options.length) return;
    _selectedOption = index;
    notifyListeners();
  }

  void updateResponse(int index, String value) {
    if (_answered || index < 0 || index >= _responses.length) return;
    _responses = [..._responses]..[index] = value;
    notifyListeners();
  }

  void selectToken(String id) {
    if (_answered) return;
    final index = _availableTokens.indexWhere((token) => token.id == id);
    if (index < 0) return;
    final token = _availableTokens[index];
    _availableTokens = [..._availableTokens]..removeAt(index);
    _selectedTokens = [..._selectedTokens, token];
    notifyListeners();
  }

  void removeToken(String id) {
    if (_answered) return;
    final index = _selectedTokens.indexWhere((token) => token.id == id);
    if (index < 0) return;
    final token = _selectedTokens[index];
    _selectedTokens = [..._selectedTokens]..removeAt(index);
    _availableTokens = [..._availableTokens, token];
    notifyListeners();
  }

  bool submit() {
    if (!canSubmit) return false;
    _lastCorrect = switch (current.kind) {
      GrammarWorkshopKind.choice =>
        _selectedOption != null && current.isAcceptedChoice(_selectedOption!),
      GrammarWorkshopKind.synonym => _selectedOption != null,
      GrammarWorkshopKind.rearrange => _isRearrangeCorrect(),
      GrammarWorkshopKind.fill => _isFillCorrect(),
      GrammarWorkshopKind.verb => _isVerbCorrect(),
    };
    _answered = true;
    if (_lastCorrect) _correctCount += 1;
    notifyListeners();
    return true;
  }

  void next() {
    if (!_answered || _complete) return;
    if (_questionIndex >= _round.length - 1) {
      _complete = true;
      notifyListeners();
      return;
    }
    _questionIndex += 1;
    _prepareQuestion();
    notifyListeners();
  }

  void _prepareQuestion() {
    _answered = false;
    _lastCorrect = false;
    _selectedOption = null;
    _responses = List.filled(
      current.kind == GrammarWorkshopKind.verb ? 4 : current.responseFieldCount,
      '',
    );
    _selectedTokens = const [];
    if (current.kind == GrammarWorkshopKind.rearrange) {
      final requiredCounts = <String, int>{};
      final displayByKey = <String, String>{};
      for (final tokens in current.correctTokenSets) {
        final counts = <String, int>{};
        for (final token in tokens) {
          final key = normalizeGrammarWorkshopAnswer(token);
          displayByKey.putIfAbsent(key, () => token);
          counts[key] = (counts[key] ?? 0) + 1;
        }
        for (final entry in counts.entries) {
          if (entry.value > (requiredCounts[entry.key] ?? 0)) {
            requiredCounts[entry.key] = entry.value;
          }
        }
      }
      final values = <String>[
        for (final entry in requiredCounts.entries)
          for (var count = 0; count < entry.value; count += 1)
            displayByKey[entry.key]!,
        ...current.distractors,
      ];
      _availableTokens = [
        for (var index = 0; index < values.length; index += 1)
          GrammarWorkshopToken(
            id: '${current.id}-token-$index',
            text: values[index],
          ),
      ]..shuffle(_random);
    } else {
      _availableTokens = const [];
    }
  }

  bool _isFillCorrect() {
    if (current.answerSlots.isNotEmpty) {
      if (current.answerSlots.length == 1 && current.answers.length > 1) {
        final response = normalizeGrammarWorkshopAnswer(_responses.first);
        return current.answers.any(
          (answer) => normalizeGrammarWorkshopAnswer(answer) == response,
        );
      }
      if (_responses.length != current.answerSlots.length) return false;
      for (var index = 0; index < _responses.length; index += 1) {
        if (normalizeGrammarWorkshopAnswer(_responses[index]) !=
            normalizeGrammarWorkshopAnswer(current.answerSlots[index])) {
          return false;
        }
      }
      return true;
    }
    final response = normalizeGrammarWorkshopAnswer(_responses.first);
    return current.answers.any(
      (answer) => normalizeGrammarWorkshopAnswer(answer) == response,
    );
  }

  bool _isVerbCorrect() {
    final forms = current.verbForms;
    if (_responses.length != forms.length) return false;
    for (var index = 0; index < forms.length; index += 1) {
      final accepted =
          forms[index].split('/').map(normalizeGrammarWorkshopAnswer).toSet();
      if (!accepted
          .contains(normalizeGrammarWorkshopAnswer(_responses[index]))) {
        return false;
      }
    }
    return true;
  }

  bool _isRearrangeCorrect() {
    final answer = normalizeGrammarWorkshopAnswer(
      grammarWorkshopTokensToSentence(
        _selectedTokens.map((token) => token.text).toList(),
      ),
    );
    return current.correctTokenSets.any((tokens) {
      return normalizeGrammarWorkshopAnswer(
            grammarWorkshopTokensToSentence(tokens),
          ) ==
          answer;
    });
  }
}
