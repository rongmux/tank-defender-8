(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.terrainRenderRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = [
    "drawManifestSprite",
    "normalizeBrickFragmentMask",
    "quarterMaskFromBrickFragments"
  ];

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") throw new Error("state.game must be an object");
    if (!state.ctx || typeof state.ctx !== "object") throw new Error("state.ctx must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!deps.sharedState || typeof deps.sharedState !== "object") {
      throw new Error("deps.sharedState must be an object");
    }
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    for (var i = 0; i < CALLBACK_NAMES.length; i += 1) {
      var name = CALLBACK_NAMES[i];
      if (typeof callbacks[name] !== "function") {
        throw new Error("callbacks." + name + " must be a function");
      }
    }
  }

  /** Owns terrain, base, and projectile-cover Canvas rendering. */
  function setupTerrainRenderRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var shared = deps.sharedState;
    var ctx = state.ctx;
    var game = state.game;
    var tile = shared.TILE;
    var half = shared.HALF;
    var gridSize = shared.GRID;
    var fieldX = shared.FIELD_X;
    var fieldY = shared.FIELD_Y;
    var fieldWidth = shared.FIELD_W;
    var fieldHeight = shared.FIELD_H;
    var brick = deps.BRICK;
    var steel = deps.STEEL;
    var water = deps.WATER;
    var forest = deps.FOREST;
    var ice = deps.ICE;
    var brickQuarterFragmentMasks = deps.BRICK_QUARTER_FRAGMENT_MASKS;
    var wallFragment = deps.WALL_FRAGMENT;
    var drawManifestSprite = callbacks.drawManifestSprite;
    var normalizeBrickFragmentMask = callbacks.normalizeBrickFragmentMask;
    var quarterMaskFromBrickFragments = callbacks.quarterMaskFromBrickFragments;

    function renderGameBackdrop(grid) {
      ctx.fillStyle = "#6b6f78";
      ctx.fillRect(0, 0, shared.SCREEN_W, shared.SCREEN_H);
      ctx.fillStyle = "#000";
      ctx.fillRect(fieldX, fieldY, fieldWidth, fieldHeight);
      renderTerrain(false, grid);
      renderTerrain(true, grid);
    }

    function renderTerrain(topLayer, grid) {
      for (var row = 0; row < gridSize; row += 1) {
        for (var column = 0; column < gridSize; column += 1) {
          var cell = grid[row][column];
          var x = fieldX + column * tile;
          var y = fieldY + row * tile;
          if (topLayer) {
            if (cell.type === forest) drawForest(x, y);
            continue;
          }
          if (cell.type === brick) drawBrickCell(x, y, cell);
          else if (cell.type === steel) drawWallCell(x, y, cell.mask, "#626a76", "#c9d0d9");
          else if (cell.type === water) drawWater(x, y);
          else if (cell.type === ice) drawIce(x, y);
        }
      }
    }

    function drawWallCell(x, y, mask, dark, light) {
      var frameName = dark === "#a24f32" ? "brick" : "steel";
      for (var quarter = 0; quarter < 4; quarter += 1) {
        if (!(mask & (1 << quarter))) continue;
        var quarterX = x + (quarter % 2) * half;
        var quarterY = y + (quarter >= 2 ? half : 0);
        drawManifestSprite("wallQuarter", frameName, quarterX, quarterY, {
          dark: dark,
          light: light,
          seam: frameName === "steel" ? "#5a6370" : light,
          bolt: frameName === "steel" ? "#333943" : dark,
          shadow: "#1b1512"
        });
      }
    }

    function drawBrickCell(x, y, cell) {
      var fragments = normalizeBrickFragmentMask(cell.brickMask, cell.mask);
      drawWallCell(x, y, quarterMaskFromBrickFragments(fragments), "#a24f32", "#d38658");
      ctx.fillStyle = "#000000";
      for (var fragment = 0; fragment < 16; fragment += 1) {
        var quarter = Math.floor(fragment / 8) * 2 + Math.floor((fragment % 4) / 2);
        if (!(fragments & brickQuarterFragmentMasks[quarter])) continue;
        if (fragments & (1 << fragment)) continue;
        ctx.fillRect(
          x + (fragment % 4) * wallFragment,
          y + Math.floor(fragment / 4) * wallFragment,
          wallFragment,
          wallFragment
        );
      }
    }

    function drawWater(x, y) {
      var frame = waterFrameName(game.frameLow);
      drawManifestSprite("terrain", frame, x, y, {
        base: "#173b67",
        wave: frame === "waterA" ? "#56a6d5" : "#2d789e"
      });
    }

    function waterFrameName(tick) {
      return (Math.max(0, Math.floor(Number(tick) || 0)) & 32) === 0 ? "waterA" : "waterB";
    }

    function drawIce(x, y) {
      drawManifestSprite("terrain", "ice", x, y, {
        base: "#b7c8d8",
        highlight: "#f1f8ff",
        shadow: "#7e96aa"
      });
    }

    function renderProjectileTerrainCover(grid) {
      for (var row = 0; row < gridSize; row += 1) {
        for (var column = 0; column < gridSize; column += 1) {
          if (grid[row][column].type === ice) {
            drawIceProjectileCover(fieldX + column * tile, fieldY + row * tile);
          }
        }
      }
    }

    function drawIceProjectileCover(x, y) {
      ctx.fillStyle = "rgba(241, 248, 255, 0.72)";
      ctx.fillRect(x + 2, y + 2, 10, 1);
      ctx.fillRect(x + 4, y + 7, 9, 1);
      ctx.fillStyle = "rgba(126, 150, 170, 0.42)";
      ctx.fillRect(x + 1, y + 14, 14, 1);
    }

    function drawForest(x, y) {
      drawManifestSprite("terrain", "forest", x, y, {
        base: "#315b34",
        light: "#3f7f42",
        dark: "#244327"
      });
    }

    function renderBase() {
      var x = fieldX + game.base.x;
      var y = fieldY + game.base.y;
      drawManifestSprite("base", game.base.alive ? "alive" : "dead", x, y, {
        primary: game.base.alive ? "#d8c17a" : "#5c514a",
        shadow: game.base.alive ? "#181818" : "#2e2624"
      });
    }

    var api = {
      drawBrickCell: drawBrickCell,
      drawForest: drawForest,
      drawIce: drawIce,
      drawIceProjectileCover: drawIceProjectileCover,
      drawWallCell: drawWallCell,
      drawWater: drawWater,
      renderBase: renderBase,
      renderGameBackdrop: renderGameBackdrop,
      renderProjectileTerrainCover: renderProjectileTerrainCover,
      renderTerrain: renderTerrain,
      waterFrameName: waterFrameName
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupTerrainRenderRuntime: setupTerrainRenderRuntime });
});
