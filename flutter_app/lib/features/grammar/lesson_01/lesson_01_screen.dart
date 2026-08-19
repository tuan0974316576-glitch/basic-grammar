import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../../core/app_sfx.dart';
import 'lesson_01_controller.dart';
import 'lesson_01_question.dart';
import 'lesson_01_repository.dart';

const _ink = Color(0xFF101C20);
const _panel = Color(0xFF17262B);
const _blue = Color(0xFF25B4F3);
const _blueDark = Color(0xFF1178A9);
const _green = Color(0xFF4BC67A);
const _red = Color(0xFFFF6272);
const _yellow = Color(0xFFFFC928);
const _softText = Color(0xFFAFC4C9);

class Lesson01Screen extends StatefulWidget {
  const Lesson01Screen({
    this.controller,
    this.repository = const Lesson01Repository(),
    this.sfx,
    super.key,
  });

  final Lesson01Controller? controller;
  final Lesson01Repository repository;
  final LessonSfx? sfx;

  @override
  State<Lesson01Screen> createState() => _Lesson01ScreenState();
}

class _Lesson01ScreenState extends State<Lesson01Screen>
    with SingleTickerProviderStateMixin {
  Lesson01Controller? _controller;
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
      _attachController(Lesson01Controller(allQuestions: questions));
      setState(() {});
    } catch (error) {
      if (!mounted) return;
      setState(() => _loadError = error);
    }
  }

  void _attachController(Lesson01Controller controller) {
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

  void _playEvent(Lesson01Event event) {
    final cue = switch (event) {
      Lesson01Event.selectionChanged => SfxCue.step,
      Lesson01Event.correctStep => SfxCue.correct,
      Lesson01Event.wrong => SfxCue.wrong,
      Lesson01Event.questionCorrect => SfxCue.correct,
      Lesson01Event.nextQuestion => SfxCue.next,
      Lesson01Event.completed => SfxCue.complete,
      Lesson01Event.ignored => null,
    };
    if (cue != null) unawaited(_sfx.play(cue));
    if (event == Lesson01Event.questionCorrect ||
        event == Lesson01Event.completed) {
      _burstController.forward(from: 0);
    }
  }

  void _closeLesson() {
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
      return _LoadErrorScreen(onClose: _closeLesson);
    }
    if (controller == null) {
      return const Scaffold(
        backgroundColor: _ink,
        body: Center(child: CircularProgressIndicator(color: _blue)),
      );
    }

    return PopScope(
      canPop: true,
      child: Scaffold(
        backgroundColor: _ink,
        body: SafeArea(
          child: Stack(
            children: [
              if (controller.isComplete)
                _LessonResult(
                  controller: controller,
                  onClose: _closeLesson,
                  onRestart: _restart,
                  onReview: _reviewMistakes,
                )
              else
                _QuestionScreen(
                  controller: controller,
                  onClose: _closeLesson,
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

  final Lesson01Controller controller;
  final VoidCallback onClose;
  final ValueChanged<Lesson01Event> onEvent;
  final VoidCallback onNext;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(18, 8, 18, 12),
      child: Column(
        children: [
          _LessonProgressHeader(controller: controller, onClose: onClose),
          const SizedBox(height: 12),
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
                      key: ValueKey(
                        '${controller.index}-${controller.stage.name}',
                      ),
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

class _LessonProgressHeader extends StatelessWidget {
  const _LessonProgressHeader({
    required this.controller,
    required this.onClose,
  });

  final Lesson01Controller controller;
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 44,
      child: Row(
        children: [
          IconButton(
            tooltip: '離開課堂',
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
                  color: _blue,
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

  final Lesson01Controller controller;
  final ValueChanged<Lesson01Event> onEvent;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final compact = constraints.maxHeight < 560;
        return Column(
          children: [
            Expanded(
              flex: compact ? 4 : 5,
              child: _QuestionPrompt(
                question: controller.currentQuestion,
                stage: controller.stage,
                compact: compact,
              ),
            ),
            if (controller.feedback case final feedback?) ...[
              _CompactFeedback(feedback: feedback),
              SizedBox(height: compact ? 8 : 14),
            ],
            Expanded(
              flex: compact ? 6 : 7,
              child: _StageControls(
                controller: controller,
                onEvent: onEvent,
                compact: compact,
              ),
            ),
          ],
        );
      },
    );
  }
}

class _QuestionPrompt extends StatelessWidget {
  const _QuestionPrompt({
    required this.question,
    required this.stage,
    required this.compact,
  });

  final Lesson01Question question;
  final Lesson01Stage stage;
  final bool compact;

  String get instruction => switch (stage) {
        Lesson01Stage.verbChoice => '這句中文有沒有主動動詞？',
        Lesson01Stage.actionVerb => '揀出句子中的主動動詞',
        Lesson01Stage.needsBe => '英文句子要不要加 is / am / are？',
        Lesson01Stage.beForm => '揀正確的 is / am / are',
        _ => '',
      };

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          instruction,
          textAlign: TextAlign.center,
          style: const TextStyle(
            color: _softText,
            fontSize: 15,
            fontWeight: FontWeight.w800,
          ),
        ),
        SizedBox(height: compact ? 10 : 18),
        Text(
          question.zh,
          key: const Key('lesson-01-chinese-prompt'),
          textAlign: TextAlign.center,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            color: Colors.white,
            fontSize: compact ? 23 : 27,
            height: 1.25,
            fontWeight: FontWeight.w900,
          ),
        ),
        SizedBox(height: compact ? 12 : 20),
        Container(
          width: math.min(240, MediaQuery.sizeOf(context).width * 0.58),
          height: 3,
          decoration: BoxDecoration(
            color: const Color(0xFF35515A),
            borderRadius: BorderRadius.circular(3),
          ),
        ),
      ],
    );
  }
}

class _StageControls extends StatelessWidget {
  const _StageControls({
    required this.controller,
    required this.onEvent,
    required this.compact,
  });

  final Lesson01Controller controller;
  final ValueChanged<Lesson01Event> onEvent;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return switch (controller.stage) {
      Lesson01Stage.verbChoice => _TickCrossChoices(
          compact: compact,
          onTick: () => onEvent(controller.answerVerbChoice(true)),
          onCross: () => onEvent(controller.answerVerbChoice(false)),
        ),
      Lesson01Stage.actionVerb => _VerbTokenChoices(
          controller: controller,
          compact: compact,
          onEvent: onEvent,
        ),
      Lesson01Stage.needsBe => _NeedsBeChoices(
          compact: compact,
          onChoice: (choice) => onEvent(controller.answerNeedsBe(choice)),
        ),
      Lesson01Stage.beForm => _BeFormChoices(
          compact: compact,
          onChoice: (form) => onEvent(controller.answerBeForm(form)),
        ),
      _ => const SizedBox.shrink(),
    };
  }
}

class _TickCrossChoices extends StatelessWidget {
  const _TickCrossChoices({
    required this.compact,
    required this.onTick,
    required this.onCross,
  });

  final bool compact;
  final VoidCallback onTick;
  final VoidCallback onCross;

  @override
  Widget build(BuildContext context) {
    final size = compact ? 96.0 : 116.0;
    return Center(
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _SymbolChoice(
            key: const Key('verb-choice-tick'),
            size: size,
            color: _green,
            icon: Icons.check_rounded,
            label: '有動詞',
            onTap: onTick,
          ),
          SizedBox(width: compact ? 28 : 42),
          _SymbolChoice(
            key: const Key('verb-choice-cross'),
            size: size,
            color: _red,
            icon: Icons.close_rounded,
            label: '沒有動詞',
            onTap: onCross,
          ),
        ],
      ),
    );
  }
}

class _SymbolChoice extends StatelessWidget {
  const _SymbolChoice({
    required this.size,
    required this.color,
    required this.icon,
    required this.label,
    required this.onTap,
    super.key,
  });

  final double size;
  final Color color;
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: label,
      child: Material(
        color: color,
        borderRadius: BorderRadius.circular(28),
        elevation: 0,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(28),
          child: Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(28),
              border: Border.all(
                  color: Colors.white.withValues(alpha: 0.7), width: 4),
              boxShadow: [
                BoxShadow(
                  color: color.withValues(alpha: 0.38),
                  offset: const Offset(0, 7),
                  blurRadius: 0,
                ),
              ],
            ),
            alignment: Alignment.center,
            child: Icon(icon, color: Colors.white, size: size * 0.62),
          ),
        ),
      ),
    );
  }
}

