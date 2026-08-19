import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../../core/app_sfx.dart';
import 'quiz_01_controller.dart';
import 'quiz_01_question.dart';
import 'quiz_01_repository.dart';

const _ink = Color(0xFF101C20);
const _panel = Color(0xFF17262B);
const _blue = Color(0xFF25B4F3);
const _blueDark = Color(0xFF1178A9);
const _green = Color(0xFF4BC67A);
const _red = Color(0xFFFF6272);
const _yellow = Color(0xFFFFC928);
const _pink = Color(0xFFF58BC9);
const _softText = Color(0xFFAFC4C9);

class Quiz01Screen extends StatefulWidget {
  const Quiz01Screen({
    this.controller,
    this.repository = const Quiz01Repository(),
    this.sfx,
    super.key,
  });

  final Quiz01Controller? controller;
  final Quiz01Repository repository;
  final LessonSfx? sfx;

  @override
  State<Quiz01Screen> createState() => _Quiz01ScreenState();
}

class _Quiz01ScreenState extends State<Quiz01Screen>
    with SingleTickerProviderStateMixin {
  Quiz01Controller? _controller;
  Object? _loadError;
  late final AnimationController _burstController;

  LessonSfx get _sfx => widget.sfx ?? AppSfx.instance;

  @override
  void initState() {
    super.initState();
    _burstController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
    if (widget.controller case final controller?) {
      _attachController(controller);
    } else {
      _loadQuestions();
    }
  }

  Future<void> _loadQuestions() async {
    try {
      final questions = await widget.repository.loadQuestions();
      if (!mounted) return;
      _attachController(Quiz01Controller(allQuestions: questions));
      setState(() {});
    } catch (error) {
      if (!mounted) return;
      setState(() => _loadError = error);
    }
  }

  void _attachController(Quiz01Controller controller) {
    _controller?.removeListener(_refresh);
    _controller = controller..addListener(_refresh);
  }

  void _refresh() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _controller?.removeListener(_refresh);
    if (widget.controller == null) _controller?.dispose();
    _burstController.dispose();
    super.dispose();
  }

  void _playEvent(Quiz01Event event) {
    final cue = switch (event) {
      Quiz01Event.selectionChanged => SfxCue.step,
      Quiz01Event.invalidInput => SfxCue.wrong,
      Quiz01Event.wrong => SfxCue.wrong,
      Quiz01Event.questionCorrect => SfxCue.correct,
      Quiz01Event.nextQuestion => SfxCue.next,
      Quiz01Event.completed => SfxCue.complete,
      Quiz01Event.ignored => null,
    };
    if (cue != null) unawaited(_sfx.play(cue));
    if (event == Quiz01Event.questionCorrect ||
        event == Quiz01Event.completed) {
      _burstController.forward(from: 0);
    }
  }

  void _closeQuiz() {
    unawaited(_sfx.play(SfxCue.click));
    Navigator.of(context).pop();
  }

  void _nextQuestion() {
    final controller = _controller;
    if (controller == null) return;
    _playEvent(controller.next());
  }

  void _restart() {
    _controller?.restart();
    unawaited(_sfx.play(SfxCue.start));
  }

  void _reviewMistakes() {
    if (_controller?.reviewMistakes() ?? false) {
      unawaited(_sfx.play(SfxCue.start));
    }
  }

  @override
  Widget build(BuildContext context) {
    final controller = _controller;
    if (_loadError != null) {
      return _LoadErrorScreen(onClose: _closeQuiz);
    }
    if (controller == null) {
      return const Scaffold(
        backgroundColor: _ink,
        body: Center(child: CircularProgressIndicator(color: _blue)),
      );
    }

    return Scaffold(
      backgroundColor: _ink,
      body: SafeArea(
        child: Stack(
          children: [
            if (controller.isComplete)
              _QuizResult(
                controller: controller,
                onClose: _closeQuiz,
                onRestart: _restart,
                onReview: _reviewMistakes,
              )
            else
              _QuestionScreen(
                controller: controller,
                onClose: _closeQuiz,
                onEvent: _playEvent,
                onNext: _nextQuestion,
              ),
            Positioned.fill(
              child: IgnorePointer(
                child: AnimatedBuilder(
                  animation: _burstController,
                  builder: (context, child) => CustomPaint(
                    painter: _SparkBurstPainter(
                      progress: _burstController.value,
                      grand: controller.isComplete,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _QuestionScreen extends StatelessWidget {
  const _QuestionScreen({
    required this.controller,
    required this.onClose,
    required this.onEvent,
    required this.onNext,
  });

  final Quiz01Controller controller;
  final VoidCallback onClose;
  final ValueChanged<Quiz01Event> onEvent;
  final VoidCallback onNext;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
      child: Column(
        children: [
          _QuizProgressHeader(controller: controller, onClose: onClose),
          const SizedBox(height: 8),
          Expanded(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 220),
              switchInCurve: Curves.easeOut,
              child: controller.isResolved
                  ? _ResolvedQuestion(
                      key: ValueKey('resolved-${controller.index}'),
                      controller: controller,
                      onNext: onNext,
                    )
                  : _ActiveQuestion(
                      key: ValueKey('active-${controller.index}'),
                      controller: controller,
                      onEvent: onEvent,
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

class _QuizProgressHeader extends StatelessWidget {
  const _QuizProgressHeader({
    required this.controller,
    required this.onClose,
  });

  final Quiz01Controller controller;
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 44,
      child: Row(
        children: [
          IconButton(
            tooltip: '離開測驗',
            onPressed: onClose,
            icon: const Icon(Icons.close_rounded),
            color: _softText,
            iconSize: 30,
          ),
          const SizedBox(width: 6),
          Expanded(
            child: TweenAnimationBuilder<double>(
              tween: Tween(end: controller.progress),
              duration: const Duration(milliseconds: 320),
              curve: Curves.easeOutCubic,
              builder: (context, progress, child) => ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: LinearProgressIndicator(
                  value: progress,
                  minHeight: 14,
                  color: _pink,
                  backgroundColor: const Color(0xFF2A3B40),
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Text(
            '${controller.index + 1}/${controller.total}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}

class _ActiveQuestion extends StatelessWidget {
  const _ActiveQuestion({
    required this.controller,
    required this.onEvent,
    super.key,
  });

  final Quiz01Controller controller;
  final ValueChanged<Quiz01Event> onEvent;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final compact = constraints.maxHeight < 500;
        return Column(
          children: [
            SizedBox(
              height: compact ? 66 : 84,
              child: Center(
                child: Text(
                  controller.currentQuestion.zh,
                  key: const Key('quiz-01-chinese-prompt'),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: compact ? 23 : 27,
                    height: 1.2,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ),
            _AnswerLine(
              blocks: controller.selectedBlocks,
              compact: compact,
              onTap: (block) => onEvent(controller.toggleBlock(block.id)),
            ),
            SizedBox(height: compact ? 6 : 10),
            Expanded(
              child: Center(
                child: Wrap(
                  key: const Key('quiz-01-word-bank'),
                  alignment: WrapAlignment.center,
                  runAlignment: WrapAlignment.center,
                  spacing: compact ? 7 : 9,
                  runSpacing: compact ? 8 : 10,
                  children: [
                    for (final block in controller.availableBlocks)
                      _WordBlock(
                        key: ValueKey('bank-${block.id}'),
                        block: block,
                        compact: compact,
                        onTap: () => onEvent(controller.toggleBlock(block.id)),
                      ),
                  ],
                ),
              ),
            ),
            SizedBox(
              height: compact ? 23 : 29,
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 160),
                child: controller.feedback == null
                    ? const SizedBox.shrink()
                    : Text(
                        controller.feedback!.title,
                        key: const Key('quiz-01-input-warning'),
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: _red,
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
              ),
            ),
            _PrimaryButton(
              key: const Key('quiz-01-confirm'),
              label: '確認',
              icon: Icons.check_rounded,
              onPressed: () => onEvent(controller.submit()),
              enabled: controller.canSubmit,
            ),
          ],
        );
      },
    );
  }
}

class _AnswerLine extends StatelessWidget {
  const _AnswerLine({
    required this.blocks,
    required this.compact,
    required this.onTap,
  });

  final List<Quiz01WordBlock> blocks;
  final bool compact;
  final ValueChanged<Quiz01WordBlock> onTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      key: const Key('quiz-01-answer-line'),
      height: compact ? 96 : 112,
      width: double.infinity,
      child: CustomPaint(
        painter: const _DashedAnswerLinePainter(),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(4, 6, 4, 18),
          child: Align(
            alignment: Alignment.bottomLeft,
            child: Wrap(
              spacing: compact ? 6 : 8,
              runSpacing: compact ? 7 : 9,
              children: [
                for (final block in blocks)
                  TweenAnimationBuilder<double>(
                    key: ValueKey('answer-${block.id}'),
                    tween: Tween(begin: 0, end: 1),
                    duration: const Duration(milliseconds: 280),
                    curve: Curves.easeOutBack,
                    builder: (context, value, child) => Opacity(
                      opacity: value.clamp(0, 1),
                      child: Transform.translate(
                        offset: Offset(0, (1 - value) * 44),
                        child: child,
                      ),
                    ),
                    child: _WordBlock(
                      block: block,
                      compact: compact,
                      selected: true,
                      onTap: () => onTap(block),
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

class _WordBlock extends StatelessWidget {
  const _WordBlock({
    required this.block,
    required this.compact,
    required this.onTap,
    this.selected = false,
    super.key,
  });

  final Quiz01WordBlock block;
  final bool compact;
  final VoidCallback onTap;
  final bool selected;

  @override
  Widget build(BuildContext context) {
    final color = selected ? const Color(0xFFE1F6FF) : Colors.white;
    final border = selected ? _blue : const Color(0xFFC5D6DA);
    final shadow = selected ? _blueDark : const Color(0xFF718B92);
    return Semantics(
      button: true,
      label: selected ? '${block.text}，已放到答案' : block.text,
      child: Material(
        color: color,
        borderRadius: BorderRadius.circular(10),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(10),
          child: Container(
            constraints: BoxConstraints(
              minWidth: compact ? 50 : 58,
              minHeight: compact ? 42 : 48,
            ),
            padding: EdgeInsets.symmetric(
              horizontal: compact ? 11 : 14,
              vertical: compact ? 7 : 9,
            ),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: border, width: 2),
              boxShadow: [BoxShadow(color: shadow, offset: const Offset(0, 3))],
            ),
            alignment: Alignment.center,
            child: Text(
              block.text,
              maxLines: 1,
              style: TextStyle(
                color: const Color(0xFF21363C),
                fontSize: compact ? 17 : 19,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ResolvedQuestion extends StatelessWidget {
  const _ResolvedQuestion({
    required this.controller,
    required this.onNext,
    super.key,
  });

  final Quiz01Controller controller;
  final VoidCallback onNext;

  @override
  Widget build(BuildContext context) {
    final feedback = controller.feedback!;
    final color = feedback.isCorrect ? _green : _red;
    return LayoutBuilder(
      builder: (context, constraints) {
        final compact = constraints.maxHeight < 500;
        return Column(
          children: [
            SizedBox(
              height: compact ? 70 : 88,
              child: Center(
                child: Text(
                  controller.currentQuestion.zh,
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: compact ? 22 : 26,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ),
            Expanded(
              child: Container(
                width: double.infinity,
                padding: EdgeInsets.all(compact ? 16 : 20),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.13),
                  border: Border(
                    top: BorderSide(color: color, width: 3),
                    bottom: BorderSide(
                      color: color.withValues(alpha: 0.5),
                      width: 2,
                    ),
                  ),
                ),
                child: LayoutBuilder(
                  builder: (context, feedbackConstraints) => FittedBox(
                    fit: BoxFit.scaleDown,
                    alignment: Alignment.topLeft,
                    child: SizedBox(
                      width: feedbackConstraints.maxWidth,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(
                                feedback.isCorrect
                                    ? Icons.check_circle_rounded
                                    : Icons.cancel_rounded,
                                color: color,
                                size: 29,
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  feedback.title,
                                  style: TextStyle(
                                    color: color,
                                    fontSize: 21,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          if (feedback.picked.isNotEmpty) ...[
                            const SizedBox(height: 14),
                            Text(
                              '你的答案：${feedback.picked}',
                              style: const TextStyle(
                                color: Color(0xFFE8F0F1),
                                fontSize: 17,
                                height: 1.4,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                          const SizedBox(height: 14),
                          Text(
                            '正確答案：${feedback.answer}',
                            key: const Key('quiz-01-correct-answer'),
                            style: const TextStyle(
                              color: _green,
                              fontSize: 18,
                              height: 1.4,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
            SizedBox(height: compact ? 10 : 14),
            _PrimaryButton(
              key: const Key('quiz-01-next'),
              label: controller.index == controller.total - 1 ? '完成測驗' : '下一題',
              icon: Icons.arrow_forward_rounded,
              onPressed: onNext,
            ),
          ],
        );
      },
    );
  }
}

class _PrimaryButton extends StatelessWidget {
  const _PrimaryButton({
    required this.label,
    required this.icon,
    required this.onPressed,
    this.enabled = true,
    super.key,
  });

  final String label;
  final IconData icon;
  final VoidCallback onPressed;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 440),
      child: FilledButton.icon(
        onPressed: enabled ? onPressed : null,
        icon: Icon(icon),
        label: Text(label),
        style: FilledButton.styleFrom(
          minimumSize: const Size.fromHeight(56),
          backgroundColor: _blueDark,
          disabledBackgroundColor: const Color(0xFF31454C),
          disabledForegroundColor: const Color(0xFF738990),
          foregroundColor: Colors.white,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
        ),
      ),
    );
  }
}

class _QuizResult extends StatelessWidget {
  const _QuizResult({
    required this.controller,
    required this.onClose,
    required this.onRestart,
    required this.onReview,
  });

  final Quiz01Controller controller;
  final VoidCallback onClose;
  final VoidCallback onRestart;
  final VoidCallback onReview;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(22, 12, 22, 18),
      child: Column(
        children: [
          Align(
            alignment: Alignment.centerLeft,
            child: IconButton(
              tooltip: '返回路線圖',
              onPressed: onClose,
              icon: const Icon(Icons.close_rounded, color: _softText, size: 30),
            ),
          ),
          const Spacer(),
          Container(
            width: 104,
            height: 104,
            decoration: BoxDecoration(
              color: _pink,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 5),
              boxShadow: const [
                BoxShadow(color: Color(0xFFA84280), offset: Offset(0, 8)),
              ],
            ),
            child: const Icon(
              Icons.auto_awesome_rounded,
              color: Colors.white,
              size: 60,
            ),
          ),
          const SizedBox(height: 28),
          Text(
            controller.isReviewMode ? '錯題重練完成！' : 'Quiz 01 完成！',
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            controller.mistakes == 0 ? '每句都排得準確，真了不起！' : '睇清楚句子次序，再重練錯題。',
            textAlign: TextAlign.center,
            style:
                const TextStyle(color: _softText, fontSize: 16, height: 1.35),
          ),
          const SizedBox(height: 28),
          Row(
            children: [
              _ResultStat(
                label: 'FIRST TRY',
                value: '${controller.score}/${controller.total}',
                color: _blue,
              ),
              const SizedBox(width: 10),
              _ResultStat(
                label: '錯題',
                value: '${controller.mistakes}',
                color: _red,
              ),
              const SizedBox(width: 10),
              _ResultStat(
                label: '準確率',
                value: '${controller.accuracy}%',
                color: _green,
              ),
            ],
          ),
          const Spacer(),
          if (controller.missedQuestions.isNotEmpty) ...[
            OutlinedButton.icon(
              onPressed: onReview,
              icon: const Icon(Icons.refresh_rounded),
              label: Text('重練 ${controller.missedQuestions.length} 條錯題'),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size.fromHeight(54),
                foregroundColor: _yellow,
                side: const BorderSide(color: _yellow, width: 2),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                textStyle: const TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
            const SizedBox(height: 12),
          ],
          _PrimaryButton(
            label: controller.isReviewMode ? '再重練一次' : '再玩一局',
            icon: Icons.replay_rounded,
            onPressed: onRestart,
          ),
          const SizedBox(height: 10),
          TextButton(
            onPressed: onClose,
            child: const Text(
              '返回路線圖',
              style: TextStyle(color: _softText, fontWeight: FontWeight.w800),
            ),
          ),
        ],
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
        height: 86,
        decoration: BoxDecoration(
          color: _panel,
          borderRadius: BorderRadius.circular(14),
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
                fontSize: 22,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              maxLines: 1,
              style: const TextStyle(
                color: _softText,
                fontSize: 11,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _LoadErrorScreen extends StatelessWidget {
  const _LoadErrorScreen({required this.onClose});

  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _ink,
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.error_outline_rounded, color: _red, size: 58),
                const SizedBox(height: 16),
                const Text(
                  '未能載入 Quiz 01 題庫。',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 18),
                _PrimaryButton(
                  label: '返回路線圖',
                  icon: Icons.arrow_back_rounded,
                  onPressed: onClose,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _DashedAnswerLinePainter extends CustomPainter {
  const _DashedAnswerLinePainter();

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF71858C)
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round;
    const dashWidth = 9.0;
    const gap = 7.0;
    final y = size.height - 10;
    var x = 2.0;
    while (x < size.width - 2) {
      canvas.drawLine(
        Offset(x, y),
        Offset(math.min(x + dashWidth, size.width - 2), y),
        paint,
      );
      x += dashWidth + gap;
    }
  }

  @override
  bool shouldRepaint(covariant _DashedAnswerLinePainter oldDelegate) => false;
}

class _SparkBurstPainter extends CustomPainter {
  const _SparkBurstPainter({required this.progress, required this.grand});

  final double progress;
  final bool grand;

  static const colors = [_blue, _yellow, _green, _red, _pink];

  @override
  void paint(Canvas canvas, Size size) {
    if (progress <= 0 || progress >= 1) return;
    final count = grand ? 38 : 22;
    final center = Offset(size.width / 2, size.height * (grand ? .42 : .34));
    final fade = 1 - Curves.easeIn.transform(progress);
    final distance = Curves.easeOutCubic.transform(progress) *
        math.min(size.width, size.height) *
        (grand ? .56 : .38);

    for (var index = 0; index < count; index++) {
      final angle = (math.pi * 2 * index / count) + (index % 3) * .09;
      final radius = distance * (.62 + (index % 5) * .095);
      final point = center + Offset(math.cos(angle), math.sin(angle)) * radius;
      final paint = Paint()
        ..color = colors[index % colors.length].withValues(alpha: fade);
      canvas.save();
      canvas.translate(point.dx, point.dy);
      canvas.rotate(angle + progress * 2.5);
      canvas.drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromCenter(
            center: Offset.zero,
            width: index.isEven ? 7 : 4,
            height: index.isEven ? 14 : 9,
          ),
          const Radius.circular(2),
        ),
        paint,
      );
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(covariant _SparkBurstPainter oldDelegate) {
    return oldDelegate.progress != progress || oldDelegate.grand != grand;
  }
}
