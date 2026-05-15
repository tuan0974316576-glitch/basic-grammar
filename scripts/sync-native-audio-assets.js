const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');

const audioFiles = [
  'bgm.mp3',
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

console.log(`Synced ${copied} native audio asset copy operations.`);
