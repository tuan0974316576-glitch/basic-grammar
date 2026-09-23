import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

const grammarLessonIds = <String>[
  'lesson-01',
  'lesson-02',
  'quiz-01',
  'lesson-03',
  'lesson-04',
  'lesson-05',
  'lesson-06',
  'lesson-07',
  'lesson-08',
  'lesson-09',
  'lesson-10',
  'lesson-11',
  'lesson-12',
  'lesson-13',
];

const grammarLessonTotals = <int>[
  100,
  100,
  50,
  30,
  7,
  50,
  100,
  60,
  60,
  60,
  100,
  260,
  100,
  80,
];

abstract interface class GrammarProgressStore {
  Future<Map<String, int>> load(String playerId);

  Future<void> save(String playerId, Map<String, int> progress);
}

class SharedPreferencesGrammarProgressStore implements GrammarProgressStore {
  const SharedPreferencesGrammarProgressStore();

  static const _keyPrefix = 'dope_grammar_progress_v1';

  String _key(String playerId) => '$_keyPrefix::$playerId';

  @override
  Future<Map<String, int>> load(String playerId) async {
    try {
      final preferences = await SharedPreferences.getInstance();
      final source = preferences.getString(_key(playerId));
      if (source == null || source.isEmpty) return const {};
      final decoded = Map<String, dynamic>.from(jsonDecode(source) as Map);
      return {
        for (final entry in decoded.entries)
          if (entry.value is num) entry.key: (entry.value as num).toInt(),
      };
    } catch (_) {
      return const {};
    }
  }

  @override
  Future<void> save(String playerId, Map<String, int> progress) async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString(_key(playerId), jsonEncode(progress));
  }
}

class GrammarProgressController extends ChangeNotifier {
  GrammarProgressController({
    required this.playerId,
    GrammarProgressStore? store,
  }) : _store = store ?? const SharedPreferencesGrammarProgressStore();

  final String playerId;
  final GrammarProgressStore _store;
  final Map<String, int> _correctByLesson = {};
  Future<void> _saveQueue = Future<void>.value();
  Future<void>? _initialization;
  bool _initialized = false;

  bool get initialized => _initialized;

  Map<int, int> get progressByIndex => {
        for (var index = 0; index < grammarLessonIds.length; index++)
          index: correctForIndex(index),
      };

  int correctForIndex(int index) {
    if (index < 0 || index >= grammarLessonIds.length) return 0;
    return _correctByLesson[grammarLessonIds[index]] ?? 0;
  }

  Future<void> initialize() async {
    if (_initialized) return;
    final pending = _initialization;
    if (pending != null) return pending;
    final future = _load();
    _initialization = future;
    return future;
  }

  Future<void> _load() async {
    final stored = await _store.load(playerId);
    for (var index = 0; index < grammarLessonIds.length; index++) {
      final lessonId = grammarLessonIds[index];
      final total = grammarLessonTotals[index];
      _correctByLesson[lessonId] = (stored[lessonId] ?? 0).clamp(0, total);
    }
    _initialized = true;
    notifyListeners();
  }

  Future<void> recordCorrect(int lessonIndex) async {
    if (lessonIndex < 0 || lessonIndex >= grammarLessonIds.length) return;
    if (!_initialized) await initialize();
    final lessonId = grammarLessonIds[lessonIndex];
    final total = grammarLessonTotals[lessonIndex];
    final current = _correctByLesson[lessonId] ?? 0;
    if (current >= total) return;
    _correctByLesson[lessonId] = current + 1;
    notifyListeners();

    final snapshot = Map<String, int>.from(_correctByLesson);
    _saveQueue = _saveQueue.then((_) async {
      try {
        await _store.save(playerId, snapshot);
      } catch (_) {
        // Local progress is already reflected in memory; a storage failure
        // must not interrupt the lesson.
      }
    });
    await _saveQueue;
  }
}
