import 'dart:async';

import 'package:flutter/foundation.dart';

import 'vocab_models.dart';
import 'vocab_cloud_store.dart';
import 'vocab_import_models.dart';
import 'vocab_repository.dart';
import 'vocab_review_controller.dart';
import 'vocab_synonym_repository.dart';

enum VocabAddResult { added, invalid, saveFailed }

class VocabController extends ChangeNotifier {
  VocabController({
    required VocabLookupRepository lookupRepository,
    required VocabStore store,
    DateTime Function()? now,
  })  : _lookupRepository = lookupRepository,
        _store = store,
        _now = now ?? DateTime.now;

  final VocabLookupRepository _lookupRepository;
  final VocabStore _store;
  final DateTime Function() _now;

  List<VocabItem> _items = const [];
  String _query = '';
  List<VocabSense> _lookupSenses = const [];
  List<VocabWordSuggestion> _suggestions = const [];
  Set<String> _selectedSenseIds = const {};
  bool _isInitializing = true;
  bool _isLookingUp = false;
  String? _expandedItemId;
  final Map<String, List<VocabExampleSection>> _examplesByItem = {};
  final Set<String> _loadingExampleItemIds = {};
  int _lookupRequest = 0;
  StreamSubscription<List<VocabItem>>? _remoteItemsSubscription;

  List<VocabItem> get items => List.unmodifiable(_items);
  String get query => _query;
  List<VocabSense> get lookupSenses => List.unmodifiable(_lookupSenses);
  List<VocabWordSuggestion> get suggestions => List.unmodifiable(_suggestions);
  Set<String> get selectedSenseIds => Set.unmodifiable(_selectedSenseIds);
  bool get isInitializing => _isInitializing;
  bool get isLookingUp => _isLookingUp;
  String? get expandedItemId => _expandedItemId;
  bool get canAdd =>
      normalizeVocabWord(_query).isNotEmpty && _selectedSenseIds.isNotEmpty;
  int get dueCount => _items
      .where((item) => item.totalSeen == 0 || !item.reviewMastered)
      .length;

  Future<void> initialize() async {
    if (_store case final CloudSyncedVocabStore cloudStore) {
      await _remoteItemsSubscription?.cancel();
      _remoteItemsSubscription = cloudStore.remoteChanges.listen((items) {
        _items = _normalizeSavedItems(items);
        _sortItems();
        notifyListeners();
      });
    }
    _items = _normalizeSavedItems(await _store.load());
    _sortItems();
    _isInitializing = false;
    notifyListeners();
  }

  List<VocabItem> _normalizeSavedItems(Iterable<VocabItem> items) {
    return items
        .map(normalizeSavedVocabItem)
        .where((item) => item.senses.isNotEmpty)
        .toList(growable: false);
  }

  @override
  void dispose() {
    unawaited(_remoteItemsSubscription?.cancel());
    if (_store case final CloudSyncedVocabStore cloudStore) {
      unawaited(cloudStore.dispose());
    }
    super.dispose();
  }

  Future<void> updateQuery(String value) async {
    _query = value.replaceAll(RegExp(r'\s+'), ' ');
    _selectedSenseIds = const {};
    _lookupSenses = const [];
    _suggestions = const [];
    final normalized = normalizeVocabWord(_query);
    final request = ++_lookupRequest;
    if (normalized.isEmpty) {
      _isLookingUp = false;
      notifyListeners();
      return;
    }
    _isLookingUp = true;
    notifyListeners();
    try {
      final result = await _lookupRepository.lookup(_query);
      if (request != _lookupRequest) return;
      _lookupSenses = result.senses;
      _suggestions = result.suggestions;
    } catch (_) {
      if (request != _lookupRequest) return;
      _lookupSenses = const [];
      _suggestions = const [];
    } finally {
      if (request == _lookupRequest) {
        _isLookingUp = false;
        notifyListeners();
      }
    }
  }

  Future<void> chooseSuggestion(VocabWordSuggestion suggestion) {
    return updateQuery(suggestion.display);
  }

  void toggleSense(VocabSense sense) {
    final next = {..._selectedSenseIds};
    if (!next.remove(sense.id)) next.add(sense.id);
    _selectedSenseIds = next;
    notifyListeners();
  }

