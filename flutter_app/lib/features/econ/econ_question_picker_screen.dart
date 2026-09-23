import 'dart:async';

import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';

import '../../core/app_palette.dart';
import '../../core/app_sfx.dart';
import '../../core/widgets/original_section_frame.dart';
import '../../core/widgets/stationery_frame.dart';
import 'econ_question_models.dart';
import 'econ_question_repository.dart';
import 'econ_practice_screen.dart';
import 'econ_cloud_repository.dart';
import 'econ_palette.dart';
import 'econ_language_switch.dart';
import 'econ_learning_menu_screen.dart';

class EconQuestionPickerScreen extends StatefulWidget {
  const EconQuestionPickerScreen({
    required this.mode,
    this.repository,
    this.progressRepository,
    this.practiceCount = 10,
    this.onPracticeCountChanged,
    this.onClose,
    this.onSettings,
    this.settingsActive = false,
    this.onRoundCompleted,
    this.language = 'zh',
    this.onLanguageChanged,
    super.key,
  });

  final EconGamePickerMode mode;
  final EconQuestionBankRepository? repository;
  final EconCloudRepository? progressRepository;
  final int practiceCount;
  final ValueChanged<double>? onPracticeCountChanged;
  final VoidCallback? onClose;
  final VoidCallback? onSettings;
  final bool settingsActive;
  final ValueChanged<int>? onRoundCompleted;
  final String language;
  final ValueChanged<String>? onLanguageChanged;

  @override
  State<EconQuestionPickerScreen> createState() =>
      _EconQuestionPickerScreenState();
}

