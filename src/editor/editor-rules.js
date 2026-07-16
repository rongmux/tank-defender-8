(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const browserModules = isCommonJs
    ? null
    : (root.TankDefender8Modules || (root.TankDefender8Modules = {}));
  const geometry = isCommonJs ? require("../core/geometry") : browserModules.geometry;
  const stageGrid = isCommonJs ? require("../stages/stage-grid") : browserModules.stageGrid;
  if (!geometry) throw new Error("geometry module must load before editor-rules.js");
  if (!stageGrid) throw new Error("stage-grid module must load before editor-rules.js");

  const api = factory(geometry, stageGrid);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  browserModules.editorRules = api;
})(typeof window !== "undefined" ? window : globalThis, function (geometry, stageGrid) {
  "use strict";

  const { clamp } = geometry;
  const {
    BRICK_QUARTER_FRAGMENT_MASKS,
    GRID,
    QUAD_GRID,
    TILE_TYPES
  } = stageGrid;
  const { BRICK, EMPTY, FOREST, ICE, STEEL, WATER } = TILE_TYPES;

  const EDITOR_TILE_TYPES = Object.freeze([EMPTY, BRICK, STEEL, WATER, FOREST, ICE]);
  const ORIGINAL_EDITOR_PATTERNS = Object.freeze([
    { type: BRICK, mask: 10 },
    { type: BRICK, mask: 12 },
    { type: BRICK, mask: 5 },
    { type: BRICK, mask: 3 },
    { type: BRICK, mask: 15 },
    { type: STEEL, mask: 10 },
    { type: STEEL, mask: 12 },
    { type: STEEL, mask: 5 },
    { type: STEEL, mask: 3 },
    { type: STEEL, mask: 15 },
    { type: WATER, mask: 0 },
    { type: FOREST, mask: 0 },
    { type: ICE, mask: 0 },
    { type: EMPTY, mask: 0 }
  ].map(Object.freeze));

  function editorDirectionForCode(code) {
    if (code === "ArrowRight" || code === "KeyD") return { dx: 1, dy: 0 };
    if (code === "ArrowLeft" || code === "KeyA") return { dx: -1, dy: 0 };
    if (code === "ArrowDown" || code === "KeyS") return { dx: 0, dy: 1 };
    if (code === "ArrowUp" || code === "KeyW") return { dx: 0, dy: -1 };
    return null;
  }

  function isEditorDirectionCode(code) {
    return editorDirectionForCode(code) !== null;
  }

  function heldEditorDirection(keys) {
    if (!keys || typeof keys.has !== "function") return null;
    if (keys.has("ArrowRight") || keys.has("KeyD")) return { dx: 1, dy: 0 };
    if (keys.has("ArrowLeft") || keys.has("KeyA")) return { dx: -1, dy: 0 };
    if (keys.has("ArrowDown") || keys.has("KeyS")) return { dx: 0, dy: 1 };
    if (keys.has("ArrowUp") || keys.has("KeyW")) return { dx: 0, dy: -1 };
    return null;
  }

  function originalEditorButtonHeld(keys) {
    return Boolean(
      keys &&
      typeof keys.has === "function" &&
      (keys.has("Space") || keys.has("KeyZ") || keys.has("KeyF") || keys.has("KeyX"))
    );
  }

  function moveEditorCursor(cursor, dx, dy) {
    const source = cursor || {};
    const column = source.qc < 0 ? 0 : Math.floor(Number(source.qc) / 2);
    const row = source.qr < 0 ? 0 : Math.floor(Number(source.qr) / 2);
    return {
      qc: clamp(column + Number(dx || 0), 0, GRID - 1) * 2,
      qr: clamp(row + Number(dy || 0), 0, GRID - 1) * 2
    };
  }

  function editorCellForCursor(cursor) {
    if (!cursor || cursor.qc < 0 || cursor.qr < 0) return null;
    return {
      c: clamp(Math.floor(Number(cursor.qc) / 2), 0, GRID - 1),
      r: clamp(Math.floor(Number(cursor.qr) / 2), 0, GRID - 1)
    };
  }

  function nextEditorPatternIndex(index, delta) {
    const count = ORIGINAL_EDITOR_PATTERNS.length;
    const current = Math.floor(Number(index) || 0);
    const change = Math.floor(Number(delta) || 0);
    return ((current + change) % count + count) % count;
  }

  function editorPatternAt(index) {
    return ORIGINAL_EDITOR_PATTERNS[index] || ORIGINAL_EDITOR_PATTERNS[0];
  }

  function editorBrushAt(x, y, legendX, legendY) {
    for (let index = 0; index < EDITOR_TILE_TYPES.length; index += 1) {
      const px = legendX + (index % 2) * 14;
      const py = legendY + Math.floor(index / 2) * 18;
      if (x >= px && x < px + 10 && y >= py && y < py + 10) {
        return EDITOR_TILE_TYPES[index];
      }
    }
    return null;
  }

  function nextEditorTileType(type) {
    return type === ICE ? EMPTY : type + 1;
  }

  function quadrantType(cell, quadrant) {
    if (
      cell &&
      (cell.type === BRICK || cell.type === STEEL) &&
      !(cell.mask & (1 << quadrant))
    ) return EMPTY;
    return cell ? cell.type : EMPTY;
  }

  function setEditorQuadrant(grid, qc, qr, type) {
    const column = Math.floor(qc / 2);
    const row = Math.floor(qr / 2);
    const quadrant = (qr % 2) * 2 + (qc % 2);
    const cell = grid[row][column];
    if (type === BRICK || type === STEEL) {
      if (cell.type !== type) {
        cell.type = type;
        cell.mask = 0;
        cell.brickMask = 0;
        cell.steelHits = [0, 0, 0, 0];
      }
      cell.mask |= 1 << quadrant;
      if (type === BRICK) cell.brickMask |= BRICK_QUARTER_FRAGMENT_MASKS[quadrant];
    } else if (type === EMPTY && (cell.type === BRICK || cell.type === STEEL)) {
      cell.mask &= ~(1 << quadrant);
      if (cell.type === BRICK) {
        cell.brickMask &= ~BRICK_QUARTER_FRAGMENT_MASKS[quadrant];
      }
      if (!cell.mask) cell.type = EMPTY;
      cell.steelHits = [0, 0, 0, 0];
    } else {
      cell.type = type;
      cell.mask = 0;
      cell.brickMask = 0;
      cell.steelHits = [0, 0, 0, 0];
    }
    return cell;
  }

  return Object.freeze({
    EDITOR_TILE_TYPES,
    ORIGINAL_EDITOR_PATTERNS,
    editorBrushAt,
    editorCellForCursor,
    editorDirectionForCode,
    editorPatternAt,
    heldEditorDirection,
    isEditorDirectionCode,
    moveEditorCursor,
    nextEditorPatternIndex,
    nextEditorTileType,
    originalEditorButtonHeld,
    quadrantType,
    setEditorQuadrant
  });
});
