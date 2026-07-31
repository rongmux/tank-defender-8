const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/audio-power-up-pickup-diagnostics");

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createAudioPowerUpPickupDiagnostics(), /scope must be an object/);

const api = diagnostics.createAudioPowerUpPickupDiagnostics({
  FREE_AUDIO_MANIFEST: {
    events: {
      powerUp: {
        durationFrames: 39,
        voices: [{ duration: 39, wave: "square" }]
      }
    }
  },
  fixedFrameVoiceDuration(voice) {
    return voice.duration;
  },
  powerUpPickupAudioPresentation(frame) {
    return {
      frame,
      voices: frame < 39
        ? [{ frequency: 988 - frame, gain: 0.3, wave: "square" }]
        : [null]
    };
  }
});

assert.equal(Object.isFrozen(api), true);
const sampledFrames = [0, 2, 3, 35, 36, 38, 39];
assert.deepEqual(api.debugPowerUpPickupAudioProbe(), {
  durationFrames: 39,
  voiceDurations: [39],
  waves: ["square"],
  frames: sampledFrames.map((frame) => ({
    frame,
    voices: frame < 39
      ? [{ frequency: 988 - frame, gain: 0.3, wave: "square" }]
      : [null]
  }))
});

console.log("audio-power-up-pickup-diagnostics unit test passed");
