import 'dart:math';

import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/vocabulary/vocab_models.dart';
import 'package:dope_english/features/vocabulary/vocab_review_controller.dart';

void main() {
  test('review session matches due vocabulary count up to the session cap', () {
    final controller = VocabReviewController(items: _items(15));
    addTearDown(controller.dispose);

    expect(controller.targetTotal, 15);
    expect(controller.total, 15);
  });

  test('review session takes at most twenty due words, not mastered words', () {
    final controller = VocabReviewController(
      items: [
        ..._items(25),
        for (var index = 1; index <= 4; index++)
          _reviewItem(
            'mastered-$index',
            '已掌握',
            totalSeen: 3,
            totalCorrect: 3,
            reviewMastered: true,
          ),
      ],
    );
    addTearDown(controller.dispose);

    expect(controller.targetTotal, 20);
    expect(controller.questions, hasLength(20));
    expect(controller.questions, everyElement(isA<VocabReviewQuestion>()));
    expect(
      controller.questions.any((question) => question.item.reviewMastered),
      isFalse,
    );
  });

  test('cycles through reading, listening, spelling, and speaking', () {
    final controller = VocabReviewController(
      items: _items(4),
      random: Random(7),
    );
    addTearDown(controller.dispose);

    expect(controller.total, 4);
    expect(
      controller.questions.map((question) => question.kind),
      [
        VocabReviewKind.reading,
        VocabReviewKind.listening,
        VocabReviewKind.spelling,
        VocabReviewKind.speakingWord,
      ],
    );
    expect(controller.questions.first.choices, hasLength(4));
    expect(controller.progress, 0);

    expect(
      controller.choose(controller.currentQuestion!.correctMeaning),
      VocabReviewEvent.correct,
    );
    expect(controller.score, 1);
    expect(controller.progress, closeTo(0.25, 0.001));
    expect(controller.next(), VocabReviewEvent.nextQuestion);

    final listening = controller.currentQuestion!;
    expect(listening.kind, VocabReviewKind.listening);
    expect(
      controller.choose('不是正確意思'),
      VocabReviewEvent.wrong,
    );
    expect(controller.score, 1);
    expect(controller.next(), VocabReviewEvent.nextQuestion);

    expect(controller.currentQuestion!.kind, VocabReviewKind.spelling);
    controller.updateSpelling('word-3');
    expect(controller.submitSpelling(), VocabReviewEvent.correct);
    expect(controller.next(), VocabReviewEvent.nextQuestion);
    expect(controller.currentQuestion!.kind, VocabReviewKind.speakingWord);
    expect(controller.submitSpeaking(true), VocabReviewEvent.correct);
  });

  test('repeat mode requeues wrong answers until they are correct', () {
    final controller = VocabReviewController(
      items: _items(1),
      random: Random(7),
      repeatWrongAnswers: true,
    );
    addTearDown(controller.dispose);

    expect(controller.targetTotal, 1);
    expect(controller.currentQuestion!.kind, VocabReviewKind.spelling);
    controller.updateSpelling('wrong');
    expect(controller.submitSpelling(), VocabReviewEvent.wrong);
    expect(controller.next(), VocabReviewEvent.retryIntro);
    expect(controller.isRetryIntro, isTrue);
    expect(controller.startRetry(), VocabReviewEvent.nextQuestion);
    expect(controller.currentQuestion!.id, contains('-retry-'));
    controller.updateSpelling('word-1');
    expect(controller.submitSpelling(), VocabReviewEvent.correct);
    expect(controller.next(), VocabReviewEvent.completed);
    expect(controller.isComplete, isTrue);
    expect(controller.score, 1);
    expect(controller.wrongCount, 1);
    expect(controller.accuracyPercent, 50);
  });

  test('skips MC when fewer than four same-POS saved words are available', () {
    final controller = VocabReviewController(
      items: _items(1),
      random: Random(3),
    );
    addTearDown(controller.dispose);

    expect(controller.total, 1);
    expect(controller.currentQuestion!.kind, VocabReviewKind.spelling);
    expect(controller.currentQuestion!.choices, isEmpty);
    expect(controller.next(), VocabReviewEvent.ignored);
  });

  test('MC distractors use only saved words in the same POS group', () {
    final controller = VocabReviewController(
      items: _items(4),
      random: Random(21),
    );
    addTearDown(controller.dispose);

    final reading = controller.questions.first;
    expect(reading.kind, VocabReviewKind.reading);
    expect(reading.choices, hasLength(4));
    expect(reading.choices, everyElement(isNot(contains('n.'))));
    expect(
        reading.choices,
        everyElement(anyOf(
          '意思 1',
          '意思 2',
          '意思 3',
          '意思 4',
        )));
  });

  test('reading and listening become spelling when their POS group has three',
      () {
    final controller = VocabReviewController(
      items: _items(3),
      random: Random(2),
    );
    addTearDown(controller.dispose);

    expect(
      controller.questions.map((question) => question.kind),
      [
        VocabReviewKind.spelling,
        VocabReviewKind.spelling,
        VocabReviewKind.spelling,
      ],
    );
  });

  test('MC never repeats overlapping Chinese meanings', () {
    final target = _reviewItem('tremendous', '巨大');
    final controller = VocabReviewController(
      items: [
        target,
        _reviewItem('immense', '巨大的', totalSeen: 1),
        _reviewItem('massive', '巨大的 / 大量的', totalSeen: 1),
        _reviewItem('happy', '開心的', totalSeen: 1),
        _reviewItem('tiny', '細小的', totalSeen: 1),
        _reviewItem('rapid', '快速的', totalSeen: 1),
      ],
      random: Random(12),
    );
    addTearDown(controller.dispose);

    final question = controller.questions.first;
    expect(question.item.word, 'tremendous');
    expect(question.kind, VocabReviewKind.reading);
    expect(question.choices, hasLength(4));
    expect(question.choices.toSet(), hasLength(4));
    expect(question.choices, contains('巨大'));
    expect(question.choices, isNot(contains('巨大的')));
    expect(question.choices, isNot(contains('巨大的 / 大量的')));
  });

  test('a repeated gloss inside one saved word is shown once', () {
    final item = _reviewItem(
      'massive',
      '巨大的 / 大量的',
      extraMeanings: const ['巨大的'],
    );
    final controller = VocabReviewController(items: [item]);
    addTearDown(controller.dispose);

    expect(controller.questions.single.correctMeaning, '巨大的 / 大量的');
  });

  test('sentence cloze unlocks only after listening and spelling mastery', () {
    final locked = _reviewItem('boost', '提升');
    final lockedController = VocabReviewController(
      items: [locked],
      exampleByItemId: const {'boost': 'Daily practice can boost confidence.'},
    );
    addTearDown(lockedController.dispose);
    expect(lockedController.questions.single.kind, VocabReviewKind.spelling);

    final unlocked = locked.copyWith(
      listeningMastered: true,
      spellingMastered: true,
    );
    final unlockedController = VocabReviewController(
      items: [unlocked],
      exampleByItemId: const {'boost': 'Daily practice can boost confidence.'},
    );
    addTearDown(unlockedController.dispose);
    expect(
      unlockedController.questions.single.kind,
      VocabReviewKind.sentenceCloze,
    );
    expect(
      unlockedController.questions.single.exampleSentence,
      'Daily practice can boost confidence.',
    );
  });

  test(
      'speaking upgrades from a word to a sentence when foundations are mastered',
      () {
    final items = _items(4)
        .map((item) => item.copyWith(
              listeningMastered: true,
              spellingMastered: true,
            ))
        .toList();
    final controller = VocabReviewController(
      items: items,
      exampleByItemId: {
        for (final item in items) item.id: 'I can use ${item.word} today.',
      },
      random: Random(4),
    );
    addTearDown(controller.dispose);

    expect(controller.questions[3].kind, VocabReviewKind.speakingSentence);
    expect(controller.questions[3].exampleSentence, 'I can use word-4 today.');
  });

  test('listening opt-out keeps speaking but removes every later listening',
      () {
    final controller = VocabReviewController(
      items: _items(8),
      random: Random(7),
    );
    addTearDown(controller.dispose);

    controller.choose(controller.currentQuestion!.correctMeaning);
    controller.next();
    expect(controller.currentQuestion!.kind, VocabReviewKind.listening);

    expect(controller.disableQuestionsLike(VocabReviewKind.listening), isTrue);
    expect(controller.listeningQuestionsDisabled, isTrue);
    expect(controller.speakingQuestionsDisabled, isFalse);
    expect(controller.currentQuestion!.kind, VocabReviewKind.reading);
    expect(
      controller.questions.skip(controller.index),
      everyElement(
        isA<VocabReviewQuestion>().having(
          (question) => question.kind.needsListening,
          'needs listening',
          isFalse,
        ),
      ),
    );
    expect(
      controller.questions.any((question) => question.kind.needsSpeaking),
      isTrue,
    );
    expect(controller.total, 8);
  });

  test('speaking opt-out removes word and sentence speaking only', () {
    final items = _items(8);
    final controller = VocabReviewController(items: items, random: Random(7));
    addTearDown(controller.dispose);

    for (var index = 0; index < 3; index += 1) {
      final question = controller.currentQuestion!;
      if (question.kind == VocabReviewKind.spelling) {
        controller.updateSpelling(question.item.word);
        controller.submitSpelling();
      } else {
        controller.choose(question.correctMeaning);
      }
      controller.next();
    }
    expect(controller.currentQuestion!.kind, VocabReviewKind.speakingWord);

    expect(
      controller.disableQuestionsLike(VocabReviewKind.speakingWord),
      isTrue,
    );
    expect(controller.speakingQuestionsDisabled, isTrue);
    expect(
      controller.questions.skip(controller.index).any(
            (question) => question.kind.needsSpeaking,
          ),
      isFalse,
    );
    expect(
      controller.questions.any((question) => question.kind.needsListening),
      isTrue,
    );
  });
}

VocabItem _reviewItem(
  String word,
  String meaning, {
  int totalSeen = 0,
  int totalCorrect = 0,
  bool reviewMastered = false,
  List<String> extraMeanings = const [],
}) {
  return VocabItem(
    id: word,
    word: word,
    senses: [
      for (final value in [meaning, ...extraMeanings])
        VocabSense(
          id: '$word-$value',
          word: word,
          display: word,
          meaning: value,
          pos: 'adjective',
          type: 'word',
        ),
    ],
    createdAt: DateTime(2026, 9, 10),
    updatedAt: DateTime(2026, 9, 10),
    totalSeen: totalSeen,
    totalCorrect: totalCorrect,
    reviewMastered: reviewMastered,
  );
}

List<VocabItem> _items(int count) {
  return [
    for (var index = 1; index <= count; index++)
      VocabItem(
        id: 'word-$index',
        word: 'word-$index',
        senses: [
          VocabSense(
            id: 'sense-$index',
            word: 'word-$index',
            display: 'word-$index',
            meaning: '意思 $index',
            pos: 'noun',
            type: 'word',
          ),
        ],
        createdAt: DateTime(2026, 8, index),
        updatedAt: DateTime(2026, 8, index),
      ),
  ];
}
