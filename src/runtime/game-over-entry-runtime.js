(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.gameOverEntryRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = [
    "endTitleDemo",
    "extendedStageEndFrameHigh",
    "gameOverFieldDuration",
    "resetFrameCounters",
    "stopBonusLifeAudio",
    "stopBrickHitAudio",
    "stopEnemyDestroyAudio",
    "stopEnemyHitAudio",
    "stopMovementAudio",
    "stopMovementIceAudio",
    "stopPauseAudio",
    "stopPlayerShootAudio",
    "stopPowerUpAppearAudio",
    "stopPowerUpPickupAudio",
    "stopScoreCountAudio",
    "stopStageBonusAudio",
    "stopStageStartAudio",
    "stopSteelHitAudio"
  ];

  function requireInputs(state, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
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

  /** Owns the scene-entry side effects and fixed-frame state for field GAME OVER. */
  function setupGameOverEntryRuntime(state, deps, callbacks) {
    requireInputs(state, callbacks);

    var game = state.game;
    var endTitleDemo = callbacks.endTitleDemo;
    var extendedStageEndFrameHigh = callbacks.extendedStageEndFrameHigh;
    var gameOverFieldDuration = callbacks.gameOverFieldDuration;
    var resetFrameCounters = callbacks.resetFrameCounters;
    var stopBonusLifeAudio = callbacks.stopBonusLifeAudio;
    var stopBrickHitAudio = callbacks.stopBrickHitAudio;
    var stopEnemyDestroyAudio = callbacks.stopEnemyDestroyAudio;
    var stopEnemyHitAudio = callbacks.stopEnemyHitAudio;
    var stopMovementAudio = callbacks.stopMovementAudio;
    var stopMovementIceAudio = callbacks.stopMovementIceAudio;
    var stopPauseAudio = callbacks.stopPauseAudio;
    var stopPlayerShootAudio = callbacks.stopPlayerShootAudio;
    var stopPowerUpAppearAudio = callbacks.stopPowerUpAppearAudio;
    var stopPowerUpPickupAudio = callbacks.stopPowerUpPickupAudio;
    var stopScoreCountAudio = callbacks.stopScoreCountAudio;
    var stopStageBonusAudio = callbacks.stopStageBonusAudio;
    var stopStageStartAudio = callbacks.stopStageStartAudio;
    var stopSteelHitAudio = callbacks.stopSteelHitAudio;

    function enterGameOver() {
      if (game.demoMode) {
        endTitleDemo();
        return;
      }
      if (game.screen === "gameOver" || game.screen === "fullGameOver") return;
      stopMovementAudio();
      stopStageStartAudio();
      stopBonusLifeAudio();
      stopPowerUpPickupAudio();
      stopPowerUpAppearAudio();
      stopPauseAudio();
      stopBrickHitAudio();
      stopEnemyHitAudio();
      stopEnemyDestroyAudio();
      stopSteelHitAudio();
      stopPlayerShootAudio();
      stopMovementIceAudio();
      stopScoreCountAudio();
      stopStageBonusAudio();
      game.screen = "gameOver";
      game.paused = false;
      game.tick = 0;
      resetFrameCounters();
      game.frameHigh = extendedStageEndFrameHigh();
      game.baseDestroyTimer = 0;
      game.playerGameOverMessage = null;
      game.newHighScoreAtGameOver = game.players.some(function (player) {
        return player.score > game.runHighScoreBaseline;
      });
      game.gameOverTimer = gameOverFieldDuration();
    }

    var api = { enterGameOver: enterGameOver };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupGameOverEntryRuntime: setupGameOverEntryRuntime });
});
