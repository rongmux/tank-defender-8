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
    // State aliases
    var game = state.game;

    // Audio state aliases

    // Deps aliases (all non-function properties from module-deps)
    var depsAliases = '';
    for (var key in deps) {
      if (deps.hasOwnProperty(key) && typeof deps[key] !== 'function' && key !== 'sharedState') {
        depsAliases += 'var ' + key + ' = deps["' + key.replace(/"/g, '\\"') + '"];';
      }
    }
    eval(depsAliases);

    // CamelCase renames for debug probes (used alongside UPPER_CASE aliases)
    var powerTypes = deps.POWER_UP_TYPES;
    var originalPowerUpRandomTable = deps.ORIGINAL_POWER_UP_RANDOM_TABLE;

    // sharedState property aliases (TILE, SCREEN_W, etc.)
    var shAliases = '';
    var sh = deps.sharedState;
    for (var shKey in sh) {
      if (sh.hasOwnProperty(shKey) && typeof sh[shKey] !== 'function') {
        shAliases += 'var ' + shKey + ' = sh["' + shKey.replace(/"/g, '\\"') + '"];';
      }
    }
    eval(shAliases);

    // Deps function aliases (for functions like clamp, cloneGrid, etc.)
    // Skip functions that already have state.fn versions (manual aliases)
    for (var key2 in deps) {
      if (deps.hasOwnProperty(key2) && typeof deps[key2] === 'function' && key2 !== 'requireRuntimeModule' && !state.fn.hasOwnProperty(key2)) {
        depsAliases += 'function ' + key2 + '() { return deps["' + key2.replace(/"/g, '\\"') + '"].apply(deps, arguments); }';
      }
    }
    eval(depsAliases);

    // Stage-runtime function aliases (from state.stageRuntime)
    var stageAliases = '';
    var sr = state.stageRuntime;
    if (sr) {
      for (var srKey in sr) {
        if (sr.hasOwnProperty(srKey) && typeof sr[srKey] === 'function') {
          stageAliases += 'function ' + srKey + '() { return sr["' + srKey.replace(/"/g, '\\"') + '"].apply(sr, arguments); }';
        }
      }
    }
    eval(stageAliases);

    // Function aliases (delegate to state.fn)
    function render() { return state.fn.render.apply(state.fn, arguments); }
    function gameSettings() { return state.fn.gameSettings.apply(state.fn, arguments); }
    function enemyTypeDefinitions() { return state.fn.enemyTypeDefinitions.apply(state.fn, arguments); }
    function makeGrid() { return state.fn.makeGrid.apply(state.fn, arguments); }
    function cloneGrid() { return state.fn.cloneGrid.apply(state.fn, arguments); }
    function loadStagePackJsonText() { return state.fn.loadStagePackJsonText.apply(state.fn, arguments); }
    function loadStagePackObject() { return state.fn.loadStagePackObject.apply(state.fn, arguments); }
    function hitTerrain() { return state.fn.hitTerrain.apply(state.fn, arguments); }
    function spawnEnemies() { return state.fn.spawnEnemies.apply(state.fn, arguments); }
    function rectHitsSolidTerrain() { return state.fn.rectHitsSolidTerrain.apply(state.fn, arguments); }
    function solidTerrainOverlapArea() { return state.fn.solidTerrainOverlapArea.apply(state.fn, arguments); }
    function drawBrickCell() { return state.fn.drawBrickCell.apply(state.fn, arguments); }
    function drawTank() { return state.fn.drawTank.apply(state.fn, arguments); }
    function scorePopupPresentation() { return state.fn.scorePopupPresentation.apply(state.fn, arguments); }
      window.TankDefender8 = {
        loadStagePack(pack) {
          return loadStagePackObject(pack).ok;
        },
        loadStagePackJson(text) {
          return loadStagePackJsonText(text);
        },
        validateStagePack(pack) {
          const result = tryNormalizeStagePack(pack);
          return { ok: result.ok, error: result.error };
        },
        ...createAudioDiagnostics(state, deps),
        spriteManifest() {
          return cloneSpriteManifest();
        },
        currentPackInfo() {
          return createCurrentPackInfo(game, state.stageRuntime);
        },
        ...createPauseDiagnostics(state, deps),
        ...createScreenFlowDiagnostics(state, deps),
        debugSnapshot() {
          return createDebugSnapshot(state);
        },
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
          getStageClearElapsed: () => game.stageClearElapsed,
          getStageClearBonusAwarded: () => game.stageClearBonusAwarded
        }),
        stagePackSchema() {
          return createStagePackSchema();
        }
      };

  }

  return { setupDebugApi: setupDebugApi };
});
