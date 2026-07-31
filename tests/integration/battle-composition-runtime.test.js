const assert = require("assert").strict;
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const source = fs.readFileSync(path.join(root, "src/game.js"), "utf8");

assert(modules.battleCompositionRuntime, "battle composition runtime should register before game.js");
assert.equal(Object.isFrozen(modules.battleCompositionRuntime), true);
assert(source.includes('requireRuntimeModule("battleCompositionRuntime").setupBattleCompositionRuntime'));
assert.equal((source.match(/setupTankMovementRuntime\(state, deps\)/g) || []).length, 0);

const pauseProbe = context.window.TankDefender8.debugPauseBehaviorProbe();
assert.equal(pauseProbe.pausedUpdate.tick, 15);

console.log("battle-composition-runtime integration test passed");
