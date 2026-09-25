import 'dart:math' as math;

import 'vocab_models.dart';

const vocabSchedulerDayMs = 24 * 60 * 60 * 1000;
const vocabSchedulerTargetRecall = 0.6;
// Duolingo's published HLR implementation bounds memory strength from about
// 15 minutes to nine months. These are bounds for the prediction, not a
// promise that every word will wait nine months before review.
const vocabSchedulerMinHalfLifeDays = 15 / (24 * 60);
const vocabSchedulerMaxHalfLifeDays = 274.0;
const vocabSchedulerDefaultHalfLifeDays = 0.5;
const vocabSchedulerMaxReviewIntervalDays = 180.0;

double _clamp(double value, double min, double max) =>
    value.clamp(min, max).toDouble();

double estimateVocabHalfLifeDays({
  required int totalSeen,
  required int totalCorrect,
  required int totalIncorrect,
  required int streakCorrect,
  required double mastery,
}) {
  // This follows Duolingo's public HLR shape: a bias plus history features
  // predicts a word's half-life. The starter weights are deliberately local
  // and replaceable once A1 BUDDY has enough of its own answer history to
  // train them.
  final dotProduct = -1.0 +
      (0.18 * math.log(1 + totalSeen)) +
      (0.28 * math.sqrt(1 + totalCorrect)) +
      (-0.42 * math.sqrt(1 + totalIncorrect)) +
      (0.2 * math.sqrt(1 + streakCorrect)) +
      (1.15 * mastery);
  return _clamp(
    math.pow(2, dotProduct).toDouble(),
    vocabSchedulerMinHalfLifeDays,
    vocabSchedulerMaxHalfLifeDays,
  );
}

/// Number of days until the predicted recall reaches the review target.
/// Solving `target = 2 ^ (-days / halfLife)` gives this directly instead of
/// applying a fixed multiplier to every correct answer.
double vocabTargetIntervalDays(double halfLifeDays) {
  final halfLife = _clamp(
    halfLifeDays <= 0 ? vocabSchedulerDefaultHalfLifeDays : halfLifeDays,
    vocabSchedulerMinHalfLifeDays,
    vocabSchedulerMaxHalfLifeDays,
  );
  final interval =
      -halfLife * (math.log(vocabSchedulerTargetRecall) / math.ln2);
  return _clamp(interval, 0.04, vocabSchedulerMaxReviewIntervalDays);
}

DateTime? vocabPredictedDueAt(VocabItem item) {
  if (item.nextDueAt != null) return item.nextDueAt;
  final lastSeen = item.lastSeenAt;
  if (lastSeen == null || item.totalSeen == 0) return null;
  return lastSeen.add(Duration(
    milliseconds:
        (vocabTargetIntervalDays(item.halfLifeDays) * vocabSchedulerDayMs)
            .round(),
  ));
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
  final dueAt = vocabPredictedDueAt(item);
  final overdueDays = dueAt == null
      ? (item.totalSeen == 0 ? 3.0 : 0.5)
      : math.max(
          0,
          current.difference(dueAt).inMilliseconds / vocabSchedulerDayMs,
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
  // Correct answers wait until the predicted recall reaches the target. A
  // wrong answer remains a short retry so the existing mistake-revision loop
  // can still bring it back in the same learning session.
  final intervalDays = correct ? vocabTargetIntervalDays(halfLife) : 0.04;
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
