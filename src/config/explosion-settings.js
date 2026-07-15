(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const valueNormalization = isCommonJs
    ? require("./value-normalization")
    : (root.TankDefender8Modules || {}).valueNormalization;
  if (!valueNormalization) throw new Error("valueNormalization module must load before explosion-settings.js");

  const api = factory(valueNormalization);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.explosionSettings = api;
})(typeof window !== "undefined" ? window : globalThis, function (valueNormalization) {
  "use strict";

  const { normalizeHexColor, normalizeNumber } = valueNormalization;
  const DEFAULT_EXPLOSION_CORE_COLOR = "#f7f1c6";
  const DEFAULT_EXPLOSION_RULES = freezeExplosionRules({
    bulletCancel: { ttl: 10, color: "#f8e08b", coreColor: DEFAULT_EXPLOSION_CORE_COLOR },
    baseDestroy: { ttl: 35, color: "#f05a42", coreColor: DEFAULT_EXPLOSION_CORE_COLOR },
    brickHit: { ttl: 9, color: "#d08b52", coreColor: DEFAULT_EXPLOSION_CORE_COLOR },
    steelHit: { ttl: 9, color: "#dbe0ef", coreColor: DEFAULT_EXPLOSION_CORE_COLOR },
    steelBlocked: { ttl: 9, color: "#dbe0ef", coreColor: DEFAULT_EXPLOSION_CORE_COLOR },
    enemyHit: { ttl: 9, color: "#ffffff", coreColor: DEFAULT_EXPLOSION_CORE_COLOR },
    enemyDestroy: { ttl: 18, color: "#f0b546", coreColor: DEFAULT_EXPLOSION_CORE_COLOR },
    playerStun: { ttl: 9, color: "#f7f1c6", coreColor: DEFAULT_EXPLOSION_CORE_COLOR },
    playerDestroy: { ttl: 18, color: "#f05a42", coreColor: DEFAULT_EXPLOSION_CORE_COLOR }
  });

  function freezeExplosionRules(rules) {
    return Object.freeze(Object.fromEntries(
      Object.entries(rules).map(([key, rule]) => [key, Object.freeze({ ...rule })])
    ));
  }

  function cloneExplosionRules(rules) {
    return Object.fromEntries(Object.entries(rules).map(([key, rule]) => [key, { ...rule }]));
  }

  /** Normalizes all named explosion lifetimes and replacement-art colors. */
  function normalizeExplosionRules(rules) {
    const source = rules || {};
    if (!source || typeof source !== "object" || Array.isArray(source)) {
      throw new Error("gameSettings.explosionRules must be an object");
    }
    return Object.fromEntries(Object.entries(DEFAULT_EXPLOSION_RULES).map(([key, defaults]) => {
      const rule = source[key] === undefined ? {} : source[key];
      if (!rule || typeof rule !== "object" || Array.isArray(rule)) {
        throw new Error(`gameSettings.explosionRules.${key} must be an object`);
      }
      return [key, {
        ttl: normalizeNumber(rule.ttl, defaults.ttl, 1, 3600, true, `gameSettings.explosionRules.${key}.ttl`),
        color: normalizeHexColor(rule.color, defaults.color, `gameSettings.explosionRules.${key}.color`),
        coreColor: normalizeHexColor(rule.coreColor, defaults.coreColor, `gameSettings.explosionRules.${key}.coreColor`)
      }];
    }));
  }

  return Object.freeze({
    DEFAULT_EXPLOSION_CORE_COLOR,
    DEFAULT_EXPLOSION_RULES,
    cloneExplosionRules,
    normalizeExplosionRules
  });
});
