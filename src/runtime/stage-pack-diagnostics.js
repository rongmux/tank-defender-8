(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const modules = isCommonJs ? null : (root.TankDefender8Modules || {});
  const dependencies = {
    enemyTypes: isCommonJs ? require("../config/enemy-types") : modules.enemyTypes,
    explosionSettings: isCommonJs ? require("../config/explosion-settings") : modules.explosionSettings,
    playerMovementSettings: isCommonJs
      ? require("../config/player-movement-settings")
      : modules.playerMovementSettings,
    playerUpgrades: isCommonJs ? require("../config/player-upgrades") : modules.playerUpgrades,
    wallDamageRules: isCommonJs ? require("../rules/wall-damage-rules") : modules.wallDamageRules
  };

  for (const [name, dependency] of Object.entries(dependencies)) {
    if (!dependency) throw new Error(`${name} module must load before stage-pack-diagnostics.js`);
  }

  const api = factory(dependencies);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  const browserModules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  browserModules.stagePackDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function (dependencies) {
  "use strict";

  const { cloneEnemyTypes } = dependencies.enemyTypes;
  const { cloneExplosionRules } = dependencies.explosionSettings;
  const { clonePlayerMovementSettings } = dependencies.playerMovementSettings;
  const { clonePlayerUpgradeRules } = dependencies.playerUpgrades;
  const { cloneWallRules } = dependencies.wallDamageRules;

  const DEBUG_PACK_INFO_KEYS = Object.freeze([
    "maxActiveEnemies",
    "initialLives",
    "bonusLifeScores",
    "deathPowerLevel",
    "powerUpDurations",
    "powerUpRules",
    "timings",
    "enemySpawnPacing",
    "playerMovement",
    "projectileRules",
    "friendlyFire",
    "explosionRules",
    "stageAdvance",
    "stageClearBonus",
    "enemyAi",
    "timerFreezesEnemyTime",
    "enemyTypes",
    "playerUpgradeRules",
    "wallRules",
    "playerSpawns",
    "enemySpawns",
    "powerUpSpawns",
    "enemySequence"
  ]);

  function requireDiagnosticInputs(game, stageRuntime) {
    if (!game || typeof game !== "object") throw new Error("game must be an object");
    if (!game.stagePack || typeof game.stagePack !== "object") {
      throw new Error("game.stagePack must be an object");
    }
    if (!stageRuntime || typeof stageRuntime.gameSettings !== "function") {
      throw new Error("stageRuntime must provide stage lookup functions");
    }
  }

  /**
   * Creates the editable stage-pack projection exposed by currentPackInfo().
   * Runtime-owned records are cloned so callers cannot mutate active settings.
   */
  function createCurrentPackInfo(game, stageRuntime) {
    requireDiagnosticInputs(game, stageRuntime);
    const settings = stageRuntime.gameSettings();
    const stage = game.stage;

    return {
      id: game.stagePack.id || "built-in",
      totalStages: stageRuntime.stageCount(),
      stageCycleLimit: stageRuntime.stageCycleLimit(),
      mapDataStage: stageRuntime.mapDataStage(stage),
      enemyDataStage: stageRuntime.enemyDataStage(stage),
      enemyTotal: stageRuntime.enemyTotal(),
      maxActiveEnemies: stageRuntime.maxActiveEnemies(),
      initialLives: settings.initialLives,
      bonusLifeScores: settings.bonusLifeScores.slice(),
      deathPowerLevel: settings.deathPowerLevel,
      powerUpDurations: { ...settings.powerUpDurations },
      powerUpRules: { ...settings.powerUpRules },
      timings: { ...settings.timings },
      enemySpawnPacing: { ...settings.enemySpawnPacing },
      playerMovement: clonePlayerMovementSettings(settings.playerMovement),
      projectileRules: { ...settings.projectileRules },
      friendlyFire: { ...settings.friendlyFire },
      explosionRules: cloneExplosionRules(settings.explosionRules),
      stageAdvance: { ...settings.stageAdvance },
      stageClearBonus: { ...settings.stageClearBonus },
      enemyAi: { ...settings.enemyAi },
      timerFreezesEnemyTime: settings.timerFreezesEnemyTime,
      enemyTypes: cloneEnemyTypes(stageRuntime.enemyTypeDefinitions()),
      playerUpgradeRules: clonePlayerUpgradeRules(settings.playerUpgradeRules),
      wallRules: cloneWallRules(),
      playerSpawns: stageRuntime.currentPlayerSpawns(),
      enemySpawns: stageRuntime.currentEnemySpawns(),
      powerUpSpawns: stageRuntime.currentPowerUpSpawns(),
      enemySequence: stageRuntime.enemySequenceForStage(stage),
      stage
    };
  }

  /** Creates the exact stage-pack field group embedded in debugSnapshot(). */
  function createDebugPackInfo(game, stageRuntime) {
    const current = createCurrentPackInfo(game, stageRuntime);
    return Object.fromEntries(DEBUG_PACK_INFO_KEYS.map((key) => [key, current[key]]));
  }

  return Object.freeze({
    DEBUG_PACK_INFO_KEYS,
    createCurrentPackInfo,
    createDebugPackInfo
  });
});
