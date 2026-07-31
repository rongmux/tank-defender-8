const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/audio-enemy-destroy-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createAudioEnemyDestroyDiagnostics(), /scope must be an object/);

const api = diagnostics.createAudioEnemyDestroyDiagnostics({
  FREE_AUDIO_MANIFEST: {
    events: {
      enemyDestroy: {
        durationFrames: 15,
        voices: [{ duration: 15, wave: "triangle" }]
      }
    }
  },
  fixedFrameVoiceDuration(voice) {
    return voice.duration;
  },
  enemyDestroyAudioPresentation(frame) {
    return {
      voices: frame < 14
        ? [{ frequency: frame % 2 === 0 ? 330 : 247, gain: 0.35, wave: "triangle" }]
        : [null]
    };
  }
});

assert.equal(Object.isFrozen(api), true);
assert.deepEqual(api.debugEnemyDestroyAudioProbe(), {
  durationFrames: 15,
  voiceDurations: [15],
  waves: ["triangle"],
  frames: [
    { voices: [{ frequency: 330, gain: 0.35, wave: "triangle" }] },
    { voices: [{ frequency: 247, gain: 0.35, wave: "triangle" }] },
    { voices: [{ frequency: 330, gain: 0.35, wave: "triangle" }] },
    { voices: [{ frequency: 247, gain: 0.35, wave: "triangle" }] },
    { voices: [{ frequency: 330, gain: 0.35, wave: "triangle" }] },
    { voices: [{ frequency: 247, gain: 0.35, wave: "triangle" }] },
    { voices: [null] }
  ]
});

console.log("audio-enemy-destroy-diagnostics unit test passed");
