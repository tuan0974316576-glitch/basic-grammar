import 'dart:async';
import 'dart:ui';

import 'package:flutter/material.dart';

import '../app_palette.dart';
import '../app_notification_preferences.dart';
import '../app_sfx.dart';
import 'stationery_frame.dart';

Future<T?> showOriginalModal<T>({
  required BuildContext context,
  required Widget child,
  required String barrierLabel,
}) {
  return showGeneralDialog<T>(
    context: context,
    barrierDismissible: true,
    barrierLabel: barrierLabel,
    barrierColor: const Color(0x61293C40),
    transitionDuration: const Duration(milliseconds: 220),
    transitionBuilder: (context, animation, secondaryAnimation, child) {
      return FadeTransition(
        opacity: animation,
        child: ScaleTransition(
          scale: Tween(begin: 0.96, end: 1.0).animate(
            CurvedAnimation(parent: animation, curve: Curves.easeOutCubic),
          ),
          child: child,
        ),
      );
    },
    pageBuilder: (context, animation, secondaryAnimation) {
      return BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 6, sigmaY: 6),
        child: Material(
          type: MaterialType.transparency,
          child: SafeArea(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: child,
              ),
            ),
          ),
        ),
      );
    },
  );
}

class OriginalSettingsModal extends StatefulWidget {
  const OriginalSettingsModal({
    required this.initialVolume,
    required this.onVolumeChanged,
    required this.onVolumeCommitted,
    this.onLogout,
    this.notificationPreferences,
    this.onNotificationCategoryChanged,
    this.onReminderMinutesChanged,
    this.profileName,
    this.profilePreview,
    this.onEditProfile,
    this.sfx,
    this.accentColor = AppPalette.primary,
    this.accentDarkColor = AppPalette.primaryDark,
    this.accentSoftColor = AppPalette.softPrimary,
    this.accentShadowColor = const Color(0xFFBDE0E1),
    super.key,
  });

  final double initialVolume;
  final ValueChanged<double> onVolumeChanged;
  final ValueChanged<double> onVolumeCommitted;
  final VoidCallback? onLogout;
  final AppNotificationPreferences? notificationPreferences;
  final Future<AppNotificationPreferences> Function(
    AppNotificationCategory category,
    bool enabled,
  )? onNotificationCategoryChanged;
  final Future<AppNotificationPreferences> Function(int minutes)?
      onReminderMinutesChanged;
  final String? profileName;
  final Widget? profilePreview;
  final VoidCallback? onEditProfile;
  final LessonSfx? sfx;
  final Color accentColor;
  final Color accentDarkColor;
  final Color accentSoftColor;
  final Color accentShadowColor;

  @override
  State<OriginalSettingsModal> createState() => _OriginalSettingsModalState();
}

class _OriginalSettingsModalState extends State<OriginalSettingsModal> {
  late double _volume;
  late AppNotificationPreferences _notificationPreferences;
  AppNotificationCategory? _notificationBusyCategory;
  bool _notificationTimeBusy = false;

  @override
  void initState() {
    super.initState();
    _volume = widget.initialVolume.clamp(0, 1);
    _notificationPreferences =
        widget.notificationPreferences ?? const AppNotificationPreferences();
  }

