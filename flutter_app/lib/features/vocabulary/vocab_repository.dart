import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'vocab_models.dart';

abstract interface class VocabLookupRepository {
  Future<VocabLookupResult> lookup(String query);

  Future<List<VocabExampleSection>> loadExamples(VocabItem item);
}

class AssetVocabLookupRepository implements VocabLookupRepository {
  AssetVocabLookupRepository({AssetBundle? bundle})
      : _bundle = bundle ?? rootBundle;

  final AssetBundle _bundle;
  final Map<String, Map<String, dynamic>> _lookupShards = {};
  final Map<String, Map<String, dynamic>> _exampleShards = {};
  List<VocabWordSuggestion>? _headwords;

  static const _assetRoot = 'assets/data/vocab';

  @override
  Future<VocabLookupResult> lookup(String query) async {
    final word = normalizeVocabWord(query);
    if (word.isEmpty) return const VocabLookupResult(senses: []);
    final shard = await _loadShard(_lookupShards, 'lookup', word);
    final raw = shard[word];
    final senses = raw is List
        ? raw
            .whereType<Map>()
            .map((entry) =>
                VocabSense.fromJson(Map<String, dynamic>.from(entry)))
            .where((entry) => entry.meaning.isNotEmpty)
            .toList(growable: false)
        : <VocabSense>[];
    if (senses.isNotEmpty) return VocabLookupResult(senses: senses);
    return VocabLookupResult(
      senses: const [],
      suggestions: await _findSuggestions(word),
    );
  }

  @override
  Future<List<VocabExampleSection>> loadExamples(VocabItem item) async {
    final word = item.normalizedWord;
    final shard = await _loadShard(_exampleShards, 'examples', word);
    final raw = shard[word];
    final candidates = raw is List
        ? raw.whereType<Map>().map(Map<String, dynamic>.from).toList()
        : <Map<String, dynamic>>[];
    return item.senses.map((sense) {
      final payload = _bestExamplePayload(sense, candidates);
      final rawExamples = payload?['examples'];
      final examples = rawExamples is List
          ? rawExamples
              .whereType<Map>()
              .map((entry) =>
                  VocabExample.fromJson(Map<String, dynamic>.from(entry)))
              .where((entry) =>
                  entry.english.isNotEmpty && entry.chinese.isNotEmpty)
              .take(3)
              .toList(growable: false)
          : <VocabExample>[];
      return VocabExampleSection(sense: sense, examples: examples);
    }).toList(growable: false);
  }

  Future<Map<String, dynamic>> _loadShard(
    Map<String, Map<String, dynamic>> cache,
    String prefix,
    String word,
  ) async {
    final shard = _shardFor(word);
    final cached = cache[shard];
    if (cached != null) return cached;
    try {
      final source =
          await _bundle.loadString('$_assetRoot/${prefix}_$shard.json');
      final decoded = await compute(_decodeJsonMap, source);
      cache[shard] = decoded;
      return decoded;
    } catch (_) {
      cache[shard] = const {};
      return const {};
    }
  }

  Future<List<VocabWordSuggestion>> _findSuggestions(String query) async {
    var headwords = _headwords;
    if (headwords == null) {
      try {
        final source = await _bundle.loadString('$_assetRoot/headwords.json');
        final decoded = await compute(_decodeJsonList, source);
        headwords = decoded
            .whereType<Map>()
            .map((entry) =>
                VocabWordSuggestion.fromJson(Map<String, dynamic>.from(entry)))
            .where((entry) => entry.word.isNotEmpty)
            .toList(growable: false);
      } catch (_) {
        headwords = const [];
      }
      _headwords = headwords;
    }
    final prefixMatches = headwords
        .where((entry) => entry.word.startsWith(query))
        .take(5)
        .toList(growable: false);
    if (prefixMatches.isNotEmpty) return prefixMatches;
    if (query.length < 3) return const [];
    final candidates = headwords
        .where((entry) => (entry.word.length - query.length).abs() <= 2)
        .map((entry) =>
            (entry: entry, distance: _editDistance(query, entry.word)))
        .where((candidate) => candidate.distance <= 2)
        .toList()
      ..sort((left, right) {
        final distance = left.distance.compareTo(right.distance);
        return distance != 0
            ? distance
            : left.entry.word.compareTo(right.entry.word);
      });
    return candidates
        .take(5)
        .map((entry) => entry.entry)
        .toList(growable: false);
  }

