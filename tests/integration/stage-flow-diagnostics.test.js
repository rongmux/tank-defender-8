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

function runtimeEnemyTypeCounts(sequence) {
  return sequence.reduce((counts, enemy) => {
    counts[enemy.typeIndex] = (counts[enemy.typeIndex] || 0) + 1;
    return counts;
  }, [0, 0, 0, 0]);
}

function runtimeCarrierNumbers(sequence) {
  return sequence.map((enemy, index) => enemy.carrier ? index + 1 : null).filter(Boolean).join(",");
}

const runtimeHarness = createBrowserGameHarness(root);
const runtimeContext = runtimeHarness.context;
const runtimeApi = runtimeContext.window.TankDefender8;
const runtimeSchema = runtimeApi.stagePackSchema();
const runtimeButtons = runtimeHarness.buttons;
const runtimeListeners = runtimeHarness.listeners;
const runtimeByAction = Object.fromEntries(runtimeButtons.map((button) => [button.dataset.action, button]));

function runtimeKeyDown(code) {
  runtimeListeners.keydown({ code, repeat: false, shiftKey: false, preventDefault() {} });
}

function runtimeKeyUp(code) {
  runtimeListeners.keyup({ code });
}

function runtimeKeyPress(code) {
  runtimeKeyDown(code);
  runtimeKeyUp(code);
}

function finishRuntimeStageSelectClosing() {
  const snapshot = runtimeApi.debugSnapshot();
  if (snapshot.screen === "stageSelectClosing") runtimeApi.debugAdvanceStageTransition(16);
}

let runtimeSnapshot = runtimeApi.debugSnapshot();
let runtimeCounts = runtimeEnemyTypeCounts(runtimeSnapshot.enemySequence);
assert(runtimeCounts.join(",") === "18,2,0,0", "built-in stage 1 enemy groups should be 18 basic and 2 fast");
assert(runtimeCarrierNumbers(runtimeSnapshot.enemySequence) === "4,11,18", "built-in stage 1 carriers should be enemies 4, 11, and 18");
runtimeByAction.next.click();
runtimeSnapshot = runtimeApi.debugSnapshot();
runtimeCounts = runtimeEnemyTypeCounts(runtimeSnapshot.enemySequence);
assert(runtimeSnapshot.stage === 2, "next should select stage 2");
assert(runtimeCounts.join(",") === "14,0,4,2", "built-in stage 2 enemy groups should be 14 basic, 4 power, and 2 armor");
assert(runtimeCarrierNumbers(runtimeSnapshot.enemySequence) === "4,11,18", "built-in stage 2 carriers should be enemies 4, 11, and 18");
runtimeByAction.prev.click();
runtimeByAction.prev.click();
runtimeSnapshot = runtimeApi.debugSnapshot();
runtimeCounts = runtimeEnemyTypeCounts(runtimeSnapshot.enemySequence);
assert(runtimeSnapshot.stage === 70, "prev from stage 1 should wrap to stage 70 in the original-style cycle");
assert(runtimeSnapshot.stageCycleLimit === 70, "built-in original-style cycle should expose 70 selectable stages");
assert(runtimeSnapshot.mapDataStage === 35, "built-in stage 70 should reuse stage 35 map data");
assert(runtimeSnapshot.enemyDataStage === 35, "built-in stage 70 should reuse stage 35 enemy data");
assert(runtimeCounts.join(",") === "0,6,4,10", "built-in stage 70 should use stage 35 enemy groups");
assert(runtimeCarrierNumbers(runtimeSnapshot.enemySequence) === "4,11,18", "built-in stage 70 carriers should match stage 35");
runtimeByAction.next.click();

const runtimeValidPack = {
  id: "stage-flow-runtime",
  totalStages: 1,
  enemyTotal: 20,
  maps: [runtimeSchema.maps[0]],
  enemies: [runtimeSchema.enemies[0]]
};
assert(runtimeApi.loadStagePack(runtimeValidPack) === true, "loadStagePack should accept a valid pack");
assert(runtimeApi.currentPackInfo().id === "stage-flow-runtime", "current pack id should update");
runtimeByAction.one.click();
finishRuntimeStageSelectClosing();
runtimeKeyPress("Enter");
runtimeSnapshot = runtimeApi.debugSnapshot();
assert(runtimeSnapshot.players.length === 1 && runtimeSnapshot.screen === "stageIntro", "pack state cleanup probe should start from active gameplay");
assert(runtimeApi.loadStagePack(runtimeValidPack) === true, "loadStagePack should reload while gameplay is active");
runtimeSnapshot = runtimeApi.debugSnapshot();
assert(runtimeSnapshot.screen === "title", "loading a stage pack should return to the title screen");
assert(runtimeSnapshot.players.length === 0 && runtimeSnapshot.enemySpawned === 0 && runtimeSnapshot.enemyKilled === 0, "loading a stage pack should clear active player and enemy counters");
assert(runtimeSnapshot.powerUpType === null && runtimeSnapshot.clearPendingTimer === 0 && runtimeSnapshot.gameOverTimer === 0, "loading a stage pack should clear transient power-up and transition state");
assert(runtimeSnapshot.stageResultReason === "clear" && runtimeSnapshot.stageClearElapsed === 0, "loading a stage pack should reset stage-result routing state");

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
