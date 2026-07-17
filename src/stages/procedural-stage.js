(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const modules = root.TankDefender8Modules || {};
  const stageGrid = isCommonJs ? require("./stage-grid") : modules.stageGrid;
  const battlefieldGrid = isCommonJs ? require("./battlefield-grid") : modules.battlefieldGrid;
  if (!stageGrid) throw new Error("stageGrid module must load before procedural-stage.js");
  if (!battlefieldGrid) throw new Error("battlefieldGrid module must load before procedural-stage.js");

  const api = factory(stageGrid, battlefieldGrid);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  const browserModules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  browserModules.proceduralStage = api;
})(typeof window !== "undefined" ? window : globalThis, function (stageGrid, battlefieldGrid) {
  "use strict";

  const { TILE_TYPES, makeGrid, setTile } = stageGrid;
  const { isReservedCell, prepareBattleGrid } = battlefieldGrid;
  const { EMPTY, BRICK, STEEL, WATER, FOREST, ICE } = TILE_TYPES;

  const PROCEDURAL_STAGE_SEED = 0x8c0ffee;
  const PROCEDURAL_STAGE_MULTIPLIER = 2654435761;

  /** Creates the exact deterministic random stream retained by fallback maps. */
  function createSeededRandom(seed) {
    let state = seed >>> 0;
    return function next() {
      state += 0x6d2b79f5;
      let value = Math.imul(state ^ (state >>> 15), 1 | state);
      value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function proceduralStageDensity(stage) {
    return 0.27 + Math.min(stage, 35) * 0.003;
  }

  /** Maps one random sample to terrain using the retained stage thresholds. */
  function proceduralTerrainType(roll, stage) {
    const density = proceduralStageDensity(stage);
    if (roll < density) return BRICK;
    if (roll < density + 0.055 + stage * 0.001) return STEEL;
    if (roll < density + 0.105) return WATER;
    if (roll < density + 0.175) return FOREST;
    if (roll < density + 0.215) return ICE;
    return EMPTY;
  }

  /** Overlays the retained seven-stage motif cycle before spawn-area cleanup. */
  function addStageMotif(grid, stage) {
    const variant = stage % 7;
    if (variant === 1) {
      for (let c = 2; c <= 10; c += 2) setTile(grid, c, 5, STEEL, 15);
      for (let r = 2; r <= 9; r += 3) setTile(grid, 6, r, BRICK, 15);
    } else if (variant === 2) {
      for (let r = 2; r <= 8; r += 1) {
        setTile(grid, 3, r, WATER, 0);
        setTile(grid, 9, r, WATER, 0);
      }
    } else if (variant === 3) {
      for (let c = 1; c <= 11; c += 1) if (c !== 6) setTile(grid, c, 6, FOREST, 0);
      for (let r = 2; r <= 10; r += 2) setTile(grid, 6, r, BRICK, 15);
    } else if (variant === 4) {
      for (let c = 1; c <= 11; c += 1) {
        if (c < 4 || c > 8) setTile(grid, c, 3, ICE, 0);
        setTile(grid, c, 9, c % 2 ? BRICK : EMPTY, 15);
      }
    } else if (variant === 5) {
      for (let r = 2; r <= 9; r += 1) {
        setTile(grid, 2, r, BRICK, 15);
        setTile(grid, 10, r, BRICK, 15);
      }
      setTile(grid, 6, 4, STEEL, 15);
      setTile(grid, 6, 8, STEEL, 15);
    } else if (variant === 6) {
      for (let i = 0; i < 5; i += 1) {
        setTile(grid, 2 + i, 2 + i, BRICK, 15);
        setTile(grid, 10 - i, 2 + i, BRICK, 15);
      }
    }
    return grid;
  }

  /** Builds the deterministic fallback map used when a stage pack omits map data. */
  function buildProceduralStage(stage) {
    const grid = makeGrid();
    const next = createSeededRandom(PROCEDURAL_STAGE_SEED ^ Math.imul(stage, PROCEDURAL_STAGE_MULTIPLIER));
    const mirror = stage % 3 !== 0;

    for (let r = 1; r < 11; r += 1) {
      const cLimit = mirror ? 6 : 12;
      for (let c = 0; c <= cLimit; c += 1) {
        const targetCols = mirror && c !== 6 ? [c, 12 - c] : [c];
        const type = proceduralTerrainType(next(), stage);
        for (const col of targetCols) {
          if (isReservedCell(col, r)) continue;
          setTile(grid, col, r, type, 15);
        }
      }
    }

    addStageMotif(grid, stage);
    return prepareBattleGrid(grid);
  }

  return Object.freeze({
    PROCEDURAL_STAGE_MULTIPLIER,
    PROCEDURAL_STAGE_SEED,
    addStageMotif,
    buildProceduralStage,
    createSeededRandom,
    proceduralStageDensity,
    proceduralTerrainType
  });
});
