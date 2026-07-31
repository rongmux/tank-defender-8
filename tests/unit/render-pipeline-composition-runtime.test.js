const assert = require("assert").strict;
const runtime = require("../../src/runtime/render-pipeline-composition-runtime");

assert.equal(Object.isFrozen(runtime), true);
assert.throws(
  () => runtime.setupRenderPipelineCompositionRuntime(),
  /state must be an object/
);

const setupOrder = [];
const state = {
  game: {},
  fn: {
    explosionRule() {},
    hiddenMessagePresentation() {},
    stageClearPresentation() {}
  }
};
const namedFunction = () => {};
const stageRuntime = {
  createStageGrid: namedFunction,
  enemyTotal: namedFunction,
  gameSettings: namedFunction
};
const renderAdapterRuntime = new Proxy({
  renderTerrain: namedFunction,
  connectRenderCompositionRuntime(runtimeInstance, battleSceneRuntime) {
    setupOrder.push("connect");
    assert.equal(runtimeInstance, renderCompositionRuntime);
    assert.equal(battleSceneRuntime, battleSceneRenderRuntime);
  }
}, {
  get(target, property) {
    if (!(property in target)) target[property] = namedFunction;
    return target[property];
  }
});
const battleSceneRenderRuntime = { renderGame: namedFunction };
const renderCompositionRuntime = { screenRenderRuntime: { render: namedFunction } };
const received = {};
const deps = {
  directionName: namedFunction,
  enemyColor: namedFunction,
  isPlayerShieldVisible: namedFunction,
  isPlayerTankVisible: namedFunction,
  normalizeBrickFragmentMask: namedFunction,
  pixelGlyph: namedFunction,
  playerUpgradeOverlayParts: namedFunction,
  quarterMaskFromBrickFragments: namedFunction,
  requireRuntimeModule(name) {
    setupOrder.push(name);
    if (name === "textRenderRuntime") {
      return { setupTextRenderRuntime() { return { drawText() {} }; } };
    }
    if (name === "spriteRenderRuntime") {
      return { setupSpriteRenderRuntime() { return { drawMiniTank() {} }; } };
    }
    if (name === "renderAdapterRuntime") {
      return {
        setupRenderAdapterRuntime(receivedState, receivedDeps, callbacks) {
          received.adapter = { receivedState, receivedDeps, callbacks };
          return renderAdapterRuntime;
        }
      };
    }
    if (name === "battleSceneRenderRuntime") {
      return {
        setupBattleSceneRenderRuntime(receivedState, receivedDeps, callbacks) {
          received.battleScene = { receivedState, receivedDeps, callbacks };
          return battleSceneRenderRuntime;
        }
      };
    }
    if (name === "renderCompositionRuntime") {
      return {
        setupRenderCompositionRuntime(receivedState, receivedDeps, callbacks) {
          received.renderComposition = { receivedState, receivedDeps, callbacks };
          return renderCompositionRuntime;
        }
      };
    }
    throw new Error("unexpected module: " + name);
  },
  shieldColorForTick: namedFunction,
  sharedState: {}
};

const api = runtime.setupRenderPipelineCompositionRuntime(state, deps, { stageRuntime });
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(setupOrder, ["textRenderRuntime", "spriteRenderRuntime", "renderAdapterRuntime", "battleSceneRenderRuntime"]);
assert.equal(api.renderAdapterRuntime, renderAdapterRuntime);
assert.equal(received.adapter.callbacks.textRenderRuntime.drawText instanceof Function, true);
assert.equal(received.battleScene.callbacks.enemyColor, deps.enemyColor);
assert.equal(received.battleScene.callbacks.renderTerrain, renderAdapterRuntime.renderTerrain);

const completion = api.finishRenderCompositionRuntime();
assert.equal(Object.isFrozen(completion), true);
assert.deepEqual(setupOrder, [
  "textRenderRuntime",
  "spriteRenderRuntime",
  "renderAdapterRuntime",
  "battleSceneRenderRuntime",
  "renderCompositionRuntime",
  "connect"
]);
assert.equal(received.renderComposition.callbacks.createStageGrid, stageRuntime.createStageGrid);
assert.equal(received.renderComposition.callbacks.enemyTotal, stageRuntime.enemyTotal);
assert.equal(received.renderComposition.callbacks.explosionRule, state.fn.explosionRule);
assert.equal(completion.screenRenderRuntime, renderCompositionRuntime.screenRenderRuntime);
assert.equal(api.finishRenderCompositionRuntime(), completion);

console.log("render-pipeline-composition-runtime unit test passed");
