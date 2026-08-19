import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'core/app_palette.dart';
import 'core/app_sfx.dart';
import 'core/widgets/stationery_frame.dart';
import 'features/auth/student_auth_controller.dart';
import 'features/auth/student_login_screen.dart';
import 'features/grammar/lesson_01/lesson_01_screen.dart';
import 'features/grammar/lesson_02/lesson_02_screen.dart';
import 'features/grammar/quiz_01/quiz_01_screen.dart';
import 'features/vocabulary/vocab_audio_repository.dart';
import 'features/vocabulary/vocab_screen.dart';

const _ink = AppPalette.background;
const _text = AppPalette.ink;
const _blue = AppPalette.primary;
const _blueDark = AppPalette.primaryDark;
const _mutedBlue = AppPalette.border;
const _pink = AppPalette.pink;
const _yellow = AppPalette.secondary;
const _panel = AppPalette.softPrimary;

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  LicenseRegistry.addLicense(() async* {
    final license = await rootBundle.loadString(
      'assets/fonts/OFL-jf-openhuninn.txt',
    );
    yield LicenseEntryWithLineBreaks(['jf open huninn'], license);
  });
  final authController = StudentAuthController();
  final audioRepository = AssetVocabAudioRepository(
    cloudClient: FirebaseVocabAudioCloudClient(),
  );
  runApp(
    DopeEnglishApp(
      authController: authController,
      audioRepository: audioRepository,
    ),
  );
  unawaited(authController.initialize());
}

class DopeEnglishApp extends StatelessWidget {
  const DopeEnglishApp({
    this.authController,
    this.audioRepository,
    super.key,
  });

  final StudentAuthController? authController;
  final VocabAudioRepository? audioRepository;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'DOPE ENGLISH',
      theme: ThemeData(
        brightness: Brightness.light,
        fontFamily: 'JfOpenHuninn',
        scaffoldBackgroundColor: _ink,
        colorScheme: ColorScheme.fromSeed(
          seedColor: _blue,
          brightness: Brightness.light,
          surface: AppPalette.paper,
        ),
        textTheme: ThemeData.light().textTheme.apply(
              bodyColor: _text,
              displayColor: _text,
            ),
        navigationBarTheme: const NavigationBarThemeData(
          labelTextStyle: WidgetStatePropertyAll(
            TextStyle(color: _text, fontWeight: FontWeight.w800),
          ),
        ),
        useMaterial3: true,
      ),
      home: authController == null
          ? AppShell(vocabAudioRepository: audioRepository)
          : AnimatedBuilder(
              animation: authController!,
              builder: (context, _) {
                return switch (authController!.status) {
                  StudentAuthStatus.initializing => const _AppLoadingScreen(),
                  StudentAuthStatus.authenticated => AppShell(
                      authController: authController,
                      vocabAudioRepository: audioRepository,
                    ),
                  StudentAuthStatus.signedOut ||
                  StudentAuthStatus.unavailable =>
                    StudentLoginScreen(controller: authController!),
                };
              },
            ),
    );
  }
}

