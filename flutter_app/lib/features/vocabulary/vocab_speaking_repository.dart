import 'dart:convert';
import 'dart:io';

import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';

enum VocabSpeakingStartResult { started, permissionDenied, unavailable }

class VocabPronunciationWordScore {
  const VocabPronunciationWordScore({
    required this.word,
    required this.accuracy,
    this.errorType = '',
  });

  final String word;
  final double accuracy;
  final String errorType;
}

class VocabPronunciationResult {
  const VocabPronunciationResult({
    required this.score,
    required this.recognizedText,
    required this.words,
  });

  final double score;
  final String recognizedText;
  final List<VocabPronunciationWordScore> words;

  bool get passed => score >= 65;

  VocabPronunciationWordScore? get weakestWord {
    if (words.isEmpty) return null;
    return words.reduce(
      (left, right) => left.accuracy <= right.accuracy ? left : right,
    );
  }
}

abstract interface class VocabSpeakingRepository {
  Future<VocabSpeakingStartResult> start();

  Future<VocabPronunciationResult?> stopAndAssess({
    required String expectedText,
    required String referenceId,
  });

  Future<void> cancel();

  Future<void> dispose();
}

class FirebaseVocabSpeakingRepository implements VocabSpeakingRepository {
  FirebaseVocabSpeakingRepository({
    FirebaseFunctions? functions,
    AudioRecorder? recorder,
  })  : _functions = functions,
        _recorder = recorder ?? AudioRecorder();

  final FirebaseFunctions? _functions;
  final AudioRecorder _recorder;
  String? _recordingPath;

  @override
  Future<VocabSpeakingStartResult> start() async {
    try {
      if (!await _recorder.hasPermission()) {
        return VocabSpeakingStartResult.permissionDenied;
      }
      final directory = await getTemporaryDirectory();
      final path =
          '${directory.path}/vocab-speaking-${DateTime.now().microsecondsSinceEpoch}.wav';
      await _recorder.start(
        const RecordConfig(
          encoder: AudioEncoder.wav,
          sampleRate: 16000,
          numChannels: 1,
          autoGain: true,
          echoCancel: true,
          noiseSuppress: true,
        ),
        path: path,
      );
      _recordingPath = path;
      return VocabSpeakingStartResult.started;
    } catch (error) {
      debugPrint('Vocabulary speaking recorder failed to start: $error');
      return VocabSpeakingStartResult.unavailable;
    }
  }

  @override
  Future<VocabPronunciationResult?> stopAndAssess({
    required String expectedText,
    required String referenceId,
  }) async {
    File? recording;
    try {
      final stoppedPath = await _recorder.stop();
      final path = stoppedPath ?? _recordingPath;
      _recordingPath = null;
      if (path == null) return null;
      recording = File(path);
      if (!await recording.exists()) return null;
      final bytes = await recording.readAsBytes();
      if (bytes.length < 44 || bytes.length > 4 * 1024 * 1024) return null;

      final functions =
          _functions ?? FirebaseFunctions.instanceFor(region: 'asia-east2');
      final callable = functions.httpsCallable(
        'assessVocabPronunciation',
        options: HttpsCallableOptions(timeout: const Duration(seconds: 45)),
      );
      final response = await callable.call<Object?>({
        'expectedText': expectedText.trim(),
        'referenceId': referenceId,
        'audioBase64': base64Encode(bytes),
      });
      final raw = response.data;
      if (raw is! Map) return null;
      return _parseResult(Map<String, dynamic>.from(raw));
    } on FirebaseFunctionsException catch (error) {
      debugPrint(
        'Vocabulary pronunciation assessment failed: ${error.code} ${error.message ?? ''}',
      );
      return null;
    } catch (error) {
      debugPrint('Vocabulary pronunciation assessment failed: $error');
      return null;
    } finally {
      if (recording != null && await recording.exists()) {
        await recording.delete().catchError((_) => recording!);
      }
    }
  }

  static VocabPronunciationResult? _parseResult(Map<String, dynamic> data) {
    final overall = data['overall'];
    if (overall is! Map) return null;
    final scores = Map<String, dynamic>.from(overall);
    final score = (scores['pronunciation'] ?? scores['accuracy']) as num?;
    if (score == null) return null;
    final rawWords = data['words'];
    final words = rawWords is List
        ? rawWords
            .whereType<Map>()
            .map((raw) {
              final word = Map<String, dynamic>.from(raw);
              return VocabPronunciationWordScore(
                word: '${word['word'] ?? ''}'.trim(),
                accuracy: ((word['accuracy'] as num?) ?? 0).toDouble(),
                errorType: '${word['errorType'] ?? ''}'.trim(),
              );
            })
            .where((word) => word.word.isNotEmpty)
            .toList(growable: false)
        : const <VocabPronunciationWordScore>[];
    return VocabPronunciationResult(
      score: score.toDouble(),
      recognizedText: '${data['recognizedText'] ?? ''}'.trim(),
      words: words,
    );
  }

  @override
  Future<void> cancel() async {
    try {
      await _recorder.cancel();
    } catch (_) {
      // Cancellation is best-effort while leaving the review screen.
    }
    final path = _recordingPath;
    _recordingPath = null;
    if (path != null) {
      final file = File(path);
      if (await file.exists()) await file.delete();
    }
  }

  @override
  Future<void> dispose() async {
    await cancel();
    await _recorder.dispose();
  }
}
