class StudyStreak {
  const StudyStreak({
    this.days = 0,
    this.bestDays = 0,
    this.freezeCount = 0,
    this.totalActiveDays = 0,
    this.lastCompletedDateKey = '',
    this.activeDateKeys = const [],
    this.freezeUsedDateKeys = const [],
  });

  factory StudyStreak.fromJson(Map<String, dynamic> json) {
    return StudyStreak(
      days: (json['days'] as num?)?.toInt() ?? 0,
      bestDays: (json['bestDays'] as num?)?.toInt() ??
          (json['bestStreak'] as num?)?.toInt() ??
          0,
      freezeCount: (json['freezeCount'] as num?)?.toInt() ?? 0,
      totalActiveDays: (json['totalActiveDays'] as num?)?.toInt() ?? 0,
      lastCompletedDateKey: '${json['lastCompletedDateKey'] ?? ''}',
      activeDateKeys: (json['activeDateKeys'] as List?)
              ?.whereType<Object>()
              .map((value) => '$value')
              .toList(growable: false) ??
          const [],
      freezeUsedDateKeys: (json['freezeUsedDateKeys'] as List?)
              ?.whereType<Object>()
              .map((value) => '$value')
              .toList(growable: false) ??
          const [],
    );
  }

  final int days;
  final int bestDays;
  final int freezeCount;
  final int totalActiveDays;
  final String lastCompletedDateKey;
  final List<String> activeDateKeys;
  final List<String> freezeUsedDateKeys;

  bool completedOn(String dateKey) => lastCompletedDateKey == dateKey;

  Map<String, dynamic> toJson() => {
        'days': days,
        'bestDays': bestDays,
        'freezeCount': freezeCount,
        'totalActiveDays': totalActiveDays,
        'lastCompletedDateKey': lastCompletedDateKey,
        'activeDateKeys': activeDateKeys,
        'freezeUsedDateKeys': freezeUsedDateKeys,
      };
}

class StreakUpdate {
  const StreakUpdate({
    required this.streak,
    this.extended = false,
    this.freezeUsed = false,
    this.milestone = false,
    this.duplicate = false,
  });

  factory StreakUpdate.fromJson(Map<String, dynamic> json) => StreakUpdate(
        streak: StudyStreak.fromJson(
          Map<String, dynamic>.from(json['studyStreak'] as Map? ?? const {}),
        ),
        extended: json['extended'] == true,
        freezeUsed: json['freezeUsed'] == true,
        milestone: json['milestone'] == true,
        duplicate: json['duplicate'] == true,
      );

  final StudyStreak streak;
  final bool extended;
  final bool freezeUsed;
  final bool milestone;
  final bool duplicate;
}