class _EconQuestionPickerScreenState extends State<EconQuestionPickerScreen> {
  static const _cardColors = <Color>[
    Color(0xFFFFC067),
    Color(0xFF4ECDC4),
    Color(0xFF8FB8FF),
    Color(0xFFFF9FB2),
    Color(0xFFCDB4DB),
    Color(0xFFFF8FA3),
  ];
  late final EconQuestionBankRepository _repository;
  late final EconCloudRepository? _progressRepository;
  List<EconQuestion> _questions = const [];
  Map<String, String> _progress = const {};
  late String _language = widget.language;
  EconPaper _paper = EconPaper.p1;
  EconSourceMode _sourceMode = EconSourceMode.past;
  Object? _error;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _repository = widget.repository ?? const EconQuestionRepository();
    _progressRepository = widget.progressRepository ??
        (Firebase.apps.isEmpty ? null : EconCloudRepository());
    final cached = _repository is EconQuestionRepository
        ? EconQuestionRepository.cachedQuestions()
        : null;
    if (cached != null) {
      _questions = cached;
      _loading = false;
    } else {
      unawaited(_load());
    }
    unawaited(_loadProgress());
  }

  Future<void> _load() async {
    try {
      final questions = await _repository.loadQuestions();
      if (!mounted) return;
      setState(() {
        _questions = questions;
        _loading = false;
        _error = null;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = error;
      });
    }
  }

  Future<void> _loadProgress() async {
    final repository = _progressRepository;
    if (repository == null) return;
    try {
      final progress = await repository.loadQuestionProgress();
      if (!mounted) return;
      setState(() => _progress = {...progress, ..._progress});
    } catch (_) {
      // The picker remains usable offline and simply shows zero progress.
    }
  }

  List<EconQuestion> get _filtered => filterEconQuestions(
        _questions,
        language: _language,
        paper: _paper,
        sourceMode: widget.mode == EconGamePickerMode.year ? _sourceMode : null,
      );

  List<int> get _chapters =>
      _filtered.map((question) => question.chapterNo).toSet().toList()..sort();

  String _progressSummary(Iterable<EconQuestion> questions) {
    var correct = 0;
    var wrong = 0;
    final seen = <String>{};
    for (final question in questions) {
      if (!seen.add(question.id)) continue;
      final outcome = _progress[question.id];
      if (outcome == 'correct') {
        correct += 1;
      } else if (outcome == 'incorrect') {
        wrong += 1;
      }
    }
    return _language == 'zh'
        ? '啱 $correct · 錯 $wrong'
        : 'Correct $correct · Wrong $wrong';
  }

  void _openQuestions(List<EconQuestion> questions) {
    if (questions.isEmpty) return;
    final count = widget.mode == EconGamePickerMode.year
        ? questions.length
        : widget.practiceCount.clamp(1, questions.length).toInt();
    final ordered = widget.mode == EconGamePickerMode.topics
        ? prioritizeEconTopicQuestions(questions, _progress)
        : sortEconQuestionsByPublication(questions);
    final selectedQuestions = ordered.take(count).toList(growable: false);
    unawaited(AppSfx.instance.play(SfxCue.start));
    unawaited(
      Navigator.of(context)
          .push(
            MaterialPageRoute<void>(
              builder: (_) => EconPracticeScreen(
                questions: selectedQuestions,
                onQuestionChecked: _recordQuestionOutcome,
                onCompleted: widget.onRoundCompleted,
              ),
            ),
          )
          .then<void>((_) => _loadProgress()),
    );
  }

  void _recordQuestionOutcome(String questionId, bool correct) {
    if (!mounted) return;
    setState(() {
      _progress = {
        ..._progress,
        questionId: correct ? 'correct' : 'incorrect',
      };
    });
  }

  @override
  Widget build(BuildContext context) {
    final isTopics = widget.mode == EconGamePickerMode.topics;
    final title = isTopics ? '逐課操' : '逐份操';
    return Scaffold(
      backgroundColor: AppPalette.background,
      body: OriginalSectionFrame(
        sectionKey: Key('econ-picker-${widget.mode.name}'),
        eyebrow: 'ECON',
        title: title,
        onSettings: widget.onSettings,
        settingsActive: widget.settingsActive,
        settingsKey: const Key('econ-picker-settings'),
        accentColor: EconPalette.primary,
        accentDarkColor: EconPalette.primaryDark,
        accentSoftColor: EconPalette.softPrimary,
        accentShadowColor: const Color(0xFFFFE7A3),
        trailing: EconLanguageSwitch(
          language: _language,
          onChanged: (value) {
            setState(() => _language = value);
            widget.onLanguageChanged?.call(value);
          },
        ),
        child: _loading
            ? const Center(
                child:
                    CircularProgressIndicator(color: EconPalette.primaryDark))
            : _error != null
                ? _ErrorPanel(onRetry: _load)
                : Column(
                    children: [
                      if (isTopics) ...[
                        EconPracticeCountPanel(
                          practiceCount: widget.practiceCount.toDouble(),
                          onPracticeCountChanged: widget.onPracticeCountChanged,
                        ),
                        const SizedBox(height: 10),
                      ],
                      Row(
                        children: [
                          Expanded(
                            child: _PickerSegment(
                              label: isTopics ? 'Paper 1' : 'Paper 1 MC',
                              selected: _paper == EconPaper.p1,
                              onTap: () =>
                                  setState(() => _paper = EconPaper.p1),
                            ),
                          ),
                          const SizedBox(width: 7),
                          Expanded(
                            child: _PickerSegment(
                              label: isTopics ? 'Paper 2' : 'Paper 2 LQ',
                              selected: _paper == EconPaper.p2,
                              onTap: () =>
                                  setState(() => _paper = EconPaper.p2),
                            ),
                          ),
                        ],
                      ),
                      if (!isTopics) ...[
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: _PickerSegment(
                                label:
                                    _language == 'en' ? 'Past Paper' : '歷屆試卷',
                                selected: _sourceMode == EconSourceMode.past,
                                onTap: () => setState(
                                    () => _sourceMode = EconSourceMode.past),
                              ),
                            ),
                            const SizedBox(width: 7),
                            Expanded(
                              child: _PickerSegment(
                                label:
                                    _language == 'en' ? 'Mock Paper' : '模擬試卷',
                                selected: _sourceMode == EconSourceMode.mock,
                                onTap: () => setState(
                                    () => _sourceMode = EconSourceMode.mock),
                              ),
                            ),
                          ],
                        ),
                      ],
                      const SizedBox(height: 8),
                      Expanded(
                        child: ListView.separated(
                          key: const Key('econ-question-picker-list'),
                          physics: const BouncingScrollPhysics(),
                          padding: const EdgeInsets.fromLTRB(0, 12, 0, 12),
                          itemCount: isTopics
                              ? _chapters.length
                              : econSetLabels(_questions,
                                      language: _language,
                                      paper: _paper,
                                      sourceMode: _sourceMode)
                                  .length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: 10),
                          itemBuilder: (context, index) {
                            if (isTopics) {
                              final chapter = _chapters[index];
                              final questions = _filtered
                                  .where((question) =>
                                      question.chapterNo == chapter)
                                  .toList();
                              final label = questions.first.chapterTitle;
                              return _PickerRow(
                                key: Key('econ-chapter-$chapter'),
                                tag:
                                    'CHAPTER ${chapter.toString().padLeft(2, '0')}',
                                title: label,
                                subtitle: _progressSummary(questions),
                                icon: Icons.menu_book_rounded,
                                color: _cardColors[index % _cardColors.length],
                                onTap: () => _openQuestions(questions),
                              );
                            }
                            final labels = econSetLabels(_questions,
                                language: _language,
                                paper: _paper,
                                sourceMode: _sourceMode);
                            final label = labels[index];
                            final questions = _filtered
                                .where((question) => question.setLabel == label)
                                .toList();
                            return _PickerRow(
                              key:
                                  Key('econ-set-${label.replaceAll(' ', '-')}'),
                              tag: _paper == EconPaper.p1
                                  ? 'PAPER 1'
                                  : 'PAPER 2',
                              title: econSetLabelForDisplay(label,
                                  language: _language),
                              subtitle: _progressSummary(questions),
                              icon: Icons.description_rounded,
                              color: _cardColors[index % _cardColors.length],
                              onTap: () => _openQuestions(questions),
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

enum EconGamePickerMode { topics, year }

class _PickerSegment extends StatelessWidget {
  const _PickerSegment(
      {required this.label, required this.selected, required this.onTap});

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 140),
        height: 42,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: selected ? EconPalette.softPrimary : Colors.white,
          border: Border.all(
            color: selected ? EconPalette.primaryDark : AppPalette.border,
            width: selected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? EconPalette.primaryDark : AppPalette.muted,
            fontSize: 14,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
    );
  }
}

class _PickerRow extends StatelessWidget {
  const _PickerRow({
    required this.tag,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.onTap,
    super.key,
  });

  final String title;
  final String tag;
  final String subtitle;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final compact = MediaQuery.sizeOf(context).width < 380;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            StationeryFrame(
              padding: const EdgeInsets.fromLTRB(18, 23, 16, 18),
              backgroundColor: Colors.white,
              borderColor: color,
              shadowColor: color.withValues(alpha: .25),
              glowColor: color,
              radius: 18,
              ringWidth: 4,
              shadowDepth: 5,
              child: Row(
                children: [
                  Container(
                    width: compact ? 50 : 56,
                    height: compact ? 50 : 56,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: color.withValues(alpha: .18),
                      shape: BoxShape.circle,
                      border: Border.all(color: color, width: 2),
                    ),
                    child: Icon(icon, color: color, size: compact ? 27 : 30),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(title,
                            style: TextStyle(
                                color: AppPalette.ink,
                                fontSize: compact ? 18 : 21,
                                fontWeight: FontWeight.w900),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis),
                        const SizedBox(height: 5),
                        Text(subtitle,
                            style: TextStyle(
                                color: AppPalette.muted,
                                fontSize: compact ? 13 : 14,
                                fontWeight: FontWeight.w800),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis),
                      ],
                    ),
                  ),
                  Icon(Icons.arrow_forward_rounded, color: color, size: 25),
                ],
              ),
            ),
            Positioned(
              left: 14,
              top: -12,
              child: OriginalYellowTag(label: tag),
            ),
          ],
        ),
      ),
    );
  }
}

class _ErrorPanel extends StatelessWidget {
  const _ErrorPanel({required this.onRetry});

  final Future<void> Function() onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.error_outline_rounded,
              color: AppPalette.dangerDark, size: 42),
          const SizedBox(height: 10),
          const Text('ECON 題庫未能載入',
              style: TextStyle(
                  color: AppPalette.dangerDark,
                  fontSize: 17,
                  fontWeight: FontWeight.w900)),
          const SizedBox(height: 14),
          FilledButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh_rounded),
              label: const Text('再試一次')),
        ],
      ),
    );
  }
}