  @override
  Widget build(BuildContext context) {
    final sfx = widget.sfx;
    void close() {
      if (sfx != null) unawaited(sfx.play(SfxCue.close));
      Navigator.of(context).pop();
    }

    return _OriginalModalFrame(
      modalKey: const Key('original-settings-modal'),
      kicker: 'Settings',
      title: '設定',
      onClose: close,
      accentColor: widget.accentColor,
      accentDarkColor: widget.accentDarkColor,
      accentSoftColor: widget.accentSoftColor,
      accentShadowColor: widget.accentShadowColor,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (widget.onEditProfile != null) ...[
            OriginalDashedSurface(
              key: const Key('original-settings-profile-panel'),
              backgroundColor: widget.accentSoftColor,
              borderColor: widget.accentColor,
              strokeWidth: 2,
              radius: 18,
              padding: const EdgeInsets.fromLTRB(10, 8, 8, 8),
              child: Row(
                children: [
                  SizedBox.square(
                    dimension: 54,
                    child: widget.profilePreview ??
                        Icon(
                          Icons.person_rounded,
                          size: 34,
                          color: widget.accentDarkColor,
                        ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Flexible(
                          child: Text(
                            widget.profileName?.isNotEmpty == true
                                ? widget.profileName!
                                : '個人資料',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: AppPalette.ink,
                              fontWeight: FontWeight.w900,
                              fontSize: 16,
                            ),
                          ),
                        ),
                        Tooltip(
                          message: '改名及 avatar',
                          child: IconButton(
                            key: const Key('original-settings-edit-profile'),
                            onPressed: widget.onEditProfile,
                            icon: const Icon(Icons.edit_rounded),
                            color: widget.accentDarkColor,
                            tooltip: '改名及 avatar',
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
          ],
          OriginalDashedSurface(
            key: const Key('original-settings-volume-panel'),
            backgroundColor: widget.accentSoftColor,
            borderColor: widget.accentColor,
            strokeWidth: 2,
            radius: 20,
            shadowColor: widget.accentShadowColor,
            shadowDepth: 4,
            padding: const EdgeInsets.all(14),
            child: Column(
              children: [
                Row(
                  children: [
                    const Expanded(
                      child: Text(
                        '音量大小',
                        style: TextStyle(
                          color: Color(0xFF5D4037),
                          fontSize: 17,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                    Text(
                      '${(_volume * 100).round()}%',
                      key: const Key('original-settings-volume-label'),
                      style: TextStyle(
                        color: widget.accentDarkColor,
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                SliderTheme(
                  data: SliderTheme.of(context).copyWith(
                    trackHeight: 12,
                    activeTrackColor: Colors.transparent,
                    inactiveTrackColor: Colors.transparent,
                    overlayShape: SliderComponentShape.noOverlay,
                    trackShape: _OriginalVolumeTrackShape(widget.accentColor),
                    thumbShape: _OriginalVolumeThumbShape(
                      widget.accentColor,
                      widget.accentDarkColor,
                    ),
                    thumbColor: widget.accentColor,
                  ),
                  child: Slider(
                    key: const Key('original-settings-volume-slider'),
                    value: _volume,
                    onChanged: (value) {
                      setState(() => _volume = value);
                      widget.onVolumeChanged(value);
                    },
                    onChangeEnd: (value) {
                      widget.onVolumeCommitted(value);
                      if (sfx != null) unawaited(sfx.play(SfxCue.step));
                    },
                  ),
                ),
              ],
            ),
          ),
          if (widget.onNotificationCategoryChanged != null) ...[
            const SizedBox(height: 14),
            OriginalDashedSurface(
              key: const Key('original-settings-notification-panel'),
              backgroundColor: const Color(0xFFFFF8D6),
              borderColor: const Color(0xFFF2C94C),
              strokeWidth: 2,
              radius: 16,
              shadowColor: const Color(0xFFE5C45A),
              shadowDepth: 3,
              padding: const EdgeInsets.fromLTRB(14, 12, 14, 13),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.notifications_active_rounded,
                          color: Color(0xFFD58B1F)),
                      SizedBox(width: 9),
                      Text(
                        '通知設定',
                        style: TextStyle(
                          color: Color(0xFF5D4037),
                          fontSize: 17,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  _NotificationCategoryRow(
                    category: AppNotificationCategory.daily,
                    label: '每日學習提醒',
                    color: AppPalette.primaryDark,
                    value: _notificationPreferences.daily,
                    busy: _notificationBusyCategory ==
                        AppNotificationCategory.daily,
                    enabled: _notificationBusyCategory == null &&
                        !_notificationTimeBusy,
                    onChanged: _changeNotificationCategory,
                  ),
                  _NotificationCategoryRow(
                    category: AppNotificationCategory.streakRisk,
                    label: '今晚火焰有危險',
                    color: const Color(0xFFE67E22),
                    value: _notificationPreferences.streakRisk,
                    busy: _notificationBusyCategory ==
                        AppNotificationCategory.streakRisk,
                    enabled: _notificationBusyCategory == null &&
                        !_notificationTimeBusy,
                    onChanged: _changeNotificationCategory,
                  ),
                  _NotificationCategoryRow(
                    category: AppNotificationCategory.social,
                    label: '班級／拍檔任務提醒',
                    color: AppPalette.pink,
                    value: _notificationPreferences.social,
                    busy: _notificationBusyCategory ==
                        AppNotificationCategory.social,
                    enabled: _notificationBusyCategory == null &&
                        !_notificationTimeBusy,
                    onChanged: _changeNotificationCategory,
                  ),
                  _NotificationCategoryRow(
                    category: AppNotificationCategory.achievements,
                    label: '成就及每週學習總結',
                    color: const Color(0xFFB8860B),
                    value: _notificationPreferences.achievements,
                    busy: _notificationBusyCategory ==
                        AppNotificationCategory.achievements,
                    enabled: _notificationBusyCategory == null &&
                        !_notificationTimeBusy,
                    onChanged: _changeNotificationCategory,
                  ),
                  const Divider(height: 18, color: Color(0xFFE8D68A)),
                  Row(
                    children: [
                      const Expanded(
                        child: Text(
                          '平日提醒時間',
                          style: TextStyle(
                            color: AppPalette.primaryDark,
                            fontSize: 14,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                      if (_notificationTimeBusy)
                        const SizedBox.square(
                          dimension: 22,
                          child: CircularProgressIndicator(strokeWidth: 3),
                        )
                      else
                        OutlinedButton.icon(
                          key: const Key('original-settings-reminder-time'),
                          onPressed: _notificationBusyCategory == null &&
                                  widget.onReminderMinutesChanged != null
                              ? _chooseReminderTime
                              : null,
                          icon: const Icon(Icons.schedule_rounded, size: 18),
                          label: Text(_formatMinutes(
                            _notificationPreferences.reminderMinutes,
                          )),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
          if (widget.onLogout != null) ...[
            const SizedBox(height: 14),
            OutlinedButton(
              key: const Key('original-settings-logout-button'),
              onPressed: () {
                if (sfx != null) unawaited(sfx.play(SfxCue.click));
                widget.onLogout!();
              },
              style: OutlinedButton.styleFrom(
                minimumSize: const Size.fromHeight(52),
                foregroundColor: AppPalette.muted,
                backgroundColor: Colors.white,
                side: const BorderSide(color: Color(0xFFE7E7E7), width: 2),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(999),
                ),
                textStyle: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w900,
                ),
              ),
              child: const Text('Log out'),
            ),
          ],
          const SizedBox(height: 14),
          const Text(
            'All rights reserved by Enguistics Learning Centre 2026',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Color(0xFFA0A0A0),
              fontSize: 11,
              height: 1.4,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _changeNotificationCategory(
    AppNotificationCategory category,
    bool value,
  ) async {
    setState(() => _notificationBusyCategory = category);
    final preferences = await widget.onNotificationCategoryChanged!(
      category,
      value,
    );
    if (!mounted) return;
    setState(() {
      _notificationPreferences = preferences;
      _notificationBusyCategory = null;
    });
  }

  Future<void> _chooseReminderTime() async {
    final current = _notificationPreferences.reminderMinutes;
    final selected = await showTimePicker(
      context: context,
      initialTime: TimeOfDay(hour: current ~/ 60, minute: current % 60),
      helpText: '選擇平日提醒時間',
      confirmText: '確定',
      cancelText: '取消',
    );
    if (!mounted || selected == null) return;
    setState(() => _notificationTimeBusy = true);
    final preferences = await widget.onReminderMinutesChanged!(
      selected.hour * 60 + selected.minute,
    );
    if (!mounted) return;
    setState(() {
      _notificationPreferences = preferences;
      _notificationTimeBusy = false;
    });
  }
}

class _NotificationCategoryRow extends StatelessWidget {
  const _NotificationCategoryRow({
    required this.category,
    required this.label,
    required this.color,
    required this.value,
    required this.busy,
    required this.enabled,
    required this.onChanged,
  });

  final AppNotificationCategory category;
  final String label;
  final Color color;
  final bool value;
  final bool busy;
  final bool enabled;
  final void Function(AppNotificationCategory category, bool value) onChanged;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 43,
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              style: TextStyle(
                color: color,
                fontSize: 14,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
          if (busy)
            SizedBox.square(
              dimension: 22,
              child: CircularProgressIndicator(
                color: color,
                strokeWidth: 3,
              ),
            )
          else
            Switch(
              key: Key('notification-${category.name}-switch'),
              value: value,
              activeThumbColor: color,
              activeTrackColor: color.withValues(alpha: 0.35),
              onChanged: enabled ? (next) => onChanged(category, next) : null,
            ),
        ],
      ),
    );
  }
}

String _formatMinutes(int minutes) {
  final hour = (minutes ~/ 60).toString().padLeft(2, '0');
  final minute = (minutes % 60).toString().padLeft(2, '0');
  return '$hour:$minute';
}

class NotificationPermissionOfferModal extends StatelessWidget {
  const NotificationPermissionOfferModal({
    required this.onEnable,
    required this.onLater,
    super.key,
  });

  final Future<void> Function() onEnable;
  final VoidCallback onLater;

  @override
  Widget build(BuildContext context) {
    return _OriginalModalFrame(
      modalKey: const Key('notification-permission-offer'),
      kicker: 'Study Reminder',
      title: '想唔想提你儲火？',
      onClose: onLater,
      accentColor: AppPalette.primary,
      accentDarkColor: AppPalette.primaryDark,
      accentSoftColor: AppPalette.softPrimary,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Icon(
            Icons.notifications_active_rounded,
            color: Color(0xFFE67E22),
            size: 58,
          ),
          const SizedBox(height: 10),
          const Text(
            '你已經建立咗學習習慣。開啟每日提醒，忙碌時都唔會錯過今日火焰。',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Color(0xFF5D4037),
              fontSize: 15,
              height: 1.4,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 16),
          FilledButton.icon(
            key: const Key('notification-offer-enable'),
            onPressed: () => unawaited(onEnable()),
            icon: const Icon(Icons.notifications_rounded),
            label: const Text('開啟提醒'),
          ),
          const SizedBox(height: 8),
          TextButton(
            key: const Key('notification-offer-later'),
            onPressed: onLater,
            child: const Text('稍後先'),
          ),
        ],
      ),
    );
  }
}

class OriginalLessonStartModal extends StatelessWidget {
  const OriginalLessonStartModal({
    required this.lessonLabel,
    required this.title,
    required this.description,
    required this.onStart,
    this.sfx,
    super.key,
  });

  final String lessonLabel;
  final String title;
  final String description;
  final VoidCallback onStart;
  final LessonSfx? sfx;

  @override
  Widget build(BuildContext context) {
    void close() {
      if (sfx != null) unawaited(sfx!.play(SfxCue.click));
      Navigator.of(context).pop();
    }

    return _OriginalModalFrame(
      modalKey: const Key('original-lesson-start-modal'),
      kicker: lessonLabel,
      title: title,
      onClose: close,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          OriginalDashedSurface(
            key: const Key('original-lesson-start-details'),
            backgroundColor: AppPalette.softPrimary,
            borderColor: AppPalette.primary,
            strokeWidth: 2,
            radius: 20,
            shadowColor: const Color(0xFFBDE0E1),
            shadowDepth: 4,
            padding: const EdgeInsets.all(16),
            child: Text(
              description,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Color(0xFF5D4037),
                fontSize: 16,
                height: 1.35,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            key: const Key('original-lesson-start-button'),
            onPressed: () {
              if (sfx != null) unawaited(sfx!.play(SfxCue.start));
              onStart();
            },
            icon: const Icon(Icons.play_arrow_rounded),
            label: const Text('開始課堂'),
            style: ElevatedButton.styleFrom(
              minimumSize: const Size.fromHeight(54),
              backgroundColor: AppPalette.secondary,
              foregroundColor: const Color(0xFF5D4037),
              shadowColor: AppPalette.secondaryDark,
              elevation: 5,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(999),
              ),
              textStyle: const TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _OriginalModalFrame extends StatelessWidget {
  const _OriginalModalFrame({
    required this.modalKey,
    required this.kicker,
    required this.title,
    required this.onClose,
    required this.child,
    this.accentColor = AppPalette.primary,
    this.accentDarkColor = AppPalette.primaryDark,
    this.accentSoftColor = AppPalette.softPrimary,
    this.accentShadowColor = const Color(0xFFBDE0E1),
  });

  final Key modalKey;
  final String kicker;
  final String title;
  final VoidCallback onClose;
  final Widget child;
  final Color accentColor;
  final Color accentDarkColor;
  final Color accentSoftColor;
  final Color accentShadowColor;

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 520),
      child: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: StationeryFrame(
          key: modalKey,
          backgroundColor: Colors.white,
          borderColor: accentColor,
          shadowColor: accentShadowColor,
          glowColor: accentColor,
          strokeWidth: 4,
          radius: 28,
          ringWidth: 6,
          shadowDepth: 10,
          padding: const EdgeInsets.all(18),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 5,
                          ),
                          decoration: BoxDecoration(
                            color: accentSoftColor,
                            borderRadius: BorderRadius.circular(999),
                            boxShadow: [
                              BoxShadow(
                                color: accentDarkColor,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: Text(
                            kicker,
                            style: const TextStyle(
                              color: Color(0xFF5D4037),
                              fontSize: 13,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                        const SizedBox(height: 11),
                        Text(
                          title,
                          style: TextStyle(
                            color: accentDarkColor,
                            fontSize: 27,
                            height: 1.05,
                            fontWeight: FontWeight.w900,
                            shadows: [
                              Shadow(
                                color: accentSoftColor,
                                offset: const Offset(2, 2),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  GestureDetector(
                    key: const Key('original-modal-close-button'),
                    behavior: HitTestBehavior.opaque,
                    onTap: onClose,
                    child: Container(
                      width: 48,
                      height: 48,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: AppPalette.danger,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: const [
                          BoxShadow(
                            color: AppPalette.dangerDark,
                            offset: Offset(0, 5),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.close_rounded,
                        color: Colors.white,
                        size: 28,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              const _OriginalThinDashedDivider(),
              const SizedBox(height: 14),
              child,
            ],
          ),
        ),
      ),
    );
  }
}

class _OriginalThinDashedDivider extends StatelessWidget {
  const _OriginalThinDashedDivider();

  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      key: Key('original-modal-divider'),
      height: 2,
      child: CustomPaint(painter: _ThinDashedLinePainter()),
    );
  }
}

class _ThinDashedLinePainter extends CustomPainter {
  const _ThinDashedLinePainter();

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFFE9ECEF)
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round;
    for (var x = 0.0; x < size.width; x += 10) {
      canvas.drawLine(
          Offset(x, 1), Offset((x + 5).clamp(0, size.width), 1), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _OriginalVolumeTrackShape extends SliderTrackShape {
  const _OriginalVolumeTrackShape(this.activeColor);

  final Color activeColor;

  @override
  Rect getPreferredRect({
    required RenderBox parentBox,
    Offset offset = Offset.zero,
    required SliderThemeData sliderTheme,
    bool isEnabled = false,
    bool isDiscrete = false,
  }) {
    return Rect.fromLTWH(
      offset.dx + 4,
      offset.dy + (parentBox.size.height - 12) / 2,
      parentBox.size.width - 8,
      12,
    );
  }

  @override
  void paint(
    PaintingContext context,
    Offset offset, {
    required RenderBox parentBox,
    required SliderThemeData sliderTheme,
    required Animation<double> enableAnimation,
    required Offset thumbCenter,
    Offset? secondaryOffset,
    bool isEnabled = false,
    bool isDiscrete = false,
    required TextDirection textDirection,
  }) {
    final canvas = context.canvas;
    final rect = getPreferredRect(
      parentBox: parentBox,
      offset: offset,
      sliderTheme: sliderTheme,
    );
    final radius = Radius.circular(rect.height / 2);
    canvas.drawRRect(
      RRect.fromRectAndRadius(rect, radius),
      Paint()..color = const Color(0xFFE9ECEF),
    );
    final activeRect =
        Rect.fromLTRB(rect.left, rect.top, thumbCenter.dx, rect.bottom);
    canvas.drawRRect(
      RRect.fromRectAndRadius(activeRect, radius),
      Paint()..color = activeColor,
    );
    final borderPath = Path()..addRRect(RRect.fromRectAndRadius(rect, radius));
    final borderPaint = Paint()
      ..color = const Color(0xFFCED4DA)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round;
    for (final metric in borderPath.computeMetrics()) {
      for (var distance = 0.0; distance < metric.length; distance += 8) {
        canvas.drawPath(
          metric.extractPath(distance, distance + 4),
          borderPaint,
        );
      }
    }
  }
}

class _OriginalVolumeThumbShape extends SliderComponentShape {
  const _OriginalVolumeThumbShape(this.accentColor, this.accentDarkColor);

  final Color accentColor;
  final Color accentDarkColor;

  @override
  Size getPreferredSize(bool isEnabled, bool isDiscrete) => const Size(30, 33);

  @override
  void paint(
    PaintingContext context,
    Offset center, {
    required Animation<double> activationAnimation,
    required Animation<double> enableAnimation,
    bool isDiscrete = false,
    TextPainter? labelPainter,
    RenderBox? parentBox,
    SliderThemeData? sliderTheme,
    TextDirection? textDirection,
    double? value,
    double? textScaleFactor,
    Size? sizeWithOverflow,
  }) {
    final canvas = context.canvas;
    canvas.drawCircle(
      center.translate(0, 3),
      15,
      Paint()..color = accentDarkColor,
    );
    canvas.drawCircle(center, 15, Paint()..color = Colors.white);
    canvas.drawCircle(center, 12, Paint()..color = accentColor);
  }
}
