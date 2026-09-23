import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/grammar/grammar_progress_controller.dart';
import 'package:dope_english/main.dart';

void main() {
  test('correct answers persist immediately and stay isolated per student',
      () async {
    final store = _MemoryGrammarProgressStore({
      'student:A01': {'lesson-03': 3},
    });
    final progress = GrammarProgressController(
      playerId: 'student:A01',
      store: store,
    );
    await progress.initialize();

    expect(progress.correctForIndex(3), 3);
    await progress.recordCorrect(3);
    await progress.recordCorrect(3);
    expect(progress.correctForIndex(3), 5);
    expect(store.data['student:A01']?['lesson-03'], 5);

    final restored = GrammarProgressController(
      playerId: 'student:A01',
      store: store,
    );
    await restored.initialize();
    expect(restored.correctForIndex(3), 5);

    final otherStudent = GrammarProgressController(
      playerId: 'student:B02',
      store: store,
    );
    await otherStudent.initialize();
    expect(otherStudent.correctForIndex(3), 0);
  });

  test('lesson progress never exceeds the published question total', () async {
    final store = _MemoryGrammarProgressStore({
      'student:A01': {'lesson-04': 7},
    });
    final progress = GrammarProgressController(
      playerId: 'student:A01',
      store: store,
    );
    await progress.initialize();

    await progress.recordCorrect(4);

    expect(progress.correctForIndex(4), 7);
    expect(store.saveCount, 0);
  });

  testWidgets('main menu updates from 3/30 to 5/30 without completing a round',
      (tester) async {
    final store = _MemoryGrammarProgressStore({
      'guest': {'lesson-03': 3},
    });
    final progress = GrammarProgressController(playerId: 'guest', store: store);
    await progress.initialize();

    await tester.pumpWidget(
      DopeEnglishApp(
        grammarProgressController: progress,
        initialEnglishTab: 0,
      ),
    );
    Text lesson03Progress() => tester.widget<Text>(
          find.byKey(
            const Key('grammar-lesson-progress-3'),
            skipOffstage: false,
          ),
        );

    expect(lesson03Progress().data, '3/30');

    await progress.recordCorrect(3);
    await progress.recordCorrect(3);
    await tester.pump();

    expect(lesson03Progress().data, '5/30');
  });
}

class _MemoryGrammarProgressStore implements GrammarProgressStore {
  _MemoryGrammarProgressStore(Map<String, Map<String, int>> initial)
      : data = {
          for (final entry in initial.entries)
            entry.key: Map<String, int>.from(entry.value),
        };

  final Map<String, Map<String, int>> data;
  int saveCount = 0;

  @override
  Future<Map<String, int>> load(String playerId) async {
    return Map<String, int>.from(data[playerId] ?? const {});
  }

  @override
  Future<void> save(String playerId, Map<String, int> progress) async {
    saveCount += 1;
    data[playerId] = Map<String, int>.from(progress);
  }
}
