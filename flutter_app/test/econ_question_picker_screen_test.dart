import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/econ/econ_practice_screen.dart';
import 'package:dope_english/features/econ/econ_question_models.dart';
import 'package:dope_english/features/econ/econ_question_picker_screen.dart';
import 'package:dope_english/features/econ/econ_question_repository.dart';

void main() {
  const questions = [
    EconQuestion(
      id: 'p1',
      language: 'zh',
      chapterNo: 1,
      chapterTitle: '基本經濟概念',
      keyPoint: '機會成本',
      paper: EconPaper.p1,
      year: 2023,
      questionRef: 'Q1',
      questionType: 'singleChoice',
      stem: '以下哪項正確？',
      choices: [
        EconChoice(id: 'A', text: '選項 A'),
        EconChoice(id: 'B', text: '選項 B'),
      ],
      correctChoice: 'B',
    ),
    EconQuestion(
      id: 'mock-p1',
      language: 'zh',
      chapterNo: 2,
      chapterTitle: '市場',
      keyPoint: '供求',
      paper: EconPaper.p1,
      year: 2025,
      mockSet: 'Mock Test 1',
      sourceType: 'mock',
      questionRef: 'Q1',
      questionType: 'singleChoice',
      stem: '模擬題',
      choices: [EconChoice(id: 'A', text: '選項 A')],
      correctChoice: 'A',
    ),
  ];

  testWidgets('topic picker opens the selected chapter', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: EconQuestionPickerScreen(
          mode: EconGamePickerMode.topics,
          repository: _FakeRepository(questions),
          onSettings: _noop,
        ),
      ),
    );
    await tester.pump();

    expect(find.text('基本經濟概念'), findsOneWidget);
    expect(find.byKey(const Key('econ-picker-settings')), findsOneWidget);
    expect(find.byKey(const Key('econ-language-switch')), findsOneWidget);
    expect(find.text('中文'), findsNothing);
    expect(find.text('English'), findsNothing);
    expect(find.byTooltip('返回'), findsNothing);
    expect(find.text('啱 0 · 錯 0'), findsNWidgets(2));
    expect(find.text('機會成本'), findsNothing);
    await tester.tap(find.byKey(const Key('econ-chapter-1')));
    await tester.pumpAndSettle();
    expect(find.byType(EconPracticeScreen), findsOneWidget);
    expect(find.text('選項 B'), findsOneWidget);
    expect(find.text('B. 選項 B'), findsNothing);
  });

  testWidgets('year picker separates past and mock sets', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: EconQuestionPickerScreen(
          mode: EconGamePickerMode.year,
          repository: _FakeRepository(questions),
          onSettings: _noop,
        ),
      ),
    );
    await tester.pump();

    expect(find.text('歷屆試卷'), findsOneWidget);
    expect(find.byKey(const Key('econ-language-switch')), findsOneWidget);
    expect(find.text('中文'), findsNothing);
    expect(find.text('2023'), findsOneWidget);
    await tester.tap(find.text('模擬試卷'));
    await tester.pump();
    expect(find.text('模擬試卷 1'), findsOneWidget);
    expect(find.text('2023'), findsNothing);
  });

  testWidgets('English year picker uses Past Paper and Mock Paper labels',
      (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: EconQuestionPickerScreen(
          mode: EconGamePickerMode.year,
          language: 'en',
          repository: _FakeRepository(questions),
          onSettings: _noop,
        ),
      ),
    );
    await tester.pump();

    expect(find.text('Past Paper'), findsOneWidget);
    expect(find.text('Mock Paper'), findsOneWidget);
    expect(find.text('Paper 1 MC'), findsOneWidget);
    expect(find.text('Paper 2 LQ'), findsOneWidget);
  });

  testWidgets('moves a correctly checked topic question to the back',
      (tester) async {
    const first = EconQuestion(
      id: 'topic-first',
      language: 'zh',
      chapterNo: 1,
      chapterTitle: '基本經濟概念',
      keyPoint: '機會成本',
      paper: EconPaper.p1,
      year: 2023,
      questionRef: 'Q1',
      questionType: 'singleChoice',
      stem: '第一題',
      choices: [EconChoice(id: 'A', text: '第一題正確')],
      correctChoice: 'A',
    );
    const second = EconQuestion(
      id: 'topic-second',
      language: 'zh',
      chapterNo: 1,
      chapterTitle: '基本經濟概念',
      keyPoint: '稀少性',
      paper: EconPaper.p1,
      year: 2024,
      questionRef: 'Q1',
      questionType: 'singleChoice',
      stem: '第二題',
      choices: [EconChoice(id: 'A', text: '第二題正確')],
      correctChoice: 'A',
    );
    await tester.pumpWidget(
      MaterialApp(
        home: EconQuestionPickerScreen(
          mode: EconGamePickerMode.topics,
          practiceCount: 1,
          repository: const _FakeRepository([first, second]),
          onSettings: _noop,
        ),
      ),
    );
    await tester.pump();

    await tester.tap(find.byKey(const Key('econ-chapter-1')));
    await tester.pumpAndSettle();
    expect(find.text('第一題'), findsOneWidget);
    await tester.tap(find.text('第一題正確'));
    await tester.pump();
    await tester.tap(find.byKey(const Key('econ-check-answer')));
    await tester.pump();
    await tester.tap(find.text('< Menu'));
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('econ-chapter-1')));
    await tester.pumpAndSettle();
    expect(find.text('第二題'), findsOneWidget);
  });
}

void _noop() {}

class _FakeRepository implements EconQuestionBankRepository {
  const _FakeRepository(this.questions);

  final List<EconQuestion> questions;

  @override
  Future<List<EconQuestion>> loadQuestions() async => questions;
}
