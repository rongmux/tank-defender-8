const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/screen-flow-navigation-diagnostics");

const METHODS = [
  "debugTitleScoreLayoutProbe",
  "debugFrameCounterProbe",
  "debugStageSelectInputCadenceProbe"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createScreenFlowNavigationDiagnostics(),
  /scope must be an object/
);

const api = diagnostics.createScreenFlowNavigationDiagnostics({
  titleScoreLayout(menuIndex) {
    return [{ menuIndex }];
  }
});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), METHODS);
assert.deepEqual(api.debugTitleScoreLayoutProbe(1), [{ menuIndex: 1 }]);

console.log("screen-flow-navigation-diagnostics unit test passed");
