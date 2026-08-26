import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/vocabulary/cloud_vocab_repository.dart';
import 'package:dope_english/features/vocabulary/vocab_models.dart';
import 'package:dope_english/features/vocabulary/vocab_repository.dart';

void main() {
  test('cloud teacher meaning wins over the bundled fallback', () async {
    final repository = CloudVocabLookupRepository(
      local: _FakeLocalRepository(),
      cloud: _FakeCloudReader(),
    );

    final result = await repository.lookup('macaroni');

    expect(result.senses, hasLength(1));
    expect(result.senses.single.meaning, '通心粉');
    expect(result.senses.single.source, 'teacher-live');
  });

  test('cloud failure falls back to local lookup', () async {
    final repository = CloudVocabLookupRepository(
      local: _FakeLocalRepository(),
      cloud: _FailingCloudReader(),
    );

    final result = await repository.lookup('fallback');

    expect(result.senses.single.meaning, '本機意思');
  });
}

class _FakeCloudReader implements TeacherVocabCloudReader {
  @override
  Future<List<Map<String, dynamic>>> lookup(String word) async {
    if (word != 'macaroni') return const [];
    return const [
      {
        'id': 'macaroni-noun-cloud',
        'word': 'macaroni',
        'display': 'macaroni',
        'meaning': '通心粉',
        'pos': 'noun',
        'type': 'word',
        'source': 'teacher-live',
      },
    ];
  }
}

class _FailingCloudReader implements TeacherVocabCloudReader {
  @override
  Future<List<Map<String, dynamic>>> lookup(String word) async {
    throw StateError('offline');
  }
}

class _FakeLocalRepository implements VocabLookupRepository {
  @override
  Future<VocabLookupResult> lookup(String query) async {
    return const VocabLookupResult(
      senses: [
        VocabSense(
          id: 'fallback',
          word: 'fallback',
          display: 'fallback',
          meaning: '本機意思',
          pos: 'noun',
          type: 'word',
        ),
      ],
    );
  }

  @override
  Future<List<VocabExampleSection>> loadExamples(VocabItem item) async {
    return const [];
  }
}
