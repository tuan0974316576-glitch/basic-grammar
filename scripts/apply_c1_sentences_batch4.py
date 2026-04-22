from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SENTENCES = {
    "disastrous": [
        {"text": "The team suffered a disastrous defeat in the final.", "answer": "disastrous"},
        {"text": "The flood had disastrous effects on local farms.", "answer": "disastrous"},
        {"text": "A disastrous mistake forced the company to apologize.", "answer": "disastrous"},
    ],
    "disbelieve": [
        {"text": "It was hard to disbelieve the evidence in front of us.", "answer": "disbelieve"},
        {"text": "She could hardly disbelieve her own luck.", "answer": "disbelieve"},
        {"text": "Many people disbelieve rumors until they see proof.", "answer": "disbelieve"},
    ],
    "discard": [
        {"text": "Do not discard useful notes after one exam.", "answer": "discard"},
        {"text": "The machine can sort and discard damaged parts.", "answer": "discard"},
        {"text": "They decided to discard the outdated plan.", "answer": "discard"},
    ],
    "discharge": [
        {"text": "The hospital plans to discharge the patient tomorrow.", "answer": "discharge"},
        {"text": "The factory was fined for illegal waste discharge.", "answer": "discharge"},
        {"text": "After the storm, the battery began to discharge quickly.", "answer": "discharge"},
    ],
    "disclosure": [
        {"text": "The company delayed disclosure of the agreement.", "answer": "disclosure"},
        {"text": "Full disclosure of the risks is required by law.", "answer": "disclosure"},
        {"text": "The disclosure caused concern among investors.", "answer": "disclosure"},
    ],
    "discomfort": [
        {"text": "He felt slight discomfort in his knee after the run.", "answer": "discomfort"},
        {"text": "Her speech caused visible discomfort among the guests.", "answer": "discomfort"},
        {"text": "The chair was stylish but offered little comfort and much discomfort.", "answer": "discomfort"},
    ],
    "discontent": [
        {"text": "Public discontent grew as prices continued to rise.", "answer": "discontent"},
        {"text": "The article reflected deep discontent with the policy.", "answer": "discontent"},
        {"text": "Years of discontent finally led to protest.", "answer": "discontent"},
    ],
    "discriminate": [
        {"text": "It is illegal to discriminate against workers because of age.", "answer": "discriminate"},
        {"text": "Plants can discriminate between light and shade.", "answer": "discriminate"},
        {"text": "Good judges must discriminate carefully between fact and opinion.", "answer": "discriminate"},
    ],
    "discrimination": [
        {"text": "The school adopted a policy against discrimination.", "answer": "discrimination"},
        {"text": "Many activists fight against racial discrimination.", "answer": "discrimination"},
        {"text": "The law offers protection from workplace discrimination.", "answer": "discrimination"},
    ],
    "disdain": [
        {"text": "He looked at the cheap copy with open disdain.", "answer": "disdain"},
        {"text": "Her tone suggested disdain for the whole process.", "answer": "disdain"},
        {"text": "The article expressed disdain for empty political slogans.", "answer": "disdain"},
    ],
    "disengagement": [
        {"text": "Student disengagement became obvious during the lecture.", "answer": "disengagement"},
        {"text": "The report links social media fatigue to emotional disengagement.", "answer": "disengagement"},
        {"text": "A lack of challenge can lead to disengagement at work.", "answer": "disengagement"},
    ],
    "disinfect": [
        {"text": "Please disinfect the table before the next class.", "answer": "disinfect"},
        {"text": "Workers were asked to disinfect shared equipment daily.", "answer": "disinfect"},
        {"text": "The nurse used alcohol to disinfect the cut.", "answer": "disinfect"},
    ],
    "disintegrate": [
        {"text": "The old paper began to disintegrate in her hands.", "answer": "disintegrate"},
        {"text": "Without trust, the alliance may disintegrate quickly.", "answer": "disintegrate"},
        {"text": "The rock seemed to disintegrate after the blast.", "answer": "disintegrate"},
    ],
    "dispenser": [
        {"text": "There is a soap dispenser beside the sink.", "answer": "dispenser"},
        {"text": "The office installed a water dispenser in the hall.", "answer": "dispenser"},
        {"text": "He pressed the dispenser twice for more cream.", "answer": "dispenser"},
    ],
    "disposal": [
        {"text": "Safe disposal of medical waste is essential.", "answer": "disposal"},
        {"text": "The city changed its rules on plastic disposal.", "answer": "disposal"},
        {"text": "Funds were placed at the committee's disposal.", "answer": "disposal"},
    ],
    "dispose": [
        {"text": "Please dispose of batteries in the proper bin.", "answer": "dispose"},
        {"text": "The team needed a day to dispose of the old files.", "answer": "dispose"},
        {"text": "His calm manner disposed people to trust him.", "answer": "dispose"},
    ],
    "dispute": [
        {"text": "The two companies entered a dispute over ownership.", "answer": "dispute"},
        {"text": "Nobody can dispute the need for safer roads.", "answer": "dispute"},
        {"text": "The border dispute lasted for years.", "answer": "dispute"},
    ],
    "disqualification": [
        {"text": "A false start led to his immediate disqualification.", "answer": "disqualification"},
        {"text": "The rules clearly state the grounds for disqualification.", "answer": "disqualification"},
        {"text": "The athlete appealed against her disqualification.", "answer": "disqualification"},
    ],
    "disrupt": [
        {"text": "The strike may disrupt public transport tomorrow.", "answer": "disrupt"},
        {"text": "Do not disrupt the class with side conversations.", "answer": "disrupt"},
        {"text": "New technology can disrupt entire industries.", "answer": "disrupt"},
    ],
    "disruption": [
        {"text": "Flight disruption continued throughout the morning.", "answer": "disruption"},
        {"text": "The school prepared for possible internet disruption.", "answer": "disruption"},
        {"text": "Major disruption followed the power failure.", "answer": "disruption"},
    ],
    "distinction": [
        {"text": "There is an important distinction between price and value.", "answer": "distinction"},
        {"text": "She graduated with distinction from the university.", "answer": "distinction"},
        {"text": "The award recognizes distinction in public service.", "answer": "distinction"},
    ],
    "distinctive": [
        {"text": "The singer has a highly distinctive voice.", "answer": "distinctive"},
        {"text": "The building's distinctive shape can be seen from far away.", "answer": "distinctive"},
        {"text": "A distinctive smell filled the old kitchen.", "answer": "distinctive"},
    ],
    "distortion": [
        {"text": "The mirror caused a slight distortion of the image.", "answer": "distortion"},
        {"text": "The article was criticized for distortion of the facts.", "answer": "distortion"},
        {"text": "Heat can create visual distortion above the road.", "answer": "distortion"},
    ],
    "distraction": [
        {"text": "Phone notifications are a major distraction during study.", "answer": "distraction"},
        {"text": "The noise outside became a constant distraction.", "answer": "distraction"},
        {"text": "Some people use music as a distraction from stress.", "answer": "distraction"},
    ],
    "distress": [
        {"text": "The child was in obvious distress after the fall.", "answer": "distress"},
        {"text": "Financial distress forced the shop to close.", "answer": "distress"},
        {"text": "A distress signal was sent from the damaged boat.", "answer": "distress"},
    ],
    "divergent": [
        {"text": "The two reports reached divergent conclusions.", "answer": "divergent"},
        {"text": "The group held divergent views on the issue.", "answer": "divergent"},
        {"text": "Their careers followed increasingly divergent paths.", "answer": "divergent"},
    ],
    "divert": [
        {"text": "Police had to divert traffic away from the accident.", "answer": "divert"},
        {"text": "The canal was built to divert water from the river.", "answer": "divert"},
        {"text": "She tried to divert attention from the mistake.", "answer": "divert"},
    ],
    "dormitory": [
        {"text": "The students returned to the dormitory after dinner.", "answer": "dormitory"},
        {"text": "The new dormitory can house two hundred students.", "answer": "dormitory"},
        {"text": "Lights in the dormitory went out at midnight.", "answer": "dormitory"},
    ],
    "dough": [
        {"text": "The baker left the dough to rise by the window.", "answer": "dough"},
        {"text": "She kneaded the dough until it felt smooth.", "answer": "dough"},
        {"text": "Too much water can ruin the dough.", "answer": "dough"},
    ],
    "downfall": [
        {"text": "Greed eventually led to his downfall.", "answer": "downfall"},
        {"text": "The film shows the downfall of a powerful leader.", "answer": "downfall"},
        {"text": "A series of bad choices caused the company's downfall.", "answer": "downfall"},
    ],
    "downside": [
        {"text": "The downside of remote work is the lack of social contact.", "answer": "downside"},
        {"text": "Every solution has some downside to consider.", "answer": "downside"},
        {"text": "The phone is excellent, but its battery life is a downside.", "answer": "downside"},
    ],
    "drain": [
        {"text": "The sink will not empty because the drain is blocked.", "answer": "drain"},
        {"text": "Long meetings can drain your energy.", "answer": "drain"},
        {"text": "Heavy rain caused the street drains to overflow.", "answer": "drain"},
    ],
    "drastic": [
        {"text": "The company announced drastic changes to its structure.", "answer": "drastic"},
        {"text": "Drastic action may be needed to save the forest.", "answer": "drastic"},
        {"text": "There was a drastic fall in demand last month.", "answer": "drastic"},
    ],
    "drastically": [
        {"text": "Food prices rose drastically after the storm.", "answer": "drastically"},
        {"text": "The design changed drastically in the final version.", "answer": "drastically"},
        {"text": "Her opinion shifted drastically over time.", "answer": "drastically"},
    ],
    "drawback": [
        {"text": "The main drawback of the plan is its cost.", "answer": "drawback"},
        {"text": "Every technology has at least one drawback.", "answer": "drawback"},
        {"text": "A major drawback of the apartment is the noise.", "answer": "drawback"},
    ],
    "dreary": [
        {"text": "The weather remained cold, wet, and dreary all day.", "answer": "dreary"},
        {"text": "They spent a dreary afternoon waiting in the station.", "answer": "dreary"},
        {"text": "The office looked dreary under the grey light.", "answer": "dreary"},
    ],
    "drift": [
        {"text": "Small boats began to drift toward the rocks.", "answer": "drift"},
        {"text": "Her thoughts started to drift during the lecture.", "answer": "drift"},
        {"text": "Snow can drift across the road overnight.", "answer": "drift"},
    ],
    "drill": [
        {"text": "The school held a fire drill in the morning.", "answer": "drill"},
        {"text": "Workers used a drill to fix the metal frame.", "answer": "drill"},
        {"text": "The coach made the team repeat the drill five times.", "answer": "drill"},
    ],
    "drone": [
        {"text": "A drone captured aerial footage of the coastline.", "answer": "drone"},
        {"text": "The farmer used a drone to inspect the field.", "answer": "drone"},
        {"text": "New laws limit where a drone may be flown.", "answer": "drone"},
    ],
    "droplet": [
        {"text": "A tiny droplet of water rolled down the leaf.", "answer": "droplet"},
        {"text": "Each droplet reflected the morning light.", "answer": "droplet"},
        {"text": "The mask helps block infected droplets.", "answer": "droplet"},
    ],
    "drown": [
        {"text": "He nearly drown?","answer":"drown"},
        {"text": "Loud music can drown out an important announcement.", "answer": "drown"},
        {"text": "Rescuers acted fast to stop the victim from starting to drown.", "answer": "drown"},
    ],
    "dub": [
        {"text": "The media quickly dubbed the plan a miracle cure.", "answer": "dub"},
        {"text": "The documentary was dubbed into three languages.", "answer": "dub"},
        {"text": "Fans dubbed him the king of the tournament.", "answer": "dub"},
    ],
    "dumpling": [
        {"text": "We shared a basket of hot dumpling at lunch.", "answer": "dumpling"},
        {"text": "The chef folded each dumpling by hand.", "answer": "dumpling"},
        {"text": "Steam rose from the fresh pork dumpling.", "answer": "dumpling"},
    ],
    "duo": [
        {"text": "The musical duo released a new album this week.", "answer": "duo"},
        {"text": "A comedy duo opened the show.", "answer": "duo"},
        {"text": "The famous duo performed together for the last time.", "answer": "duo"},
    ],
    "durable": [
        {"text": "These shoes are made from durable material.", "answer": "durable"},
        {"text": "The bag is lightweight but surprisingly durable.", "answer": "durable"},
        {"text": "Good furniture should be both attractive and durable.", "answer": "durable"},
    ],
    "dweller": [
        {"text": "City dwellers often have less living space.", "answer": "dweller"},
        {"text": "Forest dwellers rely on local plants for food.", "answer": "dweller"},
        {"text": "Urban dwellers welcomed the new park.", "answer": "dweller"},
    ],
    "dynamic": [
        {"text": "She is a dynamic speaker who keeps audiences engaged.", "answer": "dynamic"},
        {"text": "The company operates in a highly dynamic market.", "answer": "dynamic"},
        {"text": "Their friendship has a strange but dynamic energy.", "answer": "dynamic"},
    ],
    "dysfunctional": [
        {"text": "The meeting became dysfunctional after the argument.", "answer": "dysfunctional"},
        {"text": "The film depicts a deeply dysfunctional family.", "answer": "dysfunctional"},
        {"text": "A dysfunctional system cannot serve the public well.", "answer": "dysfunctional"},
    ],
    "eager": [
        {"text": "The students were eager to hear the results.", "answer": "eager"},
        {"text": "She is eager for a chance to prove herself.", "answer": "eager"},
        {"text": "The puppy looked eager to go outside.", "answer": "eager"},
    ],
    "earthen": [
        {"text": "The village still uses traditional earthen pots.", "answer": "earthen"},
        {"text": "An earthen path led through the field.", "answer": "earthen"},
        {"text": "The walls were built from simple earthen materials.", "answer": "earthen"},
    ],
    "earthly": [
        {"text": "Nothing earthly could convince him to change his mind.", "answer": "earthly"},
        {"text": "The poem contrasts spiritual hope with earthly desire.", "answer": "earthly"},
        {"text": "Why on earthly terms would anyone refuse such help?", "answer": "earthly"},
    ],
    "ease": [
        {"text": "She completed the task with surprising ease.", "answer": "ease"},
        {"text": "These measures may ease pressure on hospitals.", "answer": "ease"},
        {"text": "At ease, the audience laughed more freely.", "answer": "ease"},
    ],
    "echo": [
        {"text": "Her voice created an echo in the empty hall.", "answer": "echo"},
        {"text": "The policy seems to echo earlier mistakes.", "answer": "echo"},
        {"text": "We heard an echo from deep inside the cave.", "answer": "echo"},
    ],
    "ecological": [
        {"text": "The report warns of serious ecological damage.", "answer": "ecological"},
        {"text": "Ecological balance is fragile in island habitats.", "answer": "ecological"},
        {"text": "The project was praised for its ecological design.", "answer": "ecological"},
    ],
    "edible": [
        {"text": "Only a few of these wild plants are edible.", "answer": "edible"},
        {"text": "The flowers are decorative but not edible.", "answer": "edible"},
        {"text": "Always check whether a mushroom is edible before eating it.", "answer": "edible"},
    ],
    "educator": [
        {"text": "The conference invited an experienced educator to speak.", "answer": "educator"},
        {"text": "A good educator listens as well as teaches.", "answer": "educator"},
        {"text": "The award honors one outstanding educator each year.", "answer": "educator"},
    ],
    "efficiency": [
        {"text": "The new system improved energy efficiency in the building.", "answer": "efficiency"},
        {"text": "Managers are always looking for greater efficiency.", "answer": "efficiency"},
        {"text": "Efficiency matters when resources are limited.", "answer": "efficiency"},
    ],
    "elegance": [
        {"text": "The design is admired for its simplicity and elegance.", "answer": "elegance"},
        {"text": "She moved with quiet elegance across the stage.", "answer": "elegance"},
        {"text": "The room had a sense of old-fashioned elegance.", "answer": "elegance"},
    ],
    "elevate": [
        {"text": "The platform can elevate heavy equipment safely.", "answer": "elevate"},
        {"text": "Good lighting can elevate the mood of a room.", "answer": "elevate"},
        {"text": "The new role will elevate her profile in the company.", "answer": "elevate"},
    ],
    "elicit": [
        {"text": "The question was meant to elicit honest opinions.", "answer": "elicit"},
        {"text": "Her speech failed to elicit much sympathy.", "answer": "elicit"},
        {"text": "The survey aims to elicit useful feedback from students.", "answer": "elicit"},
    ],
    "embark": [
        {"text": "They plan to embark on a major research project.", "answer": "embark"},
        {"text": "Passengers began to embark just before sunset.", "answer": "embark"},
        {"text": "She is ready to embark on a new career.", "answer": "embark"},
    ],
    "embroidery": [
        {"text": "Her dress was decorated with fine embroidery.", "answer": "embroidery"},
        {"text": "The museum displayed regional embroidery from the 19th century.", "answer": "embroidery"},
        {"text": "She learned embroidery from her grandmother.", "answer": "embroidery"},
    ],
    "emergence": [
        {"text": "The emergence of new evidence changed the case.", "answer": "emergence"},
        {"text": "Scientists are studying the emergence of resistant bacteria.", "answer": "emergence"},
        {"text": "The emergence of online learning transformed education.", "answer": "emergence"},
    ],
    "emperor": [
        {"text": "The emperor ruled the empire for over thirty years.", "answer": "emperor"},
        {"text": "The museum holds portraits of a former emperor.", "answer": "emperor"},
        {"text": "Legends often describe an emperor with absolute power.", "answer": "emperor"},
    ],
    "employable": [
        {"text": "The course helps students become more employable.", "answer": "employable"},
        {"text": "Strong communication skills make graduates more employable.", "answer": "employable"},
        {"text": "He worried that the gap in his resume made him less employable.", "answer": "employable"},
    ],
    "empower": [
        {"text": "Education can empower young people to shape their future.", "answer": "empower"},
        {"text": "The law aims to empower local communities.", "answer": "empower"},
        {"text": "The workshop will empower staff to make better decisions.", "answer": "empower"},
    ],
    "encouragement": [
        {"text": "Her teacher's encouragement gave her more confidence.", "answer": "encouragement"},
        {"text": "Young athletes need support and encouragement.", "answer": "encouragement"},
        {"text": "A few words of encouragement can change someone's day.", "answer": "encouragement"},
    ],
    "endeavor": [
        {"text": "The space mission was an international endeavor.", "answer": "endeavor"},
        {"text": "Writing the book became a lifelong endeavor.", "answer": "endeavor"},
        {"text": "Science is a collective human endeavor.", "answer": "endeavor"},
    ],
    "endless": [
        {"text": "The road seemed endless in the desert heat.", "answer": "endless"},
        {"text": "We had endless discussions about the design.", "answer": "endless"},
        {"text": "Children often ask what feels like endless questions.", "answer": "endless"},
    ],
    "endorse": [
        {"text": "Several experts endorse the new safety guidelines.", "answer": "endorse"},
        {"text": "The athlete was asked to endorse a sports brand.", "answer": "endorse"},
        {"text": "The board refused to endorse the proposal.", "answer": "endorse"},
    ],
    "endure": [
        {"text": "The bridge was built to endure harsh winters.", "answer": "endure"},
        {"text": "Many families had to endure years of uncertainty.", "answer": "endure"},
        {"text": "Strong friendship can endure great hardship.", "answer": "endure"},
    ],
    "enforce": [
        {"text": "Police were sent to enforce the new traffic law.", "answer": "enforce"},
        {"text": "It is difficult to enforce rules without support.", "answer": "enforce"},
        {"text": "The agency will enforce stricter safety standards.", "answer": "enforce"},
    ],
    "engagement": [
        {"text": "Student engagement improved after the lesson redesign.", "answer": "engagement"},
        {"text": "The company values customer engagement online.", "answer": "engagement"},
        {"text": "Their engagement was announced at dinner.", "answer": "engagement"},
    ],
    "enquire": [
        {"text": "Please enquire at the front desk for more details.", "answer": "enquire"},
        {"text": "Several parents enquired about the course fee.", "answer": "enquire"},
        {"text": "Tourists often enquire about train times.", "answer": "enquire"},
    ],
    "enrichment": [
        {"text": "Travel can bring personal enrichment as well as enjoyment.", "answer": "enrichment"},
        {"text": "The school added enrichment activities after class.", "answer": "enrichment"},
        {"text": "Reading widely contributes to cultural enrichment.", "answer": "enrichment"},
    ],
    "ensue": [
        {"text": "A long argument may ensue if no one compromises.", "answer": "ensue"},
        {"text": "Confusion ensued after the sudden announcement.", "answer": "ensue"},
        {"text": "Once the signal failed, delays quickly ensued.", "answer": "ensue"},
    ],
    "enterprise": [
        {"text": "The small enterprise grew into a national brand.", "answer": "enterprise"},
        {"text": "Running an enterprise requires both courage and planning.", "answer": "enterprise"},
        {"text": "The town supports youth enterprise through grants.", "answer": "enterprise"},
    ],
    "enthusiast": [
        {"text": "He is a cycling enthusiast who rides every weekend.", "answer": "enthusiast"},
        {"text": "The exhibition attracted art enthusiasts from abroad.", "answer": "enthusiast"},
        {"text": "A train enthusiast helped restore the old carriage.", "answer": "enthusiast"},
    ],
    "entitle": [
        {"text": "The pass will entitle you to free entry.", "answer": "entitle"},
        {"text": "What entitles him to speak for the whole group?", "answer": "entitle"},
        {"text": "The law entitles workers to paid leave.", "answer": "entitle"},
    ],
    "envelop": [
        {"text": "A heavy fog began to envelop the valley.", "answer": "envelop"},
        {"text": "Dark smoke quickly enveloped the building.", "answer": "envelop"},
        {"text": "Silence seemed to envelop the hall after the speech.", "answer": "envelop"},
    ],
    "environmentalist": [
        {"text": "The environmentalist urged the city to protect its wetlands.", "answer": "environmentalist"},
        {"text": "A well-known environmentalist led the campaign.", "answer": "environmentalist"},
        {"text": "Young environmentalists planted trees along the river.", "answer": "environmentalist"},
    ],
    "envisage": [
        {"text": "It is hard to envisage the city without cars.", "answer": "envisage"},
        {"text": "The architect envisaged a greener future for the district.", "answer": "envisage"},
        {"text": "Few people envisaged such rapid change.", "answer": "envisage"},
    ],
    "epic": [
        {"text": "The novel tells an epic story across generations.", "answer": "epic"},
        {"text": "Their journey through the desert felt epic.", "answer": "epic"},
        {"text": "The film ends with an epic battle scene.", "answer": "epic"},
    ],
    "equality": [
        {"text": "The campaign calls for greater equality in education.", "answer": "equality"},
        {"text": "True equality requires equal access to opportunity.", "answer": "equality"},
        {"text": "The law was passed in the name of equality.", "answer": "equality"},
    ],
    "equation": [
        {"text": "She solved the equation without using a calculator.", "answer": "equation"},
        {"text": "Cost is only one part of the equation.", "answer": "equation"},
        {"text": "The scientist wrote the equation on the board.", "answer": "equation"},
    ],
    "escalate": [
        {"text": "Small disagreements can escalate into major conflict.", "answer": "escalate"},
        {"text": "Costs may escalate if the project is delayed.", "answer": "escalate"},
        {"text": "Officials tried to prevent the protest from escalating.", "answer": "escalate"},
    ],
    "establishment": [
        {"text": "The restaurant is a long-established local establishment.", "answer": "establishment"},
        {"text": "The establishment of trust takes time.", "answer": "establishment"},
        {"text": "He criticized the political establishment in his speech.", "answer": "establishment"},
    ],
    "ethically": [
        {"text": "Companies should act ethically in every market.", "answer": "ethically"},
        {"text": "The report asks whether the data was collected ethically.", "answer": "ethically"},
        {"text": "She argued that the decision was ethically wrong.", "answer": "ethically"},
    ],
    "ethicist": [
        {"text": "An ethicist joined the panel to discuss medical choices.", "answer": "ethicist"},
        {"text": "The ethicist questioned the risks of the experiment.", "answer": "ethicist"},
        {"text": "A leading ethicist spoke about artificial intelligence.", "answer": "ethicist"},
    ],
    "evacuate": [
        {"text": "Residents were told to evacuate before the storm arrived.", "answer": "evacuate"},
        {"text": "The school had to evacuate the building after the alarm.", "answer": "evacuate"},
        {"text": "Firefighters helped evacuate people from the train.", "answer": "evacuate"},
    ],
    "evacuation": [
        {"text": "The evacuation took place in less than ten minutes.", "answer": "evacuation"},
        {"text": "Officials reviewed the hospital evacuation plan.", "answer": "evacuation"},
        {"text": "The storm forced the evacuation of several villages.", "answer": "evacuation"},
    ],
    "evolutionary": [
        {"text": "The scientist studies evolutionary changes in birds.", "answer": "evolutionary"},
        {"text": "Language can be explained from an evolutionary perspective.", "answer": "evolutionary"},
        {"text": "The book discusses evolutionary biology in simple terms.", "answer": "evolutionary"},
    ],
    "exaggerate": [
        {"text": "Do not exaggerate the problem when reporting it.", "answer": "exaggerate"},
        {"text": "He tends to exaggerate his own achievements.", "answer": "exaggerate"},
        {"text": "The article may exaggerate the risks slightly.", "answer": "exaggerate"},
    ],
    "exaggeration": [
        {"text": "Calling it a disaster would be an exaggeration.", "answer": "exaggeration"},
        {"text": "The story contains a little exaggeration for effect.", "answer": "exaggeration"},
        {"text": "Journalists should avoid exaggeration in headlines.", "answer": "exaggeration"},
    ],
    "excavate": [
        {"text": "Workers began to excavate the site before dawn.", "answer": "excavate"},
        {"text": "Archaeologists will excavate the ancient settlement next year.", "answer": "excavate"},
        {"text": "The team carefully excavated the buried wall.", "answer": "excavate"},
    ],
    "excavation": [
        {"text": "The excavation uncovered pottery from the Roman period.", "answer": "excavation"},
        {"text": "Roadworks were delayed by an archaeological excavation.", "answer": "excavation"},
        {"text": "The excavation lasted for several months.", "answer": "excavation"},
    ],
    "excellence": [
        {"text": "The school is known for academic excellence.", "answer": "excellence"},
        {"text": "The award recognizes excellence in teaching.", "answer": "excellence"},
        {"text": "Years of practice helped her achieve excellence.", "answer": "excellence"},
    ],
    "exceptional": [
        {"text": "She showed exceptional courage during the rescue.", "answer": "exceptional"},
        {"text": "The hotel offers exceptional service.", "answer": "exceptional"},
        {"text": "His performance was exceptional for a first attempt.", "answer": "exceptional"},
    ],
    "excerpt": [
        {"text": "The teacher read an excerpt from the novel aloud.", "answer": "excerpt"},
        {"text": "An excerpt of the interview was shared online.", "answer": "excerpt"},
        {"text": "The article includes a short excerpt from her diary.", "answer": "excerpt"},
    ],
    "excess": [
        {"text": "The body stores excess sugar as fat.", "answer": "excess"},
        {"text": "Excess noise made it impossible to focus.", "answer": "excess"},
        {"text": "The shop reduced excess stock before summer.", "answer": "excess"},
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
