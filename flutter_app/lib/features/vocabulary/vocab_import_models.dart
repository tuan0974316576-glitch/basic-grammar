import 'vocab_models.dart';

enum VocabImportSource { files, camera, gallery }

enum VocabImportStage {
  secureUpload,
  documentOcr,
  aiAnalysis,
  cloudVocabBank,
  saveToVocab,
}

class VocabImportProgress {
  const VocabImportProgress({
    required this.stage,
    required this.progress,
    required this.detail,
  });

  final VocabImportStage stage;
  final double progress;
  final String detail;
}

class VocabImportFile {
  const VocabImportFile({
    required this.name,
    required this.path,
    required this.size,
    required this.mimeType,
  });

  final String name;
  final String path;
  final int size;
  final String mimeType;
}

class VocabImportedEntry {
  const VocabImportedEntry({
    required this.word,
    required this.display,
    required this.senses,
  });

  factory VocabImportedEntry.fromJson(Map<String, dynamic> json) {
    final word = normalizeVocabWord('${json['word'] ?? json['display'] ?? ''}');
    final display =
        displayVocabWord('${json['display'] ?? json['word'] ?? ''}');
    final rawMeanings =
        json['meanings'] is List ? json['meanings'] as List : <dynamic>[json];
    final senses = rawMeanings
        .whereType<Map>()
        .map((raw) {
          final data = Map<String, dynamic>.from(raw);
          final meaning = normalizeVocabMeaning('${data['meaning'] ?? ''}');
          final pos = '${data['pos'] ?? ''}'.trim().toLowerCase();
          final type = '${data['type'] ?? 'word'}'.trim().toLowerCase();
          if (meaning.isEmpty || pos.isEmpty) return null;
          final sourceEntryId = '${data['sourceEntryId'] ?? ''}'.trim();
          return VocabSense(
            id: sourceEntryId.isNotEmpty
                ? 'import-$sourceEntryId'
                : 'import-$word-$pos-${normalizeMeaningKey(meaning)}',
            word: word,
            display: display.isEmpty ? word : display,
            meaning: meaning,
            pos: pos,
            type: type.isEmpty ? 'word' : type,
            level: '${data['level'] ?? ''}'.trim().toUpperCase(),
            source: '${data['source'] ?? 'uploaded-note'}'.trim(),
            sourceEntryId: sourceEntryId,
          );
        })
        .whereType<VocabSense>()
        .toList(growable: false);
    return VocabImportedEntry(
      word: word,
      display: display.isEmpty ? word : display,
      senses: senses,
    );
  }

  final String word;
  final String display;
  final List<VocabSense> senses;
}

class VocabImportPayload {
  const VocabImportPayload({
    required this.detectedCount,
    required this.entries,
  });

  final int detectedCount;
  final List<VocabImportedEntry> entries;
}

class VocabImportSaveResult {
  const VocabImportSaveResult({
    required this.detectedCount,
    required this.addedCount,
    required this.duplicateCount,
    required this.saved,
  });

  final int detectedCount;
  final int addedCount;
  final int duplicateCount;
  final bool saved;
}

class VocabImportException implements Exception {
  const VocabImportException(this.message);

  final String message;

  @override
  String toString() => message;
}
