const assert = require("assert").strict;
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const UPGRADE_DIAGNOSTIC_METHODS = [
  "debugStarUpgradeProbe",
  "debugPlayerUpgradeVisualProbe",
  "debugStarSurvivabilityProbe"
];

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.upgradeDiagnostics, "upgrade diagnostics should register before game.js");
assert.equal(Object.isFrozen(modules.upgradeDiagnostics), true);
assert.deepEqual(
  JSON.parse(JSON.stringify(Object.keys(api).slice(94, 97))),
  UPGRADE_DIAGNOSTIC_METHODS
);

const outputs = Object.fromEntries(
  UPGRADE_DIAGNOSTIC_METHODS.map((name) => [name, api[name]()])
);
const json = JSON.stringify(outputs);
assert.equal(Buffer.byteLength(json), 702);
assert.equal(
  crypto.createHash("sha256").update(json).digest("hex"),
  "d6eb1ece421788b4e56f0a2ac235ea63c40ffea4a8673ceb0e4d93d3ce177646"
);

const debugSource = fs.readFileSync(path.join(root, "src/runtime/debug-api.js"), "utf8");
const diagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/upgrade-diagnostics.js"),
  "utf8"
);
assert(debugSource.includes("...createUpgradeDiagnostics(state, deps)"));
assert.equal(diagnosticsSource.includes("eval("), false);
for (const name of UPGRADE_DIAGNOSTIC_METHODS) {
  assert.equal(debugSource.includes(`${name}(`), false);
  assert.equal(diagnosticsSource.includes(`${name}(`), true);
}
assert(debugSource.split(/\r?\n/).length < 2900);

console.log("upgrade-diagnostics integration test passed");
