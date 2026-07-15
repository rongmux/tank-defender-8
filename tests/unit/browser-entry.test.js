const assert = require("assert").strict;
const fs = require("fs");
const path = require("path");
const { DEFAULT_BROWSER_SCRIPTS } = require("../helpers/load-browser-scripts");

const root = path.resolve(__dirname, "../..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const scriptSources = Array.from(html.matchAll(/<script\s+src="([^"]+)"/g), (match) => match[1]);

assert.deepEqual(
  scriptSources,
  Array.from(DEFAULT_BROWSER_SCRIPTS),
  "the real browser and VM harness must load the same scripts in the same order"
);
for (const relativePath of DEFAULT_BROWSER_SCRIPTS) {
  assert(fs.existsSync(path.join(root, relativePath)), `browser entry script is missing: ${relativePath}`);
}

console.log("browser-entry unit test passed");
