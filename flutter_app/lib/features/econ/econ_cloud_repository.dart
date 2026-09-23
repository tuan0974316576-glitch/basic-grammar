import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';

import 'econ_diagram_models.dart';
import 'econ_diagram_domain.dart';
import 'econ_question_models.dart';

class EconGradeResult {
  const EconGradeResult({
    required this.awardedMarks,
    required this.maxMarks,
    required this.summary,
    this.criteria = const [],
    this.matchedEvidence = const [],
    this.missingPoints = const [],
  });

  final int awardedMarks;
  final int maxMarks;
  final String summary;
  final List<EconGradeCriterion> criteria;
  final List<String> matchedEvidence;
  final List<String> missingPoints;

  bool get correct => maxMarks > 0 && awardedMarks == maxMarks;

  factory EconGradeResult.fromJson(Map<String, dynamic> json) {
    final rawCriteria = json['criteria'];
    return EconGradeResult(
      awardedMarks: (json['awardedMarks'] as num?)?.toInt() ?? 0,
      maxMarks: (json['maxMarks'] as num?)?.toInt() ?? 0,
      summary: '${json['summary'] ?? ''}',
      criteria: rawCriteria is List
          ? rawCriteria
              .whereType<Map>()
              .map((item) =>
                  EconGradeCriterion.fromJson(Map<String, dynamic>.from(item)))
              .toList(growable: false)
          : const [],
      matchedEvidence: _stringList(json['matchedEvidence']),
      missingPoints: json['missingPoints'] is List
          ? (json['missingPoints'] as List)
              .whereType<Object>()
              .map((item) => '$item')
              .toList(growable: false)
          : const [],
    );
  }
}

class EconGradeCriterion {
  const EconGradeCriterion({
    required this.id,
    required this.markingPoint,
    required this.status,
    required this.awardedMarks,
    required this.maxMarks,
    required this.feedback,
    this.evidence = const [],
    this.missingPoint = '',
  });

  final String id;
  final String markingPoint;
  final String status;
  final int awardedMarks;
  final int maxMarks;
  final String feedback;
  final List<String> evidence;
  final String missingPoint;

  factory EconGradeCriterion.fromJson(Map<String, dynamic> json) {
    return EconGradeCriterion(
      id: '${json['id'] ?? ''}',
      markingPoint: '${json['markingPoint'] ?? json['description'] ?? ''}',
      status: '${json['status'] ?? 'missing'}',
      awardedMarks: (json['awardedMarks'] as num?)?.toInt() ?? 0,
      maxMarks: (json['maxMarks'] as num?)?.toInt() ?? 0,
      feedback: '${json['feedback'] ?? json['reason'] ?? ''}',
      evidence: _stringList(json['evidence']),
      missingPoint: '${json['missingPoint'] ?? json['missingComponent'] ?? ''}',
    );
  }
}

List<String> _stringList(Object? value) {
  if (value is! List) return const [];
  return value
      .whereType<Object>()
      .map((item) => '$item')
      .toList(growable: false);
}

class EconLeaderboardRow {
  const EconLeaderboardRow({
    required this.rank,
    required this.displayName,
    required this.correctCount,
    required this.attemptCount,
    required this.accuracy,
  });

  final int rank;
  final String displayName;
  final int correctCount;
  final int attemptCount;
  final int accuracy;

  factory EconLeaderboardRow.fromJson(Map<String, dynamic> json) {
    return EconLeaderboardRow(
      rank: (json['rank'] as num?)?.toInt() ?? 0,
      displayName: '${json['displayName'] ?? 'Student'}',
      correctCount: (json['correctCount'] as num?)?.toInt() ?? 0,
      attemptCount: (json['attemptCount'] as num?)?.toInt() ?? 0,
      accuracy: (json['accuracy'] as num?)?.toInt() ?? 0,
    );
  }
}

class EconLeaderboardData {
  const EconLeaderboardData({this.p1 = const [], this.p2 = const []});

  final List<EconLeaderboardRow> p1;
  final List<EconLeaderboardRow> p2;

  factory EconLeaderboardData.fromJson(Map<String, dynamic> json) {
    List<EconLeaderboardRow> rows(Object? value) {
      if (value is! List) return const [];
      return value
          .whereType<Map>()
          .map((item) =>
              EconLeaderboardRow.fromJson(Map<String, dynamic>.from(item)))
          .toList(growable: false);
    }

    return EconLeaderboardData(p1: rows(json['P1']), p2: rows(json['P2']));
  }
}

