const assert = require("assert").strict;
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const SCREEN_FLOW_DIAGNOSTIC_METHODS = [
  "debugTitleScoreLayoutProbe",
  "debugFrameCounterProbe",
  "debugStageSelectInputCadenceProbe",
  "debugTitleDemoLifecycleProbe",
  "debugHiddenMessageLifecycleProbe",
  "debugHighScoreScreenProbe",
  "debugHighScoreAudioProbe",
  "debugFullGameOverScreenProbe",
  "debugGameOverAudioProbe",
  "debugRenderFullGameOverFrame",
  "debugRenderHighScoreFrame"
];

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.screenFlowDiagnostics, "screen-flow diagnostics should register before game.js");
assert.equal(Object.isFrozen(modules.screenFlowDiagnostics), true);
assert(modules.stageSelectRuntime, "stage select runtime should register before game.js");
assert.equal(Object.isFrozen(modules.stageSelectRuntime), true);
assert.deepEqual(
  JSON.parse(JSON.stringify(Object.keys(api).slice(39, 50))),
  SCREEN_FLOW_DIAGNOSTIC_METHODS
);

const outputs = {
  debugTitleScoreLayoutProbe: api.debugTitleScoreLayoutProbe(1),
  debugFrameCounterProbe: api.debugFrameCounterProbe(),
  debugStageSelectInputCadenceProbe: api.debugStageSelectInputCadenceProbe(),
  debugTitleDemoLifecycleProbe: api.debugTitleDemoLifecycleProbe(),
  debugHiddenMessageLifecycleProbe: api.debugHiddenMessageLifecycleProbe(),
  debugHighScoreScreenProbe: api.debugHighScoreScreenProbe(),
  debugHighScoreAudioProbe: api.debugHighScoreAudioProbe(),
  debugFullGameOverScreenProbe: api.debugFullGameOverScreenProbe(),
  debugGameOverAudioProbe: api.debugGameOverAudioProbe(),
  debugRenderFullGameOverFrame: api.debugRenderFullGameOverFrame(42),
  debugRenderHighScoreFrame: api.debugRenderHighScoreFrame(1, 1234567)
};
const json = JSON.stringify(outputs);
assert.equal(Buffer.byteLength(json), 25534);
assert.equal(
  crypto.createHash("sha256").update(json).digest("hex"),
  "ddd9c8ea4b58435070c220d2437471a0e97992852c564fb3bf209f705220a37c"
);

const debugSource = fs.readFileSync(path.join(root, "src/runtime/debug-api.js"), "utf8");
const diagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/screen-flow-diagnostics.js"),
  "utf8"
);
assert(debugSource.includes("...createScreenFlowDiagnostics(state, deps)"));
assert.equal(diagnosticsSource.includes("eval("), false);
for (const name of SCREEN_FLOW_DIAGNOSTIC_METHODS) {
  assert.equal(debugSource.includes(`${name}(`), false);
  assert.equal(diagnosticsSource.includes(`${name}(`), true);
}
assert(debugSource.split(/\r?\n/).length < 4900);

console.log("screen-flow-diagnostics integration test passed");
