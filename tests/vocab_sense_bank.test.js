const assert = require("assert");

global.window = globalThis;
delete require.cache[require.resolve("../grammar_verb_table_data.js")];
require("../grammar_verb_table_data.js");
delete require.cache[require.resolve("../vocab_sense_bank.js")];
const senseBank = require("../vocab_sense_bank.js");

const game = senseBank.lookup("game");
assert.deepStrictEqual(
  game.map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:遊戲", "noun:比賽"]
);

const have = senseBank.lookup(" HAVE ");
assert.ok(have.some((entry) => entry.meaning === "食 / 飲" && entry.pos === "verb"));
assert.ok(have.some((entry) => entry.meaning === "上 / 參加" && entry.level === "A2"));
assert.deepStrictEqual(
  senseBank.lookup("have a look").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:看一看"]
);
assert.deepStrictEqual(
  senseBank.lookup("have lunch").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:吃午餐"]
);

const mt45Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt45-paper3-reviewed");
assert.ok(mt45Paper3Entries.length >= 90, `Expected MT45 Paper 3 reviewed entries, got ${mt45Paper3Entries.length}`);
const mt49Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt49-paper3-reviewed");
assert.ok(mt49Paper3Entries.length >= 100, `Expected MT49 Paper 3 reviewed entries, got ${mt49Paper3Entries.length}`);
const mt52Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt52-paper3-reviewed");
assert.ok(mt52Paper3Entries.length >= 100, `Expected MT52 Paper 3 reviewed entries, got ${mt52Paper3Entries.length}`);
const mt56Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt56-paper3-reviewed");
assert.ok(mt56Paper3Entries.length >= 95, `Expected MT56 Paper 3 reviewed entries, got ${mt56Paper3Entries.length}`);
const mt59Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt59-paper3-reviewed");
assert.ok(mt59Paper3Entries.length >= 70, `Expected MT59 Paper 3 reviewed entries, got ${mt59Paper3Entries.length}`);
const mt20Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt20-paper3-reviewed");
assert.ok(mt20Paper3Entries.length >= 55, `Expected MT20 Paper 3 reviewed entries, got ${mt20Paper3Entries.length}`);
const mt22Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt22-paper3-reviewed");
assert.ok(mt22Paper3Entries.length >= 50, `Expected MT22 Paper 3 reviewed entries, got ${mt22Paper3Entries.length}`);
const mt25Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt25-paper3-reviewed");
assert.ok(mt25Paper3Entries.length >= 80, `Expected MT25 Paper 3 reviewed entries, got ${mt25Paper3Entries.length}`);
const mt27Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt27-paper3-reviewed");
assert.ok(mt27Paper3Entries.length >= 74, `Expected MT27 Paper 3 reviewed entries, got ${mt27Paper3Entries.length}`);
const mt16Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt16-paper3-reviewed");
assert.ok(mt16Paper3Entries.length >= 80, `Expected MT16 Paper 3 reviewed entries, got ${mt16Paper3Entries.length}`);
const mt18Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt18-paper3-reviewed");
assert.ok(mt18Paper3Entries.length >= 90, `Expected MT18 Paper 3 reviewed entries, got ${mt18Paper3Entries.length}`);
const mt19Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt19-paper3-reviewed");
assert.ok(mt19Paper3Entries.length >= 87, `Expected MT19 Paper 3 reviewed entries, got ${mt19Paper3Entries.length}`);
const mt21Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt21-paper3-reviewed");
assert.ok(mt21Paper3Entries.length >= 111, `Expected MT21 Paper 3 reviewed entries, got ${mt21Paper3Entries.length}`);
const mt23Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt23-paper3-reviewed");
assert.ok(mt23Paper3Entries.length >= 56, `Expected MT23 Paper 3 reviewed entries, got ${mt23Paper3Entries.length}`);
const mt24Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt24-paper3-reviewed");
assert.ok(mt24Paper3Entries.length >= 75, `Expected MT24 Paper 3 reviewed entries, got ${mt24Paper3Entries.length}`);
const mt26Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt26-paper3-reviewed");
assert.ok(mt26Paper3Entries.length >= 90, `Expected MT26 Paper 3 reviewed entries, got ${mt26Paper3Entries.length}`);
const mt28Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt28-paper3-reviewed");
assert.ok(mt28Paper3Entries.length >= 60, `Expected MT28 Paper 3 reviewed entries, got ${mt28Paper3Entries.length}`);
const mt29Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt29-paper3-reviewed");
assert.ok(mt29Paper3Entries.length >= 85, `Expected MT29 Paper 3 reviewed entries, got ${mt29Paper3Entries.length}`);
const mt31Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt31-paper3-reviewed");
assert.ok(mt31Paper3Entries.length >= 60, `Expected MT31 Paper 3 reviewed entries, got ${mt31Paper3Entries.length}`);
const mt33Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt33-paper3-reviewed");
assert.ok(mt33Paper3Entries.length >= 75, `Expected MT33 Paper 3 reviewed entries, got ${mt33Paper3Entries.length}`);
const mt34Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt34-paper3-reviewed");
assert.ok(mt34Paper3Entries.length >= 90, `Expected MT34 Paper 3 reviewed entries, got ${mt34Paper3Entries.length}`);
const mt36Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt36-paper3-reviewed");
assert.ok(mt36Paper3Entries.length >= 80, `Expected MT36 Paper 3 reviewed entries, got ${mt36Paper3Entries.length}`);
const mt39Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt39-paper3-reviewed");
assert.ok(mt39Paper3Entries.length >= 80, `Expected MT39 Paper 3 reviewed entries, got ${mt39Paper3Entries.length}`);
const mt41Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt41-paper3-reviewed");
assert.ok(mt41Paper3Entries.length >= 90, `Expected MT41 Paper 3 reviewed entries, got ${mt41Paper3Entries.length}`);
const mt43Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt43-paper3-reviewed");
assert.ok(mt43Paper3Entries.length >= 114, `Expected MT43 Paper 3 reviewed entries, got ${mt43Paper3Entries.length}`);
const mt46Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt46-paper3-reviewed");
assert.ok(mt46Paper3Entries.length >= 60, `Expected MT46 Paper 3 reviewed entries, got ${mt46Paper3Entries.length}`);
const mt48Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt48-paper3-reviewed");
assert.ok(mt48Paper3Entries.length >= 130, `Expected MT48 Paper 3 reviewed entries, got ${mt48Paper3Entries.length}`);
const mt50Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt50-paper3-reviewed");
assert.ok(mt50Paper3Entries.length >= 65, `Expected MT50 Paper 3 reviewed entries, got ${mt50Paper3Entries.length}`);
const mt53Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt53-paper3-reviewed");
assert.ok(mt53Paper3Entries.length >= 100, `Expected MT53 Paper 3 reviewed entries, got ${mt53Paper3Entries.length}`);
const mt56Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt56-paper2-reviewed");
assert.ok(mt56Paper2Entries.length >= 35, `Expected MT56 Paper 2 reviewed entries, got ${mt56Paper2Entries.length}`);
const mt58Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt58-paper2-reviewed");
assert.ok(mt58Paper2Entries.length >= 68, `Expected MT58 Paper 2 reviewed entries, got ${mt58Paper2Entries.length}`);
const mt61Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt61-paper2-reviewed");
assert.ok(mt61Paper2Entries.length >= 66, `Expected MT61 Paper 2 reviewed entries, got ${mt61Paper2Entries.length}`);
const mt65Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt65-paper2-reviewed");
assert.ok(mt65Paper2Entries.length >= 73, `Expected MT65 Paper 2 reviewed entries, got ${mt65Paper2Entries.length}`);
const mt68Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt68-paper2-reviewed");
assert.ok(mt68Paper2Entries.length >= 61, `Expected MT68 Paper 2 reviewed entries, got ${mt68Paper2Entries.length}`);
const mt72Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt72-paper2-reviewed");
assert.ok(mt72Paper2Entries.length >= 49, `Expected MT72 Paper 2 reviewed entries, got ${mt72Paper2Entries.length}`);
const mt75Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt75-paper2-reviewed");
assert.ok(mt75Paper2Entries.length >= 54, `Expected MT75 Paper 2 reviewed entries, got ${mt75Paper2Entries.length}`);
const mt79Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt79-paper2-reviewed");
assert.ok(mt79Paper2Entries.length >= 70, `Expected MT79 Paper 2 reviewed entries, got ${mt79Paper2Entries.length}`);
const mt82Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt82-paper2-reviewed");
assert.ok(mt82Paper2Entries.length >= 74, `Expected MT82 Paper 2 reviewed entries, got ${mt82Paper2Entries.length}`);
const mt59Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt59-paper2-reviewed");
assert.ok(mt59Paper2Entries.length >= 29, `Expected MT59 Paper 2 reviewed entries, got ${mt59Paper2Entries.length}`);
const mt63Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt63-paper2-reviewed");
assert.ok(mt63Paper2Entries.length >= 25, `Expected MT63 Paper 2 reviewed entries, got ${mt63Paper2Entries.length}`);
const mt66Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt66-paper2-reviewed");
assert.ok(mt66Paper2Entries.length >= 35, `Expected MT66 Paper 2 reviewed entries, got ${mt66Paper2Entries.length}`);
const mt87Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt87-paper3-reviewed");
assert.ok(mt87Paper3Entries.length >= 74, `Expected MT87 Paper 3 reviewed entries, got ${mt87Paper3Entries.length}`);
const mt63Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt63-paper3-reviewed");
assert.ok(mt63Paper3Entries.length >= 65, `Expected MT63 Paper 3 reviewed entries, got ${mt63Paper3Entries.length}`);
const mt66Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt66-paper3-reviewed");
assert.ok(mt66Paper3Entries.length >= 65, `Expected MT66 Paper 3 reviewed entries, got ${mt66Paper3Entries.length}`);
const mt70Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt70-paper3-reviewed");
assert.ok(mt70Paper3Entries.length >= 80, `Expected MT70 Paper 3 reviewed entries, got ${mt70Paper3Entries.length}`);
const mt73Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt73-paper3-reviewed");
assert.ok(mt73Paper3Entries.length >= 70, `Expected MT73 Paper 3 reviewed entries, got ${mt73Paper3Entries.length}`);
const mt77Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt77-paper3-reviewed");
assert.ok(mt77Paper3Entries.length >= 70, `Expected MT77 Paper 3 reviewed entries, got ${mt77Paper3Entries.length}`);
const mt80Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt80-paper3-reviewed");
assert.ok(mt80Paper3Entries.length >= 55, `Expected MT80 Paper 3 reviewed entries, got ${mt80Paper3Entries.length}`);
const mt84Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt84-paper3-reviewed");
assert.ok(mt84Paper3Entries.length >= 70, `Expected MT84 Paper 3 reviewed entries, got ${mt84Paper3Entries.length}`);
const mt9Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt9-paper3-reviewed");
assert.ok(mt9Paper3Entries.length >= 60, `Expected MT9 Paper 3 reviewed entries, got ${mt9Paper3Entries.length}`);
const mt10Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt10-paper3-reviewed");
assert.ok(mt10Paper3Entries.length >= 90, `Expected MT10 Paper 3 reviewed entries, got ${mt10Paper3Entries.length}`);
const mt11Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt11-paper3-reviewed");
assert.ok(mt11Paper3Entries.length >= 61, `Expected MT11 Paper 3 reviewed entries, got ${mt11Paper3Entries.length}`);
const mt12Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt12-paper3-reviewed");
assert.ok(mt12Paper3Entries.length >= 109, `Expected MT12 Paper 3 reviewed entries, got ${mt12Paper3Entries.length}`);
const mt13Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt13-paper3-reviewed");
assert.ok(mt13Paper3Entries.length >= 91, `Expected MT13 Paper 3 reviewed entries, got ${mt13Paper3Entries.length}`);
const mt14Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt14-paper3-reviewed");
assert.ok(mt14Paper3Entries.length >= 72, `Expected MT14 Paper 3 reviewed entries, got ${mt14Paper3Entries.length}`);
const mt15Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt15-paper3-reviewed");
assert.ok(mt15Paper3Entries.length >= 24, `Expected MT15 Paper 3 reviewed entries, got ${mt15Paper3Entries.length}`);
const mt15Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt15-paper4-reviewed");
assert.ok(mt15Paper4Entries.length >= 32, `Expected MT15 Paper 4 reviewed entries, got ${mt15Paper4Entries.length}`);
const mt17Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt17-paper4-reviewed");
assert.ok(mt17Paper4Entries.length >= 39, `Expected MT17 Paper 4 reviewed entries, got ${mt17Paper4Entries.length}`);
const mt20Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt20-paper4-reviewed");
assert.ok(mt20Paper4Entries.length >= 16, `Expected MT20 Paper 4 reviewed entries, got ${mt20Paper4Entries.length}`);
const mt22Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt22-paper4-reviewed");
assert.ok(mt22Paper4Entries.length >= 23, `Expected MT22 Paper 4 reviewed entries, got ${mt22Paper4Entries.length}`);
const mt25Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt25-paper4-reviewed");
assert.ok(mt25Paper4Entries.length >= 21, `Expected MT25 Paper 4 reviewed entries, got ${mt25Paper4Entries.length}`);
const mt27Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt27-paper4-reviewed");
assert.ok(mt27Paper4Entries.length >= 33, `Expected MT27 Paper 4 reviewed entries, got ${mt27Paper4Entries.length}`);
const mt30Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt30-paper4-reviewed");
assert.ok(mt30Paper4Entries.length >= 36, `Expected MT30 Paper 4 reviewed entries, got ${mt30Paper4Entries.length}`);
const mt32Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt32-paper4-reviewed");
assert.ok(mt32Paper4Entries.length >= 25, `Expected MT32 Paper 4 reviewed entries, got ${mt32Paper4Entries.length}`);
const mt35Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt35-paper4-reviewed");
assert.ok(mt35Paper4Entries.length >= 31, `Expected MT35 Paper 4 reviewed entries, got ${mt35Paper4Entries.length}`);
const mt38Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt38-paper4-reviewed");
assert.ok(mt38Paper4Entries.length >= 17, `Expected MT38 Paper 4 reviewed entries, got ${mt38Paper4Entries.length}`);
const mt42Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt42-paper4-reviewed");
assert.ok(mt42Paper4Entries.length >= 22, `Expected MT42 Paper 4 reviewed entries, got ${mt42Paper4Entries.length}`);
const mt45Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt45-paper4-reviewed");
assert.ok(mt45Paper4Entries.length >= 25, `Expected MT45 Paper 4 reviewed entries, got ${mt45Paper4Entries.length}`);
const mt49Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt49-paper4-reviewed");
assert.ok(mt49Paper4Entries.length >= 28, `Expected MT49 Paper 4 reviewed entries, got ${mt49Paper4Entries.length}`);
const mt50Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt50-paper4-reviewed");
assert.ok(mt50Paper4Entries.length >= 23, `Expected MT50 Paper 4 reviewed entries, got ${mt50Paper4Entries.length}`);
const mt51Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt51-paper4-reviewed");
assert.ok(mt51Paper4Entries.length >= 30, `Expected MT51 Paper 4 reviewed entries, got ${mt51Paper4Entries.length}`);
const mt56Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt56-paper4-reviewed");
assert.ok(mt56Paper4Entries.length >= 29, `Expected MT56 Paper 4 reviewed entries, got ${mt56Paper4Entries.length}`);
const mt57Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt57-paper4-reviewed");
assert.ok(mt57Paper4Entries.length >= 29, `Expected MT57 Paper 4 reviewed entries, got ${mt57Paper4Entries.length}`);
const mt59Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt59-paper4-reviewed");
assert.ok(mt59Paper4Entries.length >= 28, `Expected MT59 Paper 4 reviewed entries, got ${mt59Paper4Entries.length}`);
const mt60Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt60-paper4-reviewed");
assert.ok(mt60Paper4Entries.length >= 31, `Expected MT60 Paper 4 reviewed entries, got ${mt60Paper4Entries.length}`);
const mt62Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt62-paper4-reviewed");
assert.ok(mt62Paper4Entries.length >= 27, `Expected MT62 Paper 4 reviewed entries, got ${mt62Paper4Entries.length}`);
const mt63Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt63-paper4-reviewed");
assert.ok(mt63Paper4Entries.length >= 29, `Expected MT63 Paper 4 reviewed entries, got ${mt63Paper4Entries.length}`);
const mt64Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt64-paper4-reviewed");
assert.ok(mt64Paper4Entries.length >= 28, `Expected MT64 Paper 4 reviewed entries, got ${mt64Paper4Entries.length}`);
const mt65Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt65-paper4-reviewed");
assert.ok(mt65Paper4Entries.length >= 23, `Expected MT65 Paper 4 reviewed entries, got ${mt65Paper4Entries.length}`);
const mt66Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt66-paper4-reviewed");
assert.ok(mt66Paper4Entries.length >= 20, `Expected MT66 Paper 4 reviewed entries, got ${mt66Paper4Entries.length}`);
const mt67Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt67-paper4-reviewed");
assert.ok(mt67Paper4Entries.length >= 19, `Expected MT67 Paper 4 reviewed entries, got ${mt67Paper4Entries.length}`);
const mt68Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt68-paper4-reviewed");
assert.ok(mt68Paper4Entries.length >= 19, `Expected MT68 Paper 4 reviewed entries, got ${mt68Paper4Entries.length}`);
const mt69Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt69-paper4-reviewed");
assert.ok(mt69Paper4Entries.length >= 21, `Expected MT69 Paper 4 reviewed entries, got ${mt69Paper4Entries.length}`);
const mt70Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt70-paper4-reviewed");
assert.ok(mt70Paper4Entries.length >= 17, `Expected MT70 Paper 4 reviewed entries, got ${mt70Paper4Entries.length}`);
const mt71Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt71-paper4-reviewed");
assert.ok(mt71Paper4Entries.length >= 27, `Expected MT71 Paper 4 reviewed entries, got ${mt71Paper4Entries.length}`);
const mt72Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt72-paper4-reviewed");
assert.ok(mt72Paper4Entries.length >= 23, `Expected MT72 Paper 4 reviewed entries, got ${mt72Paper4Entries.length}`);
const mt73Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt73-paper4-reviewed");
assert.ok(mt73Paper4Entries.length >= 26, `Expected MT73 Paper 4 reviewed entries, got ${mt73Paper4Entries.length}`);
const mt75Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt75-paper4-reviewed");
assert.ok(mt75Paper4Entries.length >= 26, `Expected MT75 Paper 4 reviewed entries, got ${mt75Paper4Entries.length}`);
const mt78Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt78-paper4-reviewed");
assert.ok(mt78Paper4Entries.length >= 27, `Expected MT78 Paper 4 reviewed entries, got ${mt78Paper4Entries.length}`);
const mt79Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt79-paper4-reviewed");
assert.ok(mt79Paper4Entries.length >= 26, `Expected MT79 Paper 4 reviewed entries, got ${mt79Paper4Entries.length}`);
const mt81Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt81-paper4-reviewed");
assert.ok(mt81Paper4Entries.length >= 38, `Expected MT81 Paper 4 reviewed entries, got ${mt81Paper4Entries.length}`);
const mt83Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt83-paper4-reviewed");
assert.ok(mt83Paper4Entries.length >= 27, `Expected MT83 Paper 4 reviewed entries, got ${mt83Paper4Entries.length}`);
const mt84Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt84-paper4-reviewed");
assert.ok(mt84Paper4Entries.length >= 34, `Expected MT84 Paper 4 reviewed entries, got ${mt84Paper4Entries.length}`);
const mt85Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt85-paper4-reviewed");
assert.ok(mt85Paper4Entries.length >= 30, `Expected MT85 Paper 4 reviewed entries, got ${mt85Paper4Entries.length}`);
const mt86Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt86-paper4-reviewed");
assert.ok(mt86Paper4Entries.length >= 36, `Expected MT86 Paper 4 reviewed entries, got ${mt86Paper4Entries.length}`);
const mt87Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt87-paper4-reviewed");
assert.ok(mt87Paper4Entries.length >= 22, `Expected MT87 Paper 4 reviewed entries, got ${mt87Paper4Entries.length}`);
const mt7Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt7-paper4-reviewed");
assert.ok(mt7Paper4Entries.length >= 20, `Expected MT7 Paper 4 reviewed entries, got ${mt7Paper4Entries.length}`);
const mt8Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt8-paper4-reviewed");
assert.ok(mt8Paper4Entries.length >= 18, `Expected MT8 Paper 4 reviewed entries, got ${mt8Paper4Entries.length}`);
const mt9Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt9-paper4-reviewed");
assert.ok(mt9Paper4Entries.length >= 19, `Expected MT9 Paper 4 reviewed entries, got ${mt9Paper4Entries.length}`);
const mt10Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt10-paper4-reviewed");
assert.ok(mt10Paper4Entries.length >= 17, `Expected MT10 Paper 4 reviewed entries, got ${mt10Paper4Entries.length}`);
const mt11Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt11-paper4-reviewed");
assert.ok(mt11Paper4Entries.length >= 15, `Expected MT11 Paper 4 reviewed entries, got ${mt11Paper4Entries.length}`);
const mt12Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt12-paper4-reviewed");
assert.ok(mt12Paper4Entries.length >= 17, `Expected MT12 Paper 4 reviewed entries, got ${mt12Paper4Entries.length}`);
const mt13Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt13-paper4-reviewed");
assert.ok(mt13Paper4Entries.length >= 19, `Expected MT13 Paper 4 reviewed entries, got ${mt13Paper4Entries.length}`);
const mt14Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt14-paper4-reviewed");
assert.ok(mt14Paper4Entries.length >= 30, `Expected MT14 Paper 4 reviewed entries, got ${mt14Paper4Entries.length}`);
const mt16Paper4Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt16-paper4-reviewed");
assert.ok(mt16Paper4Entries.length >= 21, `Expected MT16 Paper 4 reviewed entries, got ${mt16Paper4Entries.length}`);
const mt68Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt68-paper3-reviewed");
assert.ok(mt68Paper3Entries.length >= 50, `Expected MT68 Paper 3 reviewed entries, got ${mt68Paper3Entries.length}`);
const mt62Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt62-paper3-reviewed");
assert.ok(mt62Paper3Entries.length >= 55, `Expected MT62 Paper 3 reviewed entries, got ${mt62Paper3Entries.length}`);
const mt64Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt64-paper3-reviewed");
assert.ok(mt64Paper3Entries.length >= 65, `Expected MT64 Paper 3 reviewed entries, got ${mt64Paper3Entries.length}`);
const mt67Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt67-paper3-reviewed");
assert.ok(mt67Paper3Entries.length >= 60, `Expected MT67 Paper 3 reviewed entries, got ${mt67Paper3Entries.length}`);
const mt69Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt69-paper3-reviewed");
assert.ok(mt69Paper3Entries.length >= 62, `Expected MT69 Paper 3 reviewed entries, got ${mt69Paper3Entries.length}`);
const mt71Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt71-paper3-reviewed");
assert.ok(mt71Paper3Entries.length >= 63, `Expected MT71 Paper 3 reviewed entries, got ${mt71Paper3Entries.length}`);
const mt72Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt72-paper3-reviewed");
assert.ok(mt72Paper3Entries.length >= 42, `Expected MT72 Paper 3 reviewed entries, got ${mt72Paper3Entries.length}`);
const mt74Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt74-paper3-reviewed");
assert.ok(mt74Paper3Entries.length >= 55, `Expected MT74 Paper 3 reviewed entries, got ${mt74Paper3Entries.length}`);
const mt75Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt75-paper3-reviewed");
assert.ok(mt75Paper3Entries.length >= 85, `Expected MT75 Paper 3 reviewed entries, got ${mt75Paper3Entries.length}`);
const mt79Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt79-paper3-reviewed");
assert.ok(mt79Paper3Entries.length >= 66, `Expected MT79 Paper 3 reviewed entries, got ${mt79Paper3Entries.length}`);
const mt82Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt82-paper3-reviewed");
assert.ok(mt82Paper3Entries.length >= 63, `Expected MT82 Paper 3 reviewed entries, got ${mt82Paper3Entries.length}`);
const mt85Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt85-paper3-reviewed");
assert.ok(mt85Paper3Entries.length >= 51, `Expected MT85 Paper 3 reviewed entries, got ${mt85Paper3Entries.length}`);
const mt86Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt86-paper3-reviewed");
assert.ok(mt86Paper3Entries.length >= 57, `Expected MT86 Paper 3 reviewed entries, got ${mt86Paper3Entries.length}`);
const mt88Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt88-paper3-reviewed");
assert.ok(mt88Paper3Entries.length >= 54, `Expected MT88 Paper 3 reviewed entries, got ${mt88Paper3Entries.length}`);
const mt90Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt90-paper3-reviewed");
assert.ok(mt90Paper3Entries.length >= 67, `Expected MT90 Paper 3 reviewed entries, got ${mt90Paper3Entries.length}`);
const mt76Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt76-paper3-reviewed");
assert.ok(mt76Paper3Entries.length >= 87, `Expected MT76 Paper 3 reviewed entries, got ${mt76Paper3Entries.length}`);
const mt37Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt37-paper3-reviewed");
assert.ok(mt37Paper3Entries.length >= 29, `Expected MT37 Paper 3 reviewed entries, got ${mt37Paper3Entries.length}`);
const mt40Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt40-paper3-reviewed");
assert.ok(mt40Paper3Entries.length >= 57, `Expected MT40 Paper 3 reviewed entries, got ${mt40Paper3Entries.length}`);
const mt44Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt44-paper3-reviewed");
assert.ok(mt44Paper3Entries.length >= 83, `Expected MT44 Paper 3 reviewed entries, got ${mt44Paper3Entries.length}`);
const mt47Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt47-paper3-reviewed");
assert.ok(mt47Paper3Entries.length >= 62, `Expected MT47 Paper 3 reviewed entries, got ${mt47Paper3Entries.length}`);
const mt51Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt51-paper3-reviewed");
assert.ok(mt51Paper3Entries.length >= 54, `Expected MT51 Paper 3 reviewed entries, got ${mt51Paper3Entries.length}`);
const mt54Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt54-paper3-reviewed");
assert.ok(mt54Paper3Entries.length >= 54, `Expected MT54 Paper 3 reviewed entries, got ${mt54Paper3Entries.length}`);
const mt55Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt55-paper3-reviewed");
assert.ok(mt55Paper3Entries.length >= 57, `Expected MT55 Paper 3 reviewed entries, got ${mt55Paper3Entries.length}`);
const mt57Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt57-paper3-reviewed");
assert.ok(mt57Paper3Entries.length >= 70, `Expected MT57 Paper 3 reviewed entries, got ${mt57Paper3Entries.length}`);
const mt58Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt58-paper3-reviewed");
assert.ok(mt58Paper3Entries.length >= 28, `Expected MT58 Paper 3 reviewed entries, got ${mt58Paper3Entries.length}`);
const mt60Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt60-paper3-reviewed");
assert.ok(mt60Paper3Entries.length >= 68, `Expected MT60 Paper 3 reviewed entries, got ${mt60Paper3Entries.length}`);
const mt61Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt61-paper3-reviewed");
assert.ok(mt61Paper3Entries.length >= 47, `Expected MT61 Paper 3 reviewed entries, got ${mt61Paper3Entries.length}`);
const mt65Paper3Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt65-paper3-reviewed");
assert.ok(mt65Paper3Entries.length >= 70, `Expected MT65 Paper 3 reviewed entries, got ${mt65Paper3Entries.length}`);
const mt9Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt9-paper2-reviewed");
assert.ok(mt9Paper2Entries.length >= 42, `Expected MT9 Paper 2 reviewed entries, got ${mt9Paper2Entries.length}`);
const mt10Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt10-paper2-reviewed");
assert.ok(mt10Paper2Entries.length >= 51, `Expected MT10 Paper 2 reviewed entries, got ${mt10Paper2Entries.length}`);
const mt11Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt11-paper2-reviewed");
assert.ok(mt11Paper2Entries.length >= 44, `Expected MT11 Paper 2 reviewed entries, got ${mt11Paper2Entries.length}`);
const mt12Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt12-paper2-reviewed");
assert.ok(mt12Paper2Entries.length >= 30, `Expected MT12 Paper 2 reviewed entries, got ${mt12Paper2Entries.length}`);
const mt13Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt13-paper2-reviewed");
assert.ok(mt13Paper2Entries.length >= 45, `Expected MT13 Paper 2 reviewed entries, got ${mt13Paper2Entries.length}`);
const mt14Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt14-paper2-reviewed");
assert.ok(mt14Paper2Entries.length >= 50, `Expected MT14 Paper 2 reviewed entries, got ${mt14Paper2Entries.length}`);
const mt16Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt16-paper2-reviewed");
assert.ok(mt16Paper2Entries.length >= 58, `Expected MT16 Paper 2 reviewed entries, got ${mt16Paper2Entries.length}`);
const mt18Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt18-paper2-reviewed");
assert.ok(mt18Paper2Entries.length >= 116, `Expected MT18 Paper 2 reviewed entries, got ${mt18Paper2Entries.length}`);
const mt19Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt19-paper2-reviewed");
assert.ok(mt19Paper2Entries.length >= 111, `Expected MT19 Paper 2 reviewed entries, got ${mt19Paper2Entries.length}`);
const mt21Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt21-paper2-reviewed");
assert.ok(mt21Paper2Entries.length >= 68, `Expected MT21 Paper 2 reviewed entries, got ${mt21Paper2Entries.length}`);
const mt23Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt23-paper2-reviewed");
assert.ok(mt23Paper2Entries.length >= 70, `Expected MT23 Paper 2 reviewed entries, got ${mt23Paper2Entries.length}`);
const mt24Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt24-paper2-reviewed");
assert.ok(mt24Paper2Entries.length >= 64, `Expected MT24 Paper 2 reviewed entries, got ${mt24Paper2Entries.length}`);
const mt26Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt26-paper2-reviewed");
assert.ok(mt26Paper2Entries.length >= 63, `Expected MT26 Paper 2 reviewed entries, got ${mt26Paper2Entries.length}`);
const mt28Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt28-paper2-reviewed");
assert.ok(mt28Paper2Entries.length >= 40, `Expected MT28 Paper 2 reviewed entries, got ${mt28Paper2Entries.length}`);
const mt29Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt29-paper2-reviewed");
assert.ok(mt29Paper2Entries.length >= 80, `Expected MT29 Paper 2 reviewed entries, got ${mt29Paper2Entries.length}`);
const mt31Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt31-paper2-reviewed");
assert.ok(mt31Paper2Entries.length >= 48, `Expected MT31 Paper 2 reviewed entries, got ${mt31Paper2Entries.length}`);
const mt33Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt33-paper2-reviewed");
assert.ok(mt33Paper2Entries.length >= 65, `Expected MT33 Paper 2 reviewed entries, got ${mt33Paper2Entries.length}`);
const mt34Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt34-paper2-reviewed");
assert.ok(mt34Paper2Entries.length >= 75, `Expected MT34 Paper 2 reviewed entries, got ${mt34Paper2Entries.length}`);
const mt36Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt36-paper2-reviewed");
assert.ok(mt36Paper2Entries.length >= 55, `Expected MT36 Paper 2 reviewed entries, got ${mt36Paper2Entries.length}`);
const mt39Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt39-paper2-reviewed");
assert.ok(mt39Paper2Entries.length >= 60, `Expected MT39 Paper 2 reviewed entries, got ${mt39Paper2Entries.length}`);
const mt41Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt41-paper2-reviewed");
assert.ok(mt41Paper2Entries.length >= 100, `Expected MT41 Paper 2 reviewed entries, got ${mt41Paper2Entries.length}`);
const mt43Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt43-paper2-reviewed");
assert.ok(mt43Paper2Entries.length >= 55, `Expected MT43 Paper 2 reviewed entries, got ${mt43Paper2Entries.length}`);
const mt46Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt46-paper2-reviewed");
assert.ok(mt46Paper2Entries.length >= 45, `Expected MT46 Paper 2 reviewed entries, got ${mt46Paper2Entries.length}`);
const mt48Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt48-paper2-reviewed");
assert.ok(mt48Paper2Entries.length >= 75, `Expected MT48 Paper 2 reviewed entries, got ${mt48Paper2Entries.length}`);
const mt50Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt50-paper2-reviewed");
assert.ok(mt50Paper2Entries.length >= 85, `Expected MT50 Paper 2 reviewed entries, got ${mt50Paper2Entries.length}`);
const mt51Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt51-paper2-reviewed");
assert.ok(mt51Paper2Entries.length >= 63, `Expected MT51 Paper 2 reviewed entries, got ${mt51Paper2Entries.length}`);
const mt54Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt54-paper2-reviewed");
assert.ok(mt54Paper2Entries.length >= 54, `Expected MT54 Paper 2 reviewed entries, got ${mt54Paper2Entries.length}`);
const mt53Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt53-paper2-reviewed");
assert.ok(mt53Paper2Entries.length >= 65, `Expected MT53 Paper 2 reviewed entries, got ${mt53Paper2Entries.length}`);
const mt55Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt55-paper2-reviewed");
assert.ok(mt55Paper2Entries.length >= 100, `Expected MT55 Paper 2 reviewed entries, got ${mt55Paper2Entries.length}`);
const mt57Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt57-paper2-reviewed");
assert.ok(mt57Paper2Entries.length >= 79, `Expected MT57 Paper 2 reviewed entries, got ${mt57Paper2Entries.length}`);
const mt60Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt60-paper2-reviewed");
assert.ok(mt60Paper2Entries.length >= 90, `Expected MT60 Paper 2 reviewed entries, got ${mt60Paper2Entries.length}`);
const mt62Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt62-paper2-reviewed");
assert.ok(mt62Paper2Entries.length >= 120, `Expected MT62 Paper 2 reviewed entries, got ${mt62Paper2Entries.length}`);
const mt64Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt64-paper2-reviewed");
assert.ok(mt64Paper2Entries.length >= 56, `Expected MT64 Paper 2 reviewed entries, got ${mt64Paper2Entries.length}`);
const mt67Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt67-paper2-reviewed");
assert.ok(mt67Paper2Entries.length >= 64, `Expected MT67 Paper 2 reviewed entries, got ${mt67Paper2Entries.length}`);
const mt69Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt69-paper2-reviewed");
assert.ok(mt69Paper2Entries.length >= 84, `Expected MT69 Paper 2 reviewed entries, got ${mt69Paper2Entries.length}`);
const mt71Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt71-paper2-reviewed");
assert.ok(mt71Paper2Entries.length >= 112, `Expected MT71 Paper 2 reviewed entries, got ${mt71Paper2Entries.length}`);
const mt74Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt74-paper2-reviewed");
assert.ok(mt74Paper2Entries.length >= 84, `Expected MT74 Paper 2 reviewed entries, got ${mt74Paper2Entries.length}`);
const mt76Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt76-paper2-reviewed");
assert.ok(mt76Paper2Entries.length >= 60, `Expected MT76 Paper 2 reviewed entries, got ${mt76Paper2Entries.length}`);
const mt78Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt78-paper2-reviewed");
assert.ok(mt78Paper2Entries.length >= 94, `Expected MT78 Paper 2 reviewed entries, got ${mt78Paper2Entries.length}`);
const mt81Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt81-paper2-reviewed");
assert.ok(mt81Paper2Entries.length >= 84, `Expected MT81 Paper 2 reviewed entries, got ${mt81Paper2Entries.length}`);
const mt84Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt84-paper2-reviewed");
assert.ok(mt84Paper2Entries.length >= 63, `Expected MT84 Paper 2 reviewed entries, got ${mt84Paper2Entries.length}`);
const mt83Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt83-paper2-reviewed");
assert.ok(mt83Paper2Entries.length >= 104, `Expected MT83 Paper 2 reviewed entries, got ${mt83Paper2Entries.length}`);
const mt85Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt85-paper2-reviewed");
assert.ok(mt85Paper2Entries.length >= 50, `Expected MT85 Paper 2 reviewed entries, got ${mt85Paper2Entries.length}`);
const mt86Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt86-paper2-reviewed");
assert.ok(mt86Paper2Entries.length >= 85, `Expected MT86 Paper 2 reviewed entries, got ${mt86Paper2Entries.length}`);
const mt88Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt88-paper2-reviewed");
assert.ok(mt88Paper2Entries.length >= 59, `Expected MT88 Paper 2 reviewed entries, got ${mt88Paper2Entries.length}`);
const mt37Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt37-paper2-reviewed");
assert.ok(mt37Paper2Entries.length >= 58, `Expected MT37 Paper 2 reviewed entries, got ${mt37Paper2Entries.length}`);
const mt40Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt40-paper2-reviewed");
assert.ok(mt40Paper2Entries.length >= 113, `Expected MT40 Paper 2 reviewed entries, got ${mt40Paper2Entries.length}`);
const mt44Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt44-paper2-reviewed");
assert.ok(mt44Paper2Entries.length >= 95, `Expected MT44 Paper 2 reviewed entries, got ${mt44Paper2Entries.length}`);
const mt47Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt47-paper2-reviewed");
assert.ok(mt47Paper2Entries.length >= 83, `Expected MT47 Paper 2 reviewed entries, got ${mt47Paper2Entries.length}`);
const mt90Paper2Entries = senseBank.entries.filter((entry) => entry.source === "mock-unseen-mt90-paper2-reviewed");
assert.ok(mt90Paper2Entries.length >= 56, `Expected MT90 Paper 2 reviewed entries, got ${mt90Paper2Entries.length}`);
assert.deepStrictEqual(
  senseBank.lookup("World Culture Day").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["Culture Day:phrase:noun:文化日"]
);
assert.deepStrictEqual(
  senseBank.lookup("sprained her ankle").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["sprained ankle:phrase:noun:腳踝扭傷"]
);
assert.deepStrictEqual(
  senseBank.lookup("VIP boxes").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["VIP box:phrase:noun:貴賓包廂"]
);
assert.deepStrictEqual(
  senseBank.lookup("copy editor").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["copyeditor:noun:文字編輯 / 校訂編輯"]
);
assert.deepStrictEqual(
  senseBank.lookup("turns up her nose").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["turn up one's nose:phrase:verb:嗤之以鼻 / 表示嫌棄"]
);
assert.deepStrictEqual(
  senseBank.lookup("scoring").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.source}`),
  [
    "score:verb:用刀劃痕 / 劃線:mock-unseen-mt56-paper3-reviewed"
  ]
);
assert.deepStrictEqual(
  senseBank.lookup("Rome was not built in a day").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["Rome wasn't built in a day:phrase:adverb:羅馬不是一天建成的 / 大事需要時間"]
);
assert.deepStrictEqual(
  senseBank.lookup("black faced spoonbills").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["black-faced spoonbill:phrase:noun:黑臉琵鷺"]
);
assert.deepStrictEqual(
  senseBank.lookup("watch it unfold").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["watch something unfold:phrase:verb:看著事情發生 / 目睹事情展開"]
);
assert.deepStrictEqual(
  senseBank.lookup("held accountable").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["held accountable:phrase:adjective:須負責任的 / 被追究責任的"]
);
assert.deepStrictEqual(
  senseBank.lookup("gig workers").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["gig worker:phrase:noun:零工工作者 / 接案工作者"]
);
assert.deepStrictEqual(
  senseBank.lookup("killed two birds with one stone").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["kill two birds with one stone:phrase:verb:一石二鳥 / 一舉兩得"]
);
assert.deepStrictEqual(
  senseBank.lookup("on the same page").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:想法一致的 / 達成共識的"]
);
assert.deepStrictEqual(
  senseBank.lookup("Northern Lights").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["Northern Lights:phrase:noun:北極光"]
);
assert.deepStrictEqual(
  senseBank.lookup("engine failed").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["engine fail:phrase:verb:引擎失靈"]
);
assert.deepStrictEqual(
  senseBank.lookup("took me up on the offer").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["take someone up on an offer:phrase:verb:接受某人的提議 / 答應某人的邀請"]
);
assert.deepStrictEqual(
  senseBank.lookup("dog biscuits").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["dog biscuit:phrase:noun:狗餅乾"]
);
assert.deepStrictEqual(
  senseBank.lookup("Canis lupus").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["Canis lupus:phrase:noun:灰狼的學名"]
);
assert.deepStrictEqual(
  senseBank.lookup("praying mantises").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["praying mantis:phrase:noun:螳螂"]
);
assert.deepStrictEqual(
  senseBank.lookup("home-away-from-home").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["home away from home:phrase:noun:像家一樣舒服的地方"]
);
assert.deepStrictEqual(
  senseBank.lookup("much ado about nothing").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:小題大做 / 無事生非"]
);
assert.deepStrictEqual(
  senseBank.lookup("paid through the nose").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["pay through the nose:phrase:verb:付出過高價錢 / 被迫付高價"]
);
assert.deepStrictEqual(
  senseBank.lookup("sawn in half").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["saw in half:phrase:verb:鋸成兩半"]
);
assert.deepStrictEqual(
  senseBank.lookup("keynote speakers").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["keynote speaker:phrase:noun:主講嘉賓 / 主題演講者"]
);
assert.deepStrictEqual(
  senseBank.lookup("perfecting his art").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["perfect one's art:phrase:verb:精進技藝 / 使技藝更完善"]
);
assert.deepStrictEqual(
  senseBank.lookup("stick around").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:留下來 / 逗留"]
);
assert.deepStrictEqual(
  senseBank.lookup("take sides").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:偏幫一方 / 表明支持某一方"]
);
assert.deepStrictEqual(
  senseBank.lookup("armchair advocacy").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:安坐家中式倡議 / 只在網上支持行動"]
);
assert.deepStrictEqual(
  senseBank.lookup("for immediate release").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adverb:供即時發布 / 即時發布"]
);
assert.deepStrictEqual(
  senseBank.lookup("debugging").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:除錯 / 程式偵錯"]
);
assert.deepStrictEqual(
  senseBank.lookup("transitioning from print to digital").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["transition from print to digital:phrase:verb:由印刷轉為數碼形式"]
);
assert.deepStrictEqual(
  senseBank.lookup("stick out like a sore thumb").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:格格不入 / 顯得很突兀"]
);
assert.deepStrictEqual(
  senseBank.lookup("harnessed the power").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["harness the power:phrase:verb:利用力量 / 善用力量"]
);
assert.deepStrictEqual(
  senseBank.lookup("Song Dynasty").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["Song Dynasty:phrase:noun:宋朝"]
);
assert.deepStrictEqual(
  senseBank.lookup("unlicensed dentists").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["unlicensed dentist:phrase:noun:無牌牙醫"]
);
assert.deepStrictEqual(
  senseBank.lookup("Kai Tak Airport").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["Kai Tak Airport:phrase:noun:啟德機場"]
);
assert.deepStrictEqual(
  senseBank.lookup("tick all our boxes").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["tick all the boxes:phrase:verb:符合所有要求 / 滿足所有條件"]
);
assert.deepStrictEqual(
  senseBank.lookup("a dime a dozen").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:很普通的 / 隨處可見的"]
);
assert.deepStrictEqual(
  senseBank.lookup("bricks and mortar").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  [
    "bricks and mortar:phrase:noun:實體店 / 實體建築",
    "bricks-and-mortar:phrase:adjective:實體店的 / 非網上的"
  ]
);
assert.deepStrictEqual(
  senseBank.lookup("Grade II historical building").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["Grade II historic building:phrase:noun:二級歷史建築"]
);

const lookUp = senseBank.lookup("look   up");
assert.strictEqual(lookUp.length, 1);
assert.strictEqual(lookUp[0].type, "phrase");
assert.strictEqual(lookUp[0].meaning, "查閱 / 查字典");
assert.strictEqual(lookUp[0].overrideTeacher, true);

assert.deepStrictEqual(
  senseBank.lookup("work").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:工作", "noun:作品", "verb:工作 / 做事", "verb:運作 / 奏效"]
);
assert.ok(senseBank.lookup("work").every((entry) => entry.overrideTeacher));
assert.ok(senseBank.lookup("mean").some((entry) => entry.pos === "adjective" && entry.meaning === "吝嗇的"));
assert.deepStrictEqual(
  senseBank.lookup("practice").map((entry) => `${entry.pos}:${entry.meaning}:${entry.level}`),
  ["noun:練習:A2", "noun:做法:B1", "noun:慣例:B1", "verb:練習:A2", "noun:診所 / 執業場所:B2"]
);
assert.deepStrictEqual(
  senseBank.lookup("subject to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:受...影響的 / 取決於"]
);
assert.deepStrictEqual(
  senseBank.lookup("effect").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:影響", "noun:效果"]
);
assert.deepStrictEqual(
  senseBank.lookup("have an effect on").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:對...有影響"]
);
assert.deepStrictEqual(
  senseBank.lookup("have effect on").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:對...有影響"]
);
assert.deepStrictEqual(
  senseBank.lookup("have an impact on").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:對...有影響 / 對...有衝擊"]
);
assert.deepStrictEqual(
  senseBank.lookup("have impact on").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:對...有影響 / 對...有衝擊"]
);
assert.deepStrictEqual(
  senseBank.lookup("reason").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:理由", "noun:原因"]
);
assert.deepStrictEqual(
  senseBank.lookup("cause").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:原因", "verb:導致", "verb:引起"]
);
assert.deepStrictEqual(
  senseBank.lookup("result").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:結果", "verb:導致 / 產生結果"]
);
assert.deepStrictEqual(
  senseBank.lookup("impact").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:影響 / 衝擊", "verb:影響 / 衝擊"]
);
assert.deepStrictEqual(
  senseBank.lookup("term").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:學期", "noun:詞語 / 術語", "noun:條款", "noun:期限", "verb:稱為 / 把...叫做"]
);
assert.deepStrictEqual(
  senseBank.lookup("terms and conditions").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:條款及細則"]
);
assert.deepStrictEqual(
  senseBank.lookup("conditions").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  [
    "condition:noun:狀況",
    "condition:noun:狀態",
    "condition:noun:條件",
    "condition:noun:環境 / 情況",
    "terms:noun:條款",
    "terms:noun:條件"
  ]
);
assert.ok(senseBank.lookup("safe").some((entry) => entry.pos === "noun" && entry.meaning === "保險箱"));
assert.ok(senseBank.lookup("fair").some((entry) => entry.pos === "adjective" && entry.meaning === "尚可的 / 幾好的"));
assert.ok(senseBank.lookup("voice").some((entry) => entry.pos === "verb" && entry.meaning === "表達 / 說出"));
assert.ok(senseBank.lookup("bank").some((entry) => entry.pos === "verb" && entry.meaning === "存錢 / 把錢存入銀行"));
assert.ok(senseBank.lookup("major").some((entry) => entry.pos === "noun" && entry.meaning === "主修科目"));
assert.ok(senseBank.lookup("major").some((entry) => entry.pos === "verb" && entry.meaning === "主修"));
assert.ok(senseBank.lookup("parent notice").some((entry) => entry.pos === "noun" && entry.meaning === "家長通告"));
assert.ok(senseBank.lookup("dictation book").some((entry) => entry.pos === "noun" && entry.meaning === "默書簿"));
assert.ok(senseBank.lookup("corrections").some((entry) => entry.pos === "noun" && entry.meaning === "改正"));
assert.deepStrictEqual(
  senseBank.lookup("composition").map((entry) => `${entry.pos}:${entry.meaning}:${entry.level}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:作文:A2:override", "noun:組成 / 構成:B2:", "noun:樂曲:B2:"]
);
assert.ok(senseBank.lookup("green minibus").some((entry) => entry.pos === "noun" && entry.meaning === "綠色小巴"));
assert.ok(senseBank.lookup("red minibus").some((entry) => entry.pos === "noun" && entry.meaning === "紅色小巴"));
assert.ok(senseBank.lookup("Light Rail").some((entry) => entry.display === "Light Rail" && entry.meaning === "輕鐵"));
assert.ok(senseBank.lookup("Airport Express").some((entry) => entry.display === "Airport Express" && entry.meaning === "機場快線"));
assert.ok(senseBank.lookup("interchange station").some((entry) => entry.pos === "noun" && entry.meaning === "轉車站 / 轉乘站"));
assert.ok(senseBank.lookup("tap in").some((entry) => entry.pos === "verb" && entry.meaning === "拍卡入閘"));
assert.ok(senseBank.lookup("tap out").some((entry) => entry.pos === "verb" && entry.meaning === "拍卡出閘"));
assert.ok(senseBank.lookup("rice roll").some((entry) => entry.pos === "noun" && entry.meaning === "腸粉"));
assert.ok(senseBank.lookup("cart noodle").some((entry) => entry.pos === "noun" && entry.meaning === "車仔麵"));
assert.ok(senseBank.lookup("barbecued pork").some((entry) => entry.pos === "noun" && entry.meaning === "叉燒"));
assert.ok(senseBank.lookup("hot pot").some((entry) => entry.pos === "noun" && entry.meaning === "火鍋"));
assert.ok(senseBank.lookup("soy sauce").some((entry) => entry.pos === "noun" && entry.meaning === "豉油 / 醬油"));
assert.ok(senseBank.lookup("street food").some((entry) => entry.pos === "noun" && entry.meaning === "街頭小食 / 街頭食品"));
assert.ok(senseBank.lookup("snack shop").some((entry) => entry.pos === "noun" && entry.meaning === "小食店"));
assert.ok(senseBank.lookup("tea restaurant").some((entry) => entry.pos === "noun" && entry.meaning === "茶餐廳"));
assert.ok(senseBank.lookup("fishmonger").some((entry) => entry.pos === "noun" && entry.meaning === "魚檔 / 魚販"));
assert.ok(senseBank.lookup("vegetable stall").some((entry) => entry.pos === "noun" && entry.meaning === "菜檔"));
assert.ok(senseBank.lookup("fruit stall").some((entry) => entry.pos === "noun" && entry.meaning === "生果檔"));
assert.ok(senseBank.lookup("accident and emergency").some((entry) => entry.pos === "noun" && entry.meaning === "急症室"));
assert.ok(senseBank.lookup("A&E").some((entry) => entry.pos === "noun" && entry.meaning === "急症室"));
assert.ok(senseBank.lookup("capsule").some((entry) => entry.pos === "noun" && entry.meaning === "膠囊"));
assert.ok(senseBank.lookup("syrup").some((entry) => entry.pos === "noun" && entry.meaning === "藥水 / 糖漿"));
assert.ok(senseBank.lookup("dosage").some((entry) => entry.pos === "noun" && entry.meaning === "劑量 / 用藥分量"));
assert.ok(senseBank.lookup("bruise").some((entry) => entry.pos === "noun" && entry.meaning === "瘀傷"));
assert.ok(senseBank.lookup("faint").some((entry) => entry.pos === "verb" && entry.meaning === "暈倒"));
assert.ok(senseBank.lookup("vomit").some((entry) => entry.pos === "verb" && entry.meaning === "嘔吐"));
assert.ok(senseBank.lookup("diarrhea").some((entry) => entry.pos === "noun" && entry.meaning === "肚瀉 / 腹瀉"));
assert.ok(senseBank.lookup("constipation").some((entry) => entry.pos === "noun" && entry.meaning === "便秘"));
assert.deepStrictEqual(
  senseBank.lookup("about").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["preposition:關於", "adverb:大約"]
);
assert.deepStrictEqual(
  senseBank.lookup("bright").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:明亮的", "adjective:聰明的"]
);
assert.deepStrictEqual(
  senseBank.lookup("drop").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:掉下 / 放下", "verb:下降 / 減少", "noun:一滴", "noun:下降"]
);
assert.deepStrictEqual(
  senseBank.lookup("strong").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:強壯的", "adjective:強烈的"]
);
assert.deepStrictEqual(
  senseBank.lookup("wave").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:波浪", "noun:揮手", "verb:揮手"]
);
assert.deepStrictEqual(
  senseBank.lookup("check").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:檢查", "noun:檢查", "noun:賬單"]
);
assert.deepStrictEqual(
  senseBank.lookup("break").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:打破", "verb:弄壞", "noun:小休 / 休息"]
);
assert.ok(
  senseBank.lookup("broke").some((entry) => entry.pos === "verb" && entry.meaning === "打破 / 折斷 / 損壞（break 過去式）"),
  "broke should show a real verb-table meaning, not only a form label"
);
assert.ok(
  senseBank.lookup("broken").some((entry) => entry.pos === "verb" && entry.meaning === "打破 / 折斷 / 損壞（break PP）"),
  "broken should include the break PP meaning"
);
assert.ok(
  senseBank.lookup("broken").some((entry) => entry.pos === "adjective" && entry.meaning === "壞了的 / 破碎的"),
  "broken should keep its adjective meaning"
);
assert.ok(
  senseBank.lookup("breaking").some((entry) => entry.pos === "verb" && entry.meaning === "打破 / 折斷 / 損壞（break ING）"),
  "breaking should include the break ING meaning"
);
assert.deepStrictEqual(
  senseBank.lookup("lose").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:失去", "verb:輸掉"]
);
assert.deepStrictEqual(
  senseBank.lookup("number").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:數字", "noun:號碼", "verb:編號", "verb:數算"]
);
assert.deepStrictEqual(
  senseBank.lookup("stop").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:停止", "noun:車站", "noun:停止"]
);
assert.deepStrictEqual(
  senseBank.lookup("study").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:學習", "verb:研究", "noun:研究", "noun:書房"]
);
assert.deepStrictEqual(
  senseBank.lookup("egg waffle").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:雞蛋仔"]
);
assert.deepStrictEqual(
  senseBank.lookup("egg tart").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:蛋撻"]
);
assert.deepStrictEqual(
  senseBank.lookup("lung cancer").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:肺癌"]
);
assert.deepStrictEqual(
  senseBank.lookup("Octopus card").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:八達通"]
);
assert.deepStrictEqual(
  senseBank.lookup("Mong Kok").map((entry) => entry.display),
  ["Mong Kok"]
);
assert.deepStrictEqual(
  senseBank.lookup("china").map((entry) => entry.display),
  ["China"]
);
assert.deepStrictEqual(
  senseBank.lookup("south korea").map((entry) => entry.display),
  ["South Korea"]
);
assert.deepStrictEqual(
  senseBank.lookup("north korea").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["North Korea:noun:北韓"]
);
assert.deepStrictEqual(
  senseBank.lookup("tuen mun").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["Tuen Mun:noun:屯門"]
);
assert.deepStrictEqual(
  senseBank.lookup("chinese language").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["Chinese Language:phrase:noun:中文科 / 中國語文"]
);
assert.deepStrictEqual(
  senseBank.lookup("english language").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["English Language:phrase:noun:英文科 / 英國語文"]
);

