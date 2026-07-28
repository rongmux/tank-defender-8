const assert = require("assert").strict;
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const STAGE_FLOW_DIAGNOSTIC_METHODS = [
  "debugStageIntroCurtainProbe",
  "debugStageSelectCurtainProbe",
  "debugRenderStageClearClosingFrame",
  "debugAdvanceStageTransition",
  "debugAdvanceStageSelect",
  "debugAdvanceStageStartAudio",
  "debugStageAdvanceProbe",
  "debugStageCycleProbe",
  "debugOriginalEnemyGroupsProbe",
  "debugStageClearDelayProbe",
  "debugStageClearAdvanceProbe",
  "debugStageCyclePreservesPlayerStateProbe",
  "debugCompletedStageAdvanceProbe",
  "debugGameOverSlideProbe",
  "debugGameOverBattleProbe",
  "debugGameOverReturnProbe",
  "debugGameOverStageResultProbe"
];

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.stageFlowDiagnostics, "stage-flow diagnostics should register before game.js");
assert.equal(Object.isFrozen(modules.stageFlowDiagnostics), true);
assert(modules.stageFlowRuntime, "stage flow runtime should register before game.js");
assert.equal(Object.isFrozen(modules.stageFlowRuntime), true);
assert(modules.battleOutcomeRuntime, "battle outcome runtime should register before game.js");
assert.equal(Object.isFrozen(modules.battleOutcomeRuntime), true);
assert.deepEqual(
  JSON.parse(JSON.stringify(Object.keys(api).slice(137, 154))),
  STAGE_FLOW_DIAGNOSTIC_METHODS
);

const outputs = {
  debugStageIntroCurtainProbe: api.debugStageIntroCurtainProbe(95),
  debugStageSelectCurtainProbe: api.debugStageSelectCurtainProbe(17),
  debugRenderStageClearClosingFrame: api.debugRenderStageClearClosingFrame(64),
  debugAdvanceStageTransition: api.debugAdvanceStageTransition(0),
  debugAdvanceStageSelect: api.debugAdvanceStageSelect(0),
  debugAdvanceStageStartAudio: api.debugAdvanceStageStartAudio(0),
  debugStageAdvanceProbe: api.debugStageAdvanceProbe(35),
  debugStageCycleProbe: api.debugStageCycleProbe(36),
  debugOriginalEnemyGroupsProbe: api.debugOriginalEnemyGroupsProbe(),
  debugStageClearDelayProbe: api.debugStageClearDelayProbe(1, true),
  debugStageClearAdvanceProbe: api.debugStageClearAdvanceProbe(1),
  debugStageCyclePreservesPlayerStateProbe:
    api.debugStageCyclePreservesPlayerStateProbe(35),
  debugCompletedStageAdvanceProbe: api.debugCompletedStageAdvanceProbe(1),
  debugGameOverSlideProbe: api.debugGameOverSlideProbe(),
  debugGameOverBattleProbe: api.debugGameOverBattleProbe(),
  debugGameOverReturnProbe: api.debugGameOverReturnProbe(),
  debugGameOverStageResultProbe: api.debugGameOverStageResultProbe()
};
const json = JSON.stringify(outputs);
assert.equal(Buffer.byteLength(json), 32122);
assert.equal(
  crypto.createHash("sha256").update(json).digest("hex"),
  "4636a26be196825867b711d51ffec3cc957ecaf47af0097ec5e797ba0062cc1d"
);

const debugSource = fs.readFileSync(path.join(root, "src/runtime/debug-api.js"), "utf8");
const diagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/stage-flow-diagnostics.js"),
  "utf8"
);
assert(debugSource.includes("...createStageFlowDiagnostics(state, deps)"));
assert.equal(diagnosticsSource.includes("eval("), false);
for (const name of STAGE_FLOW_DIAGNOSTIC_METHODS) {
  assert.equal(debugSource.includes(`${name}(`), false);
  assert.equal(diagnosticsSource.includes(`${name}(`), true);
}
assert(debugSource.split(/\r?\n/).length < 5600);

console.log("stage-flow-diagnostics integration test passed");
