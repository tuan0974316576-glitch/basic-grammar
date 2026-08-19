import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/vocabulary/vocab_audio_repository.dart';
import 'package:dope_english/features/vocabulary/vocab_controller.dart';
import 'package:dope_english/features/vocabulary/vocab_models.dart';
import 'package:dope_english/features/vocabulary/vocab_repository.dart';
import 'package:dope_english/features/vocabulary/vocab_screen.dart';

void main() {
  late VocabController controller;

  setUp(() async {
    controller = VocabController(
      lookupRepository: _ScreenLookupRepository(),
      store: _ScreenStore(),
      now: () => DateTime(2026, 8, 19),
    );
    await controller.initialize();
  });

  tearDown(() => controller.dispose());

  Widget app() {
    return MaterialApp(
      theme: ThemeData(fontFamily: 'ChironGoRoundTC'),
      home: Scaffold(
        body: VocabularyScreen(
          controller: controller,
          audioRepository: const SilentVocabAudioRepository(),
        ),
      ),
    );
  }

  testWidgets('mobile input toggles the game keyboard', (tester) async {
    await tester.pumpWidget(app());

    await tester.tap(find.byKey(const Key('vocab-word-input')));
    await tester.pump();
    expect(find.byKey(const Key('vocab-game-keyboard')), findsOneWidget);

    await tester.tap(find.byKey(const Key('vocab-word-input')));
    await tester.pump();
    expect(find.byKey(const Key('vocab-game-keyboard')), findsNothing);
  });

  testWidgets('adds one row containing two selected meanings', (tester) async {
    await tester.pumpWidget(app());
    await controller.updateQuery('have');
    await tester.pump();

    controller.toggleSense(controller.lookupSenses[0]);
    controller.toggleSense(controller.lookupSenses[1]);
    await tester.pump();
    await tester.ensureVisible(find.byKey(const Key('vocab-add-button')));
    await tester.tap(find.byKey(const Key('vocab-add-button')));
    await tester.pumpAndSettle();

    expect(find.text('have'), findsOneWidget);
    expect(find.text('v. 擁有'), findsOneWidget);
    expect(find.text('v. 吃 / 喝'), findsOneWidget);
    expect(controller.groupedItems.keys.single, DateTime(2026, 8, 19));
    expect(find.byKey(const Key('vocab-list')), findsOneWidget);
  });
}

class _ScreenLookupRepository implements VocabLookupRepository {
  static const senses = [
    VocabSense(
      id: 'have-own',
      word: 'have',
      display: 'have',
      meaning: '擁有',
      pos: 'verb',
      type: 'word',
    ),
    VocabSense(
      id: 'have-eat',
      word: 'have',
      display: 'have',
      meaning: '吃 / 喝',
      pos: 'verb',
      type: 'word',
    ),
  ];

  @override
  Future<VocabLookupResult> lookup(String query) async {
    return const VocabLookupResult(senses: senses);
  }

  @override
  Future<List<VocabExampleSection>> loadExamples(VocabItem item) async {
    return const [];
  }
}

class _ScreenStore implements VocabStore {
  @override
  Future<List<VocabItem>> load() async => const [];

  @override
  Future<void> save(List<VocabItem> items) async {}
}
