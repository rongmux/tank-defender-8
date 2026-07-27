const assert = require("assert").strict;
const runtime = require("../../src/runtime/enemy-movement-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupEnemyMovementRuntime({}, {}, {}),
  /state\.game must be an object/
);

const events = [];
const aiRolls = [];
const randomBytes = [];
const state = {
  game: { enemies: [], frameLow: 0 },
  fn: {}
};
const settings = {
  enemyAi: {
    intersectionTurnChance: 0.25,
    blockedRetryChance: 0.5,
    blockedRetryTicks: 2
  }
};
const api = runtime.setupEnemyMovementRuntime(state, {
  DIR_X: [0, 1, 0, -1],
  DIR_Y: [-1, 0, 1, 0],
  entityRect(enemy, x, y) {
    return { x: x === undefined ? enemy.x : x, y: y === undefined ? enemy.y : y, w: enemy.w, h: enemy.h };
  },
  isEnemyMovementFrame(enemy) {
    return enemy.movementFrame !== false;
  }
}, {
  advanceTankTracks(enemy) {
    enemy.trackPhase = (enemy.trackPhase || 0) + 1;
    events.push(["tracks", enemy.id]);
  },
  aiRoll() {
    return aiRolls.shift() === true;
  },
  canTankOccupy(enemy, x) {
    return !enemy.blockedPositions || enemy.blockedPositions.indexOf(x) === -1;
  },
  chooseEnemyDirectionByPhase(enemy) {
    enemy.dir = 3;
    events.push(["choose", enemy.id]);
  },
  gameSettings() {
    return settings;
  },
  isEnemyAtTurnIntersection(enemy) {
    return Boolean(enemy.intersection);
  },
  moveTank(enemy, dx, dy) {
    events.push(["move", enemy.id, dx, dy]);
    if (!enemy.moveResult) return false;
    enemy.x += dx;
    enemy.y += dy;
    return true;
  },
  randomByte() {
    return randomBytes.shift() || 0;
  },
  totalTankOverlapArea(enemy, rect) {
    if (rect.x === enemy.x && rect.y === enemy.y) return enemy.overlapArea || 0;
    return enemy.candidateAreas && enemy.candidateAreas[`${rect.x},${rect.y}`] || 0;
  }
});

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), ["updateEnemyMovement", "recoverEnemyTankOverlap"]);
assert.equal(state.fn.updateEnemyMovement, api.updateEnemyMovement);
assert.equal(state.fn.recoverEnemyTankOverlap, api.recoverEnemyTankOverlap);

const cadenceEnemy = { id: 1, x: 16, y: 16, w: 14, h: 14, dir: 1, speed: 1, movementFrame: false };
assert.equal(api.updateEnemyMovement(cadenceEnemy), undefined);
assert.deepEqual(events, []);

const blockedEnemy = { id: 2, x: 16, y: 16, w: 14, h: 14, dir: 1, speed: 1, blockedPauseTicks: 2 };
api.updateEnemyMovement(blockedEnemy);
assert.equal(blockedEnemy.blockedPauseTicks, 1);
assert.deepEqual(events, []);

const pendingEnemy = { id: 3, x: 16, y: 16, w: 14, h: 14, dir: 1, speed: 1, pendingTurn: true };
randomBytes.push(0);
api.updateEnemyMovement(pendingEnemy);
assert.equal(pendingEnemy.pendingTurn, false);
assert.equal(pendingEnemy.dir, 3);
assert.deepEqual(events, [["choose", 3]]);

events.length = 0;
const movedEnemy = { id: 4, x: 16, y: 16, w: 14, h: 14, dir: 1, speed: 2, moveResult: true };
api.updateEnemyMovement(movedEnemy);
assert.equal(movedEnemy.x, 18);
assert.equal(movedEnemy.y, 16);
assert.deepEqual(events, [["move", 4, 2, 0], ["tracks", 4]]);

events.length = 0;
const retryEnemy = {
  id: 5,
  x: 16,
  y: 16,
  w: 14,
  h: 14,
  dir: 1,
  speed: 1,
  moveResult: false,
  intersection: true
};
aiRolls.push(false, true);
api.updateEnemyMovement(retryEnemy);
assert.equal(retryEnemy.blockedPauseTicks, 2);
assert.equal(retryEnemy.dir, 1);
assert.deepEqual(events, [["move", 5, 1, 0], ["tracks", 5]]);

events.length = 0;
const recoverEnemy = {
  id: 6,
  x: 16,
  y: 16,
  w: 14,
  h: 14,
  dir: 1,
  speed: 1,
  overlapArea: 10,
  candidateAreas: {
    "16,15": 8,
    "16,17": 4,
    "17,16": 7,
    "15,16": 6
  }
};
assert.equal(api.recoverEnemyTankOverlap(recoverEnemy), true);
assert.deepEqual({ x: recoverEnemy.x, y: recoverEnemy.y, dir: recoverEnemy.dir }, { x: 16, y: 17, dir: 2 });
assert.equal(recoverEnemy.blockedPauseTicks, 0);
assert.equal(recoverEnemy.pendingTurn, false);
assert.deepEqual(events, [["tracks", 6]]);

console.log("enemy-movement-runtime unit test passed");
