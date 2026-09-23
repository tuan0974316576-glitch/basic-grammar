import 'dart:math' as math;

import 'package:dicebear_core/dicebear_core.dart' as dicebear;
import 'package:dicebear_styles/critters.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

final dicebear.Style _critterStyle = dicebear.Style.parse(critters);

/// The Critters style exposes these component variants. Keeping the option
/// names in one place lets the setup screen offer the complete visual editor
/// while the compact avatar in the app uses the exact same renderer.
const critterTopOptions = <String, String>{
  'none': '無頭飾',
  'horns': '角',
  'hornsIn': '內彎角',
  'hornsSmall': '小角',
  'spike': '尖刺',
  'antenna': '天線',
  'antennae': '雙天線',
  'earsRound': '圓耳',
  'earsPointy': '尖耳',
  'earsDroop': '垂耳',
  'spikes': '刺刺',
  'fin': '魚鰭',
  'crown': '皇冠',
  'sprout': '嫩芽',
  'nub': '小凸角',
  'bobble': '波波',
};

const critterBodyOptions = <String, String>{
  'dome': '圓頂',
  'block': '方方',
  'tower': '高塔',
  'chimney': '煙囪',
  'squat': '矮矮',
  'blob': '軟泥',
  'round': '圓圓',
  'tilt': '歪歪',
  'lean': '斜斜',
  'peak': '山峰',
  'bell': '鈴鐺',
  'wedge': '楔形',
  'wedgeInv': '倒楔形',
  'steps': '階梯',
};

const critterPatternOptions = <String, String>{
  'none': '無花紋',
  'belly': '肚兜',
  'dots': '圓點',
  'speckles': '斑點',
  'bar': '橫線',
  'bars': '多橫線',
  'spot': '大斑',
  'stripes': '直紋',
  'dotRow': '點點排',
  'chevron': '人字紋',
  'ring': '圓環',
};

const critterCheekOptions = <String, String>{
  'none': '無面頰',
  'blush': '小紅面',
  'blushBig': '大紅面',
  'freckles': '雀斑',
};

const critterEyeOptions = <String, String>{
  'round': '圓眼',
  'dots': '豆豆眼',
  'bigPupils': '大瞳孔',
  'sideeye': '側目',
  'inward': '內望',
  'mono': '單眼',
  'uneven': '一高一低',
  'trio': '三眼',
  'threeRow': '三排眼',
  'four': '四眼',
  'happy': '開心眼',
  'closedLine': '瞇瞇眼',
  'wink': '眨眼',
  'squint': '半瞇眼',
  'wide': '大眼',
  'sleepy': '睡眼',
  'angry': '怒眼',
  'monoSleepy': '單眼睡眼',
  'close': '近眼',
};

const critterMouthOptions = <String, String>{
  'smile': '微笑',
  'tinySmile': '小笑',
  'grin': '咧嘴笑',
  'laugh': '大笑',
  'teeth': '露齒笑',
  'ooh': 'O 嘴',
  'line': '直線嘴',
  'smirk': '壞笑',
  'wavy': '波浪嘴',
  'catMouth': '貓嘴',
  'zigzag': '鋸齒嘴',
  'frown': '皺眉嘴',
  'sad': '傷心嘴',
  'slant': '斜嘴',
  'dot': '點點嘴',
  'open': '張嘴',
  'tooth': '一隻牙',
  'tongue': '吐舌',
  'blep': '小吐舌',
};

const critterBodyColors = <String, String>{
  '2f80ed': '晴天藍',
  '58c985': '薄荷綠',
  'f08a5d': '活力橙',
  'e85d9e': '莓果粉',
  '8b83e8': '薰衣草',
  '6b7280': '石墨灰',
  'f2c94c': '檸檬黃',
  '9b6b43': '可可啡',
};

const critterAccentColors = <String, String>{
  'ffb703': '陽光黃',
  'f783ac': '櫻花粉',
  '4ecdc4': '湖水青',
  '8b83e8': '紫晶',
  'ef476f': '西瓜紅',
  '2f80ed': '海藍',
  '58d868': '草地綠',
  'ffffff': '白色',
};

const critterInkColors = <String, String>{
  '2d2521': '咖啡黑',
  '263238': '深藍黑',
  '5b2c6f': '葡萄紫',
  '8d5524': '暖啡色',
  'ffffff': '雪白',
};

String buildCritterAvatarSvg({
  required String seed,
  required String background,
  Map<String, String> options = const <String, String>{},
}) {
  final avatarOptions = <String, Object?>{
    'seed': seed,
    'size': 256,
    'backgroundColor': background,
    'animationProbability': 100,
    'animationVariant': options['animation'] ?? 'fastest',
  };
  final variantComponents = <String>{
    'top',
    'body',
    'pattern',
    'cheeks',
    'eyes',
    'mouth',
    'animation',
  };
  for (final entry in options.entries) {
    if (variantComponents.contains(entry.key)) {
      avatarOptions['${entry.key}Variant'] = entry.value;
    }
  }
  for (final component in const ['top', 'pattern', 'cheeks']) {
    final selected = options[component];
    if (selected == 'none') {
      avatarOptions['${component}Probability'] = 0;
      avatarOptions.remove('${component}Variant');
    } else if (selected != null) {
      avatarOptions['${component}Probability'] = 100;
    }
  }
  for (final color in const ['body', 'accent', 'ink']) {
    final selected = options['${color}Color'];
    if (selected != null) avatarOptions['${color}Color'] = selected;
  }
  return dicebear.Avatar(_critterStyle, {
    ...avatarOptions,
  })
      .svg
      .replaceFirst(RegExp(r'<metadata[\s\S]*?</metadata>'), '')
      // Flutter drives bob/blink below; flutter_svg cannot execute DiceBear's
      // embedded CSS keyframes and would otherwise report an unsupported node.
      .replaceFirst(RegExp(r'<style[\s\S]*?</style>'), '');
}

