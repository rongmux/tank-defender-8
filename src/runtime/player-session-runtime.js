(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }
  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.playerSessionRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function requireInputs(state, deps) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!state.stageRuntime || typeof state.stageRuntime.gameSettings !== "function") {
      throw new Error("state.stageRuntime.gameSettings must be a function");
    }
    if (typeof state.stageRuntime.playerSpawnPoint !== "function") {
      throw new Error("state.stageRuntime.playerSpawnPoint must be a function");
    }
    if (typeof state.stageRuntime.enemyTypeDefinitions !== "function") {
      throw new Error("state.stageRuntime.enemyTypeDefinitions must be a function");
    }
    if (!deps || typeof deps.createPlayerState !== "function") {
      throw new Error("deps.createPlayerState must be a function");
    }
    if (typeof deps.resetPlayerState !== "function") throw new Error("deps.resetPlayerState must be a function");
    if (deps.UP === undefined) throw new Error("deps.UP must be defined");
  }

  /** Owns player records created for a game session and their stage-position resets. */
  function setupPlayerSessionRuntime(state, deps) {
    requireInputs(state, deps);
    var runtime = state.stageRuntime;
    function createPlayer(id) {
      return deps.createPlayerState({
        id: id,
        spawn: runtime.playerSpawnPoint(id),
        settings: runtime.gameSettings(),
        enemyTypeCount: runtime.enemyTypeDefinitions().length,
        direction: deps.UP
      });
    }
    function resetPlayerPosition(player) {
      deps.resetPlayerState(player, { settings: runtime.gameSettings(), direction: deps.UP });
    }
    var api = { createPlayer: createPlayer, resetPlayerPosition: resetPlayerPosition };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }
  return Object.freeze({ setupPlayerSessionRuntime: setupPlayerSessionRuntime });
});
