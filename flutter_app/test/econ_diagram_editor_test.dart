import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/econ/econ_diagram_editor.dart';
import 'package:dope_english/features/econ/econ_diagram_domain.dart';
import 'package:dope_english/features/econ/econ_diagram_models.dart';

void main() {
  test('numbers duplicate shaded-area labels', () {
    expect(econNumberedAreaLabel('TE', 1, 2), 'TE1');
    expect(econNumberedAreaLabel('TE', 2, 2), 'TE2');
    expect(econNumberedAreaLabel('CS', 1, 1), 'CS');
  });

  test('creates separate P/Q movement lanes for consecutive guides', () {
    const curve = EconDiagramCurve(
      id: 'demand-1',
      kind: 'demand',
      label: 'D',
      position: 0,
      steepness: 1,
    );
    const state = EconDiagramState(
      curves: [curve],
      points: [
        EconDiagramPoint(
          id: 'point-1',
          curveId: 'demand-1',
          labelIndex: 1,
          quantityPosition: .3,
        ),
        EconDiagramPoint(
          id: 'point-2',
          curveId: 'demand-1',
          labelIndex: 2,
          quantityPosition: .5,
        ),
        EconDiagramPoint(
          id: 'point-3',
          curveId: 'demand-1',
          labelIndex: 3,
          quantityPosition: .7,
        ),
      ],
    );

    final movements = econGuideMovements(state, state);
    expect(movements, hasLength(2));
    expect(
      movements.map(
          (movement) => (movement.fromIndex, movement.toIndex, movement.lane)),
      [(1, 2, 0), (2, 3, 1)],
    );
    expect(movements[0].from.price, greaterThan(movements[0].to.price));
    expect(movements[0].from.quantity, lessThan(movements[0].to.quantity));
  });

  test('creates price, demand-quantity and supply-quantity gap movements', () {
    const state = EconDiagramState(
      curves: [
        EconDiagramCurve(
          id: 'demand-1',
          kind: 'demand',
          label: 'D',
          position: 0,
          steepness: 1,
        ),
        EconDiagramCurve(
          id: 'supply-1',
          kind: 'supply',
          label: 'S',
          position: 0,
          steepness: 1,
        ),
      ],
      marketGaps: [
        EconDiagramMarketGap(
          id: 'gap-1',
          kind: 'shortage',
          demandId: 'demand-1',
          supplyId: 'supply-1',
          labelIndex: 1,
          guideLabelIndex: 1,
          pricePosition: .35,
          quantitiesMarked: true,
        ),
        EconDiagramMarketGap(
          id: 'gap-2',
          kind: 'shortage',
          demandId: 'demand-1',
          supplyId: 'supply-1',
          labelIndex: 2,
          guideLabelIndex: 2,
          pricePosition: .5,
          quantitiesMarked: true,
        ),
        EconDiagramMarketGap(
          id: 'gap-3',
          kind: 'shortage',
          demandId: 'demand-1',
          supplyId: 'supply-1',
          labelIndex: 3,
          guideLabelIndex: 3,
          pricePosition: .65,
          quantitiesMarked: true,
        ),
      ],
    );

    final movements = econMarketGapGuideMovements(state, state);
    expect(movements, hasLength(2));
    expect(
      movements.map(
          (movement) => (movement.fromIndex, movement.toIndex, movement.lane)),
      [(1, 2, 0), (2, 3, 1)],
    );
    expect(movements[0].from.price, lessThan(movements[0].to.price));
    expect(movements[0].from.demandQuantity,
        greaterThan(movements[0].to.demandQuantity));
    expect(movements[0].from.supplyQuantity,
        lessThan(movements[0].to.supplyQuantity));
  });

  testWidgets('adds curves and an equilibrium guide to serializable state',
      (tester) async {
    EconDiagramState state = const EconDiagramState();
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: SingleChildScrollView(
            child: StatefulBuilder(
              builder: (context, setState) => EconDiagramEditor(
                value: state,
                onChanged: (next) => setState(() => state = next),
              ),
            ),
          ),
        ),
      ),
    );

    await tester.tap(find.byKey(const Key('econ-tool-demand')));
    await tester.pump();
    await tester.tap(find.byKey(const Key('econ-tool-supply')));
    await tester.pump();
    final canvas = find.byKey(const Key('econ-diagram-canvas'));
    final rect = tester.getRect(canvas);
    await tester.dragFrom(
      Offset(rect.left + 54, rect.top + rect.height / 2),
      Offset(rect.width / 2 - 54, 0),
    );
    await tester.pump();

    expect(state.curves.map((curve) => curve.kind), ['demand', 'supply']);
    expect(state.equilibria, hasLength(1));
    expect(state.toJson()['equilibria'], isNotEmpty);
    expect(find.byKey(const Key('econ-diagram-editor')), findsOneWidget);
  });

  testWidgets('undo and redo restore the complete state', (tester) async {
    EconDiagramState state = const EconDiagramState();
    await tester.pumpWidget(MaterialApp(
      home: SingleChildScrollView(
        child: StatefulBuilder(
          builder: (context, setState) => EconDiagramEditor(
            value: state,
            onChanged: (next) => setState(() => state = next),
          ),
        ),
      ),
    ));

    await tester.tap(find.byKey(const Key('econ-tool-demand')));
    await tester.pump();
    expect(state.curves, hasLength(1));
    await tester.tap(find.byTooltip('復原'));
    await tester.pump();
    expect(state.curves, isEmpty);
    await tester.tap(find.byTooltip('重做'));
    await tester.pump();
    expect(state.curves, hasLength(1));
  });

  testWidgets('curve drag previews locally and commits only once on release',
      (tester) async {
    tester.view.physicalSize = const Size(800, 1000);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    EconDiagramState state = const EconDiagramState();
    var dragChanges = 0;
    final interactions = <bool>[];
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: StatefulBuilder(
            builder: (context, setState) => EconDiagramEditor(
              value: state,
              onInteractionChanged: interactions.add,
              onChanged: (next) {
                dragChanges += 1;
                setState(() => state = next);
              },
            ),
          ),
        ),
      ),
    );
    await tester.tap(find.byKey(const Key('econ-tool-demand')));
    await tester.pump();
    dragChanges = 0;
    final initialPosition = state.curves.single.position;

    final rect = tester.getRect(find.byKey(const Key('econ-diagram-canvas')));
    final gesture = await tester.startGesture(rect.center);
    await gesture.moveBy(const Offset(28, 0));
    await tester.pump();

    expect(dragChanges, 0);
    expect(state.curves.single.position, initialPosition);
    expect(interactions, contains(true));

    await gesture.up();
    await tester.pump();
    expect(dragChanges, 1);
    expect(state.curves.single.position, greaterThan(initialPosition));
    expect(interactions.last, isFalse);
  });

  testWidgets('canvas pointer locks the parent scroll during a curve drag',
      (tester) async {
    tester.view.physicalSize = const Size(390, 600);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    EconDiagramState state = const EconDiagramState();
    var interacting = false;
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: StatefulBuilder(
            builder: (context, setState) => SingleChildScrollView(
              key: const Key('diagram-parent-scroll'),
              physics: interacting
                  ? const NeverScrollableScrollPhysics()
                  : const BouncingScrollPhysics(),
              child: EconDiagramEditor(
                value: state,
                onInteractionChanged: (active) =>
                    setState(() => interacting = active),
                onChanged: (next) => setState(() => state = next),
              ),
            ),
          ),
        ),
      ),
    );
    await tester.tap(find.byKey(const Key('econ-tool-demand')));
    await tester.pump();

    final canvas = find.byKey(const Key('econ-diagram-canvas'));
    final rect = tester.getRect(canvas);
    final gesture = await tester.startGesture(rect.center);
    await tester.pump();
    expect(
      tester
          .widget<SingleChildScrollView>(
            find.byKey(const Key('diagram-parent-scroll')),
          )
          .physics,
      isA<NeverScrollableScrollPhysics>(),
    );
    await gesture.moveBy(const Offset(26, 0));
    await tester.pump();
    await gesture.up();
    await tester.pump();

    expect(state.curves.single.position, greaterThan(0));
    expect(
      tester
          .widget<SingleChildScrollView>(
            find.byKey(const Key('diagram-parent-scroll')),
          )
          .physics,
      isA<BouncingScrollPhysics>(),
    );
  });

  testWidgets('editor controls can scroll the question outside the canvas',
      (tester) async {
    tester.view.physicalSize = const Size(390, 600);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    EconDiagramState state = const EconDiagramState();
    var interacting = false;
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: StatefulBuilder(
            builder: (context, setState) => SingleChildScrollView(
              key: const Key('diagram-empty-parent-scroll'),
              physics: interacting
                  ? const NeverScrollableScrollPhysics()
                  : const BouncingScrollPhysics(),
              child: Column(
                children: [
                  EconDiagramEditor(
                    value: state,
                    onInteractionChanged: (active) =>
                        setState(() => interacting = active),
                    onChanged: (next) => setState(() => state = next),
                  ),
                  const SizedBox(height: 500),
                ],
              ),
            ),
          ),
        ),
      ),
    );
    await tester.tap(find.byKey(const Key('econ-tool-demand')));
    await tester.pump();

    final scrollable = tester.state<ScrollableState>(
      find.descendant(
        of: find.byKey(const Key('diagram-empty-parent-scroll')),
        matching: find.byType(Scrollable),
      ),
    );
    expect(scrollable.position.maxScrollExtent, greaterThan(0));
    await tester.drag(
      find.byKey(const Key('econ-tool-demand')),
      const Offset(0, -140),
    );
    await tester.pumpAndSettle();

    expect(interacting, isFalse);
    expect(scrollable.position.pixels, greaterThan(0));
  });

  testWidgets('price-axis guide previews during drag and commits on release',
      (tester) async {
    EconDiagramState state = const EconDiagramState();
    await tester.pumpWidget(MaterialApp(
      home: SingleChildScrollView(
        child: StatefulBuilder(
          builder: (context, setState) => EconDiagramEditor(
            value: state,
            onChanged: (next) => setState(() => state = next),
          ),
        ),
      ),
    ));
    await tester.tap(find.byKey(const Key('econ-tool-demand')));
    await tester.pump();
    await tester.tap(find.byKey(const Key('econ-tool-supply')));
    await tester.pump();

    final rect = tester.getRect(find.byKey(const Key('econ-diagram-canvas')));
    final gesture = await tester.startGesture(
      Offset(rect.left + 54, rect.top + rect.height / 2),
    );
    await gesture.moveTo(Offset(rect.center.dx, rect.center.dy));
    await tester.pump();
    expect(state.equilibria, isEmpty);

    await gesture.up();
    await tester.pump();
    expect(state.equilibria, hasLength(1));
  });

  testWidgets('shade trace captures anchors before choosing the area label',
      (tester) async {
    EconDiagramState state = const EconDiagramState();
    await tester.pumpWidget(MaterialApp(
      home: SingleChildScrollView(
        child: StatefulBuilder(
          builder: (context, setState) => EconDiagramEditor(
            value: state,
            onChanged: (next) => setState(() => state = next),
          ),
        ),
      ),
    ));
    await tester.tap(find.byKey(const Key('econ-tool-demand')));
    await tester.pump();
    await tester.tap(find.byKey(const Key('econ-tool-supply')));
    await tester.pump();
    await tester.tap(find.byKey(const Key('econ-tool-shade')));
    await tester.pump();
    expect(find.text('較平'), findsNothing);

    final rect = tester.getRect(find.byKey(const Key('econ-diagram-canvas')));
    final left = rect.left + 54;
    final top = rect.top + 25;
    final right = rect.right - 28;
    final bottom = rect.bottom - 42;
    final gesture = await tester.startGesture(Offset(left, bottom));
    await gesture.moveTo(Offset(left, top));
    await tester.pump();
    await gesture.moveTo(Offset((left + right) / 2, (top + bottom) / 2));
    await tester.pump();
    await gesture.up();
    await tester.pump();

    expect(state.areas, isEmpty);
    expect(find.byKey(const Key('econ-area-consumer-surplus')), findsOneWidget);
    expect(find.text('較平'), findsNothing);
    await tester
        .ensureVisible(find.byKey(const Key('econ-area-consumer-surplus')));
    await tester.pump();
    await tester.tap(find.byKey(const Key('econ-area-consumer-surplus')));
    await tester.pump();
    expect(state.areas, hasLength(1));
  });

  testWidgets('second price guide anchor uses the same touch tolerance',
      (tester) async {
    tester.view.physicalSize = const Size(390, 900);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    var state = addDemandSupplyCurve(const EconDiagramState(), 'demand');
    state = addDemandSupplyCurve(state, 'supply');
    final supplyId =
        state.curves.firstWhere((curve) => curve.kind == 'supply').id;
    state = addPointOnCurve(state, supplyId, .30);
    state = addPointOnCurve(state, supplyId, .62);
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: SingleChildScrollView(
            child: StatefulBuilder(
              builder: (context, setState) => EconDiagramEditor(
                value: state,
                onChanged: (next) => setState(() => state = next),
              ),
            ),
          ),
        ),
      ),
    );
    await tester.tap(find.byKey(const Key('econ-tool-shade')));
    await tester.pump();

    final secondGuide = diagramPointCoordinate(state, state.points.last)!;
    final rect = tester.getRect(find.byKey(const Key('econ-diagram-canvas')));
    final left = rect.left + 54;
    final top = rect.top + 25;
    final right = rect.right - 28;
    final bottom = rect.bottom - 42;
    Offset point(EconDiagramCoordinate value) => Offset(
          left + value.quantity * (right - left),
          bottom - value.price * (bottom - top),
        );
    final gesture = await tester.startGesture(
      Offset(left + 24, point(secondGuide).dy),
    );
    await gesture.moveTo(point(secondGuide) + const Offset(0, 20));
    await tester.pump();
    await gesture.moveTo(Offset(point(secondGuide).dx, bottom - 20));
    await tester.pump();
    await gesture.up();
    await tester.pump();

    expect(find.byKey(const Key('econ-area-consumer-surplus')), findsOneWidget);
  });

  testWidgets('structured diagram exposes and stores the legacy curve presets',
      (tester) async {
    EconDiagramState state = const EconDiagramState();
    await tester.pumpWidget(MaterialApp(
      home: SingleChildScrollView(
        child: StatefulBuilder(
          builder: (context, setState) => EconDiagramEditor(
            value: state,
            diagramKind: 'as-ad',
            requirements: const [
              {'objectType': 'curve', 'concept': 'ad'},
              {'objectType': 'marker', 'concept': 'output'},
            ],
            onChanged: (next) => setState(() => state = next),
          ),
        ),
      ),
    ));

    expect(find.text('總需求'), findsOneWidget);
    expect(find.text('短期總供應'), findsOneWidget);
    expect(find.text('長期總供應'), findsOneWidget);
    await tester.tap(find.byKey(const Key('econ-tool-ad')));
    await tester.pump();
    expect(state.toolKind, 'as-ad');
    expect(state.structured?.curves.single.concept, 'ad');
  });

  testWidgets('complete toolbar and responsive canvas fit a compact phone',
      (tester) async {
    tester.view.physicalSize = const Size(320, 900);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(const MaterialApp(
      home: Scaffold(
        body: SingleChildScrollView(
          child: EconDiagramEditor(
            value: EconDiagramState(),
            onChanged: _ignoreState,
          ),
        ),
      ),
    ));
    await tester.pump();

    expect(find.text('價格上限'), findsOneWidget);
    expect(find.text('價格下限'), findsOneWidget);
    expect(find.text('從量稅'), findsOneWidget);
    expect(find.text('從量津貼'), findsOneWidget);
    expect(find.byTooltip('放大'), findsNothing);
    expect(find.byTooltip('縮小'), findsNothing);
    expect(find.byTooltip('重做'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  for (final kind in const [
    'as-ad',
    'money-market',
    'trade-barrier',
    'monopoly',
    'ppf',
  ]) {
    testWidgets('$kind editor opens with its complete structured preset',
        (tester) async {
      EconDiagramState state = const EconDiagramState();
      await tester.pumpWidget(MaterialApp(
        home: Scaffold(
          body: SingleChildScrollView(
            child: StatefulBuilder(
              builder: (context, setState) => EconDiagramEditor(
                value: state,
                diagramKind: kind,
                onChanged: (next) => setState(() => state = next),
              ),
            ),
          ),
        ),
      ));
      await tester.pump();

      expect(find.byKey(const Key('econ-diagram-canvas')), findsOneWidget);
      expect(
          find.byKey(Key('econ-tool-${_firstConcept(kind)}')), findsOneWidget);
      expect(tester.takeException(), isNull);
    });
  }

  testWidgets('reference mode renders its source seed without editing tools',
      (tester) async {
    const source = EconDiagramState(
      curves: [
        EconDiagramCurve(
          id: 'source-demand-1',
          kind: 'demand',
          position: 0,
          steepness: 1,
          label: 'D',
        ),
      ],
    );
    await tester.pumpWidget(const MaterialApp(
      home: Scaffold(
        body: SingleChildScrollView(
          child: EconDiagramEditor(
            value: EconDiagramState(),
            sourceSeed: source,
            mode: 'reference',
            onChanged: _ignoreState,
          ),
        ),
      ),
    ));

    expect(find.text('作答圖'), findsOneWidget);
    expect(find.byKey(const Key('econ-tool-demand')), findsNothing);
    expect(find.byKey(const Key('econ-diagram-canvas')), findsOneWidget);
  });
}

void _ignoreState(EconDiagramState _) {}

String _firstConcept(String kind) => switch (kind) {
      'as-ad' => 'ad',
      'money-market' => 'money-demand',
      'trade-barrier' => 'domestic-demand',
      'monopoly' => 'demand',
      'ppf' => 'ppf',
      _ => 'demand',
    };
