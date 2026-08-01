const assert = require("assert").strict;
const runtime = require("../../src/runtime/game-session-runtime");

assert.equal(Object.isFrozen(runtime), true);
assert.throws(() => runtime.setupGameSessionRuntime(), /state must be an object/);
assert.throws(
  () => runtime.setupGameSessionRuntime({ game: {}, fn: {} }, { sharedState: {} }),
  /deps\.cloneGrid must be a function/
);

const calls = [];
const state = {
  game: {
    constructionUsed: true,
    constructionVisits: 5,
    constructedGrid: { id: "construction" },
    demoMode: false,
    frameLow: 0,
    fullGameOverElapsed: 4,
    hiddenInputCount: 0x74,
    highScore: 23450,
    highScoreScreenElapsed: 3,
    newHighScoreAtGameOver: true,
    pauseElapsed: 9,
    paused: true,
    players: [],
    runHighScoreBaseline: 0,
    stage: 1,
    titleIdleFrames: 99,
    transitionTimer: 5
  },
  fn: {
    clearTransientBattleState() { calls.push("clearTransientBattleState"); },
    createPlayer(id) {
      calls.push(["createPlayer", id]);
      return { id };
    },
    initAudio() { calls.push("initAudio"); },
    resetFrameCounters() { calls.push("resetFrameCounters"); },
    resetTitleIdleTimer() { calls.push("resetTitleIdleTimer"); },
    startStage(stage) { calls.push(["startStage", stage]); },
    syncMovementAudio() { calls.push("syncMovementAudio"); }
  }
};
const audioStops = [
  "stopMovementAudio", "stopBrickHitAudio", "stopEnemyHitAudio", "stopBaseHitAudio",
  "stopEnemyDestroyAudio", "stopPlayerDestroyAudio", "stopSteelHitAudio", "stopPlayerShootAudio",
  "stopMovementIceAudio", "stopScoreCountAudio", "stopStageBonusAudio"
];
for (const name of audioStops) state.fn[name] = () => calls.push(name);

const api = runtime.setupGameSessionRuntime(state, {
  cloneGrid(grid) {
    calls.push(["cloneGrid", grid]);
    return { clonedFrom: grid.id };
  },
  sharedState: { DEMO_DISPLAY_STAGE: 15, DEMO_INITIAL_FRAME_LOW: 0x20 }
});

assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), ["startGame", "startTitleDemo", "endTitleDemo"]);
assert.equal(state.fn.startGame, api.startGame);

api.startGame(2);
assert.deepEqual(calls, ["initAudio", ["createPlayer", 1], ["createPlayer", 2], ["startStage", 1]]);
assert.equal(state.game.constructionUsed, false);
assert.equal(state.game.constructionVisits, 0);
assert.equal(state.game.hiddenInputCount, 0);
assert.equal(state.game.runHighScoreBaseline, 23450);
assert.equal(state.game.newHighScoreAtGameOver, false);
assert.equal(state.game.fullGameOverElapsed, 0);
assert.equal(state.game.highScoreScreenElapsed, 0);
assert.equal(state.game.playerCount, 2);
assert.equal(state.game.paused, false);
assert.equal(state.game.pauseElapsed, 0);
assert.equal(state.game.demoMode, false);
assert.equal(state.game.customGrid, null);
assert.equal(state.game.constructionStageActive, true);
assert.deepEqual(state.game.players, [{ id: 1 }, { id: 2 }]);

calls.length = 0;
api.startGame(1, { stage: 4, customGrid: { id: "custom" }, useConstruction: false });
assert.deepEqual(calls, ["initAudio", ["cloneGrid", { id: "custom" }], ["createPlayer", 1], ["startStage", 4]]);
assert.deepEqual(state.game.customGrid, { clonedFrom: "custom" });
assert.equal(state.game.constructionStageActive, false);

calls.length = 0;
api.startTitleDemo();
assert.deepEqual(calls, [["createPlayer", 1], ["createPlayer", 2], ["startStage", 15], "resetFrameCounters", "syncMovementAudio"]);
assert.equal(state.game.demoMode, true);
assert.equal(state.game.playerCount, 2);
assert.equal(state.game.stage, 15);
assert.equal(state.game.screen, "playing");
assert.equal(state.game.transitionTimer, 0);
assert.equal(state.game.titleIdleFrames, 0);
assert.equal(state.game.frameLow, 0x20);
assert.equal(state.game.constructionStageActive, false);

calls.length = 0;
state.game.paused = true;
api.endTitleDemo();
assert.deepEqual(calls, [...audioStops, "resetTitleIdleTimer", "clearTransientBattleState"]);
assert.equal(state.game.demoMode, false);
assert.equal(state.game.stage, 1);
assert.equal(state.game.screen, "title");
assert.equal(state.game.paused, false);

console.log("game-session-runtime unit test passed");
