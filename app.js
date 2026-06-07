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

const LESSON1_ID = "lesson1";
const LESSON2_ID = "lesson2";
const QUIZ1_ID = "quiz1";
const SENTENCE_UNDERLINE_ID = "sentence-underline";
const LESSON_PROGRESS_KEYS = {
  [LESSON1_ID]: "basic_grammar_lesson_01_progress_v2",
  [LESSON2_ID]: "basic_grammar_lesson_02_progress_v1",
  [QUIZ1_ID]: "basic_grammar_quiz_01_progress_v1",
  [SENTENCE_UNDERLINE_ID]: "basic_grammar_sentence_underline_progress_v1"
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
  }
};

const SOUND_KEY = "basic_grammar_sound_enabled_v1";
const PRACTICE_COUNT_KEY = "basic_grammar_practice_count_v1";
const BEST_STREAK_KEY = "basic_grammar_best_streak_v1";
const CATEGORY_LABELS = {
  action: "動作動詞",
  be: "「是」句",
  adjective: "形容詞句"
};
const UNDERLINE_COLOR_COUNT = 4;
const QUESTION_WEIGHTS = {
  action: 0.5,
  be: 0.3,
  adjective: 0.2
};

const SOUND_PATTERNS = {
  start: [
    { frequency: 523.25, delay: 0, duration: 0.07 },
    { frequency: 659.25, delay: 0.08, duration: 0.08 },
    { frequency: 783.99, delay: 0.16, duration: 0.1 }
  ],
  step: [
    { frequency: 659.25, delay: 0, duration: 0.055 },
    { frequency: 880, delay: 0.07, duration: 0.07 }
  ],
  correct: [
    { frequency: 783.99, delay: 0, duration: 0.06 },
    { frequency: 987.77, delay: 0.07, duration: 0.07 },
    { frequency: 1318.51, delay: 0.15, duration: 0.09 }
  ],
  wrong: [
    { frequency: 329.63, delay: 0, duration: 0.08, type: "sine" },
    { frequency: 246.94, delay: 0.09, duration: 0.12, type: "sine" }
  ],
  next: [
    { frequency: 587.33, delay: 0, duration: 0.055 },
    { frequency: 739.99, delay: 0.06, duration: 0.055 }
  ],
  complete: [
    { frequency: 523.25, delay: 0, duration: 0.07 },
    { frequency: 659.25, delay: 0.08, duration: 0.07 },
    { frequency: 783.99, delay: 0.16, duration: 0.07 },
    { frequency: 1046.5, delay: 0.24, duration: 0.16 }
  ]
};
const UI_SOUND_GAIN = 0.098;

let audioContext = null;

const state = {
  lessonId: LESSON1_ID,
  mode: "practice",
  index: 0,
  score: 0,
  mistakes: 0,
  questionMistakes: 0,
  resolved: false,
  questions: [],
  missedQuestionIds: [],
  reviewQuestions: [],
  selectedVerbIndexes: [],
  selectedUnderlineColor: 0,
  streak: 0,
  bestStreak: getSavedBestStreak(),
  practiceCount: getSavedPracticeCount(),
  soundEnabled: getSavedSoundEnabled()
};

const el = {
  menuScreen: document.querySelector("#menu-screen"),
  lessonScreen: document.querySelector("#lesson-screen"),
  resultScreen: document.querySelector("#result-screen"),
  menuProgressLesson1: document.querySelector("#menu-progress-lesson1"),
  menuProgressLesson2: document.querySelector("#menu-progress-lesson2"),
  menuProgressQuiz1: document.querySelector("#menu-progress-quiz1"),
  menuProgressSentenceUnderline: document.querySelector("#menu-progress-sentence-underline"),
  menuCoachLine: document.querySelector("#menu-coach-line"),
  practiceCountInput: document.querySelector("#practice-count"),
  practiceCountOutput: document.querySelector("#practice-count-output"),
  lessonKicker: document.querySelector("#lesson-kicker"),
  lessonTitle: document.querySelector("#lesson-title"),
  liveScore: document.querySelector("#live-score"),
  liveTotal: document.querySelector("#live-total"),
  liveStreak: document.querySelector("#live-streak"),
  bestStreak: document.querySelector("#best-streak"),
  questionNumber: document.querySelector("#question-number"),
  questionTotal: document.querySelector("#question-total"),
  stepLabel: document.querySelector("#step-label"),
  categoryPill: document.querySelector("#category-pill"),
  chinesePrompt: document.querySelector("#chinese-prompt"),
  guidance: document.querySelector("#guidance"),
  ruleCard: document.querySelector("#rule-card"),
  verbChoice: document.querySelector("#verb-choice"),
  beNeedChoice: document.querySelector("#be-need-choice"),
  beFormChoice: document.querySelector("#be-form-choice"),
  judgmentChoice: document.querySelector("#judgment-choice"),
  verbCountChoice: document.querySelector("#verb-count-choice"),
  verbTokenChoice: document.querySelector("#verb-token-choice"),
  verbTokenGrid: document.querySelector("#verb-token-grid"),
  submitVerbsBtn: document.querySelector("#submit-verbs-btn"),
  sentenceBuilderChoice: document.querySelector("#sentence-builder-choice"),
  sentenceSlots: document.querySelector("#sentence-slots"),
  wordBank: document.querySelector("#word-bank"),
  resetBuilderBtn: document.querySelector("#reset-builder-btn"),
  confirmBuilderBtn: document.querySelector("#confirm-builder-btn"),
  sentenceUnderlineChoice: document.querySelector("#sentence-underline-choice"),
  underlineBoard: document.querySelector("#underline-board"),
  underlinePalette: document.querySelector("#underline-palette"),
  resetUnderlineBtn: document.querySelector("#reset-underline-btn"),
  confirmUnderlineBtn: document.querySelector("#confirm-underline-btn"),
  englishCard: document.querySelector("#english-card"),
  englishText: document.querySelector("#english-text"),
  feedback: document.querySelector("#feedback"),
  nextBtn: document.querySelector("#next-btn"),
  restartBtn: document.querySelector("#restart-btn"),
  soundToggle: document.querySelector("#sound-toggle"),
  resultKicker: document.querySelector("#result-kicker"),
  resultScore: document.querySelector("#result-score"),
  resultTotal: document.querySelector("#result-total"),
  resultMistakes: document.querySelector("#result-mistakes"),
  resultPercent: document.querySelector("#result-percent"),
  resultMessage: document.querySelector("#result-message"),
  reviewSummary: document.querySelector("#review-summary"),
  reviewMistakesBtn: document.querySelector("#review-mistakes-btn")
};

