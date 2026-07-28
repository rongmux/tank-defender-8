const assert = require("assert").strict;
const originalStageData = require("../../src/stages/original-stage-data");
const { gridToRows, TILE_TYPES } = require("../../src/stages/stage-grid");

const {
  CELLS_PER_STAGE,
  FROZEN_STAGE_DATA,
  ORIGINAL_STAGE_COUNT,
  ORIGINAL_STAGE_DATA,
  buildOriginalStageGrid,
  stageData
} = originalStageData;

assert.equal(ORIGINAL_STAGE_COUNT, 35);
assert.equal(CELLS_PER_STAGE, 169);
assert.equal(ORIGINAL_STAGE_DATA, FROZEN_STAGE_DATA);
assert.equal(Object.isFrozen(ORIGINAL_STAGE_DATA), true);
assert.equal(ORIGINAL_STAGE_DATA.length, ORIGINAL_STAGE_COUNT);

for (const source of ORIGINAL_STAGE_DATA) {
  assert.equal(Object.isFrozen(source), true);
  for (const values of Object.values(source)) {
    assert.equal(Object.isFrozen(values), true);
    assert.equal(values.length, CELLS_PER_STAGE);
  }
}

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
