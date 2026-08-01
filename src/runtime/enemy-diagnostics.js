(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.enemyDiagnostics = api;
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
      game: state.game,
      pendingFirePresses: state.pendingFirePresses
    };
  }

  function createEnemySpawnOverlapProbe(scope) {
    const {
      enemySpawnPoint,
      game,
      gameSettings,
      getEnemySpec,
      HALF,
      makeGrid,
      rectsOverlap,
      spawnEnemies,
      TILE
    } = scope;

    return function debugEnemySpawnOverlapProbe() {
      const previous = {
        stage: game.stage,
        playerCount: game.playerCount,
        grid: game.grid,
        base: game.base,
        players: game.players,
        enemies: game.enemies,
        bullets: game.bullets,
        explosions: game.explosions,
        powerUp: game.powerUp,
        enemySpawned: game.enemySpawned,
        nextSpawn: game.nextSpawn
      };
      try {
        game.stage = 1;
        game.playerCount = 1;
        game.grid = makeGrid();
        game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
        const spec = getEnemySpec(game.stage, 0);
        const point = enemySpawnPoint(spec.spawnIndex);
        const blocker = {
          kind: "enemy",
          id: 200,
          slotIndex: 2,
          x: point.x,
          y: point.y,
          w: 14,
          h: 14,
          alive: true,
          respawn: 0,
          spawnFlash: gameSettings().timings.enemySpawnFlash
        };
        game.players = [0, 1, 2]
          .filter((index) => index !== spec.spawnIndex)
          .map((index) => {
            const point = enemySpawnPoint(index);
            return {
              kind: "player",
              id: 300 + index,
              x: point.x,
              y: point.y,
              w: 14,
              h: 14,
              alive: true,
              respawn: 0
            };
          });
        game.enemies = [blocker];
        game.bullets = [];
        game.explosions = [];
        game.powerUp = null;
        game.enemySpawned = 0;
        game.nextSpawn = 0;
        spawnEnemies();
        const blocked = {
          enemyCount: game.enemies.length,
          enemySpawned: game.enemySpawned,
          retry: game.nextSpawn
        };
        blocker.x = HALF * 2;
        blocker.y = HALF * 2;
        game.players = [];
        for (let frame = 0; frame < gameSettings().timings.enemySpawnRetry; frame += 1) spawnEnemies();
        const beforeRetry = {
          enemyCount: game.enemies.length,
          enemySpawned: game.enemySpawned,
          retry: game.nextSpawn
        };
        spawnEnemies();
        const spawnedEnemy = game.enemies.find((enemy) => enemy !== blocker);
        return {
          blocked,
          beforeRetry,
          afterRetry: {
            enemyCount: game.enemies.length,
            enemySpawned: game.enemySpawned,
            enemyOverlap: Boolean(spawnedEnemy && rectsOverlap(blocker, spawnedEnemy))
          },
          spawnIndex: spec.spawnIndex,
          enemyPosition: spawnedEnemy ? { x: spawnedEnemy.x, y: spawnedEnemy.y } : null
        };
      } finally {
        Object.assign(game, previous);
      }
    };
  }

  /** Binds enemy carrier, AI, movement, spawn, and presentation probes. */
  function createEnemyDiagnostics(state, deps) {
    const scope = createRuntimeScope(state, deps);
    const {
      battleDisplayFrame,
      BRICK,
      CARRIER_FLASH_COLOR,
      CARRIER_FLASH_PHASE_FRAMES,
      clamp,
      defaultEnemySpawnDelay,
      directionName,
      directionTowardTarget,
      enemyAiPhase,
      enemyColor,
      enemySpawnDelay,
      enemyTypeDefinitions,
      game,
      gameSettings,
      getEnemySpec,
      isEnemyMovementFrame,
      isPlayerTankVisible,
      makeGrid,
      pendingFirePresses,
      preparePausedDebugBattle,
      scaleEnemySpawnDelayForPlayers,
      selectEnemyTargetPlayer,
      setTile,
      shouldReleaseCarrierPowerUp,
      spawnAnimationPresentation,
      spawnEnemies,
      tankPrimaryColor,
      targetableEnemyPlayers,
      TILE,
      UP,
      update,
      updateEnemies,
      updateEnemyMovement,
      updatePlayers
    } = scope;

    return Object.freeze({
        debugCarrierReleaseProbe(hpBeforeHit) {
          const hp = Math.max(1, Math.floor(Number(hpBeforeHit) || 1));
          return {
            rule: gameSettings().powerUpRules.carrierRelease,
            clearUncollectedOnCarrierSpawn: gameSettings().powerUpRules.clearUncollectedOnCarrierSpawn,
            pickupScore: gameSettings().powerUpRules.pickupScore,
            releaseOnThisHit: shouldReleaseCarrierPowerUp(
              true,
              hp - 1 <= 0,
              gameSettings().powerUpRules.carrierRelease
            )
          };
        },
        debugCarrierFlashProbe() {
          const type = enemyTypeDefinitions()[0];
          const baseTank = { carrier: false, stun: 0 };
          const carrierTank = { carrier: true, stun: 0 };
          return {
            baseColor: tankPrimaryColor(baseTank, type.color, 0),
            flashColor: tankPrimaryColor(carrierTank, type.color, 0),
            normalPhaseColor: tankPrimaryColor(carrierTank, type.color, 8),
            flashColorValue: CARRIER_FLASH_COLOR,
            phaseFrames: CARRIER_FLASH_PHASE_FRAMES
          };
        },
        debugPausedTankVisualProbe() {
          const previous = { ...game };
          const type = enemyTypeDefinitions()[0];
          const carrier = { carrier: true };
          const stunnedPlayer = { stun: 1 };
          try {
            preparePausedDebugBattle(7);

            const snapshot = () => {
              const displayFrame = battleDisplayFrame();
              return {
                tick: game.tick,
                pauseElapsed: game.pauseElapsed,
                displayFrame,
                carrierColor: tankPrimaryColor(carrier, type.color, displayFrame),
                carrierBaseColor: type.color,
                carrierFlashColor: CARRIER_FLASH_COLOR,
                stunnedVisible: isPlayerTankVisible(stunnedPlayer, displayFrame)
              };
            };
            const initial = snapshot();
            update();
            const afterOneFrame = snapshot();
            for (let frame = 0; frame < 8; frame += 1) update();
            const afterNineFrames = snapshot();

            game.paused = false;
            game.tick = 23;
            const afterResume = snapshot();
            return { initial, afterOneFrame, afterNineFrames, afterResume };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugEnemyColorProbe(typeIndex, hp) {
          const type = enemyTypeDefinitions()[clamp(Math.floor(Number(typeIndex) || 0), 0, enemyTypeDefinitions().length - 1)];
          return enemyColor({
            hp: Math.max(1, Math.floor(Number(hp) || type.hp)),
            maxHp: type.hp,
            color: type.color,
            hitColors: type.hitColors ? type.hitColors.slice() : null
          });
        },
        debugEnemyTargetEligibilityProbe() {
          const previousPlayers = game.players;
          try {
            game.players = [
              { id: 1, alive: true, spawnFlash: 0, respawn: 0 },
              { id: 2, alive: true, spawnFlash: gameSettings().timings.playerSpawnFlash, respawn: 0 },
              { id: 3, alive: false, spawnFlash: 0, respawn: gameSettings().timings.playerRespawn },
              { id: 4, alive: false, spawnFlash: 0, respawn: 0 }
            ];
            return {
              targetableIds: targetableEnemyPlayers(game.players).map((player) => player.id),
              spawningId: 2,
              respawningId: 3
            };
          } finally {
            game.players = previousPlayers;
          }
        },
        debugEnemyAiPhaseProbe(stage, players) {
          const previousPlayerCount = game.playerCount;
          const stageValue = Math.max(1, Math.floor(Number(stage) || 1));
          try {
            game.playerCount = Math.max(1, Math.min(2, Math.floor(Number(players) || 1)));
            const interval = scaleEnemySpawnDelayForPlayers(defaultEnemySpawnDelay(stageValue), game.playerCount);
            const randomEnd = Math.floor(interval / 8);
            const playerEnd = Math.floor(interval / 4);
            return {
              stage: stageValue,
              players: game.playerCount,
              interval,
              randomEnd,
              playerEnd,
              phases: [
                { frameHigh: randomEnd, displayFrames: randomEnd * 64, phase: enemyAiPhase(stageValue, randomEnd) },
                { frameHigh: randomEnd + 1, displayFrames: (randomEnd + 1) * 64, phase: enemyAiPhase(stageValue, randomEnd + 1) },
                { frameHigh: playerEnd + 1, displayFrames: (playerEnd + 1) * 64, phase: enemyAiPhase(stageValue, playerEnd + 1) }
              ]
            };
          } finally {
            game.playerCount = previousPlayerCount;
          }
        },
        debugEnemyTargetingProbe() {
          const previousPlayers = game.players;
          const enemy = { x: 73, y: 73, w: 14, h: 14, slotIndex: 7 };
          const upperLeft = { x: 64, y: 64 };
          const lowerRight = { x: 96, y: 96 };
          try {
            game.players = [
              { id: 1, alive: true, x: 32, y: 160, w: 14, h: 14 },
              { id: 2, alive: true, x: 128, y: 160, w: 14, h: 14 }
            ];
            const oddSlotTarget = selectEnemyTargetPlayer(enemy, game.players);
            enemy.slotIndex = 6;
            const evenSlotTarget = selectEnemyTargetPlayer(enemy, game.players);
            game.players[1].alive = false;
            enemy.slotIndex = 7;
            const fallbackTarget = selectEnemyTargetPlayer(enemy, game.players);
            return {
              oddSlotTargetId: oddSlotTarget ? oddSlotTarget.id : null,
              evenSlotTargetId: evenSlotTarget ? evenSlotTarget.id : null,
              fallbackTargetId: fallbackTarget ? fallbackTarget.id : null,
              upperLeftVerticalFirst: directionName(directionTowardTarget(enemy, upperLeft, false)),
              upperLeftHorizontalFirst: directionName(directionTowardTarget(enemy, upperLeft, true)),
              lowerRightVerticalFirst: directionName(directionTowardTarget(enemy, lowerRight, false)),
              lowerRightHorizontalFirst: directionName(directionTowardTarget(enemy, lowerRight, true))
            };
          } finally {
            game.players = previousPlayers;
          }
        },
        debugEnemyMovementCadenceProbe() {
          const previous = { tick: game.tick, frameLow: game.frameLow };
          const normal = { slotIndex: 5, alternateMovement: true };
          const fast = { slotIndex: 5, alternateMovement: false };
          try {
            const frames = [];
            for (let tick = 0; tick < 4; tick += 1) {
              game.tick = tick;
              game.frameLow = tick;
              frames.push({
                tick,
                normal: isEnemyMovementFrame(normal, game.frameLow),
                fast: isEnemyMovementFrame(fast, game.frameLow)
              });
            }
            return frames;
          } finally {
            Object.assign(game, previous);
          }
        },
        debugEnemyBlockedStateProbe() {
          const previous = {
            tick: game.tick,
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies
          };
          const makeEnemy = () => ({
            kind: "enemy",
            id: 100,
            slotIndex: 5,
            x: 1,
            y: 17,
            w: 14,
            h: 14,
            dir: UP,
            speed: 8,
            alternateMovement: false,
            blockedPauseTicks: 0,
            pendingTurn: false,
            alive: true,
            respawn: 0
          });
          const byteSequence = (bytes) => {
            let index = 0;
            return () => ((bytes[Math.min(index++, bytes.length - 1)] || 0) + 0.01) / 256;
          };
          try {
            game.tick = 0;
            game.grid = makeGrid();
            setTile(game.grid, 0, 0, BRICK);
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [];
            const retryEnemy = makeEnemy();
            game.enemies = [retryEnemy];
            updateEnemyMovement(retryEnemy, byteSequence([1, 3]));
            const retry = { dir: retryEnemy.dir, blockedPauseTicks: retryEnemy.blockedPauseTicks, pendingTurn: retryEnemy.pendingTurn };
            updateEnemyMovement(retryEnemy, byteSequence([0]));
            const retryPause1 = retryEnemy.blockedPauseTicks;
            updateEnemyMovement(retryEnemy, byteSequence([0]));
            const retryPause2 = retryEnemy.blockedPauseTicks;

            const turnEnemy = makeEnemy();
            game.enemies = [turnEnemy];
            updateEnemyMovement(turnEnemy, byteSequence([1, 0]));
            const turn = { dir: turnEnemy.dir, blockedPauseTicks: turnEnemy.blockedPauseTicks, pendingTurn: turnEnemy.pendingTurn };
            return { retry, retryPause1, retryPause2, turn };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugEnemySpawnTimelineProbe(players, count) {
          const previous = {
            stage: game.stage,
            playerCount: game.playerCount,
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            bullets: game.bullets,
            explosions: game.explosions,
            powerUp: game.powerUp,
            enemySpawned: game.enemySpawned,
            nextSpawn: game.nextSpawn
          };
          const targetCount = Math.max(1, Math.min(6, Math.floor(Number(count) || 3)));
          try {
            game.stage = 1;
            game.playerCount = Math.max(1, Math.min(2, Math.floor(Number(players) || 1)));
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [];
            game.enemies = [];
            game.bullets = [];
            game.explosions = [];
            game.powerUp = null;
            game.enemySpawned = 0;
            game.nextSpawn = enemySpawnDelay(game.stage, 0);
            const frames = [];
            for (let frame = 1; frame <= 1200 && frames.length < targetCount; frame += 1) {
              const before = game.enemySpawned;
              spawnEnemies();
              if (game.enemySpawned > before) frames.push(frame);
            }
            return {
              players: game.playerCount,
              interval: scaleEnemySpawnDelayForPlayers(defaultEnemySpawnDelay(1), game.playerCount),
              frames,
              slots: game.enemies.map((enemy) => enemy.slotIndex),
              spawnIndices: game.enemies.map((enemy) => getEnemySpec(1, enemy.id - 100).spawnIndex),
              states: game.enemies.map((enemy) => ({
                ...enemy,
                hitColors: enemy.hitColors ? enemy.hitColors.slice() : null
              }))
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugSpawnAnimationCadenceProbe() {
          const playerDuration = gameSettings().timings.playerSpawnFlash;
          const enemyDuration = gameSettings().timings.enemySpawnFlash;
          const frames = Array.from({ length: enemyDuration }, (_, elapsed) =>
            spawnAnimationPresentation(enemyDuration - elapsed, enemyDuration)
          );
          const previous = {
            players: game.players,
            enemies: game.enemies,
            grid: game.grid,
            tick: game.tick,
            frameLow: game.frameLow,
            frameHigh: game.frameHigh,
            freezeTimer: game.freezeTimer,
            firePresses: Array.from(pendingFirePresses)
          };
          try {
            game.grid = makeGrid();
            game.freezeTimer = 0;
            game.enemies = [];
            const player = {
              kind: "player",
              id: 1,
              alive: true,
              respawn: 0,
              spawnFlash: playerDuration,
              invuln: 0,
              reload: 0
            };
            game.players = [player];
            game.tick = 2;
            game.frameLow = 2;
            game.frameHigh = 0;
            const beforeSkippedCadenceFrame = player.spawnFlash;
            updatePlayers();
            const afterSkippedCadenceFrame = player.spawnFlash;
            let playerDisplayFrames = 1;
            while (player.spawnFlash > 0 && playerDisplayFrames < 1000) {
              game.tick += 1;
              game.frameLow = (game.frameLow + 1) & 0xff;
              updatePlayers();
              playerDisplayFrames += 1;
            }

            const enemy = { kind: "enemy", id: 100, alive: true, spawnFlash: enemyDuration };
            game.enemies = [enemy];
            let enemyDisplayFrames = 0;
            while (enemy.spawnFlash > 0 && enemyDisplayFrames < 1000) {
              updateEnemies();
              enemyDisplayFrames += 1;
            }
            return {
              playerDuration,
              enemyDuration,
              playerDisplayFrames,
              enemyDisplayFrames,
              beforeSkippedCadenceFrame,
              afterSkippedCadenceFrame,
              lows: frames.map((frame) => frame.low),
              phases: frames.map((frame) => frame.phase),
              sizes: frames.map((frame) => frame.size)
            };
          } finally {
            game.players = previous.players;
            game.enemies = previous.enemies;
            game.grid = previous.grid;
            game.tick = previous.tick;
            game.frameLow = previous.frameLow;
            game.frameHigh = previous.frameHigh;
            game.freezeTimer = previous.freezeTimer;
            pendingFirePresses.clear();
            for (const code of previous.firePresses) pendingFirePresses.add(code);
          }
        },
      });
  }

  function createEnemySpawnOverlapDiagnostics(state, deps) {
    const scope = createRuntimeScope(state, deps);
    return Object.freeze({
      debugEnemySpawnOverlapProbe: createEnemySpawnOverlapProbe(scope)
    });
  }

  return Object.freeze({ createEnemyDiagnostics, createEnemySpawnOverlapDiagnostics });
});
