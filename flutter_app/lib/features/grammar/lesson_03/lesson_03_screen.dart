import 'dart:async';

import 'package:flutter/material.dart';

import '../../../core/app_palette.dart';
import '../../../core/app_sfx.dart';
import '../../../core/widgets/stationery_frame.dart';
import '../shared/lesson_ui.dart';
import 'lesson_03_controller.dart';
import 'lesson_03_repository.dart';

class Lesson03Screen extends StatefulWidget {
  const Lesson03Screen(
      {this.repository = const Lesson03Repository(), this.sfx, super.key});

  final Lesson03Repository repository;
  final LessonSfx? sfx;

  @override
  State<Lesson03Screen> createState() => _Lesson03ScreenState();
}

class _Lesson03ScreenState extends State<Lesson03Screen> {
  Lesson03Controller? _controller;
  Object? _loadError;
  int _celebration = 0;

  LessonSfx get _sfx => widget.sfx ?? AppSfx.instance;

  @override
  void initState() {
    super.initState();
    unawaited(_load());
  }

  @override
  void dispose() {
    _controller?.removeListener(_refresh);
    _controller?.dispose();
    super.dispose();
  }

  void _refresh() {
    if (mounted) setState(() {});
  }

  Future<void> _load() async {
    try {
      final questions = await widget.repository.loadQuestions();
      if (!mounted) return;
      final controller = Lesson03Controller(allQuestions: questions)
        ..addListener(_refresh);
      setState(() => _controller = controller);
    } catch (error) {
      if (!mounted) return;
      setState(() => _loadError = error);
    }
  }

  void _handle(Lesson03Event event) {
    final cue = switch (event) {
      Lesson03Event.selectionChanged => SfxCue.step,
      Lesson03Event.invalidInput => SfxCue.wrong,
      Lesson03Event.wrong => SfxCue.wrong,
      Lesson03Event.questionCorrect => SfxCue.correct,
      Lesson03Event.nextQuestion => SfxCue.next,
      Lesson03Event.completed => SfxCue.complete,
      Lesson03Event.ignored => null,
    };
    if (cue != null) unawaited(_sfx.play(cue));
    if (event == Lesson03Event.questionCorrect) {
      setState(() => _celebration += 1);
    } else if (event == Lesson03Event.completed) {
      setState(() => _celebration += 1);
    }
  }

  void _close() {
    unawaited(_sfx.play(SfxCue.click));
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    if (_loadError != null) {
      return LessonLoadError(lessonLabel: 'Lesson 03', onClose: _close);
    }
    final controller = _controller;
    if (controller == null) {
      return const Scaffold(
        backgroundColor: AppPalette.background,
        body: Center(
          child: CircularProgressIndicator(color: AppPalette.primary),
        ),
      );
    }
    if (controller.isComplete) {
      return Stack(
        children: [
          LessonResultScreen(
            lessonLabel: 'Lesson 03',
            score: controller.score,
            total: controller.total,
            mistakes: controller.mistakes,
            reviewMode: controller.isReviewMode,
            onClose: _close,
            onRestart: () {
              controller.restart();
              unawaited(_sfx.play(SfxCue.start));
            },
            onReview: controller.missedQuestions.isEmpty
                ? null
                : () {
                    controller.reviewMistakes();
                    unawaited(_sfx.play(SfxCue.start));
                  },
          ),
          LessonCelebrationOverlay(trigger: _celebration, grand: true),
        ],
      );
    }

    final feedback = controller.feedback;
    return Stack(
      children: [
        LessonPageScaffold(
          lessonLabel: 'LESSON 03',
          title: '何謂句子',
          progress: controller.progress,
          questionLabel: '${controller.index + 1}/${controller.total}',
          onClose: _close,
          body: Column(
            children: [
              const Text(
                '拖拉並放手，逐句畫上不同顏色的底線。',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: AppPalette.primaryDark,
                  fontSize: 15,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 12),
              StationeryFrame(
                radius: 18,
                ringWidth: 3,
                shadowDepth: 3,
                padding: const EdgeInsets.fromLTRB(14, 20, 14, 22),
                backgroundColor: AppPalette.softCorrect,
                borderColor: AppPalette.correct,
                child: _UnderlineTokens(
                  key: ValueKey(controller.currentQuestion.id),
                  controller: controller,
                  onEvent: _handle,
                ),
              ),
              const SizedBox(height: 12),
              if (feedback != null)
                Expanded(
                  child: SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    child: LessonFeedbackCard(
                      correct: feedback.isCorrect,
                      title: feedback.title,
                      lines: feedback.answerLines,
                    ),
                  ),
                )
              else
                const Spacer(),
            ],
          ),
          bottom: controller.isResolved
              ? LessonPrimaryButton(
                  key: const Key('lesson-03-next'),
                  label:
                      controller.index == controller.total - 1 ? '完成課堂' : '下一題',
                  onPressed: () => _handle(controller.next()),
                )
              : Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: controller.canSubmit
                            ? () => _handle(controller.reset())
                            : null,
                        icon: const Icon(Icons.refresh_rounded),
                        label: const Text('重畫'),
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size.fromHeight(54),
                          foregroundColor: AppPalette.primaryDark,
                          side: const BorderSide(
                            color: AppPalette.primary,
                            width: 2,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      flex: 2,
                      child: LessonPrimaryButton(
                        key: const Key('lesson-03-confirm'),
                        label: '確定',
                        icon: Icons.check_rounded,
                        onPressed: controller.canSubmit
                            ? () => _handle(controller.submit())
                            : null,
                      ),
                    ),
                  ],
                ),
        ),
        LessonCelebrationOverlay(trigger: _celebration),
      ],
    );
  }
}

