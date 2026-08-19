import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/grammar/correction/correction_lesson_repository.dart';
import 'package:dope_english/features/grammar/lesson_03/lesson_03_repository.dart';
import 'package:dope_english/features/grammar/lesson_04/lesson_04_repository.dart';
import 'package:dope_english/features/grammar/lesson_05/lesson_05_question.dart';
import 'package:dope_english/features/grammar/lesson_05/lesson_05_repository.dart';
import 'package:dope_english/features/grammar/lesson_11/lesson_11_repository.dart';
import 'package:dope_english/features/grammar/lesson_12/lesson_12_repository.dart';

String asset(String name) => File('assets/data/$name').readAsStringSync();

void main() {
  test('Lesson 03 to 05 banks are complete and explain every option', () {
    final lesson03 = Lesson03Repository.parseQuestions(asset('lesson_03.json'));
    final lesson04 = Lesson04Repository.parseQuestions(asset('lesson_04.json'));
    final lesson05 = Lesson05Repository.parseQuestions(asset('lesson_05.json'));

    expect(lesson03, hasLength(30));
    expect(lesson03.map((question) => question.id).toSet(), hasLength(30));
    expect(
      lesson03.every(
        (question) =>
            question.sentenceCount >= 2 && question.sentenceCount <= 4,
      ),
      isTrue,
    );
    expect(lesson04, hasLength(7));
    expect(lesson04.every((question) => question.forms.length == 4), isTrue);
    expect(lesson05, hasLength(50));
    for (final question in lesson05) {
      expect(question.choices, hasLength(4));
      expect(question.choices, contains(question.answer));
      for (final choice in question.choices) {
        expect(PronounChoiceExplainer.reason(question, choice), isNotEmpty);
      }
    }
  });

  test('Lesson 06 to 10 and 13 banks contain complete teaching feedback', () {
    const expectedCounts = {
      6: 100,
      7: 60,
      8: 60,
      9: 60,
      10: 100,
      13: 80,
    };
    for (final entry in expectedCounts.entries) {
      final questions = CorrectionLessonRepository.parseQuestions(
        asset('lesson_${entry.key.toString().padLeft(2, '0')}.json'),
      );
      expect(questions, hasLength(entry.value), reason: 'Lesson ${entry.key}');
      expect(
        questions.map((question) => question.id).toSet(),
        hasLength(entry.value),
      );
      expect(
        questions.every(
          (question) =>
              question.sentence.isNotEmpty &&
              question.zh.isNotEmpty &&
              question.answer.isNotEmpty &&
              question.explanation.isNotEmpty &&
              question.accepts(question.answer),
        ),
        isTrue,
      );
    }
  });

  test('Lesson 11 contains all 260 complete tense questions', () {
    final questions =
        Lesson11Repository.parseQuestions(asset('lesson_11.json'));
    expect(questions, hasLength(260));
    expect(questions.map((question) => question.id).toSet(), hasLength(260));
    expect(
      questions.every(
        (question) =>
            question.tense.isNotEmpty &&
            question.tenseLabel.isNotEmpty &&
            question.zh.isNotEmpty &&
            question.answer.isNotEmpty &&
            question.explanation.isNotEmpty &&
            question.accepts(question.answer),
      ),
      isTrue,
    );
  });

  test('Lesson 12 has 100 images and bundled or shared-audio fallback data',
      () {
    final questions =
        Lesson12Repository.parseQuestions(asset('lesson_12.json'));
    expect(questions, hasLength(100));
    expect(questions.map((question) => question.id).toSet(), hasLength(100));
    expect(
      questions.every(
        (question) =>
            question.forms.values.every((form) => form.isNotEmpty) &&
            question.imageAsset.isNotEmpty &&
            File(question.imageAsset).existsSync(),
      ),
      isTrue,
    );
    expect(
      questions.where((question) => question.audioAsset.isNotEmpty),
      hasLength(91),
    );
    expect(
      questions.where((question) => question.audioAsset.isNotEmpty).every(
            (question) => File('assets/${question.audioAsset}').existsSync(),
          ),
      isTrue,
    );
  });
}
