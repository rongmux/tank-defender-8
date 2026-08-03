const assert = require("assert").strict;
const inputCommandRuntime = require("../../src/runtime/input-command-runtime");
const inputRuntime = require("../../src/runtime/input-runtime");

assert.equal(Object.isFrozen(inputRuntime), true);
assert.throws(
  () => inputRuntime.setupInputRuntime({}, {}, {}),
  /state\.game must be an object/
);

const calls = [];
const listeners = {};
const canvasListeners = {};
const buttons = [{
  dataset: { action: "two" },
  addEventListener(type, listener) {
    this.listeners = this.listeners || {};
    this.listeners[type] = listener;
  }
}];
const document = {
  querySelectorAll(selector) {
    assert.equal(selector, "[data-action]");
    return buttons;
  }
};
const window = {
  addEventListener(type, listener) {
    listeners[type] = listener;
  }
};
const canvas = {
  addEventListener(type, listener) {
    canvasListeners[type] = listener;
  },
  getBoundingClientRect() {
    return { left: 10, top: 20, width: 512, height: 480 };
  }
};
const game = {
  screen: "title",
  demoMode: false,
  paused: false,
  clearPendingTimer: 0,
  baseDestroyTimer: 0,
  stage: 1,
  editorCursor: { qc: -1, qr: -1 }
};
const state = {
  game,
  canvas,
  packFileInput: null,
  keys: new Set(),
  pendingFirePresses: new Set(["Space"]),
  pendingStageSelectPresses: new Set(),
  fn: {}
};
const deps = {
  dom: { document, window },
  inputCommandRuntime,
  isEditorDirectionCode(code) {
    return ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD"].includes(code);
  },
  sharedState: {
    SCREEN_W: 256,
    SCREEN_H: 240,
    TILE: 16,
    HALF: 8,
    FIELD_X: 16,
    FIELD_Y: 16,
    PANEL_X: 224
  }
};
const callbackNames = [
  "activateTitleMenu", "beginStageSelect", "clearEditorStage", "cycleEditorCell", "cycleEditorQuadrant",
  "endTitleDemo", "enterEditor", "exitEditorToTitle", "exportEditorStage", "handleFullGameOverInput",
  "hiddenMessageTriggerReady", "importStagePackFile", "initAudio", "loadEditorStage", "loadStagePackJsonText",
  "moveEditorFromCode", "moveTitleMenu", "nextStage", "paintEditorCell", "paintEditorQuadrant", "playSound",
  "recordHiddenTitleInput", "reserveTitleDirectionForHiddenInput", "restoreBuiltInStagePack", "saveEditorStage",
  "selectEditorBrush", "setTitleMenu", "showEditorMessage", "stageEnemiesCleared", "startHiddenMessage",
  "startSelectedGame", "syncBaseHitAudioNodes", "syncBonusLifeAudioNodes", "syncBrickHitAudioNodes",
  "syncEnemyDestroyAudioNodes", "syncEnemyHitAudioNodes", "syncMovementAudio", "syncMovementIceAudioNodes",
  "syncPauseAudioNodes", "syncPlayerDestroyAudioNodes", "syncPlayerShootAudioNodes", "syncPowerUpAppearAudioNodes",
  "syncPowerUpPickupAudioNodes", "syncStageStartAudioNodes", "syncSteelHitAudioNodes", "testEditorStage",
  "useOriginalEditorButton"
];
const callbacks = Object.fromEntries(callbackNames.map((name) => [name, (...args) => calls.push([name, ...args])]))
callbacks.hiddenMessageTriggerReady = () => false;
callbacks.recordHiddenTitleInput = () => false;
callbacks.reserveTitleDirectionForHiddenInput = () => false;
callbacks.stageEnemiesCleared = () => false;

const api = inputRuntime.setupInputRuntime(state, deps, callbacks);
assert.equal(Object.isFrozen(api), true);
assert.equal(state.fn.handleAction, api.handleAction);
assert.equal(state.fn.togglePause, api.togglePause);
assert.equal(api.isPauseInputCode("Enter"), true);
assert.equal(api.isPauseInputCode("Escape"), false);

buttons[0].listeners.click();
assert.deepEqual(calls.slice(0, 3), [
  ["initAudio"],
  ["setTitleMenu", 1],
  ["beginStageSelect", 2]
]);

calls.length = 0;
listeners.keydown({ code: "KeyS", repeat: false, preventDefault() {} });
assert.deepEqual(calls, [["initAudio"], ["moveTitleMenu", 1]]);
listeners.keyup({ code: "KeyS" });

calls.length = 0;
game.screen = "playing";
assert.equal(api.togglePause(), true);
assert.equal(game.paused, true);
assert.equal(state.pendingFirePresses.size, 0);
assert.deepEqual(calls, [
  ["syncStageStartAudioNodes"],
  ["syncBonusLifeAudioNodes"],
  ["syncPowerUpPickupAudioNodes"],
  ["syncPowerUpAppearAudioNodes"],
  ["syncBrickHitAudioNodes"],
  ["syncBaseHitAudioNodes"],
  ["syncSteelHitAudioNodes"],
  ["syncEnemyHitAudioNodes"],
  ["syncEnemyDestroyAudioNodes"],
  ["syncPlayerDestroyAudioNodes"],
  ["syncPlayerShootAudioNodes"],
  ["syncMovementIceAudioNodes"],
  ["syncPauseAudioNodes"],
  ["syncMovementAudio"],
  ["playSound", "pause"]
]);

calls.length = 0;
listeners.keydown({ code: "KeyP", repeat: false, preventDefault() {} });
assert.equal(game.paused, false);
assert.equal(state.pendingFirePresses.size, 0);
assert.equal(calls.includes("bad"), false);

game.screen = "editor";
calls.length = 0;
listeners.keydown({ code: "Digit2", repeat: false, preventDefault() {} });
assert.deepEqual(calls, [["initAudio"], ["selectEditorBrush", 2]]);
canvasListeners.mousemove({ clientX: 98, clientY: 84 });
assert.deepEqual(game.editorCursor, { qc: 3, qr: 2 });
canvasListeners.click({ clientX: 98, clientY: 84, shiftKey: false, altKey: false });
assert.deepEqual(calls.slice(-2), [["initAudio"], ["paintEditorQuadrant", 3, 2]]);

assert.equal(api.canvasToGame({ clientX: 266, clientY: 260 }).x, 128);
assert.equal(api.canvasToGame({ clientX: 266, clientY: 260 }).y, 120);

console.log("input-runtime unit test passed");
