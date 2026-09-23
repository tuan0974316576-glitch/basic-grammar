class EconDiagramCoordinate {
  const EconDiagramCoordinate({required this.quantity, required this.price});

  final double quantity;
  final double price;

  factory EconDiagramCoordinate.fromJson(Map<String, dynamic> json) =>
      EconDiagramCoordinate(
        quantity: _number(json['quantity'] ?? json['quantityPosition']),
        price: _number(json['price'] ?? json['pricePosition']),
      );

  Map<String, Object?> toJson() => {'quantity': quantity, 'price': price};

  Map<String, Object?> toPayload() => {
        'quantityPosition': _round(quantity),
        'pricePosition': _round(price),
      };
}

class EconDiagramCurve {
  const EconDiagramCurve({
    required this.id,
    required this.kind,
    required this.position,
    required this.steepness,
    this.label,
    this.shape = 'normal',
    this.shiftAxis = 'horizontal',
    this.displayLabel,
    this.concept,
    this.quota = false,
    this.quotaBaseCurveId,
    this.policyShift,
  });

  final String id;
  final String kind;
  final double position;
  final double steepness;
  final String? label;
  final String shape;
  final String shiftAxis;
  final String? displayLabel;
  final String? concept;
  final bool quota;
  final String? quotaBaseCurveId;
  final String? policyShift;

  factory EconDiagramCurve.fromJson(Map<String, dynamic> json) =>
      EconDiagramCurve(
        id: '${json['id'] ?? ''}',
        kind: '${json['kind'] ?? json['type'] ?? 'demand'}',
        position: _number(json['position']),
        steepness: _number(json['steepness'], fallback: 1),
        label: _nullableText(json['label']),
        shape: '${json['shape'] ?? 'normal'}',
        shiftAxis: '${json['shiftAxis'] ?? 'horizontal'}',
        displayLabel: _nullableText(json['displayLabel']),
        concept: _nullableText(json['concept']),
        quota: json['quota'] == true,
        quotaBaseCurveId: _nullableText(json['quotaBaseCurveId']),
        policyShift: _nullableText(json['policyShift']),
      );

  EconDiagramCurve copyWith({
    double? position,
    double? steepness,
    String? label,
    String? shape,
    String? shiftAxis,
    String? displayLabel,
    String? concept,
    bool? quota,
    String? quotaBaseCurveId,
    String? policyShift,
  }) =>
      EconDiagramCurve(
        id: id,
        kind: kind,
        position: position ?? this.position,
        steepness: steepness ?? this.steepness,
        label: label ?? this.label,
        shape: shape ?? this.shape,
        shiftAxis: shiftAxis ?? this.shiftAxis,
        displayLabel: displayLabel ?? this.displayLabel,
        concept: concept ?? this.concept,
        quota: quota ?? this.quota,
        quotaBaseCurveId: quotaBaseCurveId ?? this.quotaBaseCurveId,
        policyShift: policyShift ?? this.policyShift,
      );

  Map<String, Object?> toJson() => {
        'id': id,
        'kind': kind,
        'label': label ?? kind.toUpperCase(),
        'position': position,
        'steepness': steepness,
        'shape': shape,
        'shiftAxis': shiftAxis,
        if (displayLabel != null) 'displayLabel': displayLabel,
        if (concept != null) 'concept': concept,
        if (quota) 'quota': true,
        if (quotaBaseCurveId != null) 'quotaBaseCurveId': quotaBaseCurveId,
        if (policyShift != null) 'policyShift': policyShift,
      };
}

class EconDiagramPoint {
  const EconDiagramPoint({
    required this.id,
    required this.curveId,
    required this.labelIndex,
    required this.quantityPosition,
    this.priceLabel,
    this.quantityLabel,
    this.anchorEquilibriumId,
  });

  final String id;
  final String curveId;
  final int labelIndex;
  final double quantityPosition;
  final String? priceLabel;
  final String? quantityLabel;
  final String? anchorEquilibriumId;

