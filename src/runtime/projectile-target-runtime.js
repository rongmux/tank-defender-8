(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.projectileTargetRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = [
    "addRuleExplosion",
    "baseDestructionDuration",
    "destroyEnemy",
    "gameSettings",
    "killPlayer",
    "playSound",
    "releaseCarrierPowerUp"
  ];

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!deps.sharedState || typeof deps.sharedState !== "object") {
      throw new Error("deps.sharedState must be an object");
    }
    if (!deps.TILE_TYPES || typeof deps.TILE_TYPES !== "object") {
      throw new Error("deps.TILE_TYPES must be an object");
    }
    var ruleNames = [
      "bulletHitsTankByCenter",
      "clamp",
      "damageWall",
      "entityRect",
      "overlappedBrickFragments",
      "overlappedQuarters",
      "rectsOverlap",
      "shouldReleaseCarrierPowerUp",
      "wallHitSoundName"
    ];
    for (var i = 0; i < ruleNames.length; i += 1) {
      var ruleName = ruleNames[i];
      if (typeof deps[ruleName] !== "function") {
        throw new Error("deps." + ruleName + " must be a function");
      }
    }
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    for (var callbackIndex = 0; callbackIndex < CALLBACK_NAMES.length; callbackIndex += 1) {
      var callbackName = CALLBACK_NAMES[callbackIndex];
      if (typeof callbacks[callbackName] !== "function") {
        throw new Error("callbacks." + callbackName + " must be a function");
      }
    }
  }

  /** Registers projectile target effects while preserving the original hit order and side effects. */
  function setupProjectileTargetRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var game = state.game;
    var shared = deps.sharedState;
    var BRICK = deps.TILE_TYPES.BRICK;
    var STEEL = deps.TILE_TYPES.STEEL;
    var addRuleExplosion = callbacks.addRuleExplosion;
    var baseDestructionDuration = callbacks.baseDestructionDuration;
    var destroyEnemy = callbacks.destroyEnemy;
    var gameSettings = callbacks.gameSettings;
    var killPlayer = callbacks.killPlayer;
    var playSound = callbacks.playSound;
    var releaseCarrierPowerUp = callbacks.releaseCarrierPowerUp;

    function hitBase(bullet) {
      if (!game.base.alive) return false;
      if (!deps.rectsOverlap(deps.entityRect(bullet), game.base)) return false;
      game.base.alive = false;
      game.baseDestroyTimer = game.demoMode ? 0 : baseDestructionDuration();
      bullet.remove = true;
      playSound("baseHit");
      playSound("playerDestroy");
      return true;
    }

    function hitTerrain(bullet) {
      var rect = deps.entityRect(bullet);
      var c0 = deps.clamp(Math.floor(rect.x / shared.TILE), 0, shared.GRID - 1);
      var r0 = deps.clamp(Math.floor(rect.y / shared.TILE), 0, shared.GRID - 1);
      var c1 = deps.clamp(Math.floor((rect.x + rect.w - 1) / shared.TILE), 0, shared.GRID - 1);
      var r1 = deps.clamp(Math.floor((rect.y + rect.h - 1) / shared.TILE), 0, shared.GRID - 1);

      for (var r = r0; r <= r1; r += 1) {
        for (var c = c0; c <= c1; c += 1) {
          var cell = game.grid[r][c];
          if ((cell.type !== BRICK && cell.type !== STEEL) || cell.mask === 0) continue;
          var hitMask = cell.type === BRICK
            ? deps.overlappedBrickFragments(rect, c, r, cell)
            : deps.overlappedQuarters(rect, c, r, cell.mask);
          if (!hitMask) continue;
          var wasSteel = cell.type === STEEL;
          var damaged = false;
          if (cell.type === BRICK || bullet.power >= 3) {
            damaged = deps.damageWall(cell, c, r, bullet, hitMask);
            addRuleExplosion(damaged ? (wasSteel ? "steelHit" : "brickHit") : "steelBlocked", bullet.x, bullet.y);
          } else {
            addRuleExplosion("steelBlocked", bullet.x, bullet.y);
          }
          bullet.remove = true;
          var sound = deps.wallHitSoundName(bullet, wasSteel, damaged);
          if (sound) playSound(sound);
          return true;
        }
      }
      return false;
    }

    function hitTank(bullet) {
      if (bullet.ownerKind === "player") {
        for (var enemyIndex = 0; enemyIndex < game.enemies.length; enemyIndex += 1) {
          var enemy = game.enemies[enemyIndex];
          if (!enemy.alive || enemy.destroying || enemy.spawnFlash > 0) continue;
          if (deps.bulletHitsTankByCenter(bullet, enemy)) {
            var wasCarrier = enemy.carrier;
            enemy.hp -= 1;
            bullet.remove = true;
            addRuleExplosion("enemyHit", bullet.x + bullet.w / 2, bullet.y + bullet.h / 2);
            playSound(enemy.hp <= 0 ? "enemyDestroy" : "enemyHit");
            if (deps.shouldReleaseCarrierPowerUp(
              wasCarrier,
              enemy.hp <= 0,
              gameSettings().powerUpRules.carrierRelease
            )) releaseCarrierPowerUp(enemy);
            if (enemy.hp <= 0) destroyEnemy(enemy, bullet.ownerId);
            return true;
          }
        }

        for (var playerIndex = 0; playerIndex < game.players.length; playerIndex += 1) {
          var player = game.players[playerIndex];
          if (!player.alive || player.id === bullet.ownerId || player.spawnFlash > 0) continue;
          if (deps.bulletHitsTankByCenter(bullet, player)) {
            if (player.invuln > 0) {
              bullet.remove = true;
              return true;
            }
            if (gameSettings().friendlyFire.enabled && player.stun <= 0) {
              player.stun = gameSettings().friendlyFire.stunFrames;
            }
            bullet.remove = true;
            addRuleExplosion("playerStun", bullet.x + bullet.w / 2, bullet.y + bullet.h / 2);
            return true;
          }
        }
      } else {
        for (var targetIndex = 0; targetIndex < game.players.length; targetIndex += 1) {
          var target = game.players[targetIndex];
          if (!target.alive || target.spawnFlash > 0) continue;
          if (deps.bulletHitsTankByCenter(bullet, target)) {
            if (target.invuln > 0) {
              bullet.remove = true;
              return true;
            }
            bullet.remove = true;
            addRuleExplosion(
              "steelBlocked",
              bullet.x + bullet.w / 2,
              bullet.y + bullet.h / 2
            );
            killPlayer(target);
            return true;
          }
        }
      }
      return false;
    }

    var api = {
      hitBase: hitBase,
      hitTerrain: hitTerrain,
      hitTank: hitTank
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupProjectileTargetRuntime: setupProjectileTargetRuntime });
});
