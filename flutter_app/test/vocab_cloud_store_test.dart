import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:dope_english/features/vocabulary/vocab_cloud_store.dart';
import 'package:dope_english/features/vocabulary/vocab_models.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  test('restores a student vocabulary list from Firestore', () async {
    final backend = _FakeVocabCloudBackend(
      initial: VocabCloudSnapshot(items: [_item('apple', '蘋果')]),
    );
    final store = CloudSyncedVocabStore(
      cloud: backend,
      uidProvider: () => 'uid-s004',
    );

    await store.load();
    await store.waitForInitialRestore();

    expect(store.currentItems.single.word, 'apple');
    expect(store.currentItems.single.senses.single.meaning, '蘋果');
    await store.waitForPendingWrites();
    expect(backend.saves, isEmpty);
    final preferences = await SharedPreferences.getInstance();
    expect(
      preferences.getString('dope_english_vocab_items_v1_uid-s004'),
      isNotNull,
    );
    await store.dispose();
  });

  test('returns the local vocabulary before a slow cloud restore completes',
      () async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString(
      'dope_english_vocab_items_v1_uid-s004',
      VocabItem.encodeList([_item('pen', '筆')]),
    );
    final loadGate = Completer<void>();
    final backend = _FakeVocabCloudBackend(loadGate: loadGate);
    final store = CloudSyncedVocabStore(
      cloud: backend,
      uidProvider: () => 'uid-s004',
    );

    final local = await store.load().timeout(const Duration(seconds: 1));

    expect(local.single.word, 'pen');
    expect(backend.loadStarted.isCompleted, isTrue);
    expect(store.currentItems.single.word, 'pen');

    loadGate.complete();
    await store.waitForInitialRestore();
    expect(store.currentItems.single.word, 'pen');
    await store.dispose();
  });

  test('repairs a cloud word containing a blank duplicate sense', () async {
    final now = DateTime(2026, 9, 10);
    final malformed = VocabItem(
      id: 'word-massive',
      word: 'massive',
      senses: const [
        VocabSense(
          id: 'sense-massive-adjective-414',
          word: 'massive',
          display: 'massive',
          meaning: '巨大的 / 大量的',
          pos: 'adjective',
          type: 'word',
          sourceEntryId: 'sense-bank-414',
        ),
        VocabSense(
          id: '',
          word: '',
          display: '',
          meaning: '巨大的 / 大量的',
          pos: 'adjective',
          type: 'word',
          sourceEntryId: 'sense-bank-414',
        ),
      ],
      createdAt: now,
      updatedAt: now,
    );
    final backend = _FakeVocabCloudBackend(
      initial: VocabCloudSnapshot(
        items: [malformed],
        repairWords: const {'massive'},
      ),
    );
    final store = CloudSyncedVocabStore(
      cloud: backend,
      uidProvider: () => 'uid-s004',
    );

    await store.load();
    await store.waitForInitialRestore();
    await store.waitForPendingWrites();

    expect(store.currentItems.single.senses, hasLength(1));
    expect(store.currentItems.single.senses.single.word, 'massive');
    expect(backend.saves, hasLength(1));
    expect(backend.saves.single.items.single.senses, hasLength(1));
    await store.dispose();
  });

  test('migrates the old unscoped local list to the first student account',
      () async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString(
      'dope_english_vocab_items_v1',
      VocabItem.encodeList([_item('book', '書')]),
    );
    final backend = _FakeVocabCloudBackend();
    final store = CloudSyncedVocabStore(
      cloud: backend,
      uidProvider: () => 'uid-s004',
    );

    await store.load();
    await store.waitForInitialRestore();

    expect(store.currentItems.single.word, 'book');
    await store.waitForPendingWrites();
    expect(backend.saves.single.items.single.word, 'book');
    expect(preferences.getString('dope_english_vocab_items_v1'), isNull);
    await store.dispose();
  });

  test('writes a tombstone when a saved word is deleted', () async {
    final backend = _FakeVocabCloudBackend(
      initial: VocabCloudSnapshot(items: [_item('apple', '蘋果')]),
    );
    final store = CloudSyncedVocabStore(
      cloud: backend,
      uidProvider: () => 'uid-s004',
    );
    await store.load();
    await store.waitForInitialRestore();

    await store.save(const []);
    await store.waitForPendingWrites();

    expect(backend.saves, hasLength(1));
    expect(backend.saves.single.items, isEmpty);
    expect(backend.saves.single.tombstones['apple'], greaterThan(0));
    await store.dispose();
  });

  test('remote changes are emitted to the vocabulary controller', () async {
    final backend = _FakeVocabCloudBackend();
    final store = CloudSyncedVocabStore(
      cloud: backend,
      uidProvider: () => 'uid-s004',
    );
    final changes = <List<VocabItem>>[];
    final subscription = store.remoteChanges.listen(changes.add);
    await store.load();

    backend.emit(VocabCloudSnapshot(items: [_item('pear', '梨')]));
    await Future<void>.delayed(const Duration(milliseconds: 20));

    expect(changes.single.single.word, 'pear');
    await subscription.cancel();
    await store.dispose();
  });

  test('cloud failure never discards local vocabulary', () async {
    final backend = _FakeVocabCloudBackend(
      failLoad: true,
      saveFailuresRemaining: 1,
    );
    final store = CloudSyncedVocabStore(
      cloud: backend,
      uidProvider: () => 'uid-s004',
    );
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString(
      'dope_english_vocab_items_v1_uid-s004',
      VocabItem.encodeList([_item('pen', '筆')]),
    );

    expect((await store.load()).single.word, 'pen');
    await store.save(const []);
    await store.waitForPendingWrites();
    final persisted =
        preferences.getString('dope_english_vocab_items_v1_uid-s004');
    expect(VocabItem.decodeList(persisted!).isEmpty, isTrue);
    await store.dispose();
  });

  test('keeps a cloud-only tombstone when no matching item is present',
      () async {
    final backend = _FakeVocabCloudBackend(
      initial: VocabCloudSnapshot(
        tombstones: {'apple': DateTime(2026, 8, 29).millisecondsSinceEpoch},
      ),
    );
    final store = CloudSyncedVocabStore(
      cloud: backend,
      uidProvider: () => 'uid-s004',
    );

    expect(await store.load(), isEmpty);
    await store.waitForPendingWrites();
    expect(backend.saves, isEmpty);
    await store.dispose();
  });

  test('saving one word never waits for a blocked cloud write', () async {
    final existing = List.generate(
      600,
      (index) => _item('word-$index', '意思 $index'),
    );
    final gate = Completer<void>();
    final backend = _FakeVocabCloudBackend(
      initial: VocabCloudSnapshot(items: existing),
      saveGate: gate,
    );
    final store = CloudSyncedVocabStore(
      cloud: backend,
      uidProvider: () => 'uid-s004',
    );
    await store.load();
    await store.waitForInitialRestore();
    final restored = store.currentItems;
    final newItem = _item('apple', '蘋果');

    await store
        .save([...restored, newItem]).timeout(const Duration(seconds: 1));
    await backend.saveStarted.future.timeout(const Duration(seconds: 1));

    expect(backend.attempts, hasLength(1));
    expect(backend.attempts.single.items.map((item) => item.word), ['apple']);
    expect(backend.attempts.single.tombstones, isEmpty);

    gate.complete();
    await store.waitForPendingWrites();
    expect(backend.snapshot.items, hasLength(601));
    await store.dispose();
  });

  test('a failed delta is retried together with the next save', () async {
    final backend = _FakeVocabCloudBackend(saveFailuresRemaining: 1);
    final store = CloudSyncedVocabStore(
      cloud: backend,
      uidProvider: () => 'uid-s004',
    );
    await store.load();
    await store.waitForInitialRestore();
    final apple = _item('apple', '蘋果');
    final pear = _item('pear', '梨');

    await store.save([apple]);
    await store.waitForPendingWrites();
    expect(backend.saves, isEmpty);

    await store.save([apple, pear]);
    await store.waitForPendingWrites();

    expect(backend.attempts, hasLength(2));
    expect(
      backend.attempts.last.items.map((item) => item.word).toSet(),
      {'apple', 'pear'},
    );
    expect(
      backend.snapshot.items.map((item) => item.word).toSet(),
      {'apple', 'pear'},
    );
    await store.dispose();
  });

  test('a delete queued during an add finishes as a tombstone', () async {
    final gate = Completer<void>();
    final backend = _FakeVocabCloudBackend(saveGate: gate);
    final store = CloudSyncedVocabStore(
      cloud: backend,
      uidProvider: () => 'uid-s004',
    );
    await store.load();

    await store.save([_item('apple', '蘋果')]);
    await backend.saveStarted.future.timeout(const Duration(seconds: 1));
    await store.save(const []);
    gate.complete();
    await store.waitForPendingWrites();

    expect(backend.attempts, hasLength(2));
    expect(backend.snapshot.items, isEmpty);
    expect(backend.snapshot.tombstones['apple'], greaterThan(0));
    await store.dispose();
  });

  test('a remote snapshot cannot discard a pending local word', () async {
    final gate = Completer<void>();
    final backend = _FakeVocabCloudBackend(saveGate: gate);
    final store = CloudSyncedVocabStore(
      cloud: backend,
      uidProvider: () => 'uid-s004',
    );
    final changes = <List<VocabItem>>[];
    final subscription = store.remoteChanges.listen(changes.add);
    await store.load();

    await store.save([_item('apple', '蘋果')]);
    await backend.saveStarted.future.timeout(const Duration(seconds: 1));
    backend.emit(const VocabCloudSnapshot());
    await Future<void>.delayed(const Duration(milliseconds: 20));
    gate.complete();
    await store.waitForPendingWrites();

    expect(backend.snapshot.items.single.word, 'apple');
    expect(changes, isEmpty);
    await subscription.cancel();
    await store.dispose();
  });
}

