import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/app_palette.dart';
import '../../core/app_sfx.dart';
import '../../core/widgets/original_game_keyboard.dart';
import '../../core/widgets/original_section_frame.dart';
import '../../core/widgets/stationery_frame.dart';
import '../grammar/shared/lesson_ui.dart';
import 'grammar_workshop_controller.dart';
import 'grammar_workshop_models.dart';
import 'grammar_workshop_repository.dart';

class GrammarWorkshopScreen extends StatefulWidget {
  const GrammarWorkshopScreen({
    this.repository,
    this.sfx,
    this.onSettings,
    this.onRoundCompleted,
    this.settingsActive = false,
    super.key,
  });

  final GrammarWorkshopBankRepository? repository;
  final LessonSfx? sfx;
  final VoidCallback? onSettings;
  final ValueChanged<int>? onRoundCompleted;
  final bool settingsActive;

  @override
  State<GrammarWorkshopScreen> createState() => _GrammarWorkshopScreenState();
}

class _GrammarWorkshopScreenState extends State<GrammarWorkshopScreen> {
  late final GrammarWorkshopBankRepository _repository;
  GrammarWorkshopBank? _bank;
  Object? _loadError;
  bool _refreshing = false;

  LessonSfx get _sfx => widget.sfx ?? AppSfx.instance;

  @override
  void initState() {
    super.initState();
    _repository = widget.repository ?? GrammarWorkshopRepository();
    unawaited(_load());
  }

  Future<void> _load({bool forceRefresh = false}) async {
    if (_refreshing) return;
    setState(() {
      _refreshing = true;
      if (_bank == null) _loadError = null;
    });
    try {
      final bank = await _repository.load(forceRefresh: forceRefresh);
      if (!mounted) return;
      setState(() {
        _bank = bank;
        _loadError = null;
      });
    } catch (error) {
      if (mounted) setState(() => _loadError = error);
    } finally {
      if (mounted) setState(() => _refreshing = false);
    }
  }

  void _openTopic(GrammarWorkshopTopic topic) {
    unawaited(_sfx.play(SfxCue.start));
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => GrammarWorkshopPracticeScreen(
          topic: topic,
          sfx: _sfx,
          onCompleted: widget.onRoundCompleted,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bank = _bank;
    return OriginalSectionFrame(
      sectionKey: const Key('original-section-frame-workshop'),
      eyebrow: 'Grammar Workshop',
      title: '研修',
      onSettings: widget.onSettings,
      settingsActive: widget.settingsActive,
      settingsKey: const Key('workshop-settings-button'),
      child: bank == null
          ? _WorkshopLoading(error: _loadError, onRetry: _load)
          : Column(
              children: [
                const SizedBox(height: 4),
                Expanded(
                  child: LayoutBuilder(
                    builder: (context, constraints) {
                      final columns = constraints.maxWidth >= 520 ? 3 : 2;
                      final narrowPhone = constraints.maxWidth < 300;
                      return GridView.builder(
                        key: const Key('grammar-workshop-topic-grid'),
                        physics: const BouncingScrollPhysics(),
                        padding: const EdgeInsets.fromLTRB(3, 2, 3, 12),
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: columns,
                          crossAxisSpacing: 9,
                          mainAxisSpacing: 10,
                          childAspectRatio:
                              columns == 2 ? (narrowPhone ? 1.42 : 2.0) : 2.15,
                        ),
                        itemCount: bank.topics.length,
                        itemBuilder: (context, index) {
                          final topic = bank.topics[index];
                          return _WorkshopTopicCard(
                            topic: topic,
                            index: index,
                            onTap: () => _openTopic(topic),
                          );
                        },
                      );
                    },
                  ),
                ),
              ],
            ),
    );
  }
}

class _WorkshopLoading extends StatelessWidget {
  const _WorkshopLoading({required this.error, required this.onRetry});

  final Object? error;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    if (error == null) {
      return const Center(
        child: CircularProgressIndicator(color: AppPalette.primary),
      );
    }
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.cloud_off_rounded,
            color: AppPalette.danger,
            size: 48,
          ),
          const SizedBox(height: 10),
          const Text(
            '未能載入研修題庫。',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 12),
          FilledButton.icon(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh_rounded),
            label: const Text('再試一次'),
          ),
        ],
      ),
    );
  }
}

class _WorkshopTopicCard extends StatelessWidget {
  const _WorkshopTopicCard({
    required this.topic,
    required this.index,
    required this.onTap,
  });

