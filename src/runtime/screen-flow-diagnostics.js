(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.screenFlowDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /** Preserves each legacy adapter's receiver while building an explicit probe scope. */
  function bindFunctions(source) {
    if (!source || typeof source !== "object") return {};
    return Object.fromEntries(
      Object.entries(source)
        .filter(function (entry) { return typeof entry[1] === "function"; })
        .map(function (entry) { return [entry[0], entry[1].bind(source)]; })
    );
  }

  function requireInputs(state, deps) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!state.audio || typeof state.audio !== "object") {
      throw new Error("state.audio must be an object");
    }
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (!deps.sharedState || typeof deps.sharedState !== "object") {
      throw new Error("deps.sharedState must be an object");
    }
  }

  function createRuntimeScope(state, deps) {
    requireInputs(state, deps);
    return {
      ...deps,
      ...deps.sharedState,
      ...bindFunctions(deps),
      ...bindFunctions(state.stageRuntime),
      ...bindFunctions(state.fn),
      game: state.game,
      keys: state.keys,
      pendingStageSelectPresses: state.pendingStageSelectPresses,
      gameOverAudio: state.audio.gameOver,
      highScoreAudio: state.audio.highScore
    };
  }

  /** Composes the ordered title, demo, high-score, and Game Over probes. */
  function createScreenFlowDiagnostics(state, deps) {
    var scope = createRuntimeScope(state, deps);
    var createScreenFlowNavigationDiagnostics = scope.createScreenFlowNavigationDiagnostics;
    var createScreenFlowTitleDemoDiagnostics = scope.createScreenFlowTitleDemoDiagnostics;
    var createScreenFlowPostGameDiagnostics = scope.createScreenFlowPostGameDiagnostics;

    return Object.freeze({
      ...createScreenFlowNavigationDiagnostics(scope),
      ...createScreenFlowTitleDemoDiagnostics(scope),
      ...createScreenFlowPostGameDiagnostics(scope)
    });
  }

  return Object.freeze({ createScreenFlowDiagnostics: createScreenFlowDiagnostics });
});
