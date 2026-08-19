import 'dart:math';

class Quiz01WordBlock {
  const Quiz01WordBlock({required this.id, required this.text});

  final String id;
  final String text;
}

class Quiz01Question {
  const Quiz01Question({
    required this.id,
    required this.zh,
    required this.answer,
    required this.distractors,
  });

  factory Quiz01Question.fromJson(Map<String, dynamic> json) {
    String requiredText(String key) {
      final value = (json[key] as String? ?? '').trim();
      if (value.isEmpty) {
        throw FormatException('Quiz 01 question is missing $key');
      }
      return value;
    }

    List<String> requiredWords(String key) {
      final words = (json[key] as List<dynamic>? ?? const [])
          .map((value) => value.toString().trim())
          .where((value) => value.isNotEmpty)
          .toList(growable: false);
      if (words.isEmpty) {
        throw FormatException('Quiz 01 question is missing $key words');
      }
      return words;
    }

    final answer = requiredWords('answer');
    final answerWords = answer.map((word) => word.toLowerCase()).toSet();
    final distractors = requiredWords('distractors')
        .where((word) => !answerWords.contains(word.toLowerCase()))
        .toList(growable: false);
    if (distractors.length < 2) {
      throw const FormatException(
        'Quiz 01 question needs two distinct distractors',
      );
    }

    return Quiz01Question(
      id: requiredText('id'),
      zh: requiredText('zh'),
      answer: answer,
      distractors: distractors,
    );
  }

  final String id;
  final String zh;
  final List<String> answer;
  final List<String> distractors;

  String get answerText => answer.join(' ');

  List<Quiz01WordBlock> buildBlocks(Random random) {
    final blocks = <Quiz01WordBlock>[
      for (var index = 0; index < answer.length; index++)
        Quiz01WordBlock(id: 'answer-$index', text: answer[index]),
      for (var index = 0; index < 2; index++)
        Quiz01WordBlock(id: 'extra-$index', text: distractors[index]),
    ];
    blocks.shuffle(random);
    return blocks;
  }
}