class _VerbTokenChoices extends StatelessWidget {
  const _VerbTokenChoices({
    required this.controller,
    required this.compact,
    required this.onEvent,
  });

  final Lesson01Controller controller;
  final bool compact;
  final ValueChanged<Lesson01Event> onEvent;

  @override
  Widget build(BuildContext context) {
    final tokens = controller.currentQuestion.actionVerbTokens;
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Wrap(
          alignment: WrapAlignment.center,
          spacing: 10,
          runSpacing: 10,
          children: [
            for (var index = 0; index < tokens.length; index++)
              _TokenButton(
                token: tokens[index],
                selected: controller.selectedVerbIndexes.contains(index),
                onTap: () => onEvent(controller.toggleVerbToken(index)),
              ),
          ],
        ),
        SizedBox(height: compact ? 14 : 24),
        _PrimaryButton(
          key: const Key('token-confirm'),
          label: '確定',
          icon: Icons.check_rounded,
          enabled: controller.selectedVerbIndexes.isNotEmpty,
          onPressed: () => onEvent(controller.submitVerbTokens()),
        ),
      ],
    );
  }
}

class _TokenButton extends StatelessWidget {
  const _TokenButton({
    required this.token,
    required this.selected,
    required this.onTap,
  });

  final String token;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? _blue : _panel,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          constraints: const BoxConstraints(minWidth: 62, minHeight: 54),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 11),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color:
                  selected ? const Color(0xFFA7E7FF) : const Color(0xFF49616A),
              width: 2,
            ),
          ),
          alignment: Alignment.center,
          child: Text(
            token,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
      ),
    );
  }
}

