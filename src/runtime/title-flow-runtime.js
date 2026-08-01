(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.titleFlowRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function requireInputs(state, deps) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") throw new Error("state.game must be an object");
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!state.keys || typeof state.keys.has !== "function") throw new Error("state.keys must support has");
    if (!state.pendingFirePresses || typeof state.pendingFirePresses.clear !== "function") {
      throw new Error("state.pendingFirePresses must support clear");
    }
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!deps.sharedState || typeof deps.sharedState !== "object") {
      throw new Error("deps.sharedState must be an object");
    }
    if (typeof deps.clamp !== "function") throw new Error("deps.clamp must be a function");
  }

  /** Owns the title idle counter and the hidden-message input, timeline, and presentation. */
  function setupTitleFlowRuntime(state, deps) {
    requireInputs(state, deps);

    var game = state.game;
    var fn = state.fn;
    var sh = deps.sharedState;

    function updateTitleIdle() {
      if (game.constructionUsed || game.demoMode) return;
      game.titleIdleFrames += 1;
      if (game.frameHigh === 0x0a) fn.startTitleDemo();
    }

    function resetTitleIdleTimer() {
      game.titleIdleFrames = 0;
      fn.resetFrameCounterHigh();
    }

    function resetTitleIdleHighByte() {
      game.titleIdleFrames = 0;
      fn.resetFrameCounterHigh();
    }

    function hiddenMessageTriggerReady() {
      return game.constructionVisits === sh.HIDDEN_MESSAGE_REQUIRED_VISITS &&
        game.hiddenInputCount === 0x74;
    }

    function reserveTitleDirectionForHiddenInput(code) {
      return game.screen === "title" &&
        game.constructionVisits === sh.HIDDEN_MESSAGE_REQUIRED_VISITS &&
        (code === "ArrowDown" || code === "ArrowRight");
    }

    function recordHiddenTitleInput(code) {
      if (game.screen !== "title" || game.constructionVisits !== sh.HIDDEN_MESSAGE_REQUIRED_VISITS) return false;
      if (code === "KeyF" && state.keys.has("ArrowDown")) {
        game.hiddenInputCount = (game.hiddenInputCount + 0x10) & 0xff;
        return true;
      }
      if (code === "KeyG" && state.keys.has("ArrowRight")) {
        game.hiddenInputCount = (game.hiddenInputCount - 1) & 0xff;
        return true;
      }
      return false;
    }

    function startHiddenMessage() {
      game.screen = "hiddenMessage";
      game.paused = false;
      game.demoMode = false;
      game.hiddenMessageElapsed = 0;
      state.pendingFirePresses.clear();
    }

    function updateHiddenMessage() {
      game.hiddenMessageElapsed += 1;
      if (game.hiddenMessageElapsed < sh.HIDDEN_MESSAGE_END_FRAME) return;
      game.hiddenInputCount = 0;
      fn.activateTitleMenu();
    }

    function hiddenMessagePresentation(elapsed) {
      var frame = Math.max(0, Math.floor(Number(elapsed) || 0));
      var lines = ["THIS PROGRAM WAS", "WRITTEN BY", "OPEN-REACH", "WHO LOVES NORIKO"];
      var visibleLines = lines.filter(function (line, index) {
        return frame >= sh.HIDDEN_MESSAGE_TEXT_START + index * sh.HIDDEN_MESSAGE_STEP_FRAMES;
      });
      var firstDotFrame = sh.HIDDEN_MESSAGE_TEXT_START + lines.length * sh.HIDDEN_MESSAGE_STEP_FRAMES;
      var dots = frame < firstDotFrame
        ? 0
        : deps.clamp(Math.floor((frame - firstDotFrame) / sh.HIDDEN_MESSAGE_STEP_FRAMES) + 1, 0, 5);
      var drop = null;
      if (frame > sh.HIDDEN_MESSAGE_DROP_START && frame < sh.HIDDEN_MESSAGE_END_FRAME) {
        var age = frame - sh.HIDDEN_MESSAGE_DROP_START;
        if (age <= sh.HIDDEN_MESSAGE_DROP_MORPH_FRAMES) {
          var morphSequence = [3, 2, 1, 0, 1, 2, 3];
          var phase = morphSequence[Math.floor((age - 1) / 4)];
          drop = { x: 120, y: 30, frame: "morph" + phase };
        } else {
          var fallAge = Math.min(sh.HIDDEN_MESSAGE_DROP_FALL_FRAMES, age - sh.HIDDEN_MESSAGE_DROP_MORPH_FRAMES);
          drop = { x: 120, y: 30 + fallAge, frame: "fall" };
        }
      }
      return { frame: frame, visibleLines: visibleLines, dots: dots, drop: drop };
    }

    var api = {
      updateTitleIdle: updateTitleIdle,
      resetTitleIdleTimer: resetTitleIdleTimer,
      resetTitleIdleHighByte: resetTitleIdleHighByte,
      hiddenMessageTriggerReady: hiddenMessageTriggerReady,
      reserveTitleDirectionForHiddenInput: reserveTitleDirectionForHiddenInput,
      recordHiddenTitleInput: recordHiddenTitleInput,
      startHiddenMessage: startHiddenMessage,
      updateHiddenMessage: updateHiddenMessage,
      hiddenMessagePresentation: hiddenMessagePresentation
    };
    Object.assign(fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupTitleFlowRuntime: setupTitleFlowRuntime });
});
