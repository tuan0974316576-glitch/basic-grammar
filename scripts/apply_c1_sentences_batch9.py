from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SENTENCES = {
    "pollinator": [
        {"text": "Bees are important pollinators in many ecosystems.", "answer": "pollinator"},
        {"text": "The garden was designed to attract every major pollinator.", "answer": "pollinator"},
        {"text": "Without a reliable pollinator, the crop yield may fall.", "answer": "pollinator"},
    ],
    "pond": [
        {"text": "A small pond sits behind the old school building.", "answer": "pond"},
        {"text": "The ducks gathered near the edge of the pond.", "answer": "pond"},
        {"text": "Children watched fish move beneath the pond surface.", "answer": "pond"},
    ],
    "pop": [
        {"text": "The balloon gave a loud pop and scared the baby.", "answer": "pop"},
        {"text": "That song became a pop hit across Asia.", "answer": "pop"},
        {"text": "Please pop the documents into my bag before you leave.", "answer": "pop"},
    ],
    "portfolio": [
        {"text": "She presented her design portfolio during the interview.", "answer": "portfolio"},
        {"text": "A balanced portfolio can reduce investment risk.", "answer": "portfolio"},
        {"text": "The student added new sketches to his portfolio.", "answer": "portfolio"},
    ],
    "portray": [
        {"text": "The film tries to portray the city honestly.", "answer": "portray"},
        {"text": "The article portrays the singer as calm and private.", "answer": "portray"},
        {"text": "Artists often portray light in very different ways.", "answer": "portray"},
    ],
    "postpone": [
        {"text": "Rain forced them to postpone the outdoor concert.", "answer": "postpone"},
        {"text": "We cannot postpone the decision much longer.", "answer": "postpone"},
        {"text": "The school chose to postpone the sports day by one week.", "answer": "postpone"},
    ],
    "posture": [
        {"text": "Good posture can reduce back pain.", "answer": "posture"},
        {"text": "Her stiff posture revealed how nervous she felt.", "answer": "posture"},
        {"text": "The coach corrected the dancer's posture.", "answer": "posture"},
    ],
    "precarious": [
        {"text": "The hikers crossed a precarious bridge above the river.", "answer": "precarious"},
        {"text": "Many families remain in a precarious financial state.", "answer": "precarious"},
        {"text": "The boxes were stacked in a precarious pile.", "answer": "precarious"},
    ],
    "precision": [
        {"text": "The machine cuts steel with remarkable precision.", "answer": "precision"},
        {"text": "The surgeon worked with calm precision.", "answer": "precision"},
        {"text": "Scientific writing demands clarity and precision.", "answer": "precision"},
    ],
    "predator": [
        {"text": "The wolf is a predator that hunts in groups.", "answer": "predator"},
        {"text": "A top predator helps keep the ecosystem balanced.", "answer": "predator"},
        {"text": "The documentary followed a marine predator through winter.", "answer": "predator"},
    ],
    "predecessor": [
        {"text": "The new phone is lighter than its predecessor.", "answer": "predecessor"},
        {"text": "She learned from the mistakes of her predecessor.", "answer": "predecessor"},
        {"text": "The current law replaced an older predecessor.", "answer": "predecessor"},
    ],
    "predicament": [
        {"text": "They found themselves in a difficult predicament after the flood.", "answer": "predicament"},
        {"text": "Her speech addressed the town's economic predicament.", "answer": "predicament"},
        {"text": "The novel begins with the hero trapped in a strange predicament.", "answer": "predicament"},
    ],
    "prejudice": [
        {"text": "The campaign aims to reduce racial prejudice.", "answer": "prejudice"},
        {"text": "Teachers should challenge prejudice in every form.", "answer": "prejudice"},
        {"text": "The article explores how prejudice can be passed on quietly.", "answer": "prejudice"},
    ],
    "preliminary": [
        {"text": "The team shared preliminary results on Friday.", "answer": "preliminary"},
        {"text": "A preliminary meeting was held before the main event.", "answer": "preliminary"},
        {"text": "The judge made a preliminary ruling on the case.", "answer": "preliminary"},
    ],
    "premier": [
        {"text": "The film will premier at the festival next month.", "answer": "premier"},
        {"text": "It remains one of the city's premier cultural events.", "answer": "premier"},
        {"text": "The team's premier striker missed the final.", "answer": "premier"},
    ],
    "premise": [
        {"text": "The novel is built on an unusual premise.", "answer": "premise"},
        {"text": "The argument rests on a false premise.", "answer": "premise"},
        {"text": "Its central premise is simple but powerful.", "answer": "premise"},
    ],
    "premium": [
        {"text": "Customers pay a premium for fresh local produce.", "answer": "premium"},
        {"text": "This service includes premium support for members.", "answer": "premium"},
        {"text": "They sell coffee beans at a premium price.", "answer": "premium"},
    ],
    "preoccupation": [
        {"text": "His preoccupation with detail slowed the whole team.", "answer": "preoccupation"},
        {"text": "The book explores society's preoccupation with success.", "answer": "preoccupation"},
        {"text": "Her main preoccupation was the safety of the children.", "answer": "preoccupation"},
    ],
    "prescribe": [
        {"text": "Doctors may prescribe rest as well as medicine.", "answer": "prescribe"},
        {"text": "The law does not prescribe one exact solution.", "answer": "prescribe"},
        {"text": "The physician prescribed stronger tablets for the pain.", "answer": "prescribe"},
    ],
    "prescription": [
        {"text": "You need a prescription to buy that medicine.", "answer": "prescription"},
        {"text": "The pharmacist checked the prescription carefully.", "answer": "prescription"},
        {"text": "Her glasses were made to a new prescription.", "answer": "prescription"},
    ],
    "preservation": [
        {"text": "The trust supports the preservation of old buildings.", "answer": "preservation"},
        {"text": "Food preservation was once essential for every household.", "answer": "preservation"},
        {"text": "The museum focuses on the preservation of local history.", "answer": "preservation"},
    ],
    "preservationist": [
        {"text": "A preservationist argued against the demolition plan.", "answer": "preservationist"},
        {"text": "The preservationist worked to save the theater.", "answer": "preservationist"},
        {"text": "Many preservationists opposed the tower project.", "answer": "preservationist"},
    ],
    "prestigious": [
        {"text": "She studied at a prestigious university abroad.", "answer": "prestigious"},
        {"text": "Winning the prize is highly prestigious in that field.", "answer": "prestigious"},
        {"text": "The school has a prestigious reputation for science.", "answer": "prestigious"},
    ],
    "presumably": [
        {"text": "He left early, presumably to catch the last train.", "answer": "presumably"},
        {"text": "The money was, presumably, transferred yesterday.", "answer": "presumably"},
        {"text": "They are presumably aware of the risk by now.", "answer": "presumably"},
    ],
    "presume": [
        {"text": "I presume the meeting will start on time.", "answer": "presume"},
        {"text": "Do not presume that silence means agreement.", "answer": "presume"},
        {"text": "The court must not presume guilt without evidence.", "answer": "presume"},
    ],
    "preteen": [
        {"text": "The novel is aimed at preteen readers.", "answer": "preteen"},
        {"text": "Many preteen children now use phones daily.", "answer": "preteen"},
        {"text": "The club runs special workshops for preteen groups.", "answer": "preteen"},
    ],
    "prettiness": [
        {"text": "The room's prettiness came from its simple flowers and light.", "answer": "prettiness"},
        {"text": "The film values truth over surface prettiness.", "answer": "prettiness"},
        {"text": "There was a quiet prettiness to the old street.", "answer": "prettiness"},
    ],
    "prevail": [
        {"text": "Common sense should prevail in the end.", "answer": "prevail"},
        {"text": "Strong winds will prevail along the coast tonight.", "answer": "prevail"},
        {"text": "Justice did not always prevail in those years.", "answer": "prevail"},
    ],
    "primitive": [
        {"text": "The museum displays primitive farming tools.", "answer": "primitive"},
        {"text": "The hut was built from primitive materials.", "answer": "primitive"},
        {"text": "Critics warned against a return to primitive methods.", "answer": "primitive"},
    ],
    "principal": [
        {"text": "The principal welcomed new students to the school.", "answer": "principal"},
        {"text": "The river is the principal source of water here.", "answer": "principal"},
        {"text": "Our principal concern is safety at the site.", "answer": "principal"},
    ],
    "privilege": [
        {"text": "Access to that archive is a rare privilege.", "answer": "privilege"},
        {"text": "Education should be a right, not a privilege.", "answer": "privilege"},
        {"text": "He felt it was a privilege to speak there.", "answer": "privilege"},
    ],
    "problematic": [
        {"text": "The report describes the policy as problematic.", "answer": "problematic"},
        {"text": "Some of his comments were seen as problematic.", "answer": "problematic"},
        {"text": "The system becomes problematic when demand rises.", "answer": "problematic"},
    ],
    "productive": [
        {"text": "The meeting was short but highly productive.", "answer": "productive"},
        {"text": "Good rest helps people stay productive.", "answer": "productive"},
        {"text": "They hope to make the land more productive.", "answer": "productive"},
    ],
    "productivity": [
        {"text": "The software improved office productivity quickly.", "answer": "productivity"},
        {"text": "Fatigue can reduce productivity over time.", "answer": "productivity"},
        {"text": "Managers are under pressure to raise productivity.", "answer": "productivity"},
    ],
    "proficient": [
        {"text": "She is proficient in both French and Spanish.", "answer": "proficient"},
        {"text": "Workers must be proficient with the equipment before use.", "answer": "proficient"},
        {"text": "He became proficient after months of practice.", "answer": "proficient"},
    ],
    "profound": [
        {"text": "The book had a profound effect on my thinking.", "answer": "profound"},
        {"text": "The town felt a profound sense of loss.", "answer": "profound"},
        {"text": "The discovery may bring profound change.", "answer": "profound"},
    ],
    "projection": [
        {"text": "The sales projection looked too optimistic.", "answer": "projection"},
        {"text": "A projection of the map appeared on the wall.", "answer": "projection"},
        {"text": "Budget projection for next year remains uncertain.", "answer": "projection"},
    ],
    "proliferation": [
        {"text": "The report warns of the proliferation of fake news.", "answer": "proliferation"},
        {"text": "Scientists tracked the rapid proliferation of the cells.", "answer": "proliferation"},
        {"text": "The city saw a proliferation of new cafes.", "answer": "proliferation"},
    ],
    "prolong": [
        {"text": "Heavy debate may prolong the vote until midnight.", "answer": "prolong"},
        {"text": "Doctors tried to prolong his life with treatment.", "answer": "prolong"},
        {"text": "Do not prolong the meeting without clear purpose.", "answer": "prolong"},
    ],
    "prominent": [
        {"text": "She is one of the city's most prominent architects.", "answer": "prominent"},
        {"text": "A prominent crack ran across the wall.", "answer": "prominent"},
        {"text": "The issue became prominent in national debate.", "answer": "prominent"},
    ],
    "prospective": [
        {"text": "Prospective students were invited to visit the campus.", "answer": "prospective"},
        {"text": "The company met with several prospective buyers.", "answer": "prospective"},
        {"text": "Each prospective employee must attend training.", "answer": "prospective"},
    ],
    "prosperity": [
        {"text": "The city enjoyed years of economic prosperity.", "answer": "prosperity"},
        {"text": "Peace and prosperity rarely come by chance.", "answer": "prosperity"},
        {"text": "The policy aims to spread prosperity more widely.", "answer": "prosperity"},
    ],
    "protective": [
        {"text": "She wore protective gloves while cleaning the machine.", "answer": "protective"},
        {"text": "He became deeply protective of his younger sister.", "answer": "protective"},
        {"text": "Protective clothing is required in the lab.", "answer": "protective"},
    ],
    "provider": [
        {"text": "The internet provider promised faster service by June.", "answer": "provider"},
        {"text": "She changed healthcare provider last year.", "answer": "provider"},
        {"text": "The school works with a local meal provider.", "answer": "provider"},
    ],
    "province": [
        {"text": "The storm hit several towns across the province.", "answer": "province"},
        {"text": "He grew up in a quiet province in the north.", "answer": "province"},
        {"text": "The museum focuses on trade within the old province.", "answer": "province"},
    ],
    "provisional": [
        {"text": "The school issued a provisional timetable for next term.", "answer": "provisional"},
        {"text": "They reached a provisional agreement after long talks.", "answer": "provisional"},
        {"text": "The winners remain provisional until checks are complete.", "answer": "provisional"},
    ],
    "provocative": [
        {"text": "The article makes a provocative claim about education.", "answer": "provocative"},
        {"text": "His provocative tone upset several listeners.", "answer": "provocative"},
        {"text": "The artist is known for provocative public work.", "answer": "provocative"},
    ],
    "provoke": [
        {"text": "The decision may provoke strong opposition.", "answer": "provoke"},
        {"text": "Do not provoke the dog by waving your hands.", "answer": "provoke"},
        {"text": "The film will provoke debate about responsibility.", "answer": "provoke"},
    ],
    "prowess": [
        {"text": "The striker is admired for his scoring prowess.", "answer": "prowess"},
        {"text": "Her technical prowess impressed the judges.", "answer": "prowess"},
        {"text": "The company showed financial prowess during the crisis.", "answer": "prowess"},
    ],
    "publicize": [
        {"text": "The charity used social media to publicize the event.", "answer": "publicize"},
        {"text": "The museum hopes to publicize its new exhibition widely.", "answer": "publicize"},
        {"text": "They did not want to publicize the dispute.", "answer": "publicize"},
    ],
    "puddle": [
        {"text": "A large puddle formed outside the station.", "answer": "puddle"},
        {"text": "The child jumped into every puddle on the road.", "answer": "puddle"},
        {"text": "A thin puddle of oil lay beneath the truck.", "answer": "puddle"},
    ],
    "pulse": [
        {"text": "The doctor checked her pulse before the test.", "answer": "pulse"},
        {"text": "Flashing lights moved in time with the pulse of the music.", "answer": "pulse"},
        {"text": "His pulse quickened as the door opened.", "answer": "pulse"},
    ],
    "puma": [
        {"text": "A puma was seen near the edge of the reserve.", "answer": "puma"},
        {"text": "The documentary follows a puma through the mountains.", "answer": "puma"},
        {"text": "Few people ever spot a wild puma up close.", "answer": "puma"},
    ],
    "pump": [
        {"text": "Workers used a pump to remove water from the tunnel.", "answer": "pump"},
        {"text": "The heart is a muscle that helps pump blood.", "answer": "pump"},
        {"text": "A broken pump stopped the fountain from working.", "answer": "pump"},
    ],
    "punctuality": [
        {"text": "The company values punctuality and clear communication.", "answer": "punctuality"},
        {"text": "His punctuality made him easy to work with.", "answer": "punctuality"},
        {"text": "Teachers praised her punctuality throughout the year.", "answer": "punctuality"},
    ],
    "punctuate": [
        {"text": "Please punctuate each sentence correctly.", "answer": "punctuate"},
        {"text": "Short pauses punctuate her speech naturally.", "answer": "punctuate"},
        {"text": "The report uses charts to punctuate key points.", "answer": "punctuate"},
    ],
    "purposefully": [
        {"text": "She walked purposefully toward the stage.", "answer": "purposefully"},
        {"text": "The team used silence purposefully in the performance.", "answer": "purposefully"},
        {"text": "He avoided the question purposefully.", "answer": "purposefully"},
    ],
    "query": [
        {"text": "Please send any query to the support team.", "answer": "query"},
        {"text": "The customer raised a query about the missing fee.", "answer": "query"},
        {"text": "A simple database query produced the result.", "answer": "query"},
    ],
    "quota": [
        {"text": "Each school was given a fixed quota of places.", "answer": "quota"},
        {"text": "The country raised its export quota this year.", "answer": "quota"},
        {"text": "Workers struggled to meet the daily quota.", "answer": "quota"},
    ],
    "rack": [
        {"text": "Please place your coat on the rack.", "answer": "rack"},
        {"text": "The shop displayed postcards on a metal rack.", "answer": "rack"},
        {"text": "A bike rack was added near the station entrance.", "answer": "rack"},
    ],
    "radar": [
        {"text": "The storm appeared clearly on weather radar.", "answer": "radar"},
        {"text": "The pilot checked radar before changing course.", "answer": "radar"},
        {"text": "A speed radar camera was hidden near the bridge.", "answer": "radar"},
    ],
    "radical": [
        {"text": "The group proposed a radical change in policy.", "answer": "radical"},
        {"text": "Her surgery marked a radical step toward recovery.", "answer": "radical"},
        {"text": "The new design takes a radical approach to housing.", "answer": "radical"},
    ],
    "radically": [
        {"text": "The market changed radically after the merger.", "answer": "radically"},
        {"text": "Their views differ radically on this issue.", "answer": "radically"},
        {"text": "Technology can radically alter daily life.", "answer": "radically"},
    ],
    "raid": [
        {"text": "Police carried out a dawn raid on the warehouse.", "answer": "raid"},
        {"text": "The thieves planned a raid on the storage site.", "answer": "raid"},
        {"text": "A sudden raid uncovered illegal goods.", "answer": "raid"},
    ],
    "ramification": [
        {"text": "The legal ramifications of the decision are still unclear.", "answer": "ramification"},
        {"text": "Every policy change has social ramifications.", "answer": "ramification"},
        {"text": "They failed to consider the full ramifications of the deal.", "answer": "ramification"},
    ],
    "ranch": [
        {"text": "The family runs a cattle ranch in the dry valley.", "answer": "ranch"},
        {"text": "He spent a summer working on a horse ranch.", "answer": "ranch"},
        {"text": "The ranch lies several miles from the nearest town.", "answer": "ranch"},
    ],
    "rational": [
        {"text": "We need a calm and rational discussion.", "answer": "rational"},
        {"text": "She made a rational choice based on the facts.", "answer": "rational"},
        {"text": "Fear can make it hard to remain rational.", "answer": "rational"},
    ],
    "reactionary": [
        {"text": "The article criticizes a reactionary political movement.", "answer": "reactionary"},
        {"text": "Some leaders gave a reactionary response to reform.", "answer": "reactionary"},
        {"text": "The speech sounded more reactionary than practical.", "answer": "reactionary"},
    ],
    "readership": [
        {"text": "The newspaper's readership has grown online.", "answer": "readership"},
        {"text": "The magazine targets a young urban readership.", "answer": "readership"},
        {"text": "Its loyal readership kept the journal alive.", "answer": "readership"},
    ],
    "readily": [
        {"text": "The information is readily available on the website.", "answer": "readily"},
        {"text": "She readily admitted the mistake.", "answer": "readily"},
        {"text": "Fresh water is not readily found in the desert.", "answer": "readily"},
    ],
    "realm": [
        {"text": "The issue belongs to the realm of ethics rather than law.", "answer": "realm"},
        {"text": "In the realm of music, she is widely respected.", "answer": "realm"},
        {"text": "The story moves between the real world and a magical realm.", "answer": "realm"},
    ],
    "reassure": [
        {"text": "Doctors tried to reassure the anxious family.", "answer": "reassure"},
        {"text": "A smile can reassure a frightened child.", "answer": "reassure"},
        {"text": "Officials released a statement to reassure investors.", "answer": "reassure"},
    ],
    "rebellious": [
        {"text": "He went through a rebellious phase as a teenager.", "answer": "rebellious"},
        {"text": "The film follows a rebellious young musician.", "answer": "rebellious"},
        {"text": "Her rebellious attitude often challenged school rules.", "answer": "rebellious"},
    ],
    "recharge": [
        {"text": "The battery takes two hours to recharge fully.", "answer": "recharge"},
        {"text": "She went hiking to recharge after a stressful month.", "answer": "recharge"},
        {"text": "Please recharge the camera before the trip.", "answer": "recharge"},
    ],
    "recipient": [
        {"text": "The award recipient thanked the whole team.", "answer": "recipient"},
        {"text": "Please write the recipient's address clearly.", "answer": "recipient"},
        {"text": "The scholarship recipient will be announced tomorrow.", "answer": "recipient"},
    ],
    "recite": [
        {"text": "Students were asked to recite the poem from memory.", "answer": "recite"},
        {"text": "He can recite long passages without hesitation.", "answer": "recite"},
        {"text": "She stood up to recite her speech.", "answer": "recite"},
    ],
    "recognizable": [
        {"text": "The logo is instantly recognizable across the city.", "answer": "recognizable"},
        {"text": "After the storm, the street was barely recognizable.", "answer": "recognizable"},
        {"text": "His voice remains clearly recognizable.", "answer": "recognizable"},
    ],
    "reconstruct": [
        {"text": "Police tried to reconstruct the final minutes before the fire.", "answer": "reconstruct"},
        {"text": "Engineers will reconstruct the damaged bridge next year.", "answer": "reconstruct"},
        {"text": "Historians often reconstruct daily life from tiny details.", "answer": "reconstruct"},
    ],
    "reconstruction": [
        {"text": "The town began reconstruction after the earthquake.", "answer": "reconstruction"},
        {"text": "Digital reconstruction helped show the old temple's shape.", "answer": "reconstruction"},
        {"text": "The report outlines a plan for postwar reconstruction.", "answer": "reconstruction"},
    ],
    "recount": [
        {"text": "She began to recount what happened at the station.", "answer": "recount"},
        {"text": "The book recounts a journey across the desert.", "answer": "recount"},
        {"text": "Witnesses were asked to recount the event in order.", "answer": "recount"},
    ],
    "recurrent": [
        {"text": "He suffers from recurrent headaches in winter.", "answer": "recurrent"},
        {"text": "Flooding is a recurrent problem in the district.", "answer": "recurrent"},
        {"text": "The novel returns to a recurrent theme of loss.", "answer": "recurrent"},
    ],
    "reddish": [
        {"text": "The sky turned a reddish gold at sunset.", "answer": "reddish"},
        {"text": "A reddish stain appeared on the wall.", "answer": "reddish"},
        {"text": "The clay has a reddish color after rain.", "answer": "reddish"},
    ],
    "redeem": [
        {"text": "You can redeem the voucher online.", "answer": "redeem"},
        {"text": "He hoped to redeem his earlier mistake with hard work.", "answer": "redeem"},
        {"text": "Points can be redeemed for free tickets.", "answer": "redeem"},
    ],
    "reflection": [
        {"text": "The lake held a perfect reflection of the mountain.", "answer": "reflection"},
        {"text": "Her essay is a thoughtful reflection on childhood.", "answer": "reflection"},
        {"text": "The report offers useful reflection on recent failures.", "answer": "reflection"},
    ],
    "reform": [
        {"text": "The minister promised urgent reform of the housing system.", "answer": "reform"},
        {"text": "Many teachers support reform in public exams.", "answer": "reform"},
        {"text": "The group campaigns to reform outdated laws.", "answer": "reform"},
    ],
    "refresh": [
        {"text": "A short walk helped refresh her mind.", "answer": "refresh"},
        {"text": "Press the button to refresh the page.", "answer": "refresh"},
        {"text": "Cold water can refresh you on a hot day.", "answer": "refresh"},
    ],
    "refusal": [
        {"text": "His refusal to explain caused more suspicion.", "answer": "refusal"},
        {"text": "The visa office sent a formal refusal letter.", "answer": "refusal"},
        {"text": "Their refusal to cooperate slowed the inquiry.", "answer": "refusal"},
    ],
    "regain": [
        {"text": "The team hopes to regain public trust soon.", "answer": "regain"},
        {"text": "She worked hard to regain her strength.", "answer": "regain"},
        {"text": "The airline is trying to regain lost customers.", "answer": "regain"},
    ],
    "regulator": [
        {"text": "The financial regulator opened an investigation.", "answer": "regulator"},
        {"text": "A damaged regulator caused the pressure drop.", "answer": "regulator"},
        {"text": "The energy regulator announced new rules.", "answer": "regulator"},
    ],
    "regulatory": [
        {"text": "The new product must pass strict regulatory checks.", "answer": "regulatory"},
        {"text": "Banks face growing regulatory pressure.", "answer": "regulatory"},
        {"text": "The report examines regulatory failures in the system.", "answer": "regulatory"},
    ],
    "rehabilitation": [
        {"text": "The athlete spent months in rehabilitation after the injury.", "answer": "rehabilitation"},
        {"text": "Wildlife rehabilitation centers care for injured birds.", "answer": "rehabilitation"},
        {"text": "The prison introduced a rehabilitation program for young offenders.", "answer": "rehabilitation"},
    ],
    "reign": [
        {"text": "The museum explores life during the king's reign.", "answer": "reign"},
        {"text": "For years, uncertainty seemed to reign in the market.", "answer": "reign"},
        {"text": "The queen's long reign shaped national identity.", "answer": "reign"},
    ],
    "related to": [
        {"text": "The article covers issues related to online privacy.", "answer": "related to"},
        {"text": "Stress related to work can affect sleep.", "answer": "related to"},
        {"text": "Please collect any files related to the case.", "answer": "related to"},
    ],
    "relic": [
        {"text": "Archaeologists found a relic buried near the temple.", "answer": "relic"},
        {"text": "The old train is a relic of another era.", "answer": "relic"},
        {"text": "The museum's oldest relic was placed in a glass case.", "answer": "relic"},
    ],
    "reluctance": [
        {"text": "Her reluctance to speak was easy to notice.", "answer": "reluctance"},
        {"text": "Many showed reluctance to change the schedule.", "answer": "reluctance"},
        {"text": "His reluctance came from fear of failure.", "answer": "reluctance"},
    ],
    "reluctant": [
        {"text": "He was reluctant to leave the old neighborhood.", "answer": "reluctant"},
        {"text": "Investors are reluctant to take further risks.", "answer": "reluctant"},
        {"text": "She seemed reluctant to answer the question directly.", "answer": "reluctant"},
    ],
    "reminder": [
        {"text": "The old photograph is a reminder of home.", "answer": "reminder"},
        {"text": "Please set a reminder for the meeting.", "answer": "reminder"},
        {"text": "The memorial stands as a reminder of the disaster.", "answer": "reminder"},
    ],
    "removal": [
        {"text": "The removal of the old bridge took several days.", "answer": "removal"},
        {"text": "Doctors recommended removal of the damaged tissue.", "answer": "removal"},
        {"text": "Snow removal is a major task in winter.", "answer": "removal"},
    ],
    "renew": [
        {"text": "You need to renew your passport before July.", "answer": "renew"},
        {"text": "The city hopes to renew the old market area.", "answer": "renew"},
        {"text": "Their contract was renewed for another year.", "answer": "renew"},
    ],
    "renminbi": [
        {"text": "The invoice was paid in renminbi.", "answer": "renminbi"},
        {"text": "Exchange rates for renminbi changed slightly today.", "answer": "renminbi"},
        {"text": "The trader monitors the value of the renminbi closely.", "answer": "renminbi"},
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
