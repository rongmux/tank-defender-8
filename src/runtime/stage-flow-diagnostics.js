(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.stageFlowDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

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
      ...deps.createDiagnosticScope(state, deps),
      game: state.game,
      builtInStagePack: state.builtInStagePack,
      keys: state.keys,
      pendingFirePresses: state.pendingFirePresses,
      movementAudio: state.movementAudio,
      stageStartAudio: state.audio.stageStart,
      pauseAudio: state.audio.pause
    };
  }

  /** Builds the ordered stage-flow diagnostic surface from focused probe modules. */
  function createStageFlowDiagnostics(state, deps) {
    const scope = createRuntimeScope(state, deps);
    const {
      createStageFlowGameOverDiagnostics,
      createStageFlowProgressionDiagnostics,
      createStageFlowTransitionDiagnostics
    } = scope;

    return Object.freeze({
      ...createStageFlowTransitionDiagnostics(scope),
      ...createStageFlowProgressionDiagnostics(scope),
      ...createStageFlowGameOverDiagnostics(scope)
    });
  }

  return Object.freeze({ createStageFlowDiagnostics });
});
