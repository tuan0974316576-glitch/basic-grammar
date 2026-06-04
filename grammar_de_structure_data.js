// "的" structure noun-phrase typing bank for Battleship grammar mode.
// Each item practises an XXX 的 Y noun phrase and accepts one or more noun-phrase answers.
(function () {
    const rows = [
        ["一隻快樂的狗", ["A happy dog"], "simple_adjective", "Simple adjective goes before the noun."],
        ["一部昂貴但沒用的電腦", ["An expensive but useless computer"], "simple_adjective", "Adjectives joined by but still go before the noun."],
        ["一隻白色的貓", ["A white cat"], "simple_adjective", "Simple adjective goes before the noun."],
        ["一些便宜而且有趣的玩具", ["Some cheap and interesting toys"], "simple_adjective", "Use plural toys after some."],
        ["一台新但慢的電腦", ["A new but slow computer"], "simple_adjective", "Simple adjectives go before the noun."],
        ["一個有趣而且有用的課堂", ["An interesting and useful lesson"], "simple_adjective", "Adjectives go before the noun."],
        ["一隻便宜而且好看的手錶", ["A cheap and good-looking watch"], "simple_adjective", "Adjectives go before the noun."],
        ["一間五星的酒店", ["A five-star hotel", "A 5-star hotel"], "compound_adjective", "Number + measure adjective uses hyphens before a noun."],
        ["一間有三百年歷史的酒店", ["A 300-year-old hotel", "A three-hundred-year-old hotel"], "compound_adjective", "Year stays singular in a compound adjective."],
        ["一本200頁的筆記簿", ["A 200-page notebook", "A two-hundred-page notebook"], "compound_adjective", "Page stays singular in a compound adjective."],
        ["一個5歲的女孩", ["A 5-year-old girl", "A five-year-old girl"], "compound_adjective", "Year stays singular in a compound adjective."],
        ["一間三星的餐廳", ["A 3-star restaurant", "A three-star restaurant"], "compound_adjective", "Star stays singular in a compound adjective."],
        ["一個5層的圖書館", ["A 5-story library", "A five-story library", "A 5-storey library", "A five-storey library"], "compound_adjective", "Story/storey stays singular in a compound adjective."],
        ["一個300年前寫的故事", ["A story written 300 years ago", "A story which was written 300 years ago", "A story that was written 300 years ago"], "passive_relative", "Passive relative clause can be reduced to a past participle phrase."],
        ["Tom的爸爸", ["Tom's father"], "possessive_person", "Use 's for one person."],
        ["很多學生的目標", ["Many students' aims", "Many students' goals"], "possessive_person", "Use s' after plural students."],
        ["我爸爸的帳戶", ["My father's account"], "possessive_person", "Use 's for one person."],
        ["那些小朋友的父母", ["Those children's parents"], "possessive_person", "Children is plural but does not end in s, so add 's."],
        ["Tom的眼鏡", ["Tom's glasses"], "possessive_person", "Use 's for one person."],
        ["很多學生的夢想", ["Many students' dreams"], "possessive_person", "Use s' after plural students."],
        ["一部有很多螢幕的電腦", ["A computer with many screens", "A computer which has many screens", "A computer that has many screens"], "with", "Use with after the noun for 有 + noun."],
        ["一些有很多問題的玩具", ["Some toys with many problems", "Some toys which have many problems", "Some toys that have many problems"], "with", "Use with after the noun for 有 + noun."],
        ["一間有很多商品的店", ["A shop with many products", "A shop which has many products", "A shop that has many products"], "with", "Use with after the noun for 有 + noun."],
        ["一本有很多圖片的書", ["A book with many pictures", "A book which has many pictures", "A book that has many pictures"], "with", "Use with after the noun for 有 + noun."],
        ["一條有很多鑽石的項鍊", ["A necklace with many diamonds", "A necklace which has many diamonds", "A necklace that has many diamonds"], "with", "Use with after the noun for 有 + noun."],
        ["一個有很多fans的歌手", ["A singer with many fans", "A singer who has many fans", "A singer that has many fans"], "with", "Use with or who has for people with something."],
        ["一部沒有任何按鈕的電腦", ["A computer without any buttons", "A computer which does not have any buttons", "A computer that does not have any buttons"], "without", "Use without after the noun for 沒有 + noun."],
        ["一個沒有窗戶的單位", ["An apartment without windows", "An apartment which does not have windows", "An apartment that does not have windows"], "without", "Use without after the noun for 沒有 + noun."],
        ["一間沒有任何員工的快餐店", ["A fast food shop without any staff", "A fast food restaurant without any staff", "A fast food shop which does not have any staff", "A fast food restaurant which does not have any staff"], "without", "Use without after the noun for 沒有 + noun."],
        ["一個沒有錢的銀包", ["A wallet without money", "A wallet which does not have money", "A wallet that does not have money"], "without", "Use without after the noun for 沒有 + noun."],
        ["一些沒有水的瓶子", ["Some bottles without water", "Some bottles which do not have water", "Some bottles that do not have water"], "without", "Use without after the noun for 沒有 + noun."],
        ["一間沒有空調的酒店", ["A hotel without air-con", "A hotel without air conditioning", "A hotel which does not have air-con", "A hotel that does not have air conditioning"], "without", "Use without after the noun for 沒有 + noun."],
        ["一隻可以跑得快的狗", ["A dog which can run fast", "A dog that can run fast"], "modal_relative", "Use which/that + modal verb for animals and things."],
        ["一個會改變世界的發明", ["An invention which will change the world", "An invention that will change the world"], "modal_relative", "Use which/that + will for things."],
        ["一個應該教得好的老師", ["A teacher who should teach well", "A teacher that should teach well"], "modal_relative", "Use who/that + modal verb for people."],
        ["很多將會離開的學生", ["Many students who will leave", "Many students that will leave"], "modal_relative", "Use who/that + will for people."],
        ["任何可以幫助他的人", ["Anyone who can help him", "Anyone that can help him"], "modal_relative", "Use who/that + can for people."],
        ["一個將會離開我們的老師", ["A teacher who will leave us", "A teacher that will leave us"], "modal_relative", "Use who/that + will for people."],
        ["一個可能明天去世的病人", ["A patient who may pass away tomorrow", "A patient that may pass away tomorrow"], "modal_relative", "Use who/that + may for people."],
        ["一隻快將死亡的狗", ["A dog about to die", "A dog which is about to die", "A dog that is about to die"], "compound_relative", "About to can go after the noun."],
        ["一條必須被刪除的題目", ["A question which must be deleted", "A question that must be deleted"], "passive_relative", "Use which/that + must be + past participle."],
        ["一個希望離開的學生", ["A student who hopes to leave", "A student that hopes to leave"], "active_relative", "Use who/that + verb for people."],
        ["一個從不閱讀的女孩", ["A girl who never reads", "A girl that never reads"], "active_relative", "Use who/that + verb for people."],
        ["一隻常常吠的狗", ["A dog which often barks", "A dog that often barks"], "active_relative", "Use which/that + verb for animals and things."],
        ["那個昨天去世的歌手", ["The singer who passed away yesterday", "The singer that passed away yesterday"], "active_relative", "Use who/that + past tense for people."],
        ["越來越多去過日本的青少年", ["More and more teenagers who have been to Japan", "More and more teenagers that have been to Japan"], "active_relative", "Use who/that + present perfect for people."],
        ["昨天來的那個女人", ["The woman who came yesterday", "The woman that came yesterday"], "active_relative", "Use who/that + past tense for people."],
        ["一個從不飲水的人", ["A person who never drinks water", "A person that never drinks water"], "active_relative", "Use who/that + verb for people."],
        ["一個父母常常面對的問題", ["A problem parents often face", "A problem which parents often face", "A problem that parents often face"], "object_relative", "Object relative pronoun can be omitted."],
        ["一個很多女孩喜歡的歌手", ["A singer many girls like", "A singer who many girls like", "A singer that many girls like"], "object_relative", "Object relative pronoun can be omitted."],
        ["一本上年寫的小說", ["A novel written last year", "A novel which was written last year", "A novel that was written last year"], "passive_relative", "Passive relative clause can be reduced to a past participle phrase."],
        ["一些常常被罰的學生", ["Some students often punished", "Some students who are often punished", "Some students that are often punished"], "passive_relative", "Passive relative clause can be reduced to a past participle phrase."],
        ["一隻今天早上殺的羊", ["A goat killed this morning", "A goat which was killed this morning", "A goat that was killed this morning"], "passive_relative", "Passive relative clause can be reduced to a past participle phrase."],
        ["一隻被照顧得好的狗", ["A dog looked after well", "A dog which was looked after well", "A dog that was looked after well"], "passive_relative", "Passive relative clause can be reduced to a past participle phrase."],
        ["一隻被中國製造的椅子", ["A chair made in China", "A chair which was made in China", "A chair that was made in China"], "passive_relative", "Passive relative clause can be reduced to a past participle phrase."],
        ["一個願意早點來的學生", ["A student willing to come earlier", "A student who is willing to come earlier", "A student that is willing to come earlier"], "compound_relative", "Adjective phrase can go after the noun."],
        ["願意幫我的學生", ["Students willing to help me", "Students who are willing to help me", "Students that are willing to help me"], "compound_relative", "Adjective phrase can go after the noun."],
        ["願意學習英文的學生", ["Students willing to learn English", "Students who are willing to learn English", "Students that are willing to learn English"], "compound_relative", "Adjective phrase can go after the noun."],
        ["昨天的會議", ["The meeting yesterday"], "time_after_noun", "Time words often go after the noun."],
        ["今天的天氣", ["The weather today"], "time_after_noun", "Time words often go after the noun."],
        ["明天的比賽", ["The game tomorrow"], "time_after_noun", "Time words often go after the noun."],
        ["昨晚的show", ["The show last night"], "time_after_noun", "Time words often go after the noun."],
        ["明天的考試", ["The exam tomorrow"], "time_after_noun", "Time words often go after the noun."],
        ["日本的天氣", ["The weather in Japan"], "place_after_noun", "Place phrase goes after the noun."],
        ["荃灣的餐廳", ["Restaurants in Tsuen Wan"], "place_after_noun", "Place phrase goes after the noun."],
        ["來自中國的學生", ["Students from China"], "place_after_noun", "Place phrase goes after the noun."],
        ["這裡的老師", ["Teachers here", "The teachers here"], "place_after_noun", "Place word goes after the noun."],
        ["機場的餐廳", ["Restaurants at the airport", "The restaurants at the airport"], "place_after_noun", "Place phrase goes after the noun."],
        ["中國的學生", ["Students in China"], "place_after_noun", "Place phrase goes after the noun."],
        ["一本關於中國的書", ["A book about China"], "about", "Use about after the noun."],
        ["一些關於他的消息", ["Some news about him"], "about", "Use about after the noun."],
        ["一本關於香港的書", ["A book about Hong Kong"], "about", "Use about after the noun."],
        ["這電腦的價格", ["The price of this computer"], "of_dead_thing", "For thing + thing, use the ... of ... and reverse the order."],
        ["那些水果的顏色", ["The colours of those fruits", "The colors of those fruits"], "of_dead_thing", "For thing + thing, use the ... of ... and reverse the order."],
        ["這手機的螢幕", ["The screen of this phone"], "of_dead_thing", "For thing + thing, use the ... of ... and reverse the order."],
        ["這椅子的設計", ["The design of this chair"], "of_dead_thing", "For thing + thing, use the ... of ... and reverse the order."],
        ["這件外套的牌子", ["The brand of this jacket"], "of_dead_thing", "For thing + thing, use the ... of ... and reverse the order."],
        ["那隻常常吠的狗", ["The dog which often barks", "The dog that often barks"], "active_relative", "Use which/that + verb for animals and things."],
        ["那隻今天死了的狗", ["The dog which died today", "The dog that died today"], "active_relative", "Use which/that + past tense for animals and things."],
        ["那個我從不去的國家", ["The country I never go to", "The country which I never go to", "The country that I never go to"], "object_relative", "Object relative pronoun can be omitted."],
        ["可以來的同學", ["Students who can come", "Students that can come"], "modal_relative", "Use who/that + can for people."],
        ["我昨天看到的那個手袋", ["The handbag I saw yesterday", "The handbag which I saw yesterday", "The handbag that I saw yesterday"], "object_relative", "Object relative pronoun can be omitted."],
        ["這本1958年寫的小說", ["This novel written in 1958", "This novel which was written in 1958", "This novel that was written in 1958"], "passive_relative", "Passive relative clause can be reduced to a past participle phrase."],
        ["我上星期買的那張椅子", ["The chair I bought last week", "The chair which I bought last week", "The chair that I bought last week"], "object_relative", "Object relative pronoun can be omitted."],
        ["由中國製造的椅子", ["Chairs made in China", "Chairs which were made in China", "Chairs that were made in China"], "passive_relative", "Passive relative clause can be reduced to a past participle phrase."],
        ["常常買手袋的女孩", ["Girls who often buy handbags", "Girls that often buy handbags"], "active_relative", "Use who/that + verb for people."],
        ["快將過期的食物", ["Food which will expire soon", "Food that will expire soon"], "modal_relative", "Use which/that + will for things."],
        ["那部你推薦的電話", ["The phone you recommend", "The phone which you recommend", "The phone that you recommend"], "object_relative", "Object relative pronoun can be omitted."],
        ["可能有地震的國家", ["Countries which may have earthquakes", "Countries that may have earthquakes"], "modal_relative", "Use which/that + may for things."],
        ["那隻正在睡覺的狗", ["The dog which is sleeping", "The dog that is sleeping", "The sleeping dog"], "active_relative", "Use which/that + be + -ing, or an -ing adjective before the noun."],
        ["這間上個月被很多人推薦的餐廳", ["This restaurant recommended by many people last month", "This restaurant which was recommended by many people last month", "This restaurant that was recommended by many people last month"], "passive_relative", "Passive relative clause can be reduced to a past participle phrase."],
        ["一個5歲的男孩", ["A 5-year-old boy", "A five-year-old boy"], "compound_adjective", "Year stays singular in a compound adjective."],
        ["一間十層的商場", ["A 10-story mall", "A ten-story mall", "A 10-storey mall", "A ten-storey mall"], "compound_adjective", "Story/storey stays singular in a compound adjective."],
        ["一部沒有螢幕的電話", ["A phone without a screen", "A phone which does not have a screen", "A phone that does not have a screen"], "without", "Use without after the noun for 沒有 + noun."],
        ["一個有三個妹妹的學生", ["A student with three younger sisters", "A student who has three younger sisters", "A student that has three younger sisters"], "with", "Use with or who has for people with something."],
        ["一個會說英文的導遊", ["A guide who can speak English", "A guide that can speak English"], "modal_relative", "Use who/that + can for people."],
        ["一部昨天買的電腦", ["A computer bought yesterday", "A computer which was bought yesterday", "A computer that was bought yesterday"], "passive_relative", "Passive relative clause can be reduced to a past participle phrase."],
        ["一個我信任的朋友", ["A friend I trust", "A friend who I trust", "A friend that I trust"], "object_relative", "Object relative pronoun can be omitted."],
        ["一個我永遠不會忘記的地方", ["A place I will never forget", "A place which I will never forget", "A place that I will never forget"], "object_relative", "Object relative pronoun can be omitted."],
        ["一本老師推薦的書", ["A book recommended by the teacher", "A book which was recommended by the teacher", "A book that was recommended by the teacher"], "passive_relative", "Passive relative clause can be reduced to a past participle phrase."],
        ["一個正在哭的嬰兒", ["A baby who is crying", "A baby that is crying", "A crying baby"], "active_relative", "Use who/that + be + -ing for people."],
        ["一個住在香港的作家", ["A writer who lives in Hong Kong", "A writer that lives in Hong Kong"], "active_relative", "Use who/that + verb for people."],
        ["一間位於中環的銀行", ["A bank in Central", "A bank which is in Central", "A bank that is in Central"], "place_after_noun", "Place phrase goes after the noun."],
        ["一份關於環保的報告", ["A report about environmental protection", "A report about the environment"], "about", "Use about after the noun."]
    ];

    function normalizeCategory(category) {
        return String(category || 'de_structure')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '') || 'de_structure';
    }

    function normalizeAnswer(answer) {
        return String(answer || '').trim().replace(/[.。]+$/g, '');
    }

    function addAnswerVariant(answerSet, answer) {
        const normalized = normalizeAnswer(answer);
        if (normalized) answerSet.add(normalized);
    }

    function expandAcceptedAnswers(answers, category) {
        const baseAnswers = answers.map(normalizeAnswer).filter(Boolean);
        const answerSet = new Set(baseAnswers);
        const hasWhoAnswer = baseAnswers.some(answer => /\bwho\b/i.test(answer));
        const hasWhichAnswer = baseAnswers.some(answer => /\bwhich\b/i.test(answer));
        const canOmitObjectPronoun = category === 'object_relative';
        const canReduceBePhrase = category === 'passive_relative' || category === 'compound_relative';

        baseAnswers.forEach((answer) => {
            if (/\bwhich\b/i.test(answer)) addAnswerVariant(answerSet, answer.replace(/\bwhich\b/gi, 'that'));
            if (/\bwho\b/i.test(answer)) addAnswerVariant(answerSet, answer.replace(/\bwho\b/gi, 'that'));
            if (/\bwhom\b/i.test(answer)) {
                addAnswerVariant(answerSet, answer.replace(/\bwhom\b/gi, 'who'));
                addAnswerVariant(answerSet, answer.replace(/\bwhom\b/gi, 'that'));
            }
            if (/\bthat\b/i.test(answer) && hasWhoAnswer) addAnswerVariant(answerSet, answer.replace(/\bthat\b/gi, 'who'));
            if (/\bthat\b/i.test(answer) && hasWhichAnswer) addAnswerVariant(answerSet, answer.replace(/\bthat\b/gi, 'which'));

            if (canOmitObjectPronoun) {
                addAnswerVariant(answerSet, answer.replace(/\b(which|that|who|whom)\s+/i, ''));
                if (/\bwho\b/i.test(answer)) addAnswerVariant(answerSet, answer.replace(/\bwho\b/gi, 'whom'));
            }

            if (canReduceBePhrase) {
                addAnswerVariant(answerSet, answer.replace(/\b(which|that|who)\s+(is|are|was|were)\s+/i, ''));
            }
        });

        return Array.from(answerSet);
    }

    window.GRAMMAR_DE_STRUCTURE_BANK = rows.slice(0, 100).map((row, index) => {
        const [chinese, answers, category, hint] = row;
        const cleanCategory = normalizeCategory(category);
        const rawAnswers = Array.isArray(answers) ? answers : [answers];
        const acceptedAnswers = expandAcceptedAnswers(rawAnswers, cleanCategory);
        const primaryAnswer = acceptedAnswers[0] || '';

        return {
            id: `de_structure_${String(index + 1).padStart(3, '0')}`,
            chinese,
            tense: 'de_structure',
            voice: cleanCategory,
            tenses: ['de_structure'],
            voices: [cleanCategory],
            category: cleanCategory,
            question: '______',
            answers: Array.from(new Set(acceptedAnswers)),
            answerSlots: [primaryAnswer],
            exp: hint
        };
    });
})();
