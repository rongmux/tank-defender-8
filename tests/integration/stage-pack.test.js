const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;
const schema = JSON.parse(JSON.stringify(api.stagePackSchema()));

assert(modules.stagePack, "stage pack module should register before game.js");
assert.equal(Object.isFrozen(modules.stagePack), true);
assert.equal(typeof modules.stagePack.normalizeGameSettings, "function");
assert.equal(typeof modules.stagePack.normalizeStagePack, "function");
assert.equal(typeof modules.stagePack.tryNormalizeStagePack, "function");

const validPack = {
  id: "stage-pack-integration",
  totalStages: 2,
  maps: [schema.maps[0], schema.maps[0]],
  enemies: [schema.enemies[0].slice(0, 1), schema.enemies[0].slice(0, 3)],
  gameSettings: {
    initialLives: 4,
    powerUpRules: { pickupScore: 750 },
    stageAdvance: { loopAfterFinalStage: false }
  }
};
const directPack = modules.stagePack.normalizeStagePack(validPack);
assert.equal(directPack.enemyTotal, 3);
assert.deepEqual(Array.from(directPack.enemyTotals), [1, 3]);
assert.equal(directPack.gameSettings.initialLives, 4);
assert.equal(directPack.gameSettings.powerUpRules.pickupScore, 750);
assert.equal(directPack.gameSettings.stageAdvance.loopAfterFinalStage, false);
assert.equal(directPack.createGrid(1).length, 13);

assert.deepEqual(JSON.parse(JSON.stringify(api.validateStagePack(validPack))), { ok: true, error: "" });
assert.equal(api.loadStagePack(validPack), true);
const current = JSON.parse(JSON.stringify(api.currentPackInfo()));
assert.equal(current.id, "stage-pack-integration");
assert.equal(current.totalStages, 2);
assert.equal(current.enemyTotal, 1);
assert.equal(current.initialLives, 4);

const jsonResult = JSON.parse(JSON.stringify(api.loadStagePackJson(JSON.stringify(validPack))));
assert.deepEqual(jsonResult, { ok: true, error: "" });
assert.match(api.loadStagePackJson("{").error, /JSON/);

const invalidMapPack = {
  ...validPack,
  id: "invalid-map",
  maps: [["too short"], schema.maps[0]]
};
const invalidMapResult = JSON.parse(JSON.stringify(api.validateStagePack(invalidMapPack)));
assert.equal(invalidMapResult.ok, false);
assert.match(invalidMapResult.error, /maps\[0\] must contain 13 rows/);
assert.equal(api.loadStagePack(invalidMapPack), false);

const mixedPack = {
  ...validPack,
  id: "mixed-map-formats",
  quadrants: [schema.quadrants[0], schema.quadrants[0]]
};
const mixedResult = JSON.parse(JSON.stringify(api.validateStagePack(mixedPack)));
assert.equal(mixedResult.ok, false);
assert.match(mixedResult.error, /exactly one of maps or quadrants/);

const quadrantPack = {
  id: "quadrant-pack-integration",
  totalStages: 1,
  quadrants: [schema.quadrants[0]],
  enemies: [schema.enemies[0].slice(0, 2)]
};
assert.equal(api.validateStagePack(quadrantPack).ok, true);
assert.equal(api.loadStagePack(quadrantPack), true);
assert.equal(api.currentPackInfo().id, "quadrant-pack-integration");

console.log("stage-pack integration test passed");