function getMaxPracticeCount() {
  return Math.max(...Object.values(LESSONS).map((lesson) => lesson.questions.length));
}

function getSavedPracticeCount() {
  try {
    const rawValue = localStorage.getItem(PRACTICE_COUNT_KEY);
    if (rawValue === null) return 20;

    const saved = Number(rawValue);
    if (Number.isFinite(saved)) {
      return Math.max(10, Math.min(getMaxPracticeCount(), saved));
    }
  } catch (_error) {
    // Fall back to a short mixed practice if storage is unavailable.
  }
  return 20;
}

function savePracticeCount() {
  try {
    localStorage.setItem(PRACTICE_COUNT_KEY, String(state.practiceCount));
  } catch (_error) {
    // The chosen count still works during the current session.
  }
}

function getSavedBestStreak() {
  try {
    const saved = Number(localStorage.getItem(BEST_STREAK_KEY));
    return Number.isFinite(saved) ? Math.max(0, saved) : 0;
  } catch (_error) {
    return 0;
  }
}

function saveBestStreak() {
  try {
    localStorage.setItem(BEST_STREAK_KEY, String(state.bestStreak));
  } catch (_error) {
    // The best streak still updates during the current session.
  }
}

function syncPracticeCount() {
  el.practiceCountInput.max = String(getMaxPracticeCount());
  el.practiceCountInput.value = String(state.practiceCount);
  el.practiceCountOutput.textContent = `${state.practiceCount} 題`;
}

function updatePracticeCount() {
  state.practiceCount = Number(el.practiceCountInput.value);
  savePracticeCount();
  syncPracticeCount();
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function getQuestionQuotas(count) {
  const types = Object.keys(QUESTION_WEIGHTS);
  const availableCounts = Object.fromEntries(
    types.map((type) => [type, QUESTIONS.filter((question) => question.type === type).length])
  );
  const quotas = Object.fromEntries(types.map((type) => [type, 0]));
  const weightedTypes = types.map((type) => {
    const exactQuota = count * QUESTION_WEIGHTS[type];
    const baseQuota = Math.min(availableCounts[type], Math.floor(exactQuota));
    quotas[type] = baseQuota;
    return {
      type,
      remainder: exactQuota - baseQuota
    };
  });
  let assigned = Object.values(quotas).reduce((total, quota) => total + quota, 0);

  while (assigned < count) {
    const nextType = weightedTypes
      .filter(({ type }) => quotas[type] < availableCounts[type])
      .sort((left, right) => {
        if (right.remainder !== left.remainder) return right.remainder - left.remainder;
        return QUESTION_WEIGHTS[right.type] - QUESTION_WEIGHTS[left.type];
      })[0]?.type;

    if (!nextType) break;
    quotas[nextType] += 1;
    assigned += 1;
  }

  return quotas;
}

function pickPracticeQuestions(count) {
  const quotas = getQuestionQuotas(count);
  const buckets = Object.fromEntries(
    Object.entries(quotas).map(([type, quota]) => [
      type,
      shuffle(QUESTIONS.filter((question) => question.type === type)).slice(0, quota)
    ])
  );
  const mixed = [];
  let previousType = "";

  while (mixed.length < count) {
    const availableTypes = Object.keys(buckets).filter((type) => buckets[type].length > 0);
    const choices = availableTypes.filter((type) => type !== previousType);
    const pool = choices.length ? choices : availableTypes;
    const nextType = pool[Math.floor(Math.random() * pool.length)];
    mixed.push(buckets[nextType].pop());
    previousType = nextType;
  }

  return mixed;
}

function pickQuestionsForLesson(lessonId, count) {
  const lesson = LESSONS[lessonId] || LESSONS[LESSON1_ID];
  const cappedCount = Math.min(count, lesson.questions.length);

  if (lessonId === LESSON1_ID) {
    return pickPracticeQuestions(cappedCount);
  }

  return shuffle(lesson.questions).slice(0, cappedCount);
}

function getSavedSoundEnabled() {
  try {
    return localStorage.getItem(SOUND_KEY) !== "off";
  } catch (_error) {
    return true;
  }
}

function saveSoundEnabled() {
  try {
    localStorage.setItem(SOUND_KEY, state.soundEnabled ? "on" : "off");
  } catch (_error) {
    // Sound still works during the current session if storage is unavailable.
  }
}

function syncSoundToggle() {
  el.soundToggle.classList.toggle("muted", !state.soundEnabled);
  el.soundToggle.setAttribute("aria-label", state.soundEnabled ? "關閉音效" : "開啟音效");
  el.soundToggle.setAttribute("aria-pressed", String(state.soundEnabled));
}

function toggleSound() {
  const wasEnabled = state.soundEnabled;
  if (wasEnabled) {
    playUiSound("step");
  }

  state.soundEnabled = !state.soundEnabled;
  saveSoundEnabled();
  syncSoundToggle();
  if (!wasEnabled && state.soundEnabled) {
    playUiSound("start");
  }
}

function getAudioContext() {
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) return null;

  if (!audioContext) {
    audioContext = new AudioContextConstructor();
  }

  return audioContext;
}

