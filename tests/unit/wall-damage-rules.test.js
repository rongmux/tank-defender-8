const assert = require("assert").strict;
const { DOWN, LEFT, RIGHT, UP } = require("../../src/core/directions");
const {
  BRICK_QUARTER_FRAGMENT_MASKS,
  TILE_TYPES,
  makeCell
} = require("../../src/stages/stage-grid");
const wallDamageRules = require("../../src/rules/wall-damage-rules");

const {
  DEFAULT_WALL_RULES,
  brickDamageMask,
  brickImpactOrder,
  brickImpactStripMasks,
  cloneWallRules,
  damageSteelWall,
  damageWall
} = wallDamageRules;
const { BRICK, EMPTY, STEEL } = TILE_TYPES;

assert.equal(Object.isFrozen(wallDamageRules), true);
assert.equal(Object.isFrozen(DEFAULT_WALL_RULES), true);
assert.deepEqual(DEFAULT_WALL_RULES, {
  brickSameSideHits: 4,
  poweredBrickSameSideHits: 2,
  brickFragmentSize: 4,
  normalBrickStripLength: 8,
  normalBrickStripDepth: 4,
  steelRequiredPower: 3,
  steelSameSideHits: 1,
  maxPowerBrickHalfDamage: true
});
const clonedRules = cloneWallRules();
assert.deepEqual(clonedRules, DEFAULT_WALL_RULES);
assert.notEqual(clonedRules, DEFAULT_WALL_RULES);
clonedRules.brickSameSideHits = 99;
assert.equal(DEFAULT_WALL_RULES.brickSameSideHits, 4);
assert.deepEqual(brickImpactOrder(UP), [2, 3, 0, 1]);
assert.deepEqual(brickImpactOrder(DOWN), [0, 1, 2, 3]);
assert.deepEqual(brickImpactOrder(LEFT), [1, 3, 0, 2]);
assert.deepEqual(brickImpactOrder(RIGHT), [0, 2, 1, 3]);

assert.deepEqual(brickImpactStripMasks(2, UP), [0x3000, 0x0300]);
assert.deepEqual(brickImpactStripMasks(2, DOWN), [0x0300, 0x3000]);
assert.deepEqual(brickImpactStripMasks(2, LEFT), [0x2200, 0x1100]);
assert.deepEqual(brickImpactStripMasks(2, RIGHT), [0x1100, 0x2200]);
assert.deepEqual(brickImpactStripMasks(3, UP), [0xc000, 0x0c00]);

const lowerLeft = BRICK_QUARTER_FRAGMENT_MASKS[2];
const lowerRight = BRICK_QUARTER_FRAGMENT_MASKS[3];
assert.equal(brickDamageMask(0xffff, lowerLeft, UP, 1), 0x3000);
assert.equal(brickDamageMask(0xffff & ~0x3000, lowerLeft, UP, 1), 0x0300);
assert.equal(brickDamageMask(0xffff, lowerRight, UP, 1), 0xc000);
assert.equal(brickDamageMask(0xffff, lowerLeft, UP, 2), lowerLeft);
assert.equal(brickDamageMask(0xffff, 0, UP, 3), 0);

const stripCell = makeCell(BRICK, 15);
assert.equal(damageWall(stripCell, 0, 0, { power: 1, dir: RIGHT }, 1 << 0), true);
assert.equal(stripCell.brickMask, 0xffee);
assert.equal(stripCell.mask, 15);

const singleQuarterBrick = makeCell(BRICK, 1 << 2);
assert.equal(damageWall(singleQuarterBrick, 0, 0, { power: 2, dir: UP }, lowerLeft), true);
assert.equal(singleQuarterBrick.type, EMPTY);
assert.equal(singleQuarterBrick.mask, 0);
assert.equal(singleQuarterBrick.brickMask, 0);

const blockedSteel = makeCell(STEEL, 15);
assert.equal(damageSteelWall(blockedSteel, { power: 2, dir: UP }, 1 << 2), false);
assert.equal(blockedSteel.mask, 15);

const steel = makeCell(STEEL, 15);
steel.steelHits = [1, 2, 3, 4];
assert.equal(damageSteelWall(steel, { power: 3, dir: UP }, 1 << 2), true);
assert.equal(steel.mask, 11);
assert.deepEqual(steel.steelHits, [0, 0, 0, 0]);

const finalSteelQuarter = makeCell(STEEL, 1 << 3);
assert.equal(damageWall(finalSteelQuarter, 0, 0, { power: 3, dir: UP }, 1 << 3), true);
assert.equal(finalSteelQuarter.type, EMPTY);
assert.equal(finalSteelQuarter.mask, 0);

console.log("wall-damage-rules unit test passed");
