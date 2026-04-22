from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SENTENCES = {
    "abortion": [
        {"text": "The debate over abortion remains highly sensitive in many countries.", "answer": "abortion"},
        {"text": "She wrote a research paper about laws related to abortion.", "answer": "abortion"},
        {"text": "Public opinion on abortion often differs across generations.", "answer": "abortion"},
    ],
    "absence": [
        {"text": "Her absence from the meeting was noticed immediately.", "answer": "absence"},
        {"text": "The teacher asked for a reason for his absence yesterday.", "answer": "absence"},
        {"text": "In the absence of clear evidence, the case was delayed.", "answer": "absence"},
    ],
    "absorption": [
        {"text": "The absorption of sunlight helps power the device.", "answer": "absorption"},
        {"text": "Good soil improves the absorption of water after rain.", "answer": "absorption"},
        {"text": "The scientist measured the absorption of heat by the material.", "answer": "absorption"},
    ],
    "abstractly": [
        {"text": "He spoke abstractly about freedom instead of giving examples.", "answer": "abstractly"},
        {"text": "The concept was explained abstractly at first.", "answer": "abstractly"},
        {"text": "Artists sometimes think abstractly when planning a new project.", "answer": "abstractly"},
    ],
    "absurd": [
        {"text": "It sounds absurd to blame the weather for everything.", "answer": "absurd"},
        {"text": "Her excuse was so absurd that nobody believed it.", "answer": "absurd"},
        {"text": "The idea seemed absurd at first, but it worked.", "answer": "absurd"},
    ],
    "absurdity": [
        {"text": "The absurdity of the rule became obvious within days.", "answer": "absurdity"},
        {"text": "They laughed at the absurdity of the situation.", "answer": "absurdity"},
        {"text": "The novel highlights the absurdity of modern life.", "answer": "absurdity"},
    ],
    "academy": [
        {"text": "She was accepted into a famous music academy.", "answer": "academy"},
        {"text": "The academy trains young athletes from around the world.", "answer": "academy"},
        {"text": "Graduates of the academy often find work quickly.", "answer": "academy"},
    ],
    "accelerate": [
        {"text": "The company hopes the new plan will accelerate growth.", "answer": "accelerate"},
        {"text": "Technology can accelerate the spread of information.", "answer": "accelerate"},
        {"text": "Press the pedal gently to accelerate the car.", "answer": "accelerate"},
    ],
    "acceptance": [
        {"text": "Her acceptance of the offer surprised everyone.", "answer": "acceptance"},
        {"text": "The campaign promotes acceptance of cultural differences.", "answer": "acceptance"},
        {"text": "We received formal acceptance from the university yesterday.", "answer": "acceptance"},
    ],
    "accessible": [
        {"text": "The website should be accessible to all users.", "answer": "accessible"},
        {"text": "The museum is fully accessible by public transport.", "answer": "accessible"},
        {"text": "Complex ideas become more accessible with clear examples.", "answer": "accessible"},
    ],
    "acclaim": [
        {"text": "The film received international acclaim after its release.", "answer": "acclaim"},
        {"text": "Her first novel won acclaim from critics.", "answer": "acclaim"},
        {"text": "The chef earned acclaim for his creative menu.", "answer": "acclaim"},
    ],
    "accomplishment": [
        {"text": "Finishing the marathon was a major accomplishment for him.", "answer": "accomplishment"},
        {"text": "The award recognized her academic accomplishment.", "answer": "accomplishment"},
        {"text": "Publishing the report was an accomplishment in itself.", "answer": "accomplishment"},
    ],
    "accusation": [
        {"text": "The accusation was serious and required investigation.", "answer": "accusation"},
        {"text": "He denied the accusation immediately.", "answer": "accusation"},
        {"text": "Without evidence, the accusation could not stand.", "answer": "accusation"},
    ],
    "acid": [
        {"text": "The liquid contained a strong acid.", "answer": "acid"},
        {"text": "Acid rain can damage forests over time.", "answer": "acid"},
        {"text": "Always handle acid with care in the lab.", "answer": "acid"},
    ],
    "acknowledgment": [
        {"text": "Her speech included acknowledgment of the whole team.", "answer": "acknowledgment"},
        {"text": "We received written acknowledgment of the complaint.", "answer": "acknowledgment"},
        {"text": "The book opens with an acknowledgment of its sponsors.", "answer": "acknowledgment"},
    ],
    "activist": [
        {"text": "The activist spoke passionately about climate justice.", "answer": "activist"},
        {"text": "A local activist organized the peaceful protest.", "answer": "activist"},
        {"text": "Many students admired the activist for her courage.", "answer": "activist"},
    ],
    "addictive": [
        {"text": "Some mobile games are designed to feel addictive.", "answer": "addictive"},
        {"text": "The series was so addictive that I watched it in one weekend.", "answer": "addictive"},
        {"text": "Experts warn that certain behaviors can become addictive.", "answer": "addictive"},
    ],
    "adhere": [
        {"text": "All staff must adhere to the new safety rules.", "answer": "adhere"},
        {"text": "Good labels should adhere firmly to the surface.", "answer": "adhere"},
        {"text": "The team continues to adhere to its original values.", "answer": "adhere"},
    ],
    "administer": [
        {"text": "A nurse was trained to administer the medicine safely.", "answer": "administer"},
        {"text": "The school will administer the exam next week.", "answer": "administer"},
        {"text": "It takes skill to administer a large project well.", "answer": "administer"},
    ],
    "administrator": [
        {"text": "The hospital administrator approved the new budget.", "answer": "administrator"},
        {"text": "Ask the system administrator for technical help.", "answer": "administrator"},
        {"text": "An experienced administrator can solve many problems quickly.", "answer": "administrator"},
    ],
    "admission": [
        {"text": "Admission to the event is free for children.", "answer": "admission"},
        {"text": "His admission of guilt changed the whole case.", "answer": "admission"},
        {"text": "The university raised its admission requirements this year.", "answer": "admission"},
    ],
    "adolescent": [
        {"text": "The clinic provides support for adolescent mental health.", "answer": "adolescent"},
        {"text": "Every adolescent faces pressure in different ways.", "answer": "adolescent"},
        {"text": "The book explores the life of an adolescent growing up in the city.", "answer": "adolescent"},
    ],
    "adoption": [
        {"text": "The adoption of new technology was surprisingly fast.", "answer": "adoption"},
        {"text": "They celebrated the adoption of the rescue dog.", "answer": "adoption"},
        {"text": "Wider adoption of clean energy could reduce pollution.", "answer": "adoption"},
    ],
    "adorn": [
        {"text": "Bright lights adorn the street during the festival.", "answer": "adorn"},
        {"text": "The walls were adorned with local artwork.", "answer": "adorn"},
        {"text": "Small flowers adorn the entrance every spring.", "answer": "adorn"},
    ],
    "adverse": [
        {"text": "The medicine may cause adverse reactions in rare cases.", "answer": "adverse"},
        {"text": "Heavy rain had an adverse effect on the harvest.", "answer": "adverse"},
        {"text": "They prepared for adverse weather conditions before hiking.", "answer": "adverse"},
    ],
    "adversity": [
        {"text": "She showed courage in the face of adversity.", "answer": "adversity"},
        {"text": "Many families overcame adversity through mutual support.", "answer": "adversity"},
        {"text": "The biography describes how he grew stronger after adversity.", "answer": "adversity"},
    ],
    "advocate": [
        {"text": "Many teachers advocate a more balanced approach to homework.", "answer": "advocate"},
        {"text": "She is a strong advocate for public libraries.", "answer": "advocate"},
        {"text": "Doctors often advocate healthier eating habits.", "answer": "advocate"},
    ],
    "aerial": [
        {"text": "The drone captured an aerial view of the coastline.", "answer": "aerial"},
        {"text": "Aerial photos revealed the full scale of the damage.", "answer": "aerial"},
        {"text": "The report included aerial footage of the flooded villages.", "answer": "aerial"},
    ],
    "aesthetic": [
        {"text": "The designer wanted a clean and modern aesthetic.", "answer": "aesthetic"},
        {"text": "The building has a strong aesthetic appeal.", "answer": "aesthetic"},
        {"text": "Their brand follows a minimalist aesthetic.", "answer": "aesthetic"},
    ],
    "affection": [
        {"text": "The child looked at her grandmother with affection.", "answer": "affection"},
        {"text": "He spoke with deep affection for his hometown.", "answer": "affection"},
        {"text": "Pets often show affection in simple ways.", "answer": "affection"},
    ],
    "affirm": [
        {"text": "The court chose to affirm the earlier decision.", "answer": "affirm"},
        {"text": "She nodded to affirm that everything was correct.", "answer": "affirm"},
        {"text": "The report affirms the need for urgent action.", "answer": "affirm"},
    ],
    "affluent": [
        {"text": "The area is known as an affluent suburb.", "answer": "affluent"},
        {"text": "Affluent families often have more access to resources.", "answer": "affluent"},
        {"text": "The shop mainly serves affluent customers.", "answer": "affluent"},
    ],
    "afresh": [
        {"text": "After the holiday, we started afresh with a clearer plan.", "answer": "afresh"},
        {"text": "The team decided to think afresh about the problem.", "answer": "afresh"},
        {"text": "She moved to another city to begin afresh.", "answer": "afresh"},
    ],
    "afterlife": [
        {"text": "Different cultures have different beliefs about the afterlife.", "answer": "afterlife"},
        {"text": "The museum display explored ancient ideas of the afterlife.", "answer": "afterlife"},
        {"text": "The novel discusses faith and the afterlife.", "answer": "afterlife"},
    ],
    "aftermath": [
        {"text": "In the aftermath of the storm, roads were blocked everywhere.", "answer": "aftermath"},
        {"text": "The country struggled in the aftermath of the crisis.", "answer": "aftermath"},
        {"text": "They met to discuss the aftermath of the accident.", "answer": "aftermath"},
    ],
    "aggregate": [
        {"text": "The report shows the aggregate cost of the project.", "answer": "aggregate"},
        {"text": "Aggregate data can reveal overall trends.", "answer": "aggregate"},
        {"text": "The company’s aggregate sales rose last year.", "answer": "aggregate"},
    ],
    "agony": [
        {"text": "He was in agony after twisting his ankle.", "answer": "agony"},
        {"text": "The poem describes the agony of loss.", "answer": "agony"},
        {"text": "Waiting for the result felt like agony to her.", "answer": "agony"},
    ],
    "agricultural": [
        {"text": "The region depends heavily on agricultural exports.", "answer": "agricultural"},
        {"text": "New agricultural methods can save water.", "answer": "agricultural"},
        {"text": "The fair highlighted local agricultural products.", "answer": "agricultural"},
    ],
    "airborne": [
        {"text": "Some diseases can spread through airborne particles.", "answer": "airborne"},
        {"text": "The rescue team launched an airborne operation at dawn.", "answer": "airborne"},
        {"text": "Airborne dust reduced visibility across the city.", "answer": "airborne"},
    ],
    "albeit": [
        {"text": "The test was difficult, albeit shorter than expected.", "answer": "albeit"},
        {"text": "He accepted the offer, albeit with some hesitation.", "answer": "albeit"},
        {"text": "The town is small, albeit full of character.", "answer": "albeit"},
    ],
    "algae": [
        {"text": "Too much algae can damage a lake’s ecosystem.", "answer": "algae"},
        {"text": "The rocks were covered with green algae.", "answer": "algae"},
        {"text": "Scientists studied how algae respond to heat.", "answer": "algae"},
    ],
    "algorithm": [
        {"text": "The app uses an algorithm to recommend videos.", "answer": "algorithm"},
        {"text": "A flawed algorithm can produce unfair results.", "answer": "algorithm"},
        {"text": "The engineer improved the search algorithm.", "answer": "algorithm"},
    ],
    "algorithmic": [
        {"text": "The platform is facing criticism over algorithmic bias.", "answer": "algorithmic"},
        {"text": "Algorithmic systems often shape what users see online.", "answer": "algorithmic"},
        {"text": "They studied the algorithmic design of the software.", "answer": "algorithmic"},
    ],
    "alien": [
        {"text": "The landscape looked almost alien after the wildfire.", "answer": "alien"},
        {"text": "The creature in the film was clearly alien.", "answer": "alien"},
        {"text": "The customs felt alien to visitors at first.", "answer": "alien"},
    ],
    "align": [
        {"text": "The new policy should align with the school’s values.", "answer": "align"},
        {"text": "Please align the boxes neatly on the shelf.", "answer": "align"},
        {"text": "Their goals did not align with ours.", "answer": "align"},
    ],
    "alligator": [
        {"text": "The zoo recently welcomed a young alligator.", "answer": "alligator"},
        {"text": "An alligator can remain still for a long time.", "answer": "alligator"},
        {"text": "Visitors watched the alligator from a safe distance.", "answer": "alligator"},
    ],
    "altruistic": [
        {"text": "Her decision to volunteer was genuinely altruistic.", "answer": "altruistic"},
        {"text": "Some people believe humans are naturally altruistic.", "answer": "altruistic"},
        {"text": "The article explores whether altruistic behavior can be taught.", "answer": "altruistic"},
    ],
    "alumnus": [
        {"text": "An alumnus of the school returned to give a speech.", "answer": "alumnus"},
        {"text": "The university honored a famous alumnus last week.", "answer": "alumnus"},
        {"text": "As an alumnus, he still supports the college financially.", "answer": "alumnus"},
    ],
    "amateur": [
        {"text": "He may be an amateur, but he plays with great skill.", "answer": "amateur"},
        {"text": "The contest welcomed both amateur and professional artists.", "answer": "amateur"},
        {"text": "An amateur photographer took the winning picture.", "answer": "amateur"},
    ],
    "amateurish": [
        {"text": "The final video looked surprisingly amateurish.", "answer": "amateurish"},
        {"text": "His excuse sounded amateurish and unconvincing.", "answer": "amateurish"},
        {"text": "The website design felt amateurish compared with its rivals.", "answer": "amateurish"},
    ],
    "amazonian": [
        {"text": "The documentary explored amazonian wildlife in detail.", "answer": "amazonian"},
        {"text": "Some amazonian plants are used in medicine.", "answer": "amazonian"},
        {"text": "They studied rainfall in the amazonian region.", "answer": "amazonian"},
    ],
    "ambassador": [
        {"text": "The ambassador met local leaders during the visit.", "answer": "ambassador"},
        {"text": "She was chosen as a youth ambassador for the campaign.", "answer": "ambassador"},
        {"text": "An ambassador must communicate clearly across cultures.", "answer": "ambassador"},
    ],
    "amid": [
        {"text": "The announcement came amid growing public concern.", "answer": "amid"},
        {"text": "They continued working amid the noise outside.", "answer": "amid"},
        {"text": "Amid the confusion, one voice remained calm.", "answer": "amid"},
    ],
    "analogy": [
        {"text": "The teacher used an analogy to explain the concept.", "answer": "analogy"},
        {"text": "Her analogy made the difficult idea easier to grasp.", "answer": "analogy"},
        {"text": "The article draws an analogy between memory and a library.", "answer": "analogy"},
    ],
    "angel": [
        {"text": "The child was dressed as an angel in the play.", "answer": "angel"},
        {"text": "People called her an angel because she helped everyone.", "answer": "angel"},
        {"text": "A small angel statue stood in the garden.", "answer": "angel"},
    ],
    "anonymous": [
        {"text": "The donor chose to remain anonymous.", "answer": "anonymous"},
        {"text": "An anonymous message was left on the website.", "answer": "anonymous"},
        {"text": "The survey allows students to answer anonymously.", "answer": "anonymous"},
    ],
    "antidote": [
        {"text": "Doctors quickly gave the patient an antidote.", "answer": "antidote"},
        {"text": "Laughter can be an antidote to stress.", "answer": "antidote"},
        {"text": "Researchers are working to develop an antidote for the poison.", "answer": "antidote"},
    ],
    "apparatus": [
        {"text": "The laboratory uses specialized apparatus for the experiment.", "answer": "apparatus"},
        {"text": "Firefighters checked the breathing apparatus carefully.", "answer": "apparatus"},
        {"text": "The apparatus was too delicate to move.", "answer": "apparatus"},
    ],
    "applause": [
        {"text": "The singer walked on stage to loud applause.", "answer": "applause"},
        {"text": "Her speech was met with warm applause.", "answer": "applause"},
        {"text": "The audience broke into applause at the end.", "answer": "applause"},
    ],
    "appliance": [
        {"text": "The kitchen appliance stopped working suddenly.", "answer": "appliance"},
        {"text": "Modern appliances can save a lot of time.", "answer": "appliance"},
        {"text": "They bought an energy-efficient appliance for the home.", "answer": "appliance"},
    ],
    "applicable": [
        {"text": "The discount is only applicable to online orders.", "answer": "applicable"},
        {"text": "Not every rule is applicable in every situation.", "answer": "applicable"},
        {"text": "The advice is still applicable today.", "answer": "applicable"},
    ],
    "appoint": [
        {"text": "The board will appoint a new director next month.", "answer": "appoint"},
        {"text": "The president can appoint key officials.", "answer": "appoint"},
        {"text": "They decided to appoint her as team leader.", "answer": "appoint"},
    ],
    "appraisal": [
        {"text": "She had her annual appraisal last Friday.", "answer": "appraisal"},
        {"text": "The manager gave a fair appraisal of his work.", "answer": "appraisal"},
        {"text": "A careful appraisal is needed before making a decision.", "answer": "appraisal"},
    ],
    "appreciation": [
        {"text": "The gift was a small token of appreciation.", "answer": "appreciation"},
        {"text": "Travel often deepens our appreciation of other cultures.", "answer": "appreciation"},
        {"text": "His appreciation of music grew over time.", "answer": "appreciation"},
    ],
    "aptitude": [
        {"text": "She has a natural aptitude for languages.", "answer": "aptitude"},
        {"text": "The test measures verbal aptitude and logic.", "answer": "aptitude"},
        {"text": "His aptitude for design became obvious early on.", "answer": "aptitude"},
    ],
    "aquarium": [
        {"text": "The children spent hours at the aquarium.", "answer": "aquarium"},
        {"text": "A large aquarium stood in the hotel lobby.", "answer": "aquarium"},
        {"text": "The aquarium cares for injured sea animals.", "answer": "aquarium"},
    ],
    "aquatic": [
        {"text": "The wetlands are home to many aquatic species.", "answer": "aquatic"},
        {"text": "She studies aquatic plants in polluted rivers.", "answer": "aquatic"},
        {"text": "The center runs aquatic activities for children.", "answer": "aquatic"},
    ],
    "arc": [
        {"text": "The ball moved in a high arc across the field.", "answer": "arc"},
        {"text": "The story follows a clear emotional arc.", "answer": "arc"},
        {"text": "A bright arc of light crossed the sky.", "answer": "arc"},
    ],
    "arcade": [
        {"text": "We walked through an old shopping arcade downtown.", "answer": "arcade"},
        {"text": "The children wanted to spend all afternoon at the arcade.", "answer": "arcade"},
        {"text": "The historic arcade was restored last year.", "answer": "arcade"},
    ],
    "archaeologist": [
        {"text": "The archaeologist carefully brushed dirt from the bones.", "answer": "archaeologist"},
        {"text": "An archaeologist explained the site to visitors.", "answer": "archaeologist"},
        {"text": "The young student dreams of becoming an archaeologist.", "answer": "archaeologist"},
    ],
    "architectural": [
        {"text": "The city is known for its architectural heritage.", "answer": "architectural"},
        {"text": "The museum has great architectural value.", "answer": "architectural"},
        {"text": "They studied architectural styles from different periods.", "answer": "architectural"},
    ],
    "archive": [
        {"text": "The newspaper archive contains reports from the 1800s.", "answer": "archive"},
        {"text": "The museum decided to archive the photographs digitally.", "answer": "archive"},
        {"text": "Researchers visited the archive to examine old letters.", "answer": "archive"},
    ],
    "arduous": [
        {"text": "Climbing the mountain was an arduous task.", "answer": "arduous"},
        {"text": "The project required months of arduous work.", "answer": "arduous"},
        {"text": "Recovery after the injury was slow and arduous.", "answer": "arduous"},
    ],
    "arena": [
        {"text": "Thousands of fans filled the arena before the concert.", "answer": "arena"},
        {"text": "The issue has moved into the political arena.", "answer": "arena"},
        {"text": "The final match will take place in the main arena.", "answer": "arena"},
    ],
    "armour": [
        {"text": "The knight’s armour was heavy and hard to wear.", "answer": "armour"},
        {"text": "The vehicle is protected by thick armour.", "answer": "armour"},
        {"text": "The museum displays medieval armour from Europe.", "answer": "armour"},
    ],
    "array": [
        {"text": "The store offers a wide array of products.", "answer": "array"},
        {"text": "An array of lights brightened the hall.", "answer": "array"},
        {"text": "The report includes an array of charts and tables.", "answer": "array"},
    ],
    "arthritis": [
        {"text": "Her arthritis makes cold mornings especially difficult.", "answer": "arthritis"},
        {"text": "The doctor suggested exercise to manage arthritis.", "answer": "arthritis"},
        {"text": "Millions of older adults live with arthritis.", "answer": "arthritis"},
    ],
    "aspiration": [
        {"text": "One of her main aspirations is to become a judge.", "answer": "aspiration"},
        {"text": "The program encourages young people to pursue their aspirations.", "answer": "aspiration"},
        {"text": "His aspiration to study abroad never faded.", "answer": "aspiration"},
    ],
    "aspire": [
        {"text": "Many students aspire to work in medicine.", "answer": "aspire"},
        {"text": "She continues to aspire to a leadership role.", "answer": "aspire"},
        {"text": "Young athletes often aspire to compete internationally.", "answer": "aspire"},
    ],
    "assemble": [
        {"text": "Workers began to assemble the new equipment this morning.", "answer": "assemble"},
        {"text": "The crowd started to assemble outside the hall.", "answer": "assemble"},
        {"text": "You can assemble the desk with a few simple tools.", "answer": "assemble"},
    ],
    "assort": [
        {"text": "The factory will assort the items by size and color.", "answer": "assort"},
        {"text": "Staff were asked to assort the donated books.", "answer": "assort"},
        {"text": "The machine can assort packages automatically.", "answer": "assort"},
    ],
    "astonishingly": [
        {"text": "The child learned the piece astonishingly quickly.", "answer": "astonishingly"},
        {"text": "The results were astonishingly accurate.", "answer": "astonishingly"},
        {"text": "Astonishingly, nobody noticed the error at first.", "answer": "astonishingly"},
    ],
    "astronomer": [
        {"text": "The astronomer spent the night observing distant stars.", "answer": "astronomer"},
        {"text": "An astronomer explained the eclipse to the public.", "answer": "astronomer"},
        {"text": "The young boy wants to become an astronomer one day.", "answer": "astronomer"},
    ],
    "atomize": [
        {"text": "The machine can atomize the liquid into a fine mist.", "answer": "atomize"},
        {"text": "Scientists atomize samples before testing them.", "answer": "atomize"},
        {"text": "The spray nozzle is designed to atomize paint evenly.", "answer": "atomize"},
    ],
    "attain": [
        {"text": "She worked hard to attain a high score.", "answer": "attain"},
        {"text": "The country hopes to attain energy independence.", "answer": "attain"},
        {"text": "Few athletes attain that level of success.", "answer": "attain"},
    ],
    "attendance": [
        {"text": "Attendance at the lecture was higher than expected.", "answer": "attendance"},
        {"text": "Regular attendance is important for progress.", "answer": "attendance"},
        {"text": "The school monitors attendance carefully.", "answer": "attendance"},
    ],
    "audition": [
        {"text": "She spent all week preparing for the audition.", "answer": "audition"},
        {"text": "Hundreds of actors came to the audition.", "answer": "audition"},
        {"text": "His audition impressed the judges immediately.", "answer": "audition"},
    ],
    "authentic": [
        {"text": "The restaurant serves authentic regional dishes.", "answer": "authentic"},
        {"text": "Collectors pay more for authentic artwork.", "answer": "authentic"},
        {"text": "Her reaction felt completely authentic.", "answer": "authentic"},
    ],
    "authoritarianism": [
        {"text": "The article warns against the rise of authoritarianism.", "answer": "authoritarianism"},
        {"text": "Many historians study how authoritarianism affects society.", "answer": "authoritarianism"},
        {"text": "Authoritarianism often limits freedom of expression.", "answer": "authoritarianism"},
    ],
    "authorize": [
        {"text": "Only managers can authorize large payments.", "answer": "authorize"},
        {"text": "The committee refused to authorize the proposal.", "answer": "authorize"},
        {"text": "Parents must authorize the trip in writing.", "answer": "authorize"},
    ],
    "autonomy": [
        {"text": "Teenagers often seek more autonomy as they grow older.", "answer": "autonomy"},
        {"text": "The region has greater political autonomy than before.", "answer": "autonomy"},
        {"text": "Teachers should encourage learner autonomy in class.", "answer": "autonomy"},
    ],
    "availability": [
        {"text": "The availability of clean water remains a concern.", "answer": "availability"},
        {"text": "Please check the availability of the meeting room.", "answer": "availability"},
        {"text": "Product availability may change during the holiday season.", "answer": "availability"},
    ],
    "averse": [
        {"text": "He is strongly averse to taking unnecessary risks.", "answer": "averse"},
        {"text": "Some investors are naturally averse to uncertainty.", "answer": "averse"},
        {"text": "She seemed averse to speaking in public.", "answer": "averse"},
    ],
    "avid": [
        {"text": "She is an avid reader of historical fiction.", "answer": "avid"},
        {"text": "He became an avid supporter of the local team.", "answer": "avid"},
        {"text": "An avid traveler often collects stories as well as photos.", "answer": "avid"},
    ],
    "await": [
        {"text": "Thousands of students await the exam results each year.", "answer": "await"},
        {"text": "A difficult decision still awaits the committee.", "answer": "await"},
        {"text": "We waited quietly to see what awaited us inside.", "answer": "await"},
    ],
    "awaken": [
        {"text": "The documentary may awaken public concern about the issue.", "answer": "awaken"},
        {"text": "Sunlight began to awaken the sleeping town.", "answer": "awaken"},
        {"text": "Travel can awaken curiosity in young people.", "answer": "awaken"},
    ],
    "backdrop": [
        {"text": "The mountains provided a dramatic backdrop for the festival.", "answer": "backdrop"},
        {"text": "The policy was announced against a backdrop of uncertainty.", "answer": "backdrop"},
        {"text": "A painted backdrop stood behind the actors on stage.", "answer": "backdrop"},
    ],
    "backhands": [
        {"text": "Her backhands were strong throughout the match.", "answer": "backhands"},
        {"text": "The coach praised his quick backhands.", "answer": "backhands"},
        {"text": "Practicing backhands improved her control.", "answer": "backhands"},
    ],
    "bail": [
        {"text": "The court agreed to release him on bail.", "answer": "bail"},
        {"text": "His family struggled to pay the bail.", "answer": "bail"},
        {"text": "The judge denied bail after the hearing.", "answer": "bail"},
    ],
    "bankruptcy": [
        {"text": "The business filed for bankruptcy after years of losses.", "answer": "bankruptcy"},
        {"text": "Bankruptcy can affect a person’s future opportunities.", "answer": "bankruptcy"},
        {"text": "The firm avoided bankruptcy through a major investment.", "answer": "bankruptcy"},
    ],
}


def write_json(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    bank_path = ROOT / "question_bank_c1.json"
    missing_csv_path = ROOT / "question_bank_c1_missing_sentences.csv"

    bank = json.loads(bank_path.read_text(encoding="utf-8"))

    for entry in bank:
        word = entry.get("word")
        if word in SENTENCES:
            entry["sentences"] = SENTENCES[word]

    write_json(bank_path, bank)

    with missing_csv_path.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow(["word", "cefr", "current_sentence_count"])
        for entry in bank:
            s = entry.get("sentences") or []
            valid = [x for x in s if (x.get("text") or "").strip() and (x.get("answer") or "").strip()]
            if len(valid) < 3:
                writer.writerow([entry["word"], entry["cefr"], len(valid)])


if __name__ == "__main__":
    main()
