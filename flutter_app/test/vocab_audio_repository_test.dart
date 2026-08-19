import 'dart:io';

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;

import 'package:dope_english/features/vocabulary/vocab_audio_repository.dart';

void main() {
  late Directory cacheRoot;

  setUp(() async {
    cacheRoot = await Directory.systemTemp.createTemp('dope-vocab-audio-');
  });

  tearDown(() async {
    if (await cacheRoot.exists()) {
      await cacheRoot.delete(recursive: true);
    }
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

    const sentence = 'DOPE ENGLISH helps me learn new words.';
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
        .toList();
    expect(cachedFiles, hasLength(1));
    expect(await cachedFiles.single.length(), greaterThan(0));

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
}

class _FakeCloudClient implements VocabAudioCloudClient {
  final requests = <String>[];

  @override
  Future<SharedVocabAudio?> ensureAudio(
    String text, {
    required VocabAudioKind kind,
  }) async {
    requests.add(text);
    return const SharedVocabAudio(
      downloadUrl: 'https://example.test/example.mp3',
    );
  }
}
