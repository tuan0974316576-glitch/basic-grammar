import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/vocabulary/cloud_vocab_repository.dart';
import 'package:dope_english/features/vocabulary/vocab_models.dart';
import 'package:dope_english/features/vocabulary/vocab_repository.dart';

void main() {
  test('cloud lookup expands collapsed from-to patterns', () {
    expect(
      vocabCloudLookupCandidates('differ from to'),
      contains('differ from ... to ...'),
    );
  });

  test('cloud pattern row matches a query typed without ellipses', () async {
    final repository = CloudVocabLookupRepository(
      local: _FakeLocalRepository(),
      cloud: _DifferPatternCloudReader(),
    );

    final result = await repository.lookup('differ from to');

    expect(result.senses.single.word, 'differ from ... to ...');
    expect(result.senses.single.meaning, '因...而異');
  });

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

  test('an empty cloud result expires so a newly added word becomes visible',
      () async {
    var now = DateTime(2026, 9, 19, 12);
    final cloud = _MutableCloudReader();
    final repository = CloudVocabLookupRepository(
      local: _FakeLocalRepository(),
      cloud: cloud,
      now: () => now,
    );

    final before = await repository.lookup('bald');
    expect(before.senses.single.meaning, '本機意思');
    expect(cloud.calls, 1);

    cloud.rows = const [
      {
        'id': 'bald-adjective-cloud',
        'word': 'bald',
        'display': 'bald',
        'meaning': '禿頭',
        'pos': 'adjective',
        'type': 'word',
        'level': 'A2',
        'source': 'teacher-live',
      },
    ];
    final stillCached = await repository.lookup('bald');
    expect(stillCached.senses.single.meaning, '本機意思');
    expect(cloud.calls, 1);

    now = now.add(const Duration(seconds: 4));
    final refreshed = await repository.lookup('bald');
    expect(refreshed.senses.single.meaning, '禿頭');
    expect(refreshed.senses.single.pos, 'adjective');
    expect(cloud.calls, 2);
  });

  test('a failed cloud read is retried immediately instead of being cached',
      () async {
    final cloud = _MutableCloudReader(failuresRemaining: 1)
      ..rows = const [
        {
          'id': 'bald-adjective-cloud',
          'word': 'bald',
          'meaning': '禿頭',
          'pos': 'adjective',
          'type': 'word',
        },
      ];
    final repository = CloudVocabLookupRepository(
      local: _FakeLocalRepository(),
      cloud: cloud,
    );

    expect((await repository.lookup('bald')).senses.single.meaning, '本機意思');
    expect((await repository.lookup('bald')).senses.single.meaning, '禿頭');
    expect(cloud.calls, 2);
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

  test('cloud teacher POS labels stay off the English headword', () async {
    final repository = CloudVocabLookupRepository(
      local: _FakeLocalRepository(),
      cloud: _RatherCloudReader(),
    );

    final result = await repository.lookup('rather');

    expect(result.senses.single.display, 'rather');
    expect(result.senses.single.label, 'adv. 頗 / 相當');
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

class _MutableCloudReader implements TeacherVocabCloudReader {
  _MutableCloudReader({this.failuresRemaining = 0});

  int calls = 0;
  int failuresRemaining;
  List<Map<String, dynamic>> rows = const [];

  @override
  Future<List<Map<String, dynamic>>> lookup(String word) async {
    calls += 1;
    if (failuresRemaining > 0) {
      failuresRemaining -= 1;
      throw StateError('offline');
    }
    return rows;
  }
}

class _RatherCloudReader implements TeacherVocabCloudReader {
  @override
  Future<List<Map<String, dynamic>>> lookup(String word) async {
    return const [
      {
        'id': 'rather-adverb-cloud',
        'word': 'rather',
        'display': 'rather (adv)',
        'meaning': '頗 / 相當',
        'pos': 'adverb',
        'type': 'word',
        'source': 'teacher-live',
      },
    ];
  }
}

class _DifferPatternCloudReader implements TeacherVocabCloudReader {
  @override
  Future<List<Map<String, dynamic>>> lookup(String word) async {
    return const [
      {
        'id': 'differ-from-to-live',
        'word': 'differ from ... to ...',
        'display': 'differ from ... to ...',
        'meaning': '因...而異',
        'pos': 'verb',
        'type': 'pattern',
        'source': 'teacher-live',
      },
    ];
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
