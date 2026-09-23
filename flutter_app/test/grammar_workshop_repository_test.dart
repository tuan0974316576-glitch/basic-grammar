import 'dart:convert';
import 'dart:io';

import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

import 'package:dope_english/features/workshop/grammar_workshop_models.dart';
import 'package:dope_english/features/workshop/grammar_workshop_repository.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('bundled release validates all published Battleship grammar topics',
      () async {
    final source = await rootBundle.loadString(
      GrammarWorkshopRepository.bundledAsset,
    );
    final package = Map<String, dynamic>.from(jsonDecode(source) as Map);
    final bank = GrammarWorkshopBank.fromPackage(
      package,
      source: GrammarWorkshopSource.bundle,
    );

    expect(bank.releaseId, 'v1-msv2m2gk');
    expect(bank.topics, hasLength(18));
    expect(bank.questionCount, 3879);
    expect(
      bank.topics.map((topic) => topic.kind).toSet(),
      containsAll({
        GrammarWorkshopKind.verb,
        GrammarWorkshopKind.fill,
        GrammarWorkshopKind.choice,
        GrammarWorkshopKind.rearrange,
      }),
    );
    expect(bank.topics.every((topic) => topic.questions.isNotEmpty), isTrue);
    final interview = bank.topics
        .singleWhere((topic) => topic.key == 'PREPOSITION_OF_TIME')
        .questions
        .singleWhere((question) => question.id == 'preposition_time_130');
    expect(interview.correctAnswerText, 'during / in');
    expect(interview.isAcceptedChoice(0), isTrue);
    expect(interview.isAcceptedChoice(3), isTrue);
    final timeQuestions = bank.topics
        .singleWhere((topic) => topic.key == 'PREPOSITION_OF_TIME')
        .questions;
    final reviewedAlternatives = timeQuestions
        .where((question) => question.acceptedAnswers.length > 1)
        .toList(growable: false);
    expect(reviewedAlternatives, hasLength(32));
    expect(
      reviewedAlternatives.every(
        (question) => question.acceptedAnswers.every(
          question.options.contains,
        ),
      ),
      isTrue,
    );
    final reviewedPlaceAlternatives = bank.topics
        .singleWhere((topic) => topic.key == 'PREPOSITION_OF_PLACE')
        .questions
        .where((question) => question.acceptedAnswers.length > 1)
        .toList(growable: false);
    expect(reviewedPlaceAlternatives, hasLength(47));
    final phrasalTopic = bank.topics.singleWhere(
      (topic) => topic.key == 'PHRASAL_VERB',
    );
    expect(
      phrasalTopic.questions
          .where((question) => question.acceptedAnswers.length > 1),
      hasLength(2),
    );
    final cheerUp = phrasalTopic.questions.singleWhere(
      (question) => question.id == 'phrasal_verb_039',
    );
    expect(cheerUp.prompt, contains('my friend'));
    expect(cheerUp.prompt, isNot(contains('cheer up you')));
    final compoundTopic = bank.topics.singleWhere(
      (topic) => topic.key == 'COMPOUND_ADJ',
    );
    expect(
      compoundTopic.questions
          .where((question) => question.acceptedAnswers.length > 1),
      hasLength(36),
    );
    expect(
      compoundTopic.questions
          .singleWhere((question) => question.id == 'compound_adj_173')
          .prompt,
      contains('delighted'),
    );
    final comparativeTopic = bank.topics.singleWhere(
      (topic) => topic.key == 'COMPARATIVE_SUPERLATIVE',
    );
    expect(
      comparativeTopic.questions.where(
        (question) => question.answers.length > 1,
      ),
      hasLength(17),
    );
    expect(
      comparativeTopic.questions
          .singleWhere(
            (question) => question.id == 'comparative_superlative_033',
          )
          .correctAnswerText,
      'the eldest / the oldest',
    );
    final questionTags = bank.topics.singleWhere(
      (topic) => topic.key == 'QUESTION_TAG',
    );
    expect(
      questionTags.questions
          .singleWhere((question) => question.id == 'question_tag_001')
          .answers,
      containsAll(["isn't it", 'is it not']),
    );
    expect(
      questionTags.questions
          .singleWhere((question) => question.id == 'question_tag_008')
          .answers,
      contains('am I not'),
    );
    final verbs = bank.topics.singleWhere(
      (topic) => topic.key == 'VERB_TABLE',
    );
    expect(
      verbs.questions
          .singleWhere((question) => question.id == 'verb_learn_91fcb76d7dec')
          .past,
      'learnt/learned',
    );
    final practise = verbs.questions.singleWhere(
      (question) => question.id == 'verb_practise_20bde8dab6ba',
    );
    expect(practise.present, 'practise/practice');
    expect(practise.ing, 'practising/practicing');
    final pronouns = bank.topics.singleWhere(
      (topic) => topic.key == 'PRONOUN',
    );
    expect(
      pronouns.questions
          .singleWhere((question) => question.id == 'pronoun_013')
          .answers,
      ['me', 'I'],
    );
    expect(
      pronouns.questions
          .singleWhere((question) => question.id == 'pronoun_114')
          .prompt,
      contains('in ______ collection'),
    );
    final conditionals = bank.topics.singleWhere(
      (topic) => topic.key == 'CONDITIONAL',
    );
    expect(
      conditionals.questions.every(
        (question) => question.correctTokenSets.length >= 2,
      ),
      isTrue,
    );
    final indirectQuestions = bank.topics.singleWhere(
      (topic) => topic.key == 'INDIRECT_QUESTION',
    );
    final whetherQuestions = indirectQuestions.questions.where(
      (question) => question.correctTokenSets.any(
        (tokens) => tokens.contains('whether'),
      ),
    );
    expect(
      whetherQuestions.every((question) {
        final primary = question.correctTokenSets.first;
        final whetherIndex = primary.indexOf('whether');
        final blocked = (whetherIndex > 0 &&
                primary[whetherIndex - 1].toLowerCase() == 'about') ||
            (whetherIndex >= 0 &&
                whetherIndex < primary.length - 1 &&
                primary[whetherIndex + 1].toLowerCase() == 'to');
        return blocked ||
            question.correctTokenSets.any((tokens) => tokens.contains('if'));
      }),
      isTrue,
    );
    final reported = bank.topics.singleWhere(
      (topic) => topic.key == 'REPORTED_SPEECH',
    );
    final firstStatement = reported.questions.singleWhere(
      (question) => question.id == 'reported_speech_001',
    );
    expect(
      firstStatement.correctTokenSets,
      contains(
        equals(['Mary', 'said', 'that', 'she', 'was', 'tired', '.']),
      ),
    );
    final firstYesNo = reported.questions.singleWhere(
      (question) => question.id == 'reported_speech_052',
    );
    expect(
      firstYesNo.correctTokenSets.any((tokens) => tokens.contains('whether')),
      isTrue,
    );
    final participles = bank.topics.singleWhere(
      (topic) => topic.key == 'PARTICIPLE_PHRASES',
    );
    final introductory = participles.questions.where(
      (question) => question.correctTokenSets.first.contains(','),
    );
    expect(
      introductory.every((question) => question.correctTokenSets.length >= 2),
      isTrue,
    );
    final deStructure = bank.topics.singleWhere(
      (topic) => topic.key == 'DE_STRUCTURE',
    );
    expect(
      deStructure.questions
          .singleWhere((question) => question.id == 'de_structure_021')
          .correctTokenSets,
      contains(equals(['A', 'computer', 'having', 'many', 'screens'])),
    );
    expect(
      deStructure.questions
          .singleWhere((question) => question.id == 'de_structure_049')
          .correctTokenSets,
      contains(equals(['A', 'problem', 'that', 'parents', 'often', 'face'])),
    );
    expect(
      deStructure.questions
          .singleWhere((question) => question.id == 'de_structure_057')
          .correctTokenSets,
      contains(
        equals(['Students', 'who', 'are', 'willing', 'to', 'help', 'me']),
      ),
    );
    final inversion = bank.topics.singleWhere(
      (topic) => topic.key == 'INVERSION',
    );
    expect(
      inversion.questions
          .singleWhere((question) => question.id == 'inversion_089')
          .correctTokenSets,
      contains(
        equals([
          'If',
          'he',
          'had',
          'replied',
          'to',
          'me',
          'earlier',
          ',',
          'I',
          'would',
          'have',
          'finished',
          'the',
          'test',
          'properly',
          '.'
        ]),
      ),
    );
    expect(
      inversion.questions
          .singleWhere((question) => question.id == 'inversion_096')
          .correctTokenSets,
      contains(
        equals([
          'A',
          'swarm',
          'of',
          'crazy',
          'fans',
          'stood',
          'in',
          'the',
          'airport',
          '.'
        ]),
      ),
    );
  });

  test('a newly published Battleship question syncs and survives offline cache',
      () async {
    final source = await rootBundle.loadString(
      GrammarWorkshopRepository.bundledAsset,
    );
    final package = _deepMap(jsonDecode(source));
    final manifest = _deepMap(package['manifest']);
    final topics = _deepMap(package['topics']);
    final place = _deepMap(topics['PREPOSITION_OF_PLACE']);
    final questions = _deepMap(place['questions']);
    final order = List<String>.from(place['order'] as List);
    const newId = 'preposition_place_sync_test';
    questions[newId] = {
      'id': newId,
      'chinese': '測試同步題目。',
      'question': 'The book is ______ the desk.',
      'options': ['on', 'at', 'in'],
      'correctIndex': 0,
      'explanation': '接觸表面使用 on。',
    };
    order.add(newId);
    place['questions'] = questions;
    place['order'] = order;
    place['count'] = order.length;
    final orderedQuestions =
        order.map((id) => _deepMap(questions[id])).toList(growable: false);
    place['hash'] = grammarWorkshopContentHash(orderedQuestions);
    topics['PREPOSITION_OF_PLACE'] = place;
    manifest['releaseId'] = 'v2-sync-test';
    manifest['publishedAt'] = (manifest['publishedAt'] as num).toInt() + 1000;
    final manifestTopics = _deepMap(manifest['topics']);
    final placeManifest = _deepMap(manifestTopics['PREPOSITION_OF_PLACE']);
    placeManifest['count'] = order.length;
    placeManifest['hash'] = place['hash'];
    manifestTopics['PREPOSITION_OF_PLACE'] = placeManifest;
    manifest['topics'] = manifestTopics;

    final cacheDirectory = await Directory.systemTemp.createTemp(
      'dope-workshop-cache-',
    );
    addTearDown(() => cacheDirectory.delete(recursive: true));
    final cacheFile = File('${cacheDirectory.path}/release.json');
    final onlineClient = MockClient((request) async {
      if (request.url == GrammarWorkshopRepository.manifestUri) {
        return http.Response(
          jsonEncode(manifest),
          200,
          headers: {'content-type': 'application/json; charset=utf-8'},
        );
      }
      if (request.url == GrammarWorkshopRepository.topicsUri) {
        return http.Response(
          jsonEncode(topics),
          200,
          headers: {'content-type': 'application/json; charset=utf-8'},
        );
      }
      return http.Response('Not found', 404);
    });
    final onlineRepository = GrammarWorkshopRepository(
      client: onlineClient,
      cacheFile: () async => cacheFile,
    );

    final online = await onlineRepository.load();

    expect(online.releaseId, 'v2-sync-test', reason: online.syncError);
    expect(online.source, GrammarWorkshopSource.online);
    expect(online.questionCount, 3880);
    expect(
      online.topics
          .singleWhere((topic) => topic.key == 'PREPOSITION_OF_PLACE')
          .questions
          .any((question) => question.id == newId),
      isTrue,
    );
    expect(await cacheFile.exists(), isTrue);

    final offlineRepository = GrammarWorkshopRepository(
      client: MockClient((_) async => throw const SocketException('offline')),
      cacheFile: () async => cacheFile,
    );
    final offline = await offlineRepository.load();
    expect(offline.releaseId, 'v2-sync-test');
    expect(offline.source, GrammarWorkshopSource.cache);
    expect(offline.questionCount, 3880);
    expect(offline.syncError, isNotNull);
  });
}

Map<String, dynamic> _deepMap(Object? value) {
  return Map<String, dynamic>.from(value as Map);
}
