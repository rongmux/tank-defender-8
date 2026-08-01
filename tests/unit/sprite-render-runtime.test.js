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
      },
      miniTank: {
        frames: {
          up: [
            { role: "primary", rect: [0, 0, 4, 4] },
            { role: "shadow", rect: [1, 1, 2, 2] }
          ]
        }
      }
    }
  }
});

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), ["drawManifestSprite", "drawMiniTank", "drawScaledManifestSprite"]);
assert.equal(state.fn.drawManifestSprite, api.drawManifestSprite);
assert.equal(state.fn.drawMiniTank, api.drawMiniTank);

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
api.drawMiniTank(12, 20, "#tank");
assert.deepEqual(calls, [
  ["fillRect", 12, 20, 4, 4],
  ["fillRect", 13, 21, 2, 2]
]);

calls.length = 0;
api.drawMiniTank(12, 20, "#tank", 1);
assert(calls.some((call) => call[0] === "fillRect" && call[1] === 13 && call[2] === 24));

calls.length = 0;
api.drawMiniTank(12, 20, "#tank", 2);
assert(calls.some((call) => call[0] === "fillRect" && call[1] === 17 && call[2] === 21));

calls.length = 0;
api.drawMiniTank(12, 20, "#tank", 3);
assert(calls.some((call) => call[0] === "fillRect" && call[1] === 15 && call[2] === 23 && call[3] === 8 && call[4] === 8));
assert(calls.some((call) => call[0] === "fillRect" && call[1] === 17 && call[2] === 25 && call[3] === 4 && call[4] === 4));
assert(calls.some((call) => call[0] === "strokeRect" && call[1] === 14 && call[2] === 22 && call[3] === 10 && call[4] === 10));

calls.length = 0;
api.drawManifestSprite("demo", "missing", 0, 0, {});
assert.deepEqual(calls, []);

console.log("sprite-render-runtime unit test passed");
