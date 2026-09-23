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
                    height: 82,
                    child: Stack(
                      children: [
                        Positioned(
                          left: 2,
                          top: 6,
                          child: SizedBox.square(
                            dimension: 62,
                            child: Lottie.asset(
                              'assets/lottie/streak-fire.json',
                              animate: _animatePersistentStreakFire,
                              repeat: true,
                            ),
                          ),
                        ),
                        Align(
                          alignment: Alignment.center,
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 58),
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
                      ],
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
  const StreakCelebrationOverlay({required this.update, super.key});

  final StreakUpdate? update;

  @override
  Widget build(BuildContext context) {
    final value = update;
    if (value == null || !value.extended) return const SizedBox.shrink();
    return Positioned.fill(
      child: Material(
        color: Colors.transparent,
        child: Stack(
          fit: StackFit.expand,
          children: [
            const ModalBarrier(
              dismissible: false,
              color: Color(0x1A293C40),
            ),
            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox.square(
                    dimension: 330,
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        const _TimedLottie(
                          path: 'assets/lottie/streak-extend.json',
                          duration: Duration(milliseconds: 1500),
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
                        if (value.milestone)
                          Align(
                            alignment: streakMonsterAlignmentForDays(
                                value.streak.days),
                            child: SizedBox.square(
                              key: const Key('streak-celebration-monster'),
                              dimension: 150,
                              child: _TimedLottie(
                                path: _monsterForMilestone(
                                  value.streak.days,
                                ),
                                duration: const Duration(milliseconds: 1600),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                  Transform.translate(
                    offset: const Offset(0, -26),
                    child: Column(
                      children: [
                        Text(
                          '${value.streak.days} 日連續學習！',
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: Color(0xFF7F421F),
                            fontSize: 30,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          value.freezeUsed ? '火焰已凍結，連續學習繼續保持' : '火焰儲好喇！',
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: AppPalette.primaryDark,
                            fontSize: 15,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
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
