import 'dart:math' as math;

import 'package:flutter/material.dart';

/// Reusable letter keyboard matching the original English Grammar Game.
class OriginalGameKeyboard extends StatelessWidget {
  const OriginalGameKeyboard({
    required this.onKey,
    this.onSubmit,
    this.keyboardKey,
    this.keyPrefix = 'game-keyboard-key-',
    this.submitLabel = '✓',
    super.key,
  });

  final ValueChanged<String> onKey;
  final VoidCallback? onSubmit;
  final Key? keyboardKey;
  final String keyPrefix;
  final String submitLabel;

  static const _rows = <List<String>>[
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
  ];

  @override
  Widget build(BuildContext context) {
    final keyHeight =
        (MediaQuery.sizeOf(context).height * .088).clamp(44.0, 58.0).toDouble();
    final safe = MediaQuery.paddingOf(context);
    return Container(
      key: keyboardKey ?? const Key('original-game-keyboard'),
      padding: EdgeInsets.fromLTRB(
        math.max(8.0, safe.left),
        0,
        math.max(8.0, safe.right),
        safe.bottom + 8,
      ),
      color: Colors.white,
      child: LayoutBuilder(
        builder: (context, constraints) {
          final gap = constraints.maxWidth <= 720 ? 4.0 : 7.0;
          final keyWidth =
              math.max(0, (constraints.maxWidth - gap * 9) / 10).toDouble();
          return Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              for (var row = 0; row < _rows.length; row += 1) ...[
                if (row > 0) SizedBox(height: gap),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    for (var index = 0;
                        index < _rows[row].length;
                        index += 1) ...[
                      if (index > 0) SizedBox(width: gap),
                      SizedBox(
                        width: keyWidth,
                        child: _KeyboardKey(
                          label: _rows[row][index] == 'BACKSPACE'
                              ? '⌫'
                              : _rows[row][index],
                          height: keyHeight,
                          colorIndex: index,
                          keyPrefix: keyPrefix,
                          onTap: () => onKey(_rows[row][index]),
                        ),
                      ),
                    ],
                  ],
                ),
              ],
              SizedBox(height: gap),
              Row(
                children: [
                  _KeyboardKey(
                      label: '-',
                      flex: 1,
                      height: keyHeight,
                      colorIndex: 0,
                      keyPrefix: keyPrefix,
                      onTap: () => onKey('-')),
                  SizedBox(width: gap),
                  _KeyboardKey(
                      label: 'Space',
                      flex: onSubmit == null ? 4 : 3,
                      height: keyHeight,
                      colorIndex: 1,
                      keyPrefix: keyPrefix,
                      onTap: () => onKey('SPACE')),
                  SizedBox(width: gap),
                  _KeyboardKey(
                      label: "'",
                      flex: 1,
                      height: keyHeight,
                      colorIndex: 2,
                      keyPrefix: keyPrefix,
                      onTap: () => onKey("'")),
                  if (onSubmit != null) ...[
                    SizedBox(width: gap),
                    _KeyboardKey(
                        label: submitLabel,
                        flex: 1,
                        height: keyHeight,
                        colorIndex: 3,
                        submit: true,
                        keyPrefix: keyPrefix,
                        onTap: onSubmit!),
                  ],
                ],
              ),
            ],
          );
        },
      ),
    );
  }
}

class _KeyboardKey extends StatefulWidget {
  const _KeyboardKey(
      {required this.label,
      required this.height,
      required this.keyPrefix,
      required this.onTap,
      this.flex,
      this.colorIndex,
      this.submit = false});
  final String label;
  final double height;
  final String keyPrefix;
  final VoidCallback onTap;
  final int? flex;
  final int? colorIndex;
  final bool submit;

  @override
  State<_KeyboardKey> createState() => _KeyboardKeyState();
}

class _KeyboardKeyState extends State<_KeyboardKey> {
  bool _pressed = false;

  static const fills = <Color>[
    Color(0xFFFFF6FB),
    Color(0xFFF6FFFD),
    Color(0xFFFFF9E6),
    Color(0xFFF4F8FF),
    Color(0xFFFFF3EC),
    Color(0xFFF6F0FF)
  ];
  static const shadows = <Color>[
    Color(0xFFEDB0D1),
    Color(0xFF9FE7D7),
    Color(0xFFF6D26F),
    Color(0xFFB8CCEE),
    Color(0xFFF5BB9A),
    Color(0xFFD6BEF8)
  ];

  @override
  Widget build(BuildContext context) {
    final slot = (widget.colorIndex ??
            widget.label.codeUnits.fold<int>(0, (a, b) => a + b)) %
        fills.length;
    final child = GestureDetector(
      key: ValueKey('${widget.keyPrefix}${widget.label}'),
      behavior: HitTestBehavior.opaque,
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) => setState(() => _pressed = false),
      onTapCancel: () => setState(() => _pressed = false),
      onTap: widget.onTap,
      child: AnimatedScale(
        scale: _pressed ? .95 : 1,
        duration: const Duration(milliseconds: 90),
        curve: Curves.easeOut,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 90),
          curve: Curves.easeOut,
          transform: Matrix4.translationValues(0, _pressed ? 3 : 0, 0),
          transformAlignment: Alignment.center,
          height: widget.height,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: widget.submit ? const Color(0xFFDBF9EF) : fills[slot],
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: Colors.white, width: 3),
            boxShadow: [
              BoxShadow(
                color: widget.submit ? const Color(0xFF97DBBA) : shadows[slot],
                offset: Offset(0, _pressed ? 1 : 4),
              )
            ],
          ),
          child: Text(widget.label,
              style: TextStyle(
                  inherit: false,
                  color: widget.submit
                      ? const Color(0xFF176B5F)
                      : const Color(0xFF443335),
                  fontFamily: 'ChironGoRoundTC',
                  fontSize: widget.label == 'Space'
                      ? 15
                      : (widget.label.length > 1 ? 13 : 21),
                  height: 1,
                  decoration: TextDecoration.none,
                  decorationColor: Colors.transparent,
                  decorationThickness: 0,
                  fontWeight: FontWeight.w900)),
        ),
      ),
    );
    return widget.flex == null
        ? child
        : Expanded(flex: widget.flex!, child: child);
  }
}
