(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.projectileRenderRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") throw new Error("state.game must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!deps.sharedState || typeof deps.sharedState !== "object") {
      throw new Error("deps.sharedState must be an object");
    }
    if (!deps.FREE_SPRITE_MANIFEST || typeof deps.FREE_SPRITE_MANIFEST !== "object") {
      throw new Error("deps.FREE_SPRITE_MANIFEST must be an object");
    }
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    if (typeof callbacks.drawScaledManifestSprite !== "function") {
      throw new Error("callbacks.drawScaledManifestSprite must be a function");
    }
  }

  /** Owns bullet sprite scaling, field offset, and owner-specific palette selection. */
  function setupProjectileRenderRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var shared = deps.sharedState;
    var spriteManifest = deps.FREE_SPRITE_MANIFEST;
    var fieldX = shared.FIELD_X;
    var fieldY = shared.FIELD_Y;
    var drawScaledManifestSprite = callbacks.drawScaledManifestSprite;

    function drawBullet(bullet) {
      var sprite = spriteManifest.sprites.bullet;
      var scale = bullet.w / (sprite && sprite.size ? sprite.size : bullet.w);
      drawScaledManifestSprite(
        "bullet",
        "default",
        Math.round(fieldX + bullet.x),
        Math.round(fieldY + bullet.y),
        scale,
        { primary: bullet.ownerKind === "player" ? "#f8e08b" : "#f7f1c6" }
      );
    }

    var api = { drawBullet: drawBullet };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupProjectileRenderRuntime: setupProjectileRenderRuntime });
});
