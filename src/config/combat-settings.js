(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const valueNormalization = isCommonJs
    ? require("./value-normalization")
    : (root.TankDefender8Modules || {}).valueNormalization;
  if (!valueNormalization) throw new Error("valueNormalization module must load before combat-settings.js");

  const api = factory(valueNormalization);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.combatSettings = api;
})(typeof window !== "undefined" ? window : globalThis, function (valueNormalization) {
  "use strict";

  const { normalizeNumber } = valueNormalization;
  const DEFAULT_PROJECTILE_RULES = Object.freeze({
    bulletSize: 4,
    spawnOffset: 9,
    boundsPadding: 4
  });
  const DEFAULT_FRIENDLY_FIRE = Object.freeze({
    enabled: true,
    stunFrames: 200
  });

  /** Normalizes projectile geometry used by spawning, collision, and bounds checks. */
  function normalizeProjectileRules(rules) {
    const source = rules || {};
    if (typeof source !== "object") throw new Error("gameSettings.projectileRules must be an object");
    return {
      bulletSize: normalizeNumber(source.bulletSize, DEFAULT_PROJECTILE_RULES.bulletSize, 1, 16, true, "gameSettings.projectileRules.bulletSize"),
      spawnOffset: normalizeNumber(source.spawnOffset, DEFAULT_PROJECTILE_RULES.spawnOffset, 0, 32, false, "gameSettings.projectileRules.spawnOffset"),
      boundsPadding: normalizeNumber(source.boundsPadding, DEFAULT_PROJECTILE_RULES.boundsPadding, 0, 32, false, "gameSettings.projectileRules.boundsPadding")
    };
  }

  /** Normalizes two-player friendly-fire activation and stun duration. */
  function normalizeFriendlyFire(friendlyFire) {
    const source = friendlyFire || {};
    if (typeof source !== "object") throw new Error("gameSettings.friendlyFire must be an object");
    return {
      enabled: normalizeBooleanSetting(source.enabled, DEFAULT_FRIENDLY_FIRE.enabled, "gameSettings.friendlyFire.enabled"),
      stunFrames: normalizeNumber(source.stunFrames, DEFAULT_FRIENDLY_FIRE.stunFrames, 0, 3600, true, "gameSettings.friendlyFire.stunFrames")
    };
  }

  function normalizeBooleanSetting(value, fallback, label) {
    if (value === undefined) return fallback;
    if (typeof value !== "boolean") throw new Error(`${label} must be a boolean`);
    return value;
  }

  return Object.freeze({
    DEFAULT_FRIENDLY_FIRE,
    DEFAULT_PROJECTILE_RULES,
    normalizeFriendlyFire,
    normalizeProjectileRules
  });
});
