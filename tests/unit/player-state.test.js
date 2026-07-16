const assert = require("assert").strict;
const {
  PLAYER_PALETTES,
  PLAYER_SIZE,
  createPlayerState,
  resetPlayerState
} = require("../../src/entities/player-state");

function makeSettings(overrides = {}) {
  return {
    initialLives: 3,
    playerMovement: { speed: 1 },
    timings: { playerSpawnFlash: 28, playerInvulnerability: 600 },
    ...overrides
  };
}

assert.equal(PLAYER_SIZE, 14);
assert.equal(Object.isFrozen(PLAYER_PALETTES), true);
assert.equal(Object.isFrozen(PLAYER_PALETTES[1]), true);

const playerOne = createPlayerState({
  id: 1,
  spawn: { x: 65, y: 193 },
  settings: makeSettings(),
  enemyTypeCount: 4,
  direction: 0
});
assert.deepEqual(playerOne, {
  kind: "player",
  id: 1,
  x: 65,
  y: 193,
  spawnX: 65,
  spawnY: 193,
  w: 14,
  h: 14,
  dir: 0,
  speed: 1,
  alive: true,
  lives: 3,
  nextBonusLifeIndex: 0,
  respawn: 0,
  destroying: false,
  destroyTotalTicks: 0,
  destroyExplosionTicks: 0,
  spawnFlash: 28,
  invuln: 0,
  stun: 0,
  pendingSnap: false,
  level: 0,
  reload: 0,
  score: 0,
  stagePoints: 0,
  stageKills: [0, 0, 0, 0],
  totalKills: [0, 0, 0, 0],
  slide: 0,
  trackPhase: 0,
  color: "#e3c64e",
  accent: "#fff0a8"
});
assert.notEqual(playerOne.stageKills, playerOne.totalKills);

const playerTwo = createPlayerState({
  id: 2,
  spawn: { x: 129, y: 193 },
  settings: makeSettings({
    initialLives: 5,
    playerMovement: { speed: 1.5 },
    timings: { playerSpawnFlash: 0, playerInvulnerability: 90 }
  }),
  enemyTypeCount: 2,
  direction: 3
});
assert.equal(playerTwo.id, 2);
assert.equal(playerTwo.speed, 1.5);
assert.equal(playerTwo.lives, 5);
assert.equal(playerTwo.dir, 3);
assert.equal(playerTwo.spawnFlash, 0);
assert.equal(playerTwo.invuln, 90);
assert.deepEqual(playerTwo.stageKills, [0, 0]);
assert.equal(playerTwo.color, "#55b96a");
assert.equal(playerTwo.accent, "#b7ffbd");

Object.assign(playerOne, {
  x: 10,
  y: 20,
  dir: 2,
  alive: false,
  lives: 2,
  respawn: 24,
  destroying: true,
  destroyTotalTicks: 9,
  destroyExplosionTicks: 5,
  spawnFlash: 0,
  invuln: 8,
  stun: 6,
  pendingSnap: true,
  level: 3,
  reload: 7,
  score: 1200,
  stagePoints: 800,
  stageKills: [1, 2, 3, 4],
  totalKills: [4, 3, 2, 1],
  slide: 11,
  trackPhase: 1
});
const resetResult = resetPlayerState(playerOne, { settings: makeSettings(), direction: 0 });
assert.equal(resetResult, playerOne);
assert.equal(playerOne.x, 65);
assert.equal(playerOne.y, 193);
assert.equal(playerOne.dir, 0);
assert.equal(playerOne.alive, true);
assert.equal(playerOne.respawn, 0);
assert.equal(playerOne.destroying, false);
assert.equal(playerOne.destroyTotalTicks, 0);
assert.equal(playerOne.destroyExplosionTicks, 0);
assert.equal(playerOne.spawnFlash, 28);
assert.equal(playerOne.invuln, 0);
assert.equal(playerOne.stun, 0);
assert.equal(playerOne.pendingSnap, false);
assert.equal(playerOne.reload, 0);
assert.equal(playerOne.slide, 0);
assert.equal(playerOne.trackPhase, 0);
assert.equal(playerOne.level, 3);
assert.equal(playerOne.score, 1200);
assert.equal(playerOne.stagePoints, 800);
assert.deepEqual(playerOne.stageKills, [1, 2, 3, 4]);
assert.deepEqual(playerOne.totalKills, [4, 3, 2, 1]);

playerOne.lives = 0;
resetPlayerState(playerOne, {
  settings: makeSettings({ timings: { playerSpawnFlash: 0, playerInvulnerability: 45 } }),
  direction: 0
});
assert.equal(playerOne.alive, false);
assert.equal(playerOne.spawnFlash, 0);
assert.equal(playerOne.invuln, 45);

console.log("player-state unit test passed");
