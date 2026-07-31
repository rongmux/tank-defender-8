const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/audio-base-hit-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createAudioBaseHitDiagnostics(), /scope must be an object/);

const api = diagnostics.createAudioBaseHitDiagnostics({
  FREE_AUDIO_MANIFEST: {
    events: {
      baseHit: {
        durationFrames: 28,
        voices: [{ duration: 28, wave: "triangle" }]
      }
    }
  },
  fixedFrameVoiceDuration(voice) {
    return voice.duration;
  },
  baseHitAudioPresentation(frame) {
    return {
      frame,
      voices: frame < 28
        ? [{ frequency: 180 + frame, gain: 0.45, wave: "triangle" }]
        : [null]
    };
  }
});

assert.equal(Object.isFrozen(api), true);
const sampledFrames = [0, 2, 3, 5, 6, 8, 9, 11, 12, 14, 15, 17, 18, 20, 21, 23, 24, 26, 27];
assert.deepEqual(api.debugBaseHitAudioProbe(), {
  durationFrames: 28,
  voiceDurations: [28],
  waves: ["triangle"],
  frames: sampledFrames.map((frame) => ({
    frame,
    voices: [{ frequency: 180 + frame, gain: 0.45, wave: "triangle" }]
  }))
});

console.log("audio-base-hit-diagnostics unit test passed");
