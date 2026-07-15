const assert = require("assert").strict;
const {
  DEFAULT_ENEMY_TYPES,
  ENEMY_BULLET_SPEED,
  ENEMY_FIRE_CHANCE,
  ENEMY_MOVE_SPEED,
  POWER_UP_TYPES,
  cloneEnemyTypes,
  normalizeEnemySequence,
  normalizeEnemyTypes
} = require("../../src/config/enemy-types");

assert.deepEqual(ENEMY_MOVE_SPEED, { normal: 0.5, fast: 1 });
assert.deepEqual(ENEMY_BULLET_SPEED, { normal: 2, fast: 4 });
assert.equal(ENEMY_FIRE_CHANCE, 1 / 32);
assert.deepEqual(POWER_UP_TYPES, ["grenade", "helmet", "shovel", "star", "timer", "tank"]);
assert.equal(DEFAULT_ENEMY_TYPES.length, 4);
assert.deepEqual(DEFAULT_ENEMY_TYPES.map((type) => type.name), ["basic", "fast", "power", "armor"]);
assert.deepEqual(DEFAULT_ENEMY_TYPES.map((type) => type.score), [100, 200, 300, 400]);
assert.deepEqual(DEFAULT_ENEMY_TYPES.map((type) => type.speed), [0.5, 1, 0.5, 0.5]);
assert.deepEqual(DEFAULT_ENEMY_TYPES.map((type) => type.bullet), [2, 2, 4, 2]);
assert(DEFAULT_ENEMY_TYPES.every((type) => type.wallPower === 1 && type.reload === 1 && type.fireChance === 1 / 32));
assert.deepEqual(DEFAULT_ENEMY_TYPES[3].hitColors, ["#b0b5c3", "#9aa2ad", "#79a95e", "#7fba72"]);
assert(Object.isFrozen(DEFAULT_ENEMY_TYPES));
assert(DEFAULT_ENEMY_TYPES.every(Object.isFrozen));
assert(Object.isFrozen(DEFAULT_ENEMY_TYPES[3].hitColors));

const clone = cloneEnemyTypes(DEFAULT_ENEMY_TYPES);
clone[3].hitColors[0] = "#000000";
clone[0].name = "changed";
assert.equal(DEFAULT_ENEMY_TYPES[3].hitColors[0], "#b0b5c3");
assert.equal(DEFAULT_ENEMY_TYPES[0].name, "basic");
assert.equal(clone[0].hitColors, null);

const defaults = normalizeEnemyTypes();
assert.deepEqual(defaults, cloneEnemyTypes(DEFAULT_ENEMY_TYPES));
defaults[3].hitColors[1] = "#000000";
assert.equal(normalizeEnemyTypes()[3].hitColors[1], "#9aa2ad");

const partial = cloneEnemyTypes(DEFAULT_ENEMY_TYPES);
partial[0] = { name: "scout", hp: "2", color: "#ABCDEF", hitColors: ["#111111", "#222222"] };
const normalized = normalizeEnemyTypes(partial);
assert.deepEqual(normalized[0], {
  name: "scout",
  hp: 2,
  speed: 0.5,
  bullet: 2,
  wallPower: 1,
  reload: 1,
  fireChance: 1 / 32,
  score: 100,
  color: "#ABCDEF",
  hitColors: ["#111111", "#222222"]
});

assert.throws(() => normalizeEnemyTypes([]), /enemyTypes must contain exactly 4 entries/);
assert.throws(() => normalizeEnemyTypes([null, {}, {}, {}]), /enemyTypes\[0\] must be an object/);
const invalidCases = [
  ["name", "", /name must be 1 to 24 characters/],
  ["hp", 0, /hp must be an integer from 1 to 9/],
  ["speed", 4, /speed must be a number from 0.1 to 3/],
  ["bullet", 7, /bullet must be a number from 0.1 to 6/],
  ["wallPower", 4, /wallPower must be an integer from 1 to 3/],
  ["reload", 0, /reload must be an integer from 1 to 600/],
  ["fireChance", 2, /fireChance must be a number from 0 to 1/],
  ["score", 10000, /score must be an integer from 0 to 9999/],
  ["color", "red", /color must be a #rrggbb color/],
  ["hitColors", [], /hitColors must contain 1 to 9 #rrggbb colors/],
  ["hitColors", ["red"], /hitColors\[0\] must be a #rrggbb color/]
];
for (const [key, value, message] of invalidCases) {
  const types = cloneEnemyTypes(DEFAULT_ENEMY_TYPES);
  types[0] = { ...types[0], [key]: value };
  assert.throws(() => normalizeEnemyTypes(types), message);
}

const sequence = normalizeEnemySequence([
  { typeIndex: "1", carrier: 1 },
  { typeIndex: 2, spawnIndex: "7", powerUpType: "star", spawnDelay: "0" },
  { typeIndex: 0, powerUpType: "", spawnDelay: "" }
], "enemies[0]", 4);
assert.deepEqual(sequence, [
  { typeIndex: 1, carrier: true, spawnIndex: 1, powerUpType: null, spawnDelay: null },
  { typeIndex: 2, carrier: false, spawnIndex: 7, powerUpType: "star", spawnDelay: 0 },
  { typeIndex: 0, carrier: false, spawnIndex: 0, powerUpType: null, spawnDelay: null }
]);
assert.throws(() => normalizeEnemySequence([], "enemies[0]", 4), /must contain at least one enemy/);
assert.throws(() => normalizeEnemySequence([null], "enemies[0]", 4), /enemy 1 must be an object/);
assert.throws(() => normalizeEnemySequence([{ typeIndex: 4 }], "enemies[0]", 4), /invalid typeIndex/);
assert.throws(() => normalizeEnemySequence([{ typeIndex: 0, spawnIndex: 8 }], "enemies[0]", 4), /invalid spawnIndex/);
assert.throws(() => normalizeEnemySequence([{ typeIndex: 0, powerUpType: "bad" }], "enemies[0]", 4), /invalid powerUpType/);
assert.throws(() => normalizeEnemySequence([{ typeIndex: 0, spawnDelay: -1 }], "enemies[0]", 4), /invalid spawnDelay/);

console.log("enemy-types unit test passed");
