import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/econ/econ_diagram_domain.dart';
import 'package:dope_english/features/econ/econ_diagram_models.dart';

void main() {
  test('demand/supply grading payload retains guides and relationships', () {
    var state = const EconDiagramState();
    state = addDemandSupplyCurve(state, 'demand');
    state = addDemandSupplyCurve(state, 'supply');
    state = addEquilibrium(state);
    state = addPointOnCurve(state, state.curves.first.id, .7);

    final payload = diagramGradingPayload(state);
    final points = payload['points']! as List;
    final equilibria = payload['equilibria']! as List;
    final curves = payload['curves']! as List;

    expect(points, hasLength(1));
    expect((points.first as Map)['curveId'], state.curves.first.id);
    expect((points.first as Map)['priceLabel'], 'P2');
    expect(equilibria, hasLength(1));
    expect((equilibria.first as Map)['demandId'], state.curves.first.id);
    expect((curves.first as Map)['type'], 'demand');
    expect((curves.first as Map)['relativePosition'], 'centre');
  });

  test('overlay source D0/S0 gets D1/S1 student curves and rightward movement',
      () {
    const source = EconDiagramState(
      curves: [
        EconDiagramCurve(
          id: 'source-demand-1',
          kind: 'demand',
          label: 'D0',
          position: 0,
          steepness: 1,
        ),
        EconDiagramCurve(
          id: 'source-supply-1',
          kind: 'supply',
          label: 'S0',
          position: 0,
          steepness: 1,
        ),
      ],
    );
    var combined = mergeDiagramSource(const EconDiagramState(), source);
    combined = addDemandSupplyCurve(combined, 'demand');
    combined = addDemandSupplyCurve(combined, 'supply');
    combined = addDemandSupplyCurve(combined, 'demand');
    final student = stripDiagramSource(combined, source);
    expect(combined.curves.map((curve) => curve.label),
        ['D0', 'S0', 'D1', 'S1', 'D2']);
    final movements =
        diagramGradingPayload(student, sourceSeed: source)['movements']!
            as List;
    expect(movements.map((item) => (item as Map)['from']), contains('D0'));
    expect(movements.map((item) => (item as Map)['to']), contains('D1'));
    expect(movements.map((item) => (item as Map)['from']), contains('D1'));
    expect(movements.map((item) => (item as Map)['to']), contains('D2'));
    final secondShift = movements
        .cast<Map>()
        .singleWhere((item) => item['from'] == 'D1' && item['to'] == 'D2');
    expect(secondShift['direction'], 'right');
  });

  test('grading payload records P1/Q1 to P2/Q2 by geometry, not suffix origin',
      () {
    const state = EconDiagramState(
      curves: [
        EconDiagramCurve(
          id: 'd1',
          kind: 'demand',
          label: 'D1',
          position: 0,
          steepness: 1,
        ),
        EconDiagramCurve(
          id: 's1',
          kind: 'supply',
          label: 'S1',
          position: 0,
          steepness: 1,
        ),
        EconDiagramCurve(
          id: 'd2',
          kind: 'demand',
          label: 'D2',
          position: .28,
          steepness: 1,
        ),
      ],
      equilibria: [
        EconDiagramEquilibrium(
          id: 'eq1',
          demandId: 'd1',
          supplyId: 's1',
          labelIndex: 1,
        ),
        EconDiagramEquilibrium(
          id: 'eq2',
          demandId: 'd2',
          supplyId: 's1',
          labelIndex: 2,
        ),
      ],
    );
    final movements =
        diagramGradingPayload(state)['movements']! as List<dynamic>;
    final guide = movements.cast<Map>().singleWhere(
        (movement) => movement['from'] == 'P1/Q1' && movement['to'] == 'P2/Q2');

    expect(guide['kind'], 'equilibrium');
    expect(guide['priceDirection'], 'up');
    expect(guide['quantityDirection'], 'right');
    expect(guide['direction'], 'up-right');
  });

  test('tax diagram readiness requires both equilibria and split price', () {
    var state = const EconDiagramState();
    state = addDemandSupplyCurve(state, 'demand');
    state = addDemandSupplyCurve(state, 'supply');
    state = addEquilibrium(state);
    state = addPolicySupplyShift(state, 'tax');

    expect(
      diagramReadyFor(
        state: state,
        kind: 'demand-supply',
        mode: 'create',
        policy: 'tax',
        requiresSplitPrice: true,
      ),
      isFalse,
    );

    state = addEquilibrium(state);
    final shifted = state.curves.last;
    final second = state.equilibria.last;
    state = state.copyWith(points: [
      ...state.points,
      EconDiagramPoint(
        id: 'point-split',
        curveId: shifted.id,
        labelIndex: 3,
        quantityPosition: .5,
        priceLabel: 'P3',
        quantityLabel: 'Q${second.labelIndex}',
        anchorEquilibriumId: second.id,
      ),
    ]);

    expect(
      diagramReadyFor(
        state: state,
        kind: 'demand-supply',
        mode: 'create',
        policy: 'tax',
        requiresSplitPrice: true,
      ),
      isTrue,
    );
    expect(diagramGradingPayload(state)['policy'], 'tax');
  });

  test('structured payload separates locked source curves from student work',
      () {
    const source = EconDiagramState(
      toolKind: 'monopoly',
      structured: EconStructuredDiagramState(
        kind: 'monopoly',
        axisX: 'Q',
        axisY: 'P / Cost / Revenue',
        curves: [
          EconStructuredCurve(
            id: 'source-demand-1',
            concept: 'demand',
            label: 'D',
            shape: 'down',
            position: 0,
            steepness: 1,
          ),
        ],
      ),
    );
    var student = emptyDiagramForKind('monopoly');
    student = addStructuredCurve(student, 'monopoly', 'mr');
    student = addStructuredMarker(
      student,
      'monopoly-equilibrium',
      const EconDiagramCoordinate(quantity: .45, price: .55),
    );

    final payload = diagramGradingPayload(student, sourceSeed: source);
    final structured = payload['structured']! as Map;
    final sourcePayload = structured['source']! as Map;

    expect((structured['curves']! as List).single['concept'], 'mr');
    expect((structured['markers']! as List).single['concept'],
        'monopoly-equilibrium');
    expect((sourcePayload['curves']! as List).single['concept'], 'demand');
    expect(
      diagramReadyFor(
        state: student,
        kind: 'monopoly',
        mode: 'continue',
      ),
      isTrue,
    );
  });

  test('source JSON round-trips every legacy state collection', () {
    final original = EconDiagramState.fromJson({
      'version': 1,
      'axisX': 'Q',
      'axisY': 'P',
      'toolKind': 'demand-supply',
      'curves': [
        {
          'id': 'source-demand-1',
          'kind': 'demand',
          'label': 'D',
          'position': 0,
          'steepness': 1,
        }
      ],
      'points': [
        {
          'id': 'source-point-2',
          'curveId': 'source-demand-1',
          'labelIndex': 1,
          'quantityPosition': .5,
        }
      ],
      'equilibria': const [],
      'marketGaps': const [],
      'areas': const [],
      'strokes': [
        {
          'id': 'source-stroke-3',
          'kind': 'line',
          'points': [
            {'quantity': 0, 'price': .5},
            {'quantity': 1, 'price': .5},
          ],
        }
      ],
    });

    final restored = EconDiagramState.fromJson(original.toJson());
    expect(restored.curves.single.id, 'source-demand-1');
    expect(restored.points.single.curveId, 'source-demand-1');
    expect(restored.strokes.single.points, hasLength(2));
  });

  test('overlay operations use source geometry but keep source objects locked',
      () {
    const source = EconDiagramState(curves: [
      EconDiagramCurve(
        id: 'source-demand-1',
        kind: 'demand',
        label: 'D',
        position: 0,
        steepness: 1,
      ),
      EconDiagramCurve(
        id: 'source-supply-1',
        kind: 'supply',
        label: 'S',
        position: 0,
        steepness: 1,
      ),
    ]);
    var student = const EconDiagramState();
    final combined = mergeDiagramSource(student, source);
    final withGuide = addEquilibrium(combined);
    student = stripDiagramSource(withGuide, source);

    expect(student.curves, isEmpty);
    expect(student.equilibria, hasLength(1));
    expect(student.equilibria.single.demandId, 'source-demand-1');
    final payload = diagramGradingPayload(student, sourceSeed: source);
    expect(payload['curves'], isEmpty);
    expect((payload['source']! as Map)['curves'], hasLength(2));
    expect(payload['equilibria'], hasLength(1));
  });

  test('policy split-price guide reuses the shifted equilibrium quantity', () {
    var state = const EconDiagramState();
    state = addDemandSupplyCurve(state, 'demand');
    state = addDemandSupplyCurve(state, 'supply');
    state = addEquilibrium(state);
    state = addPolicySupplyShift(state, 'subsidy');
    state = addEquilibrium(state);
    final shifted = state.equilibria.last;
    final coordinate = diagramEquilibriumCoordinate(state, shifted)!;
    final originalSupply = state.curves.firstWhere(
        (curve) => curve.kind == 'supply' && curve.policyShift == null);

    state = addPointOnCurve(state, originalSupply.id, coordinate.quantity);

    expect(state.points.single.priceLabel, 'P3');
    expect(state.points.single.quantityLabel, 'Q${shifted.labelIndex}');
    expect(state.points.single.anchorEquilibriumId, shifted.id);
    final point =
        (diagramGradingPayload(state)['points']! as List).single as Map;
    expect(point['quantityLabel'], 'Q${shifted.labelIndex}');
  });

  test('quota supply has an independent horizontal section', () {
    var state = emptyDiagramForKind('trade-barrier');
    state = addStructuredCurve(state, 'trade-barrier', 'domestic-supply');
    state = addStructuredCurve(state, 'trade-barrier', 'world-price');
    state = addStructuredCurve(state, 'trade-barrier', 'quota-supply');
    final structured = state.structured!;
    final quota = structured.curves.last;
    final points = structuredCurvePoints(quota, 48, structured.curves);
    final horizontalPairs = <int>[
      for (var index = 1; index < points.length; index++)
        if ((points[index].price - points[index - 1].price).abs() < .0001)
          index,
    ];

    expect(quota.shape, 'quota-supply');
    expect(horizontalPairs.length, greaterThan(3));
  });

  test('area anchors survive JSON and remain attached to diagram boundaries',
      () {
    const area = EconDiagramArea(
      id: 'area-1',
      kind: 'consumer-surplus',
      points: [
        EconDiagramCoordinate(quantity: 0, price: 1),
        EconDiagramCoordinate(quantity: .5, price: .5),
        EconDiagramCoordinate(quantity: 0, price: .5),
      ],
      anchors: [
        EconDiagramAreaAnchor(
          boundaryIds: ['axis-y', 'curve:demand-1'],
          fallback: EconDiagramCoordinate(quantity: 0, price: 1),
        ),
        EconDiagramAreaAnchor(
          boundaryIds: ['curve:demand-1', 'curve:supply-2'],
          fallback: EconDiagramCoordinate(quantity: .5, price: .5),
        ),
        EconDiagramAreaAnchor(
          boundaryIds: ['axis-y', 'guide:equilibrium-3:h'],
          fallback: EconDiagramCoordinate(quantity: 0, price: .5),
        ),
      ],
    );
    final restored = EconDiagramState.fromJson(
        const EconDiagramState(areas: [area]).toJson());

    expect(restored.areas.single.anchors, hasLength(3));
    expect(restored.areas.single.anchors[1].boundaryIds,
        ['curve:demand-1', 'curve:supply-2']);
  });

  test('structured axis drag creates an anchored guide at an intersection', () {
    var state = emptyDiagramForKind('as-ad');
    state = addStructuredCurve(state, 'as-ad', 'ad');
    state = addStructuredCurve(state, 'as-ad', 'sras');
    state = addStructuredGuideFromAxisDragState(state, .5, .6,
        concepts: const ['price-level']);

    final marker = state.structured!.markers.single;
    expect(marker.axisGuide, isTrue);
    expect(marker.anchorCurveIds, hasLength(2));
    expect(marker.verticalLabel, 'PL1');
    expect(marker.horizontalLabel, isNull);
  });

  test('shaded traces discard concave anchor detours', () {
    var state = const EconDiagramState();
    state = addDiagramArea(state, 'consumer-surplus', const [
      EconDiagramCoordinate(quantity: 0, price: 0),
      EconDiagramCoordinate(quantity: .5, price: .3),
      EconDiagramCoordinate(quantity: 1, price: 0),
      EconDiagramCoordinate(quantity: 1, price: 1),
      EconDiagramCoordinate(quantity: 0, price: 1),
    ]);

    final points = state.areas.single.points;
    expect(points, hasLength(4));
    expect(
        points.any((point) => point.quantity == 0 && point.price == 0), isTrue);
    expect(points.any((point) => point.quantity == .5 && point.price == .3),
        isFalse);
  });
}
