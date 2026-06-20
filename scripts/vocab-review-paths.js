"use strict";

const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_DIR = path.join(ROOT_DIR, "private_exports");

function stripReviewExtension(filePath = "") {
  return path.basename(filePath).replace(/\.(?:xlsx|csv|json)$/i, "");
}

function inferOutputDir(filePath = "") {
  const dir = path.dirname(path.resolve(filePath || DEFAULT_DIR));
  return dir || DEFAULT_DIR;
}

function inferPromotePlanName(baseName = "") {
  if (/^teacher_vocab_review_batch_highvalue_/i.test(baseName)) {
    return baseName.replace(/^teacher_vocab_review_batch_highvalue_/i, "teacher_vocab_promote_plan_highvalue_");
  }
  if (/^oxford_vocab_review_batch_/i.test(baseName)) {
    return baseName.replace(/^oxford_vocab_review_batch_/i, "oxford_vocab_promote_plan_");
  }
  if (/^supplement_vocab_review_batch_/i.test(baseName)) {
    return baseName.replace(/^supplement_vocab_review_batch_/i, "supplement_vocab_promote_plan_");
  }
  if (/vocab_review_batch/i.test(baseName)) {
    return baseName.replace(/vocab_review_batch/i, "vocab_promote_plan");
  }
  if (/review_batch/i.test(baseName)) {
    return baseName.replace(/review_batch/i, "promote_plan");
  }
  return `${baseName}_promote_plan`;
}

function inferPromotePlanPath(input = "") {
  return path.join(inferOutputDir(input), `${inferPromotePlanName(stripReviewExtension(input))}.json`);
}

function inferPreflightPath(input = "") {
  return path.join(inferOutputDir(input), `${stripReviewExtension(input)}_preflight.json`);
}

module.exports = {
  DEFAULT_DIR,
  inferOutputDir,
  inferPreflightPath,
  inferPromotePlanName,
  inferPromotePlanPath,
  stripReviewExtension
};
