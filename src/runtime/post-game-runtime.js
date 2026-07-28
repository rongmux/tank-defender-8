(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.postGameRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = [
    "fullGameOverScreenFrames",
    "highScoreScreenFrames",
    "playSound",
    "resetTitleIdleTimer",
    "stopAllAudio",
    "stopGameOverAudio",
    "stopStageResultAudio"
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

  /** Owns the fixed-frame full GAME OVER and high-score screen lifecycle. */
  function setupPostGameRuntime(state, deps, callbacks) {
    requireInputs(state, callbacks);

    var game = state.game;
    var fullGameOverScreenFrames = callbacks.fullGameOverScreenFrames;
    var highScoreScreenFrames = callbacks.highScoreScreenFrames;
    var playSound = callbacks.playSound;
    var resetTitleIdleTimer = callbacks.resetTitleIdleTimer;
    var stopAllAudio = callbacks.stopAllAudio;
    var stopGameOverAudio = callbacks.stopGameOverAudio;
    var stopStageResultAudio = callbacks.stopStageResultAudio;

    function startFullGameOverScreen() {
      stopStageResultAudio();
      game.screen = "fullGameOver";
      game.paused = false;
      game.fullGameOverElapsed = 0;
      playSound("gameOver");
    }

    function updateFullGameOverScreen() {
      game.fullGameOverElapsed += 1;
      if (game.fullGameOverElapsed < fullGameOverScreenFrames()) return;
      finishFullGameOverScreen();
    }

    function handleFullGameOverInput(code) {
      if (code !== "Enter" && code !== "Escape") return false;
      finishFullGameOverScreen();
      return true;
    }

    function finishFullGameOverScreen() {
      stopGameOverAudio();
      if (game.newHighScoreAtGameOver) {
        startHighScoreScreen();
        return;
      }
      returnToTitleAfterGame();
    }

    function startHighScoreScreen() {
      game.screen = "highScore";
      game.paused = false;
      game.highScoreScreenElapsed = 0;
      playSound("highScore");
    }

    function updateHighScoreScreen() {
      game.highScoreScreenElapsed += 1;
      if (game.highScoreScreenElapsed < highScoreScreenFrames()) return;
      returnToTitleAfterGame();
    }

    function returnToTitleAfterGame() {
      stopAllAudio();
      game.screen = "title";
      game.paused = false;
      game.newHighScoreAtGameOver = false;
      game.fullGameOverElapsed = 0;
      game.highScoreScreenElapsed = 0;
      game.stageResultReason = "clear";
      game.constructionUsed = false;
      game.constructionVisits = 0;
      game.hiddenInputCount = 0;
      resetTitleIdleTimer();
    }

    var api = {
      startFullGameOverScreen: startFullGameOverScreen,
      updateFullGameOverScreen: updateFullGameOverScreen,
      handleFullGameOverInput: handleFullGameOverInput,
      finishFullGameOverScreen: finishFullGameOverScreen,
      startHighScoreScreen: startHighScoreScreen,
      updateHighScoreScreen: updateHighScoreScreen,
      returnToTitleAfterGame: returnToTitleAfterGame
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupPostGameRuntime: setupPostGameRuntime });
});
