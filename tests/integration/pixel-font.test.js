const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const {
  animationFrameCallback,
  canvasContext,
  context
} = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.pixelFont, "pixel font module should register before game.js");
assert.equal(Object.isFrozen(modules.pixelFont), true);

canvasContext.calls.length = 0;
animationFrameCallback(16);
assert.equal(canvasContext.calls.some((call) => call.op === "fillText"), false);
assert.equal(canvasContext.calls.some(
  (call) =>
    call.op === "fillRect" &&
    call.style === "#f05a42" &&
    call.w === 5 &&
    call.h === 4
), true);

canvasContext.calls.length = 0;
api.debugRenderFullGameOverFrame(42);
const fullGameOverPixels = canvasContext.calls.filter(
  (call) => call.op === "fillRect" && call.style === "#f05a42"
);
assert.equal(fullGameOverPixels.length > 0, true);
assert.equal(fullGameOverPixels.every((call) => call.w === 5 && call.h === 4), true);
assert.equal(canvasContext.calls.some((call) => call.op === "fillText"), false);

canvasContext.calls.length = 0;
api.debugRenderPauseFrame(16);
const pausePixels = canvasContext.calls.filter(
  (call) => call.op === "fillRect" && call.style === "#f3f0d4"
);
assert.equal(pausePixels.length > 0, true);
assert.equal(pausePixels.every((call) => call.w === 1 && call.h === 1), true);
assert.equal(canvasContext.calls.some((call) => call.op === "fillText"), false);

canvasContext.calls.length = 0;
const compact = JSON.parse(JSON.stringify(api.debugRenderPlayerGameOverMessage(1, 47)));
const compactPixels = canvasContext.calls.filter(
  (call) => call.op === "fillRect" && call.style === "#f05a42"
);
assert.equal(compactPixels.length > 0, true);
assert.equal(compactPixels.every(
  (call) =>
    call.w === 1 &&
    call.h === 1 &&
    call.x >= compact.left &&
    call.x < compact.left + compact.width &&
    call.y >= compact.y &&
    call.y < compact.y + compact.height
), true);
assert.equal(canvasContext.calls.some((call) => call.op === "fillText"), false);

console.log("pixel-font integration test passed");
