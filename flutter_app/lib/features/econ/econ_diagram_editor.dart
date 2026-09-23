import 'dart:async';
import 'dart:convert';
import 'dart:math' as math;

import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';

import '../../core/app_palette.dart';
import '../../core/app_sfx.dart';
import 'econ_diagram_domain.dart';
import 'econ_diagram_models.dart';
import 'econ_palette.dart';

typedef EconGuideMovement = ({
  int fromIndex,
  int toIndex,
  int lane,
  EconDiagramCoordinate from,
  EconDiagramCoordinate to,
});

typedef EconMarketGapGuideMovement = ({
  int fromIndex,
  int toIndex,
  int lane,
  EconMarketGapGeometry from,
  EconMarketGapGeometry to,
});

List<EconGuideMovement> econGuideMovements(
  EconDiagramState state,
  EconDiagramState studentState,
) {
  final studentPointIds = studentState.points.map((point) => point.id).toSet();
  final studentEquilibriumIds =
      studentState.equilibria.map((point) => point.id).toSet();
  final guides = <({int index, EconDiagramCoordinate coordinate})>[
    for (final point in state.points)
      if (studentPointIds.contains(point.id) && point.quantityLabel == null)
        if (diagramPointCoordinate(state, point) case final coordinate?)
          (index: point.labelIndex, coordinate: coordinate),
    for (final equilibrium in state.equilibria)
      if (studentEquilibriumIds.contains(equilibrium.id))
        if (diagramEquilibriumCoordinate(state, equilibrium)
            case final coordinate?)
          (index: equilibrium.labelIndex, coordinate: coordinate),
  ]..sort((left, right) => left.index.compareTo(right.index));
  final unique = <int, EconDiagramCoordinate>{};
  for (final guide in guides) {
    unique.putIfAbsent(guide.index, () => guide.coordinate);
  }
  final ordered = unique.entries.toList()
    ..sort((left, right) => left.key.compareTo(right.key));
  return [
    for (var transition = 1; transition < ordered.length; transition++)
      (
        fromIndex: ordered[transition - 1].key,
        toIndex: ordered[transition].key,
        lane: transition - 1,
        from: ordered[transition - 1].value,
        to: ordered[transition].value,
      ),
  ];
}

List<EconMarketGapGuideMovement> econMarketGapGuideMovements(
  EconDiagramState state,
  EconDiagramState studentState,
) {
  final studentGapIds = studentState.marketGaps.map((gap) => gap.id).toSet();
  final marked = <({int index, EconMarketGapGeometry geometry})>[];
  for (final gap in state.marketGaps) {
    if (!gap.quantitiesMarked || !studentGapIds.contains(gap.id)) continue;
    final geometry = marketGapGeometry(state, gap);
    if (geometry == null) continue;
    marked.add((
      index: gap.guideLabelIndex ?? gap.labelIndex,
      geometry: geometry,
    ));
  }
  marked.sort((left, right) => left.index.compareTo(right.index));
  return [
    for (var transition = 1; transition < marked.length; transition++)
      (
        fromIndex: marked[transition - 1].index,
        toIndex: marked[transition].index,
        lane: transition - 1,
        from: marked[transition - 1].geometry,
        to: marked[transition].geometry,
      ),
  ];
}

String econNumberedAreaLabel(String base, int ordinal, int total) =>
    total > 1 ? '$base$ordinal' : base;

class EconDiagramEditor extends StatefulWidget {
  const EconDiagramEditor({
    required this.value,
    required this.onChanged,
    this.disabled = false,
    this.language = 'zh',
    this.diagramKind = 'demand-supply',
    this.mode = 'create',
    this.policy,
    this.requiresSplitPrice = false,
    this.requirements = const [],
    this.sourceSeed,
    this.onInteractionChanged,
    super.key,
  });

  final EconDiagramState value;
  final ValueChanged<EconDiagramState> onChanged;
  final bool disabled;
  final String language;
  final String diagramKind;
  final String mode;
  final String? policy;
  final bool requiresSplitPrice;
  final List<Map<String, dynamic>> requirements;
  final EconDiagramState? sourceSeed;
  final ValueChanged<bool>? onInteractionChanged;

  @override
  State<EconDiagramEditor> createState() => _EconDiagramEditorState();
}

class _EconDiagramEditorState extends State<EconDiagramEditor> {
  final List<EconDiagramState> _past = [];
  final List<EconDiagramState> _future = [];
  final List<EconDiagramCoordinate> _trace = [];
  EconDiagramCoordinate? _measureStart;
  EconDiagramCoordinate? _axisGuideStart;
  EconDiagramCoordinate? _axisGuideCurrent;
  EconDiagramCoordinate? _activeAreaAnchor;
  bool _areaTraceReady = false;
  bool _areaTraceError = false;
  Size? _activeCanvasSize;
  EconDiagramState? _dragStart;
  String? _selectedId;
  String? _dragKind;
  String _tool = 'select';
  final ValueNotifier<EconDiagramState?> _dragPreview = ValueNotifier(null);

  @override
  void didUpdateWidget(covariant EconDiagramEditor oldWidget) {
    super.didUpdateWidget(oldWidget);
    final preview = _dragPreview.value;
    if (_dragKind == null &&
        preview != null &&
        _sameState(preview, widget.value)) {
      _dragPreview.value = null;
    }
  }

  @override
  void dispose() {
    _dragPreview.dispose();
    super.dispose();
  }

  bool get _english => widget.language != 'zh';
  bool get _structured => widget.diagramKind != 'demand-supply';
  bool get _readOnly => widget.disabled || widget.mode == 'reference';

  List<String> _requirementsFor(String type) => widget.requirements
      .where((item) => item['objectType'] == type)
      .map((item) => '${item['concept'] ?? ''}')
      .where((item) => item.isNotEmpty)
      .toSet()
      .toList();

  List<String> get _markerConcepts {
    final concepts = <String>{
      ..._requirementsFor('marker'),
      ..._requirementsFor('gap'),
      ..._requirementsFor('line'),
    }.toList();
    if (concepts.isNotEmpty) return concepts;
    return switch (widget.diagramKind) {
      'as-ad' => ['equilibrium', 'output', 'price-level'],
      'money-market' => ['equilibrium', 'interest-rate', 'quantity-of-money'],
      'trade-barrier' => [
          'domestic-production',
          'domestic-consumption',
          'imports'
        ],
      'monopoly' => ['monopoly-equilibrium', 'efficient-equilibrium'],
      'ppf' => ['production-point', 'consumption-point'],
      _ => const <String>[],
    };
  }

  List<String> get _areaConcepts {
    final concepts = _requirementsFor('area');
    if (widget.diagramKind == 'demand-supply' && concepts.isNotEmpty) {
      final mapped = <String>{};
      const direct = {
        'consumer-surplus',
        'producer-surplus',
        'total-social-surplus',
        'total-subsidy',
        'deadweight-loss',
      };
      mapped.addAll(concepts.where(direct.contains));
      if (concepts.any(
          (item) => item == 'expenditure-area' || item == 'revenue-area')) {
        mapped.add('total-expenditure');
      }
      if (concepts.any((item) => item == 'gain-loss-areas')) {
        mapped
          ..add('total-expenditure-increase')
          ..add('total-expenditure-decrease');
      }
      if (concepts.any((item) => item == 'tax-subsidy-shares')) {
        if (widget.policy == 'subsidy') {
          mapped
            ..add('buyer-subsidy-benefit')
            ..add('seller-subsidy-benefit')
            ..add('total-subsidy');
        } else {
          mapped
            ..add('buyer-tax-burden')
            ..add('seller-tax-burden');
        }
      }
      if (mapped.isNotEmpty) return mapped.toList();
    }
    if (concepts.isNotEmpty) return concepts;
    return switch (widget.diagramKind) {
      'trade-barrier' => ['tariff-revenue', 'quota-rent', 'deadweight-loss'],
      'monopoly' => ['profit', 'deadweight-loss', 'consumer-surplus'],
      'ppf' => ['gains-from-trade'],
      'demand-supply' => [
          'consumer-surplus',
          'producer-surplus',
          'total-expenditure',
          'deadweight-loss',
        ],
      _ => const <String>[],
    };
  }

  void _commit(EconDiagramState next) {
    final resolved = _resolveAnchoredAreas(next);
    if (_sameState(resolved, widget.value)) return;
    setState(() {
      _past.add(widget.value);
      if (_past.length > 40) _past.removeAt(0);
      _future.clear();
    });
    widget.onChanged(resolved);
  }

  void _transient(EconDiagramState next) {
    _dragPreview.value = next;
  }

  EconDiagramState _resolveAnchoredAreas(EconDiagramState state) {
    final working = mergeDiagramSource(state, widget.sourceSeed);
    final areas = [
      for (final area in working.areas)
        EconDiagramArea(
          id: area.id,
          kind: area.kind,
          referenceIds: area.referenceIds,
          points: _resolveAreaAnchors(
              area.points,
              [
                for (final anchor in area.anchors)
                  (boundaryIds: anchor.boundaryIds, fallback: anchor.fallback),
              ],
              _demandSupplyBoundaries(working)),
          anchors: area.anchors,
        ),
    ];
    final structured = working.structured;
    final resolved = working.copyWith(
      areas: areas,
      structured: structured?.copyWith(areas: [
        for (final area in structured.areas)
          EconStructuredArea(
            id: area.id,
            concept: area.concept,
            label: area.label,
            points: _resolveAreaAnchors(
                area.points,
                [
                  for (final anchor in area.anchors)
                    (
                      boundaryIds: anchor.boundaryIds,
                      fallback: anchor.fallback
                    ),
                ],
                _structuredBoundaries(structured)),
            anchors: area.anchors,
          ),
      ], markers: [
        for (final marker in structured.markers)
          (() {
            final coordinate =
                structuredMarkerCoordinateState(structured, marker);
            return EconStructuredMarker(
              id: marker.id,
              concept: marker.concept,
              concepts: marker.concepts,
              label: marker.label,
              quantityPosition: coordinate.quantity,
              pricePosition: coordinate.price,
              anchorCurveIds: marker.anchorCurveIds,
              axisGuide: marker.axisGuide,
              horizontalLabel: marker.horizontalLabel,
              verticalLabel: marker.verticalLabel,
            );
          })(),
      ]),
    );
    return stripDiagramSource(resolved, widget.sourceSeed);
  }

  void _undo() {
    if (_past.isEmpty) return;
    final previous = _past.removeLast();
    setState(() {
      _future.insert(0, widget.value);
      _selectedId = null;
    });
    widget.onChanged(previous);
    unawaited(AppSfx.instance.play(SfxCue.click));
  }

  void _redo() {
    if (_future.isEmpty) return;
    final next = _future.removeAt(0);
    setState(() {
      _past.add(widget.value);
      _selectedId = null;
    });
    widget.onChanged(next);
    unawaited(AppSfx.instance.play(SfxCue.click));
  }

  void _reset() {
    _commit(emptyDiagramForKind(widget.diagramKind));
    setState(() {
      _selectedId = null;
      _tool = 'select';
      _trace.clear();
      _measureStart = null;
      _areaTraceReady = false;
      _areaTraceError = false;
      _activeAreaAnchor = null;
    });
  }

  void _addDemandSupply(String kind) {
    final next =
        _withSource((combined) => addDemandSupplyCurve(combined, kind));
    _commit(next);
    setState(() => _selectedId = next.selectedCurveId);
    unawaited(AppSfx.instance.play(SfxCue.step));
  }

  void _addStructured(EconStructuredCurveOption option) {
    final next = _withSource((combined) =>
        addStructuredCurve(combined, widget.diagramKind, option.concept));
    _commit(next);
    setState(() => _selectedId = next.structured?.selectedCurveId);
    unawaited(AppSfx.instance.play(SfxCue.step));
  }

  void _selectTool(String tool) {
    setState(() {
      _tool = _tool == tool ? 'select' : tool;
      _trace.clear();
      _measureStart = null;
      _areaTraceReady = false;
      _areaTraceError = false;
      _activeAreaAnchor = null;
    });
  }

  void _selectAreaConcept(String concept) {
    setState(() => _tool = 'area:$concept');
  }

  EconDiagramState _withSource(
      EconDiagramState Function(EconDiagramState combined) operation) {
    final combined = mergeDiagramSource(widget.value, widget.sourceSeed);
    return stripDiagramSource(operation(combined), widget.sourceSeed);
  }

