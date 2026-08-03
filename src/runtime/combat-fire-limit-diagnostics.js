(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.combatFireLimitDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function requireScope(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");
  }

  /** Builds the player/enemy active-bullet limit diagnostic probe. */
  function createCombatFireLimitDiagnostics(scope) {
    requireScope(scope);

    var DOWN = scope.DOWN;
    var RIGHT = scope.RIGHT;
    var enemyTypeDefinitions = scope.enemyTypeDefinitions;
    var game = scope.game;
    var playerShootAudio = scope.playerShootAudio;
    var playerUpgradeRule = scope.playerUpgradeRule;
    var shoot = scope.shoot;
    var stopPlayerShootAudio = scope.stopPlayerShootAudio;
    var syncMovementIceAudioNodes = scope.syncMovementIceAudioNodes;
    var syncPlayerShootAudioNodes = scope.syncPlayerShootAudioNodes;

    return Object.freeze({
      debugActiveBulletLimitProbe() {
        var previousBullets = game.bullets;
        var previousPlayerShoot = { active: playerShootAudio.active, frame: playerShootAudio.frame };
        var makePlayer = function (level) {
          return {
            kind: "player",
            id: 1,
            x: 16,
            y: 16,
            w: 14,
            h: 14,
            dir: RIGHT,
            alive: true,
            spawnFlash: 0,
            reload: 0,
            level: level
          };
        };
        var attempt = function (level, shots) {
          var player = makePlayer(level);
          game.bullets = [];
          var counts = [];
          for (var i = 0; i < shots; i += 1) {
            player.reload = 0;
            shoot(player);
            counts.push(game.bullets.filter(function (bullet) { return bullet.ownerKey === "player:1"; }).length);
          }
          return {
            level: level,
            maxBullets: playerUpgradeRule(level).maxBullets,
            counts: counts,
            speeds: game.bullets.map(function (bullet) { return bullet.speed; }),
            powers: game.bullets.map(function (bullet) { return bullet.power; })
          };
        };
        var attemptEnemy = function (shots) {
          var type = enemyTypeDefinitions()[2];
          var enemy = {
            kind: "enemy",
            id: 100,
            x: 48,
            y: 16,
            w: 14,
            h: 14,
            dir: DOWN,
            alive: true,
            spawnFlash: 0,
            reload: 0,
            reloadBase: type.reload,
            bulletSpeed: type.bullet,
            bulletPower: type.wallPower
          };
          game.bullets = [];
          var counts = [];
          for (var i = 0; i < shots; i += 1) {
            enemy.reload = 0;
            shoot(enemy);
            counts.push(game.bullets.filter(function (bullet) { return bullet.ownerKey === "enemy:100"; }).length);
          }
          return {
            maxBullets: 1,
            counts: counts,
            speeds: game.bullets.map(function (bullet) { return bullet.speed; }),
            powers: game.bullets.map(function (bullet) { return bullet.power; })
          };
        };

        try {
          stopPlayerShootAudio();
          return {
            base: attempt(0, 2),
            upgraded: attempt(2, 3),
            enemy: attemptEnemy(2)
          };
        } finally {
          stopPlayerShootAudio();
          game.bullets = previousBullets;
          playerShootAudio.active = previousPlayerShoot.active;
          playerShootAudio.frame = previousPlayerShoot.frame;
          syncPlayerShootAudioNodes();
          syncMovementIceAudioNodes();
        }
      }
    });
  }

  return Object.freeze({ createCombatFireLimitDiagnostics: createCombatFireLimitDiagnostics });
});
