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

  test('shared cloud examples replace local seed examples for the same sense',
      () async {
    const sense = VocabSense(
      id: 'macaroni-noun',
      word: 'macaroni',
      display: 'macaroni',
      meaning: '通心粉',
      pos: 'noun',
      type: 'word',
    );
    final item = VocabItem(
      id: 'macaroni-item',
      word: 'macaroni',
      senses: [sense],
      createdAt: DateTime(2026, 8, 26),
      updatedAt: DateTime(2026, 8, 26),
    );
    final repository = CloudVocabLookupRepository(
      local: _FakeLocalRepository(),
      cloud: _FakeCloudReader(),
      examplesCloud: _FakeExampleReader(),
    );

    final sections = await repository.loadExamples(item);

    expect(sections.single.examples.single.english,
        'I like to eat macaroni with cheese for lunch.');
    expect(sections.single.examples.single.chinese, '我喜歡午餐吃通心粉配起司。');
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

class _FakeExampleReader implements VocabExampleCloudReader {
  @override
  Future<VocabExampleCloudResult?> lookup(
    String word,
    VocabSense sense,
  ) async {
    return const VocabExampleCloudResult(
      source: 'shared-cache',
      examples: [
        VocabExample(
          english: 'I like to eat macaroni with cheese for lunch.',
          chinese: '我喜歡午餐吃通心粉配起司。',
        ),
      ],
    );
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
    return [
      VocabExampleSection(
        sense: item.senses.first,
        examples: const [
          VocabExample(english: '本機例句。', chinese: '本機意思。'),
        ],
      ),
    ];
  }
}
