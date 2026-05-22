// Reported Speech rearrange questions for Battleship grammar mode.
// Keep this data file declarative; gameplay lives in ui-grammar.js.
(function () {
    window.GRAMMAR_REPORTED_SPEECH_RULES = {
        statement_tense: "Reported statement: 一般考試要求時態 backshift，例如 am/is/are -> was/were, simple past / present perfect -> past perfect。",
        statement_time: "Time / place change: now -> then, today -> that day, yesterday -> the day before, tomorrow -> the next/following day, here -> there, this -> that。",
        statement_modal: "Modal change: will -> would, can -> could, may -> might, must / have to -> had to。",
        question_wh: "Reported WH-question: 保留 wh-word，但改回直述句語序，不用 do/does/did 倒裝。",
        question_if: "Reported yes/no question: 用 if，之後用直述句語序，並按需要 backshift。",
        order_to: "Reported order/request: told/asked/advised/reminded + object + to + base verb。",
        order_not_to: "Negative order: told/asked/warned/advised + object + not to + base verb。",
        suggestion: "Suggestion: suggested + gerund，或 suggested that + subject + should + base verb。"
    };

    const rows = [
        ["statement", "statement_tense", "改成 reported statement（不用 that）：'I am tired,' Mary said.", "Mary said she was tired .", ["am", "is", "that"]],
        ["statement", "statement_tense", "改成 reported statement（不用 that）：'I live near the station,' Peter said.", "Peter said he lived near the station .", ["live", "lives", "has"]],
        ["statement", "statement_tense", "改成 reported statement（不用 that）：'We are watching a documentary,' Amy said.", "Amy said they were watching a documentary .", ["are", "watch", "watched"]],
        ["statement", "statement_tense", "改成 reported statement（不用 that）：'Tom is fixing the printer,' Helen said.", "Helen said Tom was fixing the printer .", ["is", "fixed", "fixes"]],
        ["statement", "statement_tense", "改成 reported statement（不用 that）：'I bought a new charger,' John said.", "John said he had bought a new charger .", ["bought", "has", "buy"]],
        ["statement", "statement_tense", "改成 reported statement（不用 that）：'We finished the worksheet,' the students said.", "The students said they had finished the worksheet .", ["finished", "have", "finish"]],
        ["statement", "statement_tense", "改成 reported statement（不用 that）：'I have lost my octopus card,' Kenny said.", "Kenny said he had lost his octopus card .", ["have", "has", "lost"]],
        ["statement", "statement_tense", "改成 reported statement（不用 that）：'My sister has joined the school choir,' Chris said.", "Chris said his sister had joined the school choir .", ["has", "join", "joins"]],
        ["statement", "statement_tense", "改成 reported statement（不用 that）：'I was doing my homework,' Daisy said.", "Daisy said she had been doing her homework .", ["was", "did", "doing"]],
        ["statement", "statement_tense", "改成 reported statement（不用 that）：'They were waiting outside the hall,' Miss Lee said.", "Miss Lee said they had been waiting outside the hall .", ["were", "waited", "are"]],
        ["statement", "statement_modal", "改成 reported statement（不用 that）：'I will call you later,' Grace said.", "Grace said she would call me later .", ["will", "called", "you"]],
        ["statement", "statement_modal", "改成 reported statement（不用 that）：'We can solve the problem,' the boys said.", "The boys said they could solve the problem .", ["can", "solved", "would"]],
        ["statement", "statement_modal", "改成 reported statement（不用 that）：'I may join the drama club,' Chloe said.", "Chloe said she might join the drama club .", ["may", "join", "can"]],
        ["statement", "statement_modal", "改成 reported statement（不用 that）：'We must hand in the report today,' Jason said.", "Jason said they had to hand in the report that day .", ["must", "have", "today"]],
        ["statement", "statement_modal", "改成 reported statement（不用 that）：'I have to revise for the test,' Ryan said.", "Ryan said he had to revise for the test .", ["have", "has", "revised"]],
        ["statement", "statement_time", "改成 reported statement（不用 that）：'I am leaving now,' Tom said.", "Tom said he was leaving then .", ["now", "left", "is"]],
        ["statement", "statement_time", "改成 reported statement（不用 that）：'I saw Mr Wong here yesterday,' she said.", "She said she had seen Mr Wong there the day before .", ["saw", "here", "yesterday"]],
        ["statement", "statement_time", "改成 reported statement（不用 that）：'We will visit the museum tomorrow,' Ben said.", "Ben said they would visit the museum the next day .", ["will", "tomorrow", "visited"]],
        ["statement", "statement_time", "改成 reported statement（不用 that）：'I am busy today,' Fiona said.", "Fiona said she was busy that day .", ["today", "is", "am"]],
        ["statement", "statement_time", "改成 reported statement（不用 that）：'We bought these tickets last week,' they said.", "They said they had bought those tickets the previous week .", ["these", "last", "bought"]],
        ["statement", "statement_time", "改成 reported statement（不用 that）：'I will finish this tonight,' Lily promised.", "Lily promised she would finish that that night .", ["this", "tonight", "will"]],
        ["statement", "statement_time", "改成 reported statement（不用 that）：'We moved here three years ago,' the twins said.", "The twins said they had moved there three years before .", ["here", "ago", "moved"]],
        ["statement", "statement_tense", "改成 reported statement（不用 that）：'My father works in Central,' Mark said.", "Mark said his father worked in Central .", ["my", "works", "work"]],
        ["statement", "statement_tense", "改成 reported statement（不用 that）：'I don't like horror films,' Jeff said.", "Jeff said he did not like horror films .", ["don't", "doesn't", "liked"]],
        ["statement", "statement_tense", "改成 reported statement（不用 that）：'This laptop is too expensive,' Kate said.", "Kate said that laptop was too expensive .", ["this", "is", "these"]],
        ["statement", "statement_tense", "改成 reported statement（不用 that）：'Our class teacher is very patient,' Doris said.", "Doris said their class teacher was very patient .", ["our", "is", "are"]],
        ["statement", "statement_tense", "改成 reported statement（不用 that）：'I have never tried Korean food,' Joan said.", "Joan said she had never tried Korean food .", ["have", "has", "try"]],
        ["statement", "statement_tense", "改成 reported statement（不用 that）：'My brother is studying abroad,' Maurice said.", "Maurice said his brother was studying abroad .", ["my", "is", "studies"]],
        ["statement", "statement_tense", "改成 reported statement（不用 that）：'The bus arrives at eight,' the guide said.", "The guide said the bus arrived at eight .", ["arrives", "arrive", "had"]],
        ["statement", "statement_tense", "改成 reported statement（不用 that）：'I did not break the window,' Alan said.", "Alan said he had not broken the window .", ["did", "break", "broke"]],
        ["statement", "statement_modal", "改成 reported statement（不用 that）：'You need to submit your project next Monday,' Miss Chan said.", "Miss Chan said we needed to submit our project the following Monday .", ["need", "your", "next"]],
        ["statement", "statement_modal", "改成 reported statement（不用 that）：'I cannot open this file,' Fiona said.", "Fiona said she could not open that file .", ["cannot", "this", "opened"]],
        ["statement", "statement_modal", "改成 reported statement（不用 that）：'We shall discuss the plan tomorrow,' Mr Ho said.", "Mr Ho said they would discuss the plan the next day .", ["shall", "tomorrow", "discussed"]],
        ["statement", "statement_time", "改成 reported statement（不用 that）：'It rained heavily yesterday,' John's mother said.", "John's mother said it had rained heavily the day before .", ["rained", "yesterday", "has"]],
        ["statement", "statement_tense", "改成 reported statement（不用 that）：'I think it was a waste of money,' Gordon said.", "Gordon said he thought it had been a waste of money .", ["think", "was", "is"]],
        ["statement", "statement_tense", "改成 reported statement（不用 that）：'It was beautiful,' Gordon replied.", "Gordon replied it had been beautiful .", ["was", "is", "been"]],
        ["statement", "statement_tense", "改成 reported statement（不用 that）：'The school library closes at six,' the librarian said.", "The librarian said the school library closed at six .", ["closes", "close", "closing"]],
        ["statement", "statement_tense", "改成 reported statement（不用 that）：'I have already sent the email,' Rachel said.", "Rachel said she had already sent the email .", ["have", "sent", "sends"]],
        ["statement", "statement_tense", "改成 reported statement（不用 that）：'We are preparing for Sports Day,' the prefects said.", "The prefects said they were preparing for Sports Day .", ["are", "prepared", "prepare"]],
        ["statement", "statement_tense", "改成 reported statement（不用 that）：'My parents went to Macau last month,' Ivan said.", "Ivan said his parents had gone to Macau the previous month .", ["went", "last", "go"]],
        ["statement", "statement_modal", "改成 reported statement（不用 that）：'I will not be late again,' Aaron promised.", "Aaron promised he would not be late again .", ["will", "was", "late"]],
        ["statement", "statement_modal", "改成 reported statement（不用 that）：'The team can win the final,' the coach said.", "The coach said the team could win the final .", ["can", "wins", "won"]],
        ["statement", "statement_time", "改成 reported statement（不用 that）：'I met Susan at this cafe yesterday,' Henry said.", "Henry said he had met Susan at that cafe the day before .", ["met", "this", "yesterday"]],
        ["statement", "statement_time", "改成 reported statement（不用 that）：'We are going to practise here after school,' the girls said.", "The girls said they were going to practise there after school .", ["here", "are", "practised"]],
        ["statement", "statement_time", "改成 reported statement（不用 that）：'I will bring these books tomorrow,' Natalie said.", "Natalie said she would bring those books the next day .", ["these", "tomorrow", "brought"]],
        ["statement", "statement_tense", "改成 reported statement（不用 that）：'The baby is sleeping upstairs,' Aunt May said.", "Aunt May said the baby was sleeping upstairs .", ["is", "sleeps", "slept"]],
        ["statement", "statement_tense", "改成 reported statement（不用 that）：'I left my wallet in the classroom,' Oscar said.", "Oscar said he had left his wallet in the classroom .", ["left", "leave", "has"]],
        ["statement", "statement_tense", "改成 reported statement（不用 that）：'We have cleaned the noticeboard,' the monitors said.", "The monitors said they had cleaned the noticeboard .", ["have", "clean", "cleaning"]],
        ["statement", "statement_modal", "改成 reported statement（不用 that）：'Students must wear PE uniform tomorrow,' the teacher said.", "The teacher said students had to wear PE uniform the next day .", ["must", "tomorrow", "wore"]],
        ["statement", "statement_time", "改成 reported statement（不用 that）：'I am meeting my cousin this evening,' Bella said.", "Bella said she was meeting her cousin that evening .", ["this", "evening", "meet"]],

        ["question", "question_wh", "改成 reported question（不用倒裝）：'Where do you live?' Kate asked Henry.", "Kate asked Henry where he lived .", ["do", "does", "live"]],
        ["question", "question_if", "改成 reported yes/no question（用 if）：'Are you a student?' the shop assistant asked me.", "The shop assistant asked me if I was a student .", ["are", "am", "were"]],
        ["question", "question_if", "改成 reported yes/no question（用 if）：'Did you see my keys?' my sister asked me.", "My sister asked me if I had seen her keys .", ["did", "saw", "see"]],
        ["question", "question_wh", "改成 reported question（不用倒裝）：'What is the secret of your success?' Gordon asked Joe.", "Gordon asked Joe what the secret of his success was .", ["is", "your", "were"]],
        ["question", "question_wh", "改成 reported question（不用倒裝）：'How can I improve my writing?' Gordon asked.", "Gordon asked how he could improve his writing .", ["can", "do", "improved"]],
        ["question", "question_if", "改成 reported yes/no question（用 if）：'Does it work?' Gordon asked Joe.", "Gordon asked Joe if it worked .", ["does", "works", "work"]],
        ["question", "question_wh", "改成 reported question（不用倒裝）：'When can I have the CD?' Gordon asked Joe.", "Gordon asked Joe when he could have the CD .", ["can", "had", "has"]],
        ["question", "question_wh", "改成 reported question（不用倒裝）：'How did you like the music?' Joe asked Gordon.", "Joe asked Gordon how he had liked the music .", ["did", "like", "liked"]],
        ["question", "question_if", "改成 reported yes/no question（用 if）：'Do you feel different?' Joe asked Gordon.", "Joe asked Gordon if he felt different .", ["do", "feel", "felt"]],
        ["question", "question_if", "改成 reported yes/no question（用 if）：'Will you come tomorrow?' she asked me.", "She asked me if I would go the next day .", ["will", "come", "tomorrow"]],
        ["question", "question_if", "改成 reported yes/no question（用 if）：'Did you see Tom last week?' he asked me.", "He asked me if I had seen Tom the previous week .", ["did", "last", "saw"]],
        ["question", "question_if", "改成 reported yes/no question（用 if）：'Are you staying here?' he asked me.", "He asked me if I was staying there .", ["are", "here", "stayed"]],
        ["question", "question_wh", "改成 reported question（不用倒裝）：'What are you doing tonight?' she asked me.", "She asked me what I was doing that night .", ["are", "tonight", "do"]],
        ["question", "question_if", "改成 reported yes/no question（用 if）：'Is this your book?' he asked me.", "He asked me if that was my book .", ["is", "this", "your"]],
        ["question", "question_if", "改成 reported yes/no question（用 if）：'Will you go next week?' she asked me.", "She asked me if I would go the following week .", ["will", "next", "went"]],
        ["question", "question_if", "改成 reported yes/no question（用 if）：'Did you arrive yesterday?' he asked me.", "He asked me if I had arrived the day before .", ["did", "arrive", "yesterday"]],
        ["question", "question_wh", "改成 reported question（不用倒裝）：'What will you do this Sunday, Lea?' Mr Chan asked.", "Mr Chan asked Lea what she would do that Sunday .", ["will", "this", "did"]],
        ["question", "question_wh", "改成 reported question（不用倒裝）：'Where did you put the keys, Grace?' Miss Leung asked.", "Miss Leung asked Grace where she had put the keys .", ["did", "put", "puts"]],
        ["question", "question_if", "改成 reported yes/no question（用 if）：'Do you know how to get to the shop?' Peggy asked Kate.", "Peggy asked Kate if she knew how to get to the shop .", ["do", "know", "knows"]],
        ["question", "question_wh", "改成 reported question（不用倒裝）：'Who sent you flowers?' Susan asked Jessica.", "Susan asked Jessica who had sent her flowers .", ["has", "send", "you"]],
        ["question", "question_if", "改成 reported yes/no question（用 if）：'Will you visit me this Sunday?' Grandma asked me.", "Grandma asked me if I would visit her that Sunday .", ["will", "this", "me"]],
        ["question", "question_wh", "改成 reported question（不用倒裝）：'Why are you crying?' Mum asked me.", "Mum asked me why I was crying .", ["are", "am", "cry"]],
        ["question", "question_if", "改成 reported yes/no question（用 if）：'Have you finished?' the teacher asked me.", "The teacher asked me if I had finished .", ["have", "did", "finish"]],
        ["question", "question_wh", "改成 reported question（不用倒裝）：'How much money did you spend?' Dad asked me.", "Dad asked me how much money I had spent .", ["did", "spend", "spent"]],
        ["question", "question_wh", "改成 reported question（不用倒裝）：'Which bus should we take?' Amy asked.", "Amy asked which bus they should take .", ["should", "took", "do"]],
        ["question", "question_wh", "改成 reported question（不用倒裝）：'Why can China produce so many items?' Tim asked.", "Tim asked why China could produce so many items .", ["can", "produces", "did"]],
        ["question", "question_if", "改成 reported yes/no question（用 if）：'Can you lend me your ruler?' Helen asked me.", "Helen asked me if I could lend her my ruler .", ["can", "you", "your"]],
        ["question", "question_if", "改成 reported yes/no question（用 if）：'May I leave early?' the student asked.", "The student asked if he might leave early .", ["may", "left", "can"]],
        ["question", "question_wh", "改成 reported question（不用倒裝）：'When did the lesson start?' Ben asked.", "Ben asked when the lesson had started .", ["did", "start", "starts"]],
        ["question", "question_wh", "改成 reported question（不用倒裝）：'Where are they playing basketball?' Sally asked.", "Sally asked where they were playing basketball .", ["are", "play", "played"]],
        ["question", "question_if", "改成 reported yes/no question（用 if）：'Has Peter submitted the form?' Miss Ho asked.", "Miss Ho asked if Peter had submitted the form .", ["has", "submit", "submits"]],
        ["question", "question_if", "改成 reported yes/no question（用 if）：'Were you waiting outside?' the guard asked me.", "The guard asked me if I had been waiting outside .", ["were", "was", "waited"]],
        ["question", "question_wh", "改成 reported question（不用倒裝）：'What time does the train leave?' Leo asked.", "Leo asked what time the train left .", ["does", "leave", "leaves"]],
        ["question", "question_if", "改成 reported yes/no question（用 if）：'Do your parents allow you to play games?' Chris asked me.", "Chris asked me if my parents allowed me to play games .", ["do", "your", "allow"]],
        ["question", "question_wh", "改成 reported question（不用倒裝）：'How long have you lived here?' the officer asked her.", "The officer asked her how long she had lived there .", ["have", "here", "lives"]],
        ["question", "question_wh", "改成 reported question（不用倒裝）：'Why did the computer stop working?' Ivan asked.", "Ivan asked why the computer had stopped working .", ["did", "stop", "stops"]],
        ["question", "question_if", "改成 reported yes/no question（用 if）：'Are these seats free?' the tourists asked.", "The tourists asked if those seats were free .", ["are", "these", "was"]],
        ["question", "question_if", "改成 reported yes/no question（用 if）：'Will the library open tomorrow?' Natalie asked.", "Natalie asked if the library would open the next day .", ["will", "tomorrow", "opened"]],
        ["question", "question_wh", "改成 reported question（不用倒裝）：'What did you eat for breakfast?' Mum asked me.", "Mum asked me what I had eaten for breakfast .", ["did", "eat", "ate"]],
        ["question", "question_wh", "改成 reported question（不用倒裝）：'Where has Jason gone?' the teacher asked.", "The teacher asked where Jason had gone .", ["has", "went", "go"]],
        ["question", "question_if", "改成 reported yes/no question（用 if）：'Is your brother joining the trip?' Mandy asked me.", "Mandy asked me if my brother was joining the trip .", ["is", "your", "joins"]],
        ["question", "question_wh", "改成 reported question（不用倒裝）：'Why were you absent yesterday?' Miss Chan asked Alex.", "Miss Chan asked Alex why he had been absent the day before .", ["were", "yesterday", "was"]],
        ["question", "question_wh", "改成 reported question（不用倒裝）：'How often do you practise piano?' Clara asked me.", "Clara asked me how often I practised piano .", ["do", "practise", "practises"]],
        ["question", "question_if", "改成 reported yes/no question（用 if）：'Could you help me after school?' Ryan asked me.", "Ryan asked me if I could help him after school .", ["could", "me", "helped"]],
        ["question", "question_wh", "改成 reported question（不用倒裝）：'Who is responsible for the poster?' the monitor asked.", "The monitor asked who was responsible for the poster .", ["is", "does", "were"]],
        ["question", "question_if", "改成 reported yes/no question（用 if）：'Did the boys clean the classroom?' Mr Lee asked.", "Mr Lee asked if the boys had cleaned the classroom .", ["did", "clean", "cleaned"]],
        ["question", "question_wh", "改成 reported question（不用倒裝）：'What should we bring tomorrow?' the scouts asked.", "The scouts asked what they should bring the next day .", ["should", "tomorrow", "brought"]],
        ["question", "question_if", "改成 reported yes/no question（用 if）：'Have they ever been to Korea?' Ivy asked.", "Ivy asked if they had ever been to Korea .", ["have", "has", "were"]],
        ["question", "question_wh", "改成 reported question（不用倒裝）：'Why must students queue up here?' the principal asked.", "The principal asked why students had to queue up there .", ["must", "here", "queued"]],
        ["question", "question_if", "改成 reported yes/no question（用 if）：'Was the film interesting?' Anna asked Peter.", "Anna asked Peter if the film had been interesting .", ["was", "is", "been"]],

        ["order", "order_to", "改成 reported order/request（用 to）：'Please wake me up at five,' Kathy asked her mum.", "Kathy asked her mum to wake her up at five .", ["woke", "me", "that"]],
        ["order", "order_not_to", "改成 reported order/request（用 not to）：'Don't open the door,' Mrs Cheung warned her daughter.", "Mrs Cheung warned her daughter not to open the door .", ["don't", "opened", "that"]],
        ["order", "suggestion", "改成 reported suggestion（用 gerund）：'Let's go for a swim,' Lily suggested.", "Lily suggested going for a swim .", ["to", "go", "went"]],
        ["order", "order_to", "改成 reported order/request（用 to）：'Please sign here,' the clerk said to me.", "The clerk asked me to sign there .", ["signed", "here", "that"]],
        ["order", "order_not_to", "改成 reported order/request（用 not to）：'Don't touch that switch,' Mum warned me.", "Mum warned me not to touch that switch .", ["don't", "touched", "to"]],
        ["order", "order_to", "改成 reported order/request（用 to）：'You should listen to Mozart,' Joe advised Gordon.", "Joe advised Gordon to listen to Mozart .", ["should", "listened", "that"]],
        ["order", "order_to", "改成 reported order/request（用 to）：'Give me $500,' Joe asked Gordon.", "Joe asked Gordon to give him $500 .", ["gave", "me", "that"]],
        ["order", "order_to", "改成 reported order/request（用 to）：'Meet me here at the same time tomorrow,' Joe told Gordon.", "Joe told Gordon to meet him there at the same time the next day .", ["met", "here", "tomorrow"]],
        ["order", "order_to", "改成 reported order/request（用 to）：'Please turn off the TV for me,' Joe's grandma said.", "Joe's grandma asked him to turn off the TV for her .", ["turned", "me", "that"]],
        ["order", "order_to", "改成 reported order/request（用 to）：'Stop writing now, class,' the teacher said.", "The teacher told the class to stop writing then .", ["stopped", "now", "that"]],
        ["order", "order_not_to", "改成 reported order/request（用 not to）：'Don't eat too much chocolate,' Janet said to Alan.", "Janet advised Alan not to eat too much chocolate .", ["don't", "ate", "eating"]],
        ["order", "order_not_to", "改成 reported order/request（用 not to）：'Don't skip your breakfast,' Matt's father said.", "Matt's father told his son not to skip his breakfast .", ["don't", "skipped", "your"]],
        ["order", "order_to", "改成 reported order/request（用 to）：'Put the box here,' he told me.", "He told me to put the box there .", ["here", "this", "put"]],
        ["order", "order_to", "改成 reported order/request（用 to）：'Do it now!' she ordered him.", "She ordered him to do it then .", ["now", "did", "that"]],
        ["order", "order_not_to", "改成 reported order/request（用 not to）：'Don't come this evening,' he warned us.", "He warned us not to go that evening .", ["this", "tonight", "come"]],
        ["order", "order_to", "改成 reported order/request（用 to）：'Sign this paper,' she asked him.", "She asked him to sign that paper .", ["this", "the", "signed"]],
        ["order", "order_to", "改成 reported order/request（用 to）：'Come tomorrow,' she asked him.", "She asked him to go the next day .", ["tomorrow", "come", "went"]],
        ["order", "order_not_to", "改成 reported order/request（用 not to）：'Don't wait until next month,' he advised me.", "He advised me not to wait until the following month .", ["next", "month", "waited"]],
        ["order", "order_to", "改成 reported order/request（用 to）：'Be careful,' the teacher said to us.", "The teacher told us to be careful .", ["that", "were", "being"]],
        ["order", "order_to", "改成 reported order/request（用 to）：'Please close the windows,' Miss Ho said to the monitor.", "Miss Ho asked the monitor to close the windows .", ["closed", "that", "closing"]],
        ["order", "order_to", "改成 reported order/request（用 to）：'Hand in your homework before lunch,' Mr Chan told us.", "Mr Chan told us to hand in our homework before lunch .", ["your", "handed", "that"]],
        ["order", "order_not_to", "改成 reported order/request（用 not to）：'Don't run in the corridor,' the prefect warned the boys.", "The prefect warned the boys not to run in the corridor .", ["don't", "ran", "running"]],
        ["order", "order_to", "改成 reported order/request（用 to）：'Please lend me your notes,' Mandy asked Grace.", "Mandy asked Grace to lend her her notes .", ["me", "your", "lent"]],
        ["order", "order_to", "改成 reported order/request（用 to）：'Read the instructions carefully,' the coach told the players.", "The coach told the players to read the instructions carefully .", ["readed", "that", "reading"]],
        ["order", "order_not_to", "改成 reported order/request（用 not to）：'Don't forget your student card,' Mum reminded me.", "Mum reminded me not to forget my student card .", ["don't", "your", "forgot"]],
        ["order", "order_to", "改成 reported order/request（用 to）：'Please wait outside the office,' the secretary said to us.", "The secretary asked us to wait outside the office .", ["waited", "that", "waiting"]],
        ["order", "order_to", "改成 reported order/request（用 to）：'Call me when you arrive,' Dad told Jane.", "Dad told Jane to call him when she arrived .", ["me", "you", "arrive"]],
        ["order", "order_not_to", "改成 reported order/request（用 not to）：'Don't use your phone during the lesson,' Miss Lee warned Tom.", "Miss Lee warned Tom not to use his phone during the lesson .", ["don't", "your", "used"]],
        ["order", "order_to", "改成 reported order/request（用 to）：'Please bring your PE uniform tomorrow,' the teacher told us.", "The teacher told us to bring our PE uniform the next day .", ["your", "tomorrow", "brought"]],
        ["order", "order_to", "改成 reported order/request（用 to）：'Keep the receipt,' the shopkeeper advised Helen.", "The shopkeeper advised Helen to keep the receipt .", ["kept", "that", "keeping"]],
        ["order", "order_not_to", "改成 reported order/request（用 not to）：'Don't be late again,' the coach warned Aaron.", "The coach warned Aaron not to be late again .", ["don't", "was", "being"]],
        ["order", "order_to", "改成 reported order/request（用 to）：'Please explain the answer,' Leo asked the teacher.", "Leo asked the teacher to explain the answer .", ["explained", "that", "explaining"]],
        ["order", "order_to", "改成 reported order/request（用 to）：'Wash your hands before dinner,' Mum told the children.", "Mum told the children to wash their hands before dinner .", ["your", "washed", "that"]],
        ["order", "order_not_to", "改成 reported order/request（用 not to）：'Don't make so much noise,' the librarian told the students.", "The librarian told the students not to make so much noise .", ["don't", "made", "that"]],
        ["order", "suggestion", "改成 reported suggestion（用 gerund）：'Let's take a taxi,' Dad suggested.", "Dad suggested taking a taxi .", ["to", "take", "took"]],
        ["order", "suggestion", "改成 reported suggestion（用 gerund）：'Let's revise together after school,' Clara suggested.", "Clara suggested revising together after school .", ["to", "revise", "revised"]],
        ["order", "order_to", "改成 reported order/request（用 to）：'Please send the file tonight,' Rachel asked Ivan.", "Rachel asked Ivan to send the file that night .", ["tonight", "sent", "that"]],
        ["order", "order_not_to", "改成 reported order/request（用 not to）：'Don't tell anyone the password,' Ben warned me.", "Ben warned me not to tell anyone the password .", ["don't", "told", "that"]],
        ["order", "order_to", "改成 reported order/request（用 to）：'Show your ticket at the gate,' the guard told Peter.", "The guard told Peter to show his ticket at the gate .", ["your", "showed", "that"]],
        ["order", "order_to", "改成 reported order/request（用 to）：'Please help your sister with Maths,' Mum asked Chris.", "Mum asked Chris to help his sister with Maths .", ["your", "helped", "that"]],
        ["order", "order_not_to", "改成 reported order/request（用 not to）：'Don't leave your bag here,' the driver told Sally.", "The driver told Sally not to leave her bag there .", ["your", "here", "left"]],
        ["order", "order_to", "改成 reported order/request（用 to）：'Turn down the volume now,' my brother told me.", "My brother told me to turn down the volume then .", ["now", "turned", "that"]],
        ["order", "order_to", "改成 reported order/request（用 to）：'Please pay attention to the diagram,' the science teacher said.", "The science teacher told us to pay attention to the diagram .", ["paid", "that", "paying"]],
        ["order", "order_not_to", "改成 reported order/request（用 not to）：'Don't cross the road here,' the policeman warned us.", "The policeman warned us not to cross the road there .", ["here", "crossed", "don't"]],
        ["order", "order_to", "改成 reported order/request（用 to）：'Please collect the worksheets after class,' Miss Wong asked David.", "Miss Wong asked David to collect the worksheets after class .", ["collected", "that", "collecting"]],
        ["order", "order_to", "改成 reported order/request（用 to）：'Open your books to page twenty,' the teacher told the class.", "The teacher told the class to open their books to page twenty .", ["your", "opened", "that"]],
        ["order", "order_not_to", "改成 reported order/request（用 not to）：'Don't spend all your pocket money,' Dad advised Tim.", "Dad advised Tim not to spend all his pocket money .", ["your", "spent", "don't"]],
        ["order", "order_to", "改成 reported order/request（用 to）：'Please check the timetable online,' Nancy asked me.", "Nancy asked me to check the timetable online .", ["checked", "that", "checking"]],
        ["order", "order_to", "改成 reported order/request（用 to）：'Bring the umbrella with you,' Grandma told me.", "Grandma told me to bring the umbrella with me .", ["you", "brought", "that"]],
        ["order", "order_not_to", "改成 reported order/request（用 not to）：'Don't play near the lift,' the security guard told the children.", "The security guard told the children not to play near the lift .", ["don't", "played", "that"]]
    ];

    function normalizeDirectSpeechText(value) {
        const text = String(value || '').trim();
        if (!text) return '';
        return text.replace(/,\s*$/, '.');
    }

    function cleanReporterText(value) {
        return String(value || '')
            .trim()
            .replace(/[.?!]\s*$/, '')
            .trim();
    }

    function capitalizePromptSpeaker(value) {
        const text = String(value || '').trim();
        if (!text) return '';
        return text.replace(/^[a-z]/, char => char.toUpperCase());
    }

    function parseReporterParts(reporterText) {
        const reporter = cleanReporterText(reporterText);
        if (!reporter) return { speaker: '', target: '' };

        let match = reporter.match(/^(.+?)\s+said\s+to\s+(.+)$/i);
        if (match) {
            return {
                speaker: capitalizePromptSpeaker(match[1]),
                target: String(match[2] || '').trim()
            };
        }

        match = reporter.match(/^(.+?)\s+(asked|told|warned|advised|reminded|ordered)\s+(.+)$/i);
        if (match) {
            return {
                speaker: capitalizePromptSpeaker(match[1]),
                target: String(match[3] || '').trim()
            };
        }

        match = reporter.match(/^(.+?)\s+(said|suggested|promised|replied)$/i);
        if (match) {
            return {
                speaker: capitalizePromptSpeaker(match[1]),
                target: ''
            };
        }

        return {
            speaker: capitalizePromptSpeaker(reporter),
            target: ''
        };
    }

    function formatReportedSpeechPrompt(sourcePrompt) {
        const text = String(sourcePrompt || '').trim();
        const match = text.match(/：'([^']+)'\s*(.*)$/u);
        if (!match) return text;

        const directSpeech = normalizeDirectSpeechText(match[1]);
        const { speaker, target } = parseReporterParts(match[2]);
        if (!speaker) return directSpeech;
        return `${speaker}${target ? ` -> ${target}` : ''}：${directSpeech}`;
    }

    function inferIntrinsicTokens(sourcePrompt) {
        const match = String(sourcePrompt || '').match(/：'[^']+'\s*(.*)$/u);
        const reporter = cleanReporterText(match ? match[1] : '');
        const tokens = new Set();
        reporter.replace(/[A-Za-z][A-Za-z'’.-]*/g, token => {
            if (/[A-Z]/.test(token)) tokens.add(token);
            return token;
        });
        return Array.from(tokens);
    }

    function tokenizeAnswer(answer) {
        return String(answer || '').trim().split(/\s+/).filter(Boolean);
    }

    window.GRAMMAR_REPORTED_SPEECH_BANK = rows.map((row, index) => {
        const [type, rule, chinese, answer, distractors] = row;
        return {
            id: `reported_speech_${String(index + 1).padStart(3, '0')}`,
            type,
            rule,
            chinese: formatReportedSpeechPrompt(chinese),
            source_prompt: chinese,
            correct_tokens: tokenizeAnswer(answer),
            intrinsic_tokens: inferIntrinsicTokens(chinese),
            distractors: Array.isArray(distractors) ? distractors : []
        };
    });
})();
