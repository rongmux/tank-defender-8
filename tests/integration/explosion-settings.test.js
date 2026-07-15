const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;
const schema = JSON.parse(JSON.stringify(api.stagePackSchema()));

assert(modules.explosionSettings, "explosion settings module should register before game.js");
assert.deepEqual(Object.keys(schema.gameSettings.explosionRules), [
  "bulletCancel",
  "baseDestroy",
  "brickHit",
  "steelHit",
  "steelBlocked",
  "enemyHit",
  "enemyDestroy",
  "playerStun",
  "playerDestroy"
]);
assert.deepEqual(schema.gameSettings.explosionRules.enemyDestroy, {
  ttl: 18,
  color: "#f0b546",
  coreColor: "#f7f1c6"
});
assert.deepEqual(schema.gameSettings.explosionRules.baseDestroy, {
  ttl: 35,
  color: "#f05a42",
  coreColor: "#f7f1c6"
});
assert.deepEqual(JSON.parse(JSON.stringify(api.debugExplosionRuleProbe("enemyDestroy"))), {
  key: "enemyDestroy",
  ttl: 18,
  color: "#f0b546",
  coreColor: "#f7f1c6"
});

const customPack = {
  id: "explosion-settings-integration",
  totalStages: 1,
  maps: [schema.maps[0]],
  enemies: [schema.enemies[0].slice(0, 3)],
  gameSettings: {
    explosionRules: {
      enemyDestroy: { ttl: 22, color: "#123456", coreColor: "#abcdef" },
      bulletCancel: { ttl: 15, color: "#654321", coreColor: "#fedcba" }
    }
  }
};
assert.equal(api.validateStagePack(customPack).ok, true);
assert.equal(api.loadStagePack(customPack), true);
const current = api.currentPackInfo().explosionRules;
assert.deepEqual(JSON.parse(JSON.stringify(current.enemyDestroy)), customPack.gameSettings.explosionRules.enemyDestroy);
assert.deepEqual(JSON.parse(JSON.stringify(current.bulletCancel)), customPack.gameSettings.explosionRules.bulletCancel);
current.enemyDestroy.ttl = 99;
assert.equal(api.currentPackInfo().explosionRules.enemyDestroy.ttl, 22);
assert.deepEqual(JSON.parse(JSON.stringify(api.debugExplosionRuleProbe("enemyDestroy"))), {
  key: "enemyDestroy",
  ttl: 22,
  color: "#123456",
  coreColor: "#abcdef"
});

const invalidRules = [
  { enemyDestroy: { ttl: 0 } },
  { enemyDestroy: { color: "orange" } },
  { enemyDestroy: { coreColor: "#abc" } },
  { enemyDestroy: [] }
];
for (const [index, explosionRules] of invalidRules.entries()) {
  const pack = {
    ...customPack,
    id: `bad-explosion-settings-${index}`,
    gameSettings: { explosionRules }
  };
  assert.equal(api.validateStagePack(pack).ok, false);
}

console.log("explosion-settings integration test passed");
