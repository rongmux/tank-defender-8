const assert = require("assert").strict;
const runtime = require("../../src/runtime/stage-lifecycle-runtime");

assert.equal(Object.isFrozen(runtime), true);
assert.throws(() => runtime.setupStageLifecycleRuntime(), /state must be an object/);
assert.throws(
  () => runtime.setupStageLifecycleRuntime(
    { game: {}, fn: {}, stageRuntime: {}, pendingStageSelectPresses: new Set() },
    { sharedState: {}, cloneGrid() {}, prepareBattleGrid() {}, prepareConstructedBattleGrid() {} }
  ),
  /state\.stageRuntime\.gameSettings must be a function/
);

const calls = [];
const stageRuntime = {
  createStageGrid(stage) {
    calls.push(["createStageGrid", stage]);
    return { id: `built-in-${stage}` };
  },
  enemyTypeDefinitions() {
    return [{}, {}, {}, {}];
  },
  gameSettings() {
    return stageRuntime.settings;
  },
  settings: { timings: { stageIntro: 88 } },
  stageCycleLimit() {
    return 35;
  }
};
const state = {
  game: {
    baseDestroyTimer: 7,
    bullets: [{ id: "bullet" }],
    clearPendingTimer: 4,
    constructionStageActive: false,
    constructedGrid: { id: "construction" },
    customGrid: null,
    demoMode: true,
    enemies: [{ id: "enemy" }],
    enemyKilled: 8,
    enemySpawned: 9,
    explosions: [{ id: "explosion" }],
    freezeTimer: 6,
    fullGameOverElapsed: 5,
    gameOverTimer: 3,
    highScore: 23450,
    highScoreScreenElapsed: 2,
    lastPowerUpSpawn: { id: "power-up" },
    newHighScoreAtGameOver: true,
    nextSpawn: 10,
    playerGameOverMessage: "GAME OVER",
    players: [{ id: 1, stagePoints: 500, stageKills: [2] }],
    powerUp: { type: "star" },
    runHighScoreBaseline: 0,
    scorePopups: [{ id: "score" }],
    screen: "title",
    shovelTimer: 5,
    stage: 2,
    stageClearBonusAwarded: true,
    stageClearBonusPlayerIds: [1],
    stageClearElapsed: 4,
    stageResultReason: "gameOver",
    tick: 99,
    transitionTimer: 1
  },
  fn: {
    changeStageSelection(delta) {
      calls.push(["changeStageSelection", delta]);
    },
    enemySpawnDelay(stage, spawned) {
      calls.push(["enemySpawnDelay", stage, spawned]);
      return 23;
    },
    resetPlayerPosition(player) {
      calls.push(["resetPlayerPosition", player.id]);
    },
    resetPowerUpSpawnBag() {
      calls.push("resetPowerUpSpawnBag");
    },
    startStageStartAudio() {
      calls.push("startStageStartAudio");
    }
  },
  pendingStageSelectPresses: new Set(["Enter"]),
  stageRuntime
};
const startAudioStops = [
  "stopMovementAudio", "stopStageStartAudio", "stopBonusLifeAudio", "stopPowerUpPickupAudio",
  "stopPowerUpAppearAudio", "stopPauseAudio", "stopBrickHitAudio", "stopEnemyHitAudio",
  "stopBaseHitAudio", "stopEnemyDestroyAudio", "stopPlayerDestroyAudio", "stopSteelHitAudio",
  "stopPlayerShootAudio", "stopMovementIceAudio", "stopScoreCountAudio", "stopStageBonusAudio"
];
for (const name of [...startAudioStops, "stopGameOverAudio", "stopHighScoreAudio"]) {
  state.fn[name] = () => calls.push(name);
}
const api = runtime.setupStageLifecycleRuntime(state, {
  cloneGrid(grid) {
    calls.push(["cloneGrid", grid.id]);
    return { id: `clone-${grid.id}` };
  },
  prepareBattleGrid(grid) {
    calls.push(["prepareBattleGrid", grid.id]);
  },
  prepareConstructedBattleGrid(grid) {
    calls.push(["prepareConstructedBattleGrid", grid.id]);
  },
  sharedState: { TILE: 16 }
});

assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), [
  "startStage",
  "resetStageStats",
  "clearTransientBattleState",
  "nextStage"
]);
assert.equal(state.fn.startStage, api.startStage);

