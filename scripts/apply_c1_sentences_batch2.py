from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SENTENCES = {
    "bare": [
        {"text": "The room was bare except for a small table.", "answer": "bare"},
        {"text": "His explanation revealed the bare truth.", "answer": "bare"},
        {"text": "The trees looked bare in the winter wind.", "answer": "bare"},
    ],
    "batter": [
        {"text": "Mix the flour and eggs until the batter is smooth.", "answer": "batter"},
        {"text": "She poured the cake batter into the tin.", "answer": "batter"},
        {"text": "The chef added milk to thin the batter slightly.", "answer": "batter"},
    ],
    "bay": [
        {"text": "The boat floated quietly in the bay.", "answer": "bay"},
        {"text": "They watched the sunset from across the bay.", "answer": "bay"},
        {"text": "A fishing village lies near the sheltered bay.", "answer": "bay"},
    ],
    "beast": [
        {"text": "In the story, the hero must defeat a giant beast.", "answer": "beast"},
        {"text": "The wounded beast disappeared into the forest.", "answer": "beast"},
        {"text": "Some legends describe the sea as a sleeping beast.", "answer": "beast"},
    ],
    "beekeeper": [
        {"text": "The beekeeper checked each hive before noon.", "answer": "beekeeper"},
        {"text": "A skilled beekeeper knows when honey is ready.", "answer": "beekeeper"},
        {"text": "The beekeeper wore protective clothing during the inspection.", "answer": "beekeeper"},
    ],
    "befall": [
        {"text": "Nobody could predict the tragedy that would befall the town.", "answer": "befall"},
        {"text": "She feared that the same mistake might befall her team.", "answer": "befall"},
        {"text": "A strange silence seemed to befall the room.", "answer": "befall"},
    ],
    "behemoth": [
        {"text": "The company grew into a global behemoth within a decade.", "answer": "behemoth"},
        {"text": "That old truck is a behemoth on narrow roads.", "answer": "behemoth"},
        {"text": "Critics described the mall as a concrete behemoth.", "answer": "behemoth"},
    ],
    "beholder": [
        {"text": "Beauty is often said to lie in the eye of the beholder.", "answer": "beholder"},
        {"text": "The painting means different things to each beholder.", "answer": "beholder"},
        {"text": "To one beholder, the sculpture looked peaceful.", "answer": "beholder"},
    ],
    "bellaneil": [
        {"text": "Bellaneil was listed as the code name of the design project.", "answer": "bellaneil"},
        {"text": "The document mentioned Bellaneil in the final paragraph.", "answer": "bellaneil"},
        {"text": "Bellaneil appeared again in the archive records.", "answer": "bellaneil"},
    ],
    "bellow": [
        {"text": "The coach began to bellow instructions across the field.", "answer": "bellow"},
        {"text": "We heard the animal bellow in the distance.", "answer": "bellow"},
        {"text": "He did not need to bellow to be heard.", "answer": "bellow"},
    ],
    "bench": [
        {"text": "She sat on a wooden bench near the station.", "answer": "bench"},
        {"text": "The park bench was still wet after the rain.", "answer": "bench"},
        {"text": "The judge took her place on the bench.", "answer": "bench"},
    ],
    "beneath": [
        {"text": "The village lies beneath the mountain ridge.", "answer": "beneath"},
        {"text": "He found the letter beneath a pile of books.", "answer": "beneath"},
        {"text": "Some people felt the task was beneath them.", "answer": "beneath"},
    ],
    "bilingual": [
        {"text": "The school offers a bilingual learning environment.", "answer": "bilingual"},
        {"text": "She grew up in a bilingual household.", "answer": "bilingual"},
        {"text": "The guidebook is available in a bilingual edition.", "answer": "bilingual"},
    ],
    "bind": [
        {"text": "The law will bind all companies equally.", "answer": "bind"},
        {"text": "Use string to bind the papers together.", "answer": "bind"},
        {"text": "A shared goal can bind a team more closely.", "answer": "bind"},
    ],
    "biography": [
        {"text": "She borrowed a biography of the scientist from the library.", "answer": "biography"},
        {"text": "The biography describes his difficult childhood.", "answer": "biography"},
        {"text": "Writing a biography requires careful research.", "answer": "biography"},
    ],
    "biomedical": [
        {"text": "The university opened a new biomedical research center.", "answer": "biomedical"},
        {"text": "Biomedical engineers worked on the device together.", "answer": "biomedical"},
        {"text": "She hopes to enter the biomedical field after graduation.", "answer": "biomedical"},
    ],
    "birdshot": [
        {"text": "The hunter loaded the gun with birdshot.", "answer": "birdshot"},
        {"text": "Small pellets of birdshot were found nearby.", "answer": "birdshot"},
        {"text": "Birdshot is used for smaller game.", "answer": "birdshot"},
    ],
    "bizarre": [
        {"text": "The story ended in a bizarre way.", "answer": "bizarre"},
        {"text": "He wore a bizarre costume to the event.", "answer": "bizarre"},
        {"text": "The village has a bizarre local legend.", "answer": "bizarre"},
    ],
    "blast": [
        {"text": "The blast shattered several windows at once.", "answer": "blast"},
        {"text": "A cold blast of air rushed through the door.", "answer": "blast"},
        {"text": "Workers heard a loud blast from the quarry.", "answer": "blast"},
    ],
    "bleed": [
        {"text": "Press the wound firmly if it starts to bleed.", "answer": "bleed"},
        {"text": "The cut may bleed again if you move too much.", "answer": "bleed"},
        {"text": "Bright colors can bleed in hot water.", "answer": "bleed"},
    ],
    "blend": [
        {"text": "These spices blend well in soup.", "answer": "blend"},
        {"text": "The artist likes to blend bold and soft colors.", "answer": "blend"},
        {"text": "Their voices blend beautifully in the chorus.", "answer": "blend"},
    ],
    "blindness": [
        {"text": "The program raises awareness of preventable blindness.", "answer": "blindness"},
        {"text": "The accident resulted in partial blindness.", "answer": "blindness"},
        {"text": "Blindness should not prevent equal access to education.", "answer": "blindness"},
    ],
    "blockbuster": [
        {"text": "The film became a summer blockbuster.", "answer": "blockbuster"},
        {"text": "Studios hope the sequel will be another blockbuster.", "answer": "blockbuster"},
        {"text": "A blockbuster usually earns huge ticket sales.", "answer": "blockbuster"},
    ],
    "boom": [
        {"text": "The city experienced a property boom last year.", "answer": "boom"},
        {"text": "We heard a boom from across the harbor.", "answer": "boom"},
        {"text": "Tourism is enjoying a strong boom this season.", "answer": "boom"},
    ],
    "bootstrap": [
        {"text": "The program will bootstrap the system on startup.", "answer": "bootstrap"},
        {"text": "They tried to bootstrap the business without outside funding.", "answer": "bootstrap"},
        {"text": "The bootstrap process failed during the update.", "answer": "bootstrap"},
    ],
    "boundary": [
        {"text": "The river forms the natural boundary between the two regions.", "answer": "boundary"},
        {"text": "Healthy relationships require clear boundary lines.", "answer": "boundary"},
        {"text": "The fence marks the property boundary.", "answer": "boundary"},
    ],
    "breach": [
        {"text": "The company reported a serious data breach.", "answer": "breach"},
        {"text": "The wall was damaged by a breach near the gate.", "answer": "breach"},
        {"text": "Breaking the agreement would be a breach of trust.", "answer": "breach"},
    ],
    "breakage": [
        {"text": "Please report any breakage to the front desk.", "answer": "breakage"},
        {"text": "The shop charges extra for breakage.", "answer": "breakage"},
        {"text": "Careful packaging reduces breakage during delivery.", "answer": "breakage"},
    ],
    "breakthrough": [
        {"text": "Scientists announced a breakthrough in cancer treatment.", "answer": "breakthrough"},
        {"text": "The invention marked a major technological breakthrough.", "answer": "breakthrough"},
        {"text": "After months of failure, the team finally had a breakthrough.", "answer": "breakthrough"},
    ],
    "breed": [
        {"text": "This dog breed is known for its gentle nature.", "answer": "breed"},
        {"text": "Warm conditions allow insects to breed quickly.", "answer": "breed"},
        {"text": "Farmers select healthy animals to breed.", "answer": "breed"},
    ],
    "browser": [
        {"text": "Open the link in your browser to continue.", "answer": "browser"},
        {"text": "The site works better on a modern browser.", "answer": "browser"},
        {"text": "He cleared the browser cache to solve the problem.", "answer": "browser"},
    ],
    "brutal": [
        {"text": "The team faced a brutal schedule this month.", "answer": "brutal"},
        {"text": "Winter can be brutal in the mountains.", "answer": "brutal"},
        {"text": "The documentary showed the brutal reality of war.", "answer": "brutal"},
    ],
    "buck": [
        {"text": "The horse gave a sudden buck and threw the rider off.", "answer": "buck"},
        {"text": "He wanted to make a quick buck online.", "answer": "buck"},
        {"text": "A young buck crossed the path at dawn.", "answer": "buck"},
    ],
    "buddy": [
        {"text": "He brought his old fishing buddy to dinner.", "answer": "buddy"},
        {"text": "My travel buddy booked the hotel room.", "answer": "buddy"},
        {"text": "The coach paired each new player with a buddy.", "answer": "buddy"},
    ],
    "bulk": [
        {"text": "Buying in bulk can save money over time.", "answer": "bulk"},
        {"text": "The bulk of the work was finished on Friday.", "answer": "bulk"},
        {"text": "The bulk shipment arrived late in the afternoon.", "answer": "bulk"},
    ],
    "bully": [
        {"text": "Schools should act quickly when a bully targets a student.", "answer": "bully"},
        {"text": "He used to bully younger children in the neighborhood.", "answer": "bully"},
        {"text": "The film shows how one bully changed over time.", "answer": "bully"},
    ],
    "burden": [
        {"text": "The extra cost placed a burden on small families.", "answer": "burden"},
        {"text": "He did not want to burden his friends with the news.", "answer": "burden"},
        {"text": "Caring duties became a heavy burden for her.", "answer": "burden"},
    ],
    "burial": [
        {"text": "The ancient burial site attracted many researchers.", "answer": "burial"},
        {"text": "The family attended the burial in silence.", "answer": "burial"},
        {"text": "Archaeologists found tools near the burial place.", "answer": "burial"},
    ],
    "burst": [
        {"text": "The balloon burst with a loud pop.", "answer": "burst"},
        {"text": "She burst into laughter during the speech.", "answer": "burst"},
        {"text": "Pipes can burst in freezing weather.", "answer": "burst"},
    ],
    "bustle": [
        {"text": "We enjoyed the bustle of the night market.", "answer": "bustle"},
        {"text": "Workers bustle around the station every morning.", "answer": "bustle"},
        {"text": "The hotel lobby was full of bustle before check-in time.", "answer": "bustle"},
    ],
    "butt": [
        {"text": "The ram lowered its head and gave the gate a butt.", "answer": "butt"},
        {"text": "Someone had left a cigarette butt on the ground.", "answer": "butt"},
        {"text": "The goat tried to butt the bucket aside.", "answer": "butt"},
    ],
    "bylines": [
        {"text": "The magazine printed the writers' bylines clearly.", "answer": "bylines"},
        {"text": "Her bylines began appearing in national newspapers.", "answer": "bylines"},
        {"text": "Editors checked the spelling of all bylines before publication.", "answer": "bylines"},
    ],
    "calculation": [
        {"text": "A small mistake in the calculation changed the result.", "answer": "calculation"},
        {"text": "The engineer checked the calculation twice.", "answer": "calculation"},
        {"text": "This calculation includes tax and delivery costs.", "answer": "calculation"},
    ],
    "cancellation": [
        {"text": "The storm led to the cancellation of several flights.", "answer": "cancellation"},
        {"text": "We received a cancellation notice by email.", "answer": "cancellation"},
        {"text": "Late cancellation may result in extra fees.", "answer": "cancellation"},
    ],
    "canine": [
        {"text": "The guide works in a canine training center.", "answer": "canine"},
        {"text": "A canine unit helped search the area.", "answer": "canine"},
        {"text": "The vet specializes in canine health.", "answer": "canine"},
    ],
    "canoe": [
        {"text": "They paddled a canoe across the lake.", "answer": "canoe"},
        {"text": "The wooden canoe was tied to the dock.", "answer": "canoe"},
        {"text": "She learned to steer a canoe during camp.", "answer": "canoe"},
    ],
    "capability": [
        {"text": "The software has the capability to process huge files.", "answer": "capability"},
        {"text": "Her leadership capability impressed the whole team.", "answer": "capability"},
        {"text": "The machine's capability was tested in extreme heat.", "answer": "capability"},
    ],
    "capitalism": [
        {"text": "The course explores the history of modern capitalism.", "answer": "capitalism"},
        {"text": "Critics argue that capitalism can widen inequality.", "answer": "capitalism"},
        {"text": "The documentary examines the global spread of capitalism.", "answer": "capitalism"},
    ],
    "capitalist": [
        {"text": "The novel portrays a powerful capitalist family.", "answer": "capitalist"},
        {"text": "He was described as a successful capitalist investor.", "answer": "capitalist"},
        {"text": "Some viewed the factory owner as a ruthless capitalist.", "answer": "capitalist"},
    ],
    "captivate": [
        {"text": "Her voice can captivate a large audience.", "answer": "captivate"},
        {"text": "The opening scene will captivate young viewers.", "answer": "captivate"},
        {"text": "Bright colors often captivate children quickly.", "answer": "captivate"},
    ],
    "captive": [
        {"text": "The film tells the story of a captive soldier.", "answer": "captive"},
        {"text": "The bird had spent years in captive conditions.", "answer": "captive"},
        {"text": "They tried to free the captive animals.", "answer": "captive"},
    ],
    "captivity": [
        {"text": "The tiger had lived in captivity for most of its life.", "answer": "captivity"},
        {"text": "Some animals do not adapt well to captivity.", "answer": "captivity"},
        {"text": "The report criticized long-term captivity in small cages.", "answer": "captivity"},
    ],
    "careerist": [
        {"text": "The novel presents him as a cold careerist.", "answer": "careerist"},
        {"text": "Critics accused the politician of being a careerist.", "answer": "careerist"},
        {"text": "She disliked the office culture of ambitious careerists.", "answer": "careerist"},
    ],
    "carpenter": [
        {"text": "The carpenter repaired the broken door frame.", "answer": "carpenter"},
        {"text": "A skilled carpenter built the shelves by hand.", "answer": "carpenter"},
        {"text": "The carpenter measured the room carefully before starting.", "answer": "carpenter"},
    ],
    "carriage": [
        {"text": "They rented a horse carriage for the wedding.", "answer": "carriage"},
        {"text": "The train carriage was almost empty.", "answer": "carriage"},
        {"text": "A child sat quietly inside the old carriage.", "answer": "carriage"},
    ],
    "carve": [
        {"text": "The artist can carve animals from wood.", "answer": "carve"},
        {"text": "She carefully carved the turkey at the table.", "answer": "carve"},
        {"text": "Rivers carve valleys over many centuries.", "answer": "carve"},
    ],
    "catalyst": [
        {"text": "The meeting became a catalyst for change.", "answer": "catalyst"},
        {"text": "A catalyst can speed up a chemical reaction.", "answer": "catalyst"},
        {"text": "His speech acted as a catalyst for the movement.", "answer": "catalyst"},
    ],
    "cater": [
        {"text": "The menu is designed to cater to children and adults.", "answer": "cater"},
        {"text": "This hotel can cater for large conferences.", "answer": "cater"},
        {"text": "The course caters to students with different needs.", "answer": "cater"},
    ],
    "caterer": [
        {"text": "The caterer delivered lunch to the office on time.", "answer": "caterer"},
        {"text": "They hired a caterer for the outdoor event.", "answer": "caterer"},
        {"text": "A local caterer prepared the wedding meal.", "answer": "caterer"},
    ],
    "caterpillar": [
        {"text": "A green caterpillar crawled across the leaf.", "answer": "caterpillar"},
        {"text": "The children watched the caterpillar change over time.", "answer": "caterpillar"},
        {"text": "The bird picked up a caterpillar from the branch.", "answer": "caterpillar"},
    ],
    "caution": [
        {"text": "Drivers should use caution on icy roads.", "answer": "caution"},
        {"text": "The sign advises visitors to proceed with caution.", "answer": "caution"},
        {"text": "She spoke with caution during the interview.", "answer": "caution"},
    ],
    "cautionary": [
        {"text": "The documentary offers a cautionary lesson about greed.", "answer": "cautionary"},
        {"text": "His story became a cautionary example for young athletes.", "answer": "cautionary"},
        {"text": "The article had a cautionary tone throughout.", "answer": "cautionary"},
    ],
    "cease": [
        {"text": "The factory will cease operations next month.", "answer": "cease"},
        {"text": "Rain finally ceased around midnight.", "answer": "cease"},
        {"text": "The company was ordered to cease selling the product.", "answer": "cease"},
    ],
    "ceaselessly": [
        {"text": "The baby cried ceaselessly through the night.", "answer": "ceaselessly"},
        {"text": "Waves beat ceaselessly against the rocks.", "answer": "ceaselessly"},
        {"text": "She worked ceaselessly to meet the deadline.", "answer": "ceaselessly"},
    ],
    "chaos": [
        {"text": "Traffic chaos followed the sudden road closure.", "answer": "chaos"},
        {"text": "The room was left in complete chaos.", "answer": "chaos"},
        {"text": "A power failure caused chaos at the airport.", "answer": "chaos"},
    ],
    "characterize": [
        {"text": "People often characterize the city as energetic and crowded.", "answer": "characterize"},
        {"text": "Patience and honesty characterize her teaching style.", "answer": "characterize"},
        {"text": "The report tries to characterize patterns in the data.", "answer": "characterize"},
    ],
    "charm": [
        {"text": "The old town still has plenty of charm.", "answer": "charm"},
        {"text": "He tried to charm the guests with jokes.", "answer": "charm"},
        {"text": "Its simple charm made the cafe memorable.", "answer": "charm"},
    ],
    "cheesy": [
        {"text": "The pasta had a rich and cheesy flavor.", "answer": "cheesy"},
        {"text": "The movie's ending felt a little cheesy.", "answer": "cheesy"},
        {"text": "She ordered a hot cheesy sandwich.", "answer": "cheesy"},
    ],
    "chiefly": [
        {"text": "The museum is visited chiefly by tourists.", "answer": "chiefly"},
        {"text": "The town relies chiefly on fishing and trade.", "answer": "chiefly"},
        {"text": "His concern was chiefly about cost.", "answer": "chiefly"},
    ],
    "childbearing": [
        {"text": "The report studied health issues related to childbearing.", "answer": "childbearing"},
        {"text": "Many policies affect women during childbearing years.", "answer": "childbearing"},
        {"text": "Doctors discussed the risks of late childbearing.", "answer": "childbearing"},
    ],
    "childishness": [
        {"text": "His childishness annoyed the rest of the group.", "answer": "childishness"},
        {"text": "The argument revealed a surprising level of childishness.", "answer": "childishness"},
        {"text": "She was too mature to tolerate such childishness.", "answer": "childishness"},
    ],
    "choke": [
        {"text": "The smoke made him choke for a few seconds.", "answer": "choke"},
        {"text": "Be careful not to choke on the small candy.", "answer": "choke"},
        {"text": "Weeds can choke the growth of young plants.", "answer": "choke"},
    ],
    "circulate": [
        {"text": "Fresh air should circulate through the building.", "answer": "circulate"},
        {"text": "Rumors began to circulate after the meeting.", "answer": "circulate"},
        {"text": "Please circulate the report to the whole team.", "answer": "circulate"},
    ],
    "civic": [
        {"text": "Schools should encourage civic responsibility.", "answer": "civic"},
        {"text": "The city hosted a civic celebration in the square.", "answer": "civic"},
        {"text": "Voting is an important civic duty.", "answer": "civic"},
    ],
    "clash": [
        {"text": "Their opinions began to clash during the debate.", "answer": "clash"},
        {"text": "The teams will clash again next weekend.", "answer": "clash"},
        {"text": "Bright colors can clash if used carelessly.", "answer": "clash"},
    ],
    "clay": [
        {"text": "The artist shaped the figure from wet clay.", "answer": "clay"},
        {"text": "Clay soil becomes heavy after rain.", "answer": "clay"},
        {"text": "Children made bowls out of clay in class.", "answer": "clay"},
    ],
    "cling": [
        {"text": "Wet clothes tend to cling to the skin.", "answer": "cling"},
        {"text": "Some traditions still cling to the village.", "answer": "cling"},
        {"text": "The smell of smoke can cling to fabric.", "answer": "cling"},
    ],
    "cling to": [
        {"text": "Some leaders still cling to outdated ideas.", "answer": "cling to"},
        {"text": "Children often cling to their parents in new places.", "answer": "cling to"},
        {"text": "He chose to cling to hope during the crisis.", "answer": "cling to"},
    ],
    "clinical": [
        {"text": "The report gives a clear clinical description of the illness.", "answer": "clinical"},
        {"text": "She completed her clinical training at the hospital.", "answer": "clinical"},
        {"text": "The doctor maintained a calm and clinical tone.", "answer": "clinical"},
    ],
    "clout": [
        {"text": "The group has enough political clout to influence policy.", "answer": "clout"},
        {"text": "Her fame gave her considerable clout online.", "answer": "clout"},
        {"text": "Money alone does not always guarantee clout.", "answer": "clout"},
    ],
    "clover": [
        {"text": "A patch of clover spread across the field.", "answer": "clover"},
        {"text": "The rabbit was eating fresh clover.", "answer": "clover"},
        {"text": "Some people believe a four-leaf clover brings luck.", "answer": "clover"},
    ],
    "cognitive": [
        {"text": "Sleep is essential for healthy cognitive development.", "answer": "cognitive"},
        {"text": "The game is designed to improve cognitive skills.", "answer": "cognitive"},
        {"text": "Stress can affect cognitive performance.", "answer": "cognitive"},
    ],
    "coincide": [
        {"text": "The festival will coincide with the school holiday.", "answer": "coincide"},
        {"text": "Their views happen to coincide on this issue.", "answer": "coincide"},
        {"text": "The release date may coincide with the opening ceremony.", "answer": "coincide"},
    ],
    "collaborate": [
        {"text": "The two universities agreed to collaborate on the study.", "answer": "collaborate"},
        {"text": "Artists often collaborate across different fields.", "answer": "collaborate"},
        {"text": "We need to collaborate more closely as a team.", "answer": "collaborate"},
    ],
    "collective": [
        {"text": "The project was a collective effort by the whole class.", "answer": "collective"},
        {"text": "The group reached a collective decision after discussion.", "answer": "collective"},
        {"text": "The museum displayed works from a local art collective.", "answer": "collective"},
    ],
    "collide": [
        {"text": "Two bikes collide easily on such a narrow path.", "answer": "collide"},
        {"text": "Their schedules collide almost every week.", "answer": "collide"},
        {"text": "Different values can collide in public debate.", "answer": "collide"},
    ],
    "collision": [
        {"text": "A collision on the highway caused a long delay.", "answer": "collision"},
        {"text": "The report examined the causes of the collision.", "answer": "collision"},
        {"text": "A bird strike led to a midair collision risk.", "answer": "collision"},
    ],
    "colonial": [
        {"text": "The city still has many colonial buildings.", "answer": "colonial"},
        {"text": "The exhibit explores colonial history in the region.", "answer": "colonial"},
        {"text": "They restored a colonial house near the harbor.", "answer": "colonial"},
    ],
    "columnist": [
        {"text": "The newspaper hired a new political columnist.", "answer": "columnist"},
        {"text": "A famous columnist wrote about the election.", "answer": "columnist"},
        {"text": "Readers often disagree with that columnist.", "answer": "columnist"},
    ],
    "comet": [
        {"text": "The comet was visible in the sky for several nights.", "answer": "comet"},
        {"text": "Children gathered outside to watch the comet pass.", "answer": "comet"},
        {"text": "The astronomer explained how a comet forms.", "answer": "comet"},
    ],
    "commentary": [
        {"text": "The match included live commentary from two experts.", "answer": "commentary"},
        {"text": "His article reads like social commentary.", "answer": "commentary"},
        {"text": "The documentary provides commentary on modern life.", "answer": "commentary"},
    ],
    "commentator": [
        {"text": "The commentator analyzed every key moment of the game.", "answer": "commentator"},
        {"text": "A well-known commentator hosted the debate.", "answer": "commentator"},
        {"text": "The commentator spoke clearly throughout the broadcast.", "answer": "commentator"},
    ],
    "commodifiable": [
        {"text": "Not every human experience should be treated as commodifiable.", "answer": "commodifiable"},
        {"text": "The essay questions whether art is fully commodifiable.", "answer": "commodifiable"},
        {"text": "Some argue that personal data has become commodifiable.", "answer": "commodifiable"},
    ],
    "communist": [
        {"text": "The book examines the rise of communist movements.", "answer": "communist"},
        {"text": "He studied communist theory at university.", "answer": "communist"},
        {"text": "The regime was often described as communist.", "answer": "communist"},
    ],
    "companion": [
        {"text": "The old dog had been his loyal companion for years.", "answer": "companion"},
        {"text": "She brought a travel companion on the long journey.", "answer": "companion"},
        {"text": "The app includes a companion guide for beginners.", "answer": "companion"},
    ],
    "comparatively": [
        {"text": "The test was comparatively easy this year.", "answer": "comparatively"},
        {"text": "Housing is comparatively cheap in that area.", "answer": "comparatively"},
        {"text": "The river is comparatively shallow in summer.", "answer": "comparatively"},
    ],
    "compel": [
        {"text": "The evidence may compel the court to reopen the case.", "answer": "compel"},
        {"text": "His honesty compelled respect from the audience.", "answer": "compel"},
        {"text": "A strong need to survive can compel action.", "answer": "compel"},
    ],
    "compensate": [
        {"text": "The company agreed to compensate the workers fairly.", "answer": "compensate"},
        {"text": "Exercise can compensate for long hours of sitting.", "answer": "compensate"},
        {"text": "We tried to compensate for the delay by leaving early.", "answer": "compensate"},
    ],
    "compensation": [
        {"text": "The court awarded compensation to the injured family.", "answer": "compensation"},
        {"text": "Employees received compensation for overtime work.", "answer": "compensation"},
        {"text": "No amount of compensation could replace the loss.", "answer": "compensation"},
    ],
    "compensatory": [
        {"text": "The policy includes compensatory support for weaker students.", "answer": "compensatory"},
        {"text": "Workers were given compensatory leave after the holiday shift.", "answer": "compensatory"},
        {"text": "The court discussed compensatory damages in the ruling.", "answer": "compensatory"},
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
