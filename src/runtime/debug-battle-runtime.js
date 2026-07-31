(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.debugBattleRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function requireInputs(state, deps) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!deps.sharedState || typeof deps.sharedState.TILE !== "number") {
      throw new Error("deps.sharedState.TILE must be a number");
    }
  }

  /** Creates the deterministic paused battle fixture used by debug probes. */
  function setupDebugBattleRuntime(state, deps) {
    requireInputs(state, deps);

    var game = state.game;
    var tile = deps.sharedState.TILE;

    function preparePausedDebugBattle(tick) {
      game.screen = "playing";
      game.demoMode = false;
      game.paused = true;
      game.pauseElapsed = 0;
      game.tick = Math.max(0, Math.floor(Number(tick) || 0));
      game.frameLow = game.tick & 0xff;
      game.frameHigh = Math.floor(game.tick / 0x40) & 0xff;
      game.base = { x: 6 * tile, y: 12 * tile, w: tile, h: tile, alive: true };
      game.players = [{ alive: true, lives: 1, respawn: 0 }];
      game.enemies = [];
      game.enemySpawned = 0;
      game.clearPendingTimer = 0;
      game.scorePopups = [];
    }

    return Object.freeze({ preparePausedDebugBattle: preparePausedDebugBattle });
  }

  return Object.freeze({ setupDebugBattleRuntime: setupDebugBattleRuntime });
});
