(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.timerDiagnostics = api;
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
      game: state.game
    };
  }

  /** Binds global-timer, shield-cadence, and enemy-freeze probes. */
  function createTimerDiagnostics(state, deps) {
    const scope = createRuntimeScope(state, deps);
    const {
      applyPowerUp,
      DOWN,
      enemyTypeDefinitions,
      game,
      gameSettings,
      isEnemyTimeFrozen,
      isGlobalTimerTick,
      isPlayerShieldVisible,
      makeGrid,
      preparePausedDebugBattle,
      RIGHT,
      shieldColorForTick,
      shouldSpawnEnemies,
      TILE,
      UP,
      update,
      updateBullets,
      updateEnemies
    } = scope;

    return Object.freeze({
        debugTimerRuleProbe() {
          const previousFreezeTimer = game.freezeTimer;
          game.freezeTimer = 1;
          const frozen = isEnemyTimeFrozen();
          const canSpawn = shouldSpawnEnemies();
          game.freezeTimer = previousFreezeTimer;
          return { frozen, canSpawn };
        },
        debugGlobalTimerCadenceProbe() {
          const countdownFrames = (units, startTick) => {
            let remaining = units;
            let tick = startTick;
            let frames = 0;
            while (remaining > 0 && frames < 100000) {
              tick += 1;
              frames += 1;
              if (isGlobalTimerTick(tick)) remaining -= 1;
            }
            return frames;
          };
          return {
            unitFrames: 64,
            boundaries: [62, 63, 64, 65, 127, 128].map((tick) => ({ tick, active: isGlobalTimerTick(tick) })),
            durations: { ...gameSettings().powerUpDurations },
            spawnShieldUnits: gameSettings().timings.playerInvulnerability,
            timerDisplayFrames: {
              phase0: countdownFrames(gameSettings().powerUpDurations.timer, 0),
              phase63: countdownFrames(gameSettings().powerUpDurations.timer, 63)
            },
            spawnShieldDisplayFrames: {
              phase0: countdownFrames(gameSettings().timings.playerInvulnerability, 0),
              phase63: countdownFrames(gameSettings().timings.playerInvulnerability, 63)
            }
          };
        },
        debugShieldCadenceProbe() {
          return Array.from({ length: 8 }, (_, tick) => ({ tick, color: shieldColorForTick(tick), visible: true }));
        },
        debugPausedShieldProbe() {
          const previous = { ...game };
          const player = { alive: true, lives: 1, respawn: 0, invuln: 2 };
          try {
            preparePausedDebugBattle(63);
            game.paused = false;
            game.players = [player];

            const activeVisible = isPlayerShieldVisible(player, game.paused);
            game.paused = true;
            const pausedVisible = isPlayerShieldVisible(player, game.paused);
            const beforePausedUpdate = { tick: game.tick, invuln: player.invuln };
            update();
            const afterPausedUpdate = {
              tick: game.tick,
              pauseElapsed: game.pauseElapsed,
              invuln: player.invuln
            };
            game.paused = false;
            const resumedVisible = isPlayerShieldVisible(player, game.paused);
            player.invuln = 0;
            const expiredVisible = isPlayerShieldVisible(player, game.paused);
            return { activeVisible, pausedVisible, resumedVisible, expiredVisible, beforePausedUpdate, afterPausedUpdate };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugTimerFreezeBehaviorProbe() {
          const previous = {
            grid: game.grid,
            players: game.players,
            enemies: game.enemies,
            bullets: game.bullets,
            explosions: game.explosions,
            scorePopups: game.scorePopups,
            freezeTimer: game.freezeTimer,
            highScore: game.highScore
          };
          const player = {
            id: 1,
            score: 0,
            stagePoints: 0,
            stageKills: Array(enemyTypeDefinitions().length).fill(0),
            totalKills: Array(enemyTypeDefinitions().length).fill(0),
            nextBonusLifeIndex: 0,
            lives: 2,
            alive: true
          };
          const enemy = {
            kind: "enemy",
            id: 100,
            x: 64,
            y: 64,
            w: 14,
            h: 14,
            dir: RIGHT,
            speed: 1,
            reload: 9,
            reloadBase: 9,
            blockedPauseTicks: 0,
            pendingTurn: false,
            alternateMovement: false,
            spawnFlash: 0,
            fireChance: 0,
            alive: true
          };
          const bullet = {
            x: 16,
            y: 144,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            dir: RIGHT,
            speed: 2,
            power: 1,
            ownerKind: "player",
            ownerId: 1,
            ownerKey: "player:1",
            remove: false
          };

          try {
            game.grid = makeGrid();
            game.players = [player];
            game.enemies = [enemy];
            game.bullets = [bullet];
            game.explosions = [];
            game.scorePopups = [];
            applyPowerUp(player, "timer");
            const before = {
              enemyX: enemy.x,
              enemyReload: enemy.reload,
              bulletX: bullet.x,
              freezeTimer: game.freezeTimer,
              score: player.score
            };
            updateEnemies();
            updateBullets();
            return {
              duration: gameSettings().powerUpDurations.timer,
              pickupScore: gameSettings().powerUpRules.pickupScore,
              before,
              after: {
                enemyX: enemy.x,
                enemyReload: enemy.reload,
                bulletX: bullet.x,
                freezeTimer: game.freezeTimer,
                score: player.score
              }
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugTimerFinalFrameFreezeProbe() {
          const previous = {
            screen: game.screen,
            paused: game.paused,
            stage: game.stage,
            tick: game.tick,
            frameLow: game.frameLow,
            frameHigh: game.frameHigh,
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            bullets: game.bullets,
            explosions: game.explosions,
            powerUp: game.powerUp,
            enemySpawned: game.enemySpawned,
            nextSpawn: game.nextSpawn,
            clearPendingTimer: game.clearPendingTimer,
            gameOverTimer: game.gameOverTimer,
            freezeTimer: game.freezeTimer,
            shovelTimer: game.shovelTimer
          };
          const player = {
            kind: "player",
            id: 1,
            x: 32,
            y: 160,
            w: 14,
            h: 14,
            dir: UP,
            speed: gameSettings().playerMovement.speed,
            alive: true,
            lives: 1,
            respawn: 0,
            spawnFlash: 0,
            invuln: 0,
            stun: 0,
            pendingSnap: false,
            level: 0,
            reload: 0,
            score: 0,
            stagePoints: 0,
            stageKills: Array(enemyTypeDefinitions().length).fill(0),
            totalKills: Array(enemyTypeDefinitions().length).fill(0),
            nextBonusLifeIndex: 0,
            slide: 0
          };
          const activeEnemy = {
            kind: "enemy",
            id: 100,
            x: 64,
            y: 64,
            w: 14,
            h: 14,
            dir: RIGHT,
            speed: 1,
            hp: 1,
            reload: 9,
            reloadBase: 9,
            blockedPauseTicks: 0,
            pendingTurn: false,
            alternateMovement: false,
            spawnFlash: 0,
            fireChance: 0,
            alive: true
          };
          const spawningEnemy = {
            kind: "enemy",
            id: 101,
            x: 96,
            y: 16,
            w: 14,
            h: 14,
            dir: DOWN,
            speed: 1,
            hp: 1,
            reload: 9,
            reloadBase: 9,
            blockedPauseTicks: 2,
            pendingTurn: false,
            alternateMovement: false,
            spawnFlash: 5,
            fireChance: 0,
            alive: true
          };
          const bullet = {
            x: 16,
            y: 144,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            dir: RIGHT,
            speed: 2,
            power: 1,
            ownerKind: "player",
            ownerId: 1,
            ownerKey: "player:1",
            remove: false
          };
          try {
            game.screen = "playing";
            game.paused = false;
            game.stage = 1;
            game.tick = 63;
            game.frameLow = 0x3f;
            game.frameHigh = 0;
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [player];
            game.enemies = [activeEnemy, spawningEnemy];
            game.bullets = [bullet];
            game.explosions = [];
            game.powerUp = null;
            game.enemySpawned = 0;
            game.nextSpawn = 5;
            game.clearPendingTimer = 0;
            game.gameOverTimer = 0;
            game.freezeTimer = 1;
            game.shovelTimer = 0;
            const before = {
              activeEnemyX: activeEnemy.x,
              activeEnemyReload: activeEnemy.reload,
              activeEnemyBlockedPauseTicks: activeEnemy.blockedPauseTicks,
              spawningEnemyFlash: spawningEnemy.spawnFlash,
              nextSpawn: game.nextSpawn,
              bulletX: bullet.x,
              freezeTimer: game.freezeTimer
            };
            update();
            return {
              before,
              after: {
                activeEnemyX: activeEnemy.x,
                activeEnemyReload: activeEnemy.reload,
                activeEnemyBlockedPauseTicks: activeEnemy.blockedPauseTicks,
                spawningEnemyFlash: spawningEnemy.spawnFlash,
                nextSpawn: game.nextSpawn,
                bulletX: game.bullets[0] ? game.bullets[0].x : null,
                freezeTimer: game.freezeTimer
              }
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugTimerSpawnDuringFreezeProbe() {
          const previous = {
            screen: game.screen,
            paused: game.paused,
            stage: game.stage,
            tick: game.tick,
            frameLow: game.frameLow,
            frameHigh: game.frameHigh,
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            bullets: game.bullets,
            explosions: game.explosions,
            powerUp: game.powerUp,
            enemySpawned: game.enemySpawned,
            nextSpawn: game.nextSpawn,
            clearPendingTimer: game.clearPendingTimer,
            gameOverTimer: game.gameOverTimer,
            freezeTimer: game.freezeTimer,
            shovelTimer: game.shovelTimer
          };
          const player = {
            kind: "player",
            id: 1,
            x: 32,
            y: 160,
            w: 14,
            h: 14,
            dir: UP,
            speed: gameSettings().playerMovement.speed,
            alive: true,
            lives: 1,
            respawn: 0,
            spawnFlash: 0,
            invuln: 0,
            stun: 0,
            pendingSnap: false,
            level: 0,
            reload: 0,
            score: 0,
            stagePoints: 0,
            stageKills: Array(enemyTypeDefinitions().length).fill(0),
            totalKills: Array(enemyTypeDefinitions().length).fill(0),
            nextBonusLifeIndex: 0,
            slide: 0
          };

          try {
            game.screen = "playing";
            game.paused = false;
            game.stage = 1;
            game.tick = 0;
            game.frameLow = 0;
            game.frameHigh = 0;
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [player];
            game.enemies = [];
            game.bullets = [];
            game.explosions = [];
            game.powerUp = null;
            game.enemySpawned = 0;
            game.nextSpawn = 0;
            game.clearPendingTimer = 0;
            game.gameOverTimer = 0;
            game.freezeTimer = 2;
            game.shovelTimer = 0;

            update();
            const spawnedEnemy = game.enemies[0];
            const afterSpawn = {
              enemyCount: game.enemies.length,
              enemySpawned: game.enemySpawned,
              spawnedEnemyFlash: spawnedEnemy ? spawnedEnemy.spawnFlash : null,
              freezeTimer: game.freezeTimer,
              nextSpawn: game.nextSpawn
            };

            update();
            const afterFrozenFrame = {
              enemyCount: game.enemies.length,
              enemySpawned: game.enemySpawned,
              spawnedEnemyFlash: spawnedEnemy ? spawnedEnemy.spawnFlash : null,
              freezeTimer: game.freezeTimer,
              nextSpawn: game.nextSpawn
            };
            for (let frame = 1; frame < gameSettings().timings.enemySpawnFlash; frame += 1) update();
            if (spawnedEnemy) {
              spawnedEnemy.reload = 0;
              spawnedEnemy.fireChance = 1;
            }
            const afterSpawnAnimation = {
              spawnedEnemyFlash: spawnedEnemy ? spawnedEnemy.spawnFlash : null,
              enemyX: spawnedEnemy ? spawnedEnemy.x : null,
              enemyY: spawnedEnemy ? spawnedEnemy.y : null,
              enemyReload: spawnedEnemy ? spawnedEnemy.reload : null,
              enemyBulletCount: spawnedEnemy
                ? game.bullets.filter((bullet) => bullet.ownerKey === `enemy:${spawnedEnemy.id}`).length
                : null,
              freezeTimer: game.freezeTimer,
              nextSpawn: game.nextSpawn
            };
            update();
            return {
              expectedSpawnFlash: gameSettings().timings.enemySpawnFlash,
              afterSpawn,
              afterFrozenFrame,
              afterSpawnAnimation,
              afterFrozenActiveFrame: {
                spawnedEnemyFlash: spawnedEnemy ? spawnedEnemy.spawnFlash : null,
                enemyX: spawnedEnemy ? spawnedEnemy.x : null,
                enemyY: spawnedEnemy ? spawnedEnemy.y : null,
                enemyReload: spawnedEnemy ? spawnedEnemy.reload : null,
                enemyBulletCount: spawnedEnemy
                  ? game.bullets.filter((bullet) => bullet.ownerKey === `enemy:${spawnedEnemy.id}`).length
                  : null,
                freezeTimer: game.freezeTimer,
                nextSpawn: game.nextSpawn
              }
            };
          } finally {
            Object.assign(game, previous);
          }
        },
    });
  }

  return Object.freeze({ createTimerDiagnostics });
});