assert.deepStrictEqual(
  senseBank.lookup("put on").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:穿上 / 戴上", "phrase:舉辦 / 上演"]
);
assert.deepStrictEqual(
  senseBank.lookup("take off").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:脫下", "phrase:起飛", "phrase:突然流行 / 迅速成功", "phrase:移除 / 撤下"]
);
assert.strictEqual(senseBank.lookup("take off")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("pick up").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:拿起 / 撿起", "phrase:接載", "phrase:學會 / 掌握"]
);
assert.strictEqual(senseBank.lookup("pick up")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("wake up").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:醒來", "phrase:叫醒"]
);
assert.strictEqual(senseBank.lookup("wake up")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("care for").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:照顧", "phrase:關心 / 在乎"]
);
assert.strictEqual(senseBank.lookup("care for")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("bring up").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:提出", "phrase:撫養"]
);
assert.strictEqual(senseBank.lookup("bring up")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("go through").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:經歷", "phrase:仔細查看 / 檢查", "phrase:逐項查看 / 仔細討論"]
);
assert.strictEqual(senseBank.lookup("go through")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("turn down").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:拒絕", "phrase:調低"]
);
assert.strictEqual(senseBank.lookup("turn down")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("account for").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:佔", "phrase:解釋 / 是...原因"]
);
assert.strictEqual(senseBank.lookup("account for")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("contribute to").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:有助於 / 促成", "phrase:貢獻"]
);
assert.strictEqual(senseBank.lookup("contribute to")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("go on").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:繼續", "phrase:發生 / 進行"]
);
assert.strictEqual(senseBank.lookup("go on")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("get on").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:上車", "phrase:相處"]
);
assert.strictEqual(senseBank.lookup("get on")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("break down").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:壞掉 / 失靈", "phrase:崩潰 / 情緒失控", "phrase:分解 / 拆解"]
);
assert.strictEqual(senseBank.lookup("break down")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("take place").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:發生 / 舉行"]
);
assert.strictEqual(senseBank.lookup("take place")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("bring out").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:出版 / 推出", "phrase:使顯現 / 帶出"]
);
assert.strictEqual(senseBank.lookup("bring out")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("refer to").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:指的是", "phrase:提及 / 提到"]
);
assert.strictEqual(senseBank.lookup("refer to")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("set up").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:創立 / 設立", "phrase:安裝 / 設定"]
);
assert.strictEqual(senseBank.lookup("set up")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("take over").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:接管", "phrase:收購"]
);
assert.strictEqual(senseBank.lookup("take over")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("take up").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:佔用", "phrase:開始從事 / 開始學"]
);
assert.strictEqual(senseBank.lookup("take up")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("come up with").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:想出", "phrase:提出"]
);
assert.strictEqual(senseBank.lookup("come up with")[0].overrideTeacher, true);
assert.deepStrictEqual(
  senseBank.lookup("turn off").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:關掉"]
);
assert.deepStrictEqual(
  senseBank.lookup("as a result").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:結果 / 因此"]
);
assert.deepStrictEqual(
  senseBank.lookup("a piece of").map((entry) => `${entry.type}:${entry.meaning}`),
  ["phrase:一塊 / 一張 / 一件"]
);

[
  ["rice", "noun:飯 / 米"],
  ["noodle", "noun:麵"],
  ["homework", "noun:功課"],
  ["information", "noun:資訊 / 資料"],
  ["advice", "noun:建議"],
  ["news", "noun:新聞"],
  ["equipment", "noun:器材 / 設備"],
  ["furniture", "noun:家具"]
].forEach(([word, expected]) => {
  assert.deepStrictEqual(
    senseBank.lookup(word).map((entry) => `${entry.pos}:${entry.meaning}`),
    [expected]
  );
});

const hawker = senseBank.lookup("hawker");
assert.strictEqual(hawker[0].pos, "noun");
assert.strictEqual(hawker[0].meaning, "小販");

