(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.stagePackLifecycleRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var CALLBACK_NAMES = [
    "clearTransientBattleState",
    "resetBattleRandom",
    "resetTitleIdleTimer"
  ];

  function requireInputs(state, deps, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.game || typeof state.game !== "object") throw new Error("state.game must be an object");
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!state.stageRuntime || typeof state.stageRuntime.createStageGrid !== "function") {
      throw new Error("state.stageRuntime.createStageGrid must be a function");
    }
    if (!deps || typeof deps !== "object") throw new Error("deps must be an object");
    if (typeof deps.parseJsonText !== "function") throw new Error("deps.parseJsonText must be a function");
    if (typeof deps.prepareBattleGrid !== "function") throw new Error("deps.prepareBattleGrid must be a function");
    if (typeof deps.tryNormalizeStagePack !== "function") {
      throw new Error("deps.tryNormalizeStagePack must be a function");
    }
    if (!deps.TILE_TYPES || deps.TILE_TYPES.BRICK === undefined) {
      throw new Error("deps.TILE_TYPES.BRICK must be defined");
    }
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    for (var i = 0; i < CALLBACK_NAMES.length; i += 1) {
      var name = CALLBACK_NAMES[i];
      if (typeof callbacks[name] !== "function") {
        throw new Error("callbacks." + name + " must be a function");
      }
    }
  }

  /** Owns stage-pack parsing, activation, and restoration of the built-in pack. */
  function setupStagePackLifecycleRuntime(state, deps, callbacks) {
    requireInputs(state, deps, callbacks);

    var game = state.game;
    var fn = state.fn;
    var resetTitleIdleTimer = callbacks.resetTitleIdleTimer;
    var resetBattleRandom = callbacks.resetBattleRandom;
    var clearTransientBattleState = callbacks.clearTransientBattleState;

    function loadStagePackJsonText(text) {
      var parsed = deps.parseJsonText(text);
      return parsed.ok
        ? loadStagePackObject(parsed.value)
        : { ok: false, error: parsed.error };
    }

    function loadStagePackObject(pack) {
      var result = deps.tryNormalizeStagePack(pack);
      if (!result.ok) return { ok: false, error: result.error };
      applyStagePack(result.pack);
      return { ok: true, error: "" };
    }

    function applyStagePack(pack) {
      game.stagePack = pack;
      game.stage = 1;
      game.titleMenu = 0;
      resetTitleIdleTimer();
      game.demoMode = false;
      game.constructionUsed = false;
      game.constructionVisits = 0;
      game.hiddenInputCount = 0;
      game.hiddenMessageElapsed = 0;
      game.customGrid = null;
      game.constructedGrid = null;
      game.constructionStageActive = false;
      game.grid = state.stageRuntime.createStageGrid(game.stage);
      deps.prepareBattleGrid(game.grid);
      game.editorGrid = null;
      game.editorCursor = { qc: -1, qr: -1 };
      game.editorPattern = 0;
      game.editorPatternArmed = false;
      game.editorMoveHoldTimer = 0;
      game.editorTick = 0;
      game.editorBrush = deps.TILE_TYPES.BRICK;
      game.stageSelectPlayers = 1;
      game.screen = "title";
      game.paused = false;
      resetBattleRandom();
      clearTransientBattleState();
    }

    function restoreBuiltInStagePack() {
      applyStagePack(state.builtInStagePack);
    }

    var api = {
      applyStagePack: applyStagePack,
      loadStagePackJsonText: loadStagePackJsonText,
      loadStagePackObject: loadStagePackObject,
      restoreBuiltInStagePack: restoreBuiltInStagePack
    };
    Object.assign(fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupStagePackLifecycleRuntime: setupStagePackLifecycleRuntime });
});
