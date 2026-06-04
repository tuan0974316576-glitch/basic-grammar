// Pronoun fill-in bank for Battleship grammar mode.
// Supports one or more blanks through answerSlots.
(function () {
    const PURE_PRONOUN_ANSWERS = new Set([
        'i', 'me', 'you', 'he', 'him', 'she', 'her', 'it',
        'we', 'us', 'they', 'them', 'my', 'your', 'his',
        'its', 'our', 'their', 'mine', 'yours', 'ours',
        'theirs', 'hers', 'myself', 'yourself', 'ourselves',
        'themselves', 'himself', 'herself', 'itself'
    ]);

    const rows = [
        ["我可以看看它們嗎？", "May I have a look at ______?", ["them"], "Object pronoun: use them for plural pictures.", "object_pronouns"],
        ["我們可以在它上面放一些閃帶。", "We could put some tinsel on ______.", ["it"], "Object pronoun: use it for one Christmas tree.", "object_pronouns"],
        ["你想和我們一起來嗎？", "Do you want to come with ______?", ["us"], "After with, use the object pronoun us.", "object_pronouns"],
        ["讓我替它們拍張照片。", "Let me take a picture of ______.", ["them"], "After of, use them for plural dishes.", "object_pronouns"],
        ["我可以把它借給你。", "I can lend ______ to ______.", ["it", "you"], "Use it for the cap and you after to.", "object_pronouns"],
        ["我想和你談談這個計劃。", "I want to talk about the project with ______.", ["you"], "After with, use the object form you.", "object_pronouns"],
        ["我們可以明天談它嗎？", "Can we talk about ______ tomorrow?", ["it"], "Use it to replace the project.", "object_pronouns"],
        ["我媽媽會過來照顧牠。", "My mother will come over and take care of ______.", ["it"], "Use it for one animal when the sex is not important.", "object_pronouns"],
        ["陳老師正在找他。", "Mr Chan is looking for ______.", ["him"], "Use him for Derek after for.", "object_pronouns"],
        ["我經常碰見他。", "I run into ______ quite often.", ["him"], "Use him for the Principal after the phrasal verb.", "object_pronouns"],
        ["我會把它們交給她。", "I'll pass ______ to ______.", ["them", "her"], "Use them for presents and her for your mother.", "object_pronouns"],
        ["我希望她喜歡它們。", "I hope she likes ______.", ["them"], "Use them for plural presents.", "object_pronouns"],
        ["不，不是我！", "No, it wasn't ______!", ["me"], "In conversation, use me after be.", "object_pronouns"],
        ["你打算怎樣處理這些空罐？", "What are ______ going to do with these empty cans?", ["you"], "Use you as the subject of the question.", "subject_pronouns"],
        ["我不會把這些空罐丟掉。", "I'm not going to throw ______ away.", ["them"], "Use them for plural cans.", "object_pronouns"],
        ["我會把它們放進它裏面。", "I'll put ______ in ______.", ["them", "it"], "Use them for cans and it for one recycling bin.", "object_pronouns"],
        ["Adrian Chan 今天下午會和你開會。", "Adrian Chan will have a meeting with ______ this afternoon.", ["you"], "After with, use you.", "object_pronouns"],
        ["Sharon 花了幾小時找它們後，終於找到太陽眼鏡。", "Sharon finally found her sunglasses after spending hours looking for ______.", ["them"], "Sunglasses are plural, so use them.", "object_pronouns"],
        ["Shirley 沒有帶雨傘在身，所以她留在一間店裏。", "Shirley did not take an umbrella with ______, so ______ stayed in a shop.", ["her", "she"], "Use her after with and she as the subject.", "subject_object"],
        ["她問我要它。", "______ asked me for ______.", ["She", "it"], "Use she for Helen and it for the number.", "subject_object"],
        ["他們大多數來自歐洲。", "Most of ______ are from Europe.", ["them"], "Use them after most of for many people.", "object_pronouns"],
        ["單位裏有家具，但有些是壞的。", "There is furniture in the flat, but some of ______ is broken.", ["it"], "Furniture is uncountable, so use it.", "it_they"],
        ["那條粉紅色頸巾屬於我。", "That pink scarf belongs to ______.", ["me"], "After to, use me.", "object_pronouns"],
        ["我五歲時，媽媽把它送給我。", "My mother gave ______ to ______ when I was five.", ["it", "me"], "Use it for the scarf and me after to.", "object_pronouns"],
        ["你可以多告訴我一些關於它的事嗎？", "Can you tell me more about ______?", ["it"], "Use it for your plan.", "object_pronouns"],
        ["我們試過說服她，但她不肯聽我們的。", "We tried to persuade her, but she wouldn't listen to ______.", ["us"], "After to, use us.", "object_pronouns"],
        ["Daniel 上星期花了一整天處理它。", "Daniel spent a whole day working on ______ last week.", ["it"], "Use it for the task.", "object_pronouns"],
        ["我現在需要立刻和她談。", "I need to talk to ______ right now.", ["her"], "Use her for Nancy after to.", "object_pronouns"],
        ["我想她稍後會回來取它。", "I think ______ will come back for ______ later.", ["she", "it"], "Use she for Sally and it for the umbrella.", "subject_object"],
        ["香港從不下雪，但有時它會很冷。", "______ never snows in Hong Kong, but sometimes ______ can be very cold.", ["It", "it"], "Use it for weather.", "it_they"],
        ["它只花了我十五分鐘完成它。", "______ only took ______ 15 minutes to finish ______.", ["It", "me", "it"], "Use It for the situation, me after took, and it for the dish.", "subject_object"],
        ["我愛音樂。", "______ love music.", ["I"], "Use I as the subject.", "subject_pronouns"],
        ["我的朋友和我有一隊搖滾樂隊。", "My friends and ______ have a rock band.", ["I"], "Use I as part of the subject.", "subject_pronouns"],
        ["我打鼓。", "______ play the drums.", ["I"], "Use I as the subject.", "subject_pronouns"],
        ["我們每星期一起練習。", "______ practise together every week.", ["We"], "Use we as the subject.", "subject_pronouns"],
        ["對我來說，在學校集中精神很難。", "It is difficult for ______ to focus at school.", ["me"], "After for, use me.", "object_pronouns"],
        ["我哥哥課後要輔導我。", "My brother has to tutor ______ after class.", ["me"], "Use me as the object of tutor.", "object_pronouns"],
        ["他聰明友善，而且很容易交朋友。", "______ is smart and kind, and ______ makes friends easily.", ["He", "he"], "Use he as the subject for my brother.", "subject_pronouns"],
        ["和我不同，他不喜歡音樂。", "Unlike ______, ______ isn't into music.", ["me", "he"], "Use me after unlike and he as the subject.", "subject_object"],
        ["我需要意見時，常常和他談。", "______ often talk to ______ when ______ need advice.", ["I", "him", "I"], "Use I as subject and him after to.", "subject_object"],
        ["她比我小一年。", "______ is a year younger than me.", ["She"], "Use she for my sister.", "subject_pronouns"],
        ["她有一隻寵物老鼠，並替牠改名為 Captain Squeak。", "______ has a pet mouse and ______ named ______ Captain Squeak.", ["She", "she", "it"], "Use she for the sister and it for the mouse.", "subject_object"],
        ["牠喜歡轉圈；牠可以整天做這件事。", "______ likes running in circles; ______ can spend all day doing ______.", ["It", "it", "it"], "Use it for one animal and the activity.", "it_they"],
        ["她每天親自餵牠。", "______ feeds ______ herself every day.", ["She", "it"], "Use she for the sister and it for the mouse.", "subject_object"],
        ["她告訴我她想成為獸醫。", "______ told ______ that ______ wanted to become a vet.", ["She", "me", "she"], "Use she as subject and me as object.", "subject_object"],
        ["爸爸幾乎每天為我們準備晚飯。", "My dad prepares dinner for ______ almost every day.", ["us"], "After for, use us.", "object_pronouns"],
        ["大家都因爸爸出色的廚藝而愛戴他。", "Everyone loves ______ for his excellent cooking.", ["him"], "Use him as the object.", "object_pronouns"],
        ["她每晚花時間檢查我們的功課，並幫助我們學習。", "She spends time every evening checking our homework and helping ______ with our studies.", ["us"], "Use us as the object of helping.", "object_pronouns"],
        ["週末天晴時，我們五個有時會去遠足。", "At weekends, if ______ is sunny, the five of ______ sometimes go hiking.", ["it", "us"], "Use it for weather and us after of.", "it_they"],
        ["下雨時，我們通常留在家。", "If ______ rains, ______ usually just stay home.", ["it", "we"], "Use it for weather and we as the subject.", "it_they"],
        ["Tara 作為隊長，你現在感覺如何？", "Tara, as team leader, how do ______ feel right now?", ["you"], "Use you as the subject in the question.", "subject_pronouns"],
        ["我為我的隊友感到自豪。", "______ feel proud of my teammates.", ["I"], "Use I for Tara speaking about herself.", "subject_pronouns"],
        ["我認為他們所有人都為這次勝利努力。", "I think all of ______ worked hard for this win.", ["them"], "Use them after all of.", "object_pronouns"],
        ["我想感謝他們所有人的努力。", "I'd like to thank all of ______ for their hard work.", ["them"], "Use them after all of.", "object_pronouns"],
        ["顧問在準備期間給了我們寶貴建議。", "Our advisors gave ______ valuable advice during our preparation.", ["us"], "Use us as the object of gave.", "object_pronouns"],
        ["Tara 在我們所有人之中最努力，而她的演繹最好。", "Tara worked the hardest of ______ all, and ______ had the best delivery.", ["us", "she"], "Use us after of and she for Tara.", "subject_object"],
        ["他也做得很好。", "______ did a great job too.", ["He"], "Use he for Kyle.", "subject_pronouns"],
        ["不，我們只在辯論開始前二十分鐘才知道議案。", "No, ______ only knew the motion 20 minutes before the debate.", ["we"], "Use we for the team.", "subject_pronouns"],
        ["它們通常與社會議題有關。", "______ are usually related to social issues.", ["They"], "Use they for plural motions.", "it_they"],
        ["閱讀很重要，但它不是我們唯一做的事。", "Reading is important, but ______ is not the only thing we do.", ["it"], "Use it for reading.", "it_they"],
        ["辯論很有趣，而且它教會我們新技能。", "Debate is fun, and ______ teaches ______ new skills.", ["it", "us"], "Use it for debate and us as object.", "it_they"],
        ["我們會叫大家試一試它。", "We will tell everyone to give ______ a try.", ["it"], "Use it for debate.", "object_pronouns"],
        ["Daniel 的父母帶他探訪親友。", "Daniel's parents decided to take ______ to visit friends and relatives.", ["him"], "Use him for Daniel.", "object_pronouns"],
        ["Daniel 的父母教他說賀年話。", "Daniel's parents taught ______ to say 'Kung Hei Fat Choy'.", ["him"], "Use him as the object of taught.", "object_pronouns"],
        ["這是在中國新年期間說這句話的習俗。", "______ is a Chinese custom to say this during Chinese New Year.", ["It"], "Use It as an introductory subject.", "it_they"],
        ["他們每一位都給他利是。", "Each of ______ gave ______ red packets.", ["them", "him"], "Use them after each of and him for Daniel.", "object_pronouns"],
        ["他發現自己收到二十多封利是。", "______ found that he had received more than 20 red packets.", ["He"], "Use he as the subject.", "subject_pronouns"],
        ["它們每一封都有二十元。", "Each of ______ contained a 20-dollar note.", ["them"], "Use them for plural red packets.", "object_pronouns"],
        ["我會把它捐給慈善機構。", "I'll donate ______ to charity.", ["it"], "Money is uncountable, so use it.", "it_they"],

        ["放下你們的筆。", "Put down ______ pens.", ["your"], "Use your before a noun.", "possessive_adjectives"],
        ["Janet 和 Chris 上月搬進他們的新家。", "Janet and Chris moved into ______ new home last month.", ["their"], "Use their for Janet and Chris.", "possessive_adjectives"],
        ["劉先生只給我們一小時完成我們的寫作。", "Mr Lau only gave us an hour to finish ______ writing task.", ["our"], "Use our before writing task.", "possessive_adjectives"],
        ["她的笑話常令我發笑。", "______ jokes always make me laugh.", ["Her"], "Use Her before jokes.", "possessive_adjectives"],
        ["Jason，你在找你的鎖匙嗎？", "Jason, are these ______ keys?", ["your"], "Use your before keys.", "possessive_adjectives"],
        ["警察截停我們，要求查看我們的身份證。", "The policemen stopped us and asked to see ______ ID cards.", ["our"], "Use our before ID cards.", "possessive_adjectives"],
        ["我喜歡這部電影，尤其是它的男主角。", "I like this film, especially ______ leading actor.", ["its"], "Use its for something belonging to the film.", "possessive_adjectives"],
        ["他的表現很出色。", "______ performance is excellent.", ["His"], "Use His before performance.", "possessive_adjectives"],
        ["貓正在玩它自己的尾巴。", "The cat is playing with ______ tail.", ["its"], "Do not confuse its with it's.", "possessive_adjectives"],
        ["現在還早。", "______ still early.", ["It's"], "It's means It is.", "possessive_adjectives", [["It is"]]],
        ["我們的城市今天看起來很不同。", "______ city looks very different today.", ["Our"], "Use Our before city.", "possessive_adjectives"],
        ["Claire，根據你的地圖，我們應該在博物館附近。", "According to ______ map, Claire, we should be near the museum.", ["your"], "Use your before map.", "possessive_adjectives"],
        ["我們所有人的手機都離線了。", "All of ______ mobile phones are offline.", ["our"], "Use our before mobile phones.", "possessive_adjectives"],
        ["你掉了你的銀包。", "You've dropped ______ wallet.", ["your"], "Use your before wallet.", "possessive_adjectives"],
        ["那女孩可能正在找她的銀包。", "She's probably looking for ______ wallet right now.", ["her"], "Use her before wallet.", "possessive_adjectives"],
        ["我們又不是熟悉我們周圍的路。", "It's not like we know ______ way around.", ["our"], "Use our before way.", "possessive_adjectives"],
        ["畢竟，這是他們的城市。", "It's ______ city, after all.", ["their"], "Use their before city.", "possessive_adjectives"],
        ["她的貝殼收藏很出色。", "______ collection of sea shells is very impressive.", ["Her"], "Use Her before collection.", "possessive_adjectives"],
        ["貝殼數量一直增加，而且它們的價值很高。", "The shells' number keeps growing, and ______ value is very high.", ["their"], "Use their for plural shells.", "possessive_adjectives"],
        ["我們的狗 Lemon 總是令我們發笑。", "Our dog Lemon always makes ______ laugh.", ["us"], "Use us after makes.", "object_pronouns"],
        ["Lemon 喜歡玩我們的襪子並咬它們。", "He likes to play with our socks and chew ______.", ["them"], "Use them for socks.", "object_pronouns"],
        ["Lemon 害怕吸塵機，總是向它吠。", "He is afraid of the vacuum cleaner and always barks at ______.", ["it"], "Use it for the vacuum cleaner.", "object_pronouns"],
        ["當我們嘗試替 Lemon 洗澡時，牠會躲在梳化底下。", "He hides under the sofa when ______ try to bathe ______.", ["we", "him"], "Use we as subject and him as object.", "subject_object"],

        ["不，她的是灰色的。", "No, ______ is grey.", ["hers"], "Use hers to mean Erica's car.", "possessive_pronouns"],
        ["我的家在她的家對面。", "My house is opposite ______.", ["hers"], "Use hers to mean Karen's house.", "possessive_pronouns"],
        ["我的一位表親會來香港。", "A cousin of ______ is visiting Hong Kong.", ["mine"], "Use a cousin of mine.", "possessive_pronouns"],
        ["他在另一間店買了他的。", "He bought ______ at a different shop.", ["his"], "His can be a possessive pronoun.", "possessive_pronouns"],
        ["我看過她的很多書。", "I've read many books of ______.", ["hers"], "Use books of hers.", "possessive_pronouns"],
        ["中間那個袋是我的。", "The one in the middle is ______.", ["mine"], "Use mine to mean my bag.", "possessive_pronouns"],
        ["你們的校服比我們的醒目。", "Their school uniform looks smarter than ______.", ["ours"], "Use ours to mean our school uniform.", "possessive_pronouns"],
        ["我認為他們的比較貴。", "I think ______ is more expensive.", ["theirs"], "Use theirs to mean their school uniform.", "possessive_pronouns"],
        ["我們已收到我們的票。你收到你的了嗎？", "We have received our tickets. Have you got ______?", ["yours"], "Use yours to mean your tickets.", "possessive_pronouns"],
        ["不，那是 Jim 的。我的在袋裏。", "No, it's Jim's. ______ is in my bag.", ["Mine"], "Use Mine to mean my wallet.", "possessive_pronouns"],
        ["Jason 帶了自己的球拍，但 Tom 忘了帶他的。", "Jason brought his own racket, but Tom forgot to bring ______.", ["his"], "Use his to mean his racket.", "possessive_pronouns"],
        ["你的一位同學剛才打電話來。", "A classmate of ______ called just now.", ["yours"], "Use a classmate of yours.", "possessive_pronouns"],
        ["那位同學沒有留下他的名字。", "He didn't leave ______ name.", ["his"], "Use his before name.", "possessive_adjectives"],
        ["Fred 是我的一位朋友。", "This is Fred, a friend of ______.", ["mine"], "Use a friend of mine.", "possessive_pronouns"],
        ["Jane 是我的妹妹。", "This is Jane, ______ sister.", ["my"], "Use my before sister.", "possessive_adjectives"],
        ["我們知道他們的電話號碼，但他們不知道我們的。", "We know their telephone number, but ______ don't know ______.", ["they", "ours"], "Use they as subject and ours as possessive pronoun.", "subject_possessive"],
        ["他在日本旅行期間買了它們其中一本。", "______ bought one of ______ during ______ trip to Japan.", ["He", "them", "his"], "Use He for my brother, them for books, and his before trip.", "subject_possessive"],
        ["Ted 正在找他其中一個模型。", "Ted is looking for one of ______ figurines.", ["his"], "Use his before figurines.", "possessive_adjectives"],
        ["有人見過她的古董信封嗎？", "Has anyone seen ______ antique envelopes?", ["her"], "Use her before envelopes.", "possessive_adjectives"],
        ["這些信封是我的曾祖父傳給我的。", "These envelopes were handed down to me by ______ great grandfather.", ["my"], "Use my before great grandfather.", "possessive_adjectives"],
        ["有紅色標籤的筆記簿可能是我們的。", "If a notebook has a red label, it is probably ______.", ["ours"], "Use ours to mean our notebook.", "possessive_pronouns"],
        ["它看起來像你珠飾胸針收藏中的一枚。", "It looks like one of ______ collection of beaded brooches.", ["your"], "Use your before collection.", "possessive_adjectives"],
        ["噢，它一定是我的。", "Oh, it's definitely ______.", ["mine"], "Use mine when Liz speaks about her brooch.", "possessive_pronouns"],
        ["他們的紙雕很出色。", "______ paper sculptures are amazing.", ["Their"], "Use Their before paper sculptures.", "possessive_adjectives"],
        ["它的翅膀由舊雜誌頁製成。", "______ wings are made out of old magazine pages.", ["Its"], "Use Its before wings.", "possessive_adjectives"],
        ["它們是你的，對嗎，Henry？", "They are ______, aren't they, Henry?", ["yours"], "Use yours when speaking to Henry.", "possessive_pronouns"],
        ["我們為我們的展品感到自豪。", "We are very proud of ______ exhibits.", ["our"], "Use our before exhibits.", "possessive_adjectives"],
        ["我的一位姨母給我看她的照片收藏。", "An aunt of ______ showed me ______ collection of photos.", ["mine", "her"], "Use mine after of and her before collection.", "possessive_pronouns"],
        ["下星期我會帶一些他的來給你看。", "I'll bring some of ______ to show you next week.", ["his"], "Use his to mean his postcards.", "possessive_pronouns"],

        ["這是誰的車？這是 Paul 的。", "Whose car is this? It's ______.", ["Paul's"], "Add 's after a singular name.", "possessive_nouns"],
        ["這是劉先生的。它也可用作音樂播放器。", "It's ______. It can also be used as a music player.", ["Mr Lau's"], "Add 's after Mr Lau.", "possessive_nouns"],
        ["我想這是 Janet 的。", "I think it's ______.", ["Janet's"], "Add 's after Janet.", "possessive_nouns"],
        ["我肯定它們是陳太太孩子們的玩具。", "I'm sure they are ______ toys.", ["Mrs Chan's children's"], "Use 's after Mrs Chan and after children.", "possessive_nouns"],
        ["我正在修理我同學的單車。", "I'm repairing ______ bicycle.", ["my classmate's"], "Use 's after a singular noun.", "possessive_nouns"],
        ["這些 CD 有些是 Nancy 朋友的。", "Some of these CDs are ______.", ["her friends'"], "Use apostrophe after plural friends.", "possessive_nouns"],
        ["這件恤衫的袖子很髒。", "______ are dirty.", ["The sleeves of this shirt"], "Use of for a thing.", "possessive_nouns"],
        ["地球表面大部分被水覆蓋。", "Water covers most of ______.", ["the Earth's surface"], "Either possessive noun or of-phrase can work.", "possessive_nouns", [["the surface of the Earth"]]],
        ["技工正在檢查汽車引擎。", "The mechanic is checking ______.", ["the car's engine"], "Either possessive noun or of-phrase can work.", "possessive_nouns", [["the engine of the car"]]],
        ["很多房屋的屋頂在風暴中受損。", "Many of ______ were damaged in the storm.", ["the houses' roofs"], "Use apostrophe after plural houses.", "possessive_nouns", [["the roofs of the houses"]]],
        ["她把電話號碼寫在頁底。", "She wrote the telephone number at ______.", ["the bottom of the page"], "Use of for part of a page.", "possessive_nouns"],
        ["街名以中英文書寫。", "______ is written in both Chinese and English.", ["The street's name"], "Either possessive noun or of-phrase can work.", "possessive_nouns", [["The name of the street"]]],
        ["屋前有一個美麗花園。", "There is a beautiful garden at ______.", ["the front of the house"], "Use of for a position in a place.", "possessive_nouns"],
        ["房間的窗戶很髒，需要清潔。", "______ are dirty. They need cleaning.", ["The windows of the room"], "Use of for a thing.", "possessive_nouns", [["The room's windows"]]],
        ["John 和 Jane 的婚禮在下月。", "______ wedding is next month.", ["John and Jane's"], "Use one 's for a shared possession.", "possessive_nouns"],
        ["John 和他哥哥的婚禮分別在四月和八月。", "______ weddings are in April and August.", ["John's and his brother's"], "Use 's after each owner for separate possessions.", "possessive_nouns"],
        ["李先生和李太太的狗很可愛。", "______ dog is cute.", ["Mr and Mrs Lee's"], "Use one 's for a shared pet.", "possessive_nouns"],
        ["你知道你所有朋友的生日嗎？", "Do you know all your ______ birthdays?", ["friends'"], "Use apostrophe after plural friends.", "possessive_nouns"],
        ["孩子們的睡房在浴室旁邊。", "The ______ bedroom is next to the bathroom.", ["children's"], "Children is plural but does not end in s, so add 's.", "possessive_nouns"],
        ["這些是 Charles 的眼鏡嗎？", "Are these ______ glasses?", ["Charles's"], "A singular name ending in s can take 's.", "possessive_nouns", [["Charles'"]]],
        ["今天的天氣很好。", "______ weather is good.", ["Today's"], "Use 's in time expressions.", "possessive_nouns"],
        ["這是誰的字典？", "______ dictionary is this?", ["Whose"], "Use Whose to ask about possession.", "whose"],
        ["這是 Derek 的。", "It's ______.", ["Derek's"], "Use 's after Derek.", "possessive_nouns"],
        ["這是誰的 iPad？", "______ iPad is this?", ["Whose"], "Use Whose before a noun.", "whose"],
        ["這部 iPad 是誰的？", "______ is this iPad?", ["Whose"], "Whose can stand alone before be.", "whose"],

        ["我昨天遇到 Jason 和他的哥哥。", "I met Jason and ______ brother yesterday.", ["his"], "Use his before brother.", "mixed_pronouns"],
        ["Anna 是你哥哥的同學。你還記得她嗎？", "Anna was your brother's classmate. Do you remember ______?", ["her"], "Use her as the object.", "mixed_pronouns"],
        ["地上有一些毛巾。誰把它們掉在那裏？", "There are some towels on the floor. Who dropped ______ there?", ["them"], "Use them for plural towels.", "mixed_pronouns"],
        ["她們很多粉絲都為此很高興。", "Many fans of ______ are very happy about this.", ["theirs"], "Use fans of theirs.", "mixed_pronouns"],
        ["讓我們拍一張這隻可愛兔子的照片。牠正仰睡著。", "Let's take a picture of this cute rabbit. It's sleeping on ______ back.", ["its"], "Use its before back.", "mixed_pronouns"],
        ["我看見她把它放在桌上。", "I saw her put ______ on the desk.", ["it"], "Use it for the book.", "mixed_pronouns"],
        ["他們吵架了嗎？", "Did ______ argue with each other?", ["they"], "Use they for Tom and Jerry.", "mixed_pronouns"],
        ["這個銀包一定是那個女孩的。", "This wallet must be ______.", ["hers"], "Use hers to mean her wallet.", "mixed_pronouns"],
        ["我認為最好把它交給警方。", "I think the best thing to do is to hand ______ to the police.", ["it"], "Use it for the wallet.", "mixed_pronouns"],
        ["Claire，我們試試在你那張地圖上找一間吧。", "Let's try to find one on that map of ______, Claire.", ["yours"], "Use that map of yours.", "mixed_pronouns"]
    ];

    function normalizeCategory(category) {
        return String(category || 'pronoun')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '') || 'pronoun';
    }

    function joinSlots(slots) {
        return (Array.isArray(slots) ? slots : [slots])
            .map(slot => String(slot || '').trim())
            .filter(Boolean)
            .join(' ');
    }

    window.GRAMMAR_PRONOUN_BANK = rows.map((row, index) => {
        const [chinese, question, slots, hint, category, alternatives] = row;
        const answerSlots = Array.isArray(slots) ? slots.map(slot => String(slot || '').trim()) : [String(slots || '').trim()];
        const acceptedAnswers = [joinSlots(answerSlots)];
        (Array.isArray(alternatives) ? alternatives : []).forEach((alternative) => {
            acceptedAnswers.push(Array.isArray(alternative) ? joinSlots(alternative) : String(alternative || '').trim());
        });
        const cleanCategory = normalizeCategory(category);

        return {
            id: `pronoun_${String(index + 1).padStart(3, '0')}`,
            chinese,
            tense: 'pronoun',
            voice: cleanCategory,
            tenses: ['pronoun'],
            voices: [cleanCategory],
            category: cleanCategory,
            question,
            answers: Array.from(new Set(acceptedAnswers.filter(Boolean))),
            answerSlots,
            exp: hint
        };
    }).filter(item => item.answerSlots.every(slot => PURE_PRONOUN_ANSWERS.has(String(slot || '').trim().toLowerCase())));
})();
