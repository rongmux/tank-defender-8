const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { buttons, context, listeners } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;
const action = (name) => buttons.find((button) => button.dataset.action === name);

function keyPress(code) {
  listeners.keydown({
    code,
    repeat: false,
    shiftKey: false,
    preventDefault() {}
  });
  listeners.keyup({ code });
}

assert(modules.editorRules, "editor rules module should register before game.js");
assert.equal(Object.isFrozen(modules.editorRules), true);
assert(modules.editorInputRuntime, "editor input runtime should register before game.js");
assert.equal(Object.isFrozen(modules.editorInputRuntime), true);

action("edit").click();
action("clear").click();
let snapshot = JSON.parse(JSON.stringify(api.debugSnapshot()));
assert.equal(snapshot.editorBrush, "brick");
assert.deepEqual(snapshot.editorCursor, { qc: 0, qr: 0 });
assert.equal(snapshot.editorPattern, 0);
assert.equal(snapshot.editorPatternArmed, false);

keyPress("Space");
snapshot = JSON.parse(JSON.stringify(api.debugSnapshot()));
assert.equal(snapshot.editorPattern, 0);
assert.equal(snapshot.editorPatternArmed, true);
assert.equal(snapshot.editorQuadrants[0].slice(0, 2), ".B");
assert.equal(snapshot.editorQuadrants[1].slice(0, 2), ".B");

keyPress("Space");
snapshot = JSON.parse(JSON.stringify(api.debugSnapshot()));
assert.equal(snapshot.editorPattern, 1);
assert.equal(snapshot.editorQuadrants[0].slice(0, 2), "..");
assert.equal(snapshot.editorQuadrants[1].slice(0, 2), "BB");

keyPress("ArrowRight");
keyPress("KeyF");
snapshot = JSON.parse(JSON.stringify(api.debugSnapshot()));
assert.deepEqual(snapshot.editorCursor, { qc: 2, qr: 0 });
assert.equal(snapshot.editorPattern, 1);
assert.equal(snapshot.editorQuadrants[1].slice(2, 4), "BB");

keyPress("KeyF");
snapshot = JSON.parse(JSON.stringify(api.debugSnapshot()));
assert.equal(snapshot.editorPattern, 0);
assert.equal(snapshot.editorQuadrants[0].slice(2, 4), ".B");

keyPress("KeyD");
keyPress("KeyS");
snapshot = JSON.parse(JSON.stringify(api.debugSnapshot()));
assert.deepEqual(snapshot.editorCursor, { qc: 4, qr: 2 });

keyPress("Digit2");
snapshot = JSON.parse(JSON.stringify(api.debugSnapshot()));
assert.equal(snapshot.editorBrush, "steel");

console.log("editor-rules integration test passed");
