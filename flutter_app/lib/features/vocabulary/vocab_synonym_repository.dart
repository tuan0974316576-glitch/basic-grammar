import 'dart:convert';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';

import 'vocab_models.dart';
import 'vocab_repository.dart';

class VocabSynonymWord {
  const VocabSynonymWord({
    required this.text,
    required this.lookup,
    required this.meaning,
  });

  factory VocabSynonymWord.fromJson(Map<String, dynamic> json) {
    final text = displayVocabWord(
      '${json['text'] ?? json['lookup'] ?? ''}',
    );
    final lookup = normalizeVocabWord('${json['lookup'] ?? text}');
    return VocabSynonymWord(
      text: text.isEmpty ? lookup : text,
      lookup: lookup,
      meaning: normalizeVocabMeaning('${json['meaning'] ?? ''}'),
    );
  }

  final String text;
  final String lookup;
  final String meaning;
}

class VocabSynonymSourceGroup {
  const VocabSynonymSourceGroup({
    required this.id,
    required this.meaning,
    required this.words,
  });

  factory VocabSynonymSourceGroup.fromJson(Map<String, dynamic> json) {
    final words = json['words'] is List
        ? (json['words'] as List)
            .whereType<Map>()
            .map((word) =>
                VocabSynonymWord.fromJson(Map<String, dynamic>.from(word)))
            .where((word) => word.lookup.isNotEmpty && word.meaning.isNotEmpty)
            .toList(growable: false)
        : const <VocabSynonymWord>[];
    return VocabSynonymSourceGroup(
      id: '${json['id'] ?? ''}'.trim(),
      meaning: normalizeVocabMeaning('${json['meaning'] ?? ''}'),
      words: words,
    );
  }

  final String id;
  final String meaning;
  final List<VocabSynonymWord> words;
}

class VocabSynonymCandidate {
  const VocabSynonymCandidate({
    required this.id,
    required this.word,
    required this.display,
    required this.sense,
    this.saved = false,
  });

  final String id;
  final String word;
  final String display;
  final VocabSense sense;
  final bool saved;

  String get meaningLine => sense.label;

  VocabSynonymCandidate copyWith({VocabSense? sense, bool? saved}) {
    return VocabSynonymCandidate(
      id: id,
      word: word,
      display: display,
      sense: sense ?? this.sense,
      saved: saved ?? this.saved,
    );
  }
}

class VocabSynonymGroup {
  const VocabSynonymGroup({
    required this.id,
    required this.meaning,
    required this.candidates,
  });

  final String id;
  final String meaning;
  final List<VocabSynonymCandidate> candidates;

  VocabSynonymGroup copyWith({List<VocabSynonymCandidate>? candidates}) {
    return VocabSynonymGroup(
      id: id,
      meaning: meaning,
      candidates: candidates ?? this.candidates,
    );
  }
}

abstract interface class VocabSynonymRepository {
  Future<List<VocabSynonymGroup>> lookup(String word);
}

/// Offline copy of Battleship's reviewed DSE synonym groups.
///
/// The source file is exported by `flutter:export-synonyms`; the app only
/// needs the compact group/word data to offer linked words after a save.
class AssetVocabSynonymRepository implements VocabSynonymRepository {
  AssetVocabSynonymRepository({
    AssetBundle? bundle,
    VocabLookupRepository? lookupRepository,
  })  : _bundle = bundle ?? rootBundle,
        _lookupRepository = lookupRepository ?? AssetVocabLookupRepository();

  static const assetPath = 'assets/data/vocab/synonym_groups.json';

  final AssetBundle _bundle;
  final VocabLookupRepository _lookupRepository;
  Future<List<VocabSynonymSourceGroup>>? _groupsFuture;

  @override
  Future<List<VocabSynonymGroup>> lookup(String word) async {
    final sourceWord = normalizeVocabWord(word);
    if (sourceWord.isEmpty) return const [];
    final sourceGroups = await _loadGroups();
    final matches = sourceGroups.where((group) =>
        group.words.any((candidate) => candidate.lookup == sourceWord));
    final resolved = await Future.wait(
      matches.map((group) => _resolveGroup(group, sourceWord)),
    );
    return resolved.whereType<VocabSynonymGroup>().toList(growable: false);
  }

  Future<List<VocabSynonymSourceGroup>> _loadGroups() {
    return _groupsFuture ??= _readGroups();
  }

