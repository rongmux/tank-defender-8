const assert = require("assert").strict;
const projectileImpactRules = require("../../src/rules/projectile-impact-rules");

const {
  projectileBoundaryImpactPoint,
  projectileOutsideField,
  wallHitSoundName
} = projectileImpactRules;

const FIELD_SIZE = 208;
const PADDING = 4;
const projectile = (x, y, ownerKind) => ({ x, y, w: 4, h: 4, ownerKind: ownerKind || "player" });

assert.equal(Object.isFrozen(projectileImpactRules), true);
assert.equal(projectileOutsideField(projectile(-PADDING, 100), FIELD_SIZE, FIELD_SIZE, PADDING), false);
assert.equal(projectileOutsideField(projectile(-PADDING - 0.01, 100), FIELD_SIZE, FIELD_SIZE, PADDING), true);
assert.equal(projectileOutsideField(projectile(FIELD_SIZE + PADDING, 100), FIELD_SIZE, FIELD_SIZE, PADDING), false);
assert.equal(projectileOutsideField(projectile(FIELD_SIZE + PADDING + 0.01, 100), FIELD_SIZE, FIELD_SIZE, PADDING), true);
assert.equal(projectileOutsideField(projectile(100, -PADDING), FIELD_SIZE, FIELD_SIZE, PADDING), false);
assert.equal(projectileOutsideField(projectile(100, FIELD_SIZE + PADDING + 0.01), FIELD_SIZE, FIELD_SIZE, PADDING), true);

assert.deepEqual(projectileBoundaryImpactPoint(projectile(-5, 104), FIELD_SIZE, FIELD_SIZE), { x: 0, y: 106 });
assert.deepEqual(projectileBoundaryImpactPoint(projectile(213, 104), FIELD_SIZE, FIELD_SIZE), { x: 208, y: 106 });
assert.deepEqual(projectileBoundaryImpactPoint(projectile(104, -5), FIELD_SIZE, FIELD_SIZE), { x: 106, y: 0 });
assert.deepEqual(projectileBoundaryImpactPoint(projectile(104, 213), FIELD_SIZE, FIELD_SIZE), { x: 106, y: 208 });

assert.equal(wallHitSoundName(projectile(0, 0, "enemy"), false, true), null);
assert.equal(wallHitSoundName(projectile(0, 0, "player"), false, true), "brickHit");
assert.equal(wallHitSoundName(projectile(0, 0, "player"), true, false), "steelHit");
assert.equal(wallHitSoundName(projectile(0, 0, "player"), true, true), "brickHit");

console.log("projectile-impact-rules unit test passed");
