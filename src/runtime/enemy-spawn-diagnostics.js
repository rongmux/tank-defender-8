(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.enemySpawnDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /** Builds the ordered enemy-spawn timing and animation diagnostic probes. */
  function createEnemySpawnDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");

    const {
      defaultEnemySpawnDelay,
      enemySpawnDelay,
      game,
      gameSettings,
      getEnemySpec,
      makeGrid,
      pendingFirePresses,
      scaleEnemySpawnDelayForPlayers,
      spawnAnimationPresentation,
      spawnEnemies,
      TILE,
      updateEnemies,
      updatePlayers
    } = scope;

    return Object.freeze({
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
      }
    });
  }

  /** Preserves the standalone spawn-overlap public diagnostic factory. */
  function createEnemySpawnOverlapDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");

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

    return Object.freeze({
      debugEnemySpawnOverlapProbe() {
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
      }
    });
  }

  return Object.freeze({
    createEnemySpawnDiagnostics,
    createEnemySpawnOverlapDiagnostics
  });
});
