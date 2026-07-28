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
  // Fixed stage/order data derived from NpcStages in the public reference source.
  const ORIGINAL_STAGE_ENEMY_TYPES = freezeEnemyTypeSequences([
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0],
    [0,0,0,2,0,3,0,0,0,2,2,0,0,0,0,3,0,2,0,0],
    [0,0,0,2,0,3,0,0,2,0,2,0,0,0,0,0,3,2,0,0],
    [0,0,2,1,1,3,1,2,1,2,1,3,1,2,1,3,1,2,1,1],
    [0,1,0,1,0,2,0,1,3,0,1,0,2,1,0,3,1,1,0,0],
    [0,2,0,2,0,0,2,0,1,0,2,3,2,1,0,2,0,2,3,0],
    [0,0,0,2,1,0,2,0,2,0,1,0,2,0,1,2,0,1,2,0],
    [0,2,0,2,1,0,1,2,0,3,2,0,2,3,0,1,2,1,0,2],
    [0,2,0,2,1,0,3,1,0,2,2,3,0,2,0,1,2,1,3,2],
    [0,0,0,1,0,2,0,2,0,0,2,3,0,1,0,3,0,2,0,0],
    [1,2,1,3,1,2,1,3,1,3,1,3,1,2,1,3,2,1,3,1],
    [2,1,3,2,1,3,2,1,3,2,1,3,2,1,2,3,1,2,3,2],
    [1,2,1,2,3,1,2,3,1,2,3,1,2,1,2,1,3,2,1,2],
    [2,1,2,2,3,1,2,3,2,3,2,3,1,2,2,3,2,1,3,2],
    [0,1,0,1,3,1,3,1,3,1,1,3,3,1,3,1,3,1,3,1],
    [0,0,0,1,0,0,0,3,0,0,1,0,0,0,0,3,0,0,0,0],
    [0,2,0,2,0,1,2,0,2,3,2,0,0,2,0,1,2,2,3,0],
    [0,0,1,2,1,2,1,3,2,1,2,3,1,1,3,2,1,2,3,1],
    [0,1,0,1,3,0,3,2,0,3,2,3,1,3,1,3,2,2,3,3],
    [0,0,1,1,3,3,1,3,1,3,2,1,3,1,3,1,3,2,1,3],
    [2,0,2,1,0,3,2,0,2,3,1,0,2,0,3,2,0,2,3,2],
    [1,0,1,1,0,3,0,2,1,0,1,3,3,0,1,0,1,2,3,1],
    [1,3,1,2,1,3,1,2,3,1,1,3,2,3,1,1,2,1,3,1],
    [0,2,0,1,0,0,2,3,0,1,2,0,2,0,3,0,0,1,0,1],
    [3,3,3,1,3,1,2,1,3,1,1,3,3,1,1,3,1,2,3,3],
    [1,0,1,2,3,1,2,0,3,1,2,0,3,1,3,0,3,2,1,3],
    [0,3,1,2,1,3,1,3,1,3,1,3,0,1,3,2,3,1,1,3],
    [0,0,0,1,0,0,0,3,0,0,1,0,0,2,0,0,0,2,0,0],
    [1,2,3,2,2,3,1,2,2,3,2,2,3,1,1,2,3,2,2,3],
    [0,2,1,2,1,3,0,1,2,3,1,0,1,2,3,1,0,1,3,1],
    [1,1,3,2,1,2,3,1,3,2,1,3,2,1,3,2,1,2,3,1],
    [0,1,3,2,3,0,2,3,0,3,1,0,1,3,0,0,3,1,3,3],
    [1,3,1,2,3,1,3,1,3,2,2,1,3,1,3,1,3,2,1,3],
    [1,1,1,2,1,3,1,3,1,2,1,3,1,3,2,1,3,2,3,1],
    [3,3,1,1,3,2,3,1,3,2,1,3,3,2,3,1,3,2,1,3]
  ]);
  const ORIGINAL_STYLE_ENEMY_GROUPS = freezeEnemyGroups(
    ORIGINAL_STAGE_ENEMY_TYPES.map(groupsFromTypeSequence)
  );

  function freezeEnemyGroups(stages) {
    return Object.freeze(stages.map((groups) =>
      Object.freeze(groups.map((group) => Object.freeze(group.slice())))
    ));
  }

  function freezeEnemyTypeSequences(stages) {
    return Object.freeze(stages.map((types) => Object.freeze(types.slice())));
  }

  function groupsFromTypeSequence(types) {
    const groups = [];
    for (const typeIndex of types) {
      const last = groups[groups.length - 1];
      if (last && last[1] === typeIndex) last[0] += 1;
      else groups.push([1, typeIndex]);
    }
    return groups;
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
    return ORIGINAL_STAGE_ENEMY_TYPES.map((types, stageIndex) =>
      buildEnemySequenceFromGroups(groupsFromTypeSequence(types), stageIndex + 1)
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
    ORIGINAL_STAGE_ENEMY_TYPES,
    ORIGINAL_STYLE_ENEMY_GROUPS,
    buildEnemySequenceFromGroups,
    buildOriginalStyleEnemySequences,
    summarizeEnemySequence,
    summarizeEnemySequences
  });
});
