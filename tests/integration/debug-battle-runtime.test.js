const assert = require("assert").strict;
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const source = fs.readFileSync(path.join(root, "src/game.js"), "utf8");

assert(modules.debugBattleRuntime, "debug battle runtime should register before game.js");
assert.equal(Object.isFrozen(modules.debugBattleRuntime), true);
assert(source.includes('requireRuntimeModule("debugBattleRuntime").setupDebugBattleRuntime'));
assert.equal((source.match(/function preparePausedDebugBattle\s*\(/g) || []).length, 0);

const pauseSafeEffect = context.window.TankDefender8.debugBulletImpactExplosionProbe();
assert.equal(pauseSafeEffect.afterPause, pauseSafeEffect.beforePause);

console.log("debug-battle-runtime integration test passed");
