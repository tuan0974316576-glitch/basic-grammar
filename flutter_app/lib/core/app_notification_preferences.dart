enum AppNotificationCategory {
  daily,
  streakRisk,
  social,
  achievements,
}

class AppNotificationPreferences {
  const AppNotificationPreferences({
    this.daily = false,
    this.streakRisk = false,
    this.social = false,
    this.achievements = false,
    this.reminderMinutes = 18 * 60 + 30,
  });

  factory AppNotificationPreferences.fromJson(Map<String, dynamic> json) {
    return AppNotificationPreferences(
      daily: json['daily'] == true,
      streakRisk: json['streakRisk'] == true,
      social: json['social'] == true,
      achievements: json['achievements'] == true,
      reminderMinutes:
          ((json['reminderMinutes'] as num?)?.toInt() ?? 18 * 60 + 30)
              .clamp(0, 23 * 60 + 59),
    );
  }

  final bool daily;
  final bool streakRisk;
  final bool social;
  final bool achievements;
  final int reminderMinutes;

  bool get anyEnabled => daily || streakRisk || social || achievements;

  bool enabled(AppNotificationCategory category) => switch (category) {
        AppNotificationCategory.daily => daily,
        AppNotificationCategory.streakRisk => streakRisk,
        AppNotificationCategory.social => social,
        AppNotificationCategory.achievements => achievements,
      };

  AppNotificationPreferences setCategory(
    AppNotificationCategory category,
    bool value,
  ) {
    return AppNotificationPreferences(
      daily: category == AppNotificationCategory.daily ? value : daily,
      streakRisk:
          category == AppNotificationCategory.streakRisk ? value : streakRisk,
      social: category == AppNotificationCategory.social ? value : social,
      achievements: category == AppNotificationCategory.achievements
          ? value
          : achievements,
      reminderMinutes: reminderMinutes,
    );
  }

  AppNotificationPreferences withReminderMinutes(int value) {
    return AppNotificationPreferences(
      daily: daily,
      streakRisk: streakRisk,
      social: social,
      achievements: achievements,
      reminderMinutes: value.clamp(0, 23 * 60 + 59),
    );
  }

  Map<String, dynamic> toJson() => {
        'daily': daily,
        'streakRisk': streakRisk,
        'social': social,
        'achievements': achievements,
        'reminderMinutes': reminderMinutes,
      };
}
