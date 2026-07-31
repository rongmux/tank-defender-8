const assert = require("assert").strict;
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const source = fs.readFileSync(path.join(root, "src/game.js"), "utf8");

assert(modules.legacyApiCompositionRuntime, "legacy API composition runtime should register before game.js");
assert.equal(Object.isFrozen(modules.legacyApiCompositionRuntime), true);
assert(source.includes('requireRuntimeModule("legacyApiCompositionRuntime").setupLegacyApiCompositionRuntime'));
assert.equal((source.match(/setupLegacyApiRuntime\(state,\s*\{/g) || []).length, 0);
assert.equal(typeof context.window.TankDefender8.debugSnapshot, "function");

console.log("legacy-api-composition-runtime integration test passed");
