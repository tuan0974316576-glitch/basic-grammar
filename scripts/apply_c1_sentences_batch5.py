from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SENTENCES = {
    "exclusive": [
        {"text": "The club offers exclusive access to members only.", "answer": "exclusive"},
        {"text": "She signed an exclusive deal with the publisher.", "answer": "exclusive"},
        {"text": "The store sells exclusive products not found elsewhere.", "answer": "exclusive"},
    ],
    "exclusively": [
        {"text": "This room is used exclusively for research.", "answer": "exclusively"},
        {"text": "The service is available exclusively online.", "answer": "exclusively"},
        {"text": "He writes almost exclusively about science and culture.", "answer": "exclusively"},
    ],
    "exhaust": [
        {"text": "Long meetings can exhaust even experienced staff.", "answer": "exhaust"},
        {"text": "The car's exhaust smelled stronger than usual.", "answer": "exhaust"},
        {"text": "Do not exhaust your savings on one purchase.", "answer": "exhaust"},
    ],
    "exit": [
        {"text": "Please use the nearest exit in an emergency.", "answer": "exit"},
        {"text": "The actor made a quiet exit after the show.", "answer": "exit"},
        {"text": "A sign pointed to the rear exit of the building.", "answer": "exit"},
    ],
    "expat": [
        {"text": "The district is popular with young expat workers.", "answer": "expat"},
        {"text": "An expat community has grown around the harbor.", "answer": "expat"},
        {"text": "She wrote a blog about life as an expat in Europe.", "answer": "expat"},
    ],
    "expenditure": [
        {"text": "Government expenditure rose sharply last year.", "answer": "expenditure"},
        {"text": "The project involved high energy expenditure.", "answer": "expenditure"},
        {"text": "Careful planning can reduce unnecessary expenditure.", "answer": "expenditure"},
    ],
    "expire": [
        {"text": "Your passport will expire next spring.", "answer": "expire"},
        {"text": "The offer will expire at midnight.", "answer": "expire"},
        {"text": "Do not eat food after the label says it may expire.", "answer": "expire"},
    ],
    "exploratory": [
        {"text": "The team held an exploratory meeting about the new idea.", "answer": "exploratory"},
        {"text": "Scientists planned an exploratory mission to the cave.", "answer": "exploratory"},
        {"text": "The visit was purely exploratory at this stage.", "answer": "exploratory"},
    ],
    "explosive": [
        {"text": "Police found explosive material inside the van.", "answer": "explosive"},
        {"text": "The issue became politically explosive overnight.", "answer": "explosive"},
        {"text": "The striker is known for his explosive speed.", "answer": "explosive"},
    ],
    "extinction": [
        {"text": "Several species are now close to extinction.", "answer": "extinction"},
        {"text": "Human activity can drive animals toward extinction.", "answer": "extinction"},
        {"text": "The museum exhibit focuses on extinction events in history.", "answer": "extinction"},
    ],
    "extinguisher": [
        {"text": "There is a fire extinguisher beside the main door.", "answer": "extinguisher"},
        {"text": "Staff learned how to use an extinguisher safely.", "answer": "extinguisher"},
        {"text": "He grabbed the extinguisher when smoke appeared.", "answer": "extinguisher"},
    ],
    "extract": [
        {"text": "The article includes an extract from her new book.", "answer": "extract"},
        {"text": "Doctors had to extract a small piece of glass.", "answer": "extract"},
        {"text": "The machine can extract useful data from images.", "answer": "extract"},
    ],
    "exuberant": [
        {"text": "The crowd gave an exuberant welcome to the team.", "answer": "exuberant"},
        {"text": "Her exuberant personality filled the room with energy.", "answer": "exuberant"},
        {"text": "Children were exuberant after hearing the good news.", "answer": "exuberant"},
    ],
    "eyesome": [
        {"text": "The old poem describes the valley as eyesome in spring.", "answer": "eyesome"},
        {"text": "They admired the eyesome view from the hilltop.", "answer": "eyesome"},
        {"text": "The garden looked especially eyesome after the rain.", "answer": "eyesome"},
    ],
    "eyesore": [
        {"text": "The broken sign had become an eyesore in the square.", "answer": "eyesore"},
        {"text": "Many residents consider the empty lot an eyesore.", "answer": "eyesore"},
        {"text": "The tower blocks are seen by some as an eyesore.", "answer": "eyesore"},
    ],
    "fable": [
        {"text": "The teacher read a fable with a clear moral lesson.", "answer": "fable"},
        {"text": "Children enjoy the animals in that ancient fable.", "answer": "fable"},
        {"text": "Each fable in the collection ends with advice.", "answer": "fable"},
    ],
    "facilitate": [
        {"text": "The app helps facilitate communication between teams.", "answer": "facilitate"},
        {"text": "A translator was hired to facilitate the discussion.", "answer": "facilitate"},
        {"text": "Clear signs facilitate movement through the station.", "answer": "facilitate"},
    ],
    "fade": [
        {"text": "The colors may fade if left in direct sunlight.", "answer": "fade"},
        {"text": "Her voice began to fade at the end of the speech.", "answer": "fade"},
        {"text": "Old memories rarely fade completely.", "answer": "fade"},
    ],
    "fascinate": [
        {"text": "Ancient maps continue to fascinate historians.", "answer": "fascinate"},
        {"text": "The stars fascinate children and adults alike.", "answer": "fascinate"},
        {"text": "Complex machines fascinate him more than sports do.", "answer": "fascinate"},
    ],
    "fatal": [
        {"text": "A fatal error caused the system to shut down.", "answer": "fatal"},
        {"text": "The accident proved fatal for one passenger.", "answer": "fatal"},
        {"text": "Ignoring the warning could have fatal consequences.", "answer": "fatal"},
    ],
    "fatally": [
        {"text": "One climber was fatally injured during the storm.", "answer": "fatally"},
        {"text": "The report argues that the plan was fatally flawed.", "answer": "fatally"},
        {"text": "He was not fatally wounded, but the injury was severe.", "answer": "fatally"},
    ],
    "fate": [
        {"text": "Nobody knew the fate of the missing ship.", "answer": "fate"},
        {"text": "She believed fate had brought them together.", "answer": "fate"},
        {"text": "The court will decide the company's fate next week.", "answer": "fate"},
    ],
    "fatigue": [
        {"text": "Driver fatigue is a major cause of accidents.", "answer": "fatigue"},
        {"text": "Weeks of stress left her with severe fatigue.", "answer": "fatigue"},
        {"text": "The team showed signs of fatigue late in the game.", "answer": "fatigue"},
    ],
    "favoritism": [
        {"text": "The manager was accused of showing favoritism.", "answer": "favoritism"},
        {"text": "Favoritism can damage trust in a team.", "answer": "favoritism"},
        {"text": "Students complained about unfair favoritism in the class.", "answer": "favoritism"},
    ],
    "ferocious": [
        {"text": "The storm arrived with ferocious winds.", "answer": "ferocious"},
        {"text": "A ferocious dog guarded the gate.", "answer": "ferocious"},
        {"text": "The teams were locked in ferocious competition.", "answer": "ferocious"},
    ],
    "fertility": [
        {"text": "The river valley is known for its soil fertility.", "answer": "fertility"},
        {"text": "Doctors discussed fertility treatment with the couple.", "answer": "fertility"},
        {"text": "Farmers depend on the fertility of the land.", "answer": "fertility"},
    ],
    "fertilizer": [
        {"text": "Farmers spread fertilizer before the rainy season.", "answer": "fertilizer"},
        {"text": "Too much fertilizer can damage the soil.", "answer": "fertilizer"},
        {"text": "The shop sells both seeds and fertilizer.", "answer": "fertilizer"},
    ],
    "fierce": [
        {"text": "The two candidates were fierce rivals.", "answer": "fierce"},
        {"text": "A fierce wind blew across the beach.", "answer": "fierce"},
        {"text": "Competition in the market has become fierce.", "answer": "fierce"},
    ],
    "fierceness": [
        {"text": "The fierceness of the storm surprised everyone.", "answer": "fierceness"},
        {"text": "Her fierceness in debate made her hard to ignore.", "answer": "fierceness"},
        {"text": "The painting captures the fierceness of the animal.", "answer": "fierceness"},
    ],
    "filthy": [
        {"text": "The floor was filthy after the party.", "answer": "filthy"},
        {"text": "Workers found the room filthy and unsafe.", "answer": "filthy"},
        {"text": "His shoes were filthy from walking through mud.", "answer": "filthy"},
    ],
    "fin": [
        {"text": "A shark fin broke the surface of the water.", "answer": "fin"},
        {"text": "The diver spotted a silver fin near the reef.", "answer": "fin"},
        {"text": "The fish used its tail and fin to steer.", "answer": "fin"},
    ],
    "finalisation": [
        {"text": "The finalisation of the contract took another week.", "answer": "finalisation"},
        {"text": "Budget finalisation is expected by Friday.", "answer": "finalisation"},
        {"text": "They delayed finalisation until all sides agreed.", "answer": "finalisation"},
    ],
    "fine": [
        {"text": "The driver had to pay a fine for illegal parking.", "answer": "fine"},
        {"text": "The weather was fine and clear all morning.", "answer": "fine"},
        {"text": "The artist used a fine brush for the details.", "answer": "fine"},
    ],
    "fingertip": [
        {"text": "Ink had stained his fingertip blue.", "answer": "fingertip"},
        {"text": "She felt the texture with her fingertip.", "answer": "fingertip"},
        {"text": "A paper cut on the fingertip can be painful.", "answer": "fingertip"},
    ],
    "fit": [
        {"text": "The suitcase will not fit under the seat.", "answer": "fit"},
        {"text": "She is fit enough to run ten kilometers.", "answer": "fit"},
        {"text": "This key does not fit the front door.", "answer": "fit"},
    ],
    "flair": [
        {"text": "She writes with flair and confidence.", "answer": "flair"},
        {"text": "The chef decorated each plate with flair.", "answer": "flair"},
        {"text": "He has a flair for solving difficult problems.", "answer": "flair"},
    ],
    "flake": [
        {"text": "A single snow flake landed on her sleeve.", "answer": "flake"},
        {"text": "Paint began to flake from the old wall.", "answer": "flake"},
        {"text": "The pastry broke into delicate flake layers.", "answer": "flake"},
    ],
    "flank": [
        {"text": "Tall trees lined the flank of the mountain.", "answer": "flank"},
        {"text": "Soldiers moved to protect the army's left flank.", "answer": "flank"},
        {"text": "The narrow path followed the hill's flank.", "answer": "flank"},
    ],
    "flashy": [
        {"text": "He arrived in a flashy sports car.", "answer": "flashy"},
        {"text": "The ad used flashy colors to grab attention.", "answer": "flashy"},
        {"text": "Her style is bold without becoming too flashy.", "answer": "flashy"},
    ],
    "flaw": [
        {"text": "The report revealed a serious flaw in the design.", "answer": "flaw"},
        {"text": "Even a small flaw can weaken the whole structure.", "answer": "flaw"},
        {"text": "No system is without flaw.", "answer": "flaw"},
    ],
    "flee": [
        {"text": "Families were forced to flee the burning village.", "answer": "flee"},
        {"text": "The suspect tried to flee before police arrived.", "answer": "flee"},
        {"text": "Wild animals often flee from loud noise.", "answer": "flee"},
    ],
    "fleet": [
        {"text": "The company operates a fleet of electric buses.", "answer": "fleet"},
        {"text": "A fishing fleet returned before the storm.", "answer": "fleet"},
        {"text": "The navy fleet sailed at dawn.", "answer": "fleet"},
    ],
    "flesh": [
        {"text": "The cut went deep into the flesh.", "answer": "flesh"},
        {"text": "The painter gave the portrait warm flesh tones.", "answer": "flesh"},
        {"text": "The fruit had sweet and juicy flesh.", "answer": "flesh"},
    ],
    "flexibility": [
        {"text": "Remote work offers more flexibility for parents.", "answer": "flexibility"},
        {"text": "Good dancers need strength and flexibility.", "answer": "flexibility"},
        {"text": "The plan was praised for its flexibility.", "answer": "flexibility"},
    ],
    "flick": [
        {"text": "He gave the switch a quick flick.", "answer": "flick"},
        {"text": "The cat watched the flick of the curtain.", "answer": "flick"},
        {"text": "She used one finger to flick the coin away.", "answer": "flick"},
    ],
    "flock": [
        {"text": "A flock of birds crossed the sky at sunset.", "answer": "flock"},
        {"text": "Tourists flock to the beach every summer.", "answer": "flock"},
        {"text": "A flock of sheep moved slowly up the hill.", "answer": "flock"},
    ],
    "flourish": [
        {"text": "Small businesses can flourish with enough support.", "answer": "flourish"},
        {"text": "She signed her name with a dramatic flourish.", "answer": "flourish"},
        {"text": "Wildflowers flourish after heavy rain.", "answer": "flourish"},
    ],
    "focussed": [
        {"text": "The team remained fully focussed during the final stage.", "answer": "focussed"},
        {"text": "She gave a calm and focussed reply.", "answer": "focussed"},
        {"text": "A focussed effort can solve the problem faster.", "answer": "focussed"},
    ],
    "foist": [
        {"text": "They tried to foist the blame onto junior staff.", "answer": "foist"},
        {"text": "Do not foist extra duties on people without warning.", "answer": "foist"},
        {"text": "The company could not foist old stock on careful buyers.", "answer": "foist"},
    ],
    "fondly": [
        {"text": "She still thinks fondly of her first teacher.", "answer": "fondly"},
        {"text": "He smiled fondly at the family photo.", "answer": "fondly"},
        {"text": "Residents speak fondly of the old cinema.", "answer": "fondly"},
    ],
    "footage": [
        {"text": "Security footage showed the suspect entering at noon.", "answer": "footage"},
        {"text": "The documentary includes rare footage from the 1960s.", "answer": "footage"},
        {"text": "Drone footage captured the scale of the flood.", "answer": "footage"},
    ],
    "footstep": [
        {"text": "We heard a footstep in the hallway after midnight.", "answer": "footstep"},
        {"text": "A muddy footstep marked the kitchen floor.", "answer": "footstep"},
        {"text": "The guard recognized the familiar footstep at the gate.", "answer": "footstep"},
    ],
    "foreigner": [
        {"text": "As a foreigner, she needed help with the local forms.", "answer": "foreigner"},
        {"text": "The town had once seemed strange to every foreigner who arrived.", "answer": "foreigner"},
        {"text": "A foreigner asked us for directions at the station.", "answer": "foreigner"},
    ],
    "foresee": [
        {"text": "Nobody could foresee the speed of the change.", "answer": "foresee"},
        {"text": "We can foresee difficulties if fuel prices rise again.", "answer": "foresee"},
        {"text": "She did not foresee such a strong response.", "answer": "foresee"},
    ],
    "formulate": [
        {"text": "The committee met to formulate a new policy.", "answer": "formulate"},
        {"text": "It took months to formulate the final proposal.", "answer": "formulate"},
        {"text": "Scientists continue to formulate better vaccines.", "answer": "formulate"},
    ],
    "forth": [
        {"text": "He stepped forth to address the crowd.", "answer": "forth"},
        {"text": "The river burst forth after days of rain.", "answer": "forth"},
        {"text": "New evidence has come forth in the case.", "answer": "forth"},
    ],
    "foster": [
        {"text": "Schools should foster creativity in every child.", "answer": "foster"},
        {"text": "The program aims to foster trust between neighbors.", "answer": "foster"},
        {"text": "Open discussion can foster better teamwork.", "answer": "foster"},
    ],
    "foul": [
        {"text": "A foul smell came from the drain.", "answer": "foul"},
        {"text": "The referee called a foul in the final minute.", "answer": "foul"},
        {"text": "Storm water turned the beach dark and foul.", "answer": "foul"},
    ],
    "fracture": [
        {"text": "The fall caused a small fracture in his wrist.", "answer": "fracture"},
        {"text": "A fracture in the pipe led to a leak.", "answer": "fracture"},
        {"text": "Doctors treated the fracture with a cast.", "answer": "fracture"},
    ],
    "fragile": [
        {"text": "Please handle the fragile vase with care.", "answer": "fragile"},
        {"text": "The peace agreement remains fragile.", "answer": "fragile"},
        {"text": "After the illness, he looked unusually fragile.", "answer": "fragile"},
    ],
    "frankly": [
        {"text": "Frankly, I do not think the plan is ready.", "answer": "frankly"},
        {"text": "She spoke frankly about the mistakes that were made.", "answer": "frankly"},
        {"text": "Frankly, the results were disappointing.", "answer": "frankly"},
    ],
    "functional": [
        {"text": "The kitchen is small but fully functional.", "answer": "functional"},
        {"text": "The phone is old, yet still functional.", "answer": "functional"},
        {"text": "The design values functional simplicity over decoration.", "answer": "functional"},
    ],
    "funeral": [
        {"text": "Hundreds attended the funeral on Saturday morning.", "answer": "funeral"},
        {"text": "The family made quiet arrangements for the funeral.", "answer": "funeral"},
        {"text": "Black clothing is often worn at a funeral.", "answer": "funeral"},
    ],
    "funky": [
        {"text": "The cafe has a funky interior with bright murals.", "answer": "funky"},
        {"text": "He wore a funky jacket to the party.", "answer": "funky"},
        {"text": "The band is known for its funky rhythm.", "answer": "funky"},
    ],
    "fuss": [
        {"text": "She made no fuss when the meeting was delayed.", "answer": "fuss"},
        {"text": "Why are we making such a fuss over one mistake?", "answer": "fuss"},
        {"text": "The chef served the dish without any fuss.", "answer": "fuss"},
    ],
    "futuristic": [
        {"text": "The building has a sleek, futuristic appearance.", "answer": "futuristic"},
        {"text": "The film imagined a futuristic city by the sea.", "answer": "futuristic"},
        {"text": "Her outfit looked almost futuristic under the lights.", "answer": "futuristic"},
    ],
    "gadget": [
        {"text": "He loves buying the latest kitchen gadget.", "answer": "gadget"},
        {"text": "This gadget can measure air quality instantly.", "answer": "gadget"},
        {"text": "The drawer was full of unused gadget parts.", "answer": "gadget"},
    ],
    "gastronomic": [
        {"text": "The city is famous for its gastronomic culture.", "answer": "gastronomic"},
        {"text": "The tour offered a gastronomic journey through the region.", "answer": "gastronomic"},
        {"text": "She studies the gastronomic traditions of coastal villages.", "answer": "gastronomic"},
    ],
    "gaze": [
        {"text": "She lifted her gaze toward the mountain peak.", "answer": "gaze"},
        {"text": "His steady gaze made the audience fall silent.", "answer": "gaze"},
        {"text": "They stood in silence and gaze at the stars.", "answer": "gaze"},
    ],
    "generalize": [
        {"text": "We should not generalize from one unusual case.", "answer": "generalize"},
        {"text": "The report is too limited to generalize its findings.", "answer": "generalize"},
        {"text": "People often generalize unfairly about other cultures.", "answer": "generalize"},
    ],
    "glance": [
        {"text": "She took a quick glance at her watch.", "answer": "glance"},
        {"text": "A single glance told him something was wrong.", "answer": "glance"},
        {"text": "He glanced across the room before speaking.", "answer": "glance"},
    ],
    "glimpse": [
        {"text": "We caught a glimpse of the whale before it vanished.", "answer": "glimpse"},
        {"text": "The book offers a glimpse into life at court.", "answer": "glimpse"},
        {"text": "A brief glimpse of sunlight brightened the afternoon.", "answer": "glimpse"},
    ],
    "globalist": [
        {"text": "The writer was often described as a committed globalist.", "answer": "globalist"},
        {"text": "Critics argued that the policy reflected a globalist vision.", "answer": "globalist"},
        {"text": "He openly identified as a cultural globalist.", "answer": "globalist"},
    ],
    "gloomy": [
        {"text": "The forecast remained gloomy all week.", "answer": "gloomy"},
        {"text": "He felt gloomy after hearing the news.", "answer": "gloomy"},
        {"text": "The old house looked gloomy at sunset.", "answer": "gloomy"},
    ],
    "glorious": [
        {"text": "It was a glorious morning for a walk.", "answer": "glorious"},
        {"text": "The team celebrated a glorious victory.", "answer": "glorious"},
        {"text": "They enjoyed a glorious view from the tower.", "answer": "glorious"},
    ],
    "glory": [
        {"text": "The athlete dreamed of Olympic glory.", "answer": "glory"},
        {"text": "The palace recalls the glory of a former empire.", "answer": "glory"},
        {"text": "Some chase glory while others seek peace.", "answer": "glory"},
    ],
    "grasp": [
        {"text": "It took me a while to grasp the main idea.", "answer": "grasp"},
        {"text": "She kept a firm grasp on the railing.", "answer": "grasp"},
        {"text": "Children often grasp patterns before rules.", "answer": "grasp"},
    ],
    "gratitude": [
        {"text": "She expressed deep gratitude to the volunteers.", "answer": "gratitude"},
        {"text": "A small note of gratitude meant a lot to him.", "answer": "gratitude"},
        {"text": "We owe them our gratitude for their help.", "answer": "gratitude"},
    ],
    "grave": [
        {"text": "The patient remained in grave condition overnight.", "answer": "grave"},
        {"text": "They placed flowers on the grave.", "answer": "grave"},
        {"text": "The report warns of grave consequences if nothing changes.", "answer": "grave"},
    ],
    "grid": [
        {"text": "The city center is laid out on a simple grid.", "answer": "grid"},
        {"text": "A power failure affected the national grid.", "answer": "grid"},
        {"text": "The designer aligned the icons to the grid.", "answer": "grid"},
    ],
    "grimmer": [
        {"text": "The economic outlook looked grimmer by the week.", "answer": "grimmer"},
        {"text": "Their chances grew grimmer after the injury.", "answer": "grimmer"},
        {"text": "The sky became grimmer as the storm approached.", "answer": "grimmer"},
    ],
    "grimness": [
        {"text": "The grimness of the report shocked the public.", "answer": "grimness"},
        {"text": "There was a strange grimness in his voice.", "answer": "grimness"},
        {"text": "The film captures the grimness of life during war.", "answer": "grimness"},
    ],
    "grin": [
        {"text": "A wide grin spread across her face.", "answer": "grin"},
        {"text": "He tried to hide his grin during the speech.", "answer": "grin"},
        {"text": "The child gave a mischievous grin.", "answer": "grin"},
    ],
    "grind": [
        {"text": "They grind coffee beans fresh every morning.", "answer": "grind"},
        {"text": "Years of routine can grind people down.", "answer": "grind"},
        {"text": "The machine began to grind loudly at midnight.", "answer": "grind"},
    ],
    "gross": [
        {"text": "The company reported a rise in gross profit.", "answer": "gross"},
        {"text": "He made a gross error in judgment.", "answer": "gross"},
        {"text": "That smell is absolutely gross.", "answer": "gross"},
    ],
    "grower": [
        {"text": "The local grower supplies fruit to the market.", "answer": "grower"},
        {"text": "Tea growers worry about changing weather patterns.", "answer": "grower"},
        {"text": "A small grower can still compete through quality.", "answer": "grower"},
    ],
    "gruel": [
        {"text": "The prisoner was given a bowl of thin gruel.", "answer": "gruel"},
        {"text": "In the story, the children survive on gruel.", "answer": "gruel"},
        {"text": "The camp kitchen served hot gruel at dawn.", "answer": "gruel"},
    ],
    "grumble": [
        {"text": "Passengers began to grumble about the delay.", "answer": "grumble"},
        {"text": "He tends to grumble when the weather turns cold.", "answer": "grumble"},
        {"text": "The workers grumbled quietly during lunch.", "answer": "grumble"},
    ],
    "guidance": [
        {"text": "Students need guidance when choosing their courses.", "answer": "guidance"},
        {"text": "The document offers practical guidance for teachers.", "answer": "guidance"},
        {"text": "She turned to her mentor for guidance.", "answer": "guidance"},
    ],
    "gulp": [
        {"text": "He took a quick gulp of water before speaking.", "answer": "gulp"},
        {"text": "She could only gulp in surprise at the news.", "answer": "gulp"},
        {"text": "One large gulp was enough to finish the drink.", "answer": "gulp"},
    ],
    "habitable": [
        {"text": "Scientists are searching for habitable planets.", "answer": "habitable"},
        {"text": "The damaged house is no longer habitable.", "answer": "habitable"},
        {"text": "A region needs fresh water to remain habitable.", "answer": "habitable"},
    ],
    "hairy": [
        {"text": "A hairy spider crawled across the wall.", "answer": "hairy"},
        {"text": "The climb became hairy near the top.", "answer": "hairy"},
        {"text": "He had a hairy arm from years of outdoor work.", "answer": "hairy"},
    ],
    "halt": [
        {"text": "Heavy rain forced work on the bridge to halt.", "answer": "halt"},
        {"text": "The train came to a sudden halt.", "answer": "halt"},
        {"text": "Officials ordered a halt to the construction project.", "answer": "halt"},
    ],
    "hamper": [
        {"text": "The lack of staff may hamper the recovery effort.", "answer": "hamper"},
        {"text": "Fog can hamper flights at the airport.", "answer": "hamper"},
        {"text": "A picnic hamper stood beside the bench.", "answer": "hamper"},
    ],
    "handful": [
        {"text": "Only a handful of students knew the answer.", "answer": "handful"},
        {"text": "She grabbed a handful of rice from the bowl.", "answer": "handful"},
        {"text": "The job is simple for most people but a handful for him.", "answer": "handful"},
    ],
    "handiwork": [
        {"text": "The broken lock looked like the handiwork of a thief.", "answer": "handiwork"},
        {"text": "Her embroidery shows careful handiwork.", "answer": "handiwork"},
        {"text": "The detective studied the handiwork left at the scene.", "answer": "handiwork"},
    ],
    "handy": [
        {"text": "Keep a flashlight handy during a storm.", "answer": "handy"},
        {"text": "This small tool is surprisingly handy in the kitchen.", "answer": "handy"},
        {"text": "A map will come in handy on the trip.", "answer": "handy"},
    ],
    "harmonious": [
        {"text": "The choir produced a rich and harmonious sound.", "answer": "harmonious"},
        {"text": "They tried to create a harmonious working environment.", "answer": "harmonious"},
        {"text": "The colors give the room a harmonious feel.", "answer": "harmonious"},
    ],
    "harsh": [
        {"text": "The region faces harsh winters every year.", "answer": "harsh"},
        {"text": "Her comment sounded unnecessarily harsh.", "answer": "harsh"},
        {"text": "The medicine has a harsh taste.", "answer": "harsh"},
    ],
    "harsher": [
        {"text": "The second winter was even harsher than the first.", "answer": "harsher"},
        {"text": "Critics gave the sequel a harsher review.", "answer": "harsher"},
        {"text": "Conditions became harsher as the storm moved north.", "answer": "harsher"},
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
