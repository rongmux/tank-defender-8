(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.battleCombatRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = [
    "explosionRule",
    "gameSettings",
    "playSound",
    "resetFrameCounterLow",
    "resetPlayerPosition",
    "updateHighScore"
  ];

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
    var dependencyNames = [
      "addScorePoints",
      "awardBonusLives",
      "beginPlayerDestructionState",
      "resolvePlayerDeathState",
      "sharedState"
    ];
    for (var dependencyIndex = 0; dependencyIndex < dependencyNames.length; dependencyIndex += 1) {
      var dependencyName = dependencyNames[dependencyIndex];
      if (dependencyName === "sharedState") {
        if (!deps.sharedState || typeof deps.sharedState !== "object") {
          throw new Error("deps.sharedState must be an object");
        }
      } else if (typeof deps[dependencyName] !== "function") {
        throw new Error("deps." + dependencyName + " must be a function");
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

  /** Owns score, enemy destruction, player death, and the two-player GAME OVER message state. */
  function setupBattleCombatRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var game = state.game;
    var shared = deps.sharedState;
    var explosionRule = callbacks.explosionRule;
    var gameSettings = callbacks.gameSettings;
    var playSound = callbacks.playSound;
    var resetFrameCounterLow = callbacks.resetFrameCounterLow;
    var resetPlayerPosition = callbacks.resetPlayerPosition;
    var updateHighScore = callbacks.updateHighScore;

    function addPlayerScore(player, points) {
      var result = deps.addScorePoints(player, points);
      updateHighScore(result.nextScore);
      var awarded = deps.awardBonusLives(player, result.previousScore, result.nextScore, gameSettings().bonusLifeScores);
      for (var index = 0; index < awarded; index += 1) playSound("bonusLife");
    }

    function destroyEnemy(enemy, ownerId, options) {
      if (!enemy.alive || enemy.destroying) return;
      var source = options || {};
      var awardScore = !game.demoMode && source.awardScore !== false;
      var trackKill = !game.demoMode && source.trackKill !== false;
      enemy.destroying = true;
      enemy.destroyTicks = 0;
      enemy.destroyExplosionTicks = explosionRule("enemyDestroy").ttl;
      enemy.destroyShowScore = source.showScore !== false;
      var player = game.players.find(function (candidate) { return candidate.id === ownerId; });
      if (!player) return;
      if (awardScore) {
        addPlayerScore(player, enemy.score);
        player.stagePoints += enemy.score;
      }
      if (trackKill) {
        player.stageKills[enemy.typeIndex] = (player.stageKills[enemy.typeIndex] || 0) + 1;
        player.totalKills[enemy.typeIndex] = (player.totalKills[enemy.typeIndex] || 0) + 1;
      }
    }

    function killPlayer(player) {
      var started = deps.beginPlayerDestructionState(player, {
        deathPowerLevel: gameSettings().deathPowerLevel,
        explosionTicks: explosionRule("playerDestroy").ttl,
        respawnTicks: gameSettings().timings.playerRespawn
      });
      if (!started) return;
      playSound("playerDestroy");
      if (player.respawn === 0) finishPlayerDeath(player);
    }

    function finishPlayerDeath(player) {
      var outcome = deps.resolvePlayerDeathState(player);
      if (!outcome.eliminated) {
        resetPlayerPosition(player);
        return;
      }
      startPlayerGameOverMessage(player);
    }

    function startPlayerGameOverMessage(player) {
      if (game.demoMode || game.screen !== "playing") return;
      if (!game.players.some(function (candidate) { return candidate.id !== player.id && candidate.lives > 0; })) return;
      var isPlayerTwo = player.id === 2;
      game.playerGameOverMessage = {
        playerId: player.id,
        timer: shared.PLAYER_GAME_OVER_MESSAGE_TIMER,
        x: isPlayerTwo ? 0xc0 : 0x20,
        y: shared.PLAYER_GAME_OVER_MESSAGE_Y,
        dx: isPlayerTwo ? -1 : 1
      };
      resetFrameCounterLow();
    }

    function playerGameOverMessageActive() {
      return Boolean(game.playerGameOverMessage && game.playerGameOverMessage.timer > 0);
    }

    function updatePlayerGameOverMessage() {
      var message = game.playerGameOverMessage;
      if (!message || message.timer <= 0 || game.demoMode) return;
      if ((game.frameLow & 0x0f) === 0) {
        message.timer -= 1;
        if (message.timer <= 0) {
          message.timer = 0;
          message.y = shared.PLAYER_GAME_OVER_MESSAGE_HIDDEN_Y;
          return;
        }
      }
      if (message.timer >= shared.PLAYER_GAME_OVER_MESSAGE_MOVE_THRESHOLD) message.x += message.dx;
    }

    var api = {
      destroyEnemy: destroyEnemy,
      addPlayerScore: addPlayerScore,
      killPlayer: killPlayer,
      finishPlayerDeath: finishPlayerDeath,
      startPlayerGameOverMessage: startPlayerGameOverMessage,
      playerGameOverMessageActive: playerGameOverMessageActive,
      updatePlayerGameOverMessage: updatePlayerGameOverMessage
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupBattleCombatRuntime: setupBattleCombatRuntime });
});
