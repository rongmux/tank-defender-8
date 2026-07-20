const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/screen-flow-diagnostics");

const SCREEN_FLOW_DIAGNOSTIC_METHODS = [
  "debugTitleScoreLayoutProbe",
  "debugFrameCounterProbe",
  "debugStageSelectInputCadenceProbe",
  "debugTitleDemoLifecycleProbe",
  "debugHiddenMessageLifecycleProbe",
  "debugHighScoreScreenProbe",
  "debugHighScoreAudioProbe",
  "debugFullGameOverScreenProbe",
  "debugGameOverAudioProbe",
  "debugRenderFullGameOverFrame",
  "debugRenderHighScoreFrame"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createScreenFlowDiagnostics(),
  /state must be an object/
);
assert.throws(
  () => diagnostics.createScreenFlowDiagnostics({}, {}),
  /state\.game must be an object/
);
assert.throws(
  () => diagnostics.createScreenFlowDiagnostics({ game: {} }, {}),
  /state\.fn must be an object/
);
assert.throws(
  () => diagnostics.createScreenFlowDiagnostics({ game: {}, fn: {} }, {}),
  /state\.audio must be an object/
);
assert.throws(
  () => diagnostics.createScreenFlowDiagnostics({ game: {}, fn: {}, audio: {} }),
  /deps must be an object/
);
assert.throws(
  () => diagnostics.createScreenFlowDiagnostics(
    { game: {}, fn: {}, audio: {} },
    {}
  ),
  /deps\.sharedState must be an object/
);

const deps = {
  label: "deps",
  sharedState: {},
  FREE_AUDIO_MANIFEST: {
    events: {
      gameOver: {
        durationFrames: 108,
        voices: [{ wave: "square" }]
      }
    }
  },
  fixedFrameVoiceDuration() {
    return 108;
  },
  titleScoreLayout(menuIndex) {
    return [{ receiver: this.label, menuIndex }];
  },
  gameOverAudioPresentation(frame) {
    return { receiver: this.label, frame };
  }
};
const state = {
  game: {},
  audio: {
    gameOver: {},
    highScore: {}
  },
  stageRuntime: {
    label: "stage-runtime",
    gameOverAudioPresentation(frame) {
      return { receiver: this.label, frame };
    }
  },
  fn: {
    label: "state-fn",
    titleScoreLayout(menuIndex) {
      return [{ receiver: this.label, menuIndex }];
    }
  }
};

const api = diagnostics.createScreenFlowDiagnostics(state, deps);
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), SCREEN_FLOW_DIAGNOSTIC_METHODS);

const firstLayout = api.debugTitleScoreLayoutProbe(1);
assert.deepEqual(firstLayout, [{ receiver: "state-fn", menuIndex: 1 }]);
firstLayout[0].menuIndex = -1;
assert.deepEqual(
  api.debugTitleScoreLayoutProbe(1),
  [{ receiver: "state-fn", menuIndex: 1 }]
);

const gameOverAudio = api.debugGameOverAudioProbe();
assert.equal(gameOverAudio.durationFrames, 108);
assert.deepEqual(gameOverAudio.voiceDurations, [108]);
assert.equal(
  gameOverAudio.frames.every((frame) => frame.receiver === "stage-runtime"),
  true
);

console.log("screen-flow-diagnostics unit test passed");
