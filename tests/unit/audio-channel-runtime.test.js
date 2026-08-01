"use strict";

const assert = require("assert").strict;
const runtime = require("../../src/runtime/audio-channel-runtime");

const channelNames = [
  "stageStart", "bonusLife", "powerUpPickup", "powerUpAppear", "brickHit", "baseHit",
  "steelHit", "enemyHit", "enemyDestroy", "playerDestroy", "playerShoot", "movementIce",
  "pause", "scoreCount", "stageBonus", "gameOver", "highScore"
];
const audio = Object.fromEntries(channelNames.map((name) => [name, { active: false, frame: 0 }]));
const calls = [];
const state = { audio, fn: {} };
const audibility = {
  stageStartAudibility: false,
  bonusLifeAudibility: false,
  powerUpPickupAudible: false,
  powerUpAppearAudible: false,
  brickHitAudible: false,
  baseHitAudible: false,
  steelHitAudible: false,
  enemyHitAudible: false,
  enemyDestroyAudible: false,
  playerShootAudible: false,
  movementIceAudible: false,
  stageBonusAudible: false
};
Object.assign(state.fn, {
  fixedFrameAudioPresentation(name, frame) { return { name, frame, voices: [null, null] }; },
  currentAudioAudibility() { return audibility; },
  syncFixedFrameAudioNodes(...args) { calls.push(["sync", ...args]); },
  startFixedFrameAudio(...args) { calls.push(["start", ...args]); },
  stopFixedFrameAudio(...args) { calls.push(["stop", ...args]); },
  updateFixedFrameAudio(...args) { calls.push(["update", ...args]); },
  syncMovementAudio() { calls.push(["movement"]); }
});

assert.equal(Object.isFrozen(runtime), true);
runtime.setupAudioChannelRuntime(state);

for (const name of channelNames) {
  assert.equal(typeof state.fn[`${name}AudioPresentation`], "function");
  assert.equal(typeof state.fn[`sync${name[0].toUpperCase()}${name.slice(1)}AudioNodes`], "function");
  assert.equal(typeof state.fn[`start${name[0].toUpperCase()}${name.slice(1)}Audio`], "function");
  assert.equal(typeof state.fn[`stop${name[0].toUpperCase()}${name.slice(1)}Audio`], "function");
  assert.equal(typeof state.fn[`update${name[0].toUpperCase()}${name.slice(1)}Audio`], "function");
}

assert.deepEqual(state.fn.stageStartAudioPresentation(3), { name: "stageStart", frame: 3, voices: [null, null] });
state.fn.startStageStartAudio();
assert.equal(calls[0][0], "start");
assert.equal(calls[0][2], "stageStart");

calls.length = 0;
state.fn.startPauseAudio();
assert.equal(calls[0][0], "start");
assert.equal(calls.filter((call) => call[0] === "sync").length, 12);

console.log("audio-channel-runtime unit test passed");
