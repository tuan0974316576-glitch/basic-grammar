import 'package:flutter/material.dart';

import '../../core/app_brand.dart';
import '../../core/app_palette.dart';
import '../../core/app_sfx.dart';
import '../../core/widgets/stationery_frame.dart';
import '../econ/econ_palette.dart';

enum GameSubject { eng, econ }

enum EnglishGameMode { grammar, review, workshop }

enum EconGameMode { learn, topics, year }

class SubjectSwitcher extends StatelessWidget {
  const SubjectSwitcher({
    required this.subject,
    required this.onChanged,
    super.key,
  });

  final GameSubject subject;
  final ValueChanged<GameSubject> onChanged;

  @override
  Widget build(BuildContext context) {
    final isEcon = subject == GameSubject.econ;
    return PopupMenuButton<GameSubject>(
      key: const Key('subject-switcher'),
      tooltip: '切換科目',
      onSelected: onChanged,
      offset: const Offset(0, 46),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: AppPalette.paper,
      itemBuilder: (context) => [
        const PopupMenuItem(
          value: GameSubject.eng,
          child: _SubjectMenuRow(subject: GameSubject.eng),
        ),
        const PopupMenuItem(
          value: GameSubject.econ,
          child: _SubjectMenuRow(subject: GameSubject.econ),
        ),
      ],
      child: Container(
        width: 72,
        height: 44,
        padding: const EdgeInsets.only(left: 22, right: 8),
        decoration: BoxDecoration(
          color: isEcon ? EconPalette.softPrimary : AppPalette.softPrimary,
          border: Border.all(
            color: isEcon ? EconPalette.primaryDark : AppPalette.primary,
            width: 3,
          ),
          borderRadius: const BorderRadius.horizontal(
            right: Radius.circular(22),
          ),
          boxShadow: [
            BoxShadow(
              color: isEcon ? EconPalette.primaryDark : AppPalette.primaryDark,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: FittedBox(
          fit: BoxFit.scaleDown,
          alignment: Alignment.centerRight,
          child: _SubjectBadge(subject: subject, compact: true),
        ),
      ),
    );
  }
}

class _SubjectMenuRow extends StatelessWidget {
  const _SubjectMenuRow({required this.subject});

  final GameSubject subject;

  @override
  Widget build(BuildContext context) {
    final isEcon = subject == GameSubject.econ;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        _SubjectBadge(subject: subject),
        const SizedBox(width: 10),
        Text(
          isEcon ? 'ECONOMICS' : 'ENGLISH',
          style: TextStyle(
            color: isEcon ? EconPalette.primaryDark : AppPalette.primaryDark,
            fontSize: 15,
            fontWeight: FontWeight.w900,
          ),
        ),
      ],
    );
  }
}

class _SubjectBadge extends StatelessWidget {
  const _SubjectBadge({required this.subject, this.compact = false});

  final GameSubject subject;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    if (subject == GameSubject.eng) {
      return Image.asset(
        'assets/branding/united-kingdom.png',
        width: compact ? 30 : 34,
        height: compact ? 30 : 34,
        fit: BoxFit.contain,
      );
    }
    return Image.asset(
      'assets/branding/dollar.png',
      width: compact ? 30 : 34,
      height: compact ? 30 : 34,
      fit: BoxFit.contain,
    );
  }
}

/// The first screen inside A1 BUDDY's game area.
///
/// Keeping subject and mode selection here gives the future ECON migration a
/// stable entry point while the existing ENG screens continue to own their
/// current state and repositories.
class GameHubScreen extends StatelessWidget {
  const GameHubScreen({
    required this.subject,
    required this.onSubjectChanged,
    required this.onEnglishMode,
    required this.onEconMode,
    required this.onSettings,
    this.settingsActive = false,
    super.key,
  });

