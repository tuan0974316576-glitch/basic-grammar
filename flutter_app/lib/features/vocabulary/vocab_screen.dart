import 'dart:async';

import 'package:flutter/material.dart';

import '../../core/app_palette.dart';
import '../../core/app_sfx.dart';
import '../../core/widgets/stationery_frame.dart';
import 'vocab_audio_repository.dart';
import 'vocab_controller.dart';
import 'vocab_models.dart';
import 'vocab_repository.dart';

class VocabularyScreen extends StatefulWidget {
  const VocabularyScreen({
    this.controller,
    this.audioRepository,
    super.key,
  });

  final VocabController? controller;
  final VocabAudioRepository? audioRepository;

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
          lookupRepository: AssetVocabLookupRepository(),
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
    final keyboardIsOpen = MediaQuery.viewInsetsOf(context).bottom > 0;
    return SafeArea(
      child: Column(
        children: [
          _VocabularyHeader(
            wordCount: _controller.items.length,
            reviewCount: _controller.dueCount,
            pulse: _pulseController,
            shouldPulse: _controller.items.length >= 4,
            onReview: _openReview,
          ),
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
            if (keyboardIsOpen)
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(14, 4, 14, 8),
                  child: SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    keyboardDismissBehavior:
                        ScrollViewKeyboardDismissBehavior.onDrag,
                    child: _VocabEntryPanel(
                      controller: _controller,
                      textController: _textController,
                      focusNode: _focusNode,
                      onChanged: _controller.updateQuery,
                      onAdd: _addWord,
                    ),
                  ),
                ),
              )
            else ...[
              Padding(
                padding: const EdgeInsets.fromLTRB(14, 4, 14, 8),
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
        ],
      ),
    );
  }
}

class _VocabularyHeader extends StatelessWidget {
  const _VocabularyHeader({
    required this.wordCount,
    required this.reviewCount,
    required this.pulse,
    required this.shouldPulse,
    required this.onReview,
  });