class _AppLoadingScreen extends StatelessWidget {
  const _AppLoadingScreen();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: AppPalette.background,
      body: SafeArea(
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.menu_book_rounded,
                color: AppPalette.primaryDark,
                size: 58,
              ),
              SizedBox(height: 14),
              Text(
                'DOPE ENGLISH',
                style: TextStyle(
                  color: AppPalette.primaryDark,
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                ),
              ),
              SizedBox(height: 18),
              CircularProgressIndicator(
                color: AppPalette.secondaryDark,
                strokeWidth: 4,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class AppShell extends StatefulWidget {
  const AppShell({
    this.authController,
    this.vocabAudioRepository,
    super.key,
  });

  final StudentAuthController? authController;
  final VocabAudioRepository? vocabAudioRepository;

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  static const _configuredInitialTab = int.fromEnvironment(
    'DOPE_INITIAL_TAB',
    defaultValue: 0,
  );
  int _selectedTab = _configuredInitialTab >= 0 && _configuredInitialTab <= 3
      ? _configuredInitialTab
      : 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _selectedTab,
        children: [
          const RoadmapPage(),
          VocabularyScreen(audioRepository: widget.vocabAudioRepository),
          const AchievementsPage(),
          ProfilePage(authController: widget.authController),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedTab,
        onDestinationSelected: (index) {
          AppSfx.instance.play(SfxCue.click);
          setState(() => _selectedTab = index);
        },
        backgroundColor: AppPalette.paper,
        indicatorColor: _panel,
        shadowColor: AppPalette.border,
        elevation: 8,
        height: 76,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined, color: _blueDark),
            selectedIcon: Icon(Icons.home_rounded, color: _blueDark),
            label: 'Grammar',
          ),
          NavigationDestination(
            icon: Icon(
              Icons.fitness_center_outlined,
              color: AppPalette.secondaryDark,
            ),
            selectedIcon: Icon(
              Icons.fitness_center_rounded,
              color: AppPalette.secondaryDark,
            ),
            label: 'Vocabulary',
          ),
          NavigationDestination(
            icon: Icon(Icons.emoji_events_outlined, color: _blueDark),
            selectedIcon: Icon(Icons.emoji_events_rounded, color: _blueDark),
            label: 'Awards',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline_rounded, color: _pink),
            selectedIcon: Icon(Icons.person_rounded, color: _pink),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}

class RoadmapPage extends StatefulWidget {
  const RoadmapPage({super.key});

