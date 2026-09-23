function reviewedChoice(acceptedAnswers, explanation, corrections = {}) {
  return Object.freeze({
    acceptedAnswers: Object.freeze(acceptedAnswers),
    explanation,
    reviewNote:
      'Reviewed 2026-09-17: listed alternatives are grammatical and preserve the supplied Chinese meaning.',
    ...corrections,
  });
}

const reviewedPlaceAlternatives = Object.freeze({
  preposition_place_008: reviewedChoice(['at', 'in'], '⭐ 規則：at the station 強調地點；in the station 強調在車站內，兩者在此都成立。'),
  preposition_place_010: reviewedChoice(['on', 'in'], '⭐ 規則：on Nathan Road 常見於美式英語；in Nathan Road 亦見於英式／香港英語。'),
  preposition_place_012: reviewedChoice(['in', 'on'], '⭐ 規則：in the street 和 on the street 都可表示在街上，視英美用法而異。'),
  preposition_place_016: reviewedChoice(['at', 'in'], '⭐ 規則：at school 指身處／上學；in school 亦可表示正在學校或就學。'),
  preposition_place_017: reviewedChoice(['in', 'at'], '⭐ 規則：in the park 強調園內；at the park 強調公園這個地點。'),
  preposition_place_019: reviewedChoice(['at', 'by'], '⭐ 規則：at the entrance 和 by the entrance 都可表示在入口附近。'),
  preposition_place_028: reviewedChoice(['into', 'in'], '⭐ 規則：pour water into the glass 強調方向；pour water in the glass 亦是自然用法。'),
  preposition_place_029: reviewedChoice(['out of', 'from'], '⭐ 規則：take the book out of the bag 強調移出；from the bag 亦表示從袋中取出。'),
  preposition_place_031: reviewedChoice(['on', 'by'], '⭐ 規則：travel on a plane 描述身處飛機；travel by plane 描述交通方式。'),
  preposition_place_033: reviewedChoice(['on', 'in'], '⭐ 規則：on the train 是常見搭乘說法；in the train 亦可描述人在車廂內。'),
  preposition_place_040: reviewedChoice(['below', 'under'], '⭐ 規則：below zero 和 under zero 都可表示低於零度。'),
  preposition_place_043: reviewedChoice(['opposite', 'facing'], '⭐ 規則：opposite the post office 表示在對面；facing the post office 亦可表示面向它。'),
  preposition_place_044: reviewedChoice(['next', 'close', 'near'], '⭐ 規則：next to 最貼近；close to 和 near to 在此亦可表示附近。'),
  preposition_place_055: reviewedChoice(['around', 'round'], '⭐ 規則：around the building 和 round the building 都可表示繞着建築物。'),
  preposition_place_056: reviewedChoice(['in', 'at'], '⭐ 規則：in the corner 強調角落內；at the corner 亦可指出角落位置。'),
  preposition_place_057: reviewedChoice(['at', 'by', 'on'], '⭐ 規則：at/by the corner 都表示在街角附近；on the corner 亦是常見位置說法。'),
  preposition_place_058: reviewedChoice(['at', 'on'], '⭐ 規則：at the top of the page 和 on the top of the page 在此都可指出頁面上方位置。'),
  preposition_place_081: reviewedChoice(['at', 'by'], '⭐ 規則：at the bus stop 和 by the bus stop 都可表示在巴士站位置。'),
  preposition_place_083: reviewedChoice(['in', 'on'], '⭐ 規則：in the street 和 on the street 都可表示在街上玩。'),
  preposition_place_088: reviewedChoice(['over', 'on'], '⭐ 規則：put a blanket over the child 強調覆蓋；on the child 亦可表示把毛氈放在孩子身上。'),
  preposition_place_089: reviewedChoice(['under', 'below', 'in'], '⭐ 規則：under/below the water 強調水面以下；in the water 亦描述潛艇所在位置。'),
  preposition_place_090: reviewedChoice(['below', 'under'], '⭐ 規則：below mine 和 under mine 都可表示樓層位置較低。'),
  preposition_place_102: reviewedChoice(['around', 'round'], '⭐ 規則：around the house 和 round the house 都可表示圍繞房屋。'),
  preposition_place_103: reviewedChoice(['by', 'at'], '⭐ 規則：sit by the fire 是常見說法；sit at the fire 亦可表示坐在火爐旁。'),
  preposition_place_105: reviewedChoice(['close', 'near', 'next'], '⭐ 規則：close to、near to 和 next to 都可配合句中的 to 表示鄰近。'),
  preposition_place_108: reviewedChoice(['among', 'in'], '⭐ 規則：among the crowd 強調在人群之間；in the crowd 亦表示在人群中。'),
  preposition_place_110: reviewedChoice(['under', 'below'], '⭐ 規則：under the bed 是常見說法；below the bed 亦可表示在床的下方。'),
  preposition_place_114: reviewedChoice(['at', 'in'], '⭐ 規則：at the cinema 強調地點／活動；in the cinema 強調在戲院內。'),
  preposition_place_123: reviewedChoice(['at', 'on'], '⭐ 規則：at the bottom of the page 和 on the bottom of the page 在此都指出頁面底部。'),
  preposition_place_127: reviewedChoice(['at', 'in'], '⭐ 規則：at the front of the queue 是常見搭配；in the front of the queue 亦可表示在隊伍前段。'),
  preposition_place_131: reviewedChoice(['in', 'at'], '⭐ 規則：work in an office 強調辦公室內；work at an office 亦可指工作地點。'),
  preposition_place_135: reviewedChoice(['by', 'at'], '⭐ 規則：by the door 強調門旁；at the door 亦可表示門口位置。'),
  preposition_place_137: reviewedChoice(['across', 'over'], '⭐ 規則：walk across the grass 強調橫過；walk over the grass 亦可表示走過草地。'),
  preposition_place_141: reviewedChoice(['around', 'round'], '⭐ 規則：go around the sun 和 go round the sun 都可表示環繞太陽。'),
  preposition_place_142: reviewedChoice(['around', 'round', 'about'], '⭐ 規則：walk around/round/about the room 都可表示在房內來回走動。'),
  preposition_place_147: reviewedChoice(['around', 'round'], '⭐ 規則：turn around 和 turn round 都可表示轉身。'),
  preposition_place_157: reviewedChoice(['at', 'by'], '⭐ 規則：at the bus stop 和 by the bus stop 都可表示在巴士站附近會面。'),
  preposition_place_158: reviewedChoice(['at', 'by'], '⭐ 規則：at the traffic lights 和 by the traffic lights 都可表示在交通燈位置等候。'),
  preposition_place_169: reviewedChoice(['over', 'above'], '⭐ 規則：over the house 強調飛越；above the house 亦表示在房屋上空。'),
  preposition_place_171: reviewedChoice(['on', 'in'], '⭐ 規則：get on the boat 常用於較大船隻；get in the boat 常用於較小船隻。'),
  preposition_place_174: reviewedChoice(['across', 'through'], '⭐ 規則：across the park 強調由一邊到另一邊；through the park 亦可表示穿過公園。'),
  preposition_place_177: reviewedChoice(['below', 'under'], '⭐ 規則：below freezing 和 under freezing 都可表示低於冰點。'),
  preposition_place_179: reviewedChoice(['under', 'below'], '⭐ 規則：under the mat 是常見說法；below the mat 亦可表示位置在墊下。'),
  preposition_place_184: reviewedChoice(['at', 'to'], '⭐ 規則：point at 強調指向動作；point to 亦可表示指出該圖片。'),
  preposition_place_198: reviewedChoice(['at', 'in'], '⭐ 規則：sit at the back 和 sit in the back 都可表示坐在後方。'),
  preposition_place_199: reviewedChoice(['in', 'with'], '⭐ 規則：write in ink 是固定搭配；write with ink 亦可描述所用材料。'),
  preposition_place_200: reviewedChoice(['with', 'in'], '⭐ 規則：write with a pencil 強調工具；write in pencil 亦是常見寫法。'),
});

