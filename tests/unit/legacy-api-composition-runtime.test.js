const assert = require("assert").strict;
const runtime = require("../../src/runtime/legacy-api-composition-runtime");

assert.equal(Object.isFrozen(runtime), true);
assert.throws(
  () => runtime.setupLegacyApiCompositionRuntime(),
  /state must be an object/
);

const state = { fn: {} };
const update = () => "update";
const render = () => "render";
const tileTypeName = () => "brick";
const shouldSpawnEnemies = () => true;
const preparePausedDebugBattle = () => "paused";
const createNamedProxy = () => {
  const values = {};
  return new Proxy(values, {
    get(target, property) {
      if (!(property in target)) target[property] = function () {};
      return target[property];
    }
  });
};
const renderAdapterRuntime = createNamedProxy();
const stageRuntime = createNamedProxy();
const legacyApiResult = Object.freeze({ registeredNames: Object.freeze(["update", "render"]) });
let received;
const deps = {
  requireRuntimeModule(name) {
    assert.equal(name, "legacyApiRuntime");
    return {
      setupLegacyApiRuntime(receivedState, callbacks) {
        received = { receivedState, callbacks };
        return legacyApiResult;
      }
    };
  }
};

const result = runtime.setupLegacyApiCompositionRuntime(state, deps, {
  preparePausedDebugBattle,
  render,
  renderAdapterRuntime,
  shouldSpawnEnemies,
  stageRuntime,
  tileTypeName,
  update
});

assert.equal(result, legacyApiResult);
assert.equal(received.receivedState, state);
assert.equal(received.callbacks.update, update);
assert.equal(received.callbacks.render, render);
assert.equal(received.callbacks.tileTypeName, tileTypeName);
assert.equal(received.callbacks.shouldSpawnEnemies, shouldSpawnEnemies);
assert.equal(received.callbacks.preparePausedDebugBattle, preparePausedDebugBattle);
assert.equal(received.callbacks.renderTitle, renderAdapterRuntime.renderTitle);
assert.equal(received.callbacks.renderEditor, renderAdapterRuntime.renderEditor);
assert.equal(received.callbacks.drawTextRight, renderAdapterRuntime.drawTextRight);
assert.equal(received.callbacks.gameSettings, stageRuntime.gameSettings);
assert.equal(received.callbacks.stageRoute, stageRuntime.stageRoute);
assert.equal(received.callbacks.createStageGrid, stageRuntime.createStageGrid);

console.log("legacy-api-composition-runtime unit test passed");
