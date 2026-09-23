import 'dart:math' as math;

import 'econ_diagram_models.dart';

const structuredDiagramPresets = <String, EconStructuredPreset>{
  'as-ad': EconStructuredPreset(
    axisX: 'Y',
    axisY: 'Price level',
    curves: [
      EconStructuredCurveOption('ad', 'AD', 'down'),
      EconStructuredCurveOption('sras', 'SRAS', 'up'),
      EconStructuredCurveOption('lras', 'LRAS', 'vertical'),
    ],
  ),
  'money-market': EconStructuredPreset(
    axisX: 'M',
    axisY: 'Interest rate',
    curves: [
      EconStructuredCurveOption('money-demand', 'Md', 'down'),
      EconStructuredCurveOption('money-supply', 'Ms', 'vertical'),
    ],
  ),
  'trade-barrier': EconStructuredPreset(
    axisX: 'Q',
    axisY: 'P',
    curves: [
      EconStructuredCurveOption('domestic-demand', 'D', 'down'),
      EconStructuredCurveOption('domestic-supply', 'S', 'up'),
      EconStructuredCurveOption('world-price', 'Pw', 'horizontal'),
      EconStructuredCurveOption('tariff-price', 'Pw + tariff', 'horizontal'),
      EconStructuredCurveOption('quota-supply', 'S + quota', 'quota-supply'),
    ],
  ),
  'monopoly': EconStructuredPreset(
    axisX: 'Q',
    axisY: 'P / Cost / Revenue',
    curves: [
      EconStructuredCurveOption('demand', 'D = AR = MB', 'down'),
      EconStructuredCurveOption('mr', 'MR', 'down'),
      EconStructuredCurveOption('mc', 'MC', 'up'),
      EconStructuredCurveOption('ac', 'AC', 'u-shape'),
    ],
  ),
  'ppf': EconStructuredPreset(
    axisX: 'Good X',
    axisY: 'Good Y',
    curves: [
      EconStructuredCurveOption('ppf', 'PPF', 'ppf'),
      EconStructuredCurveOption('cpf', 'CPF', 'down'),
      EconStructuredCurveOption('trade-line', 'Trade line', 'down'),
      EconStructuredCurveOption('tangent', 'L', 'down'),
    ],
  ),
};

class EconStructuredPreset {
  const EconStructuredPreset({
    required this.axisX,
    required this.axisY,
    required this.curves,
  });

  final String axisX;
  final String axisY;
  final List<EconStructuredCurveOption> curves;
}

class EconStructuredCurveOption {
  const EconStructuredCurveOption(this.concept, this.label, this.shape);

  final String concept;
  final String label;
  final String shape;
}

class EconMarketGapGeometry {
  const EconMarketGapGeometry({
    required this.price,
    required this.equilibriumPrice,
    required this.demandQuantity,
    required this.supplyQuantity,
  });

  final double price;
  final double equilibriumPrice;
  final double demandQuantity;
  final double supplyQuantity;

  String get actualKind => (demandQuantity - supplyQuantity).abs() <= .015
      ? 'balanced'
      : demandQuantity > supplyQuantity
          ? 'shortage'
          : 'surplus';

  String get relativeToEquilibrium => (price - equilibriumPrice).abs() <= .005
      ? 'at'
      : price > equilibriumPrice
          ? 'above'
          : 'below';
}

EconDiagramState emptyDiagramForKind(String kind) {
  if (kind == 'demand-supply') return const EconDiagramState();
  final preset =
      structuredDiagramPresets[kind] ?? structuredDiagramPresets['as-ad']!;
  return EconDiagramState(
    toolKind: kind,
    structured: EconStructuredDiagramState(
      kind: kind,
      axisX: preset.axisX,
      axisY: preset.axisY,
    ),
  );
}

EconDiagramState mergeDiagramSource(
    EconDiagramState student, EconDiagramState? source) {
  if (source == null) return student;
  return EconDiagramState(
    version: student.version,
    axisX: source.axisX,
    axisY: source.axisY,
    curves: [...source.curves, ...student.curves],
    points: [...source.points, ...student.points],
    equilibria: [...source.equilibria, ...student.equilibria],
    marketGaps: [...source.marketGaps, ...student.marketGaps],
    areas: [...source.areas, ...student.areas],
    strokes: [...source.strokes, ...student.strokes],
    toolKind: student.toolKind,
    policy: student.policy ?? source.policy,
    selectedCurveId: student.selectedCurveId,
    selectedMarketGapId: student.selectedMarketGapId,
    structured: mergeStructuredSource(student.structured, source.structured),
  );
}

EconDiagramState stripDiagramSource(
    EconDiagramState combined, EconDiagramState? source) {
  if (source == null) return combined;
  final ids = <String>{
    ...source.curves.map((item) => item.id),
    ...source.points.map((item) => item.id),
    ...source.equilibria.map((item) => item.id),
    ...source.marketGaps.map((item) => item.id),
    ...source.areas.map((item) => item.id),
    ...source.strokes.map((item) => item.id),
  };
  final structuredIds = <String>{
    ...?source.structured?.curves.map((item) => item.id),
    ...?source.structured?.markers.map((item) => item.id),
    ...?source.structured?.areas.map((item) => item.id),
    ...?source.structured?.measures.map((item) => item.id),
  };
  final structured = combined.structured;
  return EconDiagramState(
    version: combined.version,
    axisX: combined.axisX,
    axisY: combined.axisY,
    curves: combined.curves.where((item) => !ids.contains(item.id)).toList(),
    points: combined.points.where((item) => !ids.contains(item.id)).toList(),
    equilibria:
        combined.equilibria.where((item) => !ids.contains(item.id)).toList(),
    marketGaps:
        combined.marketGaps.where((item) => !ids.contains(item.id)).toList(),
    areas: combined.areas.where((item) => !ids.contains(item.id)).toList(),
    strokes: combined.strokes.where((item) => !ids.contains(item.id)).toList(),
    toolKind: combined.toolKind,
    policy: combined.policy,
    selectedCurveId: ids.contains(combined.selectedCurveId)
        ? null
        : combined.selectedCurveId,
    selectedMarketGapId: ids.contains(combined.selectedMarketGapId)
        ? null
        : combined.selectedMarketGapId,
    structured: structured == null
        ? null
        : EconStructuredDiagramState(
            kind: structured.kind,
            axisX: structured.axisX,
            axisY: structured.axisY,
            curves: structured.curves
                .where((item) => !structuredIds.contains(item.id))
                .toList(),
            markers: structured.markers
                .where((item) => !structuredIds.contains(item.id))
                .toList(),
            areas: structured.areas
                .where((item) => !structuredIds.contains(item.id))
                .toList(),
            measures: structured.measures
                .where((item) => !structuredIds.contains(item.id))
                .toList(),
            selectedCurveId: structuredIds.contains(structured.selectedCurveId)
                ? null
                : structured.selectedCurveId,
          ),
  );
}

EconStructuredDiagramState? mergeStructuredSource(
  EconStructuredDiagramState? student,
  EconStructuredDiagramState? source,
) {
  if (student == null) return source;
  if (source == null || source.kind != student.kind) return student;
  return EconStructuredDiagramState(
    kind: student.kind,
    axisX: source.axisX,
    axisY: source.axisY,
    curves: [...source.curves, ...student.curves],
    markers: [...source.markers, ...student.markers],
    areas: [...source.areas, ...student.areas],
    measures: [...source.measures, ...student.measures],
    selectedCurveId: student.selectedCurveId,
  );
}

EconDiagramState addDemandSupplyCurve(EconDiagramState state, String kind) {
  if (kind != 'demand' && kind != 'supply') return state;
  final peers = state.curves.where((curve) => curve.kind == kind).toList();
  if (peers.length >= 4) return state;
  final sequence = _nextSequence(state);
  final base = kind == 'demand' ? 'D' : 'S';
  final nextLabelIndex = _nextCurveLabelIndex(peers, base);
  final next = EconDiagramCurve(
    id: '$kind-$sequence',
    kind: kind,
    label: peers.isEmpty
        ? base
        : nextLabelIndex <= 0
            ? base
            : '$base$nextLabelIndex',
    position: peers.isEmpty ? 0 : .28 * peers.length,
    steepness: 1,
    concept: kind,
  );
  return _replaceState(
    state,
    curves: [...state.curves, next],
    selectedCurveId: next.id,
    clearSelectedGap: true,
  );
}

int _nextCurveLabelIndex(Iterable<EconDiagramCurve> peers, String base) {
  var maximum = 0;
  for (final peer in peers) {
    final label = peer.label?.trim() ?? '';
    if (label == base) {
      // A legacy supplied curve labelled D/S is the baseline (D0/S0). The
      // first student curve must therefore be D1/S1, without renaming the
      // locked source object.
      maximum = math.max(maximum, 0);
      continue;
    }
    final match = RegExp('^${RegExp.escape(base)}([0-9]+)').firstMatch(label);
    final suffix =
        match != null && match.group(0) == label ? match.group(1) : null;
    final index = int.tryParse(suffix ?? '');
    if (index != null) maximum = math.max(maximum, index);
  }
  return maximum + 1;
}

