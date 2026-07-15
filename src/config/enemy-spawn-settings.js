(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const valueNormalization = isCommonJs
    ? require("./value-normalization")
    : (root.TankDefender8Modules || {}).valueNormalization;
  if (!valueNormalization) throw new Error("valueNormalization module must load before enemy-spawn-settings.js");

  const api = factory(valueNormalization);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.enemySpawnSettings = api;
})(typeof window !== "undefined" ? window : globalThis, function (valueNormalization) {
  "use strict";

  const { normalizeNumber } = valueNormalization;
  const DEFAULT_ENEMY_SPAWN_PACING = Object.freeze({
    firstDelay: 0,
    baseDelay: 190,
    stageStep: 4,
    minDelay: 50,
    extendedLoopMinDelay: 50,
    twoPlayerDelayReduction: 20
  });

  /** Normalizes stage pacing and the legacy two-player multiplier alternative. */
  function normalizeEnemySpawnPacing(pacing) {
    const source = pacing || {};
    if (typeof source !== "object") throw new Error("gameSettings.enemySpawnPacing must be an object");
    const normalized = {
      firstDelay: normalizeNumber(source.firstDelay, DEFAULT_ENEMY_SPAWN_PACING.firstDelay, 0, 3600, true, "gameSettings.enemySpawnPacing.firstDelay"),
      baseDelay: normalizeNumber(source.baseDelay, DEFAULT_ENEMY_SPAWN_PACING.baseDelay, 0, 3600, true, "gameSettings.enemySpawnPacing.baseDelay"),
      stageStep: normalizeNumber(source.stageStep, DEFAULT_ENEMY_SPAWN_PACING.stageStep, 0, 3600, true, "gameSettings.enemySpawnPacing.stageStep"),
      minDelay: normalizeNumber(source.minDelay, DEFAULT_ENEMY_SPAWN_PACING.minDelay, 0, 3600, true, "gameSettings.enemySpawnPacing.minDelay"),
      extendedLoopMinDelay: normalizeNumber(
        source.extendedLoopMinDelay,
        DEFAULT_ENEMY_SPAWN_PACING.extendedLoopMinDelay,
        0,
        3600,
        true,
        "gameSettings.enemySpawnPacing.extendedLoopMinDelay"
      )
    };
    if (source.twoPlayerDelayReduction !== undefined || source.twoPlayerDelayMultiplier === undefined) {
      normalized.twoPlayerDelayReduction = normalizeNumber(
        source.twoPlayerDelayReduction,
        DEFAULT_ENEMY_SPAWN_PACING.twoPlayerDelayReduction,
        0,
        3600,
        true,
        "gameSettings.enemySpawnPacing.twoPlayerDelayReduction"
      );
    } else {
      normalized.twoPlayerDelayMultiplier = normalizeNumber(
        source.twoPlayerDelayMultiplier,
        1,
        0.1,
        1,
        false,
        "gameSettings.enemySpawnPacing.twoPlayerDelayMultiplier"
      );
    }
    return normalized;
  }

  function calculateEnemySpawnDelay(pacing, stage, stageLimit, extendedLoop) {
    const settings = pacing || DEFAULT_ENEMY_SPAWN_PACING;
    const stageValue = Math.max(1, Math.floor(Number(stage) || 1));
    const cycleLimit = Math.max(1, Math.floor(Number(stageLimit) || stageValue));
    const minDelay = extendedLoop
      ? Math.min(settings.minDelay, settings.extendedLoopMinDelay)
      : settings.minDelay;
    return Math.max(minDelay, settings.baseDelay - Math.min(stageValue, cycleLimit) * settings.stageStep);
  }

  function scaleEnemySpawnDelay(delay, players, pacing) {
    const settings = pacing || DEFAULT_ENEMY_SPAWN_PACING;
    const playerCount = Math.max(1, Math.floor(Number(players) || 1));
    if (playerCount < 2) return delay;
    if (Number.isFinite(settings.twoPlayerDelayReduction)) {
      return Math.max(0, delay - settings.twoPlayerDelayReduction);
    }
    return Math.max(0, Math.round(delay * settings.twoPlayerDelayMultiplier));
  }

  return Object.freeze({
    DEFAULT_ENEMY_SPAWN_PACING,
    calculateEnemySpawnDelay,
    normalizeEnemySpawnPacing,
    scaleEnemySpawnDelay
  });
});