const reviewedPhrasalVerbAlternatives = Object.freeze({
  phrasal_verb_038: reviewedChoice(
    ['calm down', 'cool down'],
    'calm down 和 cool down 在此都可表示先冷靜／平靜下來。',
  ),
  phrasal_verb_039: reviewedChoice(
    ['cheer up'],
    'cheer up + 名詞，或 cheer + 代名詞 + up。此題改用名詞受詞，避免錯誤的 cheer up you。',
    {
      question: 'Do not be sad. I will try to ______ my friend.',
      chinese: '別傷心，我會努力令朋友開心起來。',
      reviewNote:
        'Reviewed 2026-09-17: corrected an invalid separable-pronoun construction; no extra answer added.',
    },
  ),
  phrasal_verb_090: reviewedChoice(
    ['cool down', 'calm down'],
    '運動後 cool down 指放鬆整理；calm down 在「平靜下來」意思下亦符合句子。',
  ),
});

const reviewedCompoundAdjectiveAlternatives = Object.freeze({
  compound_adj_015: reviewedChoice(['with', 'of'], 'careful with 強調小心處理；careful of 亦可表示提防熱水。'),
  compound_adj_026: reviewedChoice(['with', 'by'], 'confronted with 強調面對情況；confronted by 亦可表示被一群示威者迎面堵住。'),
  compound_adj_028: reviewedChoice(['with', 'to'], 'connected with 和 connected to 在此都可表示兩者有關連。'),
  compound_adj_032: reviewedChoice(['with', 'by'], 'crowded with 是常見搭配；crowded by 亦可按被動結構表示被食客擠滿。'),
  compound_adj_037: reviewedChoice(['from', 'than'], 'different from 是標準常見寫法；different than 亦見於美式英語。'),
  compound_adj_048: reviewedChoice(['from', 'of'], 'free from worries 和 free of worries 都可表示沒有憂慮。'),
  compound_adj_049: reviewedChoice(['to', 'with'], 'friendly to tourists 和 friendly with tourists 在此都可表示對遊客友善。'),
  compound_adj_057: reviewedChoice(['of', 'about'], 'ignorant of 和 ignorant about political issues 都可表示對議題不了解。'),
  compound_adj_078: reviewedChoice(['with', 'among'], 'popular with teenagers 和 popular among teenagers 都是自然搭配。'),
  compound_adj_080: reviewedChoice(['in', 'at'], 'proficient in French 和 proficient at French 都可表示精通法語。'),
  compound_adj_091: reviewedChoice(['in', 'at'], 'skilful in graphic design 和 skilful at graphic design 都可表示擅長該技能。'),
  compound_adj_092: reviewedChoice(['for', 'about'], 'sorry for the inconvenience 和 sorry about the inconvenience 都是自然道歉說法。'),
  compound_adj_094: reviewedChoice(['in', 'at'], 'successful in improving 和 successful at improving 在此都可表示成功做到。'),
  compound_adj_097: reviewedChoice(['of', 'about'], 'sure of the route 和 sure about the route 都可表示確定路線。'),
  compound_adj_098: reviewedChoice(['of', 'about'], 'suspicious of 和 suspicious about the statements 都可表示有所懷疑。'),
  compound_adj_102: reviewedChoice(['to', 'for'], 'useful to web designers 和 useful for web designers 都可表示對設計師有用。'),
  compound_adj_103: reviewedChoice(['at', 'in'], 'weak at socializing 和 weak in socializing 都可表示不擅長社交。'),
  compound_adj_110: reviewedChoice(['at', 'in'], 'good at math 和 good in math 都是可見的英美地區用法。'),
  compound_adj_112: reviewedChoice(['about', 'for'], 'excited about the trip 是較正式寫法；excited for the trip 亦是常見口語。'),
  compound_adj_123: reviewedChoice(['for', 'about'], 'sorry for being late 和 sorry about being late 都可表達同一歉意。'),
  compound_adj_133: reviewedChoice(['to', 'with'], 'friendly to everyone 和 friendly with everyone 在此都可表示待人友善。'),
  compound_adj_134: reviewedChoice(['with', 'of'], 'bored with the game 是常見寫法；bored of the game 亦常見於英式口語。'),
  compound_adj_137: reviewedChoice(['at', 'in'], 'excellent at dancing 和 excellent in dancing 都可表示舞蹈出色。'),
  compound_adj_144: reviewedChoice(['at', 'by'], 'surprised at the news 和 surprised by the news 都是自然搭配。'),
  compound_adj_145: reviewedChoice(['at', 'by'], 'amazed at her talent 和 amazed by her talent 都是自然搭配。'),
  compound_adj_146: reviewedChoice(['with', 'at'], 'disappointed with the result 和 disappointed at the result 都可表示對結果失望。'),
  compound_adj_154: reviewedChoice(['about', 'of'], 'doubtful about his ability 和 doubtful of his ability 都可表示懷疑能力。'),
  compound_adj_157: reviewedChoice(['about', 'for'], 'excited about the holiday 是較正式寫法；excited for the holiday 亦是常見口語。'),
  compound_adj_158: reviewedChoice(['about', 'at', 'with'], 'annoyed about/at/with the noise 在此都可表示受噪音困擾。'),
  compound_adj_159: reviewedChoice(['with', 'at'], 'annoyed with me 和 annoyed at me 都可表示對我生氣。'),
  compound_adj_164: reviewedChoice(['of', 'about'], 'sure of the answer 和 sure about the answer 都可表示確定答案。'),
  compound_adj_165: reviewedChoice(['of', 'about'], 'certain of success 和 certain about success 都可表示確信會成功。'),
  compound_adj_169: reviewedChoice(['at', 'in'], 'present at the meeting 和 present in the meeting 都可表示人在會議中。'),
  compound_adj_173: reviewedChoice(
    ['with', 'about'],
    'delighted with the news 和 delighted about the news 都可表示對消息感到高興。',
    {
      question: 'She is delighted ______ the news.',
      reviewNote:
        'Reviewed 2026-09-17: corrected delightful (causing delight) to delighted (feeling delight), and added the natural about variant.',
    },
  ),
  compound_adj_174: reviewedChoice(['by', 'with'], 'impressed by his work 和 impressed with his work 都是自然搭配。'),
  compound_adj_175: reviewedChoice(['at', 'by'], 'shocked at the price 和 shocked by the price 都是自然搭配。'),
});

