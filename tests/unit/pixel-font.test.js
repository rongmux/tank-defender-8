const assert = require("assert").strict;
const pixelFont = require("../../src/presentation/pixel-font");

const {
  COMPACT_GAME_OVER_FONT,
  PIXEL_FONT,
  compactGameOverGlyph,
  pixelGlyph,
  rightAlignedPixelTextX
} = pixelFont;

assert.equal(Object.isFrozen(pixelFont), true);
assert.equal(Object.isFrozen(PIXEL_FONT), true);
assert.equal(Object.isFrozen(COMPACT_GAME_OVER_FONT), true);
assert.equal(Object.isFrozen(PIXEL_FONT.A), true);
assert.equal(Object.isFrozen(COMPACT_GAME_OVER_FONT.G), true);
assert.equal(Object.keys(PIXEL_FONT).length, 41);
assert.equal(Object.keys(COMPACT_GAME_OVER_FONT).length, 7);

for (const [character, rows] of Object.entries(PIXEL_FONT)) {
  assert.equal(rows.length, 7, `${character} should have seven pixel rows`);
  assert.equal(rows.every((row) => row.length === 5), true);
  assert.equal(rows.every((row) => /^[01]{5}$/.test(row)), true);
}
for (const [character, rows] of Object.entries(COMPACT_GAME_OVER_FONT)) {
  assert.equal(rows.length, 5, `${character} should have five compact rows`);
  assert.equal(rows.every((row) => row.length === 3), true);
  assert.equal(rows.every((row) => /^[01]{3}$/.test(row)), true);
}

assert.equal(pixelGlyph("a"), PIXEL_FONT.A);
assert.equal(pixelGlyph("7"), PIXEL_FONT["7"]);
assert.equal(pixelGlyph(" "), PIXEL_FONT[" "]);
assert.equal(pixelGlyph(undefined), PIXEL_FONT[" "]);
assert.equal(pixelGlyph("@"), PIXEL_FONT["?"]);
assert.equal(compactGameOverGlyph("g"), COMPACT_GAME_OVER_FONT.G);
assert.equal(compactGameOverGlyph("X"), undefined);

assert.equal(rightAlignedPixelTextX("123", 88, 1), 70);
assert.equal(rightAlignedPixelTextX("123", 88, 2), 52);
assert.equal(rightAlignedPixelTextX("123", 88, 1, 5), 73);
assert.equal(rightAlignedPixelTextX("", 88, 1), 88);
assert.equal(rightAlignedPixelTextX("1", 88, 0), 82);

console.log("pixel-font unit test passed");