EconDiagramState addPolicySupplyShift(EconDiagramState state, String policy) {
  final supplies = state.curves
      .where((curve) => curve.kind == 'supply' && !curve.quota)
      .toList();
  if (supplies.length != 1 || (policy != 'tax' && policy != 'subsidy')) {
    return state;
  }
  final added = addDemandSupplyCurve(state, 'supply');
  final id = added.selectedCurveId;
  return _replaceState(
    added,
    policy: policy,
    curves: [
      for (final curve in added.curves)
        if (curve.id == id)
          curve.copyWith(
            position: policy == 'tax' ? .28 : -.28,
            shiftAxis: 'vertical',
            policyShift: policy,
          )
        else
          curve,
    ],
  );
}

EconDiagramState addSupplyQuota(EconDiagramState state, String curveId) {
  final base = state.curves.where((curve) => curve.id == curveId).firstOrNull;
  if (base == null || base.kind != 'supply' || base.shape != 'normal') {
    return state;
  }
  final quotas =
      state.curves.where((curve) => curve.quotaBaseCurveId == base.id).toList();
  if (quotas.length >= 3) return state;
  final next = EconDiagramCurve(
    id: 'supply-${_nextSequence(state)}',
    kind: 'supply',
    label: 'S${quotas.length + 2}',
    position: quotas.isEmpty ? .1 : quotas.last.position + .25,
    steepness: 0,
    shape: 'vertical',
    concept: 'quota-supply',
    quota: true,
    quotaBaseCurveId: base.id,
  );
  return _replaceState(
    state,
    curves: [
      for (final curve in state.curves)
        if (curve.id == base.id && curve.label == 'S')
          curve.copyWith(label: 'S1')
        else
          curve,
      next,
    ],
    selectedCurveId: next.id,
  );
}

EconDiagramState updateDemandSupplyCurve(
  EconDiagramState state,
  String curveId, {
  double? position,
  double? steepness,
  String? shape,
  String? displayLabel,
}) {
  return _replaceState(
    state,
    curves: [
      for (final curve in state.curves)
        if (curve.id == curveId)
          curve.copyWith(
            position: position?.clamp(-1.65, 1.65),
            steepness: steepness?.clamp(0, 2.2),
            shape: shape,
            displayLabel: displayLabel,
            concept: displayLabel,
          )
        else
          curve,
    ],
  );
}

EconDiagramState cycleCurveSlope(
    EconDiagramState state, String curveId, int direction) {
  const steps = <({String shape, double steepness})>[
    (shape: 'horizontal', steepness: 0),
    (shape: 'normal', steepness: .62),
    (shape: 'normal', steepness: 1),
    (shape: 'normal', steepness: 1.42),
    (shape: 'vertical', steepness: 0),
  ];
  final curve = state.curves.where((item) => item.id == curveId).firstOrNull;
  if (curve == null) return state;
  var current = curve.shape == 'horizontal'
      ? 0
      : curve.shape == 'vertical'
          ? 4
          : curve.steepness < .8
              ? 1
              : curve.steepness > 1.2
                  ? 3
                  : 2;
  current = (current + direction).clamp(0, steps.length - 1);
  return updateDemandSupplyCurve(
    state,
    curveId,
    shape: steps[current].shape,
    steepness: steps[current].steepness,
  );
}

EconDiagramState deleteDemandSupplyCurve(
    EconDiagramState state, String curveId) {
  final removed = <String>{
    curveId,
    ...state.curves
        .where((curve) => curve.quotaBaseCurveId == curveId)
        .map((curve) => curve.id),
  };
  final equilibria = state.equilibria
      .where((point) =>
          !removed.contains(point.demandId) &&
          !removed.contains(point.supplyId))
      .toList();
  final validEquilibria = equilibria.map((point) => point.id).toSet();
  return _replaceState(
    state,
    curves: state.curves.where((curve) => !removed.contains(curve.id)).toList(),
    equilibria: equilibria,
    points: state.points
        .where((point) =>
            !removed.contains(point.curveId) &&
            (point.anchorEquilibriumId == null ||
                validEquilibria.contains(point.anchorEquilibriumId)))
        .toList(),
    marketGaps: state.marketGaps
        .where((gap) =>
            !removed.contains(gap.demandId) && !removed.contains(gap.supplyId))
        .toList(),
    clearSelectedCurve: true,
  );
}

EconDiagramState addEquilibrium(EconDiagramState state) {
  final demand = state.curves.reversed
      .where((curve) => curve.kind == 'demand')
      .firstOrNull;
  final supply = state.curves.reversed
      .where((curve) => curve.kind == 'supply')
      .firstOrNull;
  if (demand == null || supply == null) return state;
  if (state.equilibria.any(
      (point) => point.demandId == demand.id && point.supplyId == supply.id)) {
    return state;
  }
  final point = EconDiagramEquilibrium(
    id: 'equilibrium-${_nextSequence(state)}',
    demandId: demand.id,
    supplyId: supply.id,
    labelIndex: _nextGuideIndex(state),
  );
  return _replaceState(state, equilibria: [...state.equilibria, point]);
}

EconDiagramState addGuideFromAxisDrag(
    EconDiagramState state, double price, double endQuantity) {
  final guidePrice = price.clamp(.04, .96).toDouble();
  final end = endQuantity.clamp(0, 1).toDouble();
  if (end < .045 || state.curves.isEmpty) return state;

  final policy = state.policy ??
      state.curves
          .where((curve) => curve.policyShift != null)
          .firstOrNull
          ?.policyShift;
  if (policy != null) {
    final originalSupply = state.curves
        .where((curve) =>
            curve.kind == 'supply' && curve.policyShift == null && !curve.quota)
        .firstOrNull;
    final shiftedSupply =
        state.curves.where((curve) => curve.policyShift == policy).firstOrNull;
    final shiftedEquilibrium = shiftedSupply == null
        ? null
        : state.equilibria
            .where((point) => point.supplyId == shiftedSupply.id)
            .firstOrNull;
    final shiftedCoordinate = shiftedEquilibrium == null
        ? null
        : diagramEquilibriumCoordinate(state, shiftedEquilibrium);
    if (originalSupply != null && shiftedCoordinate != null) {
      final splitPrice =
          demandSupplyPriceAt(originalSupply, shiftedCoordinate.quantity);
      if ((end - shiftedCoordinate.quantity).abs() <= .065 &&
          (guidePrice - splitPrice).abs() <= .055) {
        return addPointOnCurve(
            state, originalSupply.id, shiftedCoordinate.quantity);
      }
    }
  }

  final demands = state.curves.where((curve) => curve.kind == 'demand');
  final supplies = state.curves.where((curve) => curve.kind == 'supply');
  final equilibriumTargets = <({
    EconDiagramCurve demand,
    EconDiagramCurve supply,
    EconDiagramCoordinate coordinate,
    double distance,
  })>[];
  for (final demand in demands) {
    for (final supply in supplies) {
      final coordinate = demandSupplyIntersection(demand, supply);
      if (coordinate == null ||
          (coordinate.price - guidePrice).abs() > .045 ||
          (coordinate.quantity - end).abs() > .085) {
        continue;
      }
      equilibriumTargets.add((
        demand: demand,
        supply: supply,
        coordinate: coordinate,
        distance: _coordinateDistance(
          coordinate,
          EconDiagramCoordinate(quantity: end, price: guidePrice),
        ),
      ));
    }
  }
  equilibriumTargets
      .sort((left, right) => left.distance.compareTo(right.distance));
  if (equilibriumTargets.isNotEmpty) {
    final target = equilibriumTargets.first;
    if (state.equilibria.any((point) =>
        point.demandId == target.demand.id &&
        point.supplyId == target.supply.id)) {
      return state;
    }
    return _replaceState(state, equilibria: [
      ...state.equilibria,
      EconDiagramEquilibrium(
        id: 'equilibrium-${_nextSequence(state)}',
        demandId: target.demand.id,
        supplyId: target.supply.id,
        labelIndex: _nextGuideIndex(state),
      ),
    ]);
  }

  final gapTargets = <({
    EconDiagramCurve demand,
    EconDiagramCurve supply,
    double demandQuantity,
    double supplyQuantity,
  })>[];
  for (final demand in demands) {
    for (final supply in supplies) {
      if (demand.shape == 'horizontal' || supply.shape == 'horizontal') {
        continue;
      }
      final demandQuantity = demandSupplyQuantityAt(demand, guidePrice);
      final supplyQuantity = demandSupplyQuantityAt(supply, guidePrice);
      if (!demandQuantity.isFinite ||
          !supplyQuantity.isFinite ||
          (demandQuantity - supplyQuantity).abs() <= .015 ||
          end < math.max(demandQuantity, supplyQuantity) - .04) {
        continue;
      }
      gapTargets.add((
        demand: demand,
        supply: supply,
        demandQuantity: demandQuantity,
        supplyQuantity: supplyQuantity,
      ));
    }
  }
  if (gapTargets.isNotEmpty) {
    final target = gapTargets.first;
    final existing = state.marketGaps
        .where((gap) =>
            gap.demandId == target.demand.id &&
            gap.supplyId == target.supply.id &&
            (gap.pricePosition - guidePrice).abs() < .04)
        .firstOrNull;
    final guideIndex = existing?.guideLabelIndex ?? _nextGuideIndex(state);
    if (existing != null) {
      return _replaceState(state, marketGaps: [
        for (final gap in state.marketGaps)
          if (gap.id == existing.id)
            gap.copyWith(
              quantitiesMarked: true,
              guideLabelIndex: guideIndex,
            )
          else
            gap,
      ]);
    }
    final shortage = target.demandQuantity > target.supplyQuantity;
    return _replaceState(state, marketGaps: [
      ...state.marketGaps,
      EconDiagramMarketGap(
        id: 'gap-${_nextSequence(state)}',
        kind: shortage ? 'shortage' : 'surplus',
        demandId: target.demand.id,
        supplyId: target.supply.id,
        labelIndex: guideIndex,
        guideLabelIndex: guideIndex,
        pricePosition: guidePrice,
        quantitiesMarked: true,
      ),
    ]);
  }

  final pointTargets = <({
    EconDiagramCurve curve,
    double quantity,
    double distance,
  })>[];
  for (final curve in state.curves) {
    var quantity = demandSupplyQuantityAt(curve, guidePrice);
    if (curve.shape == 'horizontal') {
      final curvePrice = .5 + curve.position * .26;
      if ((curvePrice - guidePrice).abs() > .04) continue;
      quantity = end;
    }
    if (!quantity.isFinite ||
        quantity < 0 ||
        quantity > 1 ||
        end < quantity - .04) {
      continue;
    }
    pointTargets.add(
        (curve: curve, quantity: quantity, distance: (end - quantity).abs()));
  }
  pointTargets.sort((left, right) => left.distance.compareTo(right.distance));
  if (pointTargets.isEmpty) return state;
  final target = pointTargets.first;
  if (target.curve.shape == 'vertical') {
    final point = EconDiagramPoint(
      id: 'point-${_nextSequence(state)}',
      curveId: target.curve.id,
      labelIndex: _nextGuideIndex(state),
      quantityPosition: guidePrice,
    );
    return _replaceState(state, points: [...state.points, point]);
  }
  return addPointOnCurve(state, target.curve.id, target.quantity);
}