  Future<List<VocabSynonymSourceGroup>> _readGroups() async {
    try {
      final source = await _bundle.loadString(assetPath);
      final decoded = await compute(_decodeJson, source);
      final rawGroups = decoded['groups'];
      if (rawGroups is! List) return const [];
      return rawGroups
          .whereType<Map>()
          .map((group) => VocabSynonymSourceGroup.fromJson(
                Map<String, dynamic>.from(group),
              ))
          .where((group) =>
              group.id.isNotEmpty &&
              group.meaning.isNotEmpty &&
              group.words.length >= 2)
          .toList(growable: false);
    } catch (_) {
      return const [];
    }
  }

  Future<VocabSynonymGroup?> _resolveGroup(
    VocabSynonymSourceGroup group,
    String sourceWord,
  ) async {
    final seen = <String>{};
    final candidates = <VocabSynonymCandidate>[];
    for (final word in group.words) {
      if (word.lookup == sourceWord || !seen.add(word.lookup)) continue;
      final sense = await _resolveSense(word, group);
      if (sense == null) continue;
      candidates.add(VocabSynonymCandidate(
        id: '${group.id}::${word.lookup}',
        word: word.lookup,
        display: word.text,
        sense: sense,
      ));
    }
    if (candidates.isEmpty) return null;
    return VocabSynonymGroup(
      id: group.id,
      meaning: group.meaning,
      candidates: candidates,
    );
  }

  Future<VocabSense?> _resolveSense(
    VocabSynonymWord word,
    VocabSynonymSourceGroup group,
  ) async {
    try {
      final result = await _lookupRepository.lookup(word.lookup);
      if (result.senses.isNotEmpty) {
        final selected = _bestSynonymSense(
          result.senses,
          [word.meaning, group.meaning],
        );
        return VocabSense(
          id: selected.id,
          word: word.lookup,
          display: word.text,
          meaning: selected.meaning,
          pos: selected.pos,
          type: selected.type,
          level: selected.level,
          source: selected.source,
          sourceEntryId: selected.sourceEntryId,
        );
      }
    } catch (_) {
      // The DSE fallback keeps the linked word available offline.
    }
    final type = word.lookup.contains(' ') ? 'phrase' : 'word';
    final meaning = word.meaning.isNotEmpty ? word.meaning : group.meaning;
    if (meaning.isEmpty) return null;
    return VocabSense(
      id: 'dse-synonym:${group.id}:${word.lookup}',
      word: word.lookup,
      display: word.text,
      meaning: meaning,
      pos: _inferFallbackPos(word.lookup, type),
      type: type,
      source: 'dse-synonym',
      sourceEntryId: 'dse-synonym:${group.id}:${word.lookup}',
    );
  }

  String _inferFallbackPos(String word, String type) {
    if (type == 'phrase') return 'phrase';
    if (RegExp(r'ly$').hasMatch(word)) return 'adverb';
    if (RegExp(r'(ous|ful|less|ive|al|ic|able|ible|ish|y)$').hasMatch(word)) {
      return 'adjective';
    }
    if (RegExp(r'(ate|en|ify|ise|ize)$').hasMatch(word)) return 'verb';
    return 'noun';
  }
}

/// Public-release sync for the synonym groups maintained in Battleship's
/// Grammar platform. The bundled synonym asset remains the first-install and
/// offline fallback; a newer published release wins silently at next lookup.
class CloudSyncedVocabSynonymRepository implements VocabSynonymRepository {
  CloudSyncedVocabSynonymRepository({
    http.Client? client,
    Future<File> Function()? cacheFile,
    VocabLookupRepository? lookupRepository,
  })  : _client = client ?? http.Client(),
        _cacheFile = cacheFile ?? _defaultCacheFile,
        _lookupRepository = lookupRepository ?? AssetVocabLookupRepository();

  static final _manifestUri = Uri.parse(
    'https://battleship-game-c0909-default-rtdb.asia-southeast1.firebasedatabase.app/'
    'grammarBank/public/manifest.json',
  );
  static final _topicsUri = Uri.parse(
    'https://battleship-game-c0909-default-rtdb.asia-southeast1.firebasedatabase.app/'
    'grammarBank/public/topics.json',
  );

  final http.Client _client;
  final Future<File> Function() _cacheFile;
  final VocabLookupRepository _lookupRepository;
  Future<List<VocabSynonymGroup>>? _groupsFuture;

