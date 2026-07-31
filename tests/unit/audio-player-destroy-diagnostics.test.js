const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/audio-player-destroy-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createAudioPlayerDestroyDiagnostics(), /scope must be an object/);

const api = diagnostics.createAudioPlayerDestroyDiagnostics({
  FREE_AUDIO_MANIFEST: {
    events: {
      playerDestroy: {
        durationFrames: 27,
        voices: [{ duration: 27, wave: "triangle" }]
      }
    }
  },
  fixedFrameVoiceDuration(voice) {
    return voice.duration;
  },
  playerDestroyAudioPresentation(frame) {
    return {
      frame,
      voices: frame < 26
        ? [{ frequency: 220 + frame, gain: 0.4, wave: "triangle" }]
        : [null]
    };
  }
});

assert.equal(Object.isFrozen(api), true);
assert.deepEqual(api.debugPlayerDestroyAudioProbe(), {
  durationFrames: 27,
  voiceDurations: [27],
  waves: ["triangle"],
  frames: [
    { frame: 0, voices: [{ frequency: 220, gain: 0.4, wave: "triangle" }] },
    { frame: 3, voices: [{ frequency: 223, gain: 0.4, wave: "triangle" }] },
    { frame: 4, voices: [{ frequency: 224, gain: 0.4, wave: "triangle" }] },
    { frame: 7, voices: [{ frequency: 227, gain: 0.4, wave: "triangle" }] },
    { frame: 8, voices: [{ frequency: 228, gain: 0.4, wave: "triangle" }] },
    { frame: 11, voices: [{ frequency: 231, gain: 0.4, wave: "triangle" }] },
    { frame: 12, voices: [{ frequency: 232, gain: 0.4, wave: "triangle" }] },
    { frame: 15, voices: [{ frequency: 235, gain: 0.4, wave: "triangle" }] },
    { frame: 16, voices: [{ frequency: 236, gain: 0.4, wave: "triangle" }] },
    { frame: 19, voices: [{ frequency: 239, gain: 0.4, wave: "triangle" }] },
    { frame: 20, voices: [{ frequency: 240, gain: 0.4, wave: "triangle" }] },
    { frame: 21, voices: [{ frequency: 241, gain: 0.4, wave: "triangle" }] },
    { frame: 22, voices: [{ frequency: 242, gain: 0.4, wave: "triangle" }] },
    { frame: 23, voices: [{ frequency: 243, gain: 0.4, wave: "triangle" }] },
    { frame: 24, voices: [{ frequency: 244, gain: 0.4, wave: "triangle" }] },
    { frame: 25, voices: [{ frequency: 245, gain: 0.4, wave: "triangle" }] },
    { frame: 26, voices: [null] }
  ]
});

console.log("audio-player-destroy-diagnostics unit test passed");
