(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.stageFlowGameOverDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /** Builds battlefield, banner, return, and result-route Game Over probes. */
  function createStageFlowGameOverDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");

    var builtInStagePack = scope.builtInStagePack;
    var createPlayer = scope.createPlayer;
    var enemyTotal = scope.enemyTotal;
    var enterGameOver = scope.enterGameOver;
    var enterStageResult = scope.enterStageResult;
    var finishFullGameOverScreen = scope.finishFullGameOverScreen;
    var finishGameOverScreen = scope.finishGameOverScreen;
    var game = scope.game;
    var gameOverBannerY = scope.gameOverBannerY;
    var gameOverFieldDuration = scope.gameOverFieldDuration;
    var gameSettings = scope.gameSettings;
    var keys = scope.keys;
    var makeGrid = scope.makeGrid;
    var pendingFirePresses = scope.pendingFirePresses;
    var renderGameOver = scope.renderGameOver;
    var RIGHT = scope.RIGHT;
    var stageClearPresentation = scope.stageClearPresentation;
    var stopGameOverAudio = scope.stopGameOverAudio;
    var stopHighScoreAudio = scope.stopHighScoreAudio;
    var TILE = scope.TILE;
    var update = scope.update;

    return Object.freeze({
      debugGameOverSlideProbe() {
        var previous = {
          screen: game.screen,
          paused: game.paused,
          gameOverTimer: game.gameOverTimer
        };
        var timings = gameSettings().timings;
        var slideDuration = timings.gameOverSlide;
        var holdDuration = timings.gameOverHold;
        var duration = gameOverFieldDuration();
        var timers = [
          { phase: "start", timer: duration },
          { phase: "firstMove", timer: Math.max(0, duration - 1) },
          { phase: "slideEnd", timer: holdDuration },
          { phase: "firstHold", timer: Math.max(0, holdDuration - 1) },
          { phase: "end", timer: 0 }
        ];
        try {
          game.screen = "playing";
          game.paused = true;
          game.gameOverTimer = 0;
          enterGameOver();
          var entry = {
            screen: game.screen,
            paused: game.paused,
            timer: game.gameOverTimer
          };
          var frames = timers.map(function (item) {
            game.gameOverTimer = item.timer;
            renderGameOver();
            return { phase: item.phase, timer: item.timer, y: gameOverBannerY(item.timer) };
          });
          return { slideDuration: slideDuration, holdDuration: holdDuration, duration: duration, entry: entry, frames: frames };
        } finally {
          Object.assign(game, previous);
        }
      },
      debugGameOverBattleProbe() {
        var previous = Object.assign({}, game);
        var previousFirePresses = new Set(pendingFirePresses);
        var rightWasHeld = keys.has("ArrowRight");
        var player = createPlayer(1);
        var enemy = { alive: true, spawnFlash: 2 };
        var bullet = {
          x: 96,
          y: 96,
          w: gameSettings().projectileRules.bulletSize,
          h: gameSettings().projectileRules.bulletSize,
          dir: RIGHT,
          speed: 1,
          power: 1,
          ownerKind: "enemy",
          ownerId: 100,
          ownerKey: "enemy:100",
          remove: false
        };
        try {
          player.x = 48;
          player.y = 48;
          player.spawnFlash = 0;
          player.invuln = 0;
          player.reload = 2;
          game.screen = "gameOver";
          game.demoMode = false;
          game.paused = false;
          game.tick = 0;
          game.grid = makeGrid();
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: false };
          game.players = [player];
          game.enemies = [enemy];
          game.bullets = [bullet];
          game.explosions = [{ x: 80, y: 80, ttl: 2, max: 2, rule: "enemyHit" }];
          game.scorePopups = [{ value: 100, x: 80, y: 80, ttl: 2, max: 2, style: "float" }];
          game.powerUp = { type: "helmet", x: 8, y: 8, w: 16, h: 16, ttl: 2 };
          game.enemySpawned = enemyTotal();
          game.nextSpawn = 0;
          game.gameOverTimer = 2;
          game.freezeTimer = 0;
          game.shovelTimer = 0;
          keys.add("ArrowRight");
          pendingFirePresses.add("Space");

          var before = {
            tick: game.tick,
            timer: game.gameOverTimer,
            playerX: player.x,
            playerReload: player.reload,
            enemySpawnFlash: enemy.spawnFlash,
            bulletX: bullet.x,
            explosionTtl: game.explosions[0].ttl,
            popupTtl: game.scorePopups[0].ttl,
            powerUpTtl: game.powerUp.ttl,
            bulletCount: game.bullets.length
          };
          update();
          return {
            before: before,
            after: {
              screen: game.screen,
              tick: game.tick,
              timer: game.gameOverTimer,
              playerX: player.x,
              playerReload: player.reload,
              enemySpawnFlash: enemy.spawnFlash,
              bulletX: bullet.x,
              explosionTtl: game.explosions[0] ? game.explosions[0].ttl : 0,
              popupTtl: game.scorePopups[0] ? game.scorePopups[0].ttl : 0,
              powerUpTtl: game.powerUp ? game.powerUp.ttl : 0,
              bulletCount: game.bullets.length
            }
          };
        } finally {
          Object.assign(game, previous);
          pendingFirePresses.clear();
          previousFirePresses.forEach(function (code) { pendingFirePresses.add(code); });
          if (!rightWasHeld) keys.delete("ArrowRight");
        }
      },
      debugGameOverReturnProbe() {
        var previous = Object.assign({}, game);
        try {
          game.screen = "gameOver";
          game.paused = false;
          game.tick = 0;
          game.grid = makeGrid();
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: false };
          game.players = [];
          game.enemies = [];
          game.bullets = [];
          game.explosions = [];
          game.scorePopups = [];
          game.powerUp = null;
          game.enemySpawned = enemyTotal();
          game.nextSpawn = 0;
          game.gameOverTimer = 1;
          game.fullGameOverElapsed = 0;
          game.newHighScoreAtGameOver = false;
          update();
          var finalFrame = {
            screen: game.screen,
            timer: game.gameOverTimer
          };
          update();
          var afterFinalFrame = {
            screen: game.screen,
            timer: game.gameOverTimer,
            reason: game.stageResultReason
          };
          return { finalFrame: finalFrame, afterFinalFrame: afterFinalFrame };
        } finally {
          stopGameOverAudio();
          Object.assign(game, previous);
        }
      },
      debugGameOverStageResultProbe() {
        var previous = Object.assign({}, game);
        var p1 = createPlayer(1);
        var p2 = createPlayer(2);
        p1.alive = false;
        p1.lives = 0;
        p1.score = 21000;
        p1.stageKills = [5, 1, 0, 0];
        p1.stagePoints = 700;
        p2.alive = false;
        p2.lives = 0;
        p2.score = 800;
        p2.stageKills = [2, 0, 1, 0];
        p2.stagePoints = 500;
        try {
          game.stagePack = builtInStagePack;
          game.screen = "playing";
          game.paused = false;
          game.stage = 5;
          game.playerCount = 2;
          game.customGrid = null;
          game.players = [p1, p2];
          game.runHighScoreBaseline = 20000;
          game.newHighScoreAtGameOver = false;
          enterGameOver();
          game.gameOverTimer = 0;
          finishGameOverScreen();
          var entry = {
            screen: game.screen,
            reason: game.stageResultReason,
            stage: game.stage,
            elapsed: game.stageClearElapsed,
            timer: game.transitionTimer,
            bonusPlayerIds: game.stageClearBonusPlayerIds.slice(),
            bonusAwarded: game.stageClearBonusAwarded,
            newHighScore: game.newHighScoreAtGameOver
          };
          var counted = stageClearPresentation(game.players, 200);
          var scoreBeforeFinish = p1.score;
          game.transitionTimer = 2;
          update();
          var beforeEnd = {
            screen: game.screen,
            reason: game.stageResultReason,
            stage: game.stage,
            timer: game.transitionTimer,
            score: p1.score,
            bonusAwarded: game.stageClearBonusAwarded
          };
          update();
          var afterEnd = {
            screen: game.screen,
            stage: game.stage,
            elapsed: game.fullGameOverElapsed,
            score: p1.score,
            bonusAwarded: game.stageClearBonusAwarded,
            newHighScore: game.newHighScoreAtGameOver
          };
          finishFullGameOverScreen();
          var highScoreRoute = {
            screen: game.screen,
            elapsed: game.highScoreScreenElapsed
          };

          stopHighScoreAudio();
          game.stage = gameSettings().stageAdvance.extendedLoopEndStage;
          game.customGrid = null;
          game.newHighScoreAtGameOver = false;
          enterStageResult("gameOver");
          game.transitionTimer = 1;
          update();
          var wrappedStage = {
            screen: game.screen,
            stage: game.stage
          };
          return {
            duration: entry.timer,
            entry: entry,
            visibleRows: counted.rows.map(function (row) {
              return {
                typeIndex: row.typeIndex,
                p1VisibleKills: row.p1VisibleKills,
                p2VisibleKills: row.p2VisibleKills
              };
            }),
            scoreBeforeFinish: scoreBeforeFinish,
            beforeEnd: beforeEnd,
            afterEnd: afterEnd,
            highScoreRoute: highScoreRoute,
            wrappedStage: wrappedStage
          };
        } finally {
          stopGameOverAudio();
          stopHighScoreAudio();
          Object.assign(game, previous);
        }
      }
    });
  }

  return Object.freeze({
    createStageFlowGameOverDiagnostics: createStageFlowGameOverDiagnostics
  });
});
