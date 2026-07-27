const assert = require("assert").strict;
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const SCORE_DIAGNOSTIC_METHODS = [
  "debugGrenadeScoreProbe",
  "debugGrenadeSpawnProtectionProbe",
  "debugScorePopupProbe",
  "debugPausedScorePopupProbe"
];

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.scoreDiagnostics, "score diagnostics should register before game.js");
assert.equal(Object.isFrozen(modules.scoreDiagnostics), true);
assert.deepEqual(
  JSON.parse(JSON.stringify(Object.keys(api).slice(90, 94))),
  SCORE_DIAGNOSTIC_METHODS
);

const outputs = SCORE_DIAGNOSTIC_METHODS.map((name) => api[name]());
const json = JSON.stringify(outputs);
assert.equal(Buffer.byteLength(json), 1095);
assert.equal(
  crypto.createHash("sha256").update(json).digest("hex"),
  "5461da587bdfb5d809f61806b42640a92afd2f3138fcae04a21f94ea160dd632"
);

const debugSource = fs.readFileSync(path.join(root, "src/runtime/debug-api.js"), "utf8");
const diagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/score-diagnostics.js"),
  "utf8"
);
assert(debugSource.includes("...createScoreDiagnostics(state, deps)"));
assert.equal(diagnosticsSource.includes("eval("), false);
for (const name of SCORE_DIAGNOSTIC_METHODS) {
  assert.equal(debugSource.includes(`${name}(`), false);
  assert.equal(diagnosticsSource.includes(`${name}(`), true);
}
assert(debugSource.split(/\r?\n/).length < 500);

console.log("score-diagnostics integration test passed");
