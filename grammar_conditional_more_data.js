// More signposted conditional drills. Gameplay lives in ui-grammar.js.
(function () {
    const moreQuestions = [
        {
            "id": "conditional_161",
            "rule": "0",
            "type": "0",
            "chinese": "科學事實：如果水達到零度，它會結冰。",
            "correct_tokens": ["If", "water", "reaches", "zero", "degrees", ",", "it", "freezes", "."],
            "distractors": ["will", "would", "reached", "froze"]
        },
        {
            "id": "conditional_162",
            "rule": "0",
            "type": "0",
            "chinese": "一般情況下，如果人們長期呼吸污濁空氣，他們的健康會變差。",
            "correct_tokens": ["If", "people", "breathe", "dirty", "air", "for", "a", "long", "time", ",", "their", "health", "suffers", "."],
            "distractors": ["will", "would", "breathed", "suffered"]
        },
        {
            "id": "conditional_163",
            "rule": "0",
            "type": "0",
            "chinese": "自然規律：如果你把冰放在陽光下，它會融化。",
            "correct_tokens": ["If", "you", "leave", "ice", "in", "the", "sun", ",", "it", "melts", "."],
            "distractors": ["will", "would", "left", "melted"]
        },
        {
            "id": "conditional_164",
            "rule": "0",
            "type": "0",
            "chinese": "一般情況下，如果學生缺席，他會錯過課堂。",
            "correct_tokens": ["If", "a", "student", "is", "absent", ",", "he", "misses", "the", "lesson", "."],
            "distractors": ["will", "would", "was", "missed"]
        },
        {
            "id": "conditional_165",
            "rule": "0",
            "type": "0",
            "chinese": "一般情況下，如果升降機滿了，人們會等下一部。",
            "correct_tokens": ["If", "the", "lift", "is", "full", ",", "people", "wait", "for", "the", "next", "one", "."],
            "distractors": ["will", "would", "was", "waited"]
        },
        {
            "id": "conditional_166",
            "rule": "0",
            "type": "0",
            "chinese": "機器規律：如果你按電源按鈕，電腦會開機。",
            "correct_tokens": ["If", "you", "press", "the", "power", "button", ",", "the", "computer", "turns", "on", "."],
            "distractors": ["will", "would", "pressed", "turned"]
        },
        {
            "id": "conditional_167",
            "rule": "0",
            "type": "0",
            "chinese": "交通規則：如果司機看到紅燈，他們會停車。",
            "correct_tokens": ["If", "drivers", "see", "a", "red", "light", ",", "they", "stop", "."],
            "distractors": ["will", "would", "saw", "stopped"]
        },
        {
            "id": "conditional_168",
            "rule": "0",
            "type": "0",
            "chinese": "日常規律：如果食物沒有放在雪櫃，它會很快變壞。",
            "correct_tokens": ["If", "food", "is", "not", "kept", "in", "a", "fridge", ",", "it", "goes", "bad", "quickly", "."],
            "distractors": ["will", "would", "was", "went"]
        },
        {
            "id": "conditional_169",
            "rule": "0",
            "type": "0",
            "chinese": "每當我晚上喝咖啡，我會睡得不好。",
            "correct_tokens": ["If", "I", "drink", "coffee", "at", "night", ",", "I", "sleep", "badly", "."],
            "distractors": ["will", "would", "drank", "slept"]
        },
        {
            "id": "conditional_170",
            "rule": "0",
            "type": "0",
            "chinese": "科學事實：如果金屬變熱，它會膨脹。",
            "correct_tokens": ["If", "metal", "gets", "hot", ",", "it", "expands", "."],
            "distractors": ["will", "would", "got", "expanded"]
        },
        {
            "id": "conditional_171",
            "rule": "0",
            "type": "0",
            "chinese": "一般情況下，如果小朋友每天閱讀，他們的詞彙會增加。",
            "correct_tokens": ["If", "children", "read", "every", "day", ",", "their", "vocabulary", "improves", "."],
            "distractors": ["will", "would", "reads", "improved"]
        },
        {
            "id": "conditional_172",
            "rule": "0",
            "type": "0",
            "chinese": "科學事實：如果磁石接近鐵，它會吸住鐵。",
            "correct_tokens": ["If", "a", "magnet", "is", "close", "to", "iron", ",", "it", "pulls", "the", "iron", "."],
            "distractors": ["will", "would", "was", "pulled"]
        },
        {
            "id": "conditional_173",
            "rule": "0",
            "type": "0",
            "chinese": "一般情況下，如果網絡斷線，網課會停止。",
            "correct_tokens": ["If", "the", "internet", "is", "down", ",", "online", "lessons", "stop", "."],
            "distractors": ["will", "would", "was", "stopped"]
        },
        {
            "id": "conditional_174",
            "rule": "0",
            "type": "0",
            "chinese": "顏色規律：如果你混合黑色和白色，你會得到灰色。",
            "correct_tokens": ["If", "you", "mix", "black", "and", "white", ",", "you", "get", "grey", "."],
            "distractors": ["will", "would", "mixed", "got"]
        },
        {
            "id": "conditional_175",
            "rule": "0",
            "type": "0",
            "chinese": "一般情況下，如果人們睡眠不足，他們會感到疲倦。",
            "correct_tokens": ["If", "people", "do", "not", "sleep", "enough", ",", "they", "feel", "tired", "."],
            "distractors": ["will", "would", "slept", "felt"]
        },
        {
            "id": "conditional_176",
            "rule": "0",
            "type": "0",
            "chinese": "日常規律：如果你把紙放進水裡，它會變濕。",
            "correct_tokens": ["If", "you", "put", "paper", "in", "water", ",", "it", "becomes", "wet", "."],
            "distractors": ["will", "would", "puts", "became"]
        },
        {
            "id": "conditional_177",
            "rule": "0",
            "type": "0",
            "chinese": "學校規律：每當鐘聲響起，學生會去上課。",
            "correct_tokens": ["If", "the", "bell", "rings", "at", "school", ",", "students", "go", "to", "class", "."],
            "distractors": ["will", "would", "rang", "went"]
        },
        {
            "id": "conditional_178",
            "rule": "0",
            "type": "0",
            "chinese": "系統規律：如果密碼錯誤，系統會拒絕它。",
            "correct_tokens": ["If", "a", "password", "is", "wrong", ",", "the", "system", "rejects", "it", "."],
            "distractors": ["will", "would", "was", "rejected"]
        },
        {
            "id": "conditional_179",
            "rule": "0",
            "type": "0",
            "chinese": "一般情況下，如果商店關門，顧客會離開。",
            "correct_tokens": ["If", "a", "shop", "closes", ",", "customers", "leave", "."],
            "distractors": ["will", "would", "closed", "left"]
        },
        {
            "id": "conditional_180",
            "rule": "0",
            "type": "0",
            "chinese": "交通規律：如果路面濕滑，車輛需要更多時間停下來。",
            "correct_tokens": ["If", "the", "road", "is", "wet", ",", "cars", "need", "more", "time", "to", "stop", "."],
            "distractors": ["will", "would", "was", "needed"]
        },
        {
            "id": "conditional_181",
            "rule": "1",
            "type": "1",
            "chinese": "如果明天早上下雨，我們會把運動會移到室內。",
            "correct_tokens": ["If", "it", "rains", "tomorrow", "morning", ",", "we", "will", "move", "the", "sports", "day", "indoors", "."],
            "distractors": ["would", "rained", "had", "moved"]
        },
        {
            "id": "conditional_182",
            "rule": "1",
            "type": "1",
            "chinese": "如果你今晚提交表格，老師明天會檢查。",
            "correct_tokens": ["If", "you", "submit", "the", "form", "tonight", ",", "the", "teacher", "will", "check", "it", "tomorrow", "."],
            "distractors": ["would", "submitted", "had", "checked"]
        },
        {
            "id": "conditional_183",
            "rule": "1",
            "type": "1",
            "chinese": "如果 Peter 六點前到達，我們會提早開始會議。",
            "correct_tokens": ["If", "Peter", "arrives", "before", "six", ",", "we", "will", "start", "the", "meeting", "early", "."],
            "distractors": ["would", "arrived", "had", "started"]
        },
        {
            "id": "conditional_184",
            "rule": "1",
            "type": "1",
            "chinese": "如果校巴今天遲到，我會乘港鐵。",
            "correct_tokens": ["If", "the", "school", "bus", "is", "late", "today", ",", "I", "will", "take", "the", "MTR", "."],
            "distractors": ["would", "was", "had", "took"]
        },
        {
            "id": "conditional_185",
            "rule": "1",
            "type": "1",
            "chinese": "如果她今個月儲夠錢，她會買一部平板電腦。",
            "correct_tokens": ["If", "she", "saves", "enough", "money", "this", "month", ",", "she", "will", "buy", "a", "tablet", "."],
            "distractors": ["would", "saved", "had", "bought"]
        },
        {
            "id": "conditional_186",
            "rule": "1",
            "type": "1",
            "chinese": "如果他們下星期五贏得決賽，全班會慶祝。",
            "correct_tokens": ["If", "they", "win", "the", "final", "next", "Friday", ",", "the", "class", "will", "celebrate", "."],
            "distractors": ["would", "won", "had", "celebrated"]
        },
        {
            "id": "conditional_187",
            "rule": "1",
            "type": "1",
            "chinese": "如果你稍後忘記密碼，我會幫你重設。",
            "correct_tokens": ["If", "you", "forget", "your", "password", "later", ",", "I", "will", "help", "you", "reset", "it", "."],
            "distractors": ["would", "forgot", "had", "helped"]
        },
        {
            "id": "conditional_188",
            "rule": "1",
            "type": "1",
            "chinese": "如果餐廳今晚滿座，我們會去其他地方吃飯。",
            "correct_tokens": ["If", "the", "restaurant", "is", "full", "tonight", ",", "we", "will", "eat", "somewhere", "else", "."],
            "distractors": ["would", "was", "had", "ate"]
        },
        {
            "id": "conditional_189",
            "rule": "1",
            "type": "1",
            "chinese": "如果我的父母明天答應，我會參加營隊。",
            "correct_tokens": ["If", "my", "parents", "say", "yes", "tomorrow", ",", "I", "will", "join", "the", "camp", "."],
            "distractors": ["would", "said", "had", "joined"]
        },
        {
            "id": "conditional_190",
            "rule": "1",
            "type": "1",
            "chinese": "如果你今個星期溫習這些筆記，你會更明白測驗內容。",
            "correct_tokens": ["If", "you", "study", "these", "notes", "this", "week", ",", "you", "will", "understand", "the", "test", "better", "."],
            "distractors": ["would", "studied", "had", "understood"]
        },
        {
            "id": "conditional_191",
            "rule": "1",
            "type": "1",
            "chinese": "如果明天仍然懸掛颱風訊號，考試會取消。",
            "correct_tokens": ["If", "the", "typhoon", "signal", "is", "still", "up", "tomorrow", ",", "the", "exam", "will", "be", "cancelled", "."],
            "distractors": ["would", "was", "had", "cancelled"]
        },
        {
            "id": "conditional_192",
            "rule": "1",
            "type": "1",
            "chinese": "如果他今天道歉，她會原諒他。",
            "correct_tokens": ["If", "he", "apologises", "today", ",", "she", "will", "forgive", "him", "."],
            "distractors": ["would", "apologised", "had", "forgave"]
        },
        {
            "id": "conditional_193",
            "rule": "1",
            "type": "1",
            "chinese": "如果我們明天趕上第一班火車，我們會在中午前到達。",
            "correct_tokens": ["If", "we", "catch", "the", "first", "train", "tomorrow", ",", "we", "will", "arrive", "before", "noon", "."],
            "distractors": ["would", "caught", "had", "arrived"]
        },
        {
            "id": "conditional_194",
            "rule": "1",
            "type": "1",
            "chinese": "如果電腦稍後再次當機，我會把檔案儲存在另一部裝置。",
            "correct_tokens": ["If", "the", "computer", "crashes", "again", "later", ",", "I", "will", "save", "the", "file", "on", "another", "device", "."],
            "distractors": ["would", "crashed", "had", "saved"]
        },
        {
            "id": "conditional_195",
            "rule": "1",
            "type": "1",
            "chinese": "如果你明天帶課本，我會借筆記給你。",
            "correct_tokens": ["If", "you", "bring", "your", "textbook", "tomorrow", ",", "I", "will", "lend", "you", "my", "notes", "."],
            "distractors": ["would", "brought", "had", "lent"]
        },
        {
            "id": "conditional_196",
            "rule": "1",
            "type": "1",
            "chinese": "如果今天下午還有票，我們會看那套電影。",
            "correct_tokens": ["If", "there", "are", "tickets", "left", "this", "afternoon", ",", "we", "will", "watch", "the", "film", "."],
            "distractors": ["would", "were", "had", "watched"]
        },
        {
            "id": "conditional_197",
            "rule": "1",
            "type": "1",
            "chinese": "如果球隊放學後練習，星期五會表現得更好。",
            "correct_tokens": ["If", "the", "team", "practises", "after", "school", ",", "it", "will", "play", "better", "on", "Friday", "."],
            "distractors": ["would", "practised", "had", "played"]
        },
        {
            "id": "conditional_198",
            "rule": "1",
            "type": "1",
            "chinese": "如果我晚飯前完成專題，我會打電話給你。",
            "correct_tokens": ["If", "I", "finish", "the", "project", "before", "dinner", ",", "I", "will", "call", "you", "."],
            "distractors": ["would", "finished", "had", "called"]
        },
        {
            "id": "conditional_199",
            "rule": "1",
            "type": "1",
            "chinese": "如果圖書館星期日開門，我們會在那裡溫習。",
            "correct_tokens": ["If", "the", "library", "opens", "on", "Sunday", ",", "we", "will", "study", "there", "."],
            "distractors": ["would", "opened", "had", "studied"]
        },
        {
            "id": "conditional_200",
            "rule": "1",
            "type": "1",
            "chinese": "如果你考試時小心作答，你會取得更高分。",
            "correct_tokens": ["If", "you", "answer", "carefully", "in", "the", "exam", ",", "you", "will", "get", "a", "higher", "mark", "."],
            "distractors": ["would", "answered", "had", "got"]
        },
        {
            "id": "conditional_201",
            "rule": "2",
            "type": "2",
            "chinese": "可惜我現在不夠高；如果我更高，我就能碰到最上層的架子。",
            "correct_tokens": ["If", "I", "were", "taller", ",", "I", "would", "reach", "the", "top", "shelf", "."],
            "distractors": ["will", "am", "had", "reached"]
        },
        {
            "id": "conditional_202",
            "rule": "2",
            "type": "2",
            "chinese": "可惜我現在房間很嘈；如果我有一個安靜一點的房間，我會溫習得更好。",
            "correct_tokens": ["If", "I", "had", "a", "quieter", "room", ",", "I", "would", "study", "better", "."],
            "distractors": ["will", "have", "has", "studied"]
        },
        {
            "id": "conditional_203",
            "rule": "2",
            "type": "2",
            "chinese": "可惜他現在不知道答案；如果他知道答案，他會舉手。",
            "correct_tokens": ["If", "he", "knew", "the", "answer", "now", ",", "he", "would", "raise", "his", "hand", "."],
            "distractors": ["will", "knows", "had", "raised"]
        },
        {
            "id": "conditional_204",
            "rule": "2",
            "type": "2",
            "chinese": "可惜她現在怕狗；如果她不怕狗，她會來我家。",
            "correct_tokens": ["If", "she", "were", "not", "afraid", "of", "dogs", ",", "she", "would", "visit", "my", "home", "."],
            "distractors": ["will", "is", "had", "visited"]
        },
        {
            "id": "conditional_205",
            "rule": "2",
            "type": "2",
            "chinese": "可惜我們現在不住近車站；如果我們住近車站，我們就不用乘的士。",
            "correct_tokens": ["If", "we", "lived", "closer", "to", "the", "station", ",", "we", "would", "not", "take", "a", "taxi", "."],
            "distractors": ["will", "live", "had", "took"]
        },
        {
            "id": "conditional_206",
            "rule": "2",
            "type": "2",
            "chinese": "可惜我的電話現在壞了；如果我的電話現在能用，我會傳訊息給你。",
            "correct_tokens": ["If", "my", "phone", "worked", "now", ",", "I", "would", "send", "you", "a", "message", "."],
            "distractors": ["will", "works", "had", "sent"]
        },
        {
            "id": "conditional_207",
            "rule": "2",
            "type": "2",
            "chinese": "純粹假設：如果我會說日文，我會不用字幕看那套電影。",
            "correct_tokens": ["If", "I", "could", "speak", "Japanese", ",", "I", "would", "watch", "the", "film", "without", "subtitles", "."],
            "distractors": ["will", "can", "had", "watched"]
        },
        {
            "id": "conditional_208",
            "rule": "2",
            "type": "2",
            "chinese": "可惜我們課室現在沒有冷氣；如果我們課室有冷氣，學生會更舒服。",
            "correct_tokens": ["If", "our", "classroom", "had", "air-conditioning", ",", "students", "would", "feel", "more", "comfortable", "."],
            "distractors": ["will", "has", "have", "felt"]
        },
        {
            "id": "conditional_209",
            "rule": "2",
            "type": "2",
            "chinese": "可惜他現在不夠有耐性；如果他更有耐性，他會再解釋一次。",
            "correct_tokens": ["If", "he", "were", "more", "patient", ",", "he", "would", "explain", "it", "again", "."],
            "distractors": ["will", "is", "had", "explained"]
        },
        {
            "id": "conditional_210",
            "rule": "2",
            "type": "2",
            "chinese": "可惜我現在沒有你的地址；如果我有你的地址，我會寄邀請卡。",
            "correct_tokens": ["If", "I", "had", "your", "address", ",", "I", "would", "send", "the", "invitation", "."],
            "distractors": ["will", "have", "has", "sent"]
        },
        {
            "id": "conditional_211",
            "rule": "2",
            "type": "2",
            "chinese": "可惜測驗現在不容易；如果測驗容易一點，更多學生會完成。",
            "correct_tokens": ["If", "the", "test", "were", "easier", ",", "more", "students", "would", "finish", "it", "."],
            "distractors": ["will", "is", "had", "finished"]
        },
        {
            "id": "conditional_212",
            "rule": "2",
            "type": "2",
            "chinese": "可惜她現在不夠自信；如果她更有信心，她會參加演講比賽。",
            "correct_tokens": ["If", "she", "had", "more", "confidence", ",", "she", "would", "join", "the", "speech", "competition", "."],
            "distractors": ["will", "has", "have", "joined"]
        },
        {
            "id": "conditional_213",
            "rule": "2",
            "type": "2",
            "chinese": "可惜我們現在有課；如果我們現在沒有課，我們會打籃球。",
            "correct_tokens": ["If", "we", "did", "not", "have", "a", "lesson", "now", ",", "we", "would", "play", "basketball", "."],
            "distractors": ["will", "do", "had", "played"]
        },
        {
            "id": "conditional_214",
            "rule": "2",
            "type": "2",
            "chinese": "純粹假設：如果我是班長，我會保持課室更整潔。",
            "correct_tokens": ["If", "I", "were", "the", "class", "monitor", ",", "I", "would", "keep", "the", "room", "cleaner", "."],
            "distractors": ["will", "am", "had", "kept"]
        },
        {
            "id": "conditional_215",
            "rule": "2",
            "type": "2",
            "chinese": "可惜巴士現在太擠迫；如果巴士沒有那麼擠迫，我會上車。",
            "correct_tokens": ["If", "the", "bus", "were", "not", "so", "crowded", ",", "I", "would", "get", "on", "it", "."],
            "distractors": ["will", "is", "had", "got"]
        },
        {
            "id": "conditional_216",
            "rule": "2",
            "type": "2",
            "chinese": "可惜你現在沒有細心聽；如果你聽得更細心，你會明白指示。",
            "correct_tokens": ["If", "you", "listened", "more", "carefully", ",", "you", "would", "understand", "the", "instructions", "."],
            "distractors": ["will", "listen", "had", "understood"]
        },
        {
            "id": "conditional_217",
            "rule": "2",
            "type": "2",
            "chinese": "可惜我弟弟現在不夠年長；如果他年長一點，他會升上中學。",
            "correct_tokens": ["If", "my", "brother", "were", "older", ",", "he", "would", "go", "to", "secondary", "school", "."],
            "distractors": ["will", "is", "had", "went"]
        },
        {
            "id": "conditional_218",
            "rule": "2",
            "type": "2",
            "chinese": "可惜我現在不能選座位；如果我現在可以選，我會坐近窗邊。",
            "correct_tokens": ["If", "I", "could", "choose", "the", "seat", "now", ",", "I", "would", "sit", "near", "the", "window", "."],
            "distractors": ["will", "can", "had", "sat"]
        },
        {
            "id": "conditional_219",
            "rule": "2",
            "type": "2",
            "chinese": "可惜這個袋現在太貴；如果它便宜一點，我會買它。",
            "correct_tokens": ["If", "this", "bag", "were", "cheaper", ",", "I", "would", "buy", "it", "."],
            "distractors": ["will", "is", "had", "bought"]
        },
        {
            "id": "conditional_220",
            "rule": "2",
            "type": "2",
            "chinese": "可惜他們現在合作不夠好；如果他們有更好的團隊合作，他們會贏更多比賽。",
            "correct_tokens": ["If", "they", "had", "better", "teamwork", ",", "they", "would", "win", "more", "matches", "."],
            "distractors": ["will", "have", "has", "won"]
        },
        {
            "id": "conditional_221",
            "rule": "3",
            "type": "3",
            "chinese": "如果我昨天檢查了時間表，我就不會錯過巴士。",
            "correct_tokens": ["If", "I", "had", "checked", "the", "timetable", "yesterday", ",", "I", "would", "not", "have", "missed", "the", "bus", "."],
            "distractors": ["check", "will", "miss", "checked"]
        },
        {
            "id": "conditional_222",
            "rule": "3",
            "type": "3",
            "chinese": "如果她今天早上帶了雨傘，她就不會濕透。",
            "correct_tokens": ["If", "she", "had", "brought", "her", "umbrella", "this", "morning", ",", "she", "would", "not", "have", "got", "wet", "."],
            "distractors": ["brings", "will", "get", "brought"]
        },
        {
            "id": "conditional_223",
            "rule": "3",
            "type": "3",
            "chinese": "如果我們當時早點訂場，我們就會打到羽毛球。",
            "correct_tokens": ["If", "we", "had", "booked", "the", "court", "earlier", ",", "we", "would", "have", "played", "badminton", "."],
            "distractors": ["book", "will", "play", "booked"]
        },
        {
            "id": "conditional_224",
            "rule": "3",
            "type": "3",
            "chinese": "如果他上課時有聽書，他就會答到問題。",
            "correct_tokens": ["If", "he", "had", "listened", "in", "class", ",", "he", "would", "have", "answered", "the", "question", "."],
            "distractors": ["listens", "will", "answer", "listened"]
        },
        {
            "id": "conditional_225",
            "rule": "3",
            "type": "3",
            "chinese": "如果你在電腦當機前儲存文件，你就不會失去它。",
            "correct_tokens": ["If", "you", "had", "saved", "the", "document", "before", "the", "computer", "crashed", ",", "you", "would", "not", "have", "lost", "it", "."],
            "distractors": ["save", "will", "lose", "saved"]
        },
        {
            "id": "conditional_226",
            "rule": "3",
            "type": "3",
            "chinese": "如果他們當時早十分鐘出門，他們就會準時到達。",
            "correct_tokens": ["If", "they", "had", "left", "home", "ten", "minutes", "earlier", ",", "they", "would", "have", "arrived", "on", "time", "."],
            "distractors": ["leave", "will", "arrive", "left"]
        },
        {
            "id": "conditional_227",
            "rule": "3",
            "type": "3",
            "chinese": "如果我昨晚溫習了生字，我就會通過小測。",
            "correct_tokens": ["If", "I", "had", "studied", "the", "vocabulary", "last", "night", ",", "I", "would", "have", "passed", "the", "quiz", "."],
            "distractors": ["study", "will", "pass", "studied"]
        },
        {
            "id": "conditional_228",
            "rule": "3",
            "type": "3",
            "chinese": "如果守門員當時接住了球，我們隊就會贏。",
            "correct_tokens": ["If", "the", "goalkeeper", "had", "caught", "the", "ball", ",", "our", "team", "would", "have", "won", "."],
            "distractors": ["catches", "will", "win", "caught"]
        },
        {
            "id": "conditional_229",
            "rule": "3",
            "type": "3",
            "chinese": "如果她當時跟著食譜做，蛋糕就會更好吃。",
            "correct_tokens": ["If", "she", "had", "followed", "the", "recipe", ",", "the", "cake", "would", "have", "tasted", "better", "."],
            "distractors": ["follows", "will", "taste", "followed"]
        },
        {
            "id": "conditional_230",
            "rule": "3",
            "type": "3",
            "chinese": "如果我們當時帶了地圖，我們就不會迷路。",
            "correct_tokens": ["If", "we", "had", "taken", "a", "map", ",", "we", "would", "not", "have", "got", "lost", "."],
            "distractors": ["take", "will", "get", "took"]
        },
        {
            "id": "conditional_231",
            "rule": "3",
            "type": "3",
            "chinese": "如果他當時為平板電腦充電，他就會參加網課。",
            "correct_tokens": ["If", "he", "had", "charged", "his", "tablet", ",", "he", "would", "have", "joined", "the", "online", "lesson", "."],
            "distractors": ["charges", "will", "join", "charged"]
        },
        {
            "id": "conditional_232",
            "rule": "3",
            "type": "3",
            "chinese": "如果我早點看到你的訊息，我就會回覆。",
            "correct_tokens": ["If", "I", "had", "seen", "your", "message", "earlier", ",", "I", "would", "have", "replied", "."],
            "distractors": ["see", "will", "reply", "saw"]
        },
        {
            "id": "conditional_233",
            "rule": "3",
            "type": "3",
            "chinese": "如果他們當時穿了運動鞋，他們就會跑得更快。",
            "correct_tokens": ["If", "they", "had", "worn", "sports", "shoes", ",", "they", "would", "have", "run", "faster", "."],
            "distractors": ["wear", "will", "run", "wore"]
        },
        {
            "id": "conditional_234",
            "rule": "3",
            "type": "3",
            "chinese": "如果商店那天準時開門，我們就會買到早餐。",
            "correct_tokens": ["If", "the", "shop", "had", "opened", "on", "time", ",", "we", "would", "have", "bought", "breakfast", "."],
            "distractors": ["opens", "will", "buy", "opened"]
        },
        {
            "id": "conditional_235",
            "rule": "3",
            "type": "3",
            "chinese": "如果你音樂會前練習了鋼琴，你就會彈得更好。",
            "correct_tokens": ["If", "you", "had", "practised", "the", "piano", "before", "the", "concert", ",", "you", "would", "have", "played", "better", "."],
            "distractors": ["practise", "will", "play", "practised"]
        },
        {
            "id": "conditional_236",
            "rule": "3",
            "type": "3",
            "chinese": "如果我當時鎖了單車，它就不會被偷。",
            "correct_tokens": ["If", "I", "had", "locked", "the", "bike", ",", "it", "would", "not", "have", "been", "stolen", "."],
            "distractors": ["lock", "will", "steal", "locked"]
        },
        {
            "id": "conditional_237",
            "rule": "3",
            "type": "3",
            "chinese": "如果老師當時給了更清楚的指示，小組就會更早完成。",
            "correct_tokens": ["If", "the", "teacher", "had", "given", "clearer", "instructions", ",", "the", "group", "would", "have", "finished", "sooner", "."],
            "distractors": ["gives", "will", "finish", "gave"]
        },
        {
            "id": "conditional_238",
            "rule": "3",
            "type": "3",
            "chinese": "如果我們當時記得帶門票，我們就會進入博物館。",
            "correct_tokens": ["If", "we", "had", "remembered", "the", "tickets", ",", "we", "would", "have", "entered", "the", "museum", "."],
            "distractors": ["remember", "will", "enter", "remembered"]
        },
        {
            "id": "conditional_239",
            "rule": "3",
            "type": "3",
            "chinese": "如果他當時問路，他就不會去錯大廈。",
            "correct_tokens": ["If", "he", "had", "asked", "for", "directions", ",", "he", "would", "not", "have", "gone", "to", "the", "wrong", "building", "."],
            "distractors": ["asks", "will", "go", "asked"]
        },
        {
            "id": "conditional_240",
            "rule": "3",
            "type": "3",
            "chinese": "如果我上課前吃了午餐，我就不會覺得肚餓。",
            "correct_tokens": ["If", "I", "had", "eaten", "lunch", "before", "the", "lesson", ",", "I", "would", "not", "have", "felt", "hungry", "."],
            "distractors": ["eat", "will", "feel", "ate"]
        }
    ];

    window.GRAMMAR_CONDITIONAL_BANK = Array.isArray(window.GRAMMAR_CONDITIONAL_BANK)
        ? window.GRAMMAR_CONDITIONAL_BANK.concat(moreQuestions)
        : moreQuestions;
})();
