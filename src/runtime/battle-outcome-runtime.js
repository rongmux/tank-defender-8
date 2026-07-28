(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.battleOutcomeRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = [
    "endTitleDemo",
    "enterGameOver",
    "enterStageClear",
    "extendedStageEndFrameHigh",
    "gameSettings",
    "playerGameOverMessageActive",
    "playerGameOverStageEndDelay",
    "resetFrameCounters",
    "stageEnemiesCleared"
  ];

  function requireInputs(state, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!Array.isArray(state.game.enemies)) {
      throw new Error("state.game.enemies must be an array");
    }
    if (!Array.isArray(state.game.players)) {
      throw new Error("state.game.players must be an array");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    for (var i = 0; i < CALLBACK_NAMES.length; i += 1) {
      var name = CALLBACK_NAMES[i];
      if (typeof callbacks[name] !== "function") {
        throw new Error("callbacks." + name + " must be a function");
      }
    }
  }

  /** Owns battle end predicates, clear-delay timing, and demo-mode termination. */
  function setupBattleOutcomeRuntime(state, deps, callbacks) {
    requireInputs(state, callbacks);

    var game = state.game;
    var endTitleDemo = callbacks.endTitleDemo;
    var enterGameOver = callbacks.enterGameOver;
    var enterStageClear = callbacks.enterStageClear;
    var extendedStageEndFrameHigh = callbacks.extendedStageEndFrameHigh;
    var gameSettings = callbacks.gameSettings;
    var playerGameOverMessageActive = callbacks.playerGameOverMessageActive;
    var playerGameOverStageEndDelay = callbacks.playerGameOverStageEndDelay;
    var resetFrameCounters = callbacks.resetFrameCounters;
    var stageEnemiesCleared = callbacks.stageEnemiesCleared;

    function checkEndState() {
      game.enemies = game.enemies.filter(function (enemy) { return enemy.alive; });
      if (game.demoMode) {
        var demoPlayersDone = game.players.every(function (player) {
          return !player.alive && player.respawn <= 0 && player.lives <= 0;
        });
        if (!game.base.alive || demoPlayersDone || stageEnemiesCleared()) endTitleDemo();
        return;
      }
      if (!game.base.alive) {
        if (game.baseDestroyTimer > 0) return;
        enterGameOver();
        return;
      }
      var playersDone = game.players.every(function (player) {
        return !player.alive && player.respawn <= 0 && player.lives <= 0;
      });
      if (playersDone) {
        enterGameOver();
        return;
      }
      if (stageEnemiesCleared()) {
        game.paused = false;
        game.pauseElapsed = 0;
        if (game.clearPendingTimer <= 0) {
          var extendedStageEnd = playerGameOverMessageActive();
          game.clearPendingTimer = Math.max(
            gameSettings().timings.stageClearDelay,
            extendedStageEnd ? playerGameOverStageEndDelay() : 0
          );
          game.tick = 0;
          resetFrameCounters();
          if (extendedStageEnd) game.frameHigh = extendedStageEndFrameHigh();
          if (game.clearPendingTimer > 0) return;
        }
        if (game.clearPendingTimer > 0) {
          game.clearPendingTimer -= 1;
          if (game.clearPendingTimer > 0) return;
        }
        enterStageClear();
      }
    }

    var api = { checkEndState: checkEndState };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupBattleOutcomeRuntime: setupBattleOutcomeRuntime });
});
