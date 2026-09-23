import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/econ/econ_learning_menu_screen.dart';

void main() {
  testWidgets('shows chapter menu and only unlocks current lesson',
      (tester) async {
    int? selectedChapter;
    await tester.pumpWidget(
      MaterialApp(
        home: EconLearningMenuScreen(
          onLessonTap: (chapter) => selectedChapter = chapter,
          onSettings: () {},
        ),
      ),
    );
    await tester.pump();

    expect(find.byKey(const Key('econ-learning-chapter-list')), findsOneWidget);
    expect(find.byKey(const Key('econ-learning-settings')), findsOneWidget);
    expect(find.byKey(const Key('econ-language-switch')), findsOneWidget);
    expect(find.byType(Slider), findsOneWidget);
    expect(find.text('練習題數'), findsOneWidget);
    expect(find.byType(Slider), findsOneWidget);
    expect(find.text('由基本概念開始，逐課建立 ECON 基礎。'), findsNothing);
    expect(find.text('CHAPTER 01'), findsNWidgets(2));
    expect(find.text('基本經濟概念'), findsOneWidget);
    final chapterList = find.byKey(const Key('econ-learning-chapter-list'));
    final marketStructure = find.text('市場結構');
    await tester.dragUntilVisible(
      marketStructure,
      chapterList,
      const Offset(0, -180),
    );
    expect(find.text('CHAPTER 12'), findsNWidgets(2));
    expect(marketStructure, findsOneWidget);
    await tester.ensureVisible(marketStructure);
    await tester.pumpAndSettle();
    await tester.tap(marketStructure);
    expect(selectedChapter, isNull);
    await tester.dragUntilVisible(
      find.text('基本經濟概念'),
      chapterList,
      const Offset(0, 180),
    );
    await tester.tap(find.text('基本經濟概念'));
    expect(selectedChapter, 1);
  });
}
