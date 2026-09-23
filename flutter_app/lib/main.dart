import 'dart:async';
import 'dart:math' as math;

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'core/app_palette.dart';
import 'core/app_brand.dart';
import 'core/app_sfx.dart';
import 'core/widgets/stationery_frame.dart';
import 'core/widgets/original_modal.dart';
import 'core/widgets/original_section_frame.dart';
import 'features/auth/student_auth_controller.dart';
import 'features/auth/student_login_screen.dart';
import 'features/grammar/correction/correction_lesson_question.dart';
import 'features/grammar/correction/correction_lesson_screen.dart';
import 'features/grammar/grammar_progress_controller.dart';
import 'features/grammar/lesson_01/lesson_01_screen.dart';
import 'features/grammar/lesson_02/lesson_02_screen.dart';
import 'features/grammar/lesson_03/lesson_03_screen.dart';
import 'features/grammar/lesson_04/lesson_04_screen.dart';
import 'features/grammar/lesson_05/lesson_05_screen.dart';
import 'features/grammar/lesson_11/lesson_11_screen.dart';
import 'features/grammar/lesson_12/lesson_12_screen.dart';
import 'features/grammar/original_grammar_home.dart';
import 'features/grammar/quiz_01/quiz_01_screen.dart';
import 'features/game/game_hub_screen.dart';
import 'features/econ/econ_concept_review_screen.dart';
import 'features/econ/econ_concept_review_models.dart';
import 'features/econ/econ_question_picker_screen.dart';
import 'features/econ/econ_question_repository.dart';
import 'features/econ/econ_leaderboard_screen.dart';
import 'features/econ/econ_learning_menu_screen.dart';
import 'features/econ/econ_palette.dart';
import 'features/vocabulary/vocab_audio_repository.dart';
import 'features/vocabulary/cloud_vocab_repository.dart';
import 'features/vocabulary/vocab_audio_reconciler.dart';
import 'features/vocabulary/vocab_cloud_store.dart';
import 'features/vocabulary/vocab_controller.dart';
import 'features/vocabulary/vocab_repository.dart';
import 'features/vocabulary/vocab_screen.dart';
import 'features/workshop/grammar_workshop_screen.dart';
import 'features/workshop/grammar_workshop_repository.dart';
import 'features/streak/streak_controller.dart';
import 'features/streak/streak_models.dart';
import 'features/streak/streak_repository.dart';
import 'features/streak/streak_widgets.dart';
import 'features/notifications/notification_controller.dart';
import 'features/profile/critter_avatar.dart';
import 'features/profile/student_profile_setup_screen.dart';

const _ink = AppPalette.background;
const _text = AppPalette.ink;
const _blue = AppPalette.primary;
const _blueDark = AppPalette.primaryDark;
const _mutedBlue = AppPalette.border;
const _pink = AppPalette.pink;
const _yellow = AppPalette.secondary;
const _panel = AppPalette.softPrimary;

enum AppDeviceClass { phone, tablet }

AppDeviceClass appDeviceClassForShortestSide(double shortestSide) {
  return shortestSide >= 600 ? AppDeviceClass.tablet : AppDeviceClass.phone;
}

List<DeviceOrientation> preferredOrientationsForDevice(
  AppDeviceClass deviceClass,
) {
  return deviceClass == AppDeviceClass.tablet
      ? const [
          DeviceOrientation.landscapeLeft,
          DeviceOrientation.landscapeRight,
        ]
      : const [DeviceOrientation.portraitUp];
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  LicenseRegistry.addLicense(() async* {
    final license = await rootBundle.loadString(
      'assets/fonts/OFL-Chiron-GoRound-TC.md',
    );
    yield LicenseEntryWithLineBreaks(['Chiron GoRound TC'], license);
  });
  final authController = StudentAuthController();
  final audioRepository = AssetVocabAudioRepository(
    cloudClient: FirebaseVocabAudioCloudClient(),
  );
  final startup = Future.wait<void>([
    AppSfx.instance.initialize(),
    authController.initialize(),
    const EconQuestionRepository().loadQuestions(),
  ]);
  runApp(
    DopeEnglishApp(
      authController: authController,
      audioRepository: audioRepository,
      startup: startup,
      showBrandIntro: true,
      showGameHub: false,
    ),
  );
}

class DopeEnglishApp extends StatelessWidget {
  const DopeEnglishApp({
    this.authController,
    this.audioRepository,
    this.grammarProgressController,
    this.workshopRepository,
    this.streakController,
    this.startup,
    this.showBrandIntro = false,
    this.showGameHub = false,
    this.initialEnglishTab = const int.fromEnvironment(
      'DOPE_INITIAL_TAB',
      defaultValue: 1,
    ),
    super.key,
  });

