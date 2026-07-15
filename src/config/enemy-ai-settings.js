(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const valueNormalization = isCommonJs
    ? require("./value-normalization")
    : (root.TankDefender8Modules || {}).valueNormalization;
  if (!valueNormalization) throw new Error("valueNormalization module must load before enemy-ai-settings.js");

  const api = factory(valueNormalization);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.enemyAiSettings = api;
})(typeof window !== "undefined" ? window : globalThis, function (valueNormalization) {
  "use strict";

  const { normalizeNumber } = valueNormalization;
  const DEFAULT_ENEMY_AI = Object.freeze({
    intersectionTurnChance: 1 / 16,
    blockedRetryChance: 3 / 4,
    blockedRetryTicks: 2,
    horizontalFirstChance: 1 / 2
  });

  /** Normalizes enemy routing probabilities and legacy field aliases. */
  function normalizeEnemyAi(enemyAi) {
    const source = enemyAi || {};
    if (typeof source !== "object") throw new Error("gameSettings.enemyAi must be an object");
    return {
      intersectionTurnChance: normalizeNumber(
        source.intersectionTurnChance,
        source.randomTurnChance === undefined ? DEFAULT_ENEMY_AI.intersectionTurnChance : source.randomTurnChance,
        0,
        1,
        false,
        "gameSettings.enemyAi.intersectionTurnChance"
      ),
      blockedRetryChance: normalizeNumber(
        source.blockedRetryChance,
        DEFAULT_ENEMY_AI.blockedRetryChance,
        0,
        1,
        false,
        "gameSettings.enemyAi.blockedRetryChance"
      ),
      blockedRetryTicks: normalizeNumber(
        source.blockedRetryTicks,
        DEFAULT_ENEMY_AI.blockedRetryTicks,
        0,
        60,
        true,
        "gameSettings.enemyAi.blockedRetryTicks"
      ),
      horizontalFirstChance: normalizeNumber(
        source.horizontalFirstChance,
        source.targetAxisBias === undefined ? DEFAULT_ENEMY_AI.horizontalFirstChance : source.targetAxisBias,
        0,
        1,
        false,
        "gameSettings.enemyAi.horizontalFirstChance"
      )
    };
  }

  return Object.freeze({
    DEFAULT_ENEMY_AI,
    normalizeEnemyAi
  });
});
