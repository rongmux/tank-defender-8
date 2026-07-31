(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.applicationFlowCompositionRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (typeof deps.requireRuntimeModule !== "function") {
      throw new Error("deps.requireRuntimeModule must be a function");
    }
    if (typeof deps.FULL_GAME_OVER_SCREEN_FRAMES !== "number") {
      throw new Error("deps.FULL_GAME_OVER_SCREEN_FRAMES must be a number");
    }
    if (typeof deps.HIGH_SCORE_SCREEN_FRAMES !== "number") {
      throw new Error("deps.HIGH_SCORE_SCREEN_FRAMES must be a number");
    }
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    if (typeof callbacks.tileTypeName !== "function") {
      throw new Error("callbacks.tileTypeName must be a function");
    }
  }

  /** Owns application-flow runtime setup without mixing it into battle wiring. */
  function setupApplicationFlowCompositionRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var fn = state.fn;
    deps.requireRuntimeModule("gameLifecycle").setupGameLifecycle(state, deps);
    deps.requireRuntimeModule("audioBridge").setupAudioBridge(state, deps);
    deps.requireRuntimeModule("editorInputRuntime").setupEditorInputRuntime(state, deps, {
      playSound: fn.playSound,
      showEditorMessage: fn.showEditorMessage,
      tileTypeName: callbacks.tileTypeName
    });
    deps.requireRuntimeModule("stageSelectRuntime").setupStageSelectRuntime(state, deps, {
      changeStageSelection: fn.changeStageSelection
    });
    deps.requireRuntimeModule("postGameRuntime").setupPostGameRuntime(state, deps, {
      fullGameOverScreenFrames: function () { return deps.FULL_GAME_OVER_SCREEN_FRAMES; },
      highScoreScreenFrames: function () { return deps.HIGH_SCORE_SCREEN_FRAMES; },
      playSound: fn.playSound,
      resetTitleIdleTimer: fn.resetTitleIdleTimer,
      stopAllAudio: fn.stopAllAudio,
      stopGameOverAudio: fn.stopGameOverAudio,
      stopStageResultAudio: fn.stopStageResultAudio
    });

    return Object.freeze({});
  }

  return Object.freeze({
    setupApplicationFlowCompositionRuntime: setupApplicationFlowCompositionRuntime
  });
});
