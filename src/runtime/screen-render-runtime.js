(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.screenRenderRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = [
    "renderEditor",
    "renderFullGameOver",
    "renderGame",
    "renderGameOver",
    "renderHighScore",
    "renderHiddenMessage",
    "renderPause",
    "renderStageClear",
    "renderStageClearClosing",
    "renderStageIntro",
    "renderStageSelect",
    "renderStageSelectClosing",
    "renderTitle"
  ];

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!state.ctx || typeof state.ctx !== "object") throw new Error("state.ctx must be an object");
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!deps.sharedState || typeof deps.sharedState !== "object") {
      throw new Error("deps.sharedState must be an object");
    }
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    for (var i = 0; i < CALLBACK_NAMES.length; i += 1) {
      var name = CALLBACK_NAMES[i];
      if (typeof callbacks[name] !== "function") {
        throw new Error("callbacks." + name + " must be a function");
      }
    }
  }

  /** Owns the screen render route and the battle/Game Over/pause overlay order. */
  function setupScreenRenderRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var ctx = state.ctx;
    var game = state.game;
    var shared = deps.sharedState;
    var renderEditor = callbacks.renderEditor;
    var renderFullGameOver = callbacks.renderFullGameOver;
    var renderGame = callbacks.renderGame;
    var renderGameOver = callbacks.renderGameOver;
    var renderHighScore = callbacks.renderHighScore;
    var renderHiddenMessage = callbacks.renderHiddenMessage;
    var renderPause = callbacks.renderPause;
    var renderStageClear = callbacks.renderStageClear;
    var renderStageClearClosing = callbacks.renderStageClearClosing;
    var renderStageIntro = callbacks.renderStageIntro;
    var renderStageSelect = callbacks.renderStageSelect;
    var renderStageSelectClosing = callbacks.renderStageSelectClosing;
    var renderTitle = callbacks.renderTitle;

    function render() {
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, shared.SCREEN_W, shared.SCREEN_H);

      if (game.screen === "title") renderTitle();
      else if (game.screen === "hiddenMessage") renderHiddenMessage();
      else if (game.screen === "highScore") renderHighScore();
      else if (game.screen === "fullGameOver") renderFullGameOver();
      else if (game.screen === "stageSelectClosing") renderStageSelectClosing();
      else if (game.screen === "stageSelect") renderStageSelect();
      else if (game.screen === "editor") renderEditor();
      else if (game.screen === "stageClear") renderStageClear();
      else if (game.screen === "stageClearClosing") renderStageClearClosing();
      else if (game.screen === "stageIntro") renderStageIntro();
      else {
        renderGame();
        if (game.screen === "gameOver") renderGameOver();
        if (game.paused) renderPause();
      }
    }

    var api = { render: render };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupScreenRenderRuntime: setupScreenRenderRuntime });
});
