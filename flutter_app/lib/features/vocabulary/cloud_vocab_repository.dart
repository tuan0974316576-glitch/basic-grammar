import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';

import 'vocab_models.dart';
import 'vocab_repository.dart';

/// Minimal cloud reader so Firestore stays injectable in widget/unit tests.
abstract interface class TeacherVocabCloudReader {
  Future<List<Map<String, dynamic>>> lookup(String word);
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

    await read(collection.where('word', isEqualTo: normalized));
    try {
      await read(collection.where('aliases', arrayContains: normalized));
    } catch (error) {
      // A missing aliases index or an old document shape must not hide the
      // exact word match or the bundled offline bank.
      debugPrint('Teacher vocab aliases lookup skipped: $error');
    }
    return rows.values.toList(growable: false);
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
  })  : _local = local ?? AssetVocabLookupRepository(),
        _cloud = cloud ?? FirestoreTeacherVocabReader();

  final VocabLookupRepository _local;
  final TeacherVocabCloudReader _cloud;
  final Map<String, Future<List<Map<String, dynamic>>>> _cloudLookups = {};

  @override
  Future<VocabLookupResult> lookup(String query) async {
    final word = normalizeVocabWord(query);
    if (word.isEmpty) return const VocabLookupResult(senses: []);

    // Keep suggestions and one-letter typing local; Battleship only fetches
    // live teacher rows once a meaningful word prefix exists.
    final localFuture = _local.lookup(word);
    final cloudFuture = word.length < 2
        ? Future<List<Map<String, dynamic>>>.value(const [])
        : (_cloudLookups[word] ??= _readCloud(word));
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
    final cloudFuture =
        _cloudLookups[item.normalizedWord] ??= _readCloud(item.normalizedWord);
    final results = await Future.wait([localFuture, cloudFuture]);
    final local = results[0] as List<VocabExampleSection>;
    final cloudRows = results[1] as List<Map<String, dynamic>>;
    final cloud = _cloudExamples(item, cloudRows);
    return cloud.isNotEmpty ? cloud : local;
  }

  Future<List<Map<String, dynamic>>> _readCloud(String word) async {
    try {
      return await _cloud.lookup(word);
    } catch (error) {
      debugPrint('Teacher vocab cloud lookup failed: $error');
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
      if (sense.word == word && sense.meaning.isNotEmpty) {
        byStorageId[sense.storageId] = sense;
      }
    }
    return byStorageId.values.toList(growable: false);
  }

  List<VocabExampleSection> _cloudExamples(
    VocabItem item,
    List<Map<String, dynamic>> rows,
  ) {
    final sections = <VocabExampleSection>[];
    for (final row in rows) {
      if (row['disabled'] == true) continue;
      final sense = VocabSense.fromJson({
        ...row,
        'id': row['id'] ?? '',
        'word': item.normalizedWord,
        'display': row['display'] ?? item.word,
        'type': row['type'] ?? 'word',
      });
      final examples =
          _parseExamples(row['teacherExamples'] ?? row['examples']);
      if (examples.isEmpty) continue;
      final matchingSense = item.senses.firstWhere(
        (candidate) => candidate.storageId == sense.storageId,
        orElse: () => item.senses.first,
      );
      sections.add(VocabExampleSection(
        sense: matchingSense,
        examples: examples.take(3).toList(growable: false),
      ));
    }
    return sections;
  }

  List<VocabExample> _parseExamples(Object? raw) {
    if (raw is! List) return const [];
    return raw
        .map((entry) {
          if (entry is String) {
            return VocabExample(english: entry.trim(), chinese: '');
          }
          if (entry is Map) {
            final map = Map<String, dynamic>.from(entry);
            return VocabExample(
              english:
                  '${map['source'] ?? map['english'] ?? map['sentence'] ?? ''}'
                      .trim(),
              chinese:
                  '${map['target'] ?? map['chinese'] ?? map['meaning'] ?? ''}'
                      .trim(),
            );
          }
          return const VocabExample(english: '', chinese: '');
        })
        .where((example) => example.english.isNotEmpty)
        .toList(growable: false);
  }
}