assert.deepStrictEqual(
  senseBank.lookup("swift").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:迅速的 / 敏捷的"]
);
assert.deepStrictEqual(
  senseBank.lookup("won't").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["modal:不會 / 將不會"]
);
assert.deepStrictEqual(
  senseBank.lookup("ought to").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["modal:應該"]
);
assert.deepStrictEqual(
  senseBank.lookup("delicacy").map((entry) => `${entry.pos}:${entry.meaning}`),
  [
    "noun:佳餚",
    "noun:精緻 / 微妙"
  ]
);
assert.deepStrictEqual(
  senseBank.lookup("characteristic").map((entry) => `${entry.pos}:${entry.meaning}`),
  [
    "adjective:典型的",
    "adjective:特有的",
    "noun:特徵",
    "noun:特點"
  ]
);
assert.deepStrictEqual(
  senseBank.lookup("considerable").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:相當大的", "adjective:可觀的"]
);
assert.deepStrictEqual(
  senseBank.lookup("critical").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:關鍵的", "adjective:批判性的", "adjective:危急的"]
);
assert.deepStrictEqual(
  senseBank.lookup("decline").map((entry) => `${entry.pos}:${entry.meaning}`),
  [
    "noun:下降",
    "noun:衰退",
    "verb:下降",
    "verb:衰退",
    "verb:婉拒 / 拒絕"
  ]
);
assert.deepStrictEqual(
  senseBank.lookup("dependent").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:依賴的", "adjective:取決於...的"]
);
assert.deepStrictEqual(
  senseBank.lookup("desperate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:絕望的", "adjective:極需要的"]
);
assert.deepStrictEqual(
  senseBank.lookup("distinct").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:明顯不同的", "adjective:清楚的"]
);
assert.deepStrictEqual(
  senseBank.lookup("display").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:展示", "verb:顯示", "noun:展示 / 陳列", "noun:顯示器 / 顯示畫面"]
);
assert.deepStrictEqual(
  senseBank.lookup("distribute").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:分發", "verb:分配", "verb:分佈"]
);
assert.deepStrictEqual(
  senseBank.lookup("distribution").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:分發", "noun:分配", "noun:分佈"]
);
assert.deepStrictEqual(
  senseBank.lookup("document").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:文件", "verb:記錄", "verb:證明"]
);
assert.deepStrictEqual(
  senseBank.lookup("donation").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:捐款", "noun:捐贈"]
);
assert.deepStrictEqual(
  senseBank.lookup("dramatic").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:巨大的 / 突然的", "adjective:戲劇的"]
);
assert.deepStrictEqual(
  senseBank.lookup("edit").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:編輯", "verb:修改"]
);
assert.deepStrictEqual(
  senseBank.lookup("eliminate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:消除", "verb:淘汰"]
);
assert.deepStrictEqual(
  senseBank.lookup("emphasis").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:強調", "noun:重點"]
);
assert.deepStrictEqual(
  senseBank.lookup("demonstrate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:示範", "verb:展示", "verb:顯示", "verb:證明"]
);
assert.deepStrictEqual(
  senseBank.lookup("embrace").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:接受", "verb:支持"]
);
assert.deepStrictEqual(
  senseBank.lookup("evaluate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:評估", "verb:評價"]
);
assert.deepStrictEqual(
  senseBank.lookup("create").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:創造", "verb:建立"]
);
assert.deepStrictEqual(
  senseBank.lookup("comfort").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:舒適", "noun:安慰", "verb:安慰"]
);
assert.deepStrictEqual(
  senseBank.lookup("turn").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:轉動", "verb:轉彎", "noun:輪流", "noun:次序"]
);
assert.deepStrictEqual(
  senseBank.lookup("close").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:關閉", "adjective:接近的", "adjective:親密的", "adverb:接近地", "noun:結束"]
);
assert.deepStrictEqual(
  senseBank.lookup("state").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:狀態", "noun:州", "noun:國家", "verb:陳述 / 說明", "adjective:國家的 / 州的"]
);
assert.deepStrictEqual(
  senseBank.lookup("hold").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:拿著 / 握住", "verb:舉行", "verb:容納", "verb:持有", "noun:抓握", "noun:控制"]
);
assert.deepStrictEqual(
  senseBank.lookup("record").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:記錄", "noun:紀錄", "noun:唱片", "verb:記錄", "verb:錄音", "verb:錄影"]
);
assert.deepStrictEqual(
  senseBank.lookup("right").map((entry) => `${entry.pos}:${entry.meaning}`),
  [
    "adjective:正確的",
    "adjective:右邊的",
    "noun:右邊 / 右方",
    "adverb:向右",
    "noun:權利",
    "adverb:正確地",
    "adverb:立刻 / 馬上"
  ]
);
assert.deepStrictEqual(
  senseBank.lookup("left").map((entry) => `${entry.pos}:${entry.meaning}`),
  [
    "adjective:左邊的",
    "noun:左邊",
    "adverb:向左",
    "adverb:在左邊",
    "verb:離開了（leave 的過去式 / PP）",
    "verb:留下了（leave 的過去式 / PP）",
    "verb:離開 / 遺留 / 剩下（leave 過去式 / PP）"
  ]
);
assert.deepStrictEqual(
  senseBank.lookup("light").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:光", "noun:燈", "adjective:輕的", "adjective:淺色的", "verb:點燃"]
);
assert.deepStrictEqual(
  senseBank.lookup("sound").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:聲音", "verb:聽起來", "adjective:合理的", "adjective:可靠的"]
);
assert.deepStrictEqual(
  senseBank.lookup("class").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:班級", "noun:課堂", "noun:種類 / 類別"]
);
assert.deepStrictEqual(
  senseBank.lookup("hard").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:困難的", "adjective:硬的", "adverb:努力地"]
);
assert.deepStrictEqual(
  senseBank.lookup("free").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:免費的", "adjective:自由的", "adverb:免費地", "verb:釋放 / 使自由"]
);
assert.deepStrictEqual(
  senseBank.lookup("ask").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:問", "verb:要求"]
);
assert.deepStrictEqual(
  senseBank.lookup("call").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:打電話", "verb:稱呼", "noun:電話 / 呼叫"]
);
assert.deepStrictEqual(
  senseBank.lookup("see").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:看見", "verb:明白"]
);
assert.deepStrictEqual(
  senseBank.lookup("tell").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:告訴", "verb:講述"]
);
assert.deepStrictEqual(
  senseBank.lookup("get").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:得到", "verb:取得", "verb:收到", "verb:到達", "verb:變得"]
);
assert.deepStrictEqual(
  senseBank.lookup("make").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:製作", "verb:製造", "verb:使", "verb:令", "noun:品牌 / 型號"]
);
assert.deepStrictEqual(
  senseBank.lookup("take").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:拿", "verb:取", "verb:帶", "verb:乘搭", "verb:花費時間"]
);
assert.deepStrictEqual(
  senseBank.lookup("order").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:次序", "noun:命令", "noun:訂單", "verb:訂購", "verb:命令"]
);
assert.deepStrictEqual(
  senseBank.lookup("present").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:禮物", "noun:現在", "adjective:現在的", "adjective:在場的", "verb:呈現", "verb:展示", "verb:頒發"]
);
assert.deepStrictEqual(
  senseBank.lookup("cub").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:幼獸"]
);
assert.deepStrictEqual(
  senseBank.lookup("cubs").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:幼獸"]
);
assert.deepStrictEqual(
  senseBank.lookup("bear").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:熊:override", "verb:忍受:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("draw").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:畫畫:override", "verb:吸引:override", "noun:平局 / 和局:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("match").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:比賽:override", "noun:火柴:override", "verb:配對:override", "verb:相配:override", "verb:相襯:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("park").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:公園:override", "verb:泊車:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("plant").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:植物:override", "noun:工廠:override", "verb:種植:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("stand").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:站立:override", "verb:忍受:override", "noun:攤位 / 看台:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("rule out").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["phrase:verb:排除 / 不考慮:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("guts").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:膽量 / 勇氣:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("room").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:房間:override", "noun:空間:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("table").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:桌子:override", "noun:表格:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("be").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:是:override", "verb:成為:override", "auxiliary:be 動詞（am / is / are / was / were）:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("do").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:做:override", "verb:進行:override", "auxiliary:用於問句 / 否定句:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("form").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:表格:override", "noun:形式:override", "noun:形態:override", "verb:形成:override", "verb:組成:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("list").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:清單:override", "noun:名單:override", "verb:列出:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("green").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adjective:綠色的:override", "noun:綠色:override", "adjective:環保的:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("description").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:描述:override", "noun:說明:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("picture").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:圖畫:override", "noun:相片:override", "verb:想像:override", "verb:描繪:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("purpose").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:目的:override", "noun:用途:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("probably").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adverb:很可能 / 大概:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("regular").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adjective:定期的:override", "adjective:規則的:override", "noun:常客:override", "adjective:普通的 / 一般的:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("stage").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:舞台:override", "noun:階段:override", "verb:上演:override", "verb:舉辦:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("thought").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:想法:override", "noun:念頭:override", "verb:想 / 認為 / 思考（think 過去式 / PP）:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("yet").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adverb:尚未:override", "adverb:還:override", "conjunction:但是:override", "conjunction:然而:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("even").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adverb:甚至:override", "adjective:平坦的:override", "adjective:平均的:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("if").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["conjunction:如果:override", "conjunction:是否:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("by").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["preposition:由:override", "preposition:被:override", "preposition:靠近:override", "adverb:經過:override", "adverb:在旁邊:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("may").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["may:modal:可能:override", "may:modal:可以:override", "May:noun:五月:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("it").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["it:pronoun:它 / 牠 / 這件事:override", "IT:noun:資訊科技:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("or").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["conjunction:或者:override", "conjunction:否則:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("will").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["modal:將會:override", "modal:會:override", "noun:意志:override", "noun:遺囑:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("around").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["preposition:在...周圍:override", "adverb:到處:override", "adverb:大約:override", "adverb:在周圍:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("could").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["modal:可以:override", "modal:可能:override", "modal:能夠:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("just").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adverb:只是:override", "adverb:剛剛:override", "adverb:正好:override", "adjective:公正的:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("with").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["preposition:和...一起:override", "preposition:帶有:override", "preposition:使用:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("would").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["modal:會:override", "modal:願意:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("event").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:活動:override", "noun:事件:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("live").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:住:override", "verb:生活:override", "adjective:現場直播的:override", "adverb:現場直播地:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("move").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:移動:override", "verb:搬動:override", "verb:感動:override", "noun:行動:override", "noun:移動:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("model").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:模型:override", "noun:模特兒:override", "verb:示範:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("apply").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:申請:override", "verb:應用:override", "verb:使用:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("count").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:數:override", "verb:計算:override", "verb:重要:override", "verb:算數:override", "noun:數目:override", "noun:總數:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("direct").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adjective:直接的:override", "adverb:直接地:override", "verb:指導 / 指揮:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("experience").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:經驗:override", "noun:經歷:override", "verb:經歷:override", "verb:體驗:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("expression").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:表達:override", "noun:表情:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("feature").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:特色:override", "noun:特徵:override", "verb:以...為特色:override", "verb:由...主演:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("physical").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adjective:身體的:override", "adjective:物理的:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("population").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:人口:override", "noun:族群 / 動植物群體:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("develop").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:發展:override", "verb:成長:override", "verb:培養:override", "verb:形成:override", "verb:患上:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("development").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:發展", "noun:新發展 / 發展項目"]
);
assert.deepStrictEqual(
  senseBank.lookup("produce").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:生產:override", "verb:製造:override", "noun:農產品:override", "noun:農作物:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("process").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:過程:override", "noun:程序:override", "verb:處理:override", "verb:加工:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("rise").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:上升:override", "verb:升起:override", "noun:上升:override", "noun:增加:override", "verb:發酵膨脹:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("sign").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:標誌:override", "noun:跡象:override", "verb:簽署:override", "verb:簽名:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("shape").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:形狀:override", "verb:塑造:override", "verb:影響:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("keep").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:保持:override", "verb:保留:override", "verb:留著:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("meet").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:遇見:override", "verb:見面:override", "verb:滿足 / 符合:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("experiment").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:實驗:override", "verb:進行實驗:override", "verb:嘗試:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("following").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adjective:以下的:override", "adjective:接著的:override", "preposition:在...之後:override", "noun:追隨者:override", "noun:支持者:override", "verb:跟隨 / 遵守（follow ING）:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("mobile").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:手機:override", "adjective:流動的:override", "adjective:可移動的:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("notice").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:告示:override", "noun:通知:override", "verb:注意到 / 留意:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("separate").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:分開:override", "verb:分離:override", "adjective:分開的:override", "adjective:獨立的:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("survey").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:問卷調查:override", "noun:調查:override", "verb:調查:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("request").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:要求:override", "noun:請求:override", "verb:要求:override", "verb:請求:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("specific").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adjective:特定的:override", "adjective:具體的:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("consider").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:考慮:override", "verb:認為:override", "verb:視為:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("several").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["determiner:幾個 / 數個:override", "pronoun:幾個 / 數個:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("industry").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:行業:override", "noun:工業:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("drug").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:藥物:override", "noun:毒品:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("code").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:代碼:override", "noun:編碼:override", "verb:編程 / 寫程式:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("introduce").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:介紹:override", "verb:引入:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("join").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:加入:override", "verb:參加:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("know").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:知道:override", "verb:認識:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("step").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:步驟 / 措施:override", "noun:腳步:override", "verb:踏 / 踩:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("wave").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:波浪:override", "noun:揮手:override", "verb:揮手:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("whole").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adjective:整個的 / 全部的:override", "noun:整體:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("power").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:力量:override", "noun:能力:override", "noun:權力:override", "noun:電力:override", "verb:為...提供動力:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("image").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:圖像:override", "noun:形象:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("movement").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:移動:override", "noun:運動:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("particular").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adjective:特定的:override", "adjective:特別的:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("rather").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adverb:頗:override", "adverb:相當:override", "adverb:反而:override", "adverb:而是:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("department").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:部門:override", "noun:政府部門:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("desert").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:沙漠:override", "verb:遺棄:override", "verb:離棄:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("competition").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:比賽:override", "noun:競爭:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("play").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:玩 / 打（球類）:override", "verb:演奏:override", "noun:戲劇:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("country").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:國家:override", "noun:鄉郊:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("alternative").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:替代品:override", "noun:另一選擇:override", "adjective:替代的:override", "adjective:另一選擇的:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("late").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  [
    "adjective:遲的:override",
    "adjective:晚的:override",
    "adjective:已故的:override",
    "adverb:遲:override",
    "adverb:晚:override"
  ]
);
assert.deepStrictEqual(
  senseBank.lookup("learn").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:學習:override", "verb:得知:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("moment").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:時刻:override", "noun:片刻:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("ordinary").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adjective:平凡的:override", "adjective:普通的:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("involve").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:涉及:override", "verb:牽涉:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("individual").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:個人:override", "adjective:個別的:override", "adjective:個人的:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("still").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adverb:仍然:override", "adjective:靜止的:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("recent").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adjective:最近的 / 近期的:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("technology").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:科技 / 技術:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("unfortunately").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adverb:不幸地 / 可惜地:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("field").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:田野 / 運動場:override", "noun:領域 / 範疇:override", "noun:田地 / 農田:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("article").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:文章", "noun:冠詞"]
);
assert.deepStrictEqual(
  senseBank.lookup("ground").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:地面 / 土地", "noun:理由 / 根據", "verb:磨碎 / 碾碎（grind 過去式 / PP）"]
);
assert.deepStrictEqual(
  senseBank.lookup("incredible").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["adjective:難以置信的:override", "adjective:精彩的 / 非常好的:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("used to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["phrase:modal:過去曾經 / 以前會:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("jewellery").map((entry) => `${entry.pos}:${entry.meaning}:${entry.level}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:珠寶:A2:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("behaviour").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:行為:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("realise").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:意識到:override", "verb:實現:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("realize").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:意識到:override", "verb:實現:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("recognise").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:認出:override", "verb:認可:override", "verb:承認:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("recognize").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:認出:override", "verb:認可:override", "verb:承認:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("organise").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:組織:override", "verb:安排:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("organize").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["verb:組織:override", "verb:安排:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("USA").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["USA:noun:美國:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("UK").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["UK:noun:英國:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("GS").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["GS:noun:常識科:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("P.E. lesson").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["P.E. lesson:phrase:noun:體育課:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("tutorial centre").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["phrase:noun:補習社:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("Mongkok").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["Mongkok:noun:旺角:override"]
);
assert.deepStrictEqual(
  senseBank.lookup("egg waffle").map((entry) => `${entry.pos}:${entry.meaning}:${entry.overrideTeacher ? "override" : ""}`),
  ["noun:雞蛋仔:override"]
);

assert.deepStrictEqual(
  senseBank.lookup("customer-centric").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:以顧客為中心的"]
);
assert.deepStrictEqual(
  senseBank.lookup("Czech").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:捷克人 / 捷克語", "adjective:捷克的"]
);
assert.deepStrictEqual(
  senseBank.lookup("rise to fame").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:變得出名"]
);
assert.deepStrictEqual(
  senseBank.lookup("pretty").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:漂亮的", "adverb:頗 / 相當"]
);
assert.deepStrictEqual(
  senseBank.lookup("validity").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:有效性", "noun:合理性"]
);
assert.deepStrictEqual(
  senseBank.lookup("beard").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:鬍鬚"]
);
assert.deepStrictEqual(
  senseBank.lookup("hammer").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:錘子", "verb:用錘敲打"]
);
assert.deepStrictEqual(
  senseBank.lookup("cancelled").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:取消"]
);
assert.deepStrictEqual(
  senseBank.lookup("cancelling").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:取消"]
);
assert.deepStrictEqual(
  senseBank.lookup("spring").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:春天", "noun:泉水", "verb:跳起 / 彈起"]
);
assert.deepStrictEqual(
  senseBank.lookup("lie").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:說謊", "noun:謊言", "verb:躺 / 平放"]
);
assert.deepStrictEqual(
  senseBank.lookup("pass").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:通行證", "verb:通過", "verb:及格", "verb:經過", "verb:傳遞"]
);
assert.deepStrictEqual(
  senseBank.lookup("note").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:筆記", "noun:便條", "noun:音符", "verb:注意 / 記下"]
);
assert.deepStrictEqual(
  senseBank.lookup("return").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:返回", "verb:歸還", "noun:返回", "noun:歸還"]
);
assert.deepStrictEqual(
  senseBank.lookup("show").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:展示", "verb:顯示", "verb:給...看", "noun:表演", "noun:節目"]
);
assert.deepStrictEqual(
  senseBank.lookup("force").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:力量", "noun:武力", "verb:強迫"]
);
assert.deepStrictEqual(
  senseBank.lookup("end").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:結束", "noun:末端", "verb:結束"]
);
assert.deepStrictEqual(
  senseBank.lookup("section").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:部分", "noun:區段"]
);
assert.deepStrictEqual(
  senseBank.lookup("ticket").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:票", "noun:罰單"]
);
assert.deepStrictEqual(
  senseBank.lookup("ride").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:騎", "verb:乘搭", "noun:乘車", "noun:騎乘"]
);
assert.deepStrictEqual(
  senseBank.lookup("time").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:時間", "noun:次", "verb:計時"]
);
assert.deepStrictEqual(
  senseBank.lookup("visit").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:探訪", "verb:參觀", "noun:探訪", "noun:參觀"]
);
assert.deepStrictEqual(
  senseBank.lookup("walk").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:走路", "noun:散步", "noun:步行"]
);
assert.deepStrictEqual(
  senseBank.lookup("parent").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:父母", "noun:家長"]
);
assert.deepStrictEqual(
  senseBank.lookup("piece").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:一塊", "noun:一件"]
);
assert.deepStrictEqual(
  senseBank.lookup("send").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:發送", "verb:寄"]
);
assert.deepStrictEqual(
  senseBank.lookup("stay").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:停留", "verb:留下", "noun:停留"]
);
assert.deepStrictEqual(
  senseBank.lookup("title").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:標題", "noun:頭銜", "verb:給...加標題"]
);
assert.deepStrictEqual(
  senseBank.lookup("use").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:使用", "noun:使用", "noun:用途"]
);
assert.deepStrictEqual(
  senseBank.lookup("video").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:影片", "noun:錄像"]
);
assert.deepStrictEqual(
  senseBank.lookup("position").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:位置", "noun:職位", "verb:安置", "verb:放置"]
);
assert.deepStrictEqual(
  senseBank.lookup("permit").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:允許", "noun:許可證"]
);
assert.deepStrictEqual(
  senseBank.lookup("charge").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:充電", "verb:收費", "verb:指控", "noun:費用", "noun:指控", "noun:控罪"]
);
assert.deepStrictEqual(
  senseBank.lookup("matter").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:事情", "noun:問題", "noun:物質", "verb:重要 / 有關係"]
);
assert.deepStrictEqual(
  senseBank.lookup("point").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:重點", "noun:分數", "noun:點 / 小點", "verb:指著 / 指向"]
);
assert.deepStrictEqual(
  senseBank.lookup("period").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:時期 / 期間", "noun:課節", "noun:句號"]
);
assert.deepStrictEqual(
  senseBank.lookup("run").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:跑", "verb:經營 / 營運", "verb:運行", "noun:跑步 / 一段路程"]
);
assert.deepStrictEqual(
  senseBank.lookup("case").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:情況", "noun:個案", "noun:案件", "noun:盒", "noun:箱"]
);
assert.deepStrictEqual(
  senseBank.lookup("based on").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:preposition:根據 / 基於"]
);
assert.deepStrictEqual(
  senseBank.lookup("catch on").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:流行起來 / 開始明白"]
);
assert.deepStrictEqual(
  senseBank.lookup("cater for").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:滿足...需要 / 提供餐飲"]
);
assert.deepStrictEqual(
  senseBank.lookup("capitalise on").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:利用 / 善用"]
);
assert.deepStrictEqual(
  senseBank.lookup("capitalize on").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["capitalise on:phrase:verb:利用 / 善用"]
);
assert.deepStrictEqual(
  senseBank.lookup("be supposed to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:應該 / 本應"]
);
assert.deepStrictEqual(
  senseBank.lookup("break the bank").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:花很多錢 / 太昂貴"]
);
assert.deepStrictEqual(
  senseBank.lookup("conduct").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:行為", "verb:進行", "verb:指揮"]
);
assert.deepStrictEqual(
  senseBank.lookup("entrance exam").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:入學試"]
);
assert.deepStrictEqual(
  senseBank.lookup("object").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:物件", "verb:反對", "noun:目的 / 目標"]
);
assert.deepStrictEqual(
  senseBank.lookup("project").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:專題", "noun:項目", "verb:預計", "verb:投射", "verb:使聲音傳遠 / 放聲說話"]
);
assert.deepStrictEqual(
  senseBank.lookup("refuse").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:拒絕", "noun:垃圾 / 廢物"]
);
assert.deepStrictEqual(
  senseBank.lookup("abrupt").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:突然的"]
);
assert.deepStrictEqual(
  senseBank.lookup("absolute").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:絕對的"]
);
assert.deepStrictEqual(
  senseBank.lookup("abundant").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:充足的 / 豐富的"]
);
assert.deepStrictEqual(
  senseBank.lookup("academy").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:學院"]
);
assert.deepStrictEqual(
  senseBank.lookup("accessible").map((entry) => `${entry.pos}:${entry.meaning}`),
  [
    "adjective:容易到達的 / 容易使用的",
    "adjective:易於接觸的 / 容易理解的"
  ]
);
assert.deepStrictEqual(
  senseBank.lookup("adjust").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:調整"]
);
assert.deepStrictEqual(
  senseBank.lookup("admire").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:欣賞 / 佩服"]
);
assert.deepStrictEqual(
  senseBank.lookup("advise").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:建議"]
);
assert.deepStrictEqual(
  senseBank.lookup("agenda").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:議程"]
);
assert.deepStrictEqual(
  senseBank.lookup("aftermath").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:後果 / 餘波"]
);
assert.deepStrictEqual(
  senseBank.lookup("alcohol").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:酒精 / 酒類飲品"]
);
assert.deepStrictEqual(
  senseBank.lookup("align").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:對齊 / 使一致"]
);
assert.deepStrictEqual(
  senseBank.lookup("allocate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:分配"]
);
assert.deepStrictEqual(
  senseBank.lookup("alter").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:改變 / 修改"]
);
assert.deepStrictEqual(
  senseBank.lookup("aluminium").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:鋁"]
);
assert.deepStrictEqual(
  senseBank.lookup("amend").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:修改 / 修訂"]
);
assert.deepStrictEqual(
  senseBank.lookup("analysis").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:分析"]
);
assert.deepStrictEqual(
  senseBank.lookup("anniversary").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:周年紀念"]
);
assert.deepStrictEqual(
  senseBank.lookup("announce").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:宣布"]
);
assert.deepStrictEqual(
  senseBank.lookup("anonymous").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:匿名的"]
);
assert.deepStrictEqual(
  senseBank.lookup("anxiety").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:焦慮 / 憂慮"]
);
assert.deepStrictEqual(
  senseBank.lookup("apparatus").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:儀器 / 裝置"]
);
assert.deepStrictEqual(
  senseBank.lookup("appear").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:出現", "verb:似乎"]
);
assert.deepStrictEqual(
  senseBank.lookup("appetite").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:胃口 / 食慾"]
);
assert.deepStrictEqual(
  senseBank.lookup("applaud").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:鼓掌 / 讚賞"]
);
assert.deepStrictEqual(
  senseBank.lookup("appreciate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:欣賞 / 感激"]
);
assert.deepStrictEqual(
  senseBank.lookup("approve").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:批准 / 贊成"]
);
assert.deepStrictEqual(
  senseBank.lookup("approximately").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adverb:大約"]
);
assert.deepStrictEqual(
  senseBank.lookup("archive").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:檔案庫", "verb:存檔"]
);
assert.deepStrictEqual(
  senseBank.lookup("arguably").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adverb:可以說 / 可能是"]
);
assert.deepStrictEqual(
  senseBank.lookup("arise").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:出現 / 產生"]
);
assert.deepStrictEqual(
  senseBank.lookup("arrange").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:安排"]
);
assert.deepStrictEqual(
  senseBank.lookup("assist").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:協助"]
);
assert.deepStrictEqual(
  senseBank.lookup("assistance").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:協助 / 援助"]
);
assert.deepStrictEqual(
  senseBank.lookup("assume").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:假設 / 以為"]
);
assert.deepStrictEqual(
  senseBank.lookup("assumption").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:假設"]
);
assert.deepStrictEqual(
  senseBank.lookup("athlete").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:運動員"]
);
assert.deepStrictEqual(
  senseBank.lookup("athleticism").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:運動能力"]
);
assert.deepStrictEqual(
  senseBank.lookup("atmosphere").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:氣氛", "noun:大氣層"]
);
assert.deepStrictEqual(
  senseBank.lookup("attach").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:附上 / 連接"]
);
assert.deepStrictEqual(
  senseBank.lookup("attain").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:達到 / 達成"]
);
assert.deepStrictEqual(
  senseBank.lookup("attract").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:吸引"]
);
assert.deepStrictEqual(
  senseBank.lookup("available").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:可取得的 / 有空的"]
);
assert.deepStrictEqual(
  senseBank.lookup("average").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:平均數", "verb:平均為", "adjective:一般的 / 平均的"]
);
assert.deepStrictEqual(
  senseBank.lookup("awkward").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:尷尬的 / 笨拙的"]
);
assert.deepStrictEqual(
  senseBank.lookup("bacteria").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:細菌"]
);
assert.deepStrictEqual(
  senseBank.lookup("band").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:樂隊", "noun:帶子 / 橡筋圈", "noun:一群 / 一夥"]
);
assert.deepStrictEqual(
  senseBank.lookup("base").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:基地", "noun:基礎", "verb:以...為基礎"]
);
assert.deepStrictEqual(
  senseBank.lookup("beam").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:樑 / 光束", "verb:微笑 / 發光"]
);
assert.deepStrictEqual(
  senseBank.lookup("benefit").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:好處", "verb:有益於", "verb:受益"]
);
assert.deepStrictEqual(
  senseBank.lookup("beat").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:打敗", "verb:打", "noun:節拍", "noun:心跳"]
);
assert.deepStrictEqual(
  senseBank.lookup("belief").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:信念 / 信仰"]
);
assert.deepStrictEqual(
  senseBank.lookup("belongings").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:個人物品 / 財物"]
);
assert.deepStrictEqual(
  senseBank.lookup("beneath").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["preposition:在...下方"]
);
assert.deepStrictEqual(
  senseBank.lookup("bias").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:偏見"]
);
assert.deepStrictEqual(
  senseBank.lookup("bold").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:大膽的", "adjective:粗體的"]
);
assert.deepStrictEqual(
  senseBank.lookup("block").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:大廈", "noun:街區", "noun:一塊", "noun:一段", "verb:阻擋", "verb:堵塞"]
);
assert.deepStrictEqual(
  senseBank.lookup("board").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:板", "noun:委員會 / 董事會", "verb:登上 / 上車"]
);
assert.deepStrictEqual(
  senseBank.lookup("border").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:邊界", "noun:國界", "verb:與...接壤"]
);
assert.deepStrictEqual(
  senseBank.lookup("budget").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:預算", "verb:制定預算", "verb:節省開支"]
);
assert.deepStrictEqual(
  senseBank.lookup("boom").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:快速增長", "noun:繁榮", "verb:快速發展"]
);
assert.deepStrictEqual(
  senseBank.lookup("bother").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:打擾", "verb:煩擾"]
);
assert.deepStrictEqual(
  senseBank.lookup("boundary").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:邊界", "noun:界線"]
);
assert.deepStrictEqual(
  senseBank.lookup("boutique").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:時裝店", "noun:精品店", "adjective:小型精品式的 / 高端小眾的"]
);
assert.deepStrictEqual(
  senseBank.lookup("breath").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:呼吸", "noun:氣息"]
);
assert.deepStrictEqual(
  senseBank.lookup("bubble").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:氣泡", "noun:泡泡"]
);
assert.deepStrictEqual(
  senseBank.lookup("calm").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:冷靜的", "adjective:平靜的", "verb:使平靜", "noun:平靜"]
);
assert.deepStrictEqual(
  senseBank.lookup("candidate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:候選人", "noun:參加者", "noun:可能選項 / 候選對象"]
);
assert.deepStrictEqual(
  senseBank.lookup("captain").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:隊長", "noun:船長", "noun:機長"]
);
assert.deepStrictEqual(
  senseBank.lookup("central").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["central:adjective:中央的", "central:adjective:主要的", "Central:noun:中環"]
);
assert.deepStrictEqual(
  senseBank.lookup("channel").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:頻道", "noun:渠道", "noun:途徑"]
);
assert.deepStrictEqual(
  senseBank.lookup("cheat").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:作弊", "verb:欺騙", "noun:騙子", "noun:作弊者"]
);
assert.deepStrictEqual(
  senseBank.lookup("clause").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:子句", "noun:條款"]
);
assert.deepStrictEqual(
  senseBank.lookup("combination").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:組合", "noun:結合"]
);
assert.deepStrictEqual(
  senseBank.lookup("comic").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:滑稽的", "adjective:喜劇的", "noun:漫畫書"]
);
assert.deepStrictEqual(
  senseBank.lookup("command").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:命令", "verb:命令", "verb:指揮", "noun:掌握", "noun:控制能力"]
);
assert.deepStrictEqual(
  senseBank.lookup("comparative").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:比較的", "adjective:相對的"]
);
assert.deepStrictEqual(
  senseBank.lookup("concerned").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:擔心的", "adjective:有關的", "adjective:相關的"]
);
assert.deepStrictEqual(
  senseBank.lookup("brief").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:短暫的", "adjective:簡短的", "noun:摘要", "noun:指示", "verb:向...簡介"]
);
assert.deepStrictEqual(
  senseBank.lookup("broad").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:寬闊的", "adjective:廣泛的", "adjective:概括的"]
);
assert.deepStrictEqual(
  senseBank.lookup("broadcaster").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:廣播員", "noun:播音員", "noun:廣播機構"]
);
assert.deepStrictEqual(
  senseBank.lookup("broadly").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adverb:大體上", "adverb:廣泛地"]
);
assert.deepStrictEqual(
  senseBank.lookup("cable").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:電纜", "noun:纜線", "noun:有線電視"]
);
assert.deepStrictEqual(
  senseBank.lookup("calculate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:計算", "verb:估計", "verb:推算"]
);
assert.deepStrictEqual(
  senseBank.lookup("burn").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:燃燒", "verb:燒傷", "noun:燒傷"]
);
assert.deepStrictEqual(
  senseBank.lookup("bury").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:埋葬", "verb:埋藏"]
);
assert.deepStrictEqual(
  senseBank.lookup("campaign").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:活動", "noun:運動", "verb:發起運動", "verb:參與運動"]
);
assert.deepStrictEqual(
  senseBank.lookup("cabinet").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:櫥櫃", "noun:內閣"]
);
assert.deepStrictEqual(
  senseBank.lookup("calendar").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:日曆 / 月曆"]
);
assert.deepStrictEqual(
  senseBank.lookup("canvas").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:畫布", "noun:帆布"]
);
assert.deepStrictEqual(
  senseBank.lookup("capital").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:首都", "noun:資本", "noun:資金", "adjective:大寫的"]
);
assert.deepStrictEqual(
  senseBank.lookup("capability").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:能力"]
);
assert.deepStrictEqual(
  senseBank.lookup("capacity").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:容量", "noun:能力", "noun:職位 / 身分"]
);
assert.deepStrictEqual(
  senseBank.lookup("career").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:職業", "noun:事業"]
);
assert.deepStrictEqual(
  senseBank.lookup("carve").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:雕刻"]
);
assert.deepStrictEqual(
  senseBank.lookup("cease").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:停止", "verb:終止"]
);
assert.deepStrictEqual(
  senseBank.lookup("century").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:世紀"]
);
assert.deepStrictEqual(
  senseBank.lookup("charm").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:魅力", "verb:吸引 / 迷住"]
);
assert.deepStrictEqual(
  senseBank.lookup("charming").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:迷人的", "adjective:有魅力的"]
);
assert.deepStrictEqual(
  senseBank.lookup("challenge").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:挑戰", "verb:挑戰", "verb:質疑"]
);
assert.deepStrictEqual(
  senseBank.lookup("capture").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:捕捉", "verb:俘虜", "verb:拍攝", "verb:記錄", "noun:捕獲", "noun:佔領"]
);
assert.deepStrictEqual(
  senseBank.lookup("casual").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:隨便的", "adjective:非正式的", "adjective:偶然的"]
);
assert.deepStrictEqual(
  senseBank.lookup("chest").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:胸部", "noun:胸腔"]
);
assert.deepStrictEqual(
  senseBank.lookup("classify").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:分類"]
);
assert.deepStrictEqual(
  senseBank.lookup("client").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:客戶"]
);
assert.deepStrictEqual(
  senseBank.lookup("clean").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:乾淨的", "verb:清潔"]
);
assert.deepStrictEqual(
  senseBank.lookup("cloth").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:布 / 布料"]
);
assert.deepStrictEqual(
  senseBank.lookup("coast").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:海岸"]
);
assert.deepStrictEqual(
  senseBank.lookup("collaboration").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:合作 / 協作"]
);
assert.deepStrictEqual(
  senseBank.lookup("combine").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:結合 / 組合"]
);
assert.deepStrictEqual(
  senseBank.lookup("commercial").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:商業的", "noun:廣告"]
);
assert.deepStrictEqual(
  senseBank.lookup("commit").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:犯 / 承諾"]
);
assert.deepStrictEqual(
  senseBank.lookup("commence").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:開始"]
);
assert.deepStrictEqual(
  senseBank.lookup("company").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:公司", "noun:陪伴"]
);
assert.deepStrictEqual(
  senseBank.lookup("compassion").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:同情心 / 憐憫"]
);
assert.deepStrictEqual(
  senseBank.lookup("compete").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:競爭 / 比賽"]
);
assert.deepStrictEqual(
  senseBank.lookup("complaint").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:投訴 / 抱怨"]
);
assert.deepStrictEqual(
  senseBank.lookup("comprise").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:包含 / 由...組成"]
);
assert.deepStrictEqual(
  senseBank.lookup("concept").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:概念"]
);
assert.deepStrictEqual(
  senseBank.lookup("confirm").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:確認"]
);
assert.deepStrictEqual(
  senseBank.lookup("conservation").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:保育 / 保護"]
);
assert.deepStrictEqual(
  senseBank.lookup("consistently").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adverb:持續地 / 一貫地"]
);
assert.deepStrictEqual(
  senseBank.lookup("constantly").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adverb:不斷地"]
);
assert.deepStrictEqual(
  senseBank.lookup("constraint").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:限制 / 約束"]
);
assert.deepStrictEqual(
  senseBank.lookup("consult").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:諮詢 / 請教"]
);
assert.deepStrictEqual(
  senseBank.lookup("contain").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:包含 / 含有"]
);
assert.deepStrictEqual(
  senseBank.lookup("controversy").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:爭議 / 爭論"]
);
assert.deepStrictEqual(
  senseBank.lookup("convert").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:轉換 / 改變"]
);
assert.deepStrictEqual(
  senseBank.lookup("convey").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:傳達 / 傳遞"]
);
assert.deepStrictEqual(
  senseBank.lookup("convince").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:說服"]
);
assert.deepStrictEqual(
  senseBank.lookup("corporation").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:公司 / 企業"]
);
assert.deepStrictEqual(
  senseBank.lookup("council").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:議會 / 委員會"]
);
assert.deepStrictEqual(
  senseBank.lookup("counterpart").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:對應的人 / 對應物"]
);
assert.deepStrictEqual(
  senseBank.lookup("crash").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:撞擊 / 崩潰", "noun:撞車 / 崩潰"]
);
assert.deepStrictEqual(
  senseBank.lookup("creature").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:生物"]
);
assert.deepStrictEqual(
  senseBank.lookup("credit").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:信用 / 學分 / 讚揚", "verb:歸功於"]
);
assert.deepStrictEqual(
  senseBank.lookup("criteria").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:標準 / 準則"]
);
assert.deepStrictEqual(
  senseBank.lookup("critic").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:批評者 / 評論家"]
);
assert.deepStrictEqual(
  senseBank.lookup("criticism").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:批評"]
);
assert.deepStrictEqual(
  senseBank.lookup("crucial").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:至關重要的"]
);
assert.deepStrictEqual(
  senseBank.lookup("cruel").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:殘忍的"]
);
assert.deepStrictEqual(
  senseBank.lookup("cultural").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:文化的"]
);
assert.deepStrictEqual(
  senseBank.lookup("curiosity").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:好奇心"]
);
assert.deepStrictEqual(
  senseBank.lookup("currency").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:貨幣"]
);
assert.deepStrictEqual(
  senseBank.lookup("current").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:目前的 / 現時的", "noun:水流 / 氣流 / 電流"]
);
assert.deepStrictEqual(
  senseBank.lookup("currently").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adverb:目前 / 現時"]
);
assert.deepStrictEqual(
  senseBank.lookup("cure").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:治療 / 治癒", "noun:療法"]
);
assert.deepStrictEqual(
  senseBank.lookup("deny").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:否認", "verb:拒絕給予"]
);
assert.deepStrictEqual(
  senseBank.lookup("determine").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:決定 / 確定", "verb:影響 / 支配"]
);
assert.deepStrictEqual(
  senseBank.lookup("disappear").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:消失"]
);
assert.deepStrictEqual(
  senseBank.lookup("disaster").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:災難"]
);
assert.deepStrictEqual(
  senseBank.lookup("discover").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:發現"]
);
assert.deepStrictEqual(
  senseBank.lookup("display").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:展示", "verb:顯示", "noun:展示 / 陳列", "noun:顯示器 / 顯示畫面"]
);
assert.deepStrictEqual(
  senseBank.lookup("effective").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:有效的"]
);
assert.deepStrictEqual(
  senseBank.lookup("efficient").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:有效率的"]
);
assert.deepStrictEqual(
  senseBank.lookup("employ").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:僱用", "verb:使用 / 採用"]
);
assert.deepStrictEqual(
  senseBank.lookup("employee").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:僱員 / 員工"]
);
assert.deepStrictEqual(
  senseBank.lookup("employer").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:僱主"]
);
assert.deepStrictEqual(
  senseBank.lookup("encourage").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:鼓勵"]
);
assert.deepStrictEqual(
  senseBank.lookup("enhance").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:提升 / 增強"]
);
assert.deepStrictEqual(
  senseBank.lookup("ensure").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:確保"]
);
assert.deepStrictEqual(
  senseBank.lookup("entire").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:整個的 / 全部的"]
);
assert.deepStrictEqual(
  senseBank.lookup("establish").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:建立 / 成立"]
);
assert.deepStrictEqual(
  senseBank.lookup("examine").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:檢查 / 審查"]
);
assert.deepStrictEqual(
  senseBank.lookup("exist").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:存在"]
);
assert.deepStrictEqual(
  senseBank.lookup("expect").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:預期 / 期待"]
);
assert.deepStrictEqual(
  senseBank.lookup("explore").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:探索 / 探究"]
);
assert.deepStrictEqual(
  senseBank.lookup("express").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:表達", "adjective:特快的 / 明確的"]
);
assert.deepStrictEqual(
  senseBank.lookup("fasten").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:扣緊 / 繫牢"]
);
assert.deepStrictEqual(
  senseBank.lookup("fault").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:錯誤 / 過失", "noun:缺點 / 故障"]
);
assert.deepStrictEqual(
  senseBank.lookup("faith").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:信任", "noun:信心", "noun:信仰"]
);
assert.deepStrictEqual(
  senseBank.lookup("finance").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:財務", "noun:資金", "verb:資助", "verb:提供資金"]
);
assert.deepStrictEqual(
  senseBank.lookup("financial").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:財務的 / 金融的"]
);
assert.deepStrictEqual(
  senseBank.lookup("finding").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:發現", "noun:研究結果", "verb:發現 / 找到（find ING）"]
);
assert.deepStrictEqual(
  senseBank.lookup("forecast").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:預測 / 預報", "verb:預測 / 預報"]
);
assert.deepStrictEqual(
  senseBank.lookup("foundation").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:基礎", "noun:基金會"]
);
assert.deepStrictEqual(
  senseBank.lookup("frighten").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:使害怕 / 嚇怕"]
);
assert.deepStrictEqual(
  senseBank.lookup("gain").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:獲得 / 取得", "noun:增加", "noun:收穫", "verb:增加"]
);
assert.deepStrictEqual(
  senseBank.lookup("gear").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:裝備 / 用具"]
);
assert.deepStrictEqual(
  senseBank.lookup("gender").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:性別"]
);
assert.deepStrictEqual(
  senseBank.lookup("generate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:產生 / 生成"]
);
assert.deepStrictEqual(
  senseBank.lookup("gradual").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:逐漸的"]
);
assert.deepStrictEqual(
  senseBank.lookup("grant").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:準許", "verb:授予", "noun:補助金", "noun:撥款"]
);
assert.deepStrictEqual(
  senseBank.lookup("handle").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:處理 / 應付", "noun:把手 / 手柄", "verb:觸摸 / 操作", "noun:網名 / 用戶名稱"]
);
assert.deepStrictEqual(
  senseBank.lookup("happen").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:發生"]
);
assert.deepStrictEqual(
  senseBank.lookup("harbour").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:海港 / 港口"]
);
assert.deepStrictEqual(
  senseBank.lookup("harm").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:傷害", "noun:損害", "verb:傷害", "verb:損害"]
);
assert.deepStrictEqual(
  senseBank.lookup("heal").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:痊癒 / 治癒"]
);
assert.deepStrictEqual(
  senseBank.lookup("hire").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:聘請 / 僱用", "noun:租用"]
);
assert.deepStrictEqual(
  senseBank.lookup("highlight").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:用螢光筆標示", "verb:突顯", "noun:重點", "noun:亮點"]
);
assert.deepStrictEqual(
  senseBank.lookup("honour").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:榮譽", "verb:尊重 / 表揚", "verb:履行承諾"]
);
assert.deepStrictEqual(
  senseBank.lookup("host").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:主持人", "noun:主人", "verb:主持", "verb:舉辦"]
);
assert.deepStrictEqual(
  senseBank.lookup("leave").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:離開", "verb:留下", "verb:留給", "noun:假期 / 休假"]
);
assert.deepStrictEqual(
  senseBank.lookup("line").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:線", "noun:行", "noun:隊伍", "noun:台詞", "verb:沿...排列"]
);
assert.deepStrictEqual(
  senseBank.lookup("household").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:家庭 / 住戶", "adjective:家庭的 / 家用的"]
);
assert.deepStrictEqual(
  senseBank.lookup("huge").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:巨大的"]
);
assert.deepStrictEqual(
  senseBank.lookup("ignore").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:忽視 / 不理會"]
);
assert.deepStrictEqual(
  senseBank.lookup("income").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:收入"]
);
assert.deepStrictEqual(
  senseBank.lookup("indicate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:顯示 / 表明"]
);
assert.deepStrictEqual(
  senseBank.lookup("inform").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:通知 / 告知"]
);
assert.deepStrictEqual(
  senseBank.lookup("inquiry").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:查詢 / 詢問"]
);
assert.deepStrictEqual(
  senseBank.lookup("inspect").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:檢查 / 視察"]
);
assert.deepStrictEqual(
  senseBank.lookup("install").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:安裝"]
);
assert.deepStrictEqual(
  senseBank.lookup("institute").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:學院 / 機構", "verb:制定 / 建立"]
);
assert.deepStrictEqual(
  senseBank.lookup("interact").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:互動 / 交流"]
);
assert.deepStrictEqual(
  senseBank.lookup("interpret").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:解釋 / 理解"]
);
assert.deepStrictEqual(
  senseBank.lookup("interrupt").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:打斷 / 中斷"]
);
assert.deepStrictEqual(
  senseBank.lookup("investigate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:調查"]
);
assert.deepStrictEqual(
  senseBank.lookup("implement").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:實施 / 執行", "verb:體現 / 表現"]
);
assert.deepStrictEqual(
  senseBank.lookup("increase").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:增加", "verb:增加"]
);
assert.deepStrictEqual(
  senseBank.lookup("influence").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:影響", "verb:影響"]
);
assert.deepStrictEqual(
  senseBank.lookup("instrument").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:儀器", "noun:樂器"]
);
assert.deepStrictEqual(
  senseBank.lookup("intense").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:強烈的"]
);
assert.deepStrictEqual(
  senseBank.lookup("jealous").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:妒忌的 / 嫉妒的"]
);
assert.deepStrictEqual(
  senseBank.lookup("journal").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:日記 / 期刊"]
);
assert.deepStrictEqual(
  senseBank.lookup("journalist").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:記者"]
);
assert.deepStrictEqual(
  senseBank.lookup("judge").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:判斷", "noun:法官 / 評判"]
);
assert.deepStrictEqual(
  senseBank.lookup("justice").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:公義 / 司法"]
);
assert.deepStrictEqual(
  senseBank.lookup("justify").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:證明...有道理 / 為...辯護"]
);
assert.deepStrictEqual(
  senseBank.lookup("key").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:鑰匙", "noun:關鍵", "adjective:重要的 / 關鍵的", "verb:輸入"]
);
assert.deepStrictEqual(
  senseBank.lookup("kit").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:套裝 / 工具包"]
);
assert.deepStrictEqual(
  senseBank.lookup("label").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:標籤", "verb:貼標籤 / 稱為"]
);
assert.deepStrictEqual(
  senseBank.lookup("lack").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:缺乏", "verb:缺乏"]
);
assert.deepStrictEqual(
  senseBank.lookup("legal").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:合法的 / 法律的"]
);
assert.deepStrictEqual(
  senseBank.lookup("legend").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:傳說 / 傳奇人物", "noun:圖例 / 說明圖例"]
);
assert.deepStrictEqual(
  senseBank.lookup("leisure").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:休閒 / 空閒時間"]
);
assert.deepStrictEqual(
  senseBank.lookup("liberty").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:自由"]
);
assert.deepStrictEqual(
  senseBank.lookup("likely").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:可能的", "adverb:可能地"]
);
assert.deepStrictEqual(
  senseBank.lookup("literature").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:文學"]
);
assert.deepStrictEqual(
  senseBank.lookup("local").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:本地的", "noun:本地人"]
);
assert.deepStrictEqual(
  senseBank.lookup("loss").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:損失 / 失去"]
);
assert.deepStrictEqual(
  senseBank.lookup("lower").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:較低的", "verb:降低"]
);
assert.deepStrictEqual(
  senseBank.lookup("maintain").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:維持 / 保持", "verb:保養 / 維護"]
);
assert.deepStrictEqual(
  senseBank.lookup("manage").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:管理", "verb:設法做到"]
);
assert.deepStrictEqual(
  senseBank.lookup("manufacture").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:製造", "noun:製造"]
);
assert.deepStrictEqual(
  senseBank.lookup("material").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:材料 / 原料", "adjective:重要的 / 物質的"]
);
assert.deepStrictEqual(
  senseBank.lookup("measure").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:測量", "noun:措施"]
);
assert.deepStrictEqual(
  senseBank.lookup("mention").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:提及", "noun:提及"]
);
assert.deepStrictEqual(
  senseBank.lookup("method").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:方法"]
);
assert.deepStrictEqual(
  senseBank.lookup("minor").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:次要的 / 輕微的"]
);
assert.deepStrictEqual(
  senseBank.lookup("motive").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:動機"]
);
assert.deepStrictEqual(
  senseBank.lookup("multiple").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:多個的 / 多重的", "noun:倍數"]
);
assert.deepStrictEqual(
  senseBank.lookup("needle").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:針"]
);
assert.deepStrictEqual(
  senseBank.lookup("negotiate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:談判 / 協商"]
);
assert.deepStrictEqual(
  senseBank.lookup("nightmare").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:惡夢 / 可怕的經歷"]
);
assert.deepStrictEqual(
  senseBank.lookup("noble").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:高尚的 / 崇高的"]
);
assert.deepStrictEqual(
  senseBank.lookup("nominate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:提名"]
);
assert.deepStrictEqual(
  senseBank.lookup("notion").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:概念 / 想法"]
);
assert.deepStrictEqual(
  senseBank.lookup("novel").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:小說", "adjective:新穎的"]
);
assert.deepStrictEqual(
  senseBank.lookup("numerous").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:許多的 / 大量的"]
);
assert.deepStrictEqual(
  senseBank.lookup("nutrient").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:營養素"]
);
assert.deepStrictEqual(
  senseBank.lookup("objective").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:目標", "adjective:客觀的"]
);
assert.deepStrictEqual(
  senseBank.lookup("observe").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:觀察", "verb:遵守"]
);
assert.deepStrictEqual(
  senseBank.lookup("obtain").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:取得 / 獲得"]
);
assert.deepStrictEqual(
  senseBank.lookup("occasion").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:場合 / 時刻"]
);
assert.deepStrictEqual(
  senseBank.lookup("occur").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:發生"]
);
assert.deepStrictEqual(
  senseBank.lookup("odd").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:奇怪的", "adjective:單數的 / 奇數的"]
);
assert.deepStrictEqual(
  senseBank.lookup("operate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:操作 / 運作", "verb:做手術"]
);
assert.deepStrictEqual(
  senseBank.lookup("origin").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:起源 / 來源"]
);
assert.deepStrictEqual(
  senseBank.lookup("original").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:原本的 / 原創的", "noun:原件 / 原作"]
);
assert.deepStrictEqual(
  senseBank.lookup("overcome").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:克服"]
);
assert.deepStrictEqual(
  senseBank.lookup("own").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:自己的", "pronoun:自己的東西", "verb:擁有"]
);
assert.deepStrictEqual(
  senseBank.lookup("pace").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:步伐 / 速度", "verb:踱步 / 來回踱步"]
);
assert.deepStrictEqual(
  senseBank.lookup("passion").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:熱情 / 熱愛"]
);
assert.deepStrictEqual(
  senseBank.lookup("perceive").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:認為 / 看待", "verb:察覺 / 感知"]
);
assert.deepStrictEqual(
  senseBank.lookup("permanent").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:永久的"]
);
assert.deepStrictEqual(
  senseBank.lookup("perspective").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:觀點 / 角度"]
);
assert.deepStrictEqual(
  senseBank.lookup("phase").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:階段"]
);
assert.deepStrictEqual(
  senseBank.lookup("possess").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:擁有 / 具備"]
);
assert.deepStrictEqual(
  senseBank.lookup("poverty").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:貧窮"]
);
assert.deepStrictEqual(
  senseBank.lookup("predict").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:預測 / 預計"]
);
assert.deepStrictEqual(
  senseBank.lookup("primary").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:主要的", "adjective:小學的 / 初級的"]
);
assert.deepStrictEqual(
  senseBank.lookup("promote").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:推廣 / 促進", "verb:晉升 / 使升職"]
);
assert.deepStrictEqual(
  senseBank.lookup("prospect").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:前景 / 前途"]
);
assert.deepStrictEqual(
  senseBank.lookup("protect").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:保護"]
);
assert.deepStrictEqual(
  senseBank.lookup("purchase").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:購買", "noun:購買 / 購買物"]
);
assert.deepStrictEqual(
  senseBank.lookup("pursue").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:追求", "verb:追趕 / 追捕"]
);
assert.deepStrictEqual(
  senseBank.lookup("content").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:內容", "noun:含量", "adjective:滿意的"]
);
assert.deepStrictEqual(
  senseBank.lookup("Polish").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}:${entry.matchCase ? "case" : ""}`),
  ["polish:verb:擦亮 / 潤飾:", "Polish:adjective:波蘭的:case", "Polish:noun:波蘭語 / 波蘭人:case"]
);
assert.deepStrictEqual(
  senseBank.lookup("polish").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["polish:verb:擦亮 / 潤飾", "Polish:adjective:波蘭的", "Polish:noun:波蘭語 / 波蘭人"]
);
assert.deepStrictEqual(
  senseBank.lookup("quarter").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:四分之一", "noun:季度 / 一季"]
);
assert.deepStrictEqual(
  senseBank.lookup("quote").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:引用 / 引述", "noun:引文 / 引述", "noun:報價"]
);
assert.deepStrictEqual(
  senseBank.lookup("recall").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:回憶 / 記起", "noun:回憶 / 記憶"]
);
assert.deepStrictEqual(
  senseBank.lookup("reflect").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:反映", "verb:反射", "verb:反思 / 深思"]
);
assert.deepStrictEqual(
  senseBank.lookup("regulate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:規管 / 管制"]
);
assert.deepStrictEqual(
  senseBank.lookup("reinforce").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:加強 / 鞏固"]
);
assert.deepStrictEqual(
  senseBank.lookup("release").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:釋放", "verb:發佈 / 推出", "noun:釋放 / 發佈"]
);
assert.deepStrictEqual(
  senseBank.lookup("reliable").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:可靠的 / 可信賴的"]
);
assert.deepStrictEqual(
  senseBank.lookup("relief").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:舒緩 / 減輕", "noun:鬆一口氣 / 寬慰"]
);
assert.deepStrictEqual(
  senseBank.lookup("remark").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:評論 / 說話", "verb:評論 / 說"]
);
assert.deepStrictEqual(
  senseBank.lookup("represent").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:代表", "verb:象徵 / 表示"]
);
assert.deepStrictEqual(
  senseBank.lookup("reputation").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:聲譽 / 名聲"]
);
assert.deepStrictEqual(
  senseBank.lookup("rescue").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:拯救 / 救援", "noun:拯救 / 救援"]
);
assert.deepStrictEqual(
  senseBank.lookup("reserve").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:預留 / 預約 / 保留", "noun:儲備", "noun:保護區"]
);
assert.deepStrictEqual(
  senseBank.lookup("restrict").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:限制 / 規限"]
);
assert.deepStrictEqual(
  senseBank.lookup("retain").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:保留 / 保持"]
);
assert.deepStrictEqual(
  senseBank.lookup("reveal").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:揭示 / 透露", "verb:顯示"]
);
assert.deepStrictEqual(
  senseBank.lookup("secure").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:安全的 / 穩固的", "verb:取得 / 獲得 / 確保", "verb:保護 / 固定"]
);
assert.deepStrictEqual(
  senseBank.lookup("select").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:選擇 / 挑選"]
);
assert.deepStrictEqual(
  senseBank.lookup("series").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:系列 / 一連串"]
);
assert.deepStrictEqual(
  senseBank.lookup("settle").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:定居", "verb:解決", "verb:和解 / 解決爭議"]
);
assert.deepStrictEqual(
  senseBank.lookup("severe").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:嚴重的"]
);
assert.deepStrictEqual(
  senseBank.lookup("shade").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:陰影 / 陰涼處", "verb:遮陰"]
);
assert.deepStrictEqual(
  senseBank.lookup("shelter").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:庇護所 / 避難所", "noun:遮蔽 / 保護", "verb:庇護 / 保護"]
);
assert.deepStrictEqual(
  senseBank.lookup("significance").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:重要性 / 意義"]
);
assert.deepStrictEqual(
  senseBank.lookup("speech").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:演講", "noun:說話 / 言語"]
);
assert.deepStrictEqual(
  senseBank.lookup("spirit").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:精神 / 心靈"]
);
assert.deepStrictEqual(
  senseBank.lookup("stable").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:穩定的", "noun:馬房"]
);
assert.deepStrictEqual(
  senseBank.lookup("status").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:狀況 / 狀態"]
);
assert.deepStrictEqual(
  senseBank.lookup("steady").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:穩定的 / 平穩的"]
);
assert.deepStrictEqual(
  senseBank.lookup("stimulate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:刺激 / 促進"]
);
assert.deepStrictEqual(
  senseBank.lookup("straightforward").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:簡單直接的 / 易明的"]
);
assert.deepStrictEqual(
  senseBank.lookup("suffer").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:遭受 / 受苦", "verb:變差 / 受損"]
);
assert.deepStrictEqual(
  senseBank.lookup("supply").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:供應 / 供應量", "noun:物資 / 供應品", "verb:供應 / 提供"]
);
assert.deepStrictEqual(
  senseBank.lookup("surround").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:圍繞 / 包圍"]
);
assert.deepStrictEqual(
  senseBank.lookup("survive").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:生存 / 生還"]
);
assert.deepStrictEqual(
  senseBank.lookup("sustain").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:維持 / 持續"]
);
assert.deepStrictEqual(
  senseBank.lookup("tackle").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:處理 / 應付", "verb:攔截 / 擒抱", "noun:攔截 / 擒抱"]
);
assert.deepStrictEqual(
  senseBank.lookup("talent").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:天賦 / 才能", "noun:人才"]
);
assert.deepStrictEqual(
  senseBank.lookup("tend").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:傾向 / 往往會", "verb:照料 / 照顧"]
);
assert.deepStrictEqual(
  senseBank.lookup("theory").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:理論"]
);
assert.deepStrictEqual(
  senseBank.lookup("throughout").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["preposition:在整個...期間 / 遍及", "adverb:由頭到尾 / 全程"]
);
assert.deepStrictEqual(
  senseBank.lookup("tough").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:艱難的 / 困難的", "adjective:堅強的 / 強硬的"]
);
assert.deepStrictEqual(
  senseBank.lookup("trace").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:追蹤 / 追溯 / 查出", "noun:痕跡", "verb:描摹"]
);
assert.deepStrictEqual(
  senseBank.lookup("trade").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:貿易 / 交易", "verb:交易 / 買賣"]
);
assert.deepStrictEqual(
  senseBank.lookup("transform").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:徹底改變 / 轉變"]
);
assert.deepStrictEqual(
  senseBank.lookup("trial").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:審判 / 審訊", "noun:試驗 / 試用"]
);
assert.deepStrictEqual(
  senseBank.lookup("trigger").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:引發 / 觸發", "noun:扳機", "noun:誘因 / 觸發因素"]
);
assert.deepStrictEqual(
  senseBank.lookup("undergo").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:經歷 / 接受"]
);
assert.deepStrictEqual(
  senseBank.lookup("underlie").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:構成...的基礎 / 是...的根本原因"]
);
assert.deepStrictEqual(
  senseBank.lookup("undertake").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:承擔 / 從事", "verb:承諾 / 保證"]
);
assert.deepStrictEqual(
  senseBank.lookup("universe").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:宇宙"]
);
assert.deepStrictEqual(
  senseBank.lookup("urge").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:催促 / 力勸", "noun:衝動 / 強烈慾望"]
);
assert.deepStrictEqual(
  senseBank.lookup("utilize").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:利用 / 善用"]
);
assert.deepStrictEqual(
  senseBank.lookup("valid").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:有效的 / 合理的"]
);
assert.deepStrictEqual(
  senseBank.lookup("various").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:各種各樣的 / 不同的"]
);
assert.deepStrictEqual(
  senseBank.lookup("violent").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:暴力的 / 猛烈的"]
);
assert.deepStrictEqual(
  senseBank.lookup("virtual").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:虛擬的 / 網上的"]
);
assert.deepStrictEqual(
  senseBank.lookup("vision").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:視力", "noun:願景 / 視野"]
);
assert.deepStrictEqual(
  senseBank.lookup("wander").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:漫步 / 閒逛", "verb:走神 / 離題"]
);
assert.deepStrictEqual(
  senseBank.lookup("wealth").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:財富 / 富裕"]
);
assert.deepStrictEqual(
  senseBank.lookup("welfare").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:福利 / 福祉"]
);
assert.deepStrictEqual(
  senseBank.lookup("well-being").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:身心健康 / 福祉"]
);
assert.deepStrictEqual(
  senseBank.lookup("willing").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:願意的 / 樂意的"]
);
assert.deepStrictEqual(
  senseBank.lookup("witness").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:目擊者 / 證人", "verb:目擊 / 見證"]
);
assert.deepStrictEqual(
  senseBank.lookup("wrap").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:包 / 包裹", "noun:包裹物 / 披肩", "noun:卷餅 / 包卷食物"]
);
assert.deepStrictEqual(
  senseBank.lookup("yield").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:產生 / 帶來", "verb:讓步 / 屈服", "noun:產量 / 收益"]
);
assert.deepStrictEqual(
  senseBank.lookup("create").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:創造", "verb:建立"]
);
assert.deepStrictEqual(
  senseBank.lookup("decide").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:決定"]
);
assert.deepStrictEqual(
  senseBank.lookup("each").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["determiner:每個 / 各自", "pronoun:每個人 / 每件事物", "adverb:每個 / 各自"]
);
assert.deepStrictEqual(
  senseBank.lookup("few").map((entry) => `${entry.pos}:${entry.meaning}`),
  [
    "determiner:少數",
    "determiner:幾個",
    "adjective:很少的",
    "adjective:幾個的",
    "pronoun:少數人",
    "pronoun:少數事物"
  ]
);
assert.deepStrictEqual(
  senseBank.lookup("film").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:拍攝", "noun:電影 / 膠卷"]
);
assert.deepStrictEqual(
  senseBank.lookup("follow").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:跟隨", "verb:遵從"]
);
assert.deepStrictEqual(
  senseBank.lookup("gallery").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:畫廊", "noun:展覽館"]
);
assert.deepStrictEqual(
  senseBank.lookup("flood").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:洪水 / 水浸", "verb:淹沒", "verb:湧入"]
);
assert.deepStrictEqual(
  senseBank.lookup("fuel").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:燃料", "verb:加劇", "verb:推動"]
);
assert.deepStrictEqual(
  senseBank.lookup("gather").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:聚集", "verb:收集"]
);
assert.deepStrictEqual(
  senseBank.lookup("grow").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:成長", "verb:種植"]
);
assert.deepStrictEqual(
  senseBank.lookup("hide").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:隱藏", "verb:躲藏"]
);
assert.deepStrictEqual(
  senseBank.lookup("into").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["preposition:進入 / 變成"]
);
assert.deepStrictEqual(
  senseBank.lookup("let").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:讓 / 允許"]
);
assert.ok(
  senseBank.lookup("let", { includeHidden: true }).some((entry) => (
    entry.hidden && entry.pos === "verb" && entry.meaning === "let 的過去式 / PP"
  )),
  "same-spelling verb table markers should be hidden from student lookup but kept for grammar coverage"
);
assert.deepStrictEqual(
  senseBank.lookup("magazine").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:雜誌"]
);
assert.deepStrictEqual(
  senseBank.lookup("second").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["number:第二", "noun:秒", "adverb:第二 / 其次", "determiner:第二個"]
);
assert.deepStrictEqual(
  senseBank.lookup("think").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:想 / 認為"]
);
assert.deepStrictEqual(
  senseBank.lookup("to").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["preposition:向 / 到", "preposition:用來接動詞原形"]
);
assert.deepStrictEqual(
  senseBank.lookup("data").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:數據 / 資料"]
);
assert.deepStrictEqual(
  senseBank.lookup("director").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:導演 / 主管"]
);
assert.deepStrictEqual(
  senseBank.lookup("independent").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:獨立的"]
);
assert.deepStrictEqual(
  senseBank.lookup("publish").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:出版 / 發布"]
);
assert.deepStrictEqual(
  senseBank.lookup("virus").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:病毒"]
);
assert.deepStrictEqual(
  senseBank.lookup("costume").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:服裝 / 戲服"]
);
assert.deepStrictEqual(
  senseBank.lookup("documentary").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:紀錄片"]
);
assert.deepStrictEqual(
  senseBank.lookup("earthquake").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:地震"]
);
assert.deepStrictEqual(
  senseBank.lookup("marketing").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:市場推廣 / 營銷", "verb:推銷 / 推廣"]
);
assert.deepStrictEqual(
  senseBank.lookup("persuade").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:說服"]
);
assert.deepStrictEqual(
  senseBank.lookup("remind").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:提醒 / 使想起"]
);
assert.deepStrictEqual(
  senseBank.lookup("unlike").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["preposition:不像 / 與...不同"]
);
assert.deepStrictEqual(
  senseBank.lookup("committee").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:委員會"]
);
assert.deepStrictEqual(
  senseBank.lookup("declare").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:宣布 / 聲明"]
);
assert.deepStrictEqual(
  senseBank.lookup("dominant").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:佔主導地位的 / 主要的"]
);
assert.deepStrictEqual(
  senseBank.lookup("elsewhere").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adverb:在別處 / 去別處"]
);
assert.deepStrictEqual(
  senseBank.lookup("emphasis").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:強調", "noun:重點"]
);
assert.deepStrictEqual(
  senseBank.lookup("extent").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:程度", "noun:範圍"]
);
assert.deepStrictEqual(
  senseBank.lookup("forbid").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:禁止"]
);
assert.deepStrictEqual(
  senseBank.lookup("heaven").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:天堂"]
);
assert.deepStrictEqual(
  senseBank.lookup("hypothesis").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:假說 / 假設"]
);
assert.deepStrictEqual(
  senseBank.lookup("immune").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:免疫的 / 不受影響的"]
);
assert.deepStrictEqual(
  senseBank.lookup("inherit").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:繼承"]
);
assert.deepStrictEqual(
  senseBank.lookup("metaphor").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:比喻 / 隱喻"]
);
assert.deepStrictEqual(
  senseBank.lookup("pose").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:造成 / 提出"]
);
assert.deepStrictEqual(
  senseBank.lookup("relevant").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:相關的"]
);
assert.deepStrictEqual(
  senseBank.lookup("retail").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:零售"]
);
assert.deepStrictEqual(
  senseBank.lookup("scenario").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:可能出現的情況 / 場景"]
);
assert.deepStrictEqual(
  senseBank.lookup("somehow").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adverb:不知怎的 / 以某種方式"]
);
assert.deepStrictEqual(
  senseBank.lookup("species").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:物種"]
);
assert.deepStrictEqual(
  senseBank.lookup("speculate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:推測 / 猜測"]
);
assert.deepStrictEqual(
  senseBank.lookup("stall").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:攤位 / 檔口"]
);
assert.deepStrictEqual(
  senseBank.lookup("suspend").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:暫停 / 停職"]
);
assert.deepStrictEqual(
  senseBank.lookup("via").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["preposition:經由 / 透過"]
);
assert.deepStrictEqual(
  senseBank.lookup("conceive").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:構想 / 懷孕"]
);
assert.deepStrictEqual(
  senseBank.lookup("deem").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:認為 / 視為"]
);
assert.deepStrictEqual(
  senseBank.lookup("deteriorate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:惡化"]
);
assert.deepStrictEqual(
  senseBank.lookup("facilitate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:促進 / 使便利"]
);
assert.deepStrictEqual(
  senseBank.lookup("forge").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:建立 / 偽造"]
);
assert.deepStrictEqual(
  senseBank.lookup("funeral").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:葬禮"]
);
assert.deepStrictEqual(
  senseBank.lookup("glimpse").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:一瞥 / 短暫一看"]
);
assert.deepStrictEqual(
  senseBank.lookup("manifest").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:顯示 / 表明"]
);
assert.deepStrictEqual(
  senseBank.lookup("overlook").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:忽略 / 俯瞰"]
);
assert.deepStrictEqual(
  senseBank.lookup("privilege").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:特權 / 榮幸"]
);
assert.deepStrictEqual(
  senseBank.lookup("prosecute").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:起訴"]
);
assert.deepStrictEqual(
  senseBank.lookup("sceptical").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:懷疑的"]
);
assert.deepStrictEqual(
  senseBank.lookup("scope").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:範圍 / 空間"]
);
assert.deepStrictEqual(
  senseBank.lookup("spark").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:引發 / 激起"]
);
assert.deepStrictEqual(
  senseBank.lookup("subsidy").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:補貼 / 津貼"]
);
assert.deepStrictEqual(
  senseBank.lookup("transparent").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:透明的 / 清晰公開的"]
);
assert.deepStrictEqual(
  senseBank.lookup("unveil").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:揭幕 / 公布"]
);
assert.deepStrictEqual(
  senseBank.lookup("depend on").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:取決於 / 依賴"]
);
assert.deepStrictEqual(
  senseBank.lookup("derive from").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:源自 / 衍生自"]
);
assert.deepStrictEqual(
  senseBank.lookup("dispose of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:棄置 / 處理掉"]
);
assert.deepStrictEqual(
  senseBank.lookup("embark on").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:開始 / 踏上"]
);
assert.deepStrictEqual(
  senseBank.lookup("even though").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:conjunction:雖然 / 即使"]
);
assert.deepStrictEqual(
  senseBank.lookup("feel like").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:想要 / 感覺像"]
);
assert.deepStrictEqual(
  senseBank.lookup("get rid of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:擺脫 / 除去"]
);
assert.deepStrictEqual(
  senseBank.lookup("given that").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:conjunction:鑑於 / 既然"]
);
assert.deepStrictEqual(
  senseBank.lookup("happen to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:碰巧 / 剛好"]
);
assert.deepStrictEqual(
  senseBank.lookup("have no choice but to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:別無選擇，只好"]
);
assert.deepStrictEqual(
  senseBank.lookup("have no alternative / choice but to").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["have no choice but to:phrase:verb:別無選擇，只好"]
);
assert.deepStrictEqual(
  senseBank.lookup("in a nutshell").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adverb:總括而言 / 簡而言之"]
);
assert.deepStrictEqual(
  senseBank.lookup("in terms of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:preposition:在...方面 / 就...而言"]
);
assert.deepStrictEqual(
  senseBank.lookup("keep an eye on").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:密切注意 / 照顧"]
);
assert.deepStrictEqual(
  senseBank.lookup("let alone").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:conjunction:更不用說 / 更何況"]
);
assert.deepStrictEqual(
  senseBank.lookup("make use of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:使用 / 利用"]
);
assert.deepStrictEqual(
  senseBank.lookup("lift x2").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  [
    "lift:noun:升降機",
    "lift:verb:舉起 / 抬起",
    "lift:verb:解除 / 撤銷限制"
  ]
);
assert.deepStrictEqual(
  senseBank.lookup("make a living").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:謀生"]
);
assert.deepStrictEqual(
  senseBank.lookup("mindset").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["word:noun:思維 / 想法"]
);
assert.deepStrictEqual(
  senseBank.lookup("more often than not").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adverb:很多時 / 通常"]
);
assert.deepStrictEqual(
  senseBank.lookup("participate in").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:參與 / 參加"]
);
assert.deepStrictEqual(
  senseBank.lookup("pay off").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:取得回報 / 成功"]
);
assert.deepStrictEqual(
  senseBank.lookup("pose a threat").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:構成威脅"]
);
assert.deepStrictEqual(
  senseBank.lookup("provided (that)").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["provided that:phrase:conjunction:只要 / 假如"]
);
assert.deepStrictEqual(
  senseBank.lookup("rather than").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:conjunction:而不是"]
);
assert.deepStrictEqual(
  senseBank.lookup("regardless of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:preposition:不論 / 不管"]
);
assert.deepStrictEqual(
  senseBank.lookup("rely on").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:依賴 / 依靠"]
);
assert.deepStrictEqual(
  senseBank.lookup("result in").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:導致"]
);
assert.deepStrictEqual(
  senseBank.lookup("suffer from").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:患有 / 受...之苦"]
);
assert.deepStrictEqual(
  senseBank.lookup("take advantage of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:利用 / 佔便宜"]
);
assert.deepStrictEqual(
  senseBank.lookup("take into account").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:考慮 / 將...考慮在內"]
);
assert.deepStrictEqual(
  senseBank.lookup("all in all").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adverb:總括而言"]
);
assert.deepStrictEqual(
  senseBank.lookup("as long as").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:conjunction:只要"]
);
assert.deepStrictEqual(
  senseBank.lookup("utilize").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["utilize:word:verb:利用 / 善用"]
);
assert.deepStrictEqual(
  senseBank.lookup("with respect to").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["with regard to:phrase:preposition:關於 / 就...而言"]
);
assert.deepStrictEqual(
  senseBank.lookup("worthwhile").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:值得做的 / 有價值的"]
);
assert.deepStrictEqual(
  senseBank.lookup("yearning for").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["yearn for:phrase:verb:渴望 / 嚮往"]
);
assert.deepStrictEqual(
  senseBank.lookup("addicted to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:對...上癮的 / 沉迷於"]
);
assert.deepStrictEqual(
  senseBank.lookup("apologize to").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["apologise to:phrase:verb:向...道歉"]
);
assert.deepStrictEqual(
  senseBank.lookup("as soon as").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:conjunction:一...就"]
);
assert.deepStrictEqual(
  senseBank.lookup("beneficial to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:對...有益"]
);
assert.deepStrictEqual(
  senseBank.lookup("compete against").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:與...競爭"]
);
assert.deepStrictEqual(
  senseBank.lookup("familiarize with").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["familiarise with:phrase:verb:使...熟悉"]
);
assert.deepStrictEqual(
  senseBank.lookup("in addition to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:preposition:除了...之外"]
);
assert.deepStrictEqual(
  senseBank.lookup("fall victim to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:成為...的受害者"]
);
assert.deepStrictEqual(
  senseBank.lookup("for a living").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adverb:以...維生"]
);
assert.deepStrictEqual(
  senseBank.lookup("has nothing to do with").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["have nothing to do with:phrase:verb:與...無關"]
);
assert.deepStrictEqual(
  senseBank.lookup("has something to do with").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["have something to do with:phrase:verb:與...有關"]
);
assert.deepStrictEqual(
  senseBank.lookup("if only").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:conjunction:如果...就好了"]
);
assert.deepStrictEqual(
  senseBank.lookup("on the verge of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:preposition:在...的邊緣 / 快將..."]
);
assert.deepStrictEqual(
  senseBank.lookup("pave the way for").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:為...鋪路"]
);
assert.deepStrictEqual(
  senseBank.lookup("pose a threat to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:對...構成威脅"]
);
assert.deepStrictEqual(
  senseBank.lookup("raise awareness of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:提高對...的意識"]
);
assert.deepStrictEqual(
  senseBank.lookup("related to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  [
    "phrase:adjective:與...有關",
    "phrase:verb:理解 / 有共鳴"
  ]
);
assert.deepStrictEqual(
  senseBank.lookup("prior to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:preposition:在...之前"]
);
assert.deepStrictEqual(
  senseBank.lookup("prohibit ... from").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:禁止...做某事"]
);
assert.deepStrictEqual(
  senseBank.lookup("reason for").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:...的原因"]
);
assert.deepStrictEqual(
  senseBank.lookup("pivotal in").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:對...極為重要"]
);
assert.deepStrictEqual(
  senseBank.lookup("be detrimental to").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["detrimental to:phrase:adjective:對...有害"]
);
assert.deepStrictEqual(
  senseBank.lookup("hazardous to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:對...有危害"]
);
assert.deepStrictEqual(
  senseBank.lookup("in proximity to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:preposition:在...附近"]
);
assert.deepStrictEqual(
  senseBank.lookup("problem-solving skills").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:解難能力"]
);
assert.deepStrictEqual(
  senseBank.lookup("relative to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:preposition:相對於 / 與...相比"]
);
assert.deepStrictEqual(
  senseBank.lookup("wreak havoc on").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:嚴重破壞 / 對...造成嚴重損害"]
);
assert.deepStrictEqual(
  senseBank.lookup("intrumental in").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["instrumental in:phrase:adjective:對...有幫助 / 起重要作用"]
);
assert.deepStrictEqual(
  senseBank.lookup("confined to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:限於 / 只限於"]
);
assert.deepStrictEqual(
  senseBank.lookup("brimmed with").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["brim with:phrase:verb:充滿"]
);
assert.deepStrictEqual(
  senseBank.lookup("deal with").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:處理 / 應付"]
);
assert.deepStrictEqual(
  senseBank.lookup("be used to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:習慣於"]
);
assert.deepStrictEqual(
  senseBank.lookup("in light of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:preposition:鑑於 / 考慮到"]
);
assert.deepStrictEqual(
  senseBank.lookup("look forward to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:期待"]
);
assert.deepStrictEqual(
  senseBank.lookup("originate in").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:起源於"]
);
assert.deepStrictEqual(
  senseBank.lookup("a sense of accomplishment").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["a sense of achievement:phrase:noun:成就感"]
);
assert.deepStrictEqual(
  senseBank.lookup("a growing number of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:determiner:越來越多的"]
);
assert.deepStrictEqual(
  senseBank.lookup("artificial intelligence").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:人工智能"]
);
assert.deepStrictEqual(
  senseBank.lookup("employment oopportunities").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["employment opportunities:phrase:noun:就業機會"]
);
assert.deepStrictEqual(
  senseBank.lookup("despite the fact that").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:conjunction:雖然 / 儘管"]
);
assert.deepStrictEqual(
  senseBank.lookup("of utmost importance").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["of paramount importance:phrase:adjective:極為重要"]
);
assert.deepStrictEqual(
  senseBank.lookup("people from all walks of life").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:來自各行各業的人"]
);
assert.deepStrictEqual(
  senseBank.lookup("can be ascribed to").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["can be attributed to:phrase:verb:可歸因於"]
);
assert.deepStrictEqual(
  senseBank.lookup("beyond a shadow of a doubt").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adverb:毫無疑問 / 無可置疑"]
);
assert.deepStrictEqual(
  senseBank.lookup("breathe a sigh of relief").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:鬆一口氣"]
);
assert.deepStrictEqual(
  senseBank.lookup("far from satisfactory").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:遠不令人滿意"]
);
assert.deepStrictEqual(
  senseBank.lookup("go from bad to worse").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:每況愈下 / 越來越差"]
);
assert.deepStrictEqual(
  senseBank.lookup("in the blink of an eye").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adverb:眨眼間"]
);
assert.deepStrictEqual(
  senseBank.lookup("on the grounds that").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:conjunction:因為 / 基於...理由"]
);
assert.deepStrictEqual(
  senseBank.lookup("on top of the world").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:非常開心"]
);
assert.deepStrictEqual(
  senseBank.lookup("affluent").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:富裕的"]
);
assert.deepStrictEqual(
  senseBank.lookup("algorithm").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:演算法 / 算法"]
);
assert.deepStrictEqual(
  senseBank.lookup("allergens").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["allergen:noun:致敏原"]
);
assert.deepStrictEqual(
  senseBank.lookup("Buddhist").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["Buddhist:noun:佛教徒"]
);
assert.deepStrictEqual(
  senseBank.lookup("cliché").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["cliche:noun:陳腔濫調 / 老生常談"]
);
assert.deepStrictEqual(
  senseBank.lookup("burnout").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:身心耗竭 / 過度疲勞"]
);
assert.deepStrictEqual(
  senseBank.lookup("cramped").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:擠迫的"]
);
assert.deepStrictEqual(
  senseBank.lookup("cuisine").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:菜式 / 菜系"]
);
assert.deepStrictEqual(
  senseBank.lookup("daunting").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:令人卻步的 / 令人生畏的"]
);
assert.deepStrictEqual(
  senseBank.lookup("dwindle").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:逐漸減少"]
);
assert.deepStrictEqual(
  senseBank.lookup("eatery").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:食店 / 餐館"]
);
assert.deepStrictEqual(
  senseBank.lookup("gratitude").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:感激 / 感恩"]
);
assert.deepStrictEqual(
  senseBank.lookup("hazardous").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:有危害的 / 危險的"]
);
assert.deepStrictEqual(
  senseBank.lookup("hearty").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:豐盛的 / 熱情的"]
);
assert.deepStrictEqual(
  senseBank.lookup("intrinsic").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:內在的 / 固有的"]
);
assert.deepStrictEqual(
  senseBank.lookup("perspectives").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["perspective:noun:觀點 / 角度"]
);
assert.deepStrictEqual(
  senseBank.lookup("persuasive").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:有說服力的"]
);
assert.deepStrictEqual(
  senseBank.lookup("protagonist").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:主角 / 主要人物"]
);
assert.deepStrictEqual(
  senseBank.lookup("provacative").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["provocative:adjective:挑釁的 / 惹火的"]
);
assert.deepStrictEqual(
  senseBank.lookup("regulars").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["regular:noun:常客"]
);
assert.deepStrictEqual(
  senseBank.lookup("retailers").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["retailer:noun:零售商"]
);
assert.deepStrictEqual(
  senseBank.lookup("scarcely").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adverb:幾乎不"]
);
assert.deepStrictEqual(
  senseBank.lookup("tourists").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["tourist:noun:旅客 / 遊客"]
);
assert.deepStrictEqual(
  senseBank.lookup("travellers").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["traveller:noun:旅客 / 旅行者"]
);
assert.deepStrictEqual(
  senseBank.lookup("vitamins").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["vitamin:noun:維他命 / 維生素"]
);
assert.deepStrictEqual(
  senseBank.lookup("subsidize").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["subsidise:verb:津貼 / 資助"]
);
assert.deepStrictEqual(
  senseBank.lookup("supertitious").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["superstitious:adjective:迷信的"]
);
assert.deepStrictEqual(
  senseBank.lookup("Thai").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["Thai:adjective:泰國的", "Thai:noun:泰國人 / 泰文"]
);
assert.deepStrictEqual(
  senseBank.lookup("vigourous").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["vigorous:adjective:劇烈的 / 精力充沛的"]
);
assert.deepStrictEqual(
  senseBank.lookup("workload").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:工作量"]
);
assert.deepStrictEqual(
  senseBank.lookup("acquaintance").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:認識的人 / 泛泛之交"]
);
assert.deepStrictEqual(
  senseBank.lookup("allergies").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["allergy:noun:過敏 / 敏感"]
);
assert.deepStrictEqual(
  senseBank.lookup("ambiance").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["ambience:noun:氣氛 / 氛圍"]
);
assert.deepStrictEqual(
  senseBank.lookup("artifact").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["artefact:noun:文物 / 人造物"]
);
assert.deepStrictEqual(
  senseBank.lookup("alumni").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["alumnus:noun:校友"]
);
assert.deepStrictEqual(
  senseBank.lookup("aggravate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:使惡化 / 加劇"]
);
assert.deepStrictEqual(
  senseBank.lookup("apprehend").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:拘捕 / 逮捕"]
);
assert.deepStrictEqual(
  senseBank.lookup("arrogant").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:傲慢的 / 自大的"]
);
assert.deepStrictEqual(
  senseBank.lookup("baby boomers").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["baby boomer:phrase:noun:嬰兒潮一代"]
);
assert.deepStrictEqual(
  senseBank.lookup("backpack").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:背包"]
);
assert.deepStrictEqual(
  senseBank.lookup("balconies").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["balcony:noun:露台"]
);
assert.deepStrictEqual(
  senseBank.lookup("bar chart").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:棒形圖 / 柱狀圖"]
);
assert.deepStrictEqual(
  senseBank.lookup("be absorbed in").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:全神貫注於"]
);
assert.deepStrictEqual(
  senseBank.lookup("behemoths").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["behemoth:noun:巨頭 / 龐然大物"]
);
assert.deepStrictEqual(
  senseBank.lookup("bubble tea").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:珍珠奶茶"]
);
assert.deepStrictEqual(
  senseBank.lookup("by no means").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adverb:絕不"]
);
assert.deepStrictEqual(
  senseBank.lookup("cacti").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["cactus:noun:仙人掌"]
);
assert.deepStrictEqual(
  senseBank.lookup("call into question").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:質疑"]
);
assert.deepStrictEqual(
  senseBank.lookup("carbonated drinks").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["carbonated drink:phrase:noun:有汽飲品"]
);
assert.deepStrictEqual(
  senseBank.lookup("career prospects").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["career prospect:phrase:noun:事業前途"]
);
assert.deepStrictEqual(
  senseBank.lookup("century eggs").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["century egg:phrase:noun:皮蛋"]
);
assert.deepStrictEqual(
  senseBank.lookup("city dwellers").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["city dweller:phrase:noun:城市居民 / 城市人"]
);
assert.deepStrictEqual(
  senseBank.lookup("co-workers").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["co-worker:phrase:noun:同事"]
);
assert.deepStrictEqual(
  senseBank.lookup("churn out").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:大量快速生產"]
);
assert.deepStrictEqual(
  senseBank.lookup("commit crimes").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["commit crime:phrase:verb:犯罪"]
);
assert.deepStrictEqual(
  senseBank.lookup("conduct a survey").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:進行調查"]
);
assert.deepStrictEqual(
  senseBank.lookup("consumers").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["consumer:noun:消費者"]
);
assert.deepStrictEqual(
  senseBank.lookup("criticize").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["criticize:verb:批評"]
);
assert.deepStrictEqual(
  senseBank.lookup("Confucian").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["Confucian:adjective:儒家的 / 孔子的"]
);
assert.deepStrictEqual(
  senseBank.lookup("console games").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["console game:phrase:noun:主機遊戲"]
);
assert.deepStrictEqual(
  senseBank.lookup("convert a into b").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["convert A into B:phrase:verb:將A轉變成B"]
);
assert.deepStrictEqual(
  senseBank.lookup("core values").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["core value:phrase:noun:核心價值"]
);
assert.deepStrictEqual(
  senseBank.lookup("craftsmen").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["craftsman:noun:工匠 / 手藝人"]
);
assert.deepStrictEqual(
  senseBank.lookup("customize").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["customise:verb:自訂 / 訂製"]
);
assert.deepStrictEqual(
  senseBank.lookup("decidely").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["decidedly:adverb:明顯地 / 確實地"]
);
assert.deepStrictEqual(
  senseBank.lookup("declared monuments").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["declared monument:phrase:noun:法定古蹟"]
);
assert.deepStrictEqual(
  senseBank.lookup("disposable containers").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["disposable container:phrase:noun:一次性容器"]
);
assert.deepStrictEqual(
  senseBank.lookup("do the dishes").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:洗碗"]
);
assert.deepStrictEqual(
  senseBank.lookup("drawbacks").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["drawback:noun:缺點"]
);
assert.deepStrictEqual(
  senseBank.lookup("durable").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:耐用的", "noun:耐用品"]
);
assert.deepStrictEqual(
  senseBank.lookup("Dutch").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["Dutch:adjective:荷蘭的", "Dutch:noun:荷蘭人 / 荷蘭語"]
);
assert.deepStrictEqual(
  senseBank.lookup("emphasize").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["emphasize:verb:強調"]
);
assert.deepStrictEqual(
  senseBank.lookup("Europe").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["Europe:noun:歐洲"]
);
assert.deepStrictEqual(
  senseBank.lookup("exhilirated").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["exhilarated:adjective:興高采烈的"]
);
assert.deepStrictEqual(
  senseBank.lookup("exquiste").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["exquisite:adjective:精緻的"]
);
assert.deepStrictEqual(
  senseBank.lookup("family bonds").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["family bond:phrase:noun:家庭關係 / 家庭羈絆"]
);
assert.deepStrictEqual(
  senseBank.lookup("fertiliser").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["fertilizer:noun:肥料"]
);
assert.deepStrictEqual(
  senseBank.lookup("first aid kit").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["first-aid kit:phrase:noun:急救包"]
);
assert.deepStrictEqual(
  senseBank.lookup("fizzy drinks").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["fizzy drink:phrase:noun:有汽飲品"]
);
assert.deepStrictEqual(
  senseBank.lookup("fresh graduates").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["fresh graduate:phrase:noun:剛畢業的大學生 / 應屆畢業生"]
);
assert.deepStrictEqual(
  senseBank.lookup("get over").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:克服"]
);
assert.deepStrictEqual(
  senseBank.lookup("give a try").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["give it a go:phrase:verb:試一試"]
);
assert.deepStrictEqual(
  senseBank.lookup("go viral").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:爆紅 / 瘋傳"]
);
assert.deepStrictEqual(
  senseBank.lookup("gravitate toward").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["gravitate towards:phrase:verb:被...吸引 / 傾向於"]
);
assert.deepStrictEqual(
  senseBank.lookup("grown-ups").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["grown-up:phrase:noun:成人 / 成年人"]
);
assert.deepStrictEqual(
  senseBank.lookup("high-rise buildings").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["high-rise building:phrase:noun:高層建築"]
);
assert.deepStrictEqual(
  senseBank.lookup("holistic").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:全面的 / 整體的"]
);
assert.deepStrictEqual(
  senseBank.lookup("household names").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["household name:phrase:noun:家喻戶曉的人或名字"]
);
assert.deepStrictEqual(
  senseBank.lookup("in contrast to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:preposition:與...相比 / 與...相反"]
);
assert.deepStrictEqual(
  senseBank.lookup("in the long term").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["in the long run:phrase:adverb:長遠來說"]
);
assert.deepStrictEqual(
  senseBank.lookup("in vain").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adverb:白費地 / 徒勞地"]
);
assert.deepStrictEqual(
  senseBank.lookup("instill").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["instil:verb:灌輸"]
);
assert.deepStrictEqual(
  senseBank.lookup("jewellery").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["jewellery:noun:珠寶"]
);
assert.deepStrictEqual(
  senseBank.lookup("jews").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["Jew:noun:猶太人"]
);
assert.deepStrictEqual(
  senseBank.lookup("labor costs").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["labour cost:phrase:noun:勞工成本"]
);
assert.deepStrictEqual(
  senseBank.lookup("larvae").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["larva:noun:幼蟲"]
);
assert.deepStrictEqual(
  senseBank.lookup("Latin America").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["Latin America:phrase:noun:拉丁美洲"]
);
assert.deepStrictEqual(
  senseBank.lookup("leftover").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:剩下的", "noun:剩菜 / 剩餘食物"]
);
assert.deepStrictEqual(
  senseBank.lookup("leftovers").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["leftover:noun:剩菜 / 剩餘食物"]
);
assert.deepStrictEqual(
  senseBank.lookup("living conditions").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["living condition:phrase:noun:生活狀況"]
);
assert.deepStrictEqual(
  senseBank.lookup("low-rise buildings").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["low-rise building:phrase:noun:低層建築"]
);
assert.deepStrictEqual(
  senseBank.lookup("manufacturers").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["manufacturer:noun:製造商"]
);
assert.deepStrictEqual(
  senseBank.lookup("marginalized").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["marginalised:adjective:被邊緣化的"]
);
assert.deepStrictEqual(
  senseBank.lookup("Mexico").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["Mexico:noun:墨西哥"]
);
assert.deepStrictEqual(
  senseBank.lookup("minimize").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["minimize:verb:把...減到最低 / 盡量減少"]
);
assert.deepStrictEqual(
  senseBank.lookup("minimise").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["minimise:verb:減少 / 降低"]
);
assert.deepStrictEqual(
  senseBank.lookup("Mount Fuji").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["Mount Fuji:phrase:noun:富士山"]
);
assert.deepStrictEqual(
  senseBank.lookup("natural disasters").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["natural disaster:phrase:noun:自然災害"]
);
assert.deepStrictEqual(
  senseBank.lookup("on behalf of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:preposition:代表"]
);
assert.deepStrictEqual(
  senseBank.lookup("organization").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["organization:noun:組織 / 機構"]
);
assert.deepStrictEqual(
  senseBank.lookup("overwhelmed").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:不知所措的 / 充滿強烈情感的"]
);
assert.deepStrictEqual(
  senseBank.lookup("patronize").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["patronise:verb:光顧 / 惠顧"]
);
assert.deepStrictEqual(
  senseBank.lookup("plagiarize").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["plagiarise:verb:抄襲"]
);
assert.deepStrictEqual(
  senseBank.lookup("prefer a to b").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["prefer A to B:phrase:verb:喜歡A多於B"]
);
assert.deepStrictEqual(
  senseBank.lookup("prioritize").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["prioritise:verb:優先考慮"]
);
assert.deepStrictEqual(
  senseBank.lookup("public facilities").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["public facility:phrase:noun:公共設施"]
);
assert.deepStrictEqual(
  senseBank.lookup("put up with").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:忍受"]
);
assert.deepStrictEqual(
  senseBank.lookup("quality of life").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:生活質素"]
);
assert.deepStrictEqual(
  senseBank.lookup("raise awareness").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:提高意識"]
);
assert.deepStrictEqual(
  senseBank.lookup("responsbility").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["responsibility:noun:責任"]
);
assert.deepStrictEqual(
  senseBank.lookup("revoluntionary").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["revolutionary:adjective:革命性的"]
);
assert.deepStrictEqual(
  senseBank.lookup("reminscent").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["reminiscent:adjective:令人想起的"]
);
assert.deepStrictEqual(
  senseBank.lookup("replace a with b").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["replace A with B:phrase:verb:用B取代A"]
);
assert.deepStrictEqual(
  senseBank.lookup("respiratory diseases").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["respiratory disease:phrase:noun:呼吸道疾病"]
);
assert.deepStrictEqual(
  senseBank.lookup("sanitize").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["sanitise:verb:消毒"]
);
assert.deepStrictEqual(
  senseBank.lookup("savory").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["savoury:adjective:鹹香的 / 濃味的"]
);
assert.deepStrictEqual(
  senseBank.lookup("skeptical about").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["sceptical about:phrase:adjective:對...懷疑"]
);
assert.deepStrictEqual(
  senseBank.lookup("social enterprises").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["social enterprise:phrase:noun:社會企業"]
);
assert.deepStrictEqual(
  senseBank.lookup("sought after").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["sought-after:phrase:adjective:備受追捧的"]
);
assert.deepStrictEqual(
  senseBank.lookup("stakeholders").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["stakeholder:noun:持分者"]
);
assert.deepStrictEqual(
  senseBank.lookup("story").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["story:noun:故事", "story:noun:樓層 / 層"]
);
assert.deepStrictEqual(
  senseBank.lookup("storey").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["storey:noun:樓層 / 層"]
);
assert.deepStrictEqual(
  senseBank.lookup("subdivided flat").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:劏房"]
);
assert.deepStrictEqual(
  senseBank.lookup("supplementary classes").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["supplementary class:phrase:noun:補課 / 補習課"]
);
assert.deepStrictEqual(
  senseBank.lookup("symbolize").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["symbolise:verb:象徵"]
);
assert.deepStrictEqual(
  senseBank.lookup("tactics").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["tactic:noun:策略 / 戰術"]
);
assert.deepStrictEqual(
  senseBank.lookup("take a gap year of").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["take a gap year:phrase:verb:休學一年 / 空檔一年"]
);
assert.deepStrictEqual(
  senseBank.lookup("take pride ... on").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["take pride in:phrase:verb:以...為榮"]
);
assert.deepStrictEqual(
  senseBank.lookup("taught").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:教導 / 教授（teach 過去式 / PP）"]
);
assert.deepStrictEqual(
  senseBank.lookup("tech geeks").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["tech geek:phrase:noun:科技迷"]
);
assert.deepStrictEqual(
  senseBank.lookup("the greater bay area").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["the Greater Bay Area:phrase:noun:大灣區"]
);
assert.deepStrictEqual(
  senseBank.lookup("traffic accidents").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["traffic accident:phrase:noun:交通意外"]
);
assert.deepStrictEqual(
  senseBank.lookup("traveling").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["traveling:noun:旅行"]
);
assert.deepStrictEqual(
  senseBank.lookup("turn a into b").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["turn A into B:phrase:verb:將A變成B"]
);
assert.deepStrictEqual(
  senseBank.lookup("turn out to").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["turn out to be:phrase:verb:結果是"]
);
assert.deepStrictEqual(
  senseBank.lookup("unmanly").map((entry) => `${entry.pos}:${entry.meaning}`),
  []
);
assert.deepStrictEqual(
  senseBank.lookup("vendors").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["vendor:noun:賣家 / 小販"]
);
assert.deepStrictEqual(
  senseBank.lookup("virtualy impossible").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["virtually impossible:phrase:adjective:幾乎不可能的"]
);
assert.deepStrictEqual(
  senseBank.lookup("warp").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:使變形 / 扭曲"]
);
assert.deepStrictEqual(
  senseBank.lookup("well-paid jobs").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["well-paid job:phrase:noun:高收入工作"]
);
assert.deepStrictEqual(
  senseBank.lookup("westerners").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["westerner:noun:西方人"]
);
assert.deepStrictEqual(
  senseBank.lookup("white-collar workers").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["white-collar worker:phrase:noun:白領人士"]
);
assert.deepStrictEqual(
  senseBank.lookup("work in your favour").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["work in your favour:phrase:verb:對你有利"]
);
assert.deepStrictEqual(
  senseBank.lookup("worth + ving").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["worth + V-ing:pattern:adjective:值得..."]
);
assert.deepStrictEqual(
  senseBank.lookup("well-known for").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:以...聞名"]
);
assert.deepStrictEqual(
  senseBank.lookup("when it comes to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:preposition:當談到..."]
);
assert.deepStrictEqual(
  senseBank.lookup("widely recognized").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["widely recognised:phrase:adjective:廣受認可的"]
);
assert.deepStrictEqual(
  senseBank.lookup("with a view to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adverb:為了 / 目的在於"]
);
assert.deepStrictEqual(
  senseBank.lookup("young generations").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["young generation:phrase:noun:年輕一代"]
);
assert.deepStrictEqual(
  senseBank.lookup("zombie").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:喪屍 / 殭屍"]
);
assert.deepStrictEqual(
  senseBank.lookup("a variety of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:determiner:不同種類的"]
);
assert.deepStrictEqual(
  senseBank.lookup("a bundle of nerves").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:非常緊張的人"]
);
assert.deepStrictEqual(
  senseBank.lookup("academic qualifications").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["academic qualification:phrase:noun:學歷"]
);
assert.deepStrictEqual(
  senseBank.lookup("adj + as + subj + be").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["adj + as + subject + be:pattern:conjunction:雖然"]
);
assert.deepStrictEqual(
  senseBank.lookup("adverse effects").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["adverse effect:phrase:noun:負面影響"]
);
assert.deepStrictEqual(
  senseBank.lookup("be+pp").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["be + pp:pattern:auxiliary:被（被動語態）"]
);
assert.deepStrictEqual(
  senseBank.lookup("between...and...").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["between ... and ...:pattern:preposition:在...與...之間"]
);
assert.deepStrictEqual(
  senseBank.lookup("can't help ving").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["can't help + V-ing:pattern:verb:忍不住做某事"]
);
assert.deepStrictEqual(
  senseBank.lookup("chance only favors prepared minds").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["chance favours the prepared mind:phrase:noun:機會只留給有準備的人"]
);
assert.deepStrictEqual(
  senseBank.lookup("chances are that").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:conjunction:很可能..."]
);
assert.deepStrictEqual(
  senseBank.lookup("degree holders").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["degree holder:phrase:noun:大學畢業生"]
);
assert.deepStrictEqual(
  senseBank.lookup("dietician / nutritionist").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["nutritionist:noun:營養師"]
);
assert.deepStrictEqual(
  senseBank.lookup("dire = dreadful = appalling").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["dire / dreadful / appalling:phrase:adjective:可怕的"]
);
assert.deepStrictEqual(
  senseBank.lookup("dishes").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["dish:noun:菜式"]
);
assert.deepStrictEqual(
  senseBank.lookup("douse").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:潑濕 / 澆熄"]
);
assert.deepStrictEqual(
  senseBank.lookup("fc").map((entry) => `${entry.pos}:${entry.meaning}`),
  []
);
assert.deepStrictEqual(
  senseBank.lookup("either a or b").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["either A or B:pattern:conjunction:不是A就是B / 或者A或者B"]
);
assert.deepStrictEqual(
  senseBank.lookup("environment conscious").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["environmentally conscious:phrase:adjective:有環保意識的"]
);
assert.deepStrictEqual(
  senseBank.lookup("find it adj").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["find it + adjective:pattern:verb:覺得...是..."]
);
assert.deepStrictEqual(
  senseBank.lookup("for+時間").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["for + time:pattern:preposition:持續一段時間"]
);
assert.deepStrictEqual(
  senseBank.lookup("from...to...").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["from ... to ...:pattern:preposition:從...到..."]
);
assert.deepStrictEqual(
  senseBank.lookup("fusion dishes").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["fusion dish:phrase:noun:融合菜式"]
);
assert.deepStrictEqual(
  senseBank.lookup("generally (speaking)").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["generally speaking:phrase:adverb:一般來說"]
);
assert.deepStrictEqual(
  senseBank.lookup("go down the drain / in vain").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["go down the drain:phrase:verb:白費 / 付諸東流"]
);
assert.deepStrictEqual(
  senseBank.lookup("graveyard").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:墓地"]
);
assert.deepStrictEqual(
  senseBank.lookup("happen to + v").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["happen to + verb:pattern:verb:碰巧..."]
);
assert.deepStrictEqual(
  senseBank.lookup("has pp").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["has + pp:pattern:auxiliary:已經... / ...過"]
);
assert.deepStrictEqual(
  senseBank.lookup("have to bite to eat").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["have a bite to eat:phrase:verb:吃點東西"]
);
assert.deepStrictEqual(
  senseBank.lookup("hidden youths").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["hidden youth:phrase:noun:隱青"]
);
assert.deepStrictEqual(
  senseBank.lookup("however + adj").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["however + adjective:pattern:conjunction:無論多麼..."]
);
assert.deepStrictEqual(
  senseBank.lookup("illicit").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:非法的"]
);
assert.deepStrictEqual(
  senseBank.lookup("in opposition of").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["in opposition to:phrase:preposition:反對"]
);
assert.deepStrictEqual(
  senseBank.lookup("individuals").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["individual:noun:個人"]
);
assert.deepStrictEqual(
  senseBank.lookup("irresonsible").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["irresponsible:adjective:不負責任的"]
);
assert.deepStrictEqual(
  senseBank.lookup("is being pp").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["is being + pp:pattern:auxiliary:正在被..."]
);
assert.deepStrictEqual(
  senseBank.lookup("ivy league").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["Ivy League:phrase:noun:常春藤聯盟"]
);
assert.deepStrictEqual(
  senseBank.lookup("k").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  []
);
assert.deepStrictEqual(
  senseBank.lookup("l").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  []
);
assert.deepStrictEqual(
  senseBank.lookup("keep one's eyes glued to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:緊盯著"]
);
assert.deepStrictEqual(
  senseBank.lookup("little wonder that").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["pattern:conjunction:難怪..."]
);
assert.deepStrictEqual(
  senseBank.lookup("live up to ... expectations").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:達到...期望"]
);
assert.deepStrictEqual(
  senseBank.lookup("loan sharks").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["loan shark:phrase:noun:高利貸"]
);
assert.deepStrictEqual(
  senseBank.lookup("long gone are the days when").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["pattern:conjunction:...的日子已不復返"]
);
assert.deepStrictEqual(
  senseBank.lookup("loosely").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adverb:鬆散地 / 大概地"]
);
assert.deepStrictEqual(
  senseBank.lookup("m").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  []
);
assert.deepStrictEqual(
  senseBank.lookup("make...redundant").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["make ... redundant:phrase:verb:使...失業 / 解僱"]
);
assert.deepStrictEqual(
  senseBank.lookup("males").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["male:noun:男性 / 雄性動物"]
);
assert.deepStrictEqual(
  senseBank.lookup("managed to").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["manage to:phrase:verb:設法做到 / 能夠"]
);
assert.deepStrictEqual(
  senseBank.lookup("mesmerized by").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["mesmerised by:phrase:adjective:被...迷倒 / 迷上"]
);
assert.deepStrictEqual(
  senseBank.lookup("motivations").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["motivation:noun:動力 / 動機"]
);
assert.deepStrictEqual(
  senseBank.lookup("multinational enterprises").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["multinational enterprise:phrase:noun:跨國企業"]
);
assert.deepStrictEqual(
  senseBank.lookup("neither...nor...").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["neither ... nor ...:pattern:conjunction:既不...也不..."]
);
assert.deepStrictEqual(
  senseBank.lookup("one of the 名詞s").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["one of the + plural noun:pattern:determiner:其中一個..."]
);
assert.deepStrictEqual(
  senseBank.lookup("over + 時間").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["over + time:pattern:preposition:在...期間"]
);
assert.deepStrictEqual(
  senseBank.lookup("overheads").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["overhead:noun:經常開支 / 間接成本"]
);
assert.deepStrictEqual(
  senseBank.lookup("pace of life").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["pace of life:phrase:noun:生活節奏"]
);
assert.deepStrictEqual(
  senseBank.lookup("packed with").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:充滿 / 擠滿"]
);
assert.deepStrictEqual(
  senseBank.lookup("pale in comparison").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:相形見絀"]
);
assert.deepStrictEqual(
  senseBank.lookup("play sports").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:做運動 / 參與體育活動"]
);
assert.deepStrictEqual(
  senseBank.lookup("property owners").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["property owner:phrase:noun:業主"]
);
assert.deepStrictEqual(
  senseBank.lookup("public figures").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["public figure:phrase:noun:公眾人物"]
);
assert.deepStrictEqual(
  senseBank.lookup("put a ahead of b").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["put A ahead of B:phrase:verb:把A放在B之前 / 比B更重視A"]
);
assert.deepStrictEqual(
  senseBank.lookup("remember ving").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["remember + V-ing:pattern:verb:記得做過"]
);
assert.deepStrictEqual(
  senseBank.lookup("reservations").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  [
    "reservation:noun:預訂",
    "reservation:noun:保留意見"
  ]
);
assert.deepStrictEqual(
  senseBank.lookup("respects").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["respect:noun:方面"]
);
assert.deepStrictEqual(
  senseBank.lookup("self-discipline").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:自律"]
);
assert.deepStrictEqual(
  senseBank.lookup("shopping list").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:購物清單"]
);
assert.deepStrictEqual(
  senseBank.lookup("smart devices").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["smart device:phrase:noun:智能設備"]
);
assert.deepStrictEqual(
  senseBank.lookup("Singaporean").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  [
    "Singaporean:adjective:新加坡的",
    "Singaporean:noun:新加坡人"
  ]
);
assert.deepStrictEqual(
  senseBank.lookup("stately").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:莊嚴的 / 氣派的"]
);
assert.deepStrictEqual(
  senseBank.lookup("stand in sharp contrast with").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["stand in sharp contrast to:phrase:verb:與...形成鮮明對比"]
);
assert.deepStrictEqual(
  senseBank.lookup("swarms of").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["swarm of:phrase:noun:大量... / 一大群..."]
);
assert.deepStrictEqual(
  senseBank.lookup("rules").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["rule:noun:規則"]
);
assert.deepStrictEqual(
  senseBank.lookup("re-energize").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["re-energise:phrase:verb:恢復精力"]
);
assert.deepStrictEqual(
  senseBank.lookup("scroll on phones").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["scroll through:phrase:verb:滑動瀏覽"]
);
assert.deepStrictEqual(
  senseBank.lookup("search (for)").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["search for:phrase:verb:尋找"]
);
assert.deepStrictEqual(
  senseBank.lookup("see as").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["see ... as ...:phrase:verb:視為"]
);
assert.deepStrictEqual(
  senseBank.lookup("simultanuously").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["simultaneously:adverb:同時"]
);
assert.deepStrictEqual(
  senseBank.lookup("so adj that").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["so + adjective + that:pattern:conjunction:如此...以致"]
);
assert.deepStrictEqual(
  senseBank.lookup("strike a work-life balance").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["strike a balance:phrase:verb:取得平衡"]
);
assert.deepStrictEqual(
  senseBank.lookup("skills").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["skill:noun:技能 / 技巧"]
);
assert.deepStrictEqual(
  senseBank.lookup("spices").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["spice:noun:香料"]
);
assert.deepStrictEqual(
  senseBank.lookup("ableist").map((entry) => `${entry.pos}:${entry.meaning}`),
  [
    "adjective:歧視殘疾人士的",
    "noun:歧視殘疾人士的人"
  ]
);
assert.deepStrictEqual(
  senseBank.lookup("africa").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["Africa:noun:非洲"]
);
assert.deepStrictEqual(
  senseBank.lookup("an unparalleled success").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:無可比擬的成功"]
);
assert.deepStrictEqual(
  senseBank.lookup("anytime and anywhere").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adverb:隨時隨地"]
);
assert.deepStrictEqual(
  senseBank.lookup("behaviour").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["behaviour:noun:行為"]
);
assert.deepStrictEqual(
  senseBank.lookup("blockbuster / box office hit").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["blockbuster:word:noun:賣座電影 / 大熱作品"]
);
assert.deepStrictEqual(
  senseBank.lookup("buried in").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:埋頭於 / 專心於"]
);
assert.deepStrictEqual(
  senseBank.lookup("ubiquitous").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:無處不在的"]
);
assert.deepStrictEqual(
  senseBank.lookup("ubiquity").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:無處不在 / 普及"]
);
assert.deepStrictEqual(
  senseBank.lookup("tattoo").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:紋身", "verb:紋身 / 刺青"]
);
assert.deepStrictEqual(
  senseBank.lookup("tattooed").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:紋身 / 刺青", "adjective:有紋身的"]
);
assert.deepStrictEqual(
  senseBank.lookup("under undue stress").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:承受過度壓力的"]
);
assert.deepStrictEqual(
  senseBank.lookup("urban dwellers").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["urban dweller:phrase:noun:城市居民 / 都市人"]
);
assert.deepStrictEqual(
  senseBank.lookup("Valentine's Day").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["Valentine's Day:phrase:noun:情人節"]
);
assert.deepStrictEqual(
  senseBank.lookup("visualize").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["visualise:verb:想像 / 視覺化"]
);
assert.deepStrictEqual(
  senseBank.lookup("will ... soon").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["pattern:modal:快將"]
);
assert.deepStrictEqual(
  senseBank.lookup("名詞+free").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["noun + free:pattern:adjective:沒有...的"]
);
assert.deepStrictEqual(
  senseBank.lookup("行為+with").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["verb + with:pattern:preposition:用...來..."]
);
assert.deepStrictEqual(
  senseBank.lookup("tantalize our taste buds").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["tantalise our taste buds:phrase:verb:挑動我們的味蕾"]
);
assert.deepStrictEqual(
  senseBank.lookup("taste buds").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["taste bud:phrase:noun:味蕾"]
);
assert.deepStrictEqual(
  senseBank.lookup("tend to (v) / inclined to").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["inclined to:phrase:adjective:傾向於"]
);
assert.deepStrictEqual(
  senseBank.lookup("the ... industry").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["the + industry:pattern:noun:...行業"]
);
assert.deepStrictEqual(
  senseBank.lookup("the amount of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:determiner:...的數量（不可數名詞）"]
);
assert.deepStrictEqual(
  senseBank.lookup("the authority concerned").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["the authorities concerned:phrase:noun:有關當局"]
);
assert.deepStrictEqual(
  senseBank.lookup("the odds are that").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["the odds are that:pattern:conjunction:很可能..."]
);
assert.deepStrictEqual(
  senseBank.lookup("the 名詞 concerned").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["the + noun + concerned:pattern:adjective:有關的..."]
);
assert.deepStrictEqual(
  senseBank.lookup("there's no doubt that").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["there is no doubt that:pattern:conjunction:毫無疑問..."]
);
assert.deepStrictEqual(
  senseBank.lookup("there are").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["pattern:verb:有（眾數）"]
);
assert.deepStrictEqual(
  senseBank.lookup("those with").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:pronoun:有...的人"]
);
assert.deepStrictEqual(
  senseBank.lookup("to whom it may concern").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["To whom it may concern:phrase:exclamation:敬啟者"]
);
assert.deepStrictEqual(
  senseBank.lookup("united nations").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["United Nations:phrase:noun:聯合國"]
);
assert.deepStrictEqual(
  senseBank.lookup("view as").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["view ... as ...:phrase:verb:視為"]
);
assert.deepStrictEqual(
  senseBank.lookup("tv series").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["TV series:phrase:noun:電視劇 / 電視連續劇"]
);
assert.deepStrictEqual(
  senseBank.lookup("about +數字").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["about + number:pattern:adverb:大約 + 數字"]
);
assert.deepStrictEqual(
  senseBank.lookup("as + 句子").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["as + clause:pattern:conjunction:因為 / 正如 / 當 / 隨著"]
);
assert.deepStrictEqual(
  senseBank.lookup("as + 名詞").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["as + noun:pattern:preposition:作為"]
);
assert.deepStrictEqual(
  senseBank.lookup("as far as ... be concerned").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["as far as ... is concerned:phrase:preposition:就...而言"]
);
assert.deepStrictEqual(
  senseBank.lookup("are bound to").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["be bound to:phrase:verb:肯定會 / 必定"]
);
assert.deepStrictEqual(
  senseBank.lookup("commit to ving").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["commit to:phrase:verb:承諾 / 致力於"]
);
assert.deepStrictEqual(
  senseBank.lookup("cost you an arm and a leg").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["cost an arm and a leg:phrase:verb:非常昂貴"]
);
assert.deepStrictEqual(
  senseBank.lookup("a sense of safety").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:安全感"]
);
assert.deepStrictEqual(
  senseBank.lookup("and so on").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adverb:等等"]
);
assert.deepStrictEqual(
  senseBank.lookup("ancestors").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["ancestor:noun:祖先"]
);
assert.deepStrictEqual(
  senseBank.lookup("audiences").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["audience:noun:觀眾", "audience:noun:聽眾"]
);
assert.deepStrictEqual(
  senseBank.lookup("a defining victory").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:決定性的勝利"]
);
assert.deepStrictEqual(
  senseBank.lookup("a quarter of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:determiner:四分之一"]
);
assert.deepStrictEqual(
  senseBank.lookup("a soaring trend").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:快速上升的趨勢"]
);
assert.deepStrictEqual(
  senseBank.lookup("as is so often the case").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["as is often the case:phrase:adverb:正如多數情況一樣"]
);
assert.deepStrictEqual(
  senseBank.lookup("as the name suggests").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["as its name suggests:phrase:adverb:顧名思義"]
);
assert.deepStrictEqual(
  senseBank.lookup("association between a and b").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["association between A and B:phrase:noun:A和B之間的關係"]
);
assert.deepStrictEqual(
  senseBank.lookup("be convinced that").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:conjunction:深信"]
);
assert.deepStrictEqual(
  senseBank.lookup("be ingrained in").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:根深蒂固於"]
);
assert.deepStrictEqual(
  senseBank.lookup("be that as it may").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adverb:話雖如此"]
);
assert.deepStrictEqual(
  senseBank.lookup("be willing to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:願意"]
);
assert.deepStrictEqual(
  senseBank.lookup("boom = burgeon").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["boom / burgeon:pattern:verb:迅速發展"]
);
assert.deepStrictEqual(
  senseBank.lookup("binge-").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["pattern:adverb:狂... / 過度..."]
);
assert.deepStrictEqual(
  senseBank.lookup("campaigns").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["campaign:noun:活動", "campaign:noun:運動"]
);
assert.deepStrictEqual(
  senseBank.lookup("candidates").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["candidate:noun:候選人", "candidate:noun:參加者", "candidate:noun:可能選項 / 候選對象"]
);
assert.deepStrictEqual(
  senseBank.lookup("colleagues").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["colleague:noun:同事"]
);
assert.deepStrictEqual(
  senseBank.lookup("concerns").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["concern:noun:擔憂 / 關注"]
);
assert.deepStrictEqual(
  senseBank.lookup("confusion").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:困惑", "noun:混亂"]
);
assert.deepStrictEqual(
  senseBank.lookup("consideration").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:考慮", "noun:體諒 / 顧及"]
);
assert.deepStrictEqual(
  senseBank.lookup("construction").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:建造 / 施工", "noun:建築物 / 結構"]
);
assert.deepStrictEqual(
  senseBank.lookup("consumption").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:消耗", "noun:消費"]
);
assert.deepStrictEqual(
  senseBank.lookup("contest").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:比賽 / 競賽", "verb:爭辯 / 質疑"]
);
assert.deepStrictEqual(
  senseBank.lookup("contribute").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:貢獻 / 捐助", "verb:促成 / 是原因之一"]
);
assert.deepStrictEqual(
  senseBank.lookup("coverage").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:新聞報道", "noun:覆蓋範圍"]
);
assert.deepStrictEqual(
  senseBank.lookup("crack").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:裂縫", "verb:破裂 / 裂開", "verb:破解 / 解決"]
);
assert.deepStrictEqual(
  senseBank.lookup("craft").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:手藝 / 工藝", "noun:船 / 飛行器", "verb:精心製作"]
);
assert.deepStrictEqual(
  senseBank.lookup("creation").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:創造 / 創作", "noun:創作品"]
);
assert.deepStrictEqual(
  senseBank.lookup("can hardly").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:modal:幾乎不能"]
);
assert.deepStrictEqual(
  senseBank.lookup("commit mistakes").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["commit a mistake:phrase:verb:犯錯"]
);
assert.deepStrictEqual(
  senseBank.lookup("canopy").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:遮篷 / 樹冠"]
);
assert.deepStrictEqual(
  senseBank.lookup("capture the hearts and minds of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:俘獲...的心"]
);
assert.deepStrictEqual(
  senseBank.lookup("celebration events").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["celebration event:phrase:noun:慶祝活動"]
);
assert.deepStrictEqual(
  senseBank.lookup("characteristics").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  [
    "characteristic:noun:特徵",
    "characteristic:noun:特點"
  ]
);
assert.deepStrictEqual(
  senseBank.lookup("chains").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["chain:noun:連鎖店"]
);
assert.deepStrictEqual(
  senseBank.lookup("charts").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["chart:noun:圖表"]
);
assert.deepStrictEqual(
  senseBank.lookup("cheeks").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["cheek:noun:臉頰"]
);
assert.deepStrictEqual(
  senseBank.lookup("circumstances").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["circumstance:noun:情況 / 環境"]
);
assert.deepStrictEqual(
  senseBank.lookup("cruise ship").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:郵輪 / 遊輪"]
);
assert.deepStrictEqual(
  senseBank.lookup("claim .... lives").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["claim lives:phrase:verb:奪去生命"]
);
assert.deepStrictEqual(
  senseBank.lookup("called").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:叫做 / 稱為", "verb:打電話 / 稱呼 / 叫喚（call 過去式 / PP）"]
);
assert.deepStrictEqual(
  senseBank.lookup("colleagues").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["colleague:noun:同事"]
);
assert.deepStrictEqual(
  senseBank.lookup("color").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["color:noun:顏色"]
);
assert.deepStrictEqual(
  senseBank.lookup("cubs").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:幼獸"]
);
assert.deepStrictEqual(
  senseBank.lookup("civilization").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["civilization:noun:文明"]
);
assert.deepStrictEqual(
  senseBank.lookup("cucumber").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:青瓜 / 黃瓜"]
);
assert.deepStrictEqual(
  senseBank.lookup("cutting edge").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:尖端 / 最前沿", "phrase:adjective:尖端的 / 最先進的"]
);
assert.deepStrictEqual(
  senseBank.lookup("cutting-edge").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:尖端的 / 最先進的"]
);
assert.deepStrictEqual(
  senseBank.lookup("diploma").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:文憑"]
);
assert.deepStrictEqual(
  senseBank.lookup("dubious").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:可疑的 / 不可靠的"]
);
assert.deepStrictEqual(
  senseBank.lookup("dull / dreary").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:沉悶的"]
);
assert.deepStrictEqual(
  senseBank.lookup("each other").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:pronoun:互相 / 彼此"]
);
assert.deepStrictEqual(
  senseBank.lookup("eating habits").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["eating habit:phrase:noun:飲食習慣"]
);
assert.deepStrictEqual(
  senseBank.lookup("effect on").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["effect on:phrase:noun:對...的影響"]
);
assert.deepStrictEqual(
  senseBank.lookup("have an effect on").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:對...有影響"]
);
assert.deepStrictEqual(
  senseBank.lookup("have an impact on").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:對...有影響 / 對...有衝擊"]
);
assert.deepStrictEqual(
  senseBank.lookup("efforts").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["effort:noun:努力"]
);
assert.deepStrictEqual(
  senseBank.lookup("enable...to").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["enable ... to:phrase:verb:使...能夠"]
);
assert.deepStrictEqual(
  senseBank.lookup("establishments").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["establishment:noun:公司 / 機構"]
);
assert.deepStrictEqual(
  senseBank.lookup("experts").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["expert:noun:專家"]
);
assert.deepStrictEqual(
  senseBank.lookup("express ... condolence").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["express condolence:phrase:verb:表達慰問 / 弔唁"]
);
assert.deepStrictEqual(
  senseBank.lookup("food critics").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["food critic:phrase:noun:食評家"]
);
assert.deepStrictEqual(
  senseBank.lookup("fun-filling").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["fun-filled:phrase:adjective:充滿樂趣的"]
);
assert.deepStrictEqual(
  senseBank.lookup("gen-zers").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["Gen-Zer:phrase:noun:Z世代的人"]
);
assert.deepStrictEqual(
  senseBank.lookup("get trapped in the vicious cycle of a and b").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["get trapped in the vicious cycle of A and B:phrase:verb:陷入 A 和 B 的惡性循環"]
);
assert.deepStrictEqual(
  senseBank.lookup("go goblin mode").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["go all-out:phrase:verb:放飛自我 / 盡情放鬆"]
);
assert.deepStrictEqual(
  senseBank.lookup("has been to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["pattern:auxiliary:去過..."]
);
assert.deepStrictEqual(
  senseBank.lookup("have been adj/n").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["have been + noun/adjective:pattern:auxiliary:一直是 / 已經是"]
);
assert.deepStrictEqual(
  senseBank.lookup("have pp").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["have + pp:pattern:auxiliary:已經... / ...過"]
);
assert.deepStrictEqual(
  senseBank.lookup("have you ever wondered").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["pattern:auxiliary:你有沒有想過"]
);
assert.deepStrictEqual(
  senseBank.lookup("have a sweet tooth").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:喜歡甜食"]
);
assert.deepStrictEqual(
  senseBank.lookup("honor").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:榮譽"]
);
assert.deepStrictEqual(
  senseBank.lookup("hustle and bustle").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:繁忙喧鬧 / 熙來攘往"]
);
assert.deepStrictEqual(
  senseBank.lookup("i").map((entry) => `${entry.display}:${entry.pos}:${entry.meaning}`),
  ["I:pronoun:我"]
);
assert.deepStrictEqual(
  senseBank.lookup("indian cuisine").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["Indian cuisine:phrase:noun:印度菜"]
);
assert.deepStrictEqual(
  senseBank.lookup("in stock").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:有存貨"]
);
assert.deepStrictEqual(
  senseBank.lookup("intricate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:複雜的 / 精細的"]
);
assert.deepStrictEqual(
  senseBank.lookup("is made up of").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:由...組成"]
);
assert.deepStrictEqual(
  senseBank.lookup("it appears that").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["pattern:conjunction:似乎..."]
);
assert.deepStrictEqual(
  senseBank.lookup("it doesn't matter").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["pattern:auxiliary:沒關係 / 無所謂"]
);
assert.deepStrictEqual(
  senseBank.lookup("it was not until").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["It was not until:pattern:conjunction:直到...才"]
);
assert.deepStrictEqual(
  senseBank.lookup("look for").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:尋找"]
);
assert.deepStrictEqual(
  senseBank.lookup("long to").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["long for:phrase:verb:渴望"]
);
assert.deepStrictEqual(
  senseBank.lookup("monetary returns").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["monetary return:phrase:noun:金錢回報"]
);
assert.deepStrictEqual(
  senseBank.lookup("newlyweds").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:新人 / 新婚夫婦"]
);
assert.deepStrictEqual(
  senseBank.lookup("niche").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:小眾市場 / 合適位置", "adjective:小眾的"]
);
assert.deepStrictEqual(
  senseBank.lookup("no matter + 假問句").map((entry) => `${entry.display}:${entry.type}:${entry.pos}:${entry.meaning}`),
  ["no matter + question word:pattern:conjunction:無論..."]
);
assert.deepStrictEqual(
  senseBank.lookup("not bother to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:verb:懶得"]
);
assert.deepStrictEqual(
  senseBank.lookup("numeracy").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:計算能力 / 數學能力"]
);
assert.deepStrictEqual(
  senseBank.lookup("on a daily basis").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adverb:每天"]
);
assert.deepStrictEqual(
  senseBank.lookup("one another").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:pronoun:彼此 / 互相"]
);
assert.deepStrictEqual(
  senseBank.lookup("ought to").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:modal:應該"]
);
assert.deepStrictEqual(
  senseBank.lookup("particularly / especially / in particular").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adverb:尤其是 / 特別是"]
);
assert.deepStrictEqual(
  senseBank.lookup("poached egg").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:水波蛋"]
);
assert.deepStrictEqual(
  senseBank.lookup("price-cautious").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:adjective:重視價錢的"]
);
assert.deepStrictEqual(
  senseBank.lookup("property value").map((entry) => `${entry.type}:${entry.pos}:${entry.meaning}`),
  ["phrase:noun:物業價值"]
);
assert.deepStrictEqual(
  senseBank.lookup("quarrel").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:爭吵 / 吵架", "noun:爭吵 / 吵架"]
);
assert.deepStrictEqual(
  senseBank.lookup("center").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:中心", "verb:集中於", "verb:以...為中心"]
);
assert.deepStrictEqual(
  senseBank.lookup("centre").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:中心", "verb:集中於", "verb:以...為中心"]
);
assert.deepStrictEqual(
  senseBank.lookup("theatre").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:劇場", "noun:戲院"]
);
assert.deepStrictEqual(
  senseBank.lookup("labor").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:勞動", "noun:勞工"]
);
assert.deepStrictEqual(
  senseBank.lookup("defense").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:防衛", "noun:防守", "noun:辯護"]
);
assert.deepStrictEqual(
  senseBank.lookup("defence").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:防衛", "noun:防守", "noun:辯護"]
);
assert.deepStrictEqual(
  senseBank.lookup("license").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:牌照", "noun:許可證", "verb:批准", "verb:發牌"]
);
assert.deepStrictEqual(
  senseBank.lookup("licence").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:牌照", "noun:許可證"]
);
assert.deepStrictEqual(
  senseBank.lookup("agency").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:機構", "noun:代理公司"]
);
assert.deepStrictEqual(
  senseBank.lookup("aggressive").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:有攻擊性的", "adjective:進取的"]
);
assert.deepStrictEqual(
  senseBank.lookup("aim").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:目標", "noun:目的", "verb:旨在", "verb:瞄準"]
);
assert.deepStrictEqual(
  senseBank.lookup("ambition").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:抱負", "noun:雄心"]
);
assert.deepStrictEqual(
  senseBank.lookup("ambitious").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:有抱負的", "adjective:有雄心的"]
);
assert.deepStrictEqual(
  senseBank.lookup("arrest").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:逮捕", "noun:拘捕", "verb:逮捕", "verb:拘捕"]
);
assert.deepStrictEqual(
  senseBank.lookup("artificial").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["adjective:人工的", "adjective:人造的"]
);
assert.deepStrictEqual(
  senseBank.lookup("associate").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:聯想", "verb:聯繫", "adjective:副的", "adjective:相關的"]
);
assert.deepStrictEqual(
  senseBank.lookup("association").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:協會", "noun:關聯"]
);
assert.deepStrictEqual(
  senseBank.lookup("assure").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["verb:保證", "verb:使...相信"]
);
assert.deepStrictEqual(
  senseBank.lookup("authority").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:權威", "noun:權力", "noun:當局", "noun:官方機構"]
);
assert.deepStrictEqual(
  senseBank.lookup("barrier").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:屏障", "noun:障礙"]
);
assert.deepStrictEqual(
  senseBank.lookup("blame").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:責任", "noun:責備", "verb:責怪", "verb:指責"]
);
assert.deepStrictEqual(
  senseBank.lookup("boost").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:提升", "noun:幫助", "verb:提升", "verb:促進"]
);
assert.deepStrictEqual(
  senseBank.lookup("broadcast").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:廣播節目", "verb:廣播", "verb:播放"]
);
assert.deepStrictEqual(
  senseBank.lookup("cabin").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:機艙", "noun:船艙", "noun:小屋"]
);
assert.deepStrictEqual(
  senseBank.lookup("program").map((entry) => `${entry.pos}:${entry.meaning}`),
  ["noun:節目", "noun:程式", "noun:計劃", "verb:編寫程式"]
);

[
  ["look forward to", "phrase:verb:期待"],
  ["be used to", "phrase:adjective:習慣於"],
  ["get used to", "phrase:verb:變得習慣於"],
  ["object to", "phrase:verb:反對"],
  ["be opposed to", "phrase:adjective:反對"],
  ["commit to", "phrase:verb:承諾 / 致力於"],
  ["be committed to", "phrase:adjective:致力於"],
  ["dedicate to", "phrase:verb:奉獻於"],
  ["be dedicated to", "phrase:adjective:專注於 / 奉獻於"],
  ["devote to", "phrase:verb:投身於"],
  ["be devoted to", "phrase:adjective:全心投入於"],
  ["contribute to", "phrase:verb:有助於 / 促成"],
  ["with a view to", "phrase:adverb:為了 / 目的在於"],
  ["with an eye to", "phrase:adverb:考慮到 / 目的在於"],
  ["adapt to", "phrase:verb:適應"],
  ["adjust to", "phrase:verb:調整 / 適應"],
  ["admit to", "phrase:verb:承認"],
  ["confess to", "phrase:verb:坦白 / 交代"],
  ["take to", "phrase:verb:開始喜歡 / 養成...習慣"],
  ["resort to", "phrase:verb:訴諸於 / 不得不使用"],
  ["apply oneself to", "phrase:verb:專心致力於"],
  ["be close to", "phrase:adjective:接近於"],
  ["be near to", "phrase:adjective:接近於"],
  ["key to", "phrase:noun:...的關鍵"],
  ["secret to", "phrase:noun:...的秘訣"],
  ["solution to", "phrase:noun:...的解決辦法"],
  ["alternative to", "phrase:noun:...之外的替代方案"],
  ["approach to", "phrase:noun:...的方法"],
  ["access to", "phrase:noun:進入 / 使用...的權利或機會"],
  ["response to", "phrase:noun:對...的回應"],
  ["reaction to", "phrase:noun:對...的反應"],
  ["challenge to", "phrase:noun:對...的挑戰"],
  ["limit to", "phrase:noun:對...的限制"],
  ["open to", "phrase:adjective:對...開放的 / 不排斥的"],
  ["equal to", "phrase:adjective:勝任...的 / 與...相等的"],
  ["essential to", "phrase:adjective:對...不可或缺的"],
  ["preparatory to", "phrase:adverb:作為...的準備"],
  ["prior to", "phrase:preposition:在...之前"],
  ["impervious to", "phrase:adjective:不受...影響的"],
  ["resigned to", "phrase:adjective:無奈接受...的"]
].forEach(([word, expected]) => {
  const [entry] = senseBank.lookup(word);
  assert.ok(entry, `${word} should be in the curated sense bank`);
  assert.strictEqual(`${entry.type}:${entry.pos}:${entry.meaning}`, expected);
  assert.ok(entry.overrideTeacher, `${word} should override noisy imported meanings`);
});

const phrasesTwoEntries = [
  {
    "word": "rise to fame",
    "meaning": "變得出名"
  },
  {
    "word": "take for granted",
    "meaning": "視為理所當然"
  },
  {
    "word": "catch one's eye",
    "meaning": "吸引某人的注意"
  },
  {
    "word": "pay attention to",
    "meaning": "注意 / 專注於"
  },
  {
    "word": "make a difference",
    "meaning": "產生影響 / 帶來改變"
  },
  {
    "word": "take advantage of",
    "meaning": "利用 / 佔便宜"
  },
  {
    "word": "keep in mind",
    "meaning": "記在心上"
  },
  {
    "word": "catch someone red-handed",
    "meaning": "當場抓到某人做壞事"
  },
  {
    "word": "bear in mind",
    "meaning": "牢記"
  },
  {
    "word": "make sense",
    "meaning": "有道理 / 說得通"
  },
  {
    "word": "take a risk",
    "meaning": "冒險"
  },
  {
    "word": "lose one's temper",
    "meaning": "發脾氣"
  },
  {
    "word": "change one's mind",
    "meaning": "改變主意"
  },
  {
    "word": "make progress",
    "meaning": "取得進步"
  },
  {
    "word": "make an effort",
    "meaning": "付出努力"
  },
  {
    "word": "take action",
    "meaning": "採取行動"
  },
  {
    "word": "have a look",
    "meaning": "看一看"
  },
  {
    "word": "set an example",
    "meaning": "樹立榜樣"
  },
  {
    "word": "pose a threat",
    "meaning": "構成威脅"
  },
  {
    "word": "come into effect",
    "meaning": "生效 / 實施"
  },
  {
    "word": "take responsibility for",
    "meaning": "為...負責"
  },
  {
    "word": "play a role in",
    "meaning": "在...中扮演角色 / 起作用"
  },
  {
    "word": "bring to light",
    "meaning": "揭露 / 揭示"
  },
  {
    "word": "put an end to",
    "meaning": "結束 / 終止"
  },
  {
    "word": "take effect",
    "meaning": "見效 / 起作用"
  },
  {
    "word": "run a business",
    "meaning": "經營業務"
  },
  {
    "word": "keep an eye on",
    "meaning": "密切注意 / 照顧"
  },
  {
    "word": "make a living",
    "meaning": "謀生"
  },
  {
    "word": "take place",
    "meaning": "發生 / 舉行"
  },
  {
    "word": "do one's best",
    "meaning": "盡最大的努力"
  },
  {
    "word": "keep track of",
    "meaning": "記錄 / 追蹤"
  },
  {
    "word": "break a promise",
    "meaning": "違背承諾"
  },
  {
    "word": "keep a secret",
    "meaning": "保守秘密"
  },
  {
    "word": "have a word with",
    "meaning": "與某人談話"
  },
  {
    "word": "take the blame",
    "meaning": "承擔責任 / 背黑鍋"
  },
  {
    "word": "make room for",
    "meaning": "為...騰出空間"
  },
  {
    "word": "meet expectations",
    "meaning": "符合預期"
  },
  {
    "word": "run a risk",
    "meaning": "冒風險"
  },
  {
    "word": "lose track of",
    "meaning": "失去聯絡 / 忘記時間"
  },
  {
    "word": "draw one's attention",
    "meaning": "吸引某人的注意"
  },
  {
    "word": "cast doubt on",
    "meaning": "對...產生懷疑"
  },
  {
    "word": "fall in love",
    "meaning": "戀愛"
  },
  {
    "word": "make a decision",
    "meaning": "做出決定"
  },
  {
    "word": "gain experience",
    "meaning": "獲得經驗"
  },
  {
    "word": "reach an agreement",
    "meaning": "達成協議"
  },
  {
    "word": "bridge the gap",
    "meaning": "縮小差距 / 消除隔閡"
  },
  {
    "word": "break the ice",
    "meaning": "打破僵局 / 破冰"
  },
  {
    "word": "make an appointment",
    "meaning": "預約"
  },
  {
    "word": "pay a visit",
    "meaning": "拜訪"
  },
  {
    "word": "save face",
    "meaning": "挽回面子"
  },
  {
    "word": "lose face",
    "meaning": "丟臉"
  },
  {
    "word": "make fun of",
    "meaning": "嘲笑"
  },
  {
    "word": "take a turn for the worse",
    "meaning": "惡化"
  },
  {
    "word": "take time",
    "meaning": "花費時間"
  },
  {
    "word": "waste time",
    "meaning": "浪費時間"
  },
  {
    "word": "spend money",
    "meaning": "花錢"
  },
  {
    "word": "catch fire",
    "meaning": "著火"
  },
  {
    "word": "give birth to",
    "meaning": "出生 / 誕生"
  },
  {
    "word": "pay the price",
    "meaning": "付出代價"
  },
  {
    "word": "break the law",
    "meaning": "違法"
  },
  {
    "word": "commit a crime",
    "meaning": "犯罪"
  },
  {
    "word": "shed light on",
    "meaning": "闡明 / 有助於解釋"
  },
  {
    "word": "place emphasis on",
    "meaning": "強調"
  },
  {
    "word": "achieve a goal",
    "meaning": "達成目標"
  },
  {
    "word": "fulfill a dream",
    "meaning": "實現夢想"
  },
  {
    "word": "make a mistake",
    "meaning": "犯錯"
  },
  {
    "word": "follow advice",
    "meaning": "聽從建議"
  },
  {
    "word": "voice an opinion",
    "meaning": "表達意見"
  },
  {
    "word": "solve a problem",
    "meaning": "解決問題"
  },
  {
    "word": "make an impression",
    "meaning": "留下印象"
  },
  {
    "word": "take a seat",
    "meaning": "坐下"
  },
  {
    "word": "give a speech",
    "meaning": "發表演講"
  },
  {
    "word": "hold an event",
    "meaning": "舉辦活動"
  },
  {
    "word": "win an award",
    "meaning": "得獎"
  },
  {
    "word": "lose a job",
    "meaning": "失業"
  },
  {
    "word": "find a solution",
    "meaning": "尋找解決方案"
  },
  {
    "word": "meet a deadline",
    "meaning": "趕上截止日期"
  },
  {
    "word": "miss an opportunity",
    "meaning": "錯失機會"
  },
  {
    "word": "raise a question",
    "meaning": "提出問題"
  },
  {
    "word": "conduct research",
    "meaning": "進行研究"
  },
  {
    "word": "gather information",
    "meaning": "收集資訊"
  },
  {
    "word": "build a reputation",
    "meaning": "建立聲譽"
  },
  {
    "word": "face a challenge",
    "meaning": "面臨挑戰"
  },
  {
    "word": "overcome an obstacle",
    "meaning": "克服障礙"
  },
  {
    "word": "take notes",
    "meaning": "做筆記"
  },
  {
    "word": "share an opinion",
    "meaning": "分享觀點"
  },
  {
    "word": "ask for permission",
    "meaning": "請求准許"
  },
  {
    "word": "give a warning",
    "meaning": "給予警告"
  },
  {
    "word": "express gratitude",
    "meaning": "表達感激"
  },
  {
    "word": "show respect",
    "meaning": "展現尊重"
  },
  {
    "word": "cause damage",
    "meaning": "造成損害"
  },
  {
    "word": "attract attention",
    "meaning": "吸引注意"
  },
  {
    "word": "generate revenue",
    "meaning": "創造收入"
  },
  {
    "word": "implement a policy",
    "meaning": "實施政策"
  },
  {
    "word": "establish a relationship",
    "meaning": "建立關係"
  },
  {
    "word": "narrow the options",
    "meaning": "縮小選擇範圍"
  },
  {
    "word": "keep a promise",
    "meaning": "遵守承諾"
  },
  {
    "word": "form a habit",
    "meaning": "養成習慣"
  },
  {
    "word": "run an experiment",
    "meaning": "進行實驗"
  },
  {
    "word": "take a shower",
    "meaning": "洗澡"
  },
  {
    "word": "clear one's throat",
    "meaning": "清喉嚨"
  },
  {
    "word": "draw a conclusion",
    "meaning": "得出結論"
  },
  {
    "word": "deliver a speech",
    "meaning": "發表演講"
  },
  {
    "word": "strike a balance",
    "meaning": "取得平衡"
  },
  {
    "word": "stand a chance",
    "meaning": "有機會 / 有希望"
  },
  {
    "word": "jump to conclusions",
    "meaning": "貿然下結論"
  },
  {
    "word": "change the subject",
    "meaning": "改變話題"
  },
  {
    "word": "tell a lie",
    "meaning": "說謊"
  },
  {
    "word": "voice a concern",
    "meaning": "表達擔憂"
  },
  {
    "word": "run late",
    "meaning": "遲到 / 進度落後"
  },
  {
    "word": "tell a joke",
    "meaning": "講笑話"
  },
  {
    "word": "keep company",
    "meaning": "陪伴"
  },
  {
    "word": "set a trap",
    "meaning": "設下陷阱"
  },
  {
    "word": "pay a fine",
    "meaning": "罰款"
  },
  {
    "word": "reach a compromise",
    "meaning": "達成妥協"
  },
  {
    "word": "pose a question",
    "meaning": "提出問題"
  },
  {
    "word": "drive someone crazy",
    "meaning": "逼人發瘋"
  },
  {
    "word": "run a fever",
    "meaning": "發燒"
  },
  {
    "word": "break the record",
    "meaning": "打破紀錄"
  },
  {
    "word": "catch a cold",
    "meaning": "感冒"
  },
  {
    "word": "lead a life",
    "meaning": "過著...的生活"
  },
  {
    "word": "set a date",
    "meaning": "決定日期"
  },
  {
    "word": "clear the table",
    "meaning": "清理桌面 / 收拾碗盤"
  },
  {
    "word": "take a break",
    "meaning": "休息一下"
  },
  {
    "word": "make an excuse",
    "meaning": "找藉口"
  },
  {
    "word": "come to an end",
    "meaning": "結束"
  },
  {
    "word": "keep a diary",
    "meaning": "寫日記"
  },
  {
    "word": "lose patience",
    "meaning": "失去耐心"
  },
  {
    "word": "do a favor",
    "meaning": "幫忙"
  },
  {
    "word": "take an exam",
    "meaning": "參加考試"
  },
  {
    "word": "run into trouble",
    "meaning": "遇到麻煩"
  },
  {
    "word": "have an argument",
    "meaning": "爭吵"
  },
  {
    "word": "pick a fight",
    "meaning": "挑起爭端 / 挑釁"
  },
  {
    "word": "get a promotion",
    "meaning": "獲得升職"
  },
  {
    "word": "run smooth",
    "meaning": "進展順利"
  },
  {
    "word": "throw a party",
    "meaning": "舉辦派對"
  },
  {
    "word": "have a passion for",
    "meaning": "對...充滿熱情"
  },
  {
    "word": "close a deal",
    "meaning": "成交 / 達成協議"
  },
  {
    "word": "take a photograph",
    "meaning": "拍照"
  },
  {
    "word": "keep a straight face",
    "meaning": "保持嚴肅 / 不笑出來"
  },
  {
    "word": "clear the path",
    "meaning": "掃清道路 / 消除障礙"
  },
  {
    "word": "fall asleep",
    "meaning": "入睡"
  },
  {
    "word": "catch sight of",
    "meaning": "瞥見"
  },
  {
    "word": "run the risk of",
    "meaning": "冒著...的風險"
  },
  {
    "word": "lose confidence",
    "meaning": "失去信心"
  },
  {
    "word": "win a game",
    "meaning": "贏得比賽"
  },
  {
    "word": "break a habit",
    "meaning": "改掉習慣"
  },
  {
    "word": "pay compliments",
    "meaning": "稱讚"
  },
  {
    "word": "keep control",
    "meaning": "保持控制"
  },
  {
    "word": "lose consciousness",
    "meaning": "失去知覺 / 暈倒"
  },
  {
    "word": "make an impact",
    "meaning": "產生影響"
  },
  {
    "word": "make a call",
    "meaning": "打電話"
  },
  {
    "word": "take a step",
    "meaning": "採取步驟 / 踏出一步"
  },
  {
    "word": "raise awareness",
    "meaning": "提高意識"
  },
  {
    "word": "gain entry",
    "meaning": "獲准進入"
  },
  {
    "word": "make light of",
    "meaning": "輕視 / 對...不以為意"
  },
  {
    "word": "come to terms with",
    "meaning": "逐漸接受 / 妥協"
  },
  {
    "word": "look at someone with disdain",
    "meaning": "以鄙視 / 輕蔑的眼神看著某人"
  },
  {
    "word": "wrap one's mind around",
    "meaning": "理解 / 想通（通常用於複雜、令人震驚或難以置信的事）"
  },
  {
    "word": "make up one's mind",
    "meaning": "下定決心"
  },
  {
    "word": "make a concession",
    "meaning": "做出讓步"
  },
  {
    "word": "catch one's breath",
    "meaning": "喘口氣 / 歇口氣"
  },
  {
    "word": "take a glance",
    "meaning": "瞄一眼"
  },
  {
    "word": "pay respects",
    "meaning": "致敬 / 表達哀悼"
  },
  {
    "word": "blow one's mind",
    "meaning": "令人極度震驚 / 大開眼界"
  },
  {
    "word": "cast a vote",
    "meaning": "投票"
  },
  {
    "word": "draw inspiration from",
    "meaning": "從...汲取靈感"
  },
  {
    "word": "drive a hard bargain",
    "meaning": "討價還價很厲害 / 堅持苛刻條件"
  },
  {
    "word": "hit the jackpot",
    "meaning": "中大獎 / 發大財"
  },
  {
    "word": "make a scene",
    "meaning": "大吵大鬧 / 當眾出醜"
  },
  {
    "word": "play mind games",
    "meaning": "耍心機 / 玩心理戰"
  },
  {
    "word": "raise one's voice",
    "meaning": "提高音量 / 大小聲"
  },
  {
    "word": "run an errand",
    "meaning": "辦雜事 / 跑腿"
  },
  {
    "word": "set a budget",
    "meaning": "編列預算"
  },
  {
    "word": "take a toll on",
    "meaning": "對...造成損害或不良影響"
  },
  {
    "word": "weather the storm",
    "meaning": "渡過難關"
  },
  {
    "word": "give an account of",
    "meaning": "描述 / 說明"
  },
  {
    "word": "bear fruit",
    "meaning": "結出果實 / 獲得成效"
  },
  {
    "word": "bring to a halt",
    "meaning": "使...停止"
  },
  {
    "word": "change one's tune",
    "meaning": "改變態度 / 改口"
  },
  {
    "word": "come into contact with",
    "meaning": "接觸到"
  },
  {
    "word": "do the dishes",
    "meaning": "洗碗"
  },
  {
    "word": "ease the pain",
    "meaning": "減輕痛苦"
  },
  {
    "word": "follow suit",
    "meaning": "依樣畫葫蘆 / 跟進"
  },
  {
    "word": "gain ground",
    "meaning": "取得進展 / 獲得支持"
  },
  {
    "word": "give way to",
    "meaning": "讓路給 / 被...取代"
  },
  {
    "word": "have a whale of a time",
    "meaning": "玩得非常痛快"
  },
  {
    "word": "keep one's word",
    "meaning": "遵守諾言"
  },
  {
    "word": "lay off staff",
    "meaning": "解僱員工"
  },
  {
    "word": "leave no stone unturned",
    "meaning": "竭盡全力 / 想方設法"
  },
  {
    "word": "make a profit",
    "meaning": "賺取利潤"
  },
  {
    "word": "pay a premium",
    "meaning": "支付最高昂的費用 / 加價"
  },
  {
    "word": "put emphasis on",
    "meaning": "強調"
  },
  {
    "word": "read between the lines",
    "meaning": "讀出字裡行間的隱含意義"
  },
  {
    "word": "ring a bell",
    "meaning": "聽起來很耳熟"
  },
  {
    "word": "run a simulation",
    "meaning": "進行模擬"
  },
  {
    "word": "save the day",
    "meaning": "挽救局面"
  },
  {
    "word": "shed tears",
    "meaning": "流淚"
  },
  {
    "word": "spill the beans",
    "meaning": "洩漏秘密"
  },
  {
    "word": "take a stance",
    "meaning": "表明立場"
  },
  {
    "word": "use caution",
    "meaning": "保持謹慎"
  },
  {
    "word": "wave goodbye",
    "meaning": "揮手告別"
  },
  {
    "word": "win one's heart",
    "meaning": "贏得某人的心"
  },
  {
    "word": "work miracles",
    "meaning": "創造奇蹟"
  },
  {
    "word": "build trust",
    "meaning": "建立信任"
  },
  {
    "word": "clear a debt",
    "meaning": "清償債務"
  },
  {
    "word": "meet a requirement",
    "meaning": "符合要求"
  },
  {
    "word": "state an opinion",
    "meaning": "陳述觀點"
  },
  {
    "word": "test a theory",
    "meaning": "測試理論"
  },
  {
    "word": "outline a plan",
    "meaning": "概述計劃"
  },
  {
    "word": "make an assumption",
    "meaning": "做出假設"
  },
  {
    "word": "launch a product",
    "meaning": "推出產品"
  },
  {
    "word": "file a complaint",
    "meaning": "提出投訴"
  },
  {
    "word": "yield results",
    "meaning": "產生結果"
  },
  {
    "word": "maintain order",
    "meaning": "維持秩序"
  },
  {
    "word": "formulate a strategy",
    "meaning": "制定策略"
  },
  {
    "word": "command respect",
    "meaning": "贏得尊敬"
  },
  {
    "word": "exert pressure",
    "meaning": "施加壓力"
  },
  {
    "word": "fulfill a duty",
    "meaning": "履行職責"
  },
  {
    "word": "incur expenses",
    "meaning": "產生費用"
  },
  {
    "word": "handle a crisis",
    "meaning": "處理危機"
  },
  {
    "word": "voice a grievance",
    "meaning": "表達不滿 / 訴苦"
  },
  {
    "word": "deliver a baby",
    "meaning": "接生"
  },
  {
    "word": "trigger a reaction",
    "meaning": "引發反應"
  },
  {
    "word": "prompt a discussion",
    "meaning": "引起討論"
  },
  {
    "word": "make peace",
    "meaning": "和解"
  },
  {
    "word": "address an issue",
    "meaning": "處理 / 解決問題"
  },
  {
    "word": "pose a challenge",
    "meaning": "帶來挑戰"
  },
  {
    "word": "draw a crowd",
    "meaning": "吸引人群"
  },
  {
    "word": "break the silence",
    "meaning": "打破沉默"
  },
  {
    "word": "make arrangements",
    "meaning": "做出安排"
  },
  {
    "word": "take a survey",
    "meaning": "做問卷調查"
  },
  {
    "word": "catch the train",
    "meaning": "趕火車"
  },
  {
    "word": "do research",
    "meaning": "做研究"
  },
  {
    "word": "raise capital",
    "meaning": "籌集資金"
  },
  {
    "word": "pose for a photo",
    "meaning": "擺姿勢拍照"
  },
  {
    "word": "make a guess",
    "meaning": "猜測"
  },
  {
    "word": "gain a competitive edge",
    "meaning": "獲得競爭優勢"
  },
  {
    "word": "cross one's mind",
    "meaning": "閃過念頭"
  },
  {
    "word": "leave an impression",
    "meaning": "留下印象"
  },
  {
    "word": "strike a deal",
    "meaning": "達成協議"
  },
  {
    "word": "clear the air",
    "meaning": "消除誤會 / 淨化氣氛"
  },
  {
    "word": "place an order",
    "meaning": "下訂單"
  },
  {
    "word": "draft a contract",
    "meaning": "起草合約"
  },
  {
    "word": "shift the blame",
    "meaning": "推卸責任"
  },
  {
    "word": "play a trick on",
    "meaning": "惡作劇 / 開玩笑"
  },
  {
    "word": "take the initiative",
    "meaning": "採取主動"
  },
  {
    "word": "make ends meet",
    "meaning": "維持生計 / 使收支平衡"
  },
  {
    "word": "spark an interest",
    "meaning": "激發興趣"
  },
  {
    "word": "exercise control",
    "meaning": "實施控制"
  },
  {
    "word": "bridge a gap",
    "meaning": "消除隔閡 / 縮小差距"
  },
  {
    "word": "cast light on",
    "meaning": "闡明 / 使...清楚"
  },
  {
    "word": "break a tie",
    "meaning": "打破平局"
  },
  {
    "word": "reach a milestone",
    "meaning": "達到里程碑"
  },
  {
    "word": "follow directions",
    "meaning": "聽從指示"
  },
  {
    "word": "put something on the map",
    "meaning": "使...出名"
  }
];

phrasesTwoEntries.forEach(({ word, meaning }) => {
  const [entry] = senseBank.lookup(word);
  assert.ok(entry, `${word} should be covered from PHRASES-2.txt`);
  assert.strictEqual(entry.type, "phrase");
  assert.strictEqual(entry.pos, "verb");
  assert.strictEqual(entry.meaning, meaning, `${word} should match PHRASES-2.txt meaning`);
  assert.ok(entry.level, `${word} should have a level`);
});

const countryNationalityEntries = [
  [
    "China",
    "中國",
    "Chinese",
    "中國的 / 中文的 / 中國人"
  ],
  [
    "Japan",
    "日本",
    "Japanese",
    "日本的 / 日文的 / 日本人"
  ],
  [
    "South Korea",
    "南韓",
    "Korean",
    "韓國的 / 韓文的 / 韓國人"
  ],
  [
    "North Korea",
    "北韓",
    "North Korean",
    "北韓的 / 北韓人"
  ],
  [
    "Singapore",
    "新加坡",
    "Singaporean",
    "新加坡的 / 新加坡人"
  ],
  [
    "Thailand",
    "泰國",
    "Thai",
    "泰國的 / 泰文的 / 泰國人"
  ],
  [
    "Malaysia",
    "馬來西亞",
    "Malaysian",
    "馬來西亞的 / 馬來西亞人"
  ],
  [
    "Indonesia",
    "印尼",
    "Indonesian",
    "印尼的 / 印尼文的 / 印尼人"
  ],
  [
    "Vietnam",
    "越南",
    "Vietnamese",
    "越南的 / 越南文的 / 越南人"
  ],
  [
    "the Philippines",
    "菲律賓",
    "Filipino",
    "菲律賓的 / 菲律賓人"
  ],
  [
    "India",
    "印度",
    "Indian",
    "印度的 / 印度人"
  ],
  [
    "Pakistan",
    "巴基斯坦",
    "Pakistani",
    "巴基斯坦的 / 巴基斯坦人"
  ],
  [
    "Nepal",
    "尼泊爾",
    "Nepalese",
    "尼泊爾的 / 尼泊爾人"
  ],
  [
    "Bangladesh",
    "孟加拉",
    "Bangladeshi",
    "孟加拉的 / 孟加拉人"
  ],
  [
    "Sri Lanka",
    "斯里蘭卡",
    "Sri Lankan",
    "斯里蘭卡的 / 斯里蘭卡人"
  ],
  [
    "Australia",
    "澳洲",
    "Australian",
    "澳洲的 / 澳洲人"
  ],
  [
    "New Zealand",
    "新西蘭",
    "New Zealander",
    "新西蘭人"
  ],
  [
    "Canada",
    "加拿大",
    "Canadian",
    "加拿大的 / 加拿大人"
  ],
  [
    "the United States",
    "美國",
    "American",
    "美國的 / 美國人"
  ],
  [
    "the United Kingdom",
    "英國",
    "British",
    "英國的 / 英國人"
  ],
  [
    "Ireland",
    "愛爾蘭",
    "Irish",
    "愛爾蘭的 / 愛爾蘭人"
  ],
  [
    "France",
    "法國",
    "French",
    "法國的 / 法文的 / 法國人"
  ],
  [
    "Germany",
    "德國",
    "German",
    "德國的 / 德文的 / 德國人"
  ],
  [
    "Italy",
    "意大利",
    "Italian",
    "意大利的 / 意大利文的 / 意大利人"
  ],
  [
    "Spain",
    "西班牙",
    "Spanish",
    "西班牙的 / 西班牙文的 / 西班牙人"
  ],
  [
    "Portugal",
    "葡萄牙",
    "Portuguese",
    "葡萄牙的 / 葡萄牙文的 / 葡萄牙人"
  ],
  [
    "the Netherlands",
    "荷蘭",
    "Dutch",
    "荷蘭的 / 荷蘭人"
  ],
  [
    "Belgium",
    "比利時",
    "Belgian",
    "比利時的 / 比利時人"
  ],
  [
    "Switzerland",
    "瑞士",
    "Swiss",
    "瑞士的 / 瑞士人"
  ],
  [
    "Austria",
    "奧地利",
    "Austrian",
    "奧地利的 / 奧地利人"
  ],
  [
    "Sweden",
    "瑞典",
    "Swedish",
    "瑞典的 / 瑞典文的 / 瑞典人"
  ],
  [
    "Norway",
    "挪威",
    "Norwegian",
    "挪威的 / 挪威文的 / 挪威人"
  ],
  [
    "Denmark",
    "丹麥",
    "Danish",
    "丹麥的 / 丹麥文的 / 丹麥人"
  ],
  [
    "Finland",
    "芬蘭",
    "Finnish",
    "芬蘭的 / 芬蘭文的 / 芬蘭人"
  ],
  [
    "Poland",
    "波蘭",
    "Polish",
    "波蘭的 / 波蘭文的 / 波蘭人"
  ],
  [
    "Greece",
    "希臘",
    "Greek",
    "希臘的 / 希臘文的 / 希臘人"
  ],
  [
    "Russia",
    "俄羅斯",
    "Russian",
    "俄羅斯的 / 俄文的 / 俄羅斯人"
  ],
  [
    "Ukraine",
    "烏克蘭",
    "Ukrainian",
    "烏克蘭的 / 烏克蘭文的 / 烏克蘭人"
  ],
  [
    "Turkey",
    "土耳其",
    "Turkish",
    "土耳其的 / 土耳其文的 / 土耳其人"
  ],
  [
    "Egypt",
    "埃及",
    "Egyptian",
    "埃及的 / 埃及人"
  ],
  [
    "South Africa",
    "南非",
    "South African",
    "南非的 / 南非人"
  ],
  [
    "Nigeria",
    "尼日利亞",
    "Nigerian",
    "尼日利亞的 / 尼日利亞人"
  ],
  [
    "Kenya",
    "肯尼亞",
    "Kenyan",
    "肯尼亞的 / 肯尼亞人"
  ],
  [
    "Brazil",
    "巴西",
    "Brazilian",
    "巴西的 / 巴西人"
  ],
  [
    "Argentina",
    "阿根廷",
    "Argentinian",
    "阿根廷的 / 阿根廷人"
  ],
  [
    "Chile",
    "智利",
    "Chilean",
    "智利的 / 智利人"
  ],
  [
    "Mexico",
    "墨西哥",
    "Mexican",
    "墨西哥的 / 墨西哥人"
  ],
  [
    "Peru",
    "秘魯",
    "Peruvian",
    "秘魯的 / 秘魯人"
  ],
  [
    "Saudi Arabia",
    "沙特阿拉伯",
    "Saudi Arabian",
    "沙特阿拉伯的 / 沙特阿拉伯人"
  ],
  [
    "the United Arab Emirates",
    "阿聯酋",
    "Emirati",
    "阿聯酋的 / 阿聯酋人"
  ],
  [
    "Israel",
    "以色列",
    "Israeli",
    "以色列的 / 以色列人"
  ],
  [
    "Iran",
    "伊朗",
    "Iranian",
    "伊朗的 / 伊朗人"
  ],
  [
    "Iraq",
    "伊拉克",
    "Iraqi",
    "伊拉克的 / 伊拉克人"
  ]
];
const mtrStationEntries = [
  [
    "Whampoa",
    "黃埔"
  ],
  [
    "Ho Man Tin",
    "何文田"
  ],
  [
    "Yau Ma Tei",
    "油麻地"
  ],
  [
    "Mong Kok",
    "旺角"
  ],
  [
    "Prince Edward",
    "太子"
  ],
  [
    "Shek Kip Mei",
    "石硤尾"
  ],
  [
    "Kowloon Tong",
    "九龍塘"
  ],
  [
    "Lok Fu",
    "樂富"
  ],
  [
    "Wong Tai Sin",
    "黃大仙"
  ],
  [
    "Diamond Hill",
    "鑽石山"
  ],
  [
    "Choi Hung",
    "彩虹"
  ],
  [
    "Kowloon Bay",
    "九龍灣"
  ],
  [
    "Ngau Tau Kok",
    "牛頭角"
  ],
  [
    "Kwun Tong",
    "觀塘"
  ],
  [
    "Lam Tin",
    "藍田"
  ],
  [
    "Yau Tong",
    "油塘"
  ],
  [
    "Tiu Keng Leng",
    "調景嶺"
  ],
  [
    "Tsuen Wan",
    "荃灣"
  ],
  [
    "Tai Wo Hau",
    "大窩口"
  ],
  [
    "Kwai Hing",
    "葵興"
  ],
  [
    "Kwai Fong",
    "葵芳"
  ],
  [
    "Lai King",
    "荔景"
  ],
  [
    "Mei Foo",
    "美孚"
  ],
  [
    "Lai Chi Kok",
    "荔枝角"
  ],
  [
    "Cheung Sha Wan",
    "長沙灣"
  ],
  [
    "Sham Shui Po",
    "深水埗"
  ],
  [
    "Jordan",
    "佐敦"
  ],
  [
    "Tsim Sha Tsui",
    "尖沙咀"
  ],
  [
    "Admiralty",
    "金鐘"
  ],
  [
    "Central",
    "中環"
  ],
  [
    "Kennedy Town",
    "堅尼地城"
  ],
  [
    "HKU",
    "香港大學"
  ],
  [
    "Sai Ying Pun",
    "西營盤"
  ],
  [
    "Sheung Wan",
    "上環"
  ],
  [
    "Wan Chai",
    "灣仔"
  ],
  [
    "Causeway Bay",
    "銅鑼灣"
  ],
  [
    "Tin Hau",
    "天后"
  ],
  [
    "Fortress Hill",
    "炮台山"
  ],
  [
    "North Point",
    "北角"
  ],
  [
    "Quarry Bay",
    "鰂魚涌"
  ],
  [
    "Tai Koo",
    "太古"
  ],
  [
    "Sai Wan Ho",
    "西灣河"
  ],
  [
    "Shau Kei Wan",
    "筲箕灣"
  ],
  [
    "Heng Fa Chuen",
    "杏花邨"
  ],
  [
    "Chai Wan",
    "柴灣"
  ],
  [
    "Ocean Park",
    "海洋公園"
  ],
  [
    "Wong Chuk Hang",
    "黃竹坑"
  ],
  [
    "Lei Tung",
    "利東"
  ],
  [
    "South Horizons",
    "海怡半島"
  ],
  [
    "LOHAS Park",
    "康城"
  ],
  [
    "Po Lam",
    "寶琳"
  ],
  [
    "Hang Hau",
    "坑口"
  ],
  [
    "Tseung Kwan O",
    "將軍澳"
  ],
  [
    "Hong Kong",
    "香港"
  ],
  [
    "Kowloon",
    "九龍"
  ],
  [
    "Olympic",
    "奧運"
  ],
  [
    "Nam Cheong",
    "南昌"
  ],
  [
    "Tsing Yi",
    "青衣"
  ],
  [
    "Sunny Bay",
    "欣澳"
  ],
  [
    "Disneyland Resort",
    "迪士尼"
  ],
  [
    "Tung Chung",
    "東涌"
  ],
  [
    "Airport",
    "機場"
  ],
  [
    "AsiaWorld-Expo",
    "博覽館"
  ],
  [
    "Exhibition Centre",
    "會展"
  ],
  [
    "Hung Hom",
    "紅磡"
  ],
  [
    "Mong Kok East",
    "旺角東"
  ],
  [
    "Tai Wai",
    "大圍"
  ],
  [
    "Sha Tin",
    "沙田"
  ],
  [
    "Fo Tan",
    "火炭"
  ],
  [
    "Racecourse",
    "馬場"
  ],
  [
    "University",
    "大學"
  ],
  [
    "Tai Po Market",
    "大埔墟"
  ],
  [
    "Tai Wo",
    "太和"
  ],
  [
    "Fanling",
    "粉嶺"
  ],
  [
    "Sheung Shui",
    "上水"
  ],
  [
    "Lo Wu",
    "羅湖"
  ],
  [
    "Lok Ma Chau",
    "落馬洲"
  ],
  [
    "Wu Kai Sha",
    "烏溪沙"
  ],
  [
    "Ma On Shan",
    "馬鞍山"
  ],
  [
    "Heng On",
    "恆安"
  ],
  [
    "Tai Shui Hang",
    "大水坑"
  ],
  [
    "Shek Mun",
    "石門"
  ],
  [
    "City One",
    "第一城"
  ],
  [
    "Sha Tin Wai",
    "沙田圍"
  ],
  [
    "Che Kung Temple",
    "車公廟"
  ],
  [
    "Hin Keng",
    "顯徑"
  ],
  [
    "Kai Tak",
    "啟德"
  ],
  [
    "Sung Wong Toi",
    "宋皇臺"
  ],
  [
    "To Kwa Wan",
    "土瓜灣"
  ],
  [
    "East Tsim Sha Tsui",
    "尖東"
  ],
  [
    "Austin",
    "柯士甸"
  ],
  [
    "Tsuen Wan West",
    "荃灣西"
  ],
  [
    "Kam Sheung Road",
    "錦上路"
  ],
  [
    "Yuen Long",
    "元朗"
  ],
  [
    "Long Ping",
    "朗屏"
  ],
  [
    "Tin Shui Wai",
    "天水圍"
  ],
  [
    "Siu Hong",
    "兆康"
  ],
  [
    "Tuen Mun",
    "屯門"
  ],
  [
    "Hong Kong West Kowloon",
    "香港西九龍"
  ]
];
const hkStreetEntries = [
  [
    "Nathan Road",
    "彌敦道"
  ],
  [
    "Argyle Street",
    "亞皆老街"
  ],
  [
    "Prince Edward Road",
    "太子道"
  ],
  [
    "Prince Edward Road West",
    "太子道西"
  ],
  [
    "Prince Edward Road East",
    "太子道東"
  ],
  [
    "Waterloo Road",
    "窩打老道"
  ],
  [
    "Boundary Street",
    "界限街"
  ],
  [
    "Portland Street",
    "砵蘭街"
  ],
  [
    "Shanghai Street",
    "上海街"
  ],
  [
    "Tung Choi Street",
    "通菜街"
  ],
  [
    "Sai Yeung Choi Street",
    "西洋菜街"
  ],
  [
    "Fa Yuen Street",
    "花園街"
  ],
  [
    "Ladies Market",
    "女人街"
  ],
  [
    "Temple Street",
    "廟街"
  ],
  [
    "Canton Road",
    "廣東道"
  ],
  [
    "Austin Road",
    "柯士甸道"
  ],
  [
    "Salisbury Road",
    "梳士巴利道"
  ],
  [
    "Chatham Road South",
    "漆咸道南"
  ],
  [
    "Chatham Road North",
    "漆咸道北"
  ],
  [
    "Jordan Road",
    "佐敦道"
  ],
  [
    "Gascoigne Road",
    "加士居道"
  ],
  [
    "Lung Cheung Road",
    "龍翔道"
  ],
  [
    "Kwun Tong Road",
    "觀塘道"
  ],
  [
    "Hoi Yuen Road",
    "開源道"
  ],
  [
    "Hip Wo Street",
    "協和街"
  ],
  [
    "Kwun Tong Promenade",
    "觀塘海濱"
  ],
  [
    "Castle Peak Road",
    "青山公路"
  ],
  [
    "Tsuen Wan Road",
    "荃灣路"
  ],
  [
    "Kwai Chung Road",
    "葵涌道"
  ],
  [
    "Texaco Road",
    "德士古道"
  ],
  [
    "Sha Tsui Road",
    "沙咀道"
  ],
  [
    "Tai Ho Road",
    "大河道"
  ],
  [
    "Yeung Uk Road",
    "楊屋道"
  ],
  [
    "Shing Mun Road",
    "城門道"
  ],
  [
    "Tuen Mun Road",
    "屯門公路"
  ],
  [
    "Yuen Long Highway",
    "元朗公路"
  ],
  [
    "Tai Tong Road",
    "大棠路"
  ],
  [
    "Castle Peak Road - Yuen Long",
    "青山公路－元朗段"
  ],
  [
    "Ma Tin Road",
    "馬田路"
  ],
  [
    "Tin Wah Road",
    "天華路"
  ],
  [
    "Tin Shui Road",
    "天瑞路"
  ],
  [
    "Sha Tin Centre Street",
    "沙田正街"
  ],
  [
    "Tai Chung Kiu Road",
    "大涌橋路"
  ],
  [
    "Che Kung Miu Road",
    "車公廟路"
  ],
  [
    "Tai Po Road",
    "大埔道"
  ],
  [
    "Tai Po Road - Sha Tin",
    "大埔公路－沙田段"
  ],
  [
    "Tolo Highway",
    "吐露港公路"
  ],
  [
    "Fanling Highway",
    "粉嶺公路"
  ],
  [
    "Jockey Club Road",
    "馬會道"
  ],
  [
    "Po Shek Wu Road",
    "寶石湖路"
  ],
  [
    "Choi Yuen Road",
    "彩園路"
  ],
  [
    "King's Road",
    "英皇道"
  ],
  [
    "Java Road",
    "渣華道"
  ],
  [
    "Electric Road",
    "電氣道"
  ],
  [
    "Hennessy Road",
    "軒尼詩道"
  ],
  [
    "Johnston Road",
    "莊士敦道"
  ],
  [
    "Lockhart Road",
    "駱克道"
  ],
  [
    "Gloucester Road",
    "告士打道"
  ],
  [
    "Queen's Road Central",
    "皇后大道中"
  ],
  [
    "Queen's Road East",
    "皇后大道東"
  ],
  [
    "Queen's Road West",
    "皇后大道西"
  ],
  [
    "Des Voeux Road Central",
    "德輔道中"
  ],
  [
    "Des Voeux Road West",
    "德輔道西"
  ],
  [
    "Connaught Road Central",
    "干諾道中"
  ],
  [
    "Connaught Road West",
    "干諾道西"
  ],
  [
    "Hollywood Road",
    "荷李活道"
  ],
  [
    "Caine Road",
    "堅道"
  ],
  [
    "Bonham Road",
    "般咸道"
  ],
  [
    "Conduit Road",
    "干德道"
  ],
  [
    "Robinson Road",
    "羅便臣道"
  ],
  [
    "Garden Road",
    "花園道"
  ],
  [
    "Cotton Tree Drive",
    "紅棉路"
  ],
  [
    "Magazine Gap Road",
    "馬己仙峽道"
  ],
  [
    "Stubbs Road",
    "司徒拔道"
  ],
  [
    "Pok Fu Lam Road",
    "薄扶林道"
  ],
  [
    "Victoria Road",
    "域多利道"
  ],
  [
    "Aberdeen Main Road",
    "香港仔大道"
  ],
  [
    "Wong Chuk Hang Road",
    "黃竹坑道"
  ],
  [
    "Ap Lei Chau Bridge Road",
    "鴨脷洲橋道"
  ],
  [
    "Island Eastern Corridor",
    "東區走廊"
  ],
  [
    "Shau Kei Wan Road",
    "筲箕灣道"
  ],
  [
    "Chai Wan Road",
    "柴灣道"
  ],
  [
    "Shek O Road",
    "石澳道"
  ],
  [
    "Tseung Kwan O Road",
    "將軍澳道"
  ],
  [
    "Po Lam Road",
    "寶琳路"
  ],
  [
    "Wan Po Road",
    "環保大道"
  ],
  [
    "Clear Water Bay Road",
    "清水灣道"
  ],
  [
    "Sai Sha Road",
    "西沙路"
  ],
  [
    "Ma On Shan Road",
    "馬鞍山路"
  ],
  [
    "Tai Mong Tsai Road",
    "大網仔路"
  ],
  [
    "Hiram's Highway",
    "西貢公路"
  ],
  [
    "Lantau Link",
    "青嶼幹線"
  ],
  [
    "North Lantau Highway",
    "北大嶼山公路"
  ],
  [
    "Tung Chung Road",
    "東涌道"
  ],
  [
    "Cheung Tung Road",
    "翔東路"
  ]
];

countryNationalityEntries.forEach(([country, countryMeaning, nationality, nationalityMeaning]) => {
  const [countryEntry] = senseBank.lookup(country);
  assert.ok(countryEntry, country + " should be covered as a country name");
  assert.strictEqual(countryEntry.pos, "noun");
  assert.ok(countryEntry.meaning, country + " should have a Chinese meaning");

  const nationalityEntries = senseBank.lookup(nationality, { includeHidden: true, limit: 12 });
  const nationalityEntry = nationalityEntries.find((entry) => (
    ["adjective", "noun"].includes(entry.pos)
    && entry.meaning
    && (entry.meaning.includes("人") || entry.meaning.includes("文") || entry.meaning.includes("的"))
  ));
  assert.ok(nationalityEntry, nationality + " should be covered as a nationality / language form");
});

mtrStationEntries.forEach(([station, meaning]) => {
  const entries = senseBank.lookup(station, { includeHidden: true, limit: 12 });
  const entry = entries.find((candidate) => candidate.pos === "noun" && candidate.meaning === meaning);
  assert.ok(entry, station + " should be covered as an MTR station name");
});

hkStreetEntries.forEach(([street, meaning]) => {
  const entries = senseBank.lookup(street, { includeHidden: true, limit: 12 });
  const entry = entries.find((candidate) => candidate.pos === "noun" && candidate.meaning === meaning);
  assert.ok(entry, street + " should be covered as a Hong Kong street / road name");
});

function normalizeVerbTableMeaning(value) {
  return String(value || "")
    .trim()
    .replace(/[；;]/g, " / ")
    .replace(/\s*[/／]\s*/g, " / ")
    .replace(/\s+/g, " ");
}

const verbTableFormExpectations = new Map();
(globalThis.GRAMMAR_VERB_BANK || []).forEach(([zh, present, past, pp, ing]) => {
  const base = senseBank.normalizeWord(present);
  const meaning = normalizeVerbTableMeaning(zh);
  [
    [past, "過去式"],
    [pp, "PP"],
    [ing, "ING"]
  ].forEach(([rawForms, role]) => {
    String(rawForms || "").split("/").map((form) => form.trim()).filter(Boolean).forEach((form) => {
      const normalizedForm = senseBank.normalizeWord(form);
      if (!normalizedForm || normalizedForm === base) return;
      const key = `${normalizedForm}|${base}`;
      if (!verbTableFormExpectations.has(key)) {
        verbTableFormExpectations.set(key, {
          form: normalizedForm,
          base,
          meaning,
          roles: new Set()
        });
      }
      verbTableFormExpectations.get(key).roles.add(role);
    });
  });
});

assert.ok(verbTableFormExpectations.size >= 500, "verb table should produce broad inflected-form coverage");
verbTableFormExpectations.forEach(({ form, base, meaning, roles }) => {
  const expectedMeaning = `${meaning}（${base} ${Array.from(roles).join(" / ")}）`;
  const entry = senseBank.lookup(form, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === "verb" && candidate.meaning === expectedMeaning
  ));
  assert.ok(entry, `${form} should include verb-table meaning ${expectedMeaning}`);
});

const mt25ReviewedExpectations = [
  ["roof garden", "noun", "天台花園 / 屋頂花園"],
  ["smell the roses", "verb", "享受身邊事物 / 放慢腳步欣賞生活"],
  ["compost heap", "noun", "堆肥堆"],
  ["typhoon-proof", "adjective", "防颱風的"],
  ["rooftop farming", "noun", "天台耕種 / 屋頂農耕"],
  ["urban jungle", "noun", "石屎森林 / 城市叢林"],
  ["okra", "noun", "秋葵"],
  ["forge links", "verb", "建立聯繫"],
  ["in its infancy", "adjective", "處於起步階段的 / 尚在初期的"],
  ["housing crisis", "noun", "房屋危機 / 住房危機"],
  ["brownfield sites", "noun", "棕地 / 已發展後閒置土地"],
  ["Small House Policy", "noun", "丁屋政策 / 小型屋宇政策"],
  ["at a premium", "adjective", "供不應求的 / 非常珍貴的"],
  ["state coffers", "noun", "政府庫房 / 公帑"],
  ["property bubble", "noun", "樓市泡沫 / 物業泡沫"],
  ["in free fall", "adjective", "急速下跌的 / 失控下跌的"],
  ["priced out of the market", "adjective", "因價格太高而被市場排除的"],
  ["take the hit", "verb", "承受打擊 / 承擔損失"],
  ["cut my losses", "verb", "止蝕 / 減少損失"],
  ["out of pocket", "adjective", "虧錢的 / 自掏腰包的"]
];

mt25ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT25 reviewed sense ${pos}:${meaning}`);
});

const mt27ReviewedExpectations = [
  ["anthropologist", "noun", "人類學家"],
  ["social dynamics", "noun", "社交互動模式 / 群體互動"],
  ["navigate", "verb", "應付 / 處理"],
  ["inner circle", "noun", "核心朋友圈 / 親近圈子"],
  ["rack up", "verb", "累積 / 大量取得"],
  ["up their game", "verb", "提升表現 / 加把勁"],
  ["sibling rivalry", "noun", "兄弟姊妹間的競爭"],
  ["waterslide tester", "noun", "水上滑梯測試員"],
  ["fragrance chemist", "noun", "香料化學師"],
  ["food stylist", "noun", "食物造型師"],
  ["professional mourner", "noun", "職業哭喪者 / 代哭者"],
  ["fall out of fashion", "verb", "不再流行 / 過時"],
  ["Arctic Circle", "noun", "北極圈"],
  ["jet lag", "noun", "時差反應"],
  ["living out of a suitcase", "verb", "長期在外奔波 / 經常旅行"],
  ["sanity", "noun", "神志正常 / 理智"],
  ["interminable", "adjective", "無盡的 / 漫長得看不到盡頭的"],
  ["Martians", "noun", "火星人"],
  ["ludicrous", "adjective", "荒謬可笑的"],
  ["locomotion", "noun", "移動 / 運動方式"],
  ["grotesque", "adjective", "怪異醜陋的"],
  ["snuck up on", "verb", "悄悄接近 / 偷偷靠近"],
  ["snuffed out", "verb", "殺死 / 消滅"],
  ["archaic", "adjective", "古舊的 / 古體的"],
  ["getting my bearings", "verb", "弄清方向 / 了解身處環境"]
];

mt27ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT27 reviewed sense ${pos}:${meaning}`);
});

const mt30ReviewedExpectations = [
  ["arctic", "adjective", "北極的 / 極寒的"],
  ["salt flat", "noun", "鹽沼 / 鹽灘"],
  ["trilogy", "noun", "三部曲"],
  ["gunfire", "noun", "槍聲 / 槍火"],
  ["eponymous", "adjective", "同名的"],
  ["run-of-the-mill", "adjective", "普通的 / 平凡的"],
  ["flak jacket", "noun", "防彈背心 / 防碎片背心"],
  ["tourist trap", "noun", "遊客陷阱 / 專賺遊客錢的地方"],
  ["miss the mark", "verb", "未能達到目的 / 不中肯"],
  ["left me cold", "verb", "未能打動某人 / 令某人無感"],
  ["fruitarian", "noun", "果食者 / 只吃水果的人"],
  ["gluten-free diet", "noun", "無麩質飲食"],
  ["flexitarian", "noun", "彈性素食者"],
  ["flexitarianism", "noun", "彈性素食主義"],
  ["Meat-free Monday", "noun", "無肉星期一運動"],
  ["dietary fads", "noun", "一時流行的飲食潮流"],
  ["sure-fire", "adjective", "肯定成功的 / 穩妥的"],
  ["all-or-nothing", "adjective", "非黑即白的 / 全有或全無的"],
  ["whole-hog", "adjective", "徹底的 / 全面的"],
  ["egregious offender", "noun", "特別嚴重的問題來源 / 最嚴重的元兇"],
  ["flora and fauna", "noun", "動植物"],
  ["ethically indefensible", "adjective", "道德上站不住腳的"],
  ["humane", "adjective", "人道的 / 仁慈的"],
  ["open your doors to", "verb", "開始接受 / 接觸"]
];

mt30ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT30 reviewed sense ${pos}:${meaning}`);
});

const mt32ReviewedExpectations = [
  ["virtual doctor", "noun", "虛擬醫生 / 電腦醫生"],
  ["practise medicine", "verb", "行醫"],
  ["far-fetched", "adjective", "牽強的 / 難以相信的"],
  ["crunch numbers", "verb", "處理大量數字 / 計算數據"],
  ["heart attack", "noun", "心臟病發 / 心肌梗塞"],
  ["healthcare professionals", "noun", "醫護專業人員"],
  ["life-threatening illness", "noun", "危及生命的疾病"],
  ["pacemaker", "noun", "心臟起搏器"],
  ["organ transplant", "noun", "器官移植"],
  ["mechanical skeleton", "noun", "機械骨骼"],
  ["conformity", "noun", "遵從 / 一致"],
  ["great leveller", "noun", "使人人平等的事物"],
  ["gender-neutral uniforms", "noun", "性別中立校服 / 不分性別的校服"],
  ["collectivism", "noun", "集體主義"],
  ["terracotta warrior", "noun", "兵馬俑"],
  ["Chinese tunic suit", "noun", "中山裝"],
  ["Mao suit", "noun", "毛裝 / 中山裝"],
  ["frown upon", "verb", "不贊成 / 反對"],
  ["straitjacket", "noun", "束縛 / 約束"]
];

mt32ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT32 reviewed sense ${pos}:${meaning}`);
});

const mt77ReviewedExpectations = [
  ["yi mein", "noun", "伊麵 / 長壽麵"],
  ["longevity noodles", "noun", "長壽麵"],
  ["cottage industry", "noun", "家庭式小生意 / 家庭工業"],
  ["legend has it", "verb", "傳說是 / 據傳"],
  ["auspicious", "adjective", "吉利的 / 祥瑞的"],
  ["tempt fate", "verb", "冒不必要的風險 / 觸霉頭"],
  ["dexterous", "adjective", "靈巧的 / 手巧的"],
  ["kudos", "noun", "讚賞 / 敬意"],
  ["epée", "noun", "重劍"],
  ["epee", "noun", "重劍"],
  ["walkover", "noun", "輕易取勝 / 輕鬆勝利"],
  ["nerve-wracking", "adjective", "令人緊張的"],
  ["beacon of inspiration", "noun", "鼓舞人心的榜樣 / 靈感來源"],
  ["bucket list", "adjective", "人生願望清單上的"],
  ["money-spinner", "noun", "賺錢項目 / 搖錢樹"],
  ["north of", "preposition", "多於 / 超過"],
  ["outlier", "noun", "例外 / 異常情況"],
  ["in lieu of", "preposition", "代替 / 而不是"],
  ["on the cards", "adjective", "很可能發生的"],
  ["perfect", "verb", "使完善 / 改善"],
  ["baby bouncer", "noun", "嬰兒彈椅 / 嬰兒搖椅"]
];

mt77ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT77 reviewed sense ${pos}:${meaning}`);
});

const mt56ReviewedExpectations = [
  ["Take Your Dog to Work Day", "noun", "帶狗上班日"],
  ["dog-friendly", "adjective", "對狗友善的 / 可帶狗的"],
  ["with open arms", "adverb", "熱情地 / 欣然地"],
  ["petting", "verb", "撫摸 / 輕拍"],
  ["workplace gossip", "noun", "職場八卦 / 辦公室閒話"],
  ["cynophobia", "noun", "恐狗症 / 對狗的恐懼"],
  ["mother-to-be", "noun", "準媽媽"],
  ["antioxidants", "noun", "抗氧化物"],
  ["Pu'er", "noun", "普洱茶"],
  ["steeping", "verb", "浸泡 / 沖泡"],
  ["tea connoisseur", "noun", "茶藝鑑賞家 / 懂茶的人"],
  ["gaiwan", "noun", "蓋碗"],
  ["Chadō", "noun", "日本茶道"],
  ["chasen", "noun", "茶筅 / 竹製抹茶刷"],
  ["hefty price tag", "noun", "沉重代價 / 高昂價格"],
  ["carbon emissions", "noun", "碳排放"],
  ["fast fashion", "noun", "快時尚 / 快速時裝"],
  ["synthetic fabrics", "noun", "合成布料"],
  ["ephemeral", "adjective", "短暫的 / 轉瞬即逝的"],
  ["must-haves", "noun", "必備物品 / 必買單品"],
  ["resist the temptation", "verb", "抵抗誘惑"]
];

mt56ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT56 reviewed sense ${pos}:${meaning}`);
});

const mt52ReviewedExpectations = [
  ["HSP", "noun", "高敏感人士"],
  ["coin the term", "verb", "創造這個用語 / 首次提出這個名稱"],
  ["overstimulated", "adjective", "受過度刺激的"],
  ["thin-skinned", "adjective", "臉皮薄的 / 容易因批評而不快的"],
  ["downtime", "noun", "休息時間 / 放鬆時間"],
  ["rest assured", "verb", "放心 / 可以安心"],
  ["Canto-Western", "adjective", "港式西餐的 / 中西合璧的"],
  ["taken aback", "adjective", "吃驚的 / 感到意外的"],
  ["no-frills", "adjective", "簡單實用的 / 沒有花巧服務的"],
  ["soy sauce western food", "noun", "豉油西餐 / 港式西餐"],
  ["Singaporean noodles", "noun", "星洲炒米 / 星加坡炒米"],
  ["evaporated milk", "noun", "淡奶 / 花奶"],
  ["French toast", "noun", "西多士 / 法式多士"],
  ["board-game cafe", "noun", "桌上遊戲咖啡店"],
  ["tabletop games", "noun", "桌上遊戲"],
  ["tip of the iceberg", "noun", "冰山一角"],
  ["hold their own", "verb", "保持優勢 / 不輸蝕"],
  ["tactility", "noun", "觸感 / 可觸摸的感覺"],
  ["Eurogames", "noun", "歐式桌上遊戲"],
  ["crowdfunding platform", "noun", "眾籌平台"],
  ["game changer", "noun", "改變局面的事物 / 重大轉捩點"],
  ["golden age", "noun", "黃金時代"]
];

mt52ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT52 reviewed sense ${pos}:${meaning}`);
});

