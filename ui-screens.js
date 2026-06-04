let currentRankingTab = 'total-xp';
let vocabScreenMode = 'default';
let vocabPreviewRows = [];
let vocabPreviewReturnScreen = 'start';
let vocabPreviewTitle = 'VOCAB LIST';
let vocabPreviewSubtitle = 'CLASSIFIED VOCABULARY DATABASE';
let vocabSearchKeyboardActive = false;
let activeVocabListLevel = 'L1';
let grammarInfinitiveGerundReferenceCategory = 'ving';
let grammarTenseReferenceCategory = 'active';
let grammarConditionalReferenceCategory = '0';
let grammarPrepositionPlaceReferenceCategory = 'core';

const GRAMMAR_TENSE_REFERENCE_GROUPS = {
    active: {
        label: 'ACTIVE',
        sections: [
            {
                title: 'PRESENT SIMPLE 現在式',
                formula: 'Subject + 原型動詞 / 動詞＋s',
                notes: [
                    '用於現在都有的習慣、事實、常態。',
                    '常見時間字：always / often / usually / sometimes / seldom / never。',
                    'He / She / It / 單數名詞：動詞加 s；I / You / We / They / 眾數名詞：動詞不變。'
                ],
                examples: [
                    { ch: '他甚少喝啤酒。', en: 'He seldom drinks beer.' },
                    { ch: '狗經常挖洞。', en: 'Dogs often dig holes.' },
                    { ch: '太陽從東方升起。', en: 'The sun rises in the east.' }
                ]
            },
            {
                title: 'PAST SIMPLE 過去式',
                formula: 'Subject + past verb',
                notes: [
                    '用於故事、新聞、已完成的過去事件。',
                    '句子有過去時間字就多數用過去式：yesterday / last / ago / in 2020。',
                    '幻想句：I wish 後面常把動詞轉過去式。'
                ],
                examples: [
                    { ch: '我昨晚沒有睡覺。', en: 'I did not sleep last night.' },
                    { ch: '他上星期買了一部電話。', en: 'He bought a phone last week.' },
                    { ch: '我希望我有一個有錢爸爸。', en: 'I wish I had a rich dad.' }
                ]
            },
            {
                title: 'CONTINUOUS 進行式',
                formula: 'is / am / are / was / were + V-ing',
                notes: [
                    '句子有「正在」、「當時正在」、「緊」的感覺。',
                    'Present continuous 也可表示已預定好的將來行為。'
                ],
                examples: [
                    { ch: '當你打給我時，我正在睡覺。', en: 'When you called me, I was sleeping.' },
                    { ch: '我明天就要走了。', en: 'I am leaving tomorrow.' },
                    { ch: '他們正在溫習英文。', en: 'They are revising English.' }
                ]
            },
            {
                title: 'PRESENT PERFECT 完成式',
                formula: 'has / have + pp',
                points: [
                    {
                        note: '「了」但沒有過去時間詞：常用 has / have + pp。',
                        examples: [
                            { ch: '我交了 project。', en: 'I have submitted the project.' },
                            { ch: '她已經離開了。', en: 'She has already left.' }
                        ]
                    },
                    {
                        note: '「過」：常用 have been to；不要用 have gone to 表示去過。',
                        examples: [
                            { ch: '你有沒有去過日本？', en: 'Have you ever been to Japan?' },
                            { ch: '我去過日本三次。', en: 'I have been to Japan three times.' }
                        ]
                    },
                    {
                        note: '「最近」：recently / lately 常配 present perfect。',
                        examples: [
                            { ch: '我最近學了一些泰文。', en: 'I have learnt some Thai recently.' },
                            { ch: '他最近變得很忙。', en: 'He has become very busy lately.' }
                        ]
                    },
                    {
                        note: 'ever 問「有沒有...過？」：Have you ever + pp?',
                        examples: [
                            { ch: '你有沒有看過這套電影？', en: 'Have you ever watched this film?' }
                        ]
                    },
                    {
                        note: 'never 表示「從未...過」：have never + pp。',
                        examples: [
                            { ch: '中國未贏過世界盃。', en: 'China has never won the World Cup.' }
                        ]
                    },
                    {
                        note: 'yet 表示「未 / 未...嗎？」：問句放句尾；否定句用 have not + pp + yet。',
                        examples: [
                            { ch: '你交功課未？', en: 'Have you handed in your homework yet?' },
                            { ch: '我還未完成我的 project。', en: 'I have not finished my project yet.' }
                        ]
                    }
                ]
            },
            {
                title: 'PRESENT PERFECT CONTINUOUS 一直 / 了（持續中）',
                formula: 'has / have + been + V-ing',
                notes: [
                    '用於由過去開始，一直持續到現在的動作。',
                    '常見時間字：for / since / all day / recently。'
                ],
                examples: [
                    { ch: '他今天一直在哭。', en: 'He has been crying today.' },
                    { ch: '我學英文很多年了。', en: 'I have been learning English for many years.' },
                    { ch: '她一直在等你。', en: 'She has been waiting for you.' }
                ]
            },
            {
                title: 'PAST PERFECT 過去完成式',
                formula: 'had + pp',
                notes: [
                    '用於「過去某一刻之前已經完成」的事。',
                    '常見線索：before / after / when / by the time / already / never before。',
                    '兩件過去事比較先後：較早發生的事用 had + pp，較後發生的事用 past simple。'
                ],
                examples: [
                    { ch: '我到達時，他已經離開了。', en: 'When I arrived, he had already left.' },
                    { ch: '她交卷前已經檢查答案。', en: 'She had checked her answers before she handed in the paper.' },
                    { ch: '我以前從未見過這種題型。', en: 'I had never seen this question type before.' }
                ]
            }
        ]
    },
    passive: {
        label: 'PASSIVE',
        sections: [
            {
                title: 'PASSIVE VOICE 被動',
                formula: 'be + pp',
                notes: [
                    '被動重點：主語不是做動作的人，而是「被」動作影響的人/物。',
                    'by 用來標示行為者。'
                ],
                examples: [
                    { ch: '他被視為下一個美斯。', en: 'He is seen as the next Messi.' },
                    { ch: '他昨日被老師罰。', en: 'He was punished by his teacher.' },
                    { ch: '這本書還未被歸還。', en: 'The book has not been returned.' }
                ]
            },
            {
                title: 'PASSIVE FORMULAS 被動公式',
                formula: 'be + pp | being + pp | been + pp',
                points: [
                    {
                        note: 'Present simple passive：is / am / are + pp，用於現在事實、習慣或一般情況。',
                        examples: [
                            { ch: '這間學校被很多家長信任。', en: 'This school is trusted by many parents.' },
                            { ch: '英文每天在這裡使用。', en: 'English is used here every day.' }
                        ]
                    },
                    {
                        note: 'Past simple passive：was / were + pp，用於已完成的過去被動事件。',
                        examples: [
                            { ch: '他昨日被老師罰。', en: 'He was punished by his teacher yesterday.' },
                            { ch: '所有窗戶昨晚被關上。', en: 'All the windows were closed last night.' }
                        ]
                    },
                    {
                        note: 'Continuous passive：is / am / are / was / were + being + pp，用於正在被 / 當時正在被。',
                        examples: [
                            { ch: '他正在被老師責罰。', en: 'He is being punished by his teacher.' },
                            { ch: '當我到達時，那座橋正在被修理。', en: 'The bridge was being repaired when I arrived.' }
                        ]
                    },
                    {
                        note: 'Perfect passive：has / have been + pp 或 had been + pp，表示已經被完成；past perfect 指過去某一刻之前已經被完成。',
                        examples: [
                            { ch: '這本書還未被歸還。', en: 'The book has not been returned yet.' },
                            { ch: '所有文件已經簽署。', en: 'All documents have been signed.' },
                            { ch: '我到達時，門已經被鎖上。', en: 'The door had been locked when I arrived.' },
                            { ch: '警察到達前，那輛車已經被偷走。', en: 'The car had been stolen before the police arrived.' }
                        ]
                    },
                    {
                        note: 'Modal passive：modal + be + pp，用於 will / can / should / must / may 等情態動詞。',
                        examples: [
                            { ch: '他將會被懲罰。', en: 'He will be punished.' },
                            { ch: '這個問題可以被解決。', en: 'This problem can be solved.' }
                        ]
                    },
                    {
                        note: 'To-infinitive passive：to be + pp，用於 want / need / expect 等字後面。',
                        examples: [
                            { ch: '他想被尊重。', en: 'He wants to be respected.' },
                            { ch: '這份報告需要今天完成。', en: 'This report needs to be finished today.' }
                        ]
                    }
                ]
            }
        ]
    },
    negative: {
        label: 'NEGATIVE',
        sections: [
            {
                title: 'NEGATIVE 否定句',
                formula: 'not / no / never',
                points: [
                    {
                        note: '名詞否定：not many / not much = 沒有很多；no + 名詞 = 沒有。',
                        examples: [
                            { ch: '沒有很多人喜歡我。', en: 'Not many people like me.' },
                            { ch: '我沒有很多時間。', en: 'I do not have much time.' },
                            { ch: '沒有人喜歡我。', en: 'No one likes me.' }
                        ]
                    },
                    {
                        note: 'be 動詞否定：is / am / are / was / were + not。',
                        examples: [
                            { ch: '他不是老師。', en: 'He is not a teacher.' },
                            { ch: '他們昨天不在家。', en: 'They were not at home yesterday.' }
                        ]
                    },
                    {
                        note: '主動動詞否定：do not / does not / did not + 原形動詞。',
                        examples: [
                            { ch: '他不喜歡貓。', en: 'He does not like cats.' },
                            { ch: '貓不喜歡狗。', en: 'Cats do not like dogs.' },
                            { ch: '我昨晚沒有睡覺。', en: 'I did not sleep last night.' }
                        ]
                    },
                    {
                        note: 'have 類否定：have not been = 還未是；have never + pp = 未...過；have not + pp = 還未。',
                        examples: [
                            { ch: '我從未去過日本。', en: 'I have never been to Japan.' },
                            { ch: '他還未完成工作。', en: 'He has not finished the work yet.' },
                            { ch: '她還未到過那裡。', en: 'She has not been there yet.' }
                        ]
                    },
                    {
                        note: 'Modal 否定：cannot / will not / should not / may not / must not。',
                        examples: [
                            { ch: '我們不應該被罰。', en: 'We should not be punished.' },
                            { ch: '你不可在這裡泊車。', en: 'You must not park here.' }
                        ]
                    }
                ]
            }
        ]
    }
};

