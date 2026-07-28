(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.screenTransitionRenderRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = [
    "drawText",
    "drawTextClipped",
    "gameSettings",
    "renderBase",
    "renderGameBackdrop",
    "renderTitle"
  ];

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") throw new Error("state.game must be an object");
    if (!state.ctx || typeof state.ctx !== "object") throw new Error("state.ctx must be an object");
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!deps.sharedState || typeof deps.sharedState !== "object") {
      throw new Error("deps.sharedState must be an object");
    }
    if (typeof deps.stageIntroCurtainState !== "function") {
      throw new Error("deps.stageIntroCurtainState must be a function");
    }
    if (typeof deps.stageSelectCurtainState !== "function") {
      throw new Error("deps.stageSelectCurtainState must be a function");
    }
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    for (var i = 0; i < CALLBACK_NAMES.length; i += 1) {
      var name = CALLBACK_NAMES[i];
      if (typeof callbacks[name] !== "function") {
        throw new Error("callbacks." + name + " must be a function");
      }
    }
  }

  /** Owns stage-selection, stage-intro, and curtain Canvas rendering. */
  function setupScreenTransitionRenderRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var ctx = state.ctx;
    var game = state.game;
    var shared = deps.sharedState;
    var screenWidth = shared.SCREEN_W;
    var screenHeight = shared.SCREEN_H;
    var drawText = callbacks.drawText;
    var drawTextClipped = callbacks.drawTextClipped;
    var gameSettings = callbacks.gameSettings;
    var renderBase = callbacks.renderBase;
    var renderGameBackdrop = callbacks.renderGameBackdrop;
    var renderTitle = callbacks.renderTitle;
    var selectStageIntroCurtainState = deps.stageIntroCurtainState;
    var selectStageSelectCurtainState = deps.stageSelectCurtainState;

    function renderStageSelect() {
      ctx.fillStyle = "#6b6f78";
      ctx.fillRect(0, 0, screenWidth, screenHeight);
      drawText("STAGE", 96, 112, 1, "#15161a");
      drawText(String(game.stage), 152, 112, 1, "#15161a");
    }

    function renderStageSelectClosing() {
      renderTitle();
      renderCurtain(stageSelectCurtainState());
    }

    function renderStageIntro() {
      renderGameBackdrop(game.grid);
      renderBase();
      var curtain = stageIntroCurtainState();
      renderCurtain(curtain);
      var clips = [curtain.top, curtain.bottom].filter(function (rect) { return rect.h > 0; });
      drawTextClipped("STAGE", 96, 112, 1, "#15161a", clips);
      drawTextClipped(String(game.stage), 152, 112, 1, "#15161a", clips);
    }

    function renderCurtain(curtain) {
      ctx.fillStyle = "#6b6f78";
      if (curtain.top.h > 0) ctx.fillRect(curtain.top.x, curtain.top.y, curtain.top.w, curtain.top.h);
      if (curtain.bottom.h > 0) ctx.fillRect(curtain.bottom.x, curtain.bottom.y, curtain.bottom.w, curtain.bottom.h);
    }

    function stageSelectCurtainState(timer) {
      var remaining = timer === undefined ? game.transitionTimer : timer;
      return selectStageSelectCurtainState(remaining, {
        screenWidth: screenWidth,
        screenHeight: screenHeight
      });
    }

    function stageIntroCurtainState(timer) {
      var duration = Math.max(1, gameSettings().timings.stageIntro);
      var remaining = timer === undefined ? game.transitionTimer : timer;
      return selectStageIntroCurtainState(remaining, game.stage, {
        duration: duration,
        screenWidth: screenWidth,
        screenHeight: screenHeight
      });
    }

    var api = {
      renderCurtain: renderCurtain,
      renderStageIntro: renderStageIntro,
      renderStageSelect: renderStageSelect,
      renderStageSelectClosing: renderStageSelectClosing,
      stageIntroCurtainState: stageIntroCurtainState,
      stageSelectCurtainState: stageSelectCurtainState
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupScreenTransitionRenderRuntime: setupScreenTransitionRenderRuntime });
});
