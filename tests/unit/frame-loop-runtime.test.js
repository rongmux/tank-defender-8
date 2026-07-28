const assert = require("assert").strict;
const runtime = require("../../src/runtime/frame-loop-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupFrameLoopRuntime({}, {}, {}),
  /state\.fn must be an object/
);

const events = [];
const stepMs = 10;
let clock = 1000;
let scheduledFrame = null;
const state = { fn: {} };
const api = runtime.setupFrameLoopRuntime(state, {}, {
  now() {
    events.push(["now"]);
    return clock;
  },
  render() {
    events.push(["render"]);
  },
  requestAnimationFrame(callback) {
    events.push(["raf"]);
    scheduledFrame = callback;
  },
  stepMs() {
    events.push(["step"]);
    return stepMs;
  },
  update() {
    events.push(["update"]);
  }
});

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), ["MAX_FRAME_DELTA_MS", "frame", "start"]);
assert.equal(api.MAX_FRAME_DELTA_MS, 80);
assert.equal(state.fn.frame, api.frame);

api.start();
assert.deepEqual(events, [["step"], ["now"], ["raf"]]);

events.length = 0;
scheduledFrame(clock + stepMs / 2);
assert.deepEqual(events, [["render"], ["raf"]]);

events.length = 0;
scheduledFrame(clock + stepMs);
assert.deepEqual(events, [["update"], ["render"], ["raf"]]);

events.length = 0;
scheduledFrame(clock + stepMs * 5);
assert.deepEqual(events, [
  ["update"], ["update"], ["update"], ["update"],
  ["render"], ["raf"]
]);

events.length = 0;
clock = 2000;
api.start();
events.length = 0;
scheduledFrame(clock + 500);
assert.deepEqual(events, [
  ["update"], ["update"], ["update"], ["update"],
  ["update"], ["update"], ["update"], ["update"],
  ["render"], ["raf"]
]);

console.log("frame-loop-runtime unit test passed");
