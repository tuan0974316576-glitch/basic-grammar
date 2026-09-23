import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../core/app_palette.dart';
import '../../../core/app_sfx.dart';
import '../../../core/widgets/original_game_keyboard.dart';
import '../../../core/widgets/stationery_frame.dart';
import '../shared/lesson_ui.dart';
import 'lesson_02_controller.dart';
import 'lesson_02_question.dart';
import 'lesson_02_repository.dart';

const _ink = AppPalette.background;
const _text = AppPalette.ink;
const _panel = AppPalette.softPrimary;
const _blue = AppPalette.primary;
const _blueDark = AppPalette.primaryDark;
const _green = AppPalette.correctDark;
const _red = AppPalette.dangerDark;
const _yellow = AppPalette.secondary;
const _softText = AppPalette.muted;

class Lesson02Screen extends StatefulWidget {
  const Lesson02Screen({
    this.controller,
    this.repository = const Lesson02Repository(),
    this.sfx,
    this.onQuestionCorrect,
    super.key,
  });

  final Lesson02Controller? controller;
  final Lesson02Repository repository;
  final LessonSfx? sfx;
  final VoidCallback? onQuestionCorrect;

  @override
  State<Lesson02Screen> createState() => _Lesson02ScreenState();
}

class _Lesson02ScreenState extends State<Lesson02Screen> {
  Lesson02Controller? _controller;
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
      setState(() => _celebration += 1);
    }
    if (event == Lesson02Event.questionCorrect) {
      widget.onQuestionCorrect?.call();
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
                lessonLabel: 'Lesson 02',
                score: controller.score,
                total: controller.total,
                mistakes: controller.mistakes,
                reviewMode: controller.isReviewMode,
                sfx: _sfx,
                onClose: _closeLesson,
                onRestart: _restart,
                onReview:
                    controller.missedQuestions.isEmpty ? null : _reviewMistakes,
              )
            else
              _QuestionScreen(
                controller: controller,
                onClose: _closeLesson,
                onEvent: _playEvent,
                onNext: _nextQuestion,
                sfx: _sfx,
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
    required this.sfx,
  });

  final Lesson02Controller controller;
  final VoidCallback onClose;
  final ValueChanged<Lesson02Event> onEvent;
  final VoidCallback onNext;
  final LessonSfx sfx;

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
          padding: const EdgeInsets.fromLTRB(8, 4, 8, 6),
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
                          sfx: sfx,
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

class _ProgressHeader extends StatelessWidget {
  const _ProgressHeader({required this.controller, required this.onClose});

  final Lesson02Controller controller;
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    return LessonHeader(
      lessonLabel: 'LESSON 02',
      title: '一句句子必須只有一個動詞',
      progress: controller.progress,
      questionLabel: '${controller.index + 1}/${controller.total}',
      onClose: onClose,
    );
  }
}

class _ActiveQuestion extends StatelessWidget {
  const _ActiveQuestion({
    required this.controller,
    required this.onEvent,
    required this.sfx,
    super.key,
  });

  final Lesson02Controller controller;
  final ValueChanged<Lesson02Event> onEvent;
  final LessonSfx sfx;

