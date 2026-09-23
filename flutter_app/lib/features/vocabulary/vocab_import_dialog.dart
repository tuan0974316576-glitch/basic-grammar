import 'dart:async';

import 'package:flutter/material.dart';

import '../../core/app_palette.dart';
import '../../core/app_sfx.dart';
import '../../core/widgets/stationery_frame.dart';
import 'vocab_controller.dart';
import 'vocab_import_models.dart';
import 'vocab_import_repository.dart';

class VocabImportDialog extends StatefulWidget {
  const VocabImportDialog({
    required this.files,
    required this.repository,
    required this.controller,
    super.key,
  });

  final List<VocabImportFile> files;
  final VocabImportRepository repository;
  final VocabController controller;

  @override
  State<VocabImportDialog> createState() => _VocabImportDialogState();
}

class _VocabImportDialogState extends State<VocabImportDialog> {
  VocabImportStage _stage = VocabImportStage.secureUpload;
  double _progress = 0;
  String _detail = '準備安全上傳';
  bool _processing = true;
  String? _error;
  VocabImportSaveResult? _result;

  @override
  void initState() {
    super.initState();
    unawaited(_run());
  }

  Future<void> _run() async {
    setState(() {
      _stage = VocabImportStage.secureUpload;
      _progress = 0;
      _detail = '準備安全上傳';
      _processing = true;
      _error = null;
      _result = null;
    });
    try {
      final payload = await widget.repository.processFiles(
        widget.files,
        onProgress: _setProgress,
      );
      _setProgress(const VocabImportProgress(
        stage: VocabImportStage.saveToVocab,
        progress: 0.2,
        detail: '一次過寫入詞彙本',
      ));
      final result = await widget.controller.bulkUpsertImported(
        payload.entries,
        detectedCount: payload.detectedCount,
      );
      if (!result.saved) {
        throw const VocabImportException('暫時未能儲存詞彙，請再試一次。');
      }
      if (!mounted) return;
      setState(() {
        _stage = VocabImportStage.saveToVocab;
        _progress = 1;
        _detail = '詞彙本已更新';
        _processing = false;
        _result = result;
      });
      unawaited(AppSfx.instance.play(SfxCue.correct));
    } on VocabImportException catch (error) {
      _showError(error.message);
    } catch (_) {
      _showError('未能完成筆記匯入，請稍後再試。');
    }
  }

  void _setProgress(VocabImportProgress value) {
    if (!mounted || !_processing || value.stage.index < _stage.index) return;
    setState(() {
      if (value.stage != _stage) {
        _stage = value.stage;
        _progress = value.progress.clamp(0, 1);
      } else {
        _progress = value.progress.clamp(_progress, 1);
      }
      _detail = value.detail;
    });
  }

  void _showError(String message) {
    if (!mounted) return;
    setState(() {
      _processing = false;
      _error = message;
    });
    unawaited(AppSfx.instance.play(SfxCue.wrong));
  }

