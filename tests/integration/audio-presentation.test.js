const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.audioPresentation, "audio presentation module should register before game.js");
assert.equal(Object.isFrozen(modules.audioPresentation), true);

const scoreCount = JSON.parse(JSON.stringify(api.debugScoreCountAudioProbe()));
assert.equal(scoreCount.durationFrames, 1);
assert.deepEqual(scoreCount.voiceDurations, [1, 1]);
assert.deepEqual(scoreCount.frames[0].voices.map((voice) => voice.wave), ["square", "noise-short"]);
assert.deepEqual(scoreCount.frames[0].voices.map((voice) => voice.frequency), [165, 27965]);
assert.equal(scoreCount.frames[1].voices.every((voice) => voice === null), true);

const movement = JSON.parse(JSON.stringify(api.debugMovementAudioProbe()));
assert.deepEqual(movement.modes, {
  title: "none",
  idleBattle: "enemy",
  stageStart: "none",
  bonusLifePulse2: "none",
  bonusLifePulse1Tail: "enemy",
  powerUpPickup: "none",
  powerUpAppear: "none",
  baseHit: "none",
  enemyHit: "none",
  pauseCue: "none",
  heldDirection: "player",
  heldDuringDeathState: "player",
  heldAfterTankRemoved: "enemy",
  paused: "none",
  clearDelay: "none",
  gameOver: "none"
});
assert.deepEqual(movement.enemyFrames.map((frame) => frame.frequency), [72, 72, 64, 64, 72]);
assert.deepEqual(movement.playerFrames.map((frame) => frame.frequency), [112, 112, 96, 96, 112]);
assert.equal(movement.ice.durationFrames, 4);
assert.equal(movement.ice.voices[0].segments[0].frequencies.length, 4);

const stageStart = JSON.parse(JSON.stringify(api.debugStageStartAudioProbe()));
assert.equal(stageStart.durationFrames, 264);
assert.deepEqual(stageStart.voiceDurations, [264, 264, 264]);
assert.deepEqual(stageStart.waves, ["square", "triangle", "square"]);
assert.equal(stageStart.frames[0].voices.every(Boolean), true);
assert.equal(stageStart.frames[1].voices[0].frequency, 330);
assert.equal(stageStart.frames[2].voices[0].frequency, 392);
assert.equal(stageStart.frames[4].voices[0].segmentIndex, 1);
assert.equal(stageStart.frames[7].voices.every(Boolean), true);
assert.equal(stageStart.frames[8].voices.every((voice) => voice === null), true);

console.log("audio-presentation integration test passed");
