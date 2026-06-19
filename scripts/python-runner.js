"use strict";

const { spawnSync } = require("child_process");

function spawnFileSync(command, args = [], options = {}) {
  return spawnSync(command, args, {
    ...options,
    env: {
      ...process.env,
      ...(options.env || {})
    }
  });
}

module.exports = {
  spawnFileSync
};
