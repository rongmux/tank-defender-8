const assert = require("assert").strict;
const {
  DEFAULT_EXPLOSION_CORE_COLOR,
  DEFAULT_EXPLOSION_RULES,
  cloneExplosionRules,
  normalizeExplosionRules
} = require("../../src/config/explosion-settings");

assert.equal(DEFAULT_EXPLOSION_CORE_COLOR, "#f7f1c6");
assert.deepEqual(DEFAULT_EXPLOSION_RULES, {
  bulletCancel: { ttl: 10, color: "#f8e08b", coreColor: "#f7f1c6" },
  baseDestroy: { ttl: 35, color: "#f05a42", coreColor: "#f7f1c6" },
  brickHit: { ttl: 9, color: "#d08b52", coreColor: "#f7f1c6" },
  steelHit: { ttl: 9, color: "#dbe0ef", coreColor: "#f7f1c6" },
  steelBlocked: { ttl: 9, color: "#dbe0ef", coreColor: "#f7f1c6" },
  enemyHit: { ttl: 9, color: "#ffffff", coreColor: "#f7f1c6" },
  enemyDestroy: { ttl: 18, color: "#f0b546", coreColor: "#f7f1c6" },
  playerStun: { ttl: 9, color: "#f7f1c6", coreColor: "#f7f1c6" },
  playerDestroy: { ttl: 18, color: "#f05a42", coreColor: "#f7f1c6" }
});
assert(Object.isFrozen(DEFAULT_EXPLOSION_RULES));
assert(Object.values(DEFAULT_EXPLOSION_RULES).every(Object.isFrozen));

const firstClone = cloneExplosionRules(DEFAULT_EXPLOSION_RULES);
const secondClone = cloneExplosionRules(DEFAULT_EXPLOSION_RULES);
assert.deepEqual(firstClone, DEFAULT_EXPLOSION_RULES);
firstClone.enemyDestroy.ttl = 99;
assert.equal(secondClone.enemyDestroy.ttl, 18);
assert.equal(DEFAULT_EXPLOSION_RULES.enemyDestroy.ttl, 18);

assert.deepEqual(normalizeExplosionRules(), cloneExplosionRules(DEFAULT_EXPLOSION_RULES));
const custom = normalizeExplosionRules({
  enemyDestroy: { ttl: "22", color: "#123456", coreColor: "#ABCDEF" }
});
assert.deepEqual(custom.enemyDestroy, { ttl: 22, color: "#123456", coreColor: "#ABCDEF" });
assert.deepEqual(custom.playerDestroy, DEFAULT_EXPLOSION_RULES.playerDestroy);

assert.throws(() => normalizeExplosionRules(true), /explosionRules must be an object/);
assert.throws(() => normalizeExplosionRules([]), /explosionRules must be an object/);
assert.throws(() => normalizeExplosionRules({ enemyDestroy: [] }), /enemyDestroy must be an object/);
assert.throws(() => normalizeExplosionRules({ enemyDestroy: null }), /enemyDestroy must be an object/);
for (const ttl of [0, 1.5, 3601]) {
  assert.throws(() => normalizeExplosionRules({ enemyDestroy: { ttl } }), /enemyDestroy\.ttl/);
}
assert.throws(() => normalizeExplosionRules({ enemyDestroy: { color: "orange" } }), /enemyDestroy\.color/);
assert.throws(() => normalizeExplosionRules({ enemyDestroy: { coreColor: "#abcd" } }), /enemyDestroy\.coreColor/);

console.log("explosion-settings unit test passed");