  @override
  Future<List<VocabSynonymGroup>> lookup(String word) async {
    final sourceWord = normalizeVocabWord(word);
    if (sourceWord.isEmpty) return const [];
    final groups = await _loadGroups();
    final matching = groups
        .where((group) => group.candidates.any(
              (candidate) => candidate.word == sourceWord,
            ))
        .map((group) => group.copyWith(
              candidates: group.candidates
                  .where((candidate) => candidate.word != sourceWord)
                  .toList(growable: false),
            ))
        .where((group) => group.candidates.isNotEmpty)
        .toList(growable: false);
    return Future.wait(matching.map(_resolvePublishedGroup));
  }

  Future<VocabSynonymGroup> _resolvePublishedGroup(
    VocabSynonymGroup group,
  ) async {
    final candidates =
        await Future.wait(group.candidates.map((candidate) async {
      try {
        final lookup = await _lookupRepository.lookup(candidate.word);
        if (lookup.senses.isNotEmpty) {
          final selected = _bestSynonymSense(
            lookup.senses,
            [candidate.sense.meaning, group.meaning],
          );
          return candidate.copyWith(
            sense: VocabSense(
              id: selected.id,
              word: candidate.word,
              display: candidate.display,
              meaning: selected.meaning,
              pos: selected.pos,
              type: selected.type,
              level: selected.level,
              source: selected.source,
              sourceEntryId: selected.sourceEntryId,
            ),
          );
        }
      } catch (_) {
        // Keep the published meaning and conservative POS fallback offline.
      }
      return candidate;
    }));
    return group.copyWith(candidates: candidates);
  }

  Future<List<VocabSynonymGroup>> _loadGroups() {
    return _groupsFuture ??= _syncAndLoad();
  }

  Future<List<VocabSynonymGroup>> _syncAndLoad() async {
    final fallback = await _localGroups();
    try {
      final cached = await _readCachedGroups();
      final remote = await _readRemoteGroups();
      if (remote.groups.isNotEmpty) {
        await _writeCachedGroups(remote.package);
        return remote.groups;
      }
      if (cached.isNotEmpty) return cached;
    } catch (error) {
      debugPrint('Battleship synonym sync skipped: $error');
      try {
        final cached = await _readCachedGroups();
        if (cached.isNotEmpty) return cached;
      } catch (_) {
        // Bundled data remains the final fallback.
      }
    }
    return fallback;
  }

  Future<List<VocabSynonymGroup>> _localGroups() async {
    // Read the complete bundled asset directly so every group remains
    // available as an offline fallback, regardless of the first lookup word.
    try {
      final source =
          await rootBundle.loadString(AssetVocabSynonymRepository.assetPath);
      final decoded = await compute(_decodeJson, source);
      return _groupsFromTopic(decoded['groups']);
    } catch (_) {
      return const [];
    }
  }

  Future<({List<VocabSynonymGroup> groups, Map<String, dynamic> package})>
      _readRemoteGroups() async {
    final manifestResponse =
        await _client.get(_manifestUri).timeout(const Duration(seconds: 8));
    if (manifestResponse.statusCode != 200) {
      throw HttpException(
          'Synonym manifest returned ${manifestResponse.statusCode}.');
    }
    final manifest = _decodeJson(manifestResponse.body);
    final topicManifest = manifest['topics'] is Map
        ? Map<String, dynamic>.from(manifest['topics'] as Map)
        : const <String, dynamic>{};
    if (!topicManifest.containsKey('DSE_SYNONYM')) {
      return (
        groups: const <VocabSynonymGroup>[],
        package: <String, dynamic>{}
      );
    }
    final topicsResponse =
        await _client.get(_topicsUri).timeout(const Duration(seconds: 30));
    if (topicsResponse.statusCode != 200) {
      throw HttpException(
          'Synonym topics returned ${topicsResponse.statusCode}.');
    }
    final topics = _decodeJson(topicsResponse.body);
    final rawTopic = topics['DSE_SYNONYM'];
    final rawGroups = rawTopic is Map ? rawTopic['questions'] : rawTopic;
    final groups = _groupsFromTopic(rawGroups);
    if (groups.isEmpty) {
      throw const FormatException('Published DSE synonym topic is empty.');
    }
    final package = <String, dynamic>{
      'schemaVersion': 1,
      'manifest': manifest,
      'topic': rawTopic,
    };
    return (groups: groups, package: package);
  }

  Future<List<VocabSynonymGroup>> _readCachedGroups() async {
    final file = await _cacheFile();
    if (!await file.exists()) return const [];
    final decoded = _decodeJson(await file.readAsString());
    final topic = decoded['topic'];
    final rawGroups = topic is Map ? topic['questions'] : topic;
    return _groupsFromTopic(rawGroups);
  }

