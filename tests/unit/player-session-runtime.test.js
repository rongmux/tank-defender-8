const assert = require("assert").strict;
const runtime = require("../../src/runtime/player-session-runtime");

assert.throws(() => runtime.setupPlayerSessionRuntime(), /state must be an object/);
assert.throws(() => runtime.setupPlayerSessionRuntime(
  { fn: {}, stageRuntime: { gameSettings() {}, playerSpawnPoint() {}, enemyTypeDefinitions() {} } },
  { createPlayerState() {}, resetPlayerState() {} }
), /deps\.UP must be defined/);
const calls = [];
const state = {
  fn: {},
  stageRuntime: {
    enemyTypeDefinitions() { return [{}, {}, {}, {}]; },
    gameSettings() { return { id: "settings" }; },
    playerSpawnPoint(id) { return { x: id * 10, y: 192 }; }
  }
};
const api = runtime.setupPlayerSessionRuntime(state, {
  UP: 0,
  createPlayerState(options) { calls.push(["create", options]); return { id: options.id }; },
  resetPlayerState(player, options) { calls.push(["reset", player, options]); }
});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), ["createPlayer", "resetPlayerPosition"]);
assert.deepEqual(api.createPlayer(2), { id: 2 });
assert.deepEqual(calls[0], ["create", { id: 2, spawn: { x: 20, y: 192 }, settings: { id: "settings" }, enemyTypeCount: 4, direction: 0 }]);
const player = { id: 2 };
api.resetPlayerPosition(player);
assert.deepEqual(calls[1], ["reset", player, { settings: { id: "settings" }, direction: 0 }]);
console.log("player-session-runtime unit test passed");
