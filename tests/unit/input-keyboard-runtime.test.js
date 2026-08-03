const assert = require("assert").strict;
const runtime = require("../../src/runtime/input-keyboard-runtime");

assert.equal(Object.isFrozen(runtime), true);
assert.throws(
  () => runtime.createInputKeyboardHandlers(),
  /scope must be an object/
);

const calls = [];
const game = { demoMode: false, paused: false, screen: "title", stage: 3 };
const keys = new Set();
const callbacks = new Proxy({
  hiddenMessageTriggerReady() { return false; },
  initAudio() { calls.push(["initAudio"]); },
  moveTitleMenu(delta) { calls.push(["moveTitleMenu", delta]); },
  recordHiddenTitleInput() { return false; },
  reserveTitleDirectionForHiddenInput() { return false; }
}, {
  get(target, name) {
    return target[name] || function () {};
  }
});
const api = runtime.createInputKeyboardHandlers({
  callbacks,
  commandApi: {
    isPauseInputCode() { return false; },
    togglePause() { calls.push(["togglePause"]); }
  },
  game,
  isEditorDirectionCode() { return false; },
  keys,
  pendingFirePresses: new Set(),
  pendingStageSelectPresses: new Set()
});

assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), ["handleKeyDown", "handleKeyUp"]);
let prevented = false;
api.handleKeyDown({
  code: "KeyS",
  repeat: false,
  preventDefault() { prevented = true; }
});
assert.equal(prevented, true);
assert.deepEqual(calls, [["initAudio"], ["moveTitleMenu", 1]]);
api.handleKeyUp({ code: "KeyS" });
assert.equal(keys.has("KeyS"), false);

game.screen = "playing";
api.handleKeyDown({ code: "Space", repeat: false, preventDefault() {} });
assert.equal(keys.has("Space"), true);

console.log("input-keyboard-runtime unit test passed");
