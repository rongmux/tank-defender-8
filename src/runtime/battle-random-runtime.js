(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.battleRandomRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = ["enemyTotal", "getEnemySpec"];

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!Array.isArray(state.game.players)) {
      throw new Error("state.game.players must be an array");
    }
    if (!Array.isArray(state.game.enemies)) {
      throw new Error("state.game.enemies must be an array");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!deps.sharedState || typeof deps.sharedState !== "object") {
      throw new Error("deps.sharedState must be an object");
    }
    if (typeof deps.advanceBattleRandom !== "function") {
      throw new Error("deps.advanceBattleRandom must be a function");
    }
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    for (var i = 0; i < CALLBACK_NAMES.length; i += 1) {
      var name = CALLBACK_NAMES[i];
      if (typeof callbacks[name] !== "function") {
        throw new Error("callbacks." + name + " must be a function");
      }
    }
  }

  /** Owns the live battle random stream and its zero-page/tank state projection. */
  function setupBattleRandomRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var game = state.game;
    var fn = state.fn;
    var shared = deps.sharedState;
    var enemyTotal = callbacks.enemyTotal;
    var getEnemySpec = callbacks.getEnemySpec;

    function randomByte(random) {
      if (typeof random === "function") return Math.floor(random() * 256) & 0xff;
      return nextBattleRandomByte();
    }

    function nextBattleRandomByte() {
      var nextIndex = (game.randomIndex + 1) & 0xff;
      var next = deps.advanceBattleRandom(
        game.randomValue,
        game.randomIndex,
        game.frameHigh,
        battleRandomZeroPageByte(nextIndex, game.randomValue)
      );
      game.randomValue = next.value;
      game.randomIndex = next.index;
      return next.value;
    }

    function resetBattleRandom() {
      game.randomValue = 0;
      game.randomIndex = 0;
    }

    /** Projects the live battle into the zero-page addresses sampled by the D44D random routine. */
    function battleRandomZeroPageByte(index, previousRandomValue) {
      var address = Math.floor(Number(index) || 0) & 0xff;
      if (address === 0x0a) return game.frameHigh;
      if (address === 0x0b) return game.frameLow;
      if (address === 0x0f) return previousRandomValue;
      if (address === 0x10) return address;
      if (address === 0x6a) return currentEnemySpawnPositionIndex();
      if (address === 0x7f) return Math.max(0, enemyTotal() - game.enemySpawned);
      if (address === 0x82) return game.nextSpawn;
      if (address === 0x84) {
        return fn.scaleEnemySpawnDelayForPlayers(fn.defaultEnemySpawnDelay(game.stage), game.playerCount);
      }
      if (address >= 0x90 && address <= 0x97) {
        return tankRandomMemoryByte(address - 0x90, "x");
      }
      if (address >= 0x98 && address <= 0x9f) {
        return tankRandomMemoryByte(address - 0x98, "y");
      }
      if (address >= 0xa8 && address <= 0xaf) {
        return tankRandomTypeByte(address - 0xa8);
      }
      return 0;
    }

    function currentEnemySpawnPositionIndex() {
      if (game.enemySpawned <= 0) return 0;
      var spec = getEnemySpec(game.stage, game.enemySpawned - 1);
      return spec.spawnIndex === undefined ? game.enemySpawned % 3 : spec.spawnIndex;
    }

    function tankForOriginalSlot(slotIndex) {
      if (slotIndex < 2) {
        return game.players.find(function (player) { return player.id === slotIndex + 1; }) || null;
      }
      return game.enemies.find(function (enemy) {
        return enemy.alive && enemy.slotIndex === slotIndex;
      }) || null;
    }

    function tankRandomMemoryByte(slotIndex, axis) {
      var tank = tankForOriginalSlot(slotIndex);
      if (!tank) return 0;
      var fieldOffset = axis === "x" ? shared.FIELD_X : shared.FIELD_Y;
      return (Math.round(Number(tank[axis]) || 0) + fieldOffset) & 0xff;
    }

    function tankRandomTypeByte(slotIndex) {
      var tank = tankForOriginalSlot(slotIndex);
      if (!tank) return 0;
      if (tank.kind === "player") return ((tank.level & 3) << 4) | (tank.dir & 3);
      return 0x80 | ((tank.typeIndex & 3) << 5) | (tank.carrier ? 0x04 : 0) | (tank.dir & 3);
    }

    var api = {
      randomByte: randomByte,
      nextBattleRandomByte: nextBattleRandomByte,
      resetBattleRandom: resetBattleRandom,
      battleRandomZeroPageByte: battleRandomZeroPageByte,
      currentEnemySpawnPositionIndex: currentEnemySpawnPositionIndex,
      tankForOriginalSlot: tankForOriginalSlot,
      tankRandomMemoryByte: tankRandomMemoryByte,
      tankRandomTypeByte: tankRandomTypeByte
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupBattleRandomRuntime: setupBattleRandomRuntime });
});
