const assert = require("assert").strict;
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const source = fs.readFileSync(path.join(root, "src/game.js"), "utf8");

assert(modules.applicationFlowCompositionRuntime, "application flow composition runtime should register before game.js");
assert.equal(Object.isFrozen(modules.applicationFlowCompositionRuntime), true);
assert(source.includes('requireRuntimeModule("applicationFlowCompositionRuntime").setupApplicationFlowCompositionRuntime'));
assert.equal((source.match(/setupGameLifecycle\(state, deps\)/g) || []).length, 0);
assert.equal(typeof context.window.TankDefender8.debugSnapshot, "function");

console.log("application-flow-composition-runtime integration test passed");
