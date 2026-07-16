(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const valueNormalization = isCommonJs
    ? require("./value-normalization")
    : (root.TankDefender8Modules || {}).valueNormalization;
  if (!valueNormalization) throw new Error("valueNormalization module must load before power-up-settings.js");

  const api = factory(valueNormalization);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.powerUpSettings = api;
})(typeof window !== "undefined" ? window : globalThis, function (valueNormalization) {
  "use strict";

  const { normalizeNumber } = valueNormalization;
  const DEFAULT_POWERUP_DURATIONS = Object.freeze({
    helmet: 10,
    shovel: 20,
    shovelFlash: 4,
    timer: 10
  });
  const DEFAULT_POWERUP_RULES = Object.freeze({
    carrierRelease: "hit",
    clearUncollectedOnCarrierSpawn: true,
    pickupScore: 500
  });

  /** Normalizes the four power-up timers expressed in 64-frame units. */
  function normalizePowerUpDurations(durations) {
    const source = durations || {};
    if (typeof source !== "object") throw new Error("gameSettings.powerUpDurations must be an object");
    return Object.fromEntries(Object.entries(DEFAULT_POWERUP_DURATIONS).map(([key, defaultValue]) => {
      const value = source[key] === undefined ? defaultValue : Number(source[key]);
      if (!Number.isInteger(value) || value < 1 || value > 3600) {
        throw new Error(`gameSettings.powerUpDurations.${key} must be an integer from 1 to 3600`);
      }
      return [key, value];
    }));
  }

  /** Normalizes carrier release, stale-pickup clearing, and pickup scoring rules. */
  function normalizePowerUpRules(rules) {
    const source = rules || {};
    if (typeof source !== "object") throw new Error("gameSettings.powerUpRules must be an object");
    const carrierRelease = source.carrierRelease === undefined ? DEFAULT_POWERUP_RULES.carrierRelease : String(source.carrierRelease);
    if (!["destroyed", "hit"].includes(carrierRelease)) {
      throw new Error("gameSettings.powerUpRules.carrierRelease must be destroyed or hit");
    }
    return {
      carrierRelease,
      clearUncollectedOnCarrierSpawn: normalizeBooleanSetting(
        source.clearUncollectedOnCarrierSpawn,
        DEFAULT_POWERUP_RULES.clearUncollectedOnCarrierSpawn,
        "gameSettings.powerUpRules.clearUncollectedOnCarrierSpawn"
      ),
      pickupScore: normalizeNumber(
        source.pickupScore,
        DEFAULT_POWERUP_RULES.pickupScore,
        0,
        999999,
        true,
        "gameSettings.powerUpRules.pickupScore"
      )
    };
  }

  function normalizeBooleanSetting(value, fallback, label) {
    if (value === undefined) return fallback;
    if (typeof value !== "boolean") throw new Error(`${label} must be a boolean`);
    return value;
  }

  function shouldReleaseCarrierPowerUp(wasCarrier, destroyed, carrierRelease) {
    if (!wasCarrier) return false;
    return carrierRelease === "hit" || (carrierRelease === "destroyed" && destroyed);
  }

  function shouldClearPowerUpForCarrierSpawn(carrier, clearUncollectedOnCarrierSpawn) {
    return Boolean(carrier && clearUncollectedOnCarrierSpawn);
  }

  return Object.freeze({
    DEFAULT_POWERUP_DURATIONS,
    DEFAULT_POWERUP_RULES,
    normalizePowerUpDurations,
    normalizePowerUpRules,
    shouldClearPowerUpForCarrierSpawn,
    shouldReleaseCarrierPowerUp
  });
});
