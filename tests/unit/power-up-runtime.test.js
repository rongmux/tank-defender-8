const assert = require("assert").strict;
const powerUpRuntime = require("../../src/runtime/power-up-runtime");

assert.equal(Object.isFrozen(powerUpRuntime), true);
assert.throws(
  () => powerUpRuntime.setupPowerUpRuntime(),
  /state must be an object/
);
assert.throws(
  () => powerUpRuntime.setupPowerUpRuntime({ game: {}, fn: {} }, { sharedState: {} }, {}),
  /callbacks\.addPlayerScore must be a function/
);

const sounds = [];
const scoreCalls = [];
const popupCalls = [];
const state = {
  game: {
    powerUp: null,
    lastPowerUpSpawn: null,
    powerUpSpawnBag: ["stale"],
    powerUpSpawnBagKey: "stale",
    base: { x: 96, y: 192, w: 16, h: 16, alive: false },
    grid: [],
    players: [],
    enemies: [],
    demoMode: false
  },
  fn: {}
};
const deps = {
  sharedState: { GRID: 2, TILE: 16, FIELD_W: 32, FIELD_H: 32 },
  POWER_UP_TYPES: ["grenade", "star"],
  POWER_UP_SIZE: 12,
  DEFAULT_POWERUP_SPAWNS: [{ x: 2, y: 2 }],
  STEEL: "steel",
  shouldClearPowerUpForCarrierSpawn(carrier) {
    return carrier === true;
  },
  createPowerUpState({ type, position, ttl }) {
    return { type, x: position.x, y: position.y, w: 12, h: 12, ttl };
  },
  advancePowerUpState(power) {
    if (power.ttl <= 0) return power;
    power.ttl -= 1;
    return power.ttl < 0 ? null : power;
  },
  findPowerUpCollector() {
    return state.game.players[0] || null;
  },
  applyPowerUpEffect(player, battle, type) {
    if (type === "star") player.level += 1;
    return { destroyActiveEnemies: false, rebuildBaseWall: false, soundName: null };
  },
  dedupePowerUpSpots(spots) {
    return spots.filter((spot, index) => spots.findIndex((candidate) => candidate.x === spot.x && candidate.y === spot.y) === index);
  },
  powerUpSpawnKey(point) {
    return `${point.x},${point.y}`;
  },
  powerUpTypeForRandomByte(value) {
    return (value & 1) === 0 ? "grenade" : "star";
  },
  selectPowerUpSpawnSpot(spots, sample, previous) {
    const pool = spots.filter((spot) => `${spot.x},${spot.y}` !== previous);
    return (pool.length ? pool : spots)[sample % (pool.length || spots.length)];
  },
  rectsOverlap() {
    return false;
  }
};
const randomBytes = [0, 0, 1, 0];
const callbacks = {
  addPlayerScore(player, points) {
    scoreCalls.push({ player, points });
  },
  addScorePopup(...args) {
    popupCalls.push(args);
  },
  buildBaseWall() {
    throw new Error("unexpected wall rebuild");
  },
  canTankOccupy() {
    return true;
  },
  destroyEnemy() {
    throw new Error("unexpected enemy destruction");
  },
  gameSettings() {
    return {
      powerUpRules: { clearUncollectedOnCarrierSpawn: true, pickupScore: 10 },
      powerUpDurations: { helmet: 10, shovel: 20, timer: 10 },
      playerUpgradeRules: [{}, {}],
      timings: { powerUpTtl: 9 }
    };
  },
  playSound(name) {
    sounds.push(name);
  },
  randomByte() {
    return randomBytes.shift() || 0;
  },
  rectHitsSolidTerrain() {
    return false;
  },
  stageSettings() {
    return { powerUpSpawns: [{ x: 2, y: 2 }, { x: 18, y: 2 }] };
  }
};

const api = powerUpRuntime.setupPowerUpRuntime(state, deps, callbacks);
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), [
  "releaseCarrierPowerUp",
  "clearPowerUpForCarrierSpawn",
  "spawnPowerUp",
  "randomPowerUpType",
  "pickPowerUpSpawnSpot",
  "resetPowerUpSpawnBag",
  "powerUpSpawnCandidates",
  "fallbackPowerUpSpawnSpots",
  "canPowerUpSpawnAt",
  "updatePowerUp",
  "collectPowerUp",
  "applyPowerUp"
]);
assert.equal(state.fn.spawnPowerUp, api.spawnPowerUp);

assert.equal(api.spawnPowerUp("star"), true);
assert.deepEqual(state.game.powerUp, { type: "star", x: 2, y: 2, w: 12, h: 12, ttl: 9 });
assert.deepEqual(sounds, ["powerUpAppear"]);
assert.equal(api.canPowerUpSpawnAt({ x: 30, y: 30 }), false);

state.game.powerUp = { type: "timer", x: 2, y: 2, w: 12, h: 12, ttl: 0 };
const player = { id: 1, x: 2, y: 2, w: 14, h: 14, level: 0 };
state.game.players = [player];
api.updatePowerUp();
assert.equal(state.game.powerUp, null);
assert.equal(player.level, 0);
assert.deepEqual(scoreCalls, [{ player, points: 10 }]);
assert.equal(popupCalls.length, 1);
assert.equal(sounds.at(-1), "powerUp");

state.game.powerUp = { type: "star", x: 2, y: 2, w: 12, h: 12, ttl: 0 };
api.updatePowerUp();
assert.equal(player.level, 1);

state.game.powerUp = { type: "helmet", x: 2, y: 2, w: 12, h: 12, ttl: 0 };
assert.equal(api.clearPowerUpForCarrierSpawn(true), true);
assert.equal(state.game.powerUp, null);
assert.equal(api.clearPowerUpForCarrierSpawn(false), false);

state.game.powerUp = null;
const carrier = { carrier: true, powerUpType: "star" };
api.releaseCarrierPowerUp(carrier);
assert.equal(carrier.carrier, false);
assert.equal(state.game.powerUp.type, "star");

api.resetPowerUpSpawnBag();
assert.deepEqual(state.game.powerUpSpawnBag, []);
assert.equal(state.game.powerUpSpawnBagKey, "");

console.log("power-up-runtime unit test passed");