class EconCloudRepository {
  EconCloudRepository(
      {FirebaseAuth? auth,
      FirebaseFirestore? firestore,
      FirebaseFunctions? functions})
      : _auth = auth ?? FirebaseAuth.instance,
        _firestore = firestore ?? FirebaseFirestore.instance,
        _functions =
            functions ?? FirebaseFunctions.instanceFor(region: 'asia-east2');

  final FirebaseAuth _auth;
  final FirebaseFirestore _firestore;
  final FirebaseFunctions _functions;

  bool get isSignedIn => _auth.currentUser != null;

  Future<EconGradeResult> gradeP2Answer({
    required String questionId,
    required String response,
    EconDiagramState? diagram,
    EconDiagramState? diagramSourceSeed,
  }) async {
    final result = await _functions
        .httpsCallable(
      'gradeP2Answer',
      options: HttpsCallableOptions(timeout: const Duration(seconds: 70)),
    )
        .call<Map<String, dynamic>>({
      'questionId': questionId,
      'response': response,
      'diagram': diagram == null
          ? null
          : diagramGradingPayload(
              diagram,
              sourceSeed: diagramSourceSeed,
            ),
    });
    final payload = Map<String, dynamic>.from(result.data);
    return EconGradeResult.fromJson(
      Map<String, dynamic>.from(payload['grade'] as Map? ?? const {}),
    );
  }

  Future<EconLeaderboardData> loadLeaderboard() async {
    final user = _auth.currentUser;
    if (user == null) {
      throw StateError('請先登入 A1 BUDDY，才可以查看 ECON 排名。');
    }
    await user.getIdToken(true);
    final result = await _functions
        .httpsCallable(
      'getLeaderboard',
      options: HttpsCallableOptions(timeout: const Duration(seconds: 25)),
    )
        .call<Map<String, dynamic>>({});
    final payload = Map<String, dynamic>.from(result.data);
    return EconLeaderboardData.fromJson(
      Map<String, dynamic>.from(payload['leaderboards'] as Map? ?? const {}),
    );
  }

  /// Returns the latest outcome for each question, matching the legacy ECON
  /// picker summary (`啱` / `錯`) without exposing raw attempt documents.
  Future<Map<String, String>> loadQuestionProgress() async {
    final uid = _auth.currentUser?.uid;
    if (uid == null) return const {};
    final snapshot = await _firestore
        .collection('users')
        .doc(uid)
        .collection('questionStats')
        .get();
    final progress = <String, String>{};
    for (final document in snapshot.docs) {
      final data = document.data();
      final questionId = '${data['questionId'] ?? document.id}'.trim();
      final outcome = data['lastOutcome'];
      if (questionId.isEmpty ||
          (outcome != 'correct' && outcome != 'incorrect')) {
        continue;
      }
      progress[questionId] = '$outcome';
    }
    return progress;
  }

  Future<void> saveAttempt({
    required EconQuestion question,
    required int awardedMarks,
    required int maxMarks,
  }) async {
    final uid = _auth.currentUser?.uid;
    if (uid == null) return;
    final questionId = question.id.replaceAll(RegExp(r'[^A-Za-z0-9_-]'), '_');
    final attemptId = '${DateTime.now().millisecondsSinceEpoch}-$questionId';
    final topicId =
        '${question.language}|${question.chapterNo}|${question.keyPoint}'
            .replaceAll(RegExp(r'[^A-Za-z0-9_-]'), '_');
    await _firestore
        .collection('users')
        .doc(uid)
        .collection('attempts')
        .doc(attemptId)
        .set({
      'questionId': question.id,
      'questionRef': question.questionRef,
      'paper': question.isP2 ? 'P2' : 'P1',
      'year': '${question.year}',
      'language': question.language == 'zh' ? 'zh' : 'en',
      'source': question.isMock ? 'mock' : 'past',
      'chapterNo': question.chapterNo,
      'chapterTitle': question.chapterTitle,
      'keyPoint': question.keyPoint,
      'topicId': topicId,
      'questionType': question.questionType,
      'outcome': awardedMarks >= maxMarks ? 'correct' : 'incorrect',
      'awardedMarks': awardedMarks,
      'maxMarks': maxMarks,
      'missedMarks': (maxMarks - awardedMarks).clamp(0, maxMarks),
      'clientCreatedAt': DateTime.now().toIso8601String(),
      'completedAt': FieldValue.serverTimestamp(),
    });
  }
}
