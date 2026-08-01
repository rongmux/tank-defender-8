const assert = require("assert").strict;
const runtime = require("../../src/runtime/editor-render-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupEditorRenderRuntime({}, {}, {}),
  /state\.game must be an object/
);

const calls = [];
const state = {
  ctx: {
    fillStyle: "",
    strokeStyle: "",
    fillRect(...args) {
      calls.push(["fillRect", ...args]);
    },
    strokeRect(...args) {
      calls.push(["strokeRect", ...args]);
    }
  },
  game: {
    stage: 3,
    editorGrid: null,
    editorCursor: { qc: 2, qr: 4 },
    editorTick: 0,
    editorBrush: "brick"
  },
  fn: {}
};
const api = runtime.setupEditorRenderRuntime(state, {
  sharedState: {
    SCREEN_W: 256,
    SCREEN_H: 240,
    FIELD_X: 16,
    FIELD_Y: 16,
    FIELD_W: 208,
    FIELD_H: 208,
    TILE: 16,
    QUAD_GRID: 26
  },
  EDITOR_TILE_TYPES: ["empty", "brick", "steel", "water", "forest", "ice"],
  BRICK: "brick",
  STEEL: "steel",
  WATER: "water",
  FOREST: "forest",
  ICE: "ice"
}, {
  createStageGrid(stage) {
    calls.push(["createGrid", stage]);
    return [[{ type: "empty" }]];
  },
  drawBrickCell(...args) {
    calls.push(["brick", ...args]);
  },
  drawForest(...args) {
    calls.push(["forest", ...args]);
  },
  drawIce(...args) {
    calls.push(["ice", ...args]);
  },
  drawManifestSprite(...args) {
    calls.push(["sprite", ...args]);
  },
  drawWallCell(...args) {
    calls.push(["wall", ...args]);
  },
  drawWater(...args) {
    calls.push(["water", ...args]);
  },
  renderBase(...args) {
    calls.push(["base", ...args]);
  },
  renderTerrain(...args) {
    calls.push(["terrain", ...args]);
  }
});

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), ["drawTileLegend", "renderEditor"]);
assert.equal(state.fn.renderEditor, api.renderEditor);

api.renderEditor();
assert.deepEqual(calls.slice(0, 15), [
  ["createGrid", 3],
  ["fillRect", 0, 0, 256, 240],
  ["fillRect", 16, 16, 208, 208],
  ["terrain", false, [[{ type: "empty" }]]],
  ["base"],
  ["terrain", true, [[{ type: "empty" }]]],
  ["strokeRect", 32, 48, 15, 15],
  ["strokeRect", 33, 49, 13, 13],
  ["strokeRect", 32, 48, 7, 7],
  ["strokeRect", 33, 49, 5, 5],
  ["fillRect", 32, 48, 2, 2],
  ["fillRect", 38, 48, 2, 2],
  ["fillRect", 32, 54, 2, 2],
  ["fillRect", 38, 54, 2, 2]
]);

state.game.editorTick = 16;
calls.length = 0;
api.renderEditor();
assert(calls.some((call) => call[0] === "strokeRect" && call[1] === 32 && call[2] === 48));

calls.length = 0;
api.drawTileLegend(40, 60);
assert.deepEqual(calls.filter((call) => call[0] === "fillRect").slice(0, 6), [
  ["fillRect", 40, 60, 10, 10],
  ["fillRect", 54, 60, 10, 10],
  ["fillRect", 40, 78, 10, 10],
  ["fillRect", 54, 78, 10, 10],
  ["fillRect", 40, 96, 10, 10],
  ["fillRect", 54, 96, 10, 10]
]);
assert(calls.some((call) => call[0] === "brick" && call[1] === 54 && call[2] === 60));
assert(calls.some((call) => call[0] === "wall" && call[1] === 40 && call[2] === 78));
assert(calls.some((call) => call[0] === "water" && call[1] === 54 && call[2] === 78));
assert(calls.some((call) => call[0] === "forest" && call[1] === 40 && call[2] === 96));
assert(calls.some((call) => call[0] === "ice" && call[1] === 54 && call[2] === 96));
assert(calls.some((call) => call[0] === "strokeRect" && call[1] === 54 && call[2] === 60));

console.log("editor-render-runtime unit test passed");
