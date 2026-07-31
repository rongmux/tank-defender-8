const assert = require("assert").strict;
const runtime = require("../../src/runtime/legacy-api-runtime");

assert.equal(Object.isFrozen(runtime), true);
assert.throws(
  () => runtime.setupLegacyApiRuntime(),
  /state must be an object/
);
assert.throws(
  () => runtime.setupLegacyApiRuntime({ fn: {} }, null),
  /callbacks must be an object/
);
assert.throws(
  () => runtime.setupLegacyApiRuntime({ fn: {} }, {}),
  /callbacks must contain at least one function/
);
assert.throws(
  () => runtime.setupLegacyApiRuntime({ fn: {} }, { update: 1 }),
  /callbacks\.update must be a function/
);

const state = { fn: { existing: () => "old" } };
const update = () => "updated";
const render = () => "rendered";
const result = runtime.setupLegacyApiRuntime(state, { update, render });

assert.equal(state.fn.update, update);
assert.equal(state.fn.render, render);
assert.deepEqual(result.registeredNames, ["update", "render"]);
assert.equal(Object.isFrozen(result), true);
assert.equal(Object.isFrozen(result.registeredNames), true);
assert.equal(state.fn.existing(), "old");

console.log("legacy-api-runtime unit test passed");