  final int wordCount;
  final int reviewCount;
  final Animation<double> pulse;
  final bool shouldPulse;
  final VoidCallback onReview;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(18, 9, 13, 7),
      child: Row(
        children: [
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'DOPE ENGLISH',
                  style: TextStyle(
                    color: AppPalette.primaryDark,
                    fontSize: 12,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                Text(
                  '我的生字簿',
                  style: TextStyle(
                    color: AppPalette.ink,
                    fontSize: 25,
                    height: 1.05,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
          ),
          Text(
            '$wordCount 個',
            style: const TextStyle(
              color: AppPalette.muted,
              fontSize: 14,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(width: 10),
          AnimatedBuilder(
            animation: pulse,
            builder: (context, child) {
              final scale = shouldPulse ? 1 + pulse.value * 0.08 : 1.0;
              return Transform.scale(scale: scale, child: child);
            },
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                IconButton(
                  key: const Key('vocab-review-button'),
                  tooltip: '溫習生字',
                  onPressed: onReview,
                  icon: const Icon(Icons.fitness_center_rounded, size: 29),
                  color: const Color(0xFF9E8A63),
                  style: IconButton.styleFrom(
                    backgroundColor: AppPalette.softSecondary,
                    side: const BorderSide(
                      color: AppPalette.secondaryDark,
                      width: 2,
                    ),
                  ),
                ),
                if (reviewCount > 0)
                  Positioned(
                    right: -2,
                    top: -3,
                    child: Container(
                      constraints:
                          const BoxConstraints(minWidth: 20, minHeight: 20),
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
    return StationeryFrame(
      radius: 16,
      ringWidth: 3,
      shadowDepth: 3,
      padding: const EdgeInsets.fromLTRB(14, 13, 14, 14),
      backgroundColor: AppPalette.softPrimary,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'ENGLISH WORD',
            style: TextStyle(
              color: AppPalette.primaryDark,
              fontSize: 12,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 6),
          TextField(
            key: const Key('vocab-word-input'),
            controller: textController,
            focusNode: focusNode,
            showCursor: true,
            enableInteractiveSelection: true,
            autocorrect: false,
            enableSuggestions: false,
            textCapitalization: TextCapitalization.sentences,
            textInputAction: TextInputAction.done,
            onChanged: onChanged,
            onSubmitted: (_) => focusNode.unfocus(),
            decoration: InputDecoration(
              hintText: '輸入英文生字或詞語',
              filled: true,
              fillColor: AppPalette.paper,
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              suffixIcon: controller.isLookingUp
                  ? const Padding(
                      padding: EdgeInsets.all(13),
                      child: SizedBox.square(
                        dimension: 18,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          color: AppPalette.primary,
                        ),
                      ),
                    )
                  : controller.query.isNotEmpty
                      ? IconButton(
                          tooltip: '清除',
                          onPressed: () => onChanged(''),
                          icon: const Icon(Icons.close_rounded),
                        )
                      : null,
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide:
                    const BorderSide(color: AppPalette.primary, width: 2),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide:
                    const BorderSide(color: AppPalette.primaryDark, width: 3),
              ),
            ),
            style: const TextStyle(
              color: AppPalette.ink,
              fontSize: 19,
              fontWeight: FontWeight.w800,
            ),
          ),
          if (controller.lookupSenses.isNotEmpty) ...[
            const SizedBox(height: 11),
            const Text(
              '揀選中文意思（可多選）',
              style: TextStyle(
                color: AppPalette.muted,
                fontSize: 13,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 7),
            ConstrainedBox(
              constraints: const BoxConstraints(maxHeight: 132),
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Wrap(
                  spacing: 7,
                  runSpacing: 7,
                  children: controller.lookupSenses.map((sense) {
                    final selected =
                        controller.selectedSenseIds.contains(sense.id);
                    return FilterChip(
                      key: ValueKey('vocab-sense-${sense.id}'),
                      selected: selected,
                      onSelected: (_) {
                        controller.toggleSense(sense);
                        unawaited(AppSfx.instance.play(SfxCue.step));
                      },
                      label: Text(sense.label),
                      checkmarkColor: AppPalette.correctDark,
                      selectedColor: AppPalette.softCorrect,
                      backgroundColor: AppPalette.softSecondary,
                      side: BorderSide(
                        color: selected
                            ? AppPalette.correct
                            : AppPalette.secondaryDark,
                        width: 2,
                      ),
                      labelStyle: TextStyle(
                        color:
                            selected ? AppPalette.correctDark : AppPalette.ink,
                        fontWeight: FontWeight.w800,
                      ),
                    );
                  }).toList(growable: false),
                ),
              ),
            ),
            const SizedBox(height: 10),
            FilledButton.icon(
              key: const Key('vocab-add-button'),
              onPressed: controller.canAdd ? onAdd : null,
              icon: const Icon(Icons.add_rounded),
              label: Text(
                controller.selectedSenseIds.length > 1
                    ? '加入 ${controller.selectedSenseIds.length} 個意思'
                    : '加入',
              ),
              style: FilledButton.styleFrom(
                backgroundColor: AppPalette.secondary,
                foregroundColor: const Color(0xFF614F16),
                disabledBackgroundColor: const Color(0xFFE5E5E0),
                minimumSize: const Size.fromHeight(45),
                textStyle:
                    const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
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
        ],
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
      padding: const EdgeInsets.fromLTRB(14, 0, 14, 24),
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

class _VocabRow extends StatelessWidget {
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
  Widget build(BuildContext context) {
    return StationeryFrame(
      radius: 12,
      ringWidth: 2,
      shadowDepth: 3,
      borderColor: const Color(0xFF9BD8D3),
      padding: const EdgeInsets.all(11),
      child: Column(
        children: [
          InkWell(
            key: ValueKey('vocab-row-${item.id}'),
            onTap: onSpeakWord,
            borderRadius: BorderRadius.circular(9),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.word,
                        style: const TextStyle(
                          color: AppPalette.ink,
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 3),
                      ...item.senses.map((sense) => Text(
                            sense.label,
                            style: const TextStyle(
                              color: AppPalette.muted,
                              fontSize: 14,
                              height: 1.28,
                              fontWeight: FontWeight.w700,
                            ),
                          )),
                    ],
                  ),
                ),
                Text(
                  '${item.totalCorrect}/${item.totalSeen}',
                  style: const TextStyle(
                    color: AppPalette.primaryDark,
                    fontSize: 12,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(width: 7),
                _SmallTextButton(
                  label: '例',
                  selected: expanded,
                  onTap: onToggleExamples,
                ),
                const SizedBox(width: 5),
                IconButton(
                  key: ValueKey('vocab-delete-${item.id}'),
                  tooltip: '刪除 ${item.word}',
                  onPressed: onDelete,
                  icon: const Icon(Icons.close_rounded, size: 20),
                  color: AppPalette.dangerDark,
                  style: IconButton.styleFrom(
                    backgroundColor: AppPalette.softDanger,
                    minimumSize: const Size.square(36),
                    maximumSize: const Size.square(36),
                    padding: EdgeInsets.zero,
                    side: const BorderSide(color: AppPalette.danger, width: 2),
                  ),
                ),
              ],
            ),
          ),
          AnimatedSize(
            duration: const Duration(milliseconds: 220),
            alignment: Alignment.topCenter,
            child: expanded
                ? Padding(
                    padding: const EdgeInsets.only(top: 10),
                    child: _ExamplePanel(
                      loading: examplesLoading,
                      sections: exampleSections,
                      speakingExample: speakingExample,
                      onSpeakExample: onSpeakExample,
                    ),
                  )
                : const SizedBox.shrink(),
          ),
        ],
      ),
    );
  }
}

class _SmallTextButton extends StatelessWidget {
  const _SmallTextButton({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? AppPalette.softCorrect : AppPalette.softSecondary,
      borderRadius: BorderRadius.circular(9),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(9),
        child: Container(
          width: 36,
          height: 36,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(9),
            border: Border.all(
              color: selected ? AppPalette.correct : AppPalette.secondaryDark,
              width: 2,
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
              color:
                  selected ? AppPalette.correctDark : const Color(0xFF795F19),
              fontSize: 16,
              fontWeight: FontWeight.w900,
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
      child = const Padding(
        padding: EdgeInsets.all(12),
        child: Center(
          child: CircularProgressIndicator(
            color: AppPalette.secondaryDark,
            strokeWidth: 3,
          ),
        ),
      );
    } else if (sections == null ||
        sections!.every((section) => section.examples.isEmpty)) {
      child = const Padding(
        padding: EdgeInsets.all(8),
        child: Text(
          '暫時未有合適例句。',
          style:
              TextStyle(color: AppPalette.muted, fontWeight: FontWeight.w700),
        ),
      );
    } else {
      child = Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          for (final section
              in sections!.where((section) => section.examples.isNotEmpty)) ...[
            if (sections!.length > 1)
              Padding(
                padding: const EdgeInsets.only(bottom: 5),
                child: Text(
                  section.sense.label,
                  style: const TextStyle(
                    color: Color(0xFF8B6E1D),
                    fontSize: 12,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            for (final example in section.examples)
              Padding(
                padding: const EdgeInsets.only(bottom: 9),
                child: InkWell(
                  onTap: () => onSpeakExample(example.english),
                  borderRadius: BorderRadius.circular(7),
                  child: Padding(
                    padding: const EdgeInsets.all(4),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Padding(
                              padding: const EdgeInsets.only(top: 2, right: 5),
                              child: speakingExample == example.english
                                  ? const SizedBox.square(
                                      dimension: 16,
                                      child: CircularProgressIndicator(
                                        color: AppPalette.secondaryDark,
                                        strokeWidth: 2.2,
                                      ),
                                    )
                                  : const Icon(
                                      Icons.volume_up_rounded,
                                      color: AppPalette.secondaryDark,
                                      size: 16,
                                    ),
                            ),
                            Expanded(
                              child: Text(
                                example.english,
                                style: const TextStyle(
                                  color: AppPalette.ink,
                                  fontSize: 14,
                                  height: 1.28,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ),
                          ],
                        ),
                        Padding(
                          padding: const EdgeInsets.only(left: 21, top: 2),
                          child: Text(
                            example.chinese,
                            style: const TextStyle(
                              color: AppPalette.muted,
                              fontSize: 13,
                              height: 1.25,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ],
      );
    }
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppPalette.softSecondary,
        borderRadius: BorderRadius.circular(9),
        border: Border.all(color: AppPalette.secondaryDark, width: 2),
      ),
      child: child,
    );
  }
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
