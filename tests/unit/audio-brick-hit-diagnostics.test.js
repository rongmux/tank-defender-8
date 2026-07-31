const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/audio-brick-hit-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createAudioBrickHitDiagnostics(), /scope must be an object/);

const api = diagnostics.createAudioBrickHitDiagnostics({
  FREE_AUDIO_MANIFEST: {
    events: {
      brickHit: {
        durationFrames: 3,
        voices: [{ duration: 3, wave: "triangle" }]
      }
    }
  },
  fixedFrameVoiceDuration(voice) {
    return voice.duration;
  },
  brickHitAudioPresentation(frame) {
    return {
      voices: frame < 3
        ? [{ frequency: [165, 246, 139][frame], gain: 0.3, wave: "triangle" }]
        : [null]
    };
  }
});

assert.equal(Object.isFrozen(api), true);
assert.deepEqual(api.debugBrickHitAudioProbe(), {
  durationFrames: 3,
  voiceDurations: [3],
  waves: ["triangle"],
  frames: [
    { voices: [{ frequency: 165, gain: 0.3, wave: "triangle" }] },
    { voices: [{ frequency: 246, gain: 0.3, wave: "triangle" }] },
    { voices: [{ frequency: 139, gain: 0.3, wave: "triangle" }] },
    { voices: [null] }
  ]
});

console.log("audio-brick-hit-diagnostics unit test passed");