  final GameSubject subject;
  final ValueChanged<GameSubject> onSubjectChanged;
  final ValueChanged<EnglishGameMode> onEnglishMode;
  final ValueChanged<EconGameMode> onEconMode;
  final VoidCallback onSettings;
  final bool settingsActive;

  @override
  Widget build(BuildContext context) {
    final viewport = MediaQuery.sizeOf(context);
    final compact = viewport.width <= 720 || viewport.height <= 700;
    final modes = subject == GameSubject.eng
        ? <_GameModeItem>[
            _GameModeItem(
              title: '文法',
              subtitle: 'Grammar',
              icon: Icons.menu_book_rounded,
              color: AppPalette.primary,
              darkColor: AppPalette.primaryDark,
              onTap: () => onEnglishMode(EnglishGameMode.grammar),
            ),
            _GameModeItem(
              title: '重溫',
              subtitle: 'Review',
              icon: Icons.replay_rounded,
              color: EconPalette.primary,
              darkColor: EconPalette.primaryDark,
              onTap: () => onEnglishMode(EnglishGameMode.review),
            ),
            _GameModeItem(
              title: '研修',
              subtitle: 'Workshop',
              icon: Icons.build_rounded,
              color: AppPalette.pink,
              darkColor: const Color(0xFFD45483),
              onTap: () => onEnglishMode(EnglishGameMode.workshop),
            ),
          ]
        : <_GameModeItem>[
            _GameModeItem(
              title: '學習',
              subtitle: '基本概念重溫',
              icon: Icons.lightbulb_rounded,
              color: AppPalette.secondary,
              darkColor: AppPalette.secondaryDark,
              onTap: () => onEconMode(EconGameMode.learn),
            ),
            _GameModeItem(
              title: '逐課操',
              subtitle: 'By Topics',
              icon: Icons.grid_view_rounded,
              color: const Color(0xFFFFC857),
              darkColor: const Color(0xFFB96A00),
              onTap: () => onEconMode(EconGameMode.topics),
            ),
            _GameModeItem(
              title: '逐份操',
              subtitle: 'By Year',
              icon: Icons.description_rounded,
              color: AppPalette.purple,
              darkColor: const Color(0xFF625BC5),
              onTap: () => onEconMode(EconGameMode.year),
            ),
          ];

    return SafeArea(
      child: LayoutBuilder(
        builder: (context, constraints) {
          final outerPadding = compact
              ? const EdgeInsets.all(14)
              : const EdgeInsets.fromLTRB(20, 24, 20, 24);
          final frameWidth = constraints.maxWidth > 0
              ? constraints.maxWidth - outerPadding.horizontal
              : 0.0;
          final frameHeight = constraints.maxHeight > 0
              ? constraints.maxHeight - outerPadding.vertical
              : 0.0;

          return Padding(
            padding: outerPadding,
            child: Center(
              child: SizedBox(
                width: frameWidth.clamp(0, 850),
                height: frameHeight,
                child: StationeryFrame(
                  padding: EdgeInsets.fromLTRB(
                    compact ? 16 : 30,
                    compact ? 14 : 24,
                    compact ? 16 : 30,
                    compact ? 20 : 28,
                  ),
                  radius: compact ? 24 : 30,
                  ringWidth: 6,
                  shadowDepth: compact ? 6 : 10,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      _HubHeader(
                        compact: compact,
                        subject: subject,
                        onSettings: onSettings,
                        settingsActive: settingsActive,
                      ),
                      SizedBox(height: compact ? 18 : 24),
                      _SubjectSelector(
                        subject: subject,
                        onChanged: onSubjectChanged,
                      ),
                      SizedBox(height: compact ? 22 : 30),
                      Text(
                        subject == GameSubject.eng ? 'ENGLISH' : 'ECON',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: subject == GameSubject.eng
                              ? AppPalette.primaryDark
                              : const Color(0xFF8A5B00),
                          fontSize: compact ? 25 : 31,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.4,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '選擇模式',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: AppPalette.muted,
                          fontSize: compact ? 15 : 17,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      SizedBox(height: compact ? 18 : 24),
                      Expanded(
                        child: ListView.separated(
                          key: const Key('game-hub-mode-list'),
                          physics: const BouncingScrollPhysics(),
                          itemCount: modes.length,
                          separatorBuilder: (_, __) =>
                              SizedBox(height: compact ? 12 : 16),
                          itemBuilder: (context, index) => _GameModeButton(
                            item: modes[index],
                            compact: compact,
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),
                      Text(
                        'A1 BUDDY',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: AppPalette.border,
                          fontSize: compact ? 12 : 13,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.8,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _HubHeader extends StatelessWidget {
  const _HubHeader({
    required this.compact,
    required this.subject,
    required this.onSettings,
    required this.settingsActive,
  });

  final bool compact;
  final GameSubject subject;
  final VoidCallback onSettings;
  final bool settingsActive;

  @override
  Widget build(BuildContext context) {
    final buttonSize = compact ? 48.0 : 56.0;
    final isEcon = subject == GameSubject.econ;
    final accent = isEcon ? EconPalette.primary : AppPalette.primary;
    final accentDark =
        isEcon ? EconPalette.primaryDark : AppPalette.primaryDark;
    final accentSoft = isEcon ? EconPalette.softPrimary : AppPalette.secondary;
    return SizedBox(
      height: compact ? 52 : 62,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  appProviderName,
                  style: TextStyle(
                    color: AppPalette.primaryDark,
                    fontSize: compact ? 12 : 14,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  'GAME',
                  style: TextStyle(
                    color: AppPalette.primaryDark,
                    fontSize: compact ? 27 : 35,
                    height: 1,
                    fontWeight: FontWeight.w900,
                    shadows: const [
                      Shadow(
                        color: AppPalette.softPrimary,
                        offset: Offset(2, 2),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Semantics(
            button: true,
            label: '設定',
            child: Material(
              color: Colors.transparent,
              shape: const CircleBorder(),
              child: InkWell(
                key: const Key('game-hub-settings'),
                customBorder: const CircleBorder(),
                onTap: onSettings,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  width: buttonSize,
                  height: buttonSize,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: settingsActive ? accentSoft : Colors.white,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: accent,
                      width: compact ? 4 : 5,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: accentDark,
                        offset: const Offset(0, 5),
                      ),
                    ],
                  ),
                  child: Icon(
                    Icons.settings_rounded,
                    color: accentDark,
                    size: compact ? 24 : 29,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SubjectSelector extends StatelessWidget {
  const _SubjectSelector({required this.subject, required this.onChanged});

  final GameSubject subject;
  final ValueChanged<GameSubject> onChanged;

  @override
  Widget build(BuildContext context) {
    return OriginalDashedSurface(
      key: const Key('game-hub-subject-selector'),
      padding: const EdgeInsets.all(6),
      backgroundColor: const Color(0xFFF8FBFB),
      borderColor: AppPalette.border,
      radius: 18,
      strokeWidth: 2,
      child: Row(
        children: [
          Expanded(
            child: _SubjectButton(
              subject: GameSubject.eng,
              selected: subject == GameSubject.eng,
              onTap: () => onChanged(GameSubject.eng),
            ),
          ),
          const SizedBox(width: 7),
          Expanded(
            child: _SubjectButton(
              subject: GameSubject.econ,
              selected: subject == GameSubject.econ,
              onTap: () => onChanged(GameSubject.econ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SubjectButton extends StatelessWidget {
  const _SubjectButton({
    required this.subject,
    required this.selected,
    required this.onTap,
  });

  final GameSubject subject;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isEng = subject == GameSubject.eng;
    final foreground = isEng ? AppPalette.primaryDark : EconPalette.primaryDark;
    return Semantics(
      button: true,
      selected: selected,
      label: isEng ? 'ENG' : 'ECON',
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          key: Key('game-hub-subject-${isEng ? 'ENG' : 'ECON'}'),
          borderRadius: BorderRadius.circular(14),
          onTap: onTap,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            height: 52,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: selected
                  ? (isEng ? AppPalette.softPrimary : EconPalette.softPrimary)
                  : Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: selected ? foreground : AppPalette.border,
                width: selected ? 2 : 1,
              ),
              boxShadow: selected
                  ? [
                      BoxShadow(
                        color: foreground.withValues(alpha: .35),
                        offset: const Offset(0, 3),
                      ),
                    ]
                  : null,
            ),
            child: Text(
              isEng ? 'ENG' : 'ECON',
              style: TextStyle(
                color: foreground,
                fontSize: 19,
                fontWeight: FontWeight.w900,
                letterSpacing: 1,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _GameModeItem {
  const _GameModeItem({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.darkColor,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final Color darkColor;
  final VoidCallback onTap;
}

class _GameModeButton extends StatefulWidget {
  const _GameModeButton({required this.item, required this.compact});

  final _GameModeItem item;
  final bool compact;

  @override
  State<_GameModeButton> createState() => _GameModeButtonState();
}

class _GameModeButtonState extends State<_GameModeButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final item = widget.item;
    return Semantics(
      button: true,
      label: item.title,
      child: GestureDetector(
        key: Key('game-hub-mode-${item.title}'),
        behavior: HitTestBehavior.opaque,
        onTapDown: (_) => setState(() => _pressed = true),
        onTapUp: (_) {
          setState(() => _pressed = false);
          AppSfx.instance.play(SfxCue.click);
          item.onTap();
        },
        onTapCancel: () => setState(() => _pressed = false),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 120),
          transform: Matrix4.translationValues(0, _pressed ? 4 : 0, 0),
          child: OriginalDashedSurface(
            backgroundColor: Colors.white,
            borderColor: item.color,
            shadowColor: _pressed
                ? Colors.transparent
                : item.darkColor.withValues(alpha: .35),
            shadowDepth: 5,
            blurRadius: 1,
            radius: 18,
            strokeWidth: 3,
            padding: EdgeInsets.symmetric(
              horizontal: widget.compact ? 14 : 20,
              vertical: widget.compact ? 12 : 16,
            ),
            child: Row(
              children: [
                Container(
                  width: widget.compact ? 52 : 60,
                  height: widget.compact ? 52 : 60,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: item.color.withValues(alpha: .25),
                    shape: BoxShape.circle,
                    border: Border.all(color: item.color, width: 2),
                  ),
                  child: Icon(
                    item.icon,
                    color: item.darkColor,
                    size: widget.compact ? 28 : 33,
                  ),
                ),
                SizedBox(width: widget.compact ? 13 : 17),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.title,
                        style: TextStyle(
                          color: const Color(0xFF444444),
                          fontSize: widget.compact ? 21 : 24,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        item.subtitle,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: AppPalette.muted,
                          fontSize: widget.compact ? 14 : 16,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.arrow_forward_rounded,
                  color: item.darkColor,
                  size: widget.compact ? 28 : 32,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class EconModePlaceholderScreen extends StatelessWidget {
  const EconModePlaceholderScreen({required this.mode, super.key});

  final EconGameMode mode;

  String get title => switch (mode) {
        EconGameMode.learn => '學習',
        EconGameMode.topics => '逐課操',
        EconGameMode.year => '逐份操',
      };

  String get subtitle => switch (mode) {
        EconGameMode.learn => '基本概念重溫',
        EconGameMode.topics => 'By Topics',
        EconGameMode.year => 'By Year',
      };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppPalette.background,
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 560),
              child: StationeryFrame(
                padding: const EdgeInsets.fromLTRB(22, 18, 22, 24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      children: [
                        IconButton(
                          tooltip: '返回',
                          onPressed: () => Navigator.of(context).pop(),
                          icon: const Icon(Icons.arrow_back_rounded),
                          color: AppPalette.primaryDark,
                        ),
                        Expanded(
                          child: Text(
                            'ECON  $title',
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: AppPalette.primaryDark,
                              fontSize: 25,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                        const SizedBox(width: 48),
                      ],
                    ),
                    const SizedBox(height: 24),
                    const Icon(
                      Icons.construction_rounded,
                      color: AppPalette.secondaryDark,
                      size: 58,
                    ),
                    const SizedBox(height: 14),
                    Text(
                      subtitle,
                      style: const TextStyle(
                        color: AppPalette.ink,
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'ECON 題庫正在接入 A1 BUDDY。',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: AppPalette.muted,
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 22),
                    FilledButton.icon(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: const Icon(Icons.home_rounded),
                      label: const Text('返回選科目'),
                      style: FilledButton.styleFrom(
                        backgroundColor: AppPalette.secondary,
                        foregroundColor: const Color(0xFF594512),
                        minimumSize: const Size.fromHeight(54),
                        shape: const StadiumBorder(
                          side: BorderSide(
                              color: AppPalette.secondaryDark, width: 2),
                        ),
                        textStyle: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class EconTabBar extends StatelessWidget {
  const EconTabBar(
      {required this.selectedIndex, required this.onSelected, super.key});

  final int selectedIndex;
  final ValueChanged<int> onSelected;

  static const tabs = [
    ('學', '學習'),
    ('課', '逐課操'),
    ('份', '逐份操'),
    ('榜', '排名'),
  ];

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      minimum: const EdgeInsets.fromLTRB(10, 0, 10, 10),
      child: SizedBox(
        height: 76,
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 620),
            child: StationeryFrame(
              padding: const EdgeInsets.all(8),
              borderColor: EconPalette.primary,
              shadowColor: const Color(0xFFFFE7A3),
              glowColor: EconPalette.primary,
              radius: 26,
              ringWidth: 0,
              shadowDepth: 8,
              child: Row(
                children: [
                  for (var index = 0; index < tabs.length; index++) ...[
                    if (index > 0) const SizedBox(width: 5),
                    Expanded(
                      child: _EconTabButton(
                        glyph: tabs[index].$1,
                        label: tabs[index].$2,
                        selected: selectedIndex == index,
                        onTap: () => onSelected(index),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _EconTabButton extends StatefulWidget {
  const _EconTabButton(
      {required this.glyph,
      required this.label,
      required this.selected,
      required this.onTap});

  final String glyph;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  State<_EconTabButton> createState() => _EconTabButtonState();
}

class _EconTabButtonState extends State<_EconTabButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      selected: widget.selected,
      label: widget.label,
      child: GestureDetector(
        key: Key('econ-tab-${widget.label}'),
        behavior: HitTestBehavior.opaque,
        onTapDown: (_) => setState(() => _pressed = true),
        onTapUp: (_) {
          setState(() => _pressed = false);
          widget.onTap();
        },
        onTapCancel: () => setState(() => _pressed = false),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 120),
          transform: Matrix4.translationValues(0, _pressed ? 4 : 0, 0),
          child: OriginalDashedSurface(
            backgroundColor: widget.selected
                ? EconPalette.highlight
                : const Color(0xFFF8FBFB),
            borderColor:
                widget.selected ? Colors.white : const Color(0xFFD9E5E7),
            shadowColor: _pressed
                ? Colors.transparent
                : widget.selected
                    ? EconPalette.primaryDark
                    : const Color(0xFFE8EEEE),
            shadowDepth: widget.selected ? 4 : 3,
            strokeWidth: 2,
            radius: 18,
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: SizedBox(
              height: 54,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 28,
                    height: 28,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: EconPalette.primary,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      widget.glyph,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Flexible(
                    child: Text(
                      widget.label,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: widget.selected
                            ? EconPalette.primaryDark
                            : EconPalette.ink,
                        fontSize: 13,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
