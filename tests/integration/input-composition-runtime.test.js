const assert = require("assert").strict;
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const source = fs.readFileSync(path.join(root, "src/game.js"), "utf8");

assert(modules.inputCompositionRuntime, "input composition runtime should register before game.js");
assert.equal(Object.isFrozen(modules.inputCompositionRuntime), true);
assert(source.includes('requireRuntimeModule("inputCompositionRuntime").setupInputCompositionRuntime'));
assert.equal((source.match(/setupInputRuntime\(state,/g) || []).length, 0);
assert.equal(typeof context.window.TankDefender8.debugSnapshot, "function");

console.log("input-composition-runtime integration test passed");
