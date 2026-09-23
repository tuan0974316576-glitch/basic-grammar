import 'dart:async';
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

  /// Returns true when a local bundled file or persistent downloaded file is
  /// already available. This never calls the network.
  Future<bool> hasAudio(
    String text, {
    VocabAudioKind kind = VocabAudioKind.word,
  });

  /// Ensures an audio file exists in the persistent cache without playing it.
  Future<VocabAudioEnsureResult> ensureAudio(
    String text, {
    VocabAudioKind kind = VocabAudioKind.word,
  });

  Future<void> dispose();
}

abstract interface class VocabAudioVolumeController {
  Future<void> setPlaybackVolume(double volume);
}

abstract interface class VocabAudioRevisionRefresher {
  /// Checks for a teacher-corrected cloud revision without playing audio.
  Future<VocabAudioEnsureResult> refreshWordAudio(String word);
}

@visibleForTesting
double boostedVocabPlaybackVolume(double masterVolume) =>
    (masterVolume * 1.6).clamp(0, 1).toDouble();

class VocabAudioEnsureResult {
  const VocabAudioEnsureResult({
    required this.status,
    this.source = '',
    this.reason = '',
  });

  final String status;
  final String source;
  final String reason;

  bool get ready => status == 'ready' || status == 'skipped';
}

class SharedVocabAudio {
  const SharedVocabAudio({
    required this.downloadUrl,
    this.revision = '',
  });

  final String downloadUrl;
  final String revision;
}

