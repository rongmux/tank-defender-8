const assert = require("assert").strict;
const { DOWN, LEFT, RIGHT, UP } = require("../../src/core/directions");
const { createProjectileState } = require("../../src/entities/projectile-state");

const rules = { bulletSize: 4, spawnOffset: 9, boundsPadding: 4 };
const baseTank = {
  kind: "player",
  id: 1,
  x: 16,
  y: 16,
  w: 14,
  h: 14,
  dir: UP,
  bulletSpeed: 2.25,
  bulletPower: 1
};

const positions = [
  [UP, 21, 12],
  [RIGHT, 30, 21],
  [DOWN, 21, 30],
  [LEFT, 12, 21]
];
for (const [dir, x, y] of positions) {
  const tank = { ...baseTank, dir };
  const bullet = createProjectileState({ tank, ownerKey: "player:1", rules });
  assert.deepEqual(bullet, {
    x,
    y,
    w: 4,
    h: 4,
    dir,
    speed: 2.25,
    power: 1,
    ownerKind: "player",
    ownerId: 1,
    ownerKey: "player:1",
    remove: false
  });
  assert.deepEqual(tank, { ...baseTank, dir });
}

const upgraded = createProjectileState({
  tank: { ...baseTank, dir: RIGHT },
  ownerKey: "player:1",
  rules,
  upgrade: { bulletSpeed: 4, wallPower: 3 }
});
assert.equal(upgraded.speed, 4);
assert.equal(upgraded.power, 3);

const enemy = createProjectileState({
  tank: {
    kind: "enemy",
    id: 104,
    x: 64,
    y: 32,
    w: 14,
    h: 14,
    dir: DOWN,
    bulletSpeed: 4,
    bulletPower: 2
  },
  ownerKey: "enemy:104",
  rules: { bulletSize: 6, spawnOffset: 11, boundsPadding: 2 }
});
assert.deepEqual(enemy, {
  x: 68,
  y: 47,
  w: 6,
  h: 6,
  dir: DOWN,
  speed: 4,
  power: 2,
  ownerKind: "enemy",
  ownerId: 104,
  ownerKey: "enemy:104",
  remove: false
});

const fallbackPower = createProjectileState({
  tank: { ...baseTank, bulletPower: 0 },
  ownerKey: "player:1",
  rules
});
assert.equal(fallbackPower.power, 1);

console.log("projectile-state unit test passed");
