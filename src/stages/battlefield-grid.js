(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const stageGrid = isCommonJs
    ? require("./stage-grid")
    : (root.TankDefender8Modules || {}).stageGrid;
  if (!stageGrid) throw new Error("stageGrid module must load before battlefield-grid.js");

  const api = factory(stageGrid);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.battlefieldGrid = api;
})(typeof window !== "undefined" ? window : globalThis, function (stageGrid) {
  "use strict";

  const {
    TILE_TYPES,
    clearRect,
    clearTile,
    makeGrid,
    setTile
  } = stageGrid;
  const { BRICK, STEEL } = TILE_TYPES;

  const BASE_CELL = Object.freeze({ c: 6, r: 12 });
  const BASE_WALL_CELLS = Object.freeze([
    { c: 5, r: 11 },
    { c: 6, r: 11 },
    { c: 7, r: 11 },
    { c: 5, r: 12 },
    { c: 7, r: 12 }
  ].map(Object.freeze));
  const BATTLE_CLEAR_RECTS = Object.freeze([
    { c0: 0, r0: 0, c1: 1, r1: 1 },
    { c0: 5, r0: 0, c1: 7, r1: 1 },
    { c0: 11, r0: 0, c1: 12, r1: 1 },
    { c0: 3, r0: 11, c1: 4, r1: 12 },
    { c0: 8, r0: 11, c1: 9, r1: 12 },
    { c0: 5, r0: 11, c1: 7, r1: 12 }
  ].map(Object.freeze));

  function isReservedCell(c, r) {
    if (r <= 1 && (c <= 1 || (c >= 5 && c <= 7) || c >= 11)) return true;
    if (r >= 10 && c >= 3 && c <= 9) return true;
    if (r >= 11 && c >= 5 && c <= 7) return true;
    return false;
  }

  function buildBaseWall(grid, type) {
    for (const cell of BASE_WALL_CELLS) setTile(grid, cell.c, cell.r, type, 15);
    clearTile(grid, BASE_CELL.c, BASE_CELL.r);
    return grid;
  }

  /** Clears standard spawn lanes and restores the five-cell brick enclosure. */
  function prepareBattleGrid(grid) {
    for (const rect of BATTLE_CLEAR_RECTS) {
      clearRect(grid, rect.c0, rect.r0, rect.c1, rect.r1);
    }
    return buildBaseWall(grid, BRICK);
  }

  function prepareConstructedBattleGrid(grid) {
    clearTile(grid, BASE_CELL.c, BASE_CELL.r);
    return grid;
  }

  function makeOriginalConstructionGrid() {
    return buildBaseWall(makeGrid(), BRICK);
  }

  function shovelWallTypeForTimer(timer, tick, flashThreshold) {
    if (timer <= 0) return BRICK;
    if (timer >= flashThreshold) return STEEL;
    return ((Math.max(0, Math.floor(Number(tick) || 0)) & 16) !== 0) ? STEEL : BRICK;
  }

  return Object.freeze({
    BASE_CELL,
    BASE_WALL_CELLS,
    BATTLE_CLEAR_RECTS,
    buildBaseWall,
    isReservedCell,
    makeOriginalConstructionGrid,
    prepareBattleGrid,
    prepareConstructedBattleGrid,
    shovelWallTypeForTimer
  });
});
