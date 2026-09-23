import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

import 'package:dope_english/features/vocabulary/vocab_synonym_repository.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('imports Battleship synonym groups and resolves linked meanings',
      () async {
    final repository = AssetVocabSynonymRepository();

    final groups = await repository.lookup('Shocking');

    expect(groups, isNotEmpty);
    expect(groups.first.meaning, '令人震驚');
    expect(
      groups.first.candidates.map((candidate) => candidate.word),
      containsAll(<String>['astonishing', 'astounding', 'mind-blowing']),
    );
    expect(groups.first.candidates.first.sense.source, isNotEmpty);
    expect(await repository.lookup('word-not-in-dse-bank'), isEmpty);
  });

  test('uses a newly published DSE synonym topic and keeps an offline cache',
      () async {
    final directory = await Directory.systemTemp.createTemp('dope-syn-cache-');
    addTearDown(() => directory.delete(recursive: true));
    final cacheFile = File('${directory.path}/synonym_release.json');
    final group = {
      'id': 'remote-bright',
      'meaning': '明亮',
      'words': [
        {'text': 'Bright', 'lookup': 'Bright', 'meaning': '明亮'},
        {'text': 'Radiant', 'lookup': 'Radiant', 'meaning': '明亮'},
      ],
    };
    final ratherGroup = {
      'id': 'remote-instead',
      'meaning': '相反',
      'words': [
        {'text': 'Instead', 'lookup': 'instead', 'meaning': '相反'},
        {'text': 'Rather', 'lookup': 'rather', 'meaning': '反而'},
      ],
    };
    final sizeGroup = {
      'id': 'remote-enormous',
      'meaning': '巨大的',
      'words': [
        {'text': 'Enormous', 'lookup': 'enormous', 'meaning': '巨大的'},
        {'text': 'Immense', 'lookup': 'immense', 'meaning': '巨大的'},
        {'text': 'Massive', 'lookup': 'massive', 'meaning': '巨大的'},
        {'text': 'Tremendous', 'lookup': 'tremendous', 'meaning': '巨大的'},
      ],
    };
    final manifest = {
      'releaseId': 'v2-synonym-test',
      'version': 2,
      'publishedAt': 1788000000000,
      'topics': {
        'DSE_SYNONYM': {'count': 3},
      },
    };
    final topics = {
      'DSE_SYNONYM': {
        'questions': [group, ratherGroup, sizeGroup],
      },
    };
    final client = MockClient((request) async {
      if (request.url.path.endsWith('/manifest.json')) {
        return http.Response.bytes(
          utf8.encode(jsonEncode(manifest)),
          200,
          headers: {'content-type': 'application/json; charset=utf-8'},
        );
      }
      if (request.url.path.endsWith('/topics.json')) {
        return http.Response.bytes(
          utf8.encode(jsonEncode(topics)),
          200,
          headers: {'content-type': 'application/json; charset=utf-8'},
        );
      }
      return http.Response('', 404);
    });
    final online = CloudSyncedVocabSynonymRepository(
      client: client,
      cacheFile: () async => cacheFile,
    );

    final groups = await online.lookup('bright');

    final remoteGroup =
        groups.firstWhere((group) => group.id == 'remote-bright');
    expect(remoteGroup.candidates.single.display, 'radiant');
    final rather = (await online.lookup('instead'))
        .singleWhere((group) => group.id == 'remote-instead')
        .candidates
        .single;
    expect(rather.word, 'rather');
    expect(rather.sense.pos, 'adverb');
    expect(rather.meaningLine, 'adv. 反而');
    final sizeCandidates = (await online.lookup('enormous'))
        .singleWhere((group) => group.id == 'remote-enormous')
        .candidates;
    expect(
      sizeCandidates
          .singleWhere((candidate) => candidate.word == 'immense')
          .sense
          .pos,
      'adjective',
    );
    expect(
      sizeCandidates
          .singleWhere((candidate) => candidate.word == 'massive')
          .sense
          .meaning,
      '巨大的 / 大量的',
    );
    expect(await cacheFile.exists(), isTrue);

    final offline = CloudSyncedVocabSynonymRepository(
      client: MockClient((_) async => throw const SocketException('offline')),
      cacheFile: () async => cacheFile,
    );
    final cached = await offline.lookup('bright');
    expect(cached.firstWhere((group) => group.id == 'remote-bright').meaning,
        '明亮');
  });
}
