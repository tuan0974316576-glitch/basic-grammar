import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/vocabulary/vocab_models.dart';

void main() {
  test('ordinary vocabulary displays lowercase while proper names keep case',
      () {
    expect(displayVocabWord('Have'), 'have');
    expect(displayVocabWord('Mind-blowing'), 'mind-blowing');
    expect(displayVocabWord('rather (adv)'), 'rather');
    expect(displayVocabWord('rather (ADV.)'), 'rather');
    expect(displayVocabWord('Hong Kong'), 'Hong Kong');
    expect(displayVocabWord('New York'), 'New York');
  });
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
      reviewMastered: true,
      speakingMastered: true,
    );

    final decoded = VocabItem.decodeList(VocabItem.encodeList([item]));

    expect(decoded, hasLength(1));
    expect(decoded.single.senses, hasLength(2));
    expect(decoded.single.senses.last.label, 'v. 吃 / 喝');
    expect(decoded.single.reviewMastered, isTrue);
    expect(decoded.single.speakingMastered, isTrue);
  });

  test('loading saved vocab merges repeated meaning parts', () {
    final item = VocabItem(
      id: 'massive',
      word: 'massive',
      senses: const [
        VocabSense(
          id: 'massive-rich',
          word: 'massive',
          display: 'massive',
          meaning: '巨大的 / 大量的',
          pos: 'adjective',
          type: 'word',
        ),
        VocabSense(
          id: 'massive-repeat',
          word: 'massive',
          display: 'massive',
          meaning: '巨大的',
          pos: 'adjective',
          type: 'word',
        ),
      ],
      createdAt: DateTime(2026, 9, 10),
      updatedAt: DateTime(2026, 9, 10),
    );

    final decoded = VocabItem.decodeList(VocabItem.encodeList([item])).single;

    expect(decoded.senses, hasLength(1));
    expect(decoded.senses.single.meaning, '巨大的 / 大量的');
  });

  test('loading old saved senses fills blank identity from the parent word',
      () {
    final decoded = VocabItem.fromJson({
      'id': 'word-massive',
      'word': 'massive',
      'createdAt': DateTime(2026, 9, 10).millisecondsSinceEpoch,
      'updatedAt': DateTime(2026, 9, 10).millisecondsSinceEpoch,
      'senses': [
        {
          'id': 'sense-massive-adjective-414',
          'word': 'massive',
          'display': 'massive',
          'meaning': '巨大的 / 大量的',
          'pos': 'adjective',
          'type': 'word',
          'sourceEntryId': 'sense-bank-414',
        },
        {
          'id': '',
          'word': '',
          'display': '',
          'meaning': '巨大的 / 大量的',
          'pos': 'adjective',
          'type': 'word',
          'sourceEntryId': 'sense-bank-414',
        },
      ],
    });

    expect(decoded.senses, hasLength(1));
    expect(decoded.senses.single.word, 'massive');
    expect(decoded.senses.single.display, 'massive');
    expect(decoded.senses.single.meaning, '巨大的 / 大量的');
  });
}
