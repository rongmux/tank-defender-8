const assert = require("assert").strict;
const {
  DEFAULT_ENEMY_AI,
  normalizeEnemyAi
} = require("../../src/config/enemy-ai-settings");

assert.deepEqual(DEFAULT_ENEMY_AI, {
  intersectionTurnChance: 1 / 16,
  blockedRetryChance: 3 / 4,
  blockedRetryTicks: 2,
  horizontalFirstChance: 1 / 2
});
assert(Object.isFrozen(DEFAULT_ENEMY_AI));
assert.deepEqual(normalizeEnemyAi(), DEFAULT_ENEMY_AI);
assert.deepEqual(normalizeEnemyAi({
  intersectionTurnChance: "0.33",
  blockedRetryChance: "0.44",
  blockedRetryTicks: "5",
  horizontalFirstChance: "0.22"
}), {
  intersectionTurnChance: 0.33,
  blockedRetryChance: 0.44,
  blockedRetryTicks: 5,
  horizontalFirstChance: 0.22
});
assert.deepEqual(normalizeEnemyAi({ randomTurnChance: 0.2, targetAxisBias: 0.8 }), {
  intersectionTurnChance: 0.2,
  blockedRetryChance: 3 / 4,
  blockedRetryTicks: 2,
  horizontalFirstChance: 0.8
});
const explicitWins = normalizeEnemyAi({
  intersectionTurnChance: 0.3,
  randomTurnChance: 0.2,
  horizontalFirstChance: 0.4,
  targetAxisBias: 0.8
});
assert.equal(explicitWins.intersectionTurnChance, 0.3);
assert.equal(explicitWins.horizontalFirstChance, 0.4);

assert.throws(() => normalizeEnemyAi(true), /enemyAi must be an object/);
for (const key of ["intersectionTurnChance", "blockedRetryChance", "horizontalFirstChance"]) {
  for (const value of [-0.01, 1.01]) {
    assert.throws(() => normalizeEnemyAi({ [key]: value }), new RegExp(`enemyAi\\.${key}`));
  }
}
for (const blockedRetryTicks of [-1, 1.5, 61]) {
  assert.throws(() => normalizeEnemyAi({ blockedRetryTicks }), /enemyAi\.blockedRetryTicks/);
}
assert.throws(() => normalizeEnemyAi({ randomTurnChance: 2 }), /intersectionTurnChance/);
assert.throws(() => normalizeEnemyAi({ targetAxisBias: 2 }), /horizontalFirstChance/);

console.log("enemy-ai-settings unit test passed");
