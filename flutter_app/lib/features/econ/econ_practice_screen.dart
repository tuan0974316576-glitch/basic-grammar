import 'dart:async';
import 'dart:math' as math;

import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';

import '../../core/app_palette.dart';
import '../../core/app_sfx.dart';
import '../../core/widgets/stationery_frame.dart';
import '../grammar/shared/lesson_ui.dart';
import 'econ_diagram_editor.dart';
import 'econ_diagram_domain.dart';
import 'econ_diagram_models.dart';
import 'econ_cloud_repository.dart';
import 'econ_question_models.dart';
import 'econ_question_repository.dart';
import 'econ_visual_assets.dart';
import 'econ_palette.dart';

class EconPracticeScreen extends StatefulWidget {
  const EconPracticeScreen(
      {required this.questions,
      this.cloudRepository,
      this.onQuestionChecked,
      this.onCompleted,
      super.key});

  final List<EconQuestion> questions;
  final EconCloudRepository? cloudRepository;
  final void Function(String questionId, bool correct)? onQuestionChecked;
  final ValueChanged<int>? onCompleted;

  @override
  State<EconPracticeScreen> createState() => _EconPracticeScreenState();
}

class _EconPracticeScreenState extends State<EconPracticeScreen> {
  int _index = 0;
  int _score = 0;
  int _mistakes = 0;
  bool _checked = false;
  bool _correct = false;
  String? _selectedChoice;
  final TextEditingController _responseController = TextEditingController();
  EconDiagramState _diagram = const EconDiagramState();
  EconCloudRepository? _cloudRepository;
  EconGradeResult? _grade;
  String? _gradeError;
  bool _grading = false;
  final Map<String, String?> _savedChoices = {};
  final Map<String, String> _savedResponses = {};
  final Map<String, EconDiagramState> _savedDiagrams = {};
  final Map<String, bool> _savedChecked = {};
  final Map<String, bool> _savedCorrect = {};
  final Map<String, EconGradeResult?> _savedGrades = {};
  final Map<String, String?> _savedErrors = {};
  bool _completionReported = false;
  bool _diagramInteracting = false;

  @override
  void initState() {
    super.initState();
    if (widget.cloudRepository != null) {
      _cloudRepository = widget.cloudRepository;
    } else if (Firebase.apps.isNotEmpty) {
      _cloudRepository = EconCloudRepository();
    }
    _diagram = _initialDiagramFor(0);
  }

  EconQuestion get _question => widget.questions[_index];

  @override
  void dispose() {
    _responseController.dispose();
    super.dispose();
  }

  void _close() => Navigator.of(context).pop();

  bool get _ready {
    if (_question.isP1) return _selectedChoice != null;
    if (_responseController.text.trim().isEmpty) return false;
    final config = _question.diagramConfig;
    if (config?.enabled != true) return true;
    return diagramReadyFor(
      state: _diagram,
      kind: config!.kind,
      mode: config.mode,
      policy: config.policy,
      requiresSplitPrice: config.requiresSplitPrice,
      sourceSeed: _diagramSourceSeed,
    );
  }

  int _maxMarksFor(EconQuestion question) {
    if (question.isP1) return 1;
    final fromParts = question.parts.fold<int>(
      0,
      (total, part) => total + (part.marks ?? 0),
    );
    final explicit = question.totalMarks ?? 0;
    return explicit > 0 ? explicit : (fromParts > 0 ? fromParts : 1);
  }

  int get _totalMarks => widget.questions.fold<int>(
        0,
        (total, question) => total + _maxMarksFor(question),
      );

  EconDiagramState? get _diagramSourceSeed =>
      _question.diagramConfig?.sourceSeed == null
          ? null
          : EconDiagramState.fromJson(_question.diagramConfig!.sourceSeed);

  Future<void> _check() async {
    if (_checked || _grading || !_ready) return;
    if (_question.isP2) {
      final cloud = _cloudRepository;
      if (cloud == null) {
        setState(() => _gradeError = '登入後才可以提交 Paper 2 評分。');
        return;
      }
      setState(() {
        _grading = true;
        _gradeError = null;
      });
      try {
        final grade = await cloud.gradeP2Answer(
          questionId: _question.id,
          response: _responseController.text.trim(),
          diagram: _question.diagramConfig?.enabled == true ? _diagram : null,
          diagramSourceSeed: _diagramSourceSeed,
        );
        if (!mounted) return;
        setState(() {
          _grade = grade;
          _checked = true;
          _correct = grade.correct;
          _grading = false;
          _score += grade.awardedMarks;
          if (!grade.correct) _mistakes += 1;
        });
        widget.onQuestionChecked?.call(_question.id, grade.correct);
        unawaited(AppSfx.instance
            .play(grade.correct ? SfxCue.correct : SfxCue.wrong));
        unawaited(_cloudRepository?.saveAttempt(
          question: _question,
          awardedMarks: grade.awardedMarks,
          maxMarks: grade.maxMarks,
        ));
      } catch (error) {
        if (!mounted) return;
        setState(() {
          _grading = false;
          _gradeError = error is FirebaseFunctionsException
              ? (error.message ?? '暫時未能完成 Paper 2 評分。')
              : '暫時未能完成 Paper 2 評分，請稍後再試。';
        });
      }
      return;
    }

    final correct = _selectedChoice == _question.correctChoice;
    setState(() {
      _checked = true;
      _correct = correct;
      if (correct) {
        _score += 1;
      } else {
        _mistakes += 1;
      }
    });
    widget.onQuestionChecked?.call(_question.id, correct);
    unawaited(AppSfx.instance.play(correct ? SfxCue.correct : SfxCue.wrong));
    unawaited(_cloudRepository?.saveAttempt(
      question: _question,
      awardedMarks: correct ? 1 : 0,
      maxMarks: 1,
    ));
  }

