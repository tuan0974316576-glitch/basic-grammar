import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../../core/app_sfx.dart';
import '../../../core/widgets/game_keyboard.dart';
import 'lesson_02_controller.dart';
import 'lesson_02_question.dart';
import 'lesson_02_repository.dart';

const _ink = Color(0xFF101C20);
const _panel = Color(0xFF17262B);
const _blue = Color(0xFF25B4F3);
const _blueDark = Color(0xFF1178A9);
const _green = Color(0xFF4BC67A);
const _red = Color(0xFFFF6272);
const _yellow = Color(0xFFFFC928);
const _softText = Color(0xFFAFC4C9);

class Lesson02Screen extends StatefulWidget {
  const Lesson02Screen({
    this.controller,
    this.repository = const Lesson02Repository(),
    this.sfx,
    super.key,
  });

  final Lesson02Controller? controller;
  final Lesson02Repository repository;
  final LessonSfx? sfx;

  @override
  State<Lesson02Screen> createState() => _Lesson02ScreenState();
}

class _Lesson02ScreenState extends State<Lesson02Screen>
    with SingleTickerProviderStateMixin {
  Lesson02Controller? _controller;
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
      _attachController(Lesson02Controller(allQuestions: questions));
      setState(() {});
    } catch (error) {
      if (!mounted) return;
      setState(() => _loadError = error);
    }
  }

  void _attachController(Lesson02Controller controller) {
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

  void _playEvent(Lesson02Event event) {
    final cue = switch (event) {
      Lesson02Event.inputChanged => SfxCue.click,
      Lesson02Event.selectionChanged => SfxCue.step,
      Lesson02Event.correctStep => SfxCue.correct,
      Lesson02Event.invalidInput => SfxCue.wrong,
      Lesson02Event.wrong => SfxCue.wrong,
      Lesson02Event.questionCorrect => SfxCue.correct,
      Lesson02Event.nextQuestion => SfxCue.next,
      Lesson02Event.completed => SfxCue.complete,
      Lesson02Event.ignored => null,
    };
    if (cue != null) unawaited(_sfx.play(cue));
    if (event == Lesson02Event.questionCorrect ||
        event == Lesson02Event.completed) {
      _burstController.forward(from: 0);
    }
  }

  void _closeLesson() {
    unawaited(_sfx.play(SfxCue.click));
    Navigator.of(context).pop();
  }

  void _nextQuestion() {
    final controller = _controller;
    if (controller != null) _playEvent(controller.next());
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

    return Scaffold(
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

  final Lesson02Controller controller;
  final VoidCallback onClose;
  final ValueChanged<Lesson02Event> onEvent;
  final VoidCallback onNext;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(14, 8, 14, 10),
      child: Column(
        children: [
          _ProgressHeader(controller: controller, onClose: onClose),
          const SizedBox(height: 8),
          Expanded(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 220),
              child: controller.isResolved
                  ? _ResolvedQuestion(
                      key: ValueKey('resolved-${controller.index}'),
                      controller: controller,
                      onNext: onNext,
                    )
                  : _ActiveQuestion(
                      key: ValueKey(
                          '${controller.index}-${controller.stage.name}'),
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

class _ProgressHeader extends StatelessWidget {
  const _ProgressHeader({required this.controller, required this.onClose});

  final Lesson02Controller controller;
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

  final Lesson02Controller controller;
  final ValueChanged<Lesson02Event> onEvent;

  @override
  Widget build(BuildContext context) {
    if (controller.stage == Lesson02Stage.correction) {
      return _CorrectionStage(controller: controller, onEvent: onEvent);
    }
    return LayoutBuilder(
      builder: (context, constraints) {
        final compact = constraints.maxHeight < 560;
        return Column(
          children: [
            Expanded(
              flex: 5,
              child: _SentencePrompt(
                question: controller.currentQuestion,
                instruction: _instruction(controller.stage),
                compact: compact,
              ),
            ),
            if (controller.feedback case final feedback?) ...[
              _CompactFeedback(feedback: feedback),
              SizedBox(height: compact ? 8 : 12),
            ],
            Expanded(
              flex: 6,
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

  String _instruction(Lesson02Stage stage) => switch (stage) {
        Lesson02Stage.judgment => '這句英文正確還是錯誤？',
        Lesson02Stage.verbCount => '句子有幾多個動詞？',
        Lesson02Stage.verbTokens => '揀出句子中的兩個動詞',
        _ => '',
      };
}

class _SentencePrompt extends StatelessWidget {
  const _SentencePrompt({
    required this.question,
    required this.instruction,
    required this.compact,
  });

  final Lesson02Question question;
  final String instruction;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (instruction.isNotEmpty) ...[
          Text(
            instruction,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: _softText,
              fontSize: 15,
              fontWeight: FontWeight.w800,
            ),
          ),
          SizedBox(height: compact ? 9 : 14),
        ],
        Text(
          question.sentence,
          key: const Key('lesson-02-english-prompt'),
          textAlign: TextAlign.center,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            color: Colors.white,
            fontSize: compact ? 23 : 28,
            height: 1.2,
            fontWeight: FontWeight.w900,
          ),
        ),
        SizedBox(height: compact ? 7 : 11),
        Text(
          question.zh,
          textAlign: TextAlign.center,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            color: const Color(0xFF83D9F7),
            fontSize: compact ? 15 : 17,
            fontWeight: FontWeight.w700,
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

  final Lesson02Controller controller;
  final ValueChanged<Lesson02Event> onEvent;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return switch (controller.stage) {
      Lesson02Stage.judgment => _JudgmentChoices(
          compact: compact,
          onCorrect: () => onEvent(controller.answerJudgment(true)),
          onWrong: () => onEvent(controller.answerJudgment(false)),
        ),
      Lesson02Stage.verbCount => _VerbCountChoices(
          compact: compact,
          onChoice: (count) => onEvent(controller.answerVerbCount(count)),
        ),
      Lesson02Stage.verbTokens => _VerbTokenChoices(
          controller: controller,
          compact: compact,
          onEvent: onEvent,
        ),
      _ => const SizedBox.shrink(),
    };
  }
}

class _JudgmentChoices extends StatelessWidget {
  const _JudgmentChoices({
    required this.compact,
    required this.onCorrect,
    required this.onWrong,
  });

  final bool compact;
  final VoidCallback onCorrect;
  final VoidCallback onWrong;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _SymbolChoice(
            key: const Key('sentence-correct'),
            compact: compact,
            color: _green,
            icon: Icons.check_rounded,
            label: '正確',
            onTap: onCorrect,
          ),
          SizedBox(width: compact ? 28 : 42),
          _SymbolChoice(
            key: const Key('sentence-wrong'),
            compact: compact,
            color: _red,
            icon: Icons.close_rounded,
            label: '錯誤',
            onTap: onWrong,
          ),
        ],
      ),
    );
  }
}

class _SymbolChoice extends StatelessWidget {
  const _SymbolChoice({
    required this.compact,
    required this.color,
    required this.icon,
    required this.label,
    required this.onTap,
    super.key,
  });

  final bool compact;
  final Color color;
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final size = compact ? 90.0 : 108.0;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Material(
          color: color,
          borderRadius: BorderRadius.circular(27),
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(27),
            child: Container(
              width: size,
              height: size,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(27),
                border: Border.all(
                    color: Colors.white.withValues(alpha: 0.7), width: 4),
                boxShadow: [
                  BoxShadow(
                      color: color.withValues(alpha: 0.4),
                      offset: const Offset(0, 7)),
                ],
              ),
              child: Icon(icon, color: Colors.white, size: size * 0.62),
            ),
          ),
        ),
        const SizedBox(height: 10),
        Text(
          label,
          style: TextStyle(
              color: color, fontSize: 16, fontWeight: FontWeight.w900),
        ),
      ],
    );
  }
}

class _VerbCountChoices extends StatelessWidget {
  const _VerbCountChoices({required this.compact, required this.onChoice});

  final bool compact;
  final ValueChanged<int> onChoice;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          for (final count in const [0, 1, 2]) ...[
            if (count > 0) SizedBox(width: compact ? 10 : 16),
            Material(
              color: _panel,
              borderRadius: BorderRadius.circular(18),
              child: InkWell(
                key: Key('verb-count-$count'),
                onTap: () => onChoice(count),
                borderRadius: BorderRadius.circular(18),
                child: Container(
                  width: compact ? 82 : 98,
                  height: compact ? 78 : 92,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: _blue, width: 3),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    '$count',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 34,
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

class _VerbTokenChoices extends StatelessWidget {
  const _VerbTokenChoices({
    required this.controller,
    required this.compact,
    required this.onEvent,
  });

  final Lesson02Controller controller;
  final bool compact;
  final ValueChanged<Lesson02Event> onEvent;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Wrap(
          alignment: WrapAlignment.center,
          spacing: 7,
          runSpacing: 7,
          children: [
            for (var index = 0;
                index < controller.currentQuestion.tokens.length;
                index++)
              _TokenButton(
                token: controller.currentQuestion.tokens[index],
                selected: controller.selectedVerbIndexes.contains(index),
                onTap: () => onEvent(controller.toggleVerbToken(index)),
              ),
          ],
        ),
        SizedBox(height: compact ? 10 : 18),
        _PrimaryButton(
          key: const Key('verb-token-confirm'),
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
      borderRadius: BorderRadius.circular(11),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(11),
        child: Container(
          constraints: const BoxConstraints(minWidth: 54, minHeight: 48),
          padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 9),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(11),
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
                color: Colors.white, fontSize: 17, fontWeight: FontWeight.w900),
          ),
        ),
      ),
    );
  }
}

