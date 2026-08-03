(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.combatTankCollisionDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /** Builds tank-impact and player-spawn-lock diagnostic probes. */
  function createCombatTankCollisionDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");

    var LEFT = scope.LEFT;
    var RIGHT = scope.RIGHT;
    var TILE = scope.TILE;
    var UP = scope.UP;
    var applyPowerUp = scope.applyPowerUp;
    var enemyDestroyAudio = scope.enemyDestroyAudio;
    var enemyHitAudio = scope.enemyHitAudio;
    var enemyTypeDefinitions = scope.enemyTypeDefinitions;
    var game = scope.game;
    var gameSettings = scope.gameSettings;
    var hitTank = scope.hitTank;
    var keys = scope.keys;
    var makeGrid = scope.makeGrid;
    var pendingFirePresses = scope.pendingFirePresses;
    var playerDestroyAudio = scope.playerDestroyAudio;
    var stopEnemyDestroyAudio = scope.stopEnemyDestroyAudio;
    var stopEnemyHitAudio = scope.stopEnemyHitAudio;
    var stopPlayerDestroyAudio = scope.stopPlayerDestroyAudio;
    var syncEnemyDestroyAudioNodes = scope.syncEnemyDestroyAudioNodes;
    var syncEnemyHitAudioNodes = scope.syncEnemyHitAudioNodes;
    var syncMovementAudio = scope.syncMovementAudio;
    var syncPlayerDestroyAudioNodes = scope.syncPlayerDestroyAudioNodes;
    var updatePlayers = scope.updatePlayers;

    return Object.freeze({
      debugHelmetProtectionProbe() {
        var previousPlayerDestroy = { active: playerDestroyAudio.active, frame: playerDestroyAudio.frame };
        var previousPlayers = game.players;
        var previousExplosions = game.explosions;
        var previousScorePopups = game.scorePopups;
        var previousHighScore = game.highScore;
        var makePlayer = function () {
          return {
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
          };
        };
        var makeBullet = function () {
          return {
            x: 18,
            y: 18,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            dir: LEFT,
            ownerKind: "enemy",
            ownerId: 100,
            ownerKey: "enemy:100",
            remove: false
          };
        };

        try {
          stopPlayerDestroyAudio();
          game.explosions = [];
          game.scorePopups = [];
          var unprotectedPlayer = makePlayer();
          var unprotectedBullet = makeBullet();
          game.players = [unprotectedPlayer];
          hitTank(unprotectedBullet);

          var protectedPlayer = makePlayer();
          applyPowerUp(protectedPlayer, "helmet");
          var protectedBullet = makeBullet();
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
        var previousPlayerDestroy = { active: playerDestroyAudio.active, frame: playerDestroyAudio.frame };
        var previous = {
          players: game.players,
          explosions: game.explosions
        };
        var makePlayer = function (invuln) {
          return {
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
            invuln: invuln,
            stun: 0,
            level: 0
          };
        };
        var makeBullet = function (centerDx, centerDy) {
          return {
            x: 64 + 7 + centerDx - gameSettings().projectileRules.bulletSize / 2,
            y: 64 + 7 + centerDy - gameSettings().projectileRules.bulletSize / 2,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            ownerKind: "enemy",
            ownerId: 100,
            ownerKey: "enemy:100",
            remove: false
          };
        };
        var run = function (invuln, centerDx, centerDy) {
          var player = makePlayer(invuln);
          var bullet = makeBullet(centerDx, centerDy);
          game.players = [player];
          game.explosions = [];
          hitTank(bullet);
          var explosionDetails = game.explosions.map(function (explosion) {
            return {
              x: explosion.x,
              y: explosion.y,
              ttl: explosion.ttl,
              style: explosion.style
            };
          });
          return {
            bulletRemoved: bullet.remove,
            alive: player.alive,
            destroying: Boolean(player.destroying),
            respawn: player.respawn,
            explosions: explosionDetails.length,
            explosionDetails: explosionDetails
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
        var previousEnemyHit = { active: enemyHitAudio.active, frame: enemyHitAudio.frame };
        var previousEnemyDestroy = { active: enemyDestroyAudio.active, frame: enemyDestroyAudio.frame };
        var previousPlayerDestroy = { active: playerDestroyAudio.active, frame: playerDestroyAudio.frame };
        var previous = {
          players: game.players,
          enemies: game.enemies,
          enemyKilled: game.enemyKilled,
          explosions: game.explosions
        };
        var type = enemyTypeDefinitions()[0];
        var makeEnemy = function (spawnFlash, hp) {
          return {
            kind: "enemy",
            id: 100,
            x: 64,
            y: 64,
            w: 14,
            h: 14,
            alive: true,
            hp: hp,
            spawnFlash: spawnFlash,
            carrier: false,
            typeIndex: 0,
            score: type.score
          };
        };
        var makeBullet = function (centerDx, centerDy) {
          return {
            x: 64 + 7 + centerDx - gameSettings().projectileRules.bulletSize / 2,
            y: 64 + 7 + centerDy - gameSettings().projectileRules.bulletSize / 2,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            ownerKind: "player",
            ownerId: 1,
            ownerKey: "player:1",
            remove: false
          };
        };
        var run = function (spawnFlash, centerDx, centerDy, hp) {
          var enemy = makeEnemy(spawnFlash, hp === undefined ? 1 : hp);
          var bullet = makeBullet(centerDx, centerDy);
          game.players = [];
          game.enemies = [enemy];
          game.enemyKilled = 0;
          game.explosions = [];
          hitTank(bullet);
          var explosionDetails = game.explosions.map(function (explosion) {
            return {
              x: explosion.x,
              y: explosion.y,
              ttl: explosion.ttl,
              style: explosion.style
            };
          });
          return {
            bulletRemoved: bullet.remove,
            enemyAlive: enemy.alive,
            enemyDestroying: Boolean(enemy.destroying),
            enemyHp: enemy.hp,
            enemyKilled: game.enemyKilled,
            explosions: explosionDetails.length,
            explosionDetails: explosionDetails
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
        var previous = {
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
        var previousKeys = Array.from(keys);
        var previousFirePresses = Array.from(pendingFirePresses);
        var player = {
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

          var before = {
            x: player.x,
            y: player.y,
            dir: player.dir,
            spawnFlash: player.spawnFlash,
            invuln: player.invuln,
            bullets: game.bullets.length
          };
          updatePlayers();
          var locked = {
            x: player.x,
            y: player.y,
            dir: player.dir,
            spawnFlash: player.spawnFlash,
            invuln: player.invuln,
            bullets: game.bullets.length
          };
          var friendlyBullet = function () {
            return {
              x: player.x + 2,
              y: player.y + 2,
              w: gameSettings().projectileRules.bulletSize,
              h: gameSettings().projectileRules.bulletSize,
              dir: RIGHT,
              ownerKind: "player",
              ownerId: 2,
              ownerKey: "player:2",
              remove: false
            };
          };
          var enemyBullet = function () {
            return {
              x: player.x + 2,
              y: player.y + 2,
              w: gameSettings().projectileRules.bulletSize,
              h: gameSettings().projectileRules.bulletSize,
              dir: LEFT,
              ownerKind: "enemy",
              ownerId: 100,
              ownerKey: "enemy:100",
              remove: false
            };
          };
          var spawningFriendlyBullet = friendlyBullet();
          hitTank(spawningFriendlyBullet);
          var friendlyDuringSpawn = {
            stun: player.stun,
            bulletRemoved: spawningFriendlyBullet.remove
          };
          var spawningEnemyBullet = enemyBullet();
          hitTank(spawningEnemyBullet);
          var enemyDuringSpawn = {
            alive: player.alive,
            lives: player.lives,
            invuln: player.invuln,
            bulletRemoved: spawningEnemyBullet.remove
          };

          player.spawnFlash = 1;
          game.tick = 3;
          player.reload = 0;
          updatePlayers();
          var activated = {
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
          var released = {
            x: player.x,
            y: player.y,
            dir: player.dir,
            spawnFlash: player.spawnFlash,
            invuln: player.invuln,
            bullets: game.bullets.length
          };
          player.stun = 0;
          var activeFriendlyBullet = friendlyBullet();
          hitTank(activeFriendlyBullet);
          var protectedFriendlyAfterSpawn = {
            stun: player.stun,
            bulletRemoved: activeFriendlyBullet.remove
          };
          var postSpawnInvuln = player.invuln;
          player.invuln = 0;
          var unprotectedFriendlyBullet = friendlyBullet();
          hitTank(unprotectedFriendlyBullet);
          var friendlyAfterProtection = {
            stun: player.stun,
            bulletRemoved: unprotectedFriendlyBullet.remove
          };
          player.invuln = postSpawnInvuln;
          player.stun = 0;
          var activeEnemyBullet = enemyBullet();
          hitTank(activeEnemyBullet);
          var enemyAfterSpawn = {
            alive: player.alive,
            lives: player.lives,
            invuln: player.invuln,
            bulletRemoved: activeEnemyBullet.remove
          };

          return {
            duration: gameSettings().timings.playerSpawnFlash,
            before: before,
            locked: locked,
            activated: activated,
            released: released,
            friendlyDuringSpawn: friendlyDuringSpawn,
            protectedFriendlyAfterSpawn: protectedFriendlyAfterSpawn,
            friendlyAfterProtection: friendlyAfterProtection,
            enemyDuringSpawn: enemyDuringSpawn,
            enemyAfterSpawn: enemyAfterSpawn,
            friendlyFireStunFrames: gameSettings().friendlyFire.enabled ? gameSettings().friendlyFire.stunFrames : 0
          };
        } finally {
          keys.clear();
          for (var i = 0; i < previousKeys.length; i += 1) keys.add(previousKeys[i]);
          pendingFirePresses.clear();
          for (var j = 0; j < previousFirePresses.length; j += 1) pendingFirePresses.add(previousFirePresses[j]);
          Object.assign(game, previous);
        }
      }
    });
  }

  return Object.freeze({
    createCombatTankCollisionDiagnostics: createCombatTankCollisionDiagnostics
  });
});