function resumeAudioContext(context) {
  if (!context || context.state !== "suspended") {
    return Promise.resolve(context?.state !== "closed");
  }

  try {
    const resumeResult = context.resume();
    if (resumeResult && typeof resumeResult.then === "function") {
      return resumeResult
        .then(() => context.state !== "suspended" && context.state !== "closed")
        .catch(() => false);
    }
  } catch (_error) {
    return Promise.resolve(false);
  }

  return Promise.resolve(context.state !== "suspended" && context.state !== "closed");
}

function scheduleUiSound(context, pattern) {
  if (!context || context.state === "closed") return;

  const now = context.currentTime + 0.01;
  pattern.forEach((note) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startAt = now + note.delay;
    const endAt = startAt + note.duration;

    oscillator.type = note.type || "triangle";
    oscillator.frequency.setValueAtTime(note.frequency, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(note.gain || UI_SOUND_GAIN, startAt + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(endAt + 0.02);
  });
}

function playUiSound(kind) {
  if (!state.soundEnabled) return;

  const context = getAudioContext();
  const pattern = SOUND_PATTERNS[kind];
  if (!context || !pattern) return;

  if (context.state === "suspended") {
    resumeAudioContext(context).then((resumed) => {
      if (resumed) {
        scheduleUiSound(context, pattern);
      }
    });
    return;
  }

  scheduleUiSound(context, pattern);
}

function unlockAudio() {
  if (!state.soundEnabled) return;

  const context = getAudioContext();
  if (context?.state === "suspended") {
    resumeAudioContext(context);
  }
}

function currentLesson() {
  return LESSONS[state.lessonId] || LESSONS[LESSON1_ID];
}

function getLessonTotal(lessonId) {
  return LESSONS[lessonId]?.questions.length || 0;
}

function getProgress(lessonId = state.lessonId) {
  try {
    const saved = JSON.parse(localStorage.getItem(LESSON_PROGRESS_KEYS[lessonId]) || "{}");
    return Math.max(0, Math.min(getLessonTotal(lessonId), Number(saved.completed) || 0));
  } catch (_error) {
    return 0;
  }
}

function saveProgress(completed, lessonId = state.lessonId) {
  const total = getLessonTotal(lessonId);
  const nextCompleted = Math.max(getProgress(lessonId), Math.min(total, completed));
  localStorage.setItem(LESSON_PROGRESS_KEYS[lessonId], JSON.stringify({
    completed: nextCompleted,
    total,
    updatedAt: Date.now()
  }));
  updateMenuProgress();
}

function updateMenuProgress() {
  const lesson1Progress = getProgress(LESSON1_ID);
  const lesson2Progress = getProgress(LESSON2_ID);
  const quiz1Progress = getProgress(QUIZ1_ID);
  const underlineProgress = getProgress(SENTENCE_UNDERLINE_ID);
  el.menuProgressLesson1.textContent = `${lesson1Progress}/${getLessonTotal(LESSON1_ID)}`;
  el.menuProgressLesson2.textContent = `${lesson2Progress}/${getLessonTotal(LESSON2_ID)}`;
  el.menuProgressQuiz1.textContent = `${quiz1Progress}/${getLessonTotal(QUIZ1_ID)}`;
  el.menuProgressSentenceUnderline.textContent = `${underlineProgress}/${getLessonTotal(SENTENCE_UNDERLINE_ID)}`;

  if (underlineProgress >= getLessonTotal(SENTENCE_UNDERLINE_ID)) {
    el.menuCoachLine.textContent = "Lesson 03 已完成，可以再挑戰分句速度。";
  } else if (quiz1Progress >= getLessonTotal(QUIZ1_ID)) {
    el.menuCoachLine.textContent = "Quiz 1 已完成，可以再挑戰更快砌句子。";
  } else if (lesson2Progress >= getLessonTotal(LESSON2_ID)) {
    el.menuCoachLine.textContent = "Lesson 02 已完成，可以挑戰 Quiz 1。";
  } else if (lesson1Progress >= getLessonTotal(LESSON1_ID)) {
    el.menuCoachLine.textContent = "Lesson 01 已完成，可以挑戰 Lesson 02。";
  } else if (state.bestStreak >= 8) {
    el.menuCoachLine.textContent = `最佳連勝 ${state.bestStreak} 題，節奏好穩。`;
  } else {
    el.menuCoachLine.textContent = "今日由句子分析開始。";
  }
}

function showScreen(screen) {
  el.menuScreen.classList.toggle("active", screen === "menu");
  el.lessonScreen.classList.toggle("active", screen === "lesson");
  el.resultScreen.classList.toggle("active", screen === "result");
}

function updateLessonChrome() {
  const lesson = currentLesson();
  const reviewing = state.mode === "review";
  el.lessonKicker.textContent = reviewing ? "Mistake Review" : lesson.kicker;
  el.lessonTitle.textContent = reviewing ? "錯題重練" : lesson.title;
  el.resultKicker.textContent = reviewing ? "Mistake Review Result" : `${lesson.kicker} Result`;
}

function updateLiveStats() {
  el.liveScore.textContent = String(state.score);
  el.liveTotal.textContent = String(state.questions.length);
  el.liveStreak.textContent = String(state.streak);
  el.bestStreak.textContent = String(state.bestStreak);
}

function setFeedback(message = "", type = "") {
  el.feedback.className = `feedback${type ? ` ${type}` : ""}`;
  el.feedback.replaceChildren();

  if (Array.isArray(message)) {
    message.forEach((part) => {
      const line = document.createElement("span");
      line.className = `feedback-line${part.className ? ` ${part.className}` : ""}`;
      line.textContent = part.text;
      el.feedback.append(line);
    });
    return;
  }

  el.feedback.textContent = message;
}

function showOnlyChoice(choice) {
  el.verbChoice.classList.toggle("hidden", choice !== "verb");
  el.beNeedChoice.classList.toggle("hidden", choice !== "needsBe");
  el.beFormChoice.classList.toggle("hidden", choice !== "beForm");
  el.judgmentChoice.classList.toggle("hidden", choice !== "judgment");
  el.verbCountChoice.classList.toggle("hidden", choice !== "verbCount");
  el.verbTokenChoice.classList.toggle("hidden", choice !== "verbTokens");
  el.sentenceBuilderChoice.classList.toggle("hidden", choice !== "builder");
  el.sentenceUnderlineChoice.classList.toggle("hidden", choice !== "underline");
}

function currentQuestion() {
  return state.questions[state.index] || null;
}

function questionHasVerb(question) {
  return question.type === "action";
}

function getVerbChoiceExplanation(question, pickedHasActionVerb) {
  if (question.type === "action") {
    return `${question.note} 所以呢句有動作動詞，應該按 TICK。`;
  }

  if (question.type === "be") {
    return `「${question.zh}」入面中文「是」用來連接主語和身份，不是動作動詞，所以應該先按 CROSS。`;
  }

  if (pickedHasActionVerb) {
    return `「${question.zh}」是形容詞句，是在形容主語，沒有動作動詞，所以應該先按 CROSS。`;
  }

  return "再睇一次句子類型，先分清楚有沒有動作動詞。";
}

function getBeRuleExplanation(question) {
  if (!question.subjectZh || !question.subjectEn || !question.subjectRole || !question.pronoun) {
    return `主語要配 ${question.beForm}。`;
  }

  return `因為主語是${question.subjectZh}（英文是 ${question.subjectEn}），即是${question.subjectRole}（${question.pronoun}），所以應該用 ${question.beForm}。`;
}

function getNeedsBeExplanation(question) {
  const sentenceType = question.type === "be" ? "「是」句" : "形容詞句";
  return `${sentenceType}英文要用 be verb。${getBeRuleExplanation(question)}`;
}

function getWrongBeFormExplanation(question, pickedForm) {
  return `你揀咗 ${pickedForm}，但${getBeRuleExplanation(question)}`;
}

function prepareRun(mode, lessonId, questions) {
  state.lessonId = lessonId;
  state.mode = mode;
  state.index = 0;
  state.score = 0;
  state.mistakes = 0;
  state.questionMistakes = 0;
  state.streak = 0;
  state.missedQuestionIds = [];
  state.selectedVerbIndexes = [];
  state.selectedUnderlineColor = 0;
  state.resolved = false;
  state.questions = questions;
  updateLessonChrome();
  updateLiveStats();
  showScreen("lesson");
  renderQuestion();
  playUiSound("start");
}

function startLesson(lessonId = state.lessonId) {
  const nextLessonId = LESSONS[lessonId] ? lessonId : LESSON1_ID;
  prepareRun("practice", nextLessonId, pickQuestionsForLesson(nextLessonId, state.practiceCount));
}

function startMistakeReview() {
  if (!state.reviewQuestions.length) return;
  prepareRun("review", state.lessonId, shuffle(state.reviewQuestions));
}

function backToMenu() {
  cancelSpeech();
  updateMenuProgress();
  showScreen("menu");
  playUiSound("next");
}

function renderQuestion() {
  const question = currentQuestion();
  if (!question) {
    renderComplete();
    return;
  }

  state.resolved = false;
  state.questionMistakes = 0;
  state.selectedVerbIndexes = [];
  el.questionNumber.textContent = String(state.index + 1);
  el.questionTotal.textContent = String(state.questions.length);
  updateLiveStats();
  el.englishCard.classList.add("hidden");
  el.nextBtn.classList.add("hidden");
  el.restartBtn.classList.add("hidden");
  el.lessonScreen.classList.toggle("quiz-screen", state.lessonId === QUIZ1_ID);
  el.lessonScreen.classList.toggle("underline-screen", state.lessonId === SENTENCE_UNDERLINE_ID);
  el.chinesePrompt.classList.toggle("english-prompt", state.lessonId === LESSON2_ID);
  el.chinesePrompt.classList.toggle("builder-prompt", state.lessonId === QUIZ1_ID);
  el.ruleCard.classList.toggle("hidden", state.lessonId !== LESSON2_ID);
  el.verbTokenGrid.replaceChildren();
  el.sentenceSlots.replaceChildren();
  el.wordBank.replaceChildren();
  el.underlineBoard.replaceChildren();
  el.underlinePalette.replaceChildren();
  setFeedback();

  if (state.lessonId === LESSON2_ID) {
    renderVerbCountQuestion(question);
    return;
  }

  if (state.lessonId === QUIZ1_ID) {
    renderSentenceBuilderQuestion(question);
    return;
  }

  if (state.lessonId === SENTENCE_UNDERLINE_ID) {
    renderSentenceUnderlineQuestion(question);
    return;
  }

  renderGrammarQuestion(question);
}

function renderGrammarQuestion(question) {
  el.stepLabel.textContent = "中文句子";
  el.categoryPill.textContent = CATEGORY_LABELS[question.type];
  el.categoryPill.dataset.type = question.type;
  el.chinesePrompt.textContent = question.zh;
  el.guidance.textContent = "分析句子有沒有動作動詞：有就 TICK，冇就 CROSS。";
  showOnlyChoice("verb");
}

function renderVerbCountQuestion(question) {
  el.stepLabel.textContent = "English sentence";
  el.categoryPill.textContent = "One verb rule";
  el.categoryPill.dataset.type = "verb-count";
  el.chinesePrompt.textContent = question.sentence;
  el.guidance.textContent = getLesson2Translation(question);
  showOnlyChoice("judgment");
}

function renderSentenceBuilderQuestion(question) {
  el.stepLabel.textContent = "中文句子";
  el.categoryPill.textContent = "Quiz 1";
  el.categoryPill.dataset.type = "quiz1";
  el.chinesePrompt.textContent = question.zh;
  el.guidance.textContent = "";
  el.sentenceSlots.setAttribute("aria-label", "答案區");

  getSentenceBuilderWordBlocks(question).forEach(({ word, id, type }) => {
    const button = document.createElement("button");
    button.className = "word-block";
    button.type = "button";
    button.textContent = word;
    button.dataset.wordIndex = String(id);
    button.dataset.wordType = type;
    button.addEventListener("click", () => toggleBuilderWord(button));
    el.wordBank.append(button);
  });

  updateBuilderControls();
  showOnlyChoice("builder");
}

function getUnderlineTokens(question) {
  return question.segments.flat();
}

function renderSentenceUnderlineQuestion(question) {
  el.stepLabel.textContent = "English sentence";
  el.categoryPill.textContent = "Sentence";
  el.categoryPill.dataset.type = "underline";
  el.chinesePrompt.textContent = question.text;
  el.guidance.textContent = "用唔同顏色 underline 每個句子。";
  state.selectedUnderlineColor = 0;

  for (let index = 0; index < UNDERLINE_COLOR_COUNT; index += 1) {
    const button = document.createElement("button");
    button.className = "underline-color-btn";
    button.type = "button";
    button.textContent = String(index + 1);
    button.dataset.colorIndex = String(index);
    button.classList.toggle("selected", index === state.selectedUnderlineColor);
    button.setAttribute("aria-pressed", String(index === state.selectedUnderlineColor));
    button.addEventListener("click", () => selectUnderlineColor(index));
    el.underlinePalette.append(button);
  }

  getUnderlineTokens(question).forEach((token, index) => {
    const button = document.createElement("button");
    button.className = "underline-token";
    button.type = "button";
    button.textContent = token;
    button.dataset.tokenIndex = String(index);
    button.addEventListener("click", () => toggleUnderlineToken(button));
    el.underlineBoard.append(button);
  });

  updateUnderlineControls();
  showOnlyChoice("underline");
}

function completeQuestion(message) {
  const question = currentQuestion();
  if (!question) return;

  if (!state.resolved) {
    state.resolved = true;
    if (state.questionMistakes === 0) {
      state.score += 1;
      state.streak += 1;
      if (state.streak > state.bestStreak) {
        state.bestStreak = state.streak;
        saveBestStreak();
      }
    }
    if (state.mode === "practice") {
      saveProgress(state.index + 1);
    }
    updateLiveStats();
  }

  showOnlyChoice("");
  el.guidance.textContent = "英文句子已解鎖，按一下可以聽讀音。";
  el.englishText.textContent = question.english;
  el.englishCard.classList.remove("hidden");
  el.nextBtn.classList.remove("hidden");
  setFeedback(message || "正確！", "success");
  playUiSound("correct");
}

function recordWrong(message) {
  const question = currentQuestion();
  if (!question || state.resolved) return;

  if (state.questionMistakes === 0) {
    state.streak = 0;
  }
  if (!state.missedQuestionIds.includes(question.id)) {
    state.missedQuestionIds.push(question.id);
  }
  state.mistakes += 1;
  state.questionMistakes += 1;
  state.resolved = true;
  if (state.mode === "practice") {
    saveProgress(state.index + 1);
  }
  updateLiveStats();
  showOnlyChoice("");
  el.guidance.textContent = "睇完解釋，按「下一題」繼續。";
  if (question.english) {
    el.englishText.textContent = question.english;
    el.englishCard.classList.remove("hidden");
  } else {
    el.englishCard.classList.add("hidden");
  }
  el.nextBtn.classList.remove("hidden");
  setFeedback(message, "error");
  playUiSound("wrong");
}

function askBeForm(message) {
  el.stepLabel.textContent = "is / am / are";
  el.guidance.textContent = "揀正確的 be verb。";
  showOnlyChoice("beForm");
  setFeedback(message, "success");
  playUiSound("step");
}

function answerVerbChoice(choice) {
  const question = currentQuestion();
  if (!question || state.resolved) return;

  const hasVerbChoice = choice === "true";
  if (questionHasVerb(question) !== hasVerbChoice) {
    recordWrong(getVerbChoiceExplanation(question, hasVerbChoice));
    return;
  }

  if (question.type === "action") {
    completeQuestion(`正確，${question.note}`);
    return;
  }

  el.stepLabel.textContent = "Be verb check";
  el.guidance.textContent = question.type === "be"
    ? "中文「是」不當動作動詞，英文要不要用 is / am / are？"
    : "中文形容詞句沒有動作動詞，英文要不要補 is / am / are？";
  showOnlyChoice("needsBe");
  setFeedback(question.type === "be" ? "正確，「是」不算動詞，所以要加is/am/are" : "正確，呢句中文沒有動作動詞。", "success");
  playUiSound("step");
}

function answerNeedsBe(choice) {
  const question = currentQuestion();
  if (!question || !["be", "adjective"].includes(question.type) || state.resolved) return;

  const needsBeChoice = choice === "true";
  if (!needsBeChoice) {
    recordWrong(getNeedsBeExplanation(question));
    return;
  }

  askBeForm(question.type === "be" ? "正確，「是」句英文要用 be verb。" : "正確，形容詞句英文要補 be verb。");
}

function answerBeForm(form) {
  const question = currentQuestion();
  if (!question || state.resolved) return;

  if (form !== question.beForm) {
    recordWrong(getWrongBeFormExplanation(question, form));
    return;
  }

  completeQuestion(`正確，${getBeRuleExplanation(question)}`);
}

function getSentenceTokens(question) {
  return question.sentence.replace(/[.?!]/g, "").split(" ");
}

function getLesson2Translation(question) {
  return question.zh || "";
}

function getLesson2Correction(question) {
  return question.correction || "句子正確，不用改。";
}

function getVerbCountReason(question) {
  const baseExplanation = question.explanation.replace(/。$/, "");
  return `${baseExplanation}，所以${question.isCorrect ? "正確" : "錯誤"}。`;
}

function getVerbCountFeedback(question) {
  return [
    { text: getVerbCountReason(question) },
    { text: `正確答案：${getLesson2Correction(question)}`, className: "answer-line" }
  ];
}

function completeVerbLessonQuestion(message) {
  const question = currentQuestion();
  if (!question || state.resolved) return;

  state.resolved = true;
  state.score += 1;
  state.streak += 1;
  if (state.streak > state.bestStreak) {
    state.bestStreak = state.streak;
    saveBestStreak();
  }
  if (state.mode === "practice") {
    saveProgress(state.index + 1);
  }

  updateLiveStats();
  showOnlyChoice("");
  el.guidance.textContent = "睇完解釋，按「下一題」繼續。";
  el.englishCard.classList.add("hidden");
  el.nextBtn.classList.remove("hidden");
  setFeedback(message, "success");
  playUiSound("correct");
}

function answerSentenceJudgment(choice) {
  const question = currentQuestion();
  if (!question || state.lessonId !== LESSON2_ID || state.resolved) return;

  const pickedCorrect = choice === "correct";
  if (pickedCorrect !== question.isCorrect) {
    recordWrong(getVerbCountFeedback(question));
    return;
  }

  el.guidance.textContent = "正確。下一步揀句子有幾多個動詞。";
  showOnlyChoice("verbCount");
  setFeedback("正確，繼續數動詞。", "success");
  playUiSound("step");
}

function answerVerbCount(count) {
  const question = currentQuestion();
  if (!question || state.lessonId !== LESSON2_ID || state.resolved) return;

  const pickedCount = Number(count);
  if (pickedCount !== question.verbCount) {
    recordWrong(getVerbCountFeedback(question));
    return;
  }

  if (question.isCorrect || question.verbCount === 0) {
    completeVerbLessonQuestion(getVerbCountFeedback(question));
    return;
  }

  renderVerbTokenButtons(question);
  el.guidance.textContent = "數目正確。再揀出句子入面邊啲字係動詞。";
  showOnlyChoice("verbTokens");
  setFeedback("數目正確，請揀動詞。", "success");
  playUiSound("step");
}

function renderVerbTokenButtons(question) {
  el.verbTokenGrid.replaceChildren();
  getSentenceTokens(question).forEach((token, index) => {
    const button = document.createElement("button");
    button.className = "token-btn";
    button.type = "button";
    button.textContent = token;
    button.dataset.tokenIndex = String(index);
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => toggleVerbToken(index, button));
    el.verbTokenGrid.append(button);
  });
}

