import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

import '../../core/app_palette.dart';
import '../../core/app_sfx.dart';
import '../../core/widgets/stationery_frame.dart';
import '../auth/student_auth_controller.dart';
import 'critter_avatar.dart';

typedef StudentProfileCompletion = Future<bool> Function({
  required String displayName,
  required String avatarSeed,
  required String avatarBackground,
  Map<String, String> avatarOptions,
});

bool get _animateWelcomeMonster => !WidgetsBinding.instance.runtimeType
    .toString()
    .contains('TestWidgetsFlutterBinding');

class StudentProfileSetupScreen extends StatefulWidget {
  const StudentProfileSetupScreen({
    required this.studentId,
    required this.onComplete,
    this.initialName = '',
    this.initialAvatarSeed = '',
    this.initialAvatarBackground = '',
    this.initialAvatarOptions = const <String, String>{},
    this.initialStep = 0,
    this.isSubmitting = false,
    this.message = '',
    super.key,
  });

  final String studentId;
  final String initialName;
  final String initialAvatarSeed;
  final String initialAvatarBackground;
  final Map<String, String> initialAvatarOptions;
  final int initialStep;
  final bool isSubmitting;
  final String message;
  final StudentProfileCompletion onComplete;

  @override
  State<StudentProfileSetupScreen> createState() =>
      _StudentProfileSetupScreenState();
}

class _StudentProfileSetupScreenState extends State<StudentProfileSetupScreen> {
  late final TextEditingController _nameController;
  late List<String> _seeds;
  late String _selectedSeed;
  late String _background;
  late Map<String, String> _options;
  final List<TextEditingController> _nameDialogControllers = [];
  late int _step;
  int _shuffleRound = 0;
  String _localMessage = '';

  static const _defaultOptions = <String, String>{
    'top': 'horns',
    'body': 'dome',
    'pattern': 'none',
    'cheeks': 'none',
    'eyes': 'round',
    'mouth': 'smile',
    'bodyColor': '2f80ed',
    'accentColor': 'ffb703',
    'inkColor': '2d2521',
  };

