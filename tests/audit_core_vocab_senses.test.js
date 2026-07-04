const assert = require("assert");

const audit = require("../scripts/audit-core-vocab-senses.js");
const teacherVocab = require("../teacher_vocab.js");
const vocabLookup = require("../vocab_lookup.js");

(async function run() {
  assert.deepStrictEqual(
    audit.getMeaningPartOverlap("幼獸", "幼獸 / 幼仔"),
    { isNearDuplicate: true, reason: "subset meaning parts" }
  );

  assert.deepStrictEqual(
    audit.getMeaningPartOverlap("傳播 / 傳送", "傳送 / 傳播"),
    { isNearDuplicate: true, reason: "same meaning parts" }
  );

  assert.deepStrictEqual(
    audit.getMeaningPartOverlap("病房 / 選區", "風格 / 方式"),
    { isNearDuplicate: false, reason: "" }
  );

  const metadata = audit.auditApprovedBankMetadata([
    {
      word: "classroom",
      display: "classroom",
      pos: "noun",
      type: "word",
      meaning: "課室 / 教室",
      level: "A1",
      source: "curated-sense-bank"
    },
    {
      word: "classroom",
      display: "classroom",
      pos: "noun",
      type: "word",
      meaning: "課室",
      level: "A1",
      source: "curated-sense-bank"
    }
  ], "curated-sense-bank");

  assert.strictEqual(metadata.issueCount, 1);
  assert.deepStrictEqual(metadata.nearDuplicateMeanings, [
    "classroom :: noun :: 課室 / 教室 :: 課室 :: subset meaning parts"
  ]);

  const invalidPosMetadata = audit.auditApprovedBankMetadata([
    {
      word: "hawker",
      display: "hawker",
      pos: "字",
      type: "word",
      meaning: "小販",
      level: "A2",
      source: "curated-sense-bank"
    },
    {
      word: "look up",
      display: "look up",
      pos: "verb",
      type: "phrasal-verb",
      meaning: "查閱",
      level: "A2",
      source: "curated-sense-bank"
    }
  ], "curated-sense-bank");
  assert.ok(invalidPosMetadata.invalidPos.some((issue) => issue.includes("hawker")));
  assert.ok(invalidPosMetadata.invalidType.some((issue) => issue.includes("look up")));

  const teacherStudentReadyMetadata = audit.auditStudentReadyLookupMetadata();
  assert.ok(
    teacherStudentReadyMetadata.checkedEntryCount > 4000,
    `Expected full teacher student-ready audit to check thousands of entries, got ${teacherStudentReadyMetadata.checkedEntryCount}`
  );
  assert.strictEqual(teacherStudentReadyMetadata.issueCount, 0);
  assert.deepStrictEqual(teacherStudentReadyMetadata.duplicateExact, []);

  const duplicateLabelAudit = audit.auditTeacherVisibleLabelDuplicateMetadata(["account for"], {
    entries: [{ word: "account for" }],
    normalizeWord: teacherVocab.normalizeWord,
    lookup: () => [
      { word: "account for", pos: "", inferredPos: "verb", type: "phrase", meaning: "佔" },
      { word: "account for", pos: "verb", type: "phrase", meaning: "佔" }
    ],
    getEntryLabel: teacherVocab.getEntryLabel
  });
  assert.strictEqual(duplicateLabelAudit.issueCount, 1);
  assert.deepStrictEqual(duplicateLabelAudit.duplicateLabels, ["account for :: v. 佔 :: 2"]);

  const trueMultiPosAudit = audit.auditTeacherVisibleLabelDuplicateMetadata(["rest"], {
    entries: [{ word: "rest" }],
    normalizeWord: teacherVocab.normalizeWord,
    lookup: () => [
      { word: "rest", pos: "noun", type: "word", meaning: "休息" },
      { word: "rest", pos: "verb", type: "word", meaning: "休息" }
    ],
    getEntryLabel: teacherVocab.getEntryLabel
  });
  assert.strictEqual(trueMultiPosAudit.issueCount, 0);

  const currentDuplicateLabelAudit = audit.auditTeacherVisibleLabelDuplicateMetadata();
  assert.ok(currentDuplicateLabelAudit.checkedWordCount > 4000);
  assert.strictEqual(currentDuplicateLabelAudit.issueCount, 0);

  const displayMismatch = audit.auditExpectedDisplays(
    [["china", "China"]],
    [{
      word: "china",
      display: "china",
      pos: "noun",
      type: "word",
      meaning: "中國",
      level: "A1",
      source: "curated-sense-bank"
    }]
  );
  assert.strictEqual(displayMismatch.issueCount, 1);
  assert.deepStrictEqual(displayMismatch.mismatched, ["china :: expected China :: got china"]);

  const currentDisplayAudit = audit.auditExpectedDisplays();
  assert.ok(currentDisplayAudit.checkedWordCount >= 20);
  assert.strictEqual(currentDisplayAudit.issueCount, 0);

  assert.strictEqual(audit.isLikelyTeacherExtractionJunk({
    word: "i a b t",
    display: "i a b t",
    meaning: "為了",
    type: "phrase"
  }), true);
  assert.strictEqual(audit.isLikelyTeacherExtractionJunk({
    word: "fumble",
    display: "fumble",
    meaning: "笨拙地摸索 / 失手處理",
    type: "word"
  }), false);

  const teacherGapFixture = audit.auditTeacherExtractionJunkGaps([
    { word: "i a b t", display: "i a b t", meaning: "為了", type: "phrase" },
    { word: "missing clean word", display: "missing clean word", meaning: "乾淨候選字", type: "phrase" },
    { word: "covered alias", display: "covered alias", meaning: "已覆蓋", type: "word" }
  ], [
    { word: "canonical covered", aliases: ["covered alias"] }
  ]);
  assert.strictEqual(teacherGapFixture.issueCount, 1);
  assert.deepStrictEqual(teacherGapFixture.actionable.map((entry) => entry.word), ["missing clean word"]);
  assert.deepStrictEqual(teacherGapFixture.suppressedJunk.map((entry) => entry.word), ["i a b t"]);

  const currentTeacherGapAudit = audit.auditTeacherExtractionJunkGaps();
  assert.strictEqual(currentTeacherGapAudit.issueCount, 0);
  assert.strictEqual(currentTeacherGapAudit.actionableCount, 0);
  assert.ok(currentTeacherGapAudit.suppressedJunkCount >= 1);

  assert.strictEqual(
    audit.normalizeOxfordLookupWord({ word: "bank", display: "bank (money)" }),
    "bank"
  );
  assert.deepStrictEqual(
    audit.getOxfordLookupWords({ word: "a, an", display: "a, an" }),
    ["a", "an"]
  );
  assert.strictEqual(
    audit.normalizeOxfordLookupWord({ word: "last1", display: "last1 (final)" }),
    "last"
  );
  assert.strictEqual(
    audit.normalizeOxfordLookupWord({ word: "nction", display: "nction" }),
    ""
  );

  const oxfordCoverageAudit = await audit.auditOxfordLookupCoverage([
    { word: "bank", display: "bank (money)", level: "A1", pos: ["noun"] },
    { word: "last1", display: "last1 (final)", level: "A1", pos: ["determiner"] },
    { word: "nction", display: "nction", level: "C1", pos: ["noun"] }
  ]);
  assert.strictEqual(oxfordCoverageAudit.checkedEntryCount, 3);
  assert.strictEqual(oxfordCoverageAudit.checkedWordCount, 2);
  assert.strictEqual(oxfordCoverageAudit.skippedJunkCount, 1);
  assert.strictEqual(oxfordCoverageAudit.issueCount, 0);

  const missingOxfordPosAudit = await audit.auditOxfordLookupCoverage(
    [{ word: "match", display: "match (contest/correspond)", level: "A1", pos: ["noun", "verb"] }],
    audit.getStudentLookupProviders({
      getCuratedMatches: () => [{
        word: "match",
        display: "match",
        pos: "noun",
        type: "word",
        meaning: "比賽",
        level: "A1",
        source: "curated-sense-bank"
      }],
      getTeacherMatches: () => []
    })
  );
  assert.strictEqual(missingOxfordPosAudit.issueCount, 0);
  assert.strictEqual(missingOxfordPosAudit.posGapCount, 1);
  assert.deepStrictEqual(missingOxfordPosAudit.missingPos[0].expectedPos, ["verb"]);

  const studentLookupAudit = await audit.auditStudentLookupMetadata();
  const uniqueAuditWords = new Set(audit.STUDENT_LOOKUP_AUDIT_WORDS.map((word) => {
    const raw = String(word || "").trim();
    return `${raw}::${teacherVocab.normalizeWord(raw)}`;
  }));
  assert.strictEqual(studentLookupAudit.checkedWordCount, uniqueAuditWords.size);
  assert.ok(studentLookupAudit.checkedEntryCount > 20);
  assert.strictEqual(studentLookupAudit.issueCount, 0);

  const duplicateInputAudit = await audit.auditStudentLookupMetadata(["sold", "sold"], audit.getStudentLookupProviders());
  assert.strictEqual(duplicateInputAudit.checkedWordCount, 1);
  assert.strictEqual(duplicateInputAudit.issueCount, 0);

  const fullStudentLookupAudit = await audit.auditStudentLookupMetadata(audit.getApprovedLookupAuditWords());
  assert.ok(fullStudentLookupAudit.checkedWordCount > 8000);
  assert.ok(fullStudentLookupAudit.checkedEntryCount > 10000);
  assert.strictEqual(fullStudentLookupAudit.issueCount, 0);

  assert.deepStrictEqual(
    vocabLookup.dedupeVisibleLabels([
      {
        word: "amid",
        display: "amid",
        pos: "preposition",
        type: "word",
        meaning: "在...當中",
        level: "B2",
        source: "curated-sense-bank"
      }
    ], {
      getEntryPos: (entry) => teacherVocab.normalizePos(entry.pos || entry.inferredPos),
      normalizeMeaningGroupKey: audit.normalizeMeaningGroupKey
    }).map((entry) => entry.display),
    ["amid"]
  );

  const duplicateStudentLabelAudit = await audit.auditStudentVisibleLabelDuplicateMetadata(["amid"], audit.getStudentLookupProviders({
    getCuratedMatches: () => [
      {
        word: "amid",
        display: "amid",
        pos: "preposition",
        type: "word",
        meaning: "在...當中",
        level: "B2",
        source: "curated-sense-bank"
      },
      {
        word: "amidst",
        display: "amidst",
        pos: "preposition",
        type: "word",
        meaning: "在...當中",
        level: "B2",
        source: "curated-sense-bank"
      }
    ],
    getTeacherMatches: () => []
  }));
  assert.strictEqual(duplicateStudentLabelAudit.issueCount, 0);

  const currentStudentLabelAudit = await audit.auditStudentVisibleLabelDuplicateMetadata();
  assert.ok(currentStudentLabelAudit.checkedWordCount > 8000);
  assert.strictEqual(currentStudentLabelAudit.issueCount, 0);

  const nearDuplicateStudentAudit = await audit.auditStudentNearDuplicateMeaningMetadata(["advance"], audit.getStudentLookupProviders({
    getCuratedMatches: () => [
      {
        word: "advance",
        display: "advance",
        pos: "noun",
        type: "word",
        meaning: "進步",
        level: "B1",
        source: "curated-sense-bank"
      },
      {
        word: "advance",
        display: "advance",
        pos: "noun",
        type: "word",
        meaning: "進展 / 進步",
        level: "B1",
        source: "curated-sense-bank"
      }
    ],
    getTeacherMatches: () => []
  }));
  assert.strictEqual(nearDuplicateStudentAudit.issueCount, 0);

  const currentNearDuplicateStudentAudit = await audit.auditStudentNearDuplicateMeaningMetadata();
  assert.ok(currentNearDuplicateStudentAudit.checkedWordCount > 8000);
  assert.strictEqual(currentNearDuplicateStudentAudit.issueCount, 0);

  const roughPosFixtureAudit = await audit.auditVisibleLookupRoughPosMetadata(["rough phrase"], audit.getStudentLookupProviders({
    getCuratedMatches: () => [],
    getTeacherMatches: () => [{
      word: "rough phrase",
      display: "rough phrase",
      pos: "phrase",
      type: "phrase",
      meaning: "粗略片語",
      level: "B1",
      source: "teacher"
    }]
  }));
  assert.strictEqual(roughPosFixtureAudit.issueCount, 1);
  assert.ok(roughPosFixtureAudit.issues[0].includes("rough phrase"));

  const roughPosAudit = await audit.auditVisibleLookupRoughPosMetadata();
  assert.ok(roughPosAudit.checkedWordCount > 4000);
  assert.strictEqual(roughPosAudit.issueCount, 0);

  const missingVerbTableAudit = audit.auditVerbTableFormCoverage(
    [["測試", "test", "tested", "tested"]],
    { lookup: () => [] }
  );
  assert.strictEqual(missingVerbTableAudit.checkedFormCount, 2);
  assert.strictEqual(missingVerbTableAudit.issueCount, 2);
  assert.deepStrictEqual(missingVerbTableAudit.missing.map((item) => item.kind), ["past", "pp"]);

  const currentVerbTableAudit = audit.auditVerbTableFormCoverage();
  assert.ok(currentVerbTableAudit.checkedFormCount > 100);
  assert.strictEqual(currentVerbTableAudit.issueCount, 0);

  const expectedLookupAudit = await audit.auditExpectedStudentLookupMeanings();
  assert.ok(expectedLookupAudit.checkedCaseCount >= audit.EXPECTED_STUDENT_LOOKUP_CASES.length);
  assert.ok(expectedLookupAudit.checkedWordCount >= 10);
  assert.strictEqual(expectedLookupAudit.issueCount, 0);

  const unexpectedLookupAudit = await audit.auditUnexpectedStudentLookupMeanings();
  assert.ok(unexpectedLookupAudit.checkedCaseCount >= audit.UNEXPECTED_STUDENT_LOOKUP_CASES.length);
  assert.ok(unexpectedLookupAudit.checkedWordCount >= 5);
  assert.strictEqual(unexpectedLookupAudit.issueCount, 0);

  const savedVocabAudit = audit.auditSavedVocabItemSafety();
  assert.strictEqual(savedVocabAudit.checkedCaseCount, 267);
  assert.strictEqual(savedVocabAudit.issueCount, 0);

  const missingExpectedAudit = await audit.auditExpectedStudentLookupMeanings(
    [{ word: "pretty", pos: "adjective", meaning: "漂亮的" }],
    audit.getStudentLookupProviders({
      getCuratedMatches: () => [],
      getTeacherMatches: () => []
    })
  );
  assert.strictEqual(missingExpectedAudit.issueCount, 1);
  assert.strictEqual(missingExpectedAudit.missing[0].word, "pretty");

  const badProviders = audit.getStudentLookupProviders({
    getLiveTeacherMatches: () => [{
      word: "bad",
      display: "bad",
      pos: "",
      type: "word",
      meaning: "待老師確認",
      level: "",
      source: "offline-dictionary"
    }]
  });
  const badLookupAudit = await audit.auditStudentLookupMetadata(["bad"], badProviders);
  assert.ok(badLookupAudit.issues.some((issue) => issue.includes("unapproved-source=offline-dictionary")));
  assert.ok(badLookupAudit.issues.some((issue) => issue.includes("placeholder")));
  assert.ok(badLookupAudit.issues.some((issue) => issue.includes("invalid-level=")));
  assert.ok(badLookupAudit.issues.some((issue) => issue.includes("missing-pos")));

  const invalidLookupAudit = await audit.auditStudentLookupMetadata(["bad"], audit.getStudentLookupProviders({
    getLiveTeacherMatches: () => [{
      word: "bad",
      display: "bad",
      pos: "字",
      type: "phrasal-verb",
      meaning: "壞的",
      level: "A1",
      source: "teacher-live"
    }]
  }));
  assert.ok(invalidLookupAudit.issues.some((issue) => issue.includes("invalid-type=phrasal-verb")));
  assert.ok(invalidLookupAudit.issues.some((issue) => issue.includes("missing-pos")));

  const fullAudit = await audit.auditCoreVocabSenses();
  assert.strictEqual(fullAudit.studentLookupMetadata.issueCount, 0);
  assert.strictEqual(fullAudit.studentLookupFullMetadata.issueCount, 0);
  assert.strictEqual(fullAudit.teacherVisibleLabelDuplicateMetadata.issueCount, 0);
  assert.strictEqual(fullAudit.studentVisibleLabelDuplicateMetadata.issueCount, 0);
  assert.strictEqual(fullAudit.studentNearDuplicateMeaningMetadata.issueCount, 0);
  assert.strictEqual(fullAudit.visibleLookupRoughPosMetadata.issueCount, 0);
  assert.strictEqual(fullAudit.expectedStudentLookupMetadata.issueCount, 0);
  assert.strictEqual(fullAudit.unexpectedStudentLookupMetadata.issueCount, 0);
  assert.strictEqual(fullAudit.savedVocabItemMetadata.issueCount, 0);

  console.log("audit_core_vocab_senses tests passed");
}()).catch((error) => {
  console.error(error);
  process.exit(1);
});
