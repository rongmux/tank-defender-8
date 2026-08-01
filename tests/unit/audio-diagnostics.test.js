const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/audio-diagnostics");
const audioScoreDiagnostics = require("../../src/runtime/audio-score-diagnostics");
const audioStageBonusDiagnostics = require("../../src/runtime/audio-stage-bonus-diagnostics");
const audioMovementDiagnostics = require("../../src/runtime/audio-movement-diagnostics");
const audioMovementLifecycleDiagnostics = require("../../src/runtime/audio-movement-lifecycle-diagnostics");
const audioBrickHitDiagnostics = require("../../src/runtime/audio-brick-hit-diagnostics");
const audioBrickHitLifecycleDiagnostics = require("../../src/runtime/audio-brick-hit-lifecycle-diagnostics");
const audioSteelHitDiagnostics = require("../../src/runtime/audio-steel-hit-diagnostics");
const audioSteelHitLifecycleDiagnostics = require("../../src/runtime/audio-steel-hit-lifecycle-diagnostics");
const audioEnemyHitDiagnostics = require("../../src/runtime/audio-enemy-hit-diagnostics");
const audioEnemyHitLifecycleDiagnostics = require("../../src/runtime/audio-enemy-hit-lifecycle-diagnostics");
const audioEnemyDestroyDiagnostics = require("../../src/runtime/audio-enemy-destroy-diagnostics");
const audioEnemyDestroyLifecycleDiagnostics = require("../../src/runtime/audio-enemy-destroy-lifecycle-diagnostics");
const audioPlayerDestroyDiagnostics = require("../../src/runtime/audio-player-destroy-diagnostics");
const audioPlayerDestroyLifecycleDiagnostics = require("../../src/runtime/audio-player-destroy-lifecycle-diagnostics");
const audioBaseHitDiagnostics = require("../../src/runtime/audio-base-hit-diagnostics");
const audioBaseHitLifecycleDiagnostics = require("../../src/runtime/audio-base-hit-lifecycle-diagnostics");
const audioPlayerShootDiagnostics = require("../../src/runtime/audio-player-shoot-diagnostics");
const audioStageStartDiagnostics = require("../../src/runtime/audio-stage-start-diagnostics");
const audioBonusLifeDiagnostics = require("../../src/runtime/audio-bonus-life-diagnostics");
const audioBonusLifeLifecycleDiagnostics = require("../../src/runtime/audio-bonus-life-lifecycle-diagnostics");
const audioPowerUpPickupDiagnostics = require("../../src/runtime/audio-power-up-pickup-diagnostics");
const audioPowerUpPickupLifecycleDiagnostics = require("../../src/runtime/audio-power-up-pickup-lifecycle-diagnostics");
const audioPowerUpAppearDiagnostics = require("../../src/runtime/audio-power-up-appear-diagnostics");
const audioPowerUpAppearLifecycleDiagnostics = require("../../src/runtime/audio-power-up-appear-lifecycle-diagnostics");
const audioPauseDiagnostics = require("../../src/runtime/audio-pause-diagnostics");
const audioPauseLifecycleDiagnostics = require("../../src/runtime/audio-pause-lifecycle-diagnostics");

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
  audioScoreDiagnostics,
  audioStageBonusDiagnostics,
  audioMovementDiagnostics,
  audioMovementLifecycleDiagnostics,
  audioBrickHitDiagnostics,
  audioBrickHitLifecycleDiagnostics,
  audioSteelHitDiagnostics,
  audioSteelHitLifecycleDiagnostics,
  audioEnemyHitDiagnostics,
  audioEnemyHitLifecycleDiagnostics,
  audioEnemyDestroyDiagnostics,
  audioEnemyDestroyLifecycleDiagnostics,
  audioPlayerDestroyDiagnostics,
  audioPlayerDestroyLifecycleDiagnostics,
  audioBaseHitDiagnostics,
  audioBaseHitLifecycleDiagnostics,
  audioPlayerShootDiagnostics,
  audioStageStartDiagnostics,
  audioBonusLifeDiagnostics,
  audioBonusLifeLifecycleDiagnostics,
  audioPowerUpPickupDiagnostics,
  audioPowerUpPickupLifecycleDiagnostics,
  audioPowerUpAppearDiagnostics,
  audioPowerUpAppearLifecycleDiagnostics,
  audioPauseDiagnostics,
  audioPauseLifecycleDiagnostics,
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
