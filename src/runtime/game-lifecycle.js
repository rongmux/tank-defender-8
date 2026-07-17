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
    fn.loadHighScore = function () {
      try {
        var value = Number(localStorage.getItem(sh.HIGH_SCORE_STORAGE_KEY));
        state.game.highScore = Number.isFinite(value) && value > 0
          ? Math.max(sh.DEFAULT_HIGH_SCORE, Math.floor(value))
          : sh.DEFAULT_HIGH_SCORE;
      } catch (error) {
        state.game.highScore = sh.DEFAULT_HIGH_SCORE;
      }
      state.game.runHighScoreBaseline = state.game.highScore;
    };

    fn.saveHighScore = function () {
      try {
        localStorage.setItem(sh.HIGH_SCORE_STORAGE_KEY, String(state.game.highScore));
      } catch (error) {
        // localStorage can be unavailable in restricted browser contexts.
      }
    };

    fn.updateHighScore = function (score) {
      if (score > state.game.highScore) {
        state.game.highScore = score;
        fn.saveHighScore();
      }
    };

    // ── Player helpers ────────────────────────────────────────────────────
    fn.createPlayer = function (id) {
      var runtime = state.stageRuntime;
      return deps.createPlayerState({
        id: id,
        spawn: runtime.playerSpawnPoint(id),
        settings: runtime.gameSettings(),
        enemyTypeCount: runtime.enemyTypeDefinitions().length,
        direction: deps.UP
      });
    };

    fn.resetPlayerPosition = function (player) {
      deps.resetPlayerState(player, {
        settings: state.stageRuntime.gameSettings(),
        direction: deps.UP
      });
    };

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

    // ── Title idle ────────────────────────────────────────────────────────
    fn.updateTitleIdle = function () {
      if (state.game.constructionUsed || state.game.demoMode) return;
      state.game.titleIdleFrames += 1;
      if (state.game.frameHigh === 0x0a) fn.startTitleDemo();
    };

    fn.resetTitleIdleTimer = function () {
      state.game.titleIdleFrames = 0;
      fn.resetFrameCounterHigh();
    };

    fn.resetTitleIdleHighByte = function () {
      state.game.titleIdleFrames = 0;
      fn.resetFrameCounterHigh();
    };

    // ── Hidden message ────────────────────────────────────────────────────
    fn.hiddenMessageTriggerReady = function () {
      return state.game.constructionVisits === sh.HIDDEN_MESSAGE_REQUIRED_VISITS &&
        state.game.hiddenInputCount === 0x74;
    };

    fn.reserveTitleDirectionForHiddenInput = function (code) {
      return state.game.screen === "title" &&
        state.game.constructionVisits === sh.HIDDEN_MESSAGE_REQUIRED_VISITS &&
        (code === "ArrowDown" || code === "ArrowRight");
    };

    fn.recordHiddenTitleInput = function (code) {
      if (state.game.screen !== "title" || state.game.constructionVisits !== sh.HIDDEN_MESSAGE_REQUIRED_VISITS) return false;
      if (code === "KeyF" && state.keys.has("ArrowDown")) {
        state.game.hiddenInputCount = (state.game.hiddenInputCount + 0x10) & 0xff;
        return true;
      }
      if (code === "KeyG" && state.keys.has("ArrowRight")) {
        state.game.hiddenInputCount = (state.game.hiddenInputCount - 1) & 0xff;
        return true;
      }
      return false;
    };

    fn.startHiddenMessage = function () {
      state.game.screen = "hiddenMessage";
      state.game.paused = false;
      state.game.demoMode = false;
      state.game.hiddenMessageElapsed = 0;
      state.pendingFirePresses.clear();
    };

    fn.updateHiddenMessage = function () {
      state.game.hiddenMessageElapsed += 1;
      if (state.game.hiddenMessageElapsed < sh.HIDDEN_MESSAGE_END_FRAME) return;
      state.game.hiddenInputCount = 0;
      fn.activateTitleMenu();
    };

    fn.hiddenMessagePresentation = function (elapsed) {
      var frame = Math.max(0, Math.floor(Number(elapsed) || 0));
      var lines = ["THIS PROGRAM WAS", "WRITTEN BY", "OPEN-REACH", "WHO LOVES NORIKO"];
      var visibleLines = lines.filter(function (line, index) {
        return frame >= sh.HIDDEN_MESSAGE_TEXT_START + index * sh.HIDDEN_MESSAGE_STEP_FRAMES;
      });
      var firstDotFrame = sh.HIDDEN_MESSAGE_TEXT_START + lines.length * sh.HIDDEN_MESSAGE_STEP_FRAMES;
      var dots = frame < firstDotFrame
        ? 0
        : deps.clamp(Math.floor((frame - firstDotFrame) / sh.HIDDEN_MESSAGE_STEP_FRAMES) + 1, 0, 5);
      var drop = null;
      if (frame > sh.HIDDEN_MESSAGE_DROP_START && frame < sh.HIDDEN_MESSAGE_END_FRAME) {
        var age = frame - sh.HIDDEN_MESSAGE_DROP_START;
        if (age <= sh.HIDDEN_MESSAGE_DROP_MORPH_FRAMES) {
          var morphSequence = [3, 2, 1, 0, 1, 2, 3];
          var phase = morphSequence[Math.floor((age - 1) / 4)];
          drop = { x: 120, y: 30, frame: "morph" + phase };
        } else {
          var fallAge = Math.min(sh.HIDDEN_MESSAGE_DROP_FALL_FRAMES, age - sh.HIDDEN_MESSAGE_DROP_MORPH_FRAMES);
          drop = { x: 120, y: 30 + fallAge, frame: "fall" };
        }
      }
      return { frame: frame, visibleLines: visibleLines, dots: dots, drop: drop };
    };

    // ── Stage select ──────────────────────────────────────────────────────
    fn.beginStageSelect = function (players) {
      fn.initAudio();
      state.game.demoMode = false;
      fn.resetTitleIdleTimer();
      state.game.stageSelectPlayers = players === 2 ? 2 : 1;
      state.game.stage = 1;
      state.game.screen = "stageSelectClosing";
      state.game.paused = false;
      state.game.transitionTimer = deps.STAGE_CURTAIN_CLOSE_FRAMES;
      state.pendingStageSelectPresses.clear();
    };

    fn.startSelectedGame = function () {
      state.pendingStageSelectPresses.clear();
      fn.startGame(state.game.stageSelectPlayers, { stage: state.game.stage });
    };

    fn.stageSelectLimit = function () {
      return Math.max(1, Math.min(deps.DEFAULT_ORIGINAL_STAGE_COUNT, state.stageRuntime.stageCount()));
    };

    fn.changeStageSelection = function (delta) {
      var limit = fn.stageSelectLimit();
      fn.resetFrameCounterLow();
      state.game.stage = deps.clamp(state.game.stage + delta, 1, limit);
    };

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

    // ── Editor ────────────────────────────────────────────────────────────
    fn.enterEditor = function () {
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
      fn.initAudio();
      state.game.screen = "editor";
      state.game.paused = false;
      if (!state.game.editorGrid) state.game.editorGrid = deps.makeOriginalConstructionGrid();
      state.game.editorCursor = { qc: 0, qr: 0 };
      state.game.editorPattern = 0;
      state.game.editorPatternArmed = false;
      state.game.editorMoveHoldTimer = 0;
      state.game.editorTick = 0;
      state.game.editorBrush = deps.ORIGINAL_EDITOR_PATTERNS[0].type;
      fn.showEditorMessage("EDIT");
    };

    fn.exitEditorToTitle = function () {
      if (state.game.editorGrid) state.game.constructedGrid = deps.cloneGrid(state.game.editorGrid);
      state.game.constructionVisits = (state.game.constructionVisits + 1) & 0xff;
      state.game.constructionUsed = state.game.constructionVisits > 0;
      state.game.hiddenInputCount = 0;
      state.game.customGrid = null;
      state.game.constructionStageActive = false;
      state.game.stage = 1;
      state.game.screen = "title";
      state.game.paused = false;
      state.game.demoMode = false;
      fn.resetTitleIdleTimer();
      state.game.editorMoveHoldTimer = 0;
    };

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

    // ── Editor operations ─────────────────────────────────────────────────
    fn.testEditorStage = function () {
      if (!state.game.editorGrid) return;
      var pack = deps.createEditorStagePack(state.game.editorGrid);
      var result = deps.tryNormalizeStagePack(pack);
      if (!result.ok) {
        fn.showEditorMessage("BAD");
        return;
      }
      state.game.stagePack = result.pack;
      fn.startGame(1, { stage: 1, customGrid: deps.parseStageQuadrants(pack.quadrants[0]) });
    };

    fn.saveEditorStage = function () {
      if (!state.game.editorGrid) return;
      try {
        localStorage.setItem(sh.EDITOR_STORAGE_KEY, deps.serializeEditorStage(state.game.editorGrid));
        fn.showEditorMessage("SAVED");
        fn.playSound("editorSave");
      } catch (error) {
        fn.showEditorMessage("ERR");
      }
    };

    fn.loadEditorStage = function () {
      try {
        var raw = localStorage.getItem(sh.EDITOR_STORAGE_KEY);
        if (!raw) {
          fn.showEditorMessage("EMPTY");
          return;
        }
        var result = deps.parseEditorStageText(raw);
        if (!result.ok) {
          fn.showEditorMessage(result.kind === "stage" ? "BAD" : "ERR");
          return;
        }
        state.game.editorGrid = result.grid;
        fn.showEditorMessage("LOADED");
        fn.playSound("editorLoad");
      } catch (error) {
        fn.showEditorMessage("ERR");
      }
    };

    fn.clearEditorStage = function () {
      state.game.editorGrid = deps.makeOriginalConstructionGrid();
      state.game.editorCursor = { qc: 0, qr: 0 };
      state.game.editorPattern = 0;
      state.game.editorPatternArmed = false;
      state.game.editorMoveHoldTimer = 0;
      state.game.editorBrush = deps.ORIGINAL_EDITOR_PATTERNS[0].type;
      fn.showEditorMessage("CLEAR");
      fn.playSound("editorClear");
    };

    fn.exportEditorStage = function () {
      if (!state.game.editorGrid) return;
      var text = deps.serializeEditorStagePack(state.game.editorGrid);
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            // Clipboard write succeeded
          });
          fn.showEditorMessage("COPIED");
        } else {
          console.log(text);
          fn.showEditorMessage("LOGGED");
        }
      } catch (error) {
        console.log(text);
        fn.showEditorMessage("LOGGED");
      }
    };

    fn.importStagePackFile = function () {
      if (state.packFileInput) {
        state.packFileInput.click();
      } else {
        fn.showEditorMessage("NOFILE");
      }
    };

    // ── Stage pack loading ────────────────────────────────────────────────
    fn.loadStagePackJsonText = function (text) {
      var parsed = deps.parseJsonText(text);
      return parsed.ok
        ? fn.loadStagePackObject(parsed.value)
        : { ok: false, error: parsed.error };
    };

    fn.loadStagePackObject = function (pack) {
      var result = deps.tryNormalizeStagePack(pack);
      if (!result.ok) return { ok: false, error: result.error };
      fn.applyStagePack(result.pack);
      return { ok: true, error: "" };
    };

    fn.applyStagePack = function (pack) {
      state.game.stagePack = pack;
      state.game.stage = 1;
      state.game.titleMenu = 0;
      fn.resetTitleIdleTimer();
      state.game.demoMode = false;
      state.game.constructionUsed = false;
      state.game.constructionVisits = 0;
      state.game.hiddenInputCount = 0;
      state.game.hiddenMessageElapsed = 0;
      state.game.customGrid = null;
      state.game.constructedGrid = null;
      state.game.constructionStageActive = false;
      state.game.grid = state.stageRuntime.createStageGrid(state.game.stage);
      deps.prepareBattleGrid(state.game.grid);
      state.game.editorGrid = null;
      state.game.editorCursor = { qc: -1, qr: -1 };
      state.game.editorPattern = 0;
      state.game.editorPatternArmed = false;
      state.game.editorMoveHoldTimer = 0;
      state.game.editorTick = 0;
      state.game.editorBrush = deps.TILE_TYPES.BRICK;
      state.game.stageSelectPlayers = 1;
      state.game.screen = "title";
      state.game.paused = false;
      fn.resetBattleRandom();
      fn.clearTransientBattleState();
    };

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

    fn.restoreBuiltInStagePack = function () {
      fn.applyStagePack(state.builtInStagePack);
    };

    fn.showEditorMessage = function (message) {
      state.game.editorMessage = message;
      state.game.editorMessageTimer = 120;
    };

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
