const assert = require("assert").strict;
const screenPresentation = require("../../src/presentation/screen-presentation");

const {
  FULL_GAME_OVER_SCREEN_FRAMES,
  HIGH_SCORE_PALETTE_COLORS,
  HIGH_SCORE_SCREEN_FRAMES,
  STAGE_CURTAIN_CLOSE_FRAMES,
  STAGE_CURTAIN_OPEN_FRAMES,
  STAGE_PREPARE_FRAMES,
  curtainRects,
  fullGameOverPresentation,
  highScorePresentation,
  openingCurtainRows,
  stageIntroCurtainState,
  stageSelectCurtainState,
  titleScoreLayout
} = screenPresentation;

assert.equal(Object.isFrozen(screenPresentation), true);
assert.equal(Object.isFrozen(HIGH_SCORE_PALETTE_COLORS), true);
assert.equal(FULL_GAME_OVER_SCREEN_FRAMES, 108);
assert.equal(HIGH_SCORE_SCREEN_FRAMES, 460);
assert.equal(STAGE_CURTAIN_CLOSE_FRAMES, 16);
assert.equal(STAGE_CURTAIN_OPEN_FRAMES, 16);
assert.equal(STAGE_PREPARE_FRAMES, 2);

assert.deepEqual(fullGameOverPresentation(-1), {
  elapsed: 0,
  duration: 108,
  gameText: "GAME",
  overText: "OVER",
  x: 0x3c,
  gameY: 0x46,
  overY: 0x78,
  letterAdvance: 0x20,
  scale: 5
});
assert.equal(fullGameOverPresentation(999).elapsed, 107);

const paletteFrames = [0, 1, 2, 3, 4].map((frame) => highScorePresentation(frame, 20100));
assert.deepEqual(paletteFrames.map((frame) => frame.palettePhase), [0, 1, 2, 3, 0]);
assert.deepEqual(paletteFrames.map((frame) => frame.color), [
  "#111111",
  "#345fd1",
  "#6b6f78",
  "#f3f0d4",
  "#111111"
]);
assert.deepEqual(highScorePresentation(0, 1234567), {
  frame: 0,
  duration: 460,
  palettePhase: 0,
  color: "#111111",
  scoreText: "1234567",
  scoreX: 23
});
assert.equal(highScorePresentation(-5, 99999999).scoreText, "9999999");

const onePlayerScores = titleScoreLayout(0, 123);
assert.equal(onePlayerScores.map((item) => item.id).join(","), "p1Label,p1Score,highLabel,highScore");
assert.equal(onePlayerScores.find((item) => item.id === "highScore").text, "00123");
const twoPlayerScores = titleScoreLayout(1, 999999);
assert.equal(
  twoPlayerScores.map((item) => item.id).join(","),
  "p1Label,p1Score,highLabel,highScore,p2Label,p2Score"
);
assert.equal(twoPlayerScores.find((item) => item.id === "highScore").text, "99999");
assert.equal(
  twoPlayerScores.every((item, index) => index === 0 || twoPlayerScores[index - 1].right < item.x),
  true
);

assert.deepEqual(curtainRects(8), {
  coverRows: 8,
  coverHeight: 64,
  top: { x: 0, y: 0, w: 256, h: 64 },
  bottom: { x: 0, y: 176, w: 256, h: 64 }
});
assert.equal(curtainRects(-1).coverRows, 0);
assert.equal(curtainRects(99).coverRows, 15);

const closingFrames = [16, 8, 0].map((timer) => stageSelectCurtainState(timer));
assert.deepEqual(closingFrames.map((frame) => frame.coverRows), [0, 8, 15]);
assert.deepEqual(closingFrames.map((frame) => frame.progress), [0, 0.5, 1]);
assert.equal(closingFrames[2].top.h + closingFrames[2].bottom.h, 240);

assert.deepEqual(
  Array.from({ length: 17 }, (_, frame) => openingCurtainRows(frame)),
  [15, 14, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
);

const introOptions = { duration: 95 };
const introFrames = [95, 18, 17, 16, 3, 2, 0]
  .map((timer) => stageIntroCurtainState(timer, 12, introOptions));
assert.deepEqual(introFrames.map((frame) => frame.phase), [
  "loading",
  "opening",
  "opening",
  "opening",
  "opening",
  "prepare",
  "prepare"
]);
assert.deepEqual(introFrames.map((frame) => frame.coverRows), [15, 15, 14, 14, 1, 0, 0]);
assert.deepEqual({
  loadingFrames: introFrames[0].loadingFrames,
  openingFrames: introFrames[0].openingFrames,
  prepareFrames: introFrames[0].prepareFrames,
  label: introFrames[0].label
}, {
  loadingFrames: 77,
  openingFrames: 16,
  prepareFrames: 2,
  label: "STAGE 12"
});

console.log("screen-presentation unit test passed");