const GRAMMAR_CONDITIONAL_REFERENCE_GROUPS = {
    '0': {
        label: '0',
        sections: [
            {
                title: 'TYPE 0 零級條件句',
                formula: 'If + simple present, simple present',
                notes: [
                    '用來表達真理、常理、科學事實，或者經常發生的結果。',
                    '重點感覺：只要條件發生，結果通常 100% 會發生。',
                    'If-clause 和 main clause 都用 simple present。'
                ],
                examples: [
                    {
                        ch: '如果你加熱冰，它會融化。',
                        en: 'If you heat ice, it melts.',
                        explain: '這是科學常理，所以兩邊都用 present simple。'
                    },
                    {
                        ch: '如果水到達 100°C，它會沸騰。',
                        en: 'If water reaches 100°C, it boils.',
                        explain: '這是一般事實，不是講某一次未來事件。'
                    },
                    {
                        ch: '如果學生睡得太少，他們會覺得累。',
                        en: 'If students sleep too little, they feel tired.',
                        explain: '講經常出現的自然結果，所以用 Type 0。'
                    },
                    {
                        ch: '如果人們吃太多糖，他們會增磅。',
                        en: 'If people eat too much sugar, they gain weight.',
                        explain: '條件和結果都是一般情況，兩邊都不用 will。'
                    }
                ]
            },
            {
                title: 'TYPE 0 句式提示',
                formula: 'When + simple present, simple present',
                notes: [
                    'Type 0 很多時可以用 when 代替 if，因為意思接近「每當」。',
                    '不要見到 if 就自動用 will；Type 0 主句通常不用 will。'
                ],
                examples: [
                    {
                        ch: '每當我喝咖啡，我很難入睡。',
                        en: 'When I drink coffee, I find it hard to sleep.',
                        explain: 'When 表示每次都差不多有同一結果。'
                    },
                    {
                        ch: '如果你按這個按鈕，機器會停止。',
                        en: 'If you press this button, the machine stops.',
                        explain: '講機器的一般運作，不是預測明天會怎樣。'
                    }
                ]
            }
        ]
    },
    '1': {
        label: '1',
        sections: [
            {
                title: 'TYPE 1 第一類條件句',
                formula: 'If + simple present, will / can / may + 原形動詞',
                notes: [
                    '用來表達未來很可能發生、合理會發生、或者有機會發生的事。',
                    'If-clause 用 simple present，雖然意思講未來，也不要寫 will。',
                    'Main clause 可以用 will / can / may + 原形動詞，視乎語氣。'
                ],
                examples: [
                    {
                        ch: '如果明天下雨，我會留在家。',
                        en: 'If it rains tomorrow, I will stay at home.',
                        explain: 'rains 是 present simple；主句 will stay 講未來結果。'
                    },
                    {
                        ch: '如果你努力溫習，你可以合格。',
                        en: 'If you study hard, you can pass the exam.',
                        explain: 'can 表示有能力 / 有機會做到。'
                    },
                    {
                        ch: '如果我們現在離開，我們可能會準時到達。',
                        en: 'If we leave now, we may arrive on time.',
                        explain: 'may 表示可能性比 will 低少少。'
                    },
                    {
                        ch: '如果她完成家課，她會玩遊戲。',
                        en: 'If she finishes her homework, she will play games.',
                        explain: 'she finishes 要加 s，因為 If-clause 是 present simple。'
                    }
                ]
            },
            {
                title: 'TYPE 1 常見錯誤',
                formula: 'If-clause 不用 will',
                points: [
                    {
                        note: '講未來條件時，If 後面仍然用 simple present。',
                        examples: [
                            {
                                ch: '如果他明天來，我會告訴你。',
                                en: 'If he comes tomorrow, I will tell you.',
                                explain: '不要寫 If he will come tomorrow。'
                            },
                            {
                                ch: '如果你明天有空，我們可以一起溫習。',
                                en: 'If you are free tomorrow, we can revise together.',
                                explain: 'be verb 也用 present simple：are。'
                            }
                        ]
                    },
                    {
                        note: '除 will 外，也可按意思用 can / may / should / must。',
                        examples: [
                            {
                                ch: '如果你想進步，你應該每天練習。',
                                en: 'If you want to improve, you should practise every day.',
                                explain: 'should 表示建議。'
                            },
                            {
                                ch: '如果你犯錯，你必須改正它。',
                                en: 'If you make a mistake, you must correct it.',
                                explain: 'must 表示必要。'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    '2': {
        label: '2',
        sections: [
            {
                title: 'TYPE 2 第二類條件句',
                formula: 'If + simple past, would / could / might + 原形動詞',
                notes: [
                    '用來表達與現在事實相反、想像中、或者不太可能發生的情況。',
                    'If-clause 用 simple past，不一定真是過去；很多時只是表示「假設」。',
                    'Main clause 用 would / could / might + 原形動詞。'
                ],
                examples: [
                    {
                        ch: '如果我有一百萬美元，我會買一間豪宅。',
                        en: 'If I had a million dollars, I would buy a mansion.',
                        explain: '但我現在沒有一百萬，所以是與現在事實相反。'
                    },
                    {
                        ch: '如果我高一點，我可以加入籃球隊。',
                        en: 'If I were taller, I could join the basketball team.',
                        explain: 'could 表示假設中有能力做到。'
                    },
                    {
                        ch: '如果他更努力讀書，他可能會有更好成績。',
                        en: 'If he studied harder, he might get better results.',
                        explain: 'might 表示結果不是百分百確定。'
                    },
                    {
                        ch: '如果我是你，我會道歉。',
                        en: 'If I were you, I would apologise.',
                        explain: 'If I were you 是固定常用假設句。'
                    }
                ]
            },
            {
                title: 'TYPE 2 句式提示',
                formula: 'were 常用於假設語氣',
                points: [
                    {
                        note: '在正式或考試英文，假設句常用 were，即使主語是 I / he / she / it。',
                        examples: [
                            {
                                ch: '如果她是班長，她會改變規則。',
                                en: 'If she were the monitor, she would change the rules.',
                                explain: 'she were 用於假設，不是普通過去式。'
                            },
                            {
                                ch: '如果這件事是真的，我會很驚訝。',
                                en: 'If it were true, I would be surprised.',
                                explain: 'it were 表示「假如是真的」。'
                            }
                        ]
                    },
                    {
                        note: 'Type 2 不是講過去，而是講「現在 / 將來不真實或機會低」的想像。',
                        examples: [
                            {
                                ch: '如果我住近學校，我每天會步行上學。',
                                en: 'If I lived near school, I would walk to school every day.',
                                explain: '意思是我現在不是住近學校。'
                            },
                            {
                                ch: '如果我們今天不用上課，我們會去看電影。',
                                en: 'If we did not have lessons today, we would watch a film.',
                                explain: 'did not have 是假設，不是單純講過去。'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    '3': {
        label: '3',
        sections: [
            {
                title: 'TYPE 3 第三類條件句',
                formula: 'If + past perfect, would have + pp',
                notes: [
                    '用來表達與過去事實相反的情況。',
                    '簡單來說，就是對過去沒有發生的事情表示後悔、遺憾，或者想像另一個過去結果。',
                    'If-clause 用 had + pp；Main clause 用 would have + pp。'
                ],
                examples: [
                    {
                        ch: '我不知道你要離開。如果我當時知道，我會去機場送你。',
                        en: 'I did not know you were leaving. If I had known, I would have gone to the airport to see you off.',
                        explain: '事實：我當時不知道，所以沒有去機場。'
                    },
                    {
                        ch: 'Kelly 上星期五發燒。如果她當時沒有病，她會來我們的派對。',
                        en: 'Kelly had a fever last Friday. If she had not been ill, she would have come to our party.',
                        explain: '事實：她當時病了，所以沒有來。'
                    },
                    {
                        ch: '我把鬧鐘校錯時間。如果我當時沒有這麼粗心，我今天就不會上學遲到。',
                        en: "I set my alarm clock for the wrong time. I wouldn't have been late for school today if I had not been so careless.",
                        explain: '事實：我當時粗心，所以遲到。'
                    },
                    {
                        ch: '如果你當時告訴我，我就能夠幫你。',
                        en: 'If you had told me, I could have helped you.',
                        explain: 'could have + pp 表示當時本來有能力做到。'
                    }
                ]
            },
            {
                title: 'TYPE 3 進階替換',
                formula: 'would have + pp | might have + pp | could have + pp',
                points: [
                    {
                        note: 'would have + pp：表示假設中的過去結果比較肯定。',
                        examples: [
                            {
                                ch: '如果我當時早點出門，我就會趕上巴士。',
                                en: 'If I had left earlier, I would have caught the bus.',
                                explain: 'would have caught 表示結果很大機會會發生。'
                            },
                            {
                                ch: '如果他當時聽我的建議，他就不會輸掉比賽。',
                                en: 'If he had listened to my advice, he would not have lost the match.',
                                explain: 'would not have lost 表示想像中相反的過去結果。'
                            }
                        ]
                    },
                    {
                        note: 'might have + pp：表示過去可能會發生，但不太肯定。',
                        examples: [
                            {
                                ch: '如果你當時吃了發霉的麵包，你可能會病。',
                                en: 'If you had eaten the mouldy bread, you might have been sick.',
                                explain: 'might have been 表示有可能，但不是百分百。'
                            },
                            {
                                ch: '如果我們當時坐的士，我們可能會早一點到。',
                                en: 'If we had taken a taxi, we might have arrived earlier.',
                                explain: 'might have arrived 表示只是可能早到。'
                            }
                        ]
                    },
                    {
                        note: 'could have + pp：表示過去本來有能力 / 有機會做到。',
                        examples: [
                            {
                                ch: '如果你當時告訴我，我就能夠幫你。',
                                en: 'If you had told me, I could have helped you.',
                                explain: 'could have helped 表示當時本來能幫。'
                            },
                            {
                                ch: '如果她當時有更多時間，她就能完成報告。',
                                en: 'If she had had more time, she could have finished the report.',
                                explain: 'had had = past perfect，第一個 had 是助動詞。'
                            }
                        ]
                    }
                ]
            },
            {
                title: 'WISH 願望 / 遺憾',
                formula: 'wish + simple past | wish + past perfect',
                points: [
                    {
                        note: '與現在事實相反：wish + simple past。',
                        examples: [
                            {
                                ch: '我希望我現在高一點，但事實上我不夠高。',
                                en: 'I wish I were a bit taller.',
                                explain: 'were 表示現在假設，不是普通過去。'
                            },
                            {
                                ch: '我希望我現在有更多時間，但事實上沒有。',
                                en: 'I wish I had more time.',
                                explain: 'had 表示現在相反的願望。'
                            }
                        ]
                    },
                    {
                        note: '與過去事實相反 / 後悔：wish + past perfect。',
                        examples: [
                            {
                                ch: '我錯過了火車。我希望我當時記得正確的開車時間。',
                                en: 'I missed the train. I wish I had remembered the correct time it left.',
                                explain: '事實：我當時沒有記得，所以錯過火車。'
                            },
                            {
                                ch: '我考試前沒有溫習。我希望我當時有更努力。',
                                en: 'I did not revise before the exam. I wish I had worked harder.',
                                explain: 'had worked 是 past perfect，用來講過去的後悔。'
                            }
                        ]
                    }
                ]
            }
        ]
    }
};

const GRAMMAR_PRONOUN_REFERENCE_ROWS = [
    { ch: '我', subject: 'I', object: 'me', possessiveAdj: 'my', possessivePronoun: 'mine', reflexive: 'myself' },
    { ch: '你', subject: 'You', object: 'you', possessiveAdj: 'your', possessivePronoun: 'yours', reflexive: 'yourself' },
    { ch: '我們', subject: 'We', object: 'us', possessiveAdj: 'our', possessivePronoun: 'ours', reflexive: 'ourselves' },
    { ch: '他們', subject: 'They', object: 'them', possessiveAdj: 'their', possessivePronoun: 'theirs', reflexive: 'themselves' },
    { ch: '他', subject: 'He', object: 'him', possessiveAdj: 'his', possessivePronoun: 'his', reflexive: 'himself' },
    { ch: '她', subject: 'She', object: 'her', possessiveAdj: 'her', possessivePronoun: 'hers', reflexive: 'herself' },
    { ch: '它/牠', subject: 'It', object: 'it', possessiveAdj: 'its', possessivePronoun: 'its', reflexive: 'itself' }
];

const GRAMMAR_DE_STRUCTURE_REFERENCE_SECTIONS = [
    {
        title: 'CORE IDEA 中文「的」',
        formula: '中文：的 + 名詞 | 英文：有些放名詞前，有些放名詞後',
        notes: [
            '中文所有「的」都放在名詞前面，但英文不是。',
            '英文「的」要先分辨：形容詞 / 數字量詞 / 人的 / 有沒有 / relative clause / 時間地方 / about / of。',
            '做題時先找真正被形容的名詞，再決定英文結構放前還是放後。'
        ],
        examples: [
            { ch: '一隻快樂的狗', en: 'A happy dog', explain: 'simple adjective 放名詞前。' },
            { ch: '一部有很多螢幕的電腦', en: 'A computer with many screens', explain: 'with 放名詞後。' }
        ]
    },
    {
        title: '名詞前方的',
        formula: 'adj + noun | number-measure + noun | person + \'s + noun',
        points: [
            {
                note: '簡單形容詞放名詞前方。',
                examples: [
                    { ch: '一隻白色的貓', en: 'A white cat' },
                    { ch: '一台新但慢的電腦', en: 'A new but slow computer' }
                ]
            },
            {
                note: '數字量詞形容詞要加 hyphen，量詞不用加 s。',
                examples: [
                    { ch: '一間五星的酒店', en: 'A five-star hotel' },
                    { ch: '一個5歲的女孩', en: 'A 5-year-old girl' }
                ]
            },
            {
                note: '人的「的」用 \'s / s\'。',
                examples: [
                    { ch: 'Tom的爸爸', en: "Tom's father" },
                    { ch: '很多學生的目標', en: "Many students' aims" }
                ]
            }
        ]
    },
    {
        title: '有 / 沒有 + 名詞',
        formula: 'noun + with ... | noun + without ...',
        notes: [
            '有 + 名詞：多數用 with 放在名詞後。',
            '沒有 + 名詞：多數用 without 放在名詞後。',
            '如果主語是人，也可以用 who has / who have；非人可用 which has / which have。'
        ],
        examples: [
            { ch: '一些有很多問題的玩具', en: 'Some toys with many problems', explain: '也可寫 Some toys which have many problems.' },
            { ch: '一個有很多fans的歌手', en: 'A singer with many fans', explain: '也可寫 A singer who has many fans.' },
            { ch: '一些沒有水的瓶子', en: 'Some bottles without water' }
        ]
    },
    {
        title: 'Relative Clause 的',
        formula: '人：who / that | 非人：which / that',
        points: [
            {
                note: 'Modal verb + 的：who / which + can / will / may / should / must。',
                examples: [
                    { ch: '一隻可以跑得快的狗', en: 'A dog which can run fast' },
                    { ch: '任何可以幫助他的人', en: 'Anyone who can help him' }
                ]
            },
            {
                note: '主動動詞 + 的：who / which + verb，要留意時態。',
                examples: [
                    { ch: '一隻常常吠的狗', en: 'A dog which often barks' },
                    { ch: '昨天來的那個女人', en: 'The woman who came yesterday' }
                ]
            },
            {
                note: '句子 + 的：object relative pronoun 可以省略。',
                examples: [
                    { ch: '一套我喜歡的電影', en: 'A movie I like', explain: '也可寫 A movie which I like.' },
                    { ch: '一個很多女孩喜歡的歌手', en: 'A singer many girls like' }
                ]
            }
        ]
    },
    {
        title: '被動動詞的',
        formula: 'noun + which/that + be + pp | noun + pp',
        notes: [
            '被動 relative clause 可以完整寫 who/which + be + pp。',
            '亦可以直接把 pp 放在名詞後面。',
            'Game 會接受兩款答案。'
        ],
        examples: [
            { ch: '一本上年寫的小說', en: 'A novel written last year', explain: '也可寫 A novel which was written last year.' },
            { ch: '一隻今天早上殺的羊', en: 'A goat killed this morning', explain: '也可寫 A goat which was killed this morning.' }
        ]
    },
    {
        title: '其他後置的',
        formula: 'time/place/about/of after noun',
        points: [
            {
                note: '時間詞和地方詞通常放名詞後。',
                examples: [
                    { ch: '明天的考試', en: 'The exam tomorrow' },
                    { ch: '荃灣的餐廳', en: 'Restaurants in Tsuen Wan' }
                ]
            },
            {
                note: '關於 = about，放名詞後。',
                examples: [
                    { ch: '一本關於香港的書', en: 'A book about Hong Kong' }
                ]
            },
            {
                note: '死物的死物：the ... of ...，兩個名詞前後調轉。',
                examples: [
                    { ch: '這電腦的價格', en: 'The price of this computer' },
                    { ch: '這件外套的牌子', en: 'The brand of this jacket' }
                ]
            }
        ]
    },
    {
        title: '主句動詞陷阱',
        formula: '「的」入面的動詞屬於名詞，不一定是主句動詞',
        notes: [
            '先括住整個「的」名詞組，再找主句真正動詞。',
            '不要見到「的」入面有動詞，就以為主句已經有動詞。'
        ],
        examples: [
            { ch: '那隻常常吠的狗很惡。', en: 'The dog which often barks is fierce.', explain: '主句動詞是 is；barks 屬於 the dog.' },
            { ch: '那個我從不去的國家將會消失。', en: 'The country I never go to will disappear.', explain: '主句動詞是 will disappear.' }
        ]
    }
];

const GRAMMAR_PARTICIPLE_PHRASES_REFERENCE_SECTIONS = [
    {
        title: 'CORE IDEA 核心概念',
        formula: 'Participle phrase = 前因不用連接詞；主語只寫在結果句',
        notes: [
            '用 participle phrase 表達因果關係時，前因句不用 because / since / as。',
            '前因部分通常不寫主語，主語保留在結果句。',
            '前因和結果必須指向同一個主語。'
        ],
        examples: [
            { ch: '這間公司想發展 AI，所以要發行更多股票籌集資金。', en: 'Aiming to develop AI, this company has to issue more shares to raise funds.' }
        ]
    },
    {
        title: '要訣 1 主動動詞轉 V-ing',
        formula: 'active verb -> V-ing',
        notes: [
            '如果前因句有主動動詞，將動詞改成 V-ing 放在句首。'
        ],
        examples: [
            { ch: '原因：This company aims to develop AI.', en: 'Aiming to develop AI, this company has to issue more shares to raise funds.' }
        ]
    },
    {
        title: '要訣 2 被動動詞刪走 be',
        formula: 'be + pp -> pp',
        notes: [
            '如果前因句有被動動詞 be + pp，句首 participle phrase 通常不寫 be，只保留 pp。'
        ],
        examples: [
            { ch: '原因：This company is often criticised by its customers.', en: 'Often criticised by its customers, this company is losing revenues rapidly.' }
        ]
    },
    {
        title: '要訣 3 複合形容詞刪走 be',
        formula: 'be + adj + prep -> adj + prep',
        notes: [
            '如果前因句是 be + 複合形容詞，例如 satisfied with，也是不寫 be。'
        ],
        examples: [
            { ch: '大多數客戶對我們的服務滿意，所以常常在網上推薦我們。', en: 'Satisfied with our services, most clients often recommend us online.' }
        ]
    },
    {
        title: '要訣 4 否定改成 Not',
        formula: 'not + participle phrase',
        notes: [
            '前因是否定時，句首直接用 Not。'
        ],
        examples: [
            { ch: '客戶不滿意我們的服務，所以不會在網上推薦我們。', en: 'Not satisfied with our services, most clients do not recommend us online.' }
        ]
    },
    {
        title: '要訣 5 Modal verb 通常不用 participle phrase',
        formula: 'can / may / must / should -> use a conjunction',
        notes: [
            '如果前因句有 modal verb，基本上用 since / because / as 等連接詞會自然得多。'
        ],
        examples: [
            { ch: '用連接詞較自然。', en: 'Since customers can enjoy more discounts in the morning, they often come here very early.' }
        ]
    },
    {
        title: '要訣 6 強調先完成前因',
        formula: 'having + pp / having been + pp',
        notes: [
            '如果想強調「前因做完，才發生結果」，主動可用 having + pp。',
            '如果是被動完成，可用 having been + pp。'
        ],
        examples: [
            { ch: '完成市場研究後，該公司決定放棄計劃。', en: 'Having completed the market research, the company decided to give up the plan.' },
            { ch: '發現真相後，他自殺了。', en: 'Having discovered the truth, he committed suicide.' },
            { ch: '身份被揭發後，他被迫辭職。', en: 'Having been exposed, he was forced to resign.' }
        ]
    },
    {
        title: '要訣 7 可以配搭時間 / 條件字',
        formula: 'after / before / when / while / if / once / unless + participle phrase',
        notes: [
            'After / before / when / while / if / once / unless 可以放在 participle phrase 前面。',
            '遇到被動動詞或複合形容詞時，可用 being；有時 being 也可以省略。'
        ],
        examples: [
            { ch: '試過這款醬之後，我覺得其他牌子不好。', en: 'After tasting this sauce, I found other brands bad.' },
            { ch: '在他被提名為諾貝爾獎得主之前，他生活貧困。', en: 'Before being nominated as a Nobel Prize winner, he lived in poverty.' },
            { ch: '當父母對我的成績不滿意時，他們狠狠地責罵我。', en: 'When not being satisfied with my grades, they scolded me bitterly.' },
            { ch: '開發遊戲時，我想到了一個好主意。', en: 'While developing the game, I came up with a good idea.' },
            { ch: '如果正確使用，這條文法規則可以幫助你很多。', en: 'If used correctly, this grammar rule can help you a lot in writing.' }
        ]
    },
    {
        title: '要訣 8 前因後果必須同主語',
        formula: 'same subject only',
        notes: [
            'Participle phrase 會修飾後句主語，所以前因和結果必須是同一個人或物。',
            '如果後句是 it is 句式，通常不適合直接用 participle phrase。',
            'Have 不適合直接放句頭做 participle phrase；可改用 With。'
        ],
        checks: [
            { status: 'bad', text: 'Not performing well in the exam, my parents scolded me bitterly.' },
            { status: 'good', text: 'Not performing well in the exam, I was scolded by my parents bitterly.' },
            { status: 'bad', text: 'If having rich parents, it is easy for you to study overseas.' },
            { status: 'good', text: 'With rich parents, you are likely to study overseas.' }
        ]
    }
];

const GRAMMAR_QUESTION_TAG_REFERENCE_SECTIONS = [
    {
        title: 'CORE FORM 基本公式',
        formula: 'Sentence, question tag?',
        notes: [
            'Question tag = 提問字 + 代名詞 + ?',
            '中文意思接近「不是嗎？」、「對嗎？」。',
            '前面句子的主語，要變成 question tag 入面的代名詞。'
        ],
        examples: [
            { ch: '你愛我，不是嗎？', en: "You love me, don't you?" },
            { ch: '她是老師，不是嗎？', en: "She is a teacher, isn't she?" },
            { ch: '他們昨天遲到了，不是嗎？', en: "They were late yesterday, weren't they?" }
        ]
    },
    {
        title: 'POINT 1 正面句 / 否定句相反',
        formula: 'positive sentence -> negative tag | negative sentence -> positive tag',
        notes: [
            '正面句：question tag 要有 not。',
            '否定句：question tag 不用 not。'
        ],
        examples: [
            { ch: '正面句，所以 tag 有 not。', en: "I love you, don't I?" },
            { ch: '否定句，所以 tag 沒有 not。', en: 'You do not like coffee, do you?' },
            { ch: '正面句，所以 tag 有 not。', en: "John must be killed, mustn't he?" }
        ]
    },
    {
        title: 'POINT 2 Question tag 只用縮寫',
        formula: "do not -> don't | is not -> isn't | must not -> mustn't",
        notes: [
            'Question tag 入面的否定提問字永遠用縮寫。',
            '不要寫 do not he / is not she / must not they。'
        ],
        examples: [
            { ch: '不要寫 do not you。', en: "You play football, don't you?" },
            { ch: '不要寫 is not she。', en: "Mary is clever, isn't she?" },
            { ch: '不要寫 must not we。', en: "We must leave now, mustn't we?" }
        ]
    },
    {
        title: 'POINT 3 Everyone / Everybody / No one 用 they',
        formula: 'everyone / everybody / no one -> they',
        notes: [
            'Everyone、Everybody、No one、Nobody 的 question tag 代名詞通常用 they。',
            'No one / Nobody 本身是否定意思，所以 tag 不用 not。'
        ],
        examples: [
            { ch: 'Everyone 是正面意思，tag 有 not。', en: "Everyone likes the game, don't they?" },
            { ch: 'Everybody 是正面意思，tag 有 not。', en: "Everybody has arrived, haven't they?" },
            { ch: 'No one 是否定意思，tag 沒有 not。', en: 'No one called you, did they?' }
        ]
    },
    {
        title: 'POINT 4 Everything / Nothing / Anything 用 it',
        formula: 'everything / nothing / anything -> it',
        notes: [
            'Everything、Nothing、Anything 指事情或物件，question tag 代名詞用 it。',
            'Nothing 本身是否定意思，所以 tag 不用 not。'
        ],
        examples: [
            { ch: 'Everything 是正面意思，tag 有 not。', en: "Everything is ready, isn't it?" },
            { ch: 'Nothing 是否定意思，tag 沒有 not。', en: 'Nothing happened, did it?' },
            { ch: 'Anything 指事情，代名詞用 it。', en: "Anything can happen, can't it?" }
        ]
    },
    {
        title: 'POINT 5 I am 永遠用 aren’t I?',
        formula: "I am ..., aren't I?",
        notes: [
            'I am 的 question tag 固定是 aren’t I?',
            '不要寫 amn’t I。'
        ],
        examples: [
            { ch: '我很帥，不是嗎？', en: "I am handsome, aren't I?" },
            { ch: '我遲到了，不是嗎？', en: "I am late, aren't I?" },
            { ch: '我在你的隊伍裡，不是嗎？', en: "I am on your team, aren't I?" }
        ]
    },
    {
        title: 'POINT 6 Let’s 永遠用 shall we?',
        formula: "Let's ..., shall we?",
        notes: [
            'Let’s 表示「不如...」，question tag 固定是 shall we?'
        ],
        examples: [
            { ch: '不如開始吧，好嗎？', en: "Let's start, shall we?" },
            { ch: '不如休息一下吧，好嗎？', en: "Let's take a break, shall we?" },
            { ch: '不如玩多一局吧，好嗎？', en: "Let's play one more round, shall we?" }
        ]
    },
    {
        title: 'POINT 7 否定字令句子變否定',
        formula: 'seldom / rarely / never / not / no = negative',
        notes: [
            '句子有 seldom、rarely、never、not、no，就當否定句處理。',
            '因為前句已經是否定意思，所以 question tag 不用 not。'
        ],
        examples: [
            { ch: 'seldom 是否定意思，tag 沒有 not。', en: 'He seldom eats meat, does he?' },
            { ch: 'never 是否定意思，tag 沒有 not。', en: 'She never lies, does she?' },
            { ch: 'no 是否定意思，tag 沒有 not。', en: 'There is no water left, is there?' }
        ]
    },
    {
        title: 'POINT 8 點揀提問字',
        formula: 'modal | has/have + pp | do/does/did | be verb',
        notes: [
            '句子有 modal verb，就用同一個 modal verb。',
            '句子有 has / have + pp，就用 has / have。',
            '句子只有主動動詞，就用 do / does / did。',
            '句子有 is / am / are / was / were，就用相同 be verb。'
        ],
        examples: [
            { ch: '有 modal verb must，所以 tag 用 must。', en: "John must be killed, mustn't he?" },
            { ch: '有 has + pp，所以 tag 用 has。', en: "She has finished her homework, hasn't she?" },
            { ch: '只有主動動詞 love，所以 tag 用 do。', en: "I love you, don't I?" },
            { ch: '句子有 be verb is，所以 tag 用 is。', en: "This answer is correct, isn't it?" }
        ]
    }
];

const GRAMMAR_REPORTED_SPEECH_REFERENCE_SECTIONS = [
    {
        title: 'REPORTED STATEMENT 轉述句',
        formula: 'Direct speech -> reported speech',
        notes: [
            'Reported statement 轉述意思，不用原話，所以通常要改變時態、人稱代名詞、時間和地方字眼。',
            '連接詞 that 通常可以省略。'
        ],
        examples: [
            { ch: '直接引語：Tom said, "I am tired."', en: 'Tom said (that) he was tired.' },
            { ch: '直接引語：Mary said, "I will call you tomorrow."', en: 'Mary said (that) she would call me the next day.' }
        ]
    },
    {
        title: 'STATEMENT 1 Reporting Verbs',
        formula: 'say + clause | tell + object + clause',
        notes: [
            'say 後面不加對象：He said (that)...',
            'tell 後面必須加對象：He told me (that)...'
        ],
        examples: [
            { ch: 'say 後面直接接轉述內容。', en: 'He said (that) he was busy.' },
            { ch: 'tell 後面要有對象 me。', en: 'He told me (that) he was busy.' },
            { ch: 'tell 不可以漏對象。', en: 'She told us (that) the lesson was useful.' }
        ]
    },
    {
        title: 'STATEMENT 2 時態向過去退一步',
        formula: 'present -> past | past / present perfect -> past perfect | will -> would',
        notes: [
            '核心法則：時態向過去退後一步。',
            'Simple Present 變 Simple Past。',
            'Present Continuous 變 Past Continuous。',
            'Simple Past 和 Present Perfect 多數變 Past Perfect。',
            'will 變 would。'
        ],
        examples: [
            { ch: 'do / does 變 did。', en: 'He said (that) he liked English.' },
            { ch: 'is doing 變 was doing。', en: 'She said (that) she was doing homework.' },
            { ch: 'did 變 had done。', en: 'Tom said (that) he had bought a new cap.' },
            { ch: 'have done 變 had done。', en: 'Mary said (that) she had finished the project.' },
            { ch: 'will 變 would。', en: 'Ken said (that) he would help me.' }
        ]
    },
    {
        title: 'STATEMENT 3 時態可以不變的情況',
        formula: 'facts / still true / clear time markers',
        notes: [
            '如果轉述內容是現在依然真實的客觀事實，時態可以保留不變。',
            '如果時間標記很明確，例如 when I was small，時態也可以保留。'
        ],
        examples: [
            { ch: '職業現在仍然真實。', en: 'He said (that) he is a doctor.' },
            { ch: '客觀事實。', en: 'The teacher said (that) the earth goes around the sun.' },
            { ch: '時間已清楚指向過去。', en: 'She said (that) she lived in Japan when she was small.' }
        ]
    },
    {
        title: 'STATEMENT 4 人稱代名詞',
        formula: 'I / we -> he / she / they',
        notes: [
            '根據語境轉換「我、你、他」。',
            'I / we 變 he / she / they。',
            'me / us 變 him / her / them。',
            'my / our 變 his / her / their。',
            'mine / ours 變 his / hers / theirs。'
        ],
        examples: [
            { ch: 'I 變 he。', en: 'Tom said (that) he was tired.' },
            { ch: 'my 變 her。', en: 'Mary said (that) her bag was missing.' },
            { ch: 'our 變 their。', en: 'They said (that) their team had won.' }
        ]
    },
    {
        title: 'STATEMENT 5 時間及地方字眼',
        formula: 'near -> far',
        notes: [
            '核心法則：「近變遠」。',
            'here 變 there；this / these 變 that / those 或 the。',
            'now 變 then / at the time；today 變 that day；tonight 變 that night。',
            'tomorrow 變 the next day / the following day；yesterday 變 the day before / the previous day。',
            'ago 變 before；last 變 previous；next 變 following。'
        ],
        examples: [
            { ch: 'here 變 there。', en: 'He said (that) he lived there.' },
            { ch: 'tomorrow 變 the next day。', en: 'She said (that) she would leave the next day.' },
            { ch: 'yesterday 變 the day before。', en: 'He said (that) he had met Leo the day before.' },
            { ch: 'last week 變 the previous week。', en: 'Amy said (that) she had been sick the previous week.' }
        ]
    },
    {
        title: 'REPORTED QUESTION 轉述問題',
        formula: 'asked / wondered + wh-word / whether + subject + verb',
        notes: [
            '轉述別人問的問題時，不能用 say，要用 asked、wondered 等動詞。',
            '句子最後用句號，不再用問號。',
            '時態、人稱、時間和地方字眼的轉換，跟 reported statements 一樣。'
        ],
        examples: [
            { ch: '真問句變假問句。', en: 'He asked me where I went yesterday.' },
            { ch: '句尾用句號。', en: 'She asked me whether I was ready.' }
        ]
    },
    {
        title: 'QUESTION 1 Wh-questions',
        formula: 'wh-word + subject + verb',
        notes: [
            '保留原有疑問詞：who / where / when / what / which / how。',
            '把真問句次序改成假問句次序：主語 + 動詞。',
            '不要保留 did / do / does 作為提問字。'
        ],
        examples: [
            { ch: '錯誤：where did I go。', en: 'He asked me where I went yesterday.' },
            { ch: 'Direct: "Where did you buy your cap?"', en: 'Nathan asked me where I had bought my cap.' },
            { ch: 'Direct: "What are you doing?"', en: 'She asked me what I was doing.' }
        ]
    },
    {
        title: 'QUESTION 2 Yes / No questions',
        formula: 'whether / if + subject + verb',
        notes: [
            '是非問句沒有 wh-word，所以用 whether 或 if 連接。',
            '原句有 do / does / did 作為提問詞，轉述時要刪除。'
        ],
        examples: [
            { ch: 'Direct: "Are you a student?"', en: 'The shop assistant asked me whether I was a student.' },
            { ch: 'Direct: "Do you often shop online?"', en: 'Peter asked Leo whether he often shopped online.' },
            { ch: 'Direct: "Did you finish the work?"', en: 'She asked me if I had finished the work.' }
        ]
    },
    {
        title: 'ORDERS AND REQUESTS 命令 / 請求',
        formula: 'ask / tell / order / instruct / request + object + to-infinitive',
        notes: [
            '轉述命令或請求時，通常用 to + 原形動詞。',
            '代名詞、時間和地方字眼的轉換，與 reported statements 相同。'
        ],
        examples: [
            { ch: 'Direct: "Please tell your brother about the birthday party."', en: 'Helen asked Paul to tell his brother about the birthday party.' },
            { ch: 'Direct: "Stop and get out of the car!"', en: 'The policeman instructed the driver to stop and get out of the car.' },
            { ch: 'Direct: "Please wake me up at five tomorrow morning."', en: 'Kathy asked her mum to wake her up at five the next morning.' }
        ]
    },
    {
        title: 'OFFERS / SUGGESTIONS / ADVICE',
        formula: 'verb + to-infinitive | verb + object + to-infinitive | verb + gerund',
        notes: [
            '提議、拒絕或同意：agree、invite、offer、promise、refuse。',
            '勸告或建議：advise、caution、recommend、remind、suggest、warn。',
            'offer / promise / agree / refuse 後常用 to-infinitive。',
            'remind / warn / advise / invite 後常用 object + to-infinitive。',
            'suggest / recommend 後常用 gerund。'
        ],
        examples: [
            { ch: 'Direct: "Let me drive you home."', en: 'Ken offered to drive Abby home.' },
            { ch: 'Direct: "You should get plenty of rest and drink lots of water."', en: 'The doctor advised Sally to get plenty of rest and drink lots of water.' },
            { ch: 'Direct: "Let’s go for a swim."', en: 'Lily suggested going for a swim.' },
            { ch: '另一種 suggest 句式。', en: 'Lily suggested (that) we go for a swim.' }
        ]
    },
    {
        title: 'NEGATIVE FORM 否定形式',
        formula: 'not + to-infinitive / not + gerund',
        notes: [
            '轉述負面命令、請求或建議時，在 to-infinitive 或 gerund 前加 not。'
        ],
        examples: [
            { ch: 'Direct: "Don’t walk on the grass."', en: 'Mr Chan told his students not to walk on the grass.' },
            { ch: 'Direct: "Let’s not go to Macau."', en: 'She suggested not going to Macau.' },
            { ch: 'Direct: "Please don’t be late."', en: 'He asked me not to be late.' }
        ]
    }
];

const GRAMMAR_IT_IS_REFERENCE_SECTIONS = [
    {
        title: 'WHEN TO USE IT IS 何時要用',
        formula: 'It is + adjective + to-infinitive / that-clause',
        notes: [
            '英文有些句子要用 It is 句型，尤其是用形容詞來形容「行為」或「整件事」。',
            '如果形容詞是形容名詞本身，就不用 It is 句型。',
            '例如「學生難以有足夠時間休息」是形容行為，所以用 It is；「這問題很難」是形容 problem，所以不用。'
        ],
        examples: [
            { ch: '形容「休息」這個行為，所以用 It is。', en: 'It is difficult for students to have enough time to rest.' },
            { ch: '形容 problem 本身，所以不用 It is。', en: 'This problem is difficult.' }
        ]
    },
    {
        title: 'PATTERN 1 形容行為',
        formula: 'It is + adjective + (for someone) + to + verb',
        notes: [
            'for 人 不是必須；如果沒有特定對象，可以省略。',
            '常用形容詞：difficult / easy / necessary / possible / impossible / common / natural / important。'
        ],
        examples: [
            { ch: '我很難明白他。', en: 'It is difficult for me to understand him.' },
            { ch: '學英文很易。', en: 'It is easy to learn English.' },
            { ch: '你必須聽我講。', en: 'It is necessary for you to listen to me.' },
            { ch: '你有可能成為一個醫生。', en: 'It is possible for you to be a doctor.' },
            { ch: '我們不可能輸。', en: 'It is impossible for us to lose.' }
        ]
    },
    {
        title: 'PATTERN 1 高分替換',
        formula: 'difficult -> no easy feat | easy -> a piece of cake | necessary -> essential',
        notes: [
            'difficult 可以升級成 It is no easy feat。',
            'easy 可以升級成 It is a piece of cake。',
            'necessary 可以升級成 It is essential。',
            'important 可以升級成 It is crucial。',
            'common 可以升級成 It is not uncommon / It is commonplace。'
        ],
        examples: [
            { ch: '學生難以自信地說話。', en: 'It is no easy feat for students to speak confidently.' },
            { ch: '理解這個 topic 很容易。', en: 'It is a piece of cake to understand this topic.' },
            { ch: '你必須理解這 topic。', en: 'It is essential for you to understand this topic.' },
            { ch: '老人家有朋友是重要的。', en: 'It is crucial for the elderly to have friends.' },
            { ch: '學生普遍有很多社交媒體帳戶。', en: 'It is not uncommon for students to have many social media accounts.' }
        ]
    },
    {
        title: 'PATTERN 1 更多常用形容詞',
        formula: 'common / natural / important / impossible',
        notes: [
            'common 表示普遍；natural 表示自然或正常；important 表示重要；impossible 表示不可能。'
        ],
        examples: [
            { ch: '學生普遍懶惰。', en: 'It is common for students to be lazy.' },
            { ch: '感到傷心是正常的。', en: 'It is natural to feel sad.' },
            { ch: '保護環境是重要的。', en: 'It is important to protect the environment.' },
            { ch: '香港不可能成為一個國際金融中心。', en: 'It is impossible for Hong Kong to become an international financial centre.' },
            { ch: '成為一個醫生是困難的。', en: 'It is no easy feat to become a doctor.' }
        ]
    },
    {
        title: 'PATTERN 2 讚人 / 批評人',
        formula: 'It is + adjective + of someone + to + verb',
        notes: [
            '如果形容詞是讚人或批評人的性格、品格、行為態度，就用 of 人。',
            '常見形容詞：kind / stupid / careless / selfish / generous / nice。'
        ],
        examples: [
            { ch: '你分享小食給弟弟，真是仁慈。', en: 'It is kind of you to share your snacks with your brother.' },
            { ch: '你信他真是笨。', en: 'It is stupid of you to trust him.' },
            { ch: '司機忘記關窗，真是不小心。', en: 'It is careless of the driver to forget to close the window.' },
            { ch: '那些小朋友拿走所有巧克力，真是自私。', en: 'It is selfish of those children to take away all the chocolates.' }
        ]
    },
    {
        title: 'PATTERN 3 形容「整件事」',
        formula: 'It is + adjective + that + sentence',
        notes: [
            '用 It is + adjective + that + 完整句子，形容整件事。',
            '常見形容詞：unfortunate / obvious / apparent / evident。'
        ],
        examples: [
            { ch: '不幸的是那些小朋友未能在昨天的火災中生還。', en: 'It is unfortunate that those children failed to survive in the fire yesterday.' },
            { ch: '明顯地他們不是正在做功課。', en: 'It is obvious that they are not doing homework.' },
            { ch: '很明顯他在說謊。', en: 'It is apparent that he is lying.' },
            { ch: '很明顯這計劃不會成功。', en: 'It is evident that this plan will not succeed.' }
        ]
    },
    {
        title: 'PATTERN 4 作文加分句式',
        formula: 'It is fixed phrase + that + sentence',
        notes: [
            '這類句式適合正式寫作，用來引入觀點、事實、報告或建議。',
            'It is suggested that 後面常用 should + 原形動詞；正式文體也可以省略 should。'
        ],
        examples: [
            { ch: '無可否認的是香港正在逐漸復甦。', en: 'It is undeniable that Hong Kong is gradually recovering.' },
            { ch: '眾所周知的是我們學校缺乏學生儲物櫃。', en: 'It is widely acknowledged that our school lacks lockers for students.' },
            { ch: '不言而喻的是中國正在快速成長。', en: 'It goes without saying that China is growing rapidly.' },
            { ch: '有報告指出很多高中學生一直受失眠困擾。', en: 'It is reported that a great number of senior students have been suffering from insomnia.' },
            { ch: '我建議政府應該興建更多公共圖書館。', en: 'It is suggested that the government should build more public libraries.' }
        ]
    },
    {
        title: 'PATTERN 4 更多作文例子',
        formula: 'undeniable / widely acknowledged / goes without saying / reported / suggested',
        notes: [
            'a growing number of 可以代替 more and more，寫作感覺較正式。',
            'in reality / in the real world 可以表達「在現實世界」。',
            'no longer 表示「不再」。'
        ],
        examples: [
            { ch: '不言而喻的是越來越多小朋友缺乏父母關注。', en: 'It goes without saying that a growing number of children lack attention from their parents.' },
            { ch: '有報告指出超過 90% 的本土學生未在現實世界用過英文。', en: 'It is reported that over 90% of local students have never used English in the real world.' },
            { ch: '無可否認的是他的英文進步了很多。', en: 'It is undeniable that his English has improved a lot.' },
            { ch: '眾所周知的是香港不再是一個國際城市。', en: 'It is widely acknowledged that Hong Kong is no longer an international city.' },
            { ch: '我建議學校應該為學生設立更多儲物櫃。', en: 'It is suggested that the school (should) set up more lockers for students.' }
        ]
    }
];

const GRAMMAR_DIRECT_QUESTION_REFERENCE_SECTIONS = [
    {
        title: 'DIRECT QUESTION 真問句',
        formula: 'Wh-word ＋ 提問字 ＋ 主語 ＋ ... ？',
        notes: [
            'Direct Question 是有問號的真問句。',
            '99% 真問句都有提問字；例外是 Wh-word 本身做主語。'
        ],
        examples: [
            { ch: '你通常如何上學？', en: 'How do you usually go to school?', explain: 'How 是 Wh-word；go 是主動動詞，所以提問字用 do。' },
            { ch: '為甚麼他可以這麼帥？', en: 'Why can he be so handsome?', explain: 'Why 是 Wh-word；句子有 modal verb can，所以用 can 做提問字。' },
            { ch: '你昨天說了甚麼？', en: 'What did you say yesterday?', explain: 'What 是 Wh-word；yesterday 是過去時間，所以提問字用 did，say 要用原形。' }
        ]
    },
    {
        title: 'STEP 1 先找 Modal Verb',
        formula: 'Wh-word + modal verb + 主語 + ... ?',
        notes: [
            '如果句子有 can / could / will / would / should / must / may 等 modal verb，就用 modal verb 做提問字。'
        ],
        examples: [
            { ch: '為甚麼他可以這麼帥？', en: 'Why can he be so handsome?', explain: '句子有 can，所以 can 放在主語 he 前面做提問字。' },
            { ch: '這條橋將會被拆除嗎？', en: 'Will this bridge be demolished?', explain: '句子有 will，所以 will 放在主語 this bridge 前面；be demolished 是被動。' },
            { ch: '我應該為今晚的派對穿哪一條長裙？', en: 'Which dress should I wear for the party tonight?', explain: 'Which dress 是 Wh-phrase；句子有 should，所以 should 做提問字。' }
        ]
    },
    {
        title: 'STEP 2 找 Has / Have 結構',
        formula: 'has / have + pp | has / have been + V-ing | has / have been + pp',
        notes: [
            '如果句子有「已經 / 過 / 了 / 未」的完成式，通常用 has / have 做提問字。',
            '如果句子有「一直」的 has / have been + V-ing，也用 has / have。',
            '如果句子有「已經被 / 一直被」的 has / have been + pp，也用 has / have。'
        ],
        examples: [
            { ch: '隻狗已經被找回了嗎？', en: 'Has the dog been found yet?', explain: '已經被找回 = has been found，所以 Has 放在主語 the dog 前面。' },
            { ch: '為甚麼他一直在課堂睡覺？', en: 'Why has he been sleeping in class?', explain: '一直在睡覺 = has been sleeping，所以提問字用 has。' },
            { ch: '為甚麼他們去過這麼多國家？', en: 'Why have they been to so many countries?', explain: '去過 = have been to；主語 they，所以用 have。' },
            { ch: '誰的錢包被偷了？', en: 'Whose wallet has been stolen?', explain: 'Whose wallet 是主語；被偷了 = has been stolen，所以用 has。' }
        ]
    },
    {
        title: 'STEP 3 主動動詞用 Do / Does / Did',
        formula: 'Wh-word + do / does / did + 主語 + 原形動詞 ?',
        notes: [
            '如果句子只有主動動詞，就用 do / does / did 做提問字。',
            '用了 do / does / did 之後，主動動詞必須用原形。'
        ],
        examples: [
            { ch: '你昨天說了甚麼？', en: 'What did you say yesterday?', explain: 'yesterday 是過去時間，所以用 did；用了 did 後，say 要用原形。' },
            { ch: '你通常如何上學？', en: 'How do you usually go to school?', explain: 'usually 是現在習慣；主語 you，所以用 do。' },
            { ch: '他喜歡甚麼類型的女孩？', en: 'What types of girls does he like?', explain: '主語 he 是第三身單數，所以用 does；like 要用原形。' },
            { ch: '你較喜歡甚麼類型的女生？', en: 'What kinds of girls do you prefer?', explain: 'prefer 是主動動詞；主語 you，所以用 do。' }
        ]
    },
    {
        title: 'STEP 4 其他情況用 Be Verb',
        formula: 'is / am / are / was / were',
        notes: [
            '如果不是 modal、完成式、主動動詞，就多數用 is / am / are / was / were 做提問字。',
            '被動句沒有 modal 或完成式時，通常用 be verb 做提問字。'
        ],
        examples: [
            { ch: '為甚麼他今早被罰？', en: 'Why was he punished this morning?', explain: '被罰是被動；this morning 是過去，所以用 was。' },
            { ch: '他常常遲到嗎？', en: 'Is he often late?', explain: 'late 是形容詞，句子沒有主動動詞，所以用 is。' },
            { ch: '這是誰的 iPad？', en: 'Whose iPad is it?', explain: 'Whose iPad 是 Wh-phrase；it 前面需要 be verb，所以用 is。' },
            { ch: '這把尺多長？', en: 'How long is this ruler?', explain: 'long 是形容詞，句子沒有主動動詞，所以用 is。' }
        ]
    },
    {
        title: 'STEP 5 選 Wh-word / Wh-phrase',
        formula: 'why / when / where / who | what / how / which / whose + word',
        notes: [
            'Why、When、Where、Who 通常後面不需要再拉名詞或形容詞。',
            '如果 What / Which / Whose 後面直接有名詞，名詞要拉到 Wh-word 後面。',
            '如果 How 後面有形容詞，形容詞要拉到 How 後面；數量用 How many / How much。'
        ],
        examples: [
            { ch: '你喜歡甚麼書？', en: 'What books do you like?', explain: '「甚麼」後面有名詞 books，所以寫成 What books。' },
            { ch: '他下星期會去哪一個國家？', en: 'Which country will he go to next week?', explain: '「哪一個國家」寫成 Which country；句子有 will，所以 will 做提問字。' },
            { ch: '這是誰的電話？', en: 'Whose phone is it?', explain: '「誰的電話」寫成 Whose phone；句子用 is it。' },
            { ch: '你可以跑得幾快？', en: 'How fast can you run?', explain: '「幾快」寫成 How fast；句子有 can，所以 can 做提問字。' },
            { ch: '他們將會買多少公斤的雞翼？', en: 'How many kilograms of chicken wings will they buy?', explain: '「多少公斤」寫成 How many kilograms；句子有 will，所以 will 做提問字。' }
        ]
    },
    {
        title: '更多真問句例子',
        formula: '先決定 Wh-word，再決定提問字',
        notes: [
            '先決定 Wh-word，再跟 4 個步驟選提問字。',
            '留意 willing to / prefer / learn 這些主動動詞要用 do / does / did；有 modal 就優先用 modal。'
        ],
        examples: [
            { ch: '我們在這裡可以學到甚麼？', en: 'What can we learn here?', explain: '句子有 can，所以 can 做提問字；learn 用原形。' },
            { ch: '你為了她願意放棄甚麼？', en: 'What are you willing to give up for her?', explain: 'be willing to 是形容詞結構，所以用 are you。' },
            { ch: '我應該為今晚派對穿哪一條長裙？', en: 'Which dress should I wear for the party tonight?', explain: 'Which dress 是 Wh-phrase；句子有 should，所以 should 做提問字。' }
        ]
    },
    {
        title: '不用提問字：Wh-word 本身做主語',
        formula: 'Wh-word + 動詞 + ... ?',
        notes: [
            '如果問句沒有另外的主語，Wh-word 本身就是主語，就不用 do / does / did / be / modal 做提問字。',
            '這類句子公式是 Wh-word + 動詞。'
        ],
        examples: [
            { ch: '誰殺了他？', en: 'Who killed him?', explain: 'Who 本身就是主語，所以後面直接接 killed。' },
            { ch: '誰知道這密碼？', en: 'Who knows this password?', explain: 'Who 本身就是主語；現在式第三身單數，所以 know 加 s。' },
            { ch: '甚麼原因導致這麼多香港人離開這城市？', en: 'What causes so many Hongkongers to leave this city?', explain: 'What 是主語，causes 是動詞；不用 do / does / did。' },
            { ch: '甚麼食物導致癌症？', en: 'What food causes cancer?', explain: 'What food 是主語；causes 要配第三身單數。' }
        ]
    }
];

const GRAMMAR_INDIRECT_QUESTION_REFERENCE_SECTIONS = [
    {
        title: 'INDIRECT QUESTION 假問句',
        formula: 'no question mark / second question inside a sentence',
        notes: [
            '假問句通常沒有問號，或者是一句問句入面第二個問句。',
            '真問句有問號；假問句用正常句子次序。',
            '一句問句入面有兩句問句時，通常「前真後假」。'
        ],
        examples: [
            { ch: '真問句：有問號。', en: 'Do you like me?' },
            { ch: '假問句：沒有問號。', en: 'Whether you like me is not important.' },
            { ch: '前真後假。', en: 'Can you tell me why you want to break up with me?' },
            { ch: '假問句。', en: 'I am not sure whether I still love you.' }
        ]
    },
    {
        title: 'TYPE 1 是否假問句',
        formula: 'whether / if + subject + verb',
        notes: [
            '「是否 / 會不會 / 應不應該 / 喜不喜歡」這類問題，用 whether 或 if。',
            'whether 比 if 更正式；如果放句首或介詞後，通常用 whether。'
        ],
        examples: [
            { ch: '我不肯定我還愛不愛你。', en: 'I am not sure whether I still love you.' },
            { ch: '你想不想知道你應不應該跟他分手？', en: 'Do you want to know whether you should break up with him?' },
            { ch: '較禮貌問法。', en: 'Would you like to know whether you should break up with him?' },
            { ch: '無論你是不是我的朋友。', en: 'No matter whether you are my friend,' }
        ]
    },
    {
        title: 'WHETHER 可以做主語 / 介詞後內容',
        formula: 'Whether + subject + verb ... | preposition + whether ...',
        notes: [
            'Whether 句可以放在句首做主語，整個 whether 句當作 it。',
            '介詞 about / regarding 後面也可以接 whether 假問句。'
        ],
        examples: [
            { ch: '你喜不喜歡英文並不重要。', en: 'Whether you like English is not important.' },
            { ch: '這文章是關於香港學生應不應該在中國內地讀書。', en: 'This article is about whether Hong Kong students should study in mainland China.' },
            { ch: 'regarding 是較正式的 about。', en: 'This article is regarding whether Hong Kong students should study in mainland China.' },
            { ch: '英文程度影響將來會不會賺很多錢。', en: 'Your English level really affects whether you will make a lot of money in the future.' }
        ]
    },
    {
        title: 'TYPE 2 Wh-word 假問句',
        formula: 'wh-word + subject + verb',
        notes: [
            'Wh-word 假問句用 wh-word + 主語 + 動詞。',
            '不要用真問句次序；不要寫 wh-word + 提問字 + 主語。',
            '常見 wh-word：what / where / why / how / who / when / which。'
        ],
        examples: [
            { ch: '你知不知道我將來應該做甚麼？', en: 'Do you know what I should do in the future?' },
            { ch: '無論我做甚麼。', en: 'No matter what I do,' },
            { ch: '我不想知道你在哪裡。', en: "I don't want to know where you are." },
            { ch: '我仍然不知道他正在做甚麼。', en: "I still don't know what he is doing." }
        ]
    },
    {
        title: '文章 / 討論入面的假問句',
        formula: 'verb + wh-word / whether + subject + verb',
        notes: [
            'discuss、know、tell、affect、be about 等字後面常接假問句。',
            'deal with / cope with / handle / tackle / address 都可表示「應付」。'
        ],
        examples: [
            { ch: '這文章討論香港應該如何應付未來挑戰。', en: 'This article discusses how Hong Kong should deal with future challenges.' },
            { ch: '更多應付寫法。', en: 'Hong Kong should cope with future challenges.' },
            { ch: '為甚麼這麼多人不肯定他們會不會在海外退休？', en: 'Why are so many people not sure whether they will retire abroad?' },
            { ch: '你如何知道他今日病了？', en: 'How can you tell whether he is sick today?' }
        ]
    },
    {
        title: '沒有主語的假問句用 To',
        formula: 'wh-word + to + verb',
        notes: [
            '如果假問句沒有清楚主語，大多用 to 代替主語。',
            '常見結構：how to / what to / who to / where to。'
        ],
        examples: [
            { ch: '我不肯定如何做這題目。', en: 'I am not certain how to answer this question.' },
            { ch: '我想知道明天做甚麼。', en: 'I want to know what to do tomorrow.' },
            { ch: '我不知道問誰好。', en: "I don't know who to ask." },
            { ch: '我還未計劃下星期去哪裡。', en: 'I have not planned where to go next week.' }
        ]
    },
    {
        title: '更多假問句例子',
        formula: 'whether / wh-word + subject + verb',
        notes: [
            '假問句的重點是：不要把第二個問句寫成真問句次序。',
            '句中如果有 modal / have pp / be verb，仍然放在主語後面，維持正常句子次序。'
        ],
        examples: [
            { ch: '他明天會不會來十分重要。', en: 'Whether he will come is really important.' },
            { ch: '你可否告訴我為甚麼你想分手？', en: 'Can you tell me why you want to break up with me?' },
            { ch: '我不肯定我還愛不愛你。', en: 'I am not sure whether I still love you.' },
            { ch: '我仍然不知道他正在做甚麼。', en: "I still don't know what he is doing." }
        ]
    }
];

const GRAMMAR_INVERSION_REFERENCE_SECTIONS = [
    {
        title: 'CORE FORM 核心公式',
        formula: '倒裝字 ＋ 提問字 ＋ 主語 ＋ ...',
        notes: [
            '倒裝句通常是把否定字、Only、Hardly 等「倒裝字」放句首，然後用提問字放在主語前面。',
            '提問字可以是 do / does / did / can / will / should / is / are / have 等。',
            '如果本身沒有提問字，就按 direct question 的方法補 do / does / did。'
        ],
        examples: [
            {
                ch: '我甚少在平日玩手機遊戲。',
                en: 'Seldom do I play mobile games on weekdays.',
                explain: 'Seldom 是倒裝字；play 是主動動詞，所以提問字用 do。'
            },
            {
                ch: '他從不遲交功課。',
                en: 'Never does he hand in his homework late.',
                explain: 'Never 是倒裝字；he 是第三身單數，所以提問字用 does，hand 用原形。'
            },
            {
                ch: '你絕不應打開這道門。',
                en: 'On no account should you open this door.',
                explain: 'On no account 是倒裝字；句子有 should，所以 should 放在主語 you 前面。'
            }
        ]
    },
    {
        title: 'ONLY THROUGH 只有通過',
        formula: 'Only through + noun / V-ing + can / will + subject + verb',
        notes: [
            'Only through 放句首，表示「只有通過某方法」。',
            'through 後面可以接名詞或 V-ing。',
            '後半句要倒裝：can / will / should 等提問字放主語前面。'
        ],
        examples: [
            {
                ch: '只有通過每天閱讀英文文章，學生才能擴闊詞彙量。',
                en: 'Only through reading English articles every day can students expand their vocabulary.',
                explain: 'Only through + V-ing 放句首；can 放在 students 前面。'
            },
            {
                ch: '只有通過投資科技，香港才能保持競爭力。',
                en: 'Only through investing in technology can Hong Kong remain competitive.',
                explain: 'remain 是原形動詞，因為前面已有 can。'
            }
        ]
    },
    {
        title: 'SELDOM 甚少',
        formula: 'Seldom + do / does / did + subject + 原形動詞',
        notes: [
            'Seldom 有否定意思，放句首要倒裝。',
            '如果句子只有主動動詞，就用 do / does / did 做提問字。',
            '用了 do / does / did 後，後面的動詞要用原形。'
        ],
        examples: [
            {
                ch: '現今青少年甚少看新聞。',
                en: 'Seldom do teenagers in this day and age watch news.',
                explain: 'teenagers 是眾數，所以用 do；watch 用原形。'
            },
            {
                ch: '他甚少承認自己的錯誤。',
                en: 'Seldom does he admit his mistakes.',
                explain: 'he 是第三身單數，所以用 does；admit 不加 s。'
            }
        ]
    },
    {
        title: 'NO LONGER 不再',
        formula: 'No longer + do / does / did / can / will + subject + verb',
        notes: [
            'No longer 放句首表示「不再」，後面要倒裝。',
            '如果句子本身有 can / will / modal verb，就直接把 modal verb 放主語前面。',
            '如果只有主動動詞，就補 do / does / did。'
        ],
        examples: [
            {
                ch: '很多學生不再依賴紙本字典。',
                en: 'No longer do many students depend on paper dictionaries.',
                explain: 'depend 是主動動詞，所以補 do。'
            },
            {
                ch: '學生不再能完全避開人工智能。',
                en: 'No longer can students completely avoid artificial intelligence.',
                explain: '句子有 can，所以 can 直接放在 students 前面。'
            }
        ]
    },
    {
        title: 'UNDER NO CIRCUMSTANCES 在任何情況下都不',
        formula: 'Under no circumstances + should / must / can + subject + verb',
        notes: [
            'Under no circumstances 語氣很強，表示「在任何情況下都不」。',
            '後面常用 should / must / can 等 modal verb 倒裝。',
            '適合正式寫作，語氣比 should not 強很多。'
        ],
        examples: [
            {
                ch: '學生在任何情況下都不應抄襲功課。',
                en: 'Under no circumstances should students copy their homework.',
                explain: 'should 放主語 students 前面；copy 用原形。'
            },
            {
                ch: '我們在任何情況下都不可洩露同學的私人資料。',
                en: "Under no circumstances should we reveal our classmates' private information.",
                explain: '這句用 should 表示強烈禁止。'
            }
        ]
    },
    {
        title: 'NOT ONLY 不但',
        formula: 'Not only + auxiliary / be + subject + ..., subject + also + verb',
        notes: [
            'Not only 放句首，Not only 這一邊要倒裝。',
            '後半句通常用 also 表示「而且」。',
            '如果 Not only 後面是 be verb，就直接把 is / are / was / were 放主語前面。'
        ],
        examples: [
            {
                ch: '這個應用程式不但有趣，它也很有教育意義。',
                en: 'Not only is this app entertaining, it is also educational.',
                explain: 'is 放在 this app 前面；後半句 it is also 不用倒裝。'
            },
            {
                ch: '運動不但能強身健體，它也能減壓。',
                en: 'Not only can exercise strengthen our bodies, it can also reduce stress.',
                explain: 'can 放在 exercise 前面；strengthen 用原形。'
            },
            {
                ch: '這個計劃不但浪費金錢，它也浪費時間。',
                en: 'Not only does this plan waste money, it also wastes time.',
                explain: '主動動詞 waste 要補 does；waste 用原形。'
            }
        ]
    },
    {
        title: 'HARDLY 幾乎不',
        formula: 'Hardly + can / could + subject + verb',
        notes: [
            'Hardly 有否定意思，放句首要倒裝。',
            '常用 can / could 表示「幾乎不能」。',
            'Hardly can 常講現在或一般能力；Hardly could 常講過去。'
        ],
        examples: [
            {
                ch: '學生準備 HKDSE 時幾乎不能放鬆。',
                en: 'Hardly can students chill out when preparing for the HKDSE.',
                explain: 'can 放在 students 前面。'
            },
            {
                ch: '他病得很重時幾乎不能說話。',
                en: 'Hardly could he speak when he was seriously ill.',
                explain: 'could 放在 he 前面，表示過去當時幾乎不能。'
            }
        ]
    },
    {
        title: 'ON NO ACCOUNT 絕不',
        formula: 'On no account + should / must / can + subject + verb',
        notes: [
            'On no account 表示「絕不」，語氣強而正式。',
            '後面常用 should / must / can 倒裝。',
            '意思接近 must not / should not，但寫作感更強。'
        ],
        examples: [
            {
                ch: '你絕不應在考試中使用手機。',
                en: 'On no account should you use your phone during the examination.',
                explain: 'should 放在 you 前面。'
            },
            {
                ch: '我們絕不應分享假新聞。',
                en: 'On no account should we share fake news.',
                explain: 'share 用原形，因為前面已有 should。'
            }
        ]
    },
    {
        title: 'AT NO TIME 永遠不 / 絕不',
        formula: 'At no time + will / would / should + subject + verb',
        notes: [
            'At no time 表示「永遠不會」或「絕不」。',
            '後面通常用 will / would / should 等倒裝。',
            '比 never 更正式，常用於作文。'
        ],
        examples: [
            {
                ch: '我永遠不會放棄學習英文。',
                en: 'At no time will I give up learning English.',
                explain: 'will 放在 I 前面。'
            },
            {
                ch: '醫生絕不應向病人隱瞞真相。',
                en: 'At no time should doctors hide the truth from patients.',
                explain: 'should 放在 doctors 前面。'
            }
        ]
    },
    {
        title: 'NEVER 從不 / 永不',
        formula: 'Never + do / does / did / will / can / should + subject + verb',
        notes: [
            'Never 放句首會令句子變倒裝。',
            '如果講習慣或一般動作，用 do / does。',
            '如果講將來或強烈承諾，可用 will；如果講建議或規則，可用 should。'
        ],
        examples: [
            {
                ch: '我們從不讀 Biology 教科書。',
                en: 'Never do we read Biology textbooks.',
                explain: 'read 是主動動詞，所以補 do。'
            },
            {
                ch: '我永遠不會忘記老師的鼓勵。',
                en: "Never will I forget my teacher's encouragement.",
                explain: '講永遠不會，所以用 will 倒裝。'
            },
            {
                ch: '我們永遠不應低估教育的重要性。',
                en: 'Never should we underestimate the importance of education.',
                explain: 'should 放在 we 前面，表示不應該。'
            }
        ]
    },
    {
        title: 'THE MORE..., THE MORE... 越...越...',
        formula: 'The + comparative + subject + verb, the + comparative + subject + verb',
        notes: [
            '這類不是「提問字倒裝」，但屬於 inversion topic 的常考句式。',
            '兩邊都用 The + 比較級，表示「越...越...」。',
            '第二邊可用 will / can 表示結果。'
        ],
        examples: [
            {
                ch: '你越努力學習，你會取得越好的成績。',
                en: 'The harder you study, the better results you will get.',
                explain: 'harder 和 better 是比較級。'
            },
            {
                ch: '學生閱讀越多，他們的寫作會越好。',
                en: 'The more students read, the better their writing will become.',
                explain: 'The more... the better... 表示程度一起增加。'
            }
        ]
    },
    {
        title: 'NOR 也不',
        formula: 'Negative clause, nor + auxiliary + subject + verb',
        notes: [
            '前半句是否定句，後半句用 nor 表示「也不」。',
            'nor 後面要倒裝：提問字放主語前面。',
            '提問字要跟後半句意思配合，可以是 do / does / did / can / could 等。'
        ],
        examples: [
            {
                ch: '他不上學，也不找工作。',
                en: 'He does not go to school, nor does he search for jobs.',
                explain: 'nor 後面 does 放在 he 前面；search 用原形。'
            },
            {
                ch: '學生不能離開禮堂，也不能使用手機。',
                en: 'Students cannot leave the hall, nor can they use their phones.',
                explain: '後半句有 can，所以 nor can they。'
            }
        ]
    },
    {
        title: 'ONLY WHEN 只有當',
        formula: 'Only when + clause + can / will + subject + verb',
        notes: [
            'Only when 放句首，表示「只有當...才...」。',
            'Only when 後面的條件句不用倒裝。',
            '真正倒裝的是 main clause：can / will 放主語前面。'
        ],
        examples: [
            {
                ch: '只有當學生明白錯誤，他們才能真正進步。',
                en: 'Only when students understand their mistakes can they truly improve.',
                explain: 'students understand their mistakes 不倒裝；can they improve 才倒裝。'
            },
            {
                ch: '只有當父母聆聽孩子，家庭關係才會改善。',
                en: 'Only when parents listen to their children will family relationships improve.',
                explain: 'will 放在 family relationships 前面。'
            }
        ]
    },
    {
        title: 'HOWEVER + ADJECTIVE 無論多麼',
        formula: 'However + adjective + subject + be, subject + verb',
        notes: [
            'However + adjective 表示「無論多麼...」。',
            '這類不是提問字倒裝，而是把形容詞拉到 However 後面。',
            '後半句照正常句序。'
        ],
        examples: [
            {
                ch: '無論任務多麼困難，我們都不應放棄。',
                en: 'However difficult the task is, we should not give up.',
                explain: 'difficult 放在 However 後面；the task is 保持正常句序。'
            },
            {
                ch: '無論考試多麼重要，學生都需要休息。',
                en: 'However important the exam is, students need to rest.',
                explain: 'However important = 無論多麼重要。'
            }
        ]
    },
    {
        title: 'HAD + SUBJECT + PP 如果當時',
        formula: 'Had + subject + pp, subject + would / could have + pp',
        notes: [
            '這是 Type 3 conditional 的倒裝版本。',
            'Had + subject + pp 等於 If + subject + had + pp。',
            '用來講與過去事實相反的假設。'
        ],
        examples: [
            {
                ch: '如果我知道真相，我就不會相信那個謠言。',
                en: 'Had I known the truth, I would not have believed the rumour.',
                explain: 'Had I known = If I had known。'
            },
            {
                ch: '如果他們聽從建議，他們就能避免這個錯誤。',
                en: 'Had they followed the advice, they could have avoided this mistake.',
                explain: 'could have avoided 表示當時本來能避免。'
            }
        ]
    },
    {
        title: 'PLACE INVERSION 地方倒裝',
        formula: 'Prepositional phrase of place + verb + noun subject',
        notes: [
            '地方短語放句首時，有時可把動詞放在名詞主語前面。',
            '這類常用於描寫場景，主語通常是名詞，不是代名詞。',
            '常見動詞：stood / sat / lay / waited。'
        ],
        examples: [
            {
                ch: '一群瘋狂粉絲站在機場內。',
                en: 'In the airport stood a swarm of crazy fans.',
                explain: 'In the airport 是地方；stood 放在名詞主語 a swarm of crazy fans 前面。'
            },
            {
                ch: '一隻無精打采的貓坐在梳化上。',
                en: 'On the sofa sat a listless cat.',
                explain: 'On the sofa 是地方；sat 放在 a listless cat 前面。'
            }
        ]
    },
    {
        title: 'GONE ARE THE DAYS ... 的日子已經過去',
        formula: 'Gone are the days when + past clause',
        notes: [
            'Gone are the days when... 表示「...的日子已經過去了」。',
            '這是固定高分句式，常用於作文開頭或對比過去與現在。',
            'when 後面通常描述以前常見、但現在已不再常見的情況。'
        ],
        examples: [
            {
                ch: '你可以晚上不鎖門的日子已經過去了。',
                en: 'Gone are the days when you could leave your door unlocked at night.',
                explain: '用 could 描述以前可以做到的事。'
            },
            {
                ch: '學生只靠背誦便能高分的日子已經過去了。',
                en: 'Gone are the days when students could get high marks by memorising answers only.',
                explain: 'when 後面講以前的情況。'
            }
        ]
    }
];

const GRAMMAR_PREPOSITION_TIME_REFERENCE_SECTIONS = [
    {
        title: 'IN 時段 / 長時間',
        formula: 'in + 長時期 / 不精確時間',
        notes: [
            'In 用於較長或不精確的時間：年、月、季節、世紀、年代。',
            'morning / afternoon / evening 前面通常用 in。',
            'in the past / in the future 是固定配搭。'
        ],
        examples: [
            { ch: '五月 / 2017 年 / 冬天 / 九十年代 / 二十二世紀', en: 'in May / in 2017 / in winter / in the 90s / in the 22nd century' },
            { ch: '在早上 / 下午 / 晚上', en: 'in the morning / in the afternoon / in the evening' },
            { ch: '在過去 / 在未來', en: 'in the past / in the future' },
            { ch: '我在二零一二年出生。', en: 'I was born in 2012.', explain: '年份用 in。' }
        ]
    },
    {
        title: 'ON 日子 / 日期',
        formula: 'on + 日子 / 日期 / 特定日子',
        notes: [
            'On 用於星期幾、具體日期、節日正日。',
            '如果 morning / afternoon / evening 前面有特定日子，也用 on。',
            'Day / Eve 這類節日正日通常用 on。'
        ],
        examples: [
            { ch: '二月十一日 / 星期三 / 星期日早上', en: 'on 11 February / on Wednesday / on Sunday morning' },
            { ch: '十一月七日晚上', en: 'on the evening of 7 November' },
            { ch: '聖誕節正日 / 除夕', en: "on Christmas Day / on New Year's Eve" },
            { ch: '我們星期一有英文測驗。', en: 'We have an English quiz on Monday.', explain: '星期幾用 on。' }
        ]
    },
    {
        title: 'AT 時刻 / 節日期間',
        formula: 'at + 精確時刻 / 節日期間 / 特定時段',
        notes: [
            'At 用於精確時間、午飯時間、午夜、正午、日落等時間點。',
            'at Christmas / at Chinese New Year 指整個節日期間。',
            'at the weekend、at the moment、at sunset 都是常見配搭。'
        ],
        examples: [
            { ch: '一點鐘 / 午飯時間 / 晚上 / 午夜 / 正午', en: "at one o'clock / at lunchtime / at night / at midnight / at noon" },
            { ch: '週末 / 聖誕期間 / 農曆新年期間', en: 'at the weekend / at Christmas / at Chinese New Year' },
            { ch: '現在 / 日落時', en: 'at the moment / at sunset' },
            { ch: '火車在早上八點正開出。', en: 'The train leaves at 8:00 am sharp.', explain: '具體鐘點用 at。' }
        ]
    },
    {
        title: 'IN 的特殊用法',
        formula: 'in + 一段時間',
        points: [
            {
                note: '「幾耐之後會發生」：in + 一段時間，可以表示多久之後。',
                examples: [
                    { ch: '我一小時後回來。', en: "I'll be back in an hour.", explain: 'in an hour = 一小時之後。' },
                    { ch: '火車幾分鐘後開出。', en: 'The train leaves in a few minutes.', explain: '未來發生時間用 in + 一段時間。' }
                ]
            },
            {
                note: '「要花幾耐時間完成」：in + 一段時間，也可以表示用多久完成。',
                examples: [
                    { ch: '我覺得我可以在兩星期內完成它。', en: 'I think I can finish it in two weeks.', explain: 'in two weeks = 用兩星期時間完成。' },
                    { ch: '她四星期內學會駕駛。', en: 'She learned to drive in four weeks.', explain: 'in 可表示花了多久完成。' }
                ]
            }
        ]
    },
    {
        title: 'ON TIME VS IN TIME',
        formula: 'on time = 準時 | in time = 及時',
        points: [
            {
                note: 'On time 表示準時，在規定的確切時間發生。',
                examples: [
                    { ch: '早上八時的巴士準時到達。', en: 'The 8 am bus arrived on time.', explain: 'on time = 沒遲到。' },
                    { ch: '請準時交功課。', en: 'Please hand in your homework on time.', explain: '指在 deadline 前準時交。' }
                ]
            },
            {
                note: 'In time 表示及時，在太遲之前、仍有足夠時間。',
                examples: [
                    { ch: '我們及時到達總站並趕上早上八時的巴士。', en: 'We got to the terminal in time for the 8 am bus.', explain: 'in time = 趕得切。' },
                    { ch: '他及時回家吃晚飯。', en: 'He got home in time for dinner.', explain: '即是晚飯開始前或未太遲前到。' }
                ]
            }
        ]
    },
    {
        title: 'NO PREPOSITION 零介詞陷阱',
        formula: 'last / next / every / this / today / tomorrow / yesterday + time',
        notes: [
            'last、next、every、this、today、tomorrow、yesterday 前面不要加 in / on / at。',
            '這是時間介詞題最常見陷阱之一。',
            '見到 these words，先想「可能不用介詞」。'
        ],
        examples: [
            { ch: '正確：我們這個星期五去看電影吧。', en: "Let's go see a film this Friday.", explain: 'this Friday 前面不用 on。' },
            { ch: '錯誤：不要寫 on this Friday。', en: "Let's go see a film on this Friday.", explain: 'this 前面不加 on。' },
            { ch: '我明天會見你。', en: 'I will see you tomorrow.', explain: 'tomorrow 前面不用 on / in / at。' },
            { ch: '她上星期買了一部電話。', en: 'She bought a phone last week.', explain: 'last week 前面不用 in。' }
        ]
    },
    {
        title: 'OTHER TIME PREPOSITIONS 其他時間介詞',
        formula: 'before / after / during / until / by / from...to / between...and',
        points: [
            {
                note: 'before = 之前；after = 之後。',
                examples: [
                    { ch: '你想放學後看電影嗎？', en: 'Do you want to see a film after school?' },
                    { ch: '我通常睡前洗澡。', en: 'I usually take a shower before bed.' }
                ]
            },
            {
                note: 'during = 在...期間；until = 直到。',
                examples: [
                    { ch: '學校合唱團在午飯時間排練。', en: 'The school choir had a rehearsal during lunchtime.' },
                    { ch: '她正在放假，直到下個月才回來。', en: 'She is on holiday and will not be back until next month.' }
                ]
            },
            {
                note: 'by = 在...之前 / 期限；from...to/until... = 由...至...。',
                examples: [
                    { ch: '我的老闆星期三或之前會回來。', en: 'My boss will be back by Wednesday.' },
                    { ch: '我們一家由 1995 年至 2001 年住在元朗。', en: 'Our family lived in Yuen Long from 1995 to 2001.' }
                ]
            },
            {
                note: 'between...and... = 在...與...之間。',
                examples: [
                    { ch: '圖書館由上午八時至晚上十時開放。', en: 'The library is open between 8 am and 10 pm.' },
                    { ch: '請在星期一至星期五之間交表格。', en: 'Please hand in the form between Monday and Friday.' }
                ]
            }
        ]
    },
    {
        title: 'GERUND 進階用法',
        formula: 'before / after / on / upon + V-ing',
        notes: [
            'before、after、on、upon 後面可以直接跟 V-ing。',
            'on / upon + V-ing 表示「一...就...」，upon 比 on 更正式。',
            '這個用法適合寫作，句子會較簡潔。'
        ],
        examples: [
            { ch: '我通常睡前洗澡。', en: 'I usually take a shower before going to bed.', explain: 'before 後面直接接 going。' },
            { ch: '她一進入單位便穿上拖鞋。', en: 'She put on her slippers on entering her flat.', explain: 'on entering = 一進入。' },
            { ch: '她一進入單位便穿上拖鞋。', en: 'She put on her slippers upon entering her flat.', explain: 'upon entering 比 on entering 更正式。' }
        ]
    }
];

const GRAMMAR_PREPOSITION_PLACE_REFERENCE_GROUPS = {
    core: {
        label: 'ON/AT/IN',
        sections: [
            {
                title: 'ON 表面 / 科技 / 交通',
                formula: 'on + surface / technology / island / public transport',
                notes: [
                    'On 最核心意思是「在表面上」。',
                    '科技平台、電視、社交平台、公共交通、大型交通工具常用 on。',
                    '島嶼、menu、noticeboard、shelf、wall 等也常用 on。'
                ],
                examples: [
                    { ch: '頁面 / 書面 / 天花板', en: 'on page 28 / on the book cover / on the ceiling' },
                    { ch: '桌面 / 地板 / 草地', en: 'on the desk / on the table / on the floor / on the ground / on the grass' },
                    { ch: '電視 / Instagram', en: 'on television / on Instagram' },
                    { ch: '巴士 / 火車', en: 'on the bus / on the train' },
                    { ch: '餐牌 / 告示板 / 架 / 牆', en: 'on the menu / on the noticeboard / on the shelf / on the wall' }
                ]
            },
            {
                title: 'AT 功能性建築 / 精確位置',
                formula: 'at + exact point / functional place / activity place',
                notes: [
                    'At 常用於精確位置或功能性地點。',
                    '如果重點是人在某地方做某活動，例如看戲、吃飯、看醫生，常用 at。',
                    '完整地址通常用 at。'
                ],
                examples: [
                    { ch: '完整地址', en: 'at 123 Nathan Road' },
                    { ch: '巴士站 / 港鐵站', en: 'at the bus stop / at the MTR station' },
                    { ch: '戲院 / 餐廳 / 牙醫診所 / 醫生診所', en: "at the cinema / at the restaurant / at the dentist's / at the doctor's" },
                    { ch: '門口 / 窗邊', en: 'at the door / at the window' }
                ]
            },
            {
                title: 'IN 空間內 / 區域內',
                formula: 'in + area / enclosed space',
                notes: [
                    'In 表示在區域、城市、國家、封閉空間或有包圍感的地方入面。',
                    '城市、村落、世界、商場、醫院、公園等區域常用 in。',
                    'bag、box、room、sky 這類有空間感的位置也用 in。'
                ],
                examples: [
                    { ch: '香港 / 城市 / 村落 / 世界', en: 'in Hong Kong / in the city / in the village / in the world' },
                    { ch: '商場 / 醫院 / 公園', en: 'in the shopping centre / in the hospital / in the park' },
                    { ch: '袋 / 錢包 / 盒 / 房間 / 天空', en: 'in her bag / in her purse / in the box / in the room / in the sky' },
                    { ch: '我住在香港。', en: 'I live in Hong Kong.', explain: '城市或地區用 in。' }
                ]
            }
        ]
    },
    compare: {
        label: 'COMPARE',
        sections: [
            {
                title: 'THE CORNER 角落 / 街角',
                formula: 'in the corner of a room | at the corner of a street',
                points: [
                    {
                        note: 'in the corner 表示房間角落，因為在空間入面。',
                        examples: [
                            { ch: '那張椅子在房間角落。', en: 'The chair is in the corner of the room.', explain: '房間是封閉空間，所以用 in。' },
                            { ch: '貓躲在睡房角落。', en: 'The cat is hiding in the corner of the bedroom.', explain: 'bedroom 內部角落用 in。' }
                        ]
                    },
                    {
                        note: 'at the corner 表示街道轉角，重點是一個位置點。',
                        examples: [
                            { ch: '我在街角等你。', en: 'I will wait for you at the corner of the street.', explain: '街角是精確位置點，所以用 at。' },
                            { ch: '銀行在彌敦道轉角。', en: 'The bank is at the corner of Nathan Road.', explain: '街道轉角用 at。' }
                        ]
                    }
                ]
            },
            {
                title: 'THE FRONT / THE BACK 前 / 後',
                formula: 'in the car | at the front of a place | on the paper',
                points: [
                    {
                        note: '在車內的前座 / 後座，用 in the front/back of the car。',
                        examples: [
                            { ch: '我坐在車的前座。', en: 'I was in the front of the car.', explain: '在車內，所以用 in。' },
                            { ch: '我的袋在車的後面。', en: 'My bag was in the back of the car.', explain: '仍然是在車內。' }
                        ]
                    },
                    {
                        note: '在戲院 / 課室等地方的前方區域，用 at the front of。',
                        examples: [
                            { ch: '我們坐在戲院前方。', en: 'We sat at the front of the cinema.', explain: '前方區域是一個位置點。' },
                            { ch: '老師站在課室前方。', en: 'The teacher stood at the front of the classroom.', explain: '功能位置用 at。' }
                        ]
                    },
                    {
                        note: '坐在前排，用 in the front row；寫在紙的正面 / 背面，用 on the front/back。',
                        examples: [
                            { ch: '我們坐在前排。', en: 'We sat in the front row.', explain: 'row 是一排位置，有「在排中」的感覺。' },
                            { ch: '把你的號碼寫在這張紙的正面。', en: 'Write your number on the front of this piece of paper.', explain: '紙面是表面，所以用 on。' }
                        ]
                    }
                ]
            },
            {
                title: 'OTHER COMMON PAIRS 常見配搭',
                formula: 'in / at / on fixed place phrases',
                points: [
                    {
                        note: '常見 in 配搭：book / newspaper / picture / queue / middle of the road。',
                        examples: [
                            { ch: '我在書中看到這個字。', en: 'I saw this word in the book.' },
                            { ch: '相中有三個學生。', en: 'There are three students in the picture.' },
                            { ch: '他站在馬路中央。', en: 'He is standing in the middle of the road.' }
                        ]
                    },
                    {
                        note: '常見 at 配搭：home / school / work / concert / match / meeting / top / bottom / end。',
                        examples: [
                            { ch: '她在家。', en: 'She is at home.' },
                            { ch: '他們在會議上。', en: 'They are at the meeting.' },
                            { ch: '答案在頁底。', en: 'The answer is at the bottom of the page.' }
                        ]
                    },
                    {
                        note: '常見 on 配搭：island / TV / radio / bus / plane / train / ship / left / right。',
                        examples: [
                            { ch: '他住在一個小島上。', en: 'He lives on a small island.' },
                            { ch: '我在電視上看到她。', en: 'I saw her on TV.' },
                            { ch: '洗手間在左邊。', en: 'The toilet is on the left.' }
                        ]
                    }
                ]
            }
        ]
    },
    place: {
        label: 'PLACE',
        sections: [
            {
                title: 'BASIC PLACE PREPOSITIONS 基本位置',
                formula: 'in front of / behind / beside / near / next to / between / opposite',
                points: [
                    {
                        note: 'in front of = 在...前方；behind = 在...後方。',
                        examples: [
                            { ch: '巴士站在學校前面。', en: 'The bus stop is in front of the school.' },
                            { ch: '停車場在商場後面。', en: 'The car park is behind the shopping centre.' }
                        ]
                    },
                    {
                        note: 'beside / next to = 在...旁邊；near = 在...附近。',
                        examples: [
                            { ch: '銀行在郵局旁邊。', en: 'The bank is beside the post office.' },
                            { ch: '我家在港鐵站附近。', en: 'My home is near the MTR station.' },
                            { ch: '餐廳在書店旁邊。', en: 'The restaurant is next to the bookshop.' }
                        ]
                    },
                    {
                        note: 'between = 在兩者之間；opposite = 在...對面。',
                        examples: [
                            { ch: '圖書館在銀行和超市之間。', en: 'The library is between the bank and the supermarket.' },
                            { ch: '戲院在學校對面。', en: 'The cinema is opposite the school.' }
                        ]
                    }
                ]
            },
            {
                title: 'INSIDE / OUTSIDE / ABOVE / BELOW',
                formula: 'inside / outside / above / below / under / beneath / underneath / around',
                points: [
                    {
                        note: 'inside = 在...裏面；outside = 在...外面。',
                        examples: [
                            { ch: '鑰匙在盒子裏面。', en: 'The key is inside the box.' },
                            { ch: '學生在課室外面等候。', en: 'The students are waiting outside the classroom.' }
                        ]
                    },
                    {
                        note: 'above = 在...上方 / 較高處；below = 在...下方 / 較低處。',
                        examples: [
                            { ch: '燈在桌子上方。', en: 'The light is above the table.' },
                            { ch: '溫度跌至零度以下。', en: 'The temperature fell below zero.' }
                        ]
                    },
                    {
                        note: 'under / beneath / underneath = 在...正下方或被覆蓋著；around = 在...周圍。',
                        examples: [
                            { ch: '貓在椅子下面。', en: 'The cat is under the chair.' },
                            { ch: '她把信藏在枕頭底下。', en: 'She hid the letter underneath the pillow.' },
                            { ch: '孩子們圍著老師坐。', en: 'The children sat around the teacher.' }
                        ]
                    }
                ]
            }
        ]
    },
    move: {
        label: 'MOVE',
        sections: [
            {
                title: 'MOVEMENT DIRECTION 移動方向',
                formula: 'verb + movement preposition + place',
                notes: [
                    '移動介詞通常跟在 go / come / walk / run / put / take 等動詞之後。',
                    '重點是方向，不是靜態位置。',
                    '做題時先問自己：這句有沒有移動？有移動就多數不是 in/on/at 的普通位置用法。'
                ],
                examples: [
                    { ch: '往上 / 往下樓梯', en: 'going up the stairs / coming down the stairs' },
                    { ch: '進入 / 走出隧道', en: 'going into the tunnel / coming out of the tunnel' },
                    { ch: '放到架上 / 從手推車拿走', en: 'putting them onto the shelves / taking them off the trolley' },
                    { ch: '朝市中心 / 遠離機場', en: 'travelling towards the city centre / away from the airport' }
                ]
            },
            {
                title: 'THROUGH / ACROSS / ALONG / PAST',
                formula: 'through = 穿過立體空間 | across = 橫越 | along = 沿著 | past = 經過',
                points: [
                    {
                        note: 'through 通常指穿過立體空間或由一邊入另一邊出。',
                        examples: [
                            { ch: '火車穿過隧道。', en: 'The train goes through a tunnel.' },
                            { ch: '我們穿過森林。', en: 'We walked through the forest.' }
                        ]
                    },
                    {
                        note: 'across 表示橫越平面，例如過馬路、橋、河。',
                        examples: [
                            { ch: '她正在過馬路。', en: 'She is walking across the street.' },
                            { ch: '他們走過行人天橋。', en: 'They walked across a footbridge.' }
                        ]
                    },
                    {
                        note: 'along = 沿著；past = 經過某位置。',
                        examples: [
                            { ch: '我們沿著行人路走。', en: 'We walked along the pavement.' },
                            { ch: '他們經過幾排貨架。', en: 'They walked past some shelves.' }
                        ]
                    }
                ]
            },
            {
                title: 'COMMON MISTAKES 常犯錯誤',
                formula: 'cross / pass = verb | across / past = preposition',
                points: [
                    {
                        note: 'Across 不是動詞；cross 才是動詞。',
                        examples: [
                            { ch: '正確：過馬路時要小心。', en: 'Be careful when you cross the street.', explain: 'cross 是動詞。' },
                            { ch: '正確：過馬路時要小心。', en: 'Be careful when you walk across the street.', explain: 'walk 是動詞；across 是介詞。' },
                            { ch: '錯誤：不要把 across 當動詞。', en: 'Be careful when you across the street.', explain: 'across 不能直接做動詞。' }
                        ]
                    },
                    {
                        note: 'Past 不是動詞；pass 才是動詞。',
                        examples: [
                            { ch: '正確：你經過那間店嗎？', en: 'Did you pass the shop?', explain: 'pass 是動詞。' },
                            { ch: '正確：你走過那間店嗎？', en: 'Did you walk past the shop?', explain: 'walk 是動詞；past 是介詞。' },
                            { ch: '錯誤：不要把 past 當動詞。', en: 'Did you past the shop?', explain: 'past 不能直接做動詞。' }
                        ]
                    }
                ]
            }
        ]
    }
};

const GRAMMAR_COMPARATIVE_SUPERLATIVE_REFERENCE_SECTIONS = [
    {
        title: 'COMPARATIVES 比較級',
        formula: 'comparative + than',
        notes: [
            '比較兩個人或事物時，用形容詞或副詞的比較級。',
            '比較級後面通常加 than。',
            '比較的兩個事物必須屬於同一類別。',
            'than 後面的動詞通常可以省略。'
        ],
        examples: [
            { ch: '你的蛋糕比我的大。', en: 'Your piece of cake is bigger than mine.' },
            { ch: '這隻狗比豹跑得更快。', en: 'The dog runs more quickly than the leopard.' },
            { ch: '她的頭髮比我的短。', en: 'Her hair is shorter than mine.' }
        ]
    },
    {
        title: '比較數量',
        formula: 'more / less / fewer',
        notes: [
            'more 表示更多。',
            'less 表示較少，用於不可數名詞。',
            'fewer 表示較少，用於可數名詞。'
        ],
        examples: [
            { ch: '我有更多時間。', en: 'I have more time.' },
            { ch: '他飲較少水。', en: 'He drinks less water.' },
            { ch: '這班有較少學生。', en: 'This class has fewer students.' }
        ]
    },
    {
        title: 'SUPERLATIVES 最高級',
        formula: 'the + superlative',
        notes: [
            '比較三個或以上同類型的人或事物時，用最高級。',
            '最高級前面通常加 the。',
            '如果語境清晰，最高級後面的名詞可以省略。'
        ],
        examples: [
            { ch: '我認為它是城中最高的建築物。', en: 'I think it is the tallest building in the city.' },
            { ch: 'Tammy 是一個好排球員。她是我們學校最好的。', en: 'Tammy is a good volleyball player. She is the best in our school.' },
            { ch: '這是珠寶店裏最貴的。', en: 'This necklace is the most expensive in the jewellery shop.' }
        ]
    },
    {
        title: '最高級配 In / Of',
        formula: 'in + place/group | of + plural noun/time',
        notes: [
            'in 用於地方，例如 in Hong Kong；也可用於組織或人群，例如 in our class。',
            'of 用於眾數名詞或代名詞，例如 of the three brothers / of them all。',
            'of 也可用於一段時間，例如 of the year。'
        ],
        examples: [
            { ch: '地點用 in。', en: 'It is the tallest building in the city.' },
            { ch: '人群用 in。', en: 'She is the best in our school.' },
            { ch: '三兄弟之中用 of。', en: 'Of the three brothers, Sam is the tallest.' },
            { ch: '一年中用 of。', en: 'July is one of the hottest months of the year.' }
        ]
    },
    {
        title: '最高級進階句式',
        formula: 'one of + plural noun | superlative + have ever + pp',
        notes: [
            'one of 後面要用眾數名詞。',
            '最高級可以配 have ever + 過去分詞，表示「曾經...之中最...」。'
        ],
        examples: [
            { ch: '香港最古老的公園之一。', en: 'It is one of the oldest parks in Hong Kong.' },
            { ch: '我看過最好的電影。', en: 'It is the best film that I have ever seen.' },
            { ch: '我去過最奇怪的地方。', en: "What is the strangest place you've ever visited?" }
        ]
    },
    {
        title: '數量最高級',
        formula: 'most / least / fewest',
        notes: [
            'most 表示最多。',
            'least 表示最少，常用於不可數名詞或程度。',
            'fewest 表示最少，用於可數名詞。'
        ],
        examples: [
            { ch: 'Stella 有最多模型。', en: 'Stella has the most figurines.' },
            { ch: 'Fred 對我們的提議最少興趣。', en: 'Fred showed the least interest in our proposal.' },
            { ch: '這個有最少添加劑。', en: 'This one has the fewest additives.' }
        ]
    },
    {
        title: '變形規則 1 短字',
        formula: 'short adjective/adverb -> -er / the -est',
        notes: [
            '較短的形容詞或副詞通常加 -er / -est。',
            '最高級前通常加 the。'
        ],
        examples: [
            { ch: '大。', en: 'big -> bigger -> the biggest' },
            { ch: '快。', en: 'fast -> faster -> the fastest' },
            { ch: '高。', en: 'tall -> taller -> the tallest' }
        ]
    },
    {
        title: '變形規則 2 長字',
        formula: 'long adjective/adverb -> more / the most',
        notes: [
            '字詞較長時，前面加 more 變比較級。',
            '前面加 the most 變最高級。'
        ],
        examples: [
            { ch: '疲倦。', en: 'tired -> more tired -> the most tired' },
            { ch: '昂貴。', en: 'expensive -> more expensive -> the most expensive' },
            { ch: '有趣。', en: 'interesting -> more interesting -> the most interesting' }
        ]
    },
    {
        title: '不規則變化',
        formula: 'must memorize',
        notes: [
            '有些比較級和最高級要死記，不能只加 -er / -est 或 more / most。'
        ],
        examples: [
            { ch: '好。', en: 'good / well -> better -> the best' },
            { ch: '差。', en: 'bad / badly -> worse -> the worst' },
            { ch: '遠。', en: 'far -> farther / further -> the farthest / furthest' }
        ]
    },
    {
        title: 'SPELLING TIPS 拼寫提示',
        formula: '-e / CVC / y',
        notes: [
            '字尾有 -e：直接加 -r / -st。',
            '單音節子音 + 母音 + 子音結尾：重複最後一個字母，再加 -er / -est。',
            '字尾是子音 + y：通常 y 變 i，再加 -er / -est。'
        ],
        examples: [
            { ch: '字尾有 e。', en: 'large -> larger -> the largest' },
            { ch: 'CVC 結尾。', en: 'hot -> hotter -> the hottest' },
            { ch: 'CVC 結尾。', en: 'big -> bigger -> the biggest' },
            { ch: 'y 變 i。', en: 'easy -> easier -> the easiest' }
        ]
    }
];

const GRAMMAR_INFINITIVE_GERUND_REFERENCE_GROUPS = {
    ving: {
        label: 'V-ING',
        rows: [
            { ch: '承認', en: 'Admit', ex: 'Admit making a mistake（承認犯錯）' },
            { ch: '避免', en: 'Avoid', ex: 'Avoid eating too much sugar（避免食太多糖）' },
            { ch: '忍不住', en: "Can't help", ex: "Can't help laughing（忍不住笑）" },
            { ch: '受不了', en: "Can't stand", ex: "Can't stand waiting（受不了等待）" },
            { ch: '考慮', en: 'Consider', ex: 'Consider eating（考慮食）' },
            { ch: '延遲', en: 'Delay', ex: 'Delay answering the email（延遲回覆電郵）' },
            { ch: '否認', en: 'Deny', ex: 'Deny breaking the window（否認打破窗）' },
            { ch: '不喜歡', en: 'Dislike', ex: 'Dislike getting up early（不喜歡早起）' },
            { ch: '享受', en: 'Enjoy', ex: 'Enjoy reading books（享受看書）' },
            { ch: '逃過/避開', en: 'Escape', ex: 'Escape being punished（逃過被懲罰）' },
            { ch: '想要', en: 'Feel like', ex: 'Feel like eating noodles（想食麵）' },
            { ch: '完成', en: 'Finish', ex: 'Finish doing homework（完成做功課）' },
            { ch: '放棄/戒除', en: 'Give up', ex: 'Give up smoking（戒煙）' },
            { ch: '去做某活動', en: 'Go', ex: 'Go swimming（去游水）' },
            { ch: '想像', en: 'Imagine', ex: 'Imagine living on Mars（想像住在火星）' },
            { ch: '保持/繼續', en: 'Keep', ex: 'Keep trying（繼續嘗試）' },
            { ch: '繼續', en: 'Keep on', ex: 'Keep on practising（繼續練習）' },
            { ch: '期待', en: 'Look forward to', ex: 'Look forward to meeting you（期待見你）' },
            { ch: '介意', en: 'Mind', ex: 'Mind opening the window（介意開窗）' },
            { ch: '錯過/想念', en: 'Miss', ex: 'Miss playing with friends（想念和朋友玩）' },
            { ch: '推遲', en: 'Postpone', ex: 'Postpone holding the meeting（推遲開會）' },
            { ch: '練習', en: 'Practise', ex: 'Practise speaking English（練習講英文）' },
            { ch: '一般允許', en: 'Permit', ex: 'Permit parking here（允許在這裡泊車）' },
            { ch: '拖延', en: 'Put off', ex: 'Put off cleaning the room（拖延執房）' },
            { ch: '後悔已做的事', en: 'Regret', ex: 'Regret saying that（後悔說了那句話）' },
            { ch: '抗拒', en: 'Resist', ex: 'Resist eating snacks（忍住不食零食）' },
            { ch: '冒險', en: 'Risk', ex: 'Risk losing the match（冒險輸掉比賽）' },
            { ch: '停止做某事', en: 'Stop', ex: 'Stop talking（停止說話）' },
            { ch: '成功做到', en: 'Succeed in', ex: 'Succeed in passing the exam（成功考試合格）' },
            { ch: '建議', en: 'Suggest', ex: 'Suggest going home（建議回家）' },
            { ch: '試試看效果', en: 'Try', ex: 'Try using this app（試用這個 app）' },
            { ch: '介詞後', en: 'Preposition + V-ing', ex: 'Interested in learning English（對學英文有興趣）' }
        ]
    },
    to: {
        label: 'TO VERB',
        rows: [
            { ch: '負擔得起', en: 'Afford', ex: 'Afford to buy a new phone（負擔得起買新電話）' },
            { ch: '同意', en: 'Agree', ex: 'Agree to help us（同意幫我們）' },
            { ch: '目標是', en: 'Aim', ex: 'Aim to finish early（目標是早點完成）' },
            { ch: '似乎', en: 'Appear', ex: 'Appear to be tired（似乎很累）' },
            { ch: '安排', en: 'Arrange', ex: 'Arrange to meet at three（安排三點見面）' },
            { ch: '要求', en: 'Ask', ex: 'Ask to leave early（要求早點離開）' },
            { ch: '乞求/懇求', en: 'Beg', ex: 'Beg to stay（懇求留下）' },
            { ch: '開始', en: 'Begin', ex: 'Begin to rain（開始下雨）' },
            { ch: '無法忍受', en: "Can't bear", ex: "Can't bear to watch it（不忍心看）" },
            { ch: '選擇', en: 'Choose', ex: 'Choose to stay home（選擇留在家）' },
            { ch: '決定', en: 'Decide', ex: 'Decide to join the club（決定加入學會）' },
            { ch: '預期', en: 'Expect', ex: 'Expect to win（預期會贏）' },
            { ch: '未能/失敗', en: 'Fail', ex: 'Fail to answer the question（未能回答問題）' },
            { ch: '忘記去做', en: 'Forget', ex: 'Forget to bring the book（忘記帶書）' },
            { ch: '接著做另一件事', en: 'Go on', ex: 'Go on to talk about her daughter（接著談她女兒）' },
            { ch: '碰巧', en: 'Happen', ex: 'Happen to meet her（碰巧遇見她）' },
            { ch: '幫忙', en: 'Help', ex: 'Help to carry the box（幫忙搬箱）' },
            { ch: '希望', en: 'Hope', ex: 'Hope to see you soon（希望很快見你）' },
            { ch: '學習', en: 'Learn', ex: 'Learn to swim（學游水）' },
            { ch: '能夠完成困難的事', en: 'Manage', ex: 'Manage to finish the work（能夠完成困難工作）' },
            { ch: '打算', en: 'Mean', ex: 'Mean to say sorry（打算道歉）' },
            { ch: '需要', en: 'Need', ex: 'Need to revise tonight（需要今晚溫習）' },
            { ch: '主動提出', en: 'Offer', ex: 'Offer to help me（主動提出幫我）' },
            { ch: '計劃', en: 'Plan', ex: 'Plan to visit Japan（計劃去日本）' },
            { ch: '準備', en: 'Prepare', ex: 'Prepare to leave（準備離開）' },
            { ch: '假裝', en: 'Pretend', ex: 'Pretend to be asleep（假裝睡著）' },
            { ch: '承諾', en: 'Promise', ex: 'Promise to call back（承諾回電）' },
            { ch: '遺憾要告知', en: 'Regret', ex: 'Regret to inform you（很遺憾通知你）' },
            { ch: '拒絕', en: 'Refuse', ex: 'Refuse to answer（拒絕回答）' },
            { ch: '記得要去做', en: 'Remember', ex: 'Remember to lock the door（記得鎖門）' },
            { ch: '似乎', en: 'Seem', ex: 'Seem to know the answer（似乎知道答案）' },
            { ch: '停下來去做另一事', en: 'Stop', ex: 'Stop to buy a drink（停下來買飲品）' },
            { ch: '威脅', en: 'Threaten', ex: 'Threaten to call the police（威脅報警）' },
            { ch: '盡力/設法', en: 'Try', ex: 'Try to open the door（嘗試開門）' },
            { ch: '自願', en: 'Volunteer', ex: 'Volunteer to clean the board（自願抹黑板）' },
            { ch: '想要', en: 'Want', ex: 'Want to buy a camera（想買相機）' },
            { ch: '希望', en: 'Wish', ex: 'Wish to speak to you（希望和你談話）' },
            { ch: '想要', en: 'Would like', ex: 'Would like to go home（想回家）' },
            { ch: '很樂意', en: 'Would love', ex: 'Would love to join you（很樂意加入你）' },
            { ch: '寧願', en: 'Would prefer', ex: 'Would prefer to stay here（寧願留在這裡）' },
            { ch: '叫某人做', en: 'Tell + Object', ex: 'Tell him to wait（叫他等）' },
            { ch: '提醒某人做', en: 'Remind + Object', ex: 'Remind me to call Mum（提醒我打給媽媽）' },
            { ch: '邀請某人做', en: 'Invite + Object', ex: 'Invite them to come（邀請他們來）' },
            { ch: '鼓勵某人做', en: 'Encourage + Object', ex: 'Encourage her to try（鼓勵她嘗試）' },
            { ch: '說服某人做', en: 'Persuade + Object', ex: 'Persuade him to study（說服他學習）' }
        ]
    },
    meaning: {
        label: 'MEANING',
        rows: [
            { ch: '記得做過某事', en: 'Remember + V-ing', ex: 'I remember turning it off（我記得關過它）' },
            { ch: '記得要去做某事', en: 'Remember + to V', ex: 'Remember to turn off the light（記得要關燈）' },
            { ch: '停止正在做的事', en: 'Stop + V-ing', ex: 'She stopped looking at the painting（她停止看畫）' },
            { ch: '停下來去做另一件事', en: 'Stop + to V', ex: 'She stopped to look at the painting（她停下來去看畫）' },
            { ch: '試做看看效果', en: 'Try + V-ing', ex: 'They tried pushing the car（他們試著推車）' },
            { ch: '努力/設法去做', en: 'Try + to V', ex: 'She tried to push the car（她努力推車）' },
            { ch: '後悔已做的事', en: 'Regret + V-ing', ex: 'I regret saying that（我後悔說了那句話）' },
            { ch: '遺憾要通知/告知', en: 'Regret + to V', ex: 'We regret to inform you（我們很遺憾通知你）' },
            { ch: '繼續同一件事', en: 'Go on + V-ing', ex: 'She went on talking（她繼續說）' },
            { ch: '接著做另一件事', en: 'Go on + to V', ex: 'She went on to talk about her daughter（她接著談她女兒）' },
            { ch: '規則/一般允許或建議', en: 'Advise/Allow/Encourage/Permit/Suggest + V-ing', ex: 'Allow smoking / Suggest going home（允許吸煙/建議回家）' },
            { ch: '叫某人去做', en: 'Advise/Allow/Encourage/Permit + Object + to V', ex: 'Allow him to smoke（允許他吸煙）' }
        ]
    },
    bare: {
        label: 'BARE VERB',
        rows: [
            { ch: '可以', en: 'Can', ex: 'Can swim（可以游水）' },
            { ch: '可能', en: 'May', ex: 'May leave now（可能現在離開）' },
            { ch: '必須', en: 'Must', ex: 'Must finish it（必須完成它）' },
            { ch: '應該', en: 'Should', ex: 'Should study hard（應該努力讀書）' },
            { ch: '將會', en: 'Will', ex: 'Will call you（會打給你）' },
            { ch: '能夠', en: 'Could', ex: 'Could answer the question（能回答問題）' },
            { ch: '會/願意', en: 'Would', ex: 'Would help us（會幫我們）' },
            { ch: '最好', en: 'Had better', ex: 'Had better leave now（最好現在離開）' },
            { ch: '寧願', en: 'Would rather', ex: 'Would rather stay home（寧願留在家）' },
            { ch: '讓某人做', en: 'Let + Object', ex: 'Let me go（讓我走）' },
            { ch: '令某人做', en: 'Make + Object', ex: 'Make me cry（令我哭）' },
            { ch: '幫某人做', en: 'Help + Object', ex: 'Help me carry it（幫我搬它）' },
            { ch: '看見完整動作', en: 'See + Object', ex: 'See him cross the road（看見他過馬路）' },
            { ch: '聽見完整動作', en: 'Hear + Object', ex: 'Hear her sing（聽見她唱歌）' },
            { ch: '看著完整動作', en: 'Watch + Object', ex: 'Watch them play football（看著他們踢足球）' },
            { ch: '留意到完整動作', en: 'Notice + Object', ex: 'Notice him enter the room（留意到他入房）' }
        ]
    }
};

window.GRAMMAR_INFINITIVE_GERUND_REFERENCE_GROUPS = GRAMMAR_INFINITIVE_GERUND_REFERENCE_GROUPS;

const COMPOUND_ADJ_REFERENCE_MEANINGS = {
    'absent from': '缺席',
    'absorbed in': '全神貫注於',
    'accustomed to': '習慣於',
    'addicted to': '沉迷於',
    'adjacent to': '鄰近 / 毗鄰',
    'afraid of': '害怕',
    'angry at/with sb': '對某人生氣',
    'appropriate for': '適合',
    'ashamed of': '為某事感到羞愧',
    'associated with': '與某事有關聯',
    'aware of': '意識到 / 知道',
    'bad at': '不擅長',
    'blind to': '對某事視而不見 / 不重視',
    'capable of': '有能力做',
    'careful with': '小心處理',
    'cautious about': '對某事謹慎',
    'certain about/of': '對某事確定',
    'charged with': '被控告',
    'clever at': '擅長',
    'close to': '接近',
    'committed to': '致力於 / 承諾',
    'compatible with': '與某事相容',
    'composed of': '由某物組成',
    'concerned about': '關心 / 擔心',
    'confident about/of': '對某事有信心',
    'confronted with': '面對',
    'connected to': '連接到',
    'connected with': '與某事有關連',
    'conscious of': '意識到',
    'consistent with': '與某事一致',
    'content with': '對某事滿意',
    'crowded with': '擠滿',
    'deaf to': '對某事充耳不聞',
    'dedicated to': '獻身於 / 專注於',
    'dependent on': '依賴',
    'devoted to': '獻身於 / 深愛',
    'different from': '與某事不同',
    'eager for': '渴望',
    'eligible for': '有資格',
    'enthusiastic about': '對某事熱衷',
    'envious of': '羨慕 / 嫉妒',
    'equivalent to': '等同於',
    'exposed to': '暴露於',
    'faithful to': '對某人忠誠',
    'familiar with': '熟悉',
    'famous for': '因某事而聞名',
    'fond of': '喜愛',
    'free from': '免於 / 不受',
    'friendly to': '對某人友善',
    'full of': '充滿',
    'furious at': '對某事狂怒',
    'good at': '擅長',
    'good for': '對某事有益',
    'grateful to': '對某人感激',
    'guilty of': '犯了某罪 / 對某事內疚',
    'happy about/with': '對某事開心 / 滿意',
    'ignorant of': '對某事無知',
    'impatient with': '對某人不耐煩',
    'indifferent to': '對某事冷漠 / 不關心',
    'inferior to': '比某事差',
    'innocent of': '無罪 / 無辜',
    'interested in': '對某事感興趣',
    'intolerant of': '不能容忍',
    'irrelevant to': '與某事無關',
    'jealous of': '嫉妒',
    'keen on': '熱衷於',
    'liable for': '對某事有責任',
    'limited to': '限制在',
    'loyal to': '對某人忠誠',
    'made of': '由某物製成',
    'married to': '與某人結婚',
    'negligent in': '在某方面疏忽',
    'opposed to': '反對',
    'optimistic about': '對某事樂觀',
    'patient with': '對某人有耐心',
    'pessimistic about': '對某事悲觀',
    'polite to': '對某人有禮貌',
    'popular with': '受某人歡迎',
    'prepared for': '為某事做好準備',
    'proficient in/at': '精通',
    'proud of': '為某事感到驕傲',
    'qualified for': '有資格',
    'ready for': '準備好',
    'related to': '與某事有關',
    'relevant to': '與某事有關 / 切題',
    'responsible for': '對某事負責',
    'rich in': '富含',
    'scared of': '害怕',
    'sick of': '對某事厭倦',
    'similar to': '與某事相似',
    'skilful in/at': '熟練於',
    'sorry for/about': '對某事感到抱歉',
    'subject to': '受某事影響 / 支配',
    'successful in': '在某方面成功',
    'suitable for': '適合',
    'superior to': '優於',
    'sure of': '對某事確定',
    'suspicious of': '懷疑',
    'sympathetic to': '對某事同情 / 支持',
    'tired of': '對某事厭倦',
    'used to (+ing)': '習慣於',
    'useful to': '對某人有用',
    'weak at/in': '不擅長',
    'worried about': '擔心',
    'useful for': '用於',
    'angry with': '對某人生氣',
    'grateful for': '感激某事',
    'satisfied with': '對某事滿意',
    'based on': '基於',
    'bored with': '對某事感到無聊',
    'excellent at': '非常擅長',
    'terrible at': '很差 / 不擅長',
    'late for': '遲到',
    'rude to': '對某人粗魯',
    'unkind to': '對某人不仁慈',
    'surprised at/by': '對某事感到驚訝',
    'amazed at/by': '對某事感到驚嘆',
    'disappointed with': '對某事失望',
    'fed up with': '受夠了',
    'involved in': '參與',
    'terrified of': '非常害怕',
    'doubtful about': '懷疑',
    'brilliant at': '非常擅長',
    'hopeless at': '很差 / 不擅長',
    'annoyed about (something)': '對某事惱怒',
    'annoyed with (someone)': '對某人生氣',
    'crazy about': '非常著迷於',
    'serious about': '對某事認真',
    'upset about': '對某事難過',
    'nervous about': '對某事緊張',
    'sure of/about': '對某事確定',
    'certain of': '確信',
    'safe from': '免受傷害 / 威脅',
    'present at': '出席',
    'grateful to (someone)': '感激某人',
    'thankful for (something)': '感謝某事',
    'delighted with': '對某事高興',
    'impressed by/with': '對某事印象深刻',
    'shocked at/by': '對某事震驚'
};

function getCompoundAdjReferenceKey(text) {
    return String(text || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function cleanCompoundAdjReferenceMeaning(en, ch) {
    const override = COMPOUND_ADJ_REFERENCE_MEANINGS[getCompoundAdjReferenceKey(en)];
    if (override) return override;
    return String(ch || '')
        .replace(/\.{3}|…/g, '')
        .replace(/\s*[。.]$/u, '')
        .trim();
}

function getCompoundAdjReferenceSpeakText(en) {
    return String(en || '')
        .replace(/\bsb\b/gi, 'someone')
        .replace(/\((someone|something)\)/gi, '$1')
        .replace(/\(\+ing\)/gi, 'plus ing')
        .replace(/\//g, ' or ')
        .replace(/\s+/g, ' ')
        .trim();
}

function getVocabSearchInput() {
    return document.getElementById('vocab-search-input');
}

function getVocabKeyboard() {
    return document.getElementById('vocab-virtual-keyboard');
}

function showVocabSearchKeyboard() {
    const keyboard = getVocabKeyboard();
    const input = getVocabSearchInput();
    const vocabScreen = document.getElementById('vocab-screen');
    if (!keyboard || !input || !vocabScreen || vocabScreen.style.display === 'none') return;

    if (!vocabSearchKeyboardActive && typeof playSound === 'function') playSound('deploy-sfx');
    vocabSearchKeyboardActive = true;
    input.setAttribute('readonly', 'readonly');
    input.setAttribute('inputmode', 'none');
    input.blur();
    keyboard.style.display = 'block';
    vocabScreen.classList.add('vocab-keyboard-open');
    updateVocabKeyboardLayout();
}

window.showVocabSearchKeyboard = showVocabSearchKeyboard;

function updateVocabKeyboardLayout() {
    const keyboard = getVocabKeyboard();
    const vocabScreen = document.getElementById('vocab-screen');
    const header = document.querySelector('#vocab-screen .tech-header');
    const searchContainer = document.querySelector('.vocab-search-container');
    if (!keyboard || !vocabScreen || !vocabSearchKeyboardActive) return;

    const viewportHeight = window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight;
    const keyboardHeight = keyboard.getBoundingClientRect().height || 220;
    const headerHeight = header && header.offsetParent !== null ? header.getBoundingClientRect().height : 0;
    const searchHeight = searchContainer && searchContainer.offsetParent !== null ? searchContainer.getBoundingClientRect().height : 0;
    const topGap = 16;
    const betweenGap = 18;
    const bottomGap = 8;
    const listHeight = Math.max(180, Math.floor(viewportHeight - keyboardHeight - headerHeight - searchHeight - topGap - betweenGap - bottomGap));

    vocabScreen.style.setProperty('--vocab-keyboard-height', `${Math.ceil(keyboardHeight)}px`);
    vocabScreen.style.setProperty('--vocab-list-height', `${listHeight}px`);
}

function hideVocabSearchKeyboard() {
    const keyboard = getVocabKeyboard();
    const vocabScreen = document.getElementById('vocab-screen');
    const wasActive = vocabSearchKeyboardActive;
    vocabSearchKeyboardActive = false;
    if (keyboard) keyboard.style.display = 'none';
    if (vocabScreen) {
        vocabScreen.classList.remove('vocab-keyboard-open');
        vocabScreen.style.removeProperty('--vocab-keyboard-height');
        vocabScreen.style.removeProperty('--vocab-list-height');
    }
    if (wasActive && typeof playSound === 'function') playSound('delete-sfx');
}

function setVocabSearchValue(value) {
    const input = getVocabSearchInput();
    if (!input) return;
    input.value = String(value || '').slice(0, 40);
    filterVocabList();
}

function handleVocabKeyboardInput(keyValue) {
    const input = getVocabSearchInput();
    if (!input) return;

    if (keyValue === 'ENTER') {
        hideVocabSearchKeyboard();
        return;
    }
    if (keyValue === 'BACKSPACE') {
        if (typeof playSound === 'function') playSound('delete-sfx');
        setVocabSearchValue(input.value.slice(0, -1));
        return;
    }
    if (keyValue === 'CLEAR') {
        if (typeof playSound === 'function') playSound('delete-sfx');
        setVocabSearchValue('');
        return;
    }
    if (typeof keyValue === 'string' && keyValue.length === 1) {
        if (typeof playSound === 'function') playSound('enter-sfx');
        setVocabSearchValue(input.value + keyValue.toLowerCase());
    }
}

function setVocabListHeaderLabels(leftText = 'TARGET (CH)', rightText = 'CODE (EN)', thirdText = '') {
    const headerCells = document.querySelectorAll('#vocab-screen .vocab-list-header span');
    if (headerCells[0]) headerCells[0].innerText = leftText;
    if (headerCells[1]) headerCells[1].innerText = rightText;
    if (headerCells[2]) headerCells[2].innerText = thirdText;
}

function setVocabReferenceTabs(items = null) {
    const tabs = document.querySelector('.vocab-tabs');
    if (!tabs) return;

    if (!Array.isArray(items)) {
        tabs.innerHTML = `
            <button class="tab-btn active" onclick="renderVocabList('L1')">L1</button>
            <button class="tab-btn" onclick="renderVocabList('L2')">L2</button>
            <button class="tab-btn" onclick="renderVocabList('L3')">L3</button>
            <button class="tab-btn" onclick="renderVocabList('L4')">L4</button>
            <button class="tab-btn" onclick="renderVocabList('L5')">L5</button>
            <button class="tab-btn star" onclick="renderVocabList('L5_STAR')">L5*</button>
        `;
        return;
    }

    tabs.innerHTML = items.map((item) => `
        <button class="tab-btn${item.active ? ' active' : ''}" onclick="playVocabReferenceTabSound(); ${item.onclick}">${item.label}</button>
    `).join('');
}

const VOCAB_LIST_LEVELS = ['L1', 'L2', 'L3', 'L4', 'L5', 'L5_STAR'];

function getVocabLevelLabel(level) {
    return level === 'L5_STAR' ? 'L5*' : String(level || '').replace('_STAR', '*');
}

function getVocabItemSearchText(item) {
    const sentenceText = Array.isArray(item?.sents)
        ? item.sents.map(sentence => `${sentence?.text || sentence || ''} ${sentence?.answer || ''}`).join(' ')
        : '';
    return [
        item?.en,
        item?.ch,
        item?.example,
        item?.ex,
        sentenceText
    ].join(' ').toLowerCase();
}

function setActiveVocabListTab(level) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const normalizedText = btn.innerText.trim().replace('*', '_STAR');
        if (normalizedText === level || (level === 'L5_STAR' && btn.innerText.trim() === 'L5*')) {
            btn.classList.add('active');
        }
    });
}

function getAllVocabSearchRows(filter) {
    const normalizedFilter = String(filter || '').trim().toLowerCase();
    if (!normalizedFilter || typeof VOCAB_DB === 'undefined') return [];

    return VOCAB_LIST_LEVELS.flatMap(level => {
        const levelRows = Array.isArray(VOCAB_DB[level]) ? VOCAB_DB[level] : [];
        return levelRows
            .filter(item => getVocabItemSearchText(item).includes(normalizedFilter))
            .map(item => ({
                ...item,
                levelKey: level,
                levelLabel: getVocabLevelLabel(level)
            }));
    });
}

function playVocabReferenceTabSound() {
    if (typeof playSound === 'function') {
        playSound('enter-number-sfx');
        return;
    }

    const sound = document.getElementById('enter-number-sfx');
    if (sound && typeof sound.play === 'function') {
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }
}

function escapeVocabHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function highlightTenseNoteText(value) {
    let html = escapeVocabHtml(value);
    [
        'has / have + been + V-ing',
        'has / have / had + been + pp',
        'has / have been + pp',
        'had been + pp',
        'has / have + pp',
        'had + pp',
        'Subject + 原型動詞 / 動詞＋s',
        'is / am / are / was / were + being + pp',
        'do not / does not / did not + 原形動詞',
        'Have you ever + pp',
        'have never + pp',
        'have not + pp',
        'have been to',
        'have gone to',
        'modal + be + pp',
        'to be + pp',
        'be + pp',
        'not / no / never',
        'yesterday / last / ago / in 2020',
        'always / often / usually / sometimes / seldom / never'
    ].forEach((term) => {
        html = html.replace(new RegExp(escapeVocabRegExp(escapeVocabHtml(term)), 'g'), `<strong>${escapeVocabHtml(term)}</strong>`);
    });
    return html;
}

function escapeVocabRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function renderTenseNoteExamples(examples = []) {
    if (!Array.isArray(examples) || examples.length === 0) return '';
    return `
        <div class="tense-note-examples">
            ${examples.map((example) => `
                <div class="tense-note-example">
                    <div class="tense-note-ch">${escapeVocabHtml(example.ch)}</div>
                    <div class="tense-note-en">${highlightTenseNoteText(example.en)}</div>
                    ${example.explain ? `<div class="tense-note-explain">${highlightTenseNoteText(example.explain)}</div>` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

function renderTenseNoteBody(section) {
    if (Array.isArray(section.points) && section.points.length > 0) {
        return `
            <div class="tense-note-points">
                ${section.points.map((point) => `
                    <div class="tense-note-point">
                        <div class="tense-note-point-text">${highlightTenseNoteText(point.note)}</div>
                        ${renderTenseNoteExamples(point.examples)}
                    </div>
                `).join('')}
            </div>
        `;
    }

    return `
        <ul class="tense-note-list">
            ${(section.notes || []).map((note) => `<li>${highlightTenseNoteText(note)}</li>`).join('')}
        </ul>
        ${renderTenseNoteExamples(section.examples)}
    `;
}

function renderParticiplePhraseChecks(checks = []) {
    if (!Array.isArray(checks) || checks.length === 0) return '';
    return `
        <div class="participle-note-checks">
            ${checks.map((item) => `
                <div class="participle-note-check participle-note-check-${item.status === 'good' ? 'good' : 'bad'}">
                    <span class="participle-note-badge">${item.status === 'good' ? 'OK' : 'NO'}</span>
                    <span>${highlightTenseNoteText(item.text)}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function renderParticiplePhraseReferenceScreen() {
    const listBody = document.getElementById('vocab-list-body');
    if (!listBody) return;

    setVocabReferenceTabs();
    const renderToken = prepareVocabListRender(listBody);
    if (renderToken !== vocabRenderToken) return;

    listBody.innerHTML = GRAMMAR_PARTICIPLE_PHRASES_REFERENCE_SECTIONS.map((section, index) => `
        <section class="tense-note-card participle-note-card vocab-row-entrance" style="--vocab-row-delay:${index * 0.05}s">
            <div class="tense-note-head">
                <span class="tense-note-index">${String(index + 1).padStart(2, '0')}</span>
                <h3>${escapeVocabHtml(section.title)}</h3>
            </div>
            <div class="tense-note-formula">${highlightTenseNoteText(section.formula)}</div>
            ${renderTenseNoteBody(section)}
            ${renderParticiplePhraseChecks(section.checks)}
        </section>
    `).join('');
}

function openGrammarParticiplePhrasesReferenceScreen() {
    if (typeof playSound === 'function') playSound('open-room-sfx');
    if (typeof duckStageVocabBgm === 'function') duckStageVocabBgm();

    const grammarTopicScreen = document.getElementById('grammar-topic-screen');
    if (grammarTopicScreen) grammarTopicScreen.style.display = 'none';

    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    const vocabScreen = document.getElementById('vocab-screen');
    const tabs = document.querySelector('.vocab-tabs');
    const searchContainer = document.querySelector('.vocab-search-container');
    const title = document.querySelector('#vocab-screen .tech-title');
    const subtitle = document.querySelector('#vocab-screen .tech-subtitle');

    vocabScreenMode = 'grammar-reference';
    vocabPreviewReturnScreen = 'grammar-topic';
    vocabPreviewTitle = 'PARTICIPLE PHRASES';
    vocabPreviewSubtitle = 'TACTICAL GRAMMAR NOTES';

    if (title) title.innerText = vocabPreviewTitle;
    if (subtitle) subtitle.innerText = vocabPreviewSubtitle;
    if (tabs) tabs.style.display = 'none';
    if (searchContainer) searchContainer.style.display = 'none';
    setVocabListHeaderLabels();
    if (vocabScreen) {
        vocabScreen.classList.remove('stage-preview', 'grammar-reference-three-col', 'grammar-reference-two-col-en-first', 'grammar-reference-infinitive', 'grammar-reference-pronoun-table');
        vocabScreen.classList.add('grammar-reference-preview', 'grammar-reference-notes');
        vocabScreen.style.display = 'flex';
    }
    renderParticiplePhraseReferenceScreen();
    setupVocabSearchKeyboard();
}

function renderQuestionTagReferenceScreen() {
    const listBody = document.getElementById('vocab-list-body');
    if (!listBody) return;

    setVocabReferenceTabs();
    const renderToken = prepareVocabListRender(listBody);
    if (renderToken !== vocabRenderToken) return;

    listBody.innerHTML = GRAMMAR_QUESTION_TAG_REFERENCE_SECTIONS.map((section, index) => `
        <section class="tense-note-card vocab-row-entrance" style="--vocab-row-delay:${index * 0.05}s">
            <div class="tense-note-head">
                <span class="tense-note-index">${String(index + 1).padStart(2, '0')}</span>
                <h3>${escapeVocabHtml(section.title)}</h3>
            </div>
            <div class="tense-note-formula">${highlightTenseNoteText(section.formula)}</div>
            ${renderTenseNoteBody(section)}
        </section>
    `).join('');
}

function openGrammarQuestionTagReferenceScreen() {
    if (typeof playSound === 'function') playSound('open-room-sfx');
    if (typeof duckStageVocabBgm === 'function') duckStageVocabBgm();

    const grammarTopicScreen = document.getElementById('grammar-topic-screen');
    if (grammarTopicScreen) grammarTopicScreen.style.display = 'none';

    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    const vocabScreen = document.getElementById('vocab-screen');
    const tabs = document.querySelector('.vocab-tabs');
    const searchContainer = document.querySelector('.vocab-search-container');
    const title = document.querySelector('#vocab-screen .tech-title');
    const subtitle = document.querySelector('#vocab-screen .tech-subtitle');

    vocabScreenMode = 'grammar-reference';
    vocabPreviewReturnScreen = 'grammar-topic';
    vocabPreviewTitle = 'QUESTION TAG';
    vocabPreviewSubtitle = 'TACTICAL GRAMMAR NOTES';

    if (title) title.innerText = vocabPreviewTitle;
    if (subtitle) subtitle.innerText = vocabPreviewSubtitle;
    if (tabs) tabs.style.display = 'none';
    if (searchContainer) searchContainer.style.display = 'none';
    setVocabListHeaderLabels();
    if (vocabScreen) {
        vocabScreen.classList.remove('stage-preview', 'grammar-reference-three-col', 'grammar-reference-two-col-en-first', 'grammar-reference-infinitive', 'grammar-reference-pronoun-table');
        vocabScreen.classList.add('grammar-reference-preview', 'grammar-reference-notes');
        vocabScreen.style.display = 'flex';
    }
    renderQuestionTagReferenceScreen();
    setupVocabSearchKeyboard();
}

function renderDeStructureReferenceScreen() {
    const listBody = document.getElementById('vocab-list-body');
    if (!listBody) return;

    setVocabReferenceTabs();
    const renderToken = prepareVocabListRender(listBody);
    if (renderToken !== vocabRenderToken) return;

    listBody.innerHTML = GRAMMAR_DE_STRUCTURE_REFERENCE_SECTIONS.map((section, index) => `
        <section class="tense-note-card vocab-row-entrance" style="--vocab-row-delay:${index * 0.05}s">
            <div class="tense-note-head">
                <span class="tense-note-index">${String(index + 1).padStart(2, '0')}</span>
                <h3>${escapeVocabHtml(section.title)}</h3>
            </div>
            <div class="tense-note-formula">${highlightTenseNoteText(section.formula)}</div>
            ${renderTenseNoteBody(section)}
        </section>
    `).join('');
}

function openGrammarDeStructureReferenceScreen() {
    if (typeof playSound === 'function') playSound('open-room-sfx');
    if (typeof duckStageVocabBgm === 'function') duckStageVocabBgm();

    const grammarTopicScreen = document.getElementById('grammar-topic-screen');
    if (grammarTopicScreen) grammarTopicScreen.style.display = 'none';

    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    const vocabScreen = document.getElementById('vocab-screen');
    const tabs = document.querySelector('.vocab-tabs');
    const searchContainer = document.querySelector('.vocab-search-container');
    const title = document.querySelector('#vocab-screen .tech-title');
    const subtitle = document.querySelector('#vocab-screen .tech-subtitle');

    vocabScreenMode = 'grammar-reference';
    vocabPreviewReturnScreen = 'grammar-topic';
    vocabPreviewTitle = 'WAYS TO DESCRIBE NOUNS';
    vocabPreviewSubtitle = 'TACTICAL GRAMMAR NOTES';

    if (title) title.innerText = vocabPreviewTitle;
    if (subtitle) subtitle.innerText = vocabPreviewSubtitle;
    if (tabs) tabs.style.display = 'none';
    if (searchContainer) searchContainer.style.display = 'none';
    setVocabListHeaderLabels();
    if (vocabScreen) {
        vocabScreen.classList.remove('stage-preview', 'grammar-reference-three-col', 'grammar-reference-two-col-en-first', 'grammar-reference-infinitive', 'grammar-reference-pronoun-table');
        vocabScreen.classList.add('grammar-reference-preview', 'grammar-reference-notes');
        vocabScreen.style.display = 'flex';
    }
    renderDeStructureReferenceScreen();
    setupVocabSearchKeyboard();
}

function renderReportedSpeechReferenceScreen() {
    const listBody = document.getElementById('vocab-list-body');
    if (!listBody) return;

    setVocabReferenceTabs();
    const renderToken = prepareVocabListRender(listBody);
    if (renderToken !== vocabRenderToken) return;

    listBody.innerHTML = GRAMMAR_REPORTED_SPEECH_REFERENCE_SECTIONS.map((section, index) => `
        <section class="tense-note-card vocab-row-entrance" style="--vocab-row-delay:${index * 0.05}s">
            <div class="tense-note-head">
                <span class="tense-note-index">${String(index + 1).padStart(2, '0')}</span>
                <h3>${escapeVocabHtml(section.title)}</h3>
            </div>
            <div class="tense-note-formula">${highlightTenseNoteText(section.formula)}</div>
            ${renderTenseNoteBody(section)}
        </section>
    `).join('');
}

function openGrammarReportedSpeechReferenceScreen() {
    if (typeof playSound === 'function') playSound('open-room-sfx');
    if (typeof duckStageVocabBgm === 'function') duckStageVocabBgm();

    const grammarTopicScreen = document.getElementById('grammar-topic-screen');
    if (grammarTopicScreen) grammarTopicScreen.style.display = 'none';

    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    const vocabScreen = document.getElementById('vocab-screen');
    const tabs = document.querySelector('.vocab-tabs');
    const searchContainer = document.querySelector('.vocab-search-container');
    const title = document.querySelector('#vocab-screen .tech-title');
    const subtitle = document.querySelector('#vocab-screen .tech-subtitle');

    vocabScreenMode = 'grammar-reference';
    vocabPreviewReturnScreen = 'grammar-topic';
    vocabPreviewTitle = 'REPORTED SPEECH';
    vocabPreviewSubtitle = 'TACTICAL GRAMMAR NOTES';

    if (title) title.innerText = vocabPreviewTitle;
    if (subtitle) subtitle.innerText = vocabPreviewSubtitle;
    if (tabs) tabs.style.display = 'none';
    if (searchContainer) searchContainer.style.display = 'none';
    setVocabListHeaderLabels();
    if (vocabScreen) {
        vocabScreen.classList.remove('stage-preview', 'grammar-reference-three-col', 'grammar-reference-two-col-en-first', 'grammar-reference-infinitive', 'grammar-reference-pronoun-table');
        vocabScreen.classList.add('grammar-reference-preview', 'grammar-reference-notes');
        vocabScreen.style.display = 'flex';
    }
    renderReportedSpeechReferenceScreen();
    setupVocabSearchKeyboard();
}

function renderItIsReferenceScreen() {
    const listBody = document.getElementById('vocab-list-body');
    if (!listBody) return;

    setVocabReferenceTabs();
    const renderToken = prepareVocabListRender(listBody);
    if (renderToken !== vocabRenderToken) return;

    listBody.innerHTML = GRAMMAR_IT_IS_REFERENCE_SECTIONS.map((section, index) => `
        <section class="tense-note-card vocab-row-entrance" style="--vocab-row-delay:${index * 0.05}s">
            <div class="tense-note-head">
                <span class="tense-note-index">${String(index + 1).padStart(2, '0')}</span>
                <h3>${escapeVocabHtml(section.title)}</h3>
            </div>
            <div class="tense-note-formula">${highlightTenseNoteText(section.formula)}</div>
            ${renderTenseNoteBody(section)}
        </section>
    `).join('');
}

function openGrammarItIsReferenceScreen() {
    if (typeof playSound === 'function') playSound('open-room-sfx');
    if (typeof duckStageVocabBgm === 'function') duckStageVocabBgm();

    const grammarTopicScreen = document.getElementById('grammar-topic-screen');
    if (grammarTopicScreen) grammarTopicScreen.style.display = 'none';

    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    const vocabScreen = document.getElementById('vocab-screen');
    const tabs = document.querySelector('.vocab-tabs');
    const searchContainer = document.querySelector('.vocab-search-container');
    const title = document.querySelector('#vocab-screen .tech-title');
    const subtitle = document.querySelector('#vocab-screen .tech-subtitle');

    vocabScreenMode = 'grammar-reference';
    vocabPreviewReturnScreen = 'grammar-topic';
    vocabPreviewTitle = 'IT IS';
    vocabPreviewSubtitle = 'TACTICAL GRAMMAR NOTES';

    if (title) title.innerText = vocabPreviewTitle;
    if (subtitle) subtitle.innerText = vocabPreviewSubtitle;
    if (tabs) tabs.style.display = 'none';
    if (searchContainer) searchContainer.style.display = 'none';
    setVocabListHeaderLabels();
    if (vocabScreen) {
        vocabScreen.classList.remove('stage-preview', 'grammar-reference-three-col', 'grammar-reference-two-col-en-first', 'grammar-reference-infinitive', 'grammar-reference-pronoun-table');
        vocabScreen.classList.add('grammar-reference-preview', 'grammar-reference-notes');
        vocabScreen.style.display = 'flex';
    }
    renderItIsReferenceScreen();
    setupVocabSearchKeyboard();
}

function renderDirectQuestionReferenceScreen() {
    const listBody = document.getElementById('vocab-list-body');
    if (!listBody) return;

    setVocabReferenceTabs();
    const renderToken = prepareVocabListRender(listBody);
    if (renderToken !== vocabRenderToken) return;

    listBody.innerHTML = GRAMMAR_DIRECT_QUESTION_REFERENCE_SECTIONS.map((section, index) => `
        <section class="tense-note-card vocab-row-entrance" style="--vocab-row-delay:${index * 0.05}s">
            <div class="tense-note-head">
                <span class="tense-note-index">${String(index + 1).padStart(2, '0')}</span>
                <h3>${escapeVocabHtml(section.title)}</h3>
            </div>
            <div class="tense-note-formula">${highlightTenseNoteText(section.formula)}</div>
            ${renderTenseNoteBody(section)}
        </section>
    `).join('');
}

function openGrammarDirectQuestionReferenceScreen() {
    if (typeof playSound === 'function') playSound('open-room-sfx');
    if (typeof duckStageVocabBgm === 'function') duckStageVocabBgm();

    const grammarTopicScreen = document.getElementById('grammar-topic-screen');
    if (grammarTopicScreen) grammarTopicScreen.style.display = 'none';

    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    const vocabScreen = document.getElementById('vocab-screen');
    const tabs = document.querySelector('.vocab-tabs');
    const searchContainer = document.querySelector('.vocab-search-container');
    const title = document.querySelector('#vocab-screen .tech-title');
    const subtitle = document.querySelector('#vocab-screen .tech-subtitle');

    vocabScreenMode = 'grammar-reference';
    vocabPreviewReturnScreen = 'grammar-topic';
    vocabPreviewTitle = 'DIRECT QUESTION';
    vocabPreviewSubtitle = 'TACTICAL GRAMMAR NOTES';

    if (title) title.innerText = vocabPreviewTitle;
    if (subtitle) subtitle.innerText = vocabPreviewSubtitle;
    if (tabs) tabs.style.display = 'none';
    if (searchContainer) searchContainer.style.display = 'none';
    setVocabListHeaderLabels();
    if (vocabScreen) {
        vocabScreen.classList.remove('stage-preview', 'grammar-reference-three-col', 'grammar-reference-two-col-en-first', 'grammar-reference-infinitive', 'grammar-reference-pronoun-table');
        vocabScreen.classList.add('grammar-reference-preview', 'grammar-reference-notes');
        vocabScreen.style.display = 'flex';
    }
    renderDirectQuestionReferenceScreen();
    setupVocabSearchKeyboard();
}

function renderIndirectQuestionReferenceScreen() {
    const listBody = document.getElementById('vocab-list-body');
    if (!listBody) return;

    setVocabReferenceTabs();
    const renderToken = prepareVocabListRender(listBody);
    if (renderToken !== vocabRenderToken) return;

    listBody.innerHTML = GRAMMAR_INDIRECT_QUESTION_REFERENCE_SECTIONS.map((section, index) => `
        <section class="tense-note-card vocab-row-entrance" style="--vocab-row-delay:${index * 0.05}s">
            <div class="tense-note-head">
                <span class="tense-note-index">${String(index + 1).padStart(2, '0')}</span>
                <h3>${escapeVocabHtml(section.title)}</h3>
            </div>
            <div class="tense-note-formula">${highlightTenseNoteText(section.formula)}</div>
            ${renderTenseNoteBody(section)}
        </section>
    `).join('');
}

function openGrammarIndirectQuestionReferenceScreen() {
    if (typeof playSound === 'function') playSound('open-room-sfx');
    if (typeof duckStageVocabBgm === 'function') duckStageVocabBgm();

    const grammarTopicScreen = document.getElementById('grammar-topic-screen');
    if (grammarTopicScreen) grammarTopicScreen.style.display = 'none';

    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    const vocabScreen = document.getElementById('vocab-screen');
    const tabs = document.querySelector('.vocab-tabs');
    const searchContainer = document.querySelector('.vocab-search-container');
    const title = document.querySelector('#vocab-screen .tech-title');
    const subtitle = document.querySelector('#vocab-screen .tech-subtitle');

    vocabScreenMode = 'grammar-reference';
    vocabPreviewReturnScreen = 'grammar-topic';
    vocabPreviewTitle = 'INDIRECT QUESTION';
    vocabPreviewSubtitle = 'TACTICAL GRAMMAR NOTES';

    if (title) title.innerText = vocabPreviewTitle;
    if (subtitle) subtitle.innerText = vocabPreviewSubtitle;
    if (tabs) tabs.style.display = 'none';
    if (searchContainer) searchContainer.style.display = 'none';
    setVocabListHeaderLabels();
    if (vocabScreen) {
        vocabScreen.classList.remove('stage-preview', 'grammar-reference-three-col', 'grammar-reference-two-col-en-first', 'grammar-reference-infinitive', 'grammar-reference-pronoun-table');
        vocabScreen.classList.add('grammar-reference-preview', 'grammar-reference-notes');
        vocabScreen.style.display = 'flex';
    }
    renderIndirectQuestionReferenceScreen();
    setupVocabSearchKeyboard();
}

function renderInversionReferenceScreen() {
    const listBody = document.getElementById('vocab-list-body');
    if (!listBody) return;

    setVocabReferenceTabs();
    const renderToken = prepareVocabListRender(listBody);
    if (renderToken !== vocabRenderToken) return;

    listBody.innerHTML = GRAMMAR_INVERSION_REFERENCE_SECTIONS.map((section, index) => `
        <section class="tense-note-card vocab-row-entrance" style="--vocab-row-delay:${index * 0.05}s">
            <div class="tense-note-head">
                <span class="tense-note-index">${String(index + 1).padStart(2, '0')}</span>
                <h3>${escapeVocabHtml(section.title)}</h3>
            </div>
            <div class="tense-note-formula">${highlightTenseNoteText(section.formula)}</div>
            ${renderTenseNoteBody(section)}
        </section>
    `).join('');
}

function openGrammarInversionReferenceScreen() {
    if (typeof playSound === 'function') playSound('open-room-sfx');
    if (typeof duckStageVocabBgm === 'function') duckStageVocabBgm();

    const grammarTopicScreen = document.getElementById('grammar-topic-screen');
    if (grammarTopicScreen) grammarTopicScreen.style.display = 'none';

    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    const vocabScreen = document.getElementById('vocab-screen');
    const tabs = document.querySelector('.vocab-tabs');
    const searchContainer = document.querySelector('.vocab-search-container');
    const title = document.querySelector('#vocab-screen .tech-title');
    const subtitle = document.querySelector('#vocab-screen .tech-subtitle');

    vocabScreenMode = 'grammar-reference';
    vocabPreviewReturnScreen = 'grammar-topic';
    vocabPreviewTitle = 'INVERSION';
    vocabPreviewSubtitle = 'TACTICAL GRAMMAR NOTES';

    if (title) title.innerText = vocabPreviewTitle;
    if (subtitle) subtitle.innerText = vocabPreviewSubtitle;
    if (tabs) tabs.style.display = 'none';
    if (searchContainer) searchContainer.style.display = 'none';
    setVocabListHeaderLabels();
    if (vocabScreen) {
        vocabScreen.classList.remove('stage-preview', 'grammar-reference-three-col', 'grammar-reference-two-col-en-first', 'grammar-reference-infinitive', 'grammar-reference-pronoun-table');
        vocabScreen.classList.add('grammar-reference-preview', 'grammar-reference-notes');
        vocabScreen.style.display = 'flex';
    }
    renderInversionReferenceScreen();
    setupVocabSearchKeyboard();
}

function renderPrepositionTimeReferenceScreen() {
    const listBody = document.getElementById('vocab-list-body');
    if (!listBody) return;

    setVocabReferenceTabs();
    const renderToken = prepareVocabListRender(listBody);
    if (renderToken !== vocabRenderToken) return;

    listBody.innerHTML = GRAMMAR_PREPOSITION_TIME_REFERENCE_SECTIONS.map((section, index) => `
        <section class="tense-note-card vocab-row-entrance" style="--vocab-row-delay:${index * 0.05}s">
            <div class="tense-note-head">
                <span class="tense-note-index">${String(index + 1).padStart(2, '0')}</span>
                <h3>${escapeVocabHtml(section.title)}</h3>
            </div>
            <div class="tense-note-formula">${highlightTenseNoteText(section.formula)}</div>
            ${renderTenseNoteBody(section)}
        </section>
    `).join('');
}

function openGrammarPrepositionTimeReferenceScreen() {
    if (typeof playSound === 'function') playSound('open-room-sfx');
    if (typeof duckStageVocabBgm === 'function') duckStageVocabBgm();

    const grammarTopicScreen = document.getElementById('grammar-topic-screen');
    if (grammarTopicScreen) grammarTopicScreen.style.display = 'none';

    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    const vocabScreen = document.getElementById('vocab-screen');
    const tabs = document.querySelector('.vocab-tabs');
    const searchContainer = document.querySelector('.vocab-search-container');
    const title = document.querySelector('#vocab-screen .tech-title');
    const subtitle = document.querySelector('#vocab-screen .tech-subtitle');

    vocabScreenMode = 'grammar-reference';
    vocabPreviewReturnScreen = 'grammar-topic';
    vocabPreviewTitle = 'PREPOSITION OF TIME';
    vocabPreviewSubtitle = 'TACTICAL GRAMMAR NOTES';

    if (title) title.innerText = vocabPreviewTitle;
    if (subtitle) subtitle.innerText = vocabPreviewSubtitle;
    if (tabs) tabs.style.display = 'none';
    if (searchContainer) searchContainer.style.display = 'none';
    setVocabListHeaderLabels();
    if (vocabScreen) {
        vocabScreen.classList.remove('stage-preview', 'grammar-reference-three-col', 'grammar-reference-two-col-en-first', 'grammar-reference-infinitive', 'grammar-reference-pronoun-table');
        vocabScreen.classList.add('grammar-reference-preview', 'grammar-reference-notes');
        vocabScreen.style.display = 'flex';
    }
    renderPrepositionTimeReferenceScreen();
    setupVocabSearchKeyboard();
}

function renderPrepositionPlaceReferenceCategory(category = 'core') {
    grammarPrepositionPlaceReferenceCategory = GRAMMAR_PREPOSITION_PLACE_REFERENCE_GROUPS[category] ? category : 'core';
    const group = GRAMMAR_PREPOSITION_PLACE_REFERENCE_GROUPS[grammarPrepositionPlaceReferenceCategory];
    const listBody = document.getElementById('vocab-list-body');
    if (!listBody) return;

    setVocabReferenceTabs(Object.entries(GRAMMAR_PREPOSITION_PLACE_REFERENCE_GROUPS).map(([key, item]) => ({
        label: item.label,
        active: key === grammarPrepositionPlaceReferenceCategory,
        onclick: `renderPrepositionPlaceReferenceCategory('${key}')`
    })));

    const renderToken = prepareVocabListRender(listBody);
    if (renderToken !== vocabRenderToken) return;

    listBody.innerHTML = group.sections.map((section, index) => `
        <section class="tense-note-card vocab-row-entrance" style="--vocab-row-delay:${index * 0.05}s">
            <div class="tense-note-head">
                <span class="tense-note-index">${String(index + 1).padStart(2, '0')}</span>
                <h3>${escapeVocabHtml(section.title)}</h3>
            </div>
            <div class="tense-note-formula">${highlightTenseNoteText(section.formula)}</div>
            ${renderTenseNoteBody(section)}
        </section>
    `).join('');
}

function openGrammarPrepositionPlaceReferenceScreen() {
    if (typeof playSound === 'function') playSound('open-room-sfx');
    if (typeof duckStageVocabBgm === 'function') duckStageVocabBgm();

    const grammarTopicScreen = document.getElementById('grammar-topic-screen');
    if (grammarTopicScreen) grammarTopicScreen.style.display = 'none';

    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    const vocabScreen = document.getElementById('vocab-screen');
    const tabs = document.querySelector('.vocab-tabs');
    const searchContainer = document.querySelector('.vocab-search-container');
    const title = document.querySelector('#vocab-screen .tech-title');
    const subtitle = document.querySelector('#vocab-screen .tech-subtitle');

    vocabScreenMode = 'grammar-reference';
    vocabPreviewReturnScreen = 'grammar-topic';
    vocabPreviewTitle = 'PREPOSITION OF PLACE';
    vocabPreviewSubtitle = 'PLACE AND MOVEMENT NOTES';
    grammarPrepositionPlaceReferenceCategory = 'core';

    if (title) title.innerText = vocabPreviewTitle;
    if (subtitle) subtitle.innerText = vocabPreviewSubtitle;
    if (tabs) tabs.style.display = 'flex';
    if (searchContainer) searchContainer.style.display = 'none';
    setVocabListHeaderLabels();
    if (vocabScreen) {
        vocabScreen.classList.remove('stage-preview', 'grammar-reference-three-col', 'grammar-reference-two-col-en-first', 'grammar-reference-infinitive', 'grammar-reference-pronoun-table');
        vocabScreen.classList.add('grammar-reference-preview', 'grammar-reference-notes');
        vocabScreen.style.display = 'flex';
    }
    renderPrepositionPlaceReferenceCategory('core');
    setupVocabSearchKeyboard();
}

function renderComparativeSuperlativeReferenceScreen() {
    const listBody = document.getElementById('vocab-list-body');
    if (!listBody) return;

    setVocabReferenceTabs();
    const renderToken = prepareVocabListRender(listBody);
    if (renderToken !== vocabRenderToken) return;

    listBody.innerHTML = GRAMMAR_COMPARATIVE_SUPERLATIVE_REFERENCE_SECTIONS.map((section, index) => `
        <section class="tense-note-card vocab-row-entrance" style="--vocab-row-delay:${index * 0.05}s">
            <div class="tense-note-head">
                <span class="tense-note-index">${String(index + 1).padStart(2, '0')}</span>
                <h3>${escapeVocabHtml(section.title)}</h3>
            </div>
            <div class="tense-note-formula">${highlightTenseNoteText(section.formula)}</div>
            ${renderTenseNoteBody(section)}
        </section>
    `).join('');
}

function openGrammarComparativeSuperlativeReferenceScreen() {
    if (typeof playSound === 'function') playSound('open-room-sfx');
    if (typeof duckStageVocabBgm === 'function') duckStageVocabBgm();

    const grammarTopicScreen = document.getElementById('grammar-topic-screen');
    if (grammarTopicScreen) grammarTopicScreen.style.display = 'none';

    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    const vocabScreen = document.getElementById('vocab-screen');
    const tabs = document.querySelector('.vocab-tabs');
    const searchContainer = document.querySelector('.vocab-search-container');
    const title = document.querySelector('#vocab-screen .tech-title');
    const subtitle = document.querySelector('#vocab-screen .tech-subtitle');

    vocabScreenMode = 'grammar-reference';
    vocabPreviewReturnScreen = 'grammar-topic';
    vocabPreviewTitle = 'COMPARATIVE AND SUPERLATIVE';
    vocabPreviewSubtitle = 'TACTICAL GRAMMAR NOTES';

    if (title) title.innerText = vocabPreviewTitle;
    if (subtitle) subtitle.innerText = vocabPreviewSubtitle;
    if (tabs) tabs.style.display = 'none';
    if (searchContainer) searchContainer.style.display = 'none';
    setVocabListHeaderLabels();
    if (vocabScreen) {
        vocabScreen.classList.remove('stage-preview', 'grammar-reference-three-col', 'grammar-reference-two-col-en-first', 'grammar-reference-infinitive', 'grammar-reference-pronoun-table');
        vocabScreen.classList.add('grammar-reference-preview', 'grammar-reference-notes');
        vocabScreen.style.display = 'flex';
    }
    renderComparativeSuperlativeReferenceScreen();
    setupVocabSearchKeyboard();
}

function renderPronounReferenceTable() {
    const listBody = document.getElementById('vocab-list-body');
    if (!listBody) return;

    const renderToken = prepareVocabListRender(listBody);
    if (renderToken !== vocabRenderToken) return;

    listBody.innerHTML = `
        <div class="pronoun-reference-wrap vocab-row-entrance">
            <table class="pronoun-reference-table" aria-label="Pronoun reference table">
                <thead>
                    <tr>
                        <th></th>
                        <th>主語</th>
                        <th>非主語</th>
                        <th class="pronoun-red">的</th>
                        <th>的東西</th>
                        <th class="pronoun-red">自己<br><span>名詞</span></th>
                    </tr>
                </thead>
                <tbody>
                    ${GRAMMAR_PRONOUN_REFERENCE_ROWS.map((row) => `
                        <tr>
                            <td class="pronoun-ch">${escapeVocabHtml(row.ch)}</td>
                            <td>${escapeVocabHtml(row.subject)}</td>
                            <td>${escapeVocabHtml(row.object)}</td>
                            <td class="pronoun-red">${escapeVocabHtml(row.possessiveAdj)}</td>
                            <td>${escapeVocabHtml(row.possessivePronoun)}</td>
                            <td class="pronoun-red">${escapeVocabHtml(row.reflexive)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function openGrammarPronounReferenceScreen() {
    if (typeof playSound === 'function') playSound('open-room-sfx');
    if (typeof duckStageVocabBgm === 'function') duckStageVocabBgm();

    const grammarTopicScreen = document.getElementById('grammar-topic-screen');
    if (grammarTopicScreen) grammarTopicScreen.style.display = 'none';

    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    const vocabScreen = document.getElementById('vocab-screen');
    const tabs = document.querySelector('.vocab-tabs');
    const searchContainer = document.querySelector('.vocab-search-container');
    const title = document.querySelector('#vocab-screen .tech-title');
    const subtitle = document.querySelector('#vocab-screen .tech-subtitle');

    vocabScreenMode = 'grammar-reference';
    vocabPreviewReturnScreen = 'grammar-topic';
    vocabPreviewTitle = 'PRONOUN';
    vocabPreviewSubtitle = 'REFERENCE TABLE';

    if (title) title.innerText = vocabPreviewTitle;
    if (subtitle) subtitle.innerText = vocabPreviewSubtitle;
    if (tabs) tabs.style.display = 'none';
    if (searchContainer) searchContainer.style.display = 'none';
    setVocabListHeaderLabels();
    if (vocabScreen) {
        vocabScreen.classList.remove('stage-preview', 'grammar-reference-three-col', 'grammar-reference-two-col-en-first', 'grammar-reference-infinitive', 'grammar-reference-notes');
        vocabScreen.classList.add('grammar-reference-preview', 'grammar-reference-pronoun-table');
        vocabScreen.style.display = 'flex';
    }
    renderPronounReferenceTable();
    setupVocabSearchKeyboard();
}

function closeVocabScreen() {
    playSound('delete-sfx');
    hideVocabSearchKeyboard();
    const vocabScreen = document.getElementById('vocab-screen');
    vocabScreen.style.display = 'none';
    const returnScreen = vocabPreviewReturnScreen;

    const tabs = document.querySelector('.vocab-tabs');
    const searchContainer = document.querySelector('.vocab-search-container');
    const title = document.querySelector('#vocab-screen .tech-title');
    const subtitle = document.querySelector('#vocab-screen .tech-subtitle');

    if (vocabScreenMode === 'stage-preview' || vocabScreenMode === 'grammar-reference') {
        if (typeof restoreStageVocabBgm === 'function') restoreStageVocabBgm();
        vocabScreen.classList.remove('stage-preview', 'grammar-reference-preview', 'grammar-reference-three-col', 'grammar-reference-two-col-en-first', 'grammar-reference-infinitive', 'grammar-reference-notes', 'grammar-reference-pronoun-table');
        if (title) title.innerText = 'VOCAB LIST';
        if (subtitle) subtitle.innerText = 'CLASSIFIED VOCABULARY DATABASE';
        if (tabs) tabs.style.display = 'flex';
        if (searchContainer) searchContainer.style.display = 'flex';
        setVocabReferenceTabs();
        setVocabListHeaderLabels();
        vocabScreenMode = 'default';
        vocabPreviewRows = [];
        vocabPreviewReturnScreen = 'start';
        vocabPreviewTitle = 'VOCAB LIST';
        vocabPreviewSubtitle = 'CLASSIFIED VOCABULARY DATABASE';

        const stageScreen = document.getElementById('stage-screen');
        if (returnScreen === 'stage' && stageScreen) {
            stageScreen.style.display = 'flex';
            const wrapper = stageScreen.querySelector('.panel-content-wrapper');
            if (wrapper) {
                wrapper.style.animation = 'none';
                setTimeout(() => {
                    wrapper.style.animation = 'holoAppear 0.25s ease-out forwards';
                }, 10);
            }
            return;
        }

        if (returnScreen === 'grammar-topic') {
            const grammarTopicScreen = document.getElementById('grammar-topic-screen');
            if (grammarTopicScreen) {
                grammarTopicScreen.style.display = 'flex';
                const wrapper = grammarTopicScreen.querySelector('.panel-content-wrapper');
                if (wrapper) {
                    wrapper.style.animation = 'none';
                    setTimeout(() => {
                        wrapper.style.animation = 'holoAppear 0.25s ease-out forwards';
                    }, 10);
                }
            }
            return;
        }
    } else if (typeof releaseBgmDuck === 'function') {
        releaseBgmDuck('code-list', 250);
    }

    document.getElementById('start-screen').style.display = 'flex';

    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'block';
        updateSuppliesDisplay();
    }
}

function openRankingScreen() {
    playSound('deploy-sfx');

    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('ranking-screen').style.display = 'flex';
    currentRankingTab = 'total-xp';
    switchRankingTab('total-xp');
}

function closeRankingScreen() {
    playSound('delete-sfx');
    document.getElementById('ranking-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';

    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'block';
        updateSuppliesDisplay();
    }
}

function switchRankingTab(tabName) {
    currentRankingTab = tabName;

    document.getElementById('tab-total-xp').classList.toggle('active', tabName === 'total-xp');
    document.getElementById('tab-pvp-winrate').classList.toggle('active', tabName === 'pvp-winrate');

    if (tabName === 'total-xp') {
        loadTotalXPRanking();
    } else {
        loadPVPWinRateRanking();
    }
}

async function loadTotalXPRanking() {
    const rankingList = document.getElementById('ranking-list');
    if (!rankingList) return;

    rankingList.innerHTML = '<div style="text-align: center; color: #64748b; padding: 40px; font-family: \'Orbitron\'; font-size: 12px;">LOADING RANKING DATA...</div>';

    try {
        const { ref, get } = window.firebaseModules;
        const usersRef = ref(window.db, 'users');
        const snapshot = await get(usersRef);
        const users = snapshot.val();

        if (!users) {
            rankingList.innerHTML = '<div style="text-align: center; color: #64748b; padding: 40px; font-family: \'Orbitron\'; font-size: 12px;">NO RANKING DATA AVAILABLE</div>';
            return;
        }

        const userArray = Object.keys(users).map(uid => ({
            uid,
            name: users[uid].name || users[uid].displayName || 'UNKNOWN',
            totalXP: users[uid].xp || 0
        }));

        userArray.sort((a, b) => b.totalXP - a.totalXP);

        const top100 = userArray.slice(0, 100);

        let html = '';
        top100.forEach((user, index) => {
            const rank = index + 1;
            const rankData = getRankForXP(user.totalXP);
            const isCurrentUser = user.uid === myPlayerId;
            const iconColor = getIconColor(index);
            const iconPath = `ranking_icon/${iconColor}/${rankData.iconFile}`;

            let rankColor = '#94a3b8';
            if (index === 0) rankColor = '#fbbf24';
            else if (index >= 1 && index <= 2) rankColor = '#c0c0c0';
            else if (index >= 3 && index <= 9) rankColor = '#cd7f32';

            html += `
                <div class="ranking-item" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 15px; background: ${isCurrentUser ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.5)'}; border: 1px solid ${isCurrentUser ? 'rgba(255, 255, 255, 0.4)' : 'rgba(100, 116, 139, 0.2)'}; border-radius: 3px; opacity: 0;">
                    <div style="display: flex; align-items: center; gap: 15px; flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="font-family: 'Black Ops One'; font-size: 16px; color: ${rankColor}; min-width: 50px; text-align: center;">
                                #${rank}
                            </div>
                            <img src="${iconPath}" style="width: 24px; height: 24px; vertical-align: middle;" onerror="this.style.display='none'">
                        </div>
                        <div style="flex: 1;">
                            <div style="font-family: 'Orbitron'; font-size: 14px; color: ${isCurrentUser ? '#ffffff' : '#e2e8f0'}; font-weight: ${isCurrentUser ? 'bold' : 'normal'};">
                                ${user.name} ${isCurrentUser ? '(YOU)' : ''}
                            </div>
                            <div style="font-size: 10px; color: #94a3b8; font-family: 'Orbitron'; margin-top: 2px;">
                                ${rankData.name}
                            </div>
                        </div>
                    </div>
                    <div style="font-family: 'Orbitron'; font-size: 14px; color: #ffffff; font-weight: bold;">
                        ${user.totalXP.toLocaleString()} XP
                    </div>
                </div>
            `;
        });

        rankingList.innerHTML = html;

        const rankingItems = document.querySelectorAll('.ranking-item');
        rankingItems.forEach((item, index) => {
            item.style.animation = `fadeIn 0.3s ease-out ${index * 0.05}s forwards`;
        });
    } catch (error) {
        console.error('[Ranking] Error loading total XP data:', error);
        rankingList.innerHTML = '<div style="text-align: center; color: #ff4444; padding: 40px; font-family: \'Orbitron\'; font-size: 12px;">ERROR LOADING RANKING DATA</div>';
    }
}

async function loadPVPWinRateRanking() {
    const rankingList = document.getElementById('ranking-list');
    if (!rankingList) return;

    rankingList.innerHTML = '<div style="text-align: center; color: #64748b; padding: 40px; font-family: \'Orbitron\'; font-size: 12px;">LOADING PVP RANKING DATA...</div>';

    try {
        const { ref, get } = window.firebaseModules;
        const usersRef = ref(window.db, 'users');
        const snapshot = await get(usersRef);
        const users = snapshot.val();

        if (!users) {
            rankingList.innerHTML = '<div style="text-align: center; color: #64748b; padding: 40px; font-family: \'Orbitron\'; font-size: 12px;">NO RANKING DATA AVAILABLE</div>';
            return;
        }

        const userArray = Object.keys(users)
            .map(uid => ({
                uid,
                name: users[uid].name || users[uid].displayName || 'UNKNOWN',
                totalXP: users[uid].xp || 0,
                pvpWins: users[uid].pvpWins || 0,
                pvpLosses: users[uid].pvpLosses || 0,
                pvpTotalMatches: users[uid].pvpTotalMatches || 0
            }))
            .filter(user => user.pvpWins > 0);

        userArray.forEach(user => {
            user.winRate = user.pvpTotalMatches > 0
                ? (user.pvpWins / user.pvpTotalMatches * 100)
                : 0;
        });

        userArray.sort((a, b) => b.pvpWins - a.pvpWins);

        if (userArray.length === 0) {
            rankingList.innerHTML = '<div style="text-align: center; color: #64748b; padding: 40px; font-family: \'Orbitron\'; font-size: 12px;">NO PVP DATA AVAILABLE</div>';
            return;
        }

        const top100 = userArray.slice(0, 100);

        let html = '';
        top100.forEach((user, index) => {
            const rank = index + 1;
            const rankData = getRankForXP(user.totalXP);
            const isCurrentUser = user.uid === myPlayerId;
            const iconColor = getIconColor(index);
            const iconPath = `ranking_icon/${iconColor}/${rankData.iconFile}`;

            let rankColor = '#94a3b8';
            if (index === 0) rankColor = '#fbbf24';
            else if (index >= 1 && index <= 2) rankColor = '#c0c0c0';
            else if (index >= 3 && index <= 9) rankColor = '#cd7f32';

            html += `
                <div class="ranking-item" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 15px; background: ${isCurrentUser ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.5)'}; border: 1px solid ${isCurrentUser ? 'rgba(255, 255, 255, 0.4)' : 'rgba(100, 116, 139, 0.2)'}; border-radius: 3px; opacity: 0;">
                    <div style="display: flex; align-items: center; gap: 15px; flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="font-family: 'Black Ops One'; font-size: 16px; color: ${rankColor}; min-width: 50px; text-align: center;">
                                #${rank}
                            </div>
                            <img src="${iconPath}" style="width: 24px; height: 24px; vertical-align: middle;" onerror="this.style.display='none'">
                        </div>
                        <div style="flex: 1;">
                            <div style="font-family: 'Orbitron'; font-size: 14px; color: ${isCurrentUser ? '#ffffff' : '#e2e8f0'}; font-weight: ${isCurrentUser ? 'bold' : 'normal'};">
                                ${user.name} ${isCurrentUser ? '(YOU)' : ''}
                            </div>
                            <div style="font-size: 10px; color: #94a3b8; font-family: 'Orbitron'; margin-top: 2px;">
                                ${rankData.name}
                            </div>
                        </div>
                    </div>
                    <div style="font-family: 'Orbitron'; font-size: 14px; color: #ffffff; font-weight: bold;">
                        ${user.pvpWins}W${user.pvpLosses}L(${user.winRate.toFixed(1)}%)
                    </div>
                </div>
            `;
        });

        rankingList.innerHTML = html;

        const rankingItems = document.querySelectorAll('.ranking-item');
        rankingItems.forEach((item, index) => {
            item.style.animation = `fadeIn 0.3s ease-out ${index * 0.05}s forwards`;
        });
    } catch (error) {
        console.error('[Ranking] Error loading PVP win rate data:', error);
        rankingList.innerHTML = '<div style="text-align: center; color: #ff4444; padding: 40px; font-family: \'Orbitron\'; font-size: 12px;">ERROR LOADING RANKING DATA</div>';
    }
}

let vocabRenderToken = 0;
const VOCAB_IOS_INITIAL_RENDER_COUNT = 80;
const VOCAB_IOS_RENDER_CHUNK_SIZE = 90;

function isIosNativeVocabRuntime() {
    return document.documentElement.classList.contains('capacitor-ios')
        || window.Capacitor?.getPlatform?.() === 'ios';
}

function getVocabRowSpeakText(item) {
    return String(item?.speak || item?.speakText || item?.en || '').trim();
}

function getReferenceExampleEnglish(example) {
    return String(example || '').replace(/\s*[（(][^（）()]*[）)]\s*$/u, '').trim();
}

function formatVocabExampleHtml(example) {
    const text = String(example || '').trim();
    if (!text) return '';
    const match = text.match(/^(.*?)(\s*[（(][^（）()]*[）)]\s*)$/u);
    if (!match) return `<span class="vocab-example-en">${escapeVocabHtml(text)}</span>`;
    return `
        <span class="vocab-example-en">${escapeVocabHtml(match[1].trim())}</span>
        <span class="vocab-example-ch">${escapeVocabHtml(match[2].trim())}</span>
    `;
}

function createVocabRow(item, index) {
    const row = document.createElement('div');
    row.classList.add('vocab-row');
    const example = item.example || item.ex || '';
    const isEnglishFirst = item.order === 'en-first' || item.layout === 'en-first';
    const rowSpeakText = getVocabRowSpeakText(item);
    const levelBadgeHtml = !example && item.levelLabel
        ? `<span class="vocab-example vocab-level-badge">${escapeVocabHtml(item.levelLabel)}</span>`
        : '';

    if (example || levelBadgeHtml) {
        row.classList.add('vocab-row-three-col');
    }
    if (isEnglishFirst) {
        row.classList.add('vocab-row-en-first');
    }
    if (item.rowClass) {
        String(item.rowClass).split(/\s+/).filter(Boolean).forEach(className => row.classList.add(className));
    }

    if (index < 20) {
        row.classList.add('vocab-row-entrance');
        row.style.setProperty('--vocab-row-delay', `${index * 0.05}s`);
        row.addEventListener('animationend', () => {
            row.classList.remove('vocab-row-entrance');
            row.style.removeProperty('--vocab-row-delay');
        }, { once: true });
    }

    if (rowSpeakText) {
        row.addEventListener('click', () => {
            if (item.speechMode === 'local-then-browser' &&
                typeof getVocabWordManifestAudioUrl === 'function' &&
                typeof window.speakText === 'function' &&
                !getVocabWordManifestAudioUrl(rowSpeakText)) {
                window.speakText(rowSpeakText, row);
                return;
            }
            speakVocabText(rowSpeakText, row);
        });
    }

    const exampleHtml = example ? `<span class="vocab-example">${formatVocabExampleHtml(example)}</span>` : '';
    row.innerHTML = isEnglishFirst
        ? `
            <span class="vocab-en vocab-ref-en">${escapeVocabHtml(item.en)}</span>
            <span class="vocab-ch vocab-ref-ch">${escapeVocabHtml(item.ch)}</span>
            ${exampleHtml || levelBadgeHtml}
        `
        : `
            <span class="vocab-ch">${escapeVocabHtml(item.ch)}</span>
            <span class="vocab-en">${escapeVocabHtml(item.en)}</span>
            ${exampleHtml || levelBadgeHtml}
        `;

    const searchInput = document.getElementById('vocab-search-input');
    const filter = (searchInput?.value || '').toLowerCase();
    if (filter) {
        if (!getVocabItemSearchText(item).includes(filter)) {
            row.style.display = 'none';
        }
    }

    return row;
}

function appendVocabRows(listBody, rows, renderToken) {
    const sourceRows = Array.isArray(rows) ? rows : [];
    const shouldChunk = isIosNativeVocabRuntime() && sourceRows.length > VOCAB_IOS_INITIAL_RENDER_COUNT;
    const initialCount = shouldChunk ? VOCAB_IOS_INITIAL_RENDER_COUNT : sourceRows.length;

    const appendRange = (start, end) => {
        if (renderToken !== vocabRenderToken) return;
        const fragment = document.createDocumentFragment();
        for (let index = start; index < end; index++) {
            fragment.appendChild(createVocabRow(sourceRows[index], index));
        }
        listBody.appendChild(fragment);
    };

    appendRange(0, initialCount);

    if (!shouldChunk || initialCount >= sourceRows.length) return;

    let nextIndex = initialCount;
    const appendNextChunk = () => {
        if (renderToken !== vocabRenderToken) return;
        const end = Math.min(nextIndex + VOCAB_IOS_RENDER_CHUNK_SIZE, sourceRows.length);
        appendRange(nextIndex, end);
        nextIndex = end;
        if (nextIndex < sourceRows.length) {
            requestAnimationFrame(appendNextChunk);
        }
    };

    requestAnimationFrame(appendNextChunk);
}

function prepareVocabListRender(listBody, options = {}) {
    const renderToken = ++vocabRenderToken;
    listBody.innerHTML = '';
    listBody.scrollTop = 0;

    if (options.clearSearch !== false) {
        const searchInput = document.getElementById('vocab-search-input');
        if (searchInput) searchInput.value = '';
        hideVocabSearchKeyboard();
    }

    return renderToken;
}

function renderVocabList(level, isSilent = false) {
    const listBody = document.getElementById('vocab-list-body');
    const isFirstLoad = listBody.innerHTML === '';

    if (!isFirstLoad && !isSilent) {
        if (typeof playSound === 'function') playSound('level-select-sfx');
    }

    activeVocabListLevel = level;
    setActiveVocabListTab(level);
    setVocabListHeaderLabels();

    const renderToken = prepareVocabListRender(listBody);

    const data = VOCAB_DB[level];
    if (!data) return;

    appendVocabRows(listBody, data, renderToken);
}

function renderCustomVocabList(rows) {
    const listBody = document.getElementById('vocab-list-body');
    if (!listBody) return;

    const renderToken = prepareVocabListRender(listBody);
    appendVocabRows(listBody, rows, renderToken);
}

function filterVocabList() {
    const input = document.getElementById('vocab-search-input');
    const listBody = document.getElementById('vocab-list-body');
    if (!input || !listBody || vocabScreenMode !== 'default') {
        const filter = input?.value?.toLowerCase?.() || '';
        document.querySelectorAll('.vocab-row').forEach(row => {
            const enText = row.querySelector('.vocab-en')?.innerText.toLowerCase() || '';
            const chText = row.querySelector('.vocab-ch')?.innerText.toLowerCase() || '';
            const exampleText = row.querySelector('.vocab-example')?.innerText.toLowerCase() || '';
            row.style.display = enText.includes(filter) || chText.includes(filter) || exampleText.includes(filter) ? '' : 'none';
        });
        return;
    }

    const filter = input.value.trim().toLowerCase();
    if (!filter) {
        renderVocabList(activeVocabListLevel, true);
        return;
    }

    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    setVocabListHeaderLabels('TARGET (CH)', 'CODE (EN)', 'LEVEL');
    const renderToken = prepareVocabListRender(listBody, { clearSearch: false });
    appendVocabRows(listBody, getAllVocabSearchRows(filter), renderToken);
}

function openVocabScreen() {
    playSound('open-room-sfx');
    if (typeof restoreStageVocabBgm === 'function') restoreStageVocabBgm();
    if (typeof requestBgmDuck === 'function') requestBgmDuck('code-list', 250);

    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    document.getElementById('start-screen').style.display = 'none';
    const vocabScreen = document.getElementById('vocab-screen');
    if (vocabScreen) vocabScreen.classList.remove('stage-preview', 'grammar-reference-preview', 'grammar-reference-three-col', 'grammar-reference-two-col-en-first', 'grammar-reference-infinitive', 'grammar-reference-notes', 'grammar-reference-pronoun-table');
    setVocabReferenceTabs();
    setVocabListHeaderLabels();
    document.getElementById('vocab-screen').style.display = 'flex';
    renderVocabList('L1', true);
    setupVocabSearchKeyboard();
}

function openStageVocabPreview(levelKey, stageWords, previewTitle) {
    playSound('open-room-sfx');
    if (typeof duckStageVocabBgm === 'function') duckStageVocabBgm();

    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    const stageScreen = document.getElementById('stage-screen');
    if (stageScreen) stageScreen.style.display = 'none';

    const vocabScreen = document.getElementById('vocab-screen');
    const tabs = document.querySelector('.vocab-tabs');
    const searchContainer = document.querySelector('.vocab-search-container');
    const title = document.querySelector('#vocab-screen .tech-title');
    const subtitle = document.querySelector('#vocab-screen .tech-subtitle');

    vocabScreenMode = 'stage-preview';
    vocabPreviewRows = Array.isArray(stageWords) ? [...stageWords] : [];
    vocabPreviewReturnScreen = 'stage';
    vocabPreviewTitle = previewTitle || `${levelKey} STAGE PREVIEW`;
    vocabPreviewSubtitle = 'STAGE INFORMATION';

    if (title) title.innerText = vocabPreviewTitle;
    if (subtitle) subtitle.innerText = vocabPreviewSubtitle;
    if (tabs) tabs.style.display = 'none';
    if (searchContainer) searchContainer.style.display = 'none';
    setVocabListHeaderLabels();
    if (vocabScreen) {
        vocabScreen.classList.remove('grammar-reference-preview', 'grammar-reference-three-col', 'grammar-reference-two-col-en-first', 'grammar-reference-infinitive', 'grammar-reference-notes', 'grammar-reference-pronoun-table');
        vocabScreen.classList.add('stage-preview');
        vocabScreen.style.display = 'flex';
    }
    renderCustomVocabList(vocabPreviewRows);
    setupVocabSearchKeyboard();
}

window.openStageVocabPreview = openStageVocabPreview;

function getPhrasalVerbReferenceRows() {
    const bank = Array.isArray(window.GRAMMAR_PHRASAL_VERB_BANK) ? window.GRAMMAR_PHRASAL_VERB_BANK : [];
    const seen = new Set();
    return bank
        .map((item) => ({
            ch: String(item.explanation || '').split('=')[1]?.trim() || item.chinese || '',
            en: String(item.explanation || '').split('=')[0]?.trim() ||
                String(item.answer || item.options?.[item.correctIndex] || '').trim(),
            speechMode: 'local-then-browser',
            order: 'en-first'
        }))
        .filter((item) => {
            const key = `${item.en.toLowerCase()}|${item.ch}`;
            if (!item.en || !item.ch || seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .sort((a, b) => a.en.localeCompare(b.en, 'en', { sensitivity: 'base' }));
}

function openGrammarPhrasalVerbReferenceScreen() {
    if (typeof playSound === 'function') playSound('open-room-sfx');
    if (typeof duckStageVocabBgm === 'function') duckStageVocabBgm();

    const grammarTopicScreen = document.getElementById('grammar-topic-screen');
    if (grammarTopicScreen) grammarTopicScreen.style.display = 'none';

    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    const vocabScreen = document.getElementById('vocab-screen');
    const tabs = document.querySelector('.vocab-tabs');
    const searchContainer = document.querySelector('.vocab-search-container');
    const title = document.querySelector('#vocab-screen .tech-title');
    const subtitle = document.querySelector('#vocab-screen .tech-subtitle');

    vocabScreenMode = 'grammar-reference';
    vocabPreviewRows = getPhrasalVerbReferenceRows();
    vocabPreviewReturnScreen = 'grammar-topic';
    vocabPreviewTitle = 'PHRASAL VERB';
    vocabPreviewSubtitle = 'REFERENCE VOCAB LIST';

    if (title) title.innerText = vocabPreviewTitle;
    if (subtitle) subtitle.innerText = vocabPreviewSubtitle;
    setVocabReferenceTabs();
    if (tabs) tabs.style.display = 'none';
    if (searchContainer) searchContainer.style.display = 'flex';
    setVocabListHeaderLabels('CODE (EN)', 'MEANING (CH)');
    if (vocabScreen) {
        vocabScreen.classList.remove('stage-preview', 'grammar-reference-three-col', 'grammar-reference-infinitive', 'grammar-reference-notes', 'grammar-reference-pronoun-table');
        vocabScreen.classList.add('grammar-reference-preview', 'grammar-reference-two-col-en-first');
        vocabScreen.style.display = 'flex';
    }
    renderCustomVocabList(vocabPreviewRows);
    setupVocabSearchKeyboard();
}

window.openGrammarPhrasalVerbReferenceScreen = openGrammarPhrasalVerbReferenceScreen;

function getCompoundAdjReferenceRows() {
    const bank = Array.isArray(window.GRAMMAR_COMPOUND_ADJ_BANK) ? window.GRAMMAR_COMPOUND_ADJ_BANK : [];
    const seen = new Set();
    return bank
        .map((item) => {
            const explanation = String(item.explanation || '').trim();
            const [rawEn, ...rawChParts] = explanation.split(':');
            const en = rawEn.trim() ||
                String(item.question || '').replace(/_{2,}/g, String(item.answer || '')).trim();
            return {
                ch: cleanCompoundAdjReferenceMeaning(en, rawChParts.join(':').trim() || item.chinese || ''),
                en,
                speak: getCompoundAdjReferenceSpeakText(en),
                order: 'en-first'
            };
        })
        .filter((item) => {
            const key = getCompoundAdjReferenceKey(item.en);
            if (!item.en || !item.ch || seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .sort((a, b) => a.en.localeCompare(b.en, 'en', { sensitivity: 'base' }));
}

function openGrammarCompoundAdjReferenceScreen() {
    if (typeof playSound === 'function') playSound('open-room-sfx');
    if (typeof duckStageVocabBgm === 'function') duckStageVocabBgm();

    const grammarTopicScreen = document.getElementById('grammar-topic-screen');
    if (grammarTopicScreen) grammarTopicScreen.style.display = 'none';

    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    const vocabScreen = document.getElementById('vocab-screen');
    const tabs = document.querySelector('.vocab-tabs');
    const searchContainer = document.querySelector('.vocab-search-container');
    const title = document.querySelector('#vocab-screen .tech-title');
    const subtitle = document.querySelector('#vocab-screen .tech-subtitle');

    vocabScreenMode = 'grammar-reference';
    vocabPreviewRows = getCompoundAdjReferenceRows();
    vocabPreviewReturnScreen = 'grammar-topic';
    vocabPreviewTitle = 'COMPOUND ADJ';
    vocabPreviewSubtitle = 'REFERENCE VOCAB LIST';

    if (title) title.innerText = vocabPreviewTitle;
    if (subtitle) subtitle.innerText = vocabPreviewSubtitle;
    setVocabReferenceTabs();
    if (tabs) tabs.style.display = 'none';
    if (searchContainer) searchContainer.style.display = 'flex';
    setVocabListHeaderLabels('CODE (EN)', 'MEANING (CH)');
    if (vocabScreen) {
        vocabScreen.classList.remove('stage-preview', 'grammar-reference-three-col', 'grammar-reference-infinitive', 'grammar-reference-notes', 'grammar-reference-pronoun-table');
        vocabScreen.classList.add('grammar-reference-preview', 'grammar-reference-two-col-en-first');
        vocabScreen.style.display = 'flex';
    }
    renderCustomVocabList(vocabPreviewRows);
    setupVocabSearchKeyboard();
}

window.openGrammarCompoundAdjReferenceScreen = openGrammarCompoundAdjReferenceScreen;

function getInfinitiveGerundReferenceRows(category = grammarInfinitiveGerundReferenceCategory) {
    const group = GRAMMAR_INFINITIVE_GERUND_REFERENCE_GROUPS[category] ||
        GRAMMAR_INFINITIVE_GERUND_REFERENCE_GROUPS.ving;
    return group.rows
        .map((item) => ({
            ch: item.ch,
            en: item.en,
            ex: item.ex,
            speak: getReferenceExampleEnglish(item.ex) || item.en,
            order: 'en-first',
            rowClass: 'vocab-row-infinitive-reference'
        }))
        .sort((a, b) => a.en.localeCompare(b.en, 'en', { sensitivity: 'base' }));
}

function renderInfinitiveGerundReferenceCategory(category = 'ving') {
    grammarInfinitiveGerundReferenceCategory = GRAMMAR_INFINITIVE_GERUND_REFERENCE_GROUPS[category] ? category : 'ving';
    setVocabReferenceTabs(Object.entries(GRAMMAR_INFINITIVE_GERUND_REFERENCE_GROUPS).map(([key, group]) => ({
        label: group.label,
        active: key === grammarInfinitiveGerundReferenceCategory,
        onclick: `renderInfinitiveGerundReferenceCategory('${key}')`
    })));
    renderCustomVocabList(getInfinitiveGerundReferenceRows(grammarInfinitiveGerundReferenceCategory));
}

function openGrammarInfinitiveGerundReferenceScreen() {
    if (typeof playSound === 'function') playSound('open-room-sfx');
    if (typeof duckStageVocabBgm === 'function') duckStageVocabBgm();

    const grammarTopicScreen = document.getElementById('grammar-topic-screen');
    if (grammarTopicScreen) grammarTopicScreen.style.display = 'none';

    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    const vocabScreen = document.getElementById('vocab-screen');
    const tabs = document.querySelector('.vocab-tabs');
    const searchContainer = document.querySelector('.vocab-search-container');
    const title = document.querySelector('#vocab-screen .tech-title');
    const subtitle = document.querySelector('#vocab-screen .tech-subtitle');

    vocabScreenMode = 'grammar-reference';
    vocabPreviewReturnScreen = 'grammar-topic';
    vocabPreviewTitle = 'INFINITIVE / GERUND';
    vocabPreviewSubtitle = 'REFERENCE VOCAB LIST';
    grammarInfinitiveGerundReferenceCategory = 'ving';

    if (title) title.innerText = vocabPreviewTitle;
    if (subtitle) subtitle.innerText = vocabPreviewSubtitle;
    if (tabs) tabs.style.display = 'flex';
    if (searchContainer) searchContainer.style.display = 'flex';
    setVocabListHeaderLabels('WORD (EN)', 'MEANING (CH)', 'EXAMPLE');
    if (vocabScreen) {
        vocabScreen.classList.remove('stage-preview', 'grammar-reference-two-col-en-first', 'grammar-reference-notes', 'grammar-reference-pronoun-table');
        vocabScreen.classList.add('grammar-reference-preview', 'grammar-reference-three-col', 'grammar-reference-infinitive');
        vocabScreen.style.display = 'flex';
    }
    renderInfinitiveGerundReferenceCategory('ving');
    setupVocabSearchKeyboard();
}

window.renderInfinitiveGerundReferenceCategory = renderInfinitiveGerundReferenceCategory;
window.openGrammarInfinitiveGerundReferenceScreen = openGrammarInfinitiveGerundReferenceScreen;

function renderConditionalReferenceCategory(category = '0') {
    grammarConditionalReferenceCategory = GRAMMAR_CONDITIONAL_REFERENCE_GROUPS[category] ? category : '0';
    const group = GRAMMAR_CONDITIONAL_REFERENCE_GROUPS[grammarConditionalReferenceCategory];
    const listBody = document.getElementById('vocab-list-body');
    if (!listBody) return;

    setVocabReferenceTabs(Object.entries(GRAMMAR_CONDITIONAL_REFERENCE_GROUPS).map(([key, item]) => ({
        label: item.label,
        active: key === grammarConditionalReferenceCategory,
        onclick: `renderConditionalReferenceCategory('${key}')`
    })));

    const renderToken = prepareVocabListRender(listBody);
    if (renderToken !== vocabRenderToken) return;

    listBody.innerHTML = group.sections.map((section, index) => `
        <section class="tense-note-card vocab-row-entrance" style="--vocab-row-delay:${index * 0.05}s">
            <div class="tense-note-head">
                <span class="tense-note-index">${String(index + 1).padStart(2, '0')}</span>
                <h3>${escapeVocabHtml(section.title)}</h3>
            </div>
            <div class="tense-note-formula">${highlightTenseNoteText(section.formula)}</div>
            ${renderTenseNoteBody(section)}
        </section>
    `).join('');
}

function openGrammarConditionalReferenceScreen() {
    if (typeof playSound === 'function') playSound('open-room-sfx');
    if (typeof duckStageVocabBgm === 'function') duckStageVocabBgm();

    const grammarTopicScreen = document.getElementById('grammar-topic-screen');
    if (grammarTopicScreen) grammarTopicScreen.style.display = 'none';

    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    const vocabScreen = document.getElementById('vocab-screen');
    const tabs = document.querySelector('.vocab-tabs');
    const searchContainer = document.querySelector('.vocab-search-container');
    const title = document.querySelector('#vocab-screen .tech-title');
    const subtitle = document.querySelector('#vocab-screen .tech-subtitle');

    vocabScreenMode = 'grammar-reference';
    vocabPreviewReturnScreen = 'grammar-topic';
    vocabPreviewTitle = 'CONDITIONALS';
    vocabPreviewSubtitle = 'TACTICAL GRAMMAR NOTES';
    grammarConditionalReferenceCategory = '0';

    if (title) title.innerText = vocabPreviewTitle;
    if (subtitle) subtitle.innerText = vocabPreviewSubtitle;
    if (tabs) tabs.style.display = 'flex';
    if (searchContainer) searchContainer.style.display = 'none';
    setVocabListHeaderLabels();
    if (vocabScreen) {
        vocabScreen.classList.remove('stage-preview', 'grammar-reference-three-col', 'grammar-reference-two-col-en-first', 'grammar-reference-infinitive', 'grammar-reference-pronoun-table');
        vocabScreen.classList.add('grammar-reference-preview', 'grammar-reference-notes');
        vocabScreen.style.display = 'flex';
    }
    renderConditionalReferenceCategory('0');
    setupVocabSearchKeyboard();
}

function renderTenseReferenceCategory(category = 'active') {
    grammarTenseReferenceCategory = GRAMMAR_TENSE_REFERENCE_GROUPS[category] ? category : 'active';
    const group = GRAMMAR_TENSE_REFERENCE_GROUPS[grammarTenseReferenceCategory];
    const listBody = document.getElementById('vocab-list-body');
    if (!listBody) return;

    setVocabReferenceTabs(Object.entries(GRAMMAR_TENSE_REFERENCE_GROUPS).map(([key, item]) => ({
        label: item.label,
        active: key === grammarTenseReferenceCategory,
        onclick: `renderTenseReferenceCategory('${key}')`
    })));

    const renderToken = prepareVocabListRender(listBody);
    if (renderToken !== vocabRenderToken) return;

    listBody.innerHTML = group.sections.map((section, index) => `
        <section class="tense-note-card vocab-row-entrance" style="--vocab-row-delay:${index * 0.05}s">
            <div class="tense-note-head">
                <span class="tense-note-index">${String(index + 1).padStart(2, '0')}</span>
                <h3>${escapeVocabHtml(section.title)}</h3>
            </div>
            <div class="tense-note-formula">${highlightTenseNoteText(section.formula)}</div>
            ${renderTenseNoteBody(section)}
        </section>
    `).join('');
}

function openGrammarTenseReferenceScreen() {
    if (typeof playSound === 'function') playSound('open-room-sfx');
    if (typeof duckStageVocabBgm === 'function') duckStageVocabBgm();

    const grammarTopicScreen = document.getElementById('grammar-topic-screen');
    if (grammarTopicScreen) grammarTopicScreen.style.display = 'none';

    const suppliesDisplay = document.getElementById('coins-display');
    if (suppliesDisplay) {
        suppliesDisplay.style.display = 'none';
    }

    const vocabScreen = document.getElementById('vocab-screen');
    const tabs = document.querySelector('.vocab-tabs');
    const searchContainer = document.querySelector('.vocab-search-container');
    const title = document.querySelector('#vocab-screen .tech-title');
    const subtitle = document.querySelector('#vocab-screen .tech-subtitle');

    vocabScreenMode = 'grammar-reference';
    vocabPreviewReturnScreen = 'grammar-topic';
    vocabPreviewTitle = 'TENSES';
    vocabPreviewSubtitle = 'TACTICAL GRAMMAR NOTES';
    grammarTenseReferenceCategory = 'active';

    if (title) title.innerText = vocabPreviewTitle;
    if (subtitle) subtitle.innerText = vocabPreviewSubtitle;
    if (tabs) tabs.style.display = 'flex';
    if (searchContainer) searchContainer.style.display = 'none';
    setVocabListHeaderLabels();
    if (vocabScreen) {
        vocabScreen.classList.remove('stage-preview', 'grammar-reference-three-col', 'grammar-reference-two-col-en-first', 'grammar-reference-infinitive', 'grammar-reference-pronoun-table');
        vocabScreen.classList.add('grammar-reference-preview', 'grammar-reference-notes');
        vocabScreen.style.display = 'flex';
    }
    renderTenseReferenceCategory('active');
    setupVocabSearchKeyboard();
}

window.renderConditionalReferenceCategory = renderConditionalReferenceCategory;
window.openGrammarConditionalReferenceScreen = openGrammarConditionalReferenceScreen;
window.renderTenseReferenceCategory = renderTenseReferenceCategory;
window.openGrammarTenseReferenceScreen = openGrammarTenseReferenceScreen;
window.openGrammarPronounReferenceScreen = openGrammarPronounReferenceScreen;
window.openGrammarParticiplePhrasesReferenceScreen = openGrammarParticiplePhrasesReferenceScreen;
window.openGrammarQuestionTagReferenceScreen = openGrammarQuestionTagReferenceScreen;
window.openGrammarDeStructureReferenceScreen = openGrammarDeStructureReferenceScreen;
window.openGrammarReportedSpeechReferenceScreen = openGrammarReportedSpeechReferenceScreen;
window.openGrammarItIsReferenceScreen = openGrammarItIsReferenceScreen;
window.openGrammarDirectQuestionReferenceScreen = openGrammarDirectQuestionReferenceScreen;
window.openGrammarIndirectQuestionReferenceScreen = openGrammarIndirectQuestionReferenceScreen;
window.openGrammarInversionReferenceScreen = openGrammarInversionReferenceScreen;
window.renderPrepositionPlaceReferenceCategory = renderPrepositionPlaceReferenceCategory;
window.openGrammarPrepositionPlaceReferenceScreen = openGrammarPrepositionPlaceReferenceScreen;
window.openGrammarPrepositionTimeReferenceScreen = openGrammarPrepositionTimeReferenceScreen;
window.openGrammarComparativeSuperlativeReferenceScreen = openGrammarComparativeSuperlativeReferenceScreen;


function setupVocabSearchKeyboard() {
    const input = getVocabSearchInput();
    const keyboard = getVocabKeyboard();
    const searchContainer = document.querySelector('.vocab-search-container');
    if (!input || !keyboard) return;

    input.setAttribute('readonly', 'readonly');
    input.setAttribute('inputmode', 'none');

    if (keyboard.dataset.bound === 'true') return;
    keyboard.dataset.bound = 'true';

    input.addEventListener('focus', showVocabSearchKeyboard);
    input.addEventListener('click', showVocabSearchKeyboard);
    input.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        showVocabSearchKeyboard();
    });
    input.addEventListener('touchstart', (event) => {
        event.preventDefault();
        showVocabSearchKeyboard();
    }, { passive: false });

    if (searchContainer) {
        searchContainer.addEventListener('pointerdown', (event) => {
            event.preventDefault();
            showVocabSearchKeyboard();
        });
    }

    keyboard.addEventListener('click', (event) => {
        const key = event.target.closest('.kb-key');
        if (!key) return;
        event.preventDefault();
        event.stopPropagation();
        handleVocabKeyboardInput(key.getAttribute('data-vocab-key'));
    });

    keyboard.addEventListener('touchstart', (event) => {
        const key = event.target.closest('.kb-key');
        if (!key) return;
        key.classList.add('kb-active');
    }, { passive: true });

    keyboard.addEventListener('touchend', (event) => {
        const key = event.target.closest('.kb-key');
        if (!key) return;
        setTimeout(() => key.classList.remove('kb-active'), 100);
    }, { passive: true });

    keyboard.addEventListener('touchcancel', (event) => {
        const key = event.target.closest('.kb-key');
        if (!key) return;
        key.classList.remove('kb-active');
    }, { passive: true });
}

document.addEventListener('DOMContentLoaded', setupVocabSearchKeyboard);

window.addEventListener('resize', () => {
    if (vocabSearchKeyboardActive) updateVocabKeyboardLayout();
});

if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
        if (vocabSearchKeyboardActive) updateVocabKeyboardLayout();
    });
}

document.addEventListener('keydown', (event) => {
    if (!vocabSearchKeyboardActive) return;
    const vocabScreen = document.getElementById('vocab-screen');
    if (!vocabScreen || vocabScreen.style.display === 'none') return;

    if (/^[a-z0-9]$/i.test(event.key)) {
        event.preventDefault();
        handleVocabKeyboardInput(event.key);
    } else if (event.key === ' ') {
        event.preventDefault();
        handleVocabKeyboardInput(' ');
    } else if (event.key === 'Backspace') {
        event.preventDefault();
        handleVocabKeyboardInput('BACKSPACE');
    } else if (event.key === 'Enter' || event.key === 'Escape') {
        event.preventDefault();
        handleVocabKeyboardInput('ENTER');
    }
});