  final GrammarWorkshopTopic topic;
  final int index;
  final VoidCallback onTap;

  static const _colors = [
    Color(0xFFE0FBFC),
    Color(0xFFFFF8D6),
    Color(0xFFF3EBFF),
    Color(0xFFFFEAF2),
    Color(0xFFEAF7E8),
  ];

  @override
  Widget build(BuildContext context) {
    final color = _colors[index % _colors.length];
    return GestureDetector(
      key: ValueKey('grammar-workshop-topic-${topic.key}'),
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: OriginalDashedSurface(
        backgroundColor: color,
        borderColor: _topicColor(topic.key),
        shadowColor: _topicColor(topic.key).withValues(alpha: 0.25),
        shadowDepth: 5,
        strokeWidth: 2.5,
        radius: 14,
        padding: const EdgeInsets.all(10),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Icon(
              _topicIcon(topic.key),
              color: _topicColor(topic.key),
              size: 28,
            ),
            const SizedBox(width: 9),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    topic.chineseLabel,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Color(0xFF5D4037),
                      fontSize: 14,
                      height: 1.08,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    topic.label,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: AppPalette.muted,
                      fontSize: 8,
                      height: 1.08,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class GrammarWorkshopPracticeScreen extends StatefulWidget {
  const GrammarWorkshopPracticeScreen({
    required this.topic,
    this.sfx,
    this.onCompleted,
    super.key,
  });

  final GrammarWorkshopTopic topic;
  final LessonSfx? sfx;
  final ValueChanged<int>? onCompleted;

  @override
  State<GrammarWorkshopPracticeScreen> createState() =>
      _GrammarWorkshopPracticeScreenState();
}

class _GrammarWorkshopPracticeScreenState
    extends State<GrammarWorkshopPracticeScreen> {
  late GrammarWorkshopPracticeController _controller;
  int _celebration = 0;
  bool _keyboardOpen = false;
  int? _activeInput;
  bool _completionReported = false;

  LessonSfx get _sfx => widget.sfx ?? AppSfx.instance;

  @override
  void initState() {
    super.initState();
    _startRound();
  }

  void _startRound() {
    _controller = GrammarWorkshopPracticeController(topic: widget.topic)
      ..addListener(_refresh);
  }

  void _refresh() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _controller.removeListener(_refresh);
    _controller.dispose();
    super.dispose();
  }

  void _close() {
    _closeKeyboard();
    unawaited(_sfx.play(SfxCue.click));
    Navigator.of(context).pop();
  }

  void _submitOrNext() {
    _closeKeyboard();
    if (_controller.answered) {
      _controller.next();
      if (_controller.complete && !_completionReported) {
        _completionReported = true;
        widget.onCompleted?.call(_controller.totalQuestions);
      }
      unawaited(_sfx.play(SfxCue.next));
      return;
    }
    if (!_controller.submit()) {
      unawaited(_sfx.play(SfxCue.wrong));
      return;
    }
    if (_controller.lastCorrect) {
      setState(() => _celebration += 1);
      unawaited(_sfx.play(SfxCue.correct));
    } else {
      unawaited(_sfx.play(SfxCue.wrong));
    }
  }

  void _openKeyboard(int index) {
    if (_controller.answered) return;
    setState(() {
      _keyboardOpen = true;
      _activeInput = index;
    });
    unawaited(SystemChannels.textInput.invokeMethod<void>('TextInput.hide'));
  }

  void _closeKeyboard() {
    if (!_keyboardOpen) return;
    setState(() {
      _keyboardOpen = false;
      _activeInput = null;
    });
    FocusManager.instance.primaryFocus?.unfocus();
    unawaited(SystemChannels.textInput.invokeMethod<void>('TextInput.hide'));
  }

  void _handleKeyboardKey(String key) {
    final index = _activeInput;
    if (!_keyboardOpen || index == null || _controller.answered) return;
    final current = _controller.responses[index];
    final next = switch (key) {
      'BACKSPACE' =>
        current.isEmpty ? current : current.substring(0, current.length - 1),
      'SPACE' => current.endsWith(' ') ? current : '$current ',
      _ => '$current${key.toLowerCase()}',
    };
    if (next.length > 80) return;
    _controller.updateResponse(index, next);
    unawaited(_sfx.play(SfxCue.type));
  }

  void _restart() {
    _controller.removeListener(_refresh);
    _controller.dispose();
    setState(() {
      _completionReported = false;
      _startRound();
    });
    unawaited(_sfx.play(SfxCue.start));
  }

  @override
  Widget build(BuildContext context) {
    if (_controller.complete) {
      return LessonResultScreen(
        lessonLabel: widget.topic.chineseLabel,
        score: _controller.correctCount,
        total: _controller.totalQuestions,
        mistakes: _controller.totalQuestions - _controller.correctCount,
        onClose: _close,
        onRestart: _restart,
        sfx: _sfx,
      );
    }
    final question = _controller.current;
    return Stack(
      children: [
        LessonPageScaffold(
          lessonLabel: 'GRAMMAR WORKSHOP',
          title: widget.topic.chineseLabel,
          progress: _controller.questionNumber / _controller.totalQuestions,
          questionLabel:
              '${_controller.questionNumber}/${_controller.totalQuestions}',
          onClose: _close,
          body: SingleChildScrollView(
            key: ValueKey('workshop-question-${question.id}'),
            physics: const BouncingScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                LessonPromptCard(
                  primary: _primaryPrompt(question),
                  translation: _translation(question),
                  instruction: _instruction(question.kind),
                  compact: true,
                ),
                const SizedBox(height: 12),
                _WorkshopAnswerArea(
                  controller: _controller,
                  sfx: _sfx,
                  keyboardOpen: _keyboardOpen,
                  activeInput: _activeInput,
                  onTapInput: _openKeyboard,
                ),
                if (_controller.answered) ...[
                  const SizedBox(height: 12),
                  LessonFeedbackCard(
                    key: const Key('grammar-workshop-question-feedback'),
                    correct: _controller.lastCorrect,
                    title: _controller.lastCorrect ? '答啱！' : '未答啱。',
                    answer: question.correctAnswerText,
                    lines: [
                      grammarWorkshopTopicTeachingPoint(question.topicKey),
                      if (question.explanation.isNotEmpty)
                        '這題重點：${question.explanation}',
                    ],
                  ),
                ],
              ],
            ),
          ),
          bottom: LessonPrimaryButton(
            label: _controller.answered
                ? (_controller.questionNumber == _controller.totalQuestions
                    ? '完成研修'
                    : '下一題')
                : '確認答案',
            icon: _controller.answered
                ? Icons.arrow_forward_rounded
                : Icons.check_rounded,
            onPressed: _controller.answered || _controller.canSubmit
                ? _submitOrNext
                : null,
          ),
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
                  keyboardKey: const Key('grammar-workshop-custom-keyboard'),
                  keyPrefix: 'grammar-workshop-keyboard-key-',
                  onKey: _handleKeyboardKey,
                  onSubmit: _submitOrNext,
                ),
              ),
            ),
          ),
        LessonCelebrationOverlay(trigger: _celebration),
      ],
    );
  }
}