const reviewedComparativeAlternatives = Object.freeze({
  comparative_superlative_005: reviewedChoice(['further', 'farther'], 'further 和 farther 都可作 far 的比較級；抽象意思通常較常用 further。'),
  comparative_superlative_011: reviewedChoice(['farther', 'further'], 'farther 和 further 都可表示走得更遠。'),
  comparative_superlative_033: reviewedChoice(['the eldest', 'the oldest'], '在家庭成員中，the eldest 和 the oldest 都可表示最年長。'),
  comparative_superlative_036: reviewedChoice(['elder', 'older'], 'elder brother 和 older brother 都可表示哥哥。'),
  comparative_superlative_046: reviewedChoice(['calmer', 'more calm'], 'calmer 和 more calm 都是可接受的比較形式。'),
  comparative_superlative_052: reviewedChoice(['more', 'the most'], '缺少明確比較範圍時，more 可表示更多；語境指所有人之中最多時可用 the most。'),
  comparative_superlative_056: reviewedChoice(['easier', 'more convenient'], 'easier 和 more convenient 在此都符合令聯絡祖父更容易／方便的意思。'),
  comparative_superlative_060: reviewedChoice(['simpler', 'more simple'], 'simpler 和 more simple 都可作 simple 的比較級。'),
  comparative_superlative_061: reviewedChoice(['more easily', 'more comfortably'], 'more easily 和 more comfortably 都符合較容易／輕鬆操作的語境。'),
  comparative_superlative_064: reviewedChoice(['more comfortably', 'more easily'], 'more comfortably 和 more easily 都符合較舒適／容易閱讀的語境。'),
  comparative_superlative_068: reviewedChoice(['more convenient', 'easier'], 'more convenient 和 easier 都符合令撥號更方便／容易的意思。'),
  comparative_superlative_097: reviewedChoice(['more quickly', 'faster'], 'more quickly 和 faster 都可作比較副詞。'),
  comparative_superlative_116: reviewedChoice(['the quietest', 'the most quiet'], 'the quietest 是較常見形式；the most quiet 亦可接受。'),
  comparative_superlative_128: reviewedChoice(['clearer', 'more clear'], 'clearer 是較常見形式；more clear 亦可接受。'),
  comparative_superlative_129: reviewedChoice(['the clearest', 'the most clear'], 'the clearest 是較常見形式；the most clear 亦可接受。'),
  comparative_superlative_138: reviewedChoice(['farther', 'further'], 'farther 和 further 都可比較實際距離。'),
  comparative_superlative_139: reviewedChoice(['the farthest', 'the furthest'], 'the farthest 和 the furthest 都可表示最遠。'),
});

const reviewedInfinitiveGerundAlternatives = Object.freeze({
  infinitive_gerund_024: reviewedChoice(['go', 'going'], 'see him go 強調看見完整動作；see him going 強調看見動作進行中，中文在此兩者皆可。'),
  infinitive_gerund_032: reviewedChoice(['to rain', 'raining'], 'begin to rain 和 begin raining 都可表示開始下雨。'),
  infinitive_gerund_038: reviewedChoice(['to fix', 'fix'], 'help to fix 和 help fix 都是標準用法。'),
  infinitive_gerund_058: reviewedChoice(['to see', 'seeing'], "can't bear to see 和 can't bear seeing 都可表示無法忍受看見。"),
  infinitive_gerund_075: reviewedChoice(['stealing', 'having stolen'], 'admitted stealing 和 admitted having stolen 都可表示承認已偷錢。'),
  infinitive_gerund_079: reviewedChoice(['breaking', 'having broken'], 'denied breaking 和 denied having broken 都可表示否認已打破花瓶。'),
  infinitive_gerund_080: reviewedChoice(['waiting', 'to wait'], 'dislike waiting 和 dislike to wait 在此都可表示不喜歡等候。'),
  infinitive_gerund_097: reviewedChoice(['flying', 'fly'], 'look at the birds flying 強調進行中；look at the birds fly 亦可表示觀看牠們飛翔。'),
  infinitive_gerund_099: reviewedChoice(['laughing', 'but laugh'], "couldn't help laughing 和 couldn't help but laugh 都表示忍不住笑。"),
  infinitive_gerund_100: reviewedChoice(['waiting', 'to wait'], "can't stand waiting 和 can't stand to wait 都可表示受不了排隊。"),
  infinitive_gerund_107: reviewedChoice(['posting', 'having posted'], 'remember posting 和 remember having posted 都可表示記得已寄過信。'),
  infinitive_gerund_112: reviewedChoice(['turning', 'having turned'], 'remember turning off 和 remember having turned off 都可表示記得已關燈。'),
  infinitive_gerund_118: reviewedChoice(['saying', 'having said'], 'regret saying 和 regret having said 都可表示後悔已說過。'),
});

function reviewedVerb(forms, explanation) {
  return reviewedChoice([], explanation, forms);
}

