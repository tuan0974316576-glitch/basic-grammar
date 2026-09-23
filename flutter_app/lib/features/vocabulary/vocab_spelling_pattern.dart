bool isVocabSpellingLetter(String value) =>
    value.length == 1 && RegExp(r'[A-Za-z]').hasMatch(value);

String vocabSpellingGivenLetter(String answer) {
  for (final character in answer.trim().split('')) {
    if (isVocabSpellingLetter(character)) return character.toLowerCase();
  }
  return '';
}

int vocabSpellingLetterCount(String answer) =>
    answer.split('').where(isVocabSpellingLetter).length;

String normalizeVocabSpellingInput(String value, String answer) {
  final given = vocabSpellingGivenLetter(answer);
  if (given.isEmpty) return '';
  var letters =
      value.split('').where(isVocabSpellingLetter).join().toLowerCase();
  if (!letters.startsWith(given)) letters = '$given$letters';
  final limit = vocabSpellingLetterCount(answer);
  return letters.length <= limit ? letters : letters.substring(0, limit);
}

String composeVocabSpellingAnswer(String answer, String typedLetters) {
  final letters = normalizeVocabSpellingInput(typedLetters, answer);
  var letterIndex = 0;
  final output = StringBuffer();
  for (final character in answer.trim().split('')) {
    if (isVocabSpellingLetter(character)) {
      if (letterIndex < letters.length) output.write(letters[letterIndex]);
      letterIndex += 1;
    } else {
      output.write(character);
    }
  }
  return output.toString();
}
