(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.screenUpdateRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = [
    "advanceFrameCounters",
    "awardPendingStageClearBonus",
    "checkEndState",
    "finishGameOverScreen",
    "finishStageClearClosing",
    "finishStageResult",
    "playSound",
    "resetFrameCounterHigh",
    "stageClearPresentation",
    "stageResultVisibleKillCount",
    "syncMovementAudio",
    "updateAudio",
    "updateBattle",
    "updateEditorControls",
    "updateExplosions",
    "updateFullGameOverScreen",
    "updateHighScoreScreen",
    "updateHiddenMessage",
    "updateScorePopups",
    "updateStageSelectControls",
    "updateTitleIdle"
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

  /** Owns fixed-frame updates for non-battle screens and the active-screen dispatch. */
  function setupScreenUpdateRuntime(state, deps, callbacks) {
    requireInputs(state, callbacks);

    var game = state.game;
    var advanceFrameCounters = callbacks.advanceFrameCounters;
    var awardPendingStageClearBonus = callbacks.awardPendingStageClearBonus;
    var checkEndState = callbacks.checkEndState;
    var finishGameOverScreen = callbacks.finishGameOverScreen;
    var finishStageClearClosing = callbacks.finishStageClearClosing;
    var finishStageResult = callbacks.finishStageResult;
    var playSound = callbacks.playSound;
    var resetFrameCounterHigh = callbacks.resetFrameCounterHigh;
    var stageClearPresentation = callbacks.stageClearPresentation;
    var stageResultVisibleKillCount = callbacks.stageResultVisibleKillCount;
    var syncMovementAudio = callbacks.syncMovementAudio;
    var updateAudio = callbacks.updateAudio;
    var updateBattle = callbacks.updateBattle;
    var updateEditorControls = callbacks.updateEditorControls;
    var updateExplosions = callbacks.updateExplosions;
    var updateFullGameOverScreen = callbacks.updateFullGameOverScreen;
    var updateHighScoreScreen = callbacks.updateHighScoreScreen;
    var updateHiddenMessage = callbacks.updateHiddenMessage;
    var updateScorePopups = callbacks.updateScorePopups;
    var updateStageSelectControls = callbacks.updateStageSelectControls;
    var updateTitleIdle = callbacks.updateTitleIdle;

    function updateFrame() {
      advanceFrameCounters();
      if (game.editorMessageTimer > 0) game.editorMessageTimer -= 1;
      updateAudio();

      if (game.screen === "title") {
        updateTitleIdle();
        return;
      }

      if (game.screen === "hiddenMessage") {
        updateHiddenMessage();
        return;
      }

      if (game.screen === "highScore") {
        updateHighScoreScreen();
        return;
      }

      if (game.screen === "fullGameOver") {
        updateFullGameOverScreen();
        return;
      }

      if (game.screen === "stageSelectClosing") {
        game.transitionTimer -= 1;
        if (game.transitionTimer <= 0) game.screen = "stageSelect";
        return;
      }

      if (game.screen === "stageSelect") {
        updateStageSelectControls();
        return;
      }

      if (game.screen === "stageClearClosing") {
        game.transitionTimer -= 1;
        if (game.transitionTimer <= 0) finishStageClearClosing();
        return;
      }

      if (game.screen === "stageIntro") {
        game.transitionTimer -= 1;
        if (game.transitionTimer <= 0) {
          game.screen = "playing";
          resetFrameCounterHigh();
          syncMovementAudio();
        }
        return;
      }

      if (game.screen === "stageClear") {
        var previousVisibleKills = stageResultVisibleKillCount(stageClearPresentation());
        game.stageClearElapsed += 1;
        var presentation = stageClearPresentation();
        if (stageResultVisibleKillCount(presentation) > previousVisibleKills) playSound("scoreCount");
        if (
          game.stageResultReason === "clear" &&
          !game.stageClearBonusAwarded &&
          game.stageClearElapsed >= presentation.bonusRevealFrame
        ) {
          awardPendingStageClearBonus();
        }
        game.transitionTimer -= 1;
        updateExplosions();
        updateScorePopups();
        if (game.transitionTimer <= 0) finishStageResult();
        return;
      }

      if (game.screen === "gameOver") {
        if (game.gameOverTimer <= 0) {
          finishGameOverScreen();
          return;
        }
        updateBattle({ playerInputEnabled: false, checkEnding: false });
        game.gameOverTimer -= 1;
        return;
      }

      if (game.screen === "editor") {
        updateEditorControls();
        return;
      }

      if (game.screen !== "playing") return;
      if (game.paused) {
        game.pauseElapsed += 1;
        updateScorePopups();
        checkEndState();
        syncMovementAudio();
        return;
      }

      updateBattle();
    }

    var api = { updateFrame: updateFrame };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupScreenUpdateRuntime: setupScreenUpdateRuntime });
});
