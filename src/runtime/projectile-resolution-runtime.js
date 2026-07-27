(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.projectileResolutionRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = [
    "gameSettings",
    "addRuleExplosion",
    "hitTerrain",
    "hitBase",
    "hitTank",
    "playSound"
  ];

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!deps.sharedState || typeof deps.sharedState !== "object") {
      throw new Error("deps.sharedState must be an object");
    }
    if (typeof deps.projectileOutsideField !== "function") {
      throw new Error("deps.projectileOutsideField must be a function");
    }
    if (typeof deps.projectileBoundaryImpactPoint !== "function") {
      throw new Error("deps.projectileBoundaryImpactPoint must be a function");
    }
    if (typeof deps.wallHitSoundName !== "function") {
      throw new Error("deps.wallHitSoundName must be a function");
    }
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    for (var i = 0; i < CALLBACK_NAMES.length; i += 1) {
      var name = CALLBACK_NAMES[i];
      if (typeof callbacks[name] !== "function") {
        throw new Error("callbacks." + name + " must be a function");
      }
    }
  }

  /** Registers the fixed boundary, terrain, base, and tank hit dispatch order. */
  function setupProjectileResolutionRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var shared = deps.sharedState;
    var gameSettings = callbacks.gameSettings;
    var addRuleExplosion = callbacks.addRuleExplosion;
    var hitTerrain = callbacks.hitTerrain;
    var hitBase = callbacks.hitBase;
    var hitTank = callbacks.hitTank;
    var playSound = callbacks.playSound;

    function resolveBullet(bullet) {
      var padding = gameSettings().projectileRules.boundsPadding;
      if (deps.projectileOutsideField(bullet, shared.FIELD_W, shared.FIELD_H, padding)) {
        var impact = deps.projectileBoundaryImpactPoint(bullet, shared.FIELD_W, shared.FIELD_H);
        bullet.remove = true;
        addRuleExplosion("steelBlocked", impact.x, impact.y);
        var sound = deps.wallHitSoundName(bullet, true, false);
        if (sound) playSound(sound);
        return;
      }

      if (hitTerrain(bullet)) return;
      if (hitBase(bullet)) return;
      hitTank(bullet);
    }

    var api = { resolveBullet: resolveBullet };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupProjectileResolutionRuntime: setupProjectileResolutionRuntime });
});
