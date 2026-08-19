import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../../core/app_palette.dart';
import '../../../core/widgets/stationery_frame.dart';

class LessonPageScaffold extends StatelessWidget {
  const LessonPageScaffold({
    required this.lessonLabel,
    required this.title,
    required this.progress,
    required this.questionLabel,
    required this.onClose,
    required this.body,
    this.bottom,
    this.trailing,
    super.key,
  });

  final String lessonLabel;
  final String title;
  final double progress;
  final String questionLabel;
  final VoidCallback onClose;
  final Widget body;
  final Widget? bottom;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppPalette.background,
      resizeToAvoidBottomInset: true,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(14, 8, 14, 12),
          child: Column(
            children: [
              Row(
                children: [
                  IconButton(
                    tooltip: '返回路線圖',
                    onPressed: onClose,
                    icon: const Icon(
                      Icons.close_rounded,
                      color: AppPalette.muted,
                      size: 29,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          lessonLabel,
                          style: const TextStyle(
                            color: AppPalette.primaryDark,
                            fontSize: 11,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        Text(
                          title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: AppPalette.ink,
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    questionLabel,
                    style: const TextStyle(
                      color: AppPalette.muted,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  if (trailing != null) ...[
                    const SizedBox(width: 8),
                    trailing!,
                  ],
                ],
              ),
              const SizedBox(height: 5),
              ClipRRect(
                borderRadius: BorderRadius.circular(99),
                child: LinearProgressIndicator(
                  minHeight: 11,
                  value: progress.clamp(0, 1),
                  color: AppPalette.primary,
                  backgroundColor: const Color(0xFFE4E7EA),
                ),
              ),
              const SizedBox(height: 12),
              Expanded(child: body),
              if (bottom != null) ...[
                const SizedBox(height: 10),
                bottom!,
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class LessonPromptCard extends StatelessWidget {
  const LessonPromptCard({
    required this.primary,
    this.translation,
    this.instruction,
    this.compact = false,
    super.key,
  });

  final String primary;
  final String? translation;
  final String? instruction;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return StationeryFrame(
      radius: 18,
      ringWidth: 3,
      shadowDepth: 3,
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 14 : 18,
        vertical: compact ? 12 : 16,
      ),
      backgroundColor: AppPalette.softPrimary,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (instruction?.isNotEmpty ?? false) ...[
            Text(
              instruction!,
              style: const TextStyle(
                color: AppPalette.primaryDark,
                fontSize: 12,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 7),
          ],
          Text(
            primary,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: AppPalette.ink,
              fontSize: compact ? 20 : 24,
              height: 1.25,
              fontWeight: FontWeight.w900,
            ),
          ),
          if (translation?.isNotEmpty ?? false) ...[
            const SizedBox(height: 8),
            Text(
              translation!,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: AppPalette.muted,
                fontSize: compact ? 14 : 16,
                height: 1.25,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class LessonChoiceButton extends StatelessWidget {
  const LessonChoiceButton({
    required this.label,
    required this.onPressed,
    this.icon,
    this.selected = false,
    this.wrong = false,
    this.correct = false,
    super.key,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool selected;
  final bool wrong;
  final bool correct;

  @override
  Widget build(BuildContext context) {
    final borderColor = wrong
        ? AppPalette.danger
        : correct
            ? AppPalette.correctDark
            : selected
                ? AppPalette.primaryDark
                : AppPalette.border;
    final background = wrong
        ? AppPalette.softDanger
        : correct
            ? AppPalette.softCorrect
            : selected
                ? AppPalette.softPrimary
                : AppPalette.paper;
    return Material(
      color: background,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(12),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 160),
          constraints: const BoxConstraints(minHeight: 54),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: borderColor, width: selected ? 3 : 2),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (icon != null) ...[
                Icon(icon, color: borderColor, size: 24),
                const SizedBox(width: 7),
              ],
              Flexible(
                child: Text(
                  label,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: AppPalette.ink,
                    fontSize: 17,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class LessonFeedbackCard extends StatelessWidget {
  const LessonFeedbackCard({
    required this.correct,
    required this.title,
    required this.lines,
    this.answer,
    super.key,
  });

  final bool correct;
  final String title;
  final List<String> lines;
  final String? answer;

  @override
  Widget build(BuildContext context) {
    final color = correct ? AppPalette.correctDark : AppPalette.dangerDark;
    return StationeryFrame(
      radius: 16,
      ringWidth: 3,
      shadowDepth: 3,
      borderColor: color,
      shadowColor: correct ? const Color(0xFFBFE9C6) : const Color(0xFFF4C0C0),
      backgroundColor: correct ? AppPalette.softCorrect : AppPalette.softDanger,
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Icon(
                correct ? Icons.check_circle_rounded : Icons.cancel_rounded,
                color: color,
                size: 27,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    color: color,
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ],
          ),
          for (final line in lines) ...[
            const SizedBox(height: 8),
            Text(
              line,
              style: const TextStyle(
                color: AppPalette.ink,
                fontSize: 15,
                height: 1.35,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
          if (answer?.isNotEmpty ?? false) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppPalette.paper,
                borderRadius: BorderRadius.circular(9),
                border: Border.all(color: AppPalette.correctDark, width: 2),
              ),
              child: Text(
                '正確答案：$answer',
                style: const TextStyle(
                  color: AppPalette.correctDark,
                  fontSize: 16,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class LessonPrimaryButton extends StatelessWidget {
  const LessonPrimaryButton({
    required this.label,
    required this.onPressed,
    this.icon = Icons.arrow_forward_rounded,
    this.danger = false,
    super.key,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData icon;
  final bool danger;

  @override
  Widget build(BuildContext context) {
    return FilledButton.icon(
      onPressed: onPressed,
      icon: Icon(icon),
      label: Text(label),
      style: FilledButton.styleFrom(
        minimumSize: const Size.fromHeight(54),
        backgroundColor: danger ? AppPalette.danger : AppPalette.primaryDark,
        disabledBackgroundColor: AppPalette.border,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(13)),
        textStyle: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
      ),
    );
  }
}

class LessonResultScreen extends StatelessWidget {
  const LessonResultScreen({
    required this.lessonLabel,
    required this.score,
    required this.total,
    required this.mistakes,
    required this.onClose,
    required this.onRestart,
    this.onReview,
    this.reviewMode = false,
    super.key,
  });

  final String lessonLabel;
  final int score;
  final int total;
  final int mistakes;
  final VoidCallback onClose;
  final VoidCallback onRestart;
  final VoidCallback? onReview;
  final bool reviewMode;

  @override
  Widget build(BuildContext context) {
    final accuracy = total == 0 ? 0 : ((score / total) * 100).round();
    return Scaffold(
      backgroundColor: AppPalette.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 10, 20, 18),
          child: Column(
            children: [
              Align(
                alignment: Alignment.centerLeft,
                child: IconButton(
                  tooltip: '返回路線圖',
                  onPressed: onClose,
                  icon: const Icon(Icons.close_rounded, size: 30),
                ),
              ),
              const Spacer(),
              Container(
                width: 108,
                height: 108,
                decoration: BoxDecoration(
                  color: AppPalette.secondary,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 5),
                  boxShadow: const [
                    BoxShadow(
                      color: AppPalette.secondaryDark,
                      offset: Offset(0, 7),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.star_rounded,
                  color: Colors.white,
                  size: 72,
                ),
              ),
              const SizedBox(height: 25),
              Text(
                reviewMode ? '錯題重練完成！' : '$lessonLabel 完成！',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: AppPalette.ink,
                  fontSize: 27,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 9),
              Text(
                mistakes == 0 ? '全程零失誤，真係好犀利！' : '睇完解釋，再重練錯題就會更穩。',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: AppPalette.muted,
                  fontSize: 16,
                  height: 1.35,
                ),
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  _ResultStat(
                    label: 'FIRST TRY',
                    value: '$score/$total',
                    color: AppPalette.primaryDark,
                  ),
                  const SizedBox(width: 9),
                  _ResultStat(
                    label: '錯題',
                    value: '$mistakes',
                    color: AppPalette.danger,
                  ),
                  const SizedBox(width: 9),
                  _ResultStat(
                    label: '準確率',
                    value: '$accuracy%',
                    color: AppPalette.correctDark,
                  ),
                ],
              ),
              const Spacer(),
              if (onReview != null) ...[
                OutlinedButton.icon(
                  onPressed: onReview,
                  icon: const Icon(Icons.refresh_rounded),
                  label: const Text('重練錯題'),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size.fromHeight(52),
                    foregroundColor: AppPalette.secondaryDark,
                    side: const BorderSide(
                      color: AppPalette.secondaryDark,
                      width: 2,
                    ),
                  ),
                ),
                const SizedBox(height: 10),
              ],
              LessonPrimaryButton(
                label: '再玩一局',
                icon: Icons.replay_rounded,
                onPressed: onRestart,
              ),
              TextButton(
                onPressed: onClose,
                child: const Text('返回路線圖'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class LessonCelebrationOverlay extends StatelessWidget {
  const LessonCelebrationOverlay({
    required this.trigger,
    this.grand = false,
    super.key,
  });

  final int trigger;
  final bool grand;

  @override
  Widget build(BuildContext context) {
    if (trigger == 0) return const SizedBox.shrink();
    return Positioned.fill(
      child: IgnorePointer(
        child: TweenAnimationBuilder<double>(
          key: ValueKey('$trigger-$grand'),
          tween: Tween(begin: 0, end: 1),
          duration: Duration(milliseconds: grand ? 1350 : 850),
          builder: (context, progress, _) {
            return CustomPaint(
              painter: _CelebrationPainter(progress: progress, grand: grand),
            );
          },
        ),
      ),
    );
  }
}

class LessonLoadError extends StatelessWidget {
  const LessonLoadError(
      {required this.lessonLabel, required this.onClose, super.key});

  final String lessonLabel;
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppPalette.background,
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.error_outline_rounded,
                  color: AppPalette.danger,
                  size: 58,
                ),
                const SizedBox(height: 14),
                Text(
                  '未能載入 $lessonLabel 題庫。',
                  style: const TextStyle(
                    color: AppPalette.ink,
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 18),
                SizedBox(
                  width: 320,
                  child: LessonPrimaryButton(
                    label: '返回路線圖',
                    icon: Icons.arrow_back_rounded,
                    onPressed: onClose,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ResultStat extends StatelessWidget {
  const _ResultStat({
    required this.label,
    required this.value,
    required this.color,
  });

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        height: 82,
        decoration: BoxDecoration(
          color: AppPalette.paper,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.65), width: 2),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              value,
              maxLines: 1,
              style: TextStyle(
                color: color,
                fontSize: 21,
                fontWeight: FontWeight.w900,
              ),
            ),
            Text(
              label,
              maxLines: 1,
              style: const TextStyle(
                color: AppPalette.muted,
                fontSize: 10,
                fontWeight: FontWeight.w900,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CelebrationPainter extends CustomPainter {
  const _CelebrationPainter({required this.progress, required this.grand});

  final double progress;
  final bool grand;

  static const colors = [
    AppPalette.primary,
    AppPalette.secondaryDark,
    AppPalette.correct,
    AppPalette.danger,
    AppPalette.pink,
  ];

  @override
  void paint(Canvas canvas, Size size) {
    if (progress <= 0 || progress >= 1) return;
    final opacity = math.sin(progress * math.pi);
    final center = Offset(size.width / 2, size.height * 0.48);
    final count = grand ? 70 : 34;
    final radius = size.shortestSide * (grand ? 0.9 : 0.56) * progress;
    for (var index = 0; index < count; index++) {
      final angle = (math.pi * 2 * index / count) + (index % 5) * 0.09;
      final distance = radius * (0.45 + (index % 9) / 13);
      final point =
          center + Offset(math.cos(angle), math.sin(angle)) * distance;
      final paint = Paint()
        ..color = colors[index % colors.length].withValues(alpha: opacity)
        ..strokeWidth = grand ? 5 : 4
        ..strokeCap = StrokeCap.round;
      canvas.drawLine(
        point,
        point + Offset(math.cos(angle), math.sin(angle)) * 10,
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _CelebrationPainter oldDelegate) {
    return progress != oldDelegate.progress || grand != oldDelegate.grand;
  }
}
