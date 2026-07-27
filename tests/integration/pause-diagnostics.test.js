const assert = require("assert").strict;
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const PAUSE_DIAGNOSTIC_METHODS = [
  "debugPauseBehaviorProbe",
  "debugPausedStageEndProbe",
  "debugRenderPauseFrame"
];

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.pauseDiagnostics, "pause diagnostics should register before game.js");
assert.equal(Object.isFrozen(modules.pauseDiagnostics), true);
assert.deepEqual(
  JSON.parse(JSON.stringify(Object.keys(api).slice(36, 39))),
  PAUSE_DIAGNOSTIC_METHODS
);

const outputs = PAUSE_DIAGNOSTIC_METHODS.map((name) => api[name]());
const json = JSON.stringify(outputs);
assert.equal(Buffer.byteLength(json), 973);
assert.equal(
  crypto.createHash("sha256").update(json).digest("hex"),
  "ac4e7a06ad63b08aab9af35eea8ff7f4042d1ae1ed410343f0f249396cb2ad55"
);

const debugSource = fs.readFileSync(path.join(root, "src/runtime/debug-api.js"), "utf8");
const diagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/pause-diagnostics.js"),
  "utf8"
);
assert(debugSource.includes("...createPauseDiagnostics(state, deps)"));
assert.equal(diagnosticsSource.includes("eval("), false);
for (const name of PAUSE_DIAGNOSTIC_METHODS) {
  assert.equal(debugSource.includes(`${name}(`), false);
  assert.equal(diagnosticsSource.includes(`${name}(`), true);
}
assert(debugSource.split(/\r?\n/).length < 650);

console.log("pause-diagnostics integration test passed");