function reviewedTokens(acceptedTokenSets, explanation) {
  return reviewedChoice([], explanation, { acceptedTokenSets });
}

const reviewedVerbFormAlternatives = Object.freeze({
  verb_bid_539a9a258cfe: reviewedVerb({ past: 'bid/bade', pp: 'bid/bidden' }, 'bid 表示出價時常用 bid-bid-bid；表示吩咐時亦可用 bade/bidden。'),
  verb_broadcast_b040d43e09ee: reviewedVerb({ past: 'broadcast/broadcasted', pp: 'broadcast/broadcasted' }, 'broadcast 和 broadcasted 都是標準過去式／過去分詞。'),
  verb_burn_274fae6c27b7: reviewedVerb({ past: 'burnt/burned', pp: 'burnt/burned' }, 'burnt 常見於英式英語；burned 常見於美式英語，兩者都正確。'),
  verb_dive_e9753cc44473: reviewedVerb({ past: 'dived/dove' }, 'dived 是英式及通用形式；dove 是常見美式過去式。'),
  verb_dream_2aaa497bdfb3: reviewedVerb({ past: 'dreamt/dreamed', pp: 'dreamt/dreamed' }, 'dreamt 和 dreamed 都是標準形式。'),
  verb_dwell_72d4d3fc62ad: reviewedVerb({ past: 'dwelt/dwelled', pp: 'dwelt/dwelled' }, 'dwelt 和 dwelled 都是標準形式。'),
  verb_fit_e75e718b4c75: reviewedVerb({ past: 'fit/fitted', pp: 'fit/fitted' }, 'fit 常指合身；fitted 亦常用於安裝／配備，符合題目詞義。'),
  verb_get_588a3e270241: reviewedVerb({ pp: 'got/gotten' }, 'got 是英式常用過去分詞；gotten 是美式英語常見形式。'),
  verb_kneel_294e27f39c8f: reviewedVerb({ past: 'knelt/kneeled', pp: 'knelt/kneeled' }, 'knelt 和 kneeled 都是標準形式。'),
  verb_lean_f7666041067e: reviewedVerb({ past: 'leant/leaned', pp: 'leant/leaned' }, 'leant 常見於英式英語；leaned 常見於美式英語。'),
  verb_leap_bf3d3a128c06: reviewedVerb({ past: 'leapt/leaped', pp: 'leapt/leaped' }, 'leapt 和 leaped 都是標準形式。'),
  verb_learn_91fcb76d7dec: reviewedVerb({ past: 'learnt/learned', pp: 'learnt/learned' }, 'learnt 常見於英式英語；learned 常見於美式英語。'),
  verb_practise_20bde8dab6ba: reviewedVerb({ present: 'practise/practice', past: 'practised/practiced', pp: 'practised/practiced', ing: 'practising/practicing' }, 'practise 是英式動詞拼法；practice 是美式動詞拼法，兩套變化都接受。'),
  verb_sew_58c5e1c023ba: reviewedVerb({ pp: 'sewn/sewed' }, 'sewn 和 sewed 都可作 sew 的過去分詞。'),
  verb_shine_c4678785c64e: reviewedVerb({ past: 'shone/shined', pp: 'shone/shined' }, 'shone 常指發光；shined 常指擦亮，題目詞義同時包括兩者。'),
  verb_shrink_e5a0f42cb856: reviewedVerb({ past: 'shrank/shrunk', pp: 'shrunk/shrunken' }, 'shrank/shrunk 可作過去式；shrunk/shrunken 可作過去分詞。'),
  verb_smell_642ec52d9f8c: reviewedVerb({ past: 'smelt/smelled', pp: 'smelt/smelled' }, 'smelt 常見於英式英語；smelled 常見於美式英語。'),
  verb_sow_6f368d33f08c: reviewedVerb({ pp: 'sown/sowed' }, 'sown 和 sowed 都可作 sow 的過去分詞。'),
  verb_speed_01947bf6dfee: reviewedVerb({ past: 'sped/speeded', pp: 'sped/speeded' }, 'sped 常用於一般加速；speeded 亦是標準形式。'),
  verb_spell_315a810c3854: reviewedVerb({ past: 'spelt/spelled', pp: 'spelt/spelled' }, 'spelt 常見於英式英語；spelled 常見於美式英語。'),
  verb_spill_48ea338f670c: reviewedVerb({ past: 'spilt/spilled', pp: 'spilt/spilled' }, 'spilt 常見於英式英語；spilled 常見於美式英語。'),
  verb_spit_ec34bc8727c6: reviewedVerb({ past: 'spat/spit', pp: 'spat/spit' }, 'spat 常見於英式英語；spit 是常見美式過去式／過去分詞。'),
  verb_spoil_669a90e49308: reviewedVerb({ past: 'spoilt/spoiled', pp: 'spoilt/spoiled' }, 'spoilt 常見於英式英語；spoiled 常見於美式英語。'),
  verb_spring_5ee7e421b4b4: reviewedVerb({ past: 'sprang/sprung' }, 'sprang 是傳統過去式；sprung 亦常見於現代用法。'),
  verb_stink_528cac308d5d: reviewedVerb({ past: 'stank/stunk' }, 'stank 和 stunk 都可作 stink 的過去式。'),
  verb_travel_e239864116a7: reviewedVerb({ past: 'travelled/traveled', pp: 'travelled/traveled', ing: 'travelling/traveling' }, '雙寫 l 是英式拼法；單寫 l 是美式拼法。'),
  verb_tread_cdb1de1b1e49: reviewedVerb({ pp: 'trodden/trod' }, 'trodden 是常見過去分詞；trod 亦可作過去分詞。'),
  verb_wake_b18cc9810933: reviewedVerb({ past: 'woke/waked', pp: 'woken/waked' }, 'woke/woken 最常見；waked 亦是標準但較少見。'),
  verb_weave_f2615585033d: reviewedVerb({ past: 'wove/weaved', pp: 'woven/weaved' }, 'wove/woven 常指編織；weaved 常指迂迴穿行，題目詞義包括兩者。'),
});

const reviewedPronounAlternatives = Object.freeze({
  pronoun_013: reviewedChoice(
    ['me', 'I'],
    'It was not me 是自然日常用法；It was not I 是正式、較傳統的主格用法。',
  ),
  pronoun_114: reviewedChoice(
    ['your'],
    'one of 後接複數名詞，再用 in your collection 表示收藏中的一枚。',
    {
      question:
        'It looks like one of the beaded brooches in ______ collection.',
      reviewNote:
        'Reviewed 2026-09-17: fixed invalid one of your collection structure; no extra pronoun answer added.',
    },
  ),
});

