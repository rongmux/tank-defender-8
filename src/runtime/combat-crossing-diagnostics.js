(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) { module.exports = api; return; }
  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.combatCrossingDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function createCombatCrossingDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");
    var game = scope.game;
    var gameSettings = scope.gameSettings;
    var LEFT = scope.LEFT;
    var RIGHT = scope.RIGHT;
    var makeGrid = scope.makeGrid;
    var resolveBulletCollisions = scope.resolveBulletCollisions;
    var updateBullets = scope.updateBullets;

    return Object.freeze({
      debugCrossingBulletCancelProbe() {
        var previousBullets = game.bullets;
        var previousExplosions = game.explosions;
        var previousGrid = game.grid;
        var previousPlayers = game.players;
        var previousEnemies = game.enemies;
        var speed = 6;
        try {
          game.grid = makeGrid(); game.players = []; game.enemies = []; game.explosions = [];
          game.bullets = [
            { x: 40, y: 80, w: gameSettings().projectileRules.bulletSize, h: gameSettings().projectileRules.bulletSize, dir: RIGHT, speed: speed, power: 1, ownerKind: "player", ownerId: 1, ownerKey: "player:1" },
            { x: 46, y: 80, w: gameSettings().projectileRules.bulletSize, h: gameSettings().projectileRules.bulletSize, dir: LEFT, speed: speed, power: 1, ownerKind: "enemy", ownerId: 100, ownerKey: "enemy:100" }
          ];
          updateBullets();
          var crossingRemaining = game.bullets.length;
          var crossingPositions = game.bullets.map(function (bullet) { return { x: bullet.x, y: bullet.y }; });
          var makeStaticPair = function (difference, sameOwner) { return [
            { x: 40, y: 96, w: gameSettings().projectileRules.bulletSize, h: gameSettings().projectileRules.bulletSize, ownerKey: "player:1", remove: false },
            { x: 40 + difference, y: 96, w: gameSettings().projectileRules.bulletSize, h: gameSettings().projectileRules.bulletSize, ownerKey: sameOwner ? "player:1" : "enemy:100", remove: false }
          ]; };
          game.bullets = makeStaticPair(5, false); resolveBulletCollisions(game.bullets);
          var thresholdFiveCanceled = game.bullets.every(function (bullet) { return bullet.remove; });
          game.bullets = makeStaticPair(6, false); resolveBulletCollisions(game.bullets);
          var thresholdSixCanceled = game.bullets.some(function (bullet) { return bullet.remove; });
          game.bullets = makeStaticPair(0, true); resolveBulletCollisions(game.bullets);
          var sameOwnerCanceled = game.bullets.some(function (bullet) { return bullet.remove; });
          return { remainingBullets: crossingRemaining, crossingPositions: crossingPositions, speed: speed, explosionCount: game.explosions.length, thresholdFiveCanceled: thresholdFiveCanceled, thresholdSixCanceled: thresholdSixCanceled, sameOwnerCanceled: sameOwnerCanceled };
        } finally {
          game.bullets = previousBullets; game.explosions = previousExplosions; game.grid = previousGrid; game.players = previousPlayers; game.enemies = previousEnemies;
        }
      }
    });
  }
  return Object.freeze({ createCombatCrossingDiagnostics: createCombatCrossingDiagnostics });
});
