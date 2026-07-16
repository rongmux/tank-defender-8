const assert = require("assert").strict;
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const dataManifest = JSON.parse(
  fs.readFileSync(path.join(root, "data", "free-sprite-manifest.json"), "utf8")
);
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(
  modules.freeSpriteManifest,
  "free sprite manifest module should register before game.js"
);
assert.equal(Object.isFrozen(modules.freeSpriteManifest), true);
assert.equal(Object.isFrozen(modules.freeSpriteManifest.FREE_SPRITE_MANIFEST), true);
assert.deepEqual(
  JSON.parse(JSON.stringify(modules.freeSpriteManifest.FREE_SPRITE_MANIFEST)),
  dataManifest
);

const firstRuntimeClone = JSON.parse(JSON.stringify(api.spriteManifest()));
const secondRuntimeClone = api.spriteManifest();
assert.deepEqual(firstRuntimeClone, dataManifest);
firstRuntimeClone.sprites.powerUp.frames.star[0].rect[0] = 99;
firstRuntimeClone.sprites.tank.frames.up.length = 0;
assert.notEqual(secondRuntimeClone.sprites.powerUp.frames.star[0].rect[0], 99);
assert.equal(secondRuntimeClone.sprites.tank.frames.up.length, 7);
assert.notEqual(secondRuntimeClone, modules.freeSpriteManifest.FREE_SPRITE_MANIFEST);
assert.notEqual(
  secondRuntimeClone.sprites,
  modules.freeSpriteManifest.FREE_SPRITE_MANIFEST.sprites
);

console.log("free-sprite-manifest integration test passed");
