(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.enemyMovementRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = [
    "advanceTankTracks",
    "aiRoll",
    "canTankOccupy",
    "chooseEnemyDirectionByPhase",
    "gameSettings",
    "isEnemyAtTurnIntersection",
    "moveTank",
    "randomByte",
    "totalTankOverlapArea"
  ];

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!Array.isArray(deps.DIR_X) || !Array.isArray(deps.DIR_Y)) {
      throw new Error("deps.DIR_X and deps.DIR_Y must be arrays");
    }
    if (typeof deps.entityRect !== "function") {
      throw new Error("deps.entityRect must be a function");
    }
    if (typeof deps.isEnemyMovementFrame !== "function") {
      throw new Error("deps.isEnemyMovementFrame must be a function");
    }
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    for (var i = 0; i < CALLBACK_NAMES.length; i += 1) {
      var name = CALLBACK_NAMES[i];
      if (typeof callbacks[name] !== "function") {
        throw new Error("callbacks." + name + " must be a function");
      }
    }
  }

  /** Registers enemy movement, blocked retries, and overlap recovery. */
  function setupEnemyMovementRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var game = state.game;
    var DIR_X = deps.DIR_X;
    var DIR_Y = deps.DIR_Y;
    var advanceTankTracks = callbacks.advanceTankTracks;
    var aiRoll = callbacks.aiRoll;
    var canTankOccupy = callbacks.canTankOccupy;
    var chooseEnemyDirectionByPhase = callbacks.chooseEnemyDirectionByPhase;
    var gameSettings = callbacks.gameSettings;
    var isEnemyAtTurnIntersection = callbacks.isEnemyAtTurnIntersection;
    var moveTank = callbacks.moveTank;
    var randomByte = callbacks.randomByte;
    var totalTankOverlapArea = callbacks.totalTankOverlapArea;

    function updateEnemyMovement(enemy, random) {
      var nextRandom = typeof random === "function" ? random : undefined;
      if (!deps.isEnemyMovementFrame(enemy, game.frameLow)) return;

      if (recoverEnemyTankOverlap(enemy)) return;

      if (enemy.blockedPauseTicks > 0) {
        enemy.blockedPauseTicks -= 1;
        return;
      }

      if (enemy.pendingTurn) {
        enemy.pendingTurn = false;
        if ((randomByte(nextRandom) & 1) === 0) {
          chooseEnemyDirectionByPhase(enemy, nextRandom);
        } else {
          enemy.dir = (enemy.dir + ((randomByte(nextRandom) & 1) === 0 ? 3 : 1)) & 3;
        }
        return;
      }

      var ai = gameSettings().enemyAi;
      if (isEnemyAtTurnIntersection(enemy) && aiRoll(ai.intersectionTurnChance, nextRandom)) {
        chooseEnemyDirectionByPhase(enemy, nextRandom);
        return;
      }

      var distance = enemy.alternateMovement ? 1 : enemy.speed;
      var moved = moveTank(enemy, DIR_X[enemy.dir] * distance, DIR_Y[enemy.dir] * distance);
      advanceTankTracks(enemy);
      if (moved) return;

      if (aiRoll(ai.blockedRetryChance, nextRandom)) {
        enemy.blockedPauseTicks = ai.blockedRetryTicks;
        return;
      }

      if (isEnemyAtTurnIntersection(enemy)) enemy.pendingTurn = true;
      enemy.dir ^= 2;
    }

    /** Moves an enemy out of a strictly decreasing tank-overlap state. */
    function recoverEnemyTankOverlap(enemy) {
      var currentRect = deps.entityRect(enemy);
      var currentArea = totalTankOverlapArea(enemy, currentRect);
      if (currentArea <= 0) return false;

      var distance = enemy.alternateMovement ? 1 : Math.max(1, Number(enemy.speed) || 1);
      var directions = [enemy.dir, enemy.dir ^ 2, (enemy.dir + 1) & 3, (enemy.dir + 3) & 3];
      var best = null;
      for (var i = 0; i < directions.length; i += 1) {
        var dir = directions[i];
        var x = enemy.x + DIR_X[dir] * distance;
        var y = enemy.y + DIR_Y[dir] * distance;
        if (!canTankOccupy(enemy, x, y)) continue;
        var area = totalTankOverlapArea(enemy, { x: x, y: y, w: enemy.w, h: enemy.h });
        if (area >= currentArea || (best && area >= best.area)) continue;
        best = { x: x, y: y, dir: dir, area: area };
      }
      if (!best) return false;

      enemy.x = best.x;
      enemy.y = best.y;
      enemy.dir = best.dir;
      enemy.blockedPauseTicks = 0;
      enemy.pendingTurn = false;
      advanceTankTracks(enemy);
      return true;
    }

    var api = {
      updateEnemyMovement: updateEnemyMovement,
      recoverEnemyTankOverlap: recoverEnemyTankOverlap
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupEnemyMovementRuntime: setupEnemyMovementRuntime });
});
