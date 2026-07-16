const assert = require("assert").strict;
const { DIR_X, DIR_Y, DOWN, LEFT, RIGHT, UP } = require("../../src/core/directions");

assert.equal(UP, 0);
assert.equal(RIGHT, 1);
assert.equal(DOWN, 2);
assert.equal(LEFT, 3);
assert.deepEqual(DIR_X, [0, 1, 0, -1]);
assert.deepEqual(DIR_Y, [-1, 0, 1, 0]);
assert.equal(Object.isFrozen(DIR_X), true);
assert.equal(Object.isFrozen(DIR_Y), true);

console.log("directions unit test passed");
