const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;
const schema = JSON.parse(JSON.stringify(api.stagePackSchema()));

assert(modules.combatSettings, "combat settings module should register before game.js");
assert.deepEqual(schema.gameSettings.projectileRules, {
  bulletSize: 4,
  spawnOffset: 9,
  boundsPadding: 4
});
assert.deepEqual(schema.gameSettings.friendlyFire, {
  enabled: true,
  stunFrames: 200
});
assert.deepEqual(JSON.parse(JSON.stringify(api.debugFriendlyFireProbe())), { enabled: true, stunFrames: 200 });

const customPack = {
  id: "combat-settings-integration",
  totalStages: 1,
  maps: [schema.maps[0]],
  enemies: [schema.enemies[0].slice(0, 3)],
  gameSettings: {
    projectileRules: { bulletSize: 6, spawnOffset: 11, boundsPadding: 2 },
    friendlyFire: { enabled: false, stunFrames: 12 }
  }
};
assert.equal(api.validateStagePack(customPack).ok, true);
assert.equal(api.loadStagePack(customPack), true);
const current = JSON.parse(JSON.stringify(api.currentPackInfo()));
assert.deepEqual(current.projectileRules, customPack.gameSettings.projectileRules);
assert.deepEqual(current.friendlyFire, customPack.gameSettings.friendlyFire);
assert.deepEqual(JSON.parse(JSON.stringify(api.debugFriendlyFireProbe())), { enabled: false, stunFrames: 0 });

const enabledPack = {
  ...customPack,
  id: "combat-settings-enabled-friendly-fire",
  gameSettings: {
    ...customPack.gameSettings,
    friendlyFire: { enabled: true, stunFrames: 12 }
  }
};
assert.equal(api.loadStagePack(enabledPack), true);
assert.deepEqual(JSON.parse(JSON.stringify(api.debugFriendlyFireProbe())), { enabled: true, stunFrames: 12 });

const invalidSettings = [
  { projectileRules: { bulletSize: 0 } },
  { projectileRules: { boundsPadding: 33 } },
  { friendlyFire: { enabled: "no" } },
  { friendlyFire: { stunFrames: -1 } }
];
for (const [index, gameSettings] of invalidSettings.entries()) {
  const pack = { ...customPack, id: `bad-combat-settings-${index}`, gameSettings };
  assert.equal(api.validateStagePack(pack).ok, false);
}

console.log("combat-settings integration test passed");