const reviewedInversionAlternatives = Object.freeze({
  inversion_089: reviewedTokens([['If', 'he', 'had', 'replied', 'to', 'me', 'earlier', ',', 'I', 'would', 'have', 'finished', 'the', 'test', 'properly', '.']], 'Had + subject + p.p. 可改寫成 If + subject + had + p.p.。'),
  inversion_090: reviewedTokens([['If', 'I', 'had', 'known', 'the', 'truth', ',', 'I', 'would', 'not', 'have', 'believed', 'the', 'rumour', '.']], 'Had I known 和 If I had known 意思相同。'),
  inversion_091: reviewedTokens([['If', 'the', 'government', 'had', 'taken', 'action', 'earlier', ',', 'the', 'loss', 'would', 'have', 'been', 'smaller', '.']], 'Had the government taken 和 If the government had taken 意思相同。'),
  inversion_092: reviewedTokens([['If', 'she', 'had', 'brought', 'an', 'umbrella', ',', 'she', 'would', 'not', 'have', 'got', 'wet', '.']], 'Had she brought 和 If she had brought 意思相同。'),
  inversion_093: reviewedTokens([['If', 'they', 'had', 'followed', 'the', 'advice', ',', 'they', 'could', 'have', 'avoided', 'this', 'mistake', '.']], 'Had they followed 和 If they had followed 意思相同。'),
  inversion_094: reviewedTokens([['If', 'I', 'had', 'revised', 'yesterday', ',', 'I', 'would', 'have', 'felt', 'more', 'confident', '.']], 'Had I revised 和 If I had revised 意思相同。'),
  inversion_095: reviewedTokens([['If', 'the', 'teacher', 'had', 'not', 'reminded', 'us', ',', 'we', 'would', 'have', 'missed', 'the', 'deadline', '.']], 'Had the teacher not reminded 和 If the teacher had not reminded 意思相同。'),
  inversion_096: reviewedTokens([['A', 'swarm', 'of', 'crazy', 'fans', 'stood', 'in', 'the', 'airport', '.']], '地點片語可放句首作倒裝，亦可放在普通主詞—動詞語序之後。'),
  inversion_097: reviewedTokens([['A', 'listless', 'cat', 'sat', 'on', 'the', 'sofa', '.']], 'On the sofa sat a cat 和 A cat sat on the sofa 意思相同。'),
  inversion_098: reviewedTokens([['A', 'shy', 'new', 'student', 'stood', 'at', 'the', 'classroom', 'door', '.']], '地點倒裝亦可改成普通主詞—動詞語序。'),
  inversion_099: reviewedTokens([['Several', 'old', 'magazines', 'lay', 'on', 'the', 'table', '.']], 'On the table lay magazines 和 Magazines lay on the table 意思相同。'),
  inversion_100: reviewedTokens([['A', 'small', 'cafe', 'stood', 'at', 'the', 'end', 'of', 'the', 'busy', 'street', '.']], '地點倒裝亦可改成普通主詞—動詞語序。'),
  inversion_101: reviewedTokens([['A', 'group', 'of', 'reporters', 'waited', 'outside', 'the', 'school', 'gate', '.']], '地點倒裝亦可改成普通主詞—動詞語序。'),
  inversion_102: reviewedTokens([['An', 'ancient', 'temple', 'stood', 'on', 'the', 'hill', '.']], '地點倒裝亦可改成普通主詞—動詞語序。'),
});

