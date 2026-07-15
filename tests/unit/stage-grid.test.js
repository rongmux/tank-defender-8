const assert = require("assert").strict;
const {
  BRICK_QUARTER_FRAGMENT_MASKS,
  FULL_BRICK_FRAGMENT_MASK,
  GRID,
  QUAD_GRID,
  TILE_TYPES,
  brickFragmentsFromQuarterMask,
  clearRect,
  cloneGrid,
  gridToQuadrants,
  gridToRows,
  makeGrid,
  normalizeBrickFragmentMask,
  normalizeStageQuadrants,
  normalizeStageRows,
  parseStageQuadrants,
  parseStageRows,
  quarterMaskFromBrickFragments,
  setTile
} = require("../../src/stages/stage-grid");

const { EMPTY, BRICK, STEEL, WATER, FOREST, ICE } = TILE_TYPES;
const grid = makeGrid();
assert.equal(grid.length, GRID);
assert(grid.every((row) => row.length === GRID));
assert.notEqual(grid[0][0], grid[0][1], "every stage cell must have independent mutable state");

setTile(grid, 0, 0, BRICK, 1);
setTile(grid, 1, 0, STEEL, 10);
setTile(grid, 2, 0, WATER, 15);
setTile(grid, 3, 0, FOREST, 15);
setTile(grid, 4, 0, ICE, 15);
assert.equal(grid[0][0].brickMask, BRICK_QUARTER_FRAGMENT_MASKS[0]);
assert.equal(grid[0][1].mask, 10);
assert.equal(grid[0][2].mask, 0, "non-wall terrain must not retain wall masks");
assert.equal(brickFragmentsFromQuarterMask(15), FULL_BRICK_FRAGMENT_MASK);
assert.equal(quarterMaskFromBrickFragments(BRICK_QUARTER_FRAGMENT_MASKS[2]), 4);
assert.equal(normalizeBrickFragmentMask(undefined, 3), 0x00ff);

const clone = cloneGrid(grid);
clone[0][0].steelHits[0] = 9;
clone[0][0].mask = 2;
assert.equal(grid[0][0].steelHits[0], 0);
assert.equal(grid[0][0].mask, 1, "cloning must isolate mutable wall state");
clearRect(clone, 0, 0, 1, 0);
assert.equal(clone[0][0].type, EMPTY);
assert.equal(clone[0][1].type, EMPTY);

const rows = Array.from({ length: GRID }, () => ".".repeat(GRID));
rows[0] = "#~SFI" + ".".repeat(GRID - 5);
const normalizedRows = normalizeStageRows(rows, "maps[0]");
assert.equal(normalizedRows[0], "BWSFI" + ".".repeat(GRID - 5));
const rowGrid = parseStageRows(normalizedRows);
assert.equal(gridToRows(rowGrid)[0], normalizedRows[0]);

const quadrants = Array.from({ length: QUAD_GRID }, () => ".".repeat(QUAD_GRID));
quadrants[0] = "B" + ".".repeat(QUAD_GRID - 1);
const normalizedQuadrants = normalizeStageQuadrants(quadrants, "quadrants[0]");
const quadrantGrid = parseStageQuadrants(normalizedQuadrants);
assert.equal(quadrantGrid[0][0].type, BRICK);
assert.equal(quadrantGrid[0][0].mask, 1);
assert.deepEqual(gridToQuadrants(quadrantGrid), normalizedQuadrants);

assert.throws(() => normalizeStageRows(rows.slice(1), "maps[0]"), /must contain 13 rows/);
const invalidRows = rows.slice();
invalidRows[2] = "?" + ".".repeat(GRID - 1);
assert.throws(() => normalizeStageRows(invalidRows, "maps[0]"), /unknown tile '\?'/);

console.log("stage-grid unit test passed");
