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

  var CALLBACK_NAMES = [
    "initAudio",
    "resetFrameCounterLow",
    "resetTitleIdleTimer",
    "startGame"
  ];

  function requireInputs(state, deps, callbacks) {
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
    if (!state.stageRuntime || typeof state.stageRuntime.stageCount !== "function") {
      throw new Error("state.stageRuntime.stageCount must be a function");
    }
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (typeof deps.DEFAULT_ORIGINAL_STAGE_COUNT !== "number") {
      throw new Error("deps.DEFAULT_ORIGINAL_STAGE_COUNT must be a number");
    }
    if (typeof deps.STAGE_CURTAIN_CLOSE_FRAMES !== "number") {
      throw new Error("deps.STAGE_CURTAIN_CLOSE_FRAMES must be a number");
    }
    if (typeof deps.clamp !== "function") throw new Error("deps.clamp must be a function");
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    for (var i = 0; i < CALLBACK_NAMES.length; i += 1) {
      var name = CALLBACK_NAMES[i];
      if (typeof callbacks[name] !== "function") {
        throw new Error("callbacks." + name + " must be a function");
      }
    }
  }

  /** Owns stage-selection entry, range changes, confirmation, and fixed-frame A/B input. */
  function setupStageSelectRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var game = state.game;
    var keys = state.keys;
    var pendingStageSelectPresses = state.pendingStageSelectPresses;
    var initAudio = callbacks.initAudio;
    var resetFrameCounterLow = callbacks.resetFrameCounterLow;
    var resetTitleIdleTimer = callbacks.resetTitleIdleTimer;
    var startGame = callbacks.startGame;

    function beginStageSelect(players) {
      initAudio();
      game.demoMode = false;
      resetTitleIdleTimer();
      game.stageSelectPlayers = players === 2 ? 2 : 1;
      game.stage = 1;
      game.screen = "stageSelectClosing";
      game.paused = false;
      game.transitionTimer = deps.STAGE_CURTAIN_CLOSE_FRAMES;
      pendingStageSelectPresses.clear();
    }

    function startSelectedGame() {
      pendingStageSelectPresses.clear();
      startGame(game.stageSelectPlayers, { stage: game.stage });
    }

    function stageSelectLimit() {
      return Math.max(1, Math.min(deps.DEFAULT_ORIGINAL_STAGE_COUNT, state.stageRuntime.stageCount()));
    }

    function changeStageSelection(delta) {
      var limit = stageSelectLimit();
      resetFrameCounterLow();
      game.stage = deps.clamp(game.stage + delta, 1, limit);
    }

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
      beginStageSelect: beginStageSelect,
      changeStageSelection: changeStageSelection,
      stageSelectAHeld: stageSelectAHeld,
      stageSelectBHeld: stageSelectBHeld,
      stageSelectLimit: stageSelectLimit,
      startSelectedGame: startSelectedGame,
      updateStageSelectControls: updateStageSelectControls
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupStageSelectRuntime: setupStageSelectRuntime });
});
