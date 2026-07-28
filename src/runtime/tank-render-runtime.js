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
      drawTank: drawTank
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupTankRenderRuntime: setupTankRenderRuntime });
});