  @override
  Widget build(BuildContext context) {
    if (controller.stage == Lesson02Stage.correction) {
      return _CorrectionStage(
        controller: controller,
        onEvent: onEvent,
        sfx: sfx,
      );
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
    return Padding(
      padding: EdgeInsets.fromLTRB(2, 2, 2, compact ? 9 : 12),
      child: StationeryFrame(
        padding: EdgeInsets.symmetric(
          horizontal: compact ? 13 : 20,
          vertical: compact ? 9 : 16,
        ),
        radius: 24,
        ringWidth: 4,
        shadowDepth: 5,
        child: LayoutBuilder(
          builder: (context, constraints) => FittedBox(
            fit: BoxFit.scaleDown,
            child: SizedBox(
              width: constraints.maxWidth,
              child: Column(
                mainAxisSize: MainAxisSize.min,
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
                    SizedBox(height: compact ? 7 : 11),
                  ],
                  Text(
                    question.sentence,
                    key: const Key('lesson-02-english-prompt'),
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: _text,
                      fontSize: compact ? 23 : 28,
                      height: 1.2,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  SizedBox(height: compact ? 6 : 9),
                  Text(
                    question.zh,
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: _blueDark,
                      fontSize: compact ? 15 : 17,
                      fontWeight: FontWeight.w700,
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
            color: AppPalette.tick,
            icon: Icons.check_rounded,
            label: '正確',
            onTap: onCorrect,
          ),
          SizedBox(width: compact ? 28 : 42),
          _SymbolChoice(
            key: const Key('sentence-wrong'),
            compact: compact,
            color: AppPalette.cross,
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
        OriginalDashedSurface(
          backgroundColor: Colors.white,
          borderColor: color,
          strokeWidth: 5,
          radius: 26,
          shadowColor: color.withValues(alpha: 0.24),
          shadowDepth: 5,
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(27),
            child: SizedBox(
              width: size,
              height: size,
              child: Icon(icon, color: color, size: size * 0.62),
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
                      color: _text,
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
              color: selected ? Colors.white : AppPalette.primary,
              width: 2,
            ),
          ),
          alignment: Alignment.center,
          child: Text(
            token,
            style: TextStyle(
              color: selected ? Colors.white : _text,
              fontSize: 17,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
      ),
    );
  }
}

class _CorrectionStage extends StatefulWidget {
  const _CorrectionStage({
    required this.controller,
    required this.onEvent,
    required this.sfx,
  });

  final Lesson02Controller controller;
  final ValueChanged<Lesson02Event> onEvent;
  final LessonSfx sfx;

  @override
  State<_CorrectionStage> createState() => _CorrectionStageState();
}

class _CorrectionStageState extends State<_CorrectionStage> {
  late final TextEditingController _textController;
  final FocusNode _focusNode = FocusNode();
  final OverlayPortalController _keyboardOverlay = OverlayPortalController();

  @override
  void initState() {
    super.initState();
    _textController = TextEditingController(
      text: widget.controller.typedCorrection,
    );
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _showKeyboard();
    });
  }

  @override
  void didUpdateWidget(covariant _CorrectionStage oldWidget) {
    super.didUpdateWidget(oldWidget);
    _syncText();
  }

  @override
  void dispose() {
    _textController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _syncText() {
    final expected = widget.controller.typedCorrection;
    if (_textController.text == expected) return;
    final offset = _textController.selection.baseOffset.clamp(
      0,
      expected.length,
    );
    _textController.value = TextEditingValue(
      text: expected,
      selection: TextSelection.collapsed(offset: offset),
    );
  }

  void _handleChanged(String value) {
    widget.onEvent(widget.controller.updateCorrection(value));
    _syncText();
  }

  void _submit() {
    _keyboardOverlay.hide();
    _focusNode.unfocus();
    widget.onEvent(widget.controller.submitCorrection());
  }

  void _showKeyboard() {
    _focusNode.requestFocus();
    _keyboardOverlay.show();
    unawaited(SystemChannels.textInput.invokeMethod<void>('TextInput.hide'));
  }

  void _handleKeyboardKey(String key) {
    final current = _textController.text;
    final next = switch (key) {
      'BACKSPACE' =>
        current.isEmpty ? current : current.substring(0, current.length - 1),
      'SPACE' => current.endsWith(' ') ? current : '$current ',
      _ => '$current${key.toLowerCase()}',
    };
    if (next.length > 80) return;
    _textController.value = TextEditingValue(
      text: next,
      selection: TextSelection.collapsed(offset: next.length),
    );
    _handleChanged(next);
    unawaited(widget.sfx.play(SfxCue.type));
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final compact = constraints.maxHeight < 620;
        return SingleChildScrollView(
          keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
          child: ConstrainedBox(
            constraints: BoxConstraints(minHeight: constraints.maxHeight),
            child: Column(
              children: [
                SizedBox(
                  height: compact ? 82 : 104,
                  child: _SentencePrompt(
                    question: widget.controller.currentQuestion,
                    instruction: '',
                    compact: true,
                  ),
                ),
                if (widget.controller.feedback case final feedback?) ...[
                  _CompactFeedback(feedback: feedback),
                  SizedBox(height: compact ? 7 : 10),
                ],
                OverlayPortal(
                  controller: _keyboardOverlay,
                  overlayChildBuilder: (context) => Positioned(
                    left: 0,
                    right: 0,
                    bottom: 0,
                    child: Material(
                      color: Colors.transparent,
                      child: Align(
                        alignment: Alignment.bottomCenter,
                        child: ConstrainedBox(
                          constraints: const BoxConstraints(maxWidth: 920),
                          child: OriginalGameKeyboard(
                            keyboardKey: const Key('lesson-02-custom-keyboard'),
                            keyPrefix: 'lesson-02-keyboard-key-',
                            onKey: _handleKeyboardKey,
                            onSubmit: _submit,
                          ),
                        ),
                      ),
                    ),
                  ),
                  child: _AnswerField(
                    controller: _textController,
                    focusNode: _focusNode,
                    onChanged: _handleChanged,
                    onSubmitted: _submit,
                    onTap: _showKeyboard,
                    onType: () => unawaited(widget.sfx.play(SfxCue.type)),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _AnswerField extends StatelessWidget {
  const _AnswerField({
    required this.controller,
    required this.focusNode,
    required this.onChanged,
    required this.onSubmitted,
    required this.onTap,
    required this.onType,
  });

  final TextEditingController controller;
  final FocusNode focusNode;
  final ValueChanged<String> onChanged;
  final VoidCallback onSubmitted;
  final VoidCallback onTap;
  final VoidCallback onType;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: OriginalDashedSurface(
        key: const Key('lesson-02-answer-field'),
        padding: EdgeInsets.zero,
        radius: 18,
        strokeWidth: 3,
        backgroundColor: Colors.white,
        borderColor: AppPalette.primary,
        shadowColor: const Color(0xFFBDE0E1),
        shadowDepth: 4,
        child: TextField(
          key: const Key('lesson-02-correction-input'),
          controller: controller,
          focusNode: focusNode,
          autofocus: true,
          maxLength: 80,
          maxLines: 2,
          minLines: 1,
          autocorrect: false,
          enableSuggestions: false,
          spellCheckConfiguration: const SpellCheckConfiguration.disabled(),
          textCapitalization: TextCapitalization.sentences,
          keyboardType: TextInputType.none,
          textInputAction: TextInputAction.done,
          inputFormatters: [
            FilteringTextInputFormatter.allow(RegExp(r"[a-zA-Z '\-.,!?]")),
          ],
          onChanged: (value) {
            onChanged(value);
            onType();
          },
          onSubmitted: (_) => onSubmitted(),
          onTap: onTap,
          decoration: const InputDecoration(
            hintText: 'Type the correct sentence',
            counterText: '',
            border: InputBorder.none,
            contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 15),
          ),
          style: const TextStyle(
            color: Color(0xFF172B31),
            fontSize: 18,
            height: 1.2,
            fontWeight: FontWeight.w900,
          ),
        ),
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
    final frameColor = feedback.isCorrect ? AppPalette.secondaryDark : color;
    return SizedBox(
      width: double.infinity,
      child: OriginalDashedSurface(
        radius: 18,
        strokeWidth: feedback.isCorrect ? 3 : 2,
        borderColor: frameColor,
        shadowColor: feedback.isCorrect
            ? const Color(0xFFFFE7A3)
            : color.withValues(alpha: 0.18),
        shadowDepth: 3,
        backgroundColor:
            feedback.isCorrect ? AppPalette.softSecondary : Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
        child: Text(
          feedback.title,
          textAlign: TextAlign.center,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            color: color,
            fontSize: 15,
            fontWeight: FontWeight.w900,
          ),
        ),
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
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: LessonFeedbackCard(
                  correct: feedback.isCorrect,
                  title: feedback.title,
                  lines: [feedback.reason],
                  answer: feedback.answer,
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
      child: ElevatedButton.icon(
        onPressed: enabled ? onPressed : null,
        icon: Icon(icon),
        label: Text(label),
        style: ElevatedButton.styleFrom(
          minimumSize: const Size.fromHeight(54),
          backgroundColor: AppPalette.secondary,
          disabledBackgroundColor: const Color(0xFFF3F3F3),
          disabledForegroundColor: const Color(0xFFAAAAAA),
          foregroundColor: const Color(0xFF5D4037),
          shadowColor: AppPalette.secondaryDark,
          elevation: 4,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
          textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
        ),
      ),
    );
  }
}

// ignore: unused_element
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
                color: _text, fontSize: 28, fontWeight: FontWeight.w900),
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
                foregroundColor: AppPalette.secondaryDark,
                side: const BorderSide(
                  color: AppPalette.secondaryDark,
                  width: 2,
                ),
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
                      color: _text, fontSize: 20, fontWeight: FontWeight.w900),
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
