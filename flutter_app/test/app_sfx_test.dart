import 'dart:async';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/core/app_sfx.dart';

void main() {
  test('every playable cue including step is preloaded from a real asset', () {
    expect(AppSfx.assetPaths.containsKey(SfxCue.complete), isFalse);
    expect(AppSfx.assetPaths[SfxCue.step], 'audio/sfx/step.wav');
    expect(AppSfx.assetPaths[SfxCue.type], 'audio/sfx/type.mp3');
    expect(AppSfx.assetPaths[SfxCue.close], 'audio/sfx/close.mp3');
    expect(
      AppSfx.assetPaths[SfxCue.clickEnglishWords],
      'audio/sfx/click_english_words.mp3',
    );
    expect(AppSfx.assetPaths.keys, hasLength(SfxCue.values.length - 1));
    for (final asset in AppSfx.assetPaths.values) {
      expect(File('assets/$asset').existsSync(), isTrue, reason: asset);
    }
  });

  test('play waits for one shared mixer preload and never reinitializes it',
      () async {
    final mixer = _RecordingGameSfxMixer(delayedInitialization: true);
    final sfx = AppSfx.forTesting(mixer);

    final firstPlay = sfx.play(SfxCue.step);
    await Future<void>.delayed(Duration.zero);
    expect(mixer.initializeCalls, 1);
    expect(mixer.played, isEmpty);

    mixer.finishInitialization();
    await firstPlay;
    await sfx.play(SfxCue.click);
    await sfx.play(SfxCue.step);

    expect(mixer.initializeCalls, 1);
    expect(mixer.played, [SfxCue.step, SfxCue.click, SfxCue.step]);
    expect(mixer.assets.keys, containsAll([SfxCue.step, SfxCue.click]));
  });

  test('completion stays silent and wrong uses its reduced mix volume',
      () async {
    final mixer = _RecordingGameSfxMixer();
    final sfx = AppSfx.forTesting(mixer);

    await sfx.play(SfxCue.complete);
    expect(mixer.initializeCalls, 0);
    await sfx.play(SfxCue.wrong);

    expect(mixer.played, [SfxCue.wrong]);
    expect(mixer.volumes, [0.9]);
  });

  test('mixer failures never interrupt the lesson', () async {
    final mixer = _RecordingGameSfxMixer(failPlayback: true);
    final sfx = AppSfx.forTesting(mixer);

    await expectLater(sfx.play(SfxCue.correct), completes);
  });
}

class _RecordingGameSfxMixer implements GameSfxMixer {
  _RecordingGameSfxMixer({
    this.delayedInitialization = false,
    this.failPlayback = false,
  });

  final bool delayedInitialization;
  final bool failPlayback;
  final Completer<void> _initialization = Completer<void>();
  final List<SfxCue> played = [];
  final List<double> volumes = [];
  final List<double> masterVolumes = [];
  Map<SfxCue, String> assets = const {};
  int initializeCalls = 0;

  @override
  Future<void> initialize(Map<SfxCue, String> assets) async {
    initializeCalls += 1;
    this.assets = assets;
    if (delayedInitialization) await _initialization.future;
  }

  void finishInitialization() {
    if (!_initialization.isCompleted) _initialization.complete();
  }

  @override
  Future<void> play(SfxCue cue, {required double volume}) async {
    if (failPlayback) throw StateError('mixer failed');
    played.add(cue);
    volumes.add(volume);
  }

  @override
  Future<void> setVolume(double volume) async {
    masterVolumes.add(volume);
  }
}