  final StudentAuthController? authController;
  final VocabAudioRepository? audioRepository;
  final GrammarProgressController? grammarProgressController;
  final GrammarWorkshopBankRepository? workshopRepository;
  final StreakController? streakController;
  final Future<void>? startup;
  final bool showBrandIntro;
  final bool showGameHub;
  final int initialEnglishTab;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: appDisplayName,
      theme: ThemeData(
        brightness: Brightness.light,
        fontFamily: 'ChironGoRoundTC',
        scaffoldBackgroundColor: _ink,
        colorScheme: ColorScheme.fromSeed(
          seedColor: _blue,
          brightness: Brightness.light,
          surface: AppPalette.paper,
        ),
        textTheme: ThemeData.light().textTheme.apply(
              fontFamily: 'ChironGoRoundTC',
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
      builder: (context, child) => _OrientationLock(child: child!),
      home: _BrandLaunchGate(
        enabled: showBrandIntro,
        startup: startup,
        child: authController == null
            ? AppShell(
                vocabAudioRepository: audioRepository,
                grammarProgressController: grammarProgressController,
                workshopRepository: workshopRepository,
                streakController: streakController,
                startAtGameHub: showGameHub,
                initialEnglishTab: initialEnglishTab,
              )
            : AnimatedBuilder(
                animation: authController!,
                builder: (context, _) {
                  return switch (authController!.status) {
                    // Auth restoration (especially an expired device session)
                    // may need the network. Keep the local vocabulary shell
                    // visible while it runs; the authenticated/login route
                    // swaps in automatically when the status resolves.
                    StudentAuthStatus.initializing => AppShell(
                        vocabAudioRepository: audioRepository,
                        grammarProgressController: grammarProgressController,
                        workshopRepository: workshopRepository,
                        streakController: streakController,
                        startAtGameHub: showGameHub,
                        initialEnglishTab: initialEnglishTab,
                      ),
                    StudentAuthStatus.authenticated => authController!
                            .needsProfileSetup
                        ? StudentProfileSetupScreen(
                            studentId: authController!.profile?.studentId ?? '',
                            initialName:
                                authController!.profile?.displayName ?? '',
                            initialAvatarSeed:
                                authController!.profile?.avatarSeed ?? '',
                            initialAvatarBackground:
                                authController!.profile?.avatarBackground ?? '',
                            initialAvatarOptions:
                                authController!.profile?.avatarOptions ??
                                    const <String, String>{},
                            isSubmitting: authController!.isSubmitting,
                            message: authController!.message,
                            onComplete: authController!.completeProfile,
                          )
                        : AppShell(
                            authController: authController,
                            vocabAudioRepository: audioRepository,
                            grammarProgressController:
                                grammarProgressController,
                            workshopRepository: workshopRepository,
                            streakController: streakController,
                            startAtGameHub: showGameHub,
                            initialEnglishTab: initialEnglishTab,
                          ),
                    StudentAuthStatus.signedOut ||
                    StudentAuthStatus.unavailable =>
                      StudentLoginScreen(controller: authController!),
                  };
                },
              ),
      ),
    );
  }
}

class _BrandLaunchGate extends StatefulWidget {
  const _BrandLaunchGate({
    required this.enabled,
    required this.startup,
    required this.child,
  });

  final bool enabled;
  final Future<void>? startup;
  final Widget child;

  @override
  State<_BrandLaunchGate> createState() => _BrandLaunchGateState();
}

