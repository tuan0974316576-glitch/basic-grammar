import 'dart:async';

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_soloud/flutter_soloud.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum SfxCue {
  start,
  step,
  click,
  clickEnglishWords,
  correct,
  wrong,
  next,
  complete,
  pronounPlace1,
  pronounPlace2,
  pronounPlace3,
  pronounPlace4,
  pronounRowWin,
  pronounGrandWin,
  resultOver80,
  result60To80,
  resultBelow60,
  type,
}

abstract interface class LessonSfx {
  Future<void> play(SfxCue cue);
}

abstract interface class GameSfxMixer {
  Future<void> initialize(Map<SfxCue, String> assets);

  Future<void> play(SfxCue cue, {required double volume});

  Future<void> setVolume(double volume);
}

class AppSfx implements LessonSfx {
  AppSfx._() : _mixer = _SoLoudGameSfxMixer();

  AppSfx.forTesting(GameSfxMixer mixer) : _mixer = mixer;

  static final AppSfx instance = AppSfx._();

  final GameSfxMixer _mixer;
  Future<void>? _initialization;
  double _volume = 0.5;

  static const volumeStorageKey = 'dope_english_master_volume_v1';

  static const Map<SfxCue, String> assetPaths = {
    SfxCue.start: 'audio/sfx/start.wav',
    SfxCue.step: 'audio/sfx/step.wav',
    SfxCue.click: 'audio/sfx/click.wav',
    SfxCue.clickEnglishWords: 'audio/sfx/click_english_words.mp3',
    SfxCue.correct: 'audio/sfx/correct.mp3',
    SfxCue.wrong: 'audio/sfx/wrong.mp3',
    SfxCue.next: 'audio/sfx/next.wav',
    SfxCue.pronounPlace1: 'audio/sfx/pronounPlace1.wav',
    SfxCue.pronounPlace2: 'audio/sfx/pronounPlace2.wav',
    SfxCue.pronounPlace3: 'audio/sfx/pronounPlace3.wav',
    SfxCue.pronounPlace4: 'audio/sfx/pronounPlace4.wav',
    SfxCue.pronounRowWin: 'audio/sfx/pronounRowWin.wav',
    SfxCue.pronounGrandWin: 'audio/sfx/pronounGrandWin.wav',
    SfxCue.resultOver80: 'audio/sfx/result_over80percent.mp3',
    SfxCue.result60To80: 'audio/sfx/result_60to80percent.mp3',
    SfxCue.resultBelow60: 'audio/sfx/result_below60percent.mp3',
    SfxCue.type: 'audio/sfx/type.mp3',
  };

  Future<void> initialize() {
    return _initialization ??= _initialize();
  }

  double get volume => _volume;

  Future<void> _initialize() async {
    try {
      final preferences = await SharedPreferences.getInstance();
      _volume = (preferences.getDouble(volumeStorageKey) ?? 0.5).clamp(0, 1);
    } catch (_) {
      _volume = 0.5;
    }
    await _mixer.initialize(assetPaths);
    await _mixer.setVolume(_volume);
  }

  Future<void> setVolume(double value, {bool persist = true}) async {
    _volume = value.clamp(0, 1);
    await initialize();
    await _mixer.setVolume(_volume);
    if (!persist) return;
    try {
      final preferences = await SharedPreferences.getInstance();
      await preferences.setDouble(volumeStorageKey, _volume);
    } catch (_) {
      // The current session still uses the selected volume.
    }
  }

  @override
  Future<void> play(SfxCue cue) async {
    // Completion is followed by the percentage-specific result cue.
    if (cue == SfxCue.complete) return;
    if (cue == SfxCue.type && kDebugMode) {
      debugPrint('[AppSfx] type cue requested');
    }
    try {
      await initialize();
      await _mixer.play(cue, volume: cue == SfxCue.wrong ? 0.9 : 1);
      if (cue == SfxCue.type && kDebugMode) {
        debugPrint('[AppSfx] type mixer call returned');
      }
    } catch (error) {
      if (cue == SfxCue.type && kDebugMode) {
        debugPrint('[AppSfx] type mixer call failed: $error');
      }
      // A sound failure must never interrupt a lesson.
    }
  }

