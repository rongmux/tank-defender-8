const assert = require("assert").strict;
const {
  BONUS_ENEMY_INDICES,
  DEFAULT_ENEMY_TOTAL,
  DEFAULT_ORIGINAL_STAGE_COUNT,
  ORIGINAL_STYLE_ENEMY_GROUPS,
  buildEnemySequenceFromGroups,
  buildOriginalStyleEnemySequences,
  summarizeEnemySequences
} = require("../../src/stages/enemy-sequences");

// Independent fixture for the 35-stage tank-group table used by the original-style pack.
const EXPECTED_ORIGINAL_ENEMY_GROUPS = [
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
];

function expandedTypes(groups) {
  return groups.flatMap(([count, typeIndex]) => Array(count).fill(typeIndex));
}

function namedGroups(groups, names) {
  return groups.map(([count, typeIndex]) => ({ count, typeIndex, type: names[typeIndex] }));
}

function groupCounts(groups, typeCount) {
  return groups.reduce((counts, [count, typeIndex]) => {
    counts[typeIndex] += count;
    return counts;
  }, Array(typeCount).fill(0));
}

assert.equal(DEFAULT_ENEMY_TOTAL, 20);
assert.equal(DEFAULT_ORIGINAL_STAGE_COUNT, EXPECTED_ORIGINAL_ENEMY_GROUPS.length);
assert.deepEqual(BONUS_ENEMY_INDICES, [3, 10, 17]);
assert.deepEqual(ORIGINAL_STYLE_ENEMY_GROUPS, EXPECTED_ORIGINAL_ENEMY_GROUPS);
assert(Object.isFrozen(ORIGINAL_STYLE_ENEMY_GROUPS));
assert(ORIGINAL_STYLE_ENEMY_GROUPS.every((groups) =>
  Object.isFrozen(groups) && groups.every(Object.isFrozen)
));

const sequences = buildOriginalStyleEnemySequences();
assert.equal(sequences.length, DEFAULT_ORIGINAL_STAGE_COUNT);
for (let stageIndex = 0; stageIndex < sequences.length; stageIndex += 1) {
  const sequence = sequences[stageIndex];
  assert.equal(sequence.length, DEFAULT_ENEMY_TOTAL);
  assert.deepEqual(sequence.map((enemy) => enemy.typeIndex), expandedTypes(EXPECTED_ORIGINAL_ENEMY_GROUPS[stageIndex]));
  assert.deepEqual(sequence.flatMap((enemy, index) => enemy.carrier ? [index] : []), BONUS_ENEMY_INDICES);
  assert.deepEqual(sequence.map((enemy) => enemy.spawnIndex),
    Array.from({ length: DEFAULT_ENEMY_TOTAL }, (_, index) => (index + 1) % 3));
  assert(sequence.every((enemy) => enemy.powerUpType === null && enemy.spawnDelay === null));
}

sequences[0][0].typeIndex = 3;
assert.equal(buildOriginalStyleEnemySequences()[0][0].typeIndex, 0, "each build must return independent enemy records");
assert.deepEqual(buildEnemySequenceFromGroups([[1, 2]], 99, 1), [{
  typeIndex: 2,
  carrier: false,
  spawnIndex: 1,
  powerUpType: null,
  spawnDelay: null
}]);
assert.throws(
  () => buildEnemySequenceFromGroups([[19, 0]], 7),
  /built-in stage 7 enemy sequence must contain 20 enemies/
);

const names = ["basic", "fast", "power", "armor"];
const summaries = summarizeEnemySequences(buildOriginalStyleEnemySequences(), names);
for (let stageIndex = 0; stageIndex < summaries.length; stageIndex += 1) {
  const expectedGroups = EXPECTED_ORIGINAL_ENEMY_GROUPS[stageIndex];
  assert.deepEqual(summaries[stageIndex], {
    stage: stageIndex + 1,
    total: DEFAULT_ENEMY_TOTAL,
    groups: namedGroups(expectedGroups, names),
    counts: groupCounts(expectedGroups, names.length),
    carriers: BONUS_ENEMY_INDICES.map((index) => index + 1)
  });
}

console.log("enemy-sequences unit test passed");
