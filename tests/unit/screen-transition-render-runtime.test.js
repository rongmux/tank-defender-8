const assert = require("assert").strict;
const runtime = require("../../src/runtime/screen-transition-render-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupScreenTransitionRenderRuntime({}, {}, {}),
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
    stage: 12,
    transitionTimer: 8,
    grid: [["grid"]]
  },
  fn: {}
};
const api = runtime.setupScreenTransitionRenderRuntime(state, {
  sharedState: { SCREEN_W: 256, SCREEN_H: 240 },
  stageIntroCurtainState(timer, stage, options) {
    calls.push(["introState", timer, stage, options]);
    return {
      top: { x: 0, y: 0, w: 256, h: 8 },
      bottom: { x: 0, y: 232, w: 256, h: 8 }
    };
  },
  stageSelectCurtainState(timer, options) {
    calls.push(["selectState", timer, options]);
    return {
      top: { x: 0, y: 0, w: 256, h: 16 },
      bottom: { x: 0, y: 224, w: 256, h: 16 }
    };
  }
}, {
  drawText(...args) {
    calls.push(["text", ...args]);
  },
  drawTextClipped(...args) {
    calls.push(["textClipped", ...args]);
  },
  gameSettings() {
    return { timings: { stageIntro: 95 } };
  },
  renderBase() {
    calls.push(["base"]);
  },
  renderGameBackdrop(...args) {
    calls.push(["backdrop", ...args]);
  },
  renderTitle() {
    calls.push(["title"]);
  }
});

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), [
  "renderCurtain",
  "renderStageIntro",
  "renderStageSelect",
  "renderStageSelectClosing",
  "stageIntroCurtainState",
  "stageSelectCurtainState"
]);
assert.equal(state.fn.renderStageIntro, api.renderStageIntro);

api.renderStageSelect();
assert.deepEqual(calls.slice(0, 3), [
  ["fillRect", 0, 0, 256, 240],
  ["text", "STAGE", 96, 112, 1, "#15161a"],
  ["text", "12", 152, 112, 1, "#15161a"]
]);

calls.length = 0;
api.renderStageSelectClosing();
assert.deepEqual(calls, [
  ["title"],
  ["selectState", 8, { screenWidth: 256, screenHeight: 240 }],
  ["fillRect", 0, 0, 256, 16],
  ["fillRect", 0, 224, 256, 16]
]);

calls.length = 0;
api.renderStageIntro();
assert.deepEqual(calls, [
  ["backdrop", [["grid"]]],
  ["base"],
  ["introState", 8, 12, {
    duration: 95,
    screenWidth: 256,
    screenHeight: 240
  }],
  ["fillRect", 0, 0, 256, 8],
  ["fillRect", 0, 232, 256, 8],
  ["textClipped", "STAGE", 96, 112, 1, "#15161a", [
    { x: 0, y: 0, w: 256, h: 8 },
    { x: 0, y: 232, w: 256, h: 8 }
  ]],
  ["textClipped", "12", 152, 112, 1, "#15161a", [
    { x: 0, y: 0, w: 256, h: 8 },
    { x: 0, y: 232, w: 256, h: 8 }
  ]]
]);

calls.length = 0;
assert.deepEqual(api.stageSelectCurtainState(3).top, { x: 0, y: 0, w: 256, h: 16 });
assert.deepEqual(api.stageIntroCurtainState(4).bottom, { x: 0, y: 232, w: 256, h: 8 });
assert.deepEqual(calls, [
  ["selectState", 3, { screenWidth: 256, screenHeight: 240 }],
  ["introState", 4, 12, { duration: 95, screenWidth: 256, screenHeight: 240 }]
]);

console.log("screen-transition-render-runtime unit test passed");
