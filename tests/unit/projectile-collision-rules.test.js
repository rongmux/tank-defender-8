const assert = require("assert").strict;
const projectileCollisionRules = require("../../src/rules/projectile-collision-rules");

const {
  DEFAULT_PROJECTILE_COLLISION_THRESHOLD,
  bulletCentersWithin,
  resolveBulletCollisions
} = projectileCollisionRules;

function bullet(x, y, ownerKey, overrides) {
  return {
    x,
    y,
    w: 4,
    h: 4,
    ownerKey,
    remove: false,
    ...(overrides || {})
  };
}

assert.equal(Object.isFrozen(projectileCollisionRules), true);
assert.equal(DEFAULT_PROJECTILE_COLLISION_THRESHOLD, 6);
assert.equal(bulletCentersWithin(bullet(10, 20, "player:1"), bullet(15, 20, "enemy:1")), true);
assert.equal(bulletCentersWithin(bullet(10, 20, "player:1"), bullet(16, 20, "enemy:1")), false);
assert.equal(bulletCentersWithin(bullet(10, 20, "player:1"), bullet(10, 26, "enemy:1")), false);
assert.equal(
  bulletCentersWithin(
    bullet(10, 20, "player:1", { w: 8 }),
    bullet(15, 20, "enemy:1", { w: 4 })
  ),
  true
);

const opponents = [bullet(10, 20, "player:1"), bullet(15, 20, "enemy:1")];
assert.equal(resolveBulletCollisions(opponents), 1);
assert.equal(opponents.every((entry) => entry.remove), true);

const sameOwner = [bullet(10, 20, "player:1"), bullet(10, 20, "player:1")];
assert.equal(resolveBulletCollisions(sameOwner), 0);
assert.equal(sameOwner.some((entry) => entry.remove), false);

const strictBoundary = [bullet(10, 20, "player:1"), bullet(16, 20, "enemy:1")];
assert.equal(resolveBulletCollisions(strictBoundary), 0);
assert.equal(strictBoundary.some((entry) => entry.remove), false);

const removedIsSkipped = [
  bullet(10, 20, "player:1", { remove: true }),
  bullet(10, 20, "enemy:1")
];
assert.equal(resolveBulletCollisions(removedIsSkipped), 0);
assert.equal(removedIsSkipped[1].remove, false);

const orderedTriple = [
  bullet(10, 20, "player:1"),
  bullet(10, 20, "enemy:1"),
  bullet(10, 20, "enemy:2")
];
assert.equal(resolveBulletCollisions(orderedTriple), 1);
assert.deepEqual(orderedTriple.map((entry) => entry.remove), [true, true, false]);

console.log("projectile-collision-rules unit test passed");
