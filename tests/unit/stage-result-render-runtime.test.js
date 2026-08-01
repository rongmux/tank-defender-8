const assert = require("assert").strict;
const runtime = require("../../src/runtime/stage-result-render-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupStageResultRenderRuntime({}, {}, {}),
  /state\.game must be an object/
);

const calls = [];
const state = {
  ctx: {
    fillStyle: "",
    fillRect(...args) {
      calls.push(["fillRect", ...args]);
    }
  },
  game: {
    highScore: 123,
    stage: 4,
    playerCount: 2,
    stageClearBonusPlayerIds: [1, 2]
  },
  fn: {}
};
const settings = { stageClearBonus: { points: 500 } };
const api = runtime.setupStageResultRenderRuntime(state, {
  sharedState: {
    SCREEN_W: 256,
    SCREEN_H: 240,
    STAGE_RESULT_ROW_LAYOUT: {
      p1KillsRightX: 104,
      leftArrowX: 112,
      miniTankX: 121,
      rightArrowX: 136,
      p2KillsX: 152
    }
  }
}, {
  drawManifestSprite(...args) {
    calls.push(["sprite", ...args]);
  },
  drawMiniTank(...args) {
    calls.push(["miniTank", ...args]);
  },
  drawText(...args) {
    calls.push(["text", ...args]);
  },
  drawTextRight(...args) {
    calls.push(["textRight", ...args]);
  },
  gameSettings() {
    return settings;
  },
  renderCurtain(...args) {
    calls.push(["curtain", ...args]);
  },
  stageClearPresentation() {
    return {
      result: {
        p1: { score: 100, stageKills: [1, 2, 3, 4] },
        p2: { score: 200, stageKills: [5, 6, 7, 8] }
      },
      rows: [{
        typeIndex: 0,
        color: "#tank",
        p1VisiblePoints: 100,
        p1VisibleKills: 1,
        p2VisiblePoints: 200,
        p2VisibleKills: 2
      }],
      showTotals: true,
      showBonus: true
    };
  },
  stageSelectCurtainState() {
    return { top: { h: 1 }, bottom: { h: 2 } };
  }
});

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), [
  "drawResultArrow",
  "drawSmallScore",
  "formatScore5",
  "renderStageClear",
  "renderStageClearClosing",
  "totalStageKills"
]);
assert.equal(state.fn.renderStageClear, api.renderStageClear);
assert.equal(api.formatScore5(123), "00123");
assert.equal(api.formatScore5(100000), "99999");
assert.equal(api.totalStageKills({ stageKills: [1, -2, 3.8, "4"] }), 8);

api.renderStageClear();
assert.deepEqual(calls.slice(0, 2), [
  ["fillRect", 0, 0, 256, 240],
  ["text", "HI-SCORE", 64, 24, 1, "#f05a42"]
]);
assert(calls.some((call) => call[0] === "miniTank" && call[1] === 121 && call[2] === 93 && call[4] === 0));
assert.deepEqual(calls.filter((call) => call[0] === "fillRect").slice(1, 7), [
  ["fillRect", 112, 100, 8, 1],
  ["fillRect", 112, 99, 2, 3],
  ["fillRect", 114, 98, 2, 5],
  ["fillRect", 136, 100, 8, 1],
  ["fillRect", 142, 99, 2, 3],
  ["fillRect", 140, 98, 2, 5]
]);
assert(calls.some((call) => call[0] === "text" && call[1] === "BONUS!" && call[2] === 176));

calls.length = 0;
api.renderStageClearClosing();
assert.deepEqual(calls.at(-1), ["curtain", { top: { h: 1 }, bottom: { h: 2 } }]);

console.log("stage-result-render-runtime unit test passed");
