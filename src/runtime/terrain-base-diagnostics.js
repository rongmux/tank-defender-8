(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.terrainBaseDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /** Builds ordered base-wall, destruction, and render diagnostic probes. */
  function createTerrainBaseDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");

    const {
      BRICK,
      DOWN,
      RIGHT,
      TILE,
      baseDestructionDuration,
      baseDestructionPresentation,
      baseHitAudio,
      brickHitAudio,
      clamp,
      createPlayer,
      enemyTotal,
      game,
      gameSettings,
      hitBase,
      keys,
      makeGrid,
      movementAudio,
      pendingFirePresses,
      playerDestroyAudio,
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
      update
    } = scope;

    return Object.freeze({
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
      }
    });
  }

  return Object.freeze({ createTerrainBaseDiagnostics });
});
