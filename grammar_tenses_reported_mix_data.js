// Reported speech / reported question mixed-tense pack for Grammar TENSES battle mode.
// Adds 100 junior-exam-style mixed drills focused on simple past + past perfect / past perfect continuous.
(function (root) {
    const reportTimeCues = [
        { en: 'Yesterday', zh: '昨天' },
        { en: 'Last week', zh: '上星期' },
        { en: 'After class', zh: '課後' },
        { en: 'During the lesson', zh: '課堂期間' },
        { en: 'At the meeting', zh: '會議上' }
    ];

    function lowerReportedStarter(value) {
        return String(value || '')
            .replace(/^The\b/, 'the')
            .replace(/^My\b/, 'my')
            .replace(/^She\b/, 'she')
            .replace(/^He\b/, 'he')
            .replace(/^Father\b/, 'father')
            .replace(/^Mother\b/, 'mother')
            .replace(/^Dad\b/, 'dad')
            .replace(/^Mum\b/, 'mum');
    }

    function withReportedEnglishCue(question, index) {
        const cue = reportTimeCues[index % reportTimeCues.length]?.en || 'Yesterday';
        return `${cue}, ${lowerReportedStarter(question)}`;
    }

    function withReportedChineseCue(chinese, index) {
        const cue = reportTimeCues[index % reportTimeCues.length]?.zh || '昨天';
        return `${cue}，${chinese}`;
    }

    const reportedMixedQuestions = [
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '班長說她午飯前已經提交了點名表。',
            question: 'The class monitor ______ (say) that she ______ (submit) the attendance list before lunch.',
            answerSlots: ['said', 'had submitted'],
            exp: 'Reported statement: simple past reporting verb + past perfect for the earlier action.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: 'Peter 承認他之前忘記帶通告。',
            question: 'Peter ______ (admit) that he ______ (forget) to bring the notice earlier.',
            answerSlots: ['admitted', 'had forgotten'],
            exp: 'Reported admission: the forgetting happened before the admission.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '老師解釋她之前已經檢查了所有作文。',
            question: 'The teacher ______ (explain) that she ______ (check) all the compositions already.',
            answerSlots: ['explained', 'had checked'],
            exp: 'Reported explanation with already -> past perfect.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '妹妹說她前一天已經看完那本小說。',
            question: 'My sister ______ (say) that she ______ (finish) the novel the day before.',
            answerSlots: ['said', 'had finished'],
            exp: 'The day before in reported speech points to past perfect.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '學生告訴我他之前已經改正了錯誤。',
            question: 'The student ______ (tell) me that he ______ (correct) the mistakes earlier.',
            answerSlots: ['told', 'had corrected'],
            exp: 'Reported statement: earlier action -> had + past participle.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '她回答說她之前未見過這種題型。',
            question: 'She ______ (reply) that she ______ never ______ (see) this type of question before.',
            answerSlots: ['replied', 'had', 'seen'],
            exp: 'Never + before in reported speech -> past perfect.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '教練說隊員比賽前已經完成熱身。',
            question: 'The coach ______ (say) that the players ______ (complete) the warm-up before the match.',
            answerSlots: ['said', 'had completed'],
            exp: 'The warm-up happened before another past event.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: 'May 解釋她到達前已經買了門票。',
            question: 'May ______ (explain) that she ______ (buy) the tickets before she arrived.',
            answerSlots: ['explained', 'had bought'],
            exp: 'Earlier completed action before arrival -> past perfect.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '男孩承認他早前打破了窗戶。',
            question: 'The boy ______ (admit) that he ______ (break) the window earlier.',
            answerSlots: ['admitted', 'had broken'],
            exp: 'Earlier past action reported later.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '父親說他以前從未聽過這個藉口。',
            question: 'Father ______ (say) that he ______ never ______ (hear) that excuse before.',
            answerSlots: ['said', 'had', 'heard'],
            exp: 'Never before in a past report -> past perfect.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: 'Lucy 告訴老師她前一晚已經溫習了那一章。',
            question: 'Lucy ______ (tell) the teacher that she ______ (revise) that chapter the night before.',
            answerSlots: ['told', 'had revised'],
            exp: 'The night before in reported speech -> past perfect.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '他解釋自己在測驗前已經失去了准考證。',
            question: 'He ______ (explain) that he ______ (lose) his admission form before the quiz.',
            answerSlots: ['explained', 'had lost'],
            exp: 'Loss before a past quiz -> past perfect.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '秘書說她之前已經寄出了電郵。',
            question: 'The secretary ______ (say) that she ______ already ______ (send) the email.',
            answerSlots: ['said', 'had', 'sent'],
            exp: 'Already in a past report -> had already + past participle.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: 'Tom 承認他之前沒有閱讀指示。',
            question: 'Tom ______ (admit) that he ______ (not read) the instructions earlier.',
            answerSlots: ['admitted', 'had not read'],
            exp: 'Negative reported earlier action -> had not + past participle.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '老師說很多學生之前已經犯過同一個錯誤。',
            question: 'The teacher ______ (say) that many students ______ (make) the same mistake before.',
            answerSlots: ['said', 'had made'],
            exp: 'Before in a past report -> past perfect.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '姐姐告訴我她之前已經選擇了科目。',
            question: 'My sister ______ (tell) me that she ______ (choose) her subjects earlier.',
            answerSlots: ['told', 'had chosen'],
            exp: 'Earlier choice reported later -> past perfect.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '他報告說電腦在課堂前已經停止運作。',
            question: 'He ______ (report) that the computer ______ (stop) working before the lesson.',
            answerSlots: ['reported', 'had stopped'],
            exp: 'Action before the lesson -> past perfect.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '母親問我為甚麼之前沒有關窗。',
            question: 'Mother ______ (ask) why I ______ (not close) the windows earlier.',
            answerSlots: ['asked', 'had not closed'],
            exp: 'Reported question: why + subject + past perfect.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '老師問學生為甚麼前一天缺席。',
            question: 'The teacher ______ (ask) why the student ______ (be) absent the day before.',
            answerSlots: ['asked', 'had been'],
            exp: 'Reported question with the day before -> past perfect.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '同學問我是否之前已經找到答案。',
            question: 'My classmate ______ (ask) whether I ______ (find) the answer earlier.',
            answerSlots: ['asked', 'had found'],
            exp: 'Whether reported question; earlier action -> past perfect.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '校長想知道誰之前打開了實驗室門。',
            question: 'The principal ______ (wonder) who ______ (open) the laboratory door earlier.',
            answerSlots: ['wondered', 'had opened'],
            exp: 'Reported question: who + past perfect for earlier action.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '老師問我們之前是否理解那條規則。',
            question: 'The teacher ______ (ask) whether we ______ (understand) the rule before.',
            answerSlots: ['asked', 'had understood'],
            exp: 'Before in a reported question -> past perfect.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '她問我之前在哪裏買了那本練習。',
            question: 'She ______ (ask) where I ______ (buy) that exercise book earlier.',
            answerSlots: ['asked', 'had bought'],
            exp: 'Reported question after past reporting verb; buying happened earlier.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '父親問 Tom 是否已經完成網上功課。',
            question: 'Father ______ (ask) whether Tom ______ already ______ (finish) the online homework.',
            answerSlots: ['asked', 'had', 'finished'],
            exp: 'Already in a reported question -> had already + past participle.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '老師問 Mary 為甚麼之前沒有帶字典。',
            question: 'The teacher ______ (ask) why Mary ______ (not bring) her dictionary earlier.',
            answerSlots: ['asked', 'had not brought'],
            exp: 'Reported why-question; missing item happened before asking.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '職員問學生是否之前已經填妥表格。',
            question: 'The clerk ______ (ask) whether the student ______ (fill) in the form earlier.',
            answerSlots: ['asked', 'had filled'],
            exp: 'Earlier completion in reported question -> past perfect.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '教練想知道誰在訓練前已經離開。',
            question: 'The coach ______ (wonder) who ______ (leave) before the training session.',
            answerSlots: ['wondered', 'had left'],
            exp: 'Action before training -> past perfect.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '她問我們之前是否聽過那位講者。',
            question: 'She ______ (ask) whether we ______ (hear) that speaker before.',
            answerSlots: ['asked', 'had heard'],
            exp: 'Before in reported question -> past perfect.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '老師問班長是否已經收齊工作紙。',
            question: 'The teacher ______ (ask) whether the monitor ______ already ______ (collect) the worksheets.',
            answerSlots: ['asked', 'had', 'collected'],
            exp: 'Reported yes-no question: whether + past perfect.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '哥哥問我為甚麼前一天沒有回覆訊息。',
            question: 'My brother ______ (ask) why I ______ (not reply) to the message the day before.',
            answerSlots: ['asked', 'had not replied'],
            exp: 'The day before in reported question -> past perfect.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '老師問誰之前更改了座位表。',
            question: 'The teacher ______ (ask) who ______ (change) the seating plan earlier.',
            answerSlots: ['asked', 'had changed'],
            exp: 'Who-question in reported speech with earlier action.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '她想知道我是否已經向老師道歉。',
            question: 'She ______ (wonder) whether I ______ already ______ (apologise) to the teacher.',
            answerSlots: ['wondered', 'had', 'apologised'],
            answers: ['wondered had apologised', 'wondered had apologized'],
            exp: 'Reported question: had already + past participle.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '學生問為甚麼實驗之前失敗了。',
            question: 'The student ______ (ask) why the experiment ______ (fail) earlier.',
            answerSlots: ['asked', 'had failed'],
            exp: 'Earlier failure reported later -> past perfect.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '她問我們是否已經完成改正。',
            question: 'She ______ (ask) whether we ______ already ______ (complete) the corrections.',
            answerSlots: ['asked', 'had', 'completed'],
            exp: 'Already in reported question -> past perfect.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '老師問學生前一晚讀了多少頁。',
            question: 'The teacher ______ (ask) how many pages the student ______ (read) the night before.',
            answerSlots: ['asked', 'had read'],
            exp: 'The night before in a reported question -> past perfect.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '他問我之前是否誤解了問題。',
            question: 'He ______ (ask) whether I ______ (misunderstand) the question earlier.',
            answerSlots: ['asked', 'had misunderstood'],
            exp: 'Earlier misunderstanding in reported question -> past perfect.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '校務處問家長是否已經簽署回條。',
            question: 'The school office ______ (ask) whether the parent ______ already ______ (sign) the reply slip.',
            answerSlots: ['asked', 'had', 'signed'],
            exp: 'Reported whether-question with already -> past perfect.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '老師問學生為甚麼之前選錯答案。',
            question: 'The teacher ______ (ask) why the student ______ (choose) the wrong answer earlier.',
            answerSlots: ['asked', 'had chosen'],
            exp: 'Earlier choice reported later -> past perfect.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: 'Mary 問我是否已經借了那本參考書。',
            question: 'Mary ______ (ask) whether I ______ already ______ (borrow) the reference book.',
            answerSlots: ['asked', 'had', 'borrowed'],
            exp: 'Had already + past participle in reported question.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active'],
            chinese: '老師問誰之前刪除了檔案。',
            question: 'The teacher ______ (ask) who ______ (delete) the file earlier.',
            answerSlots: ['asked', 'had deleted'],
            exp: 'Earlier deletion reported in a question.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '學生問我到那時已經學被動語態多久。',
            question: 'The student ______ (ask) how long I ______ (learn) the passive voice by then.',
            answerSlots: ['asked', 'had been learning'],
            exp: 'How long + by then in a reported question -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active', 'passive'],
            chinese: '校長說結果之前已經公布。',
            question: 'The principal ______ (say) that the results ______ already ______ (announce).',
            answerSlots: ['said', 'had', 'been announced'],
            exp: 'Reported passive: had already been + past participle.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active', 'passive'],
            chinese: '老師解釋座位在學生入場前已經安排好。',
            question: 'The teacher ______ (explain) that the seats ______ (arrange) before the students entered.',
            answerSlots: ['explained', 'had been arranged'],
            exp: 'Earlier passive action -> had been + past participle.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active', 'passive'],
            chinese: '職員說所有表格前一天已經收到。',
            question: 'The clerk ______ (say) that all the forms ______ (receive) the day before.',
            answerSlots: ['said', 'had been received'],
            exp: 'The day before in reported passive speech -> past perfect passive.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active', 'passive'],
            chinese: '主任報告說新規則之前已經向學生解釋。',
            question: 'The supervisor ______ (report) that the new rules ______ (explain) to students earlier.',
            answerSlots: ['reported', 'had been explained'],
            exp: 'Reported passive earlier action -> had been explained.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active', 'passive'],
            chinese: '老師問工作紙是否已經派發。',
            question: 'The teacher ______ (ask) whether the worksheets ______ already ______ (hand) out.',
            answerSlots: ['asked', 'had', 'been handed'],
            exp: 'Reported passive question: had already been handed out.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active', 'passive'],
            chinese: '她問錯誤之前是否已被更正。',
            question: 'She ______ (ask) whether the error ______ (correct) earlier.',
            answerSlots: ['asked', 'had been corrected'],
            exp: 'Earlier passive correction -> had been + past participle.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active', 'passive'],
            chinese: '學生想知道報告是否已經提交。',
            question: 'The student ______ (wonder) whether the report ______ already ______ (submit).',
            answerSlots: ['wondered', 'had', 'been submitted'],
            exp: 'Reported passive whether-question -> past perfect passive.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active', 'passive'],
            chinese: '校務處問付款之前是否已確認。',
            question: 'The school office ______ (ask) whether the payment ______ (confirm) earlier.',
            answerSlots: ['asked', 'had been confirmed'],
            exp: 'Earlier passive confirmation in reported question.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active', 'passive'],
            chinese: '老師說試卷在鐘聲響起前已經收齊。',
            question: 'The teacher ______ (say) that the papers ______ (collect) before the bell rang.',
            answerSlots: ['said', 'had been collected'],
            exp: 'Earlier passive action before bell -> past perfect passive.'
        },
        {
            tenses: ['simple_past', 'past_perfect'],
            voices: ['active', 'passive'],
            chinese: '校長問門是否之前已經鎖上。',
            question: 'The principal ______ (ask) whether the door ______ (lock) earlier.',
            answerSlots: ['asked', 'had been locked'],
            exp: 'Reported passive question with earlier cue.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: 'Tom 說他到那時已經等了半小時。',
            question: 'Tom ______ (say) that he ______ (wait) for half an hour by then.',
            answerSlots: ['said', 'had been waiting'],
            exp: 'Reported speech: duration up to a past reporting point -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: 'May 解釋她之前一直在準備口試。',
            question: 'May ______ (explain) that she ______ (prepare) for the oral exam earlier.',
            answerSlots: ['explained', 'had been preparing'],
            exp: 'Earlier ongoing action reported later -> had been + -ing.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '學生承認他整個早上一直在玩電話。',
            question: 'The student ______ (admit) that he ______ (play) on his phone all morning.',
            answerSlots: ['admitted', 'had been playing'],
            exp: 'All morning before the admission -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '老師說我們之前一直用錯時態。',
            question: 'The teacher ______ (say) that we ______ (use) the wrong tense earlier.',
            answerSlots: ['said', 'had been using'],
            exp: 'Earlier repeated/ongoing action -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '哥哥告訴我他到那時已經練習了兩小時。',
            question: 'My brother ______ (tell) me that he ______ (practise) for two hours by then.',
            answerSlots: ['told', 'had been practising'],
            answers: ['told had been practising', 'told had been practicing'],
            exp: 'For two hours by then -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: 'Lucy 說她自星期一起一直在修改計劃。',
            question: 'Lucy ______ (say) that she ______ (revise) the plan since Monday.',
            answerSlots: ['said', 'had been revising'],
            exp: 'Since Monday in reported past speech -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '班長說他們之前一直在收集意見。',
            question: 'The monitor ______ (say) that they ______ (collect) opinions earlier.',
            answerSlots: ['said', 'had been collecting'],
            exp: 'Earlier ongoing collection -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '她投訴鄰居前一晚一直在製造噪音。',
            question: 'She ______ (complain) that her neighbours ______ (make) noise the night before.',
            answerSlots: ['complained', 'had been making'],
            exp: 'The night before + ongoing action -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '他解釋自己之前一直在照顧弟弟。',
            question: 'He ______ (explain) that he ______ (look) after his younger brother earlier.',
            answerSlots: ['explained', 'had been looking'],
            exp: 'Earlier ongoing care -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '老師說學生在鐘聲響起前一直在聊天。',
            question: 'The teacher ______ (say) that the students ______ (chat) before the bell rang.',
            answerSlots: ['said', 'had been chatting'],
            exp: 'Ongoing action before past point -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '教練說隊伍比賽前一直訓練得很努力。',
            question: 'The coach ______ (say) that the team ______ (train) hard before the match.',
            answerSlots: ['said', 'had been training'],
            exp: 'Ongoing training before a past match -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '同學告訴我她到那時已經搜尋資料一星期。',
            question: 'My classmate ______ (tell) me that she ______ (search) for information for a week by then.',
            answerSlots: ['told', 'had been searching'],
            exp: 'For a week by then -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '她承認自己之前一直在猜答案。',
            question: 'She ______ (admit) that she ______ (guess) the answers earlier.',
            answerSlots: ['admitted', 'had been guessing'],
            exp: 'Earlier repeated guessing -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '他報告說電腦之前一直運作很慢。',
            question: 'He ______ (report) that the computer ______ (run) slowly earlier.',
            answerSlots: ['reported', 'had been running'],
            exp: 'Earlier ongoing state -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: 'Mary 說她從早上起一直在等回覆。',
            question: 'Mary ______ (say) that she ______ (wait) for a reply since morning.',
            answerSlots: ['said', 'had been waiting'],
            exp: 'Since morning in reported past speech -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '學生解釋他之前一直在修改作文。',
            question: 'The student ______ (explain) that he ______ (revise) his composition earlier.',
            answerSlots: ['explained', 'had been revising'],
            exp: 'Earlier ongoing revision -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '老師說我們整個星期一直在練習 reported speech。',
            question: 'The teacher ______ (say) that we ______ (practise) reported speech all week.',
            answerSlots: ['said', 'had been practising'],
            answers: ['said had been practising', 'said had been practicing'],
            exp: 'All week before a past report -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '媽媽說弟弟整個下午一直在看影片。',
            question: 'Mum ______ (say) that my brother ______ (watch) videos all afternoon.',
            answerSlots: ['said', 'had been watching'],
            exp: 'All afternoon in reported speech -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '她說自己在老師進來前一直在畫圖。',
            question: 'She ______ (say) that she ______ (draw) pictures before the teacher came in.',
            answerSlots: ['said', 'had been drawing'],
            exp: 'Ongoing action before another past action -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '他告訴我們他之前一直在研究那個題目。',
            question: 'He ______ (tell) us that he ______ (research) the topic earlier.',
            answerSlots: ['told', 'had been researching'],
            exp: 'Earlier ongoing research -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '老師問我們為甚麼之前一直在說話。',
            question: 'The teacher ______ (ask) why we ______ (talk) earlier.',
            answerSlots: ['asked', 'had been talking'],
            exp: 'Reported why-question; earlier ongoing action -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '爸爸問我在晚飯前一直在做甚麼。',
            question: 'Dad ______ (ask) what I ______ (do) before dinner.',
            answerSlots: ['asked', 'had been doing'],
            exp: 'Reported what-question with action before dinner -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '老師問學生到那時已經等了多久。',
            question: 'The teacher ______ (ask) how long the students ______ (wait) by then.',
            answerSlots: ['asked', 'had been waiting'],
            exp: 'How long + by then in reported question -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '她問我為甚麼整個早上一直在咳嗽。',
            question: 'She ______ (ask) why I ______ (cough) all morning.',
            answerSlots: ['asked', 'had been coughing'],
            exp: 'All morning before the reported question -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: 'Peter 問我之前是否一直在用他的電腦。',
            question: 'Peter ______ (ask) whether I ______ (use) his computer earlier.',
            answerSlots: ['asked', 'had been using'],
            exp: 'Whether-question about earlier ongoing action.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '老師想知道誰在鐘聲響前一直在唱歌。',
            question: 'The teacher ______ (wonder) who ______ (sing) before the bell rang.',
            answerSlots: ['wondered', 'had been singing'],
            exp: 'Who-question with ongoing action before past point.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '校長問我們是否之前一直在準備展覽。',
            question: 'The principal ______ (ask) whether we ______ (prepare) for the exhibition earlier.',
            answerSlots: ['asked', 'had been preparing'],
            exp: 'Earlier preparation in reported question -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '媽媽問妹妹為甚麼前一晚一直在哭。',
            question: 'Mum ______ (ask) why my sister ______ (cry) the night before.',
            answerSlots: ['asked', 'had been crying'],
            exp: 'The night before + ongoing action -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '老師問我們在他離開時一直在討論甚麼那麼久。',
            question: 'The teacher ______ (ask) what we ______ (discuss) for so long while he was away.',
            answerSlots: ['asked', 'had been discussing'],
            exp: 'Reported what-question about earlier ongoing discussion.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '她問那個男孩是否已經練習了很久。',
            question: 'She ______ (ask) whether the boy ______ (practise) for a long time.',
            answerSlots: ['asked', 'had been practising'],
            answers: ['asked had been practising', 'asked had been practicing'],
            exp: 'For a long time in reported question -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '老師問學生為甚麼之前一直沒有留心聽。',
            question: 'The teacher ______ (ask) why the students ______ (not listen) earlier.',
            answerSlots: ['asked', 'had not been listening'],
            exp: 'Negative past perfect continuous in reported question.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '爸爸問我到那時是否已經學習了三小時。',
            question: 'Dad ______ (ask) whether I ______ (study) for three hours by then.',
            answerSlots: ['asked', 'had been studying'],
            exp: 'For three hours by then -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '老師問誰之前一直在更改答案。',
            question: 'The teacher ______ (ask) who ______ (change) the answers earlier.',
            answerSlots: ['asked', 'had been changing'],
            exp: 'Earlier ongoing/repeated changing -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '同學問我自何時起一直在學法文。',
            question: 'My classmate ______ (ask) since when I ______ (learn) French.',
            answerSlots: ['asked', 'had been learning'],
            exp: 'Since when in reported question -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '她問我是否整個星期一直在避免那個問題。',
            question: 'She ______ (ask) whether I ______ (avoid) the problem all week.',
            answerSlots: ['asked', 'had been avoiding'],
            exp: 'All week in reported question -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '老師問男孩在校巴到達前一直在等誰。',
            question: 'The teacher ______ (ask) who the boy ______ (wait) for before the school bus arrived.',
            answerSlots: ['asked', 'had been waiting'],
            exp: 'Question word + preposition; duration before a past point -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '校長問學生是否之前一直在籌備活動。',
            question: 'The principal ______ (ask) whether the students ______ (organise) the event earlier.',
            answerSlots: ['asked', 'had been organising'],
            answers: ['asked had been organising', 'asked had been organizing'],
            exp: 'Earlier ongoing organisation -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '老師問為甚麼電腦之前一直重新啟動。',
            question: 'The teacher ______ (ask) why the computer ______ (restart) earlier.',
            answerSlots: ['asked', 'had been restarting'],
            exp: 'Earlier repeated restarting -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '媽媽問妹妹整個下午一直在寫甚麼。',
            question: 'Mum ______ (ask) what my sister ______ (write) all afternoon.',
            answerSlots: ['asked', 'had been writing'],
            exp: 'All afternoon in reported question -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '老師問我們之前是否一直在互相核對答案。',
            question: 'The teacher ______ (ask) whether we ______ (check) answers with each other earlier.',
            answerSlots: ['asked', 'had been checking'],
            exp: 'Earlier ongoing checking -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '爸爸問我到那時已經跑了多久。',
            question: 'Dad ______ (ask) how long I ______ (run) by then.',
            answerSlots: ['asked', 'had been running'],
            exp: 'How long + by then -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '老師問學生是否之前一直在抄答案。',
            question: 'The teacher ______ (ask) whether the student ______ (copy) the answers earlier.',
            answerSlots: ['asked', 'had been copying'],
            exp: 'Reported question about earlier ongoing action.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '她問我為甚麼之前一直在重複同一個論點。',
            question: 'She ______ (ask) why I ______ (repeat) the same point earlier.',
            answerSlots: ['asked', 'had been repeating'],
            exp: 'Earlier repeated action -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '老師問組員是否整個早上一直在比較數據。',
            question: 'The teacher ______ (ask) whether the groupmates ______ (compare) the data all morning.',
            answerSlots: ['asked', 'had been comparing'],
            exp: 'All morning in reported question -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '同學問我之前是否一直在分析圖表。',
            question: 'My classmate ______ (ask) whether I ______ (analyse) the charts earlier.',
            answerSlots: ['asked', 'had been analysing'],
            answers: ['asked had been analysing', 'asked had been analyzing'],
            exp: 'Earlier ongoing analysis -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '老師問 Peter 在她回來前一直在閱讀甚麼。',
            question: 'The teacher ______ (ask) what Peter ______ (read) before she returned.',
            answerSlots: ['asked', 'had been reading'],
            exp: 'Ongoing reading before another past action.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '媽媽問我前一晚是否一直在用平板電腦。',
            question: 'Mum ______ (ask) whether I ______ (use) the tablet the night before.',
            answerSlots: ['asked', 'had been using'],
            exp: 'The night before + ongoing action -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '老師問班長是否自小息後一直在點算工作紙。',
            question: 'The teacher ______ (ask) whether the monitor ______ (count) the worksheets since recess.',
            answerSlots: ['asked', 'had been counting'],
            exp: 'Since recess in a reported question -> past perfect continuous.'
        },
        {
            tenses: ['simple_past', 'past_perfect_continuous'],
            voices: ['active'],
            chinese: '她問我在考試前一直睡了多久。',
            question: 'She ______ (ask) how long I ______ (sleep) before the exam.',
            answerSlots: ['asked', 'had been sleeping'],
            exp: 'How long before a past exam -> past perfect continuous.'
        }
    ];

    const mixedBank = Array.isArray(root.GRAMMAR_MIXED_TENSE_BANK) ? root.GRAMMAR_MIXED_TENSE_BANK : [];
    reportedMixedQuestions.forEach((item, index) => {
        const answerSlots = item.answerSlots || [];
        mixedBank.push({
            id: `TENSE_MIXED_REPORTED_${String(index + 1).padStart(3, '0')}`,
            mixed: true,
            tenses: item.tenses,
            voices: item.voices,
            chinese: withReportedChineseCue(item.chinese, index),
            question: withReportedEnglishCue(item.question, index),
            answerSlots,
            answers: item.answers || [answerSlots.join(' ')],
            exp: item.exp
        });
    });
    root.GRAMMAR_MIXED_TENSE_BANK = mixedBank;
})(typeof window !== 'undefined' ? window : globalThis);
