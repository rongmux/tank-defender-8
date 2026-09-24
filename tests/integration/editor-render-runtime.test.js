const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { buttons, canvas, canvasContext, context, listeners, animationFrameCallback } = createBrowserGameHarness(root);
const api = context.window.TankDefender8;
const action = (name) => buttons.find((button) => button.dataset.action === name);
let timestamp = 0;

function keyPress(code) {
  listeners.keydown({ code, repeat: false, shiftKey: false, preventDefault() {} });
  listeners.keyup({ code });
}

function renderFrame() {
  canvasContext.calls.length = 0;
  timestamp += 17;
  animationFrameCallback(timestamp);
}

function assertCursor(qc, qr) {
  const x = 16 + qc * 8;
  const y = 16 + qr * 8;
  const markers = new Set(["#fff0a8", "#e3c64e"]);
  assert(canvasContext.calls.some((call) =>
    call.op === "strokeRect" && markers.has(call.style) &&
    call.x === 17 + Math.floor(qc / 2) * 16 && call.y === 17 + Math.floor(qr / 2) * 16 &&
    call.w === 13 && call.h === 13
  ), "editor must render its parent-cell outline through the real module wiring");
  assert(canvasContext.calls.some((call) =>
    call.op === "strokeRect" && markers.has(call.style) &&
    call.x === x + 1 && call.y === y + 1 && call.w === 5 && call.h === 5
  ), "editor must render its selected 8px quadrant");
  const colors = canvasContext.pixelColors({ x, y, w: 2, h: 2 });
  assert.equal((colors["#fff0a8"] || 0) + (colors["#e3c64e"] || 0), 4,
    "cursor corners must remain visible above terrain");
}

action("edit").click();
for (let frame = 0; frame < 24; frame += 1) {
  renderFrame();
  assertCursor(0, 0);
}

keyPress("ArrowRight");
keyPress("KeyS");
keyPress("Space");
renderFrame();
assertCursor(2, 2);
assert.equal(api.debugSnapshot().editorQuadrants[2].slice(2, 4), ".B");

canvas.listeners.mousemove({ clientX: 223, clientY: 223 });
canvas.listeners.click({ clientX: 223, clientY: 223, shiftKey: false, altKey: false });
renderFrame();
assertCursor(25, 25);
assert.equal(api.debugSnapshot().editorQuadrants[25][25], "B");

const previousGrid = JSON.stringify(api.debugSnapshot().editorQuadrants);
for (const modifiers of [
  { shiftKey: false, altKey: false },
  { shiftKey: false, altKey: true },
  { shiftKey: true, altKey: false },
  { shiftKey: true, altKey: true }
]) {
  assert.doesNotThrow(() => canvas.listeners.click({ clientX: 32, clientY: 224, ...modifiers }),
    "clicks below the field must not index a missing row");
}
assert.equal(JSON.stringify(api.debugSnapshot().editorQuadrants), previousGrid);

canvas.listeners.mouseleave();
renderFrame();
assert.equal(canvasContext.calls.some((call) => call.op === "strokeRect"), false,
  "leaving the canvas must hide the out-of-bounds cursor");

keyPress("ArrowLeft");
renderFrame();
assertCursor(0, 0);

console.log("editor-render-runtime integration test passed");