const mt49ReviewedExpectations = [
  ["physical therapist", "noun", "物理治療師"],
  ["half-marathon", "noun", "半馬拉松"],
  ["trainers", "noun", "運動鞋"],
  ["won’t cut it", "verb", "達到要求 / 夠好"],
  ["runner’s high", "noun", "跑步後的愉快感"],
  ["couch-to-5K", "noun", "由零開始跑五公里的訓練計劃"],
  ["Jeffing", "noun", "跑走交替訓練法"],
  ["birdcage", "noun", "鳥籠"],
  ["turned my hand to", "verb", "開始嘗試做 / 著手做"],
  ["honing my craft", "verb", "磨練手藝 / 鍛鍊技術"],
  ["bird flu", "noun", "禽流感"],
  ["cut out for", "adjective", "適合做...的"],
  ["birdwatching", "noun", "觀鳥"],
  ["frazzled", "adjective", "疲憊煩躁的 / 壓力很大的"],
  ["Mai Po Marshes", "noun", "米埔濕地"],
  ["binoculars", "noun", "雙筒望遠鏡"],
  ["illegal dumping", "noun", "非法傾倒廢物"],
  ["Blue Zones", "noun", "藍區 / 長壽地區"],
  ["hara hachi bu", "noun", "八分飽原則"],
  ["life expectancy", "noun", "預期壽命"],
  ["close-knit community", "noun", "關係緊密的社群"],
  ["spry", "adjective", "活躍敏捷的 / 老而健壯的"],
  ["mindfulness", "noun", "靜觀 / 正念"]
];

