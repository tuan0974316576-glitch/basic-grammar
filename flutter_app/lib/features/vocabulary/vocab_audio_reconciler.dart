import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/widgets.dart';

import 'vocab_audio_repository.dart';
import 'vocab_models.dart';

typedef VocabItemsProvider = List<VocabItem> Function();
typedef VocabExamplesProvider = Future<List<VocabExampleSection>> Function(
  VocabItem item,
);

class VocabAudioReconcileResult {
  const VocabAudioReconcileResult({
    required this.complete,
    this.words = 0,
    this.examples = 0,
    this.skipped = false,
    this.reason = '',
  });

  final bool complete;
  final int words;
  final int examples;
  final bool skipped;
  final String reason;
}

/// Background audio warmer modelled after Battleship's saved-vocab
/// reconciliation from commit 86eede3d.
///
/// It never plays audio. Existing bundled/downloaded files are skipped, words
/// are filled before example sentences, and a paused run resumes from the
/// beginning safely because every item is idempotently checked by hasAudio.
class VocabAudioReconciler with WidgetsBindingObserver {
  VocabAudioReconciler({
    required this.audio,
    required this.items,
    required this.examples,
    this.changes,
    Connectivity? connectivity,
    this.initialDelay = const Duration(milliseconds: 700),
    this.resumeDelay = const Duration(milliseconds: 250),
    this.retryDelay = const Duration(minutes: 31),
    bool Function()? authenticated,
  })  : _connectivity = connectivity,
        _authenticated = authenticated ?? (() => true);

  final VocabAudioRepository audio;
  final VocabItemsProvider items;
  final VocabExamplesProvider examples;
  final Listenable? changes;
  final Connectivity? _connectivity;
  final Duration initialDelay;
  final Duration resumeDelay;
  final Duration retryDelay;
  final bool Function() _authenticated;

  StreamSubscription<List<ConnectivityResult>>? _connectivitySubscription;
  Timer? _scheduledTimer;
  Future<VocabAudioReconcileResult>? _running;
  bool _started = false;
  bool _active = true;
  bool _online = true;
  bool _pending = false;
  String _lastSignature = '';
  String _completeSignature = '';

  bool get isRunning => _running != null;
  bool get isOnline => _online;
  bool get isActive => _active;

  void start() {
    if (_started) return;
    _started = true;
    WidgetsBinding.instance.addObserver(this);
    changes?.addListener(_onItemsChanged);
    final connectivity = _connectivity;
    if (connectivity != null) {
      _connectivitySubscription = connectivity.onConnectivityChanged.listen(
        _onConnectivityChanged,
        onError: (Object error, StackTrace stack) {
          debugPrint('Vocabulary connectivity listener failed: $error');
        },
      );
      unawaited(_readInitialConnectivity(connectivity));
    }
    schedule(delay: initialDelay);
  }

  Future<void> _readInitialConnectivity(Connectivity connectivity) async {
    try {
      _onConnectivityChanged(await connectivity.checkConnectivity());
    } catch (error) {
      debugPrint('Vocabulary connectivity check failed: $error');
    }
  }

  void _onItemsChanged() {
    if (!_started) return;
    _pending = true;
    schedule(delay: resumeDelay);
  }

  void _onConnectivityChanged(List<ConnectivityResult> result) {
    final online = result.any((entry) => entry != ConnectivityResult.none);
    final cameOnline = !_online && online;
    _online = online;
    if (online && cameOnline) schedule(delay: resumeDelay);
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    _active = state == AppLifecycleState.resumed;
    if (_active) {
      schedule(delay: resumeDelay);
    } else {
      _scheduledTimer?.cancel();
      _scheduledTimer = null;
    }
  }

  void schedule({Duration? delay}) {
    if (!_started) return;
    _scheduledTimer?.cancel();
    if (_running != null) {
      _pending = true;
      return;
    }
    final wait = delay ?? resumeDelay;
    _scheduledTimer = Timer(wait, () {
      _scheduledTimer = null;
      unawaited(_runScheduled());
    });
  }

  Future<VocabAudioReconcileResult> _runScheduled() async {
    if (!_canRun()) {
      _pending = true;
      return const VocabAudioReconcileResult(
        complete: false,
        reason: 'runtime-paused',
      );
    }
    final sourceItems = List<VocabItem>.from(items());
    final signature = _signature(sourceItems);
    if (signature == _completeSignature && signature.isNotEmpty) {
      return const VocabAudioReconcileResult(
        complete: true,
        skipped: true,
        reason: 'already-reconciled',
      );
    }
    return reconcileNow(items: sourceItems);
  }