const REVIEWED_CHOICE_OVERRIDES = Object.freeze({
  PREPOSITION_OF_PLACE: reviewedPlaceAlternatives,
  PHRASAL_VERB: reviewedPhrasalVerbAlternatives,
  COMPOUND_ADJ: reviewedCompoundAdjectiveAlternatives,
  COMPARATIVE_SUPERLATIVE: reviewedComparativeAlternatives,
  INFINITIVE_GERUND: reviewedInfinitiveGerundAlternatives,
  VERB_TABLE: reviewedVerbFormAlternatives,
  PRONOUN: reviewedPronounAlternatives,
  INVERSION: reviewedInversionAlternatives,
  PREPOSITION_OF_TIME: Object.freeze({
    preposition_time_017: Object.freeze({
      acceptedAnswers: Object.freeze(['at', 'during']),
      explanation: '⭐ 規則：at Easter 是常見節日搭配；during Easter 亦可強調復活節期間。',
      reviewNote: 'Reviewed 2026-09-17: both preserve the supplied holiday-period meaning.',
    }),
    preposition_time_022: Object.freeze({
      acceptedAnswers: Object.freeze(['on', 'X (no word)']),
      explanation: '⭐ 規則：on Tuesday afternoon 是完整寫法；美式英語亦常省略 on。',
      reviewNote: 'Reviewed 2026-09-17: explicit on and the listed no-word US form are accepted.',
    }),
    preposition_time_023: Object.freeze({
      acceptedAnswers: Object.freeze(['on', 'X (no word)']),
      explanation: '⭐ 規則：on Sunday morning 是完整寫法；美式英語亦常省略 on。',
      reviewNote: 'Reviewed 2026-09-17: explicit on and the listed no-word US form are accepted.',
    }),
    preposition_time_032: Object.freeze({
      acceptedAnswers: Object.freeze(['on', 'X (no word)']),
      explanation: '⭐ 規則：on Saturday evening 是完整寫法；美式英語亦常省略 on。',
      reviewNote: 'Reviewed 2026-09-17: explicit on and the listed no-word US form are accepted.',
    }),
    preposition_time_038: Object.freeze({
      acceptedAnswers: Object.freeze(['on', 'X (no word)']),
      explanation: '⭐ 規則：on Wednesday morning 是完整寫法；美式英語亦常省略 on。',
      reviewNote: 'Reviewed 2026-09-17: explicit on and the listed no-word US form are accepted.',
    }),
    preposition_time_046: Object.freeze({
      acceptedAnswers: Object.freeze(['in', 'during']),
      explanation: '⭐ 規則：in autumn 是常見季節搭配；during autumn 亦可表示在整個秋季期間。',
      reviewNote: 'Reviewed 2026-09-17: both preserve the supplied season meaning.',
    }),
    preposition_time_050: Object.freeze({
      acceptedAnswers: Object.freeze(['in', 'during']),
      explanation: '⭐ 規則：in the 20th century 是常見寫法；during the 20th century 亦可強調該時期。',
      reviewNote: 'Reviewed 2026-09-17: both preserve the supplied century-period meaning.',
    }),
    preposition_time_055: Object.freeze({
      acceptedAnswers: Object.freeze(['in', 'during']),
      explanation: '⭐ 規則：in the holidays 和 during the holidays 都可表示在假期期間。',
      reviewNote: 'Reviewed 2026-09-17: both preserve the supplied holiday-period meaning.',
    }),
    preposition_time_056: Object.freeze({
      acceptedAnswers: Object.freeze(['in', 'at', 'during']),
      explanation: '⭐ 規則：in secondary school 指求學階段；at secondary school 和 during secondary school 在此亦保留同一時期意思。',
      reviewNote: 'Reviewed 2026-09-17: all three options preserve the supplied schooling-period meaning.',
    }),
    preposition_time_057: Object.freeze({
      acceptedAnswers: Object.freeze(['in', 'during']),
      explanation: '⭐ 規則：in spring 是常見季節搭配；during spring 亦可表示在春季期間。',
      reviewNote: 'Reviewed 2026-09-17: both preserve the supplied season meaning.',
    }),
    preposition_time_058: Object.freeze({
      acceptedAnswers: Object.freeze(['in', 'during']),
      explanation: '⭐ 規則：in December 是常見月份搭配；during December 亦可表示在十二月期間。',
      reviewNote: 'Reviewed 2026-09-17: both preserve the supplied month-period meaning.',
    }),
    preposition_time_060: Object.freeze({
      acceptedAnswers: Object.freeze(['in', 'during']),
      explanation: '⭐ 規則：in the summer holiday 和 during the summer holiday 都可表示在暑假期間。',
      reviewNote: 'Reviewed 2026-09-17: both preserve the supplied holiday-period meaning.',
    }),
    preposition_time_122: Object.freeze({
      acceptedAnswers: Object.freeze(['during', 'on']),
      explanation: '⭐ 規則：during the flight 強調飛行期間；on the flight 亦可表示在該航班旅程中。',
      reviewNote: 'Reviewed 2026-09-17: both preserve the supplied temporal meaning.',
    }),
    preposition_time_123: Object.freeze({
      acceptedAnswers: Object.freeze(['during', 'in']),
      explanation: '⭐ 規則：during the exam 強調考試期間；in the exam 亦可表示在考試之中。',
      reviewNote: 'Reviewed 2026-09-17: both preserve the supplied temporal meaning.',
    }),
    preposition_time_124: Object.freeze({
      acceptedAnswers: Object.freeze(['during', 'in']),
      explanation: '⭐ 規則：during the meeting 強調會議期間；in the meeting 亦可表示在會議進行中。',
      reviewNote: 'Reviewed 2026-09-17: both preserve the supplied temporal meaning.',
    }),
    preposition_time_125: Object.freeze({
      acceptedAnswers: Object.freeze(['during', 'at']),
      explanation: '⭐ 規則：during lunchtime 強調整段午飯時間；at lunchtime 亦表示在午飯時段。',
      reviewNote: 'Reviewed 2026-09-17: both preserve the supplied temporal meaning.',
    }),
    preposition_time_126: Object.freeze({
      acceptedAnswers: Object.freeze(['during', 'in']),
      explanation: '⭐ 規則：during the holiday 和 in the holiday 都可表示在假期期間。',
      reviewNote: 'Reviewed 2026-09-17: both preserve the supplied temporal meaning.',
    }),
    preposition_time_127: Object.freeze({
      acceptedAnswers: Object.freeze(['during', 'in']),
      explanation: '⭐ 規則：during the storm 強調暴風雨期間；in the storm 亦可表示身處暴風雨時。',
      reviewNote: 'Reviewed 2026-09-17: both preserve the supplied temporal meaning.',
    }),
    preposition_time_128: Object.freeze({
      acceptedAnswers: Object.freeze(['during', 'in']),
      explanation: '⭐ 規則：during the lesson 強調課堂期間；in the lesson 亦可表示在該課堂中。',
      reviewNote: 'Reviewed 2026-09-17: both preserve the supplied temporal meaning.',
    }),
    preposition_time_129: Object.freeze({
      acceptedAnswers: Object.freeze(['during', 'at']),
      explanation: '⭐ 規則：during the performance 強調演出期間；at the performance 亦可指在該演出場合。',
      reviewNote: 'Reviewed 2026-09-17: both fit the supplied instruction and event context.',
    }),
    preposition_time_130: Object.freeze({
      acceptedAnswers: Object.freeze(['during', 'in']),
      explanation:
        '⭐ 規則：during the interview 較精準表示整段訪問期間；in the interview 亦可表示在訪問之中。',
      reviewNote:
        'Reviewed 2026-09-17: both choices are grammatical and preserve the supplied Chinese meaning.',
    }),
    preposition_time_131: Object.freeze({
      acceptedAnswers: Object.freeze(['during', 'in']),
      explanation: '⭐ 規則：during the blackout 強調停電期間；in the blackout 亦可表示在停電之中。',
      reviewNote: 'Reviewed 2026-09-17: both preserve the supplied temporal meaning.',
    }),
    preposition_time_132: Object.freeze({
      acceptedAnswers: Object.freeze(['during', 'at']),
      explanation: '⭐ 規則：during recess 和 at recess 都可表示在小息時段。',
      reviewNote: 'Reviewed 2026-09-17: both preserve the supplied temporal meaning.',
    }),
    preposition_time_133: Object.freeze({
      acceptedAnswers: Object.freeze(['during', 'on']),
      explanation: '⭐ 規則：during the trip 強調旅程期間；on the trip 亦表示在該旅程中。',
      reviewNote: 'Reviewed 2026-09-17: both preserve the supplied temporal meaning.',
    }),
    preposition_time_134: Object.freeze({
      acceptedAnswers: Object.freeze(['during', 'in']),
      explanation: '⭐ 規則：during the quiz 強調測驗期間；in the quiz 亦可表示在該測驗中。',
      reviewNote: 'Reviewed 2026-09-17: both preserve the supplied temporal meaning.',
    }),
    preposition_time_135: Object.freeze({
      acceptedAnswers: Object.freeze(['during', 'on']),
      explanation: '⭐ 規則：during the summer course 強調課程期間；on the summer course 亦可表示修讀該課程時。',
      reviewNote: 'Reviewed 2026-09-17: both preserve the supplied course context.',
    }),
    preposition_time_136: Object.freeze({
      acceptedAnswers: Object.freeze(['during', 'in']),
      explanation: '⭐ 規則：during the match 強調比賽期間；in the match 亦可表示在該場比賽中。',
      reviewNote: 'Reviewed 2026-09-17: both preserve the supplied temporal meaning.',
    }),
    preposition_time_138: Object.freeze({
      acceptedAnswers: Object.freeze(['during', 'at']),
      explanation: '⭐ 規則：during dinner 和 at dinner 都可表示在晚飯時段。',
      reviewNote: 'Reviewed 2026-09-17: both preserve the supplied temporal meaning.',
    }),
    preposition_time_139: Object.freeze({
      acceptedAnswers: Object.freeze(['during', 'in']),
      explanation: '⭐ 規則：during the fire drill 強調演習期間；in the fire drill 亦可表示在該演習中。',
      reviewNote: 'Reviewed 2026-09-17: both preserve the supplied temporal meaning.',
    }),
    preposition_time_140: Object.freeze({
      acceptedAnswers: Object.freeze(['during', 'at']),
      explanation: '⭐ 規則：during the concert 強調演唱會期間；at the concert 亦可表示在該演唱會場合。',
      reviewNote: 'Reviewed 2026-09-17: both fit the supplied event context.',
    }),
    preposition_time_177: Object.freeze({
      acceptedAnswers: Object.freeze(['for', 'during']),
      explanation: '⭐ 規則：for the whole afternoon 強調持續時間；during the whole afternoon 亦表示整個下午期間。',
      reviewNote: 'Reviewed 2026-09-17: both preserve the supplied whole-period meaning.',
    }),
    preposition_time_180: Object.freeze({
      acceptedAnswers: Object.freeze(['for', 'during']),
      explanation: '⭐ 規則：for one evening 強調持續一晚；during one evening 亦可表示在某一晚期間。',
      reviewNote: 'Reviewed 2026-09-17: both preserve the supplied one-evening meaning.',
    }),
  }),
});