EconDiagramState addPointOnCurve(
    EconDiagramState state, String curveId, double quantity) {
  if (!state.curves.any((curve) => curve.id == curveId) ||
      state.points.length >= 8) {
    return state;
  }
  final policy = state.policy ??
      state.curves
          .where((curve) => curve.policyShift != null)
          .firstOrNull
          ?.policyShift;
  final originalSupply = state.curves
      .where((curve) =>
          curve.kind == 'supply' && curve.policyShift == null && !curve.quota)
      .firstOrNull;
  final shiftedSupply = state.curves
      .where((curve) => curve.kind == 'supply' && curve.policyShift == policy)
      .firstOrNull;
  final shiftedEquilibrium = shiftedSupply == null
      ? null
      : state.equilibria
          .where((point) => point.supplyId == shiftedSupply.id)
          .firstOrNull;
  final shiftedCoordinate = shiftedEquilibrium == null
      ? null
      : diagramEquilibriumCoordinate(state, shiftedEquilibrium);
  final splitPrice = policy != null &&
      originalSupply?.id == curveId &&
      shiftedCoordinate != null &&
      (shiftedCoordinate.quantity - quantity).abs() <= .065;
  final point = EconDiagramPoint(
    id: 'point-${_nextSequence(state)}',
    curveId: curveId,
    labelIndex: splitPrice
        ? math.max(3, _nextGuideIndex(state))
        : _nextGuideIndex(state),
    quantityPosition:
        splitPrice ? shiftedCoordinate.quantity : quantity.clamp(.08, .92),
    priceLabel: splitPrice ? 'P3' : null,
    quantityLabel: splitPrice ? 'Q${shiftedEquilibrium!.labelIndex}' : null,
    anchorEquilibriumId: splitPrice ? shiftedEquilibrium!.id : null,
  );
  return _replaceState(state, points: [...state.points, point]);
}

EconDiagramState addMarketGap(EconDiagramState state, String kind) {
  final demand = state.curves.reversed
      .where((curve) => curve.kind == 'demand')
      .firstOrNull;
  final supply = state.curves.reversed
      .where((curve) => curve.kind == 'supply')
      .firstOrNull;
  final equilibrium = demand == null || supply == null
      ? null
      : demandSupplyIntersection(demand, supply);
  if (demand == null || supply == null || equilibrium == null) return state;
  final price = (equilibrium.price + (kind == 'shortage' ? -.16 : .16))
      .clamp(.08, .92)
      .toDouble();
  final gap = EconDiagramMarketGap(
    id: 'gap-${_nextSequence(state)}',
    kind: kind,
    policyKind: kind == 'shortage' ? 'ceiling' : 'floor',
    demandId: demand.id,
    supplyId: supply.id,
    labelIndex: state.marketGaps.where((item) => item.kind == kind).length + 1,
    pricePosition: price,
  );
  return _replaceState(
    state,
    marketGaps: [...state.marketGaps, gap],
    selectedMarketGapId: gap.id,
    clearSelectedCurve: true,
  );
}

EconDiagramState addDiagramArea(
    EconDiagramState state, String kind, List<EconDiagramCoordinate> points,
    [List<EconDiagramAreaAnchor> anchors = const []]) {
  final normalized = _normalizePolygon(points);
  if (normalized.length < 3 || state.areas.length >= 8) return state;
  return _replaceState(
    state,
    areas: [
      ...state.areas,
      EconDiagramArea(
        id: 'area-${_nextSequence(state)}',
        kind: kind,
        points: normalized,
        anchors: _anchorsForNormalizedPoints(points, normalized, anchors),
      ),
    ],
  );
}

EconDiagramState addStructuredCurve(
    EconDiagramState state, String kind, String concept) {
  final preset = structuredDiagramPresets[kind];
  final option =
      preset?.curves.where((item) => item.concept == concept).firstOrNull;
  if (preset == null || option == null) return state;
  final current = state.structured?.kind == kind
      ? state.structured!
      : EconStructuredDiagramState(
          kind: kind, axisX: preset.axisX, axisY: preset.axisY);
  final peers =
      current.curves.where((curve) => curve.concept == concept).toList();
  if (peers.length >= 3) return state;
  final sequence = _nextStructuredSequence(current);
  final next = EconStructuredCurve(
    id: '$concept-$sequence',
    concept: concept,
    label: peers.isEmpty ? option.label : '${option.label}${peers.length + 1}',
    shape: option.shape,
    position: peers.isEmpty ? 0 : .28 * peers.length,
    steepness: concept == 'mr' ? 1.45 : 1,
  );
  return _replaceState(
    state,
    toolKind: kind,
    structured: current.copyWith(
      curves: [...current.curves, next],
      selectedCurveId: next.id,
    ),
  );
}

EconDiagramState updateStructuredCurveState(
  EconDiagramState state,
  String curveId, {
  double? position,
  double? steepness,
  String? shape,
}) {
  final structured = state.structured;
  if (structured == null) return state;
  return _replaceState(
    state,
    structured: structured.copyWith(curves: [
      for (final curve in structured.curves)
        if (curve.id == curveId)
          curve.copyWith(
            position: position?.clamp(-1.95, 1.95),
            steepness: steepness?.clamp(.45, 2.2),
            shape: shape,
          )
        else
          curve,
    ]),
  );
}

EconDiagramState addStructuredMarker(
  EconDiagramState state,
  String concept,
  EconDiagramCoordinate coordinate,
) {
  final structured = state.structured;
  if (structured == null || structured.markers.length >= 16) return state;
  final anchor = _nearestStructuredAnchor(structured, coordinate, .18);
  if (anchor == null) return state;
  final sequence = structured.markers.length + 1;
  final labels = _structuredMarkerLabels(structured.kind, concept, sequence);
  final marker = EconStructuredMarker(
    id: 'marker-${_nextStructuredSequence(structured)}',
    concept: concept,
    label: labels.$1,
    horizontalLabel: labels.$2,
    verticalLabel: labels.$3,
    quantityPosition: anchor.point.quantity.clamp(0, 1),
    pricePosition: anchor.point.price.clamp(0, 1),
    anchorCurveIds: anchor.ids,
  );
  return _replaceState(
    state,
    structured: structured.copyWith(markers: [...structured.markers, marker]),
  );
}