  factory EconDiagramPoint.fromJson(Map<String, dynamic> json) =>
      EconDiagramPoint(
        id: '${json['id'] ?? ''}',
        curveId: '${json['curveId'] ?? ''}',
        labelIndex: _integer(json['labelIndex'], fallback: 1),
        quantityPosition: _number(json['quantityPosition'] ?? json['quantity']),
        priceLabel: _nullableText(json['priceLabel']),
        quantityLabel: _nullableText(json['quantityLabel']),
        anchorEquilibriumId: _nullableText(json['anchorEquilibriumId']),
      );

  EconDiagramPoint copyWith({double? quantityPosition}) => EconDiagramPoint(
        id: id,
        curveId: curveId,
        labelIndex: labelIndex,
        quantityPosition: quantityPosition ?? this.quantityPosition,
        priceLabel: priceLabel,
        quantityLabel: quantityLabel,
        anchorEquilibriumId: anchorEquilibriumId,
      );

  Map<String, Object?> toJson() => {
        'id': id,
        'curveId': curveId,
        'labelIndex': labelIndex,
        'quantityPosition': quantityPosition,
        if (priceLabel != null) 'priceLabel': priceLabel,
        if (quantityLabel != null) 'quantityLabel': quantityLabel,
        if (anchorEquilibriumId != null)
          'anchorEquilibriumId': anchorEquilibriumId,
      };
}

class EconDiagramEquilibrium {
  const EconDiagramEquilibrium({
    required this.id,
    required this.demandId,
    required this.supplyId,
    required this.labelIndex,
  });

  final String id;
  final String demandId;
  final String supplyId;
  final int labelIndex;

  factory EconDiagramEquilibrium.fromJson(Map<String, dynamic> json) =>
      EconDiagramEquilibrium(
        id: '${json['id'] ?? ''}',
        demandId: '${json['demandId'] ?? ''}',
        supplyId: '${json['supplyId'] ?? ''}',
        labelIndex: _integer(json['labelIndex'], fallback: 1),
      );

  Map<String, Object?> toJson() => {
        'id': id,
        'demandId': demandId,
        'supplyId': supplyId,
        'labelIndex': labelIndex,
      };
}

class EconDiagramMarketGap {
  const EconDiagramMarketGap({
    required this.id,
    required this.kind,
    required this.demandId,
    required this.supplyId,
    required this.labelIndex,
    required this.pricePosition,
    this.policyKind,
    this.guideLabelIndex,
    this.quantitiesMarked = false,
  });

  final String id;
  final String kind;
  final String demandId;
  final String supplyId;
  final int labelIndex;
  final double pricePosition;
  final String? policyKind;
  final int? guideLabelIndex;
  final bool quantitiesMarked;

  factory EconDiagramMarketGap.fromJson(Map<String, dynamic> json) =>
      EconDiagramMarketGap(
        id: '${json['id'] ?? ''}',
        kind: '${json['kind'] ?? 'shortage'}',
        demandId: '${json['demandId'] ?? ''}',
        supplyId: '${json['supplyId'] ?? ''}',
        labelIndex: _integer(json['labelIndex'], fallback: 1),
        pricePosition: _number(json['pricePosition'], fallback: .5),
        policyKind: _nullableText(json['policyKind']),
        guideLabelIndex: json['guideLabelIndex'] is num
            ? (json['guideLabelIndex'] as num).toInt()
            : null,
        quantitiesMarked: json['quantitiesMarked'] == true,
      );

  EconDiagramMarketGap copyWith({
    double? pricePosition,
    bool? quantitiesMarked,
    int? guideLabelIndex,
  }) =>
      EconDiagramMarketGap(
        id: id,
        kind: kind,
        demandId: demandId,
        supplyId: supplyId,
        labelIndex: labelIndex,
        pricePosition: pricePosition ?? this.pricePosition,
        policyKind: policyKind,
        guideLabelIndex: guideLabelIndex ?? this.guideLabelIndex,
        quantitiesMarked: quantitiesMarked ?? this.quantitiesMarked,
      );

  Map<String, Object?> toJson() => {
        'id': id,
        'kind': kind,
        'demandId': demandId,
        'supplyId': supplyId,
        'labelIndex': labelIndex,
        'pricePosition': pricePosition,
        if (policyKind != null) 'policyKind': policyKind,
        if (guideLabelIndex != null) 'guideLabelIndex': guideLabelIndex,
        'quantitiesMarked': quantitiesMarked,
      };
}

