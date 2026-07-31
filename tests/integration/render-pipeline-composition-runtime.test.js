const assert = require("assert").strict;
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const source = fs.readFileSync(path.join(root, "src/game.js"), "utf8");

assert(modules.renderPipelineCompositionRuntime, "render pipeline composition runtime should register before game.js");
assert.equal(Object.isFrozen(modules.renderPipelineCompositionRuntime), true);
assert(source.includes('requireRuntimeModule("renderPipelineCompositionRuntime").setupRenderPipelineCompositionRuntime'));
assert.equal((source.match(/setupRenderCompositionRuntime\(state,\s*deps/g) || []).length, 0);
assert.equal((source.match(/setupBattleSceneRenderRuntime\(state,\s*deps/g) || []).length, 0);
assert.equal(typeof context.window.TankDefender8.debugSnapshot, "function");

console.log("render-pipeline-composition-runtime integration test passed");
