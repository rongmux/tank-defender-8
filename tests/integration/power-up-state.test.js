const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;
const schema = JSON.parse(JSON.stringify(api.stagePackSchema()));

assert(modules.powerUpState, "power-up state module should register before game.js");
assert.equal(Object.isFrozen(modules.powerUpState), true);

const defaultLifecycle = JSON.parse(JSON.stringify(api.debugPowerUpAppearAudioLifecycleProbe()));
assert.equal(defaultLifecycle.spawned, true);
assert.equal(defaultLifecycle.start.powerUp.type, "star");
assert.equal(defaultLifecycle.start.powerUp.w, 12);
assert.equal(defaultLifecycle.start.powerUp.h, 12);
assert.equal(defaultLifecycle.start.powerUp.ttl, schema.gameSettings.timings.powerUpTtl);
assert.equal(defaultLifecycle.noSpotSpawned, false);
assert.equal(defaultLifecycle.noSpot.powerUp, null);

const customPack = {
  id: "power-up-state-integration",
  totalStages: 1,
  maps: [schema.maps[0]],
  enemies: [schema.enemies[0].slice(0, 3)],
  gameSettings: {
    timings: { powerUpTtl: 77 }
  }
};
assert.equal(api.loadStagePack(customPack), true);
const customLifecycle = JSON.parse(JSON.stringify(api.debugPowerUpAppearAudioLifecycleProbe()));
assert.equal(customLifecycle.start.powerUp.type, "star");
assert.equal(customLifecycle.start.powerUp.w, modules.powerUpState.POWER_UP_SIZE);
assert.equal(customLifecycle.start.powerUp.h, modules.powerUpState.POWER_UP_SIZE);
assert.equal(customLifecycle.start.powerUp.ttl, 77);
assert.equal(customLifecycle.end.powerUp.type, "star");

const direct = modules.powerUpState.createPowerUpState({
  type: "timer",
  position: { x: 18, y: 34 },
  ttl: 15
});
assert.deepEqual(JSON.parse(JSON.stringify(direct)), {
  type: "timer",
  x: 18,
  y: 34,
  w: 12,
  h: 12,
  ttl: 15
});

console.log("power-up-state integration test passed");
