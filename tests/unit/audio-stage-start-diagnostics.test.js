const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/audio-stage-start-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createAudioStageStartDiagnostics(), /scope must be an object/);

const api = diagnostics.createAudioStageStartDiagnostics({
  FREE_AUDIO_MANIFEST: {
    events: {
      stageStart: {
        durationFrames: 264,
        voices: [{ duration: 264, wave: "square" }]
      }
    }
  },
  fixedFrameVoiceDuration(voice) {
    return voice.duration;
  },
  stageStartAudioPresentation(frame) {
    return {
      frame,
      voices: frame < 264
        ? [{ frequency: 392, gain: 0.2, wave: "square" }]
        : [null]
    };
  }
});

assert.equal(Object.isFrozen(api), true);
const sampledFrames = [0, 7, 8, 47, 48, 94, 95, 263, 264];
assert.deepEqual(api.debugStageStartAudioProbe(), {
  durationFrames: 264,
  voiceDurations: [264],
  waves: ["square"],
  frames: sampledFrames.map((frame) => ({
    frame,
    voices: frame < 264
      ? [{ frequency: 392, gain: 0.2, wave: "square" }]
      : [null]
  }))
});

console.log("audio-stage-start-diagnostics unit test passed");
