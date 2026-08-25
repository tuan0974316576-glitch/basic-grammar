import 'package:flutter/material.dart';

import '../../core/app_palette.dart';
import '../../core/app_sfx.dart';
import '../../core/widgets/stationery_frame.dart';

/// The native home screen follows the original Basic Grammar Game shell:
/// teal dashed paper, yellow lesson labels, a Coach panel, and three tabs.
class OriginalGrammarHome extends StatefulWidget {
  const OriginalGrammarHome({
    required this.onLessonTap,
    required this.onVerbTableInfo,
    required this.onSettings,
    super.key,
  });

  final ValueChanged<int> onLessonTap;
  final VoidCallback onVerbTableInfo;
  final VoidCallback onSettings;

  @override
  State<OriginalGrammarHome> createState() => _OriginalGrammarHomeState();
}

class _OriginalGrammarHomeState extends State<OriginalGrammarHome> {
  double _practiceCount = 10;

  static const _lessons = <_OriginalLesson>[
    _OriginalLesson(
      index: 0,
      label: 'Lesson 01',
      title: '分辨句子是否有主動動詞',
      subtitle: '分辨句子何時要 is/am/are',
      total: 100,
    ),
    _OriginalLesson(
      index: 1,
      label: 'Lesson 02',
      title: '一句句子必須只有一個動詞',
      subtitle: '分辨正確句、沒有動詞、兩個動詞',
      total: 100,
    ),
    _OriginalLesson(
      index: 2,
      label: 'Quiz 1',
      title: '重組英文句子',
      subtitle: '看中文，砌出正確英文句子',
      total: 50,
    ),
    _OriginalLesson(
      index: 3,
      label: 'Lesson 03',
      title: '何謂句子',
      subtitle: '用顏色 underline 分句',
      total: 30,
    ),
    _OriginalLesson(
      index: 4,
      label: 'Lesson 04',
      title: '代名詞',
      subtitle: '配對主語、非主語、的、的東西',
      total: 7,
    ),
    _OriginalLesson(
      index: 5,
      label: 'Lesson 05',
      title: '代名詞句子 MC',
      subtitle: '看英文空格，選正確代名詞',
      total: 50,
    ),
    _OriginalLesson(
      index: 6,
      label: 'Lesson 06',
      title: '可數名詞的使用要點',
      subtitle: '判斷名詞單眾數，錯句要改正',
      total: 100,
    ),
    _OriginalLesson(
      index: 7,
      label: 'Lesson 07',
      title: '名詞的類別',
      subtitle: '可數、不可數、ING、專有名詞',
      total: 60,
    ),
    _OriginalLesson(
      index: 8,
      label: 'Lesson 08',
      title: 'Modal Verb 的要訣',
      subtitle: 'can / will / should / may / must',
      total: 60,
    ),
    _OriginalLesson(
      index: 9,
      label: 'Lesson 09',
      title: 'Adjective 形容詞',
      subtitle: 'happy / useful / interested in / willing to',
      total: 60,
    ),
    _OriginalLesson(
      index: 10,
      label: 'Lesson 10',
      title: 'Adverb 副詞',
      subtitle: '句首、句中、句尾副詞位置',
      total: 100,
    ),
    _OriginalLesson(
      index: 11,
      label: 'Lesson 11',
      title: 'Tenses 時態分辨',
      subtitle: '可選時態範圍，再填動詞形式',
      total: 260,
    ),
    _OriginalLesson(
      index: 12,
      label: 'Lesson 12',
      title: 'Verb Table 動詞四式',
      subtitle: '現在式、過去式、PP、ING 配對',
      total: 100,
      hasInfo: true,
    ),
    _OriginalLesson(
      index: 13,
      label: 'Lesson 13',
      title: '「有」的主要用法',
      subtitle: 'There be / with / without / have',
      total: 80,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: LayoutBuilder(
        builder: (context, constraints) {
          final horizontal = constraints.maxWidth >= 700 ? 28.0 : 12.0;
          return SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: EdgeInsets.fromLTRB(horizontal, 12, horizontal, 20),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 760),
                child: StationeryFrame(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
                  radius: 24,
                  ringWidth: 5,
                  shadowDepth: 6,
                  child: Column(
                    children: [
                      _HomeHeader(
                        onSettings: widget.onSettings,
                      ),
                      const SizedBox(height: 12),
                      _CoachPanel(
                        practiceCount: _practiceCount,
                        onPracticeCountChanged: (value) {
                          setState(() => _practiceCount = value);
                        },
                      ),
                      const SizedBox(height: 16),
                      for (final lesson in _lessons) ...[
                        _LessonCard(
                          lesson: lesson,
                          onTap: () {
                            AppSfx.instance.play(SfxCue.click);
                            widget.onLessonTap(lesson.index);
                          },
                          onInfo:
                              lesson.hasInfo ? widget.onVerbTableInfo : null,
                        ),
                        if (lesson != _lessons.last) const SizedBox(height: 14),
                      ],
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

class _HomeHeader extends StatelessWidget {
  const _HomeHeader({required this.onSettings});

  final VoidCallback onSettings;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 72,
      child: Row(
        children: [
          _SettingsSeal(
            key: const Key('grammar-home-settings'),
            onPressed: onSettings,
          ),
          const SizedBox(width: 8),
          const Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'DOPE ENGLISH',
                  style: TextStyle(
                    color: AppPalette.primaryDark,
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.8,
                  ),
                ),
                SizedBox(height: 5),
                FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text(
                    'Basic Grammar Game',
                    style: TextStyle(
                      color: AppPalette.primaryDark,
                      fontSize: 30,
                      height: 1,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 66),
        ],
      ),
    );
  }
}

class _SettingsSeal extends StatelessWidget {
  const _SettingsSeal({required this.onPressed, super.key});

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: '設定',
      child: Material(
        color: Colors.white,
        shape: const CircleBorder(),
        elevation: 3,
        shadowColor: AppPalette.primaryDark.withValues(alpha: 0.35),
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: onPressed,
          child: Container(
            width: 58,
            height: 58,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              border: Border.all(color: AppPalette.primary, width: 4),
              boxShadow: const [
                BoxShadow(color: AppPalette.primaryDark, offset: Offset(0, 3)),
              ],
            ),
            child: Image.asset(
              'assets/setting-2.png',
              width: 34,
              height: 34,
              fit: BoxFit.contain,
            ),
          ),
        ),
      ),
    );
  }
}

class _CoachPanel extends StatelessWidget {
  const _CoachPanel({
    required this.practiceCount,
    required this.onPracticeCountChanged,
  });

