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
      'assets/lottie/streak-extend.json',
      'assets/lottie/streak-freeze.json',
    ]) {
      final data = jsonDecode(await File(asset).readAsString());
      expect(data, isA<Map<String, dynamic>>());
      expect((data as Map<String, dynamic>)['v'], isNotEmpty);
      expect(data['layers'], isA<List<dynamic>>());
      expect((data['layers'] as List<dynamic>), isNotEmpty);
    }
  });

  test('milestone monster assets are valid vector Lottie data', () async {
    for (final name in [
      'cute-monster',
      'monster-blue',
      'monster-3',
      'monster-5',
      'monster-6',
      'one-eye-monster-2',
    ]) {
      final data = jsonDecode(
        await File('assets/lottie/monsters/$name.json').readAsString(),
      ) as Map<String, dynamic>;
      expect(data['assets'], isA<List<dynamic>>());
      expect((data['assets'] as List<dynamic>), isEmpty);
      expect(data['layers'], isA<List<dynamic>>());
    }
  });

  test('the imported monster set is valid Lottie JSON', () async {
    for (final name in [
      'crying-monster',
      'sad-monster',
      'one-eye-monster-5',
      'three-eye-monster',
      'three-eye-monster-2',
      'three-eye-monster-3',
      'three-eye-monster-4',
      'three-eye-monster-5',
      'three-eye-monster-6',
      'top-badge-animation',
    ]) {
      final data = jsonDecode(
        await File('assets/lottie/monsters/$name.json').readAsString(),
      ) as Map<String, dynamic>;
      expect(data['v'], isNotEmpty);
      expect(data['layers'], isA<List<dynamic>>());
      expect((data['layers'] as List<dynamic>), isNotEmpty);
    }
  });

  test('the profile name screen welcome monster is a valid Lottie asset',
      () async {
    final data = jsonDecode(
      await File(
        'assets/lottie/monsters/yellow-monster-saying-hi.json',
      ).readAsString(),
    ) as Map<String, dynamic>;
    expect(data['v'], isNotEmpty);
    expect(data['w'], 480);
    expect(data['h'], 480);
    expect(data['layers'], isA<List<dynamic>>());
    expect((data['layers'] as List<dynamic>), isNotEmpty);
  });

  test('weekday success monsters keep one colour variant per day', () async {
    const names = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
    for (final name in names) {
      final data = jsonDecode(
        await File('assets/lottie/monsters/cute-monster-$name.json')
            .readAsString(),
      ) as Map<String, dynamic>;
      expect(data['v'], isNotEmpty);
      expect(data['layers'], isA<List<dynamic>>());
      expect((data['layers'] as List<dynamic>), isNotEmpty);
    }
  });

  test('weekday retry monsters keep one colour variant per day', () async {
    const names = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
    for (final name in names) {
      final data = jsonDecode(
        await File('assets/lottie/monsters/three-eye-monster-6-$name.json')
            .readAsString(),
      ) as Map<String, dynamic>;
      expect(data['v'], isNotEmpty);
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
    expect(tester.widget<Lottie>(find.byType(Lottie)).repeat, isTrue);
    expect(tester.takeException(), isNull);
    await tester.pumpWidget(const SizedBox());
    await tester.pump();
  });
}
