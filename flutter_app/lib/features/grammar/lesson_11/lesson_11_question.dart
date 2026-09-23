class Lesson11Question {
  const Lesson11Question({
    required this.id,
    required this.tense,
    required this.tenseLabel,
    required this.zh,
    required this.sentence,
    this.baseVerb = '',
    required this.answer,
    required this.english,
    required this.acceptedAnswers,
    required this.explanation,
  });

  factory Lesson11Question.fromJson(Map<String, dynamic> json) {
    final answer = json['answer']?.toString() ?? '';
    final accepted = (json['acceptedAnswers'] as List<dynamic>? ?? const [])
        .map((value) => value.toString())
        .toList(growable: false);
    return Lesson11Question(
      id: json['id']?.toString() ?? '',
      tense: json['tense']?.toString() ?? '',
      tenseLabel: json['tenseLabel']?.toString() ?? '',
      zh: json['zh']?.toString() ?? '',
      sentence: json['sentence']?.toString() ?? '',
      baseVerb: json['baseVerb']?.toString() ?? _inferBaseVerb(answer),
      answer: answer,
      english: json['english']?.toString() ?? '',
      acceptedAnswers: accepted.isEmpty ? [answer] : accepted,
      explanation: json['explanation']?.toString() ?? '',
    );
  }

  final String id;
  final String tense;
  final String tenseLabel;
  final String zh;
  final String sentence;
  final String baseVerb;

  String get verbHint => baseVerb.trim().isEmpty
      ? _inferBaseVerb(answer)
      : baseVerb.trim().toLowerCase();
  final String answer;
  final String english;
  final List<String> acceptedAnswers;
  final String explanation;

  bool accepts(String value) {
    final normalized = normalize(value);
    return acceptedAnswers.any((answer) => normalize(answer) == normalized);
  }

  static String _inferBaseVerb(String answer) {
    final words = answer.trim().toLowerCase().split(RegExp(r'\s+'));
    if (words.isEmpty) return '';
    final word = words.last;
    const irregular = <String, String>{
      'am': 'be',
      'is': 'be',
      'are': 'be',
      'was': 'be',
      'were': 'be',
      'been': 'be',
      'being': 'be',
      'has': 'have',
      'had': 'have',
      'does': 'do',
      'did': 'do',
      'done': 'do',
      'went': 'go',
      'gone': 'go',
      'got': 'get',
      'bought': 'buy',
      'began': 'begin',
      'broke': 'break',
      'brought': 'bring',
      'caught': 'catch',
      'chose': 'choose',
      'drank': 'drink',
      'drew': 'draw',
      'drawn': 'draw',
      'drove': 'drive',
      'driven': 'drive',
      'ate': 'eat',
      'eaten': 'eat',
      'felt': 'feel',
      'found': 'find',
      'flew': 'fly',
      'forgot': 'forget',
      'forgotten': 'forget',
      'gave': 'give',
      'given': 'give',
      'grew': 'grow',
      'grown': 'grow',
      'heard': 'hear',
      'knew': 'know',
      'known': 'know',
      'kept': 'keep',
      'left': 'leave',
      'lost': 'lose',
      'made': 'make',
      'meant': 'mean',
      'met': 'meet',
      'paid': 'pay',
      'put': 'put',
      'read': 'read',
      'ran': 'run',
      'said': 'say',
      'saw': 'see',
      'seen': 'see',
      'sent': 'send',
      'sold': 'sell',
      'sat': 'sit',
      'slept': 'sleep',
      'spoke': 'speak',
      'spoken': 'speak',
      'stood': 'stand',
      'stuck': 'stick',
      'swam': 'swim',
      'swum': 'swim',
      'took': 'take',
      'taken': 'take',
      'taught': 'teach',
      'told': 'tell',
      'thought': 'think',
      'threw': 'throw',
      'understood': 'understand',
      'woke': 'wake',
      'wore': 'wear',
      'won': 'win',
      'wrote': 'write',
      'written': 'write',
      'learnt': 'learn',
      'travelled': 'travel',
      'traveled': 'travel',
    };
    final mapped = irregular[word];
    if (mapped != null) return mapped;
    if (word.endsWith('ing') && word.length > 4) {
      final stem = word.substring(0, word.length - 3);
      if (stem.length > 1 && stem[stem.length - 1] == stem[stem.length - 2]) {
        return stem.substring(0, stem.length - 1);
      }
      const dropE = <String, String>{
        'mak': 'make',
        'tak': 'take',
        'us': 'use',
        'mov': 'move',
        'driv': 'drive',
        'leav': 'leave',
        'com': 'come',
        'giv': 'give',
        'hav': 'have',
        'writ': 'write',
        'rid': 'ride',
        'danc': 'dance',
        'clos': 'close',
        'prepar': 'prepare',
        'practis': 'practise',
        'practic': 'practice',
        'stud': 'study',
        'dy': 'die',
      };
      return dropE[stem] ?? stem;
    }
    if (word.endsWith('ies') && word.length > 3) {
      return '${word.substring(0, word.length - 3)}y';
    }
    if (RegExp(r'(ches|shes|sses|xes|zes)$').hasMatch(word)) {
      return word.substring(0, word.length - 2);
    }
    if (word.endsWith('s') && !word.endsWith('ss') && word.length > 2) {
      return word.substring(0, word.length - 1);
    }
    if (word.endsWith('ed') && word.length > 3) {
      return word.substring(0, word.length - 2);
    }
    return word;
  }

  static String normalize(String value) {
    return value
        .trim()
        .toLowerCase()
        .replaceAll(RegExp('[’‘]'), "'")
        .replaceAll(RegExp(r'\s+'), ' ');
  }
}