function toggleVerbToken(index, button) {
  if (state.resolved) return;

  if (state.selectedVerbIndexes.includes(index)) {
    state.selectedVerbIndexes = state.selectedVerbIndexes.filter((selectedIndex) => selectedIndex !== index);
  } else {
    state.selectedVerbIndexes.push(index);
  }

  const selected = state.selectedVerbIndexes.includes(index);
  button.classList.toggle("selected", selected);
  button.setAttribute("aria-pressed", String(selected));
  playUiSound("step");
}

function submitVerbTokens() {
  const question = currentQuestion();
  if (!question || state.lessonId !== LESSON2_ID || state.resolved) return;

  const picked = [...state.selectedVerbIndexes].sort((left, right) => left - right);
  const expected = [...question.verbIndexes].sort((left, right) => left - right);
  const matched = picked.length === expected.length && picked.every((index, position) => index === expected[position]);

  if (!matched) {
    recordWrong(getVerbCountFeedback(question));
    return;
  }

  completeVerbLessonQuestion(getVerbCountFeedback(question));
}

function getSentenceBuilderWordBlocks(question) {
  const answerWords = question.answer.map((word, index) => ({
    word,
    id: `answer-${index}`,
    type: "answer"
  }));
  const answerSet = new Set(question.answer.map((word) => word.toLowerCase()));
  const extraWords = shuffle((question.distractors || []).filter((word) => !answerSet.has(word.toLowerCase())))
    .slice(0, 2)
    .map((word, index) => ({
      word,
      id: `extra-${index}`,
      type: "extra"
    }));

  return shuffle([...answerWords, ...extraWords]);
}

