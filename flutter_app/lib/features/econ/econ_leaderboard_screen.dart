import 'dart:async';

import 'package:flutter/material.dart';

import '../../core/app_palette.dart';
import '../../core/app_sfx.dart';
import '../../core/widgets/original_section_frame.dart';
import '../../core/widgets/stationery_frame.dart';
import 'econ_cloud_repository.dart';
import 'econ_palette.dart';

class EconLeaderboardScreen extends StatefulWidget {
  const EconLeaderboardScreen({
    this.repository,
    this.onClose,
    this.onSettings,
    this.settingsActive = false,
    super.key,
  });

  final EconCloudRepository? repository;
  final VoidCallback? onClose;
  final VoidCallback? onSettings;
  final bool settingsActive;

  @override
  State<EconLeaderboardScreen> createState() => _EconLeaderboardScreenState();
}

class _EconLeaderboardScreenState extends State<EconLeaderboardScreen> {
  late final EconCloudRepository _repository;
  EconLeaderboardData? _data;
  Object? _error;
  bool _loading = true;
  bool _p2 = false;

  String get _errorText {
    final error = _error;
    if (error is StateError) return error.message;
    final text = '$error';
    if (text.contains('unauthenticated') || text.contains('UNAUTHENTICATED')) {
      return '請先登入 A1 BUDDY，才可以查看 ECON 排名。';
    }
    if (text.contains('permission-denied') ||
        text.contains('PERMISSION_DENIED')) {
      return '目前帳戶未有權限查看排名。';
    }
    return '暫時未能載入排名，請檢查網絡後再試。';
  }

  @override
  void initState() {
    super.initState();
    _repository = widget.repository ?? EconCloudRepository();
    unawaited(_load());
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await _repository.loadLeaderboard();
      if (!mounted) return;
      setState(() {
        _data = data;
        _loading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = error;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final rows = _p2 ? (_data?.p2 ?? const []) : (_data?.p1 ?? const []);
    return Scaffold(
      backgroundColor: AppPalette.background,
      body: OriginalSectionFrame(
        sectionKey: const Key('econ-leaderboard-frame'),
        eyebrow: 'ECON',
        title: '排名',
        onSettings: widget.onSettings,
        settingsActive: widget.settingsActive,
        settingsKey: const Key('econ-leaderboard-settings'),
        accentColor: EconPalette.primary,
        accentDarkColor: EconPalette.primaryDark,
        accentSoftColor: EconPalette.softPrimary,
        accentShadowColor: const Color(0xFFFFE7A3),
        trailing: IconButton(
          tooltip: '重新載入',
          onPressed: _loading ? null : _load,
          icon: const Icon(Icons.refresh_rounded),
          color: EconPalette.primaryDark,
        ),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: _PaperToggle(
                    label: 'Paper 1',
                    selected: !_p2,
                    onTap: () {
                      AppSfx.instance.play(SfxCue.click);
                      setState(() => _p2 = false);
                    },
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _PaperToggle(
                    label: 'Paper 2',
                    selected: _p2,
                    onTap: () {
                      AppSfx.instance.play(SfxCue.click);
                      setState(() => _p2 = true);
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            if (_loading)
              const Expanded(
                child: Center(
                  child:
                      CircularProgressIndicator(color: EconPalette.primaryDark),
                ),
              )
            else if (_error != null)
              Expanded(
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.cloud_off_rounded,
                          color: AppPalette.dangerDark, size: 42),
                      const SizedBox(height: 10),
                      Text(_errorText,
                          style: const TextStyle(
                              color: AppPalette.dangerDark,
                              fontWeight: FontWeight.w900)),
                      const SizedBox(height: 12),
                      FilledButton.icon(
                          onPressed: _load,
                          icon: const Icon(Icons.refresh_rounded),
                          label: const Text('再試一次')),
                    ],
                  ),
                ),
              )
            else if (rows.isEmpty)
              const Expanded(
                child: Center(
                  child: Text(
                    '完成 ECON 題目後就會出現排名。',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        color: AppPalette.muted, fontWeight: FontWeight.w800),
                  ),
                ),
              )
            else
              Expanded(
                child: ListView.separated(
                  key: const Key('econ-leaderboard-list'),
                  physics: const BouncingScrollPhysics(),
                  itemCount: rows.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 9),
                  itemBuilder: (context, index) => _RankRow(row: rows[index]),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _PaperToggle extends StatelessWidget {
  const _PaperToggle(
      {required this.label, required this.selected, required this.onTap});

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 140),
        height: 42,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: selected ? EconPalette.softPrimary : Colors.white,
          border: Border.all(
              color: selected ? EconPalette.primaryDark : AppPalette.border,
              width: selected ? 2 : 1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(label,
            style: TextStyle(
                color: selected ? EconPalette.primaryDark : AppPalette.muted,
                fontWeight: FontWeight.w900)),
      ),
    );
  }
}

class _RankRow extends StatelessWidget {
  const _RankRow({required this.row});

  final EconLeaderboardRow row;

  @override
  Widget build(BuildContext context) {
    final podium = row.rank <= 3;
    final color = switch (row.rank) {
      1 => const Color(0xFFB57B00),
      2 => const Color(0xFF718096),
      3 => const Color(0xFFA75B32),
      _ => EconPalette.primaryDark,
    };
    return StationeryFrame(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      backgroundColor: podium ? EconPalette.pale : Colors.white,
      borderColor: podium ? EconPalette.primary : AppPalette.border,
      shadowColor: podium ? const Color(0xFFFFE7A3) : const Color(0xFFE8EEEE),
      radius: 16,
      ringWidth: 2,
      shadowDepth: 3,
      child: Row(
        children: [
          SizedBox(
            width: 40,
            child: Text(
              '${row.rank}',
              textAlign: TextAlign.center,
              style: TextStyle(
                  color: color,
                  fontSize: podium ? 22 : 17,
                  fontWeight: FontWeight.w900),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
              child: Text(row.displayName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                      color: AppPalette.ink,
                      fontSize: 16,
                      fontWeight: FontWeight.w900))),
          Text('${row.correctCount} 題',
              style: TextStyle(
                  color: color, fontSize: 14, fontWeight: FontWeight.w900)),
          const SizedBox(width: 8),
          Text('${row.accuracy}%',
              style: const TextStyle(
                  color: AppPalette.muted,
                  fontSize: 12,
                  fontWeight: FontWeight.w800)),
        ],
      ),
    );
  }
}
