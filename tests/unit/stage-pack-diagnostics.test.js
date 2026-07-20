const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/stage-pack-diagnostics");
const { createBuiltInStagePack } = require("../../src/stages/built-in-stage-pack");
const { createStageRuntime } = require("../../src/stages/stage-runtime");

const builtInStagePack = createBuiltInStagePack();
const game = {
  stagePack: builtInStagePack,
  stage: 1,
  playerCount: 1,
  demoMode: false
};
const stageRuntime = createStageRuntime({
  getState: () => game,
  builtInStagePack,
  demoMaxActiveEnemies: 5
});

assert.equal(Object.isFrozen(diagnostics), true);
assert.equal(Object.isFrozen(diagnostics.DEBUG_PACK_INFO_KEYS), true);
assert.throws(() => diagnostics.createCurrentPackInfo(), /game must be an object/);
assert.throws(
  () => diagnostics.createCurrentPackInfo({}, stageRuntime),
  /game\.stagePack must be an object/
);
assert.throws(
  () => diagnostics.createCurrentPackInfo(game, {}),
  /stageRuntime must provide stage lookup functions/
);

const current = diagnostics.createCurrentPackInfo(game, stageRuntime);
assert.deepEqual(Object.keys(current), [
  "id",
  "totalStages",
  "stageCycleLimit",
  "mapDataStage",
  "enemyDataStage",
  "enemyTotal",
  "maxActiveEnemies",
  "initialLives",
  "bonusLifeScores",
  "deathPowerLevel",
  "powerUpDurations",
  "powerUpRules",
  "timings",
  "enemySpawnPacing",
  "playerMovement",
  "projectileRules",
  "friendlyFire",
  "explosionRules",
  "stageAdvance",
  "stageClearBonus",
  "enemyAi",
  "timerFreezesEnemyTime",
  "enemyTypes",
  "playerUpgradeRules",
  "wallRules",
  "playerSpawns",
  "enemySpawns",
  "powerUpSpawns",
  "enemySequence",
  "stage"
]);
assert.equal(current.id, "original-style");
assert.equal(current.totalStages, 35);
assert.equal(current.stageCycleLimit, 70);
assert.equal(current.mapDataStage, 1);
assert.equal(current.enemyDataStage, 1);
assert.equal(current.enemyTotal, 20);
assert.equal(current.maxActiveEnemies, 4);
assert.equal(current.stage, 1);

const debug = diagnostics.createDebugPackInfo(game, stageRuntime);
assert.deepEqual(Object.keys(debug), Array.from(diagnostics.DEBUG_PACK_INFO_KEYS));
for (const key of diagnostics.DEBUG_PACK_INFO_KEYS) {
  assert.deepEqual(debug[key], current[key], `debug field should match current pack info: ${key}`);
}
assert.equal("id" in debug, false);
assert.equal("stage" in debug, false);
assert.equal("enemyTotal" in debug, false);

current.bonusLifeScores[0] = -1;
current.powerUpDurations.helmet = -1;
current.playerMovement.frameCadence[0] = false;
current.explosionRules.enemyDestroy.ttl = -1;
current.enemyTypes[0].hp = -1;
current.playerUpgradeRules[0].maxBullets = -1;
current.wallRules.normalBrickStripDepth = -1;
current.playerSpawns[0].x = -1;
current.enemySequence[0].typeIndex = -1;

const fresh = diagnostics.createCurrentPackInfo(game, stageRuntime);
assert.notEqual(fresh.bonusLifeScores[0], -1);
assert.notEqual(fresh.powerUpDurations.helmet, -1);
assert.notEqual(fresh.playerMovement.frameCadence[0], false);
assert.notEqual(fresh.explosionRules.enemyDestroy.ttl, -1);
assert.notEqual(fresh.enemyTypes[0].hp, -1);
assert.notEqual(fresh.playerUpgradeRules[0].maxBullets, -1);
assert.notEqual(fresh.wallRules.normalBrickStripDepth, -1);
assert.notEqual(fresh.playerSpawns[0].x, -1);
assert.notEqual(fresh.enemySequence[0].typeIndex, -1);

game.stage = 36;
game.playerCount = 2;
const extended = diagnostics.createCurrentPackInfo(game, stageRuntime);
assert.equal(extended.stage, 36);
assert.equal(extended.mapDataStage, 1);
assert.equal(extended.enemyDataStage, 35);
assert.equal(extended.maxActiveEnemies, 6);

console.log("stage-pack-diagnostics unit test passed");