class _NeedsBeChoices extends StatelessWidget {
  const _NeedsBeChoices({required this.compact, required this.onChoice});

  final bool compact;
  final ValueChanged<bool> onChoice;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _WideChoiceButton(
          label: '要用 is / am / are',
          icon: Icons.add_circle_rounded,
          onTap: () => onChoice(true),
        ),
        SizedBox(height: compact ? 10 : 14),
        _WideChoiceButton(
          label: '不用',
          icon: Icons.remove_circle_outline_rounded,
          onTap: () => onChoice(false),
        ),
      ],
    );
  }
}

class _WideChoiceButton extends StatelessWidget {
  const _WideChoiceButton({
    required this.label,
    required this.icon,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 420),
      child: Material(
        color: _panel,
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(14),
          child: Container(
            height: 62,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFF45606A), width: 2),
            ),
            child: Row(
              children: [
                Icon(icon, color: _blue, size: 29),
                const SizedBox(width: 14),
                Expanded(
                  child: Text(
                    label,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
                const Icon(Icons.chevron_right_rounded, color: _softText),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _BeFormChoices extends StatelessWidget {
  const _BeFormChoices({required this.compact, required this.onChoice});

  final bool compact;
  final ValueChanged<String> onChoice;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          for (final form in const ['is', 'am', 'are']) ...[
            if (form != 'is') SizedBox(width: compact ? 8 : 12),
            Material(
              color: _panel,
              borderRadius: BorderRadius.circular(16),
              child: InkWell(
                onTap: () => onChoice(form),
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  width: compact ? 88 : 100,
                  height: compact ? 72 : 84,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: _blue, width: 3),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    form,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 25,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _CompactFeedback extends StatelessWidget {
  const _CompactFeedback({required this.feedback});

  final Lesson01Feedback feedback;

  @override
  Widget build(BuildContext context) {
    final color = feedback.isCorrect ? _green : _red;
    return Container(
      width: double.infinity,
      constraints: const BoxConstraints(minHeight: 46),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.7), width: 2),
      ),
      child: Text(
        feedback.title,
        textAlign: TextAlign.center,
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
        style:
            TextStyle(color: color, fontSize: 16, fontWeight: FontWeight.w900),
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

  final Lesson01Controller controller;
  final VoidCallback onNext;

  @override
  Widget build(BuildContext context) {
    final feedback = controller.feedback!;
    final color = feedback.isCorrect ? _green : _red;
    return LayoutBuilder(
      builder: (context, constraints) {
        final compact = constraints.maxHeight < 560;
        return Column(
          children: [
            SizedBox(
              height: compact ? 88 : 112,
              child: Center(
                child: Text(
                  controller.currentQuestion.zh,
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: compact ? 22 : 26,
                    height: 1.25,
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
                        color: color.withValues(alpha: 0.5), width: 2),
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
                          for (final line in feedback.lines) ...[
                            const SizedBox(height: 10),
                            Text(
                              line,
                              style: const TextStyle(
                                color: Color(0xFFE8F0F1),
                                fontSize: 17,
                                height: 1.4,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
            SizedBox(height: compact ? 10 : 14),
            Container(
              width: double.infinity,
              height: compact ? 64 : 76,
              padding: const EdgeInsets.symmetric(horizontal: 18),
              decoration: BoxDecoration(
                color: _panel,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF3D5962), width: 2),
              ),
              alignment: Alignment.centerLeft,
              child: Text(
                controller.currentQuestion.english,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: compact ? 19 : 21,
                  height: 1.2,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
            SizedBox(height: compact ? 10 : 14),
            _PrimaryButton(
              key: const Key('lesson-next'),
              label: controller.index == controller.total - 1 ? '完成課堂' : '下一題',
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

class _LessonResult extends StatelessWidget {
  const _LessonResult({
    required this.controller,
    required this.onClose,
    required this.onRestart,
    required this.onReview,
  });

  final Lesson01Controller controller;
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
              color: _yellow,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 5),
              boxShadow: const [
                BoxShadow(color: Color(0xFFB88300), offset: Offset(0, 8)),
              ],
            ),
            child:
                const Icon(Icons.star_rounded, color: Colors.white, size: 68),
          ),
          const SizedBox(height: 28),
          Text(
            controller.isReviewMode ? '錯題重練完成！' : 'Lesson 01 完成！',
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            controller.mistakes == 0 ? '全程零失誤，做得非常好！' : '睇完解釋，再重練錯題就會更穩。',
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
                    borderRadius: BorderRadius.circular(14)),
                textStyle:
                    const TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
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
  const _ResultStat(
      {required this.label, required this.value, required this.color});

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
                  color: color, fontSize: 22, fontWeight: FontWeight.w900),
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
                  '未能載入 Lesson 01 題庫。',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w900),
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

class _SparkBurstPainter extends CustomPainter {
  const _SparkBurstPainter({required this.progress, required this.grand});

  final double progress;
  final bool grand;

  static const colors = [_blue, _yellow, _green, _red, Color(0xFFF58BC9)];

  @override
  void paint(Canvas canvas, Size size) {
    if (progress <= 0 || progress >= 1) return;
    final fade = math.sin(progress * math.pi);
    final center = Offset(size.width / 2, size.height * (grand ? 0.42 : 0.55));
    final count = grand ? 54 : 28;
    final radius =
        (grand ? size.shortestSide * 0.78 : size.shortestSide * 0.45) *
            progress;

    for (var index = 0; index < count; index++) {
      final angle = (math.pi * 2 * index / count) + (index % 4) * 0.11;
      final distance = radius * (0.55 + (index % 7) / 12);
      final point =
          center + Offset(math.cos(angle), math.sin(angle)) * distance;
      final paint = Paint()
        ..color = colors[index % colors.length].withValues(alpha: fade);
      final particleSize = (grand ? 6.5 : 5.0) * (1 - progress * 0.35);
      if (index.isEven) {
        canvas.drawCircle(point, particleSize, paint);
      } else {
        canvas.save();
        canvas.translate(point.dx, point.dy);
        canvas.rotate(angle);
        canvas.drawRRect(
          RRect.fromRectAndRadius(
            Rect.fromCenter(
                center: Offset.zero,
                width: particleSize * 2.5,
                height: particleSize),
            const Radius.circular(2),
          ),
          paint,
        );
        canvas.restore();
      }
    }
  }

  @override
  bool shouldRepaint(covariant _SparkBurstPainter oldDelegate) {
    return oldDelegate.progress != progress || oldDelegate.grand != grand;
  }
}
