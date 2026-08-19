import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/vocabulary/vocab_models.dart';
import 'package:dope_english/features/vocabulary/vocab_repository.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('bundled reviewed bank returns clean POS and meanings', () async {
    final repository = AssetVocabLookupRepository();

    final pretty = await repository.lookup('pretty');
    final beard = await repository.lookup('beard');
    final phrase = await repository.lookup('rule out');

    expect(
      pretty.senses,
      contains(predicate<VocabSense>(
        (sense) => sense.pos == 'adjective' && sense.meaning == '漂亮的',
      )),
    );
    expect(beard.senses.single.label, 'n. 鬍鬚');
    expect(
      phrase.senses,
      contains(predicate<VocabSense>(
        (sense) => sense.pos == 'verb' && sense.meaning.contains('排除'),
      )),
    );
  });

  test('bundled bank returns meaning-aware examples', () async {
    final repository = AssetVocabLookupRepository();
    final lookup = await repository.lookup('pineapple');
    final item = VocabItem(
      id: 'pineapple',
      word: lookup.senses.first.display,
      senses: [lookup.senses.first],
      createdAt: DateTime(2026, 8, 19),
      updatedAt: DateTime(2026, 8, 19),
    );

    final sections = await repository.loadExamples(item);

    expect(sections, hasLength(1));
    expect(sections.single.examples, hasLength(3));
    expect(sections.single.examples.first.english, isNotEmpty);
    expect(sections.single.examples.first.chinese, isNotEmpty);
  });
}
