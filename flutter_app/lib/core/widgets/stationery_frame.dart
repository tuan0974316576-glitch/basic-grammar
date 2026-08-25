import 'package:flutter/material.dart';

import '../app_palette.dart';

/// A paper frame based on the dashed panels used by the original web game.
class StationeryFrame extends StatelessWidget {
  const StationeryFrame({
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.backgroundColor = AppPalette.paper,
    this.borderColor = AppPalette.primary,
    this.shadowColor = const Color(0xFFBDE0E1),
    this.radius = 24,
    this.strokeWidth = 3,
    this.ringWidth = 5,
    this.shadowDepth = 6,
    super.key,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final Color backgroundColor;
  final Color borderColor;
  final Color shadowColor;
  final double radius;
  final double strokeWidth;
  final double ringWidth;
  final double shadowDepth;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(radius + ringWidth),
        boxShadow: [
          BoxShadow(
            color: shadowColor,
            offset: Offset(0, shadowDepth),
          ),
          BoxShadow(
            color: AppPalette.primary.withValues(alpha: 0.13),
            offset: Offset(0, shadowDepth + 5),
            blurRadius: 13,
          ),
        ],
      ),
      padding: EdgeInsets.all(ringWidth),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(radius),
        child: ColoredBox(
          color: backgroundColor,
          child: CustomPaint(
            foregroundPainter: _DashedRoundedBorderPainter(
              color: borderColor,
              radius: radius,
              strokeWidth: strokeWidth,
            ),
            child: Padding(padding: padding, child: child),
          ),
        ),
      ),
    );
  }
}

/// A single dashed surface without the white stationery ring.
///
/// This matches original web controls such as vocabulary rows, stat boxes,
/// text fields, and bottom tabs, which share the dashed border but not the
/// outer white ring used by a full screen frame.
class OriginalDashedSurface extends StatelessWidget {
  const OriginalDashedSurface({
    required this.child,
    this.padding = EdgeInsets.zero,
    this.backgroundColor = AppPalette.paper,
    this.borderColor = AppPalette.primary,
    this.shadowColor = Colors.transparent,
    this.radius = 18,
    this.strokeWidth = 3,
    this.shadowDepth = 0,
    this.blurRadius = 0,
    super.key,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final Color backgroundColor;
  final Color borderColor;
  final Color shadowColor;
  final double radius;
  final double strokeWidth;
  final double shadowDepth;
  final double blurRadius;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(radius),
        boxShadow: shadowColor == Colors.transparent
            ? null
            : [
                BoxShadow(
                  color: shadowColor,
                  offset: Offset(0, shadowDepth),
                  blurRadius: blurRadius,
                ),
              ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(radius),
        child: ColoredBox(
          color: backgroundColor,
          child: CustomPaint(
            foregroundPainter: _DashedRoundedBorderPainter(
              color: borderColor,
              radius: radius,
              strokeWidth: strokeWidth,
            ),
            child: Padding(padding: padding, child: child),
          ),
        ),
      ),
    );
  }
}

class _DashedRoundedBorderPainter extends CustomPainter {
  const _DashedRoundedBorderPainter({
    required this.color,
    required this.radius,
    required this.strokeWidth,
  });

  final Color color;
  final double radius;
  final double strokeWidth;

  @override
  void paint(Canvas canvas, Size size) {
    final inset = strokeWidth / 2;
    final rect = Rect.fromLTWH(
      inset,
      inset,
      size.width - strokeWidth,
      size.height - strokeWidth,
    );
    final path = Path()
      ..addRRect(
        RRect.fromRectAndRadius(
          rect,
          Radius.circular((radius - inset).clamp(0, radius)),
        ),
      );
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    const dashLength = 8.0;
    const gapLength = 6.0;
    for (final metric in path.computeMetrics()) {
      var distance = 0.0;
      while (distance < metric.length) {
        canvas.drawPath(
          metric.extractPath(distance, distance + dashLength),
          paint,
        );
        distance += dashLength + gapLength;
      }
    }
  }

  @override
  bool shouldRepaint(covariant _DashedRoundedBorderPainter oldDelegate) {
    return color != oldDelegate.color ||
        radius != oldDelegate.radius ||
        strokeWidth != oldDelegate.strokeWidth;
  }
}
