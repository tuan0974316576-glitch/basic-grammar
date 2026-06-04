const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const projectRoot = path.resolve(__dirname, '..');
const iosAppDir = path.join(projectRoot, 'ios', 'App');
const podfilePath = path.join(iosAppDir, 'Podfile');
const localPodspecPath = path.join(
  projectRoot,
  'ios',
  'LocalPods',
  'CodetrixStudioCapacitorGoogleAuth',
  'CodetrixStudioCapacitorGoogleAuth.podspec'
);

const generatedPodLine =
  "  pod 'CodetrixStudioCapacitorGoogleAuth', :path => '../../node_modules/@codetrix-studio/capacitor-google-auth'";
const localPodLine =
  "  pod 'CodetrixStudioCapacitorGoogleAuth', :path => '../LocalPods/CodetrixStudioCapacitorGoogleAuth'";

if (!fs.existsSync(podfilePath)) {
  console.error(`Missing iOS Podfile: ${podfilePath}`);
  process.exit(1);
}

if (!fs.existsSync(localPodspecPath)) {
  console.error(`Missing patched Google Auth podspec: ${localPodspecPath}`);
  process.exit(1);
}

const podfile = fs.readFileSync(podfilePath, 'utf8');
let patchedPodfile = podfile;

if (podfile.includes(generatedPodLine)) {
  patchedPodfile = podfile.replace(generatedPodLine, localPodLine);
  fs.writeFileSync(podfilePath, patchedPodfile);
  console.log('Patched iOS GoogleAuth pod to use ios/LocalPods.');
} else if (podfile.includes(localPodLine)) {
  console.log('iOS GoogleAuth pod already uses ios/LocalPods.');
} else {
  console.error('Could not find the GoogleAuth pod line in ios/App/Podfile.');
  process.exit(1);
}

const install = spawnSync('pod', ['install'], {
  cwd: iosAppDir,
  stdio: 'inherit'
});

if (install.status !== 0) {
  process.exit(install.status || 1);
}