  Map<String, dynamic>? _bestExamplePayload(
    VocabSense sense,
    List<Map<String, dynamic>> candidates,
  ) {
    if (candidates.isEmpty) return null;
    final meaningKey = normalizeMeaningKey(sense.meaning);
    int score(Map<String, dynamic> candidate) {
      final candidateMeaning =
          normalizeMeaningKey('${candidate['meaning'] ?? ''}');
      final candidatePos = '${candidate['pos'] ?? ''}'.trim().toLowerCase();
      final candidateType = '${candidate['type'] ?? ''}'.trim().toLowerCase();
      var value = 0;
      if (candidateMeaning == meaningKey && meaningKey.isNotEmpty) value += 8;
      if (_meaningPartsOverlap(candidateMeaning, meaningKey)) value += 4;
      if (candidatePos.isNotEmpty && candidatePos == sense.pos) value += 3;
      if (candidateType.isNotEmpty && candidateType == sense.type) value += 1;
      if (candidateMeaning.isEmpty) value += 1;
      return value;
    }

    final ranked = [...candidates]
      ..sort((left, right) => score(right).compareTo(score(left)));
    return score(ranked.first) > 0 ? ranked.first : null;
  }

  bool _meaningPartsOverlap(String left, String right) {
    if (left.isEmpty || right.isEmpty) return false;
    return left.contains(right) || right.contains(left);
  }
}

abstract interface class VocabStore {
  Future<List<VocabItem>> load();

  Future<void> save(List<VocabItem> items);
}

class SharedPreferencesVocabStore implements VocabStore {
  const SharedPreferencesVocabStore();

  static const storageKey = 'dope_english_vocab_items_v1';

  @override
  Future<List<VocabItem>> load() async {
    try {
      final preferences = await SharedPreferences.getInstance();
      final source = preferences.getString(storageKey);
      return source == null ? const [] : VocabItem.decodeList(source);
    } catch (_) {
      return const [];
    }
  }

  @override
  Future<void> save(List<VocabItem> items) async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString(storageKey, VocabItem.encodeList(items));
  }
}

Map<String, dynamic> _decodeJsonMap(String source) {
  final decoded = jsonDecode(source);
  return decoded is Map
      ? Map<String, dynamic>.from(decoded)
      : <String, dynamic>{};
}

List<dynamic> _decodeJsonList(String source) {
  final decoded = jsonDecode(source);
  return decoded is List ? decoded : <dynamic>[];
}

String _shardFor(String value) {
  final word = normalizeVocabWord(value);
  if (word.isEmpty) return '_';
  final first = word[0];
  if (RegExp('[a-z]').hasMatch(first)) return first;
  if (RegExp('[0-9]').hasMatch(first)) return '0';
  return '_';
}

int _editDistance(String left, String right) {
  var previous = List<int>.generate(right.length + 1, (index) => index);
  for (var leftIndex = 0; leftIndex < left.length; leftIndex += 1) {
    final current = <int>[leftIndex + 1];
    for (var rightIndex = 0; rightIndex < right.length; rightIndex += 1) {
      final insert = current[rightIndex] + 1;
      final delete = previous[rightIndex + 1] + 1;
      final replace =
          previous[rightIndex] + (left[leftIndex] == right[rightIndex] ? 0 : 1);
      current.add(insert < delete
          ? (insert < replace ? insert : replace)
          : (delete < replace ? delete : replace));
    }
    previous = current;
  }
  return previous.last;
}
