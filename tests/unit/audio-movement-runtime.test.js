"use strict";

const assert = require("assert").strict;
const runtime = require("../../src/runtime/audio-movement-runtime");

let blocked = false;
let oscillatorCount = 0;
const state = {
  audioCtx: {
    currentTime: 0,
    destination: {},
    createOscillator() {
      const oscillator = {
        type: "",
        frequency: { value: 0 },
        started: false,
        stopped: false,
        connect(node) { this.node = node; return this; },
        start() { this.started = true; },
        stop() { this.stopped = true; }
      };
      oscillatorCount += 1;
      return oscillator;
    },
    createGain() {
      return {
        gain: { value: 0 },
        connect(node) { this.node = node; return this; }
      };
    }
  },
  game: {
    demoMode: false,
    tick: 4,
    players: [{ id: 1, alive: true, respawn: 0 }]
  },
  movementAudio: { mode: "none", oscillator: null, gain: null, phase: -1 },
  fn: {
    currentAudioMixState() {
      return {
        screen: "playing",
        paused: false,
        clearPendingTimer: 0,
        baseDestroyTimer: 0,
        bonusLifePulse1Active: false,
        bonusLifePulse2Active: false,
        active: {}
      };
    },
    getPlayerControl() { return { up: "up", right: "right", down: "down", left: "left" }; },
    hasControlKey(binding) { return binding === "right"; },
    demoControlForPlayer() { return { direction: -1 }; }
  }
};
const deps = {
  FREE_AUDIO_MANIFEST: { events: { movement: {} } },
  movementAudioPresentation(mode, tick) {
    return { frequency: mode === "player" ? 220 + tick : 110 + tick, gain: 0.02, phase: Math.floor(tick / 4), wave: "square" };
  },
  isMovementAudioBlocked() { return blocked; },
  resolveMovementAudioMode(input) { return input.playerMovementRequested ? "player" : "enemy"; }
};

assert.equal(Object.isFrozen(runtime), true);
runtime.setupAudioMovementRuntime(state, deps);
for (const name of [
  "movementAudioPresentation", "stopMovementAudioNode", "startMovementAudioNode", "setMovementAudioMode",
  "stopMovementAudio", "playerHasMovementSoundState", "playerMovementAudioRequested",
  "movementAudioModeForState", "syncMovementAudio"
]) {
  assert.equal(typeof state.fn[name], "function");
}

assert.equal(state.fn.playerMovementAudioRequested(), true);
assert.equal(state.fn.movementAudioModeForState(), "player");
state.fn.setMovementAudioMode("player");
assert.equal(oscillatorCount, 1);
assert.equal(state.movementAudio.oscillator.started, true);
assert.equal(state.movementAudio.oscillator.frequency.value, 224);

state.game.tick = 8;
state.fn.setMovementAudioMode("player");
assert.equal(state.movementAudio.oscillator.frequency.value, 228);

blocked = true;
assert.equal(state.fn.movementAudioModeForState(), "none");
state.fn.stopMovementAudio();
assert.equal(state.movementAudio.mode, "none");
assert.equal(state.movementAudio.oscillator, null);

console.log("audio-movement-runtime unit test passed");
