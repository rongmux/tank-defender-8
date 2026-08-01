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
    fn.startGame = function (players, options) {
      var opts = options || {};
      if (!opts.demo) {
        fn.initAudio();
        state.game.constructionUsed = false;
        state.game.constructionVisits = 0;
        state.game.hiddenInputCount = 0;
        state.game.runHighScoreBaseline = state.game.highScore;
        state.game.newHighScoreAtGameOver = false;
        state.game.fullGameOverElapsed = 0;
        state.game.highScoreScreenElapsed = 0;
      }
      state.game.demoMode = Boolean(opts.demo);
      state.game.playerCount = players;
      state.game.paused = false;
      state.game.pauseElapsed = 0;
      state.game.stage = opts.stage || state.game.stage || 1;
      state.game.customGrid = opts.customGrid ? deps.cloneGrid(opts.customGrid) : null;
      state.game.constructionStageActive = Boolean(
        !state.game.customGrid &&
        opts.useConstruction !== false &&
        state.game.stage === 1 &&
        state.game.constructedGrid
      );
      state.game.players = [];
      for (var i = 1; i <= players; i += 1) {
        state.game.players.push(fn.createPlayer(i));
      }
      fn.startStage(state.game.stage);
    };

    fn.startTitleDemo = function () {
      fn.startGame(2, { stage: sh.DEMO_DISPLAY_STAGE, useConstruction: false, demo: true });
      state.game.screen = "playing";
      state.game.transitionTimer = 0;
      state.game.titleIdleFrames = 0;
      fn.resetFrameCounters();
      state.game.frameLow = sh.DEMO_INITIAL_FRAME_LOW;
      fn.syncMovementAudio();
    };

    fn.endTitleDemo = function () {
      fn.stopMovementAudio();
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
      state.game.demoMode = false;
      state.game.stage = 1;
      state.game.screen = "title";
      state.game.paused = false;
      fn.resetTitleIdleTimer();
      fn.clearTransientBattleState();
    };

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
