const assert = require("assert");
const {
  AVATAR_STYLE,
  resolveStudentIdentity,
  validateStudentProfileInput,
} = require("./student-profile");

const clean = validateStudentProfileInput({
  displayName: "  Austin  Sir ",
  avatarStyle: AVATAR_STYLE,
  avatarSeed: "critter-abc_123",
  avatarBackground: "#BCEBD7",
  avatarOptions: {
    top: "horns",
    body: "round",
    eyes: "wide",
    mouth: "grin",
    bodyColor: "2f80ed",
  },
});
assert.strictEqual(clean.valid, true);
assert.deepStrictEqual(clean.profile, {
  displayName: "Austin Sir",
  avatarStyle: AVATAR_STYLE,
  avatarSeed: "critter-abc_123",
  avatarBackground: "bcebd7",
  avatarOptions: {
    top: "horns",
    body: "round",
    eyes: "wide",
    mouth: "grin",
    bodyColor: "2f80ed",
  },
  profileSetupComplete: true,
});

assert.strictEqual(validateStudentProfileInput({
  displayName: "A",
  avatarStyle: AVATAR_STYLE,
  avatarSeed: "critter-1234",
  avatarBackground: "ffd5dc",
}).reason, "invalid-display-name");
assert.strictEqual(validateStudentProfileInput({
  displayName: "Bad<script>",
  avatarStyle: AVATAR_STYLE,
  avatarSeed: "critter-1234",
  avatarBackground: "ffd5dc",
}).valid, false);
assert.strictEqual(validateStudentProfileInput({
  displayName: "小明",
  avatarStyle: AVATAR_STYLE,
  avatarSeed: "../../avatar",
  avatarBackground: "ffd5dc",
}).reason, "invalid-avatar-seed");

assert.deepStrictEqual(
  resolveStudentIdentity(
    { displayName: "Teacher Default" },
    {
      displayName: "Momo",
      avatarStyle: AVATAR_STYLE,
      avatarSeed: "critter-momo",
      avatarBackground: "ffe8a3",
      avatarOptions: { top: "earsRound", body: "blob" },
      profileSetupComplete: true,
    },
    "S001",
    "student",
  ),
  {
    displayName: "Momo",
    avatarStyle: AVATAR_STYLE,
    avatarSeed: "critter-momo",
    avatarBackground: "ffe8a3",
    avatarOptions: { top: "earsRound", body: "blob" },
    profileSetupComplete: true,
  },
);
assert.strictEqual(
  resolveStudentIdentity({ displayName: "New Student" }, {}, "S002").profileSetupComplete,
  false,
);

console.log("Student profile checks passed.");
