from __future__ import annotations

import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

SENTENCES = {
    "miraculously": [
        {"text": "The child was miraculously unharmed after the crash.", "answer": "miraculously"},
        {"text": "The missing boat was miraculously found at dawn.", "answer": "miraculously"},
        {"text": "She miraculously finished the race despite the injury.", "answer": "miraculously"},
    ],
    "misfit": [
        {"text": "He always felt like a misfit at school.", "answer": "misfit"},
        {"text": "The film follows a group of lovable misfits.", "answer": "misfit"},
        {"text": "That strange chair looks like a misfit in the modern room.", "answer": "misfit"},
    ],
    "mishap": [
        {"text": "A small mishap delayed the ceremony by ten minutes.", "answer": "mishap"},
        {"text": "The actor laughed off the stage mishap.", "answer": "mishap"},
        {"text": "Travel insurance can help if a mishap occurs abroad.", "answer": "mishap"},
    ],
    "moan": [
        {"text": "He let out a moan of pain when he stood up.", "answer": "moan"},
        {"text": "Please do not moan about the weather all day.", "answer": "moan"},
        {"text": "We heard the old house moan in the wind.", "answer": "moan"},
    ],
    "mojo": [
        {"text": "The team seems to have lost its mojo this season.", "answer": "mojo"},
        {"text": "After the holiday, she got her creative mojo back.", "answer": "mojo"},
        {"text": "The singer still has enough mojo to command the stage.", "answer": "mojo"},
    ],
    "molehill": [
        {"text": "A small molehill appeared in the middle of the lawn.", "answer": "molehill"},
        {"text": "Do not make a mountain out of a molehill.", "answer": "molehill"},
        {"text": "The dog kept sniffing at the fresh molehill.", "answer": "molehill"},
    ],
    "monetise": [
        {"text": "The company wants to monetise its online audience.", "answer": "monetise"},
        {"text": "Artists often struggle to monetise their work fairly.", "answer": "monetise"},
        {"text": "The platform teaches creators how to monetise short videos.", "answer": "monetise"},
    ],
    "moreish": [
        {"text": "The roasted nuts were so moreish that we finished the bowl.", "answer": "moreish"},
        {"text": "That sauce is salty, spicy, and dangerously moreish.", "answer": "moreish"},
        {"text": "She baked a surprisingly moreish lemon cake.", "answer": "moreish"},
    ],
    "mortal": [
        {"text": "Even great kings are only mortal.", "answer": "mortal"},
        {"text": "The doctor confirmed that the wound was not mortal.", "answer": "mortal"},
        {"text": "In mythology, gods often interfere in mortal affairs.", "answer": "mortal"},
    ],
    "motif": [
        {"text": "The designer repeated a floral motif across the fabric.", "answer": "motif"},
        {"text": "Water becomes a central motif in the poem.", "answer": "motif"},
        {"text": "The film uses mirrors as a visual motif.", "answer": "motif"},
    ],
    "nauseate": [
        {"text": "The smell of spoiled milk can nauseate anyone.", "answer": "nauseate"},
        {"text": "Rough seas began to nauseate the passengers.", "answer": "nauseate"},
        {"text": "Some medicines may nauseate patients at first.", "answer": "nauseate"},
    ],
    "nectar": [
        {"text": "Bees collect nectar from the flowers each morning.", "answer": "nectar"},
        {"text": "The juice tasted like nectar after the long hike.", "answer": "nectar"},
        {"text": "Birds were feeding on the nectar of the red blossoms.", "answer": "nectar"},
    ],
    "negligent": [
        {"text": "The report accused the company of being negligent.", "answer": "negligent"},
        {"text": "A negligent driver caused the crash.", "answer": "negligent"},
        {"text": "Doctors must not be negligent in emergency care.", "answer": "negligent"},
    ],
    "nosh": [
        {"text": "We grabbed a quick nosh before the show.", "answer": "nosh"},
        {"text": "They stopped at a cafe for a bit of nosh.", "answer": "nosh"},
        {"text": "There was plenty of nosh at the evening party.", "answer": "nosh"},
    ],
    "nostril": [
        {"text": "Smoke entered his nostril and made him cough.", "answer": "nostril"},
        {"text": "The horse flared its nostril before it ran.", "answer": "nostril"},
        {"text": "A drop of water hung from one nostril after the swim.", "answer": "nostril"},
    ],
    "obliterate": [
        {"text": "The explosion seemed to obliterate the entire wall.", "answer": "obliterate"},
        {"text": "One scandal can obliterate years of trust.", "answer": "obliterate"},
        {"text": "Snow may obliterate the mountain path overnight.", "answer": "obliterate"},
    ],
    "obscure": [
        {"text": "Fog began to obscure the view of the harbor.", "answer": "obscure"},
        {"text": "He wrote a book about an obscure poet.", "answer": "obscure"},
        {"text": "Her meaning was obscured by vague language.", "answer": "obscure"},
    ],
    "observant": [
        {"text": "An observant child noticed the missing key at once.", "answer": "observant"},
        {"text": "Good detectives must be patient and observant.", "answer": "observant"},
        {"text": "She is more observant than people realize.", "answer": "observant"},
    ],
    "offset": [
        {"text": "The savings will offset the extra cost.", "answer": "offset"},
        {"text": "Planting trees may help offset carbon emissions.", "answer": "offset"},
        {"text": "The windows are slightly offset from each other.", "answer": "offset"},
    ],
    "openness": [
        {"text": "Her openness made the conversation easier.", "answer": "openness"},
        {"text": "The company values openness and honesty.", "answer": "openness"},
        {"text": "Greater openness to new ideas can strengthen a team.", "answer": "openness"},
    ],
    "opine": [
        {"text": "Commentators were quick to opine on the result.", "answer": "opine"},
        {"text": "He loves to opine on topics he barely understands.", "answer": "opine"},
        {"text": "Experts opined that the policy would fail.", "answer": "opine"},
    ],
    "orphan": [
        {"text": "The charity supports every orphan in the shelter.", "answer": "orphan"},
        {"text": "A flood of records can orphan children from their roots.", "answer": "orphan"},
        {"text": "The novel follows an orphan through wartime Europe.", "answer": "orphan"},
    ],
    "ossify": [
        {"text": "Without reform, the system may ossify over time.", "answer": "ossify"},
        {"text": "Traditional views can ossify into rigid rules.", "answer": "ossify"},
        {"text": "The group feared its culture would ossify as it grew.", "answer": "ossify"},
    ],
    "outlandish": [
        {"text": "At first, the idea sounded completely outlandish.", "answer": "outlandish"},
        {"text": "He wore an outlandish hat to the wedding.", "answer": "outlandish"},
        {"text": "The tabloids published another outlandish claim.", "answer": "outlandish"},
    ],
    "outright": [
        {"text": "She denied the accusation outright.", "answer": "outright"},
        {"text": "They bought the house outright with cash.", "answer": "outright"},
        {"text": "The proposal was an outright failure.", "answer": "outright"},
    ],
    "overarching": [
        {"text": "Safety remains the overarching concern of the project.", "answer": "overarching"},
        {"text": "The novel has an overarching theme of loss.", "answer": "overarching"},
        {"text": "Their overarching goal is long-term stability.", "answer": "overarching"},
    ],
    "overflow": [
        {"text": "Heavy rain caused the river to overflow its banks.", "answer": "overflow"},
        {"text": "The hall had to open an overflow room for extra guests.", "answer": "overflow"},
        {"text": "Her inbox began to overflow with messages.", "answer": "overflow"},
    ],
    "overlord": [
        {"text": "The film presents the emperor as a cruel overlord.", "answer": "overlord"},
        {"text": "Peasants rose against their feudal overlord.", "answer": "overlord"},
        {"text": "The game features a final battle against a cosmic overlord.", "answer": "overlord"},
    ],
    "pagan": [
        {"text": "The festival has roots in ancient pagan rituals.", "answer": "pagan"},
        {"text": "Early missionaries tried to replace pagan customs.", "answer": "pagan"},
        {"text": "The book explores pagan symbols in European art.", "answer": "pagan"},
    ],
    "palette": [
        {"text": "The artist chose a soft winter palette.", "answer": "palette"},
        {"text": "The makeup line offers a wide color palette.", "answer": "palette"},
        {"text": "His musical palette grew richer over the years.", "answer": "palette"},
    ],
    "pander": [
        {"text": "The ad seems to pander to fear instead of reason.", "answer": "pander"},
        {"text": "Politicians should not pander to prejudice.", "answer": "pander"},
        {"text": "The show panders to easy jokes rather than deeper ideas.", "answer": "pander"},
    ],
    "paparazzi": [
        {"text": "The actor was followed by paparazzi outside the hotel.", "answer": "paparazzi"},
        {"text": "Paparazzi waited near the airport for the singer.", "answer": "paparazzi"},
        {"text": "The celebrity sued the paparazzi for harassment.", "answer": "paparazzi"},
    ],
    "paperback": [
        {"text": "I bought the paperback because it was cheaper.", "answer": "paperback"},
        {"text": "The novel first appeared in hardcover, then in paperback.", "answer": "paperback"},
        {"text": "She slipped the paperback into her bag for the train ride.", "answer": "paperback"},
    ],
    "parasocial": [
        {"text": "Many fans develop a parasocial bond with online creators.", "answer": "parasocial"},
        {"text": "The documentary examines parasocial relationships in the digital age.", "answer": "parasocial"},
        {"text": "Parasocial attachment can feel real despite being one-sided.", "answer": "parasocial"},
    ],
    "particle": [
        {"text": "The microscope detected tiny dust particles in the air.", "answer": "particle"},
        {"text": "Scientists studied how each particle moved through the liquid.", "answer": "particle"},
        {"text": "A single particle can affect the entire experiment.", "answer": "particle"},
    ],
    "pastime": [
        {"text": "Reading became his favorite pastime during winter.", "answer": "pastime"},
        {"text": "Birdwatching is a peaceful pastime for many retirees.", "answer": "pastime"},
        {"text": "Chess was once only a weekend pastime for her.", "answer": "pastime"},
    ],
    "patina": [
        {"text": "The old bell had a green patina from years of weather.", "answer": "patina"},
        {"text": "Age gave the leather a rich patina.", "answer": "patina"},
        {"text": "Collectors admired the bronze patina on the statue.", "answer": "patina"},
    ],
    "peek": [
        {"text": "He took a quick peek through the curtain.", "answer": "peek"},
        {"text": "Do not peek at the answers during the quiz.", "answer": "peek"},
        {"text": "Children tried to peek inside the wrapped gift.", "answer": "peek"},
    ],
    "pendulum": [
        {"text": "The old clock has a brass pendulum.", "answer": "pendulum"},
        {"text": "Public opinion often swings like a pendulum.", "answer": "pendulum"},
        {"text": "He watched the pendulum move back and forth in silence.", "answer": "pendulum"},
    ],
    "perceptive": [
        {"text": "She made a perceptive comment about the team's weakness.", "answer": "perceptive"},
        {"text": "A perceptive reader will notice the hidden clues.", "answer": "perceptive"},
        {"text": "Children can be surprisingly perceptive.", "answer": "perceptive"},
    ],
    "perseverance": [
        {"text": "Her success is the result of talent and perseverance.", "answer": "perseverance"},
        {"text": "The climb demanded great perseverance.", "answer": "perseverance"},
        {"text": "Teachers praised his perseverance after months of effort.", "answer": "perseverance"},
    ],
    "persistence": [
        {"text": "Her persistence finally paid off.", "answer": "persistence"},
        {"text": "The disease shows a worrying persistence in the region.", "answer": "persistence"},
        {"text": "Success often depends on persistence more than luck.", "answer": "persistence"},
    ],
    "personhood": [
        {"text": "The court debated the legal meaning of personhood.", "answer": "personhood"},
        {"text": "Some philosophers link memory closely to personhood.", "answer": "personhood"},
        {"text": "The exhibit explored identity and personhood.", "answer": "personhood"},
    ],
    "persuasion": [
        {"text": "The speech was a masterpiece of persuasion.", "answer": "persuasion"},
        {"text": "She finally agreed after a little gentle persuasion.", "answer": "persuasion"},
        {"text": "The book studies persuasion in political language.", "answer": "persuasion"},
    ],
    "pertinent": [
        {"text": "Please keep your questions pertinent to the topic.", "answer": "pertinent"},
        {"text": "The report includes all the pertinent facts.", "answer": "pertinent"},
        {"text": "His remark was more pertinent than it first seemed.", "answer": "pertinent"},
    ],
    "peruse": [
        {"text": "Take a moment to peruse the menu.", "answer": "peruse"},
        {"text": "She perused the report before the meeting.", "answer": "peruse"},
        {"text": "Customers were invited to peruse the exhibition at their own pace.", "answer": "peruse"},
    ],
    "pervade": [
        {"text": "A sense of tension pervaded the room.", "answer": "pervade"},
        {"text": "The smell of smoke pervaded the building.", "answer": "pervade"},
        {"text": "Hope still pervades the community despite the loss.", "answer": "pervade"},
    ],
    "pharmaceutical": [
        {"text": "The country imports most of its pharmaceutical products.", "answer": "pharmaceutical"},
        {"text": "She works in pharmaceutical research.", "answer": "pharmaceutical"},
        {"text": "The pharmaceutical industry invested heavily in the vaccine.", "answer": "pharmaceutical"},
    ],
    "pigment": [
        {"text": "Artists once made blue pigment from rare minerals.", "answer": "pigment"},
        {"text": "The cream helps restore skin pigment after injury.", "answer": "pigment"},
        {"text": "The wall paint lost much of its pigment in the sun.", "answer": "pigment"},
    ],
    "pinnacle": [
        {"text": "Many regard this novel as the pinnacle of his career.", "answer": "pinnacle"},
        {"text": "The climbers reached the rocky pinnacle at noon.", "answer": "pinnacle"},
        {"text": "Winning the award was the pinnacle of her season.", "answer": "pinnacle"},
    ],
    "pious": [
        {"text": "He was raised in a deeply pious household.", "answer": "pious"},
        {"text": "The article warns against pious but empty promises.", "answer": "pious"},
        {"text": "She gave a pious speech that impressed no one.", "answer": "pious"},
    ],
    "plough": [
        {"text": "Farmers began to plough the fields before dawn.", "answer": "plough"},
        {"text": "The ship tried to plough through the rough sea.", "answer": "plough"},
        {"text": "He ploughed through the report in one evening.", "answer": "plough"},
    ],
    "pluck": [
        {"text": "She had the pluck to challenge the board directly.", "answer": "pluck"},
        {"text": "Please pluck the leaves from the stem.", "answer": "pluck"},
        {"text": "The song was played on a plucked instrument.", "answer": "pluck"},
    ],
    "ply": [
        {"text": "Ferries ply this route every day.", "answer": "ply"},
        {"text": "The vendor continued to ply us with tea and cakes.", "answer": "ply"},
        {"text": "Craftsmen still ply the trade in the old district.", "answer": "ply"},
    ],
    "poise": [
        {"text": "She answered every question with calm poise.", "answer": "poise"},
        {"text": "The dancer showed remarkable poise on stage.", "answer": "poise"},
        {"text": "He seemed poised between laughter and anger.", "answer": "poise"},
    ],
    "ponder": [
        {"text": "He paused to ponder the strange message.", "answer": "ponder"},
        {"text": "We need time to ponder the long-term effects.", "answer": "ponder"},
        {"text": "She sat by the window and pondered her next move.", "answer": "ponder"},
    ],
    "porch": [
        {"text": "We sat on the porch until the rain stopped.", "answer": "porch"},
        {"text": "A lantern hung above the porch.", "answer": "porch"},
        {"text": "The cat was sleeping on the front porch.", "answer": "porch"},
    ],
    "posit": [
        {"text": "The theory posits that memory is shaped by emotion.", "answer": "posit"},
        {"text": "Some scientists posit a link between the two events.", "answer": "posit"},
        {"text": "The article posits a very different account of history.", "answer": "posit"},
    ],
    "poultry": [
        {"text": "The farm raises poultry for local restaurants.", "answer": "poultry"},
        {"text": "Frozen poultry must be handled carefully.", "answer": "poultry"},
        {"text": "The market sells fresh poultry every morning.", "answer": "poultry"},
    ],
    "pragmatic": [
        {"text": "She took a pragmatic approach to the budget problem.", "answer": "pragmatic"},
        {"text": "Their solution was simple, pragmatic, and cheap.", "answer": "pragmatic"},
        {"text": "A pragmatic leader focuses on what works.", "answer": "pragmatic"},
    ],
    "premeditate": [
        {"text": "Police believe the attack was carefully premeditated.", "answer": "premeditate"},
        {"text": "He did not premeditate the remark; it just slipped out.", "answer": "premeditate"},
        {"text": "The law treats premeditated violence more severely.", "answer": "premeditate"},
    ],
    "pretties": [
        {"text": "She filled the shelf with little pretties from antique markets.", "answer": "pretties"},
        {"text": "The boutique sells ribbons, beads, and other pretties.", "answer": "pretties"},
        {"text": "He dismissed the display as useless pretties.", "answer": "pretties"},
    ],
    "procession": [
        {"text": "A solemn procession moved through the old town.", "answer": "procession"},
        {"text": "The wedding procession was led by musicians.", "answer": "procession"},
        {"text": "Crowds lined the street to watch the royal procession.", "answer": "procession"},
    ],
    "procurement": [
        {"text": "The company tightened its procurement rules after the scandal.", "answer": "procurement"},
        {"text": "Procurement of medical supplies became urgent.", "answer": "procurement"},
        {"text": "She works in procurement for an international firm.", "answer": "procurement"},
    ],
    "propel": [
        {"text": "Curiosity helped propel her research forward.", "answer": "propel"},
        {"text": "The engine propels the boat through shallow water.", "answer": "propel"},
        {"text": "A strong wind can propel the fire across the valley.", "answer": "propel"},
    ],
    "propensity": [
        {"text": "He has a propensity for taking unnecessary risks.", "answer": "propensity"},
        {"text": "The study examined children's propensity to copy adults.", "answer": "propensity"},
        {"text": "Her propensity for detail made her a strong editor.", "answer": "propensity"},
    ],
    "protagonist": [
        {"text": "The protagonist changes deeply by the end of the novel.", "answer": "protagonist"},
        {"text": "Viewers quickly sympathize with the young protagonist.", "answer": "protagonist"},
        {"text": "The film has no clear villain, only a conflicted protagonist.", "answer": "protagonist"},
    ],
    "protestation": [
        {"text": "Despite his protestation of innocence, the evidence was strong.", "answer": "protestation"},
        {"text": "She rejected his protestation that it was only a joke.", "answer": "protestation"},
        {"text": "Their loud protestation failed to change the decision.", "answer": "protestation"},
    ],
    "proverbially": [
        {"text": "He is proverbially hard to impress.", "answer": "proverbially"},
        {"text": "The city is proverbially busy even after midnight.", "answer": "proverbially"},
        {"text": "She remained proverbially calm during the crisis.", "answer": "proverbially"},
    ],
    "provocation": [
        {"text": "The attack was seen as a deliberate provocation.", "answer": "provocation"},
        {"text": "He reacted badly to even mild provocation.", "answer": "provocation"},
        {"text": "The protest was sparked by a political provocation.", "answer": "provocation"},
    ],
    "psyche": [
        {"text": "The novel explores the human psyche in great detail.", "answer": "psyche"},
        {"text": "Years of war can damage the national psyche.", "answer": "psyche"},
        {"text": "Artists often draw on dreams and the psyche.", "answer": "psyche"},
    ],
    "psychopath": [
        {"text": "The detective suspected the killer was a psychopath.", "answer": "psychopath"},
        {"text": "The thriller presents a charming but dangerous psychopath.", "answer": "psychopath"},
        {"text": "People often misuse the word psychopath in casual speech.", "answer": "psychopath"},
    ],
    "puncture": [
        {"text": "A nail caused a puncture in the rear tire.", "answer": "puncture"},
        {"text": "Be careful not to puncture the bag with the scissors.", "answer": "puncture"},
        {"text": "Doctors had to puncture the blister to relieve pressure.", "answer": "puncture"},
    ],
    "purge": [
        {"text": "The company began to purge unnecessary files from the server.", "answer": "purge"},
        {"text": "The regime tried to purge its critics from public life.", "answer": "purge"},
        {"text": "She used the retreat to purge old habits.", "answer": "purge"},
    ],
    "pushy": [
        {"text": "The salesman was too pushy for my liking.", "answer": "pushy"},
        {"text": "Parents should support children without becoming pushy.", "answer": "pushy"},
        {"text": "Her pushy tone made the team uncomfortable.", "answer": "pushy"},
    ],
    "quaint": [
        {"text": "They stayed in a quaint cottage by the river.", "answer": "quaint"},
        {"text": "The village looks charming rather than merely quaint.", "answer": "quaint"},
        {"text": "He found the custom quaint but outdated.", "answer": "quaint"},
    ],
    "quilt": [
        {"text": "My grandmother stitched the quilt by hand.", "answer": "quilt"},
        {"text": "The child pulled the quilt up to his chin.", "answer": "quilt"},
        {"text": "A bright patchwork quilt covered the bed.", "answer": "quilt"},
    ],
    "quiver": [
        {"text": "Her voice began to quiver with emotion.", "answer": "quiver"},
        {"text": "The bow rested beside a leather quiver.", "answer": "quiver"},
        {"text": "The leaves quivered in the evening wind.", "answer": "quiver"},
    ],
    "rabid": [
        {"text": "The team has a rabid fan base online.", "answer": "rabid"},
        {"text": "The article drew criticism from rabid supporters of the policy.", "answer": "rabid"},
        {"text": "They feared a rabid dog had entered the village.", "answer": "rabid"},
    ],
    "rag": [
        {"text": "He wiped the table with an old rag.", "answer": "rag"},
        {"text": "The costume was reduced to a rag after the fire.", "answer": "rag"},
        {"text": "She tied a wet rag around the burn.", "answer": "rag"},
    ],
    "rake in": [
        {"text": "The film managed to rake in millions on its first weekend.", "answer": "rake in"},
        {"text": "Tourist shops rake in huge profits during summer.", "answer": "rake in"},
        {"text": "The company raked in far more money than expected.", "answer": "rake in"},
    ],
    "ramp up": [
        {"text": "Factories plan to ramp up production before the holiday season.", "answer": "ramp up"},
        {"text": "The campaign began to ramp up its online presence.", "answer": "ramp up"},
        {"text": "Hospitals had to ramp up emergency staffing during the outbreak.", "answer": "ramp up"},
    ],
    "raucous": [
        {"text": "A raucous cheer rose from the crowd.", "answer": "raucous"},
        {"text": "The bar was loud and raucous after the match.", "answer": "raucous"},
        {"text": "Seagulls made a raucous noise above the harbor.", "answer": "raucous"},
    ],
    "reap": [
        {"text": "Farmers worked through the night to reap the wheat.", "answer": "reap"},
        {"text": "She hopes to reap the rewards of years of study.", "answer": "reap"},
        {"text": "The firm may reap huge benefits from the merger.", "answer": "reap"},
    ],
    "receptive": [
        {"text": "The audience seemed receptive to the new idea.", "answer": "receptive"},
        {"text": "Young minds are often highly receptive to language.", "answer": "receptive"},
        {"text": "She was not receptive to criticism that day.", "answer": "receptive"},
    ],
    "redundant": [
        {"text": "The sentence became redundant after the edit.", "answer": "redundant"},
        {"text": "Several workers were made redundant during the downturn.", "answer": "redundant"},
        {"text": "The second battery serves as a redundant backup.", "answer": "redundant"},
    ],
    "refine": [
        {"text": "The team continues to refine the app before launch.", "answer": "refine"},
        {"text": "Years of training helped refine his technique.", "answer": "refine"},
        {"text": "Oil must be refined before it can be used widely.", "answer": "refine"},
    ],
    "relentless": [
        {"text": "The team faced relentless pressure in the final minutes.", "answer": "relentless"},
        {"text": "The rain was relentless all afternoon.", "answer": "relentless"},
        {"text": "Her relentless work ethic inspired the staff.", "answer": "relentless"},
    ],
    "relentlessly": [
        {"text": "The reporters pursued the story relentlessly.", "answer": "relentlessly"},
        {"text": "She trained relentlessly for the championship.", "answer": "relentlessly"},
        {"text": "The sea battered the rocks relentlessly through the night.", "answer": "relentlessly"},
    ],
    "reliance": [
        {"text": "The region's heavy reliance on tourism worries economists.", "answer": "reliance"},
        {"text": "A healthy team should avoid total reliance on one leader.", "answer": "reliance"},
        {"text": "Modern life shows a growing reliance on digital systems.", "answer": "reliance"},
    ],
    "relish": [
        {"text": "She always relishes a difficult challenge.", "answer": "relish"},
        {"text": "The burger was served with a sweet onion relish.", "answer": "relish"},
        {"text": "He relished the chance to prove his critics wrong.", "answer": "relish"},
    ],
    "remnant": [
        {"text": "Only a remnant of the old wall remains.", "answer": "remnant"},
        {"text": "A tiny remnant of hope kept them moving.", "answer": "remnant"},
        {"text": "Shops were selling remnant pieces of fabric at low prices.", "answer": "remnant"},
    ],
    "rep": [
        {"text": "A sales rep called us about the new product.", "answer": "rep"},
        {"text": "He works as a union rep in the factory.", "answer": "rep"},
        {"text": "The band sent a rep to negotiate the contract.", "answer": "rep"},
    ],
    "repellent": [
        {"text": "Use insect repellent before going into the forest.", "answer": "repellent"},
        {"text": "His repellent behavior shocked the audience.", "answer": "repellent"},
        {"text": "The smell was so repellent that we left at once.", "answer": "repellent"},
    ],
    "reprehensible": [
        {"text": "The judge called the fraud morally reprehensible.", "answer": "reprehensible"},
        {"text": "Such treatment of workers is utterly reprehensible.", "answer": "reprehensible"},
        {"text": "He apologized for his reprehensible conduct.", "answer": "reprehensible"},
    ],
    "reprieve": [
        {"text": "The rain gave the firefighters a brief reprieve.", "answer": "reprieve"},
        {"text": "The prisoner was granted a temporary reprieve.", "answer": "reprieve"},
        {"text": "Cool weather offered a reprieve from the heatwave.", "answer": "reprieve"},
    ],
    "resemblance": [
        {"text": "There is a strong resemblance between the twins.", "answer": "resemblance"},
        {"text": "The building bears no resemblance to the original design.", "answer": "resemblance"},
        {"text": "Her voice has a striking resemblance to her mother's.", "answer": "resemblance"},
    ],
    "resentment": [
        {"text": "Years of unfair treatment built up deep resentment.", "answer": "resentment"},
        {"text": "He spoke without bitterness or resentment.", "answer": "resentment"},
        {"text": "The policy created resentment among small businesses.", "answer": "resentment"},
    ],
    "resiliency": [
        {"text": "The city showed remarkable resiliency after the storm.", "answer": "resiliency"},
        {"text": "Training can improve emotional resiliency in teenagers.", "answer": "resiliency"},
        {"text": "The material's resiliency made it useful for sports gear.", "answer": "resiliency"},
    ],
    "retailer": [
        {"text": "The retailer lowered prices before the holiday rush.", "answer": "retailer"},
        {"text": "Online retailers now dominate the market.", "answer": "retailer"},
        {"text": "A major retailer agreed to stock the new product.", "answer": "retailer"},
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