class _UnderlineTokens extends StatefulWidget {
  const _UnderlineTokens(
      {required this.controller, required this.onEvent, super.key});

  final Lesson03Controller controller;
  final ValueChanged<Lesson03Event> onEvent;

  @override
  State<_UnderlineTokens> createState() => _UnderlineTokensState();
}

class _UnderlineTokensState extends State<_UnderlineTokens> {
  late List<GlobalKey> _tokenKeys;

  @override
  void initState() {
    super.initState();
    _tokenKeys = _keysForQuestion();
  }

  @override
  void didUpdateWidget(covariant _UnderlineTokens oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.controller.currentQuestion.id !=
        widget.controller.currentQuestion.id) {
      _tokenKeys = _keysForQuestion();
    }
  }

  List<GlobalKey> _keysForQuestion() {
    return List.generate(
      widget.controller.currentQuestion.tokens.length,
      (_) => GlobalKey(),
    );
  }

  int? _tokenAt(Offset globalPosition) {
    for (var index = 0; index < _tokenKeys.length; index++) {
      final context = _tokenKeys[index].currentContext;
      final box = context?.findRenderObject() as RenderBox?;
      if (box == null || !box.hasSize) continue;
      final rect = box.localToGlobal(Offset.zero) & box.size;
      if (rect.inflate(5).contains(globalPosition)) return index;
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final tokens = widget.controller.currentQuestion.tokens;
    return Wrap(
      alignment: WrapAlignment.center,
      spacing: 8,
      runSpacing: 14,
      children: [
        for (var index = 0; index < tokens.length; index++)
          GestureDetector(
            key: _tokenKeys[index],
            behavior: HitTestBehavior.opaque,
            onPanStart: (_) => widget.controller.startDrag(index),
            onPanUpdate: (details) {
              final token = _tokenAt(details.globalPosition);
              if (token != null) widget.controller.extendDrag(token);
            },
            onPanEnd: (_) => widget.onEvent(widget.controller.finishDrag()),
            onPanCancel: widget.controller.cancelDrag,
            child: _CrayonWord(
              word: tokens[index],
              colorIndex: widget.controller.displayGroupFor(index),
              draft: widget.controller.isDraftToken(index),
            ),
          ),
      ],
    );
  }
}

class _CrayonWord extends StatelessWidget {
  const _CrayonWord({
    required this.word,
    required this.colorIndex,
    required this.draft,
  });

  final String word;
  final int? colorIndex;
  final bool draft;

  static const colors = [
    AppPalette.primary,
    AppPalette.pink,
    AppPalette.secondaryDark,
    AppPalette.purple,
  ];

  @override
  Widget build(BuildContext context) {
    final color =
        colorIndex == null ? null : colors[colorIndex! % colors.length];
    return CustomPaint(
      foregroundPainter: color == null
          ? null
          : _CrayonUnderlinePainter(color: color, draft: draft),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(2, 2, 2, 8),
        child: Text(
          word,
          style: const TextStyle(
            color: AppPalette.ink,
            fontSize: 21,
            height: 1.25,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
    );
  }
}

class _CrayonUnderlinePainter extends CustomPainter {
  const _CrayonUnderlinePainter({required this.color, required this.draft});

  final Color color;
  final bool draft;

  @override
  void paint(Canvas canvas, Size size) {
    final baseY = size.height - 3;
    for (var index = 0; index < 3; index++) {
      final paint = Paint()
        ..color = color.withValues(alpha: draft ? 0.42 : 0.7 - index * 0.12)
        ..strokeWidth = 3.2 - index * 0.45
        ..strokeCap = StrokeCap.round
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 0.55);
      canvas.drawLine(
        Offset(1 + index * 0.7, baseY + index * 0.65),
        Offset(size.width - 1 - index * 0.5, baseY + index * 0.35),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _CrayonUnderlinePainter oldDelegate) {
    return color != oldDelegate.color || draft != oldDelegate.draft;
  }
}
