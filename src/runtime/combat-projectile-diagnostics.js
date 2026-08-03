(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.combatProjectileDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function requireScope(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");
  }

  /** Builds projectile-boundary, terrain-sound, and friendly-fire diagnostic probes. */
  function createCombatProjectileDiagnostics(scope) {
    requireScope(scope);

    var FIELD_H = scope.FIELD_H;
    var FIELD_W = scope.FIELD_W;
    var LEFT = scope.LEFT;
    var RIGHT = scope.RIGHT;
    var UP = scope.UP;
    var createBullet = scope.createBullet;
    var game = scope.game;
    var gameSettings = scope.gameSettings;
    var hitTank = scope.hitTank;
    var playerUpgradeRule = scope.playerUpgradeRule;
    var resolveBullet = scope.resolveBullet;
    var steelHitAudio = scope.steelHitAudio;
    var stopSteelHitAudio = scope.stopSteelHitAudio;
    var syncMovementAudio = scope.syncMovementAudio;
    var syncSteelHitAudioNodes = scope.syncSteelHitAudioNodes;
    var wallHitSoundName = scope.wallHitSoundName;

    return Object.freeze({
      debugProjectileRuleProbe() {
        var bullet = createBullet(
          { kind: "player", id: 1, x: 16, y: 16, w: 14, h: 14, dir: RIGHT, bulletSpeed: 2.25, bulletPower: 1 },
          "player:1",
          playerUpgradeRule(0)
        );
        return {
          x: bullet.x,
          y: bullet.y,
          w: bullet.w,
          h: bullet.h,
          speed: bullet.speed,
          power: bullet.power,
          spawnOffset: gameSettings().projectileRules.spawnOffset,
          boundsPadding: gameSettings().projectileRules.boundsPadding
        };
      },
      debugFieldBoundaryBulletProbe() {
        var previousBullets = game.bullets;
        var previousExplosions = game.explosions;
        var previousSteelHit = { active: steelHitAudio.active, frame: steelHitAudio.frame };
        var rules = gameSettings().projectileRules;
        var makeBullet = function (x, y, ownerKind) {
          return {
            x: x,
            y: y,
            w: rules.bulletSize,
            h: rules.bulletSize,
            dir: UP,
            speed: 0,
            power: 1,
            ownerKind: ownerKind,
            ownerId: 1,
            ownerKey: ownerKind + ":1",
            remove: false
          };
        };
        var cases = [
          ["left", -rules.boundsPadding - 1, FIELD_H / 2],
          ["right", FIELD_W + rules.boundsPadding + 1, FIELD_H / 2],
          ["top", FIELD_W / 2, -rules.boundsPadding - 1],
          ["bottom", FIELD_W / 2, FIELD_H + rules.boundsPadding + 1]
        ];
        try {
          stopSteelHitAudio();
          return ["player", "enemy"].flatMap(function (ownerKind) {
            return cases.map(function (entry) {
              var edge = entry[0];
              var x = entry[1];
              var y = entry[2];
              var bullet = makeBullet(x, y, ownerKind);
              game.bullets = [bullet];
              game.explosions = [];
              resolveBullet(bullet);
              var explosion = game.explosions[0] || null;
              return {
                edge: edge,
                ownerKind: ownerKind,
                removed: bullet.remove,
                explosionCount: game.explosions.length,
                explosion: explosion ? { x: explosion.x, y: explosion.y, ttl: explosion.ttl } : null,
                sound: wallHitSoundName(bullet, true, false)
              };
            });
          });
        } finally {
          stopSteelHitAudio();
          game.bullets = previousBullets;
          game.explosions = previousExplosions;
          steelHitAudio.active = previousSteelHit.active;
          steelHitAudio.frame = previousSteelHit.frame;
          syncSteelHitAudioNodes();
          syncMovementAudio();
        }
      },
      debugTerrainHitSoundProbe() {
        var impacts = [
          { terrain: "brick", wasSteel: false, damaged: true },
          { terrain: "steelBlocked", wasSteel: true, damaged: false },
          { terrain: "steelDestroyed", wasSteel: true, damaged: true }
        ];
        return ["player", "enemy"].flatMap(function (ownerKind) {
          return impacts.map(function (impact) {
            return {
              ownerKind: ownerKind,
              terrain: impact.terrain,
              sound: wallHitSoundName({ ownerKind: ownerKind }, impact.wasSteel, impact.damaged)
            };
          });
        });
      },
      debugFriendlyFireProbe() {
        return {
          enabled: gameSettings().friendlyFire.enabled,
          stunFrames: gameSettings().friendlyFire.enabled ? gameSettings().friendlyFire.stunFrames : 0
        };
      },
      debugFriendlyFireProtectionProbe() {
        var previous = {
          players: game.players,
          enemies: game.enemies,
          explosions: game.explosions
        };
        var makeTarget = function (invuln) {
          return {
            kind: "player",
            id: 1,
            x: 64,
            y: 64,
            w: 14,
            h: 14,
            alive: true,
            spawnFlash: 0,
            invuln: invuln,
            stun: 0
          };
        };
        var makeBullet = function (centerDx, centerDy) {
          return {
            x: 64 + 7 + centerDx - gameSettings().projectileRules.bulletSize / 2,
            y: 64 + 7 + centerDy - gameSettings().projectileRules.bulletSize / 2,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            ownerKind: "player",
            ownerId: 2,
            ownerKey: "player:2",
            remove: false
          };
        };
        var run = function (invuln, centerDx, centerDy) {
          var target = makeTarget(invuln);
          var bullet = makeBullet(centerDx, centerDy);
          game.players = [target];
          game.enemies = [];
          game.explosions = [];
          hitTank(bullet);
          var explosion = game.explosions[0] || null;
          return {
            bulletRemoved: bullet.remove,
            stun: target.stun,
            explosions: game.explosions.length,
            explosion: explosion ? {
              x: explosion.x,
              y: explosion.y,
              ttl: explosion.ttl,
              style: explosion.style
            } : null
          };
        };
        try {
          return {
            protected: run(1, 0, 0),
            positiveNine: run(0, 9, 9),
            negativeNine: run(0, -9, -9),
            positiveTen: run(0, 10, 0),
            negativeTen: run(0, -10, 0)
          };
        } finally {
          Object.assign(game, previous);
        }
      }
    });
  }

  return Object.freeze({ createCombatProjectileDiagnostics: createCombatProjectileDiagnostics });
});
