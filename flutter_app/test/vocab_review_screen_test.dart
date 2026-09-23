import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/core/app_sfx.dart';
import 'package:dope_english/features/vocabulary/vocab_audio_repository.dart';
import 'package:dope_english/features/vocabulary/vocab_models.dart';
import 'package:dope_english/features/vocabulary/vocab_review_controller.dart';
import 'package:dope_english/features/vocabulary/vocab_screen.dart';
import 'package:dope_english/features/vocabulary/vocab_spelling_pattern.dart';
import 'package:dope_english/features/vocabulary/vocab_speaking_repository.dart';

void main() {
  test('success monster colour follows the Hong Kong weekday', () {
    expect(
      [
        for (var weekday = 1; weekday <= 7; weekday++)
          successMonsterAssetForWeekday(weekday)
      ],
      [
        'assets/lottie/monsters/cute-monster-monday.json',
        'assets/lottie/monsters/cute-monster-tuesday.json',
        'assets/lottie/monsters/cute-monster-wednesday.json',
        'assets/lottie/monsters/cute-monster-thursday.json',
        'assets/lottie/monsters/cute-monster-friday.json',
        'assets/lottie/monsters/cute-monster-saturday.json',
        'assets/lottie/monsters/cute-monster-sunday.json',
      ],
    );
    expect(
      successMonsterAssetForToday(now: DateTime.utc(2026, 9, 21, 23)),
      'assets/lottie/monsters/cute-monster-tuesday.json',
    );
  });

  testWidgets('runs reading, listening, spelling, and completion states',
      (tester) async {
    final audio = _RecordingReviewAudio();
    final review = VocabReviewController(
      items: _items(4),
      random: Random(4),
    );
    final answers = <bool>[];
    final speaking = _FakeSpeakingRepository();

    await tester.pumpWidget(
      MaterialApp(
        home: VocabularyReviewScreen(
          items: review.questions.map((question) => question.item).toList(),
          audioRepository: audio,
          reviewController: review,
          speakingRepository: speaking,
          onAnswered: (item, kind, correct) async => answers.add(correct),
          sfx: const SilentLessonSfx(),
        ),
      ),
    );
    await tester.pump();

    expect(find.byKey(const Key('vocab-review-prompt')), findsOneWidget);
    expect(find.byKey(const Key('vocab-review-choice-grid')), findsOneWidget);
    expect(find.text('word-1 (n.)'), findsOneWidget);
    expect(find.byKey(const Key('vocab-review-spelling-input')), findsNothing);
    expect(find.byKey(const Key('vocab-review-sound')), findsNothing);

    final readingAnswer = review.currentQuestion!.correctMeaning;
    await tester.tap(find.text(readingAnswer));
    await tester.pump();
    expect(find.byKey(const Key('vocab-review-feedback')), findsOneWidget);
    expect(answers, [true]);

    await tester.tap(find.byKey(const Key('vocab-review-next')));
    await tester.pump(const Duration(milliseconds: 30));
    expect(
      find.byKey(const Key('vocab-review-prompt-text')),
      findsOneWidget,
    );
    expect(find.byKey(const Key('vocab-review-sound')), findsNothing);
    expect(find.byKey(const Key('vocab-review-prompt-audio')), findsOneWidget);

    await tester.pump(const Duration(milliseconds: 240));
    expect(audio.words, ['word-2']);
    await tester.tap(find.byKey(const Key('vocab-review-prompt-audio')));
    expect(audio.words, ['word-2', 'word-2']);

    final listeningAnswer = review.currentQuestion!.correctMeaning;
    await tester.tap(find.text(listeningAnswer));
    await tester.pump();
    await tester.tap(find.byKey(const Key('vocab-review-next')));
    await tester.pump(const Duration(milliseconds: 120));

    expect(
        find.byKey(const Key('vocab-review-spelling-input')), findsOneWidget);
    expect(find.text('打出英文生字'), findsOneWidget);
    await tester.enterText(
      find.byKey(const Key('vocab-review-spelling-input')),
      'ord-3',
    );
    await tester.testTextInput.receiveAction(TextInputAction.done);
    await tester.pump();
    expect(find.byKey(const Key('vocab-review-feedback')), findsOneWidget);
    expect(answers, [true, true, true]);

    await tester.tap(find.byKey(const Key('vocab-review-next')));
    await tester.pump(const Duration(milliseconds: 120));

    expect(review.currentQuestion!.kind, VocabReviewKind.speakingWord);
    expect(
        find.byKey(const Key('vocab-review-speaking-panel')), findsOneWidget);
    await tester.tap(find.byKey(const Key('vocab-review-speaking-record')));
    await tester.pump();
    expect(speaking.startCount, 1);
    expect(find.textContaining('錄音中'), findsOneWidget);
    await tester.tap(find.byKey(const Key('vocab-review-speaking-record')));
    await tester.pump();
    await tester.pump();
    expect(speaking.assessedTexts, ['word-4']);
    expect(find.textContaining('讀音合格'), findsOneWidget);
    expect(answers, [true, true, true, true]);
    await tester.pump();
    await tester.tap(find.byKey(const Key('vocab-review-next')));
    await tester.pump(const Duration(milliseconds: 120));
    expect(find.byKey(const Key('vocab-review-complete')), findsOneWidget);
    expect(find.text('Full marks!'), findsOneWidget);
    expect(find.text('返回詞彙'), findsOneWidget);
  });

  testWidgets('plays type SFX while entering a spelling answer',
      (tester) async {
    final review = VocabReviewController(
      items: _items(1),
      random: Random(9),
    );
    final sfx = _RecordingReviewSfx();
    await tester.pumpWidget(
      MaterialApp(
        home: VocabularyReviewScreen(
          items: review.questions.map((question) => question.item).toList(),
          audioRepository: _RecordingReviewAudio(),
          reviewController: review,
          sfx: sfx,
        ),
      ),
    );
    await tester.pump(const Duration(milliseconds: 100));

    expect(review.currentQuestion!.kind, VocabReviewKind.spelling);
    expect(find.byKey(const Key('vocab-review-spelling-hint')), findsOneWidget);
    await tester.enterText(
      find.byKey(const Key('vocab-review-spelling-input')),
      'o',
    );
    await tester.pump();
    expect(sfx.cues, contains(SfxCue.type));
  });

  testWidgets('spelling fills one underlined slot per letter', (tester) async {
    final item = VocabItem(
      id: 'boost',
      word: 'boost',
      senses: const [
        VocabSense(
          id: 'boost-sense',
          word: 'boost',
          display: 'boost',
          meaning: '提升',
          pos: 'verb',
          type: 'word',
        ),
      ],
      createdAt: DateTime(2026, 9, 16),
      updatedAt: DateTime(2026, 9, 16),
    );
    final review = VocabReviewController(items: [item], random: Random(3));

    await tester.pumpWidget(
      MaterialApp(
        home: VocabularyReviewScreen(
          items: [item],
          audioRepository: _RecordingReviewAudio(),
          reviewController: review,
          sfx: const SilentLessonSfx(),
        ),
      ),
    );
    await tester.pump(const Duration(milliseconds: 100));

    expect(review.currentQuestion!.kind, VocabReviewKind.spelling);
    expect(_slotText(tester, 0), 'b');
    final spellingInput = tester.widget<TextField>(
      find.byKey(const Key('vocab-review-spelling-input')),
    );
    expect(spellingInput.controller!.text, 'b');
    expect(spellingInput.showCursor, isFalse);
    expect(spellingInput.cursorWidth, 0);
    expect([for (var index = 1; index < 5; index++) _slotText(tester, index)],
        ['', '', '', '']);

    await tester.enterText(
      find.byKey(const Key('vocab-review-spelling-input')),
      'oo',
    );
    await tester.pump();

    expect(
      [for (var index = 0; index < 5; index++) _slotText(tester, index)],
      ['b', 'o', 'o', '', ''],
    );
    expect(spellingInput.controller!.text, 'boo');

    await tester.tap(
      find.byKey(const Key('vocab-review-keyboard-key-⌫')),
    );
    await tester.tap(
      find.byKey(const Key('vocab-review-keyboard-key-⌫')),
    );
    await tester.tap(
      find.byKey(const Key('vocab-review-keyboard-key-⌫')),
    );
    await tester.pump();

    expect(spellingInput.controller!.text, 'b');
    expect(_slotText(tester, 0), 'b');
  });

  testWidgets('typing the second letter keeps the given first letter',
      (tester) async {
    final item = VocabItem(
      id: 'achieve',
      word: 'achieve',
      senses: const [
        VocabSense(
          id: 'achieve-sense',
          word: 'achieve',
          display: 'achieve',
          meaning: '達到',
          pos: 'verb',
          type: 'word',
        ),
      ],
      createdAt: DateTime(2026, 9, 16),
      updatedAt: DateTime(2026, 9, 16),
    );
    final review = VocabReviewController(items: [item], random: Random(4));

    await tester.pumpWidget(
      MaterialApp(
        home: VocabularyReviewScreen(
          items: [item],
          audioRepository: _RecordingReviewAudio(),
          reviewController: review,
          sfx: const SilentLessonSfx(),
        ),
      ),
    );
    await tester.pump(const Duration(milliseconds: 100));

    await tester.tap(
      find.byKey(const Key('vocab-review-keyboard-key-C')),
    );
    await tester.pump();

    expect(_slotText(tester, 0), 'a');
    expect(_slotText(tester, 1), 'c');
    expect(
      tester
          .widget<TextField>(
            find.byKey(const Key('vocab-review-spelling-input')),
          )
          .controller!
          .text,
      'ac',
    );
  });

  test('spelling patterns provide punctuation and spaces automatically', () {
    expect(vocabSpellingGivenLetter('tend to'), 't');
    expect(normalizeVocabSpellingInput('endto', 'tend to'), 'tendto');
    expect(composeVocabSpellingAnswer('tend to', 'tendto'), 'tend to');
    expect(
      composeVocabSpellingAnswer(
        'differ from ... to ...',
        'differfromto',
      ),
      'differ from ... to ...',
    );
  });

  testWidgets('long placeholder pattern wraps without overflow',
      (tester) async {
    tester.view.devicePixelRatio = 1;
    tester.view.physicalSize = const Size(320, 568);
    addTearDown(tester.view.reset);
    final item = VocabItem(
      id: 'differ-pattern',
      word: 'differ from ... to ...',
      senses: const [
        VocabSense(
          id: 'differ-pattern-sense',
          word: 'differ from ... to ...',
          display: 'differ from ... to ...',
          meaning: '因...而異',
          pos: 'verb',
          type: 'pattern',
        ),
      ],
      createdAt: DateTime(2026, 9, 20),
      updatedAt: DateTime(2026, 9, 20),
    );
    final review = VocabReviewController(items: [item], random: Random(3));

    await tester.pumpWidget(MaterialApp(
      home: VocabularyReviewScreen(
        items: [item],
        audioRepository: _RecordingReviewAudio(),
        reviewController: review,
        sfx: const SilentLessonSfx(),
      ),
    ));
    await tester.pump(const Duration(milliseconds: 100));

    expect(review.currentQuestion!.kind, VocabReviewKind.spelling);
    expect(_slotText(tester, 0), 'd');
    expect(_slotText(tester, 6), ' ');
    expect(_slotText(tester, 12), '.');
    expect(_slotText(tester, 13), '.');
    expect(_slotText(tester, 14), '.');
    expect(
      tester
          .widget<TextField>(
            find.byKey(const Key('vocab-review-spelling-input')),
          )
          .controller!
          .text,
      'd',
    );
    expect(tester.takeException(), isNull);

    await tester.enterText(
      find.byKey(const Key('vocab-review-spelling-input')),
      'ifferfromto',
    );
    await tester.tap(find.byKey(const Key('vocab-review-keyboard-key-✓')));
    await tester.pump();

    expect(review.lastCorrect, isTrue);
    expect(tester.takeException(), isNull);
  });

  testWidgets('advanced listening plays a sentence and hides its focus word',
      (tester) async {
    final audio = _RecordingReviewAudio();
    final item = _items(1).single.copyWith(
          word: 'boost',
          listeningMastered: true,
          spellingMastered: true,
        );
    final review = VocabReviewController(
      items: [item],
      exampleByItemId: const {'word-1': 'Daily practice can boost confidence.'},
    );

    await tester.pumpWidget(
      MaterialApp(
        home: VocabularyReviewScreen(
          items: [item],
          audioRepository: audio,
          reviewController: review,
          sfx: const SilentLessonSfx(),
        ),
      ),
    );
    await tester.pump(const Duration(milliseconds: 240));

    expect(review.currentQuestion!.kind, VocabReviewKind.sentenceCloze);
    expect(find.textContaining('Daily practice can _____'), findsOneWidget);
    expect(audio.examples, ['Daily practice can boost confidence.']);

    await tester.tap(find.byKey(const Key('vocab-review-prompt-audio')));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 160));
    expect(audio.examples, hasLength(2));
    final scale = tester.widget<ScaleTransition>(
      find.byKey(const Key('vocab-review-note-animation')),
    );
    expect(scale.scale.value, greaterThan(1));
  });

  testWidgets(
      'listening switch replaces listening but keeps speaking questions',
      (tester) async {
    final review = VocabReviewController(items: _items(8), random: Random(7));
    review.choose(review.currentQuestion!.correctMeaning);
    review.next();
    expect(review.currentQuestion!.kind, VocabReviewKind.listening);

    await tester.pumpWidget(
      MaterialApp(
        home: VocabularyReviewScreen(
          items: _items(8),
          audioRepository: _RecordingReviewAudio(),
          speakingRepository: _FakeSpeakingRepository(),
          reviewController: review,
          sfx: const SilentLessonSfx(),
        ),
      ),
    );
    await tester.pump();

    expect(find.text('而家唔方便聽？改問其他題'), findsOneWidget);
    await tester.tap(find.byKey(const Key('vocab-review-audio-opt-out')));
    await tester.pump();

    expect(review.currentQuestion!.kind, VocabReviewKind.reading);
    expect(
      review.questions.skip(review.index).any(
            (question) => question.kind.needsListening,
          ),
      isFalse,
    );
    expect(
      review.questions.any((question) => question.kind.needsSpeaking),
      isTrue,
    );
    expect(find.byKey(const Key('vocab-review-audio-opt-out')), findsNothing);
  });
}

