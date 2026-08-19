class Lesson03ExpectedToken {
  const Lesson03ExpectedToken({
    required this.segmentIndex,
    required this.optional,
  });

  final int segmentIndex;
  final bool optional;
}

class Lesson03Question {
  const Lesson03Question({
    required this.id,
    required this.text,
    required this.segments,
  });

  static const optionalConnectors = {'and', 'but', 'so', 'or', 'that'};

  factory Lesson03Question.fromJson(Map<String, dynamic> json) {
    String requiredText(String key) {
      final value = (json[key] as String? ?? '').trim();
      if (value.isEmpty) {
        throw FormatException('Lesson 03 question is missing $key');
      }
      return value;
    }

    final rawSegments = json['segments'] as List<dynamic>? ?? const [];
    final segments = rawSegments.map((rawSegment) {
      final words = (rawSegment as List<dynamic>)
          .map((word) => word.toString().trim())
          .where((word) => word.isNotEmpty)
          .toList(growable: false);
      if (words.isEmpty) {
        throw const FormatException('Lesson 03 has an empty sentence segment');
      }
      return words;
    }).toList(growable: false);
    if (segments.length < 2 || segments.length > 4) {
      throw const FormatException(
        'Lesson 03 question needs two to four sentence segments',
      );
    }

    final text = requiredText('text');
    if (segments.expand((segment) => segment).join(' ') != text) {
      throw const FormatException(
        'Lesson 03 text does not match its sentence segments',
      );
    }

    return Lesson03Question(
      id: requiredText('id'),
      text: text,
      segments: segments,
    );
  }

  final String id;
  final String text;
  final List<List<String>> segments;

  List<String> get tokens => segments.expand((segment) => segment).toList();
  int get sentenceCount => segments.length;

  List<Lesson03ExpectedToken> get expectedTokens {
    return [
      for (var segmentIndex = 0; segmentIndex < segments.length; segmentIndex++)
        for (var tokenIndex = 0;
            tokenIndex < segments[segmentIndex].length;
            tokenIndex++)
          Lesson03ExpectedToken(
            segmentIndex: segmentIndex,
            optional: segmentIndex < segments.length - 1 &&
                tokenIndex == segments[segmentIndex].length - 1 &&
                optionalConnectors.contains(
                  normalizeToken(segments[segmentIndex][tokenIndex]),
                ),
          ),
    ];
  }

  List<String> get answerLines => [
        for (var index = 0; index < segments.length; index++)
          '${index + 1}. ${segments[index].join(' ')}',
      ];

  static String normalizeToken(String token) {
    return token.toLowerCase().replaceAll(RegExp('[^a-z]'), '');
  }
}
