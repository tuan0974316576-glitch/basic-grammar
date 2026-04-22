from __future__ import annotations

import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

SENTENCES = {
    "glow": [
        {"text": "The fireplace gave the room a warm glow.", "answer": "glow"},
        {"text": "Her face seemed to glow with happiness.", "answer": "glow"},
        {"text": "The city began to glow as evening fell.", "answer": "glow"},
    ],
    "glut": [
        {"text": "A glut of cheap goods flooded the market.", "answer": "glut"},
        {"text": "There is a seasonal glut of tomatoes every summer.", "answer": "glut"},
        {"text": "The sudden glut in supply drove prices down.", "answer": "glut"},
    ],
    "grandiose": [
        {"text": "He announced a grandiose plan to transform the city in a year.", "answer": "grandiose"},
        {"text": "The palace was built in a grandiose style.", "answer": "grandiose"},
        {"text": "Her grandiose promises impressed nobody in the end.", "answer": "grandiose"},
    ],
    "grapple": [
        {"text": "Scientists continue to grapple with the mystery.", "answer": "grapple"},
        {"text": "The town is grappling with a housing shortage.", "answer": "grapple"},
        {"text": "He grappled with the ethical implications of the choice.", "answer": "grapple"},
    ],
    "grotesque": [
        {"text": "The film used grotesque images to unsettle viewers.", "answer": "grotesque"},
        {"text": "The statue had a grotesque expression on its face.", "answer": "grotesque"},
        {"text": "They mocked the grotesque waste of public money.", "answer": "grotesque"},
    ],
    "guise": [
        {"text": "He entered the meeting under the guise of a consultant.", "answer": "guise"},
        {"text": "The policy was introduced in the guise of reform.", "answer": "guise"},
        {"text": "She visited in the guise of an old friend.", "answer": "guise"},
    ],
    "hapless": [
        {"text": "The hapless tourist dropped his map into the river.", "answer": "hapless"},
        {"text": "A hapless clerk became the target of public anger.", "answer": "hapless"},
        {"text": "The comedy follows a hapless hero through a series of disasters.", "answer": "hapless"},
    ],
    "harbinger": [
        {"text": "Dark clouds were a harbinger of the storm.", "answer": "harbinger"},
        {"text": "Some saw the small protest as a harbinger of wider unrest.", "answer": "harbinger"},
        {"text": "The first frost is a harbinger of winter.", "answer": "harbinger"},
    ],
    "haul": [
        {"text": "The fishermen returned with a large haul of squid.", "answer": "haul"},
        {"text": "It took hours to haul the equipment up the hill.", "answer": "haul"},
        {"text": "Police seized a haul of stolen goods.", "answer": "haul"},
    ],
    "hay": [
        {"text": "The horses were fed fresh hay every morning.", "answer": "hay"},
        {"text": "They stored the hay in a dry barn.", "answer": "hay"},
        {"text": "The smell of hay drifted across the field.", "answer": "hay"},
    ],
    "headhunter": [
        {"text": "A headhunter contacted her about a senior post overseas.", "answer": "headhunter"},
        {"text": "He now works as a headhunter for technology firms.", "answer": "headhunter"},
        {"text": "The company hired a headhunter to find a new chief executive.", "answer": "headhunter"},
    ],
    "heap": [
        {"text": "A heap of clothes covered the chair.", "answer": "heap"},
        {"text": "The mechanic found a heap of broken parts in the yard.", "answer": "heap"},
        {"text": "She gave me a heap of reasons to stay.", "answer": "heap"},
    ],
    "heather": [
        {"text": "Purple heather covered the hillside in late summer.", "answer": "heather"},
        {"text": "They walked through fields of blooming heather.", "answer": "heather"},
        {"text": "The painting featured sheep grazing among the heather.", "answer": "heather"},
    ],
    "hedonism": [
        {"text": "The novel criticizes a culture of shallow hedonism.", "answer": "hedonism"},
        {"text": "He mistook freedom for pure hedonism.", "answer": "hedonism"},
        {"text": "The philosopher warned that endless hedonism leads to emptiness.", "answer": "hedonism"},
    ],
    "hippocratic": [
        {"text": "Medical ethics still draw on Hippocratic principles.", "answer": "hippocratic"},
        {"text": "The speaker discussed the Hippocratic tradition in medicine.", "answer": "hippocratic"},
        {"text": "Students reflected on the Hippocratic duty to do no harm.", "answer": "hippocratic"},
    ],
    "hipster": [
        {"text": "The cafe was full of hipsters with vintage cameras.", "answer": "hipster"},
        {"text": "He mocked the neighborhood for becoming too hipster.", "answer": "hipster"},
        {"text": "The magazine featured a guide to hipster fashion.", "answer": "hipster"},
    ],
    "hive": [
        {"text": "The beekeeper checked every hive before sunset.", "answer": "hive"},
        {"text": "The office became a hive of activity before the deadline.", "answer": "hive"},
        {"text": "Smoke was used to calm the bees in the hive.", "answer": "hive"},
    ],
    "homeopathy": [
        {"text": "She turned to homeopathy after conventional treatment failed.", "answer": "homeopathy"},
        {"text": "The article questioned the claims of homeopathy.", "answer": "homeopathy"},
        {"text": "Doctors debated whether homeopathy should be publicly funded.", "answer": "homeopathy"},
    ],
    "homey": [
        {"text": "The kitchen felt warm and homey on a rainy evening.", "answer": "homey"},
        {"text": "They decorated the apartment to make it more homey.", "answer": "homey"},
        {"text": "A homey atmosphere made guests relax quickly.", "answer": "homey"},
    ],
    "homogeneity": [
        {"text": "The policy increased cultural homogeneity in the schools.", "answer": "homogeneity"},
        {"text": "Scientists tested the homogeneity of the mixture.", "answer": "homogeneity"},
        {"text": "Too much homogeneity can limit creativity.", "answer": "homogeneity"},
    ],
    "hop": [
        {"text": "The child tried to hop across the puddles.", "answer": "hop"},
        {"text": "We may need to hop on the next train quickly.", "answer": "hop"},
        {"text": "Small birds hop across the lawn in the morning.", "answer": "hop"},
    ],
    "hornet": [
        {"text": "A hornet flew into the kitchen through the open window.", "answer": "hornet"},
        {"text": "The nest turned out to belong to hornets, not bees.", "answer": "hornet"},
        {"text": "He was stung by a hornet while trimming the hedge.", "answer": "hornet"},
    ],
    "howl": [
        {"text": "We heard wolves howl in the distance.", "answer": "howl"},
        {"text": "The wind began to howl around the old house.", "answer": "howl"},
        {"text": "The audience howled with laughter at the final joke.", "answer": "howl"},
    ],
    "huff": [
        {"text": "She stormed out in a huff after the argument.", "answer": "huff"},
        {"text": "He began to huff as he climbed the stairs.", "answer": "huff"},
        {"text": "Do not leave in a huff every time someone disagrees with you.", "answer": "huff"},
    ],
    "humbly": [
        {"text": "He humbly accepted the award on behalf of his team.", "answer": "humbly"},
        {"text": "She humbly admitted that she still had much to learn.", "answer": "humbly"},
        {"text": "The monk spoke humbly about his achievements.", "answer": "humbly"},
    ],
    "hunch": [
        {"text": "I have a hunch that she already knows the truth.", "answer": "hunch"},
        {"text": "His hunch proved correct after the files were checked.", "answer": "hunch"},
        {"text": "Detectives followed a hunch and found the missing car.", "answer": "hunch"},
    ],
    "idolatry": [
        {"text": "The writer criticizes celebrity idolatry in modern culture.", "answer": "idolatry"},
        {"text": "Religious leaders warned against idolatry.", "answer": "idolatry"},
        {"text": "His admiration for the coach bordered on idolatry.", "answer": "idolatry"},
    ],
    "ignorant": [
        {"text": "It was an ignorant remark that offended many listeners.", "answer": "ignorant"},
        {"text": "He remained ignorant of the changes until too late.", "answer": "ignorant"},
        {"text": "No one should be mocked for being ignorant and willing to learn.", "answer": "ignorant"},
    ],
    "immortal": [
        {"text": "The poet hoped his work would make him immortal.", "answer": "immortal"},
        {"text": "In myth, the gods are often immortal.", "answer": "immortal"},
        {"text": "The victory gave the player an almost immortal status among fans.", "answer": "immortal"},
    ],
    "impeccably": [
        {"text": "She was impeccably dressed for the ceremony.", "answer": "impeccably"},
        {"text": "The room was impeccably clean.", "answer": "impeccably"},
        {"text": "He behaved impeccably throughout the interview.", "answer": "impeccably"},
    ],
    "impede": [
        {"text": "Heavy traffic may impede emergency services.", "answer": "impede"},
        {"text": "Fear can impede honest communication.", "answer": "impede"},
        {"text": "The wall was built to impede the spread of the fire.", "answer": "impede"},
    ],
    "impressionable": [
        {"text": "Young children are highly impressionable.", "answer": "impressionable"},
        {"text": "Advertisers often target impressionable audiences.", "answer": "impressionable"},
        {"text": "He worried that the violent content might affect impressionable viewers.", "answer": "impressionable"},
    ],
    "inclement": [
        {"text": "The match was canceled because of inclement weather.", "answer": "inclement"},
        {"text": "Travelers should prepare for inclement conditions in winter.", "answer": "inclement"},
        {"text": "The shelter was built to withstand inclement seas.", "answer": "inclement"},
    ],
    "incongruity": [
        {"text": "There was an amusing incongruity between his voice and his size.", "answer": "incongruity"},
        {"text": "The architect embraced incongruity in the design.", "answer": "incongruity"},
        {"text": "The sudden joke created a strange incongruity in the solemn ceremony.", "answer": "incongruity"},
    ],
    "indebted to": [
        {"text": "I am deeply indebted to my teachers for their support.", "answer": "indebted to"},
        {"text": "The project is indebted to earlier research from the same team.", "answer": "indebted to"},
        {"text": "She said she remained indebted to the doctor who helped her family.", "answer": "indebted to"},
    ],
    "indispensable": [
        {"text": "Reliable internet has become indispensable for many workers.", "answer": "indispensable"},
        {"text": "Her calm judgment was indispensable during the crisis.", "answer": "indispensable"},
        {"text": "Maps remain indispensable on long mountain walks.", "answer": "indispensable"},
    ],
    "indoctrinate": [
        {"text": "The group was accused of trying to indoctrinate children.", "answer": "indoctrinate"},
        {"text": "Education should encourage inquiry, not indoctrinate students.", "answer": "indoctrinate"},
        {"text": "The regime used media to indoctrinate the public.", "answer": "indoctrinate"},
    ],
    "infancy": [
        {"text": "The technology is still in its infancy.", "answer": "infancy"},
        {"text": "The memory dates back to his infancy.", "answer": "infancy"},
        {"text": "The company struggled during its infancy.", "answer": "infancy"},
    ],
    "infectious": [
        {"text": "Her laughter was so infectious that everyone smiled.", "answer": "infectious"},
        {"text": "Doctors wore masks to prevent infectious disease from spreading.", "answer": "infectious"},
        {"text": "His enthusiasm proved infectious in the classroom.", "answer": "infectious"},
    ],
    "infinite": [
        {"text": "The universe may seem infinite to us.", "answer": "infinite"},
        {"text": "Children often have an infinite supply of questions.", "answer": "infinite"},
        {"text": "The game allows for almost infinite combinations.", "answer": "infinite"},
    ],
    "infuriate": [
        {"text": "The delay was enough to infuriate even patient customers.", "answer": "infuriate"},
        {"text": "False accusations would infuriate anyone.", "answer": "infuriate"},
        {"text": "He knew the remark would infuriate his opponent.", "answer": "infuriate"},
    ],
    "infuse": [
        {"text": "She tried to infuse the lesson with humor.", "answer": "infuse"},
        {"text": "Tea leaves need time to infuse in hot water.", "answer": "infuse"},
        {"text": "The artist wanted to infuse the work with local history.", "answer": "infuse"},
    ],
    "ingenuity": [
        {"text": "The invention shows real ingenuity.", "answer": "ingenuity"},
        {"text": "They solved the problem with remarkable ingenuity.", "answer": "ingenuity"},
        {"text": "Human ingenuity often thrives under pressure.", "answer": "ingenuity"},
    ],
    "ingratiate": [
        {"text": "He tried to ingratiate himself with the new manager.", "answer": "ingratiate"},
        {"text": "Flattery may help some people ingratiate themselves with power.", "answer": "ingratiate"},
        {"text": "She refused to ingratiate herself for promotion.", "answer": "ingratiate"},
    ],
    "inhabit": [
        {"text": "Rare birds inhabit the cliffs along the coast.", "answer": "inhabit"},
        {"text": "The stories inhabit his imagination even now.", "answer": "inhabit"},
        {"text": "More than a million people inhabit the valley.", "answer": "inhabit"},
    ],
    "inscrutable": [
        {"text": "He gave an inscrutable smile and said nothing.", "answer": "inscrutable"},
        {"text": "The painting's meaning remains inscrutable to many viewers.", "answer": "inscrutable"},
        {"text": "Her inscrutable expression made the room uneasy.", "answer": "inscrutable"},
    ],
    "instigate": [
        {"text": "The article accused him of trying to instigate violence.", "answer": "instigate"},
        {"text": "A single rumor can instigate panic.", "answer": "instigate"},
        {"text": "She did not instigate the argument, but she kept it going.", "answer": "instigate"},
    ],
    "intertwine": [
        {"text": "Their personal lives began to intertwine with work.", "answer": "intertwine"},
        {"text": "Vines intertwine around the old fence.", "answer": "intertwine"},
        {"text": "History and myth intertwine in the novel.", "answer": "intertwine"},
    ],
    "intolerable": [
        {"text": "The heat inside the car became intolerable.", "answer": "intolerable"},
        {"text": "The report described the living conditions as intolerable.", "answer": "intolerable"},
        {"text": "For many workers, the pressure had become intolerable.", "answer": "intolerable"},
    ],
    "intricately": [
        {"text": "The ceiling was intricately painted with gold patterns.", "answer": "intricately"},
        {"text": "Their lives were intricately connected.", "answer": "intricately"},
        {"text": "The machine was intricately designed for precision work.", "answer": "intricately"},
    ],
    "intrigue": [
        {"text": "The mystery was enough to intrigue the audience.", "answer": "intrigue"},
        {"text": "Court intrigue shaped the empire's history.", "answer": "intrigue"},
        {"text": "Her unusual research topic intrigued the committee.", "answer": "intrigue"},
    ],
    "intrinsic": [
        {"text": "The necklace has little intrinsic value.", "answer": "intrinsic"},
        {"text": "Curiosity is an intrinsic part of learning.", "answer": "intrinsic"},
        {"text": "The artwork's intrinsic beauty mattered more than its price.", "answer": "intrinsic"},
    ],
    "intruder": [
        {"text": "The guard spotted an intruder near the gate.", "answer": "intruder"},
        {"text": "The dog barked loudly at the intruder.", "answer": "intruder"},
        {"text": "They installed cameras to warn them of any intruder.", "answer": "intruder"},
    ],
    "intuition": [
        {"text": "Her intuition told her not to trust the offer.", "answer": "intuition"},
        {"text": "Good doctors balance evidence with intuition.", "answer": "intuition"},
        {"text": "He relied on intuition when the data was incomplete.", "answer": "intuition"},
    ],
    "invariably": [
        {"text": "He invariably arrives five minutes early.", "answer": "invariably"},
        {"text": "The discussion invariably turns to money.", "answer": "invariably"},
        {"text": "Cheap repairs invariably lead to more problems.", "answer": "invariably"},
    ],
    "invincibility": [
        {"text": "Youth can create a false sense of invincibility.", "answer": "invincibility"},
        {"text": "The champion's aura of invincibility finally faded.", "answer": "invincibility"},
        {"text": "The film questions the myth of national invincibility.", "answer": "invincibility"},
    ],
    "iteration": [
        {"text": "This version is only the first iteration of the design.", "answer": "iteration"},
        {"text": "Each iteration of the model became more accurate.", "answer": "iteration"},
        {"text": "The app improved after several quick iterations.", "answer": "iteration"},
    ],
    "itinerant": [
        {"text": "The village once depended on itinerant traders.", "answer": "itinerant"},
        {"text": "An itinerant musician played outside the station.", "answer": "itinerant"},
        {"text": "He lived an itinerant life for many years.", "answer": "itinerant"},
    ],
    "janitor": [
        {"text": "The janitor locked the school after everyone left.", "answer": "janitor"},
        {"text": "She thanked the janitor for fixing the broken light.", "answer": "janitor"},
        {"text": "The janitor found the missing bag in the hallway.", "answer": "janitor"},
    ],
    "jerk": [
        {"text": "Do not jerk the rope too hard.", "answer": "jerk"},
        {"text": "He acted like a jerk during the meeting.", "answer": "jerk"},
        {"text": "The bus gave a sudden jerk as it stopped.", "answer": "jerk"},
    ],
    "judgment": [
        {"text": "Good judgment matters more than quick reactions here.", "answer": "judgment"},
        {"text": "The court will deliver its judgment tomorrow.", "answer": "judgment"},
        {"text": "Her judgment improved after years of experience.", "answer": "judgment"},
    ],
    "juggle": [
        {"text": "Working parents often juggle many duties at once.", "answer": "juggle"},
        {"text": "He can juggle three balls with ease.", "answer": "juggle"},
        {"text": "The manager had to juggle budget cuts and staff concerns.", "answer": "juggle"},
    ],
    "klaxon": [
        {"text": "A loud klaxon sounded throughout the ship.", "answer": "klaxon"},
        {"text": "The factory's klaxon warned workers to evacuate.", "answer": "klaxon"},
        {"text": "At dawn, the klaxon broke the silence of the base.", "answer": "klaxon"},
    ],
    "knot": [
        {"text": "He tied the rope in a strong knot.", "answer": "knot"},
        {"text": "Stress left a knot in her stomach.", "answer": "knot"},
        {"text": "The wood had a dark knot near the center.", "answer": "knot"},
    ],
    "labyrinth": [
        {"text": "The palace was a labyrinth of corridors and staircases.", "answer": "labyrinth"},
        {"text": "The plot becomes a political labyrinth by the second act.", "answer": "labyrinth"},
        {"text": "Visitors wandered through the hedge labyrinth for an hour.", "answer": "labyrinth"},
    ],
    "lackluster": [
        {"text": "Sales were disappointing after a lackluster launch.", "answer": "lackluster"},
        {"text": "The team gave a lackluster performance in the first half.", "answer": "lackluster"},
        {"text": "Critics called the sequel dull and lackluster.", "answer": "lackluster"},
    ],
    "lacquer": [
        {"text": "The box was covered with black lacquer.", "answer": "lacquer"},
        {"text": "Workers applied lacquer to the wooden panels.", "answer": "lacquer"},
        {"text": "The museum displayed a lacquer table from the Qing era.", "answer": "lacquer"},
    ],
    "lacrosse": [
        {"text": "She joined the school lacrosse team this year.", "answer": "lacrosse"},
        {"text": "The finals of the lacrosse tournament drew a big crowd.", "answer": "lacrosse"},
        {"text": "He practices lacrosse every weekend.", "answer": "lacrosse"},
    ],
    "lair": [
        {"text": "The story leads the hero into the dragon's lair.", "answer": "lair"},
        {"text": "Police discovered the gang's lair in an abandoned warehouse.", "answer": "lair"},
        {"text": "The fox retreated to its lair at dusk.", "answer": "lair"},
    ],
    "lame": [
        {"text": "His excuse sounded lame even to his friends.", "answer": "lame"},
        {"text": "The injured horse looked lame after the fall.", "answer": "lame"},
        {"text": "They ended the show with a lame joke.", "answer": "lame"},
    ],
    "lancet": [
        {"text": "The nurse used a sterile lancet to draw a drop of blood.", "answer": "lancet"},
        {"text": "A lancet is often included in home testing kits.", "answer": "lancet"},
        {"text": "He flinched when he saw the tiny lancet.", "answer": "lancet"},
    ],
    "landowner": [
        {"text": "The landowner refused to sell the field.", "answer": "landowner"},
        {"text": "Several landowners opposed the new highway.", "answer": "landowner"},
        {"text": "The estate has belonged to the same landowner for decades.", "answer": "landowner"},
    ],
    "languish": [
        {"text": "The bill continued to languish in committee.", "answer": "languish"},
        {"text": "Without support, the theater may languish for years.", "answer": "languish"},
        {"text": "The prisoner languished in jail awaiting trial.", "answer": "languish"},
    ],
    "leaping": [
        {"text": "Leaping flames could be seen from miles away.", "answer": "leaping"},
        {"text": "The dog made a leaping grab for the ball.", "answer": "leaping"},
        {"text": "Leaping fish flashed silver in the river.", "answer": "leaping"},
    ],
    "legalities": [
        {"text": "We need to sort out the legalities before signing anything.", "answer": "legalities"},
        {"text": "The startup ignored basic legalities and paid the price.", "answer": "legalities"},
        {"text": "Their lawyer handled the legalities of the sale.", "answer": "legalities"},
    ],
    "linen": [
        {"text": "Fresh linen was folded neatly on the bed.", "answer": "linen"},
        {"text": "The hotel changed the linen every morning.", "answer": "linen"},
        {"text": "She wore a white linen dress in the heat.", "answer": "linen"},
    ],
    "lingonberry": [
        {"text": "The jam was made from wild lingonberry.", "answer": "lingonberry"},
        {"text": "She served meatballs with lingonberry sauce.", "answer": "lingonberry"},
        {"text": "Lingonberry grows in cold northern forests.", "answer": "lingonberry"},
    ],
    "lodge": [
        {"text": "They decided to lodge a formal complaint.", "answer": "lodge"},
        {"text": "We stayed in a mountain lodge during the storm.", "answer": "lodge"},
        {"text": "A piece of glass lodged in the tire.", "answer": "lodge"},
    ],
    "long for": [
        {"text": "After months abroad, she began to long for home.", "answer": "long for"},
        {"text": "Many people long for a quieter life.", "answer": "long for"},
        {"text": "He still longs for the freedom he once had.", "answer": "long for"},
    ],
    "longevity": [
        {"text": "Regular exercise may improve longevity.", "answer": "longevity"},
        {"text": "The product's longevity surprised the engineers.", "answer": "longevity"},
        {"text": "The festival owes its longevity to local support.", "answer": "longevity"},
    ],
    "lull": [
        {"text": "There was a brief lull in the storm.", "answer": "lull"},
        {"text": "The music helped lull the baby to sleep.", "answer": "lull"},
        {"text": "Do not let the quiet lull you into a false sense of safety.", "answer": "lull"},
    ],
    "lump": [
        {"text": "She found a small lump in her neck.", "answer": "lump"},
        {"text": "There was a lump of clay on the table.", "answer": "lump"},
        {"text": "He felt a lump in his throat during the speech.", "answer": "lump"},
    ],
    "lunatic": [
        {"text": "Only a lunatic would try that stunt without training.", "answer": "lunatic"},
        {"text": "The villain was portrayed as a dangerous lunatic.", "answer": "lunatic"},
        {"text": "Some thought his plan sounded utterly lunatic at first.", "answer": "lunatic"},
    ],
    "lurk": [
        {"text": "Danger may lurk behind the simple explanation.", "answer": "lurk"},
        {"text": "Sharks are said to lurk in the deeper water.", "answer": "lurk"},
        {"text": "He tends to lurk at the back of the room during meetings.", "answer": "lurk"},
    ],
    "magpie": [
        {"text": "A magpie landed on the fence and watched us closely.", "answer": "magpie"},
        {"text": "The child was called a magpie because she collected shiny things.", "answer": "magpie"},
        {"text": "Magpies can be surprisingly bold around people.", "answer": "magpie"},
    ],
    "malicious": [
        {"text": "The company sued over the malicious rumor.", "answer": "malicious"},
        {"text": "Police warned users about malicious software.", "answer": "malicious"},
        {"text": "It was a malicious lie designed to hurt her career.", "answer": "malicious"},
    ],
    "maltese": [
        {"text": "The exhibition included rare Maltese coins.", "answer": "maltese"},
        {"text": "He adopted a small Maltese dog.", "answer": "maltese"},
        {"text": "She studies Maltese history and culture.", "answer": "maltese"},
    ],
    "mar": [
        {"text": "A single error could mar the whole performance.", "answer": "mar"},
        {"text": "Rain may mar the opening ceremony.", "answer": "mar"},
        {"text": "The wall was marred by deep scratches.", "answer": "mar"},
    ],
    "marian": [
        {"text": "The church is known for its Marian traditions.", "answer": "marian"},
        {"text": "She wrote a paper on Marian symbolism in art.", "answer": "marian"},
        {"text": "The shrine hosts a Marian festival each spring.", "answer": "marian"},
    ],
    "marital": [
        {"text": "The counselor specializes in marital problems.", "answer": "marital"},
        {"text": "Financial stress can damage marital harmony.", "answer": "marital"},
        {"text": "The survey focused on marital status and income.", "answer": "marital"},
    ],
    "masonry": [
        {"text": "The old bridge is an example of fine masonry.", "answer": "masonry"},
        {"text": "Cracks had appeared in the building's masonry.", "answer": "masonry"},
        {"text": "He trained in masonry before becoming an architect.", "answer": "masonry"},
    ],
    "maximise": [
        {"text": "The company wants to maximise efficiency.", "answer": "maximise"},
        {"text": "We should maximise the use of available space.", "answer": "maximise"},
        {"text": "The design was altered to maximise natural light.", "answer": "maximise"},
    ],
    "meddle": [
        {"text": "She tends to meddle in other people's decisions.", "answer": "meddle"},
        {"text": "Do not meddle with the machine unless trained.", "answer": "meddle"},
        {"text": "Parents should guide, not meddle constantly.", "answer": "meddle"},
    ],
    "melancholic": [
        {"text": "The song has a slow, melancholic tone.", "answer": "melancholic"},
        {"text": "He became melancholic whenever autumn arrived.", "answer": "melancholic"},
        {"text": "The film ends on a quietly melancholic note.", "answer": "melancholic"},
    ],
    "microbial": [
        {"text": "The study focused on microbial life in deep oceans.", "answer": "microbial"},
        {"text": "Scientists tested the water for microbial contamination.", "answer": "microbial"},
        {"text": "Microbial activity can affect soil quality.", "answer": "microbial"},
    ],
    "mighty": [
        {"text": "A mighty wave crashed against the cliff.", "answer": "mighty"},
        {"text": "The empire was once a mighty power.", "answer": "mighty"},
        {"text": "She gave the door a mighty push.", "answer": "mighty"},
    ],
    "millennium": [
        {"text": "The monument was built to welcome the new millennium.", "answer": "millennium"},
        {"text": "The city changed dramatically over the last millennium.", "answer": "millennium"},
        {"text": "Historians debated the exact start of the millennium.", "answer": "millennium"},
    ],
    "mingle": [
        {"text": "Guests were invited to mingle before dinner.", "answer": "mingle"},
        {"text": "The smell of coffee mingled with fresh bread.", "answer": "mingle"},
        {"text": "Excitement and fear mingled in her mind.", "answer": "mingle"},
    ],
    "miniature": [
        {"text": "He collected miniature cars from around the world.", "answer": "miniature"},
        {"text": "The artist painted a miniature portrait.", "answer": "miniature"},
        {"text": "A miniature model of the town stood in the museum.", "answer": "miniature"},
    ],
    "miniscule": [
        {"text": "Only a miniscule amount of the substance was detected.", "answer": "miniscule"},
        {"text": "The difference between the two samples was miniscule.", "answer": "miniscule"},
        {"text": "A miniscule error can ruin the entire calculation.", "answer": "miniscule"},
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