abstract interface class VocabAudioCloudClient {
  Future<SharedVocabAudio?> ensureAudio(
    String text, {
    required VocabAudioKind kind,
    bool checkOnly = false,
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
    bool checkOnly = false,
  }) async {
    try {
      final functions =
          _functions ?? FirebaseFunctions.instanceFor(region: 'asia-east2');
      final callable = functions.httpsCallable(
        'ensureVocabAudio',
        options: HttpsCallableOptions(timeout: const Duration(seconds: 12)),
      );
      final result = await callable.call<Object?>({
        'text': text,
        'word': text,
        'kind': kind == VocabAudioKind.example ? 'example' : 'word',
        if (checkOnly) 'checkOnly': true,
      });
      final raw = result.data;
      if (raw is! Map) return null;
      final data = Map<String, dynamic>.from(raw);
      final url = '${data['downloadUrl'] ?? ''}'.trim();
      if (data['status'] != 'ready' || url.isEmpty) return null;
      return SharedVocabAudio(
        downloadUrl: url,
        revision: '${data['revision'] ?? ''}'.trim(),
      );
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

class AssetVocabAudioRepository
    implements
        VocabAudioRepository,
        VocabAudioVolumeController,
        VocabAudioRevisionRefresher {
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
  final Map<String, Future<String?>> _correctionChecksInFlight = {};
  final Set<String> _cloudCheckedWords = {};
  Map<String, String>? _audioByWord;
  double _playbackVolume = 0.5;

  @override
  Future<void> setPlaybackVolume(double volume) async {
    _playbackVolume = volume.clamp(0, 1);
    await _player?.setVolume(_playbackVolume);
  }

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
    final cachedPath = await _existingCachedAudioPath(
      normalized,
      VocabAudioKind.word,
    );
    if (cachedPath != null) {
      unawaited(refreshWordAudio(normalized));
      return _play(DeviceFileSource(cachedPath));
    }
    final manifestPath = (await _loadManifest())[normalized];
    if (manifestPath != null && manifestPath.isNotEmpty) {
      unawaited(refreshWordAudio(normalized));
      return _play(AssetSource(manifestPath));
    }
    final correctedPath = await _resolveCloudCorrectionOnce(normalized);
    if (correctedPath != null) {
      return _play(DeviceFileSource(correctedPath));
    }
    final path = await _resolveSharedAudioOnce(normalized, VocabAudioKind.word);
    if (path == null) return false;
    return _play(DeviceFileSource(path));
  }

  @override
  Future<bool> speakExample(String sentence) async {
    final text = _normalizeExample(sentence);
    if (!_isValidExample(text)) return false;
    final path = await _resolveSharedAudioOnce(text, VocabAudioKind.example);
    if (path == null) return false;
    return _play(DeviceFileSource(path));
  }

  @override
  Future<bool> hasAudio(
    String text, {
    VocabAudioKind kind = VocabAudioKind.word,
  }) async {
    final normalized = kind == VocabAudioKind.word
        ? normalizeVocabWord(text)
        : _normalizeExample(text);
    if (normalized.isEmpty) return false;
    if (kind == VocabAudioKind.word &&
        (await _loadManifest())[normalized]?.isNotEmpty == true) {
      return true;
    }
    final directory = await _cacheDirectory();
    final target = File('${directory.path}/${_cacheKey(normalized, kind)}.mp3');
    if (!await target.exists()) return false;
    return await target.length() > 0;
  }

  @override
  Future<VocabAudioEnsureResult> ensureAudio(
    String text, {
    VocabAudioKind kind = VocabAudioKind.word,
  }) async {
    final normalized = kind == VocabAudioKind.word
        ? normalizeVocabWord(text)
        : _normalizeExample(text);
    if (normalized.isEmpty ||
        (kind == VocabAudioKind.example && !_isValidExample(normalized))) {
      return const VocabAudioEnsureResult(
        status: 'error',
        reason: 'invalid-text',
      );
    }
    if (await hasAudio(normalized, kind: kind)) {
      return const VocabAudioEnsureResult(
        status: 'skipped',
        source: 'existing',
      );
    }
    if (_cloudClient == null) {
      return const VocabAudioEnsureResult(
        status: 'error',
        reason: 'cloud-unavailable',
      );
    }
    final path = await _resolveSharedAudioOnce(normalized, kind);
    return path == null
        ? const VocabAudioEnsureResult(
            status: 'error', reason: 'download-failed')
        : const VocabAudioEnsureResult(status: 'ready', source: 'shared-cloud');
  }

  @override
  Future<VocabAudioEnsureResult> refreshWordAudio(String word) async {
    final normalized = normalizeVocabWord(word);
    if (normalized.isEmpty) {
      return const VocabAudioEnsureResult(
        status: 'error',
        reason: 'invalid-text',
      );
    }
    if (_cloudClient == null) {
      return const VocabAudioEnsureResult(
        status: 'error',
        reason: 'cloud-unavailable',
      );
    }
    final path = await _resolveCloudCorrectionOnce(normalized);
    return path == null
        ? const VocabAudioEnsureResult(
            status: 'skipped',
            source: 'existing',
          )
        : const VocabAudioEnsureResult(
            status: 'ready',
            source: 'cloud-revision',
          );
  }

  Future<String?> _resolveSharedAudioOnce(
    String text,
    VocabAudioKind kind,
  ) {
    final key = _cacheKey(text, kind);
    final existing = _downloadsInFlight[key];
    if (existing != null) return existing;
    late final Future<String?> task;
    task = _resolveSharedAudio(text, kind).whenComplete(() {
      if (identical(_downloadsInFlight[key], task)) {
        _downloadsInFlight.remove(key);
      }
    });
    _downloadsInFlight[key] = task;
    return task;
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
      return await _downloadSharedAudio(target, shared);
    } catch (error) {
      debugPrint('Vocab audio cache failed: $error');
      return null;
    }
  }

  Future<String?> _existingCachedAudioPath(
    String text,
    VocabAudioKind kind,
  ) async {
    final directory = await _cacheDirectory();
    final target = File('${directory.path}/${_cacheKey(text, kind)}.mp3');
    if (!await target.exists() || await target.length() <= 0) return null;
    return target.path;
  }

  Future<String?> _resolveCloudCorrectionOnce(String word) {
    if (_cloudClient == null) return Future.value(null);
    final pending = _correctionChecksInFlight[word];
    if (pending != null) return pending;
    if (!_cloudCheckedWords.add(word)) return Future.value(null);

    late final Future<String?> task;
    task = _resolveCloudCorrection(word).whenComplete(() {
      if (identical(_correctionChecksInFlight[word], task)) {
        _correctionChecksInFlight.remove(word);
      }
    });
    _correctionChecksInFlight[word] = task;
    return task;
  }

  Future<String?> _resolveCloudCorrection(String word) async {
    try {
      final shared = await _cloudClient!.ensureAudio(
        word,
        kind: VocabAudioKind.word,
        checkOnly: true,
      );
      if (shared == null) return null;
      final directory = await _cacheDirectory();
      final target = File(
        '${directory.path}/${_cacheKey(word, VocabAudioKind.word)}.mp3',
      );
      final revisionFile = File('${target.path}.revision');
      final localRevision = await revisionFile.exists()
          ? (await revisionFile.readAsString()).trim()
          : '';
      if (await target.exists() &&
          await target.length() > 0 &&
          shared.revision.isNotEmpty &&
          shared.revision == localRevision) {
        return target.path;
      }
      return await _downloadSharedAudio(target, shared);
    } catch (error) {
      debugPrint('Vocab audio correction check failed: $error');
      return null;
    }
  }

  Future<String?> _downloadSharedAudio(
    File target,
    SharedVocabAudio? shared,
  ) async {
    final uri = Uri.tryParse(shared?.downloadUrl ?? '');
    if (uri == null || uri.scheme != 'https') return null;
    final response = await _download(uri).timeout(const Duration(seconds: 20));
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
    final revisionFile = File('${target.path}.revision');
    if (shared!.revision.isNotEmpty) {
      await revisionFile.writeAsString(shared.revision, flush: true);
    } else if (await revisionFile.exists()) {
      await revisionFile.delete();
    }
    return target.path;
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
        // Give vocabulary speech a modest clarity boost without changing the
        // Vocabulary speech needs extra headroom in a busy classroom. Keep
        // the user's master slider as the base and add a 60% clarity boost.
        await _player.play(
          source,
          volume: boostedVocabPlaybackVolume(_playbackVolume),
        );
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
  Future<bool> hasAudio(
    String text, {
    VocabAudioKind kind = VocabAudioKind.word,
  }) async =>
      false;

  @override
  Future<VocabAudioEnsureResult> ensureAudio(
    String text, {
    VocabAudioKind kind = VocabAudioKind.word,
  }) async =>
      const VocabAudioEnsureResult(
        status: 'error',
        reason: 'silent-repository',
      );

  @override
  Future<bool> speakWord(String word) async => false;

  @override
  Future<void> dispose() async {}
}