function getPlacedBuilderWords() {
  return [...el.sentenceSlots.querySelectorAll(".word-block")].map((button) => button.textContent);
}

function moveBuilderBlock(button, target, beforeAppend = () => {}) {
  const startRect = button.getBoundingClientRect();
  beforeAppend();
  target.append(button);
  const endRect = button.getBoundingClientRect();
  const deltaX = startRect.left - endRect.left;
  const deltaY = startRect.top - endRect.top;

  if (deltaX || deltaY) {
    button.animate(
      [
        { transform: `translate(${deltaX}px, ${deltaY}px) scale(0.98)` },
        { transform: "translate(0, 0) scale(1)" }
      ],
      {
        duration: 280,
        easing: "cubic-bezier(0.2, 0.8, 0.2, 1)"
      }
    );
  }
}

function updateBuilderControls() {
  const filledCount = getPlacedBuilderWords().length;
  el.confirmBuilderBtn.disabled = filledCount === 0;
  el.resetBuilderBtn.disabled = filledCount === 0;
}

function placeBuilderWord(button) {
  moveBuilderBlock(button, el.sentenceSlots, () => {
    button.classList.add("placed");
    button.setAttribute("aria-label", `${button.textContent} 已放到答案區`);
  });
  updateBuilderControls();
  setFeedback();
  playUiSound("step");
}

