const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/audio-player-shoot-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createAudioPlayerShootDiagnostics(), /scope must be an object/);

const api = diagnostics.createAudioPlayerShootDiagnostics({
  FREE_AUDIO_MANIFEST: {
    events: {
      playerShoot: {
        durationFrames: 15,
        voices: [{ duration: 15, wave: "square" }]
      }
    }
  },
  fixedFrameVoiceDuration(voice) {
    return voice.duration;
  },
  playerShootAudioPresentation(frame) {
    return {
      frame,
      voices: frame < 15
        ? [{ frequency: 1165, gain: 0.3, wave: "square" }]
        : [null]
    };
  }
});

assert.equal(Object.isFrozen(api), true);
assert.deepEqual(api.debugPlayerShootAudioProbe(), {
  durationFrames: 15,
  voiceDurations: [15],
  waves: ["square"],
  frames: [
    { frame: 0, voices: [{ frequency: 1165, gain: 0.3, wave: "square" }] },
    { frame: 14, voices: [{ frequency: 1165, gain: 0.3, wave: "square" }] },
    { frame: 15, voices: [null] }
  ]
});

console.log("audio-player-shoot-diagnostics unit test passed");
