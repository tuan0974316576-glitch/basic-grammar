import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/vocabulary/vocab_controller.dart';
import 'package:dope_english/features/vocabulary/vocab_import_models.dart';
import 'package:dope_english/features/vocabulary/vocab_models.dart';
import 'package:dope_english/features/vocabulary/vocab_repository.dart';
import 'package:dope_english/features/vocabulary/vocab_review_controller.dart';
import 'package:dope_english/features/vocabulary/vocab_synonym_repository.dart';

void main() {
  late _MemoryVocabStore store;
  late VocabController controller;

  setUp(() async {
    store = _MemoryVocabStore();
    controller = VocabController(
      lookupRepository: _FakeLookupRepository(),
      store: store,
      now: () => DateTime(2026, 8, 19, 14, 30),
    );
    await controller.initialize();
  });

  tearDown(() => controller.dispose());

  test('recent vocabulary follows creation dates, not later update times',
      () async {
    store.items = [
      _datedItem('sep19', DateTime(2026, 9, 19), DateTime(2026, 9, 30)),
      _datedItem('sep7', DateTime(2026, 9, 7), DateTime(2026, 10, 2)),
      _datedItem('sep15', DateTime(2026, 9, 15), DateTime(2026, 10, 1)),
      _datedItem('sep9', DateTime(2026, 9, 9), DateTime(2026, 10, 3)),
      _datedItem('sep20', DateTime(2026, 9, 20), DateTime(2026, 9, 21)),
    ];
    await controller.initialize();

    expect(
      controller.items.map((item) => item.word).toList(),
      ['sep20', 'sep19', 'sep15', 'sep9', 'sep7'],
    );
  });

  test('multiple selected senses create one saved vocabulary row', () async {
    await controller.updateQuery('have');
    controller.toggleSense(controller.lookupSenses[0]);
    controller.toggleSense(controller.lookupSenses[1]);

    final result = await controller.addSelected();

    expect(result, VocabAddResult.added);
    expect(controller.items, hasLength(1));
    expect(controller.items.single.senses, hasLength(2));
    expect(store.items, hasLength(1));
    expect(store.items.single.senses, hasLength(2));
  });

  test('adding another sense later merges into the existing row', () async {
    await controller.updateQuery('have');
    controller.toggleSense(controller.lookupSenses.first);
    await controller.addSelected();

    await controller.updateQuery('have');
    controller.toggleSense(controller.lookupSenses.last);
    await controller.addSelected();

    expect(controller.items, hasLength(1));
    expect(controller.items.single.senses, hasLength(2));
  });

  test('saving the same word and meaning reports already saved', () async {
    await controller.updateQuery('have');
    controller.toggleSense(controller.lookupSenses.first);
    expect(await controller.addSelected(), VocabAddResult.added);

    await controller.updateQuery('have');
    controller.toggleSense(controller.lookupSenses.first);
    expect(
      await controller.addSelected(),
      VocabAddResult.alreadySaved,
    );
    expect(controller.items, hasLength(1));
    expect(controller.items.single.senses, hasLength(1));
  });

  test('a correct retry clears due state after an earlier wrong attempt',
      () async {
    await controller.bulkUpsertImported(const [
      VocabImportedEntry(
        word: 'have',
        display: 'have',
        senses: [_haveOwn],
      ),
    ]);

    final item = controller.items.single;
    expect(controller.dueCount, 1);
    await controller.recordReviewAnswer(item, VocabReviewKind.reading, false);
    expect(controller.dueCount, 1);
    await controller.recordReviewAnswer(item, VocabReviewKind.reading, true);

    expect(controller.dueCount, 0);
    expect(controller.items.single.reviewMastered, isTrue);
    expect(controller.items.single.totalSeen, 2);
    expect(controller.items.single.totalCorrect, 1);
  });

  test('loads examples only after expanding a row', () async {
    await controller.updateQuery('have');
    controller.toggleSense(controller.lookupSenses.first);
    await controller.addSelected();

    await controller.toggleExamples(controller.items.single);

    expect(controller.expandedItemId, controller.items.single.id);
    expect(controller.examplesFor(controller.items.single.id), hasLength(1));
    expect(
      controller.examplesFor(controller.items.single.id)!.single.examples,
      hasLength(1),
    );
  });

  test('bulk import merges duplicate words and saves the full batch once',
      () async {
    await controller.updateQuery('have');
    controller.toggleSense(controller.lookupSenses.first);
    await controller.addSelected();
    final savesBeforeImport = store.saveCalls;

    final result = await controller.bulkUpsertImported(
      const [
        VocabImportedEntry(
          word: 'have',
          display: 'have',
          senses: [_haveEat],
        ),
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
      detectedCount: 2,
    );

    expect(result.saved, isTrue);
    expect(result.detectedCount, 2);
    expect(result.addedCount, 1);
    expect(result.duplicateCount, 1);
    expect(store.saveCalls - savesBeforeImport, 1);
    expect(controller.items, hasLength(2));
    expect(
      controller.items.singleWhere((item) => item.word == 'have').senses,
      hasLength(2),
    );
  });

  test('bulk import rolls back every row when its single save fails', () async {
    store.failNextSave = true;

    final result = await controller.bulkUpsertImported(const [
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
          ),
        ],
      ),
    ]);

    expect(result.saved, isFalse);
    expect(controller.items, isEmpty);
    expect(store.items, isEmpty);
  });

  test('adding a synonym does not duplicate an existing gloss', () async {
    await controller.bulkUpsertImported(const [
      VocabImportedEntry(
        word: 'massive',
        display: 'massive',
        senses: [
          VocabSense(
            id: 'massive-rich',
            word: 'massive',
            display: 'massive',
            meaning: '巨大的 / 大量的',
            pos: 'adjective',
            type: 'word',
          ),
        ],
      ),
    ]);

    final saved = await controller.addSynonymCandidates(const [
      VocabSynonymCandidate(
        id: 'enormous::massive',
        word: 'massive',
        display: 'massive',
        sense: VocabSense(
          id: 'massive-simple',
          word: 'massive',
          display: 'massive',
          meaning: '巨大的',
          pos: 'adjective',
          type: 'word',
        ),
      ),
    ]);

    expect(saved, isTrue);
    expect(controller.items.single.senses, hasLength(1));
    expect(
      controller.items.single.senses.single.meaning,
      '巨大的 / 大量的',
    );
  });
}

