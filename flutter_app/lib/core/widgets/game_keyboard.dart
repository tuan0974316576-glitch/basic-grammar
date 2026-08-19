import 'package:flutter/material.dart';

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

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final compact =
            constraints.maxWidth < 430 || constraints.maxHeight < 230;
        final keyHeight = compact ? 40.0 : 50.0;
        final gap = compact ? 3.0 : 6.0;
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
                  onCharacter: onCharacter,
                ),
                SizedBox(height: gap),
                FractionallySizedBox(
                  widthFactor: 0.92,
                  child: _LetterRow(
                    letters: _middleRow,
                    keyHeight: keyHeight,
                    gap: gap,
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
                      _TextKey(label: '-', onTap: () => onCharacter('-')),
                      SizedBox(width: gap),
                      Expanded(
                        flex: 5,
                        child: _TextKey(
                          label: 'SPACE',
                          onTap: () => onCharacter(' '),
                          isSpace: true,
                        ),
                      ),
                      SizedBox(width: gap),
                      _TextKey(label: "'", onTap: () => onCharacter("'")),
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
    required this.onCharacter,
  });

  final List<String> letters;
  final double keyHeight;
  final double gap;
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
    this.isSpace = false,
  });

  final String label;
  final VoidCallback onTap;
  final bool isSpace;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: isSpace ? const Color(0xFFF9F4E8) : const Color(0xFFFFFFFF),
      borderRadius: BorderRadius.circular(9),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(9),
        child: Container(
          constraints: const BoxConstraints(minWidth: 34),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(9),
            border: Border.all(color: const Color(0xFFD4DEE0), width: 2),
            boxShadow: const [
              BoxShadow(color: Color(0xFF7B939A), offset: Offset(0, 3)),
            ],
          ),
          alignment: Alignment.center,
          child: FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              label,
              style: TextStyle(
                color: const Color(0xFF23373D),
                fontSize: isSpace ? 13 : 17,
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
    final color = isSubmit ? const Color(0xFF25B4F3) : const Color(0xFFFFD768);
    return Expanded(
      flex: 2,
      child: Tooltip(
        message: tooltip,
        child: Material(
          color: onTap == null ? const Color(0xFF52666C) : color,
          borderRadius: BorderRadius.circular(9),
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(9),
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(9),
                border: Border.all(
                    color: Colors.white.withValues(alpha: 0.75), width: 2),
                boxShadow: [
                  BoxShadow(
                    color: onTap == null
                        ? const Color(0xFF39494E)
                        : isSubmit
                            ? const Color(0xFF1178A9)
                            : const Color(0xFFB58B22),
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              alignment: Alignment.center,
              child: Icon(
                icon,
                color: onTap == null
                    ? const Color(0xFF8CA0A6)
                    : const Color(0xFF20343A),
                size: 23,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
