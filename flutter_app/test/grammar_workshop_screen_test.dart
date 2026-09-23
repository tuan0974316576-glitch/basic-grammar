import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/core/app_sfx.dart';
import 'package:dope_english/features/workshop/grammar_workshop_models.dart';
import 'package:dope_english/features/workshop/grammar_workshop_repository.dart';
import 'package:dope_english/features/workshop/grammar_workshop_screen.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  late GrammarWorkshopBank publishedBank;

  setUpAll(() async {
    final source = await rootBundle.loadString(
      GrammarWorkshopRepository.bundledAsset,
    );
    publishedBank = GrammarWorkshopBank.fromPackage(
      Map<String, dynamic>.from(jsonDecode(source) as Map),
      source: GrammarWorkshopSource.bundle,
    );
  });

  testWidgets('compact Workshop shows the published Battleship topic grid',
      (tester) async {
    tester.view.physicalSize = const Size(320, 568);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(
      MaterialApp(
        home: GrammarWorkshopScreen(
          repository: _FixedWorkshopRepository(publishedBank),
          sfx: const SilentLessonSfx(),
          onSettings: () {},
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('研修'), findsOneWidget);
    expect(find.byKey(const Key('workshop-settings-button')), findsOneWidget);
    expect(
        find.byKey(const Key('grammar-workshop-topic-grid')), findsOneWidget);
    expect(find.byKey(const ValueKey('grammar-workshop-topic-VERB_TABLE')),
        findsOneWidget);
    expect(find.textContaining('已同步 Battleship'), findsNothing);
    expect(
        find.byKey(const Key('grammar-workshop-refresh-button')), findsNothing);
    expect(find.text('238'), findsNothing);
    expect(tester.takeException(), isNull);
  });

  testWidgets('every question shows answer and explanation immediately',
      (tester) async {
    final topic = _topic(
      GrammarWorkshopKind.fill,
      _question(
        GrammarWorkshopKind.fill,
        prompt: 'She ______ English every day.',
        answers: const ['studies'],
        explanation: '單數主詞 She 的動詞要加 -s。',
      ),
    );
    await tester.pumpWidget(
      MaterialApp(
        home: GrammarWorkshopPracticeScreen(
          topic: topic,
          sfx: const SilentLessonSfx(),
        ),
      ),
    );

    await tester.enterText(find.byType(TextFormField), 'study');
    tester.testTextInput.hide();
    await tester.pump();
    await tester.ensureVisible(find.text('確認答案'));
    await tester.tap(find.text('確認答案'));
    await tester.pumpAndSettle();

    expect(
      find.byKey(const Key('grammar-workshop-question-feedback')),
      findsOneWidget,
    );
    expect(find.text('未答啱。'), findsOneWidget);
    expect(find.textContaining('正確答案：studies'), findsOneWidget);
    expect(find.textContaining('先找時間提示和主詞'), findsOneWidget);
    expect(find.textContaining('單數主詞 She'), findsOneWidget);
    expect(find.text('完成研修'), findsOneWidget);
  });

  testWidgets('choice, verb and rearrange renderers are interactive',
      (tester) async {
    final cases = <(GrammarWorkshopTopic, Finder)>[
      (
        _topic(
          GrammarWorkshopKind.choice,
          _question(
            GrammarWorkshopKind.choice,
            options: const ['in', 'on', 'at'],
            correctIndex: 1,
          ),
        ),
        find.byKey(const ValueKey('workshop-choice-0')),
      ),
      (
        _topic(
          GrammarWorkshopKind.verb,
          _question(
            GrammarWorkshopKind.verb,
            present: 'go',
            past: 'went',
            pp: 'gone',
            ing: 'going',
          ),
        ),
        find.byType(TextFormField),
      ),
      (
        _topic(
          GrammarWorkshopKind.rearrange,
          _question(
            GrammarWorkshopKind.rearrange,
            tokenSets: const [
              ['I', 'am', 'ready', '.'],
            ],
            distractors: const ['is'],
          ),
        ),
        find.byKey(const Key('workshop-rearrange-answer')),
      ),
    ];

    for (final item in cases) {
      await tester.pumpWidget(
        MaterialApp(
          home: GrammarWorkshopPracticeScreen(
            key: ValueKey('workshop-renderer-${item.$1.kind.name}'),
            topic: item.$1,
            sfx: const SilentLessonSfx(),
          ),
        ),
      );
      await tester.pump();
      expect(item.$2, findsWidgets);
      expect(tester.takeException(), isNull);
    }
  });
}

class _FixedWorkshopRepository implements GrammarWorkshopBankRepository {
  const _FixedWorkshopRepository(this.bank);

  final GrammarWorkshopBank bank;

  @override
  Future<GrammarWorkshopBank> load({bool forceRefresh = false}) async => bank;
}

GrammarWorkshopTopic _topic(
  GrammarWorkshopKind kind,
  GrammarWorkshopQuestion question,
) {
  return GrammarWorkshopTopic(
    key: question.topicKey,
    label: question.topicKey,
    chineseLabel: '研修測試',
    kind: kind,
    questions: [question],
  );
}

GrammarWorkshopQuestion _question(
  GrammarWorkshopKind kind, {
  String prompt = 'English question',
  List<String> answers = const [],
  List<String> options = const [],
  int correctIndex = -1,
  String explanation = '題目解釋',
  String present = '',
  String past = '',
  String pp = '',
  String ing = '',
  List<List<String>> tokenSets = const [],
  List<String> distractors = const [],
}) {
  return GrammarWorkshopQuestion(
    id: 'workshop-test-${kind.name}',
    topicKey: switch (kind) {
      GrammarWorkshopKind.fill => 'TENSES',
      GrammarWorkshopKind.choice => 'PREPOSITION_OF_PLACE',
      GrammarWorkshopKind.verb => 'VERB_TABLE',
      GrammarWorkshopKind.rearrange => 'DIRECT_QUESTION',
      GrammarWorkshopKind.synonym => 'DSE_SYNONYM',
    },
    kind: kind,
    chinese: '中文題目',
    prompt: prompt,
    answers: answers,
    answerSlots: const [],
    options: options,
    correctIndex: correctIndex,
    acceptedAnswers: const [],
    correctTokenSets: tokenSets,
    distractors: distractors,
    explanation: explanation,
    present: present,
    past: past,
    pp: pp,
    ing: ing,
  );
}
