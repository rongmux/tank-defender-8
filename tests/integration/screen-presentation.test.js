const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { canvasContext, context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.screenPresentation, "screen presentation module should register before game.js");
assert.equal(Object.isFrozen(modules.screenPresentation), true);

const fullGameOver = JSON.parse(JSON.stringify(api.debugFullGameOverScreenProbe()));
assert.equal(fullGameOver.duration, 108);
assert.deepEqual(fullGameOver.entry, {
  screen: "fullGameOver",
  elapsed: 0,
  paused: false,
  audioActive: true,
  audioFrame: 0
});
assert.deepEqual({
  x: fullGameOver.presentation.x,
  gameY: fullGameOver.presentation.gameY,
  overY: fullGameOver.presentation.overY,
  letterAdvance: fullGameOver.presentation.letterAdvance
}, { x: 0x3c, gameY: 0x46, overY: 0x78, letterAdvance: 0x20 });
assert.equal(fullGameOver.beforeEnd.screen, "fullGameOver");
assert.equal(fullGameOver.beforeEnd.elapsed, 107);
assert.equal(fullGameOver.beforeEnd.audioFrame, 107);
assert.equal(fullGameOver.afterEnd.screen, "title");
assert.equal(fullGameOver.afterEnd.audioActive, false);
assert.deepEqual(fullGameOver.ignoredInput, { handled: false, screen: "fullGameOver" });
assert.equal(fullGameOver.startSkip.handled, true);
assert.equal(fullGameOver.startSkip.screen, "title");
assert.equal(fullGameOver.startSkip.audioActive, false);
assert.equal(fullGameOver.selectSkip.handled, true);
assert.equal(fullGameOver.selectSkip.screen, "title");
assert.equal(fullGameOver.selectSkip.audioActive, false);
assert.equal(fullGameOver.highScoreRoute.screen, "highScore");
assert.equal(fullGameOver.highScoreRoute.elapsed, 0);

canvasContext.calls.length = 0;
canvasContext.resetPixels();
const renderedFullGameOver = JSON.parse(JSON.stringify(api.debugRenderFullGameOverFrame(42)));
assert.equal(renderedFullGameOver.elapsed, 42);
assert.equal(canvasContext.calls.some(
  (call) => call.op === "fillRect" && call.style === "#000000" &&
    call.x === 0 && call.y === 0 && call.w === 256 && call.h === 240
), true);
assert.equal(canvasContext.calls.some(
  (call) => call.op === "fillRect" && call.style === "#f05a42"
), true);
assert.equal(canvasContext.calls.some((call) => call.op === "fillText"), false);
assert.equal(
  canvasContext.calls
    .filter((call) => call.op === "fillRect")
    .every((call) => [call.x, call.y, call.w, call.h].every(Number.isInteger)),
  true
);

const highScore = JSON.parse(JSON.stringify(api.debugHighScoreScreenProbe()));
assert.equal(highScore.duration, 460);
assert.equal(highScore.tie.triggered, false);
assert.equal(highScore.strictBeat.triggered, true);
assert.equal(highScore.strictBeat.screen, "gameOver");
assert.deepEqual(highScore.started, {
  screen: "highScore",
  elapsed: 0,
  audioActive: true,
  audioFrame: 0
});
assert.equal(new Set(highScore.paletteFrames.slice(0, 4).map((frame) => frame.color)).size, 4);
assert.equal(highScore.paletteFrames[0].color, highScore.paletteFrames[4].color);
assert.equal(highScore.sevenDigit.scoreText, "1234567");
assert.equal(highScore.sevenDigit.scoreX, 23);
assert.equal(highScore.beforeEnd.screen, "highScore");
assert.equal(highScore.beforeEnd.elapsed, 459);
assert.equal(highScore.beforeEnd.audioFrame, 459);
assert.equal(highScore.afterEnd.screen, "title");
assert.equal(highScore.afterEnd.audioActive, false);
assert.equal(highScore.belowRecord.screen, "title");
assert.equal(highScore.belowRecord.triggered, false);

canvasContext.calls.length = 0;
canvasContext.resetPixels();
const renderedHighScore = JSON.parse(JSON.stringify(api.debugRenderHighScoreFrame(1, 1234567)));
assert.equal(renderedHighScore.color, "#345fd1");
assert.equal(canvasContext.calls.some(
  (call) => call.op === "fillRect" && call.style === "#345fd1"
), true);
assert.equal(canvasContext.calls.some(
  (call) => call.op === "fillRect" && call.style === "#f7f1c6"
), true);
assert.equal(canvasContext.calls.some((call) => call.op === "fillText"), false);

const titleScores = JSON.parse(JSON.stringify(api.debugTitleScoreLayoutProbe(1)))
  .sort((a, b) => a.x - b.x);
assert.equal(
  titleScores.map((item) => item.id).join(","),
  "p1Label,p1Score,highLabel,highScore,p2Label,p2Score"
);
assert.equal(
  titleScores.every((item, index) => index === 0 || titleScores[index - 1].right < item.x),
  true
);
assert.equal(titleScores.find((item) => item.id === "highScore").x, 128);

const schema = api.stagePackSchema();
const introTimers = [schema.gameSettings.timings.stageIntro, 18, 17, 16, 3, 2, 0];
const introFrames = introTimers.map((timer) => JSON.parse(JSON.stringify(api.debugStageIntroCurtainProbe(timer))));
assert.deepEqual({
  loadingFrames: introFrames[0].loadingFrames,
  openingFrames: introFrames[0].openingFrames,
  prepareFrames: introFrames[0].prepareFrames
}, { loadingFrames: 77, openingFrames: 16, prepareFrames: 2 });
assert.deepEqual(introFrames.map((frame) => frame.coverRows), [15, 15, 14, 14, 1, 0, 0]);
assert.equal(introFrames[0].top.w, 256);
assert.equal(introFrames[0].top.h, 120);
assert.equal(introFrames[0].bottom.y, 120);

const closingFrames = [16, 8, 0]
  .map((timer) => JSON.parse(JSON.stringify(api.debugStageSelectCurtainProbe(timer))));
assert.deepEqual(closingFrames.map((frame) => frame.coverRows), [0, 8, 15]);
assert.equal(closingFrames[1].coverHeight, 64);
assert.equal(closingFrames[2].top.h + closingFrames[2].bottom.h, 240);

canvasContext.calls.length = 0;
const renderedClosing = JSON.parse(JSON.stringify(api.debugRenderStageClearClosingFrame(8)));
const greyCurtainRects = canvasContext.calls.filter(
  (call) => call.op === "fillRect" && call.style === "#6b6f78" && call.w === 256 && call.h === 64
);
assert.equal(renderedClosing.coverRows, 8);
assert.equal(greyCurtainRects.some((call) => call.y === 0), true);
assert.equal(greyCurtainRects.some((call) => call.y === 176), true);

console.log("screen-presentation integration test passed");
