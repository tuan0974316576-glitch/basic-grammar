import 'dart:async';
import 'dart:convert';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'vocab_models.dart';
import 'vocab_repository.dart';

/// A snapshot of one student's saved vocabulary and deletion markers.
class VocabCloudSnapshot {
  const VocabCloudSnapshot({
    this.items = const [],
    this.tombstones = const {},
    this.repairWords = const {},
  });

  final List<VocabItem> items;
  final Map<String, int> tombstones;
  final Set<String> repairWords;
}

abstract interface class VocabCloudBackend {
  Future<VocabCloudSnapshot> load(String uid);

  Future<void> save(
    String uid, {
    required List<VocabItem> items,
    required Map<String, int> tombstones,
  });

  Stream<VocabCloudSnapshot> watch(String uid);
}

/// Firestore implementation for users/{uid}/vocabItems.
class FirestoreVocabCloudBackend implements VocabCloudBackend {
  FirestoreVocabCloudBackend({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _firestore;

  CollectionReference<Map<String, dynamic>> _collection(String uid) {
    return _firestore.collection('users').doc(uid).collection('vocabItems');
  }

  @override
  Future<VocabCloudSnapshot> load(String uid) async {
    final snapshot =
        await _collection(uid).get().timeout(const Duration(seconds: 8));
    return _decode(snapshot);
  }

  @override
  Stream<VocabCloudSnapshot> watch(String uid) {
    return _collection(uid).snapshots().map(_decode);
  }

  @override
  Future<void> save(
    String uid, {
    required List<VocabItem> items,
    required Map<String, int> tombstones,
  }) async {
    // The caller supplies only changed rows. Firestore document sets are
    // naturally incremental, so saving one new word stays one network write
    // regardless of how large the student's vocabulary bank has grown.
    final entries = <MapEntry<DocumentReference<Map<String, dynamic>>,
        Map<String, dynamic>>>[];
    final syncedAt = DateTime.now().millisecondsSinceEpoch;
    for (final item in items) {
      entries.add(MapEntry(
        _collection(uid).doc(docIdForWord(item.normalizedWord)),
        _itemPayload(item, uid, syncedAt),
      ));
    }
    for (final entry in tombstones.entries) {
      if (entry.value <= 0) continue;
      entries.add(MapEntry(
        _collection(uid).doc(docIdForWord(entry.key)),
        {
          'word': normalizeVocabWord(entry.key),
          'deletedAt': entry.value,
          'updatedAt': entry.value,
          'ownerUid': uid,
          'syncedAt': syncedAt,
        },
      ));
    }

    // Firestore batches are capped at 500 writes.
    for (var offset = 0; offset < entries.length; offset += 450) {
      final batch = _firestore.batch();
      for (final entry in entries.skip(offset).take(450)) {
        batch.set(entry.key, entry.value);
      }
      await batch.commit().timeout(const Duration(seconds: 15));
    }
  }

  static String docIdForWord(String word) =>
      'word-${Uri.encodeComponent(normalizeVocabWord(word))}';

  VocabCloudSnapshot _decode(
    QuerySnapshot<Map<String, dynamic>> snapshot,
  ) {
    final items = <VocabItem>[];
    final tombstones = <String, int>{};
    final documentsByWord =
        <String, List<QueryDocumentSnapshot<Map<String, dynamic>>>>{};
    for (final document in snapshot.docs) {
      final data = document.data();
      final word = normalizeVocabWord('${data['word'] ?? ''}');
      if (word.isEmpty) continue;
      final deletedAt = (data['deletedAt'] as num?)?.toInt() ?? 0;
      if (deletedAt > 0) {
        tombstones[word] = deletedAt;
        continue;
      }
      final item = _itemFromPayload(document.id, data);
      if (item != null) {
        items.add(item);
        documentsByWord.putIfAbsent(word, () => []).add(document);
      }
    }
    final repairWords = <String>{};
    for (final entry in documentsByWord.entries) {
      final canonicalId = docIdForWord(entry.key);
      QueryDocumentSnapshot<Map<String, dynamic>>? canonical;
      for (final document in entry.value) {
        if (document.id == canonicalId) {
          canonical = document;
          break;
        }
      }
      if (canonical == null || _payloadNeedsRepair(canonical.data())) {
        repairWords.add(entry.key);
      }
    }
    return VocabCloudSnapshot(
      items: items,
      tombstones: tombstones,
      repairWords: repairWords,
    );
  }

  static bool _payloadNeedsRepair(Map<String, dynamic> data) {
    final rawSenses = data['meanings'];
    if (rawSenses is! List) return false;
    final seen = <String>{};
    for (final raw in rawSenses.whereType<Map>()) {
      final sense = Map<String, dynamic>.from(raw);
      final word = normalizeVocabWord('${sense['word'] ?? ''}');
      final display = displayVocabWord('${sense['display'] ?? ''}');
      final id = '${sense['id'] ?? ''}'.trim();
      final pos = '${sense['pos'] ?? ''}'.trim().toLowerCase();
      final type = '${sense['type'] ?? 'word'}'.trim().toLowerCase();
      final meaning = normalizeVocabMeaning('${sense['meaning'] ?? ''}');
      final key = [word, pos, type, normalizeMeaningKey(meaning)].join('|');
      if (word.isEmpty || display.isEmpty || id.isEmpty || !seen.add(key)) {
        return true;
      }
    }
    return false;
  }

  static Map<String, dynamic> _itemPayload(
    VocabItem item,
    String uid,
    int syncedAt,
  ) {
    final primary = item.senses.first;
    return {
      'word': item.word,
      'meaning': item.senses.map((sense) => sense.meaning).join(' / '),
      'meanings': item.senses.map((sense) => sense.toJson()).toList(),
      'pos': primary.pos,
      'type': primary.type,
      'source': primary.source,
      'teacherEntryId': primary.sourceEntryId,
      'sourceEntryId': primary.sourceEntryId,
      'level': primary.level,
      'createdAt': item.createdAt.millisecondsSinceEpoch,
      'updatedAt': item.updatedAt.millisecondsSinceEpoch,
      'progress': {
        'totalSeen': item.totalSeen,
        'totalCorrect': item.totalCorrect,
        'totalIncorrect': item.totalIncorrect,
        'reviewMastered': item.reviewMastered,
        'streakCorrect': item.streakCorrect,
        'mastery': item.mastery,
        'lastSeenAt': item.lastSeenAt?.millisecondsSinceEpoch,
        'nextDueAt': item.nextDueAt?.millisecondsSinceEpoch,
        'halfLifeDays': item.halfLifeDays,
        'lastRecallProb': item.lastRecallProb,
        'listeningMastered': item.listeningMastered,
        'spellingMastered': item.spellingMastered,
        'speakingMastered': item.speakingMastered,
        'updatedAt': item.updatedAt.millisecondsSinceEpoch,
      },
      'ownerUid': uid,
      'syncedAt': syncedAt,
    };
  }

  static VocabItem? _itemFromPayload(
    String documentId,
    Map<String, dynamic> data,
  ) {
    final word = normalizeVocabWord('${data['word'] ?? ''}');
    if (word.isEmpty) return null;
    final rawSenses = data['meanings'];
    var senses = rawSenses is List
        ? rawSenses
            .whereType<Map>()
            .map((entry) => VocabSense.fromJson(
                  Map<String, dynamic>.from(entry),
                  fallbackWord: word,
                  fallbackDisplay: '${data['display'] ?? data['word'] ?? word}',
                  fallbackPos: '${data['pos'] ?? ''}',
                  fallbackType: '${data['type'] ?? 'word'}',
                ))
            .where((sense) => sense.meaning.isNotEmpty)
            .toList(growable: false)
        : const <VocabSense>[];
    if (senses.isEmpty && '${data['meaning'] ?? ''}'.trim().isNotEmpty) {
      senses = [
        VocabSense(
          id: '$documentId-sense',
          word: word,
          display: '${data['display'] ?? word}'.trim(),
          meaning: '${data['meaning'] ?? ''}',
          pos: '${data['pos'] ?? ''}',
          type: '${data['type'] ?? 'word'}',
          level: '${data['level'] ?? ''}',
          source: '${data['source'] ?? ''}',
          sourceEntryId: '${data['sourceEntryId'] ?? ''}',
        ),
      ];
    }
    if (senses.isEmpty) return null;
    final progress = data['progress'] is Map
        ? Map<String, dynamic>.from(data['progress'] as Map)
        : const <String, dynamic>{};
    return VocabItem(
      id: documentId,
      word: displayVocabWord('${data['word'] ?? word}'),
      senses: dedupeVocabSenses(senses),
      createdAt: _dateFrom(data['createdAt']),
      updatedAt: _dateFrom(data['updatedAt']),
      totalSeen: (progress['totalSeen'] as num?)?.toInt() ??
          (data['totalSeen'] as num?)?.toInt() ??
          0,
      totalCorrect: (progress['totalCorrect'] as num?)?.toInt() ??
          (data['totalCorrect'] as num?)?.toInt() ??
          0,
      totalIncorrect: (progress['totalIncorrect'] as num?)?.toInt() ??
          (data['totalIncorrect'] as num?)?.toInt() ??
          (((progress['totalSeen'] as num?)?.toInt() ??
                      (data['totalSeen'] as num?)?.toInt() ??
                      0) -
                  ((progress['totalCorrect'] as num?)?.toInt() ??
                      (data['totalCorrect'] as num?)?.toInt() ??
                      0))
              .clamp(0, 1 << 30),
      reviewMastered: progress.containsKey('reviewMastered')
          ? progress['reviewMastered'] == true
          : (data.containsKey('reviewMastered')
              ? data['reviewMastered'] == true
              : ((progress['totalSeen'] as num?)?.toInt() ??
                          (data['totalSeen'] as num?)?.toInt() ??
                          0) >
                      0 &&
                  ((progress['totalCorrect'] as num?)?.toInt() ??
                          (data['totalCorrect'] as num?)?.toInt() ??
                          0) >=
                      ((progress['totalSeen'] as num?)?.toInt() ??
                          (data['totalSeen'] as num?)?.toInt() ??
                          0)),
      streakCorrect: (progress['streakCorrect'] as num?)?.toInt() ??
          (data['streakCorrect'] as num?)?.toInt() ??
          0,
      mastery: (progress['mastery'] as num?)?.toDouble() ??
          (data['mastery'] as num?)?.toDouble() ??
          0,
      lastSeenAt: _optionalDateFrom(
        progress['lastSeenAt'] ?? data['lastSeenAt'],
      ),
      nextDueAt: _optionalDateFrom(
        progress['nextDueAt'] ?? data['nextDueAt'],
      ),
      halfLifeDays: (progress['halfLifeDays'] as num?)?.toDouble() ??
          (data['halfLifeDays'] as num?)?.toDouble() ??
          0.5,
      lastRecallProb: (progress['lastRecallProb'] as num?)?.toDouble() ??
          (data['lastRecallProb'] as num?)?.toDouble() ??
          0,
      listeningMastered: progress['listeningMastered'] == true,
      spellingMastered: progress['spellingMastered'] == true,
      speakingMastered: progress['speakingMastered'] == true,
    );
  }

  static DateTime _dateFrom(Object? value) {
    final milliseconds = value is num ? value.toInt() : 0;
    return DateTime.fromMillisecondsSinceEpoch(milliseconds);
  }

  static DateTime? _optionalDateFrom(Object? value) {
    final milliseconds = value is num ? value.toInt() : 0;
    return milliseconds <= 0
        ? null
        : DateTime.fromMillisecondsSinceEpoch(milliseconds);
  }
}

/// Local-first student vocabulary store with Firebase restore and sync.
class CloudSyncedVocabStore implements VocabStore {
  CloudSyncedVocabStore({
    FirebaseAuth? auth,
    VocabCloudBackend? cloud,
    String? Function()? uidProvider,
  })  : _auth = auth,
        _cloud = cloud ?? FirestoreVocabCloudBackend(),
        _uidProvider = uidProvider;

  static const storageKey = SharedPreferencesVocabStore.storageKey;
  static const _tombstoneKey = 'dope_english_vocab_tombstones_v1';
  static const _migrationKey = 'dope_english_vocab_legacy_migrated_v1';

  final FirebaseAuth? _auth;
  final VocabCloudBackend _cloud;
  final String? Function()? _uidProvider;
  final StreamController<List<VocabItem>> _remoteChanges =
      StreamController<List<VocabItem>>.broadcast();

  Stream<List<VocabItem>> get remoteChanges => _remoteChanges.stream;

  String? _activeUid;
  List<VocabItem> _items = const [];
  Map<String, int> _tombstones = const {};
  StreamSubscription<VocabCloudSnapshot>? _subscription;
  Future<void> _writeQueue = Future<void>.value();
  Future<void> _remoteApplyQueue = Future<void>.value();
  Future<void> _initialRestore = Future<void>.value();
  final Map<String, Map<String, VocabItem>> _pendingItemsByUid = {};
  final Map<String, Map<String, int>> _pendingTombstonesByUid = {};
  bool _isDisposed = false;

  String? get activeUid => _activeUid;

  @visibleForTesting
  List<VocabItem> get currentItems => List.unmodifiable(_items);

  String? _uid() => _uidProvider?.call() ?? _auth?.currentUser?.uid;

  @override
  Future<List<VocabItem>> load() async {
    if (_isDisposed) {
      throw StateError('Cannot load a disposed vocabulary store.');
    }
    await _subscription?.cancel();
    _subscription = null;
    await _remoteApplyQueue;
    final uid = _uid();
    _activeUid = uid;
    final preferences = await SharedPreferences.getInstance();
    if (uid == null || uid.isEmpty) {
      _items = _decode(preferences.getString(storageKey));
      _tombstones = const {};
      return List.unmodifiable(_items);
    }

    final scopedKey = _scopedStorageKey(uid);
    var local = _decode(preferences.getString(scopedKey));
    final legacy = _decode(preferences.getString(storageKey));
    if (preferences.getBool(_migrationKey) != true) {
      if (legacy.isNotEmpty) {
        local = _mergeItems(local, legacy, const {}).items;
      }
      await preferences.setBool(_migrationKey, true);
      await preferences.remove(storageKey);
    }
    _items = local;
    _tombstones = _readTombstones(preferences, uid);
    // Return the local snapshot immediately.  A student's saved vocabulary is
    // already in SharedPreferences, so opening the vocabulary book must not
    // wait for an 8-second Firestore read.  The remote snapshot is merged in
    // the background and delivered through remoteChanges when it adds rows or
    // repairs local data.
    _startListener(uid);
    _initialRestore = _restoreRemoteInBackground(uid);
    unawaited(_initialRestore);
    return List.unmodifiable(_items);
  }

  @visibleForTesting
  Future<void> waitForInitialRestore() => _initialRestore;

  Future<void> _restoreRemoteInBackground(String uid) async {
    VocabCloudSnapshot remote;
    try {
      remote = await _cloud.load(uid);
    } catch (error) {
      debugPrint('Student vocab cloud restore failed: $error');
      return;
    }
    if (_isDisposed || _activeUid != uid) return;

    // Listener snapshots and the one-shot restore can arrive together.  Keep
    // their merge/write order deterministic so a stale remote read cannot
    // overwrite a newer local save.
    _remoteApplyQueue = _remoteApplyQueue
        .then((_) => _applyRemote(uid, remote))
        .catchError((Object error, StackTrace stack) {
      debugPrint('Student vocab cloud restore merge failed: $error');
    });
    await _remoteApplyQueue;
  }

  @override
  Future<void> save(List<VocabItem> items) async {
    final next = List<VocabItem>.unmodifiable(
      items.map(normalizeSavedVocabItem),
    );
    final preferences = await SharedPreferences.getInstance();
    final uid = _activeUid ?? _uid();
    if (uid == null || uid.isEmpty) {
      await preferences.setString(storageKey, VocabItem.encodeList(next));
      _items = next;
      return;
    }
    final previousByWord = <String, VocabItem>{
      for (final item in _items) item.normalizedWord: item,
    };
    final tombstones = {..._tombstones};
    final changedTombstones = <String, int>{};
    final previousWords = _items.map((item) => item.normalizedWord).toSet();
    final nextWords = next.map((item) => item.normalizedWord).toSet();
    final deletedAt = DateTime.now().millisecondsSinceEpoch;
    for (final word in previousWords.difference(nextWords)) {
      tombstones[word] = deletedAt;
      changedTombstones[word] = deletedAt;
    }
    for (final word in nextWords) {
      tombstones.remove(word);
    }
    final changedItems = next.where((item) {
      final previous = previousByWord[item.normalizedWord];
      return previous == null ||
          _itemSyncSignature(previous) != _itemSyncSignature(item);
    }).toList(growable: false);
    _items = next;
    _tombstones = tombstones;
    await _writeLocal(preferences, uid, _items, _tombstones);
    if (changedItems.isNotEmpty ||
        changedTombstones.isNotEmpty ||
        _hasPendingCloudChanges(uid)) {
      // Saving is local-first. Cloud latency or a large existing vocabulary
      // must never hold the Add button in a loading state.
      unawaited(
        _enqueueCloudWrite(uid, changedItems, changedTombstones),
      );
    }
  }

  @visibleForTesting
  Future<void> waitForPendingWrites() async {
    while (true) {
      final queued = _writeQueue;
      await queued;
      if (identical(queued, _writeQueue)) return;
    }
  }

  bool _hasPendingCloudChanges(String uid) {
    return (_pendingItemsByUid[uid]?.isNotEmpty ?? false) ||
        (_pendingTombstonesByUid[uid]?.isNotEmpty ?? false);
  }

  Future<void> _enqueueCloudWrite(
    String uid,
    List<VocabItem> items,
    Map<String, int> tombstones,
  ) {
    final pendingItems = _pendingItemsByUid.putIfAbsent(uid, () => {});
    final pendingTombstones =
        _pendingTombstonesByUid.putIfAbsent(uid, () => {});
    for (final item in items) {
      final word = item.normalizedWord;
      if (word.isEmpty) continue;
      pendingItems[word] = item;
      pendingTombstones.remove(word);
    }
    for (final entry in tombstones.entries) {
      final word = normalizeVocabWord(entry.key);
      if (word.isEmpty || entry.value <= 0) continue;
      pendingTombstones[word] = entry.value;
      pendingItems.remove(word);
    }
    _writeQueue = _writeQueue.then((_) async {
      final itemSnapshot = Map<String, VocabItem>.from(pendingItems);
      final tombstoneSnapshot = Map<String, int>.from(pendingTombstones);
      if (itemSnapshot.isEmpty && tombstoneSnapshot.isEmpty) return;
      try {
        await _cloud.save(
          uid,
          items: itemSnapshot.values.toList(growable: false),
          tombstones: tombstoneSnapshot,
        );
        for (final entry in itemSnapshot.entries) {
          final current = pendingItems[entry.key];
          if (current != null &&
              _itemSyncSignature(current) == _itemSyncSignature(entry.value)) {
            pendingItems.remove(entry.key);
          }
        }
        for (final entry in tombstoneSnapshot.entries) {
          if (pendingTombstones[entry.key] == entry.value) {
            pendingTombstones.remove(entry.key);
          }
        }
        if (pendingItems.isEmpty) _pendingItemsByUid.remove(uid);
        if (pendingTombstones.isEmpty) _pendingTombstonesByUid.remove(uid);
      } catch (error) {
        // Keep this delta dirty. A later save, listener repair, or login will
        // retry it without uploading every unchanged vocabulary row.
        debugPrint('Student vocab cloud sync failed: $error');
      }
    });
    return _writeQueue;
  }

  void _startListener(String uid) {
    _subscription = _cloud.watch(uid).listen(
      (snapshot) {
        _remoteApplyQueue = _remoteApplyQueue
            .then((_) => _applyRemote(uid, snapshot))
            .catchError((Object error, StackTrace stack) {
          debugPrint('Student vocab cloud update failed: $error');
        });
      },
      onError: (Object error, StackTrace stack) {
        debugPrint('Student vocab cloud listener failed: $error');
      },
    );
  }

  Future<void> _applyRemote(String uid, VocabCloudSnapshot snapshot) async {
    if (_isDisposed || _activeUid != uid) return;
    final merged = _mergeItems(
      _items,
      snapshot.items,
      _mergeTombstones(_tombstones, snapshot.tombstones),
    );
    final changed = _signature(_items) != _signature(merged.items) ||
        !_sameTombstones(_tombstones, merged.tombstones);
    _items = merged.items;
    _tombstones = merged.tombstones;
    final preferences = await SharedPreferences.getInstance();
    await _writeLocal(preferences, uid, _items, _tombstones);
    if (_isDisposed || _activeUid != uid) return;
    if (changed) _remoteChanges.add(List.unmodifiable(_items));
    final repair = _cloudRepairDelta(
      _items,
      snapshot.items,
      snapshot.tombstones,
      _tombstones,
      forceWords: snapshot.repairWords,
    );
    if (repair.hasChanges) {
      unawaited(_enqueueCloudWrite(uid, repair.items, repair.tombstones));
    }
  }

  Future<void> _writeLocal(
    SharedPreferences preferences,
    String uid,
    List<VocabItem> items,
    Map<String, int> tombstones,
  ) async {
    await preferences.setString(
        _scopedStorageKey(uid), VocabItem.encodeList(items));
    await preferences.setString(
        _tombstoneStorageKey(uid), _encodeTombstones(tombstones));
  }

  static String _scopedStorageKey(String uid) => '${storageKey}_$uid';

  static String _tombstoneStorageKey(String uid) => '${_tombstoneKey}_$uid';

  static List<VocabItem> _decode(String? source) {
    if (source == null || source.isEmpty) return const [];
    try {
      return VocabItem.decodeList(source);
    } catch (_) {
      return const [];
    }
  }

  static Map<String, int> _readTombstones(
    SharedPreferences preferences,
    String uid,
  ) {
    final source = preferences.getString(_tombstoneStorageKey(uid));
    if (source == null || source.isEmpty) return const {};
    try {
      final decoded = Map<String, dynamic>.from(
        (jsonDecode(source) as Map),
      );
      return {
        for (final entry in decoded.entries)
          normalizeVocabWord(entry.key): (entry.value as num).toInt(),
      };
    } catch (_) {
      return const {};
    }
  }

  static String _encodeTombstones(Map<String, int> tombstones) {
    return jsonEncode({
      for (final entry in tombstones.entries)
        normalizeVocabWord(entry.key): entry.value,
    });
  }

  static _MergedVocab _mergeItems(
    List<VocabItem> local,
    List<VocabItem> remote,
    Map<String, int> tombstones,
  ) {
    final byWord = <String, VocabItem>{};
    for (final rawItem in [...local, ...remote]) {
      final item = normalizeSavedVocabItem(rawItem);
      final word = item.normalizedWord;
      if (word.isEmpty) continue;
      final existing = byWord[word];
      byWord[word] = existing == null ? item : _mergeItem(existing, item);
    }
    final activeTombstones = <String, int>{};
    final activeItems = <VocabItem>[];
    for (final entry in byWord.entries) {
      final deletedAt = tombstones[entry.key] ?? 0;
      if (deletedAt > 0 &&
          deletedAt >= entry.value.updatedAt.millisecondsSinceEpoch) {
        activeTombstones[entry.key] = deletedAt;
        continue;
      }
      activeItems.add(entry.value);
    }
    // A deletion can arrive without an item document. Keep that marker so an
    // offline device cannot resurrect the word when it later reconnects.
    for (final entry in tombstones.entries) {
      if (entry.value > 0 && !byWord.containsKey(entry.key)) {
        activeTombstones[entry.key] = entry.value;
      }
    }
    activeTombstones.removeWhere((_, value) => value <= 0);
    activeItems.sort(compareVocabItemsByRecentCreation);
    return _MergedVocab(
      items: activeItems,
      tombstones: activeTombstones,
    );
  }

  static VocabItem _mergeItem(VocabItem left, VocabItem right) {
    final newer = right.updatedAt.isAfter(left.updatedAt) ? right : left;
    final createdAt = left.createdAt.isBefore(right.createdAt)
        ? left.createdAt
        : right.createdAt;
    return VocabItem(
      id: newer.id,
      word: newer.word,
      senses: normalizeVocabSensesForWord(
        [...left.senses, ...right.senses],
        word: newer.word,
        display: newer.word,
      ),
      createdAt: createdAt,
      updatedAt: newer.updatedAt,
      totalSeen:
          left.totalSeen > right.totalSeen ? left.totalSeen : right.totalSeen,
      totalCorrect: left.totalCorrect > right.totalCorrect
          ? left.totalCorrect
          : right.totalCorrect,
      totalIncorrect: left.totalIncorrect > right.totalIncorrect
          ? left.totalIncorrect
          : right.totalIncorrect,
      reviewMastered: newer.reviewMastered,
      streakCorrect: left.streakCorrect > right.streakCorrect
          ? left.streakCorrect
          : right.streakCorrect,
      mastery: newer.mastery,
      lastSeenAt: newer.lastSeenAt,
      nextDueAt: newer.nextDueAt,
      halfLifeDays: newer.halfLifeDays,
      lastRecallProb: newer.lastRecallProb,
      listeningMastered: left.listeningMastered || right.listeningMastered,
      spellingMastered: left.spellingMastered || right.spellingMastered,
      speakingMastered: left.speakingMastered || right.speakingMastered,
    );
  }

  static Map<String, int> _mergeTombstones(
    Map<String, int> left,
    Map<String, int> right,
  ) {
    final merged = <String, int>{...left};
    for (final entry in right.entries) {
      final word = normalizeVocabWord(entry.key);
      final timestamp = entry.value;
      if (word.isNotEmpty && timestamp > (merged[word] ?? 0)) {
        merged[word] = timestamp;
      }
    }
    return merged;
  }

  static bool _sameTombstones(Map<String, int> left, Map<String, int> right) {
    if (left.length != right.length) return false;
    for (final entry in left.entries) {
      if (right[entry.key] != entry.value) return false;
    }
    return true;
  }

  static String _signature(List<VocabItem> items) =>
      VocabItem.encodeList(items);

  static String _itemSyncSignature(VocabItem item) => jsonEncode({
        'word': item.word,
        'senses': item.senses.map((sense) => sense.toJson()).toList(),
        'createdAt': item.createdAt.millisecondsSinceEpoch,
        'updatedAt': item.updatedAt.millisecondsSinceEpoch,
        'totalSeen': item.totalSeen,
        'totalCorrect': item.totalCorrect,
        'totalIncorrect': item.totalIncorrect,
        'reviewMastered': item.reviewMastered,
        'streakCorrect': item.streakCorrect,
        'mastery': item.mastery,
        'lastSeenAt': item.lastSeenAt?.millisecondsSinceEpoch,
        'nextDueAt': item.nextDueAt?.millisecondsSinceEpoch,
        'halfLifeDays': item.halfLifeDays,
        'lastRecallProb': item.lastRecallProb,
        'listeningMastered': item.listeningMastered,
        'spellingMastered': item.spellingMastered,
        'speakingMastered': item.speakingMastered,
      });

  static _VocabCloudDelta _cloudRepairDelta(
    List<VocabItem> merged,
    List<VocabItem> remote,
    Map<String, int> remoteTombstones,
    Map<String, int> tombstones, {
    Set<String> forceWords = const {},
  }) {
    final remoteByWord = {
      for (final item in remote) item.normalizedWord: item,
    };
    final changedItems = <VocabItem>[];
    for (final item in merged) {
      final cloud = remoteByWord[item.normalizedWord];
      if (forceWords.contains(item.normalizedWord) ||
          cloud == null ||
          item.updatedAt.isAfter(cloud.updatedAt) ||
          _itemSyncSignature(item) != _itemSyncSignature(cloud)) {
        changedItems.add(item);
      }
    }
    final changedTombstones = <String, int>{};
    for (final entry in tombstones.entries) {
      if (remoteTombstones[entry.key] != entry.value) {
        changedTombstones[entry.key] = entry.value;
      }
    }
    return _VocabCloudDelta(
      items: changedItems,
      tombstones: changedTombstones,
    );
  }

  Future<void> dispose() async {
    if (_isDisposed) return;
    _isDisposed = true;
    await _subscription?.cancel();
    _subscription = null;
    await _remoteApplyQueue;
    await waitForPendingWrites();
    await _remoteChanges.close();
  }
}

class _VocabCloudDelta {
  const _VocabCloudDelta({required this.items, required this.tombstones});

  final List<VocabItem> items;
  final Map<String, int> tombstones;

  bool get hasChanges => items.isNotEmpty || tombstones.isNotEmpty;
}

class _MergedVocab {
  const _MergedVocab({required this.items, required this.tombstones});

  final List<VocabItem> items;
  final Map<String, int> tombstones;
}