  @override
  Widget build(BuildContext context) {
    final overall = _result != null
        ? 1.0
        : ((_stage.index + _progress) / VocabImportStage.values.length)
            .clamp(0.0, 0.99);
    return PopScope(
      canPop: !_processing,
      child: Dialog(
        insetPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 20),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        backgroundColor: Colors.transparent,
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 500),
          child: OriginalDashedSurface(
            backgroundColor: const Color(0xFFFFFEFA),
            borderColor: AppPalette.primary,
            shadowColor: const Color(0xFF9ECFD0),
            shadowDepth: 6,
            strokeWidth: 3,
            radius: 8,
            padding: const EdgeInsets.fromLTRB(16, 15, 16, 16),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      const Expanded(
                        child: Text(
                          '上傳筆記',
                          style: TextStyle(
                            color: AppPalette.primaryDark,
                            fontSize: 21,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                      IconButton(
                        key: const Key('vocab-import-close-button'),
                        tooltip: '關閉',
                        onPressed: _processing
                            ? null
                            : () => Navigator.of(context).pop(),
                        icon: const Icon(Icons.close_rounded),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(3),
                    child: LinearProgressIndicator(
                      key: const Key('vocab-import-progress'),
                      value: overall,
                      minHeight: 8,
                      color: AppPalette.primary,
                      backgroundColor: AppPalette.softPrimary,
                    ),
                  ),
                  const SizedBox(height: 14),
                  ...VocabImportStage.values.map((stage) => _ImportStepRow(
                        stage: stage,
                        currentStage: _stage,
                        finished: _result != null,
                      )),
                  const SizedBox(height: 10),
                  OriginalDashedSurface(
                    backgroundColor: _error == null
                        ? AppPalette.softSecondary
                        : const Color(0xFFFFE9E6),
                    borderColor: _error == null
                        ? AppPalette.secondaryDark
                        : AppPalette.danger,
                    strokeWidth: 2,
                    radius: 7,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 10,
                    ),
                    child: Text(
                      _error ?? _detail,
                      key: const Key('vocab-import-status'),
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: _error == null
                            ? const Color(0xFF5D4037)
                            : AppPalette.dangerDark,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                  if (_result case final result?) ...[
                    const SizedBox(height: 12),
                    Row(
                      key: const Key('vocab-import-result-row'),
                      children: [
                        Expanded(
                          child: _ImportResultStat(
                            label: '辨認詞彙',
                            value: result.detectedCount,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: _ImportResultStat(
                            label: '新增詞彙',
                            value: result.addedCount,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: _ImportResultStat(
                            label: '合併重複',
                            value: result.duplicateCount,
                          ),
                        ),
                      ],
                    ),
                  ],
                  if (_error != null) ...[
                    const SizedBox(height: 12),
                    FilledButton.icon(
                      key: const Key('vocab-import-retry-button'),
                      onPressed: _run,
                      icon: const Icon(Icons.refresh_rounded),
                      label: const Text('再試一次'),
                      style: FilledButton.styleFrom(
                        backgroundColor: AppPalette.secondary,
                        foregroundColor: const Color(0xFF5D4037),
                        minimumSize: const Size.fromHeight(48),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(7),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ImportStepRow extends StatelessWidget {
  const _ImportStepRow({
    required this.stage,
    required this.currentStage,
    required this.finished,
  });

  final VocabImportStage stage;
  final VocabImportStage currentStage;
  final bool finished;

  static const _labels = <VocabImportStage, String>{
    VocabImportStage.secureUpload: '安全上傳',
    VocabImportStage.documentOcr: '文件 OCR',
    VocabImportStage.aiAnalysis: 'AI 詞彙分析',
    VocabImportStage.cloudVocabBank: '雲端詞彙庫',
    VocabImportStage.saveToVocab: '儲存到詞彙本',
  };

  @override
  Widget build(BuildContext context) {
    final complete = finished || stage.index < currentStage.index;
    final active = !finished && stage == currentStage;
    final color = complete || active ? AppPalette.primary : AppPalette.border;
    return SizedBox(
      height: 36,
      child: Row(
        children: [
          Container(
            width: 24,
            height: 24,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: complete
                  ? AppPalette.primary
                  : active
                      ? AppPalette.softPrimary
                      : Colors.white,
              shape: BoxShape.circle,
              border: Border.all(color: color, width: 2),
            ),
            child: complete
                ? const Icon(Icons.check_rounded, size: 16, color: Colors.white)
                : active
                    ? const SizedBox(
                        width: 12,
                        height: 12,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: AppPalette.primary,
                        ),
                      )
                    : null,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              _labels[stage]!,
              style: TextStyle(
                color: active || complete
                    ? AppPalette.primaryDark
                    : AppPalette.muted,
                fontSize: 14,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ImportResultStat extends StatelessWidget {
  const _ImportResultStat({required this.label, required this.value});

  final String label;
  final int value;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 64,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(7),
        border: Border.all(color: AppPalette.border, width: 2),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            '$value',
            style: const TextStyle(
              color: AppPalette.primaryDark,
              fontSize: 22,
              height: 1,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppPalette.muted,
              fontSize: 11,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}
