import 'dart:async';

import 'package:flutter/material.dart';

import '../../core/app_palette.dart';
import '../../core/app_sfx.dart';
import '../../core/widgets/stationery_frame.dart';
import '../grammar/shared/lesson_ui.dart';
import 'econ_concept_review_models.dart';
import 'econ_concept_review_repository.dart';
import 'econ_palette.dart';

class EconConceptReviewScreen extends StatefulWidget {
  const EconConceptReviewScreen({
    this.repository,
    this.sfx,
    this.questionCount,
    this.onQuestionCorrect,
    this.onClose,
    this.onCompleted,
    this.initialLanguage = EconReviewLanguage.zh,
    super.key,
  });

  final EconConceptReviewBankRepository? repository;
  final LessonSfx? sfx;
  final int? questionCount;
  final VoidCallback? onQuestionCorrect;
  final VoidCallback? onClose;
  final ValueChanged<int>? onCompleted;
  final EconReviewLanguage initialLanguage;

  @override
  State<EconConceptReviewScreen> createState() =>
      _EconConceptReviewScreenState();
}

class _EconConceptReviewScreenState extends State<EconConceptReviewScreen>
    with SingleTickerProviderStateMixin {
  late final EconConceptReviewBankRepository _repository;
  late final LessonSfx _sfx;
  late final AnimationController _flightController;
  final GlobalKey _stageKey = GlobalKey();
  final GlobalKey _flightTargetKey = GlobalKey();
  final Map<int, GlobalKey> _bankKeys = {};
  final TextEditingController _responseController = TextEditingController();

  EconConceptReviewLesson? _lesson;
  Object? _loadError;
  late EconReviewLanguage _language;
  int _index = 0;
  int _score = 0;
  int _mistakes = 0;
  bool _checked = false;
  bool _correct = false;
  bool _completed = false;
  bool _completionReported = false;
  List<String> _selectedTokens = const [];
  List<int> _selectedTokenIndexes = const [];
  Object? _selectedOption;
  String _response = '';
  _EconReviewFlight? _flight;
  int? _hiddenTokenIndex;

  LessonSfx get _lessonSfx => widget.sfx ?? AppSfx.instance;

  @override
  void initState() {
    super.initState();
    _language = widget.initialLanguage;
    _repository = widget.repository ?? const EconConceptReviewRepository();
    _sfx = widget.sfx ?? AppSfx.instance;
    _flightController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 420),
    )..addStatusListener((status) {
        if (status != AnimationStatus.completed || !mounted) return;
        setState(() {
          _flight = null;
          _hiddenTokenIndex = null;
        });
        _flightController.reset();
      });
    unawaited(_load());
  }

  Future<void> _load() async {
    try {
      final lesson = await _repository.loadLesson();
      if (!mounted) return;
      setState(() => _lesson = lesson.limitedTo(widget.questionCount ?? 0));
    } catch (error) {
      if (!mounted) return;
      setState(() => _loadError = error);
    }
  }

  @override
  void dispose() {
    _flightController.dispose();
    _responseController.dispose();
    super.dispose();
  }

  void _close() {
    unawaited(_lessonSfx.play(SfxCue.click));
    if (widget.onClose != null) {
      widget.onClose!();
    } else {
      Navigator.of(context).pop();
    }
  }

  void _setLanguage(EconReviewLanguage language) {
    if (_language == language) return;
    setState(() {
      _language = language;
      _index = 0;
      _score = 0;
      _mistakes = 0;
      _completed = false;
      _resetAnswer();
    });
  }

  void _resetAnswer() {
    _checked = false;
    _correct = false;
    _selectedTokens = const [];
    _selectedTokenIndexes = const [];
    _selectedOption = null;
    _response = '';
    _responseController.clear();
    _flight = null;
    _hiddenTokenIndex = null;
    _bankKeys.clear();
    _flightController.reset();
  }

  void _next() {
    final lesson = _lesson;
    if (lesson == null || !_checked) return;
    if (_index == lesson.exercises.length - 1) {
      setState(() => _completed = true);
      if (!_completionReported) {
        _completionReported = true;
        widget.onCompleted?.call(lesson.exercises.length);
      }
      unawaited(_sfx.play(SfxCue.complete));
      return;
    }
    setState(() {
      _index += 1;
      _resetAnswer();
    });
    unawaited(_sfx.play(SfxCue.next));
  }

  void _restart() {
    setState(() {
      _index = 0;
      _score = 0;
      _mistakes = 0;
      _completed = false;
      _completionReported = false;
      _resetAnswer();
    });
    unawaited(_sfx.play(SfxCue.start));
  }

  void _check() {
    final lesson = _lesson;
    if (lesson == null || _checked || !_answerReady) return;
    final exercise = lesson.exercises[_index];
    final correct = econConceptReviewIsCorrect(
      exercise: exercise,
      language: _language,
      selectedTokens: _selectedTokens,
      selectedOption: _selectedOption,
      response: _response,
    );
    setState(() {
      _checked = true;
      _correct = correct;
      if (correct) {
        _score += 1;
      } else {
        _mistakes += 1;
      }
    });
    unawaited(_sfx.play(correct ? SfxCue.correct : SfxCue.wrong));
    if (correct) widget.onQuestionCorrect?.call();
  }

  bool get _answerReady {
    final lesson = _lesson;
    if (lesson == null) return false;
    final exercise = lesson.exercises[_index];
    return switch (exercise.type) {
      EconConceptReviewExerciseType.reorder => _selectedTokens.isNotEmpty,
      EconConceptReviewExerciseType.type => _response.trim().isNotEmpty,
      EconConceptReviewExerciseType.symbol ||
      EconConceptReviewExerciseType.trueFalse =>
        _selectedOption != null,
    };
  }

  void _selectOption(Object value) {
    if (_checked) return;
    setState(() => _selectedOption = value);
    unawaited(_sfx.play(SfxCue.step));
  }

  void _removeTokenAt(int position) {
    if (_checked || _flight != null) return;
    setState(() {
      final tokens = [..._selectedTokens]..removeAt(position);
      final indexes = [..._selectedTokenIndexes]..removeAt(position);
      _selectedTokens = tokens;
      _selectedTokenIndexes = indexes;
    });
    unawaited(_sfx.play(SfxCue.click));
  }

  void _selectToken(String token, int tokenIndex) {
    if (_checked ||
        _flight != null ||
        _selectedTokenIndexes.contains(tokenIndex)) {
      return;
    }
    final sourceContext = _bankKeys[tokenIndex]?.currentContext;
    final sourceBox = sourceContext?.findRenderObject() as RenderBox?;
    final stageBox = _stageKey.currentContext?.findRenderObject() as RenderBox?;
    if (sourceBox == null || stageBox == null || !sourceBox.hasSize) {
      _placeToken(token, tokenIndex);
      return;
    }
    final startGlobal = sourceBox.localToGlobal(Offset.zero);
    final start = stageBox.globalToLocal(startGlobal);
    setState(() {
      _selectedTokens = [..._selectedTokens, token];
      _selectedTokenIndexes = [..._selectedTokenIndexes, tokenIndex];
      _hiddenTokenIndex = tokenIndex;
      _flight = _EconReviewFlight(
        token: token,
        tokenIndex: tokenIndex,
        start: start,
        end: start,
      );
    });
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || _flight?.tokenIndex != tokenIndex) return;
      final targetBox =
          _flightTargetKey.currentContext?.findRenderObject() as RenderBox?;
      final latestStageBox =
          _stageKey.currentContext?.findRenderObject() as RenderBox?;
      if (targetBox == null || latestStageBox == null || !targetBox.hasSize) {
        _flightController.forward(from: 0);
        return;
      }
      final targetGlobal = targetBox.localToGlobal(Offset.zero);
      setState(() {
        final current = _flight;
        if (current == null) return;
        _flight = _EconReviewFlight(
          token: current.token,
          tokenIndex: current.tokenIndex,
          start: current.start,
          end: latestStageBox.globalToLocal(targetGlobal),
        );
      });
      _flightController.forward(from: 0);
    });
  }

  void _placeToken(String token, int tokenIndex) {
    setState(() {
      _selectedTokens = [..._selectedTokens, token];
      _selectedTokenIndexes = [..._selectedTokenIndexes, tokenIndex];
    });
    unawaited(_sfx.play(SfxCue.step));
  }

  @override
  Widget build(BuildContext context) {
    final lesson = _lesson;
    if (_loadError != null) return _LoadError(onClose: _close, onRetry: _load);
    if (lesson == null) {
      return const Scaffold(
        backgroundColor: AppPalette.background,
        body: Center(
          child: CircularProgressIndicator(color: EconPalette.primaryDark),
        ),
      );
    }
    if (_completed) {
      return LessonResultScreen(
        lessonLabel: 'ECON 基本概念',
        score: _score,
        total: lesson.exercises.length,
        mistakes: _mistakes,
        sfx: _sfx,
        accentColor: EconPalette.primary,
        accentDarkColor: EconPalette.primaryDark,
        accentSoftColor: EconPalette.softPrimary,
        accentShadowColor: const Color(0xFFFFE7A3),
        onClose: _close,
        onRestart: _restart,
      );
    }
    final exercise = lesson.exercises[_index];
    final title = lesson.text(lesson.title, _language);
    return LessonPageScaffold(
      lessonLabel: 'ECON · CONCEPT REVIEW',
      title: title,
      progress: (_index + 1) / lesson.exercises.length,
      questionLabel: '${_index + 1}/${lesson.exercises.length}',
      accentColor: EconPalette.primary,
      accentDarkColor: EconPalette.primaryDark,
      accentSoftColor: EconPalette.softPrimary,
      accentShadowColor: const Color(0xFFFFE7A3),
      onClose: _close,
      body: _QuestionBody(
        key: ValueKey('econ-review-question-${exercise.id}'),
        stageKey: _stageKey,
        flightTargetKey: _flightTargetKey,
        bankKeys: _bankKeys,
        exercise: exercise,
        language: _language,
        checked: _checked,
        correct: _correct,
        selectedTokens: _selectedTokens,
        selectedTokenIndexes: _selectedTokenIndexes,
        selectedOption: _selectedOption,
        responseController: _responseController,
        onLanguageChanged: _setLanguage,
        onSelectToken: _selectToken,
        onRemoveToken: _removeTokenAt,
        onSelectOption: _selectOption,
        onResponseChanged: (value) => setState(() => _response = value),
        hiddenTokenIndex: _hiddenTokenIndex,
        flight: _flight,
        flightController: _flightController,
      ),
      bottom: LessonPrimaryButton(
        label: _checked
            ? (_index == lesson.exercises.length - 1 ? '完成重溫' : '下一題')
            : '檢查答案',
        icon: _checked
            ? (_index == lesson.exercises.length - 1
                ? Icons.flag_rounded
                : Icons.arrow_forward_rounded)
            : Icons.check_rounded,
        onPressed: _checked ? _next : (_answerReady ? _check : null),
      ),
    );
  }
}

