(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.battleLoopRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = [
    "checkEndState",
    "spawnEnemies",
    "shouldSpawnEnemies",
    "syncMovementAudio",
    "updateBaseDestructionTimer",
    "updateBullets",
    "updateEnemies",
    "updateExplosions",
    "updateFreezeTimer",
    "updatePlayerGameOverMessage",
    "updatePlayerInvulnerabilityTimers",
    "updatePlayers",
    "updatePowerUp",
    "updateScorePopups",
    "updateShovelTimer"
  ];

  function requireInputs(state, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    for (var i = 0; i < CALLBACK_NAMES.length; i += 1) {
      var name = CALLBACK_NAMES[i];
      if (typeof callbacks[name] !== "function") {
        throw new Error("callbacks." + name + " must be a function");
      }
    }
  }

  /** Owns the fixed-frame battle update order and post-game simulation options. */
  function setupBattleLoopRuntime(state, deps, callbacks) {
    requireInputs(state, callbacks);

    var game = state.game;
    var checkEndState = callbacks.checkEndState;
    var spawnEnemies = callbacks.spawnEnemies;
    var shouldSpawnEnemies = callbacks.shouldSpawnEnemies;
    var syncMovementAudio = callbacks.syncMovementAudio;
    var updateBaseDestructionTimer = callbacks.updateBaseDestructionTimer;
    var updateBullets = callbacks.updateBullets;
    var updateEnemies = callbacks.updateEnemies;
    var updateExplosions = callbacks.updateExplosions;
    var updateFreezeTimer = callbacks.updateFreezeTimer;
    var updatePlayerGameOverMessage = callbacks.updatePlayerGameOverMessage;
    var updatePlayerInvulnerabilityTimers = callbacks.updatePlayerInvulnerabilityTimers;
    var updatePlayers = callbacks.updatePlayers;
    var updatePowerUp = callbacks.updatePowerUp;
    var updateScorePopups = callbacks.updateScorePopups;
    var updateShovelTimer = callbacks.updateShovelTimer;

    /** Advances one active battle frame; post-game callers can disable input/end checks. */
    function updateBattle(options) {
      var opts = options || {};
      var playerInputEnabled = opts.playerInputEnabled !== false && game.baseDestroyTimer <= 0;
      var checkEnding = opts.checkEnding !== false;
      game.tick += 1;
      updateFreezeTimer();

      updatePlayers(playerInputEnabled);
      updateEnemies();
      updateShovelTimer();
      updatePlayerInvulnerabilityTimers();
      updateExplosions();
      updateBaseDestructionTimer();
      updateBullets();
      updateScorePopups();
      updatePowerUp();
      updatePlayerGameOverMessage();
      if (shouldSpawnEnemies()) spawnEnemies();
      if (checkEnding) checkEndState();
      syncMovementAudio();
    }

    var api = { updateBattle: updateBattle };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupBattleLoopRuntime: setupBattleLoopRuntime });
});