api.startStage(2);
assert.deepEqual(calls, [
  ...startAudioStops,
  ["createStageGrid", 2],
  ["prepareBattleGrid", "built-in-2"],
  "resetPowerUpSpawnBag",
  ["enemySpawnDelay", 2, 0],
  ["resetPlayerPosition", 1],
  "startStageStartAudio"
]);
assert.equal(state.game.screen, "stageIntro");
assert.equal(state.game.tick, 0);
assert.equal(state.game.transitionTimer, 88);
assert.deepEqual(state.game.grid, { id: "built-in-2" });
assert.deepEqual(state.game.base, { x: 96, y: 192, w: 16, h: 16, alive: true });
assert.deepEqual(state.game.players[0], { id: 1, stagePoints: 0, stageKills: [0, 0, 0, 0] });
assert.deepEqual(state.game.enemies, []);
assert.deepEqual(state.game.bullets, []);
assert.equal(state.game.powerUp, null);
assert.equal(state.game.enemySpawned, 0);
assert.equal(state.game.nextSpawn, 23);
assert.equal(state.game.stageResultReason, "clear");
assert.deepEqual(state.game.stageClearBonusPlayerIds, []);
assert.equal(state.game.stageClearBonusAwarded, false);

calls.length = 0;
state.game.customGrid = { id: "custom" };
stageRuntime.settings = {};
api.startStage(3);
assert.deepEqual(calls, [
  ...startAudioStops,
  ["cloneGrid", "custom"],
  ["prepareConstructedBattleGrid", "clone-custom"],
  "resetPowerUpSpawnBag",
  ["enemySpawnDelay", 3, 0],
  ["resetPlayerPosition", 1],
  "startStageStartAudio"
]);
assert.equal(state.game.transitionTimer, 150);

calls.length = 0;
state.game.customGrid = null;
state.game.constructionStageActive = true;
api.startStage(1);
assert(calls.some((call) => Array.isArray(call) && call[0] === "cloneGrid" && call[1] === "construction"));
assert(calls.some((call) => Array.isArray(call) && call[0] === "prepareConstructedBattleGrid"));

calls.length = 0;
state.game.players = [{ id: 1 }];
state.game.enemies = [{ id: "enemy" }];
state.game.bullets = [{ id: "bullet" }];
state.game.explosions = [{ id: "explosion" }];
state.game.scorePopups = [{ id: "score" }];
state.game.powerUp = { type: "star" };
state.game.lastPowerUpSpawn = { type: "timer" };
state.game.demoMode = true;
state.game.runHighScoreBaseline = 0;
state.game.newHighScoreAtGameOver = true;
state.pendingStageSelectPresses.add("Space");
api.clearTransientBattleState();
assert.deepEqual(calls, [...startAudioStops, "stopGameOverAudio", "stopHighScoreAudio", "resetPowerUpSpawnBag"]);
assert.equal(state.game.demoMode, false);
assert.equal(state.game.runHighScoreBaseline, 23450);
assert.equal(state.game.newHighScoreAtGameOver, false);
assert.deepEqual(state.game.players, []);
assert.deepEqual(state.game.enemies, []);
assert.deepEqual(state.game.bullets, []);
assert.deepEqual(state.game.explosions, []);
assert.deepEqual(state.game.scorePopups, []);
assert.equal(state.game.powerUp, null);
assert.equal(state.game.lastPowerUpSpawn, null);
assert.equal(state.game.nextSpawn, 0);
assert.equal(state.pendingStageSelectPresses.size, 0);

calls.length = 0;
state.game.screen = "stageClearClosing";
state.game.stage = 4;
api.nextStage(1);
assert.equal(state.game.stage, 4);
assert.deepEqual(calls, []);

state.game.screen = "stageSelect";
state.pendingStageSelectPresses.add("Enter");
api.nextStage(-1);
assert.deepEqual(calls, [["changeStageSelection", -1]]);
assert.equal(state.pendingStageSelectPresses.size, 0);

calls.length = 0;
state.game.screen = "playing";
state.game.stage = 35;
state.game.customGrid = { id: "custom" };
state.game.constructionStageActive = true;
state.fn.startStage = (stage) => calls.push(["startStage", stage]);
api.nextStage(1);
assert.equal(state.game.stage, 1);
assert.equal(state.game.customGrid, null);
assert.equal(state.game.constructionStageActive, false);
assert.deepEqual(calls, [["startStage", 1]]);

console.log("stage-lifecycle-runtime unit test passed");
