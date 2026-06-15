const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();
const sourcePath = process.argv[2] || path.join(__dirname, "students.sample.json");
const BATCH_LIMIT = 450;

function hashPin(pin, salt) {
  return crypto
    .pbkdf2Sync(String(pin), String(salt), 120000, 32, "sha256")
    .toString("hex");
}

async function seedStudents() {
  const raw = fs.readFileSync(sourcePath, "utf8");
  const students = JSON.parse(raw);

  if (!Array.isArray(students)) {
    throw new Error("Student file must be a JSON array.");
  }

  let batch = db.batch();
  let operationsInBatch = 0;
  let written = 0;

  const commitBatchIfNeeded = async () => {
    if (operationsInBatch === 0) return;
    await batch.commit();
    written += operationsInBatch;
    batch = db.batch();
    operationsInBatch = 0;
  };

  for (const student of students) {
    const studentId = String(student.studentId || "").trim().toUpperCase();
    const pin = String(student.pin || "").trim();
    if (!studentId || !/^[A-Z0-9_-]{2,16}$/.test(studentId)) {
      throw new Error(`Invalid studentId: ${student.studentId}`);
    }
    if (!/^[0-9]{4,8}$/.test(pin)) {
      throw new Error(`Invalid PIN for ${studentId}`);
    }

    const pinSalt = crypto.randomBytes(16).toString("hex");
    batch.set(db.collection("studentAccounts").doc(studentId), {
      studentId,
      uid: student.uid || `student_${studentId.toLowerCase()}`,
      displayName: student.displayName || studentId,
      classId: student.classId || "",
      pinSalt,
      pinHash: hashPin(pin, pinSalt),
      disabled: Boolean(student.disabled),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    operationsInBatch += 1;

    if (operationsInBatch >= BATCH_LIMIT) {
      await commitBatchIfNeeded();
    }
  }

  await commitBatchIfNeeded();
  console.log(`Seeded ${written} student accounts from ${sourcePath}`);
}

seedStudents().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
