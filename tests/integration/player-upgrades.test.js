const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;
const schema = JSON.parse(JSON.stringify(api.stagePackSchema()));

assert(modules.playerUpgrades, "player upgrade module should register before game.js");
assert.deepEqual(schema.playerUpgradeRules, [
  { level: 0, maxBullets: 1, bulletSpeed: 2, wallPower: 1, reload: 1 },
  { level: 1, maxBullets: 1, bulletSpeed: 4, wallPower: 1, reload: 1 },
  { level: 2, maxBullets: 2, bulletSpeed: 4, wallPower: 1, reload: 1 },
  { level: 3, maxBullets: 2, bulletSpeed: 4, wallPower: 3, reload: 1 }
]);
assert.deepEqual(schema.gameSettings.playerUpgradeRules, schema.playerUpgradeRules);

const defaultProbe = JSON.parse(JSON.stringify(api.debugStarUpgradeProbe()));
assert.deepEqual(defaultProbe.tiers.map(({ level, maxBullets, bulletSpeed, wallPower }) => ({
  level,
  maxBullets,
  bulletSpeed,
  wallPower
})), schema.playerUpgradeRules.map(({ level, maxBullets, bulletSpeed, wallPower }) => ({
  level,
  maxBullets,
  bulletSpeed,
  wallPower
})));
assert.equal(defaultProbe.capped.level, 3, "additional stars must remain capped at level 3");
assert.equal(defaultProbe.afterDeath.level, schema.gameSettings.deathPowerLevel);
assert.equal(defaultProbe.afterDeath.destroying, true);
const survivability = JSON.parse(JSON.stringify(api.debugStarSurvivabilityProbe()));
assert.equal(survivability.alive, false, "star upgrades must not add player armor");
assert.equal(survivability.lives, 2, "life consumption waits for the retained death animation");

const customRules = schema.playerUpgradeRules.map((rule, index) => index === 0
  ? { ...rule, maxBullets: 2, bulletSpeed: 2.75, reload: 21 }
  : rule);
const customPack = {
  id: "player-upgrades-integration",
  totalStages: 1,
  maps: [schema.maps[0]],
  enemies: [schema.enemies[0].slice(0, 3)],
  gameSettings: { playerUpgradeRules: customRules }
};
assert.equal(api.validateStagePack(customPack).ok, true);
assert.equal(api.loadStagePack(customPack), true);
const current = JSON.parse(JSON.stringify(api.currentPackInfo()));
assert.deepEqual(current.playerUpgradeRules, customRules);
const customProbe = JSON.parse(JSON.stringify(api.debugStarUpgradeProbe()));
assert.equal(customProbe.tiers[0].maxBullets, 2);
assert.equal(customProbe.tiers[0].bulletSpeed, 2.75);

const invalidPack = {
  ...customPack,
  id: "invalid-player-upgrades",
  gameSettings: {
    playerUpgradeRules: schema.playerUpgradeRules.map((rule, index) => index === 3
      ? { ...rule, wallPower: 4 }
      : rule)
  }
};
assert.equal(api.validateStagePack(invalidPack).ok, false);

console.log("player-upgrades integration test passed");