  void _handleTap(Offset local, Size size) {
    if (_readOnly) return;
    final geometry = _DiagramGeometry.fromSize(size);
    final coordinate = geometry.fromOffset(local);
    if (_tool.startsWith('area:')) {
      if (_structured && _trace.length < 8) {
        final anchor = _nearestStructuredShadeAnchor(coordinate, size);
        if (anchor != null &&
            !_trace.any((point) => _distance(point, anchor) < .012)) {
          setState(() => _trace.add(anchor));
        }
      }
      return;
    }
    if (_structured && _tool.startsWith('marker:')) {
      _commit(_withSource((combined) =>
          addStructuredMarker(combined, _tool.substring(7), coordinate)));
      return;
    }
    if (_structured && _tool.startsWith('measure:')) {
      if (_measureStart == null) {
        setState(() => _measureStart = coordinate);
      } else {
        _commit(_withSource((combined) => addStructuredMeasureState(
            combined, _tool.substring(8), _measureStart!, coordinate)));
        setState(() {
          _measureStart = null;
          _tool = 'select';
        });
      }
      return;
    }
    if (!_structured && _tool == 'point') {
      final curveId = _selectedId ??
          mergeDiagramSource(widget.value, widget.sourceSeed)
              .curves
              .lastOrNull
              ?.id;
      if (curveId != null) {
        _commit(_withSource((combined) =>
            addPointOnCurve(combined, curveId, coordinate.quantity)));
      }
      return;
    }
    if (_tool == 'select') {
      if (_structured) {
        final id = _closestStructuredMarker(coordinate) ??
            _closestStructuredArea(coordinate) ??
            _closestCurve(coordinate);
        if (id != null) setState(() => _selectedId = id);
        return;
      }
      final id = _closestPoint(coordinate) ??
          _closestGap(coordinate) ??
          _closestDemandSupplyArea(coordinate) ??
          _closestCurve(coordinate);
      if (id != null) setState(() => _selectedId = id);
    }
  }

  void _startPan(DragStartDetails details, Size size) {
    if (_readOnly) return;
    _activeCanvasSize = size;
    final coordinate =
        _DiagramGeometry.fromSize(size).fromOffset(details.localPosition);
    final geometry = _DiagramGeometry.fromSize(size);
    final onPriceAxis = details.localPosition.dx >= geometry.left - 18 &&
        details.localPosition.dx <= geometry.left + 18 &&
        details.localPosition.dy >= geometry.top &&
        details.localPosition.dy <= geometry.bottom;
    if (_tool == 'select' && onPriceAxis) {
      setState(() {
        _axisGuideStart = coordinate;
        _axisGuideCurrent =
            EconDiagramCoordinate(quantity: 0, price: coordinate.price);
      });
      return;
    }
    if (_tool.startsWith('area:')) {
      if (_structured) return;
      if (_areaTraceReady) return;
      final combined = mergeDiagramSource(widget.value, widget.sourceSeed);
      final anchor = _nearestShadeAnchor(coordinate, combined, size);
      setState(() {
        _trace.clear();
        if (anchor != null) _trace.add(anchor);
        _activeAreaAnchor = anchor;
        _areaTraceError = false;
      });
      return;
    }
    if (_tool != 'select') return;
    final pointId = _closestPoint(coordinate);
    final gapId = _closestGap(coordinate);
    final curveId = _closestCurve(coordinate);
    setState(() {
      _dragStart = widget.value;
      if (pointId != null) {
        _dragKind = 'point';
        _selectedId = pointId;
      } else if (gapId != null) {
        _dragKind = 'gap';
        _selectedId = gapId;
      } else if (curveId != null) {
        _dragKind = 'curve';
        _selectedId = curveId;
      }
    });
    if (_dragKind != null) _dragPreview.value = widget.value;
  }

  bool _canStartCanvasPan(Offset localPosition, Size size) {
    if (_readOnly) return false;
    final geometry = _DiagramGeometry.fromSize(size);
    final coordinate = geometry.fromOffset(localPosition);
    final onPriceAxis = localPosition.dx >= geometry.left - 18 &&
        localPosition.dx <= geometry.left + 18 &&
        localPosition.dy >= geometry.top &&
        localPosition.dy <= geometry.bottom;
    if (_tool == 'select' && onPriceAxis) return true;
    if (_tool.startsWith('area:')) {
      if (_structured || _areaTraceReady) return false;
      final combined = mergeDiagramSource(widget.value, widget.sourceSeed);
      return _nearestShadeAnchor(coordinate, combined, size) != null;
    }
    if (_tool != 'select') return false;
    return _closestPoint(coordinate) != null ||
        _closestGap(coordinate) != null ||
        _closestCurve(coordinate) != null;
  }

  void _updatePan(DragUpdateDetails details, Size size) {
    if (_readOnly) return;
    final geometry = _DiagramGeometry.fromSize(size);
    final coordinate = geometry.fromOffset(details.localPosition);
    if (_axisGuideStart != null) {
      setState(() => _axisGuideCurrent = coordinate);
      return;
    }
    if (_tool.startsWith('area:')) {
      if (_structured) return;
      if (_areaTraceReady) return;
      final anchor = _nearestShadeAnchor(coordinate,
          mergeDiagramSource(widget.value, widget.sourceSeed), size);
      setState(() {
        _activeAreaAnchor = anchor;
        _areaTraceError = false;
        if (anchor != null &&
            !_trace.any((point) => _distance(point, anchor) < .012)) {
          _trace.add(anchor);
        }
      });
      return;
    }
    final id = _selectedId;
    if (_tool != 'select' || id == null) return;
    final current = _dragPreview.value ?? widget.value;
    if (_dragKind == 'point') {
      final point = current.points.where((item) => item.id == id).firstOrNull;
      final curve = point == null
          ? null
          : current.curves
              .where((item) => item.id == point.curveId)
              .firstOrNull;
      _transient(current.copyWith(points: [
        for (final point in current.points)
          if (point.id == id)
            point.copyWith(
                quantityPosition: curve?.shape == 'vertical'
                    ? coordinate.price
                    : coordinate.quantity)
          else
            point,
      ]));
      return;
    }
    if (_dragKind == 'gap') {
      _transient(current.copyWith(marketGaps: [
        for (final gap in current.marketGaps)
          if (gap.id == id)
            gap.copyWith(
              pricePosition: coordinate.price,
              quantitiesMarked: true,
            )
          else
            gap,
      ]));
      return;
    }
    if (_structured) {
      final curve =
          current.structured?.curves.where((item) => item.id == id).firstOrNull;
      if (curve != null) {
        final plotWidth = geometry.right - geometry.left;
        final plotHeight = geometry.bottom - geometry.top;
        final delta = curve.shape == 'horizontal'
            ? -details.delta.dy / (plotHeight * .22)
            : details.delta.dx / (plotWidth * .22);
        _transient(updateStructuredCurveState(
          current,
          id,
          position: curve.position + delta,
        ));
      }
      return;
    }
    final curve = current.curves.where((item) => item.id == id).firstOrNull;
    if (curve == null) return;
    final verticalMove =
        curve.shiftAxis == 'vertical' || curve.shape == 'horizontal';
    final plotWidth = geometry.right - geometry.left;
    final plotHeight = geometry.bottom - geometry.top;
    final delta = verticalMove
        ? -details.delta.dy / (plotHeight * .26)
        : details.delta.dx / (plotWidth * .26);
    _transient(updateDemandSupplyCurve(
      current,
      id,
      position: curve.position + delta,
    ));
  }

