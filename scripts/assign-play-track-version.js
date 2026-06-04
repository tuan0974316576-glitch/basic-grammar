#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const https = require('https');
const path = require('path');
const { URL, URLSearchParams } = require('url');

const rootDir = path.resolve(__dirname, '..');
const keyPath = process.env.SUPPLY_JSON_KEY || path.join(rootDir, 'fastlane/play-store-credentials.json');
const packageName = process.env.PLAY_PACKAGE_NAME || 'com.enguistics.vocabconqueror';
const trackName = process.env.PLAY_TRACK || 'internal';
const versionCode = String(process.env.PLAY_VERSION_CODE || '').trim();
const releaseStatus = process.env.PLAY_RELEASE_STATUS || 'completed';
const caPath =
  process.env.SSL_CERT_FILE ||
  process.env.NODE_EXTRA_CA_CERTS ||
  '/opt/homebrew/etc/ca-certificates/cert.pem';
const ca = fs.existsSync(caPath) ? fs.readFileSync(caPath) : undefined;
const apiRoot = 'https://androidpublisher.googleapis.com/androidpublisher/v3';

function base64Url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function makeJwt(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(claim))}`;
  const signature = crypto.createSign('RSA-SHA256').update(unsigned).sign(serviceAccount.private_key);
  return `${unsigned}.${base64Url(signature)}`;
}

function request(method, urlText, { headers = {}, body = null, expected = null } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlText);
    const req = https.request(
      {
        method,
        hostname: url.hostname,
        path: `${url.pathname}${url.search}`,
        headers,
        ca,
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const responseBody = Buffer.concat(chunks).toString('utf8');
          const status = res.statusCode || 0;
          if (expected && !expected.includes(status)) {
            reject(new Error(`${method} ${urlText} failed with ${status}: ${responseBody}`));
            return;
          }
          resolve({ status, body: responseBody });
        });
      },
    );
    req.on('error', reject);
    req.setTimeout(300000, () => req.destroy(new Error(`Timeout during ${method} ${urlText}`)));
    if (body) req.write(body);
    req.end();
  });
}

async function getAccessToken(serviceAccount) {
  const assertion = makeJwt(serviceAccount);
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  }).toString();
  const response = await request('POST', 'https://oauth2.googleapis.com/token', {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body),
    },
    body,
    expected: [200],
  });
  return JSON.parse(response.body).access_token;
}

async function googleJson(method, url, token, bodyObject = undefined, expected = [200]) {
  const body = bodyObject === undefined ? null : JSON.stringify(bodyObject);
  const response = await request(method, url, {
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body
        ? {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
          }
        : {}),
    },
    body,
    expected,
  });
  return response.body ? JSON.parse(response.body) : {};
}

async function main() {
  if (!versionCode) throw new Error('Set PLAY_VERSION_CODE, e.g. PLAY_VERSION_CODE=22');
  if (!fs.existsSync(keyPath)) throw new Error(`Missing key file: ${keyPath}`);

  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  const token = await getAccessToken(serviceAccount);
  const edit = await googleJson('POST', `${apiRoot}/applications/${packageName}/edits`, token, {});

  await googleJson(
    'PUT',
    `${apiRoot}/applications/${packageName}/edits/${edit.id}/tracks/${trackName}`,
    token,
    {
      track: trackName,
      releases: [
        {
          name: `versionCode ${versionCode}`,
          status: releaseStatus,
          versionCodes: [versionCode],
        },
      ],
    },
  );

  await googleJson('POST', `${apiRoot}/applications/${packageName}/edits/${edit.id}:commit`, token, undefined, [200]);
  console.log(`Assigned existing versionCode ${versionCode} to ${trackName}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