  final double practiceCount;
  final ValueChanged<double> onPracticeCountChanged;

  @override
  Widget build(BuildContext context) {
    return StationeryFrame(
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 10),
      backgroundColor: AppPalette.softPrimary,
      borderColor: AppPalette.primary,
      shadowColor: const Color(0xFFBDE0E1),
      radius: 20,
      ringWidth: 4,
      shadowDepth: 5,
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const _CoachIllustration(),
              const SizedBox(width: 12),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(top: 3),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'COACH',
                        style: TextStyle(
                          color: AppPalette.primaryDark,
                          fontSize: 14,
                          fontWeight: FontWeight.w900,
                          letterSpacing: .7,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        '做得好！由句子分析開始，記憶會越來越穩。',
                        style: TextStyle(
                          color: const Color(0xFF5D4037),
                          fontSize:
                              MediaQuery.sizeOf(context).width < 380 ? 15 : 17,
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
          StationeryFrame(
            padding: const EdgeInsets.fromLTRB(10, 8, 10, 2),
            backgroundColor: Colors.white.withValues(alpha: .72),
            borderColor: AppPalette.border,
            shadowColor: const Color(0xFFE9ECEF),
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
                        color: AppPalette.primaryDark,
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    _YellowPill(label: '${practiceCount.round()} 題'),
                  ],
                ),
                SliderTheme(
                  data: SliderTheme.of(context).copyWith(
                    trackHeight: 12,
                    activeTrackColor: AppPalette.border,
                    inactiveTrackColor: const Color(0xFFE5EAEC),
                    thumbColor: AppPalette.primary,
                    overlayColor: AppPalette.primary.withValues(alpha: .14),
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
                    value: practiceCount,
                    onChanged: onPracticeCountChanged,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CoachIllustration extends StatelessWidget {
  const _CoachIllustration();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 62,
      height: 72,
      child: CustomPaint(
        painter: _CoachPainter(),
      ),
    );
  }
}

class _CoachPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final stroke = Paint()
      ..color = const Color(0xFF2CB5AC)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.3
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    final fill = Paint()..style = PaintingStyle.fill;
    final center = Offset(size.width * .48, size.height * .55);
    final triangle = Path()
      ..moveTo(size.width * .25, size.height * .84)
      ..lineTo(size.width * .55, size.height * .18)
      ..lineTo(size.width * .82, size.height * .84)
      ..close();
    fill.color = const Color(0xFFFFE66D);
    canvas.drawPath(triangle, fill);
    canvas.drawPath(triangle, stroke);
    fill.color = const Color(0xFFFF6B6B);
    final scarf = Path()
      ..moveTo(size.width * .25, size.height * .84)
      ..lineTo(size.width * .47, size.height * .92)
      ..lineTo(size.width * .63, size.height * .78)
      ..lineTo(size.width * .71, size.height * .94)
      ..lineTo(size.width * .2, size.height * .94)
      ..close();
    canvas.drawPath(scarf, fill);
    canvas.drawPath(scarf, stroke);
    fill.color = const Color(0xFFFFE66D);
    canvas.drawCircle(Offset(size.width * .46, size.height * .12), 7, fill);
    canvas.drawCircle(center.translate(-4, -4), 1.7,
        Paint()..color = const Color(0xFF5D4037));
    canvas.drawArc(
      Rect.fromCircle(center: center.translate(5, 0), radius: 8),
      .1,
      1.1,
      false,
      stroke,
    );
    final speech = RRect.fromRectAndRadius(
      Rect.fromLTWH(0, size.height * .42, 27, 18),
      const Radius.circular(6),
    );
    fill.color = Colors.white;
    canvas.drawRRect(speech, fill);
    canvas.drawRRect(speech, stroke);
    canvas.drawLine(
      Offset(5, size.height * .49),
      Offset(20, size.height * .49),
      stroke,
    );
  }

  @override
  bool shouldRepaint(covariant _CoachPainter oldDelegate) => false;
}

class _LessonCard extends StatelessWidget {
  const _LessonCard({
    required this.lesson,
    required this.onTap,
    this.onInfo,
  });

