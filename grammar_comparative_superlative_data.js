// Comparative and superlative fill-in bank for Battleship grammar mode.
// Supports one or more blanks through answerSlots.
(function () {
    const rows = [
        ["這個信封太小。我需要一個較大的。", "This envelope is too small. I need a ______ one than this.", ["larger"], "Use the comparative form before than.", "comparatives"],
        ["這條裙太長。你可以把它改短一點嗎？", "This dress is too long. Can you make it ______?", ["shorter"], "Short adjectives usually add -er.", "comparatives"],
        ["我們明天要早一點起床。", "I'll have to get up a bit ______ tomorrow morning.", ["earlier"], "Early changes y to i before -er.", "comparatives"],
        ["我今晚不能完成這個項目。我需要更多時間。", "I can't finish the project tonight. I need ______ time.", ["more"], "Use more for a larger amount.", "quantities"],
        ["你還有進一步問題嗎？", "Do you have any ______ questions to ask?", ["further"], "Further is commonly used for abstract ideas.", "comparatives", [["farther"]]],
        ["你的英語比 Owen 的好。", "Your English is ______ than Owen's.", ["better"], "Good becomes better.", "irregular"],
        ["Karen 懂的外語比我多。", "Karen knows ______ foreign languages than I do.", ["more"], "Use more before plural countable nouns.", "quantities"],
        ["我不能再留在這裏了。", "I can't stay here any ______.", ["longer"], "Use any longer in negative sentences.", "comparatives"],
        ["這間餐廳是城中最便宜的。", "It's ______ one in town.", ["the cheapest"], "Use the before a superlative.", "superlatives"],
        ["中環廣場是香港最高的建築物之一。", "Central Plaza is one of ______ buildings in Hong Kong.", ["the tallest"], "Use one of + the + superlative + plural noun.", "superlatives"],
        ["我的腳很痛。我不能再走更遠。", "My legs hurt. I can't walk any ______.", ["farther"], "Far has farther/further as comparative forms.", "irregular", [["further"]]],
        ["Kelly 比我年長。", "Kelly is ______ than I am.", ["older"], "Use older for age comparison.", "comparatives"],
        ["去中環最快的方法是甚麼？", "What's ______ way to get to Central?", ["the quickest"], "Use the before a superlative.", "superlatives"],
        ["除非你有更好的主意，否則我們跟原計劃。", "We'll follow our original plan unless you have a ______ idea.", ["better"], "Good becomes better.", "irregular"],
        ["如果我們跑，去港鐵站會少於十分鐘。", "If we run, it'll take us ______ than ten minutes to get to the MTR station.", ["less"], "Use less than with time amounts.", "quantities"],
        ["那是我吃過最好的一餐。", "It was ______ meal I've ever had.", ["the best"], "Good becomes the best.", "irregular"],
        ["三兄弟之中，Sam 最高。", "Of the three brothers, Sam is ______.", ["the tallest"], "Use the + superlative for three or more people.", "superlatives"],
        ["Sam 是他家中最高的。", "Sam is ______ in his family.", ["the tallest"], "Use in for a family or group.", "in_of"],
        ["在所有賽跑選手中，Danny 跑得最快。", "Of all the runners in the race, Danny ran ______.", ["the fastest"], "Use the + superlative adverb.", "superlatives"],
        ["淺水灣有香港最美麗的海灘。", "Repulse Bay has ______ beach in Hong Kong.", ["the most beautiful"], "Use most with longer adjectives.", "superlatives"],
        ["這是香港保養得最美麗的海灘之一。", "It features one of ______ maintained beaches in Hong Kong.", ["the most beautifully"], "Use most with longer adverbs.", "superlatives"],
        ["Robbie 是黃先生和黃太太孩子中最年輕的。", "Robbie is ______ of Mr and Mrs Wong's children.", ["the youngest"], "Use of with a plural noun group.", "in_of"],
        ["她是他們之中最好的排球員。", "She is ______ volleyball player of them all.", ["the best"], "Use of with pronouns such as them all.", "in_of"],
        ["昨天是今年最冷的一天。", "Yesterday was ______ day of the year.", ["the coldest"], "Use of for a period of time.", "in_of"],
        ["香港動植物公園是香港最古老的公園之一。", "The Hong Kong Zoological and Botanical Gardens is one of ______ parks in Hong Kong.", ["the oldest"], "Use one of + the + superlative + plural noun.", "superlatives"],
        ["那是我看過最好的電影。", "That was ______ film I have ever seen.", ["the best"], "Use have ever + past participle after a superlative.", "ever_pp"],
        ["你去過最奇怪的地方是甚麼？", "What is ______ place you've ever visited?", ["the strangest"], "Use the + superlative before have ever.", "ever_pp"],
        ["Tammy 是我們學校最好的。", "Tammy is ______ in our school.", ["the best"], "The noun can be left out after a superlative.", "superlatives"],
        ["這條頸鏈是珠寶店裏最貴的。", "This necklace is ______ in the jewellery shop.", ["the most expensive"], "Use most with longer adjectives.", "superlatives"],
        ["Stella 在所有同學中有最多模型。", "Of all my classmates, Stella has ______ figurines.", ["the most"], "Use the most for the largest quantity.", "quantities"],
        ["Fred 對我們的提議興趣最少。", "Fred showed ______ interest in our proposal.", ["the least"], "Use the least for the smallest amount.", "quantities"],
        ["三條朱古力之中，這條添加劑最少。", "Of the three chocolate bars, this one has ______ additives.", ["the fewest"], "Use the fewest for the smallest number.", "quantities"],
        ["Alice 是黃先生和黃太太的孩子中最年長的。", "Alice is ______ of Mr and Mrs Wong's children.", ["the eldest"], "Use eldest for position in a family.", "irregular"],
        ["坐在墊子上會較舒服。", "Why don't you sit on a cushion? It's ______ comfortable.", ["more"], "Use more before a long adjective.", "comparatives"],
        ["七十元不夠。入場費你需要更多錢。", "Seventy dollars isn't enough. You'll need ______ for the entrance fee.", ["more"], "Use more for a larger amount.", "quantities"],
        ["Tim 有一個哥哥。", "Tim has an ______ brother.", ["elder"], "Use elder before brother/sister in family relationships.", "irregular"],
        ["星期日沙灘的人比我們預期少。", "There were ______ people than we expected.", ["fewer"], "Use fewer with countable plural nouns.", "quantities"],
        ["Kenny 在所有參與者中說得最少。", "Kenny spoke ______ of all the participants.", ["the least"], "Use the least as a superlative adverb/quantity expression.", "quantities"],
        ["那是他人生中最糟糕的日子之一。", "It was one of ______ days of his life.", ["the worst"], "Bad becomes the worst.", "irregular"],
        ["她告訴父母真相後感覺好些。", "She felt ______ after she told her parents the truth.", ["better"], "Good/well becomes better.", "irregular"],
        ["他的胃痛越來越差。", "His stomach ache was getting ______.", ["worse"], "Bad becomes worse.", "irregular"],
        ["所有月份中，二月日數最少。", "Of all the months, February has ______ days.", ["the fewest"], "Use the fewest with countable plural nouns.", "quantities"],
        ["Mike 跑得比 Wayne 快。", "Mike runs ______ than Wayne.", ["faster"], "Fast becomes faster.", "comparatives"],
        ["Wayne 會表現得更好。", "Wayne will perform ______ because he is stronger.", ["better"], "Well becomes better.", "adverbs"],
        ["長跑需要較強壯的身體。", "Long-distance running requires a ______ body.", ["stronger"], "Strong becomes stronger.", "comparatives"],
        ["Mike 冷靜得多。", "Mike is a lot ______ than Wayne.", ["calmer"], "Calm becomes calmer.", "comparatives"],
        ["Mike 更專注。", "Mike is ______ than Wayne.", ["more focused"], "Use more with focused.", "comparatives"],
        ["Mike 會更快到達終點。", "He'll reach the finish line ______.", ["more quickly"], "Use more with longer adverbs.", "adverbs"],
        ["這會是最刺激的項目之一。", "It is going to be one of ______ events.", ["the most exciting"], "Use most with exciting.", "superlatives"],
        ["Mr Fung 比 Henry 更有經驗。", "Mr Fung is ______ than Henry.", ["more experienced"], "Use more with experienced.", "comparatives"],
        ["Henry 年輕得多。", "Henry is a lot ______.", ["younger"], "Young becomes younger.", "comparatives"],
        ["誰有更多支持者？", "I wonder who has ______ supporters.", ["more"], "Use more for a larger number.", "quantities", [["the most"]]],
        ["Mr Fung 是我們最受敬佩的老師之一。", "Mr Fung is one of our ______ teachers.", ["most admired"], "After our, do not add the before most admired.", "superlatives"],
        ["三人之中 Henry 會最快。", "Henry would be ______ of the three.", ["the fastest"], "Use the + superlative of the three.", "superlatives"],
        ["看 Henry、Mike 和 Wayne 一起比賽會更有趣。", "It would be even ______ to see them compete together.", ["more interesting"], "Use more with interesting.", "comparatives"],
        ["手機會令我們更容易聯絡爺爺。", "A mobile phone will make it ______ for us to reach Grandpa.", ["easier"], "Easy changes y to i before -er.", "comparatives", [["more convenient"]]],
        ["對爺爺來說最好的手機是甚麼？", "What is ______ mobile phone for him?", ["the best"], "Good becomes the best.", "irregular"],
        ["現時最受歡迎的選擇是最新款智能電話。", "Nowadays ______ choices are ______ smartphone models.", ["the most popular", "the latest"], "Use superlatives for the top choices and newest models.", "superlatives"],
        ["你要更小心選老人手機。", "You'll need to choose ______.", ["more carefully"], "Use more with longer adverbs.", "adverbs"],
        ["爺爺喜歡功能較簡單的電話。", "Grandpa likes a phone with ______ functions.", ["simpler"], "Simple becomes simpler.", "comparatives"],
        ["爺爺可以更容易操作那部電話。", "He can handle it ______.", ["more easily"], "Use more with easily.", "adverbs", [["more comfortably"]]],
        ["爺爺開始時比我預期更高興。", "He started off ______ than I expected.", ["more cheerily"], "Use more with cheerily.", "adverbs"],
        ["面對面下棋比手機下棋刺激得多。", "It was way ______ to play chess face-to-face.", ["more exciting"], "Use more with exciting.", "comparatives"],
        ["爺爺可以更舒服地閱讀報紙。", "He can read newspapers ______.", ["more comfortably"], "Use more with comfortably.", "adverbs", [["more easily"]]],
        ["爺爺不需要比打電話更複雜的東西。", "He doesn't need anything ______ than that.", ["more complicated"], "Use more with complicated.", "comparatives"],
        ["找合適的老人手機比預期困難。", "It is ______ than I expected.", ["harder"], "Hard becomes harder.", "comparatives"],
        ["你需要比平時更徹底地搜尋。", "You need to search ______ than usual.", ["more thoroughly"], "Use more with thoroughly.", "adverbs"],
        ["大按鈕令撥號更方便。", "Large buttons make it ______ to dial.", ["more convenient"], "Use more with convenient.", "comparatives", [["easier"]]],
        ["求助按鈕令電話在緊急情況更實用。", "This function makes it ______ than other models in case of emergency.", ["more practical"], "Use more with practical.", "comparatives"],
        ["Micky's 供應三間餐廳中最大碗的雲吞麵。", "Micky's serves ______ bowl of noodles.", ["the biggest"], "Big doubles g before -est.", "superlatives"],
        ["Ting Kee 的份量比 Micky's 小。", "Ting Kee's servings are ______ than Micky's.", ["smaller"], "Small becomes smaller.", "comparatives"],
        ["Ting Kee 的雲吞更多。", "They include ______ wontons.", ["more"], "Use more for a larger number.", "quantities"],
        ["Ting Kee 的雲吞麵較便宜。", "They are ______.", ["cheaper"], "Cheap becomes cheaper.", "comparatives"],
        ["Old Hong Kong 的價格最低。", "The price at Old Hong Kong is ______.", ["the lowest"], "Use the before a superlative.", "superlatives"],
        ["Old Hong Kong 的份量最小。", "The servings are ______.", ["the smallest"], "Use the before a superlative.", "superlatives"],
        ["Old Hong Kong 的雲吞最少。", "They have ______ wontons.", ["the fewest"], "Use the fewest with countable plural nouns.", "quantities"],
        ["Old Hong Kong 的麵在三間餐廳中最軟。", "Their noodles are ______ among the three restaurants.", ["the softest"], "Use the before a superlative.", "superlatives"],
        ["Ting Kee 的湯底味道較淡。", "Ting Kee's soup is ______ in taste than the others.", ["lighter"], "Light becomes lighter.", "comparatives"],
        ["Micky's 的湯比另外兩間較油膩。", "Micky's soup is ______ than the soup at the other two restaurants.", ["oilier"], "Oily changes y to i before -er.", "comparatives"],
        ["Micky's 得分最高。", "Micky's earned ______ score.", ["the highest"], "Use the before a superlative.", "superlatives"],
        ["它的價錢令這碗麵成為三間餐廳中最貴的一碟。", "Its price tag makes it ______ dish among the three restaurants.", ["the most expensive"], "Use most with expensive.", "superlatives"],
        ["Ting Kee 比 Micky's 受歡迎。", "Ting Kee is ______ than Micky's.", ["more popular"], "Use more with popular.", "comparatives"],
        ["Ting Kee 以較低價格提供食物。", "Ting Kee offers dishes at ______ prices.", ["lower"], "Low becomes lower.", "comparatives"],
        ["其食物質素未必更好。", "The quality of its food may not be ______.", ["better"], "Good becomes better.", "irregular"],
        ["這道數學題是整份試卷中最難的題目之一。", "This is one of ______ problems ______ the entire test.", ["the most difficult", "in"], "Use one of + superlative + plural noun + in for a test.", "one_of"],
        ["Carl 是我們樂隊最好的結他手之一。", "Carl is one of ______ guitar players ______ our band.", ["the best", "in"], "Use in for a group or organization.", "one_of"],
        ["昨天是我人生中最幸運的日子之一。", "Yesterday was one of ______ days ______ my life.", ["the luckiest", "of"], "Use of for a period or life experience.", "one_of"],
        ["你的房間是屋裏最漂亮的房間之一。", "It is one of ______ rooms ______ the house.", ["the nicest", "in"], "Use in for a place.", "one_of"],
        ["這是我見過最美麗的雕塑之一。", "This is one of ______ sculptures I have ever seen.", ["the most beautiful"], "Use have ever seen after a superlative.", "ever_pp"],
        ["這是這個國家最古老的畫作之一。", "It is one of ______ paintings ______ the country.", ["the oldest", "in"], "Use in for a country.", "one_of"],
        ["昨天是今年最熱的日子之一。", "Yesterday was one of ______ days ______ the year.", ["the hottest", "of"], "Use of for a period of time.", "one_of"],
        ["昨天是這個月最忙碌的日子之一。", "Yesterday was one of ______ days ______ the month.", ["the busiest", "of"], "Busy changes y to i before -est.", "one_of"],
        ["她的頭髮比我的短。", "Her hair is ______ than mine.", ["shorter"], "Compare the same category: hair with mine.", "comparatives"],
        ["我的妹妹社交媒體帳戶比我多。", "My sister has ______ social media accounts than I do.", ["more"], "Use more with plural countable nouns.", "quantities"],
        ["現今看電視的人較少。", "______ people watch TV these days.", ["Fewer"], "Use fewer with countable plural nouns.", "quantities"],
        ["Sally 的多媒體製作經驗比 Alan 少。", "Sally has ______ experience than Alan does.", ["less"], "Use less with uncountable nouns.", "quantities"],
        ["這隻狗比那隻豹跑得更快，令人難以置信。", "The dog runs ______ than the leopard.", ["more quickly"], "Use more with quickly as a comparative adverb.", "adverbs", [["faster"]]],
        ["Claire 比我年輕。", "Claire is ______ than I am.", ["younger"], "Young becomes younger.", "comparatives"],
        ["這座摩天大樓是城市裏最高的建築物。", "It is ______ building ______ the city.", ["the tallest", "in"], "Use in for a place.", "in_of"],
        ["所有學生之中，May 寫得最仔細。", "Of all the students, May writes ______.", ["the most carefully"], "Use most with long adverbs.", "adverbs"],
        ["這部相機比那部輕。", "This camera is ______ than that one.", ["lighter"], "Light becomes lighter.", "comparatives"],
        ["這條路比那條安全。", "This road is ______ than that one.", ["safer"], "Safe becomes safer.", "comparatives"],
        ["這本小說比那本有趣。", "This novel is ______ than that one.", ["more interesting"], "Use more with interesting.", "comparatives"],
        ["這次考試比上次容易。", "This test is ______ than the last one.", ["easier"], "Easy changes y to i before -er.", "comparatives"],
        ["這是班中最容易的問題。", "This is ______ question in the class.", ["the easiest"], "Easy changes y to i before -est.", "superlatives"],
        ["她比哥哥細心得多。", "She is much ______ than her brother.", ["more careful"], "Use more with careful.", "comparatives"],
        ["她是班中最細心的學生。", "She is ______ student in the class.", ["the most careful"], "Use most with careful.", "superlatives"],
        ["今天比昨天暖。", "Today is ______ than yesterday.", ["warmer"], "Warm becomes warmer.", "comparatives"],
        ["七月通常是一年中最熱的月份之一。", "July is usually one of ______ months ______ the year.", ["the hottest", "of"], "Use one of + the + superlative + plural noun.", "one_of"],
        ["這條問題比上一條更複雜。", "This question is ______ than the last one.", ["more complicated"], "Use more with complicated.", "comparatives"],
        ["所有方法中，這個方法最實用。", "Of all the methods, this one is ______.", ["the most practical"], "Use most with practical.", "superlatives"],
        ["我們需要更少糖。", "We need ______ sugar.", ["less"], "Sugar is uncountable, so use less.", "quantities"],
        ["我們需要較少椅子。", "We need ______ chairs.", ["fewer"], "Chairs are countable, so use fewer.", "quantities"],
        ["這部電腦比我的快。", "This computer is ______ than mine.", ["faster"], "Fast becomes faster.", "comparatives"],
        ["這是我用過最快的電腦。", "This is ______ computer I have ever used.", ["the fastest"], "Use have ever + past participle after a superlative.", "ever_pp"],
        ["這個地方是我去過最安靜的地方。", "This is ______ place I have ever visited.", ["the quietest"], "Use the + superlative before have ever.", "ever_pp"],
        ["這是我們做過最重要的決定之一。", "This is one of ______ decisions we have ever made.", ["the most important"], "Use one of + the + superlative + plural noun.", "ever_pp"],
        ["這位歌手比去年受歡迎。", "This singer is ______ than last year.", ["more popular"], "Use more with popular.", "comparatives"],
        ["她是學校裏最受歡迎的學生之一。", "She is one of ______ students ______ school.", ["the most popular", "in"], "Use in for a school.", "one_of"],
        ["這個答案比你的答案準確。", "This answer is ______ than yours.", ["more accurate"], "Use more with accurate.", "comparatives"],
        ["這是所有答案中最準確的。", "This is ______ answer of all.", ["the most accurate"], "Use most with accurate.", "superlatives"],
        ["這條河比那條深。", "This river is ______ than that one.", ["deeper"], "Deep becomes deeper.", "comparatives"],
        ["這是國內最深的湖。", "This is ______ lake in the country.", ["the deepest"], "Use the before a superlative.", "superlatives"],
        ["這個袋比那個重。", "This bag is ______ than that one.", ["heavier"], "Heavy changes y to i before -er.", "comparatives"],
        ["這是店裏最重的行李箱。", "This is ______ suitcase in the shop.", ["the heaviest"], "Heavy changes y to i before -est.", "superlatives"],
        ["他比以前更努力工作。", "He works ______ than before.", ["harder"], "Hard becomes harder as an adverb.", "adverbs"],
        ["她在隊中工作最努力。", "She works ______ in the team.", ["the hardest"], "Use the + superlative adverb.", "adverbs"],
        ["這個解釋比老師的更清楚。", "This explanation is ______ than the teacher's.", ["clearer"], "Clear becomes clearer.", "comparatives"],
        ["這是書中最清楚的解釋。", "This is ______ explanation in the book.", ["the clearest"], "Use the before a superlative.", "superlatives"],
        ["這次旅行比上次令人興奮。", "This trip is ______ than the last one.", ["more exciting"], "Use more with exciting.", "comparatives"],
        ["這是我參加過最令人興奮的旅行。", "This is ______ trip I have ever joined.", ["the most exciting"], "Use have ever + past participle after a superlative.", "ever_pp"],
        ["這部電影沒有那部那麼長。", "This film is ______ than that one.", ["shorter"], "Short becomes shorter.", "comparatives"],
        ["這是三部電影中最短的。", "This is ______ of the three films.", ["the shortest"], "Use of with plural noun phrases.", "in_of"],
        ["這個方案比舊方案好。", "This plan is ______ than the old one.", ["better"], "Good becomes better.", "irregular"],
        ["這是所有方案中最好的。", "This is ______ plan of all.", ["the best"], "Good becomes the best.", "irregular"],
        ["他的成績比上次差。", "His result is ______ than last time.", ["worse"], "Bad becomes worse.", "irregular"],
        ["這是他今年最差的成績。", "This is ______ result this year.", ["the worst"], "Bad becomes the worst.", "irregular"],
        ["這條路比另一條遠。", "This route is ______ than the other one.", ["farther"], "Farther/further can describe distance.", "irregular", [["further"]]],
        ["這是離學校最遠的站。", "This is ______ stop from school.", ["the farthest"], "Farthest/furthest can describe distance.", "irregular", [["the furthest"]]]
    ];

    function normalizeCategory(category) {
        return String(category || 'comparative_superlative')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '') || 'comparative_superlative';
    }

    function joinSlots(slots) {
        return (Array.isArray(slots) ? slots : [slots])
            .map(slot => String(slot || '').trim())
            .filter(Boolean)
            .join(' ');
    }

    const PROMPT_OVERRIDES = {
        'the best': 'good',
        better: 'good',
        'the worst': 'bad',
        worse: 'bad',
        'the farthest': 'far',
        'the furthest': 'far',
        farther: 'far',
        further: 'far',
        'the eldest': 'old',
        elder: 'old',
        'the most': 'many/much',
        more: 'many/much',
        'the least': 'little',
        less: 'little',
        'the fewest': 'few',
        fewer: 'few',
        'the latest': 'late',
        'most admired': 'admired',
        larger: 'large',
        longer: 'long',
        stronger: 'strong',
        younger: 'young',
        simpler: 'simple',
        safer: 'safe',
        'the youngest': 'young',
        'the strangest': 'strange',
        'the nicest': 'nice',
        'the simplest': 'simple',
        'the safest': 'safe',
        biggest: 'big',
        'the biggest': 'big',
        hottest: 'hot',
        'the hottest': 'hot',
        thinnest: 'thin',
        'the thinnest': 'thin',
        fattest: 'fat',
        'the fattest': 'fat',
        oilier: 'oily',
        'the oiliest': 'oily'
    };

    function stripComparisonMarkers(answer) {
        return String(answer || '')
            .trim()
            .toLowerCase()
            .replace(/^the\s+/, '')
            .replace(/^most\s+/, '')
            .replace(/^more\s+/, '');
    }

    function inferPromptWord(answer) {
        const normalized = String(answer || '').trim().toLowerCase().replace(/\s+/g, ' ');
        if (!normalized || normalized === 'in' || normalized === 'of') return '';
        if (PROMPT_OVERRIDES[normalized]) return PROMPT_OVERRIDES[normalized];

        const baseCandidate = stripComparisonMarkers(normalized);
        if (PROMPT_OVERRIDES[baseCandidate]) return PROMPT_OVERRIDES[baseCandidate];
        if (baseCandidate.includes(' ')) return baseCandidate;
        if (baseCandidate.endsWith('iest')) return `${baseCandidate.slice(0, -4)}y`;
        if (baseCandidate.endsWith('ier')) return `${baseCandidate.slice(0, -3)}y`;
        if (baseCandidate.endsWith('est')) {
            const stem = baseCandidate.slice(0, -3);
            if (/([b-df-hj-np-tv-z])\1$/i.test(stem) && !/(ss|ll|zz)$/i.test(stem)) return stem.slice(0, -1);
            return stem;
        }
        if (baseCandidate.endsWith('er')) {
            const stem = baseCandidate.slice(0, -2);
            if (/([b-df-hj-np-tv-z])\1$/i.test(stem) && !/(ss|ll|zz)$/i.test(stem)) return stem.slice(0, -1);
            return stem;
        }
        return baseCandidate;
    }

    function buildPromptedQuestion(question, answerSlots) {
        let slotIndex = 0;
        return String(question || '').replace(/______/g, () => {
            const promptWord = inferPromptWord(answerSlots[slotIndex]);
            slotIndex += 1;
            return promptWord ? `______ (${promptWord})` : '______';
        });
    }

    window.GRAMMAR_COMPARATIVE_SUPERLATIVE_BANK = rows.map((row, index) => {
        const [chinese, question, slots, hint, category, alternatives] = row;
        const answerSlots = Array.isArray(slots) ? slots.map(slot => String(slot || '').trim()) : [String(slots || '').trim()];
        const acceptedAnswers = [joinSlots(answerSlots)];
        (Array.isArray(alternatives) ? alternatives : []).forEach((alternative) => {
            acceptedAnswers.push(Array.isArray(alternative) ? joinSlots(alternative) : String(alternative || '').trim());
        });
        const cleanCategory = normalizeCategory(category);

        return {
            id: `comparative_superlative_${String(index + 1).padStart(3, '0')}`,
            chinese,
            tense: 'comparative_superlative',
            voice: cleanCategory,
            tenses: ['comparative_superlative'],
            voices: [cleanCategory],
            category: cleanCategory,
            question: buildPromptedQuestion(question, answerSlots),
            answers: Array.from(new Set(acceptedAnswers.filter(Boolean))),
            answerSlots,
            exp: hint
        };
    });
})();
