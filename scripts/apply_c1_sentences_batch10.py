from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SENTENCES = {
    "renovation": [
        {"text": "The library closed for renovation during the summer.", "answer": "renovation"},
        {"text": "Their house needs major renovation before winter.", "answer": "renovation"},
        {"text": "The station reopened after a year of renovation.", "answer": "renovation"},
    ],
    "renowned": [
        {"text": "The chef is renowned for creative desserts.", "answer": "renowned"},
        {"text": "The city is renowned as a center of design.", "answer": "renowned"},
        {"text": "She studied with a renowned violin teacher.", "answer": "renowned"},
    ],
    "repeatedly": [
        {"text": "He was repeatedly warned about the risk.", "answer": "repeatedly"},
        {"text": "The same error appeared repeatedly in the report.", "answer": "repeatedly"},
        {"text": "She knocked repeatedly before anyone answered.", "answer": "repeatedly"},
    ],
    "repressive": [
        {"text": "The article condemns the repressive actions of the regime.", "answer": "repressive"},
        {"text": "People fled the country because of repressive laws.", "answer": "repressive"},
        {"text": "The government was accused of repressive behavior toward critics.", "answer": "repressive"},
    ],
    "reptile": [
        {"text": "A reptile house opened beside the aquarium.", "answer": "reptile"},
        {"text": "The child was amazed by the giant reptile exhibit.", "answer": "reptile"},
        {"text": "Each reptile needs a warm, dry environment.", "answer": "reptile"},
    ],
    "resemble": [
        {"text": "The new plan closely resemble?","answer":"resemble"},
        {"text": "This fabric resembles silk but costs less.", "answer": "resemble"},
        {"text": "The child strongly resembles her grandfather.", "answer": "resemble"},
    ],
    "residential": [
        {"text": "The area is mainly residential and very quiet.", "answer": "residential"},
        {"text": "A new residential block was built near the park.", "answer": "residential"},
        {"text": "Heavy traffic does not suit a residential district.", "answer": "residential"},
    ],
    "resistance": [
        {"text": "The medicine faces growing resistance from bacteria.", "answer": "resistance"},
        {"text": "There was strong public resistance to the proposal.", "answer": "resistance"},
        {"text": "Regular exercise can improve resistance to stress.", "answer": "resistance"},
    ],
    "respectful": [
        {"text": "Please remain respectful during the discussion.", "answer": "respectful"},
        {"text": "The students gave a respectful reply to the visitor.", "answer": "respectful"},
        {"text": "She was firm but respectful in her complaint.", "answer": "respectful"},
    ],
    "respectively": [
        {"text": "The two teams scored 3 and 5 goals, respectively.", "answer": "respectively"},
        {"text": "Alice and Ben study law and medicine, respectively.", "answer": "respectively"},
        {"text": "The red and blue lines represent cost and profit, respectively.", "answer": "respectively"},
    ],
    "restoration": [
        {"text": "The castle is undergoing careful restoration.", "answer": "restoration"},
        {"text": "Experts praised the restoration of the old mural.", "answer": "restoration"},
        {"text": "The fund supports the restoration of historic buildings.", "answer": "restoration"},
    ],
    "resume": [
        {"text": "The train service will resume at noon.", "answer": "resume"},
        {"text": "Please attach your resume to the application.", "answer": "resume"},
        {"text": "Talks will resume after a short break.", "answer": "resume"},
    ],
    "rethink": [
        {"text": "The crisis forced the company to rethink its strategy.", "answer": "rethink"},
        {"text": "We may need to rethink the timetable completely.", "answer": "rethink"},
        {"text": "The book invites readers to rethink modern success.", "answer": "rethink"},
    ],
    "retrieve": [
        {"text": "The diver tried to retrieve the lost camera.", "answer": "retrieve"},
        {"text": "You can retrieve the file from the archive.", "answer": "retrieve"},
        {"text": "The dog was trained to retrieve objects from the water.", "answer": "retrieve"},
    ],
    "revenge": [
        {"text": "He acted out of revenge rather than reason.", "answer": "revenge"},
        {"text": "The novel follows a family driven by revenge.", "answer": "revenge"},
        {"text": "She refused to seek revenge after the betrayal.", "answer": "revenge"},
    ],
    "reverse": [
        {"text": "Press this button to reverse the motor.", "answer": "reverse"},
        {"text": "The decision was later reversed on appeal.", "answer": "reverse"},
        {"text": "A sudden reverse in weather spoiled the trip.", "answer": "reverse"},
    ],
    "revitalization": [
        {"text": "The project aims at the revitalization of the old district.", "answer": "revitalization"},
        {"text": "Residents welcomed the revitalization of the waterfront.", "answer": "revitalization"},
        {"text": "The grant supports economic revitalization in rural towns.", "answer": "revitalization"},
    ],
    "revolutionary": [
        {"text": "The device was described as a revolutionary invention.", "answer": "revolutionary"},
        {"text": "The book examines revolutionary movements in Europe.", "answer": "revolutionary"},
        {"text": "Their method brought revolutionary change to surgery.", "answer": "revolutionary"},
    ],
    "riddle": [
        {"text": "The old monk answered the riddle with a smile.", "answer": "riddle"},
        {"text": "The case remained a complete riddle to police.", "answer": "riddle"},
        {"text": "Children tried to solve the riddle together.", "answer": "riddle"},
    ],
    "rip": [
        {"text": "Be careful not to rip the old map.", "answer": "rip"},
        {"text": "There was a long rip in the fabric.", "answer": "rip"},
        {"text": "He heard the rip of paper from the next room.", "answer": "rip"},
    ],
    "ripple": [
        {"text": "A stone created a ripple across the pond.", "answer": "ripple"},
        {"text": "The news sent a ripple of concern through the market.", "answer": "ripple"},
        {"text": "Wind caused ripples on the water surface.", "answer": "ripple"},
    ],
    "ritual": [
        {"text": "Tea drinking is a daily ritual in their home.", "answer": "ritual"},
        {"text": "The festival includes an ancient ritual at sunrise.", "answer": "ritual"},
        {"text": "Morning exercise became a calming ritual for her.", "answer": "ritual"},
    ],
    "rock": [
        {"text": "A large rock blocked the narrow path.", "answer": "rock"},
        {"text": "The ship began to rock in the rough sea.", "answer": "rock"},
        {"text": "They listened to classic rock on the drive home.", "answer": "rock"},
    ],
    "rotate": [
        {"text": "Please rotate the image before printing it.", "answer": "rotate"},
        {"text": "The museum will rotate exhibits every month.", "answer": "rotate"},
        {"text": "Planets rotate around their own axis.", "answer": "rotate"},
    ],
    "rumour": [
        {"text": "A false rumour spread quickly through the office.", "answer": "rumour"},
        {"text": "The mayor denied the rumour in a public statement.", "answer": "rumour"},
        {"text": "One careless post can turn into a damaging rumour.", "answer": "rumour"},
    ],
    "sack": [
        {"text": "Workers filled each sack with rice.", "answer": "sack"},
        {"text": "The manager decided to sack the employee for fraud.", "answer": "sack"},
        {"text": "A heavy sack leaned against the wall.", "answer": "sack"},
    ],
    "sacrifice": [
        {"text": "Success often requires sacrifice and patience.", "answer": "sacrifice"},
        {"text": "They made a huge sacrifice to support their children.", "answer": "sacrifice"},
        {"text": "The film honors those who sacrifice for others.", "answer": "sacrifice"},
    ],
    "savage": [
        {"text": "The town faced savage winds during the storm.", "answer": "savage"},
        {"text": "Critics delivered a savage review of the play.", "answer": "savage"},
        {"text": "The novel describes a savage struggle for survival.", "answer": "savage"},
    ],
    "savagely": [
        {"text": "The dog was savagely attacked in the alley.", "answer": "savagely"},
        {"text": "The article savagely criticized the decision.", "answer": "savagely"},
        {"text": "Rain beat savagely against the windows all night.", "answer": "savagely"},
    ],
    "saying": [
        {"text": "Her grandmother often repeated the same old saying.", "answer": "saying"},
        {"text": "There is a local saying about rain and luck.", "answer": "saying"},
        {"text": "That saying still makes sense today.", "answer": "saying"},
    ],
    "scaffold": [
        {"text": "Workers climbed the scaffold to reach the roof.", "answer": "scaffold"},
        {"text": "The wall was hidden behind scaffold for weeks.", "answer": "scaffold"},
        {"text": "Safety checks on the scaffold were carried out daily.", "answer": "scaffold"},
    ],
    "scandalous": [
        {"text": "The paper printed a scandalous claim on the front page.", "answer": "scandalous"},
        {"text": "People were shocked by the scandalous behavior.", "answer": "scandalous"},
        {"text": "The judge called the treatment scandalous.", "answer": "scandalous"},
    ],
    "scarce": [
        {"text": "Clean water is scarce in the desert.", "answer": "scarce"},
        {"text": "Parking spaces become scarce after noon.", "answer": "scarce"},
        {"text": "Jobs were scarce during the crisis.", "answer": "scarce"},
    ],
    "scatter": [
        {"text": "Please do not scatter papers across the desk.", "answer": "scatter"},
        {"text": "The birds scatter when the door opens.", "answer": "scatter"},
        {"text": "Storms may scatter boats along the coast.", "answer": "scatter"},
    ],
    "sceptical": [
        {"text": "Many voters remain sceptical about the promise.", "answer": "sceptical"},
        {"text": "She sounded sceptical when she heard the explanation.", "answer": "sceptical"},
        {"text": "Investors are still sceptical of the recovery plan.", "answer": "sceptical"},
    ],
    "scholastically": [
        {"text": "He performed well scholastically throughout the year.", "answer": "scholastically"},
        {"text": "The school supports students both socially and scholastically.", "answer": "scholastically"},
        {"text": "She improved scholastically after changing classes.", "answer": "scholastically"},
    ],
    "scold": [
        {"text": "The teacher did not scold the child for the mistake.", "answer": "scold"},
        {"text": "Parents sometimes scold out of worry rather than anger.", "answer": "scold"},
        {"text": "He was scolded for leaving the gate open.", "answer": "scold"},
    ],
    "scope": [
        {"text": "The project grew beyond its original scope.", "answer": "scope"},
        {"text": "The report has a broad international scope.", "answer": "scope"},
        {"text": "That task falls outside the scope of this class.", "answer": "scope"},
    ],
    "scrutiny": [
        {"text": "The contract is under close legal scrutiny.", "answer": "scrutiny"},
        {"text": "Public scrutiny intensified after the leak.", "answer": "scrutiny"},
        {"text": "The proposal could not withstand careful scrutiny.", "answer": "scrutiny"},
    ],
    "seal": [
        {"text": "Please seal the box before collection.", "answer": "seal"},
        {"text": "A young seal rested on the rocks below.", "answer": "seal"},
        {"text": "The document carried an official seal.", "answer": "seal"},
    ],
    "secretive": [
        {"text": "The committee became unusually secretive about the plan.", "answer": "secretive"},
        {"text": "He is private but not especially secretive.", "answer": "secretive"},
        {"text": "Their secretive behavior made others suspicious.", "answer": "secretive"},
    ],
    "seemingly": [
        {"text": "A seemingly small error changed the final result.", "answer": "seemingly"},
        {"text": "The path ended at a seemingly empty wall.", "answer": "seemingly"},
        {"text": "She remained calm despite the seemingly endless delays.", "answer": "seemingly"},
    ],
    "seldom": [
        {"text": "We seldom see stars clearly in the city.", "answer": "seldom"},
        {"text": "Such birds are seldom found this far south.", "answer": "seldom"},
        {"text": "He seldom complains even under pressure.", "answer": "seldom"},
    ],
    "sensation": [
        {"text": "The new singer became an overnight sensation.", "answer": "sensation"},
        {"text": "He felt a strange sensation in his arm.", "answer": "sensation"},
        {"text": "The book caused a sensation when it was published.", "answer": "sensation"},
    ],
    "sensitivity": [
        {"text": "The issue requires cultural sensitivity.", "answer": "sensitivity"},
        {"text": "The camera's sensitivity improved in low light.", "answer": "sensitivity"},
        {"text": "He spoke with sensitivity about the loss.", "answer": "sensitivity"},
    ],
    "sentiment": [
        {"text": "Public sentiment turned against the proposal.", "answer": "sentiment"},
        {"text": "The poem expresses strong patriotic sentiment.", "answer": "sentiment"},
        {"text": "Investor sentiment improved after the report.", "answer": "sentiment"},
    ],
    "separation": [
        {"text": "The long separation tested their friendship.", "answer": "separation"},
        {"text": "Waste separation is now required in every block.", "answer": "separation"},
        {"text": "The film explores grief after separation.", "answer": "separation"},
    ],
    "shameful": [
        {"text": "The committee described the neglect as shameful.", "answer": "shameful"},
        {"text": "He made a shameful attempt to hide the truth.", "answer": "shameful"},
        {"text": "The conditions in the building were shameful.", "answer": "shameful"},
    ],
    "shareholder": [
        {"text": "Each shareholder received a copy of the annual report.", "answer": "shareholder"},
        {"text": "The company met its major shareholder last week.", "answer": "shareholder"},
        {"text": "Several shareholders demanded a clear answer.", "answer": "shareholder"},
    ],
    "shatter": [
        {"text": "The vase may shatter if dropped on stone.", "answer": "shatter"},
        {"text": "The verdict threatened to shatter public trust.", "answer": "shatter"},
        {"text": "A loud crack was heard as the glass began to shatter.", "answer": "shatter"},
    ],
    "sheer": [
        {"text": "It took sheer determination to finish the climb.", "answer": "sheer"},
        {"text": "The cliff dropped down in a sheer wall of rock.", "answer": "sheer"},
        {"text": "The size of the crowd was sheer surprise.", "answer": "sheer"},
    ],
    "shoot": [
        {"text": "The director planned to shoot the film in winter.", "answer": "shoot"},
        {"text": "New leaves begin to shoot from the stem in spring.", "answer": "shoot"},
        {"text": "Please do not shoot flash photos inside the gallery.", "answer": "shoot"},
    ],
    "shorten": [
        {"text": "They had to shorten the meeting because of the storm.", "answer": "shorten"},
        {"text": "Warm weather can shorten the life of some flowers.", "answer": "shorten"},
        {"text": "Please shorten your introduction to two minutes.", "answer": "shorten"},
    ],
    "shrine": [
        {"text": "A small shrine stood at the edge of the village.", "answer": "shrine"},
        {"text": "Visitors lit incense at the mountain shrine.", "answer": "shrine"},
        {"text": "The old shrine attracts tourists every spring.", "answer": "shrine"},
    ],
    "shrink": [
        {"text": "Wool clothes may shrink in hot water.", "answer": "shrink"},
        {"text": "The ice cap continues to shrink each year.", "answer": "shrink"},
        {"text": "He watched his savings shrink over time.", "answer": "shrink"},
    ],
    "shrug": [
        {"text": "She could only shrug when asked for a reason.", "answer": "shrug"},
        {"text": "He gave a small shrug and walked away.", "answer": "shrug"},
        {"text": "The actor ended the scene with a shrug.", "answer": "shrug"},
    ],
    "shuttle": [
        {"text": "A free shuttle runs between the hotel and the station.", "answer": "shuttle"},
        {"text": "Workers use a shuttle bus during the morning rush.", "answer": "shuttle"},
        {"text": "The airport shuttle left every twenty minutes.", "answer": "shuttle"},
    ],
    "sigh": [
        {"text": "She let out a tired sigh after the meeting.", "answer": "sigh"},
        {"text": "A deep sigh filled the quiet room.", "answer": "sigh"},
        {"text": "He sighed with relief when the lights came back.", "answer": "sigh"},
    ],
    "signage": [
        {"text": "New signage helped visitors find the gallery.", "answer": "signage"},
        {"text": "The station upgraded its bilingual signage.", "answer": "signage"},
        {"text": "Poor signage confused tourists at the entrance.", "answer": "signage"},
    ],
    "silicon": [
        {"text": "Silicon is widely used in electronics.", "answer": "silicon"},
        {"text": "The lab studies how silicon behaves under heat.", "answer": "silicon"},
        {"text": "A shortage of silicon affected chip production.", "answer": "silicon"},
    ],
    "silliness": [
        {"text": "A little silliness can lighten the mood.", "answer": "silliness"},
        {"text": "The teacher tolerated a moment of silliness, then continued.", "answer": "silliness"},
        {"text": "The play balances sadness with brief silliness.", "answer": "silliness"},
    ],
    "simplify": [
        {"text": "The guide helps simplify a complex topic.", "answer": "simplify"},
        {"text": "We need to simplify the booking process.", "answer": "simplify"},
        {"text": "Good diagrams can simplify difficult ideas.", "answer": "simplify"},
    ],
    "simplistic": [
        {"text": "The explanation sounded too simplistic to be useful.", "answer": "simplistic"},
        {"text": "A simplistic answer ignores the real causes.", "answer": "simplistic"},
        {"text": "The film avoids simplistic moral judgments.", "answer": "simplistic"},
    ],
    "simulate": [
        {"text": "The lab can simulate earthquake conditions safely.", "answer": "simulate"},
        {"text": "Students used software to simulate traffic flow.", "answer": "simulate"},
        {"text": "The machine simulates the feel of real flight.", "answer": "simulate"},
    ],
    "simultaneously": [
        {"text": "The two lights turned on simultaneously.", "answer": "simultaneously"},
        {"text": "It is difficult to manage both tasks simultaneously.", "answer": "simultaneously"},
        {"text": "The singers began simultaneously on the final note.", "answer": "simultaneously"},
    ],
    "skepticism": [
        {"text": "The announcement was met with public skepticism.", "answer": "skepticism"},
        {"text": "Healthy skepticism can protect people from scams.", "answer": "skepticism"},
        {"text": "Her claim was received with immediate skepticism.", "answer": "skepticism"},
    ],
    "sketch": [
        {"text": "She made a quick sketch of the temple.", "answer": "sketch"},
        {"text": "The meeting ended with a rough sketch of the plan.", "answer": "sketch"},
        {"text": "He loves to sketch people on the train.", "answer": "sketch"},
    ],
    "slap": [
        {"text": "He gave the table a slap to get attention.", "answer": "slap"},
        {"text": "A wave slapped against the side of the boat.", "answer": "slap"},
        {"text": "The actor's slap shocked the audience.", "answer": "slap"},
    ],
    "slash": [
        {"text": "The company plans to slash unnecessary spending.", "answer": "slash"},
        {"text": "A slash in the tire delayed the journey.", "answer": "slash"},
        {"text": "The price was slashed by half during the sale.", "answer": "slash"},
    ],
    "slump": [
        {"text": "Sales entered a slump after the holiday season.", "answer": "slump"},
        {"text": "He watched her slump into the chair from exhaustion.", "answer": "slump"},
        {"text": "The team hopes to recover from its recent slump.", "answer": "slump"},
    ],
    "smash": [
        {"text": "The glass may smash if the box falls.", "answer": "smash"},
        {"text": "The film was a box-office smash.", "answer": "smash"},
        {"text": "He heard a loud smash in the kitchen.", "answer": "smash"},
    ],
    "snap": [
        {"text": "A dry branch may snap under pressure.", "answer": "snap"},
        {"text": "She took a quick snap of the sunset.", "answer": "snap"},
        {"text": "Do not snap at people when you are tired.", "answer": "snap"},
    ],
    "soak": [
        {"text": "Leave the beans to soak overnight.", "answer": "soak"},
        {"text": "Heavy rain began to soak our clothes.", "answer": "soak"},
        {"text": "She likes to soak in a warm bath after work.", "answer": "soak"},
    ],
    "soar": [
        {"text": "Fuel prices may soar over the summer.", "answer": "soar"},
        {"text": "The eagle began to soar above the cliff.", "answer": "soar"},
        {"text": "Confidence soared after the first win.", "answer": "soar"},
    ],
    "socialist": [
        {"text": "The article compares liberal and socialist traditions.", "answer": "socialist"},
        {"text": "He joined a small socialist party at university.", "answer": "socialist"},
        {"text": "The movement had strong socialist roots.", "answer": "socialist"},
    ],
    "societal": [
        {"text": "The study examines long-term societal change.", "answer": "societal"},
        {"text": "Climate change is a major societal challenge.", "answer": "societal"},
        {"text": "The report highlights the societal cost of isolation.", "answer": "societal"},
    ],
    "solace": [
        {"text": "Music gave her solace during a hard year.", "answer": "solace"},
        {"text": "He found solace in long walks by the sea.", "answer": "solace"},
        {"text": "Books can offer solace after loss.", "answer": "solace"},
    ],
    "sole": [
        {"text": "She was the sole witness to the incident.", "answer": "sole"},
        {"text": "The company is the sole provider in the area.", "answer": "sole"},
        {"text": "Mud stuck to the sole of his shoe.", "answer": "sole"},
    ],
    "solo": [
        {"text": "She performed a solo at the end of the concert.", "answer": "solo"},
        {"text": "He plans to travel solo across Europe.", "answer": "solo"},
        {"text": "The dancer opened the show with a solo routine.", "answer": "solo"},
    ],
    "somber": [
        {"text": "The mood in the hall was somber after the news.", "answer": "somber"},
        {"text": "She wore somber colors to the ceremony.", "answer": "somber"},
        {"text": "A somber silence settled over the room.", "answer": "somber"},
    ],
    "sonic": [
        {"text": "The device creates a sonic map of the cave.", "answer": "sonic"},
        {"text": "Researchers measured sonic waves in the chamber.", "answer": "sonic"},
        {"text": "The film uses a rich sonic landscape.", "answer": "sonic"},
    ],
    "soothe": [
        {"text": "Soft music can soothe an anxious child.", "answer": "soothe"},
        {"text": "The nurse tried to soothe the patient before the test.", "answer": "soothe"},
        {"text": "A cool drink helped soothe his throat.", "answer": "soothe"},
    ],
    "sophisticate": [
        {"text": "The city attracts young sophisticates from around the region.", "answer": "sophisticate"},
        {"text": "He sees himself as a worldly sophisticate.", "answer": "sophisticate"},
        {"text": "The novel mocks the habits of urban sophisticates.", "answer": "sophisticate"},
    ],
    "sophistication": [
        {"text": "The software has gained new sophistication over time.", "answer": "sophistication"},
        {"text": "Her writing combines wit with quiet sophistication.", "answer": "sophistication"},
        {"text": "The design impressed judges with its elegance and sophistication.", "answer": "sophistication"},
    ],
    "sound": [
        {"text": "The old piano no longer produces a clear sound.", "answer": "sound"},
        {"text": "The decision appears financially sound.", "answer": "sound"},
        {"text": "A strange sound came from the roof above.", "answer": "sound"},
    ],
    "sow": [
        {"text": "Farmers sow rice before the rainy season.", "answer": "sow"},
        {"text": "It is easy to sow doubt with careless language.", "answer": "sow"},
        {"text": "They sowed seeds along the riverbank in spring.", "answer": "sow"},
    ],
    "span": [
        {"text": "The bridge can span the entire river.", "answer": "span"},
        {"text": "Her career span more than forty years.", "answer": "span"},
        {"text": "The course covers a wide span of topics.", "answer": "span"},
    ],
    "spare": [
        {"text": "Do you have a spare key for the back door?", "answer": "spare"},
        {"text": "She could not spare any more time that day.", "answer": "spare"},
        {"text": "The team kept a spare battery in the bag.", "answer": "spare"},
    ],
    "spark": [
        {"text": "One spark can start a forest fire in dry weather.", "answer": "spark"},
        {"text": "The report sparked new debate in parliament.", "answer": "spark"},
        {"text": "Her comment gave the meeting a spark of humor.", "answer": "spark"},
    ],
    "specimen": [
        {"text": "Each specimen was stored in a separate box.", "answer": "specimen"},
        {"text": "The museum displayed a rare fossil specimen.", "answer": "specimen"},
        {"text": "Scientists collected a water specimen for testing.", "answer": "specimen"},
    ],
    "spectacle": [
        {"text": "The fireworks created an amazing spectacle.", "answer": "spectacle"},
        {"text": "The trial turned into a public spectacle.", "answer": "spectacle"},
        {"text": "Crowds gathered to watch the spectacle in the square.", "answer": "spectacle"},
    ],
    "spell": [
        {"text": "Please spell your surname clearly for the record.", "answer": "spell"},
        {"text": "A warm spell followed weeks of cold rain.", "answer": "spell"},
        {"text": "The old story includes a spell to open the gate.", "answer": "spell"},
    ],
    "spin": [
        {"text": "The wheel began to spin faster and faster.", "answer": "spin"},
        {"text": "Politicians often try to spin bad news positively.", "answer": "spin"},
        {"text": "The dancers spin in perfect time with the music.", "answer": "spin"},
    ],
    "spindly": [
        {"text": "A spindly tree bent in the strong wind.", "answer": "spindly"},
        {"text": "The chair stood on four spindly legs.", "answer": "spindly"},
        {"text": "A spindly plant reached up toward the light.", "answer": "spindly"},
    ],
    "sprout": [
        {"text": "Fresh leaves began to sprout after the rain.", "answer": "sprout"},
        {"text": "The farmer watched the seeds sprout in neat rows.", "answer": "sprout"},
        {"text": "Tiny ideas can sprout into major projects.", "answer": "sprout"},
    ],
    "spy": [
        {"text": "The novel follows a spy working undercover abroad.", "answer": "spy"},
        {"text": "He used the rooftop to spy on the harbor.", "answer": "spy"},
        {"text": "The film portrays a retired spy returning for one last mission.", "answer": "spy"},
    ],
    "squeeze": [
        {"text": "She had to squeeze through the crowded doorway.", "answer": "squeeze"},
        {"text": "The budget squeeze affected every department.", "answer": "squeeze"},
        {"text": "A fresh lemon was squeezed over the fish.", "answer": "squeeze"},
    ],
    "stack": [
        {"text": "Please stack the chairs neatly by the wall.", "answer": "stack"},
        {"text": "A stack of papers covered the desk.", "answer": "stack"},
        {"text": "Boxes were stacked to the ceiling in the store room.", "answer": "stack"},
    ],
    "stagnate": [
        {"text": "Without new ideas, the company may stagnate.", "answer": "stagnate"},
        {"text": "The economy seemed to stagnate for several years.", "answer": "stagnate"},
        {"text": "Skills can stagnate if they are not used.", "answer": "stagnate"},
    ],
    "staircase": [
        {"text": "The old wooden staircase creaked loudly at night.", "answer": "staircase"},
        {"text": "A narrow staircase led up to the attic.", "answer": "staircase"},
        {"text": "They paused halfway up the grand staircase.", "answer": "staircase"},
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