function returnBuilderWord(button) {
  moveBuilderBlock(button, el.wordBank, () => {
    button.classList.remove("placed");
    button.removeAttribute("aria-label");
  });
  updateBuilderControls();
  setFeedback();
  playUiSound("next");
}

function toggleBuilderWord(button) {
  if (state.resolved) return;

  if (button.classList.contains("placed")) {
    returnBuilderWord(button);
    return;
  }

  placeBuilderWord(button);
}

function resetSentenceBuilder() {
  if (state.resolved) return;

  const placedButtons = [...el.sentenceSlots.querySelectorAll(".word-block")];
  placedButtons.forEach((button) => {
    moveBuilderBlock(button, el.wordBank, () => {
      button.classList.remove("placed");
      button.removeAttribute("aria-label");
    });
  });
  updateBuilderControls();
  setFeedback();
  if (placedButtons.length) {
    playUiSound("next");
  }
}

function getSentenceBuilderAnswer(question) {
  return question.answer.join(" ");
}

function getSentenceBuilderFeedback(question, isCorrect) {
  return [
    { text: isCorrect ? "句子次序正確。" : "句子次序未正確。" },
    { text: `正確答案：${getSentenceBuilderAnswer(question)}`, className: "answer-line" }
  ];
}

function submitSentenceBuilder() {
  const question = currentQuestion();
  if (!question || state.lessonId !== QUIZ1_ID || state.resolved) return;

  const pickedWords = getPlacedBuilderWords();
  if (!pickedWords.length) {
    setFeedback("", "error");
    playUiSound("wrong");
    return;
  }

  const matched = pickedWords.length === question.answer.length
    && pickedWords.every((word, index) => word === question.answer[index]);
  if (!matched) {
    recordWrong(getSentenceBuilderFeedback(question, false));
    return;
  }

  completeVerbLessonQuestion(getSentenceBuilderFeedback(question, true));
}

