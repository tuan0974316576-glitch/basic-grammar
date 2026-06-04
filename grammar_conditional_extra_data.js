// Extra obvious conditional drills. Gameplay lives in ui-grammar.js.
(function () {
    const extraQuestions = [
        {
            "id": "conditional_081",
            "rule": "0",
            "type": "0",
            "chinese": "顏色規律：如果你把黃色和藍色混合，你會得到綠色。",
            "correct_tokens": ["If","you","mix","yellow","and","blue",",","you","get","green","."],
            "distractors": ["will","would","mixed","got"]
        },
        {
            "id": "conditional_082",
            "rule": "0",
            "type": "0",
            "chinese": "一般情況下，如果人們不喝水，他們會感到口渴。",
            "correct_tokens": ["If","people","do","not","drink","water",",","they","feel","thirsty","."],
            "distractors": ["will","would","drank","felt"]
        },
        {
            "id": "conditional_083",
            "rule": "0",
            "type": "0",
            "chinese": "一般情況下，如果學生每天練習，他們通常會進步。",
            "correct_tokens": ["If","students","practise","every","day",",","they","improve","."],
            "distractors": ["will","would","practised","improved"]
        },
        {
            "id": "conditional_084",
            "rule": "0",
            "type": "0",
            "chinese": "機器規律：如果電話沒有電池，它就會關機。",
            "correct_tokens": ["If","a","phone","has","no","battery",",","it","turns","off","."],
            "distractors": ["will","would","have","turned"]
        },
        {
            "id": "conditional_085",
            "rule": "0",
            "type": "0",
            "chinese": "自然規律：如果你加熱冰，冰會融化。",
            "correct_tokens": ["If","you","heat","ice",",","it","melts","."],
            "distractors": ["will","would","heated","melted"]
        },
        {
            "id": "conditional_086",
            "rule": "0",
            "type": "0",
            "chinese": "一般情況下，如果貓感到害怕，它們通常會逃走。",
            "correct_tokens": ["If","cats","are","scared",",","they","run","away","."],
            "distractors": ["will","would","were","ran"]
        },
        {
            "id": "conditional_087",
            "rule": "0",
            "type": "0",
            "chinese": "一般情況下，如果我太晚睡，第二天我會眼瞓。",
            "correct_tokens": ["If","I","stay","up","late",",","I","feel","sleepy","the","next","day","."],
            "distractors": ["will","would","stayed","felt"]
        },
        {
            "id": "conditional_088",
            "rule": "0",
            "type": "0",
            "chinese": "一般情況下，如果巴士滿座，乘客會等下一班。",
            "correct_tokens": ["If","buses","are","full",",","passengers","wait","for","the","next","one","."],
            "distractors": ["will","would","were","waited"]
        },
        {
            "id": "conditional_089",
            "rule": "0",
            "type": "0",
            "chinese": "日常規律：如果你在湯裡加鹽，湯會變鹹。",
            "correct_tokens": ["If","you","add","salt","to","soup",",","it","tastes","salty","."],
            "distractors": ["will","would","added","tasted"]
        },
        {
            "id": "conditional_090",
            "rule": "0",
            "type": "0",
            "chinese": "一般情況下，如果小朋友碰火，他們會受傷。",
            "correct_tokens": ["If","children","touch","fire",",","they","get","hurt","."],
            "distractors": ["will","would","touched","got"]
        },
        {
            "id": "conditional_091",
            "rule": "0",
            "type": "0",
            "chinese": "如果我的鬧鐘響，我就會醒來。",
            "correct_tokens": ["If","my","alarm","rings",",","I","wake","up","."],
            "distractors": ["will","would","rang","woke"]
        },
        {
            "id": "conditional_092",
            "rule": "0",
            "type": "0",
            "chinese": "一般情況下，如果人們吃得太快，他們有時會胃痛。",
            "correct_tokens": ["If","people","eat","too","quickly",",","they","sometimes","get","stomachaches","."],
            "distractors": ["will","would","ate","got"]
        },
        {
            "id": "conditional_093",
            "rule": "0",
            "type": "0",
            "chinese": "自然規律：如果夜晚天空清朗，我們可以看到星星。",
            "correct_tokens": ["If","the","sky","is","clear","at","night",",","we","can","see","stars","."],
            "distractors": ["will","would","was","saw"]
        },
        {
            "id": "conditional_094",
            "rule": "0",
            "type": "0",
            "chinese": "電腦規律：如果你按儲存，檔案會留在電腦裡。",
            "correct_tokens": ["If","you","press","save",",","the","file","stays","on","the","computer","."],
            "distractors": ["will","would","pressed","stayed"]
        },
        {
            "id": "conditional_095",
            "rule": "0",
            "type": "0",
            "chinese": "一般情況下，如果商店關門，顧客買不到東西。",
            "correct_tokens": ["If","a","shop","is","closed",",","customers","cannot","buy","anything","."],
            "distractors": ["will","would","was","bought"]
        },
        {
            "id": "conditional_096",
            "rule": "0",
            "type": "0",
            "chinese": "如果我不戴眼鏡，我看不清楚。",
            "correct_tokens": ["If","I","do","not","wear","glasses",",","I","cannot","see","clearly","."],
            "distractors": ["will","would","wore","saw"]
        },
        {
            "id": "conditional_097",
            "rule": "0",
            "type": "0",
            "chinese": "自然規律：如果植物得到陽光，它們會長得更好。",
            "correct_tokens": ["If","plants","receive","sunlight",",","they","grow","better","."],
            "distractors": ["will","would","received","grew"]
        },
        {
            "id": "conditional_098",
            "rule": "0",
            "type": "0",
            "chinese": "日常規律：如果牛奶放在外面太久，它會變壞。",
            "correct_tokens": ["If","milk","is","left","outside","for","too","long",",","it","goes","bad","."],
            "distractors": ["will","would","was","went"]
        },
        {
            "id": "conditional_099",
            "rule": "0",
            "type": "0",
            "chinese": "一般情況下，如果題目容易，學生會很快回答。",
            "correct_tokens": ["If","a","question","is","easy",",","students","answer","quickly","."],
            "distractors": ["will","would","was","answered"]
        },
        {
            "id": "conditional_100",
            "rule": "0",
            "type": "0",
            "chinese": "一般情況下，如果你在圖書館大聲說話，人們會投訴。",
            "correct_tokens": ["If","you","speak","loudly","in","a","library",",","people","complain","."],
            "distractors": ["will","would","spoke","complained"]
        },
        {
            "id": "conditional_101",
            "rule": "1",
            "type": "1",
            "chinese": "如果明天下雨，我們將會取消野餐。",
            "correct_tokens": ["If","it","rains","tomorrow",",","we","will","cancel","the","picnic","."],
            "distractors": ["would","rained","had","cancelled"]
        },
        {
            "id": "conditional_102",
            "rule": "1",
            "type": "1",
            "chinese": "如果你今晚完成家課，你將可以玩遊戲。",
            "correct_tokens": ["If","you","finish","your","homework","tonight",",","you","will","play","games","."],
            "distractors": ["would","finished","had","played"]
        },
        {
            "id": "conditional_103",
            "rule": "1",
            "type": "1",
            "chinese": "如果她今個星期更努力溫習，她會通過考試。",
            "correct_tokens": ["If","she","studies","harder","this","week",",","she","will","pass","the","exam","."],
            "distractors": ["would","studied","had","passed"]
        },
        {
            "id": "conditional_104",
            "rule": "1",
            "type": "1",
            "chinese": "如果今晚那班火車遲到，我會打電話給你。",
            "correct_tokens": ["If","the","train","arrives","late","tonight",",","I","will","call","you","."],
            "accepted": [["If","the","train","arrives","late",",","I","will","call","you","."]],
            "distractors": ["would","arrived","had","called"]
        },
        {
            "id": "conditional_105",
            "rule": "1",
            "type": "1",
            "chinese": "如果我們現在離開，我們將會趕上巴士。",
            "correct_tokens": ["If","we","leave","now",",","we","will","catch","the","bus","."],
            "distractors": ["would","left","had","caught"]
        },
        {
            "id": "conditional_106",
            "rule": "1",
            "type": "1",
            "chinese": "如果你明天不帶身份證，你將不能進入禮堂。",
            "correct_tokens": ["If","you","do","not","bring","your","ID","card","tomorrow",",","you","will","not","enter","the","hall","."],
            "distractors": ["would","brought","had","entered"]
        },
        {
            "id": "conditional_107",
            "rule": "1",
            "type": "1",
            "chinese": "如果他今天放學後道歉，她會原諒他。",
            "correct_tokens": ["If","he","apologises","after","school","today",",","she","will","forgive","him","."],
            "accepted": [["If","he","apologises","after","school",",","she","will","forgive","him","."]],
            "distractors": ["would","apologised","had","forgave"]
        },
        {
            "id": "conditional_108",
            "rule": "1",
            "type": "1",
            "chinese": "如果他們今晚贏得比賽，他們會慶祝。",
            "correct_tokens": ["If","they","win","the","match","tonight",",","they","will","celebrate","."],
            "distractors": ["would","won","had","celebrated"]
        },
        {
            "id": "conditional_109",
            "rule": "1",
            "type": "1",
            "chinese": "如果你今天有禮貌地問老師，她會幫你。",
            "correct_tokens": ["If","you","ask","the","teacher","politely","today",",","she","will","help","you","."],
            "accepted": [["If","you","ask","the","teacher","politely",",","she","will","help","you","."]],
            "distractors": ["would","asked","had","helped"]
        },
        {
            "id": "conditional_110",
            "rule": "1",
            "type": "1",
            "chinese": "如果今個星期日天氣晴朗，我們會去行山。",
            "correct_tokens": ["If","the","weather","is","sunny","this","Sunday",",","we","will","go","hiking","."],
            "distractors": ["would","was","had","went"]
        },
        {
            "id": "conditional_111",
            "rule": "1",
            "type": "1",
            "chinese": "如果我的父母今晚同意，我會參加旅行。",
            "correct_tokens": ["If","my","parents","agree","tonight",",","I","will","join","the","trip","."],
            "accepted": [["If","my","parents","agree",",","I","will","join","the","trip","."]],
            "distractors": ["would","agreed","had","joined"]
        },
        {
            "id": "conditional_112",
            "rule": "1",
            "type": "1",
            "chinese": "如果你今個月儲錢，你會買到禮物。",
            "correct_tokens": ["If","you","save","money","this","month",",","you","will","buy","a","gift","."],
            "distractors": ["would","saved","had","bought"]
        },
        {
            "id": "conditional_113",
            "rule": "1",
            "type": "1",
            "chinese": "如果電腦稍後再次當機，我會重新啟動它。",
            "correct_tokens": ["If","the","computer","crashes","again",",","I","will","restart","it","."],
            "distractors": ["would","crashed","had","restarted"]
        },
        {
            "id": "conditional_114",
            "rule": "1",
            "type": "1",
            "chinese": "如果她明天感覺好一點，她會回校。",
            "correct_tokens": ["If","she","feels","better","tomorrow",",","she","will","return","to","school","."],
            "distractors": ["would","felt","had","returned"]
        },
        {
            "id": "conditional_115",
            "rule": "1",
            "type": "1",
            "chinese": "如果我們現在不快點，我們會錯過電影。",
            "correct_tokens": ["If","we","do","not","hurry","now",",","we","will","miss","the","film","."],
            "accepted": [["If","we","do","not","hurry",",","we","will","miss","the","film","."]],
            "distractors": ["would","hurried","had","missed"]
        },
        {
            "id": "conditional_116",
            "rule": "1",
            "type": "1",
            "chinese": "如果你現在告訴我地址，我會寄包裹給你。",
            "correct_tokens": ["If","you","tell","me","the","address","now",",","I","will","send","the","parcel","."],
            "accepted": [["If","you","tell","me","the","address",",","I","will","send","the","parcel","."]],
            "distractors": ["would","told","had","sent"]
        },
        {
            "id": "conditional_117",
            "rule": "1",
            "type": "1",
            "chinese": "如果他下星期六有空，他會探望祖母。",
            "correct_tokens": ["If","he","is","free","next","Saturday",",","he","will","visit","his","grandmother","."],
            "distractors": ["would","was","had","visited"]
        },
        {
            "id": "conditional_118",
            "rule": "1",
            "type": "1",
            "chinese": "如果商店這個週末有折扣，我們會買新鞋。",
            "correct_tokens": ["If","the","shop","has","a","discount",",","we","will","buy","new","shoes","."],
            "distractors": ["would","had","bought","discounted"]
        },
        {
            "id": "conditional_119",
            "rule": "1",
            "type": "1",
            "chinese": "如果你今晚練習匯報，你明天會說得更有信心。",
            "correct_tokens": ["If","you","practise","the","presentation","tonight",",","you","will","speak","more","confidently","tomorrow","."],
            "accepted": [["If","you","practise","the","presentation","tonight",",","you","will","speak","more","confidently","."]],
            "distractors": ["would","practised","had","spoke"]
        },
        {
            "id": "conditional_120",
            "rule": "1",
            "type": "1",
            "chinese": "如果待會那班巴士太擠迫，我會乘港鐵。",
            "correct_tokens": ["If","the","bus","is","crowded",",","I","will","take","the","MTR","."],
            "distractors": ["would","was","had","took"]
        },
        {
            "id": "conditional_121",
            "rule": "2",
            "type": "2",
            "chinese": "可惜我不夠高；如果我更高，我會加入籃球隊。",
            "correct_tokens": ["If","I","were","taller",",","I","would","join","the","basketball","team","."],
            "distractors": ["am","will","joined","have"]
        },
        {
            "id": "conditional_122",
            "rule": "2",
            "type": "2",
            "chinese": "可惜她時間不夠；如果她有更多時間，她會讀更多書。",
            "correct_tokens": ["If","she","had","more","time",",","she","would","read","more","books","."],
            "distractors": ["has","will","reads","have"]
        },
        {
            "id": "conditional_123",
            "rule": "2",
            "type": "2",
            "chinese": "可惜我們不住近學校；如果我們住近學校，我們會步行上學。",
            "correct_tokens": ["If","we","lived","near","school",",","we","would","walk","there","."],
            "distractors": ["live","will","walked","have"]
        },
        {
            "id": "conditional_124",
            "rule": "2",
            "type": "2",
            "chinese": "可惜他不知道密碼；如果他知道密碼，他會打開檔案。",
            "correct_tokens": ["If","he","knew","the","password",",","he","would","open","the","file","."],
            "distractors": ["knows","will","opened","has"]
        },
        {
            "id": "conditional_125",
            "rule": "2",
            "type": "2",
            "chinese": "純粹假設：如果我很富有，我會幫助貧窮家庭。",
            "correct_tokens": ["If","I","were","rich",",","I","would","help","poor","families","."],
            "distractors": ["am","will","helped","have"]
        },
        {
            "id": "conditional_126",
            "rule": "2",
            "type": "2",
            "chinese": "如果你現在說慢一點，我會明白你。",
            "correct_tokens": ["If","you","spoke","more","slowly","now",",","I","would","understand","you","."],
            "accepted": [["If","you","spoke","more","slowly",",","I","would","understand","you","."]],
            "distractors": ["speak","will","understood","have"]
        },
        {
            "id": "conditional_127",
            "rule": "2",
            "type": "2",
            "chinese": "可惜他們課室不夠大；如果他們有更大的課室，他們會邀請更多學生。",
            "correct_tokens": ["If","they","had","a","bigger","classroom",",","they","would","invite","more","students","."],
            "distractors": ["have","will","invited","are"]
        },
        {
            "id": "conditional_128",
            "rule": "2",
            "type": "2",
            "chinese": "如果我的電話現在能用，我會打給你。",
            "correct_tokens": ["If","my","phone","worked",",","I","would","call","you","now","."],
            "distractors": ["works","will","called","has"]
        },
        {
            "id": "conditional_129",
            "rule": "2",
            "type": "2",
            "chinese": "純粹假設：如果我是校長，我會較遲開始上課。",
            "correct_tokens": ["If","I","were","the","principal",",","I","would","start","lessons","later","."],
            "distractors": ["am","will","started","have"]
        },
        {
            "id": "conditional_130",
            "rule": "2",
            "type": "2",
            "chinese": "可惜她不會游泳；如果她會游泳，她會參加游泳比賽。",
            "correct_tokens": ["If","she","could","swim",",","she","would","join","the","swimming","race","."],
            "distractors": ["can","will","joined","has"]
        },
        {
            "id": "conditional_131",
            "rule": "2",
            "type": "2",
            "chinese": "可惜我們今晚有家課；如果我們沒有家課，我們今晚會看電影。",
            "correct_tokens": ["If","we","did","not","have","homework",",","we","would","watch","a","film","tonight","."],
            "distractors": ["do","will","watched","had"]
        },
        {
            "id": "conditional_132",
            "rule": "2",
            "type": "2",
            "chinese": "可惜他不夠小心；如果他更小心，他會犯更少錯。",
            "correct_tokens": ["If","he","were","more","careful",",","he","would","make","fewer","mistakes","."],
            "distractors": ["is","will","made","has"]
        },
        {
            "id": "conditional_133",
            "rule": "2",
            "type": "2",
            "chinese": "可惜我沒有地圖；如果我有地圖，我就不會迷路。",
            "correct_tokens": ["If","I","had","a","map",",","I","would","not","get","lost","."],
            "distractors": ["have","will","got","am"]
        },
        {
            "id": "conditional_134",
            "rule": "2",
            "type": "2",
            "chinese": "可惜圖書館不會早開；如果圖書館早一點開門，我們會上學前在那裡溫習。",
            "correct_tokens": ["If","the","library","opened","earlier",",","we","would","study","there","before","school","."],
            "distractors": ["opens","will","studied","has"]
        },
        {
            "id": "conditional_135",
            "rule": "2",
            "type": "2",
            "chinese": "純粹假設：如果你住在日本，你會很快學會日文。",
            "correct_tokens": ["If","you","lived","in","Japan",",","you","would","learn","Japanese","quickly","."],
            "distractors": ["live","will","learned","have"]
        },
        {
            "id": "conditional_136",
            "rule": "2",
            "type": "2",
            "chinese": "可惜我不知道她的電郵；如果我知道她的電郵，我會寄筆記給她。",
            "correct_tokens": ["If","I","knew","her","email",",","I","would","send","her","the","notes","."],
            "distractors": ["know","will","sent","have"]
        },
        {
            "id": "conditional_137",
            "rule": "2",
            "type": "2",
            "chinese": "可惜考試不容易；如果考試容易一點，更多學生會合格。",
            "correct_tokens": ["If","the","exam","were","easier",",","more","students","would","pass","."],
            "distractors": ["is","will","passed","has"]
        },
        {
            "id": "conditional_138",
            "rule": "2",
            "type": "2",
            "chinese": "可惜他沒有足夠金錢；如果他有足夠金錢，他會買一部手提電腦。",
            "correct_tokens": ["If","he","had","enough","money",",","he","would","buy","a","laptop","."],
            "distractors": ["has","will","bought","is"]
        },
        {
            "id": "conditional_139",
            "rule": "2",
            "type": "2",
            "chinese": "可惜我不可以選擇；如果我可以選擇，我會坐在窗邊。",
            "correct_tokens": ["If","I","could","choose",",","I","would","sit","by","the","window","."],
            "distractors": ["can","will","sat","have"]
        },
        {
            "id": "conditional_140",
            "rule": "2",
            "type": "2",
            "chinese": "純粹假設：如果你是我的隊友，我們會贏更多比賽。",
            "correct_tokens": ["If","you","were","my","teammate",",","we","would","win","more","games","."],
            "distractors": ["are","will","won","have"]
        },
        {
            "id": "conditional_141",
            "rule": "3",
            "type": "3",
            "chinese": "如果我當時設定了鬧鐘，我就會準時醒來。",
            "correct_tokens": ["If","I","had","set","the","alarm","then",",","I","would","have","woken","up","on","time","."],
            "accepted": [["If","I","had","set","the","alarm",",","I","would","have","woken","up","on","time","."]],
            "distractors": ["set","will","wake","woke"]
        },
        {
            "id": "conditional_142",
            "rule": "3",
            "type": "3",
            "chinese": "如果她昨晚有溫習，她就會通過小測。",
            "correct_tokens": ["If","she","had","studied","last","night",",","she","would","have","passed","the","quiz","."],
            "distractors": ["studies","will","pass","passed"]
        },
        {
            "id": "conditional_143",
            "rule": "3",
            "type": "3",
            "chinese": "如果我們昨天早點離開，我們就會趕上巴士。",
            "correct_tokens": ["If","we","had","left","earlier","yesterday",",","we","would","have","caught","the","bus","."],
            "distractors": ["leave","will","catch","caught"]
        },
        {
            "id": "conditional_144",
            "rule": "3",
            "type": "3",
            "chinese": "如果他當時穿了外套，他就不會感冒。",
            "correct_tokens": ["If","he","had","worn","a","coat","then",",","he","would","not","have","caught","a","cold","."],
            "accepted": [["If","he","had","worn","a","coat",",","he","would","not","have","caught","a","cold","."]],
            "distractors": ["wears","will","catch","wore"]
        },
        {
            "id": "conditional_145",
            "rule": "3",
            "type": "3",
            "chinese": "如果你當時告訴我真相，我就會信任你。",
            "correct_tokens": ["If","you","had","told","me","the","truth","then",",","I","would","have","trusted","you","."],
            "accepted": [["If","you","had","told","me","the","truth",",","I","would","have","trusted","you","."]],
            "distractors": ["tell","will","trust","trusted"]
        },
        {
            "id": "conditional_146",
            "rule": "3",
            "type": "3",
            "chinese": "如果他們賽前練習更多，他們就會贏。",
            "correct_tokens": ["If","they","had","practised","more","before","the","match",",","they","would","have","won","."],
            "distractors": ["practise","will","win","practised"]
        },
        {
            "id": "conditional_147",
            "rule": "3",
            "type": "3",
            "chinese": "如果我當時帶了雨傘，我就不會濕透。",
            "correct_tokens": ["If","I","had","brought","an","umbrella","then",",","I","would","not","have","got","wet","."],
            "accepted": [["If","I","had","brought","an","umbrella",",","I","would","not","have","got","wet","."]],
            "distractors": ["bring","will","get","brought"]
        },
        {
            "id": "conditional_148",
            "rule": "3",
            "type": "3",
            "chinese": "如果老師當時再解釋一次，我們就會明白。",
            "correct_tokens": ["If","the","teacher","had","explained","it","again","then",",","we","would","have","understood","."],
            "accepted": [["If","the","teacher","had","explained","it","again",",","we","would","have","understood","."]],
            "distractors": ["explains","will","understand","explained"]
        },
        {
            "id": "conditional_149",
            "rule": "3",
            "type": "3",
            "chinese": "如果她當時儲存了檔案，她就不會失去功課。",
            "correct_tokens": ["If","she","had","saved","the","file","then",",","she","would","not","have","lost","her","work","."],
            "accepted": [["If","she","had","saved","the","file",",","she","would","not","have","lost","her","work","."]],
            "distractors": ["saves","will","lose","saved"]
        },
        {
            "id": "conditional_150",
            "rule": "3",
            "type": "3",
            "chinese": "如果我們當時早點訂票，我們就會得到較好的座位。",
            "correct_tokens": ["If","we","had","booked","tickets","earlier","then",",","we","would","have","got","better","seats","."],
            "accepted": [["If","we","had","booked","tickets","earlier",",","we","would","have","got","better","seats","."]],
            "distractors": ["book","will","get","booked"]
        },
        {
            "id": "conditional_151",
            "rule": "3",
            "type": "3",
            "chinese": "如果他當時檢查答案，他就會發現錯誤。",
            "correct_tokens": ["If","he","had","checked","the","answer","then",",","he","would","have","found","the","mistake","."],
            "accepted": [["If","he","had","checked","the","answer",",","he","would","have","found","the","mistake","."]],
            "distractors": ["checks","will","find","checked"]
        },
        {
            "id": "conditional_152",
            "rule": "3",
            "type": "3",
            "chinese": "如果我當時知道你的電話號碼，我就會打給你。",
            "correct_tokens": ["If","I","had","known","your","number","then",",","I","would","have","called","you","."],
            "accepted": [["If","I","had","known","your","number",",","I","would","have","called","you","."]],
            "distractors": ["know","will","call","knew"]
        },
        {
            "id": "conditional_153",
            "rule": "3",
            "type": "3",
            "chinese": "如果那天巴士準時到達，我們就不會遲到。",
            "correct_tokens": ["If","the","bus","had","arrived","on","time",",","we","would","not","have","been","late","."],
            "distractors": ["arrives","will","be","arrived"]
        },
        {
            "id": "conditional_154",
            "rule": "3",
            "type": "3",
            "chinese": "如果他們當時小心聆聽，他們就會跟到指示。",
            "correct_tokens": ["If","they","had","listened","carefully","then",",","they","would","have","followed","the","instructions","."],
            "accepted": [["If","they","had","listened","carefully",",","they","would","have","followed","the","instructions","."]],
            "distractors": ["listen","will","follow","listened"]
        },
        {
            "id": "conditional_155",
            "rule": "3",
            "type": "3",
            "chinese": "如果你當時為電話充電，它就不會關機。",
            "correct_tokens": ["If","you","had","charged","your","phone","then",",","it","would","not","have","turned","off","."],
            "accepted": [["If","you","had","charged","your","phone",",","it","would","not","have","turned","off","."]],
            "distractors": ["charge","will","turn","charged"]
        },
        {
            "id": "conditional_156",
            "rule": "3",
            "type": "3",
            "chinese": "如果我今天早上吃了早餐，我就不會肚餓。",
            "correct_tokens": ["If","I","had","eaten","breakfast","this","morning",",","I","would","not","have","felt","hungry","."],
            "accepted": [["If","I","had","eaten","breakfast",",","I","would","not","have","felt","hungry","."]],
            "distractors": ["eat","will","feel","ate"]
        },
        {
            "id": "conditional_157",
            "rule": "3",
            "type": "3",
            "chinese": "如果她當時求助，她就會完成專題。",
            "correct_tokens": ["If","she","had","asked","for","help","then",",","she","would","have","finished","the","project","."],
            "accepted": [["If","she","had","asked","for","help",",","she","would","have","finished","the","project","."]],
            "distractors": ["asks","will","finish","asked"]
        },
        {
            "id": "conditional_158",
            "rule": "3",
            "type": "3",
            "chinese": "如果我們當時乘的士，我們就會早點到達機場。",
            "correct_tokens": ["If","we","had","taken","a","taxi","then",",","we","would","have","reached","the","airport","earlier","."],
            "accepted": [["If","we","had","taken","a","taxi",",","we","would","have","reached","the","airport","earlier","."]],
            "distractors": ["take","will","reach","took"]
        },
        {
            "id": "conditional_159",
            "rule": "3",
            "type": "3",
            "chinese": "如果他當時鎖了門，袋子就不會被偷。",
            "correct_tokens": ["If","he","had","locked","the","door","then",",","the","bag","would","not","have","been","stolen","."],
            "accepted": [["If","he","had","locked","the","door",",","the","bag","would","not","have","been","stolen","."]],
            "distractors": ["locks","will","steal","locked"]
        },
        {
            "id": "conditional_160",
            "rule": "3",
            "type": "3",
            "chinese": "如果我當時讀了通告，我就會參加會議。",
            "correct_tokens": ["If","I","had","read","the","notice","then",",","I","would","have","joined","the","meeting","."],
            "accepted": [["If","I","had","read","the","notice",",","I","would","have","joined","the","meeting","."]],
            "distractors": ["read","will","join","joined"]
        }
    ];

    window.GRAMMAR_CONDITIONAL_BANK = Array.isArray(window.GRAMMAR_CONDITIONAL_BANK)
        ? window.GRAMMAR_CONDITIONAL_BANK.concat(extraQuestions)
        : extraQuestions;
})();
