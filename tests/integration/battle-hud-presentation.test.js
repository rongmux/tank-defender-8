const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { canvasContext, context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.battleHudPresentation, "battle HUD presentation module should register before game.js");
assert.equal(Object.isFrozen(modules.battleHudPresentation), true);

const pause = JSON.parse(JSON.stringify(api.debugPauseBehaviorProbe()));
assert.equal(pause.entered, true);
assert.equal(pause.exited, true);
assert.deepEqual({
  paused: pause.entry.paused,
  pauseElapsed: pause.entry.pauseElapsed,
  pendingFirePresses: pause.entry.pendingFirePresses
}, { paused: true, pauseElapsed: 0, pendingFirePresses: 0 });
assert.equal(pause.pausedUpdate.tick, 15);
assert.equal(pause.pausedUpdate.pauseElapsed, 1);
assert.equal(pause.entry.pauseAudioActive, true);
assert.equal(pause.entry.pauseAudioFrame, 0);
assert.equal(pause.pausedUpdate.pauseAudioFrame, 1);
assert.equal(pause.exit.paused, false);
assert.equal(pause.exit.pauseAudioActive, true);
assert.equal(pause.exit.pauseAudioFrame, 1);
assert.equal(pause.stageIntroAccepted, false);
assert.equal(pause.demoAccepted, false);
assert.equal(
  pause.inputs.map((entry) => `${entry.code}:${entry.accepted}`).join(","),
  "Enter:true,KeyP:true,Escape:false"
);
assert.deepEqual(pause.frames.map((frame) => frame.visible), [false, true, true, false]);
assert.deepEqual({
  text: pause.frames[1].text,
  x: pause.frames[1].x,
  y: pause.frames[1].y
}, { text: "PAUSE", x: 100, y: 128 });

canvasContext.calls.length = 0;
api.debugRenderPauseFrame(15);
assert.equal(canvasContext.calls.length, 0);
canvasContext.calls.length = 0;
const renderedPause = JSON.parse(JSON.stringify(api.debugRenderPauseFrame(16)));
assert.equal(renderedPause.visible, true);
assert.equal(canvasContext.calls.length > 0, true);
assert.equal(canvasContext.calls.some(
  (call) => call.op === "fillRect" && call.w === 100 && call.h === 30
), false);
assert.equal(canvasContext.calls.every(
  (call) => call.x >= 100 && call.x < 130 && call.y >= 128 && call.y < 136
), true);

const playerMessage = JSON.parse(JSON.stringify(api.debugPlayerGameOverMessageProbe()));
const messageFrame = (run, frame) => run.frames.find((entry) => entry.frame === frame);
assert.equal(playerMessage.initialTimer, 13);
assert.equal(playerMessage.moveThreshold, 10);
assert.deepEqual({
  timer: playerMessage.p1.initial.timer,
  x: playerMessage.p1.initial.x,
  y: playerMessage.p1.initial.y,
  dx: playerMessage.p1.initial.dx,
  frameLow: playerMessage.p1.initial.frameLow,
  frameHigh: playerMessage.p1.initial.frameHigh
}, { timer: 13, x: 0x20, y: 0xd8, dx: 1, frameLow: 0, frameHigh: 0x45 });
assert.deepEqual({
  timer: playerMessage.p2.initial.timer,
  x: playerMessage.p2.initial.x,
  y: playerMessage.p2.initial.y,
  dx: playerMessage.p2.initial.dx,
  frameLow: playerMessage.p2.initial.frameLow,
  frameHigh: playerMessage.p2.initial.frameHigh
}, { timer: 13, x: 0xc0, y: 0xd8, dx: -1, frameLow: 0, frameHigh: 0x45 });
assert.equal(messageFrame(playerMessage.p1, 0).timer, 12);
assert.equal(messageFrame(playerMessage.p1, 0).x, 0x21);
assert.equal(messageFrame(playerMessage.p1, 15).x, 0x30);
assert.equal(messageFrame(playerMessage.p1, 16).timer, 11);
assert.equal(messageFrame(playerMessage.p1, 16).x, 0x31);
assert.equal(messageFrame(playerMessage.p1, 32).timer, 10);
assert.equal(messageFrame(playerMessage.p1, 47).x, 0x50);
assert.equal(messageFrame(playerMessage.p2, 15).x, 0xb0);
assert.equal(messageFrame(playerMessage.p2, 32).timer, 10);
assert.equal(messageFrame(playerMessage.p2, 47).x, 0x90);
assert.equal(messageFrame(playerMessage.p1, 48).timer, 9);
assert.equal(messageFrame(playerMessage.p1, 48).x, 0x50);
assert.equal(messageFrame(playerMessage.p1, 191).timer, 1);
assert.equal(messageFrame(playerMessage.p1, 192).timer, 0);
assert.equal(messageFrame(playerMessage.p1, 192).y, 0xf0);
assert.equal(messageFrame(playerMessage.p1, 192).presentation, null);
assert.equal(playerMessage.p1.eliminatedLives, 0);
assert.equal(playerMessage.p1.partnerAlive, true);
assert.equal(playerMessage.p2.eliminatedLives, 0);
assert.equal(playerMessage.p2.partnerAlive, true);
assert.equal(playerMessage.pausedBefore.presentation.visible, false);
assert.equal(playerMessage.pausedAfter.timer, playerMessage.pausedBefore.timer);
assert.equal(playerMessage.pausedAfter.x, playerMessage.pausedBefore.x);
assert.equal(playerMessage.pausedBefore.frameLow, 0);
assert.equal(playerMessage.pausedAfter.frameLow, 1);
assert.equal(playerMessage.pausedAfter.frameHigh, playerMessage.pausedBefore.frameHigh);
assert.equal(playerMessage.clearDelay.screen, "playing");
assert.equal(playerMessage.clearDelay.timer, 256);
assert.equal(playerMessage.clearDelay.timer, playerMessage.stageEndDelay);
assert.equal(playerMessage.clearDelay.tick, 0);
assert.equal(playerMessage.clearDelay.frameLow, 0);
assert.equal(playerMessage.clearDelay.frameHigh, 0xfe);
assert.equal(playerMessage.noSurvivingPartner, null);
assert.equal(playerMessage.onePlayer, null);
assert.equal(playerMessage.commonGameOver.screen, "gameOver");
assert.equal(playerMessage.commonGameOver.message, null);
assert.equal(playerMessage.commonGameOver.frameLow, 0);
assert.equal(playerMessage.commonGameOver.frameHigh, 0xfe);

