const assert = require("assert").strict;
const geometry = require("../../src/core/geometry");
const projectileState = require("../../src/entities/projectile-state");
const projectileRuntime = require("../../src/runtime/projectile-runtime");

assert.equal(Object.isFrozen(projectileRuntime), true);
assert.throws(
  () => projectileRuntime.setupProjectileRuntime(),
  /state must be an object/
);
assert.throws(
  () => projectileRuntime.setupProjectileRuntime(
    { game: {}, fn: {} },
    { clamp: geometry.clamp, createProjectileState: projectileState.createProjectileState,
      DEFAULT_PLAYER_UPGRADE_RULES: null },
    { gameSettings: () => ({}), playSound: () => {} }
  ),
  /deps\.DEFAULT_PLAYER_UPGRADE_RULES must be an array/
);

const settings = {
  projectileRules: { bulletSize: 4, spawnOffset: 9, boundsPadding: 4 },
  playerUpgradeRules: [
    { reload: 6, maxBullets: 1, bulletSpeed: 2, wallPower: 1 },
    { reload: 4, maxBullets: 2, bulletSpeed: 3, wallPower: 2 }
  ]
};
const state = {
  game: { bullets: [] },
  fn: {}
};
const sounds = [];
const api = projectileRuntime.setupProjectileRuntime(state, {
  clamp: geometry.clamp,
  createProjectileState: projectileState.createProjectileState,
  DEFAULT_PLAYER_UPGRADE_RULES: settings.playerUpgradeRules
}, {
  gameSettings: () => settings,
  playSound: (name) => sounds.push(name)
});

assert.deepEqual(Object.keys(api), ["shoot", "createBullet", "playerUpgradeRule"]);
assert.equal(state.fn.shoot, api.shoot);
assert.deepEqual(api.playerUpgradeRule(99), settings.playerUpgradeRules[1]);
assert.deepEqual(api.playerUpgradeRule(-1), settings.playerUpgradeRules[0]);

const player = {
  kind: "player",
  id: 1,
  x: 16,
  y: 16,
  w: 14,
  h: 14,
  dir: 0,
  level: 0,
  alive: true,
  destroying: false,
  reload: 0,
  reloadBase: 9,
  spawnFlash: 0,
  bulletSpeed: 2,
  bulletPower: 1
};
api.shoot(player);
assert.equal(state.game.bullets.length, 1);
assert.equal(state.game.bullets[0].ownerKey, "player:1");
assert.equal(state.game.bullets[0].speed, 2);
assert.equal(player.reload, 6);
assert.deepEqual(sounds, ["playerShoot"]);

player.reload = 0;
api.shoot(player);
assert.equal(state.game.bullets.length, 1, "level one should keep the one-bullet limit");

player.level = 1;
player.reload = 0;
api.shoot(player);
assert.equal(state.game.bullets.length, 2);
assert.equal(state.game.bullets[1].speed, 3);
assert.equal(player.reload, 4);
assert.deepEqual(sounds, ["playerShoot", "playerShoot"]);

const enemy = {
  kind: "enemy",
  id: 101,
  x: 32,
  y: 16,
  w: 14,
  h: 14,
  dir: 2,
  level: 0,
  alive: true,
  destroying: false,
  reload: 0,
  reloadBase: 11,
  spawnFlash: 0,
  bulletSpeed: 4,
  bulletPower: 1
};
api.shoot(enemy);
assert.equal(state.game.bullets.length, 3);
assert.equal(enemy.reload, 11);
assert.deepEqual(sounds, ["playerShoot", "playerShoot"], "enemy shots are silent");

enemy.reload = 0;
enemy.alive = false;
api.shoot(enemy);
assert.equal(state.game.bullets.length, 3);

console.log("projectile-runtime unit test passed");
