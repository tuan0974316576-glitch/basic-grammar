import 'dart:async';
import 'dart:io';
import 'dart:math';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:file_picker/file_picker.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter/services.dart';

import '../../core/app_brand.dart';
import 'vocab_import_models.dart';

typedef VocabImportProgressCallback = void Function(VocabImportProgress value);

/// Optional source-aware picker used by the native upload-note UI. Keeping it
/// separate from [VocabImportRepository] means existing test/import adapters
/// can continue to provide the original file-browser contract.
abstract interface class VocabImportSourceRepository {
  Future<List<VocabImportFile>> pickFilesFrom(VocabImportSource source);
}

abstract interface class VocabImportRepository {
  Future<List<VocabImportFile>> pickFiles();

  Future<VocabImportPayload> processFiles(
    List<VocabImportFile> files, {
    required VocabImportProgressCallback onProgress,
  });
}

class FirebaseVocabImportRepository
    implements VocabImportRepository, VocabImportSourceRepository {
  FirebaseVocabImportRepository({
    FirebaseAuth? auth,
    FirebaseFirestore? firestore,
    FirebaseFunctions? functions,
    FirebaseStorage? storage,
  })  : _auth = auth ?? FirebaseAuth.instance,
        _firestore = firestore ?? FirebaseFirestore.instance,
        _functions =
            functions ?? FirebaseFunctions.instanceFor(region: 'asia-east2'),
        _storage = storage ?? FirebaseStorage.instance;

  static const maxFiles = 12;
  static const maxFileBytes = 25 * 1024 * 1024;
  static const maxTotalBytes = 50 * 1024 * 1024;

  static const _mimeByExtension = <String, String>{
    'pdf': 'application/pdf',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'tif': 'image/tiff',
    'tiff': 'image/tiff',
  };

  final FirebaseAuth _auth;
  final FirebaseFirestore _firestore;
  final FirebaseFunctions _functions;
  final FirebaseStorage _storage;
  final ImagePicker _imagePicker = ImagePicker();

  @override
  Future<List<VocabImportFile>> pickFiles() async {
    return pickFilesFrom(VocabImportSource.files);
  }

  @override
  Future<List<VocabImportFile>> pickFilesFrom(VocabImportSource source) async {
    if (_auth.currentUser == null) {
      throw const VocabImportException('請先登入學生帳戶，才可以上傳筆記。');
    }
    if (source == VocabImportSource.camera ||
        source == VocabImportSource.gallery) {
      return _pickImages(source);
    }
    final result = await FilePicker.platform.pickFiles(
      allowMultiple: true,
      type: FileType.custom,
      allowedExtensions: _mimeByExtension.keys.toList(growable: false),
      withData: false,
    );
    if (result == null) return const [];
    final files = result.files.map((file) {
      final extension =
          (file.extension ?? _extensionOf(file.name)).toLowerCase();
      final path = file.path ?? '';
      if (path.isEmpty) {
        throw const VocabImportException('暫時未能讀取這個檔案，請再選一次。');
      }
      return VocabImportFile(
        name: file.name,
        path: path,
        size: file.size,
        mimeType: _mimeByExtension[extension] ?? '',
      );
    }).toList(growable: false);
    validateFiles(files);
    return files;
  }

  Future<List<VocabImportFile>> _pickImages(VocabImportSource source) async {
    try {
      final images = source == VocabImportSource.camera
          ? [
              await _imagePicker.pickImage(
                source: ImageSource.camera,
                imageQuality: 92,
              ),
            ].whereType<XFile>().toList(growable: false)
          : await _imagePicker.pickMultiImage(
              imageQuality: 92,
              requestFullMetadata: false,
            );
      if (images.isEmpty) return const [];
      final files = <VocabImportFile>[];
      for (final image in images) {
        final path = image.path;
        if (path.isEmpty) {
          throw const VocabImportException('暫時未能讀取這張相片，請再試一次。');
        }
        // Captures are compressed by image_picker and are JPEG-compatible even
        // when the source asset was HEIC/HEIF on iOS. Label them consistently
        // so Storage metadata and the OCR function agree on the MIME type.
        final name =
            source == VocabImportSource.camera || image.name.trim().isEmpty
                ? 'note-photo.jpg'
                : image.name;
        final extension = _extensionOf(name).toLowerCase();
        final mimeType = _mimeByExtension[extension] ?? 'image/jpeg';
        final size = await File(path).length();
        files.add(VocabImportFile(
          name: name,
          path: path,
          size: size,
          mimeType: mimeType,
        ));
      }
      validateFiles(files);
      return files;
    } on VocabImportException {
      rethrow;
    } on PlatformException catch (error) {
      final message = error.code.toLowerCase().contains('permission')
          ? '未能使用相機或相簿，請在設定中允許 $appDisplayName 存取。'
          : '未能讀取相片，請再試一次。';
      throw VocabImportException(message);
    } catch (_) {
      throw const VocabImportException('未能讀取相片，請再試一次。');
    }
  }

  static void validateFiles(List<VocabImportFile> files) {
    if (files.isEmpty) {
      throw const VocabImportException('請選擇最少一個筆記檔案。');
    }
    if (files.length > maxFiles) {
      throw const VocabImportException('每次最多可以上傳 12 個檔案。');
    }
    var totalBytes = 0;
    for (final file in files) {
      if (!_mimeByExtension.containsValue(file.mimeType)) {
        throw const VocabImportException(
          '只支援 PDF、JPEG、PNG、WebP 或 TIFF。',
        );
      }
      if (file.size <= 0 || file.size > maxFileBytes) {
        throw const VocabImportException('每個檔案不可超過 25 MB。');
      }
      totalBytes += file.size;
    }
    if (totalBytes > maxTotalBytes) {
      throw const VocabImportException('全部檔案合共不可超過 50 MB。');
    }
  }

  @override
  Future<VocabImportPayload> processFiles(
    List<VocabImportFile> files, {
    required VocabImportProgressCallback onProgress,
  }) async {
    validateFiles(files);
    final user = _auth.currentUser;
    if (user == null) {
      throw const VocabImportException('請先登入學生帳戶，才可以上傳筆記。');
    }

    final jobId = _makeJobId();
    final uploaded = <Map<String, dynamic>>[];
    StreamSubscription<DocumentSnapshot<Map<String, dynamic>>>? jobListener;
    try {
      final totalBytes = files.fold<int>(0, (total, file) => total + file.size);
      var completedBytes = 0;
      for (var index = 0; index < files.length; index += 1) {
        final file = files[index];
        final storagePath =
            'vocab-imports/${user.uid}/$jobId/${_safeFileName(file.name, index)}';
        final task = _storage.ref(storagePath).putFile(
              File(file.path),
              SettableMetadata(contentType: file.mimeType),
            );
        final subscription = task.snapshotEvents.listen((snapshot) {
          final sent = completedBytes + snapshot.bytesTransferred;
          onProgress(VocabImportProgress(
            stage: VocabImportStage.secureUpload,
            progress: totalBytes == 0 ? 0 : sent / totalBytes,
            detail: '上傳筆記 ${index + 1} / ${files.length}',
          ));
        });
        try {
          await task;
        } finally {
          await subscription.cancel();
        }
        completedBytes += file.size;
        uploaded.add({
          'storagePath': storagePath,
          'mimeType': file.mimeType,
          'size': file.size,
          'originalName': file.name,
        });
      }

      final jobReference = _firestore
          .collection('users')
          .doc(user.uid)
          .collection('vocabImportJobs')
          .doc(jobId);
      jobListener = jobReference.snapshots().listen((snapshot) {
        final data = snapshot.data();
        if (data == null) return;
        final stage = _stageForIndex((data['stepIndex'] as num?)?.toInt() ?? 0);
        if (stage == null) return;
        onProgress(VocabImportProgress(
          stage: stage,
          progress: ((data['progress'] as num?)?.toDouble() ?? 0) / 100,
          detail: '${data['detail'] ?? '正在處理筆記'}',
        ));
      });

      onProgress(const VocabImportProgress(
        stage: VocabImportStage.documentOcr,
        progress: 0,
        detail: '準備掃描文件',
      ));
      final callable = _functions.httpsCallable(
        'processVocabImport',
        options: HttpsCallableOptions(timeout: const Duration(minutes: 9)),
      );
      final response = await callable.call<Map<String, dynamic>>({
        'jobId': jobId,
        'files': uploaded,
      });
      final payload = Map<String, dynamic>.from(response.data);
      final rawEntries = payload['entries'];
      final entries = rawEntries is List
          ? rawEntries
              .whereType<Map>()
              .map((entry) => VocabImportedEntry.fromJson(
                    Map<String, dynamic>.from(entry),
                  ))
              .where((entry) => entry.word.isNotEmpty)
              .toList(growable: false)
          : <VocabImportedEntry>[];
      return VocabImportPayload(
        detectedCount:
            (payload['detectedCount'] as num?)?.toInt() ?? entries.length,
        entries: entries,
      );
    } on VocabImportException {
      rethrow;
    } on FirebaseFunctionsException catch (error) {
      throw VocabImportException(_functionsMessage(error));
    } on FirebaseException catch (error) {
      if (error.code == 'unauthenticated' || error.code == 'unauthorized') {
        throw const VocabImportException('登入已過期，請重新登入後再試。');
      }
      throw const VocabImportException('上傳暫時失敗，請檢查網絡後再試。');
    } catch (_) {
      throw const VocabImportException('未能完成筆記分析，請稍後再試。');
    } finally {
      await jobListener?.cancel();
      await Future.wait(uploaded.map((item) async {
        try {
          await _storage.ref('${item['storagePath']}').delete();
        } catch (_) {}
      }));
      try {
        await _firestore
            .collection('users')
            .doc(user.uid)
            .collection('vocabImportJobs')
            .doc(jobId)
            .delete();
      } catch (_) {}
    }
  }

  static VocabImportStage? _stageForIndex(int index) {
    return switch (index) {
      1 => VocabImportStage.secureUpload,
      2 => VocabImportStage.documentOcr,
      3 => VocabImportStage.aiAnalysis,
      4 => VocabImportStage.cloudVocabBank,
      5 => VocabImportStage.saveToVocab,
      _ => null,
    };
  }

  static String _functionsMessage(FirebaseFunctionsException error) {
    return switch (error.code) {
      'unauthenticated' => '請先登入學生帳戶，才可以上傳筆記。',
      'invalid-argument' => '檔案格式或大小不合規格，請重新選擇。',
      'failed-precondition' => '筆記內未能辨認到已選取的英文詞彙。',
      'resource-exhausted' => '今次筆記內容太多，請分開幾次上傳。',
      _ => '未能完成筆記分析，請稍後再試。',
    };
  }

  static String _extensionOf(String name) {
    final index = name.lastIndexOf('.');
    return index < 0 ? '' : name.substring(index + 1);
  }

  static String _safeFileName(String name, int index) {
    final extension =
        _extensionOf(name).toLowerCase().replaceAll(RegExp('[^a-z0-9]'), '');
    final base = name
        .replaceFirst(RegExp(r'\.[^.]+$'), '')
        .replaceAll(RegExp('[^a-zA-Z0-9_-]+'), '-')
        .replaceAll(RegExp(r'^-+|-+$'), '');
    final safeBase =
        base.isEmpty ? 'document' : base.substring(0, min(48, base.length));
    final suffix = _token(8);
    return '${(index + 1).toString().padLeft(2, '0')}-$safeBase-$suffix'
        '${extension.isEmpty ? '' : '.$extension'}';
  }

  static String _makeJobId() {
    return 'import-${DateTime.now().millisecondsSinceEpoch.toRadixString(36)}-'
        '${_token(18)}';
  }

  static String _token(int length) {
    final random = Random.secure();
    return List.generate(length, (_) => random.nextInt(16).toRadixString(16))
        .join();
  }
}
