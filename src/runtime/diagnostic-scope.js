(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.diagnosticScope = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function bindFunctions(source) {
    if (!source || typeof source !== "object") return {};
    return Object.fromEntries(
      Object.entries(source)
        .filter((entry) => typeof entry[1] === "function")
        .map((entry) => [entry[0], entry[1].bind(source)])
    );
  }

  /**
   * Builds a fresh scope after the owning adapter validates its inputs.
   * Shared values overlay dependencies; callbacks keep their original receivers,
   * with state.fn taking precedence over stageRuntime and then deps.
   * Each adapter adds its own live state references after this common projection.
   */
  function createDiagnosticScope(state, deps) {
    return {
      ...deps,
      ...deps.sharedState,
      ...bindFunctions(deps),
      ...bindFunctions(state.stageRuntime),
      ...bindFunctions(state.fn)
    };
  }

  return Object.freeze({ createDiagnosticScope });
});
