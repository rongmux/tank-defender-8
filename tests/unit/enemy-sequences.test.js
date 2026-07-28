const assert = require("assert").strict;
const {
  BONUS_ENEMY_INDICES,
  DEFAULT_ENEMY_TOTAL,
  DEFAULT_ORIGINAL_STAGE_COUNT,
  ORIGINAL_STAGE_ENEMY_TYPES,
  ORIGINAL_STYLE_ENEMY_GROUPS,
  buildEnemySequenceFromGroups,
  buildOriginalStyleEnemySequences,
  summarizeEnemySequences
} = require("../../src/stages/enemy-sequences");

// Independent fixture for the 35-stage, 20-tank order in the public NpcStages table.
const EXPECTED_ORIGINAL_ENEMY_TYPES = [
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
];

function compressTypes(types) {
  const groups = [];
  for (const typeIndex of types) {
    const last = groups[groups.length - 1];
    if (last && last[1] === typeIndex) last[0] += 1;
    else groups.push([1, typeIndex]);
  }
  return groups;
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
assert.equal(DEFAULT_ORIGINAL_STAGE_COUNT, EXPECTED_ORIGINAL_ENEMY_TYPES.length);
assert.deepEqual(BONUS_ENEMY_INDICES, [3, 10, 17]);
assert.deepEqual(ORIGINAL_STAGE_ENEMY_TYPES, EXPECTED_ORIGINAL_ENEMY_TYPES);
assert(Object.isFrozen(ORIGINAL_STAGE_ENEMY_TYPES));
assert(ORIGINAL_STAGE_ENEMY_TYPES.every(Object.isFrozen));
assert.deepEqual(
  ORIGINAL_STYLE_ENEMY_GROUPS,
  EXPECTED_ORIGINAL_ENEMY_TYPES.map(compressTypes)
);
assert(Object.isFrozen(ORIGINAL_STYLE_ENEMY_GROUPS));
assert(ORIGINAL_STYLE_ENEMY_GROUPS.every((groups) =>
  Object.isFrozen(groups) && groups.every(Object.isFrozen)
));

const sequences = buildOriginalStyleEnemySequences();
assert.equal(sequences.length, DEFAULT_ORIGINAL_STAGE_COUNT);
for (let stageIndex = 0; stageIndex < sequences.length; stageIndex += 1) {
  const sequence = sequences[stageIndex];
  const expectedGroups = compressTypes(EXPECTED_ORIGINAL_ENEMY_TYPES[stageIndex]);
  assert.equal(sequence.length, DEFAULT_ENEMY_TOTAL);
  assert.deepEqual(sequence.map((enemy) => enemy.typeIndex), EXPECTED_ORIGINAL_ENEMY_TYPES[stageIndex]);
  assert.deepEqual(sequence.flatMap((enemy, index) => enemy.carrier ? [index] : []), BONUS_ENEMY_INDICES);
  assert.deepEqual(sequence.map((enemy) => enemy.spawnIndex),
    Array.from({ length: DEFAULT_ENEMY_TOTAL }, (_, index) => (index + 1) % 3));
  assert(sequence.every((enemy) => enemy.powerUpType === null && enemy.spawnDelay === null));
  assert.deepEqual(ORIGINAL_STYLE_ENEMY_GROUPS[stageIndex], expectedGroups);
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
  const expectedGroups = compressTypes(EXPECTED_ORIGINAL_ENEMY_TYPES[stageIndex]);
  assert.deepEqual(summaries[stageIndex], {
    stage: stageIndex + 1,
    total: DEFAULT_ENEMY_TOTAL,
    groups: namedGroups(expectedGroups, names),
    counts: groupCounts(expectedGroups, names.length),
    carriers: BONUS_ENEMY_INDICES.map((index) => index + 1)
  });
}

console.log("enemy-sequences unit test passed");
