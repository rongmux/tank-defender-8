(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.battleTimingRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = ["enemyTotal", "gameSettings"];

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (typeof deps.buildBaseWall !== "function") {
      throw new Error("deps.buildBaseWall must be a function");
    }
    if (typeof deps.shovelWallTypeForTimer !== "function") {
      throw new Error("deps.shovelWallTypeForTimer must be a function");
    }
    if (typeof deps.BRICK !== "number") throw new Error("deps.BRICK must be a number");
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    for (var i = 0; i < CALLBACK_NAMES.length; i += 1) {
      var name = CALLBACK_NAMES[i];
      if (typeof callbacks[name] !== "function") {
        throw new Error("callbacks." + name + " must be a function");
      }
    }
  }

  /** Owns fixed-frame battlefield timers and the stage-cleared predicate. */
  function setupBattleTimingRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var game = state.game;
    var buildBaseWall = deps.buildBaseWall;
    var gameSettings = callbacks.gameSettings;
    var enemyTotal = callbacks.enemyTotal;

    function isGlobalTimerTick(tick) {
      return (Math.max(0, Math.floor(Number(tick) || 0)) & 63) === 0;
    }

    function updateFreezeTimer() {
      if (game.freezeTimer > 0 && isGlobalTimerTick(game.frameLow)) game.freezeTimer -= 1;
    }

    function updateShovelTimer() {
      if (game.shovelTimer <= 0 || (game.frameLow & 15) !== 0) return;
      if (isGlobalTimerTick(game.frameLow)) {
        game.shovelTimer -= 1;
        if (game.shovelTimer <= 0) {
          buildBaseWall(game.grid, deps.BRICK);
          return;
        }
      }
      if (game.shovelTimer < gameSettings().powerUpDurations.shovelFlash) {
        buildBaseWall(game.grid, deps.shovelWallTypeForTimer(
          game.shovelTimer,
          game.frameLow,
          gameSettings().powerUpDurations.shovelFlash
        ));
      }
    }

    function updatePlayerInvulnerabilityTimers() {
      if (!isGlobalTimerTick(game.frameLow)) return;
      for (var i = 0; i < game.players.length; i += 1) {
        var player = game.players[i];
        if (player.invuln > 0) player.invuln -= 1;
      }
    }

    function updateBaseDestructionTimer() {
      if (game.baseDestroyTimer > 0) game.baseDestroyTimer -= 1;
    }

    function stageEnemiesCleared() {
      return game.enemySpawned >= enemyTotal() && game.enemies.length === 0;
    }

    var api = {
      isGlobalTimerTick: isGlobalTimerTick,
      updateFreezeTimer: updateFreezeTimer,
      updateShovelTimer: updateShovelTimer,
      updatePlayerInvulnerabilityTimers: updatePlayerInvulnerabilityTimers,
      updateBaseDestructionTimer: updateBaseDestructionTimer,
      stageEnemiesCleared: stageEnemiesCleared
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupBattleTimingRuntime: setupBattleTimingRuntime });
});
