const assert = require("assert").strict;
const runtime = require("../../src/runtime/stage-select-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupStageSelectRuntime({}, {}, {}),
  /state\.game must be an object/
);

const events = [];
const state = {
  game: {
    demoMode: true,
    frameLow: 0,
    paused: true,
    screen: "title",
    stage: 8,
    stageSelectPlayers: 1,
    transitionTimer: 0
  },
  fn: {},
  keys: new Set(),
  pendingStageSelectPresses: new Set(),
  stageRuntime: {
    stageCount() {
      return 40;
    }
  }
};
const api = runtime.setupStageSelectRuntime(state, {
  DEFAULT_ORIGINAL_STAGE_COUNT: 35,
  STAGE_CURTAIN_CLOSE_FRAMES: 16,
  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
}, {
  initAudio() {
    events.push("initAudio");
  },
  resetFrameCounterLow() {
    events.push("resetFrameCounterLow");
  },
  resetTitleIdleTimer() {
    events.push("resetTitleIdleTimer");
  },
  startGame(players, options) {
    events.push(["startGame", players, options]);
  }
});

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), [
  "beginStageSelect",
  "changeStageSelection",
  "stageSelectAHeld",
  "stageSelectBHeld",
  "stageSelectLimit",
  "startSelectedGame",
  "updateStageSelectControls"
]);
assert.equal(state.fn.updateStageSelectControls, api.updateStageSelectControls);
assert.equal(api.stageSelectLimit(), 35);

state.pendingStageSelectPresses.add("Space");
api.beginStageSelect(2);
assert.deepEqual(events, ["initAudio", "resetTitleIdleTimer"]);
assert.equal(state.game.demoMode, false);
assert.equal(state.game.stageSelectPlayers, 2);
assert.equal(state.game.stage, 1);
assert.equal(state.game.screen, "stageSelectClosing");
assert.equal(state.game.paused, false);
assert.equal(state.game.transitionTimer, 16);
assert.equal(state.pendingStageSelectPresses.size, 0);

events.length = 0;
state.game.stage = 35;
api.changeStageSelection(1);
assert.equal(state.game.stage, 35);
api.changeStageSelection(-3);
assert.equal(state.game.stage, 32);
assert.deepEqual(events, ["resetFrameCounterLow", "resetFrameCounterLow"]);

events.length = 0;
state.pendingStageSelectPresses.add("KeyX");
api.startSelectedGame();
assert.equal(state.pendingStageSelectPresses.size, 0);
assert.deepEqual(events, [["startGame", 2, { stage: 32 }]]);

events.length = 0;
assert.equal(api.stageSelectAHeld(new Set(["Space"])), true);
assert.equal(api.stageSelectAHeld(new Set(["KeyZ"])), true);
assert.equal(api.stageSelectAHeld(new Set(["KeyF"])), false);
assert.equal(api.stageSelectBHeld(new Set(["KeyF"])), true);
assert.equal(api.stageSelectBHeld(new Set(["KeyX"])), true);

state.pendingStageSelectPresses.add("Space");
api.updateStageSelectControls();
assert.deepEqual(events, ["resetFrameCounterLow"]);
assert.equal(state.pendingStageSelectPresses.size, 0);

state.keys.add("KeyF");
state.game.frameLow = 1;
api.updateStageSelectControls();
assert.deepEqual(events, ["resetFrameCounterLow"]);
state.game.frameLow = 8;
api.updateStageSelectControls();
assert.deepEqual(events, ["resetFrameCounterLow", "resetFrameCounterLow"]);

state.pendingStageSelectPresses.add("KeyZ");
state.pendingStageSelectPresses.add("KeyX");
api.updateStageSelectControls();
assert.deepEqual(events, ["resetFrameCounterLow", "resetFrameCounterLow", "resetFrameCounterLow"]);

console.log("stage-select-runtime unit test passed");
