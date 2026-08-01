const assert = require("assert").strict;
const runtime = require("../../src/runtime/editor-lifecycle-runtime");

assert.equal(Object.isFrozen(runtime), true);
assert.throws(
  () => runtime.setupEditorLifecycleRuntime(),
  /state must be an object/
);
assert.throws(
  () => runtime.setupEditorLifecycleRuntime({}, {}),
  /state\.game must be an object/
);
assert.throws(
  () => runtime.setupEditorLifecycleRuntime({ game: {} }, {}),
  /state\.fn must be an object/
);
assert.throws(
  () => runtime.setupEditorLifecycleRuntime({ game: {}, fn: {} }, {}),
  /deps\.sharedState must be an object/
);

const events = [];
const originalGrid = { id: "original" };
const clearedGrid = { id: "cleared" };
const loadedGrid = { id: "loaded" };
let savedStage = null;
let normalized = { ok: true };
const state = {
  game: {
    constructionVisits: 0,
    constructionUsed: false,
    constructedGrid: null,
    constructionStageActive: true,
    customGrid: { id: "temporary" },
    demoMode: true,
    editorGrid: null,
    editorMoveHoldTimer: 9,
    hiddenInputCount: 5,
    paused: true,
    screen: "title",
    stage: 8,
    stagePack: { id: "original-style" }
  },
  fn: {},
  packFileInput: {
    clicks: 0,
    click() {
      this.clicks += 1;
    }
  }
};
const fn = state.fn;
for (const name of [
  "stopMovementAudio", "stopStageStartAudio", "stopBonusLifeAudio", "stopPowerUpPickupAudio",
  "stopPowerUpAppearAudio", "stopPauseAudio", "stopBrickHitAudio", "stopEnemyHitAudio",
  "stopBaseHitAudio", "stopEnemyDestroyAudio", "stopPlayerDestroyAudio", "stopSteelHitAudio",
  "stopPlayerShootAudio", "stopMovementIceAudio", "stopScoreCountAudio", "stopStageBonusAudio"
]) {
  fn[name] = () => events.push(name);
}
fn.initAudio = () => events.push("initAudio");
fn.playSound = (name) => events.push(["playSound", name]);
fn.resetTitleIdleTimer = () => events.push("resetTitleIdleTimer");
fn.startGame = (players, options) => events.push(["startGame", players, options]);

const deps = {
  ORIGINAL_EDITOR_PATTERNS: [{ type: "brick" }],
  sharedState: { EDITOR_STORAGE_KEY: "editor-stage" },
  cloneGrid(grid) {
    return { ...grid, cloned: true };
  },
  createEditorStagePack(grid) {
    assert.equal(grid, state.game.editorGrid);
    return { quadrants: [["quad"]] };
  },
  makeOriginalConstructionGrid() {
    return state.game.editorGrid ? clearedGrid : originalGrid;
  },
  parseEditorStageText(text) {
    assert.equal(text, "stored-stage");
    return { ok: true, grid: loadedGrid };
  },
  parseStageQuadrants(quadrants) {
    assert.deepEqual(quadrants, ["quad"]);
    return { id: "battle-grid" };
  },
  serializeEditorStage(grid) {
    return `saved:${grid.id}`;
  },
  serializeEditorStagePack(grid) {
    return `pack:${grid.id}`;
  },
  tryNormalizeStagePack() {
    return normalized;
  }
};

const previousStorageDescriptor = Object.getOwnPropertyDescriptor(global, "localStorage");
Object.defineProperty(global, "localStorage", {
  configurable: true,
  value: {
    getItem(key) {
      assert.equal(key, "editor-stage");
      return "stored-stage";
    },
    setItem(key, value) {
      savedStage = { key, value };
    }
  }
});

const api = runtime.setupEditorLifecycleRuntime(state, deps);
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), [
  "clearEditorStage",
  "enterEditor",
  "exitEditorToTitle",
  "exportEditorStage",
  "importStagePackFile",
  "loadEditorStage",
  "saveEditorStage",
  "showEditorMessage",
  "testEditorStage"
]);
assert.equal(fn.enterEditor, api.enterEditor);

api.enterEditor();
assert.equal(state.game.screen, "editor");
assert.equal(state.game.paused, false);
assert.equal(state.game.editorGrid, originalGrid);
assert.equal(state.game.editorBrush, "brick");
assert.equal(state.game.editorMessage, "EDIT");
assert.equal(state.game.editorMessageTimer, 120);
assert.equal(events.at(-1), "initAudio");

api.saveEditorStage();
assert.deepEqual(savedStage, { key: "editor-stage", value: "saved:original" });
assert.deepEqual(events.at(-1), ["playSound", "editorSave"]);

api.loadEditorStage();
assert.equal(state.game.editorGrid, loadedGrid);
assert.equal(state.game.editorMessage, "LOADED");
assert.deepEqual(events.at(-1), ["playSound", "editorLoad"]);

api.clearEditorStage();
assert.equal(state.game.editorGrid, clearedGrid);
assert.equal(state.game.editorMessage, "CLEAR");
assert.deepEqual(events.at(-1), ["playSound", "editorClear"]);

state.game.editorGrid = { id: "test" };
events.length = 0;
api.testEditorStage();
assert.deepEqual(events, [["startGame", 1, { stage: 1, customGrid: { id: "battle-grid" } }]]);
assert.equal(state.game.stagePack.id, "original-style");

normalized = { ok: false };
api.testEditorStage();
assert.equal(state.game.editorMessage, "BAD");

api.exitEditorToTitle();
assert.deepEqual(state.game.constructedGrid, { id: "test", cloned: true });
assert.equal(state.game.constructionVisits, 1);
assert.equal(state.game.constructionUsed, true);
assert.equal(state.game.customGrid, null);
assert.equal(state.game.constructionStageActive, false);
assert.equal(state.game.stage, 1);
assert.equal(state.game.screen, "title");
assert.equal(state.game.demoMode, false);
assert.equal(events.at(-1), "resetTitleIdleTimer");

api.importStagePackFile();
assert.equal(state.packFileInput.clicks, 1);
state.packFileInput = null;
api.importStagePackFile();
assert.equal(state.game.editorMessage, "NOFILE");

if (previousStorageDescriptor) Object.defineProperty(global, "localStorage", previousStorageDescriptor);
else delete global.localStorage;

console.log("editor-lifecycle-runtime unit test passed");
