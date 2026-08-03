(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.stageFlowDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /** Preserves each legacy adapter's receiver while building an explicit probe scope. */
  function bindFunctions(source) {
    if (!source || typeof source !== "object") return {};
    return Object.fromEntries(
      Object.entries(source)
        .filter((entry) => typeof entry[1] === "function")
        .map((entry) => [entry[0], entry[1].bind(source)])
    );
  }

  function requireInputs(state, deps) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!state.audio || typeof state.audio !== "object") {
      throw new Error("state.audio must be an object");
    }
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!deps.sharedState || typeof deps.sharedState !== "object") {
      throw new Error("deps.sharedState must be an object");
    }
  }

  function createRuntimeScope(state, deps) {
    requireInputs(state, deps);
    return {
      ...deps,
      ...deps.sharedState,
      ...bindFunctions(deps),
      ...bindFunctions(state.stageRuntime),
      ...bindFunctions(state.fn),
      game: state.game,
      builtInStagePack: state.builtInStagePack,
      keys: state.keys,
      pendingFirePresses: state.pendingFirePresses,
      movementAudio: state.movementAudio,
      stageStartAudio: state.audio.stageStart,
      pauseAudio: state.audio.pause
    };
  }

  /** Binds stage transitions, stage cycling, and game-over lifecycle probes. */
  function createStageFlowDiagnostics(state, deps) {
    const scope = createRuntimeScope(state, deps);
    const {
      builtInStagePack,
      checkEndState,
      clamp,
      createPlayer,
      createStageGrid,
      DEFAULT_ENEMY_SPAWN_PACING,
      DEFAULT_ENEMY_TYPES: defaultEnemyTypes,
      defaultEnemySpawnDelay,
      enemyDataStage,
      enemySequenceForStage,
      enemyTotal,
      enemyTypeDefinitions,
      enterGameOver,
      enterStageResult,
      finishFullGameOverScreen,
      finishGameOverScreen,
      FREE_AUDIO_MANIFEST,
      game,
      gameOverBannerY,
      gameOverFieldDuration,
      gameSettings,
      keys,
      makeGrid,
      mapDataStage,
      maxActiveEnemies,
      movementAudio,
      pauseAudio,
      pendingFirePresses,
      prepareBattleGrid,
      render,
      renderGameOver,
      resetPowerUpSpawnBag,
      RIGHT,
      scaleEnemySpawnDelayForPlayers,
      stageAdvanceResult,
      stageClearPresentation,
      stageCount,
      stageCycleLimit,
      stageIntroCurtainState,
      stageResultDuration,
      stageSelectCurtainState,
      stageStartAudio,
      createStageFlowTransitionDiagnostics,
      STAGE_CURTAIN_CLOSE_FRAMES,
      stopGameOverAudio,
      stopHighScoreAudio,
      summarizeEnemySequences,
      TILE,
      update,
      updatePauseAudio,
      updateStageStartAudio
    } = scope;

    return Object.freeze({
        ...createStageFlowTransitionDiagnostics(scope),
        debugStageAdvanceProbe(stage) {
          return stageAdvanceResult(stage === undefined ? stageCount() : Number(stage));
        },
        debugStageCycleProbe(stage) {
          const value = Math.max(1, Math.floor(Number(stage) || game.stage || 1));
          const sequence = enemySequenceForStage(value);
          const counts = sequence.reduce((result, enemy) => {
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
            carrierNumbers: sequence.map((enemy, index) => enemy.carrier ? index + 1 : null).filter(Boolean),
            enemyTypeCounts: counts,
            spawnIndices: sequence.map((enemy) => enemy.spawnIndex),
            onePlayerMaxActiveEnemies: maxActiveEnemies(value, 1),
            twoPlayerMaxActiveEnemies: maxActiveEnemies(value, 2),
            defaultEnemySpawnDelay: defaultEnemySpawnDelay(value),
            twoPlayerDefaultEnemySpawnDelay: scaleEnemySpawnDelayForPlayers(defaultEnemySpawnDelay(value), 2),
            firstEnemySpawnDelay: scaleEnemySpawnDelayForPlayers((gameSettings().enemySpawnPacing || DEFAULT_ENEMY_SPAWN_PACING).firstDelay, 1),
            twoPlayerFirstEnemySpawnDelay: scaleEnemySpawnDelayForPlayers((gameSettings().enemySpawnPacing || DEFAULT_ENEMY_SPAWN_PACING).firstDelay, 2),
            advance: stageAdvanceResult(value)
          };
        },
        debugOriginalEnemyGroupsProbe() {
          const names = defaultEnemyTypes.map((type) => type.name);
          return summarizeEnemySequences(builtInStagePack.enemies, names);
        },
        debugStageClearDelayProbe(framesLeft, baseAlive, killedCount) {
          const timer = Math.max(0, Math.floor(Number(framesLeft) || 0));
          const previous = {
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
          const total = enemyTotal();
          const player = {
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
          const previous = {
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
            const closingStart = {
              screen: game.screen,
              stage: game.stage,
              transitionTimer: game.transitionTimer,
              curtain: stageSelectCurtainState()
            };
            update();
            const closingFirstStep = {
              screen: game.screen,
              stage: game.stage,
              transitionTimer: game.transitionTimer,
              curtain: stageSelectCurtainState()
            };
            while (game.screen === "stageClearClosing" && game.transitionTimer > 1) update();
            const closingLastStep = {
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
              closingStart,
              closingFirstStep,
              closingLastStep
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugStageCyclePreservesPlayerStateProbe(stage) {
          const previous = {
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
          const player = createPlayer(1);
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
            const after = game.players[0];
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
          const previous = {
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
          const stageValue = Math.max(1, Math.floor(Number(stage) || 1));
          const total = enemyTotal(stageValue);
          const timings = gameSettings().timings;
          const transitions = [];
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
            const maxFrames = timings.stageClearDelay + stageResultDuration(game.players) + STAGE_CURTAIN_CLOSE_FRAMES + timings.stageIntro + 5;
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

            let frames = 0;
            for (; frames < maxFrames;) {
              const before = game.screen;
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
              frames,
              transitions,
              enemySpawned: game.enemySpawned,
              enemyKilled: game.enemyKilled,
              clearPendingTimer: game.clearPendingTimer,
              transitionTimer: game.transitionTimer
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugGameOverSlideProbe() {
          const previous = {
            screen: game.screen,
            paused: game.paused,
            gameOverTimer: game.gameOverTimer
          };
          const timings = gameSettings().timings;
          const slideDuration = timings.gameOverSlide;
          const holdDuration = timings.gameOverHold;
          const duration = gameOverFieldDuration();
          const timers = [
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
            const entry = {
              screen: game.screen,
              paused: game.paused,
              timer: game.gameOverTimer
            };
            const frames = timers.map(({ phase, timer }) => {
              game.gameOverTimer = timer;
              renderGameOver();
              return { phase, timer, y: gameOverBannerY(timer) };
            });
            return { slideDuration, holdDuration, duration, entry, frames };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugGameOverBattleProbe() {
          const previous = { ...game };
          const previousFirePresses = new Set(pendingFirePresses);
          const rightWasHeld = keys.has("ArrowRight");
          const player = createPlayer(1);
          const enemy = { alive: true, spawnFlash: 2 };
          const bullet = {
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

            const before = {
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
              before,
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
            for (const code of previousFirePresses) pendingFirePresses.add(code);
            if (!rightWasHeld) keys.delete("ArrowRight");
          }
        },
        debugGameOverReturnProbe() {
          const previous = { ...game };
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
            const finalFrame = {
              screen: game.screen,
              timer: game.gameOverTimer
            };
            update();
            const afterFinalFrame = {
              screen: game.screen,
              timer: game.gameOverTimer,
              reason: game.stageResultReason
            };
            return { finalFrame, afterFinalFrame };
          } finally {
            stopGameOverAudio();
            Object.assign(game, previous);
          }
        },
        debugGameOverStageResultProbe() {
          const previous = { ...game };
          const p1 = createPlayer(1);
          const p2 = createPlayer(2);
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
            const entry = {
              screen: game.screen,
              reason: game.stageResultReason,
              stage: game.stage,
              elapsed: game.stageClearElapsed,
              timer: game.transitionTimer,
              bonusPlayerIds: game.stageClearBonusPlayerIds.slice(),
              bonusAwarded: game.stageClearBonusAwarded,
              newHighScore: game.newHighScoreAtGameOver
            };
            const counted = stageClearPresentation(game.players, 200);
            const scoreBeforeFinish = p1.score;
            game.transitionTimer = 2;
            update();
            const beforeEnd = {
              screen: game.screen,
              reason: game.stageResultReason,
              stage: game.stage,
              timer: game.transitionTimer,
              score: p1.score,
              bonusAwarded: game.stageClearBonusAwarded
            };
            update();
            const afterEnd = {
              screen: game.screen,
              stage: game.stage,
              elapsed: game.fullGameOverElapsed,
              score: p1.score,
              bonusAwarded: game.stageClearBonusAwarded,
              newHighScore: game.newHighScoreAtGameOver
            };
            finishFullGameOverScreen();
            const highScoreRoute = {
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
            const wrappedStage = {
              screen: game.screen,
              stage: game.stage
            };
            return {
              duration: entry.timer,
              entry,
              visibleRows: counted.rows.map((row) => ({
                typeIndex: row.typeIndex,
                p1VisibleKills: row.p1VisibleKills,
                p2VisibleKills: row.p2VisibleKills
              })),
              scoreBeforeFinish,
              beforeEnd,
              afterEnd,
              highScoreRoute,
              wrappedStage
            };
          } finally {
            stopGameOverAudio();
            stopHighScoreAudio();
            Object.assign(game, previous);
          }
        },
      });
  }

  return Object.freeze({ createStageFlowDiagnostics });
});
