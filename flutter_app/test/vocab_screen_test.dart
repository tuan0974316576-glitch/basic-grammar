import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/core/app_palette.dart';
import 'package:dope_english/core/app_sfx.dart';
import 'package:dope_english/core/widgets/stationery_frame.dart';
import 'package:dope_english/features/vocabulary/vocab_audio_repository.dart';
import 'package:dope_english/features/vocabulary/vocab_controller.dart';
import 'package:dope_english/features/vocabulary/vocab_import_models.dart';
import 'package:dope_english/features/vocabulary/vocab_import_repository.dart';
import 'package:dope_english/features/vocabulary/vocab_models.dart';
import 'package:dope_english/features/vocabulary/vocab_repository.dart';
import 'package:dope_english/features/vocabulary/vocab_screen.dart';
import 'package:dope_english/features/vocabulary/vocab_synonym_repository.dart';

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

  Widget app({
    VocabAudioRepository? audio,
    VocabImportRepository? importRepository,
    VocabSynonymRepository? synonymRepository,
    LessonSfx? sfx,
  }) {
    return MaterialApp(
      theme: ThemeData(fontFamily: 'ChironGoRoundTC'),
      home: Scaffold(
        body: VocabularyScreen(
          controller: controller,
          audioRepository: audio ?? const SilentVocabAudioRepository(),
          importRepository: importRepository,
          synonymRepository: synonymRepository,
          sfx: sfx,
        ),
      ),
    );
  }

  testWidgets('vocabulary input opens the copied stationery keyboard',
      (tester) async {
    await tester.pumpWidget(app());

    await tester.tap(find.byKey(const Key('vocab-word-input')));
    await tester.pump();
    final input = tester.widget<TextField>(
      find.byKey(const Key('vocab-word-input')),
    );
    expect(input.readOnly, isTrue);
    expect(input.textInputAction, TextInputAction.done);
    expect(input.focusNode?.hasFocus, isTrue);
    expect(find.byKey(const Key('vocab-custom-keyboard')), findsOneWidget);
    final qWidth =
        tester.getSize(find.byKey(const Key('vocab-keyboard-key-Q'))).width;
    final aWidth =
        tester.getSize(find.byKey(const Key('vocab-keyboard-key-A'))).width;
    final zWidth =
        tester.getSize(find.byKey(const Key('vocab-keyboard-key-Z'))).width;
    expect(aWidth, closeTo(qWidth, 0.01));
    expect(zWidth, closeTo(qWidth, 0.01));

    await tester.tap(find.byKey(const Key('vocab-keyboard-key-H')));
    await tester.tap(find.byKey(const Key('vocab-keyboard-key-A')));
    await tester.pump();
    expect(controller.query, 'ha');
    // The vocabulary-entry keyboard mirrors the original English Grammar
    // Game: its final row is only hyphen, Space, and apostrophe.  The field
    // remains focused while the dock is open; Android back dismisses it.
    expect(find.byKey(const Key("vocab-keyboard-key-'")), findsOneWidget);
    expect(find.byKey(const Key('vocab-keyboard-key-Done')), findsNothing);
  });

  testWidgets('clicking English word plays the dedicated prompt cue',
      (tester) async {
    final sfx = _RecordingVocabSfx();
    await tester.pumpWidget(app(sfx: sfx));

    await tester.tap(find.byKey(const Key('vocab-word-input')));
    await tester.pump();

    expect(sfx.cues, contains(SfxCue.clickEnglishWords));
  });

  testWidgets('custom keyboard labels never inherit an underline decoration',
      (tester) async {
    await tester.pumpWidget(app());
    await tester.tap(find.byKey(const Key('vocab-word-input')));
    await tester.pump();
    final q = tester.widget<Text>(find.text('Q').last);
    expect(q.style?.decoration, TextDecoration.none);
    expect(q.style?.fontFamily, 'ChironGoRoundTC');
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

  testWidgets('searching an existing word centres and highlights its saved row',
      (tester) async {
    final sfx = _RecordingVocabSfx();
    await controller.updateQuery('have');
    controller.toggleSense(controller.lookupSenses.first);
    await controller.addSelected();
    await tester.pumpWidget(app(sfx: sfx));

    await controller.updateQuery('have');
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('vocab-search-focus-overlay')), findsOneWidget);
    expect(find.text('MEMORY TRACE LOCKED'), findsOneWidget);
    final row = find.byKey(ValueKey('vocab-row-${controller.items.single.id}'));
    await tester.ensureVisible(row);
    expect(row, findsOneWidget);
    final surface = find
        .descendant(
          of: row,
          matching: find.byType(OriginalDashedSurface),
        )
        .first;
    expect(tester.widget<OriginalDashedSurface>(surface).shadowDepth, 8);
    expect(
      tester.widget<OriginalDashedSurface>(surface).blurRadius,
      12,
    );
    expect(sfx.cues, contains(SfxCue.step));
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

  testWidgets('the full word row and full white example card are playback tabs',
      (tester) async {
    final audio = _RecordingAudioRepository();
    await tester.pumpWidget(app(audio: audio));
    await controller.updateQuery('have');
    controller.toggleSense(controller.lookupSenses.first);
    await controller.addSelected();
    await controller.toggleExamples(controller.items.single);
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 20));

    await tester.tap(find.text('v. 擁有'));
    await tester.pump();
    expect(audio.words, ['have']);
    expect(
      find.descendant(
        of: find.byKey(const ValueKey('vocab-example-card-I have a new book.')),
        matching: find.text('我有一本新書。'),
      ),
      findsOneWidget,
    );

    // The white example tab is the hit target; the sentence text itself is
    // presentation only, so students do not need to aim at the words.
    final exampleCard =
        find.byKey(const ValueKey('vocab-example-card-I have a new book.'));
    await tester.ensureVisible(exampleCard);
    await tester.pumpAndSettle();
    await tester.tap(exampleCard);
    await tester.pump();
    expect(audio.examples, ['I have a new book.']);
  });

  testWidgets('stats and upload note action share one equal-width row',
      (tester) async {
    await tester
        .pumpWidget(app(importRepository: _SuccessfulImportRepository()));

    final added = find.text('已加入');
    final due = find.text('待溫習');
    final upload = find.text('上傳筆記');
    expect(added, findsOneWidget);
    expect(due, findsOneWidget);
    expect(upload, findsOneWidget);
    final importButton = find.byKey(const Key('vocab-import-note-button'));
    final uploadIcon = find.descendant(
      of: importButton,
      matching: find.byIcon(Icons.upload_file_rounded),
    );
    expect(
      tester.getCenter(upload).dy,
      lessThan(tester.getCenter(uploadIcon).dy),
    );
    final row = find.ancestor(of: added, matching: find.byType(Row)).first;
    expect(
      find.descendant(of: row, matching: find.byType(Expanded)),
      findsNWidgets(3),
    );
  });

  testWidgets('upload note button opens picker directly and completes import',
      (tester) async {
    final repository = _SuccessfulImportRepository();
    await tester.pumpWidget(app(importRepository: repository));

    await tester.tap(find.byKey(const Key('vocab-import-note-button')));
    await tester.pumpAndSettle();

    expect(repository.pickCalls, 1);
    expect(repository.processCalls, 1);
    expect(find.text('安全上傳'), findsOneWidget);
    expect(find.text('文件 OCR'), findsOneWidget);
    expect(find.text('AI 詞彙分析'), findsOneWidget);
    expect(find.text('雲端詞彙庫'), findsOneWidget);
    expect(find.text('儲存到詞彙本'), findsOneWidget);
    expect(find.byKey(const Key('vocab-import-result-row')), findsOneWidget);
    final results = find.byKey(const Key('vocab-import-result-row'));
    expect(
      find.descendant(of: results, matching: find.text('1')),
      findsNWidgets(2),
    );
    expect(controller.items.single.word, 'asset');
  });

  testWidgets('upload note offers camera, gallery, and file sources',
      (tester) async {
    final repository = _SourceChoiceImportRepository();
    await tester.pumpWidget(app(importRepository: repository));

    await tester.tap(find.byKey(const Key('vocab-import-note-button')));
    await tester.pumpAndSettle();

    expect(find.byKey(const Key('vocab-import-source-sheet')), findsOneWidget);
    expect(find.text('拍攝相片'), findsOneWidget);
    expect(find.text('從相簿選取'), findsOneWidget);
    expect(find.text('瀏覽檔案'), findsOneWidget);

    await tester.tap(find.byKey(const Key('vocab-import-gallery-choice')));
    await tester.pumpAndSettle();
    expect(repository.sources, [VocabImportSource.gallery]);
  });

  testWidgets('three stats and import result fit a compact portrait phone',
      (tester) async {
    tester.view.physicalSize = const Size(320, 568);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester
        .pumpWidget(app(importRepository: _SuccessfulImportRepository()));

    expect(find.byKey(const Key('vocab-import-note-button')), findsOneWidget);
    expect(tester.takeException(), isNull);
    await tester.tap(find.byKey(const Key('vocab-import-note-button')));
    await tester.pumpAndSettle();

    expect(find.byKey(const Key('vocab-import-result-row')), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('login failure is shown before any import dialog opens',
      (tester) async {
    final repository = _LoginRequiredImportRepository();
    await tester.pumpWidget(app(importRepository: repository));

    await tester.tap(find.byKey(const Key('vocab-import-note-button')));
    await tester.pumpAndSettle();

    expect(repository.pickCalls, 1);
    expect(find.text('請先登入學生帳戶，才可以上傳筆記。'), findsOneWidget);
    expect(find.byKey(const Key('vocab-import-progress')), findsNothing);
  });

  testWidgets('entry panel moves up and five tools use the cute stationery UI',
      (tester) async {
    await tester.pumpWidget(app());

    final header = find.byKey(const Key('original-section-header'));
    final entryPanel = find.byKey(const Key('vocab-entry-panel'));
    expect(
      tester.getTopLeft(entryPanel).dy - tester.getBottomLeft(header).dy,
      lessThanOrEqualTo(16),
    );
    expect(find.byKey(const Key('vocab-sort-recent-button')), findsOneWidget);
    expect(find.byKey(const Key('vocab-sort-alpha-button')), findsOneWidget);
    expect(find.byKey(const Key('vocab-sort-shuffle-button')), findsOneWidget);
    expect(find.byKey(const Key('vocab-study-english-button')), findsOneWidget);
    expect(find.byKey(const Key('vocab-study-chinese-button')), findsOneWidget);
    expect(find.byIcon(Icons.history_rounded), findsOneWidget);
    expect(find.byIcon(Icons.sort_by_alpha_rounded), findsOneWidget);
    expect(find.byIcon(Icons.shuffle_rounded), findsOneWidget);

    final alphaSurface = find.descendant(
      of: find.byKey(const Key('vocab-sort-alpha-button')),
      matching: find.byType(OriginalDashedSurface),
    );
    final chiSurface = find.descendant(
      of: find.byKey(const Key('vocab-study-chinese-button')),
      matching: find.byType(OriginalDashedSurface),
    );
    expect(tester.widget<OriginalDashedSurface>(alphaSurface).radius, 7);
    expect(
      tester.widget<OriginalDashedSurface>(alphaSurface).backgroundColor,
      AppPalette.softPrimary,
    );
    expect(
      tester.widget<OriginalDashedSurface>(chiSurface).backgroundColor,
      const Color(0xFFF0E9FF),
    );
  });

  testWidgets('A-Z and shuffle controls change the real vocabulary order',
      (tester) async {
    tester.view.physicalSize = const Size(800, 1000);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await controller.bulkUpsertImported(const [
      VocabImportedEntry(
        word: 'zebra',
        display: 'zebra',
        senses: [_zebraSense],
      ),
      VocabImportedEntry(
        word: 'apple',
        display: 'apple',
        senses: [_appleSense],
      ),
      VocabImportedEntry(
        word: 'moon',
        display: 'moon',
        senses: [_moonSense],
      ),
    ]);
    await tester.pumpWidget(app());

    await tester.tap(find.byKey(const Key('vocab-sort-alpha-button')));
    await tester.pumpAndSettle();
    expect(tester.getTopLeft(find.text('apple')).dy,
        lessThan(tester.getTopLeft(find.text('moon')).dy));
    expect(tester.getTopLeft(find.text('moon')).dy,
        lessThan(tester.getTopLeft(find.text('zebra')).dy));

    await tester.tap(find.byKey(const Key('vocab-sort-shuffle-button')));
    await tester.pumpAndSettle();
    final firstOrder = _verticalWordOrder(tester, const [
      'apple',
      'moon',
      'zebra',
    ]);
    await tester.tap(find.byKey(const Key('vocab-sort-shuffle-button')));
    await tester.pumpAndSettle();
    final secondOrder = _verticalWordOrder(tester, const [
      'apple',
      'moon',
      'zebra',
    ]);
    expect(secondOrder, isNot(firstOrder));
  });

  testWidgets('English and Chinese modes use tap-to-reveal crayon masks',
      (tester) async {
    final sfx = _RecordingVocabSfx();
    await controller.updateQuery('have');
    controller.toggleSense(controller.lookupSenses.first);
    await controller.addSelected();
    await tester.pumpWidget(app(sfx: sfx));
    final itemId = controller.items.single.id;

    await tester.tap(find.byKey(const Key('vocab-study-english-button')));
    await tester.pumpAndSettle();
    final chineseMask = find.byKey(ValueKey('vocab-chinese-mask-$itemId-0'));
    expect(chineseMask, findsOneWidget);
    expect(find.byKey(ValueKey('vocab-english-mask-$itemId')), findsNothing);
    expect(find.text('v. '), findsOneWidget);
    await tester.tap(chineseMask);
    await tester.pumpAndSettle();
    expect(sfx.cues, contains(SfxCue.step));
    expect(chineseMask, findsNothing);
    expect(
      find.byKey(ValueKey('vocab-chinese-visible-$itemId-0')),
      findsOneWidget,
    );

    await tester.tap(find.byKey(const Key('vocab-study-english-button')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('vocab-study-chinese-button')));
    await tester.pumpAndSettle();
    final englishMask = find.byKey(ValueKey('vocab-english-mask-$itemId'));
    expect(englishMask, findsOneWidget);
    expect(find.text('h'), findsOneWidget);
    await tester.tap(englishMask);
    await tester.pumpAndSettle();
    expect(englishMask, findsNothing);
    expect(
      find.byKey(ValueKey('vocab-english-visible-$itemId')),
      findsOneWidget,
    );
  });

  testWidgets('saving a word automatically offers Battleship synonym links',
      (tester) async {
    await tester.pumpWidget(
      app(synonymRepository: _ScreenSynonymRepository()),
    );
    await controller.updateQuery('have');
    controller.toggleSense(controller.lookupSenses.first);
    await tester.pump();
    await tester.tap(find.byKey(const Key('vocab-add-button')));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 1120));
    await tester.pumpAndSettle();

    expect(find.byKey(const Key('vocab-synonym-dialog')), findsOneWidget);
    expect(
      find.byKey(const Key('vocab-synonym-dialog-animation')),
      findsOneWidget,
    );
    expect(find.text('take'), findsOneWidget);
    expect(find.text('v. 採取'), findsOneWidget);
    expect(find.byKey(const Key('vocab-synonym-save')), findsOneWidget);
  });
}

