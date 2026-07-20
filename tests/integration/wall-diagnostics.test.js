const assert = require("assert").strict;
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const WALL_DIAGNOSTIC_METHODS = [
  "debugSteelRuleProbe",
  "debugBrickWallPowerProbe",
  "debugBrickFragmentRenderProbe",
  "debugShovelWallProbe",
  "debugShovelDestroyedBaseProbe"
];

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.wallDiagnostics, "wall diagnostics should register before game.js");
assert.equal(Object.isFrozen(modules.wallDiagnostics), true);
assert.deepEqual(
  JSON.parse(JSON.stringify(Object.keys(api).slice(51, 56))),
  WALL_DIAGNOSTIC_METHODS
);

const outputs = {
  debugSteelRuleProbe: api.debugSteelRuleProbe(),
  debugBrickWallPowerProbe: api.debugBrickWallPowerProbe(),
  debugBrickFragmentRenderProbe: api.debugBrickFragmentRenderProbe(),
  debugShovelWallProbe: api.debugShovelWallProbe(),
  debugShovelDestroyedBaseProbe: api.debugShovelDestroyedBaseProbe()
};
const json = JSON.stringify(outputs);
assert.equal(Buffer.byteLength(json), 1929);
assert.equal(
  crypto.createHash("sha256").update(json).digest("hex"),
  "3430a548ec0870d2576cd6e769a0584b8caa7b2e2ca3f161df46fc5ceb97cfe3"
);

const debugSource = fs.readFileSync(path.join(root, "src/runtime/debug-api.js"), "utf8");
const diagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/wall-diagnostics.js"),
  "utf8"
);
assert(debugSource.includes("...createWallDiagnostics(state, deps)"));
assert.equal(diagnosticsSource.includes("eval("), false);
for (const name of WALL_DIAGNOSTIC_METHODS) {
  assert.equal(debugSource.includes(`${name}(`), false);
  assert.equal(diagnosticsSource.includes(`${name}(`), true);
}
assert(debugSource.split(/\r?\n/).length < 4000);

console.log("wall-diagnostics integration test passed");
