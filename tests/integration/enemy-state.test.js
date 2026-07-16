const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;
const schema = JSON.parse(JSON.stringify(api.stagePackSchema()));

assert(modules.enemyState, "enemy state module should register before game.js");
assert.equal(Object.isFrozen(modules.enemyState), true);

const enemyTypes = schema.enemyTypes.map((enemyType, index) => index === 0
  ? {
    ...enemyType,
    speed: 0.5,
    hp: 2,
    bullet: 4,
    wallPower: 2,
    reload: 13,
    fireChance: 0.25,
    score: 150,
    color: "#abcdef",
    hitColors: ["#111111", "#222222"]
  }
  : enemyType
);
const customPack = {
  id: "enemy-state-integration",
  totalStages: 1,
  enemyTypes,
  maps: [schema.maps[0]],
  enemies: [[{
    typeIndex: 0,
    carrier: true,
    spawnIndex: 2,
    powerUpType: "star",
    spawnDelay: 0
  }]],
  gameSettings: {
    timings: { enemyInitialReload: 12, enemySpawnFlash: 11 }
  }
};
assert.equal(api.loadStagePack(customPack), true);

const timeline = JSON.parse(JSON.stringify(api.debugEnemySpawnTimelineProbe(1, 1)));
assert.deepEqual(timeline.frames, [1]);
assert.deepEqual(timeline.slots, [5]);
assert.deepEqual(timeline.spawnIndices, [2]);
assert.equal(timeline.states.length, 1);
const enemy = timeline.states[0];
assert.equal(enemy.kind, "enemy");
assert.equal(enemy.id, 100);
assert.equal(enemy.slotIndex, 5);
assert.equal(enemy.x, 12 * 16 + 1);
assert.equal(enemy.y, 1);
assert.equal(enemy.w, 14);
assert.equal(enemy.h, 14);
assert.equal(enemy.dir, modules.directions.DOWN);
assert.equal(enemy.speed, 0.5);
assert.equal(enemy.hp, 2);
assert.equal(enemy.maxHp, 2);
assert.equal(enemy.bulletSpeed, 4);
assert.equal(enemy.bulletPower, 2);
assert.equal(enemy.reloadBase, 13);
assert.equal(enemy.reload, 12);
assert.equal(enemy.score, 150);
assert.equal(enemy.color, "#abcdef");
assert.deepEqual(enemy.hitColors, ["#111111", "#222222"]);
assert.equal(enemy.typeIndex, 0);
assert.equal(enemy.carrier, true);
assert.equal(enemy.powerUpType, "star");
assert.equal(enemy.fireChance, 0.25);
assert.equal(enemy.alternateMovement, true);
assert.equal(enemy.spawnFlash, 11);
assert.equal(enemy.alive, true);
assert.equal(enemy.destroying, false);
assert.equal(enemy.trackPhase, 0);

console.log("enemy-state integration test passed");
