const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;
const schema = JSON.parse(JSON.stringify(api.stagePackSchema()));

assert(modules.directions, "directions module should register before game.js");
assert(modules.projectileState, "projectile state module should register before game.js");
assert.equal(Object.isFrozen(modules.projectileState), true);
assert(modules.projectileRuntime, "projectile runtime should register before game.js");
assert.equal(Object.isFrozen(modules.projectileRuntime), true);
assert(modules.projectileTargetRuntime, "projectile target runtime should register before game.js");
assert.equal(Object.isFrozen(modules.projectileTargetRuntime), true);
assert(modules.projectileMotionRuntime, "projectile motion runtime should register before game.js");
assert.equal(Object.isFrozen(modules.projectileMotionRuntime), true);
assert(modules.projectileResolutionRuntime, "projectile resolution runtime should register before game.js");
assert.equal(Object.isFrozen(modules.projectileResolutionRuntime), true);

const defaultProjectile = JSON.parse(JSON.stringify(api.debugProjectileRuleProbe()));
assert.deepEqual(defaultProjectile, {
  x: 30,
  y: 21,
  w: 4,
  h: 4,
  speed: 2,
  power: 1,
  spawnOffset: 9,
  boundsPadding: 4
});

const customUpgradeRules = schema.playerUpgradeRules.map((rule, index) =>
  index === 0 ? { ...rule, bulletSpeed: 2.75, wallPower: 2 } : rule
);
const customPack = {
  id: "projectile-state-integration",
  totalStages: 1,
  maps: [schema.maps[0]],
  enemies: [schema.enemies[0].slice(0, 3)],
  gameSettings: {
    projectileRules: { bulletSize: 6, spawnOffset: 11, boundsPadding: 2 },
    playerUpgradeRules: customUpgradeRules
  }
};
assert.equal(api.loadStagePack(customPack), true);
const customProjectile = JSON.parse(JSON.stringify(api.debugProjectileRuleProbe()));
assert.deepEqual(customProjectile, {
  x: 31,
  y: 20,
  w: 6,
  h: 6,
  speed: 2.75,
  power: 2,
  spawnOffset: 11,
  boundsPadding: 2
});

const enemyProjectile = modules.projectileState.createProjectileState({
  tank: {
    kind: "enemy",
    id: 101,
    x: 32,
    y: 16,
    w: 14,
    h: 14,
    dir: modules.directions.DOWN,
    bulletSpeed: 4,
    bulletPower: 1
  },
  ownerKey: "enemy:101",
  rules: customPack.gameSettings.projectileRules
});
assert.equal(enemyProjectile.x, 36);
assert.equal(enemyProjectile.y, 31);
assert.equal(enemyProjectile.speed, 4);
assert.equal(enemyProjectile.power, 1);
assert.equal(enemyProjectile.ownerKey, "enemy:101");

console.log("projectile-state integration test passed");