class EconDiagramArea {
  const EconDiagramArea({
    required this.id,
    required this.kind,
    this.referenceIds = const [],
    this.points = const [],
    this.anchors = const [],
  });

  final String id;
  final String kind;
  final List<String> referenceIds;
  final List<EconDiagramCoordinate> points;
  final List<EconDiagramAreaAnchor> anchors;

  factory EconDiagramArea.fromJson(Map<String, dynamic> json) =>
      EconDiagramArea(
        id: '${json['id'] ?? ''}',
        kind: '${json['kind'] ?? 'area'}',
        referenceIds: _strings(json['referenceIds']),
        points: _maps(json['points'])
            .map(EconDiagramCoordinate.fromJson)
            .toList(growable: false),
        anchors: _maps(json['anchors'])
            .map(EconDiagramAreaAnchor.fromJson)
            .toList(growable: false),
      );

  Map<String, Object?> toJson() => {
        'id': id,
        'kind': kind,
        'referenceIds': referenceIds,
        'points': points.map((point) => point.toJson()).toList(),
        if (anchors.isNotEmpty)
          'anchors': anchors.map((anchor) => anchor.toJson()).toList(),
      };
}

class EconDiagramAreaAnchor {
  const EconDiagramAreaAnchor({
    required this.boundaryIds,
    required this.fallback,
  });

  final List<String> boundaryIds;
  final EconDiagramCoordinate fallback;

  factory EconDiagramAreaAnchor.fromJson(Map<String, dynamic> json) =>
      EconDiagramAreaAnchor(
        boundaryIds: _strings(json['boundaryIds']),
        fallback: EconDiagramCoordinate.fromJson(
            _map(json['fallback']) ?? const <String, dynamic>{}),
      );

  Map<String, Object?> toJson() => {
        'boundaryIds': boundaryIds,
        'fallback': fallback.toJson(),
      };
}

class EconDiagramStroke {
  const EconDiagramStroke({
    required this.id,
    required this.points,
    this.kind = 'shade',
    this.label,
  });

  final String id;
  final List<EconDiagramCoordinate> points;
  final String kind;
  final String? label;

  factory EconDiagramStroke.fromJson(Map<String, dynamic> json) =>
      EconDiagramStroke(
        id: '${json['id'] ?? ''}',
        kind: '${json['kind'] ?? 'line'}',
        label: _nullableText(json['label']),
        points: _maps(json['points'])
            .map(EconDiagramCoordinate.fromJson)
            .toList(growable: false),
      );

  Map<String, Object?> toJson() => {
        'id': id,
        'kind': kind,
        if (label != null) 'label': label,
        'points': points.map((point) => point.toJson()).toList(),
      };
}

class EconStructuredCurve {
  const EconStructuredCurve({
    required this.id,
    required this.concept,
    required this.label,
    required this.shape,
    required this.position,
    required this.steepness,
  });

  final String id;
  final String concept;
  final String label;
  final String shape;
  final double position;
  final double steepness;

  factory EconStructuredCurve.fromJson(Map<String, dynamic> json) =>
      EconStructuredCurve(
        id: '${json['id'] ?? ''}',
        concept: '${json['concept'] ?? ''}',
        label: '${json['label'] ?? ''}',
        shape: '${json['shape'] ?? 'down'}',
        position: _number(json['position']),
        steepness: _number(json['steepness'], fallback: 1),
      );

  EconStructuredCurve copyWith({
    double? position,
    double? steepness,
    String? shape,
    String? label,
  }) =>
      EconStructuredCurve(
        id: id,
        concept: concept,
        label: label ?? this.label,
        shape: shape ?? this.shape,
        position: position ?? this.position,
        steepness: steepness ?? this.steepness,
      );

  Map<String, Object?> toJson() => {
        'id': id,
        'concept': concept,
        'label': label,
        'shape': shape,
        'position': position,
        'steepness': steepness,
      };
}

