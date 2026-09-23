import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/econ/econ_diagram_models.dart';
import 'package:dope_english/features/econ/econ_question_models.dart';
import 'package:dope_english/features/econ/econ_question_repository.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  test('loads the full reviewed ECON question bank', () async {
    final questions = await const EconQuestionRepository().loadQuestions();

    expect(questions.length, greaterThan(8000));
    expect(questions.where((question) => question.isP1), isNotEmpty);
    expect(questions.where((question) => question.isP2), isNotEmpty);
    expect(
        questions.where((question) => question.language == 'zh'), isNotEmpty);
    expect(
        questions.where((question) => question.language == 'en'), isNotEmpty);
  });

  test('filters topic and year selections without mixing languages', () async {
    final questions = await const EconQuestionRepository().loadQuestions();
    final topic = filterEconQuestions(
      questions,
      language: 'zh',
      paper: EconPaper.p1,
      chapterNo: 1,
    );
    expect(topic, isNotEmpty);
    expect(
        topic.every(
            (question) => question.language == 'zh' && question.chapterNo == 1),
        isTrue);

    final years = econSetLabels(
      questions,
      language: 'en',
      paper: EconPaper.p1,
      sourceMode: EconSourceMode.past,
    );
    expect(years, isNotEmpty);
    expect(years.any((label) => int.tryParse(label) != null), isTrue);
  });

  test('sorts topic practice in legacy publication chronology', () {
    EconQuestion question(String id, Object year, String ref,
        {String? mockSet}) {
      return EconQuestion(
        id: id,
        language: 'zh',
        chapterNo: 1,
        chapterTitle: '基本經濟概念',
        keyPoint: '測試',
        paper: EconPaper.p1,
        year: year,
        mockSet: mockSet,
        questionRef: ref,
        questionType: 'singleChoice',
        stem: '題目',
      );
    }

    final questions = [
      question('q-mock-10', 'Aristo Mock Test 10', 'Q2',
          mockSet: 'Aristo Mock Test 10'),
      question('q-2023', 2023, 'Q1'),
      question('q-mock-8', 'Aristo Mock Test 8', 'Q10',
          mockSet: 'Aristo Mock Test 8'),
      question('q-2023-q2', 2023, 'Q2'),
    ];

    expect(
      sortEconQuestionsByPublication(questions).map((question) => question.id),
      ['q-mock-8', 'q-mock-10', 'q-2023', 'q-2023-q2'],
    );
  });

  test('keeps legacy wrong, unseen, correct buckets chronological', () {
    EconQuestion question(String id, Object year, String ref) {
      return EconQuestion(
        id: id,
        language: 'zh',
        chapterNo: 1,
        chapterTitle: '基本經濟概念',
        keyPoint: '測試',
        paper: EconPaper.p1,
        year: year,
        questionRef: ref,
        questionType: 'singleChoice',
        stem: '題目',
      );
    }

    final questions = [
      question('correct', 2013, 'Q1'),
      question('unseen-late', 2023, 'Q1'),
      question('wrong-late', 2023, 'Q2'),
      question('wrong-early', 2013, 'Q2'),
      question('unseen-early', 2013, 'Q1'),
    ];
    expect(
      prioritizeEconTopicQuestions(
        questions,
        const {
          'correct': 'correct',
          'wrong-late': 'incorrect',
          'wrong-early': 'incorrect',
        },
      ).map((question) => question.id),
      ['wrong-early', 'wrong-late', 'unseen-early', 'unseen-late', 'correct'],
    );
  });

  test('pairs English answers with offset Chinese mock subparts safely',
      () async {
    final questions = await const EconQuestionRepository().loadQuestions();
    EconQuestion byId(String id) =>
        questions.firstWhere((question) => question.id == id);

    // Mock 34 has a few source-level subpart numbering differences between
    // the English and Chinese papers. Pair by reviewed chapter/marks rather
    // than blindly swapping the language prefix.
    expect(
      EconQuestionRepository.pairedQuestion(byId('en-aristo-mock-34-p2-q1bi'))
          ?.id,
      'zh-aristo-mock-34-p2-q1b',
    );
    expect(
      EconQuestionRepository.pairedQuestion(byId('en-aristo-mock-34-p2-q3c'))
          ?.id,
      'zh-aristo-mock-34-p2-q3b',
    );
    expect(
      EconQuestionRepository.pairedQuestion(byId('en-aristo-mock-34-p2-q10cii'))
          ?.id,
      'zh-aristo-mock-34-p2-q9cii',
    );
    expect(
      EconQuestionRepository.pairedQuestion(byId('en-aristo-mock-34-p2-q11b'))
          ?.id,
      'zh-aristo-mock-34-p2-q10b',
    );
    expect(
      EconQuestionRepository.pairedQuestion(byId('en-aristo-mock-34-p2-q8b')),
      isNull,
    );
  });

  test('all published diagram configs map to a supported Flutter tool',
      () async {
    final questions = await const EconQuestionRepository().loadQuestions();
    final diagrams = questions
        .where((question) => question.diagramConfig?.enabled == true)
        .toList();
    const supportedKinds = {
      'demand-supply',
      'as-ad',
      'money-market',
      'trade-barrier',
      'monopoly',
      'ppf',
    };

    expect(diagrams, hasLength(597));
    expect(
      diagrams
          .where((question) =>
              !supportedKinds.contains(question.diagramConfig!.kind))
          .map((question) => question.id),
      isEmpty,
    );
    expect(
      diagrams.where((question) =>
          question.diagramConfig!.sourceSeed != null &&
          EconDiagramState.fromJson(question.diagramConfig!.sourceSeed)
                  .toolKind !=
              question.diagramConfig!.kind),
      isEmpty,
    );
    expect(
      diagrams.every((question) => question.diagramContinuationKey.isNotEmpty),
      isTrue,
    );
  });

  test('runtime diagram policy inference matches the legacy ECON engine',
      () async {
    final questions = await const EconQuestionRepository().loadQuestions();
    EconQuestion byId(String id) =>
        questions.firstWhere((question) => question.id == id);

    expect(byId('en-2014-p2-q9-a').diagramConfig?.policy, 'tax');
    expect(byId('en-2017-p2-q11-a').diagramConfig?.policy, 'subsidy');
    expect(byId('zh-2014-p2-q9-a').diagramConfig?.policy, 'tax');
    expect(byId('en-2025-p2-q12-a-i').diagramContinuationKey,
        byId('en-2025-p2-q12-a-ii').diagramContinuationKey);
  });
}