VocabItem _item(String word, String meaning) {
  final now = DateTime(2026, 8, 29);
  return VocabItem(
    id: 'item-$word',
    word: word,
    senses: [
      VocabSense(
        id: 'sense-$word',
        word: word,
        display: word,
        meaning: meaning,
        pos: 'noun',
        type: 'word',
      ),
    ],
    createdAt: now,
    updatedAt: now,
  );
}

class _FakeVocabCloudBackend implements VocabCloudBackend {
  _FakeVocabCloudBackend({
    VocabCloudSnapshot? initial,
    this.failLoad = false,
    this.loadGate,
    this.saveGate,
    this.saveFailuresRemaining = 0,
  }) : snapshot = initial ?? const VocabCloudSnapshot();

  VocabCloudSnapshot snapshot;
  final bool failLoad;
  final Completer<void>? loadGate;
  final Completer<void>? saveGate;
  int saveFailuresRemaining;
  final Completer<void> loadStarted = Completer<void>();
  final Completer<void> saveStarted = Completer<void>();
  final List<VocabCloudSnapshot> attempts = [];
  final List<VocabCloudSnapshot> saves = [];
  final StreamController<VocabCloudSnapshot> _stream =
      StreamController<VocabCloudSnapshot>.broadcast();

  @override
  Future<VocabCloudSnapshot> load(String uid) async {
    if (failLoad) throw StateError('offline');
    if (!loadStarted.isCompleted) loadStarted.complete();
    if (loadGate != null) await loadGate!.future;
    return snapshot;
  }

