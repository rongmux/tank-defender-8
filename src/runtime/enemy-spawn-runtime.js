(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.enemySpawnRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var FUNCTION_NAMES = [
    "clearPowerUpForCarrierSpawn",
    "enemyTypeDefinitions",
    "enemySpawnPoint",
    "enemyTotal",
    "gameSettings",
    "getEnemySpec",
    "isExtendedLoopStage",
    "maxActiveEnemies",
    "stageCycleLimit"
  ];

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    for (var i = 0; i < FUNCTION_NAMES.length; i += 1) {
      var name = FUNCTION_NAMES[i];
      if (typeof callbacks[name] !== "function") {
        throw new Error("callbacks." + name + " must be a function");
      }
    }
  }

  /** Registers the fixed-frame enemy creation and spawn-pacing boundary. */
  function setupEnemySpawnRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var game = state.game;
    var {
      clearPowerUpForCarrierSpawn,
      enemySpawnPoint,
      enemyTotal,
      gameSettings,
      getEnemySpec,
      isExtendedLoopStage,
      maxActiveEnemies,
      stageCycleLimit
    } = callbacks;

    function spawnEnemies() {
      if (game.enemySpawned >= enemyTotal()) return;
      var capacity = maxActiveEnemies();
      if (deps.activeEnemyCount(game.enemies) >= capacity) return;
      if (game.nextSpawn > 0) {
        game.nextSpawn -= 1;
        return;
      }
      var enemySpec = getEnemySpec(game.stage, game.enemySpawned);
      var spawnIndex = deps.selectEnemySpawnIndex(enemySpec, game.enemySpawned);
      var point = enemySpawnPoint(spawnIndex);
      var typeIndex = enemySpec.typeIndex;
      var enemyTypes = callbacks.enemyTypeDefinitions();
      var type = enemyTypes[typeIndex] || enemyTypes[0];
      var carrier = enemySpec.carrier;
      var slotIndex = deps.findAvailableEnemySlot(game.enemies, capacity);
      if (slotIndex === null) return;
      if (deps.isEnemySpawnPointOccupied(point, game.players, game.enemies)) {
        game.nextSpawn = gameSettings().timings.enemySpawnRetry;
        return;
      }
      clearPowerUpForCarrierSpawn(carrier);
      game.enemies.push(deps.createEnemyState({
        id: 100 + game.enemySpawned,
        slotIndex: slotIndex,
        spawn: point,
        direction: deps.DOWN,
        type: type,
        typeIndex: typeIndex,
        spec: enemySpec,
        settings: gameSettings(),
        normalMoveSpeed: deps.ENEMY_MOVE_SPEED.normal
      }));
      game.enemySpawned += 1;
      game.nextSpawn = enemySpawnDelay(game.stage, game.enemySpawned);
    }

    function enemySpawnDelay(stage, index) {
      if (index >= enemyTotal(stage)) return 0;
      var spec = getEnemySpec(stage, index);
      if (spec && spec.spawnDelay !== null && spec.spawnDelay !== undefined) return spec.spawnDelay;
      var pacing = gameSettings().enemySpawnPacing || deps.DEFAULT_ENEMY_SPAWN_PACING;
      return scaleEnemySpawnDelayForPlayers(index === 0 ? pacing.firstDelay : defaultEnemySpawnDelay(stage));
    }

    function defaultEnemySpawnDelay(stage) {
      var pacing = gameSettings().enemySpawnPacing || deps.DEFAULT_ENEMY_SPAWN_PACING;
      var stageValue = Math.max(1, Math.floor(Number(stage) || game.stage || 1));
      return deps.calculateEnemySpawnDelay(
        pacing,
        stageValue,
        stageCycleLimit(),
        isExtendedLoopStage(stageValue)
      );
    }

    function scaleEnemySpawnDelayForPlayers(delay, players) {
      var pacing = gameSettings().enemySpawnPacing || deps.DEFAULT_ENEMY_SPAWN_PACING;
      var playerCount = Math.max(1, Math.floor(Number(players) || game.playerCount || 1));
      return deps.scaleEnemySpawnDelay(delay, playerCount, pacing);
    }

    var api = {
      spawnEnemies: spawnEnemies,
      enemySpawnDelay: enemySpawnDelay,
      defaultEnemySpawnDelay: defaultEnemySpawnDelay,
      scaleEnemySpawnDelayForPlayers: scaleEnemySpawnDelayForPlayers
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupEnemySpawnRuntime: setupEnemySpawnRuntime });
});
