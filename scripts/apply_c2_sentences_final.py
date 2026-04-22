from __future__ import annotations

import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

SENTENCES = {
    "tidbit": [
        {"text": "The article included a useful tidbit about the artist's childhood.", "answer": "tidbit"},
        {"text": "She shared a funny tidbit from the meeting.", "answer": "tidbit"},
        {"text": "Every chapter ends with a historical tidbit.", "answer": "tidbit"},
    ],
    "tirade": [
        {"text": "He launched into a tirade against the new rules.", "answer": "tirade"},
        {"text": "The coach's tirade shocked the younger players.", "answer": "tirade"},
        {"text": "She sat silently through his angry tirade.", "answer": "tirade"},
    ],
    "tire": [
        {"text": "Long meetings tire me more than physical work.", "answer": "tire"},
        {"text": "The rough road damaged one tire on the truck.", "answer": "tire"},
        {"text": "Children rarely tire of hearing the same story.", "answer": "tire"},
    ],
    "tragically": [
        {"text": "The rescue arrived too late, tragically.", "answer": "tragically"},
        {"text": "The actor died tragically young.", "answer": "tragically"},
        {"text": "The story ends tragically for both families.", "answer": "tragically"},
    ],
    "trammelled": [
        {"text": "He felt trammelled by outdated regulations.", "answer": "trammelled"},
        {"text": "Creative work cannot flourish in a trammelled environment.", "answer": "trammelled"},
        {"text": "The group became trammelled by its own bureaucracy.", "answer": "trammelled"},
    ],
    "transgression": [
        {"text": "The school treated cheating as a serious transgression.", "answer": "transgression"},
        {"text": "He apologized for his moral transgression.", "answer": "transgression"},
        {"text": "The novel explores guilt after a single transgression.", "answer": "transgression"},
    ],
    "trash": [
        {"text": "Please take the trash out before dinner.", "answer": "trash"},
        {"text": "Critics trashed the sequel on opening night.", "answer": "trash"},
        {"text": "Plastic trash washed onto the beach after the storm.", "answer": "trash"},
    ],
    "traumatic": [
        {"text": "The accident was a deeply traumatic experience.", "answer": "traumatic"},
        {"text": "Children may need help after a traumatic event.", "answer": "traumatic"},
        {"text": "She still remembers that traumatic night clearly.", "answer": "traumatic"},
    ],
    "tread": [
        {"text": "Please tread carefully on the wet floor.", "answer": "tread"},
        {"text": "The heavy tread of boots echoed in the hall.", "answer": "tread"},
        {"text": "Tourists should not tread on fragile coral.", "answer": "tread"},
    ],
    "treason": [
        {"text": "The minister was accused of treason during the uprising.", "answer": "treason"},
        {"text": "In the old kingdom, treason was punishable by death.", "answer": "treason"},
        {"text": "The film centers on a charge of treason.", "answer": "treason"},
    ],
    "trench": [
        {"text": "Workers dug a trench beside the road.", "answer": "trench"},
        {"text": "The museum displayed letters written from the trench.", "answer": "trench"},
        {"text": "Rainwater filled the trench within an hour.", "answer": "trench"},
    ],
    "trepidation": [
        {"text": "She opened the letter with some trepidation.", "answer": "trepidation"},
        {"text": "The team faced the final match with trepidation.", "answer": "trepidation"},
        {"text": "He felt a wave of trepidation before speaking.", "answer": "trepidation"},
    ],
    "trickle": [
        {"text": "A trickle of water ran down the wall.", "answer": "trickle"},
        {"text": "Customers began to trickle back after lunch.", "answer": "trickle"},
        {"text": "Money continued to trickle into the fund.", "answer": "trickle"},
    ],
    "trilogy": [
        {"text": "She finished the final book in the trilogy last night.", "answer": "trilogy"},
        {"text": "The director plans to turn the story into a trilogy.", "answer": "trilogy"},
        {"text": "The fantasy trilogy became a global success.", "answer": "trilogy"},
    ],
    "trinket": [
        {"text": "The market sold cheap trinkets for tourists.", "answer": "trinket"},
        {"text": "She keeps a trinket from every country she visits.", "answer": "trinket"},
        {"text": "The drawer was full of old coins and trinkets.", "answer": "trinket"},
    ],
    "truism": [
        {"text": "The speech was full of truisms but few solutions.", "answer": "truism"},
        {"text": "Calling hard work important is a truism, not a strategy.", "answer": "truism"},
        {"text": "The essay rises above simple truisms.", "answer": "truism"},
    ],
    "tumult": [
        {"text": "The decision caused political tumult across the country.", "answer": "tumult"},
        {"text": "They could hear the tumult from the street below.", "answer": "tumult"},
        {"text": "The town emerged from years of turmoil and tumult.", "answer": "tumult"},
    ],
    "turbine": [
        {"text": "The wind turbine stood alone on the hill.", "answer": "turbine"},
        {"text": "Engineers inspected the damaged turbine.", "answer": "turbine"},
        {"text": "A new turbine improved the plant's efficiency.", "answer": "turbine"},
    ],
    "turbulent": [
        {"text": "The plane passed through turbulent air.", "answer": "turbulent"},
        {"text": "It was a turbulent period in the nation's history.", "answer": "turbulent"},
        {"text": "The river becomes turbulent after heavy rain.", "answer": "turbulent"},
    ],
    "turf": [
        {"text": "The players trained on artificial turf.", "answer": "turf"},
        {"text": "The gang defended its turf fiercely.", "answer": "turf"},
        {"text": "Fresh turf was laid around the stadium.", "answer": "turf"},
    ],
    "tweed": [
        {"text": "He wore a tweed jacket to the lecture.", "answer": "tweed"},
        {"text": "The tailor specializes in traditional tweed suits.", "answer": "tweed"},
        {"text": "A tweed cap completed the outfit.", "answer": "tweed"},
    ],
    "tweet": [
        {"text": "She posted a tweet about the concert.", "answer": "tweet"},
        {"text": "Birds began to tweet before sunrise.", "answer": "tweet"},
        {"text": "A careless tweet can damage a career.", "answer": "tweet"},
    ],
    "twine": [
        {"text": "The parcel was tied with rough twine.", "answer": "twine"},
        {"text": "Vines began to twine around the gate.", "answer": "twine"},
        {"text": "He used twine to secure the boxes.", "answer": "twine"},
    ],
    "tyrannical": [
        {"text": "The novel portrays a tyrannical ruler.", "answer": "tyrannical"},
        {"text": "Workers rebelled against the tyrannical management style.", "answer": "tyrannical"},
        {"text": "The law was criticized as tyrannical.", "answer": "tyrannical"},
    ],
    "ugli": [
        {"text": "He bought an ugli fruit at the market out of curiosity.", "answer": "ugli"},
        {"text": "The ugli tasted sweeter than it looked.", "answer": "ugli"},
        {"text": "An ugli is a type of citrus fruit.", "answer": "ugli"},
    ],
    "unanimous": [
        {"text": "The committee reached a unanimous decision.", "answer": "unanimous"},
        {"text": "Support for the proposal was nearly unanimous.", "answer": "unanimous"},
        {"text": "The jury was not unanimous at first.", "answer": "unanimous"},
    ],
    "unanimously": [
        {"text": "The motion was approved unanimously.", "answer": "unanimously"},
        {"text": "Board members voted unanimously to proceed.", "answer": "unanimously"},
        {"text": "The court unanimously rejected the appeal.", "answer": "unanimously"},
    ],
    "undesirable": [
        {"text": "The policy had several undesirable effects.", "answer": "undesirable"},
        {"text": "An undesirable smell came from the drains.", "answer": "undesirable"},
        {"text": "The ad attracted some highly undesirable attention.", "answer": "undesirable"},
    ],
    "undiscerning": [
        {"text": "An undiscerning audience may miss the irony completely.", "answer": "undiscerning"},
        {"text": "The market rewards even the most undiscerning tastes.", "answer": "undiscerning"},
        {"text": "He made the mistake of trusting an undiscerning review.", "answer": "undiscerning"},
    ],
    "unethical": [
        {"text": "The company was accused of unethical behavior.", "answer": "unethical"},
        {"text": "It would be unethical to publish private data without consent.", "answer": "unethical"},
        {"text": "The board rejected the proposal as unethical.", "answer": "unethical"},
    ],
    "unfurl": [
        {"text": "They began to unfurl the banner before the march.", "answer": "unfurl"},
        {"text": "Leaves unfurled in the spring sunlight.", "answer": "unfurl"},
        {"text": "She unfurled the old map on the table.", "answer": "unfurl"},
    ],
    "unmolested": [
        {"text": "The old records remained unmolested in the archive.", "answer": "unmolested"},
        {"text": "The wildlife was left unmolested in the protected zone.", "answer": "unmolested"},
        {"text": "The box sat unmolested for years in the attic.", "answer": "unmolested"},
    ],
    "unravel": [
        {"text": "The mystery began to unravel after the final clue appeared.", "answer": "unravel"},
        {"text": "Her scarf started to unravel at one end.", "answer": "unravel"},
        {"text": "The case may unravel if one witness changes their story.", "answer": "unravel"},
    ],
    "unrelenting": [
        {"text": "The team faced unrelenting criticism after the loss.", "answer": "unrelenting"},
        {"text": "Unrelenting rain flooded the valley.", "answer": "unrelenting"},
        {"text": "His unrelenting pace exhausted the others.", "answer": "unrelenting"},
    ],
    "untrammeled": [
        {"text": "The artist longed for untrammeled creative freedom.", "answer": "untrammeled"},
        {"text": "They crossed an untrammeled stretch of wilderness.", "answer": "untrammeled"},
        {"text": "The speech called for untrammeled debate.", "answer": "untrammeled"},
    ],
    "unwind": [
        {"text": "I like to unwind with music after work.", "answer": "unwind"},
        {"text": "It took days for the legal issue to unwind completely.", "answer": "unwind"},
        {"text": "She watched the string unwind from the reel.", "answer": "unwind"},
    ],
    "unwittingly": [
        {"text": "He unwittingly revealed the surprise to everyone.", "answer": "unwittingly"},
        {"text": "The app unwittingly shared private information.", "answer": "unwittingly"},
        {"text": "They unwittingly entered a restricted area.", "answer": "unwittingly"},
    ],
    "unyielding": [
        {"text": "She remained unyielding during the negotiations.", "answer": "unyielding"},
        {"text": "The unyielding surface damaged the equipment.", "answer": "unyielding"},
        {"text": "His unyielding belief inspired some and angered others.", "answer": "unyielding"},
    ],
    "upheaval": [
        {"text": "The reform caused social upheaval across the region.", "answer": "upheaval"},
        {"text": "Their lives were marked by years of upheaval.", "answer": "upheaval"},
        {"text": "The industry is undergoing major upheaval.", "answer": "upheaval"},
    ],
    "upsurge": [
        {"text": "There was an upsurge in demand after the announcement.", "answer": "upsurge"},
        {"text": "The city saw an upsurge in tourism last summer.", "answer": "upsurge"},
        {"text": "An upsurge of anger followed the ruling.", "answer": "upsurge"},
    ],
    "usher": [
        {"text": "An usher guided us to our seats.", "answer": "usher"},
        {"text": "The new policy may usher in a period of change.", "answer": "usher"},
        {"text": "They hope the discovery will usher in better treatment.", "answer": "usher"},
    ],
    "utopia": [
        {"text": "The novel imagines a fragile utopia in the desert.", "answer": "utopia"},
        {"text": "No society has ever truly become a utopia.", "answer": "utopia"},
        {"text": "The plan promised a kind of technological utopia.", "answer": "utopia"},
    ],
    "utter": [
        {"text": "She did not utter a word during the meeting.", "answer": "utter"},
        {"text": "The room fell into utter silence.", "answer": "utter"},
        {"text": "He gave an utter denial of the claim.", "answer": "utter"},
    ],
    "vanguard": [
        {"text": "The movement placed young artists in the vanguard of change.", "answer": "vanguard"},
        {"text": "They saw themselves as the vanguard of reform.", "answer": "vanguard"},
        {"text": "The company wants to remain in the technological vanguard.", "answer": "vanguard"},
    ],
    "variance": [
        {"text": "There was little variance between the two results.", "answer": "variance"},
        {"text": "The report explained the variance in performance.", "answer": "variance"},
        {"text": "Statisticians measured the variance across age groups.", "answer": "variance"},
    ],
    "veer": [
        {"text": "The car began to veer toward the edge of the road.", "answer": "veer"},
        {"text": "The discussion veered away from the main topic.", "answer": "veer"},
        {"text": "Birds suddenly veered north over the water.", "answer": "veer"},
    ],
    "venerable": [
        {"text": "The university is one of the city's most venerable institutions.", "answer": "venerable"},
        {"text": "A venerable oak stood beside the chapel.", "answer": "venerable"},
        {"text": "He was regarded as a venerable scholar.", "answer": "venerable"},
    ],
    "venerate": [
        {"text": "Many communities still venerate their ancestors.", "answer": "venerate"},
        {"text": "The temple was built to venerate a local saint.", "answer": "venerate"},
        {"text": "Fans sometimes venerate public figures too easily.", "answer": "venerate"},
    ],
    "veneration": [
        {"text": "The ceremony expressed deep veneration for the founder.", "answer": "veneration"},
        {"text": "Her work is studied with near-veneration in some schools.", "answer": "veneration"},
        {"text": "The statue became an object of public veneration.", "answer": "veneration"},
    ],
    "venomous": [
        {"text": "The guide warned us about venomous snakes in the area.", "answer": "venomous"},
        {"text": "He wrote a venomous review of the play.", "answer": "venomous"},
        {"text": "Only a few of the island's spiders are venomous.", "answer": "venomous"},
    ],
    "veracious": [
        {"text": "The witness was known as a veracious observer.", "answer": "veracious"},
        {"text": "A veracious account matters more than a dramatic one.", "answer": "veracious"},
        {"text": "Historians tried to build the most veracious record possible.", "answer": "veracious"},
    ],
    "visor": [
        {"text": "She lowered the car visor to block the sun.", "answer": "visor"},
        {"text": "The knight's visor hid his expression.", "answer": "visor"},
        {"text": "A clear plastic visor protected the nurse's face.", "answer": "visor"},
    ],
    "vocation": [
        {"text": "Teaching felt less like a job and more like a vocation.", "answer": "vocation"},
        {"text": "She found her vocation in community nursing.", "answer": "vocation"},
        {"text": "The retreat encouraged people to reflect on vocation and purpose.", "answer": "vocation"},
    ],
    "volatile": [
        {"text": "The situation remains politically volatile.", "answer": "volatile"},
        {"text": "Gasoline is highly volatile and must be handled carefully.", "answer": "volatile"},
        {"text": "He is talented but emotionally volatile.", "answer": "volatile"},
    ],
    "voter": [
        {"text": "Every voter deserves clear information before the election.", "answer": "voter"},
        {"text": "Young voter turnout was higher than expected.", "answer": "voter"},
        {"text": "Each voter placed a paper in the sealed box.", "answer": "voter"},
    ],
    "wary": [
        {"text": "Investors remain wary of sudden policy changes.", "answer": "wary"},
        {"text": "Be wary of offers that sound too good to be true.", "answer": "wary"},
        {"text": "The dog was friendly but wary of strangers.", "answer": "wary"},
    ],
    "weary": [
        {"text": "After the long march, everyone felt weary.", "answer": "weary"},
        {"text": "She grew weary of the endless delays.", "answer": "weary"},
        {"text": "A weary smile crossed his face.", "answer": "weary"},
    ],
    "wellies": [
        {"text": "The children put on wellies before jumping in puddles.", "answer": "wellies"},
        {"text": "I keep a pair of wellies by the back door.", "answer": "wellies"},
        {"text": "Farmers wore muddy wellies into the shop.", "answer": "wellies"},
    ],
    "whine": [
        {"text": "The machine gave off a high whine as it started.", "answer": "whine"},
        {"text": "He tends to whine when things do not go his way.", "answer": "whine"},
        {"text": "We heard the whine of the wind through the gap.", "answer": "whine"},
    ],
    "whingeing": [
        {"text": "The coach told the players to stop whingeing and focus.", "answer": "whingeing"},
        {"text": "She left the room rather than listen to more whingeing.", "answer": "whingeing"},
        {"text": "Online whingeing rarely solves real problems.", "answer": "whingeing"},
    ],
    "whir": [
        {"text": "We heard the whir of the fan all night.", "answer": "whir"},
        {"text": "The drone began to whir above the field.", "answer": "whir"},
        {"text": "A sewing machine can whir for hours without pause.", "answer": "whir"},
    ],
    "whirl": [
        {"text": "Leaves began to whirl in the sudden wind.", "answer": "whirl"},
        {"text": "My thoughts were still in a whirl after the announcement.", "answer": "whirl"},
        {"text": "The dancers whirled across the stage.", "answer": "whirl"},
    ],
    "wholeheartedly": [
        {"text": "The team wholeheartedly supported the decision.", "answer": "wholeheartedly"},
        {"text": "She threw herself wholeheartedly into the project.", "answer": "wholeheartedly"},
        {"text": "I wholeheartedly agree with the recommendation.", "answer": "wholeheartedly"},
    ],
    "wicked": [
        {"text": "The story features a wicked queen in the mountains.", "answer": "wicked"},
        {"text": "A wicked grin spread across his face.", "answer": "wicked"},
        {"text": "The storm brought wicked winds along the coast.", "answer": "wicked"},
    ],
    "wiggle": [
        {"text": "The child tried to wiggle free from the blanket.", "answer": "wiggle"},
        {"text": "There was just enough space to wiggle the key into place.", "answer": "wiggle"},
        {"text": "The puppy began to wiggle with excitement.", "answer": "wiggle"},
    ],
    "wilt": [
        {"text": "The flowers will wilt if left in the sun too long.", "answer": "wilt"},
        {"text": "His confidence seemed to wilt under criticism.", "answer": "wilt"},
        {"text": "Fresh lettuce can wilt quickly in the heat.", "answer": "wilt"},
    ],
    "wink": [
        {"text": "She gave me a quick wink across the table.", "answer": "wink"},
        {"text": "The stars seemed to wink in the cold sky.", "answer": "wink"},
        {"text": "He winked to show that the comment was a joke.", "answer": "wink"},
    ],
    "wisp": [
        {"text": "A wisp of smoke rose from the chimney.", "answer": "wisp"},
        {"text": "She tucked a wisp of hair behind her ear.", "answer": "wisp"},
        {"text": "Only a wisp of cloud remained above the hill.", "answer": "wisp"},
    ],
    "woe": [
        {"text": "The poem speaks of love and woe.", "answer": "woe"},
        {"text": "Woe to anyone who ignores the warning.", "answer": "woe"},
        {"text": "Their financial woe deepened after the closure.", "answer": "woe"},
    ],
    "worthless": [
        {"text": "The fake coin turned out to be worthless.", "answer": "worthless"},
        {"text": "He sometimes feels worthless after failure.", "answer": "worthless"},
        {"text": "The flooded papers were nearly worthless.", "answer": "worthless"},
    ],
    "wrangle": [
        {"text": "Managers spent hours wrangling over the final budget.", "answer": "wrangle"},
        {"text": "She had to wrangle a team of volunteers in the rain.", "answer": "wrangle"},
        {"text": "The brothers wrangled over the family business.", "answer": "wrangle"},
    ],
    "wreck": [
        {"text": "The storm left the harbor in wreck and ruin.", "answer": "wreck"},
        {"text": "A shipwreck was found near the coast.", "answer": "wreck"},
        {"text": "The scandal could wreck his political career.", "answer": "wreck"},
    ],
    "wring": [
        {"text": "Please wring the cloth before hanging it up.", "answer": "wring"},
        {"text": "The report was designed to wring sympathy from readers.", "answer": "wring"},
        {"text": "She wrung water from her sleeves after the storm.", "answer": "wring"},
    ],
    "wry": [
        {"text": "He gave a wry smile when he heard the news.", "answer": "wry"},
        {"text": "The book is full of wry observations about family life.", "answer": "wry"},
        {"text": "Her wry humor helped lighten the meeting.", "answer": "wry"},
    ],
    "yap": [
        {"text": "The little dog would not stop yapping.", "answer": "yap"},
        {"text": "He kept yapping through the whole film.", "answer": "yap"},
        {"text": "We could hear the puppies yap in the yard.", "answer": "yap"},
    ],
    "yarn": [
        {"text": "She bought red yarn to knit a scarf.", "answer": "yarn"},
        {"text": "He spun a wild yarn about hidden treasure.", "answer": "yarn"},
        {"text": "The basket was filled with balls of yarn.", "answer": "yarn"},
    ],
    "yearn": [
        {"text": "Many people yearn for a simpler life.", "answer": "yearn"},
        {"text": "He still yearns to see the sea again.", "answer": "yearn"},
        {"text": "Children often yearn for approval from their parents.", "answer": "yearn"},
    ],
    "zing": [
        {"text": "The sauce had a little extra zing from fresh lime.", "answer": "zing"},
        {"text": "A hint of humor gave the speech some zing.", "answer": "zing"},
        {"text": "The performance lacked its usual zing tonight.", "answer": "zing"},
    ],
}


def main() -> None:
    bank_path = ROOT / "question_bank_c2.json"
    missing_path = ROOT / "question_bank_c2_missing_sentences.csv"

    with bank_path.open("r", encoding="utf-8") as f:
        bank = json.load(f)

    for entry in bank:
        word = entry["word"]
        if word in SENTENCES:
            entry["sentences"] = SENTENCES[word]

    with bank_path.open("w", encoding="utf-8") as f:
        json.dump(bank, f, ensure_ascii=False, indent=2)
        f.write("\n")

    rows = []
    for entry in bank:
        sentences = entry.get("sentences") or []
        valid = [
            s
            for s in sentences
            if (s.get("text") or "").strip() and (s.get("answer") or "").strip()
        ]
        if len(valid) < 3:
            rows.append(
                {
                    "word": entry["word"],
                    "cefr": entry.get("cefr", ""),
                    "current_sentence_count": str(len(valid)),
                }
            )

    with missing_path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(
            f, fieldnames=["word", "cefr", "current_sentence_count"]
        )
        writer.writeheader()
        writer.writerows(rows)


if __name__ == "__main__":
    main()