class EconStructuredMarker {
  const EconStructuredMarker({
    required this.id,
    required this.concept,
    required this.label,
    required this.quantityPosition,
    required this.pricePosition,
    this.concepts = const [],
    this.horizontalLabel,
    this.verticalLabel,
    this.anchorCurveIds = const [],
    this.axisGuide = false,
  });

  final String id;
  final String concept;
  final List<String> concepts;
  final String label;
  final double quantityPosition;
  final double pricePosition;
  final List<String> anchorCurveIds;
  final bool axisGuide;
  final String? horizontalLabel;
  final String? verticalLabel;

  factory EconStructuredMarker.fromJson(Map<String, dynamic> json) =>
      EconStructuredMarker(
        id: '${json['id'] ?? ''}',
        concept: '${json['concept'] ?? ''}',
        concepts: _strings(json['concepts']),
        label: '${json['label'] ?? ''}',
        quantityPosition: _number(json['quantityPosition']),
        pricePosition: _number(json['pricePosition']),
        anchorCurveIds: _strings(json['anchorCurveIds']),
        axisGuide: json['axisGuide'] == true,
        horizontalLabel: _nullableText(json['horizontalLabel']),
        verticalLabel: _nullableText(json['verticalLabel']),
      );

  Map<String, Object?> toJson() => {
        'id': id,
        'concept': concept,
        if (concepts.isNotEmpty) 'concepts': concepts,
        'label': label,
        'quantityPosition': quantityPosition,
        'pricePosition': pricePosition,
        if (anchorCurveIds.isNotEmpty) 'anchorCurveIds': anchorCurveIds,
        if (axisGuide) 'axisGuide': true,
        if (horizontalLabel != null) 'horizontalLabel': horizontalLabel,
        if (verticalLabel != null) 'verticalLabel': verticalLabel,
      };
}

class EconStructuredArea {
  const EconStructuredArea({
    required this.id,
    required this.concept,
    required this.label,
    required this.points,
    this.anchors = const [],
  });

  final String id;
  final String concept;
  final String label;
  final List<EconDiagramCoordinate> points;
  final List<EconStructuredAreaAnchor> anchors;

  factory EconStructuredArea.fromJson(Map<String, dynamic> json) =>
      EconStructuredArea(
        id: '${json['id'] ?? ''}',
        concept: '${json['concept'] ?? ''}',
        label: '${json['label'] ?? ''}',
        points: _maps(json['points'])
            .map(EconDiagramCoordinate.fromJson)
            .toList(growable: false),
        anchors: _maps(json['anchors'])
            .map(EconStructuredAreaAnchor.fromJson)
            .toList(growable: false),
      );

  Map<String, Object?> toJson() => {
        'id': id,
        'concept': concept,
        'label': label,
        'points': points.map((point) => point.toJson()).toList(),
        if (anchors.isNotEmpty)
          'anchors': anchors.map((anchor) => anchor.toJson()).toList(),
      };
}

class EconStructuredAreaAnchor {
  const EconStructuredAreaAnchor({
    required this.boundaryIds,
    required this.fallback,
  });

  final List<String> boundaryIds;
  final EconDiagramCoordinate fallback;

  factory EconStructuredAreaAnchor.fromJson(Map<String, dynamic> json) =>
      EconStructuredAreaAnchor(
        boundaryIds: _strings(json['boundaryIds']),
        fallback: EconDiagramCoordinate.fromJson(
            _map(json['fallback']) ?? const <String, dynamic>{}),
      );

  Map<String, Object?> toJson() => {
        'boundaryIds': boundaryIds,
        'fallback': fallback.toJson(),
      };
}

class EconStructuredMeasure {
  const EconStructuredMeasure({
    required this.id,
    required this.concept,
    required this.label,
    required this.start,
    required this.end,
  });

  final String id;
  final String concept;
  final String label;
  final EconDiagramCoordinate start;
  final EconDiagramCoordinate end;

  factory EconStructuredMeasure.fromJson(Map<String, dynamic> json) =>
      EconStructuredMeasure(
        id: '${json['id'] ?? ''}',
        concept: '${json['concept'] ?? ''}',
        label: '${json['label'] ?? ''}',
        start: EconDiagramCoordinate.fromJson(
            _map(json['start']) ?? const <String, dynamic>{}),
        end: EconDiagramCoordinate.fromJson(
            _map(json['end']) ?? const <String, dynamic>{}),
      );

