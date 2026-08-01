const assert = require("assert").strict;
const runtime = require("../../src/runtime/application-flow-composition-runtime");

assert.equal(Object.isFrozen(runtime), true);
assert.throws(
  () => runtime.setupApplicationFlowCompositionRuntime(),
  /state must be an object/
);
assert.throws(
  () => runtime.setupApplicationFlowCompositionRuntime({ game: {}, fn: {} }, {}, {}),
  /deps.requireRuntimeModule must be a function/
);

const setupOrder = [];
const fn = {
  playSound() {},
  showEditorMessage() {},
  initAudio() {},
  resetFrameCounterLow() {},
  resetTitleIdleTimer() {},
  startGame() {},
  stopAllAudio() {},
  stopGameOverAudio() {},
  stopStageResultAudio() {}
};
const setupCallbacks = {};
const setupMethods = {
  gameLifecycle: "setupGameLifecycle",
  audioBridge: "setupAudioBridge",
  editorInputRuntime: "setupEditorInputRuntime",
  stageSelectRuntime: "setupStageSelectRuntime",
  postGameRuntime: "setupPostGameRuntime"
};
const state = { game: {}, fn };
const deps = {
  FULL_GAME_OVER_SCREEN_FRAMES: 100,
  HIGH_SCORE_SCREEN_FRAMES: 200,
  requireRuntimeModule(name) {
    return {
      [setupMethods[name]](receivedState, receivedDeps, callbacks) {
        assert.equal(receivedState, state);
        assert.equal(receivedDeps, deps);
        setupOrder.push(name);
        setupCallbacks[name] = callbacks;
      }
    };
  }
};
const api = runtime.setupApplicationFlowCompositionRuntime(
  state,
  deps,
  { tileTypeName() { return "brick"; } }
);

assert.equal(Object.isFrozen(api), true);
assert.deepEqual(setupOrder, [
  "gameLifecycle",
  "audioBridge",
  "editorInputRuntime",
  "stageSelectRuntime",
  "postGameRuntime"
]);
assert.equal(setupCallbacks.editorInputRuntime.playSound, fn.playSound);
assert.equal(setupCallbacks.editorInputRuntime.showEditorMessage, fn.showEditorMessage);
assert.equal(typeof setupCallbacks.editorInputRuntime.tileTypeName, "function");
assert.equal(setupCallbacks.stageSelectRuntime.initAudio, fn.initAudio);
assert.equal(setupCallbacks.stageSelectRuntime.resetTitleIdleTimer, fn.resetTitleIdleTimer);
assert.equal(setupCallbacks.stageSelectRuntime.startGame, fn.startGame);
assert.equal(typeof setupCallbacks.stageSelectRuntime.resetFrameCounterLow, "function");
assert.equal(setupCallbacks.postGameRuntime.playSound, fn.playSound);
assert.equal(setupCallbacks.postGameRuntime.resetTitleIdleTimer, fn.resetTitleIdleTimer);
assert.equal(setupCallbacks.postGameRuntime.stopAllAudio, fn.stopAllAudio);
assert.equal(setupCallbacks.postGameRuntime.stopGameOverAudio, fn.stopGameOverAudio);
assert.equal(setupCallbacks.postGameRuntime.stopStageResultAudio, fn.stopStageResultAudio);
assert.equal(setupCallbacks.postGameRuntime.fullGameOverScreenFrames(), 100);
assert.equal(setupCallbacks.postGameRuntime.highScoreScreenFrames(), 200);

console.log("application-flow-composition-runtime unit test passed");
