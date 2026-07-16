const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.powerUpEffectRules, "power-up effect rules module should register before game.js");
assert.equal(Object.isFrozen(modules.powerUpEffectRules), true);

const directPlayer = { invuln: 0, level: 0, lives: 2 };
const directBattle = { freezeTimer: 0, shovelTimer: 0 };
const directResult = modules.powerUpEffectRules.applyPowerUpEffect(
  directPlayer,
  directBattle,
  "star",
  { baseAlive: true, durations: { helmet: 10, shovel: 20, timer: 10 }, maxPlayerLevel: 3 }
);
assert.deepEqual(JSON.parse(JSON.stringify(directResult)), {
  destroyActiveEnemies: false,
  rebuildBaseWall: false,
  soundName: null
});
assert.equal(directPlayer.level, 1);

const destroyedBaseShovel = JSON.parse(JSON.stringify(api.debugShovelDestroyedBaseProbe()));
assert.equal(destroyedBaseShovel.score, destroyedBaseShovel.pickupScore);
assert.equal(destroyedBaseShovel.popupCount, 1);
assert.equal(destroyedBaseShovel.shovelTimer, 0);
assert.equal(destroyedBaseShovel.wallTypes.every((type) => type === "brick"), true);

const timer = JSON.parse(JSON.stringify(api.debugTimerFreezeBehaviorProbe()));
assert.equal(timer.before.freezeTimer, timer.duration);
assert.equal(timer.before.score, timer.pickupScore);
assert.equal(timer.after.enemyX, timer.before.enemyX);
assert.equal(timer.after.enemyReload, timer.before.enemyReload);
assert(timer.after.bulletX > timer.before.bulletX);

const grenade = JSON.parse(JSON.stringify(api.debugGrenadeScoreProbe()));
assert.equal(grenade.scoreGain, grenade.pickupScore);
assert.equal(grenade.stagePoints, 0);
assert.equal(grenade.stageKills.every((count) => count === 0), true);
assert.equal(grenade.totalKills.every((count) => count === 0), true);
assert.deepEqual(grenade.beforeRelease, {
  enemyKilled: 0,
  aliveEnemies: 2,
  destroyingEnemies: 2
});
assert.equal(grenade.enemyKilled, 2);
assert.equal(grenade.aliveEnemies, 0);

const spawning = JSON.parse(JSON.stringify(api.debugGrenadeSpawnProtectionProbe()));
assert.equal(spawning.beforeRelease.activeAlive, true);
assert.equal(spawning.beforeRelease.activeDestroying, true);
assert.equal(spawning.beforeRelease.enemyKilled, 0);
assert.equal(spawning.activeAlive, false);
assert.equal(spawning.activeDestroying, false);
assert.equal(spawning.enemyKilled, 1);
assert.equal(spawning.spawningAlive, true);
assert.equal(spawning.spawningHp, 1);
assert.equal(spawning.spawningFlash, 12);
assert.equal(spawning.beforeRelease.explosionCount, 0);
assert.equal(spawning.explosionCount, 0);
assert.equal(spawning.stageKills.every((count) => count === 0), true);
assert.equal(spawning.totalKills.every((count) => count === 0), true);

console.log("power-up-effect-rules integration test passed");
