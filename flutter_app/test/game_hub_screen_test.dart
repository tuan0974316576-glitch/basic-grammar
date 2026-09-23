import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/game/game_hub_screen.dart';

void main() {
  testWidgets('shows the three ENG game modes by default',
      (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: GameHubScreen(
          subject: GameSubject.eng,
          onSubjectChanged: (_) {},
          onEnglishMode: (_) {},
          onEconMode: (_) {},
          onSettings: () {},
        ),
      ),
    );

    expect(find.text('ENG'), findsOneWidget);
    expect(find.text('文法'), findsOneWidget);
    expect(find.text('重溫'), findsOneWidget);
    expect(find.text('研修'), findsOneWidget);
    expect(find.text('學習'), findsNothing);
    expect(find.byKey(const Key('game-hub-mode-list')), findsOneWidget);
  });

  testWidgets('switches the mode list to ECON', (WidgetTester tester) async {
    var selectedSubject = GameSubject.eng;
    await tester.pumpWidget(
      MaterialApp(
        home: StatefulBuilder(
          builder: (context, setState) => GameHubScreen(
            subject: selectedSubject,
            onSubjectChanged: (value) =>
                setState(() => selectedSubject = value),
            onEnglishMode: (_) {},
            onEconMode: (_) {},
            onSettings: () {},
          ),
        ),
      ),
    );

    await tester.tap(find.byKey(const Key('game-hub-subject-ECON')));
    await tester.pumpAndSettle();

    expect(find.text('學習'), findsOneWidget);
    expect(find.text('逐課操'), findsOneWidget);
    expect(find.text('逐份操'), findsOneWidget);
    expect(find.text('By Topics'), findsOneWidget);
    expect(find.text('By Year'), findsOneWidget);
    expect(find.text('文法'), findsNothing);
  });

  testWidgets('reports the selected ENG mode', (WidgetTester tester) async {
    EnglishGameMode? selectedMode;
    await tester.pumpWidget(
      MaterialApp(
        home: GameHubScreen(
          subject: GameSubject.eng,
          onSubjectChanged: (_) {},
          onEnglishMode: (mode) => selectedMode = mode,
          onEconMode: (_) {},
          onSettings: () {},
        ),
      ),
    );

    await tester.tap(find.byKey(const Key('game-hub-mode-研修')));
    expect(selectedMode, EnglishGameMode.workshop);
  });

  testWidgets('subject switcher uses full subject names',
      (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: SubjectSwitcher(
            subject: GameSubject.econ,
            onChanged: (_) {},
          ),
        ),
      ),
    );

    await tester.tap(find.byKey(const Key('subject-switcher')));
    await tester.pumpAndSettle();

    expect(find.text('ENGLISH'), findsOneWidget);
    expect(find.text('ECONOMICS'), findsOneWidget);
  });
}
