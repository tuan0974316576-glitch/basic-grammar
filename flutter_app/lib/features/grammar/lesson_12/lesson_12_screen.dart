import 'dart:async';

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../core/app_palette.dart';
import '../../../core/app_sfx.dart';
import '../../../core/widgets/stationery_frame.dart';
import '../../vocabulary/vocab_audio_repository.dart';
import '../shared/lesson_ui.dart';
import 'lesson_12_controller.dart';
import 'lesson_12_question.dart';
import 'lesson_12_repository.dart';

Future<void> openVerbTableReference(
  BuildContext context, {
  VocabAudioRepository? audioRepository,
}) {
  return Navigator.of(context).push(
    MaterialPageRoute<void>(
      fullscreenDialog: true,
      builder: (_) => VerbTableReferenceScreen(
        audioRepository: audioRepository,
      ),
    ),
  );
}

class Lesson12Screen extends StatefulWidget {
  const Lesson12Screen({
    this.repository = const Lesson12Repository(),
    this.controller,
    this.sfx,
    this.audioRepository,
    super.key,
  });

  final Lesson12Repository repository;
  final Lesson12Controller? controller;
  final LessonSfx? sfx;
  final VocabAudioRepository? audioRepository;

  @override
  State<Lesson12Screen> createState() => _Lesson12ScreenState();
}

class _Lesson12ScreenState extends State<Lesson12Screen> {
  final Map<String, TextEditingController> _textControllers = {
    for (final field in Lesson12Question.fields) field: TextEditingController(),
  };
  final Map<String, FocusNode> _focusNodes = {
    for (final field in Lesson12Question.fields) field: FocusNode(),
  };
  Lesson12Controller? _controller;
  Object? _loadError;
  String? _lastQuestionId;
  int _celebration = 0;

  LessonSfx get _sfx => widget.sfx ?? AppSfx.instance;

  @override
  void initState() {
    super.initState();
    final injected = widget.controller;
    if (injected != null) {
      _attach(injected);
    } else {
      unawaited(_load());
    }
  }

