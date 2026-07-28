const assert = require("assert").strict;
const runtime = require("../../src/runtime/screen-render-runtime");

assert.equal(Object.isFrozen(runtime), true);
assert.throws(
  () => runtime.setupScreenRenderRuntime({}, {}, {}),
  /state\.game must be an object/
);

const calls = [];
const state = {
  ctx: {
    imageSmoothingEnabled: true,
    fillStyle: "",
    fillRect(...args) {
      calls.push(["fillRect", ...args]);
    }
  },
  game: { screen: "title", paused: false },
  fn: {}
};
const callbacks = Object.fromEntries([
  "renderEditor",
  "renderFullGameOver",
  "renderGame",
  "renderGameOver",
  "renderHighScore",
  "renderHiddenMessage",
  "renderPause",
  "renderStageClear",
  "renderStageClearClosing",
  "renderStageIntro",
  "renderStageSelect",
  "renderStageSelectClosing",
  "renderTitle"
].map((name) => [name, () => calls.push([name])]));
const api = runtime.setupScreenRenderRuntime(state, {
  sharedState: { SCREEN_W: 256, SCREEN_H: 240 }
}, callbacks);

assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), ["render"]);
assert.equal(state.fn.render, api.render);

const routedScreens = [
  ["title", "renderTitle"],
  ["hiddenMessage", "renderHiddenMessage"],
  ["highScore", "renderHighScore"],
  ["fullGameOver", "renderFullGameOver"],
  ["stageSelectClosing", "renderStageSelectClosing"],
  ["stageSelect", "renderStageSelect"],
  ["editor", "renderEditor"],
  ["stageClear", "renderStageClear"],
  ["stageClearClosing", "renderStageClearClosing"],
  ["stageIntro", "renderStageIntro"]
];
for (const [screen, callbackName] of routedScreens) {
  calls.length = 0;
  state.game.screen = screen;
  state.game.paused = false;
  api.render();
  assert.equal(state.ctx.imageSmoothingEnabled, false);
  assert.equal(state.ctx.fillStyle, "#000000");
  assert.deepEqual(calls, [["fillRect", 0, 0, 256, 240], [callbackName]]);
}

calls.length = 0;
state.game.screen = "playing";
state.game.paused = true;
api.render();
assert.deepEqual(calls, [["fillRect", 0, 0, 256, 240], ["renderGame"], ["renderPause"]]);

calls.length = 0;
state.game.screen = "gameOver";
state.game.paused = true;
api.render();
assert.deepEqual(calls, [["fillRect", 0, 0, 256, 240], ["renderGame"], ["renderGameOver"], ["renderPause"]]);

console.log("screen-render-runtime unit test passed");