  void _endPan(DragEndDetails details) {
    final guideStart = _axisGuideStart;
    if (guideStart != null) {
      final size = _activeCanvasSize;
      if (size != null && size.width > 0 && size.height > 0) {
        final coordinate =
            _DiagramGeometry.fromSize(size).fromOffset(details.localPosition);
        _commit(_withSource((combined) => _structured
            ? addStructuredGuideFromAxisDragState(
                combined,
                guideStart.price,
                coordinate.quantity,
                concepts: _markerConcepts,
              )
            : addGuideFromAxisDrag(
                combined, guideStart.price, coordinate.quantity)));
      }
      setState(() {
        _axisGuideStart = null;
        _axisGuideCurrent = null;
      });
      _activeCanvasSize = null;
      return;
    }
    if (_tool.startsWith('area:')) {
      if (_structured) return;
      if (_trace.length >= 3) {
        setState(() {
          _areaTraceReady = true;
          _areaTraceError = false;
          _activeAreaAnchor = null;
        });
      } else {
        setState(() {
          _areaTraceError = true;
          _activeAreaAnchor = null;
        });
      }
      return;
    }
    final start = _dragStart;
    final preview = _dragPreview.value;
    if (start != null && preview != null && !_sameState(start, preview)) {
      final resolved = _resolveAnchoredAreas(preview);
      setState(() {
        _past.add(start);
        if (_past.length > 40) _past.removeAt(0);
        _future.clear();
      });
      widget.onChanged(resolved);
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted && _dragKind == null) _dragPreview.value = null;
      });
    } else {
      _dragPreview.value = null;
    }
    _dragStart = null;
    _dragKind = null;
    _activeCanvasSize = null;
  }

  void _cancelPan() {
    _dragPreview.value = null;
    _dragStart = null;
    _dragKind = null;
    _activeCanvasSize = null;
  }

  void _saveShade(String concept) {
    final combined = mergeDiagramSource(widget.value, widget.sourceSeed);
    final traced = _canonicalShadeTrace(
        _structured ? _trace : _snapShadeTrace(_trace, combined));
    _commit(_withSource((current) => _structured
        ? addStructuredAreaState(
            current,
            concept,
            traced,
            _structuredAnchorsForTrace(current.structured, traced),
          )
        : addDiagramArea(
            current,
            concept,
            traced,
            _anchorsForTrace(current, traced),
          )));
    setState(() {
      _trace.clear();
      _tool = 'select';
      _areaTraceReady = false;
      _areaTraceError = false;
      _activeAreaAnchor = null;
    });
  }

  List<EconDiagramAreaAnchor> _anchorsForTrace(
      EconDiagramState state, List<EconDiagramCoordinate> points) {
    final boundaries = _demandSupplyBoundaries(state);
    return [
      for (final point in points)
        EconDiagramAreaAnchor(
          boundaryIds: boundaries.entries
              .where((entry) =>
                  _distance(point, _projectToSegment(point, entry.value)) <
                  .006)
              .map((entry) => _baseBoundaryId(entry.key))
              .toSet()
              .toList(),
          fallback: point,
        ),
    ];
  }

  List<EconStructuredAreaAnchor> _structuredAnchorsForTrace(
      EconStructuredDiagramState? state, List<EconDiagramCoordinate> points) {
    final boundaries = _structuredBoundaries(state);
    return [
      for (final point in points)
        EconStructuredAreaAnchor(
          boundaryIds: boundaries.entries
              .where((entry) =>
                  _distance(point, _projectToSegment(point, entry.value)) <
                  .014)
              .map((entry) => _baseBoundaryId(entry.key))
              .toSet()
              .toList(),
          fallback: point,
        ),
    ];
  }

  List<EconDiagramCoordinate> _snapShadeTrace(
      List<EconDiagramCoordinate> points, EconDiagramState state) {
    return points;
  }

  List<EconDiagramCoordinate> _canonicalShadeTrace(
      List<EconDiagramCoordinate> points) {
    final unique = <EconDiagramCoordinate>[];
    for (final point in points) {
      if (!unique.any((item) => _distance(item, point) < .012)) {
        unique.add(point);
      }
    }
    if (unique.length > 2 && _distance(unique.first, unique.last) < .045) {
      unique.removeLast();
    }
    var hull = _convexHull(unique);
    while (hull.length > 4) {
      var removeIndex = 0;
      var smallestArea = double.infinity;
      for (var index = 0; index < hull.length; index++) {
        final previous = hull[(index - 1 + hull.length) % hull.length];
        final current = hull[index];
        final next = hull[(index + 1) % hull.length];
        final area = ((current.quantity - previous.quantity) *
                    (next.price - previous.price) -
                (current.price - previous.price) *
                    (next.quantity - previous.quantity))
            .abs();
        if (area < smallestArea) {
          smallestArea = area;
          removeIndex = index;
        }
      }
      hull = [...hull]..removeAt(removeIndex);
    }
    return hull;
  }

  List<EconDiagramCoordinate> _convexHull(List<EconDiagramCoordinate> points) {
    if (points.length <= 3) return [...points];
    final sorted = [...points]..sort((left, right) =>
        left.quantity == right.quantity
            ? left.price.compareTo(right.price)
            : left.quantity.compareTo(right.quantity));
    double cross(EconDiagramCoordinate a, EconDiagramCoordinate b,
            EconDiagramCoordinate c) =>
        (b.quantity - a.quantity) * (c.price - a.price) -
        (b.price - a.price) * (c.quantity - a.quantity);
    final lower = <EconDiagramCoordinate>[];
    for (final point in sorted) {
      while (lower.length >= 2 &&
          cross(lower[lower.length - 2], lower.last, point) <= 0) {
        lower.removeLast();
      }
      lower.add(point);
    }
    final upper = <EconDiagramCoordinate>[];
    for (final point in sorted.reversed) {
      while (upper.length >= 2 &&
          cross(upper[upper.length - 2], upper.last, point) <= 0) {
        upper.removeLast();
      }
      upper.add(point);
    }
    return [
      ...lower.take(lower.length - 1),
      ...upper.take(upper.length - 1),
    ];
  }

  EconDiagramCoordinate? _nearestShadeAnchor(
      EconDiagramCoordinate point, EconDiagramState state,
      [Size? canvasSize]) {
    final boundaries = <_DiagramSegment>[
      const _DiagramSegment(
        EconDiagramCoordinate(quantity: 0, price: 0),
        EconDiagramCoordinate(quantity: 1, price: 0),
      ),
      const _DiagramSegment(
        EconDiagramCoordinate(quantity: 0, price: 0),
        EconDiagramCoordinate(quantity: 0, price: 1),
      ),
      for (final curve in state.curves)
        ..._curveRenderSegments(curve, state.curves),
    ];
    for (final equilibrium in state.equilibria) {
      final coordinate = diagramEquilibriumCoordinate(state, equilibrium);
      if (coordinate != null) {
        boundaries
          ..add(_DiagramSegment(
              EconDiagramCoordinate(quantity: 0, price: coordinate.price),
              coordinate))
          ..add(_DiagramSegment(coordinate,
              EconDiagramCoordinate(quantity: coordinate.quantity, price: 0)));
      }
    }
    for (final guide in state.points) {
      final coordinate = diagramPointCoordinate(state, guide);
      if (coordinate != null) {
        boundaries
          ..add(_DiagramSegment(
              EconDiagramCoordinate(quantity: 0, price: coordinate.price),
              coordinate))
          ..add(_DiagramSegment(coordinate,
              EconDiagramCoordinate(quantity: coordinate.quantity, price: 0)));
      }
    }
    for (final gap in state.marketGaps) {
      final geometry = marketGapGeometry(state, gap);
      if (geometry == null) continue;
      final left = math.min(geometry.demandQuantity, geometry.supplyQuantity);
      final right = math.max(geometry.demandQuantity, geometry.supplyQuantity);
      boundaries
        ..add(_DiagramSegment(
          EconDiagramCoordinate(quantity: 0, price: geometry.price),
          EconDiagramCoordinate(quantity: right, price: geometry.price),
        ))
        ..add(_DiagramSegment(
          EconDiagramCoordinate(quantity: left, price: 0),
          EconDiagramCoordinate(quantity: left, price: geometry.price),
        ))
        ..add(_DiagramSegment(
          EconDiagramCoordinate(quantity: right, price: 0),
          EconDiagramCoordinate(quantity: right, price: geometry.price),
        ));
    }
    final candidates = <EconDiagramCoordinate>[];
    for (var first = 0; first < boundaries.length; first++) {
      for (var second = first + 1; second < boundaries.length; second++) {
        final intersection =
            _segmentIntersection(boundaries[first], boundaries[second]);
        if (intersection != null &&
            !candidates.any((item) => _distance(item, intersection) < .004)) {
          candidates.add(intersection);
        }
      }
    }
    final sorted = candidates
        .map((candidate) => (
              candidate: candidate,
              distance:
                  _shadePixelDistance(candidate, point, canvasSize: canvasSize)
            ))
        .toList()
      ..sort((left, right) => left.distance.compareTo(right.distance));
    return sorted.isNotEmpty && sorted.first.distance <= 28
        ? sorted.first.candidate
        : null;
  }

  EconDiagramCoordinate? _nearestStructuredShadeAnchor(
      EconDiagramCoordinate point,
      [Size? canvasSize]) {
    final structured =
        mergeDiagramSource(widget.value, widget.sourceSeed).structured;
    if (structured == null) return null;
    final boundaries = <_DiagramSegment>[
      const _DiagramSegment(
        EconDiagramCoordinate(quantity: 0, price: 0),
        EconDiagramCoordinate(quantity: 1, price: 0),
      ),
      const _DiagramSegment(
        EconDiagramCoordinate(quantity: 0, price: 0),
        EconDiagramCoordinate(quantity: 0, price: 1),
      ),
    ];
    for (final curve in structured.curves) {
      final points = structuredCurvePoints(curve, 96, structured.curves);
      for (var index = 1; index < points.length; index++) {
        boundaries.add(_DiagramSegment(points[index - 1], points[index]));
      }
    }
    for (final marker in structured.markers) {
      final coordinate = EconDiagramCoordinate(
        quantity: marker.quantityPosition,
        price: marker.pricePosition,
      );
      boundaries
        ..add(_DiagramSegment(
            EconDiagramCoordinate(quantity: 0, price: coordinate.price),
            coordinate))
        ..add(_DiagramSegment(coordinate,
            EconDiagramCoordinate(quantity: coordinate.quantity, price: 0)));
    }
    for (final measure in structured.measures) {
      boundaries.add(_DiagramSegment(measure.start, measure.end));
    }
    final candidates = <EconDiagramCoordinate>[];
    for (var first = 0; first < boundaries.length; first++) {
      for (var second = first + 1; second < boundaries.length; second++) {
        final intersection =
            _segmentIntersection(boundaries[first], boundaries[second]);
        if (intersection != null &&
            !candidates.any((item) => _distance(item, intersection) < .012)) {
          candidates.add(intersection);
        }
      }
    }
    candidates.sort((left, right) => _shadePixelDistance(left, point,
            canvasSize: canvasSize)
        .compareTo(_shadePixelDistance(right, point, canvasSize: canvasSize)));
    return candidates.isNotEmpty &&
            _shadePixelDistance(candidates.first, point,
                    canvasSize: canvasSize) <=
                30
        ? candidates.first
        : null;
  }

  double _shadePixelDistance(
    EconDiagramCoordinate left,
    EconDiagramCoordinate right, {
    Size? canvasSize,
  }) {
    final size = canvasSize ?? _activeCanvasSize;
    if (size == null || size.isEmpty) return _distance(left, right) * 300;
    final geometry = _DiagramGeometry.fromSize(size);
    return (geometry.toOffset(left) - geometry.toOffset(right)).distance;
  }

  String? _closestCurve(EconDiagramCoordinate coordinate) {
    if (_structured) {
      final curves = widget.value.structured?.curves ?? const [];
      String? closest;
      var best = .12;
      for (final curve in curves) {
        final distance = structuredCurvePoints(curve, 48, curves)
            .map((point) => _distance(point, coordinate))
            .fold(double.infinity, math.min);
        if (distance < best) {
          best = distance;
          closest = curve.id;
        }
      }
      return closest;
    }
    String? closest;
    var best = .12;
    for (final curve in widget.value.curves) {
      final distance = curve.shape == 'vertical'
          ? (coordinate.quantity - (.5 + curve.position * .26)).abs()
          : (coordinate.price - demandSupplyPriceAt(curve, coordinate.quantity))
              .abs();
      if (distance < best) {
        best = distance;
        closest = curve.id;
      }
    }
    return closest;
  }

  String? _closestPoint(EconDiagramCoordinate coordinate) {
    String? closest;
    var best = .07;
    for (final point in widget.value.points) {
      final pointCoordinate = diagramPointCoordinate(widget.value, point);
      if (pointCoordinate == null) continue;
      final distance = _distance(pointCoordinate, coordinate);
      if (distance < best) {
        best = distance;
        closest = point.id;
      }
    }
    return closest;
  }

  String? _closestGap(EconDiagramCoordinate coordinate) {
    String? closest;
    var best = .055;
    for (final gap in widget.value.marketGaps) {
      final distance = (coordinate.price - gap.pricePosition).abs();
      if (distance < best) {
        best = distance;
        closest = gap.id;
      }
    }
    return closest;
  }

  String? _closestStructuredMarker(EconDiagramCoordinate coordinate) {
    String? closest;
    var best = .075;
    for (final marker in widget.value.structured?.markers ?? const []) {
      final distance = _distance(
        EconDiagramCoordinate(
          quantity: marker.quantityPosition,
          price: marker.pricePosition,
        ),
        coordinate,
      );
      if (distance < best) {
        best = distance;
        closest = marker.id;
      }
    }
    return closest;
  }

  String? _closestStructuredArea(EconDiagramCoordinate coordinate) {
    final state = widget.value.structured;
    final areas = state?.areas ?? const <EconStructuredArea>[];
    for (final area in areas.reversed) {
      final points = state == null
          ? area.points
          : _resolveAreaAnchors(
              area.points,
              [
                for (final anchor in area.anchors)
                  (boundaryIds: anchor.boundaryIds, fallback: anchor.fallback),
              ],
              _structuredBoundaries(state));
      if (_insidePolygon(coordinate, points)) return area.id;
    }
    return null;
  }

  String? _closestDemandSupplyArea(EconDiagramCoordinate coordinate) {
    for (final area in widget.value.areas.reversed) {
      final points = _resolveAreaAnchors(
          area.points,
          [
            for (final anchor in area.anchors)
              (boundaryIds: anchor.boundaryIds, fallback: anchor.fallback),
          ],
          _demandSupplyBoundaries(widget.value));
      if (_insidePolygon(coordinate, points)) return area.id;
    }
    return null;
  }

  void _deleteSelected() {
    final id = _selectedId;
    if (id == null) return;
    if (_structured) {
      final state = widget.value.structured;
      if (state == null) return;
      _commit(widget.value.copyWith(
        structured: state.copyWith(
          curves: state.curves.where((item) => item.id != id).toList(),
          markers: state.markers.where((item) => item.id != id).toList(),
          areas: state.areas.where((item) => item.id != id).toList(),
          measures: state.measures.where((item) => item.id != id).toList(),
        ),
      ));
    } else if (widget.value.curves.any((item) => item.id == id)) {
      _commit(deleteDemandSupplyCurve(widget.value, id));
    } else {
      _commit(widget.value.copyWith(
        points: widget.value.points.where((item) => item.id != id).toList(),
        marketGaps:
            widget.value.marketGaps.where((item) => item.id != id).toList(),
        areas: widget.value.areas.where((item) => item.id != id).toList(),
      ));
    }
    setState(() => _selectedId = null);
  }

  @override
  Widget build(BuildContext context) {
    final source = widget.sourceSeed;
    final canReset = widget.value.hasAnswer;
    return Container(
      key: const Key('econ-diagram-editor'),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: const Color(0xFFE5E5E5), width: 2),
        borderRadius: BorderRadius.circular(8),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            constraints: const BoxConstraints(minHeight: 54),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: Color(0xFFE5E5E5))),
            ),
            child: LayoutBuilder(
              builder: (context, constraints) {
                final title = Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.analytics_rounded,
                        color: Color(0xFFA560E8), size: 20),
                    const SizedBox(width: 6),
                    Text(
                      _english ? 'DIAGRAM' : '作答圖',
                      style: const TextStyle(
                        color: AppPalette.ink,
                        fontSize: 15,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    if (!_readOnly) ...[
                      const SizedBox(width: 7),
                      _StatusBadge(label: _english ? 'REQUIRED' : '必須作答'),
                    ],
                  ],
                );
                final actions = Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _HeaderButton(
                      icon: Icons.undo_rounded,
                      label: _english ? 'Undo' : '復原',
                      onPressed: _past.isEmpty || _readOnly ? null : _undo,
                    ),
                    _HeaderButton(
                      icon: Icons.redo_rounded,
                      label: _english ? 'Redo' : '重做',
                      onPressed: _future.isEmpty || _readOnly ? null : _redo,
                    ),
                    _HeaderButton(
                      icon: Icons.refresh_rounded,
                      label: _english ? 'Reset' : '清除',
                      onPressed: !canReset || _readOnly ? null : _reset,
                    ),
                  ],
                );
                return Row(
                  children: [Expanded(child: title), actions],
                );
              },
            ),
          ),
          if (!_readOnly) ...[
            if (_structured) _structuredToolbar() else _demandSupplyToolbar(),
          ],
          LayoutBuilder(
            builder: (context, constraints) {
              final height = (constraints.maxWidth * .76).clamp(270.0, 340.0);
              final size = Size(constraints.maxWidth, height);
              return SizedBox(
                height: height,
                child: ClipRect(
                  child: RawGestureDetector(
                    key: const Key('econ-diagram-canvas'),
                    behavior: HitTestBehavior.opaque,
                    gestures: {
                      TapGestureRecognizer:
                          GestureRecognizerFactoryWithHandlers<
                              TapGestureRecognizer>(
                        TapGestureRecognizer.new,
                        (recognizer) {
                          recognizer.onTapUp = (details) =>
                              _handleTap(details.localPosition, size);
                        },
                      ),
                      _ConditionalPanGestureRecognizer:
                          GestureRecognizerFactoryWithHandlers<
                              _ConditionalPanGestureRecognizer>(
                        _ConditionalPanGestureRecognizer.new,
                        (recognizer) {
                          recognizer.canStart = (event) => _canStartCanvasPan(
                                event.localPosition,
                                size,
                              );
                          recognizer.dragStartBehavior = DragStartBehavior.down;
                          recognizer.onDown =
                              (_) => widget.onInteractionChanged?.call(true);
                          recognizer.onStart =
                              (details) => _startPan(details, size);
                          recognizer.onUpdate =
                              (details) => _updatePan(details, size);
                          recognizer.onEnd = (details) {
                            _endPan(details);
                            widget.onInteractionChanged?.call(false);
                          };
                          recognizer.onCancel = () {
                            _cancelPan();
                            widget.onInteractionChanged?.call(false);
                          };
                        },
                      ),
                    },
                    child: RepaintBoundary(
                      child: ValueListenableBuilder<EconDiagramState?>(
                        valueListenable: _dragPreview,
                        builder: (context, preview, child) {
                          final studentState = preview ?? widget.value;
                          final combined = mergeDiagramSource(
                            _resolveAnchoredAreas(studentState),
                            source,
                          );
                          return CustomPaint(
                            painter: _EconDiagramPainter(
                              state: combined,
                              studentState: studentState,
                              diagramKind: widget.diagramKind,
                              selectedId: _selectedId,
                              language: widget.language,
                              trace: _trace,
                              traceReady: _areaTraceReady,
                              activeAreaAnchor: _activeAreaAnchor,
                              measureStart: _measureStart,
                              axisGuideStart: _axisGuideStart,
                              axisGuideCurrent: _axisGuideCurrent,
                            ),
                            child: const SizedBox.expand(),
                          );
                        },
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
          if (!_readOnly &&
              _selectedId != null &&
              !_tool.startsWith('area:')) ...[
            _selectedControls(),
          ],
          if (!_readOnly &&
              !_structured &&
              _tool.startsWith('area:') &&
              _areaTraceReady) ...[
            Container(
              padding: const EdgeInsets.all(10),
              decoration: const BoxDecoration(
                color: Color(0xFFF7F7F7),
                border: Border(top: BorderSide(color: Color(0xFFE5E5E5))),
              ),
              child: Wrap(
                spacing: 6,
                runSpacing: 6,
                alignment: WrapAlignment.center,
                children: [
                  for (final concept in _areaConcepts)
                    _ToolButton(
                      key: Key('econ-area-$concept'),
                      label: _label(concept),
                      symbol: _shortLabel(concept),
                      color: const Color(0xFF625BC5),
                      onPressed: () => _saveShade(concept),
                    ),
                  _SmallAction(
                    label: _english ? 'Cancel' : '取消',
                    onPressed: () => setState(() {
                      _trace.clear();
                      _areaTraceReady = false;
                      _areaTraceError = false;
                      _activeAreaAnchor = null;
                      _tool = 'select';
                    }),
                  ),
                ],
              ),
            ),
          ],
          if (!_readOnly && _structured && _tool.startsWith('area:')) ...[
            Container(
              padding: const EdgeInsets.all(9),
              decoration: const BoxDecoration(
                color: Color(0xFFF7F7F7),
                border: Border(top: BorderSide(color: Color(0xFFE5E5E5))),
              ),
              child: Row(
                children: [
                  _StatusBadge(label: '${_trace.length} / 3+'),
                  const SizedBox(width: 6),
                  _SmallAction(
                    label: _english ? 'Clear' : '清除',
                    onPressed: _trace.isEmpty
                        ? null
                        : () => setState(() => _trace.clear()),
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: _SmallAction(
                      label: _english ? 'Save area' : '儲存陰影',
                      onPressed: _trace.length < 3
                          ? null
                          : () => _saveShade(_tool.substring(5)),
                    ),
                  ),
                ],
              ),
            ),
          ],
          if (!_readOnly &&
              _tool.startsWith('area:') &&
              !_areaTraceReady &&
              _areaTraceError)
            Padding(
              padding: const EdgeInsets.only(top: 7),
              child: Text(
                _english
                    ? 'Drag across at least three intersections.'
                    : '請拖過至少三個交點。',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Color(0xFFBE4052),
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _demandSupplyToolbar() {
    final combined = mergeDiagramSource(widget.value, widget.sourceSeed);
    final hasDemand = combined.curves.any((curve) => curve.kind == 'demand');
    final supplies = combined.curves
        .where((curve) => curve.kind == 'supply' && !curve.quota)
        .toList();
    final hasSupply = supplies.isNotEmpty;
    final policyActive = combined.policy != null ||
        combined.curves.any((curve) => curve.policyShift != null);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _fixedToolRow([
          _ToolButton(
            key: const Key('econ-tool-demand'),
            label: _english ? 'Demand' : '需求',
            symbol: 'D',
            color: const Color(0xFF1CB0F6),
            onPressed: () => _addDemandSupply('demand'),
          ),
          _ToolButton(
            key: const Key('econ-tool-supply'),
            label: _english ? 'Supply' : '供應',
            symbol: 'S',
            color: const Color(0xFFFF4B4B),
            onPressed: policyActive && hasSupply
                ? null
                : () => _addDemandSupply('supply'),
          ),
          _ToolButton(
            key: const Key('econ-tool-shade'),
            label: _english ? 'Shade' : '陰影',
            icon: Icons.format_color_fill_rounded,
            color: const Color(0xFFA560E8),
            active: _tool.startsWith('area:'),
            onPressed: combined.curves.isEmpty || widget.value.areas.length >= 8
                ? null
                : () => _selectTool('area:${_areaConcepts.first}'),
          ),
        ]),
        _fixedToolRow([
          _ToolButton(
            label: _english ? 'Price ceiling' : '價格上限',
            symbol: 'PC',
            color: const Color(0xFFA560E8),
            onPressed: !hasDemand || !hasSupply
                ? null
                : () => _commit(_withSource(
                    (combined) => addMarketGap(combined, 'shortage'))),
          ),
          _ToolButton(
            label: _english ? 'Price floor' : '價格下限',
            symbol: 'PF',
            color: const Color(0xFFD9A600),
            onPressed: !hasDemand || !hasSupply
                ? null
                : () => _commit(_withSource(
                    (combined) => addMarketGap(combined, 'surplus'))),
          ),
        ], subtle: true),
        _fixedToolRow([
          _ToolButton(
            label: _english ? 'Per-unit tax' : '從量稅',
            symbol: 'S+T',
            color: const Color(0xFFD93B3B),
            onPressed: supplies.length != 1
                ? null
                : () => _commit(_withSource(
                    (combined) => addPolicySupplyShift(combined, 'tax'))),
          ),
          _ToolButton(
            label: _english ? 'Per-unit subsidy' : '從量津貼',
            symbol: 'S+SUB',
            color: const Color(0xFF43C000),
            onPressed: supplies.length != 1
                ? null
                : () => _commit(_withSource(
                    (combined) => addPolicySupplyShift(combined, 'subsidy'))),
          ),
        ], subtle: true),
      ],
    );
  }

  Widget _fixedToolRow(List<Widget> children, {bool subtle = false}) =>
      Container(
        decoration: BoxDecoration(
          color: subtle ? const Color(0xFFF7F7F7) : Colors.white,
          border: const Border(
            bottom: BorderSide(color: Color(0xFFE5E5E5)),
          ),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 6),
        child: SizedBox(
          height: 52,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              for (var index = 0; index < children.length; index++) ...[
                if (index > 0) const SizedBox(width: 6),
                Expanded(child: children[index]),
              ],
            ],
          ),
        ),
      );

  Widget _structuredToolbar() {
    final preset = structuredDiagramPresets[widget.diagramKind]!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Wrap(
          spacing: 6,
          runSpacing: 6,
          children: [
            for (final option in preset.curves)
              _ToolButton(
                key: Key('econ-tool-${option.concept}'),
                label: _label(option.concept),
                symbol: option.label,
                color: _structuredColor(option.concept),
                onPressed: () => _addStructured(option),
              ),
          ],
        ),
        if (_markerConcepts.isNotEmpty || _areaConcepts.isNotEmpty) ...[
          const SizedBox(height: 6),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              for (final concept in _markerConcepts)
                _ToolButton(
                  label: _label(concept),
                  icon: _isMeasure(concept)
                      ? Icons.straighten_rounded
                      : Icons.location_on_rounded,
                  color: const Color(0xFFC66A2B),
                  active: _tool ==
                      '${_isMeasure(concept) ? 'measure' : 'marker'}:$concept',
                  onPressed: () => _selectTool(
                      '${_isMeasure(concept) ? 'measure' : 'marker'}:$concept'),
                ),
              if (_areaConcepts.isNotEmpty)
                _ToolButton(
                  key: const Key('econ-structured-shade'),
                  label: _english ? 'Shade area' : '畫陰影',
                  icon: Icons.format_color_fill_rounded,
                  color: const Color(0xFF625BC5),
                  active: _tool.startsWith('area:'),
                  onPressed: () => _selectTool('area:${_areaConcepts.first}'),
                ),
            ],
          ),
          if (_tool.startsWith('area:')) ...[
            const SizedBox(height: 6),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: [
                for (final concept in _areaConcepts)
                  _SmallAction(
                    label: _label(concept),
                    onPressed: () => _selectAreaConcept(concept),
                  ),
              ],
            ),
          ],
        ],
      ],
    );
  }

  Widget _selectedControls() {
    final id = _selectedId!;
    final demandSupplyCurve =
        widget.value.curves.where((item) => item.id == id).firstOrNull;
    final structuredCurve = widget.value.structured?.curves
        .where((item) => item.id == id)
        .firstOrNull;
    return Container(
      constraints: const BoxConstraints(minHeight: 54),
      padding: const EdgeInsets.all(9),
      decoration: const BoxDecoration(
        color: Color(0xFFF7F7F7),
        border: Border(top: BorderSide(color: Color(0xFFE5E5E5))),
      ),
      child: Wrap(
        spacing: 6,
        runSpacing: 6,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          if (demandSupplyCurve != null) ...[
            _StatusBadge(label: diagramCurveDisplayLabel(demandSupplyCurve)),
            _SmallAction(
              label: _english ? 'Flatter' : '較平',
              onPressed: () => _commit(cycleCurveSlope(widget.value, id, -1)),
            ),
            _SmallAction(
              label: _english ? 'Steeper' : '較陡',
              onPressed: () => _commit(cycleCurveSlope(widget.value, id, 1)),
            ),
            if (demandSupplyCurve.kind == 'demand')
              for (final label in ['mb', 'mpb', 'msb'])
                _SmallAction(
                  label: label.toUpperCase(),
                  onPressed: () => _commit(updateDemandSupplyCurve(
                      widget.value, id,
                      displayLabel: label)),
                ),
            if (demandSupplyCurve.kind == 'supply') ...[
              for (final label in ['mc', 'mpc', 'msc'])
                _SmallAction(
                  label: label.toUpperCase(),
                  onPressed: () => _commit(updateDemandSupplyCurve(
                      widget.value, id,
                      displayLabel: label)),
                ),
              if (!demandSupplyCurve.quota)
                _SmallAction(
                  label: _english ? 'Quota' : '配額',
                  onPressed: () => _commit(addSupplyQuota(widget.value, id)),
                ),
            ],
          ],
          if (structuredCurve != null) ...[
            _StatusBadge(label: structuredCurve.label),
            _SmallAction(
              label: _english ? 'Flatter' : '較平',
              onPressed: () => _commit(updateStructuredCurveState(
                widget.value,
                id,
                steepness: structuredCurve.steepness - .2,
              )),
            ),
            _SmallAction(
              label: _english ? 'Steeper' : '較陡',
              onPressed: () => _commit(updateStructuredCurveState(
                widget.value,
                id,
                steepness: structuredCurve.steepness + .2,
              )),
            ),
          ],
          IconButton(
            key: const Key('econ-delete-selected'),
            tooltip: _english ? 'Delete selected object' : '刪除已選物件',
            onPressed: _deleteSelected,
            icon: const Icon(Icons.delete_outline_rounded),
            color: AppPalette.pink,
            visualDensity: VisualDensity.compact,
          ),
        ],
      ),
    );
  }

  bool _isMeasure(String concept) =>
      concept.contains('gap') ||
      concept == 'imports' ||
      concept == 'exports' ||
      concept == 'quota';

  String _label(String concept) {
    if (_english) return concept.replaceAll('-', ' ');
    const labels = {
      'ad': '總需求',
      'sras': '短期總供應',
      'lras': '長期總供應',
      'money-demand': '貨幣需求',
      'money-supply': '貨幣供應',
      'domestic-demand': '本地需求',
      'domestic-supply': '本地供應',
      'world-price': '世界價格',
      'tariff-price': '關稅後價格',
      'quota-supply': '配額供應',
      'demand': '需求',
      'mr': '邊際收益',
      'mc': '邊際成本',
      'ac': '平均成本',
      'ppf': '生產可能邊界',
      'cpf': '消費可能邊界',
      'trade-line': '貿易線',
      'tangent': '切線',
      'equilibrium': '均衡',
      'output': '產出',
      'price-level': '物價水平',
      'interest-rate': '利率',
      'quantity-of-money': '貨幣量',
      'domestic-production': '本地生產',
      'domestic-consumption': '本地消費',
      'imports': '進口量',
      'exports': '出口量',
      'monopoly-equilibrium': '壟斷均衡',
      'efficient-equilibrium': '有效率均衡',
      'production-point': '生產點',
      'consumption-point': '消費點',
      'deflationary-gap': '通縮差距',
      'inflationary-gap': '通脹差距',
      'tariff-revenue': '關稅收入',
      'quota-rent': '配額租值',
      'deadweight-loss': '效率損失',
      'consumer-surplus': '消費者盈餘',
      'producer-surplus': '生產者盈餘',
      'total-expenditure': '總支出',
      'profit': '利潤',
      'gains-from-trade': '貿易得益',
      'total-expenditure-increase': '總支出增加',
      'total-expenditure-decrease': '總支出減少',
      'buyer-tax-burden': '買家稅項負擔',
      'seller-tax-burden': '賣家稅項負擔',
      'buyer-subsidy-benefit': '買家津貼得益',
      'seller-subsidy-benefit': '賣家津貼得益',
      'total-subsidy': '政府津貼總額',
    };
    return labels[concept] ?? concept.replaceAll('-', ' ');
  }
}

