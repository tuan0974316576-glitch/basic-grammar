// Common phrasal verb multiple-choice bank for Battleship grammar mode.
(function () {
    const rawQuestions = [
        {
            chinese: "我想不出這條數學題的答案。",
            question: "I cannot ______ the answer to this maths problem.",
            answer: "work out",
            options: ["work out", "turn down", "pass away", "look up to", "put off"],
            explanation: "work out = 解決/計出答案"
        },
        {
            chinese: "我們要想出一個新計劃。",
            question: "We need to ______ a new plan.",
            answer: "come up with",
            options: ["give up", "come up with", "look after", "run out of", "pass out"],
            explanation: "come up with = 想出/提出"
        },
        {
            chinese: "很多學生都尊敬這位老師。",
            question: "Many students ______ this teacher.",
            answer: "look up to",
            options: ["look down on", "look up to", "turn off", "put away", "call back"],
            explanation: "look up to = 尊敬"
        },
        {
            chinese: "我不想拒絕你的邀請。",
            question: "I do not want to ______ your invitation.",
            answer: "turn down",
            options: ["take off", "turn down", "hold on", "come in", "back up"],
            explanation: "turn down = 拒絕"
        },
        {
            chinese: "音樂太大聲，請把音量調低。",
            question: "The music is too loud. Please ______ the volume.",
            answer: "turn down",
            options: ["turn down", "set up", "break into", "look over", "go out"],
            explanation: "turn down = 調低音量"
        },
        {
            chinese: "如果你不喝水，你可能會暈倒。",
            question: "You may ______ if you do not drink water.",
            answer: "pass out",
            options: ["pass away", "pass out", "go over", "grow up", "hand in"],
            explanation: "pass out = 暈倒"
        },
        {
            chinese: "班長會派發工作紙。",
            question: "The class monitor will ______ the worksheets.",
            answer: "pass out",
            options: ["pass out", "pass by", "look for", "make up for", "take after"],
            explanation: "pass out = 派發"
        },
        {
            chinese: "那隻年老的狗昨晚離世了。",
            question: "The old dog sadly ______ last night.",
            answer: "passed away",
            options: ["passed out", "passed away", "gave back", "showed up", "got over"],
            explanation: "pass away = 離世"
        },
        {
            chinese: "不要放棄你的夢想。",
            question: "Do not ______ your dream.",
            answer: "give up",
            options: ["give up", "put on", "check in", "eat out", "slow down"],
            explanation: "give up = 放棄"
        },
        {
            chinese: "我每天早上六點起床。",
            question: "I ______ at six every morning.",
            answer: "get up",
            options: ["get up", "get over", "put out", "come out", "take away"],
            explanation: "get up = 起床"
        },
        {
            chinese: "請明天早點醒來。",
            question: "Please ______ early tomorrow.",
            answer: "wake up",
            options: ["wake up", "warm up", "sign up for", "turn around", "look into"],
            explanation: "wake up = 醒來"
        },
        {
            chinese: "我會照顧你的貓。",
            question: "I will ______ your cat.",
            answer: "look after",
            options: ["look after", "look through", "call off", "cut down on", "drop by"],
            explanation: "look after = 照顧"
        },
        {
            chinese: "他正在尋找他的校服。",
            question: "He is trying to ______ his school uniform.",
            answer: "look for",
            options: ["look for", "look up to", "bring back", "pay back", "speed up"],
            explanation: "look for = 尋找"
        },
        {
            chinese: "我們要查明誰拿走了手提電腦。",
            question: "We need to ______ who took the laptop.",
            answer: "find out",
            options: ["find out", "fill in", "fall behind", "come back", "put away"],
            explanation: "find out = 查明/發現"
        },
        {
            chinese: "爸爸會在車站接我。",
            question: "Dad will ______ me at the station.",
            answer: "pick up",
            options: ["pick up", "point out", "make up", "turn on", "hang out"],
            explanation: "pick up = 接載"
        },
        {
            chinese: "小朋友可以很快學會新字。",
            question: "Children can ______ new words quickly.",
            answer: "pick up",
            options: ["pick up", "put off", "pass away", "call for", "break out"],
            explanation: "pick up = 學會"
        },
        {
            chinese: "天氣冷，請穿上外套。",
            question: "It is cold. Please ______ your jacket.",
            answer: "put on",
            options: ["put on", "put out", "take over", "come across", "log out"],
            explanation: "put on = 穿上"
        },
        {
            chinese: "進入課室前請脫下帽子。",
            question: "Please ______ your cap before entering the classroom.",
            answer: "take off",
            options: ["take off", "take after", "set up", "go over", "let down"],
            explanation: "take off = 脫下"
        },
        {
            chinese: "飛機會在十分鐘後起飛。",
            question: "The plane will ______ in ten minutes.",
            answer: "take off",
            options: ["take off", "take away", "break down", "look around", "call back"],
            explanation: "take off = 起飛"
        },
        {
            chinese: "請開燈。",
            question: "Please ______ the lights.",
            answer: "turn on",
            options: ["turn on", "turn down", "throw away", "run into", "check out"],
            explanation: "turn on = 開啟"
        },
        {
            chinese: "離開前請關掉電腦。",
            question: "Please ______ the computer before you leave.",
            answer: "turn off",
            options: ["turn off", "turn around", "pass on", "come in", "try out"],
            explanation: "turn off = 關掉"
        },
        {
            chinese: "我們不得不延遲旅行。",
            question: "We had to ______ the trip.",
            answer: "put off",
            options: ["put off", "put on", "go out", "bring up", "hold on"],
            explanation: "put off = 延遲"
        },
        {
            chinese: "因為大雨，他們取消了比賽。",
            question: "They had to ______ the match because of heavy rain.",
            answer: "call off",
            options: ["call off", "call back", "clean up", "catch up with", "come out"],
            explanation: "call off = 取消"
        },
        {
            chinese: "雖然很累，我們仍然繼續工作。",
            question: "Although we were tired, we decided to ______ working.",
            answer: "carry on",
            options: ["carry on", "carry out", "get away with", "look down on", "check in"],
            explanation: "carry on = 繼續"
        },
        {
            chinese: "我偶然發現了一張舊照片。",
            question: "I ______ an old photo while cleaning my room.",
            answer: "came across",
            options: ["came across", "came in", "turned off", "looked after", "paid back"],
            explanation: "come across = 偶然發現"
        },
        {
            chinese: "我昨天在商場偶遇 Sam。",
            question: "I ______ Sam at the shopping centre yesterday.",
            answer: "ran into",
            options: ["ran into", "ran out of", "looked through", "set up", "warmed up"],
            explanation: "run into = 偶遇"
        },
        {
            chinese: "她和同學相處得很好。",
            question: "She can ______ her classmates very well.",
            answer: "get along with",
            options: ["get along with", "get rid of", "turn down", "log in", "make up"],
            explanation: "get along with = 與人相處"
        },
        {
            chinese: "如果你缺課，你會落後。",
            question: "If you miss classes, you may ______.",
            answer: "fall behind",
            options: ["fall behind", "fall over", "look up", "take off", "hang out"],
            explanation: "fall behind = 落後"
        },
        {
            chinese: "我要努力追上其他學生。",
            question: "I need to work hard to ______ the other students.",
            answer: "catch up with",
            options: ["catch up with", "cut down on", "come up with", "throw away", "take away"],
            explanation: "catch up with = 追上"
        },
        {
            chinese: "請明天交功課。",
            question: "Please ______ your homework tomorrow.",
            answer: "hand in",
            options: ["hand in", "hand out", "hold on", "come back", "look around"],
            explanation: "hand in = 交上"
        },
        {
            chinese: "老師會派發測驗卷。",
            question: "The teacher will ______ the quiz papers.",
            answer: "hand out",
            options: ["hand out", "hand in", "get up", "turn on", "back up"],
            explanation: "hand out = 派發"
        },
        {
            chinese: "請填寫這份表格。",
            question: "Please ______ this form.",
            answer: "fill in",
            options: ["fill in", "find out", "give up", "check out", "point out"],
            explanation: "fill in = 填寫"
        },
        {
            chinese: "請寫下你的電話號碼。",
            question: "Please ______ your phone number.",
            answer: "write down",
            options: ["write down", "slow down", "put away", "come out", "try on"],
            explanation: "write down = 寫下"
        },
        {
            chinese: "你可以在字典查這個字。",
            question: "You can ______ this word in a dictionary.",
            answer: "look up",
            options: ["look up", "look after", "call off", "break into", "sign up for"],
            explanation: "look up = 查閱"
        },
        {
            chinese: "警方會調查這宗案件。",
            question: "The police will ______ the case.",
            answer: "look into",
            options: ["look into", "look for", "pass out", "go out", "put on"],
            explanation: "look into = 調查"
        },
        {
            chinese: "我們很期待學校旅行。",
            question: "We ______ the school picnic.",
            answer: "look forward to",
            options: ["look forward to", "look down on", "get over", "turn off", "drop by"],
            explanation: "look forward to = 期待"
        },
        {
            chinese: "升降機可能會再次壞掉。",
            question: "The lift may ______ again.",
            answer: "break down",
            options: ["break down", "break into", "eat out", "give back", "check in"],
            explanation: "break down = 機器壞掉"
        },
        {
            chinese: "冷靜下來，慢慢告訴我發生甚麼事。",
            question: "Please ______ and tell me what happened.",
            answer: "calm down",
            options: ["calm down", "cool down", "take over", "look over", "put off"],
            explanation: "calm down = 冷靜下來"
        },
        {
            chinese: "別傷心，我會令你開心起來。",
            question: "Do not be sad. I will try to ______ you.",
            answer: "cheer up",
            options: ["cheer up", "speed up", "pass away", "fill in", "call for"],
            explanation: "cheer up = 使開心起來"
        },
        {
            chinese: "我長大後想做醫生。",
            question: "I want to be a doctor when I ______.",
            answer: "grow up",
            options: ["grow up", "get up", "show up", "cut down on", "run out of"],
            explanation: "grow up = 長大"
        },
        {
            chinese: "他沒有準時出現。",
            question: "He did not ______ on time.",
            answer: "show up",
            options: ["show up", "set up", "turn around", "work on", "pass on"],
            explanation: "show up = 出現/到場"
        },
        {
            chinese: "他們想成立一個英文學會。",
            question: "They want to ______ an English club.",
            answer: "set up",
            options: ["set up", "speed up", "make up for", "look through", "take off"],
            explanation: "set up = 成立/設立"
        },
        {
            chinese: "晚飯後請清理廚房。",
            question: "Please ______ the kitchen after dinner.",
            answer: "clean up",
            options: ["clean up", "cheer up", "come in", "log in", "go over"],
            explanation: "clean up = 清理"
        },
        {
            chinese: "你的房間很亂，請整理一下。",
            question: "Your room is messy. Please ______.",
            answer: "tidy up",
            options: ["tidy up", "warm up", "bring up", "hand in", "pass by"],
            explanation: "tidy up = 整理"
        },
        {
            chinese: "不要扔掉這些舊書。",
            question: "Do not ______ these old books.",
            answer: "throw away",
            options: ["throw away", "take away", "look into", "get along with", "hold on"],
            explanation: "throw away = 扔掉"
        },
        {
            chinese: "我們的紙快用完了。",
            question: "We are going to ______ paper soon.",
            answer: "run out of",
            options: ["run out of", "run into", "turn on", "pick up", "come across"],
            explanation: "run out of = 用完"
        },
        {
            chinese: "他用了兩星期才病癒。",
            question: "It took him two weeks to ______ the flu.",
            answer: "get over",
            options: ["get over", "get up", "pass out", "put out", "look up to"],
            explanation: "get over = 康復/克服"
        },
        {
            chinese: "我們需要清除這些舊箱。",
            question: "We need to ______ these old boxes.",
            answer: "get rid of",
            options: ["get rid of", "get along with", "call back", "go out", "back up"],
            explanation: "get rid of = 清除/擺脫"
        },
        {
            chinese: "不要在飯桌上提出這個問題。",
            question: "Do not ______ this problem at dinner.",
            answer: "bring up",
            options: ["bring up", "bring back", "turn off", "look for", "try out"],
            explanation: "bring up = 提出話題"
        },
        {
            chinese: "她由祖母撫養長大。",
            question: "Her grandmother helped to ______ her.",
            answer: "bring up",
            options: ["bring up", "bring back", "pass on", "fall behind", "eat out"],
            explanation: "bring up = 撫養"
        },
        {
            chinese: "這首歌令我想起童年。",
            question: "This song can ______ memories of my childhood.",
            answer: "bring back",
            options: ["bring back", "give back", "slow down", "look around", "call off"],
            explanation: "bring back = 使想起"
        },
        {
            chinese: "Tom 很像他的爸爸。",
            question: "Tom really ______ his father.",
            answer: "takes after",
            options: ["takes after", "looks after", "turns down", "checks in", "passes out"],
            explanation: "take after = 像某位家人"
        },
        {
            chinese: "請快速檢查你的答案。",
            question: "Please ______ your answers quickly.",
            answer: "look over",
            options: ["look over", "look up", "come back", "put away", "break out"],
            explanation: "look over = 快速檢查"
        },
        {
            chinese: "考試前我們應該溫習筆記。",
            question: "We should ______ our notes before the test.",
            answer: "go over",
            options: ["go over", "go on", "pass away", "turn around", "set up"],
            explanation: "go over = 溫習/檢查"
        },
        {
            chinese: "有空時請順道探望我。",
            question: "Please ______ when you are free.",
            answer: "drop by",
            options: ["drop by", "break down", "fill in", "take away", "log out"],
            explanation: "drop by = 順道拜訪"
        },
        {
            chinese: "我們要在下午三點登記入住酒店。",
            question: "We need to ______ at the hotel at 3 p.m.",
            answer: "check in",
            options: ["check in", "check out", "hand out", "look down on", "work on"],
            explanation: "check in = 登記入住/報到"
        },
        {
            chinese: "我們明天早上要退房。",
            question: "We have to ______ of the hotel tomorrow morning.",
            answer: "check out",
            options: ["check out", "check in", "cut down on", "wake up", "come in"],
            explanation: "check out = 退房"
        },
        {
            chinese: "請用你的密碼登入。",
            question: "Please ______ with your password.",
            answer: "log in",
            options: ["log in", "log out", "look into", "call for", "put off"],
            explanation: "log in = 登入"
        },
        {
            chinese: "離開電腦室前請登出。",
            question: "Please ______ before leaving the computer room.",
            answer: "log out",
            options: ["log out", "log in", "turn on", "clean up", "catch up with"],
            explanation: "log out = 登出"
        },
        {
            chinese: "你可以把這個訊息轉告 Mary 嗎？",
            question: "Can you ______ this message to Mary?",
            answer: "pass on",
            options: ["pass on", "pass out", "make up", "look for", "get rid of"],
            explanation: "pass on = 轉告/傳遞"
        },
        {
            chinese: "不要編造藉口。",
            question: "Do not ______ an excuse.",
            answer: "make up",
            options: ["make up", "make up for", "show up", "throw away", "look over"],
            explanation: "make up = 編造"
        },
        {
            chinese: "他們吵架後和好了。",
            question: "They argued, but they decided to ______ later.",
            answer: "make up",
            options: ["make up", "give up", "turn down", "break into", "go out"],
            explanation: "make up = 和好"
        },
        {
            chinese: "我會努力彌補我的錯誤。",
            question: "I will try to ______ my mistake.",
            answer: "make up for",
            options: ["make up for", "come up with", "pay back", "run into", "look around"],
            explanation: "make up for = 彌補"
        },
        {
            chinese: "我不能忍受這種噪音。",
            question: "I cannot ______ this noise.",
            answer: "put up with",
            options: ["put up with", "put away", "take off", "come out", "sign up for"],
            explanation: "put up with = 忍受"
        },
        {
            chinese: "如果你不溫習，你會跟不上進度。",
            question: "If you do not revise, you cannot ______ the class.",
            answer: "keep up with",
            options: ["keep up with", "catch up with", "call back", "pass by", "try on"],
            explanation: "keep up with = 跟上"
        },
        {
            chinese: "我們應該減少吃糖。",
            question: "We should ______ sugar.",
            answer: "cut down on",
            options: ["cut down on", "look down on", "fall behind", "bring back", "check out"],
            explanation: "cut down on = 減少"
        },
        {
            chinese: "他作弊卻沒有受罰。",
            question: "He cheated but managed to ______ it.",
            answer: "get away with",
            options: ["get away with", "get over", "turn off", "back up", "drop by"],
            explanation: "get away with = 做錯事但避過懲罰"
        },
        {
            chinese: "小偷闖入了那間店舖。",
            question: "The thief tried to ______ the shop.",
            answer: "break into",
            options: ["break into", "break down", "hand in", "grow up", "look up"],
            explanation: "break into = 闖入"
        },
        {
            chinese: "戰爭突然爆發。",
            question: "A war may ______ if both sides refuse to talk.",
            answer: "break out",
            options: ["break out", "break into", "calm down", "turn down", "give back"],
            explanation: "break out = 爆發"
        },
        {
            chinese: "我稍後會回電給你。",
            question: "I will ______ you later.",
            answer: "call back",
            options: ["call back", "call off", "look through", "take away", "warm up"],
            explanation: "call back = 回電"
        },
        {
            chinese: "請晚飯前回來。",
            question: "Please ______ before dinner.",
            answer: "come back",
            options: ["come back", "come up with", "hand out", "put out", "speed up"],
            explanation: "come back = 回來"
        },
        {
            chinese: "請進來坐下。",
            question: "Please ______ and sit down.",
            answer: "come in",
            options: ["come in", "come out", "run out of", "look up to", "pay back"],
            explanation: "come in = 進來"
        },
        {
            chinese: "這本新書將於六月出版。",
            question: "The new book will ______ in June.",
            answer: "come out",
            options: ["come out", "come across", "take over", "put off", "log in"],
            explanation: "come out = 出版/推出"
        },
        {
            chinese: "我們今晚外出看電影。",
            question: "We will ______ for a movie tonight.",
            answer: "go out",
            options: ["go out", "go on", "fill in", "pass on", "cheer up"],
            explanation: "go out = 外出"
        },
        {
            chinese: "我們星期五通常出外用膳。",
            question: "We usually ______ on Fridays.",
            answer: "eat out",
            options: ["eat out", "find out", "slow down", "set up", "look after"],
            explanation: "eat out = 出外用膳"
        },
        {
            chinese: "放學後我們常在圖書館消磨時間。",
            question: "We often ______ at the library after school.",
            answer: "hang out",
            options: ["hang out", "hand in", "get rid of", "turn on", "break out"],
            explanation: "hang out = 消磨時間/聚在一起"
        },
        {
            chinese: "老師指出了我的錯處。",
            question: "The teacher helped to ______ my mistake.",
            answer: "point out",
            options: ["point out", "pass out", "make up for", "take off", "come back"],
            explanation: "point out = 指出"
        },
        {
            chinese: "買之前你應該試穿這件外套。",
            question: "You should ______ this coat before buying it.",
            answer: "try on",
            options: ["try on", "try out", "throw away", "look into", "call off"],
            explanation: "try on = 試穿"
        },
        {
            chinese: "我們可以試用這個新程式。",
            question: "We can ______ this new program.",
            answer: "try out",
            options: ["try out", "try on", "take after", "go over", "pass by"],
            explanation: "try out = 試用"
        },
        {
            chinese: "我想報名參加游泳班。",
            question: "I want to ______ a swimming course.",
            answer: "sign up for",
            options: ["sign up for", "show up", "put away", "get along with", "work out"],
            explanation: "sign up for = 報名參加"
        },
        {
            chinese: "記得備份你的功課。",
            question: "Remember to ______ your homework file.",
            answer: "back up",
            options: ["back up", "bring up", "check in", "look over", "cool down"],
            explanation: "back up = 備份"
        },
        {
            chinese: "請把我的筆還給我。",
            question: "Please ______ my pen to me.",
            answer: "give back",
            options: ["give back", "give up", "come in", "put on", "cut down on"],
            explanation: "give back = 歸還"
        },
        {
            chinese: "我下星期會還錢給你。",
            question: "I will ______ the money next week.",
            answer: "pay back",
            options: ["pay back", "pass back", "look for", "turn around", "break down"],
            explanation: "pay back = 還錢"
        },
        {
            chinese: "請把這些碟拿走。",
            question: "Please ______ these plates.",
            answer: "take away",
            options: ["take away", "take off", "call for", "come across", "log out"],
            explanation: "take away = 拿走"
        },
        {
            chinese: "用完書後請把它們收好。",
            question: "Please ______ the books after using them.",
            answer: "put away",
            options: ["put away", "put up with", "wake up", "pass away", "hand out"],
            explanation: "put away = 收好"
        },
        {
            chinese: "請轉身看看黑板。",
            question: "Please ______ and look at the board.",
            answer: "turn around",
            options: ["turn around", "turn off", "get over", "go out", "clean up"],
            explanation: "turn around = 轉身"
        },
        {
            chinese: "車開得太快，請減速。",
            question: "The car is going too fast. Please ______.",
            answer: "slow down",
            options: ["slow down", "speed up", "bring back", "find out", "pass on"],
            explanation: "slow down = 減速"
        },
        {
            chinese: "我們快要遲到了，請加快速度。",
            question: "We are going to be late. Please ______.",
            answer: "speed up",
            options: ["speed up", "slow down", "look around", "give up", "drop by"],
            explanation: "speed up = 加速"
        },
        {
            chinese: "跑步前你應該熱身。",
            question: "You should ______ before running.",
            answer: "warm up",
            options: ["warm up", "wake up", "make up", "call back", "take away"],
            explanation: "warm up = 熱身"
        },
        {
            chinese: "運動後你應該放鬆冷靜一下。",
            question: "You should ______ after exercise.",
            answer: "cool down",
            options: ["cool down", "calm down", "log in", "come out", "fall behind"],
            explanation: "cool down = 運動後緩和/冷卻"
        },
        {
            chinese: "等一等，我快完成了。",
            question: "Please ______. I am almost finished.",
            answer: "hold on",
            options: ["hold on", "go on", "break into", "look forward to", "set up"],
            explanation: "hold on = 等一等"
        },
        {
            chinese: "不要令你的隊友失望。",
            question: "Do not ______ your teammates.",
            answer: "let down",
            options: ["let down", "look down on", "hand in", "pick up", "try on"],
            explanation: "let down = 令...失望"
        },
        {
            chinese: "我們不應該看不起別人。",
            question: "We should not ______ others.",
            answer: "look down on",
            options: ["look down on", "look up to", "put out", "check out", "run into"],
            explanation: "look down on = 看不起"
        },
        {
            chinese: "你可以四處看看這間新店。",
            question: "You can ______ the new shop.",
            answer: "look around",
            options: ["look around", "look after", "pass by", "take over", "write down"],
            explanation: "look around = 四處看看"
        },
        {
            chinese: "請快速翻閱這篇文章。",
            question: "Please ______ the article quickly.",
            answer: "look through",
            options: ["look through", "look into", "bring up", "turn down", "eat out"],
            explanation: "look through = 快速翻閱"
        },
        {
            chinese: "消防員很快撲滅了火。",
            question: "The firefighters quickly ______ the fire.",
            answer: "put out",
            options: ["put out", "put off", "take away", "come in", "get up"],
            explanation: "put out = 撲滅"
        },
        {
            chinese: "我今晚要做我的科學計劃。",
            question: "I need to ______ my science project tonight.",
            answer: "work on",
            options: ["work on", "work out", "pass out", "cheer up", "call for"],
            explanation: "work on = 做/處理"
        },
        {
            chinese: "學生會將執行這個計劃。",
            question: "The student union will ______ the plan.",
            answer: "carry out",
            options: ["carry out", "carry on", "log out", "look for", "turn on"],
            explanation: "carry out = 執行"
        },
        {
            chinese: "我終於弄明白這個問題。",
            question: "I finally ______ the problem.",
            answer: "figured out",
            options: ["figured out", "filled in", "gave back", "looked after", "showed up"],
            explanation: "figure out = 弄明白"
        },
        {
            chinese: "誰會接管這間公司？",
            question: "Who will ______ this company?",
            answer: "take over",
            options: ["take over", "take off", "put away", "break out", "wake up"],
            explanation: "take over = 接管"
        }
    ];

    window.GRAMMAR_PHRASAL_VERB_BANK = rawQuestions.map((item, index) => {
        const options = item.options.map(option => String(option || "").trim());
        return {
            id: `phrasal_verb_${String(index + 1).padStart(3, "0")}`,
            chinese: item.chinese,
            question: item.question,
            options,
            answer: item.answer,
            correctIndex: options.indexOf(item.answer),
            explanation: item.explanation
        };
    });
})();
