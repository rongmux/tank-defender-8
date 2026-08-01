(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.tankRenderRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = [
    "battleDisplayFrame",
    "directionName",
    "drawManifestSprite",
    "drawScaledManifestSprite",
    "gameSettings",
    "playerUpgradeOverlayParts",
    "shieldColorForTick",
    "spawnAnimationPresentation",
    "tankPrimaryColor",
    "tankTrackFrameName"
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

  /** Owns tank, upgrade overlay, shield, and spawn-animation Canvas rendering. */
  function setupTankRenderRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var shared = deps.sharedState;
    var ctx = state.ctx;
    var game = state.game;
    var fieldX = shared.FIELD_X;
    var fieldY = shared.FIELD_Y;
    var overlayColors = deps.PLAYER_UPGRADE_OVERLAY_COLORS;
    var battleDisplayFrame = callbacks.battleDisplayFrame;
    var directionName = callbacks.directionName;
    var drawManifestSprite = callbacks.drawManifestSprite;
    var drawScaledManifestSprite = callbacks.drawScaledManifestSprite;
    var gameSettings = callbacks.gameSettings;
    var playerUpgradeOverlayParts = callbacks.playerUpgradeOverlayParts;
    var shieldColorForTick = callbacks.shieldColorForTick;
    var spawnAnimationPresentation = callbacks.spawnAnimationPresentation;
    var tankPrimaryColor = callbacks.tankPrimaryColor;
    var tankTrackFrameName = callbacks.tankTrackFrameName;

    function drawTank(tank, color, accent) {
      var x = Math.round(fieldX + tank.x);
      var y = Math.round(fieldY + tank.y);
      var primary = tankPrimaryColor(tank, color, battleDisplayFrame());
      drawManifestSprite("tank", directionName(tank.dir), x, y, {
        primary: primary,
        accent: accent,
        shadow: "#111111"
      });
      drawManifestSprite("tankTracks", tankTrackFrameName(tank), x, y, {
        primary: primary,
        shadow: "#111111"
      });
      if (tank.kind === "player") drawPlayerUpgradeOverlay(tank, x, y, accent);
      else drawEnemyTypeDetails(tank, x, y);
    }

    function drawEnemyTypeDetails(tank, x, y) {
      var type = Math.max(0, Math.min(3, Math.floor(Number(tank.typeIndex) || 0)));
      if (type === 0) return;
      if (type === 1) {
        ctx.fillStyle = "#111111";
        ctx.fillRect(x + 1, y + 4, 2, 2);
        ctx.fillRect(x + 11, y + 8, 2, 2);
        return;
      }
      if (type === 2) {
        ctx.fillStyle = "#f3f0d4";
        var direction = directionName(tank.dir);
        if (direction === "up") {
          ctx.fillRect(x + 5, y, 1, 5);
          ctx.fillRect(x + 8, y, 1, 5);
        } else if (direction === "down") {
          ctx.fillRect(x + 5, y + 9, 1, 5);
          ctx.fillRect(x + 8, y + 9, 1, 5);
        } else if (direction === "left") {
          ctx.fillRect(x, y + 5, 5, 1);
          ctx.fillRect(x, y + 8, 5, 1);
        } else {
          ctx.fillRect(x + 9, y + 5, 5, 1);
          ctx.fillRect(x + 9, y + 8, 5, 1);
        }
        return;
      }
      drawArmorPlate(x, y);
    }

    function drawArmorPlate(x, y) {
      var previousFillStyle = ctx.fillStyle;
      var previousStrokeStyle = ctx.strokeStyle;
      ctx.fillStyle = "#f3f0d4";
      ctx.fillRect(x + 3, y + 3, 8, 8);
      ctx.fillStyle = "#111111";
      ctx.fillRect(x + 5, y + 5, 4, 4);
      ctx.strokeStyle = "#b0b5c3";
      ctx.strokeRect(x + 2, y + 2, 10, 10);
      ctx.fillStyle = previousFillStyle;
      ctx.strokeStyle = previousStrokeStyle;
    }

    function drawTankForestOutline(tank) {
      var x = Math.round(fieldX + tank.x);
      var y = Math.round(fieldY + tank.y);
      var previousStrokeStyle = ctx.strokeStyle;
      var previousLineWidth = ctx.lineWidth;
      ctx.strokeStyle = "#f3f0d4";
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 1, y + 1, 12, 12);
      var direction = directionName(tank.dir);
      if (direction === "up") ctx.strokeRect(x + 6, y, 2, 5);
      else if (direction === "down") ctx.strokeRect(x + 6, y + 9, 2, 5);
      else if (direction === "left") ctx.strokeRect(x, y + 6, 5, 2);
      else ctx.strokeRect(x + 9, y + 6, 5, 2);
      ctx.strokeStyle = previousStrokeStyle;
      ctx.lineWidth = previousLineWidth;
    }

    function drawPlayerUpgradeOverlay(tank, x, y, accent) {
      var parts = playerUpgradeOverlayParts(tank.level, tank.dir);
      if (!parts.length) return;
      var palette = {
        level1: accent || overlayColors.level1,
        level2: overlayColors.level2,
        level3: overlayColors.level3
      };
      for (var index = 0; index < parts.length; index += 1) {
        var part = parts[index];
        var rect = part.rect;
        ctx.fillStyle = palette[part.role] || overlayColors.level1;
        ctx.fillRect(x + rect[0], y + rect[1], rect[2], rect[3]);
      }
    }

    function drawShield(tank) {
      var x = Math.round(fieldX + tank.x - 2);
      var y = Math.round(fieldY + tank.y - 2);
      ctx.lineWidth = 1;
      drawManifestSprite("shield", "box", x, y, {
        primary: shieldColorForTick(game.frameLow)
      });
    }

    function drawSpawn(tank) {
      var x = Math.round(fieldX + tank.x + 7);
      var y = Math.round(fieldY + tank.y + 7);
      var total = tank.kind === "player"
        ? gameSettings().timings.playerSpawnFlash
        : gameSettings().timings.enemySpawnFlash;
      var presentation = spawnAnimationPresentation(tank.spawnFlash, total);
      var scale = presentation.size / 14;
      drawScaledManifestSprite(
        "spawn",
        "box",
        x - presentation.size / 2,
        y - presentation.size / 2,
        scale,
        { primary: "#f3f0d4" }
      );
    }

    var api = {
      drawPlayerUpgradeOverlay: drawPlayerUpgradeOverlay,
      drawShield: drawShield,
      drawSpawn: drawSpawn,
      drawTank: drawTank,
      drawTankForestOutline: drawTankForestOutline
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupTankRenderRuntime: setupTankRenderRuntime });
});
