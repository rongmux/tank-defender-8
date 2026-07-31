const assert = require("assert").strict;
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const source = fs.readFileSync(path.join(root, "src/game.js"), "utf8");

assert(modules.renderAdapterRuntime, "render adapter runtime should register before game.js");
assert.equal(Object.isFrozen(modules.renderAdapterRuntime), true);
assert(source.includes('requireRuntimeModule("renderAdapterRuntime").setupRenderAdapterRuntime'));
assert(source.includes("connectRenderCompositionRuntime(renderCompositionRuntime, battleSceneRenderRuntime)"));
assert.equal((source.match(/function renderTitle\s*\(/g) || []).length, 0);
assert.equal((source.match(/function renderTerrain\s*\(/g) || []).length, 0);

const pauseFrame = context.window.TankDefender8.debugRenderPauseFrame(15);
assert.equal(pauseFrame.frame, 15);

console.log("render-adapter-runtime integration test passed");
