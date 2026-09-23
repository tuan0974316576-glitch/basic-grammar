import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

import '../../core/app_palette.dart';
import '../../core/widgets/stationery_frame.dart';
import 'streak_models.dart';

bool get _animatePersistentStreakFire => !WidgetsBinding.instance.runtimeType
    .toString()
    .contains('TestWidgetsFlutterBinding');

class StreakBadge extends StatelessWidget {
  const StreakBadge({
    required this.streak,
    required this.onTap,
    this.compact = false,
    super.key,
  });

  final StudyStreak streak;
  final VoidCallback onTap;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    if (compact) {
      return Semantics(
        button: true,
        label: '連續學習 ${streak.days} 日',
        child: GestureDetector(
          onTap: onTap,
          child: Container(
            key: const Key('study-streak-badge'),
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: const Color(0xFFFFF7D6),
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFFF2A43A), width: 2.5),
              boxShadow: const [
                BoxShadow(color: Color(0xFFD9832B), offset: Offset(0, 3)),
              ],
            ),
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                Center(
                  child: SizedBox.square(
                    dimension: 29,
                    child: Lottie.asset(
                      'assets/lottie/streak-fire.json',
                      animate: _animatePersistentStreakFire,
                      repeat: true,
                    ),
                  ),
                ),
                Positioned(
                  right: -3,
                  bottom: -3,
                  child: Container(
                    constraints: const BoxConstraints(minWidth: 18),
                    height: 18,
                    padding: const EdgeInsets.symmetric(horizontal: 3),
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFC45C),
                      borderRadius: BorderRadius.circular(9),
                      border: Border.all(color: Colors.white, width: 1.5),
                    ),
                    child: Text(
                      '${streak.days}',
                      style: const TextStyle(
                        color: Color(0xFF7F421F),
                        fontSize: 9,
                        height: 1,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }
    return Semantics(
      button: true,
      label: '連續學習 ${streak.days} 日',
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          key: const Key('study-streak-badge'),
          height: 42,
          constraints: const BoxConstraints(minWidth: 68),
          padding: const EdgeInsets.fromLTRB(4, 2, 10, 2),
          decoration: BoxDecoration(
            color: const Color(0xFFFFF7D6),
            border: Border.all(color: const Color(0xFFF2A43A), width: 2.5),
            borderRadius: BorderRadius.circular(20),
            boxShadow: const [
              BoxShadow(color: Color(0xFFD9832B), offset: Offset(0, 3)),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox.square(
                dimension: 34,
                child: Lottie.asset(
                  'assets/lottie/streak-fire.json',
                  animate: _animatePersistentStreakFire,
                  repeat: true,
                  fit: BoxFit.contain,
                ),
              ),
              const SizedBox(width: 2),
              Text(
                '${streak.days}',
                style: const TextStyle(
                  color: Color(0xFF9A4E20),
                  fontSize: 17,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class StreakPanel extends StatelessWidget {
  const StreakPanel({required this.streak, required this.onClose, super.key});

  final StudyStreak streak;
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final first = DateTime(now.year, now.month, 1);
    final daysInMonth = DateTime(now.year, now.month + 1, 0).day;
    final leading = first.weekday % 7;
    return Material(
      color: Colors.transparent,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 430),
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            StationeryFrame(
              padding: const EdgeInsets.fromLTRB(18, 14, 18, 20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(
                    height: 70,
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            '${streak.days} 日連續學習',
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: Color(0xFF7F421F),
                              fontSize: 23,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '最佳 ${streak.bestDays} 日 · 累積 ${streak.totalActiveDays} 日',
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: AppPalette.muted,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${now.year} 年 ${now.month} 月',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      for (final label in ['日', '一', '二', '三', '四', '五', '六'])
                        Expanded(
                          child: Text(
                            label,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: AppPalette.muted,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 5),
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 7,
                      mainAxisExtent: 36,
                    ),
                    itemCount: leading + daysInMonth,
                    itemBuilder: (context, index) {
                      if (index < leading) return const SizedBox.shrink();
                      final day = index - leading + 1;
                      final key = _dateKey(now.year, now.month, day);
                      final active = streak.activeDateKeys.contains(key);
                      final frozen = streak.freezeUsedDateKeys.contains(key);
                      return Center(
                        child: Container(
                          width: 30,
                          height: 30,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: active
                                ? const Color(0xFFFFC45C)
                                : frozen
                                    ? const Color(0xFFBDEBFF)
                                    : Colors.transparent,
                            shape: BoxShape.circle,
                          ),
                          child: frozen
                              ? const Icon(Icons.ac_unit_rounded,
                                  size: 16, color: Color(0xFF258DBD))
                              : Text('$day',
                                  style: TextStyle(
                                    fontWeight: active
                                        ? FontWeight.w900
                                        : FontWeight.w700,
                                  )),
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    '完成一個練習回合，就可以延續今日火焰。',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: AppPalette.muted,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
            Positioned(
              top: -11,
              right: -9,
              child: _StreakCloseSticker(onPressed: onClose),
            ),
          ],
        ),
      ),
    );
  }
}

class _StreakCloseSticker extends StatelessWidget {
  const _StreakCloseSticker({required this.onPressed});

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: '關閉',
      child: GestureDetector(
        key: const Key('streak-panel-close'),
        onTap: onPressed,
        child: Container(
          width: 50,
          height: 50,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: const Color(0xFFFF6664),
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 3),
            boxShadow: const [
              BoxShadow(color: Color(0xFFD94D51), offset: Offset(0, 4)),
            ],
          ),
          child: const Icon(
            Icons.close_rounded,
            color: Colors.white,
            size: 31,
          ),
        ),
      ),
    );
  }
}

class StreakCelebrationOverlay extends StatelessWidget {
  const StreakCelebrationOverlay({
    required this.update,
    this.onDone,
    super.key,
  });

  final StreakUpdate? update;
  final VoidCallback? onDone;

  @override
  Widget build(BuildContext context) {
    final value = update;
    if (value == null || !value.extended) return const SizedBox.shrink();
    final now = DateTime.now().toUtc().add(const Duration(hours: 8));
    return Positioned.fill(
      child: Material(
        color: AppPalette.background,
        child: SafeArea(
          child: LayoutBuilder(
            builder: (context, constraints) {
              final compact = constraints.maxHeight < 760;
              return SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(18, 16, 18, 18),
                child: Column(
                  children: [
                    OriginalDashedSurface(
                      key: const Key('streak-celebration-speech'),
                      backgroundColor: AppPalette.paper,
                      borderColor: AppPalette.primary,
                      shadowColor: const Color(0xFFBDE0E1),
                      shadowDepth: 5,
                      radius: 24,
                      strokeWidth: 2.5,
                      padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
                      child: Text(
                        value.freezeUsed
                            ? '火焰幫你凍結咗，連續學習繼續保持！'
                            : value.streak.days == 1
                                ? '第一日火焰誕生！每日練習，令火焰繼續成長。'
                                : '火焰儲好喇！繼續每日溫習，保持連續學習。',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: Color(0xFF5D4037),
                          fontSize: 19,
                          height: 1.3,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                    SizedBox(height: compact ? 4 : 10),
                    SizedBox(
                      key: const Key('streak-celebration-art'),
                      height: compact ? 235 : 290,
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          Lottie.asset(
                            'assets/lottie/streak-extend.json',
                            repeat: true,
                            fit: BoxFit.contain,
                          ),
                          if (value.freezeUsed)
                            const _TimedLottie(
                              path: 'assets/lottie/streak-freeze.json',
                              duration: Duration(milliseconds: 1700),
                            ),
                          if (value.milestone)
                            const _TimedLottie(
                              path: 'assets/lottie/confetti.json',
                              duration: Duration(milliseconds: 1900),
                            ),
                          Align(
                            alignment: streakMonsterAlignmentForDays(
                                value.streak.days),
                            child: SizedBox.square(
                              key: const Key('streak-celebration-monster'),
                              dimension: compact ? 112 : 142,
                              child: Lottie.asset(
                                _monsterForMilestone(value.streak.days),
                                repeat: true,
                                fit: BoxFit.contain,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      '${value.streak.days}',
                      key: const Key('streak-celebration-day-count'),
                      style: const TextStyle(
                        color: AppPalette.secondaryDark,
                        fontSize: 64,
                        height: 0.95,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const Text(
                      '日連續學習',
                      style: TextStyle(
                        color: AppPalette.secondaryDark,
                        fontSize: 21,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 15),
                    _StreakWeekStrip(today: now),
                    const SizedBox(height: 17),
                    _StreakCelebrationButton(onPressed: onDone),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}

class _StreakWeekStrip extends StatelessWidget {
  const _StreakWeekStrip({required this.today});

  final DateTime today;

  @override
  Widget build(BuildContext context) {
    const labels = ['一', '二', '三', '四', '五', '六', '日'];
    return Row(
      key: const Key('streak-celebration-week'),
      children: [
        for (var offset = 0; offset < 7; offset += 1)
          Expanded(
            child: Column(
              children: [
                Text(
                  labels[(today.weekday - 1 + offset) % 7],
                  style: TextStyle(
                    color: offset == 0
                        ? AppPalette.secondaryDark
                        : AppPalette.muted,
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 5),
                Container(
                  width: 34,
                  height: 34,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: offset == 0
                        ? AppPalette.secondary
                        : const Color(0xFFEFF2F3),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: offset == 0
                          ? AppPalette.secondaryDark
                          : const Color(0xFFD7DEE0),
                      width: 2,
                    ),
                  ),
                  child: offset == 0
                      ? const Icon(Icons.check_rounded,
                          color: Color(0xFF5D4037), size: 21)
                      : null,
                ),
              ],
            ),
          ),
      ],
    );
  }
}

class _StreakCelebrationButton extends StatelessWidget {
  const _StreakCelebrationButton({required this.onPressed});

  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: '返回詞彙',
      child: GestureDetector(
        key: const Key('streak-celebration-done'),
        onTap: onPressed,
        child: Container(
          width: double.infinity,
          constraints: const BoxConstraints(minHeight: 56),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: AppPalette.secondary,
            borderRadius: BorderRadius.circular(999),
            boxShadow: const [
              BoxShadow(color: AppPalette.secondaryDark, offset: Offset(0, 5)),
            ],
          ),
          child: const Text(
            '返回詞彙',
            style: TextStyle(
              color: Color(0xFF5D4037),
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
      ),
    );
  }
}

String _monsterForMilestone(int days) {
  const monsters = [
    'cute-monster',
    'monster-blue',
    'monster-3',
    'monster-5',
    'monster-6',
    'one-eye-monster-2',
  ];
  final milestoneIndex = switch (days) {
    3 => 0,
    7 => 1,
    14 => 2,
    30 => 3,
    50 => 4,
    100 => 5,
    _ => 0,
  };
  return 'assets/lottie/monsters/${monsters[milestoneIndex]}.json';
}

Alignment streakMonsterAlignmentForDays(int days) =>
    days == 3 ? const Alignment(0, -0.12) : Alignment.bottomCenter;

class _TimedLottie extends StatefulWidget {
  const _TimedLottie({required this.path, required this.duration});

  final String path;
  final Duration duration;

  @override
  State<_TimedLottie> createState() => _TimedLottieState();
}

class _TimedLottieState extends State<_TimedLottie>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(vsync: this);

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Lottie.asset(
      widget.path,
      controller: _controller,
      repeat: false,
      fit: BoxFit.contain,
      onLoaded: (_) {
        _controller.duration = widget.duration;
        _controller.forward(from: 0);
      },
    );
  }
}

String _dateKey(int year, int month, int day) =>
    '$year-${month.toString().padLeft(2, '0')}-${day.toString().padLeft(2, '0')}';
