const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;
const schema = JSON.parse(JSON.stringify(api.stagePackSchema()));

assert(modules.gameSessionSettings, "game session settings module should register before game.js");
assert.equal(schema.gameSettings.initialLives, 3);
assert.deepEqual(schema.gameSettings.bonusLifeScores, [20000]);
assert.equal(schema.gameSettings.deathPowerLevel, 0);
assert.equal(schema.gameSettings.timerFreezesEnemyTime, true);
assert.deepEqual(JSON.parse(JSON.stringify(api.debugTimerRuleProbe())), {
  frozen: true,
  canSpawn: true
});

const customPack = {
  id: "game-session-settings-integration",
  totalStages: 1,
  maps: [schema.maps[0]],
  enemies: [schema.enemies[0].slice(0, 3)],
  gameSettings: {
    initialLives: 5,
    bonusLifeScores: [300, 100],
    deathPowerLevel: 2,
    timerFreezesEnemyTime: false
  }
};
assert.equal(api.validateStagePack(customPack).ok, true);
assert.equal(api.loadStagePack(customPack), true);
const current = api.currentPackInfo();
assert.equal(current.initialLives, 5);
assert.deepEqual(JSON.parse(JSON.stringify(current.bonusLifeScores)), [100, 300]);
assert.equal(current.deathPowerLevel, 2);
assert.equal(current.timerFreezesEnemyTime, false);
current.bonusLifeScores[0] = 1;
assert.deepEqual(JSON.parse(JSON.stringify(api.currentPackInfo().bonusLifeScores)), [100, 300]);
const customTimer = JSON.parse(JSON.stringify(api.debugTimerRuleProbe()));
assert.equal(customTimer.frozen, false);
assert.equal(customTimer.canSpawn, true);
assert.equal(api.debugLifeAwardProbe().threshold, 100);

const invalidSettings = [
  { initialLives: 0 },
  { bonusLifeScores: "20000" },
  { bonusLifeScores: [0] },
  { deathPowerLevel: 4 },
  { timerFreezesEnemyTime: "yes" }
];
for (const [index, gameSettings] of invalidSettings.entries()) {
  const pack = { ...customPack, id: `bad-game-session-settings-${index}`, gameSettings };
  assert.equal(api.validateStagePack(pack).ok, false);
}

console.log("game-session-settings integration test passed");
