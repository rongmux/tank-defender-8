(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.projectileMotionRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!Array.isArray(deps.DIR_X) || !Array.isArray(deps.DIR_Y)) {
      throw new Error("deps.DIR_X and deps.DIR_Y must be arrays");
    }
    if (typeof deps.resolveBulletCollisions !== "function") {
      throw new Error("deps.resolveBulletCollisions must be a function");
    }
    if (!callbacks || typeof callbacks.resolveBullet !== "function") {
      throw new Error("callbacks.resolveBullet must be a function");
    }
  }

  /** Registers the fixed-frame projectile stepping and post-step cancellation pass. */
  function setupProjectileMotionRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var game = state.game;

    function updateBullets() {
      for (var i = 0; i < game.bullets.length; i += 1) game.bullets[i].remove = false;

      for (var b = 0; b < game.bullets.length; b += 1) {
        var bullet = game.bullets[b];
        if (bullet.remove) continue;
        var steps = Math.max(1, Math.ceil(bullet.speed));
        for (var step = 0; step < steps && !bullet.remove; step += 1) {
          bullet.x += (deps.DIR_X[bullet.dir] * bullet.speed) / steps;
          bullet.y += (deps.DIR_Y[bullet.dir] * bullet.speed) / steps;
          callbacks.resolveBullet(bullet);
        }
      }

      deps.resolveBulletCollisions(game.bullets);
      game.bullets = game.bullets.filter(function (bullet) { return !bullet.remove; });
    }

    var api = { updateBullets: updateBullets };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupProjectileMotionRuntime: setupProjectileMotionRuntime });
});