  void _saveCurrent() {
    final id = _question.id;
    _savedChoices[id] = _selectedChoice;
    _savedResponses[id] = _responseController.text;
    _savedDiagrams[id] = _diagram;
    _savedChecked[id] = _checked;
    _savedCorrect[id] = _correct;
    _savedGrades[id] = _grade;
    _savedErrors[id] = _gradeError;
  }

  EconDiagramState _initialDiagramFor(int index) {
    final question = widget.questions[index];
    final saved = _savedDiagrams[question.id];
    if (saved != null) return saved;
    final config = question.diagramConfig;
    final continuationKey = question.diagramContinuationKey;
    if (config?.enabled == true) {
      for (var previous = index - 1; previous >= 0; previous -= 1) {
        final candidate = widget.questions[previous];
        if (candidate.diagramContinuationKey != continuationKey) break;
        if (_savedChecked[candidate.id] == true) {
          final inherited = _savedDiagrams[candidate.id];
          if (inherited != null) return inherited;
        }
      }
    }
    return emptyDiagramForKind(config?.kind ?? 'demand-supply');
  }

  void _goTo(int index) {
    if (index < 0 || index >= widget.questions.length || index == _index) {
      return;
    }
    _saveCurrent();
    final next = widget.questions[index];
    setState(() {
      _index = index;
      _selectedChoice = _savedChoices[next.id];
      _responseController.text = _savedResponses[next.id] ?? '';
      _diagram = _initialDiagramFor(index);
      _checked = _savedChecked[next.id] ?? false;
      _correct = _savedCorrect[next.id] ?? false;
      _grade = _savedGrades[next.id];
      _gradeError = _savedErrors[next.id];
      _grading = false;
      _diagramInteracting = false;
    });
    unawaited(AppSfx.instance.play(SfxCue.next));
  }

  void _advance() {
    if (!_checked) return;
    _saveCurrent();
    if (_index == widget.questions.length - 1) {
      if (!_completionReported) {
        _completionReported = true;
        widget.onCompleted?.call(widget.questions.length);
      }
      Navigator.of(context).pushReplacement(
        MaterialPageRoute<void>(
          builder: (_) => LessonResultScreen(
            lessonLabel: 'ECON 練習',
            score: _score,
            total: _totalMarks,
            mistakes: _mistakes,
            totalLabel: '總分',
            accentColor: EconPalette.primary,
            accentDarkColor: EconPalette.primaryDark,
            accentSoftColor: EconPalette.softPrimary,
            accentShadowColor: const Color(0xFFFFE7A3),
            onClose: _close,
            onRestart: () => Navigator.of(context).pushReplacement(
              MaterialPageRoute<void>(
                builder: (_) => EconPracticeScreen(
                  questions: widget.questions,
                  cloudRepository: widget.cloudRepository,
                  onQuestionChecked: widget.onQuestionChecked,
                  onCompleted: widget.onCompleted,
                ),
              ),
            ),
          ),
        ),
      );
      return;
    }
    _goTo(_index + 1);
  }

  Future<void> _submitAndAdvance() async {
    if (_checked) {
      _advance();
      return;
    }
    if (!_ready || _grading) return;
    await _check();
    if (mounted && _checked) _advance();
  }

