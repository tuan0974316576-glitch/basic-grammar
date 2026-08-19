import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../core/app_palette.dart';
import '../../../core/app_sfx.dart';
import '../shared/lesson_ui.dart';
import 'lesson_11_controller.dart';
import 'lesson_11_question.dart';
import 'lesson_11_repository.dart';

class Lesson11Screen extends StatefulWidget {
  const Lesson11Screen(
      {this.repository = const Lesson11Repository(), this.sfx, super.key});

  final Lesson11Repository repository;
  final LessonSfx? sfx;

  @override
  State<Lesson11Screen> createState() => _Lesson11ScreenState();
}

class _Lesson11ScreenState extends State<Lesson11Screen> {
  final TextEditingController _textController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  Lesson11Controller? _controller;
  Object? _loadError;
  Lesson11Stage? _lastStage;
  String? _lastQuestionId;
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
    _textController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final questions = await widget.repository.loadQuestions();
      if (!mounted) return;
      final controller = Lesson11Controller(allQuestions: questions)
        ..addListener(_refresh);
      _lastStage = controller.stage;
      setState(() => _controller = controller);
    } catch (error) {
      if (mounted) setState(() => _loadError = error);
    }
  }

  void _refresh() {
    final controller = _controller;
    if (controller == null || !mounted) return;
    final openedAnswer = _lastStage != Lesson11Stage.answer &&
        controller.stage == Lesson11Stage.answer;
    final changedQuestion = _lastQuestionId != null &&
        _lastQuestionId != controller.currentQuestion.id;
    if (changedQuestion) _textController.clear();
    if (_textController.text != controller.typedAnswer) {
      _textController.value = TextEditingValue(
        text: controller.typedAnswer,
        selection:
            TextSelection.collapsed(offset: controller.typedAnswer.length),
      );
    }
    _lastStage = controller.stage;
    if (controller.stage != Lesson11Stage.scope) {
      _lastQuestionId = controller.currentQuestion.id;
    }
    setState(() {});
    if (openedAnswer) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _focusNode.requestFocus();
      });
    }
  }

  void _handle(Lesson11Event event) {
    switch (event) {
      case Lesson11Event.ignored || Lesson11Event.inputChanged:
        return;
      case Lesson11Event.selectionChanged:
        unawaited(_sfx.play(SfxCue.click));
        return;
      case Lesson11Event.started:
        unawaited(_sfx.play(SfxCue.start));
        return;
      case Lesson11Event.invalidInput || Lesson11Event.wrong:
        _focusNode.unfocus();
        unawaited(_sfx.play(SfxCue.wrong));
        return;
      case Lesson11Event.correctStep:
        unawaited(_sfx.play(SfxCue.correct));
        return;
      case Lesson11Event.questionCorrect:
        _focusNode.unfocus();
        setState(() => _celebration += 1);
        unawaited(_sfx.play(SfxCue.correct));
        return;
      case Lesson11Event.nextQuestion:
        unawaited(_sfx.play(SfxCue.next));
        return;
      case Lesson11Event.completed:
        setState(() => _celebration += 1);
        unawaited(_sfx.play(SfxCue.complete));
        return;
    }
  }

  void _close() {
    _focusNode.unfocus();
    unawaited(_sfx.play(SfxCue.click));
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    if (_loadError != null) {
      return LessonLoadError(lessonLabel: 'Lesson 11', onClose: _close);
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
            lessonLabel: 'Lesson 11',
            score: controller.score,
            total: controller.total,
            mistakes: controller.mistakes,
            reviewMode: controller.isReviewMode,
            onClose: _close,
            onRestart: () {
              controller.chooseScopeAgain();
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

    final stage = controller.stage;
    final inScope = stage == Lesson11Stage.scope;
    return Stack(
      children: [
        LessonPageScaffold(
          lessonLabel: 'LESSON 11',
          title: 'Tenses 時態分辨',
          progress: controller.progress,
          questionLabel:
              inScope ? '選擇範圍' : '${controller.index + 1}/${controller.total}',
          onClose: _close,
          body: inScope
              ? _ScopePicker(controller: controller, onEvent: _handle)
              : _QuestionStage(
                  controller: controller,
                  textController: _textController,
                  focusNode: _focusNode,
                  onEvent: _handle,
                ),
          bottom: stage == Lesson11Stage.resolved
              ? LessonPrimaryButton(
                  key: const Key('lesson-11-next'),
                  label:
                      controller.index == controller.total - 1 ? '完成課堂' : '下一題',
                  onPressed: () => _handle(controller.next()),
                )
              : null,
        ),
        LessonCelebrationOverlay(trigger: _celebration),
      ],
    );
  }
}

class _ScopePicker extends StatelessWidget {
  const _ScopePicker({required this.controller, required this.onEvent});

  final Lesson11Controller controller;
  final ValueChanged<Lesson11Event> onEvent;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const LessonPromptCard(
          primary: '選擇今次要練習的時態',
          translation: '可以選一種或多種',
          instruction: 'TENSE PRACTICE',
        ),
        const SizedBox(height: 18),
        Expanded(
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: Wrap(
              alignment: WrapAlignment.center,
              spacing: 10,
              runSpacing: 10,
              children: [
                for (final entry in controller.tenseLabels.entries)
                  SizedBox(
                    width: 168,
                    child: LessonChoiceButton(
                      key: Key('scope-${entry.key}'),
                      label: entry.value,
                      selected: controller.selectedTenses.contains(entry.key),
                      onPressed: () =>
                          onEvent(controller.toggleTense(entry.key)),
                    ),
                  ),
              ],
            ),
          ),
        ),
        LessonPrimaryButton(
          key: const Key('lesson-11-start'),
          label: '開始練習',
          icon: Icons.play_arrow_rounded,
          onPressed: () => onEvent(controller.start()),
        ),
      ],
    );
  }
}

