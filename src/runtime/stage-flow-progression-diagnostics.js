(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.stageFlowProgressionDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /** Builds stage routing, clear progression, and automatic-advance probes. */
  function createStageFlowProgressionDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");

    var builtInStagePack = scope.builtInStagePack;
    var checkEndState = scope.checkEndState;
    var createPlayer = scope.createPlayer;
    var createStageGrid = scope.createStageGrid;
    var DEFAULT_ENEMY_SPAWN_PACING = scope.DEFAULT_ENEMY_SPAWN_PACING;
    var defaultEnemyTypes = scope.DEFAULT_ENEMY_TYPES;
    var defaultEnemySpawnDelay = scope.defaultEnemySpawnDelay;
    var enemyDataStage = scope.enemyDataStage;
    var enemySequenceForStage = scope.enemySequenceForStage;
    var enemyTotal = scope.enemyTotal;
    var enemyTypeDefinitions = scope.enemyTypeDefinitions;
    var game = scope.game;
    var gameSettings = scope.gameSettings;
    var mapDataStage = scope.mapDataStage;
    var maxActiveEnemies = scope.maxActiveEnemies;
    var prepareBattleGrid = scope.prepareBattleGrid;
    var resetPowerUpSpawnBag = scope.resetPowerUpSpawnBag;
    var scaleEnemySpawnDelayForPlayers = scope.scaleEnemySpawnDelayForPlayers;
    var stageAdvanceResult = scope.stageAdvanceResult;
    var stageCount = scope.stageCount;
    var stageCycleLimit = scope.stageCycleLimit;
    var stageResultDuration = scope.stageResultDuration;
    var stageSelectCurtainState = scope.stageSelectCurtainState;
    var STAGE_CURTAIN_CLOSE_FRAMES = scope.STAGE_CURTAIN_CLOSE_FRAMES;
    var summarizeEnemySequences = scope.summarizeEnemySequences;
    var TILE = scope.TILE;
    var update = scope.update;

    return Object.freeze({
      debugStageAdvanceProbe(stage) {
        return stageAdvanceResult(stage === undefined ? stageCount() : Number(stage));
      },
      debugStageCycleProbe(stage) {
        var value = Math.max(1, Math.floor(Number(stage) || game.stage || 1));
        var sequence = enemySequenceForStage(value);
        var counts = sequence.reduce(function (result, enemy) {
          result[enemy.typeIndex] = (result[enemy.typeIndex] || 0) + 1;
          return result;
        }, {});
        return {
          stage: value,
          stageCount: stageCount(),
          stageCycleLimit: stageCycleLimit(),
          mapDataStage: mapDataStage(value),
          enemyDataStage: enemyDataStage(value),
          enemyTotal: enemyTotal(value),
          carrierNumbers: sequence.map(function (enemy, index) {
            return enemy.carrier ? index + 1 : null;
          }).filter(Boolean),
          enemyTypeCounts: counts,
          spawnIndices: sequence.map(function (enemy) { return enemy.spawnIndex; }),
          onePlayerMaxActiveEnemies: maxActiveEnemies(value, 1),
          twoPlayerMaxActiveEnemies: maxActiveEnemies(value, 2),
          defaultEnemySpawnDelay: defaultEnemySpawnDelay(value),
          twoPlayerDefaultEnemySpawnDelay: scaleEnemySpawnDelayForPlayers(defaultEnemySpawnDelay(value), 2),
          firstEnemySpawnDelay: scaleEnemySpawnDelayForPlayers(
            (gameSettings().enemySpawnPacing || DEFAULT_ENEMY_SPAWN_PACING).firstDelay,
            1
          ),
          twoPlayerFirstEnemySpawnDelay: scaleEnemySpawnDelayForPlayers(
            (gameSettings().enemySpawnPacing || DEFAULT_ENEMY_SPAWN_PACING).firstDelay,
            2
          ),
          advance: stageAdvanceResult(value)
        };
      },
      debugOriginalEnemyGroupsProbe() {
        var names = defaultEnemyTypes.map(function (type) { return type.name; });
        return summarizeEnemySequences(builtInStagePack.enemies, names);
      },
      debugStageClearDelayProbe(framesLeft, baseAlive, killedCount) {
        var timer = Math.max(0, Math.floor(Number(framesLeft) || 0));
        var previous = {
          screen: game.screen,
          paused: game.paused,
          base: game.base,
          players: game.players,
          enemies: game.enemies,
          enemyKilled: game.enemyKilled,
          enemySpawned: game.enemySpawned,
          clearPendingTimer: game.clearPendingTimer,
          transitionTimer: game.transitionTimer,
          gameOverTimer: game.gameOverTimer,
          stageClearElapsed: game.stageClearElapsed,
          stageClearBonusPlayerIds: game.stageClearBonusPlayerIds.slice(),
          stageClearBonusAwarded: game.stageClearBonusAwarded
        };
        var total = enemyTotal();
        var player = {
          id: 1,
          alive: true,
          lives: 1,
          respawn: 0,
          score: 0,
          nextBonusLifeIndex: 0,
          stagePoints: 0,
          stageKills: Array(enemyTypeDefinitions().length).fill(0)
        };
        try {
          game.screen = "playing";
          game.paused = false;
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: baseAlive !== false };
          game.players = [player];
          game.enemies = [];
          game.enemyKilled = killedCount === undefined ? total : Math.max(0, Math.floor(Number(killedCount) || 0));
          game.enemySpawned = total;
          game.clearPendingTimer = timer;
          game.transitionTimer = 0;
          checkEndState();
          return {
            screen: game.screen,
            enemyKilled: game.enemyKilled,
            enemySpawned: game.enemySpawned,
            clearPendingTimer: game.clearPendingTimer,
            transitionTimer: game.transitionTimer,
            gameOverTimer: game.gameOverTimer
          };
        } finally {
          Object.assign(game, previous);
        }
      },
      debugStageClearAdvanceProbe(stage) {
        var previous = {
          screen: game.screen,
          paused: game.paused,
          stage: game.stage,
          tick: game.tick,
          transitionTimer: game.transitionTimer,
          grid: game.grid,
          customGrid: game.customGrid,
          constructedGrid: game.constructedGrid,
          constructionStageActive: game.constructionStageActive,
          players: game.players,
          enemies: game.enemies,
          bullets: game.bullets,
          explosions: game.explosions,
          powerUp: game.powerUp,
          lastPowerUpSpawn: game.lastPowerUpSpawn,
          powerUpSpawnBag: game.powerUpSpawnBag.slice(),
          powerUpSpawnBagKey: game.powerUpSpawnBagKey,
          base: game.base,
          enemySpawned: game.enemySpawned,
          enemyKilled: game.enemyKilled,
          nextSpawn: game.nextSpawn,
          clearPendingTimer: game.clearPendingTimer,
          gameOverTimer: game.gameOverTimer,
          freezeTimer: game.freezeTimer,
          shovelTimer: game.shovelTimer,
          stageClearElapsed: game.stageClearElapsed,
          stageClearBonusPlayerIds: game.stageClearBonusPlayerIds.slice(),
          stageClearBonusAwarded: game.stageClearBonusAwarded
        };
        try {
          game.screen = "stageClear";
          game.paused = false;
          game.stage = Math.max(1, Math.floor(Number(stage) || 1));
          game.customGrid = null;
          game.players = [createPlayer(1)];
          game.stageClearElapsed = 0;
          game.stageClearBonusPlayerIds = [];
          game.stageClearBonusAwarded = true;
          game.transitionTimer = 1;
          update();
          var closingStart = {
            screen: game.screen,
            stage: game.stage,
            transitionTimer: game.transitionTimer,
            curtain: stageSelectCurtainState()
          };
          update();
          var closingFirstStep = {
            screen: game.screen,
            stage: game.stage,
            transitionTimer: game.transitionTimer,
            curtain: stageSelectCurtainState()
          };
          while (game.screen === "stageClearClosing" && game.transitionTimer > 1) update();
          var closingLastStep = {
            screen: game.screen,
            stage: game.stage,
            transitionTimer: game.transitionTimer,
            curtain: stageSelectCurtainState()
          };
          if (game.screen === "stageClearClosing") update();
          return {
            screen: game.screen,
            stage: game.stage,
            transitionTimer: game.transitionTimer,
            clearPendingTimer: game.clearPendingTimer,
            enemySpawned: game.enemySpawned,
            nextSpawn: game.nextSpawn,
            constructionStageActive: game.constructionStageActive,
            closingStart: closingStart,
            closingFirstStep: closingFirstStep,
            closingLastStep: closingLastStep
          };
        } finally {
          Object.assign(game, previous);
        }
      },
      debugStageCyclePreservesPlayerStateProbe(stage) {
        var previous = {
          screen: game.screen,
          paused: game.paused,
          stage: game.stage,
          tick: game.tick,
          transitionTimer: game.transitionTimer,
          grid: game.grid,
          customGrid: game.customGrid,
          constructedGrid: game.constructedGrid,
          constructionStageActive: game.constructionStageActive,
          players: game.players,
          enemies: game.enemies,
          bullets: game.bullets,
          explosions: game.explosions,
          powerUp: game.powerUp,
          lastPowerUpSpawn: game.lastPowerUpSpawn,
          powerUpSpawnBag: game.powerUpSpawnBag.slice(),
          powerUpSpawnBagKey: game.powerUpSpawnBagKey,
          base: game.base,
          enemySpawned: game.enemySpawned,
          enemyKilled: game.enemyKilled,
          nextSpawn: game.nextSpawn,
          clearPendingTimer: game.clearPendingTimer,
          gameOverTimer: game.gameOverTimer,
          freezeTimer: game.freezeTimer,
          shovelTimer: game.shovelTimer,
          stageClearElapsed: game.stageClearElapsed,
          stageClearBonusPlayerIds: game.stageClearBonusPlayerIds.slice(),
          stageClearBonusAwarded: game.stageClearBonusAwarded
        };
        var player = createPlayer(1);
        player.score = 54321;
        player.level = 3;
        player.lives = 4;
        player.nextBonusLifeIndex = 1;
        player.stagePoints = 1200;
        player.stageKills = [2, 1, 0, 0];
        player.totalKills = [7, 5, 3, 1];
        try {
          game.screen = "stageClear";
          game.paused = false;
          game.stage = Math.max(1, Math.floor(Number(stage) || stageCycleLimit()));
          game.customGrid = null;
          game.players = [player];
          game.enemies = [];
          game.bullets = [];
          game.explosions = [];
          game.powerUp = null;
          game.lastPowerUpSpawn = "6,6";
          resetPowerUpSpawnBag();
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
          game.enemySpawned = enemyTotal(game.stage);
          game.enemyKilled = enemyTotal(game.stage);
          game.nextSpawn = 0;
          game.clearPendingTimer = 0;
          game.gameOverTimer = 0;
          game.freezeTimer = 0;
          game.shovelTimer = 0;
          game.stageClearElapsed = 0;
          game.stageClearBonusPlayerIds = [];
          game.stageClearBonusAwarded = true;
          game.transitionTimer = 1;

          update();
          while (game.screen === "stageClearClosing") update();
          var after = game.players[0];
          return {
            screen: game.screen,
            stage: game.stage,
            mapDataStage: mapDataStage(game.stage),
            enemyDataStage: enemyDataStage(game.stage),
            score: after.score,
            level: after.level,
            lives: after.lives,
            nextBonusLifeIndex: after.nextBonusLifeIndex,
            stagePoints: after.stagePoints,
            stageKills: after.stageKills.slice(),
            totalKills: after.totalKills.slice(),
            enemySpawned: game.enemySpawned,
            clearPendingTimer: game.clearPendingTimer,
            powerUp: game.powerUp,
            lastPowerUpSpawn: game.lastPowerUpSpawn,
            powerUpSpawnBagLength: game.powerUpSpawnBag.length
          };
        } finally {
          Object.assign(game, previous);
        }
      },
      debugCompletedStageAdvanceProbe(stage, killedCount) {
        var previous = {
          screen: game.screen,
          paused: game.paused,
          stage: game.stage,
          tick: game.tick,
          transitionTimer: game.transitionTimer,
          grid: game.grid,
          customGrid: game.customGrid,
          constructedGrid: game.constructedGrid,
          constructionStageActive: game.constructionStageActive,
          players: game.players,
          enemies: game.enemies,
          bullets: game.bullets,
          explosions: game.explosions,
          powerUp: game.powerUp,
          lastPowerUpSpawn: game.lastPowerUpSpawn,
          powerUpSpawnBag: game.powerUpSpawnBag.slice(),
          powerUpSpawnBagKey: game.powerUpSpawnBagKey,
          base: game.base,
          enemySpawned: game.enemySpawned,
          enemyKilled: game.enemyKilled,
          nextSpawn: game.nextSpawn,
          clearPendingTimer: game.clearPendingTimer,
          gameOverTimer: game.gameOverTimer,
          freezeTimer: game.freezeTimer,
          shovelTimer: game.shovelTimer,
          stageClearElapsed: game.stageClearElapsed,
          stageClearBonusPlayerIds: game.stageClearBonusPlayerIds.slice(),
          stageClearBonusAwarded: game.stageClearBonusAwarded
        };
        var stageValue = Math.max(1, Math.floor(Number(stage) || 1));
        var total = enemyTotal(stageValue);
        var timings = gameSettings().timings;
        var transitions = [];
        try {
          game.screen = "playing";
          game.paused = false;
          game.stage = stageValue;
          game.tick = 0;
          game.transitionTimer = 0;
          game.grid = createStageGrid(stageValue);
          prepareBattleGrid(game.grid);
          game.customGrid = null;
          game.players = [createPlayer(1)];
          var maxFrames = timings.stageClearDelay + stageResultDuration(game.players) + STAGE_CURTAIN_CLOSE_FRAMES + timings.stageIntro + 5;
          game.enemies = [];
          game.bullets = [];
          game.explosions = [];
          game.powerUp = null;
          game.lastPowerUpSpawn = null;
          resetPowerUpSpawnBag();
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
          game.enemySpawned = total;
          game.enemyKilled = killedCount === undefined ? total : Math.max(0, Math.floor(Number(killedCount) || 0));
          game.nextSpawn = 0;
          game.clearPendingTimer = 0;
          game.gameOverTimer = 0;
          game.freezeTimer = 0;
          game.shovelTimer = 0;

          var frames = 0;
          for (; frames < maxFrames;) {
            var before = game.screen;
            update();
            frames += 1;
            if (game.screen !== before) {
              transitions.push({
                frame: frames,
                screen: game.screen,
                stage: game.stage,
                clearPendingTimer: game.clearPendingTimer,
                transitionTimer: game.transitionTimer
              });
            }
            if (game.screen === "stageIntro" && game.stage !== stageValue) break;
          }

          return {
            screen: game.screen,
            stage: game.stage,
            frames: frames,
            transitions: transitions,
            enemySpawned: game.enemySpawned,
            enemyKilled: game.enemyKilled,
            clearPendingTimer: game.clearPendingTimer,
            transitionTimer: game.transitionTimer
          };
        } finally {
          Object.assign(game, previous);
        }
      }
    });
  }

  return Object.freeze({
    createStageFlowProgressionDiagnostics: createStageFlowProgressionDiagnostics
  });
});
