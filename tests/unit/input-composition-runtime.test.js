const assert = require("assert").strict;
const runtime = require("../../src/runtime/input-composition-runtime");

assert.equal(Object.isFrozen(runtime), true);
assert.throws(
  () => runtime.setupInputCompositionRuntime(),
  /state must be an object/
);

const callbackNames = [
  "activateTitleMenu",
  "beginStageSelect",
  "clearEditorStage",
  "cycleEditorCell",
  "cycleEditorQuadrant",
  "endTitleDemo",
  "enterEditor",
  "exitEditorToTitle",
  "exportEditorStage",
  "handleFullGameOverInput",
  "hiddenMessageTriggerReady",
  "importStagePackFile",
  "initAudio",
  "loadEditorStage",
  "loadStagePackJsonText",
  "moveEditorFromCode",
  "moveTitleMenu",
  "nextStage",
  "paintEditorCell",
  "paintEditorQuadrant",
  "playSound",
  "recordHiddenTitleInput",
  "reserveTitleDirectionForHiddenInput",
  "restoreBuiltInStagePack",
  "saveEditorStage",
  "selectEditorBrush",
  "setTitleMenu",
  "showEditorMessage",
  "stageEnemiesCleared",
  "startHiddenMessage",
  "startSelectedGame",
  "syncBaseHitAudioNodes",
  "syncBonusLifeAudioNodes",
  "syncBrickHitAudioNodes",
  "syncEnemyDestroyAudioNodes",
  "syncEnemyHitAudioNodes",
  "syncMovementAudio",
  "syncMovementIceAudioNodes",
  "syncPauseAudioNodes",
  "syncPlayerDestroyAudioNodes",
  "syncPlayerShootAudioNodes",
  "syncPowerUpAppearAudioNodes",
  "syncPowerUpPickupAudioNodes",
  "syncStageStartAudioNodes",
  "syncSteelHitAudioNodes",
  "testEditorStage",
  "useOriginalEditorButton"
];
const fn = Object.fromEntries(callbackNames.map((name) => [name, function () {}]));
const state = { game: {}, fn };
const dom = {
  document: { querySelectorAll() { return []; } },
  window: { addEventListener() {} }
};
const sharedState = { SCREEN_W: 256, SCREEN_H: 240 };
const inputRuntimeApi = Object.freeze({ handleAction() {} });
let received;
const deps = {
  dom,
  isEditorDirectionCode() { return true; },
  requireRuntimeModule(name) {
    assert.equal(name, "inputRuntime");
    return {
      setupInputRuntime(receivedState, receivedDeps, callbacks) {
        received = { receivedState, receivedDeps, callbacks };
        return inputRuntimeApi;
      }
    };
  },
  sharedState
};

const api = runtime.setupInputCompositionRuntime(state, deps);
assert.equal(Object.isFrozen(api), true);
assert.equal(api.inputRuntime, inputRuntimeApi);
assert.equal(received.receivedState, state);
assert.deepEqual(received.receivedDeps, {
  dom,
  isEditorDirectionCode: deps.isEditorDirectionCode,
  sharedState
});
assert.deepEqual(Object.keys(received.callbacks), callbackNames);
callbackNames.filter((name) => name !== "stageEnemiesCleared").forEach((name) => {
  assert.equal(received.callbacks[name], fn[name], name + " should preserve state.fn identity");
});
assert.notEqual(received.callbacks.stageEnemiesCleared, fn.stageEnemiesCleared);
assert.equal(received.callbacks.stageEnemiesCleared(), undefined);

console.log("input-composition-runtime unit test passed");
