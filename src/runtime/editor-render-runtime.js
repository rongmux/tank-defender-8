(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.editorRenderRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = [
    "createStageGrid",
    "drawBrickCell",
    "drawForest",
    "drawIce",
    "drawManifestSprite",
    "drawWallCell",
    "drawWater",
    "renderBase",
    "renderTerrain"
  ];

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") throw new Error("state.game must be an object");
    if (!state.ctx || typeof state.ctx !== "object") throw new Error("state.ctx must be an object");
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!deps.sharedState || typeof deps.sharedState !== "object") {
      throw new Error("deps.sharedState must be an object");
    }
    if (!Array.isArray(deps.EDITOR_TILE_TYPES)) {
      throw new Error("deps.EDITOR_TILE_TYPES must be an array");
    }
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    for (var i = 0; i < CALLBACK_NAMES.length; i += 1) {
      var name = CALLBACK_NAMES[i];
      if (typeof callbacks[name] !== "function") {
        throw new Error("callbacks." + name + " must be a function");
      }
    }
  }

  /** Owns Construction battlefield layers, cursor blink, and tile legend rendering. */
  function setupEditorRenderRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var ctx = state.ctx;
    var game = state.game;
    var shared = deps.sharedState;
    var screenWidth = shared.SCREEN_W;
    var screenHeight = shared.SCREEN_H;
    var fieldX = shared.FIELD_X;
    var fieldY = shared.FIELD_Y;
    var fieldWidth = shared.FIELD_W;
    var fieldHeight = shared.FIELD_H;
    var tile = shared.TILE;
    var quadGrid = shared.QUAD_GRID;
    var editorTileTypes = deps.EDITOR_TILE_TYPES;
    var brick = deps.BRICK;
    var steel = deps.STEEL;
    var water = deps.WATER;
    var forest = deps.FOREST;
    var ice = deps.ICE;
    var createStageGrid = callbacks.createStageGrid;
    var drawBrickCell = callbacks.drawBrickCell;
    var drawForest = callbacks.drawForest;
    var drawIce = callbacks.drawIce;
    var drawManifestSprite = callbacks.drawManifestSprite;
    var drawWallCell = callbacks.drawWallCell;
    var drawWater = callbacks.drawWater;
    var renderBase = callbacks.renderBase;
    var renderTerrain = callbacks.renderTerrain;

    function renderEditor() {
      var grid = game.editorGrid || createStageGrid(game.stage);
      ctx.fillStyle = "#6b6f78";
      ctx.fillRect(0, 0, screenWidth, screenHeight);
      ctx.fillStyle = "#000";
      ctx.fillRect(fieldX, fieldY, fieldWidth, fieldHeight);
      renderTerrain(false, grid);
      renderBase();
      renderTerrain(true, grid);

      var cursor = game.editorCursor;
      if (
        cursor &&
        cursor.qc >= 0 && cursor.qc < quadGrid &&
        cursor.qr >= 0 && cursor.qr < quadGrid
      ) {
        drawEditorCursor(cursor);
      }
    }

    function drawEditorCursor(cursor) {
      var half = tile / 2;
      var cellX = fieldX + Math.floor(cursor.qc / 2) * tile;
      var cellY = fieldY + Math.floor(cursor.qr / 2) * tile;
      var quadrantX = fieldX + cursor.qc * half;
      var quadrantY = fieldY + cursor.qr * half;
      var editorTick = Math.max(0, Math.floor(Number(game.editorTick) || 0));
      var marker = Math.floor(editorTick / 8) % 2 === 0 ? "#fff0a8" : "#e3c64e";
      var previousFillStyle = ctx.fillStyle;
      var previousStrokeStyle = ctx.strokeStyle;

      // Keep the selection visible at all times while its palette gently cycles.
      ctx.strokeStyle = "#111111";
      ctx.strokeRect(cellX, cellY, tile - 1, tile - 1);
      ctx.strokeStyle = marker;
      ctx.strokeRect(cellX + 1, cellY + 1, tile - 3, tile - 3);
      ctx.strokeStyle = "#111111";
      ctx.strokeRect(quadrantX, quadrantY, half - 1, half - 1);
      ctx.strokeStyle = marker;
      ctx.strokeRect(quadrantX + 1, quadrantY + 1, half - 3, half - 3);
      ctx.fillStyle = marker;
      ctx.fillRect(quadrantX, quadrantY, 2, 2);
      ctx.fillRect(quadrantX + half - 2, quadrantY, 2, 2);
      ctx.fillRect(quadrantX, quadrantY + half - 2, 2, 2);
      ctx.fillRect(quadrantX + half - 2, quadrantY + half - 2, 2, 2);
      ctx.fillStyle = previousFillStyle;
      ctx.strokeStyle = previousStrokeStyle;
    }

    function drawTileLegend(x, y) {
      for (var i = 0; i < editorTileTypes.length; i += 1) {
        var px = x + (i % 2) * 14;
        var py = y + Math.floor(i / 2) * 18;
        ctx.fillStyle = "#000";
        ctx.fillRect(px, py, 10, 10);
        var cell = { type: editorTileTypes[i], mask: 15 };
        if (cell.type === brick) drawBrickCell(px, py, cell);
        else if (cell.type === steel) drawWallCell(px, py, cell.mask, "#626a76", "#c9d0d9");
        else if (cell.type === water) drawWater(px, py);
        else if (cell.type === forest) drawForest(px, py);
        else if (cell.type === ice) drawIce(px, py);
        else {
          ctx.strokeStyle = "#575b64";
          ctx.strokeRect(px, py, 10, 10);
        }
        if (cell.type === game.editorBrush) {
          ctx.strokeStyle = "#e0b84b";
          ctx.strokeRect(px, py, 10, 10);
        }
      }
    }

    var api = {
      drawTileLegend: drawTileLegend,
      renderEditor: renderEditor
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupEditorRenderRuntime: setupEditorRenderRuntime });
});