EconDiagramCoordinate structuredMarkerCoordinateState(
  EconStructuredDiagramState state,
  EconStructuredMarker marker,
) {
  final ids = marker.anchorCurveIds
      .where((id) => state.curves.any((curve) => curve.id == id))
      .toList();
  final saved = EconDiagramCoordinate(
    quantity: marker.quantityPosition,
    price: marker.pricePosition,
  );
  if (ids.length >= 2) {
    final candidates = _structuredIntersectionAnchors(state)
        .where((anchor) => ids.every(anchor.ids.contains))
        .map((anchor) => anchor.point)
        .toList();
    candidates.sort((left, right) => _coordinateDistance(left, saved)
        .compareTo(_coordinateDistance(right, saved)));
    if (candidates.isNotEmpty) return candidates.first;
  }
  if (ids.length == 1) {
    final curve =
        state.curves.where((item) => item.id == ids.first).firstOrNull;
    if (curve != null) {
      final candidates = structuredCurvePoints(curve, 96, state.curves);
      candidates.sort((left, right) => _coordinateDistance(left, saved)
          .compareTo(_coordinateDistance(right, saved)));
      if (candidates.isNotEmpty) return candidates.first;
    }
  }
  return saved;
}

EconDiagramState addStructuredGuideFromAxisDragState(
  EconDiagramState state,
  double pricePosition,
  double endQuantity, {
  List<String> concepts = const [],
}) {
  final structured = state.structured;
  if (structured == null || structured.markers.length >= 16) return state;
  final price = pricePosition.clamp(.04, .96).toDouble();
  final end = endQuantity.clamp(0.0, 1.0).toDouble();
  if (end < .045) return state;

  final segments =
      <({String id, EconDiagramCoordinate start, EconDiagramCoordinate end})>[];
  for (final curve in structured.curves) {
    final points = structuredCurvePoints(curve, 96, structured.curves);
    for (var index = 1; index < points.length; index++) {
      segments
          .add((id: curve.id, start: points[index - 1], end: points[index]));
    }
  }
  final targets =
      <({EconDiagramCoordinate point, List<String> ids, double distance})>[];
  for (var first = 0; first < segments.length; first++) {
    for (var second = first + 1; second < segments.length; second++) {
      if (segments[first].id == segments[second].id) continue;
      final point = _lineSegmentIntersection(
        segments[first].start,
        segments[first].end,
        segments[second].start,
        segments[second].end,
      );
      if (point == null ||
          (point.price - price).abs() > .045 ||
          end < point.quantity - .04) {
        continue;
      }
      targets.add((
        point: point,
        ids: [segments[first].id, segments[second].id],
        distance: _coordinateDistance(
            point, EconDiagramCoordinate(quantity: end, price: price)),
      ));
    }
  }
  if (targets.isEmpty) {
    for (final segment in segments) {
      final low = math.min(segment.start.price, segment.end.price);
      final high = math.max(segment.start.price, segment.end.price);
      if (price < low || price > high) continue;
      final delta = segment.end.price - segment.start.price;
      final ratio =
          delta.abs() < .000001 ? .5 : (price - segment.start.price) / delta;
      final quantity = segment.start.quantity +
          (segment.end.quantity - segment.start.quantity) * ratio;
      if (end < quantity - .04) continue;
      final point = EconDiagramCoordinate(quantity: quantity, price: price);
      targets.add(
          (point: point, ids: [segment.id], distance: (end - quantity).abs()));
    }
  }
  if (targets.isEmpty) return state;
  targets.sort((left, right) => left.distance.compareTo(right.distance));
  final target = targets.first;
  if (structured.kind == 'as-ad') {
    final targetConcepts = target.ids
        .map((id) => structured.curves
            .where((curve) => curve.id == id)
            .firstOrNull
            ?.concept)
        .whereType<String>()
        .toSet();
    if (!targetConcepts.contains('ad') ||
        (!targetConcepts.contains('sras') &&
            !targetConcepts.contains('lras'))) {
      return state;
    }
  }
  if (structured.markers.any((marker) =>
      marker.axisGuide &&
      _coordinateDistance(
            EconDiagramCoordinate(
                quantity: marker.quantityPosition, price: marker.pricePosition),
            target.point,
          ) <
          .035)) {
    return state;
  }
  final sequence = structured.markers.length + 1;
  final concept = structured.kind == 'as-ad'
      ? 'price-level'
      : concepts
              .where((item) => !_isStructuredMeasureConcept(item))
              .firstOrNull ??
          'axis-guide';
  final labels = _structuredMarkerLabels(structured.kind, concept, sequence);
  final marker = EconStructuredMarker(
    id: 'axis-guide-${_nextStructuredSequence(structured)}',
    concept: concept,
    concepts: concepts,
    label: labels.$1,
    horizontalLabel: structured.kind == 'as-ad' ? null : labels.$2,
    verticalLabel: labels.$3,
    quantityPosition: target.point.quantity.clamp(.04, .96),
    pricePosition: target.point.price.clamp(.04, .96),
    anchorCurveIds: target.ids,
    axisGuide: true,
  );
  return _replaceState(
    state,
    structured: structured.copyWith(markers: [...structured.markers, marker]),
  );
}

EconDiagramState addStructuredAreaState(
    EconDiagramState state, String concept, List<EconDiagramCoordinate> points,
    [List<EconStructuredAreaAnchor> anchors = const []]) {
  final structured = state.structured;
  final normalized = _normalizePolygon(points);
  if (structured == null ||
      normalized.length < 3 ||
      structured.areas.length >= 8) {
    return state;
  }
  final area = EconStructuredArea(
    id: 'area-${_nextStructuredSequence(structured)}',
    concept: concept,
    label: _shortConceptLabel(concept),
    points: normalized,
    anchors: _structuredAnchorsForNormalizedPoints(points, normalized, anchors),
  );
  return _replaceState(
    state,
    structured: structured.copyWith(areas: [...structured.areas, area]),
  );
}

EconDiagramState addStructuredMeasureState(
  EconDiagramState state,
  String concept,
  EconDiagramCoordinate start,
  EconDiagramCoordinate end,
) {
  final structured = state.structured;
  if (structured == null || structured.measures.length >= 8) return state;
  final measure = EconStructuredMeasure(
    id: 'measure-${_nextStructuredSequence(structured)}',
    concept: concept,
    label: _shortConceptLabel(concept),
    start: start,
    end: end,
  );
  return _replaceState(
    state,
    structured:
        structured.copyWith(measures: [...structured.measures, measure]),
  );
}

bool diagramReadyFor({
  required EconDiagramState state,
  required String kind,
  required String mode,
  String? policy,
  bool requiresSplitPrice = false,
  EconDiagramState? sourceSeed,
}) {
  if (mode == 'reference') return true;
  if (kind != 'demand-supply') {
    final structured = state.structured;
    return structured?.kind == kind &&
        (structured!.curves.isNotEmpty ||
            structured.markers.isNotEmpty ||
            structured.areas.isNotEmpty ||
            structured.measures.isNotEmpty);
  }
  if (!state.hasAnswer) return false;
  if (policy == null) return true;
  final combined = mergeDiagramSource(state, sourceSeed);
  final hasDemand = combined.curves.any((curve) => curve.kind == 'demand');
  final originalSupply = combined.curves
      .any((curve) => curve.kind == 'supply' && curve.policyShift == null);
  final shiftedSupply = combined.curves
      .any((curve) => curve.kind == 'supply' && curve.policyShift == policy);
  final splitPrice = !requiresSplitPrice ||
      combined.points.any((point) => point.quantityLabel != null);
  return hasDemand &&
      originalSupply &&
      shiftedSupply &&
      combined.equilibria.length >= 2 &&
      splitPrice;
}

