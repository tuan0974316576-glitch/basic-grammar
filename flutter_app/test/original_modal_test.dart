import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/core/app_sfx.dart';
import 'package:dope_english/core/app_palette.dart';
import 'package:dope_english/core/app_notification_preferences.dart';
import 'package:dope_english/core/widgets/original_modal.dart';
import 'package:dope_english/core/widgets/stationery_frame.dart';
import 'package:dope_english/features/econ/econ_palette.dart';

void main() {
  testWidgets('original Settings slider reports and commits volume',
      (tester) async {
    final changed = <double>[];
    final committed = <double>[];
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: OriginalSettingsModal(
            initialVolume: 0.5,
            onVolumeChanged: changed.add,
            onVolumeCommitted: committed.add,
            sfx: const SilentLessonSfx(),
          ),
        ),
      ),
    );

    expect(find.text('50%'), findsOneWidget);
    final slider = find.byKey(const Key('original-settings-volume-slider'));
    await tester.drag(slider, const Offset(100, 0));
    await tester.pumpAndSettle();

    expect(changed, isNotEmpty);
    expect(committed, isNotEmpty);
    expect(find.text('50%'), findsNothing);
  });

  testWidgets('Settings controls emit SFX cues on open controls',
      (tester) async {
    final sfx = _RecordingLessonSfx();
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: OriginalSettingsModal(
            initialVolume: 0.5,
            onVolumeChanged: (_) {},
            onVolumeCommitted: (_) {},
            sfx: sfx,
          ),
        ),
      ),
    );

    await tester.drag(
      find.byKey(const Key('original-settings-volume-slider')),
      const Offset(80, 0),
    );
    await tester.pumpAndSettle();

    expect(sfx.cues, contains(SfxCue.step));
  });

  testWidgets('Settings modal accepts the ECON orange palette', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: OriginalSettingsModal(
            initialVolume: 0.5,
            onVolumeChanged: (_) {},
            onVolumeCommitted: (_) {},
            accentColor: EconPalette.primary,
            accentDarkColor: EconPalette.primaryDark,
            accentSoftColor: EconPalette.softPrimary,
            accentShadowColor: EconPalette.border,
          ),
        ),
      ),
    );

    final frame = tester.widget<StationeryFrame>(
      find.byKey(const Key('original-settings-modal')),
    );
    final volumePanel = tester.widget<OriginalDashedSurface>(
      find.byKey(const Key('original-settings-volume-panel')),
    );
    final sliderTheme = tester.widget<SliderTheme>(find.byType(SliderTheme));
    expect(frame.borderColor, EconPalette.primary);
    expect(volumePanel.backgroundColor, EconPalette.softPrimary);
    expect(volumePanel.borderColor, EconPalette.primary);
    expect(sliderTheme.data.thumbColor, EconPalette.primary);
  });

  testWidgets('Settings notification categories keep distinct colours',
      (tester) async {
    AppNotificationCategory? requested;
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: OriginalSettingsModal(
            initialVolume: 0.5,
            onVolumeChanged: (_) {},
            onVolumeCommitted: (_) {},
            notificationPreferences: const AppNotificationPreferences(),
            onNotificationCategoryChanged: (category, enabled) async {
              requested = category;
              return const AppNotificationPreferences(daily: true);
            },
            onReminderMinutesChanged: (minutes) async =>
                AppNotificationPreferences(reminderMinutes: minutes),
          ),
        ),
      ),
    );

    await tester.tap(
      find.byKey(const Key('notification-daily-switch')),
    );
    await tester.pumpAndSettle();

    expect(requested, AppNotificationCategory.daily);
    expect(
      tester
          .widget<Switch>(
            find.byKey(const Key('notification-daily-switch')),
          )
          .value,
      isTrue,
    );
    expect(find.text('18:30'), findsOneWidget);
    expect(
      tester.widget<Text>(find.text('每日學習提醒')).style?.color,
      AppPalette.primaryDark,
    );
    expect(
      tester.widget<Text>(find.text('今晚火焰有危險')).style?.color,
      const Color(0xFFE67E22),
    );
    expect(
      tester.widget<Text>(find.text('班級／拍檔任務提醒')).style?.color,
      AppPalette.pink,
    );
    expect(
      tester.widget<Text>(find.text('成就及每週學習總結')).style?.color,
      const Color(0xFFB8860B),
    );
  });

  testWidgets('notification permission offer is an in-app choice first',
      (tester) async {
    var enabled = false;
    var later = false;
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: NotificationPermissionOfferModal(
            onEnable: () async => enabled = true,
            onLater: () => later = true,
          ),
        ),
      ),
    );

    expect(find.text('想唔想提你儲火？'), findsOneWidget);
    await tester.tap(find.byKey(const Key('notification-offer-enable')));
    await tester.pump();
    expect(enabled, isTrue);
    expect(later, isFalse);
  });

  testWidgets('four notification controls fit a compact settings modal',
      (tester) async {
    tester.view.physicalSize = const Size(320, 568);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: OriginalSettingsModal(
            initialVolume: 0.5,
            onVolumeChanged: (_) {},
            onVolumeCommitted: (_) {},
            notificationPreferences: const AppNotificationPreferences(),
            onNotificationCategoryChanged: (category, enabled) async =>
                const AppNotificationPreferences(),
            onReminderMinutesChanged: (minutes) async =>
                AppNotificationPreferences(reminderMinutes: minutes),
          ),
        ),
      ),
    );

    expect(find.byKey(const Key('original-settings-notification-panel')),
        findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('lesson start modal keeps text inside the compact frame',
      (tester) async {
    tester.view.physicalSize = const Size(320, 568);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: OriginalLessonStartModal(
            lessonLabel: 'LESSON 02',
            title: '一句句子必須只有一個動詞',
            description: '分辨正確句、沒有動詞、兩個動詞',
            onStart: () {},
            sfx: const SilentLessonSfx(),
          ),
        ),
      ),
    );

    expect(find.text('LESSON 02'), findsOneWidget);
    expect(find.text('一句句子必須只有一個動詞'), findsOneWidget);
    expect(find.text('開始課堂'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}

class _RecordingLessonSfx implements LessonSfx {
  final cues = <SfxCue>[];

  @override
  Future<void> play(SfxCue cue) async {
    cues.add(cue);
  }
}
