const assert = require("assert").strict;
const runtime = require("../../src/runtime/battle-loop-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupBattleLoopRuntime({}, {}, {}),
  /state\.game must be an object/
);

const events = [];
let spawnAllowed = true;
const state = {
  game: { tick: 4, baseDestroyTimer: 0 },
  fn: {}
};
const callbackNames = [
  "checkEndState",
  "spawnEnemies",
  "shouldSpawnEnemies",
  "syncMovementAudio",
  "updateBaseDestructionTimer",
  "updateBullets",
  "updateEnemies",
  "updateExplosions",
  "updateFreezeTimer",
  "updatePlayerGameOverMessage",
  "updatePlayerInvulnerabilityTimers",
  "updatePlayers",
  "updatePowerUp",
  "updateScorePopups",
  "updateShovelTimer"
];
const callbacks = {};
for (const name of callbackNames) {
  callbacks[name] = (...args) => {
    events.push([name, ...args]);
    return name === "shouldSpawnEnemies" ? spawnAllowed : undefined;
  };
}
const api = runtime.setupBattleLoopRuntime(state, {}, callbacks);

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), ["updateBattle"]);
assert.equal(state.fn.updateBattle, api.updateBattle);

api.updateBattle();
assert.equal(state.game.tick, 5);
assert.deepEqual(events, [
  ["updateFreezeTimer"],
  ["updatePlayers", true],
  ["updateEnemies"],
  ["updateShovelTimer"],
  ["updatePlayerInvulnerabilityTimers"],
  ["updateExplosions"],
  ["updateBaseDestructionTimer"],
  ["updateBullets"],
  ["updateScorePopups"],
  ["updatePowerUp"],
  ["updatePlayerGameOverMessage"],
  ["shouldSpawnEnemies"],
  ["spawnEnemies"],
  ["checkEndState"],
  ["syncMovementAudio"]
]);

events.length = 0;
state.game.baseDestroyTimer = 2;
api.updateBattle({ playerInputEnabled: true, checkEnding: false });
assert.equal(state.game.tick, 6);
assert.equal(events[1][0], "updatePlayers");
assert.equal(events[1][1], false);
assert.equal(events.some((event) => event[0] === "checkEndState"), false);
assert.equal(events.some((event) => event[0] === "spawnEnemies"), true);

events.length = 0;
spawnAllowed = false;
api.updateBattle({ playerInputEnabled: false });
assert.equal(state.game.tick, 7);
assert.equal(events.some((event) => event[0] === "spawnEnemies"), false);
assert.equal(events.some((event) => event[0] === "checkEndState"), true);

console.log("battle-loop-runtime unit test passed");
