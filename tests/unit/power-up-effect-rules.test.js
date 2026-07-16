const assert = require("assert").strict;
const powerUpEffectRules = require("../../src/rules/power-up-effect-rules");

const { applyPowerUpEffect } = powerUpEffectRules;
const durations = { helmet: 10, shovel: 20, timer: 10 };
const options = { baseAlive: true, durations, maxPlayerLevel: 3 };
const makePlayer = (overrides) => ({
  invuln: 0,
  level: 0,
  lives: 2,
  ...overrides
});
const makeBattle = (overrides) => ({
  freezeTimer: 0,
  shovelTimer: 0,
  ...overrides
});

assert.equal(Object.isFrozen(powerUpEffectRules), true);

const grenadePlayer = makePlayer();
const grenadeBattle = makeBattle();
assert.deepEqual(applyPowerUpEffect(grenadePlayer, grenadeBattle, "grenade", options), {
  destroyActiveEnemies: true,
  rebuildBaseWall: false,
  soundName: "enemyDestroy"
});
assert.deepEqual(grenadePlayer, makePlayer());
assert.deepEqual(grenadeBattle, makeBattle());

const helmetPlayer = makePlayer({ invuln: 3 });
assert.deepEqual(applyPowerUpEffect(helmetPlayer, makeBattle(), "helmet", options), {
  destroyActiveEnemies: false,
  rebuildBaseWall: false,
  soundName: null
});
assert.equal(helmetPlayer.invuln, 10);
const protectedPlayer = makePlayer({ invuln: 12 });
applyPowerUpEffect(protectedPlayer, makeBattle(), "helmet", options);
assert.equal(protectedPlayer.invuln, 12, "a helmet must not shorten existing protection");

const shovelBattle = makeBattle();
assert.equal(applyPowerUpEffect(makePlayer(), shovelBattle, "shovel", options).rebuildBaseWall, true);
assert.equal(shovelBattle.shovelTimer, 20);
const destroyedBaseBattle = makeBattle({ shovelTimer: 4 });
assert.equal(applyPowerUpEffect(makePlayer(), destroyedBaseBattle, "shovel", {
  ...options,
  baseAlive: false
}).rebuildBaseWall, false);
assert.equal(destroyedBaseBattle.shovelTimer, 4);

const starPlayer = makePlayer({ level: 2 });
applyPowerUpEffect(starPlayer, makeBattle(), "star", options);
assert.equal(starPlayer.level, 3);
applyPowerUpEffect(starPlayer, makeBattle(), "star", options);
assert.equal(starPlayer.level, 3);

const timerBattle = makeBattle({ freezeTimer: 2 });
applyPowerUpEffect(makePlayer(), timerBattle, "timer", options);
assert.equal(timerBattle.freezeTimer, 10);

const tankPlayer = makePlayer({ lives: 1 });
assert.deepEqual(applyPowerUpEffect(tankPlayer, makeBattle(), "tank", options), {
  destroyActiveEnemies: false,
  rebuildBaseWall: false,
  soundName: "bonusLife"
});
assert.equal(tankPlayer.lives, 2);

const unknownPlayer = makePlayer();
const unknownBattle = makeBattle();
assert.deepEqual(applyPowerUpEffect(unknownPlayer, unknownBattle, "unknown", options), {
  destroyActiveEnemies: false,
  rebuildBaseWall: false,
  soundName: null
});
assert.deepEqual(unknownPlayer, makePlayer());
assert.deepEqual(unknownBattle, makeBattle());

console.log("power-up-effect-rules unit test passed");
