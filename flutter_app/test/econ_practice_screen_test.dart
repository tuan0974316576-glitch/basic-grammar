import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/core/app_palette.dart';
import 'package:dope_english/features/grammar/shared/lesson_ui.dart';
import 'package:dope_english/features/econ/econ_practice_screen.dart';
import 'package:dope_english/features/econ/econ_question_models.dart';

void main() {
  const question = EconQuestion(
    id: 'p1-test',
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
      EconChoice(id: 'A', text: '錯誤答案'),
      EconChoice(id: 'B', text: '正確答案'),
    ],
    correctChoice: 'B',
    explanation: '因為選項 B 符合定義。',
  );

  testWidgets('marks a P1 answer and advances to the result', (tester) async {
    String? checkedQuestionId;
    bool? checkedCorrect;
    await tester.pumpWidget(
      MaterialApp(
        home: EconPracticeScreen(
          questions: const [question],
          onQuestionChecked: (id, correct) {
            checkedQuestionId = id;
            checkedCorrect = correct;
          },
        ),
      ),
    );
    await tester.pump();

    final choice = find.text('正確答案');
    await tester.ensureVisible(choice);
    await tester.tap(choice);
    await tester.pump();
    final check = find.text('檢查答案');
    await tester.ensureVisible(check);
    await tester.tap(check);
    await tester.pump();

    expect(find.text('答對！'), findsOneWidget);
    expect(checkedQuestionId, 'p1-test');
    expect(checkedCorrect, isTrue);
    await tester.tap(find.text('查看結果'));
    await tester.pumpAndSettle();
    expect(find.text('ECON 練習 完成！'), findsOneWidget);
    expect(find.text('1/1'), findsOneWidget);
  });

  testWidgets('shows the native diagram editor for a P2 diagram question',
      (tester) async {
    const p2 = EconQuestion(
      id: 'p2-test',
      language: 'en',
      chapterNo: 2,
      chapterTitle: 'Demand and supply',
      keyPoint: 'Draw a demand and supply diagram',
      paper: EconPaper.p2,
      year: 2024,
      questionRef: 'Q1',
      questionType: 'written',
      stem: 'Draw the diagram and explain the change.',
      diagramConfig: EconDiagramConfig(
        enabled: true,
        kind: 'demand-supply',
        mode: 'create',
      ),
    );
    await tester.pumpWidget(
      const MaterialApp(home: EconPracticeScreen(questions: [p2])),
    );
    await tester.pump();

    expect(find.byKey(const Key('econ-diagram-editor')), findsOneWidget);
    expect(find.text('DIAGRAM'), findsOneWidget);
    expect(find.text('Demand'), findsOneWidget);
    expect(find.text('Supply'), findsOneWidget);
  });

  testWidgets('shows old-style check/next controls and question arrows',
      (tester) async {
    const second = EconQuestion(
      id: 'p1-test-2',
      language: 'zh',
      chapterNo: 1,
      chapterTitle: '基本經濟概念',
      keyPoint: '稀少性',
      paper: EconPaper.p1,
      year: 2023,
      questionRef: 'Q2',
      questionType: 'singleChoice',
      stem: '第二題？',
      choices: [
        EconChoice(id: 'A', text: '答案 A'),
        EconChoice(id: 'B', text: '答案 B'),
      ],
      correctChoice: 'A',
    );
    await tester.pumpWidget(const MaterialApp(
      home: EconPracticeScreen(questions: [question, second]),
    ));
    await tester.pump();

    expect(find.byKey(const Key('econ-previous-question')), findsOneWidget);
    expect(find.byKey(const Key('econ-next-question')), findsOneWidget);
    expect(
      tester.getSize(find.byKey(const Key('econ-next-question'))),
      const Size(92, 112),
    );
    final frameRect = tester.getRect(
      find.byKey(const Key('lesson-page-frame-stack')),
    );
    final previousHitRect = tester.getRect(
      find.byKey(const Key('econ-previous-question')),
    );
    final nextHitRect = tester.getRect(
      find.byKey(const Key('econ-next-question')),
    );
    expect(previousHitRect.left, greaterThanOrEqualTo(frameRect.left));
    expect(nextHitRect.right, lessThanOrEqualTo(frameRect.right));
    final arrowImages = find.descendant(
      of: find.byKey(const Key('econ-next-question')),
      matching: find.byType(Image),
    );
    expect(
      (tester.getCenter(arrowImages).dx - frameRect.right).abs(),
      lessThanOrEqualTo(5),
    );
    expect(find.byKey(const Key('econ-check-answer')), findsOneWidget);
    expect(find.byKey(const Key('econ-submit-next')), findsOneWidget);
    expect(find.text('檢查答案'), findsOneWidget);
    expect(find.text('下一題'), findsOneWidget);
    expect(find.text('A. 錯誤答案'), findsNothing);
    expect(find.text('B. 正確答案'), findsNothing);

    await tester.tap(find.text('正確答案'));
    await tester.pump();
    await tester.tap(find.byKey(const Key('econ-next-question')));
    await tester.pump();
    expect(find.text('第二題？'), findsOneWidget);
    await tester.tap(find.byKey(const Key('econ-previous-question')));
    await tester.pump();

    await tester.tap(find.byKey(const Key('econ-check-answer')));
    await tester.pump();
    expect(find.text('答對！'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('dual answer actions fit a 320 pixel phone', (tester) async {
    tester.view.physicalSize = const Size(320, 700);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(const MaterialApp(
      home: EconPracticeScreen(questions: [question]),
    ));
    await tester.pump();

    expect(find.byKey(const Key('econ-check-answer')), findsOneWidget);
    expect(find.byKey(const Key('econ-submit-next')), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('P2 needs written analysis and its required diagram',
      (tester) async {
    const p2 = EconQuestion(
      id: 'p2-ready-test',
      language: 'zh',
      chapterNo: 2,
      chapterTitle: '需求與供應',
      keyPoint: '供需圖',
      paper: EconPaper.p2,
      year: 2024,
      questionRef: 'Q1',
      questionType: 'written',
      stem: '以供需圖輔助解釋。',
      parts: [EconQuestionPart(prompt: '以供需圖輔助解釋。')],
      diagramConfig: EconDiagramConfig(
        enabled: true,
        kind: 'demand-supply',
        mode: 'create',
      ),
    );
    await tester.pumpWidget(
      const MaterialApp(home: EconPracticeScreen(questions: [p2])),
    );
    await tester.pump();

    LessonPrimaryButton checkButton() => tester.widget<LessonPrimaryButton>(
        find.byKey(const Key('econ-check-answer')));
    expect(checkButton().onPressed, isNull);
    await tester.enterText(find.byType(TextField), '需求增加令均衡價格上升。');
    await tester.pump();
    expect(checkButton().onPressed, isNull);
    await tester.ensureVisible(find.byKey(const Key('econ-tool-demand')));
    await tester.tap(find.byKey(const Key('econ-tool-demand')));
    await tester.pump();
    expect(checkButton().onPressed, isNotNull);
  });

  testWidgets('renders a scored P2 prompt when the legacy stem is empty',
      (tester) async {
    const prompt = '以圖輔助，解釋為甚麼通脹差距是一個短期現象。';
    const p2 = EconQuestion(
      id: 'prompt-only',
      language: 'zh',
      chapterNo: 9,
      chapterTitle: '宏觀經濟',
      keyPoint: '通脹差距',
      paper: EconPaper.p2,
      year: 'Mock',
      questionRef: 'Q6(b)',
      questionType: 'written',
      stem: '',
      parts: [EconQuestionPart(label: '(b)', prompt: prompt)],
    );
    await tester.pumpWidget(
      const MaterialApp(home: EconPracticeScreen(questions: [p2])),
    );
    await tester.pump();

    expect(find.text(prompt), findsOneWidget);
    expect(find.text('(b)'), findsOneWidget);
  });

  testWidgets('keeps post-visual source text after a table', (tester) async {
    const p2 = EconQuestion(
      id: 'post-visual-text',
      language: 'en',
      chapterNo: 1,
      chapterTitle: 'Production',
      keyPoint: 'Input-output',
      paper: EconPaper.p2,
      year: 2025,
      questionRef: 'Q1(a)',
      questionType: 'written',
      stem: 'The table below shows the input-output relationship.',
      postVisualStem:
          'The table is followed by this source-verified instruction.',
      parts: [
        EconQuestionPart(
          label: '(a)',
          prompt: 'State the law shown by the data.',
          modelAnswer: 'Marginal product eventually falls.',
        ),
      ],
      visuals: [
        EconQuestionVisual(
          kind: 'table',
          columns: ['Labour', 'Output'],
          rows: [
            ['1', '10'],
            ['2', '18'],
          ],
        ),
      ],
    );
    await tester.pumpWidget(
      const MaterialApp(home: EconPracticeScreen(questions: [p2])),
    );
    await tester.pump();
    expect(find.text('The table below shows the input-output relationship.'),
        findsOneWidget);
    expect(
      find.text('The table is followed by this source-verified instruction.'),
      findsOneWidget,
    );
    expect(find.text('State the law shown by the data.'), findsOneWidget);
  });

  testWidgets('keeps Source A and B headings attached to P2 tables',
      (tester) async {
    const p2 = EconQuestion(
      id: 'zh-2025-p2-q11-a-i',
      language: 'zh',
      chapterNo: 8,
      chapterTitle: '市場價格',
      keyPoint: '資料題',
      paper: EconPaper.p2,
      year: 2025,
      questionRef: 'Q11(a)(i)',
      questionType: 'written',
      stem: '住屋一直是香港公眾關注的議題。',
      parts: [EconQuestionPart(prompt: '參考資料 A，回答問題。')],
      visuals: [
        EconQuestionVisual(
          kind: 'table',
          caption: '資料 A：香港住屋的基本資料',
          columns: ['', '私人住宅單位', '公屋單位'],
          rows: [
            ['單位數量', '1 270 000', '826 700'],
          ],
        ),
        EconQuestionVisual(
          kind: 'table',
          caption: '資料 B：公屋單位平均輪候時間',
          columns: ['期間', '平均輪候時間'],
          rows: [
            ['2024 第一季', '5.7 年'],
          ],
        ),
      ],
    );
    await tester.pumpWidget(
      const MaterialApp(home: EconPracticeScreen(questions: [p2])),
    );
    await tester.pump();

    expect(find.text('資料 A：香港住屋的基本資料'), findsOneWidget);
    expect(find.text('資料 B：公屋單位平均輪候時間'), findsOneWidget);
    expect(
      find.byKey(const Key('econ-question-table-source-heading')),
      findsNWidgets(2),
    );
    expect(
      tester
          .widget<Text>(
              find.byKey(const Key('econ-question-table-source-heading')).first)
          .style
          ?.color,
      AppPalette.ink,
    );
  });

  testWidgets('keeps post-visual source text for a Paper 1 diagram',
      (tester) async {
    const p1 = EconQuestion(
      id: 'p1-post-visual-text',
      language: 'en',
      chapterNo: 8,
      chapterTitle: 'Market price',
      keyPoint: 'Demand and supply',
      paper: EconPaper.p1,
      year: 2025,
      questionRef: 'Q1',
      questionType: 'singleChoice',
      stem: 'Refer to the following diagram.',
      postVisualStem: 'Which statement about the diagram is correct?',
      visuals: [
        EconQuestionVisual(
          kind: 'diagram',
          title: 'Figure 1',
          body: 'Demand and supply',
        ),
      ],
      choices: [EconChoice(id: 'A', text: 'Statement A')],
      correctChoice: 'A',
    );
    await tester.pumpWidget(
      const MaterialApp(home: EconPracticeScreen(questions: [p1])),
    );
    await tester.pump();
    expect(find.text('Which statement about the diagram is correct?'),
        findsOneWidget);
  });

  testWidgets('transposes dense numeric tables into a readable grid',
      (tester) async {
    tester.view.physicalSize = const Size(320, 700);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    const p2 = EconQuestion(
      id: 'dense-table',
      language: 'zh',
      chapterNo: 20,
      chapterTitle: '貨幣',
      keyPoint: '貨幣供應',
      paper: EconPaper.p2,
      year: 2025,
      questionRef: 'Q1(a)',
      questionType: 'written',
      stem: '下表顯示資料。',
      parts: [EconQuestionPart(prompt: '計算貨幣供應。')],
      visuals: [
        EconQuestionVisual(
          kind: 'table',
          columns: ['項目', 'A', 'B', 'C'],
          rows: [
            ['數額', '100', '200', '300'],
            ['變化', '10', '20', '30'],
          ],
        ),
      ],
    );
    await tester.pumpWidget(
      const MaterialApp(home: EconPracticeScreen(questions: [p2])),
    );
    await tester.pump();
    expect(
        find.byKey(const Key('econ-vertical-question-table')), findsOneWidget);
    expect(find.byType(SingleChildScrollView), findsWidgets);
  });

  testWidgets('sizes short table columns to their content without side scroll',
      (tester) async {
    tester.view.physicalSize = const Size(390, 1000);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    const p1 = EconQuestion(
      id: 'smart-short-table',
      language: 'zh',
      chapterNo: 20,
      chapterTitle: '貨幣供應和貨幣需求',
      keyPoint: '貨幣供應',
      paper: EconPaper.p1,
      year: 2013,
      questionRef: 'Q26',
      questionType: 'singleChoice',
      stem: '該銀行系統的資產負債表如下。',
      visuals: [
        EconQuestionVisual(
          kind: 'table',
          columns: ['資產（百萬元）', '負債（百萬元）'],
          rows: [
            ['儲備 400；貸款 800', '存款 1 200'],
          ],
        ),
      ],
      choices: [EconChoice(id: 'A', text: '1 800百萬元')],
      correctChoice: 'A',
    );
    await tester.pumpWidget(
      const MaterialApp(home: EconPracticeScreen(questions: [p1])),
    );
    await tester.pump();

    final tableSurface =
        find.byKey(const Key('econ-horizontal-question-table'));
    final table = tester.widget<Table>(
      find.descendant(of: tableSurface, matching: find.byType(Table)),
    );
    final firstWidth = table.columnWidths![0]! as FixedColumnWidth;
    final secondWidth = table.columnWidths![1]! as FixedColumnWidth;
    final contentSize = tester.getSize(
      find.byKey(const Key('econ-question-table-content')),
    );
    final surfaceSize = tester.getSize(tableSurface);
    final horizontalScroll = tester.state<ScrollableState>(
      find.descendant(of: tableSurface, matching: find.byType(Scrollable)),
    );

    expect(firstWidth.value, inInclusiveRange(120, 170));
    expect(secondWidth.value, inInclusiveRange(95, 140));
    expect(contentSize.width, lessThan(surfaceSize.width - 30));
    expect(horizontalScroll.position.maxScrollExtent, 0);
  });

  testWidgets('keeps compact three-column data tables fully visible',
      (tester) async {
    tester.view.physicalSize = const Size(390, 1000);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    const p1 = EconQuestion(
      id: 'smart-three-column-table',
      language: 'zh',
      chapterNo: 23,
      chapterTitle: '國際貿易',
      keyPoint: '比較優勢',
      paper: EconPaper.p1,
      year: 2013,
      questionRef: 'Q38',
      questionType: 'singleChoice',
      stem: '兩國的產量如下。',
      visuals: [
        EconQuestionVisual(
          kind: 'table',
          columns: ['國家', '白米（單位）', '電腦（單位）'],
          rows: [
            ['泰國', '15', '5'],
            ['日本', '24', '12'],
          ],
        ),
      ],
      choices: [EconChoice(id: 'A', text: '只有（1）')],
      correctChoice: 'A',
    );
    await tester.pumpWidget(
      const MaterialApp(home: EconPracticeScreen(questions: [p1])),
    );
    await tester.pump();

    final tableSurface =
        find.byKey(const Key('econ-horizontal-question-table'));
    expect(tableSurface, findsOneWidget);
    expect(find.byKey(const Key('econ-vertical-question-table')), findsNothing);
    final horizontalScroll = tester.state<ScrollableState>(
      find.descendant(of: tableSurface, matching: find.byType(Scrollable)),
    );
    expect(horizontalScroll.position.maxScrollExtent, 0);
    expect(find.text('電腦\n（單位）'), findsOneWidget);
    expect(find.text('12'), findsOneWidget);
  });

  testWidgets('gives a long one-column table useful reading width',
      (tester) async {
    tester.view.physicalSize = const Size(390, 1200);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    const p1 = EconQuestion(
      id: 'smart-one-column-table',
      language: 'zh',
      chapterNo: 15,
      chapterTitle: '經濟表現的量度',
      keyPoint: '本地生產總值',
      paper: EconPaper.p1,
      year: 2013,
      questionRef: 'Q22',
      questionType: 'singleChoice',
      stem: '參閱下表。',
      visuals: [
        EconQuestionVisual(
          kind: 'table',
          columns: ['成分'],
          rows: [
            ['以市價計算的本地生產總值'],
            ['私人消費支出'],
            ['本地固定資本形成總額'],
          ],
        ),
      ],
      choices: [EconChoice(id: 'A', text: '20')],
      correctChoice: 'A',
    );
    await tester.pumpWidget(
      const MaterialApp(home: EconPracticeScreen(questions: [p1])),
    );
    await tester.pump();

    final tableSurface =
        find.byKey(const Key('econ-horizontal-question-table'));
    final contentSize = tester.getSize(
      find.byKey(const Key('econ-question-table-content')),
    );
    final horizontalScroll = tester.state<ScrollableState>(
      find.descendant(of: tableSurface, matching: find.byType(Scrollable)),
    );
    expect(contentSize.width, greaterThan(220));
    expect(horizontalScroll.position.maxScrollExtent, 0);
  });

  testWidgets('transposes a wide supply-demand table into one real grid',
      (tester) async {
    tester.view.physicalSize = const Size(390, 1200);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    const p1 = EconQuestion(
      id: 'zh-2013-p1-q13',
      language: 'zh',
      chapterNo: 11,
      chapterTitle: '市場干預',
      keyPoint: '從量銷售稅',
      paper: EconPaper.p1,
      year: 2013,
      questionRef: 'Q13',
      questionType: 'singleChoice',
      stem: '以下是物品X的供需表。',
      visuals: [
        EconQuestionVisual(
          kind: 'table',
          caption: '物品X的供需表',
          columns: ['價格（\$）', '2', '3', '4', '5', '6', '7', '8'],
          rows: [
            ['需求量（單位）', '90', '80', '70', '60', '50', '40', '30'],
            ['供應量（單位）', '30', '40', '50', '60', '70', '80', '90'],
          ],
        ),
      ],
      choices: [EconChoice(id: 'A', text: '\$180')],
      correctChoice: 'A',
    );
    await tester.pumpWidget(
      const MaterialApp(home: EconPracticeScreen(questions: [p1])),
    );
    await tester.pump();

    final tableSurface = find.byKey(const Key('econ-vertical-question-table'));
    final table = tester.widget<Table>(
      find.descendant(of: tableSurface, matching: find.byType(Table)),
    );
    expect(find.text('物品X的供需表'), findsNothing);
    expect(find.text('價格\n（\$）'), findsOneWidget);
    expect(find.text('需求量\n（單位）'), findsOneWidget);
    expect(find.text('供應量\n（單位）'), findsOneWidget);
    expect(find.text('2'), findsOneWidget);
    expect(find.text('8'), findsOneWidget);
    expect(table.children, hasLength(8));
    expect(table.columnWidths, hasLength(3));
    expect(table.border?.verticalInside.width, 1);
    expect(table.border?.horizontalInside.width, 1);
  });
}
