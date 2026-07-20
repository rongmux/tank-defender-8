const assert = require("assert").strict;
const debugSnapshotModule = require("../../src/runtime/debug-snapshot");
const { createFixedFrameAudioState } = require("../../src/audio/fixed-frame-audio-state");
const { createSharedState } = require("../../src/runtime/shared-state");
const { createBuiltInStagePack } = require("../../src/stages/built-in-stage-pack");
const { createStageRuntime } = require("../../src/stages/stage-runtime");

const builtInStagePack = createBuiltInStagePack();
const state = createSharedState({ builtInStagePack });
state.game.stagePack = builtInStagePack;
state.stageRuntime = createStageRuntime({
  getState: () => state.game,
  builtInStagePack,
  demoMaxActiveEnemies: 4
});
state.game.grid = state.stageRuntime.createStageGrid(1);
state.audio = Object.fromEntries(debugSnapshotModule.AUDIO_SNAPSHOT_FIELDS.map((field) => [
  field[1],
  createFixedFrameAudioState()
]));

assert.equal(Object.isFrozen(debugSnapshotModule), true);
assert.equal(Object.isFrozen(debugSnapshotModule.AUDIO_SNAPSHOT_FIELDS), true);
assert.throws(() => debugSnapshotModule.createDebugSnapshot(), /state must be an object/);
assert.throws(() => debugSnapshotModule.createDebugSnapshot({}), /state\.game must be an object/);
assert.throws(
  () => debugSnapshotModule.createDebugSnapshot({ game: {} }),
  /state\.stageRuntime must provide stage lookup functions/
);

state.game.titleMenu = 1;
state.game.tick = 17;
state.game.enemySpawned = 3;
state.game.stageClearBonusPlayerIds = [2];
state.game.playerGameOverMessage = { playerId: 1, timer: 2, x: 32, y: 216, dx: 1 };
state.game.scorePopups = [{ text: "500", x: 8, y: 9, ttl: 10 }];
state.game.editorCursor = { qc: 2, qr: 4 };
state.game.editorBrush = 1;
state.game.players = [{
  id: 1,
  score: 1000,
  stagePoints: 400,
  stageKills: [1, 2, 3, 4],
  totalKills: [4, 3, 2, 1],
  nextBonusLifeIndex: 1,
  level: 2,
  lives: 3,
  respawn: 0,
  spawnFlash: 5,
  invuln: 6,
  x: 65,
  y: 193,
  speed: 1,
  slide: 7,
  pendingSnap: null
}];
state.movementAudio.mode = "player";
state.audio.stageStart.active = true;
state.audio.stageStart.frame = 12;

const snapshot = debugSnapshotModule.createDebugSnapshot(state);
assert.deepEqual(Object.keys(snapshot), [
  "screen",
  "paused",
  "pauseElapsed",
  "titleMenu",
  "titleMenuAction",
  "titleIdleFrames",
  "titleDemoIdleFrames",
  "battleTick",
  "frameLow",
  "frameHigh",
  "randomValue",
  "randomIndex",
  "demoMode",
  "constructionUsed",
  "constructionVisits",
  "hiddenInputCount",
  "hiddenMessageElapsed",
  "stage",
  "stageSelectPlayers",
  "stageSelectLimit",
  "stageCycleLimit",
  "mapDataStage",
  "enemyDataStage",
  "highScore",
  "runHighScoreBaseline",
  "newHighScoreAtGameOver",
  "fullGameOverElapsed",
  "highScoreScreenElapsed",
  "enemySpawned",
  "enemyKilled",
  "panelEnemyCounter",
  "nextSpawn",
  "clearPendingTimer",
  "baseDestroyTimer",
  "stageResultReason",
  "stageClearElapsed",
  "stageClearBonusPlayerIds",
  "stageClearBonusAwarded",
  "gameOverTimer",
  "playerGameOverMessage",
  "freezeTimer",
  "shovelTimer",
  "movementAudioMode",
  "stageStartAudio",
  "bonusLifeAudio",
  "powerUpPickupAudio",
  "powerUpAppearAudio",
  "brickHitAudio",
  "steelHitAudio",
  "enemyHitAudio",
  "baseHitAudio",
  "enemyDestroyAudio",
  "playerDestroyAudio",
  "playerShootAudio",
  "movementIceAudio",
  "pauseAudio",
  "scoreCountAudio",
  "stageBonusAudio",
  "gameOverAudio",
  "highScoreAudio",
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
  "scorePopups",
  "battleQuadrants",
  "fieldGeometry",
  "editorCursor",
  "editorBrush",
  "editorPattern",
  "editorPatternArmed",
  "editorQuadrants",
  "hasConstructedStage",
  "constructionStageActive",
  "powerUpType",
  "players"
]);
assert.equal(snapshot.titleMenuAction, "two");
assert.equal(snapshot.titleDemoIdleFrames, 640);
assert.equal(snapshot.battleTick, 17);
assert.equal(snapshot.panelEnemyCounter, 17);
assert.deepEqual(snapshot.playerGameOverMessage, {
  playerId: 1,
  timer: 2,
  x: 32,
  y: 216,
  dx: 1,
  active: true
});
assert.equal(snapshot.movementAudioMode, "player");
assert.deepEqual(snapshot.stageStartAudio, { active: true, frame: 12, durationFrames: 264 });
assert.equal(snapshot.powerUpPickupAudio.durationFrames, 39);
assert.equal(snapshot.battleQuadrants.length, 26);
assert.deepEqual(snapshot.fieldGeometry, {
  x: 16,
  y: 16,
  width: 208,
  height: 208,
  panelX: 224,
  panelWidth: 32
});
assert.equal(snapshot.editorBrush, "brick");
assert.equal(snapshot.players.length, 1);
assert.deepEqual(snapshot.players[0].stageKills, [1, 2, 3, 4]);

snapshot.stageClearBonusPlayerIds[0] = -1;
snapshot.stageStartAudio.active = false;
snapshot.scorePopups[0].text = "changed";
snapshot.battleQuadrants[0] = "changed";
snapshot.editorCursor.qc = -1;
snapshot.enemyTypes[0].hp = -1;
snapshot.players[0].stageKills[0] = -1;

const fresh = debugSnapshotModule.createDebugSnapshot(state);
assert.deepEqual(fresh.stageClearBonusPlayerIds, [2]);
assert.equal(fresh.stageStartAudio.active, true);
assert.equal(fresh.scorePopups[0].text, "500");
assert.notEqual(fresh.battleQuadrants[0], "changed");
assert.equal(fresh.editorCursor.qc, 2);
assert.notEqual(fresh.enemyTypes[0].hp, -1);
assert.equal(fresh.players[0].stageKills[0], 1);

console.log("debug-snapshot unit test passed");
