const assert = require("assert").strict;
const runtime = require("../../src/runtime/post-game-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupPostGameRuntime({}, {}, {}),
  /state\.game must be an object/
);

const events = [];
const state = {
  game: {
    screen: "stageClear",
    paused: true,
    fullGameOverElapsed: 9,
    highScoreScreenElapsed: 8,
    newHighScoreAtGameOver: false,
    stageResultReason: "gameOver",
    constructionUsed: true,
    constructionVisits: 3,
    hiddenInputCount: 4
  },
  fn: {}
};
const api = runtime.setupPostGameRuntime(state, {}, {
  fullGameOverScreenFrames() {
    return 3;
  },
  highScoreScreenFrames() {
    return 2;
  },
  playSound(name) {
    events.push(["sound", name]);
  },
  resetTitleIdleTimer() {
    events.push(["resetTitleIdle"]);
  },
  stopAllAudio() {
    events.push(["stopAll"]);
  },
  stopGameOverAudio() {
    events.push(["stopGameOver"]);
  },
  stopStageResultAudio() {
    events.push(["stopResult"]);
  }
});

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), [
  "startFullGameOverScreen",
  "updateFullGameOverScreen",
  "handleFullGameOverInput",
  "finishFullGameOverScreen",
  "startHighScoreScreen",
  "updateHighScoreScreen",
  "returnToTitleAfterGame"
]);
assert.equal(state.fn.startHighScoreScreen, api.startHighScoreScreen);

api.startFullGameOverScreen();
assert.equal(state.game.screen, "fullGameOver");
assert.equal(state.game.paused, false);
assert.equal(state.game.fullGameOverElapsed, 0);
assert.deepEqual(events, [["stopResult"], ["sound", "gameOver"]]);
assert.equal(api.handleFullGameOverInput("Space"), false);
api.updateFullGameOverScreen();
api.updateFullGameOverScreen();
assert.equal(state.game.fullGameOverElapsed, 2);
api.updateFullGameOverScreen();
assert.equal(state.game.screen, "title");
assert.deepEqual(events.slice(-3), [["stopGameOver"], ["stopAll"], ["resetTitleIdle"]]);
assert.equal(state.game.newHighScoreAtGameOver, false);
assert.equal(state.game.stageResultReason, "clear");
assert.equal(state.game.constructionUsed, false);
assert.equal(state.game.constructionVisits, 0);
assert.equal(state.game.hiddenInputCount, 0);

events.length = 0;
state.game.newHighScoreAtGameOver = true;
api.startFullGameOverScreen();
assert.equal(api.handleFullGameOverInput("Enter"), true);
assert.equal(state.game.screen, "highScore");
assert.equal(state.game.highScoreScreenElapsed, 0);
assert.deepEqual(events, [
  ["stopResult"],
  ["sound", "gameOver"],
  ["stopGameOver"],
  ["sound", "highScore"]
]);
api.updateHighScoreScreen();
assert.equal(state.game.screen, "highScore");
api.updateHighScoreScreen();
assert.equal(state.game.screen, "title");
assert.equal(state.game.highScoreScreenElapsed, 0);

console.log("post-game-runtime unit test passed");
