const assert = require("assert").strict;
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const PANEL_DIAGNOSTIC_METHODS = [
  "debugEnemyPanelCounterProbe",
  "debugPanelLifeCountProbe"
];

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.panelDiagnostics, "panel diagnostics should register before game.js");
assert.equal(Object.isFrozen(modules.panelDiagnostics), true);
const panelIndex = Object.keys(api).indexOf(PANEL_DIAGNOSTIC_METHODS[0]);
assert.equal(panelIndex, 135);
assert.deepEqual(
  JSON.parse(JSON.stringify(Object.keys(api).slice(panelIndex, panelIndex + 2))),
  PANEL_DIAGNOSTIC_METHODS
);

const outputs = {
  debugEnemyPanelCounterProbe: api.debugEnemyPanelCounterProbe(4, 2, 20),
  debugPanelLifeCountProbe: api.debugPanelLifeCountProbe(3)
};
const json = JSON.stringify(outputs);
assert.equal(Buffer.byteLength(json), 133);
assert.equal(
  crypto.createHash("sha256").update(json).digest("hex"),
  "71dc0dbf9b2f9b1df4ba70eb8bdc76de1fe763270cf9364d7da188fe36fa01e8"
);

const debugSource = fs.readFileSync(path.join(root, "src/runtime/debug-api.js"), "utf8");
const diagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/panel-diagnostics.js"),
  "utf8"
);
assert(debugSource.includes("...createPanelDiagnostics(state, deps)"));
assert.equal(diagnosticsSource.includes("eval("), false);
for (const name of PANEL_DIAGNOSTIC_METHODS) {
  assert.equal(debugSource.includes(`${name}(`), false);
  assert(diagnosticsSource.includes(`${name}(`));
}
assert(debugSource.split(/\r?\n/).length < 150);

console.log("panel-diagnostics integration test passed");
