const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;
const schema = JSON.parse(JSON.stringify(api.stagePackSchema()));

assert(modules.timingSettings, "timing settings module should register before game.js");
assert.deepEqual(schema.gameSettings.timings, {
  stageIntro: 95,
  stageClearDelay: 128,
  stageClear: 0,
  gameOverSlide: 127,
  gameOverHold: 129,
  playerRespawn: 24,
  playerSpawnFlash: 28,
  playerInvulnerability: 3,
  enemySpawnFlash: 28,
  enemyInitialReload: 0,
  enemySpawnRetry: 25,
  powerUpTtl: 0
});

const customTimings = {
  stageIntro: 7,
  stageClearDelay: 6,
  stageClear: 8,
  gameOverSlide: 9,
  gameOverHold: 10,
  playerRespawn: 11,
  playerSpawnFlash: 12,
  playerInvulnerability: 13,
  enemySpawnFlash: 14,
  enemyInitialReload: 15,
  enemySpawnRetry: 16,
  powerUpTtl: 17
};
const customPack = {
  id: "timing-settings-integration",
  totalStages: 1,
  maps: [schema.maps[0]],
  enemies: [schema.enemies[0].slice(0, 3)],
  gameSettings: { timings: customTimings }
};
assert.equal(api.validateStagePack(customPack).ok, true);
assert.equal(api.loadStagePack(customPack), true);
assert.deepEqual(JSON.parse(JSON.stringify(api.currentPackInfo().timings)), customTimings);

for (const [key, value] of [["stageIntro", -1], ["playerRespawn", 1.5], ["powerUpTtl", 3601]]) {
  const pack = {
    ...customPack,
    id: `bad-timing-${key}`,
    gameSettings: { timings: { [key]: value } }
  };
  assert.equal(api.validateStagePack(pack).ok, false);
}

console.log("timing-settings integration test passed");
