const assert = require("assert").strict;
const fs = require("fs");
const path = require("path");
const freeAudioManifest = require("../../src/audio/free-audio-manifest");

const root = path.resolve(__dirname, "../..");
const dataManifest = JSON.parse(
  fs.readFileSync(path.join(root, "data", "free-audio-manifest.json"), "utf8")
);
const { FREE_AUDIO_MANIFEST, cloneAudioManifest } = freeAudioManifest;

assert.equal(Object.isFrozen(freeAudioManifest), true);
assert.equal(Object.isFrozen(FREE_AUDIO_MANIFEST), true);
assert.equal(Object.isFrozen(FREE_AUDIO_MANIFEST.events), true);
assert.equal(Object.isFrozen(FREE_AUDIO_MANIFEST.events.stageStart.voices), true);
assert.equal(Object.isFrozen(FREE_AUDIO_MANIFEST.events.stageStart.voices[0].segments), true);
assert.deepEqual(FREE_AUDIO_MANIFEST, dataManifest);
assert.equal(FREE_AUDIO_MANIFEST.id, "free-synth-audio");
assert.equal(FREE_AUDIO_MANIFEST.type, "procedural-web-audio");
assert.equal(Object.keys(FREE_AUDIO_MANIFEST.events).length, 26);

const fixedEvents = {
  baseHit: [27, "square"],
  bonusLife: [60, "square,square"],
  brickHit: [3, "triangle"],
  enemyDestroy: [14, "noise-long"],
  enemyHit: [5, "square"],
  gameOver: [108, "square,square,triangle"],
  highScore: [460, "square,square,triangle"],
  movementIce: [4, "square"],
  pause: [36, "square"],
  playerDestroy: [26, "noise-long"],
  playerShoot: [15, "square"],
  powerUp: [39, "square"],
  powerUpAppear: [32, "square"],
  scoreCount: [1, "square,noise-short"],
  stageBonus: [28, "square"],
  stageStart: [264, "square,triangle,square"],
  steelHit: [4, "square"]
};
for (const [eventName, [durationFrames, waves]] of Object.entries(fixedEvents)) {
  const event = FREE_AUDIO_MANIFEST.events[eventName];
  assert(event, `missing fixed-frame audio event: ${eventName}`);
  assert.equal(event.durationFrames, durationFrames);
  assert.equal(event.voices.map((voice) => voice.wave).join(","), waves);
}

assert.deepEqual(FREE_AUDIO_MANIFEST.events.movementEnemy.frequencies, [72, 64]);
assert.equal(FREE_AUDIO_MANIFEST.events.movementEnemy.stepFrames, 4);
assert.deepEqual(FREE_AUDIO_MANIFEST.events.movementPlayer.frequencies, [112, 96]);
assert.equal(FREE_AUDIO_MANIFEST.events.movementPlayer.stepFrames, 16);
assert.equal(
  Object.prototype.hasOwnProperty.call(FREE_AUDIO_MANIFEST.events, "enemyShoot"),
  false
);

const firstClone = cloneAudioManifest();
const secondClone = cloneAudioManifest();
assert.deepEqual(firstClone, FREE_AUDIO_MANIFEST);
assert.notEqual(firstClone, FREE_AUDIO_MANIFEST);
assert.notEqual(firstClone.events, FREE_AUDIO_MANIFEST.events);
assert.notEqual(firstClone.events.stageStart.voices, FREE_AUDIO_MANIFEST.events.stageStart.voices);
firstClone.events.powerUp.durationFrames = 1;
firstClone.events.stageStart.voices[0].segments[0].frequencies[0] = 1;
assert.equal(secondClone.events.powerUp.durationFrames, 39);
assert.equal(secondClone.events.stageStart.voices[0].segments[0].frequencies[0], 330);
assert.equal(FREE_AUDIO_MANIFEST.events.powerUp.durationFrames, 39);

console.log("free-audio-manifest unit test passed");
