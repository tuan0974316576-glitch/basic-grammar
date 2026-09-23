import 'package:dope_english/features/streak/streak_controller.dart';
import 'package:dope_english/features/streak/streak_models.dart';
import 'package:dope_english/features/streak/streak_repository.dart';
import 'package:dope_english/features/streak/streak_widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  setUp(() => SharedPreferences.setMockInitialValues({}));

  test('Hong Kong date key changes at UTC 16:00', () {
    expect(hongKongDateKey(DateTime.utc(2026, 9, 18, 15, 59)), '2026-09-18');
    expect(hongKongDateKey(DateTime.utc(2026, 9, 18, 16)), '2026-09-19');
  });

  test('controller exposes server streak update', () async {
    final repository = _FakeStreakRepository();
    final controller = StreakController(repository: repository);
    await controller.initialize();
    await controller.recordActivity(
      kind: 'vocabulary',
      sourceId: 'training',
      answerCount: 10,
    );

    expect(controller.streak.days, 4);
    expect(controller.lastUpdate?.extended, isTrue);
    expect(repository.recordedKind, 'vocabulary');
  });

  test('local streak earns and consumes one freeze', () async {
    final repository = LocalStreakRepository();
    Future<StreakUpdate> record(String id, String date) => repository.record(
          eventId: 'local-event-$id',
          kind: 'grammar',
          sourceId: 'lesson-1',
          answerCount: 5,
          completedAtMs:
              DateTime.parse('${date}T04:00:00Z').millisecondsSinceEpoch,
        );

    await record('one', '2026-09-18');
    await record('two', '2026-09-19');
    final dayThree = await record('three', '2026-09-20');
    expect(dayThree.streak.freezeCount, 1);

    final protected = await record('four', '2026-09-22');
    expect(protected.streak.days, 4);
    expect(protected.streak.freezeCount, 0);
    expect(protected.freezeUsed, isTrue);
    expect(protected.streak.freezeUsedDateKeys, contains('2026-09-21'));
  });

  testWidgets('badge and panel show streak and freeze state', (tester) async {
    const streak = StudyStreak(
      days: 8,
      bestDays: 12,
      freezeCount: 2,
      totalActiveDays: 20,
      activeDateKeys: ['2026-09-18'],
      freezeUsedDateKeys: ['2026-09-17'],
    );
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Column(
            children: [
              StreakBadge(streak: streak, onTap: () {}),
              StreakPanel(streak: streak, onClose: () {}),
            ],
          ),
        ),
      ),
    );
    await tester.pump(const Duration(milliseconds: 100));

    expect(find.byKey(const Key('study-streak-badge')), findsOneWidget);
    expect(find.text('8 日連續學習'), findsOneWidget);
    expect(find.byKey(const Key('streak-freeze-pill')), findsNothing);
    expect(
      tester.getSize(find.byKey(const Key('streak-panel-close'))),
      const Size(50, 50),
    );
    expect(tester.takeException(), isNull);
  });

  testWidgets('milestone celebration adds the happy monster layer',
      (tester) async {
    const update = StreakUpdate(
      streak: StudyStreak(days: 3, bestDays: 3),
      extended: true,
      milestone: true,
    );
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: Stack(
            children: [StreakCelebrationOverlay(update: update)],
          ),
        ),
      ),
    );
    await tester.pump(const Duration(milliseconds: 100));
    expect(find.byKey(const Key('streak-celebration-monster')), findsOneWidget);
    expect(
        find.byKey(const Key('streak-celebration-day-count')), findsOneWidget);
    expect(find.text('日連續學習'), findsOneWidget);
    expect(find.byKey(const Key('streak-celebration-week')), findsOneWidget);
    expect(find.byKey(const Key('streak-celebration-done')), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('later milestone keeps flat-bottom monster at the floor',
      (tester) async {
    const update = StreakUpdate(
      streak: StudyStreak(days: 7, bestDays: 7),
      extended: true,
      milestone: true,
    );
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: Stack(
            children: [StreakCelebrationOverlay(update: update)],
          ),
        ),
      ),
    );
    await tester.pump(const Duration(milliseconds: 100));
    expect(
      streakMonsterAlignmentForDays(7),
      Alignment.bottomCenter,
    );
    expect(
      streakMonsterAlignmentForDays(3),
      const Alignment(0, -0.12),
    );
    expect(tester.takeException(), isNull);
  });
}

class _FakeStreakRepository implements StreakRepository {
  String recordedKind = '';

  @override
  Future<StudyStreak> load() async => const StudyStreak(days: 3);

  @override
  Future<StreakUpdate> record({
    required String eventId,
    required String kind,
    required String sourceId,
    required int answerCount,
    required int completedAtMs,
  }) async {
    recordedKind = kind;
    return const StreakUpdate(
      streak: StudyStreak(days: 4, bestDays: 4),
      extended: true,
    );
  }
}
