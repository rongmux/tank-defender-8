const assert = require("assert").strict;
const runtime = require("../../src/runtime/stage-select-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupStageSelectRuntime({}, {}, {}),
  /state\.game must be an object/
);

const events = [];
const state = {
  game: { frameLow: 0 },
  fn: {},
  keys: new Set(),
  pendingStageSelectPresses: new Set()
};
const api = runtime.setupStageSelectRuntime(state, {}, {
  changeStageSelection(delta) {
    events.push(delta);
  }
});

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), [
  "stageSelectAHeld",
  "stageSelectBHeld",
  "updateStageSelectControls"
]);
assert.equal(state.fn.updateStageSelectControls, api.updateStageSelectControls);
assert.equal(api.stageSelectAHeld(new Set(["Space"])), true);
assert.equal(api.stageSelectAHeld(new Set(["KeyZ"])), true);
assert.equal(api.stageSelectAHeld(new Set(["KeyF"])), false);
assert.equal(api.stageSelectBHeld(new Set(["KeyF"])), true);
assert.equal(api.stageSelectBHeld(new Set(["KeyX"])), true);

state.pendingStageSelectPresses.add("Space");
api.updateStageSelectControls();
assert.deepEqual(events, [1]);
assert.equal(state.pendingStageSelectPresses.size, 0);

state.keys.add("KeyF");
state.game.frameLow = 1;
api.updateStageSelectControls();
assert.deepEqual(events, [1]);
state.game.frameLow = 8;
api.updateStageSelectControls();
assert.deepEqual(events, [1, -1]);

state.pendingStageSelectPresses.add("KeyZ");
state.pendingStageSelectPresses.add("KeyX");
api.updateStageSelectControls();
assert.deepEqual(events, [1, -1, 1]);

console.log("stage-select-runtime unit test passed");
