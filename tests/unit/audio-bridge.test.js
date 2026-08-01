const assert = require("assert").strict;
const audioBridge = require("../../src/runtime/audio-bridge");
const audioFixedFrameRuntime = require("../../src/runtime/audio-fixed-frame-runtime");
const audioChannelRuntime = require("../../src/runtime/audio-channel-runtime");
const audioMovementRuntime = require("../../src/runtime/audio-movement-runtime");

const state = {
  activeSequencedSounds: new Map(),
  audio: {},
  audioCtx: null,
  game: { players: [] },
  fn: {},
  movementAudio: {},
  noiseBufferCache: {}
};
audioBridge.setupAudioBridge(state, {
  requireRuntimeModule(name) {
    if (name === "audioFixedFrameRuntime") return audioFixedFrameRuntime;
    if (name === "audioChannelRuntime") return audioChannelRuntime;
    if (name === "audioMovementRuntime") return audioMovementRuntime;
    assert.fail(`unexpected runtime module: ${name}`);
  }
});

const updateMethods = [
  "updateStageStartAudio",
  "updateBonusLifeAudio",
  "updatePowerUpPickupAudio",
  "updatePowerUpAppearAudio",
  "updateBrickHitAudio",
  "updateBaseHitAudio",
  "updateSteelHitAudio",
  "updateEnemyHitAudio",
  "updateEnemyDestroyAudio",
  "updatePlayerDestroyAudio",
  "updatePlayerShootAudio",
  "updateMovementIceAudio",
  "updatePauseAudio",
  "updateScoreCountAudio",
  "updateStageBonusAudio",
  "updateGameOverAudio",
  "updateHighScoreAudio"
];
const gameplayStopMethods = [
  "stopMovementAudio",
  "stopStageStartAudio",
  "stopBonusLifeAudio",
  "stopPowerUpPickupAudio",
  "stopPowerUpAppearAudio",
  "stopPauseAudio",
  "stopBrickHitAudio",
  "stopEnemyHitAudio",
  "stopBaseHitAudio",
  "stopEnemyDestroyAudio",
  "stopPlayerDestroyAudio",
  "stopSteelHitAudio",
  "stopPlayerShootAudio",
  "stopMovementIceAudio",
  "stopScoreCountAudio",
  "stopStageBonusAudio"
];
const allStopMethods = gameplayStopMethods.concat(["stopGameOverAudio", "stopHighScoreAudio"]);
const events = [];
for (const name of [...updateMethods, ...allStopMethods]) {
  state.fn[name] = () => events.push(name);
}

state.fn.updateAllAudio();
assert.deepEqual(events, updateMethods);

events.length = 0;
state.fn.stopGameplayAudioBeforeResult();
assert.deepEqual(events, gameplayStopMethods);

events.length = 0;
state.fn.stopStageResultAudio();
assert.deepEqual(events, ["stopScoreCountAudio", "stopStageBonusAudio"]);

events.length = 0;
state.fn.stopAllAudio();
assert.deepEqual(events, allStopMethods);

console.log("audio-bridge unit test passed");
