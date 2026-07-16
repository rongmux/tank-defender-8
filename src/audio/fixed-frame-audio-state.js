(function (root, factory) {
  "use strict";

  const isCommonJs = typeof module === "object" && module.exports;
  const browserModules = isCommonJs
    ? null
    : (root.TankDefender8Modules || (root.TankDefender8Modules = {}));
  const api = factory();
  if (isCommonJs) {
    module.exports = api;
    return;
  }

  browserModules.fixedFrameAudioState = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const FIXED_FRAME_AUDIO_UPDATE_MODE = Object.freeze({
    INACTIVE: "inactive",
    HELD: "held",
    ADVANCE: "advance"
  });

  function createFixedFrameAudioState() {
    return {
      active: false,
      frame: 0,
      nodes: []
    };
  }

  function beginFixedFrameAudioState(state) {
    state.active = true;
    state.frame = 0;
    return state;
  }

  function resetFixedFrameAudioState(state) {
    state.active = false;
    state.frame = 0;
    return state;
  }

  function fixedFrameAudioUpdateMode(state, paused, runsWhilePaused) {
    if (!state || !state.active) return FIXED_FRAME_AUDIO_UPDATE_MODE.INACTIVE;
    if (paused && !runsWhilePaused) return FIXED_FRAME_AUDIO_UPDATE_MODE.HELD;
    return FIXED_FRAME_AUDIO_UPDATE_MODE.ADVANCE;
  }

  function advanceFixedFrameAudioState(state, durationFrames) {
    const duration = Math.max(1, Math.floor(Number(durationFrames) || 1));
    state.frame += 1;
    if (state.frame < duration) return false;
    state.active = false;
    state.frame = duration;
    return true;
  }

  return Object.freeze({
    FIXED_FRAME_AUDIO_UPDATE_MODE,
    advanceFixedFrameAudioState,
    beginFixedFrameAudioState,
    createFixedFrameAudioState,
    fixedFrameAudioUpdateMode,
    resetFixedFrameAudioState
  });
});
