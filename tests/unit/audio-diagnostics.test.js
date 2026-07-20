const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/audio-diagnostics");

const AUDIO_DIAGNOSTIC_METHODS = [
  "audioManifest",
  "debugScoreCountAudioProbe",
  "debugScoreCountAudioLifecycleProbe",
  "debugStageBonusAudioProbe",
  "debugStageBonusAudioLifecycleProbe",
  "debugMovementAudioProbe",
  "debugMovementIceAudioProbe",
  "debugBrickHitAudioProbe",
  "debugBrickHitAudioLifecycleProbe",
  "debugSteelHitAudioProbe",
  "debugSteelHitAudioLifecycleProbe",
  "debugEnemyHitAudioProbe",
  "debugEnemyHitAudioLifecycleProbe",
  "debugEnemyDestroyAudioProbe",
  "debugEnemyDestroyAudioLifecycleProbe",
  "debugPlayerDestroyAudioProbe",
  "debugPlayerDestroyAudioLifecycleProbe",
  "debugBaseHitAudioProbe",
  "debugBaseHitAudioLifecycleProbe",
  "debugPlayerShootAudioProbe",
  "debugPlayerShootAudioLifecycleProbe",
  "debugMovementIceAudioLifecycleProbe",
  "debugStageStartAudioProbe",
  "debugBonusLifeAudioProbe",
  "debugPowerUpPickupAudioProbe",
  "debugPowerUpAppearAudioProbe",
  "debugPowerUpAppearAudioLifecycleProbe",
  "debugPauseAudioProbe",
  "debugPauseAudioLifecycleProbe",
  "debugPowerUpPickupAudioLifecycleProbe",
  "debugBonusLifeAudioLifecycleProbe"
];

function createAudioState() {
  return {
    movementIce: {},
    playerShoot: {},
    steelHit: {},
    enemyHit: {},
    enemyDestroy: {},
    playerDestroy: {},
    baseHit: {},
    brickHit: {},
    stageStart: {},
    bonusLife: {},
    powerUpPickup: {},
    powerUpAppear: {},
    pause: {},
    scoreCount: {},
    stageBonus: {},
    gameOver: {},
    highScore: {}
  };
}

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(() => diagnostics.createAudioDiagnostics(), /state must be an object/);
assert.throws(() => diagnostics.createAudioDiagnostics({}, {}), /state\.fn must be an object/);
assert.throws(
  () => diagnostics.createAudioDiagnostics({ fn: {} }, {}),
  /state\.audio must be an object/
);
assert.throws(
  () => diagnostics.createAudioDiagnostics({ fn: {}, audio: {} }),
  /deps must be an object/
);
assert.throws(
  () => diagnostics.createAudioDiagnostics({ fn: {}, audio: {} }, {}),
  /deps\.sharedState must be an object/
);

const state = {
  fn: {
    scoreCountAudioPresentation(frame) {
      assert.equal(this, state.fn);
      return {
        voices: [
          { frequency: 440 + frame, gain: 0.5, wave: "pulse2" },
          null
        ]
      };
    }
  },
  stageRuntime: {},
  audio: createAudioState(),
  game: {},
  keys: new Set()
};
const manifest = {
  events: {
    scoreCount: {
      durationFrames: 2,
      voices: [{ duration: 1 }, { duration: 2 }]
    }
  }
};
const deps = {
  sharedState: {},
  FREE_AUDIO_MANIFEST: manifest,
  cloneAudioManifest() {
    assert.equal(this, deps);
    return JSON.parse(JSON.stringify(manifest));
  },
  fixedFrameVoiceDuration(voice) {
    return voice.duration;
  },
  scoreCountAudioPresentation() {
    throw new Error("state.fn presentation must take precedence");
  }
};

const api = diagnostics.createAudioDiagnostics(state, deps);
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), AUDIO_DIAGNOSTIC_METHODS);

const firstManifest = api.audioManifest();
firstManifest.events.scoreCount.durationFrames = 99;
assert.equal(api.audioManifest().events.scoreCount.durationFrames, 2);

assert.deepEqual(api.debugScoreCountAudioProbe(), {
  durationFrames: 2,
  voiceDurations: [1, 2],
  frames: [
    {
      frame: 0,
      voices: [
        { frequency: 440, gain: 0.5, wave: "pulse2" },
        null
      ]
    },
    {
      frame: 1,
      voices: [
        { frequency: 441, gain: 0.5, wave: "pulse2" },
        null
      ]
    }
  ]
});

console.log("audio-diagnostics unit test passed");