class _EconDiagramPainter extends CustomPainter {
  const _EconDiagramPainter({
    required this.state,
    required this.studentState,
    required this.diagramKind,
    required this.selectedId,
    required this.language,
    required this.trace,
    required this.measureStart,
    required this.traceReady,
    required this.activeAreaAnchor,
    required this.axisGuideStart,
    required this.axisGuideCurrent,
  });

  final EconDiagramState state;
  final EconDiagramState studentState;
  final String diagramKind;
  final String? selectedId;
  final String language;
  final List<EconDiagramCoordinate> trace;
  final EconDiagramCoordinate? measureStart;
  final bool traceReady;
  final EconDiagramCoordinate? activeAreaAnchor;
  final EconDiagramCoordinate? axisGuideStart;
  final EconDiagramCoordinate? axisGuideCurrent;

  @override
  void paint(Canvas canvas, Size size) {
    final geometry = _DiagramGeometry.fromSize(size);
    canvas.drawRect(Offset.zero & size, Paint()..color = Colors.white);
    if (diagramKind == 'demand-supply') {
      _drawGrid(canvas, geometry);
      _drawAreas(canvas, geometry, state.areas);
      _drawAxes(canvas, geometry, state.axisX, state.axisY);
      for (final curve in state.curves) {
        _drawDemandSupplyCurve(canvas, geometry, curve, state.curves);
      }
      _drawDemandSupplyMovements(canvas, geometry);
      _drawGuideMovements(canvas, geometry);
      for (final equilibrium in state.equilibria) {
        final point = diagramEquilibriumCoordinate(state, equilibrium);
        if (point != null) {
          _drawGuide(canvas, geometry, point, 'P${equilibrium.labelIndex}',
              'Q${equilibrium.labelIndex}',
              label: 'E${equilibrium.labelIndex}',
              color: const Color(0xFF378F6B));
        }
      }
      for (final point in state.points) {
        final coordinate = diagramPointCoordinate(state, point);
        if (coordinate != null) {
          _drawGuide(
            canvas,
            geometry,
            coordinate,
            point.priceLabel ?? 'P${point.labelIndex}',
            point.quantityLabel ?? 'Q${point.labelIndex}',
            color: const Color(0xFFC66A2B),
          );
        }
      }
      for (final gap in state.marketGaps) {
        _drawGap(canvas, geometry, gap);
      }
      _drawStrokes(canvas, geometry, state.strokes);
    } else {
      final structured = state.structured;
      if (structured == null) return;
      _drawStructuredAreas(canvas, geometry, structured.areas);
      _drawAxes(canvas, geometry, structured.axisX, structured.axisY);
      for (final curve in structured.curves) {
        _drawStructuredCurve(canvas, geometry, curve, structured.curves);
      }
      _drawStructuredMovements(canvas, geometry, structured);
      for (final marker in structured.markers) {
        final coordinate = structuredMarkerCoordinateState(structured, marker);
        _drawGuide(
          canvas,
          geometry,
          coordinate,
          marker.verticalLabel ?? '',
          marker.horizontalLabel ?? '',
          label: marker.label,
          color: const Color(0xFFC66A2B),
        );
      }
      for (final measure in structured.measures) {
        _drawMeasure(canvas, geometry, measure);
      }
    }
    if (trace.isNotEmpty) {
      _drawTrace(canvas, geometry,
          closed: traceReady, active: activeAreaAnchor);
    }
    if (axisGuideStart != null && axisGuideCurrent != null) {
      _drawAxisGuideDraft(canvas, geometry, axisGuideStart!, axisGuideCurrent!);
    }
    if (measureStart != null) {
      final point = geometry.toOffset(measureStart!);
      canvas.drawCircle(point, 7, Paint()..color = const Color(0xFF625BC5));
    }
  }

