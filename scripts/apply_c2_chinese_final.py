from __future__ import annotations

import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

TRANSLATIONS = {
    "reverent": "恭敬的／虔敬的",
    "revert": "恢復／回復原狀",
    "revolt": "叛亂／反抗",
    "rife": "盛行的／充斥的",
    "rift": "裂痕／分歧",
    "rigor": "嚴謹／嚴酷",
    "rite": "儀式",
    "roach": "蟑螂",
    "roost": "棲息處／棲息",
    "rot": "腐爛／衰敗",
    "rote": "死記硬背",
    "rummage": "翻找／ rummage",
    "saboteur": "破壞者／蓄意搗亂者",
    "sac": "囊／液囊",
    "sadden": "使悲傷",
    "sassy": "潑辣的／大膽無禮的",
    "scarcity": "缺乏／稀缺",
    "scramble": "爭先恐後／攀爬",
    "scrap": "碎片／廢棄",
    "scrapheap": "廢料堆",
    "screengrab": "截圖",
    "scribble": "亂寫／塗鴉",
    "scroll": "捲軸／滾動",
    "sculpt": "雕塑／塑造",
    "scurry": "急跑／匆匆走動",
    "seethe": "翻騰／怒不可遏",
    "serendipity": "意外發現美好事物的運氣",
    "sever": "切斷／斷絕",
    "shack": "簡陋小屋",
    "sham": "假裝／虛假的",
    "sheathe": "入鞘／包覆",
    "shield": "盾牌／保護",
    "shred": "碎片／撕碎",
    "shudder": "顫抖／戰慄",
    "skeptical": "懷疑的",
    "skillet": "煎鍋",
    "slack": "鬆弛的／鬆懈",
    "smoky": "冒煙的／煙霧瀰漫的",
    "smoulder": "悶燒／暗自憤怒",
    "snare": "陷阱／圈套",
    "sneer": "冷笑／譏笑",
    "sniff": "嗅／吸鼻子",
    "snippet": "片段／小段文字",
    "soggy": "濕透的",
    "soot": "煙灰／煤煙",
    "spar": "拳擊練習／爭論",
    "spike": "尖刺／激增",
    "sprain": "扭傷",
    "spur": "刺激／馬刺",
    "stag": "雄鹿／不帶伴侶出席的",
    "stampede": "蜂擁／踩踏",
    "stardom": "明星身分／名氣",
    "starvation": "飢餓／餓死",
    "stern": "嚴厲的／船尾",
    "steroid": "類固醇",
    "stitch": "縫一針／針腳",
    "stoicism": "堅忍克己／斯多葛主義",
    "straggle": "散亂延伸／落後掉隊",
    "strap": "帶子／用帶綁",
    "stump": "樹樁／難倒",
    "sulfuric": "硫酸的／含硫的",
    "superficial": "表面的／膚淺的",
    "superstition": "迷信",
    "supremacy": "至高無上／霸權",
    "sustainability": "可持續性",
    "swell": "膨脹／隆起",
    "swift": "迅速的",
    "swirl": "旋轉／漩渦",
    "systematically": "有系統地",
    "tandem": "串聯／並排雙人",
    "tangible": "有形的／切實的",
    "tangle": "纏結／混亂局面",
    "tantalize": "逗弄／使垂涎",
    "tarantula": "狼蛛",
    "tasteless": "無味的／不得體的",
    "teary": "含淚的",
    "tellingly": "有力地／意味深長地",
    "terminology": "術語",
    "terraforming": "地球化改造",
    "thermal": "熱的／熱能的",
    "thrash": "猛擊／慘敗",
    "throb": "跳動／抽痛",
    "thrust": "猛推／推力",
    "tidbit": "趣聞／小片資訊",
    "tirade": "長篇怒斥",
    "tire": "輪胎／使疲倦",
    "tragically": "悲劇性地",
    "trammelled": "受束縛的／受限制的",
    "transgression": "違反／越界",
    "trash": "垃圾／痛批",
    "traumatic": "創傷性的",
    "tread": "踩踏／步伐",
    "treason": "叛國罪",
    "trench": "溝渠／戰壕",
    "trepidation": "惶恐／不安",
    "trickle": "涓滴流動／少量湧入",
    "trilogy": "三部曲",
    "trinket": "小飾物／小玩意",
    "truism": "老生常談",
    "tumult": "騷動／喧囂",
    "turbine": "渦輪機",
    "turbulent": "動盪的／湍急的",
    "turf": "草皮／地盤勢力範圍",
    "tweed": "粗花呢",
    "tweet": "推文／鳥叫",
    "twine": "細繩／纏繞",
    "tyrannical": "專橫暴虐的",
    "ugli": "醜橘",
    "unanimous": "一致同意的",
    "unanimously": "一致地",
    "undesirable": "不受歡迎的／不理想的",
    "undiscerning": "缺乏判斷力的",
    "unethical": "不道德的",
    "unfurl": "展開／打開",
    "unmolested": "未受騷擾的",
    "unravel": "解開／揭開真相",
    "unrelenting": "不屈不撓的／持續不減的",
    "untrammeled": "不受束縛的",
    "unwind": "放鬆／鬆開",
    "unwittingly": "不知不覺地",
    "unyielding": "不屈服的／堅硬的",
    "upheaval": "劇變／動盪",
    "upsurge": "激增／高漲",
    "usher": "引座員／引導",
    "utopia": "烏托邦／理想國",
    "utter": "說出／完全的",
    "vanguard": "先鋒／前衛",
    "variance": "差異／變異",
    "veer": "突然轉向",
    "venerable": "受尊敬的／歷史悠久的",
    "venerate": "尊敬／崇敬",
    "veneration": "崇敬",
    "venomous": "有毒的／惡毒的",
    "veracious": "誠實的／真實的",
    "visor": "帽檐／面罩",
    "vocation": "職業／天職",
    "volatile": "不穩定的／易揮發的",
    "voter": "選民",
    "wary": "警惕的／小心的",
    "weary": "疲憊的／使厭倦",
    "wellies": "橡膠雨靴",
    "whine": "發牢騷／嗚咽聲",
    "whingeing": "抱怨的／發牢騷",
    "whir": "呼呼聲／旋轉",
    "whirl": "旋轉／迴旋",
    "wholeheartedly": "全心全意地",
    "wicked": "邪惡的／極好的",
    "wiggle": "扭動／擺動",
    "wilt": "枯萎／變軟弱",
    "wink": "眨眼／使眼色",
    "wisp": "一縷／小束",
    "woe": "悲哀／苦惱",
    "worthless": "毫無價值的",
    "wrangle": "爭論／設法獲取",
    "wreck": "殘骸／毀壞",
    "wring": "擰乾／榨取",
    "wry": "諷刺的／苦笑的",
    "yap": "狂吠／喋喋不休",
    "yarn": "紗線／離奇故事",
    "yearn": "渴望",
    "zing": "活力／尖銳趣味",
}


def main() -> None:
    bank_path = ROOT / "question_bank_c2.json"
    missing_path = ROOT / "question_bank_c2_missing_chinese.csv"
    translations_path = ROOT / "c2_ch_translations.json"

    with bank_path.open("r", encoding="utf-8") as f:
        bank = json.load(f)

    for entry in bank:
        if entry["word"] in TRANSLATIONS:
            entry["ch"] = TRANSLATIONS[entry["word"]]

    with bank_path.open("w", encoding="utf-8") as f:
        json.dump(bank, f, ensure_ascii=False, indent=2)
        f.write("\n")

    rows = [
        {"word": entry["word"], "cefr": entry.get("cefr", "")}
        for entry in bank
        if not (entry.get("ch") or "").strip()
    ]
    with missing_path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["word", "cefr"])
        writer.writeheader()
        writer.writerows(rows)

    existing = {}
    if translations_path.exists():
        existing = json.loads(translations_path.read_text(encoding="utf-8"))
    existing.update(TRANSLATIONS)
    translations_path.write_text(
        json.dumps(existing, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
