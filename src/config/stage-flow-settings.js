(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const valueNormalization = isCommonJs
    ? require("./value-normalization")
    : (root.TankDefender8Modules || {}).valueNormalization;
  if (!valueNormalization) throw new Error("valueNormalization module must load before stage-flow-settings.js");

  const api = factory(valueNormalization);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.stageFlowSettings = api;
})(typeof window !== "undefined" ? window : globalThis, function (valueNormalization) {
  "use strict";

  const { normalizeNumber } = valueNormalization;
  const DEFAULT_STAGE_ADVANCE = Object.freeze({
    loopAfterFinalStage: true,
    extendedLoopEndStage: 70,
    extendedLoopEnemyStage: 35
  });
  const DEFAULT_STAGE_CLEAR_BONUS = Object.freeze({
    points: 1000,
    twoPlayerOnly: true,
    requireStrictLead: true
  });

  /** Normalizes final-stage looping and extended-loop data selection. */
  function normalizeStageAdvance(advance) {
    const source = advance || {};
    if (typeof source !== "object") throw new Error("gameSettings.stageAdvance must be an object");
    return {
      loopAfterFinalStage: normalizeBooleanSetting(
        source.loopAfterFinalStage,
        DEFAULT_STAGE_ADVANCE.loopAfterFinalStage,
        "gameSettings.stageAdvance.loopAfterFinalStage"
      ),
      extendedLoopEndStage: normalizeNumber(
        source.extendedLoopEndStage,
        DEFAULT_STAGE_ADVANCE.extendedLoopEndStage,
        1,
        999,
        true,
        "gameSettings.stageAdvance.extendedLoopEndStage"
      ),
      extendedLoopEnemyStage: normalizeNumber(
        source.extendedLoopEnemyStage,
        DEFAULT_STAGE_ADVANCE.extendedLoopEnemyStage,
        1,
        999,
        true,
        "gameSettings.stageAdvance.extendedLoopEnemyStage"
      )
    };
  }

  /** Normalizes stage-clear leader bonus scoring and eligibility rules. */
  function normalizeStageClearBonus(bonus) {
    const source = bonus || {};
    if (typeof source !== "object") throw new Error("gameSettings.stageClearBonus must be an object");
    return {
      points: normalizeNumber(source.points, DEFAULT_STAGE_CLEAR_BONUS.points, 0, 999999, true, "gameSettings.stageClearBonus.points"),
      twoPlayerOnly: normalizeBooleanSetting(
        source.twoPlayerOnly,
        DEFAULT_STAGE_CLEAR_BONUS.twoPlayerOnly,
        "gameSettings.stageClearBonus.twoPlayerOnly"
      ),
      requireStrictLead: normalizeBooleanSetting(
        source.requireStrictLead,
        DEFAULT_STAGE_CLEAR_BONUS.requireStrictLead,
        "gameSettings.stageClearBonus.requireStrictLead"
      )
    };
  }

  function normalizeBooleanSetting(value, fallback, label) {
    if (value === undefined) return fallback;
    if (typeof value !== "boolean") throw new Error(`${label} must be a boolean`);
    return value;
  }

  return Object.freeze({
    DEFAULT_STAGE_ADVANCE,
    DEFAULT_STAGE_CLEAR_BONUS,
    normalizeStageAdvance,
    normalizeStageClearBonus
  });
});