class _QuestionBody extends StatelessWidget {
  const _QuestionBody({
    required this.stageKey,
    required this.flightTargetKey,
    required this.bankKeys,
    required this.exercise,
    required this.language,
    required this.checked,
    required this.correct,
    required this.selectedTokens,
    required this.selectedTokenIndexes,
    required this.selectedOption,
    required this.responseController,
    required this.onLanguageChanged,
    required this.onSelectToken,
    required this.onRemoveToken,
    required this.onSelectOption,
    required this.onResponseChanged,
    required this.hiddenTokenIndex,
    required this.flight,
    required this.flightController,
    super.key,
  });

  final GlobalKey stageKey;
  final GlobalKey flightTargetKey;
  final Map<int, GlobalKey> bankKeys;
  final EconConceptReviewExercise exercise;
  final EconReviewLanguage language;
  final bool checked;
  final bool correct;
  final List<String> selectedTokens;
  final List<int> selectedTokenIndexes;
  final Object? selectedOption;
  final TextEditingController responseController;
  final ValueChanged<EconReviewLanguage> onLanguageChanged;
  final void Function(String token, int index) onSelectToken;
  final ValueChanged<int> onRemoveToken;
  final ValueChanged<Object> onSelectOption;
  final ValueChanged<String> onResponseChanged;
  final int? hiddenTokenIndex;
  final _EconReviewFlight? flight;
  final AnimationController flightController;

