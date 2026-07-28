const assert = require("assert").strict;
const runtime = require("../../src/runtime/screen-update-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupScreenUpdateRuntime({}, {}, {}),
  /state\.game must be an object/
);

const events = [];
const state = {
  game: {
    screen: "title",
    editorMessageTimer: 2,
    transitionTimer: 0,
    stageClearElapsed: 0,
    stageResultReason: "clear",
    stageClearBonusAwarded: false,
    gameOverTimer: 0,
    pauseElapsed: 0,
    paused: false
  },
  fn: {}
};
let presentationCall = 0;
const callbacks = {};
const callbackNames = [
  "advanceFrameCounters",
  "awardPendingStageClearBonus",
  "checkEndState",
  "finishGameOverScreen",
  "finishStageClearClosing",
  "finishStageResult",
  "playSound",
  "resetFrameCounterHigh",
  "stageClearPresentation",
  "stageResultVisibleKillCount",
  "syncMovementAudio",
  "updateAudio",
  "updateBattle",
  "updateEditorControls",
  "updateExplosions",
  "updateFullGameOverScreen",
  "updateHighScoreScreen",
  "updateHiddenMessage",
  "updateScorePopups",
  "updateStageSelectControls",
  "updateTitleIdle"
];
for (const name of callbackNames) {
  callbacks[name] = (...args) => {
    events.push([name, ...args]);
    if (name === "stageClearPresentation") {
      presentationCall += 1;
      return { bonusRevealFrame: 1, visibleKills: presentationCall - 1 };
    }
    if (name === "stageResultVisibleKillCount") return args[0].visibleKills;
  };
}

const api = runtime.setupScreenUpdateRuntime(state, {}, callbacks);
assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), ["updateFrame"]);
assert.equal(state.fn.updateFrame, api.updateFrame);

api.updateFrame();
assert.equal(state.game.editorMessageTimer, 1);
assert.deepEqual(events, [["advanceFrameCounters"], ["updateAudio"], ["updateTitleIdle"]]);

events.length = 0;
state.game.screen = "stageSelectClosing";
state.game.transitionTimer = 1;
api.updateFrame();
assert.equal(state.game.screen, "stageSelect");
assert.deepEqual(events, [["advanceFrameCounters"], ["updateAudio"]]);

events.length = 0;
state.game.screen = "stageIntro";
state.game.transitionTimer = 1;
api.updateFrame();
assert.equal(state.game.screen, "playing");
assert.deepEqual(events, [
  ["advanceFrameCounters"], ["updateAudio"],
  ["resetFrameCounterHigh"], ["syncMovementAudio"]
]);

events.length = 0;
state.game.screen = "stageClear";
state.game.transitionTimer = 1;
state.game.stageClearElapsed = 0;
state.game.stageClearBonusAwarded = false;
presentationCall = 0;
api.updateFrame();
assert.equal(state.game.stageClearElapsed, 1);
assert.equal(state.game.stageClearBonusAwarded, false);
assert.deepEqual(events, [
  ["advanceFrameCounters"], ["updateAudio"],
  ["stageClearPresentation"],
  ["stageResultVisibleKillCount", { bonusRevealFrame: 1, visibleKills: 0 }],
  ["stageClearPresentation"],
  ["stageResultVisibleKillCount", { bonusRevealFrame: 1, visibleKills: 1 }],
  ["playSound", "scoreCount"], ["awardPendingStageClearBonus"],
  ["updateExplosions"], ["updateScorePopups"], ["finishStageResult"]
]);

events.length = 0;
state.game.screen = "gameOver";
state.game.gameOverTimer = 1;
api.updateFrame();
assert.equal(state.game.gameOverTimer, 0);
assert.deepEqual(events, [
  ["advanceFrameCounters"], ["updateAudio"],
  ["updateBattle", { playerInputEnabled: false, checkEnding: false }]
]);

events.length = 0;
state.game.screen = "editor";
api.updateFrame();
assert.deepEqual(events, [["advanceFrameCounters"], ["updateAudio"], ["updateEditorControls"]]);

events.length = 0;
state.game.screen = "playing";
state.game.paused = true;
api.updateFrame();
assert.equal(state.game.pauseElapsed, 1);
assert.deepEqual(events, [
  ["advanceFrameCounters"], ["updateAudio"], ["updateScorePopups"],
  ["checkEndState"], ["syncMovementAudio"]
]);

events.length = 0;
state.game.paused = false;
api.updateFrame();
assert.deepEqual(events, [["advanceFrameCounters"], ["updateAudio"], ["updateBattle"]]);

console.log("screen-update-runtime unit test passed");
