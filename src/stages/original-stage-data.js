(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const modules = isCommonJs ? null : (root.TankDefender8Modules || {});
  const dependencies = {
    stageGrid: isCommonJs
      ? require("./stage-grid")
      : modules.stageGrid,
    stageSource: isCommonJs
      ? require("./original-stage-source")
      : modules.originalStageSource
  };

  for (const [name, dependency] of Object.entries(dependencies)) {
    if (!dependency) throw new Error(name + " module must load before original-stage-data.js");
  }

  const api = factory(dependencies);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  const browserModules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  browserModules.originalStageData = api;
})(typeof window !== "undefined" ? window : globalThis, function (dependencies) {
  "use strict";

  const { TILE_TYPES, makeGrid, quarterMaskFromBrickFragments } = dependencies.stageGrid;
  const { BRICK, STEEL, WATER, FOREST, ICE } = TILE_TYPES;
  const {
    ORIGINAL_STAGE_COLUMNS,
    ORIGINAL_STAGE_COUNT,
    ORIGINAL_STAGE_ROWS,
    ORIGINAL_STAGE_SOURCE_ROWS
  } = dependencies.stageSource;

  const CELLS_PER_STAGE = ORIGINAL_STAGE_ROWS * ORIGINAL_STAGE_COLUMNS;
  const FULL_BRICK_FRAGMENT_MASK = 0xffff;
  const BRICK_MASK_BY_BLOCK_ID = Object.freeze([
    0xcccc,
    0xff00,
    0x3333,
    0x00ff,
    FULL_BRICK_FRAGMENT_MASK
  ]);
  const STEEL_MASK_BY_BLOCK_ID = Object.freeze({
    5: 10,
    6: 12,
    7: 5,
    8: 3,
    9: 15
  });

  // The original runtime draws this fixed unprotected base enclosure after loading each map.
  const ORIGINAL_BASE_WALLS = Object.freeze([
    Object.freeze({ row: 11, column: 5, brickMask: 0xcc00 }),
    Object.freeze({ row: 11, column: 6, brickMask: 0xff00 }),
    Object.freeze({ row: 11, column: 7, brickMask: 0x3300 }),
    Object.freeze({ row: 12, column: 5, brickMask: 0xcccc }),
    Object.freeze({ row: 12, column: 7, brickMask: 0x3333 })
  ]);

  function blockIdForCode(code) {
    const id = Number.parseInt(code, 16);
    if (!Number.isInteger(id) || id < 0 || id > 0x0d) {
      throw new Error("original stage block code '" + code + "' is invalid");
    }
    return id;
  }

  function applyBaseWalls(stage) {
    for (const wall of ORIGINAL_BASE_WALLS) {
      const index = wall.row * ORIGINAL_STAGE_COLUMNS + wall.column;
      stage.brickMasks[index] = wall.brickMask;
      stage.steelMasks[index] = 0;
      stage.forest[index] = 0;
      stage.water[index] = 0;
      stage.ice[index] = 0;
    }
    return stage;
  }

  function decodeOriginalStageRows(rows) {
    if (!Array.isArray(rows) || rows.length !== ORIGINAL_STAGE_ROWS) {
      throw new Error("original stage must contain " + ORIGINAL_STAGE_ROWS + " rows");
    }

    const stage = {
      brickMasks: Array(CELLS_PER_STAGE).fill(0),
      steelMasks: Array(CELLS_PER_STAGE).fill(0),
      forest: Array(CELLS_PER_STAGE).fill(0),
      water: Array(CELLS_PER_STAGE).fill(0),
      ice: Array(CELLS_PER_STAGE).fill(0)
    };

    for (let row = 0; row < ORIGINAL_STAGE_ROWS; row += 1) {
      const sourceRow = rows[row];
      if (typeof sourceRow !== "string" || sourceRow.length !== ORIGINAL_STAGE_COLUMNS) {
        throw new Error("original stage row " + (row + 1) + " must contain "
          + ORIGINAL_STAGE_COLUMNS + " block IDs");
      }
      for (let column = 0; column < ORIGINAL_STAGE_COLUMNS; column += 1) {
        const index = row * ORIGINAL_STAGE_COLUMNS + column;
        const blockId = blockIdForCode(sourceRow[column]);
        if (blockId <= 4) {
          stage.brickMasks[index] = BRICK_MASK_BY_BLOCK_ID[blockId];
        } else if (blockId <= 9) {
          stage.steelMasks[index] = STEEL_MASK_BY_BLOCK_ID[blockId];
        } else if (blockId === 10) {
          stage.water[index] = 1;
        } else if (blockId === 11) {
          stage.forest[index] = 1;
        } else if (blockId === 12) {
          stage.ice[index] = 1;
        }
      }
    }

    return applyBaseWalls(stage);
  }

  function freezeStageData(stage) {
    return Object.freeze({
      brickMasks: Object.freeze(stage.brickMasks.slice()),
      steelMasks: Object.freeze(stage.steelMasks.slice()),
      forest: Object.freeze(stage.forest.slice()),
      water: Object.freeze(stage.water.slice()),
      ice: Object.freeze(stage.ice.slice())
    });
  }

  const FROZEN_STAGE_DATA = Object.freeze(
    ORIGINAL_STAGE_SOURCE_ROWS.map((rows) => freezeStageData(decodeOriginalStageRows(rows)))
  );

  function stageData(stage) {
    const index = Math.max(1, Math.min(ORIGINAL_STAGE_COUNT, Math.floor(Number(stage) || 1))) - 1;
    return FROZEN_STAGE_DATA[index];
  }

  function buildOriginalStageGrid(stage) {
    const source = stageData(stage);
    const grid = makeGrid();
    for (let index = 0; index < CELLS_PER_STAGE; index += 1) {
      const row = Math.floor(index / ORIGINAL_STAGE_COLUMNS);
      const column = index % ORIGINAL_STAGE_COLUMNS;
      const cell = grid[row][column];
      const brickMask = source.brickMasks[index];
      const steelMask = source.steelMasks[index];
      if (brickMask) {
        cell.type = BRICK;
        cell.brickMask = brickMask;
        cell.mask = quarterMaskFromBrickFragments(brickMask);
        continue;
      }
      if (steelMask) {
        cell.type = STEEL;
        cell.mask = steelMask;
        cell.brickMask = 0;
        continue;
      }
      cell.type = source.forest[index] ? FOREST
        : source.water[index] ? WATER
          : source.ice[index] ? ICE
            : 0;
      cell.mask = 0;
      cell.brickMask = 0;
    }
    return grid;
  }

  return Object.freeze({
    BRICK_MASK_BY_BLOCK_ID,
    CELLS_PER_STAGE,
    FROZEN_STAGE_DATA,
    ORIGINAL_BASE_WALLS,
    ORIGINAL_STAGE_COUNT,
    ORIGINAL_STAGE_DATA: FROZEN_STAGE_DATA,
    ORIGINAL_STAGE_SOURCE_ROWS,
    STEEL_MASK_BY_BLOCK_ID,
    buildOriginalStageGrid,
    decodeOriginalStageRows,
    stageData
  });
});
