// Generated from eng_game_direct_question_rearrange.html.
// Keep this data file declarative; gameplay lives in ui-grammar.js.
(function () {
    window.GRAMMAR_DIRECT_QUESTION_RULES = {
    "1": "Modal Verb（情態助動詞）：當真問句有（can/will/should/may/must）必須緊隨 Wh-word（如果有的話），並在主語之前。",
    "2": "Do/Does/Did（一般動詞）：當句子有主動動詞，又沒有Modal Verb或 Have/Has類時，使用 Do/Does/Did。現在式用Do/Does. 過去式用Did. 緊記主要動詞必須保持原形。",
    "3": "Have/Has（完成式）：使用 Have/Has 作為提問字。如果詢問經驗，使用 Have + 主語 + ever + 過去分詞（P.P.）。如果題目有\"一直\", 使用Have + 主語 + been + ving。如果題目有\"已經被/一直被\", 使用Have + 主語 + been + pp",
    "4": "Be 動詞（is/am/are/was/were）：真問句出現進行式 (V-ing)、被動語態 (P.P.) 或連接形容詞/名詞。Be 動詞用作提問字。",
    "5": "Wh-word + 複合名詞：'甚麼/幾 + 名詞/形容詞' 必須結合成一個 Wh-phrase（例如：What books / How expensive）放在句首。",
    "6": "無主語問句：如果 Wh-word（Who/Which）是句子的主語，則通常不需要提問字（直接接動詞，動詞須符合時態）。",
    "7": "How to：'如何' 問句如果沒有明確的主語，使用 'How to do sth' 結構。",
    "8": "結構大忌：避免中式英文結構：❌ Wh-word + 主語...（例如：Why you like cats?）。"
};

    window.GRAMMAR_DIRECT_QUESTION_BANK = [
    {
        "id": "direct_question_001",
        "rule": 1,
        "chinese": "你會幾時到達(arrive)?",
        "correct_tokens": [
            [
                "When",
                "will",
                "you",
                "arrive",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "did",
            "can"
        ]
    },
    {
        "id": "direct_question_002",
        "rule": 2,
        "chinese": "他們昨天做了甚麼?",
        "correct_tokens": [
            [
                "What",
                "did",
                "they",
                "do",
                "yesterday",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "have",
            "done",
            "doing"
        ]
    },
    {
        "id": "direct_question_003",
        "rule": 3,
        "chinese": "你最近看到Tom嗎? (recently)",
        "correct_tokens": [
            [
                "Have",
                "you",
                "seen",
                "Tom",
                "recently",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "are",
            "seeing",
            "see"
        ]
    },
    {
        "id": "direct_question_004",
        "rule": 4,
        "chinese": "中國正在發展甚麼?",
        "correct_tokens": [
            [
                "What",
                "is",
                "China",
                "developing",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "has",
            "develop"
        ]
    },
    {
        "id": "direct_question_005",
        "rule": 5,
        "chinese": "這輛車幾貴? (How expensive)",
        "correct_tokens": [
            [
                "How",
                "expensive",
                "is",
                "this",
                "car",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "do",
            "can",
            "price"
        ]
    },
    {
        "id": "direct_question_006",
        "rule": 6,
        "chinese": "誰偷了我的銀包？",
        "correct_tokens": [
            [
                "Who",
                "stole",
                "my",
                "wallet",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "does",
            "is",
            "steals"
        ]
    },
    {
        "id": "direct_question_007",
        "rule": 7,
        "chinese": "如何打開窗門？(無主語)",
        "correct_tokens": [
            [
                "How",
                "to",
                "open",
                "the",
                "window",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "does",
            "can",
            "is"
        ]
    },
    {
        "id": "direct_question_008",
        "rule": 1,
        "chinese": "為甚麼你可以進入這房間?",
        "correct_tokens": [
            [
                "Why",
                "can",
                "you",
                "enter",
                "this",
                "room",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "are",
            "enter"
        ]
    },
    {
        "id": "direct_question_009",
        "rule": 3,
        "chinese": "你已經被警告了嗎? (warned)",
        "correct_tokens": [
            [
                "Have",
                "you",
                "been",
                "warned",
                "?"
            ]
        ],
        "distractors": [
            "are",
            "did",
            "warning",
            "was"
        ]
    },
    {
        "id": "direct_question_010",
        "rule": 4,
        "chinese": "這酒店在哪裡?",
        "correct_tokens": [
            [
                "Where",
                "is",
                "this",
                "hotel",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "has",
            "located",
            "do"
        ]
    },
    {
        "id": "direct_question_011",
        "rule": 5,
        "chinese": "你要幾多個蘋果? (How many)",
        "correct_tokens": [
            [
                "How",
                "many",
                "apples",
                "do",
                "you",
                "need",
                "?"
            ]
        ],
        "distractors": [
            "much",
            "are",
            "is",
            "want"
        ]
    },
    {
        "id": "direct_question_012",
        "rule": 6,
        "chinese": "誰將會贏出比賽?",
        "correct_tokens": [
            [
                "Who",
                "will",
                "win",
                "the",
                "game",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "is",
            "winning",
            "wins"
        ]
    },
    {
        "id": "direct_question_013",
        "rule": 1,
        "chinese": "你應當把錢藏在哪裡? (should)",
        "correct_tokens": [
            [
                "Where",
                "should",
                "you",
                "hide",
                "the",
                "money",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "are",
            "hiding"
        ]
    },
    {
        "id": "direct_question_014",
        "rule": 1,
        "chinese": "我們現在可以開始嗎? (Can)",
        "correct_tokens": [
            [
                "Can",
                "we",
                "start",
                "now",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "are",
            "starting"
        ]
    },
    {
        "id": "direct_question_015",
        "rule": 1,
        "chinese": "他們如何才能完成這個項目?",
        "correct_tokens": [
            [
                "How",
                "can",
                "they",
                "finish",
                "the",
                "project",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "are",
            "finished"
        ]
    },
    {
        "id": "direct_question_016",
        "rule": 1,
        "chinese": "他們會接受我的提議嗎? (Will)",
        "correct_tokens": [
            [
                "Will",
                "they",
                "accept",
                "my",
                "offer",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "are",
            "accepting"
        ]
    },
    {
        "id": "direct_question_017",
        "rule": 1,
        "chinese": "幾時他們必須交報告? (must)",
        "correct_tokens": [
            [
                "When",
                "must",
                "they",
                "submit",
                "the",
                "report",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "are",
            "submitted"
        ]
    },
    {
        "id": "direct_question_018",
        "rule": 1,
        "chinese": "你會參加派對嗎? (Will)",
        "correct_tokens": [
            [
                "Will",
                "you",
                "join",
                "the",
                "party",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "are",
            "joining"
        ]
    },
    {
        "id": "direct_question_019",
        "rule": 1,
        "chinese": "我應該相信誰? (should)",
        "correct_tokens": [
            [
                "Who",
                "should",
                "I",
                "believe",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "am",
            "believing"
        ]
    },
    {
        "id": "direct_question_020",
        "rule": 1,
        "chinese": "我可以借用你的筆嗎? (May)",
        "correct_tokens": [
            [
                "May",
                "I",
                "borrow",
                "your",
                "pen",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "am",
            "borrowing"
        ]
    },
    {
        "id": "direct_question_021",
        "rule": 1,
        "chinese": "為甚麼我們必須學習歷史? (must)",
        "correct_tokens": [
            [
                "Why",
                "must",
                "we",
                "study",
                "history",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "are",
            "studying"
        ]
    },
    {
        "id": "direct_question_022",
        "rule": 1,
        "chinese": "她會原諒他嗎? (Will)",
        "correct_tokens": [
            [
                "Will",
                "she",
                "forgive",
                "him",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "is",
            "forgiving"
        ]
    },
    {
        "id": "direct_question_023",
        "rule": 3,
        "chinese": "她一直等了你多久?",
        "correct_tokens": [
            [
                "How",
                "long",
                "has",
                "she",
                "been",
                "waiting",
                "for",
                "you",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "was",
            "waited",
            "waits"
        ]
    },
    {
        "id": "direct_question_024",
        "rule": 3,
        "chinese": "你一直有在學習嗎?",
        "correct_tokens": [
            [
                "Have",
                "you",
                "been",
                "studying",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "are",
            "studied"
        ]
    },
    {
        "id": "direct_question_025",
        "rule": 3,
        "chinese": "他們一直在玩電子遊戲嗎?",
        "correct_tokens": [
            [
                "Have",
                "they",
                "been",
                "playing",
                "video",
                "games",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "are",
            "played"
        ]
    },
    {
        "id": "direct_question_026",
        "rule": 3,
        "chinese": "過去這星期誰一直在下雨?",
        "correct_tokens": [
            [
                "What",
                "has",
                "been",
                "raining",
                "this",
                "week",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "is",
            "rains"
        ]
    },
    {
        "id": "direct_question_027",
        "rule": 3,
        "chinese": "他們一直在討論這個問題嗎?",
        "correct_tokens": [
            [
                "Have",
                "they",
                "been",
                "discussing",
                "the",
                "issue",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "are",
            "discussed"
        ]
    },
    {
        "id": "direct_question_028",
        "rule": 3,
        "chinese": "這本書已經被翻譯了嗎? (translated)",
        "correct_tokens": [
            [
                "Has",
                "the",
                "book",
                "been",
                "translated",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "was",
            "translating"
        ]
    },
    {
        "id": "direct_question_029",
        "rule": 3,
        "chinese": "哪些規則已經被改變了? (changed)",
        "correct_tokens": [
            [
                "Which",
                "rules",
                "have",
                "been",
                "changed",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "were",
            "changing"
        ]
    },
    {
        "id": "direct_question_030",
        "rule": 3,
        "chinese": "這次會議已經被安排了嗎? (arranged)",
        "correct_tokens": [
            [
                "Has",
                "the",
                "meeting",
                "been",
                "arranged",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "was",
            "arranging"
        ]
    },
    {
        "id": "direct_question_031",
        "rule": 3,
        "chinese": "這些舊電腦已經被賣到哪裡了? (sold)",
        "correct_tokens": [
            [
                "Where",
                "have",
                "these",
                "old",
                "computers",
                "been",
                "sold",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "were",
            "selling"
        ]
    },
    {
        "id": "direct_question_032",
        "rule": 3,
        "chinese": "你的工作已經被完成了嗎? (finished)",
        "correct_tokens": [
            [
                "Has",
                "your",
                "work",
                "been",
                "finished",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "was",
            "finishing"
        ]
    },
    {
        "id": "direct_question_033",
        "rule": 2,
        "chinese": "你喜歡那個新老師嗎? ",
        "correct_tokens": [
            [
                "Do",
                "you",
                "like",
                "the",
                "new",
                "teacher",
                "?"
            ]
        ],
        "distractors": [
            "are",
            "have",
            "liked"
        ]
    },
    {
        "id": "direct_question_034",
        "rule": 2,
        "chinese": "他為甚麼要說謊? (Does)",
        "correct_tokens": [
            [
                "Why",
                "does",
                "he",
                "tell",
                "a",
                "lie",
                "?"
            ]
        ],
        "distractors": [
            "is",
            "has",
            "told"
        ]
    },
    {
        "id": "direct_question_035",
        "rule": 2,
        "chinese": "你們昨晚有沒有看見我? (Did)",
        "correct_tokens": [
            [
                "Did",
                "you",
                "see",
                "me",
                "last",
                "night",
                "?"
            ]
        ],
        "distractors": [
            "are",
            "have",
            "saw"
        ]
    },
    {
        "id": "direct_question_036",
        "rule": 2,
        "chinese": "你通常幾點起床? ",
        "correct_tokens": [
            [
                "What",
                "time",
                "do",
                "you",
                "usually",
                "get",
                "up",
                "?"
            ]
        ],
        "distractors": [
            "are",
            "have",
            "got"
        ]
    },
    {
        "id": "direct_question_037",
        "rule": 2,
        "chinese": "他們有沒有準時出現? (Did)",
        "correct_tokens": [
            [
                "Did",
                "they",
                "show",
                "up",
                "on",
                "time",
                "?"
            ]
        ],
        "distractors": [
            "are",
            "have",
            "showed"
        ]
    },
    {
        "id": "direct_question_038",
        "rule": 4,
        "chinese": "你現在正在想甚麼? ",
        "correct_tokens": [
            [
                "What",
                "are",
                "you",
                "thinking",
                "now",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "have",
            "thought"
        ]
    },
    {
        "id": "direct_question_039",
        "rule": 4,
        "chinese": "經理正在和客戶說話嗎? ",
        "correct_tokens": [
            [
                "Is",
                "the",
                "manager",
                "talking",
                "to",
                "a",
                "client",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "has",
            "talked"
        ]
    },
    {
        "id": "direct_question_040",
        "rule": 4,
        "chinese": "你昨天下午在做甚麼? ",
        "correct_tokens": [
            [
                "What",
                "were",
                "you",
                "doing",
                "yesterday",
                "afternoon",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "have",
            "do"
        ]
    },
    {
        "id": "direct_question_041",
        "rule": 4,
        "chinese": "天氣正在變冷嗎? ",
        "correct_tokens": [
            [
                "Is",
                "the",
                "weather",
                "getting",
                "cold",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "has",
            "got"
        ]
    },
    {
        "id": "direct_question_042",
        "rule": 4,
        "chinese": "為甚麼他們當時正在笑? ",
        "correct_tokens": [
            [
                "Why",
                "were",
                "they",
                "laughing",
                "then",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "have",
            "laughed"
        ]
    },
    {
        "id": "direct_question_043",
        "rule": 4,
        "chinese": "窗戶是被誰打破的? (broken)",
        "correct_tokens": [
            [
                "Who",
                "was",
                "the",
                "window",
                "broken",
                "by",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "has",
            "break"
        ]
    },
    {
        "id": "direct_question_044",
        "rule": 4,
        "chinese": "這些信件已經被寄出了嗎? (sent)",
        "correct_tokens": [
            [
                "Are",
                "these",
                "letters",
                "sent",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "have",
            "send"
        ]
    },
    {
        "id": "direct_question_045",
        "rule": 4,
        "chinese": "這件衣服是幾時被設計的? (designed)",
        "correct_tokens": [
            [
                "When",
                "was",
                "this",
                "dress",
                "designed",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "has",
            "design"
        ]
    },
    {
        "id": "direct_question_046",
        "rule": 4,
        "chinese": "晚餐煮好了嗎? (cooked)",
        "correct_tokens": [
            [
                "Is",
                "dinner",
                "cooked",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "has",
            "cook"
        ]
    },
    {
        "id": "direct_question_047",
        "rule": 4,
        "chinese": "你的車修好了嗎? (repaired)",
        "correct_tokens": [
            [
                "Is",
                "your",
                "car",
                "repaired",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "has",
            "repair"
        ]
    },
    {
        "id": "direct_question_048",
        "rule": 4,
        "chinese": "你快樂嗎? ",
        "correct_tokens": [
            [
                "Are",
                "you",
                "happy",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "have",
            "happily"
        ]
    },
    {
        "id": "direct_question_049",
        "rule": 4,
        "chinese": "為甚麼他看起來這麼生氣? ",
        "correct_tokens": [
            [
                "Why",
                "is",
                "he",
                "so",
                "angry",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "has",
            "angrily"
        ]
    },
    {
        "id": "direct_question_050",
        "rule": 4,
        "chinese": "她的報告很重要嗎? ",
        "correct_tokens": [
            [
                "Is",
                "her",
                "report",
                "important",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "has",
            "importance"
        ]
    },
    {
        "id": "direct_question_051",
        "rule": 4,
        "chinese": "誰是這個項目的負責人?",
        "correct_tokens": [
            [
                "Who",
                "is",
                "in",
                "charge",
                "of",
                "the",
                "project",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "has",
            "responsible"
        ]
    },
    {
        "id": "direct_question_052",
        "rule": 4,
        "chinese": "他們是醫生嗎? ",
        "correct_tokens": [
            [
                "Are",
                "they",
                "doctors",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "have",
            "doctor"
        ]
    },
    {
        "id": "direct_question_053",
        "rule": 4,
        "chinese": "這是一張舊地圖嗎? ",
        "correct_tokens": [
            [
                "Is",
                "this",
                "an",
                "old",
                "map",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "has",
            "mapping"
        ]
    },
    {
        "id": "direct_question_054",
        "rule": 1,
        "chinese": "你可以幫我一個忙嗎？",
        "correct_tokens": [
            [
                "Can",
                "you",
                "do",
                "me",
                "a",
                "favor",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "are",
            "doing"
        ]
    },
    {
        "id": "direct_question_055",
        "rule": 1,
        "chinese": "明天會下雨嗎？",
        "correct_tokens": [
            [
                "Will",
                "it",
                "rain",
                "tomorrow",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "is",
            "raining"
        ]
    },
    {
        "id": "direct_question_056",
        "rule": 1,
        "chinese": "我應該告訴他真相嗎？",
        "correct_tokens": [
            [
                "Should",
                "I",
                "tell",
                "him",
                "the",
                "truth",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "am",
            "telling"
        ]
    },
    {
        "id": "direct_question_057",
        "rule": 1,
        "chinese": "我們必須現在離開嗎？",
        "correct_tokens": [
            [
                "Must",
                "we",
                "leave",
                "now",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "are",
            "leaving"
        ]
    },
    {
        "id": "direct_question_058",
        "rule": 1,
        "chinese": "我可以進來嗎？",
        "correct_tokens": [
            [
                "May",
                "I",
                "come",
                "in",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "am",
            "coming"
        ]
    },
    {
        "id": "direct_question_059",
        "rule": 1,
        "chinese": "你能再說一遍嗎？",
        "correct_tokens": [
            [
                "Could",
                "you",
                "repeat",
                "that",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "are",
            "repeating"
        ]
    },
    {
        "id": "direct_question_060",
        "rule": 1,
        "chinese": "你想要喝杯茶嗎？",
        "correct_tokens": [
            [
                "Would",
                "you",
                "like",
                "some",
                "tea",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "are",
            "liking"
        ]
    },
    {
        "id": "direct_question_061",
        "rule": 1,
        "chinese": "她會游泳嗎？",
        "correct_tokens": [
            [
                "Can",
                "she",
                "swim",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "is",
            "swimming"
        ]
    },
    {
        "id": "direct_question_062",
        "rule": 1,
        "chinese": "他們會準時到達嗎？",
        "correct_tokens": [
            [
                "Will",
                "they",
                "arrive",
                "on",
                "time",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "are",
            "arriving"
        ]
    },
    {
        "id": "direct_question_063",
        "rule": 1,
        "chinese": "我們可以在這裡等嗎？",
        "correct_tokens": [
            [
                "Should",
                "we",
                "wait",
                "here",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "are",
            "waiting"
        ]
    },
    {
        "id": "direct_question_064",
        "rule": 1,
        "chinese": "我必須穿制服嗎？",
        "correct_tokens": [
            [
                "Must",
                "I",
                "wear",
                "a",
                "uniform",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "am",
            "wearing"
        ]
    },
    {
        "id": "direct_question_065",
        "rule": 1,
        "chinese": "我們可以借這本書嗎？",
        "correct_tokens": [
            [
                "May",
                "we",
                "borrow",
                "this",
                "book",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "are",
            "borrowing"
        ]
    },
    {
        "id": "direct_question_066",
        "rule": 1,
        "chinese": "他會開車嗎？",
        "correct_tokens": [
            [
                "Could",
                "he",
                "drive",
                "a",
                "car",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "is",
            "driving"
        ]
    },
    {
        "id": "direct_question_067",
        "rule": 1,
        "chinese": "你願意加入我們嗎？",
        "correct_tokens": [
            [
                "Would",
                "you",
                "like",
                "to",
                "join",
                "us",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "are",
            "joining"
        ]
    },
    {
        "id": "direct_question_068",
        "rule": 1,
        "chinese": "狗能看到顏色嗎？",
        "correct_tokens": [
            [
                "Can",
                "dogs",
                "see",
                "colors",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "are",
            "seeing"
        ]
    },
    {
        "id": "direct_question_069",
        "rule": 2,
        "chinese": "你認識他嗎？",
        "correct_tokens": [
            [
                "Do",
                "you",
                "know",
                "him",
                "?"
            ]
        ],
        "distractors": [
            "are",
            "have",
            "knowing"
        ]
    },
    {
        "id": "direct_question_070",
        "rule": 2,
        "chinese": "她住在這附近嗎？",
        "correct_tokens": [
            [
                "Does",
                "she",
                "live",
                "near",
                "here",
                "?"
            ]
        ],
        "distractors": [
            "is",
            "has",
            "lives"
        ]
    },
    {
        "id": "direct_question_071",
        "rule": 2,
        "chinese": "他們回家了嗎？",
        "correct_tokens": [
            [
                "Did",
                "they",
                "go",
                "home",
                "?"
            ]
        ],
        "distractors": [
            "were",
            "have",
            "went"
        ]
    },
    {
        "id": "direct_question_072",
        "rule": 2,
        "chinese": "你想要這個嗎？",
        "correct_tokens": [
            [
                "Do",
                "you",
                "want",
                "this",
                "?"
            ]
        ],
        "distractors": [
            "are",
            "have",
            "wanting"
        ]
    },
    {
        "id": "direct_question_073",
        "rule": 2,
        "chinese": "這味道好嗎？",
        "correct_tokens": [
            [
                "Does",
                "it",
                "taste",
                "good",
                "?"
            ]
        ],
        "distractors": [
            "is",
            "has",
            "tastes"
        ]
    },
    {
        "id": "direct_question_074",
        "rule": 2,
        "chinese": "你看見那個了嗎？",
        "correct_tokens": [
            [
                "Did",
                "you",
                "see",
                "that",
                "?"
            ]
        ],
        "distractors": [
            "were",
            "have",
            "saw"
        ]
    },
    {
        "id": "direct_question_075",
        "rule": 2,
        "chinese": "貓喜歡水嗎？",
        "correct_tokens": [
            [
                "Do",
                "cats",
                "like",
                "water",
                "?"
            ]
        ],
        "distractors": [
            "are",
            "have",
            "liking"
        ]
    },
    {
        "id": "direct_question_076",
        "rule": 2,
        "chinese": "他踢足球嗎？",
        "correct_tokens": [
            [
                "Does",
                "he",
                "play",
                "football",
                "?"
            ]
        ],
        "distractors": [
            "is",
            "has",
            "plays"
        ]
    },
    {
        "id": "direct_question_077",
        "rule": 2,
        "chinese": "她打電話給你了嗎？",
        "correct_tokens": [
            [
                "Did",
                "she",
                "call",
                "you",
                "?"
            ]
        ],
        "distractors": [
            "was",
            "has",
            "called"
        ]
    },
    {
        "id": "direct_question_078",
        "rule": 2,
        "chinese": "我們今天有課嗎？",
        "correct_tokens": [
            [
                "Do",
                "we",
                "have",
                "class",
                "today",
                "?"
            ]
        ],
        "distractors": [
            "are",
            "having",
            "had"
        ]
    },
    {
        "id": "direct_question_079",
        "rule": 2,
        "chinese": "你媽媽做飯好吃嗎？",
        "correct_tokens": [
            [
                "Does",
                "your",
                "mum",
                "cook",
                "well",
                "?"
            ]
        ],
        "distractors": [
            "is",
            "has",
            "cooks"
        ]
    },
    {
        "id": "direct_question_080",
        "rule": 2,
        "chinese": "巴士停了嗎？",
        "correct_tokens": [
            [
                "Did",
                "the",
                "bus",
                "stop",
                "?"
            ]
        ],
        "distractors": [
            "was",
            "has",
            "stopped"
        ]
    },
    {
        "id": "direct_question_081",
        "rule": 2,
        "chinese": "你明白嗎？",
        "correct_tokens": [
            [
                "Do",
                "you",
                "understand",
                "?"
            ]
        ],
        "distractors": [
            "are",
            "have",
            "understanding"
        ]
    },
    {
        "id": "direct_question_082",
        "rule": 2,
        "chinese": "這家店星期日營業嗎？",
        "correct_tokens": [
            [
                "Does",
                "the",
                "shop",
                "open",
                "on",
                "Sundays",
                "?"
            ]
        ],
        "distractors": [
            "is",
            "has",
            "opens"
        ]
    },
    {
        "id": "direct_question_083",
        "rule": 2,
        "chinese": "你做完功課了嗎？",
        "correct_tokens": [
            [
                "Did",
                "you",
                "finish",
                "your",
                "homework",
                "?"
            ]
        ],
        "distractors": [
            "were",
            "have",
            "finished"
        ]
    },
    {
        "id": "direct_question_084",
        "rule": 3,
        "chinese": "你吃飽了嗎？",
        "correct_tokens": [
            [
                "Have",
                "you",
                "eaten",
                "yet",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "do",
            "ate"
        ]
    },
    {
        "id": "direct_question_085",
        "rule": 3,
        "chinese": "她已經離開了嗎？",
        "correct_tokens": [
            [
                "Has",
                "she",
                "left",
                "already",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "does",
            "leave"
        ]
    },
    {
        "id": "direct_question_086",
        "rule": 3,
        "chinese": "他們到達了嗎？",
        "correct_tokens": [
            [
                "Have",
                "they",
                "arrived",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "do",
            "arrive"
        ]
    },
    {
        "id": "direct_question_087",
        "rule": 3,
        "chinese": "你吃過壽司嗎？",
        "correct_tokens": [
            [
                "Have",
                "you",
                "ever",
                "eaten",
                "sushi",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "do",
            "ate"
        ]
    },
    {
        "id": "direct_question_088",
        "rule": 3,
        "chinese": "他去過倫敦嗎？",
        "correct_tokens": [
            [
                "Has",
                "he",
                "been",
                "to",
                "London",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "does",
            "was"
        ]
    },
    {
        "id": "direct_question_089",
        "rule": 3,
        "chinese": "我們見過面嗎？",
        "correct_tokens": [
            [
                "Have",
                "we",
                "met",
                "before",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "do",
            "meet"
        ]
    },
    {
        "id": "direct_question_090",
        "rule": 3,
        "chinese": "雪停了嗎？",
        "correct_tokens": [
            [
                "Has",
                "it",
                "stopped",
                "snowing",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "does",
            "stop"
        ]
    },
    {
        "id": "direct_question_091",
        "rule": 3,
        "chinese": "你見過我的鑰匙嗎？",
        "correct_tokens": [
            [
                "Have",
                "you",
                "seen",
                "my",
                "keys",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "do",
            "saw"
        ]
    },
    {
        "id": "direct_question_092",
        "rule": 3,
        "chinese": "她做完功課了嗎？",
        "correct_tokens": [
            [
                "Has",
                "she",
                "done",
                "her",
                "homework",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "does",
            "did"
        ]
    },
    {
        "id": "direct_question_093",
        "rule": 3,
        "chinese": "他們買了那棟房子嗎？",
        "correct_tokens": [
            [
                "Have",
                "they",
                "bought",
                "the",
                "house",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "do",
            "buy"
        ]
    },
    {
        "id": "direct_question_094",
        "rule": 3,
        "chinese": "你看過這本書嗎？",
        "correct_tokens": [
            [
                "Have",
                "you",
                "read",
                "this",
                "book",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "do",
            "reading"
        ]
    },
    {
        "id": "direct_question_095",
        "rule": 3,
        "chinese": "電影開始了嗎？",
        "correct_tokens": [
            [
                "Has",
                "the",
                "movie",
                "started",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "does",
            "start"
        ]
    },
    {
        "id": "direct_question_096",
        "rule": 3,
        "chinese": "你丟了錢包嗎？",
        "correct_tokens": [
            [
                "Have",
                "you",
                "lost",
                "your",
                "wallet",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "do",
            "lose"
        ]
    },
    {
        "id": "direct_question_097",
        "rule": 3,
        "chinese": "他打掃房間了嗎？",
        "correct_tokens": [
            [
                "Has",
                "he",
                "cleaned",
                "his",
                "room",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "does",
            "clean"
        ]
    },
    {
        "id": "direct_question_098",
        "rule": 3,
        "chinese": "你聽說那個消息了嗎？",
        "correct_tokens": [
            [
                "Have",
                "you",
                "heard",
                "the",
                "news",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "do",
            "hear"
        ]
    },
    {
        "id": "direct_question_099",
        "rule": 4,
        "chinese": "他現在在睡覺嗎？",
        "correct_tokens": [
            [
                "Is",
                "he",
                "sleeping",
                "now",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "has",
            "sleep"
        ]
    },
    {
        "id": "direct_question_100",
        "rule": 4,
        "chinese": "你有在聽我說話嗎？",
        "correct_tokens": [
            [
                "Are",
                "you",
                "listening",
                "to",
                "me",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "have",
            "listen"
        ]
    },
    {
        "id": "direct_question_101",
        "rule": 4,
        "chinese": "她昨天在哭嗎？",
        "correct_tokens": [
            [
                "Was",
                "she",
                "crying",
                "yesterday",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "had",
            "cry"
        ]
    },
    {
        "id": "direct_question_102",
        "rule": 4,
        "chinese": "他們當時在踢足球嗎？",
        "correct_tokens": [
            [
                "Were",
                "they",
                "playing",
                "football",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "had",
            "play"
        ]
    },
    {
        "id": "direct_question_103",
        "rule": 4,
        "chinese": "這是你的書嗎？",
        "correct_tokens": [
            [
                "Is",
                "this",
                "your",
                "book",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "has",
            "be"
        ]
    },
    {
        "id": "direct_question_104",
        "rule": 4,
        "chinese": "這些是你的鞋子嗎？",
        "correct_tokens": [
            [
                "Are",
                "these",
                "your",
                "shoes",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "have",
            "be"
        ]
    },
    {
        "id": "direct_question_105",
        "rule": 4,
        "chinese": "昨晚很熱嗎？",
        "correct_tokens": [
            [
                "Was",
                "it",
                "hot",
                "last",
                "night",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "had",
            "be"
        ]
    },
    {
        "id": "direct_question_106",
        "rule": 4,
        "chinese": "你上學遲到了嗎？",
        "correct_tokens": [
            [
                "Were",
                "you",
                "late",
                "for",
                "school",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "had",
            "be"
        ]
    },
    {
        "id": "direct_question_107",
        "rule": 4,
        "chinese": "她是老師嗎？",
        "correct_tokens": [
            [
                "Is",
                "she",
                "a",
                "teacher",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "has",
            "be"
        ]
    },
    {
        "id": "direct_question_108",
        "rule": 4,
        "chinese": "他們是兄弟嗎？",
        "correct_tokens": [
            [
                "Are",
                "they",
                "brothers",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "have",
            "be"
        ]
    },
    {
        "id": "direct_question_109",
        "rule": 4,
        "chinese": "外面在下雨嗎？",
        "correct_tokens": [
            [
                "Is",
                "it",
                "raining",
                "outside",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "has",
            "rain"
        ]
    },
    {
        "id": "direct_question_110",
        "rule": 4,
        "chinese": "你餓了嗎？",
        "correct_tokens": [
            [
                "Are",
                "you",
                "hungry",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "have",
            "be"
        ]
    },
    {
        "id": "direct_question_111",
        "rule": 4,
        "chinese": "他當時在派對上嗎？",
        "correct_tokens": [
            [
                "Was",
                "he",
                "at",
                "the",
                "party",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "had",
            "be"
        ]
    },
    {
        "id": "direct_question_112",
        "rule": 4,
        "chinese": "他們快樂嗎？",
        "correct_tokens": [
            [
                "Were",
                "they",
                "happy",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "had",
            "be"
        ]
    },
    {
        "id": "direct_question_113",
        "rule": 4,
        "chinese": "水冷嗎？",
        "correct_tokens": [
            [
                "Is",
                "the",
                "water",
                "cold",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "has",
            "be"
        ]
    },
    {
        "id": "direct_question_114",
        "rule": 5,
        "chinese": "會議是幾點？",
        "correct_tokens": [
            [
                "What",
                "time",
                "is",
                "the",
                "meeting",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "has",
            "when"
        ]
    },
    {
        "id": "direct_question_115",
        "rule": 5,
        "chinese": "你妹妹幾歲？",
        "correct_tokens": [
            [
                "How",
                "old",
                "is",
                "your",
                "sister",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "has",
            "what"
        ]
    },
    {
        "id": "direct_question_116",
        "rule": 5,
        "chinese": "你喜歡甚麼顏色？",
        "correct_tokens": [
            [
                "What",
                "color",
                "do",
                "you",
                "like",
                "?"
            ]
        ],
        "distractors": [
            "are",
            "is",
            "which"
        ]
    },
    {
        "id": "direct_question_117",
        "rule": 5,
        "chinese": "這個多少錢？",
        "correct_tokens": [
            [
                "How",
                "much",
                "is",
                "it",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "has",
            "price"
        ]
    },
    {
        "id": "direct_question_118",
        "rule": 5,
        "chinese": "你買了多少個蘋果？",
        "correct_tokens": [
            [
                "How",
                "many",
                "apples",
                "did",
                "you",
                "buy",
                "?"
            ]
        ],
        "distractors": [
            "were",
            "was",
            "much"
        ]
    },
    {
        "id": "direct_question_119",
        "rule": 5,
        "chinese": "這是誰的筆？",
        "correct_tokens": [
            [
                "Whose",
                "pen",
                "is",
                "this",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "do",
            "who"
        ]
    },
    {
        "id": "direct_question_120",
        "rule": 5,
        "chinese": "哪邊是北方？",
        "correct_tokens": [
            [
                "Which",
                "way",
                "is",
                "north",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "do",
            "where"
        ]
    },
    {
        "id": "direct_question_121",
        "rule": 5,
        "chinese": "你喜歡哪種電影？",
        "correct_tokens": [
            [
                "What",
                "kind",
                "of",
                "movies",
                "do",
                "you",
                "watch",
                "?"
            ]
        ],
        "distractors": [
            "are",
            "have",
            "how"
        ]
    },
    {
        "id": "direct_question_122",
        "rule": 5,
        "chinese": "機場有多遠？",
        "correct_tokens": [
            [
                "How",
                "far",
                "is",
                "the",
                "airport",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "has",
            "what"
        ]
    },
    {
        "id": "direct_question_123",
        "rule": 5,
        "chinese": "旅程需要多長時間？",
        "correct_tokens": [
            [
                "How",
                "long",
                "does",
                "the",
                "trip",
                "take",
                "?"
            ]
        ],
        "distractors": [
            "is",
            "are",
            "what"
        ]
    },
    {
        "id": "direct_question_124",
        "rule": 5,
        "chinese": "你穿幾號鞋？",
        "correct_tokens": [
            [
                "What",
                "size",
                "shoes",
                "do",
                "you",
                "wear",
                "?"
            ]
        ],
        "distractors": [
            "are",
            "have",
            "how"
        ]
    },
    {
        "id": "direct_question_125",
        "rule": 5,
        "chinese": "你選了哪本書？",
        "correct_tokens": [
            [
                "Which",
                "book",
                "did",
                "you",
                "choose",
                "?"
            ]
        ],
        "distractors": [
            "were",
            "was",
            "what"
        ]
    },
    {
        "id": "direct_question_126",
        "rule": 5,
        "chinese": "你多久運動一次？",
        "correct_tokens": [
            [
                "How",
                "often",
                "do",
                "you",
                "exercise",
                "?"
            ]
        ],
        "distractors": [
            "are",
            "have",
            "what"
        ]
    },
    {
        "id": "direct_question_127",
        "rule": 5,
        "chinese": "這座塔有多高？",
        "correct_tokens": [
            [
                "How",
                "tall",
                "is",
                "the",
                "tower",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "do",
            "what"
        ]
    },
    {
        "id": "direct_question_128",
        "rule": 5,
        "chinese": "他教甚麼科目？",
        "correct_tokens": [
            [
                "What",
                "subject",
                "does",
                "he",
                "teach",
                "?"
            ]
        ],
        "distractors": [
            "is",
            "has",
            "which"
        ]
    },
    {
        "id": "direct_question_129",
        "rule": 6,
        "chinese": "誰吃了蛋糕？",
        "correct_tokens": [
            [
                "Who",
                "ate",
                "the",
                "cake",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "does",
            "eat"
        ]
    },
    {
        "id": "direct_question_130",
        "rule": 6,
        "chinese": "這裡發生了甚麼事？",
        "correct_tokens": [
            [
                "What",
                "happened",
                "here",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "does",
            "happen"
        ]
    },
    {
        "id": "direct_question_131",
        "rule": 6,
        "chinese": "誰想去？",
        "correct_tokens": [
            [
                "Who",
                "wants",
                "to",
                "go",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "do",
            "want"
        ]
    },
    {
        "id": "direct_question_132",
        "rule": 6,
        "chinese": "甚麼從桌上掉下來了？",
        "correct_tokens": [
            [
                "What",
                "fell",
                "off",
                "the",
                "table",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "does",
            "fall"
        ]
    },
    {
        "id": "direct_question_133",
        "rule": 6,
        "chinese": "誰住在隔壁？",
        "correct_tokens": [
            [
                "Who",
                "lives",
                "next",
                "door",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "do",
            "live"
        ]
    },
    {
        "id": "direct_question_134",
        "rule": 6,
        "chinese": "哪輛車跑得最快？",
        "correct_tokens": [
            [
                "Which",
                "car",
                "runs",
                "fastest",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "do",
            "run"
        ]
    },
    {
        "id": "direct_question_135",
        "rule": 6,
        "chinese": "誰打破了花瓶？",
        "correct_tokens": [
            [
                "Who",
                "broke",
                "the",
                "vase",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "does",
            "break"
        ]
    },
    {
        "id": "direct_question_136",
        "rule": 6,
        "chinese": "甚麼發出了那個聲音？",
        "correct_tokens": [
            [
                "What",
                "made",
                "that",
                "noise",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "does",
            "make"
        ]
    },
    {
        "id": "direct_question_137",
        "rule": 6,
        "chinese": "誰知道答案？",
        "correct_tokens": [
            [
                "Who",
                "knows",
                "the",
                "answer",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "do",
            "know"
        ]
    },
    {
        "id": "direct_question_138",
        "rule": 6,
        "chinese": "甚麼造成了污染？",
        "correct_tokens": [
            [
                "What",
                "causes",
                "the",
                "pollution",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "do",
            "cause"
        ]
    },
    {
        "id": "direct_question_139",
        "rule": 6,
        "chinese": "誰贏了比賽？",
        "correct_tokens": [
            [
                "Who",
                "won",
                "the",
                "match",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "does",
            "win"
        ]
    },
    {
        "id": "direct_question_140",
        "rule": 6,
        "chinese": "甚麼坐在牆上？",
        "correct_tokens": [
            [
                "What",
                "sits",
                "on",
                "the",
                "wall",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "do",
            "sit"
        ]
    },
    {
        "id": "direct_question_141",
        "rule": 6,
        "chinese": "誰打了電話給你？",
        "correct_tokens": [
            [
                "Who",
                "called",
                "you",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "does",
            "call"
        ]
    },
    {
        "id": "direct_question_142",
        "rule": 6,
        "chinese": "哪一隊先得分？",
        "correct_tokens": [
            [
                "Which",
                "team",
                "scored",
                "first",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "does",
            "score"
        ]
    },
    {
        "id": "direct_question_143",
        "rule": 6,
        "chinese": "誰在家幫你？",
        "correct_tokens": [
            [
                "Who",
                "helps",
                "you",
                "at",
                "home",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "do",
            "help"
        ]
    },
    {
        "id": "direct_question_144",
        "rule": 7,
        "chinese": "如何打開這個檔案？",
        "correct_tokens": [
            [
                "How",
                "to",
                "open",
                "this",
                "file",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "does",
            "can"
        ]
    },
    {
        "id": "direct_question_145",
        "rule": 7,
        "chinese": "如何去圖書館？",
        "correct_tokens": [
            [
                "How",
                "to",
                "get",
                "to",
                "the",
                "library",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "does",
            "can"
        ]
    },
    {
        "id": "direct_question_146",
        "rule": 7,
        "chinese": "如何摺紙飛機？",
        "correct_tokens": [
            [
                "How",
                "to",
                "make",
                "a",
                "paper",
                "plane",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "does",
            "can"
        ]
    },
    {
        "id": "direct_question_147",
        "rule": 7,
        "chinese": "如何學游泳？",
        "correct_tokens": [
            [
                "How",
                "to",
                "learn",
                "swimming",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "does",
            "can"
        ]
    },
    {
        "id": "direct_question_148",
        "rule": 7,
        "chinese": "如何修理爆胎？",
        "correct_tokens": [
            [
                "How",
                "to",
                "fix",
                "a",
                "flat",
                "tire",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "does",
            "can"
        ]
    },
    {
        "id": "direct_question_149",
        "rule": 7,
        "chinese": "如何烤蛋糕？",
        "correct_tokens": [
            [
                "How",
                "to",
                "bake",
                "a",
                "cake",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "does",
            "can"
        ]
    },
    {
        "id": "direct_question_150",
        "rule": 7,
        "chinese": "如何使用這台相機？",
        "correct_tokens": [
            [
                "How",
                "to",
                "use",
                "this",
                "camera",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "does",
            "can"
        ]
    },
    {
        "id": "direct_question_151",
        "rule": 7,
        "chinese": "如何用法語說「你好」？",
        "correct_tokens": [
            [
                "How",
                "to",
                "say",
                "\"Hello\"",
                "in",
                "French",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "does",
            "can"
        ]
    },
    {
        "id": "direct_question_152",
        "rule": 7,
        "chinese": "如何解決這個謎題？",
        "correct_tokens": [
            [
                "How",
                "to",
                "solve",
                "this",
                "puzzle",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "does",
            "can"
        ]
    },
    {
        "id": "direct_question_153",
        "rule": 7,
        "chinese": "如何改善英語？",
        "correct_tokens": [
            [
                "How",
                "to",
                "improve",
                "English",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "does",
            "can"
        ]
    },
    {
        "id": "direct_question_154",
        "rule": 1,
        "chinese": "圖書館今晚為甚麼可以繼續開放？",
        "correct_tokens": [
            [
                "Why",
                "can",
                "the",
                "library",
                "stay",
                "open",
                "tonight",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "is",
            "stays",
            "opened"
        ]
    },
    {
        "id": "direct_question_155",
        "rule": 1,
        "chinese": "學生野餐時應該帶甚麼？",
        "correct_tokens": [
            [
                "What",
                "should",
                "students",
                "bring",
                "for",
                "the",
                "picnic",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "does",
            "brought",
            "bringing"
        ]
    },
    {
        "id": "direct_question_156",
        "rule": 1,
        "chinese": "訪客必須把袋放在哪裡？",
        "correct_tokens": [
            [
                "Where",
                "must",
                "visitors",
                "leave",
                "their",
                "bags",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "are",
            "left",
            "leaving"
        ]
    },
    {
        "id": "direct_question_157",
        "rule": 1,
        "chinese": "音樂會為甚麼可能已經被取消了？",
        "correct_tokens": [
            [
                "Why",
                "may",
                "the",
                "concert",
                "have",
                "been",
                "cancelled",
                "?"
            ]
        ],
        "distractors": [
            "has",
            "was",
            "cancel",
            "cancelling"
        ]
    },
    {
        "id": "direct_question_158",
        "rule": 1,
        "chinese": "我們可以如何減少塑膠垃圾？",
        "correct_tokens": [
            [
                "How",
                "can",
                "we",
                "reduce",
                "plastic",
                "waste",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "are",
            "reduced",
            "reducing"
        ]
    },
    {
        "id": "direct_question_159",
        "rule": 1,
        "chinese": "學校會幾時公布結果？",
        "correct_tokens": [
            [
                "When",
                "will",
                "the",
                "school",
                "announce",
                "the",
                "results",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "is",
            "announced",
            "announcing"
        ]
    },
    {
        "id": "direct_question_160",
        "rule": 1,
        "chinese": "家長為甚麼應該小心閱讀通告？",
        "correct_tokens": [
            [
                "Why",
                "should",
                "parents",
                "read",
                "the",
                "notice",
                "carefully",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "are",
            "reading",
            "reads"
        ]
    },
    {
        "id": "direct_question_161",
        "rule": 1,
        "chinese": "進入實驗室前你必須做甚麼？",
        "correct_tokens": [
            [
                "What",
                "must",
                "you",
                "do",
                "before",
                "entering",
                "the",
                "lab",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "are",
            "done",
            "enter"
        ]
    },
    {
        "id": "direct_question_162",
        "rule": 1,
        "chinese": "Peter 現在可以上載哪一個檔案？",
        "correct_tokens": [
            [
                "Which",
                "file",
                "can",
                "Peter",
                "upload",
                "now",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "is",
            "uploaded",
            "uploads"
        ]
    },
    {
        "id": "direct_question_163",
        "rule": 1,
        "chinese": "我們應該向誰求助？",
        "correct_tokens": [
            [
                "Who",
                "should",
                "we",
                "ask",
                "for",
                "help",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "are",
            "asked",
            "asking"
        ]
    },
    {
        "id": "direct_question_164",
        "rule": 3,
        "chinese": "老師已經收了工作紙嗎？",
        "correct_tokens": [
            [
                "Has",
                "the",
                "teacher",
                "collected",
                "the",
                "worksheets",
                "?"
            ]
        ],
        "distractors": [
            "Did",
            "Does",
            "collect",
            "collecting"
        ]
    },
    {
        "id": "direct_question_165",
        "rule": 3,
        "chinese": "你有沒有參加過英語演講比賽？",
        "correct_tokens": [
            [
                "Have",
                "you",
                "ever",
                "joined",
                "an",
                "English",
                "speech",
                "contest",
                "?"
            ]
        ],
        "distractors": [
            "Did",
            "join",
            "joining",
            "are"
        ]
    },
    {
        "id": "direct_question_166",
        "rule": 3,
        "chinese": "Lily 這星期為甚麼一直缺席？",
        "correct_tokens": [
            [
                "Why",
                "has",
                "Lily",
                "been",
                "absent",
                "this",
                "week",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "was",
            "is",
            "be"
        ]
    },
    {
        "id": "direct_question_167",
        "rule": 3,
        "chinese": "那部機械人自午夜以來一直在做甚麼？",
        "correct_tokens": [
            [
                "What",
                "has",
                "the",
                "robot",
                "been",
                "doing",
                "since",
                "midnight",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "did",
            "do",
            "done"
        ]
    },
    {
        "id": "direct_question_168",
        "rule": 3,
        "chinese": "學生已經邀請了誰參加典禮？",
        "correct_tokens": [
            [
                "Who",
                "have",
                "the",
                "students",
                "invited",
                "to",
                "the",
                "ceremony",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "invite",
            "inviting",
            "are"
        ]
    },
    {
        "id": "direct_question_169",
        "rule": 3,
        "chinese": "那條路為甚麼已經被封閉？",
        "correct_tokens": [
            [
                "Why",
                "has",
                "the",
                "road",
                "been",
                "closed",
                "?"
            ]
        ],
        "distractors": [
            "was",
            "did",
            "close",
            "closing"
        ]
    },
    {
        "id": "direct_question_170",
        "rule": 3,
        "chinese": "你一直學法文學了多久？",
        "correct_tokens": [
            [
                "How",
                "long",
                "have",
                "you",
                "been",
                "learning",
                "French",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "did",
            "learn",
            "learnt"
        ]
    },
    {
        "id": "direct_question_171",
        "rule": 3,
        "chinese": "你哥哥放學後去了哪裡？(他仍未回來)",
        "correct_tokens": [
            [
                "Where",
                "has",
                "your",
                "brother",
                "gone",
                "after",
                "school",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "go",
            "went",
            "is"
        ]
    },
    {
        "id": "direct_question_172",
        "rule": 3,
        "chinese": "工人已經修理好升降機未？",
        "correct_tokens": [
            [
                "Have",
                "the",
                "workers",
                "repaired",
                "the",
                "lift",
                "yet",
                "?"
            ]
        ],
        "distractors": [
            "Did",
            "repair",
            "repairing",
            "are"
        ]
    },
    {
        "id": "direct_question_173",
        "rule": 3,
        "chinese": "這些相片為甚麼已經被刪除了？",
        "correct_tokens": [
            [
                "Why",
                "have",
                "these",
                "photos",
                "been",
                "deleted",
                "?"
            ]
        ],
        "distractors": [
            "were",
            "did",
            "delete",
            "deleting"
        ]
    },
    {
        "id": "direct_question_174",
        "rule": 2,
        "chinese": "Ken 通常午餐吃甚麼？",
        "correct_tokens": [
            [
                "What",
                "does",
                "Ken",
                "usually",
                "eat",
                "for",
                "lunch",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "is",
            "eats",
            "ate"
        ]
    },
    {
        "id": "direct_question_175",
        "rule": 2,
        "chinese": "巴士今早為甚麼遲到？",
        "correct_tokens": [
            [
                "Why",
                "did",
                "the",
                "bus",
                "arrive",
                "late",
                "this",
                "morning",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "was",
            "arrived",
            "arrives"
        ]
    },
    {
        "id": "direct_question_176",
        "rule": 2,
        "chinese": "那些女孩子每逢星期五在哪裡練習羽毛球？",
        "correct_tokens": [
            [
                "Where",
                "do",
                "the",
                "girls",
                "practise",
                "badminton",
                "every",
                "Friday",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "are",
            "practised",
            "practising"
        ]
    },
    {
        "id": "direct_question_177",
        "rule": 2,
        "chinese": "這部機器為甚麼發出這麼多噪音？",
        "correct_tokens": [
            [
                "Why",
                "does",
                "this",
                "machine",
                "make",
                "so",
                "much",
                "noise",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "is",
            "makes",
            "made"
        ]
    },
    {
        "id": "direct_question_178",
        "rule": 2,
        "chinese": "你的父母幾時搬到沙田？",
        "correct_tokens": [
            [
                "When",
                "did",
                "your",
                "parents",
                "move",
                "to",
                "Sha",
                "Tin",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "have",
            "moved",
            "moving"
        ]
    },
    {
        "id": "direct_question_179",
        "rule": 2,
        "chinese": "遊客在這個市場買甚麼？",
        "correct_tokens": [
            [
                "What",
                "do",
                "tourists",
                "buy",
                "in",
                "this",
                "market",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "are",
            "bought",
            "buying"
        ]
    },
    {
        "id": "direct_question_180",
        "rule": 2,
        "chinese": "那些小朋友如何解決了這個問題？",
        "correct_tokens": [
            [
                "How",
                "did",
                "the",
                "children",
                "solve",
                "the",
                "problem",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "were",
            "solved",
            "solving"
        ]
    },
    {
        "id": "direct_question_181",
        "rule": 2,
        "chinese": "Max 昨晚為甚麼沒有完成家課？",
        "correct_tokens": [
            [
                "Why",
                "did",
                "Max",
                "not",
                "finish",
                "his",
                "homework",
                "last",
                "night",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "was",
            "finished",
            "finishes"
        ]
    },
    {
        "id": "direct_question_182",
        "rule": 2,
        "chinese": "校長午飯後打電話給誰？",
        "correct_tokens": [
            [
                "Who",
                "did",
                "the",
                "principal",
                "call",
                "after",
                "lunch",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "called",
            "calling",
            "was"
        ]
    },
    {
        "id": "direct_question_183",
        "rule": 2,
        "chinese": "這個密碼能保護你的帳戶嗎？",
        "correct_tokens": [
            [
                "Does",
                "this",
                "password",
                "protect",
                "your",
                "account",
                "?"
            ]
        ],
        "distractors": [
            "Do",
            "Is",
            "protects",
            "protected"
        ]
    },
    {
        "id": "direct_question_184",
        "rule": 4,
        "chinese": "課室今日為甚麼這麼安靜？",
        "correct_tokens": [
            [
                "Why",
                "is",
                "the",
                "classroom",
                "so",
                "quiet",
                "today",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "do",
            "be",
            "quietly"
        ]
    },
    {
        "id": "direct_question_185",
        "rule": 4,
        "chinese": "那些鎖匙剛才在哪裡？",
        "correct_tokens": [
            [
                "Where",
                "were",
                "the",
                "keys",
                "just",
                "now",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "are",
            "was",
            "be"
        ]
    },
    {
        "id": "direct_question_186",
        "rule": 4,
        "chinese": "球員準備好比賽了嗎？",
        "correct_tokens": [
            [
                "Are",
                "the",
                "players",
                "ready",
                "for",
                "the",
                "match",
                "?"
            ]
        ],
        "distractors": [
            "Do",
            "Did",
            "prepare",
            "prepared"
        ]
    },
    {
        "id": "direct_question_187",
        "rule": 4,
        "chinese": "窗戶為甚麼被打破了？",
        "correct_tokens": [
            [
                "Why",
                "was",
                "the",
                "window",
                "broken",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "does",
            "break",
            "breaking"
        ]
    },
    {
        "id": "direct_question_188",
        "rule": 4,
        "chinese": "你的假期計劃是甚麼？",
        "correct_tokens": [
            [
                "What",
                "is",
                "your",
                "plan",
                "for",
                "the",
                "holiday",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "do",
            "planning",
            "planned"
        ]
    },
    {
        "id": "direct_question_189",
        "rule": 4,
        "chinese": "現在哪一個房間可用？",
        "correct_tokens": [
            [
                "Which",
                "room",
                "is",
                "available",
                "now",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "do",
            "be",
            "availability"
        ]
    },
    {
        "id": "direct_question_190",
        "rule": 5,
        "chinese": "書桌下面是誰的袋？",
        "correct_tokens": [
            [
                "Whose",
                "bag",
                "is",
                "under",
                "the",
                "desk",
                "?"
            ]
        ],
        "distractors": [
            "Who",
            "does",
            "do",
            "belong"
        ]
    },
    {
        "id": "direct_question_191",
        "rule": 4,
        "chinese": "那對孖生兄弟為甚麼怕黑？",
        "correct_tokens": [
            [
                "Why",
                "are",
                "the",
                "twins",
                "afraid",
                "of",
                "the",
                "dark",
                "?"
            ]
        ],
        "distractors": [
            "do",
            "does",
            "fear",
            "feared"
        ]
    },
    {
        "id": "direct_question_192",
        "rule": 4,
        "chinese": "那條橋幾時建成？",
        "correct_tokens": [
            [
                "When",
                "was",
                "the",
                "bridge",
                "built",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "does",
            "build",
            "building"
        ]
    },
    {
        "id": "direct_question_193",
        "rule": 4,
        "chinese": "科學專題研習困難嗎？",
        "correct_tokens": [
            [
                "Is",
                "the",
                "science",
                "project",
                "difficult",
                "?"
            ]
        ],
        "distractors": [
            "Does",
            "Do",
            "difficulty",
            "difficultly"
        ]
    },
    {
        "id": "direct_question_194",
        "rule": 5,
        "chinese": "你昨晚讀了多少頁？",
        "correct_tokens": [
            [
                "How",
                "many",
                "pages",
                "did",
                "you",
                "read",
                "last",
                "night",
                "?"
            ]
        ],
        "distractors": [
            "much",
            "do",
            "reading",
            "reads"
        ]
    },
    {
        "id": "direct_question_195",
        "rule": 5,
        "chinese": "這個水樽可盛載多少水？",
        "correct_tokens": [
            [
                "How",
                "much",
                "water",
                "does",
                "this",
                "bottle",
                "hold",
                "?"
            ]
        ],
        "distractors": [
            "many",
            "do",
            "holds",
            "held"
        ]
    },
    {
        "id": "direct_question_196",
        "rule": 5,
        "chinese": "Emma 喜歡甚麼類型的音樂？",
        "correct_tokens": [
            [
                "What",
                "kind",
                "of",
                "music",
                "does",
                "Emma",
                "enjoy",
                "?"
            ]
        ],
        "distractors": [
            "Which",
            "do",
            "enjoys",
            "enjoyed"
        ]
    },
    {
        "id": "direct_question_197",
        "rule": 5,
        "chinese": "你多久溫習一次生字？",
        "correct_tokens": [
            [
                "How",
                "often",
                "do",
                "you",
                "review",
                "your",
                "vocabulary",
                "?"
            ]
        ],
        "distractors": [
            "many",
            "does",
            "reviewed",
            "reviews"
        ]
    },
    {
        "id": "direct_question_198",
        "rule": 5,
        "chinese": "你推薦哪一個？",
        "correct_tokens": [
            [
                "Which",
                "one",
                "do",
                "you",
                "recommend",
                "?"
            ]
        ],
        "distractors": [
            "What",
            "does",
            "recommended",
            "recommends"
        ]
    },
    {
        "id": "direct_question_199",
        "rule": 6,
        "chinese": "誰寄出了這封電郵？",
        "correct_tokens": [
            [
                "Who",
                "sent",
                "this",
                "email",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "does",
            "send",
            "sends"
        ]
    },
    {
        "id": "direct_question_200",
        "rule": 6,
        "chinese": "甚麼令那個嬰兒哭？",
        "correct_tokens": [
            [
                "What",
                "made",
                "the",
                "baby",
                "cry",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "does",
            "make",
            "cried"
        ]
    },
    {
        "id": "direct_question_201",
        "rule": 6,
        "chinese": "哪一隊贏了決賽？",
        "correct_tokens": [
            [
                "Which",
                "team",
                "won",
                "the",
                "final",
                "?"
            ]
        ],
        "distractors": [
            "did",
            "does",
            "win",
            "wins"
        ]
    },
    {
        "id": "direct_question_202",
        "rule": 6,
        "chinese": "甚麼導致畫面上的這個錯誤？",
        "correct_tokens": [
            [
                "What",
                "causes",
                "this",
                "error",
                "on",
                "the",
                "screen",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "do",
            "cause",
            "caused"
        ]
    },
    {
        "id": "direct_question_203",
        "rule": 6,
        "chinese": "誰教 2A 班英文？",
        "correct_tokens": [
            [
                "Who",
                "teaches",
                "Class",
                "2A",
                "English",
                "?"
            ]
        ],
        "distractors": [
            "does",
            "do",
            "teach",
            "teaching"
        ]
    }
];
})();