mt49ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT49 reviewed sense ${pos}:${meaning}`);
});

const mt45ReviewedExpectations = [
  ["location sharing app", "noun", "位置分享應用程式"],
  ["keep tabs on", "verb", "留意 / 掌握...的情況"],
  ["par for the course", "adjective", "意料之內的 / 平常的"],
  ["blindly optimistic", "adjective", "盲目樂觀的"],
  ["stalk", "verb", "跟蹤 / 纏擾"],
  ["nefarious motive", "noun", "邪惡動機 / 不良意圖"],
  ["fever pitch", "noun", "極度激動 / 高度緊張狀態"],
  ["erosion of privacy", "noun", "私隱逐漸被侵蝕"],
  ["microcation", "noun", "短途短假期 / 微度假"],
  ["rack up a hefty tab", "verb", "累積高額開支 / 花上一大筆錢"],
  ["staycation", "noun", "留家度假 / 本地度假"],
  ["economic injections", "noun", "經濟注入 / 經濟收益"],
  ["dwarfed", "verb", "使顯得渺小 / 遠遠超過"],
  ["inundating", "verb", "湧入 / 淹沒"],
  ["shuttering their doors", "verb", "關門停業"],
  ["add fuel to the fire", "verb", "火上加油 / 令問題惡化"],
  ["multi-pronged approach", "noun", "多管齊下的方法"],
  ["levies a daily fee", "verb", "徵收費用"],
  ["lesser-known destinations", "noun", "較少人認識的目的地"]
];

mt45ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT45 reviewed sense ${pos}:${meaning}`);
});

