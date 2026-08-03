(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.stageLifecycleRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function requireInputs(state, deps) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") throw new Error("state.game must be an object");
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!state.stageRuntime || typeof state.stageRuntime !== "object") {
      throw new Error("state.stageRuntime must be an object");
    }
    if (typeof state.stageRuntime.gameSettings !== "function") {
      throw new Error("state.stageRuntime.gameSettings must be a function");
    }
    if (typeof state.stageRuntime.createStageGrid !== "function") {
      throw new Error("state.stageRuntime.createStageGrid must be a function");
    }
    if (typeof state.stageRuntime.enemyTypeDefinitions !== "function") {
      throw new Error("state.stageRuntime.enemyTypeDefinitions must be a function");
    }
    if (typeof state.stageRuntime.stageCycleLimit !== "function") {
      throw new Error("state.stageRuntime.stageCycleLimit must be a function");
    }
    if (!state.pendingStageSelectPresses || typeof state.pendingStageSelectPresses.clear !== "function") {
      throw new Error("state.pendingStageSelectPresses must support clear");
    }
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!deps.sharedState || typeof deps.sharedState !== "object") {
      throw new Error("deps.sharedState must be an object");
    }
    if (typeof deps.cloneGrid !== "function") throw new Error("deps.cloneGrid must be a function");
    if (typeof deps.prepareBattleGrid !== "function") throw new Error("deps.prepareBattleGrid must be a function");
    if (typeof deps.prepareConstructedBattleGrid !== "function") {
      throw new Error("deps.prepareConstructedBattleGrid must be a function");
    }
  }

  /** Owns stage preparation, transient battle cleanup, per-stage statistics, and stage progression. */
  function setupStageLifecycleRuntime(state, deps) {
    requireInputs(state, deps);

    var game = state.game;
    var fn = state.fn;
    var runtime = state.stageRuntime;
    var sh = deps.sharedState;

    function startStage(stage) {
      fn.stopMovementAudio();
      fn.stopStageStartAudio();
      fn.stopBonusLifeAudio();
      fn.stopPowerUpPickupAudio();
      fn.stopPowerUpAppearAudio();
      fn.stopPauseAudio();
      fn.stopBrickHitAudio();
      fn.stopEnemyHitAudio();
      fn.stopBaseHitAudio();
      fn.stopEnemyDestroyAudio();
      fn.stopPlayerDestroyAudio();
      fn.stopSteelHitAudio();
      fn.stopPlayerShootAudio();
      fn.stopMovementIceAudio();
      fn.stopScoreCountAudio();
      fn.stopStageBonusAudio();
      game.screen = "stageIntro";
      game.tick = 0;
      var settings = runtime.gameSettings();
      game.transitionTimer = settings.timings ? settings.timings.stageIntro : 150;
      var constructionGrid = game.constructionStageActive && stage === 1
        ? game.constructedGrid
        : null;
      game.grid = game.customGrid
        ? deps.cloneGrid(game.customGrid)
        : constructionGrid
          ? deps.cloneGrid(constructionGrid)
          : runtime.createStageGrid(stage);
      if (game.customGrid || constructionGrid) {
        deps.prepareConstructedBattleGrid(game.grid);
      } else {
        deps.prepareBattleGrid(game.grid);
      }
      game.base = {
        x: 6 * sh.TILE, y: 12 * sh.TILE,
        w: sh.TILE, h: sh.TILE, alive: true
      };
      game.enemies = [];
      game.bullets = [];
      game.explosions = [];
      game.scorePopups = [];
      game.powerUp = null;
      game.lastPowerUpSpawn = null;
      fn.resetPowerUpSpawnBag();
      game.enemySpawned = 0;
      game.enemyKilled = 0;
      game.nextSpawn = fn.enemySpawnDelay(stage, 0);
      game.clearPendingTimer = 0;
      game.baseDestroyTimer = 0;
      game.gameOverTimer = 0;
      game.playerGameOverMessage = null;
      game.fullGameOverElapsed = 0;
      game.freezeTimer = 0;
      game.shovelTimer = 0;
      game.stageResultReason = "clear";
      game.stageClearElapsed = 0;
      game.stageClearBonusPlayerIds = [];
      game.stageClearBonusAwarded = false;
      for (var p = 0; p < game.players.length; p += 1) {
        resetStageStats(game.players[p]);
        fn.resetPlayerPosition(game.players[p]);
      }
      fn.startStageStartAudio();
    }

    function resetStageStats(player) {
      player.stagePoints = 0;
      var typeCount = runtime.enemyTypeDefinitions().length;
      player.stageKills = Array(typeCount).fill(0);
    }

    function clearTransientBattleState() {
      fn.stopMovementAudio();
      fn.stopStageStartAudio();
      fn.stopBonusLifeAudio();
      fn.stopPowerUpPickupAudio();
      fn.stopPowerUpAppearAudio();
      fn.stopPauseAudio();
      fn.stopBrickHitAudio();
      fn.stopEnemyHitAudio();
      fn.stopBaseHitAudio();
      fn.stopEnemyDestroyAudio();
      fn.stopPlayerDestroyAudio();
      fn.stopSteelHitAudio();
      fn.stopPlayerShootAudio();
      fn.stopMovementIceAudio();
      fn.stopScoreCountAudio();
      fn.stopStageBonusAudio();
      fn.stopGameOverAudio();
      fn.stopHighScoreAudio();
      game.demoMode = false;
      game.runHighScoreBaseline = game.highScore;
      game.newHighScoreAtGameOver = false;
      game.fullGameOverElapsed = 0;
      game.highScoreScreenElapsed = 0;
      game.stageResultReason = "clear";
      game.players = [];
      game.enemies = [];
      game.bullets = [];
      game.explosions = [];
      game.scorePopups = [];
      game.powerUp = null;
      game.lastPowerUpSpawn = null;
      fn.resetPowerUpSpawnBag();
      game.enemySpawned = 0;
      game.enemyKilled = 0;
      game.nextSpawn = 0;
      game.clearPendingTimer = 0;
      game.baseDestroyTimer = 0;
      game.gameOverTimer = 0;
      game.playerGameOverMessage = null;
      game.freezeTimer = 0;
      game.shovelTimer = 0;
      game.stageClearElapsed = 0;
      game.stageClearBonusPlayerIds = [];
      game.stageClearBonusAwarded = false;
      state.pendingStageSelectPresses.clear();
    }

    function nextStage(delta) {
      if (game.screen === "stageSelectClosing" || game.screen === "stageClearClosing") return;
      if (game.screen === "stageSelect") {
        state.pendingStageSelectPresses.clear();
        fn.changeStageSelection(delta);
        return;
      }
      game.stage += delta;
      if (game.stage < 1) game.stage = runtime.stageCycleLimit();
      if (game.stage > runtime.stageCycleLimit()) game.stage = 1;
      if (game.screen === "playing" || game.screen === "stageIntro" || game.screen === "stageClear") {
        game.customGrid = null;
        game.constructionStageActive = false;
        fn.startStage(game.stage);
      }
    }

    var api = {
      startStage: startStage,
      resetStageStats: resetStageStats,
      clearTransientBattleState: clearTransientBattleState,
      nextStage: nextStage
    };
    Object.assign(fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupStageLifecycleRuntime: setupStageLifecycleRuntime });
});
