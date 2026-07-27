const assert = require("assert").strict;
const runtime = require("../../src/runtime/enemy-ai-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupEnemyAiRuntime({}, {}, {}),
  /state\.game must be an object/
);

const randomBytes = [];
const targetCalls = [];
const directionCalls = [];
const settings = { enemyAi: { horizontalFirstChance: 1 } };
const state = {
  game: {
    base: { x: 96, y: 192, w: 16, h: 16 },
    frameHigh: 0,
    playerCount: 1,
    players: [],
    stage: 1
  },
  fn: {}
};
const api = runtime.setupEnemyAiRuntime(state, {
  ENEMY_FIRE_CHANCE: 1 / 32,
  directionTowardTarget(enemy, target, horizontalFirst) {
    directionCalls.push({ enemy, target, horizontalFirst });
    return horizontalFirst ? 1 : 2;
  },
  enemyAiChanceMatches(chance, byte) {
    return chance === 1 || (chance === 0.5 && (byte & 1) === 1);
  },
  enemyAiPhaseForInterval(interval, frameHigh) {
    if (frameHigh > Math.floor(interval / 4)) return "hq";
    if (frameHigh > Math.floor(interval / 8)) return "player";
    return "random";
  },
  selectEnemyTargetPlayer(enemy, players) {
    targetCalls.push({ enemy, players });
    return players[1] || null;
  },
  shouldEnemyFireForByte(fireChance, defaultChance, byte) {
    assert.equal(defaultChance, 1 / 32);
    return fireChance === 0.25 && byte === 63;
  }
}, {
  defaultEnemySpawnDelay() {
    return 186;
  },
  directionTowardTarget: (enemy, target, horizontalFirst) => {
    directionCalls.push({ enemy, target, horizontalFirst });
    return horizontalFirst ? 1 : 2;
  },
  gameSettings() {
    return settings;
  },
  randomByte(random) {
    if (typeof random === "function") return Math.floor(random() * 256) & 0xff;
    return randomBytes.shift() || 0;
  },
  scaleEnemySpawnDelayForPlayers(delay, players) {
    return delay * players;
  },
  selectEnemyTargetPlayer: (enemy, players) => {
    targetCalls.push({ enemy, players });
    return players[1] || null;
  }
});

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), [
  "chooseEnemyDirectionByPhase",
  "enemyAiPhase",
  "shouldEnemyFire",
  "aiRoll"
]);
assert.equal(state.fn.chooseEnemyDirectionByPhase, api.chooseEnemyDirectionByPhase);
assert.equal(state.fn.enemyAiPhase, api.enemyAiPhase);
assert.equal(state.fn.shouldEnemyFire, api.shouldEnemyFire);
assert.equal(state.fn.aiRoll, api.aiRoll);

assert.equal(api.enemyAiPhase(1, 23), "random");
assert.equal(api.enemyAiPhase(1, 24), "player");
assert.equal(api.enemyAiPhase(1, 47), "hq");

const enemy = { x: 32, y: 32, w: 14, h: 14, dir: 0, slotIndex: 7 };
randomBytes.push(2);
state.game.frameHigh = 0;
assert.equal(api.chooseEnemyDirectionByPhase(enemy), "random");
assert.equal(enemy.dir, 2);

state.game.frameHigh = 24;
state.game.players = [
  { id: 1, x: 20, y: 160, w: 14, h: 14 },
  { id: 2, x: 128, y: 160, w: 14, h: 14 }
];
randomBytes.push(1);
assert.equal(api.chooseEnemyDirectionByPhase(enemy), "player");
assert.equal(enemy.dir, 1);
assert.equal(targetCalls.length, 1);
assert.deepEqual(directionCalls[0].target, { x: 135, y: 167 });
assert.equal(directionCalls[0].horizontalFirst, true);

state.game.frameHigh = 47;
settings.enemyAi.horizontalFirstChance = 0;
randomBytes.push(0);
assert.equal(api.chooseEnemyDirectionByPhase(enemy), "hq");
assert.equal(enemy.dir, 2);
assert.deepEqual(directionCalls[1].target, { x: 104, y: 200 });

randomBytes.push(63);
assert.equal(api.shouldEnemyFire({ fireChance: 0.25 }), true);
assert.equal(api.aiRoll(0.5, () => 1 / 256), true);
assert.equal(api.aiRoll(0.5, () => 0), false);

console.log("enemy-ai-runtime unit test passed");