class _CorrectionStage extends StatelessWidget {
  const _CorrectionStage({required this.controller, required this.onEvent});

  final Lesson02Controller controller;
  final ValueChanged<Lesson02Event> onEvent;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final compact = constraints.maxHeight < 620;
        final keyboardHeight =
            compact ? 190.0 : math.min(238.0, constraints.maxHeight * 0.42);
        return Column(
          children: [
            SizedBox(
              height: compact ? 82 : 104,
              child: _SentencePrompt(
                question: controller.currentQuestion,
                instruction: '',
                compact: true,
              ),
            ),
            if (controller.feedback case final feedback?) ...[
              _CompactFeedback(feedback: feedback),
              SizedBox(height: compact ? 7 : 10),
            ],
            _AnswerField(value: controller.typedCorrection),
            SizedBox(height: compact ? 8 : 12),
            SizedBox(
              height: keyboardHeight,
              child: GameKeyboard(
                onCharacter: (character) =>
                    onEvent(controller.appendCharacter(character)),
                onBackspace: () => onEvent(controller.backspace()),
                onSubmit: () => onEvent(controller.submitCorrection()),
              ),
            ),
          ],
        );
      },
    );
  }
}

class _AnswerField extends StatelessWidget {
  const _AnswerField({required this.value});

  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      key: const Key('lesson-02-answer-field'),
      width: double.infinity,
      constraints: const BoxConstraints(minHeight: 56),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FBFA),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _blue, width: 3),
      ),
      alignment: Alignment.centerLeft,
      child: Row(
        children: [
          Expanded(
            child: Text(
              value.isEmpty ? 'Type the correct sentence' : value,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: value.isEmpty
                    ? const Color(0xFF8FA1A5)
                    : const Color(0xFF172B31),
                fontSize: 18,
                height: 1.2,
                fontWeight: value.isEmpty ? FontWeight.w600 : FontWeight.w900,
              ),
            ),
          ),
          Container(width: 2, height: 24, color: _blue),
        ],
      ),
    );
  }
}