class _QuestionStage extends StatelessWidget {
  const _QuestionStage({
    required this.controller,
    required this.textController,
    required this.focusNode,
    required this.onEvent,
  });

  final Lesson11Controller controller;
  final TextEditingController textController;
  final FocusNode focusNode;
  final ValueChanged<Lesson11Event> onEvent;

  @override
  Widget build(BuildContext context) {
    final question = controller.currentQuestion;
    return switch (controller.stage) {
      Lesson11Stage.tense => _TenseChoiceStage(
          question: question,
          controller: controller,
          onEvent: onEvent,
        ),
      Lesson11Stage.answer => _TenseAnswerStage(
          question: question,
          controller: controller,
          textController: textController,
          focusNode: focusNode,
          onEvent: onEvent,
        ),
      Lesson11Stage.resolved => Column(
          children: [
            LessonPromptCard(
              primary: question.sentence,
              translation: question.zh,
              instruction: question.tenseLabel,
              compact: true,
            ),
            const SizedBox(height: 12),
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: LessonFeedbackCard(
                  correct: !controller.questionHadMistake,
                  title: controller.questionHadMistake ? '未正確。' : '正確！',
                  lines: [
                    question.explanation,
                    '正確時態：${question.tenseLabel}',
                  ],
                  answer: question.english,
                ),
              ),
            ),
          ],
        ),
      Lesson11Stage.scope => const SizedBox.shrink(),
    };
  }
}

class _TenseChoiceStage extends StatelessWidget {
  const _TenseChoiceStage({
    required this.question,
    required this.controller,
    required this.onEvent,
  });

  final Lesson11Question question;
  final Lesson11Controller controller;
  final ValueChanged<Lesson11Event> onEvent;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        LessonPromptCard(
          primary: question.zh,
          instruction: '先判斷句子要使用哪種時態',
        ),
        const Spacer(),
        Wrap(
          alignment: WrapAlignment.center,
          spacing: 9,
          runSpacing: 9,
          children: [
            for (final tense in controller.selectedTenses)
              SizedBox(
                width: 168,
                child: LessonChoiceButton(
                  key: Key('tense-$tense'),
                  label: controller.tenseLabels[tense]!,
                  onPressed: () => onEvent(controller.answerTense(tense)),
                ),
              ),
          ],
        ),
        const Spacer(),
      ],
    );
  }
}

class _TenseAnswerStage extends StatelessWidget {
  const _TenseAnswerStage({
    required this.question,
    required this.controller,
    required this.textController,
    required this.focusNode,
    required this.onEvent,
  });

  final Lesson11Question question;
  final Lesson11Controller controller;
  final TextEditingController textController;
  final FocusNode focusNode;
  final ValueChanged<Lesson11Event> onEvent;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
      child: Column(
        children: [
          LessonPromptCard(
            primary: question.sentence,
            translation: question.zh,
            instruction: question.tenseLabel,
            compact: true,
          ),
          const SizedBox(height: 14),
          TextField(
            key: const Key('lesson-11-answer-input'),
            controller: textController,
            focusNode: focusNode,
            autofocus: true,
            maxLength: 60,
            autocorrect: false,
            enableSuggestions: false,
            textCapitalization: TextCapitalization.none,
            textInputAction: TextInputAction.done,
            inputFormatters: [
              FilteringTextInputFormatter.allow(RegExp(r"[a-zA-Z '\-/]")),
            ],
            onChanged: (value) => onEvent(controller.updateAnswer(value)),
            onSubmitted: (_) => onEvent(controller.submitAnswer()),
            decoration: InputDecoration(
              hintText: '輸入空格內的動詞形式',
              counterText: '',
              errorText: controller.errorMessage,
              filled: true,
              fillColor: AppPalette.paper,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(13),
                borderSide:
                    const BorderSide(color: AppPalette.primary, width: 2),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(13),
                borderSide: const BorderSide(
                  color: AppPalette.primaryDark,
                  width: 3,
                ),
              ),
            ),
            style: const TextStyle(
              color: AppPalette.ink,
              fontSize: 20,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}
