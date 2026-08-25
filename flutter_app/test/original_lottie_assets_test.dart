import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lottie/lottie.dart';
import 'package:crypto/crypto.dart';

import 'package:dope_english/features/grammar/shared/lesson_ui.dart';

void main() {
  test('settings and training PNGs exactly match the retained web originals',
      () async {
    for (final name in ['setting-2.png', 'dumbbel.png']) {
      final webBytes = await File('../assets/$name').readAsBytes();
      final nativeBytes = await File('assets/$name').readAsBytes();
      expect(sha256.convert(nativeBytes), sha256.convert(webBytes));
    }
  });

  test('original confetti and streak assets are valid Lottie data', () async {
    for (final asset in [
      'assets/lottie/confetti.json',
      'assets/lottie/streak-fire.json',
    ]) {
      final data = jsonDecode(await File(asset).readAsString());
      expect(data, isA<Map<String, dynamic>>());
      expect((data as Map<String, dynamic>)['v'], isNotEmpty);
      expect(data['layers'], isA<List<dynamic>>());
      expect((data['layers'] as List<dynamic>), isNotEmpty);
    }
  });

  testWidgets('lesson celebration renders the original confetti Lottie',
      (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: Stack(
            children: [
              SizedBox.expand(),
              LessonCelebrationOverlay(trigger: 1),
            ],
          ),
        ),
      ),
    );
    await tester.pump(const Duration(milliseconds: 100));

    expect(find.byType(Lottie), findsOneWidget);
    expect(find.byKey(const ValueKey('original-confetti-1-false')),
        findsOneWidget);
    expect(tester.takeException(), isNull);
    await tester.pumpWidget(const SizedBox());
    await tester.pump();
  });

  testWidgets('streak widget renders the original looping fire Lottie',
      (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: Center(child: OriginalStreakFireAnimation()),
        ),
      ),
    );
    await tester.pump(const Duration(milliseconds: 100));

    expect(
        find.byKey(const Key('original-streak-fire-lottie')), findsOneWidget);
    expect(find.byType(Lottie), findsOneWidget);
    expect(tester.takeException(), isNull);
    await tester.pumpWidget(const SizedBox());
    await tester.pump();
  });
}
