import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/vocabulary/vocab_controller.dart';
import 'package:dope_english/features/vocabulary/vocab_models.dart';
import 'package:dope_english/features/vocabulary/vocab_repository.dart';

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

  @override
  Future<List<VocabItem>> load() async => [...items];

  @override
  Future<void> save(List<VocabItem> items) async {
    this.items = [...items];
  }
}
