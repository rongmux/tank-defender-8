const assert = require("assert").strict;
const battleHudPresentation = require("../../src/presentation/battle-hud-presentation");

const {
  GAME_OVER_TEXT_START_Y,
  GAME_OVER_TEXT_TARGET_Y,
  PAUSE_TEXT,
  PAUSE_TEXT_X,
  PAUSE_TEXT_Y,
  PLAYER_GAME_OVER_MESSAGE_HEIGHT,
  PLAYER_GAME_OVER_MESSAGE_WIDTH,
  gameOverBannerPresentation,
  panelEnemyCounterRemaining,
  panelLifeCount,
  pausePresentation,
  playerGameOverMessagePresentation
} = battleHudPresentation;

assert.equal(Object.isFrozen(battleHudPresentation), true);
assert.equal(GAME_OVER_TEXT_START_Y, 240);
assert.equal(GAME_OVER_TEXT_TARGET_Y, 0x71);
assert.equal(PLAYER_GAME_OVER_MESSAGE_WIDTH, 32);
assert.equal(PLAYER_GAME_OVER_MESSAGE_HEIGHT, 8);
assert.equal(PAUSE_TEXT, "PAUSE");
assert.equal(PAUSE_TEXT_X, 100);
assert.equal(PAUSE_TEXT_Y, 128);

assert.equal(panelEnemyCounterRemaining(20, 0), 20);
assert.equal(panelEnemyCounterRemaining(20, 4), 16);
assert.equal(panelEnemyCounterRemaining(20, 22), 0);
assert.equal(panelEnemyCounterRemaining(-1, 2), 0);
assert.equal(panelLifeCount({ lives: 3 }), 2);
assert.equal(panelLifeCount({ lives: 1 }), 0);
assert.equal(panelLifeCount({ lives: 0 }), 0);
assert.equal(panelLifeCount(null), 0);

const message = { playerId: 1, timer: 10, x: 0x50, y: 0xd8 };
assert.deepEqual(playerGameOverMessagePresentation(message), {
  playerId: 1,
  timer: 10,
  x: 0x50,
  y: 0xd8,
  left: 0x48,
  width: 32,
  height: 8,
  visible: true
});
assert.equal(playerGameOverMessagePresentation(message, { paused: true }).visible, false);
assert.equal(playerGameOverMessagePresentation(message, { demoMode: true }).visible, false);
assert.equal(playerGameOverMessagePresentation({ ...message, timer: 0 }), null);
assert.equal(playerGameOverMessagePresentation(null), null);

const bannerOptions = { slideFrames: 127, holdFrames: 129 };
const bannerFrames = [256, 255, 129, 128, 0]
  .map((timer) => gameOverBannerPresentation(timer, bannerOptions));
assert.deepEqual(bannerFrames.map((frame) => frame.y), [240, 239, 0x71, 0x71, 0x71]);
assert.deepEqual(bannerFrames.map((frame) => frame.elapsed), [0, 1, 127, 128, 256]);
assert.equal(bannerFrames.every((frame) => frame.duration === 256), true);
assert.equal(gameOverBannerPresentation(5, { slideFrames: 0, holdFrames: 5 }).y, 0x71);

const pauseFrames = [15, 16, 31, 32].map(pausePresentation);
assert.deepEqual(pauseFrames.map((frame) => frame.visible), [false, true, true, false]);
assert.deepEqual(pauseFrames[1], {
  frame: 16,
  visible: true,
  text: "PAUSE",
  x: 100,
  y: 128
});
assert.equal(pausePresentation(271).frame, 15);
assert.equal(pausePresentation(-1).frame, 0);

console.log("battle-hud-presentation unit test passed");
