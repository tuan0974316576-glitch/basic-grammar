import 'dart:async';

import 'package:flutter/material.dart';

import '../../../core/app_palette.dart';
import '../../../core/app_sfx.dart';
import '../../../core/widgets/stationery_frame.dart';
import '../shared/lesson_ui.dart';
import 'quiz_01_controller.dart';
import 'quiz_01_question.dart';
import 'quiz_01_repository.dart';

const _ink = AppPalette.background;
const _text = AppPalette.ink;
const _panel = AppPalette.softPrimary;
const _blue = AppPalette.primary;
const _green = AppPalette.correctDark;
const _red = AppPalette.dangerDark;
const _pink = AppPalette.pink;
const _softText = AppPalette.muted;

class Quiz01Screen extends StatefulWidget {
  const Quiz01Screen({
    this.controller,
    this.repository = const Quiz01Repository(),
    this.sfx,
    this.onQuestionCorrect,
    super.key,
  });

  final Quiz01Controller? controller;
  final Quiz01Repository repository;
  final LessonSfx? sfx;
  final VoidCallback? onQuestionCorrect;

  @override
  State<Quiz01Screen> createState() => _Quiz01ScreenState();
}

class _Quiz01ScreenState extends State<Quiz01Screen> {
  Quiz01Controller? _controller;
  Object? _loadError;
  int _celebration = 0;

  LessonSfx get _sfx => widget.sfx ?? AppSfx.instance;

