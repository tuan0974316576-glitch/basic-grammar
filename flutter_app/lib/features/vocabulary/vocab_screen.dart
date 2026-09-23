import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lottie/lottie.dart';

import '../../core/app_palette.dart';
import '../../core/app_sfx.dart';
import '../../core/widgets/original_game_keyboard.dart';
import '../../core/widgets/original_section_frame.dart';
import '../../core/widgets/stationery_frame.dart';
import '../grammar/shared/lesson_ui.dart';
import 'vocab_audio_repository.dart';
import 'cloud_vocab_repository.dart';
import 'vocab_controller.dart';
import 'vocab_import_dialog.dart';
import 'vocab_import_models.dart';
import 'vocab_import_repository.dart';
import 'vocab_models.dart';
import 'vocab_repository.dart';
import 'vocab_review_controller.dart';
import 'vocab_speaking_repository.dart';
import 'vocab_spelling_pattern.dart';
import 'vocab_synonym_dialog.dart';
import 'vocab_synonym_repository.dart';

enum _VocabSortMode { recent, alpha, random }

enum _VocabStudyMode { both, english, chinese }

class VocabularyScreen extends StatefulWidget {
  const VocabularyScreen({
    this.controller,
    this.lookupRepository,
    this.audioRepository,
    this.importRepository,
    this.synonymRepository,
    this.sfx,
    this.onSettings,
    this.onKeyboardVisibilityChanged,
    this.onReviewCompleted,
    this.settingsActive = false,
    super.key,
  });

  final VocabController? controller;
  final VocabLookupRepository? lookupRepository;
  final VocabAudioRepository? audioRepository;
  final VocabImportRepository? importRepository;
  final VocabSynonymRepository? synonymRepository;
  final LessonSfx? sfx;
  final VoidCallback? onSettings;

