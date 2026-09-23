import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/main.dart';

void main() {
  test('classifies phones and tablets at the standard 600dp breakpoint', () {
    expect(
      appDeviceClassForShortestSide(599),
      AppDeviceClass.phone,
    );
    expect(
      appDeviceClassForShortestSide(600),
      AppDeviceClass.tablet,
    );
  });

  test('locks phones portrait and tablets landscape', () {
    expect(
      preferredOrientationsForDevice(AppDeviceClass.phone),
      [DeviceOrientation.portraitUp],
    );
    expect(
      preferredOrientationsForDevice(AppDeviceClass.tablet),
      [
        DeviceOrientation.landscapeLeft,
        DeviceOrientation.landscapeRight,
      ],
    );
  });
}
