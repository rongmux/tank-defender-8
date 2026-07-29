(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.powerUpRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var FUNCTION_NAMES = [
    "addPlayerScore",
    "addScorePopup",
    "buildBaseWall",
    "canTankOccupy",
    "destroyEnemy",
    "gameSettings",
    "playSound",
    "randomByte",
    "rectHitsSolidTerrain",
    "stageSettings"
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
    if (!callbacks || typeof callbacks !== "object") {
      throw new Error("callbacks must be an object");
    }
    for (var i = 0; i < FUNCTION_NAMES.length; i += 1) {
      var name = FUNCTION_NAMES[i];
      if (typeof callbacks[name] !== "function") {
        throw new Error("callbacks." + name + " must be a function");
      }
    }
  }

  function setupPowerUpRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var game = state.game;
    var shared = deps.sharedState;
    var powerTypes = deps.POWER_UP_TYPES;
    var powerUpSize = deps.POWER_UP_SIZE;
    var {
      addPlayerScore,
      addScorePopup,
      buildBaseWall,
      canTankOccupy,
      destroyEnemy,
      gameSettings,
      playSound,
      randomByte,
      rectHitsSolidTerrain,
      stageSettings
    } = callbacks;

    function releaseCarrierPowerUp(enemy) {
      enemy.carrier = false;
      spawnPowerUp(enemy.powerUpType);
    }

    function clearPowerUpForCarrierSpawn(carrier) {
      if (!deps.shouldClearPowerUpForCarrierSpawn(
        carrier,
        gameSettings().powerUpRules.clearUncollectedOnCarrierSpawn
      )) return false;
      game.powerUp = null;
      return true;
    }

    function spawnPowerUp(forcedType) {
      var settings = stageSettings();
      var spot = pickPowerUpSpawnSpot(settings ? settings.powerUpSpawns : deps.DEFAULT_POWERUP_SPAWNS);
      if (!spot) return false;
      var type = forcedType && powerTypes.includes(forcedType)
        ? forcedType
        : randomPowerUpType();
      game.powerUp = deps.createPowerUpState({
        type: type,
        position: spot,
        ttl: gameSettings().timings.powerUpTtl
      });
      playSound("powerUpAppear");
      return true;
    }

    function randomPowerUpType(random) {
      return deps.powerUpTypeForRandomByte(randomByte(random));
    }

    function pickPowerUpSpawnSpot(spots, random) {
      var originalStyle = deps.isOriginalPowerUpSpawnList(spots);
      var source = powerUpSpawnCandidates(spots);
      if (!source.length) return null;
      var picked = originalStyle
        ? deps.selectOriginalPowerUpSpawnSpot(source, randomByte(random), randomByte(random))
        : deps.selectPowerUpSpawnSpot(
          source,
          (randomByte(random) << 8) | randomByte(random),
          game.lastPowerUpSpawn
        );
      game.lastPowerUpSpawn = deps.powerUpSpawnKey(picked);
      return picked;
    }

    function resetPowerUpSpawnBag() {
      game.powerUpSpawnBag = [];
      game.powerUpSpawnBagKey = "";
    }

    function powerUpSpawnCandidates(spots) {
      var openSpots = deps.dedupePowerUpSpots(spots.filter(canPowerUpSpawnAt));
      if (openSpots.length > 1) return openSpots;
      return deps.dedupePowerUpSpots(openSpots.concat(fallbackPowerUpSpawnSpots()));
    }

    function fallbackPowerUpSpawnSpots() {
      var spots = [];
      for (var r = 0; r < shared.GRID; r += 1) {
        for (var c = 0; c < shared.GRID; c += 1) {
          var spot = { x: c * shared.TILE + 2, y: r * shared.TILE + 2 };
          if (canPowerUpSpawnAt(spot)) spots.push(spot);
        }
      }
      return spots;
    }

    function canPowerUpSpawnAt(point) {
      var powerRect = { x: point.x, y: point.y, w: powerUpSize, h: powerUpSize };
      if (powerRect.x < 0 || powerRect.y < 0 ||
        powerRect.x + powerRect.w > shared.FIELD_W ||
        powerRect.y + powerRect.h > shared.FIELD_H) return false;
      if (game.base.alive && deps.rectsOverlap(powerRect, game.base)) return false;
      if (rectHitsSolidTerrain(powerRect)) return false;
      return canTankOccupy({ w: 14, h: 14 }, point.x - 1, point.y - 1);
    }

    function updatePowerUp() {
      if (!game.powerUp) return;
      game.powerUp = deps.advancePowerUpState(game.powerUp);
      if (!game.powerUp) return;
      var player = deps.findPowerUpCollector(game.players, game.powerUp);
      if (player) collectPowerUp(player, game.powerUp);
    }

    function collectPowerUp(player, power) {
      var powerType = power.type;
      game.powerUp = null;
      applyPowerUp(player, powerType, {
        popupX: power.x + power.w / 2,
        popupY: power.y + power.h / 2
      });
      game.powerUp = null;
      if (!game.demoMode) playSound("powerUp");
    }

    function applyPowerUp(player, type, options) {
      var opts = options || {};
      var pickupScore = gameSettings().powerUpRules.pickupScore;
      if (!game.demoMode) {
        addPlayerScore(player, pickupScore);
        addScorePopup(
          pickupScore,
          Number.isFinite(opts.popupX) ? opts.popupX : player.x + player.w / 2,
          Number.isFinite(opts.popupY) ? opts.popupY : player.y + player.h / 2,
          { style: "powerUp", ttl: 49 }
        );
      }
      var effect = deps.applyPowerUpEffect(player, game, type, {
        baseAlive: game.base.alive,
        durations: gameSettings().powerUpDurations,
        maxPlayerLevel: gameSettings().playerUpgradeRules.length - 1
      });
      if (effect.soundName) playSound(effect.soundName);
      if (effect.rebuildBaseWall) buildBaseWall(game.grid, deps.STEEL);
      if (effect.destroyActiveEnemies) {
        for (var i = 0; i < game.enemies.length; i += 1) {
          var enemy = game.enemies[i];
          if (!enemy.alive || enemy.destroying || enemy.spawnFlash > 0) continue;
          enemy.hp = 0;
          destroyEnemy(enemy, player.id, { awardScore: false, trackKill: false, showScore: false });
        }
      }
    }

    var api = {
      releaseCarrierPowerUp: releaseCarrierPowerUp,
      clearPowerUpForCarrierSpawn: clearPowerUpForCarrierSpawn,
      spawnPowerUp: spawnPowerUp,
      randomPowerUpType: randomPowerUpType,
      pickPowerUpSpawnSpot: pickPowerUpSpawnSpot,
      resetPowerUpSpawnBag: resetPowerUpSpawnBag,
      powerUpSpawnCandidates: powerUpSpawnCandidates,
      fallbackPowerUpSpawnSpots: fallbackPowerUpSpawnSpots,
      canPowerUpSpawnAt: canPowerUpSpawnAt,
      updatePowerUp: updatePowerUp,
      collectPowerUp: collectPowerUp,
      applyPowerUp: applyPowerUp
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupPowerUpRuntime: setupPowerUpRuntime });
});
