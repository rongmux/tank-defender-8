(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.combatDiagnostics = api;
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

  /**
   * Resolves dependency callbacks before state adapters so diagnostics preserve legacy receivers.
   * Live audio records remain references because each probe must restore their mutable frames.
   */
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
      enemyDestroyAudio: state.audio.enemyDestroy,
      enemyHitAudio: state.audio.enemyHit,
      playerDestroyAudio: state.audio.playerDestroy,
      playerShootAudio: state.audio.playerShoot,
      steelHitAudio: state.audio.steelHit
    };
  }

  /** Binds shield, projectile, firing, and friendly-fire probes. */
  function createCombatDiagnostics(state, deps) {
    const scope = createRuntimeScope(state, deps);
    const {
      LEFT,
      RIGHT,
      TILE,
      UP,
      applyPowerUp,
      createCombatCrossingDiagnostics,
      createCombatFireLimitDiagnostics,
      createCombatProjectileDiagnostics,
      createPlayer,
      enemyDestroyAudio,
      enemyHitAudio,
      enemyTypeDefinitions,
      game,
      gameSettings,
      hitTank,
      keys,
      makeGrid,
      pendingFirePresses,
      playerDestroyAudio,
      playerShootAudio,
      shoot,
      stopEnemyDestroyAudio,
      stopEnemyHitAudio,
      stopPlayerDestroyAudio,
      stopPlayerShootAudio,
      syncEnemyDestroyAudioNodes,
      syncEnemyHitAudioNodes,
      syncMovementAudio,
      syncMovementIceAudioNodes,
      syncPlayerDestroyAudioNodes,
      syncPlayerShootAudioNodes,
      updateBullets,
      updatePlayers
    } = scope;

    return Object.freeze({
        debugHelmetProtectionProbe() {
          const previousPlayerDestroy = { active: playerDestroyAudio.active, frame: playerDestroyAudio.frame };
          const previousPlayers = game.players;
          const previousExplosions = game.explosions;
          const previousScorePopups = game.scorePopups;
          const previousHighScore = game.highScore;
          const makePlayer = () => ({
            id: 1,
            kind: "player",
            x: 16,
            y: 16,
            w: 14,
            h: 14,
            alive: true,
            invuln: 0,
            lives: 2,
            respawn: 0,
            level: 0,
            score: 0,
            stagePoints: 0,
            stageKills: Array(enemyTypeDefinitions().length).fill(0),
            totalKills: Array(enemyTypeDefinitions().length).fill(0),
            nextBonusLifeIndex: 0
          });
          const makeBullet = () => ({
            x: 18,
            y: 18,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            dir: LEFT,
            ownerKind: "enemy",
            ownerId: 100,
            ownerKey: "enemy:100",
            remove: false
          });

          try {
            stopPlayerDestroyAudio();
            game.explosions = [];
            game.scorePopups = [];
            const unprotectedPlayer = makePlayer();
            const unprotectedBullet = makeBullet();
            game.players = [unprotectedPlayer];
            hitTank(unprotectedBullet);

            const protectedPlayer = makePlayer();
            applyPowerUp(protectedPlayer, "helmet");
            const protectedBullet = makeBullet();
            game.players = [protectedPlayer];
            hitTank(protectedBullet);

            return {
              duration: gameSettings().powerUpDurations.helmet,
              pickupScore: gameSettings().powerUpRules.pickupScore,
              unprotected: {
                alive: unprotectedPlayer.alive,
                lives: unprotectedPlayer.lives,
                bulletRemoved: unprotectedBullet.remove
              },
              protected: {
                alive: protectedPlayer.alive,
                lives: protectedPlayer.lives,
                invuln: protectedPlayer.invuln,
                score: protectedPlayer.score,
                bulletRemoved: protectedBullet.remove,
                explosions: game.explosions.length
              }
            };
          } finally {
            stopPlayerDestroyAudio();
            game.players = previousPlayers;
            game.explosions = previousExplosions;
            game.scorePopups = previousScorePopups;
            game.highScore = previousHighScore;
            playerDestroyAudio.active = previousPlayerDestroy.active;
            playerDestroyAudio.frame = previousPlayerDestroy.frame;
            syncPlayerDestroyAudioNodes();
            syncEnemyDestroyAudioNodes();
          }
        },
        debugEnemyBulletPlayerCollisionProbe() {
          const previousPlayerDestroy = { active: playerDestroyAudio.active, frame: playerDestroyAudio.frame };
          const previous = {
            players: game.players,
            explosions: game.explosions
          };
          const makePlayer = (invuln) => ({
            kind: "player",
            id: 1,
            x: 64,
            y: 64,
            w: 14,
            h: 14,
            alive: true,
            lives: 2,
            respawn: 0,
            spawnFlash: 0,
            invuln,
            stun: 0,
            level: 0
          });
          const makeBullet = (centerDx, centerDy) => ({
            x: 64 + 7 + centerDx - gameSettings().projectileRules.bulletSize / 2,
            y: 64 + 7 + centerDy - gameSettings().projectileRules.bulletSize / 2,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            ownerKind: "enemy",
            ownerId: 100,
            ownerKey: "enemy:100",
            remove: false
          });
          const run = (invuln, centerDx, centerDy) => {
            const player = makePlayer(invuln);
            const bullet = makeBullet(centerDx, centerDy);
            game.players = [player];
            game.explosions = [];
            hitTank(bullet);
            const explosionDetails = game.explosions.map((explosion) => ({
              x: explosion.x,
              y: explosion.y,
              ttl: explosion.ttl,
              style: explosion.style
            }));
            return {
              bulletRemoved: bullet.remove,
              alive: player.alive,
              destroying: Boolean(player.destroying),
              respawn: player.respawn,
              explosions: explosionDetails.length,
              explosionDetails
            };
          };
          try {
            stopPlayerDestroyAudio();
            return {
              protected: run(1, 0, 0),
              positiveNine: run(0, 9, 9),
              negativeNine: run(0, -9, -9),
              positiveTen: run(0, 10, 0),
              negativeTen: run(0, -10, 0)
            };
          } finally {
            stopPlayerDestroyAudio();
            Object.assign(game, previous);
            playerDestroyAudio.active = previousPlayerDestroy.active;
            playerDestroyAudio.frame = previousPlayerDestroy.frame;
            syncPlayerDestroyAudioNodes();
            syncEnemyDestroyAudioNodes();
          }
        },
        debugPlayerBulletEnemyCollisionProbe() {
          const previousEnemyHit = { active: enemyHitAudio.active, frame: enemyHitAudio.frame };
          const previousEnemyDestroy = { active: enemyDestroyAudio.active, frame: enemyDestroyAudio.frame };
          const previousPlayerDestroy = { active: playerDestroyAudio.active, frame: playerDestroyAudio.frame };
          const previous = {
            players: game.players,
            enemies: game.enemies,
            enemyKilled: game.enemyKilled,
            explosions: game.explosions
          };
          const type = enemyTypeDefinitions()[0];
          const makeEnemy = (spawnFlash, hp) => ({
            kind: "enemy",
            id: 100,
            x: 64,
            y: 64,
            w: 14,
            h: 14,
            alive: true,
            hp,
            spawnFlash,
            carrier: false,
            typeIndex: 0,
            score: type.score
          });
          const makeBullet = (centerDx, centerDy) => ({
            x: 64 + 7 + centerDx - gameSettings().projectileRules.bulletSize / 2,
            y: 64 + 7 + centerDy - gameSettings().projectileRules.bulletSize / 2,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            ownerKind: "player",
            ownerId: 1,
            ownerKey: "player:1",
            remove: false
          });
          const run = (spawnFlash, centerDx, centerDy, hp) => {
            const enemy = makeEnemy(spawnFlash, hp === undefined ? 1 : hp);
            const bullet = makeBullet(centerDx, centerDy);
            game.players = [];
            game.enemies = [enemy];
            game.enemyKilled = 0;
            game.explosions = [];
            hitTank(bullet);
            const explosionDetails = game.explosions.map((explosion) => ({
              x: explosion.x,
              y: explosion.y,
              ttl: explosion.ttl,
              style: explosion.style
            }));
            return {
              bulletRemoved: bullet.remove,
              enemyAlive: enemy.alive,
              enemyDestroying: Boolean(enemy.destroying),
              enemyHp: enemy.hp,
              enemyKilled: game.enemyKilled,
              explosions: explosionDetails.length,
              explosionDetails
            };
          };
          try {
            stopEnemyHitAudio();
            stopEnemyDestroyAudio();
            stopPlayerDestroyAudio();
            return {
              positiveNine: run(0, 9, 9),
              negativeNine: run(0, -9, -9),
              positiveTen: run(0, 10, 0),
              negativeTen: run(0, -10, 0),
              spawning: run(12, 0, 0),
              armored: run(0, 9, 9, 2)
            };
          } finally {
            stopEnemyHitAudio();
            stopEnemyDestroyAudio();
            stopPlayerDestroyAudio();
            Object.assign(game, previous);
            enemyHitAudio.active = previousEnemyHit.active;
            enemyHitAudio.frame = previousEnemyHit.frame;
            enemyDestroyAudio.active = previousEnemyDestroy.active;
            enemyDestroyAudio.frame = previousEnemyDestroy.frame;
            playerDestroyAudio.active = previousPlayerDestroy.active;
            playerDestroyAudio.frame = previousPlayerDestroy.frame;
            syncEnemyHitAudioNodes();
            syncEnemyDestroyAudioNodes();
            syncPlayerDestroyAudioNodes();
            syncMovementAudio();
          }
        },
        debugPlayerSpawnLockProbe() {
          const previous = {
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            bullets: game.bullets,
            explosions: game.explosions,
            powerUp: game.powerUp,
            highScore: game.highScore,
            tick: game.tick
          };
          const previousKeys = Array.from(keys);
          const previousFirePresses = Array.from(pendingFirePresses);
          const player = {
            kind: "player",
            id: 1,
            x: 64,
            y: 64,
            w: 14,
            h: 14,
            dir: UP,
            speed: gameSettings().playerMovement.speed,
            alive: true,
            lives: 3,
            nextBonusLifeIndex: 0,
            respawn: 0,
            spawnFlash: gameSettings().timings.playerSpawnFlash,
            invuln: 0,
            stun: 0,
            pendingSnap: false,
            level: 0,
            reload: 0,
            score: 0,
            stagePoints: 0,
            stageKills: Array(enemyTypeDefinitions().length).fill(0),
            totalKills: Array(enemyTypeDefinitions().length).fill(0),
            slide: 0,
            color: "#e3c64e",
            accent: "#fff0a8"
          };

          try {
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [player];
            game.enemies = [];
            game.bullets = [];
            game.explosions = [];
            game.powerUp = null;
            game.tick = 1;
            keys.clear();
            keys.add("ArrowRight");
            keys.add("Space");
            pendingFirePresses.clear();
            pendingFirePresses.add("Space");

            const before = {
              x: player.x,
              y: player.y,
              dir: player.dir,
              spawnFlash: player.spawnFlash,
              invuln: player.invuln,
              bullets: game.bullets.length
            };
            updatePlayers();
            const locked = {
              x: player.x,
              y: player.y,
              dir: player.dir,
              spawnFlash: player.spawnFlash,
              invuln: player.invuln,
              bullets: game.bullets.length
            };
            const friendlyBullet = () => ({
              x: player.x + 2,
              y: player.y + 2,
              w: gameSettings().projectileRules.bulletSize,
              h: gameSettings().projectileRules.bulletSize,
              dir: RIGHT,
              ownerKind: "player",
              ownerId: 2,
              ownerKey: "player:2",
              remove: false
            });
            const enemyBullet = () => ({
              x: player.x + 2,
              y: player.y + 2,
              w: gameSettings().projectileRules.bulletSize,
              h: gameSettings().projectileRules.bulletSize,
              dir: LEFT,
              ownerKind: "enemy",
              ownerId: 100,
              ownerKey: "enemy:100",
              remove: false
            });
            const spawningFriendlyBullet = friendlyBullet();
            hitTank(spawningFriendlyBullet);
            const friendlyDuringSpawn = {
              stun: player.stun,
              bulletRemoved: spawningFriendlyBullet.remove
            };
            const spawningEnemyBullet = enemyBullet();
            hitTank(spawningEnemyBullet);
            const enemyDuringSpawn = {
              alive: player.alive,
              lives: player.lives,
              invuln: player.invuln,
              bulletRemoved: spawningEnemyBullet.remove
            };

            player.spawnFlash = 1;
            game.tick = 3;
            player.reload = 0;
            updatePlayers();
            const activated = {
              x: player.x,
              y: player.y,
              dir: player.dir,
              spawnFlash: player.spawnFlash,
              invuln: player.invuln,
              bullets: game.bullets.length
            };
            game.tick = 4;
            pendingFirePresses.add("Space");
            updatePlayers();
            const released = {
              x: player.x,
              y: player.y,
              dir: player.dir,
              spawnFlash: player.spawnFlash,
              invuln: player.invuln,
              bullets: game.bullets.length
            };
            player.stun = 0;
            const activeFriendlyBullet = friendlyBullet();
            hitTank(activeFriendlyBullet);
            const protectedFriendlyAfterSpawn = {
              stun: player.stun,
              bulletRemoved: activeFriendlyBullet.remove
            };
            const postSpawnInvuln = player.invuln;
            player.invuln = 0;
            const unprotectedFriendlyBullet = friendlyBullet();
            hitTank(unprotectedFriendlyBullet);
            const friendlyAfterProtection = {
              stun: player.stun,
              bulletRemoved: unprotectedFriendlyBullet.remove
            };
            player.invuln = postSpawnInvuln;
            player.stun = 0;
            const activeEnemyBullet = enemyBullet();
            hitTank(activeEnemyBullet);
            const enemyAfterSpawn = {
              alive: player.alive,
              lives: player.lives,
              invuln: player.invuln,
              bulletRemoved: activeEnemyBullet.remove
            };

            return {
              duration: gameSettings().timings.playerSpawnFlash,
              before,
              locked,
              activated,
              released,
              friendlyDuringSpawn,
              protectedFriendlyAfterSpawn,
              friendlyAfterProtection,
              enemyDuringSpawn,
              enemyAfterSpawn,
              friendlyFireStunFrames: gameSettings().friendlyFire.enabled ? gameSettings().friendlyFire.stunFrames : 0
            };
          } finally {
            keys.clear();
            for (const key of previousKeys) keys.add(key);
            pendingFirePresses.clear();
            for (const key of previousFirePresses) pendingFirePresses.add(key);
            Object.assign(game, previous);
          }
        },
        ...createCombatFireLimitDiagnostics(scope),
        debugPlayerFireInputProbe() {
          const previous = {
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            bullets: game.bullets,
            explosions: game.explosions,
            powerUp: game.powerUp,
            playerCount: game.playerCount,
            tick: game.tick
          };
          const previousKeys = Array.from(keys);
          const previousFirePresses = Array.from(pendingFirePresses);
          const previousPlayerShoot = { active: playerShootAudio.active, frame: playerShootAudio.frame };
          const player = createPlayer(1);
          const bulletCount = () => game.bullets.filter((bullet) => bullet.ownerKey === "player:1").length;
          const updateWithPress = () => {
            pendingFirePresses.add("Space");
            game.tick += 1;
            updatePlayers();
            return bulletCount();
          };
          const updateWithoutPress = () => {
            game.tick += 1;
            updatePlayers();
            return bulletCount();
          };

          try {
            stopPlayerShootAudio();
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [player];
            game.enemies = [];
            game.bullets = [];
            game.explosions = [];
            game.powerUp = null;
            game.playerCount = 1;
            game.tick = 0;
            keys.clear();
            keys.add("Space");
            pendingFirePresses.clear();
            player.x = 64;
            player.y = 64;
            player.spawnX = 64;
            player.spawnY = 64;
            player.alive = true;
            player.respawn = 0;
            player.spawnFlash = 0;
            player.reload = 0;
            player.stun = 0;
            player.level = 0;

            const firstPress = updateWithPress();
            game.bullets = [];
            player.reload = 0;
            const heldAfterBulletClears = updateWithoutPress();
            const repressAfterRelease = updateWithPress();

            player.reload = 0;
            const fullSlotPress = updateWithPress();
            game.bullets = [];
            player.reload = 0;
            const fullSlotPressAfterClear = updateWithoutPress();
            const fullSlotRepress = updateWithPress();

            game.bullets = [];
            player.level = 2;
            player.reload = 0;
            const doubleShotCounts = [updateWithPress(), updateWithPress(), updateWithPress()];

            game.bullets = [];
            player.level = 0;
            player.reload = 0;
            player.spawnFlash = 2;
            const spawnPress = updateWithPress();
            player.spawnFlash = 0;
            const spawnPressAfterUnlock = updateWithoutPress();

            player.stun = 10;
            player.reload = 0;
            const stunnedPress = updateWithPress();

            return {
              firstPress,
              heldAfterBulletClears,
              repressAfterRelease,
              fullSlotPress,
              fullSlotPressAfterClear,
              fullSlotRepress,
              doubleShotCounts,
              spawnPress,
              spawnPressAfterUnlock,
              stunnedPress
            };
          } finally {
            stopPlayerShootAudio();
            keys.clear();
            for (const key of previousKeys) keys.add(key);
            pendingFirePresses.clear();
            for (const key of previousFirePresses) pendingFirePresses.add(key);
            Object.assign(game, previous);
            playerShootAudio.active = previousPlayerShoot.active;
            playerShootAudio.frame = previousPlayerShoot.frame;
            syncPlayerShootAudioNodes();
            syncMovementIceAudioNodes();
          }
        },
        ...createCombatCrossingDiagnostics(scope),
        ...createCombatProjectileDiagnostics(scope)
    });
  }

  return Object.freeze({ createCombatDiagnostics });
});