  Future<void> _writeCachedGroups(Map<String, dynamic> package) async {
    if (package.isEmpty) return;
    final file = await _cacheFile();
    await file.parent.create(recursive: true);
    await file.writeAsString(jsonEncode(package), flush: true);
  }

  static Future<File> _defaultCacheFile() async {
    final directory = await getApplicationSupportDirectory();
    return File('${directory.path}/vocab/synonym_release_v1.json');
  }
}

List<VocabSynonymGroup> _groupsFromTopic(Object? rawGroups) {
  final values = rawGroups is List
      ? rawGroups.whereType<Map>()
      : rawGroups is Map
          ? rawGroups.values.whereType<Map>()
          : const <Map>[];
  return values
      .map((group) => VocabSynonymSourceGroup.fromJson(
            Map<String, dynamic>.from(group),
          ))
      .where((group) =>
          group.id.isNotEmpty &&
          group.meaning.isNotEmpty &&
          group.words.length >= 2)
      .map(_makeUnresolvedSynonymGroup)
      .toList(growable: false);
}

VocabSynonymGroup _makeUnresolvedSynonymGroup(
  VocabSynonymSourceGroup group,
) {
  final candidates = <VocabSynonymCandidate>[];
  for (final word in group.words) {
    final type = word.lookup.contains(' ') ? 'phrase' : 'word';
    final pos = type == 'phrase' ? 'phrase' : _inferSynonymPos(word.lookup);
    final sense = VocabSense(
      id: 'dse-synonym:${group.id}:${word.lookup}',
      word: word.lookup,
      display: word.text,
      meaning: word.meaning.isEmpty ? group.meaning : word.meaning,
      pos: pos,
      type: type,
      source: 'dse-synonym',
      sourceEntryId: 'dse-synonym:${group.id}:${word.lookup}',
    );
    candidates.add(VocabSynonymCandidate(
      id: '${group.id}::${word.lookup}',
      word: word.lookup,
      display: word.text,
      sense: sense,
    ));
  }
  return VocabSynonymGroup(
    id: group.id,
    meaning: group.meaning,
    candidates: candidates,
  );
}

String _inferSynonymPos(String word) {
  if (const {
    'rather',
    'instead',
    'thus',
    'hence',
    'therefore',
    'furthermore',
    'moreover',
    'besides',
  }.contains(word)) {
    return 'adverb';
  }
  if (RegExp(r'ly$').hasMatch(word)) return 'adverb';
  if (RegExp(r'(ous|ful|less|ive|al|ic|able|ible|ish|y)$').hasMatch(word)) {
    return 'adjective';
  }
  if (RegExp(r'(ate|en|ify|ise|ize)$').hasMatch(word)) return 'verb';
  return 'noun';
}

VocabSense _bestSynonymSense(
  List<VocabSense> senses,
  List<String> targetMeanings,
) {
  var best = senses.first;
  var bestScore = _synonymMeaningScore(best.meaning, targetMeanings);
  for (final sense in senses.skip(1)) {
    final score = _synonymMeaningScore(sense.meaning, targetMeanings);
    if (score > bestScore) {
      best = sense;
      bestScore = score;
    }
  }
  return best;
}

int _synonymMeaningScore(String meaning, List<String> targets) {
  final parts = _splitSynonymMeaning(meaning);
  var best = 0;
  for (final target in targets) {
    for (final left in parts) {
      for (final right in _splitSynonymMeaning(target)) {
        if (left == right) {
          best = best < 100 ? 100 : best;
        } else if (left.contains(right) || right.contains(left)) {
          final coverage = left.length < right.length
              ? left.length / right.length
              : right.length / left.length;
          final score = 70 + (coverage * 20).round();
          if (score > best) best = score;
        }
      }
    }
  }
  return best;
}

List<String> _splitSynonymMeaning(String value) {
  return normalizeVocabMeaning(value)
      .replaceAll(RegExp(r'\([^)]*\)'), '')
      .split(RegExp(r'\s*(?:[/／;；、，,]|\bor\b)\s*', caseSensitive: false))
      .map(normalizeMeaningKey)
      .where((part) => part.isNotEmpty)
      .toList(growable: false);
}

Map<String, dynamic> _decodeJson(String source) {
  final decoded = jsonDecode(source);
  return decoded is Map
      ? Map<String, dynamic>.from(decoded)
      : <String, dynamic>{};
}