  static SfxCue resultCueForPercent(int percent) {
    if (percent > 80) return SfxCue.resultOver80;
    if (percent >= 60) return SfxCue.result60To80;
    return SfxCue.resultBelow60;
  }
}

class _SoLoudGameSfxMixer implements GameSfxMixer {
  final SoLoud _engine = SoLoud.instance;
  final AudioPlayer _fallbackPlayer = AudioPlayer();
  final Map<SfxCue, AudioSource> _sources = {};
  Future<void> _fallbackQueue = Future<void>.value();
  Future<AudioPool?>? _typePoolFuture;
  Map<SfxCue, String> _assets = const {};
  bool _fallbackMode = false;
  double _volume = 1;

  @override
  Future<void> initialize(Map<SfxCue, String> assets) async {
    _assets = assets;
    try {
      if (!_engine.isInitialized) {
        await _engine.init(
          sampleRate: 48000,
          bufferSize: 2048,
          channels: Channels.stereo,
          // Shared mode buffers through AudioFlinger, so short UI sounds are
          // not discarded while a Bluetooth route wakes from standby.
          lowLatency: false,
          androidAAudioAttributes: AndroidAAudioAttributes.mediaMusic,
          automaticCleanup: false,
        );
      }
      _engine.setMaxActiveVoiceCount(32);
      final loaded = await Future.wait(
        assets.entries.map((entry) async {
          final source = await _engine.loadAsset(
            'assets/${entry.value}',
            mode: LoadMode.memory,
          );
          return MapEntry(entry.key, source);
        }),
      );
      _sources.addEntries(loaded);
    } catch (_) {
      _fallbackMode = true;
    }
    // A small low-latency pool prevents rapid keyboard taps from cancelling
    // one another when the platform mixer falls back to AudioPlayers.
    _typePoolFuture ??= _createTypePool();
  }

  @override
  Future<void> play(SfxCue cue, {required double volume}) async {
    if (cue == SfxCue.type) {
      final pool = await (_typePoolFuture ??= _createTypePool());
      if (pool != null) {
        try {
          await pool.start(volume: (_volume * volume * 1.25).clamp(0, 1));
          if (kDebugMode) debugPrint('[AppSfx] type pool played');
          return;
        } catch (error) {
          if (kDebugMode) debugPrint('[AppSfx] type pool play failed: $error');
          // Continue through the normal fallback path below.
        }
      }
    }
    final source = _sources[cue];
    if (!_fallbackMode && source != null) {
      try {
        _engine.play(source, volume: volume);
        return;
      } catch (_) {
        _fallbackMode = true;
      }
    }
    final asset = _assets[cue];
    if (asset == null) return;
    _fallbackQueue = _fallbackQueue.then((_) async {
      await _fallbackPlayer.stop();
      await _fallbackPlayer.play(AssetSource(asset), volume: volume);
    }).catchError((_) {});
    await _fallbackQueue;
  }

  @override
  Future<void> setVolume(double volume) async {
    _volume = volume.clamp(0, 1);
    if (!_fallbackMode && _engine.isInitialized) {
      _engine.setGlobalVolume(_volume);
    }
    await _fallbackPlayer.setVolume(_volume);
  }

  Future<AudioPool?> _createTypePool() async {
    final asset = _assets[SfxCue.type];
    if (asset == null) return null;
    try {
      final pool = await AudioPool.createFromAsset(
        path: asset,
        minPlayers: 3,
        maxPlayers: 8,
        playerMode: PlayerMode.lowLatency,
      );
      if (kDebugMode) debugPrint('[AppSfx] type pool loaded: $asset');
      return pool;
    } catch (error) {
      if (kDebugMode) {
        debugPrint('[AppSfx] type pool load failed: $error');
      }
      return null;
    }
  }
}

class SilentLessonSfx implements LessonSfx {
  const SilentLessonSfx();

  @override
  Future<void> play(SfxCue cue) async {}
}
