const assert = require("assert").strict;
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const WALL_DIAGNOSTIC_METHODS = [
  "debugSteelRuleProbe",
  "debugBrickWallPowerProbe",
  "debugBrickFragmentRenderProbe",
  "debugShovelWallProbe",
  "debugShovelDestroyedBaseProbe"
];

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.wallDiagnostics, "wall diagnostics should register before game.js");
assert.equal(Object.isFrozen(modules.wallDiagnostics), true);
assert.deepEqual(
  JSON.parse(JSON.stringify(Object.keys(api).slice(51, 56))),
  WALL_DIAGNOSTIC_METHODS
);

const outputs = {
  debugSteelRuleProbe: api.debugSteelRuleProbe(),
  debugBrickWallPowerProbe: api.debugBrickWallPowerProbe(),
  debugBrickFragmentRenderProbe: api.debugBrickFragmentRenderProbe(),
  debugShovelWallProbe: api.debugShovelWallProbe(),
  debugShovelDestroyedBaseProbe: api.debugShovelDestroyedBaseProbe()
};
const json = JSON.stringify(outputs);
assert.equal(Buffer.byteLength(json), 1929);
assert.equal(
  crypto.createHash("sha256").update(json).digest("hex"),
  "3430a548ec0870d2576cd6e769a0584b8caa7b2e2ca3f161df46fc5ceb97cfe3"
);

const debugSource = fs.readFileSync(path.join(root, "src/runtime/debug-api.js"), "utf8");
const detailedHarness = createBrowserGameHarness(root);
const detailedApi = detailedHarness.context.window.TankDefender8;
const detailedCanvasContext = detailedHarness.canvasContext;
const detailedSchema = detailedApi.stagePackSchema();
assert(detailedSchema.wallRules.brickSameSideHits === 4, "normal shots should need four same-side brick hits");
assert(detailedSchema.wallRules.poweredBrickSameSideHits === 2, "powered shots should need two same-side brick hits");
assert(detailedSchema.wallRules.brickFragmentSize === 4, "brick collision state should use original four-pixel fragments");
assert(detailedSchema.wallRules.normalBrickStripLength === 8 && detailedSchema.wallRules.normalBrickStripDepth === 4, "normal bullets should peel one 8x4 brick strip per hit");
assert(detailedSchema.wallRules.steelRequiredPower === 3, "steel should require max-power shots");
assert(detailedSchema.wallRules.steelSameSideHits === 1, "max-power shots should remove one steel subtile on every hit");
const brickPowerProbe = detailedApi.debugBrickWallPowerProbe();
assert(brickPowerProbe.integration.hit && brickPowerProbe.integration.bulletRemoved, "the live terrain resolver should consume a bullet that hits a brick fragment");
assert(brickPowerProbe.integration.mask === 15 && brickPowerProbe.integration.brickMask === 65518, "the live terrain resolver should remove one 4x8 strip without dropping the containing 8x8 subtile");
assert(brickPowerProbe.integration.explosions === 1, "a live brick-fragment hit should create one impact explosion");
detailedCanvasContext.resetPixels();
const brickFragmentRenderProbe = detailedApi.debugBrickFragmentRenderProbe();
const removedBrickPixels = detailedCanvasContext.pixelColors(brickFragmentRenderProbe.removed);
const remainingBrickPixels = detailedCanvasContext.pixelColors(brickFragmentRenderProbe.remaining);
assert(removedBrickPixels["#000000"] === 32, "the removed 4x8 brick strip should render entirely as battlefield background");
assert(Object.keys(remainingBrickPixels).some((color) => color !== "#000000" && color !== "null"), "the adjacent 4x8 brick strip should remain visibly rendered");
const diagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/wall-diagnostics.js"),
  "utf8"
);
assert(debugSource.includes("...createWallDiagnostics(state, deps)"));
assert.equal(diagnosticsSource.includes("eval("), false);
for (const name of WALL_DIAGNOSTIC_METHODS) {
  assert.equal(debugSource.includes(`${name}(`), false);
  assert.equal(diagnosticsSource.includes(`${name}(`), true);
}
assert(debugSource.split(/\r?\n/).length < 4000);

console.log("wall-diagnostics integration test passed");
