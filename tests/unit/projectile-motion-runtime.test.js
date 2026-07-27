const assert = require("assert").strict;
const directions = require("../../src/core/directions");
const projectileCollisionRules = require("../../src/rules/projectile-collision-rules");
const projectileMotionRuntime = require("../../src/runtime/projectile-motion-runtime");

assert.equal(Object.isFrozen(projectileMotionRuntime), true);
assert.throws(
  () => projectileMotionRuntime.setupProjectileMotionRuntime(),
  /state must be an object/
);
assert.throws(
  () => projectileMotionRuntime.setupProjectileMotionRuntime(
    { game: {}, fn: {} },
    { DIR_X: [], DIR_Y: [], resolveBulletCollisions: () => {} },
    {}
  ),
  /callbacks\.resolveBullet must be a function/
);

const first = { id: "first", x: 0, y: 0, dir: directions.RIGHT, speed: 2, remove: true };
const second = { id: "second", x: 10, y: 10, dir: directions.DOWN, speed: 0.5, remove: false };
const state = { game: { bullets: [first, second] }, fn: {} };
const resolved = [];
let collisionInput = null;
const api = projectileMotionRuntime.setupProjectileMotionRuntime(state, {
  DIR_X: directions.DIR_X,
  DIR_Y: directions.DIR_Y,
  resolveBulletCollisions(bullets) {
    collisionInput = bullets;
    second.remove = true;
    return 1;
  }
}, {
  resolveBullet(bullet) {
    resolved.push({ id: bullet.id, x: bullet.x, y: bullet.y });
    if (bullet.id === "first") bullet.remove = true;
  }
});

assert.equal(state.fn.updateBullets, api.updateBullets);
api.updateBullets();
assert.deepEqual(resolved, [
  { id: "first", x: 1, y: 0 },
  { id: "second", x: 10, y: 10.5 }
]);
assert.equal(collisionInput.length, 2, "collision cancellation runs before filtering");
assert.equal(state.game.bullets.length, 0);

const retained = { id: "retained", x: 5, y: 5, dir: directions.LEFT, speed: 1, remove: true };
state.game.bullets = [retained];
resolved.length = 0;
collisionInput = null;
api.updateBullets();
assert.deepEqual(resolved, [{ id: "retained", x: 4, y: 5 }]);
assert.equal(collisionInput[0], retained);
assert.equal(state.game.bullets[0], retained, "a bullet survives when collision rules leave it active");

assert.equal(projectileCollisionRules.DEFAULT_PROJECTILE_COLLISION_THRESHOLD, 6);
console.log("projectile-motion-runtime unit test passed");