canvasContext.calls.length = 0;
const renderedPlayerOne = JSON.parse(JSON.stringify(api.debugRenderPlayerGameOverMessage(1, 47)));
const playerOnePixels = canvasContext.calls.filter(
  (call) => call.op === "fillRect" && call.style === "#f05a42"
);
assert.deepEqual({
  left: renderedPlayerOne.left,
  y: renderedPlayerOne.y,
  width: renderedPlayerOne.width,
  height: renderedPlayerOne.height
}, { left: 0x48, y: 0xd8, width: 32, height: 8 });
assert.equal(playerOnePixels.length > 0, true);
assert.equal(playerOnePixels.every(
  (call) => call.w === 1 && call.h === 1 && call.x >= renderedPlayerOne.left &&
    call.x < renderedPlayerOne.left + 32 && call.y > renderedPlayerOne.y &&
    call.y < renderedPlayerOne.y + 7
), true);
assert.equal(playerOnePixels.some((call) => call.x < renderedPlayerOne.left + 16), true);
assert.equal(playerOnePixels.some((call) => call.x >= renderedPlayerOne.left + 16), true);
canvasContext.calls.length = 0;
const renderedPlayerTwo = JSON.parse(JSON.stringify(api.debugRenderPlayerGameOverMessage(2, 47)));
assert.equal(renderedPlayerTwo.left, 0x88);
assert.equal(renderedPlayerTwo.x, 0x90);

const panel = JSON.parse(JSON.stringify(api.debugEnemyPanelCounterProbe(4, 2, 20)));
assert.equal(panel.remaining, 16);
assert.notEqual(panel.remaining, 18);
assert.equal(api.debugPanelLifeCountProbe(3).panelLives, 2);
assert.equal(api.debugPanelLifeCountProbe(1).panelLives, 0);
assert.equal(api.debugPanelLifeCountProbe(0).panelLives, 0);

const banner = JSON.parse(JSON.stringify(api.debugGameOverSlideProbe()));
assert.equal(banner.slideDuration, 127);
assert.equal(banner.holdDuration, 129);
assert.equal(banner.duration, 256);
assert.deepEqual(banner.entry, { screen: "gameOver", paused: false, timer: 256 });
assert.deepEqual(banner.frames.map((frame) => frame.phase), [
  "start",
  "firstMove",
  "slideEnd",
  "firstHold",
  "end"
]);
assert.deepEqual(banner.frames.map((frame) => frame.y), [240, 239, 0x71, 0x71, 0x71]);

console.log("battle-hud-presentation integration test passed");
