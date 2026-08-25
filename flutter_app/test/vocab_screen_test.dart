import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/core/app_palette.dart';
import 'package:dope_english/core/widgets/stationery_frame.dart';
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

  testWidgets('mobile input uses the native editable text field',
      (tester) async {
    await tester.pumpWidget(app());

    await tester.tap(find.byKey(const Key('vocab-word-input')));
    await tester.pump();
    final input = tester.widget<TextField>(
      find.byKey(const Key('vocab-word-input')),
    );
    expect(input.readOnly, isFalse);
    expect(input.textInputAction, TextInputAction.done);
    expect(input.focusNode?.hasFocus, isTrue);
    expect(find.byKey(const Key('vocab-game-keyboard')), findsNothing);

    await tester.enterText(find.byKey(const Key('vocab-word-input')), 'have');
    await tester.pump();
    expect(controller.query, 'have');
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

  testWidgets('row press and examples match the original web treatment',
      (tester) async {
    await tester.pumpWidget(app());
    await controller.updateQuery('have');
    controller.toggleSense(controller.lookupSenses.first);
    await controller.addSelected();
    await tester.pump();

    final itemId = controller.items.single.id;
    final row = find.byKey(ValueKey('vocab-row-$itemId'));
    await tester.ensureVisible(row);
    final rowSurface = find
        .descendant(
          of: row,
          matching: find.byType(OriginalDashedSurface),
        )
        .first;
    expect(
      tester.widget<OriginalDashedSurface>(rowSurface).backgroundColor,
      Colors.white,
    );

    final gesture = await tester.startGesture(tester.getCenter(row));
    await tester.pump(const Duration(milliseconds: 120));
    expect(
      tester.widget<OriginalDashedSurface>(rowSurface).backgroundColor,
      AppPalette.softPrimary,
    );
    await gesture.up();
    await tester.pump(const Duration(milliseconds: 120));

    await tester.tap(find.text('例'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 20));

    expect(find.byKey(const Key('vocab-example-panel')), findsOneWidget);
    expect(find.text('I have a new book.'), findsOneWidget);
    expect(find.text('我有一本新書。'), findsOneWidget);
    expect(
      find.byKey(const ValueKey('vocab-example-card-I have a new book.')),
      findsOneWidget,
    );
    expect(find.byIcon(Icons.volume_up_rounded), findsNothing);
    expect(find.text('×'), findsOneWidget);
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
    return [
      VocabExampleSection(
        sense: item.senses.first,
        examples: const [
          VocabExample(
            english: 'I have a new book.',
            chinese: '我有一本新書。',
          ),
          VocabExample(
            english: 'They have lunch at school.',
            chinese: '他們在學校吃午餐。',
          ),
        ],
      ),
    ];
  }
}

class _ScreenStore implements VocabStore {
  @override
  Future<List<VocabItem>> load() async => const [];

  @override
  Future<void> save(List<VocabItem> items) async {}
}
