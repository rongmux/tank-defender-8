const assert = require("assert").strict;
const runtime = require("../../src/runtime/text-render-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupTextRenderRuntime({}, {}),
  /state\.ctx must be an object/
);

const calls = [];
const state = {
  ctx: {
    fillStyle: "",
    fillRect(...args) {
      calls.push(["fillRect", ...args]);
    }
  },
  fn: {}
};
const api = runtime.setupTextRenderRuntime(state, {
  pixelGlyph(char) {
    return char === "A" ? ["10", "01"] : ["11", "00"];
  },
  rightAlignedPixelTextX(value, right, size) {
    calls.push(["rightX", value, right, size]);
    return 30;
  }
});

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), ["drawText", "drawTextClipped", "drawTextRight"]);
assert.equal(state.fn.drawText, api.drawText);

api.drawText("a", 10.4, 20.7, 2, "#accent", 5);
assert.equal(state.ctx.fillStyle, "#accent");
assert.deepEqual(calls, [
  ["fillRect", 10, 21, 2, 2],
  ["fillRect", 12, 23, 2, 2]
]);

calls.length = 0;
api.drawTextClipped("a", 10, 20, 1, "#clip", [{ x: 10, y: 20, w: 1, h: 1 }]);
assert.deepEqual(calls, [["fillRect", 10, 20, 1, 1]]);

calls.length = 0;
api.drawTextClipped("a", 10, 20, 1, "#clip", []);
assert.deepEqual(calls, []);

calls.length = 0;
api.drawTextRight("a", 88, 40, 1, "#right");
assert.deepEqual(calls, [
  ["rightX", "a", 88, 1],
  ["fillRect", 30, 40, 1, 1],
  ["fillRect", 31, 41, 1, 1]
]);

console.log("text-render-runtime unit test passed");
