const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');

const audioFiles = [
  'bgm.mp3',
  'bgm_native.m4a',
  'deploy.mp3',
  'enter_word.mp3',
  'enter_number.mp3',
  'delete_word.mp3',
  'wrong_word.mp3',
  'laser_attack.mp3',
  'target_hit.mp3',
  'time_out.mp3',
  'open_room.mp3',
  'target_destory.mp3',
  'level_select_code_list.mp3',
  'speaking_open_container.mp3',
  'speaking_green.mp3',
  'speaking_wrong.mp3',
  'skill_select.mp3',
  'radar_sfx.mp3',
  'Aurelians_shield.mp3',
  'Aurelians_shield_break.mp3',
  'missile_flying.mp3',
  'nuclear_missile_ready.mp3',
  'nuclear_missile_launched.mp3',
  'nuclear_missile_detected.mp3',
  'victory.mp3',
  'lose.mp3',
  'new_commander.mp3',
  'ship_0_ghost.mp3',
  'ship_1_striker.mp3',
  'ship_2_dreadnought.mp3',
  'ship_3_destroyer.mp3',
  'ship_4_spectre.mp3',
  'unit_lost.mp3',
  'your-fleet-is-under-attack.mp3'
];

const targets = [
  path.join(projectRoot, 'android', 'app', 'src', 'main', 'assets'),
  path.join(projectRoot, 'ios', 'App', 'App', 'sounds')
];

function ensureIosSoundsFolderReference() {
  const pbxPath = path.join(projectRoot, 'ios', 'App', 'App.xcodeproj', 'project.pbxproj');
  if (!fs.existsSync(pbxPath)) return;

  let project = fs.readFileSync(pbxPath, 'utf8');
  if (project.includes('/* sounds in Resources */')) return;

  const fileRefId = 'B5A75A001111111111111111';
  const buildFileId = 'B5A75A001111111111111112';
  const fileRefLine = `\t\t${fileRefId} /* sounds */ = {isa = PBXFileReference; lastKnownFileType = folder; path = sounds; sourceTree = "<group>"; };\n`;
  const buildFileLine = `\t\t${buildFileId} /* sounds in Resources */ = {isa = PBXBuildFile; fileRef = ${fileRefId} /* sounds */; };\n`;

  project = project.replace('/* End PBXBuildFile section */', `${buildFileLine}/* End PBXBuildFile section */`);
  project = project.replace('/* End PBXFileReference section */', `${fileRefLine}/* End PBXFileReference section */`);
  project = project.replace(
    '\t\t\t\t50B271D01FEDC1A000F3C39B /* public */,\n',
    '\t\t\t\t50B271D01FEDC1A000F3C39B /* public */,\n\t\t\t\tB5A75A001111111111111111 /* sounds */,\n'
  );
  project = project.replace(
    '\t\t\t\t2FAD9763203C412B000D30F8 /* config.xml in Resources */,\n',
    '\t\t\t\t2FAD9763203C412B000D30F8 /* config.xml in Resources */,\n\t\t\t\tB5A75A001111111111111112 /* sounds in Resources */,\n'
  );

  fs.writeFileSync(pbxPath, project);
  console.log('Ensured iOS sounds folder is included in Xcode Copy Bundle Resources.');
}

function ensureIosGameAudioSources() {
  const pbxPath = path.join(projectRoot, 'ios', 'App', 'App.xcodeproj', 'project.pbxproj');
  if (!fs.existsSync(pbxPath)) return;

  let project = fs.readFileSync(pbxPath, 'utf8');
  if (project.includes('/* GameAudioPlugin.m in Sources */')) return;

  const entries = [
    {
      fileRef: 'B5A75A002222222222222201',
      buildFile: 'B5A75A002222222222222202',
      name: 'GameAudioManager.swift',
      type: 'sourcecode.swift'
    },
    {
      fileRef: 'B5A75A002222222222222203',
      buildFile: 'B5A75A002222222222222204',
      name: 'GameAudioPlugin.swift',
      type: 'sourcecode.swift'
    },
    {
      fileRef: 'B5A75A002222222222222205',
      buildFile: 'B5A75A002222222222222206',
      name: 'GameAudioPlugin.m',
      type: 'sourcecode.c.objc'
    }
  ];

  const buildLines = entries
    .map(entry => `\t\t${entry.buildFile} /* ${entry.name} in Sources */ = {isa = PBXBuildFile; fileRef = ${entry.fileRef} /* ${entry.name} */; };\n`)
    .join('');
  const fileRefLines = entries
    .map(entry => `\t\t${entry.fileRef} /* ${entry.name} */ = {isa = PBXFileReference; lastKnownFileType = ${entry.type}; path = ${entry.name}; sourceTree = "<group>"; };\n`)
    .join('');
  const groupLines = entries
    .map(entry => `\t\t\t\t${entry.fileRef} /* ${entry.name} */,\n`)
    .join('');
  const sourceLines = entries
    .map(entry => `\t\t\t\t${entry.buildFile} /* ${entry.name} in Sources */,\n`)
    .join('');

  project = project.replace('/* End PBXBuildFile section */', `${buildLines}/* End PBXBuildFile section */`);
  project = project.replace('/* End PBXFileReference section */', `${fileRefLines}/* End PBXFileReference section */`);
  project = project.replace(
    '\t\t\t\t504EC3071FED79650016851F /* AppDelegate.swift */,\n',
    `\t\t\t\t504EC3071FED79650016851F /* AppDelegate.swift */,\n${groupLines}`
  );
  project = project.replace(
    '\t\t\t\t504EC3081FED79650016851F /* AppDelegate.swift in Sources */,\n',
    `\t\t\t\t504EC3081FED79650016851F /* AppDelegate.swift in Sources */,\n${sourceLines}`
  );

  fs.writeFileSync(pbxPath, project);
  console.log('Ensured iOS GameAudio sources are included in Xcode target.');
}

let copied = 0;

for (const targetDir of targets) {
  const platformRoot = targetDir.includes(`${path.sep}android${path.sep}`)
    ? path.join(projectRoot, 'android')
    : path.join(projectRoot, 'ios');

  if (!fs.existsSync(platformRoot)) {
    console.log(`Skipping ${targetDir}; platform folder does not exist yet.`);
    continue;
  }

  fs.mkdirSync(targetDir, { recursive: true });

  for (const file of audioFiles) {
    const source = path.join(projectRoot, file);
    if (!fs.existsSync(source)) {
      console.warn(`Missing audio asset: ${file}`);
      continue;
    }

    fs.copyFileSync(source, path.join(targetDir, file));
    copied++;
  }
}

ensureIosSoundsFolderReference();
ensureIosGameAudioSources();

console.log(`Synced ${copied} native audio asset copy operations.`);
