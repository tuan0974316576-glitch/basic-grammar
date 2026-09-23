const AVATAR_STYLE = "dicebear-critters-v10";
const AVATAR_BACKGROUNDS = new Set([
  "ffd5dc",
  "ffe8a3",
  "bcebd7",
  "bfe3ff",
  "d9ccff",
  "ffd4ad",
]);

const AVATAR_OPTION_VALUES = Object.freeze({
  top: new Set([
    "none", "horns", "hornsIn", "hornsSmall", "spike", "antenna",
    "antennae", "earsRound", "earsPointy", "earsDroop", "spikes", "fin",
    "crown", "sprout", "nub", "bobble"
  ]),
  body: new Set([
    "dome", "block", "tower", "chimney", "squat", "blob", "round",
    "tilt", "lean", "peak", "bell", "wedge", "wedgeInv", "steps"
  ]),
  pattern: new Set([
    "none", "belly", "dots", "speckles", "bar", "bars", "spot", "stripes",
    "dotRow", "chevron", "ring"
  ]),
  cheeks: new Set(["none", "blush", "blushBig", "freckles"]),
  eyes: new Set([
    "round", "dots", "bigPupils", "sideeye", "inward", "mono", "uneven",
    "trio", "threeRow", "four", "happy", "closedLine", "wink", "squint",
    "wide", "sleepy", "angry", "monoSleepy", "close"
  ]),
  mouth: new Set([
    "smile", "tinySmile", "grin", "laugh", "teeth", "ooh", "line", "smirk",
    "wavy", "catMouth", "zigzag", "frown", "sad", "slant", "dot", "open",
    "tooth", "tongue", "blep"
  ]),
  bodyColor: /^[0-9a-f]{6}$/i,
  accentColor: /^[0-9a-f]{6}$/i,
  inkColor: /^[0-9a-f]{6}$/i,
});

function normalizeDisplayName(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function normalizeAvatarSeed(value) {
  return String(value || "").trim();
}

function normalizeAvatarBackground(value) {
  return String(value || "").trim().toLowerCase().replace(/^#/, "");
}

function normalizeAvatarOptions(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const normalized = {};
  for (const [key, raw] of Object.entries(value)) {
    if (!Object.prototype.hasOwnProperty.call(AVATAR_OPTION_VALUES, key)) continue;
    const option = String(raw || "").trim();
    const allowed = AVATAR_OPTION_VALUES[key];
    if (allowed instanceof Set ? allowed.has(option) : allowed.test(option)) {
      normalized[key] = option;
    }
  }
  return normalized;
}

function isValidAvatarOptions(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  if (keys.length > 12) return false;
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(AVATAR_OPTION_VALUES, key)) return false;
    const option = String(value[key] || "").trim();
    const allowed = AVATAR_OPTION_VALUES[key];
    if (!(allowed instanceof Set ? allowed.has(option) : allowed.test(option))) return false;
  }
  return true;
}

function validateStudentProfileInput(input = {}) {
  const displayName = normalizeDisplayName(input.displayName);
  const avatarStyle = String(input.avatarStyle || "").trim();
  const avatarSeed = normalizeAvatarSeed(input.avatarSeed);
  const avatarBackground = normalizeAvatarBackground(input.avatarBackground);
  const avatarOptions = normalizeAvatarOptions(input.avatarOptions);
  const nameLength = Array.from(displayName).length;
  if (nameLength < 2 || nameLength > 20 ||
      !/^[\p{L}\p{N}][\p{L}\p{N} .'-]*$/u.test(displayName)) {
    return { valid: false, reason: "invalid-display-name" };
  }
  if (avatarStyle !== AVATAR_STYLE) {
    return { valid: false, reason: "invalid-avatar-style" };
  }
  if (!/^[A-Za-z0-9_-]{4,64}$/.test(avatarSeed)) {
    return { valid: false, reason: "invalid-avatar-seed" };
  }
  if (!AVATAR_BACKGROUNDS.has(avatarBackground)) {
    return { valid: false, reason: "invalid-avatar-background" };
  }
  if (input.avatarOptions !== undefined && !isValidAvatarOptions(input.avatarOptions)) {
    return { valid: false, reason: "invalid-avatar-options" };
  }
  return {
    valid: true,
    profile: {
      displayName,
      avatarStyle,
      avatarSeed,
      avatarBackground,
      avatarOptions,
      profileSetupComplete: true,
    },
  };
}

function resolveStudentIdentity(account = {}, user = {}, studentId = "", role = "student") {
  const profileSetupComplete = role === "teacher" || user.profileSetupComplete === true;
  return {
    displayName: profileSetupComplete
      ? normalizeDisplayName(user.displayName || account.displayName || studentId)
      : normalizeDisplayName(account.displayName || studentId),
    avatarStyle: profileSetupComplete ? String(user.avatarStyle || "") : "",
    avatarSeed: profileSetupComplete ? normalizeAvatarSeed(user.avatarSeed) : "",
    avatarBackground: profileSetupComplete
      ? normalizeAvatarBackground(user.avatarBackground)
      : "",
    avatarOptions: profileSetupComplete
      ? normalizeAvatarOptions(user.avatarOptions)
      : {},
    profileSetupComplete,
  };
}

module.exports = {
  AVATAR_BACKGROUNDS,
  AVATAR_OPTION_VALUES,
  AVATAR_STYLE,
  isValidAvatarOptions,
  normalizeAvatarOptions,
  normalizeAvatarBackground,
  normalizeAvatarSeed,
  normalizeDisplayName,
  resolveStudentIdentity,
  validateStudentProfileInput,
};
