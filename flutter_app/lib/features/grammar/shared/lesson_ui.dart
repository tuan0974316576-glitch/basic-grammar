import 'dart:async';

import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

import '../../../core/app_palette.dart';
import '../../../core/app_sfx.dart';
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
    this.leftEdgeOverlay,
    this.rightEdgeOverlay,
    this.accentColor = AppPalette.primary,
    this.accentDarkColor = AppPalette.primaryDark,
    this.accentSoftColor = AppPalette.softPrimary,
    this.accentShadowColor = const Color(0xFFBDE0E1),
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
  final Widget? leftEdgeOverlay;
  final Widget? rightEdgeOverlay;
  final Color accentColor;
  final Color accentDarkColor;
  final Color accentSoftColor;
  final Color accentShadowColor;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppPalette.background,
      resizeToAvoidBottomInset: true,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final compact = constraints.maxWidth <= 720;
            final outerPadding = compact
                ? const EdgeInsets.all(14)
                : const EdgeInsets.fromLTRB(20, 24, 20, 24);
            return Padding(
              padding: outerPadding,
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 850),
                  child: SizedBox(
                    height: constraints.maxHeight - outerPadding.vertical,
                    child: Stack(
                      key: const Key('lesson-page-frame-stack'),
                      clipBehavior: Clip.none,
                      children: [
                        Positioned.fill(
                          child: StationeryFrame(
                            padding: EdgeInsets.zero,
                            borderColor: accentColor,
                            shadowColor: accentShadowColor,
                            glowColor: accentColor,
                            radius: compact ? 24 : 30,
                            ringWidth: 6,
                            shadowDepth: compact ? 6 : 10,
                            child: Column(
                              children: [
                                LessonHeader(
                                  compact: compact,
                                  lessonLabel: lessonLabel,
                                  title: title,
                                  questionLabel: questionLabel,
                                  progress: progress,
                                  onClose: onClose,
                                  trailing: trailing,
                                  accentColor: accentColor,
                                  accentDarkColor: accentDarkColor,
                                  accentSoftColor: accentSoftColor,
                                ),
                                Expanded(
                                  child: Padding(
                                    padding: EdgeInsets.fromLTRB(
                                      compact ? 16 : 32,
                                      compact ? 4 : 8,
                                      compact ? 16 : 32,
                                      compact ? 18 : 26,
                                    ),
                                    child: Column(
                                      children: [
                                        Expanded(child: body),
                                        if (bottom != null) ...[
                                          const SizedBox(height: 10),
                                          bottom!,
                                        ],
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        if (leftEdgeOverlay != null)
                          Positioned(
                            left: 0,
                            top: 0,
                            bottom: 0,
                            child: Align(
                              alignment: Alignment.centerLeft,
                              child: leftEdgeOverlay!,
                            ),
                          ),
                        if (rightEdgeOverlay != null)
                          Positioned(
                            right: 0,
                            top: 0,
                            bottom: 0,
                            child: Align(
                              alignment: Alignment.centerRight,
                              child: rightEdgeOverlay!,
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class LessonHeader extends StatelessWidget {
  const LessonHeader({
    this.compact = true,
    required this.lessonLabel,
    required this.title,
    required this.questionLabel,
    required this.progress,
    required this.onClose,
    this.trailing,
    this.accentColor = AppPalette.primary,
    this.accentDarkColor = AppPalette.primaryDark,
    this.accentSoftColor = AppPalette.softPrimary,
    this.accentShadowColor = const Color(0xFFBDE0E1),
    super.key,
  });

  final bool compact;
  final String lessonLabel;
  final String title;
  final String questionLabel;
  final double progress;
  final VoidCallback onClose;
  final Widget? trailing;
  final Color accentColor;
  final Color accentDarkColor;
  final Color accentSoftColor;
  final Color accentShadowColor;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(
        compact ? 10 : 16,
        compact ? 10 : 15,
        compact ? 10 : 16,
        compact ? 8 : 12,
      ),
      child: Column(
        children: [
          Row(
            children: [
              LessonGhostButton(label: '< Menu', onPressed: onClose),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      lessonLabel,
                      style: TextStyle(
                        color: accentDarkColor,
                        fontSize: 11,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 0.7,
                      ),
                    ),
                    Text(
                      title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: accentDarkColor,
                        fontSize: compact ? 18 : 22,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
              ),
              if (trailing != null) ...[
                const SizedBox(width: 8),
                trailing!,
              ],
              const SizedBox(width: 8),
              Container(
                constraints: const BoxConstraints(minWidth: 54),
                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 8),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: accentSoftColor,
                  border: Border.all(color: accentColor, width: 2),
                  borderRadius: BorderRadius.circular(999),
                  boxShadow: [
                    BoxShadow(
                        color: accentShadowColor, offset: const Offset(0, 3)),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Q ',
                      style: TextStyle(
                        color: accentDarkColor,
                        fontSize: 12,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    Text(
                      questionLabel,
                      style: TextStyle(
                        color: accentDarkColor,
                        fontSize: 12,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(99),
            child: LinearProgressIndicator(
              value: progress.clamp(0, 1),
              minHeight: compact ? 12 : 14,
              color: accentColor,
              backgroundColor: const Color(0xFFE5E7EB),
            ),
          ),
        ],
      ),
    );
  }
}

class LessonGhostButton extends StatelessWidget {
  const LessonGhostButton(
      {required this.label, required this.onPressed, super.key});

  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      onPressed: onPressed,
      style: OutlinedButton.styleFrom(
        minimumSize: const Size(82, 42),
        padding: const EdgeInsets.symmetric(horizontal: 10),
        foregroundColor: AppPalette.muted,
        backgroundColor: Colors.white,
        side: const BorderSide(color: Color(0xFFEEEEEE), width: 2),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
        textStyle: const TextStyle(fontWeight: FontWeight.w900),
      ),
      child: Text(label),
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
    return OriginalDashedSurface(
      radius: 25,
      strokeWidth: 4,
      shadowColor: const Color(0xFFBDE0E1),
      shadowDepth: 6,
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
    this.accentColor = AppPalette.primary,
    this.accentDarkColor = AppPalette.primaryDark,
    this.accentSoftColor = AppPalette.softPrimary,
    super.key,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool selected;
  final bool wrong;
  final bool correct;
  final Color accentColor;
  final Color accentDarkColor;
  final Color accentSoftColor;

  @override
  Widget build(BuildContext context) {
    final borderColor = wrong
        ? AppPalette.danger
        : correct
            ? AppPalette.correctDark
            : selected
                ? accentDarkColor
                : AppPalette.border;
    final background = wrong
        ? AppPalette.softDanger
        : correct
            ? AppPalette.softCorrect
            : selected
                ? accentSoftColor
                : AppPalette.paper;
    return OriginalDashedSurface(
      backgroundColor: background,
      borderColor: borderColor,
      strokeWidth: selected || wrong || correct ? 3 : 2,
      radius: 16,
      shadowColor: selected || wrong || correct
          ? (selected && !wrong && !correct ? accentColor : borderColor)
              .withValues(alpha: 0.32)
          : const Color(0xFFE9ECEF),
      shadowDepth: 4,
      child: Semantics(
        button: true,
        enabled: onPressed != null,
        label: label,
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(16),
          child: ConstrainedBox(
            constraints: const BoxConstraints(minHeight: 64),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
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
    this.answerPrefix = '正確答案：',
    super.key,
  });

  final bool correct;
  final String title;
  final List<String> lines;
  final String? answer;
  final String answerPrefix;

  @override
  Widget build(BuildContext context) {
    final statusColor =
        correct ? AppPalette.correctDark : AppPalette.dangerDark;
    final frameColor = correct ? AppPalette.secondaryDark : statusColor;
    return OriginalDashedSurface(
      radius: 22,
      strokeWidth: 4,
      borderColor: frameColor,
      shadowColor: correct
          ? const Color(0xFFFFE7A3)
          : statusColor.withValues(alpha: 0.2),
      shadowDepth: 5,
      backgroundColor: correct ? AppPalette.softSecondary : Colors.white,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Icon(
                correct ? Icons.check_circle_rounded : Icons.cancel_rounded,
                color: statusColor,
                size: 28,
              ),
              const SizedBox(width: 9),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    color: statusColor,
                    fontSize: 19,
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
            OriginalDashedSurface(
              radius: 16,
              strokeWidth: 2,
              borderColor: AppPalette.primary,
              shadowColor: const Color(0xFFBDE0E1),
              shadowDepth: 3,
              backgroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 10,
              ),
              child: Text(
                '$answerPrefix${answer!.replaceFirst(RegExp(r'^正確答案：'), '')}',
                style: const TextStyle(
                  color: AppPalette.primaryDark,
                  fontSize: 16,
                  height: 1.3,
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
    this.sticker = false,
    super.key,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData icon;
  final bool danger;
  final bool sticker;

  @override
  Widget build(BuildContext context) {
    if (sticker) {
      final enabled = onPressed != null;
      return Semantics(
        button: true,
        label: label,
        enabled: enabled,
        child: GestureDetector(
          onTap: onPressed,
          child: AnimatedOpacity(
            duration: const Duration(milliseconds: 160),
            opacity: enabled ? 1 : .45,
            child: OriginalDashedSurface(
              backgroundColor:
                  enabled ? AppPalette.softPrimary : const Color(0xFFF3F3F3),
              borderColor:
                  enabled ? AppPalette.primary : const Color(0xFFD8D8D8),
              shadowColor:
                  enabled ? const Color(0xFFBDE0E1) : Colors.transparent,
              shadowDepth: enabled ? 4 : 0,
              radius: 18,
              strokeWidth: 2,
              padding: const EdgeInsets.symmetric(vertical: 13, horizontal: 14),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(icon,
                      color:
                          enabled ? AppPalette.primaryDark : AppPalette.muted,
                      size: 22),
                  const SizedBox(width: 8),
                  Flexible(
                    child: Text(label,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: enabled
                              ? AppPalette.primaryDark
                              : AppPalette.muted,
                          fontSize: 14,
                          fontWeight: FontWeight.w900,
                        )),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }
    return ElevatedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon),
      label: Text(label),
      style: FilledButton.styleFrom(
        minimumSize: const Size.fromHeight(54),
        backgroundColor: danger ? AppPalette.danger : AppPalette.secondary,
        disabledBackgroundColor: const Color(0xFFF3F3F3),
        disabledForegroundColor: const Color(0xFFAAAAAA),
        foregroundColor: danger ? Colors.white : const Color(0xFF5D4037),
        shadowColor: danger ? AppPalette.dangerDark : AppPalette.secondaryDark,
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
        textStyle: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
      ),
    );
  }
}

class LessonResultScreen extends StatefulWidget {
  const LessonResultScreen({
    required this.lessonLabel,
    required this.score,
    required this.total,
    required this.mistakes,
    required this.onClose,
    required this.onRestart,
    this.onReview,
    this.reviewMode = false,
    this.totalLabel = '題數',
    this.sfx,
    this.accentColor = AppPalette.primary,
    this.accentDarkColor = AppPalette.primaryDark,
    this.accentSoftColor = AppPalette.softPrimary,
    this.accentShadowColor = const Color(0xFFBDE0E1),
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
  final String totalLabel;
  final LessonSfx? sfx;
  final Color accentColor;
  final Color accentDarkColor;
  final Color accentSoftColor;
  final Color accentShadowColor;

  @override
  State<LessonResultScreen> createState() => _LessonResultScreenState();
}

class _LessonResultScreenState extends State<LessonResultScreen> {
  @override
  void initState() {
    super.initState();
    final percent =
        widget.total == 0 ? 0 : ((widget.score / widget.total) * 100).round();
    final sfx = widget.sfx;
    if (sfx != null) {
      unawaited(sfx.play(AppSfx.resultCueForPercent(percent)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final accuracy =
        widget.total == 0 ? 0 : ((widget.score / widget.total) * 100).round();
    return Scaffold(
      backgroundColor: AppPalette.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 850),
              child: StationeryFrame(
                padding: const EdgeInsets.fromLTRB(18, 14, 18, 20),
                borderColor: widget.accentColor,
                shadowColor: widget.accentShadowColor,
                glowColor: widget.accentColor,
                radius: 26,
                ringWidth: 6,
                shadowDepth: 8,
                child: Column(
                  children: [
                    Align(
                      alignment: Alignment.centerLeft,
                      child: OutlinedButton(
                        onPressed: widget.onClose,
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size(82, 42),
                          foregroundColor: AppPalette.muted,
                          backgroundColor: Colors.white,
                          side: const BorderSide(
                              color: Color(0xFFEEEEEE), width: 2),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(999),
                          ),
                        ),
                        child: const Text('< Menu'),
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      widget.reviewMode
                          ? '錯題重練完成！'
                          : '${widget.lessonLabel} 完成！',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: widget.accentDarkColor,
                        fontSize: 26,
                        fontWeight: FontWeight.w900,
                        shadows: [
                          Shadow(
                              color: widget.accentSoftColor,
                              offset: const Offset(2, 2)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 10),
                    OriginalDashedSurface(
                      backgroundColor: widget.accentSoftColor,
                      borderColor: widget.accentColor,
                      strokeWidth: 3,
                      radius: 24,
                      shadowColor: widget.accentShadowColor,
                      shadowDepth: 5,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      child: Column(
                        children: [
                          Text(
                            '${widget.score}/${widget.total}',
                            style: TextStyle(
                              color: widget.accentDarkColor,
                              fontSize: 50,
                              height: 1,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          const SizedBox(height: 6),
                          const Text(
                            'FIRST TRY',
                            style: TextStyle(
                              color: AppPalette.muted,
                              fontSize: 13,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 0.7,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        _ResultStat(
                            label: widget.totalLabel,
                            value: '${widget.total}',
                            color: AppPalette.primaryDark),
                        const SizedBox(width: 9),
                        _ResultStat(
                            label: '錯誤次數',
                            value: '${widget.mistakes}',
                            color: AppPalette.danger),
                        const SizedBox(width: 9),
                        _ResultStat(
                            label: '準確率',
                            value: '$accuracy%',
                            color: AppPalette.correctDark),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Text(
                      widget.mistakes == 0 ? '做得好！' : '睇完解釋，再重練錯題就會更穩。',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: AppPalette.correctDark,
                        fontSize: 17,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const Spacer(),
                    if (widget.onReview != null) ...[
                      OutlinedButton.icon(
                        onPressed: widget.onReview,
                        icon: const Icon(Icons.refresh_rounded),
                        label: const Text('重練錯題'),
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size.fromHeight(52),
                          foregroundColor: AppPalette.secondaryDark,
                          side: const BorderSide(
                              color: AppPalette.secondaryDark, width: 2),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(999)),
                        ),
                      ),
                      const SizedBox(height: 10),
                    ],
                    LessonPrimaryButton(
                      label: 'Restart',
                      icon: Icons.replay_rounded,
                      onPressed: widget.onRestart,
                    ),
                    TextButton(
                      onPressed: widget.onClose,
                      child: const Text('Menu'),
                    ),
                  ],
                ),
              ),
            ),
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
        child: Transform.scale(
          scale: grand ? 1.48 : 1.28,
          child: Lottie.asset(
            'assets/lottie/confetti.json',
            key: ValueKey('original-confetti-$trigger-$grand'),
            fit: BoxFit.cover,
            repeat: false,
            frameRate: FrameRate.max,
            options: LottieOptions(enableMergePaths: true),
          ),
        ),
      ),
    );
  }
}

class OriginalStreakFireAnimation extends StatelessWidget {
  const OriginalStreakFireAnimation({this.size = 220, super.key});

  final double size;

  @override
  Widget build(BuildContext context) {
    return SizedBox.square(
      key: const Key('original-streak-fire-lottie'),
      dimension: size,
      child: Lottie.asset(
        'assets/lottie/streak-fire.json',
        fit: BoxFit.contain,
        repeat: true,
        frameRate: FrameRate.max,
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
