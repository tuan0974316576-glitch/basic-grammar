import 'dart:async';
import 'dart:io';

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;

import 'package:dope_english/features/vocabulary/vocab_audio_repository.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  late Directory cacheRoot;

  setUp(() async {
    cacheRoot = await Directory.systemTemp.createTemp('dope-vocab-audio-');
  });

  tearDown(() async {
    if (await cacheRoot.exists()) {
      await cacheRoot.delete(recursive: true);
    }
  });

  test('vocabulary speech gets a 60 percent boost capped at full volume', () {
    expect(boostedVocabPlaybackVolume(0.5), closeTo(0.8, 0.0001));
    expect(boostedVocabPlaybackVolume(0.8), 1);
    expect(boostedVocabPlaybackVolume(1), 1);
  });

  test('downloads example audio once and reuses the disk cache', () async {
    final cloud = _FakeCloudClient();
    var downloadCount = 0;
    final playedSources = <Source>[];
    final repository = AssetVocabAudioRepository(
      cloudClient: cloud,
      directoryProvider: () async => cacheRoot,
      download: (uri) async {
        downloadCount += 1;
        return http.Response.bytes(
          const [0x49, 0x44, 0x33, 0x04, 0x00],
          200,
          headers: const {'content-type': 'audio/mpeg'},
        );
      },
      playback: (source) async => playedSources.add(source),
    );

    const sentence = 'A1 BUDDY helps me learn new words.';
    expect(
      await repository
          .speakExample(sentence)
          .timeout(const Duration(seconds: 3)),
      isTrue,
    );
    expect(
      await repository
          .speakExample(sentence)
          .timeout(const Duration(seconds: 3)),
      isTrue,
    );

    expect(cloud.requests, [sentence]);
    expect(downloadCount, 1);
    expect(playedSources, hasLength(2));
    expect(playedSources.every((source) => source is DeviceFileSource), isTrue);
    final cachedFiles = Directory('${cacheRoot.path}/vocab-audio/v1')
        .listSync()
        .whereType<File>()
        .where((file) => file.path.endsWith('.mp3'))
        .toList();
    expect(cachedFiles, hasLength(1));
    expect(await cachedFiles.single.length(), greaterThan(0));

    await repository.dispose();
  });

  test('refreshes a cached word when the cloud revision changes', () async {
    final cloud = _FakeCloudClient();
    var audioByte = 1;
    var downloadCount = 0;

    AssetVocabAudioRepository makeRepository() => AssetVocabAudioRepository(
          cloudClient: cloud,
          directoryProvider: () async => cacheRoot,
          download: (uri) async {
            downloadCount += 1;
            return http.Response.bytes(
              [0x49, 0x44, 0x33, audioByte],
              200,
              headers: const {'content-type': 'audio/mpeg'},
            );
          },
          playback: (_) async {},
        );

    var repository = makeRepository();
    expect(await repository.speakWord('bald'), isTrue);
    expect(downloadCount, 1);
    await repository.dispose();

    cloud.revision = 'revision-2';
    audioByte = 2;
    repository = makeRepository();
    expect(await repository.speakWord('bald'), isTrue);
    await repository.refreshWordAudio('bald');
    expect(downloadCount, 2);
    expect(cloud.checkOnlyRequests, ['bald', 'bald']);

    expect(await repository.speakWord('bald'), isTrue);
    expect(downloadCount, 2);
    expect(cloud.checkOnlyRequests, ['bald', 'bald']);
    await repository.dispose();
  });

  test('cached word plays without waiting for a cloud revision check',
      () async {
    final seedRepository = AssetVocabAudioRepository(
      cloudClient: _FakeCloudClient(),
      directoryProvider: () async => cacheRoot,
      download: (_) async => http.Response.bytes(
        const [0x49, 0x44, 0x33, 0x01],
        200,
        headers: const {'content-type': 'audio/mpeg'},
      ),
      playback: (_) async {},
    );
    expect(await seedRepository.speakWord('instant word'), isTrue);
    await seedRepository.dispose();

    final cloud = _ControlledCloudClient();
    final playedSources = <Source>[];
    final repository = AssetVocabAudioRepository(
      cloudClient: cloud,
      directoryProvider: () async => cacheRoot,
      download: (_) async => http.Response.bytes(
        const [0x49, 0x44, 0x33, 0x02],
        200,
        headers: const {'content-type': 'audio/mpeg'},
      ),
      playback: (source) async => playedSources.add(source),
    );

    expect(
      await repository
          .speakWord('instant word')
          .timeout(const Duration(milliseconds: 500)),
      isTrue,
    );
    expect(cloud.checkStarted.isCompleted, isTrue);
    expect(playedSources.single, isA<DeviceFileSource>());

    cloud.response.complete(const SharedVocabAudio(
      downloadUrl: 'https://example.test/revised.mp3',
      revision: 'revision-1',
    ));
    await repository.refreshWordAudio('instant word');
    await repository.dispose();
  });

  test('does not request cloud audio for invalid example text', () async {
    final cloud = _FakeCloudClient();
    final repository = AssetVocabAudioRepository(
      cloudClient: cloud,
      directoryProvider: () async => cacheRoot,
      playback: (_) async {},
    );

    expect(await repository.speakExample('中文例句'), isFalse);
    expect(cloud.requests, isEmpty);

    await repository.dispose();
  });

  test(
      'hasAudio skips bundled words and ensureAudio fills cache without playback',
      () async {
    final cloud = _FakeCloudClient();
    var downloadCount = 0;
    final playedSources = <Source>[];
    final repository = AssetVocabAudioRepository(
      cloudClient: cloud,
      directoryProvider: () async => cacheRoot,
      download: (uri) async {
        downloadCount += 1;
        return http.Response.bytes(
          const [0x49, 0x44, 0x33, 0x04, 0x00],
          200,
          headers: const {'content-type': 'audio/mpeg'},
        );
      },
      playback: (source) async => playedSources.add(source),
    );

    expect(await repository.hasAudio('animation'), isTrue);
    expect(
      await repository.ensureAudio('background word'),
      isA<VocabAudioEnsureResult>()
          .having((result) => result.ready, 'ready', true),
    );
    expect(downloadCount, 1);
    expect(playedSources, isEmpty);
    expect(await repository.hasAudio('background word'), isTrue);

    await repository.dispose();
  });
}

class _FakeCloudClient implements VocabAudioCloudClient {
  final requests = <String>[];
  final checkOnlyRequests = <String>[];
  String revision = 'revision-1';

  @override
  Future<SharedVocabAudio?> ensureAudio(
    String text, {
    required VocabAudioKind kind,
    bool checkOnly = false,
  }) async {
    requests.add(text);
    if (checkOnly) checkOnlyRequests.add(text);
    return SharedVocabAudio(
      downloadUrl: 'https://example.test/example.mp3',
      revision: revision,
    );
  }
}

class _ControlledCloudClient implements VocabAudioCloudClient {
  final checkStarted = Completer<void>();
  final response = Completer<SharedVocabAudio?>();

  @override
  Future<SharedVocabAudio?> ensureAudio(
    String text, {
    required VocabAudioKind kind,
    bool checkOnly = false,
  }) {
    if (!checkStarted.isCompleted) checkStarted.complete();
    return response.future;
  }
}