  Map<String, Object?> toJson() => {
        'id': id,
        'concept': concept,
        'label': label,
        'start': start.toJson(),
        'end': end.toJson(),
      };
}

class EconStructuredDiagramState {
  const EconStructuredDiagramState({
    required this.kind,
    required this.axisX,
    required this.axisY,
    this.curves = const [],
    this.markers = const [],
    this.areas = const [],
    this.measures = const [],
    this.selectedCurveId,
  });

  final String kind;
  final String axisX;
  final String axisY;
  final List<EconStructuredCurve> curves;
  final List<EconStructuredMarker> markers;
  final List<EconStructuredArea> areas;
  final List<EconStructuredMeasure> measures;
  final String? selectedCurveId;

  factory EconStructuredDiagramState.fromJson(Map<String, dynamic> json) =>
      EconStructuredDiagramState(
        kind: '${json['kind'] ?? 'as-ad'}',
        axisX: '${json['axisX'] ?? 'Q'}',
        axisY: '${json['axisY'] ?? 'P'}',
        curves: _maps(json['curves'])
            .map(EconStructuredCurve.fromJson)
            .toList(growable: false),
        markers: _maps(json['markers'])
            .map(EconStructuredMarker.fromJson)
            .toList(growable: false),
        areas: _maps(json['areas'])
            .map(EconStructuredArea.fromJson)
            .toList(growable: false),
        measures: _maps(json['measures'])
            .map(EconStructuredMeasure.fromJson)
            .toList(growable: false),
        selectedCurveId: _nullableText(json['selectedCurveId']),
      );

  EconStructuredDiagramState copyWith({
    List<EconStructuredCurve>? curves,
    List<EconStructuredMarker>? markers,
    List<EconStructuredArea>? areas,
    List<EconStructuredMeasure>? measures,
    String? selectedCurveId,
  }) =>
      EconStructuredDiagramState(
        kind: kind,
        axisX: axisX,
        axisY: axisY,
        curves: curves ?? this.curves,
        markers: markers ?? this.markers,
        areas: areas ?? this.areas,
        measures: measures ?? this.measures,
        selectedCurveId: selectedCurveId ?? this.selectedCurveId,
      );

  Map<String, Object?> toJson() => {
        'kind': kind,
        'axisX': axisX,
        'axisY': axisY,
        'curves': curves.map((curve) => curve.toJson()).toList(),
        'markers': markers.map((marker) => marker.toJson()).toList(),
        'areas': areas.map((area) => area.toJson()).toList(),
        'measures': measures.map((measure) => measure.toJson()).toList(),
        if (selectedCurveId != null) 'selectedCurveId': selectedCurveId,
      };
}

class EconDiagramState {
  const EconDiagramState({
    this.version = 1,
    this.axisX = 'Q',
    this.axisY = 'P',
    this.curves = const [],
    this.points = const [],
    this.equilibria = const [],
    this.marketGaps = const [],
    this.areas = const [],
    this.strokes = const [],
    this.toolKind = 'demand-supply',
    this.policy,
    this.selectedCurveId,
    this.selectedMarketGapId,
    this.structured,
  });

  final int version;
  final String axisX;
  final String axisY;
  final List<EconDiagramCurve> curves;
  final List<EconDiagramPoint> points;
  final List<EconDiagramEquilibrium> equilibria;
  final List<EconDiagramMarketGap> marketGaps;
  final List<EconDiagramArea> areas;
  final List<EconDiagramStroke> strokes;
  final String toolKind;
  final String? policy;
  final String? selectedCurveId;
  final String? selectedMarketGapId;
  final EconStructuredDiagramState? structured;

