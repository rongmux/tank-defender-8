const assert = require("assert").strict;
const runtime = require("../../src/runtime/sprite-render-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupSpriteRenderRuntime({}, {}),
  /state\.ctx must be an object/
);

const calls = [];
const state = {
  ctx: {
    fillStyle: "",
    strokeStyle: "",
    fillRect(...args) {
      calls.push(["fillRect", ...args]);
    },
    strokeRect(...args) {
      calls.push(["strokeRect", ...args]);
    }
  },
  fn: {}
};
const api = runtime.setupSpriteRenderRuntime(state, {
  FREE_SPRITE_MANIFEST: {
    sprites: {
      demo: {
        frames: {
          frame: [
            { role: "primary", rect: [1, 2, 3, 4] },
            { role: "accent", rect: [5, 6, 7, 8], op: "stroke", color: "#fallback" },
            { rect: [9, 10, 11, 12], color: "#part" }
          ]
        }
      }
    }
  }
});

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), ["drawManifestSprite", "drawScaledManifestSprite"]);
assert.equal(state.fn.drawManifestSprite, api.drawManifestSprite);

api.drawManifestSprite("demo", "frame", 10, 20, { primary: "#primary" });
assert.deepEqual(calls, [
  ["fillRect", 11, 22, 3, 4],
  ["strokeRect", 15, 26, 7, 8],
  ["fillRect", 19, 30, 11, 12]
]);

calls.length = 0;
api.drawScaledManifestSprite("demo", "frame", 10, 20, 0.5, {
  primary: "#primary",
  accent: "#accent"
});
assert.deepEqual(calls, [
  ["fillRect", 10.5, 21, 1.5, 2],
  ["strokeRect", 12.5, 23, 3.5, 4],
  ["fillRect", 14.5, 25, 5.5, 6]
]);

calls.length = 0;
api.drawManifestSprite("demo", "missing", 0, 0, {});
assert.deepEqual(calls, []);

console.log("sprite-render-runtime unit test passed");
