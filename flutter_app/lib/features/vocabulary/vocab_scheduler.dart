import 'dart:math' as math;

import 'vocab_models.dart';

const vocabSchedulerDayMs = 24 * 60 * 60 * 1000;
const vocabSchedulerTargetRecall = 0.6;
const vocabSchedulerMinHalfLifeDays = 0.08;
const vocabSchedulerMaxHalfLifeDays = 180.0;
const vocabSchedulerDefaultHalfLifeDays = 0.5;

double _clamp(double value, double min, double max) =>
    value.clamp(min, max).toDouble();

double estimateVocabHalfLifeDays({
  required int totalSeen,
  required int totalCorrect,
  required int totalIncorrect,
  required int streakCorrect,
  required double mastery,
}) {
  // Same HLR-style weighting as Battleship's reviewed vocab scheduler.
  final dotProduct = -1.0 +
      (0.18 * math.log(1 + totalSeen)) +
      (0.28 * math.log(1 + totalCorrect)) +
      (-0.42 * math.log(1 + totalIncorrect)) +
      (0.2 * math.log(1 + streakCorrect)) +
      (1.15 * mastery);
  return _clamp(
    math.pow(2, dotProduct).toDouble(),
    vocabSchedulerMinHalfLifeDays,
    vocabSchedulerMaxHalfLifeDays,
  );
}

double vocabRecallProbability(VocabItem item, {DateTime? now}) {
  if (item.lastSeenAt == null || item.totalSeen == 0) return 0;
  final current = now ?? DateTime.now();
  final elapsedDays = math.max(
    0,
    current.difference(item.lastSeenAt!).inMilliseconds / vocabSchedulerDayMs,
  );
  final halfLife = item.halfLifeDays <= 0
      ? vocabSchedulerDefaultHalfLifeDays
      : item.halfLifeDays;
  return _clamp(math.pow(2, -elapsedDays / halfLife).toDouble(), 0, 1);
}

bool isVocabItemDue(VocabItem item, {DateTime? now}) {
  if (item.totalSeen == 0 || !item.reviewMastered) return true;
  // Records written before the scheduler was introduced can be marked as
  // mastered without any timing fields. Keep those legacy words out of the
  // due queue until a new review answer gives them a real schedule.
  if (item.lastSeenAt == null && item.nextDueAt == null) return false;
  final current = now ?? DateTime.now();
  final recall = vocabRecallProbability(item, now: current);
  return (item.nextDueAt != null && !item.nextDueAt!.isAfter(current)) ||
      recall <= vocabSchedulerTargetRecall;
}

double vocabReviewPriority(VocabItem item, {DateTime? now}) {
  final current = now ?? DateTime.now();
  final recall = vocabRecallProbability(item, now: current);
  final overdueDays = item.nextDueAt == null
      ? (item.totalSeen == 0 ? 3.0 : 0.5)
      : math.max(
          0,
          current.difference(item.nextDueAt!).inMilliseconds /
              vocabSchedulerDayMs,
        );
  final weakBonus = item.totalIncorrect > item.totalCorrect ? 1.2 : 0.0;
  final newBonus = item.totalSeen == 0 ? 2.0 : 0.0;
  final targetDistance = (recall - vocabSchedulerTargetRecall).abs();
  return (overdueDays * 1.3) +
      ((1 - targetDistance) * 1.1) +
      weakBonus +
      newBonus +
      (1 - item.mastery);
}

VocabItem applyVocabReviewAnswer(
  VocabItem item,
  bool correct, {
  DateTime? now,
}) {
  final current = now ?? DateTime.now();
  final totalSeen = item.totalSeen + 1;
  final totalCorrect = item.totalCorrect + (correct ? 1 : 0);
  final totalIncorrect = item.totalIncorrect + (correct ? 0 : 1);
  final streakCorrect = correct ? item.streakCorrect + 1 : 0;
  final mastery = _clamp(
    item.mastery + (correct ? 0.11 : -0.18),
    0,
    1,
  );
  final halfLife = estimateVocabHalfLifeDays(
    totalSeen: totalSeen,
    totalCorrect: totalCorrect,
    totalIncorrect: totalIncorrect,
    streakCorrect: streakCorrect,
    mastery: mastery,
  );
  final intervalDays = correct
      ? (totalSeen <= 1 ? 0.25 : _clamp(halfLife * 1.6, 0.25, 45))
      : 0.04;
  final nextDueAt = current.add(Duration(
    milliseconds: (intervalDays * vocabSchedulerDayMs).round(),
  ));
  return item.copyWith(
    totalSeen: totalSeen,
    totalCorrect: totalCorrect,
    totalIncorrect: totalIncorrect,
    reviewMastered: correct,
    streakCorrect: streakCorrect,
    mastery: mastery,
    lastSeenAt: current,
    nextDueAt: nextDueAt,
    halfLifeDays: halfLife,
    lastRecallProb: correct ? 1 : 0,
    updatedAt: current,
  );
}
