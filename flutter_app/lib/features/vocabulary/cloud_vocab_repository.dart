import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';

import 'vocab_models.dart';
import 'vocab_repository.dart';

@visibleForTesting
List<String> vocabCloudLookupCandidates(String value) {
  final word = normalizeVocabWord(value);
  if (word.isEmpty) return const [];
  final candidates = <String>{word};
  if (!word.contains('...')) {
    candidates.add(word.replaceFirst(
      RegExp(r'\bfrom\s+to\b'),
      'from ... to ...',
    ));
  }
  return candidates.where((entry) => entry.isNotEmpty).toList(growable: false);
}

String _vocabPatternLookupKey(String value) => normalizeVocabWord(value)
    .replaceAll('...', ' ')
    .replaceAll(RegExp(r'\s+'), ' ')
    .trim();

/// Minimal cloud reader so Firestore stays injectable in widget/unit tests.
abstract interface class TeacherVocabCloudReader {
  Future<List<Map<String, dynamic>>> lookup(String word);
}

class VocabExampleCloudResult {
  const VocabExampleCloudResult({
    required this.examples,
    this.status = 'ready',
    this.source = 'shared-cache',
  });

  final List<VocabExample> examples;
  final String status;
  final String source;
}

abstract interface class VocabExampleCloudReader {
  Future<VocabExampleCloudResult?> lookup(String word, VocabSense sense);
}

class FirestoreTeacherVocabReader implements TeacherVocabCloudReader {
  FirestoreTeacherVocabReader({
    FirebaseFirestore? firestore,
    FirebaseAuth? auth,
  })  : _firestore = firestore,
        _auth = auth;

  final FirebaseFirestore? _firestore;
  final FirebaseAuth? _auth;

  @override
  Future<List<Map<String, dynamic>>> lookup(String word) async {
    final auth = _auth ?? FirebaseAuth.instance;
    if (auth.currentUser == null) return const [];

    final firestore = _firestore ?? FirebaseFirestore.instance;
    final collection = firestore.collection('teacherVocabLive');
    final normalized = normalizeVocabWord(word);
    if (normalized.isEmpty) return const [];

    final rows = <String, Map<String, dynamic>>{};
    Future<void> read(Query<Map<String, dynamic>> query) async {
      final snapshot = await query.get().timeout(const Duration(seconds: 3));
      for (final document in snapshot.docs) {
        rows[document.id] = {
          'id': document.id,
          ...document.data(),
        };
      }
    }

    for (final candidate in vocabCloudLookupCandidates(normalized)) {
      await read(collection.where('word', isEqualTo: candidate));
      try {
        await read(collection.where('aliases', arrayContains: candidate));
      } catch (error) {
        // A missing aliases index or an old document shape must not hide the
        // exact word match or the bundled offline bank.
        debugPrint('Teacher vocab aliases lookup skipped: $error');
      }
    }
    return rows.values.toList(growable: false);
  }
}

/// Calls the same `lookupVocabExamples` function used by Battleship.
class FirebaseVocabExampleReader implements VocabExampleCloudReader {
  FirebaseVocabExampleReader({
    FirebaseFunctions? functions,
    FirebaseAuth? auth,
  })  : _functions = functions,
        _auth = auth;

  final FirebaseFunctions? _functions;
  final FirebaseAuth? _auth;