String _slotText(WidgetTester tester, int index) => tester
    .widget<Text>(find.byKey(ValueKey('vocab-review-spelling-slot-$index')))
    .data!;

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

class _RecordingReviewAudio implements VocabAudioRepository {
  final words = <String>[];
  final examples = <String>[];

  @override
  Future<bool> speakWord(String word) async {
    words.add(word);
    return true;
  }

  @override
  Future<bool> speakExample(String sentence) async {
    examples.add(sentence);
    return true;
  }

  @override
  Future<bool> hasAudio(
    String text, {
    VocabAudioKind kind = VocabAudioKind.word,
  }) async =>
      false;

  @override
  Future<VocabAudioEnsureResult> ensureAudio(
    String text, {
    VocabAudioKind kind = VocabAudioKind.word,
  }) async =>
      const VocabAudioEnsureResult(status: 'ready');

  @override
  Future<void> dispose() async {}
}

class _FakeSpeakingRepository implements VocabSpeakingRepository {
  int startCount = 0;
  final assessedTexts = <String>[];

  @override
  Future<VocabSpeakingStartResult> start() async {
    startCount += 1;
    return VocabSpeakingStartResult.started;
  }

  @override
  Future<VocabPronunciationResult?> stopAndAssess({
    required String expectedText,
    required String referenceId,
  }) async {
    assessedTexts.add(expectedText);
    return VocabPronunciationResult(
      score: 82,
      recognizedText: expectedText,
      words: [
        VocabPronunciationWordScore(word: expectedText, accuracy: 82),
      ],
    );
  }

  @override
  Future<void> cancel() async {}

  @override
  Future<void> dispose() async {}
}

class _RecordingReviewSfx implements LessonSfx {
  final cues = <SfxCue>[];

  @override
  Future<void> play(SfxCue cue) async {
    cues.add(cue);
  }
}