Map<String, Object?> diagramGradingPayload(
  EconDiagramState state, {
  EconDiagramState? sourceSeed,
}) {
  final combined = mergeDiagramSource(state, sourceSeed);
  return {
    'version': 1,
    'axes': {'vertical': state.axisY, 'horizontal': state.axisX},
    'toolKind': state.toolKind,
    'policy': state.policy,
    'curves': state.curves.map(_curvePayload).toList(),
    'points': state.points.map((point) {
      final coordinate = diagramPointCoordinate(combined, point);
      return {
        'priceLabel': point.priceLabel ?? 'P${point.labelIndex}',
        'quantityLabel': point.quantityLabel ?? 'Q${point.labelIndex}',
        'curveId': point.curveId,
        'pricePosition': _round(coordinate?.price ?? 0),
        'quantityPosition':
            _round(coordinate?.quantity ?? point.quantityPosition),
      };
    }).toList(),
    'equilibria': state.equilibria.map((point) {
      final coordinate = diagramEquilibriumCoordinate(combined, point);
      return {
        'label': 'E${point.labelIndex}',
        'priceLabel': 'P${point.labelIndex}',
        'quantityLabel': 'Q${point.labelIndex}',
        'demandId': point.demandId,
        'supplyId': point.supplyId,
        'pricePosition': _round(coordinate?.price ?? 0),
        'quantityPosition': _round(coordinate?.quantity ?? 0),
      };
    }).toList(),
    'marketGaps': state.marketGaps.map((gap) {
      final geometry = marketGapGeometry(combined, gap);
      return {
        'label': gap.policyKind == 'ceiling'
            ? 'Pc${gap.labelIndex == 1 ? '' : gap.labelIndex}'
            : 'Pf${gap.labelIndex == 1 ? '' : gap.labelIndex}',
        'policyKind': gap.policyKind,
        'quantitiesMarked': gap.quantitiesMarked,
        'intendedKind': gap.kind,
        'actualKind': geometry?.actualKind ?? 'unresolved',
        'pricePosition': _round(gap.pricePosition),
        'equilibriumPricePosition': _round(geometry?.equilibriumPrice ?? 0),
        'relativeToEquilibrium':
            geometry?.relativeToEquilibrium ?? 'unresolved',
        'demandId': gap.demandId,
        'supplyId': gap.supplyId,
        'demandQuantity': _round(geometry?.demandQuantity ?? 0),
        'supplyQuantity': _round(geometry?.supplyQuantity ?? 0),
        'quantityGap': _round(geometry == null
            ? 0
            : (geometry.demandQuantity - geometry.supplyQuantity).abs()),
      };
    }).toList(),
    'areas': state.areas.map((area) => _areaPayload(area)).toList(),
    'movements': _demandSupplyMovements(combined, guideState: state),
    'structured': state.structured == null
        ? null
        : _structuredPayload(state.structured!, sourceSeed?.structured),
    'source': sourceSeed == null ? null : _sourcePayload(sourceSeed),
    'strokes': state.strokes
        .map((stroke) => {
              'kind': stroke.kind,
              'points':
                  stroke.points.map((point) => point.toPayload()).toList(),
            })
        .toList(),
  };
}

Map<String, Object?> _curvePayload(EconDiagramCurve curve) => {
      'id': curve.id,
      'label': curve.label ?? curve.kind.toUpperCase(),
      'displayLabel': diagramCurveDisplayLabel(curve),
      'concept': curve.concept ?? curve.displayLabel ?? curve.kind,
      'type': curve.kind,
      'position': _round(curve.position),
      'relativePosition': curve.shiftAxis == 'vertical'
          ? (curve.position > .03
              ? 'up'
              : curve.position < -.03
                  ? 'down'
                  : 'centre')
          : (curve.position > .03
              ? 'right'
              : curve.position < -.03
                  ? 'left'
                  : 'centre'),
      'steepness': _round(curve.steepness),
      'shape': curve.shape,
      'shiftAxis': curve.shiftAxis,
      'slopeShape': curve.shape == 'horizontal'
          ? 'perfectly-elastic'
          : curve.shape == 'vertical'
              ? 'perfectly-inelastic'
              : curve.steepness < .78
                  ? 'flatter'
                  : curve.steepness > 1.22
                      ? 'steeper'
                      : 'standard',
      'quota': curve.quota,
    };

Map<String, Object?> _areaPayload(EconDiagramArea area) {
  final normalizedArea = _polygonArea(area.points);
  return {
    'kind': area.kind,
    'references': area.referenceIds,
    if (area.anchors.isNotEmpty)
      'anchors': area.anchors.map((anchor) => anchor.toJson()).toList(),
    'regions': [
      if (area.points.length >= 3)
        {
          'label': _shortConceptLabel(area.kind),
          'normalizedArea': _round(normalizedArea),
          'points': area.points.map((point) => point.toPayload()).toList(),
        }
    ],
    'changeDirection': area.kind == 'total-expenditure-increase'
        ? 'increase'
        : area.kind == 'total-expenditure-decrease'
            ? 'decrease'
            : 'not-compared',
  };
}

Map<String, Object?> _structuredPayload(
  EconStructuredDiagramState state,
  EconStructuredDiagramState? source,
) {
  final combined = mergeStructuredSource(state, source)!;
  return {
    'kind': state.kind,
    'axes': {'vertical': state.axisY, 'horizontal': state.axisX},
    'curves': state.curves.map(_structuredCurvePayload).toList(),
    'markers': [
      ...state.markers.expand(_expandedStructuredMarkerPayload),
      ..._automaticAdAsMarkers(
          combined, state.curves.map((item) => item.id).toSet()),
    ],
    'areas': state.areas
        .map((area) => {
              'concept': area.concept,
              'label': area.label,
              'points': area.points.map((point) => point.toPayload()).toList(),
              if (area.anchors.isNotEmpty)
                'anchors':
                    area.anchors.map((anchor) => anchor.toJson()).toList(),
            })
        .toList(),
    'measures': [
      ...state.measures.map(_structuredMeasurePayload),
      ..._quotaMeasures(state, combined),
    ],
    'movements': _structuredMovements(combined),
    'source': source == null ? null : _structuredSourcePayload(source),
  };
}

Map<String, Object?> _structuredCurvePayload(EconStructuredCurve curve) => {
      'id': curve.id,
      'concept': curve.concept,
      'label': curve.label,
      'shape': curve.shape,
      'position': _round(curve.position),
      'steepness': _round(curve.steepness),
    };

Iterable<Map<String, Object?>> _expandedStructuredMarkerPayload(
    EconStructuredMarker marker) sync* {
  final concepts = marker.concepts.isEmpty ? [marker.concept] : marker.concepts;
  for (final concept in concepts) {
    yield {
      'concept': concept,
      'label': marker.label,
      'horizontalLabel': marker.horizontalLabel,
      'verticalLabel': marker.verticalLabel,
      'quantityPosition': _round(marker.quantityPosition),
      'pricePosition': _round(marker.pricePosition),
      'axisGuide': marker.axisGuide,
    };
  }
}

Map<String, Object?> _structuredMeasurePayload(EconStructuredMeasure measure) =>
    {
      'concept': measure.concept,
      'label': measure.label,
      'start': measure.start.toPayload(),
      'end': measure.end.toPayload(),
    };

List<Map<String, Object?>> _automaticAdAsMarkers(
    EconStructuredDiagramState state, Set<String> studentCurveIds) {
  if (state.kind != 'as-ad') return const [];
  final ad = state.curves.where((curve) => curve.concept == 'ad').firstOrNull;
  final sras =
      state.curves.where((curve) => curve.concept == 'sras').firstOrNull;
  if (ad == null || sras == null) return const [];
  final adPoints = structuredCurvePoints(ad, 96, state.curves);
  final srasPoints = structuredCurvePoints(sras, 96, state.curves);
  var bestDistance = double.infinity;
  EconDiagramCoordinate? intersection;
  for (final first in adPoints) {
    for (final second in srasPoints) {
      final distance = _coordinateDistance(first, second);
      if (distance < bestDistance) {
        bestDistance = distance;
        intersection = EconDiagramCoordinate(
          quantity: (first.quantity + second.quantity) / 2,
          price: (first.price + second.price) / 2,
        );
      }
    }
  }
  if (intersection == null ||
      (studentCurveIds.isNotEmpty &&
          !studentCurveIds.contains(ad.id) &&
          !studentCurveIds.contains(sras.id))) {
    return const [];
  }
  return [
    {
      'concept': 'equilibrium',
      'label': 'E1',
      'horizontalLabel': 'Y1',
      'verticalLabel': 'PL1',
      'quantityPosition': _round(intersection.quantity),
      'pricePosition': _round(intersection.price),
    },
    {
      'concept': 'output',
      'label': 'E1',
      'horizontalLabel': 'Y1',
      'quantityPosition': _round(intersection.quantity),
      'pricePosition': _round(intersection.price),
    },
    {
      'concept': 'price-level',
      'label': 'E1',
      'verticalLabel': 'PL1',
      'quantityPosition': _round(intersection.quantity),
      'pricePosition': _round(intersection.price),
    },
  ];
}

List<Map<String, Object?>> _quotaMeasures(
    EconStructuredDiagramState state, EconStructuredDiagramState combined) {
  if (state.kind != 'trade-barrier') return const [];
  final quota = combined.curves
      .where((curve) => curve.concept == 'quota-supply')
      .firstOrNull;
  if (quota == null) return const [];
  final points = structuredCurvePoints(quota, 48, combined.curves);
  final horizontal =
      points.where((point) => point.price >= .2 && point.price <= .8).toList();
  if (horizontal.length < 2) return const [];
  return [
    {
      'concept': 'quota',
      'label': 'QA',
      'start': horizontal.first.toPayload(),
      'end': horizontal.last.toPayload(),
    }
  ];
}

Map<String, Object?> _structuredSourcePayload(
        EconStructuredDiagramState source) =>
    {
      'kind': source.kind,
      'axes': {'vertical': source.axisY, 'horizontal': source.axisX},
      'curves': source.curves.map(_structuredCurvePayload).toList(),
      'markers': [
        ...source.markers.expand(_expandedStructuredMarkerPayload),
        ..._automaticAdAsMarkers(source, const <String>{}),
      ],
      'areas': source.areas
          .map((area) => {
                'concept': area.concept,
                'label': area.label,
                'points':
                    area.points.map((point) => point.toPayload()).toList(),
                if (area.anchors.isNotEmpty)
                  'anchors':
                      area.anchors.map((anchor) => anchor.toJson()).toList(),
              })
          .toList(),
      'measures': [
        ...source.measures.map(_structuredMeasurePayload),
        ..._quotaMeasures(source, source),
      ],
      'movements': _structuredMovements(source),
    };