  @override
  Widget build(BuildContext context) {
    final compact = MediaQuery.sizeOf(context).height < 700;
    final primary = exercise.promptMain[language.code] ??
        exercise.prompt[language.code] ??
        exercise.prompt['en'] ??
        '';
    final otherLanguage = language == EconReviewLanguage.zh
        ? EconReviewLanguage.en
        : EconReviewLanguage.zh;
    final translation = exercise.promptMain[otherLanguage.code] ??
        exercise.prompt[otherLanguage.code];
    final instruction = exercise.promptTitle[language.code] ??
        exercise.promptTitle['en'] ??
        _instructionFor(exercise.type, language);
    final concept = exercise.concept.replaceAll('-', ' ');
    return LayoutBuilder(
      builder: (context, constraints) => Stack(
        key: stageKey,
        clipBehavior: Clip.none,
        children: [
          Column(
            children: [
              _LanguageToggle(
                language: language,
                onChanged: onLanguageChanged,
              ),
              SizedBox(height: compact ? 7 : 10),
              Expanded(
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        concept,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: AppPalette.muted,
                          fontSize: 12,
                          fontWeight: FontWeight.w900,
                          letterSpacing: .8,
                        ),
                      ),
                      const SizedBox(height: 6),
                      LessonPromptCard(
                        primary: primary,
                        translation: translation,
                        instruction: instruction,
                        compact: true,
                      ),
                      const SizedBox(height: 12),
                      switch (exercise.type) {
                        EconConceptReviewExerciseType.reorder =>
                          _ReorderExercise(
                            exercise: exercise,
                            language: language,
                            checked: checked,
                            selectedTokens: selectedTokens,
                            selectedTokenIndexes: selectedTokenIndexes,
                            hiddenTokenIndex: hiddenTokenIndex,
                            flight: flight,
                            flightTargetKey: flightTargetKey,
                            bankKeys: bankKeys,
                            compact: compact,
                            onSelectToken: onSelectToken,
                            onRemoveToken: onRemoveToken,
                          ),
                        EconConceptReviewExerciseType.symbol => _SymbolExercise(
                            exercise: exercise,
                            selectedOption: selectedOption,
                            checked: checked,
                            correct: correct,
                            onSelect: onSelectOption,
                          ),
                        EconConceptReviewExerciseType.trueFalse =>
                          _TrueFalseExercise(
                            selectedOption: selectedOption,
                            checked: checked,
                            correct: correct,
                            onSelect: onSelectOption,
                          ),
                        EconConceptReviewExerciseType.type => _TypeExercise(
                            controller: responseController,
                            checked: checked,
                            onChanged: onResponseChanged,
                            language: language,
                          ),
                      },
                      if (checked) ...[
                        const SizedBox(height: 12),
                        LessonFeedbackCard(
                          correct: correct,
                          title: correct
                              ? (language == EconReviewLanguage.zh
                                  ? '答對！'
                                  : 'Correct!')
                              : (language == EconReviewLanguage.zh
                                  ? '再諗一諗'
                                  : 'Not quite'),
                          lines: [
                            exercise.text(exercise.explanation, language),
                          ],
                          answer:
                              correct ? null : _answerFor(exercise, language),
                          answerPrefix: language == EconReviewLanguage.zh
                              ? '正確答案：'
                              : 'Correct answer: ',
                        ),
                      ],
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
              ),
            ],
          ),
          if (flight case final activeFlight?)
            Positioned(
              left: 0,
              top: 0,
              child: IgnorePointer(
                child: AnimatedBuilder(
                  animation: flightController,
                  builder: (context, child) {
                    final offset = Offset.lerp(
                      activeFlight.start,
                      activeFlight.end,
                      Curves.easeOutCubic.transform(flightController.value),
                    )!;
                    return Transform.translate(offset: offset, child: child);
                  },
                  child: _EconTokenChip(
                    text: activeFlight.token,
                    tokenIndex: activeFlight.tokenIndex,
                    compact: compact,
                    selected: true,
                    onTap: () {},
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _LanguageToggle extends StatelessWidget {
  const _LanguageToggle({required this.language, required this.onChanged});

  final EconReviewLanguage language;
  final ValueChanged<EconReviewLanguage> onChanged;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerRight,
      child: OriginalDashedSurface(
        padding: const EdgeInsets.all(3),
        backgroundColor: const Color(0xFFF8FBFB),
        borderColor: AppPalette.border,
        radius: 14,
        strokeWidth: 2,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _LanguageButton(
              label: '中文',
              selected: language == EconReviewLanguage.zh,
              onTap: () => onChanged(EconReviewLanguage.zh),
            ),
            _LanguageButton(
              label: 'English',
              selected: language == EconReviewLanguage.en,
              onTap: () => onChanged(EconReviewLanguage.en),
            ),
          ],
        ),
      ),
    );
  }
}

class _LanguageButton extends StatelessWidget {
  const _LanguageButton({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 140),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: selected ? EconPalette.softPrimary : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          border: selected
              ? Border.all(color: EconPalette.primary, width: 1.5)
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? EconPalette.primaryDark : AppPalette.muted,
            fontSize: 12,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
    );
  }
}

class _ReorderExercise extends StatelessWidget {
  const _ReorderExercise({
    required this.exercise,
    required this.language,
    required this.checked,
    required this.selectedTokens,
    required this.selectedTokenIndexes,
    required this.hiddenTokenIndex,
    required this.flight,
    required this.flightTargetKey,
    required this.bankKeys,
    required this.compact,
    required this.onSelectToken,
    required this.onRemoveToken,
  });

  final EconConceptReviewExercise exercise;
  final EconReviewLanguage language;
  final bool checked;
  final List<String> selectedTokens;
  final List<int> selectedTokenIndexes;
  final int? hiddenTokenIndex;
  final _EconReviewFlight? flight;
  final GlobalKey flightTargetKey;
  final Map<int, GlobalKey> bankKeys;
  final bool compact;
  final void Function(String token, int index) onSelectToken;
  final ValueChanged<int> onRemoveToken;

  @override
  Widget build(BuildContext context) {
    final tokens = exercise.localizedTokens(exercise.tokens, language);
    final visibleSelected = <(String, int, int)>[];
    for (var index = 0; index < selectedTokens.length; index++) {
      if (selectedTokenIndexes[index] == hiddenTokenIndex) continue;
      visibleSelected
          .add((selectedTokens[index], selectedTokenIndexes[index], index));
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        OriginalDashedSurface(
          key: const Key('econ-review-answer-line'),
          backgroundColor: const Color(0xFFF8F9FA),
          borderColor: const Color(0xFFCFD4DA),
          strokeWidth: 3,
          radius: 20,
          shadowColor: const Color(0xFFECEFF3),
          shadowDepth: 4,
          padding: EdgeInsets.all(compact ? 9 : 12),
          child: ConstrainedBox(
            constraints: BoxConstraints(minHeight: compact ? 62 : 76),
            child: Wrap(
              alignment: WrapAlignment.start,
              spacing: compact ? 6 : 8,
              runSpacing: compact ? 7 : 9,
              children: [
                for (final item in visibleSelected)
                  _EconTokenChip(
                    text: item.$1,
                    tokenIndex: item.$2,
                    compact: compact,
                    selected: true,
                    onTap: () => onRemoveToken(item.$3),
                  ),
                if (flight case final activeFlight?)
                  Opacity(
                    opacity: 0,
                    child: IgnorePointer(
                      child: _EconTokenChip(
                        key: flightTargetKey,
                        text: activeFlight.token,
                        tokenIndex: activeFlight.tokenIndex,
                        compact: compact,
                        selected: true,
                        onTap: () {},
                      ),
                    ),
                  ),
                if (visibleSelected.isEmpty && flight == null)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    child: Text(
                      language == EconReviewLanguage.zh
                          ? '點擊字卡開始組句'
                          : 'Tap the cards to build the answer',
                      style: const TextStyle(
                        color: AppPalette.muted,
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 10),
        OriginalDashedSurface(
          key: const Key('econ-review-word-bank'),
          backgroundColor: AppPalette.softSecondary,
          borderColor: AppPalette.secondaryDark,
          strokeWidth: 3,
          radius: 22,
          shadowColor: const Color(0xFFFFE7A3),
          shadowDepth: 5,
          padding: EdgeInsets.all(compact ? 10 : 14),
          child: Wrap(
            alignment: WrapAlignment.center,
            spacing: compact ? 7 : 10,
            runSpacing: compact ? 8 : 10,
            children: [
              for (var index = 0; index < tokens.length; index++)
                if (!selectedTokenIndexes.contains(index))
                  Builder(
                    builder: (context) {
                      final key = bankKeys.putIfAbsent(index, GlobalKey.new);
                      return _EconTokenChip(
                        key: key,
                        text: tokens[index],
                        tokenIndex: index,
                        compact: compact,
                        onTap: () => onSelectToken(tokens[index], index),
                      );
                    },
                  ),
            ],
          ),
        ),
      ],
    );
  }
}

class _EconTokenChip extends StatelessWidget {
  const _EconTokenChip({
    required this.text,
    required this.tokenIndex,
    required this.compact,
    required this.onTap,
    this.selected = false,
    super.key,
  });

  final String text;
  final int tokenIndex;
  final bool compact;
  final VoidCallback onTap;
  final bool selected;

  static const _colors = [
    (EconPalette.softPrimary, EconPalette.primary, EconPalette.primaryDark),
    (AppPalette.softSecondary, AppPalette.secondary, AppPalette.secondaryDark),
    (Color(0xFFE8F8EA), AppPalette.tick, AppPalette.correctDark),
    (Color(0xFFF0EEFF), AppPalette.purple, Color(0xFF625BC5)),
    (Color(0xFFFFF0E1), Color(0xFFFFB26B), Color(0xFFD97706)),
    (Color(0xFFFFE3E3), AppPalette.cross, AppPalette.dangerDark),
  ];

  double _pillWidth(BuildContext context) {
    final fontSize = compact ? 14.0 : 17.0;
    final painter = TextPainter(
      text: TextSpan(
        text: text,
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
    return (painter.width + horizontalPadding).clamp(48.0, 180.0);
  }

  @override
  Widget build(BuildContext context) {
    final color = _colors[tokenIndex % _colors.length];
    return SizedBox(
      width: _pillWidth(context),
      height: compact ? 38 : 44,
      child: Material(
        color: color.$1,
        borderRadius: BorderRadius.circular(999),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(999),
          child: CustomPaint(
            foregroundPainter: _EconTokenBorderPainter(color: color.$2),
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: compact ? 10 : 14),
              child: Center(
                child: Text(
                  text,
                  maxLines: 1,
                  overflow: TextOverflow.visible,
                  softWrap: false,
                  style: TextStyle(
                    color: selected ? color.$3 : AppPalette.ink,
                    fontSize: compact ? 14 : 17,
                    fontWeight: FontWeight.w900,
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

class _EconTokenBorderPainter extends CustomPainter {
  const _EconTokenBorderPainter({required this.color});

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final rect = RRect.fromRectAndRadius(
      Offset.zero & size,
      Radius.circular(size.height / 2),
    );
    final path = Path()..addRRect(rect);
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.4
      ..strokeCap = StrokeCap.round;
    for (final metric in path.computeMetrics()) {
      var distance = 0.0;
      while (distance < metric.length) {
        canvas.drawPath(metric.extractPath(distance, distance + 8), paint);
        distance += 22;
      }
    }
  }

  @override
  bool shouldRepaint(covariant _EconTokenBorderPainter oldDelegate) =>
      color != oldDelegate.color;
}

class _SymbolExercise extends StatelessWidget {
  const _SymbolExercise({
    required this.exercise,
    required this.selectedOption,
    required this.checked,
    required this.correct,
    required this.onSelect,
  });

  final EconConceptReviewExercise exercise;
  final Object? selectedOption;
  final bool checked;
  final bool correct;
  final ValueChanged<Object> onSelect;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      alignment: WrapAlignment.center,
      spacing: 10,
      runSpacing: 10,
      children: [
        for (final option in exercise.options)
          SizedBox(
            width: 76,
            child: LessonChoiceButton(
              label: option,
              accentColor: EconPalette.primary,
              accentDarkColor: EconPalette.primaryDark,
              accentSoftColor: EconPalette.softPrimary,
              selected: selectedOption == option,
              correct: checked && selectedOption == option && correct,
              wrong: checked && selectedOption == option && !correct,
              onPressed: checked ? null : () => onSelect(option),
            ),
          ),
      ],
    );
  }
}

class _TrueFalseExercise extends StatelessWidget {
  const _TrueFalseExercise({
    required this.selectedOption,
    required this.checked,
    required this.correct,
    required this.onSelect,
  });

  final Object? selectedOption;
  final bool checked;
  final bool correct;
  final ValueChanged<Object> onSelect;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _BinaryChoice(
          key: const Key('econ-review-tick'),
          value: true,
          selected: selectedOption == true,
          checked: checked,
          correct: correct,
          icon: Icons.check_rounded,
          color: AppPalette.tick,
          label: '正確',
          onTap: () => onSelect(true),
        ),
        const SizedBox(width: 24),
        _BinaryChoice(
          key: const Key('econ-review-cross'),
          value: false,
          selected: selectedOption == false,
          checked: checked,
          correct: correct,
          icon: Icons.close_rounded,
          color: AppPalette.cross,
          label: '錯誤',
          onTap: () => onSelect(false),
        ),
      ],
    );
  }
}

class _BinaryChoice extends StatelessWidget {
  const _BinaryChoice({
    required this.value,
    required this.selected,
    required this.checked,
    required this.correct,
    required this.icon,
    required this.color,
    required this.label,
    required this.onTap,
    super.key,
  });

  final bool value;
  final bool selected;
  final bool checked;
  final bool correct;
  final IconData icon;
  final Color color;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final active = checked && selected;
    final border = active && !correct ? AppPalette.danger : color;
    return Semantics(
      button: true,
      label: label,
      child: OriginalDashedSurface(
        backgroundColor:
            active && !correct ? AppPalette.softDanger : Colors.white,
        borderColor: border,
        strokeWidth: selected ? 5 : 3,
        radius: 24,
        shadowColor: border.withValues(alpha: .3),
        shadowDepth: 5,
        child: InkWell(
          onTap: checked ? null : onTap,
          borderRadius: BorderRadius.circular(24),
          child: SizedBox.square(
            dimension: 106,
            child: Icon(icon, color: border, size: 66),
          ),
        ),
      ),
    );
  }
}

class _TypeExercise extends StatelessWidget {
  const _TypeExercise({
    required this.controller,
    required this.checked,
    required this.onChanged,
    required this.language,
  });

  final TextEditingController controller;
  final bool checked;
  final ValueChanged<String> onChanged;
  final EconReviewLanguage language;

  @override
  Widget build(BuildContext context) {
    return OriginalDashedSurface(
      backgroundColor: Colors.white,
      borderColor: EconPalette.primary,
      strokeWidth: 3,
      radius: 20,
      shadowColor: EconPalette.border,
      shadowDepth: 4,
      padding: const EdgeInsets.all(4),
      child: TextField(
        key: const Key('econ-review-definition-input'),
        controller: controller,
        enabled: !checked,
        minLines: 3,
        maxLines: 5,
        onChanged: onChanged,
        textInputAction: TextInputAction.done,
        decoration: InputDecoration(
          border: InputBorder.none,
          contentPadding: const EdgeInsets.all(12),
          hintText: language == EconReviewLanguage.zh
              ? '輸入完整定義'
              : 'Type the full definition',
          hintStyle: const TextStyle(
            color: AppPalette.muted,
            fontWeight: FontWeight.w700,
          ),
        ),
        style: const TextStyle(
          color: AppPalette.ink,
          fontSize: 17,
          height: 1.35,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}

class _LoadError extends StatelessWidget {
  const _LoadError({required this.onClose, required this.onRetry});

  final VoidCallback onClose;
  final Future<void> Function() onRetry;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppPalette.background,
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: OriginalDashedSurface(
              backgroundColor: AppPalette.softDanger,
              borderColor: AppPalette.danger,
              radius: 22,
              strokeWidth: 3,
              padding: const EdgeInsets.all(22),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.error_outline_rounded,
                      color: AppPalette.dangerDark, size: 46),
                  const SizedBox(height: 12),
                  const Text(
                    'ECON 題目未能載入',
                    style: TextStyle(
                      color: AppPalette.dangerDark,
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 18),
                  LessonPrimaryButton(label: '再試一次', onPressed: onRetry),
                  const SizedBox(height: 8),
                  LessonGhostButton(label: '< 返回', onPressed: onClose),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _EconReviewFlight {
  const _EconReviewFlight({
    required this.token,
    required this.tokenIndex,
    required this.start,
    required this.end,
  });

  final String token;
  final int tokenIndex;
  final Offset start;
  final Offset end;
}

String _instructionFor(
  EconConceptReviewExerciseType type,
  EconReviewLanguage language,
) {
  final chinese = language == EconReviewLanguage.zh;
  return switch (type) {
    EconConceptReviewExerciseType.reorder =>
      chinese ? '重組句子' : 'Rebuild the answer',
    EconConceptReviewExerciseType.symbol =>
      chinese ? '選擇符號' : 'Choose the symbol',
    EconConceptReviewExerciseType.trueFalse =>
      chinese ? '判斷正誤' : 'Choose true or false',
    EconConceptReviewExerciseType.type =>
      chinese ? '輸入定義' : 'Type the definition',
  };
}

String? _answerFor(
  EconConceptReviewExercise exercise,
  EconReviewLanguage language,
) {
  if (exercise.type == EconConceptReviewExerciseType.reorder) {
    final tokens = exercise.localizedTokens(exercise.answerTokens, language);
    return tokens.isEmpty
        ? null
        : tokens.join(language == EconReviewLanguage.zh ? '' : ' ');
  }
  if (exercise.type == EconConceptReviewExerciseType.trueFalse) {
    final value = exercise.answer == true;
    return language == EconReviewLanguage.zh
        ? (value ? '正確' : '錯誤')
        : (value ? 'True' : 'False');
  }
  if (exercise.type == EconConceptReviewExerciseType.symbol) {
    return exercise.answer?.toString();
  }
  return exercise.answerText(language);
}
