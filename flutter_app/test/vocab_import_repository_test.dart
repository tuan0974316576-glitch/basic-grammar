import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/vocabulary/vocab_import_models.dart';
import 'package:dope_english/features/vocabulary/vocab_import_repository.dart';

void main() {
  const pdf = VocabImportFile(
    name: 'notes.pdf',
    path: '/tmp/notes.pdf',
    size: 1024,
    mimeType: 'application/pdf',
  );

  test('accepts the advertised note file formats and size limits', () {
    FirebaseVocabImportRepository.validateFiles(const [
      pdf,
      VocabImportFile(
        name: 'page.webp',
        path: '/tmp/page.webp',
        size: 2048,
        mimeType: 'image/webp',
      ),
      VocabImportFile(
        name: 'scan.tiff',
        path: '/tmp/scan.tiff',
        size: FirebaseVocabImportRepository.maxFileBytes,
        mimeType: 'image/tiff',
      ),
    ]);
  });

  test('rejects unsupported, oversized, and excessive file selections', () {
    expect(
      () => FirebaseVocabImportRepository.validateFiles(const [
        VocabImportFile(
          name: 'notes.txt',
          path: '/tmp/notes.txt',
          size: 100,
          mimeType: 'text/plain',
        ),
      ]),
      throwsA(isA<VocabImportException>()),
    );
    expect(
      () => FirebaseVocabImportRepository.validateFiles(const [
        VocabImportFile(
          name: 'large.pdf',
          path: '/tmp/large.pdf',
          size: FirebaseVocabImportRepository.maxFileBytes + 1,
          mimeType: 'application/pdf',
        ),
      ]),
      throwsA(isA<VocabImportException>()),
    );
    expect(
      () => FirebaseVocabImportRepository.validateFiles(
        List<VocabImportFile>.filled(13, pdf),
      ),
      throwsA(isA<VocabImportException>()),
    );
  });

  test('rejects a selection over the 50 MB total limit', () {
    expect(
      () => FirebaseVocabImportRepository.validateFiles(const [
        VocabImportFile(
          name: 'one.pdf',
          path: '/tmp/one.pdf',
          size: FirebaseVocabImportRepository.maxFileBytes,
          mimeType: 'application/pdf',
        ),
        VocabImportFile(
          name: 'two.pdf',
          path: '/tmp/two.pdf',
          size: FirebaseVocabImportRepository.maxFileBytes,
          mimeType: 'application/pdf',
        ),
        VocabImportFile(
          name: 'three.pdf',
          path: '/tmp/three.pdf',
          size: 1,
          mimeType: 'application/pdf',
        ),
      ]),
      throwsA(isA<VocabImportException>()),
    );
  });
}
