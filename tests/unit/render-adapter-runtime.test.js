const assert = require("assert").strict;
const runtime = require("../../src/runtime/render-adapter-runtime");

assert.equal(Object.isFrozen(runtime), true);
assert.throws(
  () => runtime.setupRenderAdapterRuntime(),
  /state must be an object/
);
assert.throws(
  () => runtime.setupRenderAdapterRuntime({ game: {} }, {}, {}),
  /deps.sharedState.SCREEN_W must be a number/
);

const calls = [];
const state = { game: { frameLow: 42, titleMenu: 1, highScore: 99 } };
const deps = {
  sharedState: { SCREEN_W: 256 },
  fullGameOverPresentation(elapsed) {
    calls.push(["fullGameOverPresentation", elapsed]);
    return elapsed;
  },
  highScorePresentation(elapsed, score, options) {
    calls.push(["highScorePresentation", elapsed, score, options.screenWidth]);
    return score;
  },
  titleScoreLayout(menuIndex, score) {
    calls.push(["titleScoreLayout", menuIndex, score]);
    return [menuIndex, score];
  }
};
const textRenderRuntime = {
  drawText(...args) {
    calls.push(["drawText", this === textRenderRuntime, ...args]);
    return "text";
  },
  drawTextClipped() {
    return "clipped";
  },
  drawTextRight() {
    return "right";
  }
};
const spriteRenderRuntime = {
  drawManifestSprite(...args) {
    calls.push(["drawManifestSprite", this === spriteRenderRuntime, ...args]);
    return "sprite";
  },
  drawScaledManifestSprite() {
    return "scaled";
  }
};
const api = runtime.setupRenderAdapterRuntime(state, deps, {
  textRenderRuntime,
  spriteRenderRuntime
});

assert.equal(Object.isFrozen(api), true);
assert.equal(api.battleDisplayFrame(), 42);
assert.equal(api.fullGameOverPresentation(7), 7);
assert.equal(api.highScorePresentation(8, 123), 123);
assert.deepEqual(api.titleScoreLayout(), [1, 99]);
assert.equal(api.drawText("A", 1, 2), "text");
assert.equal(api.drawManifestSprite("tank", "up", 3, 4), "sprite");
assert.deepEqual(calls, [
  ["fullGameOverPresentation", 7],
  ["highScorePresentation", 8, 123, 256],
  ["titleScoreLayout", 1, 99],
  ["drawText", true, "A", 1, 2],
  ["drawManifestSprite", true, "tank", "up", 3, 4]
]);

assert.throws(
  () => api.renderTitle(),
  /render composition runtime must provide titleRenderRuntime.renderTitle/
);
function makeRuntime(methods) {
  const target = {};
  for (const name of methods) {
    target[name] = function () {
      calls.push([name, this === target]);
      return name;
    };
  }
  return target;
}
const renderCompositionRuntime = {
  titleRenderRuntime: makeRuntime(["renderTitle"]),
  terrainRenderRuntime: makeRuntime(["renderGameBackdrop"]),
  screenTransitionRenderRuntime: makeRuntime(["renderStageSelect"]),
  powerUpRenderRuntime: makeRuntime(["isPowerUpVisible"]),
  stageResultRenderRuntime: makeRuntime(["formatScore5"]),
  battleHudRenderRuntime: makeRuntime(["renderPause"]),
  editorRenderRuntime: makeRuntime(["renderEditor"]),
  effectRenderRuntime: makeRuntime(["renderExplosions"]),
  tankRenderRuntime: makeRuntime(["drawTank"]),
  projectileRenderRuntime: makeRuntime(["drawBullet"]),
  screenRenderRuntime: makeRuntime(["render"])
};
const battleSceneRuntime = makeRuntime(["renderGame"]);
api.connectRenderCompositionRuntime(renderCompositionRuntime, battleSceneRuntime);
assert.equal(api.renderTitle(), "renderTitle");
assert.equal(api.renderGame(), "renderGame");
assert.equal(api.renderPause(), "renderPause");
assert.equal(api.drawTank({}, "#tank", "#accent"), "drawTank");
assert.equal(api.isPowerUpVisible(4), "isPowerUpVisible");

console.log("render-adapter-runtime unit test passed");
