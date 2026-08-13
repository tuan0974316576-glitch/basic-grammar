(function attachCanonicalVocabExamples(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.VocabCanonicalExamples = api;
  if (root.VOCAB_EXAMPLE_SEED && root.VocabExampleUtils) {
    api.apply(root.VOCAB_EXAMPLE_SEED, root.VocabExampleUtils);
  }
})(typeof globalThis !== "undefined" ? globalThis : window, function createCanonicalVocabExamples() {
  "use strict";

  const entries = [
    {
      word: "remember ving", pos: "verb", type: "pattern", meaning: "記得做過", level: "B1",
      examples: [
        ["I remember meeting her at the school fair.", "我記得曾經在學校嘉年華會見過她。"],
        ["He remembers locking the classroom door.", "他記得自己鎖了課室門。"],
        ["We remember visiting this museum last year.", "我們記得去年參觀過這間博物館。"]
      ]
    },
    {
      word: "so adjective that", pos: "conjunction", type: "pattern", meaning: "如此...以致", level: "A2",
      examples: [
        ["The bag was so heavy that I could not lift it.", "那個袋子太重了，以致我無法把它提起。"],
        ["She was so tired that she fell asleep on the bus.", "她太疲倦了，以致在巴士上睡著了。"],
        ["The film was so funny that we laughed loudly.", "那部電影十分有趣，以致我們大聲笑了起來。"]
      ]
    },
    {
      word: "rather adj", pos: "adverb", type: "pattern", meaning: "頗 / 相當", level: "B1",
      examples: [
        ["The test was rather difficult.", "這次測驗頗為困難。"],
        ["It is rather cold outside today.", "今天外面相當寒冷。"],
        ["Her new idea is rather interesting.", "她的新構思頗有趣。"]
      ]
    },
    {
      word: "rather adj", pos: "adverb", type: "pattern", meaning: "幾", level: "B1",
      examples: [
        ["This puzzle is rather tricky.", "這個謎題幾棘手。"],
        ["The library is rather quiet this afternoon.", "圖書館今天下午幾安靜。"],
        ["That restaurant is rather expensive.", "那間餐廳幾昂貴。"]
      ]
    },
    {
      word: "about number", pos: "adverb", type: "pattern", meaning: "大約數字", level: "A1",
      examples: [
        ["There are about twenty students in the room.", "房間裏大約有二十名學生。"],
        ["The walk takes about ten minutes.", "這段路程步行大約需要十分鐘。"],
        ["I have about fifty dollars.", "我大約有五十元。"]
      ]
    },
    {
      word: "as clause", pos: "conjunction", type: "pattern", meaning: "因為 / 正如 / 當 / 隨著", level: "B1",
      examples: [
        ["As it was raining, we stayed indoors.", "因為正在下雨，所以我們留在室內。"],
        ["As you know, exercise is good for us.", "正如你所知道，運動對我們有益。"],
        ["As I walked home, the sky became darker.", "當我步行回家時，天空逐漸變暗。"]
      ]
    },
    {
      word: "as noun", pos: "preposition", type: "pattern", meaning: "作為", level: "A2",
      examples: [
        ["She works as a teacher.", "她的職業是老師。"],
        ["We use this room as a library.", "我們把這個房間用作圖書館。"],
        ["He joined the team as its captain.", "他以隊長身分加入隊伍。"]
      ]
    },
    {
      word: "have been noun/adjective", pos: "auxiliary", type: "pattern", meaning: "一直是 / 已經是", level: "A2",
      examples: [
        ["They have been friends for five years.", "他們已經做了五年朋友。"],
        ["We have been busy since Monday.", "我們從星期一開始一直很忙。"],
        ["These books have been useful to me.", "這些書一直對我很有用。"]
      ]
    },
    {
      word: "have been pp", pos: "auxiliary", type: "pattern", meaning: "一直被 / 已經被", level: "A2",
      examples: [
        ["The windows have been cleaned.", "窗戶已經被清潔乾淨。"],
        ["These trees have been protected for years.", "這些樹木多年來一直受到保護。"],
        ["The invitations have been sent to everyone.", "邀請函已經寄給所有人。"]
      ]
    },
    {
      word: "have pp", pos: "auxiliary", type: "pattern", meaning: "已經... / ...過", level: "A2",
      examples: [
        ["I have finished my homework.", "我已經完成了家課。"],
        ["We have visited that museum before.", "我們以前參觀過那間博物館。"],
        ["They have eaten lunch already.", "他們已經吃過午餐。"]
      ]
    },
    {
      word: "no matter question word", pos: "conjunction", type: "pattern", meaning: "無論...", level: "B1",
      examples: [
        ["No matter what happens, stay calm.", "無論發生甚麼事，都要保持冷靜。"],
        ["No matter where you go, keep in touch.", "無論你到哪裏，都要保持聯絡。"],
        ["No matter how difficult it is, do not give up.", "無論事情多麼困難，都不要放棄。"]
      ]
    },
    {
      word: "the noun concerned", pos: "adjective", type: "pattern", meaning: "有關的...", level: "C1",
      examples: [
        ["The students concerned will receive an email.", "有關學生將會收到電郵。"],
        ["The departments concerned must review the policy.", "有關部門必須檢討該項政策。"],
        ["Please contact the teacher concerned for further details.", "如欲了解更多詳情，請聯絡有關老師。"]
      ]
    },
    {
      word: "noun free", pos: "adjective", type: "pattern", meaning: "沒有...的", level: "B2",
      examples: [
        ["This drink is sugar-free.", "這款飲品不含糖。"],
        ["We enjoyed a stress-free holiday.", "我們享受了一個沒有壓力的假期。"],
        ["The school provides a smoke-free environment.", "學校提供無煙環境。"]
      ]
    },
    {
      word: "noun with", pos: "adjective", type: "pattern", meaning: "有...的", level: "B2",
      examples: [
        ["We booked a room with a sea view.", "我們預訂了一間有海景的房間。"],
        ["She chose a bag with several pockets.", "她選了一個有多個口袋的袋子。"],
        ["He lives in a house with a small garden.", "他住在一間有小花園的房子裏。"]
      ]
    },
    {
      word: "verb with", pos: "preposition", type: "pattern", meaning: "用...來...", level: "B2",
      examples: [
        ["She cut the paper with scissors.", "她用剪刀剪紙。"],
        ["He opened the box with a key.", "他用鑰匙打開盒子。"],
        ["We measured the desk with a ruler.", "我們用直尺量度書桌。"]
      ]
    },
    {
      word: "adj as subject be", pos: "conjunction", type: "pattern", meaning: "雖然", level: "C1",
      examples: [
        ["Tired as she was, she finished the report.", "雖然她很疲倦，但仍完成了報告。"],
        ["Difficult as the task was, the team did not give up.", "雖然任務艱巨，但團隊沒有放棄。"],
        ["Young as he is, he shows remarkable judgment.", "雖然他年紀輕，但展現出非凡的判斷力。"]
      ]
    },
    {
      word: "be pp", pos: "auxiliary", type: "pattern", meaning: "被（被動語態）", level: "A2",
      examples: [
        ["The classroom must be cleaned every day.", "課室必須每天清潔。"],
        ["The letter will be sent tomorrow.", "信件將於明天寄出。"],
        ["These books can be borrowed for two weeks.", "這些書可以借閱兩星期。"]
      ]
    },
    {
      word: "be pp", pos: "auxiliary", type: "pattern", meaning: "被", level: "A2",
      examples: [
        ["The food should be kept in the fridge.", "食物應存放在雪櫃內。"],
        ["The door cannot be opened without a key.", "沒有鑰匙便無法打開這扇門。"],
        ["The prize may be shared by the team.", "獎品可以由隊員共同分享。"]
      ]
    },
    {
      word: "can't help ving", pos: "verb", type: "pattern", meaning: "忍不住做某事", level: "B1",
      examples: [
        ["I can't help laughing at his joke.", "我聽到他的笑話便忍不住發笑。"],
        ["She couldn't help crying during the film.", "她看電影時忍不住哭了。"],
        ["We can't help worrying about the result.", "我們忍不住擔心結果。"]
      ]
    },
    {
      word: "find it adjective", pos: "verb", type: "pattern", meaning: "覺得...是...", level: "A2",
      examples: [
        ["I find it difficult to wake up early.", "我覺得早起很困難。"],
        ["She finds it easy to make friends.", "她覺得結交朋友很容易。"],
        ["We found it useful to take notes.", "我們覺得做筆記很有用。"]
      ]
    },
    {
      word: "for time", pos: "preposition", type: "pattern", meaning: "持續一段時間", level: "A2",
      examples: [
        ["I have lived here for three years.", "我在這裏住了三年。"],
        ["She studied for two hours.", "她溫習了兩小時。"],
        ["We waited for twenty minutes.", "我們等了二十分鐘。"]
      ]
    },
    {
      word: "for 時間", pos: "preposition", type: "pattern", meaning: "做了多久", level: "A2",
      examples: [
        ["They played football for an hour.", "他們踢了一小時足球。"],
        ["He has worked here for six months.", "他在這裏工作了六個月。"],
        ["I read in the library for half an hour.", "我在圖書館閱讀了半小時。"]
      ]
    },
    {
      word: "happen to verb", pos: "verb", type: "pattern", meaning: "碰巧...", level: "A2",
      examples: [
        ["I happened to meet my teacher at the station.", "我碰巧在車站遇到老師。"],
        ["She happens to know the answer.", "她碰巧知道答案。"],
        ["We happened to arrive at the same time.", "我們碰巧同時到達。"]
      ]
    },
    {
      word: "happen to v", pos: "verb", type: "pattern", meaning: "剛巧", level: "A2",
      examples: [
        ["He happened to have an extra ticket.", "他剛巧有一張多出的門票。"],
        ["I happened to see the accident.", "我剛巧看見那宗意外。"],
        ["They happened to choose the same book.", "他們剛巧選了同一本書。"]
      ]
    },
    {
      word: "has been noun/adjective", pos: "auxiliary", type: "pattern", meaning: "一直是... / 已經是...", level: "A2",
      examples: [
        ["He has been our class monitor since September.", "他從九月起一直是我們的班長。"],
        ["The weather has been cold all week.", "整個星期天氣一直寒冷。"],
        ["This book has been useful to many students.", "這本書一直對很多學生有幫助。"]
      ]
    },
    {
      word: "has been pp", pos: "auxiliary", type: "pattern", meaning: "已被...", level: "A2",
      examples: [
        ["The broken chair has been repaired.", "那張破椅子已被修好。"],
        ["The match has been cancelled because of the rain.", "比賽已因下雨而取消。"],
        ["Her name has been added to the list.", "她的名字已被加入名單。"]
      ]
    },
    {
      word: "has been ving", pos: "auxiliary", type: "pattern", meaning: "一直在...", level: "A2",
      examples: [
        ["He has been practising the piano all morning.", "他整個上午一直在練習鋼琴。"],
        ["It has been raining since noon.", "從中午開始一直在下雨。"],
        ["She has been reading that book for a week.", "她一星期以來一直在閱讀那本書。"]
      ]
    },
    {
      word: "has pp", pos: "auxiliary", type: "pattern", meaning: "已經... / ...過", level: "A2",
      examples: [
        ["She has completed the project.", "她已經完成了專題習作。"],
        ["He has visited Japan twice.", "他去過日本兩次。"],
        ["The bus has already left.", "巴士已經開走了。"]
      ]
    },
    {
      word: "have been ving", pos: "auxiliary", type: "pattern", meaning: "一直在...", level: "A2",
      examples: [
        ["We have been learning about climate change.", "我們一直在學習氣候變化。"],
        ["They have been reducing food waste at school.", "他們一直在學校減少食物浪費。"],
        ["I have been trying to eat more vegetables.", "我一直在嘗試多吃蔬菜。"]
      ]
    },
    {
      word: "have been ving", pos: "auxiliary", type: "pattern", meaning: "一直...", level: "A2",
      examples: [
        ["I have been waiting since three o'clock.", "我從三時開始一直等候。"],
        ["We have been working on this project all week.", "我們整個星期一直處理這個專題。"],
        ["They have been talking for a long time.", "他們一直交談了很久。"]
      ]
    },
    {
      word: "have never pp", pos: "auxiliary", type: "pattern", meaning: "從未... / 未...過", level: "A2",
      examples: [
        ["I have never tried skiing.", "我從未嘗試滑雪。"],
        ["We have never seen this film.", "我們未看過這部電影。"],
        ["They have never travelled abroad.", "他們從未到外地旅遊。"]
      ]
    },
    {
      word: "have not pp", pos: "auxiliary", type: "pattern", meaning: "還沒有...", level: "A2",
      examples: [
        ["I have not finished my lunch yet.", "我還沒有吃完午餐。"],
        ["We have not received the results yet.", "我們還沒有收到結果。"],
        ["They have not chosen a captain yet.", "他們還沒有選出隊長。"]
      ]
    },
    {
      word: "however adjective", pos: "conjunction", type: "pattern", meaning: "無論多麼...", level: "B2",
      examples: [
        ["However difficult the task is, we will complete it.", "無論任務多麼困難，我們都會完成。"],
        ["However busy she is, she always helps her family.", "無論她多麼忙碌，她總會幫助家人。"],
        ["However expensive the device is, someone will buy it.", "無論這部裝置多麼昂貴，總會有人購買。"]
      ]
    },
    {
      word: "is being pp", pos: "auxiliary", type: "pattern", meaning: "正在被...", level: "A2",
      examples: [
        ["The road is being repaired.", "道路正在維修。"],
        ["Lunch is being prepared in the kitchen.", "午餐正在廚房裏準備。"],
        ["The problem is being discussed by the class.", "全班正在討論這個問題。"]
      ]
    },
    {
      word: "of noun at the beginning of a sentence", pos: "preposition", type: "pattern", meaning: "在...當中", level: "C1",
      examples: [
        ["Of all the proposals, this one is the most practical.", "在所有建議當中，這一項最切實可行。"],
        ["Of the students interviewed, most supported the plan.", "在受訪學生當中，大部分人支持該計劃。"],
        ["Of these factors, cost has the greatest influence.", "在這些因素當中，成本的影響最大。"]
      ]
    },
    {
      word: "one of the plural noun", pos: "determiner", type: "pattern", meaning: "其中一個...", level: "A2",
      examples: [
        ["She is one of the best players on the team.", "她是隊中最出色的球員之一。"],
        ["This is one of the oldest buildings in the city.", "這是城中最古老的建築物之一。"],
        ["English is one of the subjects I enjoy most.", "英語是我最喜歡的科目之一。"]
      ]
    },
    {
      word: "over time", pos: "preposition", type: "pattern", meaning: "在...期間", level: "A2",
      examples: [
        ["The town changed greatly over the next ten years.", "這個城鎮在其後十年間有很大改變。"],
        ["Her confidence grew over the school year.", "她的信心在學年期間逐漸增加。"],
        ["We collected the data over three months.", "我們在三個月期間收集數據。"]
      ]
    },
    {
      word: "over time", pos: "adverb", type: "phrase", meaning: "隨著時間過去", level: "B1",
      examples: [
        ["Your pronunciation will improve over time.", "隨著時間過去，你的發音會有所改善。"],
        ["The pain became less severe over time.", "隨著時間過去，痛楚逐漸減輕。"],
        ["Small habits can make a big difference over time.", "隨著時間過去，小習慣也能帶來重大改變。"]
      ]
    },
    {
      word: "the industry", pos: "noun", type: "pattern", meaning: "...行業", level: "B1",
      examples: [
        ["The tourism industry creates many jobs.", "旅遊業創造了很多就業機會。"],
        ["Technology is changing the publishing industry.", "科技正在改變出版業。"],
        ["She hopes to work in the film industry.", "她希望投身電影業。"]
      ]
    },
    {
      word: "worth ving", pos: "adjective", type: "pattern", meaning: "值得...", level: "B1",
      examples: [
        ["This book is worth reading.", "這本書值得閱讀。"],
        ["The museum is worth visiting.", "這間博物館值得參觀。"],
        ["The idea is worth discussing with the class.", "這個構思值得與全班討論。"]
      ]
    },
    {
      word: "m plus museum", display: "M Plus Museum", pos: "noun", type: "phrase", meaning: "M Plus 博物館", level: "B2",
      examples: [
        ["M Plus Museum displays visual culture from Hong Kong and beyond.", "M Plus 博物館展示香港及其他地區的視覺文化。"],
        ["Our class visited M Plus Museum to study modern design.", "我們全班到訪 M Plus 博物館，學習現代設計。"],
        ["Visitors can see art, architecture and moving images at M Plus Museum.", "遊客可以在 M Plus 博物館欣賞藝術、建築及流動影像作品。"]
      ]
    }
  ];

  function stableId(utils, localKey, index, source) {
    return `seed-canonical-${utils.stableHash(`${localKey}:${index}:${source}`)}`;
  }

  function apply(seed, utils) {
    if (!seed || !utils) return seed;
    if (!seed.entries) seed.entries = {};
    Object.entries(seed.entries).forEach(([key, payload]) => {
      const rawWord = String(payload?.word || payload?.display || "");
      if (rawWord.includes("+") && utils.normalizeWord(rawWord) !== rawWord.trim().toLowerCase()) {
        delete seed.entries[key];
      }
    });
    entries.forEach((item) => {
      const word = utils.normalizeWord(item.word);
      const meaning = utils.normalizeMeaning(item.meaning);
      const hints = utils.normalizeHints([{
        meaning,
        pos: item.pos,
        type: item.type,
        level: item.level
      }]);
      const localKey = utils.getLocalCacheKey(word, hints);
      seed.entries[localKey] = {
        word,
        display: item.display || word,
        source: "local-seed-canonical",
        status: "ready",
        level: item.level,
        meaning,
        pos: item.pos,
        type: item.type,
        hints,
        examples: item.examples.map(([source, target], index) => ({
          id: stableId(utils, localKey, index, source),
          source,
          target,
          meaning,
          level: item.level
        }))
      };
    });
    return seed;
  }

  return { apply, entries };
});
