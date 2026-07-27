(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.projectileRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var FUNCTION_NAMES = ["gameSettings", "playSound"];

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (typeof deps.clamp !== "function") throw new Error("deps.clamp must be a function");
    if (typeof deps.createProjectileState !== "function") {
      throw new Error("deps.createProjectileState must be a function");
    }
    if (!Array.isArray(deps.DEFAULT_PLAYER_UPGRADE_RULES)) {
      throw new Error("deps.DEFAULT_PLAYER_UPGRADE_RULES must be an array");
    }
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    for (var i = 0; i < FUNCTION_NAMES.length; i += 1) {
      var name = FUNCTION_NAMES[i];
      if (typeof callbacks[name] !== "function") {
        throw new Error("callbacks." + name + " must be a function");
      }
    }
  }

  /** Registers fixed-frame firing, player upgrade lookup, and projectile creation. */
  function setupProjectileRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var game = state.game;
    var gameSettings = callbacks.gameSettings;
    var playSound = callbacks.playSound;

    function playerUpgradeRule(level) {
      var rules = gameSettings().playerUpgradeRules || deps.DEFAULT_PLAYER_UPGRADE_RULES;
      return rules[deps.clamp(Math.floor(level || 0), 0, rules.length - 1)];
    }

    function createBullet(tank, key, upgrade) {
      return deps.createProjectileState({
        tank: tank,
        ownerKey: key,
        upgrade: upgrade,
        rules: gameSettings().projectileRules
      });
    }

    function shoot(tank) {
      if (!tank.alive || tank.destroying || tank.reload > 0 || tank.spawnFlash > 0) return;
      var key = tank.kind + ":" + tank.id;
      var upgrade = tank.kind === "player" ? playerUpgradeRule(tank.level) : null;
      var maxBullets = upgrade ? upgrade.maxBullets : 1;
      var active = game.bullets.filter(function (bullet) { return bullet.ownerKey === key; }).length;
      if (active >= maxBullets) return;

      game.bullets.push(createBullet(tank, key, upgrade));
      tank.reload = upgrade ? upgrade.reload : tank.reloadBase;
      if (tank.kind === "player") playSound("playerShoot");
    }

    var api = {
      shoot: shoot,
      createBullet: createBullet,
      playerUpgradeRule: playerUpgradeRule
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupProjectileRuntime: setupProjectileRuntime });
});
