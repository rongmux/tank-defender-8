const assert = require("assert").strict;
const runtime = require("../../src/runtime/player-movement-runtime");

assert.equal(Object.isFrozen(runtime), true);
assert.throws(
  () => runtime.setupPlayerMovementRuntime({}, {}, {}),
  /state\.game must be an object/
);

const events = [];
const state = { game: {}, fn: {} };
const settings = {
  playerMovement: { iceSlideFrames: 28, iceSlideSpeed: 0.4 }
};
let onIce = true;
const api = runtime.setupPlayerMovementRuntime(state, {
  DIR_X: [0, 1, 0, -1],
  DIR_Y: [-1, 0, 1, 0],
  sharedState: {}
}, {
  advanceTankTracks(player) {
    events.push(["tracks", player.trackPhase]);
  },
  gameSettings() {
    events.push(["settings"]);
    return settings;
  },
  isPerpendicularTurn(fromDir, toDir) {
    events.push(["perpendicular", fromDir, toDir]);
    return fromDir !== toDir;
  },
  isTankOnIce() {
    return onIce;
  },
  moveTank(player, dx, dy) {
    events.push(["move", dx, dy]);
    player.x += dx;
    player.y += dy;
    return true;
  },
  playSound(name) {
    events.push(["sound", name]);
  },
  snapForDirection(player) {
    events.push(["snap", player.dir]);
    return true;
  }
});

assert.equal(Object.isFrozen(api), true);
assert.equal(state.fn.updatePlayerMovement, api.updatePlayerMovement);

const player = {
  dir: 0,
  pendingSnap: false,
  slide: 0,
  speed: 1,
  stun: 0,
  trackPhase: 0,
  x: 0,
  y: 0
};
api.updatePlayerMovement(player, 1);
assert.equal(player.dir, 1);
assert.equal(player.slide, 28);
assert.equal(player.pendingSnap, false);
assert.deepEqual(events, [
  ["settings"],
  ["sound", "movementIce"],
  ["perpendicular", 0, 1],
  ["snap", 1],
  ["move", 1, 0],
  ["tracks", 0]
]);

events.length = 0;
player.slide = 2;
api.updatePlayerMovement(player, -1);
assert.equal(player.slide, 1);
assert.deepEqual(events, [["settings"], ["settings"], ["move", 0.4, 0], ["tracks", 0]]);

events.length = 0;
player.slide = 16;
api.updatePlayerMovement(player, 1);
assert.equal(player.slide, 15);
assert.deepEqual(events, [["settings"], ["settings"], ["move", 0.4, 0], ["tracks", 0]]);

events.length = 0;
player.stun = 1;
api.updatePlayerMovement(player, 1);
assert.deepEqual(events, []);

onIce = false;
player.stun = 0;
player.slide = 0;
api.updatePlayerMovement(player, 3);
assert.equal(player.dir, 3);
assert.deepEqual(events, [
  ["perpendicular", 1, 3],
  ["snap", 3],
  ["move", -1, 0],
  ["tracks", 0]
]);

console.log("player-movement-runtime unit test passed");
