const assert = require("assert").strict;
const runtime = require("../../src/runtime/projectile-resolution-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupProjectileResolutionRuntime({}, {}, {}),
  /state\.game must be an object/
);

const state = { game: {}, fn: {} };
const events = [];
const api = runtime.setupProjectileResolutionRuntime(state, {
  sharedState: { FIELD_W: 208, FIELD_H: 208 },
  projectileOutsideField(bullet) {
    return Boolean(bullet.outside);
  },
  projectileBoundaryImpactPoint() {
    return { x: 208, y: 64 };
  },
  wallHitSoundName() {
    return "steel";
  }
}, {
  gameSettings() {
    return { projectileRules: { boundsPadding: 4 } };
  },
  addRuleExplosion(...args) {
    events.push(["explosion", ...args]);
  },
  hitTerrain(bullet) {
    events.push("terrain");
    return Boolean(bullet.terrain);
  },
  hitBase(bullet) {
    events.push("base");
    return Boolean(bullet.base);
  },
  hitTank() {
    events.push("tank");
  },
  playSound(sound) {
    events.push(["sound", sound]);
  }
});

assert(Object.isFrozen(api));
assert.equal(state.fn.resolveBullet, api.resolveBullet);

const boundaryBullet = { outside: true, remove: false };
api.resolveBullet(boundaryBullet);
assert.equal(boundaryBullet.remove, true);
assert.deepEqual(events, [
  ["explosion", "steelBlocked", 208, 64],
  ["sound", "steel"]
]);

events.length = 0;
api.resolveBullet({ terrain: true, remove: false });
assert.deepEqual(events, ["terrain"]);

events.length = 0;
api.resolveBullet({ base: true, remove: false });
assert.deepEqual(events, ["terrain", "base"]);

events.length = 0;
api.resolveBullet({ remove: false });
assert.deepEqual(events, ["terrain", "base", "tank"]);

console.log("projectile-resolution-runtime unit test passed");
