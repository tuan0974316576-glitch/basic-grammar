// High-quality tense booster pack for Grammar TENSES battle mode.
// Adds 10 exam-style questions for every tense + voice bucket.
(function (root) {
    const contexts = [
        {
            subject: 'The debate team',
            subjectZh: '辯論隊',
            object: 'the rebuttal notes',
            objectZh: '反駁筆記',
            base: 'prepare',
            present: 'prepares',
            past: 'prepared',
            pp: 'prepared',
            ing: 'preparing',
            verbZh: '準備',
            subjectBePresent: 'is',
            subjectBePast: 'was',
            subjectHave: 'has',
            objectBePresent: 'are',
            objectBePast: 'were',
            objectHave: 'have'
        },
        {
            subject: 'The student volunteers',
            subjectZh: '學生義工',
            object: 'the survey results',
            objectZh: '問卷結果',
            base: 'check',
            present: 'check',
            past: 'checked',
            pp: 'checked',
            ing: 'checking',
            verbZh: '檢查',
            subjectBePresent: 'are',
            subjectBePast: 'were',
            subjectHave: 'have',
            objectBePresent: 'are',
            objectBePast: 'were',
            objectHave: 'have'
        },
        {
            subject: 'The scholarship applicant',
            subjectZh: '獎學金申請人',
            object: 'the application form',
            objectZh: '申請表',
            base: 'revise',
            present: 'revises',
            past: 'revised',
            pp: 'revised',
            ing: 'revising',
            verbZh: '修改',
            subjectBePresent: 'is',
            subjectBePast: 'was',
            subjectHave: 'has',
            objectBePresent: 'is',
            objectBePast: 'was',
            objectHave: 'has'
        },
        {
            subject: 'The safety officer',
            subjectZh: '安全主任',
            object: 'the safety instructions',
            objectZh: '安全指引',
            base: 'explain',
            present: 'explains',
            past: 'explained',
            pp: 'explained',
            ing: 'explaining',
            verbZh: '解釋',
            subjectBePresent: 'is',
            subjectBePast: 'was',
            subjectHave: 'has',
            objectBePresent: 'are',
            objectBePast: 'were',
            objectHave: 'have'
        },
        {
            subject: 'My groupmates',
            subjectZh: '我的組員',
            object: 'the two sets of data',
            objectZh: '兩組數據',
            base: 'compare',
            present: 'compare',
            past: 'compared',
            pp: 'compared',
            ing: 'comparing',
            verbZh: '比較',
            subjectBePresent: 'are',
            subjectBePast: 'were',
            subjectHave: 'have',
            objectBePresent: 'are',
            objectBePast: 'were',
            objectHave: 'have'
        },
        {
            subject: 'The class monitor',
            subjectZh: '班長',
            object: 'the seating plan',
            objectZh: '座位表',
            base: 'organise',
            present: 'organises',
            past: 'organised',
            pp: 'organised',
            ing: 'organising',
            verbZh: '整理',
            subjectBePresent: 'is',
            subjectBePast: 'was',
            subjectHave: 'has',
            objectBePresent: 'is',
            objectBePast: 'was',
            objectHave: 'has'
        },
        {
            subject: 'The research assistant',
            subjectZh: '研究助理',
            object: 'the data charts',
            objectZh: '數據圖表',
            base: 'analyse',
            present: 'analyses',
            past: 'analysed',
            pp: 'analysed',
            ing: 'analysing',
            verbZh: '分析',
            subjectBePresent: 'is',
            subjectBePast: 'was',
            subjectHave: 'has',
            objectBePresent: 'are',
            objectBePast: 'were',
            objectHave: 'have'
        },
        {
            subject: 'The committee',
            subjectZh: '委員會',
            object: 'the project proposal',
            objectZh: '專題建議書',
            base: 'review',
            present: 'reviews',
            past: 'reviewed',
            pp: 'reviewed',
            ing: 'reviewing',
            verbZh: '審閱',
            subjectBePresent: 'is',
            subjectBePast: 'was',
            subjectHave: 'has',
            objectBePresent: 'is',
            objectBePast: 'was',
            objectHave: 'has'
        },
        {
            subject: 'The school office',
            subjectZh: '校務處',
            object: 'the notice',
            objectZh: '通告',
            base: 'update',
            present: 'updates',
            past: 'updated',
            pp: 'updated',
            ing: 'updating',
            verbZh: '更新',
            subjectBePresent: 'is',
            subjectBePast: 'was',
            subjectHave: 'has',
            objectBePresent: 'is',
            objectBePast: 'was',
            objectHave: 'has'
        },
        {
            subject: 'The science club members',
            subjectZh: '科學學會會員',
            object: 'the water samples',
            objectZh: '水質樣本',
            base: 'collect',
            present: 'collect',
            past: 'collected',
            pp: 'collected',
            ing: 'collecting',
            verbZh: '收集',
            subjectBePresent: 'are',
            subjectBePast: 'were',
            subjectHave: 'have',
            objectBePresent: 'are',
            objectBePast: 'were',
            objectHave: 'have'
        }
    ];

    const tenseTemplates = {
        simple_present: {
            active: {
                chinese: c => `${c.subjectZh}每星期都會在限時前${c.verbZh}${c.objectZh}。`,
                question: c => `Every week, ${lowerFirst(c.subject)} ______ (${c.base}) ${c.object} before the weekly deadline.`,
                answer: c => c.present,
                exp: 'Simple present active: routine / regular practice.'
            },
            passive: {
                chinese: c => `${c.objectZh}每星期都會在限時前由${c.subjectZh}${c.verbZh}。`,
                question: c => `Every week, ${c.object} ______ (${c.base}) before the weekly deadline.`,
                answer: c => `${c.objectBePresent} ${c.pp}`,
                exp: 'Simple present passive: am / is / are + past participle.'
            }
        },
        present_continuous: {
            active: {
                chinese: c => `${c.subjectZh}現在正在${c.verbZh}${c.objectZh}，因為限期快到。`,
                question: c => `${c.subject} ______ (${c.base}) ${c.object} at the moment because the deadline is near.`,
                answer: c => `${c.subjectBePresent} ${c.ing}`,
                exp: 'Present continuous active: am / is / are + -ing.'
            },
            passive: {
                chinese: c => `${c.objectZh}現在正由${c.subjectZh}${c.verbZh}，因為限期快到。`,
                question: c => `${capitalize(c.object)} ______ (${c.base}) at the moment because the deadline is near.`,
                answer: c => `${c.objectBePresent} being ${c.pp}`,
                exp: 'Present continuous passive: am / is / are being + past participle.'
            }
        },
        present_perfect: {
            active: {
                chinese: c => `${c.subjectZh}已經${c.verbZh}好${c.objectZh}，所以可以進入下一步。`,
                question: c => `${c.subject} ______ (${c.base}) ${c.object} already, so the next step can begin.`,
                answer: c => `${c.subjectHave} ${c.pp}`,
                exp: 'Present perfect active: has / have + past participle.'
            },
            passive: {
                chinese: c => `${c.objectZh}已經由${c.subjectZh}${c.verbZh}好，所以可以進入下一步。`,
                question: c => `${capitalize(c.object)} ______ (${c.base}) already, so the next step can begin.`,
                answer: c => `${c.objectHave} been ${c.pp}`,
                exp: 'Present perfect passive: has / have been + past participle.'
            }
        },
        present_perfect_continuous: {
            active: {
                chinese: c => `${c.subjectZh}自午飯後一直在${c.verbZh}${c.objectZh}。`,
                question: c => `${c.subject} ______ (${c.base}) ${c.object} since lunchtime.`,
                answer: c => `${c.subjectHave} been ${c.ing}`,
                exp: 'Present perfect continuous active: has / have been + -ing.'
            },
            passive: {
                chinese: c => `${c.objectZh}自午飯後一直由${c.subjectZh}${c.verbZh}。`,
                question: c => `${capitalize(c.object)} ______ (${c.base}) since lunchtime.`,
                answer: c => `${c.objectHave} been being ${c.pp}`,
                exp: 'Present perfect continuous passive: has / have been being + past participle.'
            }
        },
        simple_past: {
            active: {
                chinese: c => `${c.subjectZh}昨天在會議前${c.verbZh}了${c.objectZh}。`,
                question: c => `${c.subject} ______ (${c.base}) ${c.object} before the meeting yesterday.`,
                answer: c => c.past,
                exp: 'Simple past active: completed past action.'
            },
            passive: {
                chinese: c => `${c.objectZh}昨天在會議前由${c.subjectZh}${c.verbZh}了。`,
                question: c => `${capitalize(c.object)} ______ (${c.base}) before the meeting yesterday.`,
                answer: c => `${c.objectBePast} ${c.pp}`,
                exp: 'Simple past passive: was / were + past participle.'
            }
        },
        past_continuous: {
            active: {
                chinese: c => `老師進入課室時，${c.subjectZh}正在${c.verbZh}${c.objectZh}。`,
                question: c => `${c.subject} ______ (${c.base}) ${c.object} when the teacher entered the classroom.`,
                answer: c => `${c.subjectBePast} ${c.ing}`,
                exp: 'Past continuous active: was / were + -ing.'
            },
            passive: {
                chinese: c => `老師進入課室時，${c.objectZh}正在由${c.subjectZh}${c.verbZh}。`,
                question: c => `${capitalize(c.object)} ______ (${c.base}) when the teacher entered the classroom.`,
                answer: c => `${c.objectBePast} being ${c.pp}`,
                exp: 'Past continuous passive: was / were being + past participle.'
            }
        },
        past_perfect: {
            active: {
                chinese: c => `限期結束前，${c.subjectZh}已經${c.verbZh}好${c.objectZh}。`,
                question: c => `${c.subject} ______ (${c.base}) ${c.object} before the deadline passed.`,
                answer: c => `had ${c.pp}`,
                exp: 'Past perfect active: had + past participle.'
            },
            passive: {
                chinese: c => `限期結束前，${c.objectZh}已經由${c.subjectZh}${c.verbZh}好。`,
                question: c => `${capitalize(c.object)} ______ (${c.base}) before the deadline passed.`,
                answer: c => `had been ${c.pp}`,
                exp: 'Past perfect passive: had been + past participle.'
            }
        },
        past_perfect_continuous: {
            active: {
                chinese: c => `鐘聲響起前，${c.subjectZh}已經一直${c.verbZh}${c.objectZh}一小時。`,
                question: c => `${c.subject} ______ (${c.base}) ${c.object} for an hour before the bell rang.`,
                answer: c => `had been ${c.ing}`,
                exp: 'Past perfect continuous active: had been + -ing.'
            },
            passive: {
                chinese: c => `鐘聲響起前，${c.objectZh}已經一直由${c.subjectZh}${c.verbZh}一小時。`,
                question: c => `${capitalize(c.object)} ______ (${c.base}) for an hour before the bell rang.`,
                answer: c => `had been being ${c.pp}`,
                exp: 'Past perfect continuous passive: had been being + past participle.'
            }
        },
        simple_future: {
            active: {
                chinese: c => `我認為${c.subjectZh}明天午飯後會${c.verbZh}${c.objectZh}。`,
                question: c => `I think ${lowerFirst(c.subject)} ______ (${c.base}) ${c.object} after lunch tomorrow.`,
                answer: c => `will ${c.base}`,
                exp: 'Simple future active: prediction with I think -> will + base verb.'
            },
            passive: {
                chinese: c => `我預計${c.objectZh}明天午飯後會由${c.subjectZh}${c.verbZh}。`,
                question: c => `I expect ${c.object} ______ (${c.base}) after lunch tomorrow.`,
                answer: c => `will be ${c.pp}`,
                exp: 'Simple future passive: prediction with I expect -> will be + past participle.'
            }
        },
        future_continuous: {
            active: {
                chinese: c => `明天下午三時，${c.subjectZh}將會正在${c.verbZh}${c.objectZh}。`,
                question: c => `At three tomorrow afternoon, ${lowerFirst(c.subject)} ______ (${c.base}) ${c.object}.`,
                answer: c => `will be ${c.ing}`,
                exp: 'Future continuous active: will be + -ing.'
            },
            passive: {
                chinese: c => `明天下午三時，${c.objectZh}將會正在由${c.subjectZh}${c.verbZh}。`,
                question: c => `At three tomorrow afternoon, ${c.object} ______ (${c.base}).`,
                answer: c => `will be being ${c.pp}`,
                exp: 'Future continuous passive: will be being + past participle.'
            }
        },
        future_perfect: {
            active: {
                chinese: c => `到星期五，${c.subjectZh}將已經${c.verbZh}好${c.objectZh}。`,
                question: c => `By Friday, ${lowerFirst(c.subject)} ______ (${c.base}) ${c.object}.`,
                answer: c => `will have ${c.pp}`,
                exp: 'Future perfect active: will have + past participle.'
            },
            passive: {
                chinese: c => `到星期五，${c.objectZh}將已經由${c.subjectZh}${c.verbZh}好。`,
                question: c => `By Friday, ${c.object} ______ (${c.base}).`,
                answer: c => `will have been ${c.pp}`,
                exp: 'Future perfect passive: will have been + past participle.'
            }
        },
        future_perfect_continuous: {
            active: {
                chinese: c => `到星期五，${c.subjectZh}將已經持續${c.verbZh}${c.objectZh}一個月。`,
                question: c => `By Friday, ${lowerFirst(c.subject)} ______ (${c.base}) ${c.object} for a month.`,
                answer: c => `will have been ${c.ing}`,
                exp: 'Future perfect continuous active: will have been + -ing.'
            },
            passive: {
                chinese: c => `到星期五，${c.objectZh}將已經持續由${c.subjectZh}${c.verbZh}一個月。`,
                question: c => `By Friday, ${c.object} ______ (${c.base}) for a month.`,
                answer: c => `will have been being ${c.pp}`,
                exp: 'Future perfect continuous passive: will have been being + past participle.'
            }
        }
    };

    function capitalize(value) {
        const text = String(value || '');
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    function lowerFirst(value) {
        const text = String(value || '');
        return text.charAt(0).toLowerCase() + text.slice(1);
    }

    const bank = Array.isArray(root.GRAMMAR_TENSE_BANK) ? root.GRAMMAR_TENSE_BANK : [];
    let index = 1;
    Object.entries(tenseTemplates).forEach(([tense, voices]) => {
        Object.entries(voices).forEach(([voice, template]) => {
            contexts.forEach((context) => {
                bank.push({
                    id: `TENSE_BOOST_${String(index).padStart(3, '0')}`,
                    tense,
                    voice,
                    chinese: template.chinese(context),
                    question: template.question(context),
                    answers: [template.answer(context)],
                    exp: template.exp
                });
                index += 1;
            });
        });
    });
    root.GRAMMAR_TENSE_BANK = bank;
})(typeof window !== 'undefined' ? window : globalThis);
