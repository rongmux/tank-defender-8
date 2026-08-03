const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/stage-flow-progression-diagnostics");

const METHODS = [
  "debugStageAdvanceProbe",
  "debugStageCycleProbe",
  "debugOriginalEnemyGroupsProbe",
  "debugStageClearDelayProbe",
  "debugStageClearAdvanceProbe",
  "debugStageCyclePreservesPlayerStateProbe",
  "debugCompletedStageAdvanceProbe"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createStageFlowProgressionDiagnostics(),
  /scope must be an object/
);

const api = diagnostics.createStageFlowProgressionDiagnostics({
  stageCount() {
    return 35;
  },
  stageAdvanceResult(stage) {
    return { stage };
  }
});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), METHODS);
assert.deepEqual(api.debugStageAdvanceProbe(), { stage: 35 });

console.log("stage-flow-progression-diagnostics unit test passed");
