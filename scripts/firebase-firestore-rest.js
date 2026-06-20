"use strict";

const fs = require("fs");
const https = require("https");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_PROJECT_ID = "enguistics-grammar-game";
const FIREBASE_CLI_WRAPPER = path.join(ROOT_DIR, "scripts", "firebase-cli.js");
const FIREBASE_CONFIG_PATH = path.join(os.homedir(), ".config", "configstore", "firebase-tools.json");

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
    encoding: "utf8",
    maxBuffer: 1024 * 1024
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

function parseResponseBody(responseBody) {
  if (!responseBody) return {};
  try {
    return JSON.parse(responseBody);
  } catch (_error) {
    return { raw: responseBody };
  }
}

function requestJson(url, options = {}) {
  const method = options.method || "GET";
  const payload = options.payload;
  const body = payload === undefined ? "" : JSON.stringify(payload);
  const requestUrl = new URL(url);
  const headers = {
    "Authorization": `Bearer ${options.accessToken || refreshFirebaseCliTokenIfNeeded()}`
  };
  if (body) {
    headers["Content-Type"] = "application/json";
    headers["Content-Length"] = Buffer.byteLength(body);
  }

  return new Promise((resolve, reject) => {
    const request = https.request({
      method,
      hostname: requestUrl.hostname,
      path: `${requestUrl.pathname}${requestUrl.search}`,
      headers,
      ca: getCertificate()
    }, (response) => {
      let responseBody = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        responseBody += chunk;
      });
      response.on("end", () => {
        const bodyJson = parseResponseBody(responseBody);
        if ((response.statusCode || 0) >= 200 && (response.statusCode || 0) < 300) {
          resolve(bodyJson);
          return;
        }
        reject(new Error(`Firestore REST request failed (${response.statusCode}): ${JSON.stringify(bodyJson)}`));
      });
    });
    request.on("error", reject);
    if (body) request.write(body);
    request.end();
  });
}

function getJson(url, accessToken) {
  return requestJson(url, { method: "GET", accessToken });
}

function postJson(url, payload, accessToken) {
  return requestJson(url, { method: "POST", payload, accessToken });
}

module.exports = {
  DEFAULT_PROJECT_ID,
  getJson,
  parseResponseBody,
  postJson,
  refreshFirebaseCliTokenIfNeeded,
  requestJson
};
