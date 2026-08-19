import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/vocabulary/vocab_models.dart';

void main() {
  test('formats POS and normalizes vocabulary text', () {
    const sense = VocabSense(
      id: 'pretty-adj',
      word: 'pretty',
      display: 'pretty',
      meaning: '漂亮的',
      pos: 'adjective',
      type: 'word',
    );

    expect(sense.label, 'adj. 漂亮的');
    expect(normalizeVocabWord('  Flora   and Fauna '), 'flora and fauna');
    expect(normalizeVocabMeaning('菠蘿／鳳梨'), '菠蘿 / 鳳梨');
  });

  test('serializes one vocabulary item with multiple senses', () {
    final item = VocabItem(
      id: 'have',
      word: 'have',
      senses: const [
        VocabSense(
          id: 'have-own',
          word: 'have',
          display: 'have',
          meaning: '擁有',
          pos: 'verb',
          type: 'word',
        ),
        VocabSense(
          id: 'have-eat',
          word: 'have',
          display: 'have',
          meaning: '吃 / 喝',
          pos: 'verb',
          type: 'word',
        ),
      ],
      createdAt: DateTime(2026, 8, 19),
      updatedAt: DateTime(2026, 8, 19),
    );

    final decoded = VocabItem.decodeList(VocabItem.encodeList([item]));

    expect(decoded, hasLength(1));
    expect(decoded.single.senses, hasLength(2));
    expect(decoded.single.senses.last.label, 'v. 吃 / 喝');
  });
}
