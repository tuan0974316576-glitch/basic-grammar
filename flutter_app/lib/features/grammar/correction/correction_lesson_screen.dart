import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../core/app_palette.dart';
import '../../../core/app_sfx.dart';
import '../../../core/widgets/original_game_keyboard.dart';
import '../../../core/widgets/stationery_frame.dart';
import '../shared/lesson_ui.dart';
import 'correction_lesson_controller.dart';
import 'correction_lesson_question.dart';
import 'correction_lesson_repository.dart';

class CorrectionLessonScreen extends StatefulWidget {
  const CorrectionLessonScreen({
    required this.config,
    this.repository = const CorrectionLessonRepository(),
    this.sfx,
    this.onQuestionCorrect,
    super.key,
  });

  final CorrectionLessonConfig config;
  final CorrectionLessonRepository repository;
  final LessonSfx? sfx;
  final VoidCallback? onQuestionCorrect;

  @override
  State<CorrectionLessonScreen> createState() => _CorrectionLessonScreenState();
}

class _CorrectionLessonScreenState extends State<CorrectionLessonScreen> {
  final TextEditingController _textController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  CorrectionLessonController? _controller;
  Object? _loadError;
  CorrectionLessonStage? _lastStage;
  String? _lastQuestionId;
  int _celebration = 0;
  bool _keyboardOpen = false;

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
    _textController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final questions =
          await widget.repository.loadQuestions(widget.config.assetPath);
      if (!mounted) return;
      final controller = CorrectionLessonController(
        config: widget.config,
        allQuestions: questions,
      )..addListener(_refresh);
      _lastStage = controller.stage;
      _lastQuestionId = controller.currentQuestion.id;
      setState(() => _controller = controller);
    } catch (error) {
      if (mounted) setState(() => _loadError = error);
    }
  }

  void _refresh() {
    final controller = _controller;
    if (controller == null || !mounted) return;
    final questionChanged = _lastQuestionId != controller.currentQuestion.id;
    final openedCorrection = _lastStage != CorrectionLessonStage.correction &&
        controller.stage == CorrectionLessonStage.correction;
    if (questionChanged) _textController.clear();
    if (_textController.text != controller.typedCorrection) {
      _textController.value = TextEditingValue(
        text: controller.typedCorrection,
        selection: TextSelection.collapsed(
          offset: controller.typedCorrection.length,
        ),
      );
    }
    _lastStage = controller.stage;
    _lastQuestionId = controller.currentQuestion.id;
    setState(() {});
    if (openedCorrection) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _openKeyboard();
      });
    }
  }

  void _handle(CorrectionLessonEvent event) {
    switch (event) {
      case CorrectionLessonEvent.ignored || CorrectionLessonEvent.inputChanged:
        return;
      case CorrectionLessonEvent.invalidInput || CorrectionLessonEvent.wrong:
        _closeKeyboard();
        _focusNode.unfocus();
        unawaited(_sfx.play(SfxCue.wrong));
        return;
      case CorrectionLessonEvent.correctStep:
        unawaited(_sfx.play(SfxCue.correct));
        return;
      case CorrectionLessonEvent.questionCorrect:
        _closeKeyboard();
        _focusNode.unfocus();
        setState(() => _celebration += 1);
        widget.onQuestionCorrect?.call();
        unawaited(_sfx.play(SfxCue.correct));
        return;
      case CorrectionLessonEvent.nextQuestion:
        unawaited(_sfx.play(SfxCue.next));
        return;
      case CorrectionLessonEvent.completed:
        setState(() => _celebration += 1);
        unawaited(_sfx.play(SfxCue.complete));
        return;
    }
  }

  void _submitCorrection() {
    _closeKeyboard();
    _handle(_controller!.submitCorrection());
  }

  void _openKeyboard() {
    if (_keyboardOpen ||
        _controller?.stage != CorrectionLessonStage.correction) {
      return;
    }
    setState(() => _keyboardOpen = true);
    _focusNode.requestFocus();
    unawaited(SystemChannels.textInput.invokeMethod<void>('TextInput.hide'));
  }

  void _closeKeyboard() {
    if (!_keyboardOpen) return;
    setState(() => _keyboardOpen = false);
    _focusNode.unfocus();
    unawaited(SystemChannels.textInput.invokeMethod<void>('TextInput.hide'));
  }

  void _handleKeyboardKey(String key) {
    if (!_keyboardOpen ||
        _controller?.stage != CorrectionLessonStage.correction) {
      return;
    }
    final current = _textController.text;
    final next = switch (key) {
      'BACKSPACE' =>
        current.isEmpty ? current : current.substring(0, current.length - 1),
      'SPACE' => current.endsWith(' ') ? current : '$current ',
      _ => '$current${key.toLowerCase()}',
    };
    if (next.length > 120) return;
    _textController.value = TextEditingValue(
      text: next,
      selection: TextSelection.collapsed(offset: next.length),
    );
    _handle(_controller!.updateCorrection(next));
    unawaited(_sfx.play(SfxCue.type));
  }

  void _close() {
    _focusNode.unfocus();
    unawaited(_sfx.play(SfxCue.click));
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    if (_loadError != null) {
      return LessonLoadError(
        lessonLabel: widget.config.lessonLabel,
        onClose: _close,
      );
    }
    final controller = _controller;
    if (controller == null) {
      return const Scaffold(
        backgroundColor: AppPalette.background,
        body:
            Center(child: CircularProgressIndicator(color: AppPalette.primary)),
      );
    }
    if (controller.isComplete) {
      return Stack(
        children: [
          LessonResultScreen(
            lessonLabel: widget.config.lessonLabel,
            score: controller.score,
            total: controller.total,
            mistakes: controller.mistakes,
            reviewMode: controller.isReviewMode,
            sfx: _sfx,
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

    final question = controller.currentQuestion;
    final stage = controller.stage;
    return Stack(
      children: [
        LessonPageScaffold(
          lessonLabel: widget.config.lessonLabel.toUpperCase(),
          title: widget.config.title,
          progress: controller.progress,
          questionLabel: '${controller.index + 1}/${controller.total}',
          onClose: _close,
          body: _buildStage(controller, question, stage),
          bottom: stage == CorrectionLessonStage.resolved
              ? LessonPrimaryButton(
                  key: Key('lesson-${widget.config.lessonNumber}-next'),
                  label:
                      controller.index == controller.total - 1 ? '完成課堂' : '下一題',
                  onPressed: () => _handle(controller.next()),
                )
              : null,
        ),
        if (_keyboardOpen)
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Align(
              alignment: Alignment.bottomCenter,
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 920),
                child: OriginalGameKeyboard(
                  keyboardKey: Key(
                    'lesson-${widget.config.lessonNumber}-custom-keyboard',
                  ),
                  keyPrefix:
                      'lesson-${widget.config.lessonNumber}-keyboard-key-',
                  onKey: _handleKeyboardKey,
                  onSubmit: _submitCorrection,
                ),
              ),
            ),
          ),
        LessonCelebrationOverlay(trigger: _celebration),
      ],
    );
  }

  Widget _buildStage(
    CorrectionLessonController controller,
    CorrectionLessonQuestion question,
    CorrectionLessonStage stage,
  ) {
    if (stage == CorrectionLessonStage.category) {
      return Column(
        children: [
          LessonPromptCard(
            primary: question.zh,
            instruction: '中文的「有」應該使用哪個英文結構？',
          ),
          const Spacer(),
          for (final entry in widget.config.categoryLabels.entries) ...[
            LessonChoiceButton(
              key: Key('category-${entry.key}'),
              label: entry.value,
              onPressed: () => _handle(controller.answerCategory(entry.key)),
            ),
            const SizedBox(height: 10),
          ],
          const Spacer(),
        ],
      );
    }

    if (stage == CorrectionLessonStage.judgment) {
      return Column(
        children: [
          LessonPromptCard(
            primary: question.sentence,
            translation: question.zh,
            instruction: widget.config.categoryLabelFor(question),
          ),
          const Spacer(),
          Row(
            children: [
              Expanded(
                child: _JudgmentButton(
                  key: const Key('judgment-correct'),
                  label: '正確',
                  icon: Icons.check_rounded,
                  color: AppPalette.tick,
                  onPressed: () => _handle(controller.answerJudgment(true)),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: _JudgmentButton(
                  key: const Key('judgment-wrong'),
                  label: '錯誤',
                  icon: Icons.close_rounded,
                  color: AppPalette.cross,
                  onPressed: () => _handle(controller.answerJudgment(false)),
                ),
              ),
            ],
          ),
          const Spacer(),
        ],
      );
    }

    if (stage == CorrectionLessonStage.correction) {
      return SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
        child: Column(
          children: [
            LessonPromptCard(
              primary: question.sentence,
              translation: question.zh,
              instruction: '句子有錯，請打出正確英文句子',
              compact: true,
            ),
            const SizedBox(height: 14),
            OriginalDashedSurface(
              radius: 18,
              strokeWidth: 3,
              backgroundColor: AppPalette.paper,
              borderColor: controller.errorMessage == null
                  ? AppPalette.primary
                  : AppPalette.danger,
              shadowColor: controller.errorMessage == null
                  ? const Color(0xFFBDE0E1)
                  : const Color(0xFFFFC9C9),
              shadowDepth: 4,
              padding: EdgeInsets.zero,
              child: TextField(
                key: const Key('correction-input'),
                controller: _textController,
                focusNode: _focusNode,
                autofocus: true,
                maxLength: 120,
                maxLines: 3,
                minLines: 1,
                autocorrect: false,
                enableSuggestions: false,
                spellCheckConfiguration:
                    const SpellCheckConfiguration.disabled(),
                textCapitalization: TextCapitalization.sentences,
                textInputAction: TextInputAction.done,
                inputFormatters: [
                  FilteringTextInputFormatter.allow(
                    RegExp(r"[a-zA-Z0-9 '\-.,!?/]"),
                  ),
                ],
                onChanged: (value) {
                  _handle(controller.updateCorrection(value));
                  unawaited(_sfx.play(SfxCue.type));
                },
                onSubmitted: (_) => _submitCorrection(),
                onTap: _openKeyboard,
                readOnly: true,
                showCursor: _keyboardOpen,
                keyboardType: TextInputType.none,
                decoration: InputDecoration(
                  hintText: 'Type the correct sentence',
                  counterText: '',
                  errorText: controller.errorMessage,
                  filled: false,
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 15,
                  ),
                ),
                style: const TextStyle(
                  color: AppPalette.ink,
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      children: [
        LessonPromptCard(
          primary: question.sentence,
          translation: question.zh,
          instruction: widget.config.categoryLabelFor(question),
          compact: true,
        ),
        const SizedBox(height: 12),
        Expanded(
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: LessonFeedbackCard(
              correct: !controller.questionHadMistake,
              title: controller.questionHadMistake ? '未正確。' : '正確！',
              lines: [question.explanation],
              answer: question.answer,
            ),
          ),
        ),
      ],
    );
  }
}

class _JudgmentButton extends StatelessWidget {
  const _JudgmentButton({
    required this.label,
    required this.icon,
    required this.color,
    required this.onPressed,
    super.key,
  });

  final String label;
  final IconData icon;
  final Color color;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return OriginalDashedSurface(
      backgroundColor: Colors.white,
      borderColor: color,
      strokeWidth: 5,
      radius: 26,
      shadowColor: color.withValues(alpha: 0.24),
      shadowDepth: 5,
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(26),
        child: SizedBox(
          height: 112,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: color, size: 50),
              Text(
                label,
                style: TextStyle(
                  color: color,
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
