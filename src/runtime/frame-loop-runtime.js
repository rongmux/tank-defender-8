(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.frameLoopRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var MAX_FRAME_DELTA_MS = 80;
  var CALLBACK_NAMES = ["now", "render", "requestAnimationFrame", "stepMs", "update"];

  function requireInputs(state, callbacks) {
    if (!state || typeof state !== "object") throw new Error("state must be an object");
    if (!state.fn || typeof state.fn !== "object") throw new Error("state.fn must be an object");
    if (!callbacks || typeof callbacks !== "object") throw new Error("callbacks must be an object");
    for (var i = 0; i < CALLBACK_NAMES.length; i += 1) {
      var name = CALLBACK_NAMES[i];
      if (typeof callbacks[name] !== "function") {
        throw new Error("callbacks." + name + " must be a function");
      }
    }
  }

  /** Owns the fixed 60 Hz accumulator, render scheduling, and long-gap clamp. */
  function setupFrameLoopRuntime(state, deps, callbacks) {
    requireInputs(state, callbacks);

    var now = callbacks.now;
    var render = callbacks.render;
    var requestAnimationFrame = callbacks.requestAnimationFrame;
    var stepMs = callbacks.stepMs;
    var update = callbacks.update;
    var fixedStepMs = stepMs();
    var last = 0;
    var accumulator = 0;
    var started = false;

    function frame(timestamp) {
      if (!started) {
        started = true;
        last = timestamp;
      }
      var elapsed = Math.min(MAX_FRAME_DELTA_MS, timestamp - last);
      last = timestamp;
      accumulator += elapsed;
      while (accumulator >= fixedStepMs) {
        update();
        accumulator -= fixedStepMs;
      }
      render();
      requestAnimationFrame(frame);
    }

    function start() {
      started = true;
      last = now();
      accumulator = 0;
      requestAnimationFrame(frame);
    }

    var api = {
      MAX_FRAME_DELTA_MS: MAX_FRAME_DELTA_MS,
      frame: frame,
      start: start
    };
    Object.assign(state.fn, api);
    return Object.freeze(api);
  }

  return Object.freeze({ setupFrameLoopRuntime: setupFrameLoopRuntime });
});
