// Participle Phrases rearrange questions for Battleship grammar mode.
// Keep this data file declarative; gameplay lives in ui-grammar.js.
(function () {
    window.GRAMMAR_PARTICIPLE_PHRASES_RULES = {
        present_action: "Present participle phrase: 用 V-ing 開頭，通常表示主動意思，可表示同時發生或剛剛發生的動作。",
        present_reason: "Present participle phrase for reason/background: 用 V-ing 開頭，表示原因或補充主語資料。",
        past_passive: "Past participle phrase: 用 P.P. 開頭，通常表示被動意思，可表示原因或背景資料。",
        negative_present: "Negative present participle phrase: not + V-ing，表示主語沒有做某事，所以引致主句結果。",
        negative_past: "Negative past participle phrase: not + P.P.，表示主語沒有被做某事，所以引致主句結果。",
        time_word: "Time word + present participle: before / after / when / while / since + V-ing。",
        noun_present: "Present participle phrase after a noun: 用 V-ing 片語放在名詞後，等於 who/which is doing。",
        noun_past: "Past participle phrase after a noun: 用 P.P. 片語放在名詞後，等於 who/which is done。"
    };

    const rows = [
        ["present_action", "聽到警鐘，學生立刻離開課室。", "Hearing the alarm, the students left the classroom at once.", ["heard", "hear", "were", "because"]],
        ["present_action", "看到男孩跌入水中，他衝去救他。", "Seeing the boy fall into the water, he rushed to save him.", ["saw", "seen", "was", "because"]],
        ["present_action", "聞到煙味，Amy 打電話報警。", "Smelling smoke, Amy called the police.", ["smelled", "smell", "was", "by"]],
        ["present_action", "聽到好消息，他們拍手歡呼。", "Hearing the good news, they clapped and cheered.", ["heard", "hear", "were", "because"]],
        ["present_action", "發現門沒有鎖，Peter 走進房間。", "Finding the door unlocked, Peter walked into the room.", ["found", "find", "was", "by"]],
        ["present_action", "打開盒子，Jenny 找到一封信。", "Opening the box, Jenny found a letter.", ["opened", "open", "was", "because"]],
        ["present_action", "轉過身，警衛看見一個陌生人。", "Turning around, the guard saw a stranger.", ["turned", "turn", "was", "by"]],
        ["present_action", "看見巴士離開，Jason 開始跑。", "Seeing the bus leave, Jason started running.", ["saw", "seen", "left", "by"]],
        ["present_action", "收到訊息，Kelly 立刻回覆。", "Receiving the message, Kelly replied immediately.", ["received", "receive", "was", "because"]],
        ["present_action", "聽到有人叫她的名字，Sally 停下腳步。", "Hearing someone call her name, Sally stopped walking.", ["heard", "called", "was", "by"]],

        ["present_reason", "有翌日的測驗，Charles 溫習到很晚。", "Having a test the next day, Charles stayed up late to study.", ["had", "has", "was", "because"]],
        ["present_reason", "缺乏清晰的計劃，這個項目進展緩慢。", "Lacking a clear plan, the project progressed slowly.", ["lacked", "lack", "was", "by"]],
        ["present_reason", "住得很遠，Mandy 每天很早起床。", "Living far away, Mandy gets up early every day.", ["lived", "live", "was", "because"]],
        ["present_reason", "知道考試很重要，Leo 認真溫習。", "Knowing the exam was important, Leo revised carefully.", ["knew", "known", "is", "by"]],
        ["present_reason", "想幫助他的朋友，David 借了筆記給她。", "Wanting to help his friend, David lent her his notes.", ["wanted", "want", "was", "because"]],
        ["present_reason", "需要更多資料，記者訪問了校長。", "Needing more information, the reporter interviewed the principal.", ["needed", "need", "was", "by"]],
        ["present_reason", "擁有豐富經驗，Miss Wong 很快解決了問題。", "Having rich experience, Miss Wong solved the problem quickly.", ["had", "has", "was", "because"]],
        ["present_reason", "面對很多困難，隊員沒有放棄。", "Facing many difficulties, the team members did not give up.", ["faced", "face", "were", "by"]],
        ["present_reason", "想準時到達，Ivan 乘的士上學。", "Wanting to arrive on time, Ivan took a taxi to school.", ["wanted", "arrived", "was", "because"]],
        ["present_reason", "感到十分疲倦，Rachel 坐下休息。", "Feeling very tired, Rachel sat down to rest.", ["felt", "feel", "was", "by"]],

        ["past_passive", "被蟑螂嚇倒，我媽媽尖叫起來。", "Terrified by the cockroaches, my mother screamed.", ["terrifying", "terrify", "was", "because"]],
        ["past_passive", "被失敗打擊，球迷傷心落淚。", "Disappointed by the loss, the fans broke down in tears.", ["disappointing", "disappoint", "were", "because"]],
        ["past_passive", "被老師懲罰，Peter 午飯時間站在教員室外。", "Punished by his teacher, Peter stood outside the staff room during lunchtime.", ["punishing", "punish", "was", "because"]],
        ["past_passive", "被記者的問題惹怒，歌手突然離開記者會。", "Annoyed by the reporters' questions, the singer left the press conference suddenly.", ["annoying", "annoy", "was", "because"]],
        ["past_passive", "被蛇咬傷，那隻狗倒下並失去知覺。", "Bitten by a snake, the dog fell over and lost consciousness.", ["biting", "bite", "was", "because"]],
        ["past_passive", "被音樂和舞蹈吸引，Kent 決定看這套音樂劇。", "Attracted by the music and dancing, Kent decided to watch the musical.", ["attracting", "attract", "was", "because"]],
        ["past_passive", "被大雨困住，遊客留在商場內。", "Trapped by the heavy rain, the tourists stayed inside the shopping mall.", ["trapping", "trap", "were", "because"]],
        ["past_passive", "受到同學鼓勵，Karen 參加了歌唱比賽。", "Encouraged by her classmates, Karen joined the singing contest.", ["encouraging", "encourage", "was", "because"]],
        ["past_passive", "被突如其來的聲音嚇倒，孩子們躲在桌下。", "Frightened by the sudden noise, the children hid under the table.", ["frightening", "frighten", "were", "because"]],
        ["past_passive", "由 Van Gogh 繪畫，Sunflowers 是著名藝術作品。", "Painted by Van Gogh, Sunflowers is a famous work of art.", ["painting", "paint", "was", "because"]],

        ["negative_present", "沒有足夠金錢，Andrew 買不到那本書。", "Not having enough money, Andrew could not buy the book.", ["had", "has", "without", "because"]],
        ["negative_present", "沒有聽老師的建議，Evelyn 惹上很多麻煩。", "Not listening to her teacher's advice, Evelyn got into a lot of trouble.", ["listened", "listen", "was", "because"]],
        ["negative_present", "不知道答案，Tom 保持沉默。", "Not knowing the answer, Tom remained silent.", ["knew", "known", "was", "because"]],
        ["negative_present", "沒有帶雨傘，Helen 在店內等到雨停。", "Not taking an umbrella, Helen waited in a shop until the rain stopped.", ["took", "taken", "was", "because"]],
        ["negative_present", "不想錯過巴士，Nancy 跑向車站。", "Not wanting to miss the bus, Nancy ran to the stop.", ["wanted", "want", "was", "because"]],
        ["negative_present", "沒有留意交通燈，男孩差點被車撞倒。", "Not watching the traffic lights, the boy was nearly hit by a car.", ["watched", "watch", "were", "because"]],
        ["negative_present", "沒有檢查答案，Alan 犯了很多粗心錯誤。", "Not checking his answers, Alan made many careless mistakes.", ["checked", "check", "was", "because"]],
        ["negative_present", "不相信那個故事，Tammy 決定離開。", "Not believing the story, Tammy decided to leave.", ["believed", "believe", "was", "because"]],
        ["negative_present", "沒有足夠時間，我只看了一齣短片。", "Not having enough time, I watched only a short video.", ["had", "have", "was", "because"]],
        ["negative_present", "沒有理解題目，學生寫錯了答案。", "Not understanding the question, the student wrote the wrong answer.", ["understood", "understand", "was", "because"]],

        ["negative_past", "沒有被選入校隊，Eric 非常失望。", "Not chosen for the school team, Eric was very disappointed.", ["choosing", "choose", "was", "because"]],
        ["negative_past", "沒有被邀請參加派對，Wendy 感到傷心。", "Not invited to the party, Wendy felt upset.", ["inviting", "invite", "was", "because"]],
        ["negative_past", "沒有被通知改變，工人到達了錯誤地點。", "Not told about the change, the workers arrived at the wrong place.", ["telling", "tell", "were", "because"]],
        ["negative_past", "沒有得到足夠時間，學生不能完成測驗。", "Not given enough time, the students could not finish the test.", ["giving", "give", "were", "because"]],
        ["negative_past", "沒有被考慮第二次，我哥哥很失望。", "Not considered for the job again, my brother was very disappointed.", ["considering", "consider", "was", "because"]],
        ["negative_past", "沒有被老師表揚，孩子看起來有點失望。", "Not praised by the teacher, the child looked a little disappointed.", ["praising", "praise", "was", "because"]],
        ["negative_past", "沒有被鎖好，窗戶被風吹開了。", "Not locked properly, the window was blown open by the wind.", ["locking", "lock", "was", "because"]],
        ["negative_past", "沒有被清楚標示，出口很難找到。", "Not marked clearly, the exit was difficult to find.", ["marking", "mark", "was", "because"]],
        ["negative_past", "沒有被充分煮熟，肉不安全食用。", "Not cooked fully, the meat was not safe to eat.", ["cooking", "cook", "was", "because"]],
        ["negative_past", "沒有被及時修理，電梯壞了一整天。", "Not repaired in time, the lift was out of order all day.", ["repairing", "repair", "was", "because"]],

        ["time_word", "完成工作紙後，May 交給老師。", "After finishing the worksheet, May handed it to the teacher.", ["finished", "finish", "was", "because"]],
        ["time_word", "加入學會前，我對攝影一無所知。", "Before joining the club, I knew nothing about photography.", ["joined", "join", "was", "because"]],
        ["time_word", "等待朋友時，Roy 玩手機。", "While waiting for his friends, Roy played with his phone.", ["waited", "wait", "was", "because"]],
        ["time_word", "做戶外運動時，不要忘記使用防曬。", "When playing outdoor sports, do not forget to use sunscreen.", ["played", "play", "was", "because"]],
        ["time_word", "離開家後，Lucy 突然想起她忘了鎖門。", "After leaving home, Lucy suddenly remembered she had forgotten to lock the door.", ["left", "leave", "was", "because"]],
        ["time_word", "成為著名作家前，她在咖啡店工作。", "Before becoming a famous writer, she worked in a cafe.", ["became", "become", "was", "because"]],
        ["time_word", "等巴士時，Ivan 傳訊息給朋友。", "While waiting for the bus, Ivan texted his friend.", ["waited", "wait", "was", "because"]],
        ["time_word", "加入戲劇學會後，Julia 變得更有自信。", "Since joining the Drama Club, Julia has become more confident.", ["joined", "join", "was", "because"]],
        ["time_word", "到達學校後，Chris 發現自己忘記帶功課。", "After arriving at school, Chris found he had forgotten his homework.", ["arrived", "arrive", "was", "because"]],
        ["time_word", "過馬路前，孩子應該望左右兩邊。", "Before crossing the road, children should look both ways.", ["crossed", "cross", "were", "because"]],

        ["noun_present", "在台上唱歌的女孩是 Peter 的妹妹。", "The girl singing on stage is Peter's sister.", ["sang", "sung", "was", "who"]],
        ["noun_present", "坐在窗邊的男孩是我的表弟。", "The boy sitting by the window is my cousin.", ["sat", "sit", "was", "who"]],
        ["noun_present", "站在我哥哥旁邊的女孩是他的女朋友。", "The girl standing next to my brother is his girlfriend.", ["stood", "stand", "was", "who"]],
        ["noun_present", "穿紅色外套的女士是我們的新老師。", "The woman wearing a red coat is our new teacher.", ["wore", "wear", "was", "who"]],
        ["noun_present", "在公園跑步的男人是我的叔叔。", "The man running in the park is my uncle.", ["ran", "run", "was", "who"]],
        ["noun_present", "包含所有資料的網站很有用。", "The website containing all the information is very useful.", ["contained", "contain", "was", "which"]],
        ["noun_present", "提供廉價食物的餐廳很受學生歡迎。", "The restaurant offering cheap food is popular with students.", ["offered", "offer", "was", "which"]],
        ["noun_present", "住在樓上的家庭很友善。", "The family living upstairs is very friendly.", ["lived", "live", "was", "who"]],
        ["noun_present", "等候電梯的學生開始聊天。", "The students waiting for the lift started chatting.", ["waited", "wait", "were", "who"]],
        ["noun_present", "看守入口的警衛要求我們出示學生證。", "The guard watching the entrance asked us to show our student cards.", ["watched", "watch", "was", "who"]],

        ["noun_past", "在意外中受傷的女孩被一位路過的醫生救了。", "A passing doctor saved the girl injured in the accident.", ["injuring", "injure", "was", "who"]],
        ["noun_past", "由 Mr Tsang 推薦的短篇故事集很有趣。", "The short story collection recommended by Mr Tsang is interesting.", ["recommending", "recommend", "was", "which"]],
        ["noun_past", "由 Cecilia 上載的有趣影片很受歡迎。", "The funny video uploaded by Cecilia is very popular.", ["uploading", "upload", "was", "which"]],
        ["noun_past", "上星期發布的應用程式有很多問題。", "The app released last week has many problems.", ["releasing", "release", "was", "which"]],
        ["noun_past", "在圖書館借來的書在我的書包裡。", "The books borrowed from the library are in my school bag.", ["borrowing", "borrow", "were", "which"]],
        ["noun_past", "由學生製作的海報掛在禮堂外。", "The posters made by the students are outside the hall.", ["making", "make", "were", "which"]],
        ["noun_past", "昨天偷走的單車已經找回。", "The bicycle stolen yesterday has been found.", ["stealing", "steal", "was", "which"]],
        ["noun_past", "在會議中討論的計劃需要更多資金。", "The plan discussed at the meeting needs more money.", ["discussing", "discuss", "was", "which"]],
        ["noun_past", "用再造紙製成的筆記簿很漂亮。", "The notebooks made from recycled paper are beautiful.", ["making", "make", "were", "which"]],
        ["noun_past", "由 Adele 演唱的歌曲很受歡迎。", "The song sung by Adele was very popular.", ["singing", "sang", "was", "which"]],

        ["present_action", "走到港鐵站時，Tammy 看見一位迷路的老婦人。", "Walking to the MTR station, Tammy saw a lost old lady.", ["walked", "walk", "was", "because"]],
        ["present_action", "看到 Tammy，那位老婦人向她跑去。", "Seeing Tammy, the old lady rushed towards her.", ["saw", "seen", "was", "because"]],
        ["past_passive", "想起電視上的騙案，Tammy 猶豫了。", "Reminded of the tricks on TV, Tammy hesitated.", ["reminding", "remind", "was", "because"]],
        ["present_reason", "替老婦人感到難過，Tammy 打電話給她的兒子。", "Feeling sorry for the old lady, Tammy called her son.", ["felt", "feel", "was", "because"]],
        ["past_passive", "擔心兒子找不到媽媽，Tammy 和老婦人一起等待。", "Worried that the son would not find his mother, Tammy waited with the old lady.", ["worrying", "worry", "was", "because"]],
        ["time_word", "聽完 Tammy 的故事後，她的朋友認為她很善良。", "After listening to Tammy's story, her friends thought she was very kind.", ["listened", "listen", "were", "because"]],
        ["present_reason", "了解粉絲的失望，歌手到場安慰他們。", "Understanding the disappointment of her fans, the singer came to comfort them.", ["understood", "understand", "was", "because"]],
        ["past_passive", "得知演唱會取消，很多粉絲哭了。", "Shocked by the news, many fans cried.", ["shocking", "shock", "were", "because"]],
        ["present_action", "排隊超過三小時後，粉絲被通知演唱會取消。", "After queuing for more than three hours, fans were told the concert was cancelled.", ["queued", "queue", "were", "because"]],
        ["present_action", "走路回家時，我聽到身後有聲音。", "Walking home, I heard a noise behind me.", ["walked", "walk", "was", "because"]],
        ["past_passive", "被有人跟蹤的想法嚇倒，我加快了腳步。", "Alarmed by the thought of being followed, I quickened my steps.", ["alarming", "alarm", "was", "because"]],
        ["present_action", "轉身後，我看見一個高大的男人向我跑來。", "Turning around, I saw a tall man running towards me.", ["turned", "turn", "was", "because"]],
        ["past_passive", "被那個想法嚇壞，我盡快逃跑。", "Terrified by the thought, I ran away as fast as I could.", ["terrifying", "terrify", "was", "because"]],
        ["present_reason", "擔心女兒的安全，爸爸來接她回家。", "Worrying about his daughter's safety, her father came to take her home.", ["worried", "worry", "was", "because"]],
        ["present_reason", "以新藝術家為對象，這個節日吸引很多青少年。", "Targeting new artists, the festival attracted many teenagers.", ["targeted", "target", "was", "because"]],
        ["past_passive", "於 2015 年創立，這個藝術節幫助新藝術家。", "Founded in 2015, the festival helps new artists.", ["founding", "found", "was", "because"]],
        ["present_reason", "提供輕鬆的環境，藝術節鼓勵更多人參與。", "Providing a relaxing environment, the festival encourages more people to join.", ["provided", "provide", "was", "because"]],
        ["past_passive", "今年在 Tamar Park 舉行，藝術節有很多活動。", "Held at Tamar Park this year, the festival has many activities.", ["holding", "hold", "was", "because"]],
        ["past_passive", "被表演的創意吸引，我看了兩次。", "Fascinated by the creativity of the show, I watched it twice.", ["fascinating", "fascinate", "was", "because"]],
        ["noun_past", "對藝術合作感興趣的人應該看這個表演。", "People interested in artistic collaboration should watch this show.", ["interesting", "interest", "were", "who"]]
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

    window.GRAMMAR_PARTICIPLE_PHRASES_BANK = rows.map((row, index) => {
        const [rule, chinese, answer, distractors] = row;
        const correctTokens = tokenizeAnswer(answer);
        return {
            id: `participle_phrases_${String(index + 1).padStart(3, '0')}`,
            rule,
            chinese,
            correct_tokens: correctTokens,
            intrinsic_tokens: inferIntrinsicTokens(correctTokens),
            distractors: Array.isArray(distractors) ? distractors : []
        };
    });
})();
