import 'dart:convert';

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/services.dart';

import 'vocab_models.dart';

abstract interface class VocabAudioRepository {
  Future<bool> speakWord(String word);

  Future<bool> speakExample(String sentence);

  Future<void> dispose();
}

class AssetVocabAudioRepository implements VocabAudioRepository {
  AssetVocabAudioRepository({AssetBundle? bundle, AudioPlayer? player})
      : _bundle = bundle ?? rootBundle,
        _player = player ?? AudioPlayer();

  static const _manifestPath = 'assets/data/vocab/audio_manifest.json';

  final AssetBundle _bundle;
  final AudioPlayer _player;
  Map<String, String>? _audioByWord;

  Future<Map<String, String>> _loadManifest() async {
    final cached = _audioByWord;
    if (cached != null) return cached;
    final decoded = jsonDecode(await _bundle.loadString(_manifestPath));
    final manifest = decoded is Map
        ? decoded.map((key, value) => MapEntry('$key', '$value'))
        : <String, String>{};
    _audioByWord = manifest;
    return manifest;
  }

  @override
  Future<bool> speakWord(String word) async {
    final path = (await _loadManifest())[normalizeVocabWord(word)];
    if (path == null || path.isEmpty) return false;
    await _player.stop();
    await _player.play(AssetSource(path));
    return true;
  }

  @override
  Future<bool> speakExample(String sentence) async {
    // Cloud example audio is connected here after native Firebase Auth lands.
    return false;
  }

  @override
  Future<void> dispose() => _player.dispose();
}

class SilentVocabAudioRepository implements VocabAudioRepository {
  const SilentVocabAudioRepository();

  @override
  Future<bool> speakExample(String sentence) async => false;

  @override
  Future<bool> speakWord(String word) async => false;

  @override
  Future<void> dispose() async {}
}