class _WorkshopAnswerArea extends StatelessWidget {
  const _WorkshopAnswerArea(
      {required this.controller,
      required this.sfx,
      required this.keyboardOpen,
      required this.activeInput,
      required this.onTapInput});

  final GrammarWorkshopPracticeController controller;
  final LessonSfx sfx;
  final bool keyboardOpen;
  final int? activeInput;
  final ValueChanged<int> onTapInput;

  @override
  Widget build(BuildContext context) {
    final question = controller.current;
    return switch (question.kind) {
      GrammarWorkshopKind.choice ||
      GrammarWorkshopKind.synonym =>
        _WorkshopChoiceAnswers(controller: controller),
      GrammarWorkshopKind.fill => _WorkshopFillAnswers(
          controller: controller,
          sfx: sfx,
          keyboardOpen: keyboardOpen,
          activeInput: activeInput,
          onTapInput: onTapInput),
      GrammarWorkshopKind.verb => _WorkshopVerbAnswers(
          controller: controller,
          sfx: sfx,
          keyboardOpen: keyboardOpen,
          activeInput: activeInput,
          onTapInput: onTapInput),
      GrammarWorkshopKind.rearrange =>
        _WorkshopRearrangeAnswers(controller: controller),
    };
  }
}

class _WorkshopChoiceAnswers extends StatelessWidget {
  const _WorkshopChoiceAnswers({required this.controller});

  final GrammarWorkshopPracticeController controller;

  @override
  Widget build(BuildContext context) {
    final question = controller.current;
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 2.55,
        mainAxisSpacing: 9,
        crossAxisSpacing: 9,
      ),
      itemCount: question.options.length,
      itemBuilder: (context, index) {
        final selected = controller.selectedOption == index;
        final resolved = controller.answered;
        return LessonChoiceButton(
          key: ValueKey('workshop-choice-$index'),
          label: question.options[index],
          selected: selected,
          wrong: resolved && selected && !question.isAcceptedChoice(index),
          correct: resolved &&
              (question.kind == GrammarWorkshopKind.synonym ||
                  question.isAcceptedChoice(index)),
          onPressed: resolved ? null : () => controller.selectOption(index),
        );
      },
    );
  }
}

