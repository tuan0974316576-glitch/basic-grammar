const { spawnSync } = require("child_process");
const fs = require("fs");

const args = process.argv.slice(2);
const env = { ...process.env };

if (!env.NODE_EXTRA_CA_CERTS) {
  const certificatePaths = [
    "/opt/homebrew/etc/ca-certificates/cert.pem",
    "/usr/local/etc/ca-certificates/cert.pem",
    "/etc/ssl/cert.pem"
  ];
  const certificatePath = certificatePaths.find((candidate) => fs.existsSync(candidate));
  if (certificatePath) {
    env.NODE_EXTRA_CA_CERTS = certificatePath;
  }
}

const executable = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(executable, ["firebase-tools", ...args], {
  stdio: "inherit",
  env
});

if (result.error) {
  console.error(result.error);
  process.exitCode = 1;
} else {
  process.exitCode = result.status || 0;
}
