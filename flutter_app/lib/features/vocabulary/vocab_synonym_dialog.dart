import 'package:flutter/material.dart';

import '../../core/app_palette.dart';
import '../../core/app_sfx.dart';
import '../../core/widgets/original_modal.dart';
import '../../core/widgets/stationery_frame.dart';
import 'vocab_synonym_repository.dart';

class VocabSynonymDialog extends StatefulWidget {
  const VocabSynonymDialog({
    required this.sourceWord,
    required this.groups,
    required this.onSave,
    this.onSkip,
    super.key,
  });

  final String sourceWord;
  final List<VocabSynonymGroup> groups;
  final Future<bool> Function(List<VocabSynonymCandidate> candidates) onSave;
  final VoidCallback? onSkip;

  @override
  State<VocabSynonymDialog> createState() => _VocabSynonymDialogState();
}

class _VocabSynonymDialogState extends State<VocabSynonymDialog> {
  late Set<String> _selectedIds;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _selectedIds = {
      for (final candidate in _candidates)
        if (!candidate.saved) candidate.id,
    };
  }

  List<VocabSynonymCandidate> get _candidates =>
      widget.groups.expand((group) => group.candidates).toList(growable: false);

  List<VocabSynonymCandidate> get _selected => _candidates
      .where((candidate) =>
          !candidate.saved && _selectedIds.contains(candidate.id))
      .toList(growable: false);

  void _toggle(VocabSynonymCandidate candidate) {
    if (_saving || candidate.saved) return;
    setState(() {
      if (!_selectedIds.remove(candidate.id)) {
        _selectedIds.add(candidate.id);
      }
    });
  }

  Future<void> _save() async {
    final selected = _selected;
    if (_saving || selected.isEmpty) return;
    setState(() => _saving = true);
    final saved = await widget.onSave(selected);
    if (!mounted) return;
    if (saved) {
      Navigator.of(context).pop();
    } else {
      setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final maxHeight = MediaQuery.sizeOf(context).height * 0.82;
    final selectedCount = _selected.length;
    return ConstrainedBox(
      key: const Key('vocab-synonym-dialog'),
      constraints: BoxConstraints(maxWidth: 520, maxHeight: maxHeight),
      child: TweenAnimationBuilder<double>(
        key: const Key('vocab-synonym-dialog-animation'),
        tween: Tween(begin: 0.0, end: 1.0),
        duration: const Duration(milliseconds: 420),
        curve: Curves.easeOutBack,
        builder: (context, value, child) => Opacity(
          opacity: value.clamp(0, 1),
          child: Transform.scale(
            alignment: Alignment.center,
            scale: 0.78 + (0.22 * value),
            child: child,
          ),
        ),
        child: StationeryFrame(
          backgroundColor: Colors.white,
          borderColor: AppPalette.primary,
          strokeWidth: 4,
          radius: 28,
          ringWidth: 6,
          shadowDepth: 10,
          padding: const EdgeInsets.all(17),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'DSE DATABASE',
                          style: TextStyle(
                            color: AppPalette.primaryDark,
                            fontSize: 11,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          '同義詞提示',
                          style: TextStyle(
                            color: Color(0xFF5D4037),
                            fontSize: 23,
                            height: 1.1,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    key: const Key('vocab-synonym-close'),
                    tooltip: '略過同義詞提示',
                    onPressed: _saving
                        ? null
                        : () {
                            AppSfx.instance.play(SfxCue.close);
                            widget.onSkip?.call();
                            Navigator.of(context).pop();
                          },
                    icon: const Icon(Icons.close_rounded),
                    color: AppPalette.muted,
                  ),
                ],
              ),
              const SizedBox(height: 10),
              OriginalDashedSurface(
                backgroundColor: AppPalette.softPrimary,
                borderColor: AppPalette.primary,
                shadowColor: const Color(0xFFBDE0E1),
                strokeWidth: 2,
                radius: 16,
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                child: Row(
                  children: [
                    const Text(
                      '由',
                      style: TextStyle(
                        color: AppPalette.muted,
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        widget.sourceWord,
                        style: const TextStyle(
                          color: Color(0xFF5D4037),
                          fontSize: 17,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                    Text(
                      '${_candidates.length} 個連結',
                      style: const TextStyle(
                        color: AppPalette.primaryDark,
                        fontSize: 12,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 11),
              Flexible(
                child: ListView(
                  shrinkWrap: true,
                  physics: const BouncingScrollPhysics(),
                  children: [
                    for (final group in widget.groups) ...[
                      Padding(
                        padding: const EdgeInsets.fromLTRB(2, 0, 2, 6),
                        child: Text(
                          group.meaning,
                          style: const TextStyle(
                            color: AppPalette.muted,
                            fontSize: 13,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                      OriginalDashedSurface(
                        backgroundColor: const Color(0xFFFFFDF7),
                        borderColor: const Color(0xFFF2C879),
                        shadowColor: const Color(0xFFF4E7C2),
                        strokeWidth: 2,
                        radius: 17,
                        padding: const EdgeInsets.all(9),
                        child: Wrap(
                          spacing: 7,
                          runSpacing: 7,
                          children: group.candidates
                              .map((candidate) => _SynonymCandidateChip(
                                    candidate: candidate,
                                    selected: candidate.saved ||
                                        _selectedIds.contains(candidate.id),
                                    onTap: () => _toggle(candidate),
                                  ))
                              .toList(growable: false),
                        ),
                      ),
                      const SizedBox(height: 10),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      key: const Key('vocab-synonym-skip'),
                      onPressed: _saving
                          ? null
                          : () {
                              widget.onSkip?.call();
                              Navigator.of(context).pop();
                            },
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size.fromHeight(48),
                        foregroundColor: AppPalette.muted,
                        backgroundColor: Colors.white,
                        side: const BorderSide(
                            color: AppPalette.border, width: 2),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(999),
                        ),
                        textStyle: const TextStyle(fontWeight: FontWeight.w900),
                      ),
                      child: const Text('略過'),
                    ),
                  ),
                  const SizedBox(width: 9),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton.icon(
                      key: const Key('vocab-synonym-save'),
                      onPressed: _saving || selectedCount == 0 ? null : _save,
                      icon: _saving
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.add_rounded),
                      label: Text(
                        _saving
                            ? '儲存中...'
                            : selectedCount == 0
                                ? '全部已加入'
                                : '加入 $selectedCount 個同義詞',
                      ),
                      style: ElevatedButton.styleFrom(
                        minimumSize: const Size.fromHeight(48),
                        backgroundColor: AppPalette.secondary,
                        disabledBackgroundColor: const Color(0xFFF2F2F2),
                        foregroundColor: const Color(0xFF5D4037),
                        disabledForegroundColor: AppPalette.muted,
                        shadowColor: AppPalette.secondaryDark,
                        elevation: 4,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(999),
                        ),
                        textStyle: const TextStyle(fontWeight: FontWeight.w900),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SynonymCandidateChip extends StatelessWidget {
  const _SynonymCandidateChip({
    required this.candidate,
    required this.selected,
    required this.onTap,
  });

  final VocabSynonymCandidate candidate;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final enabled = !candidate.saved;
    final background = candidate.saved
        ? const Color(0xFFEAF4F2)
        : selected
            ? AppPalette.softSecondary
            : Colors.white;
    final border = candidate.saved
        ? AppPalette.tick
        : selected
            ? AppPalette.secondaryDark
            : AppPalette.primary.withValues(alpha: 0.7);
    return Semantics(
      button: true,
      selected: selected,
      enabled: enabled,
      label: '${candidate.display} ${candidate.meaningLine}',
      child: GestureDetector(
        key: ValueKey('vocab-synonym-candidate-${candidate.id}'),
        behavior: HitTestBehavior.opaque,
        onTap: enabled ? onTap : null,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 140),
          constraints: const BoxConstraints(minHeight: 40),
          padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 7),
          decoration: BoxDecoration(
            color: background,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: border, width: selected ? 2.5 : 2),
            boxShadow: selected
                ? const [
                    BoxShadow(color: Color(0xFFE5BD5F), offset: Offset(0, 3))
                  ]
                : null,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Flexible(
                    child: Text(
                      candidate.display,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Color(0xFF5D4037),
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                  if (candidate.saved) ...[
                    const SizedBox(width: 4),
                    const Icon(
                      Icons.check_circle_rounded,
                      size: 14,
                      color: AppPalette.tick,
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 1),
              Text(
                candidate.meaningLine,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: AppPalette.muted,
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

Future<void> showVocabSynonymDialog({
  required BuildContext context,
  required String sourceWord,
  required List<VocabSynonymGroup> groups,
  required Future<bool> Function(List<VocabSynonymCandidate> candidates) onSave,
}) {
  return showOriginalModal<void>(
    context: context,
    barrierLabel: '同義詞提示',
    child: VocabSynonymDialog(
      sourceWord: sourceWord,
      groups: groups,
      onSave: onSave,
    ),
  );
}
