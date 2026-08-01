const assert = require("assert").strict;
const runtime = require("../../src/runtime/title-flow-runtime");

assert.equal(Object.isFrozen(runtime), true);
assert.throws(() => runtime.setupTitleFlowRuntime(), /state must be an object/);
assert.throws(
  () => runtime.setupTitleFlowRuntime({ game: {}, fn: {}, keys: new Set(), pendingFirePresses: new Set() }, {}),
  /deps\.sharedState must be an object/
);

const calls = [];
const state = {
  game: {
    constructionUsed: false,
    constructionVisits: 7,
    demoMode: false,
    frameHigh: 0x0a,
    hiddenInputCount: 0,
    hiddenMessageElapsed: 0,
    paused: true,
    screen: "title",
    titleIdleFrames: 0
  },
  fn: {
    activateTitleMenu() {
      calls.push("activateTitleMenu");
    },
    resetFrameCounterHigh() {
      calls.push("resetFrameCounterHigh");
    },
    startTitleDemo() {
      calls.push("startTitleDemo");
    }
  },
  keys: new Set(),
  pendingFirePresses: new Set(["Enter"])
};
const sharedState = {
  HIDDEN_MESSAGE_REQUIRED_VISITS: 7,
  HIDDEN_MESSAGE_TEXT_START: 128,
  HIDDEN_MESSAGE_STEP_FRAMES: 64,
  HIDDEN_MESSAGE_DROP_START: 640,
  HIDDEN_MESSAGE_DROP_MORPH_FRAMES: 28,
  HIDDEN_MESSAGE_DROP_FALL_FRAMES: 218,
  HIDDEN_MESSAGE_END_FRAME: 887
};
const api = runtime.setupTitleFlowRuntime(state, {
  clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
  },
  sharedState
});

assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), [
  "updateTitleIdle",
  "resetTitleIdleTimer",
  "resetTitleIdleHighByte",
  "hiddenMessageTriggerReady",
  "reserveTitleDirectionForHiddenInput",
  "recordHiddenTitleInput",
  "startHiddenMessage",
  "updateHiddenMessage",
  "hiddenMessagePresentation"
]);
assert.equal(state.fn.hiddenMessagePresentation, api.hiddenMessagePresentation);

api.updateTitleIdle();
assert.equal(state.game.titleIdleFrames, 1);
assert.deepEqual(calls, ["startTitleDemo"]);
state.game.demoMode = true;
api.updateTitleIdle();
assert.equal(state.game.titleIdleFrames, 1);
state.game.demoMode = false;
api.resetTitleIdleTimer();
api.resetTitleIdleHighByte();
assert.equal(state.game.titleIdleFrames, 0);
assert.deepEqual(calls, ["startTitleDemo", "resetFrameCounterHigh", "resetFrameCounterHigh"]);

assert.equal(api.hiddenMessageTriggerReady(), false);
state.keys.add("ArrowDown");
for (let press = 0; press < 8; press += 1) assert.equal(api.recordHiddenTitleInput("KeyF"), true);
assert.equal(state.game.hiddenInputCount, 0x80);
state.keys.clear();
state.keys.add("ArrowRight");
for (let press = 0; press < 12; press += 1) assert.equal(api.recordHiddenTitleInput("KeyG"), true);
assert.equal(state.game.hiddenInputCount, 0x74);
assert.equal(api.hiddenMessageTriggerReady(), true);
assert.equal(api.reserveTitleDirectionForHiddenInput("ArrowRight"), true);
assert.equal(api.reserveTitleDirectionForHiddenInput("ArrowUp"), false);
state.game.screen = "stageSelect";
assert.equal(api.recordHiddenTitleInput("KeyG"), false);
state.game.screen = "title";

api.startHiddenMessage();
assert.equal(state.game.screen, "hiddenMessage");
assert.equal(state.game.paused, false);
assert.equal(state.game.demoMode, false);
assert.equal(state.game.hiddenMessageElapsed, 0);
assert.equal(state.pendingFirePresses.size, 0);
state.game.hiddenInputCount = 0x74;
state.game.hiddenMessageElapsed = 885;
api.updateHiddenMessage();
assert.equal(state.game.hiddenMessageElapsed, 886);
assert.equal(state.game.hiddenInputCount, 0x74);
api.updateHiddenMessage();
assert.equal(state.game.hiddenInputCount, 0);
assert.deepEqual(calls, ["startTitleDemo", "resetFrameCounterHigh", "resetFrameCounterHigh", "activateTitleMenu"]);

assert.deepEqual(api.hiddenMessagePresentation(-4), {
  frame: 0,
  visibleLines: [],
  dots: 0,
  drop: null
});
assert.equal(api.hiddenMessagePresentation(128).visibleLines.length, 1);
assert.equal(api.hiddenMessagePresentation(320).visibleLines.length, 4);
assert.equal(api.hiddenMessagePresentation(384).dots, 1);
assert.deepEqual(api.hiddenMessagePresentation(641).drop, { x: 120, y: 30, frame: "morph3" });
assert.deepEqual(api.hiddenMessagePresentation(669).drop, { x: 120, y: 31, frame: "fall" });

console.log("title-flow-runtime unit test passed");