const explicitChoiceRejections = {
  'PREPOSITION_OF_TIME/preposition_time_121': Object.freeze({
    reviewedAt: '2026-09-17',
    reason:
      '`in the movie` normally shifts the meaning to content or participation in the film, not the supplied time-period meaning.',
  }),
  'PREPOSITION_OF_TIME/preposition_time_137': Object.freeze({
    reviewedAt: '2026-09-17',
    reason:
      '`in the talk` normally refers to content within the talk; `at the talk` changes to event attendance rather than the requested duration.',
  }),
};

const timeReviewGroupReasons = [
  [1, 20, 'Reviewed exact-time and festival expressions; alternatives that change exact time into a deadline or different event meaning remain rejected.'],
  [21, 40, 'Reviewed dates and named-day expressions; only explicit listed US no-preposition variants were added.'],
  [41, 60, 'Reviewed years, months, seasons, and longer periods; natural during/at variants preserving the period meaning were added.'],
  [61, 80, 'Reviewed in + duration completion/future-time expressions; by/during/until options change the required meaning.'],
  [81, 100, 'Reviewed deadline expressions; alternatives change no-later-than into occurrence or duration.'],
  [101, 120, 'Reviewed until expressions; alternatives do not preserve continuation up to the endpoint.'],
  [121, 140, 'Reviewed during-event expressions; natural event/period variants were added case by case.'],
  [141, 160, 'Reviewed from-to and between-and ranges; other options do not fit the paired structure.'],
  [161, 180, 'Reviewed since/for duration expressions; only whole-period during variants preserving meaning were added.'],
  [181, 200, 'Reviewed before/after and zero-preposition expressions; alternatives change the stated temporal relation.'],
];

const timeApprovedIds = new Set(
  Object.keys(REVIEWED_CHOICE_OVERRIDES.PREPOSITION_OF_TIME),
);
for (let number = 1; number <= 200; number += 1) {
  const id = `preposition_time_${String(number).padStart(3, '0')}`;
  const key = `PREPOSITION_OF_TIME/${id}`;
  if (timeApprovedIds.has(id) || explicitChoiceRejections[key]) continue;
  const group = timeReviewGroupReasons.find(([start, end]) => number >= start && number <= end);
  explicitChoiceRejections[key] = Object.freeze({
    reviewedAt: '2026-09-17',
    reason: group?.[2] || 'Reviewed; no listed alternative preserves the tested temporal meaning.',
  });
}

const placeReviewGroupReasons = [
  [1, 20, 'Reviewed static at/in/on locations; alternatives were added only where they preserve the same place relation.'],
  [21, 40, 'Reviewed movement, transport, and vertical relations; direction-changing alternatives remain rejected.'],
  [41, 60, 'Reviewed relative position and paths; near-equivalent regional or lexical variants were added case by case.'],
  [61, 80, 'Reviewed fixed place/transport collocations and geographic relations; alternatives changing inside, destination, or boundary meaning remain rejected.'],
  [81, 100, 'Reviewed transport and movement locations; only alternatives preserving the same position or travel context were added.'],
  [101, 120, 'Reviewed proximity, containment, and surface relations; alternatives changing contact or containment remain rejected.'],
  [121, 140, 'Reviewed page, queue, room, and path positions; equivalent at/in/on/by variants were added case by case.'],
  [141, 160, 'Reviewed direction and movement particles; alternatives changing route or endpoint remain rejected.'],
  [161, 180, 'Reviewed floors, fronts, crossings, and vertical relations; equivalent spatial variants were added case by case.'],
  [181, 200, 'Reviewed fixed verb-preposition contrasts and zero-preposition expressions; meaning-changing pairs such as throw at/to remain distinct.'],
];

const placeApprovedIds = new Set(Object.keys(reviewedPlaceAlternatives));
for (let number = 1; number <= 200; number += 1) {
  const id = `preposition_place_${String(number).padStart(3, '0')}`;
  const key = `PREPOSITION_OF_PLACE/${id}`;
  if (placeApprovedIds.has(id) || explicitChoiceRejections[key]) continue;
  const group = placeReviewGroupReasons.find(([start, end]) => number >= start && number <= end);
  explicitChoiceRejections[key] = Object.freeze({
    reviewedAt: '2026-09-17',
    reason: group?.[2] || 'Reviewed; no listed alternative preserves the tested spatial meaning.',
  });
}