  @override
  void initState() {
    super.initState();
    _step = widget.initialStep == 1 ? 1 : 0;
    final suggestedName = widget.initialName.trim() == widget.studentId.trim()
        ? ''
        : widget.initialName;
    _nameController = TextEditingController(text: suggestedName);
    _background =
        studentAvatarBackgrounds.contains(widget.initialAvatarBackground)
            ? widget.initialAvatarBackground
            : studentAvatarBackgrounds.first;
    _options = {..._defaultOptions, ...widget.initialAvatarOptions};
    _seeds = _makeSeeds();
    _selectedSeed = widget.initialAvatarSeed.isNotEmpty
        ? widget.initialAvatarSeed
        : _seeds.first;
    if (!_seeds.contains(_selectedSeed)) {
      _seeds = [_selectedSeed, ..._seeds.take(5)];
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    for (final controller in _nameDialogControllers) {
      controller.dispose();
    }
    super.dispose();
  }

  List<String> _makeSeeds() {
    final identity = widget.studentId
        .trim()
        .toLowerCase()
        .replaceAll(RegExp(r'[^a-z0-9_-]'), '-');
    final nonce = DateTime.now().microsecondsSinceEpoch.toRadixString(36);
    return List.generate(
      6,
      (index) =>
          'critter-${identity.isEmpty ? 'buddy' : identity}-$nonce-$_shuffleRound-$index',
      growable: false,
    );
  }

  void _shuffle({bool all = false}) {
    AppSfx.instance.play(SfxCue.click);
    final random = math.Random(DateTime.now().microsecondsSinceEpoch);
    setState(() {
      _shuffleRound += 1;
      _seeds = _makeSeeds();
      _selectedSeed = _seeds.first;
      if (all) {
        _options = {
          ..._options,
          'top': _pick(
              critterTopOptions.keys.where((key) => key != 'none'), random),
          'body': _pick(critterBodyOptions.keys, random),
          'pattern': _pick(critterPatternOptions.keys, random),
          'cheeks': _pick(critterCheekOptions.keys, random),
          'eyes': _pick(critterEyeOptions.keys, random),
          'mouth': _pick(critterMouthOptions.keys, random),
          'bodyColor': _pick(critterBodyColors.keys, random),
          'accentColor': _pick(critterAccentColors.keys, random),
          'inkColor': _pick(critterInkColors.keys, random),
        };
        _background = _pick(studentAvatarBackgrounds, random);
      }
    });
  }

  String _pick(Iterable<String> values, math.Random random) {
    final list = values.toList(growable: false);
    return list[random.nextInt(list.length)];
  }

  void _nextStep() {
    final name = normalizeStudentDisplayName(_nameController.text);
    if (!isValidStudentDisplayName(name)) {
      setState(() => _localMessage = '請先輸入 2 至 20 個字嘅名稱。');
      return;
    }
    AppSfx.instance.play(SfxCue.click);
    FocusManager.instance.primaryFocus?.unfocus();
    setState(() {
      _localMessage = '';
      _step = 1;
    });
  }

  void _previousStep() {
    AppSfx.instance.play(SfxCue.click);
    setState(() {
      _localMessage = '';
      _step = 0;
    });
  }

  Future<void> _submit() async {
    if (widget.isSubmitting) return;
    final name = normalizeStudentDisplayName(_nameController.text);
    if (!isValidStudentDisplayName(name)) {
      setState(() => _localMessage = '請輸入 2 至 20 個字嘅名稱。');
      return;
    }
    FocusManager.instance.primaryFocus?.unfocus();
    AppSfx.instance.play(SfxCue.click);
    setState(() => _localMessage = '');
    await widget.onComplete(
      displayName: name,
      avatarSeed: _selectedSeed,
      avatarBackground: _background,
      avatarOptions: Map.unmodifiable(_options),
    );
  }

  Future<void> _editName() async {
    final controller = TextEditingController(text: _nameController.text);
    _nameDialogControllers.add(controller);
    final name = await showDialog<String>(
      context: context,
      builder: (dialogContext) => Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.symmetric(horizontal: 26),
        child: OriginalDashedSurface(
          backgroundColor: AppPalette.softPrimary,
          borderColor: AppPalette.primary,
          shadowColor: const Color(0xFFBDE0E1),
          shadowDepth: 5,
          radius: 22,
          strokeWidth: 3,
          padding: const EdgeInsets.fromLTRB(18, 16, 18, 14),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                '改名',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: AppPalette.primaryDark,
                  fontSize: 21,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                key: const Key('profile-edit-name-field'),
                controller: controller,
                autofocus: true,
                maxLength: 20,
                textInputAction: TextInputAction.done,
                decoration: const InputDecoration(
                  hintText: '輸入你想用嘅名稱',
                  counterText: '',
                  filled: true,
                  fillColor: Colors.white,
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.all(Radius.circular(14)),
                    borderSide: BorderSide(color: AppPalette.primary, width: 2),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.all(Radius.circular(14)),
                    borderSide: BorderSide(
                      color: AppPalette.primaryDark,
                      width: 2.5,
                    ),
                  ),
                ),
                onSubmitted: (_) =>
                    Navigator.of(dialogContext).pop(controller.text),
              ),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () => Navigator.of(dialogContext).pop(),
                    child: const Text(
                      '取消',
                      style: TextStyle(fontWeight: FontWeight.w900),
                    ),
                  ),
                  const SizedBox(width: 8),
                  OriginalDashedSurface(
                    backgroundColor: AppPalette.secondary,
                    borderColor: AppPalette.secondaryDark,
                    radius: 14,
                    strokeWidth: 2,
                    shadowColor: const Color(0xFFE0B84F),
                    shadowDepth: 3,
                    child: TextButton(
                      onPressed: () =>
                          Navigator.of(dialogContext).pop(controller.text),
                      child: const Text(
                        '確認',
                        style: TextStyle(
                          color: AppPalette.ink,
                          fontWeight: FontWeight.w900,
                        ),
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
    if (!mounted || name == null) return;
    final normalized = normalizeStudentDisplayName(name);
    if (!isValidStudentDisplayName(normalized)) {
      setState(() => _localMessage = '請輸入 2 至 20 個字嘅名稱。');
      return;
    }
    setState(() => _nameController.text = normalized);
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;
    return Scaffold(
      backgroundColor: AppPalette.background,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final compact = constraints.maxHeight < 700;
            return AnimatedSwitcher(
              duration: const Duration(milliseconds: 420),
              switchInCurve: Curves.easeOutCubic,
              switchOutCurve: Curves.easeInCubic,
              transitionBuilder: (child, animation) {
                final direction = child.key == const ValueKey(1) ? 1.0 : -1.0;
                return FadeTransition(
                  opacity: animation,
                  child: SlideTransition(
                    position: Tween<Offset>(
                      begin: Offset(direction, 0),
                      end: Offset.zero,
                    ).animate(animation),
                    child: child,
                  ),
                );
              },
              child: _step == 0
                  ? _buildNameStep(context, compact, bottomInset)
                  : _buildAvatarStep(context, compact, bottomInset),
            );
          },
        ),
      ),
    );
  }

