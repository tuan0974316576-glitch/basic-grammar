from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SENTENCES = {
    "itinerary": [
        {"text": "The tour guide emailed the final itinerary last night.", "answer": "itinerary"},
        {"text": "Our itinerary includes three museums and a harbor walk.", "answer": "itinerary"},
        {"text": "A change in weather forced them to revise the itinerary.", "answer": "itinerary"},
    ],
    "journalistic": [
        {"text": "Her journalistic style is clear and direct.", "answer": "journalistic"},
        {"text": "The film adopts a journalistic approach to the scandal.", "answer": "journalistic"},
        {"text": "He brought strong journalistic instincts to the interview.", "answer": "journalistic"},
    ],
    "junk": [
        {"text": "The garage was full of old junk and broken tools.", "answer": "junk"},
        {"text": "She tries to avoid junk food during the week.", "answer": "junk"},
        {"text": "Please remove the junk from the back room.", "answer": "junk"},
    ],
    "justly": [
        {"text": "The judge acted justly in a difficult case.", "answer": "justly"},
        {"text": "Workers expect to be treated justly and fairly.", "answer": "justly"},
        {"text": "History may remember her more justly than her critics did.", "answer": "justly"},
    ],
    "knob": [
        {"text": "Turn the knob gently to open the cabinet.", "answer": "knob"},
        {"text": "One oven knob was missing after the move.", "answer": "knob"},
        {"text": "The old radio has a volume knob on the side.", "answer": "knob"},
    ],
    "knowledgeable": [
        {"text": "The museum guide was friendly and knowledgeable.", "answer": "knowledgeable"},
        {"text": "Ask someone knowledgeable before making a decision.", "answer": "knowledgeable"},
        {"text": "She sounded highly knowledgeable about marine life.", "answer": "knowledgeable"},
    ],
    "labrador": [
        {"text": "Their labrador waited patiently by the gate.", "answer": "labrador"},
        {"text": "A young labrador greeted every visitor with excitement.", "answer": "labrador"},
        {"text": "The family adopted a rescue labrador last year.", "answer": "labrador"},
    ],
    "lament": [
        {"text": "Writers still lament the loss of old neighborhoods.", "answer": "lament"},
        {"text": "Her speech became a lament for the disappearing wetlands.", "answer": "lament"},
        {"text": "Many fans lament the closure of the historic cinema.", "answer": "lament"},
    ],
    "lander": [
        {"text": "The moon lander sent back new images of the surface.", "answer": "lander"},
        {"text": "Engineers tested the lander before launch.", "answer": "lander"},
        {"text": "The robotic lander touched down safely at dawn.", "answer": "lander"},
    ],
    "landmark": [
        {"text": "The law was described as a landmark decision.", "answer": "landmark"},
        {"text": "The clock tower is the city's best-known landmark.", "answer": "landmark"},
        {"text": "Researchers called the study a landmark in cancer treatment.", "answer": "landmark"},
    ],
    "lap": [
        {"text": "The child fell asleep on her mother's lap.", "answer": "lap"},
        {"text": "He completed the final lap in record time.", "answer": "lap"},
        {"text": "The cat jumped into his lap without warning.", "answer": "lap"},
    ],
    "latter": [
        {"text": "Of the two proposals, the latter seems more realistic.", "answer": "latter"},
        {"text": "The first half was slow, but the latter part improved.", "answer": "latter"},
        {"text": "Choose between history and economics, or the latter if you prefer numbers.", "answer": "latter"},
    ],
    "lawyerly": [
        {"text": "His lawyerly tone made the interview feel formal.", "answer": "lawyerly"},
        {"text": "She gave a careful, lawyerly answer to every question.", "answer": "lawyerly"},
        {"text": "The article was written in a precise, lawyerly style.", "answer": "lawyerly"},
    ],
    "leap": [
        {"text": "The company took a leap into the electric vehicle market.", "answer": "leap"},
        {"text": "A fox made a sudden leap across the stream.", "answer": "leap"},
        {"text": "It was a major leap forward in medical research.", "answer": "leap"},
    ],
    "legendary": [
        {"text": "The athlete became legendary after winning three titles.", "answer": "legendary"},
        {"text": "Their chef is known for legendary desserts.", "answer": "legendary"},
        {"text": "The mountain is linked to a legendary battle.", "answer": "legendary"},
    ],
    "legitimate": [
        {"text": "Parents have a legitimate concern about online safety.", "answer": "legitimate"},
        {"text": "The business was found to be entirely legitimate.", "answer": "legitimate"},
        {"text": "She raised a legitimate question during the meeting.", "answer": "legitimate"},
    ],
    "lengthy": [
        {"text": "After a lengthy discussion, the committee reached agreement.", "answer": "lengthy"},
        {"text": "The report is accurate but too lengthy for most readers.", "answer": "lengthy"},
        {"text": "He gave a lengthy explanation that confused everyone.", "answer": "lengthy"},
    ],
    "lever": [
        {"text": "Pull the lever slowly to release the gate.", "answer": "lever"},
        {"text": "The machine has a safety lever on the side.", "answer": "lever"},
        {"text": "Policy can be used as a lever for social change.", "answer": "lever"},
    ],
    "leverage": [
        {"text": "The company used its size to leverage better prices.", "answer": "leverage"},
        {"text": "She has enough leverage to influence the final decision.", "answer": "leverage"},
        {"text": "Investors were warned about the risks of high leverage.", "answer": "leverage"},
    ],
    "liability": [
        {"text": "The accident exposed the firm's legal liability.", "answer": "liability"},
        {"text": "High debt can become a serious liability.", "answer": "liability"},
        {"text": "The contract limits liability in certain cases.", "answer": "liability"},
    ],
    "liable": [
        {"text": "Drivers are liable for damage caused by careless behavior.", "answer": "liable"},
        {"text": "The area is liable to flooding during heavy rain.", "answer": "liable"},
        {"text": "He may be liable for the unpaid tax.", "answer": "liable"},
    ],
    "liberal": [
        {"text": "The college is known for its liberal atmosphere.", "answer": "liberal"},
        {"text": "She supports a more liberal policy on migration.", "answer": "liberal"},
        {"text": "Use a liberal amount of butter for the sauce.", "answer": "liberal"},
    ],
    "license": [
        {"text": "You need a special license to operate the drone.", "answer": "license"},
        {"text": "The restaurant lost its license after repeated complaints.", "answer": "license"},
        {"text": "He showed his driver's license at the desk.", "answer": "license"},
    ],
    "lifelike": [
        {"text": "The sculpture is so lifelike that it seems ready to move.", "answer": "lifelike"},
        {"text": "Artists admired the portrait for its lifelike detail.", "answer": "lifelike"},
        {"text": "The robot's face looks strangely lifelike.", "answer": "lifelike"},
    ],
    "lifelong": [
        {"text": "Reading became a lifelong habit for her.", "answer": "lifelong"},
        {"text": "They remained lifelong friends after university.", "answer": "lifelong"},
        {"text": "He has a lifelong interest in astronomy.", "answer": "lifelong"},
    ],
    "likelihood": [
        {"text": "The likelihood of rain has increased this afternoon.", "answer": "likelihood"},
        {"text": "We must assess the likelihood of failure before launch.", "answer": "likelihood"},
        {"text": "There is little likelihood of a quick solution.", "answer": "likelihood"},
    ],
    "limelight": [
        {"text": "She dislikes being in the limelight for too long.", "answer": "limelight"},
        {"text": "Winning the award pushed him into the limelight.", "answer": "limelight"},
        {"text": "The scandal kept the mayor in the limelight for weeks.", "answer": "limelight"},
    ],
    "listing": [
        {"text": "The apartment listing attracted dozens of replies.", "answer": "listing"},
        {"text": "The company plans a stock market listing next year.", "answer": "listing"},
        {"text": "Check the online listing before visiting the shop.", "answer": "listing"},
    ],
    "literacy": [
        {"text": "Digital literacy is essential in modern workplaces.", "answer": "literacy"},
        {"text": "The charity focuses on adult literacy programs.", "answer": "literacy"},
        {"text": "Improving reading literacy takes time and support.", "answer": "literacy"},
    ],
    "liven": [
        {"text": "A little music can liven the atmosphere instantly.", "answer": "liven"},
        {"text": "The speaker tried to liven the discussion with humor.", "answer": "liven"},
        {"text": "Bright flowers liven the entrance to the hall.", "answer": "liven"},
    ],
    "lobby": [
        {"text": "Visitors waited in the hotel lobby before check-in.", "answer": "lobby"},
        {"text": "Several groups continue to lobby for legal reform.", "answer": "lobby"},
        {"text": "The marble lobby was wider than expected.", "answer": "lobby"},
    ],
    "locale": [
        {"text": "The film was shot in a remote mountain locale.", "answer": "locale"},
        {"text": "This quiet coastal locale attracts painters every summer.", "answer": "locale"},
        {"text": "The story moves to a darker urban locale in the final chapter.", "answer": "locale"},
    ],
    "log": [
        {"text": "Please log every fault in the maintenance book.", "answer": "log"},
        {"text": "He sat on a fallen log beside the river.", "answer": "log"},
        {"text": "The pilot checked the flight log after landing.", "answer": "log"},
    ],
    "logic": [
        {"text": "Her argument follows a clear and careful logic.", "answer": "logic"},
        {"text": "There is no logic in punishing everyone for one mistake.", "answer": "logic"},
        {"text": "Students were asked to explain the logic behind their answers.", "answer": "logic"},
    ],
    "loneliness": [
        {"text": "Moving abroad increased her sense of loneliness.", "answer": "loneliness"},
        {"text": "The novel captures the loneliness of city life.", "answer": "loneliness"},
        {"text": "Community programs can reduce loneliness among older adults.", "answer": "loneliness"},
    ],
    "loom": [
        {"text": "Dark clouds began to loom over the harbor.", "answer": "loom"},
        {"text": "Another deadline was already beginning to loom.", "answer": "loom"},
        {"text": "The old tower seemed to loom above the village.", "answer": "loom"},
    ],
    "lounge": [
        {"text": "Passengers relaxed in the airport lounge before boarding.", "answer": "lounge"},
        {"text": "We spent an hour in the hotel lounge after dinner.", "answer": "lounge"},
        {"text": "Students were told not to lounge in the hallway.", "answer": "lounge"},
    ],
    "lush": [
        {"text": "The island is covered in lush green forest.", "answer": "lush"},
        {"text": "Recent rain left the valley looking lush and bright.", "answer": "lush"},
        {"text": "The garden became lush by midsummer.", "answer": "lush"},
    ],
    "machinery": [
        {"text": "Heavy machinery arrived at the construction site at dawn.", "answer": "machinery"},
        {"text": "The factory upgraded its aging machinery last year.", "answer": "machinery"},
        {"text": "Dust can damage delicate machinery.", "answer": "machinery"},
    ],
    "magical": [
        {"text": "The snow gave the village a magical appearance.", "answer": "magical"},
        {"text": "For children, the show felt truly magical.", "answer": "magical"},
        {"text": "Sunrise over the lake was a magical sight.", "answer": "magical"},
    ],
    "mainland": [
        {"text": "The ferry links the island with the mainland.", "answer": "mainland"},
        {"text": "Strong winds cut off supplies from the mainland.", "answer": "mainland"},
        {"text": "Many birds migrate between the island and the mainland.", "answer": "mainland"},
    ],
    "mainstream": [
        {"text": "The idea gradually entered mainstream discussion.", "answer": "mainstream"},
        {"text": "The singer moved from indie music to mainstream pop.", "answer": "mainstream"},
        {"text": "Mainstream media covered the issue for weeks.", "answer": "mainstream"},
    ],
    "maintenance": [
        {"text": "The bridge is closed for routine maintenance.", "answer": "maintenance"},
        {"text": "Regular maintenance keeps the engine running safely.", "answer": "maintenance"},
        {"text": "The building requires expensive maintenance each year.", "answer": "maintenance"},
    ],
    "mammal": [
        {"text": "A whale is a mammal, not a fish.", "answer": "mammal"},
        {"text": "Every mammal in the exhibit has adapted differently.", "answer": "mammal"},
        {"text": "The researcher studies how each mammal raises its young.", "answer": "mammal"},
    ],
    "mandatory": [
        {"text": "Helmet use is mandatory on this site.", "answer": "mandatory"},
        {"text": "Attendance at the safety workshop is mandatory.", "answer": "mandatory"},
        {"text": "The school introduced mandatory reporting rules.", "answer": "mandatory"},
    ],
    "manic": [
        {"text": "The office felt manic before the product launch.", "answer": "manic"},
        {"text": "Her laughter had a manic edge to it.", "answer": "manic"},
        {"text": "The market showed manic swings all week.", "answer": "manic"},
    ],
    "manipulate": [
        {"text": "The software allows users to manipulate images easily.", "answer": "manipulate"},
        {"text": "He tried to manipulate the data to support his argument.", "answer": "manipulate"},
        {"text": "No one should manipulate others through fear.", "answer": "manipulate"},
    ],
    "marine": [
        {"text": "The reserve protects rare marine species.", "answer": "marine"},
        {"text": "She studies marine biology at university.", "answer": "marine"},
        {"text": "Plastic waste can severely damage marine life.", "answer": "marine"},
    ],
    "markedly": [
        {"text": "Sales rose markedly after the redesign.", "answer": "markedly"},
        {"text": "The two groups differed markedly in age.", "answer": "markedly"},
        {"text": "His condition improved markedly overnight.", "answer": "markedly"},
    ],
    "marshal": [
        {"text": "The commander tried to marshal support for the plan.", "answer": "marshal"},
        {"text": "Event staff helped marshal the crowd toward the exits.", "answer": "marshal"},
        {"text": "A fire marshal inspected the old theater.", "answer": "marshal"},
    ],
    "martian": [
        {"text": "The child drew a cheerful martian with green ears.", "answer": "martian"},
        {"text": "The novel imagines a martian colony in the future.", "answer": "martian"},
        {"text": "Some of the plants looked almost martian in shape.", "answer": "martian"},
    ],
    "marvel": [
        {"text": "Visitors marvel at the size of the ancient wall.", "answer": "marvel"},
        {"text": "The bridge is a marvel of engineering.", "answer": "marvel"},
        {"text": "We stood in silence to marvel at the night sky.", "answer": "marvel"},
    ],
    "mask": [
        {"text": "A white mask covered the actor's face.", "answer": "mask"},
        {"text": "Some people use humor to mask anxiety.", "answer": "mask"},
        {"text": "The child decorated a paper mask with gold paint.", "answer": "mask"},
    ],
    "mastermind": [
        {"text": "Police believe she was the mastermind behind the fraud.", "answer": "mastermind"},
        {"text": "He helped mastermind the campaign from the start.", "answer": "mastermind"},
        {"text": "The film follows a criminal mastermind in hiding.", "answer": "mastermind"},
    ],
    "mat": [
        {"text": "Please wipe your shoes on the mat.", "answer": "mat"},
        {"text": "She rolled up the yoga mat after class.", "answer": "mat"},
        {"text": "The cat slept on the front mat in the sun.", "answer": "mat"},
    ],
    "materialize": [
        {"text": "The promised support failed to materialize.", "answer": "materialize"},
        {"text": "A clear plan began to materialize after lunch.", "answer": "materialize"},
        {"text": "Resources did not materialize as quickly as hoped.", "answer": "materialize"},
    ],
    "mature": [
        {"text": "She gave a calm and mature response to the criticism.", "answer": "mature"},
        {"text": "These plants need time to mature fully.", "answer": "mature"},
        {"text": "The market has become more mature over time.", "answer": "mature"},
    ],
    "maximize": [
        {"text": "We should maximize the use of natural light.", "answer": "maximize"},
        {"text": "The coach wants to maximize every player's strengths.", "answer": "maximize"},
        {"text": "Careful planning can maximize the impact of limited funds.", "answer": "maximize"},
    ],
    "meaningful": [
        {"text": "They had a meaningful conversation after dinner.", "answer": "meaningful"},
        {"text": "Real change requires meaningful action, not slogans.", "answer": "meaningful"},
        {"text": "The award was especially meaningful to her family.", "answer": "meaningful"},
    ],
    "meantime": [
        {"text": "The repairs will take weeks; in the meantime, use the side door.", "answer": "meantime"},
        {"text": "The documents are still being checked, but in the meantime we can start.", "answer": "meantime"},
        {"text": "She is waiting for the final decision and resting in the meantime.", "answer": "meantime"},
    ],
    "meditation": [
        {"text": "Daily meditation helps him stay calm under pressure.", "answer": "meditation"},
        {"text": "The retreat offers yoga and meditation sessions.", "answer": "meditation"},
        {"text": "She turned to meditation during a stressful month.", "answer": "meditation"},
    ],
    "melody": [
        {"text": "The song has a simple but unforgettable melody.", "answer": "melody"},
        {"text": "A faint melody drifted from the open window.", "answer": "melody"},
        {"text": "She hummed the melody while walking home.", "answer": "melody"},
    ],
    "memo": [
        {"text": "The manager sent a memo to all staff this morning.", "answer": "memo"},
        {"text": "Please read the safety memo before entering the lab.", "answer": "memo"},
        {"text": "A short memo explained the new schedule.", "answer": "memo"},
    ],
    "memoir": [
        {"text": "Her memoir describes life during the war years.", "answer": "memoir"},
        {"text": "The actor published a memoir after retirement.", "answer": "memoir"},
        {"text": "We read an excerpt from his memoir in class.", "answer": "memoir"},
    ],
    "mender": [
        {"text": "The shoe mender repaired the old boots in a day.", "answer": "mender"},
        {"text": "A skilled mender can make torn fabric look new again.", "answer": "mender"},
        {"text": "The village mender was known for careful work.", "answer": "mender"},
    ],
    "mentors": [
        {"text": "Good mentors guide students without controlling them.", "answer": "mentors"},
        {"text": "Many young artists rely on mentors for advice.", "answer": "mentors"},
        {"text": "The program pairs learners with experienced mentors.", "answer": "mentors"},
    ],
    "mercedes": [
        {"text": "A black mercedes was parked outside the hotel.", "answer": "mercedes"},
        {"text": "He arrived in an old mercedes with faded paint.", "answer": "mercedes"},
        {"text": "The photo showed a silver mercedes near the gate.", "answer": "mercedes"},
    ],
    "merchandise": [
        {"text": "Fans lined up early to buy concert merchandise.", "answer": "merchandise"},
        {"text": "The shop displayed winter merchandise near the entrance.", "answer": "merchandise"},
        {"text": "Damaged merchandise was removed from the shelves.", "answer": "merchandise"},
    ],
    "merely": [
        {"text": "The guide is merely offering a suggestion.", "answer": "merely"},
        {"text": "He was merely trying to help the team.", "answer": "merely"},
        {"text": "The problem is not merely technical but social.", "answer": "merely"},
    ],
    "merit": [
        {"text": "The idea has merit even if it needs revision.", "answer": "merit"},
        {"text": "Promotion should be based on merit, not favoritism.", "answer": "merit"},
        {"text": "Her proposal deserves serious merit-based review.", "answer": "merit"},
    ],
    "methane": [
        {"text": "Methane is a powerful greenhouse gas.", "answer": "methane"},
        {"text": "Scientists measured methane levels in the wetland.", "answer": "methane"},
        {"text": "Leaks of methane can be difficult to detect.", "answer": "methane"},
    ],
    "microorganism": [
        {"text": "A microorganism too small to see caused the illness.", "answer": "microorganism"},
        {"text": "The sample contained an unusual microorganism.", "answer": "microorganism"},
        {"text": "Researchers identified the microorganism in the lab.", "answer": "microorganism"},
    ],
    "migration": [
        {"text": "The documentary follows bird migration across continents.", "answer": "migration"},
        {"text": "Climate change can alter patterns of migration.", "answer": "migration"},
        {"text": "The town was shaped by decades of rural migration.", "answer": "migration"},
    ],
    "militant": [
        {"text": "The group adopted an increasingly militant tone.", "answer": "militant"},
        {"text": "A militant faction rejected the peace talks.", "answer": "militant"},
        {"text": "The article examined the rise of militant movements.", "answer": "militant"},
    ],
    "mince": [
        {"text": "The chef began to mince garlic for the sauce.", "answer": "mince"},
        {"text": "He did not mince his words during the meeting.", "answer": "mince"},
        {"text": "Fresh herbs were minced finely by hand.", "answer": "mince"},
    ],
    "mindblowing": [
        {"text": "The final scene was absolutely mindblowing.", "answer": "mindblowing"},
        {"text": "For first-time visitors, the view is mindblowing.", "answer": "mindblowing"},
        {"text": "The speed of the machine felt mindblowing to the audience.", "answer": "mindblowing"},
    ],
    "minimise": [
        {"text": "The company wants to minimise waste in production.", "answer": "minimise"},
        {"text": "Please minimise noise during the recording session.", "answer": "minimise"},
        {"text": "Careful planning can minimise delays.", "answer": "minimise"},
    ],
    "minimize": [
        {"text": "The design aims to minimize energy loss.", "answer": "minimize"},
        {"text": "We should minimize unnecessary travel this month.", "answer": "minimize"},
        {"text": "The team tried to minimize the risk of error.", "answer": "minimize"},
    ],
    "miracle": [
        {"text": "Doctors called her recovery a miracle.", "answer": "miracle"},
        {"text": "The rescue felt like a miracle to the family.", "answer": "miracle"},
        {"text": "There is no miracle cure for hard work.", "answer": "miracle"},
    ],
    "misconception": [
        {"text": "The article corrects a common misconception about diet.", "answer": "misconception"},
        {"text": "Many students begin with the same misconception.", "answer": "misconception"},
        {"text": "That belief is a harmful misconception.", "answer": "misconception"},
    ],
    "misfortune": [
        {"text": "A series of misfortune events left the family exhausted.", "answer": "misfortune"},
        {"text": "He faced sudden misfortune after losing his job.", "answer": "misfortune"},
        {"text": "The novel follows a hero through repeated misfortune.", "answer": "misfortune"},
    ],
    "mislead": [
        {"text": "Do not let one photo mislead you about the whole place.", "answer": "mislead"},
        {"text": "The graph could mislead readers if taken alone.", "answer": "mislead"},
        {"text": "False headlines often mislead the public.", "answer": "mislead"},
    ],
    "misstep": [
        {"text": "A single misstep on the trail could be dangerous.", "answer": "misstep"},
        {"text": "The company admitted its public misstep quickly.", "answer": "misstep"},
        {"text": "One small misstep does not define a whole career.", "answer": "misstep"},
    ],
    "misuse": [
        {"text": "The report warns against the misuse of personal data.", "answer": "misuse"},
        {"text": "Misuse of medicine can lead to serious harm.", "answer": "misuse"},
        {"text": "He was accused of misuse of public funds.", "answer": "misuse"},
    ],
    "monochrome": [
        {"text": "The designer chose a clean monochrome style.", "answer": "monochrome"},
        {"text": "The photo looked elegant in monochrome.", "answer": "monochrome"},
        {"text": "A monochrome palette made the poster more striking.", "answer": "monochrome"},
    ],
    "monoculture": [
        {"text": "The farm depends too heavily on monoculture methods.", "answer": "monoculture"},
        {"text": "Critics say monoculture reduces biodiversity.", "answer": "monoculture"},
        {"text": "A shift away from monoculture may improve soil health.", "answer": "monoculture"},
    ],
    "monologue": [
        {"text": "The actor delivered a moving monologue on stage.", "answer": "monologue"},
        {"text": "Her opening monologue won immediate applause.", "answer": "monologue"},
        {"text": "The film includes a long inner monologue from the hero.", "answer": "monologue"},
    ],
    "moor": [
        {"text": "The boat was left to moor near the old pier.", "answer": "moor"},
        {"text": "They walked across the misty moor before sunrise.", "answer": "moor"},
        {"text": "Fishermen moor their boats there during storms.", "answer": "moor"},
    ],
    "morality": [
        {"text": "The novel raises difficult questions about morality.", "answer": "morality"},
        {"text": "Some argue that law and morality should not always overlap.", "answer": "morality"},
        {"text": "The debate turned from politics to morality.", "answer": "morality"},
    ],
    "motivational": [
        {"text": "The speaker delivered a short motivational talk.", "answer": "motivational"},
        {"text": "Many students enjoy motivational podcasts before exams.", "answer": "motivational"},
        {"text": "The coach posted a motivational message in the locker room.", "answer": "motivational"},
    ],
    "motivator": [
        {"text": "Fear is not the best motivator for long-term learning.", "answer": "motivator"},
        {"text": "For her, curiosity is a stronger motivator than praise.", "answer": "motivator"},
        {"text": "Money can be a motivator, but not the only one.", "answer": "motivator"},
    ],
    "motive": [
        {"text": "Police are still trying to determine the motive.", "answer": "motive"},
        {"text": "Her real motive remained unclear to the team.", "answer": "motive"},
        {"text": "The court examined whether there was a financial motive.", "answer": "motive"},
    ],
    "mould": [
        {"text": "Black mould spread across the bathroom ceiling.", "answer": "mould"},
        {"text": "The baker used a round mould for the cake.", "answer": "mould"},
        {"text": "Leaders can mould public opinion through media.", "answer": "mould"},
    ],
    "mound": [
        {"text": "A mound of sand blocked part of the path.", "answer": "mound"},
        {"text": "The child sat on a grassy mound near the lake.", "answer": "mound"},
        {"text": "Workers found an ancient burial mound in the field.", "answer": "mound"},
    ],
    "mournful": [
        {"text": "A mournful tune drifted from the violin.", "answer": "mournful"},
        {"text": "His face took on a mournful expression.", "answer": "mournful"},
        {"text": "The film ends with a slow, mournful scene.", "answer": "mournful"},
    ],
    "mutual": [
        {"text": "Trust depends on mutual respect.", "answer": "mutual"},
        {"text": "The two teams reached a mutual agreement.", "answer": "mutual"},
        {"text": "Their friendship was built on mutual support.", "answer": "mutual"},
    ],
    "nationwide": [
        {"text": "The strike caused nationwide disruption to transport.", "answer": "nationwide"},
        {"text": "The survey gathered responses from people nationwide.", "answer": "nationwide"},
        {"text": "A nationwide campaign was launched to save water.", "answer": "nationwide"},
    ],
    "neon": [
        {"text": "A bright neon sign lit the corner shop.", "answer": "neon"},
        {"text": "The poster used neon colors to attract attention.", "answer": "neon"},
        {"text": "Neon lights reflected on the wet street.", "answer": "neon"},
    ],
    "nest": [
        {"text": "A small bird had built a nest above the window.", "answer": "nest"},
        {"text": "The rescue team found the nest hidden in the tree.", "answer": "nest"},
        {"text": "Foxes rarely sleep in the same nest every night.", "answer": "nest"},
    ],
    "net": [
        {"text": "The fisherman repaired his torn net before dawn.", "answer": "net"},
        {"text": "After tax, the company reported a smaller net profit.", "answer": "net"},
        {"text": "The ball struck the net and dropped straight down.", "answer": "net"},
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
