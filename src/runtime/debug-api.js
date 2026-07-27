(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.debugApi = api;
})(typeof window !== "undefined" ? window : globalThis, function () {

  function setupDebugApi(state, deps) {
    var game = state.game;
    var {
      createAudioDiagnostics,
      createCombatDiagnostics,
      createEffectDiagnostics,
      createEnemyDiagnostics,
      createEnemySpawnOverlapDiagnostics,
      createPanelDiagnostics,
      createPauseDiagnostics,
      createPlayerLifecycleDiagnostics,
      createPlayerMovementDiagnostics,
      createPowerUpDiagnostics,
      createPublicApiAdapters,
      createScoreDiagnostics,
      createScreenFlowDiagnostics,
      createStageFlowDiagnostics,
      createStageResultDiagnostics,
      createTerrainDiagnostics,
      createTimerDiagnostics,
      createUpgradeDiagnostics,
      createWallDiagnostics
    } = deps;
    var gameSettings = function () {
      return state.fn.gameSettings.apply(state.fn, arguments);
    };
    var enemyTypeDefinitions = function () {
      return state.fn.enemyTypeDefinitions.apply(state.fn, arguments);
    };
    var publicAdapters = createPublicApiAdapters(state, deps);

    window.TankDefender8 = {
      ...publicAdapters.packLoading,
      ...createAudioDiagnostics(state, deps),
      ...publicAdapters.packInfo,
      ...createPauseDiagnostics(state, deps),
      ...createScreenFlowDiagnostics(state, deps),
      ...publicAdapters.snapshot,
      ...createWallDiagnostics(state, deps),
      ...createEnemyDiagnostics(state, deps),
      ...createTimerDiagnostics(state, deps),
      ...createEnemySpawnOverlapDiagnostics(state, deps),
      ...createPowerUpDiagnostics(state, deps),
      ...createScoreDiagnostics(state, deps),
      ...createUpgradeDiagnostics(state, deps),
      ...createPlayerLifecycleDiagnostics(state, deps),
      ...createCombatDiagnostics(state, deps),
      ...createPlayerMovementDiagnostics(state, deps),
      ...createTerrainDiagnostics(state, deps),
      ...createEffectDiagnostics(state, deps),
      ...createPanelDiagnostics(state, deps),
      ...createStageFlowDiagnostics(state, deps),
      ...createStageResultDiagnostics({
        getGameSettings: gameSettings,
        getEnemyTypes: enemyTypeDefinitions,
        getStageClearElapsed: function () { return game.stageClearElapsed; },
        getStageClearBonusAwarded: function () { return game.stageClearBonusAwarded; }
      }),
      ...publicAdapters.schema
    };
  }

  return { setupDebugApi: setupDebugApi };
});
