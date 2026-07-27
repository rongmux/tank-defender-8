(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.enemyUpdateRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = [
    "explosionRule",
    "gameSettings",
    "shoot",
    "shouldEnemyFire",
    "updateEnemyMovement"
  ];

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (typeof deps.advanceEnemyDestructionState !== "function") {
      throw new Error("deps.advanceEnemyDestructionState must be a function");
    }
    if (typeof deps.isEnemyMovementFrame !== "function") {
      throw new Error("deps.isEnemyMovementFrame must be a function");
    }
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    for (var i = 0; i < CALLBACK_NAMES.length; i += 1) {
      var name = CALLBACK_NAMES[i];
      if (typeof callbacks[name] !== "function") {
        throw new Error("callbacks." + name + " must be a function");
      }
    }
  }

  /** Registers fixed-frame enemy destruction, freeze, reload, movement, and fire scheduling. */
  function setupEnemyUpdateRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var game = state.game;
    var gameSettings = callbacks.gameSettings;
    var explosionRule = callbacks.explosionRule;
    var shoot = callbacks.shoot;
    var shouldEnemyFire = callbacks.shouldEnemyFire;
    var updateEnemyMovement = callbacks.updateEnemyMovement;

    function isEnemyTimeFrozen() {
      return game.freezeTimer > 0 && gameSettings().timerFreezesEnemyTime;
    }

    function updateEnemyDestruction(enemy) {
      var released = deps.advanceEnemyDestructionState(
        enemy,
        deps.isEnemyMovementFrame(enemy, game.frameLow),
        explosionRule("enemyDestroy").ttl
      );
      if (released) game.enemyKilled += 1;
    }

    function updateEnemies() {
      var enemyTimeFrozen = isEnemyTimeFrozen();

      for (var i = 0; i < game.enemies.length; i += 1) {
        var enemy = game.enemies[i];
        if (!enemy.alive) continue;
        if (enemy.destroying) {
          updateEnemyDestruction(enemy);
          continue;
        }
        if (enemy.spawnFlash > 0) {
          enemy.spawnFlash -= 1;
          continue;
        }
        if (enemyTimeFrozen) continue;
        if (enemy.reload > 0) enemy.reload -= 1;
        updateEnemyMovement(enemy);
        if (enemy.reload <= 0 && shouldEnemyFire(enemy)) shoot(enemy);
      }
    }

    var api = {
      updateEnemies: updateEnemies,
      isEnemyTimeFrozen: isEnemyTimeFrozen,
      updateEnemyDestruction: updateEnemyDestruction
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupEnemyUpdateRuntime: setupEnemyUpdateRuntime });
});