function selectUnderlineColor(colorIndex) {
  if (state.resolved) return;

  state.selectedUnderlineColor = colorIndex;
  el.underlinePalette.querySelectorAll(".underline-color-btn").forEach((button) => {
    const selected = Number(button.dataset.colorIndex) === colorIndex;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  playUiSound("step");
}

function toggleUnderlineToken(button) {
  if (state.resolved) return;

  const selectedColor = String(state.selectedUnderlineColor);
  const alreadySelected = button.dataset.group === selectedColor;
  if (alreadySelected) {
    delete button.dataset.group;
  } else {
    button.dataset.group = selectedColor;
  }

  updateUnderlineControls();
  playUiSound("step");
}

function resetSentenceUnderline() {
  if (state.resolved) return;

  el.underlineBoard.querySelectorAll(".underline-token").forEach((button) => {
    delete button.dataset.group;
  });
  updateUnderlineControls();
  playUiSound("next");
}

function updateUnderlineControls() {
  const hasSelection = [...el.underlineBoard.querySelectorAll(".underline-token")]
    .some((button) => button.dataset.group !== undefined);
  el.resetUnderlineBtn.disabled = !hasSelection;
  el.confirmUnderlineBtn.disabled = !hasSelection;
}

function getExpectedUnderlineGroups(question) {
  return question.segments.flatMap((segment, segmentIndex) => segment.map(() => segmentIndex));
}

function getPickedUnderlineGroups() {
  return [...el.underlineBoard.querySelectorAll(".underline-token")].map((button) => {
    if (button.dataset.group === undefined) return null;
    return Number(button.dataset.group);
  });
}

function normalizePickedGroups(groups) {
  const colorMap = new Map();
  let nextGroup = 0;

  return groups.map((group) => {
    if (group === null) return null;
    if (!colorMap.has(group)) {
      colorMap.set(group, nextGroup);
      nextGroup += 1;
    }
    return colorMap.get(group);
  });
}

function getUnderlineFeedback(question, isCorrect) {
  const count = question.segments.length;
  const answer = question.segments
    .map((segment, index) => `${index + 1}. ${segment.join(" ")}`)
    .join("  ");

  return [
    { text: isCorrect ? `正確，這一句有 ${count} 個句子。` : `這一句有 ${count} 個句子。` },
    { text: `正確答案：${answer}`, className: "answer-line" }
  ];
}

function submitSentenceUnderline() {
  const question = currentQuestion();
  if (!question || state.lessonId !== SENTENCE_UNDERLINE_ID || state.resolved) return;

  const expectedGroups = getExpectedUnderlineGroups(question);
  const pickedGroups = normalizePickedGroups(getPickedUnderlineGroups());
  const matched = pickedGroups.length === expectedGroups.length
    && pickedGroups.every((group, index) => group !== null && group === expectedGroups[index]);

  if (!matched) {
    recordWrong(getUnderlineFeedback(question, false));
    return;
  }

  completeVerbLessonQuestion(getUnderlineFeedback(question, true));
}

function nextQuestion() {
  cancelSpeech();
  const wasLastQuestion = state.index >= state.questions.length - 1;
  state.index += 1;
  renderQuestion();
  playUiSound(wasLastQuestion ? "complete" : "next");
}

function renderComplete() {
  const total = state.questions.length;
  const percent = total ? Math.round((state.score / total) * 100) : 0;
  state.reviewQuestions = state.questions.filter((question) => state.missedQuestionIds.includes(question.id));

  if (state.mode === "practice") {
    saveProgress(total);
  }

  updateLessonChrome();
  updateLiveStats();
  el.resultScore.textContent = `${state.score}/${total}`;
  el.resultTotal.textContent = String(total);
  el.resultMistakes.textContent = String(state.mistakes);
  el.resultPercent.textContent = `${percent}%`;
  el.resultMessage.textContent = getResultMessage(percent, state.mistakes, state.mode);
  renderReviewSummary();
  showScreen("result");
}

function renderReviewSummary() {
  el.reviewSummary.replaceChildren();
  const hasReviewQuestions = state.reviewQuestions.length > 0;

  el.reviewSummary.classList.toggle("hidden", !hasReviewQuestions);
  el.reviewMistakesBtn.classList.toggle("hidden", !hasReviewQuestions);
  el.reviewMistakesBtn.textContent = hasReviewQuestions
    ? `重練 ${state.reviewQuestions.length} 條錯題`
    : "重練錯題";

  if (!hasReviewQuestions) return;

  state.reviewQuestions.slice(0, 6).forEach((question) => {
    const chip = document.createElement("span");
    chip.textContent = getQuestionPrompt(question);
    el.reviewSummary.append(chip);
  });

  if (state.reviewQuestions.length > 6) {
    const chip = document.createElement("span");
    chip.textContent = `+${state.reviewQuestions.length - 6}`;
    el.reviewSummary.append(chip);
  }
}

function getQuestionPrompt(question) {
  return question.zh || question.sentence || question.text || "";
}

function getResultMessage(percent, mistakes, mode) {
  if (mode === "review" && mistakes === 0) return "錯題已清晒，返去挑戰新一輪。";
  if (mode === "review") return "差少少，再重練今輪錯題就得。";
  if (state.lessonId === SENTENCE_UNDERLINE_ID && percent === 100 && mistakes === 0) return "滿分！你分到每個句子嘅邊界。";
  if (state.lessonId === SENTENCE_UNDERLINE_ID && percent >= 80) return "好穩陣！繼續留意 that、and、but、so、or 後面。";
  if (state.lessonId === SENTENCE_UNDERLINE_ID) return "慢慢嚟，先搵主語同動詞，再分顏色。";
  if (state.lessonId === QUIZ1_ID && percent === 100 && mistakes === 0) return "滿分！你可以由中文準確砌出英文句子。";
  if (state.lessonId === QUIZ1_ID && percent >= 80) return "好穩陣！繼續練主語、動詞同句尾次序。";
  if (state.lessonId === QUIZ1_ID) return "慢慢嚟，先搵主語，再搵動詞，最後補完整句。";
  if (state.lessonId === LESSON2_ID && percent === 100 && mistakes === 0) return "滿分！你記得一句句子只可以有一個動詞。";
  if (state.lessonId === LESSON2_ID && percent >= 80) return "好穩陣！繼續留意 ING / PP 不當動詞。";
  if (state.lessonId === LESSON2_ID) return "慢慢嚟，先數現在式、過去式同 be 動詞。";
  if (percent === 100 && mistakes === 0) return "滿分！你第一次就全部答啱。";
  if (percent >= 80) return "好穩陣！再玩一次可以挑戰更高準確率。";
  if (percent >= 60) return "有進步空間，留意形容詞句要補 be verb。";
  return "慢慢嚟，先分清動作動詞、「是」同形容詞句。";
}

function cancelSpeech() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  el.englishCard.classList.remove("speaking");
}

function speakCurrentEnglish() {
  const question = currentQuestion();
  if (!question?.english || !window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") return;

  playUiSound("step");
  cancelSpeech();
  const utterance = new SpeechSynthesisUtterance(question.english);
  utterance.lang = "en-US";
  utterance.rate = 0.88;
  utterance.onstart = () => el.englishCard.classList.add("speaking");
  utterance.onend = () => el.englishCard.classList.remove("speaking");
  utterance.onerror = () => el.englishCard.classList.remove("speaking");
  window.speechSynthesis.speak(utterance);
}

document.addEventListener("pointerdown", unlockAudio, { passive: true });
document.addEventListener("keydown", unlockAudio);

document.querySelectorAll("[data-start-lesson]").forEach((button) => {
  button.addEventListener("click", () => startLesson(button.dataset.startLesson));
});
document.querySelector("[data-back-menu]").addEventListener("click", backToMenu);
document.querySelector("[data-result-menu]").addEventListener("click", backToMenu);
document.querySelector("[data-restart-lesson]").addEventListener("click", () => startLesson(state.lessonId));
el.reviewMistakesBtn.addEventListener("click", startMistakeReview);
el.nextBtn.addEventListener("click", nextQuestion);
el.restartBtn.addEventListener("click", () => startLesson(state.lessonId));
el.englishCard.addEventListener("click", speakCurrentEnglish);
el.soundToggle.addEventListener("click", toggleSound);
el.practiceCountInput.addEventListener("input", updatePracticeCount);
el.practiceCountInput.addEventListener("change", () => playUiSound("step"));

document.querySelectorAll("[data-verb-choice]").forEach((button) => {
  button.addEventListener("click", () => answerVerbChoice(button.dataset.verbChoice));
});

document.querySelectorAll("[data-needs-be]").forEach((button) => {
  button.addEventListener("click", () => answerNeedsBe(button.dataset.needsBe));
});

document.querySelectorAll("[data-be-form]").forEach((button) => {
  button.addEventListener("click", () => answerBeForm(button.dataset.beForm));
});

document.querySelectorAll("[data-sentence-judgment]").forEach((button) => {
  button.addEventListener("click", () => answerSentenceJudgment(button.dataset.sentenceJudgment));
});

document.querySelectorAll("[data-verb-count]").forEach((button) => {
  button.addEventListener("click", () => answerVerbCount(button.dataset.verbCount));
});

el.submitVerbsBtn.addEventListener("click", submitVerbTokens);
el.resetBuilderBtn.addEventListener("click", resetSentenceBuilder);
el.confirmBuilderBtn.addEventListener("click", submitSentenceBuilder);
el.resetUnderlineBtn.addEventListener("click", resetSentenceUnderline);
el.confirmUnderlineBtn.addEventListener("click", submitSentenceUnderline);

updateMenuProgress();
syncPracticeCount();
syncSoundToggle();
updateLiveStats();
