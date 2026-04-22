from __future__ import annotations

import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

SENTENCES = {
    "a cappella": [
        {"text": "The choir performed a cappella in the cathedral.", "answer": "a cappella"},
        {"text": "She prefers to sing a cappella without any instruments.", "answer": "a cappella"},
        {"text": "Their final song was sung a cappella and moved the audience deeply.", "answer": "a cappella"},
    ],
    "abseil": [
        {"text": "The rescue team had to abseil down the cliff.", "answer": "abseil"},
        {"text": "She learned to abseil safely during the outdoor course.", "answer": "abseil"},
        {"text": "Tourists watched firefighters abseil from the roof.", "answer": "abseil"},
    ],
    "accord": [
        {"text": "The two sides reached an accord after weeks of talks.", "answer": "accord"},
        {"text": "His story does not accord with the evidence.", "answer": "accord"},
        {"text": "The policy is in accord with international law.", "answer": "accord"},
    ],
    "admonitory": [
        {"text": "Her admonitory tone warned us not to repeat the mistake.", "answer": "admonitory"},
        {"text": "The sign carried an admonitory message about fire safety.", "answer": "admonitory"},
        {"text": "He gave the class an admonitory look before the test began.", "answer": "admonitory"},
    ],
    "africanize": [
        {"text": "Some artists tried to africanize imported styles with local themes.", "answer": "africanize"},
        {"text": "The movement aimed to africanize the school curriculum.", "answer": "africanize"},
        {"text": "Scholars debated whether the institution should africanize its policies.", "answer": "africanize"},
    ],
    "ala": [
        {"text": "They served the fish grilled, Mediterranean style, a la carte.", "answer": "ala"},
        {"text": "The designer created a Parisian look, ala the 1920s.", "answer": "ala"},
        {"text": "He ordered dinner ala carte instead of choosing a set menu.", "answer": "ala"},
    ],
    "alfresco": [
        {"text": "We ate alfresco under the garden lights.", "answer": "alfresco"},
        {"text": "The hotel offers alfresco dining by the sea.", "answer": "alfresco"},
        {"text": "They moved the party alfresco when the weather improved.", "answer": "alfresco"},
    ],
    "aloof": [
        {"text": "He seemed aloof at first, but he was actually shy.", "answer": "aloof"},
        {"text": "Her aloof manner made teamwork difficult.", "answer": "aloof"},
        {"text": "The actor stayed aloof from the media after the scandal.", "answer": "aloof"},
    ],
    "ambiguity": [
        {"text": "The ambiguity of the contract caused a legal dispute.", "answer": "ambiguity"},
        {"text": "Writers sometimes use ambiguity on purpose.", "answer": "ambiguity"},
        {"text": "There was no room for ambiguity in the instructions.", "answer": "ambiguity"},
    ],
    "ambiguous": [
        {"text": "His reply was too ambiguous to be useful.", "answer": "ambiguous"},
        {"text": "The law remains ambiguous in this area.", "answer": "ambiguous"},
        {"text": "She gave an ambiguous smile and changed the subject.", "answer": "ambiguous"},
    ],
    "ambush": [
        {"text": "The soldiers were caught in an ambush at dawn.", "answer": "ambush"},
        {"text": "The reporter tried to ambush the minister with questions.", "answer": "ambush"},
        {"text": "Hunters once used the forest path for an ambush.", "answer": "ambush"},
    ],
    "anaphylactic": [
        {"text": "He suffered an anaphylactic reaction after eating peanuts.", "answer": "anaphylactic"},
        {"text": "Doctors treated the patient for an anaphylactic shock.", "answer": "anaphylactic"},
        {"text": "People with severe allergies fear anaphylactic episodes.", "answer": "anaphylactic"},
    ],
    "anticipation": [
        {"text": "The audience waited in anticipation for the curtain to rise.", "answer": "anticipation"},
        {"text": "She packed in anticipation of a long delay.", "answer": "anticipation"},
        {"text": "The game was released to great anticipation worldwide.", "answer": "anticipation"},
    ],
    "apiarist": [
        {"text": "The apiarist checked the hives at sunrise.", "answer": "apiarist"},
        {"text": "An experienced apiarist taught us how to handle bees safely.", "answer": "apiarist"},
        {"text": "The village apiarist sells honey at the weekend market.", "answer": "apiarist"},
    ],
    "apocalypse": [
        {"text": "The film imagines life after an apocalypse.", "answer": "apocalypse"},
        {"text": "Some headlines described the storm as an apocalypse.", "answer": "apocalypse"},
        {"text": "The novel combines faith, fear, and apocalypse.", "answer": "apocalypse"},
    ],
    "apoplectic": [
        {"text": "He was apoplectic when he saw the damage to his car.", "answer": "apoplectic"},
        {"text": "The coach looked apoplectic after the final goal.", "answer": "apoplectic"},
        {"text": "Her apoplectic reaction surprised everyone in the office.", "answer": "apoplectic"},
    ],
    "arboreal": [
        {"text": "Koalas are arboreal animals that spend most of their lives in trees.", "answer": "arboreal"},
        {"text": "The reserve protects several rare arboreal species.", "answer": "arboreal"},
        {"text": "Scientists studied the arboreal habits of the monkeys.", "answer": "arboreal"},
    ],
    "arcane": [
        {"text": "The manual was full of arcane technical terms.", "answer": "arcane"},
        {"text": "Only a few experts understood the arcane system.", "answer": "arcane"},
        {"text": "He enjoys reading about arcane rituals and symbols.", "answer": "arcane"},
    ],
    "attest": [
        {"text": "Witnesses can attest to her honesty.", "answer": "attest"},
        {"text": "These records attest to the age of the building.", "answer": "attest"},
        {"text": "Many teachers attest that the new method works.", "answer": "attest"},
    ],
    "auditorium": [
        {"text": "The school auditorium was full for the concert.", "answer": "auditorium"},
        {"text": "Please meet me outside the main auditorium.", "answer": "auditorium"},
        {"text": "The speaker walked onto the stage in the dark auditorium.", "answer": "auditorium"},
    ],
    "authoritarian": [
        {"text": "The novel describes life under an authoritarian regime.", "answer": "authoritarian"},
        {"text": "His parenting style is too authoritarian for modern families.", "answer": "authoritarian"},
        {"text": "Students resisted the school's authoritarian rules.", "answer": "authoritarian"},
    ],
    "autopsy": [
        {"text": "The doctor ordered an autopsy to confirm the cause of death.", "answer": "autopsy"},
        {"text": "The report included the results of the autopsy.", "answer": "autopsy"},
        {"text": "Police waited for the autopsy before making a statement.", "answer": "autopsy"},
    ],
    "avert": [
        {"text": "Quick action helped avert a disaster.", "answer": "avert"},
        {"text": "She averted her eyes when the lights came on.", "answer": "avert"},
        {"text": "Leaders met to avert a wider conflict.", "answer": "avert"},
    ],
    "awesome": [
        {"text": "The waterfall was an awesome sight in the morning sun.", "answer": "awesome"},
        {"text": "He did an awesome job on the design project.", "answer": "awesome"},
        {"text": "The mountain range looked awesome from the plane.", "answer": "awesome"},
    ],
    "banal": [
        {"text": "The speech was full of banal phrases.", "answer": "banal"},
        {"text": "Critics dismissed the film as banal and predictable.", "answer": "banal"},
        {"text": "He turned a banal topic into an interesting essay.", "answer": "banal"},
    ],
    "bandwagon": [
        {"text": "Many brands jumped on the eco-friendly bandwagon.", "answer": "bandwagon"},
        {"text": "She refused to join the bandwagon just to fit in.", "answer": "bandwagon"},
        {"text": "Investors often rush onto the bandwagon too late.", "answer": "bandwagon"},
    ],
    "banyan": [
        {"text": "The village square was shaded by a huge banyan tree.", "answer": "banyan"},
        {"text": "Children played beneath the roots of the banyan.", "answer": "banyan"},
        {"text": "The banyan spread across almost the entire garden.", "answer": "banyan"},
    ],
    "barb": [
        {"text": "His joke contained a barb aimed at the manager.", "answer": "barb"},
        {"text": "The hook had a sharp barb that caught in the net.", "answer": "barb"},
        {"text": "She ignored the little barb hidden in his compliment.", "answer": "barb"},
    ],
    "barge": [
        {"text": "A heavy barge moved slowly along the river.", "answer": "barge"},
        {"text": "You cannot just barge into my office without knocking.", "answer": "barge"},
        {"text": "The workers loaded sand onto the barge.", "answer": "barge"},
    ],
    "bazseedling": [
        {"text": "The gardener protected each bazseedling from heavy rain.", "answer": "bazseedling"},
        {"text": "A single bazseedling pushed through the dark soil.", "answer": "bazseedling"},
        {"text": "They moved the fragile bazseedling into a warmer tray.", "answer": "bazseedling"},
    ],
    "beehive": [
        {"text": "We watched the beekeeper open the beehive carefully.", "answer": "beehive"},
        {"text": "The old tree contained a wild beehive.", "answer": "beehive"},
        {"text": "Honey was dripping from the damaged beehive.", "answer": "beehive"},
    ],
    "belie": [
        {"text": "His calm voice belied his fear.", "answer": "belie"},
        {"text": "The cheerful colors belie the sadness of the story.", "answer": "belie"},
        {"text": "Her smile belied the pain she was feeling.", "answer": "belie"},
    ],
    "benign": [
        {"text": "The doctor confirmed that the tumor was benign.", "answer": "benign"},
        {"text": "At first, the weather looked benign and pleasant.", "answer": "benign"},
        {"text": "He gave me a benign smile before leaving.", "answer": "benign"},
    ],
    "bereavement": [
        {"text": "She took bereavement leave after her father's death.", "answer": "bereavement"},
        {"text": "Counseling can help people deal with bereavement.", "answer": "bereavement"},
        {"text": "The group supports families through grief and bereavement.", "answer": "bereavement"},
    ],
    "berserk": [
        {"text": "The crowd went berserk after the winning goal.", "answer": "berserk"},
        {"text": "He was afraid the machine would go berserk again.", "answer": "berserk"},
        {"text": "The tabloids claimed she went berserk in the restaurant.", "answer": "berserk"},
    ],
    "bicker": [
        {"text": "The brothers still bicker about money.", "answer": "bicker"},
        {"text": "Small teams often bicker under pressure.", "answer": "bicker"},
        {"text": "They continued to bicker through the entire drive.", "answer": "bicker"},
    ],
    "bile": [
        {"text": "The article was filled with bile and anger.", "answer": "bile"},
        {"text": "Doctors examined the patient's bile levels.", "answer": "bile"},
        {"text": "He spoke with obvious bile about his former partners.", "answer": "bile"},
    ],
    "billow": [
        {"text": "Smoke began to billow from the warehouse roof.", "answer": "billow"},
        {"text": "Her dress billowed in the sea breeze.", "answer": "billow"},
        {"text": "Dark clouds billowed across the horizon.", "answer": "billow"},
    ],
    "blare": [
        {"text": "Music continued to blare from the next apartment.", "answer": "blare"},
        {"text": "The alarm began to blare at midnight.", "answer": "blare"},
        {"text": "Car horns blared in the traffic jam.", "answer": "blare"},
    ],
    "bleak": [
        {"text": "The future looked bleak after the factory closed.", "answer": "bleak"},
        {"text": "They crossed a bleak stretch of empty land.", "answer": "bleak"},
        {"text": "His report offered a bleak view of the economy.", "answer": "bleak"},
    ],
    "bloke": [
        {"text": "He seemed like a friendly bloke from the neighborhood.", "answer": "bloke"},
        {"text": "That bloke by the door asked for you earlier.", "answer": "bloke"},
        {"text": "The old bloke at the shop remembers everyone by name.", "answer": "bloke"},
    ],
    "boatload": [
        {"text": "The company made a boatload of money from the deal.", "answer": "boatload"},
        {"text": "We carried in a boatload of supplies before the storm.", "answer": "boatload"},
        {"text": "He bought a boatload of books at the market.", "answer": "boatload"},
    ],
    "bodacious": [
        {"text": "She made a bodacious entrance in a bright red coat.", "answer": "bodacious"},
        {"text": "The chef created a bodacious dessert with impossible amounts of cream.", "answer": "bodacious"},
        {"text": "It was a bodacious plan, but somehow it worked.", "answer": "bodacious"},
    ],
    "botchers": [
        {"text": "The critics called them botchers after the failed repair job.", "answer": "botchers"},
        {"text": "Only botchers would leave wiring exposed like that.", "answer": "botchers"},
        {"text": "The article mocked the botchers who ruined the restoration.", "answer": "botchers"},
    ],
    "bracken": [
        {"text": "Bracken covered the hillside after the rain.", "answer": "bracken"},
        {"text": "The path disappeared under thick bracken.", "answer": "bracken"},
        {"text": "They pushed through wet bracken to reach the stream.", "answer": "bracken"},
    ],
    "brigade": [
        {"text": "A fire brigade arrived within minutes.", "answer": "brigade"},
        {"text": "The volunteer brigade helped clear the fallen trees.", "answer": "brigade"},
        {"text": "A medical brigade was sent to the disaster zone.", "answer": "brigade"},
    ],
    "bristle": [
        {"text": "He tends to bristle at even mild criticism.", "answer": "bristle"},
        {"text": "The brush had stiff bristles made of wire.", "answer": "bristle"},
        {"text": "She saw his beard bristle when he got angry.", "answer": "bristle"},
    ],
    "bronze": [
        {"text": "The athlete won a bronze medal in the final.", "answer": "bronze"},
        {"text": "They restored an old bronze statue in the square.", "answer": "bronze"},
        {"text": "His skin turned bronze after a week in the sun.", "answer": "bronze"},
    ],
    "burrow": [
        {"text": "The rabbit disappeared into its burrow.", "answer": "burrow"},
        {"text": "Some animals burrow underground for safety.", "answer": "burrow"},
        {"text": "The child liked to burrow under the blankets.", "answer": "burrow"},
    ],
    "buzz": [
        {"text": "There was a buzz of excitement before the announcement.", "answer": "buzz"},
        {"text": "My phone began to buzz during the lecture.", "answer": "buzz"},
        {"text": "Bees buzzed around the flowers all afternoon.", "answer": "buzz"},
    ],
    "calamity": [
        {"text": "The flood was a calamity for the farming town.", "answer": "calamity"},
        {"text": "They feared the drought would become a national calamity.", "answer": "calamity"},
        {"text": "His careless remark triggered a small social calamity.", "answer": "calamity"},
    ],
    "calibrate": [
        {"text": "Engineers calibrate the machine every morning.", "answer": "calibrate"},
        {"text": "You should calibrate the scale before using it.", "answer": "calibrate"},
        {"text": "The lab technician carefully calibrated each instrument.", "answer": "calibrate"},
    ],
    "callus": [
        {"text": "Years of guitar practice left a callus on his finger.", "answer": "callus"},
        {"text": "The doctor said the thick skin was only a callus.", "answer": "callus"},
        {"text": "A painful callus formed on her heel.", "answer": "callus"},
    ],
    "cannibalize": [
        {"text": "The firm feared the new phone would cannibalize sales of the old model.", "answer": "cannibalize"},
        {"text": "Mechanics cannibalized one engine to repair another.", "answer": "cannibalize"},
        {"text": "The larger chain began to cannibalize its own market.", "answer": "cannibalize"},
    ],
    "canon": [
        {"text": "The novel is now part of the literary canon.", "answer": "canon"},
        {"text": "The museum questions who gets included in the artistic canon.", "answer": "canon"},
        {"text": "Fans argue about whether the film is canon.", "answer": "canon"},
    ],
    "canopy": [
        {"text": "The hikers rested under the forest canopy.", "answer": "canopy"},
        {"text": "A glass canopy covered the entrance.", "answer": "canopy"},
        {"text": "Birds nested high in the tropical canopy.", "answer": "canopy"},
    ],
    "catastrophe": [
        {"text": "The oil spill was an environmental catastrophe.", "answer": "catastrophe"},
        {"text": "Doctors acted fast to avert a catastrophe.", "answer": "catastrophe"},
        {"text": "The book explores how one error became a catastrophe.", "answer": "catastrophe"},
    ],
    "celestial": [
        {"text": "Ancient sailors navigated by celestial bodies.", "answer": "celestial"},
        {"text": "The painting showed a celestial scene above the clouds.", "answer": "celestial"},
        {"text": "They studied celestial motion in the observatory.", "answer": "celestial"},
    ],
    "chariot": [
        {"text": "The hero rode into battle on a golden chariot.", "answer": "chariot"},
        {"text": "The museum displayed an ancient ceremonial chariot.", "answer": "chariot"},
        {"text": "The film's opening scene featured a racing chariot.", "answer": "chariot"},
    ],
    "chasten": [
        {"text": "The defeat seemed to chasten the entire team.", "answer": "chasten"},
        {"text": "Experience may chasten even the most arrogant leader.", "answer": "chasten"},
        {"text": "He was chastened by the public criticism.", "answer": "chasten"},
    ],
    "cherub": [
        {"text": "The ceiling was painted with tiny cherubs.", "answer": "cherub"},
        {"text": "The baby looked like a little cherub in the photo.", "answer": "cherub"},
        {"text": "A marble cherub stood beside the fountain.", "answer": "cherub"},
    ],
    "chide": [
        {"text": "She gently chided him for being late again.", "answer": "chide"},
        {"text": "Teachers should correct, not publicly chide, their students.", "answer": "chide"},
        {"text": "He was chided for wasting company resources.", "answer": "chide"},
    ],
    "chime": [
        {"text": "The church bells began to chime at noon.", "answer": "chime"},
        {"text": "Your idea chimes with what I was thinking.", "answer": "chime"},
        {"text": "A soft chime announced the elevator's arrival.", "answer": "chime"},
    ],
    "chink": [
        {"text": "Sunlight came through a chink in the wall.", "answer": "chink"},
        {"text": "They spotted a chink in the opponent's defense.", "answer": "chink"},
        {"text": "A tiny chink of light appeared under the door.", "answer": "chink"},
    ],
    "chuff": [
        {"text": "The old train began to chuff away from the station.", "answer": "chuff"},
        {"text": "He sounded quite chuffed with his exam result.", "answer": "chuff"},
        {"text": "Steam engines used to chuff through the valley.", "answer": "chuff"},
    ],
    "chum": [
        {"text": "He brought his old school chum to the reunion.", "answer": "chum"},
        {"text": "The fishermen used chum to attract larger fish.", "answer": "chum"},
        {"text": "She still meets her college chum every summer.", "answer": "chum"},
    ],
    "churn": [
        {"text": "The sea began to churn before the storm hit.", "answer": "churn"},
        {"text": "The company churns out cheap products every month.", "answer": "churn"},
        {"text": "Her stomach churned with anxiety before the speech.", "answer": "churn"},
    ],
    "clang": [
        {"text": "A loud clang came from the factory floor.", "answer": "clang"},
        {"text": "The gate shut with a heavy clang.", "answer": "clang"},
        {"text": "We heard metal pipes clang in the wind.", "answer": "clang"},
    ],
    "claustrophobic": [
        {"text": "The tiny room made him feel claustrophobic.", "answer": "claustrophobic"},
        {"text": "I avoid crowded lifts because they feel claustrophobic.", "answer": "claustrophobic"},
        {"text": "The tunnel looked dark and claustrophobic.", "answer": "claustrophobic"},
    ],
    "clincher": [
        {"text": "Her final argument was the clincher in the debate.", "answer": "clincher"},
        {"text": "The price reduction proved to be the clincher.", "answer": "clincher"},
        {"text": "One decisive statistic was the clincher for the jury.", "answer": "clincher"},
    ],
    "clog": [
        {"text": "Hair can clog the bathroom drain.", "answer": "clog"},
        {"text": "Traffic quickly clogged the main road.", "answer": "clog"},
        {"text": "Wet leaves clogged the gutters after the storm.", "answer": "clog"},
    ],
    "coerce": [
        {"text": "No one should coerce staff into unpaid work.", "answer": "coerce"},
        {"text": "The gang tried to coerce him into silence.", "answer": "coerce"},
        {"text": "Threats were used to coerce witnesses.", "answer": "coerce"},
    ],
    "collate": [
        {"text": "Please collate the survey results before the meeting.", "answer": "collate"},
        {"text": "The editor collated several versions of the manuscript.", "answer": "collate"},
        {"text": "Researchers collated the data into one report.", "answer": "collate"},
    ],
    "commotion": [
        {"text": "A loud commotion broke out near the stage.", "answer": "commotion"},
        {"text": "We heard a commotion outside and ran to the window.", "answer": "commotion"},
        {"text": "The sudden arrival of reporters caused a commotion.", "answer": "commotion"},
    ],
    "complimentary": [
        {"text": "Guests receive a complimentary drink on arrival.", "answer": "complimentary"},
        {"text": "She was highly complimentary about the new exhibition.", "answer": "complimentary"},
        {"text": "The hotel offered complimentary breakfast to all visitors.", "answer": "complimentary"},
    ],
    "conduit": [
        {"text": "The charity acts as a conduit for donated funds.", "answer": "conduit"},
        {"text": "Water flows through a concrete conduit below the road.", "answer": "conduit"},
        {"text": "The app became a conduit for false information.", "answer": "conduit"},
    ],
    "confucian": [
        {"text": "The scholar specialized in Confucian philosophy.", "answer": "confucian"},
        {"text": "Some schools still reflect Confucian values.", "answer": "confucian"},
        {"text": "The book compares Confucian and Western traditions.", "answer": "confucian"},
    ],
    "consortium": [
        {"text": "A consortium of firms funded the new project.", "answer": "consortium"},
        {"text": "The university joined an international research consortium.", "answer": "consortium"},
        {"text": "The airport deal was signed by a banking consortium.", "answer": "consortium"},
    ],
    "conspicuous": [
        {"text": "She wore a conspicuous hat at the ceremony.", "answer": "conspicuous"},
        {"text": "His absence was conspicuous during the meeting.", "answer": "conspicuous"},
        {"text": "There was a conspicuous lack of detail in the report.", "answer": "conspicuous"},
    ],
    "contradictory": [
        {"text": "The witness gave contradictory statements.", "answer": "contradictory"},
        {"text": "Their goals seem contradictory but can be balanced.", "answer": "contradictory"},
        {"text": "The article sounded contradictory from start to finish.", "answer": "contradictory"},
    ],
    "coral": [
        {"text": "Rising sea temperatures threaten coral reefs.", "answer": "coral"},
        {"text": "The diver photographed bright coral underwater.", "answer": "coral"},
        {"text": "Broken coral washed up on the beach after the storm.", "answer": "coral"},
    ],
    "counterfactual": [
        {"text": "The essay explored a counterfactual version of history.", "answer": "counterfactual"},
        {"text": "Counterfactual thinking can help people reflect on decisions.", "answer": "counterfactual"},
        {"text": "The novelist built an entire counterfactual world around one change.", "answer": "counterfactual"},
    ],
    "crackdown": [
        {"text": "The government announced a crackdown on illegal dumping.", "answer": "crackdown"},
        {"text": "A police crackdown followed the rise in street crime.", "answer": "crackdown"},
        {"text": "Activists feared a crackdown on public protests.", "answer": "crackdown"},
    ],
    "cram": [
        {"text": "Students should not cram the night before an exam.", "answer": "cram"},
        {"text": "They tried to cram too many topics into one lesson.", "answer": "cram"},
        {"text": "We had to cram into the last train home.", "answer": "cram"},
    ],
    "crane": [
        {"text": "A crane lifted the steel beam into place.", "answer": "crane"},
        {"text": "He craned his neck to see over the crowd.", "answer": "crane"},
        {"text": "A white crane stood motionless by the lake.", "answer": "crane"},
    ],
    "crank": [
        {"text": "The old radio was powered by a hand crank.", "answer": "crank"},
        {"text": "He sounded like a crank, but some of his points were valid.", "answer": "crank"},
        {"text": "Turn the crank slowly to raise the flag.", "answer": "crank"},
    ],
    "crave": [
        {"text": "After the hike, we all craved cold water.", "answer": "crave"},
        {"text": "Some people crave attention more than success.", "answer": "crave"},
        {"text": "She craved a quiet life far from the city.", "answer": "crave"},
    ],
    "credence": [
        {"text": "At first, few people gave credence to the rumor.", "answer": "credence"},
        {"text": "The evidence lends credence to her account.", "answer": "credence"},
        {"text": "No serious historian gives credence to that myth.", "answer": "credence"},
    ],
    "credulously": [
        {"text": "He listened credulously to the scammer's story.", "answer": "credulously"},
        {"text": "The child looked up credulously and asked another question.", "answer": "credulously"},
        {"text": "Voters should not accept such promises credulously.", "answer": "credulously"},
    ],
    "crimson": [
        {"text": "The sunset turned the sky crimson.", "answer": "crimson"},
        {"text": "She wore a crimson scarf in winter.", "answer": "crimson"},
        {"text": "The leaves became crimson in late autumn.", "answer": "crimson"},
    ],
    "crisp": [
        {"text": "The autumn air felt cold and crisp.", "answer": "crisp"},
        {"text": "The waiter served crisp salad with the meal.", "answer": "crisp"},
        {"text": "Her answer was crisp and confident.", "answer": "crisp"},
    ],
    "critter": [
        {"text": "Some strange little critter had eaten the tomatoes.", "answer": "critter"},
        {"text": "The kids found a furry critter under the deck.", "answer": "critter"},
        {"text": "Every critter in the forest seemed active at dusk.", "answer": "critter"},
    ],
    "crucible": [
        {"text": "War became a crucible that shaped his character.", "answer": "crucible"},
        {"text": "The metal was heated in a crucible.", "answer": "crucible"},
        {"text": "The city was a crucible of political change.", "answer": "crucible"},
    ],
    "crumble": [
        {"text": "The old wall began to crumble after years of rain.", "answer": "crumble"},
        {"text": "She watched the cookie crumble in her hand.", "answer": "crumble"},
        {"text": "His confidence started to crumble under pressure.", "answer": "crumble"},
    ],
    "culmination": [
        {"text": "The exhibition was the culmination of five years of work.", "answer": "culmination"},
        {"text": "Their victory marked the culmination of a long campaign.", "answer": "culmination"},
        {"text": "The book feels like the culmination of his ideas.", "answer": "culmination"},
    ],
    "curbside": [
        {"text": "Customers can pick up orders at the curbside counter.", "answer": "curbside"},
        {"text": "The driver stopped at the curbside for a moment.", "answer": "curbside"},
        {"text": "Curbside collection reduced waiting times in the city.", "answer": "curbside"},
    ],
    "daft": [
        {"text": "It would be daft to ignore such clear evidence.", "answer": "daft"},
        {"text": "He made a daft joke at the wrong moment.", "answer": "daft"},
        {"text": "Buying it twice would be completely daft.", "answer": "daft"},
    ],
    "dazzle": [
        {"text": "The bright lights can dazzle drivers at night.", "answer": "dazzle"},
        {"text": "She managed to dazzle the judges with her final performance.", "answer": "dazzle"},
        {"text": "The jewelry shop was designed to dazzle passers-by.", "answer": "dazzle"},
    ],
    "debunker": [
        {"text": "A well-known debunker exposed the viral hoax.", "answer": "debunker"},
        {"text": "The book made him popular as a myth debunker.", "answer": "debunker"},
        {"text": "Online debunkers quickly challenged the false claim.", "answer": "debunker"},
    ],
    "deception": [
        {"text": "The case involved years of deliberate deception.", "answer": "deception"},
        {"text": "She was hurt by the deception more than the loss.", "answer": "deception"},
        {"text": "Magic shows rely on skillful deception.", "answer": "deception"},
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
