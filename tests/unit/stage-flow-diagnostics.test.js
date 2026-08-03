const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/stage-flow-diagnostics");
const transitionDiagnostics = require("../../src/runtime/stage-flow-transition-diagnostics");

const STAGE_FLOW_DIAGNOSTIC_METHODS = [
  "debugStageIntroCurtainProbe",
  "debugStageSelectCurtainProbe",
  "debugRenderStageClearClosingFrame",
  "debugAdvanceStageTransition",
  "debugAdvanceStageSelect",
  "debugAdvanceStageStartAudio",
  "debugStageAdvanceProbe",
  "debugStageCycleProbe",
  "debugOriginalEnemyGroupsProbe",
  "debugStageClearDelayProbe",
  "debugStageClearAdvanceProbe",
  "debugStageCyclePreservesPlayerStateProbe",
  "debugCompletedStageAdvanceProbe",
  "debugGameOverSlideProbe",
  "debugGameOverBattleProbe",
  "debugGameOverReturnProbe",
  "debugGameOverStageResultProbe"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createStageFlowDiagnostics(),
  /state must be an object/
);
assert.throws(
  () => diagnostics.createStageFlowDiagnostics({}, {}),
  /state\.game must be an object/
);
assert.throws(
  () => diagnostics.createStageFlowDiagnostics({ game: {} }, {}),
  /state\.fn must be an object/
);
assert.throws(
  () => diagnostics.createStageFlowDiagnostics({ game: {}, fn: {} }, {}),
  /state\.audio must be an object/
);
assert.throws(
  () => diagnostics.createStageFlowDiagnostics({ game: {}, fn: {}, audio: {} }),
  /deps must be an object/
);
assert.throws(
  () => diagnostics.createStageFlowDiagnostics(
    { game: {}, fn: {}, audio: {} },
    {}
  ),
  /deps\.sharedState must be an object/
);

const deps = {
  label: "deps",
  sharedState: { STAGE_CURTAIN_CLOSE_FRAMES: 64 },
  createStageFlowTransitionDiagnostics:
    transitionDiagnostics.createStageFlowTransitionDiagnostics,
  stageIntroCurtainState(value) {
    return { receiver: this.label, value };
  },
  stageSelectCurtainState(value) {
    return { receiver: this.label, value };
  }
};
const state = {
  game: {},
  audio: {
    stageStart: {},
    pause: {}
  },
  stageRuntime: {
    label: "stage-runtime",
    stageSelectCurtainState(value) {
      return { receiver: this.label, value };
    }
  },
  fn: {
    label: "state-fn",
    stageCount() {
      return this.count;
    },
    count: 35,
    stageAdvanceResult(stage) {
      return { receiver: this.label, stage };
    },
    stageIntroCurtainState(value) {
      return { receiver: this.label, value };
    }
  }
};

const api = diagnostics.createStageFlowDiagnostics(state, deps);
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), STAGE_FLOW_DIAGNOSTIC_METHODS);
assert.deepEqual(api.debugStageIntroCurtainProbe(95), {
  receiver: "state-fn",
  value: 95
});
assert.deepEqual(api.debugStageSelectCurtainProbe(17), {
  receiver: "stage-runtime",
  value: 17
});
assert.deepEqual(api.debugStageAdvanceProbe(), {
  receiver: "state-fn",
  stage: 35
});

console.log("stage-flow-diagnostics unit test passed");
