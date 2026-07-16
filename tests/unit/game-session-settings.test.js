const assert = require("assert").strict;
const {
  DEFAULT_BONUS_LIFE_SCORES,
  DEFAULT_DEATH_POWER_LEVEL,
  DEFAULT_INITIAL_LIVES,
  DEFAULT_TIMER_FREEZES_ENEMY_TIME,
  normalizeGameSessionSettings
} = require("../../src/config/game-session-settings");

assert.equal(DEFAULT_INITIAL_LIVES, 3);
assert.deepEqual(DEFAULT_BONUS_LIFE_SCORES, [20000]);
assert.equal(DEFAULT_DEATH_POWER_LEVEL, 0);
assert.equal(DEFAULT_TIMER_FREEZES_ENEMY_TIME, true);
assert(Object.isFrozen(DEFAULT_BONUS_LIFE_SCORES));

const firstDefaults = normalizeGameSessionSettings();
const secondDefaults = normalizeGameSessionSettings();
assert.deepEqual(firstDefaults, {
  initialLives: 3,
  bonusLifeScores: [20000],
  deathPowerLevel: 0,
  timerFreezesEnemyTime: true
});
assert.notEqual(firstDefaults.bonusLifeScores, DEFAULT_BONUS_LIFE_SCORES);
firstDefaults.bonusLifeScores[0] = 1;
assert.equal(secondDefaults.bonusLifeScores[0], 20000);

assert.deepEqual(normalizeGameSessionSettings({
  initialLives: "5",
  bonusLifeScores: ["300", 100, 100],
  deathPowerLevel: "2",
  timerFreezesEnemyTime: false
}), {
  initialLives: 5,
  bonusLifeScores: [100, 100, 300],
  deathPowerLevel: 2,
  timerFreezesEnemyTime: false
});

assert.throws(() => normalizeGameSessionSettings(true), /gameSettings must be an object/);
for (const initialLives of [0, 1.5, 10]) {
  assert.throws(() => normalizeGameSessionSettings({ initialLives }), /initialLives/);
}
assert.throws(() => normalizeGameSessionSettings({ bonusLifeScores: "20000" }), /bonusLifeScores must be an array/);
for (const score of [0, 1.5, 1000000]) {
  assert.throws(() => normalizeGameSessionSettings({ bonusLifeScores: [score] }), /bonusLifeScores\[0\]/);
}
for (const deathPowerLevel of [-1, 1.5, 4]) {
  assert.throws(() => normalizeGameSessionSettings({ deathPowerLevel }), /deathPowerLevel/);
}
assert.throws(() => normalizeGameSessionSettings({ timerFreezesEnemyTime: "yes" }), /timerFreezesEnemyTime must be a boolean/);

console.log("game-session-settings unit test passed");