  Future<VocabAddResult> addSelected() async {
    if (!canAdd) return VocabAddResult.invalid;
    final senses = _lookupSenses
        .where((sense) => _selectedSenseIds.contains(sense.id))
        .toList(growable: false);
    if (senses.isEmpty) return VocabAddResult.invalid;
    final now = _now();
    final normalized = normalizeVocabWord(_query);
    final previousItems = _items;
    final existingIndex =
        _items.indexWhere((item) => item.normalizedWord == normalized);
    if (existingIndex >= 0) {
      final existing = _items[existingIndex];
      final byId = <String, VocabSense>{
        for (final sense in existing.senses) sense.storageId: sense,
        for (final sense in senses) sense.storageId: sense,
      };
      final next = existing.copyWith(
        word: senses.first.display,
        senses: dedupeVocabSenses(byId.values),
        updatedAt: now,
      );
      _items = [..._items]..[existingIndex] = next;
    } else {
      _items = [
        VocabItem(
          id: 'vocab-${now.microsecondsSinceEpoch}-${normalized.hashCode.abs()}',
          word: senses.first.display,
          senses: senses,
          createdAt: now,
          updatedAt: now,
        ),
        ..._items,
      ];
    }
    _sortItems();
    try {
      await _store.save(_items);
    } catch (_) {
      _items = previousItems;
      notifyListeners();
      return VocabAddResult.saveFailed;
    }
    _query = '';
    _lookupSenses = const [];
    _suggestions = const [];
    _selectedSenseIds = const {};
    notifyListeners();
    return VocabAddResult.added;
  }

  Future<VocabImportSaveResult> bulkUpsertImported(
    List<VocabImportedEntry> importedEntries, {
    int? detectedCount,
  }) async {
    final uniqueEntries = <String, VocabImportedEntry>{};
    for (final entry in importedEntries) {
      final word = normalizeVocabWord(entry.word);
      if (word.isNotEmpty) uniqueEntries.putIfAbsent(word, () => entry);
    }

    final resolved = <String, List<VocabSense>>{};
    final entries = uniqueEntries.entries.toList(growable: false);
    for (var offset = 0; offset < entries.length; offset += 12) {
      final batch = entries.skip(offset).take(12).toList(growable: false);
      final results = await Future.wait(batch.map((entry) async {
        if (entry.value.senses.isNotEmpty) return entry.value.senses;
        try {
          return (await _lookupRepository.lookup(entry.key)).senses;
        } catch (_) {
          return const <VocabSense>[];
        }
      }));
      for (var index = 0; index < batch.length; index += 1) {
        resolved[batch[index].key] = results[index];
      }
    }

    final previousItems = _items;
    var workingItems = [..._items];
    var addedCount = 0;
    var duplicateCount = 0;
    final now = _now();
    for (var importIndex = 0; importIndex < entries.length; importIndex += 1) {
      final imported = entries[importIndex].value;
      final word = entries[importIndex].key;
      final rawSenses = resolved[word] ?? const <VocabSense>[];
      final sensesById = <String, VocabSense>{};
      for (final sense in rawSenses) {
        final meaning = normalizeVocabMeaning(sense.meaning);
        if (meaning.isEmpty) continue;
        final normalized = VocabSense(
          id: sense.id.isEmpty
              ? 'import-$word-${sense.pos}-${normalizeMeaningKey(meaning)}'
              : sense.id,
          word: word,
          display: imported.display.isEmpty ? sense.display : imported.display,
          meaning: meaning,
          pos: sense.pos.trim().toLowerCase(),
          type: sense.type.trim().toLowerCase().isEmpty
              ? 'word'
              : sense.type.trim().toLowerCase(),
          level: sense.level,
          source: sense.source,
          sourceEntryId: sense.sourceEntryId,
        );
        if (normalized.pos.isNotEmpty) {
          sensesById[normalized.storageId] = normalized;
        }
      }
      if (sensesById.isEmpty) continue;

      final existingIndex = workingItems.indexWhere(
        (item) => item.normalizedWord == word,
      );
      if (existingIndex >= 0) {
        final existing = workingItems[existingIndex];
        final merged = <String, VocabSense>{
          for (final sense in existing.senses) sense.storageId: sense,
          ...sensesById,
        };
        workingItems[existingIndex] = existing.copyWith(
          word: imported.display.isEmpty ? existing.word : imported.display,
          senses: dedupeVocabSenses(merged.values),
          updatedAt: now,
        );
        duplicateCount += 1;
      } else {
        workingItems.insert(
          0,
          VocabItem(
            id: 'vocab-${now.microsecondsSinceEpoch}-${word.hashCode.abs()}-$importIndex',
            word: imported.display.isEmpty ? word : imported.display,
            senses: dedupeVocabSenses(sensesById.values),
            createdAt: now,
            updatedAt: now,
          ),
        );
        addedCount += 1;
      }
    }

    workingItems.sort((left, right) {
      final date = right.createdAt.compareTo(left.createdAt);
      return date != 0 ? date : left.word.compareTo(right.word);
    });
    try {
      await _store.save(workingItems);
    } catch (_) {
      _items = previousItems;
      notifyListeners();
      return VocabImportSaveResult(
        detectedCount: detectedCount ?? uniqueEntries.length,
        addedCount: 0,
        duplicateCount: 0,
        saved: false,
      );
    }
    _items = workingItems;
    notifyListeners();
    return VocabImportSaveResult(
      detectedCount: detectedCount ?? uniqueEntries.length,
      addedCount: addedCount,
      duplicateCount: duplicateCount,
      saved: true,
    );
  }

