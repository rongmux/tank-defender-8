const assert = require("assert").strict;
const runtime = require("../../src/runtime/player-update-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupPlayerUpdateRuntime({}, {}, {}),
  /state\.game must be an object/
);

const events = [];
const state = {
  game: {
    demoMode: false,
    enemies: [],
    frameHigh: 0,
    frameLow: 0,
    playerCount: 1,
    players: [],
    powerUp: null
  },
  fn: {},
  keys: new Set(),
  pendingFirePresses: new Set()
};
const settings = {
  playerMovement: { frameCadence: [true] },
  timings: { playerInvulnerability: 19 }
};
const api = runtime.setupPlayerUpdateRuntime(state, {
  DEFAULT_PLAYER_MOVEMENT: { frameCadence: [false] },
  DOWN: 2,
  LEFT: 3,
  RIGHT: 1,
  UP: 0,
  advancePlayerDestructionState(player, movementFrame) {
    events.push(["respawn", player.id, movementFrame]);
    if (!movementFrame) return false;
    player.respawn -= 1;
    return player.respawn === 0;
  },
  sharedState: { FIELD_H: 208 }
}, {
  directionTowardTarget(player, target, horizontalFirst) {
    events.push(["target", player.id, target.kind, horizontalFirst]);
    return horizontalFirst ? 1 : 2;
  },
  finishPlayerDeath(player) {
    events.push(["finish", player.id]);
  },
  gameSettings() {
    return settings;
  },
  shoot(player) {
    events.push(["shoot", player.id]);
  },
  updatePlayerMovement(player, direction, stunned) {
    events.push(["move", player.id, direction, stunned === true]);
  }
});

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), [
  "updatePlayers",
  "updateDemoPlayers",
  "demoControlForPlayer",
  "demoTargetForPlayer",
  "isPlayerMovementFrame",
  "getPlayerControl",
  "hasControlKey"
]);
assert.equal(state.fn.updatePlayers, api.updatePlayers);
assert.equal(state.fn.isPlayerMovementFrame, api.isPlayerMovementFrame);
assert.equal(api.isPlayerMovementFrame(0), true);
assert.equal(api.isPlayerMovementFrame(1), true);

const player = {
  id: 1,
  alive: true,
  destroying: false,
  invuln: 0,
  reload: 1,
  respawn: 0,
  spawnFlash: 0,
  stun: 0
};
state.game.players = [player];
state.keys.add("KeyD");
state.pendingFirePresses.add("Space");
api.updatePlayers(true);
assert.equal(player.reload, 0);
assert.deepEqual(events, [["move", 1, 1, false], ["shoot", 1]]);
assert.equal(state.pendingFirePresses.size, 0);
assert.deepEqual(api.getPlayerControl(1), {
  up: ["ArrowUp", "KeyW"],
  right: ["ArrowRight", "KeyD"],
  down: ["ArrowDown", "KeyS"],
  left: ["ArrowLeft", "KeyA"],
  fire: "Space"
});
state.game.playerCount = 2;
assert.deepEqual(api.getPlayerControl(1), {
  up: "ArrowUp",
  right: "ArrowRight",
  down: "ArrowDown",
  left: "ArrowLeft",
  fire: "Space"
});
assert.deepEqual(api.getPlayerControl(2), {
  up: "KeyW",
  right: "KeyD",
  down: "KeyS",
  left: "KeyA",
  fire: "KeyF"
});
assert.equal(api.hasControlKey(["ArrowLeft", "KeyA"], new Set(["KeyA"])), true);

events.length = 0;
player.spawnFlash = 1;
state.game.frameLow = 1;
api.updatePlayers(false);
assert.equal(player.spawnFlash, 0);
assert.equal(player.invuln, 19);
assert.deepEqual(events, []);

events.length = 0;
player.alive = false;
player.respawn = 1;
state.game.frameLow = 2;
api.updatePlayers(true);
assert.deepEqual(events, [["respawn", 1, true], ["finish", 1]]);

events.length = 0;
state.game.demoMode = true;
player.alive = true;
player.respawn = 0;
player.spawnFlash = 0;
player.reload = 0;
player.x = 16;
player.y = 32;
state.game.frameHigh = 2;
state.game.powerUp = { type: "star", x: 80, y: 96, w: 12, h: 12 };
assert.deepEqual(api.demoTargetForPlayer(player), {
  kind: "powerUp",
  id: "star",
  x: 86,
  y: 102
});
assert.deepEqual(api.demoControlForPlayer(player), {
  direction: 1,
  fire: true,
  targetKind: "powerUp",
  targetId: "star"
});
events.length = 0;
api.updatePlayers();
assert.deepEqual(events, [["target", 1, "powerUp", true], ["move", 1, 1, false], ["shoot", 1]]);

state.game.powerUp = null;
state.game.enemies = [
  { id: 4, slotIndex: 4, alive: true, destroying: false, spawnFlash: 0, x: 0, y: 0, w: 14, h: 14 },
  { id: 2, slotIndex: 2, alive: true, destroying: false, spawnFlash: 0, x: 16, y: 16, w: 14, h: 14 },
  { id: 3, slotIndex: 3, alive: true, destroying: false, spawnFlash: 1, x: 32, y: 32, w: 14, h: 14 }
];
assert.equal(api.demoTargetForPlayer(player).id, 2);
player.id = 2;
assert.equal(api.demoTargetForPlayer(player).id, 4);
state.game.enemies[2].spawnFlash = 0;
assert.equal(api.demoTargetForPlayer(player).id, 3);

console.log("player-update-runtime unit test passed");
