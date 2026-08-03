const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/stage-flow-transition-diagnostics");

const METHODS = [
  "debugStageIntroCurtainProbe",
  "debugStageSelectCurtainProbe",
  "debugRenderStageClearClosingFrame",
  "debugAdvanceStageTransition",
  "debugAdvanceStageSelect",
  "debugAdvanceStageStartAudio"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createStageFlowTransitionDiagnostics(),
  /scope must be an object/
);

const api = diagnostics.createStageFlowTransitionDiagnostics({
  stageIntroCurtainState(value) {
    return { kind: "intro", value };
  },
  stageSelectCurtainState(value) {
    return { kind: "select", value };
  }
});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), METHODS);
assert.deepEqual(api.debugStageIntroCurtainProbe(95), { kind: "intro", value: 95 });
assert.deepEqual(api.debugStageSelectCurtainProbe(17), { kind: "select", value: 17 });

console.log("stage-flow-transition-diagnostics unit test passed");
