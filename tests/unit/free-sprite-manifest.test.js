const assert = require("assert").strict;
const fs = require("fs");
const path = require("path");
const freeSpriteManifest = require("../../src/presentation/free-sprite-manifest");

const root = path.resolve(__dirname, "../..");
const dataManifest = JSON.parse(
  fs.readFileSync(path.join(root, "data", "free-sprite-manifest.json"), "utf8")
);
const { FREE_SPRITE_MANIFEST, cloneSpriteManifest } = freeSpriteManifest;
const { sprites } = FREE_SPRITE_MANIFEST;

assert.equal(Object.isFrozen(freeSpriteManifest), true);
assert.equal(Object.isFrozen(FREE_SPRITE_MANIFEST), true);
assert.equal(Object.isFrozen(sprites), true);
assert.equal(Object.isFrozen(sprites.powerUp.frames.star), true);
assert.equal(Object.isFrozen(sprites.powerUp.frames.star[0].rect), true);
assert.deepEqual(FREE_SPRITE_MANIFEST, dataManifest);
assert.equal(FREE_SPRITE_MANIFEST.id, "free-procedural-sprites");
assert.equal(FREE_SPRITE_MANIFEST.type, "procedural-rect-sprites");
assert.equal(Object.keys(sprites).length, 14);

assert.equal(sprites.tank.frames.up.length, 7);
assert.deepEqual(Object.keys(sprites.tankTracks.frames), [
  "verticalA",
  "verticalB",
  "horizontalA",
  "horizontalB"
]);
assert.notDeepEqual(sprites.tankTracks.frames.verticalA, sprites.tankTracks.frames.verticalB);
assert.notDeepEqual(sprites.tankTracks.frames.horizontalA, sprites.tankTracks.frames.horizontalB);

assert.equal(sprites.powerUp.size, 16);
assert.equal(sprites.powerUp.frames.timer.length, 10);
assert.equal(sprites.powerUp.frames.shovel.length, 12);
for (const type of ["grenade", "helmet", "shovel", "star", "timer", "tank"]) {
  assert.equal(
    sprites.powerUp.frames[type].some((part) => part.role === "outline"),
    true,
    `${type} power-up should retain a dark outline`
  );
}
assert.equal(
  sprites.wallQuarter.frames.steel.filter((part) => part.role === "bolt").length,
  2
);
assert.equal(sprites.powerUp.frames.star.length >= 8, true);
assert.equal(
  sprites.powerUp.frames.star.filter((part) => part.role === "primary").length >= 5,
  true
);

assert.equal(sprites.terrain.frames.waterA.length, 3);
assert.notDeepEqual(
  sprites.terrain.frames.waterA.slice(1),
  sprites.terrain.frames.waterB.slice(1)
);
assert.equal(sprites.base.frames.alive.length, 4);
assert.equal(sprites.bullet.frames.default.length, 1);
assert.equal(sprites.spawn.frames.box[0].op, "stroke");
assert.deepEqual(Object.keys(sprites.hiddenDrop.frames), [
  "morph0",
  "morph1",
  "morph2",
  "morph3",
  "fall"
]);
assert.equal(sprites.miniTank.frames.up.length, 5);
assert.equal(sprites.explosion.frames.burst.length, 2);
assert.deepEqual(Object.keys(sprites.destructionExplosion.frames), [
  "phase1",
  "phase2",
  "phase3",
  "phase4",
  "phase5"
]);
assert.equal(sprites.enemyCounter.frames.remaining.length, 1);

const firstClone = cloneSpriteManifest();
const secondClone = cloneSpriteManifest();
assert.deepEqual(firstClone, FREE_SPRITE_MANIFEST);
assert.notEqual(firstClone, FREE_SPRITE_MANIFEST);
assert.notEqual(firstClone.sprites, FREE_SPRITE_MANIFEST.sprites);
assert.notEqual(firstClone.sprites.powerUp.frames.star, sprites.powerUp.frames.star);
firstClone.sprites.powerUp.frames.star[0].rect[0] = 99;
firstClone.sprites.tank.frames.up.length = 0;
assert.notEqual(secondClone.sprites.powerUp.frames.star[0].rect[0], 99);
assert.equal(secondClone.sprites.tank.frames.up.length, 7);
assert.equal(sprites.tank.frames.up.length, 7);

console.log("free-sprite-manifest unit test passed");