const mt80ReviewedExpectations = [
  ["instalment", "noun", "一集 / 一部作品"],
  ["installment", "noun", "一集 / 一部作品"],
  ["franchise", "noun", "系列作品 / 影視系列"],
  ["take in", "verb", "收留 / 收容"],
  ["scratch the surface", "verb", "只了解表面 / 只觸及皮毛"],
  ["bawl my eyes out", "verb", "大哭一場"],
  ["geopark", "noun", "地質公園"],
  ["Cretaceous period", "noun", "白堊紀"],
  ["reel off", "verb", "一口氣說出 / 快速列出"],
  ["turn them on to", "verb", "使某人對...產生興趣"],
  ["strike gold", "verb", "取得重大成功 / 找到好機會"],
  ["music therapy", "noun", "音樂治療"],
  ["give them a lift", "verb", "令某人精神一振 / 鼓舞某人"],
  ["track", "noun", "歌曲 / 音軌"],
  ["get through to", "verb", "與...溝通成功 / 令...明白"],
  ["shine a light into", "verb", "為...帶來希望 / 照亮"]
];

mt80ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT80 reviewed sense ${pos}:${meaning}`);
});

const mt73ReviewedExpectations = [
  ["illustrator", "noun", "插畫家"],
  ["illustrious", "adjective", "著名且受尊敬的"],
  ["chanced upon", "verb", "偶然發現 / 碰巧遇到"],
  ["smash hit", "noun", "大受歡迎的作品 / 巨大成功"],
  ["band", "noun", "一群 / 一夥"],
  ["blew me away", "verb", "令某人驚喜 / 令某人十分感動"],
  ["gruelling", "adjective", "極度辛苦的 / 令人筋疲力盡的"],
  ["stray cats", "noun", "流浪貓"],
  ["euthanasia", "noun", "安樂死"],
  ["sterilized", "verb", "為...絕育"],
  ["moggies", "noun", "貓 / 家貓"],
  ["vaping", "noun", "吸電子煙"],
  ["pull the wool over someone’s eyes", "verb", "蒙騙某人"],
  ["phase out", "verb", "逐步淘汰 / 逐步停止"],
  ["lauded", "verb", "讚揚 / 表揚"],
  ["dragged their feet", "verb", "拖延 / 行動遲緩"],
  ["black market", "noun", "黑市"],
  ["watered down", "verb", "削弱 / 淡化"],
  ["at the expense of", "preposition", "以犧牲...為代價"],
  ["forsaken generation", "noun", "被放棄的一代"]
];

mt73ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT73 reviewed sense ${pos}:${meaning}`);
});