List<String> _verticalWordOrder(WidgetTester tester, List<String> words) {
  final ordered = words
      .map((word) => (word: word, y: tester.getTopLeft(find.text(word)).dy))
      .toList()
    ..sort((left, right) => left.y.compareTo(right.y));
  return ordered.map((entry) => entry.word).toList(growable: false);
}

const _zebraSense = VocabSense(
  id: 'zebra-noun',
  word: 'zebra',
  display: 'zebra',
  meaning: '斑馬',
  pos: 'noun',
  type: 'word',
);

const _appleSense = VocabSense(
  id: 'apple-noun',
  word: 'apple',
  display: 'apple',
  meaning: '蘋果',
  pos: 'noun',
  type: 'word',
);

const _moonSense = VocabSense(
  id: 'moon-noun',
  word: 'moon',
  display: 'moon',
  meaning: '月亮',
  pos: 'noun',
  type: 'word',
);

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

class _ScreenSynonymRepository implements VocabSynonymRepository {
  @override
  Future<List<VocabSynonymGroup>> lookup(String word) async {
    return const [
      VocabSynonymGroup(
        id: 'have-group',
        meaning: '擁有',
        candidates: [
          VocabSynonymCandidate(
            id: 'have-group::take',
            word: 'take',
            display: 'take',
            sense: VocabSense(
              id: 'take-verb',
              word: 'take',
              display: 'take',
              meaning: '採取',
              pos: 'verb',
              type: 'word',
            ),
          ),
        ],
      ),
      VocabSynonymGroup(
        id: 'have-group-repeat',
        meaning: '重覆測試',
        candidates: [
          VocabSynonymCandidate(
            id: 'have-group-repeat::take',
            word: 'take',
            display: 'take',
            sense: VocabSense(
              id: 'take-verb-repeat',
              word: 'take',
              display: 'take',
              meaning: '採取',
              pos: 'verb',
              type: 'word',
            ),
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

class _RecordingAudioRepository implements VocabAudioRepository {
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

class _RecordingVocabSfx implements LessonSfx {
  final cues = <SfxCue>[];

  @override
  Future<void> play(SfxCue cue) async => cues.add(cue);
}

class _SuccessfulImportRepository implements VocabImportRepository {
  int pickCalls = 0;
  int processCalls = 0;

  @override
  Future<List<VocabImportFile>> pickFiles() async {
    pickCalls += 1;
    return const [
      VocabImportFile(
        name: 'notes.pdf',
        path: '/tmp/notes.pdf',
        size: 1024,
        mimeType: 'application/pdf',
      ),
    ];
  }

  @override
  Future<VocabImportPayload> processFiles(
    List<VocabImportFile> files, {
    required VocabImportProgressCallback onProgress,
  }) async {
    processCalls += 1;
    for (final stage in VocabImportStage.values) {
      onProgress(VocabImportProgress(
        stage: stage,
        progress: stage == VocabImportStage.saveToVocab ? 0 : 1,
        detail: 'processing',
      ));
    }
    return const VocabImportPayload(
      detectedCount: 1,
      entries: [
        VocabImportedEntry(
          word: 'asset',
          display: 'asset',
          senses: [
            VocabSense(
              id: 'asset-noun',
              word: 'asset',
              display: 'asset',
              meaning: '資產',
              pos: 'noun',
              type: 'word',
              source: 'uploaded-note',
            ),
          ],
        ),
      ],
    );
  }
}

class _LoginRequiredImportRepository implements VocabImportRepository {
  int pickCalls = 0;

  @override
  Future<List<VocabImportFile>> pickFiles() async {
    pickCalls += 1;
    throw const VocabImportException('請先登入學生帳戶，才可以上傳筆記。');
  }

  @override
  Future<VocabImportPayload> processFiles(
    List<VocabImportFile> files, {
    required VocabImportProgressCallback onProgress,
  }) {
    throw StateError('processFiles should not be called');
  }
}

class _SourceChoiceImportRepository
    implements VocabImportRepository, VocabImportSourceRepository {
  final sources = <VocabImportSource>[];

  @override
  Future<List<VocabImportFile>> pickFiles() async {
    sources.add(VocabImportSource.files);
    return const [];
  }

  @override
  Future<List<VocabImportFile>> pickFilesFrom(VocabImportSource source) async {
    sources.add(source);
    return const [];
  }

  @override
  Future<VocabImportPayload> processFiles(
    List<VocabImportFile> files, {
    required VocabImportProgressCallback onProgress,
  }) {
    throw StateError('processFiles should not be called for this picker test');
  }
}
