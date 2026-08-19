import 'package:flutter/material.dart';

import '../app_palette.dart';

class GameKeyboard extends StatelessWidget {
  const GameKeyboard({
    required this.onCharacter,
    required this.onBackspace,
    required this.onSubmit,
    this.submitEnabled = true,
    super.key,
  });

  final ValueChanged<String> onCharacter;
  final VoidCallback onBackspace;
  final VoidCallback onSubmit;
  final bool submitEnabled;

  static const _topRow = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
  static const _middleRow = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
  static const _bottomRow = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];

  static const _keyTones = [
    _KeyTone(Color(0xFFFFF6FB), Color(0xFFEDB0D1)),
    _KeyTone(Color(0xFFF6FFFD), Color(0xFF9FE7D7)),
    _KeyTone(Color(0xFFFFF9E6), Color(0xFFF6D26F)),
    _KeyTone(Color(0xFFF4F8FF), Color(0xFFB8CCEE)),
    _KeyTone(Color(0xFFFFF3EC), Color(0xFFF5BB9A)),
    _KeyTone(Color(0xFFF6F0FF), Color(0xFFD6BEF8)),
  ];

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final compact =
            constraints.maxWidth < 430 || constraints.maxHeight < 230;
        final keyHeight = compact ? 43.0 : 54.0;
        final gap = compact ? 5.0 : 7.0;
        return Align(
          alignment: Alignment.bottomCenter,
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 900),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _LetterRow(
                  letters: _topRow,
                  keyHeight: keyHeight,
                  gap: gap,
                  toneOffset: 0,
                  onCharacter: onCharacter,
                ),
                SizedBox(height: gap),
                FractionallySizedBox(
                  widthFactor: 0.92,
                  child: _LetterRow(
                    letters: _middleRow,
                    keyHeight: keyHeight,
                    gap: gap,
                    toneOffset: 10,
                    onCharacter: onCharacter,
                  ),
                ),
                SizedBox(height: gap),
                FractionallySizedBox(
                  widthFactor: 0.78,
                  child: _LetterRow(
                    letters: _bottomRow,
                    keyHeight: keyHeight,
                    gap: gap,
                    toneOffset: 19,
                    onCharacter: onCharacter,
                  ),
                ),
                SizedBox(height: gap),
                SizedBox(
                  height: keyHeight,
                  child: Row(
                    children: [
                      _ActionKey(
                        tooltip: '刪除',
                        icon: Icons.backspace_rounded,
                        onTap: onBackspace,
                      ),
                      SizedBox(width: gap),
                      _TextKey(
                        label: '-',
                        tone: _keyTones[2],
                        onTap: () => onCharacter('-'),
                      ),
                      SizedBox(width: gap),
                      Expanded(
                        flex: 5,
                        child: _TextKey(
                          label: 'SPACE',
                          tone: const _KeyTone(
                            Color(0xFFFFF9E6),
                            Color(0xFFF6D26F),
                          ),
                          onTap: () => onCharacter(' '),
                          isSpace: true,
                        ),
                      ),
                      SizedBox(width: gap),
                      _TextKey(
                        label: "'",
                        tone: _keyTones[5],
                        onTap: () => onCharacter("'"),
                      ),
                      SizedBox(width: gap),
                      _ActionKey(
                        key: const Key('game-keyboard-submit'),
                        tooltip: '確認',
                        icon: Icons.check_rounded,
                        onTap: submitEnabled ? onSubmit : null,
                        isSubmit: true,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _LetterRow extends StatelessWidget {
  const _LetterRow({
    required this.letters,
    required this.keyHeight,
    required this.gap,
    required this.toneOffset,
    required this.onCharacter,
  });

  final List<String> letters;
  final double keyHeight;
  final double gap;
  final int toneOffset;
  final ValueChanged<String> onCharacter;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: keyHeight,
      child: Row(
        children: [
          for (var index = 0; index < letters.length; index++) ...[
            if (index > 0) SizedBox(width: gap),
            Expanded(
              child: _TextKey(
                label: letters[index].toUpperCase(),
                tone: GameKeyboard._keyTones[
                    (toneOffset + index) % GameKeyboard._keyTones.length],
                onTap: () => onCharacter(letters[index]),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _TextKey extends StatelessWidget {
  const _TextKey({
    required this.label,
    required this.onTap,
    this.tone = const _KeyTone(Color(0xFFFFFDF9), Color(0xFFD8CBC2)),
    this.isSpace = false,
  });

  final String label;
  final VoidCallback onTap;
  final _KeyTone tone;
  final bool isSpace;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: tone.face,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          constraints: const BoxConstraints(minWidth: 34),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: Colors.white, width: 3),
            boxShadow: [
              BoxShadow(
                color: tone.shadow,
                offset: const Offset(0, 4),
              ),
              BoxShadow(
                color: const Color(0xFF5D4037).withValues(alpha: 0.05),
                spreadRadius: 1,
              ),
            ],
          ),
          alignment: Alignment.center,
          child: FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              label,
              style: TextStyle(
                color: const Color(0xFF4F3B34),
                fontSize: isSpace ? 13 : 18,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ActionKey extends StatelessWidget {
  const _ActionKey({
    required this.tooltip,
    required this.icon,
    required this.onTap,
    this.isSubmit = false,
    super.key,
  });

  final String tooltip;
  final IconData icon;
  final VoidCallback? onTap;
  final bool isSubmit;

  @override
  Widget build(BuildContext context) {
    final face = isSubmit ? const Color(0xFFDBF9EF) : const Color(0xFFFFF1F1);
    final shadow = isSubmit ? const Color(0xFF97DBBA) : const Color(0xFFED9E9E);
    return Expanded(
      flex: 2,
      child: Tooltip(
        message: tooltip,
        child: Material(
          color: onTap == null ? const Color(0xFFE9ECEC) : face,
          borderRadius: BorderRadius.circular(14),
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(14),
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: Colors.white,
                  width: 3,
                ),
                boxShadow: [
                  BoxShadow(
                    color: onTap == null ? AppPalette.border : shadow,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              alignment: Alignment.center,
              child: Icon(
                icon,
                color: onTap == null
                    ? const Color(0xFF9AA5A8)
                    : isSubmit
                        ? const Color(0xFF176B5F)
                        : const Color(0xFF8E4848),
                size: 24,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _KeyTone {
  const _KeyTone(this.face, this.shadow);

  final Color face;
  final Color shadow;
}
