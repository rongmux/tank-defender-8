const assert = require("assert").strict;
const {
  TANK_HIT_CENTER_RANGE,
  bulletHitsTankByCenter,
  canTankOccupyRect,
  entityRect,
  filterActiveTankCollisionPeers,
  totalRectOverlapArea
} = require("../../src/rules/tank-collision-rules");

assert.equal(TANK_HIT_CENTER_RANGE, 10);
const tank = { x: 64, y: 64, w: 14, h: 14 };
assert.deepEqual(entityRect(tank), { x: 64, y: 64, w: 14, h: 14 });
assert.deepEqual(entityRect(tank, 0, 2), { x: 0, y: 2, w: 14, h: 14 });

const bulletAtOffset = (dx, dy) => ({
  x: tank.x + tank.w / 2 + dx - 2,
  y: tank.y + tank.h / 2 + dy - 2,
  w: 4,
  h: 4
});
assert.equal(bulletHitsTankByCenter(bulletAtOffset(9, 9), tank), true);
assert.equal(bulletHitsTankByCenter(bulletAtOffset(-9, -9), tank), true);
assert.equal(bulletHitsTankByCenter(bulletAtOffset(10, 0), tank), false);
assert.equal(bulletHitsTankByCenter(bulletAtOffset(-10, 0), tank), false);

const active = { alive: true, destroying: false, respawn: 0 };
const spawning = { alive: true, destroying: false, respawn: 0, spawnFlash: 12 };
const dead = { alive: false, destroying: false, respawn: 0 };
const destroying = { alive: true, destroying: true, respawn: 0 };
const respawning = { alive: true, destroying: false, respawn: 3 };
assert.deepEqual(filterActiveTankCollisionPeers(tank, [
  tank,
  active,
  spawning,
  dead,
  destroying,
  respawning
]), [active, spawning]);

const overlapRect = { x: 0, y: 0, w: 14, h: 14 };
assert.equal(totalRectOverlapArea(overlapRect, [
  { x: 8, y: 7, w: 14, h: 14 },
  { x: 12, y: 0, w: 14, h: 14 }
]), 70);

const currentRect = { x: 32, y: 32, w: 14, h: 14 };
const openOptions = {
  fieldWidth: 100,
  fieldHeight: 100,
  base: { x: 80, y: 80, w: 16, h: 16 },
  baseAlive: true,
  terrainOverlapArea: () => 0,
  peers: []
};
assert.equal(canTankOccupyRect(currentRect, { ...currentRect, x: -1 }, openOptions), false);
assert.equal(canTankOccupyRect(currentRect, { ...currentRect, y: 87 }, openOptions), false);
assert.equal(canTankOccupyRect(currentRect, { ...currentRect, x: 81, y: 81 }, openOptions), false);
assert.equal(canTankOccupyRect(currentRect, { ...currentRect, x: 81, y: 81 }, {
  ...openOptions,
  baseAlive: false
}), true);

const nextRect = { ...currentRect, x: 33 };
assert.equal(canTankOccupyRect(currentRect, nextRect, {
  ...openOptions,
  terrainOverlapArea: (rect) => rect === currentRect ? 0 : 1
}), false, "a tank outside terrain must not enter a solid fragment");
assert.equal(canTankOccupyRect(currentRect, nextRect, {
  ...openOptions,
  terrainOverlapArea: (rect) => rect === currentRect ? 10 : 8
}), true, "an embedded tank may move toward less terrain overlap");
assert.equal(canTankOccupyRect(currentRect, nextRect, {
  ...openOptions,
  terrainOverlapArea: (rect) => rect === currentRect ? 8 : 8
}), false, "terrain recovery must strictly reduce overlap");

const peer = { x: 40, y: 32, w: 14, h: 14 };
assert.equal(canTankOccupyRect(currentRect, { ...currentRect, x: 31 }, {
  ...openOptions,
  peers: [peer]
}), true, "overlapping tanks may move apart");
assert.equal(canTankOccupyRect(currentRect, { ...currentRect, x: 33 }, {
  ...openOptions,
  peers: [peer]
}), false, "overlapping tanks may not move deeper together");
assert.equal(canTankOccupyRect(currentRect, { ...currentRect, x: 26 }, {
  ...openOptions,
  peers: [peer]
}), true, "edge contact after separation must remain valid");

console.log("tank-collision-rules unit test passed");
