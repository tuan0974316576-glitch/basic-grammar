(function attachGrammarData(root, factory) {
  const data = factory(root.GrammarCore);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = data;
  }
  root.GrammarData = data;
})(typeof globalThis !== "undefined" ? globalThis : window, function createGrammarData(grammarCore) {
  "use strict";

const QUESTIONS = [
  { id: "v01", type: "action", zh: "我吃蘋果。", english: "I eat an apple.", note: "「吃」是動作動詞。" },
  { id: "v02", type: "action", zh: "他去學校。", english: "He goes to school.", note: "「去」是動作動詞。" },
  { id: "v03", type: "action", zh: "她看書。", english: "She reads a book.", note: "「看」是動作動詞。" },
  { id: "v04", type: "action", zh: "我們踢足球。", english: "We play football.", note: "「踢」是動作動詞。" },
  { id: "v05", type: "action", zh: "你喝水。", english: "You drink water.", note: "「喝」是動作動詞。" },
  { id: "v06", type: "action", zh: "他們唱歌。", english: "They sing songs.", note: "「唱」是動作動詞。" },
  { id: "v07", type: "action", zh: "媽媽煮飯。", english: "Mum cooks dinner.", note: "「煮」是動作動詞。" },
  { id: "v08", type: "action", zh: "爸爸開車。", english: "Dad drives a car.", note: "「開」是動作動詞。" },
  { id: "v09", type: "action", zh: "小明寫字。", english: "Siu Ming writes words.", note: "「寫」是動作動詞。" },
  { id: "v10", type: "action", zh: "妹妹畫畫。", english: "My younger sister draws pictures.", note: "「畫畫」是動作動詞。", verbZh: "畫畫" },
  { id: "v11", type: "action", zh: "老師教英文。", english: "The teacher teaches English.", note: "「教」是動作動詞。" },
  { id: "v12", type: "action", zh: "學生聽故事。", english: "The students listen to a story.", note: "「聽」是動作動詞。" },
  { id: "v13", type: "action", zh: "我買麵包。", english: "I buy bread.", note: "「買」是動作動詞。" },
  { id: "v14", type: "action", zh: "你打開門。", english: "You open the door.", note: "「打開」是動作動詞。" },
  { id: "v15", type: "action", zh: "他關上窗。", english: "He closes the window.", note: "「關上」是動作動詞。" },
  { id: "v16", type: "action", zh: "她洗手。", english: "She washes her hands.", note: "「洗」是動作動詞。" },
  { id: "v17", type: "action", zh: "我們跑步。", english: "We run.", note: "「跑」是動作動詞。" },
  { id: "v18", type: "action", zh: "他們游泳。", english: "They swim.", note: "「游泳」是動作動詞。" },
  { id: "v19", type: "action", zh: "小狗睡覺。", english: "The dog sleeps.", note: "「睡覺」是動作動詞。" },
  { id: "v20", type: "action", zh: "小鳥飛。", english: "The bird flies.", note: "「飛」是動作動詞。" },
  { id: "v21", type: "action", zh: "我做功課。", english: "I do my homework.", note: "「做」是動作動詞。" },
  { id: "v22", type: "action", zh: "你讀英文。", english: "You read English.", note: "「讀」是動作動詞。" },
  { id: "v23", type: "action", zh: "哥哥打籃球。", english: "My older brother plays basketball.", note: "「打」是動作動詞。" },
  { id: "v24", type: "action", zh: "姐姐跳舞。", english: "My older sister dances.", note: "「跳舞」是動作動詞。" },
  { id: "v25", type: "action", zh: "我們玩遊戲。", english: "We play games.", note: "「玩」是動作動詞。" },
  { id: "v26", type: "action", zh: "我洗臉。", english: "I wash my face.", note: "「洗」是動作動詞。" },
  { id: "v27", type: "action", zh: "你刷牙。", english: "You brush your teeth.", note: "「刷」是動作動詞。" },
  { id: "v28", type: "action", zh: "他吃飯。", english: "He eats rice.", note: "「吃」是動作動詞。" },
  { id: "v29", type: "action", zh: "她喝牛奶。", english: "She drinks milk.", note: "「喝」是動作動詞。" },
  { id: "v30", type: "action", zh: "我們看電視。", english: "We watch TV.", note: "「看」是動作動詞。" },
  { id: "v31", type: "action", zh: "他們讀書。", english: "They read books.", note: "「讀」是動作動詞。" },
  { id: "v32", type: "action", zh: "爺爺散步。", english: "Grandpa takes a walk.", note: "「散步」是動作動詞。" },
  { id: "v33", type: "action", zh: "奶奶買菜。", english: "Grandma buys vegetables.", note: "「買」是動作動詞。" },
  { id: "v34", type: "action", zh: "小貓叫。", english: "The kitten meows.", note: "「叫」是動作動詞。" },
  { id: "v35", type: "action", zh: "小狗跑。", english: "The puppy runs.", note: "「跑」是動作動詞。" },
  { id: "v36", type: "action", zh: "弟弟笑。", english: "My younger brother smiles.", note: "「笑」是動作動詞。" },
  { id: "v37", type: "action", zh: "姐姐做蛋糕。", english: "My older sister makes a cake.", note: "「做」是動作動詞。" },
  { id: "v38", type: "action", zh: "老師寫字。", english: "The teacher writes words.", note: "「寫」是動作動詞。" },
  { id: "v39", type: "action", zh: "學生舉手。", english: "The student raises a hand.", note: "「舉」是動作動詞。" },
  { id: "v40", type: "action", zh: "我拿鉛筆。", english: "I take a pencil.", note: "「拿」是動作動詞。" },
  { id: "v41", type: "action", zh: "你關門。", english: "You close the door.", note: "「關」是動作動詞。" },
  { id: "v42", type: "action", zh: "他開燈。", english: "He turns on the light.", note: "「開」是動作動詞。" },
  { id: "v43", type: "action", zh: "她畫星星。", english: "She draws stars.", note: "「畫」是動作動詞。" },
  { id: "v44", type: "action", zh: "我們唱英文歌。", english: "We sing an English song.", note: "「唱」是動作動詞。" },
  { id: "v45", type: "action", zh: "他們跳繩。", english: "They skip rope.", note: "「跳繩」是動作動詞。" },
  { id: "v46", type: "action", zh: "媽媽洗碗。", english: "Mum washes the dishes.", note: "「洗」是動作動詞。" },
  { id: "v47", type: "action", zh: "爸爸看報紙。", english: "Dad reads a newspaper.", note: "「看」是動作動詞。" },
  { id: "v48", type: "action", zh: "小明踢球。", english: "Siu Ming kicks a ball.", note: "「踢」是動作動詞。" },
  { id: "v49", type: "action", zh: "妹妹玩積木。", english: "My younger sister plays with blocks.", note: "「玩」是動作動詞。" },
  { id: "v50", type: "action", zh: "我聽音樂。", english: "I listen to music.", note: "「聽」是動作動詞。" },

  { id: "b01", type: "be", zh: "我是學生。", beForm: "am", english: "I am a student.", subjectZh: "我", subjectEn: "I", subjectRole: "第一身單數", pronoun: "I" },
  { id: "b02", type: "be", zh: "你是老師。", beForm: "are", english: "You are a teacher.", subjectZh: "你", subjectEn: "You", subjectRole: "第二身", pronoun: "You" },
  { id: "b03", type: "be", zh: "他是醫生。", beForm: "is", english: "He is a doctor.", subjectZh: "他", subjectEn: "He", subjectRole: "男性代名詞", pronoun: "He" },
  { id: "b04", type: "be", zh: "她是護士。", beForm: "is", english: "She is a nurse.", subjectZh: "她", subjectEn: "She", subjectRole: "女性代名詞", pronoun: "She" },
  { id: "b05", type: "be", zh: "它是一隻貓。", beForm: "is", english: "It is a cat.", subjectZh: "它", subjectEn: "It", subjectRole: "單數事物或動物", pronoun: "It" },
  { id: "b06", type: "be", zh: "我們是朋友。", beForm: "are", english: "We are friends.", subjectZh: "我們", subjectEn: "We", subjectRole: "第一身眾數", pronoun: "We" },
  { id: "b07", type: "be", zh: "他們是學生。", beForm: "are", english: "They are students.", subjectZh: "他們", subjectEn: "They", subjectRole: "眾數代名詞", pronoun: "They" },
  { id: "b08", type: "be", zh: "這是我的書。", beForm: "is", english: "This is my book.", subjectZh: "這", subjectEn: "This", subjectRole: "單數指示代名詞", pronoun: "This" },
  { id: "b09", type: "be", zh: "那是你的筆。", beForm: "is", english: "That is your pen.", subjectZh: "那", subjectEn: "That", subjectRole: "單數指示代名詞", pronoun: "That" },
  { id: "b10", type: "be", zh: "小明是男孩。", beForm: "is", english: "Siu Ming is a boy.", subjectZh: "小明", subjectEn: "Siu Ming", subjectRole: "男性名字", pronoun: "He" },
  { id: "b11", type: "be", zh: "妹妹是女孩。", beForm: "is", english: "My younger sister is a girl.", subjectZh: "妹妹", subjectEn: "My younger sister", subjectRole: "女性單數名詞", pronoun: "She" },
  { id: "b12", type: "be", zh: "爸爸是司機。", beForm: "is", english: "Dad is a driver.", subjectZh: "爸爸", subjectEn: "Dad", subjectRole: "男性單數名詞", pronoun: "He" },
  { id: "b13", type: "be", zh: "媽媽是廚師。", beForm: "is", english: "Mum is a cook.", subjectZh: "媽媽", subjectEn: "Mum", subjectRole: "女性單數名詞", pronoun: "She" },
  { id: "b14", type: "be", zh: "這些是蘋果。", beForm: "are", english: "These are apples.", subjectZh: "這些", subjectEn: "These", subjectRole: "眾數指示代名詞", pronoun: "They" },
  { id: "b15", type: "be", zh: "那些是椅子。", beForm: "are", english: "Those are chairs.", subjectZh: "那些", subjectEn: "Those", subjectRole: "眾數指示代名詞", pronoun: "They" },
  { id: "b16", type: "be", zh: "我是男孩。", beForm: "am", english: "I am a boy.", subjectZh: "我", subjectEn: "I", subjectRole: "第一身單數", pronoun: "I" },
  { id: "b17", type: "be", zh: "你是女孩。", beForm: "are", english: "You are a girl.", subjectZh: "你", subjectEn: "You", subjectRole: "第二身", pronoun: "You" },
  { id: "b18", type: "be", zh: "他是哥哥。", beForm: "is", english: "He is my older brother.", subjectZh: "他", subjectEn: "He", subjectRole: "男性代名詞", pronoun: "He" },
  { id: "b19", type: "be", zh: "她是姐姐。", beForm: "is", english: "She is my older sister.", subjectZh: "她", subjectEn: "She", subjectRole: "女性代名詞", pronoun: "She" },
  { id: "b20", type: "be", zh: "它是一隻狗。", beForm: "is", english: "It is a dog.", subjectZh: "它", subjectEn: "It", subjectRole: "單數事物或動物", pronoun: "It" },
  { id: "b21", type: "be", zh: "我們是同學。", beForm: "are", english: "We are classmates.", subjectZh: "我們", subjectEn: "We", subjectRole: "第一身眾數", pronoun: "We" },
  { id: "b22", type: "be", zh: "他們是朋友。", beForm: "are", english: "They are friends.", subjectZh: "他們", subjectEn: "They", subjectRole: "眾數代名詞", pronoun: "They" },
  { id: "b23", type: "be", zh: "這是書包。", beForm: "is", english: "This is a school bag.", subjectZh: "這", subjectEn: "This", subjectRole: "單數指示代名詞", pronoun: "This" },
  { id: "b24", type: "be", zh: "那是尺。", beForm: "is", english: "That is a ruler.", subjectZh: "那", subjectEn: "That", subjectRole: "單數指示代名詞", pronoun: "That" },
  { id: "b25", type: "be", zh: "Tom是男孩。", beForm: "is", english: "Tom is a boy.", subjectZh: "Tom", subjectEn: "Tom", subjectRole: "男性名字", pronoun: "He" },
  { id: "b26", type: "be", zh: "Mary是女孩。", beForm: "is", english: "Mary is a girl.", subjectZh: "Mary", subjectEn: "Mary", subjectRole: "女性名字", pronoun: "She" },
  { id: "b27", type: "be", zh: "這些是鉛筆。", beForm: "are", english: "These are pencils.", subjectZh: "這些", subjectEn: "These", subjectRole: "眾數指示代名詞", pronoun: "They" },
  { id: "b28", type: "be", zh: "那些是橡皮。", beForm: "are", english: "Those are erasers.", subjectZh: "那些", subjectEn: "Those", subjectRole: "眾數指示代名詞", pronoun: "They" },
  { id: "b29", type: "be", zh: "蘋果是水果。", beForm: "are", english: "Apples are fruit.", subjectZh: "蘋果", subjectEn: "Apples", subjectRole: "眾數名詞", pronoun: "They" },
  { id: "b30", type: "be", zh: "香蕉是水果。", beForm: "are", english: "Bananas are fruit.", subjectZh: "香蕉", subjectEn: "Bananas", subjectRole: "眾數名詞", pronoun: "They" },

  { id: "a01", type: "adjective", zh: "我很累。", beForm: "am", english: "I am tired.", subjectZh: "我", subjectEn: "I", subjectRole: "第一身單數", pronoun: "I" },
  { id: "a02", type: "adjective", zh: "你很開心。", beForm: "are", english: "You are happy.", subjectZh: "你", subjectEn: "You", subjectRole: "第二身", pronoun: "You" },
  { id: "a03", type: "adjective", zh: "他很高。", beForm: "is", english: "He is tall.", subjectZh: "他", subjectEn: "He", subjectRole: "男性代名詞", pronoun: "He" },
  { id: "a04", type: "adjective", zh: "她很聰明。", beForm: "is", english: "She is smart.", subjectZh: "她", subjectEn: "She", subjectRole: "女性代名詞", pronoun: "She" },
  { id: "a05", type: "adjective", zh: "它很可愛。", beForm: "is", english: "It is cute.", subjectZh: "它", subjectEn: "It", subjectRole: "單數事物或動物", pronoun: "It" },
  { id: "a06", type: "adjective", zh: "我們很忙。", beForm: "are", english: "We are busy.", subjectZh: "我們", subjectEn: "We", subjectRole: "第一身眾數", pronoun: "We" },
  { id: "a07", type: "adjective", zh: "他們很友善。", beForm: "are", english: "They are kind.", subjectZh: "他們", subjectEn: "They", subjectRole: "眾數代名詞", pronoun: "They" },
  { id: "a08", type: "adjective", zh: "天氣很熱。", beForm: "is", english: "The weather is hot.", subjectZh: "天氣", subjectEn: "The weather", subjectRole: "單數名詞", pronoun: "It" },
  { id: "a09", type: "adjective", zh: "這本書很有趣。", beForm: "is", english: "This book is interesting.", subjectZh: "這本書", subjectEn: "This book", subjectRole: "單數名詞", pronoun: "It" },
  { id: "a10", type: "adjective", zh: "房間很乾淨。", beForm: "is", english: "The room is clean.", subjectZh: "房間", subjectEn: "The room", subjectRole: "單數名詞", pronoun: "It" },
  { id: "a11", type: "adjective", zh: "Tom很累。", beForm: "is", english: "Tom is tired.", subjectZh: "Tom", subjectEn: "Tom", subjectRole: "男性名字", pronoun: "He" },
  { id: "a12", type: "adjective", zh: "Mary很開心。", beForm: "is", english: "Mary is happy.", subjectZh: "Mary", subjectEn: "Mary", subjectRole: "女性名字", pronoun: "She" },
  { id: "a13", type: "adjective", zh: "小狗很小。", beForm: "is", english: "The puppy is small.", subjectZh: "小狗", subjectEn: "The puppy", subjectRole: "單數動物名詞", pronoun: "It" },
  { id: "a14", type: "adjective", zh: "小貓很白。", beForm: "is", english: "The kitten is white.", subjectZh: "小貓", subjectEn: "The kitten", subjectRole: "單數動物名詞", pronoun: "It" },
  { id: "a15", type: "adjective", zh: "蘋果很甜。", beForm: "are", english: "Apples are sweet.", subjectZh: "蘋果", subjectEn: "Apples", subjectRole: "眾數名詞", pronoun: "They" },
  { id: "a16", type: "adjective", zh: "香蕉很長。", beForm: "are", english: "Bananas are long.", subjectZh: "香蕉", subjectEn: "Bananas", subjectRole: "眾數名詞", pronoun: "They" },
  { id: "a17", type: "adjective", zh: "我的書很新。", beForm: "is", english: "My book is new.", subjectZh: "我的書", subjectEn: "My book", subjectRole: "單數名詞", pronoun: "It" },
  { id: "a18", type: "adjective", zh: "你的筆很短。", beForm: "is", english: "Your pencil is short.", subjectZh: "你的筆", subjectEn: "Your pencil", subjectRole: "單數名詞", pronoun: "It" },
  { id: "a19", type: "adjective", zh: "我們很高興。", beForm: "are", english: "We are glad.", subjectZh: "我們", subjectEn: "We", subjectRole: "第一身眾數", pronoun: "We" },
  { id: "a20", type: "adjective", zh: "他們很安靜。", beForm: "are", english: "They are quiet.", subjectZh: "他們", subjectEn: "They", subjectRole: "眾數代名詞", pronoun: "They" }
];

let verbCountQuestionNumber = 0;

function makeVerbCountQuestion(sentence, zh, isCorrect, verbCount, verbIndexes, explanation, correction) {
  verbCountQuestionNumber += 1;
  return {
    id: `vc${String(verbCountQuestionNumber).padStart(3, "0")}`,
    sentence,
    zh,
    isCorrect,
    verbCount,
    verbIndexes,
    explanation,
    correction
  };
}

function verbKindText(kind) {
  return kind === "be" ? "be 動詞" : "動詞";
}

function oneVerb(sentence, zh, verbIndex, verb, kind = "現在式") {
  return makeVerbCountQuestion(
    sentence,
    zh,
    true,
    1,
    [verbIndex],
    `${verb} 是${verbKindText(kind)}，所以句子有 1 個動詞。`,
    `句子正確，不用改。動詞是 ${verb}。`
  );
}

function zeroVerb(sentence, zh, reason, correction) {
  const question = makeVerbCountQuestion(
    sentence,
    zh,
    false,
    0,
    [],
    `${reason}，所以句子沒有動詞。`,
    correction
  );
  question.correctSentence = correction.replace(/^正確寫法：/, "").replace(/[。！？!?]+$/g, "").trim();
  question.acceptedAnswers = [question.correctSentence];
  return question;
}

function twoVerbs(sentence, zh, verbIndexes, beVerb, mainVerb, kind, correctionSentence) {
  const question = makeVerbCountQuestion(
    sentence,
    zh,
    false,
    2,
    verbIndexes,
    `${beVerb} 是 be 動詞，${mainVerb} 是${verbKindText(kind)}，所以句子有 2 個動詞。`,
    `${beVerb} 是多餘的，應寫 ${correctionSentence}`
  );
  question.correctSentence = correctionSentence;
  question.acceptedAnswers = [correctionSentence];
  return question;
}

const VERB_COUNT_QUESTIONS = [
  oneVerb("I eat breakfast.", "我吃早餐。", 1, "eat"),
  oneVerb("You go home.", "你回家。", 1, "go"),
  oneVerb("He plays football.", "他踢足球。", 1, "plays"),
  oneVerb("She reads books.", "她看書。", 1, "reads"),
  oneVerb("We sing songs.", "我們唱歌。", 1, "sing"),
  oneVerb("They run fast.", "他們跑得快。", 1, "run"),
  oneVerb("Tom cooks dinner.", "Tom 煮晚餐。", 1, "cooks"),
  oneVerb("Mary writes words.", "Mary 寫字。", 1, "writes"),
  oneVerb("Dad drives slowly.", "爸爸慢慢開車。", 1, "drives"),
  oneVerb("Mum washes dishes.", "媽媽洗碗。", 1, "washes"),
  oneVerb("The dog sleeps.", "狗睡覺。", 2, "sleeps"),
  oneVerb("The cat jumps.", "貓跳。", 2, "jumps"),
  oneVerb("I am happy.", "我很開心。", 1, "am", "be"),
  oneVerb("You are late.", "你遲到了。", 1, "are", "be"),
  oneVerb("He is tired.", "他很累。", 1, "is", "be"),
  oneVerb("She is ready.", "她準備好了。", 1, "is", "be"),
  oneVerb("They are kind.", "他們很友善。", 1, "are", "be"),
  oneVerb("We are at school.", "我們在學校。", 1, "are", "be"),
  oneVerb("The apple is red.", "蘋果是紅色的。", 2, "is", "be"),
  oneVerb("The boys are noisy.", "男孩們很嘈。", 2, "are", "be"),

  zeroVerb("I happy.", "我很開心。", "happy 是形容詞", "正確寫法：I am happy."),
  zeroVerb("You late.", "你遲到了。", "late 是形容詞", "正確寫法：You are late."),
  zeroVerb("He tired.", "他很累。", "tired 是形容詞", "正確寫法：He is tired."),
  zeroVerb("She ready.", "她準備好了。", "ready 是形容詞", "正確寫法：She is ready."),
  zeroVerb("They kind.", "他們很友善。", "kind 是形容詞", "正確寫法：They are kind."),
  zeroVerb("We at school.", "我們在學校。", "at school 不是動詞", "正確寫法：We are at school."),
  zeroVerb("The apple red.", "蘋果是紅色的。", "red 是形容詞", "正確寫法：The apple is red."),
  zeroVerb("The boys noisy.", "男孩們很嘈。", "noisy 是形容詞", "正確寫法：The boys are noisy."),
  zeroVerb("We very happy.", "我們很開心。", "very happy 是形容詞短語", "正確寫法：We are very happy."),

  twoVerbs("I am eat breakfast.", "我吃早餐。", [1, 2], "am", "eat", "現在式", "I eat breakfast."),
  twoVerbs("You are go home.", "你回家。", [1, 2], "are", "go", "現在式", "You go home."),
  twoVerbs("He is plays football.", "他踢足球。", [1, 2], "is", "plays", "現在式", "He plays football."),
  twoVerbs("She is reads books.", "她看書。", [1, 2], "is", "reads", "現在式", "She reads books."),
  twoVerbs("We are sing songs.", "我們唱歌。", [1, 2], "are", "sing", "現在式", "We sing songs."),
  twoVerbs("They are run fast.", "他們跑得快。", [1, 2], "are", "run", "現在式", "They run fast."),
  twoVerbs("Tom is cooks dinner.", "Tom 煮晚餐。", [1, 2], "is", "cooks", "現在式", "Tom cooks dinner."),
  twoVerbs("Mary is writes words.", "Mary 寫字。", [1, 2], "is", "writes", "現在式", "Mary writes words."),
  twoVerbs("Dad is drives slowly.", "爸爸慢慢開車。", [1, 2], "is", "drives", "現在式", "Dad drives slowly."),
  twoVerbs("Mum is washes dishes.", "媽媽洗碗。", [1, 2], "is", "washes", "現在式", "Mum washes dishes."),
  twoVerbs("The dog is sleeps.", "狗睡覺。", [2, 3], "is", "sleeps", "現在式", "The dog sleeps."),
  twoVerbs("The cat is jumps.", "貓跳。", [2, 3], "is", "jumps", "現在式", "The cat jumps."),
  twoVerbs("I am read books.", "我看書。", [1, 2], "am", "read", "現在式", "I read books."),
  twoVerbs("You are eat noodles.", "你吃麵。", [1, 2], "are", "eat", "現在式", "You eat noodles."),
  twoVerbs("He is runs home.", "他跑回家。", [1, 2], "is", "runs", "現在式", "He runs home."),
  twoVerbs("She is jumps high.", "她跳得高。", [1, 2], "is", "jumps", "現在式", "She jumps high."),
  twoVerbs("We are play games.", "我們玩遊戲。", [1, 2], "are", "play", "現在式", "We play games."),
  twoVerbs("They are watch TV.", "他們看電視。", [1, 2], "are", "watch", "現在式", "They watch TV."),
  twoVerbs("Tom is opens the window.", "Tom 打開窗。", [1, 2], "is", "opens", "現在式", "Tom opens the window."),
  twoVerbs("Mary is closes the door.", "Mary 關門。", [1, 2], "is", "closes", "現在式", "Mary closes the door."),
  twoVerbs("Dad is buys bread.", "爸爸買麵包。", [1, 2], "is", "buys", "現在式", "Dad buys bread."),
  twoVerbs("Mum is makes tea.", "媽媽泡茶。", [1, 2], "is", "makes", "現在式", "Mum makes tea."),
  twoVerbs("The baby is cries.", "寶寶哭。", [2, 3], "is", "cries", "現在式", "The baby cries."),
  twoVerbs("The birds are fly.", "鳥飛。", [2, 3], "are", "fly", "現在式", "The birds fly."),
  twoVerbs("The children are play outside.", "小朋友們在外面玩。", [2, 3], "are", "play", "現在式", "The children play outside."),
  twoVerbs("The teacher is teaches English.", "老師教英文。", [2, 3], "is", "teaches", "現在式", "The teacher teaches English."),
  twoVerbs("The student is writes words.", "學生寫字。", [2, 3], "is", "writes", "現在式", "The student writes words.")
];

const SENTENCE_BUILD_QUESTIONS = [
  { id: "q101", zh: "她吃蘋果。", answer: ["She", "eats", "apples."], distractors: ["eat", "is"] },
  { id: "q102", zh: "你喝水。", answer: ["You", "drink", "water."], distractors: ["drinks", "are"] },
  { id: "q103", zh: "他踢足球。", answer: ["He", "plays", "football."], distractors: ["play", "is"] },
  { id: "q104", zh: "她看書。", answer: ["She", "reads", "books."], distractors: ["read", "is"] },
  { id: "q105", zh: "我們上學。", answer: ["We", "go", "to", "school."], distractors: ["goes", "are"] },
  { id: "q106", zh: "他們唱歌。", answer: ["They", "sing", "songs."], distractors: ["sings", "are"] },
  { id: "q107", zh: "Tom 很累。", answer: ["Tom", "is", "tired."], distractors: ["are", "am"] },
  { id: "q108", zh: "Mary 很開心。", answer: ["Mary", "is", "happy."], distractors: ["are", "am"] },
  { id: "q109", zh: "我是學生。", answer: ["I", "am", "a", "student."], distractors: ["is", "are"] },
  { id: "q110", zh: "你是老師。", answer: ["You", "are", "a", "teacher."], distractors: ["is", "am"] },
  { id: "q111", zh: "他是男孩。", answer: ["He", "is", "a", "boy."], distractors: ["are", "am"] },
  { id: "q112", zh: "她是女孩。", answer: ["She", "is", "a", "girl."], distractors: ["are", "am"] },
  { id: "q113", zh: "我很高興。", answer: ["I", "am", "happy."], distractors: ["is", "are"] },
  { id: "q114", zh: "你很遲。", answer: ["You", "are", "late."], distractors: ["is", "am"] },
  { id: "q115", zh: "他很高。", answer: ["He", "is", "tall."], distractors: ["are", "am"] },
  { id: "q116", zh: "她很聰明。", answer: ["She", "is", "smart."], distractors: ["are", "am"] },
  { id: "q117", zh: "她喜歡狗。", answer: ["She", "likes", "dogs."], distractors: ["like", "is"] },
  { id: "q118", zh: "你喜歡英文。", answer: ["You", "like", "English."], distractors: ["likes", "are"] },
  { id: "q119", zh: "我有一本書。", answer: ["I", "have", "a", "book."], distractors: ["has", "am"] },
  { id: "q120", zh: "你有一支筆。", answer: ["You", "have", "a", "pen."], distractors: ["has", "are"] },
  { id: "q121", zh: "我們玩遊戲。", answer: ["We", "play", "games."], distractors: ["plays", "are"] },
  { id: "q122", zh: "他們跑得快。", answer: ["They", "run", "fast."], distractors: ["runs", "are"] },
  { id: "q123", zh: "Tom 煮晚餐。", answer: ["Tom", "cooks", "dinner."], distractors: ["cook", "is"] },
  { id: "q124", zh: "Mary 寫字。", answer: ["Mary", "writes", "words."], distractors: ["write", "is"] },
  { id: "q125", zh: "媽媽洗碗。", answer: ["Mum", "washes", "dishes."], distractors: ["wash", "is"] },
  { id: "q126", zh: "爸爸開車。", answer: ["Dad", "drives", "a", "car."], distractors: ["drive", "is"] },
  { id: "q127", zh: "這是我的書。", answer: ["This", "is", "my", "book."], distractors: ["are", "am"] },
  { id: "q128", zh: "那是你的筆。", answer: ["That", "is", "your", "pen."], distractors: ["are", "am"] },
  { id: "q129", zh: "這些是蘋果。", answer: ["These", "are", "apples."], distractors: ["is", "apple."] },
  { id: "q130", zh: "那些是椅子。", answer: ["Those", "are", "chairs."], distractors: ["is", "chair."] },
  { id: "q131", zh: "我在學校。", answer: ["I", "am", "at", "school."], distractors: ["is", "are"] },
  { id: "q132", zh: "你在家。", answer: ["You", "are", "at", "home."], distractors: ["is", "am"] },
  { id: "q133", zh: "他在公園。", answer: ["He", "is", "at", "the", "park."], distractors: ["are", "am"] },
  { id: "q134", zh: "她在房間。", answer: ["She", "is", "in", "the", "room."], distractors: ["are", "am"] },
  { id: "q135", zh: "我每天游泳。", answer: ["I", "swim", "every", "day."], distractors: ["swims", "am"] },
  { id: "q136", zh: "你每天跑步。", answer: ["You", "run", "every", "day."], distractors: ["runs", "are"] },
  { id: "q137", zh: "他每天讀書。", answer: ["He", "reads", "every", "day."], distractors: ["read", "is"] },
  { id: "q138", zh: "她每天唱歌。", answer: ["She", "sings", "every", "day."], distractors: ["sing", "is"] },
  { id: "q139", zh: "我們吃午餐。", answer: ["We", "eat", "lunch."], distractors: ["eats", "are"] },
  { id: "q140", zh: "他們喝牛奶。", answer: ["They", "drink", "milk."], distractors: ["drinks", "are"] },
  { id: "q141", zh: "我的書很新。", answer: ["My", "books", "are", "new."], distractors: ["book", "is"] },
  { id: "q142", zh: "你的筆很短。", answer: ["Your", "pens", "are", "short."], distractors: ["pen", "is"] },
  { id: "q143", zh: "這個房間很乾淨。", answer: ["This", "room", "is", "clean."], distractors: ["rooms", "are"] },
  { id: "q144", zh: "天氣很熱。", answer: ["The", "weather", "is", "hot."], distractors: ["are", "am"] },
  { id: "q145", zh: "我打開門。", answer: ["I", "open", "the", "door."], distractors: ["opens", "am"] },
  { id: "q146", zh: "你關上窗。", answer: ["You", "close", "the", "window."], distractors: ["closes", "are"] },
  { id: "q147", zh: "他買麵包。", answer: ["He", "buys", "bread."], distractors: ["buy", "is"] },
  { id: "q148", zh: "她畫星星。", answer: ["She", "draws", "stars."], distractors: ["draw", "is"] },
  { id: "q149", zh: "我們聽音樂。", answer: ["We", "listen", "to", "music."], distractors: ["listens", "are"] },
  { id: "q150", zh: "他們看電視。", answer: ["They", "watch", "TV."], distractors: ["watches", "are"] }
];

function makeUnderlineQuestion(id, segments) {
  return {
    id,
    text: segments.flat().join(" "),
    segments
  };
}

const SENTENCE_UNDERLINE_QUESTIONS = [
  makeUnderlineQuestion("su001", [["China", "is", "a", "good", "country."], ["I", "love", "it."]]),
  makeUnderlineQuestion("su002", [["Tom", "is", "tired."], ["He", "wants", "to", "sleep."]]),
  makeUnderlineQuestion("su003", [["I", "like", "English."], ["It", "is", "fun."]]),
  makeUnderlineQuestion("su004", [["My", "mum", "cooks", "dinner."], ["We", "eat", "rice."]]),
  makeUnderlineQuestion("su005", [["The", "weather", "is", "hot."], ["I", "drink", "water."]]),
  makeUnderlineQuestion("su006", [["I", "think"], ["you", "are", "right."]]),
  makeUnderlineQuestion("su007", [["She", "thinks"], ["Tom", "is", "kind."]]),
  makeUnderlineQuestion("su008", [["We", "believe"], ["they", "can", "win."]]),
  makeUnderlineQuestion("su009", [["Tom", "said"], ["Mary", "is", "late."]]),
  makeUnderlineQuestion("su010", [["Mum", "said"], ["I", "can", "go."]]),
  makeUnderlineQuestion("su011", [["I", "am", "happy", "that"], ["you", "can", "come."]]),
  makeUnderlineQuestion("su012", [["She", "is", "sad", "that"], ["Tom", "cannot", "play."]]),
  makeUnderlineQuestion("su013", [["He", "told", "me", "that"], ["he", "is", "busy."]]),
  makeUnderlineQuestion("su014", [["We", "know", "that"], ["they", "like", "English."]]),
  makeUnderlineQuestion("su015", [["I", "hope", "that"], ["you", "are", "ready."]]),
  makeUnderlineQuestion("su016", [["I", "like", "tea", "and"], ["Mary", "likes", "coffee."]]),
  makeUnderlineQuestion("su017", [["Tom", "is", "tired", "but"], ["he", "keeps", "working."]]),
  makeUnderlineQuestion("su018", [["You", "should", "hurry", "or"], ["you", "will", "be", "late."]]),
  makeUnderlineQuestion("su019", [["It", "is", "raining", "so"], ["we", "stay", "home."]]),
  makeUnderlineQuestion("su020", [["I", "can", "sing", "and"], ["you", "can", "dance."]]),
  makeUnderlineQuestion("su021", [["She", "likes", "dogs", "but"], ["Tom", "likes", "cats."]]),
  makeUnderlineQuestion("su022", [["You", "should", "give", "me", "the", "password", "or"], ["you", "may", "lose", "all", "the", "money."]]),
  makeUnderlineQuestion("su023", [["I", "think"], ["you", "are", "smart", "and"], ["you", "can", "help", "me."]]),
  makeUnderlineQuestion("su024", [["Tom", "said"], ["Mary", "is", "happy", "but"], ["he", "is", "sad."]]),
  makeUnderlineQuestion("su025", [["I", "am", "glad", "that"], ["you", "are", "here", "and"], ["we", "can", "start."]]),
  makeUnderlineQuestion("su026", [["She", "believes"], ["I", "am", "right", "but"], ["you", "disagree."]]),
  makeUnderlineQuestion("su027", [["I", "know", "that"], ["he", "likes", "music."]]),
  makeUnderlineQuestion("su028", [["They", "said"], ["we", "are", "early."]]),
  makeUnderlineQuestion("su029", [["I", "love", "Hong", "Kong."], ["It", "is", "my", "home."]]),
  makeUnderlineQuestion("su030", [["You", "can", "take", "the", "bus", "or"], ["you", "can", "walk", "home."]])
];

const PRONOUN_CATEGORIES = [
  { key: "subject", label: "主語" },
  { key: "object", label: "非主語" },
  { key: "possessiveAdjective", label: "的" },
  { key: "possessivePronoun", label: "的東西" }
];

const PRONOUN_MATCH_QUESTIONS = [
  {
    id: "pm001",
    zh: "我",
    forms: { subject: "I", object: "me", possessiveAdjective: "my", possessivePronoun: "mine" }
  },
  {
    id: "pm002",
    zh: "你",
    forms: { subject: "You", object: "you", possessiveAdjective: "your", possessivePronoun: "yours" }
  },
  {
    id: "pm003",
    zh: "我們",
    forms: { subject: "We", object: "us", possessiveAdjective: "our", possessivePronoun: "ours" }
  },
  {
    id: "pm004",
    zh: "他們",
    forms: { subject: "They", object: "them", possessiveAdjective: "their", possessivePronoun: "theirs" }
  },
  {
    id: "pm005",
    zh: "他",
    forms: { subject: "He", object: "him", possessiveAdjective: "his", possessivePronoun: "his" }
  },
  {
    id: "pm006",
    zh: "她",
    forms: { subject: "She", object: "her", possessiveAdjective: "her", possessivePronoun: "hers" }
  },
  {
    id: "pm007",
    zh: "它/牠",
    forms: { subject: "It", object: "it", possessiveAdjective: "its", possessivePronoun: "its" }
  }
];

function makePronounSentenceQuestion({ id, sentence, zh, answer, choices, explanation }) {
  return {
    id,
    type: "pronoun-sentence",
    sentence,
    zh,
    answer,
    choices,
    slotType: "",
    explanation
  };
}

const PRONOUN_SENTENCE_QUESTIONS = [
  { id: "ps001", sentence: "___ is a doctor.", zh: "他是一名醫生。", answer: "He", choices: ["He", "him", "We", "His"], explanation: "空格在 is 前面，是主語位置，所以要用主語代名詞 He。" },
  { id: "ps002", sentence: "___ am happy today.", zh: "我今天很開心。", answer: "I", choices: ["I", "me", "my", "mine"], explanation: "空格在 am 前面，是主語位置，所以要用主語代名詞 I。" },
  { id: "ps003", sentence: "___ are my classmates.", zh: "他們是我的同學。", answer: "They", choices: ["They", "them", "their", "theirs"], explanation: "空格在 are 前面，是主語位置，所以要用主語代名詞 They。" },
  { id: "ps004", sentence: "___ are in the classroom.", zh: "我們在課室裏。", answer: "We", choices: ["We", "us", "our", "ours"], explanation: "空格在 are 前面，是主語位置，所以要用主語代名詞 We。" },
  { id: "ps005", sentence: "___ is under the chair.", zh: "它在椅子下。", answer: "It", choices: ["It", "it", "its", "They"], explanation: "空格在 is 前面，是主語位置，所以要用主語代名詞 It。" },
  { id: "ps006", sentence: "___ is my sister.", zh: "她是我的姐姐。", answer: "She", choices: ["She", "her", "hers", "their"], explanation: "空格在 is 前面，是主語位置，所以要用主語代名詞 She。" },
  { id: "ps007", sentence: "___ are very kind.", zh: "你很友善。", answer: "You", choices: ["You", "your", "yours", "us"], explanation: "空格在 are 前面，是主語位置，所以要用主語代名詞 You。" },
  { id: "ps008", sentence: "___ can swim well.", zh: "我們很會游泳。", answer: "We", choices: ["We", "us", "our", "ours"], explanation: "空格在 can 前面，是主語位置，所以要用主語代名詞 We。" },
  { id: "ps009", sentence: "___ has a red bag.", zh: "他有一個紅色書包。", answer: "He", choices: ["He", "him", "his", "they"], explanation: "空格在 has 前面，是主語位置，所以要用主語代名詞 He。" },
  { id: "ps010", sentence: "___ like English.", zh: "他們喜歡英文。", answer: "They", choices: ["They", "them", "their", "theirs"], explanation: "空格在 like 前面，是主語位置，所以要用主語代名詞 They。" },
  { id: "ps011", sentence: "___ goes to school by bus.", zh: "她坐巴士上學。", answer: "She", choices: ["She", "her", "hers", "we"], explanation: "空格在 goes 前面，是主語位置，所以要用主語代名詞 She。" },
  { id: "ps012", sentence: "___ are ready now.", zh: "你們現在準備好了。", answer: "You", choices: ["You", "your", "yours", "me"], explanation: "空格在 are 前面，是主語位置，所以要用主語代名詞 You。" },
  { id: "ps013", sentence: "___ is a small cat.", zh: "牠是一隻小貓。", answer: "It", choices: ["It", "it", "its", "them"], explanation: "空格在 is 前面，是主語位置，所以要用主語代名詞 It。" },
  { id: "ps014", sentence: "Tom is talking to ___.", zh: "Tom 正在和她說話。", answer: "her", choices: ["she", "her", "their", "We"], explanation: "空格在 to 後面，是非主語位置，所以要用非主語代名詞 her。" },
  { id: "ps015", sentence: "Mary is helping ___.", zh: "Mary 正在幫他。", answer: "him", choices: ["he", "him", "their", "They"], explanation: "空格在 helping 後面，是非主語位置，所以要用非主語代名詞 him。" },
  { id: "ps016", sentence: "The teacher is helping ___.", zh: "老師正在幫我們。", answer: "us", choices: ["We", "us", "our", "They"], explanation: "空格在 helping 後面，是非主語位置，所以要用非主語代名詞 us。" },
  { id: "ps017", sentence: "This gift is for ___.", zh: "這份禮物是給你的。", answer: "you", choices: ["you", "your", "we", "They"], explanation: "空格在 for 後面，是非主語位置，所以要用非主語代名詞 you。" },
  { id: "ps018", sentence: "Mum is looking at ___.", zh: "媽媽正在看我。", answer: "me", choices: ["I", "me", "my", "We"], explanation: "空格在 at 後面，是非主語位置，所以要用非主語代名詞 me。" },
  { id: "ps019", sentence: "Dad is calling ___.", zh: "爸爸正在叫他們。", answer: "them", choices: ["They", "them", "their", "We"], explanation: "空格在 calling 後面，是非主語位置，所以要用非主語代名詞 them。" },
  { id: "ps020", sentence: "I am sitting with ___.", zh: "我正和他坐在一起。", answer: "him", choices: ["he", "him", "their", "They"], explanation: "空格在 with 後面，是非主語位置，所以要用非主語代名詞 him。" },
  { id: "ps021", sentence: "Please listen to ___.", zh: "請聽我說。", answer: "me", choices: ["I", "me", "my", "We"], explanation: "空格在 to 後面，是非主語位置，所以要用非主語代名詞 me。" },
  { id: "ps022", sentence: "The coach is watching ___.", zh: "教練正在看我們。", answer: "us", choices: ["We", "us", "our", "They"], explanation: "空格在 watching 後面，是非主語位置，所以要用非主語代名詞 us。" },
  { id: "ps023", sentence: "He is waiting for ___.", zh: "他正在等她。", answer: "her", choices: ["she", "her", "their", "We"], explanation: "空格在 for 後面，是非主語位置，所以要用非主語代名詞 her。" },
  { id: "ps024", sentence: "Anna is playing with ___.", zh: "Anna 正在和他們玩。", answer: "them", choices: ["They", "them", "their", "We"], explanation: "空格在 with 後面，是非主語位置，所以要用非主語代名詞 them。" },
  { id: "ps025", sentence: "The loud noise scares ___.", zh: "巨響嚇到我。", answer: "me", choices: ["I", "me", "my", "We"], explanation: "空格在 scares 後面，是非主語位置，所以要用非主語代名詞 me。" },
  { id: "ps026", sentence: "This is ___ book.", zh: "這是我的書。", answer: "my", choices: ["I", "me", "my", "mine"], explanation: "空格後面有名詞 book，表示「我的」，所以要用 my。" },
  { id: "ps027", sentence: "That is ___ pencil.", zh: "那是你的鉛筆。", answer: "your", choices: ["you", "your", "yours", "we"], explanation: "空格後面有名詞 pencil，表示「你的」，所以要用 your。" },
  { id: "ps028", sentence: "He is ___ brother.", zh: "他是她的哥哥。", answer: "her", choices: ["she", "her", "hers", "him"], explanation: "空格後面有名詞 brother，表示「她的」，所以要用 her。" },
  { id: "ps029", sentence: "This is ___ sister.", zh: "這是你的姐姐。", answer: "your", choices: ["theirs", "it", "we", "your"], explanation: "空格後面有名詞 sister，表示「你的」，所以要用 your。" },
  { id: "ps030", sentence: "They love ___ school.", zh: "他們喜歡他們的學校。", answer: "their", choices: ["They", "them", "their", "theirs"], explanation: "空格後面有名詞 school，表示「他們的」，所以要用 their。" },
  { id: "ps031", sentence: "We clean ___ classroom.", zh: "我們打掃我們的課室。", answer: "our", choices: ["We", "us", "our", "ours"], explanation: "空格後面有名詞 classroom，表示「我們的」，所以要用 our。" },
  { id: "ps032", sentence: "The cat is eating ___ food.", zh: "貓正在吃牠的食物。", answer: "its", choices: ["It", "it", "its", "they"], explanation: "空格後面有名詞 food，表示「牠的」，所以要用 its。" },
  { id: "ps033", sentence: "Tom is carrying ___ bag.", zh: "Tom 正拿著他的書包。", answer: "his", choices: ["he", "him", "his", "hers"], explanation: "空格後面有名詞 bag，表示「他的」，所以要用 his。" },
  { id: "ps034", sentence: "Mary is opening ___ lunch box.", zh: "Mary 正打開她的飯盒。", answer: "her", choices: ["she", "her", "hers", "him"], explanation: "空格後面有名詞 lunch box，表示「她的」，所以要用 her。" },
  { id: "ps035", sentence: "I like ___ new shoes.", zh: "我喜歡你的新鞋。", answer: "your", choices: ["you", "your", "yours", "them"], explanation: "空格後面有名詞 shoes，表示「你的」，所以要用 your。" },
  { id: "ps036", sentence: "She is reading ___ book.", zh: "她正在讀她的書。", answer: "her", choices: ["she", "her", "hers", "they"], explanation: "空格後面有名詞 book，表示「她的」，所以要用 her。" },
  { id: "ps037", sentence: "We are visiting ___ grandparents.", zh: "我們正在探望我們的祖父母。", answer: "our", choices: ["We", "us", "our", "ours"], explanation: "空格後面有名詞 grandparents，表示「我們的」，所以要用 our。" },
  { id: "ps038", sentence: "The students are raising ___ hands.", zh: "學生們正在舉手。", answer: "their", choices: ["They", "them", "their", "theirs"], explanation: "空格後面有名詞 hands，表示「他們的」，所以要用 their。" },
  { id: "ps039", sentence: "This book is ___.", zh: "這本書是我的。", answer: "mine", choices: ["I", "me", "my", "mine"], explanation: "空格後面沒有名詞，表示「我的東西」，所以要用 mine。" },
  { id: "ps040", sentence: "The blue pen is ___.", zh: "這支藍色筆是你的。", answer: "yours", choices: ["you", "your", "yours", "we"], explanation: "空格後面沒有名詞，表示「你的東西」，所以要用 yours。" },
  { id: "ps041", sentence: "The red bag is ___.", zh: "這個紅色書包是他的。", answer: "his", choices: ["he", "him", "his", "her"], explanation: "空格後面沒有名詞，表示「他的東西」，所以要用 his。" },
  { id: "ps042", sentence: "The pink ruler is ___.", zh: "這把粉紅色間尺是她的。", answer: "hers", choices: ["she", "her", "hers", "him"], explanation: "空格後面沒有名詞，表示「她的東西」，所以要用 hers。" },
  { id: "ps043", sentence: "This classroom is ___.", zh: "這間課室是我們的。", answer: "ours", choices: ["We", "us", "our", "ours"], explanation: "空格後面沒有名詞，表示「我們的東西」，所以要用 ours。" },
  { id: "ps044", sentence: "Those toys are ___.", zh: "那些玩具是他們的。", answer: "theirs", choices: ["They", "them", "their", "theirs"], explanation: "空格後面沒有名詞，表示「他們的東西」，所以要用 theirs。" },
  { id: "ps045", sentence: "This seat is ___.", zh: "這個座位是我的。", answer: "mine", choices: ["I", "me", "my", "mine"], explanation: "空格後面沒有名詞，表示「我的東西」，所以要用 mine。" },
  { id: "ps046", sentence: "The lunch is ___.", zh: "這份午餐是你的。", answer: "yours", choices: ["you", "your", "yours", "we"], explanation: "空格後面沒有名詞，表示「你的東西」，所以要用 yours。" },
  { id: "ps047", sentence: "The football is ___.", zh: "這個足球是我們的。", answer: "ours", choices: ["We", "us", "our", "ours"], explanation: "空格後面沒有名詞，表示「我們的東西」，所以要用 ours。" },
  { id: "ps048", sentence: "The pencils are ___.", zh: "這些鉛筆是他們的。", answer: "theirs", choices: ["They", "them", "their", "theirs"], explanation: "空格後面沒有名詞，表示「他們的東西」，所以要用 theirs。" },
  { id: "ps049", sentence: "The desk is ___.", zh: "這張書桌是他的。", answer: "his", choices: ["he", "him", "his", "her"], explanation: "空格後面沒有名詞，表示「他的東西」，所以要用 his。" },
  { id: "ps050", sentence: "The umbrella is ___.", zh: "這把傘是她的。", answer: "hers", choices: ["she", "her", "hers", "him"], explanation: "空格後面沒有名詞，表示「她的東西」，所以要用 hers。" }
];

const PRONOUN_SENTENCE_SLOT_TYPES = [
  ...Array(13).fill("subject"),
  ...Array(12).fill("object"),
  ...Array(13).fill("possessiveAdjective"),
  ...Array(12).fill("possessivePronoun")
];

PRONOUN_SENTENCE_QUESTIONS.forEach((question, index) => {
  question.slotType = PRONOUN_SENTENCE_SLOT_TYPES[index] || "subject";
});

const PRONOUN_SENTENCE_QUESTION_BANK = PRONOUN_SENTENCE_QUESTIONS.map((question) =>
  ({
    ...makePronounSentenceQuestion(question),
    slotType: question.slotType
  })
);

const PRONOUN_SENTENCE_ROLE_LABELS = {
  subject: "主語",
  object: "非主語",
  possessiveAdjective: "的",
  possessivePronoun: "的東西"
};

const PRONOUN_SENTENCE_FORMS = {
  I: {
    roles: ["subject"],
    meanings: { subject: "我" },
    subject: { be: "am", has: "have", present: "base" }
  },
  me: {
    roles: ["object"],
    meanings: { object: "我" }
  },
  my: {
    roles: ["possessiveAdjective"],
    meanings: { possessiveAdjective: "我的" }
  },
  mine: {
    roles: ["possessivePronoun"],
    meanings: { possessivePronoun: "我的東西" }
  },
  You: {
    roles: ["subject"],
    meanings: { subject: "你" },
    subject: { be: "are", has: "have", present: "base" }
  },
  you: {
    roles: ["object"],
    meanings: { object: "你" }
  },
  your: {
    roles: ["possessiveAdjective"],
    meanings: { possessiveAdjective: "你的" }
  },
  yours: {
    roles: ["possessivePronoun"],
    meanings: { possessivePronoun: "你的東西" }
  },
  We: {
    roles: ["subject"],
    meanings: { subject: "我們" },
    subject: { be: "are", has: "have", present: "base" }
  },
  we: {
    roles: ["subject"],
    meanings: { subject: "我們" },
    subject: { be: "are", has: "have", present: "base" }
  },
  us: {
    roles: ["object"],
    meanings: { object: "我們" }
  },
  our: {
    roles: ["possessiveAdjective"],
    meanings: { possessiveAdjective: "我們的" }
  },
  ours: {
    roles: ["possessivePronoun"],
    meanings: { possessivePronoun: "我們的東西" }
  },
  They: {
    roles: ["subject"],
    meanings: { subject: "他們" },
    subject: { be: "are", has: "have", present: "base" }
  },
  they: {
    roles: ["subject"],
    meanings: { subject: "他們" },
    subject: { be: "are", has: "have", present: "base" }
  },
  them: {
    roles: ["object"],
    meanings: { object: "他們" }
  },
  their: {
    roles: ["possessiveAdjective"],
    meanings: { possessiveAdjective: "他們的" }
  },
  theirs: {
    roles: ["possessivePronoun"],
    meanings: { possessivePronoun: "他們的東西" }
  },
  He: {
    roles: ["subject"],
    meanings: { subject: "他" },
    subject: { be: "is", has: "has", present: "thirdSingular" }
  },
  he: {
    roles: ["subject"],
    meanings: { subject: "他" },
    subject: { be: "is", has: "has", present: "thirdSingular" }
  },
  him: {
    roles: ["object"],
    meanings: { object: "他" }
  },
  His: {
    roles: ["possessiveAdjective", "possessivePronoun"],
    meanings: { possessiveAdjective: "他的", possessivePronoun: "他的東西" }
  },
  his: {
    roles: ["possessiveAdjective", "possessivePronoun"],
    meanings: { possessiveAdjective: "他的", possessivePronoun: "他的東西" }
  },
  She: {
    roles: ["subject"],
    meanings: { subject: "她" },
    subject: { be: "is", has: "has", present: "thirdSingular" }
  },
  she: {
    roles: ["subject"],
    meanings: { subject: "她" },
    subject: { be: "is", has: "has", present: "thirdSingular" }
  },
  her: {
    roles: ["object", "possessiveAdjective"],
    meanings: { object: "她", possessiveAdjective: "她的" }
  },
  hers: {
    roles: ["possessivePronoun"],
    meanings: { possessivePronoun: "她的東西" }
  },
  It: {
    roles: ["subject"],
    meanings: { subject: "它" },
    subject: { be: "is", has: "has", present: "thirdSingular" }
  },
  it: {
    roles: ["object"],
    meanings: { object: "它" }
  },
  its: {
    roles: ["possessiveAdjective", "possessivePronoun"],
    meanings: { possessiveAdjective: "它的", possessivePronoun: "它的東西" }
  }
};

function makeCountableNounQuestion({ id, sentence, zh, isCorrect, answer, explanation }) {
  return {
    id,
    type: "countable",
    sentence,
    zh,
    isCorrect,
    answer,
    english: answer,
    acceptedAnswers: [answer],
    explanation
  };
}

function capitalizeWord(word) {
  if (grammarCore?.capitalizeWord) {
    return grammarCore.capitalizeWord(word);
  }
  const value = String(word || "");
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function createCountableNounQuestions() {
  const questions = [];
  let nextId = 1;
  const add = (question) => {
    questions.push(makeCountableNounQuestion({
      id: `cn${String(nextId).padStart(3, "0")}`,
      ...question
    }));
    nextId += 1;
  };

  const addMany = (items) => items.forEach(add);
  const pluralExplanation = (cue, noun, plural) =>
    `${cue}；${noun} 是可數名詞，這裡不是單數，所以要用眾數 ${plural}。`;
  const singleExplanation = (cue, nounPhrase) =>
    `${cue}；要寫成 ${nounPhrase}。`;
  const definiteExplanation = (subject, quantity, be) =>
    `the 表示指定；${subject} 是${quantity}，所以用 ${be}。`;
  const uncountableExplanation = (noun, useBe = true) =>
    useBe
      ? `${noun} 是不可數名詞，沒有 s，也不用 a/an；作主語時當單一概念，所以用 is。`
      : `${noun} 是不可數名詞，沒有 s，也不用 a/an，所以直接寫 ${noun}。`;
  const definiteUncountableExplanation = (noun) =>
    `the 表示指定；${noun} 是不可數名詞，沒有 s，也不用 a/an，仍然當單一概念用 is。`;

  addMany([
    {
      sentence: "I like apples.",
      zh: "我喜歡蘋果。",
      isCorrect: true,
      answer: "I like apples.",
      explanation: pluralExplanation("中文是一般地說喜歡蘋果，不是說一個蘋果", "apple", "apples")
    },
    {
      sentence: "I like apple.",
      zh: "我喜歡蘋果。",
      isCorrect: false,
      answer: "I like apples.",
      explanation: pluralExplanation("中文是一般地說喜歡蘋果，不是說一個蘋果", "apple", "apples")
    },
    {
      sentence: "She likes dogs.",
      zh: "她喜歡狗。",
      isCorrect: true,
      answer: "She likes dogs.",
      explanation: pluralExplanation("中文是一般地說喜歡狗，不是說一隻狗", "dog", "dogs")
    },
    {
      sentence: "She likes dog.",
      zh: "她喜歡狗。",
      isCorrect: false,
      answer: "She likes dogs.",
      explanation: pluralExplanation("中文是一般地說喜歡狗，不是說一隻狗", "dog", "dogs")
    },
    {
      sentence: "We need more teachers.",
      zh: "我們需要更多老師。",
      isCorrect: true,
      answer: "We need more teachers.",
      explanation: pluralExplanation("more 後面如果是可數名詞，要用眾數", "teacher", "teachers")
    },
    {
      sentence: "We need more teacher.",
      zh: "我們需要更多老師。",
      isCorrect: false,
      answer: "We need more teachers.",
      explanation: pluralExplanation("more 後面如果是可數名詞，要用眾數", "teacher", "teachers")
    },
    {
      sentence: "There are three books on the desk.",
      zh: "桌上有三本書。",
      isCorrect: true,
      answer: "There are three books on the desk.",
      explanation: pluralExplanation("three 表示三本", "book", "books")
    },
    {
      sentence: "There are three book on the desk.",
      zh: "桌上有三本書。",
      isCorrect: false,
      answer: "There are three books on the desk.",
      explanation: pluralExplanation("three 表示三本", "book", "books")
    },
    {
      sentence: "Many students are in the playground.",
      zh: "很多學生在操場。",
      isCorrect: true,
      answer: "Many students are in the playground.",
      explanation: pluralExplanation("many 後面如果是可數名詞，要用眾數", "student", "students")
    },
    {
      sentence: "Many student are in the playground.",
      zh: "很多學生在操場。",
      isCorrect: false,
      answer: "Many students are in the playground.",
      explanation: pluralExplanation("many 後面如果是可數名詞，要用眾數", "student", "students")
    },
    {
      sentence: "Tom has two pencils.",
      zh: "Tom 有兩支鉛筆。",
      isCorrect: true,
      answer: "Tom has two pencils.",
      explanation: pluralExplanation("two 表示兩支", "pencil", "pencils")
    },
    {
      sentence: "Tom has two pencil.",
      zh: "Tom 有兩支鉛筆。",
      isCorrect: false,
      answer: "Tom has two pencils.",
      explanation: pluralExplanation("two 表示兩支", "pencil", "pencils")
    },
    {
      sentence: "They eat bananas after school.",
      zh: "他們放學後吃香蕉。",
      isCorrect: true,
      answer: "They eat bananas after school.",
      explanation: pluralExplanation("中文沒有說只吃一隻香蕉", "banana", "bananas")
    },
    {
      sentence: "They eat banana after school.",
      zh: "他們放學後吃香蕉。",
      isCorrect: false,
      answer: "They eat bananas after school.",
      explanation: pluralExplanation("中文沒有說只吃一隻香蕉", "banana", "bananas")
    },
    {
      sentence: "I can see birds in the tree.",
      zh: "我看見樹上有雀鳥。",
      isCorrect: true,
      answer: "I can see birds in the tree.",
      explanation: pluralExplanation("中文沒有指定只得一隻雀鳥", "bird", "birds")
    },
    {
      sentence: "I can see bird in the tree.",
      zh: "我看見樹上有雀鳥。",
      isCorrect: false,
      answer: "I can see birds in the tree.",
      explanation: pluralExplanation("中文沒有指定只得一隻雀鳥", "bird", "birds")
    },
    {
      sentence: "My sister collects stamps.",
      zh: "我姐姐收集郵票。",
      isCorrect: true,
      answer: "My sister collects stamps.",
      explanation: pluralExplanation("收集郵票通常不是一張", "stamp", "stamps")
    },
    {
      sentence: "My sister collects stamp.",
      zh: "我姐姐收集郵票。",
      isCorrect: false,
      answer: "My sister collects stamps.",
      explanation: pluralExplanation("收集郵票通常不是一張", "stamp", "stamps")
    }
  ]);

  addMany([
    {
      sentence: "I want an apple.",
      zh: "我想要一個蘋果。",
      isCorrect: true,
      answer: "I want an apple.",
      explanation: singleExplanation("中文強調一個蘋果；apple 以母音開頭，所以用 an", "an apple")
    },
    {
      sentence: "I want apple.",
      zh: "我想要一個蘋果。",
      isCorrect: false,
      answer: "I want an apple.",
      explanation: singleExplanation("中文強調一個蘋果；apple 以母音開頭，所以用 an", "an apple")
    },
    {
      sentence: "She has an orange.",
      zh: "她有一個橙。",
      isCorrect: true,
      answer: "She has an orange.",
      explanation: singleExplanation("中文強調一個橙；orange 以母音開頭，所以用 an", "an orange")
    },
    {
      sentence: "She has a orange.",
      zh: "她有一個橙。",
      isCorrect: false,
      answer: "She has an orange.",
      explanation: singleExplanation("中文強調一個橙；orange 以母音開頭，所以用 an", "an orange")
    },
    {
      sentence: "He needs a pencil.",
      zh: "他需要一支鉛筆。",
      isCorrect: true,
      answer: "He needs a pencil.",
      explanation: singleExplanation("中文強調一支鉛筆；pencil 不是母音開頭，所以用 a", "a pencil")
    },
    {
      sentence: "He needs pencil.",
      zh: "他需要一支鉛筆。",
      isCorrect: false,
      answer: "He needs a pencil.",
      explanation: singleExplanation("中文強調一支鉛筆；pencil 不是母音開頭，所以用 a", "a pencil")
    },
    {
      sentence: "I bought a book.",
      zh: "我買了一本書。",
      isCorrect: true,
      answer: "I bought a book.",
      explanation: singleExplanation("中文強調一本書；book 不是母音開頭，所以用 a", "a book")
    },
    {
      sentence: "I bought book.",
      zh: "我買了一本書。",
      isCorrect: false,
      answer: "I bought a book.",
      explanation: singleExplanation("中文強調一本書；book 不是母音開頭，所以用 a", "a book")
    },
    {
      sentence: "Mum made a card.",
      zh: "媽媽做了一張卡。",
      isCorrect: true,
      answer: "Mum made a card.",
      explanation: singleExplanation("中文強調一張卡；card 不是母音開頭，所以用 a", "a card")
    },
    {
      sentence: "Mum made card.",
      zh: "媽媽做了一張卡。",
      isCorrect: false,
      answer: "Mum made a card.",
      explanation: singleExplanation("中文強調一張卡；card 不是母音開頭，所以用 a", "a card")
    },
    {
      sentence: "Tom saw an elephant.",
      zh: "Tom 看見一隻大象。",
      isCorrect: true,
      answer: "Tom saw an elephant.",
      explanation: singleExplanation("中文強調一隻大象；elephant 以母音開頭，所以用 an", "an elephant")
    },
    {
      sentence: "Tom saw a elephant.",
      zh: "Tom 看見一隻大象。",
      isCorrect: false,
      answer: "Tom saw an elephant.",
      explanation: singleExplanation("中文強調一隻大象；elephant 以母音開頭，所以用 an", "an elephant")
    },
    {
      sentence: "We need an umbrella.",
      zh: "我們需要一把傘。",
      isCorrect: true,
      answer: "We need an umbrella.",
      explanation: singleExplanation("中文強調一把傘；umbrella 以母音開頭，所以用 an", "an umbrella")
    },
    {
      sentence: "We need a umbrella.",
      zh: "我們需要一把傘。",
      isCorrect: false,
      answer: "We need an umbrella.",
      explanation: singleExplanation("中文強調一把傘；umbrella 以母音開頭，所以用 an", "an umbrella")
    },
    {
      sentence: "She wants a banana.",
      zh: "她想要一隻香蕉。",
      isCorrect: true,
      answer: "She wants a banana.",
      explanation: singleExplanation("中文強調一隻香蕉；banana 不是母音開頭，所以用 a", "a banana")
    },
    {
      sentence: "She wants banana.",
      zh: "她想要一隻香蕉。",
      isCorrect: false,
      answer: "She wants a banana.",
      explanation: singleExplanation("中文強調一隻香蕉；banana 不是母音開頭，所以用 a", "a banana")
    },
    {
      sentence: "Dad has a car.",
      zh: "爸爸有一架車。",
      isCorrect: true,
      answer: "Dad has a car.",
      explanation: singleExplanation("中文強調一架車；car 不是母音開頭，所以用 a", "a car")
    },
    {
      sentence: "Dad has car.",
      zh: "爸爸有一架車。",
      isCorrect: false,
      answer: "Dad has a car.",
      explanation: singleExplanation("中文強調一架車；car 不是母音開頭，所以用 a", "a car")
    },
    {
      sentence: "I need a ruler.",
      zh: "我需要一把間尺。",
      isCorrect: true,
      answer: "I need a ruler.",
      explanation: singleExplanation("中文強調一把間尺；ruler 不是母音開頭，所以用 a", "a ruler")
    },
    {
      sentence: "I need ruler.",
      zh: "我需要一把間尺。",
      isCorrect: false,
      answer: "I need a ruler.",
      explanation: singleExplanation("中文強調一把間尺；ruler 不是母音開頭，所以用 a", "a ruler")
    }
  ]);

  addMany([
    {
      sentence: "The dog is sleeping.",
      zh: "這隻狗在睡覺。",
      isCorrect: true,
      answer: "The dog is sleeping.",
      explanation: definiteExplanation("The dog", "指定一隻狗", "is")
    },
    {
      sentence: "The dogs is barking.",
      zh: "那些狗在吠。",
      isCorrect: false,
      answer: "The dogs are barking.",
      explanation: definiteExplanation("The dogs", "指定多隻狗", "are")
    },
    {
      sentence: "The apple is in my bag.",
      zh: "這個蘋果在我的書包裏。",
      isCorrect: true,
      answer: "The apple is in my bag.",
      explanation: definiteExplanation("The apple", "指定一個蘋果", "is")
    },
    {
      sentence: "The apples is in the basket.",
      zh: "那些蘋果在籃子裏。",
      isCorrect: false,
      answer: "The apples are in the basket.",
      explanation: definiteExplanation("The apples", "指定多個蘋果", "are")
    },
    {
      sentence: "The student is in the classroom.",
      zh: "這個學生在課室裏。",
      isCorrect: true,
      answer: "The student is in the classroom.",
      explanation: definiteExplanation("The student", "指定一個學生", "is")
    },
    {
      sentence: "The students is in the hall.",
      zh: "那些學生在禮堂裏。",
      isCorrect: false,
      answer: "The students are in the hall.",
      explanation: definiteExplanation("The students", "指定多個學生", "are")
    },
    {
      sentence: "The book is on the table.",
      zh: "這本書在桌上。",
      isCorrect: true,
      answer: "The book is on the table.",
      explanation: definiteExplanation("The book", "指定一本書", "is")
    },
    {
      sentence: "The books is under the desk.",
      zh: "那些書在書桌下。",
      isCorrect: false,
      answer: "The books are under the desk.",
      explanation: definiteExplanation("The books", "指定多本書", "are")
    },
    {
      sentence: "The cat is under the chair.",
      zh: "這隻貓在椅子下。",
      isCorrect: true,
      answer: "The cat is under the chair.",
      explanation: definiteExplanation("The cat", "指定一隻貓", "is")
    },
    {
      sentence: "The cats is under the table.",
      zh: "那些貓在桌下。",
      isCorrect: false,
      answer: "The cats are under the table.",
      explanation: definiteExplanation("The cats", "指定多隻貓", "are")
    },
    {
      sentence: "The pencil is in the box.",
      zh: "這支鉛筆在盒子裏。",
      isCorrect: true,
      answer: "The pencil is in the box.",
      explanation: definiteExplanation("The pencil", "指定一支鉛筆", "is")
    },
    {
      sentence: "The pencils is in the box.",
      zh: "那些鉛筆在盒子裏。",
      isCorrect: false,
      answer: "The pencils are in the box.",
      explanation: definiteExplanation("The pencils", "指定多支鉛筆", "are")
    },
    {
      sentence: "The flowers are for Mum.",
      zh: "那些花是給媽媽的。",
      isCorrect: true,
      answer: "The flowers are for Mum.",
      explanation: definiteExplanation("The flowers", "指定多朵花", "are")
    },
    {
      sentence: "The flower are for Mum.",
      zh: "這朵花是給媽媽的。",
      isCorrect: false,
      answer: "The flower is for Mum.",
      explanation: definiteExplanation("The flower", "指定一朵花", "is")
    },
    {
      sentence: "The car is outside.",
      zh: "這架車在外面。",
      isCorrect: true,
      answer: "The car is outside.",
      explanation: definiteExplanation("The car", "指定一架車", "is")
    },
    {
      sentence: "The cars is outside.",
      zh: "那些車在外面。",
      isCorrect: false,
      answer: "The cars are outside.",
      explanation: definiteExplanation("The cars", "指定多架車", "are")
    },
    {
      sentence: "The chair is broken.",
      zh: "這張椅子壞了。",
      isCorrect: true,
      answer: "The chair is broken.",
      explanation: definiteExplanation("The chair", "指定一張椅子", "is")
    },
    {
      sentence: "The chairs is next to the door.",
      zh: "那些椅子在門旁邊。",
      isCorrect: false,
      answer: "The chairs are next to the door.",
      explanation: definiteExplanation("The chairs", "指定多張椅子", "are")
    },
    {
      sentence: "The egg is on the plate.",
      zh: "這隻雞蛋在碟上。",
      isCorrect: true,
      answer: "The egg is on the plate.",
      explanation: definiteExplanation("The egg", "指定一隻雞蛋", "is")
    },
    {
      sentence: "The eggs is on the plate.",
      zh: "那些雞蛋在碟上。",
      isCorrect: false,
      answer: "The eggs are on the plate.",
      explanation: definiteExplanation("The eggs", "指定多隻雞蛋", "are")
    }
  ]);

  addMany([
    {
      sentence: "Water is important.",
      zh: "水很重要。",
      isCorrect: true,
      answer: "Water is important.",
      explanation: uncountableExplanation("water")
    },
    {
      sentence: "Waters are important.",
      zh: "水很重要。",
      isCorrect: false,
      answer: "Water is important.",
      explanation: uncountableExplanation("water")
    },
    {
      sentence: "I drink water every day.",
      zh: "我每天喝水。",
      isCorrect: true,
      answer: "I drink water every day.",
      explanation: uncountableExplanation("water", false)
    },
    {
      sentence: "I drink waters every day.",
      zh: "我每天喝水。",
      isCorrect: false,
      answer: "I drink water every day.",
      explanation: uncountableExplanation("water", false)
    },
    {
      sentence: "Homework is difficult.",
      zh: "功課很難。",
      isCorrect: true,
      answer: "Homework is difficult.",
      explanation: uncountableExplanation("homework")
    },
    {
      sentence: "I have a homework today.",
      zh: "我今天有功課。",
      isCorrect: false,
      answer: "I have homework today.",
      explanation: uncountableExplanation("homework", false)
    },
    {
      sentence: "Information is useful.",
      zh: "資訊很有用。",
      isCorrect: true,
      answer: "Information is useful.",
      explanation: uncountableExplanation("information")
    },
    {
      sentence: "We need an information.",
      zh: "我們需要資訊。",
      isCorrect: false,
      answer: "We need information.",
      explanation: uncountableExplanation("information", false)
    },
    {
      sentence: "Knowledge is important.",
      zh: "知識很重要。",
      isCorrect: true,
      answer: "Knowledge is important.",
      explanation: uncountableExplanation("knowledge")
    },
    {
      sentence: "I want more knowledges.",
      zh: "我想要更多知識。",
      isCorrect: false,
      answer: "I want more knowledge.",
      explanation: uncountableExplanation("knowledge", false)
    },
    {
      sentence: "The equipment is expensive.",
      zh: "這批器材很貴。",
      isCorrect: true,
      answer: "The equipment is expensive.",
      explanation: definiteUncountableExplanation("equipment")
    },
    {
      sentence: "The equipments are in the room.",
      zh: "這批器材在房間裏。",
      isCorrect: false,
      answer: "The equipment is in the room.",
      explanation: definiteUncountableExplanation("equipment")
    },
    {
      sentence: "Music is playing.",
      zh: "音樂正在播放。",
      isCorrect: true,
      answer: "Music is playing.",
      explanation: uncountableExplanation("music")
    },
    {
      sentence: "I like a music.",
      zh: "我喜歡音樂。",
      isCorrect: false,
      answer: "I like music.",
      explanation: uncountableExplanation("music", false)
    },
    {
      sentence: "I eat rice for lunch.",
      zh: "我午餐吃飯。",
      isCorrect: true,
      answer: "I eat rice for lunch.",
      explanation: uncountableExplanation("rice", false)
    },
    {
      sentence: "I eat rices for lunch.",
      zh: "我午餐吃飯。",
      isCorrect: false,
      answer: "I eat rice for lunch.",
      explanation: uncountableExplanation("rice", false)
    },
    {
      sentence: "The milk is in the fridge.",
      zh: "牛奶在雪櫃裏。",
      isCorrect: true,
      answer: "The milk is in the fridge.",
      explanation: definiteUncountableExplanation("milk")
    },
    {
      sentence: "The breads are on the table.",
      zh: "麵包在桌上。",
      isCorrect: false,
      answer: "The bread is on the table.",
      explanation: definiteUncountableExplanation("bread")
    },
    {
      sentence: "The money is in my bag.",
      zh: "錢在我的書包裏。",
      isCorrect: true,
      answer: "The money is in my bag.",
      explanation: definiteUncountableExplanation("money")
    },
    {
      sentence: "A furniture is in the room.",
      zh: "房間裏有家具。",
      isCorrect: false,
      answer: "Furniture is in the room.",
      explanation: uncountableExplanation("furniture")
    }
  ]);

  addMany([
    {
      sentence: "I like mangoes.",
      zh: "我喜歡芒果。",
      isCorrect: true,
      answer: "I like mangoes.",
      explanation: pluralExplanation("中文是一般地說喜歡芒果，不是說一個芒果", "mango", "mangoes")
    },
    {
      sentence: "I like mango.",
      zh: "我喜歡芒果。",
      isCorrect: false,
      answer: "I like mangoes.",
      explanation: pluralExplanation("中文是一般地說喜歡芒果，不是說一個芒果", "mango", "mangoes")
    },
    {
      sentence: "She needs a notebook.",
      zh: "她需要一本筆記簿。",
      isCorrect: true,
      answer: "She needs a notebook.",
      explanation: singleExplanation("中文強調一本筆記簿；notebook 不是母音開頭，所以用 a", "a notebook")
    },
    {
      sentence: "She needs notebook.",
      zh: "她需要一本筆記簿。",
      isCorrect: false,
      answer: "She needs a notebook.",
      explanation: singleExplanation("中文強調一本筆記簿；notebook 不是母音開頭，所以用 a", "a notebook")
    },
    {
      sentence: "He has an eraser.",
      zh: "他有一塊擦膠。",
      isCorrect: true,
      answer: "He has an eraser.",
      explanation: singleExplanation("中文強調一塊擦膠；eraser 以母音開頭，所以用 an", "an eraser")
    },
    {
      sentence: "He has a eraser.",
      zh: "他有一塊擦膠。",
      isCorrect: false,
      answer: "He has an eraser.",
      explanation: singleExplanation("中文強調一塊擦膠；eraser 以母音開頭，所以用 an", "an eraser")
    },
    {
      sentence: "The toys are in the box.",
      zh: "那些玩具在盒子裏。",
      isCorrect: true,
      answer: "The toys are in the box.",
      explanation: definiteExplanation("The toys", "指定多件玩具", "are")
    },
    {
      sentence: "The toy are in the box.",
      zh: "這件玩具在盒子裏。",
      isCorrect: false,
      answer: "The toy is in the box.",
      explanation: definiteExplanation("The toy", "指定一件玩具", "is")
    },
    {
      sentence: "The juice is cold.",
      zh: "這杯果汁很凍。",
      isCorrect: true,
      answer: "The juice is cold.",
      explanation: definiteUncountableExplanation("juice")
    },
    {
      sentence: "The juices are cold.",
      zh: "這杯果汁很凍。",
      isCorrect: false,
      answer: "The juice is cold.",
      explanation: definiteUncountableExplanation("juice")
    },
    {
      sentence: "My brother wants a sandwich.",
      zh: "我哥哥想要一份三文治。",
      isCorrect: true,
      answer: "My brother wants a sandwich.",
      explanation: singleExplanation("中文強調一份三文治；sandwich 不是母音開頭，所以用 a", "a sandwich")
    },
    {
      sentence: "My brother wants sandwich.",
      zh: "我哥哥想要一份三文治。",
      isCorrect: false,
      answer: "My brother wants a sandwich.",
      explanation: singleExplanation("中文強調一份三文治；sandwich 不是母音開頭，所以用 a", "a sandwich")
    },
    {
      sentence: "We need more plates.",
      zh: "我們需要更多碟。",
      isCorrect: true,
      answer: "We need more plates.",
      explanation: pluralExplanation("more 後面如果是可數名詞，要用眾數", "plate", "plates")
    },
    {
      sentence: "We need more plate.",
      zh: "我們需要更多碟。",
      isCorrect: false,
      answer: "We need more plates.",
      explanation: pluralExplanation("more 後面如果是可數名詞，要用眾數", "plate", "plates")
    },
    {
      sentence: "The plate is dirty.",
      zh: "這隻碟很污糟。",
      isCorrect: true,
      answer: "The plate is dirty.",
      explanation: definiteExplanation("The plate", "指定一隻碟", "is")
    },
    {
      sentence: "The plates is dirty.",
      zh: "那些碟很污糟。",
      isCorrect: false,
      answer: "The plates are dirty.",
      explanation: definiteExplanation("The plates", "指定多隻碟", "are")
    },
    {
      sentence: "I drink milk in the morning.",
      zh: "我早上喝牛奶。",
      isCorrect: true,
      answer: "I drink milk in the morning.",
      explanation: uncountableExplanation("milk", false)
    },
    {
      sentence: "I drink a milk in the morning.",
      zh: "我早上喝牛奶。",
      isCorrect: false,
      answer: "I drink milk in the morning.",
      explanation: uncountableExplanation("milk", false)
    },
    {
      sentence: "She buys carrots.",
      zh: "她買紅蘿蔔。",
      isCorrect: true,
      answer: "She buys carrots.",
      explanation: pluralExplanation("中文沒有說只買一條紅蘿蔔", "carrot", "carrots")
    },
    {
      sentence: "She buys carrot.",
      zh: "她買紅蘿蔔。",
      isCorrect: false,
      answer: "She buys carrots.",
      explanation: pluralExplanation("中文沒有說只買一條紅蘿蔔", "carrot", "carrots")
    },
    {
      sentence: "We need cups for the party.",
      zh: "派對要用杯。",
      isCorrect: true,
      answer: "We need cups for the party.",
      explanation: pluralExplanation("派對通常需要不止一隻杯", "cup", "cups")
    },
    {
      sentence: "We need cup for the party.",
      zh: "派對要用杯。",
      isCorrect: false,
      answer: "We need cups for the party.",
      explanation: pluralExplanation("派對通常需要不止一隻杯", "cup", "cups")
    }
  ]);

  return questions;
}

const COUNTABLE_NOUN_QUESTIONS = createCountableNounQuestions();

function makeNounCategoryQuestion({
  id,
  category,
  sentence,
  zh,
  isCorrect,
  answer,
  acceptedAnswers,
  explanation,
  caseSensitive = false
}) {
  const correctAnswer = String(answer || sentence || "").trim();
  return {
    id,
    type: "noun-category",
    category,
    sentence,
    zh,
    isCorrect,
    answer: correctAnswer,
    english: correctAnswer,
    acceptedAnswers: Array.from(new Set([correctAnswer, ...(acceptedAnswers || [])].filter(Boolean))),
    explanation,
    caseSensitive
  };
}

function createNounCategoryQuestions() {
  const questions = [];
  let nextId = 1;
  const add = (question) => {
    questions.push(makeNounCategoryQuestion({
      id: `nc${String(nextId).padStart(3, "0")}`,
      ...question
    }));
    nextId += 1;
  };
  const addPair = ({ correct, wrong, zh, answer = correct, explanation, category, acceptedAnswers, caseSensitive = false }) => {
    add({
      category,
      sentence: correct,
      zh,
      isCorrect: true,
      answer: correct,
      explanation,
      acceptedAnswers,
      caseSensitive
    });
    add({
      category,
      sentence: wrong,
      zh,
      isCorrect: false,
      answer,
      explanation,
      acceptedAnswers,
      caseSensitive
    });
  };

  const countableArticleRule =
    "可數名詞單數前面要有 a / an / the / 代名詞的；不是單數或指定，就通常用眾數 s。";
  const uncountableRule =
    "不可數名詞不可以加 s，也不用 a / an；可以直接用，或加 the / my / your 等。";
  const gerundRule =
    "動詞做主語或當一件事來講時，要加 ING，因為主語必須是名詞。";
  const properNounRule =
    "專有名詞是人名、地名或公司名，第一個字母必須大楷。";

  [
    {
      correct: "I like cats.",
      wrong: "I like cat.",
      zh: "我喜歡貓。",
      explanation: `${countableArticleRule} 這裡是一般地說喜歡貓，所以用 cats。`
    },
    {
      correct: "She has a pencil.",
      wrong: "She has pencil.",
      zh: "她有一支鉛筆。",
      explanation: `${countableArticleRule} 中文指一支 pencil，所以要用 a pencil。`
    },
    {
      correct: "I see an apple.",
      wrong: "I see a apple.",
      zh: "我看見一個蘋果。",
      explanation: `${countableArticleRule} apple 以母音開頭，所以一個蘋果要寫 an apple。`
    },
    {
      correct: "The world is big.",
      wrong: "World is big.",
      zh: "世界很大。",
      explanation: `${countableArticleRule} world 基本上會加 the，寫 The world。`
    },
    {
      correct: "The government helps people.",
      wrong: "Government helps people.",
      zh: "政府幫助人民。",
      explanation: `${countableArticleRule} government 通常指一個已知的政府，所以寫 The government。`
    },
    {
      correct: "My dog is cute.",
      wrong: "Dog is cute.",
      zh: "我的狗很可愛。",
      explanation: `${countableArticleRule} 中文指我的狗，所以要用代名詞的 my。`
    },
    {
      correct: "I read books.",
      wrong: "I read book.",
      zh: "我看書。",
      explanation: `${countableArticleRule} 這裡不是指一本書，所以可數名詞 book 要用眾數 books。`
    },
    {
      correct: "The UK is far from Hong Kong.",
      wrong: "UK is far from Hong Kong.",
      zh: "英國離香港很遠。",
      explanation: `${countableArticleRule} the UK 是固定寫法，要有 the。`
    },
    {
      correct: "The US is a big country.",
      wrong: "US is big country.",
      zh: "美國是一個大國。",
      explanation: `${countableArticleRule} the US 要有 the；country 是單數可數名詞，所以要寫 a big country。`
    },
    {
      correct: "The environment is important.",
      wrong: "Environment is important.",
      zh: "環境很重要。",
      explanation: `${countableArticleRule} environment 通常指整體環境，所以寫 The environment。`
    }
  ].forEach((item) => addPair({ ...item, category: "countable" }));

  [
    {
      correct: "Information is useful.",
      wrong: "Informations are useful.",
      zh: "資料很有用。",
      explanation: `${uncountableRule} information 是不可數名詞，所以沒有 s，用 is。`
    },
    {
      correct: "Furniture is heavy.",
      wrong: "Furnitures are heavy.",
      zh: "傢俱很重。",
      explanation: `${uncountableRule} furniture 是不可數名詞，所以沒有 s，用 is。`
    },
    {
      correct: "Equipment is expensive.",
      wrong: "Equipments are expensive.",
      zh: "裝備很貴。",
      explanation: `${uncountableRule} equipment 是不可數名詞，所以沒有 s，用 is。`
    },
    {
      correct: "Advice is helpful.",
      wrong: "Advices are helpful.",
      zh: "建議很有幫助。",
      explanation: `${uncountableRule} advice 是不可數名詞，所以沒有 s，用 is。`
    },
    {
      correct: "I need water.",
      wrong: "I need waters.",
      zh: "我需要水。",
      explanation: `${uncountableRule} water 是不可數名詞，所以直接寫 water。`
    },
    {
      correct: "The milk is cold.",
      wrong: "The milks are cold.",
      zh: "那杯牛奶很凍。",
      explanation: `${uncountableRule} milk 是不可數名詞；可以加 the，但不可以加 s。`
    },
    {
      correct: "Her homework is neat.",
      wrong: "Her homeworks are neat.",
      zh: "她的功課很整齊。",
      explanation: `${uncountableRule} homework 是不可數名詞；可以加 her，但不可以加 s。`
    },
    {
      correct: "The equipment is in the room.",
      wrong: "The equipments are in the room.",
      zh: "這批裝備在房間裏。",
      explanation: `${uncountableRule} equipment 是不可數名詞；指定時可用 the equipment，但仍然沒有 s。`
    }
  ].forEach((item) => addPair({ ...item, category: "uncountable" }));

  [
    {
      correct: "Swimming is important.",
      wrong: "Swim is important.",
      zh: "游泳十分重要。",
      explanation: `${gerundRule} 游泳做主語，要寫 Swimming。`
    },
    {
      correct: "Reading is fun.",
      wrong: "Read is fun.",
      zh: "閱讀很有趣。",
      explanation: `${gerundRule} 閱讀做主語，要寫 Reading。`
    },
    {
      correct: "I hate eating fruits.",
      wrong: "I hate eat fruit.",
      zh: "我討厭食水果。",
      explanation: `${gerundRule} hate 後面講「食水果」這件事，所以用 eating。`,
      acceptedAnswers: ["I hate eating fruit."]
    },
    {
      correct: "I can see a girl holding a pen.",
      wrong: "I can see a girl holds a pen.",
      zh: "我可以看到一個女孩拿著一枝筆。",
      explanation: `${gerundRule} 句子已有 see；後面描述女孩拿著筆，要把 hold 變成 holding。`
    },
    {
      correct: "I enjoy playing football.",
      wrong: "I enjoy play football.",
      zh: "我享受踢足球。",
      explanation: `${gerundRule} enjoy 後面講「踢足球」這件事，所以用 playing。`
    },
    {
      correct: "Walking to school is healthy.",
      wrong: "Walk to school is healthy.",
      zh: "行路返學很健康。",
      explanation: `${gerundRule} 行路返學做主語，要寫 Walking to school。`
    },
    {
      correct: "Singing songs makes me happy.",
      wrong: "Sing songs makes me happy.",
      zh: "唱歌令我開心。",
      explanation: `${gerundRule} 唱歌這件事做主語，要寫 Singing songs。`
    }
  ].forEach((item) => addPair({ ...item, category: "gerund" }));

  [
    {
      correct: "Tom is my friend.",
      wrong: "tom is my friend.",
      zh: "Tom 是我的朋友。",
      explanation: `${properNounRule} Tom 是人名，要大楷 T。`
    },
    {
      correct: "Mary is my classmate.",
      wrong: "mary is my classmate.",
      zh: "Mary 是我的同學。",
      explanation: `${properNounRule} Mary 是人名，要大楷 M。`
    },
    {
      correct: "China is a big country.",
      wrong: "china is a big country.",
      zh: "中國是一個大國。",
      explanation: `${properNounRule} China 是地名，要大楷 C。`
    },
    {
      correct: "Anna likes English.",
      wrong: "anna likes English.",
      zh: "Anna 喜歡英文。",
      explanation: `${properNounRule} Anna 是人名，要大楷 A。`
    },
    {
      correct: "Disney is a big company.",
      wrong: "disney is a big company.",
      zh: "Disney 是一間大公司。",
      explanation: `${properNounRule} Disney 是公司名，要大楷 D。`
    }
  ].forEach((item) => addPair({ ...item, category: "proper-noun", caseSensitive: true }));

  return questions;
}

const NOUN_CATEGORY_QUESTIONS = createNounCategoryQuestions();

function makeModalVerbQuestion({
  id,
  category,
  sentence,
  zh,
  isCorrect,
  answer,
  acceptedAnswers,
  explanation
}) {
  const correctAnswer = String(answer || sentence || "").trim();
  return {
    id,
    type: "modal-verb",
    category,
    sentence,
    zh,
    isCorrect,
    answer: correctAnswer,
    english: correctAnswer,
    acceptedAnswers: Array.from(new Set([correctAnswer, ...(acceptedAnswers || [])].filter(Boolean))),
    explanation
  };
}

function createModalVerbQuestions() {
  const questions = [];
  let nextId = 1;
  const add = (question) => {
    questions.push(makeModalVerbQuestion({
      id: `mv${String(nextId).padStart(3, "0")}`,
      ...question
    }));
    nextId += 1;
  };
  const addPair = ({ correct, wrong, zh, answer = correct, explanation, category, acceptedAnswers }) => {
    add({
      category,
      sentence: correct,
      zh,
      isCorrect: true,
      answer: correct,
      explanation,
      acceptedAnswers
    });
    add({
      category,
      sentence: wrong,
      zh,
      isCorrect: false,
      answer,
      explanation,
      acceptedAnswers
    });
  };

  const baseVerbRule =
    "Modal verb（情態動詞）後面只可以接原型動詞，不可以加 s、ed、ing。";
  const beRule =
    "Modal verb 後面可以接 be；如果後面是形容詞、名詞或地點，就用 modal verb + be。";
  const positionRule =
    "Modal verb 必須放在主語正後面；兩個 modal verb 不可以直接連住用。";

  [
    {
      correct: "I can swim.",
      wrong: "I can swims.",
      zh: "我可以游泳。",
      explanation: `${baseVerbRule} can 後面要用 swim。`
    },
    {
      correct: "He can play football.",
      wrong: "He can plays football.",
      zh: "他可以踢足球。",
      explanation: `${baseVerbRule} can 後面要用 play。`
    },
    {
      correct: "She will go home.",
      wrong: "She will goes home.",
      zh: "她會回家。",
      explanation: `${baseVerbRule} will 後面要用 go。`
    },
    {
      correct: "They will come later.",
      wrong: "They will comes later.",
      zh: "他們會遲些來。",
      explanation: `${baseVerbRule} will 後面要用 come。`
    },
    {
      correct: "You should do your homework.",
      wrong: "You should does your homework.",
      zh: "你應該做功課。",
      explanation: `${baseVerbRule} should 後面要用 do。`
    },
    {
      correct: "We should listen to the teacher.",
      wrong: "We should listening to the teacher.",
      zh: "我們應該聽老師講。",
      explanation: `${baseVerbRule} should 後面要用 listen。`
    },
    {
      correct: "I may visit Grandma.",
      wrong: "I may visited Grandma.",
      zh: "我可能探望嫲嫲。",
      explanation: `${baseVerbRule} may 後面要用 visit。`
    },
    {
      correct: "Tom may join us.",
      wrong: "Tom may joins us.",
      zh: "Tom 可能加入我們。",
      explanation: `${baseVerbRule} may 後面要用 join。`
    },
    {
      correct: "Students must wear uniforms.",
      wrong: "Students must wears uniforms.",
      zh: "學生必須穿校服。",
      explanation: `${baseVerbRule} must 後面要用 wear。`
    },
    {
      correct: "We must finish the work.",
      wrong: "We must finished the work.",
      zh: "我們必須完成工作。",
      explanation: `${baseVerbRule} must 後面要用 finish。`
    },
    {
      correct: "She can draw well.",
      wrong: "She can drawing well.",
      zh: "她可以畫得很好。",
      explanation: `${baseVerbRule} can 後面要用 draw。`
    },
    {
      correct: "Dad will cook dinner.",
      wrong: "Dad will cooks dinner.",
      zh: "爸爸會煮晚餐。",
      explanation: `${baseVerbRule} will 後面要用 cook。`
    }
  ].forEach((item) => addPair({ ...item, category: "base-verb" }));

  [
    {
      correct: "I may be late.",
      wrong: "I may late.",
      zh: "我可能會遲到。",
      explanation: `${beRule} late 是形容詞，所以要寫 may be late。`
    },
    {
      correct: "He will be happy.",
      wrong: "He will happy.",
      zh: "他會開心。",
      explanation: `${beRule} happy 是形容詞，所以要寫 will be happy。`
    },
    {
      correct: "You should be careful.",
      wrong: "You should careful.",
      zh: "你應該小心。",
      explanation: `${beRule} careful 是形容詞，所以要寫 should be careful。`
    },
    {
      correct: "We must be quiet.",
      wrong: "We must quiet.",
      zh: "我們必須安靜。",
      explanation: `${beRule} quiet 是形容詞，所以要寫 must be quiet。`
    },
    {
      correct: "The answer may be right.",
      wrong: "The answer may right.",
      zh: "答案可能正確。",
      explanation: `${beRule} right 是形容詞，所以要寫 may be right。`
    },
    {
      correct: "She can be a monitor.",
      wrong: "She can a monitor.",
      zh: "她可以做班長。",
      explanation: `${beRule} a monitor 是身份名詞，所以要寫 can be a monitor。`
    },
    {
      correct: "Tom should be at school.",
      wrong: "Tom should at school.",
      zh: "Tom 應該在學校。",
      explanation: `${beRule} at school 是地點，所以要寫 should be at school。`
    },
    {
      correct: "The door must be open.",
      wrong: "The door must opened.",
      zh: "門必須是打開的。",
      explanation: `${beRule} open 這裡是形容詞，表示狀態，所以要寫 must be open。`
    }
  ].forEach((item) => addPair({ ...item, category: "be" }));

  [
    {
      correct: "He may be able to pass the exam.",
      wrong: "He may can pass the exam.",
      zh: "他可能可以考試合格。",
      explanation: `${positionRule} may 和 can 都是 modal verb，不可以 may can；要把 can 改成 be able to。`
    },
    {
      correct: "I will be able to help you.",
      wrong: "I will can help you.",
      zh: "我將會可以幫你。",
      explanation: `${positionRule} will 和 can 不可以直接連住用；要寫 will be able to。`
    },
    {
      correct: "She can play the piano.",
      wrong: "She plays can the piano.",
      zh: "她可以彈鋼琴。",
      explanation: `${positionRule} can 要放在主語 She 正後面，後面用原型動詞 play。`
    },
    {
      correct: "They will go to the park.",
      wrong: "They go will to the park.",
      zh: "他們會去公園。",
      explanation: `${positionRule} will 要放在主語 They 正後面，後面用原型動詞 go。`
    },
    {
      correct: "You should ask the teacher.",
      wrong: "You ask should the teacher.",
      zh: "你應該問老師。",
      explanation: `${positionRule} should 要放在主語 You 正後面，後面用原型動詞 ask。`
    },
    {
      correct: "We must line up.",
      wrong: "We line must up.",
      zh: "我們必須排隊。",
      explanation: `${positionRule} must 要放在主語 We 正後面，後面用原型動詞 line。`
    },
    {
      correct: "Mary may be at home.",
      wrong: "Mary is may at home.",
      zh: "Mary 可能在家。",
      explanation: `${positionRule} may 要放在主語 Mary 正後面；at home 是地點，所以寫 may be at home。`
    },
    {
      correct: "The dog can run fast.",
      wrong: "The dog runs can fast.",
      zh: "那隻狗可以跑得快。",
      explanation: `${positionRule} can 要放在主語 The dog 正後面，後面用原型動詞 run。`
    },
    {
      correct: "My brother should be kind.",
      wrong: "My brother is should kind.",
      zh: "我哥哥應該友善。",
      explanation: `${positionRule} should 要放在主語 My brother 正後面；kind 是形容詞，所以寫 should be kind。`
    },
    {
      correct: "We may be able to join the game.",
      wrong: "We may can join the game.",
      zh: "我們可能可以參加遊戲。",
      explanation: `${positionRule} may 和 can 不可以直接連住用；要寫 may be able to。`
    }
  ].forEach((item) => addPair({ ...item, category: "position" }));

  return questions;
}

const MODAL_VERB_QUESTIONS = createModalVerbQuestions();

function makeAdjectiveQuestion({
  id,
  category,
  sentence,
  zh,
  isCorrect,
  answer,
  acceptedAnswers,
  explanation
}) {
  const correctAnswer = String(answer || sentence || "").trim();
  return {
    id,
    type: "adjective-lesson",
    category,
    sentence,
    zh,
    isCorrect,
    answer: correctAnswer,
    english: correctAnswer,
    acceptedAnswers: Array.from(new Set([correctAnswer, ...(acceptedAnswers || [])].filter(Boolean))),
    explanation
  };
}

function createAdjectiveQuestions() {
  const questions = [];
  let nextId = 1;
  const add = (question) => {
    questions.push(makeAdjectiveQuestion({
      id: `adj${String(nextId).padStart(3, "0")}`,
      ...question
    }));
    nextId += 1;
  };
  const addPair = ({ correct, wrong, zh, answer = correct, explanation, category, acceptedAnswers }) => {
    add({
      category,
      sentence: correct,
      zh,
      isCorrect: true,
      answer: correct,
      explanation,
      acceptedAnswers
    });
    add({
      category,
      sentence: wrong,
      zh,
      isCorrect: false,
      answer,
      explanation,
      acceptedAnswers
    });
  };

  const simpleRule =
    "形容詞只是形容狀態，不是動詞；如果句子沒有其他動詞，就要加 be verb（is / am / are）做動詞。";
  const hyphenRule =
    "兩個字合起來放在名詞前做形容詞時，通常要用 hyphen（-）連起來。";
  const compoundRule =
    "形容詞可以配 preposition / to，例如 interested in、excited about、willing to；整組仍然是形容詞，不是動詞，所以前面要有 be verb。";

  [
    {
      correct: "He is happy.",
      wrong: "He happy.",
      zh: "他很開心。",
      explanation: `${simpleRule} happy 是形容詞，所以要寫 He is happy.`
    },
    {
      correct: "This tool is useful.",
      wrong: "This tool useful.",
      zh: "這件工具很有用。",
      explanation: `${simpleRule} useful 是形容詞，所以要寫 This tool is useful.`
    },
    {
      correct: "I am careful.",
      wrong: "I careful.",
      zh: "我很小心。",
      explanation: `${simpleRule} careful 是形容詞，所以要寫 I am careful.`
    },
    {
      correct: "You are ready.",
      wrong: "You ready.",
      zh: "你準備好了。",
      explanation: `${simpleRule} ready 是形容詞，所以要寫 You are ready.`
    },
    {
      correct: "The room is clean.",
      wrong: "The room clean.",
      zh: "房間很乾淨。",
      explanation: `${simpleRule} clean 是形容詞，所以要寫 The room is clean.`
    },
    {
      correct: "The weather is hot.",
      wrong: "The weather hot.",
      zh: "天氣很熱。",
      explanation: `${simpleRule} hot 是形容詞，所以要寫 The weather is hot.`
    },
    {
      correct: "They are friendly.",
      wrong: "They friendly.",
      zh: "他們很友善。",
      explanation: `${simpleRule} friendly 是形容詞，所以要寫 They are friendly.`
    },
    {
      correct: "My bag is heavy.",
      wrong: "My bag heavy.",
      zh: "我的書包很重。",
      explanation: `${simpleRule} heavy 是形容詞，所以要寫 My bag is heavy.`
    },
    {
      correct: "The lesson is important.",
      wrong: "The lesson important.",
      zh: "這課很重要。",
      explanation: `${simpleRule} important 是形容詞，所以要寫 The lesson is important.`
    },
    {
      correct: "This story is interesting.",
      wrong: "This story interesting.",
      zh: "這個故事很有趣。",
      explanation: `${simpleRule} interesting 是形容詞，所以要寫 This story is interesting.`
    },
    {
      correct: "Her idea is helpful.",
      wrong: "Her idea helpful.",
      zh: "她的想法很有幫助。",
      explanation: `${simpleRule} helpful 是形容詞，所以要寫 Her idea is helpful.`
    },
    {
      correct: "The answer is correct.",
      wrong: "The answer correct.",
      zh: "答案是正確的。",
      explanation: `${simpleRule} correct 是形容詞，所以要寫 The answer is correct.`
    }
  ].forEach((item) => addPair({ ...item, category: "simple" }));

  [
    {
      correct: "It is a high-quality school bag.",
      wrong: "It is a high quality school bag.",
      zh: "這是一個高質素的書包。",
      explanation: `${hyphenRule} high-quality 放在 school bag 前面做形容詞，所以要加 hyphen。`
    },
    {
      correct: "This is a well-known story.",
      wrong: "This is a well known story.",
      zh: "這是一個著名的故事。",
      explanation: `${hyphenRule} well-known 放在 story 前面做形容詞，所以要加 hyphen。`
    },
    {
      correct: "She is a hard-working student.",
      wrong: "She is a hard working student.",
      zh: "她是一個勤力的學生。",
      explanation: `${hyphenRule} hard-working 放在 student 前面做形容詞，所以要加 hyphen。`
    },
    {
      correct: "Mum has a full-time job.",
      wrong: "Mum has a full time job.",
      zh: "媽媽有一份全職工作。",
      explanation: `${hyphenRule} full-time 放在 job 前面做形容詞，所以要加 hyphen。`
    }
  ].forEach((item) => addPair({ ...item, category: "hyphen" }));

  [
    {
      correct: "He is willing to help me.",
      wrong: "He willing to help me.",
      zh: "他願意幫我。",
      explanation: `${compoundRule} willing to 很似動詞，但 willing 是形容詞，所以要寫 He is willing to help me.`
    },
    {
      correct: "I am interested in English.",
      wrong: "I interested in English.",
      zh: "我對英文感興趣。",
      explanation: `${compoundRule} interested in 是形容詞組，所以要寫 I am interested in English.`
    },
    {
      correct: "They are excited about the trip.",
      wrong: "They excited about the trip.",
      zh: "他們對旅行感到興奮。",
      explanation: `${compoundRule} excited about 是形容詞組，所以要寫 They are excited about the trip.`
    },
    {
      correct: "She is good at drawing.",
      wrong: "She good at drawing.",
      zh: "她擅長畫畫。",
      explanation: `${compoundRule} good at 是形容詞組，所以要寫 She is good at drawing.`
    },
    {
      correct: "Tom is worried about the test.",
      wrong: "Tom worried about the test.",
      zh: "Tom 擔心測驗。",
      explanation: `${compoundRule} worried about 是形容詞組，所以要寫 Tom is worried about the test.`
    },
    {
      correct: "We are ready for class.",
      wrong: "We ready for class.",
      zh: "我們準備好上堂。",
      explanation: `${compoundRule} ready for 是形容詞組，所以要寫 We are ready for class.`
    },
    {
      correct: "Mary is afraid of dogs.",
      wrong: "Mary afraid of dogs.",
      zh: "Mary 怕狗。",
      explanation: `${compoundRule} afraid of 是形容詞組，所以要寫 Mary is afraid of dogs.`
    },
    {
      correct: "I am proud of my team.",
      wrong: "I proud of my team.",
      zh: "我為我的隊伍感到自豪。",
      explanation: `${compoundRule} proud of 是形容詞組，所以要寫 I am proud of my team.`
    },
    {
      correct: "He is angry with his brother.",
      wrong: "He angry with his brother.",
      zh: "他生他哥哥的氣。",
      explanation: `${compoundRule} angry with 是形容詞組，所以要寫 He is angry with his brother.`
    },
    {
      correct: "The game is popular with children.",
      wrong: "The game popular with children.",
      zh: "這個遊戲受小朋友歡迎。",
      explanation: `${compoundRule} popular with 是形容詞組，所以要寫 The game is popular with children.`
    },
    {
      correct: "This book is suitable for Primary 4 students.",
      wrong: "This book suitable for Primary 4 students.",
      zh: "這本書適合小四學生。",
      explanation: `${compoundRule} suitable for 是形容詞組，所以要寫 This book is suitable for Primary 4 students.`
    },
    {
      correct: "She is kind to her classmates.",
      wrong: "She kind to her classmates.",
      zh: "她對同學很友善。",
      explanation: `${compoundRule} kind to 是形容詞組，所以要寫 She is kind to her classmates.`
    },
    {
      correct: "My answer is different from yours.",
      wrong: "My answer different from yours.",
      zh: "我的答案跟你的不同。",
      explanation: `${compoundRule} different from 是形容詞組，所以要寫 My answer is different from yours.`
    },
    {
      correct: "We are responsible for the classroom.",
      wrong: "We responsible for the classroom.",
      zh: "我們負責課室。",
      explanation: `${compoundRule} responsible for 是形容詞組，所以要寫 We are responsible for the classroom.`
    }
  ].forEach((item) => addPair({ ...item, category: "compound" }));

  return questions;
}

const ADJECTIVE_QUESTIONS = createAdjectiveQuestions();

function makeAdverbQuestion({
  id,
  category,
  sentence,
  zh,
  isCorrect,
  answer,
  acceptedAnswers,
  explanation
}) {
  const correctAnswer = String(answer || sentence || "").trim();
  return {
    id,
    type: "adverb-lesson",
    category,
    sentence,
    zh,
    isCorrect,
    answer: correctAnswer,
    english: correctAnswer,
    acceptedAnswers: Array.from(new Set([correctAnswer, ...(acceptedAnswers || [])].filter(Boolean))),
    explanation
  };
}

function createAdverbQuestions() {
  const questions = [];
  let nextId = 1;
  const add = (question) => {
    questions.push(makeAdverbQuestion({
      id: `adv${String(nextId).padStart(3, "0")}`,
      ...question
    }));
    nextId += 1;
  };
  const addPair = ({ correct, wrong, zh, answer = correct, explanation, category, acceptedAnswers }) => {
    add({
      category,
      sentence: correct,
      zh,
      isCorrect: true,
      answer: correct,
      explanation,
      acceptedAnswers
    });
    add({
      category,
      sentence: wrong,
      zh,
      isCorrect: false,
      answer,
      explanation,
      acceptedAnswers
    });
  };

  const frontRule =
    "句首副詞放句子最前面，後面通常要加 comma（,）。";
  const timeRule =
    "句尾時間副詞 / 時間詞要留意 in / on / at；today、tomorrow、yesterday、now、soon、again、last、next、every、each 這類字前面不用 in / on / at。";
  const placeRule =
    "句尾地方詞多數用 in / on / at；here、there、overseas、abroad 前面不用 in / on / at。";
  const orderRule =
    "如果句尾同時有地方詞和時間詞，通常先寫地方，再寫時間，時間放最後。";
  const mannerRule =
    "happily、carefully、slowly、well、badly 這類副詞可以放句尾，形容動作怎樣做。";
  const middleRule =
    "句中副詞要放準位置：modal verb 後、be verb 後、have 和 PP 中間，或主動動詞前。";
  const degreeRule =
    "very、really、too、quite 這類程度副詞通常放在形容詞 / 副詞前；very much 常放在 like、enjoy、love 後面。";

  [
    {
      correct: "Interestingly, Tom likes grammar.",
      wrong: "Interestingly Tom likes grammar.",
      zh: "有趣的是，Tom 喜歡文法。",
      explanation: `${frontRule} Interestingly 放句首，要寫 Interestingly,`
    },
    {
      correct: "More importantly, we must listen carefully.",
      wrong: "More importantly we must listen carefully.",
      zh: "更重要的是，我們必須小心聆聽。",
      explanation: `${frontRule} More importantly 放句首，要寫 More importantly,`
    },
    {
      correct: "Strangely, the door is open.",
      wrong: "Strangely the door is open.",
      zh: "奇怪的是，門是開著的。",
      explanation: `${frontRule} Strangely 放句首，要寫 Strangely,`
    },
    {
      correct: "Luckily, Mary is safe.",
      wrong: "Luckily Mary is safe.",
      zh: "幸運的是，Mary 很安全。",
      explanation: `${frontRule} Luckily 放句首，要寫 Luckily,`
    },
    {
      correct: "Clearly, this answer is wrong.",
      wrong: "Clearly this answer is wrong.",
      zh: "明顯地，這個答案是錯的。",
      explanation: `${frontRule} Clearly 放句首，要寫 Clearly,`
    },
    {
      correct: "Surely, you know the answer.",
      wrong: "Surely you know the answer.",
      zh: "你一定知道答案吧。",
      explanation: `${frontRule} Surely 放句首，這課要求寫 Surely,`
    },
    {
      correct: "Certainly, I can help you.",
      wrong: "Certainly I can help you.",
      zh: "當然，我可以幫你。",
      explanation: `${frontRule} Certainly 放句首，這課要求寫 Certainly,`
    }
  ].forEach((item) => addPair({ ...item, category: "front" }));

  [
    {
      correct: "I go to school every day.",
      wrong: "I go to school in every day.",
      zh: "我每天上學。",
      explanation: `${timeRule} every day 前面不用 in。`
    },
    {
      correct: "I will visit Grandma tomorrow.",
      wrong: "I will visit Grandma on tomorrow.",
      zh: "我明天會探望嫲嫲。",
      explanation: `${timeRule} tomorrow 前面不用 on。`
    },
    {
      correct: "We played football yesterday.",
      wrong: "We played football in yesterday.",
      zh: "我們昨天踢足球。",
      explanation: `${timeRule} yesterday 前面不用 in。`
    },
    {
      correct: "We have a quiz today.",
      wrong: "We have a quiz on today.",
      zh: "我們今天有小測。",
      explanation: `${timeRule} today 前面不用 on。`
    },
    {
      correct: "We will play football next week.",
      wrong: "We will play football in next week.",
      zh: "我們下星期會踢足球。",
      explanation: `${timeRule} next week 前面不用 in。`
    },
    {
      correct: "She reads books at night.",
      wrong: "She reads books in night.",
      zh: "她在晚上看書。",
      explanation: `${timeRule} at night 是固定時間詞。`
    },
    {
      correct: "I have piano lessons on Monday.",
      wrong: "I have piano lessons in Monday.",
      zh: "我星期一有鋼琴課。",
      explanation: `${timeRule} Monday 是日子，要用 on Monday。`
    },
    {
      correct: "Please do it now.",
      wrong: "Please do it at now.",
      zh: "請你現在做。",
      explanation: `${timeRule} now 前面不用 at。`
    },
    {
      correct: "We will leave soon.",
      wrong: "We will leave in soon.",
      zh: "我們很快會離開。",
      explanation: `${timeRule} soon 前面不用 in。`
    },
    {
      correct: "Please try again.",
      wrong: "Please try againly.",
      zh: "請再試一次。",
      explanation: `${timeRule} again 本身已經是副詞，不用加 -ly。`
    }
  ].forEach((item) => addPair({ ...item, category: "end-time" }));

  [
    {
      correct: "I live here.",
      wrong: "I live in here.",
      zh: "我住在這裡。",
      explanation: `${placeRule} here 前面不用 in。`
    },
    {
      correct: "She is there.",
      wrong: "She is at there.",
      zh: "她在那裡。",
      explanation: `${placeRule} there 前面不用 at。`
    },
    {
      correct: "My uncle works overseas.",
      wrong: "My uncle works in overseas.",
      zh: "我叔叔在海外工作。",
      explanation: `${placeRule} overseas 前面不用 in。`
    },
    {
      correct: "My aunt studies abroad.",
      wrong: "My aunt studies at abroad.",
      zh: "我姨姨在海外讀書。",
      explanation: `${placeRule} abroad 前面不用 at。`
    },
    {
      correct: "I live in Tsuen Wan.",
      wrong: "I live at Tsuen Wan.",
      zh: "我住在荃灣。",
      explanation: `${placeRule} Tsuen Wan 是地方區域，要用 in Tsuen Wan。`
    }
  ].forEach((item) => addPair({ ...item, category: "end-place" }));

  [
    {
      correct: "I lived in Tsuen Wan in 2010.",
      wrong: "I lived in 2010 in Tsuen Wan.",
      zh: "我在 2010 年住在荃灣。",
      explanation: `${orderRule} in Tsuen Wan 是地方，in 2010 是時間，所以時間放最後。`
    },
    {
      correct: "We will meet at the bus stop tomorrow.",
      wrong: "We will meet tomorrow at the bus stop.",
      zh: "我們明天會在巴士站見面。",
      explanation: `${orderRule} at the bus stop 是地方，tomorrow 是時間，所以時間放最後。`
    }
  ].forEach((item) => addPair({ ...item, category: "end-order" }));

  [
    {
      correct: "I learn English here happily.",
      wrong: "I learn English here happy.",
      zh: "我在這裡快樂地學英文。",
      explanation: `${mannerRule} happy 是形容詞，形容 learn 要用副詞 happily。`
    },
    {
      correct: "Tom runs quickly.",
      wrong: "Tom runs quick.",
      zh: "Tom 跑得很快。",
      explanation: `${mannerRule} 這課用 quickly 形容 runs。`
    },
    {
      correct: "We visit Grandma once in a while.",
      wrong: "We visit Grandma once in while.",
      zh: "我們有時探望嫲嫲。",
      explanation: `${mannerRule} 正確寫法是 once in a while。`
    },
    {
      correct: "I write carefully.",
      wrong: "I write careful.",
      zh: "我小心地寫字。",
      explanation: `${mannerRule} careful 是形容詞，形容 write 要用副詞 carefully。`
    },
    {
      correct: "Please speak slowly.",
      wrong: "Please speak slow.",
      zh: "請慢慢說。",
      explanation: `${mannerRule} slow 是形容詞，形容 speak 要用副詞 slowly。`
    },
    {
      correct: "She speaks English well.",
      wrong: "She speaks English good.",
      zh: "她英文說得好。",
      explanation: `${mannerRule} 形容 speaks 的表現要用副詞 well，不是形容詞 good。`
    }
  ].forEach((item) => addPair({ ...item, category: "end-manner" }));

  [
    {
      correct: "I can still walk.",
      wrong: "I still can walk.",
      zh: "我仍然可以行。",
      explanation: `${middleRule} still 要放在 modal verb can 後面。`
    },
    {
      correct: "He is still late.",
      wrong: "He still is late.",
      zh: "他仍然遲到。",
      explanation: `${middleRule} still 要放在 be verb is 後面。`
    },
    {
      correct: "I still believe you.",
      wrong: "I believe still you.",
      zh: "我仍然相信你。",
      explanation: `${middleRule} still 要放在主動動詞 believe 前面。`
    },
    {
      correct: "He can even eat ten egg tarts.",
      wrong: "He even can eat ten egg tarts.",
      zh: "他甚至可以食十個蛋撻。",
      explanation: `${middleRule} even 要放在 modal verb can 後面。`
    },
    {
      correct: "He is even willing to help me.",
      wrong: "He even is willing to help me.",
      zh: "他甚至願意幫我。",
      explanation: `${middleRule} even 要放在 be verb is 後面。`
    },
    {
      correct: "They even know my birthday.",
      wrong: "They know even my birthday.",
      zh: "他們甚至知道我的生日。",
      explanation: `${middleRule} even 要放在主動動詞 know 前面。`
    },
    {
      correct: "I always eat breakfast.",
      wrong: "I eat always breakfast.",
      zh: "我總是吃早餐。",
      explanation: `${middleRule} always 要放在主動動詞 eat 前面。`
    },
    {
      correct: "I usually do homework after school.",
      wrong: "I do usually homework after school.",
      zh: "我通常放學後做功課。",
      explanation: `${middleRule} usually 要放在主動動詞 do 前面。`
    },
    {
      correct: "I often read books.",
      wrong: "I read often books.",
      zh: "我經常看書。",
      explanation: `${middleRule} often 要放在主動動詞 read 前面。`
    },
    {
      correct: "She sometimes plays the piano.",
      wrong: "She plays sometimes the piano.",
      zh: "她有時彈鋼琴。",
      explanation: `${middleRule} sometimes 放在主動動詞 plays 前面最清楚。`
    },
    {
      correct: "He never tells lies.",
      wrong: "He tells never lies.",
      zh: "他從不說謊。",
      explanation: `${middleRule} never 要放在主動動詞 tells 前面。`
    },
    {
      correct: "I also like maths.",
      wrong: "I like also maths.",
      zh: "我也喜歡數學。",
      explanation: `${middleRule} also 要放在主動動詞 like 前面。`
    },
    {
      correct: "I have already finished my homework.",
      wrong: "I have finished already my homework.",
      zh: "我已經完成了功課。",
      explanation: `${middleRule} already 要放在 have 和 PP finished 中間。`
    },
    {
      correct: "She has just finished lunch.",
      wrong: "She has finished just lunch.",
      zh: "她剛剛吃完午餐。",
      explanation: `${middleRule} just 要放在 has 和 PP finished 中間。`
    },
    {
      correct: "They probably know the answer.",
      wrong: "They know probably the answer.",
      zh: "他們大概知道答案。",
      explanation: `${middleRule} probably 要放在主動動詞 know 前面。`
    }
  ].forEach((item) => addPair({ ...item, category: "middle" }));

  [
    {
      correct: "The box is very heavy.",
      wrong: "The box is heavy very.",
      zh: "這個箱很重。",
      explanation: `${degreeRule} very 要放在形容詞 heavy 前面。`
    },
    {
      correct: "I really like this story.",
      wrong: "I like really this story.",
      zh: "我真的喜歡這個故事。",
      explanation: `${degreeRule} really 形容 like，通常放在 like 前面。`
    },
    {
      correct: "I like this book very much.",
      wrong: "I like very much this book.",
      zh: "我很喜歡這本書。",
      explanation: `${degreeRule} very much 放在 this book 後面最自然。`
    },
    {
      correct: "The water is too hot.",
      wrong: "The water is hot too.",
      zh: "水太熱。",
      explanation: `${degreeRule} too 要放在形容詞 hot 前面，表示「太」。`
    },
    {
      correct: "This bag is quite heavy.",
      wrong: "This bag is heavy quite.",
      zh: "這個書包頗重。",
      explanation: `${degreeRule} quite 要放在形容詞 heavy 前面。`
    }
  ].forEach((item) => addPair({ ...item, category: "degree" }));

  return questions;
}

const ADVERB_QUESTIONS = createAdverbQuestions();

const TENSE_LABELS = {
  present: "現在式",
  past: "過去式",
  continuous: "進行式",
  perfect: "has/have + pp",
  perfectContinuous: "has/have + been + Ving"
};

const TENSE_OPTION_ROWS = [
  ["present", "past", "continuous"],
  ["perfect", "perfectContinuous"]
];

function makeTenseQuestion({
  id,
  tense,
  zh,
  sentence,
  answer,
  acceptedAnswers,
  explanation
}) {
  const correctAnswer = String(answer || "").trim();
  return {
    id,
    type: "tenses",
    tense,
    tenseLabel: TENSE_LABELS[tense] || tense,
    zh,
    sentence,
    answer: correctAnswer,
    english: sentence.replace("___", correctAnswer),
    acceptedAnswers: Array.from(new Set([correctAnswer, ...(acceptedAnswers || [])].filter(Boolean))),
    explanation
  };
}

function createTenseQuestions() {
  const questions = [];
  const add = (question) => {
    questions.push(makeTenseQuestion({
      id: `tense${String(questions.length + 1).padStart(3, "0")}`,
      ...question
    }));
  };

  const presentRule =
    "現在式表示到現在都有的習慣，或句子沒有說明要用其他時態。He / She / It / 單數名詞後面的動詞要加 s。";
  const pastRule =
    "過去式用於故事、新聞、幻想句子，或句子有 yesterday、last、ago 等過去時間詞。做法是把動詞轉做過去式。";
  const continuousRule =
    "進行式表示「正在 / 緊」，也可用於已預定好的將來行為。做法是 is / am / are / was / were + 動詞 ing。";
  const perfectRule =
    "has/have + pp 用於「了」但沒有過去時間詞、「過」、recently / lately、yet / never / ever 等情況。";
  const perfectContinuousRule =
    "has/have + been + Ving 用於「一直」或由過去開始到現在仍然持續的動作。";

  [
    {
      zh: "他甚少喝啤酒。",
      sentence: "He seldom ___ beer.",
      answer: "drinks",
      explanation: `${presentRule} He 是單數，所以 drink 要寫 drinks。`
    },
    {
      zh: "狗經常挖洞。",
      sentence: "Dogs often ___ holes.",
      answer: "dig",
      explanation: `${presentRule} Dogs 是眾數，所以動詞用原型 dig。`
    },
    {
      zh: "她總是很早起床。",
      sentence: "She always ___ up early.",
      answer: "gets",
      explanation: `${presentRule} always 表示習慣；She 後面的動詞要加 s，get up 變 gets up。`
    },
    {
      zh: "我通常乘巴士上學。",
      sentence: "I usually ___ to school by bus.",
      answer: "go",
      explanation: `${presentRule} usually 表示習慣；I 後面的動詞用原型 go。`
    },
    {
      zh: "Tom 有時在公園跑步。",
      sentence: "Tom sometimes ___ in the park.",
      answer: "runs",
      explanation: `${presentRule} sometimes 表示習慣；Tom 是單數名詞，所以 run 要寫 runs。`
    },
    {
      zh: "我們從不在課室大叫。",
      sentence: "We never ___ in the classroom.",
      answer: "shout",
      explanation: `${presentRule} never 表示習慣；We 後面的動詞用原型 shout。`
    },
    {
      zh: "這部機通常運作得很好。",
      sentence: "This machine usually ___ well.",
      answer: "works",
      explanation: `${presentRule} This machine 是單數名詞，所以 work 要寫 works。`
    },
    {
      zh: "他們經常放學後踢足球。",
      sentence: "They often ___ football after school.",
      answer: "play",
      explanation: `${presentRule} often 表示習慣；They 後面的動詞用原型 play。`
    },
    {
      zh: "Mary 很少吃糖。",
      sentence: "Mary seldom ___ sweets.",
      answer: "eats",
      explanation: `${presentRule} seldom 表示習慣；Mary 是單數名詞，所以 eat 要寫 eats。`
    },
    {
      zh: "學生每天讀英文。",
      sentence: "The students ___ English every day.",
      answer: "read",
      explanation: `${presentRule} every day 表示習慣；students 是眾數，所以動詞用原型 read。`
    },
    {
      zh: "我喜歡科學。",
      sentence: "I ___ science.",
      answer: "like",
      explanation: `${presentRule} 句子沒有說明要用其他時態，所以用現在式；I 後面用 like。`
    },
    {
      zh: "她知道答案。",
      sentence: "She ___ the answer.",
      answer: "knows",
      explanation: `${presentRule} 句子沒有說明要用其他時態，所以用現在式；She 後面 know 要寫 knows。`
    }
  ].forEach((item) => add({ ...item, tense: "present" }));

  [
    {
      zh: "我昨天喝了很多。",
      sentence: "I ___ a lot yesterday.",
      answer: "drank",
      explanation: `${pastRule} yesterday 是過去時間詞，所以 drink 要轉過去式 drank。`
    },
    {
      zh: "她上星期買了一個書包。",
      sentence: "She ___ a school bag last week.",
      answer: "bought",
      explanation: `${pastRule} last week 是過去時間詞，所以 buy 要轉過去式 bought。`
    },
    {
      zh: "我們兩日前去了圖書館。",
      sentence: "We ___ to the library two days ago.",
      answer: "went",
      explanation: `${pastRule} ago 表示過去，所以 go 要轉過去式 went。`
    },
    {
      zh: "新聞說火車停了。",
      sentence: "The news said the train ___.",
      answer: "stopped",
      explanation: `${pastRule} 新聞 / 報道通常講已發生的事，所以 stop 要轉過去式 stopped。`
    },
    {
      zh: "故事入面，王子打開了門。",
      sentence: "In the story, the prince ___ the door.",
      answer: "opened",
      explanation: `${pastRule} 故事多用過去式，所以 open 要寫 opened。`
    },
    {
      zh: "如果我有一個有錢爸爸就好了。",
      sentence: "I wish I ___ a rich dad.",
      answer: "had",
      explanation: `${pastRule} wish 這類幻想句子要用過去式，所以 have 要寫 had。`
    },
    {
      zh: "我小時候住在荃灣。",
      sentence: "I ___ in Tsuen Wan when I was small.",
      answer: "lived",
      explanation: `${pastRule} when I was small 有過去式 was，所以主句也用過去式 lived。`
    },
    {
      zh: "他今早弄壞了杯。",
      sentence: "He ___ the cup this morning.",
      answer: "broke",
      explanation: `${pastRule} this morning 在這句是已發生的事，所以 break 要轉過去式 broke。`
    },
    {
      zh: "爸爸昨晚煮了晚餐。",
      sentence: "Dad ___ dinner last night.",
      answer: "cooked",
      explanation: `${pastRule} last night 是過去時間詞，所以 cook 要寫 cooked。`
    },
    {
      zh: "我剛才看見你的哥哥。",
      sentence: "I ___ your brother just now.",
      answer: "saw",
      explanation: `${pastRule} just now 表示剛才，所以 see 要轉過去式 saw。`
    },
    {
      zh: "比賽在五分鐘前開始。",
      sentence: "The match ___ five minutes ago.",
      answer: "started",
      explanation: `${pastRule} ago 表示過去，所以 start 要寫 started。`
    },
    {
      zh: "她上個月寫了一個故事。",
      sentence: "She ___ a story last month.",
      answer: "wrote",
      explanation: `${pastRule} last month 是過去時間詞，所以 write 要轉過去式 wrote。`
    }
  ].forEach((item) => add({ ...item, tense: "past" }));

  [
    {
      zh: "當你打給我的時候，我正在睡覺。",
      sentence: "When you called me, I ___.",
      answer: "was sleeping",
      explanation: `${continuousRule} When you called me 是故事中的過去時間，所以用 was + sleeping。`
    },
    {
      zh: "她現在正在做功課。",
      sentence: "She ___ her homework now.",
      answer: "is doing",
      explanation: `${continuousRule} now 表示正在發生；She 配 is，所以寫 is doing。`
    },
    {
      zh: "我們正在上英文課。",
      sentence: "We ___ English.",
      answer: "are learning",
      explanation: `${continuousRule}「正在」表示進行式；We 配 are，所以寫 are learning。`
    },
    {
      zh: "我明天就要走了。",
      sentence: "I ___ tomorrow.",
      answer: "am leaving",
      explanation: `${continuousRule} 已預定好的將來行為可用進行式；I 配 am，所以寫 am leaving。`
    },
    {
      zh: "他們下星期會去日本。",
      sentence: "They ___ to Japan next week.",
      answer: "are going",
      explanation: `${continuousRule} 已預定好的將來行為可用進行式；They 配 are，所以寫 are going。`
    },
    {
      zh: "Tom 現在正在打籃球。",
      sentence: "Tom ___ basketball now.",
      answer: "is playing",
      explanation: `${continuousRule} now 表示正在；Tom 是單數，所以用 is playing。`
    },
    {
      zh: "孩子們正在唱歌。",
      sentence: "The children ___.",
      answer: "are singing",
      explanation: `${continuousRule}「正在」表示進行式；children 是眾數，所以用 are singing。`
    },
    {
      zh: "昨天七點，媽媽正在煮飯。",
      sentence: "Mum ___ at seven yesterday.",
      answer: "was cooking",
      explanation: `${continuousRule} at seven yesterday 是過去某一刻，所以用 was cooking。`
    },
    {
      zh: "你剛才正在看電視。",
      sentence: "You ___ TV just now.",
      answer: "were watching",
      explanation: `${continuousRule} just now 是過去時間；You 配 were，所以寫 were watching。`
    },
    {
      zh: "小狗正在花園跑。",
      sentence: "The dog ___ in the garden.",
      answer: "is running",
      explanation: `${continuousRule}「正在」表示進行式；The dog 是單數，所以用 is running。`
    },
    {
      zh: "我們今晚會見 Miss Chan。",
      sentence: "We ___ Miss Chan tonight.",
      answer: "are meeting",
      explanation: `${continuousRule} 已預定好的將來安排可用進行式；We 配 are，所以寫 are meeting。`
    },
    {
      zh: "他正在哭。",
      sentence: "He ___.",
      answer: "is crying",
      explanation: `${continuousRule}「正在」表示進行式；He 配 is，所以寫 is crying。`
    }
  ].forEach((item) => add({ ...item, tense: "continuous" }));

  [
    {
      zh: "我交了 project。",
      sentence: "I ___ the project.",
      answer: "have submitted",
      explanation: `${perfectRule}「交了」但沒有過去時間詞，所以用 have + PP：have submitted。`
    },
    {
      zh: "她知道了真相。",
      sentence: "She ___ the truth.",
      answer: "has known",
      explanation: `${perfectRule}「知道了」但沒有過去時間詞，所以用 has + PP：has known。`
    },
    {
      zh: "我最近學了一些泰文。",
      sentence: "I ___ some Thai recently.",
      answer: "have learnt",
      acceptedAnswers: ["have learned"],
      explanation: `${perfectRule} recently 是完成式提示，所以用 have + PP：have learnt。`
    },
    {
      zh: "他最近完成了模型。",
      sentence: "He ___ the model lately.",
      answer: "has finished",
      explanation: `${perfectRule} lately 是完成式提示；He 配 has，所以寫 has finished。`
    },
    {
      zh: "你有沒有去過日本？",
      sentence: "Have you ever ___ to Japan?",
      answer: "been",
      explanation: `${perfectRule} 問「有沒有去過」要用 Have you ever been to ...，去過用 been to，不用 gone to。`
    },
    {
      zh: "我沒有吃過壽司。",
      sentence: "I have never ___ sushi.",
      answer: "eaten",
      explanation: `${perfectRule}「沒有...過」用 have never + PP，所以 eat 要寫 eaten。`
    },
    {
      zh: "他們看過這套電影。",
      sentence: "They have ___ this film.",
      answer: "seen",
      explanation: `${perfectRule}「看過」用 have + PP，所以 see 要寫 seen。`
    },
    {
      zh: "Mary 去過英國。",
      sentence: "Mary has ___ to the UK.",
      answer: "been",
      explanation: `${perfectRule} 去過某地用 has been to，不用 has gone to。`
    },
    {
      zh: "你完成了功課未？",
      sentence: "Have you ___ your homework yet?",
      answer: "finished",
      explanation: `${perfectRule} 問「...未？」用 Have you + PP + yet，所以 finish 要寫 finished。`
    },
    {
      zh: "我還未打開禮物。",
      sentence: "I have not ___ the gift yet.",
      answer: "opened",
      explanation: `${perfectRule}「還未」用 have not + PP + yet，所以 open 要寫 opened。`
    },
    {
      zh: "她已經吃了午餐。",
      sentence: "She has already ___ lunch.",
      answer: "eaten",
      explanation: `${perfectRule} already 常配完成式；She 配 has，所以 eat 要寫 PP eaten。`
    },
    {
      zh: "我們剛剛聽了這首歌。",
      sentence: "We have just ___ this song.",
      answer: "heard",
      explanation: `${perfectRule} just 可表示剛剛完成；hear 的 PP 是 heard。`
    },
    {
      zh: "我遺失了鎖匙。",
      sentence: "I ___ my keys.",
      answer: "have lost",
      explanation: `${perfectRule}「遺失了」但沒有過去時間詞，重點是現在仍然遺失，所以用 have lost。`
    },
    {
      zh: "爸爸已經買了票。",
      sentence: "Dad ___ the tickets.",
      answer: "has bought",
      explanation: `${perfectRule}「買了」但沒有過去時間詞，所以用 has + PP：has bought。`
    },
    {
      zh: "學生已經寫了答案。",
      sentence: "The students ___ the answers.",
      answer: "have written",
      explanation: `${perfectRule}「寫了」但沒有過去時間詞，所以用 have + PP：have written。`
    },
    {
      zh: "她從未坐過飛機。",
      sentence: "She has never ___ by plane.",
      answer: "travelled",
      acceptedAnswers: ["traveled"],
      explanation: `${perfectRule}「從未...過」用 has never + PP；travel 的 PP 可寫 travelled。`
    }
  ].forEach((item) => add({ ...item, tense: "perfect" }));

  [
    {
      zh: "他今日一直在哭。",
      sentence: "He ___ today.",
      answer: "has been crying",
      explanation: `${perfectContinuousRule}「一直在哭」表示由較早開始到現在仍持續，所以用 has been crying。`
    },
    {
      zh: "我學了英文很多年。",
      sentence: "I ___ English for many years.",
      answer: "have been learning",
      explanation: `${perfectContinuousRule} for many years 表示持續到現在，所以用 have been learning。`
    },
    {
      zh: "她等了巴士二十分鐘。",
      sentence: "She ___ for the bus for twenty minutes.",
      answer: "has been waiting",
      explanation: `${perfectContinuousRule} for twenty minutes 表示動作一直持續，所以用 has been waiting。`
    },
    {
      zh: "我們由早上開始一直在溫習。",
      sentence: "We ___ since this morning.",
      answer: "have been studying",
      explanation: `${perfectContinuousRule} since this morning 表示由早上到現在，所以用 have been studying。`
    },
    {
      zh: "Tom 打機打了兩小時。",
      sentence: "Tom ___ games for two hours.",
      answer: "has been playing",
      explanation: `${perfectContinuousRule} for two hours 表示持續中，所以用 has been playing。`
    },
    {
      zh: "他們一直在尋找那隻貓。",
      sentence: "They ___ for the cat.",
      answer: "have been looking",
      explanation: `${perfectContinuousRule}「一直在尋找」表示持續的動作，所以用 have been looking。`
    },
    {
      zh: "媽媽整個下午一直在煮飯。",
      sentence: "Mum ___ all afternoon.",
      answer: "has been cooking",
      explanation: `${perfectContinuousRule} all afternoon 表示一直持續，所以用 has been cooking。`
    },
    {
      zh: "我最近一直在練習鋼琴。",
      sentence: "I ___ the piano recently.",
      answer: "have been practising",
      acceptedAnswers: ["have been practicing"],
      explanation: `${perfectContinuousRule} recently 加上「一直在練習」表示持續到現在，所以用 have been practising。`
    }
  ].forEach((item) => add({ ...item, tense: "perfectContinuous" }));

  const addExtraTenseQuestions = (tense, rule, items) => {
    items.forEach(([zh, sentence, answer, note, acceptedAnswers]) => {
      add({
        tense,
        zh,
        sentence,
        answer,
        acceptedAnswers,
        explanation: `${rule} ${note}`.replace("。 ", "；")
      });
    });
  };

  addExtraTenseQuestions("present", presentRule, [
    ["我哥哥每天刷牙。", "My brother ___ his teeth every day.", "brushes", "every day 表示習慣；My brother 是單數，所以 brush 要寫 brushes。"],
    ["那隻貓經常睡在椅子上。", "The cat often ___ on the chair.", "sleeps", "often 表示習慣；The cat 是單數，所以 sleep 要寫 sleeps。"],
    ["我們通常十二點半吃午餐。", "We usually ___ lunch at half past twelve.", "eat", "usually 表示習慣；We 後面用原型 eat。"],
    ["Jane 有時幫媽媽。", "Jane sometimes ___ her mum.", "helps", "sometimes 表示習慣；Jane 是單數，所以 help 要寫 helps。"],
    ["我的父母很少看電視。", "My parents seldom ___ TV.", "watch", "seldom 表示習慣；parents 是眾數，所以用 watch。"],
    ["我從不忘記帶功課。", "I never ___ my homework.", "forget", "never 表示習慣；I 後面用原型 forget。"],
    ["這架巴士每天早上停在這裡。", "This bus ___ here every morning.", "stops", "every morning 表示習慣；This bus 是單數，所以 stop 要寫 stops。"],
    ["這些鳥每年冬天飛到南方。", "These birds ___ south every winter.", "fly", "every winter 表示習慣；These birds 是眾數，所以用 fly。"],
    ["水在一百度沸騰。", "Water ___ at 100 degrees.", "boils", "這是一般事實，所以用現在式；Water 是不可數名詞，當單數用，所以 boil 要寫 boils。"],
    ["太陽每天升起。", "The sun ___ every day.", "rises", "every day 表示一般事實；The sun 是單數，所以 rise 要寫 rises。"],
    ["我的老師每天給我們功課。", "My teacher ___ us homework every day.", "gives", "every day 表示習慣；My teacher 是單數，所以 give 要寫 gives。"],
    ["你英文說得很好。", "You ___ English very well.", "speak", "句子沒有說明要用其他時態，所以用現在式；You 後面用 speak。"],
    ["孩子們放學後在操場玩。", "The children ___ in the playground after school.", "play", "after school 這裡表示習慣；children 是眾數，所以用 play。"],
    ["好學生上課時聆聽。", "A good student ___ in class.", "listens", "句子講一般習慣；A good student 是單數，所以 listen 要寫 listens。"],
    ["這間店每天九點開門。", "The shop ___ at nine every day.", "opens", "every day 表示習慣；The shop 是單數，所以 open 要寫 opens。"],
    ["圖書館星期日關門。", "The library ___ on Sundays.", "closes", "on Sundays 表示習慣；The library 是單數，所以 close 要寫 closes。"],
    ["我妹妹努力讀書。", "My sister ___ hard.", "studies", "句子沒有過去或進行提示，所以用現在式；sister 是單數，study 要變 studies。"],
    ["爸爸每天開車上班。", "Dad ___ to work every day.", "drives", "every day 表示習慣；Dad 是單數，所以 drive 要寫 drives。"],
    ["他們每個月探望祖母。", "They ___ Grandma every month.", "visit", "every month 表示習慣；They 後面用 visit。"],
    ["我晚飯前洗手。", "I ___ my hands before dinner.", "wash", "句子講日常習慣；I 後面用 wash。"],
    ["Kenny 通常坐地鐵上學。", "Kenny usually ___ to school by MTR.", "goes", "usually 表示習慣；Kenny 是單數，所以 go 要寫 goes。"],
    ["狗見到陌生人時會吠。", "Dogs ___ when they see strangers.", "bark", "句子講一般習性；Dogs 是眾數，所以用 bark。"],
    ["嬰兒累的時候會哭。", "The baby ___ when she is tired.", "cries", "句子講一般情況；The baby 是單數，cry 要變 cries。"],
    ["很多人每天使用手機。", "Many people ___ mobile phones every day.", "use", "every day 表示習慣；people 是眾數，所以用 use。"],
    ["她每天帶一個粉紅色書包。", "She ___ a pink school bag every day.", "carries", "every day 表示習慣；She 後面 carry 要變 carries。"],
    ["我們需要更多時間。", "We ___ more time.", "need", "句子沒有說明要用其他時態，所以用現在式；We 後面用 need。"],
    ["香港夏天經常下雨。", "It often ___ in summer in Hong Kong.", "rains", "often 表示經常發生；It 後面 rain 要寫 rains。"],
    ["我叔叔在銀行工作。", "My uncle ___ in a bank.", "works", "句子講現在的工作；My uncle 是單數，所以 work 要寫 works。"],
    ["我們學校八點開始上課。", "Our school ___ at eight.", "starts", "句子講固定時間表，所以用現在式；Our school 是單數，所以 start 要寫 starts。"],
    ["火車通常準時離開。", "The train usually ___ on time.", "leaves", "usually 表示習慣 / 時間表；The train 是單數，所以 leave 要寫 leaves。"],
    ["我知道你的名字。", "I ___ your name.", "know", "句子沒有其他時態提示，所以用現在式；I 後面用 know。"],
    ["他明白這個規則。", "He ___ this rule.", "understands", "句子沒有其他時態提示，所以用現在式；He 後面 understand 要寫 understands。"],
    ["女孩們星期六跳舞。", "The girls ___ on Saturdays.", "dance", "on Saturdays 表示習慣；girls 是眾數，所以用 dance。"],
    ["這部電話售價五千元。", "This phone ___ five thousand dollars.", "costs", "句子講現在的價錢；This phone 是單數，所以 cost 要寫 costs。"],
    ["你今天看起來很開心。", "You ___ happy today.", "look", "句子沒有說明要用其他時態，所以用現在式；You 後面用 look。"],
    ["Sam 有一架新單車。", "Sam ___ a new bike.", "has", "句子講現在擁有；Sam 是單數，所以 have 要寫 has。"],
    ["我們享受英文課。", "We ___ English lessons.", "enjoy", "句子沒有其他時態提示，所以用現在式；We 後面用 enjoy。"],
    ["Mary 教鋼琴。", "Mary ___ piano.", "teaches", "句子講現在的工作 / 習慣；Mary 是單數，所以 teach 要寫 teaches。"],
    ["那個男孩接住球。", "The boy ___ the ball.", "catches", "句子沒有說明要用其他時態，所以用現在式；The boy 是單數，所以 catch 要寫 catches。"],
    ["學生通常準時完成功課。", "The students usually ___ homework on time.", "finish", "usually 表示習慣；students 是眾數，所以用 finish。"]
  ]);

  addExtraTenseQuestions("past", pastRule, [
    ["我昨天吃了三文治。", "I ___ a sandwich yesterday.", "ate", "yesterday 是過去時間詞，所以 eat 要轉過去式 ate。"],
    ["她上星期日去了海灘。", "She ___ to the beach last Sunday.", "went", "last Sunday 是過去時間詞，所以 go 要轉過去式 went。"],
    ["我們剛才看見彩虹。", "We ___ a rainbow just now.", "saw", "just now 表示剛才，所以 see 要轉過去式 saw。"],
    ["Tom 兩日前找到他的鎖匙。", "Tom ___ his keys two days ago.", "found", "two days ago 表示過去，所以 find 要轉過去式 found。"],
    ["爸爸昨晚帶我們去餐廳。", "Dad ___ us to a restaurant last night.", "took", "last night 是過去時間詞，所以 take 要轉過去式 took。"],
    ["老師昨天給我們一張工作紙。", "The teacher ___ us a worksheet yesterday.", "gave", "yesterday 是過去時間詞，所以 give 要轉過去式 gave。"],
    ["媽媽上星期做了一個蛋糕。", "Mum ___ a cake last week.", "made", "last week 是過去時間詞，所以 make 要轉過去式 made。"],
    ["我昨晚寫了一封電郵。", "I ___ an email last night.", "wrote", "last night 是過去時間詞，所以 write 要轉過去式 wrote。"],
    ["Mary 昨天讀了這本書。", "Mary ___ this book yesterday.", "read", "yesterday 是過去時間詞，所以 read 讀音變過去式，但串法仍然是 read。"],
    ["弟弟昨晚很早睡。", "My brother ___ early last night.", "slept", "last night 是過去時間詞，所以 sleep 要轉過去式 slept。"],
    ["他們剛才跑去操場。", "They ___ to the playground just now.", "ran", "just now 表示剛才，所以 run 要轉過去式 ran。"],
    ["我上星期游了五十米。", "I ___ fifty metres last week.", "swam", "last week 是過去時間詞，所以 swim 要轉過去式 swam。"],
    ["她昨天買了一把傘。", "She ___ an umbrella yesterday.", "bought", "yesterday 是過去時間詞，所以 buy 要轉過去式 bought。"],
    ["那隻貓昨晚捉到一隻老鼠。", "The cat ___ a mouse last night.", "caught", "last night 是過去時間詞，所以 catch 要轉過去式 caught。"],
    ["我今早打破了一隻杯。", "I ___ a cup this morning.", "broke", "this morning 在這句是已發生的事，所以 break 要轉過去式 broke。"],
    ["她昨天遺失了八達通。", "She ___ her Octopus card yesterday.", "lost", "yesterday 是過去時間詞，所以 lose 要轉過去式 lost。"],
    ["我們上星期贏了比賽。", "We ___ the match last week.", "won", "last week 是過去時間詞，所以 win 要轉過去式 won。"],
    ["電影九點開始。", "The film ___ at nine.", "began", "句子講已發生的故事 / 事件，所以 begin 要轉過去式 began。"],
    ["他昨天帶了一本字典。", "He ___ a dictionary yesterday.", "brought", "yesterday 是過去時間詞，所以 bring 要轉過去式 brought。"],
    ["她上次選了藍色那件。", "She ___ the blue one last time.", "chose", "last time 表示過去，所以 choose 要轉過去式 chose。"],
    ["工人去年建了一條橋。", "The workers ___ a bridge last year.", "built", "last year 是過去時間詞，所以 build 要轉過去式 built。"],
    ["我昨天剪了頭髮。", "I ___ my hair yesterday.", "cut", "yesterday 是過去時間詞；cut 的過去式仍然是 cut。"],
    ["他剛才覺得很累。", "He ___ tired just now.", "felt", "just now 表示剛才，所以 feel 要轉過去式 felt。"],
    ["她昨天保留了收據。", "She ___ the receipt yesterday.", "kept", "yesterday 是過去時間詞，所以 keep 要轉過去式 kept。"],
    ["我上星期遇見 Miss Lee。", "I ___ Miss Lee last week.", "met", "last week 是過去時間詞，所以 meet 要轉過去式 met。"],
    ["爸爸昨日付了錢。", "Dad ___ the money yesterday.", "paid", "yesterday 是過去時間詞，所以 pay 要轉過去式 paid。"],
    ["新聞說雨很大。", "The news ___ the rain was heavy.", "said", "新聞報道已發生的事，所以 say 要轉過去式 said。"],
    ["他們上個月賣了舊車。", "They ___ their old car last month.", "sold", "last month 是過去時間詞，所以 sell 要轉過去式 sold。"],
    ["我昨天寄了一張卡。", "I ___ a card yesterday.", "sent", "yesterday 是過去時間詞，所以 send 要轉過去式 sent。"],
    ["我們剛才坐在後面。", "We ___ at the back just now.", "sat", "just now 表示剛才，所以 sit 要轉過去式 sat。"],
    ["老師昨天告訴我們答案。", "The teacher ___ us the answer yesterday.", "told", "yesterday 是過去時間詞，所以 tell 要轉過去式 told。"],
    ["我以為今天是假期。", "I ___ today was a holiday.", "thought", "句子講過去的想法，所以 think 要轉過去式 thought。"],
    ["她昨天穿了紅色裙。", "She ___ a red dress yesterday.", "wore", "yesterday 是過去時間詞，所以 wear 要轉過去式 wore。"],
    ["我們上星期清潔了課室。", "We ___ the classroom last week.", "cleaned", "last week 是過去時間詞，所以 clean 要寫 cleaned。"],
    ["他們昨晚看了一套電影。", "They ___ a film last night.", "watched", "last night 是過去時間詞，所以 watch 要寫 watched。"],
    ["我去年探望了澳門。", "I ___ Macau last year.", "visited", "last year 是過去時間詞，所以 visit 要寫 visited。"],
    ["Mary 昨晚溫習英文。", "Mary ___ English last night.", "studied", "last night 是過去時間詞；study 的過去式是 studied。"],
    ["他昨天拿著一個重袋。", "He ___ a heavy bag yesterday.", "carried", "yesterday 是過去時間詞；carry 的過去式是 carried。"],
    ["妹妹昨晚哭了。", "My sister ___ last night.", "cried", "last night 是過去時間詞；cry 的過去式是 cried。"],
    ["巴士五分鐘前停了。", "The bus ___ five minutes ago.", "stopped", "ago 表示過去；stop 的過去式要雙寫 p，寫 stopped。"]
  ]);

  addExtraTenseQuestions("continuous", continuousRule, [
    ["我現在正在讀英文書。", "I ___ an English book now.", "am reading", "now 表示正在發生；I 配 am，所以寫 am reading。"],
    ["她正在畫一幅圖畫。", "She ___ a picture.", "is drawing", "「正在」表示進行式；She 配 is，所以寫 is drawing。"],
    ["他們正在公園玩。", "They ___ in the park.", "are playing", "「正在」表示進行式；They 配 are，所以寫 are playing。"],
    ["我們現在正在吃午餐。", "We ___ lunch now.", "are having", "now 表示正在發生；We 配 are，所以寫 are having。"],
    ["外面正在下雨。", "It ___ outside.", "is raining", "「正在下雨」表示進行式；It 配 is，所以寫 is raining。"],
    ["媽媽正在廚房煮飯。", "Mum ___ in the kitchen.", "is cooking", "「正在」表示進行式；Mum 是單數，所以用 is cooking。"],
    ["Tom 正在做功課。", "Tom ___ his homework.", "is doing", "「正在」表示進行式；Tom 是單數，所以用 is doing。"],
    ["你正在講得太快。", "You ___ too fast.", "are talking", "「正在」表示進行式；You 配 are，所以寫 are talking。"],
    ["孩子們正在操場跑步。", "The children ___ in the playground.", "are running", "「正在」表示進行式；children 是眾數，所以用 are running。"],
    ["當電話響時，我正在洗澡。", "When the phone rang, I ___.", "was showering", "When the phone rang 是過去某一刻，所以用 was showering。"],
    ["她昨晚八點正在溫習。", "She ___ at eight last night.", "was studying", "at eight last night 是過去某一刻，所以用 was studying。"],
    ["他們那時正在看電視。", "They ___ TV at that time.", "were watching", "at that time 表示過去某一刻；They 配 were，所以寫 were watching。"],
    ["我們聽到聲音時正在行路。", "We ___ when we heard the noise.", "were walking", "when we heard the noise 是過去某一刻，所以用 were walking。"],
    ["爸爸剛才正在開車。", "Dad ___ just now.", "was driving", "just now 是過去時間；Dad 是單數，所以用 was driving。"],
    ["嬰兒那時正在哭。", "The baby ___ at that time.", "was crying", "at that time 是過去某一刻；The baby 是單數，所以用 was crying。"],
    ["學生們剛才正在寫答案。", "The students ___ the answers just now.", "were writing", "just now 是過去時間；students 是眾數，所以用 were writing。"],
    ["我明天會見表弟。", "I ___ my cousin tomorrow.", "am meeting", "已預定好的將來安排可用進行式；I 配 am，所以寫 am meeting。"],
    ["我們下星期會參觀博物館。", "We ___ the museum next week.", "are visiting", "已預定好的將來安排可用進行式；We 配 are，所以寫 are visiting。"],
    ["她今晚會離開香港。", "She ___ Hong Kong tonight.", "is leaving", "已預定好的將來行為可用進行式；She 配 is，所以寫 is leaving。"],
    ["他們星期五會飛去新加坡。", "They ___ to Singapore on Friday.", "are flying", "已預定好的將來安排可用進行式；They 配 are，所以寫 are flying。"],
    ["Tom 明天會參加足球隊。", "Tom ___ the football team tomorrow.", "is joining", "已預定好的將來行為可用進行式；Tom 是單數，所以用 is joining。"],
    ["我們班下星期會去旅行。", "Our class ___ on a trip next week.", "is going", "已預定好的將來安排可用進行式；Our class 當單數，所以用 is going。"],
    ["我下星期一會考英文。", "I ___ an English test next Monday.", "am taking", "已預定好的將來安排可用進行式；I 配 am，所以寫 am taking。"],
    ["他們現在正在排隊。", "They ___ in a line now.", "are standing", "now 表示正在發生；They 配 are，所以寫 are standing。"],
    ["她正在聽音樂。", "She ___ to music.", "is listening", "「正在」表示進行式；She 配 is，所以寫 is listening。"],
    ["我們正在等巴士。", "We ___ for the bus.", "are waiting", "「正在」表示進行式；We 配 are，所以寫 are waiting。"],
    ["那個男孩正在踢足球。", "The boy ___ football.", "is playing", "「正在」表示進行式；The boy 是單數，所以用 is playing。"],
    ["小鳥正在天空飛。", "The birds ___ in the sky.", "are flying", "「正在」表示進行式；birds 是眾數，所以用 are flying。"],
    ["Miss Chan 正在改簿。", "Miss Chan ___ the books.", "is marking", "「正在」表示進行式；Miss Chan 是單數，所以用 is marking。"],
    ["我正在找我的鉛筆。", "I ___ for my pencil.", "am looking", "「正在」表示進行式；I 配 am，所以寫 am looking。"],
    ["火車正在進站。", "The train ___ into the station.", "is coming", "「正在」表示進行式；The train 是單數，所以用 is coming。"],
    ["他們正準備考試。", "They ___ for the test.", "are preparing", "「正在」表示進行式；They 配 are，所以寫 are preparing。"],
    ["當老師入來時，我們正在唱歌。", "We ___ when the teacher came in.", "were singing", "when the teacher came in 是過去某一刻，所以用 were singing。"],
    ["當我看見 Mary 時，她正在買飲品。", "Mary ___ a drink when I saw her.", "was buying", "when I saw her 是過去某一刻；Mary 是單數，所以用 was buying。"],
    ["我們今晚會和家人吃晚飯。", "We ___ dinner with our family tonight.", "are having", "已預定好的將來安排可用進行式；We 配 are，所以寫 are having。"],
    ["他明天下午會看牙醫。", "He ___ the dentist tomorrow afternoon.", "is seeing", "已預定好的將來安排可用進行式；He 配 is，所以寫 is seeing。"],
    ["我星期六會搭早班車。", "I ___ the early bus on Saturday.", "am taking", "已預定好的將來安排可用進行式；I 配 am，所以寫 am taking。"],
    ["她下個月會開始新學校。", "She ___ at a new school next month.", "is starting", "已預定好的將來安排可用進行式；She 配 is，所以寫 is starting。"],
    ["我們明早會搬屋。", "We ___ house tomorrow morning.", "are moving", "已預定好的將來行為可用進行式；We 配 are，所以寫 are moving。"],
    ["他們星期日會舉行派對。", "They ___ a party on Sunday.", "are having", "已預定好的將來安排可用進行式；They 配 are，所以寫 are having。"]
  ]);

  addExtraTenseQuestions("perfect", perfectRule, [
    ["我清潔了房間。", "I ___ my room.", "have cleaned", "「清潔了」但沒有過去時間詞，所以用 have + PP：have cleaned。"],
    ["她打破了花瓶。", "She ___ the vase.", "has broken", "「打破了」但沒有過去時間詞，所以用 has + PP：has broken。"],
    ["我們看過這張相。", "We have ___ this photo.", "seen", "「看過」用 have + PP，所以 see 要寫 seen。"],
    ["Tom 吃了我的蛋糕。", "Tom ___ my cake.", "has eaten", "「吃了」但沒有過去時間詞，所以用 has + PP：has eaten。"],
    ["他們完成了專題研習。", "They ___ the project.", "have finished", "「完成了」但沒有過去時間詞，所以用 have + PP：have finished。"],
    ["Mary 讀了這篇文章。", "Mary ___ this article.", "has read", "「讀了」但沒有過去時間詞，所以用 has + PP；read 的 PP 串法仍然是 read。"],
    ["我遺失了學生證。", "I ___ my student card.", "have lost", "「遺失了」但沒有過去時間詞，重點是現在仍然遺失，所以用 have lost。"],
    ["他找到了答案。", "He ___ the answer.", "has found", "「找到了」但沒有過去時間詞，所以用 has + PP：has found。"],
    ["我們買了新桌遊。", "We ___ a new board game.", "have bought", "「買了」但沒有過去時間詞，所以用 have + PP：have bought。"],
    ["媽媽做了晚餐。", "Mum ___ dinner.", "has made", "「做了」但沒有過去時間詞，所以用 has + PP：has made。"],
    ["學生們寫了三個句子。", "The students ___ three sentences.", "have written", "「寫了」但沒有過去時間詞，所以用 have + PP：have written。"],
    ["她寄了電郵。", "She ___ the email.", "has sent", "「寄了」但沒有過去時間詞，所以用 has + PP：has sent。"],
    ["我聽過這個故事。", "I have ___ this story.", "heard", "「聽過」用 have + PP，所以 hear 要寫 heard。"],
    ["爸爸拍了很多相。", "Dad ___ many photos.", "has taken", "「拍了」但沒有過去時間詞，所以用 has + PP：has taken。"],
    ["我們做了所有練習。", "We ___ all the exercises.", "have done", "「做了」但沒有過去時間詞，所以用 have + PP：have done。"],
    ["他打開了窗。", "He ___ the window.", "has opened", "「打開了」但沒有過去時間詞，所以用 has + PP：has opened。"],
    ["你有沒有參觀過故宮博物館？", "Have you ever ___ the Palace Museum?", "visited", "問「有沒有...過」用 Have you ever + PP，所以 visit 要寫 visited。"],
    ["她贏過英文比賽。", "She has ___ an English competition.", "won", "「贏過」用 has + PP，所以 win 要寫 won。"],
    ["我見過你的姐姐。", "I have ___ your sister.", "met", "「見過」用 have + PP，所以 meet 要寫 met。"],
    ["天氣變冷了。", "The weather ___ cold.", "has become", "「變冷了」但沒有過去時間詞，所以用 has + PP：has become。"],
    ["我最近學了一首新歌。", "I ___ a new song recently.", "have learnt", "recently 是完成式提示，所以用 have + PP：have learnt。", ["have learned"]],
    ["他最近畫了一幅很美的畫。", "He ___ a beautiful picture lately.", "has drawn", "lately 是完成式提示；He 配 has，所以寫 has drawn。"],
    ["他們已經離開課室。", "They have already ___ the classroom.", "left", "already 常配完成式；leave 的 PP 是 left。"],
    ["我剛剛關了門。", "I have just ___ the door.", "closed", "just 可表示剛剛完成；close 的 PP 是 closed。"],
    ["她還未選好禮物。", "She has not ___ a gift yet.", "chosen", "「還未」用 has not + PP + yet，所以 choose 要寫 chosen。"],
    ["你吃了晚飯未？", "Have you ___ dinner yet?", "eaten", "問「...未？」用 Have you + PP + yet，所以 eat 要寫 eaten。"],
    ["我們從未去過加拿大。", "We have never ___ to Canada.", "been", "「去過」用 been to；否定句用 have never + PP。"],
    ["Tom 從未試過榴槤。", "Tom has never ___ durian.", "tried", "「從未...過」用 has never + PP；try 的 PP 是 tried。"],
    ["他們最近搬了屋。", "They ___ house recently.", "have moved", "recently 是完成式提示，所以用 have + PP：have moved。"],
    ["我已經洗了碗。", "I have already ___ the dishes.", "washed", "already 常配完成式；wash 的 PP 是 washed。"],
    ["她已經忘記了密碼。", "She has already ___ the password.", "forgotten", "already 常配完成式；forget 的 PP 是 forgotten。"],
    ["我們剛剛收到訊息。", "We have just ___ the message.", "received", "just 可表示剛剛完成；receive 的 PP 是 received。"],
    ["他最近病了。", "He ___ ill lately.", "has been", "lately 是完成式提示；He 配 has，所以寫 has been。"],
    ["我從未坐過渡輪。", "I have never ___ a ferry.", "taken", "「從未...過」用 have never + PP；take 的 PP 是 taken。"],
    ["她去過澳洲。", "She has ___ to Australia.", "been", "去過某地用 has been to，不用 has gone to。"],
    ["我們已經明白這課。", "We ___ this lesson.", "have understood", "「明白了」但沒有過去時間詞，所以用 have + PP：have understood。"],
    ["老師已經改了測驗。", "The teacher ___ the quiz.", "has marked", "「改了」但沒有過去時間詞，所以用 has + PP：has marked。"],
    ["我最近讀完了一本書。", "I ___ a book recently.", "have finished", "recently 是完成式提示，所以用 have + PP：have finished。"],
    ["他們還未開始比賽。", "They have not ___ the match yet.", "started", "「還未」用 have not + PP + yet，所以 start 要寫 started。"],
    ["Mary 已經帶了午餐。", "Mary ___ lunch.", "has brought", "「帶了」但沒有過去時間詞，所以用 has + PP：has brought。"]
  ]);

  addExtraTenseQuestions("perfectContinuous", perfectContinuousRule, [
    ["她整個早上一直在讀書。", "She ___ all morning.", "has been reading", "all morning 表示動作一直持續，所以用 has been reading。"],
    ["我們等了老師十分鐘。", "We ___ for the teacher for ten minutes.", "have been waiting", "for ten minutes 表示持續到現在，所以用 have been waiting。"],
    ["天由早上開始一直在下雨。", "It ___ since this morning.", "has been raining", "since this morning 表示由早上到現在，所以用 has been raining。"],
    ["孩子們玩了很久。", "The children ___ for a long time.", "have been playing", "for a long time 表示持續中，所以用 have been playing。"],
    ["弟弟睡了兩小時。", "My brother ___ for two hours.", "has been sleeping", "for two hours 表示由過去持續到現在，所以用 has been sleeping。"],
    ["我哋成日都在做這個 project。", "We ___ on this project all day.", "have been working", "all day 表示一直持續，所以用 have been working。"],
    ["她由七點開始一直在溫習。", "She ___ since seven o'clock.", "has been studying", "since seven o'clock 表示由七點到現在，所以用 has been studying。"],
    ["我最近一直在練英文。", "I ___ English recently.", "have been practising", "recently 加上「一直在練」表示持續，所以用 have been practising。", ["have been practicing"]],
    ["Tom 咳了三日。", "Tom ___ for three days.", "has been coughing", "for three days 表示持續到現在，所以用 has been coughing。"],
    ["我們在香港住了很多年。", "We ___ in Hong Kong for many years.", "have been living", "for many years 表示持續到現在，所以用 have been living。"],
    ["Miss Lee 在這間學校教了十年。", "Miss Lee ___ at this school for ten years.", "has been teaching", "for ten years 表示由過去到現在，所以用 has been teaching。"],
    ["他們整個下午一直在清潔課室。", "They ___ the classroom all afternoon.", "have been cleaning", "all afternoon 表示一直持續，所以用 have been cleaning。"],
    ["妹妹由放學開始一直在畫畫。", "My sister ___ since school ended.", "has been drawing", "since school ended 表示由放學到現在，所以用 has been drawing。"],
    ["我們一直在討論這個問題。", "We ___ this problem.", "have been discussing", "「一直在討論」表示持續的動作，所以用 have been discussing。"],
    ["爸爸整個晚上一直在修理單車。", "Dad ___ the bike all evening.", "has been repairing", "all evening 表示一直持續，所以用 has been repairing。"],
    ["工人們建這座橋建了幾個月。", "The workers ___ this bridge for several months.", "have been building", "for several months 表示持續中，所以用 have been building。"],
    ["她寫這個故事寫了兩星期。", "She ___ this story for two weeks.", "has been writing", "for two weeks 表示由過去到現在仍在做，所以用 has been writing。"],
    ["我們走了半小時。", "We ___ for half an hour.", "have been walking", "for half an hour 表示持續到現在，所以用 have been walking。"],
    ["那個男人坐在那裡很久了。", "The man ___ there for a long time.", "has been sitting", "for a long time 表示持續到現在，所以用 has been sitting。"],
    ["他們一直在找失物。", "They ___ for the lost item.", "have been looking", "「一直在找」表示持續的動作，所以用 have been looking。"],
    ["嬰兒哭了很久。", "The baby ___ for a long time.", "has been crying", "for a long time 表示持續到現在，所以用 has been crying。"],
    ["我們學普通話學了三年。", "We ___ Putonghua for three years.", "have been learning", "for three years 表示持續到現在，所以用 have been learning。"],
    ["Tom 做這份功課做了一小時。", "Tom ___ this homework for an hour.", "has been doing", "for an hour 表示持續中，所以用 has been doing。"],
    ["學生們跑了十分鐘。", "The students ___ for ten minutes.", "have been running", "for ten minutes 表示持續到現在，所以用 have been running。"],
    ["媽媽由五點開始一直在煮飯。", "Mum ___ since five o'clock.", "has been cooking", "since five o'clock 表示由五點到現在，所以用 has been cooking。"],
    ["我們談了整個小息。", "We ___ for the whole recess.", "have been talking", "for the whole recess 表示持續到現在，所以用 have been talking。"],
    ["他整天都在用電腦。", "He ___ the computer all day.", "has been using", "all day 表示一直持續，所以用 has been using。"],
    ["他們看電視看了一整個下午。", "They ___ TV all afternoon.", "have been watching", "all afternoon 表示一直持續，所以用 have been watching。"],
    ["這棵植物最近長得很快。", "This plant ___ quickly recently.", "has been growing", "recently 加上持續變化，所以用 has been growing。"],
    ["我們為旅行儲錢儲了半年。", "We ___ money for the trip for half a year.", "have been saving", "for half a year 表示持續到現在，所以用 have been saving。"],
    ["她一直在計劃生日派對。", "She ___ the birthday party.", "has been planning", "「一直在計劃」表示持續的動作，所以用 has been planning。"],
    ["我們由上星期開始一直在準備表演。", "We ___ for the show since last week.", "have been preparing", "since last week 表示由上星期到現在，所以用 have been preparing。"],
    ["那個小朋友一直在問問題。", "The child ___ questions.", "has been asking", "「一直在問」表示持續的動作，所以用 has been asking。"],
    ["學生們一直在幫老師。", "The students ___ the teacher.", "have been helping", "「一直在幫」表示持續的動作，所以用 have been helping。"],
    ["哥哥為比賽訓練了三個月。", "My brother ___ for the race for three months.", "has been training", "for three months 表示持續到現在，所以用 has been training。"],
    ["我們收集貼紙收集了很多年。", "We ___ stickers for many years.", "have been collecting", "for many years 表示持續到現在，所以用 have been collecting。"],
    ["Mary 最近一直在照顧小狗。", "Mary ___ the puppy recently.", "has been looking after", "recently 加上「一直在照顧」表示持續，所以用 has been looking after。"],
    ["他們由午餐後一直在練歌。", "They ___ since lunch.", "have been singing", "since lunch 表示由午餐後到現在，所以用 have been singing。"],
    ["爸爸一直在洗車。", "Dad ___ the car.", "has been washing", "「一直在洗」表示持續的動作，所以用 has been washing。"],
    ["我們排隊排了二十分鐘。", "We ___ in line for twenty minutes.", "have been standing", "for twenty minutes 表示持續到現在，所以用 have been standing。"]
  ]);

  return questions;
}

const TENSE_QUESTIONS = createTenseQuestions();

const HAVE_USAGE_LABELS = {
  "there-be": "There be",
  "with-without": "with / without",
  have: "have / has"
};

const HAVE_USAGE_OPTION_ROWS = [
  ["there-be", "with-without", "have"]
];

function makeHaveUsageQuestion({
  id,
  category,
  sentence,
  zh,
  isCorrect,
  answer,
  acceptedAnswers,
  explanation
}) {
  const correctAnswer = String(answer || sentence || "").trim();
  return {
    id,
    type: "have-usage",
    category,
    categoryLabel: HAVE_USAGE_LABELS[category] || category,
    sentence,
    zh,
    isCorrect,
    answer: correctAnswer,
    english: correctAnswer,
    acceptedAnswers: Array.from(new Set([correctAnswer, ...(acceptedAnswers || [])].filter(Boolean))),
    explanation
  };
}

function createHaveUsageQuestions() {
  const questions = [];
  let nextId = 1;
  const add = (question) => {
    questions.push(makeHaveUsageQuestion({
      id: `hu${String(nextId).padStart(3, "0")}`,
      ...question
    }));
    nextId += 1;
  };
  const addPair = ({ correct, wrong, zh, answer = correct, explanation, category, acceptedAnswers }) => {
    add({
      category,
      sentence: correct,
      zh,
      isCorrect: true,
      answer: correct,
      explanation,
      acceptedAnswers
    });
    add({
      category,
      sentence: wrong,
      zh,
      isCorrect: false,
      answer,
      explanation,
      acceptedAnswers
    });
  };

  const thereBeRule =
    "句首「有」或地方「有」通常用 There is / There are；單數或不可數用 There is，眾數用 There are。";
  const thereExtraRule =
    "There be 後面如果再講動作，可以用 V-ing / PP，或者加 who / which 連住後面的動詞。";
  const withRule =
    "「有 / 沒有...的名詞」用 with / without；句首「有了 / 沒有...」也可以用 With / Without 加名詞，後面通常加 comma。";
  const haveRule =
    "如果不是句首存在 / 地方有，也不是形容一個名詞，就用 have / has；沒有就用 do not / does not / did not have。";

  [
    {
      correct: "There are many wet markets in Hong Kong.",
      wrong: "There has many wet markets in Hong Kong.",
      zh: "香港有很多街市。",
      explanation: `${thereBeRule} wet markets 是眾數，所以用 There are。`
    },
    {
      correct: "There are many patients today.",
      wrong: "Today has many patients.",
      zh: "今日有很多病人。",
      explanation: `${thereBeRule} 今日有很多病人是存在情況，所以用 There are。`
    },
    {
      correct: "There is only one egg in the fridge.",
      wrong: "There are only one egg in the fridge.",
      zh: "雪櫃只有一隻蛋。",
      explanation: `${thereBeRule} one egg 是單數，所以用 There is。`
    },
    {
      correct: "There is a lot of fake news online.",
      wrong: "There are many fake news online.",
      zh: "網上有很多假新聞。",
      acceptedAnswers: ["There is a lot of fake news on the internet."],
      explanation: `${thereBeRule} news 是不可數名詞，所以用 There is a lot of fake news。`
    },
    {
      correct: "There are five books on the desk.",
      wrong: "On the desk has five books.",
      zh: "桌上有五本書。",
      explanation: `${thereBeRule} 地方有東西，不寫 On the desk has，要寫 There are。`
    },
    {
      correct: "There is some water in the bottle.",
      wrong: "There are some waters in the bottle.",
      zh: "瓶裏有一些水。",
      explanation: `${thereBeRule} water 是不可數名詞，所以用 There is some water。`
    },
    {
      correct: "There are many people in the park.",
      wrong: "The park there are many people.",
      zh: "公園有很多人。",
      explanation: `${thereBeRule} 地方「有」用 There are many people in the park。`
    },
    {
      correct: "There is a problem with my computer.",
      wrong: "My computer there is a problem.",
      zh: "我的電腦有一個問題。",
      explanation: `${thereBeRule} 這裡是說存在一個問題，所以用 There is a problem。`
    },
    {
      correct: "There is a lot of food which should have expired in the fridge.",
      wrong: "There is a lot of food should have expired in the fridge.",
      zh: "雪櫃有很多食物應該過期了。",
      explanation: `${thereExtraRule} There be 後面再有 should，就要加 which 連住：food which should have expired。`
    },
    {
      correct: "There are many students who can answer this question.",
      wrong: "There are many students can answer this question.",
      zh: "有很多學生可以回答這條問題。",
      explanation: `${thereExtraRule} There are many students 後面有 can answer，要加 who。`
    },
    {
      correct: "There are many students asking me this question.",
      wrong: "There are many students ask me this question.",
      zh: "有很多學生問我這問題。",
      acceptedAnswers: ["There are many students who ask me this question."],
      explanation: `${thereExtraRule} There be 後面再有主動動作，可以用 asking，或加 who ask。`
    },
    {
      correct: "There is a boy holding a red pen.",
      wrong: "There is a boy holds a red pen.",
      zh: "有一個男孩拿著一枝紅筆。",
      acceptedAnswers: ["There is a boy who is holding a red pen."],
      explanation: `${thereExtraRule} 句子已有 There is；後面描述男孩拿著筆，用 holding。`
    },
    {
      correct: "There are many students punished by my class teacher.",
      wrong: "There are many students punish by my class teacher.",
      zh: "有很多學生被我的班主任罰。",
      acceptedAnswers: ["There are many students who were punished by my class teacher."],
      explanation: `${thereExtraRule} 被罰是被動意思，所以用 PP punished，或 who were punished。`
    },
    {
      correct: "There are many windows broken by the typhoon.",
      wrong: "There are many windows broke by the typhoon.",
      zh: "有很多窗被颱風吹爛了。",
      explanation: `${thereExtraRule} 被吹爛是被動意思，所以用 PP broken。`
    },
    {
      correct: "There is a dog which may bite people.",
      wrong: "There is a dog may bite people.",
      zh: "有一隻狗可能會咬人。",
      explanation: `${thereExtraRule} There is a dog 後面有 modal verb may，要加 which。`
    },
    {
      correct: "There are some children playing outside.",
      wrong: "There are some children play outside.",
      zh: "有些小朋友在外面玩。",
      acceptedAnswers: ["There are some children who are playing outside."],
      explanation: `${thereExtraRule} There are 後面再講小朋友正在玩，用 playing，或 who are playing。`
    }
  ].forEach((item) => addPair({ ...item, category: "there-be" }));

  [
    {
      correct: "I want a tortoise with two heads.",
      wrong: "I want a tortoise has two heads.",
      zh: "我想要一隻有兩個頭的龜。",
      explanation: `${withRule} 有兩個頭的龜是形容 tortoise，所以用 with two heads。`
    },
    {
      correct: "I prefer cats with a long tail.",
      wrong: "I prefer cats have a long tail.",
      zh: "我較喜歡有長尾巴的貓。",
      explanation: `${withRule} 有長尾巴的貓是形容 cats，所以用 cats with a long tail。`
    },
    {
      correct: "I don't need a torch without batteries.",
      wrong: "I don't need a torch does not have batteries.",
      zh: "我不需要沒有電池的電筒。",
      acceptedAnswers: ["I do not need a torch without batteries."],
      explanation: `${withRule} 沒有電池的電筒是形容 torch，所以用 without batteries。`
    },
    {
      correct: "The girl with glasses is my sister.",
      wrong: "The girl has glasses is my sister.",
      zh: "那個戴眼鏡的女孩是我妹妹。",
      explanation: `${withRule} with glasses 形容 The girl；不要直接寫 The girl has glasses is。`
    },
    {
      correct: "A boy with a blue bag is waiting outside.",
      wrong: "A boy has a blue bag is waiting outside.",
      zh: "一個有藍色書包的男孩正在外面等。",
      explanation: `${withRule} with a blue bag 形容 A boy。`
    },
    {
      correct: "I bought a notebook with a red cover.",
      wrong: "I bought a notebook has a red cover.",
      zh: "我買了一本有紅色封面的筆記簿。",
      explanation: `${withRule} with a red cover 形容 notebook。`
    },
    {
      correct: "Do not buy snacks without labels.",
      wrong: "Do not buy snacks do not have labels.",
      zh: "不要買沒有標籤的零食。",
      acceptedAnswers: ["Don't buy snacks without labels."],
      explanation: `${withRule} 沒有標籤的零食是形容 snacks，所以用 without labels。`
    },
    {
      correct: "The classroom with two doors is large.",
      wrong: "The classroom has two doors is large.",
      zh: "那間有兩道門的課室很大。",
      explanation: `${withRule} with two doors 形容 The classroom。`
    },
    {
      correct: "With your help, I believe I can pass.",
      wrong: "With your help I believe I can pass.",
      zh: "有了你的幫助，我相信我可以合格。",
      explanation: `${withRule} With your help 放句首，後面要加 comma。`
    },
    {
      correct: "With AI tools, I can learn faster.",
      wrong: "Have AI tools, I can learn faster.",
      zh: "有了 AI 工具，我可以學得更快。",
      explanation: `${withRule} 句首「有了 AI 工具」用 With AI tools，不用 Have AI tools。`
    },
    {
      correct: "Without you, my life is meaningless.",
      wrong: "Without you my life is meaningless.",
      zh: "沒有你，我的人生沒意義。",
      explanation: `${withRule} Without you 放句首，後面要加 comma。`
    },
    {
      correct: "Without enough sleep, students feel tired.",
      wrong: "No enough sleep, students feel tired.",
      zh: "沒有足夠睡眠，學生會覺得累。",
      explanation: `${withRule} 句首「沒有足夠睡眠」用 Without enough sleep。`
    }
  ].forEach((item) => addPair({ ...item, category: "with-without" }));

  [
    {
      correct: "They have many questions.",
      wrong: "There are they many questions.",
      zh: "他們有很多問題。",
      explanation: `${haveRule} 這裡是他們擁有問題，所以用 They have。`
    },
    {
      correct: "I do not have friends.",
      wrong: "I have not friends.",
      zh: "我沒有朋友。",
      acceptedAnswers: ["I don't have friends."],
      explanation: `${haveRule} 沒有用 do not have；I 後面用 do not have。`
    },
    {
      correct: "These chairs do not have price tags.",
      wrong: "These chairs without price tags.",
      zh: "這些椅子沒有價錢牌。",
      acceptedAnswers: ["These chairs don't have price tags."],
      explanation: `${haveRule} 這裡是 chairs 沒有 price tags，所以用 do not have。`
    },
    {
      correct: "She has a new school bag.",
      wrong: "She is have a new school bag.",
      zh: "她有一個新書包。",
      explanation: `${haveRule} She 是單數，所以用 has；have 前面不用加 is。`
    },
    {
      correct: "My brother has two watches.",
      wrong: "My brother have two watches.",
      zh: "我哥哥有兩隻手錶。",
      explanation: `${haveRule} My brother 是單數，所以用 has。`
    },
    {
      correct: "We have English lessons on Monday.",
      wrong: "We are have English lessons on Monday.",
      zh: "我們星期一有英文課。",
      explanation: `${haveRule} We 後面用 have，不用 are have。`
    },
    {
      correct: "Tom does not have a pencil.",
      wrong: "Tom do not have a pencil.",
      zh: "Tom 沒有鉛筆。",
      acceptedAnswers: ["Tom doesn't have a pencil."],
      explanation: `${haveRule} Tom 是單數，所以否定句用 does not have。`
    },
    {
      correct: "Did you have breakfast?",
      wrong: "Did you had breakfast?",
      zh: "你吃了早餐嗎？",
      explanation: `${haveRule} 問句有 Did，後面動詞用原型 have。`
    },
    {
      correct: "Our school has a big hall.",
      wrong: "Our school have a big hall.",
      zh: "我們學校有一個大禮堂。",
      explanation: `${haveRule} Our school 是單數，所以用 has。`
    },
    {
      correct: "I had a fever yesterday.",
      wrong: "I was have a fever yesterday.",
      zh: "我昨天發燒。",
      explanation: `${haveRule} yesterday 是過去時間，所以 have 變 had；不用 was have。`
    },
    {
      correct: "The dog has black ears.",
      wrong: "The dog with black ears.",
      zh: "那隻狗有黑色耳朵。",
      explanation: `${haveRule} 這裡是完整句子，要有動詞 has；with black ears 只是一個形容部分。`
    },
    {
      correct: "My phone does not have enough battery.",
      wrong: "My phone without enough battery.",
      zh: "我的手機沒有足夠電量。",
      acceptedAnswers: ["My phone doesn't have enough battery."],
      explanation: `${haveRule} 這裡要寫完整句子，所以用 does not have。`
    }
  ].forEach((item) => addPair({ ...item, category: "have" }));

  return questions;
}

const HAVE_USAGE_QUESTIONS = createHaveUsageQuestions();

const VERB_TABLE_FIELDS = grammarCore?.VERB_TABLE_FIELDS || [
  { key: "present", label: "現在式", shortLabel: "Present" },
  { key: "past", label: "過去式", shortLabel: "Past" },
  { key: "pp", label: "PP", shortLabel: "PP" },
  { key: "ing", label: "ING", shortLabel: "ING" }
];

function makeVerbTableQuestion(item, index) {
  const [zh, present, past, pp, ing] = item;
  return {
    id: `vt${String(index + 1).padStart(3, "0")}`,
    type: "verb-table",
    zh,
    forms: { present, past, pp, ing }
  };
}

const VERB_TABLE_QUESTIONS = [
  ["成為；變成", "become", "became", "become", "becoming"],
  ["開始", "begin", "began", "begun", "beginning"],
  ["咬", "bite", "bit", "bitten", "biting"],
  ["吹", "blow", "blew", "blown", "blowing"],
  ["打破", "break", "broke", "broken", "breaking"],
  ["帶來", "bring", "brought", "brought", "bringing"],
  ["建造", "build", "built", "built", "building"],
  ["買", "buy", "bought", "bought", "buying"],
  ["捉住；趕上", "catch", "caught", "caught", "catching"],
  ["選擇", "choose", "chose", "chosen", "choosing"],
  ["來", "come", "came", "come", "coming"],
  ["切", "cut", "cut", "cut", "cutting"],
  ["做", "do", "did", "done", "doing"],
  ["畫", "draw", "drew", "drawn", "drawing"],
  ["喝", "drink", "drank", "drunk", "drinking"],
  ["駕駛", "drive", "drove", "driven", "driving"],
  ["吃", "eat", "ate", "eaten", "eating"],
  ["跌下；落下", "fall", "fell", "fallen", "falling"],
  ["餵", "feed", "fed", "fed", "feeding"],
  ["感覺", "feel", "felt", "felt", "feeling"],
  ["找到", "find", "found", "found", "finding"],
  ["飛", "fly", "flew", "flown", "flying"],
  ["忘記", "forget", "forgot", "forgotten", "forgetting"],
  ["得到", "get", "got", "got", "getting"],
  ["給", "give", "gave", "given", "giving"],
  ["去", "go", "went", "gone", "going"],
  ["生長", "grow", "grew", "grown", "growing"],
  ["有；吃", "have", "had", "had", "having"],
  ["聽見", "hear", "heard", "heard", "hearing"],
  ["隱藏", "hide", "hid", "hidden", "hiding"],
  ["打；擊中", "hit", "hit", "hit", "hitting"],
  ["握住", "hold", "held", "held", "holding"],
  ["受傷", "hurt", "hurt", "hurt", "hurting"],
  ["保持", "keep", "kept", "kept", "keeping"],
  ["知道", "know", "knew", "known", "knowing"],
  ["離開", "leave", "left", "left", "leaving"],
  ["借出", "lend", "lent", "lent", "lending"],
  ["讓", "let", "let", "let", "letting"],
  ["失去", "lose", "lost", "lost", "losing"],
  ["製造；做", "make", "made", "made", "making"],
  ["意思是", "mean", "meant", "meant", "meaning"],
  ["遇見", "meet", "met", "met", "meeting"],
  ["付款", "pay", "paid", "paid", "paying"],
  ["放", "put", "put", "put", "putting"],
  ["閱讀", "read", "read", "read", "reading"],
  ["騎", "ride", "rode", "ridden", "riding"],
  ["響鈴；打電話", "ring", "rang", "rung", "ringing"],
  ["跑", "run", "ran", "run", "running"],
  ["說", "say", "said", "said", "saying"],
  ["看見", "see", "saw", "seen", "seeing"],
  ["出售", "sell", "sold", "sold", "selling"],
  ["發送", "send", "sent", "sent", "sending"],
  ["設定；放置", "set", "set", "set", "setting"],
  ["搖動", "shake", "shook", "shaken", "shaking"],
  ["展示", "show", "showed", "shown", "showing"],
  ["關上", "shut", "shut", "shut", "shutting"],
  ["唱歌", "sing", "sang", "sung", "singing"],
  ["坐", "sit", "sat", "sat", "sitting"],
  ["睡覺", "sleep", "slept", "slept", "sleeping"],
  ["說話", "speak", "spoke", "spoken", "speaking"],
  ["花費", "spend", "spent", "spent", "spending"],
  ["站立", "stand", "stood", "stood", "standing"],
  ["偷", "steal", "stole", "stolen", "stealing"],
  ["黏住", "stick", "stuck", "stuck", "sticking"],
  ["游泳", "swim", "swam", "swum", "swimming"],
  ["拿；帶走", "take", "took", "taken", "taking"],
  ["教", "teach", "taught", "taught", "teaching"],
  ["告訴", "tell", "told", "told", "telling"],
  ["想；認為", "think", "thought", "thought", "thinking"],
  ["扔", "throw", "threw", "thrown", "throwing"],
  ["理解", "understand", "understood", "understood", "understanding"],
  ["醒來", "wake", "woke", "woken", "waking"],
  ["穿著", "wear", "wore", "worn", "wearing"],
  ["贏", "win", "won", "won", "winning"],
  ["寫", "write", "wrote", "written", "writing"],
  ["回答", "answer", "answered", "answered", "answering"],
  ["到達", "arrive", "arrived", "arrived", "arriving"],
  ["問", "ask", "asked", "asked", "asking"],
  ["相信", "believe", "believed", "believed", "believing"],
  ["借入", "borrow", "borrowed", "borrowed", "borrowing"],
  ["打電話；叫", "call", "called", "called", "calling"],
  ["攜帶", "carry", "carried", "carried", "carrying"],
  ["改變", "change", "changed", "changed", "changing"],
  ["檢查", "check", "checked", "checked", "checking"],
  ["打掃", "clean", "cleaned", "cleaned", "cleaning"],
  ["關閉", "close", "closed", "closed", "closing"],
  ["煮", "cook", "cooked", "cooked", "cooking"],
  ["哭", "cry", "cried", "cried", "crying"],
  ["跳舞", "dance", "danced", "danced", "dancing"],
  ["掉下", "drop", "dropped", "dropped", "dropping"],
  ["享受", "enjoy", "enjoyed", "enjoyed", "enjoying"],
  ["幫助", "help", "helped", "helped", "helping"],
  ["跳", "jump", "jumped", "jumped", "jumping"],
  ["喜歡", "like", "liked", "liked", "liking"],
  ["聆聽", "listen", "listened", "listened", "listening"],
  ["居住", "live", "lived", "lived", "living"],
  ["看", "look", "looked", "looked", "looking"],
  ["玩", "play", "played", "played", "playing"],
  ["觀看", "watch", "watched", "watched", "watching"],
  ["行走", "walk", "walked", "walked", "walking"]
].map(makeVerbTableQuestion);

const LESSON1_ID = "lesson1";
const LESSON2_ID = "lesson2";
const QUIZ1_ID = "quiz1";
const SENTENCE_UNDERLINE_ID = "sentence-underline";
const PRONOUN_MATCH_ID = "pronoun-match";
const PRONOUN_SENTENCE_ID = "pronoun-sentence";
const COUNTABLE_NOUN_ID = "countable-nouns";
const NOUN_CATEGORY_ID = "noun-category";
const MODAL_VERB_ID = "modal-verb";
const ADJECTIVE_ID = "adjective-lesson";
const ADVERB_ID = "adverb-lesson";
const TENSE_ID = "tenses";
const VERB_TABLE_ID = "verb-table";
const HAVE_USAGE_ID = "have-usage";
const LESSON_PROGRESS_KEYS = {
  [LESSON1_ID]: "basic_grammar_lesson_01_progress_v2",
  [LESSON2_ID]: "basic_grammar_lesson_02_progress_v1",
  [QUIZ1_ID]: "basic_grammar_quiz_01_progress_v1",
  [SENTENCE_UNDERLINE_ID]: "basic_grammar_sentence_underline_progress_v1",
  [PRONOUN_MATCH_ID]: "basic_grammar_pronoun_match_progress_v1",
  [PRONOUN_SENTENCE_ID]: "basic_grammar_pronoun_sentence_progress_v1",
  [COUNTABLE_NOUN_ID]: "basic_grammar_countable_nouns_progress_v1",
  [NOUN_CATEGORY_ID]: "basic_grammar_noun_category_progress_v1",
  [MODAL_VERB_ID]: "basic_grammar_modal_verb_progress_v1",
  [ADJECTIVE_ID]: "basic_grammar_adjective_progress_v1",
  [ADVERB_ID]: "basic_grammar_adverb_progress_v1",
  [TENSE_ID]: "basic_grammar_tenses_progress_v1",
  [VERB_TABLE_ID]: "basic_grammar_verb_table_progress_v1",
  [HAVE_USAGE_ID]: "basic_grammar_have_usage_progress_v1"
};
const LESSONS = {
  [LESSON1_ID]: {
    id: LESSON1_ID,
    kicker: "Lesson 01",
    title: "分辨句子是否有主動動詞",
    questions: QUESTIONS
  },
  [LESSON2_ID]: {
    id: LESSON2_ID,
    kicker: "Lesson 02",
    title: "一句句子必須只有一個動詞",
    questions: VERB_COUNT_QUESTIONS
  },
  [QUIZ1_ID]: {
    id: QUIZ1_ID,
    kicker: "Quiz 1",
    title: "重組英文句子",
    questions: SENTENCE_BUILD_QUESTIONS
  },
  [SENTENCE_UNDERLINE_ID]: {
    id: SENTENCE_UNDERLINE_ID,
    kicker: "Lesson 03",
    title: "何謂句子",
    questions: SENTENCE_UNDERLINE_QUESTIONS
  },
  [PRONOUN_MATCH_ID]: {
    id: PRONOUN_MATCH_ID,
    kicker: "Lesson 04",
    title: "代名詞",
    questions: PRONOUN_MATCH_QUESTIONS
  },
  [PRONOUN_SENTENCE_ID]: {
    id: PRONOUN_SENTENCE_ID,
    kicker: "Lesson 05",
    title: "代名詞句子 MC",
    questions: PRONOUN_SENTENCE_QUESTION_BANK
  },
  [COUNTABLE_NOUN_ID]: {
    id: COUNTABLE_NOUN_ID,
    kicker: "Lesson 06",
    title: "可數名詞的使用要點",
    questions: COUNTABLE_NOUN_QUESTIONS
  },
  [NOUN_CATEGORY_ID]: {
    id: NOUN_CATEGORY_ID,
    kicker: "Lesson 07",
    title: "名詞的類別",
    questions: NOUN_CATEGORY_QUESTIONS
  },
  [MODAL_VERB_ID]: {
    id: MODAL_VERB_ID,
    kicker: "Lesson 08",
    title: "Modal Verb 的要訣",
    questions: MODAL_VERB_QUESTIONS
  },
  [ADJECTIVE_ID]: {
    id: ADJECTIVE_ID,
    kicker: "Lesson 09",
    title: "Adjective 形容詞",
    questions: ADJECTIVE_QUESTIONS
  },
  [ADVERB_ID]: {
    id: ADVERB_ID,
    kicker: "Lesson 10",
    title: "Adverb 副詞",
    questions: ADVERB_QUESTIONS
  },
  [TENSE_ID]: {
    id: TENSE_ID,
    kicker: "Lesson 11",
    title: "Tenses 時態分辨",
    questions: TENSE_QUESTIONS
  },
  [VERB_TABLE_ID]: {
    id: VERB_TABLE_ID,
    kicker: "Lesson 12",
    title: "Verb Table 動詞四式",
    questions: VERB_TABLE_QUESTIONS
  },
  [HAVE_USAGE_ID]: {
    id: HAVE_USAGE_ID,
    kicker: "Lesson 13",
    title: "「有」的主要用法",
    questions: HAVE_USAGE_QUESTIONS
  }
};

  return {
    QUESTIONS,
    VERB_COUNT_QUESTIONS,
    SENTENCE_BUILD_QUESTIONS,
    SENTENCE_UNDERLINE_QUESTIONS,
    PRONOUN_CATEGORIES,
    PRONOUN_MATCH_QUESTIONS,
    PRONOUN_SENTENCE_QUESTIONS,
    PRONOUN_SENTENCE_SLOT_TYPES,
    PRONOUN_SENTENCE_QUESTION_BANK,
    PRONOUN_SENTENCE_ROLE_LABELS,
    PRONOUN_SENTENCE_FORMS,
    COUNTABLE_NOUN_QUESTIONS,
    NOUN_CATEGORY_QUESTIONS,
    MODAL_VERB_QUESTIONS,
    ADJECTIVE_QUESTIONS,
    ADVERB_QUESTIONS,
    TENSE_LABELS,
    TENSE_OPTION_ROWS,
    TENSE_QUESTIONS,
    HAVE_USAGE_LABELS,
    HAVE_USAGE_OPTION_ROWS,
    HAVE_USAGE_QUESTIONS,
    VERB_TABLE_FIELDS,
    VERB_TABLE_QUESTIONS,
    LESSON1_ID,
    LESSON2_ID,
    QUIZ1_ID,
    SENTENCE_UNDERLINE_ID,
    PRONOUN_MATCH_ID,
    PRONOUN_SENTENCE_ID,
    COUNTABLE_NOUN_ID,
    NOUN_CATEGORY_ID,
    MODAL_VERB_ID,
    ADJECTIVE_ID,
    ADVERB_ID,
    TENSE_ID,
    VERB_TABLE_ID,
    HAVE_USAGE_ID,
    LESSON_PROGRESS_KEYS,
    LESSONS,
    capitalizeWord,
    createCountableNounQuestions,
    createNounCategoryQuestions,
    createModalVerbQuestions,
    createAdjectiveQuestions,
    createAdverbQuestions,
    createTenseQuestions,
    createHaveUsageQuestions
  };
});
