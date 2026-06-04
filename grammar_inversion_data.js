// Inversion rearrange questions for Battleship grammar mode.
// Keep this data file declarative; gameplay lives in ui-grammar.js.
(function () {
    window.GRAMMAR_INVERSION_RULES = {
        only_through: "Only through + noun / V-ing + auxiliary + subject + verb: 只有通過某方法，才可以做到某事。",
        seldom: "Seldom + do / does / did + subject + base verb: 甚少做某事。",
        no_longer: "No longer + do / does / did / can / will + subject + verb: 不再做某事。",
        under_no_circumstances: "Under no circumstances + should / must / can + subject + verb: 在任何情況下都不應該 / 不可以做。",
        not_only: "Not only + auxiliary / be + subject + complement, subject + also + verb: 不但……而且……。",
        hardly: "Hardly + can / could + subject + verb: 幾乎不能做某事。",
        on_no_account: "On no account + should / must / can + subject + verb: 絕對不應做某事。",
        at_no_time: "At no time + will / would / should + subject + verb: 永遠不會 / 絕不會做某事。",
        never: "Never + do / does / did / will / can + subject + verb: 永遠不會 / 從不做某事。",
        comparative: "The + comparative + subject + verb, the + comparative + subject + verb: 越……越……。",
        nor: "Negative clause, nor + auxiliary + subject + verb: 不做前者，也不做後者。",
        only_when: "Only when + clause + auxiliary + subject + verb: 只有當……才……。",
        however_adj: "However + adjective + subject + be, subject + verb: 無論多麼……也……。",
        had: "Had + subject + past participle, subject + would / could have + past participle: 如果當時……就會……。",
        place: "Prepositional phrase of place + verb + noun subject: 地方放句首，動詞放主語前。",
        gone_days: "Gone are the days when + past clause: ……的日子已經過去。"
    };

    const rows = [
        ["only_through", "只有通過增加教育開支，政府才能提升香港的競爭力。", "Only through increasing its expenditures on education can the government burnish the competitiveness of Hong Kong.", ["will", "does", "is", "by"]],
        ["only_through", "只有通過每天閱讀英文文章，學生才能擴闊詞彙量。", "Only through reading English articles every day can students expand their vocabulary.", ["do", "will", "are", "to"]],
        ["only_through", "只有通過改善公共交通，城市才能減少路面擠塞。", "Only through improving public transport can the city reduce road congestion.", ["does", "will", "is", "by"]],
        ["only_through", "只有通過投資科技，香港才能保持競爭力。", "Only through investing in technology can Hong Kong remain competitive.", ["will", "does", "is", "to"]],
        ["only_through", "只有通過保護海洋，下一代才能享受乾淨的海灘。", "Only through protecting the ocean can the next generation enjoy clean beaches.", ["will", "does", "is", "by"]],
        ["only_through", "只有通過定期溫習，考生才能減少考試壓力。", "Only through revising regularly can candidates reduce exam stress.", ["do", "will", "are", "to"]],
        ["only_through", "只有通過聆聽年輕人的意見，學校才能設計更好的活動。", "Only through listening to young people's opinions can schools design better activities.", ["will", "do", "are", "by"]],

        ["seldom", "現今青少年甚少看新聞。", "Seldom do teenagers in this day and age watch news.", ["are", "will", "watching", "watched"]],
        ["seldom", "學生甚少在考試前早睡。", "Seldom do students sleep early before examinations.", ["are", "will", "slept", "sleeping"]],
        ["seldom", "他甚少承認自己的錯誤。", "Seldom does he admit his mistakes.", ["do", "is", "admitted", "admitting"]],
        ["seldom", "這間餐廳甚少令顧客失望。", "Seldom does this restaurant disappoint its customers.", ["do", "is", "disappointed", "disappointing"]],
        ["seldom", "父母甚少完全明白網上潮流。", "Seldom do parents fully understand online trends.", ["are", "will", "understood", "understanding"]],
        ["seldom", "政府甚少在短時間內改變政策。", "Seldom does the government change its policy within a short time.", ["do", "is", "changed", "changing"]],
        ["seldom", "我甚少在平日玩手機遊戲。", "Seldom do I play mobile games on weekdays.", ["am", "will", "played", "playing"]],

        ["no_longer", "現今兒童放學後不再需要做童工。", "No longer do children nowadays have to work as child labour after school.", ["does", "are", "worked", "working"]],
        ["no_longer", "很多學生不再依賴紙本字典。", "No longer do many students depend on paper dictionaries.", ["does", "are", "depended", "depending"]],
        ["no_longer", "這個舊商場不再吸引年輕顧客。", "No longer does this old shopping mall attract young customers.", ["do", "is", "attracted", "attracting"]],
        ["no_longer", "香港家庭不再只用現金付款。", "No longer do Hong Kong families pay only in cash.", ["does", "are", "paid", "paying"]],
        ["no_longer", "他不再害怕在台上發言。", "No longer does he fear speaking on stage.", ["do", "is", "feared", "fearing"]],
        ["no_longer", "學生不再能完全避開人工智能。", "No longer can students completely avoid artificial intelligence.", ["do", "are", "avoided", "avoiding"]],

        ["under_no_circumstances", "政府在任何情況下都不應徵收貨品及服務稅。", "Under no circumstances should the government impose the goods and services tax.", ["does", "will", "imposed", "imposing"]],
        ["under_no_circumstances", "學生在任何情況下都不應抄襲功課。", "Under no circumstances should students copy their homework.", ["do", "will", "copied", "copying"]],
        ["under_no_circumstances", "司機在任何情況下都不應酒後駕駛。", "Under no circumstances should drivers drive after drinking alcohol.", ["do", "will", "drove", "driving"]],
        ["under_no_circumstances", "學校在任何情況下都不應忽視欺凌問題。", "Under no circumstances should schools ignore bullying.", ["do", "will", "ignored", "ignoring"]],
        ["under_no_circumstances", "我們在任何情況下都不可洩露同學的私人資料。", "Under no circumstances should we reveal our classmates' private information.", ["do", "will", "revealed", "revealing"]],
        ["under_no_circumstances", "市民在任何情況下都不應攻擊前線職員。", "Under no circumstances should citizens attack frontline workers.", ["do", "will", "attacked", "attacking"]],

        ["not_only", "Bill Gates 不但是企業家，他也是慈善家。", "Not only is Bill Gates an entrepreneur, he is also a philanthropist.", ["does", "will", "are", "being"]],
        ["not_only", "這個應用程式不但有趣，它也很有教育意義。", "Not only is this app entertaining, it is also educational.", ["does", "will", "be", "being"]],
        ["not_only", "這位老師不但有耐性，她也很有創意。", "Not only is this teacher patient, she is also creative.", ["does", "will", "be", "being"]],
        ["not_only", "運動不但能強身健體，它也能減壓。", "Not only can exercise strengthen our bodies, it can also reduce stress.", ["does", "is", "strengthened", "strengthening"]],
        ["not_only", "閱讀不但能擴闊視野，它也能改善寫作。", "Not only can reading broaden our horizons, it can also improve writing.", ["does", "is", "broadened", "broadening"]],
        ["not_only", "這個計劃不但浪費金錢，它也浪費時間。", "Not only does this plan waste money, it also wastes time.", ["do", "is", "wasted", "wasting"]],
        ["not_only", "智能手機不但改變了溝通，它也改變了學習。", "Not only have smartphones changed communication, they have also changed learning.", ["do", "are", "change", "changing"]],

        ["hardly", "學生準備 HKDSE 時幾乎不能放鬆。", "Hardly can students chill out when preparing for the HKDSE.", ["do", "are", "chilled", "chilling"]],
        ["hardly", "市民在繁忙時間幾乎不能找到座位。", "Hardly can passengers find a seat during rush hour.", ["do", "are", "found", "finding"]],
        ["hardly", "小店幾乎不能負擔昂貴租金。", "Hardly can small shops afford expensive rent.", ["do", "are", "afforded", "affording"]],
        ["hardly", "沒有互聯網，學生幾乎不能完成網上功課。", "Hardly can students complete online homework without the Internet.", ["do", "are", "completed", "completing"]],
        ["hardly", "他病得很重時幾乎不能說話。", "Hardly could he speak when he was seriously ill.", ["did", "was", "spoke", "speaking"]],
        ["hardly", "這座城市沒有外來人才時幾乎不能保持活力。", "Hardly can the city stay energetic without outside talent.", ["does", "is", "stayed", "staying"]],

        ["on_no_account", "你絕不應打開這道門。", "On no account should you open this door.", ["do", "will", "opened", "opening"]],
        ["on_no_account", "學生絕不應在網上欺凌同學。", "On no account should students bully their classmates online.", ["do", "will", "bullied", "bullying"]],
        ["on_no_account", "我們絕不應分享假新聞。", "On no account should we share fake news.", ["do", "will", "shared", "sharing"]],
        ["on_no_account", "遊客絕不應破壞歷史建築。", "On no account should tourists damage historic buildings.", ["do", "will", "damaged", "damaging"]],
        ["on_no_account", "公司絕不應出售顧客資料。", "On no account should companies sell customers' data.", ["do", "will", "sold", "selling"]],
        ["on_no_account", "你絕不應在考試中使用手機。", "On no account should you use your phone during the examination.", ["do", "will", "used", "using"]],

        ["at_no_time", "中央政府永遠不會同意在香港實行普選。", "At no time will the central government agree to the implementation of universal suffrage in Hong Kong.", ["does", "is", "agreed", "agreeing"]],
        ["at_no_time", "我永遠不會放棄學習英文。", "At no time will I give up learning English.", ["do", "am", "gave", "giving"]],
        ["at_no_time", "這間學校絕不會容忍欺凌。", "At no time will this school tolerate bullying.", ["does", "is", "tolerated", "tolerating"]],
        ["at_no_time", "負責任的政府絕不會忽視貧窮問題。", "At no time will a responsible government ignore poverty.", ["does", "is", "ignored", "ignoring"]],
        ["at_no_time", "真正的朋友永遠不會背叛你。", "At no time will true friends betray you.", ["do", "are", "betrayed", "betraying"]],
        ["at_no_time", "醫生絕不應向病人隱瞞真相。", "At no time should doctors hide the truth from patients.", ["do", "are", "hidden", "hiding"]],

        ["never", "我們從不讀 Biology 教科書。", "Never do we read Biology textbooks.", ["are", "will", "readed", "reading"]],
        ["never", "他從不遲交功課。", "Never does he hand in his homework late.", ["do", "is", "handed", "handing"]],
        ["never", "我永遠不會忘記老師的鼓勵。", "Never will I forget my teacher's encouragement.", ["do", "am", "forgot", "forgetting"]],
        ["never", "香港人從不輕易放棄。", "Never do Hongkongers give up easily.", ["are", "will", "gave", "giving"]],
        ["never", "她從不浪費食物。", "Never does she waste food.", ["do", "is", "wasted", "wasting"]],
        ["never", "我們永遠不應低估教育的重要性。", "Never should we underestimate the importance of education.", ["do", "are", "underestimated", "underestimating"]],

        ["comparative", "你越努力學習，你會取得越好的成績。", "The harder you study, the better results you will get.", ["more", "best", "do", "are"]],
        ["comparative", "青少年做越多運動，他們會變得越健康。", "The more exercise teenagers do, the healthier they will become.", ["most", "healthy", "are", "does"]],
        ["comparative", "我有越多朋友，我會越快樂。", "The more friends I have, the happier I will be.", ["most", "happy", "do", "am"]],
        ["comparative", "我們越早專注學業，就越好。", "The sooner we concentrate on our studies, the better.", ["soon", "best", "do", "are"]],
        ["comparative", "你越少使用手機，你會越專心。", "The less you use your phone, the more focused you will be.", ["least", "focus", "do", "are"]],
        ["comparative", "政府投資越多公共房屋，市民會越有希望。", "The more the government invests in public housing, the more hopeful citizens will be.", ["most", "hope", "does", "are"]],
        ["comparative", "我們越快採取行動，損害會越少。", "The faster we take action, the less damage there will be.", ["fast", "least", "do", "is"]],
        ["comparative", "學生閱讀越多，他們的寫作會越好。", "The more students read, the better their writing will become.", ["most", "best", "do", "are"]],
        ["comparative", "你練習越多，你會越自信。", "The more you practise, the more confident you will become.", ["most", "confidence", "do", "are"]],
        ["comparative", "污染越嚴重，健康風險越高。", "The worse the pollution becomes, the higher the health risks will be.", ["worst", "high", "does", "are"]],

        ["nor", "他不上學，也不找工作。", "He does not go to school, nor does he search for jobs.", ["do", "is", "searched", "searching"]],
        ["nor", "在偏遠森林迷路後，他找不到食物，也不能報警。", "Getting lost in the remote forest, he could not find any food, nor could he call the police.", ["did", "was", "called", "calling"]],
        ["nor", "她不喜歡數學，也不喜歡科學。", "She does not like Mathematics, nor does she enjoy Science.", ["do", "is", "enjoyed", "enjoying"]],
        ["nor", "這個政策不能解決貧窮，也不能改善住屋問題。", "This policy cannot solve poverty, nor can it improve housing problems.", ["does", "is", "improved", "improving"]],
        ["nor", "他沒有道歉，也沒有解釋發生了甚麼事。", "He did not apologise, nor did he explain what happened.", ["does", "is", "explained", "explaining"]],
        ["nor", "學生不能離開禮堂，也不能使用手機。", "Students cannot leave the hall, nor can they use their phones.", ["do", "are", "used", "using"]],
        ["nor", "這間公司不尊重員工，也不關心顧客。", "This company does not respect employees, nor does it care about customers.", ["do", "is", "cared", "caring"]],

        ["only_when", "只有當日本政府鼓勵更多已婚女性重返勞動市場，日本才能提高生產力。", "Only when the Japanese government encourages more married women to rejoin the labour force can Japan raise its productivity.", ["will", "does", "is", "raising"]],
        ["only_when", "只有當學生明白錯誤，他們才能真正進步。", "Only when students understand their mistakes can they truly improve.", ["will", "do", "are", "improved"]],
        ["only_when", "只有當父母聆聽孩子，家庭關係才會改善。", "Only when parents listen to their children will family relationships improve.", ["do", "are", "improved", "improving"]],
        ["only_when", "只有當政府控制租金，小店才能生存。", "Only when the government controls rent can small shops survive.", ["will", "does", "are", "survived"]],
        ["only_when", "只有當我們減少浪費，環境才會變好。", "Only when we reduce waste will the environment improve.", ["do", "are", "improved", "improving"]],
        ["only_when", "只有當你每天練習，你的英文才會進步。", "Only when you practise every day will your English improve.", ["do", "are", "improved", "improving"]],
        ["only_when", "只有當學校重視精神健康，學生才會感到被支持。", "Only when schools value mental health will students feel supported.", ["do", "are", "felt", "feeling"]],

        ["however_adj", "無論 HKDSE 多麼艱難，每個高中生都應努力。", "However formidable the HKDSE is, every sixth-former should work strenuously.", ["although", "will", "does", "working"]],
        ["however_adj", "無論任務多麼困難，我們都不應放棄。", "However difficult the task is, we should not give up.", ["although", "will", "do", "giving"]],
        ["however_adj", "無論天氣多麼差，郵差都會繼續工作。", "However bad the weather is, the postman will continue working.", ["although", "does", "are", "worked"]],
        ["however_adj", "無論這部電話多麼昂貴，很多青少年仍然想買。", "However expensive this phone is, many teenagers still want to buy it.", ["although", "does", "are", "bought"]],
        ["however_adj", "無論考試多麼重要，學生都需要休息。", "However important the exam is, students need to rest.", ["although", "do", "are", "rested"]],
        ["however_adj", "無論這個城市多麼繁忙，人們仍然需要安靜空間。", "However busy this city is, people still need quiet spaces.", ["although", "does", "are", "needed"]],
        ["however_adj", "無論問題多麼複雜，我們都應冷靜處理。", "However complicated the problem is, we should handle it calmly.", ["although", "will", "do", "handled"]],

        ["had", "如果他早點回覆我，我就能好好完成測驗。", "Had he replied to me earlier, I would have finished the test properly.", ["if", "has", "reply", "finish"]],
        ["had", "如果我知道真相，我就不會相信那個謠言。", "Had I known the truth, I would not have believed the rumour.", ["if", "did", "know", "believe"]],
        ["had", "如果政府及早採取行動，損失就會較少。", "Had the government taken action earlier, the loss would have been smaller.", ["if", "has", "take", "be"]],
        ["had", "如果她帶了雨傘，她就不會全身濕透。", "Had she brought an umbrella, she would not have got wet.", ["if", "has", "bring", "get"]],
        ["had", "如果他們聽從建議，他們就能避免這個錯誤。", "Had they followed the advice, they could have avoided this mistake.", ["if", "did", "follow", "avoid"]],
        ["had", "如果我昨日溫習了，我就會更有信心。", "Had I revised yesterday, I would have felt more confident.", ["if", "did", "revise", "feel"]],
        ["had", "如果老師沒有提醒我們，我們就會錯過限期。", "Had the teacher not reminded us, we would have missed the deadline.", ["if", "did", "remind", "miss"]],

        ["place", "一群瘋狂粉絲站在機場內。", "In the airport stood a swarm of crazy fans.", ["were", "standing", "stand", "there"]],
        ["place", "一隻無精打采的貓坐在梳化上。", "On the sofa sat a listless cat.", ["was", "sitting", "sit", "there"]],
        ["place", "一位害羞的新生站在課室門口。", "At the classroom door stood a shy new student.", ["was", "standing", "stand", "there"]],
        ["place", "幾本舊雜誌放在桌上。", "On the table lay several old magazines.", ["were", "lying", "lie", "there"]],
        ["place", "一間小咖啡店位於繁忙街道的盡頭。", "At the end of the busy street stood a small cafe.", ["was", "standing", "stand", "there"]],
        ["place", "一群記者在校門外等候。", "Outside the school gate waited a group of reporters.", ["were", "waiting", "wait", "there"]],
        ["place", "一座古老寺廟位於山頂上。", "On the hill stood an ancient temple.", ["was", "standing", "stand", "there"]],

        ["gone_days", "你可以晚上不鎖門的日子已經過去了。", "Gone are the days when you could leave your door unlocked at night.", ["go", "were", "day", "which"]],
        ["gone_days", "學生只靠背誦便能高分的日子已經過去了。", "Gone are the days when students could get high marks by memorising answers only.", ["go", "were", "day", "which"]],
        ["gone_days", "人們完全依賴報紙獲取消息的日子已經過去了。", "Gone are the days when people relied entirely on newspapers for information.", ["go", "were", "day", "which"]],
        ["gone_days", "孩子放學後在街上玩到深夜的日子已經過去了。", "Gone are the days when children played in the streets until late at night.", ["go", "were", "day", "which"]],
        ["gone_days", "香港租金仍然便宜的日子已經過去了。", "Gone are the days when rent in Hong Kong was still affordable.", ["go", "were", "day", "which"]],
        ["gone_days", "學生不用懂科技也能學習的日子已經過去了。", "Gone are the days when students could learn without knowing technology.", ["go", "were", "day", "which"]],
        ["gone_days", "小店能輕易負擔租金的日子已經過去了。", "Gone are the days when small shops could easily afford rent.", ["go", "were", "day", "which"]]
    ];

    function tokenizeAnswer(answer) {
        return String(answer || '')
            .trim()
            .replace(/\s+([,.?!;:])/g, '$1')
            .replace(/([,.?!;:])/g, ' $1 ')
            .replace(/\s+/g, ' ')
            .trim()
            .split(/\s+/)
            .filter(Boolean);
    }

    function inferIntrinsicTokens(tokens) {
        return (Array.isArray(tokens) ? tokens : [])
            .filter((token, index) => index > 0 && /[A-Z]/.test(String(token || '')))
            .map(token => String(token || '').replace(/[,.?!;:]+$/g, ''))
            .filter(Boolean);
    }

    window.GRAMMAR_INVERSION_BANK = rows.map((row, index) => {
        const [rule, chinese, answer, distractors] = row;
        const correctTokens = tokenizeAnswer(answer);
        return {
            id: `inversion_${String(index + 1).padStart(3, '0')}`,
            rule,
            chinese,
            correct_tokens: correctTokens,
            intrinsic_tokens: inferIntrinsicTokens(correctTokens),
            distractors: Array.isArray(distractors) ? distractors : []
        };
    });
})();
