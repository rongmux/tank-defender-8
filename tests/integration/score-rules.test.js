const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;
const schema = JSON.parse(JSON.stringify(api.stagePackSchema()));

assert(modules.scoreRules, "score rules module should register before game.js");
assert.equal(Object.isFrozen(modules.scoreRules), true);

const defaults = JSON.parse(JSON.stringify(api.debugLifeAwardProbe()));
assert.equal(defaults.threshold, 20000);
assert.equal(defaults.beforeCrossing.lives, 1);
assert.deepEqual(defaults.afterCrossing, {
  score: 20000,
  lives: 2,
  nextBonusLifeIndex: 1
});
assert.equal(defaults.afterRepeat.lives, 2);
assert.equal(defaults.tank.score, defaults.pickupScore);
assert.equal(defaults.tank.lives, 2);

const customPack = {
  id: "score-rules-integration",
  totalStages: 1,
  maps: [schema.maps[0]],
  enemies: [schema.enemies[0].slice(0, 3)],
  gameSettings: {
    bonusLifeScores: [101, 100],
    powerUpRules: { pickupScore: 500 }
  }
};
assert.equal(api.validateStagePack(customPack).ok, true);
assert.equal(api.loadStagePack(customPack), true);

const consecutive = JSON.parse(JSON.stringify(api.debugLifeAwardProbe()));
assert.equal(consecutive.threshold, 100);
assert.deepEqual(consecutive.beforeCrossing, {
  score: 99,
  lives: 1,
  nextBonusLifeIndex: 0
});
assert.deepEqual(consecutive.afterCrossing, {
  score: 100,
  lives: 2,
  nextBonusLifeIndex: 1
});
assert.deepEqual(consecutive.afterRepeat, {
  score: 101,
  lives: 3,
  nextBonusLifeIndex: 2
});
assert.equal(consecutive.tank.score, 500);
assert.equal(consecutive.tank.lives, 4);

console.log("score-rules integration test passed");
