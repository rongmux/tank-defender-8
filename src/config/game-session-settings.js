(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.gameSessionSettings = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const DEFAULT_INITIAL_LIVES = 3;
  const DEFAULT_BONUS_LIFE_SCORES = Object.freeze([20000]);
  const DEFAULT_DEATH_POWER_LEVEL = 0;
  const DEFAULT_TIMER_FREEZES_ENEMY_TIME = true;

  /** Normalizes top-level life, death-power, and timer-freeze game rules. */
  function normalizeGameSessionSettings(settings) {
    const source = settings || {};
    if (typeof source !== "object") throw new Error("gameSettings must be an object");
    const initialLives = source.initialLives === undefined ? DEFAULT_INITIAL_LIVES : Number(source.initialLives);
    if (!Number.isInteger(initialLives) || initialLives < 1 || initialLives > 9) {
      throw new Error("gameSettings.initialLives must be an integer from 1 to 9");
    }
    const rawBonusScores = source.bonusLifeScores === undefined ? DEFAULT_BONUS_LIFE_SCORES : source.bonusLifeScores;
    if (!Array.isArray(rawBonusScores)) throw new Error("gameSettings.bonusLifeScores must be an array");
    const bonusLifeScores = rawBonusScores.map((score, index) => {
      const value = Number(score);
      if (!Number.isInteger(value) || value < 1 || value > 999999) {
        throw new Error(`gameSettings.bonusLifeScores[${index}] must be an integer from 1 to 999999`);
      }
      return value;
    }).sort((a, b) => a - b);
    const deathPowerLevel = source.deathPowerLevel === undefined ? DEFAULT_DEATH_POWER_LEVEL : Number(source.deathPowerLevel);
    if (!Number.isInteger(deathPowerLevel) || deathPowerLevel < 0 || deathPowerLevel > 3) {
      throw new Error("gameSettings.deathPowerLevel must be an integer from 0 to 3");
    }
    return {
      initialLives,
      bonusLifeScores,
      deathPowerLevel,
      timerFreezesEnemyTime: normalizeBooleanSetting(
        source.timerFreezesEnemyTime,
        DEFAULT_TIMER_FREEZES_ENEMY_TIME,
        "gameSettings.timerFreezesEnemyTime"
      )
    };
  }

  function normalizeBooleanSetting(value, fallback, label) {
    if (value === undefined) return fallback;
    if (typeof value !== "boolean") throw new Error(`${label} must be a boolean`);
    return value;
  }

  return Object.freeze({
    DEFAULT_BONUS_LIFE_SCORES,
    DEFAULT_DEATH_POWER_LEVEL,
    DEFAULT_INITIAL_LIVES,
    DEFAULT_TIMER_FREEZES_ENEMY_TIME,
    normalizeGameSessionSettings
  });
});
