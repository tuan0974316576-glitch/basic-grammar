import 'package:flutter/foundation.dart';

import 'vocab_models.dart';
import 'vocab_repository.dart';

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
      .where(
          (item) => item.totalSeen == 0 || item.totalCorrect < item.totalSeen)
      .length;

  Future<void> initialize() async {
    _items = await _store.load();
    _sortItems();
    _isInitializing = false;
    notifyListeners();
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
        senses: byId.values.toList(growable: false),
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

  bool examplesAreLoading(String itemId) =>
      _loadingExampleItemIds.contains(itemId);

  List<VocabExampleSection>? examplesFor(String itemId) =>
      _examplesByItem[itemId];

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
    _items = [..._items]..sort((left, right) {
        final date = right.createdAt.compareTo(left.createdAt);
        return date != 0 ? date : left.word.compareTo(right.word);
      });
  }
}
