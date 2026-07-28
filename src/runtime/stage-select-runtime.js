(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.stageSelectRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function requireInputs(state, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!state.keys || typeof state.keys.has !== "function") {
      throw new Error("state.keys must provide has");
    }
    if (!state.pendingStageSelectPresses || typeof state.pendingStageSelectPresses.clear !== "function") {
      throw new Error("state.pendingStageSelectPresses must provide clear");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!callbacks || typeof callbacks.changeStageSelection !== "function") {
      throw new Error("callbacks.changeStageSelection must be a function");
    }
  }

  /** Owns the fixed-frame A/B input cadence used by the stage-selection screen. */
  function setupStageSelectRuntime(state, deps, callbacks) {
    requireInputs(state, callbacks);

    var game = state.game;
    var keys = state.keys;
    var pendingStageSelectPresses = state.pendingStageSelectPresses;
    var changeStageSelection = callbacks.changeStageSelection;

    function stageSelectAHeld(input) {
      return input.has("Space") || input.has("KeyZ");
    }

    function stageSelectBHeld(input) {
      return input.has("KeyF") || input.has("KeyX");
    }

    function updateStageSelectControls() {
      var aPressed = stageSelectAHeld(pendingStageSelectPresses);
      var bPressed = stageSelectBHeld(pendingStageSelectPresses);
      pendingStageSelectPresses.clear();
      var repeatFrame = (game.frameLow & 0x07) === 0;
      if (aPressed || (repeatFrame && stageSelectAHeld(keys))) {
        changeStageSelection(1);
        return;
      }
      if (bPressed || (repeatFrame && stageSelectBHeld(keys))) changeStageSelection(-1);
    }

    var api = {
      stageSelectAHeld: stageSelectAHeld,
      stageSelectBHeld: stageSelectBHeld,
      updateStageSelectControls: updateStageSelectControls
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupStageSelectRuntime: setupStageSelectRuntime });
});