  @override
  void dispose() {
    _controller?.removeListener(_refresh);
    if (widget.controller == null) _controller?.dispose();
    for (final controller in _textControllers.values) {
      controller.dispose();
    }
    for (final node in _focusNodes.values) {
      node.dispose();
    }
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final questions = await widget.repository.loadQuestions();
      if (!mounted) return;
      _attach(Lesson12Controller(allQuestions: questions));
    } catch (error) {
      if (mounted) setState(() => _loadError = error);
    }
  }

  void _attach(Lesson12Controller controller) {
    _controller = controller..addListener(_refresh);
    _syncInputs(controller, force: true);
    if (mounted) setState(() {});
  }

  void _refresh() {
    final controller = _controller;
    if (controller == null || !mounted) return;
    _syncInputs(controller);
    setState(() {});
  }

  void _syncInputs(Lesson12Controller controller, {bool force = false}) {
    final questionId = controller.currentQuestion.id;
    if (!force && questionId == _lastQuestionId) return;
    _lastQuestionId = questionId;
    for (final field in Lesson12Question.fields) {
      _textControllers[field]!.text = controller.typedValue(field);
    }
  }

  void _handle(Lesson12Event event) {
    switch (event) {
      case Lesson12Event.ignored || Lesson12Event.inputChanged:
        return;
      case Lesson12Event.invalidInput || Lesson12Event.wrong:
        unawaited(_sfx.play(SfxCue.wrong));
        WidgetsBinding.instance.addPostFrameCallback((_) => _focusFirstWrong());
        return;
      case Lesson12Event.questionCorrect:
        FocusManager.instance.primaryFocus?.unfocus();
        setState(() => _celebration += 1);
        unawaited(_sfx.play(SfxCue.correct));
        return;
      case Lesson12Event.nextQuestion:
        unawaited(_sfx.play(SfxCue.next));
        return;
      case Lesson12Event.completed:
        setState(() => _celebration += 1);
        unawaited(_sfx.play(SfxCue.complete));
        return;
    }
  }

  void _focusFirstWrong() {
    if (!mounted) return;
    final controller = _controller;
    if (controller == null || controller.wrongFields.isEmpty) return;
    for (final field in Lesson12Question.fields) {
      if (controller.wrongFields.contains(field)) {
        _focusNodes[field]?.requestFocus();
        return;
      }
    }
  }

  void _nextField(String field) {
    final index = Lesson12Question.fields.indexOf(field);
    if (index < Lesson12Question.fields.length - 1) {
      _focusNodes[Lesson12Question.fields[index + 1]]?.requestFocus();
      return;
    }
    _handle(_controller!.submit());
  }

  void _close() {
    FocusManager.instance.primaryFocus?.unfocus();
    unawaited(_sfx.play(SfxCue.click));
    Navigator.of(context).pop();
  }

  void _openReference() {
    FocusManager.instance.primaryFocus?.unfocus();
    unawaited(_sfx.play(SfxCue.click));
    unawaited(
      openVerbTableReference(
        context,
        audioRepository: widget.audioRepository,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loadError != null) {
      return LessonLoadError(lessonLabel: 'Lesson 12', onClose: _close);
    }
    final controller = _controller;
    if (controller == null) {
      return const Scaffold(
        backgroundColor: AppPalette.background,
        body: Center(
          child: CircularProgressIndicator(color: AppPalette.primary),
        ),
      );
    }
    if (controller.isComplete) {
      return Stack(
        children: [
          LessonResultScreen(
            lessonLabel: 'Lesson 12',
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

    return Stack(
      children: [
        LessonPageScaffold(
          lessonLabel: 'LESSON 12',
          title: 'Verb Table 動詞四式',
          progress: controller.progress,
          questionLabel: '${controller.index + 1}/${controller.total}',
          onClose: _close,
          trailing: _ReferenceButton(onPressed: _openReference),
          body: _Lesson12QuestionBody(
            controller: controller,
            textControllers: _textControllers,
            focusNodes: _focusNodes,
            onChanged: (field, value) {
              _handle(controller.updateAnswer(field, value));
            },
            onSubmitted: _nextField,
          ),
          bottom: controller.isResolved
              ? _Lesson12Bottom(
                  child: LessonPrimaryButton(
                    key: const Key('lesson-12-next'),
                    label: controller.index == controller.total - 1
                        ? '完成課堂'
                        : '下一題',
                    onPressed: () => _handle(controller.next()),
                  ),
                )
              : _Lesson12Bottom(
                  child: LessonPrimaryButton(
                    key: const Key('lesson-12-confirm'),
                    label: controller.questionHadMistake ? '再確定' : '確定',
                    icon: Icons.check_rounded,
                    danger: controller.wrongFields.isNotEmpty,
                    onPressed: () => _handle(controller.submit()),
                  ),
                ),
        ),
        LessonCelebrationOverlay(trigger: _celebration),
      ],
    );
  }
}

class _Lesson12Bottom extends StatelessWidget {
  const _Lesson12Bottom({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Align(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 760),
        child: SizedBox(width: double.infinity, child: child),
      ),
    );
  }
}

class _ReferenceButton extends StatelessWidget {
  const _ReferenceButton({required this.onPressed});

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return IconButton(
      key: const Key('verb-table-reference-button'),
      tooltip: 'Verb Table',
      onPressed: onPressed,
      icon: const Icon(Icons.info_rounded),
      style: IconButton.styleFrom(
        backgroundColor: AppPalette.softSecondary,
        foregroundColor: AppPalette.secondaryDark,
        side: const BorderSide(color: AppPalette.secondaryDark, width: 2),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }
}

class _Lesson12QuestionBody extends StatelessWidget {
  const _Lesson12QuestionBody({
    required this.controller,
    required this.textControllers,
    required this.focusNodes,
    required this.onChanged,
    required this.onSubmitted,
  });

  final Lesson12Controller controller;
  final Map<String, TextEditingController> textControllers;
  final Map<String, FocusNode> focusNodes;
  final void Function(String field, String value) onChanged;
  final ValueChanged<String> onSubmitted;

  @override
  Widget build(BuildContext context) {
    final question = controller.currentQuestion;
    return LayoutBuilder(
      builder: (context, constraints) {
        final availableWidth = constraints.maxWidth.clamp(0, 760).toDouble();
        final fieldWidth = (availableWidth - 10) / 2;
        return Align(
          alignment: Alignment.topCenter,
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 760),
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  StationeryFrame(
                    radius: 18,
                    ringWidth: 3,
                    shadowDepth: 3,
                    padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
                    backgroundColor: AppPalette.softPrimary,
                    child: Column(
                      children: [
                        Text(
                          question.zh,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: AppPalette.ink,
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        const SizedBox(height: 8),
                        SizedBox(
                          height: constraints.maxHeight < 390 ? 96 : 136,
                          child: Image.asset(
                            question.imageAsset,
                            fit: BoxFit.contain,
                            errorBuilder: (_, __, ___) => const Icon(
                              Icons.image_not_supported_outlined,
                              color: AppPalette.muted,
                              size: 54,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 13),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: [
                      for (final field in Lesson12Question.fields)
                        SizedBox(
                          width: fieldWidth,
                          child: _VerbFormField(
                            field: field,
                            question: question,
                            controller: textControllers[field]!,
                            focusNode: focusNodes[field]!,
                            wrong: controller.wrongFields.contains(field),
                            correct: controller.isResolved ||
                                (controller.questionHadMistake &&
                                    controller.isFieldCorrect(field)),
                            onChanged: (value) => onChanged(field, value),
                            onSubmitted: (_) => onSubmitted(field),
                            readOnly: controller.isResolved,
                          ),
                        ),
                    ],
                  ),
                  if (controller.errorMessage != null) ...[
                    const SizedBox(height: 9),
                    Text(
                      controller.errorMessage!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: AppPalette.dangerDark,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                  if (controller.isResolved) ...[
                    const SizedBox(height: 12),
                    LessonFeedbackCard(
                      correct: true,
                      title: controller.questionHadMistake
                          ? '改正了！四式全部正確。'
                          : '四式全部正確！',
                      lines: ['${question.zh}：記住過去式和 PP 不一定相同。'],
                      answer: question.answerLine,
                    ),
                  ],
                  const SizedBox(height: 4),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _VerbFormField extends StatelessWidget {
  const _VerbFormField({
    required this.field,
    required this.question,
    required this.controller,
    required this.focusNode,
    required this.wrong,
    required this.correct,
    required this.onChanged,
    required this.onSubmitted,
    required this.readOnly,
  });

  final String field;
  final Lesson12Question question;
  final TextEditingController controller;
  final FocusNode focusNode;
  final bool wrong;
  final bool correct;
  final ValueChanged<String> onChanged;
  final ValueChanged<String> onSubmitted;
  final bool readOnly;

  @override
  Widget build(BuildContext context) {
    final borderColor = wrong
        ? AppPalette.danger
        : correct
            ? AppPalette.correctDark
            : AppPalette.border;
    final fillColor = wrong
        ? AppPalette.softDanger
        : correct
            ? AppPalette.softCorrect
            : AppPalette.paper;
    final isPresent = field == 'present';
    return TextField(
      key: Key('lesson-12-$field-input'),
      controller: controller,
      focusNode: focusNode,
      readOnly: readOnly,
      maxLength: 28,
      autocorrect: false,
      enableSuggestions: false,
      textCapitalization: TextCapitalization.none,
      textInputAction: field == Lesson12Question.fields.last
          ? TextInputAction.done
          : TextInputAction.next,
      inputFormatters: [
        FilteringTextInputFormatter.allow(RegExp(r"[a-zA-Z /'-]")),
      ],
      onChanged: onChanged,
      onSubmitted: onSubmitted,
      decoration: InputDecoration(
        labelText: Lesson12Question.labels[field],
        prefixText: isPresent ? question.presentFirstLetter : null,
        prefixStyle: const TextStyle(
          color: AppPalette.primaryDark,
          fontSize: 19,
          fontWeight: FontWeight.w900,
        ),
        suffixIcon: wrong
            ? const Icon(Icons.close_rounded, color: AppPalette.dangerDark)
            : correct
                ? const Icon(Icons.check_rounded, color: AppPalette.correctDark)
                : null,
        counterText: '',
        filled: true,
        fillColor: fillColor,
        contentPadding: const EdgeInsets.fromLTRB(12, 15, 8, 13),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: borderColor, width: 2),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: borderColor, width: 2),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: wrong ? AppPalette.dangerDark : AppPalette.primaryDark,
            width: 3,
          ),
        ),
      ),
      style: const TextStyle(
        color: AppPalette.ink,
        fontSize: 19,
        fontWeight: FontWeight.w900,
      ),
    );
  }
}

class VerbTableReferenceScreen extends StatefulWidget {
  const VerbTableReferenceScreen({
    this.repository = const Lesson12Repository(),
    this.audioRepository,
    super.key,
  });

  final Lesson12Repository repository;
  final VocabAudioRepository? audioRepository;

  @override
  State<VerbTableReferenceScreen> createState() =>
      _VerbTableReferenceScreenState();
}

class _VerbTableReferenceScreenState extends State<VerbTableReferenceScreen> {
  AudioPlayer? _player;
  StreamSubscription<void>? _playerCompleteSubscription;
  final TextEditingController _searchController = TextEditingController();
  late final Future<List<Lesson12Question>> _questions;
  String? _playingId;
  String _searchQuery = '';
  bool _searchVisible = false;

  @override
  void initState() {
    super.initState();
    _questions = widget.repository.loadReferenceQuestions();
  }

  @override
  void dispose() {
    _searchController.dispose();
    unawaited(_playerCompleteSubscription?.cancel());
    final player = _player;
    if (player != null) unawaited(player.dispose());
    super.dispose();
  }

  AudioPlayer get _audioPlayer {
    final player = _player ??= AudioPlayer();
    _playerCompleteSubscription ??= player.onPlayerComplete.listen((_) {
      if (mounted) setState(() => _playingId = null);
    });
    return player;
  }

  void _toggleSearch() {
    setState(() => _searchVisible = !_searchVisible);
    if (_searchVisible) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) FocusScope.of(context).requestFocus();
      });
    } else {
      _searchController.clear();
      setState(() => _searchQuery = '');
    }
  }

  Future<void> _play(Lesson12Question question) async {
    setState(() => _playingId = question.id);
    if (question.audioAsset.isNotEmpty) {
      await _audioPlayer.stop();
      await _audioPlayer.play(AssetSource(question.audioAsset));
      return;
    }
    final played =
        await widget.audioRepository?.speakExample(question.spokenLine);
    if (!mounted) return;
    if (played != true) {
      setState(() => _playingId = null);
      return;
    }
    await Future<void>.delayed(const Duration(seconds: 3));
    if (mounted && _playingId == question.id) {
      setState(() => _playingId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppPalette.background,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(10, 6, 14, 8),
              child: Row(
                children: [
                  IconButton(
                    tooltip: '返回',
                    onPressed: () {
                      unawaited(AppSfx.instance.play(SfxCue.click));
                      Navigator.of(context).pop();
                    },
                    icon: const Icon(Icons.close_rounded),
                  ),
                  const SizedBox(width: 5),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'LESSON 12',
                          style: TextStyle(
                            color: AppPalette.primaryDark,
                            fontSize: 11,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        Text(
                          'Verb Table 動詞表',
                          style: TextStyle(
                            color: AppPalette.ink,
                            fontSize: 21,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    key: const Key('verb-table-search-button'),
                    tooltip: '搜尋 Verb Table',
                    onPressed: _toggleSearch,
                    icon: const Icon(Icons.search_rounded),
                    style: IconButton.styleFrom(
                      backgroundColor: AppPalette.softSecondary,
                      foregroundColor: AppPalette.secondaryDark,
                      side: const BorderSide(
                        color: AppPalette.secondaryDark,
                        width: 2,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            if (_searchVisible)
              Padding(
                padding: const EdgeInsets.fromLTRB(14, 0, 14, 8),
                child: TextField(
                  key: const Key('verb-table-search-field'),
                  controller: _searchController,
                  autofocus: true,
                  onChanged: (value) => setState(() => _searchQuery = value),
                  decoration: InputDecoration(
                    hintText: '搜尋動詞、中文或四式',
                    prefixIcon: const Icon(Icons.search_rounded),
                    suffixIcon: _searchQuery.isEmpty
                        ? null
                        : IconButton(
                            tooltip: '清除搜尋',
                            onPressed: () {
                              _searchController.clear();
                              setState(() => _searchQuery = '');
                            },
                            icon: const Icon(Icons.close_rounded),
                          ),
                    filled: true,
                    fillColor: AppPalette.paper,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppPalette.border),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppPalette.border),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(
                        color: AppPalette.primaryDark,
                        width: 2,
                      ),
                    ),
                  ),
                ),
              ),
            Expanded(
              child: FutureBuilder<List<Lesson12Question>>(
                future: _questions,
                builder: (context, snapshot) {
                  if (snapshot.hasError) {
                    return const Center(child: Text('未能載入 Verb Table。'));
                  }
                  final questions = snapshot.data;
                  if (questions == null) {
                    return const Center(
                      child: CircularProgressIndicator(
                        color: AppPalette.primary,
                      ),
                    );
                  }
                  final query = _searchQuery.trim().toLowerCase();
                  final filtered = query.isEmpty
                      ? questions
                      : questions
                          .where(
                            (question) => <String>[
                              question.zh,
                              ...Lesson12Question.fields.map(question.form),
                            ].join(' ').toLowerCase().contains(query),
                          )
                          .toList(growable: false);
                  if (filtered.isEmpty) {
                    return const Center(child: Text('找不到相關動詞。'));
                  }
                  return ListView.separated(
                    key: const Key('verb-table-reference-list'),
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.fromLTRB(14, 4, 14, 24),
                    itemCount: filtered.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final question = filtered[index];
                      return _VerbReferenceRow(
                        question: question,
                        playing: _playingId == question.id,
                        onTap: () => unawaited(_play(question)),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _VerbReferenceRow extends StatelessWidget {
  const _VerbReferenceRow({
    required this.question,
    required this.playing,
    required this.onTap,
  });

  final Lesson12Question question;
  final bool playing;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      key: ValueKey('verb-table-row-${question.id}'),
      button: true,
      label: '${question.zh} ${question.spokenLine}',
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: StationeryFrame(
            radius: 16,
            ringWidth: playing ? 4 : 2,
            shadowDepth: 2,
            borderColor: playing ? AppPalette.secondaryDark : AppPalette.border,
            backgroundColor:
                playing ? AppPalette.softSecondary : AppPalette.paper,
            padding: const EdgeInsets.all(12),
            child: LayoutBuilder(
              builder: (context, constraints) {
                final compact = constraints.maxWidth < 620;
                final meaning = Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Flexible(
                          child: Text(
                            question.zh,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: AppPalette.ink,
                              fontSize: 19,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                        if (playing) ...[
                          const SizedBox(width: 5),
                          const Icon(
                            Icons.volume_up_rounded,
                            color: AppPalette.secondaryDark,
                            size: 22,
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 7),
                    SizedBox(
                      height: compact ? 88 : 104,
                      child: Image.asset(
                        question.imageAsset,
                        fit: BoxFit.contain,
                        errorBuilder: (_, __, ___) => const Icon(
                          Icons.image_not_supported_outlined,
                          color: AppPalette.muted,
                        ),
                      ),
                    ),
                  ],
                );
                final forms = _ReferenceForms(
                  question: question,
                  columns: compact ? 2 : 4,
                );
                if (compact) {
                  return Column(
                    children: [meaning, const SizedBox(height: 10), forms],
                  );
                }
                return Row(
                  children: [
                    SizedBox(width: 150, child: meaning),
                    const SizedBox(width: 14),
                    Expanded(child: forms),
                  ],
                );
              },
            ),
          ),
        ),
      ),
    );
  }
}

class _ReferenceForms extends StatelessWidget {
  const _ReferenceForms({required this.question, required this.columns});

  final Lesson12Question question;
  final int columns;

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: columns,
      childAspectRatio: columns == 2 ? 2.35 : 1.65,
      mainAxisSpacing: 7,
      crossAxisSpacing: 7,
      children: [
        for (final field in Lesson12Question.fields)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 5),
            decoration: BoxDecoration(
              color: field == 'present'
                  ? AppPalette.softPrimary
                  : AppPalette.background,
              borderRadius: BorderRadius.circular(9),
              border: Border.all(color: AppPalette.border, width: 1.5),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  Lesson12Question.labels[field]!,
                  maxLines: 1,
                  style: const TextStyle(
                    color: AppPalette.muted,
                    fontSize: 11,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 2),
                FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text(
                    question.form(field),
                    maxLines: 1,
                    style: const TextStyle(
                      color: AppPalette.ink,
                      fontSize: 17,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}
