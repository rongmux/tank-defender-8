const assert = require("assert").strict;
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const dataManifest = JSON.parse(
  fs.readFileSync(path.join(root, "data", "free-audio-manifest.json"), "utf8")
);
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.freeAudioManifest, "free audio manifest module should register before game.js");
assert.equal(Object.isFrozen(modules.freeAudioManifest), true);
assert.equal(Object.isFrozen(modules.freeAudioManifest.FREE_AUDIO_MANIFEST), true);
assert.deepEqual(
  JSON.parse(JSON.stringify(modules.freeAudioManifest.FREE_AUDIO_MANIFEST)),
  dataManifest
);

const firstRuntimeClone = JSON.parse(JSON.stringify(api.audioManifest()));
const secondRuntimeClone = api.audioManifest();
assert.deepEqual(firstRuntimeClone, dataManifest);
firstRuntimeClone.events.stageStart.durationFrames = 1;
firstRuntimeClone.events.movementEnemy.frequencies[0] = 1;
assert.equal(secondRuntimeClone.events.stageStart.durationFrames, 264);
assert.deepEqual(Array.from(secondRuntimeClone.events.movementEnemy.frequencies), [72, 64]);
assert.notEqual(secondRuntimeClone, modules.freeAudioManifest.FREE_AUDIO_MANIFEST);
assert.notEqual(secondRuntimeClone.events, modules.freeAudioManifest.FREE_AUDIO_MANIFEST.events);

console.log("free-audio-manifest integration test passed");
