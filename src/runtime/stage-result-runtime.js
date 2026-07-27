(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.stageResultRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = [
    "addPlayerScore",
    "enemyTypeDefinitions",
    "enemyDataStage",
    "gameSettings",
    "mapDataStage",
    "playSound",
    "stageCycleLimit"
  ];

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!Array.isArray(state.game.players)) {
      throw new Error("state.game.players must be an array");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (typeof deps.createStageResultPresentation !== "function") {
      throw new Error("deps.createStageResultPresentation must be a function");
    }
    if (typeof deps.selectStageClearBonusRecipients !== "function") {
      throw new Error("deps.selectStageClearBonusRecipients must be a function");
    }
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    for (var i = 0; i < CALLBACK_NAMES.length; i += 1) {
      var name = CALLBACK_NAMES[i];
      if (typeof callbacks[name] !== "function") {
        throw new Error("callbacks." + name + " must be a function");
      }
    }
  }

  /** Owns stage routing projections, result timing, bonus recipients, and bonus side effects. */
  function setupStageResultRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var game = state.game;
    var addPlayerScore = callbacks.addPlayerScore;
    var enemyTypeDefinitions = callbacks.enemyTypeDefinitions;
    var enemyDataStage = callbacks.enemyDataStage;
    var gameSettings = callbacks.gameSettings;
    var mapDataStage = callbacks.mapDataStage;
    var playSound = callbacks.playSound;
    var stageCycleLimit = callbacks.stageCycleLimit;

    function stageAdvanceResult(stage) {
      var current = Math.max(1, Math.floor(Number(stage) || 1));
      var limit = stageCycleLimit();
      if (current < limit) {
        var next = current + 1;
        return {
          stage: next,
          wraps: false,
          stops: false,
          stageCycleLimit: limit,
          mapDataStage: mapDataStage(next),
          enemyDataStage: enemyDataStage(next)
        };
      }
      if (gameSettings().stageAdvance.loopAfterFinalStage) {
        return {
          stage: 1,
          wraps: true,
          stops: false,
          stageCycleLimit: limit,
          mapDataStage: mapDataStage(1),
          enemyDataStage: enemyDataStage(1)
        };
      }
      return {
        stage: current,
        wraps: false,
        stops: true,
        stageCycleLimit: limit,
        mapDataStage: mapDataStage(current),
        enemyDataStage: enemyDataStage(current)
      };
    }

    function awardPendingStageClearBonus() {
      if (game.stageClearBonusAwarded) return;
      game.stageClearBonusAwarded = true;
      var bonus = gameSettings().stageClearBonus;
      var awarded = false;
      for (var i = 0; i < game.players.length; i += 1) {
        var player = game.players[i];
        if (game.stageClearBonusPlayerIds.indexOf(player.id) === -1) continue;
        addPlayerScore(player, bonus.points);
        player.stagePoints += bonus.points;
        awarded = true;
      }
      if (awarded) playSound("stageBonus");
    }

    function stageClearPresentation(players, elapsed) {
      var frame = Math.max(0, Math.floor(elapsed === undefined ? game.stageClearElapsed : elapsed));
      return deps.createStageResultPresentation(
        players || game.players,
        enemyTypeDefinitions(),
        frame,
        game.stageClearBonusAwarded
      );
    }

    function stageResultDuration(players) {
      var override = gameSettings().timings.stageClear;
      return override > 0 ? override : stageClearPresentation(players, 0).endFrame;
    }

    function stageClearBonusRecipients(players) {
      return deps.selectStageClearBonusRecipients(players, gameSettings().stageClearBonus);
    }

    var api = {
      stageAdvanceResult: stageAdvanceResult,
      awardPendingStageClearBonus: awardPendingStageClearBonus,
      stageClearPresentation: stageClearPresentation,
      stageResultDuration: stageResultDuration,
      stageClearBonusRecipients: stageClearBonusRecipients
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupStageResultRuntime: setupStageResultRuntime });
});
