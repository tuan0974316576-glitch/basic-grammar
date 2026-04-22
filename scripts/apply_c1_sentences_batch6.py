from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SENTENCES = {
    "harvest": [
        {"text": "Farmers worked late to harvest the rice before the storm.", "answer": "harvest"},
        {"text": "The grape harvest was smaller than expected this year.", "answer": "harvest"},
        {"text": "Autumn is the main harvest season in the valley.", "answer": "harvest"},
    ],
    "hatred": [
        {"text": "The speech was criticized for spreading hatred.", "answer": "hatred"},
        {"text": "Years of conflict had turned fear into hatred.", "answer": "hatred"},
        {"text": "Hatred rarely solves anything lasting.", "answer": "hatred"},
    ],
    "hazard": [
        {"text": "Loose wires can create a serious hazard in the office.", "answer": "hazard"},
        {"text": "The sign warns of a slip hazard after rain.", "answer": "hazard"},
        {"text": "Smoke remains a health hazard for nearby residents.", "answer": "hazard"},
    ],
    "headphone": [
        {"text": "She kept one headphone on so she could still hear the announcement.", "answer": "headphone"},
        {"text": "A broken headphone speaker made the song sound uneven.", "answer": "headphone"},
        {"text": "He found a single headphone under the seat.", "answer": "headphone"},
    ],
    "headset": [
        {"text": "The pilot adjusted his headset before speaking to the tower.", "answer": "headset"},
        {"text": "A wireless headset can make long calls more comfortable.", "answer": "headset"},
        {"text": "The gamer replaced his old headset last week.", "answer": "headset"},
    ],
    "hearty": [
        {"text": "After the hike, we enjoyed a hearty meal together.", "answer": "hearty"},
        {"text": "She gave him a hearty laugh and a warm smile.", "answer": "hearty"},
        {"text": "The cold weather calls for a hearty soup.", "answer": "hearty"},
    ],
    "heave": [
        {"text": "They had to heave the heavy box onto the truck.", "answer": "heave"},
        {"text": "The boat began to heave in the rough sea.", "answer": "heave"},
        {"text": "He gave a tired heave and lifted the gate.", "answer": "heave"},
    ],
    "helplessly": [
        {"text": "We watched helplessly as the paper blew into the river.", "answer": "helplessly"},
        {"text": "She shrugged helplessly when asked for an answer.", "answer": "helplessly"},
        {"text": "The child stared helplessly at the broken toy.", "answer": "helplessly"},
    ],
    "herbal": [
        {"text": "She drank a cup of herbal tea before bed.", "answer": "herbal"},
        {"text": "The shop sells herbal remedies and natural soap.", "answer": "herbal"},
        {"text": "A herbal scent filled the small room.", "answer": "herbal"},
    ],
    "herd": [
        {"text": "A herd of cattle moved across the field at dawn.", "answer": "herd"},
        {"text": "The ranger watched the herd from a safe distance.", "answer": "herd"},
        {"text": "Noise from the road frightened the herd.", "answer": "herd"},
    ],
    "heritage": [
        {"text": "The old temple is part of the city's cultural heritage.", "answer": "heritage"},
        {"text": "Students learned about local heritage in the museum.", "answer": "heritage"},
        {"text": "Protecting natural heritage is a shared responsibility.", "answer": "heritage"},
    ],
    "heroine": [
        {"text": "The heroine of the novel refuses to give up.", "answer": "heroine"},
        {"text": "Children cheered when the heroine saved the village.", "answer": "heroine"},
        {"text": "The film presents a brave but flawed heroine.", "answer": "heroine"},
    ],
    "heyday": [
        {"text": "The theater was built in the heyday of silent film.", "answer": "heyday"},
        {"text": "In its heyday, the factory employed thousands of workers.", "answer": "heyday"},
        {"text": "The singer still talks about the band's heyday.", "answer": "heyday"},
    ],
    "hint": [
        {"text": "She gave me a hint about the final question.", "answer": "hint"},
        {"text": "There was no hint of anger in his reply.", "answer": "hint"},
        {"text": "A hint of lemon improved the flavor.", "answer": "hint"},
    ],
    "honeycomb": [
        {"text": "The beekeeper lifted a sheet of fresh honeycomb from the hive.", "answer": "honeycomb"},
        {"text": "The dessert was shaped like a piece of honeycomb.", "answer": "honeycomb"},
        {"text": "Light passed through the honeycomb pattern on the wall.", "answer": "honeycomb"},
    ],
    "hook": [
        {"text": "Hang your coat on the hook by the door.", "answer": "hook"},
        {"text": "The story begins with a strong hook that grabs attention.", "answer": "hook"},
        {"text": "He caught the fish with a small silver hook.", "answer": "hook"},
    ],
    "hoop": [
        {"text": "The ball bounced off the hoop at the last second.", "answer": "hoop"},
        {"text": "Children rolled a metal hoop along the path.", "answer": "hoop"},
        {"text": "She wore silver hoop earrings to the party.", "answer": "hoop"},
    ],
    "hopeful": [
        {"text": "Despite the delay, the team remained hopeful.", "answer": "hopeful"},
        {"text": "A hopeful smile appeared on her face.", "answer": "hopeful"},
        {"text": "Investors are hopeful that the market will recover.", "answer": "hopeful"},
    ],
    "horizontal": [
        {"text": "Draw a horizontal line across the page.", "answer": "horizontal"},
        {"text": "The shelves were mounted in a perfectly horizontal position.", "answer": "horizontal"},
        {"text": "A strong horizontal beam supported the roof.", "answer": "horizontal"},
    ],
    "hospitalization": [
        {"text": "The infection led to a week of hospitalization.", "answer": "hospitalization"},
        {"text": "Early treatment may reduce the risk of hospitalization.", "answer": "hospitalization"},
        {"text": "Insurance covered most of the hospitalization cost.", "answer": "hospitalization"},
    ],
    "hotshot": [
        {"text": "The young hotshot trader soon made a costly mistake.", "answer": "hotshot"},
        {"text": "Everyone expected the hotshot lawyer to win the case.", "answer": "hotshot"},
        {"text": "He acted like a hotshot but lacked real experience.", "answer": "hotshot"},
    ],
    "hue": [
        {"text": "The sky turned a deep orange hue at sunset.", "answer": "hue"},
        {"text": "A soft blue hue covered the room.", "answer": "hue"},
        {"text": "The artist mixed paint to create a warmer hue.", "answer": "hue"},
    ],
    "humanity": [
        {"text": "The photograph reminds us of our shared humanity.", "answer": "humanity"},
        {"text": "Science should serve the long-term interests of humanity.", "answer": "humanity"},
        {"text": "Even in war, acts of humanity still matter.", "answer": "humanity"},
    ],
    "humanize": [
        {"text": "Personal stories can humanize complex social issues.", "answer": "humanize"},
        {"text": "The documentary helps humanize refugees in the public eye.", "answer": "humanize"},
        {"text": "Good writing can humanize historical figures.", "answer": "humanize"},
    ],
    "humble": [
        {"text": "He remained humble despite his success.", "answer": "humble"},
        {"text": "The meal was simple but humble and warm.", "answer": "humble"},
        {"text": "She came from a humble background.", "answer": "humble"},
    ],
    "hygiene": [
        {"text": "Good hand hygiene helps prevent infection.", "answer": "hygiene"},
        {"text": "The restaurant was closed for poor kitchen hygiene.", "answer": "hygiene"},
        {"text": "Children are taught basic hygiene at school.", "answer": "hygiene"},
    ],
    "idiot": [
        {"text": "Calling someone an idiot does not solve the problem.", "answer": "idiot"},
        {"text": "He felt like an idiot after forgetting the tickets.", "answer": "idiot"},
        {"text": "Only an idiot would ignore that warning sign, she said.", "answer": "idiot"},
    ],
    "idol": [
        {"text": "The singer has become a teenage idol across Asia.", "answer": "idol"},
        {"text": "He once met his childhood idol after a concert.", "answer": "idol"},
        {"text": "Ancient travelers carried a small idol for protection.", "answer": "idol"},
    ],
    "illuminate": [
        {"text": "Street lamps illuminate the path at night.", "answer": "illuminate"},
        {"text": "The article helps illuminate a complex issue.", "answer": "illuminate"},
        {"text": "Soft lights illuminate the stage from below.", "answer": "illuminate"},
    ],
    "illustrative": [
        {"text": "The chart is illustrative rather than exact.", "answer": "illustrative"},
        {"text": "She gave an illustrative example from daily life.", "answer": "illustrative"},
        {"text": "The teacher used illustrative stories to explain the topic.", "answer": "illustrative"},
    ],
    "immense": [
        {"text": "The project demanded immense patience and skill.", "answer": "immense"},
        {"text": "They faced immense pressure before the launch.", "answer": "immense"},
        {"text": "The hall was of immense size and beauty.", "answer": "immense"},
    ],
    "immerse": [
        {"text": "Students can immerse themselves in the language abroad.", "answer": "immerse"},
        {"text": "Do not immerse the device in water.", "answer": "immerse"},
        {"text": "She likes to immerse herself in historical novels.", "answer": "immerse"},
    ],
    "impart": [
        {"text": "Experienced teachers impart more than facts.", "answer": "impart"},
        {"text": "The workshop aims to impart practical skills.", "answer": "impart"},
        {"text": "Good mentors impart confidence as well as knowledge.", "answer": "impart"},
    ],
    "imperfect": [
        {"text": "The first draft is always imperfect.", "answer": "imperfect"},
        {"text": "An imperfect system can still be useful.", "answer": "imperfect"},
        {"text": "She accepted the beauty of an imperfect handmade cup.", "answer": "imperfect"},
    ],
    "implementation": [
        {"text": "The implementation of the new policy begins next month.", "answer": "implementation"},
        {"text": "Poor implementation can ruin a good idea.", "answer": "implementation"},
        {"text": "Teachers discussed the implementation of the new syllabus.", "answer": "implementation"},
    ],
    "imposture": [
        {"text": "The king punished anyone found guilty of imposture.", "answer": "imposture"},
        {"text": "Her polite confidence hid a sense of imposture.", "answer": "imposture"},
        {"text": "The scandal involved fraud, disguise, and imposture.", "answer": "imposture"},
    ],
    "imprint": [
        {"text": "Wet shoes left an imprint on the floor.", "answer": "imprint"},
        {"text": "Travel can imprint lasting memories on a child.", "answer": "imprint"},
        {"text": "The publisher released the book under a new imprint.", "answer": "imprint"},
    ],
    "imprison": [
        {"text": "The law allows courts to imprison serious offenders.", "answer": "imprison"},
        {"text": "They feared the regime would imprison critics without trial.", "answer": "imprison"},
        {"text": "An unjust system can imprison innocent people.", "answer": "imprison"},
    ],
    "improbable": [
        {"text": "At first the victory seemed highly improbable.", "answer": "improbable"},
        {"text": "The story takes an improbable turn near the end.", "answer": "improbable"},
        {"text": "Such perfect timing feels almost improbable.", "answer": "improbable"},
    ],
    "improvisation": [
        {"text": "Jazz often depends on improvisation as much as planning.", "answer": "improvisation"},
        {"text": "The delay forced some improvisation on stage.", "answer": "improvisation"},
        {"text": "Good improvisation requires confidence and practice.", "answer": "improvisation"},
    ],
    "impulse": [
        {"text": "On impulse, she bought a ticket to Rome.", "answer": "impulse"},
        {"text": "A sudden impulse made him call his old friend.", "answer": "impulse"},
        {"text": "The electric impulse traveled through the circuit.", "answer": "impulse"},
    ],
    "inability": [
        {"text": "His inability to listen caused tension in the team.", "answer": "inability"},
        {"text": "The storm revealed the city's inability to cope with flooding.", "answer": "inability"},
        {"text": "Her inability to attend was disappointing but understandable.", "answer": "inability"},
    ],
    "inadequate": [
        {"text": "The shelter was inadequate for the number of people inside.", "answer": "inadequate"},
        {"text": "Their response was judged inadequate by experts.", "answer": "inadequate"},
        {"text": "Funding remains inadequate for many small programs.", "answer": "inadequate"},
    ],
    "inappropriate": [
        {"text": "His joke was completely inappropriate for the occasion.", "answer": "inappropriate"},
        {"text": "The website blocks inappropriate content for children.", "answer": "inappropriate"},
        {"text": "Wearing sandals would be inappropriate in that lab.", "answer": "inappropriate"},
    ],
    "inaugural": [
        {"text": "The president delivered an inaugural speech in the capital.", "answer": "inaugural"},
        {"text": "The team won its inaugural match with ease.", "answer": "inaugural"},
        {"text": "The inaugural event drew guests from many countries.", "answer": "inaugural"},
    ],
    "incapable": [
        {"text": "He is incapable of telling a simple lie.", "answer": "incapable"},
        {"text": "The old machine is incapable of running modern software.", "answer": "incapable"},
        {"text": "Without help, she felt incapable of finishing the task.", "answer": "incapable"},
    ],
    "incidence": [
        {"text": "The incidence of flu usually rises in winter.", "answer": "incidence"},
        {"text": "Researchers measured the incidence of the disease across age groups.", "answer": "incidence"},
        {"text": "A lower incidence of accidents was reported this year.", "answer": "incidence"},
    ],
    "incinerator": [
        {"text": "The city built a modern incinerator for waste disposal.", "answer": "incinerator"},
        {"text": "Residents protested against the new incinerator proposal.", "answer": "incinerator"},
        {"text": "The incinerator was designed to reduce harmful emissions.", "answer": "incinerator"},
    ],
    "incite": [
        {"text": "Leaders should not incite fear for political gain.", "answer": "incite"},
        {"text": "The message was accused of trying to incite violence.", "answer": "incite"},
        {"text": "False claims can incite panic in a crisis.", "answer": "incite"},
    ],
    "inclusion": [
        {"text": "The policy promotes inclusion in every classroom.", "answer": "inclusion"},
        {"text": "Real inclusion means everyone can participate fully.", "answer": "inclusion"},
        {"text": "The exhibition was praised for its inclusion of local artists.", "answer": "inclusion"},
    ],
    "inclusive": [
        {"text": "The school aims to create an inclusive environment.", "answer": "inclusive"},
        {"text": "Good public spaces should be inclusive and safe.", "answer": "inclusive"},
        {"text": "The workshop used inclusive language throughout.", "answer": "inclusive"},
    ],
    "indicator": [
        {"text": "Rising prices are often seen as an indicator of demand.", "answer": "indicator"},
        {"text": "The warning light is an indicator of low fuel.", "answer": "indicator"},
        {"text": "Attendance can be an early indicator of student confidence.", "answer": "indicator"},
    ],
    "indictment": [
        {"text": "The lawyer challenged the indictment in court.", "answer": "indictment"},
        {"text": "The report was seen as an indictment of the entire system.", "answer": "indictment"},
        {"text": "A grand jury approved the indictment yesterday.", "answer": "indictment"},
    ],
    "indigenous": [
        {"text": "The exhibition highlights indigenous traditions of the region.", "answer": "indigenous"},
        {"text": "Many indigenous communities depend on the forest.", "answer": "indigenous"},
        {"text": "Researchers worked closely with indigenous leaders.", "answer": "indigenous"},
    ],
    "indispensables": [
        {"text": "For the trip, a torch and water were among the indispensables.", "answer": "indispensables"},
        {"text": "The list of indispensables grew longer each day.", "answer": "indispensables"},
        {"text": "Good shoes are one of the hiking indispensables.", "answer": "indispensables"},
    ],
    "individualistic": [
        {"text": "The culture is often described as highly individualistic.", "answer": "individualistic"},
        {"text": "His individualistic style does not fit the team well.", "answer": "individualistic"},
        {"text": "Some societies are less individualistic than others.", "answer": "individualistic"},
    ],
    "induce": [
        {"text": "The drug may induce sleep in some patients.", "answer": "induce"},
        {"text": "Stress can induce headaches and poor concentration.", "answer": "induce"},
        {"text": "Nothing could induce her to give up.", "answer": "induce"},
    ],
    "ineffectual": [
        {"text": "Their response was slow and largely ineffectual.", "answer": "ineffectual"},
        {"text": "The old policy proved ineffectual in practice.", "answer": "ineffectual"},
        {"text": "He felt ineffectual in the face of the crisis.", "answer": "ineffectual"},
    ],
    "inefficient": [
        {"text": "The old system is too inefficient to keep using.", "answer": "inefficient"},
        {"text": "Long approval chains make the process inefficient.", "answer": "inefficient"},
        {"text": "An inefficient engine wastes fuel.", "answer": "inefficient"},
    ],
    "inequality": [
        {"text": "The report focuses on rising inequality in housing.", "answer": "inequality"},
        {"text": "Educational inequality can shape a child's future.", "answer": "inequality"},
        {"text": "The speaker warned about widening economic inequality.", "answer": "inequality"},
    ],
    "influential": [
        {"text": "She is one of the most influential writers of her generation.", "answer": "influential"},
        {"text": "The article was published in an influential journal.", "answer": "influential"},
        {"text": "A few influential figures backed the campaign.", "answer": "influential"},
    ],
    "informative": [
        {"text": "The guide gave an informative talk about the ruins.", "answer": "informative"},
        {"text": "Her presentation was short but highly informative.", "answer": "informative"},
        {"text": "The museum website is surprisingly informative.", "answer": "informative"},
    ],
    "ingrain": [
        {"text": "Parents often ingrain good habits at an early age.", "answer": "ingrain"},
        {"text": "Years of training can ingrain discipline deeply.", "answer": "ingrain"},
        {"text": "Fear was ingrain?","answer":"ingrain"},
    ],
    "initiate": [
        {"text": "The board voted to initiate a formal review.", "answer": "initiate"},
        {"text": "Students were encouraged to initiate discussion.", "answer": "initiate"},
        {"text": "The company will initiate the new phase in June.", "answer": "initiate"},
    ],
    "inject": [
        {"text": "Doctors had to inject the medicine slowly.", "answer": "inject"},
        {"text": "The new coach tried to inject energy into the team.", "answer": "inject"},
        {"text": "Fuel is injected directly into the engine.", "answer": "inject"},
    ],
    "injection": [
        {"text": "She was given an injection before the operation.", "answer": "injection"},
        {"text": "The company survived after a cash injection from investors.", "answer": "injection"},
        {"text": "The nurse prepared the injection carefully.", "answer": "injection"},
    ],
    "injustice": [
        {"text": "The film tells a story of injustice and resistance.", "answer": "injustice"},
        {"text": "Many citizens protested against the injustice.", "answer": "injustice"},
        {"text": "Education can help people challenge social injustice.", "answer": "injustice"},
    ],
    "innocuous": [
        {"text": "At first the comment seemed innocuous.", "answer": "innocuous"},
        {"text": "The substance is generally considered innocuous.", "answer": "innocuous"},
        {"text": "What looked like an innocuous joke caused real harm.", "answer": "innocuous"},
    ],
    "inquirer": [
        {"text": "The inquirer asked for more details about the program.", "answer": "inquirer"},
        {"text": "Staff responded politely to every inquirer at the counter.", "answer": "inquirer"},
        {"text": "The inquirer left a phone number for follow-up.", "answer": "inquirer"},
    ],
    "insider": [
        {"text": "An insider shared how the industry really works.", "answer": "insider"},
        {"text": "Only an insider could have known that detail.", "answer": "insider"},
        {"text": "The report quoted an anonymous insider.", "answer": "insider"},
    ],
    "inspect": [
        {"text": "Engineers arrived to inspect the bridge after the quake.", "answer": "inspect"},
        {"text": "Please inspect the package before signing for it.", "answer": "inspect"},
        {"text": "The chef likes to inspect every plate personally.", "answer": "inspect"},
    ],
    "inspection": [
        {"text": "The restaurant passed the health inspection easily.", "answer": "inspection"},
        {"text": "A final inspection is required before opening.", "answer": "inspection"},
        {"text": "The building was closed pending inspection.", "answer": "inspection"},
    ],
    "inspiration": [
        {"text": "Travel often provides inspiration for her paintings.", "answer": "inspiration"},
        {"text": "The speech was a source of inspiration for many students.", "answer": "inspiration"},
        {"text": "Nature remains his main inspiration as a writer.", "answer": "inspiration"},
    ],
    "instruct": [
        {"text": "The guide will instruct visitors on safety rules.", "answer": "instruct"},
        {"text": "Teachers must instruct students clearly during experiments.", "answer": "instruct"},
        {"text": "He was instructed to wait outside the room.", "answer": "instruct"},
    ],
    "instrumental": [
        {"text": "She was instrumental in securing the funding.", "answer": "instrumental"},
        {"text": "Music teachers often use simple instrumental pieces first.", "answer": "instrumental"},
        {"text": "Their support was instrumental to the project's success.", "answer": "instrumental"},
    ],
    "insufficient": [
        {"text": "The evidence was insufficient to prove the claim.", "answer": "insufficient"},
        {"text": "Insufficient sleep can affect memory.", "answer": "insufficient"},
        {"text": "Funds remain insufficient for the final phase.", "answer": "insufficient"},
    ],
    "insult": [
        {"text": "He took the remark as a personal insult.", "answer": "insult"},
        {"text": "It is never helpful to insult your audience.", "answer": "insult"},
        {"text": "Her silence felt like an insult to his effort.", "answer": "insult"},
    ],
    "insure": [
        {"text": "Many people insure their homes against fire.", "answer": "insure"},
        {"text": "The company chose to insure the shipment.", "answer": "insure"},
        {"text": "You should insure valuable equipment before travel.", "answer": "insure"},
    ],
    "intact": [
        {"text": "The old documents were found almost entirely intact.", "answer": "intact"},
        {"text": "Despite the fire, the main structure remained intact.", "answer": "intact"},
        {"text": "He wanted to keep the team intact for another season.", "answer": "intact"},
    ],
    "intake": [
        {"text": "The hospital increased its daily intake of patients.", "answer": "intake"},
        {"text": "Too much sugar intake can affect your health.", "answer": "intake"},
        {"text": "Fresh air enters through the intake vent.", "answer": "intake"},
    ],
    "integral": [
        {"text": "Trust is integral to any successful partnership.", "answer": "integral"},
        {"text": "Water is an integral part of the cooling system.", "answer": "integral"},
        {"text": "She played an integral role in the campaign.", "answer": "integral"},
    ],
    "intellectual": [
        {"text": "The book offers an intellectual challenge for advanced readers.", "answer": "intellectual"},
        {"text": "He grew up in an intellectual household.", "answer": "intellectual"},
        {"text": "The debate centered on intellectual freedom.", "answer": "intellectual"},
    ],
    "intensively": [
        {"text": "The team trained intensively before the final match.", "answer": "intensively"},
        {"text": "Researchers studied the topic intensively for years.", "answer": "intensively"},
        {"text": "The land is farmed intensively throughout the year.", "answer": "intensively"},
    ],
    "intent": [
        {"text": "Her intent was clear from the beginning.", "answer": "intent"},
        {"text": "The court had to determine criminal intent.", "answer": "intent"},
        {"text": "He listened with intent concentration.", "answer": "intent"},
    ],
    "intently": [
        {"text": "The audience listened intently to the witness.", "answer": "intently"},
        {"text": "She watched the screen intently for updates.", "answer": "intently"},
        {"text": "He stared intently at the map.", "answer": "intently"},
    ],
    "interactive": [
        {"text": "The museum opened a new interactive exhibit for children.", "answer": "interactive"},
        {"text": "Online classes need to stay interactive to keep attention.", "answer": "interactive"},
        {"text": "The app uses interactive tasks to teach vocabulary.", "answer": "interactive"},
    ],
    "interfere": [
        {"text": "Please do not interfere with the investigation.", "answer": "interfere"},
        {"text": "Heavy clouds can interfere with satellite signals.", "answer": "interfere"},
        {"text": "Parents should know when not to interfere too much.", "answer": "interfere"},
    ],
    "interim": [
        {"text": "An interim report will be released next week.", "answer": "interim"},
        {"text": "She served as interim director during the transition.", "answer": "interim"},
        {"text": "The committee agreed on an interim solution.", "answer": "interim"},
    ],
    "intermediate": [
        {"text": "This class is suitable for intermediate learners.", "answer": "intermediate"},
        {"text": "The train stopped at one intermediate station.", "answer": "intermediate"},
        {"text": "He has reached an intermediate level of fluency.", "answer": "intermediate"},
    ],
    "interrelate": [
        {"text": "The chapters interrelate more closely than they first appear.", "answer": "interrelate"},
        {"text": "Health and housing problems often interrelate.", "answer": "interrelate"},
        {"text": "The study shows how the two factors interrelate.", "answer": "interrelate"},
    ],
    "intervene": [
        {"text": "Teachers had to intervene before the argument worsened.", "answer": "intervene"},
        {"text": "The court may intervene if basic rights are ignored.", "answer": "intervene"},
        {"text": "Doctors intervened quickly to save the patient.", "answer": "intervene"},
    ],
    "intervention": [
        {"text": "Early intervention can improve learning outcomes.", "answer": "intervention"},
        {"text": "The crisis may require military intervention.", "answer": "intervention"},
        {"text": "A simple intervention helped calm the situation.", "answer": "intervention"},
    ],
    "intimacy": [
        {"text": "The small venue created a sense of intimacy.", "answer": "intimacy"},
        {"text": "Trust is essential for emotional intimacy.", "answer": "intimacy"},
        {"text": "The film explores intimacy in modern relationships.", "answer": "intimacy"},
    ],
    "intrepid": [
        {"text": "The intrepid reporter entered the conflict zone.", "answer": "intrepid"},
        {"text": "An intrepid climber reached the frozen peak.", "answer": "intrepid"},
        {"text": "The novel follows an intrepid explorer across the ocean.", "answer": "intrepid"},
    ],
    "invisible": [
        {"text": "The writing is almost invisible in dim light.", "answer": "invisible"},
        {"text": "Some forms of labor remain socially invisible.", "answer": "invisible"},
        {"text": "The insect becomes nearly invisible against the bark.", "answer": "invisible"},
    ],
    "involvement": [
        {"text": "His involvement in the project was greater than expected.", "answer": "involvement"},
        {"text": "Parents were encouraged to increase their involvement in school life.", "answer": "involvement"},
        {"text": "There is no proof of her direct involvement.", "answer": "involvement"},
    ],
    "invulnerable": [
        {"text": "No leader is politically invulnerable forever.", "answer": "invulnerable"},
        {"text": "The hero seemed invulnerable in the first half of the film.", "answer": "invulnerable"},
        {"text": "Youth can create the false feeling of being invulnerable.", "answer": "invulnerable"},
    ],
    "ironic": [
        {"text": "It was ironic that the safety expert slipped first.", "answer": "ironic"},
        {"text": "Her smile carried an ironic tone.", "answer": "ironic"},
        {"text": "The ending is both sad and ironic.", "answer": "ironic"},
    ],
    "ironically": [
        {"text": "Ironically, the backup system failed before the main one.", "answer": "ironically"},
        {"text": "He mocked the rule and, ironically, later depended on it.", "answer": "ironically"},
        {"text": "Ironically, the shortcut took longer than the usual route.", "answer": "ironically"},
    ],
    "irony": [
        {"text": "The poem is full of quiet irony.", "answer": "irony"},
        {"text": "There is irony in his sudden demand for honesty.", "answer": "irony"},
        {"text": "The teacher explained the difference between humor and irony.", "answer": "irony"},
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
