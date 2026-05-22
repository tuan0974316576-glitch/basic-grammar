// More exam-style tense expansion for Grammar TENSES battle mode.
// Adds 5 questions for every tense + voice bucket, plus 50 mixed-tense drills.
(function (root) {
    const packs = [
        {
            tense: 'simple_present',
            voice: 'active',
            items: [
                ['這個系統每天午夜自動更新資料。', 'This system ______ (update) the records automatically at midnight.', ['updates'], 'Simple present: fixed routine + singular subject。'],
                ['很多學生在總結段落中重複同一觀點。', 'Many students ______ (repeat) the same point in the concluding paragraph.', ['repeat'], 'Plural subject + base verb。'],
                ['她通常不接受沒有證據的答案。', 'She usually ______ (not accept) answers without evidence.', ['does not accept', "doesn't accept"], 'Simple present negative: does not + base verb。'],
                ['如果水溫下降到零度，它會結冰。', 'If the temperature falls to zero, water ______ (freeze).', ['freezes'], 'Zero conditional fact -> simple present。'],
                ['每位會員每月收到一份電子通訊。', 'Each member ______ (receive) a newsletter every month.', ['receives'], 'Each + singular noun -> verb-s。']
            ]
        },
        {
            tense: 'simple_present',
            voice: 'passive',
            items: [
                ['成績通常在學期末公布。', 'The marks ______ usually ______ (release) at the end of the term.', ['are released'], 'Passive: plural subject + are + p.p.。'],
                ['每個帳戶都受密碼保護。', 'Each account ______ (protect) by a password.', ['is protected'], 'Each + singular subject -> is + p.p.。'],
                ['遲交表格一般不會處理。', 'Late forms ______ usually ______ (not process).', ['are not processed', "aren't processed"], 'Passive negative: are not + p.p.。'],
                ['這種材料經常用於科學實驗。', 'This material ______ often ______ (use) in science experiments.', ['is used'], 'Passive with often -> is often used。'],
                ['訪客進入前會被檢查證件。', 'Visitors ______ (check) before they enter the building.', ['are checked'], 'Passive: plural subject + are checked。']
            ]
        },
        {
            tense: 'present_continuous',
            voice: 'active',
            items: [
                ['我現在正在核對最後一頁。', 'I ______ (check) the final page now.', ['am checking'], 'Now -> present continuous。'],
                ['她這星期正在準備升學面試。', 'She ______ (prepare) for an admission interview this week.', ['is preparing'], 'Temporary action in unfinished period。'],
                ['學生們現在正在為辯論搜尋資料。', 'The students ______ (search) for evidence for the debate now.', ['are searching'], 'Action happening around now。'],
                ['這個城市近年正在迅速發展。', 'The city ______ (develop) rapidly these days.', ['is developing'], 'Changing situation -> present continuous。'],
                ['他們今天不是練習唱歌，而是在排舞。', 'They ______ (not practise) singing today; they are rehearsing a dance.', ['are not practising', "aren't practising", 'are not practicing', "aren't practicing"], 'Present continuous negative。']
            ]
        },
        {
            tense: 'present_continuous',
            voice: 'passive',
            items: [
                ['問卷現在正在由研究小組分析。', 'The questionnaires ______ (analyse) by the research team now.', ['are being analysed', 'are being analyzed'], 'Present continuous passive。'],
                ['新的安全措施正在測試。', 'The new safety measures ______ (test) at the moment.', ['are being tested'], 'At the moment -> are being + p.p.。'],
                ['主禮堂正在重新粉刷。', 'The main hall ______ (paint) again this week.', ['is being painted'], 'Singular subject + is being + p.p.。'],
                ['所有座位現在正在按班別安排。', 'All seats ______ (arrange) according to class now.', ['are being arranged'], 'Plural passive continuous。'],
                ['這個投訴目前正在處理。', 'This complaint ______ (handle) at present.', ['is being handled'], 'At present -> is being + p.p.。']
            ]
        },
        {
            tense: 'present_perfect',
            voice: 'active',
            items: [
                ['我已經把草稿交給老師。', 'I ______ already ______ (give) the draft to the teacher.', ['have given'], 'Already + present perfect。'],
                ['他最近改善了發音。', 'He ______ (improve) his pronunciation recently.', ['has improved'], 'Recently -> present perfect。'],
                ['我們還未選定研究題目。', 'We ______ (not choose) a research topic yet.', ['have not chosen', "haven't chosen"], 'Yet + negative present perfect。'],
                ['你曾經參觀過立法會嗎？', '______ you ever ______ (visit) the Legislative Council?', ['have visited'], 'Ever question -> Have + subject + p.p.。'],
                ['她自中一以來一直是合唱團成員。', 'She ______ (be) a choir member since Form One.', ['has been'], 'Since + starting point -> present perfect。']
            ]
        },
        {
            tense: 'present_perfect',
            voice: 'passive',
            items: [
                ['所有報名表已經收到。', 'All application forms ______ already ______ (receive).', ['have been received'], 'Plural passive present perfect。'],
                ['這個問題還未解決。', 'This problem ______ (not solve) yet.', ['has not been solved', "hasn't been solved"], 'Yet + has not been + p.p.。'],
                ['三個方案已經被拒絕。', 'Three proposals ______ already ______ (reject).', ['have been rejected'], 'Plural + have been + p.p.。'],
                ['新入口自上星期起已關閉。', 'The new entrance ______ (close) since last week.', ['has been closed'], 'Since + has been + p.p.。'],
                ['這些資料剛剛被更新。', 'These details ______ just ______ (update).', ['have been updated'], 'Just + have been + p.p.。']
            ]
        },
        {
            tense: 'present_perfect_continuous',
            voice: 'active',
            items: [
                ['他由午飯後一直在修改簡報。', 'He ______ (revise) the presentation since lunch.', ['has been revising'], 'Since + present perfect continuous。'],
                ['我們已經討論這問題很久。', 'We ______ (discuss) this issue for a long time.', ['have been discussing'], 'For + duration。'],
                ['她最近一直練習面試答案。', 'She ______ (practise) interview answers recently.', ['has been practising', 'has been practicing'], 'Recent repeated activity。'],
                ['學生們整個早上都在整理數據。', 'The students ______ (organise) the data all morning.', ['have been organising', 'have been organizing'], 'All morning + ongoing activity。'],
                ['雨從昨晚起一直下。', 'It ______ (rain) since last night.', ['has been raining'], 'Continuing weather action。']
            ]
        },
        {
            tense: 'present_perfect_continuous',
            voice: 'passive',
            items: [
                ['這個方案幾個星期以來一直被審議。', 'This plan ______ (consider) for several weeks.', ['has been being considered'], 'Passive present perfect continuous。'],
                ['這些申請自星期一起一直被處理。', 'These applications ______ (process) since Monday.', ['have been being processed'], 'Plural + have been being + p.p.。'],
                ['主禮堂近來一直在翻新。', 'The main hall ______ (renovate) recently.', ['has been being renovated'], 'Ongoing passive action up to now。'],
                ['樣本整天都在被觀察。', 'The samples ______ (observe) all day.', ['have been being observed'], 'All day + passive perfect continuous。'],
                ['這個規則多年來一直受到批評。', 'This rule ______ (criticise) for years.', ['has been being criticised', 'has been being criticized'], 'Passive duration up to now。']
            ]
        },
        {
            tense: 'simple_past',
            voice: 'active',
            items: [
                ['她昨天提交了申請。', 'She ______ (submit) the application yesterday.', ['submitted'], 'Yesterday -> simple past。'],
                ['我們上週沒有參加講座。', 'We ______ (not attend) the talk last week.', ['did not attend', "didn't attend"], 'Past negative: did not + base verb。'],
                ['他在測驗中犯了三個錯誤。', 'He ______ (make) three mistakes in the quiz.', ['made'], 'Irregular past -> made。'],
                ['他們兩年前搬到這區。', 'They ______ (move) to this district two years ago.', ['moved'], 'Ago -> simple past。'],
                ['我剛才找到遺失的筆記。', 'I ______ (find) the missing notes just now.', ['found'], 'Just now -> simple past。']
            ]
        },
        {
            tense: 'simple_past',
            voice: 'passive',
            items: [
                ['這個錯誤昨天被發現。', 'This error ______ (discover) yesterday.', ['was discovered'], 'Singular passive past。'],
                ['所有椅子昨天都搬到禮堂。', 'All chairs ______ (move) to the hall yesterday.', ['were moved'], 'Plural passive past。'],
                ['比賽因大雨延期。', 'The match ______ (postpone) because of heavy rain.', ['was postponed'], 'Was + p.p.。'],
                ['三份報告昨天在會議中討論。', 'Three reports ______ (discuss) in the meeting yesterday.', ['were discussed'], 'Plural + were + p.p.。'],
                ['那封信錯誤寄出。', 'The letter ______ (send) by mistake.', ['was sent'], 'Irregular p.p. sent。']
            ]
        },
        {
            tense: 'past_continuous',
            voice: 'active',
            items: [
                ['我看見她時，她正在影印筆記。', 'She ______ (copy) the notes when I saw her.', ['was copying'], 'Ongoing past action。'],
                ['我們到達時，學生們正在排隊。', 'The students ______ (queue) when we arrived.', ['were queuing', 'were queueing'], 'Background past action。'],
                ['昨晚八時，他正在準備實驗。', 'He ______ (prepare) the experiment at eight last night.', ['was preparing'], 'Exact past time。'],
                ['老師說話時，他們沒有留心聽。', 'They ______ (not listen) while the teacher was speaking.', ['were not listening', "weren't listening"], 'Past continuous negative。'],
                ['我正在下載檔案時，網絡中斷。', 'I ______ (download) the file when the network failed.', ['was downloading'], 'Interrupted past action。']
            ]
        },
        {
            tense: 'past_continuous',
            voice: 'passive',
            items: [
                ['我們進入房間時，答案正在核對。', 'The answers ______ (check) when we entered the room.', ['were being checked'], 'Past continuous passive。'],
                ['校長到達時，場地正在佈置。', 'The venue ______ (decorate) when the principal arrived.', ['was being decorated'], 'Was being + p.p.。'],
                ['昨晚十時，道路正在清理。', 'The road ______ (clear) at ten last night.', ['was being cleared'], 'Exact past time + passive continuous。'],
                ['我打電話時，申請正在審閱。', 'The applications ______ (review) when I called.', ['were being reviewed'], 'Plural passive continuous。'],
                ['警鐘響起時，電腦正在更新。', 'The computers ______ (update) when the alarm rang.', ['were being updated'], 'Ongoing passive past。']
            ]
        },
        {
            tense: 'past_perfect',
            voice: 'active',
            items: [
                ['我到達前，她已經完成簡報。', 'She ______ (finish) the presentation before I arrived.', ['had finished'], 'Earlier past -> past perfect。'],
                ['他發現自己之前忘記了截止日期。', 'He realised that he ______ (forget) the deadline earlier.', ['had forgotten'], 'Reported realisation + earlier action。'],
                ['我們到車站時，火車已經離開。', 'The train ______ (leave) when we reached the station.', ['had left'], 'Had + p.p.。'],
                ['老師回來前，學生已經收拾好課室。', 'The students ______ (tidy) the classroom before the teacher returned.', ['had tidied'], 'Earlier completed action。'],
                ['她解釋說她之前已經看過通知。', 'She explained that she ______ already ______ (read) the notice.', ['had read'], 'Reported speech with earlier action。']
            ]
        },
        {
            tense: 'past_perfect',
            voice: 'passive',
            items: [
                ['會議開始前，文件已經列印。', 'The documents ______ (print) before the meeting began.', ['had been printed'], 'Past perfect passive。'],
                ['我到達時，問題已經解決。', 'The problem ______ (solve) when I arrived.', ['had been solved'], 'Had been + p.p.。'],
                ['表格提交前，資料已被核對。', 'The information ______ (check) before the form was submitted.', ['had been checked'], 'Earlier passive action。'],
                ['活動取消前，所有門票已售出。', 'All tickets ______ (sell) before the event was cancelled.', ['had been sold'], 'Plural passive past perfect。'],
                ['我打開門時，燈已經關掉。', 'The lights ______ (turn) off when I opened the door.', ['had been turned'], 'Passive past perfect。']
            ]
        },
        {
            tense: 'past_perfect_continuous',
            voice: 'active',
            items: [
                ['他暈倒前已經跑了很久。', 'He ______ (run) for a long time before he fainted.', ['had been running'], 'Duration before past event。'],
                ['我們找到答案前一直在討論。', 'We ______ (discuss) the question before we found the answer.', ['had been discussing'], 'Past perfect continuous。'],
                ['她看起來很緊張，因為她一直在等結果。', 'She looked nervous because she ______ (wait) for the result.', ['had been waiting'], 'Past result of earlier ongoing action。'],
                ['他們被打斷前一直在練習。', 'They ______ (practise) before they were interrupted.', ['had been practising', 'had been practicing'], 'Ongoing action before interruption。'],
                ['電腦壞掉前，我一直在編輯報告。', 'I ______ (edit) the report before the computer broke down.', ['had been editing'], 'Earlier ongoing action。']
            ]
        },
        {
            tense: 'past_perfect_continuous',
            voice: 'passive',
            items: [
                ['系統重啟前，程式已被測試數小時。', 'The program ______ (test) for hours before the system restarted.', ['had been being tested'], 'Passive past perfect continuous。'],
                ['資料公布前已被核對很久。', 'The data ______ (check) for a long time before it was released.', ['had been being checked'], 'Had been being + p.p.。'],
                ['工程暫停前，道路已被維修數星期。', 'The road ______ (repair) for weeks before the work stopped.', ['had been being repaired'], 'Ongoing passive before past point。'],
                ['結果公布前一直被審閱。', 'The results ______ (review) before they were announced.', ['had been being reviewed'], 'Passive duration before announcement。'],
                ['樣本被丟棄前已被觀察多日。', 'The samples ______ (observe) for days before they were discarded.', ['had been being observed'], 'Plural passive past perfect continuous。']
            ]
        },
        {
            tense: 'simple_future',
            voice: 'active',
            items: [
                ['我保證明天會交還圖書。', 'I promise I ______ (return) the books tomorrow.', ['will return'], 'Tomorrow -> simple future。'],
                ['我相信他們稍後不會公開結果。', 'I believe they ______ (not publish) the results later.', ['will not publish', "won't publish"], 'Future negative。'],
                ['如果你有問題，我會幫你。', 'If you have questions, I ______ (help) you.', ['will help'], 'First conditional result clause。'],
                ['我預計校方下星期會檢討安排。', 'I expect the school ______ (review) the arrangement next week.', ['will review'], 'Will + base verb。'],
                ['我相信她會通過面試。', 'I believe she ______ (pass) the interview.', ['will pass'], 'Prediction。']
            ]
        },
        {
            tense: 'simple_future',
            voice: 'passive',
            items: [
                ['我預計名單將於星期五張貼。', 'I expect the list ______ (post) on Friday.', ['will be posted'], 'Future passive。'],
                ['我相信所有遲交答案將不獲接納。', 'I believe late answers ______ (not accept).', ['will not be accepted', "won't be accepted"], 'Future passive negative。'],
                ['我預計新規則將向家長解釋。', 'I expect the new rules ______ (explain) to parents.', ['will be explained'], 'Plural future passive。'],
                ['我預計每位得獎者將獲通知。', 'I expect each winner ______ (notify) by email.', ['will be notified'], 'Each + will be + p.p.。'],
                ['我預計場地將於活動後清理。', 'I expect the venue ______ (clean) after the event.', ['will be cleaned'], 'Will be + p.p.。']
            ]
        },
        {
            tense: 'future_continuous',
            voice: 'active',
            items: [
                ['明天這個時間，我會正在參加口試。', 'This time tomorrow, I ______ (take) the oral exam.', ['will be taking'], 'This time tomorrow -> future continuous。'],
                ['你到達時，他們會正在排練。', 'They ______ (rehearse) when you arrive.', ['will be rehearsing'], 'Future action in progress。'],
                ['她今晚十時會正在整理資料。', 'She ______ (organise) the materials at ten tonight.', ['will be organising', 'will be organizing'], 'Specific future time。'],
                ['下星期這個時間，我們會正在進行問卷調查。', 'This time next week, we ______ (conduct) a survey.', ['will be conducting'], 'Future continuous for planned ongoing action。'],
                ['明早九時，他不會正在使用會議室。', 'At nine tomorrow morning, he ______ (not use) the meeting room.', ['will not be using', "won't be using"], 'Future continuous negative。']
            ]
        },
        {
            tense: 'future_continuous',
            voice: 'passive',
            items: [
                ['明早九時，考卷會正在印刷。', 'At nine tomorrow morning, the exam papers ______ (print).', ['will be being printed'], 'Future continuous passive。'],
                ['你到達時，房間會正在清潔。', 'The room ______ (clean) when you arrive.', ['will be being cleaned'], 'Will be being + p.p.。'],
                ['下星期這個時間，系統會正在更新。', 'This time next week, the system ______ (update).', ['will be being updated'], 'Future passive in progress。'],
                ['活動期間，結果會正在核對。', 'During the event, the results ______ (check).', ['will be being checked'], 'Plural future continuous passive。'],
                ['明天下午三時，舊設備會正在更換。', 'At three tomorrow afternoon, the old equipment ______ (replace).', ['will be being replaced'], 'Future continuous passive。']
            ]
        },
        {
            tense: 'future_perfect',
            voice: 'active',
            items: [
                ['到明天，我會完成練習。', 'By tomorrow, I ______ (finish) the exercise.', ['will have finished'], 'By + future time -> future perfect。'],
                ['她到達前，他們會已經離開。', 'They ______ (leave) before she arrives.', ['will have left'], 'Completed before a future point。'],
                ['到月底，我們會提交研究報告。', 'By the end of the month, we ______ (submit) the research report.', ['will have submitted'], 'Future perfect。'],
                ['會議開始前，老師會看完所有草稿。', 'The teacher ______ (read) all drafts before the meeting starts.', ['will have read'], 'Future completion before another future event。'],
                ['到下週，他會學完這個單元。', 'By next week, he ______ (complete) this unit.', ['will have completed'], 'Future perfect completion。']
            ]
        },
        {
            tense: 'future_perfect',
            voice: 'passive',
            items: [
                ['到星期一，所有座位會已經安排好。', 'By Monday, all seats ______ (arrange).', ['will have been arranged'], 'Future perfect passive。'],
                ['你回來前，文件會已經簽署。', 'The documents ______ (sign) before you return.', ['will have been signed'], 'Will have been + p.p.。'],
                ['到截止日期，申請會完成審批。', 'The applications ______ (approve) by the deadline.', ['will have been approved'], 'Plural future perfect passive。'],
                ['活動開始前，場地會佈置完成。', 'The venue ______ (decorate) before the event starts.', ['will have been decorated'], 'Future perfect passive。'],
                ['到下星期，結果會公布給全級。', 'The results ______ (announce) to the whole form by next week.', ['will have been announced'], 'Will have been announced。']
            ]
        },
        {
            tense: 'future_perfect_continuous',
            voice: 'active',
            items: [
                ['到七月，她會練習鋼琴滿五年。', 'By July, she ______ (practise) the piano for five years.', ['will have been practising', 'will have been practicing'], 'Duration up to future point。'],
                ['到你到達時，我們會等了四十分鐘。', 'By the time you arrive, we ______ (wait) for forty minutes.', ['will have been waiting'], 'Future perfect continuous。'],
                ['到年底，他們會研究這問題兩年。', 'By the end of the year, they ______ (research) this issue for two years.', ['will have been researching'], 'Ongoing action up to future time。'],
                ['到比賽開始時，校隊會訓練六個月。', 'By the time the competition starts, the team ______ (train) for six months.', ['will have been training'], 'Duration before future point。'],
                ['到明早，雨會下了十二小時。', 'By tomorrow morning, it ______ (rain) for twelve hours.', ['will have been raining'], 'Weather duration。']
            ]
        },
        {
            tense: 'future_perfect_continuous',
            voice: 'passive',
            items: [
                ['到六月，這座橋會被檢查三個月。', 'By June, this bridge ______ (inspect) for three months.', ['will have been being inspected'], 'Future perfect continuous passive。'],
                ['到系統推出時，程式會被測試多星期。', 'By the time the system is launched, the program ______ (test) for weeks.', ['will have been being tested'], 'Will have been being + p.p.。'],
                ['到下月，資料會被分析一整個月。', 'By next month, the data ______ (analyse) for a whole month.', ['will have been being analysed', 'will have been being analyzed'], 'Passive duration up to future point。'],
                ['到年底，舊校舍會被翻新兩年。', 'By the end of the year, the old building ______ (renovate) for two years.', ['will have been being renovated'], 'Future passive duration。'],
                ['到會議結束，建議會被討論三小時。', 'By the end of the meeting, the proposal ______ (discuss) for three hours.', ['will have been being discussed'], 'Future perfect continuous passive。']
            ]
        }
    ];

    const mixedQuestions = [
        { tenses: ['simple_present', 'present_continuous'], voices: ['active'], chinese: '我通常坐巴士上學，但今天爸爸正在送我。', question: 'I usually ______ (take) the bus to school, but today my father ______ (drive) me.', answerSlots: ['take', 'is driving'], exp: 'Usually -> simple present; today -> present continuous。' },
        { tenses: ['simple_present', 'present_perfect'], voices: ['active'], chinese: '我認識他很多年，而現在更了解他的想法。', question: 'I ______ (know) him for years, and now I ______ (understand) his ideas better.', answerSlots: ['have known', 'understand'], exp: 'For years -> present perfect; now -> simple present。' },
        { tenses: ['simple_present', 'simple_future'], voices: ['active'], chinese: '如果你明天有空，我會向你解釋答案。', question: 'If you ______ (be) free tomorrow, I ______ (explain) the answer to you.', answerSlots: ['are', 'will explain'], exp: 'First conditional: if + simple present, will + base。' },
        { tenses: ['simple_present', 'future_perfect'], voices: ['active'], chinese: '你回來時，我會已完成這份練習。', question: 'When you ______ (come) back, I ______ (finish) this exercise.', answerSlots: ['come', 'will have finished'], exp: 'Time clause uses present; main clause future perfect。' },
        { tenses: ['simple_present', 'future_continuous'], voices: ['active'], chinese: '你明早到達時，我會正在上課。', question: 'When you ______ (arrive) tomorrow morning, I ______ (attend) a lesson.', answerSlots: ['arrive', 'will be attending'], exp: 'Time clause present + future action in progress。' },
        { tenses: ['present_continuous', 'simple_future'], voices: ['active'], chinese: '我按安排今晚要見老師，之後保證會告訴你結果。', question: 'As arranged, I ______ (meet) the teacher tonight, and I promise I ______ (tell) you the result afterwards.', answerSlots: ['am meeting', 'will tell'], exp: 'Arrangement + future promise。' },
        { tenses: ['present_continuous', 'present_perfect'], voices: ['active'], chinese: '他現在正在哭，因為他剛剛收到壞消息。', question: 'He ______ (cry) now because he ______ just ______ (receive) bad news.', answerSlots: ['is crying', 'has', 'received'], exp: 'Now -> present continuous; just -> present perfect。' },
        { tenses: ['present_continuous', 'simple_past'], voices: ['active'], chinese: '她現在正在改正昨天犯的錯誤。', question: 'She ______ (correct) the mistakes now that she ______ (make) yesterday.', answerSlots: ['is correcting', 'made'], exp: 'Current action + past action yesterday。' },
        { tenses: ['present_continuous', 'future_perfect'], voices: ['active'], chinese: '我們現在正在收集資料，到星期五會完成分析。', question: 'We ______ (collect) data now, and by Friday we ______ (complete) the analysis.', answerSlots: ['are collecting', 'will have completed'], exp: 'Now + by future time。' },
        { tenses: ['present_perfect', 'simple_past'], voices: ['active'], chinese: '他自從去年搬來後已經學會很多廣東話。', question: 'He ______ (learn) a lot of Cantonese since he ______ (move) here last year.', answerSlots: ['has learned', 'moved'], exp: 'Main clause present perfect; since-clause simple past。' },
        { tenses: ['present_perfect', 'simple_future'], voices: ['active'], chinese: '我已完成草稿，所以保證稍後會交給老師。', question: 'I ______ (finish) the draft already, so I promise I ______ (give) it to the teacher later.', answerSlots: ['have finished', 'will give'], exp: 'Present result + future action。' },
        { tenses: ['present_perfect', 'present_perfect_continuous'], voices: ['active'], chinese: '她最近一直練習發音，而且到目前為止已改善很多。', question: 'She ______ (practise) pronunciation recently, and so far she ______ (improve) a lot.', answerSlots: ['has been practising', 'has improved'], answers: ['has been practising has improved', 'has been practicing has improved'], exp: 'Ongoing practice + result up to now。' },
        { tenses: ['present_perfect', 'future_perfect'], voices: ['active'], chinese: '他已開始研究，所以到下月會完成報告。', question: 'He ______ (start) the research already, so by next month he ______ (finish) the report.', answerSlots: ['has started', 'will have finished'], exp: 'Present result + future completion。' },
        { tenses: ['present_perfect_continuous', 'simple_present'], voices: ['active'], chinese: '我一直減少喝咖啡，現在晚上睡得較好。', question: 'I ______ (reduce) my coffee intake, and now I ______ (sleep) better at night.', answerSlots: ['have been reducing', 'sleep'], exp: 'Ongoing recent change + current habit/result。' },
        { tenses: ['present_perfect_continuous', 'simple_past'], voices: ['active'], chinese: '自從他加入球隊後，他一直努力訓練。', question: 'He ______ (train) hard since he ______ (join) the team.', answerSlots: ['has been training', 'joined'], exp: 'Since-clause past + present perfect continuous。' },
        { tenses: ['present_perfect_continuous', 'simple_future'], voices: ['active'], chinese: '我們一直準備比賽，所以明天會表現更好。', question: 'We ______ (prepare) for the contest, so we ______ (perform) better tomorrow.', answerSlots: ['have been preparing', 'will perform'], exp: 'Ongoing preparation + future result。' },
        { tenses: ['simple_past', 'past_continuous'], voices: ['active'], chinese: '我正在溫習時，他打電話給我。', question: 'I ______ (revise) when he ______ (call) me.', answerSlots: ['was revising', 'called'], exp: 'Ongoing past action interrupted by simple past。' },
        { tenses: ['simple_past', 'past_perfect'], voices: ['active'], chinese: '我昨天發現自己之前忘記帶准考證。', question: 'Yesterday, I ______ (realise) that I ______ (forget) my admission form earlier.', answerSlots: ['realised', 'had forgotten'], answers: ['realised had forgotten', 'realized had forgotten'], exp: 'Later past realisation + earlier past action。' },
        { tenses: ['simple_past', 'past_perfect_continuous'], voices: ['active'], chinese: '他很累，因為他之前一直跑步。', question: 'He ______ (feel) tired because he ______ (run) for an hour.', answerSlots: ['felt', 'had been running'], exp: 'Past result + earlier ongoing action。' },
        { tenses: ['simple_past', 'simple_future'], voices: ['active'], chinese: '她昨天答應會幫我們。', question: 'She ______ (promise) yesterday that she ______ (help) us.', answerSlots: ['promised', 'would help'], answers: ['promised would help'], exp: 'Reported future in the past often uses would。' },
        { tenses: ['past_continuous', 'past_perfect'], voices: ['active'], chinese: '我正在找那本書，因為我之前把它放錯地方。', question: 'I ______ (look) for the book because I ______ (misplace) it earlier.', answerSlots: ['was looking', 'had misplaced'], exp: 'Past continuous action + earlier cause。' },
        { tenses: ['past_continuous', 'past_perfect_continuous'], voices: ['active'], chinese: '他進來時，我們正在討論已研究多星期的問題。', question: 'When he came in, we ______ (discuss) the problem we ______ (study) for weeks.', answerSlots: ['were discussing', 'had been studying'], exp: 'Past continuous + earlier ongoing study。' },
        { tenses: ['past_perfect', 'past_perfect_continuous'], voices: ['active'], chinese: '她早前已經完成報告，因為她之前一直整晚工作。', question: 'She ______ (finish) the report earlier because she ______ (work) all night.', answerSlots: ['had finished', 'had been working'], exp: 'Past perfect result + past perfect continuous cause。' },
        { tenses: ['simple_future', 'future_continuous'], voices: ['active'], chinese: '我保證稍後會回覆你，但今晚九點我會正在開會。', question: 'I promise I ______ (reply) to you later, but at nine tonight I ______ (attend) a meeting.', answerSlots: ['will reply', 'will be attending'], exp: 'Future action + future action in progress。' },
        { tenses: ['simple_future', 'future_perfect'], voices: ['active'], chinese: '我們會開始討論前，他會已經看完資料。', question: 'Before we start the discussion, he ______ (read) the materials and we ______ (begin) at once.', answerSlots: ['will have read', 'will begin'], exp: 'Future completion before later future action。' },
        { tenses: ['simple_future', 'future_perfect_continuous'], voices: ['active'], chinese: '到明年他會學英文十年，所以會參加高級班。', question: 'By next year, he ______ (learn) English for ten years, so he ______ (join) the advanced class.', answerSlots: ['will have been learning', 'will join'], exp: 'Future duration up to point + future result。' },
        { tenses: ['future_continuous', 'future_perfect'], voices: ['active'], chinese: '明晚八時我會正在溫習，到十時會完成兩個單元。', question: 'At eight tomorrow night, I ______ (revise), and by ten I ______ (complete) two units.', answerSlots: ['will be revising', 'will have completed'], exp: 'Future in-progress action + future completion。' },
        { tenses: ['future_continuous', 'future_perfect_continuous'], voices: ['active'], chinese: '下月這時候她會正在表演，而且已練習了半年。', question: 'This time next month, she ______ (perform), and she ______ (practise) for half a year.', answerSlots: ['will be performing', 'will have been practising'], answers: ['will be performing will have been practising', 'will be performing will have been practicing'], exp: 'Future continuous + duration up to future point。' },
        { tenses: ['future_perfect', 'future_perfect_continuous'], voices: ['active'], chinese: '到六月我們會完成研究，並已收集數據三個月。', question: 'By June, we ______ (finish) the research and we ______ (collect) data for three months.', answerSlots: ['will have finished', 'will have been collecting'], exp: 'Future perfect + future perfect continuous。' },
        { tenses: ['present_continuous', 'past_continuous'], voices: ['active'], chinese: '我現在正在做類似練習；昨天這個時候也正在做同一類題。', question: 'I ______ (do) a similar exercise now; at this time yesterday, I ______ (do) the same type of questions.', answerSlots: ['am doing', 'was doing'], exp: 'Now + exact past time contrast。' },
        { tenses: ['simple_present', 'simple_past'], voices: ['active', 'passive'], chinese: '這本書現在被很多學生使用，但以前只有老師使用。', question: 'This book ______ (use) by many students now, but only teachers ______ (use) it in the past.', answerSlots: ['is used', 'used'], exp: 'Present passive + past active contrast。' },
        { tenses: ['simple_present', 'simple_future'], voices: ['active', 'passive'], chinese: '如果你違反規則，你會被取消資格。', question: 'If you ______ (break) the rules, you ______ (disqualify).', answerSlots: ['break', 'will be disqualified'], exp: 'First conditional + future passive。' },
        { tenses: ['present_continuous', 'simple_present'], voices: ['active', 'passive'], chinese: '這個問題正在研究，因為它每天影響很多學生。', question: 'This problem ______ (study) now because it ______ (affect) many students every day.', answerSlots: ['is being studied', 'affects'], exp: 'Present continuous passive + simple present fact。' },
        { tenses: ['present_continuous', 'simple_future'], voices: ['active', 'passive'], chinese: '場地現在正在清潔，所以稍後會開放。', question: 'The venue ______ (clean) now, so it ______ (open) later.', answerSlots: ['is being cleaned', 'will open'], exp: 'Present continuous passive + future active。' },
        { tenses: ['present_perfect', 'simple_past'], voices: ['active', 'passive'], chinese: '表格最近已被處理，因為職員昨天收到所有資料。', question: 'The form ______ (process) recently because the staff ______ (receive) all the details yesterday.', answerSlots: ['has been processed', 'received'], exp: 'Present perfect passive + simple past reason。' },
        { tenses: ['present_perfect', 'simple_future'], voices: ['active', 'passive'], chinese: '錯誤已被修正，所以我預計系統稍後會重新啟動。', question: 'The error ______ (fix) already, so I expect the system ______ (restart) later.', answerSlots: ['has been fixed', 'will restart'], exp: 'Present perfect passive + future active。' },
        { tenses: ['present_perfect_continuous', 'simple_present'], voices: ['active', 'passive'], chinese: '這個方案一直被測試，現在看起來很穩定。', question: 'This plan ______ (test) for weeks, and it ______ (seem) stable now.', answerSlots: ['has been being tested', 'seems'], exp: 'Passive perfect continuous + present state。' },
        { tenses: ['simple_past', 'past_continuous'], voices: ['active', 'passive'], chinese: '火警鐘響起時，考卷正在派發。', question: 'The exam papers ______ (hand) out when the fire alarm ______ (ring).', answerSlots: ['were being handed', 'rang'], exp: 'Past continuous passive + simple past interruption。' },
        { tenses: ['simple_past', 'past_perfect'], voices: ['active', 'passive'], chinese: '我到達時，門已經被鎖上。', question: 'When I ______ (arrive), the door ______ (lock).', answerSlots: ['arrived', 'had been locked'], exp: 'Simple past reference point + earlier passive action。' },
        { tenses: ['past_continuous', 'past_perfect'], voices: ['active', 'passive'], chinese: '我們正在等候，因為座位之前沒有安排好。', question: 'We ______ (wait) because the seats ______ (not arrange) properly earlier.', answerSlots: ['were waiting', 'had not been arranged'], answers: ['were waiting had not been arranged', "were waiting hadn't been arranged"], exp: 'Past continuous + earlier passive negative。' },
        { tenses: ['past_perfect_continuous', 'simple_past'], voices: ['active', 'passive'], chinese: '道路重開前已被維修數星期。', question: 'The road ______ (repair) for weeks before it ______ (reopen).', answerSlots: ['had been being repaired', 'reopened'], exp: 'Passive past perfect continuous + simple past。' },
        { tenses: ['simple_future', 'future_continuous'], voices: ['active', 'passive'], chinese: '明天下午申請會一直正在審閱，而我預計職員會通知你結果。', question: 'Throughout tomorrow afternoon, the applications ______ (review), and I expect the staff ______ (inform) you of the result.', answerSlots: ['will be being reviewed', 'will inform'], exp: 'Future continuous passive + simple future active。' },
        { tenses: ['simple_future', 'future_perfect'], voices: ['active', 'passive'], chinese: '截止日期前，所有答案會被檢查，老師會公布分數。', question: 'By the deadline, all answers ______ (check), and the teacher ______ (announce) the marks.', answerSlots: ['will have been checked', 'will announce'], exp: 'Future perfect passive + simple future active。' },
        { tenses: ['future_continuous', 'future_perfect'], voices: ['active', 'passive'], chinese: '你到達時，場地會正在佈置；到活動開始時會完成。', question: 'When you arrive, the venue ______ (decorate); by the time the event starts, it ______ (complete).', answerSlots: ['will be being decorated', 'will have been completed'], exp: 'Future continuous passive + future perfect passive。' },
        { tenses: ['future_perfect_continuous', 'simple_future'], voices: ['active', 'passive'], chinese: '到六月，橋樑會被檢查三個月，工程師會提交報告。', question: 'By June, the bridge ______ (inspect) for three months, and the engineers ______ (submit) a report.', answerSlots: ['will have been being inspected', 'will submit'], exp: 'Future perfect continuous passive + simple future active。' },
        { tenses: ['future_perfect', 'simple_present'], voices: ['active', 'passive'], chinese: '如果系統準時啟動，所有資料會在中午前上載完成。', question: 'If the system ______ (start) on time, all data ______ (upload) by noon.', answerSlots: ['starts', 'will have been uploaded'], exp: 'If-clause simple present + future perfect passive。' },
        { tenses: ['past_perfect', 'present_perfect'], voices: ['active'], chinese: '我以前未見過這種題型，但現在已經掌握了。', question: 'I ______ never ______ (see) this type of question before, but now I ______ (master) it.', answerSlots: ['had', 'seen', 'have mastered'], exp: 'Past reference before now + present result。' },
        { tenses: ['past_continuous', 'present_continuous'], voices: ['active'], chinese: '昨天這個時候我正在準備口試；現在我正在等待結果。', question: 'At this time yesterday, I ______ (prepare) for the oral exam; now I ______ (wait) for the result.', answerSlots: ['was preparing', 'am waiting'], exp: 'Past continuous + present continuous contrast。' },
        { tenses: ['future_perfect', 'past_perfect'], voices: ['active'], chinese: '上次到達前我已完成閱讀；下次到達前我會完成寫作。', question: 'Before I arrived last time, I ______ (finish) the reading; before I arrive next time, I ______ (finish) the writing.', answerSlots: ['had finished', 'will have finished'], exp: 'Past perfect + future perfect contrast。' },
        { tenses: ['present_perfect_continuous', 'future_perfect_continuous'], voices: ['active'], chinese: '我一直練習到現在；到比賽日，我會練習了三個月。', question: 'I ______ (practise) until now; by the competition day, I ______ (practise) for three months.', answerSlots: ['have been practising', 'will have been practising'], answers: ['have been practising will have been practising', 'have been practicing will have been practicing', 'have been practising will have been practicing', 'have been practicing will have been practising'], exp: 'Present duration + future duration。' }
    ];

    const bank = Array.isArray(root.GRAMMAR_TENSE_BANK) ? root.GRAMMAR_TENSE_BANK : [];
    let index = 1;
    packs.forEach(({ tense, voice, items }) => {
        items.forEach(([chinese, question, answers, exp]) => {
            bank.push({
                id: `TENSE_MORE_${String(index).padStart(3, '0')}`,
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
            id: `TENSE_MIXED_MORE_${String(mixedIndex + 1).padStart(3, '0')}`,
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
