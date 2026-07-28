(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.editorInputRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = ["playSound", "showEditorMessage", "tileTypeName"];
  var DEP_NAMES = [
    "EDITOR_TILE_TYPES",
    "editorBrushAt",
    "editorCellForCursor",
    "editorDirectionForCode",
    "editorPatternAt",
    "heldEditorDirection",
    "moveEditorCursor",
    "nextEditorPatternIndex",
    "nextEditorTileType",
    "originalEditorButtonHeld",
    "quadrantType",
    "setEditorQuadrant",
    "setTile"
  ];

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!state.keys || typeof state.keys.has !== "function") {
      throw new Error("state.keys must provide has");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!deps.sharedState || typeof deps.sharedState !== "object") {
      throw new Error("deps.sharedState must be an object");
    }
    for (var i = 0; i < DEP_NAMES.length; i += 1) {
      var depName = DEP_NAMES[i];
      if (typeof deps[depName] !== "function" && depName !== "EDITOR_TILE_TYPES") {
        throw new Error("deps." + depName + " must be a function");
      }
    }
    if (!Array.isArray(deps.EDITOR_TILE_TYPES)) {
      throw new Error("deps.EDITOR_TILE_TYPES must be an array");
    }
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    for (var j = 0; j < CALLBACK_NAMES.length; j += 1) {
      var callbackName = CALLBACK_NAMES[j];
      if (typeof callbacks[callbackName] !== "function") {
        throw new Error("callbacks." + callbackName + " must be a function");
      }
    }
  }

  /** Owns the fixed-frame input and mutation orchestration for Construction mode. */
  function setupEditorInputRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var game = state.game;
    var keys = state.keys;
    var shared = deps.sharedState;
    var editorTileTypes = deps.EDITOR_TILE_TYPES;
    var playSound = callbacks.playSound;
    var showEditorMessage = callbacks.showEditorMessage;
    var tileTypeName = callbacks.tileTypeName;

    function moveEditorFromCode(code) {
      var direction = deps.editorDirectionForCode(code);
      if (!direction) return;
      game.editorMoveHoldTimer = 0;
      moveEditorCursor(direction.dx, direction.dy);
      if (deps.originalEditorButtonHeld(keys)) pasteOriginalEditorPattern();
    }

    function moveEditorCursor(dx, dy) {
      if (game.screen !== "editor") return;
      game.editorCursor = deps.moveEditorCursor(game.editorCursor, dx, dy);
      game.editorPatternArmed = false;
    }

    function useOriginalEditorButton(delta) {
      if (!game.editorGrid) return;
      if (game.editorPatternArmed) {
        game.editorPattern = deps.nextEditorPatternIndex(game.editorPattern, delta);
      } else {
        game.editorPatternArmed = true;
      }
      var pattern = deps.editorPatternAt(game.editorPattern);
      game.editorBrush = pattern.type;
      pasteOriginalEditorPattern();
    }

    function pasteOriginalEditorPattern() {
      if (!game.editorGrid) return;
      var cell = deps.editorCellForCursor(game.editorCursor);
      if (!cell) return;
      var pattern = deps.editorPatternAt(game.editorPattern);
      deps.setTile(game.editorGrid, cell.c, cell.r, pattern.type, pattern.mask);
      playSound("editorPaint", { brush: pattern.type });
    }

    function editAtEditorCursor(fullTile) {
      var cursor = game.editorCursor;
      if (!cursor || cursor.qc < 0 || cursor.qr < 0) return;
      if (fullTile) {
        paintEditorCell(Math.floor(cursor.qc / 2), Math.floor(cursor.qr / 2));
      } else {
        paintEditorQuadrant(cursor.qc, cursor.qr);
      }
    }

    function paintEditorCell(column, row) {
      if (!game.editorGrid || column < 0 || column >= shared.GRID || row < 0 || row >= shared.GRID) return;
      deps.setTile(game.editorGrid, column, row, game.editorBrush, 15);
      playSound("editorPaint", { brush: game.editorBrush });
    }

    function paintEditorQuadrant(column, row) {
      if (!game.editorGrid || column < 0 || column >= shared.QUAD_GRID || row < 0 || row >= shared.QUAD_GRID) return;
      deps.setEditorQuadrant(game.editorGrid, column, row, game.editorBrush);
      playSound("editorPaintSubtile", { brush: game.editorBrush });
    }

    function selectEditorBrush(type) {
      if (editorTileTypes.indexOf(type) < 0) return;
      game.editorBrush = type;
      showEditorMessage(tileTypeName(type).toUpperCase().slice(0, 6));
      playSound("editorBrush", { brush: type });
    }

    function selectEditorBrushFromPanel(x, y) {
      var type = deps.editorBrushAt(x, y, shared.PANEL_X + 12, 176);
      if (type !== null) selectEditorBrush(type);
    }

    function cycleEditorCell(column, row) {
      if (!game.editorGrid || column < 0 || column >= shared.GRID || row < 0 || row >= shared.GRID) return;
      var current = game.editorGrid[row][column].type;
      var nextType = deps.nextEditorTileType(current);
      deps.setTile(game.editorGrid, column, row, nextType, 15);
      playSound("editorPaint", { brush: nextType });
    }

    function cycleEditorQuadrant(column, row) {
      if (!game.editorGrid || column < 0 || column >= shared.QUAD_GRID || row < 0 || row >= shared.QUAD_GRID) return;
      var cellColumn = Math.floor(column / 2);
      var cellRow = Math.floor(row / 2);
      var quadrant = (row % 2) * 2 + (column % 2);
      var cell = game.editorGrid[cellRow][cellColumn];
      var current = deps.quadrantType(cell, quadrant);
      var nextType = deps.nextEditorTileType(current);
      deps.setEditorQuadrant(game.editorGrid, column, row, nextType);
      playSound("editorPaintSubtile", { brush: nextType });
    }

    function updateEditorControls() {
      game.editorTick += 1;
      var direction = deps.heldEditorDirection(keys);
      if (!direction) {
        game.editorMoveHoldTimer = 0;
        return;
      }
      game.editorPatternArmed = false;
      game.editorMoveHoldTimer += 1;
      if (game.editorMoveHoldTimer < 20) return;
      game.editorMoveHoldTimer = 15;
      moveEditorCursor(direction.dx, direction.dy);
      if (deps.originalEditorButtonHeld(keys)) pasteOriginalEditorPattern();
    }

    var api = {
      moveEditorFromCode: moveEditorFromCode,
      moveEditorCursor: moveEditorCursor,
      useOriginalEditorButton: useOriginalEditorButton,
      pasteOriginalEditorPattern: pasteOriginalEditorPattern,
      editAtEditorCursor: editAtEditorCursor,
      paintEditorCell: paintEditorCell,
      paintEditorQuadrant: paintEditorQuadrant,
      selectEditorBrush: selectEditorBrush,
      selectEditorBrushFromPanel: selectEditorBrushFromPanel,
      cycleEditorCell: cycleEditorCell,
      cycleEditorQuadrant: cycleEditorQuadrant,
      updateEditorControls: updateEditorControls
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupEditorInputRuntime: setupEditorInputRuntime });
});
