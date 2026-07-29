const path = require("path");
const { spawnSync } = require("child_process");
const { discoverTestFiles } = require("./helpers/test-file-discovery");

const root = path.resolve(__dirname, "..");
const testFiles = [
  ...discoverTestFiles(root, path.join("tests", "unit")),
  ...discoverTestFiles(root, path.join("tests", "integration"))
];

for (const testFile of testFiles) {
  const result = spawnSync(process.execPath, [path.join(root, testFile)], {
    cwd: root,
    stdio: "inherit"
  });
  if (result.status !== 0) process.exit(result.status || 1);
}

console.log("all tests passed");