  @override
  Widget build(BuildContext context) {
    final question = _question;
    final english = question.language == 'en';
    final correctChoice = question.choices
        .where((choice) => choice.id == question.correctChoice)
        .firstOrNull;
    final intro = question.paper == EconPaper.p1
        ? 'Paper 1 · MC'
        : (english ? 'Paper 2 · Written' : 'Paper 2 · 長題');
    final p2Layout = question.isP2 ? _p2Layout(question) : null;
    return LessonPageScaffold(
      lessonLabel: intro,
      title: english ? 'ECON Practice' : 'ECON 練習',
      progress: (_index + 1) / widget.questions.length,
      questionLabel: '${_index + 1}/${widget.questions.length}',
      accentColor: EconPalette.primary,
      accentDarkColor: EconPalette.primaryDark,
      accentSoftColor: EconPalette.softPrimary,
      accentShadowColor: const Color(0xFFFFE7A3),
      onClose: _close,
      leftEdgeOverlay: _AnimatedPracticeArrow(
        key: const Key('econ-previous-question'),
        icon: Icons.chevron_left_rounded,
        tooltip: english ? 'Previous question' : '上一題',
        enabled: _index > 0,
        onPressed: _index == 0 ? null : () => _goTo(_index - 1),
        index: _index,
      ),
      rightEdgeOverlay: _AnimatedPracticeArrow(
        key: const Key('econ-next-question'),
        icon: Icons.chevron_right_rounded,
        tooltip: english ? 'Next question' : '下一題',
        enabled: _index < widget.questions.length - 1,
        onPressed: _index == widget.questions.length - 1
            ? null
            : () => _goTo(_index + 1),
        index: _index,
      ),
      body: SingleChildScrollView(
        key: ValueKey('econ-practice-question-${question.id}'),
        physics: _diagramInteracting
            ? const NeverScrollableScrollPhysics()
            : const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _QuestionReference(question: question),
            const SizedBox(height: 9),
            if (question.isP1 || p2Layout!.beforeVisual.isNotEmpty)
              OriginalDashedSurface(
                backgroundColor: EconPalette.softPrimary,
                borderColor: EconPalette.primary,
                strokeWidth: 3,
                radius: 20,
                shadowColor: EconPalette.border,
                shadowDepth: 4,
                padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
                child: Text(
                  question.isP1 ? question.stem : p2Layout!.beforeVisual,
                  style: const TextStyle(
                    color: AppPalette.ink,
                    fontSize: 16,
                    height: 1.38,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            if (question.isP1) ...[
              if (question.visuals.isNotEmpty) ...[
                const SizedBox(height: 10),
                _QuestionVisuals(visuals: question.visuals),
              ],
              if (question.postVisualStem?.trim().isNotEmpty ?? false) ...[
                if (question.visuals.isNotEmpty) const SizedBox(height: 2),
                if (!_sameQuestionText(
                    question.postVisualStem!.trim(), question.stem.trim()))
                  _P2Text(text: question.postVisualStem!.trim()),
              ],
              const SizedBox(height: 12),
              for (final choice in question.choices) ...[
                LessonChoiceButton(
                  label: choice.text,
                  accentColor: EconPalette.primary,
                  accentDarkColor: EconPalette.primaryDark,
                  accentSoftColor: EconPalette.softPrimary,
                  selected: _selectedChoice == choice.id,
                  correct: _checked && choice.id == question.correctChoice,
                  wrong: _checked &&
                      _selectedChoice == choice.id &&
                      choice.id != question.correctChoice,
                  onPressed: _checked
                      ? null
                      : () => setState(() => _selectedChoice = choice.id),
                ),
                const SizedBox(height: 9),
              ],
            ] else ...[
              if (question.visuals.isNotEmpty) ...[
                const SizedBox(height: 10),
                _QuestionVisuals(visuals: question.visuals),
              ],
              if (p2Layout!.afterVisual.isNotEmpty &&
                  !_sameQuestionText(p2Layout.afterVisual, p2Layout.prompt))
                _P2Text(text: p2Layout.afterVisual),
              if (p2Layout.prompt.isNotEmpty) ...[
                const SizedBox(height: 10),
                OriginalDashedSurface(
                  backgroundColor: EconPalette.softPrimary,
                  borderColor: EconPalette.primary,
                  radius: 16,
                  strokeWidth: 2,
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (p2Layout.label.isNotEmpty) ...[
                        Text(
                          p2Layout.label,
                          style: const TextStyle(
                            color: EconPalette.primaryDark,
                            fontSize: 13,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        const SizedBox(height: 4),
                      ],
                      Text(
                        p2Layout.prompt,
                        style: const TextStyle(
                          color: AppPalette.ink,
                          fontSize: 16,
                          height: 1.38,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              if (question.diagramConfig?.enabled ?? false) ...[
                const SizedBox(height: 12),
                EconDiagramEditor(
                  key: ValueKey('econ-diagram-${question.id}'),
                  value: _diagram,
                  language: question.language,
                  diagramKind: question.diagramConfig?.kind ?? 'demand-supply',
                  mode: question.diagramConfig?.mode ?? 'create',
                  policy: question.diagramConfig?.policy,
                  requiresSplitPrice:
                      question.diagramConfig?.requiresSplitPrice ?? false,
                  sourceSeed: _diagramSourceSeed,
                  requirements:
                      question.diagramConfig?.requirements ?? const [],
                  disabled: _checked,
                  onInteractionChanged: (active) {
                    if (_diagramInteracting == active) return;
                    setState(() => _diagramInteracting = active);
                  },
                  onChanged: (value) => setState(() => _diagram = value),
                ),
              ],
              const SizedBox(height: 12),
              OriginalDashedSurface(
                backgroundColor: Colors.white,
                borderColor: EconPalette.primary,
                radius: 18,
                strokeWidth: 3,
                shadowColor: EconPalette.border,
                shadowDepth: 4,
                padding: const EdgeInsets.all(5),
                child: TextField(
                  controller: _responseController,
                  enabled: !_checked,
                  minLines: 3,
                  maxLines: 8,
                  onChanged: (_) => setState(() {}),
                  decoration: InputDecoration(
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.all(10),
                    hintText:
                        english ? 'Type your answer / analysis' : '輸入答案／分析',
                  ),
                  style: const TextStyle(
                    color: AppPalette.ink,
                    fontSize: 16,
                    height: 1.35,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
            if (_gradeError?.isNotEmpty ?? false) ...[
              const SizedBox(height: 12),
              LessonFeedbackCard(
                correct: false,
                title: '未能提交評分',
                lines: [_gradeError!],
              ),
            ],
            if (_checked) ...[
              const SizedBox(height: 12),
              if (_question.isP2 && _grade != null)
                _P2GradeFeedback(
                  grade: _grade!,
                  english: _question.language == 'en',
                )
              else
                LessonFeedbackCard(
                  correct: _correct,
                  title: _question.isP1
                      ? (english
                          ? (_correct ? 'Correct!' : 'Review this one')
                          : (_correct ? '答對！' : '再諗一諗'))
                      : (english ? 'Answer recorded' : '答案已記錄'),
                  lines: [
                    if (_grade?.summary.isNotEmpty ?? false) _grade!.summary,
                    ...?_grade?.missingPoints,
                    if (_question.explanation?.isNotEmpty ?? false)
                      _question.explanation!,
                  ],
                  answer: _question.isP1 && correctChoice != null
                      ? correctChoice.text
                      : null,
                  answerPrefix: english ? 'Correct answer: ' : '正確答案：',
                ),
              if (_question.isP1 && _question.language == 'en')
                _EnglishChineseP1Answer(question: _question),
              if (_question.isP2) ...[
                const SizedBox(height: 10),
                _P2ReferenceAnswer(question: _question),
              ],
            ],
            const SizedBox(height: 14),
          ],
        ),
      ),
      bottom: _checked
          ? LessonPrimaryButton(
              label: _index == widget.questions.length - 1
                  ? (english ? 'Results' : '查看結果')
                  : (english ? 'Continue' : '繼續'),
              icon: _index == widget.questions.length - 1
                  ? Icons.query_stats_rounded
                  : Icons.arrow_forward_rounded,
              onPressed: _advance,
              sticker: true,
            )
          : LayoutBuilder(
              builder: (context, constraints) {
                final check = LessonPrimaryButton(
                  key: const Key('econ-check-answer'),
                  label: _grading
                      ? (english ? 'Marking…' : '評分中…')
                      : (english ? 'Check now' : '檢查答案'),
                  icon: question.isP1
                      ? Icons.check_circle_outline_rounded
                      : Icons.auto_awesome_rounded,
                  onPressed:
                      _ready && !_grading ? () => unawaited(_check()) : null,
                  sticker: true,
                );
                final next = LessonPrimaryButton(
                  key: const Key('econ-submit-next'),
                  label: _index == widget.questions.length - 1
                      ? (english ? 'Results' : '查看結果')
                      : (english ? 'Next' : '下一題'),
                  icon: _index == widget.questions.length - 1
                      ? Icons.query_stats_rounded
                      : Icons.arrow_forward_rounded,
                  onPressed: _ready && !_grading
                      ? () => unawaited(_submitAndAdvance())
                      : null,
                  sticker: true,
                );
                return Row(
                  children: [
                    Expanded(child: check),
                    const SizedBox(width: 8),
                    Expanded(child: next),
                  ],
                );
              },
            ),
    );
  }
}

class _P2Layout {
  const _P2Layout({
    required this.beforeVisual,
    required this.afterVisual,
    required this.label,
    required this.prompt,
  });

  final String beforeVisual;
  final String afterVisual;
  final String label;
  final String prompt;
}

class _P2GradeFeedback extends StatelessWidget {
  const _P2GradeFeedback({required this.grade, required this.english});

  final EconGradeResult grade;
  final bool english;

  @override
  Widget build(BuildContext context) {
    final full = grade.maxMarks > 0 && grade.awardedMarks == grade.maxMarks;
    final partial = grade.awardedMarks > 0 && !full;
    final statusColor = full
        ? AppPalette.correctDark
        : partial
            ? EconPalette.primaryDark
            : AppPalette.dangerDark;
    final background = full
        ? AppPalette.softSecondary
        : partial
            ? EconPalette.softPrimary
            : Colors.white;
    return OriginalDashedSurface(
      radius: 22,
      strokeWidth: 4,
      borderColor: statusColor,
      shadowColor: statusColor.withValues(alpha: .2),
      shadowDepth: 5,
      backgroundColor: background,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Icon(
                full ? Icons.check_circle_rounded : Icons.fact_check_rounded,
                color: statusColor,
                size: 28,
              ),
              const SizedBox(width: 9),
              Expanded(
                child: Text(
                  '${grade.awardedMarks} / ${grade.maxMarks} ${english ? 'marks' : '分'}',
                  style: TextStyle(
                    color: statusColor,
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ],
          ),
          if (grade.summary.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              grade.summary,
              style: const TextStyle(
                color: AppPalette.ink,
                fontSize: 15,
                height: 1.35,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
          if (grade.criteria.isNotEmpty) ...[
            const SizedBox(height: 12),
            for (var index = 0; index < grade.criteria.length; index++) ...[
              _P2CriterionRow(
                index: index,
                criterion: grade.criteria[index],
                english: english,
              ),
              if (index != grade.criteria.length - 1) const SizedBox(height: 8),
            ],
          ] else if (grade.missingPoints.isNotEmpty) ...[
            const SizedBox(height: 8),
            for (final point in grade.missingPoints)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  english ? 'Missing: $point' : '未達：$point',
                  style: const TextStyle(
                    color: AppPalette.dangerDark,
                    fontSize: 14,
                    height: 1.3,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
          ],
        ],
      ),
    );
  }
}

class _P2CriterionRow extends StatelessWidget {
  const _P2CriterionRow({
    required this.index,
    required this.criterion,
    required this.english,
  });

  final int index;
  final EconGradeCriterion criterion;
  final bool english;

  @override
  Widget build(BuildContext context) {
    final met = criterion.awardedMarks == criterion.maxMarks;
    final partial = criterion.awardedMarks > 0 && !met;
    final color = met
        ? AppPalette.correctDark
        : partial
            ? EconPalette.primaryDark
            : AppPalette.dangerDark;
    return OriginalDashedSurface(
      radius: 15,
      strokeWidth: 2,
      borderColor: color.withValues(alpha: .65),
      shadowColor: Colors.transparent,
      shadowDepth: 0,
      backgroundColor: Colors.white.withValues(alpha: .75),
      padding: const EdgeInsets.fromLTRB(11, 9, 11, 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(
                met
                    ? Icons.check_circle_rounded
                    : partial
                        ? Icons.remove_circle_rounded
                        : Icons.cancel_rounded,
                color: color,
                size: 20,
              ),
              const SizedBox(width: 7),
              Expanded(
                child: Text(
                  english
                      ? 'Marking point ${index + 1}: ${criterion.markingPoint}'
                      : '評分點 ${index + 1}：${criterion.markingPoint}',
                  style: const TextStyle(
                    color: AppPalette.ink,
                    fontSize: 14,
                    height: 1.3,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              const SizedBox(width: 7),
              Text(
                '${criterion.awardedMarks}/${criterion.maxMarks}',
                style: TextStyle(
                  color: color,
                  fontSize: 13,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
          if (criterion.feedback.isNotEmpty) ...[
            const SizedBox(height: 5),
            Text(
              criterion.feedback,
              style: const TextStyle(
                color: AppPalette.muted,
                fontSize: 13,
                height: 1.3,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
          if (criterion.evidence.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              english
                  ? 'Evidence: “${criterion.evidence.join('; ')}”'
                  : '答案依據：「${criterion.evidence.join('；')}」',
              style: const TextStyle(
                color: AppPalette.primaryDark,
                fontSize: 12,
                height: 1.3,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
          if (criterion.missingPoint.isNotEmpty && !met) ...[
            const SizedBox(height: 4),
            Text(
              english
                  ? 'Still needed: ${criterion.missingPoint}'
                  : '尚欠：${criterion.missingPoint}',
              style: const TextStyle(
                color: AppPalette.dangerDark,
                fontSize: 12,
                height: 1.3,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _P2ReferenceAnswer extends StatelessWidget {
  const _P2ReferenceAnswer({required this.question});

  final EconQuestion question;

  @override
  Widget build(BuildContext context) {
    final english = question.language == 'en';
    final parts = question.parts;
    final answers = parts
        .map((part) => part.modelAnswer?.trim() ?? '')
        .where((answer) => answer.isNotEmpty)
        .toList(growable: false);
    final resolvedAnswers = answers.isNotEmpty
        ? answers
        : (question.explanation?.trim().isNotEmpty ?? false)
            ? <String>[question.explanation!.trim()]
            : const <String>[];
    final markingPoints = parts
        .expand((part) => part.markingPoints)
        .where((point) => point.trim().isNotEmpty)
        .toList(growable: false);
    final paired = EconQuestionRepository.pairedQuestion(question);
    final pairedAnswers = paired == null
        ? const <String>[]
        : _modelAnswers(paired)
            .split('\n\n')
            .where((answer) => answer.trim().isNotEmpty)
            .toList(growable: false);
    final pairedMarkingPoints = paired == null
        ? const <String>[]
        : paired.parts
            .expand((part) => part.markingPoints)
            .where((point) => point.trim().isNotEmpty)
            .toList(growable: false);
    final answerVisuals = [
      ...question.answerVisuals,
      ...parts.expand((part) => part.answerVisuals),
    ];
    final pairedAnswerVisuals = paired == null
        ? const <EconQuestionVisual>[]
        : <EconQuestionVisual>[
            ...paired.answerVisuals,
            ...paired.parts.expand((part) => part.answerVisuals),
          ];
    if (resolvedAnswers.isEmpty &&
        markingPoints.isEmpty &&
        answerVisuals.isEmpty &&
        pairedAnswers.isEmpty &&
        pairedMarkingPoints.isEmpty &&
        pairedAnswerVisuals.isEmpty) {
      return const SizedBox.shrink();
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (resolvedAnswers.isNotEmpty)
          _P2ReferenceBlock(
            title: english ? 'Official model answer' : '參考答案',
            child: Text(
              resolvedAnswers.join('\n\n'),
              style: const TextStyle(
                color: AppPalette.ink,
                fontSize: 15,
                height: 1.4,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        if (english && paired != null) ...[
          const SizedBox(height: 10),
          _P2ReferenceBlock(
            title: '中文參考答案',
            child: Text(
              pairedAnswers.join('\n\n'),
              style: const TextStyle(
                color: AppPalette.ink,
                fontSize: 15,
                height: 1.4,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
        if (english && pairedAnswerVisuals.isNotEmpty) ...[
          const SizedBox(height: 10),
          _P2ReferenceBlock(
            title: '中文標準答案圖',
            child: _QuestionVisuals(visuals: pairedAnswerVisuals),
          ),
        ],
        if (answerVisuals.isNotEmpty) ...[
          if (resolvedAnswers.isNotEmpty) const SizedBox(height: 10),
          _P2ReferenceBlock(
            title: english ? 'Official answer diagram' : '標準答案圖',
            child: _QuestionVisuals(visuals: answerVisuals),
          ),
        ],
        if (markingPoints.isNotEmpty) ...[
          if (resolvedAnswers.isNotEmpty || answerVisuals.isNotEmpty)
            const SizedBox(height: 10),
          _P2ReferenceBlock(
            title: english ? 'Marking points' : '評分重點',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                for (final point in markingPoints)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Text(
                      '• $point',
                      style: const TextStyle(
                        color: AppPalette.ink,
                        fontSize: 14,
                        height: 1.3,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
        if (english && pairedMarkingPoints.isNotEmpty) ...[
          const SizedBox(height: 10),
          _P2ReferenceBlock(
            title: '中文評分重點',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                for (final point in pairedMarkingPoints)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Text(
                      '• $point',
                      style: const TextStyle(
                        color: AppPalette.ink,
                        fontSize: 14,
                        height: 1.3,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  static String _modelAnswers(EconQuestion question) => question.parts
      .map((part) => part.modelAnswer?.trim() ?? '')
      .where((answer) => answer.isNotEmpty)
      .join('\n\n');
}

class _EnglishChineseP1Answer extends StatelessWidget {
  const _EnglishChineseP1Answer({required this.question});

  final EconQuestion question;

  @override
  Widget build(BuildContext context) {
    final paired = EconQuestionRepository.pairedQuestion(question);
    if (paired == null) return const SizedBox.shrink();
    final chineseChoice = paired.choices
        .where((choice) => choice.id == paired.correctChoice)
        .firstOrNull;
    final chineseExplanation = paired.explanation?.trim() ?? '';
    return Padding(
      padding: const EdgeInsets.only(top: 10),
      child: _P2ReferenceBlock(
        title: '中文答案',
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (chineseChoice != null)
              Text(
                chineseChoice.text,
                style: const TextStyle(
                  color: AppPalette.ink,
                  fontSize: 15,
                  height: 1.35,
                  fontWeight: FontWeight.w800,
                ),
              ),
            if (chineseExplanation.isNotEmpty) ...[
              const SizedBox(height: 6),
              Text(
                chineseExplanation,
                style: const TextStyle(
                  color: AppPalette.ink,
                  fontSize: 14,
                  height: 1.35,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _P2ReferenceBlock extends StatelessWidget {
  const _P2ReferenceBlock({required this.title, required this.child});

  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return OriginalDashedSurface(
      radius: 18,
      strokeWidth: 2,
      borderColor: EconPalette.primary,
      shadowColor: EconPalette.border,
      shadowDepth: 3,
      backgroundColor: Colors.white,
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: EconPalette.primaryDark,
              fontSize: 14,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 6),
          child,
        ],
      ),
    );
  }
}

_P2Layout _p2Layout(EconQuestion question) {
  final part = question.parts.isEmpty ? null : question.parts.first;
  final prompt = part?.prompt?.trim() ?? '';
  final preferredPreVisual = question.preVisualStem?.trim() ?? '';
  final rawBefore =
      preferredPreVisual.isNotEmpty ? preferredPreVisual : question.stem.trim();
  var before = rawBefore;
  final partBlock = RegExp(r'(?:^|\n)[ \t]*(?:\([a-z]\)|（[a-z]）)(?=[ \t\n])',
          caseSensitive: false)
      .firstMatch(before);
  if (partBlock != null) {
    before = before.substring(0, partBlock.start).trim();
  } else if (prompt.isNotEmpty) {
    final promptIndex = before.indexOf(prompt);
    if (promptIndex >= 0) before = before.substring(0, promptIndex).trim();
  }
  final after = question.postVisualStem?.trim() ?? '';
  return _P2Layout(
    beforeVisual: before,
    afterVisual: after,
    label: part?.label?.trim() ?? '',
    prompt: prompt.isNotEmpty
        ? prompt
        : (before.isEmpty ? question.stem.trim() : ''),
  );
}

bool _sameQuestionText(String left, String right) =>
    left.replaceAll(RegExp(r'\s+'), ' ').trim().toLowerCase() ==
    right.replaceAll(RegExp(r'\s+'), ' ').trim().toLowerCase();

class _AnimatedPracticeArrow extends StatefulWidget {
  const _AnimatedPracticeArrow({
    super.key,
    required this.icon,
    required this.tooltip,
    required this.onPressed,
    required this.enabled,
    required this.index,
  });

  final IconData icon;
  final String tooltip;
  final VoidCallback? onPressed;
  final bool enabled;
  final int index;

  @override
  State<_AnimatedPracticeArrow> createState() => _AnimatedPracticeArrowState();
}

class _AnimatedPracticeArrowState extends State<_AnimatedPracticeArrow> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final left = widget.icon == Icons.chevron_left_rounded;
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 220),
      transitionBuilder: (child, animation) => SlideTransition(
        position: Tween<Offset>(
          begin: Offset(left ? -.35 : .35, 0),
          end: Offset.zero,
        ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOut)),
        child: FadeTransition(opacity: animation, child: child),
      ),
      child: AnimatedScale(
        // Keep the animation identity tied to the side, not the question
        // index. Changing question state must not animate both arrows.
        key: ValueKey(left ? 'previous-arrow' : 'next-arrow'),
        scale: _pressed ? .88 : 1,
        duration: const Duration(milliseconds: 110),
        child: Material(
          type: MaterialType.transparency,
          child: InkWell(
            splashColor: Colors.transparent,
            highlightColor: Colors.transparent,
            hoverColor: Colors.transparent,
            focusColor: Colors.transparent,
            overlayColor: const WidgetStatePropertyAll(Colors.transparent),
            onTap: widget.onPressed,
            onTapDown:
                widget.enabled ? (_) => setState(() => _pressed = true) : null,
            onTapUp:
                widget.enabled ? (_) => setState(() => _pressed = false) : null,
            onTapCancel:
                widget.enabled ? () => setState(() => _pressed = false) : null,
            child: Semantics(
              button: true,
              label: widget.tooltip,
              child: SizedBox(
                // The image remains small, but the whole 92×112 area is the
                // hit target. It sits just inside the frame edge so taps do
                // not land on the frame's own gesture surface.
                width: 92,
                height: 112,
                child: Center(
                  child: Transform.translate(
                    // Keep the artwork at the original frame-overlap
                    // position. Only the invisible hit target stays inside.
                    offset: Offset(left ? -42 : 42, 0),
                    child: Opacity(
                      opacity: widget.enabled ? 1 : .35,
                      child: Transform.flip(
                        flipX: left,
                        child: Image.asset(
                          'assets/branding/next-arrow-2.png',
                          width: 34,
                          height: 34,
                          fit: BoxFit.contain,
                        ),
                      ),
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

class _QuestionReference extends StatelessWidget {
  const _QuestionReference({required this.question});

  final EconQuestion question;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            '第 ${question.chapterNo} 課 · ${question.chapterTitle}',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: EconPalette.primaryDark,
              fontSize: 13,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
        Text(
          '${question.setLabel}  ${question.questionRef}',
          style: const TextStyle(
            color: AppPalette.muted,
            fontSize: 12,
            fontWeight: FontWeight.w800,
          ),
        ),
      ],
    );
  }
}

class _P2Text extends StatelessWidget {
  const _P2Text({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 10),
      child: Text(
        text,
        style: const TextStyle(
          color: AppPalette.ink,
          fontSize: 15,
          height: 1.35,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class _QuestionVisuals extends StatelessWidget {
  const _QuestionVisuals({required this.visuals});

  final List<EconQuestionVisual> visuals;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (final visual in visuals) ...[
          if (visual.kind == 'table' && visual.columns.isNotEmpty)
            _QuestionTable(visual: visual)
          else if (visual.kind == 'image' || visual.kind == 'diagram')
            _QuestionImage(visual: visual)
          else if ((visual.caption?.isNotEmpty ?? false) ||
              (visual.title?.isNotEmpty ?? false) ||
              (visual.body?.isNotEmpty ?? false))
            OriginalDashedSurface(
              backgroundColor: const Color(0xFFF8FBFB),
              borderColor: AppPalette.border,
              radius: 16,
              strokeWidth: 2,
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (visual.caption?.isNotEmpty ?? false)
                    Text(
                      visual.caption!,
                      style: const TextStyle(
                        color: EconPalette.primaryDark,
                        fontSize: 13,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  if (visual.title?.isNotEmpty ?? false)
                    Text(
                      visual.title!,
                      style: const TextStyle(
                        color: AppPalette.ink,
                        fontSize: 15,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  if (visual.body?.isNotEmpty ?? false)
                    Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        visual.body!,
                        style: const TextStyle(
                          color: AppPalette.ink,
                          fontSize: 14,
                          height: 1.35,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                ],
              ),
            ),
          const SizedBox(height: 8),
        ],
      ],
    );
  }
}

class _QuestionImage extends StatelessWidget {
  const _QuestionImage({required this.visual});

  final EconQuestionVisual visual;

  @override
  Widget build(BuildContext context) {
    final asset = visual.src == null ? null : econVisualAssets[visual.src!];
    return OriginalDashedSurface(
      backgroundColor: Colors.white,
      borderColor: AppPalette.border,
      radius: 16,
      strokeWidth: 2,
      padding: const EdgeInsets.all(7),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (asset != null)
            Image.asset(
              asset,
              fit: BoxFit.contain,
              filterQuality: FilterQuality.high,
              errorBuilder: (_, __, ___) => const _MissingVisual(),
            )
          else
            const _MissingVisual(),
          if (visual.caption?.isNotEmpty ?? false) ...[
            const SizedBox(height: 5),
            Text(
              visual.caption!,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: AppPalette.muted,
                fontSize: 12,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _MissingVisual extends StatelessWidget {
  const _MissingVisual();

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.all(24),
      child: Icon(
        Icons.image_not_supported_outlined,
        color: AppPalette.border,
        size: 44,
      ),
    );
  }
}

class _QuestionTable extends StatelessWidget {
  const _QuestionTable({required this.visual});

  final EconQuestionVisual visual;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final outerWidth = constraints.maxWidth.isFinite
            ? constraints.maxWidth
            : MediaQuery.sizeOf(context).width;
        final narrow = _tableNeedsVerticalLayout(visual, outerWidth);
        final tableVisual = narrow ? _transposeWideTable(visual) : visual;
        final sourceHeading = _tableSourceHeading(visual.caption);
        final viewportWidth = math.max(0.0, outerWidth - 16);
        final layout = _questionTableLayout(tableVisual, viewportWidth);
        return OriginalDashedSurface(
          key: Key(narrow
              ? 'econ-vertical-question-table'
              : 'econ-horizontal-question-table'),
          backgroundColor: Colors.white,
          borderColor: AppPalette.border,
          radius: 16,
          strokeWidth: 2,
          padding: const EdgeInsets.all(8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (sourceHeading != null) ...[
                Text(
                  sourceHeading,
                  key: const Key('econ-question-table-source-heading'),
                  style: const TextStyle(
                    color: AppPalette.ink,
                    fontSize: 13,
                    height: 1.25,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 7),
              ],
              Align(
                alignment: Alignment.centerLeft,
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: SizedBox(
                    key: const Key('econ-question-table-content'),
                    width: layout.totalWidth,
                    child: Table(
                      columnWidths: layout.columnWidths,
                      border:
                          TableBorder.all(color: AppPalette.border, width: 1),
                      children: [
                        TableRow(
                          decoration: const BoxDecoration(
                              color: EconPalette.softPrimary),
                          children: [
                            for (final column in tableVisual.columns)
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 7),
                                child: Text(
                                  _wrappedTableHeader(column),
                                  style: const TextStyle(
                                    color: EconPalette.primaryDark,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                              ),
                          ],
                        ),
                        for (final row in tableVisual.rows)
                          TableRow(
                            children: [
                              for (var index = 0;
                                  index < tableVisual.columns.length;
                                  index++)
                                Padding(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 8, vertical: 6),
                                  child: Text(
                                    index < row.length ? '${row[index]}' : '',
                                    style: const TextStyle(
                                      color: AppPalette.ink,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

String? _tableSourceHeading(String? value) {
  final caption = value?.trim() ?? '';
  if (caption.isEmpty) return null;
  return RegExp(
    r'^(?:Source\s+[A-Z0-9一二三四五六七八九十]+|資料\s*[A-Z0-9一二三四五六七八九十]+)\s*[:：]',
    caseSensitive: false,
  ).hasMatch(caption)
      ? caption
      : null;
}

bool _tableNeedsVerticalLayout(EconQuestionVisual visual, double width) {
  // Keep compact two- and three-column source tables as one table. The
  // content-aware widths below can usually fit them without a side scroll;
  // splitting every source row into a card loses the original table structure.
  if (visual.columns.length <= 3) return false;
  if (visual.rows.isEmpty) return false;
  final totalText = visual.columns
          .fold<int>(0, (total, column) => total + column.length) +
      visual.rows.take(4).fold<int>(
          0,
          (total, row) =>
              total + row.fold<int>(0, (sum, cell) => sum + '$cell'.length));
  final numericCells = [
    ...visual.rows.take(6).expand((row) => row),
  ].where(_looksNumericCell).length;
  final denseNumeric = numericCells >= 4 &&
      numericCells >= visual.rows.take(6).length &&
      visual.columns.length >= 4;
  return width <= 390 &&
      (totalText > 92 || (denseNumeric && visual.columns.length >= 4));
}

EconQuestionVisual _transposeWideTable(EconQuestionVisual visual) {
  if (visual.columns.length <= 1 || visual.rows.isEmpty) return visual;
  return EconQuestionVisual(
    kind: visual.kind,
    columns: [
      visual.columns.first,
      for (final row in visual.rows)
        if (row.isNotEmpty) '${row.first}',
    ],
    rows: [
      for (var columnIndex = 1;
          columnIndex < visual.columns.length;
          columnIndex++)
        [
          visual.columns[columnIndex],
          for (final row in visual.rows)
            columnIndex < row.length ? row[columnIndex] : '',
        ],
    ],
  );
}

String _wrappedTableHeader(String value) {
  return value.replaceFirstMapped(
    RegExp(r'\s*([（(])'),
    (match) => '\n${match.group(1)}',
  );
}

({Map<int, TableColumnWidth> columnWidths, double totalWidth})
    _questionTableLayout(EconQuestionVisual visual, double availableWidth) {
  final widths = <double>[];
  final minimumWidths = <double>[];
  final growWeights = <double>[];
  for (var index = 0; index < visual.columns.length; index++) {
    final header = visual.columns[index];
    final values = visual.rows
        .map((row) => index < row.length ? '${row[index]}' : '')
        .toList(growable: false);
    final numeric = values.every(
      (value) => value.trim().isEmpty || _looksNumericCell(value),
    );
    final ideal = <String>[header, ...values]
        .map(_estimatedTableTextWidth)
        .fold<double>(0, (longest, value) => math.max(longest, value));
    final minimum = numeric ? 68.0 : 96.0;
    minimumWidths.add(minimum);
    growWeights.add(numeric ? .45 : 1);
    widths.add((ideal + 24).clamp(minimum, numeric ? 112.0 : 240.0));
  }

  var totalWidth = widths.fold<double>(0, (total, value) => total + value);
  var overflow = math.max(0.0, totalWidth - availableWidth);
  while (overflow > .5) {
    final shrinkable = <int>[
      for (var index = 0; index < widths.length; index++)
        if (widths[index] > minimumWidths[index] + .5) index,
    ];
    if (shrinkable.isEmpty) break;
    final share = overflow / shrinkable.length;
    var reduced = 0.0;
    for (final index in shrinkable) {
      final amount = math.min(share, widths[index] - minimumWidths[index]);
      widths[index] -= amount;
      reduced += amount;
    }
    if (reduced <= .5) break;
    overflow -= reduced;
  }
  totalWidth = widths.fold<double>(0, (total, value) => total + value);
  final fillFraction = switch (visual.columns.length) {
    1 => .78,
    2 => .86,
    _ => .96,
  };
  final fillTarget = availableWidth * fillFraction;
  if (totalWidth < fillTarget && widths.isNotEmpty) {
    final extra = fillTarget - totalWidth;
    final weightTotal =
        growWeights.fold<double>(0, (total, value) => total + value);
    for (var index = 0; index < widths.length; index++) {
      widths[index] += extra * growWeights[index] / weightTotal;
    }
    totalWidth = widths.fold<double>(0, (total, value) => total + value);
  }
  return (
    columnWidths: {
      for (var index = 0; index < widths.length; index++)
        index: FixedColumnWidth(widths[index]),
    },
    totalWidth: totalWidth,
  );
}

double _estimatedTableTextWidth(String value) {
  final text = value.trim();
  if (text.isEmpty) return 0;
  final cjk = RegExp(r'[\u3400-\u9fff]').allMatches(text).length;
  final nonCjk = text.length - cjk;
  return cjk * 13 + nonCjk * 7.2;
}

bool _looksNumericCell(Object? value) {
  final text = '$value'.trim();
  if (text.isEmpty || text == '-' || text == '—') return true;
  return RegExp(
    r'^[\s\$€£¥₩]*[-+]?\d{1,3}(?:[\s,]\d{3})*(?:\.\d+)?\s*%?$|^[\s\$€£¥₩]*[-+]?\d+(?:\.\d+)?\s*%?$',
  ).hasMatch(text);
}
