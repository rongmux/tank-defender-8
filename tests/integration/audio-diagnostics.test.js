const assert = require("assert").strict;
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

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

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.audioDiagnostics, "audio diagnostics module should register before game.js");
assert.equal(Object.isFrozen(modules.audioDiagnostics), true);
assert.deepEqual(
  JSON.parse(JSON.stringify(Object.keys(api).slice(3, 34))),
  AUDIO_DIAGNOSTIC_METHODS
);

const outputs = {};
for (const name of AUDIO_DIAGNOSTIC_METHODS) outputs[name] = api[name]();
const json = JSON.stringify(outputs);
assert.equal(Buffer.byteLength(json), 61974);
assert.equal(
  crypto.createHash("sha256").update(json).digest("hex"),
  "ed849a9d7504e78d18db643d6cbfa1b0f3b6fd884aa1ed411d2ad538abc9c730"
);

const firstManifest = api.audioManifest();
firstManifest.events.stageStart.durationFrames = -1;
assert.notEqual(api.audioManifest().events.stageStart.durationFrames, -1);

const debugSource = fs.readFileSync(path.join(root, "src/runtime/debug-api.js"), "utf8");
const diagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/audio-diagnostics.js"),
  "utf8"
);
assert(debugSource.includes("...createAudioDiagnostics(state, deps)"));
for (const name of AUDIO_DIAGNOSTIC_METHODS) {
  assert.equal(debugSource.includes(`${name}()`), false);
  assert.equal(diagnosticsSource.includes(`${name}()`), true);
}
assert.equal(debugSource.includes("function startScoreCountAudio()"), false);
assert(debugSource.split(/\r?\n/).length < 6500);

console.log("audio-diagnostics integration test passed");
