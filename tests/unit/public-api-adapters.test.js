const assert = require("assert").strict;
const adapters = require("../../src/runtime/public-api-adapters");

assert.equal(Object.isFrozen(adapters), true);
assert.throws(
  () => adapters.createPublicApiAdapters(),
  /state must be an object/
);
assert.throws(
  () => adapters.createPublicApiAdapters({}, {}),
  /state\.game must be an object/
);
assert.throws(
  () => adapters.createPublicApiAdapters({ game: {} }, {}),
  /state\.fn must be an object/
);
assert.throws(
  () => adapters.createPublicApiAdapters({ game: {}, fn: {} }, null),
  /deps must be an object/
);
assert.throws(
  () => adapters.createPublicApiAdapters({ game: {}, fn: {} }, {}),
  /deps\.sharedState must be an object/
);

const state = {
  game: { stage: 4, screen: "title" },
  stageRuntime: { label: "stage-runtime" },
  fn: {
    label: "state-fn",
    loadStagePackObject(pack) {
      return { ok: this.label === "state-fn" && pack.id === "ok" };
    },
    loadStagePackJsonText(text) {
      return `${this.label}:${text}`;
    }
  }
};
const deps = {
  label: "deps",
  sharedState: {},
  tryNormalizeStagePack(pack) {
    return { ok: Boolean(pack && pack.valid), error: pack && pack.valid ? null : "invalid" };
  },
  cloneSpriteManifest() {
    return { receiver: this.label, groups: 2 };
  },
  createCurrentPackInfo(game, stageRuntime) {
    return { receiver: this.label, stage: game.stage, runtime: stageRuntime.label };
  },
  createDebugSnapshot(currentState) {
    return { receiver: this.label, screen: currentState.game.screen };
  },
  createStagePackSchema() {
    return { receiver: this.label, version: 1 };
  }
};

const api = adapters.createPublicApiAdapters(state, deps);
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), ["packLoading", "packInfo", "snapshot", "schema"]);
assert.deepEqual(Object.keys(api.packLoading), [
  "loadStagePack",
  "loadStagePackJson",
  "validateStagePack"
]);
assert.deepEqual(Object.keys(api.packInfo), ["spriteManifest", "currentPackInfo"]);
assert.deepEqual(Object.keys(api.snapshot), ["debugSnapshot"]);
assert.deepEqual(Object.keys(api.schema), ["stagePackSchema"]);
assert.equal(api.packLoading.loadStagePack({ id: "ok" }), true);
assert.equal(api.packLoading.loadStagePackJson("pack"), "state-fn:pack");
assert.deepEqual(api.packLoading.validateStagePack({ valid: true }), { ok: true, error: null });
assert.deepEqual(api.packInfo.spriteManifest(), { receiver: "deps", groups: 2 });
assert.deepEqual(api.packInfo.currentPackInfo(), {
  receiver: "deps",
  stage: 4,
  runtime: "stage-runtime"
});
assert.deepEqual(api.snapshot.debugSnapshot(), { receiver: "deps", screen: "title" });
assert.deepEqual(api.schema.stagePackSchema(), { receiver: "deps", version: 1 });

console.log("public-api-adapters unit test passed");
