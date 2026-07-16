const assert = require("assert").strict;
const editorRules = require("../../src/editor/editor-rules");
const stageGrid = require("../../src/stages/stage-grid");

const {
  EDITOR_TILE_TYPES,
  ORIGINAL_EDITOR_PATTERNS,
  editorBrushAt,
  editorCellForCursor,
  editorDirectionForCode,
  editorPatternAt,
  heldEditorDirection,
  isEditorDirectionCode,
  moveEditorCursor,
  nextEditorPatternIndex,
  nextEditorTileType,
  originalEditorButtonHeld,
  quadrantType,
  setEditorQuadrant
} = editorRules;
const {
  BRICK_QUARTER_FRAGMENT_MASKS,
  GRID,
  TILE_TYPES,
  makeGrid
} = stageGrid;
const { BRICK, EMPTY, FOREST, ICE, STEEL, WATER } = TILE_TYPES;

assert.equal(Object.isFrozen(editorRules), true);
assert.equal(Object.isFrozen(EDITOR_TILE_TYPES), true);
assert.equal(Object.isFrozen(ORIGINAL_EDITOR_PATTERNS), true);
assert.equal(ORIGINAL_EDITOR_PATTERNS.every(Object.isFrozen), true);
assert.deepEqual(EDITOR_TILE_TYPES, [EMPTY, BRICK, STEEL, WATER, FOREST, ICE]);
assert.deepEqual(
  ORIGINAL_EDITOR_PATTERNS.map((pattern) => [pattern.type, pattern.mask]),
  [
    [BRICK, 10], [BRICK, 12], [BRICK, 5], [BRICK, 3], [BRICK, 15],
    [STEEL, 10], [STEEL, 12], [STEEL, 5], [STEEL, 3], [STEEL, 15],
    [WATER, 0], [FOREST, 0], [ICE, 0], [EMPTY, 0]
  ]
);

assert.deepEqual(editorDirectionForCode("ArrowRight"), { dx: 1, dy: 0 });
assert.deepEqual(editorDirectionForCode("KeyD"), { dx: 1, dy: 0 });
assert.deepEqual(editorDirectionForCode("ArrowLeft"), { dx: -1, dy: 0 });
assert.deepEqual(editorDirectionForCode("KeyA"), { dx: -1, dy: 0 });
assert.deepEqual(editorDirectionForCode("ArrowDown"), { dx: 0, dy: 1 });
assert.deepEqual(editorDirectionForCode("KeyS"), { dx: 0, dy: 1 });
assert.deepEqual(editorDirectionForCode("ArrowUp"), { dx: 0, dy: -1 });
assert.deepEqual(editorDirectionForCode("KeyW"), { dx: 0, dy: -1 });
assert.equal(editorDirectionForCode("Enter"), null);
assert.equal(isEditorDirectionCode("KeyW"), true);
assert.equal(isEditorDirectionCode("Space"), false);

assert.deepEqual(heldEditorDirection(new Set(["ArrowUp", "ArrowRight"])), { dx: 1, dy: 0 });
assert.deepEqual(heldEditorDirection(new Set(["ArrowUp", "ArrowLeft"])), { dx: -1, dy: 0 });
assert.deepEqual(heldEditorDirection(new Set(["ArrowUp", "ArrowDown"])), { dx: 0, dy: 1 });
assert.deepEqual(heldEditorDirection(new Set(["KeyW"])), { dx: 0, dy: -1 });
assert.equal(heldEditorDirection(new Set()), null);
assert.equal(originalEditorButtonHeld(new Set(["Space"])), true);
assert.equal(originalEditorButtonHeld(new Set(["KeyF"])), true);
assert.equal(originalEditorButtonHeld(new Set(["Enter"])), false);

assert.deepEqual(moveEditorCursor({ qc: -1, qr: -1 }, 0, 0), { qc: 0, qr: 0 });
assert.deepEqual(moveEditorCursor({ qc: 0, qr: 0 }, 1, 1), { qc: 2, qr: 2 });
assert.deepEqual(moveEditorCursor({ qc: 2, qr: 2 }, -1, -1), { qc: 0, qr: 0 });
assert.deepEqual(
  moveEditorCursor({ qc: (GRID - 1) * 2, qr: (GRID - 1) * 2 }, 1, 1),
  { qc: (GRID - 1) * 2, qr: (GRID - 1) * 2 }
);
assert.deepEqual(editorCellForCursor({ qc: 4, qr: 6 }), { c: 2, r: 3 });
assert.equal(editorCellForCursor({ qc: -1, qr: 0 }), null);

assert.equal(nextEditorPatternIndex(0, 1), 1);
assert.equal(nextEditorPatternIndex(13, 1), 0);
assert.equal(nextEditorPatternIndex(0, -1), 13);
assert.equal(editorPatternAt(1), ORIGINAL_EDITOR_PATTERNS[1]);
assert.equal(editorPatternAt(99), ORIGINAL_EDITOR_PATTERNS[0]);

const legendX = 236;
const legendY = 176;
assert.equal(editorBrushAt(legendX + 1, legendY + 1, legendX, legendY), EMPTY);
assert.equal(editorBrushAt(legendX + 15, legendY + 1, legendX, legendY), BRICK);
assert.equal(editorBrushAt(legendX + 1, legendY + 19, legendX, legendY), STEEL);
assert.equal(editorBrushAt(legendX + 15, legendY + 37, legendX, legendY), ICE);
assert.equal(editorBrushAt(legendX + 11, legendY + 1, legendX, legendY), null);
assert.equal(nextEditorTileType(EMPTY), BRICK);
assert.equal(nextEditorTileType(BRICK), STEEL);
assert.equal(nextEditorTileType(ICE), EMPTY);

const grid = makeGrid();
const cell = grid[0][0];
setEditorQuadrant(grid, 0, 0, BRICK);
assert.equal(cell.type, BRICK);
assert.equal(cell.mask, 1);
assert.equal(cell.brickMask, BRICK_QUARTER_FRAGMENT_MASKS[0]);
assert.equal(quadrantType(cell, 0), BRICK);
assert.equal(quadrantType(cell, 1), EMPTY);

setEditorQuadrant(grid, 1, 1, BRICK);
assert.equal(cell.mask, 9);
assert.equal(
  cell.brickMask,
  BRICK_QUARTER_FRAGMENT_MASKS[0] | BRICK_QUARTER_FRAGMENT_MASKS[3]
);
setEditorQuadrant(grid, 0, 0, EMPTY);
assert.equal(cell.type, BRICK);
assert.equal(cell.mask, 8);
assert.equal(cell.brickMask, BRICK_QUARTER_FRAGMENT_MASKS[3]);
setEditorQuadrant(grid, 1, 1, EMPTY);
assert.equal(cell.type, EMPTY);
assert.equal(cell.mask, 0);
assert.equal(cell.brickMask, 0);

setEditorQuadrant(grid, 1, 0, STEEL);
assert.equal(cell.type, STEEL);
assert.equal(cell.mask, 2);
assert.equal(cell.brickMask, 0);
assert.deepEqual(cell.steelHits, [0, 0, 0, 0]);
setEditorQuadrant(grid, 0, 1, WATER);
assert.equal(cell.type, WATER);
assert.equal(cell.mask, 0);
assert.equal(cell.brickMask, 0);
assert.deepEqual(cell.steelHits, [0, 0, 0, 0]);

console.log("editor-rules unit test passed");
