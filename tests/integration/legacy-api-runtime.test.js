const assert = require("assert").strict;
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const source = fs.readFileSync(path.join(root, "src/game.js"), "utf8");

assert(modules.legacyApiRuntime, "legacy API runtime should register before game.js");
assert.equal(Object.isFrozen(modules.legacyApiRuntime), true);
assert(source.includes('requireRuntimeModule("legacyApiRuntime").setupLegacyApiRuntime'));
assert.equal((source.match(/state\.fn\.[A-Za-z0-9_]+\s*=/g) || []).length, 0);
assert(typeof context.window.TankDefender8.render === "undefined");
assert.equal(typeof context.window.TankDefender8.debugSnapshot, "function");

console.log("legacy-api-runtime integration test passed");
