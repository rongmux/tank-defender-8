const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;
const clone = (value) => JSON.parse(JSON.stringify(value));

assert(
  modules.fixedFrameAudioState,
  "fixed-frame audio state module should register before game.js"
);
assert.equal(Object.isFrozen(modules.fixedFrameAudioState), true);

const scoreCount = clone(api.debugScoreCountAudioLifecycleProbe());
assert.equal(scoreCount.simultaneous.active, true);
assert.equal(scoreCount.simultaneous.frame, 0);
assert.equal(scoreCount.afterOneFrame.active, false);
assert.equal(scoreCount.afterOneFrame.frame, 1);
assert.equal(scoreCount.afterOneFrame.voices.every((voice) => voice === null), true);
assert.equal(scoreCount.stageCleanup.active, false);
assert.equal(scoreCount.stageCleanup.frame, 0);

const movementIce = clone(api.debugMovementIceAudioLifecycleProbe());
assert.equal(movementIce.start.active, true);
assert.equal(movementIce.start.frame, 0);
assert.equal(movementIce.beforePause.active, true);
assert.equal(movementIce.beforePause.frame, 3);
assert.equal(movementIce.paused.active, true);
assert.equal(movementIce.paused.frame, 3);
assert.equal(movementIce.paused.movementAudioMode, "none");
assert.equal(movementIce.end.active, false);
assert.equal(movementIce.end.frame, 4);
assert.equal(movementIce.end.movementAudioMode, "enemy");
assert.equal(movementIce.retriggered.active, true);
assert.equal(movementIce.retriggered.frame, 0);
assert.equal(movementIce.stageCleanup.active, false);
assert.equal(movementIce.stageCleanup.frame, 0);

const bonusLife = clone(api.debugBonusLifeAudioLifecycleProbe());
assert.equal(bonusLife.start.active, true);
assert.equal(bonusLife.start.frame, 0);
assert.equal(bonusLife.start.movementAudioMode, "none");
assert.equal(bonusLife.beforePulse2End.active, true);
assert.equal(bonusLife.beforePulse2End.frame, 53);
assert.equal(bonusLife.beforePulse2End.pulse2Active, true);
assert.equal(bonusLife.pulse2End.active, true);
assert.equal(bonusLife.pulse2End.frame, 54);
assert.equal(bonusLife.pulse2End.pulse2Active, false);
assert.equal(bonusLife.pulse2End.movementAudioMode, "enemy");
assert.equal(bonusLife.paused.active, true);
assert.equal(bonusLife.paused.frame, 54);
assert.equal(bonusLife.beforeEnd.active, true);
assert.equal(bonusLife.beforeEnd.frame, 59);
assert.equal(bonusLife.end.active, false);
assert.equal(bonusLife.end.frame, 60);

const pause = clone(api.debugPauseAudioLifecycleProbe());
assert.equal(pause.entered, true);
assert.equal(pause.entry.paused, true);
assert.equal(pause.entry.active, true);
assert.equal(pause.entry.frame, 0);
assert.equal(pause.paused.frame, 10);
assert.equal(pause.paused.stageStartFrame, 0);
assert.equal(pause.paused.bonusLifeFrame, 0);
assert.equal(pause.paused.powerUpPickupFrame, 0);
assert.equal(pause.paused.powerUpAppearFrame, 0);
assert.equal(pause.paused.tick, 25);
assert.equal(pause.reentered, true);
assert.equal(pause.restart.paused, true);
assert.equal(pause.restart.active, true);
assert.equal(pause.restart.frame, 0);
assert.equal(pause.finalPausedFrame.paused, true);
assert.equal(pause.finalPausedFrame.active, true);
assert.equal(pause.finalPausedFrame.frame, 35);
assert.equal(pause.exitedBeforeEnd, true);
assert.equal(pause.finalActiveFrame.paused, false);
assert.equal(pause.finalActiveFrame.frame, 35);
assert.equal(pause.finalActiveFrame.movementAudioMode, "none");
assert.equal(pause.ended.active, false);
assert.equal(pause.ended.frame, 36);
assert.equal(pause.ended.movementAudioMode, "enemy");
assert.equal(pause.ended.tick, 26);

console.log("fixed-frame-audio-state integration test passed");