  final _OriginalLesson lesson;
  final VoidCallback onTap;
  final VoidCallback? onInfo;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: '${lesson.label} ${lesson.title}',
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          GestureDetector(
            key: Key('grammar-lesson-card-${lesson.index}'),
            behavior: HitTestBehavior.opaque,
            onTap: onTap,
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: onTap,
                borderRadius: BorderRadius.circular(18),
                child: StationeryFrame(
                  padding: const EdgeInsets.fromLTRB(18, 28, 16, 14),
                  borderColor: AppPalette.border,
                  shadowColor: const Color(0xFFE9ECEF),
                  radius: 18,
                  ringWidth: 4,
                  shadowDepth: 5,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        lesson.title,
                        style: TextStyle(
                          color: AppPalette.primaryDark,
                          fontSize:
                              MediaQuery.sizeOf(context).width < 380 ? 19 : 22,
                          height: 1.18,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Expanded(
                            child: Text(
                              lesson.subtitle,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: AppPalette.muted,
                                fontSize: 14,
                                height: 1.25,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Text(
                            '0/${lesson.total}',
                            style: const TextStyle(
                              color: AppPalette.muted,
                              fontSize: 15,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          Positioned(
            left: 16,
            top: -2,
            child: _YellowPill(label: lesson.label),
          ),
          if (onInfo != null)
            Positioned(
              right: 8,
              top: 5,
              child: IconButton(
                key: const Key('verb-table-roadmap-info'),
                tooltip: 'Verb Table 溫習表',
                onPressed: onInfo,
                icon: const Icon(Icons.info_outline_rounded, size: 20),
                color: AppPalette.primaryDark,
                constraints:
                    const BoxConstraints.tightFor(width: 34, height: 34),
                padding: EdgeInsets.zero,
              ),
            ),
        ],
      ),
    );
  }
}

class _YellowPill extends StatelessWidget {
  const _YellowPill({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minHeight: 34),
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 5),
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

class OriginalTabBar extends StatelessWidget {
  const OriginalTabBar({
    required this.selectedIndex,
    required this.onSelected,
    super.key,
  });

  final int selectedIndex;
  final ValueChanged<int> onSelected;

  static const _tabs = [
    ('文', '文法'),
    ('字', '詞彙'),
    ('查', 'Scan'),
  ];

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      minimum: const EdgeInsets.fromLTRB(12, 0, 12, 10),
      child: SizedBox(
        height: 76,
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 760),
            child: StationeryFrame(
              padding: const EdgeInsets.all(7),
              radius: 20,
              ringWidth: 4,
              shadowDepth: 5,
              child: Row(
                children: [
                  for (var index = 0; index < _tabs.length; index++) ...[
                    if (index > 0) const SizedBox(width: 7),
                    Expanded(
                      child: _TabButton(
                        glyph: _tabs[index].$1,
                        label: _tabs[index].$2,
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

class _TabButton extends StatelessWidget {
  const _TabButton({
    required this.glyph,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String glyph;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final foreground =
        selected ? const Color(0xFF176B5F) : const Color(0xFF5D4037);
    return Semantics(
      button: true,
      selected: selected,
      label: label,
      child: Material(
        color: selected ? AppPalette.secondary : const Color(0xFFF8FBFB),
        borderRadius: BorderRadius.circular(15),
        child: InkWell(
          key: Key('main-tab-$label'),
          onTap: onTap,
          borderRadius: BorderRadius.circular(15),
          child: Container(
            constraints: const BoxConstraints(minHeight: 54),
            padding: const EdgeInsets.symmetric(horizontal: 8),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(15),
              border: Border.all(
                color: selected ? Colors.white : const Color(0xFFD9E5E7),
                width: 2,
              ),
              boxShadow: [
                BoxShadow(
                  color: selected
                      ? AppPalette.secondaryDark
                      : const Color(0xFFE8EEEE),
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 29,
                  height: 29,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: AppPalette.primary,
                    borderRadius: BorderRadius.circular(9),
                  ),
                  child: Text(
                    glyph,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
                const SizedBox(width: 6),
                Flexible(
                  child: Text(
                    label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: foreground,
                      fontSize: 14,
                      fontWeight: FontWeight.w900,
                    ),
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

class OriginalScanPage extends StatelessWidget {
  const OriginalScanPage({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(18, 24, 18, 28),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 760),
            child: StationeryFrame(
              padding: const EdgeInsets.fromLTRB(18, 24, 18, 24),
              child: Column(
                children: [
                  const Text(
                    'SCAN DICTIONARY',
                    style: TextStyle(
                      color: AppPalette.primaryDark,
                      fontSize: 13,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.4,
                    ),
                  ),
                  const SizedBox(height: 5),
                  const Text(
                    'Scan 查字',
                    style: TextStyle(
                      color: AppPalette.primaryDark,
                      fontSize: 30,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 22),
                  StationeryFrame(
                    padding: const EdgeInsets.all(18),
                    backgroundColor: AppPalette.softPrimary,
                    radius: 20,
                    ringWidth: 4,
                    child: Column(
                      children: [
                        const Icon(
                          Icons.document_scanner_rounded,
                          color: AppPalette.primaryDark,
                          size: 76,
                        ),
                        const SizedBox(height: 14),
                        const Text(
                          '影相查字稍後合併。',
                          style: TextStyle(
                            color: Color(0xFF5D4037),
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          '之後可以影 worksheet 或書本，自動找出生字。',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: AppPalette.muted,
                            fontSize: 15,
                            height: 1.35,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 16),
                        FilledButton.icon(
                          onPressed: null,
                          icon: const Icon(Icons.camera_alt_rounded),
                          label: const Text('即將推出'),
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
    );
  }
}

class _OriginalLesson {
  const _OriginalLesson({
    required this.index,
    required this.label,
    required this.title,
    required this.subtitle,
    required this.total,
    this.hasInfo = false,
  });

  final int index;
  final String label;
  final String title;
  final String subtitle;
  final int total;
  final bool hasInfo;
}
