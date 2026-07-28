const assert = require("assert").strict;
const runtime = require("../../src/runtime/title-render-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupTitleRenderRuntime({}, {}, {}),
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
    titleMenu: 1,
    highScore: 12345,
    hiddenMessageElapsed: 4,
    highScoreScreenElapsed: 8,
    fullGameOverElapsed: 12
  },
  fn: {}
};
const titleMenuItems = [
  { label: "ONE", x: 10, y: 20, color: "#fff" },
  { label: "TWO", x: 10, y: 30, color: "#fff" }
];
const callbacks = {
  drawManifestSprite(...args) {
    calls.push(["sprite", ...args]);
  },
  drawMiniTank(...args) {
    calls.push(["miniTank", ...args]);
  },
  drawText(...args) {
    calls.push(["text", ...args]);
  },
  fullGameOverPresentation(elapsed) {
    calls.push(["full", elapsed]);
    return { gameText: ["G"], overText: ["O"], x: 2, gameY: 3, overY: 4, letterAdvance: 5, scale: 2 };
  },
  highScorePresentation(elapsed, score) {
    calls.push(["high", elapsed, score]);
    return { color: "#abc", scoreText: "123", scoreX: 6 };
  },
  hiddenMessagePresentation(elapsed) {
    calls.push(["hidden", elapsed]);
    return {
      visibleLines: ["HELLO"],
      dots: 2,
      drop: { frame: "a", x: 8, y: 9 }
    };
  },
  pixelGlyph() {
    return ["1"];
  },
  titleScoreLayout() {
    calls.push(["layout"]);
    return [{ text: "SCORE", x: 1, y: 2 }];
  }
};
const deps = {
  sharedState: {
    SCREEN_W: 256,
    SCREEN_H: 240,
    TITLE_MENU_ITEMS: titleMenuItems
  }
};
const api = runtime.setupTitleRenderRuntime(state, deps, callbacks);

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), [
  "drawStripedTitleText",
  "drawTitleMenuCursor",
  "renderFullGameOver",
  "renderHighScore",
  "renderHiddenMessage",
  "renderTitle"
]);
assert.equal(state.fn.renderTitle, api.renderTitle);

api.renderTitle();
assert.deepEqual(calls.slice(0, 5), [
  ["fillRect", 0, 0, 256, 240],
  ["layout"],
  ["text", "SCORE", 1, 2, 1, "#f05a42"],
  ["fillRect", 68, 46, 5, 5],
  ["fillRect", 68, 46, 5, 4]
]);
assert(calls.some((call) => call[0] === "miniTank" && call[1] === -10 && call[2] === 26));
assert(calls.some((call) => call[0] === "text" && call[1] === "2026 OPEN PIXEL LAB"));

calls.length = 0;
api.renderHiddenMessage();
assert.deepEqual(calls.slice(0, 4), [
  ["hidden", 4],
  ["fillRect", 0, 0, 256, 240],
  ["text", "HELLO", 64, 64, 1, "#f3f0d4"],
  ["text", "..", 64, 128, 1, "#f3f0d4"]
]);
assert.deepEqual(calls[4], [
  "sprite", "hiddenDrop", "a", 8, 9,
  { primary: "#55b96a", light: "#b7ffbd", shadow: "#245c33" }
]);

calls.length = 0;
api.renderHighScore();
assert.deepEqual(calls.slice(0, 2), [["high", 8, 12345], ["fillRect", 0, 0, 256, 240]]);

calls.length = 0;
api.renderFullGameOver();
assert.deepEqual(calls.slice(0, 2), [["full", 12], ["fillRect", 0, 0, 256, 240]]);

console.log("title-render-runtime unit test passed");
