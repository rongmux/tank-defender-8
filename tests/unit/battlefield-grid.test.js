const assert = require("assert").strict;
const battlefieldGrid = require("../../src/stages/battlefield-grid");
const stageGrid = require("../../src/stages/stage-grid");

const {
  BASE_CELL,
  BASE_WALL_CELLS,
  BATTLE_CLEAR_RECTS,
  buildBaseWall,
  isReservedCell,
  makeOriginalConstructionGrid,
  prepareBattleGrid,
  prepareConstructedBattleGrid,
  shovelWallTypeForTimer
} = battlefieldGrid;
const { GRID, TILE_TYPES, makeGrid, setTile } = stageGrid;
const { BRICK, EMPTY, STEEL } = TILE_TYPES;

function fillGrid(type) {
  const grid = makeGrid();
  for (let r = 0; r < GRID; r += 1) {
    for (let c = 0; c < GRID; c += 1) setTile(grid, c, r, type, 15);
  }
  return grid;
}

assert.equal(Object.isFrozen(battlefieldGrid), true);
assert.equal(Object.isFrozen(BASE_CELL), true);
assert.equal(Object.isFrozen(BASE_WALL_CELLS), true);
assert.equal(BASE_WALL_CELLS.every(Object.isFrozen), true);
assert.equal(Object.isFrozen(BATTLE_CLEAR_RECTS), true);
assert.equal(BATTLE_CLEAR_RECTS.every(Object.isFrozen), true);
assert.deepEqual(BASE_CELL, { c: 6, r: 12 });
assert.deepEqual(BASE_WALL_CELLS, [
  { c: 5, r: 11 },
  { c: 6, r: 11 },
  { c: 7, r: 11 },
  { c: 5, r: 12 },
  { c: 7, r: 12 }
]);
assert.deepEqual(BATTLE_CLEAR_RECTS, [
  { c0: 0, r0: 0, c1: 1, r1: 1 },
  { c0: 5, r0: 0, c1: 7, r1: 1 },
  { c0: 11, r0: 0, c1: 12, r1: 1 },
  { c0: 3, r0: 11, c1: 4, r1: 12 },
  { c0: 8, r0: 11, c1: 9, r1: 12 },
  { c0: 5, r0: 11, c1: 7, r1: 12 }
]);

for (const [c, r] of [[0, 0], [6, 1], [12, 1], [3, 10], [9, 10], [4, 12], [5, 12]]) {
  assert.equal(isReservedCell(c, r), true, String(c) + "," + String(r) + " should be reserved");
}
for (const [c, r] of [[2, 1], [4, 9], [2, 10], [10, 10], [2, 12]]) {
  assert.equal(isReservedCell(c, r), false, String(c) + "," + String(r) + " should remain available");
}

const steelWall = buildBaseWall(makeGrid(), STEEL);
for (const cell of BASE_WALL_CELLS) {
  assert.equal(steelWall[cell.r][cell.c].type, STEEL);
  assert.equal(steelWall[cell.r][cell.c].mask, 15);
}
assert.equal(steelWall[BASE_CELL.r][BASE_CELL.c].type, EMPTY);

const construction = makeOriginalConstructionGrid();
for (let r = 0; r < GRID; r += 1) {
  for (let c = 0; c < GRID; c += 1) {
    const isWall = BASE_WALL_CELLS.some((cell) => cell.c === c && cell.r === r);
    assert.equal(construction[r][c].type, isWall ? BRICK : EMPTY);
  }
}

const battle = prepareBattleGrid(fillGrid(STEEL));
for (const rect of BATTLE_CLEAR_RECTS) {
  for (let r = rect.r0; r <= rect.r1; r += 1) {
    for (let c = rect.c0; c <= rect.c1; c += 1) {
      const isWall = BASE_WALL_CELLS.some((cell) => cell.c === c && cell.r === r);
      assert.equal(battle[r][c].type, isWall ? BRICK : EMPTY);
    }
  }
}
assert.equal(battle[2][2].type, STEEL);

const constructed = prepareConstructedBattleGrid(fillGrid(STEEL));
assert.equal(constructed[BASE_CELL.r][BASE_CELL.c].type, EMPTY);
assert.equal(constructed[0][0].type, STEEL);
assert.equal(constructed[11][6].type, STEEL);

assert.equal(shovelWallTypeForTimer(0, 0, 4), BRICK);
assert.equal(shovelWallTypeForTimer(4, 0, 4), STEEL);
assert.equal(shovelWallTypeForTimer(3, 0, 4), BRICK);
assert.equal(shovelWallTypeForTimer(3, 16, 4), STEEL);
assert.equal(shovelWallTypeForTimer(3, 32, 4), BRICK);

console.log("battlefield-grid unit test passed");
