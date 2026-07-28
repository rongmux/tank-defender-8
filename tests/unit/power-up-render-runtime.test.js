const assert = require("assert").strict;
const runtime = require("../../src/runtime/power-up-render-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupPowerUpRenderRuntime({}, {}, {}),
  /state\.game must be an object/
);

const calls = [];
const state = {
  ctx: {
    fillStyle: "",
    fillRect(...args) {
      calls.push(["fillRect", ...args]);
    }
  },
  game: {},
  fn: {}
};
let displayFrame = 8;
const deps = {
  sharedState: { FIELD_X: 10, FIELD_Y: 20 },
  FREE_SPRITE_MANIFEST: { sprites: { powerUp: { size: 16 } } },
  POWERUP_SIZE: 12
};
const api = runtime.setupPowerUpRenderRuntime(state, deps, {
  battleDisplayFrame() {
    return displayFrame;
  },
  drawManifestSprite(...args) {
    calls.push(["sprite", ...args]);
  }
});

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), ["drawPowerUp", "isPowerUpVisible", "powerUpVisualRect"]);
assert.equal(state.fn.drawPowerUp, api.drawPowerUp);
assert.equal(api.isPowerUpVisible(8), true);
assert.equal(api.isPowerUpVisible(7), false);
assert.equal(api.isPowerUpVisible(24), true);
assert.deepEqual(api.powerUpVisualRect({ x: 30, y: 40, w: 12 }), {
  x: 38,
  y: 58,
  w: 16,
  h: 16
});

api.drawPowerUp({ type: "star", x: 30, y: 40, w: 12 });
assert.deepEqual(calls, [
  ["fillRect", 38, 58, 16, 16],
  ["fillRect", 40, 60, 12, 12],
  ["fillRect", 41, 61, 10, 1],
  ["sprite", "powerUp", "star", 38, 58, {
    outline: "#102748",
    primary: "#f3f0d4",
    shade: "#77869a",
    cutout: "#aab4c2"
  }]
]);

calls.length = 0;
displayFrame = 0;
api.drawPowerUp({ type: "grenade", x: 1, y: 2, w: 12 });
assert.deepEqual(calls, []);

console.log("power-up-render-runtime unit test passed");