  @override
  Future<VocabExampleCloudResult?> lookup(
    String word,
    VocabSense sense,
  ) async {
    final auth = _auth ?? FirebaseAuth.instance;
    if (auth.currentUser == null) return null;
    try {
      final functions =
          _functions ?? FirebaseFunctions.instanceFor(region: 'asia-east2');
      final callable = functions.httpsCallable(
        'lookupVocabExamples',
        options: HttpsCallableOptions(timeout: const Duration(seconds: 12)),
      );
      final response = await callable.call<Object?>({
        'word': normalizeVocabWord(word),
        'meanings': [
          {
            'meaning': sense.meaning,
            'pos': sense.pos,
            'type': sense.type,
            'level': sense.level,
          },
        ],
      });
      final raw = response.data;
      if (raw is! Map) return null;
      final data = Map<String, dynamic>.from(raw);
      final examples = data['examples'] is List
          ? (data['examples'] as List)
              .whereType<Map>()
              .map((entry) {
                final map = Map<String, dynamic>.from(entry);
                return VocabExample(
                  english: '${map['source'] ?? map['english'] ?? ''}'.trim(),
                  chinese: '${map['target'] ?? map['chinese'] ?? ''}'.trim(),
                );
              })
              .where((example) =>
                  example.english.isNotEmpty && example.chinese.isNotEmpty)
              .take(3)
              .toList(growable: false)
          : <VocabExample>[];
      return VocabExampleCloudResult(
        examples: examples,
        status: '${data['status'] ?? 'ready'}',
        source: '${data['source'] ?? 'shared-cache'}',
      );
    } on FirebaseFunctionsException catch (error) {
      debugPrint('Shared vocab examples failed: ${error.code}');
      return null;
    } catch (error) {
      debugPrint('Shared vocab examples failed: $error');
      return null;
    }
  }
}

/// Battleship-compatible cloud-first vocabulary lookup.
///
/// Teacher-approved live entries win over the bundled bank. Offline,
/// unauthenticated, malformed, or timed-out cloud reads fall back locally.
class CloudVocabLookupRepository implements VocabLookupRepository {
  CloudVocabLookupRepository({
    VocabLookupRepository? local,
    TeacherVocabCloudReader? cloud,
    VocabExampleCloudReader? examplesCloud,
    Duration cloudResultTtl = const Duration(minutes: 1),
    Duration cloudEmptyTtl = const Duration(seconds: 3),
    DateTime Function()? now,
  })  : _local = local ?? AssetVocabLookupRepository(),
        _cloud = cloud ?? FirestoreTeacherVocabReader(),
        _examplesCloud = examplesCloud ?? FirebaseVocabExampleReader(),
        _cloudResultTtl = cloudResultTtl,
        _cloudEmptyTtl = cloudEmptyTtl,
        _now = now ?? DateTime.now;

  final VocabLookupRepository _local;
  final TeacherVocabCloudReader _cloud;
  final VocabExampleCloudReader _examplesCloud;
  final Duration _cloudResultTtl;
  final Duration _cloudEmptyTtl;
  final DateTime Function() _now;
  final Map<String, _TeacherVocabCacheEntry> _cloudCache = {};
  // Only coalesce reads that are currently in flight. Completed Futures must
  // not live forever because teachers can add or edit a word during class.
  final Map<String, Future<List<Map<String, dynamic>>>> _cloudLookups = {};
  final Map<String, Future<VocabExampleCloudResult?>> _exampleLookups = {};

  @override
  Future<VocabLookupResult> lookup(String query) async {
    final word = normalizeVocabWord(query);
    if (word.isEmpty) return const VocabLookupResult(senses: []);

    // Keep suggestions and one-letter typing local; Battleship only fetches
    // live teacher rows once a meaningful word prefix exists.
    final localFuture = _local.lookup(word);
    final cloudFuture = word.length < 2
        ? Future<List<Map<String, dynamic>>>.value(const [])
        : _readCloudCached(word);
    final results = await Future.wait([localFuture, cloudFuture]);
    final local = results[0] as VocabLookupResult;
    final cloudRows = results[1] as List<Map<String, dynamic>>;
    final cloudSenses = _cloudSenses(word, cloudRows);
    if (cloudSenses.isNotEmpty) {
      return VocabLookupResult(senses: cloudSenses);
    }
    return local;
  }

