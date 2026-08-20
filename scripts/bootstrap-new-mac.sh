#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

require_command() {
  local command_name="$1"
  local install_hint="$2"
  if ! command -v "$command_name" >/dev/null 2>&1; then
    printf 'Missing %s. %s\n' "$command_name" "$install_hint" >&2
    return 1
  fi
}

missing=0
require_command git "Install Xcode Command Line Tools with: xcode-select --install" || missing=1
require_command node "Install Node.js 22 LTS before continuing." || missing=1
require_command npm "Install Node.js 22 LTS before continuing." || missing=1
require_command flutter "Install Flutter stable and add it to PATH." || missing=1

if [[ "$missing" -ne 0 ]]; then
  exit 1
fi

node_major="$(node -p 'process.versions.node.split(".")[0]')"
if [[ "$node_major" != "22" ]]; then
  printf 'Warning: Node %s is active; Firebase Functions targets Node 22.\n' "$(node -v)" >&2
fi

printf 'Installing root Node dependencies...\n'
npm --prefix "$ROOT_DIR" install

printf 'Installing Firebase Functions dependencies...\n'
npm --prefix "$ROOT_DIR/functions" install

printf 'Installing Flutter dependencies...\n'
(
  cd "$ROOT_DIR/flutter_app"
  flutter pub get
)

printf '\nSetup complete. Next checks:\n'
printf '  cd "%s/flutter_app" && flutter doctor -v\n' "$ROOT_DIR"
printf '  cd "%s" && npm test\n' "$ROOT_DIR"
printf '  cd "%s/flutter_app" && flutter test\n' "$ROOT_DIR"
