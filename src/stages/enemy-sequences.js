(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.enemySequences = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const DEFAULT_ENEMY_TOTAL = 20;
  const DEFAULT_ORIGINAL_STAGE_COUNT = 35;
  const BONUS_ENEMY_INDICES = Object.freeze([3, 10, 17]);
  const ORIGINAL_STYLE_ENEMY_GROUPS = freezeEnemyGroups([
    [[18, 0], [2, 1]],
    [[2, 3], [4, 1], [14, 0]],
    [[14, 0], [4, 1], [2, 3]],
    [[10, 2], [5, 1], [2, 0], [3, 3]],
    [[5, 2], [2, 3], [8, 0], [5, 1]],
    [[7, 2], [2, 1], [9, 0], [2, 3]],
    [[3, 0], [4, 1], [6, 2], [7, 0]],
    [[7, 2], [2, 3], [4, 1], [7, 0]],
    [[6, 0], [4, 1], [7, 2], [3, 3]],
    [[12, 0], [2, 1], [4, 2], [2, 3]],
    [[5, 1], [6, 3], [4, 2], [5, 1]],
    [[8, 2], [6, 1], [6, 3]],
    [[8, 2], [8, 1], [4, 3]],
    [[10, 2], [4, 1], [6, 3]],
    [[2, 0], [10, 1], [8, 3]],
    [[16, 0], [2, 1], [2, 3]],
    [[2, 3], [2, 1], [8, 3], [8, 0]],
    [[4, 3], [2, 0], [6, 2], [8, 1]],
    [[4, 1], [8, 3], [4, 0], [4, 2]],
    [[8, 1], [2, 0], [2, 2], [8, 3]],
    [[8, 2], [2, 1], [6, 0], [4, 3]],
    [[8, 1], [6, 0], [2, 2], [4, 3]],
    [[6, 3], [4, 2], [10, 1]],
    [[4, 2], [2, 3], [4, 1], [10, 0]],
    [[2, 2], [8, 1], [10, 3]],
    [[6, 1], [6, 3], [4, 0], [4, 2]],
    [[2, 2], [8, 3], [8, 1], [2, 0]],
    [[2, 1], [1, 3], [15, 0], [2, 2]],
    [[10, 2], [4, 1], [6, 3]],
    [[4, 0], [8, 1], [4, 2], [4, 3]],
    [[3, 2], [8, 1], [6, 3], [3, 2]],
    [[8, 3], [6, 0], [2, 2], [4, 1]],
    [[4, 1], [8, 3], [4, 2], [4, 1]],
    [[4, 2], [10, 1], [6, 3]],
    [[4, 2], [6, 1], [10, 3]]
  ]);

  function freezeEnemyGroups(stages) {
    return Object.freeze(stages.map((groups) =>
      Object.freeze(groups.map((group) => Object.freeze(group.slice())))
    ));
  }

  /**
   * Expands compact [count, typeIndex] groups into the runtime enemy records.
   * Carrier positions are zero-based; spawn points rotate center, right, left.
   */
  function buildEnemySequenceFromGroups(groups, stage, expectedTotal = DEFAULT_ENEMY_TOTAL) {
    const sequence = [];
    for (const group of groups) {
      const count = group[0];
      const typeIndex = group[1];
      for (let i = 0; i < count; i += 1) {
        const index = sequence.length;
        sequence.push({
          typeIndex,
          carrier: BONUS_ENEMY_INDICES.includes(index),
          spawnIndex: (index + 1) % 3,
          powerUpType: null,
          spawnDelay: null
        });
      }
    }
    if (sequence.length !== expectedTotal) {
      throw new Error(`built-in stage ${stage} enemy sequence must contain ${expectedTotal} enemies`);
    }
    return sequence;
  }

  function buildOriginalStyleEnemySequences() {
    return ORIGINAL_STYLE_ENEMY_GROUPS.map((groups, stageIndex) =>
      buildEnemySequenceFromGroups(groups, stageIndex + 1)
    );
  }

  /** Collapses a runtime sequence back into named consecutive groups for diagnostics. */
  function summarizeEnemySequence(sequence, stage, names) {
    const groups = [];
    const counts = Array(names.length).fill(0);
    for (const enemy of sequence) {
      counts[enemy.typeIndex] += 1;
      const last = groups[groups.length - 1];
      if (last && last.typeIndex === enemy.typeIndex) {
        last.count += 1;
      } else {
        groups.push({
          count: 1,
          typeIndex: enemy.typeIndex,
          type: names[enemy.typeIndex]
        });
      }
    }
    return {
      stage,
      total: sequence.length,
      groups,
      counts,
      carriers: sequence.map((enemy, index) => enemy.carrier ? index + 1 : null).filter(Boolean)
    };
  }

  function summarizeEnemySequences(sequences, names) {
    return sequences.map((sequence, stageIndex) =>
      summarizeEnemySequence(sequence, stageIndex + 1, names)
    );
  }

  return Object.freeze({
    BONUS_ENEMY_INDICES,
    DEFAULT_ENEMY_TOTAL,
    DEFAULT_ORIGINAL_STAGE_COUNT,
    ORIGINAL_STYLE_ENEMY_GROUPS,
    buildEnemySequenceFromGroups,
    buildOriginalStyleEnemySequences,
    summarizeEnemySequence,
    summarizeEnemySequences
  });
});
