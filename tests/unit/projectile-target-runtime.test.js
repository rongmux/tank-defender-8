const assert = require("assert").strict;
const runtime = require("../../src/runtime/projectile-target-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupProjectileTargetRuntime({}, {}, {}),
  /state\.game must be an object/
);

const events = [];
const BRICK = "brick";
const STEEL = "steel";
const state = {
  game: {
    base: { x: 80, y: 80, w: 16, h: 16, alive: true },
    baseDestroyTimer: 0,
    demoMode: false,
    enemies: [],
    grid: Array.from({ length: 13 }, () => Array.from({ length: 13 }, () => ({ type: "empty", mask: 0 }))),
    players: []
  },
  fn: {}
};
const settings = {
  friendlyFire: { enabled: true, stunFrames: 3 },
  powerUpRules: { carrierRelease: "hit" }
};
const api = runtime.setupProjectileTargetRuntime(state, {
  sharedState: { TILE: 16, GRID: 13 },
  TILE_TYPES: { BRICK, STEEL },
  bulletHitsTankByCenter: (bullet, tank) => bullet.target === tank,
  clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
  damageWall: (cell, column, row, bullet, hitMask) => {
    events.push(["damage", cell.type, column, row, hitMask]);
    return Boolean(bullet.damaged);
  },
  entityRect: (entity) => entity.rect || entity,
  overlappedBrickFragments: (rect, column, row, cell) => rect.hitMask || 0,
  overlappedQuarters: (rect, column, row, mask) => rect.hitMask || 0,
  rectsOverlap: (rect) => Boolean(rect.overlapsBase),
  shouldReleaseCarrierPowerUp: (wasCarrier, destroyed, rule) =>
    wasCarrier && rule === "hit",
  wallHitSoundName: () => "brickHit"
}, {
  addRuleExplosion: (...args) => events.push(["explosion", ...args]),
  baseDestructionDuration: () => 20,
  destroyEnemy: (enemy, ownerId) => events.push(["destroy", enemy, ownerId]),
  gameSettings: () => settings,
  killPlayer: (player) => events.push(["kill", player]),
  playSound: (sound) => events.push(["sound", sound]),
  releaseCarrierPowerUp: (enemy) => {
    enemy.carrier = false;
    events.push(["release", enemy]);
  }
});

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), ["hitBase", "hitTerrain", "hitTank"]);
assert.equal(state.fn.hitBase, api.hitBase);
assert.equal(state.fn.hitTerrain, api.hitTerrain);
assert.equal(state.fn.hitTank, api.hitTank);

const baseBullet = { rect: { overlapsBase: true }, remove: false };
assert.equal(api.hitBase(baseBullet), true);
assert.equal(state.game.base.alive, false);
assert.equal(state.game.baseDestroyTimer, 20);
assert.equal(baseBullet.remove, true);
assert.deepEqual(events, [["sound", "baseHit"], ["sound", "playerDestroy"]]);

events.length = 0;
state.game.grid[1][1] = { type: BRICK, mask: 15 };
const brickBullet = {
  x: 18,
  y: 18,
  w: 4,
  h: 4,
  power: 1,
  damaged: true,
  rect: { x: 18, y: 18, w: 4, h: 4, hitMask: 2 },
  remove: false
};
assert.equal(api.hitTerrain(brickBullet), true);
assert.equal(brickBullet.remove, true);
assert.deepEqual(events, [
  ["damage", BRICK, 1, 1, 2],
  ["explosion", "brickHit", 18, 18],
  ["sound", "brickHit"]
]);

events.length = 0;
state.game.enemies = [{
  alive: true,
  destroying: false,
  spawnFlash: 0,
  hp: 1,
  carrier: true
}];
const enemy = state.game.enemies[0];
const enemyBullet = { ownerKind: "player", ownerId: 1, x: 20, y: 20, w: 4, h: 4, target: enemy, remove: false };
assert.equal(api.hitTank(enemyBullet), true);
assert.equal(enemy.hp, 0);
assert.equal(enemy.carrier, false);
assert.equal(enemyBullet.remove, true);
assert.equal(events[0][0], "explosion");
assert.deepEqual(events[1], ["sound", "enemyDestroy"]);
assert.equal(events[2][0], "release");
assert.equal(events[3][0], "destroy");

events.length = 0;
state.game.enemies = [];
const owner = { id: 1, alive: true, spawnFlash: 0, invuln: 0, stun: 0 };
const teammate = { id: 2, alive: true, spawnFlash: 0, invuln: 0, stun: 0 };
state.game.players = [owner, teammate];
const friendlyBullet = { ownerKind: "player", ownerId: 1, x: 24, y: 24, w: 4, h: 4, target: teammate, remove: false };
assert.equal(api.hitTank(friendlyBullet), true);
assert.equal(teammate.stun, 3);
assert.equal(friendlyBullet.remove, true);
assert.deepEqual(events, [["explosion", "playerStun", 26, 26]]);

events.length = 0;
teammate.stun = 0;
const enemyBulletAtPlayer = { ownerKind: "enemy", x: 24, y: 24, w: 4, h: 4, target: teammate, remove: false };
assert.equal(api.hitTank(enemyBulletAtPlayer), true);
assert.equal(enemyBulletAtPlayer.remove, true);
assert.deepEqual(events, [["explosion", "steelBlocked", 26, 26], ["kill", teammate]]);

console.log("projectile-target-runtime unit test passed");
