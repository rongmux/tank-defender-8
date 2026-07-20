const assert = require("assert").strict;
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const TIMER_DIAGNOSTIC_METHODS = [
  "debugTimerRuleProbe",
  "debugGlobalTimerCadenceProbe",
  "debugShieldCadenceProbe",
  "debugPausedShieldProbe",
  "debugTimerFreezeBehaviorProbe",
  "debugTimerFinalFrameFreezeProbe",
  "debugTimerSpawnDuringFreezeProbe"
];

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.timerDiagnostics, "timer diagnostics should register before game.js");
assert.equal(Object.isFrozen(modules.timerDiagnostics), true);
assert.deepEqual(
  JSON.parse(JSON.stringify(Object.keys(api).slice(67, 74))),
  TIMER_DIAGNOSTIC_METHODS
);

const outputs = Object.fromEntries(
  TIMER_DIAGNOSTIC_METHODS.map((name) => [name, api[name]()])
);
const json = JSON.stringify(outputs);
assert.equal(Buffer.byteLength(json), 2184);
assert.equal(
  crypto.createHash("sha256").update(json).digest("hex"),
  "351c57d19ca53645e641f1cca2a4777288e8692e4056842f34117cafc4d90430"
);

const debugSource = fs.readFileSync(path.join(root, "src/runtime/debug-api.js"), "utf8");
const diagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/timer-diagnostics.js"),
  "utf8"
);
assert(debugSource.includes("...createTimerDiagnostics(state, deps)"));
assert.equal(diagnosticsSource.includes("eval("), false);
for (const name of TIMER_DIAGNOSTIC_METHODS) {
  assert.equal(debugSource.includes(`${name}(`), false);
  assert.equal(diagnosticsSource.includes(`${name}(`), true);
}
assert(debugSource.split(/\r?\n/).length < 3600);

console.log("timer-diagnostics integration test passed");
