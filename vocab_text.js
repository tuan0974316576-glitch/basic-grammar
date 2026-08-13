(function attachVocabText(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.VocabText = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function createVocabText() {
  "use strict";

  function canonicalizeHeadword(value) {
    return String(value || "")
      .trim()
      .replace(/[’‘]/g, "'")
      .replace(/[“”]/g, "\"")
      .replace(/[‐‑‒–—―]/g, "-")
      .replace(/\bM\s*\+\s*Museum\b/gi, "M Plus Museum")
      .replace(/\+/g, " ")
      .replace(/\bV-ing\b/gi, "ving")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeHeadword(value) {
    return canonicalizeHeadword(value).toLowerCase();
  }

  return {
    canonicalizeHeadword,
    normalizeHeadword
  };
});