const phrasalApprovedIds = new Set(Object.keys(reviewedPhrasalVerbAlternatives));
for (let number = 1; number <= 100; number += 1) {
  const id = `phrasal_verb_${String(number).padStart(3, '0')}`;
  const key = `PHRASAL_VERB/${id}`;
  if (phrasalApprovedIds.has(id) || explicitChoiceRejections[key]) continue;
  explicitChoiceRejections[key] = Object.freeze({
    reviewedAt: '2026-09-17',
    reason:
      'Reviewed the complete sentence, Chinese meaning, and all five options; no other listed phrasal verb preserves the intended meaning and grammar.',
  });
}

const compoundApprovedIds = new Set(
  Object.keys(reviewedCompoundAdjectiveAlternatives),
);
for (let number = 1; number <= 175; number += 1) {
  const id = `compound_adj_${String(number).padStart(3, '0')}`;
  const key = `COMPOUND_ADJ/${id}`;
  if (compoundApprovedIds.has(id) || explicitChoiceRejections[key]) continue;
  explicitChoiceRejections[key] = Object.freeze({
    reviewedAt: '2026-09-17',
    reason:
      'Reviewed the adjective, complement, Chinese meaning, and all options; other listed prepositions change the collocation or intended meaning.',
  });
}

const comparativeApprovedIds = new Set(
  Object.keys(reviewedComparativeAlternatives),
);
for (let number = 1; number <= 139; number += 1) {
  const id = `comparative_superlative_${String(number).padStart(3, '0')}`;
  const key = `COMPARATIVE_SUPERLATIVE/${id}`;
  if (comparativeApprovedIds.has(id) || explicitChoiceRejections[key]) continue;
  explicitChoiceRejections[key] = Object.freeze({
    reviewedAt: '2026-09-17',
    reason:
      'Reviewed the supplied Chinese comparison, adjective/adverb form, and sentence frame; no additional standard form preserves the required degree and meaning.',
  });
}

const infinitiveGerundApprovedIds = new Set(
  Object.keys(reviewedInfinitiveGerundAlternatives),
);
for (let number = 1; number <= 125; number += 1) {
  const id = `infinitive_gerund_${String(number).padStart(3, '0')}`;
  const key = `INFINITIVE_GERUND/${id}`;
  if (infinitiveGerundApprovedIds.has(id) || explicitChoiceRejections[key]) {
    continue;
  }
  explicitChoiceRejections[key] = Object.freeze({
    reviewedAt: '2026-09-17',
    reason:
      'Reviewed verb complementation and the supplied Chinese meaning; alternative infinitive/gerund forms either are ungrammatical here or change the intended sequence/meaning.',
  });
}

const inversionApprovedIds = new Set(Object.keys(reviewedInversionAlternatives));
for (let number = 1; number <= 109; number += 1) {
  const id = `inversion_${String(number).padStart(3, '0')}`;
  const key = `INVERSION/${id}`;
  if (inversionApprovedIds.has(id) || explicitChoiceRejections[key]) continue;
  explicitChoiceRejections[key] = Object.freeze({
    reviewedAt: '2026-09-17',
    reason:
      'Reviewed the inversion trigger, auxiliary, subject, verb form, and supplied tokens; no additional token order preserves the same grammatical construction and meaning.',
  });
}

const REVIEWED_CHOICE_REJECTIONS = Object.freeze(explicitChoiceRejections);

function applyGrammarWorkshopAnswerOverrides(topics) {
  for (const [topicKey, questions] of Object.entries(REVIEWED_CHOICE_OVERRIDES)) {
    const topic = topics?.[topicKey];
    if (!topic?.questions) continue;
    for (const [questionId, override] of Object.entries(questions)) {
      const question = topic.questions[questionId];
      if (!question) {
        throw new Error(`Reviewed Workshop question is missing: ${topicKey}/${questionId}`);
      }
      const options = Array.isArray(question.options) ? question.options : [];
      const acceptedAnswers = [...override.acceptedAnswers];
      const missing = topic.kind === 'choice'
        ? acceptedAnswers.filter((answer) => !options.includes(answer))
        : [];
      if (missing.length) {
        throw new Error(
          `Reviewed Workshop answer is not an option: ${topicKey}/${questionId}: ${missing.join(', ')}`,
        );
      }
      Object.assign(question, {
        acceptedAnswers,
        explanation: override.explanation,
        answerReviewNote: override.reviewNote,
        ...(override.question ? { question: override.question } : {}),
        ...(override.chinese ? { chinese: override.chinese } : {}),
        ...(override.present ? { present: override.present } : {}),
        ...(override.past ? { past: override.past } : {}),
        ...(override.pp ? { pp: override.pp } : {}),
        ...(override.ing ? { pg: override.ing } : {}),
      });
      if (override.acceptedTokenSets) {
        question.accepted_tokens = [
          ...(Array.isArray(question.accepted_tokens) ? question.accepted_tokens : []),
          ...override.acceptedTokenSets,
        ];
      }
      if (topic.kind === 'fill') question.answers = acceptedAnswers;
    }
  }
  const questionTag = topics?.QUESTION_TAG;
  if (questionTag?.questions) {
    for (const question of Object.values(questionTag.questions)) {
      const answers = Array.isArray(question.answers) ? question.answers : [];
      question.answers = Array.from(new Set([
        ...answers,
        ...answers.map(formalQuestionTag).filter(Boolean),
      ]));
    }
  }
  return topics;
}

function formalQuestionTag(answer) {
  const parts = String(answer || '').trim().toLowerCase().split(/\s+/);
  if (parts.length < 2) return '';
  const auxiliaries = {
    "isn't": 'is', "aren't": 'are', "wasn't": 'was', "weren't": 'were',
    "won't": 'will', "can't": 'can', "couldn't": 'could',
    "shouldn't": 'should', "wouldn't": 'would', "haven't": 'have',
    "hasn't": 'has', "hadn't": 'had', "don't": 'do', "doesn't": 'does',
    "didn't": 'did',
  };
  const auxiliary = auxiliaries[parts[0]];
  if (!auxiliary) return '';
  const subject = parts.slice(1).join(' ');
  if (parts[0] === "aren't" && subject === 'i') return 'am I not';
  return `${auxiliary} ${subject} not`;
}

module.exports = {
  REVIEWED_CHOICE_OVERRIDES,
  REVIEWED_CHOICE_REJECTIONS,
  applyGrammarWorkshopAnswerOverrides,
  formalQuestionTag,
};
