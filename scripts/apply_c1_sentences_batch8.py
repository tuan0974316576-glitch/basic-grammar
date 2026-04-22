from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SENTENCES = {
    "neutralize": [
        {"text": "The liquid can neutralize strong acid safely.", "answer": "neutralize"},
        {"text": "Officials acted quickly to neutralize the threat.", "answer": "neutralize"},
        {"text": "A little humor can neutralize tension in the room.", "answer": "neutralize"},
    ],
    "newsagent": [
        {"text": "I bought a magazine from the newsagent near the station.", "answer": "newsagent"},
        {"text": "The local newsagent opens before sunrise.", "answer": "newsagent"},
        {"text": "She asked the newsagent to save a copy for her.", "answer": "newsagent"},
    ],
    "newsletter": [
        {"text": "The school sends a monthly newsletter to parents.", "answer": "newsletter"},
        {"text": "I signed up for the museum newsletter online.", "answer": "newsletter"},
        {"text": "The company used its newsletter to announce changes.", "answer": "newsletter"},
    ],
    "niche": [
        {"text": "The store serves a niche market of collectors.", "answer": "niche"},
        {"text": "She found a niche in educational design.", "answer": "niche"},
        {"text": "The brand succeeded by targeting a niche audience.", "answer": "niche"},
    ],
    "nightly": [
        {"text": "He takes a nightly walk after dinner.", "answer": "nightly"},
        {"text": "The news is broadcast nightly at nine.", "answer": "nightly"},
        {"text": "They have made nightly checks on the patient.", "answer": "nightly"},
    ],
    "nocturnal": [
        {"text": "Owls are nocturnal and hunt after dark.", "answer": "nocturnal"},
        {"text": "The zoo has a section for nocturnal animals.", "answer": "nocturnal"},
        {"text": "Some insects become active in a nocturnal cycle.", "answer": "nocturnal"},
    ],
    "nod": [
        {"text": "She gave a quick nod to show she understood.", "answer": "nod"},
        {"text": "His speech included a nod to local history.", "answer": "nod"},
        {"text": "The driver responded with a polite nod.", "answer": "nod"},
    ],
    "nonetheless": [
        {"text": "The work was difficult; nonetheless, they finished on time.", "answer": "nonetheless"},
        {"text": "He was tired, but nonetheless continued the journey.", "answer": "nonetheless"},
        {"text": "The results were disappointing, yet nonetheless useful.", "answer": "nonetheless"},
    ],
    "nonsense": [
        {"text": "That rumor is complete nonsense.", "answer": "nonsense"},
        {"text": "She refused to listen to such nonsense any longer.", "answer": "nonsense"},
        {"text": "The article cut through months of political nonsense.", "answer": "nonsense"},
    ],
    "noon": [
        {"text": "The meeting begins exactly at noon.", "answer": "noon"},
        {"text": "By noon, the market was already crowded.", "answer": "noon"},
        {"text": "The sun stood high overhead at noon.", "answer": "noon"},
    ],
    "notably": [
        {"text": "Several cities, notably Seoul, improved air quality.", "answer": "notably"},
        {"text": "The design has changed, notably in the entrance area.", "answer": "notably"},
        {"text": "She is notably calmer than she was last year.", "answer": "notably"},
    ],
    "notorious": [
        {"text": "The district is notorious for traffic delays.", "answer": "notorious"},
        {"text": "He became notorious after the financial scandal.", "answer": "notorious"},
        {"text": "The crossing is notorious among cyclists.", "answer": "notorious"},
    ],
    "novel": [
        {"text": "Her first novel won a major literary award.", "answer": "novel"},
        {"text": "The team proposed a novel way to reduce waste.", "answer": "novel"},
        {"text": "I finished the novel in two evenings.", "answer": "novel"},
    ],
    "nudge": [
        {"text": "She gave me a gentle nudge to wake me up.", "answer": "nudge"},
        {"text": "The government hopes to nudge people toward cleaner transport.", "answer": "nudge"},
        {"text": "A small nudge was enough to move the door.", "answer": "nudge"},
    ],
    "numb": [
        {"text": "My fingers went numb in the cold wind.", "answer": "numb"},
        {"text": "He felt numb after hearing the news.", "answer": "numb"},
        {"text": "The dentist used gel to numb the area.", "answer": "numb"},
    ],
    "oasis": [
        {"text": "The village felt like an oasis in the desert.", "answer": "oasis"},
        {"text": "Travelers rested by the shaded oasis.", "answer": "oasis"},
        {"text": "The park is a green oasis in the middle of the city.", "answer": "oasis"},
    ],
    "obsess": [
        {"text": "Do not let small details obsess you.", "answer": "obsess"},
        {"text": "He tends to obsess over tiny mistakes.", "answer": "obsess"},
        {"text": "It is unhealthy to obsess about other people's opinions.", "answer": "obsess"},
    ],
    "occasional": [
        {"text": "We still meet for the occasional coffee.", "answer": "occasional"},
        {"text": "The route suffers from occasional delays.", "answer": "occasional"},
        {"text": "She works from home with occasional office visits.", "answer": "occasional"},
    ],
    "occupant": [
        {"text": "Firefighters rescued the last occupant of the building.", "answer": "occupant"},
        {"text": "Each occupant must register at the front desk.", "answer": "occupant"},
        {"text": "The car had only one occupant when it stopped.", "answer": "occupant"},
    ],
    "occurrence": [
        {"text": "Power cuts are a rare occurrence in this district.", "answer": "occurrence"},
        {"text": "Doctors track the occurrence of disease across seasons.", "answer": "occurrence"},
        {"text": "Such an occurrence cannot be ignored again.", "answer": "occurrence"},
    ],
    "odds": [
        {"text": "The odds of success improved after the update.", "answer": "odds"},
        {"text": "Against all odds, the team won the match.", "answer": "odds"},
        {"text": "The doctor explained the odds of recovery clearly.", "answer": "odds"},
    ],
    "offense": [
        {"text": "The remark caused offense to several listeners.", "answer": "offense"},
        {"text": "Speeding is treated as a minor offense in some places.", "answer": "offense"},
        {"text": "The team struggled to create offense in the second half.", "answer": "offense"},
    ],
    "officially": [
        {"text": "The building officially opened on Monday.", "answer": "officially"},
        {"text": "She was officially appointed to the role yesterday.", "answer": "officially"},
        {"text": "The route has not yet been officially approved.", "answer": "officially"},
    ],
    "offspring": [
        {"text": "The animal returned to protect its offspring.", "answer": "offspring"},
        {"text": "Some birds feed their offspring for months.", "answer": "offspring"},
        {"text": "The study followed both parents and offspring.", "answer": "offspring"},
    ],
    "oldie": [
        {"text": "The radio station plays an oldie every hour.", "answer": "oldie"},
        {"text": "That song is an oldie but still a favorite.", "answer": "oldie"},
        {"text": "My father smiled when the oldie came on.", "answer": "oldie"},
    ],
    "omission": [
        {"text": "The omission of her name caused real upset.", "answer": "omission"},
        {"text": "A small omission in the form delayed approval.", "answer": "omission"},
        {"text": "The report was criticized for the omission of key facts.", "answer": "omission"},
    ],
    "onlooker": [
        {"text": "An onlooker recorded the accident on a phone.", "answer": "onlooker"},
        {"text": "Police asked each onlooker to step back.", "answer": "onlooker"},
        {"text": "Curious onlookers gathered near the stage.", "answer": "onlooker"},
    ],
    "onward": [
        {"text": "After lunch, the hikers moved onward toward the peak.", "answer": "onward"},
        {"text": "The train travels onward to the northern towns.", "answer": "onward"},
        {"text": "From that day onward, everything changed.", "answer": "onward"},
    ],
    "oppression": [
        {"text": "The novel tells a story of resistance to oppression.", "answer": "oppression"},
        {"text": "People fled the region to escape political oppression.", "answer": "oppression"},
        {"text": "Education can help challenge social oppression.", "answer": "oppression"},
    ],
    "opt": [
        {"text": "Many students opt for online courses now.", "answer": "opt"},
        {"text": "She chose to opt out of the final round.", "answer": "opt"},
        {"text": "Some families opt to travel by train instead.", "answer": "opt"},
    ],
    "oral": [
        {"text": "The course includes an oral presentation at the end.", "answer": "oral"},
        {"text": "The patient was advised to take oral medicine.", "answer": "oral"},
        {"text": "Students prepared for the oral exam together.", "answer": "oral"},
    ],
    "orca": [
        {"text": "An orca was spotted near the icy coast.", "answer": "orca"},
        {"text": "The documentary follows an orca family through winter.", "answer": "orca"},
        {"text": "Children were excited to see an orca at the aquarium.", "answer": "orca"},
    ],
    "orchard": [
        {"text": "The family owns an apple orchard in the hills.", "answer": "orchard"},
        {"text": "Spring blossoms covered the orchard in white.", "answer": "orchard"},
        {"text": "Workers moved through the orchard at dawn.", "answer": "orchard"},
    ],
    "orchid": [
        {"text": "A purple orchid stood by the window.", "answer": "orchid"},
        {"text": "The gardener carefully watered each orchid.", "answer": "orchid"},
        {"text": "She bought an orchid as a housewarming gift.", "answer": "orchid"},
    ],
    "organizational": [
        {"text": "She has strong organizational skills under pressure.", "answer": "organizational"},
        {"text": "The charity went through major organizational change.", "answer": "organizational"},
        {"text": "Poor organizational planning delayed the event.", "answer": "organizational"},
    ],
    "originate": [
        {"text": "Many rivers originate in the surrounding mountains.", "answer": "originate"},
        {"text": "The rumor appears to originate from one website.", "answer": "originate"},
        {"text": "Several customs originate in farming communities.", "answer": "originate"},
    ],
    "ostracize": [
        {"text": "It is wrong to ostracize people for being different.", "answer": "ostracize"},
        {"text": "The group tried to ostracize anyone who disagreed.", "answer": "ostracize"},
        {"text": "Children can quickly ostracize a classmate without guidance.", "answer": "ostracize"},
    ],
    "outgunned": [
        {"text": "The defenders were heavily outgunned from the start.", "answer": "outgunned"},
        {"text": "Though outgunned, the team refused to retreat.", "answer": "outgunned"},
        {"text": "Analysts said the smaller force was outgunned but well organized.", "answer": "outgunned"},
    ],
    "outing": [
        {"text": "The club planned an outing to the island this weekend.", "answer": "outing"},
        {"text": "Rain spoiled our school outing to the farm.", "answer": "outing"},
        {"text": "A family outing can be simple and still memorable.", "answer": "outing"},
    ],
    "outlet": [
        {"text": "A news outlet reported the story first.", "answer": "outlet"},
        {"text": "This device needs a nearby power outlet.", "answer": "outlet"},
        {"text": "Art can be an emotional outlet during difficult times.", "answer": "outlet"},
    ],
    "outlook": [
        {"text": "The economic outlook remains uncertain this year.", "answer": "outlook"},
        {"text": "Her positive outlook helped the whole team.", "answer": "outlook"},
        {"text": "Farmers are worried about the weather outlook.", "answer": "outlook"},
    ],
    "outnumber": [
        {"text": "Supporters outnumbered critics at the meeting.", "answer": "outnumber"},
        {"text": "In this town, bicycles outnumber cars.", "answer": "outnumber"},
        {"text": "The guests easily outnumbered the seats available.", "answer": "outnumber"},
    ],
    "outrage": [
        {"text": "The decision sparked public outrage overnight.", "answer": "outrage"},
        {"text": "Her article expressed outrage at the conditions.", "answer": "outrage"},
        {"text": "Parents reacted with outrage to the sudden closure.", "answer": "outrage"},
    ],
    "outskirt": [
        {"text": "They moved to the outskirt of the city for more space.", "answer": "outskirt"},
        {"text": "A new warehouse stands on the industrial outskirt.", "answer": "outskirt"},
        {"text": "The old temple lies on the northern outskirt.", "answer": "outskirt"},
    ],
    "outweigh": [
        {"text": "The benefits clearly outweigh the risks.", "answer": "outweigh"},
        {"text": "For many families, convenience outweighs cost.", "answer": "outweigh"},
        {"text": "Short-term profit should not outweigh long-term safety.", "answer": "outweigh"},
    ],
    "overdeveloping": [
        {"text": "Residents worry the coast is overdeveloping too quickly.", "answer": "overdeveloping"},
        {"text": "The article warns against overdeveloping fragile land.", "answer": "overdeveloping"},
        {"text": "Officials denied that the district was overdeveloping.", "answer": "overdeveloping"},
    ],
    "overdue": [
        {"text": "The library book is now three days overdue.", "answer": "overdue"},
        {"text": "Reform in this area is long overdue.", "answer": "overdue"},
        {"text": "An overdue payment caused trouble for the company.", "answer": "overdue"},
    ],
    "overjoy": [
        {"text": "The news will overjoy her grandparents.", "answer": "overjoy"},
        {"text": "Winning the prize seemed to overjoy the whole class.", "answer": "overjoy"},
        {"text": "The surprise visit overjoyed the children.", "answer": "overjoy"},
    ],
    "overkill": [
        {"text": "Adding five more charts would be overkill.", "answer": "overkill"},
        {"text": "The security system feels like overkill for a small shop.", "answer": "overkill"},
        {"text": "For a short email, that level of detail is overkill.", "answer": "overkill"},
    ],
    "overlook": [
        {"text": "Do not overlook the warning signs on the bridge.", "answer": "overlook"},
        {"text": "The hotel rooms overlook the harbor.", "answer": "overlook"},
        {"text": "Busy teams sometimes overlook simple solutions.", "answer": "overlook"},
    ],
    "overly": [
        {"text": "The instructions are not overly complicated.", "answer": "overly"},
        {"text": "He became overly cautious after the accident.", "answer": "overly"},
        {"text": "The report was criticized as overly optimistic.", "answer": "overly"},
    ],
    "overreaction": [
        {"text": "Some said the closure was an overreaction to one complaint.", "answer": "overreaction"},
        {"text": "His angry response felt like an overreaction.", "answer": "overreaction"},
        {"text": "A calm review showed the panic had been an overreaction.", "answer": "overreaction"},
    ],
    "overshadow": [
        {"text": "The scandal may overshadow the festival this year.", "answer": "overshadow"},
        {"text": "Tall buildings overshadow the old market.", "answer": "overshadow"},
        {"text": "One mistake should not overshadow years of hard work.", "answer": "overshadow"},
    ],
    "overstate": [
        {"text": "Do not overstate the impact of one small study.", "answer": "overstate"},
        {"text": "The company may have overstated its success.", "answer": "overstate"},
        {"text": "It is difficult to overstate the value of clean water.", "answer": "overstate"},
    ],
    "overstep": [
        {"text": "Managers must not overstep their authority.", "answer": "overstep"},
        {"text": "He apologized after overstepping the boundary.", "answer": "overstep"},
        {"text": "The article argues that the agency overstepped its role.", "answer": "overstep"},
    ],
    "overt": [
        {"text": "There was no overt sign of anger in her voice.", "answer": "overt"},
        {"text": "The message contained an overt political threat.", "answer": "overt"},
        {"text": "The film avoids overt moral judgment.", "answer": "overt"},
    ],
    "overtake": [
        {"text": "The cyclist tried to overtake the bus on the hill.", "answer": "overtake"},
        {"text": "New technology may overtake older systems quickly.", "answer": "overtake"},
        {"text": "She accelerated to overtake the slow truck.", "answer": "overtake"},
    ],
    "overview": [
        {"text": "The guide gave a brief overview of the museum.", "answer": "overview"},
        {"text": "This chapter provides an overview of the topic.", "answer": "overview"},
        {"text": "Managers asked for an overview before reading the details.", "answer": "overview"},
    ],
    "overwhelm": [
        {"text": "Too many messages can overwhelm new users.", "answer": "overwhelm"},
        {"text": "The flood threatened to overwhelm the river barrier.", "answer": "overwhelm"},
        {"text": "A sudden sense of relief began to overwhelm her.", "answer": "overwhelm"},
    ],
    "oxygenate": [
        {"text": "The device helps oxygenate the blood during surgery.", "answer": "oxygenate"},
        {"text": "Plants oxygenate the water in the tank.", "answer": "oxygenate"},
        {"text": "Fresh seaweed can oxygenate small ponds naturally.", "answer": "oxygenate"},
    ],
    "paradise": [
        {"text": "To divers, the reef is a true paradise.", "answer": "paradise"},
        {"text": "The island looked like a tropical paradise.", "answer": "paradise"},
        {"text": "The quiet garden became her idea of paradise.", "answer": "paradise"},
    ],
    "parental": [
        {"text": "The school requested parental permission for the trip.", "answer": "parental"},
        {"text": "Parental support often shapes a child's confidence.", "answer": "parental"},
        {"text": "The app includes parental controls for younger users.", "answer": "parental"},
    ],
    "patch": [
        {"text": "A patch of sunlight crossed the floor.", "answer": "patch"},
        {"text": "The company released a security patch overnight.", "answer": "patch"},
        {"text": "She sewed a patch onto the torn jacket.", "answer": "patch"},
    ],
    "pathway": [
        {"text": "A stone pathway leads to the old house.", "answer": "pathway"},
        {"text": "University can open a pathway to many careers.", "answer": "pathway"},
        {"text": "The park added a new pathway for cyclists.", "answer": "pathway"},
    ],
    "patron": [
        {"text": "Each patron was asked to keep the ticket stub.", "answer": "patron"},
        {"text": "The museum thanked its long-time patrons publicly.", "answer": "patron"},
        {"text": "A quiet patron sat reading in the corner cafe.", "answer": "patron"},
    ],
    "patronize": [
        {"text": "Residents still patronize the old bakery every morning.", "answer": "patronize"},
        {"text": "Do not patronize people by using a false tone of kindness.", "answer": "patronize"},
        {"text": "Tourists often patronize small shops near the harbor.", "answer": "patronize"},
    ],
    "pavilion": [
        {"text": "We met beside the pavilion in the park.", "answer": "pavilion"},
        {"text": "The exhibition was held in a glass pavilion.", "answer": "pavilion"},
        {"text": "Rain began just as they reached the pavilion.", "answer": "pavilion"},
    ],
    "peak": [
        {"text": "Electricity use reaches its peak at noon.", "answer": "peak"},
        {"text": "They reached the mountain peak before sunrise.", "answer": "peak"},
        {"text": "Tourist numbers are at their peak in summer.", "answer": "peak"},
    ],
    "peddler": [
        {"text": "A street peddler sold fruit by the station.", "answer": "peddler"},
        {"text": "The novel follows a wandering peddler through the countryside.", "answer": "peddler"},
        {"text": "An old peddler knocked on the door with a basket of tools.", "answer": "peddler"},
    ],
    "pedestrianizing": [
        {"text": "The city is considering pedestrianizing the old market street.", "answer": "pedestrianizing"},
        {"text": "Shop owners debated the effect of pedestrianizing the district.", "answer": "pedestrianizing"},
        {"text": "Pedestrianizing the road could reduce noise and pollution.", "answer": "pedestrianizing"},
    ],
    "pending": [
        {"text": "The decision remains pending until Friday.", "answer": "pending"},
        {"text": "Several applications are still pending review.", "answer": "pending"},
        {"text": "The road stayed closed pending inspection.", "answer": "pending"},
    ],
    "penetrate": [
        {"text": "Sunlight could barely penetrate the thick fog.", "answer": "penetrate"},
        {"text": "The company hopes to penetrate new overseas markets.", "answer": "penetrate"},
        {"text": "The bullet failed to penetrate the metal plate.", "answer": "penetrate"},
    ],
    "pensioner": [
        {"text": "The program offers discounts for every pensioner.", "answer": "pensioner"},
        {"text": "A pensioner living alone joined the community meal service.", "answer": "pensioner"},
        {"text": "The town has many pensioners who rely on public transport.", "answer": "pensioner"},
    ],
    "perfection": [
        {"text": "She cooked the fish to perfection.", "answer": "perfection"},
        {"text": "No system can achieve perfection all the time.", "answer": "perfection"},
        {"text": "His search for perfection often slows the team down.", "answer": "perfection"},
    ],
    "peril": [
        {"text": "The hikers were in great peril after sunset.", "answer": "peril"},
        {"text": "The speech warned of the peril facing small farmers.", "answer": "peril"},
        {"text": "The crew escaped the ship in peril.", "answer": "peril"},
    ],
    "peripheral": [
        {"text": "The issue is central, not peripheral, to the debate.", "answer": "peripheral"},
        {"text": "A peripheral road circles the outer edge of the town.", "answer": "peripheral"},
        {"text": "He lost some peripheral vision after the injury.", "answer": "peripheral"},
    ],
    "persimmon": [
        {"text": "A ripe persimmon has a sweet, soft texture.", "answer": "persimmon"},
        {"text": "She sliced a persimmon into the winter salad.", "answer": "persimmon"},
        {"text": "The market sold boxes of fresh persimmon in autumn.", "answer": "persimmon"},
    ],
    "persuasive": [
        {"text": "She gave a persuasive argument in favor of reform.", "answer": "persuasive"},
        {"text": "The ad was clever but not especially persuasive.", "answer": "persuasive"},
        {"text": "His calm tone made the speech more persuasive.", "answer": "persuasive"},
    ],
    "peruvian": [
        {"text": "The restaurant serves several traditional peruvian dishes.", "answer": "peruvian"},
        {"text": "A peruvian artist opened the exhibition with a speech.", "answer": "peruvian"},
        {"text": "They bought a woven blanket from a peruvian market.", "answer": "peruvian"},
    ],
    "philosophical": [
        {"text": "The essay takes a philosophical view of time.", "answer": "philosophical"},
        {"text": "He became surprisingly philosophical after the loss.", "answer": "philosophical"},
        {"text": "The class discussed philosophical questions about justice.", "answer": "philosophical"},
    ],
    "physician": [
        {"text": "The physician reviewed her test results carefully.", "answer": "physician"},
        {"text": "An experienced physician explained the treatment options.", "answer": "physician"},
        {"text": "The clinic hired a new physician last month.", "answer": "physician"},
    ],
    "piercings": [
        {"text": "Her ear piercings caught the light.", "answer": "piercings"},
        {"text": "Some schools limit visible piercings.", "answer": "piercings"},
        {"text": "He removed his piercings before the interview.", "answer": "piercings"},
    ],
    "pioneer": [
        {"text": "She became a pioneer in early computer science.", "answer": "pioneer"},
        {"text": "The company helped pioneer a new form of battery.", "answer": "pioneer"},
        {"text": "Many still remember him as a pioneer of modern theater.", "answer": "pioneer"},
    ],
    "pip": [
        {"text": "She planted each apple pip in a small pot.", "answer": "pip"},
        {"text": "A pip from the orange fell onto the plate.", "answer": "pip"},
        {"text": "The recipe says to remove every pip first.", "answer": "pip"},
    ],
    "pipeline": [
        {"text": "Engineers inspected the gas pipeline after the quake.", "answer": "pipeline"},
        {"text": "Several new drugs are still in the research pipeline.", "answer": "pipeline"},
        {"text": "The company has a strong pipeline of future projects.", "answer": "pipeline"},
    ],
    "pirate": [
        {"text": "The film follows a pirate searching for treasure.", "answer": "pirate"},
        {"text": "Pirates once attacked ships along this coast.", "answer": "pirate"},
        {"text": "The software company works to stop pirate copies.", "answer": "pirate"},
    ],
    "pit": [
        {"text": "Workers discovered a deep pit beside the road.", "answer": "pit"},
        {"text": "She removed the pit from the peach before slicing it.", "answer": "pit"},
        {"text": "The theater has extra seats in the orchestra pit area.", "answer": "pit"},
    ],
    "pitfall": [
        {"text": "The guide warns of the common pitfall of overspending.", "answer": "pitfall"},
        {"text": "One pitfall of fame is the loss of privacy.", "answer": "pitfall"},
        {"text": "Students should know the pitfall of memorizing without understanding.", "answer": "pitfall"},
    ],
    "plaster": [
        {"text": "Cracks were visible in the old plaster wall.", "answer": "plaster"},
        {"text": "The nurse covered the cut with a plaster.", "answer": "plaster"},
        {"text": "Dust fell from the plaster ceiling during the tremor.", "answer": "plaster"},
    ],
    "plead": [
        {"text": "Lawyers will plead the case again next week.", "answer": "plead"},
        {"text": "She had to plead for a little more time.", "answer": "plead"},
        {"text": "The witness chose not to plead guilty.", "answer": "plead"},
    ],
    "pleasurable": [
        {"text": "It was a simple but pleasurable walk by the sea.", "answer": "pleasurable"},
        {"text": "Reading remained a deeply pleasurable habit for her.", "answer": "pleasurable"},
        {"text": "The class was both useful and pleasurable.", "answer": "pleasurable"},
    ],
    "pledge": [
        {"text": "The leader made a public pledge to reduce waste.", "answer": "pledge"},
        {"text": "Students signed a pledge to support the campaign.", "answer": "pledge"},
        {"text": "She treated the promise as a formal pledge.", "answer": "pledge"},
    ],
    "plummet": [
        {"text": "Sales began to plummet after the recall.", "answer": "plummet"},
        {"text": "The temperature may plummet overnight.", "answer": "plummet"},
        {"text": "Shares plummeted when the news became public.", "answer": "plummet"},
    ],
    "plunge": [
        {"text": "The path takes a sudden plunge toward the river.", "answer": "plunge"},
        {"text": "He decided to plunge into the project without waiting.", "answer": "plunge"},
        {"text": "The diver made a clean plunge into the pool.", "answer": "plunge"},
    ],
    "pointless": [
        {"text": "It feels pointless to argue over tiny details now.", "answer": "pointless"},
        {"text": "The review called the sequel loud and pointless.", "answer": "pointless"},
        {"text": "Without data, the debate becomes pointless.", "answer": "pointless"},
    ],
    "pole": [
        {"text": "A wooden pole held up the sign.", "answer": "pole"},
        {"text": "The climber slid down the pole to the ground.", "answer": "pole"},
        {"text": "Streetlights were fixed to every second pole.", "answer": "pole"},
    ],
    "politically": [
        {"text": "The issue remains politically sensitive.", "answer": "politically"},
        {"text": "She became more politically active in college.", "answer": "politically"},
        {"text": "The region is politically divided on the question.", "answer": "politically"},
    ],
    "poll": [
        {"text": "The latest poll showed a narrow lead.", "answer": "poll"},
        {"text": "Voters were asked to respond to an online poll.", "answer": "poll"},
        {"text": "A fresh poll may change party strategy.", "answer": "poll"},
    ],
    "pollen": [
        {"text": "Spring pollen makes his eyes itch badly.", "answer": "pollen"},
        {"text": "Bees carried pollen between the flowers.", "answer": "pollen"},
        {"text": "The microscope revealed grains of pollen on the sample.", "answer": "pollen"},
    ],
    "pollinate": [
        {"text": "Bees help pollinate many fruit trees.", "answer": "pollinate"},
        {"text": "Wind can pollinate certain grasses naturally.", "answer": "pollinate"},
        {"text": "Farmers sometimes hand-pollinate flowers in greenhouses.", "answer": "pollinate"},
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