  void _drawAxisGuideDraft(Canvas canvas, _DiagramGeometry geometry,
      EconDiagramCoordinate start, EconDiagramCoordinate current) {
    final y = geometry.y(start.price);
    final x = geometry.x(current.quantity);
    final isEquilibrium = state.curves
        .where((curve) => curve.kind == 'demand')
        .any((demand) => state.curves
            .where((curve) => curve.kind == 'supply')
            .map((supply) => demandSupplyIntersection(demand, supply))
            .whereType<EconDiagramCoordinate>()
            .any((point) =>
                (point.price - start.price).abs() <= .045 &&
                (point.quantity - current.quantity).abs() <= .085));
    final paint = Paint()
      ..color =
          isEquilibrium ? const Color(0xFF43C000) : const Color(0xFFC66A2B)
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round;
    _dashedLine(canvas, Offset(geometry.left, y), Offset(x, y), paint);
  }

  void _drawGrid(Canvas canvas, _DiagramGeometry geometry) {
    final paint = Paint()
      ..color = const Color(0xFFE8EEF0)
      ..strokeWidth = 1;
    for (final value in [.25, .5, .75]) {
      canvas.drawLine(Offset(geometry.x(value), geometry.top),
          Offset(geometry.x(value), geometry.bottom), paint);
      canvas.drawLine(Offset(geometry.left, geometry.y(value)),
          Offset(geometry.right, geometry.y(value)), paint);
    }
  }

  void _drawAxes(Canvas canvas, _DiagramGeometry geometry, String x, String y) {
    final paint = Paint()
      ..color = AppPalette.ink
      ..strokeWidth = 2.3
      ..strokeCap = StrokeCap.round;
    canvas.drawLine(Offset(geometry.left, geometry.bottom),
        Offset(geometry.right + 6, geometry.bottom), paint);
    canvas.drawLine(Offset(geometry.left, geometry.bottom),
        Offset(geometry.left, geometry.top - 6), paint);
    canvas.drawPath(
        Path()
          ..moveTo(geometry.right + 9, geometry.bottom)
          ..lineTo(geometry.right, geometry.bottom - 5)
          ..lineTo(geometry.right, geometry.bottom + 5)
          ..close(),
        Paint()..color = AppPalette.ink);
    canvas.drawPath(
        Path()
          ..moveTo(geometry.left, geometry.top - 9)
          ..lineTo(geometry.left - 5, geometry.top)
          ..lineTo(geometry.left + 5, geometry.top)
          ..close(),
        Paint()..color = AppPalette.ink);
    _drawText(canvas, x, Offset(geometry.right - 3, geometry.bottom + 18),
        color: AppPalette.ink, size: 12);
    _drawText(canvas, y, Offset(geometry.left - 12, geometry.top - 2),
        color: AppPalette.ink, size: 12);
  }

  void _drawDemandSupplyCurve(Canvas canvas, _DiagramGeometry geometry,
      EconDiagramCurve curve, List<EconDiagramCurve> relatedCurves) {
    final source = curve.id.startsWith('source-');
    final color = source
        ? AppPalette.muted
        : curve.kind == 'demand'
            ? const Color(0xFF2B70C9)
            : const Color(0xFFD93B3B);
    final path = Path();
    final segments = _curveVisibleSegments(curve, relatedCurves);
    for (final segment in segments) {
      final start = geometry.toOffset(segment.start);
      final end = geometry.toOffset(segment.end);
      path
        ..moveTo(start.dx, start.dy)
        ..lineTo(end.dx, end.dy);
    }
    if (curve.id == selectedId) {
      canvas.drawPath(
          path,
          Paint()
            ..color = color.withValues(alpha: .18)
            ..style = PaintingStyle.stroke
            ..strokeWidth = 10);
    }
    canvas.drawPath(
        path,
        Paint()
          ..color = color
          ..style = PaintingStyle.stroke
          ..strokeWidth = 3.4
          ..strokeCap = StrokeCap.round);
    final labelAnchor = segments.isEmpty
        ? const EconDiagramCoordinate(quantity: .86, price: .5)
        : segments.last.end;
    final quantity = labelAnchor.quantity;
    final price = labelAnchor.price;
    _drawText(canvas, diagramCurveDisplayLabel(curve),
        Offset(geometry.x(quantity) + 4, geometry.y(price) - 8),
        color: color, size: 12);
  }

  void _drawStructuredCurve(
    Canvas canvas,
    _DiagramGeometry geometry,
    EconStructuredCurve curve,
    List<EconStructuredCurve> relatedCurves,
  ) {
    final source = curve.id.startsWith('source-');
    final color = source ? AppPalette.muted : _structuredColor(curve.concept);
    final points = structuredCurvePoints(curve, 48, relatedCurves);
    final path = Path();
    for (var index = 0; index < points.length; index++) {
      final point = geometry.toOffset(points[index]);
      index == 0
          ? path.moveTo(point.dx, point.dy)
          : path.lineTo(point.dx, point.dy);
    }
    if (curve.id == selectedId) {
      canvas.drawPath(
          path,
          Paint()
            ..color = color.withValues(alpha: .18)
            ..style = PaintingStyle.stroke
            ..strokeWidth = 10);
    }
    canvas.drawPath(
        path,
        Paint()
          ..color = color
          ..style = PaintingStyle.stroke
          ..strokeWidth = 3.4
          ..strokeCap = StrokeCap.round);
    final anchor = points[(points.length * .84).floor()];
    _drawText(
        canvas, curve.label, geometry.toOffset(anchor) + const Offset(5, -8),
        color: color, size: 12);
  }

