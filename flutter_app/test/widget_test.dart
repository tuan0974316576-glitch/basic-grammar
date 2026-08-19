import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/core/app_palette.dart';
import 'package:dope_english/main.dart';

void main() {
  testWidgets('renders the grammar roadmap shell', (WidgetTester tester) async {
    await tester.pumpWidget(const DopeEnglishApp());

    expect(find.text('English Grammar Basics'), findsOneWidget);
    expect(find.byIcon(Icons.menu_book_rounded), findsWidgets);
    expect(find.byIcon(Icons.fitness_center_rounded), findsWidgets);
  });

  testWidgets('uses the light stationery palette', (WidgetTester tester) async {
    await tester.pumpWidget(const DopeEnglishApp());

    final context = tester.element(find.text('English Grammar Basics'));
    final navigation = tester.widget<NavigationBar>(find.byType(NavigationBar));

    expect(Theme.of(context).brightness, Brightness.light);
    expect(
        Theme.of(context).textTheme.bodyMedium?.fontFamily, 'ChironGoRoundTC');
    expect(Theme.of(context).scaffoldBackgroundColor, AppPalette.background);
    expect(navigation.backgroundColor, AppPalette.paper);
    expect(navigation.indicatorColor, AppPalette.softPrimary);
  });

  testWidgets('opens lesson details from a roadmap node',
      (WidgetTester tester) async {
    await tester.pumpWidget(const DopeEnglishApp());
    await tester.tap(find.byIcon(Icons.menu_book_rounded).first);
    await tester.pumpAndSettle();

    expect(find.text('分辨句子是否有主動動詞。'), findsOneWidget);
    expect(find.text('開始課堂'), findsOneWidget);
  });

  testWidgets('starts Quiz 01 from the third roadmap node',
      (WidgetTester tester) async {
    await tester.pumpWidget(const DopeEnglishApp());
    await tester.tap(find.byIcon(Icons.videocam_rounded).first);
    await tester.pumpAndSettle();

    expect(find.text('重組句子'), findsOneWidget);
    await tester.tap(find.text('開始課堂'));
    await tester.pumpAndSettle();

    expect(find.byKey(const Key('quiz-01-answer-line')), findsOneWidget);
    expect(find.byKey(const Key('quiz-01-word-bank')), findsOneWidget);
    expect(find.text('1/10'), findsOneWidget);
  });
}
