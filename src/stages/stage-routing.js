(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.stageRouting = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function positiveInteger(value, fallback) {
    const numeric = Number(value);
    if (Number.isInteger(numeric) && numeric > 0) return numeric;
    const fallbackNumeric = Number(fallback);
    return Number.isInteger(fallbackNumeric) && fallbackNumeric > 0 ? fallbackNumeric : 1;
  }

  function normalizeStageNumber(stage, currentStage = 1) {
    return Math.max(1, Math.floor(Number(stage) || Number(currentStage) || 1));
  }

  /** Resolves displayed stage numbers onto finite map and enemy datasets. */
  function resolveStageRoute(options) {
    const source = options || {};
    const stageCount = positiveInteger(source.totalStages, 1);
    const originalStageCount = positiveInteger(source.originalStageCount, stageCount);
    const stageAdvance = source.stageAdvance || {};
    const extendedLoopEndStage = positiveInteger(stageAdvance.extendedLoopEndStage, stageCount);
    const stageCycleLimit = stageAdvance.loopAfterFinalStage === true &&
      stageCount === originalStageCount &&
      extendedLoopEndStage > stageCount
      ? extendedLoopEndStage
      : stageCount;
    const stage = normalizeStageNumber(source.stage, source.currentStage);
    const isExtendedLoopStage = stage > stageCount && stage <= stageCycleLimit;
    const mapDataStage = isExtendedLoopStage
      ? ((stage - 1) % stageCount) + 1
      : clamp(stage, 1, stageCount);
    const repeatedEnemyStage = positiveInteger(stageAdvance.extendedLoopEnemyStage, stageCount);
    const enemyDataStage = isExtendedLoopStage
      ? clamp(repeatedEnemyStage, 1, stageCount)
      : clamp(stage, 1, stageCount);

    return {
      stage,
      stageCount,
      stageCycleLimit,
      isExtendedLoopStage,
      mapDataStage,
      enemyDataStage
    };
  }

  function resolveEnemyTotal(pack, enemyDataStage, fallbackEnemyTotal) {
    const source = pack || {};
    const stageIndex = normalizeStageNumber(enemyDataStage) - 1;
    if (Array.isArray(source.enemyTotals) && source.enemyTotals[stageIndex]) {
      return source.enemyTotals[stageIndex];
    }
    if (Array.isArray(source.enemies) && Array.isArray(source.enemies[stageIndex])) {
      return source.enemies[stageIndex].length;
    }
    return positiveInteger(source.enemyTotal, fallbackEnemyTotal);
  }

  function resolveMaxActiveEnemies(pack, mapDataStage, players, defaults) {
    const source = pack || {};
    const fallback = defaults || {};
    const onePlayerDefault = positiveInteger(fallback.onePlayer, 4);
    const twoPlayerDefault = positiveInteger(fallback.twoPlayer, 6);
    const stageIndex = normalizeStageNumber(mapDataStage) - 1;
    const playerCount = Math.max(1, Math.floor(Number(players) || 1));
    const settings = Array.isArray(source.stageSettings) ? source.stageSettings[stageIndex] : null;
    if (settings) {
      return playerCount > 1 ? settings.maxActiveEnemiesTwoPlayer : settings.maxActiveEnemies;
    }
    return playerCount > 1 ? twoPlayerDefault : onePlayerDefault;
  }

  return Object.freeze({
    normalizeStageNumber,
    resolveEnemyTotal,
    resolveMaxActiveEnemies,
    resolveStageRoute
  });
});
