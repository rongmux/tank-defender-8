const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context, source } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.stagePackSchema, "stage pack schema module should register before game.js");
assert.equal(Object.isFrozen(modules.stagePackSchema), true);

const direct = JSON.parse(JSON.stringify(modules.stagePackSchema.createStagePackSchema()));
const exposed = JSON.parse(JSON.stringify(api.stagePackSchema()));
assert.deepEqual(exposed, direct);

const secondExposed = api.stagePackSchema();
secondExposed.enemyTypes[0].name = "changed";
secondExposed.gameSettings.initialLives = 99;
secondExposed.maps[0][0] = "changed";
assert.deepEqual(JSON.parse(JSON.stringify(api.stagePackSchema())), direct);

assert.equal(api.loadStagePack({
  id: "schema-state-isolation",
  totalStages: 1,
  maps: [direct.maps[0]],
  enemies: [direct.enemies[0].slice(0, 1)],
  gameSettings: { initialLives: 7 }
}), true);
assert.equal(api.currentPackInfo().initialLives, 7);
assert.deepEqual(JSON.parse(JSON.stringify(api.stagePackSchema())), direct);

assert(source.includes('requireRuntimeModule("stagePackSchema")'));
assert(source.includes("return createStagePackSchema();"));
assert(!source.includes("mapFormat: \"Use either maps"));

console.log("stage-pack-schema integration test passed");
