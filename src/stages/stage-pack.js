(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const modules = isCommonJs ? null : (root.TankDefender8Modules || {});
  const dependencies = {
    gameSessionSettings: isCommonJs ? require("../config/game-session-settings") : modules.gameSessionSettings,
    combatSettings: isCommonJs ? require("../config/combat-settings") : modules.combatSettings,
    enemyAiSettings: isCommonJs ? require("../config/enemy-ai-settings") : modules.enemyAiSettings,
    enemySpawnSettings: isCommonJs ? require("../config/enemy-spawn-settings") : modules.enemySpawnSettings,
    explosionSettings: isCommonJs ? require("../config/explosion-settings") : modules.explosionSettings,
    playerMovementSettings: isCommonJs ? require("../config/player-movement-settings") : modules.playerMovementSettings,
    powerUpSettings: isCommonJs ? require("../config/power-up-settings") : modules.powerUpSettings,
    timingSettings: isCommonJs ? require("../config/timing-settings") : modules.timingSettings,
    stageFlowSettings: isCommonJs ? require("../config/stage-flow-settings") : modules.stageFlowSettings,
    enemyTypes: isCommonJs ? require("../config/enemy-types") : modules.enemyTypes,
    playerUpgrades: isCommonJs ? require("../config/player-upgrades") : modules.playerUpgrades,
    stageGrid: isCommonJs ? require("./stage-grid") : modules.stageGrid,
    stageSettings: isCommonJs ? require("../config/stage-settings") : modules.stageSettings
  };

  for (const [name, dependency] of Object.entries(dependencies)) {
    if (!dependency) throw new Error(`${name} module must load before stage-pack.js`);
  }

  const api = factory(dependencies);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  const browserModules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  browserModules.stagePack = api;
})(typeof window !== "undefined" ? window : globalThis, function (dependencies) {
  "use strict";

  const { normalizeGameSessionSettings } = dependencies.gameSessionSettings;
  const { normalizeFriendlyFire, normalizeProjectileRules } = dependencies.combatSettings;
  const { normalizeEnemyAi } = dependencies.enemyAiSettings;
  const { normalizeEnemySpawnPacing } = dependencies.enemySpawnSettings;
  const { normalizeExplosionRules } = dependencies.explosionSettings;
  const { normalizePlayerMovement } = dependencies.playerMovementSettings;
  const { normalizePowerUpDurations, normalizePowerUpRules } = dependencies.powerUpSettings;
  const { normalizeTimings } = dependencies.timingSettings;
  const { normalizeStageAdvance, normalizeStageClearBonus } = dependencies.stageFlowSettings;
  const { normalizeEnemySequence, normalizeEnemyTypes } = dependencies.enemyTypes;
  const { normalizePlayerUpgradeRules } = dependencies.playerUpgrades;
  const {
    normalizeStageQuadrants,
    normalizeStageRows,
    parseStageQuadrants,
    parseStageRows
  } = dependencies.stageGrid;
  const { normalizeStageSettings } = dependencies.stageSettings;

  /** Composes every independently validated gameplay setting into one runtime contract. */
  function normalizeGameSettings(settings) {
    const source = settings || {};
    const sessionSettings = normalizeGameSessionSettings(settings);
    return {
      initialLives: sessionSettings.initialLives,
      bonusLifeScores: sessionSettings.bonusLifeScores,
      deathPowerLevel: sessionSettings.deathPowerLevel,
      powerUpDurations: normalizePowerUpDurations(source.powerUpDurations),
      powerUpRules: normalizePowerUpRules(source.powerUpRules),
      timings: normalizeTimings(source.timings),
      enemySpawnPacing: normalizeEnemySpawnPacing(source.enemySpawnPacing),
      playerMovement: normalizePlayerMovement(source.playerMovement),
      projectileRules: normalizeProjectileRules(source.projectileRules),
      friendlyFire: normalizeFriendlyFire(source.friendlyFire),
      explosionRules: normalizeExplosionRules(source.explosionRules),
      stageAdvance: normalizeStageAdvance(source.stageAdvance),
      stageClearBonus: normalizeStageClearBonus(source.stageClearBonus),
      enemyAi: normalizeEnemyAi(source.enemyAi),
      playerUpgradeRules: normalizePlayerUpgradeRules(source.playerUpgradeRules),
      timerFreezesEnemyTime: sessionSettings.timerFreezesEnemyTime
    };
  }

  /** Validates a complete external stage pack and builds its runtime lookup helpers. */
  function normalizeStagePack(pack) {
    if (!pack || typeof pack !== "object") throw new Error("stage pack must be an object");
    const totalStages = Number(pack.totalStages);
    const enemyTotalValue = pack.enemyTotal === undefined ? null : Number(pack.enemyTotal);
    if (!Number.isInteger(totalStages) || totalStages < 1) {
      throw new Error("totalStages must be a positive integer");
    }
    if (enemyTotalValue !== null && (!Number.isInteger(enemyTotalValue) || enemyTotalValue < 1)) {
      throw new Error("enemyTotal must be a positive integer");
    }

    const hasMaps = Array.isArray(pack.maps);
    const hasQuadrants = Array.isArray(pack.quadrants);
    if (hasMaps === hasQuadrants) {
      throw new Error("stage pack must contain exactly one of maps or quadrants");
    }
    if (hasMaps && pack.maps.length !== totalStages) {
      throw new Error(`maps must contain exactly ${totalStages} stages`);
    }
    if (hasQuadrants && pack.quadrants.length !== totalStages) {
      throw new Error(`quadrants must contain exactly ${totalStages} stages`);
    }
    if (!Array.isArray(pack.enemies) || pack.enemies.length !== totalStages) {
      throw new Error(`enemies must contain exactly ${totalStages} stages`);
    }

    const enemyTypes = normalizeEnemyTypes(pack.enemyTypes);
    const maps = hasMaps ? pack.maps.map((rows, index) => normalizeStageRows(rows, `maps[${index}]`)) : null;
    const quadrants = hasQuadrants
      ? pack.quadrants.map((rows, index) => normalizeStageQuadrants(rows, `quadrants[${index}]`))
      : null;
    const enemies = pack.enemies.map((sequence, index) =>
      normalizeEnemySequence(sequence, `enemies[${index}]`, enemyTypes.length)
    );
    const stageSettings = normalizeStageSettings(pack.stageSettings, totalStages);
    const gameSettings = normalizeGameSettings(pack.gameSettings);

    return {
      id: String(pack.id || "stage-pack"),
      totalStages,
      enemyTotal: enemyTotalValue || Math.max(...enemies.map((sequence) => sequence.length)),
      enemyTotals: enemies.map((sequence) => sequence.length),
      enemyTypes,
      gameSettings,
      maps,
      quadrants,
      enemies,
      stageSettings,
      createGrid(stage) {
        return this.quadrants
          ? parseStageQuadrants(this.quadrants[stage - 1])
          : parseStageRows(this.maps[stage - 1]);
      },
      enemyAt(stage, index) {
        return this.enemies[stage - 1][index];
      }
    };
  }

  function tryNormalizeStagePack(pack) {
    try {
      return { ok: true, pack: normalizeStagePack(pack), error: "" };
    } catch (error) {
      return { ok: false, pack: null, error: error.message || String(error) };
    }
  }

  return Object.freeze({
    normalizeGameSettings,
    normalizeStagePack,
    tryNormalizeStagePack
  });
});