const _haveOwn = VocabSense(
  id: 'have-own',
  word: 'have',
  display: 'have',
  meaning: '擁有',
  pos: 'verb',
  type: 'word',
);

const _haveEat = VocabSense(
  id: 'have-eat',
  word: 'have',
  display: 'have',
  meaning: '吃 / 喝',
  pos: 'verb',
  type: 'word',
);

class _FakeLookupRepository implements VocabLookupRepository {
  @override
  Future<VocabLookupResult> lookup(String query) async {
    return const VocabLookupResult(senses: [_haveOwn, _haveEat]);
  }

  @override
  Future<List<VocabExampleSection>> loadExamples(VocabItem item) async {
    return item.senses
        .map((sense) => VocabExampleSection(
              sense: sense,
              examples: const [
                VocabExample(english: 'I have a book.', chinese: '我有一本書。'),
              ],
            ))
        .toList();
  }
}

class _MemoryVocabStore implements VocabStore {
  List<VocabItem> items = [];
  int saveCalls = 0;
  bool failNextSave = false;

  @override
  Future<List<VocabItem>> load() async => [...items];

  @override
  Future<void> save(List<VocabItem> items) async {
    saveCalls += 1;
    if (failNextSave) {
      failNextSave = false;
      throw StateError('save failed');
    }
    this.items = [...items];
  }
}

VocabItem _datedItem(String word, DateTime createdAt, DateTime updatedAt) {
  return VocabItem(
    id: 'dated-$word',
    word: word,
    senses: [
      VocabSense(
        id: 'dated-$word-sense',
        word: word,
        display: word,
        meaning: '測試',
        pos: 'noun',
        type: 'word',
      ),
    ],
    createdAt: createdAt,
    updatedAt: updatedAt,
  );
}
