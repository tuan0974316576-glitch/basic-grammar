import 'package:dope_english/core/app_notification_preferences.dart';
import 'package:dope_english/features/notifications/notification_controller.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('notification preferences default to 18:30 with every category off', () {
    const preferences = AppNotificationPreferences();

    expect(preferences.reminderMinutes, 18 * 60 + 30);
    expect(preferences.anyEnabled, isFalse);
  });

  test('each notification category changes independently', () {
    const initial = AppNotificationPreferences();
    final social = initial.setCategory(AppNotificationCategory.social, true);

    expect(social.social, isTrue);
    expect(social.daily, isFalse);
    expect(social.streakRisk, isFalse);
    expect(social.achievements, isFalse);
    expect(
      AppNotificationPreferences.fromJson(social.toJson()).social,
      isTrue,
    );
  });

  test('permission offer waits for three activities and a two-day streak', () {
    expect(
      notificationPermissionOfferEligible(
        activityCount: 3,
        streakDays: 1,
        offerShown: false,
        anyCategoryEnabled: false,
      ),
      isFalse,
    );
    expect(
      notificationPermissionOfferEligible(
        activityCount: 3,
        streakDays: 2,
        offerShown: false,
        anyCategoryEnabled: false,
      ),
      isTrue,
    );
    expect(
      notificationPermissionOfferEligible(
        activityCount: 4,
        streakDays: 3,
        offerShown: true,
        anyCategoryEnabled: false,
      ),
      isFalse,
    );
  });
}
