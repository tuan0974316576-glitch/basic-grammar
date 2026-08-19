import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';

abstract final class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) return web;
    return switch (defaultTargetPlatform) {
      TargetPlatform.android => android,
      TargetPlatform.iOS => ios,
      _ => web,
    };
  }

  static const web = FirebaseOptions(
    apiKey: 'AIzaSyDvaBwrm5L6bt2pNeuc2RQGDoOvvpoiK1M',
    appId: '1:106862709670:web:e5a56ec2ae0acb4ec45d67',
    messagingSenderId: '106862709670',
    projectId: 'enguistics-grammar-game',
    authDomain: 'enguistics-grammar-game.firebaseapp.com',
    storageBucket: 'enguistics-grammar-game.firebasestorage.app',
  );

  static const ios = FirebaseOptions(
    apiKey: 'AIzaSyCBNl4mkv5mHYaz8aF1mu9Qhcl7RboMeHA',
    appId: '1:106862709670:ios:07cdffd61539b1a0c45d67',
    messagingSenderId: '106862709670',
    projectId: 'enguistics-grammar-game',
    storageBucket: 'enguistics-grammar-game.firebasestorage.app',
    iosBundleId: 'com.enguistics.dopeEnglish',
  );

  static const android = FirebaseOptions(
    apiKey: 'AIzaSyBd9eyuzwB9OxM0bREyJ_A1y4HBpUYlOo4',
    appId: '1:106862709670:android:eaaa5fd12fd16d64c45d67',
    messagingSenderId: '106862709670',
    projectId: 'enguistics-grammar-game',
    storageBucket: 'enguistics-grammar-game.firebasestorage.app',
  );
}
