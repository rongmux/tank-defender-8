(function (root, factory) {
  "use strict";

  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  const modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.frameCounter = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function byte(value) {
    return Math.floor(Number(value) || 0) & 0xff;
  }

  function frameCounterState(source) {
    return {
      frameLow: byte(source && source.frameLow),
      frameHigh: byte(source && source.frameHigh)
    };
  }

  function advanceFrameCounter(source) {
    const next = frameCounterState(source);
    next.frameLow = (next.frameLow + 1) & 0xff;
    if ((next.frameLow & 0x3f) === 0) next.frameHigh = (next.frameHigh + 1) & 0xff;
    return next;
  }

  function resetFrameCounter(source, resetLow = true, resetHigh = true) {
    const next = frameCounterState(source);
    if (resetLow) next.frameLow = 0;
    if (resetHigh) next.frameHigh = 0;
    return next;
  }

  return Object.freeze({
    advanceFrameCounter,
    frameCounterState,
    resetFrameCounter
  });
});
