import 'dart:convert';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';

import 'grammar_workshop_models.dart';

typedef GrammarWorkshopCacheFile = Future<File> Function();

abstract interface class GrammarWorkshopBankRepository {
  Future<GrammarWorkshopBank> load({bool forceRefresh = false});
}

class GrammarWorkshopRepository implements GrammarWorkshopBankRepository {
  GrammarWorkshopRepository({
    AssetBundle? bundle,
    http.Client? client,
    GrammarWorkshopCacheFile? cacheFile,
  })  : _bundle = bundle ?? rootBundle,
        _client = client ?? http.Client(),
        _cacheFile = cacheFile ?? _defaultCacheFile;

  static const bundledAsset = 'assets/data/battleship_grammar_topics.json';
  static final manifestUri = Uri.parse(
    'https://battleship-game-c0909-default-rtdb.asia-southeast1.firebasedatabase.app/'
    'grammarBank/public/manifest.json',
  );
  static final topicsUri = Uri.parse(
    'https://battleship-game-c0909-default-rtdb.asia-southeast1.firebasedatabase.app/'
    'grammarBank/public/topics.json',
  );

  final AssetBundle _bundle;
  final http.Client _client;
  final GrammarWorkshopCacheFile _cacheFile;

  @override
  Future<GrammarWorkshopBank> load({bool forceRefresh = false}) async {
    final bundleSource = await _bundle.loadString(bundledAsset);
    var bank = await compute(
      _parsePackage,
      (source: bundleSource, sourceType: GrammarWorkshopSource.bundle),
    );
    try {
      final cache = await _cacheFile();
      if (await cache.exists()) {
        final cached = await compute(
          _parsePackage,
          (
            source: await cache.readAsString(),
            sourceType: GrammarWorkshopSource.cache,
          ),
        );
        if (cached.publishedAt.isAfter(bank.publishedAt)) bank = cached;
      }
    } catch (_) {
      // A corrupt cache never replaces the validated bundled release.
    }

    try {
      final manifestResponse =
          await _client.get(manifestUri).timeout(const Duration(seconds: 8));
      if (manifestResponse.statusCode != 200) {
        throw HttpException(
            'Manifest returned ${manifestResponse.statusCode}.');
      }
      final manifest = Map<String, dynamic>.from(
        jsonDecode(manifestResponse.body) as Map,
      );
      final remoteReleaseId = '${manifest['releaseId'] ?? ''}'.trim();
      if (!forceRefresh && remoteReleaseId == bank.releaseId) {
        return bank.copyWith(
          source: GrammarWorkshopSource.online,
          clearSyncError: true,
        );
      }
      final topicsResponse =
          await _client.get(topicsUri).timeout(const Duration(seconds: 30));
      if (topicsResponse.statusCode != 200) {
        throw HttpException('Topics returned ${topicsResponse.statusCode}.');
      }
      final packageSource = jsonEncode({
        'schemaVersion': 1,
        'manifest': manifest,
        'topics': jsonDecode(topicsResponse.body),
      });
      final online = await compute(
        _parsePackage,
        (source: packageSource, sourceType: GrammarWorkshopSource.online),
      );
      final cache = await _cacheFile();
      await cache.parent.create(recursive: true);
      await cache.writeAsString(packageSource, flush: true);
      return online;
    } catch (error) {
      return bank.copyWith(syncError: error.toString());
    }
  }

  static Future<File> _defaultCacheFile() async {
    final directory = await getApplicationSupportDirectory();
    return File(
      '${directory.path}/grammar-workshop/battleship_release_v1.json',
    );
  }
}

GrammarWorkshopBank _parsePackage(
  ({String source, GrammarWorkshopSource sourceType}) input,
) {
  final decoded = jsonDecode(input.source);
  if (decoded is! Map) {
    throw const FormatException('Grammar package is invalid.');
  }
  return GrammarWorkshopBank.fromPackage(
    Map<String, dynamic>.from(decoded),
    source: input.sourceType,
  );
}
