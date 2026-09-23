import 'dart:math';

import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/workshop/grammar_workshop_controller.dart';
import 'package:dope_english/features/workshop/grammar_workshop_models.dart';

void main() {
  test('answer normalization matches Battleship contractions and spellings',
      () {
    expect(
      normalizeGrammarWorkshopAnswer("She hasn't travelled"),
      normalizeGrammarWorkshopAnswer('She has not traveled'),
    );
    expect(
      normalizeGrammarWorkshopAnswer('They are practising'),
      normalizeGrammarWorkshopAnswer('They are practicing'),
    );
    expect(
      normalizeGrammarWorkshopAnswer("He can't organise it"),
      normalizeGrammarWorkshopAnswer('He cannot organize it'),
    );
  });
  test('fill answer locks immediately and exposes per-question explanation',
      () {
    final controller = GrammarWorkshopPracticeController(
      topic: _topic(
        GrammarWorkshopKind.fill,
        _question(
          GrammarWorkshopKind.fill,
          answers: const ['does not like', "doesn't like"],
          explanation: '單數否定使用 does not + 原形。',
        ),
      ),
      questionCount: 1,
      random: Random(1),
    );

    controller.updateResponse(0, "doesn't like");
    expect(controller.submit(), isTrue);
    expect(controller.lastCorrect, isTrue);
    expect(controller.answered, isTrue);
    expect(controller.current.explanation, contains('does not'));
    controller.updateResponse(0, 'changed');
    expect(controller.responses.single, "doesn't like");
  });

  test('choice and verb renderers use the real Battleship answer contract', () {
    final choice = GrammarWorkshopPracticeController(
      topic: _topic(
        GrammarWorkshopKind.choice,
        _question(
          GrammarWorkshopKind.choice,
          options: const ['in', 'at', 'on'],
          correctIndex: 2,
        ),
      ),
      questionCount: 1,
      random: Random(1),
    );
    choice.selectOption(0);
    choice.submit();
    expect(choice.lastCorrect, isFalse);
    expect(choice.current.correctAnswerText, 'on');

    final verb = GrammarWorkshopPracticeController(
      topic: _topic(
        GrammarWorkshopKind.verb,
        _question(
          GrammarWorkshopKind.verb,
          present: 'learn',
          past: 'learnt/learned',
          pp: 'learnt/learned',
          ing: 'learning',
        ),
      ),
      questionCount: 1,
      random: Random(1),
    );
    for (final response in ['learn', 'learned', 'learnt', 'learning']) {
      verb.updateResponse(
        ['learn', 'learned', 'learnt', 'learning'].indexOf(response),
        response,
      );
    }
    verb.submit();
    expect(verb.lastCorrect, isTrue);
  });

  test('choice accepts a reviewed alternative option', () {
    final controller = GrammarWorkshopPracticeController(
      topic: _topic(
        GrammarWorkshopKind.choice,
        _question(
          GrammarWorkshopKind.choice,
          options: const ['in', 'at', 'on', 'during', 'by'],
          correctIndex: 3,
          acceptedAnswers: const ['in'],
        ),
      ),
      questionCount: 1,
      random: Random(1),
    );

    controller.selectOption(0);
    controller.submit();
    expect(controller.lastCorrect, isTrue);
    expect(controller.current.correctAnswerText, 'during / in');
  });

  test('rearrange accepts a published alternative token sequence', () {
    const question = GrammarWorkshopQuestion(
      id: 'rearrange',
      topicKey: 'CONDITIONAL',
      kind: GrammarWorkshopKind.rearrange,
      chinese: '如果下雨，我們會留在家。',
      prompt: '',
      answers: [],
      answerSlots: [],
      options: [],
      correctIndex: -1,
      correctTokenSets: [
        [
          'If',
          'it',
          'rains',
          'tomorrow',
          ',',
          'we',
          'will',
          'stay',
          'home',
          '.'
        ],
        ['If', 'it', 'rains', ',', 'we', 'will', 'stay', 'home', '.'],
      ],
      distractors: [],
      explanation: '第一條件句。',
      present: '',
      past: '',
      pp: '',
      ing: '',
    );
    final controller = GrammarWorkshopPracticeController(
      topic: _topic(GrammarWorkshopKind.rearrange, question),
      questionCount: 1,
      random: Random(4),
    );
    const expected = [
      'If',
      'it',
      'rains',
      ',',
      'we',
      'will',
      'stay',
      'home',
      '.'
    ];
    for (final text in expected) {
      final token = controller.availableTokens.firstWhere(
        (candidate) => candidate.text == text,
      );
      controller.selectToken(token.id);
    }
    controller.submit();
    expect(controller.lastCorrect, isTrue);
  });

  test('indirect whether question also offers and accepts if tokens', () {
    final question = GrammarWorkshopQuestion.fromJson(
      GrammarWorkshopKind.rearrange,
      'INDIRECT_QUESTION',
      {
        'id': 'indirect-if-whether',
        'chinese': '我不知道他是否會來。',
        'rule': '1',
        'correct_tokens': [
          ['I', 'do', 'not', 'know', 'whether', 'he', 'will', 'come', '.'],
        ],
        'distractors': [],
      },
    );
    final controller = GrammarWorkshopPracticeController(
      topic: _topic(GrammarWorkshopKind.rearrange, question),
      questionCount: 1,
      random: Random(2),
    );
    expect(
      controller.availableTokens.map((token) => token.text),
      containsAll(['whether', 'if']),
    );
    for (final text in [
      'I',
      'do',
      'not',
      'know',
      'if',
      'he',
      'will',
      'come',
      '.'
    ]) {
      controller.selectToken(
        controller.availableTokens.firstWhere((token) => token.text == text).id,
      );
    }
    controller.submit();
    expect(controller.lastCorrect, isTrue);
  });

  test('whether to keeps whether and does not generate an if variant', () {
    final question = GrammarWorkshopQuestion.fromJson(
      GrammarWorkshopKind.rearrange,
      'INDIRECT_QUESTION',
      {
        'id': 'whether-to',
        'rule': '1',
        'correct_tokens': [
          ['I', 'wonder', 'whether', 'to', 'leave', '.'],
        ],
      },
    );
    expect(question.correctTokenSets, hasLength(1));
    expect(question.correctTokenSets.single, isNot(contains('if')));
  });

  test('second conditional accepts now in either clause position', () {
    final question = GrammarWorkshopQuestion.fromJson(
      GrammarWorkshopKind.rearrange,
      'CONDITIONAL',
      {
        'id': 'conditional-now',
        'type': '2',
        'correct_tokens': [
          ['If', 'I', 'were', 'free', 'now', ',', 'I', 'would', 'help', '.'],
        ],
      },
    );
    expect(question.correctTokenSets.length, greaterThanOrEqualTo(2));
    expect(
      question.correctTokenSets,
      contains(
        equals(
          ['If', 'I', 'were', 'free', ',', 'I', 'would', 'help', 'now', '.'],
        ),
      ),
    );
    expect(
      question.correctTokenSets,
      contains(
        equals(
          ['I', 'would', 'help', 'If', 'I', 'were', 'free', 'now', '.'],
        ),
      ),
    );
  });

  test('reported statements accept optional that', () {
    final question = GrammarWorkshopQuestion.fromJson(
      GrammarWorkshopKind.rearrange,
      'REPORTED_SPEECH',
      {
        'id': 'reported-that',
        'type': 'statement',
        'correct_tokens': [
          ['Mary', 'said', 'she', 'was', 'tired', '.'],
        ],
      },
    );
    expect(
      question.correctTokenSets,
      contains(equals(['Mary', 'said', 'that', 'she', 'was', 'tired', '.'])),
    );
  });

  test('reported yes-no questions accept if and whether', () {
    final question = GrammarWorkshopQuestion.fromJson(
      GrammarWorkshopKind.rearrange,
      'REPORTED_SPEECH',
      {
        'id': 'reported-whether',
        'type': 'question',
        'correct_tokens': [
          ['Mary', 'asked', 'me', 'if', 'I', 'was', 'ready', '.'],
        ],
      },
    );
    expect(
      question.correctTokenSets,
      contains(
        equals(['Mary', 'asked', 'me', 'whether', 'I', 'was', 'ready', '.']),
      ),
    );
  });

  test('introductory participle phrase can follow the main clause', () {
    final question = GrammarWorkshopQuestion.fromJson(
      GrammarWorkshopKind.rearrange,
      'PARTICIPLE_PHRASES',
      {
        'id': 'participle-order',
        'correct_tokens': [
          ['Hearing', 'the', 'alarm', ',', 'the', 'students', 'left', '.'],
        ],
      },
    );
    expect(
      question.correctTokenSets,
      contains(
        equals(
            ['the', 'students', 'left', ',', 'Hearing', 'the', 'alarm', '.']),
      ),
    );
  });

  test('DE structure accepts equivalent reduced and full structures', () {
    GrammarWorkshopQuestion parse(
      String id,
      String category,
      List<String> tokens,
    ) {
      return GrammarWorkshopQuestion.fromJson(
        GrammarWorkshopKind.rearrange,
        'DE_STRUCTURE',
        {
          'id': id,
          'category': category,
          'correct_tokens': [tokens],
        },
      );
    }

    final withPhrase = parse(
      'de-structure-with',
      'with',
      ['A', 'computer', 'with', 'many', 'screens'],
    );
    expect(
      withPhrase.correctTokenSets,
      contains(equals(['A', 'computer', 'having', 'many', 'screens'])),
    );

    final objectRelative = parse(
      'de-structure-object',
      'object_relative',
      ['A', 'problem', 'parents', 'often', 'face'],
    );
    expect(
      objectRelative.correctTokenSets,
      contains(equals(['A', 'problem', 'that', 'parents', 'often', 'face'])),
    );

    final passive = parse(
      'de_structure_014',
      'passive_relative',
      ['A', 'story', 'written', '300', 'years', 'ago'],
    );
    expect(
      passive.correctTokenSets,
      contains(
        equals(
            ['A', 'story', 'which', 'was', 'written', '300', 'years', 'ago']),
      ),
    );

    final pluralRelative = parse(
      'de_structure_057',
      'compound_relative',
      ['Students', 'willing', 'to', 'help', 'me'],
    );
    expect(
      pluralRelative.correctTokenSets,
      contains(
        equals(['Students', 'who', 'are', 'willing', 'to', 'help', 'me']),
      ),
    );
  });

  test('next is unavailable until feedback has been shown', () {
    final controller = GrammarWorkshopPracticeController(
      topic: GrammarWorkshopTopic(
        key: 'PRONOUN',
        label: 'PRONOUN',
        chineseLabel: '代名詞',
        kind: GrammarWorkshopKind.fill,
        questions: [
          _question(GrammarWorkshopKind.fill, id: 'one', answers: const ['it']),
          _question(GrammarWorkshopKind.fill,
              id: 'two', answers: const ['them']),
        ],
      ),
      questionCount: 2,
      random: Random(2),
    );
    final firstId = controller.current.id;
    controller.next();
    expect(controller.current.id, firstId);
    controller.updateResponse(0, controller.current.answers.first);
    controller.submit();
    controller.next();
    expect(controller.current.id, isNot(firstId));
    expect(controller.answered, isFalse);
  });
}

