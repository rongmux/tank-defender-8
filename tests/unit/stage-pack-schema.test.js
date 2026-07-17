const assert = require("assert").strict;
const crypto = require("crypto");
const stagePackSchema = require("../../src/stages/stage-pack-schema");

const {
  SAMPLE_ENEMY_SPAWN_DELAY,
  SAMPLE_STAGE_ROWS,
  STAGE_PACK_MAP_FORMAT,
  STAGE_PACK_TILE_CODES,
  createStagePackSchema
} = stagePackSchema;

const EXPECTED_SCHEMA_SHA256 = "0693562fbf05bbe95434d500d3ac0256c3776a1b88562e4c621d38eaef7913d3";

assert.equal(Object.isFrozen(stagePackSchema), true);
assert.equal(Object.isFrozen(SAMPLE_STAGE_ROWS), true);
assert.equal(Object.isFrozen(STAGE_PACK_TILE_CODES), true);
assert.equal(SAMPLE_ENEMY_SPAWN_DELAY, 96);
assert.equal(
  STAGE_PACK_MAP_FORMAT,
  "Use either maps for 13x13 full tiles or quadrants for 26x26 8px subtiles, not both."
);
assert.deepEqual(SAMPLE_STAGE_ROWS, [
  ".............",
  ".............",
  ".............",
  ".............",
  ".............",
  ".............",
  ".............",
  ".............",
  ".............",
  ".............",
  ".............",
  ".....BBB.....",
  ".....B.B....."
]);
assert.deepEqual(STAGE_PACK_TILE_CODES, {
  ".": "empty",
  B: "brick",
  "#": "brick",
  S: "steel",
  W: "water",
  "~": "water",
  F: "forest",
  I: "ice"
});

const schema = createStagePackSchema();
assert.deepEqual(Object.keys(schema), [
  "totalStages",
  "enemyTotal",
  "enemyTypes",
  "gameSettings",
  "playerUpgradeRules",
  "wallRules",
  "stageSettings",
  "maps",
  "quadrants",
  "mapFormat",
  "enemies",
  "tileCodes"
]);
assert.equal(schema.totalStages, 35);
assert.equal(schema.enemyTotal, 20);
assert.equal(schema.enemyTypes.length, 4);
assert.deepEqual(schema.enemyTypes.map((enemyType) => enemyType.name), ["basic", "fast", "power", "armor"]);
assert.deepEqual(schema.playerUpgradeRules, schema.gameSettings.playerUpgradeRules);
assert.notEqual(schema.playerUpgradeRules, schema.gameSettings.playerUpgradeRules);
assert.deepEqual(schema.wallRules, {
  brickSameSideHits: 4,
  poweredBrickSameSideHits: 2,
  brickFragmentSize: 4,
  normalBrickStripLength: 8,
  normalBrickStripDepth: 4,
  steelRequiredPower: 3,
  steelSameSideHits: 1,
  maxPowerBrickHalfDamage: true
});
assert.deepEqual(schema.stageSettings[0].playerSpawns, [{ x: 4, y: 12 }, { x: 8, y: 12 }]);
assert.deepEqual(schema.stageSettings[0].enemySpawns, [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 12, y: 0 }]);
assert.equal(schema.stageSettings[0].powerUpSpawns.length, 16);
assert.deepEqual(schema.maps, [Array.from(SAMPLE_STAGE_ROWS)]);
assert.equal(schema.quadrants.length, 1);
assert.equal(schema.quadrants[0].length, 26);
assert(schema.quadrants[0].every((row) => row === ".".repeat(26)));
assert.equal(schema.mapFormat, STAGE_PACK_MAP_FORMAT);
assert.equal(schema.enemies.length, 1);
assert.equal(schema.enemies[0].length, 20);
assert.equal(schema.enemies[0][0].spawnDelay, 0);
assert(schema.enemies[0].slice(1).every((enemy) => enemy.spawnDelay === SAMPLE_ENEMY_SPAWN_DELAY));
assert.deepEqual(
  schema.enemies[0].flatMap((enemy, index) => enemy.carrier ? [index] : []),
  [3, 10, 17]
);
assert.deepEqual(schema.tileCodes, STAGE_PACK_TILE_CODES);

const serialized = JSON.stringify(schema);
assert.equal(serialized.length, 6498);
assert.equal(crypto.createHash("sha256").update(serialized).digest("hex"), EXPECTED_SCHEMA_SHA256);

const second = createStagePackSchema();
assert.notEqual(second, schema);
for (const key of [
  "enemyTypes", "gameSettings", "playerUpgradeRules", "wallRules", "stageSettings",
  "maps", "quadrants", "enemies", "tileCodes"
]) {
  assert.notEqual(second[key], schema[key], key + " must be independently editable");
}
schema.enemyTypes[0].name = "changed";
schema.gameSettings.initialLives = 99;
schema.playerUpgradeRules[0].level = 99;
schema.wallRules.brickSameSideHits = 99;
schema.stageSettings[0].playerSpawns[0].x = 99;
schema.maps[0][0] = "changed";
schema.quadrants[0][0] = "changed";
schema.enemies[0][0].typeIndex = 3;
schema.tileCodes.B = "changed";
assert.equal(
  crypto.createHash("sha256").update(JSON.stringify(second)).digest("hex"),
  EXPECTED_SCHEMA_SHA256
);

console.log("stage-pack-schema unit test passed");