class _CritterSvgLayers {
  const _CritterSvgLayers({required this.body, required this.eyes});

  final String body;
  final String eyes;
}

_CritterSvgLayers _splitCritterSvg(String svg) {
  final groupStart = svg.indexOf('<g class="dbcr-c">');
  if (groupStart < 0) return _CritterSvgLayers(body: svg, eyes: svg);
  final groupEnd = svg.indexOf('</g>', groupStart);
  if (groupEnd < 0) return _CritterSvgLayers(body: svg, eyes: svg);
  final groupClose = groupEnd + '</g>'.length;
  final group = svg.substring(groupStart, groupClose);
  final uses = RegExp(r'<use\b[^>]*/>').allMatches(group).map((match) {
    return match.group(0)!;
  }).toList(growable: false);
  final bodyUses = uses.where((use) => !use.contains('href="#eyes-"'));
  final eyeUses = uses.where((use) => use.contains('href="#eyes-"'));

  String makeLayer(Iterable<String> selectedUses) {
    var layer = svg.replaceRange(
      groupStart,
      groupClose,
      '<g class="dbcr-c">${selectedUses.join()} </g>',
    );
    final defsEnd = layer.indexOf('</defs>');
    if (defsEnd >= 0) {
      final start = defsEnd + '</defs>'.length;
      final before = layer.substring(0, start);
      final after = layer.substring(start).replaceFirst(
            RegExp(r'<rect\b[^>]*/>'),
            '',
          );
      layer = '$before$after';
    }
    return layer;
  }

  return _CritterSvgLayers(
    body: makeLayer(bodyUses),
    eyes: makeLayer(eyeUses),
  );
}

bool get _animateCritter => !WidgetsBinding.instance.runtimeType
    .toString()
    .contains('TestWidgetsFlutterBinding');

class CritterAvatar extends StatefulWidget {
  const CritterAvatar({
    required this.seed,
    required this.background,
    this.size = 96,
    this.options = const <String, String>{},
    this.animate = true,
    this.borderColor,
    this.borderWidth = 0,
    super.key,
  });

  final String seed;
  final String background;
  final double size;
  final Map<String, String> options;
  final bool animate;
  final Color? borderColor;
  final double borderWidth;

  @override
  State<CritterAvatar> createState() => _CritterAvatarState();
}

class _CritterAvatarState extends State<CritterAvatar>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late _CritterSvgLayers _layers;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2550),
    );
    _layers = _buildLayers();
    if (_animateCritter && widget.animate) _controller.repeat();
  }

  _CritterSvgLayers _buildLayers() => _splitCritterSvg(
        buildCritterAvatarSvg(
          seed: widget.seed,
          background: widget.background,
          options: widget.options,
        ),
      );

  @override
  void didUpdateWidget(covariant CritterAvatar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.seed != widget.seed ||
        oldWidget.background != widget.background ||
        oldWidget.options != widget.options) {
      _layers = _buildLayers();
    }
    if (oldWidget.animate != widget.animate) {
      if (_animateCritter && widget.animate) {
        _controller.repeat();
      } else {
        _controller.stop();
        _controller.value = 0;
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    SvgPicture bodyPicture() => SvgPicture.string(
          _layers.body,
          fit: BoxFit.cover,
          semanticsLabel: 'Critter avatar',
        );
    SvgPicture eyesPicture() => SvgPicture.string(
          _layers.eyes,
          fit: BoxFit.cover,
          excludeFromSemantics: true,
        );
    final animatedImage = widget.animate
        ? AnimatedBuilder(
            animation: _controller,
            builder: (context, _) {
              final phase = _controller.value;
              final bob = math.sin(phase * math.pi * 2) * 2.2;
              final blinkWindow = ((phase - 0.92) / 0.08).clamp(0.0, 1.0);
              final blink = blinkWindow <= 0
                  ? 1.0
                  : 1.0 - math.sin(blinkWindow * math.pi) * 0.84;
              return Stack(
                fit: StackFit.expand,
                children: [
                  Transform.translate(
                    offset: Offset(0, bob),
                    child: bodyPicture(),
                  ),
                  Transform.translate(
                    offset: Offset(0, bob),
                    child: Transform.scale(
                      scaleY: blink,
                      alignment: Alignment.center,
                      child: eyesPicture(),
                    ),
                  ),
                ],
              );
            },
          )
        : Stack(children: [bodyPicture(), eyesPicture()]);
    // Keep the original Critters viewBox intact so multi-line chest patterns
    // remain visible. The rounded frame below handles clipping and the white
    // overlay border without zooming the character.
    final framedImage = animatedImage;
    return Container(
      width: widget.size,
      height: widget.size,
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(widget.size * 0.18),
        color: Color(int.parse('FF${widget.background}', radix: 16)),
      ),
      child: Stack(
        fit: StackFit.expand,
        children: [
          framedImage,
          if (widget.borderWidth > 0)
            IgnorePointer(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(widget.size * 0.18),
                  border: Border.all(
                    color: widget.borderColor ??
                        Theme.of(context).colorScheme.primary,
                    width: widget.borderWidth,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
