const assert = require("assert").strict;
const runtime = require("../../src/runtime/battle-random-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupBattleRandomRuntime({}, {}, {}),
  /state\.game must be an object/
);

const randomCalls = [];
const state = {
  game: {
    enemySpawned: 2,
    enemies: [
      { alive: true, carrier: true, dir: 2, id: 7, kind: "enemy", slotIndex: 4, typeIndex: 1, x: 5, y: 6 }
    ],
    frameHigh: 2,
    frameLow: 9,
    nextSpawn: 17,
    playerCount: 1,
    players: [
      { dir: 3, id: 1, kind: "player", level: 2, x: 33, y: 44 },
      { dir: 0, id: 2, kind: "player", level: 0, x: 55, y: 66 }
    ],
    randomIndex: 0,
    randomValue: 5,
    stage: 1
  },
  fn: {
    defaultEnemySpawnDelay() {
      return 10;
    },
    scaleEnemySpawnDelayForPlayers(delay, playerCount) {
      return delay * playerCount;
    }
  }
};
const api = runtime.setupBattleRandomRuntime(state, {
  advanceBattleRandom(value, index, frameHigh, zeroPageByte) {
    randomCalls.push({ value, index, frameHigh, zeroPageByte });
    return { index: (index + 1) & 0xff, value: 99 };
  },
  sharedState: { FIELD_X: 16, FIELD_Y: 16 }
}, {
  enemyTotal() {
    return 5;
  },
  getEnemySpec(stage, index) {
    assert.equal(stage, 1);
    return index === 1 ? { spawnIndex: 2 } : {};
  }
});

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), [
  "randomByte",
  "nextBattleRandomByte",
  "resetBattleRandom",
  "battleRandomZeroPageByte",
  "currentEnemySpawnPositionIndex",
  "tankForOriginalSlot",
  "tankRandomMemoryByte",
  "tankRandomTypeByte"
]);
assert.equal(state.fn.randomByte, api.randomByte);
assert.equal(api.randomByte(() => 0.5), 128);
assert.equal(api.battleRandomZeroPageByte(0x0a), 2);
assert.equal(api.battleRandomZeroPageByte(0x0b), 9);
assert.equal(api.battleRandomZeroPageByte(0x0f, 77), 77);
assert.equal(api.battleRandomZeroPageByte(0x10), 16);
assert.equal(api.battleRandomZeroPageByte(0x6a), 2);
assert.equal(api.battleRandomZeroPageByte(0x7f), 3);
assert.equal(api.battleRandomZeroPageByte(0x82), 17);
assert.equal(api.battleRandomZeroPageByte(0x84), 10);
assert.equal(api.battleRandomZeroPageByte(0x90), 49);
assert.equal(api.battleRandomZeroPageByte(0x98), 60);
assert.equal(api.battleRandomZeroPageByte(0xa8), 35);
assert.equal(api.battleRandomZeroPageByte(0xac), 166);
assert.equal(api.battleRandomZeroPageByte(0xff), 0);

assert.equal(api.tankForOriginalSlot(0), state.game.players[0]);
assert.equal(api.tankForOriginalSlot(4), state.game.enemies[0]);
assert.equal(api.tankForOriginalSlot(6), null);
assert.equal(api.currentEnemySpawnPositionIndex(), 2);
state.game.enemySpawned = 4;
assert.equal(api.currentEnemySpawnPositionIndex(), 1);
state.game.enemySpawned = 2;

assert.equal(api.nextBattleRandomByte(), 99);
assert.deepEqual(randomCalls, [{ value: 5, index: 0, frameHigh: 2, zeroPageByte: 0 }]);
assert.equal(state.game.randomIndex, 1);
assert.equal(state.game.randomValue, 99);
api.resetBattleRandom();
assert.equal(state.game.randomIndex, 0);
assert.equal(state.game.randomValue, 0);

console.log("battle-random-runtime unit test passed");
