const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/audio-enemy-hit-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createAudioEnemyHitDiagnostics(), /scope must be an object/);

const api = diagnostics.createAudioEnemyHitDiagnostics({
  FREE_AUDIO_MANIFEST: {
    events: {
      enemyHit: {
        durationFrames: 6,
        voices: [{ duration: 6, wave: "square" }]
      }
    }
  },
  fixedFrameVoiceDuration(voice) {
    return voice.duration;
  },
  enemyHitAudioPresentation(frame) {
    return {
      voices: frame < 6
        ? [{ frequency: [196, 247, 294, 247, 196, 147][frame], gain: 0.25, wave: "square" }]
        : [null]
    };
  }
});

assert.equal(Object.isFrozen(api), true);
assert.deepEqual(api.debugEnemyHitAudioProbe(), {
  durationFrames: 6,
  voiceDurations: [6],
  waves: ["square"],
  frames: [
    { voices: [{ frequency: 196, gain: 0.25, wave: "square" }] },
    { voices: [{ frequency: 247, gain: 0.25, wave: "square" }] },
    { voices: [{ frequency: 294, gain: 0.25, wave: "square" }] },
    { voices: [{ frequency: 247, gain: 0.25, wave: "square" }] },
    { voices: [{ frequency: 196, gain: 0.25, wave: "square" }] },
    { voices: [{ frequency: 147, gain: 0.25, wave: "square" }] }
  ]
});

console.log("audio-enemy-hit-diagnostics unit test passed");
