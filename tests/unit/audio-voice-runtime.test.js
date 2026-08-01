const assert = require("assert").strict;
const runtime = require("../../src/runtime/audio-voice-runtime");

assert.equal(Object.isFrozen(runtime), true);

const oscillators = [];
const state = {
  activeSequencedSounds: new Map(),
  audioCtx: {
    currentTime: 5,
    destination: {},
    createOscillator() {
      const oscillator = {
        frequency: { value: 0 },
        type: "",
        startTime: null,
        stopTime: null,
        connect(node) { this.node = node; return node; },
        start(time) { this.startTime = time; },
        stop(time) { this.stopTime = time; }
      };
      oscillators.push(oscillator);
      return oscillator;
    },
    createGain() {
      return {
        gain: {
          setValueAtTime(value, time) { this.initial = [value, time]; },
          exponentialRampToValueAtTime(value, time) { this.ramp = [value, time]; }
        },
        connect(node) { this.node = node; return this; }
      };
    }
  },
  fn: {}
};
const redirected = [];
const deps = {
  FREE_AUDIO_MANIFEST: {
    events: {
      brickHit: {},
      phrase: { notes: [180, 0, 240], noteFrames: [2, 1, 3], gain: 0.03, wave: "triangle" },
      poly: { voices: [{ notes: [300] }, { notes: [400] }] },
      brush: { freq: 100, duration: 0.1, gain: 0.02, wave: "square", brushPitch: 10 }
    }
  }
};
state.fn.startBrickHitAudio = () => redirected.push("brickHit");

runtime.setupAudioVoiceRuntime(state, deps);
for (const name of ["initAudio", "trackSequencedSound", "stopSound", "beep", "playSoundVoice", "playSound"]) {
  assert.equal(typeof state.fn[name], "function");
}

state.fn.beep(220, 0.25, 0.04, "sawtooth", 0.5, "tone");
assert.equal(oscillators.length, 1);
assert.equal(oscillators[0].frequency.value, 220);
assert.equal(oscillators[0].type, "sawtooth");
assert.equal(oscillators[0].startTime, 5.5);
assert.equal(oscillators[0].stopTime, 5.75);
assert.equal(state.activeSequencedSounds.get("tone").has(oscillators[0]), true);
oscillators[0].onended();
assert.equal(state.activeSequencedSounds.has("tone"), false);

const voiceCalls = [];
state.fn.beep = (...args) => voiceCalls.push(args);
state.fn.playSoundVoice("phrase", deps.FREE_AUDIO_MANIFEST.events.phrase, deps.FREE_AUDIO_MANIFEST.events.phrase);
assert.equal(voiceCalls.length, 2);
assert.equal(voiceCalls[0][0], 180);
assert.equal(voiceCalls[0][1], 2 / 60);
assert.equal(voiceCalls[0][4], 0);
assert.equal(voiceCalls[1][0], 240);
assert.equal(voiceCalls[1][4], 3 / 60);

const routed = [];
state.fn.stopSound = (name) => routed.push(["stop", name]);
state.fn.playSoundVoice = (...args) => routed.push(["voice", ...args]);
state.fn.playSound("poly");
assert.deepEqual(routed.map((call) => call.slice(0, 2)), [
  ["stop", "poly"],
  ["voice", "poly"],
  ["voice", "poly"]
]);

state.fn.playSound("brickHit");
assert.deepEqual(redirected, ["brickHit"]);

routed.length = 0;
state.fn.beep = (...args) => routed.push(["beep", ...args]);
state.fn.playSound("brush", { brush: 3 });
assert.deepEqual(routed, [["beep", 130, 0.1, 0.02, "square"]]);

const syncCalls = [];
for (const name of [
  "syncStageStartAudioNodes", "syncBonusLifeAudioNodes", "syncPowerUpPickupAudioNodes",
  "syncPowerUpAppearAudioNodes", "syncBrickHitAudioNodes", "syncBaseHitAudioNodes",
  "syncSteelHitAudioNodes", "syncEnemyHitAudioNodes", "syncEnemyDestroyAudioNodes",
  "syncPlayerDestroyAudioNodes", "syncPlayerShootAudioNodes", "syncMovementIceAudioNodes",
  "syncPauseAudioNodes", "syncScoreCountAudioNodes", "syncStageBonusAudioNodes",
  "syncGameOverAudioNodes", "syncHighScoreAudioNodes", "syncMovementAudio"
]) {
  state.fn[name] = () => syncCalls.push(name);
}
state.fn.initAudio();
assert.equal(syncCalls.length, 18);
assert.equal(syncCalls.at(-1), "syncMovementAudio");

console.log("audio-voice-runtime unit test passed");
