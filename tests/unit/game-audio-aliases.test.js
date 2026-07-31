const assert = require("assert").strict;
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");
const source = fs.readFileSync(path.join(root, "src/game.js"), "utf8");
const startMarker = "// Audio methods are registered before this bridge and do not depend on a receiver.";
const endMarker = "// Deps module aliases";
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker, start);
assert(start >= 0 && end > start, "game.js should expose the direct audio reference block");

const block = source.slice(start, end);
const aliases = [...block.matchAll(/\bvar ([A-Za-z0-9_]+) = fn\.([A-Za-z0-9_]+);/g)];
assert.equal(aliases.length, 126, "all audio methods should use direct fn references");
assert.equal(new Set(aliases.map((match) => match[1])).size, aliases.length);
for (const [, localName, fnName] of aliases) {
  assert.equal(localName, fnName, `${localName} should reference the same state.fn method`);
}
assert(!/\bfunction\s+[A-Za-z0-9_]*Audio[A-Za-z0-9_]*\s*\(/.test(block), "audio aliases should not be forwarding functions");
assert(source.includes("playSound: fn.playSound"), "startup callbacks should use registered audio methods");
assert(source.includes("stopGameOverAudio: fn.stopGameOverAudio"), "post-game startup should use registered audio methods");

console.log("game-audio-aliases unit test passed");
