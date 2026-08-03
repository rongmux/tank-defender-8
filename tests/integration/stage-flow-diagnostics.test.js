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
assert.equal(Object.isFrozen(modules.stageFlowTransitionDiagnostics), true);
assert.equal(Object.isFrozen(modules.stageFlowProgressionDiagnostics), true);
assert.equal(Object.isFrozen(modules.stageFlowGameOverDiagnostics), true);
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
assert.equal(Buffer.byteLength(json), 13046);
assert.equal(
  crypto.createHash("sha256").update(json).digest("hex"),
  "3acf66087b39d34f26b888482aee5710058adfa3ffcb125991587dc329a37e69"
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
assert(runtimeCounts.join(",") === "14,4,0,2", "built-in stage 2 enemy groups should be 14 basic, 4 fast, and 2 armor");
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

const runtimeShortPack = {
  id: "short",
  totalStages: 1,
  enemyTypes: runtimeSchema.enemyTypes.map((enemyType, index) => index === 0 ? { ...enemyType, hp: 2, wallPower: 2, fireChance: 0.25, score: 150, color: "#ffffff", hitColors: ["#111111", "#ffffff"] } : enemyType),
  gameSettings: {
    initialLives: 5,
    bonusLifeScores: [100],
    deathPowerLevel: 2,
    powerUpDurations: { helmet: 30, shovel: 40, shovelFlash: 16, timer: 50 },
    powerUpRules: { carrierRelease: "hit", clearUncollectedOnCarrierSpawn: false, pickupScore: 750 },
    timings: { stageIntro: 7, stageClearDelay: 6, stageClear: 8, playerRespawn: 9, playerInvulnerability: 10, enemySpawnFlash: 11, enemyInitialReload: 12, enemySpawnRetry: 13, powerUpTtl: 14 },
    enemySpawnPacing: { firstDelay: 5, baseDelay: 9, stageStep: 1, minDelay: 4 },
    playerMovement: { speed: 1.5, iceSlideFrames: 3, iceSlideSpeed: 0.4 },
    projectileRules: { bulletSize: 6, spawnOffset: 11, boundsPadding: 2 },
    friendlyFire: { enabled: false, stunFrames: 12 },
    explosionRules: { enemyDestroy: { ttl: 22, color: "#123456", coreColor: "#abcdef" } },
    stageAdvance: { loopAfterFinalStage: false },
    stageClearBonus: { points: 777, twoPlayerOnly: true, requireStrictLead: true },
    enemyAi: { intersectionTurnChance: 0.33, blockedRetryChance: 0.44, blockedRetryTicks: 5, horizontalFirstChance: 0.22 },
    playerUpgradeRules: runtimeSchema.playerUpgradeRules.map((rule, index) => index === 0 ? { ...rule, maxBullets: 2, bulletSpeed: 2.75, reload: 21 } : rule),
    timerFreezesEnemyTime: false
  },
  maps: [runtimeSchema.maps[0]],
  stageSettings: [{
    maxActiveEnemies: 2,
    playerSpawns: [{ x: 3, y: 12 }, { x: 9, y: 12 }],
    enemySpawns: [{ x: 1, y: 0 }, { x: 6, y: 0 }, { x: 11, y: 0 }],
    powerUpSpawns: [{ x: 2, y: 2 }, { x: 10, y: 10 }]
  }],
  enemies: [runtimeSchema.enemies[0].slice(0, 3).map((enemy) => ({ ...enemy, spawnDelay: null }))]
};
assert(runtimeApi.validateStagePack(runtimeShortPack).ok === true, "short per-stage enemy list should validate");
assert(runtimeApi.loadStagePack(runtimeShortPack) === true, "short per-stage enemy list should load");
assert(runtimeApi.currentPackInfo().enemyTotal === 3, "current stage enemy total should derive from sequence length");
assert(runtimeApi.currentPackInfo().enemyTypes[0].hp === 2, "current pack should expose custom enemy hp");
assert(runtimeApi.currentPackInfo().enemyTypes[0].wallPower === 2, "current pack should expose custom enemy wall power");
assert(runtimeApi.currentPackInfo().enemyTypes[0].fireChance === 0.25, "current pack should expose custom enemy fire chance");
assert(runtimeApi.currentPackInfo().enemyTypes[0].score === 150, "current pack should expose custom enemy score");
assert(runtimeApi.currentPackInfo().enemyTypes[0].hitColors[0] === "#111111", "current pack should expose custom enemy hit colors");
assert(runtimeApi.debugEnemyColorProbe(0, 1) === "#111111", "custom enemy hit colors should apply at low HP");
assert(runtimeApi.debugEnemyColorProbe(0, 2) === "#ffffff", "custom enemy hit colors should apply at high HP");
assert(runtimeApi.currentPackInfo().maxActiveEnemies === 2, "current stage max active enemies should use stageSettings");
const runtimeStageClearDelayStartProbe = runtimeApi.debugStageClearDelayProbe(0, true);
assert(
  runtimeStageClearDelayStartProbe.screen === "playing" &&
    runtimeStageClearDelayStartProbe.clearPendingTimer === runtimeApi.currentPackInfo().timings.stageClearDelay,
  "stage completion detection should load the full clear delay without decrementing it"
);
assert(runtimeApi.debugStageClearDelayProbe(2, true).screen === "playing", "stage clear delay should keep gameplay active before result");
assert(runtimeApi.debugStageClearDelayProbe(1, true).screen === "stageClear", "stage clear delay should eventually enter result screen");
const runtimeStageClearLowKillProbe = runtimeApi.debugStageClearDelayProbe(1, true, 0);
assert(
  runtimeStageClearLowKillProbe.screen === "stageClear" &&
    runtimeStageClearLowKillProbe.enemySpawned === runtimeApi.currentPackInfo().enemyTotal &&
    runtimeStageClearLowKillProbe.enemyKilled === 0,
  "stage clear should depend on all spawned enemies being gone, not on the kill-table counter"
);
assert(runtimeApi.debugStageClearDelayProbe(2, false).screen === "gameOver", "base destruction should win during stage clear delay");
assert(runtimeApi.debugStageClearPresentationProbe([20, 0, 0, 0], [0, 0, 0, 0], 0).duration === 8, "a positive custom stage-clear timing should override the dynamic result duration");
assert(runtimeApi.currentPackInfo().playerUpgradeRules[0].maxBullets === 2, "current pack should expose custom player upgrade rules");
assert(runtimeApi.currentPackInfo().playerUpgradeRules[0].bulletSpeed === 2.75, "current pack should expose custom player bullet speed");
assert(runtimeApi.currentPackInfo().playerSpawns[0].x === 3, "current stage should expose custom player spawns");
assert(runtimeApi.currentPackInfo().enemySpawns[0].x === 1, "current stage should expose custom enemy spawns");
assert(runtimeApi.currentPackInfo().powerUpSpawns[1].x === 10, "current stage should expose custom power-up spawns");
runtimeByAction.one.click();
finishRuntimeStageSelectClosing();
runtimeKeyPress("Enter");
runtimeSnapshot = runtimeApi.debugSnapshot();
assert(runtimeSnapshot.nextSpawn === 5, "custom enemy spawn pacing should control the first default spawn delay");
assert(runtimeSnapshot.clearPendingTimer === 0, "new stage should not start with stage clear pending");
assert(runtimeSnapshot.enemySpawnPacing.minDelay === 4, "debug snapshot should expose custom enemy spawn pacing");
assert(runtimeSnapshot.playerMovement.iceSlideFrames === 3, "debug snapshot should expose custom player movement rules");
assert(runtimeSnapshot.projectileRules.spawnOffset === 11, "debug snapshot should expose custom projectile rules");
assert(runtimeSnapshot.friendlyFire.enabled === false, "debug snapshot should expose custom friendly-fire rules");
assert(runtimeSnapshot.explosionRules.enemyDestroy.color === "#123456", "debug snapshot should expose custom explosion rules");
assert(runtimeSnapshot.stageAdvance.loopAfterFinalStage === false, "debug snapshot should expose custom stage advance rules");
assert(runtimeSnapshot.stageClearBonus.points === 777, "debug snapshot should expose custom stage clear bonus");

const debugSource = fs.readFileSync(path.join(root, "src/runtime/debug-api.js"), "utf8");
const diagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/stage-flow-diagnostics.js"),
  "utf8"
);
const transitionDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/stage-flow-transition-diagnostics.js"),
  "utf8"
);
const progressionDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/stage-flow-progression-diagnostics.js"),
  "utf8"
);
const gameOverDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/stage-flow-game-over-diagnostics.js"),
  "utf8"
);
assert(debugSource.includes("...createStageFlowDiagnostics(state, deps)"));
assert.equal(diagnosticsSource.includes("eval("), false);
assert.equal(transitionDiagnosticsSource.includes("eval("), false);
assert.equal(progressionDiagnosticsSource.includes("eval("), false);
assert.equal(gameOverDiagnosticsSource.includes("eval("), false);
for (const name of STAGE_FLOW_DIAGNOSTIC_METHODS) {
  assert.equal(debugSource.includes(`${name}(`), false);
  assert.equal(
    diagnosticsSource.includes(`${name}(`) ||
      transitionDiagnosticsSource.includes(`${name}(`) ||
      progressionDiagnosticsSource.includes(`${name}(`) ||
      gameOverDiagnosticsSource.includes(`${name}(`),
    true
  );
}
assert(debugSource.split(/\r?\n/).length < 5600);

console.log("stage-flow-diagnostics integration test passed");
