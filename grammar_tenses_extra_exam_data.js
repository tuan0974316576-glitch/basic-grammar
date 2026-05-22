// Extra exam-style tense expansion for Grammar TENSES battle mode.
// Adds another 10 questions for every tense + voice bucket, plus mixed-tense drills.
(function (root) {
    const packs = [
        {
            tense: 'simple_present',
            voice: 'active',
            items: [
                ['學生通常在交卷前檢查姓名。', 'Students usually ______ (check) their names before handing in papers.', ['check'], 'Simple present: routine + plural subject。'],
                ['這個應用程式會自動儲存草稿。', 'This app automatically ______ (save) a draft every few seconds.', ['saves'], 'Simple present: singular subject + verb-s。'],
                ['她很少在測驗中猜答案。', 'She rarely ______ (guess) answers in quizzes.', ['guesses'], 'Simple present: adverb of frequency + singular subject。'],
                ['如果你混合紅色和藍色，你會得到紫色。', 'If you mix red and blue, you ______ (get) purple.', ['get'], 'Zero conditional uses simple present。'],
                ['這間中心星期一不接收申請。', 'This centre ______ (not accept) applications on Mondays.', ['does not accept', "doesn't accept"], 'Simple present negative: does not + base verb。'],
                ['很多考生忘記在答案中引用證據。', 'Many candidates ______ (forget) to quote evidence in their answers.', ['forget'], 'Plural subject + base verb。'],
                ['每個房間都有一個緊急出口。', 'Each room ______ (have) an emergency exit.', ['has'], 'Each + singular noun -> has。'],
                ['太陽從東方升起。', 'The sun ______ (rise) in the east.', ['rises'], 'General truth -> simple present。'],
                ['這份指引清楚說明評分標準。', 'The guideline clearly ______ (state) the marking criteria.', ['states'], 'Singular subject + verb-s。'],
                ['我通常不在睡前喝咖啡。', 'I usually ______ (not drink) coffee before bed.', ['do not drink', "don't drink"], 'I + do not + base verb。']
            ]
        },
        {
            tense: 'simple_present',
            voice: 'passive',
            items: [
                ['所有答案都會由電腦掃描。', 'All answer sheets ______ (scan) by computer.', ['are scanned'], 'Passive: plural subject + are + p.p.。'],
                ['這個密碼每三個月更改一次。', 'This password ______ (change) every three months.', ['is changed'], 'Passive: singular subject + is + p.p.。'],
                ['試場內不准使用智能手錶。', 'Smart watches ______ (not allow) in the examination hall.', ['are not allowed', "aren't allowed"], 'Passive negative: are not + p.p.。'],
                ['每一份申請都會個別處理。', 'Each application ______ (handle) separately.', ['is handled'], 'Each + singular subject -> is + p.p.。'],
                ['這些資料通常會保密。', 'These details ______ usually ______ (keep) confidential.', ['are kept'], 'Passive with adverb: are usually kept。'],
                ['新學生會被分配到不同小組。', 'New students ______ (assign) to different groups.', ['are assigned'], 'Passive: plural subject + are + p.p.。'],
                ['這本書在初中課程中使用。', 'This book ______ (use) in the junior curriculum.', ['is used'], 'Passive: singular subject + is + p.p.。'],
                ['違規行為會立即報告。', 'Any breach of rules ______ (report) immediately.', ['is reported'], 'Any singular noun phrase -> is + p.p.。'],
                ['訪客會被要求出示身份證明。', 'Visitors ______ (require) to show identification.', ['are required'], 'Passive: visitors receive requirement。'],
                ['這些錯誤經常被忽略。', 'These mistakes ______ often ______ (overlook).', ['are overlooked'], 'Passive with often -> are often overlooked。']
            ]
        },
        {
            tense: 'present_continuous',
            voice: 'active',
            items: [
                ['他現在正在核對參考書目。', 'He ______ (check) the bibliography right now.', ['is checking'], 'Present continuous: right now。'],
                ['越來越多學校正在採用電子評估。', 'More schools ______ (adopt) electronic assessment these days.', ['are adopting'], 'Changing trend -> are + ving。'],
                ['我今個星期正在準備面試。', 'I ______ (prepare) for an interview this week.', ['am preparing'], 'Temporary action in an unfinished period。'],
                ['她今晚要和班主任會面。', 'She ______ (meet) her class teacher tonight.', ['is meeting'], 'Fixed near-future arrangement。'],
                ['他們目前不是在爭論，而是在尋找解決方法。', 'They ______ (not argue) at the moment; they are looking for a solution.', ['are not arguing', "aren't arguing"], 'Present continuous negative。'],
                ['城市人口近來正迅速增加。', 'The city population ______ (increase) rapidly these days.', ['is increasing'], 'Developing situation。'],
                ['我們現在正在重新設計問卷。', 'We ______ (redesign) the questionnaire now.', ['are redesigning'], 'Action happening around now。'],
                ['老師現在正在示範如何組織段落。', 'The teacher ______ (demonstrate) how to organise a paragraph right now.', ['is demonstrating'], 'Current classroom action。'],
                ['我現在正在嘗試登入學校平台。', 'I ______ (try) to log in to the school platform right now.', ['am trying'], 'Current attempt。'],
                ['學生們現在正在收集問卷回覆。', 'The students ______ (collect) questionnaire responses now.', ['are collecting'], 'Plural subject + are + ving。']
            ]
        },
        {
            tense: 'present_continuous',
            voice: 'passive',
            items: [
                ['新的閱讀計劃今個學期正在推行。', 'A new reading scheme ______ (introduce) this term.', ['is being introduced'], 'Passive: is being + p.p.。'],
                ['所有座位現在正在重新安排。', 'All seats ______ (rearrange) for the seminar now.', ['are being rearranged'], 'Plural passive: are being + p.p.。'],
                ['這個個案目前正在調查。', 'This case ______ (investigate) at present.', ['is being investigated'], 'At present -> is being + p.p.。'],
                ['課室的投影機正在維修。', 'The classroom projector ______ (repair) now.', ['is being repaired'], 'Now + passive continuous。'],
                ['多份報告現在正在仔細審閱。', 'Several reports ______ (review) carefully now.', ['are being reviewed'], 'Passive ongoing review。'],
                ['校園入口現在正在擴建。', 'The school entrance ______ (extend) near the main road right now.', ['is being extended'], 'Ongoing construction passive。'],
                ['新規則目前正在向學生解釋。', 'The new rules ______ (explain) to students at present.', ['are being explained'], 'Plural subject + are being explained。'],
                ['這些樣本現在正在實驗室分析。', 'These samples ______ (analyse) in the laboratory now.', ['are being analysed', 'are being analyzed'], 'Passive: are being + p.p.。'],
                ['候選人現在正在逐一面試。', 'The candidates ______ (interview) one by one now.', ['are being interviewed'], 'Candidates receive the action。'],
                ['舊電腦正在更換。', 'The old computers ______ (replace) this afternoon.', ['are being replaced'], 'Ongoing replacement。']
            ]
        },
        {
            tense: 'present_perfect',
            voice: 'active',
            items: [
                ['我已經把檔案上載到雲端。', 'I ______ already ______ (upload) the file to the cloud.', ['have uploaded'], 'Already + present perfect。'],
                ['她自去年起一直是辯論隊成員。', 'She ______ (be) in the debating team since last year.', ['has been'], 'Since + starting point -> present perfect。'],
                ['我們還未收到確認電郵。', 'We ______ (not receive) the confirmation email yet.', ['have not received', "haven't received"], 'Yet + negative present perfect。'],
                ['你曾經寫過正式投訴信嗎？', '______ you ever ______ (write) a formal complaint letter?', ['have written'], 'Ever question -> Have + subject + p.p.。'],
                ['老師剛剛更正了最後一題。', 'The teacher ______ just ______ (correct) the last question.', ['has corrected'], 'Just + has + p.p.。'],
                ['這個問題已經出現很多次。', 'This problem ______ (occur) many times.', ['has occurred'], 'Repeated event up to now。'],
                ['我們最近完成了小組報告。', 'We ______ (complete) the group report recently.', ['have completed'], 'Recently -> present perfect。'],
                ['他剛剛遺失了證件，所以不能入場。', 'He ______ just ______ (lose) his pass, so he cannot enter.', ['has lost'], 'Past event with present result。'],
                ['很多學生從未使用過這個格式。', 'Many students ______ never ______ (use) this format before.', ['have used'], 'Never + present perfect。'],
                ['到目前為止，他只提交了一份草稿。', 'So far, he ______ (submit) only one draft.', ['has submitted'], 'So far -> present perfect。']
            ]
        },
        {
            tense: 'present_perfect',
            voice: 'passive',
            items: [
                ['所有文件已經簽署。', 'All documents ______ already ______ (sign).', ['have been signed'], 'Plural passive present perfect。'],
                ['這個申請還未批准。', 'This application ______ (not approve) yet.', ['has not been approved', "hasn't been approved"], 'Yet + has not been + p.p.。'],
                ['三個錯誤已經被發現。', 'Three errors ______ already ______ (discover) in the report.', ['have been discovered'], 'Plural subject + have been + p.p.。'],
                ['這間房自星期一起已被預留。', 'This room ______ (reserve) since Monday.', ['has been reserved'], 'Since + has been + p.p.。'],
                ['這些規則已向家長清楚解釋。', 'These rules ______ already ______ (explain) clearly to parents.', ['have been explained'], 'Passive present perfect。'],
                ['新系統剛剛安裝完成。', 'The new system ______ just ______ (install).', ['has been installed'], 'Just + has been + p.p.。'],
                ['幾名學生已被選為代表。', 'Several students ______ already ______ (choose) as representatives.', ['have been chosen'], 'Irregular p.p. chosen。'],
                ['這份資料從未公開。', 'This information ______ never ______ (release).', ['has been released'], 'Never + has been + p.p.。'],
                ['所有座位已被訂滿。', 'All seats ______ (book) already.', ['have been booked'], 'Plural subject + have been booked。'],
                ['結果已由兩位老師覆核。', 'The results ______ already ______ (check) by two teachers.', ['have been checked'], 'Passive present perfect with plural results。']
            ]
        },
        {
            tense: 'present_perfect_continuous',
            voice: 'active',
            items: [
                ['他由早上起一直修改文章。', 'He ______ (revise) his essay since this morning.', ['has been revising'], 'Since + present perfect continuous。'],
                ['我們已經等待校車二十分鐘。', 'We ______ (wait) for the school bus for twenty minutes.', ['have been waiting'], 'For + duration。'],
                ['她最近一直練習朗讀。', 'She ______ (practise) reading aloud recently.', ['has been practising', 'has been practicing'], 'Recent repeated activity。'],
                ['學生們整個下午都在收集資料。', 'The students ______ (collect) information all afternoon.', ['have been collecting'], 'All afternoon + ongoing activity。'],
                ['我一直嘗試修正登入問題到現在。', 'I ______ (try) to fix the login problem until now.', ['have been trying'], 'Continuing attempt up to now。'],
                ['雨已經下了三小時。', 'It ______ (rain) for three hours.', ['has been raining'], 'Weather continuing until now。'],
                ['這家公司近年一直投資教育科技。', 'The company ______ (invest) in education technology in recent years.', ['has been investing'], 'Ongoing trend。'],
                ['我們最近一直討論是否延長截止日期。', 'We ______ (discuss) whether to extend the deadline recently.', ['have been discussing'], 'Discussion continuing up to now。'],
                ['他看起來很累，因為他一直在溫習。', 'He looks tired because he ______ (study) all night.', ['has been studying'], 'Present result + ongoing past activity。'],
                ['老師們這星期一直準備考試材料。', 'The teachers ______ (prepare) examination materials this week.', ['have been preparing'], 'Unfinished period this week。']
            ]
        },
        {
            tense: 'present_perfect_continuous',
            voice: 'passive',
            items: [
                ['這條路近幾天一直被清理。', 'This road ______ (clear) for the past few days.', ['has been being cleared'], 'Passive present perfect continuous。'],
                ['多份申請自上週起一直被處理。', 'Many applications ______ (process) since last week.', ['have been being processed'], 'Plural passive structure。'],
                ['這個問題一直被委員會研究。', 'This issue ______ (study) by the committee for months.', ['has been being studied'], 'has been being + p.p.。'],
                ['舊校舍整個學期都在翻新。', 'The old school building ______ (renovate) throughout the term.', ['has been being renovated'], 'Ongoing passive duration。'],
                ['這些數據最近一直被核對。', 'These figures ______ (check) carefully recently.', ['have been being checked'], 'Plural + have been being + p.p.。'],
                ['新政策多年來一直受到質疑。', 'The new policy ______ (question) for years.', ['has been being questioned'], 'Duration + passive continuous perfect。'],
                ['樣本整個上午都在分析。', 'The samples ______ (analyse) all morning.', ['have been being analysed', 'have been being analyzed'], 'All morning + passive。'],
                ['入口處一直在重新設計。', 'The entrance ______ (redesign) for several weeks.', ['has been being redesigned'], 'Singular passive structure。'],
                ['這些課室自暑假起一直粉刷。', 'These classrooms ______ (paint) since the summer holiday.', ['have been being painted'], 'Plural passive + since。'],
                ['這個方案最近一直被不同小組測試。', 'This plan ______ (test) by different groups recently.', ['has been being tested'], 'Passive present perfect continuous。']
            ]
        },
        {
            tense: 'simple_past',
            voice: 'active',
            items: [
                ['他昨晚完成了整份報告。', 'He ______ (finish) the whole report last night.', ['finished'], 'Last night -> simple past。'],
                ['我們上星期沒有提交申請。', 'We ______ (not submit) the application last week.', ['did not submit', "didn't submit"], 'Past negative: did not + base verb。'],
                ['她在比賽中打破了校紀錄。', 'She ______ (break) the school record in the competition.', ['broke'], 'Irregular past -> broke。'],
                ['他們兩年前創立了這個學會。', 'They ______ (start) this society two years ago.', ['started'], 'Ago -> simple past。'],
                ['我剛才聽到奇怪的聲音。', 'I ______ (hear) a strange noise just now.', ['heard'], 'Just now -> simple past。'],
                ['老師昨天在課堂後收回問卷。', 'The teacher ______ (collect) the questionnaires after the lesson yesterday.', ['collected'], 'Completed past action。'],
                ['電腦突然停止回應。', 'The computer suddenly ______ (stop) responding.', ['stopped'], 'Stop -> stopped。'],
                ['那名學生昨天寫了一個清楚的結論。', 'The student ______ (write) a clear conclusion yesterday.', ['wrote'], 'Irregular past -> wrote。'],
                ['他們上次沒有在答案中解釋原因。', 'They ______ (not explain) the reason in the answer last time.', ['did not explain', "didn't explain"], 'Did not + base verb。'],
                ['我昨天忘記帶學生證。', 'I ______ (forget) to bring my student card yesterday.', ['forgot'], 'Yesterday -> simple past。']
            ]
        },
        {
            tense: 'simple_past',
            voice: 'passive',
            items: [
                ['所有作業昨天收齊。', 'All assignments ______ (collect) yesterday.', ['were collected'], 'Plural passive past。'],
                ['這座大樓在二零零五年建成。', 'This building ______ (build) in 2005.', ['was built'], 'Was + p.p.。'],
                ['錯誤在會議前發現。', 'The mistake ______ (find) before the meeting.', ['was found'], 'Irregular p.p. found。'],
                ['幾名學生上星期被邀請參加面試。', 'Several students ______ (invite) to attend the interview last week.', ['were invited'], 'Plural + were invited。'],
                ['比賽因惡劣天氣取消。', 'The match ______ (cancel) because of bad weather.', ['was cancelled', 'was canceled'], 'Singular passive past。'],
                ['所有座位在十分鐘內售出。', 'All seats ______ (sell) within ten minutes.', ['were sold'], 'Irregular p.p. sold。'],
                ['窗戶昨晚被打破。', 'The window ______ (break) last night.', ['was broken'], 'Was + broken。'],
                ['這封電郵錯誤發給全級。', 'The email ______ (send) to the whole form by mistake.', ['was sent'], 'Irregular p.p. sent。'],
                ['重要決定在會議上作出。', 'Important decisions ______ (make) at the meeting.', ['were made'], 'Plural passive with made。'],
                ['結果在早會公布。', 'The results ______ (announce) during the morning assembly.', ['were announced'], 'Plural passive past。']
            ]
        },
        {
            tense: 'past_continuous',
            voice: 'active',
            items: [
                ['警鐘響起時，我正在做實驗。', 'I ______ (do) the experiment when the alarm rang.', ['was doing'], 'Interrupted past action。'],
                ['老師進來時，學生們正在討論答案。', 'The students ______ (discuss) the answer when the teacher entered.', ['were discussing'], 'Background past action。'],
                ['昨晚九時她正在寫報告。', 'She ______ (write) the report at nine o’clock last night.', ['was writing'], 'Exact past time。'],
                ['我們到達時，他們正在排隊。', 'They ______ (queue) when we arrived.', ['were queuing', 'were queueing'], 'Ongoing past action。'],
                ['我正在閱讀時，燈突然熄滅。', 'While I ______ (read), the lights suddenly went out.', ['was reading'], 'While + past continuous。'],
                ['他沒有聽，因為他正在看手機。', 'He ______ (not listen) because he was looking at his phone.', ['was not listening', "wasn't listening"], 'Past continuous negative。'],
                ['我們正在準備簡報時，網絡中斷。', 'We ______ (prepare) the presentation when the network failed.', ['were preparing'], 'Action interrupted by another past event。'],
                ['雨一直下，所以活動延期。', 'It ______ (rain), so the activity was postponed.', ['was raining'], 'Background weather。'],
                ['她看到我時正在找座位。', 'She ______ (look) for a seat when she saw me.', ['was looking'], 'Ongoing past action。'],
                ['兩隊在暴雨中仍然比賽。', 'The two teams ______ (play) in the heavy rain.', ['were playing'], 'Past scene description。']
            ]
        },
        {
            tense: 'past_continuous',
            voice: 'passive',
            items: [
                ['我到達時，考卷正在派發。', 'The papers ______ (hand) out when I arrived.', ['were being handed'], 'Plural passive continuous past。'],
                ['校長進來時，問題正在討論。', 'The issue ______ (discuss) when the principal came in.', ['was being discussed'], 'Was being + p.p.。'],
                ['昨晚八時電腦正在維修。', 'The computers ______ (repair) at eight o’clock last night.', ['were being repaired'], 'Exact past time + passive continuous。'],
                ['我經過時，牆正在粉刷。', 'The wall ______ (paint) when I walked past.', ['was being painted'], 'Ongoing passive past。'],
                ['會議開始時，資料正在列印。', 'The documents ______ (print) when the meeting began.', ['were being printed'], 'Plural + were being + p.p.。'],
                ['訪客到達時，場地正在佈置。', 'The venue ______ (decorate) when the guests arrived.', ['was being decorated'], 'Passive background action。'],
                ['事故發生時，道路正在清理。', 'The road ______ (clear) when the accident happened.', ['was being cleared'], 'Was being + p.p.。'],
                ['火警鐘響起時，樣本正在分析。', 'The samples ______ (analyse) when the fire alarm sounded.', ['were being analysed', 'were being analyzed'], 'Plural passive continuous。'],
                ['我打電話時，結果正在核對。', 'The results ______ (check) when I called.', ['were being checked'], 'Ongoing passive past。'],
                ['他進入房間時，候選人正在面試。', 'The candidates ______ (interview) when he entered the room.', ['were being interviewed'], 'Candidates receive action。']
            ]
        },
        {
            tense: 'past_perfect',
            voice: 'active',
            items: [
                ['我到達前，講座已經開始。', 'The talk ______ (begin) before I arrived.', ['had begun'], 'Earlier past before another past action。'],
                ['她交卷前已經檢查答案。', 'She ______ (check) her answers before she handed in the paper.', ['had checked'], 'Past perfect before simple past。'],
                ['他們取消活動前已經賣出所有門票。', 'They ______ (sell) all the tickets before they cancelled the event.', ['had sold'], 'Had + p.p.。'],
                ['我以前從未見過這種題型。', 'I ______ never ______ (see) this question type before.', ['had seen'], 'Never before a past reference point。'],
                ['老師到達時，學生已經完成實驗。', 'The students ______ (finish) the experiment when the teacher arrived.', ['had finished'], 'Earlier completion。'],
                ['她意識到自己之前忘記了密碼。', 'She realised that she ______ (forget) the password earlier.', ['had forgotten'], 'Past perfect in reported realisation。'],
                ['我們到車站時，巴士已經離開。', 'The bus ______ (leave) when we reached the station.', ['had left'], 'Earlier past event。'],
                ['他解釋說他之前已經提交表格。', 'He explained that he ______ already ______ (submit) the form.', ['had submitted'], 'Reported past + earlier action。'],
                ['比賽開始前，天氣已經轉壞。', 'The weather ______ (become) worse before the match started.', ['had become'], 'Had become before past event。'],
                ['我發現自己之前把檔案刪除了。', 'I found that I ______ (delete) the file earlier.', ['had deleted'], 'Earlier past cause。']
            ]
        },
        {
            tense: 'past_perfect',
            voice: 'passive',
            items: [
                ['我到達時，門已經鎖上。', 'The door ______ (lock) when I arrived.', ['had been locked'], 'Passive past perfect。'],
                ['會議開始前，議程已經發出。', 'The agenda ______ (send) before the meeting began.', ['had been sent'], 'Earlier passive action。'],
                ['學生入場前，座位已經安排好。', 'The seats ______ (arrange) before the students entered.', ['had been arranged'], 'Plural + had been + p.p.。'],
                ['錯誤被發現時，報告已經提交。', 'The report ______ (submit) when the error was discovered.', ['had been submitted'], 'Earlier passive completion。'],
                ['我到達前，所有門票已售罄。', 'All tickets ______ (sell) before I arrived.', ['had been sold'], 'Had been sold。'],
                ['校長發言前，結果已經公布。', 'The results ______ (announce) before the principal spoke.', ['had been announced'], 'Plural passive past perfect。'],
                ['工程展開前，計劃已經批准。', 'The plan ______ (approve) before the project started.', ['had been approved'], 'Earlier passive approval。'],
                ['我打開檔案時，內容已經更改。', 'The content ______ (change) when I opened the file.', ['had been changed'], 'Had been changed。'],
                ['他到場時，受傷學生已送院。', 'The injured student ______ (take) to hospital when he arrived.', ['had been taken'], 'Irregular p.p. taken。'],
                ['調查完成前，證據已被銷毀。', 'The evidence ______ (destroy) before the investigation ended.', ['had been destroyed'], 'Earlier passive action。']
            ]
        },
        {
            tense: 'past_perfect_continuous',
            voice: 'active',
            items: [
                ['她失聲前已經練習演講數日。', 'She ______ (practise) the speech for days before she lost her voice.', ['had been practising', 'had been practicing'], 'Duration before a past event。'],
                ['我到達時，他們已經等了半小時。', 'They ______ (wait) for half an hour when I arrived.', ['had been waiting'], 'Past perfect continuous duration。'],
                ['他看起來很累，因為他一直在溫習。', 'He looked tired because he ______ (study) all night.', ['had been studying'], 'Past result of earlier ongoing action。'],
                ['下雨前，我們已經踢足球很久。', 'We ______ (play) football for a long time before it started to rain.', ['had been playing'], 'Ongoing activity before another past action。'],
                ['電腦當機前，她一直在編輯影片。', 'She ______ (edit) the video before the computer crashed.', ['had been editing'], 'Earlier ongoing action。'],
                ['老師進來前，學生們一直在聊天。', 'The students ______ (chat) before the teacher came in.', ['had been chatting'], 'Repeated ongoing action before past point。'],
                ['他贏比賽前已訓練多年。', 'He ______ (train) for years before he won the competition.', ['had been training'], 'Duration leading to past result。'],
                ['我找到錯誤前一直檢查數據。', 'I ______ (check) the data before I found the mistake.', ['had been checking'], 'Past perfect continuous。'],
                ['她搬家前一直住在那區。', 'She ______ (live) in that district before she moved away.', ['had been living'], 'Ongoing state before past change。'],
                ['他們被打斷前一直討論預算。', 'They ______ (discuss) the budget before they were interrupted.', ['had been discussing'], 'Ongoing discussion before interruption。']
            ]
        },
        {
            tense: 'past_perfect_continuous',
            voice: 'passive',
            items: [
                ['工程停止前，橋樑已被檢查多日。', 'The bridge ______ (inspect) for days before the work stopped.', ['had been being inspected'], 'Passive past perfect continuous。'],
                ['會議前，建議已被審議數月。', 'The proposal ______ (consider) for months before the meeting.', ['had been being considered'], 'Had been being + p.p.。'],
                ['系統推出前，程式已被測試多星期。', 'The program ______ (test) for weeks before the system was launched.', ['had been being tested'], 'Earlier ongoing passive testing。'],
                ['樣本被丟棄前已被觀察數天。', 'The samples ______ (observe) for days before they were discarded.', ['had been being observed'], 'Passive duration before past action。'],
                ['政策通過前一直被批評。', 'The policy ______ (criticise) before it was passed.', ['had been being criticised', 'had been being criticized'], 'Passive ongoing action before past point。'],
                ['道路重開前已被清理整晚。', 'The road ______ (clear) all night before it reopened.', ['had been being cleared'], 'All night + had been being。'],
                ['舊樓拆卸前已被研究多年。', 'The old building ______ (study) for years before it was demolished.', ['had been being studied'], 'Passive duration before demolition。'],
                ['資料公布前已被核對很久。', 'The data ______ (check) for a long time before it was released.', ['had been being checked'], 'Ongoing passive checking。'],
                ['入口開放前已被粉刷數小時。', 'The entrance ______ (paint) for hours before it opened.', ['had been being painted'], 'Had been being painted。'],
                ['報告提交前一直被修改。', 'The report ______ (revise) before it was submitted.', ['had been being revised'], 'Passive revision before submission。']
            ]
        },
        {
            tense: 'simple_future',
            voice: 'active',
            items: [
                ['如果天氣好，我們明天會拍攝影片。', 'If the weather is fine, we ______ (film) the video tomorrow.', ['will film'], 'Future result with if-clause。'],
                ['我預計她稍後會回覆你的電郵。', 'I expect she ______ (reply) to your email later.', ['will reply'], 'Later -> simple future。'],
                ['我保證不會忘記帶准考證。', 'I promise I ______ (not forget) to bring my admission form.', ['will not forget', "won't forget"], 'Future negative。'],
                ['我預計他們下星期會公布結果。', 'I expect they ______ (announce) the results next week.', ['will announce'], 'Next week -> will + base verb。'],
                ['我認為這個決定會影響所有學生。', 'I think this decision ______ (affect) all students.', ['will affect'], 'Future prediction。'],
                ['我保證我們今晚會完成草稿。', 'I promise we ______ (finish) the draft tonight.', ['will finish'], 'Future intention/prediction。'],
                ['我相信老師會在課後解釋答案。', 'I believe the teacher ______ (explain) the answer after class.', ['will explain'], 'Will + base verb。'],
                ['我相信他會通過面試。', 'I believe he ______ (pass) the interview.', ['will pass'], 'Prediction after believe。'],
                ['如果你需要幫忙，我會通知技術員。', 'If you need help, I ______ (inform) the technician.', ['will inform'], 'First conditional。'],
                ['我相信他們不會接受遲交作業。', 'I believe they ______ (not accept) late assignments.', ['will not accept', "won't accept"], 'Will not + base verb。']
            ]
        },
        {
            tense: 'simple_future',
            voice: 'passive',
            items: [
                ['我預計結果將於明天公布。', 'I expect the results ______ (announce) tomorrow.', ['will be announced'], 'Future passive: will be + p.p.。'],
                ['我預計所有申請將由委員會審閱。', 'I expect all applications ______ (review) by the committee.', ['will be reviewed'], 'Plural future passive。'],
                ['我相信遲交作業將不會接受。', 'I believe late assignments ______ (not accept).', ['will not be accepted', "won't be accepted"], 'Future passive negative。'],
                ['我預計新規則將於下星期實施。', 'I expect the new rules ______ (introduce) next week.', ['will be introduced'], 'Will be + p.p.。'],
                ['我預計座位將按報名次序分配。', 'I expect seats ______ (allocate) according to registration order.', ['will be allocated'], 'Future passive。'],
                ['我預計每位參加者將獲發證書。', 'I expect each participant ______ (give) a certificate.', ['will be given'], 'Each + will be + p.p.。'],
                ['我相信這個問題將在會議中討論。', 'I believe this issue ______ (discuss) at the meeting.', ['will be discussed'], 'Future passive。'],
                ['我預計入場券將於門口檢查。', 'I expect tickets ______ (check) at the entrance.', ['will be checked'], 'Plural future passive。'],
                ['我預計獲選學生將會通知。', 'I expect selected students ______ (notify) by email.', ['will be notified'], 'Future passive with by email。'],
                ['我預計舊電腦將於暑假更換。', 'I expect the old computers ______ (replace) during the summer holiday.', ['will be replaced'], 'Will be replaced。']
            ]
        },
        {
            tense: 'future_continuous',
            voice: 'active',
            items: [
                ['明天下午三時，我會正在考試。', 'At three o’clock tomorrow, I ______ (sit) for the exam.', ['will be sitting'], 'Specific future time -> future continuous。'],
                ['你到達時，我們會正在排練。', 'When you arrive, we ______ (rehearse).', ['will be rehearsing'], 'Action in progress at future time。'],
                ['她今晚九時會正在整理筆記。', 'She ______ (organise) her notes at nine tonight.', ['will be organising', 'will be organizing'], 'Future continuous。'],
                ['下星期這個時候，他們會正在參加訓練營。', 'This time next week, they ______ (attend) a training camp.', ['will be attending'], 'This time next week。'],
                ['明早九時，我不會正在使用這部電腦。', 'At nine tomorrow morning, I ______ (not use) this computer.', ['will not be using', "won't be using"], 'Future continuous negative。'],
                ['我們到時會正在討論預算。', 'We ______ (discuss) the budget then.', ['will be discussing'], 'Ongoing future action。'],
                ['明晚七時，校隊會正在比賽。', 'At seven tomorrow evening, the school team ______ (compete).', ['will be competing'], 'Future continuous arrangement。'],
                ['你打電話時，她可能會正在面試。', 'When you call, she ______ (attend) an interview.', ['will be attending'], 'Future action in progress。'],
                ['明天下午三時，學生們會正在進行實驗。', 'At three tomorrow afternoon, the students ______ (do) the experiment.', ['will be doing'], 'Future continuous。'],
                ['今晚九時，我會正在修改最後一段。', 'At nine tonight, I ______ (revise) the final paragraph.', ['will be revising'], 'Future action in progress。']
            ]
        },
        {
            tense: 'future_continuous',
            voice: 'passive',
            items: [
                ['明天下午三時，試卷會正在印刷。', 'At three tomorrow afternoon, the papers ______ (print).', ['will be being printed'], 'Future continuous passive。'],
                ['你到達時，座位會正在安排。', 'Seats ______ (arrange) when you arrive.', ['will be being arranged'], 'Will be being + p.p.。'],
                ['明早九時，道路會正在清理。', 'The road ______ (clear) at nine tomorrow morning.', ['will be being cleared'], 'Ongoing future passive。'],
                ['下星期這個時間，電腦會正在更新。', 'This time next week, the computers ______ (update).', ['will be being updated'], 'Plural future continuous passive。'],
                ['會議期間，結果會正在核對。', 'During the meeting, the results ______ (check).', ['will be being checked'], 'Passive action in progress in future。'],
                ['活動開始前一小時的五時正，場地會正在佈置。', 'At five o’clock, one hour before the event starts, the venue ______ (decorate).', ['will be being decorated'], 'Future continuous passive。'],
                ['明天下午整段時間，申請會正在審閱。', 'Throughout tomorrow afternoon, the applications ______ (review).', ['will be being reviewed'], 'Plural passive。'],
                ['你參觀時，舊課室會正在翻新。', 'The old classrooms ______ (renovate) when you visit.', ['will be being renovated'], 'Future passive in progress。'],
                ['明早十時，樣本會正在分析。', 'At ten tomorrow morning, the samples ______ (analyse).', ['will be being analysed', 'will be being analyzed'], 'Will be being + p.p.。'],
                ['下次會議時，建議會正在討論。', 'At the next meeting, the proposal ______ (discuss).', ['will be being discussed'], 'Future continuous passive。']
            ]
        },
        {
            tense: 'future_perfect',
            voice: 'active',
            items: [
                ['到星期五，我會完成整份報告。', 'By Friday, I ______ (finish) the whole report.', ['will have finished'], 'By + future time -> future perfect。'],
                ['你到達前，她會已經離開。', 'She ______ (leave) before you arrive.', ['will have left'], 'Earlier future completion。'],
                ['到月底，我們會提交所有文件。', 'By the end of the month, we ______ (submit) all the documents.', ['will have submitted'], 'Future perfect。'],
                ['到明年，他會學英文十年。', 'By next year, he ______ (study) English for ten years.', ['will have studied'], 'Duration up to future point。'],
                ['會議開始前，他們會看完資料。', 'They ______ (read) the materials before the meeting starts.', ['will have read'], 'Future completion before another future event。'],
                ['到你回來時，我會修好錯誤。', 'By the time you return, I ______ (fix) the error.', ['will have fixed'], 'By the time + present clause。'],
                ['到中午，老師會批改完所有作文。', 'By noon, the teacher ______ (mark) all the essays.', ['will have marked'], 'Future perfect completion。'],
                ['到活動開始時，學生會準備好簡報。', 'By the time the activity starts, the students ______ (prepare) the presentation.', ['will have prepared'], 'Future perfect。'],
                ['到下週，我們會完成三次練習。', 'By next week, we ______ (complete) three practices.', ['will have completed'], 'Future perfect for countable completed actions。'],
                ['她到達前，我會已經下載檔案。', 'I ______ (download) the file before she arrives.', ['will have downloaded'], 'Action completed before a future point。']
            ]
        },
        {
            tense: 'future_perfect',
            voice: 'passive',
            items: [
                ['到星期五，所有文件會已簽署。', 'By Friday, all documents ______ (sign).', ['will have been signed'], 'Future perfect passive。'],
                ['你到達前，房間會已經準備好。', 'The room ______ (prepare) before you arrive.', ['will have been prepared'], 'Will have been + p.p.。'],
                ['到月底，申請會完成審批。', 'The applications ______ (approve) by the end of the month.', ['will have been approved'], 'Plural future perfect passive。'],
                ['會議開始前，議程會發送給所有人。', 'The agenda ______ (send) to everyone before the meeting starts.', ['will have been sent'], 'Future perfect passive。'],
                ['到明天，所有座位會被預訂。', 'All seats ______ (book) by tomorrow.', ['will have been booked'], 'By tomorrow -> will have been booked。'],
                ['到活動開始時，場地會佈置完成。', 'The venue ______ (decorate) by the time the event starts.', ['will have been decorated'], 'Future perfect passive。'],
                ['到新學期，舊電腦會完成更換。', 'The old computers ______ (replace) by the new term.', ['will have been replaced'], 'Plural future perfect passive。'],
                ['到調查結束時，證據會被核對。', 'The evidence ______ (check) by the end of the investigation.', ['will have been checked'], 'Will have been + p.p.。'],
                ['到下星期，結果會向學生公布。', 'The results ______ (announce) to students by next week.', ['will have been announced'], 'Plural future perfect passive。'],
                ['到截止日期，所有問卷會被收集。', 'All questionnaires ______ (collect) by the deadline.', ['will have been collected'], 'By deadline -> future perfect passive。']
            ]
        },
        {
            tense: 'future_perfect_continuous',
            voice: 'active',
            items: [
                ['到六月，我會學法文滿兩年。', 'By June, I ______ (learn) French for two years.', ['will have been learning'], 'Duration up to future point。'],
                ['到他退休時，他會任教三十年。', 'By the time he retires, he ______ (teach) for thirty years.', ['will have been teaching'], 'Future perfect continuous。'],
                ['到明早，雨會下了兩天。', 'By tomorrow morning, it ______ (rain) for two days.', ['will have been raining'], 'Weather duration up to future point。'],
                ['到比賽開始，他們會訓練三個月。', 'By the time the competition starts, they ______ (train) for three months.', ['will have been training'], 'Training continues up to future point。'],
                ['到下週，我們會研究這題目一個月。', 'By next week, we ______ (research) this topic for a month.', ['will have been researching'], 'Future perfect continuous。'],
                ['到暑假，他會做這項目半年。', 'By the summer holiday, he ______ (work) on this project for half a year.', ['will have been working'], 'Duration before future time。'],
                ['到她到達時，我們會等了兩小時。', 'By the time she arrives, we ______ (wait) for two hours.', ['will have been waiting'], 'Waiting up to future arrival。'],
                ['到報告完成時，小組會收集數據數星期。', 'By the time the report is completed, the group ______ (collect) data for weeks.', ['will have been collecting'], 'Future perfect continuous。'],
                ['到年底，公司會擴展海外市場三年。', 'By the end of the year, the company ______ (expand) overseas for three years.', ['will have been expanding'], 'Ongoing trend up to future point。'],
                ['到考試日，他會練習作文數月。', 'By the examination day, he ______ (practise) writing essays for months.', ['will have been practising', 'will have been practicing'], 'Preparation up to future point。']
            ]
        },
        {
            tense: 'future_perfect_continuous',
            voice: 'passive',
            items: [
                ['到下月，這條路會被維修半年。', 'By next month, this road ______ (repair) for half a year.', ['will have been being repaired'], 'Future perfect continuous passive。'],
                ['到調查結束時，資料會被分析數星期。', 'By the end of the investigation, the data ______ (analyse) for weeks.', ['will have been being analysed', 'will have been being analyzed'], 'Will have been being + p.p.。'],
                ['到年底，舊校舍會被翻新一整年。', 'By the end of the year, the old school building ______ (renovate) for a whole year.', ['will have been being renovated'], 'Future passive duration。'],
                ['系統推出時，程式會被測試三個月。', 'By the time the system is launched, the program ______ (test) for three months.', ['will have been being tested'], 'Future perfect continuous passive。'],
                ['會議結束時，問題會被討論兩小時。', 'By the time the meeting ends, the issue ______ (discuss) for two hours.', ['will have been being discussed'], 'Duration up to future point。'],
                ['到明天，申請會被處理一整星期。', 'By tomorrow, these applications ______ (process) for a full week.', ['will have been being processed'], 'Plural passive future perfect continuous。'],
                ['工程完成時，橋樑會被檢查多日。', 'By the time the project is completed, the bridge ______ (inspect) for days.', ['will have been being inspected'], 'Future passive duration。'],
                ['新政策推出時，建議會被審議數月。', 'By the time the new policy is introduced, the proposal ______ (consider) for months.', ['will have been being considered'], 'Will have been being considered。'],
                ['到下星期，樣本會被觀察十天。', 'By next week, these samples ______ (observe) for ten days.', ['will have been being observed'], 'Plural passive。'],
                ['活動開始時，場地會被佈置整個上午。', 'By the time the event starts, the venue ______ (decorate) all morning.', ['will have been being decorated'], 'Future perfect continuous passive。']
            ]
        }
    ];

    const mixedQuestions = [
        {
            tenses: ['simple_present', 'simple_past'],
            voices: ['active'],
            chinese: '我現在不喝汽水，但年少時喝很多。',
            question: 'I ______ (not drink) soft drinks now, but I ______ (drink) a lot when I was young.',
            answerSlots: ['do not drink', 'drank'],
            answers: ['do not drink drank', "don't drink drank"],
            exp: 'Mixed: now -> simple present negative; when I was young -> simple past。'
        },
        {
            tenses: ['simple_present', 'present_continuous'],
            voices: ['active'],
            chinese: '她通常步行上學，但今天正在乘巴士。',
            question: 'She usually ______ (walk) to school, but today she ______ (take) the bus.',
            answerSlots: ['walks', 'is taking'],
            exp: 'Mixed: usually -> simple present; today -> present continuous。'
        },
        {
            tenses: ['simple_past', 'past_continuous'],
            voices: ['active'],
            chinese: '電話響起時，我正在寫作文。',
            question: 'I ______ (write) my essay when the phone ______ (ring).',
            answerSlots: ['was writing', 'rang'],
            exp: 'Mixed: ongoing past action + interrupting simple past。'
        },
        {
            tenses: ['past_perfect', 'simple_past'],
            voices: ['active'],
            chinese: '老師到達前，學生已經完成實驗。',
            question: 'The students ______ (finish) the experiment before the teacher ______ (arrive).',
            answerSlots: ['had finished', 'arrived'],
            exp: 'Mixed: earlier past -> past perfect; later past -> simple past。'
        },
        {
            tenses: ['present_perfect', 'simple_past'],
            voices: ['active'],
            chinese: '自從他去年搬到這區後，他已結識很多朋友。',
            question: 'He ______ (make) many friends since he ______ (move) to this district last year.',
            answerSlots: ['has made', 'moved'],
            exp: 'Mixed: since-clause simple past; main clause present perfect。'
        },
        {
            tenses: ['present_perfect', 'simple_present'],
            voices: ['active'],
            chinese: '她已經遺失學生證，所以現在不能進入圖書館。',
            question: 'She ______ (lose) her student card, so she ______ (not enter) the library now.',
            answerSlots: ['has lost', 'cannot enter'],
            answers: ['has lost cannot enter', "has lost can't enter"],
            exp: 'Mixed: present result -> present perfect; current ability -> simple present/modal。'
        },
        {
            tenses: ['present_perfect_continuous', 'simple_past'],
            voices: ['active'],
            chinese: '自從他加入校隊後，他一直更努力訓練。',
            question: 'He ______ (train) harder since he ______ (join) the school team.',
            answerSlots: ['has been training', 'joined'],
            exp: 'Mixed: continuing action -> present perfect continuous; since-clause -> simple past。'
        },
        {
            tenses: ['simple_future', 'simple_present'],
            voices: ['active'],
            chinese: '如果明天下雨，我們會延期比賽。',
            question: 'If it ______ (rain) tomorrow, we ______ (postpone) the match.',
            answerSlots: ['rains', 'will postpone'],
            exp: 'Mixed: first conditional uses simple present + will。'
        },
        {
            tenses: ['future_continuous', 'simple_future'],
            voices: ['active'],
            chinese: '你晚上打電話時，我會正在溫習，所以我稍後會回覆。',
            question: 'When you call tonight, I ______ (revise), so I ______ (reply) later.',
            answerSlots: ['will be revising', 'will reply'],
            exp: 'Mixed: future action in progress + later future action。'
        },
        {
            tenses: ['future_perfect', 'simple_present'],
            voices: ['active'],
            chinese: '你回來時，我會已經完成報告。',
            question: 'By the time you ______ (return), I ______ (finish) the report.',
            answerSlots: ['return', 'will have finished'],
            exp: 'Mixed: time clause uses simple present; main clause future perfect。'
        },
        {
            tenses: ['past_perfect_continuous', 'simple_past'],
            voices: ['active'],
            chinese: '他遲到時，我們已經等了半小時。',
            question: 'We ______ (wait) for half an hour when he ______ (arrive) late.',
            answerSlots: ['had been waiting', 'arrived'],
            exp: 'Mixed: duration before past event -> past perfect continuous; event -> simple past。'
        },
        {
            tenses: ['present_continuous', 'simple_future'],
            voices: ['active'],
            chinese: '我按安排今晚要見老師，之後保證會告訴你結果。',
            question: 'As arranged, I ______ (meet) the teacher tonight, and I promise I ______ (tell) you the result afterwards.',
            answerSlots: ['am meeting', 'will tell'],
            exp: 'Mixed: arranged near future + future promise。'
        },
        {
            tenses: ['future_perfect_continuous', 'simple_future'],
            voices: ['active'],
            chinese: '到下月，他會在這項目工作半年，所以他會很熟悉流程。',
            question: 'By next month, he ______ (work) on this project for half a year, so he ______ (know) the process well.',
            answerSlots: ['will have been working', 'will know'],
            exp: 'Mixed: duration up to future point + future result。'
        },
        {
            tenses: ['simple_present', 'simple_past'],
            voices: ['active', 'passive'],
            chinese: '這間博物館現在由政府管理，但以前由大學管理。',
            question: 'The museum ______ (manage) by the government now, but it ______ (run) by the university in the past.',
            answerSlots: ['is managed', 'was run'],
            exp: 'Mixed passive: now -> simple present passive; in the past -> simple past passive。'
        },
        {
            tenses: ['present_continuous', 'simple_past'],
            voices: ['active', 'passive'],
            chinese: '舊課室現在正在翻新，因為上月校方發現了安全問題。',
            question: 'The old classroom ______ (renovate) now because the school ______ (discover) a safety problem last month.',
            answerSlots: ['is being renovated', 'discovered'],
            exp: 'Mixed: present continuous passive + simple past active。'
        },
        {
            tenses: ['present_perfect', 'simple_past'],
            voices: ['active', 'passive'],
            chinese: '結果已經公布，因為老師昨天完成了覆核。',
            question: 'The results ______ (announce) recently because the teachers ______ (complete) the checking yesterday.',
            answerSlots: ['have been announced', 'completed'],
            exp: 'Mixed: present perfect passive result + simple past reason。'
        },
        {
            tenses: ['past_continuous', 'simple_past'],
            voices: ['active', 'passive'],
            chinese: '警鐘響起時，考卷正在派發。',
            question: 'The papers ______ (hand) out when the alarm ______ (ring).',
            answerSlots: ['were being handed', 'rang'],
            exp: 'Mixed: past continuous passive + simple past interruption。'
        },
        {
            tenses: ['past_perfect', 'simple_past'],
            voices: ['active', 'passive'],
            chinese: '我到達時，門已經被鎖上，保安也離開了。',
            question: 'The door ______ (lock) and the guard ______ (leave) when I arrived.',
            answerSlots: ['had been locked', 'had left'],
            exp: 'Mixed: both actions happened before arrival; passive + active past perfect。'
        },
        {
            tenses: ['simple_future', 'simple_present'],
            voices: ['active', 'passive'],
            chinese: '如果你遲交，作業將不被接受。',
            question: 'If you ______ (submit) the assignment late, it ______ (not accept).',
            answerSlots: ['submit', 'will not be accepted'],
            answers: ['submit will not be accepted', "submit won't be accepted"],
            exp: 'Mixed: if-clause simple present + future passive negative。'
        },
        {
            tenses: ['future_perfect', 'simple_present'],
            voices: ['active', 'passive'],
            chinese: '校長到達前，場地會已經佈置完成。',
            question: 'Before the principal ______ (arrive), the venue ______ (decorate).',
            answerSlots: ['arrives', 'will have been decorated'],
            exp: 'Mixed: before-clause simple present; main clause future perfect passive。'
        }
    ];

    const bank = Array.isArray(root.GRAMMAR_TENSE_BANK) ? root.GRAMMAR_TENSE_BANK : [];
    let index = 1;
    packs.forEach(({ tense, voice, items }) => {
        items.forEach(([chinese, question, answers, exp]) => {
            bank.push({
                id: `TENSE_EXTRA_${String(index).padStart(3, '0')}`,
                tense,
                voice,
                chinese,
                question,
                answers,
                exp
            });
            index += 1;
        });
    });
    root.GRAMMAR_TENSE_BANK = bank;

    const mixedBank = Array.isArray(root.GRAMMAR_MIXED_TENSE_BANK) ? root.GRAMMAR_MIXED_TENSE_BANK : [];
    mixedQuestions.forEach((item, mixedIndex) => {
        const answerSlots = item.answerSlots || [];
        mixedBank.push({
            id: `TENSE_MIXED_${String(mixedIndex + 1).padStart(3, '0')}`,
            mixed: true,
            tenses: item.tenses,
            voices: item.voices,
            chinese: item.chinese,
            question: item.question,
            answerSlots,
            answers: item.answers || [answerSlots.join(' ')],
            exp: item.exp
        });
    });
    root.GRAMMAR_MIXED_TENSE_BANK = mixedBank;
})(typeof window !== 'undefined' ? window : globalThis);