  @override
  State<RoadmapPage> createState() => _RoadmapPageState();
}

class _RoadmapPageState extends State<RoadmapPage> {
  int _activeNode = 0;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        children: [
          const Padding(
            padding: EdgeInsets.fromLTRB(18, 10, 18, 12),
            child: ProgressBar(),
          ),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 18),
            child: UnitBanner(),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
              child: Roadmap(
                activeNode: _activeNode,
                onNodeTap: (node) {
                  AppSfx.instance.play(SfxCue.click);
                  setState(() => _activeNode = node.index);
                  _showLessonSheet(context, node);
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showLessonSheet(BuildContext context, LessonNode node) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: AppPalette.paper,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(24, 4, 24, 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  node.subtitle,
                  style: const TextStyle(
                    color: _blueDark,
                    fontWeight: FontWeight.w800,
                    fontSize: 13,
                    letterSpacing: 0.4,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  node.title,
                  style: const TextStyle(
                    color: _text,
                    fontWeight: FontWeight.w900,
                    fontSize: 23,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  node.description,
                  style: const TextStyle(
                    color: AppPalette.muted,
                    fontSize: 15,
                    height: 1.35,
                  ),
                ),
                const SizedBox(height: 18),
                FilledButton.icon(
                  onPressed: () => _startLesson(context, node),
                  icon: const Icon(Icons.play_arrow_rounded),
                  label: const Text('開始課堂'),
                  style: FilledButton.styleFrom(
                    backgroundColor: _blueDark,
                    foregroundColor: Colors.white,
                    minimumSize: const Size.fromHeight(52),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _startLesson(BuildContext sheetContext, LessonNode node) {
    Navigator.of(sheetContext).pop();
    final lessonScreen = switch (node.index) {
      0 => const Lesson01Screen(),
      1 => const Lesson02Screen(),
      2 => const Quiz01Screen(),
      _ => null,
    };
    if (lessonScreen == null) return;
    AppSfx.instance.play(SfxCue.start);
    Future<void>.delayed(Duration.zero, () {
      if (!mounted) return;
      Navigator.of(context).push(
        MaterialPageRoute<void>(builder: (_) => lessonScreen),
      );
    });
  }
}

class ProgressBar extends StatelessWidget {
  const ProgressBar({super.key});

  @override
  Widget build(BuildContext context) {
    return const Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        StatItem(
          icon: Icons.circle,
          iconColor: Color(0xFFFF5B68),
          value: '22',
          isToken: true,
        ),
        StatItem(
          icon: Icons.local_fire_department_rounded,
          iconColor: Color(0xFFFF9F1C),
          value: '4',
        ),
        StatItem(
          icon: Icons.shield_rounded,
          iconColor: _blue,
          value: '1339',
        ),
        StatItem(
          icon: Icons.battery_charging_full_rounded,
          iconColor: _pink,
          value: '25',
        ),
      ],
    );
  }
}

class StatItem extends StatelessWidget {
  const StatItem({
    required this.icon,
    required this.iconColor,
    required this.value,
    this.isToken = false,
    super.key,
  });

  final IconData icon;
  final Color iconColor;
  final String value;
  final bool isToken;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: isToken ? 42 : 37,
          height: isToken ? 34 : 38,
          decoration: isToken
              ? BoxDecoration(
                  color: const Color(0xFFF7F8F5),
                  borderRadius: BorderRadius.circular(9),
                  border: Border.all(color: const Color(0xFFD8E0DF), width: 2),
                )
              : null,
          alignment: Alignment.center,
          child: Icon(icon, color: iconColor, size: isToken ? 20 : 34),
        ),
        const SizedBox(width: 6),
        Text(
          value,
          style: TextStyle(
            color: iconColor,
            fontSize: 20,
            fontWeight: FontWeight.w900,
          ),
        ),
      ],
    );
  }
}

class UnitBanner extends StatelessWidget {
  const UnitBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return StationeryFrame(
      padding: EdgeInsets.zero,
      backgroundColor: _panel,
      radius: 22,
      ringWidth: 4,
      shadowDepth: 5,
      child: IntrinsicHeight(
        child: Row(
          children: [
            const Expanded(
              child: Padding(
                padding: EdgeInsets.fromLTRB(20, 15, 14, 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'SECTION 1, UNIT 1',
                      style: TextStyle(
                        color: _blueDark,
                        fontSize: 13,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 0.5,
                      ),
                    ),
                    SizedBox(height: 5),
                    Text(
                      'English Grammar Basics',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: _text,
                        fontSize: 22,
                        height: 1.08,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Container(
              width: 76,
              alignment: Alignment.center,
              decoration: const BoxDecoration(
                border: Border(left: BorderSide(color: _blue, width: 2)),
              ),
              child: const Icon(
                Icons.format_list_bulleted_rounded,
                color: _blueDark,
                size: 37,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class Roadmap extends StatelessWidget {
  const Roadmap({required this.activeNode, required this.onNodeTap, super.key});

  final int activeNode;
  final ValueChanged<LessonNode> onNodeTap;

  static const nodes = [
    LessonNode(
      index: 0,
      title: '主動動詞',
      subtitle: 'LESSON 01',
      description: '分辨句子是否有主動動詞。',
      icon: Icons.menu_book_rounded,
      state: LessonState.complete,
    ),
    LessonNode(
      index: 1,
      title: '一個動詞',
      subtitle: 'LESSON 02',
      description: '一句句子必須只有一個動詞。',
      icon: Icons.star_rounded,
      state: LessonState.current,
    ),
    LessonNode(
      index: 2,
      title: '重組句子',
      subtitle: 'QUIZ 01',
      description: '把英文詞塊重新組成完整句子。',
      icon: Icons.videocam_rounded,
      state: LessonState.current,
    ),
    LessonNode(
      index: 3,
      title: '何謂句子',
      subtitle: 'LESSON 03',
      description: '認識句子的分界和組成。',
      icon: Icons.menu_book_rounded,
      state: LessonState.locked,
    ),
    LessonNode(
      index: 4,
      title: '代名詞',
      subtitle: 'LESSON 04',
      description: '配對主語、非主語和所有格代名詞。',
      icon: Icons.fitness_center_rounded,
      state: LessonState.locked,
    ),
    LessonNode(
      index: 5,
      title: '代名詞句子',
      subtitle: 'LESSON 05',
      description: '用文法判斷句子中的代名詞。',
      icon: Icons.videocam_rounded,
      state: LessonState.locked,
    ),
    LessonNode(
      index: 6,
      title: '可數名詞',
      subtitle: 'LESSON 06',
      description: '掌握單數、眾數和冠詞的使用。',
      icon: Icons.menu_book_rounded,
      state: LessonState.locked,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;
        final height = nodes.length * 148.0 + 100;
        final xPositions = [
          width * .28,
          width * .70,
          width * .36,
          width * .68,
          width * .30,
          width * .68,
          width * .42,
        ];
        final points = List.generate(
          nodes.length,
          (index) => Offset(xPositions[index], 55 + index * 148.0),
        );

        return SizedBox(
          height: height,
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Positioned.fill(
                child: CustomPaint(
                  painter: RoadmapPainter(points: points),
                ),
              ),
              for (var index = 0; index < nodes.length; index++)
                Positioned(
                  left: xPositions[index] - 47,
                  top: points[index].dy - 47,
                  child: LessonNodeButton(
                    node: nodes[index],
                    isActive: activeNode == nodes[index].index,
                    onTap: () => onNodeTap(nodes[index]),
                  ),
                ),
              Positioned(
                left: width * .69,
                top: 0,
                child: const CharacterMarker(
                  icon: Icons.local_fire_department_rounded,
                  color: Color(0xFFFF9F1C),
                ),
              ),
              Positioned(
                left: width * .08,
                top: 4 * 148.0 + 24,
                child: const CharacterMarker(
                  icon: Icons.sports_tennis_rounded,
                  color: Color(0xFF8DD237),
                ),
              ),
              Positioned(
                right: 0,
                bottom: 16,
                child: IconButton.filledTonal(
                  tooltip: '向下查看',
                  onPressed: () {},
                  icon: const Icon(Icons.keyboard_arrow_down_rounded),
                  style: IconButton.styleFrom(
                    backgroundColor: _panel,
                    foregroundColor: _blue,
                    side: const BorderSide(color: _mutedBlue, width: 2),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class RoadmapPainter extends CustomPainter {
  const RoadmapPainter({required this.points});

  final List<Offset> points;

  @override
  void paint(Canvas canvas, Size size) {
    if (points.length < 2) return;
    final path = Path()..moveTo(points.first.dx, points.first.dy);
    for (var index = 1; index < points.length; index++) {
      final previous = points[index - 1];
      final current = points[index];
      final middleY = (previous.dy + current.dy) / 2;
      path.cubicTo(
        previous.dx,
        middleY,
        current.dx,
        middleY,
        current.dx,
        current.dy,
      );
    }

    final underlay = Paint()
      ..color = const Color(0xFFD6EEEC)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 12
      ..strokeCap = StrokeCap.round;
    canvas.drawPath(path, underlay);

    final route = Paint()
      ..color = AppPalette.primary
      ..style = PaintingStyle.stroke
      ..strokeWidth = 5
      ..strokeCap = StrokeCap.round;
    for (final metric in path.computeMetrics()) {
      var distance = 0.0;
      while (distance < metric.length) {
        final end = math.min(distance + 16, metric.length);
        canvas.drawPath(metric.extractPath(distance, end), route);
        distance += 27;
      }
    }
  }

  @override
  bool shouldRepaint(covariant RoadmapPainter oldDelegate) => false;
}

class LessonNodeButton extends StatelessWidget {
  const LessonNodeButton({
    required this.node,
    required this.isActive,
    required this.onTap,
    super.key,
  });

  final LessonNode node;
  final bool isActive;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final enabled = node.state != LessonState.locked;
    final background = enabled ? _blue : const Color(0xFFF1F3F4);
    return Semantics(
      button: true,
      label: '${node.subtitle} ${node.title}',
      child: SizedBox(
        width: 94,
        height: 94,
        child: Material(
          color: background,
          shape: CircleBorder(
            side: BorderSide(
              color: enabled ? _blueDark : AppPalette.border,
              width: 3,
            ),
          ),
          elevation: isActive ? 8 : 3,
          shadowColor:
              enabled ? _blueDark.withValues(alpha: 0.45) : AppPalette.border,
          child: InkWell(
            customBorder: const CircleBorder(),
            onTap: enabled ? onTap : null,
            child: Stack(
              alignment: Alignment.center,
              children: [
                Icon(
                  node.icon,
                  color: enabled ? Colors.white : const Color(0xFF9AA7AA),
                  size: 46,
                ),
                if (node.state == LessonState.complete)
                  const Positioned(
                    right: 11,
                    top: 9,
                    child: Icon(Icons.check_circle_rounded,
                        color: _yellow, size: 19),
                  ),
                if (node.state == LessonState.locked)
                  const Positioned(
                    right: 10,
                    bottom: 10,
                    child: Icon(Icons.lock_rounded,
                        color: Color(0xFF9BAEB2), size: 18),
                  ),
                if (isActive && enabled)
                  Positioned.fill(
                    child: IgnorePointer(
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                              color: const Color(0xCCFFFFFF), width: 3),
                        ),
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

class CharacterMarker extends StatelessWidget {
  const CharacterMarker({required this.icon, required this.color, super.key});

  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 74,
          height: 74,
          decoration: BoxDecoration(
            color: AppPalette.softSecondary,
            shape: BoxShape.circle,
            border: Border.all(color: AppPalette.secondaryDark, width: 5),
            boxShadow: const [
              BoxShadow(
                color: Color(0x55FFB703),
                offset: Offset(0, 5),
              ),
            ],
          ),
          alignment: Alignment.center,
          child: Icon(icon, color: color, size: 42),
        ),
        const SizedBox(height: 2),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(
            3,
            (index) => const Padding(
              padding: EdgeInsets.symmetric(horizontal: 2),
              child: Icon(
                Icons.star_rounded,
                color: AppPalette.secondaryDark,
                size: 16,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class LessonNode {
  const LessonNode({
    required this.index,
    required this.title,
    required this.subtitle,
    required this.description,
    required this.icon,
    required this.state,
  });

  final int index;
  final String title;
  final String subtitle;
  final String description;
  final IconData icon;
  final LessonState state;
}

enum LessonState { complete, current, locked }

class AchievementsPage extends StatelessWidget {
  const AchievementsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const SectionPlaceholder(
      title: 'Achievements',
      chineseTitle: '成就',
      icon: Icons.emoji_events_rounded,
      accent: _blue,
      message: 'XP、連續學習和成就會沿用現有資料設計。',
    );
  }
}

class ProfilePage extends StatelessWidget {
  const ProfilePage({this.authController, super.key});

  final StudentAuthController? authController;

  @override
  Widget build(BuildContext context) {
    final profile = authController?.profile;
    return SectionPlaceholder(
      title: 'Profile',
      chineseTitle: '帳戶',
      icon: Icons.person_rounded,
      accent: _pink,
      message: profile == null
          ? '目前使用本機測試模式。'
          : '${profile.displayName} (${profile.studentId})\n學習紀錄及讀音已連接 Firebase。',
      actionLabel: authController == null ? null : '登出',
      onAction: authController == null
          ? null
          : () {
              AppSfx.instance.play(SfxCue.click);
              authController!.logout();
            },
    );
  }
}

class SectionPlaceholder extends StatelessWidget {
  const SectionPlaceholder({
    required this.title,
    required this.chineseTitle,
    required this.icon,
    required this.accent,
    required this.message,
    this.actionLabel,
    this.onAction,
    super.key,
  });

  final String title;
  final String chineseTitle;
  final IconData icon;
  final Color accent;
  final String message;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 16),
            Text(
              title,
              style: const TextStyle(
                  fontSize: 15,
                  color: AppPalette.primaryDark,
                  fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 4),
            Text(
              chineseTitle,
              style: const TextStyle(
                  fontSize: 32, color: _text, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 28),
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                color: _panel,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: accent, width: 2),
                boxShadow: const [
                  BoxShadow(color: AppPalette.border, offset: Offset(0, 4)),
                ],
              ),
              child: Row(
                children: [
                  Icon(icon, color: accent, size: 46),
                  const SizedBox(width: 18),
                  Expanded(
                    child: Text(
                      message,
                      style: const TextStyle(
                          color: _text, fontSize: 16, height: 1.4),
                    ),
                  ),
                ],
              ),
            ),
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: 18),
              FilledButton.icon(
                onPressed: onAction,
                icon: const Icon(Icons.logout_rounded),
                label: Text(actionLabel!),
                style: FilledButton.styleFrom(
                  backgroundColor: AppPalette.danger,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(130, 48),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
