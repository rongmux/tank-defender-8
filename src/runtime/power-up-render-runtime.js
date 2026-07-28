(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.powerUpRenderRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") throw new Error("state.game must be an object");
    if (!state.ctx || typeof state.ctx !== "object") throw new Error("state.ctx must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!deps.sharedState || typeof deps.sharedState !== "object") {
      throw new Error("deps.sharedState must be an object");
    }
    if (!deps.FREE_SPRITE_MANIFEST || typeof deps.FREE_SPRITE_MANIFEST !== "object") {
      throw new Error("deps.FREE_SPRITE_MANIFEST must be an object");
    }
    if (typeof deps.POWERUP_SIZE !== "number") throw new Error("deps.POWERUP_SIZE must be a number");
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    if (typeof callbacks.battleDisplayFrame !== "function") {
      throw new Error("callbacks.battleDisplayFrame must be a function");
    }
    if (typeof callbacks.drawManifestSprite !== "function") {
      throw new Error("callbacks.drawManifestSprite must be a function");
    }
  }

  /** Owns power-up visibility, visual geometry, background frame, and icon rendering. */
  function setupPowerUpRenderRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var shared = deps.sharedState;
    var ctx = state.ctx;
    var game = state.game;
    var fieldX = shared.FIELD_X;
    var fieldY = shared.FIELD_Y;
    var spriteManifest = deps.FREE_SPRITE_MANIFEST;
    var powerUpSize = deps.POWERUP_SIZE;
    var battleDisplayFrame = callbacks.battleDisplayFrame;
    var drawManifestSprite = callbacks.drawManifestSprite;

    function drawPowerUp(power) {
      if (!isPowerUpVisible(battleDisplayFrame())) return;
      var visual = powerUpVisualRect(power);
      var x = visual.x;
      var y = visual.y;
      ctx.fillStyle = "#102748";
      ctx.fillRect(x, y, visual.w, visual.h);
      ctx.fillStyle = "#aab4c2";
      ctx.fillRect(x + 2, y + 2, visual.w - 4, visual.h - 4);
      ctx.fillStyle = "#dbe1e8";
      ctx.fillRect(x + 3, y + 3, visual.w - 6, 1);
      drawManifestSprite("powerUp", power.type, x, y, {
        outline: "#102748",
        primary: "#f3f0d4",
        shade: "#77869a",
        cutout: "#aab4c2"
      });
    }

    function isPowerUpVisible(tick) {
      return (Math.max(0, Math.floor(Number(tick) || 0)) & 8) !== 0;
    }

    function powerUpVisualRect(power) {
      var sprite = spriteManifest.sprites.powerUp;
      var size = sprite && sprite.size ? sprite.size : powerUpSize;
      var inset = (size - power.w) / 2;
      return {
        x: fieldX + power.x - inset,
        y: fieldY + power.y - inset,
        w: size,
        h: size
      };
    }

    var api = {
      drawPowerUp: drawPowerUp,
      isPowerUpVisible: isPowerUpVisible,
      powerUpVisualRect: powerUpVisualRect
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupPowerUpRenderRuntime: setupPowerUpRenderRuntime });
});
