(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const modules = isCommonJs ? null : (root.TankDefender8Modules || {});
  const dependencies = {
    enemySequences: isCommonJs ? require("./enemy-sequences") : modules.enemySequences,
    enemyTypes: isCommonJs ? require("../config/enemy-types") : modules.enemyTypes,
    proceduralStage: isCommonJs ? require("./procedural-stage") : modules.proceduralStage,
    stageGrid: isCommonJs ? require("./stage-grid") : modules.stageGrid,
    stageRouting: isCommonJs ? require("./stage-routing") : modules.stageRouting,
    stageSettings: isCommonJs ? require("../config/stage-settings") : modules.stageSettings
  };

  for (const [name, dependency] of Object.entries(dependencies)) {
    if (!dependency) throw new Error(`${name} module must load before stage-runtime.js`);
  }

  const api = factory(dependencies);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  const browserModules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  browserModules.stageRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function (dependencies) {
  "use strict";

  const { DEFAULT_ENEMY_TOTAL, DEFAULT_ORIGINAL_STAGE_COUNT } = dependencies.enemySequences;
  const { DEFAULT_ENEMY_TYPES } = dependencies.enemyTypes;
  const { buildProceduralStage } = dependencies.proceduralStage;
  const { parseStageQuadrants, parseStageRows } = dependencies.stageGrid;
  const {
    resolveEnemyTotal,
    resolveMaxActiveEnemies,
    resolveStageRoute
  } = dependencies.stageRouting;
  const {
    DEFAULT_ENEMY_SPAWNS,
    DEFAULT_MAX_ACTIVE_ENEMIES,
    DEFAULT_MAX_ACTIVE_ENEMIES_TWO_PLAYER,
    DEFAULT_PLAYER_SPAWNS,
    DEFAULT_POWERUP_SPAWNS,
    pixelToTilePoint,
    powerUpPixelToTilePoint
  } = dependencies.stageSettings;

  /** Binds pure stage-domain lookups to a dynamically read runtime state object. */
  function createStageRuntime(options) {
    const source = options || {};
    if (typeof source.getState !== "function") throw new Error("getState must be a function");
    if (!source.builtInStagePack || typeof source.builtInStagePack !== "object") {
      throw new Error("builtInStagePack must be an object");
    }
    const builtInStagePack = source.builtInStagePack;
    const demoMaxActiveEnemies = Math.max(
      1,
      Math.floor(Number(source.demoMaxActiveEnemies) || DEFAULT_MAX_ACTIVE_ENEMIES)
    );

    function state() {
      return source.getState() || {};
    }

    function activePack(currentState) {
      return currentState.stagePack || builtInStagePack;
    }

    function stageRoute(stage) {
      const currentState = state();
      const pack = activePack(currentState);
      return resolveStageRoute({
        stage,
        currentStage: currentState.stage,
        totalStages: pack.totalStages || builtInStagePack.totalStages,
        stageAdvance: (pack.gameSettings || builtInStagePack.gameSettings).stageAdvance
          || builtInStagePack.gameSettings.stageAdvance,
        originalStageCount: DEFAULT_ORIGINAL_STAGE_COUNT
      });
    }

    function stageCount() {
      return stageRoute().stageCount;
    }

    function stageCycleLimit() {
      return stageRoute().stageCycleLimit;
    }

    function isExtendedLoopStage(stage) {
      return stageRoute(stage).isExtendedLoopStage;
    }

    function mapDataStage(stage) {
      return stageRoute(stage).mapDataStage;
    }

    function enemyDataStage(stage) {
      return stageRoute(stage).enemyDataStage;
    }

    function enemyTotal(stage) {
      const currentState = state();
      const pack = activePack(currentState);
      return resolveEnemyTotal(pack, enemyDataStage(stage || currentState.stage), DEFAULT_ENEMY_TOTAL);
    }

    function maxActiveEnemies(stage, players) {
      const currentState = state();
      if (currentState.demoMode) return demoMaxActiveEnemies;
      const pack = activePack(currentState);
      const playerCount = Math.max(1, Math.floor(Number(players) || currentState.playerCount || 1));
      return resolveMaxActiveEnemies(pack, mapDataStage(stage || currentState.stage), playerCount, {
        onePlayer: DEFAULT_MAX_ACTIVE_ENEMIES,
        twoPlayer: DEFAULT_MAX_ACTIVE_ENEMIES_TWO_PLAYER
      });
    }

    function gameSettings() {
      const pack = activePack(state());
      return pack.gameSettings || builtInStagePack.gameSettings;
    }

    function enemyTypeDefinitions() {
      const pack = activePack(state());
      return pack.enemyTypes || builtInStagePack.enemyTypes || DEFAULT_ENEMY_TYPES;
    }

    function stageSettings(stage) {
      const currentState = state();
      const pack = activePack(currentState);
      const stageIndex = mapDataStage(stage || currentState.stage) - 1;
      return pack.stageSettings && pack.stageSettings[stageIndex] ? pack.stageSettings[stageIndex] : null;
    }

    function playerSpawnPoint(id, stage) {
      const settings = stageSettings(stage);
      const spawns = settings ? settings.playerSpawns : DEFAULT_PLAYER_SPAWNS;
      return spawns[id - 1] || DEFAULT_PLAYER_SPAWNS[id - 1] || DEFAULT_PLAYER_SPAWNS[0];
    }

    function enemySpawnPoint(index, stage) {
      const settings = stageSettings(stage);
      const spawns = settings ? settings.enemySpawns : DEFAULT_ENEMY_SPAWNS;
      return spawns[index]
        || spawns[index % spawns.length]
        || DEFAULT_ENEMY_SPAWNS[index % DEFAULT_ENEMY_SPAWNS.length];
    }

    function currentPlayerSpawns() {
      const settings = stageSettings();
      return (settings ? settings.playerSpawns : DEFAULT_PLAYER_SPAWNS).map(pixelToTilePoint);
    }

    function currentEnemySpawns() {
      const settings = stageSettings();
      return (settings ? settings.enemySpawns : DEFAULT_ENEMY_SPAWNS).map(pixelToTilePoint);
    }

    function currentPowerUpSpawns() {
      const settings = stageSettings();
      return (settings ? settings.powerUpSpawns : DEFAULT_POWERUP_SPAWNS).map(powerUpPixelToTilePoint);
    }

    function createStageGrid(stage) {
      const currentState = state();
      const pack = activePack(currentState);
      const dataStage = mapDataStage(stage);
      if (typeof pack.createGrid === "function") return pack.createGrid(dataStage);
      if (pack.quadrants && pack.quadrants[dataStage - 1]) {
        return parseStageQuadrants(pack.quadrants[dataStage - 1]);
      }
      if (pack.maps && pack.maps[dataStage - 1]) return parseStageRows(pack.maps[dataStage - 1]);
      return buildProceduralStage(dataStage);
    }

    function getEnemySpec(stage, index) {
      const currentState = state();
      const pack = activePack(currentState);
      const dataStage = enemyDataStage(stage);
      if (typeof pack.enemyAt === "function") return pack.enemyAt(dataStage, index);
      if (pack.enemies && pack.enemies[dataStage - 1] && pack.enemies[dataStage - 1][index]) {
        return pack.enemies[dataStage - 1][index];
      }
      return builtInStagePack.enemyAt(dataStage, index);
    }

    function enemySequenceForStage(stage) {
      return Array.from({ length: enemyTotal(stage) }, (_, index) => {
        const spec = getEnemySpec(stage, index);
        return {
          typeIndex: spec.typeIndex,
          carrier: Boolean(spec.carrier),
          spawnIndex: spec.spawnIndex,
          powerUpType: spec.powerUpType || null,
          spawnDelay: spec.spawnDelay === undefined ? null : spec.spawnDelay
        };
      });
    }

    return Object.freeze({
      createStageGrid,
      currentEnemySpawns,
      currentPlayerSpawns,
      currentPowerUpSpawns,
      enemyDataStage,
      enemySequenceForStage,
      enemyTotal,
      enemyTypeDefinitions,
      gameSettings,
      getEnemySpec,
      isExtendedLoopStage,
      mapDataStage,
      maxActiveEnemies,
      enemySpawnPoint,
      playerSpawnPoint,
      stageCount,
      stageCycleLimit,
      stageRoute,
      stageSettings
    });
  }

  return Object.freeze({ createStageRuntime });
});
