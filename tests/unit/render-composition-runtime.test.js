const assert = require("assert").strict;
const runtime = require("../../src/runtime/render-composition-runtime");

assert.equal(Object.isFrozen(runtime), true);
assert.throws(
  () => runtime.setupRenderCompositionRuntime({}, {}, {}),
  /state\.fn must be an object/
);

const moduleNames = [
  "titleRenderRuntime",
  "terrainRenderRuntime",
  "tankRenderRuntime",
  "powerUpRenderRuntime",
  "projectileRenderRuntime",
  "effectRenderRuntime",
  "stageResultRenderRuntime",
  "battleHudRenderRuntime",
  "editorRenderRuntime",
  "screenTransitionRenderRuntime",
  "screenRenderRuntime"
];
const callbackNames = [
  "battleDisplayFrame", "createStageGrid", "directionName", "drawBrickCell", "drawForest", "drawIce",
  "drawManifestSprite", "drawMiniTank", "drawScaledManifestSprite", "drawText", "drawTextClipped",
  "drawTextRight", "drawWallCell", "drawWater", "enemyTotal", "explosionRule", "fullGameOverPresentation",
  "gameSettings", "highScorePresentation", "hiddenMessagePresentation", "normalizeBrickFragmentMask",
  "pixelGlyph", "playerUpgradeOverlayParts", "quarterMaskFromBrickFragments", "renderBase", "renderCurtain",
  "renderEditor", "renderFullGameOver", "renderGame", "renderGameBackdrop", "renderGameOver", "renderHighScore",
  "renderHiddenMessage", "renderPause", "renderStageClear", "renderStageClearClosing", "renderStageIntro",
  "renderStageSelect", "renderStageSelectClosing", "renderTerrain", "renderTitle", "shieldColorForTick",
  "spawnAnimationPresentation", "stageClearPresentation", "stageSelectCurtainState", "tankPrimaryColor",
  "tankTrackFrameName", "titleScoreLayout"
];
const callbacks = Object.fromEntries(callbackNames.map((name) => [name, () => name]));
const calls = [];
const setupNames = Object.fromEntries(moduleNames.map((name) => [
  name,
  `setup${name[0].toUpperCase()}${name.slice(1)}`
]));
const deps = {
  requireRuntimeModule(name) {
    assert(moduleNames.includes(name), `unexpected runtime module ${name}`);
    return {
      [setupNames[name]](state, receivedDeps, receivedCallbacks) {
        calls.push({ name, state, deps: receivedDeps, callbacks: receivedCallbacks });
        return { name };
      }
    };
  }
};
const state = { fn: {} };
const api = runtime.setupRenderCompositionRuntime(state, deps, callbacks);

assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), moduleNames.slice().reverse().sort((a, b) => {
  const order = [
    "battleHudRenderRuntime", "editorRenderRuntime", "effectRenderRuntime", "powerUpRenderRuntime",
    "projectileRenderRuntime", "screenRenderRuntime", "screenTransitionRenderRuntime", "stageResultRenderRuntime",
    "tankRenderRuntime", "terrainRenderRuntime", "titleRenderRuntime"
  ];
  return order.indexOf(a) - order.indexOf(b);
}));
assert.deepEqual(calls.map((call) => call.name), moduleNames);
for (const call of calls) {
  assert.equal(call.state, state);
  assert.equal(call.deps, deps);
  if (Object.prototype.hasOwnProperty.call(call.callbacks, "drawManifestSprite")) {
    assert.equal(call.callbacks.drawManifestSprite, callbacks.drawManifestSprite);
  }
}
assert.equal(api.titleRenderRuntime.name, "titleRenderRuntime");
assert.equal(api.screenRenderRuntime.name, "screenRenderRuntime");

assert.throws(
  () => runtime.setupRenderCompositionRuntime(state, deps, { ...callbacks, renderTitle: null }),
  /callbacks\.renderTitle must be a function/
);

console.log("render-composition-runtime unit test passed");
