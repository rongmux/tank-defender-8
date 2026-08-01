"use strict";

const assert = require("assert").strict;
const runtime = require("../../src/runtime/audio-fixed-frame-runtime");

assert.equal(Object.isFrozen(runtime), true);
assert.equal(typeof runtime.setupAudioFixedFrameRuntime, "function");

const state = {
  audio: {},
  audioCtx: null,
  fn: {},
  game: { paused: false },
  noiseBufferCache: {}
};
const deps = {
  FREE_AUDIO_MANIFEST: { events: {} },
  fixedFrameAudioPresentation() {
    return { durationFrames: 1, voices: [] };
  }
};
runtime.setupAudioFixedFrameRuntime(state, deps);
assert.equal(typeof state.fn.fixedFrameAudioPresentation, "function");
assert.equal(typeof state.fn.shortNoiseBuffer, "function");
assert.equal(typeof state.fn.longNoiseBuffer, "function");
assert.equal(typeof state.fn.createFixedFrameAudioSource, "function");
assert.equal(typeof state.fn.stopFixedFrameAudioNodes, "function");
assert.equal(typeof state.fn.syncFixedFrameAudioNodes, "function");
assert.equal(typeof state.fn.startFixedFrameAudio, "function");
assert.equal(typeof state.fn.stopFixedFrameAudio, "function");
assert.equal(typeof state.fn.updateFixedFrameAudio, "function");
assert.equal(state.fn.shortNoiseBuffer(27965), null);
assert.equal(state.fn.longNoiseBuffer(3523), null);

console.log("audio-fixed-frame-runtime unit test passed");