  @override
  Future<List<VocabExampleSection>> loadExamples(VocabItem item) async {
    final localFuture = _local.loadExamples(item);
    final cloudFuture = Future.wait(
      item.senses.map((sense) => _readCloudExamples(item, sense)),
    );
    final results = await Future.wait([localFuture, cloudFuture]);
    final local = results[0] as List<VocabExampleSection>;
    final cloud = results[1] as List<VocabExampleCloudResult?>;
    final localBySense = {
      for (final section in local) section.sense.storageId: section,
    };
    final sections = <VocabExampleSection>[];
    for (var index = 0; index < item.senses.length; index++) {
      final sense = item.senses[index];
      final cloudResult = cloud[index];
      if (cloudResult != null && cloudResult.examples.isNotEmpty) {
        sections.add(VocabExampleSection(
          sense: sense,
          examples: cloudResult.examples,
        ));
      } else if (localBySense[sense.storageId] case final fallback?) {
        sections.add(fallback);
      }
    }
    return sections;
  }

  Future<VocabExampleCloudResult?> _readCloudExamples(
    VocabItem item,
    VocabSense sense,
  ) async {
    final key = '${item.normalizedWord}|${sense.storageId}';
    return _exampleLookups[key] ??= _examplesCloud
        .lookup(item.normalizedWord, sense)
        .timeout(const Duration(seconds: 13), onTimeout: () => null)
        .catchError((_) => null);
  }

  Future<List<Map<String, dynamic>>> _readCloudCached(String word) {
    final cached = _cloudCache[word];
    if (cached != null && _now().isBefore(cached.expiresAt)) {
      return Future.value(cached.rows);
    }
    _cloudCache.remove(word);
    final inFlight = _cloudLookups[word];
    if (inFlight != null) return inFlight;

    late final Future<List<Map<String, dynamic>>> request;
    request = _readCloud(word).whenComplete(() {
      if (identical(_cloudLookups[word], request)) {
        _cloudLookups.remove(word);
      }
    });
    _cloudLookups[word] = request;
    return request;
  }

  Future<List<Map<String, dynamic>>> _readCloud(String word) async {
    try {
      final rows = await _cloud.lookup(word);
      final immutableRows = rows
          .map((row) => Map<String, dynamic>.unmodifiable(row))
          .toList(growable: false);
      _cloudCache[word] = _TeacherVocabCacheEntry(
        rows: immutableRows,
        expiresAt: _now().add(
          immutableRows.isEmpty ? _cloudEmptyTtl : _cloudResultTtl,
        ),
      );
      return immutableRows;
    } catch (error) {
      debugPrint('Teacher vocab cloud lookup failed: $error');
      // A timeout or offline read is not a real "word not found" result.
      // Leave it uncached so the next lookup can retry immediately.
      return const [];
    }
  }

  List<VocabSense> _cloudSenses(
    String word,
    List<Map<String, dynamic>> rows,
  ) {
    final byStorageId = <String, VocabSense>{};
    for (final row in rows) {
      if (row['disabled'] == true) continue;
      final rawWord = normalizeVocabWord('${row['word'] ?? word}');
      final sense = VocabSense.fromJson({
        ...row,
        'id': row['id'] ?? '$rawWord-${row['meaning'] ?? ''}',
        'word': rawWord,
        'display': row['display'] ?? rawWord,
        'source': row['source'] ?? 'teacher-live',
        'sourceEntryId': row['sourceEntryId'] ?? row['id'] ?? '',
        'type': row['type'] ?? 'word',
      });
      if (_vocabPatternLookupKey(sense.word) == _vocabPatternLookupKey(word) &&
          sense.meaning.isNotEmpty) {
        byStorageId[sense.storageId] = sense;
      }
    }
    return dedupeVocabSenses(byStorageId.values);
  }
}

class _TeacherVocabCacheEntry {
  const _TeacherVocabCacheEntry({
    required this.rows,
    required this.expiresAt,
  });

  final List<Map<String, dynamic>> rows;
  final DateTime expiresAt;
}