  factory EconDiagramState.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const EconDiagramState();
    final structuredJson = _map(json['structured']);
    return EconDiagramState(
      version: _integer(json['version'], fallback: 1),
      axisX: '${json['axisX'] ?? 'Q'}',
      axisY: '${json['axisY'] ?? 'P'}',
      curves: _maps(json['curves'])
          .map(EconDiagramCurve.fromJson)
          .toList(growable: false),
      points: _maps(json['points'])
          .map(EconDiagramPoint.fromJson)
          .toList(growable: false),
      equilibria: _maps(json['equilibria'])
          .map(EconDiagramEquilibrium.fromJson)
          .toList(growable: false),
      marketGaps: _maps(json['marketGaps'])
          .map(EconDiagramMarketGap.fromJson)
          .toList(growable: false),
      areas: _maps(json['areas'])
          .map(EconDiagramArea.fromJson)
          .toList(growable: false),
      strokes: _maps(json['strokes'])
          .map(EconDiagramStroke.fromJson)
          .toList(growable: false),
      toolKind: '${json['toolKind'] ?? 'demand-supply'}',
      policy: _nullableText(json['policy']),
      selectedCurveId: _nullableText(json['selectedCurveId']),
      selectedMarketGapId: _nullableText(json['selectedMarketGapId']),
      structured: structuredJson == null
          ? null
          : EconStructuredDiagramState.fromJson(structuredJson),
    );
  }

  bool get hasAnswer =>
      curves.isNotEmpty ||
      points.isNotEmpty ||
      equilibria.isNotEmpty ||
      marketGaps.isNotEmpty ||
      areas.isNotEmpty ||
      strokes.isNotEmpty ||
      (structured != null &&
          (structured!.curves.isNotEmpty ||
              structured!.markers.isNotEmpty ||
              structured!.areas.isNotEmpty ||
              structured!.measures.isNotEmpty));

  EconDiagramState copyWith({
    String? axisX,
    String? axisY,
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
  }) =>
      EconDiagramState(
        version: version,
        axisX: axisX ?? this.axisX,
        axisY: axisY ?? this.axisY,
        curves: curves ?? this.curves,
        points: points ?? this.points,
        equilibria: equilibria ?? this.equilibria,
        marketGaps: marketGaps ?? this.marketGaps,
        areas: areas ?? this.areas,
        strokes: strokes ?? this.strokes,
        toolKind: toolKind ?? this.toolKind,
        policy: policy ?? this.policy,
        selectedCurveId: selectedCurveId ?? this.selectedCurveId,
        selectedMarketGapId: selectedMarketGapId ?? this.selectedMarketGapId,
        structured: structured ?? this.structured,
      );

  Map<String, Object?> toJson() => {
        'version': version,
        'axisX': axisX,
        'axisY': axisY,
        'curves': curves.map((curve) => curve.toJson()).toList(),
        'points': points.map((point) => point.toJson()).toList(),
        'equilibria': equilibria.map((point) => point.toJson()).toList(),
        'marketGaps': marketGaps.map((gap) => gap.toJson()).toList(),
        'areas': areas.map((area) => area.toJson()).toList(),
        'strokes': strokes.map((stroke) => stroke.toJson()).toList(),
        'toolKind': toolKind,
        if (policy != null) 'policy': policy,
        if (selectedCurveId != null) 'selectedCurveId': selectedCurveId,
        if (selectedMarketGapId != null)
          'selectedMarketGapId': selectedMarketGapId,
        if (structured != null) 'structured': structured!.toJson(),
      };
}

List<Map<String, dynamic>> _maps(Object? value) => value is List
    ? value
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList(growable: false)
    : const [];

Map<String, dynamic>? _map(Object? value) =>
    value is Map ? Map<String, dynamic>.from(value) : null;

List<String> _strings(Object? value) => value is List
    ? value.map((item) => '$item').where((item) => item.isNotEmpty).toList()
    : const [];

String? _nullableText(Object? value) {
  final text = value == null ? '' : '$value'.trim();
  return text.isEmpty ? null : text;
}

double _number(Object? value, {double fallback = 0}) =>
    value is num ? value.toDouble() : double.tryParse('$value') ?? fallback;

int _integer(Object? value, {int fallback = 0}) =>
    value is num ? value.toInt() : int.tryParse('$value') ?? fallback;

double _round(double value) => (value * 1000).round() / 1000;
