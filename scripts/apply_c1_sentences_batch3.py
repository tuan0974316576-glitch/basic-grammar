from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SENTENCES = {
    "complainant": [
        {"text": "The complainant provided new evidence to the court.", "answer": "complainant"},
        {"text": "Police interviewed the complainant again that evening.", "answer": "complainant"},
        {"text": "The complainant asked for her identity to remain private.", "answer": "complainant"},
    ],
    "complement": [
        {"text": "Fresh herbs complement the flavor of the soup.", "answer": "complement"},
        {"text": "His patience and her energy complement each other well.", "answer": "complement"},
        {"text": "The designer chose colors that complement the furniture.", "answer": "complement"},
    ],
    "complementary": [
        {"text": "The hotel offers complementary services for business travelers.", "answer": "complementary"},
        {"text": "Their skills are complementary rather than competitive.", "answer": "complementary"},
        {"text": "The two reports provide complementary perspectives on the issue.", "answer": "complementary"},
    ],
    "complicate": [
        {"text": "Heavy rain may complicate the rescue operation.", "answer": "complicate"},
        {"text": "Do not complicate the process with unnecessary rules.", "answer": "complicate"},
        {"text": "A lack of trust can complicate even simple negotiations.", "answer": "complicate"},
    ],
    "compost": [
        {"text": "Kitchen scraps can be turned into compost.", "answer": "compost"},
        {"text": "The gardener spread compost around the plants.", "answer": "compost"},
        {"text": "Good compost improves the quality of the soil.", "answer": "compost"},
    ],
    "compostables": [
        {"text": "The city now collects compostables separately each week.", "answer": "compostables"},
        {"text": "Food scraps and leaves are common compostables.", "answer": "compostables"},
        {"text": "Please place compostables in the green bin.", "answer": "compostables"},
    ],
    "conceive": [
        {"text": "It is hard to conceive a world without the internet.", "answer": "conceive"},
        {"text": "The architect helped conceive the entire project.", "answer": "conceive"},
        {"text": "Few could conceive how quickly the city would change.", "answer": "conceive"},
    ],
    "conception": [
        {"text": "Their conception of success differs greatly from ours.", "answer": "conception"},
        {"text": "The original conception of the building was much simpler.", "answer": "conception"},
        {"text": "This theory changed the public conception of time and space.", "answer": "conception"},
    ],
    "concession": [
        {"text": "The government made a concession after public pressure.", "answer": "concession"},
        {"text": "His apology was seen as a concession of defeat.", "answer": "concession"},
        {"text": "They reached an agreement only after several concessions.", "answer": "concession"},
    ],
    "concur": [
        {"text": "Most experts concur with the report's main findings.", "answer": "concur"},
        {"text": "I concur that the plan needs more time.", "answer": "concur"},
        {"text": "The judges concurred on the final result.", "answer": "concur"},
    ],
    "conducive": [
        {"text": "Quiet music can create an atmosphere conducive to study.", "answer": "conducive"},
        {"text": "The small room is not conducive to creative work.", "answer": "conducive"},
        {"text": "Trust is conducive to honest communication.", "answer": "conducive"},
    ],
    "confer": [
        {"text": "The award will confer prestige on the winner.", "answer": "confer"},
        {"text": "Doctors gathered to confer about the case.", "answer": "confer"},
        {"text": "Citizenship can confer certain legal rights.", "answer": "confer"},
    ],
    "confidentially": [
        {"text": "She spoke confidentially with the school counselor.", "answer": "confidentially"},
        {"text": "Please send the report confidentially to the director.", "answer": "confidentially"},
        {"text": "The witness asked to speak confidentially.", "answer": "confidentially"},
    ],
    "confine": [
        {"text": "Doctors had to confine him to bed for a week.", "answer": "confine"},
        {"text": "Do not confine the discussion to one example only.", "answer": "confine"},
        {"text": "The storm may confine travelers to the airport overnight.", "answer": "confine"},
    ],
    "confinement": [
        {"text": "Long confinement indoors affected his mood.", "answer": "confinement"},
        {"text": "The animal suffered in conditions of confinement.", "answer": "confinement"},
        {"text": "Her doctor recommended rest during the period of confinement.", "answer": "confinement"},
    ],
    "confirmation": [
        {"text": "We received email confirmation of the booking.", "answer": "confirmation"},
        {"text": "The results provided confirmation of their theory.", "answer": "confirmation"},
        {"text": "She is waiting for final confirmation from the bank.", "answer": "confirmation"},
    ],
    "confront": [
        {"text": "Citizens must confront the reality of climate change.", "answer": "confront"},
        {"text": "She decided to confront him about the rumor.", "answer": "confront"},
        {"text": "The company must confront rising costs soon.", "answer": "confront"},
    ],
    "congestion": [
        {"text": "Traffic congestion worsens during the holiday season.", "answer": "congestion"},
        {"text": "The city introduced new measures to reduce congestion.", "answer": "congestion"},
        {"text": "Chest congestion made it hard for him to sleep.", "answer": "congestion"},
    ],
    "consciously": [
        {"text": "She consciously avoided using difficult language.", "answer": "consciously"},
        {"text": "We must consciously make time for rest.", "answer": "consciously"},
        {"text": "He consciously slowed his breathing before speaking.", "answer": "consciously"},
    ],
    "consensus": [
        {"text": "The panel reached a consensus after two hours of debate.", "answer": "consensus"},
        {"text": "There is growing consensus among scientists on the issue.", "answer": "consensus"},
        {"text": "Without consensus, the proposal could not move forward.", "answer": "consensus"},
    ],
    "consent": [
        {"text": "Parents must give written consent for the trip.", "answer": "consent"},
        {"text": "The patient signed a form of informed consent.", "answer": "consent"},
        {"text": "He refused to act without her consent.", "answer": "consent"},
    ],
    "conservationist": [
        {"text": "The conservationist worked to protect the wetland.", "answer": "conservationist"},
        {"text": "A local conservationist led the tree-planting campaign.", "answer": "conservationist"},
        {"text": "The conservationist spoke about endangered species.", "answer": "conservationist"},
    ],
    "conserve": [
        {"text": "We should conserve water during dry seasons.", "answer": "conserve"},
        {"text": "The museum tries to conserve fragile documents.", "answer": "conserve"},
        {"text": "Turning off lights helps conserve energy.", "answer": "conserve"},
    ],
    "console": [
        {"text": "She tried to console her friend after the bad news.", "answer": "console"},
        {"text": "Nothing he said could console the child.", "answer": "console"},
        {"text": "The nurse did her best to console the anxious patient.", "answer": "console"},
    ],
    "constitute": [
        {"text": "These details constitute clear evidence of fraud.", "answer": "constitute"},
        {"text": "Women constitute more than half of the workforce.", "answer": "constitute"},
        {"text": "Late payment may constitute a breach of contract.", "answer": "constitute"},
    ],
    "constraint": [
        {"text": "Budget constraints limited the size of the project.", "answer": "constraint"},
        {"text": "Time was the main constraint on the team.", "answer": "constraint"},
        {"text": "Creative work often begins under constraint.", "answer": "constraint"},
    ],
    "constructive": [
        {"text": "We need constructive feedback, not personal attacks.", "answer": "constructive"},
        {"text": "The meeting ended on a constructive note.", "answer": "constructive"},
        {"text": "Teachers should encourage constructive discussion.", "answer": "constructive"},
    ],
    "contamination": [
        {"text": "The lab was closed because of contamination risk.", "answer": "contamination"},
        {"text": "Water contamination can threaten public health.", "answer": "contamination"},
        {"text": "Strict rules help prevent food contamination.", "answer": "contamination"},
    ],
    "contend": [
        {"text": "Some experts contend that the data is misleading.", "answer": "contend"},
        {"text": "The team must contend with several injuries.", "answer": "contend"},
        {"text": "She contends that the policy is unfair.", "answer": "contend"},
    ],
    "contender": [
        {"text": "He is now a serious contender for the title.", "answer": "contender"},
        {"text": "Several contenders entered the final round.", "answer": "contender"},
        {"text": "The award has only one clear contender this year.", "answer": "contender"},
    ],
    "content": [
        {"text": "Online content spreads quickly across different platforms.", "answer": "content"},
        {"text": "She seemed content with the final decision.", "answer": "content"},
        {"text": "Teachers reviewed the course content before the exam.", "answer": "content"},
    ],
    "contentious": [
        {"text": "The new law remains highly contentious.", "answer": "contentious"},
        {"text": "It was a contentious meeting from the start.", "answer": "contentious"},
        {"text": "Their report covers several contentious issues.", "answer": "contentious"},
    ],
    "contestant": [
        {"text": "Each contestant had two minutes to answer.", "answer": "contestant"},
        {"text": "The youngest contestant surprised the judges.", "answer": "contestant"},
        {"text": "A contestant from Canada won the final round.", "answer": "contestant"},
    ],
    "continually": [
        {"text": "The system is continually updated for security reasons.", "answer": "continually"},
        {"text": "He was continually checking his phone during dinner.", "answer": "continually"},
        {"text": "The city is continually changing and expanding.", "answer": "continually"},
    ],
    "contractor": [
        {"text": "The contractor promised to finish the work by Friday.", "answer": "contractor"},
        {"text": "They hired a local contractor to repair the roof.", "answer": "contractor"},
        {"text": "The contractor inspected the site this morning.", "answer": "contractor"},
    ],
    "contractual": [
        {"text": "The company has a contractual duty to provide support.", "answer": "contractual"},
        {"text": "They are reviewing the contractual terms carefully.", "answer": "contractual"},
        {"text": "A contractual dispute delayed the project.", "answer": "contractual"},
    ],
    "contradiction": [
        {"text": "His statement contained a clear contradiction.", "answer": "contradiction"},
        {"text": "There is a contradiction between the two reports.", "answer": "contradiction"},
        {"text": "The witness noticed a contradiction in her own account.", "answer": "contradiction"},
    ],
    "contrary": [
        {"text": "Contrary to expectations, the team won easily.", "answer": "contrary"},
        {"text": "The evidence points to the contrary conclusion.", "answer": "contrary"},
        {"text": "His actions were contrary to company policy.", "answer": "contrary"},
    ],
    "convenor": [
        {"text": "The convenor opened the conference with a short speech.", "answer": "convenor"},
        {"text": "Please contact the convenor for schedule changes.", "answer": "convenor"},
        {"text": "The convenor coordinated all the guest speakers.", "answer": "convenor"},
    ],
    "conversion": [
        {"text": "The factory plans a conversion to clean energy.", "answer": "conversion"},
        {"text": "Currency conversion fees can be expensive.", "answer": "conversion"},
        {"text": "The building underwent conversion into apartments.", "answer": "conversion"},
    ],
    "cooperative": [
        {"text": "The children were more cooperative after lunch.", "answer": "cooperative"},
        {"text": "A cooperative approach helped solve the problem.", "answer": "cooperative"},
        {"text": "The witness was calm and cooperative throughout.", "answer": "cooperative"},
    ],
    "cop": [
        {"text": "A cop directed traffic around the accident site.", "answer": "cop"},
        {"text": "The film follows a cop working undercover.", "answer": "cop"},
        {"text": "A local cop stopped to help the lost child.", "answer": "cop"},
    ],
    "copyright": [
        {"text": "The artist registered the image under copyright law.", "answer": "copyright"},
        {"text": "Uploading that file may break copyright rules.", "answer": "copyright"},
        {"text": "Schools should teach students about copyright.", "answer": "copyright"},
    ],
    "correction": [
        {"text": "The newspaper issued a correction the next day.", "answer": "correction"},
        {"text": "Her teacher marked every grammar correction in red.", "answer": "correction"},
        {"text": "The machine needs slight correction to stay aligned.", "answer": "correction"},
    ],
    "correlation": [
        {"text": "Researchers found a correlation between sleep and memory.", "answer": "correlation"},
        {"text": "The report suggests a strong correlation in the data.", "answer": "correlation"},
        {"text": "Correlation does not always prove causation.", "answer": "correlation"},
    ],
    "correspondence": [
        {"text": "All official correspondence should be filed carefully.", "answer": "correspondence"},
        {"text": "Their private correspondence lasted for years.", "answer": "correspondence"},
        {"text": "There was close correspondence between the two sets of results.", "answer": "correspondence"},
    ],
    "correspondent": [
        {"text": "The foreign correspondent reported from the border.", "answer": "correspondent"},
        {"text": "A business correspondent covered the market crash.", "answer": "correspondent"},
        {"text": "The newspaper sent a correspondent to the summit.", "answer": "correspondent"},
    ],
    "corrupt": [
        {"text": "The report exposed several corrupt officials.", "answer": "corrupt"},
        {"text": "A corrupt system cannot earn public trust.", "answer": "corrupt"},
        {"text": "Files may become corrupt if the device shuts down suddenly.", "answer": "corrupt"},
    ],
    "costly": [
        {"text": "The mistake proved costly for the company.", "answer": "costly"},
        {"text": "Maintaining the old building is increasingly costly.", "answer": "costly"},
        {"text": "War can have costly long-term consequences.", "answer": "costly"},
    ],
    "counter": [
        {"text": "She placed the fruit on the kitchen counter.", "answer": "counter"},
        {"text": "The team launched a campaign to counter false rumors.", "answer": "counter"},
        {"text": "Please collect your ticket at the front counter.", "answer": "counter"},
    ],
    "counteract": [
        {"text": "Exercise can counteract the effects of stress.", "answer": "counteract"},
        {"text": "The new rules aim to counteract rising prices.", "answer": "counteract"},
        {"text": "Nothing could fully counteract the damage caused.", "answer": "counteract"},
    ],
    "counterpart": [
        {"text": "She met her Japanese counterpart during the conference.", "answer": "counterpart"},
        {"text": "The digital version is cheaper than its printed counterpart.", "answer": "counterpart"},
        {"text": "Each minister spoke with a counterpart from another country.", "answer": "counterpart"},
    ],
    "counterproductive": [
        {"text": "Too much pressure can be counterproductive.", "answer": "counterproductive"},
        {"text": "The strict ban may prove counterproductive in the long run.", "answer": "counterproductive"},
        {"text": "Arguing late at night is often counterproductive.", "answer": "counterproductive"},
    ],
    "countless": [
        {"text": "The city lights were reflected in countless windows.", "answer": "countless"},
        {"text": "She has helped countless students over the years.", "answer": "countless"},
        {"text": "Countless birds rest in the wetlands during winter.", "answer": "countless"},
    ],
    "craft": [
        {"text": "It takes years to craft a strong argument.", "answer": "craft"},
        {"text": "The museum displays traditional craft from many regions.", "answer": "craft"},
        {"text": "She learned to craft jewelry by hand.", "answer": "craft"},
    ],
    "creator": [
        {"text": "The creator of the series attended the premiere.", "answer": "creator"},
        {"text": "Online creators often depend on loyal audiences.", "answer": "creator"},
        {"text": "The game's creator shared early sketches with fans.", "answer": "creator"},
    ],
    "credibility": [
        {"text": "The false report damaged the newspaper's credibility.", "answer": "credibility"},
        {"text": "Experts rely on data to build credibility.", "answer": "credibility"},
        {"text": "Her calm response added to her credibility.", "answer": "credibility"},
    ],
    "creditworthiness": [
        {"text": "Banks assess creditworthiness before approving loans.", "answer": "creditworthiness"},
        {"text": "A stable income improves your creditworthiness.", "answer": "creditworthiness"},
        {"text": "The firm lost creditworthiness after repeated defaults.", "answer": "creditworthiness"},
    ],
    "creditworthy": [
        {"text": "The company remains creditworthy despite the slowdown.", "answer": "creditworthy"},
        {"text": "Only a creditworthy applicant can secure that rate.", "answer": "creditworthy"},
        {"text": "Years of careful planning made the business creditworthy.", "answer": "creditworthy"},
    ],
    "cruiser": [
        {"text": "A police cruiser arrived within minutes.", "answer": "cruiser"},
        {"text": "The navy cruiser sailed into the harbor at dawn.", "answer": "cruiser"},
        {"text": "They rented a road cruiser for the island trip.", "answer": "cruiser"},
    ],
    "crunch": [
        {"text": "The company faced a cash crunch after sales dropped.", "answer": "crunch"},
        {"text": "We heard the crunch of gravel under our shoes.", "answer": "crunch"},
        {"text": "There is no time to relax during the final crunch.", "answer": "crunch"},
    ],
    "crush": [
        {"text": "Do not crush the flowers while walking past.", "answer": "crush"},
        {"text": "The machine can crush glass into tiny pieces.", "answer": "crush"},
        {"text": "He had a secret crush on his classmate.", "answer": "crush"},
    ],
    "crystal": [
        {"text": "The bowl was made of fine crystal.", "answer": "crystal"},
        {"text": "Water drops formed like crystal on the window.", "answer": "crystal"},
        {"text": "Her explanation was crystal clear.", "answer": "crystal"},
    ],
    "cube": [
        {"text": "She dropped an ice cube into the glass.", "answer": "cube"},
        {"text": "The sculpture was shaped like a cube.", "answer": "cube"},
        {"text": "Each cube fits neatly into the box.", "answer": "cube"},
    ],
    "culprit": [
        {"text": "Police finally identified the culprit behind the theft.", "answer": "culprit"},
        {"text": "Stress was the real culprit in many of the errors.", "answer": "culprit"},
        {"text": "The culprit escaped before officers arrived.", "answer": "culprit"},
    ],
    "cultivate": [
        {"text": "Teachers should cultivate curiosity in the classroom.", "answer": "cultivate"},
        {"text": "Farmers cultivate rice in the valley below.", "answer": "cultivate"},
        {"text": "It takes time to cultivate strong friendships.", "answer": "cultivate"},
    ],
    "curse": [
        {"text": "In the legend, the village was placed under a curse.", "answer": "curse"},
        {"text": "He muttered a curse under his breath.", "answer": "curse"},
        {"text": "Some saw the discovery as both a gift and a curse.", "answer": "curse"},
    ],
    "cutting-edge": [
        {"text": "The lab is known for its cutting-edge research.", "answer": "cutting-edge"},
        {"text": "They installed cutting-edge security systems in the building.", "answer": "cutting-edge"},
        {"text": "The festival showcased cutting-edge digital art.", "answer": "cutting-edge"},
    ],
    "cynical": [
        {"text": "After years of scandals, many voters became cynical.", "answer": "cynical"},
        {"text": "His cynical comment upset the whole team.", "answer": "cynical"},
        {"text": "She sounded cynical about the new campaign.", "answer": "cynical"},
    ],
    "cynicism": [
        {"text": "Public cynicism grows when promises are repeatedly broken.", "answer": "cynicism"},
        {"text": "His humor hides a deep sense of cynicism.", "answer": "cynicism"},
        {"text": "The article explores political cynicism among young people.", "answer": "cynicism"},
    ],
    "dab": [
        {"text": "Use a tissue to dab the stain gently.", "answer": "dab"},
        {"text": "She placed a dab of cream on the burn.", "answer": "dab"},
        {"text": "A quick dab of paint changed the whole picture.", "answer": "dab"},
    ],
    "debunk": [
        {"text": "The article aims to debunk common health myths.", "answer": "debunk"},
        {"text": "Scientists quickly debunked the false rumor.", "answer": "debunk"},
        {"text": "The documentary tries to debunk several popular legends.", "answer": "debunk"},
    ],
    "debut": [
        {"text": "The singer made her debut on a national stage.", "answer": "debut"},
        {"text": "His debut novel won several awards.", "answer": "debut"},
        {"text": "The play will debut next month in London.", "answer": "debut"},
    ],
    "dedicate": [
        {"text": "She decided to dedicate her life to science.", "answer": "dedicate"},
        {"text": "The team will dedicate the win to their coach.", "answer": "dedicate"},
        {"text": "He can dedicate only two hours a day to study.", "answer": "dedicate"},
    ],
    "deem": [
        {"text": "The court may deem the contract invalid.", "answer": "deem"},
        {"text": "The teacher deemed the answer acceptable.", "answer": "deem"},
        {"text": "The report deemed the project too risky.", "answer": "deem"},
    ],
    "defect": [
        {"text": "A small defect in the part caused the machine to fail.", "answer": "defect"},
        {"text": "The factory recalled products with a design defect.", "answer": "defect"},
        {"text": "Quality checks can catch a defect before shipping.", "answer": "defect"},
    ],
    "deflection": [
        {"text": "The deflection of light can create a rainbow effect.", "answer": "deflection"},
        {"text": "His answer sounded like a deflection rather than a reply.", "answer": "deflection"},
        {"text": "Engineers measured the beam's deflection under pressure.", "answer": "deflection"},
    ],
    "delicate": [
        {"text": "The glass figures are too delicate to move often.", "answer": "delicate"},
        {"text": "Diplomats faced a delicate situation after the meeting.", "answer": "delicate"},
        {"text": "The doctor handled the matter in a delicate way.", "answer": "delicate"},
    ],
    "delusional": [
        {"text": "The review described his plan as wildly delusional.", "answer": "delusional"},
        {"text": "She sounded delusional when describing the risks.", "answer": "delusional"},
        {"text": "The novel follows a delusional character losing touch with reality.", "answer": "delusional"},
    ],
    "demo": [
        {"text": "The team gave a live demo of the new app.", "answer": "demo"},
        {"text": "A short demo helped customers understand the product.", "answer": "demo"},
        {"text": "The band uploaded a demo of their latest song.", "answer": "demo"},
    ],
    "dense": [
        {"text": "The forest was too dense to walk through easily.", "answer": "dense"},
        {"text": "This chapter is dense and requires careful reading.", "answer": "dense"},
        {"text": "Morning fog was so dense that flights were delayed.", "answer": "dense"},
    ],
    "dependable": [
        {"text": "She is one of the most dependable people on the team.", "answer": "dependable"},
        {"text": "A dependable bus service is essential in rural areas.", "answer": "dependable"},
        {"text": "He proved dependable during the crisis.", "answer": "dependable"},
    ],
    "depict": [
        {"text": "The mural depicts daily life in the old city.", "answer": "depict"},
        {"text": "The report depicts a troubling picture of inequality.", "answer": "depict"},
        {"text": "Artists often depict light in different ways.", "answer": "depict"},
    ],
    "deplete": [
        {"text": "Overfishing can deplete marine populations quickly.", "answer": "deplete"},
        {"text": "Long meetings can deplete your energy.", "answer": "deplete"},
        {"text": "The drought began to deplete water reserves.", "answer": "deplete"},
    ],
    "deplorable": [
        {"text": "The shelter was kept in deplorable condition.", "answer": "deplorable"},
        {"text": "Officials described the violence as deplorable.", "answer": "deplorable"},
        {"text": "The report condemned the deplorable state of the prison.", "answer": "deplorable"},
    ],
    "deploy": [
        {"text": "The company plans to deploy the software next month.", "answer": "deploy"},
        {"text": "Emergency teams were deployed to the flooded area.", "answer": "deploy"},
        {"text": "Schools will deploy extra staff during the exam period.", "answer": "deploy"},
    ],
    "deposit": [
        {"text": "You must pay a small deposit to reserve the room.", "answer": "deposit"},
        {"text": "The river can deposit rich soil on the plain.", "answer": "deposit"},
        {"text": "She made a deposit at the bank before lunch.", "answer": "deposit"},
    ],
    "deprive": [
        {"text": "Lack of sleep can deprive you of clear thinking.", "answer": "deprive"},
        {"text": "No child should be deprived of education.", "answer": "deprive"},
        {"text": "The law aims to deprive criminals of illegal profits.", "answer": "deprive"},
    ],
    "descent": [
        {"text": "The descent from the mountain was slow and tiring.", "answer": "descent"},
        {"text": "She is of mixed cultural descent.", "answer": "descent"},
        {"text": "The aircraft began its final descent at sunset.", "answer": "descent"},
    ],
    "descriptive": [
        {"text": "Her writing is rich and highly descriptive.", "answer": "descriptive"},
        {"text": "The survey includes both descriptive and numerical questions.", "answer": "descriptive"},
        {"text": "A descriptive label helps customers understand the product.", "answer": "descriptive"},
    ],
    "designate": [
        {"text": "The city will designate the area as protected land.", "answer": "designate"},
        {"text": "A driver must be designated before the trip begins.", "answer": "designate"},
        {"text": "The room was designated for emergency use only.", "answer": "designate"},
    ],
    "designation": [
        {"text": "The site received official designation as a heritage area.", "answer": "designation"},
        {"text": "His new designation comes with more responsibility.", "answer": "designation"},
        {"text": "The designation helped protect the forest from development.", "answer": "designation"},
    ],
    "destiny": [
        {"text": "She believed that meeting him was part of her destiny.", "answer": "destiny"},
        {"text": "The novel suggests that people can shape their own destiny.", "answer": "destiny"},
        {"text": "A sense of destiny drove him forward.", "answer": "destiny"},
    ],
    "deteriorate": [
        {"text": "Without repair, the road will deteriorate further.", "answer": "deteriorate"},
        {"text": "Her health began to deteriorate after the winter.", "answer": "deteriorate"},
        {"text": "Relations between the two sides continue to deteriorate.", "answer": "deteriorate"},
    ],
    "diagnosis": [
        {"text": "The doctor gave a clear diagnosis after the tests.", "answer": "diagnosis"},
        {"text": "Early diagnosis often improves treatment outcomes.", "answer": "diagnosis"},
        {"text": "The patient waited anxiously for the final diagnosis.", "answer": "diagnosis"},
    ],
    "diffuse": [
        {"text": "Clouds diffuse the sunlight across the valley.", "answer": "diffuse"},
        {"text": "The room was lit by a soft, diffuse glow.", "answer": "diffuse"},
        {"text": "The manager tried to diffuse the tension in the meeting.", "answer": "diffuse"},
    ],
    "dignify": [
        {"text": "The mayor refused to dignify the rumor with a reply.", "answer": "dignify"},
        {"text": "The award helps dignify essential care work.", "answer": "dignify"},
        {"text": "Simple reforms can dignify life for many workers.", "answer": "dignify"},
    ],
    "dimension": [
        {"text": "The room has a larger dimension than I expected.", "answer": "dimension"},
        {"text": "The problem has both social and economic dimensions.", "answer": "dimension"},
        {"text": "Artists can create the illusion of dimension with shadow.", "answer": "dimension"},
    ],
    "diminish": [
        {"text": "The value of the collection may diminish over time.", "answer": "diminish"},
        {"text": "Nothing can diminish the importance of the issue.", "answer": "diminish"},
        {"text": "As the storm moved away, the wind began to diminish.", "answer": "diminish"},
    ],
    "dimly": [
        {"text": "The hall was dimly lit by a few small lamps.", "answer": "dimly"},
        {"text": "He could dimly remember their first meeting.", "answer": "dimly"},
        {"text": "Figures moved dimly in the fog.", "answer": "dimly"},
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
