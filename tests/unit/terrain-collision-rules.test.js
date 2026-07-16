const assert = require("assert").strict;
const {
  HALF_TILE,
  TILE_SIZE,
  brickFragmentRect,
  overlappedBrickFragments,
  overlappedQuarters,
  quarterRect,
  rectHitsSolidTerrain,
  solidTerrainOverlapArea
} = require("../../src/rules/terrain-collision-rules");
const {
  BRICK_QUARTER_FRAGMENT_MASKS,
  TILE_TYPES,
  makeCell,
  makeGrid,
  setTile
} = require("../../src/stages/stage-grid");

const { BRICK, STEEL, WATER, FOREST, ICE } = TILE_TYPES;
assert.equal(TILE_SIZE, 16);
assert.equal(HALF_TILE, 8);
assert.deepEqual(quarterRect(1, 2, 3), { x: 24, y: 40, w: 8, h: 8 });
assert.deepEqual(brickFragmentRect(1, 2, 15), { x: 28, y: 44, w: 4, h: 4 });

assert.equal(overlappedQuarters({ x: 0, y: 8, w: 16, h: 8 }, 0, 0, 15), 12);
assert.equal(overlappedQuarters({ x: 8, y: 8, w: 8, h: 8 }, 0, 0, 15), 8);

const lowerBrick = makeCell(BRICK, 12);
assert.equal(
  overlappedBrickFragments({ x: 0, y: 8, w: 8, h: 8 }, 0, 0, lowerBrick),
  BRICK_QUARTER_FRAGMENT_MASKS[2]
);
assert.equal(
  overlappedBrickFragments({ x: 8, y: 8, w: 8, h: 8 }, 0, 0, lowerBrick),
  BRICK_QUARTER_FRAGMENT_MASKS[3]
);

const waterGrid = makeGrid();
setTile(waterGrid, 0, 0, WATER, 15);
assert.equal(solidTerrainOverlapArea({ x: 8, y: 8, w: 16, h: 16 }, waterGrid), 64);
assert.equal(rectHitsSolidTerrain({ x: 8, y: 8, w: 16, h: 16 }, waterGrid), true);

for (const type of [FOREST, ICE]) {
  const grid = makeGrid();
  setTile(grid, 0, 0, type, 15);
  assert.equal(solidTerrainOverlapArea({ x: 0, y: 0, w: 16, h: 16 }, grid), 0);
  assert.equal(rectHitsSolidTerrain({ x: 0, y: 0, w: 16, h: 16 }, grid), false);
}

const lowerQuarterGrid = makeGrid();
setTile(lowerQuarterGrid, 0, 0, BRICK, 4);
assert.equal(solidTerrainOverlapArea({ x: 0, y: 8, w: 8, h: 8 }, lowerQuarterGrid), 64);
assert.equal(solidTerrainOverlapArea({ x: 0, y: 0, w: 8, h: 8 }, lowerQuarterGrid), 0);

const lowerRightGrid = makeGrid();
setTile(lowerRightGrid, 0, 0, BRICK, 8);
assert.equal(solidTerrainOverlapArea({ x: 8, y: 8, w: 8, h: 8 }, lowerRightGrid), 64);
assert.equal(solidTerrainOverlapArea({ x: 8, y: 0, w: 8, h: 8 }, lowerRightGrid), 0);

const fragmentGrid = makeGrid();
const fragmentedCell = makeCell(BRICK, 15);
fragmentedCell.brickMask &= ~(1 << 12);
fragmentGrid[0][0] = fragmentedCell;
assert.equal(solidTerrainOverlapArea({ x: 0, y: 12, w: 4, h: 4 }, fragmentGrid), 0);
assert.equal(solidTerrainOverlapArea({ x: 4, y: 12, w: 4, h: 4 }, fragmentGrid), 16);

const steelGrid = makeGrid();
setTile(steelGrid, 0, 0, STEEL, 8);
assert.equal(solidTerrainOverlapArea({ x: 8, y: 8, w: 8, h: 8 }, steelGrid), 64);
assert.equal(solidTerrainOverlapArea({ x: 0, y: 0, w: 8, h: 8 }, steelGrid), 0);

console.log("terrain-collision-rules unit test passed");
