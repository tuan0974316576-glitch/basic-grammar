import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:dope_english/core/app_palette.dart';
import 'package:dope_english/core/widgets/original_modal.dart';
import 'package:dope_english/core/widgets/stationery_frame.dart';
import 'package:dope_english/features/grammar/original_grammar_home.dart';
import 'package:dope_english/features/workshop/grammar_workshop_models.dart';
import 'package:dope_english/features/workshop/grammar_workshop_repository.dart';
import 'package:dope_english/main.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  testWidgets('opens English on Vocabulary by default',
      (WidgetTester tester) async {
    await tester.pumpWidget(const DopeEnglishApp());
    await tester.pumpAndSettle();

    expect(
      find.byKey(const Key('original-section-frame-vocabulary')),
      findsOneWidget,
    );
    expect(
      find.byKey(const Key('original-section-frame-grammar')),
      findsNothing,
    );
  });

  testWidgets('switching from ECON opens English on Vocabulary',
      (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({
      'a1-buddy-last-subject-v1': 'econ',
    });
    await tester.pumpWidget(const DopeEnglishApp());
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('econ-learning-menu-frame')), findsOneWidget);

    await tester.tap(find.byKey(const Key('subject-switcher')));
    await tester.pumpAndSettle();
    await tester.tap(find.text('ENGLISH'));
    await tester.pumpAndSettle();

    expect(
      find.byKey(const Key('original-section-frame-vocabulary')),
      findsOneWidget,
    );
  });

  testWidgets('shows the A1 Education logo intro before the app',
      (WidgetTester tester) async {
    await tester.pumpWidget(const DopeEnglishApp(
      showBrandIntro: true,
      initialEnglishTab: 0,
    ));

    expect(find.byKey(const Key('a1-brand-launch-logo')), findsOneWidget);
    expect(find.byKey(const Key('a1-buddy-brand-intro')), findsOneWidget);
    expect(
        find.byKey(const Key('original-section-frame-grammar')), findsNothing);

    await tester.pump(const Duration(milliseconds: 520));
    await tester.pump(const Duration(milliseconds: 1500));
    await tester.pumpAndSettle();

    expect(find.byKey(const Key('a1-brand-launch-logo')), findsNothing);
    expect(find.byKey(const Key('original-section-frame-grammar')),
        findsOneWidget);
  });

  testWidgets('does not wait for slow startup work before showing the app',
      (WidgetTester tester) async {
    final startup = Completer<void>();
    await tester.pumpWidget(DopeEnglishApp(
      showBrandIntro: true,
      startup: startup.future,
    ));

    await tester.pump(const Duration(milliseconds: 520));
    await tester.pump(const Duration(milliseconds: 1500));

    expect(
      find.byKey(const Key('original-section-frame-vocabulary')),
      findsOneWidget,
    );
    startup.complete();
    await tester.pumpAndSettle();
  });

  testWidgets('renders the grammar roadmap shell', (WidgetTester tester) async {
    await tester.pumpWidget(const DopeEnglishApp(initialEnglishTab: 0));

    expect(find.text('A1 EDUCATION'), findsOneWidget);
    expect(find.text('A1 BUDDY'), findsOneWidget);
    expect(find.text('COACH'), findsOneWidget);
    expect(find.text('練習題數'), findsOneWidget);
    expect(find.byKey(const Key('grammar-lesson-card-0')), findsOneWidget);
    expect(find.byKey(const Key('main-tab-文法')), findsOneWidget);
    expect(find.byKey(const Key('main-tab-詞彙')), findsOneWidget);
    expect(find.byKey(const Key('main-tab-研修')), findsOneWidget);
  });

  testWidgets('uses the light stationery palette', (WidgetTester tester) async {
    await tester.pumpWidget(const DopeEnglishApp(initialEnglishTab: 0));

    final context = tester.element(find.text('A1 BUDDY'));
    final scaffold = tester.widget<Scaffold>(find.byType(Scaffold).first);

    expect(Theme.of(context).brightness, Brightness.light);
    expect(
        Theme.of(context).textTheme.bodyMedium?.fontFamily, 'ChironGoRoundTC');
    expect(Theme.of(context).scaffoldBackgroundColor, AppPalette.background);
    expect(scaffold.backgroundColor, AppPalette.background);
    expect(find.byType(OriginalTabBar), findsOneWidget);
  });

  testWidgets('opens lesson details from a roadmap node',
      (WidgetTester tester) async {
    await tester.pumpWidget(const DopeEnglishApp(initialEnglishTab: 0));
    await tester.ensureVisible(find.byKey(const Key('grammar-lesson-card-0')));
    tester
        .widget<GestureDetector>(
          find.byKey(const Key('grammar-lesson-card-0')),
        )
        .onTap!
        .call();
    await tester.pump();
    await tester.pumpAndSettle();

    expect(find.text('分辨句子是否有主動動詞'), findsNWidgets(2));
    expect(find.text('LESSON 01'), findsOneWidget);
    expect(find.text('開始課堂'), findsOneWidget);
    expect(find.byType(OriginalLessonStartModal), findsOneWidget);
    expect(find.byType(BottomSheet), findsNothing);
    expect(
      tester
          .widget<StationeryFrame>(
            find.byKey(const Key('original-lesson-start-modal')),
          )
          .strokeWidth,
      4,
    );
    expect(
      tester
          .widget<OriginalDashedSurface>(
            find.byKey(const Key('original-lesson-start-details')),
          )
          .strokeWidth,
      2,
    );
  });

  testWidgets('starts Quiz 01 from the third roadmap node',
      (WidgetTester tester) async {
    await tester.pumpWidget(const DopeEnglishApp(initialEnglishTab: 0));
    await tester.ensureVisible(find.byKey(const Key('grammar-lesson-card-2')));
    tester
        .widget<GestureDetector>(
          find.byKey(const Key('grammar-lesson-card-2')),
        )
        .onTap!
        .call();
    await tester.pump();
    await tester.pumpAndSettle();

    expect(find.text('重組英文句子'), findsNWidgets(2));
    await tester.tap(find.text('開始課堂'));
    await tester.pumpAndSettle();

    expect(find.byKey(const Key('quiz-01-answer-line')), findsOneWidget);
    expect(find.byKey(const Key('quiz-01-word-bank')), findsOneWidget);
    expect(find.text('1/10'), findsOneWidget);
  });

  testWidgets('opens the full Verb Table without showing a keyboard',
      (WidgetTester tester) async {
    await tester.pumpWidget(const DopeEnglishApp(initialEnglishTab: 0));
    final info = find.byKey(const Key('verb-table-roadmap-info'));
    await tester.ensureVisible(info);
    final infoSticker = find.ancestor(
      of: info,
      matching: find.byType(OriginalDashedSurface),
    );
    expect(infoSticker, findsOneWidget);
    expect(
      tester.widget<OriginalDashedSurface>(infoSticker).backgroundColor,
      AppPalette.secondary,
    );
    expect(tester.getSize(info).width, closeTo(32, 0.01));
    expect(
      tester.getTopLeft(info).dy,
      lessThan(
        tester.getTopLeft(find.byKey(const Key('grammar-lesson-card-12'))).dy,
      ),
    );
    tester.widget<IconButton>(info).onPressed!.call();
    await tester.pump();
    await tester.runAsync(
      () => Future<void>.delayed(const Duration(milliseconds: 100)),
    );
    await tester.pump(const Duration(milliseconds: 500));

    expect(find.text('Verb Table 動詞表'), findsOneWidget);
    expect(find.byKey(const Key('verb-table-reference-list')), findsOneWidget);
    expect(find.byKey(const Key('verb-table-search-button')), findsOneWidget);
    expect(find.byIcon(Icons.search_rounded), findsOneWidget);
    expect(find.byType(TextField), findsNothing);
  });

  testWidgets('original home layout fits a compact phone',
      (WidgetTester tester) async {
    tester.view.devicePixelRatio = 1;
    tester.view.physicalSize = const Size(320, 568);
    addTearDown(tester.view.reset);

    await tester.pumpWidget(const DopeEnglishApp(initialEnglishTab: 0));
    await tester.pumpAndSettle();

    expect(find.text('A1 BUDDY'), findsOneWidget);
    expect(find.byKey(const Key('grammar-home-settings')), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('tab bar keeps a finite height so page body stays visible',
      (WidgetTester tester) async {
    await tester.pumpWidget(const DopeEnglishApp(initialEnglishTab: 0));
    final tabBarSize = tester.getSize(find.byType(OriginalTabBar));
    final homeSize = tester.getSize(find.byType(OriginalGrammarHome));

    expect(tabBarSize.height, lessThan(130));
    expect(homeSize.height, greaterThan(0));
  });

  testWidgets('switches tabs without leaving the main content blank',
      (WidgetTester tester) async {
    await tester.pumpWidget(
      DopeEnglishApp(
        workshopRepository: _FakeWorkshopRepository(),
        initialEnglishTab: 0,
      ),
    );
    await tester.tap(find.byKey(const Key('main-tab-研修')));
    await tester.pumpAndSettle();
    expect(find.text('研修'), findsWidgets);
    expect(
        find.byKey(const Key('grammar-workshop-topic-grid')), findsOneWidget);
    await tester.tap(find.byKey(const Key('main-tab-文法')));
    await tester.pumpAndSettle();
    expect(find.text('A1 BUDDY'), findsOneWidget);
  });

  testWidgets('main tabs keep one frame and settings geometry',
      (WidgetTester tester) async {
    tester.view.devicePixelRatio = 1;
    tester.view.physicalSize = const Size(390, 844);
    addTearDown(tester.view.reset);

    await tester.pumpWidget(
      DopeEnglishApp(
        workshopRepository: _FakeWorkshopRepository(),
        initialEnglishTab: 0,
      ),
    );
    await tester.pumpAndSettle();
    final grammarFrame = tester.getRect(
      find.byKey(const Key('original-section-frame-grammar')),
    );
    final grammarSettings = tester.getRect(
      find.byKey(const Key('grammar-home-settings')),
    );

    await tester.tap(find.byKey(const Key('main-tab-詞彙')));
    await tester.pumpAndSettle();
    final vocabFrame = tester.getRect(
      find.byKey(const Key('original-section-frame-vocabulary')),
    );
    final vocabSettings = tester.getRect(
      find.byKey(const Key('vocab-settings-button')),
    );

    expect(vocabFrame, grammarFrame);
    expect(vocabSettings, grammarSettings);

    await tester.tap(find.byKey(const Key('main-tab-研修')));
    await tester.pumpAndSettle();
    final workshopFrame = tester.getRect(
      find.byKey(const Key('original-section-frame-workshop')),
    );
    expect(workshopFrame, grammarFrame);
  });

  testWidgets('bottom tabs use the original dashed yellow selected state',
      (WidgetTester tester) async {
    await tester.pumpWidget(const DopeEnglishApp(initialEnglishTab: 0));

    OriginalDashedSurface tabSurface(String label) {
      final finder = find
          .descendant(
            of: find.byKey(Key('main-tab-$label')),
            matching: find.byType(OriginalDashedSurface),
          )
          .first;
      return tester.widget<OriginalDashedSurface>(finder);
    }

    expect(tabSurface('文法').backgroundColor, AppPalette.secondary);
    expect(tabSurface('文法').borderColor, Colors.white);
    expect(tabSurface('詞彙').backgroundColor, const Color(0xFFF8FBFB));
    expect(tabSurface('詞彙').borderColor, const Color(0xFFD9E5E7));

    await tester.tap(find.byKey(const Key('main-tab-詞彙')));
    await tester.pumpAndSettle();
    expect(tabSurface('詞彙').backgroundColor, AppPalette.secondary);
    expect(tabSurface('文法').backgroundColor, const Color(0xFFF8FBFB));
  });

  testWidgets('settings gear rotates while the original settings panel is open',
      (WidgetTester tester) async {
    await tester.pumpWidget(const DopeEnglishApp(initialEnglishTab: 0));

    AnimatedRotation rotation() => tester.widget<AnimatedRotation>(
          find.byKey(const Key('settings-icon-rotation')),
        );

    expect(rotation().turns, 0);
    await tester.tap(find.byKey(const Key('grammar-home-settings')));
    await tester.pump();
    expect(rotation().turns, closeTo(145 / 360, 0.0001));
    expect(find.byType(OriginalSettingsModal), findsOneWidget);
    expect(find.byType(BottomSheet), findsNothing);
    expect(
      tester
          .widget<StationeryFrame>(
            find.byKey(const Key('original-settings-modal')),
          )
          .strokeWidth,
      4,
    );
    expect(
      tester
          .widget<OriginalDashedSurface>(
            find.byKey(const Key('original-settings-volume-panel')),
          )
          .strokeWidth,
      2,
    );
    expect(find.byKey(const Key('original-modal-divider')), findsOneWidget);

    Navigator.of(tester.element(find.text('設定'))).pop();
    await tester.pumpAndSettle();
    expect(rotation().turns, 0);
  });
}

class _FakeWorkshopRepository implements GrammarWorkshopBankRepository {
  @override
  Future<GrammarWorkshopBank> load({bool forceRefresh = false}) async {
    return GrammarWorkshopBank(
      releaseId: 'test-release',
      version: 1,
      hash: 'test-hash',
      publishedAt: DateTime(2026, 8, 27),
      source: GrammarWorkshopSource.online,
      topics: const [
        GrammarWorkshopTopic(
          key: 'TENSES',
          label: 'TENSES',
          chineseLabel: '時態',
          kind: GrammarWorkshopKind.fill,
          questions: [],
        ),
      ],
    );
  }
}