  Widget _buildNameStep(
      BuildContext context, bool compact, double bottomInset) {
    final screenHeight = MediaQuery.sizeOf(context).height;
    final monsterHeight =
        compact ? 258.0 : math.min(360.0, math.max(300.0, screenHeight * 0.46));
    return SingleChildScrollView(
      key: const ValueKey(0),
      padding: EdgeInsets.fromLTRB(18, 10, 18, math.max(8, bottomInset)),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 520),
          child: SizedBox(
            height: math.max(
              compact ? 560 : 700,
              screenHeight - bottomInset - 10,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.max,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                SizedBox(height: compact ? 18 : 34),
                const Text(
                  'Hello, A1 Buddy!',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: AppPalette.ink,
                    fontWeight: FontWeight.w900,
                    fontSize: 30,
                  ),
                ),
                const SizedBox(height: 5),
                const Text(
                  '歡迎成為A1一份子',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: AppPalette.muted,
                    fontWeight: FontWeight.w700,
                    fontSize: 15,
                  ),
                ),
                SizedBox(height: compact ? 14 : 22),
                TextField(
                  key: const Key('profile-name-field'),
                  controller: _nameController,
                  maxLength: 20,
                  textAlign: TextAlign.center,
                  textInputAction: TextInputAction.done,
                  onSubmitted: (_) => _nextStep(),
                  decoration: InputDecoration(
                    labelText: '你想我哋點稱呼你？',
                    hintText: '例如：小明 / Cherry',
                    counterText: '',
                    filled: true,
                    fillColor: AppPalette.paper,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(
                        color: AppPalette.primary,
                        width: 2,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(
                        color: AppPalette.primaryDark,
                        width: 2,
                      ),
                    ),
                  ),
                ),
                const Spacer(),
                if (_localMessage.isNotEmpty || widget.message.isNotEmpty)
                  _buildMessage(),
                _primaryButton(
                  key: const Key('profile-name-next'),
                  label: '確認',
                  icon: Icons.check_rounded,
                  onPressed: _nextStep,
                ),
                const SizedBox(height: 2),
                SizedBox(
                  height: monsterHeight,
                  child: Lottie.asset(
                    'assets/lottie/monsters/monster-blue.json',
                    key: const Key('profile-welcome-monster'),
                    animate: _animateWelcomeMonster,
                    repeat: true,
                    fit: BoxFit.contain,
                    options: LottieOptions(enableMergePaths: true),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAvatarStep(
      BuildContext context, bool compact, double bottomInset) {
    final screenHeight = MediaQuery.sizeOf(context).height;
    final previewHeight = compact
        ? math.min(300.0, screenHeight * 0.48)
        : math.min(390.0, screenHeight * 0.48);
    return ColoredBox(
      key: const ValueKey(1),
      color: AppPalette.softPrimary,
      child: Column(
        children: [
          SizedBox(
            height: previewHeight,
            child: _buildPreviewStage(compact),
          ),
          Expanded(child: _buildAvatarEditorSheet()),
        ],
      ),
    );
  }

  Widget _buildPreviewStage(bool compact) {
    return Stack(
      fit: StackFit.expand,
      children: [
        DecoratedBox(
          decoration: BoxDecoration(
            color: AppPalette.softPrimary,
            border: Border(
              bottom: BorderSide(
                color: AppPalette.primary.withValues(alpha: 0.28),
                width: 2,
              ),
            ),
          ),
        ),
        if (widget.initialStep != 1)
          Positioned(
            top: 6,
            left: 6,
            child: IconButton(
              key: const Key('profile-setup-back'),
              onPressed: _previousStep,
              tooltip: '返回',
              icon: const Icon(Icons.arrow_back_rounded),
              color: AppPalette.ink,
            ),
          ),
        Positioned(
          top: 6,
          right: 6,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                key: const Key('profile-avatar-shuffle-all'),
                onPressed: () => _shuffle(all: true),
                tooltip: '隨機',
                icon: const Icon(Icons.auto_awesome_rounded),
                color: AppPalette.primaryDark,
              ),
              _saveIconButton(),
            ],
          ),
        ),
        Positioned(
          top: 50,
          left: 54,
          right: 54,
          child: Text(
            '${normalizeStudentDisplayName(_nameController.text)}！運用你的想像力來設計頭像吧！',
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: AppPalette.ink,
              fontWeight: FontWeight.w900,
              fontSize: 14,
              height: 1.2,
            ),
          ),
        ),
        Align(
          alignment: const Alignment(0, 0.28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CritterAvatar(
                key: const Key('profile-avatar-preview'),
                seed: _selectedSeed,
                background: _background,
                options: _options,
                size: compact ? 172 : 226,
                borderColor: Colors.white,
                borderWidth: 6,
              ),
              if (widget.initialStep == 1) _nameEditPill(),
            ],
          ),
        ),
      ],
    );
  }

  Widget _nameEditPill() {
    return Padding(
      padding: const EdgeInsets.only(top: 10),
      child: Material(
        color: AppPalette.softPrimary,
        // ignore: prefer_const_constructors
        shape: StadiumBorder(
          side: const BorderSide(color: AppPalette.primary, width: 2),
        ),
        elevation: 2,
        shadowColor: const Color(0x664ECDC4),
        child: InkWell(
          key: const Key('profile-edit-name'),
          onTap: _editName,
          borderRadius: BorderRadius.circular(999),
          child: const Padding(
            padding: EdgeInsets.symmetric(horizontal: 17, vertical: 8),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.edit_rounded,
                    size: 17, color: AppPalette.primaryDark),
                SizedBox(width: 6),
                Text(
                  '更改名稱',
                  style: TextStyle(
                    color: AppPalette.primaryDark,
                    fontWeight: FontWeight.w900,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _saveIconButton() {
    return Semantics(
      button: true,
      label: '儲存',
      child: IconButton(
        key: const Key('profile-setup-submit'),
        onPressed: widget.isSubmitting ? null : _submit,
        tooltip: '儲存',
        icon: widget.isSubmitting
            ? const SizedBox.square(
                dimension: 22,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : const Icon(Icons.check_circle_rounded),
        color: AppPalette.primaryDark,
      ),
    );
  }

  Widget _buildAvatarEditorSheet() {
    return Container(
      decoration: const BoxDecoration(
        color: AppPalette.paper,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        boxShadow: [
          BoxShadow(
            color: Color(0x1F4ECDC4),
            blurRadius: 14,
            offset: Offset(0, -4),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            margin: const EdgeInsets.only(top: 9, bottom: 5),
            width: 42,
            height: 4,
            decoration: BoxDecoration(
              color: AppPalette.border,
              borderRadius: BorderRadius.circular(99),
            ),
          ),
          _buildCategoryBar(),
          const Divider(height: 1, color: AppPalette.border),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(14, 14, 14, 20),
              child: _buildCategoryContent(),
            ),
          ),
        ],
      ),
    );
  }

  static const _categoryKeys = [
    'top',
    'body',
    'pattern',
    'cheeks',
    'eyes',
    'mouth',
    'colours',
  ];

  static const _categoryLabels = ['頭', '身', '紋', '面', '眼', '口', '色'];
  static const _categoryIcons = [
    Icons.auto_awesome_rounded,
    Icons.circle_outlined,
    Icons.texture_rounded,
    Icons.face_retouching_natural_rounded,
    Icons.visibility_rounded,
    Icons.sentiment_satisfied_alt_rounded,
    Icons.palette_outlined,
  ];
  int _categoryIndex = 0;

  Widget _buildCategoryBar() {
    return SizedBox(
      height: 58,
      child: Row(
        children: [
          IconButton(
            key: const Key('profile-avatar-category-previous'),
            onPressed: _categoryIndex == 0
                ? null
                : () => setState(() => _categoryIndex -= 1),
            tooltip: '上一類',
            icon: const Icon(Icons.chevron_left_rounded),
          ),
          Expanded(
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  for (var index = 0; index < _categoryLabels.length; index++)
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: InkWell(
                        key: Key(
                            'profile-avatar-category-${_categoryKeys[index]}'),
                        borderRadius: BorderRadius.circular(12),
                        onTap: () => setState(() => _categoryIndex = index),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 180),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 11,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: _categoryIndex == index
                                ? AppPalette.softPrimary
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                            border: Border(
                              bottom: BorderSide(
                                color: _categoryIndex == index
                                    ? AppPalette.primary
                                    : Colors.transparent,
                                width: 3,
                              ),
                            ),
                          ),
                          child: Icon(
                            _categoryIcons[index],
                            size: 20,
                            color: _categoryIndex == index
                                ? AppPalette.primaryDark
                                : AppPalette.muted,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
          IconButton(
            key: const Key('profile-avatar-category-next'),
            onPressed: _categoryIndex == _categoryLabels.length - 1
                ? null
                : () => setState(() => _categoryIndex += 1),
            tooltip: '下一類',
            icon: const Icon(Icons.chevron_right_rounded),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryContent() {
    final category = _categoryKeys[_categoryIndex];
    if (category == 'colours') return _buildColourContent();
    final options = switch (category) {
      'top' => critterTopOptions,
      'body' => critterBodyOptions,
      'pattern' => critterPatternOptions,
      'cheeks' => critterCheekOptions,
      'eyes' => critterEyeOptions,
      _ => critterMouthOptions,
    };
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: options.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 1,
      ),
      itemBuilder: (context, index) {
        final entry = options.entries.elementAt(index);
        final tileOptions = {..._options, category: entry.key};
        return InkWell(
          key: Key('profile-avatar-$category-${entry.key}'),
          borderRadius: BorderRadius.circular(16),
          onTap: () => _selectOption(category, entry.key),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 160),
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: _options[category] == entry.key
                  ? AppPalette.softPrimary
                  : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: _options[category] == entry.key
                  ? Border.all(color: AppPalette.primaryDark, width: 3)
                  : null,
            ),
            child: Center(
              child: CritterAvatar(
                seed: 'preview-$category-${entry.key}',
                background: _background,
                options: tileOptions,
                size: 88,
                animate: false,
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildColourContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSwatchRow('身體', 'bodyColor', critterBodyColors),
        _buildSwatchRow('配色', 'accentColor', critterAccentColors),
        _buildSwatchRow('表情', 'inkColor', critterInkColors),
        _buildSwatchRow(
          '背景',
          'background',
          <String, String>{
            for (final color in studentAvatarBackgrounds) color: color,
          },
        ),
      ],
    );
  }

  Widget _buildSwatchRow(
    String label,
    String optionKey,
    Map<String, String> colors,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: AppPalette.ink,
              fontWeight: FontWeight.w900,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 9),
          Wrap(
            spacing: 12,
            runSpacing: 10,
            children: [
              for (final entry in colors.entries)
                Tooltip(
                  message: optionKey == 'background'
                      ? '背景'
                      : (entry.value == entry.key ? '背景' : entry.value),
                  child: InkWell(
                    key: Key(
                      optionKey == 'background'
                          ? 'profile-avatar-color-${entry.key}'
                          : 'profile-avatar-color-option-${entry.key}',
                    ),
                    customBorder: const CircleBorder(),
                    onTap: () {
                      AppSfx.instance.play(SfxCue.click);
                      if (optionKey == 'background') {
                        setState(() => _background = entry.key);
                      } else {
                        _selectOption(optionKey, entry.key);
                      }
                    },
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 160),
                      width: 39,
                      height: 39,
                      decoration: BoxDecoration(
                        color: Color(int.parse('FF${entry.key}', radix: 16)),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: _isColourSelected(optionKey, entry.key)
                              ? AppPalette.ink
                              : Colors.white,
                          width:
                              _isColourSelected(optionKey, entry.key) ? 3 : 2,
                        ),
                        boxShadow: const [
                          BoxShadow(color: AppPalette.border, blurRadius: 1),
                        ],
                      ),
                      child: _isColourSelected(optionKey, entry.key)
                          ? const Icon(
                              Icons.check_rounded,
                              size: 19,
                              color: AppPalette.ink,
                            )
                          : null,
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  bool _isColourSelected(String optionKey, String value) =>
      optionKey == 'background'
          ? _background == value
          : _options[optionKey] == value;

  void _selectOption(String key, String value) {
    AppSfx.instance.play(SfxCue.click);
    // Keep the map immutable between renders so CritterAvatar can detect an
    // option change and rebuild its split body/eyes SVG layers immediately.
    setState(() => _options = {..._options, key: value});
  }

  Widget _buildMessage() {
    return Padding(
      padding: const EdgeInsets.only(top: 10, bottom: 4),
      child: Text(
        _localMessage.isNotEmpty ? _localMessage : widget.message,
        textAlign: TextAlign.center,
        style: const TextStyle(
          color: AppPalette.dangerDark,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }

  Widget _primaryButton({
    required Key key,
    required String label,
    required IconData icon,
    required VoidCallback? onPressed,
    bool busy = false,
  }) {
    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: OriginalDashedSurface(
        borderColor: AppPalette.primaryDark,
        backgroundColor: AppPalette.secondary,
        radius: 18,
        child: SizedBox(
          height: 54,
          child: TextButton.icon(
            key: key,
            onPressed: onPressed,
            icon: busy
                ? const SizedBox.square(
                    dimension: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : Icon(icon),
            label: Text(
              label,
              style: const TextStyle(
                color: AppPalette.ink,
                fontWeight: FontWeight.w900,
                fontSize: 16,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
