(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const geometry = isCommonJs
    ? require("../core/geometry")
    : (root.TankDefender8Modules || {}).geometry;
  const stageGrid = isCommonJs
    ? require("../stages/stage-grid")
    : (root.TankDefender8Modules || {}).stageGrid;
  if (!geometry) throw new Error("geometry module must load before terrain-collision-rules.js");
  if (!stageGrid) throw new Error("stageGrid module must load before terrain-collision-rules.js");

  const api = factory(geometry, stageGrid);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.terrainCollisionRules = api;
})(typeof window !== "undefined" ? window : globalThis, function (geometry, stageGrid) {
  "use strict";

  const { clamp, rectOverlapArea, rectsOverlap } = geometry;
  const { GRID, TILE_TYPES, WALL_FRAGMENT, normalizeBrickFragmentMask } = stageGrid;
  const { BRICK, STEEL, WATER } = TILE_TYPES;
  const TILE_SIZE = WALL_FRAGMENT * 4;
  const HALF_TILE = TILE_SIZE / 2;

  function quarterRect(c, r, q) {
    return {
      x: c * TILE_SIZE + (q % 2) * HALF_TILE,
      y: r * TILE_SIZE + (q >= 2 ? HALF_TILE : 0),
      w: HALF_TILE,
      h: HALF_TILE
    };
  }

  function brickFragmentRect(c, r, fragment) {
    return {
      x: c * TILE_SIZE + (fragment % 4) * WALL_FRAGMENT,
      y: r * TILE_SIZE + Math.floor(fragment / 4) * WALL_FRAGMENT,
      w: WALL_FRAGMENT,
      h: WALL_FRAGMENT
    };
  }

  function overlappedQuarters(rect, c, r, mask) {
    let hit = 0;
    for (let q = 0; q < 4; q += 1) {
      if (!(mask & (1 << q))) continue;
      if (rectsOverlap(rect, quarterRect(c, r, q))) hit |= 1 << q;
    }
    return hit;
  }

  function overlappedBrickFragments(rect, c, r, cell) {
    const fragments = normalizeBrickFragmentMask(cell.brickMask, cell.mask);
    let hit = 0;
    for (let fragment = 0; fragment < 16; fragment += 1) {
      if (!(fragments & (1 << fragment))) continue;
      if (rectsOverlap(rect, brickFragmentRect(c, r, fragment))) hit |= 1 << fragment;
    }
    return hit;
  }

  /** Returns the exact solid pixel area covered by water, live brick fragments, or steel quarters. */
  function solidTerrainOverlapArea(rect, grid) {
    const c0 = clamp(Math.floor(rect.x / TILE_SIZE), 0, GRID - 1);
    const r0 = clamp(Math.floor(rect.y / TILE_SIZE), 0, GRID - 1);
    const c1 = clamp(Math.floor((rect.x + rect.w - 1) / TILE_SIZE), 0, GRID - 1);
    const r1 = clamp(Math.floor((rect.y + rect.h - 1) / TILE_SIZE), 0, GRID - 1);
    let total = 0;

    for (let r = r0; r <= r1; r += 1) {
      for (let c = c0; c <= c1; c += 1) {
        const cell = grid[r][c];
        if (cell.type === WATER) {
          total += rectOverlapArea(rect, {
            x: c * TILE_SIZE,
            y: r * TILE_SIZE,
            w: TILE_SIZE,
            h: TILE_SIZE
          });
        }
        if (cell.type === BRICK && cell.mask) {
          const fragments = normalizeBrickFragmentMask(cell.brickMask, cell.mask);
          for (let fragment = 0; fragment < 16; fragment += 1) {
            if (fragments & (1 << fragment)) {
              total += rectOverlapArea(rect, brickFragmentRect(c, r, fragment));
            }
          }
        }
        if (cell.type === STEEL && cell.mask) {
          for (let q = 0; q < 4; q += 1) {
            if (cell.mask & (1 << q)) total += rectOverlapArea(rect, quarterRect(c, r, q));
          }
        }
      }
    }
    return total;
  }

  function rectHitsSolidTerrain(rect, grid) {
    return solidTerrainOverlapArea(rect, grid) > 0;
  }

  return Object.freeze({
    HALF_TILE,
    TILE_SIZE,
    brickFragmentRect,
    overlappedBrickFragments,
    overlappedQuarters,
    quarterRect,
    rectHitsSolidTerrain,
    solidTerrainOverlapArea
  });
});
