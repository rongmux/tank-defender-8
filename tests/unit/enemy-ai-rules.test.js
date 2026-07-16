const assert = require("assert").strict;
const { DOWN, LEFT, RIGHT, UP } = require("../../src/core/directions");
const enemyAiRules = require("../../src/rules/enemy-ai-rules");

const {
  ENEMY_TURN_INTERSECTION_SIZE,
  directionTowardTarget,
  enemyAiChanceMatches,
  enemyAiPhaseForInterval,
  isEnemyAtTurnIntersection,
  isEnemyMovementFrame,
  selectEnemyTargetPlayer,
  shouldEnemyFireForByte,
  targetableEnemyPlayers
} = enemyAiRules;

assert.equal(Object.isFrozen(enemyAiRules), true);
assert.equal(ENEMY_TURN_INTERSECTION_SIZE, 8);

assert.equal(enemyAiPhaseForInterval(186, 23), "random");
assert.equal(enemyAiPhaseForInterval(186, 24), "player");
assert.equal(enemyAiPhaseForInterval(186, 46), "player");
assert.equal(enemyAiPhaseForInterval(186, 47), "hq");
assert.equal(enemyAiPhaseForInterval(50, 6), "random");
assert.equal(enemyAiPhaseForInterval(50, 7), "player");
assert.equal(enemyAiPhaseForInterval(50, 13), "hq");

const normalEnemy = { slotIndex: 5, alternateMovement: true };
assert.deepEqual([0, 1, 2, 3].map((frame) => isEnemyMovementFrame(normalEnemy, frame)), [true, false, true, false]);
assert.equal(isEnemyMovementFrame({ slotIndex: 5, alternateMovement: false }, 1), true);
assert.equal(isEnemyMovementFrame({ alternateMovement: true }, 0), false);

assert.equal(isEnemyAtTurnIntersection({ x: 73, y: 73, w: 14, h: 14 }), true);
assert.equal(isEnemyAtTurnIntersection({ x: 72, y: 73, w: 14, h: 14 }), false);

const players = [
  { id: 1, alive: true },
  { id: 2, alive: true, spawnFlash: 12 },
  { id: 3, alive: false, respawn: 10 }
];
assert.deepEqual(targetableEnemyPlayers(players), players.slice(0, 2));
assert.equal(selectEnemyTargetPlayer({ slotIndex: 7 }, players).id, 2);
assert.equal(selectEnemyTargetPlayer({ slotIndex: 6 }, players).id, 1);
assert.equal(selectEnemyTargetPlayer({ slotIndex: 7 }, [players[0], { ...players[1], alive: false }]).id, 1);
assert.equal(selectEnemyTargetPlayer({ slotIndex: 7 }, [{ id: 4, alive: true }]).id, 4);
assert.equal(selectEnemyTargetPlayer({ slotIndex: 7 }, []), null);

const tank = { x: 73, y: 73, w: 14, h: 14 };
assert.equal(directionTowardTarget(tank, { x: 64, y: 64 }, false), UP);
assert.equal(directionTowardTarget(tank, { x: 64, y: 64 }, true), LEFT);
assert.equal(directionTowardTarget(tank, { x: 96, y: 96 }, false), DOWN);
assert.equal(directionTowardTarget(tank, { x: 96, y: 96 }, true), RIGHT);
assert.equal(directionTowardTarget(tank, { x: 80, y: 80 }, true), UP);

assert.equal(enemyAiChanceMatches(1 / 16, 0x00), true);
assert.equal(enemyAiChanceMatches(1 / 16, 0x10), true);
assert.equal(enemyAiChanceMatches(1 / 16, 0x01), false);
assert.equal(enemyAiChanceMatches(3 / 4, 0x00), false);
assert.equal(enemyAiChanceMatches(3 / 4, 0x01), true);
assert.equal(enemyAiChanceMatches(1 / 2, 0x02), false);
assert.equal(enemyAiChanceMatches(1 / 2, 0x03), true);
assert.equal(enemyAiChanceMatches(1 / 4, 63), true);
assert.equal(enemyAiChanceMatches(1 / 4, 64), false);

assert.equal(shouldEnemyFireForByte(1 / 32, 1 / 32, 0), true);
assert.equal(shouldEnemyFireForByte(1 / 32, 1 / 32, 32), true);
assert.equal(shouldEnemyFireForByte(1 / 32, 1 / 32, 1), false);
assert.equal(shouldEnemyFireForByte(1 / 4, 1 / 32, 63), true);
assert.equal(shouldEnemyFireForByte(1 / 4, 1 / 32, 64), false);

console.log("enemy-ai-rules unit test passed");
