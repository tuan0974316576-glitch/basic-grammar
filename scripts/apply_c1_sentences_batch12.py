from __future__ import annotations

import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

SENTENCES = {
    "trimming": [
        {"text": "The tailor finished the final trimming on the jacket.", "answer": "trimming"},
        {"text": "Garden trimming is required before the guests arrive.", "answer": "trimming"},
        {"text": "The cake looked elegant after a little trimming around the edge.", "answer": "trimming"},
    ],
    "trip over": [
        {"text": "Be careful not to trip over the loose wire.", "answer": "trip over"},
        {"text": "He almost tripped over the bag by the door.", "answer": "trip over"},
        {"text": "Children may trip over toys left on the floor.", "answer": "trip over"},
    ],
    "triumph": [
        {"text": "The team celebrated its unexpected triumph in the final.", "answer": "triumph"},
        {"text": "Years of effort ended in triumph for the scientist.", "answer": "triumph"},
        {"text": "The novel tells a story of survival and triumph.", "answer": "triumph"},
    ],
    "triumphantly": [
        {"text": "She raised the trophy triumphantly above her head.", "answer": "triumphantly"},
        {"text": "He smiled triumphantly after proving the others wrong.", "answer": "triumphantly"},
        {"text": "The child triumphantly showed everyone the finished puzzle.", "answer": "triumphantly"},
    ],
    "trump": [
        {"text": "Public safety must trump private profit in this case.", "answer": "trump"},
        {"text": "Experience can sometimes trump formal qualifications.", "answer": "trump"},
        {"text": "Her honesty should trump any short-term advantage.", "answer": "trump"},
    ],
    "tuition": [
        {"text": "University tuition continues to rise each year.", "answer": "tuition"},
        {"text": "Her parents struggled to pay the tuition fees.", "answer": "tuition"},
        {"text": "The scholarship covers both tuition and books.", "answer": "tuition"},
    ],
    "tweezers": [
        {"text": "She used tweezers to remove a small splinter.", "answer": "tweezers"},
        {"text": "The nurse kept clean tweezers in the first-aid kit.", "answer": "tweezers"},
        {"text": "Please hand me the tweezers from the drawer.", "answer": "tweezers"},
    ],
    "twist": [
        {"text": "There was an unexpected twist at the end of the story.", "answer": "twist"},
        {"text": "Do not twist your ankle again by running too soon.", "answer": "twist"},
        {"text": "She gave the cap a twist to open the bottle.", "answer": "twist"},
    ],
    "ubiquitous": [
        {"text": "Smartphones have become ubiquitous in modern life.", "answer": "ubiquitous"},
        {"text": "Coffee shops are ubiquitous in the city center.", "answer": "ubiquitous"},
        {"text": "The brand's logo is now almost ubiquitous online.", "answer": "ubiquitous"},
    ],
    "ubiquity": [
        {"text": "The ubiquity of cameras has changed public behavior.", "answer": "ubiquity"},
        {"text": "People often ignore the ubiquity of digital tracking.", "answer": "ubiquity"},
        {"text": "The ubiquity of the product helped make it a symbol of the era.", "answer": "ubiquity"},
    ],
    "unanswered": [
        {"text": "Several important questions remained unanswered.", "answer": "unanswered"},
        {"text": "The email sat unanswered in her inbox all weekend.", "answer": "unanswered"},
        {"text": "His sudden departure left many doubts unanswered.", "answer": "unanswered"},
    ],
    "unappreciated": [
        {"text": "Many cleaners do essential but unappreciated work.", "answer": "unappreciated"},
        {"text": "He felt unappreciated despite all his effort.", "answer": "unappreciated"},
        {"text": "The artist died poor and unappreciated.", "answer": "unappreciated"},
    ],
    "unavailable": [
        {"text": "The manager is unavailable until after lunch.", "answer": "unavailable"},
        {"text": "Tickets are currently unavailable online.", "answer": "unavailable"},
        {"text": "The medicine became unavailable during the shortage.", "answer": "unavailable"},
    ],
    "unbeatable": [
        {"text": "The view from the hill is unbeatable at sunset.", "answer": "unbeatable"},
        {"text": "Their team seemed unbeatable that season.", "answer": "unbeatable"},
        {"text": "For value and quality, the deal looked unbeatable.", "answer": "unbeatable"},
    ],
    "unchecked": [
        {"text": "Rumors can spread unchecked on social media.", "answer": "unchecked"},
        {"text": "Unchecked growth may damage the local environment.", "answer": "unchecked"},
        {"text": "His anger went unchecked for too long.", "answer": "unchecked"},
    ],
    "uncontacted": [
        {"text": "Several witnesses remained uncontacted after the first appeal.", "answer": "uncontacted"},
        {"text": "The village stayed largely uncontacted for decades.", "answer": "uncontacted"},
        {"text": "A few applicants were left uncontacted by mistake.", "answer": "uncontacted"},
    ],
    "uncover": [
        {"text": "Investigators hope to uncover the source of the leak.", "answer": "uncover"},
        {"text": "The documentary seeks to uncover hidden histories.", "answer": "uncover"},
        {"text": "Workers uncovered ancient walls during the excavation.", "answer": "uncover"},
    ],
    "undecided": [
        {"text": "Many voters are still undecided before the debate.", "answer": "undecided"},
        {"text": "She remains undecided about which course to take.", "answer": "undecided"},
        {"text": "The judge left the matter undecided for the moment.", "answer": "undecided"},
    ],
    "underage": [
        {"text": "It is illegal to sell alcohol to underage customers.", "answer": "underage"},
        {"text": "The club was fined for admitting underage guests.", "answer": "underage"},
        {"text": "Police found several underage drinkers at the party.", "answer": "underage"},
    ],
    "underclass": [
        {"text": "Critics warned against the creation of a permanent underclass.", "answer": "underclass"},
        {"text": "The policy trapped many workers in an urban underclass.", "answer": "underclass"},
        {"text": "He wrote about the struggles of the forgotten underclass.", "answer": "underclass"},
    ],
    "undercover": [
        {"text": "An undercover officer joined the group to gather evidence.", "answer": "undercover"},
        {"text": "She worked undercover for months during the investigation.", "answer": "undercover"},
        {"text": "The film follows an undercover agent in a crime ring.", "answer": "undercover"},
    ],
    "underfoot": [
        {"text": "Please move the boxes so they are not underfoot.", "answer": "underfoot"},
        {"text": "The dog stayed underfoot while we cooked dinner.", "answer": "underfoot"},
        {"text": "Leaves crunched underfoot along the forest path.", "answer": "underfoot"},
    ],
    "undermine": [
        {"text": "False claims can undermine public trust.", "answer": "undermine"},
        {"text": "Constant criticism may undermine a child's confidence.", "answer": "undermine"},
        {"text": "Corruption continues to undermine the reform effort.", "answer": "undermine"},
    ],
    "undeserving": [
        {"text": "Some critics called the award undeserving.", "answer": "undeserving"},
        {"text": "He feared others would see him as undeserving of success.", "answer": "undeserving"},
        {"text": "The article challenged stereotypes about the undeserving poor.", "answer": "undeserving"},
    ],
    "undocumented": [
        {"text": "The archives contain many undocumented photographs.", "answer": "undocumented"},
        {"text": "Some undocumented workers avoid hospitals out of fear.", "answer": "undocumented"},
        {"text": "The system failed because of an undocumented feature.", "answer": "undocumented"},
    ],
    "unearth": [
        {"text": "Archaeologists hope to unearth more tools at the site.", "answer": "unearth"},
        {"text": "The investigation may unearth new evidence.", "answer": "unearth"},
        {"text": "Builders unearthed old coins while digging the foundation.", "answer": "unearth"},
    ],
    "uneducated": [
        {"text": "Many uneducated workers were shut out of new jobs.", "answer": "uneducated"},
        {"text": "He disliked the unfair idea that poor people are uneducated.", "answer": "uneducated"},
        {"text": "An uneducated guess is rarely useful in science.", "answer": "uneducated"},
    ],
    "unending": [
        {"text": "The project felt like an unending series of delays.", "answer": "unending"},
        {"text": "We listened to the unending sound of traffic all night.", "answer": "unending"},
        {"text": "She grew tired of the unending complaints.", "answer": "unending"},
    ],
    "unfeasible": [
        {"text": "The proposal was rejected as financially unfeasible.", "answer": "unfeasible"},
        {"text": "Daily travel from that village is simply unfeasible.", "answer": "unfeasible"},
        {"text": "Without more staff, the plan would be unfeasible.", "answer": "unfeasible"},
    ],
    "unforeseen": [
        {"text": "Unforeseen costs forced them to cut the budget.", "answer": "unforeseen"},
        {"text": "The journey was delayed by unforeseen circumstances.", "answer": "unforeseen"},
        {"text": "Even strong plans can fail because of unforeseen events.", "answer": "unforeseen"},
    ],
    "unify": [
        {"text": "The speech helped unify the divided community.", "answer": "unify"},
        {"text": "The project aims to unify data from several departments.", "answer": "unify"},
        {"text": "A common goal can unify people with different views.", "answer": "unify"},
    ],
    "uninhabitable": [
        {"text": "The flood left several homes uninhabitable.", "answer": "uninhabitable"},
        {"text": "Extreme heat could make parts of the region uninhabitable.", "answer": "uninhabitable"},
        {"text": "Smoke damage made the apartment temporarily uninhabitable.", "answer": "uninhabitable"},
    ],
    "unintended": [
        {"text": "The update had unintended effects on older devices.", "answer": "unintended"},
        {"text": "His joke caused unintended offense.", "answer": "unintended"},
        {"text": "Policies often produce unintended consequences.", "answer": "unintended"},
    ],
    "unintentional": [
        {"text": "The error was unintentional but still serious.", "answer": "unintentional"},
        {"text": "She offered an apology for the unintentional insult.", "answer": "unintentional"},
        {"text": "There was an unintentional gap in the report.", "answer": "unintentional"},
    ],
    "unintentionally": [
        {"text": "He unintentionally revealed the surprise party.", "answer": "unintentionally"},
        {"text": "The teacher unintentionally embarrassed the shy student.", "answer": "unintentionally"},
        {"text": "We unintentionally left the lights on overnight.", "answer": "unintentionally"},
    ],
    "unpaid": [
        {"text": "The staff complained about months of unpaid overtime.", "answer": "unpaid"},
        {"text": "She took unpaid leave to care for her father.", "answer": "unpaid"},
        {"text": "The bill remained unpaid long after the deadline.", "answer": "unpaid"},
    ],
    "unprecedented": [
        {"text": "The country faced an unprecedented public health crisis.", "answer": "unprecedented"},
        {"text": "Demand reached unprecedented levels during the heatwave.", "answer": "unprecedented"},
        {"text": "The judge described the case as unprecedented.", "answer": "unprecedented"},
    ],
    "unpunished": [
        {"text": "The report warned that violence too often goes unpunished.", "answer": "unpunished"},
        {"text": "He could not accept that the crime remained unpunished.", "answer": "unpunished"},
        {"text": "Minor breaches had previously gone unpunished.", "answer": "unpunished"},
    ],
    "unquantifiable": [
        {"text": "The emotional cost of the disaster is unquantifiable.", "answer": "unquantifiable"},
        {"text": "Some benefits of art are real but unquantifiable.", "answer": "unquantifiable"},
        {"text": "They struggled to measure the unquantifiable loss of trust.", "answer": "unquantifiable"},
    ],
    "unrealistically": [
        {"text": "The targets were set unrealistically high.", "answer": "unrealistically"},
        {"text": "She unrealistically expected to finish the work in one hour.", "answer": "unrealistically"},
        {"text": "The plan relies on unrealistically low costs.", "answer": "unrealistically"},
    ],
    "unspoiled": [
        {"text": "They spent the weekend on an unspoiled island.", "answer": "unspoiled"},
        {"text": "The valley remains largely unspoiled by tourism.", "answer": "unspoiled"},
        {"text": "He wanted his children to enjoy an unspoiled childhood.", "answer": "unspoiled"},
    ],
    "unspoken": [
        {"text": "There was an unspoken rule about never mentioning the incident.", "answer": "unspoken"},
        {"text": "Unspoken tension filled the room.", "answer": "unspoken"},
        {"text": "They reached an unspoken agreement to move on.", "answer": "unspoken"},
    ],
    "unstick": [
        {"text": "A little oil may help unstick the old lock.", "answer": "unstick"},
        {"text": "He tried to unstick the drawer without forcing it.", "answer": "unstick"},
        {"text": "Warm water can unstick labels from glass jars.", "answer": "unstick"},
    ],
    "unveil": [
        {"text": "The company will unveil its new logo next week.", "answer": "unveil"},
        {"text": "The mayor helped unveil the statue in the square.", "answer": "unveil"},
        {"text": "Researchers hope to unveil a better treatment soon.", "answer": "unveil"},
    ],
    "unwanted": [
        {"text": "The app blocks unwanted calls automatically.", "answer": "unwanted"},
        {"text": "They cleared the garden of unwanted plants.", "answer": "unwanted"},
        {"text": "Unwanted attention made the actor uncomfortable.", "answer": "unwanted"},
    ],
    "upcoming": [
        {"text": "The upcoming election is already dominating the news.", "answer": "upcoming"},
        {"text": "She is preparing for an upcoming interview.", "answer": "upcoming"},
        {"text": "The museum announced several upcoming exhibitions.", "answer": "upcoming"},
    ],
    "uproot": [
        {"text": "The storm managed to uproot several large trees.", "answer": "uproot"},
        {"text": "War forced many families to uproot and move abroad.", "answer": "uproot"},
        {"text": "The government promised to uproot corruption.", "answer": "uproot"},
    ],
    "upward": [
        {"text": "Prices have shown an upward trend this year.", "answer": "upward"},
        {"text": "She pointed upward toward the ceiling.", "answer": "upward"},
        {"text": "The balloon drifted upward into the clouds.", "answer": "upward"},
    ],
    "urbanization": [
        {"text": "Rapid urbanization has changed the region's economy.", "answer": "urbanization"},
        {"text": "Urbanization often puts pressure on transport systems.", "answer": "urbanization"},
        {"text": "The study examined the effects of urbanization on wildlife.", "answer": "urbanization"},
    ],
    "urgency": [
        {"text": "Her voice conveyed the urgency of the situation.", "answer": "urgency"},
        {"text": "Doctors stressed the urgency of immediate treatment.", "answer": "urgency"},
        {"text": "The letter was marked with great urgency.", "answer": "urgency"},
    ],
    "utterly": [
        {"text": "The village was utterly silent after midnight.", "answer": "utterly"},
        {"text": "His explanation was utterly convincing.", "answer": "utterly"},
        {"text": "They were utterly exhausted after the climb.", "answer": "utterly"},
    ],
    "vague": [
        {"text": "His instructions were too vague to follow.", "answer": "vague"},
        {"text": "She had only a vague memory of the event.", "answer": "vague"},
        {"text": "The witness gave a vague description of the driver.", "answer": "vague"},
    ],
    "validate": [
        {"text": "Researchers need more data to validate the theory.", "answer": "validate"},
        {"text": "You must validate your ticket before boarding.", "answer": "validate"},
        {"text": "Her success helped validate years of hard work.", "answer": "validate"},
    ],
    "vanish": [
        {"text": "The mist began to vanish as the sun rose.", "answer": "vanish"},
        {"text": "He feared the evidence might vanish before police arrived.", "answer": "vanish"},
        {"text": "Childhood anxieties do not always vanish with age.", "answer": "vanish"},
    ],
    "vessel": [
        {"text": "The rescue vessel reached the island at dawn.", "answer": "vessel"},
        {"text": "The surgeon repaired a damaged blood vessel.", "answer": "vessel"},
        {"text": "The clay vessel was found in an ancient tomb.", "answer": "vessel"},
    ],
    "veteran": [
        {"text": "A veteran journalist led the investigation.", "answer": "veteran"},
        {"text": "The event honored military veterans from the region.", "answer": "veteran"},
        {"text": "She remains a veteran teacher after thirty years in the classroom.", "answer": "veteran"},
    ],
    "vibrant": [
        {"text": "The market is known for its vibrant colors and sounds.", "answer": "vibrant"},
        {"text": "The district has a vibrant arts scene.", "answer": "vibrant"},
        {"text": "He returned with a vibrant new vision for the company.", "answer": "vibrant"},
    ],
    "vicious": [
        {"text": "The dog launched a vicious attack without warning.", "answer": "vicious"},
        {"text": "They became trapped in a vicious cycle of debt.", "answer": "vicious"},
        {"text": "The debate turned vicious as tempers rose.", "answer": "vicious"},
    ],
    "viciously": [
        {"text": "The article viciously attacked her reputation.", "answer": "viciously"},
        {"text": "Winds blew viciously along the coast all night.", "answer": "viciously"},
        {"text": "He was viciously criticized for the decision.", "answer": "viciously"},
    ],
    "victimize": [
        {"text": "Bullies often victimize students who seem isolated.", "answer": "victimize"},
        {"text": "The report warned against policies that victimize the poor.", "answer": "victimize"},
        {"text": "Fraud schemes tend to victimize elderly people.", "answer": "victimize"},
    ],
    "villager": [
        {"text": "The villagers gathered in the square after the storm.", "answer": "villager"},
        {"text": "A local villager guided the hikers to the cave.", "answer": "villager"},
        {"text": "Each villager had a different memory of the event.", "answer": "villager"},
    ],
    "virtue": [
        {"text": "Patience is often described as a virtue.", "answer": "virtue"},
        {"text": "The speech praised honesty as a civic virtue.", "answer": "virtue"},
        {"text": "By virtue of her experience, she led the committee.", "answer": "virtue"},
    ],
    "vocalization": [
        {"text": "The study examined bird vocalization in urban parks.", "answer": "vocalization"},
        {"text": "Different kinds of vocalization can signal danger.", "answer": "vocalization"},
        {"text": "Infant vocalization often begins before clear words appear.", "answer": "vocalization"},
    ],
    "vocational": [
        {"text": "She chose vocational training over university.", "answer": "vocational"},
        {"text": "The college offers several vocational courses.", "answer": "vocational"},
        {"text": "Vocational education can open doors to skilled work.", "answer": "vocational"},
    ],
    "vow": [
        {"text": "The mayor made a public vow to improve safety.", "answer": "vow"},
        {"text": "They exchanged vows during the ceremony.", "answer": "vow"},
        {"text": "He vowed never to repeat the same mistake.", "answer": "vow"},
    ],
    "vulnerable": [
        {"text": "Elderly people are especially vulnerable during heatwaves.", "answer": "vulnerable"},
        {"text": "The report found the system vulnerable to cyberattacks.", "answer": "vulnerable"},
        {"text": "Children feel vulnerable when adults ignore them.", "answer": "vulnerable"},
    ],
    "ward": [
        {"text": "She spent three nights in the surgical ward.", "answer": "ward"},
        {"text": "The hospital opened a new ward for elderly patients.", "answer": "ward"},
        {"text": "Visitors were asked to leave the ward by eight o'clock.", "answer": "ward"},
    ],
    "warehouse": [
        {"text": "The goods are stored in a warehouse near the port.", "answer": "warehouse"},
        {"text": "A fire broke out in the old warehouse district.", "answer": "warehouse"},
        {"text": "Workers loaded boxes into the warehouse all morning.", "answer": "warehouse"},
    ],
    "warrior": [
        {"text": "The legend tells of a fearless warrior from the north.", "answer": "warrior"},
        {"text": "He was dressed as a warrior for the stage performance.", "answer": "warrior"},
        {"text": "The museum displayed the armor of an ancient warrior.", "answer": "warrior"},
    ],
    "weave": [
        {"text": "She learned to weave cloth on a wooden loom.", "answer": "weave"},
        {"text": "Drivers had to weave through heavy traffic.", "answer": "weave"},
        {"text": "The writer can weave fact and fiction skillfully.", "answer": "weave"},
    ],
    "whilst": [
        {"text": "He read the report whilst waiting for the train.", "answer": "whilst"},
        {"text": "Some people prefer tea whilst others prefer coffee.", "answer": "whilst"},
        {"text": "She listened quietly whilst they argued.", "answer": "whilst"},
    ],
    "wholly": [
        {"text": "The decision was not wholly unexpected.", "answer": "wholly"},
        {"text": "She was wholly committed to the project.", "answer": "wholly"},
        {"text": "The village depends wholly on tourism in summer.", "answer": "wholly"},
    ],
    "wipe": [
        {"text": "Please wipe the table before dinner.", "answer": "wipe"},
        {"text": "A power cut can wipe all unsaved work.", "answer": "wipe"},
        {"text": "She used a cloth to wipe rain from her glasses.", "answer": "wipe"},
    ],
    "wisely": [
        {"text": "He invested the money wisely and avoided debt.", "answer": "wisely"},
        {"text": "Choose wisely because the offer will not last.", "answer": "wisely"},
        {"text": "The manager wisely postponed the risky launch.", "answer": "wisely"},
    ],
    "wit": [
        {"text": "Her wit made even serious speeches enjoyable.", "answer": "wit"},
        {"text": "He survived the interview with calm and wit.", "answer": "wit"},
        {"text": "The play is full of wit and sharp dialogue.", "answer": "wit"},
    ],
    "wordlessly": [
        {"text": "She nodded wordlessly and walked away.", "answer": "wordlessly"},
        {"text": "The two brothers embraced wordlessly after the reunion.", "answer": "wordlessly"},
        {"text": "He passed her the note wordlessly.", "answer": "wordlessly"},
    ],
    "workout": [
        {"text": "She begins each day with a short workout.", "answer": "workout"},
        {"text": "The coach designed a workout for injured players.", "answer": "workout"},
        {"text": "A hard workout left him sore but satisfied.", "answer": "workout"},
    ],
    "worsen": [
        {"text": "Pollution will worsen if nothing changes.", "answer": "worsen"},
        {"text": "His condition began to worsen overnight.", "answer": "worsen"},
        {"text": "Do not delay treatment because the pain may worsen.", "answer": "worsen"},
    ],
    "worship": [
        {"text": "People gathered to worship at the ancient temple.", "answer": "worship"},
        {"text": "The ceremony reflected local ways of worship.", "answer": "worship"},
        {"text": "Some fans almost worship famous athletes.", "answer": "worship"},
    ],
    "worshipper": [
        {"text": "Each worshipper removed their shoes before entering.", "answer": "worshipper"},
        {"text": "The temple was filled with worshippers at sunrise.", "answer": "worshipper"},
        {"text": "A worshipper placed flowers beside the statue.", "answer": "worshipper"},
    ],
    "worthwhile": [
        {"text": "The training was tiring but worthwhile.", "answer": "worthwhile"},
        {"text": "It is worthwhile to read the full report.", "answer": "worthwhile"},
        {"text": "The long journey proved worthwhile in the end.", "answer": "worthwhile"},
    ],
    "yachtsman": [
        {"text": "An experienced yachtsman guided the boat into the harbor.", "answer": "yachtsman"},
        {"text": "The novel follows a wealthy yachtsman across the Atlantic.", "answer": "yachtsman"},
        {"text": "The rescue team located the missing yachtsman at dawn.", "answer": "yachtsman"},
    ],
    "yell": [
        {"text": "There is no need to yell across the office.", "answer": "yell"},
        {"text": "He let out a yell of excitement when he won.", "answer": "yell"},
        {"text": "She had to yell over the sound of the crowd.", "answer": "yell"},
    ],
    "yield": [
        {"text": "Farmers expect the field to yield more rice this year.", "answer": "yield"},
        {"text": "The company refused to yield to public pressure.", "answer": "yield"},
        {"text": "Drivers must yield at the crossing.", "answer": "yield"},
    ],
    "youngster": [
        {"text": "The camp was designed for energetic youngsters.", "answer": "youngster"},
        {"text": "As a youngster, he spent hours drawing maps.", "answer": "youngster"},
        {"text": "The coach works especially well with shy youngsters.", "answer": "youngster"},
    ],
    "zoological": [
        {"text": "The museum opened a new zoological research center.", "answer": "zoological"},
        {"text": "She wrote a zoological study of rare island birds.", "answer": "zoological"},
        {"text": "The team conducted a zoological survey in the rainforest.", "answer": "zoological"},
    ],
}


def main() -> None:
    bank_path = ROOT / "question_bank_c1.json"
    missing_path = ROOT / "question_bank_c1_missing_sentences.csv"

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
        word = entry["word"]
        sentences = entry.get("sentences") or []
        valid = [
            s
            for s in sentences
            if (s.get("text") or "").strip() and (s.get("answer") or "").strip()
        ]
        if len(valid) < 3:
            rows.append(
                {
                    "word": word,
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