  @override
  Future<void> save(
    String uid, {
    required List<VocabItem> items,
    required Map<String, int> tombstones,
  }) async {
    final delta = VocabCloudSnapshot(
      items: [...items],
      tombstones: {...tombstones},
    );
    attempts.add(delta);
    if (!saveStarted.isCompleted) saveStarted.complete();
    await saveGate?.future;
    if (saveFailuresRemaining > 0) {
      saveFailuresRemaining -= 1;
      throw StateError('offline');
    }

    final mergedItems = <String, VocabItem>{
      for (final item in snapshot.items) item.normalizedWord: item,
    };
    final mergedTombstones = {...snapshot.tombstones};
    for (final item in items) {
      mergedItems[item.normalizedWord] = item;
      mergedTombstones.remove(item.normalizedWord);
    }
    for (final entry in tombstones.entries) {
      mergedItems.remove(entry.key);
      mergedTombstones[entry.key] = entry.value;
    }
    snapshot = VocabCloudSnapshot(
      items: mergedItems.values.toList(growable: false),
      tombstones: mergedTombstones,
    );
    saves.add(delta);
  }

  @override
  Stream<VocabCloudSnapshot> watch(String uid) => _stream.stream;

  void emit(VocabCloudSnapshot value) {
    snapshot = value;
    _stream.add(value);
  }
}
