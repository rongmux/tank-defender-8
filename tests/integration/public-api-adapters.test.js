const assert = require("assert").strict;
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;
const keys = Object.keys(api);

assert(modules.publicApiAdapters, "public API adapters should register before game.js");
assert.equal(Object.isFrozen(modules.publicApiAdapters), true);
assert.deepEqual(keys.slice(0, 3), [
  "loadStagePack",
  "loadStagePackJson",
  "validateStagePack"
]);
assert.deepEqual(keys.slice(34, 36), ["spriteManifest", "currentPackInfo"]);
assert.equal(keys[50], "debugSnapshot");
assert.equal(keys[158], "stagePackSchema");
assert.equal(api.validateStagePack({}).ok, false);
assert.equal(typeof api.validateStagePack({}).error, "string");
assert.equal(typeof api.currentPackInfo().id, "string");
assert.equal(typeof api.debugSnapshot().screen, "string");
assert(Object.keys(api.spriteManifest()).length > 0);
assert(Object.keys(api.stagePackSchema()).length > 0);

const debugSource = fs.readFileSync(path.join(root, "src/runtime/debug-api.js"), "utf8");
const adaptersSource = fs.readFileSync(
  path.join(root, "src/runtime/public-api-adapters.js"),
  "utf8"
);
assert(debugSource.includes("var publicAdapters = createPublicApiAdapters(state, deps);"));
assert(debugSource.includes("...publicAdapters.packLoading,"));
assert(debugSource.includes("...publicAdapters.packInfo,"));
assert(debugSource.includes("...publicAdapters.snapshot,"));
assert(debugSource.includes("...publicAdapters.schema"));
assert.equal(debugSource.includes("eval("), false);
for (const name of [
  "loadStagePack",
  "loadStagePackJson",
  "validateStagePack",
  "spriteManifest",
  "currentPackInfo",
  "debugSnapshot",
  "stagePackSchema"
]) {
  assert.equal(debugSource.includes(`${name}(`), false);
  assert(adaptersSource.includes(`${name}(`));
}
assert(debugSource.split(/\r?\n/).length < 100);

console.log("public-api-adapters integration test passed");
