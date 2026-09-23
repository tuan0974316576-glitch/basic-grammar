import 'dart:convert';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'streak_models.dart';

abstract interface class StreakRepository {
  Future<StudyStreak> load();

  Future<StreakUpdate> record({
    required String eventId,
    required String kind,
    required String sourceId,
    required int answerCount,
    required int completedAtMs,
  });
}

class FirebaseStreakRepository implements StreakRepository {
  FirebaseStreakRepository({
    FirebaseAuth? auth,
    FirebaseFirestore? firestore,
    FirebaseFunctions? functions,
  })  : _auth = auth ?? FirebaseAuth.instance,
        _firestore = firestore ?? FirebaseFirestore.instance,
        _functions =
            functions ?? FirebaseFunctions.instanceFor(region: 'asia-east2');

  final FirebaseAuth _auth;
  final FirebaseFirestore _firestore;
  final FirebaseFunctions _functions;

  @override
  Future<StudyStreak> load() async {
    final uid = _auth.currentUser?.uid;
    if (uid == null) return const StudyStreak();
    final snapshot = await _firestore.collection('users').doc(uid).get();
    final data = snapshot.data() ?? const <String, dynamic>{};
    return StudyStreak.fromJson(
      Map<String, dynamic>.from(data['studyStreak'] as Map? ?? const {}),
    );
  }

  @override
  Future<StreakUpdate> record({
    required String eventId,
    required String kind,
    required String sourceId,
    required int answerCount,
    required int completedAtMs,
  }) async {
    final result = await _functions
        .httpsCallable(
      'recordLearningActivity',
      options: HttpsCallableOptions(timeout: const Duration(seconds: 20)),
    )
        .call<Map<String, dynamic>>({
      'eventId': eventId,
      'kind': kind,
      'sourceId': sourceId,
      'answerCount': answerCount,
      'completedAtMs': completedAtMs,
    });
    return StreakUpdate.fromJson(Map<String, dynamic>.from(result.data));
  }
}

class LocalStreakRepository implements StreakRepository {
  static const _key = 'a1-buddy-study-streak-v1';
  static const _eventsKey = 'a1-buddy-study-streak-events-v1';

  @override
  Future<StudyStreak> load() async {
    final preferences = await SharedPreferences.getInstance();
    final source = preferences.getString(_key);
    if (source == null || source.isEmpty) return const StudyStreak();
    return StudyStreak.fromJson(
      Map<String, dynamic>.from(jsonDecode(source) as Map),
    );
  }

  @override
  Future<StreakUpdate> record({
    required String eventId,
    required String kind,
    required String sourceId,
    required int answerCount,
    required int completedAtMs,
  }) async {
    final preferences = await SharedPreferences.getInstance();
    final seen = preferences.getStringList(_eventsKey)?.toSet() ?? <String>{};
    final current = await load();
    if (!seen.add(eventId)) {
      return StreakUpdate(streak: current, duplicate: true);
    }
    final today = hongKongDateKey(
      DateTime.fromMillisecondsSinceEpoch(completedAtMs, isUtc: true),
    );
    if (current.completedOn(today)) {
      await preferences.setStringList(_eventsKey, seen.take(200).toList());
      return StreakUpdate(streak: current, duplicate: true);
    }
    final yesterday = hongKongDateKey(
      DateTime.fromMillisecondsSinceEpoch(completedAtMs, isUtc: true)
          .subtract(const Duration(days: 1)),
    );
    final distance = _dateKeyDistance(current.lastCompletedDateKey, today);
    var days = current.lastCompletedDateKey == yesterday ? current.days + 1 : 1;
    var freezes = current.freezeCount;
    var freezesUsed = 0;
    final freezeDates = [...current.freezeUsedDateKeys];
    if (distance > 1) {
      final missedDays = distance - 1;
      freezesUsed = missedDays.clamp(0, freezes);
      freezes -= freezesUsed;
      if (missedDays == freezesUsed) days = current.days + 1;
      final previous =
          DateTime.parse('${current.lastCompletedDateKey}T00:00:00Z');
      for (var offset = 1; offset <= freezesUsed; offset += 1) {
        freezeDates.add(
          hongKongDateKey(previous.add(Duration(days: offset))),
        );
      }
    }
    final totalActiveDays = current.totalActiveDays + 1;
    if (totalActiveDays == 3 || totalActiveDays % 7 == 0) {
      freezes = (freezes + 1).clamp(0, 2);
    }
    final updated = StudyStreak(
      days: days,
      bestDays: days > current.bestDays ? days : current.bestDays,
      freezeCount: freezes,
      totalActiveDays: totalActiveDays,
      lastCompletedDateKey: today,
      activeDateKeys: {...current.activeDateKeys, today}.toList(),
      freezeUsedDateKeys: freezeDates.length <= 31
          ? freezeDates
          : freezeDates.sublist(freezeDates.length - 31),
    );
    await preferences.setString(_key, jsonEncode(updated.toJson()));
    await preferences.setStringList(_eventsKey, seen.take(200).toList());
    return StreakUpdate(
      streak: updated,
      extended: true,
      freezeUsed: freezesUsed > 0,
      milestone: const {3, 7, 14, 30, 50, 100}.contains(days),
    );
  }
}

int _dateKeyDistance(String from, String to) {
  if (from.isEmpty || to.isEmpty) return 0;
  final start = DateTime.tryParse('${from}T00:00:00Z');
  final end = DateTime.tryParse('${to}T00:00:00Z');
  if (start == null || end == null) return 0;
  return end.difference(start).inDays;
}

String hongKongDateKey(DateTime utc) {
  final local = utc.toUtc().add(const Duration(hours: 8));
  String two(int value) => value.toString().padLeft(2, '0');
  return '${local.year}-${two(local.month)}-${two(local.day)}';
}
