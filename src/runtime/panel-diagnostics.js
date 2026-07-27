(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const api = factory();
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.panelDiagnostics = api;
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

  function requireInputs(state, deps) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") {
      throw new Error("state.game must be an object");
    }
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
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
      ...bindFunctions(state.fn)
    };
  }

  function createPanelDiagnostics(state, deps) {
    const scope = createRuntimeScope(state, deps);
    const {
      DEFAULT_ENEMY_TOTAL,
      panelEnemyCounterRemaining,
      panelLifeCount
    } = scope;
    const nonNegativeInteger = (value) => Math.max(0, Math.floor(Number(value) || 0));

    return Object.freeze({
      debugEnemyPanelCounterProbe(spawned, killed, total) {
        const spawnedCount = nonNegativeInteger(spawned);
        const killedCount = nonNegativeInteger(killed);
        const totalCount = total === undefined
          ? DEFAULT_ENEMY_TOTAL
          : nonNegativeInteger(total);
        return {
          spawned: spawnedCount,
          killed: killedCount,
          remaining: panelEnemyCounterRemaining(totalCount, spawnedCount)
        };
      },
      debugPanelLifeCountProbe(lives) {
        const internalLives = nonNegativeInteger(lives);
        return {
          internalLives,
          panelLives: panelLifeCount({ lives: internalLives })
        };
      }
    });
  }

  return Object.freeze({ createPanelDiagnostics });
});