  void _drawGuide(
    Canvas canvas,
    _DiagramGeometry geometry,
    EconDiagramCoordinate point,
    String priceLabel,
    String quantityLabel, {
    String? label,
    required Color color,
  }) {
    final center = geometry.toOffset(point);
    final dash = Paint()
      ..color = color
      ..strokeWidth = 1.6;
    _dashedLine(canvas, Offset(geometry.left, center.dy), center, dash);
    _dashedLine(canvas, center, Offset(center.dx, geometry.bottom), dash);
    canvas.drawCircle(center, 5, Paint()..color = color);
    if (priceLabel.isNotEmpty) {
      _drawText(canvas, priceLabel, Offset(geometry.left - 28, center.dy - 7),
          color: color, size: 10);
    }
    if (quantityLabel.isNotEmpty) {
      _drawText(
          canvas, quantityLabel, Offset(center.dx - 7, geometry.bottom + 5),
          color: color, size: 10);
    }
    if (label != null && label.isNotEmpty) {
      _drawText(canvas, label, center + const Offset(7, -14),
          color: color, size: 11);
    }
  }

  void _drawDemandSupplyMovements(Canvas canvas, _DiagramGeometry geometry) {
    final concepts = state.curves
        .where((curve) => !curve.id.startsWith('source-'))
        .map((curve) => curve.concept ?? curve.kind)
        .toSet();
    for (final concept in concepts) {
      final peers = state.curves
          .where((curve) => (curve.concept ?? curve.kind) == concept)
          .toList();
      for (var index = 1; index < peers.length; index++) {
        final from = peers[index - 1];
        final to = peers[index];
        final policy = from.policyShift ?? to.policyShift;
        if (policy != null) {
          const quantity = .5;
          final start = geometry.toOffset(EconDiagramCoordinate(
              quantity: quantity,
              price: demandSupplyPriceAt(from, quantity).clamp(0, 1)));
          final end = geometry.toOffset(EconDiagramCoordinate(
              quantity: quantity,
              price: demandSupplyPriceAt(to, quantity).clamp(0, 1)));
          _drawMovementArrow(canvas, start, end,
              label: policy == 'tax' ? '從量稅' : '從量津貼');
        } else {
          final delta = to.position - from.position;
          final price =
              ((demandSupplyPriceAt(from, .5) + demandSupplyPriceAt(to, .5)) /
                      2)
                  .clamp(.12, .88);
          final start = geometry.toOffset(EconDiagramCoordinate(
              quantity: delta >= 0 ? .40 : .60, price: price));
          final end = geometry.toOffset(EconDiagramCoordinate(
              quantity: delta >= 0 ? .60 : .40, price: price));
          _drawMovementArrow(canvas, start, end, label: '');
        }
      }
    }
  }

  void _drawGuideMovements(Canvas canvas, _DiagramGeometry geometry) {
    for (final movement in econGuideMovements(state, studentState)) {
      final from = movement.from;
      final to = movement.to;
      final lane = movement.lane;
      if ((to.price - from.price).abs() > .015) {
        final x = (geometry.left - 40 - lane * 8)
            .clamp(5.0, geometry.left - 8)
            .toDouble();
        _drawMovementArrow(
          canvas,
          Offset(x, geometry.y(from.price)),
          Offset(x, geometry.y(to.price)),
          label: '',
        );
      }
      if ((to.quantity - from.quantity).abs() > .015) {
        final y = (geometry.bottom + 26 + lane * 8)
            .clamp(geometry.bottom + 18, geometry.bottom + 38)
            .toDouble();
        _drawMovementArrow(
          canvas,
          Offset(geometry.x(from.quantity), y),
          Offset(geometry.x(to.quantity), y),
          label: '',
        );
      }
    }
    for (final movement in econMarketGapGuideMovements(state, studentState)) {
      final from = movement.from;
      final to = movement.to;
      final lane = movement.lane;
      if ((to.price - from.price).abs() > .015) {
        final x = (geometry.left - 40 - lane * 8)
            .clamp(5.0, geometry.left - 8)
            .toDouble();
        _drawMovementArrow(
          canvas,
          Offset(x, geometry.y(from.price)),
          Offset(x, geometry.y(to.price)),
          label: '',
        );
      }
      if ((to.demandQuantity - from.demandQuantity).abs() > .015) {
        final y = geometry.bottom + 23 + lane * 6;
        _drawMovementArrow(
          canvas,
          Offset(geometry.x(from.demandQuantity), y),
          Offset(geometry.x(to.demandQuantity), y),
          label: '',
        );
      }
      if ((to.supplyQuantity - from.supplyQuantity).abs() > .015) {
        final y = geometry.bottom + 31 + lane * 6;
        _drawMovementArrow(
          canvas,
          Offset(geometry.x(from.supplyQuantity), y),
          Offset(geometry.x(to.supplyQuantity), y),
          label: '',
        );
      }
    }
  }

  void _drawStructuredMovements(Canvas canvas, _DiagramGeometry geometry,
      EconStructuredDiagramState structured) {
    for (final concept in structured.curves
        .where((curve) => !curve.id.startsWith('source-'))
        .map((curve) => curve.concept)
        .toSet()) {
      final peers =
          structured.curves.where((curve) => curve.concept == concept).toList();
      for (var index = 1; index < peers.length; index++) {
        final fromPoints =
            structuredCurvePoints(peers[index - 1], 48, structured.curves);
        final toPoints =
            structuredCurvePoints(peers[index], 48, structured.curves);
        _drawMovementArrow(
          canvas,
          geometry.toOffset(fromPoints[(fromPoints.length * .25).floor()]),
          geometry.toOffset(toPoints[(toPoints.length * .25).floor()]),
          label: '${peers[index - 1].label}→${peers[index].label}',
        );
      }
    }
  }

  void _drawMovementArrow(Canvas canvas, Offset start, Offset end,
      {required String label}) {
    if ((end - start).distance < 5) return;
    final paint = Paint()
      ..color = AppPalette.ink
      ..strokeWidth = 1.8
      ..strokeCap = StrokeCap.round;
    canvas.drawLine(start, end, paint);
    final angle = math.atan2(end.dy - start.dy, end.dx - start.dx);
    const arrow = 7.0;
    canvas.drawLine(
      end,
      end - Offset(math.cos(angle - .55), math.sin(angle - .55)) * arrow,
      paint,
    );
    canvas.drawLine(
      end,
      end - Offset(math.cos(angle + .55), math.sin(angle + .55)) * arrow,
      paint,
    );
    if (label.isNotEmpty) {
      _drawText(canvas, label,
          Offset((start.dx + end.dx) / 2 + 3, (start.dy + end.dy) / 2 - 12),
          color: AppPalette.ink, size: 8);
    }
  }

  void _drawGap(
      Canvas canvas, _DiagramGeometry geometry, EconDiagramMarketGap gap) {
    final gapGeometry = marketGapGeometry(state, gap);
    if (gapGeometry == null) return;
    final color = gap.kind == 'shortage'
        ? const Color(0xFF625BC5)
        : const Color(0xFFB57B00);
    final y = geometry.y(gap.pricePosition);
    final demandX = geometry.x(gapGeometry.demandQuantity);
    final supplyX = geometry.x(gapGeometry.supplyQuantity);
    final leftX = math.min(demandX, supplyX);
    final rightX = math.max(demandX, supplyX);
    final policy = gap.policyKind != null;
    final linePaint = Paint()
      ..color = policy ? color : AppPalette.muted
      ..strokeWidth = policy ? 3 : 1.5;
    if (policy) {
      canvas.drawLine(
          Offset(geometry.left, y), Offset(geometry.right, y), linePaint);
    } else {
      _dashedLine(
          canvas, Offset(geometry.left, y), Offset(rightX, y), linePaint);
    }
    final policyLabel = gap.policyKind == 'ceiling'
        ? 'Pc${gap.labelIndex}'
        : gap.policyKind == 'floor'
            ? 'Pf${gap.labelIndex}'
            : 'P${gap.labelIndex}';
    _drawText(
      canvas,
      policyLabel,
      policy
          ? Offset(geometry.right + 4, y - 7)
          : Offset(geometry.left - 28, y - 7),
      color: policy ? color : AppPalette.ink,
      size: policy ? 11 : 12,
    );
    if (!gap.quantitiesMarked) return;
    if (policy && gap.guideLabelIndex != null) {
      _drawText(
          canvas, 'P${gap.guideLabelIndex}', Offset(geometry.left - 28, y - 7),
          color: AppPalette.ink, size: 12);
    }
    final validPolicy = !policy ||
        (gap.policyKind == 'ceiling' &&
            gapGeometry.relativeToEquilibrium == 'below' &&
            gapGeometry.actualKind == 'shortage') ||
        (gap.policyKind == 'floor' &&
            gapGeometry.relativeToEquilibrium == 'above' &&
            gapGeometry.actualKind == 'surplus');
    if (validPolicy) {
      final rangeY = math.max(geometry.top + 14, y - 10);
      final rangePaint = Paint()
        ..color = color
        ..strokeWidth = 2;
      canvas
        ..drawLine(Offset(leftX, rangeY), Offset(rightX, rangeY), rangePaint)
        ..drawLine(
            Offset(leftX, rangeY - 4), Offset(leftX, rangeY + 4), rangePaint)
        ..drawLine(
            Offset(rightX, rangeY - 4), Offset(rightX, rangeY + 4), rangePaint);
      final sameKind = state.marketGaps.where((candidate) {
        final candidateGeometry = marketGapGeometry(state, candidate);
        return candidateGeometry?.actualKind == gapGeometry.actualKind;
      }).toList();
      final kindLabel = language == 'zh'
          ? (gapGeometry.actualKind == 'shortage' ? '短缺' : '盈餘')
          : (gapGeometry.actualKind == 'shortage' ? 'SHORTAGE' : 'SURPLUS');
      _drawText(
          canvas,
          sameKind.length > 1
              ? '$kindLabel ${sameKind.indexOf(gap) + 1}'
              : kindLabel,
          Offset((leftX + rightX) / 2 - 25,
              math.max(geometry.top + 5, rangeY - 17)),
          color: color,
          size: 9);
    }
    final marked =
        state.marketGaps.where((item) => item.quantitiesMarked).toList();
    final markedIndex = marked.indexWhere((item) => item.id == gap.id);
    final suffix =
        marked.length > 1 && markedIndex >= 0 ? '${markedIndex + 1}' : '';
    final guidePaint = Paint()
      ..color = policy ? color : AppPalette.muted
      ..strokeWidth = 1.5;
    _dashedLine(canvas, Offset(demandX, y + 7),
        Offset(demandX, geometry.bottom), guidePaint);
    _dashedLine(canvas, Offset(supplyX, y + 7),
        Offset(supplyX, geometry.bottom), guidePaint);
    _drawText(canvas, 'Qd$suffix', Offset(demandX - 7, geometry.bottom + 5),
        color: policy ? color : AppPalette.ink, size: 10);
    _drawText(canvas, 'Qs$suffix', Offset(supplyX - 7, geometry.bottom + 5),
        color: policy ? color : AppPalette.ink, size: 10);
  }

  void _drawAreas(
      Canvas canvas, _DiagramGeometry geometry, List<EconDiagramArea> areas) {
    for (var areaIndex = 0; areaIndex < areas.length; areaIndex++) {
      final area = areas[areaIndex];
      if (area.points.length < 3) continue;
      final path = Path();
      for (var index = 0; index < area.points.length; index++) {
        final point = geometry.toOffset(area.points[index]);
        index == 0
            ? path.moveTo(point.dx, point.dy)
            : path.lineTo(point.dx, point.dy);
      }
      path.close();
      final color = _areaColor(area.kind, areaIndex);
      canvas.drawPath(
          path,
          Paint()
            ..color = color.withValues(alpha: .24)
            ..style = PaintingStyle.fill);
      canvas.drawPath(
          path,
          Paint()
            ..color = color.withValues(alpha: .75)
            ..style = PaintingStyle.stroke
            ..strokeWidth = 1.8);
      final centre = area.points.fold(
        const EconDiagramCoordinate(quantity: 0, price: 0),
        (sum, point) => EconDiagramCoordinate(
          quantity: sum.quantity + point.quantity / area.points.length,
          price: sum.price + point.price / area.points.length,
        ),
      );
      final sameKind =
          areas.where((candidate) => candidate.kind == area.kind).toList();
      final label = econNumberedAreaLabel(
        _shortLabel(area.kind),
        sameKind.indexOf(area) + 1,
        sameKind.length,
      );
      _drawText(canvas, label, geometry.toOffset(centre) + const Offset(-8, -6),
          color: color, size: 11);
    }
  }

