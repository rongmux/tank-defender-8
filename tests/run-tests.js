const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const testFiles = [
  "tests/unit/frame-counter.test.js",
  "tests/unit/battle-random.test.js",
  "tests/unit/browser-entry.test.js",
  "tests/integration/frame-counter.test.js",
  "tools/smoke-test.js"
];

for (const testFile of testFiles) {
  const result = spawnSync(process.execPath, [path.join(root, testFile)], {
    cwd: root,
    stdio: "inherit"
  });
  if (result.status !== 0) process.exit(result.status || 1);
}

console.log("all tests passed");
