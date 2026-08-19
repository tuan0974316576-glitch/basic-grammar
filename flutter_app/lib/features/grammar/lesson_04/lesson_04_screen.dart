import 'dart:async';

import 'package:flutter/material.dart';

import '../../../core/app_palette.dart';
import '../../../core/app_sfx.dart';
import '../shared/lesson_ui.dart';
import 'lesson_04_controller.dart';
import 'lesson_04_repository.dart';

class Lesson04Screen extends StatefulWidget {
  const Lesson04Screen(
      {this.repository = const Lesson04Repository(), this.sfx, super.key});

  final Lesson04Repository repository;
  final LessonSfx? sfx;

  @override
  State<Lesson04Screen> createState() => _Lesson04ScreenState();
}

class _Lesson04ScreenState extends State<Lesson04Screen> {
  Lesson04Controller? _controller;
  Object? _loadError;
  int _celebration = 0;
  bool _grandCelebration = false;

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
      final controller = Lesson04Controller(questions)..addListener(_refresh);
      setState(() => _controller = controller);
    } catch (error) {
      if (mounted) setState(() => _loadError = error);
    }
  }

  void _handle(Lesson04Event event) {
    final controller = _controller!;
    switch (event) {
      case Lesson04Event.ignored:
        return;
      case Lesson04Event.selectionChanged:
        unawaited(_sfx.play(SfxCue.click));
        return;
      case Lesson04Event.placed:
        if (controller.lastPlacementWasCorrect) {
          final cues = [
            SfxCue.pronounPlace1,
            SfxCue.pronounPlace2,
            SfxCue.pronounPlace3,
            SfxCue.pronounPlace4,
          ];
          final index = (controller.correctPlacementCount - 1).clamp(0, 3);
          unawaited(_sfx.play(cues[index]));
        } else {
          unawaited(_sfx.play(SfxCue.click));
        }
        return;
      case Lesson04Event.invalidInput || Lesson04Event.wrong:
        unawaited(_sfx.play(SfxCue.wrong));
        return;
      case Lesson04Event.questionCorrect:
        _grandCelebration = controller.isLastQuestion;
        setState(() => _celebration += 1);
        unawaited(
          _sfx.play(
            controller.isLastQuestion
                ? SfxCue.pronounGrandWin
                : SfxCue.pronounRowWin,
          ),
        );
        return;
      case Lesson04Event.nextQuestion:
        unawaited(_sfx.play(SfxCue.next));
        return;
      case Lesson04Event.completed:
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
      return LessonLoadError(lessonLabel: 'Lesson 04', onClose: _close);
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
            lessonLabel: 'Lesson 04',
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
          LessonCelebrationOverlay(
            trigger: _celebration,
            grand: true,
          ),
        ],
      );
    }

    final question = controller.currentQuestion;
    return Stack(
      children: [
        LessonPageScaffold(
          lessonLabel: 'LESSON 04',
          title: '代名詞配對',
          progress: controller.progress,
          questionLabel: '${controller.index + 1}/${controller.total}',
          onClose: _close,
          body: Column(
            children: [
              Text(
                question.zh,
                style: const TextStyle(
                  color: AppPalette.ink,
                  fontSize: 30,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 12),
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 2,
                mainAxisExtent: 64,
                mainAxisSpacing: 9,
                crossAxisSpacing: 9,
                children: [
                  for (final role in Lesson04Controller.roles)
                    _PronounSlot(
                      key: Key('pronoun-slot-${role.$1}'),
                      label: role.$2,
                      value: controller
                              .tileById(controller.placements[role.$1])
                              ?.text ??
                          '',
                      selected: controller.selectedSlot == role.$1,
                      wrong: controller.wrongSlots.contains(role.$1),
                      correct: controller.isResolved,
                      onTap: () => _handle(controller.selectSlot(role.$1)),
                    ),
                ],
              ),
              const SizedBox(height: 15),
              Expanded(
                child: Center(
                  child: SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    child: Wrap(
                      alignment: WrapAlignment.center,
                      spacing: 9,
                      runSpacing: 9,
                      children: [
                        for (final tile in controller.tiles)
                          AnimatedOpacity(
                            duration: const Duration(milliseconds: 180),
                            opacity:
                                controller.placements.containsValue(tile.id)
                                    ? 0.18
                                    : 1,
                            child: SizedBox(
                              width: 112,
                              child: LessonChoiceButton(
                                key: Key('pronoun-tile-${tile.id}'),
                                label: tile.text,
                                selected: controller.selectedTileId == tile.id,
                                onPressed:
                                    controller.placements.containsValue(tile.id)
                                        ? null
                                        : () => _handle(
                                              controller.selectTile(tile.id),
                                            ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ),
              if (controller.isResolved)
                LessonFeedbackCard(
                  correct: true,
                  title: '四個代名詞全部正確！',
                  lines: const ['主語、非主語、「的」和「的東西」位置都配對正確。'],
                  answer: Lesson04Controller.roles
                      .map((role) => '${role.$2} ${question.forms[role.$1]}')
                      .join(' / '),
                ),
            ],
          ),
          bottom: controller.isResolved
              ? LessonPrimaryButton(
                  key: const Key('lesson-04-next'),
                  label: controller.isLastQuestion ? '完成七組' : '下一組',
                  onPressed: () => _handle(controller.next()),
                )
              : Row(
                  children: [
                    IconButton.outlined(
                      tooltip: '重新配對',
                      onPressed: controller.placements.isEmpty
                          ? null
                          : () => _handle(controller.reset()),
                      icon: const Icon(Icons.refresh_rounded),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: LessonPrimaryButton(
                        key: const Key('lesson-04-confirm'),
                        label: '確定',
                        icon: Icons.check_rounded,
                        danger: controller.wrongSlots.isNotEmpty,
                        onPressed: controller.canSubmit
                            ? () => _handle(controller.submit())
                            : null,
                      ),
                    ),
                  ],
                ),
        ),
        LessonCelebrationOverlay(
          trigger: _celebration,
          grand: _grandCelebration,
        ),
      ],
    );
  }
}

class _PronounSlot extends StatelessWidget {
  const _PronounSlot({
    required this.label,
    required this.value,
    required this.selected,
    required this.wrong,
    required this.correct,
    required this.onTap,
    super.key,
  });

  final String label;
  final String value;
  final bool selected;
  final bool wrong;
  final bool correct;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final color = wrong
        ? AppPalette.danger
        : correct
            ? AppPalette.correctDark
            : selected
                ? AppPalette.primaryDark
                : AppPalette.primary;
    return Material(
      color: wrong
          ? AppPalette.softDanger
          : correct
              ? AppPalette.softCorrect
              : AppPalette.paper,
      borderRadius: BorderRadius.circular(13),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(13),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(13),
            border: Border.all(color: color, width: wrong || selected ? 3 : 2),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                label,
                style: const TextStyle(
                  color: AppPalette.muted,
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value.isEmpty ? '—' : value,
                style: TextStyle(
                  color: value.isEmpty ? AppPalette.border : AppPalette.ink,
                  fontSize: 19,
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
