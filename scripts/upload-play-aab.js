#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const https = require('https');
const path = require('path');
const { URL, URLSearchParams } = require('url');

const rootDir = path.resolve(__dirname, '..');
const keyPath = process.env.SUPPLY_JSON_KEY || path.join(rootDir, 'fastlane/play-store-credentials.json');
const packageName = process.env.PLAY_PACKAGE_NAME || 'com.enguistics.vocabconqueror';
const aabPath = path.resolve(rootDir, process.env.PLAY_AAB || 'build/android-play/EnglishConqueror-1.0.3-versionCode10.aab');
const trackName = process.env.PLAY_TRACK || 'internal';
const releaseStatus = process.env.PLAY_RELEASE_STATUS || 'completed';
const chunkSize = Number(process.env.PLAY_UPLOAD_CHUNK_SIZE || 8 * 1024 * 1024);
const commitRetryCount = Number(process.env.PLAY_COMMIT_RETRIES || 8);
const commitRetryDelayMs = Number(process.env.PLAY_COMMIT_RETRY_DELAY_MS || 15000);
const caPath =
  process.env.SSL_CERT_FILE ||
  process.env.NODE_EXTRA_CA_CERTS ||
  '/opt/homebrew/etc/ca-certificates/cert.pem';
const ca = fs.existsSync(caPath) ? fs.readFileSync(caPath) : undefined;
const apiRoot = 'https://androidpublisher.googleapis.com/androidpublisher/v3';
const uploadRoot = 'https://androidpublisher.googleapis.com/upload/androidpublisher/v3';

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
          resolve({ status, headers: res.headers, body: responseBody });
        });
      },
    );
    req.on('error', reject);
    req.setTimeout(300000, () => req.destroy(new Error(`Timeout during ${method} ${urlText}`)));
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

function requestStream(method, urlText, { headers, filePath, start, end, expected }) {
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
          resolve({ status, headers: res.headers, body: responseBody });
        });
      },
    );
    req.on('error', reject);
    req.setTimeout(300000, () => req.destroy(new Error(`Timeout during ${method} ${urlText}`)));
    fs.createReadStream(filePath, { start, end })
      .on('error', reject)
      .pipe(req);
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

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function commitEditWithRetry(editId, token) {
  let lastError = null;
  for (let attempt = 1; attempt <= commitRetryCount; attempt += 1) {
    try {
      try {
        return await googleJson('POST', `${apiRoot}/applications/${packageName}/edits/${editId}:commit`, token, undefined, [200]);
      } catch (error) {
        if (!String(error.message).includes('changesNotSentForReview')) {
          throw error;
        }
        return await googleJson(
          'POST',
          `${apiRoot}/applications/${packageName}/edits/${editId}:commit?changesNotSentForReview=true`,
          token,
          undefined,
          [200],
        );
      }
    } catch (error) {
      lastError = error;
      const message = String(error.message || error);
      if (!message.includes('Bundle uploads are not completed') &&
          !message.includes('App Bundle uploads are not completed')) {
        throw error;
      }
      if (attempt >= commitRetryCount) break;
      console.log(`Play commit waiting for bundle processing (${attempt}/${commitRetryCount})...`);
      await delay(commitRetryDelayMs);
    }
  }
  throw lastError;
}

function parseUploadedRange(rangeHeader) {
  if (!rangeHeader) return 0;
  const match = String(rangeHeader).match(/bytes=0-(\d+)/);
  return match ? Number(match[1]) + 1 : 0;
}

async function queryUploadOffset(uploadUrl, token, totalBytes) {
  const response = await request('PUT', uploadUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Length': 0,
      'Content-Range': `bytes */${totalBytes}`,
    },
    expected: [200, 201, 308],
  });
  if (response.status === 200 || response.status === 201) {
    return { complete: true, body: response.body };
  }
  return { complete: false, offset: parseUploadedRange(response.headers.range) };
}

async function uploadBundle(uploadUrl, token, totalBytes) {
  let offset = 0;
  let finalBody = null;
  let attemptsForChunk = 0;
  while (offset < totalBytes) {
    const end = Math.min(offset + chunkSize, totalBytes) - 1;
    const length = end - offset + 1;
    process.stdout.write(`Uploading ${Math.floor((offset / totalBytes) * 100)}% (${offset}-${end})...\n`);
    try {
      const response = await requestStream('PUT', uploadUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/octet-stream',
          'Content-Length': length,
          'Content-Range': `bytes ${offset}-${end}/${totalBytes}`,
        },
        filePath: aabPath,
        start: offset,
        end,
        expected: [200, 201, 308],
      });
      attemptsForChunk = 0;
      if (response.status === 308) {
        offset = parseUploadedRange(response.headers.range) || end + 1;
      } else {
        finalBody = response.body;
        offset = totalBytes;
      }
    } catch (error) {
      attemptsForChunk += 1;
      if (attemptsForChunk > 5) throw error;
      process.stdout.write(`Upload interrupted, checking resume point... (${error.message})\n`);
      await new Promise((resolve) => setTimeout(resolve, attemptsForChunk * 2000));
      const resumeState = await queryUploadOffset(uploadUrl, token, totalBytes);
      if (resumeState.complete) {
        finalBody = resumeState.body;
        offset = totalBytes;
      } else {
        offset = resumeState.offset;
      }
    }
  }
  if (!finalBody) {
    throw new Error('Upload finished without a final bundle response.');
  }
  return JSON.parse(finalBody);
}

async function main() {
  if (!fs.existsSync(keyPath)) throw new Error(`Missing key file: ${keyPath}`);
  if (!fs.existsSync(aabPath)) throw new Error(`Missing AAB file: ${aabPath}`);

  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  const totalBytes = fs.statSync(aabPath).size;
  console.log('Using configured Play Console service account.');
  console.log(`Uploading AAB: ${aabPath}`);
  console.log(`Track: ${trackName}`);

  const token = await getAccessToken(serviceAccount);
  const edit = await googleJson('POST', `${apiRoot}/applications/${packageName}/edits`, token, {});
  console.log(`Created Play edit: ${edit.id}`);

  const startResponse = await request(
    'POST',
    `${uploadRoot}/applications/${packageName}/edits/${edit.id}/bundles?uploadType=resumable&ackBundleInstallationWarning=false`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Upload-Content-Type': 'application/octet-stream',
        'X-Upload-Content-Length': totalBytes,
        'Content-Length': 0,
      },
      expected: [200, 201],
    },
  );
  const uploadUrl = startResponse.headers.location;
  if (!uploadUrl) throw new Error('Google did not return a resumable upload URL.');

  const bundle = await uploadBundle(uploadUrl, token, totalBytes);
  const versionCode = String(bundle.versionCode);
  console.log(`Uploaded bundle versionCode: ${versionCode}`);

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
  console.log(`Assigned versionCode ${versionCode} to ${trackName}.`);

  await commitEditWithRetry(edit.id, token);
  console.log(`Upload complete. ${packageName} versionCode ${versionCode} is on ${trackName}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
