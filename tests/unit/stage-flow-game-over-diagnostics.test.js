const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/stage-flow-game-over-diagnostics");

const METHODS = [
  "debugGameOverSlideProbe",
  "debugGameOverBattleProbe",
  "debugGameOverReturnProbe",
  "debugGameOverStageResultProbe"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createStageFlowGameOverDiagnostics(),
  /scope must be an object/
);

const api = diagnostics.createStageFlowGameOverDiagnostics({});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), METHODS);

console.log("stage-flow-game-over-diagnostics unit test passed");