class _BrandLaunchGateState extends State<_BrandLaunchGate>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _logoOpacity;
  late final Animation<double> _logoScale;
  late final Animation<Offset> _logoSlide;
  bool _introFinished = false;
  bool _startupFinished = false;
  bool _showApp = false;
  Timer? _introDelay;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1450),
    );
    _logoOpacity = Tween<double>(begin: 0.55, end: 1).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0, 0.56, curve: Curves.easeOut),
      ),
    );
    _logoScale = Tween<double>(begin: 0.86, end: 1).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0, 0.82, curve: Curves.easeOutBack),
      ),
    );
    _logoSlide = Tween<Offset>(
      begin: const Offset(0, 0.08),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic),
    );
    if (!widget.enabled) {
      _introFinished = true;
      _startupFinished = true;
      _showApp = true;
      return;
    }
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      _introDelay = Timer(const Duration(milliseconds: 500), () {
        if (!mounted) return;
        _controller.forward().whenComplete(() {
          if (!mounted) return;
          _introFinished = true;
          _revealWhenReady();
        });
      });
    });
    // Firebase/Auth and other startup work runs in parallel, but it must not
    // hold the app behind the logo. AppShell can render local vocabulary while
    // the auth state is being resolved.
    _startupFinished = true;
  }

  void _revealWhenReady() {
    if (_showApp || !_introFinished || !_startupFinished) return;
    setState(() => _showApp = true);
  }

  @override
  void dispose() {
    _introDelay?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 360),
      switchInCurve: Curves.easeOut,
      switchOutCurve: Curves.easeIn,
      child: _showApp
          ? KeyedSubtree(
              key: const ValueKey('a1-buddy-app'),
              child: widget.child,
            )
          : Scaffold(
              key: const ValueKey('a1-buddy-brand-intro'),
              backgroundColor: Colors.white,
              body: SafeArea(
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 28),
                    child: FadeTransition(
                      opacity: _logoOpacity,
                      child: SlideTransition(
                        position: _logoSlide,
                        child: ScaleTransition(
                          scale: _logoScale,
                          child: Image.asset(
                            appBrandLogoAsset,
                            key: const Key('a1-brand-launch-logo'),
                            width: 560,
                            fit: BoxFit.contain,
                            filterQuality: FilterQuality.high,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
    );
  }
}

class _OrientationLock extends StatefulWidget {
  const _OrientationLock({required this.child});

  final Widget child;

  @override
  State<_OrientationLock> createState() => _OrientationLockState();
}

class _OrientationLockState extends State<_OrientationLock> {
  AppDeviceClass? _lastDeviceClass;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final deviceClass = appDeviceClassForShortestSide(
      MediaQuery.sizeOf(context).shortestSide,
    );
    if (_lastDeviceClass == deviceClass) return;
    _lastDeviceClass = deviceClass;
    unawaited(_applyOrientationLock(deviceClass));
  }

  Future<void> _applyOrientationLock(AppDeviceClass deviceClass) async {
    try {
      await SystemChrome.setPreferredOrientations(
        preferredOrientationsForDevice(deviceClass),
      );
    } catch (_) {
      // Desktop/web test shells and unsupported embedders may not expose this
      // platform channel; the app remains usable without the lock.
    }
  }

  @override
  Widget build(BuildContext context) => widget.child;
}

class AppShell extends StatefulWidget {
  const AppShell({
    this.authController,
    this.vocabAudioRepository,
    this.vocabController,
    this.grammarProgressController,
    this.workshopRepository,
    this.streakController,
    this.startAtGameHub = false,
    this.initialEnglishTab = 1,
    super.key,
  });

  final StudentAuthController? authController;
  final VocabAudioRepository? vocabAudioRepository;
  final VocabController? vocabController;
  final GrammarProgressController? grammarProgressController;
  final GrammarWorkshopBankRepository? workshopRepository;
  final StreakController? streakController;
  final bool startAtGameHub;
  final int initialEnglishTab;

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  late int _selectedTab;
  double _econPracticeCount = 10;
  String _econLanguage = 'zh';
  late bool _gameHubOpen;
  GameSubject _gameSubject = GameSubject.eng;
  static const _subjectPreferenceKey = 'a1-buddy-last-subject-v1';
  bool _settingsOpen = false;
  bool _econLearningLessonOpen = false;
  bool _vocabKeyboardOpen = false;
  late final VocabController _vocabController;
  late final bool _ownsVocabController;
  late final VocabAudioRepository _vocabAudio;
  late final bool _ownsVocabAudio;
  late final VocabAudioReconciler _vocabAudioReconciler;
  late final GrammarProgressController _grammarProgress;
  late final bool _ownsGrammarProgress;
  late final StreakController _streakController;
  late final bool _ownsStreakController;
  StreakUpdate? _shownStreakUpdate;
  Timer? _streakOverlayTimer;
  OverlayEntry? _streakOverlayEntry;
  NotificationController? _notificationController;
  bool _notificationOfferOpen = false;

  @override
  void initState() {
    super.initState();
    _selectedTab =
        widget.initialEnglishTab >= 0 && widget.initialEnglishTab <= 2
            ? widget.initialEnglishTab
            : 1;
    _gameHubOpen = widget.startAtGameHub;
    unawaited(_restoreLastSubject());
    _ownsGrammarProgress = widget.grammarProgressController == null;
    _grammarProgress = widget.grammarProgressController ??
        GrammarProgressController(
          playerId: widget.authController?.profile?.studentId ?? 'guest',
        );
    _grammarProgress.addListener(_refreshGrammarProgress);
    unawaited(_grammarProgress.initialize());
    _ownsStreakController = widget.streakController == null;
    _streakController = widget.streakController ??
        StreakController(
          repository: widget.authController == null
              ? LocalStreakRepository()
              : FirebaseStreakRepository(),
        );
    _streakController.addListener(_refreshStreak);
    unawaited(_streakController.initialize());
    _ownsVocabController = widget.vocabController == null;
    _vocabController = widget.vocabController ??
        VocabController(
          lookupRepository: CloudVocabLookupRepository(),
          store: widget.authController == null
              ? const SharedPreferencesVocabStore()
              : CloudSyncedVocabStore(auth: FirebaseAuth.instance),
        );
    _ownsVocabAudio = widget.vocabAudioRepository == null;
    _vocabAudio = widget.vocabAudioRepository ??
        AssetVocabAudioRepository(
          cloudClient: FirebaseVocabAudioCloudClient(),
        );
    _applyVolume(AppSfx.instance.volume, persist: false);
    _vocabAudioReconciler = VocabAudioReconciler(
      audio: _vocabAudio,
      items: () => _vocabController.items,
      examples: _vocabController.loadExamplesForAudio,
      changes: _vocabController,
      connectivity: widget.authController == null ? null : Connectivity(),
      authenticated: () => widget.authController?.isAuthenticated ?? true,
    );
    if (widget.authController != null) {
      _notificationController = NotificationController(
        onStudyReminderOpened: _openStudyReminder,
      )..addListener(_refreshNotifications);
      unawaited(_notificationController!.initialize());
    }
    unawaited(_initializeVocabulary());
  }

  Future<void> _initializeVocabulary() async {
    if (_ownsVocabController) await _vocabController.initialize();
    if (!mounted) return;
    _vocabAudioReconciler.start();
  }

  Future<void> _restoreLastSubject() async {
    try {
      final preferences = await SharedPreferences.getInstance();
      final saved = preferences.getString(_subjectPreferenceKey);
      if (!mounted || saved == null) return;
      setState(() {
        _gameSubject = saved == 'econ' ? GameSubject.econ : GameSubject.eng;
        _selectedTab = _gameSubject == GameSubject.eng ? 1 : 0;
      });
    } catch (_) {
      // Keep ENG when the local preference is unavailable.
    }
  }

  Future<void> _switchSubject(GameSubject subject) async {
    if (_gameSubject == subject && !_gameHubOpen) return;
    setState(() {
      _gameSubject = subject;
      _selectedTab = subject == GameSubject.eng ? 1 : 0;
      _gameHubOpen = false;
      _vocabKeyboardOpen = false;
      _econLearningLessonOpen = false;
    });
    if (subject == GameSubject.econ) {
      unawaited(const EconQuestionRepository().loadQuestions());
    }
    try {
      final preferences = await SharedPreferences.getInstance();
      await preferences.setString(
        _subjectPreferenceKey,
        subject == GameSubject.econ ? 'econ' : 'eng',
      );
    } catch (_) {
      // Session state still changes when persistence is unavailable.
    }
  }

  void _refreshGrammarProgress() {
    if (mounted) setState(() {});
  }

  void _refreshStreak() {
    if (!mounted) return;
    final update = _streakController.lastUpdate;
    setState(() {});
    if (update == null ||
        !update.extended ||
        identical(update, _shownStreakUpdate)) {
      return;
    }
    _shownStreakUpdate = update;
    _streakOverlayTimer?.cancel();
    _streakOverlayEntry?.remove();
    final overlay = Overlay.of(context, rootOverlay: true);
    final entry = OverlayEntry(
      builder: (_) => StreakCelebrationOverlay(
        update: update,
        onDone: _dismissStreakOverlay,
      ),
    );
    _streakOverlayEntry = entry;
    overlay.insert(entry);
  }

  void _dismissStreakOverlay() {
    _streakOverlayTimer?.cancel();
    _streakOverlayTimer = null;
    _streakOverlayEntry?.remove();
    _streakOverlayEntry = null;
    _streakController.clearLastUpdate();
  }

  void _recordLearningActivity(String kind, String sourceId, int answerCount) {
    unawaited(_recordLearningActivityAndOfferNotifications(
      kind: kind,
      sourceId: sourceId,
      answerCount: answerCount,
    ));
  }

  Future<void> _recordLearningActivityAndOfferNotifications({
    required String kind,
    required String sourceId,
    required int answerCount,
  }) async {
    await _streakController.recordActivity(
      kind: kind,
      sourceId: sourceId,
      answerCount: answerCount,
    );
    final notifications = _notificationController;
    if (notifications == null) return;
    await notifications.noteLearningActivity(
      streakDays: _streakController.streak.days,
    );
    if (!mounted ||
        !notifications.shouldOfferPermission ||
        _notificationOfferOpen) {
      return;
    }
    await notifications.markPermissionOfferShown();
    if (!mounted) return;
    _notificationOfferOpen = true;
    await showOriginalModal<void>(
      context: context,
      barrierLabel: '關閉通知提示',
      child: Builder(
        builder: (modalContext) => NotificationPermissionOfferModal(
          onLater: () => Navigator.of(modalContext).pop(),
          onEnable: () async {
            Navigator.of(modalContext).pop();
            await notifications.enableRecommended();
          },
        ),
      ),
    );
    _notificationOfferOpen = false;
  }

  void _refreshNotifications() {
    if (mounted) setState(() {});
  }

  void _openStudyReminder() {
    if (!mounted) return;
    setState(() {
      _gameHubOpen = false;
      _gameSubject = GameSubject.eng;
      _selectedTab = _vocabController.dueCount > 0 ? 1 : 0;
      _vocabKeyboardOpen = false;
    });
  }

  void _setVocabKeyboardOpen(bool open) {
    if (!mounted || _vocabKeyboardOpen == open) return;
    setState(() => _vocabKeyboardOpen = open);
  }

  @override
  void dispose() {
    _streakOverlayTimer?.cancel();
    _streakOverlayEntry?.remove();
    _streakOverlayEntry = null;
    _streakController.removeListener(_refreshStreak);
    if (_ownsStreakController) _streakController.dispose();
    _notificationController?.removeListener(_refreshNotifications);
    _notificationController?.dispose();
    _grammarProgress.removeListener(_refreshGrammarProgress);
    if (_ownsGrammarProgress) _grammarProgress.dispose();
    unawaited(_vocabAudioReconciler.dispose());
    if (_ownsVocabController) _vocabController.dispose();
    if (_ownsVocabAudio) unawaited(_vocabAudio.dispose());
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppPalette.background,
      resizeToAvoidBottomInset: false,
      body: Stack(
        clipBehavior: Clip.none,
        children: [
          _gameHubOpen
              ? _buildGameHub(context)
              : OriginalHeaderAccessoryScope(
                  width: 38,
                  accessory: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      StreakBadge(
                        compact: true,
                        streak: _streakController.streak,
                        onTap: () => _showStreakPanel(context),
                      ),
                    ],
                  ),
                  child: _buildSelectedTab(context),
                ),
          if (!_gameHubOpen)
            Positioned(
              left: -14,
              top: 22,
              child: SubjectSwitcher(
                subject: _gameSubject,
                onChanged: (subject) {
                  AppSfx.instance.play(SfxCue.click);
                  unawaited(_switchSubject(subject));
                },
              ),
            ),
        ],
      ),
      bottomNavigationBar: _gameHubOpen
          ? null
          : _selectedTab == 1 && _vocabKeyboardOpen
              ? null
              : _gameSubject == GameSubject.econ
                  ? EconTabBar(
                      selectedIndex: _selectedTab,
                      onSelected: (index) {
                        AppSfx.instance.play(SfxCue.click);
                        setState(() {
                          _selectedTab = index;
                          _vocabKeyboardOpen = false;
                        });
                      },
                    )
                  : OriginalTabBar(
                      selectedIndex: _selectedTab,
                      onSelected: (index) {
                        AppSfx.instance.play(SfxCue.click);
                        setState(() {
                          _selectedTab = index;
                          if (index != 1) _vocabKeyboardOpen = false;
                        });
                      },
                    ),
    );
  }

  Widget _buildGameHub(BuildContext context) {
    return GameHubScreen(
      subject: _gameSubject,
      onSubjectChanged: (subject) {
        AppSfx.instance.play(SfxCue.click);
        setState(() => _gameSubject = subject);
      },
      onEnglishMode: _openEnglishMode,
      onEconMode: _openEconMode,
      onSettings: () => _showSettings(context),
      settingsActive: _settingsOpen,
    );
  }

  void _openEnglishMode(EnglishGameMode mode) {
    setState(() {
      _gameHubOpen = false;
      _gameSubject = GameSubject.eng;
      _selectedTab = switch (mode) {
        EnglishGameMode.grammar => 0,
        EnglishGameMode.review => 1,
        EnglishGameMode.workshop => 2,
      };
    });
  }

  void _openEconMode(EconGameMode mode) {
    unawaited(const EconQuestionRepository().loadQuestions());
    setState(() {
      _gameHubOpen = false;
      _gameSubject = GameSubject.econ;
      _selectedTab = switch (mode) {
        EconGameMode.learn => 0,
        EconGameMode.topics => 1,
        EconGameMode.year => 2,
      };
      _econLearningLessonOpen = false;
    });
  }

  Widget _buildSelectedTab(BuildContext context) {
    if (_gameSubject == GameSubject.econ) {
      return switch (_selectedTab) {
        0 => _econLearningLessonOpen
            ? EconConceptReviewScreen(
                questionCount: _econPracticeCount.round(),
                initialLanguage: _econLanguage == 'en'
                    ? EconReviewLanguage.en
                    : EconReviewLanguage.zh,
                onClose: () => setState(() => _econLearningLessonOpen = false),
                onCompleted: (count) =>
                    _recordLearningActivity('econ', 'concept-review', count),
              )
            : EconLearningMenuScreen(
                practiceCount: _econPracticeCount,
                language: _econLanguage,
                onLanguageChanged: (value) {
                  setState(() => _econLanguage = value);
                },
                onSettings: () => _showSettings(context),
                settingsActive: _settingsOpen,
                onPracticeCountChanged: (value) {
                  setState(() => _econPracticeCount = value);
                },
                onLessonTap: (chapterNo) {
                  if (chapterNo == 1) {
                    setState(() => _econLearningLessonOpen = true);
                  }
                },
              ),
        1 => EconQuestionPickerScreen(
            mode: EconGamePickerMode.topics,
            practiceCount: _econPracticeCount.round(),
            onPracticeCountChanged: (value) {
              setState(() => _econPracticeCount = value);
            },
            language: _econLanguage,
            onLanguageChanged: (value) {
              setState(() => _econLanguage = value);
            },
            onClose: () => setState(() => _selectedTab = 1),
            onSettings: () => _showSettings(context),
            settingsActive: _settingsOpen,
            onRoundCompleted: (count) =>
                _recordLearningActivity('econ', 'topic-practice', count),
          ),
        2 => EconQuestionPickerScreen(
            mode: EconGamePickerMode.year,
            practiceCount: _econPracticeCount.round(),
            language: _econLanguage,
            onLanguageChanged: (value) {
              setState(() => _econLanguage = value);
            },
            onClose: () => setState(() => _selectedTab = 2),
            onSettings: () => _showSettings(context),
            settingsActive: _settingsOpen,
            onRoundCompleted: (count) =>
                _recordLearningActivity('econ', 'paper-practice', count),
          ),
        _ => EconLeaderboardScreen(
            onClose: () => setState(() => _selectedTab = 3),
            onSettings: () => _showSettings(context),
            settingsActive: _settingsOpen,
          ),
      };
    }
    return switch (_selectedTab) {
      0 => OriginalGrammarHome(
          lessonProgress: _grammarProgress.progressByIndex,
          onLessonTap: (index) => _showLessonSheet(context, index),
          onVerbTableInfo: () {
            AppSfx.instance.play(SfxCue.click);
            openVerbTableReference(
              context,
              audioRepository: widget.vocabAudioRepository,
            );
          },
          onSettings: () => _showSettings(context),
          settingsActive: _settingsOpen,
        ),
      1 => VocabularyScreen(
          controller: _vocabController,
          audioRepository: _vocabAudio,
          onSettings: () => _showSettings(context),
          onKeyboardVisibilityChanged: _setVocabKeyboardOpen,
          settingsActive: _settingsOpen,
          onReviewCompleted: (count) =>
              _recordLearningActivity('vocabulary', 'training', count),
        ),
      _ => GrammarWorkshopScreen(
          repository: widget.workshopRepository,
          onSettings: () => _showSettings(context),
          settingsActive: _settingsOpen,
          onRoundCompleted: (count) =>
              _recordLearningActivity('workshop', 'grammar-workshop', count),
        ),
    };
  }

  void _showLessonSheet(BuildContext context, int index) {
    final lesson = _originalLessonDetails[index];
    unawaited(showOriginalModal<void>(
      context: context,
      barrierLabel: '關閉課堂資料',
      child: OriginalLessonStartModal(
        lessonLabel: lesson.$2,
        title: lesson.$1,
        description: lesson.$3,
        sfx: AppSfx.instance,
        onStart: () => _startLesson(context, index),
      ),
    ));
  }

  void _startLesson(BuildContext sheetContext, int index) {
    Navigator.of(sheetContext).pop();
    var correctCount = 0;
    var activityRecorded = false;
    void recordCorrect() {
      unawaited(_grammarProgress.recordCorrect(index));
      correctCount += 1;
      if (!activityRecorded && correctCount >= 5) {
        activityRecorded = true;
        _recordLearningActivity('grammar', 'lesson-${index + 1}', correctCount);
      }
    }

    final lessonScreen = switch (index) {
      0 => Lesson01Screen(onQuestionCorrect: recordCorrect),
      1 => Lesson02Screen(onQuestionCorrect: recordCorrect),
      2 => Quiz01Screen(onQuestionCorrect: recordCorrect),
      3 => Lesson03Screen(onQuestionCorrect: recordCorrect),
      4 => Lesson04Screen(onQuestionCorrect: recordCorrect),
      5 => Lesson05Screen(onQuestionCorrect: recordCorrect),
      6 => CorrectionLessonScreen(
          config: lesson06Config,
          onQuestionCorrect: recordCorrect,
        ),
      7 => CorrectionLessonScreen(
          config: lesson07Config,
          onQuestionCorrect: recordCorrect,
        ),
      8 => CorrectionLessonScreen(
          config: lesson08Config,
          onQuestionCorrect: recordCorrect,
        ),
      9 => CorrectionLessonScreen(
          config: lesson09Config,
          onQuestionCorrect: recordCorrect,
        ),
      10 => CorrectionLessonScreen(
          config: lesson10Config,
          onQuestionCorrect: recordCorrect,
        ),
      11 => Lesson11Screen(onQuestionCorrect: recordCorrect),
      12 => Lesson12Screen(
          audioRepository: widget.vocabAudioRepository,
          onQuestionCorrect: recordCorrect,
        ),
      13 => CorrectionLessonScreen(
          config: lesson13Config,
          onQuestionCorrect: recordCorrect,
        ),
      _ => null,
    };
    if (lessonScreen == null) return;
    Future<void>.delayed(Duration.zero, () {
      if (!mounted) return;
      Navigator.of(context).push(
        MaterialPageRoute<void>(builder: (_) => lessonScreen),
      );
    });
  }

  void _showStreakPanel(BuildContext context) {
    unawaited(AppSfx.instance.play(SfxCue.click));
    unawaited(showOriginalModal<void>(
      context: context,
      barrierLabel: '關閉連續學習紀錄',
      child: Builder(
        builder: (modalContext) => AnimatedBuilder(
          animation: _streakController,
          builder: (_, __) => StreakPanel(
            streak: _streakController.streak,
            onClose: () {
              unawaited(AppSfx.instance.play(SfxCue.close));
              Navigator.of(modalContext).pop();
            },
          ),
        ),
      ),
    ));
  }

  void _showSettings(BuildContext context) {
    setState(() => _settingsOpen = true);
    unawaited(AppSfx.instance.play(SfxCue.click));
    final profile = widget.authController?.profile;
    final modal = showOriginalModal<void>(
      context: context,
      barrierLabel: '關閉設定',
      child: OriginalSettingsModal(
        initialVolume: AppSfx.instance.volume,
        onVolumeChanged: (value) => _applyVolume(value, persist: false),
        onVolumeCommitted: (value) => _applyVolume(value, persist: true),
        sfx: AppSfx.instance,
        accentColor: _gameSubject == GameSubject.econ
            ? EconPalette.primary
            : AppPalette.primary,
        accentDarkColor: _gameSubject == GameSubject.econ
            ? EconPalette.primaryDark
            : AppPalette.primaryDark,
        accentSoftColor: _gameSubject == GameSubject.econ
            ? EconPalette.softPrimary
            : AppPalette.softPrimary,
        accentShadowColor: _gameSubject == GameSubject.econ
            ? EconPalette.border
            : const Color(0xFFBDE0E1),
        notificationPreferences: _notificationController?.preferences,
        onNotificationCategoryChanged: _notificationController?.setCategory,
        onReminderMinutesChanged: _notificationController?.setReminderMinutes,
        profileName: profile?.displayName,
        profilePreview: profile?.avatarSeed.isNotEmpty == true
            ? Center(
                child: CritterAvatar(
                  seed: profile!.avatarSeed,
                  background: profile.avatarBackground.isEmpty
                      ? studentAvatarBackgrounds.first
                      : profile.avatarBackground,
                  options: profile.avatarOptions,
                  size: 46,
                  borderColor: Colors.white,
                  borderWidth: 3,
                  animate: false,
                ),
              )
            : null,
        onEditProfile: widget.authController == null
            ? null
            : () => _openProfileEditor(context),
        onLogout: widget.authController == null
            ? null
            : () {
                Navigator.of(context).pop();
                unawaited(_logout());
              },
      ),
    );
    unawaited(modal.whenComplete(() {
      if (mounted) setState(() => _settingsOpen = false);
    }));
  }

  void _openProfileEditor(BuildContext settingsContext) {
    final auth = widget.authController;
    final profile = auth?.profile;
    if (auth == null || profile == null) return;
    Navigator.of(settingsContext).pop();
    Future<void>.delayed(Duration.zero, () {
      if (!mounted) return;
      Navigator.of(context).push(
        MaterialPageRoute<void>(
          builder: (_) => AnimatedBuilder(
            animation: auth,
            builder: (_, __) => StudentProfileSetupScreen(
              studentId: auth.profile?.studentId ?? profile.studentId,
              initialName: auth.profile?.displayName ?? profile.displayName,
              initialAvatarSeed: auth.profile?.avatarSeed ?? profile.avatarSeed,
              initialAvatarBackground:
                  auth.profile?.avatarBackground ?? profile.avatarBackground,
              initialAvatarOptions:
                  auth.profile?.avatarOptions ?? profile.avatarOptions,
              initialStep: 1,
              isSubmitting: auth.isSubmitting,
              message: auth.message,
              onComplete: ({
                required displayName,
                required avatarSeed,
                required avatarBackground,
                avatarOptions = const <String, String>{},
              }) async {
                final saved = await auth.completeProfile(
                  displayName: displayName,
                  avatarSeed: avatarSeed,
                  avatarBackground: avatarBackground,
                  avatarOptions: avatarOptions,
                );
                if (saved && mounted && Navigator.of(context).canPop()) {
                  Navigator.of(context).pop();
                }
                return saved;
              },
            ),
          ),
        ),
      );
    });
  }

  Future<void> _logout() async {
    await _notificationController?.unregisterForLogout();
    await widget.authController?.logout();
  }

  void _applyVolume(double value, {required bool persist}) {
    unawaited(AppSfx.instance.setVolume(value, persist: persist));
    final audio = _vocabAudio;
    if (audio is VocabAudioVolumeController) {
      unawaited(
        (audio as VocabAudioVolumeController).setPlaybackVolume(value),
      );
    }
  }
}

