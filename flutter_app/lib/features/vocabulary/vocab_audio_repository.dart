import 'dart:convert';
import 'dart:io';

import 'package:audioplayers/audioplayers.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:crypto/crypto.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';

import 'vocab_models.dart';

enum VocabAudioKind { word, example }

abstract interface class VocabAudioRepository {
  Future<bool> speakWord(String word);

  Future<bool> speakExample(String sentence);

  Future<void> dispose();
}

class SharedVocabAudio {
  const SharedVocabAudio({required this.downloadUrl});

  final String downloadUrl;
}

abstract interface class VocabAudioCloudClient {
  Future<SharedVocabAudio?> ensureAudio(
    String text, {
    required VocabAudioKind kind,
  });
}

class FirebaseVocabAudioCloudClient implements VocabAudioCloudClient {
  FirebaseVocabAudioCloudClient({FirebaseFunctions? functions})
      : _functions = functions;

  final FirebaseFunctions? _functions;

  @override
  Future<SharedVocabAudio?> ensureAudio(
    String text, {
    required VocabAudioKind kind,
  }) async {
    try {
      final functions =
          _functions ?? FirebaseFunctions.instanceFor(region: 'asia-east2');
      final callable = functions.httpsCallable(
        'ensureVocabAudio',
        options: HttpsCallableOptions(timeout: const Duration(seconds: 35)),
      );
      final result = await callable.call<Object?>({
        'text': text,
        'word': text,
        'kind': kind == VocabAudioKind.example ? 'example' : 'word',
      });
      final raw = result.data;
      if (raw is! Map) return null;
      final data = Map<String, dynamic>.from(raw);
      final url = '${data['downloadUrl'] ?? ''}'.trim();
      if (data['status'] != 'ready' || url.isEmpty) return null;
      return SharedVocabAudio(downloadUrl: url);
    } on FirebaseFunctionsException catch (error) {
      debugPrint(
        'Shared vocab audio failed: ${error.code} ${error.message ?? ''}',
      );
      return null;
    } catch (error) {
      debugPrint('Shared vocab audio failed: $error');
      return null;
    }
  }
}

typedef VocabAudioDirectoryProvider = Future<Directory> Function();
typedef VocabAudioDownload = Future<http.Response> Function(Uri uri);
typedef VocabAudioPlayback = Future<void> Function(Source source);

class AssetVocabAudioRepository implements VocabAudioRepository {
  AssetVocabAudioRepository({
    AssetBundle? bundle,
    AudioPlayer? player,
    VocabAudioCloudClient? cloudClient,
    VocabAudioDirectoryProvider? directoryProvider,
    VocabAudioDownload? download,
    VocabAudioPlayback? playback,
  })  : _bundle = bundle ?? rootBundle,
        _player = playback == null ? (player ?? AudioPlayer()) : player,
        _cloudClient = cloudClient,
        _directoryProvider =
            directoryProvider ?? getApplicationSupportDirectory,
        _download = download ?? http.get,
        _playback = playback;

  static const _manifestPath = 'assets/data/vocab/audio_manifest.json';
  static const _maximumAudioBytes = 8 * 1024 * 1024;

  final AssetBundle _bundle;
  final AudioPlayer? _player;
  final VocabAudioCloudClient? _cloudClient;
  final VocabAudioDirectoryProvider _directoryProvider;
  final VocabAudioDownload _download;
  final VocabAudioPlayback? _playback;
  final Map<String, Future<String?>> _downloadsInFlight = {};
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
    final normalized = normalizeVocabWord(word);
    if (normalized.isEmpty) return false;
    final path = (await _loadManifest())[normalized];
    if (path != null && path.isNotEmpty) {
      return _play(AssetSource(path));
    }
    return _speakShared(normalized, VocabAudioKind.word);
  }

  @override
  Future<bool> speakExample(String sentence) async {
    final text = _normalizeExample(sentence);
    if (!_isValidExample(text)) return false;
    return _speakShared(text, VocabAudioKind.example);
  }

  Future<bool> _speakShared(String text, VocabAudioKind kind) async {
    if (_cloudClient == null) return false;
    final key = _cacheKey(text, kind);
    final path = await (_downloadsInFlight[key] ??=
        _resolveSharedAudio(text, kind).whenComplete(
      () {
        _downloadsInFlight.remove(key);
      },
    ));
    if (path == null) return false;
    return _play(DeviceFileSource(path));
  }

  Future<String?> _resolveSharedAudio(
    String text,
    VocabAudioKind kind,
  ) async {
    try {
      final directory = await _cacheDirectory();
      final target = File('${directory.path}/${_cacheKey(text, kind)}.mp3');
      if (await target.exists() && await target.length() > 0) {
        return target.path;
      }

      final shared = await _cloudClient!.ensureAudio(text, kind: kind);
      final uri = Uri.tryParse(shared?.downloadUrl ?? '');
      if (uri == null || uri.scheme != 'https') return null;
      final response =
          await _download(uri).timeout(const Duration(seconds: 20));
      final bytes = response.bodyBytes;
      final contentType = response.headers['content-type']?.toLowerCase() ?? '';
      if (response.statusCode != 200 ||
          bytes.isEmpty ||
          bytes.length > _maximumAudioBytes ||
          (contentType.isNotEmpty &&
              !contentType.contains('audio/mpeg') &&
              !contentType.contains('audio/mp3') &&
              !contentType.contains('application/octet-stream'))) {
        return null;
      }

      final temporary = File('${target.path}.download');
      await temporary.writeAsBytes(bytes, flush: true);
      if (await target.exists()) await target.delete();
      await temporary.rename(target.path);
      return target.path;
    } catch (error) {
      debugPrint('Vocab audio cache failed: $error');
      return null;
    }
  }

  Future<Directory> _cacheDirectory() async {
    final root = await _directoryProvider();
    return Directory('${root.path}/vocab-audio/v1').create(recursive: true);
  }

  Future<bool> _play(Source source) async {
    try {
      final playback = _playback;
      if (playback != null) {
        await playback(source);
      } else {
        await _player!.stop();
        await _player.play(source);
      }
      return true;
    } catch (error) {
      debugPrint('Vocab audio playback failed: $error');
      return false;
    }
  }

  String _cacheKey(String text, VocabAudioKind kind) {
    final prefix = kind == VocabAudioKind.example ? 'example' : 'word';
    final digest = sha256.convert(utf8.encode('$prefix:$text'));
    return '$prefix-$digest';
  }

  String _normalizeExample(String value) {
    return value
        .trim()
        .replaceAll(RegExp('[\u2018\u2019]'), "'")
        .replaceAll(RegExp('[\u201C\u201D]'), '"')
        .replaceAll(RegExp('[\u2010-\u2015]'), '-')
        .replaceAll(RegExp(r'\s+'), ' ');
  }

  bool _isValidExample(String value) {
    return value.isNotEmpty &&
        value.length <= 220 &&
        RegExp('[a-z]', caseSensitive: false).hasMatch(value) &&
        RegExp(r'''^[a-z0-9][a-z0-9\s.,!?;:'"()/-]{0,219}$''',
                caseSensitive: false)
            .hasMatch(value);
  }

  @override
  Future<void> dispose() async {
    await _player?.dispose();
  }
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
