(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const modules = isCommonJs ? null : (root.TankDefender8Modules || {});
  const dependencies = {
    geometry: isCommonJs ? require("../core/geometry") : modules.geometry,
    enemyTypes: isCommonJs ? require("../config/enemy-types") : modules.enemyTypes,
    stagePack: isCommonJs ? require("./stage-pack") : modules.stagePack,
    stageGrid: isCommonJs ? require("./stage-grid") : modules.stageGrid,
    originalStageData: isCommonJs ? require("./original-stage-data") : modules.originalStageData,
    enemySequences: isCommonJs ? require("./enemy-sequences") : modules.enemySequences
  };

  for (const [name, dependency] of Object.entries(dependencies)) {
    if (!dependency) throw new Error(`${name} module must load before built-in-stage-pack.js`);
  }

  const api = factory(dependencies);
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  const browserModules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  browserModules.builtInStagePack = api;
})(typeof window !== "undefined" ? window : globalThis, function (dependencies) {
  "use strict";

  const { clamp } = dependencies.geometry;
  const { DEFAULT_ENEMY_TYPES, cloneEnemyTypes } = dependencies.enemyTypes;
  const { normalizeGameSettings } = dependencies.stagePack;
  const { buildOriginalStageGrid } = dependencies.originalStageData;
  const {
    BONUS_ENEMY_INDICES,
    DEFAULT_ENEMY_TOTAL,
    DEFAULT_ORIGINAL_STAGE_COUNT,
    buildOriginalStyleEnemySequences
  } = dependencies.enemySequences;

  const BUILT_IN_STAGE_PACK_ID = "original-style";

  /** Preserves the legacy type curve used only when built-in sequence data is missing. */
  function pickFallbackEnemyType(stage, spawned) {
    const curve = (stage + Math.floor(spawned / 4)) % 10;
    if (stage > 15 && spawned % 5 === 4) return 3;
    if (curve >= 8) return 3;
    if (curve >= 6) return 2;
    if (curve >= 3) return 1;
    return 0;
  }

  /** Creates an independent mutable runtime pack backed by shared immutable defaults. */
  function createBuiltInStagePack() {
    return {
      id: BUILT_IN_STAGE_PACK_ID,
      totalStages: DEFAULT_ORIGINAL_STAGE_COUNT,
      enemyTotal: DEFAULT_ENEMY_TOTAL,
      enemyTotals: Array.from({ length: DEFAULT_ORIGINAL_STAGE_COUNT }, () => DEFAULT_ENEMY_TOTAL),
      enemyTypes: cloneEnemyTypes(DEFAULT_ENEMY_TYPES),
      gameSettings: normalizeGameSettings(),
      maps: [],
      enemies: buildOriginalStyleEnemySequences(),
      createGrid(stage) {
        return buildOriginalStageGrid(stage);
      },
      enemyAt(stage, index) {
        const sequence = this.enemies[stage - 1];
        if (sequence && sequence[index]) {
          return {
            typeIndex: clamp(sequence[index].typeIndex || 0, 0, (this.enemyTypes || DEFAULT_ENEMY_TYPES).length - 1),
            carrier: Boolean(sequence[index].carrier),
            spawnIndex: sequence[index].spawnIndex === undefined
              ? (index + 1) % 3
              : clamp(sequence[index].spawnIndex, 0, 2),
            powerUpType: sequence[index].powerUpType || null,
            spawnDelay: sequence[index].spawnDelay === undefined || sequence[index].spawnDelay === null
              ? null
              : Math.max(0, Math.floor(sequence[index].spawnDelay))
          };
        }
        return {
          typeIndex: pickFallbackEnemyType(stage, index),
          carrier: BONUS_ENEMY_INDICES.includes(index),
          spawnIndex: (index + 1) % 3,
          powerUpType: null,
          spawnDelay: null
        };
      }
    };
  }

  return Object.freeze({
    BUILT_IN_STAGE_PACK_ID,
    createBuiltInStagePack,
    pickFallbackEnemyType
  });
});