Map<String, Object?> _sourcePayload(EconDiagramState source) => {
      'axes': {'vertical': source.axisY, 'horizontal': source.axisX},
      'toolKind': source.toolKind,
      'policy': source.policy,
      'curves': source.curves.map(_curvePayload).toList(),
      'points': source.points.map((point) {
        final coordinate = diagramPointCoordinate(source, point);
        return {
          'priceLabel': point.priceLabel ?? 'P${point.labelIndex}',
          'quantityLabel': point.quantityLabel ?? 'Q${point.labelIndex}',
          'curveId': point.curveId,
          'pricePosition': _round(coordinate?.price ?? 0),
          'quantityPosition': _round(coordinate?.quantity ?? 0),
        };
      }).toList(),
      'equilibria': source.equilibria.map((point) {
        final coordinate = diagramEquilibriumCoordinate(source, point);
        return {
          'label': 'E${point.labelIndex}',
          'priceLabel': 'P${point.labelIndex}',
          'quantityLabel': 'Q${point.labelIndex}',
          'demandId': point.demandId,
          'supplyId': point.supplyId,
          'pricePosition': _round(coordinate?.price ?? 0),
          'quantityPosition': _round(coordinate?.quantity ?? 0),
        };
      }).toList(),
      'marketGaps': source.marketGaps.map((gap) {
        final geometry = marketGapGeometry(source, gap);
        return {
          'label': 'P${gap.labelIndex}',
          'intendedKind': gap.kind,
          'actualKind': geometry?.actualKind ?? 'unresolved',
          'pricePosition': _round(gap.pricePosition),
          'equilibriumPricePosition': _round(geometry?.equilibriumPrice ?? 0),
          'relativeToEquilibrium':
              geometry?.relativeToEquilibrium ?? 'unresolved',
          'demandId': gap.demandId,
          'supplyId': gap.supplyId,
          'demandQuantity': _round(geometry?.demandQuantity ?? 0),
          'supplyQuantity': _round(geometry?.supplyQuantity ?? 0),
          'quantityGap': _round(geometry == null
              ? 0
              : (geometry.demandQuantity - geometry.supplyQuantity).abs()),
        };
      }).toList(),
      'areas': source.areas.map(_areaPayload).toList(),
      'movements': _demandSupplyMovements(source),
      'strokes': source.strokes
          .map((stroke) => {
                'kind': stroke.kind,
                'points':
                    stroke.points.map((point) => point.toPayload()).toList(),
              })
          .toList(),
    };

double demandSupplyPriceAt(EconDiagramCurve curve, double quantity) {
  if (curve.shape == 'horizontal') return .5 + curve.position * .26;
  if (curve.shape == 'vertical') return .5;
  final centre =
      .5 + (curve.shiftAxis == 'vertical' ? 0 : curve.position * .26);
  final priceOffset = curve.shiftAxis == 'vertical' ? curve.position * .26 : 0;
  final direction = curve.kind == 'demand' ? -1 : 1;
  return .5 + priceOffset + direction * curve.steepness * (quantity - centre);
}

double demandSupplyQuantityAt(EconDiagramCurve curve, double price) {
  if (curve.shape == 'vertical') return .5 + curve.position * .26;
  if (curve.shape == 'horizontal') return .5;
  final centre =
      .5 + (curve.shiftAxis == 'vertical' ? 0 : curve.position * .26);
  final priceOffset = curve.shiftAxis == 'vertical' ? curve.position * .26 : 0;
  final slope = (curve.kind == 'demand' ? -1 : 1) * curve.steepness;
  return centre + (price - .5 - priceOffset) / slope;
}

EconDiagramCoordinate? demandSupplyIntersection(
    EconDiagramCurve first, EconDiagramCurve second) {
  if (first.shape == 'vertical') {
    final quantity = .5 + first.position * .26;
    return EconDiagramCoordinate(
        quantity: quantity,
        price: demandSupplyPriceAt(second, quantity).clamp(0, 1));
  }
  if (second.shape == 'vertical') {
    return demandSupplyIntersection(second, first);
  }
  if (first.shape == 'horizontal') {
    final price = .5 + first.position * .26;
    return EconDiagramCoordinate(
        quantity: demandSupplyQuantityAt(second, price).clamp(0, 1),
        price: price);
  }
  if (second.shape == 'horizontal') {
    return demandSupplyIntersection(second, first);
  }
  final firstSlope = (first.kind == 'demand' ? -1 : 1) * first.steepness;
  final secondSlope = (second.kind == 'demand' ? -1 : 1) * second.steepness;
  if ((firstSlope - secondSlope).abs() < .0001) return null;
  final firstCentre =
      .5 + (first.shiftAxis == 'vertical' ? 0 : first.position * .26);
  final secondCentre =
      .5 + (second.shiftAxis == 'vertical' ? 0 : second.position * .26);
  final firstOffset = first.shiftAxis == 'vertical' ? first.position * .26 : 0;
  final secondOffset =
      second.shiftAxis == 'vertical' ? second.position * .26 : 0;
  final firstIntercept = .5 + firstOffset - firstSlope * firstCentre;
  final secondIntercept = .5 + secondOffset - secondSlope * secondCentre;
  final quantity =
      (secondIntercept - firstIntercept) / (firstSlope - secondSlope);
  final price = firstSlope * quantity + firstIntercept;
  if (!quantity.isFinite || !price.isFinite) return null;
  return EconDiagramCoordinate(
      quantity: quantity.clamp(0, 1), price: price.clamp(0, 1));
}

EconDiagramCoordinate? diagramPointCoordinate(
    EconDiagramState state, EconDiagramPoint point) {
  final curve =
      state.curves.where((item) => item.id == point.curveId).firstOrNull;
  if (curve == null) return null;
  final anchored = point.anchorEquilibriumId == null
      ? null
      : state.equilibria
          .where((item) => item.id == point.anchorEquilibriumId)
          .firstOrNull;
  final quantity = anchored == null
      ? point.quantityPosition
      : diagramEquilibriumCoordinate(state, anchored)?.quantity ??
          point.quantityPosition;
  return EconDiagramCoordinate(
    quantity: curve.shape == 'vertical'
        ? (.5 + curve.position * .26).clamp(0, 1)
        : quantity.clamp(0, 1),
    price: curve.shape == 'vertical'
        ? point.quantityPosition.clamp(0, 1)
        : demandSupplyPriceAt(curve, quantity).clamp(0, 1),
  );
}

EconDiagramCoordinate? diagramEquilibriumCoordinate(
    EconDiagramState state, EconDiagramEquilibrium point) {
  final demand =
      state.curves.where((curve) => curve.id == point.demandId).firstOrNull;
  final supply =
      state.curves.where((curve) => curve.id == point.supplyId).firstOrNull;
  return demand == null || supply == null
      ? null
      : demandSupplyIntersection(demand, supply);
}

EconMarketGapGeometry? marketGapGeometry(
    EconDiagramState state, EconDiagramMarketGap gap) {
  final demand =
      state.curves.where((curve) => curve.id == gap.demandId).firstOrNull;
  final supply =
      state.curves.where((curve) => curve.id == gap.supplyId).firstOrNull;
  final equilibrium = demand == null || supply == null
      ? null
      : demandSupplyIntersection(demand, supply);
  if (demand == null || supply == null || equilibrium == null) return null;
  return EconMarketGapGeometry(
    price: gap.pricePosition,
    equilibriumPrice: equilibrium.price,
    demandQuantity:
        demandSupplyQuantityAt(demand, gap.pricePosition).clamp(0, 1),
    supplyQuantity:
        demandSupplyQuantityAt(supply, gap.pricePosition).clamp(0, 1),
  );
}

