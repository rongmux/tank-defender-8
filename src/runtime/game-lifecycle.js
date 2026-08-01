(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.gameLifecycle = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /**
   * Register all game-lifecycle functions on `state.fn`.
   * `deps` is the module-deps barrel (requireRuntimeModule("moduleDeps")).
   */
  function setupGameLifecycle(state, deps) {
    var sh = deps.sharedState;
    var fn = state.fn;

    // ── High score ─────────────────────────────────────────────────────────
    deps.highScoreRuntime.setupHighScoreRuntime(state, deps);

    // ── Player helpers ────────────────────────────────────────────────────
    deps.playerSessionRuntime.setupPlayerSessionRuntime(state, deps);

    // ── Game start / Title demo ───────────────────────────────────────────
    deps.gameSessionRuntime.setupGameSessionRuntime(state, deps);

    // ── Title flow ────────────────────────────────────────────────────────
    deps.titleFlowRuntime.setupTitleFlowRuntime(state, deps);

    // ── Stage start ───────────────────────────────────────────────────────
    fn.startStage = function (stage) {
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
      state.game.screen = "stageIntro";
      state.game.tick = 0;
      var settings = state.stageRuntime.gameSettings();
      state.game.transitionTimer = settings.timings ? settings.timings.stageIntro : 150;
      var constructionGrid = state.game.constructionStageActive && stage === 1
        ? state.game.constructedGrid
        : null;
      state.game.grid = state.game.customGrid
        ? deps.cloneGrid(state.game.customGrid)
        : constructionGrid
          ? deps.cloneGrid(constructionGrid)
          : state.stageRuntime.createStageGrid(stage);
      if (state.game.customGrid || constructionGrid) {
        deps.prepareConstructedBattleGrid(state.game.grid);
      } else {
        deps.prepareBattleGrid(state.game.grid);
      }
      state.game.base = {
        x: 6 * sh.TILE, y: 12 * sh.TILE,
        w: sh.TILE, h: sh.TILE, alive: true
      };
      state.game.enemies = [];
      state.game.bullets = [];
      state.game.explosions = [];
      state.game.scorePopups = [];
      state.game.powerUp = null;
      state.game.lastPowerUpSpawn = null;
      fn.resetPowerUpSpawnBag();
      state.game.enemySpawned = 0;
      state.game.enemyKilled = 0;
      state.game.nextSpawn = fn.enemySpawnDelay(stage, 0);
      state.game.clearPendingTimer = 0;
      state.game.baseDestroyTimer = 0;
      state.game.gameOverTimer = 0;
      state.game.playerGameOverMessage = null;
      state.game.fullGameOverElapsed = 0;
      state.game.freezeTimer = 0;
      state.game.shovelTimer = 0;
      state.game.stageResultReason = "clear";
      state.game.stageClearElapsed = 0;
      state.game.stageClearBonusPlayerIds = [];
      state.game.stageClearBonusAwarded = false;
      for (var p = 0; p < state.game.players.length; p += 1) {
        fn.resetStageStats(state.game.players[p]);
        fn.resetPlayerPosition(state.game.players[p]);
      }
      fn.startStageStartAudio();
    };

    fn.resetStageStats = function (player) {
      player.stagePoints = 0;
      var typeCount = state.stageRuntime.enemyTypeDefinitions().length;
      player.stageKills = Array(typeCount).fill(0);
    };

    deps.editorLifecycleRuntime.setupEditorLifecycleRuntime(state, deps);

    // ── Title menu ────────────────────────────────────────────────────────
    fn.moveTitleMenu = function (delta) {
      fn.resetTitleIdleHighByte();
      state.game.titleMenu = (state.game.titleMenu + delta + sh.TITLE_MENU_ITEMS.length) % sh.TITLE_MENU_ITEMS.length;
    };

    fn.setTitleMenu = function (index) {
      fn.resetTitleIdleHighByte();
      state.game.titleMenu = deps.clamp(Math.floor(Number(index) || 0), 0, sh.TITLE_MENU_ITEMS.length - 1);
    };

    fn.activateTitleMenu = function () {
      var item = sh.TITLE_MENU_ITEMS[state.game.titleMenu] || sh.TITLE_MENU_ITEMS[0];
      if (item.action === "one") fn.beginStageSelect(1);
      else if (item.action === "two") fn.beginStageSelect(2);
      else if (item.action === "construction") fn.enterEditor();
    };

    // ── Stage pack loading ────────────────────────────────────────────────
    fn.clearTransientBattleState = function () {
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
      state.game.demoMode = false;
      state.game.runHighScoreBaseline = state.game.highScore;
      state.game.newHighScoreAtGameOver = false;
      state.game.fullGameOverElapsed = 0;
      state.game.highScoreScreenElapsed = 0;
      state.game.stageResultReason = "clear";
      state.game.players = [];
      state.game.enemies = [];
      state.game.bullets = [];
      state.game.explosions = [];
      state.game.scorePopups = [];
      state.game.powerUp = null;
      state.game.lastPowerUpSpawn = null;
      fn.resetPowerUpSpawnBag();
      state.game.enemySpawned = 0;
      state.game.enemyKilled = 0;
      state.game.nextSpawn = 0;
      state.game.clearPendingTimer = 0;
      state.game.baseDestroyTimer = 0;
      state.game.gameOverTimer = 0;
      state.game.playerGameOverMessage = null;
      state.game.freezeTimer = 0;
      state.game.shovelTimer = 0;
      state.game.stageClearElapsed = 0;
      state.game.stageClearBonusPlayerIds = [];
      state.game.stageClearBonusAwarded = false;
      state.pendingStageSelectPresses.clear();
    };

    deps.stagePackLifecycleRuntime.setupStagePackLifecycleRuntime(state, deps, {
      clearTransientBattleState: fn.clearTransientBattleState,
      resetBattleRandom: function () { fn.resetBattleRandom(); },
      resetTitleIdleTimer: fn.resetTitleIdleTimer
    });

    fn.nextStage = function (delta) {
      if (state.game.screen === "stageSelectClosing" || state.game.screen === "stageClearClosing") return;
      if (state.game.screen === "stageSelect") {
        state.pendingStageSelectPresses.clear();
        fn.changeStageSelection(delta);
        return;
      }
      state.game.stage += delta;
      if (state.game.stage < 1) state.game.stage = state.stageRuntime.stageCycleLimit();
      if (state.game.stage > state.stageRuntime.stageCycleLimit()) state.game.stage = 1;
      if (state.game.screen === "playing" || state.game.screen === "stageIntro" || state.game.screen === "stageClear") {
        state.game.customGrid = null;
        state.game.constructionStageActive = false;
        fn.startStage(state.game.stage);
      }
    };
  }

  return { setupGameLifecycle: setupGameLifecycle };
});
