const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;
const schema = JSON.parse(JSON.stringify(api.stagePackSchema()));

function makePack(overrides = {}) {
  return {
    id: "enemy-types-integration",
    totalStages: 1,
    maps: [schema.maps[0]],
    enemies: [schema.enemies[0].slice(0, 3)],
    ...overrides
  };
}

assert(modules.valueNormalization, "value normalization module should register before game.js");
assert(modules.enemyTypes, "enemy type module should register before game.js");
assert.equal(schema.enemyTypes.length, 4);
assert.deepEqual(schema.enemyTypes.map((enemy) => enemy.name), ["basic", "fast", "power", "armor"]);
assert.deepEqual(schema.enemyTypes.map((enemy) => enemy.speed), [0.5, 1, 0.5, 0.5]);
assert.deepEqual(schema.enemyTypes.map((enemy) => enemy.bullet), [2, 2, 4, 2]);
assert.deepEqual(schema.enemyTypes.map((enemy) => enemy.score), [100, 200, 300, 400]);
assert(schema.enemyTypes.every((enemy) => enemy.fireChance === 1 / 32));
assert(schema.enemyTypes.every((enemy) => enemy.wallPower === 1 && enemy.reload === 1));
assert.deepEqual(schema.enemyTypes[3].hitColors, ["#b0b5c3", "#9aa2ad", "#79a95e", "#7fba72"]);

const customTypes = schema.enemyTypes.map((enemyType, index) => index === 0 ? {
  ...enemyType,
  name: "custom-basic",
  hp: 2,
  wallPower: 2,
  fireChance: 0.25,
  score: 150,
  color: "#ffffff",
  hitColors: ["#111111", "#ffffff"]
} : enemyType);
const customPack = makePack({
  enemyTypes: customTypes,
  enemies: [[
    { typeIndex: 3, carrier: true, spawnIndex: 2, powerUpType: "tank", spawnDelay: 12 },
    { typeIndex: 2, carrier: false, spawnIndex: 1, powerUpType: null, spawnDelay: 24 },
    { typeIndex: 1, carrier: false, spawnIndex: 0, powerUpType: null, spawnDelay: null }
  ]]
});
assert.equal(api.validateStagePack(customPack).ok, true);
assert.equal(api.loadStagePack(customPack), true);
const current = JSON.parse(JSON.stringify(api.currentPackInfo()));
assert.deepEqual(current.enemyTypes[0], customTypes[0]);
assert.deepEqual(current.enemySequence, customPack.enemies[0]);
assert.equal(current.enemyTotal, 3);

const invalidPacks = [
  makePack({ enemies: [[{ typeIndex: 0, powerUpType: "bad" }]] }),
  makePack({ enemies: [[{ typeIndex: 0, spawnDelay: -1 }]] }),
  makePack({ enemyTypes: schema.enemyTypes.slice(0, 3) }),
  makePack({ enemyTypes: schema.enemyTypes.map((type, index) => index === 0 ? { ...type, wallPower: 4 } : type) }),
  makePack({ enemyTypes: schema.enemyTypes.map((type, index) => index === 3 ? { ...type, hitColors: ["red"] } : type) })
];
for (const pack of invalidPacks) assert.equal(api.validateStagePack(pack).ok, false);

console.log("enemy-types integration test passed");
