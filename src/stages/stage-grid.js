(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.stageGrid = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const GRID = 13;
  const QUAD_GRID = GRID * 2;
  const WALL_FRAGMENT = 4;
  const FULL_BRICK_FRAGMENT_MASK = 0xffff;
  const BRICK_QUARTER_FRAGMENT_MASKS = Object.freeze([0x0033, 0x00cc, 0x3300, 0xcc00]);
  const TILE_TYPES = Object.freeze({
    EMPTY: 0,
    BRICK: 1,
    STEEL: 2,
    WATER: 3,
    FOREST: 4,
    ICE: 5
  });
  const { EMPTY, BRICK, STEEL, WATER, FOREST, ICE } = TILE_TYPES;
  const TILE_CODE_TO_TYPE = Object.freeze({
    ".": EMPTY,
    B: BRICK,
    "#": BRICK,
    S: STEEL,
    W: WATER,
    "~": WATER,
    F: FOREST,
    I: ICE
  });
  const NORMALIZED_TILE_CODE = Object.freeze({
    ".": ".",
    B: "B",
    "#": "B",
    S: "S",
    W: "W",
    "~": "W",
    F: "F",
    I: "I"
  });

  function makeGrid() {
    return Array.from({ length: GRID }, () =>
      Array.from({ length: GRID }, () => makeCell())
    );
  }

  function makeCell(type, mask) {
    const cellType = type || EMPTY;
    const cellMask = mask || 0;
    return {
      type: cellType,
      mask: cellMask,
      brickMask: cellType === BRICK ? brickFragmentsFromQuarterMask(cellMask) : 0,
      steelHits: [0, 0, 0, 0]
    };
  }

  function cloneGrid(grid) {
    return grid.map((row) => row.map((cell) => ({
      type: cell.type,
      mask: cell.mask,
      brickMask: cell.type === BRICK
        ? normalizeBrickFragmentMask(cell.brickMask, cell.mask)
        : 0,
      steelHits: (cell.steelHits || [0, 0, 0, 0]).slice()
    })));
  }

  function brickFragmentsFromQuarterMask(mask) {
    let fragments = 0;
    for (let q = 0; q < 4; q += 1) {
      if (mask & (1 << q)) fragments |= BRICK_QUARTER_FRAGMENT_MASKS[q];
    }
    return fragments;
  }

  function normalizeBrickFragmentMask(brickMask, quarterMask) {
    if (!Number.isInteger(brickMask)) return brickFragmentsFromQuarterMask(quarterMask);
    return brickMask & FULL_BRICK_FRAGMENT_MASK;
  }

  function quarterMaskFromBrickFragments(brickMask) {
    let mask = 0;
    for (let q = 0; q < 4; q += 1) {
      if (brickMask & BRICK_QUARTER_FRAGMENT_MASKS[q]) mask |= 1 << q;
    }
    return mask;
  }

  function setTile(grid, c, r, type, mask) {
    if (c < 0 || c >= GRID || r < 0 || r >= GRID) return;
    const cell = grid[r][c];
    cell.type = type;
    cell.mask = type === BRICK || type === STEEL ? mask || 15 : 0;
    cell.brickMask = type === BRICK ? brickFragmentsFromQuarterMask(cell.mask) : 0;
    cell.steelHits = [0, 0, 0, 0];
  }

  function clearTile(grid, c, r) {
    setTile(grid, c, r, EMPTY, 0);
  }

  function clearRect(grid, c0, r0, c1, r1) {
    for (let r = r0; r <= r1; r += 1) {
      for (let c = c0; c <= c1; c += 1) clearTile(grid, c, r);
    }
  }

  function parseStageRows(rows) {
    const grid = makeGrid();
    for (let r = 0; r < Math.min(GRID, rows.length); r += 1) {
      const row = rows[r] || "";
      for (let c = 0; c < Math.min(GRID, row.length); c += 1) {
        const type = TILE_CODE_TO_TYPE[row[c]] || EMPTY;
        setTile(grid, c, r, type, 15);
      }
    }
    return grid;
  }

  function parseStageQuadrants(rows) {
    const grid = makeGrid();
    for (let r = 0; r < QUAD_GRID; r += 1) {
      const row = rows[r] || "";
      for (let c = 0; c < QUAD_GRID; c += 1) {
        const type = TILE_CODE_TO_TYPE[row[c] || "."] || EMPTY;
        const tileC = Math.floor(c / 2);
        const tileR = Math.floor(r / 2);
        const q = (r % 2) * 2 + (c % 2);
        const cell = grid[tileR][tileC];
        if (type === BRICK || type === STEEL) {
          if (cell.type !== type) {
            cell.type = type;
            cell.mask = 0;
            cell.brickMask = 0;
            cell.steelHits = [0, 0, 0, 0];
          }
          cell.mask |= 1 << q;
          if (type === BRICK) cell.brickMask |= BRICK_QUARTER_FRAGMENT_MASKS[q];
        } else if (type !== EMPTY) {
          cell.type = type;
          cell.mask = 0;
          cell.brickMask = 0;
          cell.steelHits = [0, 0, 0, 0];
        }
      }
    }
    return grid;
  }

  function normalizeStageRows(rows, label) {
    return normalizeRows(rows, GRID, label);
  }

  function normalizeStageQuadrants(rows, label) {
    return normalizeRows(rows, QUAD_GRID, label);
  }

  function normalizeRows(rows, size, label) {
    if (!Array.isArray(rows) || rows.length !== size) {
      throw new Error(`${label} must contain ${size} rows`);
    }
    return rows.map((row, r) => {
      if (typeof row !== "string" || row.length !== size) {
        throw new Error(`${label} row ${r + 1} must contain ${size} characters`);
      }
      return Array.from(row, (ch, c) => {
        if (!Object.prototype.hasOwnProperty.call(NORMALIZED_TILE_CODE, ch)) {
          throw new Error(`${label} row ${r + 1}, column ${c + 1} has unknown tile '${ch}'`);
        }
        return NORMALIZED_TILE_CODE[ch];
      }).join("");
    });
  }

  function tileCode(cell, quadrant) {
    if (cell.type === BRICK && (quadrant === undefined ? cell.mask : cell.mask & (1 << quadrant))) return "B";
    if (cell.type === STEEL && (quadrant === undefined ? cell.mask : cell.mask & (1 << quadrant))) return "S";
    if (cell.type === WATER) return "W";
    if (cell.type === FOREST) return "F";
    if (cell.type === ICE) return "I";
    return ".";
  }

  function gridToRows(grid) {
    return grid.map((row) => row.map((cell) => tileCode(cell)).join(""));
  }

  function gridToQuadrants(grid) {
    return Array.from({ length: QUAD_GRID }, (_, r) =>
      Array.from({ length: QUAD_GRID }, (_, c) => {
        const cell = grid[Math.floor(r / 2)][Math.floor(c / 2)];
        return tileCode(cell, (r % 2) * 2 + (c % 2));
      }).join("")
    );
  }

  return Object.freeze({
    BRICK_QUARTER_FRAGMENT_MASKS,
    FULL_BRICK_FRAGMENT_MASK,
    GRID,
    NORMALIZED_TILE_CODE,
    QUAD_GRID,
    TILE_CODE_TO_TYPE,
    TILE_TYPES,
    WALL_FRAGMENT,
    brickFragmentsFromQuarterMask,
    clearRect,
    clearTile,
    cloneGrid,
    gridToQuadrants,
    gridToRows,
    makeCell,
    makeGrid,
    normalizeBrickFragmentMask,
    normalizeStageQuadrants,
    normalizeStageRows,
    parseStageQuadrants,
    parseStageRows,
    quarterMaskFromBrickFragments,
    setTile
  });
});
