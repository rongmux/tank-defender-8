const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;
const schema = JSON.parse(JSON.stringify(api.stagePackSchema()));

assert(modules.playerMovementSettings, "player movement settings module should register before game.js");
assert.deepEqual(schema.gameSettings.playerMovement, {
  speed: 1,
  frameCadence: [true, true, false, true],
  iceSlideFrames: 28,
  iceSlideSpeed: 1
});
const defaultProbe = JSON.parse(JSON.stringify(api.debugPlayerMovementCadenceProbe()));
assert.equal(defaultProbe.speed, 1);
assert.deepEqual(defaultProbe.cadence, [true, true, false, true]);
assert.deepEqual(defaultProbe.frames.map((frame) => frame.active), [true, true, false, true, true, true, false, true]);
assert.equal(defaultProbe.activeFrames, 6);
assert.equal(defaultProbe.distanceOverEightFrames, 6);

const legacySpeedPack = {
  id: "player-movement-legacy-speed",
  totalStages: 1,
  maps: [schema.maps[0]],
  enemies: [schema.enemies[0].slice(0, 3)],
  gameSettings: { playerMovement: { speed: 1.5, iceSlideFrames: 3, iceSlideSpeed: 0.4 } }
};
assert.equal(api.validateStagePack(legacySpeedPack).ok, true);
assert.equal(api.loadStagePack(legacySpeedPack), true);
const legacyCurrent = api.currentPackInfo().playerMovement;
assert.deepEqual(JSON.parse(JSON.stringify(legacyCurrent)), {
  speed: 1.5,
  frameCadence: [true],
  iceSlideFrames: 3,
  iceSlideSpeed: 0.4
});
legacyCurrent.frameCadence[0] = false;
assert.equal(api.currentPackInfo().playerMovement.frameCadence[0], true);
const legacyProbe = JSON.parse(JSON.stringify(api.debugPlayerMovementCadenceProbe()));
assert.equal(legacyProbe.activeFrames, 8);
assert.equal(legacyProbe.distanceOverEightFrames, 12);

const explicitCadencePack = {
  ...legacySpeedPack,
  id: "player-movement-explicit-cadence",
  gameSettings: { playerMovement: { speed: 2, frameCadence: [true, false] } }
};
assert.equal(api.loadStagePack(explicitCadencePack), true);
const explicitProbe = JSON.parse(JSON.stringify(api.debugPlayerMovementCadenceProbe()));
assert.deepEqual(explicitProbe.cadence, [true, false]);
assert.equal(explicitProbe.activeFrames, 4);
assert.equal(explicitProbe.distanceOverEightFrames, 8);

const invalidMovements = [
  { speed: 0 },
  { frameCadence: [false, false] },
  { frameCadence: [true, 1] },
  { iceSlideFrames: -1 },
  { iceSlideSpeed: 7 }
];
for (const [index, playerMovement] of invalidMovements.entries()) {
  const pack = {
    ...legacySpeedPack,
    id: `bad-player-movement-${index}`,
    gameSettings: { playerMovement }
  };
  assert.equal(api.validateStagePack(pack).ok, false);
}

console.log("player-movement-settings integration test passed");