List<EconDiagramCoordinate> structuredCurvePoints(
  EconStructuredCurve curve, [
  int steps = 48,
  List<EconStructuredCurve> relatedCurves = const [],
]) {
  final domesticSupply = relatedCurves
      .where((item) => item.concept == 'domestic-supply')
      .firstOrNull;
  final worldPrice =
      relatedCurves.where((item) => item.concept == 'world-price').firstOrNull;
  final worldPriceLevel = worldPrice == null
      ? .34
      : (.5 + worldPrice.position * .28).clamp(.08, .88).toDouble();
  final quotaStart = domesticSupply == null
      ? .34
      : (.5 +
              (worldPriceLevel - .5) / domesticSupply.steepness +
              domesticSupply.position * .22)
          .clamp(.12, .62)
          .toDouble();
  final quotaEnd = (quotaStart + .26 + curve.position * .08)
      .clamp(quotaStart + .08, .9)
      .toDouble();
  return List.generate(steps + 1, (index) {
    final quantity = index / steps;
    final shifted = (quantity - .5 - curve.position * .22);
    final price = switch (curve.shape) {
      'up' => .5 + shifted * curve.steepness,
      'vertical' => index == 0 ? 0 : 1,
      'horizontal' => .5 + curve.position * .28,
      'ppf' => .88 - math.pow(quantity, 1.65) * .78 + curve.position * .18,
      'ppf-linear' => .9 - quantity * .8 + curve.position * .18,
      'u-shape' =>
        .24 + math.pow((quantity - .5 - curve.position * .16) * 2, 2) * .48,
      'quota-supply' => quantity <= quotaStart
          ? .5 + (quantity - .5) * (domesticSupply?.steepness ?? 1)
          : quantity <= quotaEnd
              ? worldPriceLevel
              : worldPriceLevel + (quantity - quotaEnd) * .9,
      _ => .5 - shifted * curve.steepness,
    };
    if (curve.shape == 'vertical') {
      return EconDiagramCoordinate(
          quantity: (.5 + curve.position * .22).clamp(.04, .96),
          price: price.toDouble());
    }
    return EconDiagramCoordinate(
        quantity: quantity, price: price.toDouble().clamp(.04, .96));
  });
}

String diagramCurveDisplayLabel(EconDiagramCurve curve) {
  final suffix = RegExp(r'\d+$').firstMatch(curve.label ?? '')?.group(0) ?? '';
  if (curve.policyShift == 'tax') return 'S + TAX';
  if (curve.policyShift == 'subsidy') return 'S + SUBSIDY';
  if (curve.displayLabel == 'mb') return '${curve.label} = MB$suffix';
  if (curve.displayLabel == 'mc') return '${curve.label} = MC$suffix';
  if (curve.displayLabel != null) {
    return '${curve.displayLabel!.toUpperCase()}$suffix';
  }
  return curve.label ?? curve.kind.toUpperCase();
}

List<Map<String, Object?>> _demandSupplyMovements(
  EconDiagramState state, {
  EconDiagramState? guideState,
}) {
  final result = <Map<String, Object?>>[];
  final concepts =
      state.curves.map((curve) => curve.concept ?? curve.kind).toSet();
  for (final concept in concepts) {
    final peers = state.curves
        .where((curve) => (curve.concept ?? curve.kind) == concept)
        .toList();
    for (var index = 1; index < peers.length; index++) {
      final from = peers[index - 1];
      final to = peers[index];
      final delta = to.position - from.position;
      result.add({
        'kind': 'curve',
        'from': diagramCurveDisplayLabel(from),
        'to': diagramCurveDisplayLabel(to),
        'direction': to.shiftAxis == 'vertical'
            ? (delta > 0 ? 'up' : 'down')
            : (delta > 0 ? 'right' : 'left'),
        'priceDirection':
            to.shiftAxis == 'vertical' ? (delta > 0 ? 'up' : 'down') : 'same',
        'quantityDirection': to.shiftAxis == 'vertical'
            ? 'same'
            : (delta > 0 ? 'right' : 'left'),
      });
    }
  }
  final guides = guideState ?? state;
  result.addAll(_guideMovements(
    guides.points.where((point) => point.quantityLabel == null).map((point) => (
          id: point.id,
          label:
              '${point.priceLabel ?? 'P${point.labelIndex}'}/${point.quantityLabel ?? 'Q${point.labelIndex}'}',
          labelIndex: point.labelIndex,
          coordinate: diagramPointCoordinate(guides, point),
        )),
    'point',
  ));
  result.addAll(_guideMovements(
    guides.equilibria.map((point) => (
          id: point.id,
          label: 'P${point.labelIndex}/Q${point.labelIndex}',
          labelIndex: point.labelIndex,
          coordinate: diagramEquilibriumCoordinate(guides, point),
        )),
    'equilibrium',
  ));
  return result;
}

List<Map<String, Object?>> _guideMovements(
  Iterable<
          ({
            String id,
            String label,
            int labelIndex,
            EconDiagramCoordinate? coordinate,
          })>
      guides,
  String kind,
) {
  final ordered = guides.where((guide) => guide.coordinate != null).toList()
    ..sort((left, right) => left.labelIndex.compareTo(right.labelIndex));
  final result = <Map<String, Object?>>[];
  for (var index = 1; index < ordered.length; index++) {
    final previous = ordered[index - 1];
    final current = ordered[index];
    final start = previous.coordinate!;
    final end = current.coordinate!;
    final priceDirection = _compareMovement(
      end.price,
      start.price,
      positive: 'up',
      negative: 'down',
    );
    final quantityDirection = _compareMovement(
      end.quantity,
      start.quantity,
      positive: 'right',
      negative: 'left',
    );
    if (priceDirection == 'same' && quantityDirection == 'same') continue;
    final direction = quantityDirection == 'same'
        ? priceDirection
        : priceDirection == 'same'
            ? quantityDirection
            : '$priceDirection-$quantityDirection';
    result.add({
      'kind': kind,
      'from': previous.label,
      'to': current.label,
      'direction': direction,
      'priceDirection': priceDirection,
      'quantityDirection': quantityDirection,
    });
  }
  return result;
}

String _compareMovement(
  double value,
  double reference, {
  required String positive,
  required String negative,
}) {
  if (value > reference + .015) return positive;
  if (value < reference - .015) return negative;
  return 'same';
}

List<Map<String, Object?>> _structuredMovements(
    EconStructuredDiagramState state) {
  final result = <Map<String, Object?>>[];
  for (final concept in state.curves.map((curve) => curve.concept).toSet()) {
    final peers =
        state.curves.where((curve) => curve.concept == concept).toList();
    for (var index = 1; index < peers.length; index++) {
      final delta = peers[index].position - peers[index - 1].position;
      result.add({
        'kind': 'curve',
        'concept': concept,
        'from': peers[index - 1].label,
        'to': peers[index].label,
        'direction': delta > 0
            ? 'right'
            : delta < 0
                ? 'left'
                : 'none',
      });
    }
  }
  return result;
}

(String, String?, String?) _structuredMarkerLabels(
    String kind, String concept, int index) {
  if (kind == 'as-ad') {
    if (concept == 'full-employment-output') return ('Yf', 'Yf', null);
    return ('E$index', 'Y$index', 'PL$index');
  }
  if (kind == 'money-market') return ('E$index', 'M$index', 'r$index');
  if (kind == 'ppf') {
    if (concept == 'production-point') return ('P$index', null, null);
    if (concept == 'consumption-point') return ('C$index', null, null);
  }
  return ('E$index', 'Q$index', 'P$index');
}

String _shortConceptLabel(String concept) {
  const labels = {
    'consumer-surplus': 'CS',
    'producer-surplus': 'PS',
    'total-social-surplus': 'TSS',
    'total-expenditure': 'TE',
    'total-expenditure-increase': 'TE+',
    'total-expenditure-decrease': 'TE-',
    'deadweight-loss': 'DWL',
    'tariff-revenue': 'TR',
    'quota-rent': 'QR',
    'gains-from-trade': 'GFT',
    'deflationary-gap': 'DG',
    'inflationary-gap': 'IG',
    'imports': 'M',
    'exports': 'X',
  };
  return labels[concept] ??
      concept
          .split('-')
          .where((part) => part.isNotEmpty)
          .map((part) => part[0].toUpperCase())
          .join();
}

List<EconDiagramCoordinate> _normalizePolygon(
    List<EconDiagramCoordinate> points) {
  final result = <EconDiagramCoordinate>[];
  for (final point in points) {
    final normalized = EconDiagramCoordinate(
      quantity: point.quantity.clamp(0, 1),
      price: point.price.clamp(0, 1),
    );
    if (result.isEmpty ||
        math.sqrt(math.pow(result.last.quantity - normalized.quantity, 2) +
                math.pow(result.last.price - normalized.price, 2)) >=
            .025) {
      result.add(normalized);
    }
  }
  if (result.length <= 3) return result;
  final hull = _convexHull(result);
  if (hull.length <= 8) return hull;
  return List.generate(
      8, (index) => hull[(index * (hull.length - 1) / 7).round()]);
}

List<EconDiagramAreaAnchor> _anchorsForNormalizedPoints(
  List<EconDiagramCoordinate> original,
  List<EconDiagramCoordinate> normalized,
  List<EconDiagramAreaAnchor> anchors,
) {
  if (anchors.length != original.length) return const [];
  return [
    for (final point in normalized)
      anchors[_nearestPointIndex(original, point)],
  ];
}

List<EconStructuredAreaAnchor> _structuredAnchorsForNormalizedPoints(
  List<EconDiagramCoordinate> original,
  List<EconDiagramCoordinate> normalized,
  List<EconStructuredAreaAnchor> anchors,
) {
  if (anchors.length != original.length) return const [];
  return [
    for (final point in normalized)
      anchors[_nearestPointIndex(original, point)],
  ];
}

