const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;
const schema = JSON.parse(JSON.stringify(api.stagePackSchema()));

assert(modules.powerUpSettings, "power-up settings module should register before game.js");
assert.deepEqual(schema.gameSettings.powerUpDurations, {
  helmet: 10,
  shovel: 20,
  shovelFlash: 4,
  timer: 10
});
assert.deepEqual(schema.gameSettings.powerUpRules, {
  carrierRelease: "hit",
  clearUncollectedOnCarrierSpawn: true,
  pickupScore: 500
});
const defaultHelmet = JSON.parse(JSON.stringify(api.debugHelmetProtectionProbe()));
assert.equal(defaultHelmet.duration, 10);
assert.equal(defaultHelmet.protected.invuln, 10);
assert.equal(defaultHelmet.protected.score, 500);
assert.equal(defaultHelmet.protected.alive, true);
assert.equal(defaultHelmet.unprotected.alive, false);

const customPack = {
  id: "power-up-settings-integration",
  totalStages: 1,
  maps: [schema.maps[0]],
  enemies: [schema.enemies[0].slice(0, 3)],
  gameSettings: {
    powerUpDurations: { helmet: 30, shovel: 40, shovelFlash: 16, timer: 50 },
    powerUpRules: { carrierRelease: "hit", clearUncollectedOnCarrierSpawn: false, pickupScore: 750 }
  }
};
assert.equal(api.validateStagePack(customPack).ok, true);
assert.equal(api.loadStagePack(customPack), true);
const current = JSON.parse(JSON.stringify(api.currentPackInfo()));
assert.deepEqual(current.powerUpDurations, customPack.gameSettings.powerUpDurations);
assert.deepEqual(current.powerUpRules, customPack.gameSettings.powerUpRules);
const customHelmet = JSON.parse(JSON.stringify(api.debugHelmetProtectionProbe()));
assert.equal(customHelmet.duration, 30);
assert.equal(customHelmet.protected.invuln, 30);
assert.equal(customHelmet.protected.score, 750);
const hitCarrier = JSON.parse(JSON.stringify(api.debugCarrierReleaseProbe(4)));
assert.equal(hitCarrier.releaseOnThisHit, true);
assert.equal(hitCarrier.clearUncollectedOnCarrierSpawn, false);
assert.equal(hitCarrier.pickupScore, 750);
const preservedPowerUp = JSON.parse(JSON.stringify(api.debugCarrierSpawnClearsPowerUpProbe(true)));
assert.equal(preservedPowerUp.cleared, false);
assert.equal(preservedPowerUp.hasPowerUp, true);

const destroyedCarrierPack = {
  ...customPack,
  id: "power-up-settings-destroyed-carrier",
  gameSettings: {
    ...customPack.gameSettings,
    powerUpRules: { ...customPack.gameSettings.powerUpRules, carrierRelease: "destroyed" }
  }
};
assert.equal(api.loadStagePack(destroyedCarrierPack), true);
assert.equal(api.debugCarrierReleaseProbe(4).releaseOnThisHit, false);
assert.equal(api.debugCarrierReleaseProbe(1).releaseOnThisHit, true);

const invalidPacks = [
  { ...customPack, id: "bad-power-up-duration", gameSettings: { powerUpDurations: { helmet: 0 } } },
  { ...customPack, id: "bad-power-up-release", gameSettings: { powerUpRules: { carrierRelease: "first" } } },
  { ...customPack, id: "bad-power-up-clearing", gameSettings: { powerUpRules: { clearUncollectedOnCarrierSpawn: "no" } } },
  { ...customPack, id: "bad-power-up-score", gameSettings: { powerUpRules: { pickupScore: -1 } } }
];
for (const pack of invalidPacks) assert.equal(api.validateStagePack(pack).ok, false);

console.log("power-up-settings integration test passed");