  void _drawStructuredAreas(Canvas canvas, _DiagramGeometry geometry,
      List<EconStructuredArea> areas) {
    for (var areaIndex = 0; areaIndex < areas.length; areaIndex++) {
      final area = areas[areaIndex];
      if (area.points.length < 3) continue;
      final path = Path();
      for (var index = 0; index < area.points.length; index++) {
        final point = geometry.toOffset(area.points[index]);
        index == 0
            ? path.moveTo(point.dx, point.dy)
            : path.lineTo(point.dx, point.dy);
      }
      path.close();
      canvas.drawPath(
          path,
          Paint()
            ..color = _areaColor(area.concept, areaIndex).withValues(alpha: .24)
            ..style = PaintingStyle.fill);
      final centre = area.points.fold(
        const EconDiagramCoordinate(quantity: 0, price: 0),
        (sum, point) => EconDiagramCoordinate(
          quantity: sum.quantity + point.quantity / area.points.length,
          price: sum.price + point.price / area.points.length,
        ),
      );
      final sameConcept = areas
          .where((candidate) => candidate.concept == area.concept)
          .toList();
      final label = econNumberedAreaLabel(
        _shortLabel(area.concept),
        sameConcept.indexOf(area) + 1,
        sameConcept.length,
      );
      _drawText(
        canvas,
        label,
        geometry.toOffset(centre) + const Offset(-8, -6),
        color: _areaColor(area.concept, areaIndex),
        size: 11,
      );
    }
  }

  void _drawStrokes(Canvas canvas, _DiagramGeometry geometry,
      List<EconDiagramStroke> strokes) {
    for (final stroke in strokes) {
      if (stroke.points.isEmpty) continue;
      final path = Path();
      for (var index = 0; index < stroke.points.length; index++) {
        final point = geometry.toOffset(stroke.points[index]);
        index == 0
            ? path.moveTo(point.dx, point.dy)
            : path.lineTo(point.dx, point.dy);
      }
      if (stroke.kind == 'shade') path.close();
      canvas.drawPath(
          path,
          Paint()
            ..color = const Color(0xFF625BC5)
            ..style = stroke.kind == 'shade'
                ? PaintingStyle.fill
                : PaintingStyle.stroke
            ..strokeWidth = 2);
    }
  }

  void _drawMeasure(
      Canvas canvas, _DiagramGeometry geometry, EconStructuredMeasure measure) {
    final start = geometry.toOffset(measure.start);
    final end = geometry.toOffset(measure.end);
    final paint = Paint()
      ..color = const Color(0xFF625BC5)
      ..strokeWidth = 3;
    canvas.drawLine(start, end, paint);
    _drawText(canvas, measure.label,
        Offset((start.dx + end.dx) / 2, (start.dy + end.dy) / 2 - 13),
        color: const Color(0xFF625BC5), size: 11);
  }

  void _drawTrace(Canvas canvas, _DiagramGeometry geometry,
      {bool closed = false, EconDiagramCoordinate? active}) {
    final path = Path();
    for (var index = 0; index < trace.length; index++) {
      final point = geometry.toOffset(trace[index]);
      index == 0
          ? path.moveTo(point.dx, point.dy)
          : path.lineTo(point.dx, point.dy);
    }
    if (closed) {
      path.close();
      canvas.drawPath(
          path,
          Paint()
            ..color = const Color(0xFF625BC5).withValues(alpha: .16)
            ..style = PaintingStyle.fill);
    }
    if (closed) {
      canvas.drawPath(
          path,
          Paint()
            ..color = const Color(0xFF625BC5)
            ..style = PaintingStyle.stroke
            ..strokeWidth = 3
            ..strokeCap = StrokeCap.round);
    }
    for (final coordinate in trace) {
      final point = geometry.toOffset(coordinate);
      final highlighted =
          active != null && _distance(active, coordinate) < .001;
      canvas.drawCircle(
          point, highlighted ? 8 : 6, Paint()..color = Colors.white);
      canvas.drawCircle(
          point,
          highlighted ? 6 : 4,
          Paint()
            ..color = const Color(0xFF4B4B4B)
                .withValues(alpha: highlighted ? .9 : .55));
    }
  }

  void _dashedLine(Canvas canvas, Offset start, Offset end, Paint paint) {
    final length = (end - start).distance;
    if (length == 0) return;
    final direction = (end - start) / length;
    for (var travelled = 0.0; travelled < length; travelled += 8) {
      canvas.drawLine(start + direction * travelled,
          start + direction * math.min(travelled + 4, length), paint);
    }
  }

  void _drawText(Canvas canvas, String text, Offset offset,
      {required Color color, required double size}) {
    final painter = TextPainter(
      text: TextSpan(
        text: text,
        style: TextStyle(
          color: color,
          fontSize: size,
          fontWeight: FontWeight.w900,
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout(maxWidth: 120);
    painter.paint(canvas, offset);
  }

  @override
  bool shouldRepaint(covariant _EconDiagramPainter oldDelegate) =>
      oldDelegate.state != state ||
      oldDelegate.selectedId != selectedId ||
      oldDelegate.trace.length != trace.length ||
      oldDelegate.traceReady != traceReady ||
      oldDelegate.activeAreaAnchor != activeAreaAnchor ||
      oldDelegate.measureStart != measureStart ||
      oldDelegate.axisGuideStart != axisGuideStart ||
      oldDelegate.axisGuideCurrent != axisGuideCurrent;
}

class _DiagramGeometry {
  const _DiagramGeometry(this.left, this.top, this.right, this.bottom);

  final double left;
  final double top;
  final double right;
  final double bottom;

  factory _DiagramGeometry.fromSize(Size size) => _DiagramGeometry(
        54,
        25,
        size.width - 28,
        size.height - 42,
      );

  double x(double quantity) => left + quantity.clamp(0, 1) * (right - left);
  double y(double price) => bottom - price.clamp(0, 1) * (bottom - top);

  Offset toOffset(EconDiagramCoordinate point) =>
      Offset(x(point.quantity), y(point.price));

  EconDiagramCoordinate fromOffset(Offset point) => EconDiagramCoordinate(
        quantity: ((point.dx - left) / (right - left)).clamp(0, 1),
        price: ((bottom - point.dy) / (bottom - top)).clamp(0, 1),
      );
}

class _HeaderButton extends StatelessWidget {
  const _HeaderButton({
    required this.icon,
    required this.label,
    required this.onPressed,
  });

  final IconData icon;
  final String label;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) => IconButton(
        tooltip: label,
        onPressed: onPressed,
        icon: Icon(icon, size: 19),
        color: EconPalette.primaryDark,
        disabledColor: AppPalette.border,
        visualDensity: VisualDensity.compact,
        constraints: const BoxConstraints.tightFor(width: 32, height: 32),
        padding: EdgeInsets.zero,
      );
}

class _ToolButton extends StatelessWidget {
  const _ToolButton({
    super.key,
    required this.label,
    required this.color,
    required this.onPressed,
    this.symbol,
    this.icon,
    this.active = false,
  });

  final String label;
  final String? symbol;
  final IconData? icon;
  final Color color;
  final VoidCallback? onPressed;
  final bool active;

  @override
  Widget build(BuildContext context) => OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          foregroundColor: active ? Colors.white : color,
          backgroundColor: active ? color : color.withValues(alpha: .12),
          side: BorderSide(color: color, width: 1.6),
          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
          minimumSize: const Size(0, 52),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(7)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon == null)
              Text(symbol ?? '',
                  maxLines: 1,
                  style: const TextStyle(
                      fontSize: 16, fontWeight: FontWeight.w900))
            else
              Icon(icon, size: 18),
            const SizedBox(height: 1),
            FittedBox(
              fit: BoxFit.scaleDown,
              child: Text(label,
                  maxLines: 1,
                  style: const TextStyle(
                      fontSize: 10, fontWeight: FontWeight.w900)),
            ),
          ],
        ),
      );
}

class _SmallAction extends StatelessWidget {
  const _SmallAction({required this.label, required this.onPressed});

  final String label;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) => TextButton(
        onPressed: onPressed,
        style: TextButton.styleFrom(
          foregroundColor: EconPalette.primaryDark,
          backgroundColor: EconPalette.softPrimary,
          minimumSize: const Size(0, 32),
          padding: const EdgeInsets.symmetric(horizontal: 10),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(7)),
        ),
        child: Text(label,
            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900)),
      );
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
        decoration: BoxDecoration(
          color: EconPalette.softPrimary,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: EconPalette.primary),
        ),
        child: Text(label,
            style: const TextStyle(
              color: EconPalette.primaryDark,
              fontSize: 9,
              fontWeight: FontWeight.w900,
            )),
      );
}

class _DiagramSegment {
  const _DiagramSegment(this.start, this.end);

  final EconDiagramCoordinate start;
  final EconDiagramCoordinate end;
}

class _ConditionalPanGestureRecognizer extends PanGestureRecognizer {
  bool Function(PointerEvent event)? canStart;

  @override
  bool isPointerAllowed(PointerEvent event) {
    if (!(canStart?.call(event) ?? false)) return false;
    return super.isPointerAllowed(event);
  }
}

Map<String, _DiagramSegment> _demandSupplyBoundaries(EconDiagramState state) {
  final boundaries = <String, _DiagramSegment>{
    'axis-x': const _DiagramSegment(
      EconDiagramCoordinate(quantity: 0, price: 0),
      EconDiagramCoordinate(quantity: 1, price: 0),
    ),
    'axis-y': const _DiagramSegment(
      EconDiagramCoordinate(quantity: 0, price: 0),
      EconDiagramCoordinate(quantity: 0, price: 1),
    ),
  };
  for (final curve in state.curves) {
    final segments = _curveRenderSegments(curve, state.curves);
    for (var index = 0; index < segments.length; index++) {
      boundaries['curve:${curve.id}:$index'] = segments[index];
    }
  }
  final guides = <({String id, EconDiagramCoordinate? coordinate})>[
    for (final point in state.points)
      (id: point.id, coordinate: diagramPointCoordinate(state, point)),
    for (final equilibrium in state.equilibria)
      (
        id: equilibrium.id,
        coordinate: diagramEquilibriumCoordinate(state, equilibrium)
      ),
  ];
  for (final guide in guides) {
    final coordinate = guide.coordinate;
    if (coordinate == null) continue;
    boundaries
      ..['guide:${guide.id}:h'] = _DiagramSegment(
          EconDiagramCoordinate(quantity: 0, price: coordinate.price),
          coordinate)
      ..['guide:${guide.id}:v'] = _DiagramSegment(coordinate,
          EconDiagramCoordinate(quantity: coordinate.quantity, price: 0));
  }
  for (final gap in state.marketGaps) {
    final geometry = marketGapGeometry(state, gap);
    if (geometry == null) continue;
    final left = math.min(geometry.demandQuantity, geometry.supplyQuantity);
    final right = math.max(geometry.demandQuantity, geometry.supplyQuantity);
    boundaries
      ..['gap:${gap.id}:h'] = _DiagramSegment(
        EconDiagramCoordinate(quantity: 0, price: geometry.price),
        EconDiagramCoordinate(quantity: right, price: geometry.price),
      )
      ..['gap:${gap.id}:left'] = _DiagramSegment(
        EconDiagramCoordinate(quantity: left, price: 0),
        EconDiagramCoordinate(quantity: left, price: geometry.price),
      )
      ..['gap:${gap.id}:right'] = _DiagramSegment(
        EconDiagramCoordinate(quantity: right, price: 0),
        EconDiagramCoordinate(quantity: right, price: geometry.price),
      );
  }
  return boundaries;
}

