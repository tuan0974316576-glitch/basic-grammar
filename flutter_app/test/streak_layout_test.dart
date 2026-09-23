import 'package:dope_english/features/game/game_hub_screen.dart';
import 'package:dope_english/features/grammar/original_grammar_home.dart';
import 'package:dope_english/features/streak/streak_models.dart';
import 'package:dope_english/features/streak/streak_widgets.dart';
import 'package:dope_english/core/widgets/original_section_frame.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  testWidgets('compact streak badge does not overlap the header title',
      (tester) async {
    SharedPreferences.setMockInitialValues({});
    tester.view.physicalSize = const Size(320, 568);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: Stack(
          children: [
            OriginalHeaderAccessoryScope(
              width: 38,
              accessory: StreakBadge(
                compact: true,
                streak: const StudyStreak(days: 12),
                onTap: () {},
              ),
              child: OriginalGrammarHome(
                lessonProgress: const {},
                onLessonTap: (_) {},
                onVerbTableInfo: () {},
                onSettings: () {},
              ),
            ),
            Positioned(
              left: -14,
              top: 22,
              child: SubjectSwitcher(
                subject: GameSubject.eng,
                onChanged: (_) {},
              ),
            ),
          ],
        ),
      ),
    ));
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('study-streak-badge')), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('asymmetric right controls keep the title geometrically centred',
      (tester) async {
    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: OriginalHeaderAccessoryScope(
          width: 78,
          accessory: const SizedBox(width: 78, height: 38),
          child: OriginalSectionFrame(
            sectionKey: const Key('centred-title-frame'),
            eyebrow: 'Vocabulary',
            title: '詞彙本',
            onSettings: () {},
            trailing: const SizedBox.square(dimension: 48),
            child: const SizedBox.expand(),
          ),
        ),
      ),
    ));
    await tester.pump();

    final frameCenter =
        tester.getCenter(find.byKey(const Key('centred-title-frame'))).dx;
    final titleCenter = tester.getCenter(find.text('詞彙本')).dx;
    expect(titleCenter, closeTo(frameCenter, 0.5));
    expect(tester.takeException(), isNull);
  });
}
