const crypto = require("crypto");
const fs = require("fs");
const https = require("https");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const DEFAULT_PROJECT_ID = "enguistics-grammar-game";
const projectId = process.env.GOOGLE_CLOUD_PROJECT
  || process.env.GCLOUD_PROJECT
  || process.env.FIREBASE_PROJECT_ID
  || DEFAULT_PROJECT_ID;
const databaseId = "(default)";
const sourcePath = process.argv[2] || path.join(__dirname, "students.sample.json");
const BATCH_LIMIT = 450;
const FIREBASE_CONFIG_PATH = path.join(os.homedir(), ".config", "configstore", "firebase-tools.json");
const ROOT_DIR = path.resolve(__dirname, "..");
const FIREBASE_CLI_WRAPPER = path.join(ROOT_DIR, "scripts", "firebase-cli.js");

function hashPin(pin, salt) {
  return crypto
    .pbkdf2Sync(String(pin), String(salt), 120000, 32, "sha256")
    .toString("hex");
}

function getCertificate() {
  const certificatePaths = [
    process.env.NODE_EXTRA_CA_CERTS,
    "/opt/homebrew/etc/ca-certificates/cert.pem",
    "/usr/local/etc/ca-certificates/cert.pem",
    "/etc/ssl/cert.pem"
  ].filter(Boolean);

  const certificatePath = certificatePaths.find((candidate) => fs.existsSync(candidate));
  return certificatePath ? fs.readFileSync(certificatePath) : undefined;
}

function readFirebaseCliConfig() {
  return JSON.parse(fs.readFileSync(FIREBASE_CONFIG_PATH, "utf8"));
}

function refreshFirebaseCliTokenIfNeeded() {
  let config;
  try {
    config = readFirebaseCliConfig();
  } catch (_error) {
    throw new Error("Firebase CLI is not logged in. Run `npm run firebase:reauth` first.");
  }

  const expiresAt = Number(config.tokens?.expires_at) || 0;
  const hasToken = Boolean(config.tokens?.access_token);
  if (hasToken && expiresAt > Date.now() + 60000) {
    return config.tokens.access_token;
  }

  const result = spawnSync(process.execPath, [
    FIREBASE_CLI_WRAPPER,
    "projects:list",
    "--json"
  ], {
    cwd: ROOT_DIR,
    encoding: "utf8"
  });

  if (result.status !== 0) {
    throw new Error("Could not refresh Firebase CLI token. Run `npm run firebase:reauth` first.");
  }

  const refreshedConfig = readFirebaseCliConfig();
  const refreshedToken = refreshedConfig.tokens?.access_token;
  if (!refreshedToken) {
    throw new Error("Firebase CLI token was not found after refresh.");
  }
  return refreshedToken;
}

function firestoreValue(value) {
  if (typeof value === "boolean") return { booleanValue: value };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  return { stringValue: String(value || "") };
}

function makeStudentWrite(student) {
  const studentId = String(student.studentId || "").trim().toUpperCase();
  const pin = String(student.pin || "").trim();
  if (!studentId || !/^[A-Z0-9_-]{2,16}$/.test(studentId)) {
    throw new Error(`Invalid studentId: ${student.studentId}`);
  }
  if (!/^[0-9]{4,8}$/.test(pin)) {
    throw new Error(`Invalid PIN for ${studentId}`);
  }

  const fields = {
    studentId: firestoreValue(studentId),
    uid: firestoreValue(student.uid || `student_${studentId.toLowerCase()}`),
    displayName: firestoreValue(student.displayName || studentId),
    classId: firestoreValue(student.classId || ""),
    role: firestoreValue(student.role === "teacher" ? "teacher" : "student"),
    pinSalt: firestoreValue(crypto.randomBytes(16).toString("hex")),
    disabled: firestoreValue(Boolean(student.disabled)),
    updatedAt: firestoreValue(new Date())
  };
  fields.pinHash = firestoreValue(hashPin(pin, fields.pinSalt.stringValue));

  return {
    update: {
      name: `projects/${projectId}/databases/${databaseId}/documents/studentAccounts/${studentId}`,
      fields
    },
    updateMask: {
      fieldPaths: Object.keys(fields)
    }
  };
}

function postJson(url, payload, accessToken) {
  const body = JSON.stringify(payload);
  const requestUrl = new URL(url);

  return new Promise((resolve, reject) => {
    const request = https.request({
      method: "POST",
      hostname: requestUrl.hostname,
      path: `${requestUrl.pathname}${requestUrl.search}`,
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body)
      },
      ca: getCertificate()
    }, (response) => {
      let responseBody = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        responseBody += chunk;
      });
      response.on("end", () => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(responseBody ? JSON.parse(responseBody) : {});
          return;
        }
        reject(new Error(`Firestore REST request failed (${response.statusCode}): ${responseBody}`));
      });
    });

    request.on("error", reject);
    request.write(body);
    request.end();
  });
}

async function commitWrites(writes, accessToken) {
  if (!writes.length) return 0;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents:commit`;
  await postJson(url, { writes }, accessToken);
  return writes.length;
}

async function seedStudents() {
  const raw = fs.readFileSync(sourcePath, "utf8");
  const students = JSON.parse(raw);
  if (!Array.isArray(students)) {
    throw new Error("Student file must be a JSON array.");
  }

  const accessToken = refreshFirebaseCliTokenIfNeeded();
  let pendingWrites = [];
  let written = 0;

  for (const student of students) {
    pendingWrites.push(makeStudentWrite(student));
    if (pendingWrites.length >= BATCH_LIMIT) {
      written += await commitWrites(pendingWrites, accessToken);
      pendingWrites = [];
    }
  }

  written += await commitWrites(pendingWrites, accessToken);
  console.log(`Seeded ${written} student accounts from ${sourcePath}`);
}

seedStudents().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
