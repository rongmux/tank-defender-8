const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/audio-steel-hit-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createAudioSteelHitDiagnostics(), /scope must be an object/);

const api = diagnostics.createAudioSteelHitDiagnostics({
  FREE_AUDIO_MANIFEST: {
    events: {
      steelHit: {
        durationFrames: 5,
        voices: [{ duration: 5, wave: "triangle" }]
      }
    }
  },
  fixedFrameVoiceDuration(voice) {
    return voice.duration;
  },
  steelHitAudioPresentation(frame) {
    return {
      voices: frame < 5
        ? [{ frequency: [110, 147, 196, 147, 110][frame], gain: 0.3, wave: "triangle" }]
        : [null]
    };
  }
});

assert.equal(Object.isFrozen(api), true);
assert.deepEqual(api.debugSteelHitAudioProbe(), {
  durationFrames: 5,
  voiceDurations: [5],
  waves: ["triangle"],
  frames: [
    { voices: [{ frequency: 110, gain: 0.3, wave: "triangle" }] },
    { voices: [{ frequency: 147, gain: 0.3, wave: "triangle" }] },
    { voices: [{ frequency: 196, gain: 0.3, wave: "triangle" }] },
    { voices: [{ frequency: 147, gain: 0.3, wave: "triangle" }] },
    { voices: [{ frequency: 110, gain: 0.3, wave: "triangle" }] }
  ]
});

console.log("audio-steel-hit-diagnostics unit test passed");
