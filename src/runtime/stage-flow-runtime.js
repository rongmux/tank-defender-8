(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.stageFlowRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = [
    "awardPendingStageClearBonus",
    "gameSettings",
    "resetTitleIdleTimer",
    "stageAdvanceResult",
    "stageClearBonusRecipients",
    "stageCurtainCloseFrames",
    "stageResultDuration",
    "startFullGameOverScreen",
    "startStage",
    "stopGameplayAudioBeforeResult",
    "stopStageResultAudio"
  ];

  function requireInputs(state, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!Array.isArray(state.game.players)) {
      throw new Error("state.game.players must be an array");
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

  /** Owns stage-result and stage-transition state changes while rules stay callback-driven. */
  function setupStageFlowRuntime(state, deps, callbacks) {
    requireInputs(state, callbacks);

    var game = state.game;
    var awardPendingStageClearBonus = callbacks.awardPendingStageClearBonus;
    var gameSettings = callbacks.gameSettings;
    var resetTitleIdleTimer = callbacks.resetTitleIdleTimer;
    var stageAdvanceResult = callbacks.stageAdvanceResult;
    var stageClearBonusRecipients = callbacks.stageClearBonusRecipients;
    var stageCurtainCloseFrames = callbacks.stageCurtainCloseFrames;
    var stageResultDuration = callbacks.stageResultDuration;
    var startFullGameOverScreen = callbacks.startFullGameOverScreen;
    var startStage = callbacks.startStage;
    var stopGameplayAudioBeforeResult = callbacks.stopGameplayAudioBeforeResult;
    var stopStageResultAudio = callbacks.stopStageResultAudio;

    function enterStageClear() {
      enterStageResult("clear");
    }

    function enterStageResult(reason) {
      stopGameplayAudioBeforeResult();
      var resultReason = reason === "gameOver" ? "gameOver" : "clear";
      game.clearPendingTimer = 0;
      game.playerGameOverMessage = null;
      game.stageResultReason = resultReason;
      game.stageClearElapsed = 0;
      game.stageClearBonusPlayerIds = resultReason === "clear"
        ? stageClearBonusRecipients(game.players).map(function (player) { return player.id; })
        : [];
      game.stageClearBonusAwarded = false;
      game.screen = "stageClear";
      game.transitionTimer = stageResultDuration(game.players);
    }

    function finishStageResult() {
      stopStageResultAudio();
      if (game.stageResultReason === "gameOver") {
        var gameOverAdvance = stageAdvanceResult(game.stage);
        if (!game.customGrid && !gameOverAdvance.stops) game.stage = gameOverAdvance.stage;
        startFullGameOverScreen();
        return;
      }
      awardPendingStageClearBonus();
      var advance = stageAdvanceResult(game.stage);
      game.customGrid = null;
      if (advance.stops) {
        game.screen = "title";
        resetTitleIdleTimer();
        return;
      }
      game.constructionStageActive = false;
      game.screen = "stageClearClosing";
      game.transitionTimer = stageCurtainCloseFrames();
    }

    function finishStageClearClosing() {
      game.stage = stageAdvanceResult(game.stage).stage;
      startStage(game.stage);
    }

    function finishGameOverScreen() {
      enterStageResult("gameOver");
    }

    function gameOverFieldDuration() {
      var timings = gameSettings().timings;
      return timings.gameOverSlide + timings.gameOverHold;
    }

    var api = {
      enterStageClear: enterStageClear,
      enterStageResult: enterStageResult,
      finishStageResult: finishStageResult,
      finishStageClearClosing: finishStageClearClosing,
      finishGameOverScreen: finishGameOverScreen,
      gameOverFieldDuration: gameOverFieldDuration
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupStageFlowRuntime: setupStageFlowRuntime });
});
