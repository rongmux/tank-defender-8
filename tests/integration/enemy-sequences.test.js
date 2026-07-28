const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.enemySequences, "enemy sequence module should register before game.js");
const probe = JSON.parse(JSON.stringify(api.debugOriginalEnemyGroupsProbe()));
assert.equal(probe.length, 35);
for (let stageIndex = 0; stageIndex < probe.length; stageIndex += 1) {
  assert.equal(probe[stageIndex].stage, stageIndex + 1);
  assert.equal(probe[stageIndex].total, 20);
  assert.deepEqual(probe[stageIndex].carriers, [4, 11, 18]);
}

assert.deepEqual(probe[0], {
  stage: 1,
  total: 20,
  groups: [
    { count: 10, typeIndex: 0, type: "basic" },
    { count: 1, typeIndex: 1, type: "fast" },
    { count: 6, typeIndex: 0, type: "basic" },
    { count: 1, typeIndex: 1, type: "fast" },
    { count: 2, typeIndex: 0, type: "basic" }
  ],
  counts: [18, 2, 0, 0],
  carriers: [4, 11, 18]
});
assert.deepEqual(probe[34], {
  stage: 35,
  total: 20,
  groups: [
    { count: 2, typeIndex: 3, type: "armor" },
    { count: 2, typeIndex: 1, type: "fast" },
    { count: 1, typeIndex: 3, type: "armor" },
    { count: 1, typeIndex: 2, type: "power" },
    { count: 1, typeIndex: 3, type: "armor" },
    { count: 1, typeIndex: 1, type: "fast" },
    { count: 1, typeIndex: 3, type: "armor" },
    { count: 1, typeIndex: 2, type: "power" },
    { count: 1, typeIndex: 1, type: "fast" },
    { count: 2, typeIndex: 3, type: "armor" },
    { count: 1, typeIndex: 2, type: "power" },
    { count: 1, typeIndex: 3, type: "armor" },
    { count: 1, typeIndex: 1, type: "fast" },
    { count: 1, typeIndex: 3, type: "armor" },
    { count: 1, typeIndex: 2, type: "power" },
    { count: 1, typeIndex: 1, type: "fast" },
    { count: 1, typeIndex: 3, type: "armor" }
  ],
  counts: [0, 6, 4, 10],
  carriers: [4, 11, 18]
});

console.log("enemy-sequences integration test passed");