GrammarWorkshopTopic _topic(
  GrammarWorkshopKind kind,
  GrammarWorkshopQuestion question,
) {
  return GrammarWorkshopTopic(
    key: question.topicKey,
    label: question.topicKey,
    chineseLabel: '研修',
    kind: kind,
    questions: [question],
  );
}

GrammarWorkshopQuestion _question(
  GrammarWorkshopKind kind, {
  String id = 'question',
  List<String> answers = const [],
  List<String> options = const [],
  int correctIndex = -1,
  List<String> acceptedAnswers = const [],
  String explanation = '題目解釋',
  String present = '',
  String past = '',
  String pp = '',
  String ing = '',
}) {
  return GrammarWorkshopQuestion(
    id: id,
    topicKey: switch (kind) {
      GrammarWorkshopKind.fill => 'TENSES',
      GrammarWorkshopKind.choice => 'PREPOSITION_OF_PLACE',
      GrammarWorkshopKind.verb => 'VERB_TABLE',
      GrammarWorkshopKind.rearrange => 'CONDITIONAL',
      GrammarWorkshopKind.synonym => 'DSE_SYNONYM',
    },
    kind: kind,
    chinese: '中文題目',
    prompt: 'English ______.',
    answers: answers,
    answerSlots: const [],
    options: options,
    correctIndex: correctIndex,
    acceptedAnswers: acceptedAnswers,
    correctTokenSets: const [],
    distractors: const [],
    explanation: explanation,
    present: present,
    past: past,
    pp: pp,
    ing: ing,
  );
}