  /// Saves linked synonym candidates as normal vocab rows, keeping one row per
  /// word and allowing the existing cloud/local sync path to handle them.
  Future<bool> addSynonymCandidates(
    List<VocabSynonymCandidate> candidates,
  ) async {
    final entries = candidates
        .where((candidate) => !candidate.saved)
        .map((candidate) => VocabImportedEntry(
              word: candidate.word,
              display: candidate.display,
              senses: [candidate.sense],
            ))
        .toList(growable: false);
    if (entries.isEmpty) return false;
    final result = await bulkUpsertImported(
      entries,
      detectedCount: entries.length,
    );
    return result.saved;
  }

  Future<bool> deleteItem(String itemId) async {
    final previous = _items;
    _items = _items.where((item) => item.id != itemId).toList(growable: false);
    _examplesByItem.remove(itemId);
    if (_expandedItemId == itemId) {
      _expandedItemId = null;
    }
    notifyListeners();
    try {
      await _store.save(_items);
      return true;
    } catch (_) {
      _items = previous;
      notifyListeners();
      return false;
    }
  }

  /// Records one completed review answer and keeps the saved-list badge in
  /// sync with the training round.
  Future<void> recordReviewAnswer(
    VocabItem item,
    VocabReviewKind kind,
    bool correct,
  ) async {
    final index = _items.indexWhere((candidate) => candidate.id == item.id);
    if (index < 0) return;
    final previous = _items;
    final current = _items[index];
    _items = [..._items];
    _items[index] = current.copyWith(
      totalSeen: current.totalSeen + 1,
      totalCorrect: current.totalCorrect + (correct ? 1 : 0),
      reviewMastered: correct,
      listeningMastered: current.listeningMastered ||
          (correct && kind == VocabReviewKind.listening),
      spellingMastered: current.spellingMastered ||
          (correct && kind == VocabReviewKind.spelling),
      speakingMastered:
          current.speakingMastered || (correct && kind.needsSpeaking),
      updatedAt: _now(),
    );
    notifyListeners();
    try {
      await _store.save(_items);
    } catch (_) {
      _items = previous;
      notifyListeners();
    }
  }

  Future<void> toggleExamples(VocabItem item) async {
    if (_expandedItemId == item.id) {
      _expandedItemId = null;
      notifyListeners();
      return;
    }
    _expandedItemId = item.id;
    notifyListeners();
    if (_examplesByItem.containsKey(item.id) ||
        _loadingExampleItemIds.contains(item.id)) {
      return;
    }
    _loadingExampleItemIds.add(item.id);
    notifyListeners();
    try {
      _examplesByItem[item.id] = await _lookupRepository.loadExamples(item);
    } finally {
      _loadingExampleItemIds.remove(item.id);
      notifyListeners();
    }
  }

  void collapseExamples() {
    if (_expandedItemId == null) return;
    _expandedItemId = null;
    notifyListeners();
  }

  bool examplesAreLoading(String itemId) =>
      _loadingExampleItemIds.contains(itemId);

  List<VocabExampleSection>? examplesFor(String itemId) =>
      _examplesByItem[itemId];

  /// Loads the reviewed/shared examples without changing which row is open.
  /// Used by the background audio warmer after login and cloud restore.
  Future<List<VocabExampleSection>> loadExamplesForAudio(VocabItem item) {
    return _lookupRepository.loadExamples(item);
  }

  Map<DateTime, List<VocabItem>> get groupedItems {
    final groups = <DateTime, List<VocabItem>>{};
    for (final item in _items) {
      final date = DateTime(
          item.createdAt.year, item.createdAt.month, item.createdAt.day);
      groups.putIfAbsent(date, () => []).add(item);
    }
    return groups;
  }

  void _sortItems() {
    _items = [..._items]..sort(compareVocabItemsByRecentCreation);
  }
}