const mt70ReviewedExpectations = [
  ["graphic novels", "noun", "圖像小說 / 漫畫小說"],
  ["in its own right", "adverb", "憑本身條件 / 本身就"],
  ["sci-fi", "noun", "科幻作品"],
  ["the thin end of the wedge", "noun", "問題惡化的開端"],
  ["pique their interest", "verb", "引起某人的興趣"],
  ["heavy lifting", "noun", "費力的工作 / 艱難部分"],
  ["dyslexic", "adjective", "有讀寫障礙的"],
  ["cabbies", "noun", "的士司機"],
  ["customer satisfaction", "noun", "顧客滿意度"],
  ["white knuckles", "noun", "因害怕而握緊至發白的手"],
  ["in one piece", "adverb", "安然無恙地"],
  ["pulling over", "verb", "靠邊停車"],
  ["thermal vents", "noun", "熱泉口 / 熱液噴口"],
  ["submersible", "noun", "潛水器"],
  ["autonomous", "adjective", "自動操作的 / 自主的"],
  ["imploded", "verb", "向內爆裂 / 內爆"],
  ["wreck", "noun", "沉船 / 殘骸"],
  ["high-net-worth", "adjective", "高資產的 / 富裕的"],
  ["spelt out", "verb", "清楚說明 / 明確列出"],
  ["fathom", "verb", "理解 / 弄明白"]
];

mt70ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT70 reviewed sense ${pos}:${meaning}`);
});

const mt71Paper4ReviewedExpectations = [
  ["no such thing as a free lunch", "noun", "天下沒有免費午餐 / 凡事都有代價"],
  ["results speak for themselves", "verb", "結果不言而喻 / 成效一目了然"],
  ["took things a step further", "verb", "更進一步 / 把事情推前一步"],
  ["tackling obesity", "verb", "應對肥胖問題"],
  ["taxpayer dollars", "noun", "納稅人的錢 / 公帑"],
  ["go hungry", "verb", "捱餓 / 挨餓"],
  ["charity cases", "noun", "被視為靠救濟的人 / 被當作需要施捨的人"],
  ["healthful", "adjective", "有益健康的"],
  ["bringing down the cost", "verb", "降低成本"],
  ["skipping breakfast", "verb", "不吃早餐"],
  ["ran out of energy", "verb", "精力耗盡 / 沒有力氣"],
  ["tuna buns", "noun", "吞拿魚包"]
];

mt71Paper4ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT71 Paper 4 reviewed sense ${pos}:${meaning}`);
});

const mt72Paper4ReviewedExpectations = [
  ["lit up", "verb", "點煙 / 吸煙"],
  ["foul odours", "noun", "惡臭 / 難聞氣味"],
  ["drastic measures", "noun", "嚴厲措施 / 激烈手段"],
  ["floated in a public consultation", "verb", "提出建議以供討論"],
  ["modelled after", "verb", "仿照 / 以...為藍本"],
  ["pick up this habit", "verb", "養成習慣 / 染上習慣"],
  ["societal problems", "noun", "社會問題"],
  ["smoking themselves to death", "verb", "吸煙吸到致命 / 因吸煙而喪命"],
  ["law-abiding citizens", "noun", "守法公民"],
  ["illegal tobacco sales", "noun", "非法煙草銷售"],
  ["hooked on nicotine", "adjective", "對尼古丁上癮的"],
  ["tax funded", "adjective", "由稅款資助的"],
  ["all out ban", "noun", "全面禁令"]
];

mt72Paper4ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT72 Paper 4 reviewed sense ${pos}:${meaning}`);
});

const mt73Paper4ReviewedExpectations = [
  ["doxxing", "noun", "起底 / 公開他人私隱資料"],
  ["doxed", "verb", "起底 / 公開他人私隱資料"],
  ["blackmailing", "verb", "勒索 / 要脅"],
  ["manipulated photos", "noun", "被改圖的照片 / 經修改的照片"],
  ["zero tolerance policy", "noun", "零容忍方針 / 零容忍做法"],
  ["Education Bureau", "noun", "教育局"],
  ["telephone hotlines", "noun", "熱線"],
  ["staying off the internet", "verb", "不上網 / 避免上網"],
  ["turned to for help", "verb", "向...求助"],
  ["retaliating", "verb", "報復 / 反擊"],
  ["play into their hands", "verb", "正中某人下懷 / 落入某人圈套"],
  ["impersonating", "verb", "冒充 / 假扮"],
  ["restorative justice", "noun", "修復式司法 / 修復式公義"],
  ["found closure", "verb", "得到釋懷 / 了結心結"],
  ["take it out on", "verb", "向...發洩 / 拿...出氣"],
  ["lashed out", "verb", "猛烈抨擊 / 發脾氣"]
];

mt73Paper4ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT73 Paper 4 reviewed sense ${pos}:${meaning}`);
});

const mt75Paper4ReviewedExpectations = [
  ["viral online challenges", "noun", "網上瘋傳挑戰 / viral 網上挑戰"],
  ["putting out a warning", "verb", "發出警告"],
  ["Blackout challenge", "noun", "昏迷挑戰 / Blackout 挑戰"],
  ["rose to popularity", "verb", "開始流行 / 變得受歡迎"],
  ["speedboats", "noun", "快艇"],
  ["baijiu", "noun", "白酒 / 中國烈酒"],
  ["awareness campaigns", "noun", "提高意識的宣傳活動"],
  ["gaining a following", "verb", "吸引追隨者 / 累積粉絲"],
  ["feel like they belong", "verb", "感到有歸屬感"],
  ["assessing risk", "verb", "評估風險"],
  ["lifelong damage", "noun", "終身傷害 / 長遠傷害"],
  ["on second thought", "adverb", "再想一想後 / 改變主意後"],
  ["middle ground", "noun", "中間立場 / 折衷方案"],
  ["giving in to peer pressure", "verb", "屈服於朋輩壓力"],
  ["check in with themselves", "verb", "留意自己的感受 / 問問自己"],
  ["putting their lives at risk", "verb", "令自己生命有危險"],
  ["overprotection", "noun", "過度保護"],
  ["leaving room for questions", "verb", "留出提問空間 / 容許發問"]
];

mt75Paper4ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT75 Paper 4 reviewed sense ${pos}:${meaning}`);
});

const mt78Paper4ReviewedExpectations = [
  ["gardening", "noun", "園藝 / 種植"],
  ["urban gardening", "noun", "城市園藝 / 都市種植"],
  ["urban heat island effect", "noun", "城市熱島效應"],
  ["building regulations", "noun", "建築規例 / 樓宇規例"],
  ["sustainable living", "noun", "可持續生活"],
  ["fostering a sense of community", "verb", "培養社區感 / 促進鄰里關係"],
  ["sustainability goals", "noun", "可持續發展目標"],
  ["absorbing pollution", "verb", "吸收污染物"],
  ["getting their hands dirty", "verb", "親自動手做 / 落手落腳做"],
  ["vertical gardening", "noun", "垂直種植 / 垂直園藝"],
  ["recycled water", "noun", "循環再用水 / 再造水"],
  ["gardening supplies", "noun", "園藝用品"],
  ["co gardening", "noun", "共同種植 / 共享園藝"],
  ["pilot projects", "noun", "試驗計劃 / 先導計劃"],
  ["container gardens", "noun", "容器種植園 / 盆栽式花園"]
];

mt78Paper4ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT78 Paper 4 reviewed sense ${pos}:${meaning}`);
});

const mt79Paper4ReviewedExpectations = [
  ["broke a vow", "verb", "違背誓言 / 打破承諾"],
  ["cooperative board games", "noun", "合作式桌上遊戲"],
  ["around the world race", "noun", "環遊世界比賽"],
  ["racing drivers", "noun", "賽車手"],
  ["drawing cards", "verb", "抽卡 / 抽牌"],
  ["has a bearing on", "verb", "對...有影響 / 與...有關"],
  ["The Peak", "noun", "太平山頂"],
  ["Bank of China Tower", "noun", "中銀大廈"],
  ["miniature Star Ferries", "noun", "迷你天星小輪"],
  ["element of chance", "noun", "運氣成分 / 隨機因素"],
  ["smile points", "noun", "笑容分 / 快樂分"],
  ["running short of time", "verb", "時間不夠 / 快沒有時間"],
  ["taking on the role of", "verb", "擔任...角色 / 扮演...角色"],
  ["player mats", "noun", "玩家墊 / 遊戲墊"],
  ["tense", "adjective", "緊張的"]
];

mt79Paper4ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT79 Paper 4 reviewed sense ${pos}:${meaning}`);
});

const mt81Paper4ReviewedExpectations = [
  ["medical beauty", "noun", "醫學美容 / 醫美"],
  ["licencing system", "noun", "發牌制度 / 牌照制度"],
  ["beauty parlours", "noun", "美容院"],
  ["Botox", "noun", "肉毒桿菌針 / Botox 注射"],
  ["chemical peels", "noun", "化學換膚"],
  ["laser hair removal", "noun", "激光脫毛"],
  ["signs of ageing", "noun", "衰老跡象 / 老化跡象"],
  ["lumps", "noun", "腫塊 / 硬塊"],
  ["file complaints", "verb", "提出投訴"],
  ["social media filters", "noun", "社交媒體濾鏡"],
  ["quick fixes", "noun", "快速解決辦法 / 權宜之計"],
  ["take out loans", "verb", "借貸 / 申請貸款"]
];

mt81Paper4ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT81 Paper 4 reviewed sense ${pos}:${meaning}`);
});

const mt83Paper4ReviewedExpectations = [
  ["put bums on seats", "verb", "吸引觀眾入場 / 賣座"],
  ["shut its doors", "verb", "結業 / 關門停業"],
  ["woes", "noun", "問題 / 困境"],
  ["gave the industry a beating", "verb", "重創 / 嚴重打擊"],
  ["Netflix and chill", "noun", "在家睇串流影片放鬆（網絡用語）"],
  ["box office records", "noun", "票房紀錄"],
  ["fallen out of love with", "verb", "不再喜愛 / 對...失去熱情"],
  ["three-D", "adjective", "3D 的 / 立體的"],
  ["cinemagoers", "noun", "入戲院睇戲的人 / 電影觀眾"],
  ["do those films justice", "verb", "充分展現 / 公平呈現"],
  ["tension builds up", "verb", "營造緊張感 / 逐漸累積緊張氣氛"]
];

mt83Paper4ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT83 Paper 4 reviewed sense ${pos}:${meaning}`);
});

const mt84Paper4ReviewedExpectations = [
  ["scent boosters", "noun", "香味加強珠 / 洗衣香珠"],
  ["mildew", "noun", "霉味 / 霉菌"],
  ["instructions for use", "noun", "使用說明"],
  ["adverse reactions", "noun", "不良反應"],
  ["be sparing", "verb", "節制使用 / 少量使用"],
  ["grab the viewer's attention", "verb", "吸引注意"],
  ["took a whiff", "verb", "嗅一嗅 / 聞一下"],
  ["mask one smell with another", "verb", "掩蓋氣味"],
  ["marketed", "verb", "推銷 / 推廣"],
  ["dousing ourselves in perfume", "verb", "噴大量香水在身上"],
  ["tolerance levels", "noun", "忍受程度 / 容忍度"]
];

mt84Paper4ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT84 Paper 4 reviewed sense ${pos}:${meaning}`);
});

const mt85Paper4ReviewedExpectations = [
  ["giant steps", "noun", "重大一步 / 重大進展"],
  ["flush our toilets", "verb", "沖廁"],
  ["freshwater", "noun", "淡水"],
  ["catchments", "noun", "集水區 / 集水系統"],
  ["defrosting", "verb", "解凍"],
  ["creeks", "noun", "小溪 / 小河"],
  ["corals", "noun", "珊瑚"],
  ["grey water", "noun", "生活污水 / 可重用家居廢水"],
  ["leaky faucets", "noun", "漏水水龍頭"],
  ["brush your teeth", "verb", "刷牙"],
  ["shaving", "verb", "剃鬚 / 刮鬍子"],
  ["sinks", "noun", "洗碗盆 / 洗手盆"],
  ["get by", "verb", "勉強過活 / 應付生活"]
];

mt85Paper4ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT85 Paper 4 reviewed sense ${pos}:${meaning}`);
});

const mt86Paper4ReviewedExpectations = [
  ["creative spark", "noun", "創作靈感 / 創意火花"],
  ["machine language models", "noun", "語言模型"],
  ["opening credit sequences", "noun", "片頭字幕段落 / 開場演職員名單片段"],
  ["Hungarian", "noun", "匈牙利語 / 匈牙利人"],
  ["native speakers", "noun", "母語使用者"],
  ["Academy Awards", "noun", "奧斯卡金像獎"],
  ["movie scores", "noun", "電影配樂"],
  ["assembly lines", "noun", "流水作業生產線 / 裝配線"],
  ["put people out of work", "verb", "令...失業"],
  ["take your point", "verb", "明白你的觀點 / 接受你的說法"],
  ["have it both ways", "verb", "兩邊好處都想要 / 想兩全其美"],
  ["makeup", "noun", "化妝 / 化妝造型"]
];

mt86Paper4ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT86 Paper 4 reviewed sense ${pos}:${meaning}`);
});

const mt87Paper4ReviewedExpectations = [
  ["film clubs", "noun", "電影學會 / 電影會"],
  ["Facebook pages", "noun", "Facebook 專頁"],
  ["talking points", "noun", "討論要點 / 討論題目"],
  ["do all the talking", "verb", "全程自己講 / 包辦所有發言"],
  ["feature films", "noun", "劇情長片 / 正片電影"],
  ["in their own time", "adverb", "在自己的時間 / 利用私人時間"],
  ["fit in another club", "verb", "安排時間做 / 擠出時間做"],
  ["hanging around", "verb", "閒逛 / 消磨時間"],
  ["where your parents are coming from", "noun", "某人的想法來源 / 某人為何這樣想"],
  ["give it a miss", "verb", "不去 / 不看 / 放棄做"],
  ["take it in turns", "verb", "輪流"],
  ["go through a worksheet", "verb", "逐項查看 / 仔細討論"]
];

mt87Paper4ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT87 Paper 4 reviewed sense ${pos}:${meaning}`);
});

const mt35Paper3ReviewedExpectations = [
  ["cold-pressed juice", "noun", "冷壓果汁"],
  ["budget-conscious", "adjective", "注重價錢的 / 精打細算的"],
  ["make or break", "verb", "決定成敗"],
  ["fit the bill", "verb", "符合要求 / 合適"],
  ["immune system", "noun", "免疫系統"],
  ["pasteurized", "adjective", "經巴士德消毒的 / 經高溫殺菌的"],
  ["claymation", "noun", "黏土動畫"],
  ["stop motion animation", "noun", "定格動畫"],
  ["mail carrier", "noun", "郵差 / 郵件派送員"],
  ["cast and crew", "noun", "演員和製作團隊"],
  ["on a shoestring", "adverb", "以很少資金 / 低成本地"],
  ["continuity", "noun", "連貫性 / 前後一致"],
  ["squashed", "verb", "壓扁 / 壓爛"],
  ["grant proposal", "noun", "撥款申請書"],
  ["appropriacy", "noun", "語境合適度 / 用語恰當度"]
];

mt35Paper3ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT35 Paper 3 reviewed sense ${pos}:${meaning}`);
});