  /// Runs one deterministic pass immediately. Intended for tests and for the
  /// auth/cloud-restore completion hook.
  Future<VocabAudioReconcileResult> reconcileNow({
    List<VocabItem>? items,
    bool force = false,
  }) {
    if (_running != null) {
      _pending = true;
      return _running!;
    }
    final sourceItems = List<VocabItem>.from(items ?? this.items());
    final signature = _signature(sourceItems);
    if (!force && signature == _completeSignature && signature.isNotEmpty) {
      return Future.value(const VocabAudioReconcileResult(
        complete: true,
        skipped: true,
        reason: 'already-reconciled',
      ));
    }
    _lastSignature = signature;
    _running = _runPass(sourceItems).then((result) {
      if (result.complete) {
        _completeSignature = signature;
      }
      return result;
    }).whenComplete(() {
      _running = null;
      final changed = _pending || _signature(this.items()) != _lastSignature;
      _pending = false;
      if (changed) {
        schedule(delay: resumeDelay);
      } else if (!_lastResultComplete) {
        schedule(delay: retryDelay);
      }
    });
    return _running!;
  }

  bool _lastResultComplete = true;

  Future<VocabAudioReconcileResult> _runPass(
      List<VocabItem> sourceItems) async {
    if (sourceItems.isEmpty) {
      _lastResultComplete = true;
      return const VocabAudioReconcileResult(complete: true);
    }
    if (!_canRun()) {
      _lastResultComplete = false;
      return const VocabAudioReconcileResult(
        complete: false,
        reason: 'runtime-paused',
      );
    }
    if (!_authenticated()) {
      _lastResultComplete = false;
      return const VocabAudioReconcileResult(
        complete: false,
        reason: 'login-required',
      );
    }

    var words = 0;
    var exampleCount = 0;
    for (final item in sourceItems) {
      if (!_canRun()) {
        _lastResultComplete = false;
        return VocabAudioReconcileResult(
          complete: false,
          words: words,
          examples: exampleCount,
          reason: 'runtime-paused',
        );
      }
      if (!await audio.hasAudio(item.word)) {
        final wordResult = await audio.ensureAudio(item.word);
        if (!wordResult.ready) {
          _lastResultComplete = false;
          return VocabAudioReconcileResult(
            complete: false,
            words: words,
            examples: exampleCount,
            reason: wordResult.reason.isEmpty
                ? 'word-audio-failed'
                : wordResult.reason,
          );
        }
      }
      words += 1;
      await Future<void>.delayed(const Duration(milliseconds: 35));
    }

    for (final item in sourceItems) {
      if (!_canRun()) {
        _lastResultComplete = false;
        return VocabAudioReconcileResult(
          complete: false,
          words: words,
          examples: exampleCount,
          reason: 'runtime-paused',
        );
      }
      final sections = await examples(item);
      for (final section in sections) {
        for (final example in section.examples) {
          if (!_canRun()) {
            _lastResultComplete = false;
            return VocabAudioReconcileResult(
              complete: false,
              words: words,
              examples: exampleCount,
              reason: 'runtime-paused',
            );
          }
          if (!await audio.hasAudio(
            example.english,
            kind: VocabAudioKind.example,
          )) {
            final exampleResult = await audio.ensureAudio(
              example.english,
              kind: VocabAudioKind.example,
            );
            if (!exampleResult.ready) {
              _lastResultComplete = false;
              return VocabAudioReconcileResult(
                complete: false,
                words: words,
                examples: exampleCount,
                reason: exampleResult.reason.isEmpty
                    ? 'example-audio-failed'
                    : exampleResult.reason,
              );
            }
          }
          exampleCount += 1;
          await Future<void>.delayed(const Duration(milliseconds: 35));
        }
      }
    }
    _lastResultComplete = true;
    return VocabAudioReconcileResult(
      complete: true,
      words: words,
      examples: exampleCount,
    );
  }

  bool _canRun() => _started && _active && _online && _authenticated();

  String _signature(List<VocabItem> sourceItems) {
    final rows = sourceItems
        .map((item) => [
              item.normalizedWord,
              item.updatedAt.millisecondsSinceEpoch,
              for (final sense in item.senses)
                '${sense.pos}:${sense.type}:${sense.meaning}',
            ].join('|'))
        .join('::');
    return rows;
  }

  Future<void> dispose() async {
    _scheduledTimer?.cancel();
    _scheduledTimer = null;
    await _connectivitySubscription?.cancel();
    _connectivitySubscription = null;
    changes?.removeListener(_onItemsChanged);
    if (_started) WidgetsBinding.instance.removeObserver(this);
    _started = false;
  }
}
