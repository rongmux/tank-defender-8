(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.terrainDiagnostics = api;
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
    if (!state.keys || typeof state.keys !== "object") {
      throw new Error("state.keys must be an object");
    }
    if (!state.pendingFirePresses || typeof state.pendingFirePresses !== "object") {
      throw new Error("state.pendingFirePresses must be an object");
    }
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
      keys: state.keys,
      pendingFirePresses: state.pendingFirePresses,
      movementAudio: state.movementAudio,
      baseHitAudio: state.audio.baseHit,
      brickHitAudio: state.audio.brickHit,
      playerDestroyAudio: state.audio.playerDestroy
    };
  }

  /** Binds terrain, base-defense, and tank-overlap probes. */
  function createTerrainDiagnostics(state, deps) {
    const scope = createRuntimeScope(state, deps);
    const {
      BRICK,
      DOWN,
      FOREST,
      ICE,
      RIGHT,
      TILE,
      WATER,
      baseDestructionDuration,
      baseDestructionPresentation,
      baseHitAudio,
      brickHitAudio,
      canTankOccupy,
      clamp,
      createPlayer,
      enemyTotal,
      game,
      gameSettings,
      hitBase,
      keys,
      makeGrid,
      movementAudio,
      moveTank,
      pendingFirePresses,
      playerDestroyAudio,
      rectOverlapArea,
      renderGame,
      resolveBullet,
      setTile,
      stopBaseHitAudio,
      stopBrickHitAudio,
      stopMovementAudio,
      stopPlayerDestroyAudio,
      syncBaseHitAudioNodes,
      syncBrickHitAudioNodes,
      syncEnemyDestroyAudioNodes,
      syncMovementAudio,
      syncPlayerDestroyAudioNodes,
      togglePause,
      update,
      updateEnemyMovement
    } = scope;

    return Object.freeze({
        debugTerrainCollisionProbe() {
          const previous = {
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            explosions: game.explosions
          };
          const types = [
            ["water", WATER],
            ["forest", FOREST],
            ["ice", ICE]
          ];
          const result = {};

          try {
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [];
            game.enemies = [];
            game.explosions = [];

            for (const [name, type] of types) {
              const grid = makeGrid();
              setTile(grid, 6, 6, type, 0);
              game.grid = grid;
              const tank = { kind: "player", x: 6 * TILE + 1, y: 6 * TILE + 1, w: 14, h: 14, alive: true };
              const bullet = {
                x: 6 * TILE + 6,
                y: 6 * TILE + 6,
                w: gameSettings().projectileRules.bulletSize,
                h: gameSettings().projectileRules.bulletSize,
                dir: RIGHT,
                power: 1,
                ownerKind: "player",
                ownerId: 1,
                ownerKey: "player:1",
                remove: false
              };
              resolveBullet(bullet);
              result[name] = {
                tankCanOccupy: canTankOccupy(tank, tank.x, tank.y),
                bulletRemoved: bullet.remove
              };
            }
          } finally {
            Object.assign(game, previous);
          }

          return result;
        },
        debugBaseWallPriorityProbe() {
          const previousBrickHit = { active: brickHitAudio.active, frame: brickHitAudio.frame };
          const previousBaseHit = { active: baseHitAudio.active, frame: baseHitAudio.frame };
          const previousPlayerDestroy = { active: playerDestroyAudio.active, frame: playerDestroyAudio.frame };
          const previous = {
            screen: game.screen,
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            explosions: game.explosions,
            baseDestroyTimer: game.baseDestroyTimer,
            gameOverTimer: game.gameOverTimer
          };
          const makeBaseBullet = () => ({
            x: 6 * TILE + 6,
            y: 12 * TILE - 2,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            dir: DOWN,
            power: 1,
            ownerKind: "player",
            ownerId: 1,
            ownerKey: "player:1",
            remove: false
          });
          try {
            stopBrickHitAudio();
            stopBaseHitAudio();
            stopPlayerDestroyAudio();
            game.screen = "playing";
            game.players = [];
            game.enemies = [];
            game.explosions = [];
            game.baseDestroyTimer = 0;

            game.grid = makeGrid();
            setTile(game.grid, 6, 11, BRICK);
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            const shieldedBullet = makeBaseBullet();
            resolveBullet(shieldedBullet);
            const shielded = {
              baseAlive: game.base.alive,
              bulletRemoved: shieldedBullet.remove,
              topWallMask: game.grid[11][6].mask,
              screen: game.screen,
              baseDestroyTimer: game.baseDestroyTimer,
              explosions: game.explosions.map(({ x, y, ttl, style }) => ({ x, y, ttl, style }))
            };

            game.screen = "playing";
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.explosions = [];
            game.baseDestroyTimer = 0;
            const exposedBullet = makeBaseBullet();
            resolveBullet(exposedBullet);
            const exposed = {
              baseAlive: game.base.alive,
              bulletRemoved: exposedBullet.remove,
              screen: game.screen,
              baseDestroyTimer: game.baseDestroyTimer,
              presentation: baseDestructionPresentation(game.baseDestroyTimer),
              explosions: game.explosions.map(({ x, y, ttl, style }) => ({ x, y, ttl, style }))
            };

            return { shielded, exposed };
          } finally {
            stopBrickHitAudio();
            stopBaseHitAudio();
            stopPlayerDestroyAudio();
            Object.assign(game, previous);
            brickHitAudio.active = previousBrickHit.active;
            brickHitAudio.frame = previousBrickHit.frame;
            baseHitAudio.active = previousBaseHit.active;
            baseHitAudio.frame = previousBaseHit.frame;
            playerDestroyAudio.active = previousPlayerDestroy.active;
            playerDestroyAudio.frame = previousPlayerDestroy.frame;
            syncBrickHitAudioNodes();
            syncBaseHitAudioNodes();
            syncPlayerDestroyAudioNodes();
            syncEnemyDestroyAudioNodes();
            syncMovementAudio();
          }
        },
        debugBaseDestructionSequenceProbe() {
          const previous = { ...game };
          const previousFirePresses = new Set(pendingFirePresses);
          const rightWasHeld = keys.has("ArrowRight");
          const previousBaseHit = { active: baseHitAudio.active, frame: baseHitAudio.frame };
          const previousPlayerDestroy = { active: playerDestroyAudio.active, frame: playerDestroyAudio.frame };
          const player = createPlayer(1);
          const spawningEnemy = { alive: true, spawnFlash: 40 };
          const fieldBullet = {
            x: 32,
            y: 120,
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
          const baseBullet = {
            x: 6 * TILE + 5,
            y: 12 * TILE + 5,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            dir: DOWN,
            speed: 0,
            power: 1,
            ownerKind: "enemy",
            ownerId: 101,
            ownerKey: "enemy:101",
            remove: false
          };
          try {
            stopMovementAudio();
            stopBaseHitAudio();
            stopPlayerDestroyAudio();
            player.x = 48;
            player.y = 48;
            player.spawnFlash = 0;
            player.invuln = 0;
            player.reload = 0;
            game.screen = "playing";
            game.demoMode = false;
            game.paused = false;
            game.playerCount = 1;
            game.tick = 0;
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [player];
            game.enemies = [spawningEnemy];
            game.bullets = [fieldBullet];
            game.explosions = [];
            game.scorePopups = [];
            game.powerUp = null;
            game.enemySpawned = enemyTotal();
            game.enemyKilled = 0;
            game.nextSpawn = 0;
            game.clearPendingTimer = 0;
            game.baseDestroyTimer = 0;
            game.gameOverTimer = 0;
            game.freezeTimer = 0;
            game.shovelTimer = 0;

            const hit = hitBase(baseBullet);
            const entry = {
              hit,
              screen: game.screen,
              timer: game.baseDestroyTimer,
              duration: baseDestructionDuration(),
              baseAlive: game.base.alive,
              bulletRemoved: baseBullet.remove,
              explosionCount: game.explosions.length,
              presentation: baseDestructionPresentation(game.baseDestroyTimer)
            };
            const pauseAccepted = togglePause();
            keys.add("ArrowRight");
            pendingFirePresses.add("Space");
            const playerStartX = player.x;
            const bulletStartX = fieldBullet.x;
            const enemyStartFlash = spawningEnemy.spawnFlash;
            const frames = [];
            for (let frame = 1; frame <= entry.duration; frame += 1) {
              update();
              const presentation = baseDestructionPresentation(game.baseDestroyTimer);
              frames.push({
                frame,
                timer: game.baseDestroyTimer,
                screen: game.screen,
                phase: presentation ? presentation.phase : 0,
                size: presentation ? presentation.size : 0,
                width: presentation ? presentation.width : 0,
                height: presentation ? presentation.height : 0,
                frameName: presentation ? presentation.frameName : null,
                movementAudioMode: movementAudio.mode
              });
            }
            return {
              entry,
              pauseAccepted,
              playerStartX,
              playerEndX: player.x,
              bulletStartX,
              bulletEndX: fieldBullet.x,
              enemyStartFlash,
              enemyEndFlash: spawningEnemy.spawnFlash,
              playerBulletCount: game.bullets.filter((bullet) => bullet.ownerKind === "player").length,
              gameOverTimer: game.gameOverTimer,
              frames
            };
          } finally {
            stopBaseHitAudio();
            stopPlayerDestroyAudio();
            Object.assign(game, previous);
            baseHitAudio.active = previousBaseHit.active;
            baseHitAudio.frame = previousBaseHit.frame;
            playerDestroyAudio.active = previousPlayerDestroy.active;
            playerDestroyAudio.frame = previousPlayerDestroy.frame;
            pendingFirePresses.clear();
            for (const code of previousFirePresses) pendingFirePresses.add(code);
            if (!rightWasHeld) keys.delete("ArrowRight");
            syncBaseHitAudioNodes();
            syncPlayerDestroyAudioNodes();
            syncMovementAudio();
          }
        },
        debugRenderBaseDestructionFrame(timer) {
          const previous = { ...game };
          try {
            game.screen = "playing";
            game.playerCount = 1;
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: false };
            game.players = [];
            game.enemies = [];
            game.bullets = [];
            game.explosions = [];
            game.scorePopups = [];
            game.powerUp = null;
            game.baseDestroyTimer = clamp(Math.floor(Number(timer) || 0), 0, baseDestructionDuration());
            renderGame();
            return baseDestructionPresentation(game.baseDestroyTimer);
          } finally {
            Object.assign(game, previous);
          }
        },
        debugTankCollisionProbe() {
          const previous = {
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies
          };
          const player = { kind: "player", id: 1, x: 32, y: 32, w: 14, h: 14, alive: true, respawn: 0 };
          const teammate = { kind: "player", id: 2, x: 46, y: 32, w: 14, h: 14, alive: true, respawn: 0 };
          const enemy = { kind: "enemy", id: 100, x: 46, y: 32, w: 14, h: 14, alive: true, respawn: 0 };
          try {
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };

            game.players = [player];
            game.enemies = [enemy];
            const enemyBlocks = !canTankOccupy(player, player.x + 1, player.y);
            const movingAwayFromEnemyAllowed = moveTank(player, -1, 0);

            player.x = 32;
            player.y = 32;
            game.players = [player, teammate];
            game.enemies = [];
            const teammateBlocks = !canTankOccupy(player, player.x + 1, player.y);

            return {
              enemyBlocks,
              teammateBlocks,
              movingAwayFromEnemyAllowed,
              finalX: player.x
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugEnemyOverlapRecoveryProbe() {
          const previous = {
            tick: game.tick,
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies
          };
          const makeEnemy = (id, x) => ({
            kind: "enemy",
            id,
            slotIndex: id - 98,
            x,
            y: 32,
            w: 14,
            h: 14,
            dir: RIGHT,
            speed: 1,
            alternateMovement: false,
            blockedPauseTicks: 2,
            pendingTurn: true,
            alive: true,
            respawn: 0,
            spawnFlash: 0
          });
          try {
            game.tick = 0;
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [];
            const blocker = makeEnemy(100, 32);
            const recovering = makeEnemy(101, 40);
            game.enemies = [blocker, recovering];
            const startOverlapArea = rectOverlapArea(blocker, recovering);
            updateEnemyMovement(recovering, () => 0);
            const firstTick = {
              x: recovering.x,
              dir: recovering.dir,
              overlapArea: rectOverlapArea(blocker, recovering),
              blockedPauseTicks: recovering.blockedPauseTicks,
              pendingTurn: recovering.pendingTurn
            };
            for (let tick = 1; tick < 6; tick += 1) updateEnemyMovement(recovering, () => 0);
            const finalOverlapArea = rectOverlapArea(blocker, recovering);
            const contactMoveBlocked = !canTankOccupy(recovering, recovering.x - 1, recovering.y);
            return {
              startOverlapArea,
              firstTick,
              finalX: recovering.x,
              finalOverlapArea,
              contactMoveBlocked
            };
          } finally {
            Object.assign(game, previous);
          }
        },
    });
  }

  return Object.freeze({ createTerrainDiagnostics });
});
