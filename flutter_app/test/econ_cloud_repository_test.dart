import 'package:flutter_test/flutter_test.dart';

import 'package:dope_english/features/econ/econ_cloud_repository.dart';
import 'package:dope_english/features/econ/econ_question_repository.dart';

void main() {
  test('grade result keeps the legacy point-by-point marking payload', () {
    final grade = EconGradeResult.fromJson({
      'awardedMarks': 3,
      'maxMarks': 5,
      'summary': '部分符合要求。',
      'matchedEvidence': ['需求上升'],
      'missingPoints': ['解釋價格變化'],
      'criteria': [
        {
          'id': 'c1',
          'markingPoint': '指出需求上升。',
          'status': 'met',
          'awardedMarks': 2,
          'maxMarks': 2,
          'feedback': '已指出方向。',
          'evidence': ['需求上升'],
        },
        {
          'id': 'c2',
          'markingPoint': '解釋價格變化。',
          'status': 'partial',
          'awardedMarks': 1,
          'maxMarks': 3,
          'feedback': '解釋未完整。',
          'missingPoint': '連繫均衡價格。',
        },
      ],
    });

    expect(grade.awardedMarks, 3);
    expect(grade.maxMarks, 5);
    expect(grade.criteria, hasLength(2));
    expect(grade.criteria.first.markingPoint, '指出需求上升。');
    expect(grade.criteria.first.evidence, ['需求上升']);
    expect(grade.criteria.last.missingPoint, '連繫均衡價格。');
    expect(grade.matchedEvidence, ['需求上升']);
  });

  test('bilingual pairing keeps the reviewed question id stable', () {
    expect(
      EconQuestionRepository.pairedQuestionId('en-2023-p2-q1-a', 'en'),
      'zh-2023-p2-q1-a',
    );
    expect(
      EconQuestionRepository.pairedQuestionId('zh-aristo-mock-41-p2-q5a', 'zh'),
      'en-aristo-mock-41-p2-q5a',
    );
  });
}
