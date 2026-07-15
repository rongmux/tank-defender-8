(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const valueNormalization = isCommonJs
    ? require("./value-normalization")
    : (root.TankDefender8Modules || {}).valueNormalization;
  const enemyTypes = isCommonJs
    ? require("./enemy-types")
    : (root.TankDefender8Modules || {}).enemyTypes;
  if (!valueNormalization) throw new Error("valueNormalization module must load before player-upgrades.js");
  if (!enemyTypes) throw new Error("enemyTypes module must load before player-upgrades.js");

  const api = factory(valueNormalization, enemyTypes);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.playerUpgrades = api;
})(typeof window !== "undefined" ? window : globalThis, function (valueNormalization, enemyTypes) {
  "use strict";

  const { normalizeNumber } = valueNormalization;
  const { ENEMY_BULLET_SPEED } = enemyTypes;
  const DEFAULT_PLAYER_UPGRADE_RULES = Object.freeze([
    { level: 0, maxBullets: 1, bulletSpeed: ENEMY_BULLET_SPEED.normal, wallPower: 1, reload: 1 },
    { level: 1, maxBullets: 1, bulletSpeed: ENEMY_BULLET_SPEED.fast, wallPower: 1, reload: 1 },
    { level: 2, maxBullets: 2, bulletSpeed: ENEMY_BULLET_SPEED.fast, wallPower: 1, reload: 1 },
    { level: 3, maxBullets: 2, bulletSpeed: ENEMY_BULLET_SPEED.fast, wallPower: 3, reload: 1 }
  ].map(Object.freeze));

  function clonePlayerUpgradeRules(rules) {
    return rules.map((rule) => ({ ...rule }));
  }

  /** Returns four independent level rules with omitted values filled from defaults. */
  function normalizePlayerUpgradeRules(rules) {
    if (rules === undefined) return clonePlayerUpgradeRules(DEFAULT_PLAYER_UPGRADE_RULES);
    if (!Array.isArray(rules) || rules.length !== DEFAULT_PLAYER_UPGRADE_RULES.length) {
      throw new Error(`gameSettings.playerUpgradeRules must contain exactly ${DEFAULT_PLAYER_UPGRADE_RULES.length} entries`);
    }
    return rules.map((rule, index) => normalizePlayerUpgradeRule(rule, index));
  }

  function normalizePlayerUpgradeRule(rule, index) {
    if (!rule || typeof rule !== "object") {
      throw new Error(`gameSettings.playerUpgradeRules[${index}] must be an object`);
    }
    const fallback = DEFAULT_PLAYER_UPGRADE_RULES[index];
    return {
      level: index,
      maxBullets: normalizeNumber(rule.maxBullets, fallback.maxBullets, 1, 4, true, `gameSettings.playerUpgradeRules[${index}].maxBullets`),
      bulletSpeed: normalizeNumber(rule.bulletSpeed, fallback.bulletSpeed, 0.1, 6, false, `gameSettings.playerUpgradeRules[${index}].bulletSpeed`),
      wallPower: normalizeNumber(rule.wallPower, fallback.wallPower, 1, 3, true, `gameSettings.playerUpgradeRules[${index}].wallPower`),
      reload: normalizeNumber(rule.reload, fallback.reload, 1, 600, true, `gameSettings.playerUpgradeRules[${index}].reload`)
    };
  }

  return Object.freeze({
    DEFAULT_PLAYER_UPGRADE_RULES,
    clonePlayerUpgradeRules,
    normalizePlayerUpgradeRule,
    normalizePlayerUpgradeRules
  });
});
