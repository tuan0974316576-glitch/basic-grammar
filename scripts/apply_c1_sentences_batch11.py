from __future__ import annotations

import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

updates = {
    "stale": [
        {"text": "The bread had gone stale by the next morning.", "answer": "stale"},
        {"text": "The office air felt stale after hours with the windows closed.", "answer": "stale"},
        {"text": "She wanted fresh ideas instead of the same stale arguments.", "answer": "stale"},
    ],
    "standardise": [
        {"text": "The company plans to standardise its training materials worldwide.", "answer": "standardise"},
        {"text": "Doctors want to standardise the reporting format for patient records.", "answer": "standardise"},
        {"text": "The committee voted to standardise safety checks across all sites.", "answer": "standardise"},
    ],
    "standardize": [
        {"text": "The software team hopes to standardize file names before the launch.", "answer": "standardize"},
        {"text": "Officials agreed to standardize the exam guidelines for every school.", "answer": "standardize"},
        {"text": "The lab tried to standardize its measurements to reduce mistakes.", "answer": "standardize"},
    ],
    "starkly": [
        {"text": "The two proposals differed starkly in cost and impact.", "answer": "starkly"},
        {"text": "Her quiet tone contrasted starkly with the angry message.", "answer": "starkly"},
        {"text": "The data revealed starkly different outcomes for the two groups.", "answer": "starkly"},
    ],
    "startle": [
        {"text": "A loud crash can startle even the calmest person.", "answer": "startle"},
        {"text": "The sudden shout did not startle her because she expected it.", "answer": "startle"},
        {"text": "Please knock softly so you do not startle the baby.", "answer": "startle"},
    ],
    "static": [
        {"text": "The old radio produced a burst of static before the news began.", "answer": "static"},
        {"text": "Their income stayed static despite rising prices.", "answer": "static"},
        {"text": "A static image on the screen replaced the moving video.", "answer": "static"},
    ],
    "steely": [
        {"text": "She gave him a steely look that ended the argument at once.", "answer": "steely"},
        {"text": "His steely determination impressed the entire team.", "answer": "steely"},
        {"text": "The general spoke in a steely voice before the mission began.", "answer": "steely"},
    ],
    "stereotype": [
        {"text": "The film tried to challenge the stereotype of the careless teenager.", "answer": "stereotype"},
        {"text": "It is unfair to judge people by a stereotype.", "answer": "stereotype"},
        {"text": "The campaign aimed to break the stereotype about women in science.", "answer": "stereotype"},
    ],
    "sterile": [
        {"text": "Doctors must keep the equipment sterile during surgery.", "answer": "sterile"},
        {"text": "The laboratory was kept spotless and sterile.", "answer": "sterile"},
        {"text": "The room felt so clean that it seemed cold and sterile.", "answer": "sterile"},
    ],
    "stew": [
        {"text": "My grandmother makes a rich beef stew every winter.", "answer": "stew"},
        {"text": "The vegetables softened as the stew simmered slowly.", "answer": "stew"},
        {"text": "He left the chicken stew on the stove while answering the phone.", "answer": "stew"},
    ],
    "steward": [
        {"text": "The steward welcomed passengers as they boarded the plane.", "answer": "steward"},
        {"text": "A steward came down the aisle with drinks and snacks.", "answer": "steward"},
        {"text": "The senior steward handled the emergency calmly.", "answer": "steward"},
    ],
    "stewardship": [
        {"text": "The charity praised her careful stewardship of public funds.", "answer": "stewardship"},
        {"text": "Environmental stewardship should be part of every business plan.", "answer": "stewardship"},
        {"text": "Good stewardship of natural resources benefits future generations.", "answer": "stewardship"},
    ],
    "stifle": [
        {"text": "The strict rules began to stifle creativity in the office.", "answer": "stifle"},
        {"text": "She tried to stifle a laugh during the serious meeting.", "answer": "stifle"},
        {"text": "Heavy curtains can stifle air flow in a small room.", "answer": "stifle"},
    ],
    "stimulation": [
        {"text": "Young children need mental stimulation as well as rest.", "answer": "stimulation"},
        {"text": "The economy showed signs of recovery after government stimulation.", "answer": "stimulation"},
        {"text": "Too much screen stimulation before bed can affect sleep.", "answer": "stimulation"},
    ],
    "sting": [
        {"text": "The jellyfish can sting swimmers who get too close.", "answer": "sting"},
        {"text": "His harsh words continued to sting long after the meeting.", "answer": "sting"},
        {"text": "Salt can sting an open cut on your hand.", "answer": "sting"},
    ],
    "stinger": [
        {"text": "The scorpion raised its stinger when it felt threatened.", "answer": "stinger"},
        {"text": "A bee loses its stinger after it attacks.", "answer": "stinger"},
        {"text": "The tail of the insect ended in a sharp stinger.", "answer": "stinger"},
    ],
    "stir": [
        {"text": "Please stir the soup so it does not burn.", "answer": "stir"},
        {"text": "The speech may stir public anger if it is released now.", "answer": "stir"},
        {"text": "The child began to stir in bed just before dawn.", "answer": "stir"},
    ],
    "storage": [
        {"text": "The apartment has limited storage for winter clothes.", "answer": "storage"},
        {"text": "We rented extra storage for the old furniture.", "answer": "storage"},
        {"text": "Cloud storage allows staff to access files from anywhere.", "answer": "storage"},
    ],
    "strain": [
        {"text": "Lifting heavy boxes can strain your back muscles.", "answer": "strain"},
        {"text": "The long hours put a strain on their relationship.", "answer": "strain"},
        {"text": "Doctors monitored the new strain of the virus closely.", "answer": "strain"},
    ],
    "strategic": [
        {"text": "The bridge is in a strategic location near the border.", "answer": "strategic"},
        {"text": "She made a strategic decision to wait before replying.", "answer": "strategic"},
        {"text": "The company needs strategic planning for the next decade.", "answer": "strategic"},
    ],
    "strew": [
        {"text": "Autumn leaves strew the path after every storm.", "answer": "strew"},
        {"text": "Broken glass was strewn across the kitchen floor.", "answer": "strew"},
        {"text": "They used flowers to strew the wedding aisle.", "answer": "strew"},
    ],
    "stringy": [
        {"text": "The meat was overcooked and became stringy.", "answer": "stringy"},
        {"text": "She disliked the stringy texture of the old beans.", "answer": "stringy"},
        {"text": "The cheese turned stringy as it melted in the pan.", "answer": "stringy"},
    ],
    "strip": [
        {"text": "A strip of land separates the lake from the sea.", "answer": "strip"},
        {"text": "He used a strip of tape to hold the box shut.", "answer": "strip"},
        {"text": "Shops lined the busy strip near the station.", "answer": "strip"},
    ],
    "strive": [
        {"text": "We should strive for fairness in every decision.", "answer": "strive"},
        {"text": "Athletes strive to improve with every training session.", "answer": "strive"},
        {"text": "The school continues to strive for higher standards.", "answer": "strive"},
    ],
    "structural": [
        {"text": "The engineers found structural damage in the old bridge.", "answer": "structural"},
        {"text": "The company needs structural reform rather than quick fixes.", "answer": "structural"},
        {"text": "A structural weakness caused the wall to collapse.", "answer": "structural"},
    ],
    "stumble": [
        {"text": "He began to stumble after running for several miles.", "answer": "stumble"},
        {"text": "We may stumble on a solution by chance.", "answer": "stumble"},
        {"text": "She would stumble over difficult words when nervous.", "answer": "stumble"},
    ],
    "stun": [
        {"text": "The unexpected victory seemed to stun the crowd.", "answer": "stun"},
        {"text": "A sudden blow to the head can stun a fighter.", "answer": "stun"},
        {"text": "Her bold reply seemed to stun the interviewer into silence.", "answer": "stun"},
    ],
    "stunt": [
        {"text": "The actor performed a dangerous stunt in the final scene.", "answer": "stunt"},
        {"text": "Poor nutrition can stunt a child's growth.", "answer": "stunt"},
        {"text": "The advertisement was little more than a publicity stunt.", "answer": "stunt"},
    ],
    "submission": [
        {"text": "Late submission of the form may delay your application.", "answer": "submission"},
        {"text": "The editor praised the clarity of her essay submission.", "answer": "submission"},
        {"text": "The law demands submission to the court's decision.", "answer": "submission"},
    ],
    "subscription": [
        {"text": "My magazine subscription will expire next month.", "answer": "subscription"},
        {"text": "The app offers a monthly subscription with no contract.", "answer": "subscription"},
        {"text": "Students get a discount on library database subscription fees.", "answer": "subscription"},
    ],
    "substantial": [
        {"text": "The charity received a substantial donation from a local firm.", "answer": "substantial"},
        {"text": "There has been substantial progress since last year.", "answer": "substantial"},
        {"text": "The report provides substantial evidence for the claim.", "answer": "substantial"},
    ],
    "subtle": [
        {"text": "There was a subtle change in her tone when he entered.", "answer": "subtle"},
        {"text": "The designer used subtle colours rather than bright ones.", "answer": "subtle"},
        {"text": "Children may miss the subtle humour in the film.", "answer": "subtle"},
    ],
    "subtropical": [
        {"text": "Hong Kong has a humid subtropical climate.", "answer": "subtropical"},
        {"text": "The subtropical plants needed warmth all year round.", "answer": "subtropical"},
        {"text": "Typhoons often affect regions with subtropical weather.", "answer": "subtropical"},
    ],
    "successive": [
        {"text": "The team won three successive matches.", "answer": "successive"},
        {"text": "Successive governments have promised the same reform.", "answer": "successive"},
        {"text": "She missed two successive days of training.", "answer": "successive"},
    ],
    "sue": [
        {"text": "The company decided to sue the contractor for damages.", "answer": "sue"},
        {"text": "He threatened to sue the newspaper over the false report.", "answer": "sue"},
        {"text": "Consumers can sue firms that break safety laws.", "answer": "sue"},
    ],
    "suffocate": [
        {"text": "Smoke can suffocate people trapped inside a burning building.", "answer": "suffocate"},
        {"text": "He felt the tiny room would suffocate him.", "answer": "suffocate"},
        {"text": "Do not cover the baby with thick blankets that may suffocate it.", "answer": "suffocate"},
    ],
    "suitability": [
        {"text": "We questioned the suitability of the site for housing.", "answer": "suitability"},
        {"text": "Her experience confirmed her suitability for the post.", "answer": "suitability"},
        {"text": "The doctor assessed the suitability of the treatment for children.", "answer": "suitability"},
    ],
    "summarise": [
        {"text": "Can you summarise the main points of the article?", "answer": "summarise"},
        {"text": "The teacher asked us to summarise the chapter in five lines.", "answer": "summarise"},
        {"text": "He paused to summarise the findings before the discussion ended.", "answer": "summarise"},
    ],
    "superior": [
        {"text": "This model offers superior sound quality.", "answer": "superior"},
        {"text": "She reported the incident to her immediate superior.", "answer": "superior"},
        {"text": "Fresh ingredients are often superior to frozen ones.", "answer": "superior"},
    ],
    "superstitious": [
        {"text": "He is so superstitious that he avoids the number thirteen.", "answer": "superstitious"},
        {"text": "Some players are superstitious before important matches.", "answer": "superstitious"},
        {"text": "My grandmother kept several superstitious beliefs from her childhood.", "answer": "superstitious"},
    ],
    "supervision": [
        {"text": "Children should swim under adult supervision.", "answer": "supervision"},
        {"text": "The project was completed under close supervision.", "answer": "supervision"},
        {"text": "Staff work more carefully when supervision is strong.", "answer": "supervision"},
    ],
    "supplement": [
        {"text": "You may need to supplement your diet with iron.", "answer": "supplement"},
        {"text": "The newspaper published a weekend travel supplement.", "answer": "supplement"},
        {"text": "Farmers used extra feed to supplement the cattle's diet.", "answer": "supplement"},
    ],
    "supportive": [
        {"text": "Her family was supportive throughout her recovery.", "answer": "supportive"},
        {"text": "A supportive teacher can change a student's future.", "answer": "supportive"},
        {"text": "The manager remained supportive during the difficult transition.", "answer": "supportive"},
    ],
    "supposedly": [
        {"text": "The road is supposedly closed, but some cars still passed through.", "answer": "supposedly"},
        {"text": "He was supposedly an expert, yet he could not answer the question.", "answer": "supposedly"},
        {"text": "The castle is supposedly haunted at night.", "answer": "supposedly"},
    ],
    "surge": [
        {"text": "A sudden surge in demand emptied the shelves.", "answer": "surge"},
        {"text": "The crowd surged forward when the doors opened.", "answer": "surge"},
        {"text": "Hospitals prepared for a surge of patients during winter.", "answer": "surge"},
    ],
    "surgical": [
        {"text": "The patient required urgent surgical treatment.", "answer": "surgical"},
        {"text": "Doctors wore surgical masks in the operating room.", "answer": "surgical"},
        {"text": "The injury left a small surgical scar on his knee.", "answer": "surgical"},
    ],
    "surreptitiously": [
        {"text": "He surreptitiously checked his phone under the table.", "answer": "surreptitiously"},
        {"text": "The boy surreptitiously slipped a note to his friend.", "answer": "surreptitiously"},
        {"text": "She surreptitiously recorded the meeting for evidence.", "answer": "surreptitiously"},
    ],
    "susceptible": [
        {"text": "Young children are more susceptible to infection.", "answer": "susceptible"},
        {"text": "The old roof is susceptible to storm damage.", "answer": "susceptible"},
        {"text": "People under stress may be more susceptible to illness.", "answer": "susceptible"},
    ],
    "suspicion": [
        {"text": "Her sudden silence raised suspicion among the staff.", "answer": "suspicion"},
        {"text": "Police acted on suspicion of fraud.", "answer": "suspicion"},
        {"text": "He could not hide his suspicion that something was wrong.", "answer": "suspicion"},
    ],
    "suspicious": [
        {"text": "The guard noticed a suspicious package near the gate.", "answer": "suspicious"},
        {"text": "Her excuse sounded suspicious from the start.", "answer": "suspicious"},
        {"text": "Police stopped the car because of suspicious behaviour.", "answer": "suspicious"},
    ],
    "sustain": [
        {"text": "The runner could not sustain that speed for long.", "answer": "sustain"},
        {"text": "The company hopes to sustain growth over the next decade.", "answer": "sustain"},
        {"text": "The bridge was built to sustain heavy traffic.", "answer": "sustain"},
    ],
    "sustenance": [
        {"text": "For some families, fishing provides daily sustenance.", "answer": "sustenance"},
        {"text": "The hikers carried dried fruit for sustenance.", "answer": "sustenance"},
        {"text": "Art gave him emotional sustenance during hard times.", "answer": "sustenance"},
    ],
    "swap": [
        {"text": "We agreed to swap seats so she could sit by the window.", "answer": "swap"},
        {"text": "The kids like to swap cards during lunch break.", "answer": "swap"},
        {"text": "He offered to swap shifts with a colleague.", "answer": "swap"},
    ],
    "swarm": [
        {"text": "A swarm of bees gathered near the tree.", "answer": "swarm"},
        {"text": "Tourists began to swarm into the square at sunset.", "answer": "swarm"},
        {"text": "The online shop was swarmed by orders after the sale began.", "answer": "swarm"},
    ],
    "symbolize": [
        {"text": "Doves often symbolize peace in works of art.", "answer": "symbolize"},
        {"text": "The monument was built to symbolize national unity.", "answer": "symbolize"},
        {"text": "For her, the ring came to symbolize freedom rather than marriage.", "answer": "symbolize"},
    ],
    "syndication": [
        {"text": "The show earned more money after going into syndication.", "answer": "syndication"},
        {"text": "Syndication allowed the article to appear in newspapers worldwide.", "answer": "syndication"},
        {"text": "The station bought old sitcoms through a syndication deal.", "answer": "syndication"},
    ],
    "synthesize": [
        {"text": "Good researchers synthesize evidence from many sources.", "answer": "synthesize"},
        {"text": "The report tried to synthesize complex ideas for general readers.", "answer": "synthesize"},
        {"text": "Scientists can synthesize the compound in a laboratory.", "answer": "synthesize"},
    ],
    "synthetic": [
        {"text": "The jacket is made of synthetic material.", "answer": "synthetic"},
        {"text": "Some athletes prefer synthetic tracks to natural grass.", "answer": "synthetic"},
        {"text": "The lab created a synthetic version of the chemical.", "answer": "synthetic"},
    ],
    "tally": [
        {"text": "Please tally the votes before announcing the result.", "answer": "tally"},
        {"text": "The final tally showed a narrow victory.", "answer": "tally"},
        {"text": "He kept a running tally of daily expenses.", "answer": "tally"},
    ],
    "teamwork": [
        {"text": "The rescue depended on strong teamwork.", "answer": "teamwork"},
        {"text": "Good teamwork often matters more than individual talent.", "answer": "teamwork"},
        {"text": "The coach praised the players for their teamwork.", "answer": "teamwork"},
    ],
    "teaser": [
        {"text": "The studio released a teaser for the upcoming film.", "answer": "teaser"},
        {"text": "A short teaser appeared online before the full interview aired.", "answer": "teaser"},
        {"text": "The brand posted a teaser image to build excitement.", "answer": "teaser"},
    ],
    "tedious": [
        {"text": "Copying the data by hand was a tedious task.", "answer": "tedious"},
        {"text": "The speech was so tedious that people began to leave.", "answer": "tedious"},
        {"text": "Cleaning every shelf one by one felt tedious.", "answer": "tedious"},
    ],
    "terminal": [
        {"text": "Passengers waited near the departure terminal.", "answer": "terminal"},
        {"text": "Doctors explained that the illness was terminal.", "answer": "terminal"},
        {"text": "The bus terminal was crowded before the holiday.", "answer": "terminal"},
    ],
    "termination": [
        {"text": "The contract allows termination with one month's notice.", "answer": "termination"},
        {"text": "His termination came after repeated warnings.", "answer": "termination"},
        {"text": "The sudden termination of service shocked many users.", "answer": "termination"},
    ],
    "terrain": [
        {"text": "The hikers struggled on the rough terrain.", "answer": "terrain"},
        {"text": "This vehicle is designed for desert terrain.", "answer": "terrain"},
        {"text": "Pilots must study the terrain before landing in remote areas.", "answer": "terrain"},
    ],
    "terrestrial": [
        {"text": "Frogs can live in both aquatic and terrestrial environments.", "answer": "terrestrial"},
        {"text": "Scientists compared marine and terrestrial ecosystems.", "answer": "terrestrial"},
        {"text": "The telescope searched for both terrestrial and distant sources of light.", "answer": "terrestrial"},
    ],
    "terrific": [
        {"text": "She did a terrific job on the presentation.", "answer": "terrific"},
        {"text": "We had a terrific view from the top of the hill.", "answer": "terrific"},
        {"text": "The meal was terrific and worth every dollar.", "answer": "terrific"},
    ],
    "testify": [
        {"text": "She was asked to testify in court next week.", "answer": "testify"},
        {"text": "Experts may testify about the cause of the accident.", "answer": "testify"},
        {"text": "He refused to testify against his former boss.", "answer": "testify"},
    ],
    "textile": [
        {"text": "The city once had a strong textile industry.", "answer": "textile"},
        {"text": "She studied textile design at university.", "answer": "textile"},
        {"text": "The museum displayed rare textile patterns from the region.", "answer": "textile"},
    ],
    "texture": [
        {"text": "The sauce has a smooth texture.", "answer": "texture"},
        {"text": "Artists often experiment with texture in their paintings.", "answer": "texture"},
        {"text": "The fabric felt soft, but its texture was uneven.", "answer": "texture"},
    ],
    "thoughtful": [
        {"text": "It was thoughtful of you to bring her a meal.", "answer": "thoughtful"},
        {"text": "He gave a thoughtful answer instead of reacting quickly.", "answer": "thoughtful"},
        {"text": "The gift was simple but very thoughtful.", "answer": "thoughtful"},
    ],
    "thoughtfully": [
        {"text": "She thoughtfully arranged the chairs for the elderly guests.", "answer": "thoughtfully"},
        {"text": "He listened thoughtfully before giving advice.", "answer": "thoughtfully"},
        {"text": "The teacher thoughtfully adjusted the plan for weaker students.", "answer": "thoughtfully"},
    ],
    "thread": [
        {"text": "She used blue thread to mend the shirt.", "answer": "thread"},
        {"text": "A thin thread of smoke rose from the fire.", "answer": "thread"},
        {"text": "The conversation thread was lost when the call cut off.", "answer": "thread"},
    ],
    "threshold": [
        {"text": "She paused on the threshold before entering the room.", "answer": "threshold"},
        {"text": "The noise level exceeded the legal threshold.", "answer": "threshold"},
        {"text": "The company is on the threshold of a major breakthrough.", "answer": "threshold"},
    ],
    "thrill": [
        {"text": "The crowd felt a thrill as the winner crossed the line.", "answer": "thrill"},
        {"text": "Skydiving offers a thrill that few sports can match.", "answer": "thrill"},
        {"text": "It gave her a thrill to see her name in print.", "answer": "thrill"},
    ],
    "thrive": [
        {"text": "Children thrive when they feel safe and supported.", "answer": "thrive"},
        {"text": "Small businesses can thrive with the right policies.", "answer": "thrive"},
        {"text": "These plants thrive in hot and humid weather.", "answer": "thrive"},
    ],
    "thug": [
        {"text": "The witness said a thug had threatened the shop owner.", "answer": "thug"},
        {"text": "Several thugs were arrested after the fight outside the club.", "answer": "thug"},
        {"text": "The film portrays the thug as both violent and insecure.", "answer": "thug"},
    ],
    "tide": [
        {"text": "The fishing boats returned before the tide changed.", "answer": "tide"},
        {"text": "A rising tide can cover the rocks very quickly.", "answer": "tide"},
        {"text": "Public anger turned the tide against the proposal.", "answer": "tide"},
    ],
    "tighten": [
        {"text": "Please tighten the lid before you pack the bottle.", "answer": "tighten"},
        {"text": "The coach told the team to tighten their defence.", "answer": "tighten"},
        {"text": "The government may tighten rules on online advertising.", "answer": "tighten"},
    ],
    "timber": [
        {"text": "The cabin was built from local timber.", "answer": "timber"},
        {"text": "Workers stacked the cut timber beside the road.", "answer": "timber"},
        {"text": "The region once depended heavily on the timber trade.", "answer": "timber"},
    ],
    "token": [
        {"text": "He offered a token apology but never changed his behaviour.", "answer": "token"},
        {"text": "Passengers needed a token to enter the old subway system.", "answer": "token"},
        {"text": "The award was only a token of our gratitude.", "answer": "token"},
    ],
    "tolerance": [
        {"text": "The school promotes tolerance toward different cultures.", "answer": "tolerance"},
        {"text": "Her body developed a tolerance to the medicine.", "answer": "tolerance"},
        {"text": "Engineers checked whether the machine met the allowed tolerance.", "answer": "tolerance"},
    ],
    "tolerate": [
        {"text": "I cannot tolerate rude behaviour in class.", "answer": "tolerate"},
        {"text": "Some plants can tolerate dry conditions better than others.", "answer": "tolerate"},
        {"text": "The policy should not tolerate discrimination in any form.", "answer": "tolerate"},
    ],
    "torture": [
        {"text": "The report condemned the use of torture on prisoners.", "answer": "torture"},
        {"text": "The long wait felt like torture to the nervous students.", "answer": "torture"},
        {"text": "International law forbids torture under any circumstance.", "answer": "torture"},
    ],
    "toss": [
        {"text": "She tossed the keys onto the table.", "answer": "toss"},
        {"text": "Please toss the salad before serving it.", "answer": "toss"},
        {"text": "The boat was tossed by the rough sea.", "answer": "toss"},
    ],
    "toxic": [
        {"text": "The factory was accused of releasing toxic waste into the river.", "answer": "toxic"},
        {"text": "She left the company because the work culture had become toxic.", "answer": "toxic"},
        {"text": "Some mushrooms are toxic even in small amounts.", "answer": "toxic"},
    ],
    "trace": [
        {"text": "Police found no trace of the missing bag.", "answer": "trace"},
        {"text": "Scientists can trace the disease to a single source.", "answer": "trace"},
        {"text": "There was a faint trace of perfume in the room.", "answer": "trace"},
    ],
    "trail": [
        {"text": "We followed a narrow trail through the forest.", "answer": "trail"},
        {"text": "The dog picked up the trail of the missing hiker.", "answer": "trail"},
        {"text": "The film ends with a trail of unanswered questions.", "answer": "trail"},
    ],
    "trainee": [
        {"text": "Each trainee was given a mentor during the first month.", "answer": "trainee"},
        {"text": "The company hires twenty trainees every summer.", "answer": "trainee"},
        {"text": "As a trainee, she spent weeks learning basic procedures.", "answer": "trainee"},
    ],
    "tranquil": [
        {"text": "We spent the afternoon by a tranquil lake.", "answer": "tranquil"},
        {"text": "The garden remained tranquil despite the city noise outside.", "answer": "tranquil"},
        {"text": "He longed for a tranquil place to recover after the crisis.", "answer": "tranquil"},
    ],
    "transcribe": [
        {"text": "The assistant was asked to transcribe the interview recordings.", "answer": "transcribe"},
        {"text": "It took hours to transcribe the doctor's notes accurately.", "answer": "transcribe"},
        {"text": "Researchers transcribe old letters for the digital archive.", "answer": "transcribe"},
    ],
    "transcript": [
        {"text": "You must submit your academic transcript with the application.", "answer": "transcript"},
        {"text": "The reporter requested a transcript of the speech.", "answer": "transcript"},
        {"text": "The transcript showed exactly what had been said in court.", "answer": "transcript"},
    ],
    "transformation": [
        {"text": "The city has undergone a dramatic transformation in ten years.", "answer": "transformation"},
        {"text": "Her transformation from trainee to manager inspired the team.", "answer": "transformation"},
        {"text": "Digital transformation is changing the banking industry.", "answer": "transformation"},
    ],
    "transit": [
        {"text": "The city is investing heavily in public transit.", "answer": "transit"},
        {"text": "Goods were damaged while in transit.", "answer": "transit"},
        {"text": "Passengers in transit were directed to a separate lounge.", "answer": "transit"},
    ],
    "transmission": [
        {"text": "The transmission of the disease can be reduced by washing hands.", "answer": "transmission"},
        {"text": "The car needed a new transmission after years of use.", "answer": "transmission"},
        {"text": "There was a delay in the live transmission of the match.", "answer": "transmission"},
    ],
    "trauma": [
        {"text": "The accident left him with lasting emotional trauma.", "answer": "trauma"},
        {"text": "Children may need support after experiencing trauma.", "answer": "trauma"},
        {"text": "The hospital opened a new trauma unit for emergencies.", "answer": "trauma"},
    ],
    "trendy": [
        {"text": "The restaurant became popular because of its trendy design.", "answer": "trendy"},
        {"text": "She wore a trendy jacket that everyone noticed.", "answer": "trendy"},
        {"text": "The area is full of trendy cafes and small galleries.", "answer": "trendy"},
    ],
    "tribal": [
        {"text": "The museum displayed tribal art from several regions.", "answer": "tribal"},
        {"text": "The law affected the rights of tribal communities.", "answer": "tribal"},
        {"text": "Researchers documented tribal customs before they disappeared.", "answer": "tribal"},
    ],
    "trigger": [
        {"text": "The announcement could trigger a sharp fall in prices.", "answer": "trigger"},
        {"text": "Certain smells can trigger old memories.", "answer": "trigger"},
        {"text": "Stress may trigger headaches in some people.", "answer": "trigger"},
    ],
    "trim": [
        {"text": "She asked the barber to trim only the ends of her hair.", "answer": "trim"},
        {"text": "The company had to trim costs after sales fell.", "answer": "trim"},
        {"text": "He used scissors to trim the edges neatly.", "answer": "trim"},
    ],
}

def main() -> None:
    bank_path = ROOT / "question_bank_c1.json"
    missing_path = ROOT / "question_bank_c1_missing_sentences.csv"

    with bank_path.open("r", encoding="utf-8") as f:
        bank = json.load(f)

    for entry in bank:
        if entry["word"] in updates:
            entry["sentences"] = updates[entry["word"]]

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
