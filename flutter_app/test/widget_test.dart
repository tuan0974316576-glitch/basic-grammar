import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/core/app_palette.dart';
import 'package:dope_english/features/grammar/original_grammar_home.dart';
import 'package:dope_english/main.dart';

void main() {
  testWidgets('renders the grammar roadmap shell', (WidgetTester tester) async {
    await tester.pumpWidget(const DopeEnglishApp());

    expect(find.text('DOPE ENGLISH'), findsOneWidget);
    expect(find.text('Basic Grammar Game'), findsOneWidget);
    expect(find.text('COACH'), findsOneWidget);
    expect(find.text('練習題數'), findsOneWidget);
    expect(find.byKey(const Key('grammar-lesson-card-0')), findsOneWidget);
    expect(find.byKey(const Key('main-tab-文法')), findsOneWidget);
    expect(find.byKey(const Key('main-tab-詞彙')), findsOneWidget);
    expect(find.byKey(const Key('main-tab-Scan')), findsOneWidget);
  });

  testWidgets('uses the light stationery palette', (WidgetTester tester) async {
    await tester.pumpWidget(const DopeEnglishApp());

    final context = tester.element(find.text('Basic Grammar Game'));
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
    await tester.pumpWidget(const DopeEnglishApp());
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
  });

  testWidgets('starts Quiz 01 from the third roadmap node',
      (WidgetTester tester) async {
    await tester.pumpWidget(const DopeEnglishApp());
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
    await tester.pumpWidget(const DopeEnglishApp());
    final info = find.byKey(const Key('verb-table-roadmap-info'));
    await tester.ensureVisible(info);
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

    await tester.pumpWidget(const DopeEnglishApp());
    await tester.pumpAndSettle();

    expect(find.text('Basic Grammar Game'), findsOneWidget);
    expect(find.byKey(const Key('grammar-home-settings')), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
