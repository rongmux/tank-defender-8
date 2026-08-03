const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/screen-flow-title-demo-diagnostics");

const METHODS = [
  "debugTitleDemoLifecycleProbe",
  "debugHiddenMessageLifecycleProbe"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createScreenFlowTitleDemoDiagnostics(),
  /scope must be an object/
);

const api = diagnostics.createScreenFlowTitleDemoDiagnostics({});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), METHODS);

console.log("screen-flow-title-demo-diagnostics unit test passed");