  @override
  void initState() {
    super.initState();
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
      setState(() => _celebration += 1);
    }
    if (event == Quiz01Event.questionCorrect) {
      widget.onQuestionCorrect?.call();
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
        backgroundColor: AppPalette.background,
        body: Center(child: CircularProgressIndicator(color: _blue)),
      );
    }

    return Scaffold(
      backgroundColor: AppPalette.background,
      body: SafeArea(
        child: Stack(
          children: [
            if (controller.isComplete)
              LessonResultScreen(
                lessonLabel: 'Quiz 01',
                score: controller.score,
                total: controller.total,
                mistakes: controller.mistakes,
                reviewMode: controller.isReviewMode,
                sfx: _sfx,
                onClose: _closeQuiz,
                onRestart: _restart,
                onReview:
                    controller.missedQuestions.isEmpty ? null : _reviewMistakes,
              )
            else
              _QuestionScreen(
                controller: controller,
                onClose: _closeQuiz,
                onEvent: _playEvent,
                onNext: _nextQuestion,
              ),
            LessonCelebrationOverlay(
              trigger: _celebration,
              grand: controller.isComplete,
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
      padding: const EdgeInsets.all(6),
      child: StationeryFrame(
        padding: EdgeInsets.zero,
        radius: 26,
        ringWidth: 6,
        shadowDepth: 8,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(10, 4, 10, 6),
          child: Column(
            children: [
              _QuizProgressHeader(controller: controller, onClose: onClose),
              const SizedBox(height: 8),
              Expanded(
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
            ],
          ),
        ),
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
    return LessonHeader(
      lessonLabel: 'QUIZ 01',
      title: '重組英文句子',
      progress: controller.progress,
      questionLabel: '${controller.index + 1}/${controller.total}',
      onClose: onClose,
    );
  }
}

class _ActiveQuestion extends StatefulWidget {
  const _ActiveQuestion({
    required this.controller,
    required this.onEvent,
    super.key,
  });

  final Quiz01Controller controller;
  final ValueChanged<Quiz01Event> onEvent;

  @override
  State<_ActiveQuestion> createState() => _ActiveQuestionState();
}

class _QuizFlight {
  const _QuizFlight({
    required this.block,
    required this.start,
    required this.end,
  });

  final Quiz01WordBlock block;
  final Offset start;
  final Offset end;
}

class _ActiveQuestionState extends State<_ActiveQuestion>
    with SingleTickerProviderStateMixin {
  late final AnimationController _flightController;
  final GlobalKey _stageKey = GlobalKey();
  final GlobalKey _answerLineKey = GlobalKey();
  final GlobalKey _flightTargetKey = GlobalKey();
  final Map<String, GlobalKey> _bankKeys = {};
  _QuizFlight? _flight;
  String? _hiddenBlockId;

  @override
  void initState() {
    super.initState();
    _flightController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 420),
    )..addStatusListener((status) {
        if (status == AnimationStatus.completed && mounted) {
          setState(() {
            _flight = null;
            _hiddenBlockId = null;
          });
          _flightController.reset();
        }
      });
  }

  @override
  void dispose() {
    _flightController.dispose();
    super.dispose();
  }

  void _tapBankBlock(Quiz01WordBlock block) {
    if (_flight != null) return;
    final sourceContext = _bankKeys[block.id]?.currentContext;
    final sourceBox = sourceContext?.findRenderObject() as RenderBox?;
    final stageBox = _stageKey.currentContext?.findRenderObject() as RenderBox?;
    if (sourceBox == null || stageBox == null || !sourceBox.hasSize) {
      widget.onEvent(widget.controller.toggleBlock(block.id));
      return;
    }

    final startGlobal = sourceBox.localToGlobal(Offset.zero);
    widget.onEvent(widget.controller.toggleBlock(block.id));
    setState(() {
      _hiddenBlockId = block.id;
      final start = stageBox.globalToLocal(startGlobal);
      _flight = _QuizFlight(block: block, start: start, end: start);
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || _flight?.block.id != block.id) return;
      final targetContext = _flightTargetKey.currentContext;
      final targetBox = targetContext?.findRenderObject() as RenderBox?;
      final latestStageBox =
          _stageKey.currentContext?.findRenderObject() as RenderBox?;
      if (targetBox == null || latestStageBox == null || !targetBox.hasSize) {
        _flightController.forward(from: 0);
        return;
      }
      final targetGlobal = targetBox.localToGlobal(Offset.zero);
      setState(() {
        final current = _flight;
        if (current != null) {
          _flight = _QuizFlight(
            block: current.block,
            start: current.start,
            end: latestStageBox.globalToLocal(targetGlobal),
          );
        }
      });
      _flightController.forward(from: 0);
    });
  }

  @override
  Widget build(BuildContext context) {
    final controller = widget.controller;
    return LayoutBuilder(
      builder: (context, constraints) {
        final compact = constraints.maxHeight < 500;
        final selected = controller.selectedBlocks
            .where((block) => block.id != _hiddenBlockId)
            .toList(growable: false);
        final flight = _flight;
        return Stack(
          key: _stageKey,
          clipBehavior: Clip.none,
          children: [
            Column(
              children: [
                SizedBox(
                  height: compact ? 58 : 84,
                  child: OriginalDashedSurface(
                    padding: EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: compact ? 7 : 10,
                    ),
                    radius: 20,
                    strokeWidth: 3,
                    backgroundColor: AppPalette.paper,
                    borderColor: AppPalette.primary,
                    shadowColor: const Color(0xFFBDE0E1),
                    shadowDepth: 4,
                    child: Center(
                      child: Text(
                        controller.currentQuestion.zh,
                        key: const Key('quiz-01-chinese-prompt'),
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: _text,
                          fontSize: compact ? 21 : 25,
                          height: 1.2,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ),
                ),
                _AnswerLine(
                  key: _answerLineKey,
                  blocks: selected,
                  flightBlock: flight?.block,
                  flightTargetKey: _flightTargetKey,
                  compact: compact,
                  onTap: (block) => widget.onEvent(
                    controller.toggleBlock(block.id),
                  ),
                ),
                SizedBox(height: compact ? 6 : 10),
                Expanded(
                  child: OriginalDashedSurface(
                    key: const Key('quiz-01-word-bank'),
                    backgroundColor: AppPalette.softSecondary,
                    borderColor: AppPalette.secondaryDark,
                    strokeWidth: 3,
                    radius: 22,
                    shadowColor: const Color(0xFFFFE7A3),
                    shadowDepth: 5,
                    padding: EdgeInsets.all(compact ? 10 : 14),
                    child: LayoutBuilder(
                      builder: (context, bankConstraints) =>
                          SingleChildScrollView(
                        physics: const BouncingScrollPhysics(),
                        child: SizedBox(
                          width: bankConstraints.maxWidth,
                          child: Wrap(
                            alignment: WrapAlignment.center,
                            spacing: compact ? 7 : 10,
                            runSpacing: compact ? 8 : 10,
                            children: [
                              for (var index = 0;
                                  index < controller.availableBlocks.length;
                                  index++)
                                Builder(
                                  builder: (context) {
                                    final block =
                                        controller.availableBlocks[index];
                                    final key = _bankKeys.putIfAbsent(
                                      block.id,
                                      GlobalKey.new,
                                    );
                                    return _WordBlock(
                                      key: key,
                                      block: block,
                                      compact: compact,
                                      onTap: () => _tapBankBlock(block),
                                    );
                                  },
                                ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                SizedBox(
                  height: compact ? 16 : 29,
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
                  onPressed: () => widget.onEvent(controller.submit()),
                  enabled: controller.canSubmit,
                ),
              ],
            ),
            if (flight != null)
              Positioned(
                left: 0,
                top: 0,
                child: IgnorePointer(
                  child: AnimatedBuilder(
                    animation: _flightController,
                    builder: (context, child) {
                      final offset = Offset.lerp(
                        flight.start,
                        flight.end,
                        Curves.easeOutCubic.transform(_flightController.value),
                      )!;
                      return Transform.translate(offset: offset, child: child);
                    },
                    child: _WordBlock(
                      key: ValueKey('quiz-01-flight-${flight.block.id}'),
                      block: flight.block,
                      compact: compact,
                      selected: true,
                      onTap: () {},
                    ),
                  ),
                ),
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
    required this.flightBlock,
    required this.flightTargetKey,
    required this.compact,
    required this.onTap,
    super.key,
  });

  final List<Quiz01WordBlock> blocks;
  final Quiz01WordBlock? flightBlock;
  final GlobalKey flightTargetKey;
  final bool compact;
  final ValueChanged<Quiz01WordBlock> onTap;

  @override
  Widget build(BuildContext context) {
    return OriginalDashedSurface(
      key: const Key('quiz-01-answer-line'),
      backgroundColor: const Color(0xFFF8F9FA),
      borderColor: const Color(0xFFCFD4DA),
      strokeWidth: 3,
      radius: 20,
      shadowColor: const Color(0xFFECEFF3),
      shadowDepth: 4,
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 8 : 14,
        vertical: compact ? 8 : 12,
      ),
      child: ConstrainedBox(
        constraints: BoxConstraints(minHeight: compact ? 54 : 76),
        child: CustomPaint(
          painter: const _DottedAnswerPainter(),
          child: Padding(
            padding: EdgeInsets.only(bottom: compact ? 10 : 12),
            child: Align(
              alignment: Alignment.bottomLeft,
              child: Wrap(
                spacing: compact ? 6 : 8,
                runSpacing: compact ? 7 : 9,
                children: [
                  for (var index = 0; index < blocks.length; index++)
                    KeyedSubtree(
                      key: ValueKey('answer-${blocks[index].id}'),
                      child: _WordBlock(
                        block: blocks[index],
                        compact: compact,
                        selected: true,
                        onTap: () => onTap(blocks[index]),
                      ),
                    ),
                  if (flightBlock case final block?)
                    Opacity(
                      opacity: 0,
                      child: IgnorePointer(
                        child: KeyedSubtree(
                          key: ValueKey('quiz-01-flight-target-${block.id}'),
                          child: _WordBlock(
                            key: flightTargetKey,
                            block: block,
                            compact: compact,
                            selected: true,
                            onTap: () {},
                          ),
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

class _DottedAnswerPainter extends CustomPainter {
  const _DottedAnswerPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFFBFC4CA)
      ..style = PaintingStyle.fill;
    const radius = 2.0;
    const gap = 12.0;
    final y = size.height - radius - 1;
    for (var x = 0.0; x < size.width; x += gap) {
      canvas.drawCircle(Offset(x + radius, y), radius, paint);
    }
  }

  @override
  bool shouldRepaint(covariant _DottedAnswerPainter oldDelegate) => false;
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

  double _pillWidth(BuildContext context) {
    final fontSize = compact ? 14.0 : 17.0;
    final painter = TextPainter(
      text: TextSpan(
        text: block.text,
        style: TextStyle(
          fontFamily: DefaultTextStyle.of(context).style.fontFamily,
          fontSize: fontSize,
          fontWeight: FontWeight.w900,
        ),
      ),
      maxLines: 1,
      textDirection: Directionality.of(context),
    )..layout();
    final horizontalPadding = compact ? 20.0 : 28.0;
    return (painter.width + horizontalPadding).clamp(48.0, 150.0);
  }

  static int _wordClass(String value) {
    final word = value.trim().toLowerCase();
    const adverbs = {
      'always',
      'often',
      'never',
      'sometimes',
      'usually',
      'very',
      'now',
      'here',
      'there',
      'today',
      'well',
    };
    const verbs = {
      'am',
      'is',
      'are',
      'was',
      'were',
      'be',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'go',
      'goes',
      'went',
      'eat',
      'eats',
      'ate',
      'play',
      'plays',
      'played',
      'draw',
      'draws',
      'drew',
      'write',
      'writes',
      'wrote',
      'read',
      'reads',
      'run',
      'runs',
      'make',
      'makes',
      'see',
      'sees',
      'like',
      'likes',
      'want',
      'wants',
    };
    const other = {
      'a',
      'an',
      'the',
      'i',
      'you',
      'he',
      'she',
      'it',
      'we',
      'they',
      'my',
      'your',
      'his',
      'her',
      'our',
      'their',
      'and',
      'but',
      'in',
      'on',
      'at',
      'to',
      'happy',
      'big',
      'small',
      'good',
      'new',
    };
    if (adverbs.contains(word) || word.endsWith('ly')) return 2;
    if (verbs.contains(word) || word.endsWith('ed') || word.endsWith('ing')) {
      return 1;
    }
    if (other.contains(word)) return 3;
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final border = switch (_wordClass(block.text)) {
      0 => AppPalette.secondaryDark,
      1 => AppPalette.primary,
      2 => const Color(0xFF4D96FF),
      _ => AppPalette.purple,
    };
    const color = Colors.white;
    return SizedBox(
      key: ValueKey('quiz-word-pill-${block.id}'),
      width: _pillWidth(context),
      height: compact ? 36 : 44,
      child: Semantics(
        button: true,
        label: selected ? '${block.text}，已放到答案' : block.text,
        child: Material(
          color: color,
          borderRadius: BorderRadius.circular(999),
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(999),
            child: CustomPaint(
              foregroundPainter: _WordBlockDashedPainter(color: border),
              child: Padding(
                padding: EdgeInsets.symmetric(
                  horizontal: compact ? 8 : 12,
                  vertical: compact ? 4 : 7,
                ),
                child: Center(
                  child: Text(
                    block.text,
                    maxLines: 1,
                    overflow: TextOverflow.visible,
                    style: TextStyle(
                      color: selected ? AppPalette.primaryDark : AppPalette.ink,
                      fontSize: compact ? 14 : 17,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _WordBlockDashedPainter extends CustomPainter {
  const _WordBlockDashedPainter({required this.color});

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final rect = RRect.fromRectAndRadius(
      Offset.zero & size,
      Radius.circular(size.height / 2),
    );
    final path = Path()..addRRect(rect);
    const layers = [
      (alpha: 0.82, width: 2.4, y: 0.0, dash: 8.0, gap: 14.0),
      (alpha: 0.34, width: 1.3, y: 0.8, dash: 9.0, gap: 16.0),
      (alpha: 0.22, width: 0.9, y: -0.7, dash: 6.0, gap: 11.0),
    ];
    for (final layer in layers) {
      final paint = Paint()
        ..color = color.withValues(alpha: layer.alpha)
        ..style = PaintingStyle.stroke
        ..strokeWidth = layer.width
        ..strokeCap = StrokeCap.round;
      canvas.save();
      canvas.translate(0, layer.y);
      for (final metric in path.computeMetrics()) {
        var distance = 0.0;
        while (distance < metric.length) {
          canvas.drawPath(
            metric.extractPath(distance, distance + layer.dash),
            paint,
          );
          distance += layer.dash + layer.gap;
        }
      }
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(covariant _WordBlockDashedPainter oldDelegate) =>
      oldDelegate.color != color;
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
    final frameColor = feedback.isCorrect ? AppPalette.secondaryDark : color;
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
                    color: _text,
                    fontSize: compact ? 22 : 26,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: OriginalDashedSurface(
                  key: const Key('quiz-01-feedback-panel'),
                  backgroundColor: feedback.isCorrect
                      ? AppPalette.softSecondary
                      : Colors.white,
                  borderColor: frameColor,
                  strokeWidth: 4,
                  radius: 22,
                  shadowColor: feedback.isCorrect
                      ? const Color(0xFFFFE7A3)
                      : color.withValues(alpha: 0.2),
                  shadowDepth: 5,
                  padding: EdgeInsets.all(compact ? 14 : 18),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        children: [
                          Icon(
                            feedback.isCorrect
                                ? Icons.check_circle_rounded
                                : Icons.cancel_rounded,
                            color: color,
                            size: 28,
                          ),
                          const SizedBox(width: 9),
                          Expanded(
                            child: Text(
                              feedback.title,
                              style: TextStyle(
                                color: color,
                                fontSize: compact ? 18 : 20,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                        ],
                      ),
                      if (feedback.picked.isNotEmpty) ...[
                        const SizedBox(height: 10),
                        Text(
                          '你的答案：${feedback.picked}',
                          style: const TextStyle(
                            color: _text,
                            fontSize: 16,
                            height: 1.35,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                      const SizedBox(height: 10),
                      OriginalDashedSurface(
                        backgroundColor: Colors.white,
                        borderColor: AppPalette.primary,
                        strokeWidth: 2,
                        radius: 16,
                        shadowColor: const Color(0xFFBDE0E1),
                        shadowDepth: 3,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 10,
                        ),
                        child: Text(
                          '正確答案：${feedback.answer}',
                          key: const Key('quiz-01-correct-answer'),
                          style: const TextStyle(
                            color: AppPalette.primaryDark,
                            fontSize: 16,
                            height: 1.3,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ],
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
      child: SizedBox(
        width: double.infinity,
        child: ElevatedButton.icon(
          onPressed: enabled ? onPressed : null,
          icon: Icon(icon),
          label: Text(label),
          style: ElevatedButton.styleFrom(
            minimumSize: const Size.fromHeight(50),
            backgroundColor: AppPalette.secondary,
            disabledBackgroundColor: const Color(0xFFF3F3F3),
            disabledForegroundColor: const Color(0xFFAAAAAA),
            foregroundColor: const Color(0xFF5D4037),
            shadowColor: AppPalette.secondaryDark,
            elevation: 4,
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(999)),
            textStyle:
                const TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
          ),
        ),
      ),
    );
  }
}

// ignore: unused_element
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
              color: _text,
              size: 60,
            ),
          ),
          const SizedBox(height: 28),
          Text(
            controller.isReviewMode ? '錯題重練完成！' : 'Quiz 01 完成！',
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: _text,
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
                foregroundColor: AppPalette.secondaryDark,
                side: const BorderSide(
                  color: AppPalette.secondaryDark,
                  width: 2,
                ),
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
                    color: _text,
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
