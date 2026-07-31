const assert = require("assert").strict;
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");
const source = fs.readFileSync(path.join(root, "src/game.js"), "utf8");
const applicationFlowSource = fs.readFileSync(
  path.join(root, "src/runtime/application-flow-composition-runtime.js"),
  "utf8"
);
const inputCompositionSource = fs.readFileSync(
  path.join(root, "src/runtime/input-composition-runtime.js"),
  "utf8"
);
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
assert(applicationFlowSource.includes("playSound: fn.playSound"), "startup callbacks should use registered audio methods");
assert(applicationFlowSource.includes("stopGameOverAudio: fn.stopGameOverAudio"), "post-game startup should use registered audio methods");

const runtimeStartMarker = "// Runtime methods are referenced only after all extracted modules register them.";
const runtimeEndMarker = 'requireRuntimeModule("inputCompositionRuntime")';
const runtimeStart = source.indexOf(runtimeStartMarker);
const runtimeEnd = source.indexOf(runtimeEndMarker, runtimeStart);
assert(runtimeStart >= 0 && runtimeEnd > runtimeStart, "game.js should expose the deferred runtime reference block");
const runtimeBlock = source.slice(runtimeStart, runtimeEnd);
const runtimeAliases = [...runtimeBlock.matchAll(/\bvar ([A-Za-z0-9_]+) = fn\.([A-Za-z0-9_]+);/g)];
assert.equal(runtimeAliases.length, 1, "only the main-loop high-score method should remain as a local runtime reference");
assert.equal(new Set(runtimeAliases.map((match) => match[1])).size, runtimeAliases.length);
for (const [, localName, fnName] of runtimeAliases) {
  assert.equal(localName, fnName, `${localName} should reference the same state.fn method`);
}
assert(!/\bfunction\s+[A-Za-z0-9_]+\s*\(/.test(runtimeBlock), "runtime aliases should not be forwarding functions");
assert(inputCompositionSource.includes("activateTitleMenu: fn.activateTitleMenu"), "input callbacks should use registered state.fn methods");
assert(inputCompositionSource.includes("stageEnemiesCleared: function () { return fn.stageEnemiesCleared(); }"), "dynamic input callbacks should preserve state.fn lookup");

console.log("game-audio-aliases unit test passed");
