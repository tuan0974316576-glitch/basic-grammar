import 'package:flutter/material.dart';

import 'econ_palette.dart';

class EconLanguageSwitch extends StatelessWidget {
  const EconLanguageSwitch({
    required this.language,
    required this.onChanged,
    super.key,
  });

  final String language;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    final english = language == 'en';
    return Semantics(
      button: true,
      label: english ? '切換中文' : 'Switch to English',
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          key: const Key('econ-language-switch'),
          borderRadius: BorderRadius.circular(999),
          onTap: () => onChanged(english ? 'zh' : 'en'),
          child: Container(
            constraints: const BoxConstraints(minWidth: 54, minHeight: 42),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
            decoration: BoxDecoration(
              color: EconPalette.softPrimary,
              border: Border.all(color: EconPalette.primary, width: 2),
              borderRadius: BorderRadius.circular(999),
              boxShadow: const [
                BoxShadow(
                  color: EconPalette.border,
                  offset: Offset(0, 3),
                  blurRadius: 0,
                ),
              ],
            ),
            child: Text(
              english ? '中' : 'EN',
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: EconPalette.primaryDark,
                fontSize: 14,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
