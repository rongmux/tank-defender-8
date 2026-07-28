const assert = require("assert").strict;
const runtime = require("../../src/runtime/game-over-entry-runtime");

assert.equal(Object.isFrozen(runtime), true);
assert.throws(
  () => runtime.setupGameOverEntryRuntime({}, {}, {}),
  /state\.game must be an object/
);

const calls = [];
const state = {
  game: {
    demoMode: false,
    screen: "playing",
    paused: true,
    tick: 45,
    frameLow: 45,
    frameHigh: 1,
    baseDestroyTimer: 12,
    playerGameOverMessage: { playerId: 2 },
    runHighScoreBaseline: 1000,
    players: [{ score: 1000 }, { score: 1001 }]
  },
  fn: {}
};
const stopNames = [
  "stopMovementAudio",
  "stopStageStartAudio",
  "stopBonusLifeAudio",
  "stopPowerUpPickupAudio",
  "stopPowerUpAppearAudio",
  "stopPauseAudio",
  "stopBrickHitAudio",
  "stopEnemyHitAudio",
  "stopEnemyDestroyAudio",
  "stopSteelHitAudio",
  "stopPlayerShootAudio",
  "stopMovementIceAudio",
  "stopScoreCountAudio",
  "stopStageBonusAudio"
];
const callbacks = {
  endTitleDemo() {
    calls.push(["endTitleDemo"]);
  },
  extendedStageEndFrameHigh() {
    calls.push(["extendedHigh"]);
    return 254;
  },
  gameOverFieldDuration() {
    calls.push(["duration"]);
    return 256;
  },
  resetFrameCounters() {
    calls.push(["resetCounters"]);
    state.game.frameLow = 0;
    state.game.frameHigh = 0;
  }
};
for (const name of stopNames) callbacks[name] = () => calls.push([name]);

const api = runtime.setupGameOverEntryRuntime(state, {}, callbacks);
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), ["enterGameOver"]);
assert.equal(state.fn.enterGameOver, api.enterGameOver);

api.enterGameOver();
assert.deepEqual(calls, [
  ["stopMovementAudio"],
  ["stopStageStartAudio"],
  ["stopBonusLifeAudio"],
  ["stopPowerUpPickupAudio"],
  ["stopPowerUpAppearAudio"],
  ["stopPauseAudio"],
  ["stopBrickHitAudio"],
  ["stopEnemyHitAudio"],
  ["stopEnemyDestroyAudio"],
  ["stopSteelHitAudio"],
  ["stopPlayerShootAudio"],
  ["stopMovementIceAudio"],
  ["stopScoreCountAudio"],
  ["stopStageBonusAudio"],
  ["resetCounters"],
  ["extendedHigh"],
  ["duration"]
]);
assert.equal(state.game.screen, "gameOver");
assert.equal(state.game.paused, false);
assert.equal(state.game.tick, 0);
assert.equal(state.game.frameLow, 0);
assert.equal(state.game.frameHigh, 254);
assert.equal(state.game.baseDestroyTimer, 0);
assert.equal(state.game.playerGameOverMessage, null);
assert.equal(state.game.newHighScoreAtGameOver, true);
assert.equal(state.game.gameOverTimer, 256);

calls.length = 0;
api.enterGameOver();
assert.deepEqual(calls, []);

state.game.screen = "playing";
state.game.demoMode = true;
api.enterGameOver();
assert.deepEqual(calls, [["endTitleDemo"]]);

console.log("game-over-entry-runtime unit test passed");
