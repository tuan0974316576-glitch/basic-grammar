import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../app_palette.dart';
import 'stationery_frame.dart';

/// Shared shell for the three original Basic Grammar Game sections.
///
/// The web version uses one `.screen` rule for Grammar, Vocabulary, and Scan.
/// Keeping that geometry here prevents the frame and header controls from
/// moving when the bottom tabs change the active section.
class OriginalSectionFrame extends StatelessWidget {
  const OriginalSectionFrame({
    required this.sectionKey,
    required this.eyebrow,
    required this.title,
    required this.child,
    this.onSettings,
    this.settingsKey,
    this.settingsActive = false,
    this.trailing,
    super.key,
  });

  final Key sectionKey;
  final String eyebrow;
  final String title;
  final Widget child;
  final VoidCallback? onSettings;
  final Key? settingsKey;
  final bool settingsActive;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: LayoutBuilder(
        builder: (context, constraints) {
          final compact = constraints.maxWidth <= 720;
          final outerPadding = compact
              ? const EdgeInsets.all(14)
              : const EdgeInsets.fromLTRB(20, 24, 20, 24);
          final availableHeight =
              math.max(0.0, constraints.maxHeight - outerPadding.vertical);
          final frameHeight =
              compact ? availableHeight : math.min(720.0, availableHeight);
          final frameWidth = math.min(
            850.0,
            math.max(0.0, constraints.maxWidth - outerPadding.horizontal),
          );

          return Padding(
            padding: outerPadding,
            child: Center(
              child: SizedBox(
                width: frameWidth,
                height: frameHeight,
                child: StationeryFrame(
                  key: sectionKey,
                  padding: EdgeInsets.zero,
                  radius: compact ? 24 : 30,
                  ringWidth: 6,
                  shadowDepth: compact ? 6 : 10,
                  child: Column(
                    children: [
                      _OriginalSectionHeader(
                        compact: compact,
                        eyebrow: eyebrow,
                        title: title,
                        onSettings: onSettings,
                        settingsKey: settingsKey,
                        settingsActive: settingsActive,
                        trailing: trailing,
                      ),
                      Expanded(
                        child: Padding(
                          padding: EdgeInsets.fromLTRB(
                            compact ? 16 : 32,
                            compact ? 4 : 8,
                            compact ? 16 : 32,
                            compact ? 22 : 30,
                          ),
                          child: LayoutBuilder(
                            builder: (context, contentConstraints) {
                              return Align(
                                alignment: Alignment.topCenter,
                                child: SizedBox(
                                  width: math.min(
                                    560,
                                    contentConstraints.maxWidth,
                                  ),
                                  height: contentConstraints.maxHeight,
                                  child: child,
                                ),
                              );
                            },
                          ),
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

class _OriginalSectionHeader extends StatelessWidget {
  const _OriginalSectionHeader({
    required this.compact,
    required this.eyebrow,
    required this.title,
    required this.onSettings,
    required this.settingsKey,
    required this.settingsActive,
    required this.trailing,
  });

  final bool compact;
  final String eyebrow;
  final String title;
  final VoidCallback? onSettings;
  final Key? settingsKey;
  final bool settingsActive;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final inset = compact ? 10.0 : 14.0;
    final controlSize = compact ? 48.0 : 58.0;
    return SizedBox(
      key: const Key('original-section-header'),
      height: compact ? 82 : 100,
      child: Stack(
        fit: StackFit.expand,
        children: [
          Padding(
            padding: EdgeInsets.fromLTRB(
              controlSize + inset + 8,
              compact ? 15 : 23,
              controlSize + inset + 8,
              0,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  eyebrow.toUpperCase(),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: AppPalette.primaryDark,
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.4,
                  ),
                ),
                SizedBox(height: compact ? 5 : 8),
                Expanded(
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    alignment: Alignment.topCenter,
                    child: Text(
                      title,
                      maxLines: 1,
                      style: TextStyle(
                        color: AppPalette.primaryDark,
                        fontSize: compact ? 28 : 40,
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
                  ),
                ),
              ],
            ),
          ),
          if (onSettings != null)
            Positioned(
              left: inset,
              top: inset,
              child: OriginalSettingsSeal(
                key: settingsKey,
                compact: compact,
                active: settingsActive,
                onPressed: onSettings!,
              ),
            ),
          if (trailing != null)
            Positioned(
              right: compact ? 12 : 18,
              top: compact ? 12 : 18,
              child: trailing!,
            ),
        ],
      ),
    );
  }
}

class OriginalSettingsSeal extends StatelessWidget {
  const OriginalSettingsSeal({
    required this.compact,
    required this.active,
    required this.onPressed,
    super.key,
  });

  final bool compact;
  final bool active;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final size = compact ? 48.0 : 58.0;
    return Semantics(
      button: true,
      label: '設定',
      child: Material(
        color: Colors.transparent,
        shape: const CircleBorder(),
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: onPressed,
          child: Container(
            width: size,
            height: size,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              border: Border.all(
                color: AppPalette.primary,
                width: compact ? 4 : 5,
              ),
              boxShadow: [
                const BoxShadow(
                  color: AppPalette.primaryDark,
                  offset: Offset(0, 5),
                ),
                BoxShadow(
                  color: AppPalette.primary.withValues(alpha: 0.2),
                  offset: const Offset(0, 8),
                  blurRadius: 14,
                ),
              ],
            ),
            child: AnimatedRotation(
              key: const Key('settings-icon-rotation'),
              turns: active ? 145 / 360 : 0,
              duration: const Duration(milliseconds: 420),
              curve: const Cubic(0.2, 0.9, 0.25, 1.0),
              child: Image.asset(
                'assets/setting-2.png',
                width: compact ? 27 : 33,
                height: compact ? 27 : 33,
                fit: BoxFit.contain,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
