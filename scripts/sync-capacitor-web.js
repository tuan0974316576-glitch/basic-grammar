const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.join(projectRoot, 'www');

const rootFileExtensions = new Set([
  '.css',
  '.csv',
  '.html',
  '.ico',
  '.jpg',
  '.jpeg',
  '.js',
  '.json',
  '.m4a',
  '.mp3',
  '.ogg',
  '.png',
  '.svg',
  '.wav',
  '.webmanifest',
  '.wasm',
  '.webp'
]);

const rootFileNames = new Set([
  'manifest.json',
  'firebase-init.js',
  'app-config.js',
  'sw.js'
]);

const directoriesToCopy = [
  'assets',
  'audio',
  'effects',
  'ranking_icon',
  'vendor'
];

const excludedRootFiles = new Set([
  'package-lock.json',
  'package.json',
  'capacitor.config.json',
  'database.rules.json',
  'firebase.json',
  'render.yaml'
]);

const excludedDirectories = new Set([
  'vendor/bundle'
]);

function copyFile(source, destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

function copyDirectory(source, destination) {
  if (!fs.existsSync(source)) return 0;
  const relativeSource = path.relative(projectRoot, source).split(path.sep).join('/');
  if (excludedDirectories.has(relativeSource)) return 0;

  let copied = 0;
  fs.mkdirSync(destination, { recursive: true });

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (entry.name === '.DS_Store') continue;

    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      copied += copyDirectory(sourcePath, destinationPath);
    } else if (entry.isFile()) {
      copyFile(sourcePath, destinationPath);
      copied++;
    }
  }

  return copied;
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

let copied = 0;

for (const entry of fs.readdirSync(projectRoot, { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  if (excludedRootFiles.has(entry.name)) continue;
  if (entry.name.startsWith('AuthKey_') || entry.name.endsWith('.p8')) continue;

  const extension = path.extname(entry.name).toLowerCase();
  if (!rootFileExtensions.has(extension) && !rootFileNames.has(entry.name)) continue;

  copyFile(path.join(projectRoot, entry.name), path.join(outputDir, entry.name));
  copied++;
}

for (const directory of directoriesToCopy) {
  copied += copyDirectory(path.join(projectRoot, directory), path.join(outputDir, directory));
}

console.log(`Synced ${copied} Capacitor web asset files into ${path.relative(projectRoot, outputDir)}.`);
