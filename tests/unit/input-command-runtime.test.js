const assert = require("assert").strict;
const runtime = require("../../src/runtime/input-command-runtime");

assert.equal(Object.isFrozen(runtime), true);
assert.throws(() => runtime.setupInputCommandRuntime(), /state must be an object/);
assert.throws(
  () => runtime.setupInputCommandRuntime({ game: {}, fn: {}, pendingFirePresses: new Set() }, {}),
  /callbacks\.beginStageSelect must be a function/
);

const calls = [];
const game = {
  baseDestroyTimer: 0,
  clearPendingTimer: 0,
  demoMode: false,
  pauseElapsed: 9,
  paused: false,
  screen: "title"
};
const state = {
  game,
  fn: {},
  pendingFirePresses: new Set(["Space"])
};
const callbackNames = [
  "beginStageSelect", "clearEditorStage", "enterEditor", "exportEditorStage", "importStagePackFile",
  "initAudio", "loadEditorStage", "nextStage", "playSound", "restoreBuiltInStagePack",
  "saveEditorStage", "setTitleMenu", "stageEnemiesCleared", "syncBaseHitAudioNodes",
  "syncBonusLifeAudioNodes", "syncBrickHitAudioNodes", "syncEnemyDestroyAudioNodes",
  "syncEnemyHitAudioNodes", "syncMovementAudio", "syncMovementIceAudioNodes",
  "syncPauseAudioNodes", "syncPlayerDestroyAudioNodes", "syncPlayerShootAudioNodes",
  "syncPowerUpAppearAudioNodes", "syncPowerUpPickupAudioNodes", "syncStageStartAudioNodes",
  "syncSteelHitAudioNodes", "testEditorStage"
];
const callbacks = Object.fromEntries(callbackNames.map((name) => [
  name,
  (...args) => calls.push([name, ...args])
]));
callbacks.stageEnemiesCleared = () => false;

const api = runtime.setupInputCommandRuntime(state, callbacks);
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), ["handleAction", "isPauseInputCode", "togglePause"]);
assert.equal(state.fn.handleAction, api.handleAction);

api.handleAction("two");
assert.deepEqual(calls, [
  ["initAudio"],
  ["setTitleMenu", 1],
  ["beginStageSelect", 2]
]);
calls.length = 0;
game.screen = "title";
api.handleAction("test");
assert.deepEqual(calls, [["initAudio"]]);
game.screen = "editor";
api.handleAction("test");
api.handleAction("save");
api.handleAction("load");
api.handleAction("clear");
api.handleAction("export");
api.handleAction("import");
api.handleAction("reset");
assert.deepEqual(calls, [
  ["initAudio"],
  ["initAudio"], ["testEditorStage"],
  ["initAudio"], ["saveEditorStage"],
  ["initAudio"], ["loadEditorStage"],
  ["initAudio"], ["clearEditorStage"],
  ["initAudio"], ["exportEditorStage"],
  ["initAudio"], ["importStagePackFile"],
  ["initAudio"], ["restoreBuiltInStagePack"]
]);

calls.length = 0;
game.screen = "playing";
assert.equal(api.togglePause(), true);
assert.equal(game.paused, true);
assert.equal(game.pauseElapsed, 0);
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
assert.equal(api.togglePause(), true);
assert.equal(game.paused, false);
assert.equal(calls.some((call) => call[0] === "playSound"), false);
assert.equal(api.isPauseInputCode("Enter"), true);
assert.equal(api.isPauseInputCode("KeyP"), true);
assert.equal(api.isPauseInputCode("Space"), false);

game.demoMode = true;
assert.equal(api.togglePause(), false);
game.demoMode = false;
game.clearPendingTimer = 1;
assert.equal(api.togglePause(), false);
game.clearPendingTimer = 0;
callbacks.stageEnemiesCleared = () => true;
assert.equal(api.togglePause(), false);

console.log("input-command-runtime unit test passed");