class _CompactFeedback extends StatelessWidget {
  const _CompactFeedback({required this.feedback});

  final Lesson02Feedback feedback;

  @override
  Widget build(BuildContext context) {
    final color = feedback.isCorrect ? _green : _red;
    return Container(
      width: double.infinity,
      constraints: const BoxConstraints(minHeight: 44),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(11),
        border: Border.all(color: color.withValues(alpha: 0.7), width: 2),
      ),
      child: Text(
        feedback.title,
        textAlign: TextAlign.center,
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
        style:
            TextStyle(color: color, fontSize: 15, fontWeight: FontWeight.w900),
      ),
    );
  }
}

class _ResolvedQuestion extends StatelessWidget {
  const _ResolvedQuestion(
      {required this.controller, required this.onNext, super.key});

  final Lesson02Controller controller;
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
              height: compact ? 108 : 132,
              child: _SentencePrompt(
                question: controller.currentQuestion,
                instruction: '',
                compact: compact,
              ),
            ),
            Expanded(
              child: Container(
                width: double.infinity,
                padding: EdgeInsets.all(compact ? 15 : 20),
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
                          const SizedBox(height: 12),
                          Text(
                            feedback.reason,
                            style: const TextStyle(
                              color: Color(0xFFE8F0F1),
                              fontSize: 17,
                              height: 1.4,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            feedback.answer,
                            style: const TextStyle(
                              color: _green,
                              fontSize: 17,
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
              key: const Key('lesson-02-next'),
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
          minimumSize: const Size.fromHeight(54),
          backgroundColor: _blueDark,
          disabledBackgroundColor: const Color(0xFF31454C),
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

  final Lesson02Controller controller;
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
                BoxShadow(color: Color(0xFFB88300), offset: Offset(0, 8))
              ],
            ),
            child:
                const Icon(Icons.star_rounded, color: Colors.white, size: 68),
          ),
          const SizedBox(height: 28),
          Text(
            controller.isReviewMode ? '錯題重練完成！' : 'Lesson 02 完成！',
            textAlign: TextAlign.center,
            style: const TextStyle(
                color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 10),
          Text(
            controller.mistakes == 0 ? '每句都只留一個動詞，滿分！' : '先數動詞，再重練錯題就會更穩。',
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
                  color: _blue),
              const SizedBox(width: 10),
              _ResultStat(
                  label: '錯題', value: '${controller.mistakes}', color: _red),
              const SizedBox(width: 10),
              _ResultStat(
                  label: '準確率',
                  value: '${controller.accuracy}%',
                  color: _green),
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
                  color: _softText, fontSize: 11, fontWeight: FontWeight.w800),
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
                  '未能載入 Lesson 02 題庫。',
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
      final angle = math.pi * 2 * index / count + (index % 4) * 0.11;
      final distance = radius * (0.55 + (index % 7) / 12);
      final point =
          center + Offset(math.cos(angle), math.sin(angle)) * distance;
      final paint = Paint()
        ..color = colors[index % colors.length].withValues(alpha: fade);
      canvas.drawCircle(
          point, (grand ? 6.5 : 5) * (1 - progress * 0.35), paint);
    }
  }

  @override
  bool shouldRepaint(covariant _SparkBurstPainter oldDelegate) {
    return oldDelegate.progress != progress || oldDelegate.grand != grand;
  }
}