int _nearestPointIndex(
    List<EconDiagramCoordinate> points, EconDiagramCoordinate target) {
  var index = 0;
  var distance = double.infinity;
  for (var candidate = 0; candidate < points.length; candidate++) {
    final next = _coordinateDistance(points[candidate], target);
    if (next < distance) {
      distance = next;
      index = candidate;
    }
  }
  return index;
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

double _polygonArea(List<EconDiagramCoordinate> points) {
  if (points.length < 3) return 0;
  var sum = 0.0;
  for (var index = 0; index < points.length; index++) {
    final next = points[(index + 1) % points.length];
    sum += points[index].quantity * next.price -
        next.quantity * points[index].price;
  }
  return sum.abs() / 2;
}

double _coordinateDistance(
        EconDiagramCoordinate left, EconDiagramCoordinate right) =>
    math.sqrt(math.pow(left.quantity - right.quantity, 2) +
        math.pow(left.price - right.price, 2));

bool _isStructuredMeasureConcept(String concept) =>
    concept.contains('gap') ||
    concept == 'imports' ||
    concept == 'exports' ||
    concept == 'quota';

List<({EconDiagramCoordinate point, List<String> ids})>
    _structuredIntersectionAnchors(EconStructuredDiagramState state) {
  final segments =
      <({String id, EconDiagramCoordinate start, EconDiagramCoordinate end})>[];
  for (final curve in state.curves) {
    final points = structuredCurvePoints(curve, 96, state.curves);
    for (var index = 1; index < points.length; index++) {
      segments
          .add((id: curve.id, start: points[index - 1], end: points[index]));
    }
  }
  final anchors = <({EconDiagramCoordinate point, List<String> ids})>[
    (point: const EconDiagramCoordinate(quantity: 0, price: 0), ids: const []),
    (point: const EconDiagramCoordinate(quantity: 0, price: 1), ids: const []),
    (point: const EconDiagramCoordinate(quantity: 1, price: 0), ids: const []),
  ];
  for (var first = 0; first < segments.length; first++) {
    for (var second = first + 1; second < segments.length; second++) {
      if (segments[first].id == segments[second].id) continue;
      final point = _lineSegmentIntersection(
        segments[first].start,
        segments[first].end,
        segments[second].start,
        segments[second].end,
      );
      if (point != null) {
        anchors.add(
            (point: point, ids: [segments[first].id, segments[second].id]));
      }
    }
    for (final axis in const [
      (
        EconDiagramCoordinate(quantity: 0, price: 0),
        EconDiagramCoordinate(quantity: 1, price: 0)
      ),
      (
        EconDiagramCoordinate(quantity: 0, price: 0),
        EconDiagramCoordinate(quantity: 0, price: 1)
      ),
    ]) {
      final point = _lineSegmentIntersection(
          segments[first].start, segments[first].end, axis.$1, axis.$2);
      if (point != null) anchors.add((point: point, ids: [segments[first].id]));
    }
  }
  final unique = <({EconDiagramCoordinate point, List<String> ids})>[];
  for (final anchor in anchors..sort((a, b) => b.ids.length - a.ids.length)) {
    if (!unique
        .any((item) => _coordinateDistance(item.point, anchor.point) < .012)) {
      unique.add(anchor);
    }
  }
  return unique;
}

({EconDiagramCoordinate point, List<String> ids})? _nearestStructuredAnchor(
  EconStructuredDiagramState state,
  EconDiagramCoordinate coordinate,
  double tolerance,
) {
  final anchors = _structuredIntersectionAnchors(state)
      .map((anchor) => (
            point: anchor.point,
            ids: anchor.ids,
            distance: _coordinateDistance(anchor.point, coordinate),
          ))
      .toList()
    ..sort((left, right) => left.distance.compareTo(right.distance));
  if (anchors.isNotEmpty && anchors.first.distance <= tolerance) {
    return (point: anchors.first.point, ids: anchors.first.ids);
  }
  final curveAnchors =
      <({EconDiagramCoordinate point, String id, double distance})>[];
  for (final curve in state.curves) {
    for (final point in structuredCurvePoints(curve, 96, state.curves)) {
      curveAnchors.add((
        point: point,
        id: curve.id,
        distance: _coordinateDistance(point, coordinate),
      ));
    }
  }
  curveAnchors.sort((left, right) => left.distance.compareTo(right.distance));
  if (curveAnchors.isEmpty || curveAnchors.first.distance > tolerance) {
    return null;
  }
  return (point: curveAnchors.first.point, ids: [curveAnchors.first.id]);
}

EconDiagramCoordinate? _lineSegmentIntersection(
  EconDiagramCoordinate firstStart,
  EconDiagramCoordinate firstEnd,
  EconDiagramCoordinate secondStart,
  EconDiagramCoordinate secondEnd,
) {
  final x1 = firstStart.quantity;
  final y1 = firstStart.price;
  final x2 = firstEnd.quantity;
  final y2 = firstEnd.price;
  final x3 = secondStart.quantity;
  final y3 = secondStart.price;
  final x4 = secondEnd.quantity;
  final y4 = secondEnd.price;
  final denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (denominator.abs() < .000001) return null;
  final firstDeterminant = x1 * y2 - y1 * x2;
  final secondDeterminant = x3 * y4 - y3 * x4;
  final quantity =
      (firstDeterminant * (x3 - x4) - (x1 - x2) * secondDeterminant) /
          denominator;
  final price = (firstDeterminant * (y3 - y4) - (y1 - y2) * secondDeterminant) /
      denominator;
  const margin = .004;
  bool within(EconDiagramCoordinate start, EconDiagramCoordinate end) =>
      quantity >= math.min(start.quantity, end.quantity) - margin &&
      quantity <= math.max(start.quantity, end.quantity) + margin &&
      price >= math.min(start.price, end.price) - margin &&
      price <= math.max(start.price, end.price) + margin;
  if (!within(firstStart, firstEnd) || !within(secondStart, secondEnd)) {
    return null;
  }
  return EconDiagramCoordinate(
    quantity: quantity.clamp(0.0, 1.0),
    price: price.clamp(0.0, 1.0),
  );
}

int _nextSequence(EconDiagramState state) {
  final ids = <String>[
    ...state.curves.map((item) => item.id),
    ...state.points.map((item) => item.id),
    ...state.equilibria.map((item) => item.id),
    ...state.marketGaps.map((item) => item.id),
    ...state.areas.map((item) => item.id),
    ...state.strokes.map((item) => item.id),
  ];
  return ids
          .map((id) =>
              int.tryParse(RegExp(r'(\d+)$').firstMatch(id)?.group(1) ?? '') ??
              0)
          .fold(0, math.max) +
      1;
}

int _nextStructuredSequence(EconStructuredDiagramState state) {
  final ids = <String>[
    ...state.curves.map((item) => item.id),
    ...state.markers.map((item) => item.id),
    ...state.areas.map((item) => item.id),
    ...state.measures.map((item) => item.id),
  ];
  return ids
          .map((id) =>
              int.tryParse(RegExp(r'(\d+)$').firstMatch(id)?.group(1) ?? '') ??
              0)
          .fold(0, math.max) +
      1;
}

int _nextGuideIndex(EconDiagramState state) =>
    [
      ...state.points.map((point) => point.labelIndex),
      ...state.equilibria.map((point) => point.labelIndex),
      ...state.marketGaps.map((gap) => gap.guideLabelIndex ?? gap.labelIndex),
    ].fold(0, math.max) +
    1;

EconDiagramState _replaceState(
  EconDiagramState state, {
  List<EconDiagramCurve>? curves,
  List<EconDiagramPoint>? points,
  List<EconDiagramEquilibrium>? equilibria,
  List<EconDiagramMarketGap>? marketGaps,
  List<EconDiagramArea>? areas,
  List<EconDiagramStroke>? strokes,
  String? toolKind,
  String? policy,
  String? selectedCurveId,
  String? selectedMarketGapId,
  EconStructuredDiagramState? structured,
  bool clearSelectedCurve = false,
  bool clearSelectedGap = false,
}) =>
    EconDiagramState(
      version: state.version,
      axisX: state.axisX,
      axisY: state.axisY,
      curves: curves ?? state.curves,
      points: points ?? state.points,
      equilibria: equilibria ?? state.equilibria,
      marketGaps: marketGaps ?? state.marketGaps,
      areas: areas ?? state.areas,
      strokes: strokes ?? state.strokes,
      toolKind: toolKind ?? state.toolKind,
      policy: policy ?? state.policy,
      selectedCurveId:
          clearSelectedCurve ? null : selectedCurveId ?? state.selectedCurveId,
      selectedMarketGapId: clearSelectedGap
          ? null
          : selectedMarketGapId ?? state.selectedMarketGapId,
      structured: structured ?? state.structured,
    );

double _round(double value) => (value * 1000).round() / 1000;

extension _FirstOrNull<T> on Iterable<T> {
  T? get firstOrNull => isEmpty ? null : first;
}
