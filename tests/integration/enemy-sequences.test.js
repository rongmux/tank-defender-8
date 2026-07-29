const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.enemySequences, "enemy sequence module should register before game.js");
const probe = JSON.parse(JSON.stringify(api.debugOriginalEnemyGroupsProbe()));
const EXPECTED_STAGE_ENEMY_COUNTS = [
  [18,2,0,0], [14,4,0,2], [14,4,0,2], [2,5,10,3], [8,5,5,2],
  [9,2,7,2], [10,4,6,0], [7,4,7,2], [6,4,7,3], [12,2,4,2],
  [0,10,4,6], [0,6,8,6], [0,8,8,4], [0,4,10,6], [2,10,0,8],
  [16,2,0,2], [8,2,8,2], [2,8,6,4], [4,4,4,8], [2,8,2,8],
  [6,2,8,4], [6,8,2,4], [0,10,4,6], [10,4,4,2], [0,8,2,10],
  [4,6,4,6], [2,8,2,8], [15,2,2,1], [0,4,10,6], [4,8,4,4],
  [0,8,6,6], [6,4,2,8], [0,8,4,8], [0,10,4,6], [0,6,4,10]
];
assert.equal(probe.length, 35);
for (let stageIndex = 0; stageIndex < probe.length; stageIndex += 1) {
  assert.equal(probe[stageIndex].stage, stageIndex + 1);
  assert.equal(probe[stageIndex].total, 20);
  assert.deepEqual(probe[stageIndex].counts, EXPECTED_STAGE_ENEMY_COUNTS[stageIndex]);
  assert.deepEqual(probe[stageIndex].carriers, [4, 11, 18]);
}

assert.deepEqual(probe[0], {
  stage: 1,
  total: 20,
  groups: [
    { count: 18, typeIndex: 0, type: "basic" },
    { count: 2, typeIndex: 1, type: "fast" }
  ],
  counts: [18, 2, 0, 0],
  carriers: [4, 11, 18]
});
assert.deepEqual(probe[34], {
  stage: 35,
  total: 20,
  groups: [
    { count: 4, typeIndex: 2, type: "power" },
    { count: 6, typeIndex: 1, type: "fast" },
    { count: 10, typeIndex: 3, type: "armor" }
  ],
  counts: [0, 6, 4, 10],
  carriers: [4, 11, 18]
});

console.log("enemy-sequences integration test passed");
