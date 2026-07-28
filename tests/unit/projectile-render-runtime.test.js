const assert = require("assert").strict;
const runtime = require("../../src/runtime/projectile-render-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupProjectileRenderRuntime({}, {}, {}),
  /state\.game must be an object/
);

const calls = [];
const state = { game: {}, fn: {} };
const api = runtime.setupProjectileRenderRuntime(state, {
  sharedState: { FIELD_X: 16, FIELD_Y: 8 },
  FREE_SPRITE_MANIFEST: { sprites: { bullet: { size: 4 } } }
}, {
  drawScaledManifestSprite(...args) {
    calls.push(args);
  }
});

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), ["drawBullet"]);
assert.equal(state.fn.drawBullet, api.drawBullet);

api.drawBullet({ x: 3.2, y: 4.7, w: 8, ownerKind: "player" });
assert.deepEqual(calls[0], [
  "bullet", "default", 19, 13, 2,
  { primary: "#f8e08b" }
]);

calls.length = 0;
api.drawBullet({ x: 10.4, y: 6.1, w: 4, ownerKind: "enemy" });
assert.deepEqual(calls[0], [
  "bullet", "default", 26, 14, 1,
  { primary: "#f7f1c6" }
]);

console.log("projectile-render-runtime unit test passed");
