import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/core/app_sfx.dart';
import 'package:dope_english/features/grammar/lesson_12/lesson_12_controller.dart';
import 'package:dope_english/features/grammar/lesson_12/lesson_12_question.dart';
import 'package:dope_english/features/grammar/lesson_12/lesson_12_screen.dart';

const question = Lesson12Question(
  id: 'v1',
  zh: '開始',
  forms: {
    'present': 'begin',
    'past': 'began',
    'pp': 'begun',
    'ing': 'beginning',
  },
  imageAsset:
      'assets/grammar-verbs/irasutoya/v1/begin-began-begun-beginning-c6ede69742.png',
  audioAsset: '',
);

void main() {
  testWidgets('four native fields fit a compact phone and present shows b',
      (tester) async {
    tester.view.devicePixelRatio = 1;
    tester.view.physicalSize = const Size(320, 568);
    addTearDown(tester.view.reset);
    final controller = Lesson12Controller.forQuestions([question]);

    await tester.pumpWidget(
      MaterialApp(
        home: Lesson12Screen(
          controller: controller,
          sfx: const SilentLessonSfx(),
        ),
      ),
    );
    await tester.pump();

    expect(find.byKey(const Key('lesson-12-present-input')), findsOneWidget);
    expect(find.byKey(const Key('lesson-12-past-input')), findsOneWidget);
    expect(find.byKey(const Key('lesson-12-pp-input')), findsOneWidget);
    expect(find.byKey(const Key('lesson-12-ing-input')), findsOneWidget);
    final present = tester.widget<TextField>(
      find.byKey(const Key('lesson-12-present-input')),
    );
    expect(present.decoration?.prefixText, 'b');
    expect(present.readOnly, isFalse);
    expect(tester.takeException(), isNull);
  });

  testWidgets('wrong field turns red and can be corrected', (tester) async {
    tester.view.devicePixelRatio = 1;
    tester.view.physicalSize = const Size(390, 844);
    addTearDown(tester.view.reset);
    final controller = Lesson12Controller.forQuestions([question]);

    await tester.pumpWidget(
      MaterialApp(
        home: Lesson12Screen(
          controller: controller,
          sfx: const SilentLessonSfx(),
        ),
      ),
    );
    await tester.enterText(
      find.byKey(const Key('lesson-12-present-input')),
      'egin',
    );
    await tester.enterText(
      find.byKey(const Key('lesson-12-past-input')),
      'begun',
    );
    await tester.enterText(
      find.byKey(const Key('lesson-12-pp-input')),
      'begun',
    );
    await tester.enterText(
      find.byKey(const Key('lesson-12-ing-input')),
      'beginning',
    );
    await tester.tap(find.byKey(const Key('lesson-12-confirm')));
    await tester.pump();

    expect(controller.wrongFields, {'past'});
    expect(find.text('紅色格未正確，修改後再確定。'), findsOneWidget);

    await tester.enterText(
      find.byKey(const Key('lesson-12-past-input')),
      'began',
    );
    await tester.tap(find.byKey(const Key('lesson-12-confirm')));
    await tester.pump();
    expect(find.byKey(const Key('lesson-12-next')), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('Verb Table search filters the complete reference list',
      (tester) async {
    tester.view.devicePixelRatio = 1;
    tester.view.physicalSize = const Size(390, 844);
    addTearDown(tester.view.reset);

    await tester.pumpWidget(
      const MaterialApp(home: VerbTableReferenceScreen()),
    );
    await tester.pump();
    await tester.runAsync(
      () => Future<void>.delayed(const Duration(milliseconds: 100)),
    );
    await tester.pump(const Duration(milliseconds: 500));

    expect(find.byKey(const Key('verb-table-search-button')), findsOneWidget);
    await tester.tap(find.byKey(const Key('verb-table-search-button')));
    await tester.pump();
    await tester.enterText(
      find.byKey(const Key('verb-table-search-field')),
      'invite',
    );
    await tester.pump();

    expect(
      find.byKey(const ValueKey('verb-table-row-vtr112')),
      findsOneWidget,
    );
    expect(find.text('bend'), findsNothing);
    expect(tester.takeException(), isNull);
  });
}
