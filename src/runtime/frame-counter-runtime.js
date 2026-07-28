(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.frameCounterRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function requireInputs(state, deps) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (typeof deps.advanceFrameCounter !== "function") {
      throw new Error("deps.advanceFrameCounter must be a function");
    }
    if (typeof deps.resetFrameCounter !== "function") {
      throw new Error("deps.resetFrameCounter must be a function");
    }
  }

  /** Owns writes from the pure frame counter into the live fixed-frame state. */
  function setupFrameCounterRuntime(state, deps) {
    requireInputs(state, deps);

    var game = state.game;

    function applyFrameCounter(counter) {
      game.frameLow = counter.frameLow;
      game.frameHigh = counter.frameHigh;
    }

    function advanceFrameCounters() {
      applyFrameCounter(deps.advanceFrameCounter(game));
    }

    function resetFrameCounterLow() {
      applyFrameCounter(deps.resetFrameCounter(game, true, false));
    }

    function resetFrameCounterHigh() {
      applyFrameCounter(deps.resetFrameCounter(game, false, true));
    }

    function resetFrameCounters() {
      applyFrameCounter(deps.resetFrameCounter(game));
    }

    var api = {
      advanceFrameCounters: advanceFrameCounters,
      applyFrameCounter: applyFrameCounter,
      resetFrameCounterHigh: resetFrameCounterHigh,
      resetFrameCounterLow: resetFrameCounterLow,
      resetFrameCounters: resetFrameCounters
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupFrameCounterRuntime: setupFrameCounterRuntime });
});
