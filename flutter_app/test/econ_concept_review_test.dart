import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/econ/econ_concept_review_models.dart';
import 'package:dope_english/features/econ/econ_concept_review_repository.dart';
import 'package:dope_english/features/econ/econ_concept_review_screen.dart';
import 'package:dope_english/features/grammar/shared/lesson_ui.dart';

void main() {
  test('loads the reviewed ECON concept release', () async {
    final lesson = await const EconConceptReviewRepository().loadLesson();

    expect(lesson.chapterNo, 1);
    expect(lesson.exercises, hasLength(7));
    expect(lesson.exercises.first.id, 'scarcity-definition-reorder');
    expect(
      lesson.exercises.first.localizedTokens(
        lesson.exercises.first.tokens,
        EconReviewLanguage.zh,
      ),
      ['所有人的', '慾望', '稀少性', '指', '不足以', '滿足', '可用的', '資源'],
    );
  });

  test('accepts the published alternative definition answers', () async {
    final lesson = await const EconConceptReviewRepository().loadLesson();
    final exercise = lesson.exercises.last;

    expect(
      econConceptReviewIsCorrect(
        exercise: exercise,
        language: EconReviewLanguage.en,
        selectedTokens: const [],
        selectedOption: null,
        response:
            "Scarcity means resources available are insufficient to satisfy all people's wants.",
      ),
      isTrue,
    );
  });

  testWidgets('renders the first ECON concept review question',
      (WidgetTester tester) async {
    tester.view.devicePixelRatio = 1;
    tester.view.physicalSize = const Size(390, 844);
    addTearDown(tester.view.reset);
    const lesson = EconConceptReviewLesson(
      id: 'chapter-1-scarcity-and-choice',
      chapterNo: 1,
      title: {'zh': '稀少性與選擇', 'en': 'Scarcity and choice'},
      description: {'zh': '測試', 'en': 'Test'},
      exercises: [
        EconConceptReviewExercise(
          id: 'scarcity-definition-reorder',
          type: EconConceptReviewExerciseType.reorder,
          concept: 'scarcity',
          prompt: {
            'zh': '重新排列稀少性的定義。',
            'en': 'Rebuild the definition of scarcity.',
          },
          tokens: {
            'zh': ['所有人的', '慾望', '稀少性', '指', '不足以', '滿足', '可用的', '資源'],
            'en': ['Scarcity', 'means', 'available', 'resources'],
          },
          answerTokens: {
            'zh': ['稀少性', '指', '可用的', '資源', '不足以', '滿足', '所有人的', '慾望'],
            'en': ['Scarcity', 'means', 'available', 'resources'],
          },
          explanation: {'zh': '測試', 'en': 'Test'},
        ),
      ],
    );
    await tester.pumpWidget(
      const MaterialApp(
        home: EconConceptReviewScreen(
          repository: _SingleExerciseRepository(lesson),
        ),
      ),
    );
    await tester.pump(const Duration(milliseconds: 300));

    expect(find.byType(LessonPageScaffold), findsOneWidget);
    expect(find.text('稀少性與選擇'), findsOneWidget);
    expect(find.byKey(const Key('econ-review-answer-line')), findsOneWidget);
    expect(find.byKey(const Key('econ-review-word-bank')), findsOneWidget);
    expect(find.byKey(const Key('econ-review-definition-input')), findsNothing);

    final firstToken = find.descendant(
      of: find.byKey(const Key('econ-review-word-bank')),
      matching: find.text('所有人的'),
    );
    final secondToken = find.descendant(
      of: find.byKey(const Key('econ-review-word-bank')),
      matching: find.text('慾望'),
    );
    expect(tester.getSize(firstToken).width, lessThan(140));
    expect(tester.getSize(secondToken).width, lessThan(100));
    expect(
      (tester.getTopLeft(firstToken).dy - tester.getTopLeft(secondToken).dy)
          .abs(),
      lessThan(5),
    );

    final bank = find.byKey(const Key('econ-review-word-bank'));
    final scarcityToken = find.descendant(of: bank, matching: find.text('稀少性'));
    await tester.tap(scarcityToken);
    await tester.pump(const Duration(milliseconds: 500));

    expect(
      find.descendant(
        of: find.byKey(const Key('econ-review-answer-line')),
        matching: find.text('稀少性'),
      ),
      findsOneWidget,
    );
  });

  testWidgets('true or false uses symbol-only choices',
      (WidgetTester tester) async {
    const repository = _SingleExerciseRepository(
      EconConceptReviewLesson(
        id: 'test',
        chapterNo: 1,
        title: {'zh': '測試', 'en': 'Test'},
        description: {'zh': '測試', 'en': 'Test'},
        exercises: [
          EconConceptReviewExercise(
            id: 'truth',
            type: EconConceptReviewExerciseType.trueFalse,
            concept: 'test',
            prompt: {'zh': '這句正確嗎？', 'en': 'Is this true?'},
            answer: true,
            explanation: {'zh': '正確。', 'en': 'Correct.'},
          ),
        ],
      ),
    );
    await tester.pumpWidget(
      const MaterialApp(home: EconConceptReviewScreen(repository: repository)),
    );
    await tester.pump(const Duration(milliseconds: 300));

    expect(find.byKey(const Key('econ-review-tick')), findsOneWidget);
    expect(find.byKey(const Key('econ-review-cross')), findsOneWidget);
    expect(
      find.descendant(
        of: find.byKey(const Key('econ-review-tick')),
        matching: find.byIcon(Icons.check_rounded),
      ),
      findsOneWidget,
    );
    expect(find.text('正確'), findsNothing);
    expect(find.text('錯誤'), findsNothing);
  });
}

class _SingleExerciseRepository implements EconConceptReviewBankRepository {
  const _SingleExerciseRepository(this.lesson);

  final EconConceptReviewLesson lesson;

  @override
  Future<EconConceptReviewLesson> loadLesson() async => lesson;
}
