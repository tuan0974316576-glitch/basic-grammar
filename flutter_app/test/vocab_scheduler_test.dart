import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/vocabulary/vocab_models.dart';
import 'package:dope_english/features/vocabulary/vocab_scheduler.dart';

void main() {
  final anchor = DateTime(2026, 9, 25, 12);

  test('recall probability decays with the stored half-life', () {
    final item = _item(
      totalSeen: 4,
      totalCorrect: 4,
      reviewMastered: true,
      lastSeenAt: anchor,
      nextDueAt: anchor.add(const Duration(days: 1)),
      halfLifeDays: 2,
    );

    expect(vocabRecallProbability(item, now: anchor), closeTo(1, 0.001));
    expect(
      vocabRecallProbability(item, now: anchor.add(const Duration(days: 2))),
      closeTo(0.5, 0.001),
    );
  });

  test('correct answers extend the interval while wrong answers reset it', () {
    final fresh = _item();
    final correct = applyVocabReviewAnswer(fresh, true, now: anchor);
    final wrong = applyVocabReviewAnswer(fresh, false, now: anchor);

    expect(correct.nextDueAt, anchor.add(const Duration(hours: 6)));
    expect(correct.streakCorrect, 1);
    expect(correct.mastery, closeTo(0.11, 0.001));
    expect(
        wrong.nextDueAt, anchor.add(const Duration(minutes: 57, seconds: 36)));
    expect(wrong.totalIncorrect, 1);
    expect(wrong.streakCorrect, 0);
    expect(wrong.reviewMastered, isFalse);
  });

  test('due state uses next due time and recall threshold', () {
    final scheduled = _item(
      totalSeen: 3,
      totalCorrect: 3,
      reviewMastered: true,
      lastSeenAt: anchor,
      nextDueAt: anchor.add(const Duration(days: 3)),
      halfLifeDays: 10,
    );

    expect(isVocabItemDue(scheduled, now: anchor.add(const Duration(days: 1))),
        isFalse);
    expect(isVocabItemDue(scheduled, now: anchor.add(const Duration(days: 3))),
        isTrue);
  });

  test('legacy mastered records without scheduler dates stay out of due queue',
      () {
    final legacy = _item(
      totalSeen: 4,
      totalCorrect: 4,
      reviewMastered: true,
    );

    expect(isVocabItemDue(legacy, now: anchor), isFalse);
  });
}

VocabItem _item({
  int totalSeen = 0,
  int totalCorrect = 0,
  bool reviewMastered = false,
  DateTime? lastSeenAt,
  DateTime? nextDueAt,
  double halfLifeDays = 0.5,
}) {
  return VocabItem(
    id: 'scheduler-word',
    word: 'scheduler',
    senses: const [
      VocabSense(
        id: 'scheduler-sense',
        word: 'scheduler',
        display: 'scheduler',
        meaning: '排程器',
        pos: 'noun',
        type: 'word',
      ),
    ],
    createdAt: DateTime(2026, 9, 25),
    updatedAt: DateTime(2026, 9, 25),
    totalSeen: totalSeen,
    totalCorrect: totalCorrect,
    reviewMastered: reviewMastered,
    lastSeenAt: lastSeenAt,
    nextDueAt: nextDueAt,
    halfLifeDays: halfLifeDays,
  );
}