const mt38Paper3ReviewedExpectations = [
  ["listener survey", "noun", "聽眾問卷"],
  ["take your mind off", "verb", "使某人暫時忘記 / 分散注意"],
  ["misinterpreted", "verb", "誤解 / 錯誤理解"],
  ["tender", "noun", "投標書 / 工程投標"],
  ["shock absorption", "noun", "減震 / 吸震"],
  ["compromise on quality", "verb", "犧牲質素 / 在質素上妥協"],
  ["AOB", "noun", "其他事項"],
  ["head it up", "verb", "負責 / 帶領"],
  ["CSR initiatives", "noun", "企業社會責任措施"],
  ["stand behind the work", "verb", "支持 / 為...負責"],
  ["on the ground", "adverb", "在現場 / 實際上"],
  ["jump ship", "verb", "跳槽 / 離職轉投別處"],
  ["set ourselves apart", "verb", "使自己與眾不同 / 突顯自己"],
  ["green buildings", "noun", "綠色建築 / 環保建築"],
  ["put everyone's mind at rest", "verb", "使某人放心"]
];

mt38Paper3ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT38 Paper 3 reviewed sense ${pos}:${meaning}`);
});

const mt42Paper3ReviewedExpectations = [
  ["tree roots", "noun", "樹根"],
  ["good grief", "adverb", "天啊 / 哎呀"],
  ["ultra trail races", "noun", "超級越野跑賽事"],
  ["ultramarathoner", "noun", "超級馬拉松跑手"],
  ["Nordic skiing", "noun", "北歐式滑雪"],
  ["test their limits", "verb", "挑戰自己的極限"],
  ["sign up for", "verb", "報名參加"],
  ["MacLehose Trail", "noun", "麥理浩徑"],
  ["Mui Wo", "noun", "梅窩"],
  ["fell in love with", "verb", "愛上 / 喜歡上"],
  ["inhaler", "noun", "吸入器 / 哮喘噴霧"],
  ["GPX files", "noun", "GPX 路線檔案"],
  ["funding report", "noun", "資金報告 / 撥款報告"],
  ["flagged up", "verb", "指出 / 提醒注意"],
  ["questionnaire responses", "noun", "問卷回覆"]
];

mt42Paper3ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT42 Paper 3 reviewed sense ${pos}:${meaning}`);
});

const mt59ReviewedExpectations = [
  ["begs the question", "verb", "令人不禁要問 / 引出問題"],
  ["inclination", "noun", "傾向 / 意向"],
  ["walks of life", "noun", "各行各業 / 不同背景"],
  ["on the other side of the pond", "adverb", "在大西洋另一邊 / 在英美另一邊"],
  ["rival", "verb", "媲美 / 與...匹敵"],
  ["integral demographic", "noun", "重要客群 / 重要人口群體"],
  ["bag a gold medal", "verb", "贏得金牌"],
  ["euphoric", "adjective", "極度興奮愉快的"],
  ["make waves", "verb", "引起轟動 / 表現突出"],
  ["clinched", "verb", "贏得 / 成功取得"],
  ["squash", "noun", "壁球"],
  ["bouldering", "noun", "抱石"],
  ["HIIT", "noun", "高強度間歇訓練"],
  ["do the trick", "verb", "奏效 / 達到效果"],
  ["jumping jacks", "noun", "開合跳"],
  ["run out of steam", "verb", "耗盡精力 / 無以為繼"],
  ["heart rate", "noun", "心率 / 心跳率"],
  ["plethora", "noun", "大量 / 許多"],
  ["high blood pressure", "noun", "高血壓"],
  ["put to rest", "verb", "終止 / 令...不再成立"]
];

mt59ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT59 reviewed sense ${pos}:${meaning}`);
});

const mt84ReviewedExpectations = [
  ["digital fast", "noun", "戒用電子屏幕 / 數碼禁食"],
  ["digital detox", "noun", "戒用電子產品 / 數碼排毒"],
  ["scrolling", "verb", "滑動瀏覽"],
  ["stick it out", "verb", "撐下去 / 堅持到底"],
  ["scarfed", "verb", "狼吞虎嚥地吃"],
  ["out of the loop", "adjective", "不了解最新情況的 / 被排除在圈外的"],
  ["crochet", "verb", "鉤織"],
  ["hand-eye coordination", "noun", "手眼協調"],
  ["tinnitus", "noun", "耳鳴"],
  ["take a toll", "verb", "對...造成傷害 / 有負面影響"],
  ["central nervous system", "noun", "中樞神經系統"],
  ["developmental delays", "noun", "發展遲緩"],
  ["noise-cancelling", "adjective", "降噪的 / 消除噪音的"],
  ["glass-half-full", "adjective", "樂觀的"],
  ["sleep like a log", "verb", "睡得很沉 / 熟睡"]
];

mt84ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT84 reviewed sense ${pos}:${meaning}`);
});

const mt42ReviewedExpectations = [
  ["pressing challenge", "noun", "迫切挑戰"],
  ["methane", "noun", "甲烷"],
  ["runoff", "noun", "地表徑流 / 流走的污水"],
  ["raze", "verb", "夷平 / 徹底拆毀"],
  ["per capita", "adverb", "人均 / 每人計"],
  ["mock meat", "noun", "素肉 / 仿肉"],
  ["tall order", "noun", "艱難任務 / 高要求"],
  ["pilot programme", "noun", "試驗計劃"],
  ["greywater", "noun", "生活污水 / 可重用廢水"],
  ["e-waste", "noun", "電子廢物"],
  ["planned obsolescence", "noun", "計劃性淘汰 / 有意設計成短壽命"],
  ["Producer Responsibility Scheme", "noun", "生產者責任計劃"],
  ["circular economy", "noun", "循環經濟"],
  ["paltry", "adjective", "微不足道的 / 少得可憐的"],
  ["in the right direction", "adverb", "方向正確地 / 朝正確方向"]
];

mt42ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT42 reviewed sense ${pos}:${meaning}`);
});

const mt38ReviewedExpectations = [
  ["iteration", "noun", "版本 / 形式"],
  ["engrossed", "verb", "使全神貫注 / 吸引住"],
  ["gained traction", "verb", "開始受支持 / 逐漸被接受"],
  ["Kamishibai", "noun", "紙芝居 / 日本傳統紙劇場"],
  ["Genga", "noun", "原畫 / 漫畫原稿"],
  ["modern curse", "noun", "現代禍害 / 現代煩惱"],
  ["delayed gratification", "noun", "延遲滿足 / 等待後才得到滿足"],
  ["word-processing software", "noun", "文字處理軟件"],
  ["eye-opening", "adjective", "令人大開眼界的"],
  ["juggle", "verb", "兼顧 / 同時應付"],
  ["procrastinating", "verb", "拖延 / 延遲做事"],
  ["titivating", "verb", "修飾 / 反覆修改"],
  ["RAM", "noun", "電腦隨機存取記憶體"],
  ["capture points", "noun", "記錄點 / 收集想法的位置"],
  ["under pressure", "adverb", "在壓力下"]
];

mt38ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT38 reviewed sense ${pos}:${meaning}`);
});

const mt35ReviewedExpectations = [
  ["classified ads", "noun", "分類廣告"],
  ["proven track record", "noun", "已證明的良好往績"],
  ["poach", "verb", "挖角 / 搶走人才"],
  ["EdTech", "noun", "教育科技"],
  ["airline pilot", "noun", "航空公司機師"],
  ["autopilots", "noun", "自動駕駛系統"],
  ["First Officer", "noun", "副機師 / 第一副機長"],
  ["cadet programme", "noun", "見習機師培訓計劃"],
  ["aviator", "noun", "飛行員"],
  ["come clean", "verb", "坦白承認 / 說出真相"],
  ["hoax", "noun", "騙局 / 惡作劇"],
  ["human-powered flight", "noun", "人力飛行"],
  ["BASE jumping", "noun", "定點跳傘"],
  ["poles apart", "adjective", "截然不同的"],
  ["Transhumanist", "noun", "超人類主義者"],
  ["hot air balloons", "noun", "熱氣球"],
  ["gliders", "noun", "滑翔機"],
  ["meticulous", "adjective", "細緻的 / 一絲不苟的"],
  ["propeller", "noun", "螺旋槳"],
  ["transatlantic flight", "noun", "橫越大西洋的飛行"]
];

mt35ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT35 reviewed sense ${pos}:${meaning}`);
});

const mt22ReviewedExpectations = [
  ["TV personality", "noun", "電視名人"],
  ["short end of the stick", "noun", "吃虧的一方 / 不利處境"],
  ["heart is in the right place", "adjective", "出發點是好的 / 心地是好的"],
  ["gawk at", "verb", "呆望 / 盯著看"],
  ["native tree", "noun", "本地樹木"],
  ["camphor tree", "noun", "樟樹"],
  ["sea hibiscus", "noun", "黃槿 / 海濱木槿"],
  ["financial meltdown", "noun", "金融崩潰"],
  ["dugout", "noun", "獨木舟 / 挖空樹幹做成的船"],
  ["paddle", "verb", "划槳 / 划艇"],
  ["tip", "verb", "翻側 / 傾側"],
  ["white water", "noun", "急流"],
  ["rapid", "noun", "急流"],
  ["get the hang of", "verb", "掌握技巧 / 學會竅門"],
  ["tip over", "verb", "翻側 / 翻倒"]
];

mt22ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT22 reviewed sense ${pos}:${meaning}`);
});

const mt20ReviewedExpectations = [
  ["out of the blue", "adverb", "突然 / 出乎意料地"],
  ["hereditary", "adjective", "遺傳的"],
  ["knock-on effect", "noun", "連鎖反應 / 後續影響"],
  ["idling engine", "noun", "空轉引擎"],
  ["hit the nail on the head", "verb", "說得完全正確 / 一針見血"],
  ["stock market", "noun", "股票市場"],
  ["net worth", "noun", "淨資產 / 身家"],
  ["frugal", "adjective", "節儉的"],
  ["gift box", "noun", "禮物盒"],
  ["orphanage", "noun", "孤兒院"],
  ["care package", "noun", "慰問包 / 關愛包"],
  ["domestic helper", "noun", "家庭傭工 / 家務助理"],
  ["foreign domestic helper", "noun", "外籍家庭傭工 / 外傭"],
  ["disposable income", "noun", "可支配收入"],
  ["elevated walkway", "noun", "行人天橋 / 架空行人道"],
  ["statutory minimum wage", "noun", "法定最低工資"],
  ["minimum allowable wage", "noun", "最低允許工資"],
  ["human rights activist", "noun", "人權活動人士"],
  ["physically abuse", "verb", "身體虐待"],
  ["poignant", "adjective", "令人心酸的 / 深刻感人的"]
];

mt20ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT20 reviewed sense ${pos}:${meaning}`);
});

const mt17ReviewedExpectations = [
  ["cosmetically pleasing", "adjective", "外觀好看的"],
  ["artificial ingredient", "noun", "人工成分"],
  ["dirty dozen", "noun", "高農藥殘留的十二種蔬果"],
  ["stock up on", "verb", "大量購買 / 囤積"],
  ["selfie", "noun", "自拍照"],
  ["catch on like wildfire", "verb", "迅速流行起來"],
  ["front-facing camera", "noun", "前置鏡頭"],
  ["narcissism", "noun", "自戀"],
  ["floating structure", "noun", "漂浮建築 / 浮動結構"],
  ["seaplane", "noun", "水上飛機"],
  ["seep through", "verb", "滲透 / 滲入"],
  ["mythical island", "noun", "神話島嶼"],
  ["electronic cigarette", "noun", "電子煙"],
  ["relapse", "verb", "故態復萌 / 復吸"],
  ["cigarette butt", "noun", "煙蒂"],
  ["liquid nicotine", "noun", "液態尼古丁"],
  ["kick the habit", "verb", "戒掉壞習慣 / 戒煙癮"],
  ["withdrawal symptom", "noun", "戒斷症狀"],
  ["cessation", "noun", "停止 / 戒除"],
  ["efficacy", "noun", "效用 / 功效"]
];

mt17ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT17 reviewed sense ${pos}:${meaning}`);
});

const mt15ReviewedExpectations = [
  ["cut from the same cloth", "adjective", "同類的 / 本質相似的"],
  ["eschew", "verb", "避開 / 摒棄"],
  ["Gotham City", "noun", "葛咸城"],
  ["World Cosplay Summit", "noun", "世界 Cosplay 峰會"],
  ["LARP", "noun", "真人角色扮演遊戲"],
  ["pathological gamer", "noun", "病態遊戲玩家"],
  ["on a par with", "adjective", "與...同等 / 與...不相上下"],
  ["cave in", "verb", "讓步 / 屈服"]
];

mt15ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT15 reviewed sense ${pos}:${meaning}`);
});

const mt63ReviewedExpectations = [
  ["linear TV", "noun", "線性電視 / 傳統電視"],
  ["wishful thinking", "noun", "一廂情願"],
  ["Sharp Peak", "noun", "蚺蛇尖"],
  ["Lok Wah South Estate", "noun", "樂華南邨"],
  ["snap-happy invader", "noun", "瘋狂拍照的闖入者"],
  ["film adaptation", "noun", "電影改編作品"],
  ["source material", "noun", "原著材料 / 原作"],
  ["left on the cutting-room floor", "adjective", "被剪掉的 / 被刪走的"]
];

mt63ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT63 reviewed sense ${pos}:${meaning}`);
});

const mt66ReviewedExpectations = [
  ["Qatar", "noun", "卡塔爾"],
  ["human rights record", "noun", "人權紀錄"],
  ["dirty money", "noun", "黑錢 / 來歷不明的錢"],
  ["migrant labourer", "noun", "外來勞工"],
  ["smoke-free generation", "noun", "無煙世代"],
  ["on the table", "adjective", "正在考慮中的"],
  ["goblin mode", "noun", "放縱懶散模式 / 不理社會期望的狀態"],
  ["rub one's achievements in someone's face", "verb", "炫耀成就 / 把成就曬給別人看"]
];

mt66ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT66 reviewed sense ${pos}:${meaning}`);
});

const mt30Paper2ReviewedExpectations = [
  ["quake-hit", "adjective", "受地震重創的"],
  ["life-changing", "adjective", "改變人生的"],
  ["Dragon Boat Racing", "noun", "龍舟競賽"],
  ["animal adoption", "noun", "領養動物"],
  ["overpopulation", "noun", "數量過多 / 過度繁殖"],
  ["lazy typing", "noun", "懶散打字 / 隨便打字"],
  ["team-building", "adjective", "團隊建立的"],
  ["treasure hunt", "noun", "尋寶遊戲"]
];

mt30Paper2ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT30 Paper 2 reviewed sense ${pos}:${meaning}`);
});

const mt30Paper3ReviewedExpectations = [
  ["annual leave", "noun", "年假 / 有薪年假"],
  ["well travelled", "adjective", "見多識廣的 / 去過很多地方的"],
  ["Poya", "noun", "斯里蘭卡滿月節"],
  ["sheer drop", "noun", "垂直落差 / 陡峭懸崖"],
  ["pre-opening sale", "noun", "開幕前特賣"],
  ["ball pit", "noun", "波波池"],
  ["juggle", "verb", "拋接雜耍"],
  ["wear charity like a mask", "verb", "以慈善作包裝 / 假裝有善心"],
  ["data file manipulation", "noun", "改寫資料檔案內容"],
  ["register", "noun", "語域 / 用語正式程度"]
];

mt30Paper3ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT30 Paper 3 reviewed sense ${pos}:${meaning}`);
});

const mt32Paper3ReviewedExpectations = [
  ["eco-fashion", "noun", "環保時裝 / 環保時尚"],
  ["focus group", "noun", "焦點小組"],
  ["faux leather", "noun", "人造皮革"],
  ["pop-up shop", "noun", "期間限定店 / 快閃店"],
  ["modern art installation", "noun", "現代藝術裝置"],
  ["cash in on", "verb", "從...獲利 / 趁機利用"],
  ["vegetation waste", "noun", "植物廢料"],
  ["go public", "verb", "上市 / 公開發行股票"],
  ["speak for itself", "verb", "不言而喻 / 本身已能說明一切"],
  ["fashion legend", "noun", "時裝界傳奇人物"]
];

mt32Paper3ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT32 Paper 3 reviewed sense ${pos}:${meaning}`);
});

const mt32Paper2ReviewedExpectations = [
  ["school assembly", "noun", "學校集會"],
  ["pet-friendly policy", "noun", "寵物友善政策"],
  ["light pollution", "noun", "光污染"],
  ["public nuisance", "noun", "公眾滋擾"],
  ["good manners", "noun", "良好禮貌 / 好禮儀"],
  ["video arcade", "noun", "電子遊戲機中心 / 遊戲機舖"],
  ["desensitize", "verb", "使麻木 / 使失去敏感度"],
  ["air on a channel", "verb", "在頻道播放"]
];

mt32Paper2ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT32 Paper 2 reviewed sense ${pos}:${meaning}`);
});

const mt35Paper2ReviewedExpectations = [
  ["Hong Kong Railway Museum", "noun", "香港鐵路博物館"],
  ["public sitting-out area", "noun", "公眾休憩處"],
  ["clinch a victory", "verb", "取得勝利"],
  ["confidence booster", "noun", "增強自信的事物"],
  ["creative outlet", "noun", "創意出口 / 表達創意的途徑"],
  ["life of crime", "noun", "犯罪生活"],
  ["all-expenses-paid", "adjective", "包全部費用的"],
  ["place of interest", "noun", "名勝 / 景點"]
];

mt35Paper2ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT35 Paper 2 reviewed sense ${pos}:${meaning}`);
});

const mt38Paper2ReviewedExpectations = [
  ["fibre optics", "noun", "光纖技術"],
  ["pave the way", "verb", "鋪路 / 為...創造條件"],
  ["fat shaming", "noun", "嘲笑肥胖 / 身材羞辱"],
  ["wrongful conviction", "noun", "錯誤定罪 / 冤案"],
  ["facial recognition software", "noun", "面部識別軟件"],
  ["the show must go on", "verb", "演出必須繼續 / 無論如何都要繼續"],
  ["spoken word poetry", "noun", "口語詩 / 朗誦詩"],
  ["word for word", "adverb", "逐字逐句地"]
];

mt38Paper2ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT38 Paper 2 reviewed sense ${pos}:${meaning}`);
});

const mt42Paper2ReviewedExpectations = [
  ["health and wellness", "noun", "身心健康"],
  ["mentoring programme", "noun", "師友計劃 / 輔導計劃"],
  ["student body", "noun", "全體學生"],
  ["search engine", "noun", "搜尋引擎"],
  ["movie extra", "noun", "電影臨時演員 / 群眾演員"],
  ["pick on", "verb", "欺負 / 針對"],
  ["Human Resources Department", "noun", "人力資源部"],
  ["satellite phone", "noun", "衛星電話"],
  ["make it out alive", "verb", "活著逃出 / 生還"]
];

mt42Paper2ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT42 Paper 2 reviewed sense ${pos}:${meaning}`);
});

const mt45Paper2ReviewedExpectations = [
  ["board game night", "noun", "桌上遊戲晚會"],
  ["Owners' Committee", "noun", "業主委員會"],
  ["peace of mind", "noun", "安心 / 心安"],
  ["running cost", "noun", "營運費 / 日常開支"],
  ["intranet", "noun", "內聯網"],
  ["at one's fingertips", "adverb", "近在手邊 / 隨手可得"],
  ["rave review", "noun", "高度好評 / 熱烈讚賞的評論"],
  ["dedicate a song", "verb", "點歌送給... / 獻歌"],
  ["spa treatment", "noun", "水療護理 / Spa 護理"],
  ["plant crops", "verb", "種植農作物"],
  ["shovel", "noun", "鏟 / 鐵鏟"]
];

mt45Paper2ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT45 Paper 2 reviewed sense ${pos}:${meaning}`);
});

["spa", "fingertip", "farewell", "disadvantaged"].forEach((word) => {
  assert.ok(
    senseBank.lookup(word, { includeHidden: true, limit: 20 }).some((entry) => entry.source === "mock-unseen-mt45-paper2-reviewed"),
    `${word} should be available as an MT45 phrase component`
  );
});

const mt49Paper2ReviewedExpectations = [
  ["deluxe suite", "noun", "豪華套房"],
  ["radio host", "noun", "電台主持"],
  ["remote learning", "noun", "遙距學習 / 網上學習"],
  ["hygiene practice", "noun", "衛生習慣 / 衛生做法"],
  ["feel left out", "verb", "感到被冷落 / 被排除在外"],
  ["game console", "noun", "遊戲機 / 遊戲主機"],
  ["student band", "noun", "學生樂隊"],
  ["awe-inspiring", "adjective", "令人敬畏的 / 令人驚嘆的"],
  ["First World War", "noun", "第一次世界大戰"],
  ["change the face of", "verb", "徹底改變...的面貌"]
];

mt49Paper2ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT49 Paper 2 reviewed sense ${pos}:${meaning}`);
});

["deluxe", "trivia", "console", "connectivity", "England"].forEach((word) => {
  assert.ok(
    senseBank.lookup(word, { includeHidden: true, limit: 20 }).some((entry) => entry.source === "mock-unseen-mt49-paper2-reviewed"),
    `${word} should be available as an MT49 phrase component`
  );
});

const mt56Paper2ReviewedExpectations = [
  ["teen magazine", "noun", "青少年雜誌"],
  ["historic landmark", "noun", "歷史地標"],
  ["sedan chair", "noun", "轎 / 轎子"],
  ["roll the dice", "verb", "擲骰子"],
  ["guest of honour", "noun", "主禮嘉賓 / 貴賓"],
  ["closing remarks", "noun", "閉幕致辭 / 總結發言"],
  ["women's rights", "noun", "女性權利 / 婦女權益"],
  ["traditional character", "noun", "繁體字"],
  ["make a mess of it", "verb", "搞砸 / 做得一塌糊塗"],
  ["award-winning", "adjective", "得獎的 / 獲獎的"]
];

mt56Paper2ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT56 Paper 2 reviewed sense ${pos}:${meaning}`);
});

["vermicelli", "tofu", "dice", "burpee", "GCSE", "Chinatown", "pronunciation", "subtitle"].forEach((word) => {
  assert.ok(
    senseBank.lookup(word, { includeHidden: true, limit: 20 }).some((entry) => entry.source === "mock-unseen-mt56-paper2-reviewed"),
    `${word} should be available as an MT56 Paper 2 phrase component`
  );
});

const mt59Paper2ReviewedExpectations = [
  ["immigration trend", "noun", "移民趨勢"],
  ["jot down", "verb", "匆匆記下 / 草草寫下"],
  ["chief librarian", "noun", "總圖書館館長 / 圖書館主管"],
  ["work out a schedule", "verb", "制定時間表 / 安排更表"],
  ["luxurious", "adjective", "豪華的 / 奢華的"],
  ["ensuite bathroom", "noun", "套房浴室 / 房內浴室"],
  ["billiard table", "noun", "桌球枱"],
  ["not one's cup of tea", "adjective", "不是某人喜歡的事物"],
  ["slack off", "verb", "偷懶 / 懈怠"],
  ["give it one's all", "verb", "全力以赴"]
];

mt59Paper2ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT59 Paper 2 reviewed sense ${pos}:${meaning}`);
});

["mahogany", "backyard", "preoccupied"].forEach((word) => {
  assert.ok(
    senseBank.lookup(word, { includeHidden: true, limit: 20 }).some((entry) => entry.source === "mock-unseen-mt59-paper2-reviewed"),
    `${word} should be available as an MT59 Paper 2 phrase component`
  );
});

const mt63Paper2ReviewedExpectations = [
  ["popular culture", "noun", "流行文化"],
  ["stay in the loop", "verb", "掌握最新消息 / 不脫節"],
  ["information overload", "noun", "資訊過量 / 資訊超載"],
  ["grounds", "noun", "理由 / 根據"],
  ["family business", "noun", "家族生意 / 家族企業"],
  ["choose one's own path", "verb", "選擇自己的道路"],
  ["green oasis", "noun", "綠洲 / 綠色休憩地"],
  ["set a dangerous precedent", "verb", "開危險先例"],
  ["reclaimed land", "noun", "填海土地"],
  ["future generation", "noun", "下一代 / 後代"]
];

mt63Paper2ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT63 Paper 2 reviewed sense ${pos}:${meaning}`);
});

["Kadoorie Farm", "local community", "over-stimulating", "resent"].forEach((word) => {
  assert.ok(
    senseBank.lookup(word, { includeHidden: true, limit: 20 }).some((entry) => entry.source === "mock-unseen-mt63-paper2-reviewed"),
    `${word} should be available as an MT63 Paper 2 phrase component`
  );
});

const mt66Paper2ReviewedExpectations = [
  ["internal combustion engine", "noun", "內燃機"],
  ["pet adoption day", "noun", "寵物領養日"],
  ["put something to good use", "verb", "善用某物"],
  ["mandatory work experience", "noun", "強制工作體驗"],
  ["professional environment", "noun", "專業工作環境"]
];

mt66Paper2ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT66 Paper 2 reviewed sense ${pos}:${meaning}`);
});

const mt12Paper2ReviewedExpectations = [
  ["comic fan", "noun", "漫畫迷"],
  ["digital publishing", "noun", "數碼出版"],
  ["hunched over", "adjective", "彎腰駝背的 / 俯身的"],
  ["in-app purchase", "noun", "應用程式內購買"],
  ["calm one's nerves", "verb", "安撫緊張情緒 / 使自己冷靜"]
];

mt12Paper2ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT12 Paper 2 reviewed sense ${pos}:${meaning}`);
});

const mt14Paper2ReviewedExpectations = [
  ["over-packaging", "noun", "過度包裝"],
  ["return to the workforce", "verb", "重返職場"],
  ["celebrity status", "noun", "名人地位"],
  ["flexitime", "noun", "彈性上班時間"],
  ["Cantonese opera", "noun", "粵劇"]
];

mt14Paper2ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT14 Paper 2 reviewed sense ${pos}:${meaning}`);
});

const mt28Paper2ReviewedExpectations = [
  ["study skills", "noun", "學習技巧"],
  ["go bankrupt", "verb", "破產"],
  ["provide company", "verb", "作伴 / 陪伴"],
  ["DAB radio", "noun", "數碼聲音廣播收音機"],
  ["overhead walkway", "noun", "行人天橋 / 高架行人道"]
];

mt28Paper2ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT28 Paper 2 reviewed sense ${pos}:${meaning}`);
});

const mt29Paper2ReviewedExpectations = [
  ["environmental charity", "noun", "環保慈善機構"],
  ["saved by the bell", "adjective", "在最後一刻被救了"],
  ["fend for itself", "verb", "自力更生 / 自行生存"],
  ["Generation Z", "noun", "Z 世代"],
  ["take offense at", "verb", "因...感到被冒犯 / 介意"]
];

mt29Paper2ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT29 Paper 2 reviewed sense ${pos}:${meaning}`);
});

const mt33Paper2ReviewedExpectations = [
  ["town planning", "noun", "城市規劃"],
  ["obtain sponsorship", "verb", "取得贊助"],
  ["building block", "noun", "基礎要素 / 組成部分"],
  ["social media account", "noun", "社交媒體帳戶"],
  ["tell on someone", "verb", "告發某人 / 打小報告"]
];

mt33Paper2ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT33 Paper 2 reviewed sense ${pos}:${meaning}`);
});

const mt34Paper2ReviewedExpectations = [
  ["bi-cable ropeway", "noun", "雙纜索道"],
  ["event management", "noun", "活動管理 / 活動統籌"],
  ["exam results by gender", "noun", "按性別劃分的考試成績"],
  ["coffee granules", "noun", "咖啡顆粒 / 即溶咖啡粒"],
  ["internship programme", "noun", "實習計劃"],
  ["paddock", "noun", "圍場 / 馬場小牧場"]
];

mt34Paper2ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT34 Paper 2 reviewed sense ${pos}:${meaning}`);
});

const mt36Paper2ReviewedExpectations = [
  ["Hong Kong Observatory", "noun", "香港天文台"],
  ["blatant theft", "noun", "明目張膽的偷竊"],
  ["give me your blessings", "verb", "祝福某人 / 支持某人的決定"],
  ["worthy cause", "noun", "有價值的事業 / 值得支持的目標"],
  ["winter blues", "noun", "冬日憂鬱 / 冬天心情低落"],
  ["claim treasure", "verb", "認領財物 / 認領寶物"]
];

mt36Paper2ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT36 Paper 2 reviewed sense ${pos}:${meaning}`);
});

const mt87ReviewedExpectations = [
  ["Korean Wave", "noun", "韓流"],
  ["push the envelope", "verb", "突破界限 / 挑戰極限"],
  ["venture capital", "noun", "風險投資"],
  ["buddy up", "verb", "結伴同行 / 找同伴"],
  ["trail runner's paradise", "noun", "越野跑者的天堂"],
  ["slow parenting", "noun", "慢養育 / 慢節奏育兒"],
  ["magic bullet", "noun", "萬靈丹 / 神奇解決方法"],
  ["dip one's toe in", "verb", "初步嘗試 / 小試牛刀"]
];

mt87ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT87 reviewed sense ${pos}:${meaning}`);
});

const mt16Paper3ReviewedExpectations = [
  ["book token", "noun", "書券"],
  ["market share", "noun", "市場佔有率"],
  ["rotisserie function", "noun", "旋轉烤焗功能"],
  ["doggy-friendly", "adjective", "歡迎狗隻的 / 狗狗友善的"],
  ["four-legged friend", "noun", "寵物狗 / 四腳朋友"],
  ["preservative-free", "adjective", "不含防腐劑的"],
  ["type 2 diabetes", "noun", "二型糖尿病"],
  ["reverse diabetes", "verb", "逆轉糖尿病"]
];

mt16Paper3ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT16 Paper 3 reviewed sense ${pos}:${meaning}`);
});

const mt18Paper3ReviewedExpectations = [
  ["fund-raising campaign", "noun", "籌款活動 / 籌款運動"],
  ["mascot", "noun", "吉祥物"],
  ["vet clinic", "noun", "獸醫診所"],
  ["loyalty scheme", "noun", "會員優惠計劃 / 顧客忠誠計劃"],
  ["veterinary science", "noun", "獸醫科學 / 獸醫學"],
  ["put on hold", "verb", "電話等候 / 被要求等候"],
  ["microchipping", "noun", "植入晶片 / 寵物晶片植入"],
  ["therapy animal", "noun", "治療動物"]
];

mt18Paper3ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT18 Paper 3 reviewed sense ${pos}:${meaning}`);
});

const mt15Paper3ReviewedExpectations = [
  ["pick your brains", "verb", "向某人請教 / 徵詢某人意見"],
  ["meet up in person", "verb", "見面 / 相約見面"],
  ["steal your identity", "verb", "盜用某人身份"],
  ["feel spied on", "verb", "感到被監視"],
  ["not in the same league as", "preposition", "不能與...相比 / 不及..."]
];

mt15Paper3ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT15 Paper 3 reviewed sense ${pos}:${meaning}`);
});

const mt85Paper3ReviewedExpectations = [
  ["cajon", "noun", "木箱鼓"],
  ["stick with it", "verb", "堅持下去 / 不放棄"],
  ["stick to a budget", "verb", "遵守預算 / 按預算花錢"],
  ["art jamming", "noun", "自由繪畫活動 / Art jam 活動"],
  ["chock-full", "adjective", "充滿的 / 滿載的"],
  ["by their lonesome", "adverb", "獨自一人 / 單獨地"],
  ["take us up on this offer", "verb", "接受某人的提議 / 接受邀請"]
];

mt85Paper3ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT85 Paper 3 reviewed sense ${pos}:${meaning}`);
});

const mt86Paper3ReviewedExpectations = [
  ["astrophotography", "noun", "天文攝影"],
  ["humanoid robots", "noun", "人形機械人 / 人形機器人"],
  ["technical jargon", "noun", "專業術語 / 技術行話"],
  ["Turing Test", "noun", "圖靈測試"],
  ["ultrasonic sensor", "noun", "超聲波感應器"],
  ["molecular gastronomy", "noun", "分子料理 / 分子美食學"],
  ["in furtherance of", "preposition", "為促進 / 為推動"],
  ["velociraptor", "noun", "迅猛龍"]
];

mt86Paper3ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT86 Paper 3 reviewed sense ${pos}:${meaning}`);
});

const mt62Paper3ReviewedExpectations = [
  ["letterpress printing", "noun", "活版印刷"],
  ["operate out of", "verb", "以...為基地營運"],
  ["source", "verb", "採購 / 尋找來源"],
  ["fermentation", "noun", "發酵"],
  ["put on a brave face", "verb", "強顏歡笑 / 故作堅強"],
  ["final nail in the coffin", "noun", "致命一擊 / 最後一根稻草"],
  ["carcinogens", "noun", "致癌物"],
  ["cut corners", "verb", "偷工減料 / 走捷徑"],
  ["retraction", "noun", "撤回聲明 / 更正啟事"]
];

mt62Paper3ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT62 Paper 3 reviewed sense ${pos}:${meaning}`);
});

const mt64Paper3ReviewedExpectations = [
  ["dance crew", "noun", "舞蹈隊 / 舞團"],
  ["routine", "noun", "舞蹈套路 / 表演編排"],
  ["choreography", "noun", "編舞 / 舞步編排"],
  ["battle it out", "verb", "一決高下 / 分出勝負"],
  ["breakdancing", "noun", "霹靂舞"],
  ["freezes", "noun", "定格動作"],
  ["afforded", "verb", "提供 / 給予"],
  ["biodegrade", "verb", "生物分解"],
  ["isolate", "verb", "分離 / 提取"],
  ["two sides of the same coin", "noun", "同一件事的兩面 / 關係密切的兩方面"]
];

mt64Paper3ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT64 Paper 3 reviewed sense ${pos}:${meaning}`);
});

const mt67Paper3ReviewedExpectations = [
  ["WWOOFers", "noun", "參加 WWOOF 有機農場換宿的人"],
  ["control pests", "verb", "控制害蟲 / 防治蟲害"],
  ["local produce", "noun", "本地農產品"],
  ["a cappella", "noun", "無伴奏合唱 / 阿卡貝拉"],
  ["vocal range", "noun", "音域"],
  ["stay in pitch", "verb", "保持音準"],
  ["barbershop quartets", "noun", "四人無伴奏合唱組"],
  ["go down a rabbit hole", "verb", "越查越深入 / 陷入某個興趣坑"],
  ["won me over", "verb", "打動某人 / 令某人信服"],
  ["at the drop of a hat", "adverb", "立即 / 毫不猶豫地"]
];

mt67Paper3ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT67 Paper 3 reviewed sense ${pos}:${meaning}`);
});

const mt69Paper3ReviewedExpectations = [
  ["radio station giveaway", "noun", "電台送禮 / 電台派票活動"],
  ["woodwind instruments", "noun", "木管樂器"],
  ["reach out to", "verb", "聯絡 / 主動接觸"],
  ["Cook Islands", "noun", "庫克群島"],
  ["overwater bungalows", "noun", "水上小屋 / 水上別墅"],
  ["put me at ease", "verb", "使某人放鬆 / 安心"],
  ["underwhelmed", "adjective", "感到失望的 / 不覺得驚喜的"],
  ["health declaration form", "noun", "健康申報表"],
  ["sea-level rise", "noun", "海平面上升"],
  ["take a heavy toll on", "verb", "對...造成嚴重損害 / 沉重打擊"],
  ["surged", "verb", "急升 / 激增"]
];

mt69Paper3ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT69 Paper 3 reviewed sense ${pos}:${meaning}`);
});

const mt71Paper3ReviewedExpectations = [
  ["community orchards", "noun", "社區果園"],
  ["trunk flare", "noun", "樹幹根部外擴位置"],
  ["food desert", "noun", "食物荒漠 / 難以買到新鮮食物的地區"],
  ["take to heart", "verb", "銘記在心 / 認真看待"],
  ["pickleball paddle", "noun", "匹克球球拍"],
  ["sweeping the globe", "verb", "風靡全球 / 席捲世界"],
  ["catch the bug", "verb", "開始迷上 / 染上興趣"],
  ["aquatic lifts", "noun", "泳池升降椅 / 入水輔助升降機"],
  ["thriving social life", "noun", "豐富活躍的社交生活"],
  ["annual salary", "noun", "年薪"]
];

mt71Paper3ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT71 Paper 3 reviewed sense ${pos}:${meaning}`);
});

const mt55Paper3ReviewedExpectations = [
  ["recipe for disaster", "noun", "災難的導火線 / 必定出事的情況"],
  ["touch upon", "verb", "簡略談及 / 提到"],
  ["screen acting", "noun", "影視表演 / 鏡頭表演"],
  ["turn the first sod", "verb", "動土 / 鏟起第一鏟泥"]
];

mt55Paper3ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT55 Paper 3 reviewed sense ${pos}:${meaning}`);
});

const mt60Paper3ReviewedExpectations = [
  ["coaches", "noun", "旅遊巴 / 長途巴"],
  ["street art", "noun", "街頭藝術"],
  ["curator", "noun", "博物館館長 / 策展人"],
  ["record contract", "noun", "唱片合約"],
  ["ratings", "noun", "收視率"],
  ["resting on their laurels", "verb", "滿足於既有成就 / 固步自封"],
  ["grounds for disqualification", "noun", "取消資格的理由"],
  ["ripped off", "verb", "抄襲 / 剽竊"],
  ["take the matter to court", "verb", "將事件告上法庭"]
];

mt60Paper3ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT60 Paper 3 reviewed sense ${pos}:${meaning}`);
});

const mt37Paper3ReviewedExpectations = [
  ["biospheres", "noun", "生物圈 / 生態圈"],
  ["pH", "noun", "酸鹼值"],
  ["off the beaten track", "adjective", "人跡罕至的 / 非熱門路線的"],
  ["Hong Kong Geopark", "noun", "香港地質公園"],
  ["stone wall trees", "noun", "石牆樹"],
  ["banyan tree", "noun", "榕樹"],
  ["keep your distance", "verb", "保持距離"],
  ["code of conduct", "noun", "行為守則"]
];

mt37Paper3ReviewedExpectations.forEach(([word, pos, meaning]) => {
  const entry = senseBank.lookup(word, { includeHidden: true, limit: 20 }).find((candidate) => (
    candidate.pos === pos && candidate.meaning === meaning
  ));
  assert.ok(entry, `${word} should include MT37 Paper 3 reviewed sense ${pos}:${meaning}`);
});

console.log("vocab_sense_bank tests passed");