class _WorkshopFillAnswers extends StatelessWidget {
  const _WorkshopFillAnswers(
      {required this.controller,
      required this.sfx,
      required this.keyboardOpen,
      required this.activeInput,
      required this.onTapInput});

  final GrammarWorkshopPracticeController controller;
  final LessonSfx sfx;
  final bool keyboardOpen;
  final int? activeInput;
  final ValueChanged<int> onTapInput;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        for (var index = 0; index < controller.responses.length; index += 1)
          Padding(
            padding: const EdgeInsets.only(bottom: 9),
            child: _WorkshopTextField(
              key: ValueKey('${controller.current.id}-answer-$index'),
              label:
                  controller.responses.length == 1 ? '答案' : '答案 ${index + 1}',
              enabled: !controller.answered,
              onChanged: (value) => controller.updateResponse(index, value),
              onType: () => unawaited(sfx.play(SfxCue.type)),
              keyboardOpen: keyboardOpen && activeInput == index,
              onTap: () => onTapInput(index),
            ),
          ),
      ],
    );
  }
}

class _WorkshopVerbAnswers extends StatelessWidget {
  const _WorkshopVerbAnswers(
      {required this.controller,
      required this.sfx,
      required this.keyboardOpen,
      required this.activeInput,
      required this.onTapInput});

  final GrammarWorkshopPracticeController controller;
  final LessonSfx sfx;
  final bool keyboardOpen;
  final int? activeInput;
  final ValueChanged<int> onTapInput;

  static const _labels = ['Present', 'Past', 'Past Participle', 'ING'];

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 2.25,
        mainAxisSpacing: 9,
        crossAxisSpacing: 9,
      ),
      itemCount: 4,
      itemBuilder: (context, index) => _WorkshopTextField(
        key: ValueKey('${controller.current.id}-verb-$index'),
        label: _labels[index],
        enabled: !controller.answered,
        onChanged: (value) => controller.updateResponse(index, value),
        onType: () => unawaited(sfx.play(SfxCue.type)),
        keyboardOpen: keyboardOpen && activeInput == index,
        onTap: () => onTapInput(index),
      ),
    );
  }
}

class _WorkshopTextField extends StatelessWidget {
  const _WorkshopTextField({
    required this.label,
    required this.enabled,
    required this.onChanged,
    required this.onType,
    required this.keyboardOpen,
    required this.onTap,
    super.key,
  });

  final String label;
  final bool enabled;
  final ValueChanged<String> onChanged;
  final VoidCallback onType;
  final bool keyboardOpen;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      enabled: enabled,
      // Keep the field editable for accessibility/test injection while the
      // `none` keyboard type prevents the platform keyboard; taps are served
      // by the shared game keyboard overlay.
      readOnly: false,
      showCursor: keyboardOpen,
      keyboardType: TextInputType.none,
      autocorrect: false,
      enableSuggestions: false,
      spellCheckConfiguration: const SpellCheckConfiguration.disabled(),
      textCapitalization: TextCapitalization.none,
      textInputAction: TextInputAction.done,
      onChanged: (value) {
        onChanged(value);
        onType();
      },
      onTap: onTap,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: Colors.white,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 13, vertical: 12),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppPalette.primary, width: 2),
        ),
        disabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppPalette.border, width: 2),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide:
              const BorderSide(color: AppPalette.secondaryDark, width: 3),
        ),
      ),
      style: const TextStyle(
        color: Color(0xFF5D4037),
        fontSize: 16,
        fontWeight: FontWeight.w900,
      ),
    );
  }
}

class _WorkshopRearrangeAnswers extends StatelessWidget {
  const _WorkshopRearrangeAnswers({required this.controller});

