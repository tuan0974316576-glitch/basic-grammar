import 'package:flutter/material.dart';

import '../../core/app_palette.dart';
import '../../core/widgets/original_section_frame.dart';
import '../../core/widgets/stationery_frame.dart';
import 'econ_palette.dart';
import 'econ_language_switch.dart';

class EconLearningMenuScreen extends StatelessWidget {
  const EconLearningMenuScreen({
    required this.onLessonTap,
    this.practiceCount = 10,
    this.onPracticeCountChanged,
    this.onSettings,
    this.settingsActive = false,
    this.language = 'zh',
    this.onLanguageChanged,
    super.key,
  });

  final ValueChanged<int> onLessonTap;
  final double practiceCount;
  final ValueChanged<double>? onPracticeCountChanged;
  final VoidCallback? onSettings;
  final bool settingsActive;
  final String language;
  final ValueChanged<String>? onLanguageChanged;

  static const _chaptersZh = <(int, String)>[
    (1, '基本經濟概念'),
    (2, '三個基本經濟問題與私有產權'),
    (3, '廠商的所有權形式'),
    (4, '生產與分工'),
    (5, '生產要素'),
    (6, '生產及成本'),
    (7, '廠商的目標與擴張'),
    (8, '市場價格的訂定'),
    (9, '市場價格的變化'),
    (10, '需求和供應的價格彈性'),
    (11, '市場干預'),
    (12, '市場結構'),
    (13, '效率、公平和政府的角色(I)'),
    (14, '效率、公平和政府的角色(II)'),
    (15, '經濟表現的量度(I)'),
    (16, '經濟表現的量度(II)'),
    (17, '總需求和總供應'),
    (18, '產出和價格的決定'),
    (19, '貨幣與銀行'),
    (20, '貨幣供應和貨幣需求'),
    (21, '經濟周期、一般物價水平的變動和失業'),
    (22, '財政政策與貨幣政策'),
    (23, '國際貿易'),
    (24, '貿易障礙'),
    (25, '國際收支平衡表與匯率'),
    (29, '經濟增長及發展'),
  ];

  static const _chaptersEn = <(int, String)>[
    (1, 'Basic Economic Concepts'),
    (2, 'The Three Basic Economic Problems and Private Property Rights'),
    (3, 'Ownership of Firms'),
    (4, 'Production and Division of Labour'),
    (5, 'Factors of Production'),
    (6, 'Production and Costs'),
    (7, 'The Objectives and Expansion of Firms'),
    (8, 'Determination of Market Price'),
    (9, 'Changes in Market Prices'),
    (10, 'Price Elasticity of Demand and Supply'),
    (11, 'Market Intervention'),
    (12, 'Market Structure'),
    (13, 'Efficiency, Equity and the Role of Government (I)'),
    (14, 'Efficiency, Equity and the Role of Government (II)'),
    (15, 'Measurement of Economic Performance (I)'),
    (16, 'Measurement of Economic Performance (II)'),
    (17, 'Aggregate Demand and Aggregate Supply'),
    (18, 'Determination of Output and Price'),
    (19, 'Money and Banking'),
    (20, 'Money Supply and Money Demand'),
    (21, 'Business Cycles, Price Level Changes and Unemployment'),
    (22, 'Fiscal and Monetary Policies'),
    (23, 'International Trade'),
    (24, 'Trade Barriers'),
    (25, 'Balance of Payments and Exchange Rates'),
    (29, 'Economic Growth and Development'),
  ];

