import 'dart:async';
import 'dart:convert';
import 'dart:math' as math;

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'streak_models.dart';
import 'streak_repository.dart';

class StreakController extends ChangeNotifier {
  StreakController({required StreakRepository repository})
      : _repository = repository;

  static const _queueKey = 'a1-buddy-pending-learning-activities-v1';
  final StreakRepository _repository;
  StudyStreak _streak = const StudyStreak();
  StreakUpdate? _lastUpdate;
  bool _initialized = false;

  StudyStreak get streak => _streak;
  StreakUpdate? get lastUpdate => _lastUpdate;
  bool get initialized => _initialized;
  bool get completedToday => _streak.completedOn(
        hongKongDateKey(DateTime.now().toUtc()),
      );

  Future<void> initialize() async {
    try {
      _streak = await _repository.load();
      await _flushQueue();
    } catch (error) {
      debugPrint('Streak initialization failed: $error');
    } finally {
      _initialized = true;
      notifyListeners();
    }
  }

  Future<void> recordActivity({
    required String kind,
    required String sourceId,
    int answerCount = 0,
  }) async {
    final now = DateTime.now().toUtc();
    final event = <String, dynamic>{
      'eventId':
          '${now.microsecondsSinceEpoch}-${math.Random().nextInt(1 << 32)}',
      'kind': kind,
      'sourceId': sourceId,
      'answerCount': answerCount,
      'completedAtMs': now.millisecondsSinceEpoch,
    };
    try {
      await _flushQueue();
      await _send(event);
    } catch (error) {
      debugPrint('Learning activity queued: $error');
      await _enqueue(event);
    }
  }

  void clearLastUpdate() {
    _lastUpdate = null;
    notifyListeners();
  }

  Future<void> _send(Map<String, dynamic> event) async {
    final update = await _repository.record(
      eventId: '${event['eventId']}',
      kind: '${event['kind']}',
      sourceId: '${event['sourceId']}',
      answerCount: (event['answerCount'] as num?)?.toInt() ?? 0,
      completedAtMs: (event['completedAtMs'] as num?)?.toInt() ?? 0,
    );
    _streak = update.streak;
    _lastUpdate = update;
    notifyListeners();
  }

  Future<void> _enqueue(Map<String, dynamic> event) async {
    final preferences = await SharedPreferences.getInstance();
    final queue = preferences.getStringList(_queueKey) ?? <String>[];
    queue.add(jsonEncode(event));
    await preferences.setStringList(
      _queueKey,
      queue.length <= 100 ? queue : queue.sublist(queue.length - 100),
    );
  }

  Future<void> _flushQueue() async {
    final preferences = await SharedPreferences.getInstance();
    final queue = preferences.getStringList(_queueKey) ?? const <String>[];
    if (queue.isEmpty) return;
    final remaining = <String>[];
    for (final source in queue) {
      try {
        await _send(Map<String, dynamic>.from(jsonDecode(source) as Map));
      } catch (_) {
        remaining.add(source);
      }
    }
    await preferences.setStringList(_queueKey, remaining);
  }
}
