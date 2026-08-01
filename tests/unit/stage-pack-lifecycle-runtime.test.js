const assert = require("assert").strict;
const runtime = require("../../src/runtime/stage-pack-lifecycle-runtime");

assert.equal(Object.isFrozen(runtime), true);
assert.throws(
  () => runtime.setupStagePackLifecycleRuntime(),
  /state must be an object/
);
assert.throws(
  () => runtime.setupStagePackLifecycleRuntime({}, {}, {}),
  /state\.game must be an object/
);
assert.throws(
  () => runtime.setupStagePackLifecycleRuntime({ game: {}, fn: {} }, {}, {}),
  /state\.stageRuntime\.createStageGrid must be a function/
);

const events = [];
const builtInPack = { id: "built-in" };
const normalizedPack = { id: "normalized" };
let parsed = { ok: false, error: "invalid JSON" };
let normalized = { ok: true, pack: normalizedPack };
const nextGrid = { id: "stage-one-grid" };
const state = {
  builtInStagePack: builtInPack,
  game: {
    constructionStageActive: true,
    constructionUsed: true,
    constructionVisits: 7,
    constructedGrid: { id: "constructed" },
    customGrid: { id: "custom" },
    demoMode: true,
    editorBrush: "steel",
    editorCursor: { qc: 6, qr: 8 },
    editorGrid: { id: "editor" },
    editorMoveHoldTimer: 9,
    editorPattern: 3,
    editorPatternArmed: true,
    editorTick: 32,
    grid: { id: "old-grid" },
    hiddenInputCount: 0x74,
    hiddenMessageElapsed: 12,
    paused: true,
    screen: "playing",
    stage: 8,
    stagePack: { id: "old-pack" },
    stageSelectPlayers: 2,
    titleMenu: 2
  },
  fn: {},
  stageRuntime: {
    createStageGrid(stage) {
      events.push(["createStageGrid", stage]);
      return nextGrid;
    }
  }
};
const deps = {
  TILE_TYPES: { BRICK: "brick" },
  parseJsonText(text) {
    events.push(["parseJsonText", text]);
    return parsed;
  },
  prepareBattleGrid(grid) {
    events.push(["prepareBattleGrid", grid]);
  },
  tryNormalizeStagePack(pack) {
    events.push(["tryNormalizeStagePack", pack]);
    return normalized;
  }
};
const callbacks = {
  clearTransientBattleState() {
    events.push(["clearTransientBattleState"]);
  },
  resetBattleRandom() {
    events.push(["resetBattleRandom"]);
  },
  resetTitleIdleTimer() {
    events.push(["resetTitleIdleTimer"]);
  }
};

const api = runtime.setupStagePackLifecycleRuntime(state, deps, callbacks);
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), [
  "applyStagePack",
  "loadStagePackJsonText",
  "loadStagePackObject",
  "restoreBuiltInStagePack"
]);
assert.equal(state.fn.applyStagePack, api.applyStagePack);

assert.deepEqual(api.loadStagePackJsonText("{"), { ok: false, error: "invalid JSON" });
assert.deepEqual(events, [["parseJsonText", "{"]]);
assert.equal(state.game.stagePack.id, "old-pack");

events.length = 0;
parsed = { ok: true, value: { id: "invalid" } };
normalized = { ok: false, error: "stage pack is invalid" };
assert.deepEqual(api.loadStagePackJsonText("invalid-pack"), { ok: false, error: "stage pack is invalid" });
assert.deepEqual(events, [
  ["parseJsonText", "invalid-pack"],
  ["tryNormalizeStagePack", { id: "invalid" }]
]);
assert.equal(state.game.stagePack.id, "old-pack");

events.length = 0;
parsed = { ok: true, value: { id: "valid" } };
normalized = { ok: true, pack: normalizedPack };
assert.deepEqual(api.loadStagePackJsonText("valid-pack"), { ok: true, error: "" });
assert.deepEqual(events, [
  ["parseJsonText", "valid-pack"],
  ["tryNormalizeStagePack", { id: "valid" }],
  ["resetTitleIdleTimer"],
  ["createStageGrid", 1],
  ["prepareBattleGrid", nextGrid],
  ["resetBattleRandom"],
  ["clearTransientBattleState"]
]);
assert.equal(state.game.stagePack, normalizedPack);
assert.equal(state.game.stage, 1);
assert.equal(state.game.titleMenu, 0);
assert.equal(state.game.demoMode, false);
assert.equal(state.game.constructionUsed, false);
assert.equal(state.game.constructionVisits, 0);
assert.equal(state.game.hiddenInputCount, 0);
assert.equal(state.game.hiddenMessageElapsed, 0);
assert.equal(state.game.customGrid, null);
assert.equal(state.game.constructedGrid, null);
assert.equal(state.game.constructionStageActive, false);
assert.equal(state.game.grid, nextGrid);
assert.equal(state.game.editorGrid, null);
assert.deepEqual(state.game.editorCursor, { qc: -1, qr: -1 });
assert.equal(state.game.editorPattern, 0);
assert.equal(state.game.editorPatternArmed, false);
assert.equal(state.game.editorMoveHoldTimer, 0);
assert.equal(state.game.editorTick, 0);
assert.equal(state.game.editorBrush, "brick");
assert.equal(state.game.stageSelectPlayers, 1);
assert.equal(state.game.screen, "title");
assert.equal(state.game.paused, false);

events.length = 0;
api.restoreBuiltInStagePack();
assert.equal(state.game.stagePack, builtInPack);
assert.deepEqual(events, [
  ["resetTitleIdleTimer"],
  ["createStageGrid", 1],
  ["prepareBattleGrid", nextGrid],
  ["resetBattleRandom"],
  ["clearTransientBattleState"]
]);

console.log("stage-pack-lifecycle-runtime unit test passed");