  @override
  Widget build(BuildContext context) {
    return OriginalSectionFrame(
      sectionKey: const Key('econ-learning-menu-frame'),
      eyebrow: 'ECON · 學習',
      title: '逐課學習',
      onSettings: onSettings,
      settingsActive: settingsActive,
      settingsKey: const Key('econ-learning-settings'),
      accentColor: EconPalette.primary,
      accentDarkColor: EconPalette.primaryDark,
      accentSoftColor: EconPalette.softPrimary,
      accentShadowColor: const Color(0xFFFFE7A3),
      trailing: EconLanguageSwitch(
        language: language,
        onChanged: onLanguageChanged ?? (_) {},
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          EconCoachPanel(
            practiceCount: practiceCount,
            onPracticeCountChanged: onPracticeCountChanged,
          ),
          const SizedBox(height: 12),
          Expanded(
            child: ListView.separated(
              key: const Key('econ-learning-chapter-list'),
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(0, 12, 0, 12),
              itemCount: (language == 'en' ? _chaptersEn : _chaptersZh).length,
              separatorBuilder: (_, __) => const SizedBox(height: 9),
              itemBuilder: (context, index) {
                final chapter =
                    (language == 'en' ? _chaptersEn : _chaptersZh)[index];
                final available = chapter.$1 == 1;
                return _ChapterCard(
                  chapterNo: chapter.$1,
                  title: chapter.$2,
                  available: available,
                  onTap: available ? () => onLessonTap(chapter.$1) : null,
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class EconCoachPanel extends StatelessWidget {
  const EconCoachPanel({
    required this.practiceCount,
    required this.onPracticeCountChanged,
    super.key,
  });

  final double practiceCount;
  final ValueChanged<double>? onPracticeCountChanged;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: StationeryFrame(
        padding: const EdgeInsets.fromLTRB(12, 12, 12, 10),
        backgroundColor: EconPalette.softPrimary,
        borderColor: EconPalette.primary,
        shadowColor: EconPalette.border,
        glowColor: EconPalette.primary,
        radius: 20,
        ringWidth: 4,
        shadowDepth: 5,
        child: Column(
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(
                  width: 62,
                  height: 72,
                  child: Icon(
                    Icons.school_rounded,
                    color: EconPalette.primaryDark,
                    size: 52,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 3),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'ECON COACH',
                          style: TextStyle(
                            color: EconPalette.primaryDark,
                            fontSize: 14,
                            fontWeight: FontWeight.w900,
                            letterSpacing: .7,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          '準備好開始 ECON 練習！',
                          style: TextStyle(
                            color: AppPalette.ink,
                            fontSize: MediaQuery.sizeOf(context).width < 380
                                ? 15
                                : 17,
                            height: 1.3,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            EconPracticeCountPanel(
              practiceCount: practiceCount,
              onPracticeCountChanged: onPracticeCountChanged,
            ),
          ],
        ),
      ),
    );
  }
}

class EconPracticeCountPanel extends StatelessWidget {
  const EconPracticeCountPanel({
    required this.practiceCount,
    required this.onPracticeCountChanged,
    super.key,
  });

  final double practiceCount;
  final ValueChanged<double>? onPracticeCountChanged;

  @override
  Widget build(BuildContext context) {
    final count = practiceCount.clamp(10, 100).toDouble();
    return StationeryFrame(
      padding: const EdgeInsets.fromLTRB(10, 8, 10, 2),
      backgroundColor: Colors.white.withValues(alpha: .72),
      borderColor: EconPalette.border,
      shadowColor: const Color(0xFFE9ECEF),
      glowColor: EconPalette.border,
      radius: 16,
      ringWidth: 3,
      shadowDepth: 3,
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                '練習題數',
                style: TextStyle(
                  color: EconPalette.primaryDark,
                  fontSize: 16,
                  fontWeight: FontWeight.w900,
                ),
              ),
              _EconCountPill(label: '${count.round()} 題'),
            ],
          ),
          SliderTheme(
            data: SliderTheme.of(context).copyWith(
              trackHeight: 12,
              activeTrackColor: EconPalette.border,
              inactiveTrackColor: const Color(0xFFE5EAEC),
              thumbColor: EconPalette.primary,
              overlayColor: EconPalette.primary.withValues(alpha: .14),
              thumbShape: const RoundSliderThumbShape(
                enabledThumbRadius: 17,
                elevation: 3,
              ),
              trackShape: const RoundedRectSliderTrackShape(),
            ),
            child: Slider(
              min: 10,
              max: 100,
              divisions: 18,
              value: count,
              onChanged: onPracticeCountChanged,
            ),
          ),
        ],
      ),
    );
  }
}

class _EconCountPill extends StatelessWidget {
  const _EconCountPill({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minHeight: 30),
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 3),
      decoration: BoxDecoration(
        color: AppPalette.secondary,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: Colors.white, width: 2),
        boxShadow: const [
          BoxShadow(color: AppPalette.secondaryDark, offset: Offset(0, 4)),
        ],
      ),
      child: Text(
        label,
        style: const TextStyle(
          color: Color(0xFF5D4037),
          fontSize: 14,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class _ChapterCard extends StatelessWidget {
  const _ChapterCard(
      {required this.chapterNo,
      required this.title,
      required this.available,
      this.onTap});

  final int chapterNo;
  final String title;
  final bool available;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final accent = _chapterCardColor(chapterNo);
    final color = available ? accent : accent.withValues(alpha: .68);
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
              backgroundColor:
                  available ? Colors.white : accent.withValues(alpha: .06),
              borderColor: color,
              shadowColor: accent.withValues(alpha: available ? .26 : .14),
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
                      color: accent.withValues(alpha: available ? .18 : .10),
                      shape: BoxShape.circle,
                      border: Border.all(color: color, width: 2),
                    ),
                    child: Text('$chapterNo',
                        style: TextStyle(
                            color: available
                                ? accent
                                : accent.withValues(alpha: .75),
                            fontSize: 15,
                            fontWeight: FontWeight.w900)),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(title,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                                color: available
                                    ? AppPalette.ink
                                    : AppPalette.muted,
                                fontSize: compact ? 18 : 21,
                                fontWeight: FontWeight.w900)),
                        const SizedBox(height: 5),
                        Text('CHAPTER ${chapterNo.toString().padLeft(2, '0')}',
                            style: TextStyle(
                                color: available
                                    ? AppPalette.ink
                                    : AppPalette.muted,
                                fontSize: 14,
                                fontWeight: FontWeight.w800)),
                      ],
                    ),
                  ),
                  if (available)
                    const Icon(Icons.arrow_forward_rounded,
                        color: EconPalette.primaryDark, size: 25)
                  else
                    const Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.lock_rounded,
                            color: AppPalette.border, size: 20),
                        Text('即將推出',
                            style: TextStyle(
                                color: AppPalette.muted,
                                fontSize: 9,
                                fontWeight: FontWeight.w800)),
                      ],
                    ),
                ],
              ),
            ),
            Positioned(
              left: 14,
              top: -12,
              child: OriginalYellowTag(
                label: 'CHAPTER ${chapterNo.toString().padLeft(2, '0')}',
              ),
            ),
          ],
        ),
      ),
    );
  }
}

Color _chapterCardColor(int chapterNo) {
  const colors = [
    Color(0xFFFFC067),
    Color(0xFF4ECDC4),
    Color(0xFF8FB8FF),
    Color(0xFFFF9FB2),
    Color(0xFFCDB4DB),
    Color(0xFFFF8FA3),
  ];
  return colors[(chapterNo - 1) % colors.length];
}
