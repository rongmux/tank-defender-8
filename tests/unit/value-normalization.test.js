const assert = require("assert").strict;
const {
  normalizeHexColor,
  normalizeNumber
} = require("../../src/config/value-normalization");

assert.equal(normalizeNumber(undefined, 5, 1, 9, true, "value"), 5);
assert.equal(normalizeNumber("3", 5, 1, 9, true, "value"), 3);
assert.equal(normalizeNumber(0.25, 0, 0, 1, false, "chance"), 0.25);
assert.equal(normalizeNumber(0, 1, 0, 1, false, "chance"), 0);
assert.equal(normalizeNumber(1, 0, 0, 1, false, "chance"), 1);
assert.throws(() => normalizeNumber(1.5, 1, 1, 9, true, "value"), /value must be an integer from 1 to 9/);
assert.throws(() => normalizeNumber(Infinity, 1, 0, 9, false, "value"), /value must be a number from 0 to 9/);
assert.throws(() => normalizeNumber(-1, 0, 0, 9, false, "value"), /value must be a number from 0 to 9/);
assert.throws(() => normalizeNumber(10, 0, 0, 9, false, "value"), /value must be a number from 0 to 9/);

assert.equal(normalizeHexColor(undefined, "#abcdef", "color"), "#abcdef");
assert.equal(normalizeHexColor("#ABCDEF", "#000000", "color"), "#ABCDEF");
assert.throws(() => normalizeHexColor("red", "#000000", "color"), /color must be a #rrggbb color/);
assert.throws(() => normalizeHexColor(undefined, undefined, "color"), /color must be a #rrggbb color/);

console.log("value-normalization unit test passed");