  final GrammarWorkshopPracticeController controller;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        OriginalDashedSurface(
          key: const Key('workshop-rearrange-answer'),
          backgroundColor: Colors.white,
          borderColor: AppPalette.primary,
          radius: 14,
          strokeWidth: 2,
          padding: const EdgeInsets.all(10),
          child: ConstrainedBox(
            constraints: const BoxConstraints(minHeight: 58),
            child: Wrap(
              spacing: 6,
              runSpacing: 7,
              children: controller.selectedTokens
                  .map(
                    (token) => _WorkshopTokenChip(
                      token: token,
                      selected: true,
                      enabled: !controller.answered,
                      onTap: () => controller.removeToken(token.id),
                    ),
                  )
                  .toList(growable: false),
            ),
          ),
        ),
        const SizedBox(height: 10),
        OriginalDashedSurface(
          backgroundColor: AppPalette.softSecondary,
          borderColor: AppPalette.secondaryDark,
          radius: 14,
          strokeWidth: 2,
          padding: const EdgeInsets.all(10),
          child: Wrap(
            spacing: 6,
            runSpacing: 7,
            children: controller.availableTokens
                .map(
                  (token) => _WorkshopTokenChip(
                    token: token,
                    selected: false,
                    enabled: !controller.answered,
                    onTap: () => controller.selectToken(token.id),
                  ),
                )
                .toList(growable: false),
          ),
        ),
      ],
    );
  }
}

class _WorkshopTokenChip extends StatelessWidget {
  const _WorkshopTokenChip({
    required this.token,
    required this.selected,
    required this.enabled,
    required this.onTap,
  });

  final GrammarWorkshopToken token;
  final bool selected;
  final bool enabled;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ActionChip(
      key: ValueKey('workshop-token-${token.id}'),
      onPressed: enabled ? onTap : null,
      label: Text(token.text),
      backgroundColor: selected ? AppPalette.softPrimary : Colors.white,
      disabledColor: selected ? AppPalette.softPrimary : Colors.white,
      side: BorderSide(
        color: selected ? AppPalette.primaryDark : AppPalette.secondaryDark,
        width: 2,
      ),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      labelStyle: const TextStyle(
        color: Color(0xFF5D4037),
        fontWeight: FontWeight.w900,
      ),
    );
  }
}

String _primaryPrompt(GrammarWorkshopQuestion question) {
  if (question.kind == GrammarWorkshopKind.verb) return question.chinese;
  if (question.prompt.isNotEmpty && question.prompt != '______') {
    return question.prompt;
  }
  return question.chinese;
}

String? _translation(GrammarWorkshopQuestion question) {
  final primary = _primaryPrompt(question);
  return question.chinese.isNotEmpty && question.chinese != primary
      ? question.chinese
      : null;
}

String _instruction(GrammarWorkshopKind kind) {
  return switch (kind) {
    GrammarWorkshopKind.verb => '填寫動詞四式',
    GrammarWorkshopKind.fill => '填入正確答案',
    GrammarWorkshopKind.choice => '選出正確答案',
    GrammarWorkshopKind.rearrange => '點按字塊重組句子',
    GrammarWorkshopKind.synonym => '找出同義詞組',
  };
}

Color _topicColor(String key) {
  final colors = <Color>[
    AppPalette.primaryDark,
    AppPalette.secondaryDark,
    AppPalette.purple,
    AppPalette.pink,
    AppPalette.correctDark,
  ];
  var hash = 0;
  for (final code in key.codeUnits) {
    hash = (hash * 31 + code) & 0x7fffffff;
  }
  return colors[hash % colors.length];
}

IconData _topicIcon(String key) {
  return switch (key) {
    'VERB_TABLE' => Icons.table_chart_rounded,
    'TENSES' => Icons.schedule_rounded,
    'PRONOUN' => Icons.people_alt_rounded,
    'COMPARATIVE_SUPERLATIVE' => Icons.trending_up_rounded,
    'PREPOSITION_OF_PLACE' => Icons.place_rounded,
    'PREPOSITION_OF_TIME' => Icons.access_time_filled_rounded,
    'INFINITIVE_GERUND' => Icons.all_inclusive_rounded,
    'DIRECT_QUESTION' => Icons.help_rounded,
    'INDIRECT_QUESTION' => Icons.question_answer_rounded,
    'IT_IS' => Icons.text_fields_rounded,
    'CONDITIONAL' => Icons.call_split_rounded,
    'REPORTED_SPEECH' => Icons.record_voice_over_rounded,
    'PARTICIPLE_PHRASES' => Icons.format_quote_rounded,
    'INVERSION' => Icons.swap_vert_rounded,
    'QUESTION_TAG' => Icons.label_rounded,
    'DE_STRUCTURE' => Icons.account_tree_rounded,
    'COMPOUND_ADJ' => Icons.link_rounded,
    'PHRASAL_VERB' => Icons.extension_rounded,
    _ => Icons.auto_stories_rounded,
  };
}
