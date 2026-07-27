const assert = require("assert").strict;
const tankMovementRuntime = require("../../src/runtime/tank-movement-runtime");

assert.equal(Object.isFrozen(tankMovementRuntime), true);
assert.throws(
  () => tankMovementRuntime.setupTankMovementRuntime(),
  /state must be an object/
);
assert.throws(
  () => tankMovementRuntime.setupTankMovementRuntime({ game: {}, fn: {} }, {}),
  /deps\.sharedState must be an object/
);

const grid = [
  [{ type: "ice" }, { type: "empty" }, { type: "steel" }, { type: "empty" }],
  [{ type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }],
  [{ type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }],
  [{ type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" }]
];
const state = {
  game: {
    grid,
    base: { x: 48, y: 48, w: 16, h: 16, alive: true },
    players: [],
    enemies: []
  },
  fn: {}
};
const deps = {
  sharedState: { FIELD_W: 64, FIELD_H: 64, TILE: 16, HALF: 8, GRID: 4 },
  ICE: "ice",
  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  },
  entityRect(entity, x, y) {
    return { x: x === undefined ? entity.x : x, y: y === undefined ? entity.y : y, w: entity.w, h: entity.h };
  },
  filterActiveTankCollisionPeers(tank, tanks) {
    return tanks.filter((other) => other !== tank && other.alive && !other.destroying && !(other.respawn > 0));
  },
  totalRectOverlapArea(rect, peers) {
    return peers.reduce((total, peer) => total + overlapArea(rect, peer), 0);
  },
  canTankOccupyRect(currentRect, nextRect, options) {
    if (nextRect.x < 0 || nextRect.y < 0 || nextRect.x + nextRect.w > 64 || nextRect.y + nextRect.h > 64) return false;
    if (options.baseAlive && overlapArea(nextRect, options.base) > 0) return false;
    if (options.terrainOverlapArea(nextRect) > 0) return false;
    return options.peers.every((peer) => overlapArea(nextRect, peer) === 0);
  },
  rectHitsSolidTerrain(rect, currentGrid) {
    return currentGrid[Math.floor(rect.y / 16)][Math.floor(rect.x / 16)].type === "steel";
  },
  solidTerrainOverlapArea(rect, currentGrid) {
    return currentGrid[Math.floor(rect.y / 16)][Math.floor(rect.x / 16)].type === "steel" ? 16 : 0;
  }
};
function overlapArea(a, b) {
  const width = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const height = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  return width * height;
}

const api = tankMovementRuntime.setupTankMovementRuntime(state, deps);
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), [
  "moveTank",
  "advanceTankTracks",
  "canTankOccupy",
  "activeTankCollisionPeers",
  "totalTankOverlapArea",
  "rectHitsSolidTerrain",
  "solidTerrainOverlapArea",
  "isTankOnIce",
  "snapForDirection",
  "isPerpendicularTurn"
]);
assert.equal(state.fn.moveTank, api.moveTank);

const player = { x: 2, y: 2, w: 14, h: 14, alive: true, destroying: false, trackPhase: 0, dir: 0 };
const enemy = { x: 20, y: 2, w: 14, h: 14, alive: true, destroying: false };
const inactive = { x: 2, y: 2, w: 14, h: 14, alive: false, destroying: false };
state.game.players = [player];
state.game.enemies = [enemy, inactive];

assert.equal(api.isTankOnIce(player), true);
assert.equal(api.moveTank(player, 1, 0), true);
assert.equal(player.x, 3);
assert.equal(api.moveTank(player, 16, 0), false);
assert.equal(player.x, 3);
api.advanceTankTracks(player);
assert.equal(player.trackPhase, 1);
assert.equal(api.activeTankCollisionPeers(player).length, 1);
assert.equal(api.activeTankCollisionPeers(player)[0], enemy);
assert.equal(api.totalTankOverlapArea(player, { x: 20, y: 2, w: 14, h: 14 }), 196);
assert.equal(api.rectHitsSolidTerrain({ x: 32, y: 0, w: 8, h: 8 }), true);
assert.equal(api.solidTerrainOverlapArea({ x: 32, y: 0, w: 8, h: 8 }), 16);
assert.equal(api.snapForDirection(player), true);
assert.equal(player.x, 0);
assert.equal(player.y, 0);
assert.equal(api.isPerpendicularTurn(0, 1), true);
assert.equal(api.isPerpendicularTurn(0, 2), false);

console.log("tank-movement-runtime unit test passed");
