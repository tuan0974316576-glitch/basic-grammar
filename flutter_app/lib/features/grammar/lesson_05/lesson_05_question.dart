class Lesson05Question {
  const Lesson05Question({
    required this.id,
    required this.sentence,
    required this.zh,
    required this.answer,
    required this.choices,
    required this.slotType,
    required this.explanation,
  });

  factory Lesson05Question.fromJson(Map<String, dynamic> json) {
    final choices = (json['choices'] as List<dynamic>? ?? const [])
        .map((choice) => choice.toString())
        .toList(growable: false);
    if (choices.length != 4) {
      throw const FormatException('Lesson 05 question needs four choices');
    }
    return Lesson05Question(
      id: json['id']?.toString() ?? '',
      sentence: json['sentence']?.toString() ?? '',
      zh: json['zh']?.toString() ?? '',
      answer: json['answer']?.toString() ?? '',
      choices: choices,
      slotType: json['slotType']?.toString() ?? '',
      explanation: json['explanation']?.toString() ?? '',
    );
  }

  final String id;
  final String sentence;
  final String zh;
  final String answer;
  final List<String> choices;
  final String slotType;
  final String explanation;

  String get completedSentence => sentence.replaceFirst('___', answer);
}

class PronounChoiceExplainer {
  const PronounChoiceExplainer._();

  static const roleLabels = {
    'subject': '主語',
    'object': '非主語',
    'possessiveAdjective': '「的」',
    'possessivePronoun': '「的東西」',
  };

  static const forms = <String, _PronounInfo>{
    'I': _PronounInfo({'subject': '我'}),
    'me': _PronounInfo({'object': '我'}),
    'my': _PronounInfo({'possessiveAdjective': '我的'}),
    'mine': _PronounInfo({'possessivePronoun': '我的東西'}),
    'You': _PronounInfo({'subject': '你／你們'}),
    'you': _PronounInfo({'object': '你／你們'}),
    'We': _PronounInfo({'subject': '我們'}),
    'we': _PronounInfo({'subject': '我們'}),
    'us': _PronounInfo({'object': '我們'}),
    'our': _PronounInfo({'possessiveAdjective': '我們的'}),
    'ours': _PronounInfo({'possessivePronoun': '我們的東西'}),
    'He': _PronounInfo({'subject': '他'}),
    'he': _PronounInfo({'subject': '他'}),
    'him': _PronounInfo({'object': '他'}),
    'his': _PronounInfo({
      'possessiveAdjective': '他的',
      'possessivePronoun': '他的東西',
    }),
    'She': _PronounInfo({'subject': '她'}),
    'she': _PronounInfo({'subject': '她'}),
    'her': _PronounInfo({
      'object': '她',
      'possessiveAdjective': '她的',
    }),
    'hers': _PronounInfo({'possessivePronoun': '她的東西'}),
    'It': _PronounInfo({'subject': '它／牠'}),
    'it': _PronounInfo({'object': '它／牠'}),
    'its': _PronounInfo({
      'possessiveAdjective': '它的／牠的',
      'possessivePronoun': '它的東西／牠的東西',
    }),
    'They': _PronounInfo({'subject': '他們／它們'}),
    'they': _PronounInfo({'subject': '他們／它們'}),
    'them': _PronounInfo({'object': '他們／它們'}),
    'their': _PronounInfo({'possessiveAdjective': '他們的／它們的'}),
    'theirs': _PronounInfo({'possessivePronoun': '他們的東西／它們的東西'}),
  };

  static String reason(Lesson05Question question, String choice) {
    final info = forms[choice];
    final role = question.slotType;
    final roleLabel = roleLabels[role] ?? '這個';
    final prefix = choice == question.answer ? '$choice ✓' : '$choice ×';
    if (info == null) return '$prefix：不是這課要使用的代名詞。';
    final matchingMeaning = info.meanings[role];
    if (choice == question.answer) {
      if (role == 'possessiveAdjective') {
        return '$prefix：表示「$matchingMeaning」，後面接名詞，所以要用「的」代名詞。';
      }
      if (role == 'possessivePronoun') {
        return '$prefix：表示「$matchingMeaning」，本身已包含名詞意思，後面不用再接名詞。';
      }
      return '$prefix：表示「$matchingMeaning」，可以放在$roleLabel位置。';
    }
    if (matchingMeaning != null) {
      return '$prefix：雖然也是$roleLabel代名詞，但意思不符合這句中文。';
    }
    final firstRole = info.meanings.keys.first;
    final meaning = info.meanings[firstRole]!;
    if (role == 'subject') {
      if (firstRole == 'object') {
        return '$prefix：雖然意思是「$meaning」，但只可放在動詞或介詞後的非主語位置；這個空格是主語。';
      }
      if (firstRole == 'possessiveAdjective') {
        return '$prefix：表示「$meaning」，後面必須接名詞，不可放在主語位置。';
      }
      return '$prefix：表示「$meaning」，不是主語代名詞。';
    }
    if (role == 'object') {
      if (firstRole == 'subject') {
        return '$prefix：雖然意思是「$meaning」，但只可做主語；動詞或介詞後要用非主語代名詞。';
      }
      if (firstRole == 'possessiveAdjective') {
        return '$prefix：表示「$meaning」，後面必須接名詞，不可單獨放在這裡。';
      }
      return '$prefix：表示「$meaning」，不是非主語代名詞。';
    }
    if (role == 'possessiveAdjective') {
      if (firstRole == 'possessivePronoun') {
        return '$prefix：表示「$meaning」，本身已包含名詞意思，後面不可再接名詞。';
      }
      return '$prefix：表示「$meaning」，不可直接放在名詞前表示「的」。';
    }
    if (role == 'possessivePronoun') {
      if (firstRole == 'possessiveAdjective') {
        return '$prefix：表示「$meaning」，後面必須接名詞；這裡後面沒有名詞。';
      }
      return '$prefix：表示「$meaning」，不是表示「的東西」的代名詞。';
    }
    return '$prefix：不是這個空格需要的$roleLabel代名詞。';
  }
}

class _PronounInfo {
  const _PronounInfo(this.meanings);

  final Map<String, String> meanings;
}