Map<String, _DiagramSegment> _structuredBoundaries(
    EconStructuredDiagramState? state) {
  final boundaries = <String, _DiagramSegment>{
    'axis-x': const _DiagramSegment(
      EconDiagramCoordinate(quantity: 0, price: 0),
      EconDiagramCoordinate(quantity: 1, price: 0),
    ),
    'axis-y': const _DiagramSegment(
      EconDiagramCoordinate(quantity: 0, price: 0),
      EconDiagramCoordinate(quantity: 0, price: 1),
    ),
  };
  if (state == null) return boundaries;
  for (final curve in state.curves) {
    final points = structuredCurvePoints(curve, 96, state.curves);
    for (var index = 1; index < points.length; index++) {
      boundaries['curve:${curve.id}:${index - 1}'] =
          _DiagramSegment(points[index - 1], points[index]);
    }
  }
  for (final marker in state.markers) {
    final coordinate = EconDiagramCoordinate(
      quantity: marker.quantityPosition,
      price: marker.pricePosition,
    );
    boundaries
      ..['guide:${marker.id}:h'] = _DiagramSegment(
          EconDiagramCoordinate(quantity: 0, price: coordinate.price),
          coordinate)
      ..['guide:${marker.id}:v'] = _DiagramSegment(coordinate,
          EconDiagramCoordinate(quantity: coordinate.quantity, price: 0));
  }
  for (final measure in state.measures) {
    boundaries['measure:${measure.id}'] =
        _DiagramSegment(measure.start, measure.end);
  }
  return boundaries;
}

String _baseBoundaryId(String id) {
  if (!id.startsWith('curve:')) return id;
  final lastSeparator = id.lastIndexOf(':');
  return lastSeparator <= 'curve:'.length ? id : id.substring(0, lastSeparator);
}

List<EconDiagramCoordinate> _resolveAreaAnchors(
  List<EconDiagramCoordinate> fallbackPoints,
  List<({List<String> boundaryIds, EconDiagramCoordinate fallback})> anchors,
  Map<String, _DiagramSegment> boundaries,
) {
  if (anchors.length != fallbackPoints.length) return fallbackPoints;
  final resolved = <EconDiagramCoordinate>[];
  for (var index = 0; index < anchors.length; index++) {
    final anchor = anchors[index];
    final segments = anchor.boundaryIds
        .expand((id) => id.startsWith('curve:')
            ? boundaries.entries
                .where((entry) => _baseBoundaryId(entry.key) == id)
                .map((entry) => entry.value)
            : [boundaries[id]].whereType<_DiagramSegment>())
        .toList();
    final candidates = <EconDiagramCoordinate>[];
    for (var first = 0; first < segments.length; first++) {
      for (var second = first + 1; second < segments.length; second++) {
        final intersection =
            _segmentIntersection(segments[first], segments[second]);
        if (intersection != null) candidates.add(intersection);
      }
    }
    if (candidates.isEmpty) {
      candidates.addAll(segments
          .map((segment) => _projectToSegment(anchor.fallback, segment)));
    }
    candidates.sort((left, right) => _distance(left, anchor.fallback)
        .compareTo(_distance(right, anchor.fallback)));
    resolved.add(candidates.isEmpty ? fallbackPoints[index] : candidates.first);
  }
  return resolved;
}

EconDiagramCoordinate _projectToSegment(
    EconDiagramCoordinate point, _DiagramSegment segment) {
  final quantity = segment.end.quantity - segment.start.quantity;
  final price = segment.end.price - segment.start.price;
  final lengthSquared = quantity * quantity + price * price;
  if (lengthSquared < .000001) return segment.start;
  final progress = (((point.quantity - segment.start.quantity) * quantity +
              (point.price - segment.start.price) * price) /
          lengthSquared)
      .clamp(0.0, 1.0);
  return EconDiagramCoordinate(
    quantity: segment.start.quantity + quantity * progress,
    price: segment.start.price + price * progress,
  );
}

List<_DiagramSegment> _curveRenderSegments(
    EconDiagramCurve curve, List<EconDiagramCurve> relatedCurves) {
  final baseSegment = _curveSegment(curve);
  if (curve.quotaBaseCurveId != null && curve.shape == 'vertical') {
    final base = relatedCurves
        .where((candidate) => candidate.id == curve.quotaBaseCurveId)
        .firstOrNull;
    if (base != null) {
      final quantity = baseSegment.start.quantity;
      final price = demandSupplyPriceAt(base, quantity).clamp(0.0, .92);
      return [
        _DiagramSegment(
          EconDiagramCoordinate(quantity: quantity, price: price),
          EconDiagramCoordinate(quantity: quantity, price: 1),
        ),
      ];
    }
  }
  return [baseSegment];
}

List<_DiagramSegment> _curveVisibleSegments(
    EconDiagramCurve curve, List<EconDiagramCurve> relatedCurves) {
  return _curveRenderSegments(curve, relatedCurves).map((segment) {
    final start = segment.start;
    final end = segment.end;
    if (curve.shape == 'vertical') {
      final bottom = start.price <= end.price ? start : end;
      final top = start.price <= end.price ? end : start;
      final visibleTop = EconDiagramCoordinate(
        quantity: top.quantity,
        price: math.max(bottom.price + .025, math.min(top.price, .92)),
      );
      return start.price <= end.price
          ? _DiagramSegment(bottom, visibleTop)
          : _DiagramSegment(visibleTop, bottom);
    }
    final policyFamily = curve.kind == 'supply' &&
        relatedCurves.any((candidate) =>
            candidate.kind == 'supply' && candidate.policyShift != null);
    if (policyFamily) {
      const quantity = .69;
      final visibleEnd = EconDiagramCoordinate(
        quantity: quantity,
        price: demandSupplyPriceAt(curve, quantity).clamp(.08, .92),
      );
      return start.quantity <= end.quantity
          ? _DiagramSegment(start, visibleEnd)
          : _DiagramSegment(visibleEnd, start);
    }
    final span = (end.quantity - start.quantity).abs();
    final progress =
        span > .0001 ? (1 - .075 / span).clamp(.72, .92).toDouble() : .92;
    return _DiagramSegment(
      start,
      EconDiagramCoordinate(
        quantity: start.quantity + (end.quantity - start.quantity) * progress,
        price: start.price + (end.price - start.price) * progress,
      ),
    );
  }).toList();
}

_DiagramSegment _curveSegment(EconDiagramCurve curve) {
  if (curve.shape == 'horizontal') {
    final price = (.5 + curve.position * .26).clamp(.04, .96).toDouble();
    return _DiagramSegment(
      EconDiagramCoordinate(quantity: 0, price: price),
      EconDiagramCoordinate(quantity: 1, price: price),
    );
  }
  if (curve.shape == 'vertical') {
    final quantity = (.5 + curve.position * .26).clamp(.04, .96).toDouble();
    return _DiagramSegment(
      EconDiagramCoordinate(quantity: quantity, price: 0),
      EconDiagramCoordinate(quantity: quantity, price: 1),
    );
  }
  final slope = (curve.kind == 'demand' ? -1 : 1) * curve.steepness;
  final centre =
      .5 + (curve.shiftAxis == 'vertical' ? 0 : curve.position * .26);
  final offset = curve.shiftAxis == 'vertical' ? curve.position * .26 : 0;
  final intercept = .5 + offset - slope * centre;
  final candidates = <EconDiagramCoordinate>[
    EconDiagramCoordinate(quantity: 0, price: intercept),
    EconDiagramCoordinate(quantity: 1, price: slope + intercept),
    if (slope.abs() > .0001)
      EconDiagramCoordinate(quantity: -intercept / slope, price: 0),
    if (slope.abs() > .0001)
      EconDiagramCoordinate(quantity: (1 - intercept) / slope, price: 1),
  ]
      .where((point) =>
          point.quantity >= 0 &&
          point.quantity <= 1 &&
          point.price >= 0 &&
          point.price <= 1)
      .toList()
    ..sort((left, right) => left.quantity.compareTo(right.quantity));
  if (candidates.length >= 2) {
    return _DiagramSegment(candidates.first, candidates.last);
  }
  return const _DiagramSegment(
    EconDiagramCoordinate(quantity: 0, price: .5),
    EconDiagramCoordinate(quantity: 1, price: .5),
  );
}

EconDiagramCoordinate? _segmentIntersection(
    _DiagramSegment first, _DiagramSegment second) {
  final x1 = first.start.quantity;
  final y1 = first.start.price;
  final x2 = first.end.quantity;
  final y2 = first.end.price;
  final x3 = second.start.quantity;
  final y3 = second.start.price;
  final x4 = second.end.quantity;
  final y4 = second.end.price;
  final denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (denominator.abs() < .000001) return null;
  final determinantFirst = x1 * y2 - y1 * x2;
  final determinantSecond = x3 * y4 - y3 * x4;
  final quantity =
      (determinantFirst * (x3 - x4) - (x1 - x2) * determinantSecond) /
          denominator;
  final price = (determinantFirst * (y3 - y4) - (y1 - y2) * determinantSecond) /
      denominator;
  const margin = .004;
  bool within(_DiagramSegment segment) =>
      quantity >=
          math.min(segment.start.quantity, segment.end.quantity) - margin &&
      quantity <=
          math.max(segment.start.quantity, segment.end.quantity) + margin &&
      price >= math.min(segment.start.price, segment.end.price) - margin &&
      price <= math.max(segment.start.price, segment.end.price) + margin;
  if (!within(first) || !within(second)) return null;
  return EconDiagramCoordinate(
    quantity: quantity.clamp(0.0, 1.0),
    price: price.clamp(0.0, 1.0),
  );
}

bool _sameState(EconDiagramState left, EconDiagramState right) =>
    jsonEncode(left.toJson()) == jsonEncode(right.toJson());

double _distance(EconDiagramCoordinate left, EconDiagramCoordinate right) =>
    math.sqrt(math.pow(left.quantity - right.quantity, 2) +
        math.pow(left.price - right.price, 2));

bool _insidePolygon(
    EconDiagramCoordinate point, List<EconDiagramCoordinate> polygon) {
  if (polygon.length < 3) return false;
  var inside = false;
  for (var index = 0, previous = polygon.length - 1;
      index < polygon.length;
      previous = index++) {
    final a = polygon[index];
    final b = polygon[previous];
    final crosses = (a.price > point.price) != (b.price > point.price) &&
        point.quantity <
            (b.quantity - a.quantity) *
                    (point.price - a.price) /
                    (b.price - a.price) +
                a.quantity;
    if (crosses) inside = !inside;
  }
  return inside;
}

String _shortLabel(String value) => value
    .split('-')
    .where((part) => part.isNotEmpty)
    .map((part) => part[0].toUpperCase())
    .join();

Color _structuredColor(String concept) {
  if (concept.contains('demand') || concept == 'ad' || concept == 'mr') {
    return const Color(0xFF4F87C8);
  }
  if (concept.contains('supply') || concept == 'sras' || concept == 'mc') {
    return const Color(0xFFD86372);
  }
  if (concept == 'lras' || concept == 'ac') return const Color(0xFF625BC5);
  if (concept.contains('price') || concept == 'tangent') {
    return const Color(0xFF378F6B);
  }
  return const Color(0xFF4F87C8);
}

Color _areaColor(String kind, [int index = 0]) {
  const palette = [
    Color(0xFF43C000),
    Color(0xFFD67E00),
    Color(0xFFA560E8),
    Color(0xFF2B70C9),
    Color(0xFFD93B3B),
    Color(0xFF009688),
  ];
  if (index > 0) return palette[index % palette.length];
  return switch (kind) {
    'consumer-surplus' ||
    'total-expenditure-increase' ||
    'buyer-subsidy-benefit' =>
      const Color(0xFF378F6B),
    'producer-surplus' ||
    'seller-tax-burden' ||
    'total-subsidy' =>
      const Color(0xFFC66A2B),
    'total-expenditure' => const Color(0xFF4F87C8),
    'total-expenditure-decrease' ||
    'deadweight-loss' ||
    'buyer-tax-burden' =>
      const Color(0xFFBE4052),
    _ => const Color(0xFF625BC5),
  };
}

extension _LastOrNull<T> on List<T> {
  T? get lastOrNull => isEmpty ? null : last;
}

extension _FirstOrNull<T> on Iterable<T> {
  T? get firstOrNull => isEmpty ? null : first;
}
