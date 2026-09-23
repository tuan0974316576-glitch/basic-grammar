import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/vocabulary/vocab_audio_reconciler.dart';
import 'package:dope_english/features/vocabulary/vocab_audio_repository.dart';
import 'package:dope_english/features/vocabulary/vocab_models.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  test('warms every word before any example and skips existing audio',
      () async {
    final calls = <String>[];
    final audio = _FakeAudioRepository(
      calls: calls,
      existingWords: {'ready'},
    );
    const readySense = VocabSense(
      id: 'ready-sense',
      word: 'ready',
      display: 'ready',
      meaning: '準備好',
      pos: 'adjective',
      type: 'word',
    );
    const missingSense = VocabSense(
      id: 'missing-sense',
      word: 'missing',
      display: 'missing',
      meaning: '缺少',
      pos: 'adjective',
      type: 'word',
    );
    final items = [
      VocabItem(
        id: 'ready',
        word: 'ready',
        senses: const [readySense],
        createdAt: DateTime(2026, 8, 26),
        updatedAt: DateTime(2026, 8, 26),
      ),
      VocabItem(
        id: 'missing',
        word: 'missing',
        senses: const [missingSense],
        createdAt: DateTime(2026, 8, 26),
        updatedAt: DateTime(2026, 8, 26),
      ),
    ];
    final reconciler = VocabAudioReconciler(
      audio: audio,
      items: () => items,
      examples: (item) async => [
        VocabExampleSection(
          sense: item.senses.single,
          examples: [
            VocabExample(
              english: 'This is a ${item.word} example.',
              chinese: '例句。',
            ),
          ],
        ),
      ],
      initialDelay: Duration.zero,
      resumeDelay: Duration.zero,
      retryDelay: const Duration(days: 1),
    );
    reconciler.start();

    final result = await reconciler.reconcileNow();

    expect(result.complete, isTrue);
    expect(calls, [
      'refresh:ready',
      'word:missing',
      'example:This is a ready example.',
      'example:This is a missing example.',
    ]);
    await reconciler.dispose();
  });

  test('does not run while the app is backgrounded', () async {
    final audio = _FakeAudioRepository(calls: []);
    final reconciler = VocabAudioReconciler(
      audio: audio,
      items: () => const [],
      examples: (_) async => const [],
      authenticated: () => false,
    );
    reconciler.start();
    expect(reconciler.isActive, isTrue);
    await reconciler.dispose();
    expect(reconciler.isRunning, isFalse);
  });

  test('pauses in background and resumes when the app returns', () async {
    final calls = <String>[];
    final audio = _FakeAudioRepository(calls: calls);
    const sense = VocabSense(
      id: 'resume-sense',
      word: 'resume',
      display: 'resume',
      meaning: '繼續',
      pos: 'verb',
      type: 'word',
    );
    final item = VocabItem(
      id: 'resume',
      word: 'resume',
      senses: const [sense],
      createdAt: DateTime(2026, 8, 26),
      updatedAt: DateTime(2026, 8, 26),
    );
    final reconciler = VocabAudioReconciler(
      audio: audio,
      items: () => [item],
      examples: (_) async => const [],
      authenticated: () => true,
    );
    reconciler.start();
    reconciler.didChangeAppLifecycleState(AppLifecycleState.paused);
    final paused = await reconciler.reconcileNow();
    expect(paused.complete, isFalse);
    expect(paused.reason, 'runtime-paused');
    expect(calls, isEmpty);

    reconciler.didChangeAppLifecycleState(AppLifecycleState.resumed);
    final resumed = await reconciler.reconcileNow(force: true);
    expect(resumed.complete, isTrue);
    expect(calls, ['word:resume']);
    await reconciler.dispose();
  });
}

class _FakeAudioRepository
    implements VocabAudioRepository, VocabAudioRevisionRefresher {
  _FakeAudioRepository({
    required this.calls,
    this.existingWords = const {},
  });

  final List<String> calls;
  final Set<String> existingWords;

  @override
  Future<bool> speakWord(String word) async => true;

  @override
  Future<bool> speakExample(String sentence) async => true;

  @override
  Future<bool> hasAudio(
    String text, {
    VocabAudioKind kind = VocabAudioKind.word,
  }) async {
    return kind == VocabAudioKind.word && existingWords.contains(text);
  }

  @override
  Future<VocabAudioEnsureResult> ensureAudio(
    String text, {
    VocabAudioKind kind = VocabAudioKind.word,
  }) async {
    calls.add('${kind == VocabAudioKind.example ? 'example' : 'word'}:$text');
    return const VocabAudioEnsureResult(status: 'ready');
  }

  @override
  Future<VocabAudioEnsureResult> refreshWordAudio(String word) async {
    calls.add('refresh:$word');
    return const VocabAudioEnsureResult(status: 'ready');
  }

  @override
  Future<void> dispose() async {}
}
