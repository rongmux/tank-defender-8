const assert = require("assert").strict;
const editorRules = require("../../src/editor/editor-rules");
const runtime = require("../../src/runtime/editor-input-runtime");
const sharedState = require("../../src/runtime/shared-state");
const stageGrid = require("../../src/stages/stage-grid");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupEditorInputRuntime({}, {}, {}),
  /state\.game must be an object/
);

const events = [];
const state = {
  game: {
    screen: "editor",
    editorBrush: editorRules.EDITOR_TILE_TYPES[0],
    editorCursor: { qc: 0, qr: 0 },
    editorGrid: stageGrid.makeGrid(),
    editorMoveHoldTimer: 0,
    editorPattern: 0,
    editorPatternArmed: false,
    editorTick: 0
  },
  fn: {},
  keys: new Set()
};
const api = runtime.setupEditorInputRuntime(state, {
  ...editorRules,
  setTile: stageGrid.setTile,
  sharedState
}, {
  playSound(name, options) {
    events.push([name, options]);
  },
  showEditorMessage(message) {
    events.push(["message", message]);
  },
  tileTypeName(type) {
    return ["empty", "brick", "steel", "water", "forest", "ice"][type];
  }
});

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), [
  "moveEditorFromCode",
  "moveEditorCursor",
  "useOriginalEditorButton",
  "pasteOriginalEditorPattern",
  "editAtEditorCursor",
  "paintEditorCell",
  "paintEditorQuadrant",
  "selectEditorBrush",
  "selectEditorBrushFromPanel",
  "cycleEditorCell",
  "cycleEditorQuadrant",
  "updateEditorControls"
]);
assert.equal(state.fn.moveEditorCursor, api.moveEditorCursor);

api.moveEditorFromCode("KeyD");
assert.deepEqual(state.game.editorCursor, { qc: 2, qr: 0 });
assert.equal(state.game.editorMoveHoldTimer, 0);

api.moveEditorCursor(-1, 0);
api.useOriginalEditorButton(1);
assert.equal(state.game.editorPatternArmed, true);
assert.equal(state.game.editorGrid[0][0].type, editorRules.EDITOR_TILE_TYPES[1]);
assert.equal(state.game.editorGrid[0][0].mask, 10);
api.useOriginalEditorButton(1);
assert.equal(state.game.editorPattern, 1);
assert.equal(state.game.editorGrid[0][0].mask, 12);

api.selectEditorBrush(editorRules.EDITOR_TILE_TYPES[2]);
assert.equal(state.game.editorBrush, editorRules.EDITOR_TILE_TYPES[2]);
api.paintEditorCell(1, 1);
assert.equal(state.game.editorGrid[1][1].type, editorRules.EDITOR_TILE_TYPES[2]);
api.selectEditorBrush(editorRules.EDITOR_TILE_TYPES[1]);
api.paintEditorQuadrant(2, 2);
assert.equal(state.game.editorGrid[1][1].type, editorRules.EDITOR_TILE_TYPES[1]);
assert.equal(state.game.editorGrid[1][1].mask, 1);

api.cycleEditorCell(1, 1);
assert.equal(state.game.editorGrid[1][1].type, editorRules.EDITOR_TILE_TYPES[2]);
api.cycleEditorQuadrant(2, 2);
assert.equal(state.game.editorGrid[1][1].type, editorRules.EDITOR_TILE_TYPES[3]);

api.selectEditorBrushFromPanel(sharedState.PANEL_X + 26, 177);
assert.equal(state.game.editorBrush, editorRules.EDITOR_TILE_TYPES[1]);
assert(events.some((event) => event[0] === "message" && event[1] === "BRICK"));

state.game.editorCursor = { qc: 0, qr: 0 };
state.game.editorMoveHoldTimer = 0;
state.keys.add("ArrowDown");
for (let frame = 0; frame < 19; frame += 1) api.updateEditorControls();
assert.deepEqual(state.game.editorCursor, { qc: 0, qr: 0 });
api.updateEditorControls();
assert.deepEqual(state.game.editorCursor, { qc: 0, qr: 2 });
assert.equal(state.game.editorMoveHoldTimer, 15);

state.game.editorCursor = { qc: -1, qr: -1 };
api.editAtEditorCursor(true);
assert.equal(state.game.editorGrid[0][0].type, editorRules.EDITOR_TILE_TYPES[1]);

console.log("editor-input-runtime unit test passed");
