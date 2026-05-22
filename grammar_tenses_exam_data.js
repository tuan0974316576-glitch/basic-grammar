// Exam-style tense expansion for Grammar TENSES battle mode.
// Adds 10 questions for every tense + voice bucket.
(function (root) {
    const rawQuestions = [
        // Simple Present / Active
        ["simple_present", "active", "校巴每天早上七時三十分離開學校。", "The school bus ______ (leave) the campus at 7:30 every morning.", ["leaves"], "Active: timetable / routine + singular subject -> leaves。"],
        ["simple_present", "active", "如果你把冰加熱，它就會融化。", "If you heat ice, it ______ (melt).", ["melts"], "Active: zero conditional fact -> simple present。"],
        ["simple_present", "active", "我們的圖書館星期日不開放。", "Our library ______ (not open) on Sundays.", ["does not open", "doesn't open"], "Active: singular subject + does not + base verb。"],
        ["simple_present", "active", "每位參賽者都必須在限時前提交答案。", "Every contestant ______ (submit) the answer before the time limit ends.", ["submits"], "Active: Every + singular noun -> singular verb。"],
        ["simple_present", "active", "這份報告解釋了實驗為何失敗。", "This report ______ (explain) why the experiment fails.", ["explains"], "Active: singular subject -> verb + s。"],
        ["simple_present", "active", "很多學生在作文中混淆這兩個時態。", "Many students ______ (confuse) these two tenses in writing tasks.", ["confuse"], "Active: plural subject -> base verb。"],
        ["simple_present", "active", "那位經理通常在會議前檢查所有數據。", "The manager usually ______ (check) all the figures before the meeting.", ["checks"], "Active: frequency adverb + singular subject -> checks。"],
        ["simple_present", "active", "這條規則適用於所有正式考試。", "This rule ______ (apply) to all formal examinations.", ["applies"], "Active: consonant + y -> ies。"],
        ["simple_present", "active", "我不相信沒有證據的說法。", "I ______ (not believe) claims without evidence.", ["do not believe", "don't believe"], "Active: I + do not + base verb。"],
        ["simple_present", "active", "水在標準氣壓下攝氏一百度沸騰。", "Water ______ (boil) at 100 degrees Celsius under normal pressure.", ["boils"], "Active: scientific fact -> simple present。"],

        // Simple Present / Passive
        ["simple_present", "passive", "所有考卷都由兩位老師批改。", "All examination papers ______ (mark) by two teachers.", ["are marked"], "Passive: plural subject + are + p.p.。"],
        ["simple_present", "passive", "這個表格通常在網上提交。", "This form ______ usually ______ (submit) online.", ["is submitted"], "Passive: singular subject + is + p.p.。"],
        ["simple_present", "passive", "手機不准在考試期間使用。", "Mobile phones ______ (not allow) during the examination.", ["are not allowed", "aren't allowed"], "Passive: plural subject + are not + p.p.。"],
        ["simple_present", "passive", "答案會根據準確度和文法評分。", "The answer ______ (grade) according to accuracy and grammar.", ["is graded"], "Passive: singular subject + is + p.p.。"],
        ["simple_present", "passive", "這些安全指示每天早上廣播。", "These safety instructions ______ (announce) every morning.", ["are announced"], "Passive: plural subject + are + p.p.。"],
        ["simple_present", "passive", "這種方法被很多考生誤解。", "This method ______ often ______ (misunderstand) by candidates.", ["is misunderstood"], "Passive: singular subject + is + irregular p.p.。"],
        ["simple_present", "passive", "每個申請都由系統自動檢查。", "Each application ______ (check) automatically by the system.", ["is checked"], "Passive: Each + singular noun -> is + p.p.。"],
        ["simple_present", "passive", "這些單字在學術文章中經常使用。", "These words ______ frequently ______ (use) in academic articles.", ["are used"], "Passive: plural subject + are + p.p.。"],
        ["simple_present", "passive", "學生被要求準時到達試場。", "Students ______ (require) to arrive at the examination hall on time.", ["are required"], "Passive: plural subject + are + p.p.。"],
        ["simple_present", "passive", "這座橋以它獨特的設計聞名。", "The bridge ______ (know) for its unusual design.", ["is known"], "Passive: be known for -> is known。"],

        // Present Continuous / Active
        ["present_continuous", "active", "他現在正在修改他的申請信。", "He ______ (revise) his application letter right now.", ["is revising"], "Active: right now -> is + ving。"],
        ["present_continuous", "active", "越來越多學生正在使用電子字典。", "More students ______ (use) electronic dictionaries these days.", ["are using"], "Active: changing trend -> are + ving。"],
        ["present_continuous", "active", "我這星期正在準備口試。", "I ______ (prepare) for the oral examination this week.", ["am preparing"], "Active: temporary action -> am + ving。"],
        ["present_continuous", "active", "他們今晚正和校長會面。", "They ______ (meet) the principal tonight.", ["are meeting"], "Active: arranged near future -> are + ving。"],
        ["present_continuous", "active", "這個城市近來正迅速變得更擁擠。", "The city ______ (become) more crowded very quickly these days.", ["is becoming"], "Active: developing situation -> is + ving。"],
        ["present_continuous", "active", "她此刻不是在看電視，而是在溫習。", "She ______ (not watch) television at the moment; she is revising.", ["is not watching", "isn't watching"], "Active: at the moment + negative -> is not + ving。"],
        ["present_continuous", "active", "學生們正在實驗室收集樣本。", "The students ______ (collect) samples in the laboratory now.", ["are collecting"], "Active: now + plural subject -> are + ving。"],
        ["present_continuous", "active", "我現在正在嘗試找出計算錯誤。", "I ______ (try) to find the calculation error right now.", ["am trying"], "Active: current action -> am + ving。"],
        ["present_continuous", "active", "老師現在正在解釋最後一條問題。", "The teacher ______ (explain) the final question now.", ["is explaining"], "Active: current classroom action -> is + ving。"],
        ["present_continuous", "active", "我們正逐步改善校內回收系統。", "We ______ (improve) the recycling system at school step by step.", ["are improving"], "Active: process happening now -> are + ving。"],

        // Present Continuous / Passive
        ["present_continuous", "passive", "申請表正在由辦公室職員處理。", "The application forms ______ (process) by the office staff now.", ["are being processed"], "Passive: plural subject + are being + p.p.。"],
        ["present_continuous", "passive", "新的校規目前正在學生會中討論。", "The new school rule ______ (discuss) by the student council at present.", ["is being discussed"], "Passive: singular subject + is being + p.p.。"],
        ["present_continuous", "passive", "這條道路目前正在維修。", "This road ______ (repair) at the moment.", ["is being repaired"], "Passive: at the moment -> is being + p.p.。"],
        ["present_continuous", "passive", "所有電腦正在安裝新軟件。", "New software ______ (install) on all computers this afternoon.", ["is being installed"], "Passive: uncountable subject + is being + p.p.。"],
        ["present_continuous", "passive", "考試結果現在正在仔細核對。", "The examination results ______ (check) carefully now.", ["are being checked"], "Passive: plural subject + are being + p.p.。"],
        ["present_continuous", "passive", "這個問題正在由專家研究。", "This problem ______ (study) by experts at present.", ["is being studied"], "Passive: at present -> is being + p.p.。"],
        ["present_continuous", "passive", "兩名候選人正在面試。", "Two candidates ______ (interview) in the meeting room.", ["are being interviewed"], "Passive: candidates receive action -> are being interviewed。"],
        ["present_continuous", "passive", "舊課室現在正在改造成閱讀室。", "The old classroom ______ (convert) into a reading room now.", ["is being converted"], "Passive: ongoing change -> is being + p.p.。"],
        ["present_continuous", "passive", "許多投訴目前正在調查中。", "Many complaints ______ (investigate) by the committee at present.", ["are being investigated"], "Passive: plural subject + are being + p.p.。"],
        ["present_continuous", "passive", "新的校園入口現在正在建造。", "A new school entrance ______ (build) near the main road right now.", ["is being built"], "Passive: singular subject + is being + irregular p.p.。"],

        // Present Perfect / Active
        ["present_perfect", "active", "我已經完成了閱讀報告。", "I ______ already ______ (finish) the reading report.", ["have finished"], "Active: already + present perfect。"],
        ["present_perfect", "active", "她自從中一以來一直住在這區。", "She ______ (live) in this district since Form One.", ["has lived"], "Active: since + starting point -> has + p.p.。"],
        ["present_perfect", "active", "他們還未決定研究題目。", "They ______ (not decide) on the research topic yet.", ["have not decided", "haven't decided"], "Active: yet + negative present perfect。"],
        ["present_perfect", "active", "你曾經參加過辯論比賽嗎？", "______ you ever ______ (join) a debating competition?", ["have joined"], "Active: ever question -> Have + subject + p.p.。"],
        ["present_perfect", "active", "我們最近學了幾個常見句型。", "We ______ (learn) several common sentence patterns recently.", ["have learned", "have learnt"], "Active: recently -> present perfect。"],
        ["present_perfect", "active", "老師剛剛派發了答案紙。", "The teacher ______ just ______ (hand) out the answer sheets.", ["has handed"], "Active: just + has + p.p.。"],
        ["present_perfect", "active", "到目前為止，這個錯誤已經在你的文章中出現了三次。", "So far, this mistake ______ (appear) three times in your essay.", ["has appeared"], "Active: repeated experience up to now -> has + p.p.。"],
        ["present_perfect", "active", "很多學生從未見過這種題型。", "Many students ______ never ______ (see) this question type before.", ["have seen"], "Active: never + present perfect。"],
        ["present_perfect", "active", "到目前為止，我們收集了足夠證據。", "So far, we ______ (collect) enough evidence.", ["have collected"], "Active: so far -> present perfect。"],
        ["present_perfect", "active", "他剛剛丟失了學生證，所以不能進入圖書館。", "He ______ just ______ (lose) his student card, so he cannot enter the library.", ["has lost"], "Active: past event with present result -> has + p.p.。"],

        // Present Perfect / Passive
        ["present_perfect", "passive", "所有答案已經被核對。", "All the answers ______ already ______ (check).", ["have been checked"], "Passive: plural subject + have been + p.p.。"],
        ["present_perfect", "passive", "這份報告還未提交。", "This report ______ (not submit) yet.", ["has not been submitted", "hasn't been submitted"], "Passive: yet + has not been + p.p.。"],
        ["present_perfect", "passive", "這間課室自上星期起已被鎖上。", "This classroom ______ (lock) since last week.", ["has been locked"], "Passive: since + has been + p.p.。"],
        ["present_perfect", "passive", "三名學生已經被選中代表學校。", "Three students ______ already ______ (choose) to represent the school.", ["have been chosen"], "Passive: plural subject + have been + irregular p.p.。"],
        ["present_perfect", "passive", "這個問題已經被多次提出。", "This issue ______ (raise) several times.", ["has been raised"], "Passive: repeated action up to now -> has been + p.p.。"],
        ["present_perfect", "passive", "最近很多樹被暴風雨吹倒。", "Many trees ______ (blow) down by the storm recently.", ["have been blown"], "Passive: recently + have been + p.p.。"],
        ["present_perfect", "passive", "新規則已經向家長解釋清楚。", "The new rules ______ already ______ (explain) clearly to parents.", ["have been explained"], "Passive: plural subject + have been + p.p.。"],
        ["present_perfect", "passive", "所有座位剛剛被預訂。", "All seats ______ just ______ (reserve).", ["have been reserved"], "Passive: just + have been + p.p.。"],
        ["present_perfect", "passive", "這份文件從未被公開。", "This document ______ never ______ (publish).", ["has been published"], "Passive: never + has been + p.p.。"],
        ["present_perfect", "passive", "學生資料已經被安全儲存。", "The students' data ______ already ______ (store) safely.", ["has been stored"], "Passive: data as singular mass noun -> has been + p.p.。"],

        // Present Perfect Continuous / Active
        ["present_perfect_continuous", "active", "他已經溫習英文三個小時。", "He ______ (study) English for three hours.", ["has been studying"], "Active: for + duration -> has been + ving。"],
        ["present_perfect_continuous", "active", "我們自早上起一直等待結果。", "We ______ (wait) for the results since this morning.", ["have been waiting"], "Active: since + present perfect continuous。"],
        ["present_perfect_continuous", "active", "她最近一直為演講比賽練習。", "She ______ (practise) for the speech contest recently.", ["has been practising", "has been practicing"], "Active: recent repeated preparation -> has been + ving。"],
        ["present_perfect_continuous", "active", "那些工人整天都在修理升降機。", "The workers ______ (repair) the lift all day.", ["have been repairing"], "Active: all day + ongoing duration -> have been + ving。"],
        ["present_perfect_continuous", "active", "我一直嘗試聯絡負責老師到現在。", "I ______ (try) to contact the teacher in charge until now.", ["have been trying"], "Active: action continuing up to now -> have been + ving。"],
        ["present_perfect_continuous", "active", "她看起來很累，因為她一直在寫作文。", "She looks tired because she ______ (write) essays for hours.", ["has been writing"], "Active: present result + ongoing past activity。"],
        ["present_perfect_continuous", "active", "學生們這星期一直在收集數據。", "The students ______ (collect) data this week.", ["have been collecting"], "Active: this week as unfinished period -> have been + ving。"],
        ["present_perfect_continuous", "active", "這家公司近年一直擴展海外市場。", "The company ______ (expand) its overseas market in recent years.", ["has been expanding"], "Active: ongoing trend -> has been + ving。"],
        ["present_perfect_continuous", "active", "雨從午飯時間起一直下。", "It ______ (rain) since lunchtime.", ["has been raining"], "Active: weather continuing until now -> has been + ving。"],
        ["present_perfect_continuous", "active", "我們最近一直討論如何改善校園安全。", "We ______ (discuss) how to improve campus safety recently.", ["have been discussing"], "Active: continuing discussion -> have been + ving。"],

        // Present Perfect Continuous / Passive
        ["present_perfect_continuous", "passive", "這條道路近幾星期一直在維修。", "This road ______ (repair) for several weeks.", ["has been being repaired"], "Passive structure: has been being + p.p.。"],
        ["present_perfect_continuous", "passive", "那些投訴自上月起一直被調查。", "Those complaints ______ (investigate) since last month.", ["have been being investigated"], "Passive structure: have been being + p.p.。"],
        ["present_perfect_continuous", "passive", "這個計劃一直由委員會審議。", "This proposal ______ (consider) by the committee for a long time.", ["has been being considered"], "Passive structure: has been being + p.p.。"],
        ["present_perfect_continuous", "passive", "舊校舍最近一直在分階段翻新。", "The old school building ______ (renovate) in stages recently.", ["has been being renovated"], "Passive structure: has been being + p.p.。"],
        ["present_perfect_continuous", "passive", "新制度近來一直被不同部門測試。", "The new system ______ (test) by different departments lately.", ["has been being tested"], "Passive structure: has been being + p.p.。"],
        ["present_perfect_continuous", "passive", "這些樣本整個早上都在分析。", "These samples ______ (analyse) all morning.", ["have been being analysed", "have been being analyzed"], "Passive structure: have been being + p.p.。"],
        ["present_perfect_continuous", "passive", "校園入口一直在重新設計。", "The school entrance ______ (redesign) for months.", ["has been being redesigned"], "Passive structure: has been being + p.p.。"],
        ["present_perfect_continuous", "passive", "這些文件最近一直被仔細檢查。", "These documents ______ (examine) carefully recently.", ["have been being examined"], "Passive structure: have been being + p.p.。"],
        ["present_perfect_continuous", "passive", "這項政策多年來一直受到質疑。", "This policy ______ (question) for years.", ["has been being questioned"], "Passive structure: has been being + p.p.。"],
        ["present_perfect_continuous", "passive", "幾間課室自暑假起一直在粉刷。", "Several classrooms ______ (paint) since the summer holiday.", ["have been being painted"], "Passive structure: have been being + p.p.。"],

        // Simple Past / Active
        ["simple_past", "active", "他昨天忘記帶功課。", "He ______ (forget) to bring his homework yesterday.", ["forgot"], "Active: yesterday -> simple past。"],
        ["simple_past", "active", "我們上星期參觀了科學博物館。", "We ______ (visit) the Science Museum last week.", ["visited"], "Active: last week -> simple past。"],
        ["simple_past", "active", "她昨天在比賽中贏得第一名。", "She ______ (win) first prize in the competition yesterday.", ["won"], "Active: completed past event -> won。"],
        ["simple_past", "active", "他們兩年前搬到香港。", "They ______ (move) to Hong Kong two years ago.", ["moved"], "Active: ago -> simple past。"],
        ["simple_past", "active", "我剛才沒有聽清楚最後一個指示。", "I ______ (not hear) the last instruction clearly just now.", ["did not hear", "didn't hear"], "Active: past negative -> did not + base verb。"],
        ["simple_past", "active", "老師昨天問了一條很有挑戰性的問題。", "The teacher ______ (ask) a challenging question yesterday.", ["asked"], "Active: completed action -> simple past。"],
        ["simple_past", "active", "電腦突然停止運作。", "The computer suddenly ______ (stop) working.", ["stopped"], "Active: stop -> stopped。"],
        ["simple_past", "active", "他在演講後回答了所有問題。", "He ______ (answer) all the questions after the speech.", ["answered"], "Active: after + completed past action。"],
        ["simple_past", "active", "我們沒有在測驗中使用計算機。", "We ______ (not use) calculators in the quiz.", ["did not use", "didn't use"], "Active: did not + base verb。"],
        ["simple_past", "active", "那名學生昨天寫了一篇出色的文章。", "The student ______ (write) an excellent article yesterday.", ["wrote"], "Active: irregular past -> wrote。"],

        // Simple Past / Passive
        ["simple_past", "passive", "這座橋在一九九八年建成。", "The bridge ______ (build) in 1998.", ["was built"], "Passive: singular subject + was + p.p.。"],
        ["simple_past", "passive", "所有門票在一小時內售罄。", "All tickets ______ (sell) within an hour.", ["were sold"], "Passive: plural subject + were + p.p.。"],
        ["simple_past", "passive", "窗戶昨晚被強風吹破。", "The window ______ (break) by the strong wind last night.", ["was broken"], "Passive: singular subject + was + p.p.。"],
        ["simple_past", "passive", "三名學生上星期被邀請參加面試。", "Three students ______ (invite) to attend the interview last week.", ["were invited"], "Passive: plural subject + were + p.p.。"],
        ["simple_past", "passive", "錯誤在提交前被發現。", "The error ______ (discover) before submission.", ["was discovered"], "Passive: singular subject + was + p.p.。"],
        ["simple_past", "passive", "這些相片上月在校刊中刊登。", "These photos ______ (publish) in the school magazine last month.", ["were published"], "Passive: plural subject + were + p.p.。"],
        ["simple_past", "passive", "比賽因暴雨取消。", "The match ______ (cancel) because of heavy rain.", ["was cancelled", "was canceled"], "Passive: singular subject + was + p.p.。"],
        ["simple_past", "passive", "幾個重要決定在會議上作出。", "Several important decisions ______ (make) at the meeting.", ["were made"], "Passive: plural subject + were + irregular p.p.。"],
        ["simple_past", "passive", "那封電郵錯誤地發給全班。", "The email ______ (send) to the whole class by mistake.", ["was sent"], "Passive: singular subject + was + p.p.。"],
        ["simple_past", "passive", "所有參賽作品昨天由評判仔細閱讀。", "All entries ______ (read) carefully by the judges yesterday.", ["were read"], "Passive: plural subject + were + p.p.。"],

        // Past Continuous / Active
        ["past_continuous", "active", "電話響起時，我正在做筆記。", "I ______ (take) notes when the phone rang.", ["was taking"], "Active: past action interrupted by simple past。"],
        ["past_continuous", "active", "老師進來時，學生們正在討論答案。", "The students ______ (discuss) the answer when the teacher came in.", ["were discussing"], "Active: background action -> were + ving。"],
        ["past_continuous", "active", "昨晚九時她正在準備報告。", "She ______ (prepare) the report at nine o'clock last night.", ["was preparing"], "Active: exact past time -> was + ving。"],
        ["past_continuous", "active", "我們到達時，他們正在等巴士。", "They ______ (wait) for the bus when we arrived.", ["were waiting"], "Active: ongoing past action -> were + ving。"],
        ["past_continuous", "active", "我正在閱讀時燈突然熄滅。", "While I ______ (read), the lights suddenly went out.", ["was reading"], "Active: while + past continuous。"],
        ["past_continuous", "active", "兩隊在暴雨中仍然比賽。", "The two teams ______ (play) in the heavy rain.", ["were playing"], "Active: ongoing past scene -> were + ving。"],
        ["past_continuous", "active", "他沒有聽，因為他正在看窗外。", "He ______ (not listen) because he was looking out of the window.", ["was not listening", "wasn't listening"], "Active: past continuous negative。"],
        ["past_continuous", "active", "我見到她時，她正在排隊。", "She ______ (queue) when I saw her.", ["was queuing", "was queueing"], "Active: interrupted action -> was + ving。"],
        ["past_continuous", "active", "我們正在做實驗時警鐘響起。", "We ______ (do) the experiment when the alarm sounded.", ["were doing"], "Active: when + simple past interruption。"],
        ["past_continuous", "active", "雨一直下，所以比賽延期。", "It ______ (rain), so the match was postponed.", ["was raining"], "Active: background weather -> was + ving。"],

        // Past Continuous / Passive
        ["past_continuous", "passive", "我到達時，考卷正在派發。", "The examination papers ______ (hand) out when I arrived.", ["were being handed"], "Passive: plural subject + were being + p.p.。"],
        ["past_continuous", "passive", "校長進來時，問題正在討論。", "The question ______ (discuss) when the principal entered.", ["was being discussed"], "Passive: singular subject + was being + p.p.。"],
        ["past_continuous", "passive", "昨晚八時，電腦正在維修。", "The computers ______ (repair) at eight o'clock last night.", ["were being repaired"], "Passive: exact past time -> were being + p.p.。"],
        ["past_continuous", "passive", "警鐘響起時，窗戶正在清潔。", "The windows ______ (clean) when the alarm rang.", ["were being cleaned"], "Passive: plural subject + were being + p.p.。"],
        ["past_continuous", "passive", "我打電話時，申請正在處理。", "The application ______ (process) when I called.", ["was being processed"], "Passive: singular subject + was being + p.p.。"],
        ["past_continuous", "passive", "下雨時，舞台正在搭建。", "The stage ______ (set) up while it was raining.", ["was being set"], "Passive: was being + irregular p.p.。"],
        ["past_continuous", "passive", "老師回來時，那些海報正在貼上。", "The posters ______ (put) up when the teacher returned.", ["were being put"], "Passive: were being + p.p.。"],
        ["past_continuous", "passive", "我們等候期間，答案正在核對。", "The answers ______ (check) while we were waiting.", ["were being checked"], "Passive: while + past continuous。"],
        ["past_continuous", "passive", "事故發生時，道路正在擴闊。", "The road ______ (widen) when the accident happened.", ["was being widened"], "Passive: was being + p.p.。"],
        ["past_continuous", "passive", "我進入房間時，訪問正在錄影。", "The interview ______ (record) when I entered the room.", ["was being recorded"], "Passive: ongoing passive at past moment。"],

        // Past Perfect / Active
        ["past_perfect", "active", "我到達時，電影已經開始了。", "The film ______ already ______ (start) when I arrived.", ["had started"], "Active: earlier past before another past action -> had + p.p.。"],
        ["past_perfect", "active", "她交功課前已經檢查了三次。", "She ______ (check) the homework three times before she handed it in.", ["had checked"], "Active: before + later past action。"],
        ["past_perfect", "active", "我們買票前，票價已經上升。", "The price ______ (rise) before we bought the tickets.", ["had risen"], "Active: earlier change -> had + p.p.。"],
        ["past_perfect", "active", "老師發現他之前沒有完成練習。", "The teacher found that he ______ (not finish) the exercise earlier.", ["had not finished", "hadn't finished"], "Active: reported past result -> had not + p.p.。"],
        ["past_perfect", "active", "他們到達車站時，火車已經離開。", "The train ______ (leave) by the time they reached the station.", ["had left"], "Active: by the time + past -> past perfect。"],
        ["past_perfect", "active", "我以前從未見過這種格式。", "I ______ never ______ (see) this format before.", ["had seen"], "Active: before a past reference point -> had + p.p.。"],
        ["past_perfect", "active", "她答錯，因為她之前誤解了題目。", "She answered wrongly because she ______ (misunderstand) the question earlier.", ["had misunderstood"], "Active: cause before past result -> had + p.p.。"],
        ["past_perfect", "active", "我們開始前，技術員已經測試了設備。", "The technician ______ (test) the equipment before we started.", ["had tested"], "Active: earlier completed action -> had + p.p.。"],
        ["past_perfect", "active", "他道歉，因為他之前忘記了約定。", "He apologised because he ______ (forget) the appointment earlier.", ["had forgotten"], "Active: earlier reason -> had + p.p.。"],
        ["past_perfect", "active", "截止日期前，他們已經完成所有訪問。", "They ______ (complete) all the interviews before the deadline.", ["had completed"], "Active: completed before past deadline -> had + p.p.。"],

        // Past Perfect / Passive
        ["past_perfect", "passive", "我到達時，門已經被鎖上。", "The door ______ already ______ (lock) when I arrived.", ["had been locked"], "Passive: earlier passive action -> had been + p.p.。"],
        ["past_perfect", "passive", "報告提交前已被仔細修改。", "The report ______ (revise) carefully before it was submitted.", ["had been revised"], "Passive: before later past event -> had been + p.p.。"],
        ["past_perfect", "passive", "會議開始前，所有座位已被預留。", "All seats ______ (reserve) before the meeting began.", ["had been reserved"], "Passive: plural subject + had been + p.p.。"],
        ["past_perfect", "passive", "校長宣布前，結果已經確認。", "The results ______ (confirm) before the principal made the announcement.", ["had been confirmed"], "Passive: earlier confirmation -> had been + p.p.。"],
        ["past_perfect", "passive", "警方到場前，那輛單車已被偷走。", "The bicycle ______ (steal) before the police arrived.", ["had been stolen"], "Passive: earlier theft -> had been + p.p.。"],
        ["past_perfect", "passive", "我們使用前，儀器已經校準。", "The instruments ______ (calibrate) before we used them.", ["had been calibrated"], "Passive: plural subject + had been + p.p.。"],
        ["past_perfect", "passive", "比賽取消前，門票已經售出。", "The tickets ______ (sell) before the match was cancelled.", ["had been sold"], "Passive: earlier completed passive -> had been + p.p.。"],
        ["past_perfect", "passive", "老師發現那些答案之前已被抄襲。", "The teacher discovered that the answers ______ already ______ (copy).", ["had been copied"], "Passive: reported earlier passive -> had been + p.p.。"],
        ["past_perfect", "passive", "大樓重開前，安全系統已更新。", "The security system ______ (update) before the building reopened.", ["had been updated"], "Passive: had been + p.p.。"],
        ["past_perfect", "passive", "我們離開前，所有燈已經關掉。", "All the lights ______ (switch) off before we left.", ["had been switched"], "Passive: plural subject + had been + p.p.。"],

        // Past Perfect Continuous / Active
        ["past_perfect_continuous", "active", "她到達時，我們已經等了半小時。", "We ______ (wait) for half an hour when she arrived.", ["had been waiting"], "Active: duration before past event -> had been + ving。"],
        ["past_perfect_continuous", "active", "他看起來很累，因為他整晚都在溫習。", "He looked tired because he ______ (revise) all night.", ["had been revising"], "Active: past result + earlier continuing action。"],
        ["past_perfect_continuous", "active", "下雨前，孩子們已經在操場玩了很久。", "The children ______ (play) in the playground for a long time before it started raining.", ["had been playing"], "Active: for + duration before past event。"],
        ["past_perfect_continuous", "active", "老師發現學生之前一直在討論同一條問題。", "The teacher found that the students ______ (discuss) the same question before he entered.", ["had been discussing"], "Active: ongoing action before past discovery。"],
        ["past_perfect_continuous", "active", "我終於完成時，已經寫了兩小時。", "I ______ (write) for two hours when I finally finished.", ["had been writing"], "Active: duration leading to past endpoint。"],
        ["past_perfect_continuous", "active", "他們取消活動前，一直籌備了幾個月。", "They ______ (prepare) for the event for months before it was cancelled.", ["had been preparing"], "Active: preparation continuing before cancellation。"],
        ["past_perfect_continuous", "active", "在問題解決前，工程師一直檢查系統。", "The engineers ______ (check) the system before the problem was solved.", ["had been checking"], "Active: continuing action before past result。"],
        ["past_perfect_continuous", "active", "她失聲前已經練習演講多日。", "She ______ (practise) the speech for days before she lost her voice.", ["had been practising", "had been practicing"], "Active: duration before past event。"],
        ["past_perfect_continuous", "active", "我們意識到錯誤前，一直使用錯誤公式。", "We ______ (use) the wrong formula before we realised the mistake.", ["had been using"], "Active: ongoing earlier action -> had been + ving。"],
        ["past_perfect_continuous", "active", "巴士到達前，乘客一直在雨中排隊。", "The passengers ______ (queue) in the rain before the bus arrived.", ["had been queuing", "had been queueing"], "Active: continuing action before past arrival。"],

        // Past Perfect Continuous / Passive
        ["past_perfect_continuous", "passive", "項目取消前，舊大樓已經被翻新數月。", "The old building ______ (renovate) for months before the project was cancelled.", ["had been being renovated"], "Passive structure: had been being + p.p.。"],
        ["past_perfect_continuous", "passive", "結果公布前，數據已經被分析數星期。", "The data ______ (analyse) for weeks before the results were announced.", ["had been being analysed", "had been being analyzed"], "Passive structure: had been being + p.p.。"],
        ["past_perfect_continuous", "passive", "會議結束前，該問題已被討論了很久。", "The issue ______ (discuss) for a long time before the meeting ended.", ["had been being discussed"], "Passive structure: had been being + p.p.。"],
        ["past_perfect_continuous", "passive", "系統推出前，程式已經被測試多日。", "The program ______ (test) for days before the system was launched.", ["had been being tested"], "Passive structure: had been being + p.p.。"],
        ["past_perfect_continuous", "passive", "警察到達前，現場已經被仔細檢查。", "The scene ______ (examine) carefully before the police arrived.", ["had been being examined"], "Passive structure: had been being + p.p.。"],
        ["past_perfect_continuous", "passive", "道路重開前，路面已維修了數星期。", "The road surface ______ (repair) for weeks before the road reopened.", ["had been being repaired"], "Passive structure: had been being + p.p.。"],
        ["past_perfect_continuous", "passive", "申請截止前，那些表格一直被處理。", "The forms ______ (process) before the application deadline.", ["had been being processed"], "Passive structure: had been being + p.p.。"],
        ["past_perfect_continuous", "passive", "決定作出前，建議一直被審查。", "The proposal ______ (review) before the decision was made.", ["had been being reviewed"], "Passive structure: had been being + p.p.。"],
        ["past_perfect_continuous", "passive", "比賽開始前，草地已經被灑水很久。", "The grass ______ (water) for a long time before the match began.", ["had been being watered"], "Passive structure: had been being + p.p.。"],
        ["past_perfect_continuous", "passive", "我們接手前，這個個案已被跟進多年。", "The case ______ (follow) up for years before we took over.", ["had been being followed"], "Passive structure: had been being + p.p.。"],

        // Simple Future / Active
        ["simple_future", "active", "我保證今晚會把草稿寄給你。", "I promise I ______ (send) you the draft tonight.", ["will send"], "Active: future intention / promise -> will + base verb。"],
        ["simple_future", "active", "如果下雨，比賽會較原定時間遲開始。", "If it rains, the match ______ (start) later than planned.", ["will start"], "Active: first conditional main clause -> will + base verb。"],
        ["simple_future", "active", "她明年很可能會申請大學。", "She probably ______ (apply) for university next year.", ["will apply"], "Active: probability cue -> will + base verb。"],
        ["simple_future", "active", "我想他們會接受這個建議。", "I think they ______ (accept) the suggestion.", ["will accept"], "Active: prediction -> will + base verb。"],
        ["simple_future", "active", "我們保證不會忘記你的幫助。", "We promise we ______ (not forget) your help.", ["will not forget", "won't forget"], "Active: promise -> will not + base verb。"],
        ["simple_future", "active", "門鈴響了，我去開門。", "The doorbell is ringing. I ______ (answer) it.", ["will answer"], "Active: instant decision -> will + base verb。"],
        ["simple_future", "active", "你努力練習就會進步。", "You ______ (improve) if you practise regularly.", ["will improve"], "Active: first conditional -> will + base verb。"],
        ["simple_future", "active", "我預計他們明天會公布結果。", "I expect they ______ (announce) the results tomorrow.", ["will announce"], "Active: prediction with expect -> will + base verb。"],
        ["simple_future", "active", "我肯定這個方法會有效。", "I am sure this method ______ (work).", ["will work"], "Active: future prediction -> will + base verb。"],
        ["simple_future", "active", "請不要擔心，我會準時到達。", "Do not worry. I ______ (arrive) on time.", ["will arrive"], "Active: promise -> will + base verb。"],

        // Simple Future / Passive
        ["simple_future", "passive", "我預計結果明天會公布。", "I expect the results ______ (announce) tomorrow.", ["will be announced"], "Passive prediction: will be + p.p.。"],
        ["simple_future", "passive", "我預計所有申請將由委員會審查。", "I expect all applications ______ (review) by the committee.", ["will be reviewed"], "Passive prediction: plural subject + will be + p.p.。"],
        ["simple_future", "passive", "如果天氣惡劣，活動會取消。", "If the weather is bad, the event ______ (cancel).", ["will be cancelled", "will be canceled"], "Passive: first conditional + will be + p.p.。"],
        ["simple_future", "passive", "我相信新圖書館下月會開放。", "I believe the new library ______ (open) next month.", ["will be opened"], "Passive prediction: will be + p.p.。"],
        ["simple_future", "passive", "我預計所有學生會獲發證書。", "I expect all students ______ (give) a certificate.", ["will be given"], "Passive prediction: indirect object passive -> will be given。"],
        ["simple_future", "passive", "我預計這份報告會在會議中討論。", "I expect this report ______ (discuss) at the meeting.", ["will be discussed"], "Passive prediction: will be + p.p.。"],
        ["simple_future", "passive", "我預計舊電腦會被新的型號取代。", "I expect the old computers ______ (replace) by newer models.", ["will be replaced"], "Passive prediction: plural subject + will be + p.p.。"],
        ["simple_future", "passive", "我預計得獎者會在典禮上表揚。", "I expect the winners ______ (honour) at the ceremony.", ["will be honoured", "will be honored"], "Passive prediction: will be + p.p.。"],
        ["simple_future", "passive", "我預計新的安全措施會立即實施。", "I expect new safety measures ______ (implement) immediately.", ["will be implemented"], "Passive prediction: plural subject + will be + p.p.。"],
        ["simple_future", "passive", "你的問題會盡快處理。", "Your question ______ (deal) with as soon as possible.", ["will be dealt"], "Passive phrasal verb: will be dealt with。"],

        // Future Continuous / Active
        ["future_continuous", "active", "明天這個時候，我會在考試。", "This time tomorrow, I ______ (sit) for the examination.", ["will be sitting"], "Active: this time tomorrow -> will be + ving。"],
        ["future_continuous", "active", "今晚八時我們會在排練。", "We ______ (rehearse) at eight o'clock tonight.", ["will be rehearsing"], "Active: future time in progress -> will be + ving。"],
        ["future_continuous", "active", "你到達時，她會正在做簡報。", "She ______ (give) a presentation when you arrive.", ["will be giving"], "Active: future background action -> will be + ving。"],
        ["future_continuous", "active", "明天整個下午他們會在討論計劃。", "They ______ (discuss) the plan throughout tomorrow afternoon.", ["will be discussing"], "Active: throughout future period -> will be + ving。"],
        ["future_continuous", "active", "下星期這個時候，我們會在收集數據。", "At this time next week, we ______ (collect) data.", ["will be collecting"], "Active: at this time next week -> will be + ving。"],
        ["future_continuous", "active", "今晚不要打電話給我，我會在溫習。", "Do not call me tonight; I ______ (revise).", ["will be revising"], "Active: planned future activity in progress。"],
        ["future_continuous", "active", "明天早上九時，校長會正在跟家長會面。", "At nine tomorrow morning, the principal ______ (meet) parents.", ["will be meeting"], "Active: future arranged activity in progress。"],
        ["future_continuous", "active", "我們到達時，他們應該正在等候。", "They ______ (wait) when we arrive.", ["will be waiting"], "Active: future continuous background。"],
        ["future_continuous", "active", "整個星期，工程師會測試新系統。", "The engineers ______ (test) the new system throughout the week.", ["will be testing"], "Active: future duration -> will be + ving。"],
        ["future_continuous", "active", "明早九時，我會正在接受面試。", "At nine tomorrow morning, I ______ (attend) an interview.", ["will be attending"], "Active: exact future time -> will be + ving。"],

        // Future Continuous / Passive
        ["future_continuous", "passive", "明天這個時候，系統將正在測試。", "This time tomorrow, the system ______ (test).", ["will be being tested"], "Passive structure: will be being + p.p.。"],
        ["future_continuous", "passive", "今晚八時，禮堂將正在佈置。", "At eight tonight, the hall ______ (decorate).", ["will be being decorated"], "Passive structure: will be being + p.p.。"],
        ["future_continuous", "passive", "你到達時，結果會正在核對。", "The results ______ (check) when you arrive.", ["will be being checked"], "Passive structure: future ongoing passive。"],
        ["future_continuous", "passive", "下星期整週，舊課室會正在翻新。", "Throughout next week, the old classrooms ______ (renovate).", ["will be being renovated"], "Passive structure: will be being + p.p.。"],
        ["future_continuous", "passive", "明早十時，申請會正在處理。", "At ten tomorrow morning, the applications ______ (process).", ["will be being processed"], "Passive structure: plural subject + will be being + p.p.。"],
        ["future_continuous", "passive", "整個下午，設備會正在檢查。", "The equipment ______ (inspect) throughout the afternoon.", ["will be being inspected"], "Passive structure: will be being + p.p.。"],
        ["future_continuous", "passive", "下週這個時候，報告會正在審閱。", "At this time next week, the reports ______ (review).", ["will be being reviewed"], "Passive structure: plural subject + will be being + p.p.。"],
        ["future_continuous", "passive", "比賽期間，所有入口會有人監察。", "All entrances ______ (monitor) during the competition.", ["will be being monitored"], "Passive structure: will be being + p.p.。"],
        ["future_continuous", "passive", "明天上午十時，訪問會正在錄影。", "At ten tomorrow morning, the interviews ______ (record).", ["will be being recorded"], "Passive structure: future continuous passive。"],
        ["future_continuous", "passive", "你回來時，問題會正在處理。", "The problem ______ (deal) with when you return.", ["will be being dealt"], "Passive phrasal structure: will be being dealt with。"],

        // Future Perfect / Active
        ["future_perfect", "active", "到星期五，我會完成整份報告。", "By Friday, I ______ (finish) the whole report.", ["will have finished"], "Active: by + future time -> will have + p.p.。"],
        ["future_perfect", "active", "到你回來時，他們已經離開。", "They ______ (leave) by the time you return.", ["will have left"], "Active: by the time + present simple future reference。"],
        ["future_perfect", "active", "到年底，她會學懂三千個單字。", "By the end of the year, she ______ (learn) three thousand words.", ["will have learned", "will have learnt"], "Active: future completion -> will have + p.p.。"],
        ["future_perfect", "active", "到考試開始時，我們已經溫習所有章節。", "We ______ (revise) all chapters by the time the exam begins.", ["will have revised"], "Active: by the time + future reference。"],
        ["future_perfect", "active", "到明天早上，雨應該已經停了。", "The rain ______ (stop) by tomorrow morning.", ["will have stopped"], "Active: completed before future point。"],
        ["future_perfect", "active", "到下月，他會在這裡工作滿十年。", "By next month, he ______ (work) here for ten years.", ["will have worked"], "Active: state completed up to future point -> will have + p.p.。"],
        ["future_perfect", "active", "到我們到達時，老師會已經解釋了規則。", "The teacher ______ (explain) the rules by the time we arrive.", ["will have explained"], "Active: earlier than future arrival -> will have + p.p.。"],
        ["future_perfect", "active", "到六時，他們會交齊所有表格。", "They ______ (submit) all forms by six o'clock.", ["will have submitted"], "Active: by six o'clock -> will have + p.p.。"],
        ["future_perfect", "active", "到下星期，研究小組會收集足夠資料。", "By next week, the research team ______ (collect) enough information.", ["will have collected"], "Active: future completion -> will have + p.p.。"],
        ["future_perfect", "active", "到比賽結束時，她會打破校紀錄。", "She ______ (break) the school record by the end of the race.", ["will have broken"], "Active: by future endpoint -> will have + p.p.。"],

        // Future Perfect / Passive
        ["future_perfect", "passive", "到星期五，報告會已經完成。", "The report ______ (finish) by Friday.", ["will have been finished"], "Passive: will have been + p.p.。"],
        ["future_perfect", "passive", "到你回來時，所有座位會被預訂。", "All seats ______ (reserve) by the time you return.", ["will have been reserved"], "Passive: by the time + future reference。"],
        ["future_perfect", "passive", "到年底，三棟新校舍會建成。", "Three new school buildings ______ (build) by the end of the year.", ["will have been built"], "Passive: plural subject + will have been + p.p.。"],
        ["future_perfect", "passive", "到考試前，所有規則會清楚解釋。", "All rules ______ (explain) clearly before the examination.", ["will have been explained"], "Passive: future completion before another future event。"],
        ["future_perfect", "passive", "到明早，損壞的電腦會被修好。", "The broken computers ______ (repair) by tomorrow morning.", ["will have been repaired"], "Passive: by future time -> will have been + p.p.。"],
        ["future_perfect", "passive", "到會議開始時，議程會已經派發。", "The agenda ______ (send) out by the time the meeting starts.", ["will have been sent"], "Passive: will have been + p.p.。"],
        ["future_perfect", "passive", "到下星期，所有申請會審批完畢。", "All applications ______ (approve) by next week.", ["will have been approved"], "Passive: plural subject + will have been + p.p.。"],
        ["future_perfect", "passive", "到六時，課室會已經清潔。", "The classrooms ______ (clean) by six o'clock.", ["will have been cleaned"], "Passive: future perfect passive。"],
        ["future_perfect", "passive", "到新制度推出時，員工會受訓。", "The staff ______ (train) by the time the new system is introduced.", ["will have been trained"], "Passive: collective staff + will have been + p.p.。"],
        ["future_perfect", "passive", "到活動結束時，所有照片會上載。", "All photos ______ (upload) by the end of the event.", ["will have been uploaded"], "Passive: by future endpoint -> will have been + p.p.。"],

        // Future Perfect Continuous / Active
        ["future_perfect_continuous", "active", "到六月，我會學英文滿六年。", "By June, I ______ (study) English for six years.", ["will have been studying"], "Active: by + future time + for duration -> will have been + ving。"],
        ["future_perfect_continuous", "active", "到他退休時，他會在這校任教三十年。", "By the time he retires, he ______ (teach) at this school for thirty years.", ["will have been teaching"], "Active: duration up to future point。"],
        ["future_perfect_continuous", "active", "到明早，雨會已經下了兩天。", "By tomorrow morning, it ______ (rain) for two days.", ["will have been raining"], "Active: weather continuing until future point。"],
        ["future_perfect_continuous", "active", "到比賽開始時，他們會訓練了三個月。", "By the time the competition starts, they ______ (train) for three months.", ["will have been training"], "Active: preparation continuing up to future point。"],
        ["future_perfect_continuous", "active", "到下週，我們會研究這問題整整一個月。", "By next week, we ______ (study) this issue for a whole month.", ["will have been studying"], "Active: duration up to future time。"],
        ["future_perfect_continuous", "active", "到暑假，他會為這項目工作半年。", "By the summer holiday, he ______ (work) on this project for half a year.", ["will have been working"], "Active: future perfect continuous。"],
        ["future_perfect_continuous", "active", "到她到達時，我們會等了兩小時。", "By the time she arrives, we ______ (wait) for two hours.", ["will have been waiting"], "Active: waiting duration up to future arrival。"],
        ["future_perfect_continuous", "active", "到報告完成時，小組會收集數據數星期。", "By the time the report is completed, the group ______ (collect) data for weeks.", ["will have been collecting"], "Active: future duration before completion。"],
        ["future_perfect_continuous", "active", "到年底，這家公司會擴展海外市場三年。", "By the end of the year, the company ______ (expand) overseas for three years.", ["will have been expanding"], "Active: ongoing trend up to future point。"],
        ["future_perfect_continuous", "active", "到考試日，他會練習作文數月。", "By the examination day, he ______ (practise) writing essays for months.", ["will have been practising", "will have been practicing"], "Active: preparation up to future point。"],

        // Future Perfect Continuous / Passive
        ["future_perfect_continuous", "passive", "到下月，這條路會被維修了半年。", "By next month, this road ______ (repair) for half a year.", ["will have been being repaired"], "Passive structure: will have been being + p.p.。"],
        ["future_perfect_continuous", "passive", "到調查結束時，數據會被分析了數星期。", "By the end of the investigation, the data ______ (analyse) for weeks.", ["will have been being analysed", "will have been being analyzed"], "Passive structure: will have been being + p.p.。"],
        ["future_perfect_continuous", "passive", "到年底，舊校舍會被翻新了一整年。", "By the end of the year, the old school building ______ (renovate) for a whole year.", ["will have been being renovated"], "Passive structure: will have been being + p.p.。"],
        ["future_perfect_continuous", "passive", "到系統推出時，程式會被測試了三個月。", "By the time the system is launched, the program ______ (test) for three months.", ["will have been being tested"], "Passive structure: will have been being + p.p.。"],
        ["future_perfect_continuous", "passive", "到會議結束時，該問題會被討論了兩小時。", "By the time the meeting ends, the issue ______ (discuss) for two hours.", ["will have been being discussed"], "Passive structure: will have been being + p.p.。"],
        ["future_perfect_continuous", "passive", "到明天，這些申請會被處理了整整一星期。", "By tomorrow, these applications ______ (process) for a full week.", ["will have been being processed"], "Passive structure: will have been being + p.p.。"],
        ["future_perfect_continuous", "passive", "到工程完成時，橋樑會被檢查了多日。", "By the time the project is completed, the bridge ______ (inspect) for days.", ["will have been being inspected"], "Passive structure: will have been being + p.p.。"],
        ["future_perfect_continuous", "passive", "到新政策實施時，建議會被審議了數月。", "By the time the new policy is introduced, the proposal ______ (consider) for months.", ["will have been being considered"], "Passive structure: will have been being + p.p.。"],
        ["future_perfect_continuous", "passive", "到下星期，這些樣本會被觀察了十天。", "By next week, these samples ______ (observe) for ten days.", ["will have been being observed"], "Passive structure: will have been being + p.p.。"],
        ["future_perfect_continuous", "passive", "到活動開始時，場地會被佈置了整個上午。", "By the time the event starts, the venue ______ (decorate) all morning.", ["will have been being decorated"], "Passive structure: will have been being + p.p.。"]
    ];

    const bank = Array.isArray(root.GRAMMAR_TENSE_BANK) ? root.GRAMMAR_TENSE_BANK : [];
    rawQuestions.forEach(([tense, voice, chinese, question, answers, exp], index) => {
        bank.push({
            id: `TENSE_EXAM_${String(index + 1).padStart(3, '0')}`,
            tense,
            voice,
            chinese,
            question,
            answers,
            exp
        });
    });
    root.GRAMMAR_TENSE_BANK = bank;
})(typeof window !== 'undefined' ? window : globalThis);
