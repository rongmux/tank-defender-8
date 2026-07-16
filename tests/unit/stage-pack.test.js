const assert = require("assert").strict;
const {
  normalizeGameSettings,
  normalizeStagePack,
  tryNormalizeStagePack
} = require("../../src/stages/stage-pack");
const { BRICK, EMPTY } = require("../../src/stages/stage-grid").TILE_TYPES;

function makeRows(size, firstTile = ".") {
  const rows = Array.from({ length: size }, () => ".".repeat(size));
  rows[0] = firstTile + ".".repeat(size - 1);
  return rows;
}

function makeMapPack(overrides = {}) {
  return {
    id: "unit-pack",
    totalStages: 2,
    maps: [makeRows(13), makeRows(13, "B")],
    enemies: [
      [{ typeIndex: 0 }],
      [{ typeIndex: 1, carrier: true }, { typeIndex: 2, spawnIndex: 0 }]
    ],
    ...overrides
  };
}

const defaultSettings = normalizeGameSettings();
assert.equal(defaultSettings.initialLives, 3);
assert.deepEqual(defaultSettings.bonusLifeScores, [20000]);
assert.equal(defaultSettings.timerFreezesEnemyTime, true);
assert.deepEqual(Object.keys(defaultSettings), [
  "initialLives",
  "bonusLifeScores",
  "deathPowerLevel",
  "powerUpDurations",
  "powerUpRules",
  "timings",
  "enemySpawnPacing",
  "playerMovement",
  "projectileRules",
  "friendlyFire",
  "explosionRules",
  "stageAdvance",
  "stageClearBonus",
  "enemyAi",
  "playerUpgradeRules",
  "timerFreezesEnemyTime"
]);

const customSettings = normalizeGameSettings({
  initialLives: 5,
  bonusLifeScores: [500, 100],
  timerFreezesEnemyTime: false,
  powerUpRules: { pickupScore: 750 },
  playerMovement: { speed: 2, frameCadence: [true, false] },
  stageAdvance: { loopAfterFinalStage: false }
});
assert.equal(customSettings.initialLives, 5);
assert.deepEqual(customSettings.bonusLifeScores, [100, 500]);
assert.equal(customSettings.timerFreezesEnemyTime, false);
assert.equal(customSettings.powerUpRules.pickupScore, 750);
assert.deepEqual(customSettings.playerMovement.frameCadence, [true, false]);
assert.equal(customSettings.stageAdvance.loopAfterFinalStage, false);

const normalizedMapPack = normalizeStagePack(makeMapPack());
assert.equal(normalizedMapPack.id, "unit-pack");
assert.equal(normalizedMapPack.totalStages, 2);
assert.equal(normalizedMapPack.enemyTotal, 2);
assert.deepEqual(normalizedMapPack.enemyTotals, [1, 2]);
assert.equal(normalizedMapPack.maps.length, 2);
assert.equal(normalizedMapPack.quadrants, null);
assert.equal(normalizedMapPack.createGrid(1)[0][0].type, EMPTY);
assert.equal(normalizedMapPack.createGrid(2)[0][0].type, BRICK);
assert.deepEqual(normalizedMapPack.enemyAt(2, 1), {
  typeIndex: 2,
  carrier: false,
  spawnIndex: 0,
  powerUpType: null,
  spawnDelay: null
});
assert.equal(normalizedMapPack.stageSettings.length, 2);

const normalizedExplicitTotal = normalizeStagePack(makeMapPack({ enemyTotal: 7 }));
assert.equal(normalizedExplicitTotal.enemyTotal, 7);
assert.deepEqual(normalizedExplicitTotal.enemyTotals, [1, 2]);

const normalizedQuadrantPack = normalizeStagePack({
  totalStages: 1,
  quadrants: [makeRows(26, "B")],
  enemies: [[{ typeIndex: 0 }]]
});
assert.equal(normalizedQuadrantPack.id, "stage-pack");
assert.equal(normalizedQuadrantPack.maps, null);
assert.equal(normalizedQuadrantPack.createGrid(1)[0][0].type, BRICK);
assert.equal(normalizedQuadrantPack.createGrid(1)[0][0].mask, 1);

const validResult = tryNormalizeStagePack(makeMapPack());
assert.equal(validResult.ok, true);
assert.equal(validResult.error, "");
assert.equal(validResult.pack.id, "unit-pack");

const invalidCases = [
  [null, /stage pack must be an object/],
  [makeMapPack({ totalStages: 0 }), /totalStages must be a positive integer/],
  [makeMapPack({ enemyTotal: 0 }), /enemyTotal must be a positive integer/],
  [makeMapPack({ maps: undefined }), /exactly one of maps or quadrants/],
  [makeMapPack({ quadrants: [makeRows(26), makeRows(26)] }), /exactly one of maps or quadrants/],
  [makeMapPack({ maps: [makeRows(13)] }), /maps must contain exactly 2 stages/],
  [makeMapPack({ totalStages: 1, quadrants: [makeRows(26), makeRows(26)], maps: undefined }), /quadrants must contain exactly 1 stages/],
  [makeMapPack({ enemies: [[{ typeIndex: 0 }]] }), /enemies must contain exactly 2 stages/],
  [makeMapPack({ maps: [["too short"], makeRows(13)] }), /maps\[0\] must contain 13 rows/]
];
for (const [pack, expectedError] of invalidCases) {
  assert.throws(() => normalizeStagePack(pack), expectedError);
}

const invalidResult = tryNormalizeStagePack(makeMapPack({ maps: undefined }));
assert.equal(invalidResult.ok, false);
assert.equal(invalidResult.pack, null);
assert.match(invalidResult.error, /exactly one of maps or quadrants/);

console.log("stage-pack unit test passed");
