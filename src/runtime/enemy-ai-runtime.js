(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.enemyAiRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = [
    "defaultEnemySpawnDelay",
    "directionTowardTarget",
    "gameSettings",
    "randomByte",
    "scaleEnemySpawnDelayForPlayers",
    "selectEnemyTargetPlayer"
  ];

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (typeof deps.ENEMY_FIRE_CHANCE !== "number") {
      throw new Error("deps.ENEMY_FIRE_CHANCE must be a number");
    }
    var ruleNames = [
      "directionTowardTarget",
      "enemyAiChanceMatches",
      "enemyAiPhaseForInterval",
      "selectEnemyTargetPlayer",
      "shouldEnemyFireForByte"
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

  /** Registers enemy phase selection, target direction, fire, and probability decisions. */
  function setupEnemyAiRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var game = state.game;
    var enemyFireChance = deps.ENEMY_FIRE_CHANCE;
    var defaultEnemySpawnDelay = callbacks.defaultEnemySpawnDelay;
    var directionTowardTarget = callbacks.directionTowardTarget;
    var gameSettings = callbacks.gameSettings;
    var randomByte = callbacks.randomByte;
    var scaleEnemySpawnDelayForPlayers = callbacks.scaleEnemySpawnDelayForPlayers;
    var selectEnemyTargetPlayer = callbacks.selectEnemyTargetPlayer;

    function chooseEnemyDirectionByPhase(enemy, random) {
      var nextRandom = typeof random === "function" ? random : undefined;
      var phase = enemyAiPhase(game.stage, game.frameHigh);
      if (phase === "random") {
        enemy.dir = randomByte(nextRandom) & 3;
        return phase;
      }

      var target = { x: game.base.x + game.base.w / 2, y: game.base.y + game.base.h / 2 };
      if (phase === "player") {
        var player = selectEnemyTargetPlayer(enemy, game.players);
        if (player) target = { x: player.x + player.w / 2, y: player.y + player.h / 2 };
      }
      var horizontalFirst = aiRoll(gameSettings().enemyAi.horizontalFirstChance, nextRandom);
      enemy.dir = directionTowardTarget(enemy, target, horizontalFirst);
      return phase;
    }

    function enemyAiPhase(stage, frameHigh) {
      var interval = scaleEnemySpawnDelayForPlayers(defaultEnemySpawnDelay(stage), game.playerCount);
      return deps.enemyAiPhaseForInterval(interval, frameHigh);
    }

    function shouldEnemyFire(enemy) {
      return deps.shouldEnemyFireForByte(enemy.fireChance, enemyFireChance, randomByte());
    }

    function aiRoll(chance, random) {
      return deps.enemyAiChanceMatches(chance, randomByte(random));
    }

    var api = {
      chooseEnemyDirectionByPhase: chooseEnemyDirectionByPhase,
      enemyAiPhase: enemyAiPhase,
      shouldEnemyFire: shouldEnemyFire,
      aiRoll: aiRoll
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupEnemyAiRuntime: setupEnemyAiRuntime });
});
