from __future__ import annotations

import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

SENTENCES = {
    "reverent": [
        {"text": "The crowd fell reverent silent as the ceremony began.", "answer": "reverent"},
        {"text": "She spoke in a reverent tone about her teacher.", "answer": "reverent"},
        {"text": "Visitors stood reverent before the ancient shrine.", "answer": "reverent"},
    ],
    "revert": [
        {"text": "The software will revert to the previous version if the update fails.", "answer": "revert"},
        {"text": "After the trial, the land will revert to public ownership.", "answer": "revert"},
        {"text": "He tends to revert to his old habits under stress.", "answer": "revert"},
    ],
    "revolt": [
        {"text": "Workers threatened to revolt against the new policy.", "answer": "revolt"},
        {"text": "The province was pushed into open revolt.", "answer": "revolt"},
        {"text": "Many readers were revolted by the cruelty in the story.", "answer": "revolt"},
    ],
    "rife": [
        {"text": "Rumors were rife after the sudden resignation.", "answer": "rife"},
        {"text": "Corruption was rife in the region for years.", "answer": "rife"},
        {"text": "Speculation is rife whenever the company stays silent.", "answer": "rife"},
    ],
    "rift": [
        {"text": "The argument created a lasting rift in the family.", "answer": "rift"},
        {"text": "A deep rift opened in the road after the quake.", "answer": "rift"},
        {"text": "Political rifts weakened the coalition.", "answer": "rift"},
    ],
    "rigor": [
        {"text": "The course is known for its intellectual rigor.", "answer": "rigor"},
        {"text": "The review lacked scientific rigor.", "answer": "rigor"},
        {"text": "Researchers applied the same rigor to every test.", "answer": "rigor"},
    ],
    "rite": [
        {"text": "The ceremony marks a rite of passage into adulthood.", "answer": "rite"},
        {"text": "Ancient spring rites were once held on the hilltop.", "answer": "rite"},
        {"text": "Graduation felt like a modern rite of passage.", "answer": "rite"},
    ],
    "roach": [
        {"text": "A roach ran across the kitchen floor at night.", "answer": "roach"},
        {"text": "The landlord was called after someone spotted a roach in the sink.", "answer": "roach"},
        {"text": "Even one roach can make guests panic.", "answer": "roach"},
    ],
    "roost": [
        {"text": "The birds return to roost in the same tree each evening.", "answer": "roost"},
        {"text": "Chickens were already settling on the roost.", "answer": "roost"},
        {"text": "His earlier mistakes came home to roost during the audit.", "answer": "roost"},
    ],
    "rot": [
        {"text": "Too much damp will cause the wood to rot.", "answer": "rot"},
        {"text": "The fruit began to rot in the summer heat.", "answer": "rot"},
        {"text": "Many believe corruption caused the institution to rot from within.", "answer": "rot"},
    ],
    "rote": [
        {"text": "Students learned the poem by rote.", "answer": "rote"},
        {"text": "The teacher wanted understanding, not rote memorization.", "answer": "rote"},
        {"text": "Rote learning alone will not build creativity.", "answer": "rote"},
    ],
    "rummage": [
        {"text": "She began to rummage through the drawer for her passport.", "answer": "rummage"},
        {"text": "The child rummaged in the box for a missing toy.", "answer": "rummage"},
        {"text": "Please do not rummage through my desk without asking.", "answer": "rummage"},
    ],
    "saboteur": [
        {"text": "The guard suspected a saboteur had damaged the machine.", "answer": "saboteur"},
        {"text": "The novel follows a saboteur working behind enemy lines.", "answer": "saboteur"},
        {"text": "They searched the plant for signs of an internal saboteur.", "answer": "saboteur"},
    ],
    "sac": [
        {"text": "The embryo develops inside a fluid-filled sac.", "answer": "sac"},
        {"text": "Doctors removed the infected sac during surgery.", "answer": "sac"},
        {"text": "The tiny seed was protected by a delicate sac.", "answer": "sac"},
    ],
    "sadden": [
        {"text": "It saddens me to see the old cinema abandoned.", "answer": "sadden"},
        {"text": "The news would sadden anyone who cared about the town.", "answer": "sadden"},
        {"text": "She was saddened by the loss of the library.", "answer": "sadden"},
    ],
    "sassy": [
        {"text": "Her sassy reply made the whole class laugh.", "answer": "sassy"},
        {"text": "The magazine described the singer as bold and sassy.", "answer": "sassy"},
        {"text": "He bought a sassy jacket in bright yellow.", "answer": "sassy"},
    ],
    "scarcity": [
        {"text": "Water scarcity remains a major problem in the region.", "answer": "scarcity"},
        {"text": "The scarcity of affordable housing is driving people away.", "answer": "scarcity"},
        {"text": "Scarcity often pushes prices higher.", "answer": "scarcity"},
    ],
    "scramble": [
        {"text": "Passengers had to scramble for the last seats on the train.", "answer": "scramble"},
        {"text": "We scrambled up the rocky slope before sunrise.", "answer": "scramble"},
        {"text": "The company scrambled to answer the allegations.", "answer": "scramble"},
    ],
    "scrap": [
        {"text": "The factory sells scrap metal to nearby workshops.", "answer": "scrap"},
        {"text": "They decided to scrap the entire proposal.", "answer": "scrap"},
        {"text": "A scrap of paper lay on the floor beside the chair.", "answer": "scrap"},
    ],
    "scrapheap": [
        {"text": "The old washing machine ended up on the scrapheap.", "answer": "scrapheap"},
        {"text": "Without fresh ideas, the brand may be headed for the scrapheap.", "answer": "scrapheap"},
        {"text": "Broken bicycles were piled on the scrapheap behind the workshop.", "answer": "scrapheap"},
    ],
    "screengrab": [
        {"text": "A screengrab of the message spread quickly online.", "answer": "screengrab"},
        {"text": "The report included a screengrab from the security footage.", "answer": "screengrab"},
        {"text": "She took a screengrab before the post was deleted.", "answer": "screengrab"},
    ],
    "scribble": [
        {"text": "He scribbled a note on the back of the receipt.", "answer": "scribble"},
        {"text": "The child began to scribble all over the wall.", "answer": "scribble"},
        {"text": "Her quick scribble was barely readable.", "answer": "scribble"},
    ],
    "scroll": [
        {"text": "He kept scrolling through the news late into the night.", "answer": "scroll"},
        {"text": "The museum displayed an ancient scroll from the dynasty.", "answer": "scroll"},
        {"text": "Please scroll down to the bottom of the page.", "answer": "scroll"},
    ],
    "sculpt": [
        {"text": "The artist used clay to sculpt a human figure.", "answer": "sculpt"},
        {"text": "Wind and rain helped sculpt the strange rock shapes.", "answer": "sculpt"},
        {"text": "She hopes to sculpt a series of animal forms this summer.", "answer": "sculpt"},
    ],
    "scurry": [
        {"text": "Mice scurried across the floor when the lights came on.", "answer": "scurry"},
        {"text": "People began to scurry for shelter as the rain started.", "answer": "scurry"},
        {"text": "We watched the crabs scurry under the rocks.", "answer": "scurry"},
    ],
    "seethe": [
        {"text": "He continued to seethe over the unfair decision.", "answer": "seethe"},
        {"text": "The crowd was seething with anger after the match.", "answer": "seethe"},
        {"text": "Hot springs seethed beneath the mountain soil.", "answer": "seethe"},
    ],
    "serendipity": [
        {"text": "Their meeting was a case of pure serendipity.", "answer": "serendipity"},
        {"text": "Many discoveries happen through serendipity rather than planning.", "answer": "serendipity"},
        {"text": "Travel often brings moments of serendipity.", "answer": "serendipity"},
    ],
    "sever": [
        {"text": "The company chose to sever ties with the supplier.", "answer": "sever"},
        {"text": "A fallen branch severed the power line.", "answer": "sever"},
        {"text": "He could not completely sever his connection to the town.", "answer": "sever"},
    ],
    "shack": [
        {"text": "They found shelter in a small wooden shack.", "answer": "shack"},
        {"text": "The old fishing shack stood alone by the shore.", "answer": "shack"},
        {"text": "A rusted stove filled the shack with smoke.", "answer": "shack"},
    ],
    "sham": [
        {"text": "The investigation exposed the charity as a sham.", "answer": "sham"},
        {"text": "Their marriage had become little more than a sham.", "answer": "sham"},
        {"text": "He accused the committee of running a sham consultation.", "answer": "sham"},
    ],
    "sheathe": [
        {"text": "The guard slowly sheathed his sword.", "answer": "sheathe"},
        {"text": "Please sheathe the knife after using it.", "answer": "sheathe"},
        {"text": "The wires were sheathed in rubber for safety.", "answer": "sheathe"},
    ],
    "shield": [
        {"text": "Parents often try to shield children from bad news.", "answer": "shield"},
        {"text": "The warrior raised a shield against the attack.", "answer": "shield"},
        {"text": "Trees help shield the house from strong winds.", "answer": "shield"},
    ],
    "shred": [
        {"text": "Please shred these confidential documents.", "answer": "shred"},
        {"text": "Only a shred of evidence remained.", "answer": "shred"},
        {"text": "The fabric was torn to shreds after the accident.", "answer": "shred"},
    ],
    "shudder": [
        {"text": "She gave a shudder when the cold wind hit her.", "answer": "shudder"},
        {"text": "The old bridge shuddered as the truck crossed it.", "answer": "shudder"},
        {"text": "I still shudder when I remember that night.", "answer": "shudder"},
    ],
    "skeptical": [
        {"text": "Many voters remain skeptical of the new promises.", "answer": "skeptical"},
        {"text": "She sounded skeptical when he explained the plan.", "answer": "skeptical"},
        {"text": "Investors were skeptical about the sudden rise in value.", "answer": "skeptical"},
    ],
    "skillet": [
        {"text": "He heated the oil in a cast-iron skillet.", "answer": "skillet"},
        {"text": "The eggs were cooked in a heavy skillet.", "answer": "skillet"},
        {"text": "She served the potatoes straight from the skillet.", "answer": "skillet"},
    ],
    "slack": [
        {"text": "The rope went slack as the boat reached the dock.", "answer": "slack"},
        {"text": "Managers were told not to cut staff slack on safety rules.", "answer": "slack"},
        {"text": "Sales were slack during the rainy season.", "answer": "slack"},
    ],
    "smoky": [
        {"text": "The kitchen had a smoky smell after dinner.", "answer": "smoky"},
        {"text": "A smoky haze hung over the valley.", "answer": "smoky"},
        {"text": "The sauce had a rich, smoky flavor.", "answer": "smoky"},
    ],
    "smoulder": [
        {"text": "The fire continued to smoulder beneath the ashes.", "answer": "smoulder"},
        {"text": "His anger seemed to smoulder all afternoon.", "answer": "smoulder"},
        {"text": "A small branch was still smouldering near the wall.", "answer": "smoulder"},
    ],
    "snare": [
        {"text": "The hunters set a snare along the forest path.", "answer": "snare"},
        {"text": "He was caught in a snare of legal trouble.", "answer": "snare"},
        {"text": "The drummer tightened the snare before the show.", "answer": "snare"},
    ],
    "sneer": [
        {"text": "He gave a sneer when he heard the idea.", "answer": "sneer"},
        {"text": "Critics sneered at the cheap special effects.", "answer": "sneer"},
        {"text": "Her sneer made the insult even worse.", "answer": "sneer"},
    ],
    "sniff": [
        {"text": "The dog began to sniff around the suitcase.", "answer": "sniff"},
        {"text": "He gave the milk a quick sniff before drinking it.", "answer": "sniff"},
        {"text": "The child started to sniff after hearing the sad news.", "answer": "sniff"},
    ],
    "snippet": [
        {"text": "I only heard a snippet of their conversation.", "answer": "snippet"},
        {"text": "The article included a code snippet for beginners.", "answer": "snippet"},
        {"text": "A short snippet from the song went viral online.", "answer": "snippet"},
    ],
    "soggy": [
        {"text": "The bread turned soggy in the soup.", "answer": "soggy"},
        {"text": "We came home with soggy shoes after the storm.", "answer": "soggy"},
        {"text": "The picnic was ruined by soggy sandwiches.", "answer": "soggy"},
    ],
    "soot": [
        {"text": "Black soot covered the walls after the fire.", "answer": "soot"},
        {"text": "The chimney was thick with soot.", "answer": "soot"},
        {"text": "He wiped soot from his hands after cleaning the stove.", "answer": "soot"},
    ],
    "spar": [
        {"text": "The boxers sparred lightly before the main fight.", "answer": "spar"},
        {"text": "The two ministers continued to spar over taxes.", "answer": "spar"},
        {"text": "She likes to spar with her brother about politics.", "answer": "spar"},
    ],
    "spike": [
        {"text": "There was a sudden spike in electricity demand.", "answer": "spike"},
        {"text": "The fence was topped with metal spikes.", "answer": "spike"},
        {"text": "Rumors spiked after the company canceled the event.", "answer": "spike"},
    ],
    "sprain": [
        {"text": "He suffered a sprain during the final match.", "answer": "sprain"},
        {"text": "Be careful not to sprain your ankle on the trail.", "answer": "sprain"},
        {"text": "The doctor said the wrist pain was only a mild sprain.", "answer": "sprain"},
    ],
    "spur": [
        {"text": "The crisis may spur lawmakers into action.", "answer": "spur"},
        {"text": "A small success can spur people to try harder.", "answer": "spur"},
        {"text": "The rider used a spur to urge the horse onward.", "answer": "spur"},
    ],
    "stag": [
        {"text": "A stag stood at the edge of the forest at dawn.", "answer": "stag"},
        {"text": "He went stag to the company dinner.", "answer": "stag"},
        {"text": "The photographer waited quietly for the stag to appear.", "answer": "stag"},
    ],
    "stampede": [
        {"text": "A sudden noise caused a stampede in the crowd.", "answer": "stampede"},
        {"text": "The herd began to stampede across the plain.", "answer": "stampede"},
        {"text": "Police acted quickly to prevent a stampede at the gate.", "answer": "stampede"},
    ],
    "stardom": [
        {"text": "The young actor rose to stardom almost overnight.", "answer": "stardom"},
        {"text": "She never expected stardom when she began singing in cafes.", "answer": "stardom"},
        {"text": "The pressure of stardom can be hard to handle.", "answer": "stardom"},
    ],
    "starvation": [
        {"text": "Aid groups warned that many families faced starvation.", "answer": "starvation"},
        {"text": "The camp suffered from disease and starvation.", "answer": "starvation"},
        {"text": "Crop failure pushed the region toward starvation.", "answer": "starvation"},
    ],
    "stern": [
        {"text": "The teacher gave the class a stern warning.", "answer": "stern"},
        {"text": "A stern face stared back from the portrait.", "answer": "stern"},
        {"text": "The captain stood near the stern of the boat.", "answer": "stern"},
    ],
    "steroid": [
        {"text": "The athlete tested positive for steroid use.", "answer": "steroid"},
        {"text": "Doctors sometimes prescribe steroid creams for skin problems.", "answer": "steroid"},
        {"text": "The report raised concerns about illegal steroid sales.", "answer": "steroid"},
    ],
    "stitch": [
        {"text": "She needed one stitch after cutting her hand.", "answer": "stitch"},
        {"text": "My grandmother taught me how to stitch a hem.", "answer": "stitch"},
        {"text": "A loose stitch was hanging from the coat.", "answer": "stitch"},
    ],
    "stoicism": [
        {"text": "He faced the illness with remarkable stoicism.", "answer": "stoicism"},
        {"text": "The book praises stoicism under pressure.", "answer": "stoicism"},
        {"text": "Her public stoicism hid deep grief.", "answer": "stoicism"},
    ],
    "straggle": [
        {"text": "A few runners began to straggle behind the main group.", "answer": "straggle"},
        {"text": "Shops straggle along the edge of the highway.", "answer": "straggle"},
        {"text": "The children straggled back to class after lunch.", "answer": "straggle"},
    ],
    "strap": [
        {"text": "He tightened the strap on his backpack.", "answer": "strap"},
        {"text": "Please strap the boxes securely before transport.", "answer": "strap"},
        {"text": "A leather strap held the old case shut.", "answer": "strap"},
    ],
    "stump": [
        {"text": "A tree stump stood in the middle of the field.", "answer": "stump"},
        {"text": "The final question managed to stump the entire panel.", "answer": "stump"},
        {"text": "Children used the stump as a makeshift seat.", "answer": "stump"},
    ],
    "sulfuric": [
        {"text": "Workers wore masks near the sulfuric fumes.", "answer": "sulfuric"},
        {"text": "The battery contains sulfuric acid.", "answer": "sulfuric"},
        {"text": "A sulfuric smell filled the cave.", "answer": "sulfuric"},
    ],
    "superficial": [
        {"text": "Their friendship remained superficial for years.", "answer": "superficial"},
        {"text": "The injury looked serious but was only superficial.", "answer": "superficial"},
        {"text": "A superficial reading of the report misses the key issue.", "answer": "superficial"},
    ],
    "superstition": [
        {"text": "The village still holds to old superstition.", "answer": "superstition"},
        {"text": "He refuses to ignore superstition on important days.", "answer": "superstition"},
        {"text": "The article examines the role of superstition in modern life.", "answer": "superstition"},
    ],
    "supremacy": [
        {"text": "The empire fought hard to maintain naval supremacy.", "answer": "supremacy"},
        {"text": "The company enjoyed years of market supremacy.", "answer": "supremacy"},
        {"text": "The movement was built on false ideas of racial supremacy.", "answer": "supremacy"},
    ],
    "sustainability": [
        {"text": "Sustainability should be part of every city plan.", "answer": "sustainability"},
        {"text": "The brand now focuses on sustainability in packaging.", "answer": "sustainability"},
        {"text": "Researchers questioned the long-term sustainability of the model.", "answer": "sustainability"},
    ],
    "swell": [
        {"text": "The ankle began to swell after the fall.", "answer": "swell"},
        {"text": "The crowd swelled as evening approached.", "answer": "swell"},
        {"text": "A slow ocean swell rolled toward the beach.", "answer": "swell"},
    ],
    "swift": [
        {"text": "Swift action prevented a bigger disaster.", "answer": "swift"},
        {"text": "The bird was too swift for the camera.", "answer": "swift"},
        {"text": "Justice was expected to be swift and fair.", "answer": "swift"},
    ],
    "swirl": [
        {"text": "Snow began to swirl around the streetlights.", "answer": "swirl"},
        {"text": "She swirled the tea gently before drinking it.", "answer": "swirl"},
        {"text": "Rumors continued to swirl around the singer.", "answer": "swirl"},
    ],
    "systematically": [
        {"text": "The files were systematically arranged by date.", "answer": "systematically"},
        {"text": "The group was systematically excluded from the process.", "answer": "systematically"},
        {"text": "Scientists tested each sample systematically.", "answer": "systematically"},
    ],
    "tandem": [
        {"text": "The two agencies worked in tandem during the crisis.", "answer": "tandem"},
        {"text": "They rented a tandem bike for the afternoon.", "answer": "tandem"},
        {"text": "Growth in wages should move in tandem with productivity.", "answer": "tandem"},
    ],
    "tangible": [
        {"text": "The project brought tangible benefits to the community.", "answer": "tangible"},
        {"text": "There was a tangible sense of relief in the room.", "answer": "tangible"},
        {"text": "We need tangible evidence, not just promises.", "answer": "tangible"},
    ],
    "tangle": [
        {"text": "A tangle of wires lay behind the desk.", "answer": "tangle"},
        {"text": "The case became a legal tangle that lasted for years.", "answer": "tangle"},
        {"text": "Her hair was a complete tangle after the storm.", "answer": "tangle"},
    ],
    "tantalize": [
        {"text": "The bakery window tantalized us with the smell of bread.", "answer": "tantalize"},
        {"text": "The trailer was designed to tantalize audiences without giving away the plot.", "answer": "tantalize"},
        {"text": "He was tantalized by the possibility of escape.", "answer": "tantalize"},
    ],
    "tarantula": [
        {"text": "A tarantula crawled slowly across the glass tank.", "answer": "tarantula"},
        {"text": "The zoo's new tarantula exhibit drew large crowds.", "answer": "tarantula"},
        {"text": "She was less afraid of the tarantula than of snakes.", "answer": "tarantula"},
    ],
    "tasteless": [
        {"text": "The soup was warm but tasteless.", "answer": "tasteless"},
        {"text": "His joke was completely tasteless given the situation.", "answer": "tasteless"},
        {"text": "The room was decorated in a flashy but tasteless style.", "answer": "tasteless"},
    ],
    "teary": [
        {"text": "She became teary when she heard the old song.", "answer": "teary"},
        {"text": "The child gave a teary smile after the reunion.", "answer": "teary"},
        {"text": "He sounded teary but tried to stay calm.", "answer": "teary"},
    ],
    "tellingly": [
        {"text": "He smiled tellingly when the name was mentioned.", "answer": "tellingly"},
        {"text": "The silence spoke tellingly of their discomfort.", "answer": "tellingly"},
        {"text": "She glanced tellingly at the clock.", "answer": "tellingly"},
    ],
    "terminology": [
        {"text": "The textbook introduces legal terminology step by step.", "answer": "terminology"},
        {"text": "Students struggled with the medical terminology.", "answer": "terminology"},
        {"text": "Clear terminology helps prevent confusion in science.", "answer": "terminology"},
    ],
    "terraforming": [
        {"text": "The novel imagines the terraforming of Mars.", "answer": "terraforming"},
        {"text": "Scientists debated whether large-scale terraforming is possible.", "answer": "terraforming"},
        {"text": "The game centers on a risky terraforming mission.", "answer": "terraforming"},
    ],
    "thermal": [
        {"text": "The hikers wore thermal clothing in the snow.", "answer": "thermal"},
        {"text": "The camera can detect thermal differences in the wall.", "answer": "thermal"},
        {"text": "Birds use rising thermal currents to glide.", "answer": "thermal"},
    ],
    "thrash": [
        {"text": "The fish began to thrash wildly in the net.", "answer": "thrash"},
        {"text": "Critics thrashed the film in early reviews.", "answer": "thrash"},
        {"text": "Branches thrashed against the windows in the storm.", "answer": "thrash"},
    ],
    "throb": [
        {"text": "His injured leg continued to throb throughout the night.", "answer": "throb"},
        {"text": "Music throbbed from the club across the street.", "answer": "throb"},
        {"text": "A dull pain began to throb behind her eyes.", "answer": "throb"},
    ],
    "thrust": [
        {"text": "The speaker thrust the paper into my hand.", "answer": "thrust"},
        {"text": "The rocket's thrust lifted it off the ground.", "answer": "thrust"},
        {"text": "She was suddenly thrust into the public eye.", "answer": "thrust"},
    ],
}


def main() -> None:
    bank_path = ROOT / "question_bank_c2.json"
    missing_path = ROOT / "question_bank_c2_missing_sentences.csv"

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
