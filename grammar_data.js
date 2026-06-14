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
  { id: "v10", type: "action", zh: "妹妹畫畫。", english: "My younger sister draws pictures.", note: "「畫」是動作動詞。" },
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
  return kind === "be" ? "be 動詞" : `${kind}動詞`;
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
  return makeVerbCountQuestion(
    sentence,
    zh,
    false,
    0,
    [],
    `${reason}，所以句子沒有動詞。`,
    correction
  );
}

function twoVerbs(sentence, zh, verbIndexes, beVerb, mainVerb, kind, correctionSentence) {
  return makeVerbCountQuestion(
    sentence,
    zh,
    false,
    2,
    verbIndexes,
    `${beVerb} 是 be 動詞，${mainVerb} 是${verbKindText(kind)}，所以句子有 2 個動詞。`,
    `${beVerb} 是多餘的，應寫 ${correctionSentence}`
  );
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
  oneVerb("I swam yesterday.", "我昨天游泳。", 1, "swam", "過去式"),
  oneVerb("He ate lunch.", "他吃了午餐。", 1, "ate", "過去式"),
  oneVerb("They came early.", "他們早到了。", 1, "came", "過去式"),
  oneVerb("We saw birds.", "我們看見鳥。", 1, "saw", "過去式"),
  oneVerb("She made a cake.", "她做了一個蛋糕。", 1, "made", "過去式"),
  oneVerb("You opened the door.", "你打開了門。", 1, "opened", "過去式"),
  oneVerb("I am happy.", "我很開心。", 1, "am", "be"),
  oneVerb("You are late.", "你遲到了。", 1, "are", "be"),
  oneVerb("He is tired.", "他很累。", 1, "is", "be"),
  oneVerb("She is ready.", "她準備好了。", 1, "is", "be"),
  oneVerb("They are kind.", "他們很友善。", 1, "are", "be"),
  oneVerb("We are at school.", "我們在學校。", 1, "are", "be"),
  oneVerb("The apple is red.", "蘋果是紅色的。", 2, "is", "be"),
  oneVerb("The boys are noisy.", "男孩們很嘈。", 2, "are", "be"),
  oneVerb("I am reading now.", "我現在正在閱讀。", 1, "am", "be"),
  oneVerb("They are playing football.", "他們正在踢足球。", 1, "are", "be"),
  oneVerb("She is drawing.", "她正在畫畫。", 1, "is", "be"),
  oneVerb("We are eating lunch.", "我們正在吃午餐。", 1, "are", "be"),
  oneVerb("Tom is running.", "Tom 正在跑步。", 1, "is", "be"),
  oneVerb("Mary is singing.", "Mary 正在唱歌。", 1, "is", "be"),
  oneVerb("The dog is sleeping.", "狗正在睡覺。", 2, "is", "be"),

  zeroVerb("I swimming every day.", "我每天游泳。", "swimming 是 ING，不當動詞", "正確寫法：I swim every day."),
  zeroVerb("You going home.", "你回家。", "going 是 ING，不當動詞", "正確寫法：You go home."),
  zeroVerb("He playing football.", "他踢足球。", "playing 是 ING，不當動詞", "正確寫法：He plays football."),
  zeroVerb("She reading books.", "她看書。", "reading 是 ING，不當動詞", "正確寫法：She reads books."),
  zeroVerb("We singing songs.", "我們唱歌。", "singing 是 ING，不當動詞", "正確寫法：We sing songs."),
  zeroVerb("They running fast.", "他們跑得快。", "running 是 ING，不當動詞", "正確寫法：They run fast."),
  zeroVerb("Tom cooking dinner.", "Tom 煮晚餐。", "cooking 是 ING，不當動詞", "正確寫法：Tom cooks dinner."),
  zeroVerb("Mary writing words.", "Mary 寫字。", "writing 是 ING，不當動詞", "正確寫法：Mary writes words."),
  zeroVerb("Dad driving slowly.", "爸爸慢慢開車。", "driving 是 ING，不當動詞", "正確寫法：Dad drives slowly."),
  zeroVerb("Mum washing dishes.", "媽媽洗碗。", "washing 是 ING，不當動詞", "正確寫法：Mum washes dishes."),
  zeroVerb("The dog sleeping.", "狗睡覺。", "sleeping 是 ING，不當動詞", "正確寫法：The dog sleeps."),
  zeroVerb("The cat jumping.", "貓跳。", "jumping 是 ING，不當動詞", "正確寫法：The cat jumps."),
  zeroVerb("I happy.", "我很開心。", "happy 是形容詞", "正確寫法：I am happy."),
  zeroVerb("You late.", "你遲到了。", "late 是形容詞", "正確寫法：You are late."),
  zeroVerb("He tired.", "他很累。", "tired 是形容詞", "正確寫法：He is tired."),
  zeroVerb("She ready.", "她準備好了。", "ready 是形容詞", "正確寫法：She is ready."),
  zeroVerb("They kind.", "他們很友善。", "kind 是形容詞", "正確寫法：They are kind."),
  zeroVerb("We at school.", "我們在學校。", "at school 不是動詞", "正確寫法：We are at school."),
  zeroVerb("The apple red.", "蘋果是紅色的。", "red 是形容詞", "正確寫法：The apple is red."),
  zeroVerb("The boys noisy.", "男孩們很嘈。", "noisy 是形容詞", "正確寫法：The boys are noisy."),
  zeroVerb("I eaten breakfast.", "我吃了早餐。", "eaten 是 PP，不當動詞", "正確寫法：I ate breakfast."),
  zeroVerb("He eaten lunch.", "他吃了午餐。", "eaten 是 PP，不當動詞", "正確寫法：He ate lunch."),
  zeroVerb("They gone home.", "他們回家了。", "gone 是 PP，不當動詞", "正確寫法：They went home."),
  zeroVerb("She seen birds.", "她看見鳥。", "seen 是 PP，不當動詞", "正確寫法：She saw birds."),
  zeroVerb("We been there.", "我們去過那裡。", "been 是 PP，不當動詞", "正確寫法：We went there."),
  zeroVerb("Tom taken a book.", "Tom 拿了一本書。", "taken 是 PP，不當動詞", "正確寫法：Tom took a book."),
  zeroVerb("Mary written words.", "Mary 寫了字。", "written 是 PP，不當動詞", "正確寫法：Mary wrote words."),
  zeroVerb("The cake eaten.", "蛋糕被吃了。", "eaten 是 PP，不當動詞", "正確寫法：The cake is eaten."),
  zeroVerb("My bag gone.", "我的書包不見了。", "gone 是 PP，不當動詞", "正確寫法：My bag is gone."),
  zeroVerb("The children swimming now.", "小朋友們正在游泳。", "swimming 是 ING，不當動詞", "正確寫法：The children are swimming now."),
  zeroVerb("The baby crying.", "寶寶正在哭。", "crying 是 ING，不當動詞", "正確寫法：The baby is crying."),
  zeroVerb("The birds flying.", "鳥正在飛。", "flying 是 ING，不當動詞", "正確寫法：The birds are flying."),
  zeroVerb("I will late.", "我將會遲到。", "will 不是這課要數的現在式/過去式動詞，late 是形容詞", "正確寫法：I will be late."),
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
  twoVerbs("I am swam yesterday.", "我昨天游泳。", [1, 2], "am", "swam", "過去式", "I swam yesterday."),
  twoVerbs("He is ate lunch.", "他吃了午餐。", [1, 2], "is", "ate", "過去式", "He ate lunch."),
  twoVerbs("They are came early.", "他們早到了。", [1, 2], "are", "came", "過去式", "They came early."),
  twoVerbs("We are saw birds.", "我們看見鳥。", [1, 2], "are", "saw", "過去式", "We saw birds."),
  twoVerbs("She is made a cake.", "她做了一個蛋糕。", [1, 2], "is", "made", "過去式", "She made a cake."),
  twoVerbs("You are opened the door.", "你打開了門。", [1, 2], "are", "opened", "過去式", "You opened the door."),
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

function makePronounSentenceQuestion({ id, sentence, answer, choices, explanation }) {
  return {
    id,
    type: "pronoun-sentence",
    sentence,
    answer,
    choices,
    slotType: "",
    explanation
  };
}

const PRONOUN_SENTENCE_QUESTIONS = [
  { id: "ps001", sentence: "___ is a doctor.", answer: "He", choices: ["He", "him", "We", "His"], explanation: "空格在 is 前面，是主語位置，所以要用主語代名詞 He。" },
  { id: "ps002", sentence: "___ am happy today.", answer: "I", choices: ["I", "me", "my", "mine"], explanation: "空格在 am 前面，是主語位置，所以要用主語代名詞 I。" },
  { id: "ps003", sentence: "___ are my friends.", answer: "They", choices: ["They", "them", "their", "theirs"], explanation: "空格在 are 前面，是主語位置，所以要用主語代名詞 They。" },
  { id: "ps004", sentence: "___ are in the classroom.", answer: "We", choices: ["We", "us", "our", "ours"], explanation: "空格在 are 前面，是主語位置，所以要用主語代名詞 We。" },
  { id: "ps005", sentence: "___ is under the table.", answer: "It", choices: ["It", "it", "its", "They"], explanation: "空格在 is 前面，是主語位置，所以要用主語代名詞 It。" },
  { id: "ps006", sentence: "___ is my sister.", answer: "She", choices: ["She", "her", "hers", "their"], explanation: "空格在 is 前面，是主語位置，所以要用主語代名詞 She。" },
  { id: "ps007", sentence: "___ are very kind.", answer: "You", choices: ["You", "your", "yours", "us"], explanation: "空格在 are 前面，是主語位置，所以要用主語代名詞 You。" },
  { id: "ps008", sentence: "___ can swim well.", answer: "We", choices: ["We", "us", "our", "ours"], explanation: "空格在 can 前面，是主語位置，所以要用主語代名詞 We。" },
  { id: "ps009", sentence: "___ has a red bag.", answer: "He", choices: ["He", "him", "his", "they"], explanation: "空格在 has 前面，是主語位置，所以要用主語代名詞 He。" },
  { id: "ps010", sentence: "___ like English.", answer: "They", choices: ["They", "them", "their", "theirs"], explanation: "空格在 like 前面，是主語位置，所以要用主語代名詞 They。" },
  { id: "ps011", sentence: "___ goes to school by bus.", answer: "She", choices: ["She", "her", "hers", "we"], explanation: "空格在 goes 前面，是主語位置，所以要用主語代名詞 She。" },
  { id: "ps012", sentence: "___ are ready now.", answer: "You", choices: ["You", "your", "yours", "me"], explanation: "空格在 are 前面，是主語位置，所以要用主語代名詞 You。" },
  { id: "ps013", sentence: "___ is a small cat.", answer: "It", choices: ["It", "it", "its", "them"], explanation: "空格在 is 前面，是主語位置，所以要用主語代名詞 It。" },
  { id: "ps014", sentence: "Tom likes ___.", answer: "her", choices: ["she", "her", "their", "We"], explanation: "空格在 likes 後面，是非主語位置，所以要用非主語代名詞 her。" },
  { id: "ps015", sentence: "Mary helps ___.", answer: "him", choices: ["he", "him", "their", "They"], explanation: "空格在 helps 後面，是非主語位置，所以要用非主語代名詞 him。" },
  { id: "ps016", sentence: "The teacher sees ___.", answer: "us", choices: ["We", "us", "our", "They"], explanation: "空格在 sees 後面，是非主語位置，所以要用非主語代名詞 us。" },
  { id: "ps017", sentence: "This gift is for ___.", answer: "you", choices: ["you", "your", "we", "They"], explanation: "空格在 for 後面，是非主語位置，所以要用非主語代名詞 you。" },
  { id: "ps018", sentence: "Mum talks to ___.", answer: "me", choices: ["I", "me", "my", "We"], explanation: "空格在 to 後面，是非主語位置，所以要用非主語代名詞 me。" },
  { id: "ps019", sentence: "Dad calls ___.", answer: "them", choices: ["They", "them", "their", "We"], explanation: "空格在 calls 後面，是非主語位置，所以要用非主語代名詞 them。" },
  { id: "ps020", sentence: "I sit with ___.", answer: "him", choices: ["he", "him", "their", "They"], explanation: "空格在 with 後面，是非主語位置，所以要用非主語代名詞 him。" },
  { id: "ps021", sentence: "Please listen to ___.", answer: "me", choices: ["I", "me", "my", "We"], explanation: "空格在 to 後面，是非主語位置，所以要用非主語代名詞 me。" },
  { id: "ps022", sentence: "The dog follows ___.", answer: "us", choices: ["We", "us", "our", "They"], explanation: "空格在 follows 後面，是非主語位置，所以要用非主語代名詞 us。" },
  { id: "ps023", sentence: "Sam waits for ___.", answer: "her", choices: ["she", "her", "their", "We"], explanation: "空格在 for 後面，是非主語位置，所以要用非主語代名詞 her。" },
  { id: "ps024", sentence: "Anna plays with ___.", answer: "them", choices: ["They", "them", "their", "We"], explanation: "空格在 with 後面，是非主語位置，所以要用非主語代名詞 them。" },
  { id: "ps025", sentence: "The noise scares ___.", answer: "me", choices: ["I", "me", "my", "We"], explanation: "空格在 scares 後面，是非主語位置，所以要用非主語代名詞 me。" },
  { id: "ps026", sentence: "This is ___ book.", answer: "my", choices: ["I", "me", "my", "mine"], explanation: "空格後面有名詞 book，表示「我的」，所以要用 my。" },
  { id: "ps027", sentence: "That is ___ pencil.", answer: "your", choices: ["you", "your", "yours", "we"], explanation: "空格後面有名詞 pencil，表示「你的」，所以要用 your。" },
  { id: "ps028", sentence: "He is ___ brother.", answer: "her", choices: ["she", "her", "hers", "him"], explanation: "空格後面有名詞 brother，表示「她的」，所以要用 her。" },
  { id: "ps029", sentence: "My mother is ___ sister.", answer: "your", choices: ["theirs", "it", "we", "your"], explanation: "空格後面有名詞 sister，表示「你的」，所以要用 your。" },
  { id: "ps030", sentence: "They love ___ school.", answer: "their", choices: ["They", "them", "their", "theirs"], explanation: "空格後面有名詞 school，表示「他們的」，所以要用 their。" },
  { id: "ps031", sentence: "We clean ___ classroom.", answer: "our", choices: ["We", "us", "our", "ours"], explanation: "空格後面有名詞 classroom，表示「我們的」，所以要用 our。" },
  { id: "ps032", sentence: "The dog eats ___ food.", answer: "its", choices: ["It", "it", "its", "they"], explanation: "空格後面有名詞 food，表示「它的」，所以要用 its。" },
  { id: "ps033", sentence: "Tom brings ___ bag.", answer: "his", choices: ["he", "him", "his", "hers"], explanation: "空格後面有名詞 bag，表示「他的」，所以要用 his。" },
  { id: "ps034", sentence: "Mary opens ___ lunch box.", answer: "her", choices: ["she", "her", "hers", "him"], explanation: "空格後面有名詞 lunch box，表示「她的」，所以要用 her。" },
  { id: "ps035", sentence: "I like ___ new shoes.", answer: "your", choices: ["you", "your", "yours", "them"], explanation: "空格後面有名詞 shoes，表示「你的」，所以要用 your。" },
  { id: "ps036", sentence: "She reads ___ book.", answer: "her", choices: ["she", "her", "hers", "they"], explanation: "空格後面有名詞 book，表示「她的」，所以要用 her。" },
  { id: "ps037", sentence: "We visit ___ grandparents.", answer: "our", choices: ["We", "us", "our", "ours"], explanation: "空格後面有名詞 grandparents，表示「我們的」，所以要用 our。" },
  { id: "ps038", sentence: "The students raise ___ hands.", answer: "their", choices: ["They", "them", "their", "theirs"], explanation: "空格後面有名詞 hands，表示「他們的」，所以要用 their。" },
  { id: "ps039", sentence: "This book is ___.", answer: "mine", choices: ["I", "me", "my", "mine"], explanation: "空格後面沒有名詞，表示「我的東西」，所以要用 mine。" },
  { id: "ps040", sentence: "The blue pen is ___.", answer: "yours", choices: ["you", "your", "yours", "we"], explanation: "空格後面沒有名詞，表示「你的東西」，所以要用 yours。" },
  { id: "ps041", sentence: "The red bag is ___.", answer: "his", choices: ["he", "him", "his", "her"], explanation: "空格後面沒有名詞，表示「他的東西」，所以要用 his。" },
  { id: "ps042", sentence: "The pink ruler is ___.", answer: "hers", choices: ["she", "her", "hers", "him"], explanation: "空格後面沒有名詞，表示「她的東西」，所以要用 hers。" },
  { id: "ps043", sentence: "This classroom is ___.", answer: "ours", choices: ["We", "us", "our", "ours"], explanation: "空格後面沒有名詞，表示「我們的東西」，所以要用 ours。" },
  { id: "ps044", sentence: "Those toys are ___.", answer: "theirs", choices: ["They", "them", "their", "theirs"], explanation: "空格後面沒有名詞，表示「他們的東西」，所以要用 theirs。" },
  { id: "ps045", sentence: "This little bed is ___.", answer: "its", choices: ["It", "it", "its", "they"], explanation: "空格後面沒有名詞，表示「它的東西」，所以要用 its。" },
  { id: "ps046", sentence: "The lunch is ___.", answer: "mine", choices: ["I", "me", "my", "mine"], explanation: "空格後面沒有名詞，表示「我的東西」，所以要用 mine。" },
  { id: "ps047", sentence: "The football is ___.", answer: "ours", choices: ["We", "us", "our", "ours"], explanation: "空格後面沒有名詞，表示「我們的東西」，所以要用 ours。" },
  { id: "ps048", sentence: "The pencils are ___.", answer: "theirs", choices: ["They", "them", "their", "theirs"], explanation: "空格後面沒有名詞，表示「他們的東西」，所以要用 theirs。" },
  { id: "ps049", sentence: "The seat is ___.", answer: "his", choices: ["he", "him", "his", "her"], explanation: "空格後面沒有名詞，表示「他的東西」，所以要用 his。" },
  { id: "ps050", sentence: "The umbrella is ___.", answer: "hers", choices: ["she", "her", "hers", "him"], explanation: "空格後面沒有名詞，表示「她的東西」，所以要用 hers。" }
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

  const genericItems = [
    { zh: "蘋果是健康的。", cn: "蘋果", singular: "apple", plural: "Apples", adjective: "healthy" },
    { zh: "狗很可愛。", cn: "狗", singular: "dog", plural: "Dogs", adjective: "cute" },
    { zh: "貓很安靜。", cn: "貓", singular: "cat", plural: "Cats", adjective: "quiet" },
    { zh: "學生很忙。", cn: "學生", singular: "student", plural: "Students", adjective: "busy" },
    { zh: "老師很友善。", cn: "老師", singular: "teacher", plural: "Teachers", adjective: "kind" },
    { zh: "書很有用。", cn: "書", singular: "book", plural: "Books", adjective: "useful" },
    { zh: "汽車很昂貴。", cn: "汽車", singular: "car", plural: "Cars", adjective: "expensive" },
    { zh: "雀鳥很漂亮。", cn: "雀鳥", singular: "bird", plural: "Birds", adjective: "beautiful" },
    { zh: "香蕉很甜。", cn: "香蕉", singular: "banana", plural: "Bananas", adjective: "sweet" },
    { zh: "橙很多汁。", cn: "橙", singular: "orange", plural: "Oranges", adjective: "juicy" },
    { zh: "椅子很堅固。", cn: "椅子", singular: "chair", plural: "Chairs", adjective: "strong" },
    { zh: "電腦很有用。", cn: "電腦", singular: "computer", plural: "Computers", adjective: "useful" },
    { zh: "電話很昂貴。", cn: "電話", singular: "phone", plural: "Phones", adjective: "expensive" },
    { zh: "花很漂亮。", cn: "花", singular: "flower", plural: "Flowers", adjective: "beautiful" },
    { zh: "老虎很危險。", cn: "老虎", singular: "tiger", plural: "Tigers", adjective: "dangerous" },
    { zh: "大象很大。", cn: "大象", singular: "elephant", plural: "Elephants", adjective: "big" },
    { zh: "曲奇很甜。", cn: "曲奇", singular: "cookie", plural: "Cookies", adjective: "sweet" },
    { zh: "雞蛋很健康。", cn: "雞蛋", singular: "egg", plural: "Eggs", adjective: "healthy" },
    { zh: "玩具很好玩。", cn: "玩具", singular: "toy", plural: "Toys", adjective: "fun" },
    { zh: "鯊魚很危險。", cn: "鯊魚", singular: "shark", plural: "Sharks", adjective: "dangerous" }
  ];

  genericItems.forEach((item, index) => {
    const answer = `${item.plural} are ${item.adjective}.`;
    const isCorrect = index % 2 === 1;
    add({
      sentence: isCorrect ? answer : `${capitalizeWord(item.singular)} is ${item.adjective}.`,
      zh: item.zh,
      isCorrect,
      answer,
      explanation: `中文「${item.cn}」是泛指整個類別；${item.singular} 是可數名詞，預設用眾數 ${item.plural}，所以用 are。`
    });
  });

  [
    { sentence: "A dog is sleeping.", zh: "有一隻狗在睡覺。", answer: "A dog is sleeping.", item: "dog", article: "A", isCorrect: true },
    { sentence: "Dog is sleeping.", zh: "有一隻狗在睡覺。", answer: "A dog is sleeping.", item: "dog", article: "A", isCorrect: false },
    { sentence: "An apple is red.", zh: "有一個蘋果是紅色的。", answer: "An apple is red.", item: "apple", article: "An", isCorrect: true },
    { sentence: "Apple is red.", zh: "有一個蘋果是紅色的。", answer: "An apple is red.", item: "apple", article: "An", isCorrect: false },
    { sentence: "A student is reading.", zh: "有一個學生在閱讀。", answer: "A student is reading.", item: "student", article: "A", isCorrect: true },
    { sentence: "Student is reading.", zh: "有一個學生在閱讀。", answer: "A student is reading.", item: "student", article: "A", isCorrect: false },
    { sentence: "A teacher is busy.", zh: "有一位老師很忙。", answer: "A teacher is busy.", item: "teacher", article: "A", isCorrect: true },
    { sentence: "Teacher are busy.", zh: "有一位老師很忙。", answer: "A teacher is busy.", item: "teacher", article: "A", isCorrect: false },
    { sentence: "A cat is hungry.", zh: "有一隻貓很餓。", answer: "A cat is hungry.", item: "cat", article: "A", isCorrect: true },
    { sentence: "An cat is hungry.", zh: "有一隻貓很餓。", answer: "A cat is hungry.", item: "cat", article: "A", isCorrect: false },
    { sentence: "An orange is sweet.", zh: "有一個橙很甜。", answer: "An orange is sweet.", item: "orange", article: "An", isCorrect: true },
    { sentence: "A orange is sweet.", zh: "有一個橙很甜。", answer: "An orange is sweet.", item: "orange", article: "An", isCorrect: false },
    { sentence: "A bird is flying.", zh: "有一隻雀鳥在飛。", answer: "A bird is flying.", item: "bird", article: "A", isCorrect: true },
    { sentence: "Bird are flying.", zh: "有一隻雀鳥在飛。", answer: "A bird is flying.", item: "bird", article: "A", isCorrect: false },
    { sentence: "A book is useful.", zh: "有一本書很有用。", answer: "A book is useful.", item: "book", article: "A", isCorrect: true },
    { sentence: "Book is useful.", zh: "有一本書很有用。", answer: "A book is useful.", item: "book", article: "A", isCorrect: false },
    { sentence: "An egg is small.", zh: "有一隻雞蛋很小。", answer: "An egg is small.", item: "egg", article: "An", isCorrect: true },
    { sentence: "A egg is small.", zh: "有一隻雞蛋很小。", answer: "An egg is small.", item: "egg", article: "An", isCorrect: false },
    { sentence: "A flower is beautiful.", zh: "有一朵花很漂亮。", answer: "A flower is beautiful.", item: "flower", article: "A", isCorrect: true },
    { sentence: "Flower are beautiful.", zh: "有一朵花很漂亮。", answer: "A flower is beautiful.", item: "flower", article: "A", isCorrect: false }
  ].forEach((item) => add({
    sentence: item.sentence,
    zh: item.zh,
    isCorrect: item.isCorrect,
    answer: item.answer,
    explanation: `中文強調「只有一個/一隻」；${item.article} ${item.item} 是單數，所以用 is。`
  }));

  [
    { sentence: "The dog is cute.", zh: "這隻狗很可愛。", answer: "The dog is cute.", subject: "The dog", quantity: "指定一隻", be: "is", isCorrect: true },
    { sentence: "The dogs is barking.", zh: "那群狗在吠。", answer: "The dogs are barking.", subject: "The dogs", quantity: "指定一群", be: "are", isCorrect: false },
    { sentence: "The apple is red.", zh: "這個蘋果是紅色的。", answer: "The apple is red.", subject: "The apple", quantity: "指定一個", be: "is", isCorrect: true },
    { sentence: "The apples is fresh.", zh: "那些蘋果很新鮮。", answer: "The apples are fresh.", subject: "The apples", quantity: "指定一堆", be: "are", isCorrect: false },
    { sentence: "The student is late.", zh: "這個學生遲到了。", answer: "The student is late.", subject: "The student", quantity: "指定一個", be: "is", isCorrect: true },
    { sentence: "The students is noisy.", zh: "那些學生很嘈。", answer: "The students are noisy.", subject: "The students", quantity: "指定一班", be: "are", isCorrect: false },
    { sentence: "The book is new.", zh: "這本書很新。", answer: "The book is new.", subject: "The book", quantity: "指定一本", be: "is", isCorrect: true },
    { sentence: "The books is heavy.", zh: "那些書很重。", answer: "The books are heavy.", subject: "The books", quantity: "指定多本", be: "are", isCorrect: false },
    { sentence: "The cat is sleeping.", zh: "這隻貓在睡覺。", answer: "The cat is sleeping.", subject: "The cat", quantity: "指定一隻", be: "is", isCorrect: true },
    { sentence: "The cats is hungry.", zh: "那些貓很餓。", answer: "The cats are hungry.", subject: "The cats", quantity: "指定多隻", be: "are", isCorrect: false },
    { sentence: "The pencil is sharp.", zh: "這支鉛筆很尖。", answer: "The pencil is sharp.", subject: "The pencil", quantity: "指定一支", be: "is", isCorrect: true },
    { sentence: "The pencils is sharp.", zh: "那些鉛筆很尖。", answer: "The pencils are sharp.", subject: "The pencils", quantity: "指定多支", be: "are", isCorrect: false },
    { sentence: "The birds are flying.", zh: "那些雀鳥在飛。", answer: "The birds are flying.", subject: "The birds", quantity: "指定多隻", be: "are", isCorrect: true },
    { sentence: "The bird are flying.", zh: "這隻雀鳥在飛。", answer: "The bird is flying.", subject: "The bird", quantity: "指定一隻", be: "is", isCorrect: false },
    { sentence: "The flowers are beautiful.", zh: "那些花很漂亮。", answer: "The flowers are beautiful.", subject: "The flowers", quantity: "指定多朵", be: "are", isCorrect: true },
    { sentence: "The flower are beautiful.", zh: "這朵花很漂亮。", answer: "The flower is beautiful.", subject: "The flower", quantity: "指定一朵", be: "is", isCorrect: false },
    { sentence: "The car is fast.", zh: "這架車很快。", answer: "The car is fast.", subject: "The car", quantity: "指定一架", be: "is", isCorrect: true },
    { sentence: "The cars is fast.", zh: "那些車很快。", answer: "The cars are fast.", subject: "The cars", quantity: "指定多架", be: "are", isCorrect: false },
    { sentence: "The chairs are clean.", zh: "那些椅子很乾淨。", answer: "The chairs are clean.", subject: "The chairs", quantity: "指定多張", be: "are", isCorrect: true },
    { sentence: "The chair are clean.", zh: "這張椅子很乾淨。", answer: "The chair is clean.", subject: "The chair", quantity: "指定一張", be: "is", isCorrect: false }
  ].forEach((item) => add({
    sentence: item.sentence,
    zh: item.zh,
    isCorrect: item.isCorrect,
    answer: item.answer,
    explanation: `the 表示指定；${item.subject} 是${item.quantity}，所以用 ${item.be}。`
  }));

  [
    { sentence: "Water is important.", zh: "水很重要。", answer: "Water is important.", noun: "water", isCorrect: true },
    { sentence: "Waters are important.", zh: "水很重要。", answer: "Water is important.", noun: "water", isCorrect: false },
    { sentence: "Homework is difficult.", zh: "功課很難。", answer: "Homework is difficult.", noun: "homework", isCorrect: true },
    { sentence: "Homeworks are difficult.", zh: "功課很難。", answer: "Homework is difficult.", noun: "homework", isCorrect: false },
    { sentence: "Information is useful.", zh: "資訊很有用。", answer: "Information is useful.", noun: "information", isCorrect: true },
    { sentence: "An information is useful.", zh: "資訊很有用。", answer: "Information is useful.", noun: "information", isCorrect: false },
    { sentence: "Knowledge is power.", zh: "知識就是力量。", answer: "Knowledge is power.", noun: "knowledge", isCorrect: true },
    { sentence: "Knowledges are important.", zh: "知識很重要。", answer: "Knowledge is important.", noun: "knowledge", isCorrect: false },
    { sentence: "Equipment is expensive.", zh: "器材很昂貴。", answer: "Equipment is expensive.", noun: "equipment", isCorrect: true },
    { sentence: "Equipments are expensive.", zh: "器材很昂貴。", answer: "Equipment is expensive.", noun: "equipment", isCorrect: false },
    { sentence: "Music is relaxing.", zh: "音樂令人放鬆。", answer: "Music is relaxing.", noun: "music", isCorrect: true },
    { sentence: "A music is relaxing.", zh: "音樂令人放鬆。", answer: "Music is relaxing.", noun: "music", isCorrect: false },
    { sentence: "Rice is tasty.", zh: "米飯很好吃。", answer: "Rice is tasty.", noun: "rice", isCorrect: true },
    { sentence: "Rices are tasty.", zh: "米飯很好吃。", answer: "Rice is tasty.", noun: "rice", isCorrect: false },
    { sentence: "Milk is healthy.", zh: "牛奶很健康。", answer: "Milk is healthy.", noun: "milk", isCorrect: true },
    { sentence: "Milks are healthy.", zh: "牛奶很健康。", answer: "Milk is healthy.", noun: "milk", isCorrect: false },
    { sentence: "Bread is fresh.", zh: "麵包很新鮮。", answer: "Bread is fresh.", noun: "bread", isCorrect: true },
    { sentence: "Breads are fresh.", zh: "麵包很新鮮。", answer: "Bread is fresh.", noun: "bread", isCorrect: false },
    { sentence: "Money is important.", zh: "金錢很重要。", answer: "Money is important.", noun: "money", isCorrect: true },
    { sentence: "Moneys are important.", zh: "金錢很重要。", answer: "Money is important.", noun: "money", isCorrect: false }
  ].forEach((item) => add({
    sentence: item.sentence,
    zh: item.zh,
    isCorrect: item.isCorrect,
    answer: item.answer,
    explanation: `${item.noun} 是不可數名詞，沒有 s，也不用 a/an，當單一概念用 is。`
  }));

  [
    { sentence: "A banana is yellow.", zh: "有一隻香蕉是黃色的。", answer: "A banana is yellow.", explanation: "中文強調一隻香蕉；A banana 是單數，所以用 is。", isCorrect: true },
    { sentence: "An banana is yellow.", zh: "有一隻香蕉是黃色的。", answer: "A banana is yellow.", explanation: "banana 不是母音開頭；只有一隻時要用 A banana，後面用 is。", isCorrect: false },
    { sentence: "Bananas are yellow.", zh: "香蕉是黃色的。", answer: "Bananas are yellow.", explanation: "中文「香蕉」是泛指整個類別；banana 是可數名詞，預設用眾數 Bananas，所以用 are。", isCorrect: true },
    { sentence: "Banana is yellow.", zh: "香蕉是黃色的。", answer: "Bananas are yellow.", explanation: "中文「香蕉」是泛指整個類別；banana 是可數名詞，預設用眾數 Bananas，所以用 are。", isCorrect: false },
    { sentence: "The banana is yellow.", zh: "這隻香蕉是黃色的。", answer: "The banana is yellow.", explanation: "the 表示指定；The banana 是指定一隻，所以用 is。", isCorrect: true },
    { sentence: "The bananas is yellow.", zh: "那些香蕉是黃色的。", answer: "The bananas are yellow.", explanation: "the 表示指定；The bananas 是指定多隻，所以用 are。", isCorrect: false },
    { sentence: "Ideas are powerful.", zh: "想法很有力量。", answer: "Ideas are powerful.", explanation: "中文「想法」是泛指整個類別；idea 是可數名詞，預設用眾數 Ideas，所以用 are。", isCorrect: true },
    { sentence: "Idea is powerful.", zh: "想法很有力量。", answer: "Ideas are powerful.", explanation: "中文「想法」是泛指整個類別；idea 是可數名詞，預設用眾數 Ideas，所以用 are。", isCorrect: false },
    { sentence: "A desk is clean.", zh: "有一張書桌很乾淨。", answer: "A desk is clean.", explanation: "中文強調一張書桌；A desk 是單數，所以用 is。", isCorrect: true },
    { sentence: "Desk is clean.", zh: "有一張書桌很乾淨。", answer: "A desk is clean.", explanation: "中文強調一張書桌；desk 是可數名詞，單數前面要加 A，後面用 is。", isCorrect: false },
    { sentence: "The desks are clean.", zh: "那些書桌很乾淨。", answer: "The desks are clean.", explanation: "the 表示指定；The desks 是指定多張，所以用 are。", isCorrect: true },
    { sentence: "The desk are clean.", zh: "這張書桌很乾淨。", answer: "The desk is clean.", explanation: "the 表示指定；The desk 是指定一張，所以用 is。", isCorrect: false },
    { sentence: "Sugar is sweet.", zh: "糖很甜。", answer: "Sugar is sweet.", explanation: "sugar 是不可數名詞，沒有 s，也不用 a/an，當單一概念用 is。", isCorrect: true },
    { sentence: "Sugars are sweet.", zh: "糖很甜。", answer: "Sugar is sweet.", explanation: "sugar 是不可數名詞，沒有 s，也不用 a/an，當單一概念用 is。", isCorrect: false },
    { sentence: "Air is clean.", zh: "空氣很乾淨。", answer: "Air is clean.", explanation: "air 是不可數名詞，沒有 s，也不用 a/an，當單一概念用 is。", isCorrect: true },
    { sentence: "An air is clean.", zh: "空氣很乾淨。", answer: "Air is clean.", explanation: "air 是不可數名詞，沒有 s，也不用 a/an，當單一概念用 is。", isCorrect: false },
    { sentence: "Lessons are important.", zh: "課堂很重要。", answer: "Lessons are important.", explanation: "中文「課堂」是泛指整個類別；lesson 是可數名詞，預設用眾數 Lessons，所以用 are。", isCorrect: true },
    { sentence: "Lesson is important.", zh: "課堂很重要。", answer: "Lessons are important.", explanation: "中文「課堂」是泛指整個類別；lesson 是可數名詞，預設用眾數 Lessons，所以用 are。", isCorrect: false },
    { sentence: "The lesson is important.", zh: "這堂課很重要。", answer: "The lesson is important.", explanation: "the 表示指定；The lesson 是指定一堂，所以用 is。", isCorrect: true },
    { sentence: "The lessons is important.", zh: "那些課堂很重要。", answer: "The lessons are important.", explanation: "the 表示指定；The lessons 是指定多堂，所以用 are。", isCorrect: false }
  ].forEach(add);

  return questions;
}

const COUNTABLE_NOUN_QUESTIONS = createCountableNounQuestions();

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
const VERB_TABLE_ID = "verb-table";
const LESSON_PROGRESS_KEYS = {
  [LESSON1_ID]: "basic_grammar_lesson_01_progress_v2",
  [LESSON2_ID]: "basic_grammar_lesson_02_progress_v1",
  [QUIZ1_ID]: "basic_grammar_quiz_01_progress_v1",
  [SENTENCE_UNDERLINE_ID]: "basic_grammar_sentence_underline_progress_v1",
  [PRONOUN_MATCH_ID]: "basic_grammar_pronoun_match_progress_v1",
  [PRONOUN_SENTENCE_ID]: "basic_grammar_pronoun_sentence_progress_v1",
  [COUNTABLE_NOUN_ID]: "basic_grammar_countable_nouns_progress_v1",
  [VERB_TABLE_ID]: "basic_grammar_verb_table_progress_v1"
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
  [VERB_TABLE_ID]: {
    id: VERB_TABLE_ID,
    kicker: "Lesson 07",
    title: "Verb Table 動詞四式",
    questions: VERB_TABLE_QUESTIONS
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
    VERB_TABLE_FIELDS,
    VERB_TABLE_QUESTIONS,
    LESSON1_ID,
    LESSON2_ID,
    QUIZ1_ID,
    SENTENCE_UNDERLINE_ID,
    PRONOUN_MATCH_ID,
    PRONOUN_SENTENCE_ID,
    COUNTABLE_NOUN_ID,
    VERB_TABLE_ID,
    LESSON_PROGRESS_KEYS,
    LESSONS,
    capitalizeWord,
    createCountableNounQuestions
  };
});