const _originalLessonDetails = <(String, String, String)>[
  ('分辨句子是否有主動動詞', 'LESSON 01', '分辨句子何時要 is/am/are'),
  ('一句句子必須只有一個動詞', 'LESSON 02', '分辨正確句、沒有動詞、兩個動詞'),
  ('重組英文句子', 'QUIZ 01', '看中文，砌出正確英文句子'),
  ('何謂句子', 'LESSON 03', '用顏色 underline 分句'),
  ('代名詞', 'LESSON 04', '配對主語、非主語、的、的東西'),
  ('代名詞句子 MC', 'LESSON 05', '看英文空格，選正確代名詞'),
  ('可數名詞的使用要點', 'LESSON 06', '判斷名詞單眾數，錯句要改正'),
  ('名詞的類別', 'LESSON 07', '可數、不可數、ING、專有名詞'),
  ('Modal Verb 的要訣', 'LESSON 08', 'can / will / should / may / must'),
  ('Adjective 形容詞', 'LESSON 09', 'happy / useful / interested in / willing to'),
  ('Adverb 副詞', 'LESSON 10', '句首、句中、句尾副詞位置'),
  ('Tenses 時態分辨', 'LESSON 11', '可選時態範圍，再填動詞形式'),
  ('Verb Table 動詞四式', 'LESSON 12', '現在式、過去式、PP、ING 配對'),
  ('「有」的主要用法', 'LESSON 13', 'There be / with / without / have'),
];

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
  const Roadmap({
    required this.activeNode,
    required this.onNodeTap,
    required this.onInfoTap,
    super.key,
  });

  final int activeNode;
  final ValueChanged<LessonNode> onNodeTap;
  final ValueChanged<LessonNode> onInfoTap;

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
      state: LessonState.current,
    ),
    LessonNode(
      index: 4,
      title: '代名詞',
      subtitle: 'LESSON 04',
      description: '配對主語、非主語和所有格代名詞。',
      icon: Icons.fitness_center_rounded,
      state: LessonState.current,
    ),
    LessonNode(
      index: 5,
      title: '代名詞句子',
      subtitle: 'LESSON 05',
      description: '用文法判斷句子中的代名詞。',
      icon: Icons.videocam_rounded,
      state: LessonState.current,
    ),
    LessonNode(
      index: 6,
      title: '可數名詞',
      subtitle: 'LESSON 06',
      description: '掌握單數、眾數和冠詞的使用。',
      icon: Icons.menu_book_rounded,
      state: LessonState.current,
    ),
    LessonNode(
      index: 7,
      title: '名詞的類別',
      subtitle: 'LESSON 07',
      description: '分辨可數、不可數、ING 名詞和專有名詞。',
      icon: Icons.category_rounded,
      state: LessonState.current,
    ),
    LessonNode(
      index: 8,
      title: 'Modal Verb',
      subtitle: 'LESSON 08',
      description: '掌握情態動詞和原型動詞的配搭。',
      icon: Icons.bolt_rounded,
      state: LessonState.current,
    ),
    LessonNode(
      index: 9,
      title: 'Adjective',
      subtitle: 'LESSON 09',
      description: '認識形容詞的位置和正確寫法。',
      icon: Icons.palette_rounded,
      state: LessonState.current,
    ),
    LessonNode(
      index: 10,
      title: 'Adverb',
      subtitle: 'LESSON 10',
      description: '掌握副詞在句首、句中和句尾的位置。',
      icon: Icons.speed_rounded,
      state: LessonState.current,
    ),
    LessonNode(
      index: 11,
      title: 'Tenses',
      subtitle: 'LESSON 11',
      description: '分辨時態，再寫出正確動詞形式。',
      icon: Icons.schedule_rounded,
      state: LessonState.current,
    ),
    LessonNode(
      index: 12,
      title: 'Verb Table',
      subtitle: 'LESSON 12',
      description: '練習現在式、過去式、PP 和 ING。',
      icon: Icons.grid_view_rounded,
      state: LessonState.current,
    ),
    LessonNode(
      index: 13,
      title: '「有」的用法',
      subtitle: 'LESSON 13',
      description: '分辨 There be、with 和 have。',
      icon: Icons.add_circle_rounded,
      state: LessonState.current,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;
        final height = nodes.length * 148.0 + 100;
        const xPattern = [.28, .70, .36, .68, .30, .68, .42];
        final xPositions = List.generate(
          nodes.length,
          (index) => width * xPattern[index % xPattern.length],
        );
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
                    onInfo: nodes[index].index == 12
                        ? () => onInfoTap(nodes[index])
                        : null,
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
    this.onInfo,
    super.key,
  });

  final LessonNode node;
  final bool isActive;
  final VoidCallback onTap;
  final VoidCallback? onInfo;

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
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            Positioned.fill(
              child: Material(
                color: background,
                shape: CircleBorder(
                  side: BorderSide(
                    color: enabled ? _blueDark : AppPalette.border,
                    width: 3,
                  ),
                ),
                elevation: isActive ? 8 : 3,
                shadowColor: enabled
                    ? _blueDark.withValues(alpha: 0.45)
                    : AppPalette.border,
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
                          child: Icon(
                            Icons.check_circle_rounded,
                            color: _yellow,
                            size: 19,
                          ),
                        ),
                      if (node.state == LessonState.locked)
                        const Positioned(
                          right: 10,
                          bottom: 10,
                          child: Icon(
                            Icons.lock_rounded,
                            color: Color(0xFF9BAEB2),
                            size: 18,
                          ),
                        ),
                      if (isActive && enabled)
                        Positioned.fill(
                          child: IgnorePointer(
                            child: DecoratedBox(
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: const Color(0xCCFFFFFF),
                                  width: 3,
                                ),
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),
            if (onInfo != null)
              Positioned(
                right: -7,
                top: -7,
                child: IconButton(
                  key: const Key('verb-table-roadmap-info'),
                  tooltip: 'Verb Table',
                  onPressed: onInfo,
                  icon: const Icon(Icons.info_rounded, size: 20),
                  style: IconButton.styleFrom(
                    minimumSize: const Size(34, 34),
                    maximumSize: const Size(34, 34),
                    padding: EdgeInsets.zero,
                    backgroundColor: AppPalette.softSecondary,
                    foregroundColor: AppPalette.secondaryDark,
                    side: const BorderSide(
                      color: AppPalette.secondaryDark,
                      width: 2,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),
              ),
          ],
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
    if (profile == null) {
      return const SectionPlaceholder(
        title: 'Profile',
        chineseTitle: '帳戶',
        icon: Icons.person_rounded,
        accent: _pink,
        message: '目前使用本機測試模式。',
      );
    }
    return SafeArea(
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 440),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (profile.avatarSeed.isNotEmpty)
                  CritterAvatar(
                    seed: profile.avatarSeed,
                    background: profile.avatarBackground.isEmpty
                        ? studentAvatarBackgrounds.first
                        : profile.avatarBackground,
                    options: profile.avatarOptions,
                    size: 132,
                    borderColor: AppPalette.primary,
                    borderWidth: 4,
                  )
                else
                  const CircleAvatar(
                    radius: 66,
                    backgroundColor: AppPalette.softPrimary,
                    child: Icon(
                      Icons.person_rounded,
                      size: 62,
                      color: AppPalette.primaryDark,
                    ),
                  ),
                const SizedBox(height: 18),
                Text(
                  profile.displayName,
                  style: const TextStyle(
                    color: AppPalette.ink,
                    fontSize: 25,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  profile.studentId,
                  style: const TextStyle(
                    color: AppPalette.muted,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 24),
                OutlinedButton.icon(
                  onPressed: () {
                    AppSfx.instance.play(SfxCue.click);
                    authController?.logout();
                  },
                  icon: const Icon(Icons.logout_rounded),
                  label: const Text('登出'),
                ),
              ],
            ),
          ),
        ),
      ),
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
