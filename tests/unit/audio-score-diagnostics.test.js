const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/audio-score-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createAudioScoreDiagnostics(), /scope must be an object/);

const api = diagnostics.createAudioScoreDiagnostics({
  FREE_AUDIO_MANIFEST: {
    events: {
      scoreCount: {
        durationFrames: 2,
        voices: [{ duration: 1 }, { duration: 2 }]
      }
    }
  },
  fixedFrameVoiceDuration(voice) {
    return voice.duration;
  },
  scoreCountAudioPresentation(frame) {
    return {
      voices: [
        { frequency: 440 + frame, gain: 0.5, wave: "pulse2" },
        null
      ]
    };
  }
});

assert.equal(Object.isFrozen(api), true);
assert.deepEqual(api.debugScoreCountAudioProbe(), {
  durationFrames: 2,
  voiceDurations: [1, 2],
  frames: [
    {
      frame: 0,
      voices: [
        { frequency: 440, gain: 0.5, wave: "pulse2" },
        null
      ]
    },
    {
      frame: 1,
      voices: [
        { frequency: 441, gain: 0.5, wave: "pulse2" },
        null
      ]
    }
  ]
});

console.log("audio-score-diagnostics unit test passed");
