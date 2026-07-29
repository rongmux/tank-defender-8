const assert = require("assert").strict;
const originalStageData = require("../../src/stages/original-stage-data");
const { gridToRows, TILE_TYPES } = require("../../src/stages/stage-grid");

const {
  BRICK_MASK_BY_BLOCK_ID,
  CELLS_PER_STAGE,
  FROZEN_STAGE_DATA,
  ORIGINAL_BASE_WALLS,
  ORIGINAL_STAGE_COUNT,
  ORIGINAL_STAGE_DATA,
  ORIGINAL_STAGE_SOURCE_ROWS,
  STEEL_MASK_BY_BLOCK_ID,
  buildOriginalStageGrid,
  stageData
} = originalStageData;

assert.equal(ORIGINAL_STAGE_COUNT, 35);
assert.equal(CELLS_PER_STAGE, 169);
assert.equal(ORIGINAL_STAGE_DATA, FROZEN_STAGE_DATA);
assert.equal(Object.isFrozen(ORIGINAL_STAGE_DATA), true);
assert.equal(ORIGINAL_STAGE_DATA.length, ORIGINAL_STAGE_COUNT);
assert.equal(ORIGINAL_STAGE_SOURCE_ROWS.length, ORIGINAL_STAGE_COUNT);
assert(ORIGINAL_STAGE_SOURCE_ROWS.every((rows) =>
  Object.isFrozen(rows)
  && rows.length === 13
  && rows.every((row) => typeof row === "string" && row.length === 13)
));

for (const source of ORIGINAL_STAGE_DATA) {
  assert.equal(Object.isFrozen(source), true);
  for (const values of Object.values(source)) {
    assert.equal(Object.isFrozen(values), true);
    assert.equal(values.length, CELLS_PER_STAGE);
  }
}

const baseWallByIndex = new Map(
  ORIGINAL_BASE_WALLS.map((wall) => [wall.row * 13 + wall.column, wall.brickMask])
);
for (let stage = 1; stage <= ORIGINAL_STAGE_COUNT; stage += 1) {
  const grid = buildOriginalStageGrid(stage);
  const sourceRows = ORIGINAL_STAGE_SOURCE_ROWS[stage - 1];
  for (let row = 0; row < 13; row += 1) {
    for (let column = 0; column < 13; column += 1) {
      const index = row * 13 + column;
      const blockId = Number.parseInt(sourceRows[row][column], 16);
      const cell = grid[row][column];
      const baseBrickMask = baseWallByIndex.get(index);
      if (baseBrickMask !== undefined) {
        assert.equal(cell.type, TILE_TYPES.BRICK);
        assert.equal(cell.brickMask, baseBrickMask);
      } else if (blockId <= 4) {
        assert.equal(cell.type, TILE_TYPES.BRICK);
        assert.equal(cell.brickMask, BRICK_MASK_BY_BLOCK_ID[blockId]);
      } else if (blockId <= 9) {
        assert.equal(cell.type, TILE_TYPES.STEEL);
        assert.equal(cell.mask, STEEL_MASK_BY_BLOCK_ID[blockId]);
      } else if (blockId === 10) {
        assert.equal(cell.type, TILE_TYPES.WATER);
      } else if (blockId === 11) {
        assert.equal(cell.type, TILE_TYPES.FOREST);
      } else if (blockId === 12) {
        assert.equal(cell.type, TILE_TYPES.ICE);
      } else {
        assert.equal(cell.type, TILE_TYPES.EMPTY);
      }
    }
  }
}

assert.equal(ORIGINAL_STAGE_SOURCE_ROWS[4][0][6], "4");
assert.equal(buildOriginalStageGrid(5)[0][6].type, TILE_TYPES.BRICK);
assert.equal(ORIGINAL_STAGE_SOURCE_ROWS[11][0][6], "4");
assert.equal(buildOriginalStageGrid(12)[0][6].type, TILE_TYPES.BRICK);
assert.equal(ORIGINAL_STAGE_SOURCE_ROWS[14][12][4], "B");
assert.equal(buildOriginalStageGrid(15)[12][4].type, TILE_TYPES.FOREST);

const stage35Rows = [
  ".............",
  "....B.B......",
  "F..FBFBF..F..",
  "BFFBBBBBFFBF.",
  "BBBBSBSBBBBF.",
  "WWWBBBBBWWWF.",
  "WBBBBBBBBBWWF",
  "BBBWBBBWBBBFF",
  "BBWWWBWWWBBWW",
  "FWWFFFFFWWFWF",
  ".FF.....FF.F.",
  ".....BBB.....",
  ".....B.B....."
];
assert.deepEqual(gridToRows(buildOriginalStageGrid(35)), stage35Rows);
assert.equal(stageData(0), stageData(1));
assert.equal(stageData(36), stageData(35));

const partialBrickCell = buildOriginalStageGrid(1).flat().find(
  (cell) => cell.type === TILE_TYPES.BRICK && cell.brickMask !== 0xffff
);
assert(partialBrickCell, "source map must preserve partial brick fragments");
assert(partialBrickCell.mask > 0 && partialBrickCell.mask < 15);

const steelCell = buildOriginalStageGrid(35).flat().find((cell) => cell.type === TILE_TYPES.STEEL);
assert(steelCell, "source map must contain steel terrain");
assert(steelCell.mask > 0 && steelCell.mask <= 15);

const firstGrid = buildOriginalStageGrid(1);
const secondGrid = buildOriginalStageGrid(1);
assert.notEqual(firstGrid, secondGrid);
assert.notEqual(firstGrid[0], secondGrid[0]);
firstGrid[0][0].type = TILE_TYPES.BRICK;
assert.equal(secondGrid[0][0].type, TILE_TYPES.EMPTY);

console.log("original-stage-data unit test passed");
