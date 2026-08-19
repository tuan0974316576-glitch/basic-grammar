import 'package:audioplayers/audioplayers.dart';

enum SfxCue { start, step, click, correct, wrong, next, complete }

abstract interface class LessonSfx {
  Future<void> play(SfxCue cue);
}

class AppSfx implements LessonSfx {
  AppSfx._();

  static final AppSfx instance = AppSfx._();

  final AudioPlayer _player = AudioPlayer();

  @override
  Future<void> play(SfxCue cue) async {
    try {
      await _player.stop();
      await _player.play(
        AssetSource('audio/sfx/${cue.name}.wav'),
        volume: cue == SfxCue.wrong ? 0.9 : 1,
      );
    } catch (_) {
      // A sound failure must never interrupt a lesson.
    }
  }
}

class SilentLessonSfx implements LessonSfx {
  const SilentLessonSfx();

  @override
  Future<void> play(SfxCue cue) async {}
}
