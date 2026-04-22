from __future__ import annotations

import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

SENTENCES = {
    "decongest": [
        {"text": "City planners hope the new rail line will decongest the roads.", "answer": "decongest"},
        {"text": "Doctors gave him medicine to decongest his blocked nose.", "answer": "decongest"},
        {"text": "The policy aims to decongest the overcrowded district.", "answer": "decongest"},
    ],
    "deepen": [
        {"text": "The crisis may deepen if leaders fail to act quickly.", "answer": "deepen"},
        {"text": "They want to deepen economic ties between the two cities.", "answer": "deepen"},
        {"text": "The river seemed to deepen after the heavy rain.", "answer": "deepen"},
    ],
    "deface": [
        {"text": "Someone tried to deface the statue with spray paint.", "answer": "deface"},
        {"text": "It is illegal to deface public property.", "answer": "deface"},
        {"text": "The mural was defaced only days after it was completed.", "answer": "deface"},
    ],
    "defecate": [
        {"text": "Pets should be trained not to defecate indoors.", "answer": "defecate"},
        {"text": "Doctors asked whether the patient could defecate normally.", "answer": "defecate"},
        {"text": "Wild animals often defecate far from their resting place.", "answer": "defecate"},
    ],
    "definitive": [
        {"text": "This biography is considered the definitive account of her life.", "answer": "definitive"},
        {"text": "Scientists still lack a definitive answer to the problem.", "answer": "definitive"},
        {"text": "The museum published a definitive guide to the collection.", "answer": "definitive"},
    ],
    "deity": [
        {"text": "The temple is dedicated to a local deity.", "answer": "deity"},
        {"text": "Ancient cultures often worshipped a sun deity.", "answer": "deity"},
        {"text": "The statue represented a protective deity.", "answer": "deity"},
    ],
    "delusion": [
        {"text": "He lived under the delusion that nobody could defeat him.", "answer": "delusion"},
        {"text": "The novel explores the line between hope and delusion.", "answer": "delusion"},
        {"text": "Her belief that fame would solve everything was a delusion.", "answer": "delusion"},
    ],
    "demolition": [
        {"text": "The old stadium is scheduled for demolition next month.", "answer": "demolition"},
        {"text": "Residents protested against the demolition of the historic block.", "answer": "demolition"},
        {"text": "Heavy machinery arrived before the demolition began.", "answer": "demolition"},
    ],
    "deprave": [
        {"text": "Some critics argued that violent media could deprave young minds.", "answer": "deprave"},
        {"text": "The novel warns how unchecked power can deprave a leader.", "answer": "deprave"},
        {"text": "They feared greed would deprave the original mission.", "answer": "deprave"},
    ],
    "desist": [
        {"text": "The lawyer ordered the company to desist immediately.", "answer": "desist"},
        {"text": "They refused to desist from the protest.", "answer": "desist"},
        {"text": "He was warned to desist from contacting the witness.", "answer": "desist"},
    ],
    "desperation": [
        {"text": "In desperation, she sold her jewelry to pay the rent.", "answer": "desperation"},
        {"text": "His voice revealed a hint of desperation.", "answer": "desperation"},
        {"text": "The move was made out of desperation rather than strategy.", "answer": "desperation"},
    ],
    "destine": [
        {"text": "Many believed hardship would destine him for failure.", "answer": "destine"},
        {"text": "No one can say what will destine a person for greatness.", "answer": "destine"},
        {"text": "The scholarship may destine her for a very different future.", "answer": "destine"},
    ],
    "destructibility": [
        {"text": "Engineers tested the destructibility of the material under heat.", "answer": "destructibility"},
        {"text": "The design reduced the destructibility of the shelter.", "answer": "destructibility"},
        {"text": "Scientists studied the destructibility of plastics in seawater.", "answer": "destructibility"},
    ],
    "developer": [
        {"text": "The app developer released a major update this week.", "answer": "developer"},
        {"text": "Property developers showed interest in the abandoned site.", "answer": "developer"},
        {"text": "The developer promised to fix the bug quickly.", "answer": "developer"},
    ],
    "dharma": [
        {"text": "The monk gave a talk on dharma in the temple hall.", "answer": "dharma"},
        {"text": "She studies dharma as part of Buddhist philosophy.", "answer": "dharma"},
        {"text": "The retreat focused on meditation and dharma practice.", "answer": "dharma"},
    ],
    "dice": [
        {"text": "The chef likes to dice onions very finely.", "answer": "dice"},
        {"text": "They used a pair of dice to decide who would start.", "answer": "dice"},
        {"text": "Please dice the tomatoes before adding them to the salad.", "answer": "dice"},
    ],
    "dichotomy": [
        {"text": "The essay challenges the false dichotomy between art and science.", "answer": "dichotomy"},
        {"text": "There is a growing dichotomy between rich and poor neighborhoods.", "answer": "dichotomy"},
        {"text": "The speaker described a sharp dichotomy in public opinion.", "answer": "dichotomy"},
    ],
    "dictatorial": [
        {"text": "His dictatorial style upset the rest of the staff.", "answer": "dictatorial"},
        {"text": "The country was ruled by a dictatorial regime.", "answer": "dictatorial"},
        {"text": "She rejected the principal's dictatorial approach.", "answer": "dictatorial"},
    ],
    "didactic": [
        {"text": "Some readers found the novel too didactic.", "answer": "didactic"},
        {"text": "The film becomes didactic whenever it explains its lesson too clearly.", "answer": "didactic"},
        {"text": "His didactic tone annoyed the audience.", "answer": "didactic"},
    ],
    "dim": [
        {"text": "The lights grew dim as the show began.", "answer": "dim"},
        {"text": "He has only a dim memory of that summer.", "answer": "dim"},
        {"text": "The candle gave a dim glow in the hallway.", "answer": "dim"},
    ],
    "din": [
        {"text": "We could barely talk above the din of traffic.", "answer": "din"},
        {"text": "The children created a cheerful din in the hall.", "answer": "din"},
        {"text": "The sudden din from the crowd startled the speaker.", "answer": "din"},
    ],
    "dioxide": [
        {"text": "Plants absorb carbon dioxide from the air.", "answer": "dioxide"},
        {"text": "The machine was designed to reduce sulfur dioxide emissions.", "answer": "dioxide"},
        {"text": "Scientists measured the level of carbon dioxide in the room.", "answer": "dioxide"},
    ],
    "disaffection": [
        {"text": "Rising prices led to public disaffection with the government.", "answer": "disaffection"},
        {"text": "Youth disaffection can grow when opportunities disappear.", "answer": "disaffection"},
        {"text": "The article explores political disaffection among voters.", "answer": "disaffection"},
    ],
    "discernible": [
        {"text": "There was no discernible difference between the two samples.", "answer": "discernible"},
        {"text": "A discernible pattern began to emerge from the data.", "answer": "discernible"},
        {"text": "The building suffered only slight but discernible damage.", "answer": "discernible"},
    ],
    "dismantle": [
        {"text": "Workers began to dismantle the old stage after the concert.", "answer": "dismantle"},
        {"text": "The policy aims to dismantle unfair barriers in the system.", "answer": "dismantle"},
        {"text": "He learned how to dismantle and rebuild a bicycle.", "answer": "dismantle"},
    ],
    "disruptive": [
        {"text": "The teacher had to remove a disruptive student from the room.", "answer": "disruptive"},
        {"text": "New technology can be highly disruptive to old industries.", "answer": "disruptive"},
        {"text": "The storm caused disruptive delays across the network.", "answer": "disruptive"},
    ],
    "dissociate": [
        {"text": "She tried to dissociate herself from the rumor.", "answer": "dissociate"},
        {"text": "Some people dissociate during moments of extreme stress.", "answer": "dissociate"},
        {"text": "The brand wants to dissociate its image from cheap fashion.", "answer": "dissociate"},
    ],
    "dullard": [
        {"text": "The villain mocked everyone else as a dullard.", "answer": "dullard"},
        {"text": "He feared being seen as a dullard in class.", "answer": "dullard"},
        {"text": "The play turns the supposed dullard into the wisest character.", "answer": "dullard"},
    ],
    "dystopia": [
        {"text": "The novel imagines a bleak dystopia controlled by machines.", "answer": "dystopia"},
        {"text": "Many films portray climate collapse as a future dystopia.", "answer": "dystopia"},
        {"text": "The city in the game feels like a neon dystopia.", "answer": "dystopia"},
    ],
    "dystopian": [
        {"text": "The series has a dark dystopian atmosphere.", "answer": "dystopian"},
        {"text": "Students compared dystopian fiction in the literature class.", "answer": "dystopian"},
        {"text": "The artist painted a dystopian vision of urban life.", "answer": "dystopian"},
    ],
    "eclectic": [
        {"text": "Her taste in music is wonderfully eclectic.", "answer": "eclectic"},
        {"text": "The restaurant offers an eclectic mix of dishes.", "answer": "eclectic"},
        {"text": "His library reflects an eclectic range of interests.", "answer": "eclectic"},
    ],
    "elasticated": [
        {"text": "The trousers have an elasticated waist for comfort.", "answer": "elasticated"},
        {"text": "She packed an elasticated bandage for the hike.", "answer": "elasticated"},
        {"text": "The costume included elasticated sleeves.", "answer": "elasticated"},
    ],
    "elder": [
        {"text": "The village elder spoke first at the ceremony.", "answer": "elder"},
        {"text": "We should respect our elder relatives.", "answer": "elder"},
        {"text": "An elder member of the group offered advice.", "answer": "elder"},
    ],
    "elimination": [
        {"text": "The elimination of waste became a key target.", "answer": "elimination"},
        {"text": "The team faced elimination after losing the first match.", "answer": "elimination"},
        {"text": "Early screening helps the elimination of preventable diseases.", "answer": "elimination"},
    ],
    "embarrass": [
        {"text": "Please do not embarrass him in front of the guests.", "answer": "embarrass"},
        {"text": "Parents sometimes embarrass teenagers without meaning to.", "answer": "embarrass"},
        {"text": "The joke was intended to embarrass the minister.", "answer": "embarrass"},
    ],
    "embellish": [
        {"text": "She tends to embellish her travel stories.", "answer": "embellish"},
        {"text": "The designer chose to embellish the dress with beads.", "answer": "embellish"},
        {"text": "You should not embellish the facts in an official report.", "answer": "embellish"},
    ],
    "embolden": [
        {"text": "The early success may embolden the company to expand faster.", "answer": "embolden"},
        {"text": "Online support emboldened her to speak publicly.", "answer": "embolden"},
        {"text": "A weak response can embolden further attacks.", "answer": "embolden"},
    ],
    "emit": [
        {"text": "The device can emit a warning signal when overheating.", "answer": "emit"},
        {"text": "Cars emit harmful gases into the air.", "answer": "emit"},
        {"text": "The flower emits a strong scent at night.", "answer": "emit"},
    ],
    "enchant": [
        {"text": "The old castle continues to enchant visitors.", "answer": "enchant"},
        {"text": "Her voice can enchant even a restless audience.", "answer": "enchant"},
        {"text": "The forest path seemed to enchant the children.", "answer": "enchant"},
    ],
    "enclave": [
        {"text": "The neighborhood became an artistic enclave.", "answer": "enclave"},
        {"text": "They visited a small mountain enclave cut off by snow.", "answer": "enclave"},
        {"text": "A wealthy enclave grew along the coastline.", "answer": "enclave"},
    ],
    "encode": [
        {"text": "The software can encode video in several formats.", "answer": "encode"},
        {"text": "DNA helps encode genetic information.", "answer": "encode"},
        {"text": "The message was encoded to keep it secret.", "answer": "encode"},
    ],
    "endemic": [
        {"text": "The disease is endemic in some tropical regions.", "answer": "endemic"},
        {"text": "Corruption had become endemic in the system.", "answer": "endemic"},
        {"text": "Several plants are endemic to the island.", "answer": "endemic"},
    ],
    "enliven": [
        {"text": "Fresh flowers can enliven a dull room.", "answer": "enliven"},
        {"text": "The singer's jokes helped enliven the evening.", "answer": "enliven"},
        {"text": "They used bright colors to enliven the design.", "answer": "enliven"},
    ],
    "entail": [
        {"text": "The job may entail frequent travel abroad.", "answer": "entail"},
        {"text": "Such a decision would entail serious risks.", "answer": "entail"},
        {"text": "Success often entails long hours of practice.", "answer": "entail"},
    ],
    "enthuse": [
        {"text": "He tends to enthuse about every new gadget.", "answer": "enthuse"},
        {"text": "Teachers should enthuse students about reading.", "answer": "enthuse"},
        {"text": "Fans enthused over the band's surprise return.", "answer": "enthuse"},
    ],
    "entrails": [
        {"text": "The hunters removed the entrails before cooking the animal.", "answer": "entrails"},
        {"text": "The film showed the entrails of the machine as it opened.", "answer": "entrails"},
        {"text": "Doctors checked for damage to the entrails after the accident.", "answer": "entrails"},
    ],
    "equivocate": [
        {"text": "The witness began to equivocate under pressure.", "answer": "equivocate"},
        {"text": "Leaders should not equivocate on basic human rights.", "answer": "equivocate"},
        {"text": "He tried to equivocate instead of giving a direct answer.", "answer": "equivocate"},
    ],
    "ethiopian": [
        {"text": "The exhibition featured Ethiopian coffee and textiles.", "answer": "ethiopian"},
        {"text": "She studied Ethiopian history at university.", "answer": "ethiopian"},
        {"text": "An Ethiopian runner won the marathon.", "answer": "ethiopian"},
    ],
    "excel": [
        {"text": "Some students excel in mathematics but struggle in writing.", "answer": "excel"},
        {"text": "She excelled at solving complex problems.", "answer": "excel"},
        {"text": "The school helps gifted children excel further.", "answer": "excel"},
    ],
    "excruciate": [
        {"text": "The injury seemed to excruciate him with every step.", "answer": "excruciate"},
        {"text": "The pressure to perform began to excruciate the entire team.", "answer": "excruciate"},
        {"text": "A small movement could excruciate the patient.", "answer": "excruciate"},
    ],
    "expressive": [
        {"text": "Her face is highly expressive on stage.", "answer": "expressive"},
        {"text": "The dancer's hands were especially expressive.", "answer": "expressive"},
        {"text": "He has an expressive writing style.", "answer": "expressive"},
    ],
    "extol": [
        {"text": "The article extols the benefits of daily exercise.", "answer": "extol"},
        {"text": "Supporters extolled her honesty and courage.", "answer": "extol"},
        {"text": "The guidebook extols the beauty of the coastline.", "answer": "extol"},
    ],
    "extrapolate": [
        {"text": "Scientists extrapolate future trends from current data.", "answer": "extrapolate"},
        {"text": "It is risky to extrapolate too much from one study.", "answer": "extrapolate"},
        {"text": "Economists tried to extrapolate the likely impact of the policy.", "answer": "extrapolate"},
    ],
    "extravagant": [
        {"text": "The hotel lobby had an extravagant marble staircase.", "answer": "extravagant"},
        {"text": "He was criticized for his extravagant spending.", "answer": "extravagant"},
        {"text": "The wedding was beautiful but not excessively extravagant.", "answer": "extravagant"},
    ],
    "facade": [
        {"text": "The old facade was restored stone by stone.", "answer": "facade"},
        {"text": "Behind his calm facade, he was deeply worried.", "answer": "facade"},
        {"text": "The building's glass facade reflected the sky.", "answer": "facade"},
    ],
    "facial": [
        {"text": "The actor used subtle facial expressions to show fear.", "answer": "facial"},
        {"text": "She booked a facial before the wedding.", "answer": "facial"},
        {"text": "The patient showed facial swelling after the fall.", "answer": "facial"},
    ],
    "fad": [
        {"text": "The toy became a global fad in the 1990s.", "answer": "fad"},
        {"text": "Some diets are little more than a short-lived fad.", "answer": "fad"},
        {"text": "He dismissed the trend as another online fad.", "answer": "fad"},
    ],
    "faddish": [
        {"text": "The brand avoids faddish designs and prefers timeless ones.", "answer": "faddish"},
        {"text": "Investors should be wary of faddish products.", "answer": "faddish"},
        {"text": "Her style is modern but never too faddish.", "answer": "faddish"},
    ],
    "fatuous": [
        {"text": "The host made a fatuous remark that annoyed the guests.", "answer": "fatuous"},
        {"text": "He wore a fatuous grin during the serious discussion.", "answer": "fatuous"},
        {"text": "The review dismissed the film as fatuous and shallow.", "answer": "fatuous"},
    ],
    "fauna": [
        {"text": "The island is famous for its unique fauna.", "answer": "fauna"},
        {"text": "The guidebook describes both the flora and fauna of the region.", "answer": "fauna"},
        {"text": "Researchers recorded the fauna living in the wetland.", "answer": "fauna"},
    ],
    "feckless": [
        {"text": "The article criticized the feckless leadership of the board.", "answer": "feckless"},
        {"text": "He was seen as charming but feckless.", "answer": "feckless"},
        {"text": "A feckless response can worsen a crisis.", "answer": "feckless"},
    ],
    "fecundity": [
        {"text": "Biologists studied the fecundity of the fish population.", "answer": "fecundity"},
        {"text": "The region's fecundity made it a center of agriculture.", "answer": "fecundity"},
        {"text": "Her work celebrates the fecundity of the natural world.", "answer": "fecundity"},
    ],
    "feistiness": [
        {"text": "Her feistiness helped her survive in a difficult industry.", "answer": "feistiness"},
        {"text": "The child's feistiness surprised his teachers.", "answer": "feistiness"},
        {"text": "The team played with unusual feistiness from the start.", "answer": "feistiness"},
    ],
    "fervently": [
        {"text": "She fervently believes in public education.", "answer": "fervently"},
        {"text": "The crowd fervently cheered the speaker.", "answer": "fervently"},
        {"text": "He spoke fervently about justice and reform.", "answer": "fervently"},
    ],
    "fervor": [
        {"text": "The campaign attracted supporters with almost religious fervor.", "answer": "fervor"},
        {"text": "He worked with fresh fervor after the award.", "answer": "fervor"},
        {"text": "The crowd sang with national fervor.", "answer": "fervor"},
    ],
    "fetishist": [
        {"text": "The article portrayed him as a collector and fetishist of rare objects.", "answer": "fetishist"},
        {"text": "Some critics accused the designer of being a technology fetishist.", "answer": "fetishist"},
        {"text": "The character is written as a fashion fetishist with extreme tastes.", "answer": "fetishist"},
    ],
    "fictional": [
        {"text": "The story is based on a fictional city.", "answer": "fictional"},
        {"text": "She created a fully fictional world for the novel.", "answer": "fictional"},
        {"text": "The film mixes real events with fictional scenes.", "answer": "fictional"},
    ],
    "fiddle": [
        {"text": "Someone had been fiddling with the radio settings.", "answer": "fiddle"},
        {"text": "He plays the fiddle at village festivals.", "answer": "fiddle"},
        {"text": "Do not fiddle with the controls while the machine is running.", "answer": "fiddle"},
    ],
    "fig": [
        {"text": "Fresh fig is served with cheese in this dish.", "answer": "fig"},
        {"text": "They planted a fig tree in the courtyard.", "answer": "fig"},
        {"text": "The dessert was topped with sliced fig and honey.", "answer": "fig"},
    ],
    "finch": [
        {"text": "A bright yellow finch landed on the fence.", "answer": "finch"},
        {"text": "The guide pointed out a rare finch in the trees.", "answer": "finch"},
        {"text": "Finches often gather near the bird feeder.", "answer": "finch"},
    ],
    "fissure": [
        {"text": "A deep fissure opened in the dry ground.", "answer": "fissure"},
        {"text": "Doctors detected a small fissure in the bone.", "answer": "fissure"},
        {"text": "The earthquake left a long fissure across the road.", "answer": "fissure"},
    ],
    "fittingly": [
        {"text": "The concert ended fittingly with the city's unofficial anthem.", "answer": "fittingly"},
        {"text": "He was fittingly honored at the close of his career.", "answer": "fittingly"},
        {"text": "The museum is fittingly located in the historic quarter.", "answer": "fittingly"},
    ],
    "fixate": [
        {"text": "Children sometimes fixate on one idea for weeks.", "answer": "fixate"},
        {"text": "Do not fixate only on the short-term numbers.", "answer": "fixate"},
        {"text": "She tends to fixate on small mistakes.", "answer": "fixate"},
    ],
    "flaunt": [
        {"text": "He likes to flaunt his success on social media.", "answer": "flaunt"},
        {"text": "The rule was openly flaunted by several shops.", "answer": "flaunt"},
        {"text": "She refused to flaunt her wealth.", "answer": "flaunt"},
    ],
    "flier": [
        {"text": "Someone slipped a flier under the front door.", "answer": "flier"},
        {"text": "He handed out a flier for the school play.", "answer": "flier"},
        {"text": "Every passenger received a safety flier at check-in.", "answer": "flier"},
    ],
    "flirt": [
        {"text": "He likes to flirt at parties but never seriously.", "answer": "flirt"},
        {"text": "The company began to flirt with the idea of moving abroad.", "answer": "flirt"},
        {"text": "She flirted with danger by ignoring the warning signs.", "answer": "flirt"},
    ],
    "flora": [
        {"text": "The island's flora is protected by law.", "answer": "flora"},
        {"text": "The guidebook describes the local flora in detail.", "answer": "flora"},
        {"text": "Students studied mountain flora during the field trip.", "answer": "flora"},
    ],
    "flummox": [
        {"text": "The final question seemed to flummox the entire class.", "answer": "flummox"},
        {"text": "His calm reply completely flummoxed the interviewer.", "answer": "flummox"},
        {"text": "The puzzle is designed to flummox even experienced players.", "answer": "flummox"},
    ],
    "follower": [
        {"text": "The account has gained a million followers online.", "answer": "follower"},
        {"text": "He is more of a follower than a leader.", "answer": "follower"},
        {"text": "Each religious follower brought a small offering.", "answer": "follower"},
    ],
    "footloose": [
        {"text": "After quitting his job, he felt footloose for the first time.", "answer": "footloose"},
        {"text": "The film celebrates a footloose spirit of freedom.", "answer": "footloose"},
        {"text": "At twenty, she was still footloose and ready to travel.", "answer": "footloose"},
    ],
    "forage": [
        {"text": "The animals forage for food at dawn.", "answer": "forage"},
        {"text": "They learned how to forage safely in the forest.", "answer": "forage"},
        {"text": "Birds were foraging near the riverbank.", "answer": "forage"},
    ],
    "forager": [
        {"text": "An experienced forager guided the group through the woods.", "answer": "forager"},
        {"text": "The forager knew which mushrooms were safe to pick.", "answer": "forager"},
        {"text": "Each forager carried a basket and knife.", "answer": "forager"},
    ],
    "forebear": [
        {"text": "The letter was written by one of her forebears.", "answer": "forebear"},
        {"text": "He felt a strong connection to his forebears.", "answer": "forebear"},
        {"text": "The museum honors the forebears of the community.", "answer": "forebear"},
    ],
    "foreseeable": [
        {"text": "There is no foreseeable end to the dispute.", "answer": "foreseeable"},
        {"text": "For the foreseeable future, prices may remain high.", "answer": "foreseeable"},
        {"text": "The delay was entirely foreseeable.", "answer": "foreseeable"},
    ],
    "fragrance": [
        {"text": "The room was filled with the fragrance of fresh flowers.", "answer": "fragrance"},
        {"text": "She chose a light citrus fragrance for summer.", "answer": "fragrance"},
        {"text": "A sweet fragrance drifted from the bakery.", "answer": "fragrance"},
    ],
    "freewheel": [
        {"text": "The cyclist began to freewheel downhill.", "answer": "freewheel"},
        {"text": "The company cannot simply freewheel without a strategy.", "answer": "freewheel"},
        {"text": "He tends to freewheel through life until deadlines appear.", "answer": "freewheel"},
    ],
    "frenzy": [
        {"text": "The sale caused a shopping frenzy in the mall.", "answer": "frenzy"},
        {"text": "Fans worked themselves into a frenzy before the concert.", "answer": "frenzy"},
        {"text": "The media frenzy lasted for weeks.", "answer": "frenzy"},
    ],
    "fresco": [
        {"text": "The church walls were covered in faded fresco paintings.", "answer": "fresco"},
        {"text": "Experts restored the Renaissance fresco.", "answer": "fresco"},
        {"text": "A damaged fresco was discovered beneath the plaster.", "answer": "fresco"},
    ],
    "fringe": [
        {"text": "The town lies on the fringe of the desert.", "answer": "fringe"},
        {"text": "She cut a fringe across her forehead.", "answer": "fringe"},
        {"text": "His views remain on the fringe of academic debate.", "answer": "fringe"},
    ],
    "frown": [
        {"text": "A frown appeared on her face as she read the message.", "answer": "frown"},
        {"text": "Please do not frown so much during the photos.", "answer": "frown"},
        {"text": "He looked up with a puzzled frown.", "answer": "frown"},
    ],
    "fulfilment": [
        {"text": "She found real fulfilment in teaching children.", "answer": "fulfilment"},
        {"text": "The job brought him little personal fulfilment.", "answer": "fulfilment"},
        {"text": "Order fulfilment was delayed by the storm.", "answer": "fulfilment"},
    ],
    "fumble": [
        {"text": "He began to fumble for his keys in the dark.", "answer": "fumble"},
        {"text": "The goalkeeper fumbled the ball at the worst moment.", "answer": "fumble"},
        {"text": "She fumbled through her speech notes nervously.", "answer": "fumble"},
    ],
    "fury": [
        {"text": "She reacted with fury when she saw the damage.", "answer": "fury"},
        {"text": "The storm returned with renewed fury overnight.", "answer": "fury"},
        {"text": "His quiet reply only increased their fury.", "answer": "fury"},
    ],
    "futile": [
        {"text": "It would be futile to argue with him now.", "answer": "futile"},
        {"text": "Doctors made one last but futile attempt to save him.", "answer": "futile"},
        {"text": "The search felt futile after so many false leads.", "answer": "futile"},
    ],
    "gaggle": [
        {"text": "A gaggle of tourists blocked the narrow path.", "answer": "gaggle"},
        {"text": "The lake was home to a noisy gaggle of geese.", "answer": "gaggle"},
        {"text": "A gaggle of reporters gathered outside the court.", "answer": "gaggle"},
    ],
    "garishness": [
        {"text": "The garishness of the sign clashed with the old street.", "answer": "garishness"},
        {"text": "Critics mocked the garishness of the set design.", "answer": "garishness"},
        {"text": "She disliked the garishness of modern billboards.", "answer": "garishness"},
    ],
    "gazillion": [
        {"text": "It felt like I had a gazillion things to do.", "answer": "gazillion"},
        {"text": "The ad promised a gazillion features no one needed.", "answer": "gazillion"},
        {"text": "He took a gazillion photos during the trip.", "answer": "gazillion"},
    ],
    "glaze": [
        {"text": "The baker brushed the cake with a sweet glaze.", "answer": "glaze"},
        {"text": "Their eyes began to glaze over during the long meeting.", "answer": "glaze"},
        {"text": "The potter applied a blue glaze to the bowl.", "answer": "glaze"},
    ],
    "glider": [
        {"text": "The glider circled silently above the valley.", "answer": "glider"},
        {"text": "She took her first glider lesson last summer.", "answer": "glider"},
        {"text": "A motorless glider needs rising air to stay aloft.", "answer": "glider"},
    ],
    "glisten": [
        {"text": "The wet leaves began to glisten in the morning sun.", "answer": "glisten"},
        {"text": "Her eyes glistened with tears.", "answer": "glisten"},
        {"text": "Fresh snow made the rooftops glisten.", "answer": "glisten"},
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
