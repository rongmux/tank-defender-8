const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/screen-flow-post-game-diagnostics");

const POST_GAME_DIAGNOSTIC_METHODS = [
  "debugHighScoreScreenProbe",
  "debugHighScoreAudioProbe",
  "debugFullGameOverScreenProbe",
  "debugGameOverAudioProbe",
  "debugRenderFullGameOverFrame",
  "debugRenderHighScoreFrame"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createScreenFlowPostGameDiagnostics(),
  /scope must be an object/
);

const scope = {
  game: {},
  gameOverAudio: {},
  highScoreAudio: {},
  FREE_AUDIO_MANIFEST: {
    events: {
      gameOver: {
        durationFrames: 108,
        voices: [{ wave: "square" }]
      },
      highScore: {
        durationFrames: 460,
        voices: [{ wave: "triangle" }]
      }
    }
  },
  fixedFrameVoiceDuration() {
    return 108;
  },
  gameOverAudioPresentation(frame) {
    return { receiver: "game-over", frame };
  },
  highScoreAudioPresentation(frame) {
    return { receiver: "high-score", frame };
  }
};

const api = diagnostics.createScreenFlowPostGameDiagnostics(scope);
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), POST_GAME_DIAGNOSTIC_METHODS);

const gameOverAudio = api.debugGameOverAudioProbe();
assert.equal(gameOverAudio.durationFrames, 108);
assert.deepEqual(gameOverAudio.voiceDurations, [108]);
assert.equal(
  gameOverAudio.frames.every((frame) => frame.receiver === "game-over"),
  true
);

const highScoreAudio = api.debugHighScoreAudioProbe();
assert.equal(highScoreAudio.durationFrames, 460);
assert.deepEqual(highScoreAudio.voiceDurations, [108]);
assert.equal(
  highScoreAudio.frames.every((frame) => frame.receiver === "high-score"),
  true
);

console.log("screen-flow-post-game-diagnostics unit test passed");
