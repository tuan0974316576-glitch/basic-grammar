import 'dart:async';

import 'package:flutter/material.dart';

import '../../../core/app_palette.dart';
import '../../../core/app_sfx.dart';
import '../shared/lesson_ui.dart';
import 'lesson_05_controller.dart';
import 'lesson_05_question.dart';
import 'lesson_05_repository.dart';

class Lesson05Screen extends StatefulWidget {
  const Lesson05Screen(
      {this.repository = const Lesson05Repository(), this.sfx, super.key});

  final Lesson05Repository repository;
  final LessonSfx? sfx;

  @override
  State<Lesson05Screen> createState() => _Lesson05ScreenState();
}

class _Lesson05ScreenState extends State<Lesson05Screen> {
  Lesson05Controller? _controller;
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
      final controller = Lesson05Controller(allQuestions: questions)
        ..addListener(_refresh);
      setState(() => _controller = controller);
    } catch (error) {
      if (mounted) setState(() => _loadError = error);
    }
  }

  void _handle(Lesson05Event event) {
    switch (event) {
      case Lesson05Event.ignored:
        return;
      case Lesson05Event.wrong:
        unawaited(_sfx.play(SfxCue.wrong));
        return;
      case Lesson05Event.questionCorrect:
        setState(() => _celebration += 1);
        unawaited(_sfx.play(SfxCue.correct));
        return;
      case Lesson05Event.nextQuestion:
        unawaited(_sfx.play(SfxCue.next));
        return;
      case Lesson05Event.completed:
        setState(() => _celebration += 1);
        unawaited(_sfx.play(SfxCue.complete));
        return;
    }
  }

  void _close() {
    unawaited(_sfx.play(SfxCue.click));
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    if (_loadError != null) {
      return LessonLoadError(lessonLabel: 'Lesson 05', onClose: _close);
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
            lessonLabel: 'Lesson 05',
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

    final question = controller.currentQuestion;
    final selected = controller.selectedChoice;
    return Stack(
      children: [
        LessonPageScaffold(
          lessonLabel: 'LESSON 05',
          title: '代名詞句子 MC',
          progress: controller.progress,
          questionLabel: '${controller.index + 1}/${controller.total}',
          onClose: _close,
          body: Column(
            children: [
              LessonPromptCard(
                primary: question.sentence,
                translation: controller.isResolved ? question.zh : null,
                instruction: '選出文法及意思都正確的代名詞',
                compact: true,
              ),
              const SizedBox(height: 12),
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 2,
                childAspectRatio: 2.8,
                mainAxisSpacing: 9,
                crossAxisSpacing: 9,
                children: [
                  for (final choice in question.choices)
                    LessonChoiceButton(
                      key: Key('lesson-05-choice-$choice'),
                      label: choice,
                      selected: selected == choice,
                      wrong: controller.isResolved &&
                          selected == choice &&
                          choice != question.answer,
                      correct:
                          controller.isResolved && choice == question.answer,
                      onPressed: controller.isResolved
                          ? null
                          : () => _handle(controller.answer(choice)),
                    ),
                ],
              ),
              const SizedBox(height: 11),
              if (controller.isResolved)
                Expanded(
                  child: SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    child: LessonFeedbackCard(
                      correct: controller.answerWasCorrect,
                      title: controller.answerWasCorrect ? '正確！' : '未正確。',
                      lines: [
                        '中文：${question.zh}',
                        question.explanation,
                        for (final choice in question.choices)
                          PronounChoiceExplainer.reason(question, choice),
                      ],
                      answer: question.completedSentence,
                    ),
                  ),
                )
              else
                const Spacer(),
            ],
          ),
          bottom: controller.isResolved
              ? LessonPrimaryButton(
                  key: const Key('lesson-05-next'),
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
