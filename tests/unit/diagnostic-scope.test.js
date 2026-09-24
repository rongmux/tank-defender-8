const assert = require("assert").strict;
const { createDiagnosticScope } = require("../../src/runtime/diagnostic-scope");

function receiver(value) {
  return { owner: this, value };
}

const reference = { frame: 12 };
const sharedOnly = function () { return this; };
const deps = {
  sharedState: {
    constant: 16,
    reference,
    fromDeps: "shared values cannot mask dependency callbacks",
    sharedOnly
  },
  constant: 8,
  fromDeps: receiver,
  fromStage: receiver,
  fromState: receiver
};
const stageRuntime = {
  fromDeps: undefined,
  fromStage: receiver,
  fromState: receiver,
  stageOnly: receiver,
  ignoredData: "not a callback"
};
const fn = Object.create({ inheritedCallback: receiver });
Object.assign(fn, {
  fromDeps: null,
  fromStage: false,
  fromState: receiver,
  stateOnly: receiver,
  ignoredData: "also not a callback"
});
Object.defineProperty(fn, "hiddenCallback", { value: receiver });
const state = { game: { tick: 8 }, fn, stageRuntime };
const scope = createDiagnosticScope(state, deps);

assert.equal(scope.constant, 16);
assert.equal(scope.reference, reference, "live records must not be cloned");
assert.equal(scope.sharedState, deps.sharedState);
assert.equal(scope.sharedOnly, sharedOnly, "shared functions retain their original binding");
assert.equal(scope.game, undefined, "the owning adapter projects its game state");
assert.equal(scope.ignoredData, undefined);
assert.equal(scope.inheritedCallback, undefined);
assert.equal(scope.hiddenCallback, undefined);

for (const [name, owner] of [
  ["fromDeps", deps],
  ["fromStage", stageRuntime],
  ["fromState", fn],
  ["stageOnly", stageRuntime],
  ["stateOnly", fn]
]) {
  const callback = scope[name];
  const result = callback.call({ unrelated: true }, 42);
  assert.equal(result.owner, owner, `${name} must retain its original receiver`);
  assert.equal(result.value, 42);
  assert.equal(owner[name], receiver, "binding must not rewrite the source method");
}

// A rebuilt scope observes replacement callbacks; existing probes keep their bindings.
fn.fromState = undefined;
const stageFallback = createDiagnosticScope(state, deps);
assert.equal(stageFallback.fromState().owner, stageRuntime);
stageRuntime.fromState = null;
const depsFallback = createDiagnosticScope(state, deps);
assert.equal(depsFallback.fromState().owner, deps);
assert.equal(scope.fromState().owner, fn);
assert.notEqual(stageFallback, scope);
scope.constant = 99;
assert.equal(deps.constant, 8);
assert.equal(deps.sharedState.constant, 16);
assert.equal(stageFallback.constant, 16);

for (const optionalStage of [undefined, null, "missing", () => {}]) {
  const withoutStage = createDiagnosticScope({ fn: {}, stageRuntime: optionalStage }, deps);
  assert.equal(withoutStage.fromStage().owner, deps);
}

console.log("diagnostic-scope unit test passed");
