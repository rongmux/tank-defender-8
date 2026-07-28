const assert = require("assert").strict;
const runtime = require("../../src/runtime/stage-flow-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupStageFlowRuntime({}, {}, {}),
  /state\.game must be an object/
);

const events = [];
const players = [{ id: 1 }, { id: 2 }];
const state = {
  game: {
    players,
    stage: 35,
    customGrid: false,
    clearPendingTimer: 9,
    playerGameOverMessage: { active: true },
    stageResultReason: "clear",
    stageClearElapsed: 12,
    stageClearBonusPlayerIds: [],
    stageClearBonusAwarded: true,
    screen: "playing",
    transitionTimer: 0,
    constructionStageActive: true,
    gameOverTimer: 0
  },
  fn: {}
};
const api = runtime.setupStageFlowRuntime(state, {}, {
  awardPendingStageClearBonus() {
    events.push("award");
  },
  gameSettings() {
    return { timings: { gameOverSlide: 127, gameOverHold: 129 } };
  },
  resetTitleIdleTimer() {
    events.push("resetTitleIdle");
  },
  stageAdvanceResult(stage) {
    events.push(["advance", stage]);
    return stage === 35
      ? { stage: 36, stops: false }
      : { stage: 1, stops: true };
  },
  stageClearBonusRecipients(resultPlayers) {
    assert.equal(resultPlayers, players);
    return [players[1]];
  },
  stageCurtainCloseFrames() {
    return 64;
  },
  stageResultDuration(resultPlayers) {
    assert.equal(resultPlayers, players);
    return 44;
  },
  startFullGameOverScreen() {
    events.push("fullGameOver");
  },
  startStage(stage) {
    events.push(["startStage", stage]);
  },
  stopGameplayAudioBeforeResult() {
    events.push("stopGameplay");
  },
  stopStageResultAudio() {
    events.push("stopResult");
  }
});

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), [
  "enterStageClear",
  "enterStageResult",
  "finishStageResult",
  "finishStageClearClosing",
  "finishGameOverScreen",
  "gameOverFieldDuration"
]);
assert.equal(state.fn.enterStageResult, api.enterStageResult);
assert.equal(api.gameOverFieldDuration(), 256);

api.enterStageClear();
assert.equal(state.game.screen, "stageClear");
assert.equal(state.game.stageResultReason, "clear");
assert.equal(state.game.clearPendingTimer, 0);
assert.equal(state.game.stageClearElapsed, 0);
assert.deepEqual(state.game.stageClearBonusPlayerIds, [2]);
assert.equal(state.game.stageClearBonusAwarded, false);
assert.equal(state.game.transitionTimer, 44);
assert.deepEqual(events, ["stopGameplay"]);

api.finishStageResult();
assert.equal(state.game.screen, "stageClearClosing");
assert.equal(state.game.constructionStageActive, false);
assert.equal(state.game.transitionTimer, 64);
assert.deepEqual(events.slice(-3), ["stopResult", "award", ["advance", 35]]);

api.finishStageClearClosing();
assert.equal(state.game.stage, 36);
assert.deepEqual(events.slice(-2), [["advance", 35], ["startStage", 36]]);

state.game.stage = 35;
state.game.stageResultReason = "gameOver";
state.game.customGrid = false;
api.finishStageResult();
assert.equal(state.game.stage, 36);
assert.deepEqual(events.slice(-3), ["stopResult", ["advance", 35], "fullGameOver"]);

state.game.stage = 35;
state.game.customGrid = true;
state.game.stageResultReason = "clear";
api.finishStageResult();
assert.equal(state.game.screen, "stageClearClosing");

state.game.customGrid = false;
state.game.screen = "gameOver";
api.finishGameOverScreen();
assert.equal(state.game.screen, "stageClear");
assert.equal(state.game.stageResultReason, "gameOver");
assert.deepEqual(state.game.stageClearBonusPlayerIds, []);

state.game.customGrid = true;
state.game.stageResultReason = "clear";
state.game.screen = "stageClear";
api.finishStageResult();
assert.equal(state.game.screen, "stageClearClosing");

state.game.customGrid = false;
state.game.stage = 36;
api.finishStageResult();
assert.equal(state.game.screen, "title");
assert.deepEqual(events.slice(-3), ["award", ["advance", 36], "resetTitleIdle"]);

console.log("stage-flow-runtime unit test passed");