  /// Lets the app shell make room for the custom keyboard at the very bottom
  /// of the window.  The legacy game hides the three main tabs while typing.
  final ValueChanged<bool>? onKeyboardVisibilityChanged;
  final ValueChanged<int>? onReviewCompleted;
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
  late final VocabSynonymRepository _synonymRepository;
  late final LessonSfx _sfx;
  VocabImportRepository? _importRepository;
  final TextEditingController _textController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  final GlobalKey _keyboardKey = GlobalKey();
  final ScrollController _vocabListScrollController = ScrollController();
  final Map<String, GlobalKey> _vocabRowKeys = {};
  bool _keyboardOpen = false;
  String _focusedSearchItemId = '';
  String _lastFocusedSearchWord = '';
  Timer? _focusedSearchTimer;
  String? _speakingWord;
  String? _speakingExample;
  Timer? _speakingWordTimer;
  Timer? _speakingExampleTimer;
  Timer? _synonymLinkTimer;
  _VocabSortMode _sortMode = _VocabSortMode.recent;
  _VocabStudyMode _studyMode = _VocabStudyMode.both;
  List<String> _shuffleOrder = const [];
  Set<String> _revealedItemIds = const {};
  int _shuffleRevision = 0;

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
    _synonymRepository =
        widget.synonymRepository ?? CloudSyncedVocabSynonymRepository();
    _sfx = widget.sfx ?? AppSfx.instance;
    _controller.addListener(_refresh);
    if (_ownsController) unawaited(_controller.initialize());
  }

  void _refresh() {
    if (_textController.text != _controller.query) {
      _textController.value = TextEditingValue(
        text: _controller.query,
        selection: TextSelection.collapsed(offset: _controller.query.length),
      );
    }
    if (mounted) setState(() {});
    _scheduleSavedWordFocus();
  }

  void _scheduleSavedWordFocus() {
    final query = normalizeVocabWord(_controller.query);
    final match = query.isEmpty
        ? null
        : _controller.items.cast<VocabItem?>().firstWhere(
              (item) => item?.normalizedWord == query,
              orElse: () => null,
            );
    if (match == null) {
      _lastFocusedSearchWord = '';
      if (_focusedSearchItemId.isNotEmpty && mounted) {
        setState(() => _focusedSearchItemId = '');
      }
      return;
    }
    if (_lastFocusedSearchWord == query) return;
    _lastFocusedSearchWord = query;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || normalizeVocabWord(_controller.query) != query) return;
      _focusSavedSearchItem(query);
    });
  }

  void _focusSavedSearchItem(String normalizedWord, {int attempt = 0}) {
    if (!mounted || normalizeVocabWord(_controller.query) != normalizedWord) {
      return;
    }
    final match = _controller.items.cast<VocabItem?>().firstWhere(
          (item) => item?.normalizedWord == normalizedWord,
          orElse: () => null,
        );
    if (match == null) return;

    final rowContext = _vocabRowKeys[match.id]?.currentContext;
    if (rowContext != null) {
      Scrollable.ensureVisible(
        rowContext,
        duration: const Duration(milliseconds: 720),
        curve: Curves.easeOutCubic,
        alignment: 0.44,
        alignmentPolicy: ScrollPositionAlignmentPolicy.explicit,
      );
      _focusedSearchTimer?.cancel();
      setState(() => _focusedSearchItemId = match.id);
      unawaited(_sfx.play(SfxCue.step));
      _focusedSearchTimer = Timer(const Duration(milliseconds: 1700), () {
        if (mounted && _focusedSearchItemId == match.id) {
          setState(() => _focusedSearchItemId = '');
        }
      });
      return;
    }

    // ListView only builds visible children.  Move near the estimated row
    // first, then retry after layout so the real row context can be used for
    // the final centre-aligned animation.  This keeps large saved lists fast.
    if (attempt == 0 && _vocabListScrollController.hasClients) {
      final index = _orderedItems.indexWhere(
        (item) => item.id == match.id,
      );
      if (index >= 0) {
        final compact = MediaQuery.sizeOf(context).width <= 720;
        final estimatedRowHeight = compact ? 104.0 : 120.0;
        final position = _vocabListScrollController.position;
        final target = (index * estimatedRowHeight)
            .clamp(0.0, position.maxScrollExtent)
            .toDouble();
        unawaited(_vocabListScrollController.animateTo(
          target,
          duration: const Duration(milliseconds: 520),
          curve: Curves.easeOutCubic,
        ));
      }
    }
    if (attempt < 8) {
      Timer(Duration(milliseconds: 120 + (attempt * 40)), () {
        if (!mounted) return;
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _focusSavedSearchItem(normalizedWord, attempt: attempt + 1);
        });
      });
    }
  }

  void _openVocabKeyboard() {
    if (_keyboardOpen) return;
    setState(() => _keyboardOpen = true);
    widget.onKeyboardVisibilityChanged?.call(true);
    unawaited(_sfx.play(SfxCue.clickEnglishWords));
    _focusNode.requestFocus();
    unawaited(SystemChannels.textInput.invokeMethod<void>('TextInput.hide'));
  }

  void _dismissKeyboardIfOutside(PointerDownEvent event) {
    if (!_keyboardOpen) return;
    final keyboardContext = _keyboardKey.currentContext;
    final renderObject = keyboardContext?.findRenderObject();
    if (renderObject is! RenderBox || !renderObject.hasSize) return;
    final topLeft = renderObject.localToGlobal(Offset.zero);
    final keyboardRect = topLeft & renderObject.size;
    if (!keyboardRect.contains(event.position)) {
      _closeVocabKeyboard();
    }
  }

  void _closeVocabKeyboard() {
    if (!_keyboardOpen) return;
    setState(() => _keyboardOpen = false);
    widget.onKeyboardVisibilityChanged?.call(false);
    _focusNode.unfocus();
    unawaited(SystemChannels.textInput.invokeMethod<void>('TextInput.hide'));
  }

  void _handleVocabKeyboardKey(String key) {
    if (!_keyboardOpen) return;
    final current = _textController.text;
    String next;
    switch (key) {
      case 'BACKSPACE':
        next = current.isEmpty
            ? current
            : current.substring(0, current.length - 1);
      case 'SPACE':
        next = current.endsWith(' ') ? current : '$current ';
      case 'ENTER':
        _closeVocabKeyboard();
        return;
      default:
        next = '$current${key.toLowerCase()}';
    }
    if (next.length > 42) return;
    _textController.value = TextEditingValue(
      text: next,
      selection: TextSelection.collapsed(offset: next.length),
    );
    unawaited(_controller.updateQuery(next));
    unawaited(_sfx.play(SfxCue.type));
  }

  @override
  void dispose() {
    if (_keyboardOpen) {
      widget.onKeyboardVisibilityChanged?.call(false);
    }
    _speakingWordTimer?.cancel();
    _speakingExampleTimer?.cancel();
    _synonymLinkTimer?.cancel();
    _focusedSearchTimer?.cancel();
    _vocabListScrollController.dispose();
    _controller.removeListener(_refresh);
    if (_ownsController) _controller.dispose();
    if (_ownsAudio) unawaited(_audio.dispose());
    _textController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  Future<void> _addWord() async {
    final sourceWord = _controller.query;
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
      _scheduleSynonymLink(sourceWord);
      return;
    }
    unawaited(AppSfx.instance.play(SfxCue.wrong));
    if (result == VocabAddResult.saveFailed) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('暫時未能儲存，請再試一次。')),
      );
    }
  }

  void _scheduleSynonymLink(String sourceWord) {
    final normalized = normalizeVocabWord(sourceWord);
    if (normalized.isEmpty) return;
    _synonymLinkTimer?.cancel();
    _synonymLinkTimer = Timer(const Duration(milliseconds: 1120), () async {
      if (!mounted) return;
      final groups = await _synonymRepository.lookup(normalized);
      if (!mounted || groups.isEmpty) return;
      final savedByWord = <String, VocabItem>{
        for (final item in _controller.items) item.normalizedWord: item,
      };
      final linkedWords = <String>{};
      final linkedGroups = groups
          .map((group) => group.copyWith(
                candidates: group.candidates.where((candidate) {
                  return linkedWords.add(candidate.word);
                }).map((candidate) {
                  final savedItem = savedByWord[candidate.word];
                  final saved = savedItem?.senses.any(
                        (sense) => vocabSenseCovers(sense, candidate.sense),
                      ) ??
                      false;
                  return candidate.copyWith(saved: saved);
                }).toList(growable: false),
              ))
          .where((group) => group.candidates.isNotEmpty)
          .toList(growable: false);
      final selectable = linkedGroups.any(
        (group) => group.candidates.any((candidate) => !candidate.saved),
      );
      if (!selectable) return;
      await showVocabSynonymDialog(
        context: context,
        sourceWord: sourceWord.trim(),
        groups: linkedGroups,
        onSave: (candidates) async {
          final saved = await _controller.addSynonymCandidates(candidates);
          if (!mounted) return saved;
          if (saved) {
            unawaited(AppSfx.instance.play(SfxCue.correct));
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('已加入 ${candidates.length} 個同義詞'),
                duration: const Duration(milliseconds: 1100),
                behavior: SnackBarBehavior.floating,
              ),
            );
          }
          return saved;
        },
      );
    });
  }

  Future<void> _deleteWord(VocabItem item) async {
    unawaited(AppSfx.instance.play(SfxCue.click));
    await _controller.deleteItem(item.id);
  }

  Future<void> _openImport() async {
    _focusNode.unfocus();
    unawaited(AppSfx.instance.play(SfxCue.click));
    try {
      final repository = _importRepository ??=
          widget.importRepository ?? FirebaseVocabImportRepository();
      final sourceRepository = repository is VocabImportSourceRepository
          ? repository as VocabImportSourceRepository
          : null;
      final source = sourceRepository != null
          ? await _chooseImportSource()
          : VocabImportSource.files;
      if (!mounted || source == null) return;
      final files = sourceRepository != null
          ? await sourceRepository.pickFilesFrom(source)
          : await repository.pickFiles();
      if (!mounted || files.isEmpty) return;
      await showDialog<void>(
        context: context,
        barrierDismissible: false,
        builder: (_) => VocabImportDialog(
          files: files,
          repository: repository,
          controller: _controller,
        ),
      );
    } on VocabImportException catch (error) {
      if (!mounted) return;
      unawaited(AppSfx.instance.play(SfxCue.wrong));
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message)),
      );
    } catch (_) {
      if (!mounted) return;
      unawaited(AppSfx.instance.play(SfxCue.wrong));
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('暫時未能開啟筆記，請再試一次。')),
      );
    }
  }

  Future<VocabImportSource?> _chooseImportSource() {
    return showModalBottomSheet<VocabImportSource>(
      context: context,
      backgroundColor: Colors.transparent,
      barrierColor: Colors.black.withValues(alpha: 0.28),
      isScrollControlled: false,
      builder: (context) => SafeArea(
        minimum: const EdgeInsets.fromLTRB(12, 0, 12, 12),
        child: OriginalDashedSurface(
          key: const Key('vocab-import-source-sheet'),
          backgroundColor: const Color(0xFFFFFEFA),
          borderColor: AppPalette.primary,
          shadowColor: const Color(0xFF9ECFD0),
          shadowDepth: 6,
          strokeWidth: 3,
          radius: 18,
          padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 42,
                height: 5,
                decoration: BoxDecoration(
                  color: AppPalette.border,
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                '選擇筆記來源',
                style: TextStyle(
                  color: AppPalette.primaryDark,
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 10),
              _ImportSourceChoice(
                key: const Key('vocab-import-camera-choice'),
                icon: Icons.photo_camera_rounded,
                label: '拍攝相片',
                detail: '即時影低 worksheet 或書本',
                color: AppPalette.softSecondary,
                onTap: () => _chooseImportSourceAndClose(
                  context,
                  VocabImportSource.camera,
                ),
              ),
              const SizedBox(height: 8),
              _ImportSourceChoice(
                key: const Key('vocab-import-gallery-choice'),
                icon: Icons.photo_library_rounded,
                label: '從相簿選取',
                detail: '選擇一張或多張相片',
                color: const Color(0xFFF0E9FF),
                onTap: () => _chooseImportSourceAndClose(
                  context,
                  VocabImportSource.gallery,
                ),
              ),
              const SizedBox(height: 8),
              _ImportSourceChoice(
                key: const Key('vocab-import-files-choice'),
                icon: Icons.folder_open_rounded,
                label: '瀏覽檔案',
                detail: 'PDF、JPEG、PNG、WebP 或 TIFF',
                color: const Color(0xFFFFF5D7),
                onTap: () => _chooseImportSourceAndClose(
                  context,
                  VocabImportSource.files,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _chooseImportSourceAndClose(
    BuildContext context,
    VocabImportSource source,
  ) {
    unawaited(_sfx.play(SfxCue.click));
    Navigator.of(context).pop(source);
  }

  Future<void> _speakWord(String word) async {
    unawaited(AppSfx.instance.play(SfxCue.click));
    _speakingWordTimer?.cancel();
    _speakingExampleTimer?.cancel();
    setState(() {
      _speakingWord = word;
      _speakingExample = null;
    });
    _speakingWordTimer = Timer(const Duration(milliseconds: 520), () {
      if (mounted && _speakingWord == word) {
        setState(() => _speakingWord = null);
      }
    });
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
    unawaited(AppSfx.instance.play(SfxCue.click));
    _speakingWordTimer?.cancel();
    _speakingExampleTimer?.cancel();
    setState(() {
      _speakingWord = null;
      _speakingExample = sentence;
    });
    _speakingExampleTimer = Timer(const Duration(milliseconds: 900), () {
      if (mounted && _speakingExample == sentence) {
        setState(() => _speakingExample = null);
      }
    });
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
  }

  Future<void> _openReview() async {
    unawaited(AppSfx.instance.play(
      _controller.items.isEmpty ? SfxCue.wrong : SfxCue.start,
    ));
    if (_controller.items.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('先加入生字，便可以開始溫習。')),
      );
      return;
    }
    final items = _controller.items;
    final exampleByItemId = <String, String>{};
    for (final item in items.where(
      (item) => item.listeningMastered && item.spellingMastered,
    )) {
      final sections = await _controller.loadExamplesForAudio(item);
      final example = sections
          .expand((section) => section.examples)
          .map((example) => example.english.trim())
          .firstWhere(
            (sentence) => RegExp(
              r'\b' + RegExp.escape(item.word) + r'\b',
              caseSensitive: false,
            ).hasMatch(sentence),
            orElse: () => '',
          );
      if (example.isNotEmpty) exampleByItemId[item.id] = example;
    }
    if (!mounted) return;
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => VocabularyReviewScreen(
          items: items,
          audioRepository: _audio,
          reviewController: VocabReviewController(
            items: items,
            exampleByItemId: exampleByItemId,
            repeatWrongAnswers: true,
          ),
          speakingRepository: FirebaseVocabSpeakingRepository(),
          onAnswered: _controller.recordReviewAnswer,
          onCompleted: widget.onReviewCompleted,
        ),
      ),
    );
  }

  void _setSortMode(_VocabSortMode mode) {
    if (mode == _sortMode && mode != _VocabSortMode.random) return;
    final ids =
        _controller.items.map((item) => item.id).toList(growable: false);
    setState(() {
      _sortMode = mode;
      _revealedItemIds = const {};
      if (mode == _VocabSortMode.random) {
        _shuffleOrder = _makeShuffleOrder(ids, _shuffleOrder);
        _shuffleRevision += 1;
      } else {
        _shuffleOrder = const [];
      }
    });
    _controller.collapseExamples();
    unawaited(AppSfx.instance.play(SfxCue.step));
  }

  void _setStudyMode(_VocabStudyMode mode) {
    setState(() {
      _studyMode = _studyMode == mode ? _VocabStudyMode.both : mode;
      _revealedItemIds = const {};
    });
    _controller.collapseExamples();
    unawaited(AppSfx.instance.play(SfxCue.step));
  }

  void _revealStudyItem(String itemId) {
    if (_studyMode == _VocabStudyMode.both ||
        _revealedItemIds.contains(itemId)) {
      return;
    }
    setState(() => _revealedItemIds = {..._revealedItemIds, itemId});
    // Use the page's injected mixer so crayon reveals are audible in the
    // same way as the other vocabulary controls and remain testable.
    unawaited(_sfx.play(SfxCue.step));
  }

  List<String> _makeShuffleOrder(
    List<String> ids,
    List<String> previous,
  ) {
    final shuffled = [...ids];
    final random = math.Random();
    for (var index = shuffled.length - 1; index > 0; index -= 1) {
      final swapIndex = random.nextInt(index + 1);
      final current = shuffled[index];
      shuffled[index] = shuffled[swapIndex];
      shuffled[swapIndex] = current;
    }
    if (shuffled.length > 1 &&
        previous.length == shuffled.length &&
        List.generate(
          shuffled.length,
          (index) => shuffled[index] == previous[index],
        ).every((same) => same)) {
      shuffled.add(shuffled.removeAt(0));
    }
    return shuffled;
  }

  List<VocabItem> get _orderedItems {
    final items = [..._controller.items];
    switch (_sortMode) {
      case _VocabSortMode.recent:
        items.sort(compareVocabItemsByRecentCreation);
        break;
      case _VocabSortMode.alpha:
        items.sort(
          (left, right) => left.normalizedWord.compareTo(right.normalizedWord),
        );
        break;
      case _VocabSortMode.random:
        final order = <String, int>{
          for (var index = 0; index < _shuffleOrder.length; index += 1)
            _shuffleOrder[index]: index,
        };
        items.sort((left, right) {
          final position =
              (order[left.id] ?? 1 << 30).compareTo(order[right.id] ?? 1 << 30);
          return position != 0
              ? position
              : left.normalizedWord.compareTo(right.normalizedWord);
        });
        break;
    }
    return items;
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: !_keyboardOpen,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop && _keyboardOpen) _closeVocabKeyboard();
      },
      child: Listener(
        onPointerDown: _dismissKeyboardIfOutside,
        child: Stack(
          fit: StackFit.expand,
          children: [
            OriginalSectionFrame(
              sectionKey: const Key('original-section-frame-vocabulary'),
              eyebrow: 'Vocabulary',
              title: '詞彙本',
              onSettings: widget.onSettings,
              settingsActive: widget.settingsActive,
              settingsKey: const Key('vocab-settings-button'),
              trailing: _VocabTrainingButton(
                reviewCount: _controller.dueCount,
                shouldPulse: _controller.dueCount > 0,
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
                    const SizedBox(height: 8),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(2, 0, 2, 5),
                      child: _VocabEntryPanel(
                        controller: _controller,
                        textController: _textController,
                        focusNode: _focusNode,
                        onChanged: _controller.updateQuery,
                        onType: () => unawaited(_sfx.play(SfxCue.type)),
                        onTapInput: _openVocabKeyboard,
                        keyboardOpen: _keyboardOpen,
                        onAdd: _addWord,
                        onImport: _openImport,
                      ),
                    ),
                    _VocabLearningToolbar(
                      sortMode: _sortMode,
                      studyMode: _studyMode,
                      shuffleRevision: _shuffleRevision,
                      onSortMode: _setSortMode,
                      onStudyMode: _setStudyMode,
                    ),
                    const SizedBox(height: 4),
                    Expanded(
                      child: _VocabList(
                        controller: _controller,
                        scrollController: _vocabListScrollController,
                        rowKeys: _vocabRowKeys,
                        focusedItemId: _focusedSearchItemId,
                        items: _orderedItems,
                        sortMode: _sortMode,
                        studyMode: _studyMode,
                        revealedItemIds: _revealedItemIds,
                        shuffleRevision: _shuffleRevision,
                        speakingWord: _speakingWord,
                        speakingExample: _speakingExample,
                        onSpeakWord: _speakWord,
                        onSpeakExample: _speakExample,
                        onDelete: _deleteWord,
                        onReveal: _revealStudyItem,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            if (_focusedSearchItemId.isNotEmpty)
              Positioned.fill(
                child: IgnorePointer(
                  child: _VocabSearchFocusOverlay(
                    key: const Key('vocab-search-focus-overlay'),
                    word: _controller.items
                            .cast<VocabItem?>()
                            .firstWhere(
                              (item) =>
                                  item?.normalizedWord ==
                                  _lastFocusedSearchWord,
                              orElse: () => null,
                            )
                            ?.word ??
                        _lastFocusedSearchWord,
                  ),
                ),
              ),
            // Keep the keyboard outside the stationery frame. This is the same
            // full-width bottom dock used by the original English Grammar Game;
            // placing it here also lets it cover the app tabs cleanly.
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
                      key: _keyboardKey,
                      keyboardKey: const Key('vocab-custom-keyboard'),
                      keyPrefix: 'vocab-keyboard-key-',
                      onKey: _handleVocabKeyboardKey,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _VocabTrainingButton extends StatelessWidget {
  const _VocabTrainingButton({
    required this.reviewCount,
    required this.shouldPulse,
    required this.onReview,
  });

  final int reviewCount;
  final bool shouldPulse;
  final VoidCallback onReview;

  @override
  Widget build(BuildContext context) {
    final compact = MediaQuery.sizeOf(context).width <= 720;
    final size = compact ? 46.0 : 52.0;
    return _VocabTrainingButtonAnimation(
      size: size,
      shouldPulse: shouldPulse,
      reviewCount: reviewCount,
      onReview: onReview,
    );
  }
}

class _VocabTrainingButtonAnimation extends StatefulWidget {
  const _VocabTrainingButtonAnimation({
    required this.size,
    required this.shouldPulse,
    required this.reviewCount,
    required this.onReview,
  });

  final double size;
  final bool shouldPulse;
  final int reviewCount;
  final VoidCallback onReview;

  @override
  State<_VocabTrainingButtonAnimation> createState() =>
      _VocabTrainingButtonAnimationState();
}

class _VocabTrainingButtonAnimationState
    extends State<_VocabTrainingButtonAnimation> {
  Timer? _pulseTimer;
  Timer? _pulseStartTimer;
  bool _expanded = false;

  @override
  void initState() {
    super.initState();
    _syncTimer();
  }

  @override
  void didUpdateWidget(covariant _VocabTrainingButtonAnimation oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.shouldPulse != widget.shouldPulse) _syncTimer();
  }

  void _syncTimer() {
    _pulseTimer?.cancel();
    _pulseStartTimer?.cancel();
    _pulseTimer = null;
    _pulseStartTimer = null;
    if (!widget.shouldPulse) {
      _expanded = false;
      return;
    }
    _expanded = false;
    _pulseStartTimer = Timer(const Duration(milliseconds: 80), () {
      if (mounted) setState(() => _expanded = true);
    });
    _pulseTimer = Timer.periodic(const Duration(milliseconds: 900), (_) {
      if (mounted) setState(() => _expanded = !_expanded);
    });
  }

  @override
  void dispose() {
    _pulseTimer?.cancel();
    _pulseStartTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedScale(
      key: const Key('vocab-review-button-pulse'),
      scale: widget.shouldPulse && _expanded ? 1.16 : 1.0,
      duration: const Duration(milliseconds: 700),
      curve: Curves.easeInOut,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          _OriginalRaisedButton(
            key: const Key('vocab-review-button'),
            width: widget.size,
            height: widget.size,
            radius: widget.size <= 46 ? 14 : 16,
            onTap: widget.onReview,
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
          if (widget.reviewCount > 0)
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
                  '${widget.reviewCount}',
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
    required this.onType,
    required this.onTapInput,
    required this.keyboardOpen,
    required this.onAdd,
    required this.onImport,
  });

  final VocabController controller;
  final TextEditingController textController;
  final FocusNode focusNode;
  final ValueChanged<String> onChanged;
  final VoidCallback onType;
  final VoidCallback onTapInput;
  final bool keyboardOpen;
  final VoidCallback onAdd;
  final VoidCallback onImport;

  @override
  Widget build(BuildContext context) {
    final compact = MediaQuery.sizeOf(context).width <= 720;
    return OriginalDashedSurface(
      key: const Key('vocab-entry-panel'),
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
            onImport: onImport,
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
                    readOnly: true,
                    showCursor: keyboardOpen,
                    enableInteractiveSelection: false,
                    autocorrect: false,
                    enableSuggestions: false,
                    spellCheckConfiguration:
                        const SpellCheckConfiguration.disabled(),
                    textCapitalization: TextCapitalization.none,
                    textInputAction: TextInputAction.done,
                    onChanged: (value) {
                      onChanged(value);
                      onType();
                    },
                    onTap: onTapInput,
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
          _VocabLookupIndicator(
            visible: controller.isLookingUp && controller.query.isNotEmpty,
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
              _SuggestedWordsPanel(
                suggestions: controller.suggestions,
                onChoose: (suggestion) {
                  unawaited(controller.chooseSuggestion(suggestion));
                  unawaited(AppSfx.instance.play(SfxCue.click));
                },
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

class _VocabLookupIndicator extends StatefulWidget {
  const _VocabLookupIndicator({required this.visible});

  final bool visible;

  @override
  State<_VocabLookupIndicator> createState() => _VocabLookupIndicatorState();
}

class _VocabLookupIndicatorState extends State<_VocabLookupIndicator>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 900),
  );

  @override
  void initState() {
    super.initState();
    if (widget.visible) _controller.repeat();
  }

  @override
  void didUpdateWidget(covariant _VocabLookupIndicator oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.visible && !oldWidget.visible) {
      _controller.repeat();
    } else if (!widget.visible && oldWidget.visible) {
      _controller.stop();
      _controller.value = 0;
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedSize(
      duration: const Duration(milliseconds: 180),
      curve: Curves.easeOutCubic,
      alignment: Alignment.topCenter,
      child: widget.visible
          ? SizedBox(
              key: const Key('vocab-lookup-loading'),
              height: 34,
              child: Center(
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.76),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.search_rounded,
                        size: 17,
                        color: AppPalette.primaryDark,
                      ),
                      const SizedBox(width: 5),
                      const Text(
                        '激情搜尋中',
                        style: TextStyle(
                          color: AppPalette.primaryDark,
                          fontSize: 13,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(width: 3),
                      AnimatedBuilder(
                        animation: _controller,
                        builder: (context, _) {
                          final active = (_controller.value * 3).floor() % 3;
                          return Row(
                            children: List.generate(3, (index) {
                              final distance = (index - active).abs();
                              return Padding(
                                padding:
                                    const EdgeInsets.symmetric(horizontal: 1),
                                child: AnimatedOpacity(
                                  opacity: distance == 0 ? 1 : 0.3,
                                  duration: const Duration(milliseconds: 120),
                                  child: const Text(
                                    '.',
                                    style: TextStyle(
                                      color: AppPalette.primaryDark,
                                      fontSize: 15,
                                      height: 1,
                                      fontWeight: FontWeight.w900,
                                    ),
                                  ),
                                ),
                              );
                            }),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ),
            )
          : const SizedBox.shrink(),
    );
  }
}

class _SuggestedWordsPanel extends StatelessWidget {
  const _SuggestedWordsPanel(
      {required this.suggestions, required this.onChoose});

  final List<VocabWordSuggestion> suggestions;
  final ValueChanged<VocabWordSuggestion> onChoose;

  @override
  Widget build(BuildContext context) {
    return OriginalDashedSurface(
      key: const Key('vocab-suggested-words-panel'),
      backgroundColor: const Color(0xFFFFFBF0),
      borderColor: const Color(0xFFF4C95D),
      shadowColor: const Color(0xFFFFE9A8),
      shadowDepth: 4,
      radius: 17,
      strokeWidth: 2,
      padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                decoration: BoxDecoration(
                  color: AppPalette.secondary,
                  borderRadius: BorderRadius.circular(999),
                  boxShadow: const [
                    BoxShadow(
                        color: AppPalette.secondaryDark, offset: Offset(0, 3)),
                  ],
                ),
                child: const Text(
                  'Suggested Words',
                  style: TextStyle(
                    color: Color(0xFF5D4037),
                    fontSize: 12,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              const Expanded(
                child: Text(
                  '你是否想輸入：',
                  style: TextStyle(
                    color: AppPalette.muted,
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 7,
            runSpacing: 8,
            children: [
              for (var index = 0; index < suggestions.length; index += 1)
                _SuggestedWordSticker(
                  suggestion: suggestions[index],
                  colorIndex: index,
                  onTap: () => onChoose(suggestions[index]),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SuggestedWordSticker extends StatefulWidget {
  const _SuggestedWordSticker({
    required this.suggestion,
    required this.colorIndex,
    required this.onTap,
  });

  final VocabWordSuggestion suggestion;
  final int colorIndex;
  final VoidCallback onTap;

  @override
  State<_SuggestedWordSticker> createState() => _SuggestedWordStickerState();
}

class _SuggestedWordStickerState extends State<_SuggestedWordSticker> {
  bool _pressed = false;

  static const fills = [
    Color(0xFFFFF1F6),
    Color(0xFFEFFFFB),
    Color(0xFFFFF8DC),
    Color(0xFFF0F4FF),
    Color(0xFFF7EEFF),
  ];
  static const edges = [
    Color(0xFFF2A8C7),
    Color(0xFF8DDED0),
    Color(0xFFF0C44F),
    Color(0xFFAAC6EC),
    Color(0xFFC9A9EE),
  ];

  @override
  Widget build(BuildContext context) {
    final index = widget.colorIndex % fills.length;
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) => setState(() => _pressed = false),
      onTapCancel: () => setState(() => _pressed = false),
      onTap: widget.onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 100),
        transform: Matrix4.translationValues(0, _pressed ? 2 : 0, 0)
          ..scaleByDouble(_pressed ? .97 : 1.0, _pressed ? .97 : 1.0, 1.0, 1.0),
        padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 8),
        decoration: BoxDecoration(
          color: fills[index],
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: edges[index], width: 2),
          boxShadow: [
            BoxShadow(
              color: edges[index],
              offset: Offset(0, _pressed ? 1 : 4),
            ),
          ],
        ),
        child: Text(
          widget.suggestion.display,
          style: const TextStyle(
            color: Color(0xFF5D4037),
            fontSize: 15,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
    );
  }
}

class _VocabStatsRow extends StatelessWidget {
  const _VocabStatsRow({
    required this.wordCount,
    required this.reviewCount,
    required this.onImport,
  });

  final int wordCount;
  final int reviewCount;
  final VoidCallback onImport;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: _VocabStat(label: '已加入', value: wordCount)),
        const SizedBox(width: 6),
        Expanded(child: _VocabStat(label: '待溫習', value: reviewCount)),
        const SizedBox(width: 6),
        Expanded(child: _VocabImportButton(onTap: onImport)),
      ],
    );
  }
}

class _VocabImportButton extends StatelessWidget {
  const _VocabImportButton({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: '上傳筆記',
      child: GestureDetector(
        key: const Key('vocab-import-note-button'),
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: const OriginalDashedSurface(
          backgroundColor: AppPalette.softSecondary,
          borderColor: AppPalette.secondaryDark,
          shadowColor: Color(0xFFE0B84F),
          strokeWidth: 2,
          shadowDepth: 4,
          radius: 18,
          child: SizedBox(
            height: 70,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text(
                    '上傳筆記',
                    maxLines: 1,
                    style: TextStyle(
                      color: Color(0xFF5D4037),
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
                SizedBox(height: 2),
                Icon(
                  Icons.upload_file_rounded,
                  size: 26,
                  color: Color(0xFF5D4037),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ImportSourceChoice extends StatelessWidget {
  const _ImportSourceChoice({
    required this.icon,
    required this.label,
    required this.detail,
    required this.color,
    required this.onTap,
    super.key,
  });

  final IconData icon;
  final String label;
  final String detail;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: label,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: OriginalDashedSurface(
          backgroundColor: color,
          borderColor: AppPalette.primary.withValues(alpha: 0.72),
          shadowColor: const Color(0xFFD9E8E8),
          shadowDepth: 3,
          strokeWidth: 2,
          radius: 14,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
          child: Row(
            children: [
              Icon(icon, color: AppPalette.primaryDark, size: 27),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label,
                      style: const TextStyle(
                        color: Color(0xFF5D4037),
                        fontSize: 15,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 1),
                    Text(
                      detail,
                      style: const TextStyle(
                        color: AppPalette.muted,
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.chevron_right_rounded,
                color: AppPalette.primaryDark,
                size: 24,
              ),
            ],
          ),
        ),
      ),
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

class _VocabLearningToolbar extends StatelessWidget {
  const _VocabLearningToolbar({
    required this.sortMode,
    required this.studyMode,
    required this.shuffleRevision,
    required this.onSortMode,
    required this.onStudyMode,
  });

  final _VocabSortMode sortMode;
  final _VocabStudyMode studyMode;
  final int shuffleRevision;
  final ValueChanged<_VocabSortMode> onSortMode;
  final ValueChanged<_VocabStudyMode> onStudyMode;

  @override
  Widget build(BuildContext context) {
    final compact = MediaQuery.sizeOf(context).width <= 720;
    final size = compact ? 36.0 : 40.0;
    return SizedBox(
      key: const Key('vocab-learning-toolbar'),
      height: size + 4,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _VocabToolButton(
            key: const Key('vocab-sort-recent-button'),
            tooltip: '按時序排列',
            semanticLabel: '按時序排列詞彙',
            size: size,
            active: sortMode == _VocabSortMode.recent,
            groupColor: AppPalette.softPrimary,
            onTap: () => onSortMode(_VocabSortMode.recent),
            child: const Icon(
              Icons.history_rounded,
              size: 25,
              color: AppPalette.primaryDark,
            ),
          ),
          const SizedBox(width: 6),
          _VocabToolButton(
            key: const Key('vocab-sort-alpha-button'),
            tooltip: '按字母排列',
            semanticLabel: '按英文字母排列詞彙',
            size: size,
            active: sortMode == _VocabSortMode.alpha,
            groupColor: AppPalette.softPrimary,
            onTap: () => onSortMode(_VocabSortMode.alpha),
            child: const Icon(
              Icons.sort_by_alpha_rounded,
              size: 24,
              color: AppPalette.primaryDark,
            ),
          ),
          const SizedBox(width: 6),
          _VocabToolButton(
            key: const Key('vocab-sort-shuffle-button'),
            tooltip: '隨機排列',
            semanticLabel: '隨機排列詞彙',
            size: size,
            active: sortMode == _VocabSortMode.random,
            groupColor: AppPalette.softPrimary,
            onTap: () => onSortMode(_VocabSortMode.random),
            child: TweenAnimationBuilder<double>(
              key: ValueKey('vocab-shuffle-icon-$shuffleRevision'),
              tween: Tween(begin: 0, end: 1),
              duration: const Duration(milliseconds: 580),
              curve: Curves.easeOutCubic,
              builder: (context, value, child) => Transform.rotate(
                angle: value * math.pi * 2,
                child: Transform.scale(
                  scale: 0.86 + (math.sin(value * math.pi) * 0.18),
                  child: child,
                ),
              ),
              child: const Icon(
                Icons.shuffle_rounded,
                size: 23,
                color: AppPalette.primaryDark,
              ),
            ),
          ),
          Container(
            width: 2,
            height: 26,
            margin: const EdgeInsets.symmetric(horizontal: 9),
            decoration: BoxDecoration(
              color: AppPalette.purple.withValues(alpha: 0.45),
              borderRadius: BorderRadius.circular(1),
            ),
          ),
          _VocabToolButton(
            key: const Key('vocab-study-english-button'),
            tooltip: '只顯示英文',
            semanticLabel: '只顯示英文，點字卡顯示中文',
            size: size,
            active: studyMode == _VocabStudyMode.english,
            groupColor: const Color(0xFFF0E9FF),
            onTap: () => onStudyMode(_VocabStudyMode.english),
            child: const Text(
              'En',
              style: TextStyle(
                color: Color(0xFF66508F),
                fontSize: 12,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
          const SizedBox(width: 6),
          _VocabToolButton(
            key: const Key('vocab-study-chinese-button'),
            tooltip: '只顯示中文',
            semanticLabel: '只顯示中文，點字卡顯示英文',
            size: size,
            active: studyMode == _VocabStudyMode.chinese,
            groupColor: const Color(0xFFF0E9FF),
            onTap: () => onStudyMode(_VocabStudyMode.chinese),
            child: const Text(
              'Chi',
              style: TextStyle(
                color: Color(0xFF66508F),
                fontSize: 11,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _VocabToolButton extends StatelessWidget {
  const _VocabToolButton({
    required this.tooltip,
    required this.semanticLabel,
    required this.size,
    required this.active,
    required this.groupColor,
    required this.onTap,
    required this.child,
    super.key,
  });

  final String tooltip;
  final String semanticLabel;
  final double size;
  final bool active;
  final Color groupColor;
  final VoidCallback onTap;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: Semantics(
        button: true,
        selected: active,
        label: semanticLabel,
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: onTap,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            width: size,
            height: size,
            transform: Matrix4.translationValues(0, active ? -2 : 0, 0),
            child: OriginalDashedSurface(
              backgroundColor: active ? AppPalette.secondary : groupColor,
              borderColor: active
                  ? AppPalette.secondaryDark
                  : AppPalette.primary.withValues(alpha: 0.72),
              shadowColor:
                  active ? const Color(0xFFE0B84F) : const Color(0xFFD9E8E8),
              shadowDepth: active ? 4 : 2,
              strokeWidth: 2,
              radius: 7,
              child: Center(child: child),
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
    required this.scrollController,
    required this.rowKeys,
    required this.focusedItemId,
    required this.items,
    required this.sortMode,
    required this.studyMode,
    required this.revealedItemIds,
    required this.shuffleRevision,
    required this.speakingWord,
    required this.speakingExample,
    required this.onSpeakWord,
    required this.onSpeakExample,
    required this.onDelete,
    required this.onReveal,
  });

  final VocabController controller;
  final ScrollController scrollController;
  final Map<String, GlobalKey> rowKeys;
  final String focusedItemId;
  final List<VocabItem> items;
  final _VocabSortMode sortMode;
  final _VocabStudyMode studyMode;
  final Set<String> revealedItemIds;
  final int shuffleRevision;
  final String? speakingWord;
  final String? speakingExample;
  final ValueChanged<String> onSpeakWord;
  final ValueChanged<String> onSpeakExample;
  final ValueChanged<VocabItem> onDelete;
  final ValueChanged<String> onReveal;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
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
    var rowIndex = 0;
    Widget buildRow(VocabItem item) {
      final index = rowIndex++;
      return Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: _ShuffleListEntry(
          key: ValueKey('vocab-list-entry-${item.id}-$shuffleRevision'),
          animate: sortMode == _VocabSortMode.random && index < 12,
          index: index,
          child: _VocabRow(
            key: rowKeys.putIfAbsent(item.id, () => GlobalKey()),
            item: item,
            searchFocused: focusedItemId == item.id,
            studyMode: studyMode,
            answerRevealed: revealedItemIds.contains(item.id),
            speakingWord: speakingWord,
            expanded: controller.expandedItemId == item.id,
            examplesLoading: controller.examplesAreLoading(item.id),
            exampleSections: controller.examplesFor(item.id),
            speakingExample: speakingExample,
            onSpeakWord: () => onSpeakWord(item.word),
            onSpeakExample: onSpeakExample,
            onReveal: () => onReveal(item.id),
            onToggleExamples: () {
              unawaited(controller.toggleExamples(item));
              unawaited(AppSfx.instance.play(SfxCue.click));
            },
            onDelete: () => onDelete(item),
          ),
        ),
      );
    }

    if (sortMode == _VocabSortMode.recent) {
      final groups = <DateTime, List<VocabItem>>{};
      for (final item in items) {
        final date = DateTime(
          item.createdAt.year,
          item.createdAt.month,
          item.createdAt.day,
        );
        groups.putIfAbsent(date, () => []).add(item);
      }
      groups.forEach((date, dateItems) {
        children.add(_DateDivider(date: date));
        children.addAll(dateItems.map(buildRow));
      });
    } else {
      children.addAll(items.map(buildRow));
    }
    return ListView(
      key: const Key('vocab-list'),
      controller: scrollController,
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(5, 2, 5, 10),
      children: children,
    );
  }
}

class _VocabSearchFocusOverlay extends StatelessWidget {
  const _VocabSearchFocusOverlay({required this.word, super.key});

  final String word;

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween<double>(begin: 0, end: 1),
      duration: const Duration(milliseconds: 820),
      curve: Curves.easeOutBack,
      builder: (context, value, child) {
        final fade = Curves.easeOut.transform(value.clamp(0, 1));
        final tilt = (1 - fade) * -0.045;
        return Stack(
          fit: StackFit.expand,
          children: [
            Opacity(
              opacity: 0.10 * (1 - fade),
              child: const DecoratedBox(
                decoration: BoxDecoration(
                  gradient: RadialGradient(
                    colors: [Color(0xFFFFD9E3), Colors.transparent],
                    stops: [0, 0.78],
                  ),
                ),
              ),
            ),
            Center(
              child: Opacity(
                opacity: fade,
                child: Transform.rotate(
                  angle: tilt,
                  child: Transform.scale(
                    scale: 0.82 + (fade * 0.18),
                    child: Stack(
                      clipBehavior: Clip.none,
                      alignment: Alignment.center,
                      children: [
                        _SearchStickerSpark(
                          icon: Icons.auto_awesome_rounded,
                          color: AppPalette.secondaryDark,
                          offset: Offset(-116 * fade, -48 * fade),
                          scale: 0.75 + (0.25 * fade),
                        ),
                        _SearchStickerSpark(
                          icon: Icons.favorite_rounded,
                          color: AppPalette.pink,
                          offset: Offset(116 * fade, -28 * fade),
                          scale: 0.7 + (0.3 * fade),
                        ),
                        _SearchStickerSpark(
                          icon: Icons.star_rounded,
                          color: AppPalette.primary,
                          offset: Offset(106 * fade, 50 * fade),
                          scale: 0.65 + (0.35 * fade),
                        ),
                        Container(
                          constraints: const BoxConstraints(minWidth: 214),
                          padding: const EdgeInsets.fromLTRB(23, 17, 23, 16),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFFDF7),
                            borderRadius: BorderRadius.circular(23),
                            border: Border.all(
                              color: AppPalette.pink.withValues(alpha: 0.74),
                              width: 3,
                            ),
                            boxShadow: const [
                              BoxShadow(
                                color: Color(0xFFF3C7D4),
                                offset: Offset(0, 7),
                              ),
                              BoxShadow(
                                color: Color(0x33E99AB2),
                                blurRadius: 16,
                                spreadRadius: 2,
                              ),
                            ],
                          ),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    Icons.search_rounded,
                                    color: AppPalette.primaryDark,
                                    size: 18,
                                  ),
                                  SizedBox(width: 6),
                                  Text(
                                    '搵到喇！',
                                    style: TextStyle(
                                      color: AppPalette.primaryDark,
                                      fontSize: 14,
                                      fontWeight: FontWeight.w900,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 7),
                              Text(
                                displayVocabWord(word),
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                  color: Color(0xFF5D4037),
                                  fontSize: 24,
                                  letterSpacing: 0.7,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                              const SizedBox(height: 5),
                              Container(
                                width: 70,
                                height: 4,
                                decoration: BoxDecoration(
                                  color: AppPalette.secondary,
                                  borderRadius: BorderRadius.circular(99),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}

class _SearchStickerSpark extends StatelessWidget {
  const _SearchStickerSpark({
    required this.icon,
    required this.color,
    required this.offset,
    required this.scale,
  });

  final IconData icon;
  final Color color;
  final Offset offset;
  final double scale;

  @override
  Widget build(BuildContext context) {
    return Transform.translate(
      offset: offset,
      child: Transform.scale(
        scale: scale,
        child: Icon(icon, color: color, size: 27),
      ),
    );
  }
}

class _ShuffleListEntry extends StatelessWidget {
  const _ShuffleListEntry({
    required this.animate,
    required this.index,
    required this.child,
    super.key,
  });

  final bool animate;
  final int index;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    if (!animate) return child;
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: 360 + index * 22),
      curve: Curves.easeOutCubic,
      builder: (context, value, child) => Opacity(
        opacity: 0.42 + value * 0.58,
        child: Transform.translate(
          offset: Offset((index.isEven ? -10 : 10) * (1 - value), 0),
          child: child,
        ),
      ),
      child: child,
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
    required this.searchFocused,
    required this.studyMode,
    required this.answerRevealed,
    required this.speakingWord,
    required this.expanded,
    required this.examplesLoading,
    required this.exampleSections,
    required this.speakingExample,
    required this.onSpeakWord,
    required this.onSpeakExample,
    required this.onReveal,
    required this.onToggleExamples,
    required this.onDelete,
    super.key,
  });

  final VocabItem item;
  final bool searchFocused;
  final _VocabStudyMode studyMode;
  final bool answerRevealed;
  final String? speakingWord;
  final bool expanded;
  final bool examplesLoading;
  final List<VocabExampleSection>? exampleSections;
  final String? speakingExample;
  final VoidCallback onSpeakWord;
  final ValueChanged<String> onSpeakExample;
  final VoidCallback onReveal;
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
    final speaking = widget.speakingWord == widget.item.word;
    final highlighted =
        _hovered || _pressed || speaking || widget.searchFocused;
    final backgroundColor = highlighted ? AppPalette.softPrimary : Colors.white;
    final hideEnglish =
        widget.studyMode == _VocabStudyMode.chinese && !widget.answerRevealed;
    final hideChinese =
        widget.studyMode == _VocabStudyMode.english && !widget.answerRevealed;
    final crayonColor = vocabCrayonColorForPos(
      widget.item.senses.isEmpty ? '' : widget.item.senses.first.pos,
    );
    final mainRow = GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) => setState(() => _pressed = false),
      onTapCancel: () => setState(() => _pressed = false),
      onTap: widget.onSpeakWord,
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 300),
                  switchInCurve: Curves.easeOutBack,
                  layoutBuilder: _leftAlignedSwitcherLayout,
                  transitionBuilder: _studyRevealTransition,
                  child: hideEnglish
                      ? _CrayonRevealMask(
                          key: ValueKey(
                            'vocab-english-mask-${widget.item.id}',
                          ),
                          semanticLabel: '顯示 ${widget.item.word} 英文',
                          color: crayonColor,
                          seed: _stableCrayonSeed(widget.item.id),
                          onReveal: widget.onReveal,
                          visiblePrefix: widget.item.word.isEmpty
                              ? null
                              : widget.item.word.substring(0, 1),
                          child: Text(
                            widget.item.word,
                            style: _wordStyle,
                          ),
                        )
                      : Text(
                          widget.item.word,
                          key: ValueKey(
                            'vocab-english-visible-${widget.item.id}',
                          ),
                          style: _wordStyle,
                        ),
                ),
                const SizedBox(height: 3),
                ...widget.item.senses.asMap().entries.map((entry) {
                  final sense = entry.value;
                  return AnimatedSwitcher(
                    duration: const Duration(milliseconds: 300),
                    switchInCurve: Curves.easeOutBack,
                    layoutBuilder: _leftAlignedSwitcherLayout,
                    transitionBuilder: _studyRevealTransition,
                    child: hideChinese
                        ? Row(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (sense.metaLabel.isNotEmpty)
                                Text('${sense.metaLabel} ',
                                    style: _meaningStyle),
                              Flexible(
                                child: _CrayonRevealMask(
                                  key: ValueKey(
                                    'vocab-chinese-mask-${widget.item.id}-${entry.key}',
                                  ),
                                  semanticLabel: '顯示 ${widget.item.word} 中文意思',
                                  color: vocabCrayonColorForPos(sense.pos),
                                  seed: _stableCrayonSeed(widget.item.id) +
                                      entry.key * 17,
                                  onReveal: widget.onReveal,
                                  child: Text(
                                    sense.meaning,
                                    style: _meaningStyle,
                                  ),
                                ),
                              ),
                            ],
                          )
                        : Text(
                            sense.label,
                            key: ValueKey(
                              'vocab-chinese-visible-${widget.item.id}-${entry.key}',
                            ),
                            style: _meaningStyle,
                          ),
                  );
                }),
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
    );
    return MouseRegion(
      onEnter: (_) => setState(() => _hovered = true),
      onExit: (_) => setState(() {
        _hovered = false;
        _pressed = false;
      }),
      child: AnimatedContainer(
        key: ValueKey('vocab-row-${widget.item.id}'),
        duration: const Duration(milliseconds: 320),
        curve: Curves.easeOutCubic,
        transform: Matrix4.translationValues(0, highlighted ? -2 : 0, 0),
        child: OriginalDashedSurface(
          backgroundColor: backgroundColor,
          borderColor: highlighted ? AppPalette.primary : AppPalette.border,
          shadowColor: highlighted
              ? (widget.searchFocused
                  ? AppPalette.primary.withValues(alpha: 0.42)
                  : const Color(0xFFBDE0E1))
              : const Color(0xFFE9ECEF),
          shadowDepth: widget.searchFocused ? 8 : (highlighted ? 6 : 4),
          blurRadius: widget.searchFocused ? 12 : (highlighted ? 2 : 0),
          radius: compact ? 16 : 20,
          strokeWidth: 3,
          padding: EdgeInsets.all(compact ? 8 : 12),
          child: Column(
            children: [
              mainRow,
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
    );
  }
}

const _wordStyle = TextStyle(
  color: Color(0xFF5D4037),
  fontSize: 20,
  height: 1.1,
  fontWeight: FontWeight.w900,
);

const _meaningStyle = TextStyle(
  color: AppPalette.muted,
  fontSize: 13,
  height: 1.2,
  fontWeight: FontWeight.w900,
);

Widget _leftAlignedSwitcherLayout(
  Widget? currentChild,
  List<Widget> previousChildren,
) {
  return Stack(
    alignment: Alignment.centerLeft,
    children: [...previousChildren, if (currentChild != null) currentChild],
  );
}

Widget _studyRevealTransition(Widget child, Animation<double> animation) {
  return FadeTransition(
    opacity: animation,
    child: SlideTransition(
      position: Tween<Offset>(
        begin: const Offset(0, 0.18),
        end: Offset.zero,
      ).animate(animation),
      child: child,
    ),
  );
}

const _crayonColorsByPos = <String, Color>{
  'noun': Color(0xFFF2C94C),
  'verb': Color(0xFF6FCF78),
  'adjective': Color(0xFFA88AE3),
  'adverb': Color(0xFF63A9E8),
  'other': Color(0xFFEB86AA),
};

int _stableCrayonSeed(String value) {
  var seed = 7;
  for (final codeUnit in value.codeUnits) {
    seed = (seed * 31 + codeUnit) & 0x7fffffff;
  }
  return seed;
}

@visibleForTesting
Color vocabCrayonColorForPos(String pos) {
  final normalized = pos.trim().toLowerCase();
  final key = switch (normalized) {
    'n' || 'noun' => 'noun',
    'v' || 'verb' => 'verb',
    'adj' || 'adjective' => 'adjective',
    'adv' || 'adverb' => 'adverb',
    _ => 'other',
  };
  return _crayonColorsByPos[key]!;
}

class _CrayonRevealMask extends StatelessWidget {
  const _CrayonRevealMask({
    required this.semanticLabel,
    required this.color,
    required this.seed,
    required this.onReveal,
    this.visiblePrefix,
    required this.child,
    super.key,
  });

  final String semanticLabel;
  final Color color;
  final int seed;
  final VoidCallback onReveal;
  final String? visiblePrefix;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: semanticLabel,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onReveal,
        child: visiblePrefix == null || visiblePrefix!.isEmpty
            ? _maskedChild()
            : Row(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(
                    visiblePrefix!,
                    key: ValueKey('crayon-visible-prefix-$seed'),
                    style: _wordStyle,
                  ),
                  _maskedChild(
                    child: Text(
                      _remainingWord(child, visiblePrefix!),
                      style: _wordStyle,
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _maskedChild({Widget? child}) {
    return CustomPaint(
      key: ValueKey('crayon-mask-$seed'),
      foregroundPainter: _CrayonMaskPainter(color: color, seed: seed),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 1),
        child: ExcludeSemantics(
          child: Opacity(opacity: 0, child: child ?? this.child),
        ),
      ),
    );
  }

  String _remainingWord(Widget child, String visiblePrefix) {
    if (child is Text) {
      final text = child.data ?? '';
      if (text.startsWith(visiblePrefix)) {
        return text.substring(visiblePrefix.length);
      }
    }
    return '';
  }
}

class _CrayonMaskPainter extends CustomPainter {
  const _CrayonMaskPainter({required this.color, required this.seed});

  final Color color;
  final int seed;

  @override
  void paint(Canvas canvas, Size size) {
    if (size.isEmpty) return;
    final centerY = size.height / 2;
    final strokeWidth = (size.height * 0.78).clamp(11.0, 22.0);
    for (var layer = 0; layer < 4; layer += 1) {
      final wobble = ((seed + layer * 7) % 5 - 2) * 0.32;
      final path = Path()
        ..moveTo(-2, centerY + wobble)
        ..quadraticBezierTo(
          size.width * 0.34,
          centerY - wobble * 0.65,
          size.width * 0.68,
          centerY + wobble * 0.38,
        )
        ..lineTo(size.width + 2, centerY - wobble * 0.28);
      canvas.drawPath(
        path,
        Paint()
          ..color = color.withValues(alpha: layer == 1 ? 0.48 : 0.3)
          ..style = PaintingStyle.stroke
          ..strokeWidth = strokeWidth - layer * 0.9
          ..strokeCap = StrokeCap.round
          ..strokeJoin = StrokeJoin.round,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _CrayonMaskPainter oldDelegate) {
    return oldDelegate.color != color || oldDelegate.seed != seed;
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

class _ExampleCard extends StatefulWidget {
  const _ExampleCard({
    required this.example,
    required this.speaking,
    required this.onSpeak,
  });

  final VocabExample example;
  final bool speaking;
  final ValueChanged<String> onSpeak;

  @override
  State<_ExampleCard> createState() => _ExampleCardState();
}

class _ExampleCardState extends State<_ExampleCard> {
  bool _hovered = false;
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final highlighted = _hovered || _pressed || widget.speaking;
    return Semantics(
      button: true,
      label: '讀出例句：${widget.example.english}',
      child: MouseRegion(
        cursor: SystemMouseCursors.click,
        onEnter: (_) => setState(() => _hovered = true),
        onExit: (_) => setState(() {
          _hovered = false;
          _pressed = false;
        }),
        child: GestureDetector(
          key: ValueKey('vocab-example-card-${widget.example.english}'),
          behavior: HitTestBehavior.opaque,
          onTapDown: (_) => setState(() => _pressed = true),
          onTapUp: (_) => setState(() => _pressed = false),
          onTapCancel: () => setState(() => _pressed = false),
          onTap: () => widget.onSpeak(widget.example.english),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 120),
            curve: Curves.easeOut,
            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 8),
            decoration: BoxDecoration(
              color: highlighted ? AppPalette.softPrimary : Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: highlighted
                    ? AppPalette.primary
                    : const Color(0xFFF2C879).withValues(alpha: 0.28),
                width: 2,
              ),
              boxShadow: [
                BoxShadow(
                  color: highlighted
                      ? const Color(0xFFBDE0E1)
                      : const Color(0xFFF3E3C5),
                  offset: Offset(0, highlighted ? 5 : 3),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.example.english,
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
                const SizedBox(height: 3),
                Text(
                  widget.example.chinese,
                  style: const TextStyle(
                    color: AppPalette.muted,
                    fontSize: 12,
                    height: 1.35,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
          ),
        ),
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
    this.reviewController,
    this.speakingRepository,
    this.onAnswered,
    this.onCompleted,
    this.sfx,
    super.key,
  });

  final List<VocabItem> items;
  final VocabAudioRepository audioRepository;
  final VocabReviewController? reviewController;
  final VocabSpeakingRepository? speakingRepository;
  final Future<void> Function(
    VocabItem item,
    VocabReviewKind kind,
    bool correct,
  )? onAnswered;
  final ValueChanged<int>? onCompleted;
  final LessonSfx? sfx;

  @override
  State<VocabularyReviewScreen> createState() => _VocabularyReviewScreenState();
}

class _VocabularyReviewScreenState extends State<VocabularyReviewScreen> {
  late final VocabReviewController _review;
  late final bool _ownsReview;
  late final LessonSfx _sfx;
  late final VocabSpeakingRepository _speaking;
  late final bool _ownsSpeaking;
  final TextEditingController _answerController = TextEditingController();
  final FocusNode _answerFocusNode = FocusNode();
  Timer? _listeningTimer;
  Timer? _spellingFocusTimer;
  bool _keyboardOpen = false;
  String _questionSignature = '';
  int _celebration = 0;
  bool _recording = false;
  bool _assessingSpeech = false;
  VocabPronunciationResult? _pronunciationResult;
  String _speakingError = '';
  bool _completionReported = false;

  @override
  void initState() {
    super.initState();
    _ownsReview = widget.reviewController == null;
    _review =
        widget.reviewController ?? VocabReviewController(items: widget.items);
    _sfx = widget.sfx ?? AppSfx.instance;
    _ownsSpeaking = widget.speakingRepository == null;
    _speaking = widget.speakingRepository ?? FirebaseVocabSpeakingRepository();
    _review.addListener(_refresh);
    _questionSignature = _review.currentQuestion?.id ??
        (_review.isComplete ? 'complete' : 'empty');
    WidgetsBinding.instance.addPostFrameCallback((_) => _prepareQuestion());
  }

  @override
  void dispose() {
    _listeningTimer?.cancel();
    _spellingFocusTimer?.cancel();
    _review.removeListener(_refresh);
    if (_ownsReview) _review.dispose();
    _answerController.dispose();
    _answerFocusNode.dispose();
    if (_ownsSpeaking) {
      unawaited(_speaking.dispose());
    } else {
      unawaited(_speaking.cancel());
    }
    super.dispose();
  }

  void _refresh() {
    if (!mounted) return;
    final questionId = _review.currentQuestion?.id ??
        (_review.isComplete ? 'complete' : 'empty');
    if (questionId != _questionSignature) {
      _questionSignature = questionId;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _prepareQuestion();
      });
    }
    setState(() {});
  }

  void _prepareQuestion() {
    _listeningTimer?.cancel();
    _spellingFocusTimer?.cancel();
    final question = _review.currentQuestion;
    _recording = false;
    _assessingSpeech = false;
    _pronunciationResult = null;
    _speakingError = '';
    if (question == null) {
      _keyboardOpen = false;
      _answerFocusNode.unfocus();
      return;
    }
    if (question.kind == VocabReviewKind.spelling ||
        question.kind == VocabReviewKind.sentenceCloze) {
      final givenFirstLetter =
          vocabSpellingGivenLetter(question.item.word.trim());
      _answerController.value = TextEditingValue(
        text: givenFirstLetter,
        selection: TextSelection.collapsed(offset: givenFirstLetter.length),
      );
      _review.updateSpelling(givenFirstLetter);
      _spellingFocusTimer?.cancel();
      _spellingFocusTimer = Timer(const Duration(milliseconds: 80), () {
        if (mounted && !_review.isResolved) {
          _openReviewKeyboard();
        }
      });
    } else {
      _keyboardOpen = false;
      _answerFocusNode.unfocus();
    }
    if (question.kind == VocabReviewKind.listening) {
      _listeningTimer = Timer(const Duration(milliseconds: 220), () {
        if (mounted && !_review.isResolved) _speakCurrentWord();
      });
    }
    if (question.kind.needsSpeaking) {
      _listeningTimer = Timer(const Duration(milliseconds: 220), () {
        if (mounted && !_review.isResolved) _speakCurrentReference();
      });
    }
    if (question.kind == VocabReviewKind.sentenceCloze &&
        question.exampleSentence.isNotEmpty) {
      _listeningTimer = Timer(const Duration(milliseconds: 220), () {
        if (mounted && !_review.isResolved) {
          unawaited(widget.audioRepository.speakExample(
            question.exampleSentence,
          ));
        }
      });
    }
  }

  void _speakCurrentWord() {
    final question = _review.currentQuestion;
    if (question == null || _review.isResolved) return;
    unawaited(widget.audioRepository.speakWord(question.item.word));
  }

  String _speakingText(VocabReviewQuestion question) =>
      question.kind == VocabReviewKind.speakingSentence
          ? question.exampleSentence
          : question.item.word;

  void _speakCurrentReference() {
    final question = _review.currentQuestion;
    if (question == null || !question.kind.needsSpeaking) return;
    if (question.kind == VocabReviewKind.speakingSentence) {
      unawaited(widget.audioRepository.speakExample(question.exampleSentence));
    } else {
      unawaited(widget.audioRepository.speakWord(question.item.word));
    }
  }

  Future<void> _toggleSpeakingRecording() async {
    final question = _review.currentQuestion;
    if (question == null ||
        !question.kind.needsSpeaking ||
        _review.isResolved ||
        _assessingSpeech) {
      return;
    }
    if (_recording) {
      setState(() {
        _recording = false;
        _assessingSpeech = true;
        _speakingError = '';
      });
      final result = await _speaking.stopAndAssess(
        expectedText: _speakingText(question),
        referenceId: question.id,
      );
      if (!mounted || _review.currentQuestion?.id != question.id) return;
      if (result == null) {
        setState(() {
          _assessingSpeech = false;
          _speakingError = '未能分析今次錄音，請再試一次。';
        });
        return;
      }
      setState(() {
        _assessingSpeech = false;
        _pronunciationResult = result;
      });
      final event = _review.submitSpeaking(result.passed);
      _playAnswerEvent(event, question);
      return;
    }

    setState(() {
      _speakingError = '';
      _pronunciationResult = null;
    });
    final start = await _speaking.start();
    if (!mounted || _review.currentQuestion?.id != question.id) return;
    setState(() {
      _recording = start == VocabSpeakingStartResult.started;
      _speakingError = switch (start) {
        VocabSpeakingStartResult.started => '',
        VocabSpeakingStartResult.permissionDenied => '請先允許使用咪高峰，先可以練習讀音。',
        VocabSpeakingStartResult.unavailable => '暫時未能開啟咪高峰，請再試一次。',
      };
    });
  }

  Future<void> _disableAudioQuestions() async {
    await _speaking.cancel();
    if (!mounted) return;
    setState(() {
      _recording = false;
      _assessingSpeech = false;
      _pronunciationResult = null;
      _speakingError = '';
    });
    final kind = _review.currentQuestion?.kind;
    if (kind != null) _review.disableQuestionsLike(kind);
  }

  void _recordAnswer(VocabReviewQuestion question, bool correct) {
    final callback = widget.onAnswered;
    if (callback != null) {
      unawaited(callback(question.item, question.kind, correct));
    }
  }

  void _playAnswerEvent(
    VocabReviewEvent event,
    VocabReviewQuestion question,
  ) {
    switch (event) {
      case VocabReviewEvent.correct:
        unawaited(_sfx.play(SfxCue.correct));
        setState(() => _celebration += 1);
        _recordAnswer(question, true);
      case VocabReviewEvent.wrong:
        unawaited(_sfx.play(SfxCue.wrong));
        _recordAnswer(question, false);
      case VocabReviewEvent.invalidInput:
        unawaited(_sfx.play(SfxCue.wrong));
      case VocabReviewEvent.ignored:
      case VocabReviewEvent.nextQuestion:
      case VocabReviewEvent.retryIntro:
      case VocabReviewEvent.completed:
        break;
    }
  }

  void _choose(String choice) {
    final question = _review.currentQuestion;
    if (question == null) return;
    final event = _review.choose(choice);
    _playAnswerEvent(event, question);
  }

  void _submitSpelling() {
    final question = _review.currentQuestion;
    if (question == null) return;
    _review.updateSpelling(composeVocabSpellingAnswer(
      question.item.word,
      _answerController.text,
    ));
    _closeReviewKeyboard();
    final event = _review.submitSpelling();
    _playAnswerEvent(event, question);
  }

  void _openReviewKeyboard() {
    if (_keyboardOpen ||
        (_review.currentQuestion?.kind != VocabReviewKind.spelling &&
            _review.currentQuestion?.kind != VocabReviewKind.sentenceCloze) ||
        _review.isResolved) {
      return;
    }
    setState(() => _keyboardOpen = true);
    _answerFocusNode.requestFocus();
    unawaited(SystemChannels.textInput.invokeMethod<void>('TextInput.hide'));
  }

  void _closeReviewKeyboard() {
    if (!_keyboardOpen) return;
    setState(() => _keyboardOpen = false);
    _answerFocusNode.unfocus();
    unawaited(SystemChannels.textInput.invokeMethod<void>('TextInput.hide'));
  }

  void _handleReviewKeyboardKey(String key) {
    if (!_keyboardOpen || _review.isResolved) return;
    final current = _answerController.text;
    final next = switch (key) {
      'BACKSPACE' => current.length <= 1
          ? current
          : current.substring(0, current.length - 1),
      'SPACE' || '-' || "'" => current,
      _ => normalizeVocabSpellingInput(
          '$current${key.toLowerCase()}',
          _review.currentQuestion!.item.word,
        ),
    };
    if (next.length > 60) return;
    _answerController.value = TextEditingValue(
      text: next,
      selection: TextSelection.collapsed(offset: next.length),
    );
    _review.updateSpelling(next);
    unawaited(_sfx.play(SfxCue.type));
  }

  void _next() {
    final event = _review.next();
    switch (event) {
      case VocabReviewEvent.nextQuestion:
        unawaited(_sfx.play(SfxCue.next));
      case VocabReviewEvent.retryIntro:
        unawaited(_sfx.play(SfxCue.next));
      case VocabReviewEvent.completed:
        unawaited(_sfx.play(
          AppSfx.resultCueForPercent(
            _review.accuracyPercent,
          ),
        ));
        setState(() => _celebration += 1);
        if (!_review.repeatsWrong && !_completionReported) {
          _completionReported = true;
          widget.onCompleted?.call(_review.targetTotal);
        }
      case VocabReviewEvent.ignored:
      case VocabReviewEvent.invalidInput:
      case VocabReviewEvent.correct:
      case VocabReviewEvent.wrong:
        break;
    }
  }

  void _startRetry() {
    final event = _review.startRetry();
    if (event == VocabReviewEvent.nextQuestion) {
      unawaited(_sfx.play(SfxCue.next));
    }
  }

  void _claimXpAndClose() {
    if (!_completionReported) {
      _completionReported = true;
      widget.onCompleted?.call(_review.targetTotal);
    }
    _close();
  }

  void _close() {
    unawaited(_sfx.play(SfxCue.click));
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppPalette.background,
      resizeToAvoidBottomInset: false,
      body: SafeArea(
        child: Stack(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 8, 14, 12),
              child: Column(
                children: [
                  _ReviewHeader(
                    review: _review,
                    onClose: _close,
                  ),
                  const SizedBox(height: 12),
                  Expanded(child: _buildBody()),
                ],
              ),
            ),
            LessonCelebrationOverlay(
              trigger: _celebration,
              grand: _review.isComplete,
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
                      keyboardKey: const Key('vocab-review-custom-keyboard'),
                      keyPrefix: 'vocab-review-keyboard-key-',
                      onKey: _handleReviewKeyboardKey,
                      onSubmit: _submitSpelling,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildBody() {
    final question = _review.currentQuestion;
    if (_review.isComplete) {
      return _ReviewComplete(
        review: _review,
        onBack: _review.repeatsWrong ? _claimXpAndClose : _close,
      );
    }
    if (_review.isRetryIntro) {
      return _ReviewRetryIntro(onContinue: _startRetry);
    }
    if (question == null) {
      return const Center(child: Text('未有可溫習生字。'));
    }
    return SingleChildScrollView(
      key: const Key('vocab-review-scroll'),
      physics: const BouncingScrollPhysics(),
      keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
      padding: const EdgeInsets.fromLTRB(4, 0, 4, 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _ReviewPrompt(
            question: question,
            onSpeak: question.kind == VocabReviewKind.listening
                ? _speakCurrentWord
                : question.kind.needsSpeaking
                    ? _speakCurrentReference
                    : question.kind == VocabReviewKind.sentenceCloze &&
                            question.exampleSentence.isNotEmpty
                        ? () => unawaited(widget.audioRepository.speakExample(
                              question.exampleSentence,
                            ))
                        : null,
          ),
          const SizedBox(height: 14),
          if (question.kind.needsSpeaking)
            _ReviewSpeakingPanel(
              recording: _recording,
              assessing: _assessingSpeech,
              result: _pronunciationResult,
              error: _speakingError,
              resolved: _review.isResolved,
              onToggleRecording: _toggleSpeakingRecording,
            )
          else if (question.kind == VocabReviewKind.spelling ||
              question.kind == VocabReviewKind.sentenceCloze)
            _ReviewSpellingField(
              controller: _answerController,
              focusNode: _answerFocusNode,
              resolved: _review.isResolved,
              correct: _review.lastCorrect,
              answerWord: question.item.word,
              onChanged: _review.updateSpelling,
              onType: () => unawaited(_sfx.play(SfxCue.type)),
              onSubmitted: _submitSpelling,
              keyboardOpen: _keyboardOpen,
              onTap: _openReviewKeyboard,
            )
          else
            _ReviewChoiceGrid(
              question: question,
              review: _review,
              onChoose: _choose,
            ),
          if (!_review.isResolved && question.kind.needsAudioOrMicrophone) ...[
            const SizedBox(height: 12),
            _ReviewAudioOptOutButton(
              speaking: question.kind.needsSpeaking,
              onPressed: _disableAudioQuestions,
            ),
          ],
          if (_review.isResolved) ...[
            const SizedBox(height: 14),
            _ReviewFeedback(
              review: _review,
              question: question,
              pronunciationResult: _pronunciationResult,
            ),
            const SizedBox(height: 14),
            _ReviewNextButton(
              label: '下一題',
              onPressed: _next,
            ),
          ],
        ],
      ),
    );
  }
}

class _ReviewRetryIntro extends StatelessWidget {
  const _ReviewRetryIntro({required this.onContinue});

  final VoidCallback onContinue;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      key: const Key('vocab-review-retry-intro'),
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(4, 0, 4, 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          OriginalDashedSurface(
            backgroundColor: AppPalette.softSecondary,
            borderColor: AppPalette.secondaryDark,
            shadowColor: const Color(0xFFFFE7A3),
            shadowDepth: 6,
            radius: 26,
            strokeWidth: 3,
            padding: const EdgeInsets.fromLTRB(16, 15, 16, 20),
            child: Column(
              children: [
                SizedBox.square(
                  dimension: 205,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      Align(
                        alignment: Alignment.bottomCenter,
                        child: Lottie.asset(
                          'assets/lottie/monsters/monster-blue.json',
                          repeat: true,
                        ),
                      ),
                    ],
                  ),
                ),
                const OriginalDashedSurface(
                  key: Key('vocab-review-retry-bubble'),
                  backgroundColor: AppPalette.paper,
                  borderColor: AppPalette.primary,
                  shadowColor: Color(0xFFBDE0E1),
                  shadowDepth: 4,
                  radius: 20,
                  strokeWidth: 2,
                  padding: EdgeInsets.fromLTRB(14, 13, 14, 12),
                  child: Column(
                    children: [
                      Text(
                        '有幾題要再練習，一齊答啱佢哋！',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Color(0xFF5D4037),
                          fontSize: 21,
                          height: 1.25,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      SizedBox(height: 6),
                      Text(
                        '錯題唔扣分，慢慢答啱就得。',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: AppPalette.muted,
                          fontSize: 14,
                          height: 1.35,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          _ReviewNextButton(
            key: const Key('vocab-review-retry-continue'),
            label: '繼續溫習',
            onPressed: onContinue,
          ),
        ],
      ),
    );
  }
}

class _ReviewHeader extends StatelessWidget {
  const _ReviewHeader({
    required this.review,
    required this.onClose,
  });

  final VocabReviewController review;
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 46,
      child: Row(
        children: [
          OutlinedButton(
            key: const Key('vocab-review-back'),
            onPressed: onClose,
            style: OutlinedButton.styleFrom(
              minimumSize: const Size(82, 42),
              padding: const EdgeInsets.symmetric(horizontal: 10),
              foregroundColor: AppPalette.muted,
              backgroundColor: Colors.white,
              side: const BorderSide(color: Color(0xFFEEEEEE), width: 2),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(999),
              ),
              textStyle: const TextStyle(fontWeight: FontWeight.w900),
            ),
            child: const Text('< Vocab'),
          ),
          const SizedBox(width: 9),
          Expanded(
            child: TweenAnimationBuilder<double>(
              tween: Tween(end: review.progress),
              duration: const Duration(milliseconds: 260),
              curve: Curves.easeOut,
              builder: (context, value, child) => ClipRRect(
                borderRadius: BorderRadius.circular(99),
                child: LinearProgressIndicator(
                  value: value.clamp(0, 1),
                  minHeight: 14,
                  color: AppPalette.primary,
                  backgroundColor: const Color(0xFFE5E7EB),
                ),
              ),
            ),
          ),
          const SizedBox(width: 9),
        ],
      ),
    );
  }
}

class _ReviewPrompt extends StatefulWidget {
  const _ReviewPrompt({required this.question, this.onSpeak});

  final VocabReviewQuestion question;
  final VoidCallback? onSpeak;

  @override
  State<_ReviewPrompt> createState() => _ReviewPromptState();
}

class _ReviewPromptState extends State<_ReviewPrompt>
    with SingleTickerProviderStateMixin {
  late final AnimationController _noteController = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 360),
  );
  late final Animation<double> _noteScale = TweenSequence<double>([
    TweenSequenceItem(tween: Tween(begin: 1, end: 1.28), weight: 45),
    TweenSequenceItem(tween: Tween(begin: 1.28, end: 0.92), weight: 25),
    TweenSequenceItem(tween: Tween(begin: 0.92, end: 1), weight: 30),
  ]).animate(CurvedAnimation(parent: _noteController, curve: Curves.easeOut));

  @override
  void dispose() {
    _noteController.dispose();
    super.dispose();
  }

  void _replay() {
    widget.onSpeak?.call();
    _noteController.forward(from: 0);
  }

  @override
  Widget build(BuildContext context) {
    final question = widget.question;
    final spelling = question.kind == VocabReviewKind.spelling;
    final listening = question.kind == VocabReviewKind.listening;
    final sentenceCloze = question.kind == VocabReviewKind.sentenceCloze;
    final speaking = question.kind.needsSpeaking;
    final speakingSentence = question.kind == VocabReviewKind.speakingSentence;
    final readingChoice =
        question.kind == VocabReviewKind.reading && question.choices.isNotEmpty;
    final promptText = speakingSentence
        ? question.exampleSentence
        : question.kind == VocabReviewKind.speakingWord
            ? question.item.word
            : sentenceCloze
                ? question.exampleSentence.replaceAll(
                    RegExp(r'\b' + RegExp.escape(question.item.word) + r'\b',
                        caseSensitive: false),
                    '_____ ',
                  )
                : spelling
                    ? question.correctMeaning
                    : listening
                        ? '♪'
                        : readingChoice
                            ? '${question.item.word} (${_vocabPromptPos(question.item, question.sense)})'
                            : question.item.word;
    return OriginalDashedSurface(
      key: const Key('vocab-review-prompt'),
      backgroundColor: AppPalette.paper,
      borderColor: AppPalette.primary,
      strokeWidth: 3,
      radius: 26,
      shadowColor: const Color(0xFFE9ECEF),
      shadowDepth: 5,
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
      child: Column(
        children: [
          GestureDetector(
            key: const Key('vocab-review-prompt-audio'),
            onTap: widget.onSpeak == null ? null : _replay,
            child: ScaleTransition(
              key: const Key('vocab-review-note-animation'),
              scale: listening || sentenceCloze || speaking
                  ? _noteScale
                  : const AlwaysStoppedAnimation(1),
              child: Text(
                promptText,
                key: const Key('vocab-review-prompt-text'),
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: const Color(0xFF5D4037),
                  fontSize: listening ? 50 : (spelling || speaking ? 28 : 24),
                  height: 1.3,
                  fontWeight: FontWeight.w900,
                  shadows: const [
                    Shadow(color: Color(0xFFFFF3BF), offset: Offset(2, 2)),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 10),
          Text(
            spelling
                ? '打出英文生字'
                : listening
                    ? '聽讀音，再選出正確中文意思'
                    : speakingSentence
                        ? '先聽一次，再按咪高峰讀出完整句子'
                        : speaking
                            ? '先聽一次，再按咪高峰讀出英文生字'
                            : sentenceCloze
                                ? '聽例句，填回欠缺的英文生字'
                                : '選出正確中文意思',
            key: const Key('vocab-review-guidance'),
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppPalette.muted,
              fontSize: 14,
              height: 1.4,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}

String _vocabPromptPos(VocabItem item, [VocabSense? selectedSense]) {
  final pos = (selectedSense == null ? item.senses : [selectedSense])
      .map((sense) => sense.pos.trim().toLowerCase())
      .firstWhere((value) => value.isNotEmpty, orElse: () => '');
  return switch (pos) {
    'noun' => 'n.',
    'verb' => 'v.',
    'adjective' => 'adj.',
    'adverb' => 'adv.',
    'preposition' => 'prep.',
    'conjunction' => 'conj.',
    'pronoun' => 'pron.',
    'determiner' => 'det.',
    'exclamation' => 'excl.',
    _ => pos.isEmpty ? 'word' : pos,
  };
}

class _ReviewSpeakingPanel extends StatelessWidget {
  const _ReviewSpeakingPanel({
    required this.recording,
    required this.assessing,
    required this.result,
    required this.error,
    required this.resolved,
    required this.onToggleRecording,
  });

  final bool recording;
  final bool assessing;
  final VocabPronunciationResult? result;
  final String error;
  final bool resolved;
  final VoidCallback onToggleRecording;

  @override
  Widget build(BuildContext context) {
    final score = result?.score.round();
    return OriginalDashedSurface(
      key: const Key('vocab-review-speaking-panel'),
      backgroundColor: Colors.white,
      borderColor: recording ? AppPalette.danger : AppPalette.primary,
      shadowColor:
          recording ? const Color(0xFFFFC1C1) : const Color(0xFFBDE0E1),
      shadowDepth: 4,
      radius: 18,
      strokeWidth: 3,
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 14),
      child: Column(
        children: [
          GestureDetector(
            key: const Key('vocab-review-speaking-record'),
            behavior: HitTestBehavior.opaque,
            onTap: resolved || assessing ? null : onToggleRecording,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 160),
              width: 68,
              height: 68,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color:
                    recording ? AppPalette.softDanger : const Color(0xFFE8F8F6),
                border: Border.all(
                  color: recording ? AppPalette.danger : AppPalette.primary,
                  width: 3,
                ),
                boxShadow: [
                  BoxShadow(
                    color: recording
                        ? const Color(0x55E95D69)
                        : const Color(0x445BC7C2),
                    blurRadius: recording ? 16 : 8,
                    spreadRadius: recording ? 3 : 1,
                  ),
                ],
              ),
              child: Icon(
                recording ? Icons.stop_rounded : Icons.mic_rounded,
                color:
                    recording ? AppPalette.dangerDark : AppPalette.primaryDark,
                size: 34,
              ),
            ),
          ),
          const SizedBox(height: 10),
          Text(
            assessing
                ? '正在分析讀音...'
                : recording
                    ? '錄音中，讀完後再按一次停止'
                    : score != null
                        ? '讀音分數：$score / 100'
                        : '按咪高峰開始錄音',
            key: const Key('vocab-review-speaking-status'),
            textAlign: TextAlign.center,
            style: TextStyle(
              color: recording ? AppPalette.dangerDark : AppPalette.primaryDark,
              fontSize: 15,
              height: 1.35,
              fontWeight: FontWeight.w900,
            ),
          ),
          if (assessing) ...[
            const SizedBox(height: 10),
            const LinearProgressIndicator(
              minHeight: 6,
              color: AppPalette.primary,
              backgroundColor: Color(0xFFE5E7EB),
            ),
          ],
          if (error.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              error,
              key: const Key('vocab-review-speaking-error'),
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: AppPalette.dangerDark,
                fontSize: 13,
                height: 1.35,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _ReviewAudioOptOutButton extends StatelessWidget {
  const _ReviewAudioOptOutButton({
    required this.speaking,
    required this.onPressed,
  });

  final bool speaking;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return TextButton.icon(
      key: const Key('vocab-review-audio-opt-out'),
      onPressed: onPressed,
      icon: Icon(speaking ? Icons.mic_off_rounded : Icons.volume_off_rounded),
      label: Text(speaking ? '而家唔方便講？改問其他題' : '而家唔方便聽？改問其他題'),
      style: TextButton.styleFrom(
        foregroundColor: AppPalette.muted,
        textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      ),
    );
  }
}

class _ReviewChoiceGrid extends StatelessWidget {
  const _ReviewChoiceGrid({
    required this.question,
    required this.review,
    required this.onChoose,
  });

  final VocabReviewQuestion question;
  final VocabReviewController review;
  final ValueChanged<String> onChoose;

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      key: const Key('vocab-review-choice-grid'),
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: question.choices.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        mainAxisExtent: 82,
      ),
      itemBuilder: (context, index) {
        final choice = question.choices[index];
        final correct = review.isResolved && choice == question.correctMeaning;
        final wrong = review.isResolved &&
            choice == review.selectedChoice &&
            choice != question.correctMeaning;
        return _ReviewChoiceButton(
          key: ValueKey('vocab-review-choice-$index'),
          label: choice,
          correct: correct,
          wrong: wrong,
          enabled: !review.isResolved,
          onTap: () => onChoose(choice),
        );
      },
    );
  }
}

class _ReviewChoiceButton extends StatefulWidget {
  const _ReviewChoiceButton({
    required this.label,
    required this.enabled,
    required this.correct,
    required this.wrong,
    required this.onTap,
    super.key,
  });

  final String label;
  final bool enabled;
  final bool correct;
  final bool wrong;
  final VoidCallback onTap;

  @override
  State<_ReviewChoiceButton> createState() => _ReviewChoiceButtonState();
}

class _ReviewChoiceButtonState extends State<_ReviewChoiceButton> {
  bool _hovered = false;
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final active = _hovered || _pressed;
    final highlighted = active && widget.enabled;
    final correct = widget.correct;
    final wrong = widget.wrong;
    final background = correct
        ? AppPalette.softCorrect
        : wrong
            ? AppPalette.softDanger
            : highlighted
                ? AppPalette.softPrimary
                : Colors.white;
    final border = correct
        ? AppPalette.correctDark
        : wrong
            ? AppPalette.danger
            : highlighted
                ? AppPalette.primary
                : AppPalette.border;
    final shadow = correct
        ? const Color(0xFFB7E7BF)
        : wrong
            ? AppPalette.dangerDark
            : highlighted
                ? const Color(0xFFBDE0E1)
                : const Color(0xFFE9ECEF);
    return MouseRegion(
      cursor:
          widget.enabled ? SystemMouseCursors.click : SystemMouseCursors.basic,
      onEnter: (_) => setState(() => _hovered = true),
      onExit: (_) => setState(() {
        _hovered = false;
        _pressed = false;
      }),
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTapDown:
            widget.enabled ? (_) => setState(() => _pressed = true) : null,
        onTapUp:
            widget.enabled ? (_) => setState(() => _pressed = false) : null,
        onTapCancel:
            widget.enabled ? () => setState(() => _pressed = false) : null,
        onTap: widget.enabled ? widget.onTap : null,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 120),
          curve: Curves.easeOut,
          transform: Matrix4.translationValues(0, highlighted ? -2 : 0, 0),
          child: OriginalDashedSurface(
            backgroundColor: background,
            borderColor: border,
            shadowColor: shadow,
            shadowDepth: highlighted || correct || wrong ? 6 : 4,
            radius: 18,
            strokeWidth: 3,
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            child: Center(
              child: Text(
                widget.label,
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: correct
                      ? AppPalette.correctDark
                      : wrong
                          ? AppPalette.dangerDark
                          : highlighted
                              ? AppPalette.primaryDark
                              : AppPalette.ink,
                  fontSize: 16,
                  height: 1.2,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ReviewSpellingField extends StatelessWidget {
  const _ReviewSpellingField({
    required this.controller,
    required this.focusNode,
    required this.resolved,
    required this.correct,
    required this.answerWord,
    required this.onChanged,
    required this.onType,
    required this.onSubmitted,
    required this.keyboardOpen,
    required this.onTap,
  });

  final TextEditingController controller;
  final FocusNode focusNode;
  final bool resolved;
  final bool? correct;
  final String answerWord;
  final ValueChanged<String> onChanged;
  final VoidCallback onType;
  final VoidCallback onSubmitted;
  final bool keyboardOpen;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isCorrect = resolved && correct == true;
    final isWrong = resolved && correct == false;
    return OriginalDashedSurface(
      key: const Key('vocab-review-spelling-panel'),
      backgroundColor: Colors.white,
      borderColor: isCorrect
          ? AppPalette.correctDark
          : isWrong
              ? AppPalette.danger
              : AppPalette.primary,
      shadowColor: isCorrect
          ? const Color(0xFFB7E7BF)
          : isWrong
              ? AppPalette.dangerDark
              : const Color(0xFFBDE0E1),
      shadowDepth: 4,
      radius: 18,
      strokeWidth: 3,
      child: ConstrainedBox(
        constraints: const BoxConstraints(minHeight: 58),
        child: Stack(
          alignment: Alignment.center,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 9),
              child: IgnorePointer(
                child: _SpellingPattern(
                  key: const Key('vocab-review-spelling-hint'),
                  answer: answerWord,
                  typed: controller.text,
                  resolved: resolved,
                ),
              ),
            ),
            Positioned.fill(
              child: TextField(
                key: const Key('vocab-review-spelling-input'),
                controller: controller,
                focusNode: focusNode,
                readOnly: resolved,
                keyboardType: TextInputType.none,
                showCursor: false,
                cursorWidth: 0,
                cursorColor: Colors.transparent,
                selectionControls: null,
                autocorrect: false,
                enableSuggestions: false,
                spellCheckConfiguration:
                    const SpellCheckConfiguration.disabled(),
                textCapitalization: TextCapitalization.none,
                textInputAction: TextInputAction.done,
                onChanged: (value) {
                  onChanged(value);
                  onType();
                },
                inputFormatters: [
                  TextInputFormatter.withFunction((oldValue, newValue) {
                    final normalized = normalizeVocabSpellingInput(
                      newValue.text,
                      answerWord,
                    );
                    if (normalized.isEmpty) return oldValue;
                    return newValue.copyWith(
                      text: normalized,
                      selection:
                          TextSelection.collapsed(offset: normalized.length),
                    );
                  }),
                ],
                onSubmitted: (_) => onSubmitted(),
                onTap: onTap,
                decoration: const InputDecoration(
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.zero,
                ),
                style: const TextStyle(
                  color: Colors.transparent,
                  fontSize: 22,
                  height: 1.15,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SpellingPattern extends StatelessWidget {
  const _SpellingPattern({
    required this.answer,
    required this.typed,
    required this.resolved,
    super.key,
  });

  final String answer;
  final String typed;
  final bool resolved;

  @override
  Widget build(BuildContext context) {
    final characters = answer.trim().split('');
    final shownLetters = normalizeVocabSpellingInput(typed, answer);
    final composed = composeVocabSpellingAnswer(answer, shownLetters);
    var letterIndex = 0;
    var firstLetterShown = false;
    final slots = <Widget>[];
    for (var index = 0; index < characters.length; index++) {
      final character = characters[index];
      final isLetter = isVocabSpellingLetter(character);
      final isFirstLetter = isLetter && !firstLetterShown;
      if (isLetter) firstLetterShown = true;
      final visible = isLetter
          ? (letterIndex < shownLetters.length ? shownLetters[letterIndex] : '')
          : character;
      if (isLetter) letterIndex += 1;
      slots.add(SizedBox(
        width: isLetter ? 20 : (character == ' ' ? 8 : 12),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              height: 27,
              child: Text(
                visible,
                key: ValueKey('vocab-review-spelling-slot-$index'),
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: resolved
                      ? (composed.toLowerCase() == answer.toLowerCase()
                          ? AppPalette.correctDark
                          : AppPalette.dangerDark)
                      : const Color(0xFF5D4037),
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
            if (isLetter && !isFirstLetter)
              Container(
                height: 2,
                color: const Color(0xFF5D4037),
              )
            else
              const SizedBox(height: 2),
          ],
        ),
      ));
    }
    return Wrap(
      alignment: WrapAlignment.center,
      crossAxisAlignment: WrapCrossAlignment.end,
      spacing: 5,
      runSpacing: 7,
      children: slots,
    );
  }
}

class _ReviewFeedback extends StatelessWidget {
  const _ReviewFeedback({
    required this.review,
    required this.question,
    this.pronunciationResult,
  });

  final VocabReviewController review;
  final VocabReviewQuestion question;
  final VocabPronunciationResult? pronunciationResult;

  @override
  Widget build(BuildContext context) {
    final correct = review.lastCorrect == true;
    final weakest = pronunciationResult?.weakestWord;
    final message = question.kind.needsSpeaking && pronunciationResult != null
        ? correct
            ? '讀音合格，得到 ${pronunciationResult!.score.round()} 分。'
            : '今次得到 ${pronunciationResult!.score.round()} 分；${weakest == null ? '聽一次標準讀音再試。' : '留意 ${weakest.word} 的讀音。'}'
        : correct
            ? '正確，${question.item.word} 是「${question.correctMeaning}」。'
            : question.kind == VocabReviewKind.spelling ||
                    question.kind == VocabReviewKind.sentenceCloze
                ? '再檢查串法。正確答案係 ${question.item.word}，意思係「${question.correctMeaning}」。'
                : '${question.item.word} 是「${question.correctMeaning}」。';
    return OriginalDashedSurface(
      key: const Key('vocab-review-feedback'),
      backgroundColor: const Color(0xFFFFFDF2),
      borderColor: AppPalette.secondaryDark,
      shadowColor: const Color(0xFFFFE7A3),
      shadowDepth: 4,
      radius: 18,
      strokeWidth: 2,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      child: Text(
        message,
        textAlign: TextAlign.center,
        style: TextStyle(
          color: correct ? AppPalette.correctDark : AppPalette.dangerDark,
          fontSize: 15,
          height: 1.45,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class _ReviewNextButton extends StatelessWidget {
  const _ReviewNextButton(
      {required this.label, required this.onPressed, super.key});

  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return _OriginalRaisedButton(
      key: key ?? const Key('vocab-review-next'),
      onTap: onPressed,
      height: 56,
      radius: 999,
      backgroundColor: AppPalette.secondary,
      foregroundColor: const Color(0xFF5D4037),
      shadowColor: AppPalette.secondaryDark,
      shadowDepth: 6,
      hoverBackgroundColor: const Color(0xFFFFEB85),
      hoverOffset: -2,
      hoverShadowDepth: 8,
      semanticLabel: label,
      child: Text(
        label,
        style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
      ),
    );
  }
}

class _ReviewComplete extends StatelessWidget {
  const _ReviewComplete({required this.review, required this.onBack});

  final VocabReviewController review;
  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) {
    if (review.repeatsWrong) {
      return _RepeatUntilCorrectComplete(review: review, onBack: onBack);
    }
    return _LegacyReviewComplete(review: review, onBack: onBack);
  }
}

class _LegacyReviewComplete extends StatelessWidget {
  const _LegacyReviewComplete({required this.review, required this.onBack});

  final VocabReviewController review;
  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) {
    final perfect = review.score == review.total;
    return SingleChildScrollView(
      key: const Key('vocab-review-complete'),
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(4, 0, 4, 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          OriginalDashedSurface(
            backgroundColor: AppPalette.paper,
            borderColor: AppPalette.primary,
            strokeWidth: 3,
            radius: 26,
            shadowColor: const Color(0xFFE9ECEF),
            shadowDepth: 5,
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 24),
            child: Column(
              children: [
                Text(
                  perfect ? 'Full marks!' : '完成',
                  key: const Key('vocab-review-complete-prompt'),
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Color(0xFF5D4037),
                    fontSize: 42,
                    height: 1.1,
                    fontWeight: FontWeight.w900,
                    shadows: [
                      Shadow(color: Color(0xFFFFF3BF), offset: Offset(2, 2)),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  '今次答啱 ${review.score}/${review.total}。',
                  style: const TextStyle(
                    color: AppPalette.muted,
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          OriginalDashedSurface(
            key: const Key('vocab-review-complete-feedback'),
            backgroundColor: const Color(0xFFFFFDF2),
            borderColor: AppPalette.secondaryDark,
            shadowColor: const Color(0xFFFFE7A3),
            shadowDepth: 4,
            radius: 18,
            strokeWidth: 2,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            child: Text(
              perfect ? '做得好！繼續保持。' : '再溫習一次，記憶會更穩。',
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Color(0xFF8A6A32),
                fontSize: 15,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
          const SizedBox(height: 14),
          _ReviewNextButton(label: '返回詞彙', onPressed: onBack),
        ],
      ),
    );
  }
}

class _RepeatUntilCorrectComplete extends StatelessWidget {
  const _RepeatUntilCorrectComplete({
    required this.review,
    required this.onBack,
  });

  final VocabReviewController review;
  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      key: const Key('vocab-review-complete'),
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(4, 0, 4, 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const OriginalDashedSurface(
            key: Key('vocab-review-success-panel'),
            backgroundColor: AppPalette.paper,
            borderColor: AppPalette.primary,
            shadowColor: Color(0xFFBDE0E1),
            shadowDepth: 6,
            radius: 26,
            strokeWidth: 3,
            padding: EdgeInsets.fromLTRB(14, 18, 14, 15),
            child: Column(
              children: [
                Text(
                  '溫習大成功！！',
                  key: Key('vocab-review-success-title'),
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Color(0xFF5D4037),
                    fontSize: 30,
                    height: 1.1,
                    fontWeight: FontWeight.w900,
                    shadows: [
                      Shadow(color: Color(0xFFFFF3BF), offset: Offset(2, 2)),
                    ],
                  ),
                ),
                SizedBox(height: 7),
                Text(
                  '全部生字都答啱喇！',
                  style: TextStyle(
                    color: AppPalette.muted,
                    fontSize: 15,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 4),
          SizedBox(
            key: const Key('vocab-review-success-monster'),
            height: 252,
            child: Lottie.asset(
              successMonsterAssetForToday(),
              fit: BoxFit.contain,
              repeat: true,
              frameRate: FrameRate.max,
            ),
          ),
          const SizedBox(height: 14),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: _ReviewMetric(
                  label: 'XP',
                  value: '${review.xpEarned}',
                  color: const Color(0xFFD99A00),
                  background: const Color(0xFFFFF3BF),
                  icon: Icons.bolt_rounded,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _ReviewMetric(
                  label: '正確率',
                  value: '${review.accuracyPercent}%',
                  color: AppPalette.correctDark,
                  background: AppPalette.softCorrect,
                  icon: Icons.track_changes_rounded,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _ReviewMetric(
                  label: '速度',
                  value: _formatReviewDuration(review.elapsed),
                  color: const Color(0xFF2C9FD4),
                  background: const Color(0xFFE4F6FF),
                  icon: Icons.timer_rounded,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          _ReviewNextButton(
            key: const Key('vocab-review-claim-xp'),
            label: '得到經驗值',
            onPressed: onBack,
          ),
        ],
      ),
    );
  }
}

class _ReviewMetric extends StatelessWidget {
  const _ReviewMetric({
    required this.label,
    required this.value,
    required this.color,
    required this.background,
    required this.icon,
  });

  final String label;
  final String value;
  final Color color;
  final Color background;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return OriginalDashedSurface(
      backgroundColor: background,
      borderColor: color,
      shadowColor: color.withValues(alpha: 0.24),
      shadowDepth: 4,
      radius: 16,
      strokeWidth: 2.5,
      padding: const EdgeInsets.fromLTRB(5, 9, 5, 10),
      child: Column(
        children: [
          Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 4),
          Icon(icon, color: color, size: 21),
          const SizedBox(height: 2),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              value,
              style: TextStyle(
                color: color,
                fontSize: 20,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

String _formatReviewDuration(Duration duration) {
  final seconds = duration.inSeconds.clamp(0, 99 * 60 + 59);
  final minutes = seconds ~/ 60;
  final remainder = (seconds % 60).toString().padLeft(2, '0');
  return '$minutes:$remainder';
}

/// Keeps the celebration colour stable for the whole Hong Kong calendar day.
/// The animation is pre-coloured in the asset, so its movement stays exactly
/// the same while the body and limbs get a different weekday palette.
String successMonsterAssetForToday({DateTime? now}) {
  final hongKongNow =
      (now ?? DateTime.now()).toUtc().add(const Duration(hours: 8));
  return successMonsterAssetForWeekday(hongKongNow.weekday);
}

String successMonsterAssetForWeekday(int weekday) {
  const weekdays = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];
  final index = (weekday - 1).clamp(0, weekdays.length - 1).toInt();
  return 'assets/lottie/monsters/cute-monster-${weekdays[index]}.json';
}
