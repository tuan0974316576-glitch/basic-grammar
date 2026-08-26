import 'dart:async';

import 'package:flutter/material.dart';

import '../../core/app_palette.dart';
import '../../core/app_sfx.dart';
import '../../core/widgets/original_section_frame.dart';
import '../../core/widgets/stationery_frame.dart';
import 'vocab_audio_repository.dart';
import 'cloud_vocab_repository.dart';
import 'vocab_controller.dart';
import 'vocab_models.dart';
import 'vocab_repository.dart';

class VocabularyScreen extends StatefulWidget {
  const VocabularyScreen({
    this.controller,
    this.lookupRepository,
    this.audioRepository,
    this.onSettings,
    this.settingsActive = false,
    super.key,
  });

  final VocabController? controller;
  final VocabLookupRepository? lookupRepository;
  final VocabAudioRepository? audioRepository;
  final VoidCallback? onSettings;
  final bool settingsActive;

  @override
  State<VocabularyScreen> createState() => _VocabularyScreenState();
}

class _VocabularyScreenState extends State<VocabularyScreen>
    with SingleTickerProviderStateMixin {
  late final VocabController _controller;
  late final VocabAudioRepository _audio;
  late final bool _ownsController;
  late final bool _ownsAudio;
  late final AnimationController _pulseController;
  final TextEditingController _textController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  bool _pulseInFlight = false;
  String? _speakingExample;

  @override
  void initState() {
    super.initState();
    _ownsController = widget.controller == null;
    _controller = widget.controller ??
        VocabController(
          lookupRepository: widget.lookupRepository ??
              CloudVocabLookupRepository(local: AssetVocabLookupRepository()),
          store: const SharedPreferencesVocabStore(),
        );
    _ownsAudio = widget.audioRepository == null;
    _audio = widget.audioRepository ?? AssetVocabAudioRepository();
    _controller.addListener(_refresh);
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 620),
      lowerBound: 0,
      upperBound: 1,
    );
    _syncPulseAnimation();
    if (_ownsController) unawaited(_controller.initialize());
  }

  void _refresh() {
    _syncPulseAnimation();
    if (_textController.text != _controller.query) {
      _textController.value = TextEditingValue(
        text: _controller.query,
        selection: TextSelection.collapsed(offset: _controller.query.length),
      );
    }
    if (mounted) setState(() {});
  }

  void _syncPulseAnimation() {
    if (_controller.items.length >= 4) {
      if (!_pulseController.isAnimating && !_pulseInFlight) {
        _pulseInFlight = true;
        unawaited(_playPulseOnce());
      }
    } else if (_pulseController.isAnimating || _pulseController.value != 0) {
      _pulseController.stop();
      _pulseController.value = 0;
    }
  }

  Future<void> _playPulseOnce() async {
    try {
      await _pulseController.forward(from: 0);
      await _pulseController.reverse();
    } on TickerCanceled {
      // The page was disposed while its short attention animation was running.
    } finally {
      _pulseInFlight = false;
    }
  }

  @override
  void dispose() {
    _controller.removeListener(_refresh);
    if (_ownsController) _controller.dispose();
    if (_ownsAudio) unawaited(_audio.dispose());
    _pulseController.dispose();
    _textController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  Future<void> _addWord() async {
    final result = await _controller.addSelected();
    if (!mounted) return;
    if (result == VocabAddResult.added) {
      _focusNode.unfocus();
      unawaited(AppSfx.instance.play(SfxCue.correct));
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('已加入生字簿'),
          duration: Duration(milliseconds: 950),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }
    unawaited(AppSfx.instance.play(SfxCue.wrong));
    if (result == VocabAddResult.saveFailed) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('暫時未能儲存，請再試一次。')),
      );
    }
  }

  Future<void> _deleteWord(VocabItem item) async {
    unawaited(AppSfx.instance.play(SfxCue.click));
    await _controller.deleteItem(item.id);
  }

  Future<void> _speakWord(String word) async {
    unawaited(AppSfx.instance.play(SfxCue.click));
    final played = await _audio.speakWord(word);
    if (!played && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('這個讀音未下載。'),
          duration: Duration(milliseconds: 900),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  Future<void> _speakExample(String sentence) async {
    if (_speakingExample != null) return;
    unawaited(AppSfx.instance.play(SfxCue.click));
    setState(() => _speakingExample = sentence);
    try {
      final played = await _audio.speakExample(sentence);
      if (!played && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('暫時未能播放這句例句，請檢查網絡後再試。'),
            duration: Duration(milliseconds: 1600),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _speakingExample = null);
    }
  }

  void _openReview() {
    unawaited(AppSfx.instance.play(
      _controller.items.isEmpty ? SfxCue.wrong : SfxCue.start,
    ));
    if (_controller.items.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('先加入生字，便可以開始溫習。')),
      );
      return;
    }
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => VocabularyReviewScreen(
          items: _controller.items,
          audioRepository: _audio,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return OriginalSectionFrame(
      sectionKey: const Key('original-section-frame-vocabulary'),
      eyebrow: 'Vocabulary',
      title: '詞彙本',
      onSettings: widget.onSettings,
      settingsActive: widget.settingsActive,
      settingsKey: const Key('vocab-settings-button'),
      trailing: _VocabTrainingButton(
        reviewCount: _controller.dueCount,
        pulse: _pulseController,
        shouldPulse: _controller.items.length >= 4,
        onReview: _openReview,
      ),
      child: Column(
        children: [
          if (_controller.isInitializing)
            const Expanded(
              child: Center(
                child: Text(
                  '正在打開生字簿...',
                  style: TextStyle(
                    color: AppPalette.primaryDark,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            )
          else ...[
            const SizedBox(height: 38),
            Padding(
              padding: const EdgeInsets.fromLTRB(2, 0, 2, 8),
              child: _VocabEntryPanel(
                controller: _controller,
                textController: _textController,
                focusNode: _focusNode,
                onChanged: _controller.updateQuery,
                onAdd: _addWord,
              ),
            ),
            Expanded(
              child: _VocabList(
                controller: _controller,
                speakingExample: _speakingExample,
                onSpeakWord: _speakWord,
                onSpeakExample: _speakExample,
                onDelete: _deleteWord,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _VocabTrainingButton extends StatelessWidget {
  const _VocabTrainingButton({
    required this.reviewCount,
    required this.pulse,
    required this.shouldPulse,
    required this.onReview,
  });

  final int reviewCount;
  final Animation<double> pulse;
  final bool shouldPulse;
  final VoidCallback onReview;

  @override
  Widget build(BuildContext context) {
    final compact = MediaQuery.sizeOf(context).width <= 720;
    final size = compact ? 46.0 : 52.0;
    return AnimatedBuilder(
      animation: pulse,
      builder: (context, child) {
        final scale = shouldPulse ? 1 + pulse.value * 0.08 : 1.0;
        return Transform.scale(scale: scale, child: child);
      },
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          _OriginalRaisedButton(
            key: const Key('vocab-review-button'),
            width: size,
            height: size,
            radius: compact ? 14 : 16,
            onTap: onReview,
            backgroundColor: AppPalette.softSecondary,
            foregroundColor: const Color(0xFF5D4037),
            shadowColor: const Color(0xFFE0B84F),
            shadowDepth: 5,
            borderColor: const Color(0xFFFFCF66),
            borderWidth: 3,
            semanticLabel: '開始詞彙溫習',
            child: Image.asset(
              'assets/dumbbel.png',
              width: 31,
              height: 31,
              fit: BoxFit.contain,
            ),
          ),
          if (reviewCount > 0)
            Positioned(
              right: -2,
              top: -3,
              child: Container(
                constraints: const BoxConstraints(
                  minWidth: 20,
                  minHeight: 20,
                ),
                padding: const EdgeInsets.symmetric(horizontal: 5),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppPalette.danger,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.white, width: 2),
                ),
                child: Text(
                  '$reviewCount',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _VocabEntryPanel extends StatelessWidget {
  const _VocabEntryPanel({
    required this.controller,
    required this.textController,
    required this.focusNode,
    required this.onChanged,
    required this.onAdd,
  });

  final VocabController controller;
  final TextEditingController textController;
  final FocusNode focusNode;
  final ValueChanged<String> onChanged;
  final VoidCallback onAdd;

  @override
  Widget build(BuildContext context) {
    final compact = MediaQuery.sizeOf(context).width <= 720;
    return OriginalDashedSurface(
      radius: compact ? 20 : 24,
      strokeWidth: 3,
      shadowColor: const Color(0xFFBDE0E1),
      shadowDepth: 5,
      padding: EdgeInsets.all(compact ? 12 : 16),
      backgroundColor: AppPalette.softPrimary,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _VocabStatsRow(
            wordCount: controller.items.length,
            reviewCount: controller.dueCount,
          ),
          const SizedBox(height: 10),
          ListenableBuilder(
            listenable: focusNode,
            builder: (context, _) {
              final focused = focusNode.hasFocus;
              return OriginalDashedSurface(
                backgroundColor: Colors.white,
                borderColor:
                    focused ? AppPalette.secondaryDark : AppPalette.primary,
                shadowColor: focused
                    ? AppPalette.secondaryDark.withValues(alpha: 0.38)
                    : const Color(0xFFBDE0E1),
                shadowDepth: focused ? 5 : 4,
                radius: 18,
                strokeWidth: 3,
                child: SizedBox(
                  height: 54,
                  child: TextField(
                    key: const Key('vocab-word-input'),
                    controller: textController,
                    focusNode: focusNode,
                    showCursor: true,
                    enableInteractiveSelection: true,
                    autocorrect: false,
                    enableSuggestions: false,
                    textCapitalization: TextCapitalization.none,
                    textInputAction: TextInputAction.done,
                    onChanged: onChanged,
                    onSubmitted: (_) => focusNode.unfocus(),
                    decoration: const InputDecoration(
                      hintText: 'English word',
                      hintStyle: TextStyle(
                        color: Color(0xFFA0A0A0),
                        fontWeight: FontWeight.w900,
                      ),
                      border: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 13,
                      ),
                    ),
                    style: const TextStyle(
                      color: Color(0xFF5D4037),
                      fontSize: 18,
                      height: 1.15,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              );
            },
          ),
          if (controller.lookupSenses.isNotEmpty) ...[
            const SizedBox(height: 9),
            OriginalDashedSurface(
              backgroundColor: const Color(0xFFFFFDF7),
              borderColor: const Color(0xFFF2C879),
              strokeWidth: 2,
              radius: 18,
              padding: const EdgeInsets.all(8),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxHeight: 132),
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  child: Wrap(
                    spacing: 7,
                    runSpacing: 7,
                    children: controller.lookupSenses.map((sense) {
                      final selected =
                          controller.selectedSenseIds.contains(sense.id);
                      return _MeaningChip(
                        key: ValueKey('vocab-sense-${sense.id}'),
                        label: sense.label,
                        selected: selected,
                        onTap: () {
                          controller.toggleSense(sense);
                          unawaited(AppSfx.instance.play(SfxCue.step));
                        },
                      );
                    }).toList(growable: false),
                  ),
                ),
              ),
            ),
          ] else if (!controller.isLookingUp &&
              controller.query.isNotEmpty) ...[
            const SizedBox(height: 10),
            if (controller.suggestions.isNotEmpty) ...[
              const Text(
                '你是否想輸入：',
                style: TextStyle(
                  color: AppPalette.muted,
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 6),
              Wrap(
                spacing: 7,
                runSpacing: 7,
                children: controller.suggestions.map((suggestion) {
                  return ActionChip(
                    label: Text(suggestion.display),
                    onPressed: () {
                      unawaited(controller.chooseSuggestion(suggestion));
                      unawaited(AppSfx.instance.play(SfxCue.click));
                    },
                    backgroundColor: AppPalette.softSecondary,
                    side: const BorderSide(
                        color: AppPalette.secondaryDark, width: 2),
                  );
                }).toList(growable: false),
              ),
            ] else
              const Text(
                '未找到這個詞，請檢查串法。',
                style: TextStyle(
                  color: AppPalette.dangerDark,
                  fontWeight: FontWeight.w800,
                ),
              ),
          ],
          const SizedBox(height: 9),
          _OriginalRaisedButton(
            key: const Key('vocab-add-button'),
            onTap: controller.canAdd ? onAdd : null,
            height: 48,
            radius: 999,
            backgroundColor: AppPalette.secondary,
            foregroundColor: const Color(0xFF5D4037),
            shadowColor: AppPalette.secondaryDark,
            shadowDepth: 6,
            hoverBackgroundColor: const Color(0xFFFFEB85),
            hoverOffset: -2,
            hoverShadowDepth: 8,
            disabledBackgroundColor: const Color(0xFFF3F3F3),
            disabledForegroundColor: const Color(0xFFAAAAAA),
            disabledShadowColor: const Color(0xFFDDDDDD),
            disabledShadowDepth: 4,
            semanticLabel: '加入',
            child: Text(
              controller.selectedSenseIds.length > 1
                  ? '加入 ${controller.selectedSenseIds.length} 個意思'
                  : '加入',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _VocabStatsRow extends StatelessWidget {
  const _VocabStatsRow({required this.wordCount, required this.reviewCount});

  final int wordCount;
  final int reviewCount;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: _VocabStat(label: '已加入', value: wordCount)),
        const SizedBox(width: 10),
        Expanded(child: _VocabStat(label: '待溫習', value: reviewCount)),
      ],
    );
  }
}

class _VocabStat extends StatelessWidget {
  const _VocabStat({required this.label, required this.value});

  final String label;
  final int value;

  @override
  Widget build(BuildContext context) {
    return OriginalDashedSurface(
      backgroundColor: Colors.white.withValues(alpha: 0.86),
      borderColor: AppPalette.border,
      shadowColor: const Color(0xFFF0F0F0),
      strokeWidth: 2,
      shadowDepth: 4,
      radius: 18,
      child: SizedBox(
        height: 70,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              label,
              style: const TextStyle(
                color: AppPalette.muted,
                fontSize: 13,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '$value',
              style: const TextStyle(
                color: Color(0xFF5D4037),
                fontSize: 26,
                height: 1,
                fontWeight: FontWeight.w900,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MeaningChip extends StatelessWidget {
  const _MeaningChip({
    required this.label,
    required this.selected,
    required this.onTap,
    super.key,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return _OriginalRaisedButton(
      onTap: onTap,
      radius: 13,
      backgroundColor: selected ? AppPalette.primary : const Color(0xFFFFF7CF),
      foregroundColor: selected ? Colors.white : const Color(0xFF5D4037),
      shadowColor: selected ? AppPalette.primaryDark : const Color(0xFFE5BD5F),
      shadowDepth: 3,
      semanticLabel: label,
      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 7),
      child: Text(
        label,
        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900),
      ),
    );
  }
}

class _OriginalRaisedButton extends StatefulWidget {
  const _OriginalRaisedButton({
    required this.child,
    required this.backgroundColor,
    required this.foregroundColor,
    required this.shadowColor,
    required this.shadowDepth,
    required this.radius,
    required this.semanticLabel,
    this.onTap,
    this.width,
    this.height,
    this.padding = EdgeInsets.zero,
    this.hoverBackgroundColor,
    this.hoverOffset = 0,
    this.hoverShadowDepth,
    this.disabledBackgroundColor,
    this.disabledForegroundColor,
    this.disabledShadowColor,
    this.disabledShadowDepth,
    this.borderColor,
    this.borderWidth = 0,
    super.key,
  });

  final Widget child;
  final VoidCallback? onTap;
  final double? width;
  final double? height;
  final EdgeInsetsGeometry padding;
  final Color backgroundColor;
  final Color foregroundColor;
  final Color shadowColor;
  final double shadowDepth;
  final double radius;
  final String semanticLabel;
  final Color? hoverBackgroundColor;
  final double hoverOffset;
  final double? hoverShadowDepth;
  final Color? disabledBackgroundColor;
  final Color? disabledForegroundColor;
  final Color? disabledShadowColor;
  final double? disabledShadowDepth;
  final Color? borderColor;
  final double borderWidth;

  @override
  State<_OriginalRaisedButton> createState() => _OriginalRaisedButtonState();
}

class _OriginalRaisedButtonState extends State<_OriginalRaisedButton> {
  bool _hovered = false;
  bool _pressed = false;

  bool get _enabled => widget.onTap != null;

  void _setPressed(bool value) {
    if (_pressed == value || !_enabled) return;
    setState(() => _pressed = value);
  }

  @override
  Widget build(BuildContext context) {
    final hovering = _enabled && _hovered && !_pressed;
    final background = !_enabled
        ? widget.disabledBackgroundColor ?? widget.backgroundColor
        : hovering
            ? widget.hoverBackgroundColor ?? widget.backgroundColor
            : widget.backgroundColor;
    final foreground = !_enabled
        ? widget.disabledForegroundColor ?? widget.foregroundColor
        : widget.foregroundColor;
    final shadow = !_enabled
        ? widget.disabledShadowColor ?? widget.shadowColor
        : widget.shadowColor;
    final depth = !_enabled
        ? widget.disabledShadowDepth ?? widget.shadowDepth
        : _pressed
            ? 0.0
            : hovering
                ? widget.hoverShadowDepth ?? widget.shadowDepth
                : widget.shadowDepth;
    final offset = _pressed ? 4.0 : (hovering ? widget.hoverOffset : 0.0);

    return Semantics(
      button: true,
      enabled: _enabled,
      label: widget.semanticLabel,
      child: MouseRegion(
        cursor: _enabled ? SystemMouseCursors.click : SystemMouseCursors.basic,
        onEnter: (_) {
          if (_enabled) setState(() => _hovered = true);
        },
        onExit: (_) {
          if (_hovered || _pressed) {
            setState(() {
              _hovered = false;
              _pressed = false;
            });
          }
        },
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTapDown: _enabled ? (_) => _setPressed(true) : null,
          onTapUp: _enabled ? (_) => _setPressed(false) : null,
          onTapCancel: _enabled ? () => _setPressed(false) : null,
          onTap: widget.onTap,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 120),
            curve: Curves.easeOut,
            width: widget.width,
            height: widget.height,
            padding: widget.padding,
            alignment: Alignment.center,
            transform: Matrix4.translationValues(0, offset, 0),
            decoration: BoxDecoration(
              color: background,
              borderRadius: BorderRadius.circular(widget.radius),
              border: widget.borderColor == null || widget.borderWidth == 0
                  ? null
                  : Border.all(
                      color: widget.borderColor!,
                      width: widget.borderWidth,
                    ),
              boxShadow: depth == 0
                  ? null
                  : [
                      BoxShadow(
                        color: shadow,
                        offset: Offset(0, depth),
                      ),
                    ],
            ),
            foregroundDecoration: BoxDecoration(
              borderRadius: BorderRadius.circular(widget.radius),
            ),
            child: IconTheme.merge(
              data: IconThemeData(color: foreground),
              child: DefaultTextStyle.merge(
                style: TextStyle(color: foreground),
                child: widget.child,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _VocabList extends StatelessWidget {
  const _VocabList({
    required this.controller,
    required this.speakingExample,
    required this.onSpeakWord,
    required this.onSpeakExample,
    required this.onDelete,
  });

  final VocabController controller;
  final String? speakingExample;
  final ValueChanged<String> onSpeakWord;
  final ValueChanged<String> onSpeakExample;
  final ValueChanged<VocabItem> onDelete;

  @override
  Widget build(BuildContext context) {
    if (controller.items.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(28),
          child: Text(
            '未有生字。\n輸入英文，揀中文意思，再加入。',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: AppPalette.muted,
              fontSize: 16,
              height: 1.45,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      );
    }
    final children = <Widget>[];
    controller.groupedItems.forEach((date, items) {
      children.add(_DateDivider(date: date));
      children.addAll(items.map((item) => Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: _VocabRow(
              item: item,
              expanded: controller.expandedItemId == item.id,
              examplesLoading: controller.examplesAreLoading(item.id),
              exampleSections: controller.examplesFor(item.id),
              speakingExample: speakingExample,
              onSpeakWord: () => onSpeakWord(item.word),
              onSpeakExample: onSpeakExample,
              onToggleExamples: () {
                unawaited(controller.toggleExamples(item));
                unawaited(AppSfx.instance.play(SfxCue.click));
              },
              onDelete: () => onDelete(item),
            ),
          )));
    });
    return ListView(
      key: const Key('vocab-list'),
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(5, 2, 5, 10),
      children: children,
    );
  }
}

class _DateDivider extends StatelessWidget {
  const _DateDivider({required this.date});

  final DateTime date;

  static const _months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  @override
  Widget build(BuildContext context) {
    final label = '${date.day} ${_months[date.month - 1]} ${date.year}';
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Text(
        '---- $label ----',
        textAlign: TextAlign.center,
        style: const TextStyle(
          color: AppPalette.muted,
          fontSize: 12,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class _VocabRow extends StatefulWidget {
  const _VocabRow({
    required this.item,
    required this.expanded,
    required this.examplesLoading,
    required this.exampleSections,
    required this.speakingExample,
    required this.onSpeakWord,
    required this.onSpeakExample,
    required this.onToggleExamples,
    required this.onDelete,
  });

  final VocabItem item;
  final bool expanded;
  final bool examplesLoading;
  final List<VocabExampleSection>? exampleSections;
  final String? speakingExample;
  final VoidCallback onSpeakWord;
  final ValueChanged<String> onSpeakExample;
  final VoidCallback onToggleExamples;
  final VoidCallback onDelete;

  @override
  State<_VocabRow> createState() => _VocabRowState();
}

class _VocabRowState extends State<_VocabRow> {
  bool _hovered = false;
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final compact = MediaQuery.sizeOf(context).width <= 720;
    final highlighted = _hovered || _pressed;
    return MouseRegion(
      onEnter: (_) => setState(() => _hovered = true),
      onExit: (_) => setState(() {
        _hovered = false;
        _pressed = false;
      }),
      child: GestureDetector(
        key: ValueKey('vocab-row-${widget.item.id}'),
        behavior: HitTestBehavior.opaque,
        onTapDown: (_) => setState(() => _pressed = true),
        onTapUp: (_) => setState(() => _pressed = false),
        onTapCancel: () => setState(() => _pressed = false),
        onTap: widget.onSpeakWord,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 120),
          curve: Curves.easeOut,
          transform: Matrix4.translationValues(0, highlighted ? -2 : 0, 0),
          child: OriginalDashedSurface(
            backgroundColor:
                highlighted ? AppPalette.softPrimary : Colors.white,
            borderColor: highlighted ? AppPalette.primary : AppPalette.border,
            shadowColor:
                highlighted ? const Color(0xFFBDE0E1) : const Color(0xFFE9ECEF),
            shadowDepth: highlighted ? 6 : 4,
            radius: compact ? 16 : 20,
            strokeWidth: 3,
            padding: EdgeInsets.all(compact ? 8 : 12),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.item.word,
                            style: const TextStyle(
                              color: Color(0xFF5D4037),
                              fontSize: 20,
                              height: 1.1,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          const SizedBox(height: 3),
                          ...widget.item.senses.map(
                            (sense) => Text(
                              sense.label,
                              style: const TextStyle(
                                color: AppPalette.muted,
                                fontSize: 13,
                                height: 1.2,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    OriginalDashedSurface(
                      backgroundColor: const Color(0xFFF3FFFE),
                      borderColor: AppPalette.primary,
                      strokeWidth: 2,
                      radius: 999,
                      padding: EdgeInsets.symmetric(
                        horizontal: compact ? 7 : 9,
                        vertical: compact ? 5 : 6,
                      ),
                      child: Text(
                        '${widget.item.totalCorrect}/${widget.item.totalSeen}',
                        style: const TextStyle(
                          color: AppPalette.primaryDark,
                          fontSize: 12,
                          height: 1.2,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                    SizedBox(width: compact ? 6 : 10),
                    _OriginalRaisedButton(
                      width: compact ? 36 : 42,
                      height: compact ? 36 : 42,
                      radius: compact ? 12 : 14,
                      onTap: widget.onToggleExamples,
                      backgroundColor: widget.expanded
                          ? const Color(0xFFD6F2F2)
                          : const Color(0xFFEAF8F8),
                      foregroundColor: AppPalette.primaryDark,
                      shadowColor: const Color(0xFFBDE0E1),
                      shadowDepth: 4,
                      semanticLabel:
                          '${widget.expanded ? "收起" : "打開"} ${widget.item.word} 例句',
                      child: const Text(
                        '例',
                        style: TextStyle(
                          fontSize: 18,
                          height: 1,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                    SizedBox(width: compact ? 6 : 10),
                    _OriginalRaisedButton(
                      key: ValueKey('vocab-delete-${widget.item.id}'),
                      width: compact ? 36 : 42,
                      height: compact ? 36 : 42,
                      radius: compact ? 12 : 14,
                      onTap: widget.onDelete,
                      backgroundColor: AppPalette.danger,
                      foregroundColor: Colors.white,
                      shadowColor: AppPalette.dangerDark,
                      shadowDepth: 4,
                      semanticLabel: '刪除 ${widget.item.word}',
                      child: const Text(
                        '×',
                        style: TextStyle(
                          fontSize: 24,
                          height: 1,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ],
                ),
                if (widget.expanded) ...[
                  const SizedBox(height: 9),
                  _ExamplePanel(
                    loading: widget.examplesLoading,
                    sections: widget.exampleSections,
                    speakingExample: widget.speakingExample,
                    onSpeakExample: widget.onSpeakExample,
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ExamplePanel extends StatelessWidget {
  const _ExamplePanel({
    required this.loading,
    required this.sections,
    required this.speakingExample,
    required this.onSpeakExample,
  });

  final bool loading;
  final List<VocabExampleSection>? sections;
  final String? speakingExample;
  final ValueChanged<String> onSpeakExample;

  @override
  Widget build(BuildContext context) {
    Widget child;
    if (loading) {
      child = const Text(
        '例句載入中...',
        style: TextStyle(
          color: Color(0xFF8A6A32),
          fontSize: 13,
          fontWeight: FontWeight.w900,
        ),
      );
    } else if (sections == null ||
        sections!.every((section) => section.examples.isEmpty)) {
      child = const Text(
        '暫時未有合適例句。',
        style: TextStyle(
          color: Color(0xFF8A6A32),
          fontSize: 13,
          fontWeight: FontWeight.w900,
        ),
      );
    } else {
      final visibleSections =
          sections!.where((section) => section.examples.isNotEmpty).toList();
      child = Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          for (var sectionIndex = 0;
              sectionIndex < visibleSections.length;
              sectionIndex++) ...[
            if (sectionIndex > 0) ...[
              const SizedBox(height: 8),
              const _DashedExampleDivider(),
              const SizedBox(height: 8),
            ],
            if (sections!.length > 1)
              Align(
                alignment: Alignment.centerLeft,
                child: Container(
                  margin: const EdgeInsets.only(bottom: 6),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEAF8F8),
                    borderRadius: BorderRadius.circular(9),
                  ),
                  child: Text(
                    visibleSections[sectionIndex].sense.label,
                    style: const TextStyle(
                      color: AppPalette.primaryDark,
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ),
            for (var exampleIndex = 0;
                exampleIndex < visibleSections[sectionIndex].examples.length;
                exampleIndex++) ...[
              if (exampleIndex > 0) const SizedBox(height: 7),
              _ExampleCard(
                example: visibleSections[sectionIndex].examples[exampleIndex],
                speaking: speakingExample ==
                    visibleSections[sectionIndex]
                        .examples[exampleIndex]
                        .english,
                onSpeak: onSpeakExample,
              ),
            ],
          ],
        ],
      );
    }
    return OriginalDashedSurface(
      key: const Key('vocab-example-panel'),
      backgroundColor: const Color(0xFFFFFDF2),
      borderColor: const Color(0xFFF2C879),
      strokeWidth: 2,
      radius: 16,
      padding: const EdgeInsets.all(9),
      child: DefaultTextStyle.merge(
        style: const TextStyle(
          color: Color(0xFF8A6A32),
          fontSize: 13,
          height: 1.35,
          fontWeight: FontWeight.w900,
        ),
        child: child,
      ),
    );
  }
}

class _ExampleCard extends StatelessWidget {
  const _ExampleCard({
    required this.example,
    required this.speaking,
    required this.onSpeak,
  });

  final VocabExample example;
  final bool speaking;
  final ValueChanged<String> onSpeak;

  @override
  Widget build(BuildContext context) {
    return Container(
      key: ValueKey('vocab-example-card-${example.english}'),
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: const Color(0xFFF2C879).withValues(alpha: 0.28),
          width: 2,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Material(
            color: Colors.transparent,
            borderRadius: BorderRadius.circular(8),
            child: InkWell(
              key: ValueKey('vocab-example-english-${example.english}'),
              onTap: () => onSpeak(example.english),
              borderRadius: BorderRadius.circular(8),
              splashColor: AppPalette.primary.withValues(alpha: 0.18),
              highlightColor: const Color(0xFFEAF8F8),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 120),
                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                decoration: BoxDecoration(
                  color:
                      speaking ? const Color(0xFFEAF8F8) : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  example.english,
                  style: const TextStyle(
                    color: Color(0xFF5D4037),
                    fontSize: 13,
                    height: 1.35,
                    fontWeight: FontWeight.w900,
                    decoration: TextDecoration.underline,
                    decorationColor: Color(0x6B49A09F),
                    decorationThickness: 2,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 3),
          Text(
            example.chinese,
            style: const TextStyle(
              color: AppPalette.muted,
              fontSize: 12,
              height: 1.35,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}

class _DashedExampleDivider extends StatelessWidget {
  const _DashedExampleDivider();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 1,
      width: double.infinity,
      child: CustomPaint(painter: _DashedLinePainter()),
    );
  }
}

class _DashedLinePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFFF2C879).withValues(alpha: 0.72)
      ..strokeWidth = 1;
    var x = 0.0;
    while (x < size.width) {
      canvas.drawLine(
        Offset(x, 0.5),
        Offset((x + 5).clamp(0, size.width), 0.5),
        paint,
      );
      x += 8;
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class VocabularyReviewScreen extends StatefulWidget {
  const VocabularyReviewScreen({
    required this.items,
    required this.audioRepository,
    super.key,
  });

  final List<VocabItem> items;
  final VocabAudioRepository audioRepository;

  @override
  State<VocabularyReviewScreen> createState() => _VocabularyReviewScreenState();
}

class _VocabularyReviewScreenState extends State<VocabularyReviewScreen> {
  int _index = 0;
  String? _selectedMeaning;
  bool _resolved = false;
  late List<String> _currentChoices;

  VocabItem get _item => widget.items[_index % widget.items.length];

  @override
  void initState() {
    super.initState();
    _currentChoices = _buildChoices();
  }

  List<String> _buildChoices() {
    final correct = _item.senses.first.label;
    final others = widget.items
        .where((item) => item.id != _item.id)
        .expand((item) => item.senses.take(1))
        .map((sense) => sense.label)
        .where((label) => label != correct)
        .toSet()
        .take(3)
        .toList();
    return [correct, ...others]..shuffle();
  }

  void _choose(String meaning) {
    if (_resolved) return;
    final correct = meaning == _item.senses.first.label;
    setState(() {
      _selectedMeaning = meaning;
      _resolved = true;
    });
    unawaited(AppSfx.instance.play(correct ? SfxCue.correct : SfxCue.wrong));
  }

  void _next() {
    if (_index >= widget.items.length - 1) {
      unawaited(AppSfx.instance.play(SfxCue.complete));
      Navigator.of(context).pop();
      return;
    }
    setState(() {
      _index += 1;
      _selectedMeaning = null;
      _resolved = false;
      _currentChoices = _buildChoices();
    });
    unawaited(AppSfx.instance.play(SfxCue.next));
  }

  @override
  Widget build(BuildContext context) {
    final choices = _currentChoices;
    return Scaffold(
      backgroundColor: AppPalette.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 10, 18, 18),
          child: Column(
            children: [
              Row(
                children: [
                  IconButton(
                    tooltip: '離開',
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close_rounded),
                  ),
                  Expanded(
                    child: LinearProgressIndicator(
                      value:
                          (_index + (_resolved ? 1 : 0)) / widget.items.length,
                      minHeight: 10,
                      borderRadius: BorderRadius.circular(8),
                      color: AppPalette.primary,
                      backgroundColor: const Color(0xFFE4E8E8),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Expanded(
                child: StationeryFrame(
                  backgroundColor: AppPalette.softPrimary,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text(
                        '揀出正確中文意思',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: AppPalette.muted,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const Spacer(),
                      InkWell(
                        onTap: () =>
                            widget.audioRepository.speakWord(_item.word),
                        child: Text(
                          _item.word,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: AppPalette.ink,
                            fontSize: 34,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                      const Spacer(),
                      for (final choice in choices)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 9),
                          child: OutlinedButton(
                            onPressed: _resolved ? null : () => _choose(choice),
                            style: OutlinedButton.styleFrom(
                              backgroundColor: _resolved &&
                                      choice == _item.senses.first.label
                                  ? AppPalette.softCorrect
                                  : _resolved && choice == _selectedMeaning
                                      ? AppPalette.softDanger
                                      : AppPalette.paper,
                              side: BorderSide(
                                color: _resolved &&
                                        choice == _item.senses.first.label
                                    ? AppPalette.correct
                                    : _resolved && choice == _selectedMeaning
                                        ? AppPalette.danger
                                        : AppPalette.primary,
                                width: 2,
                              ),
                              minimumSize: const Size.fromHeight(48),
                            ),
                            child: Text(
                              choice,
                              style: const TextStyle(
                                color: AppPalette.ink,
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
              if (_resolved) ...[
                const SizedBox(height: 12),
                FilledButton(
                  key: const Key('vocab-review-next'),
                  onPressed: _next,
                  style: FilledButton.styleFrom(
                    backgroundColor: AppPalette.primary,
                    foregroundColor: Colors.white,
                    minimumSize: const Size.fromHeight(50),
                  ),
                  child: Text(_index == widget.items.length - 1 ? '完成' : '下一題'),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
