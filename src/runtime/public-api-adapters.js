(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const api = factory();
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.publicApiAdapters = api;
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
      ...bindFunctions(state.fn),
      game: state.game,
      stageRuntime: state.stageRuntime
    };
  }

  function createPublicApiAdapters(state, deps) {
    const scope = createRuntimeScope(state, deps);
    const {
      cloneSpriteManifest,
      createCurrentPackInfo,
      createDebugSnapshot,
      createStagePackSchema,
      game,
      loadStagePackJsonText,
      loadStagePackObject,
      stageRuntime,
      tryNormalizeStagePack
    } = scope;

    return Object.freeze({
      packLoading: Object.freeze({
        loadStagePack(pack) {
          return loadStagePackObject(pack).ok;
        },
        loadStagePackJson(text) {
          return loadStagePackJsonText(text);
        },
        validateStagePack(pack) {
          const result = tryNormalizeStagePack(pack);
          return { ok: result.ok, error: result.error };
        }
      }),
      packInfo: Object.freeze({
        spriteManifest() {
          return cloneSpriteManifest();
        },
        currentPackInfo() {
          return createCurrentPackInfo(game, stageRuntime);
        }
      }),
      snapshot: Object.freeze({
        debugSnapshot() {
          return createDebugSnapshot(state);
        }
      }),
      schema: Object.freeze({
        stagePackSchema() {
          return createStagePackSchema();
        }
      })
    });
  }

  return Object.freeze({ createPublicApiAdapters });
});
