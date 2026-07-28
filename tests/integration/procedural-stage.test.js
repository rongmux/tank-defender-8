const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context, source } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;

assert(modules.proceduralStage, "procedural stage module should register before game.js");
assert.equal(Object.isFrozen(modules.proceduralStage), true);

const builtInStagePack = modules.builtInStagePack.createBuiltInStagePack();
const fallbackPack = {
  totalStages: 1,
  gameSettings: builtInStagePack.gameSettings,
  enemyTypes: builtInStagePack.enemyTypes,
  enemies: [[]]
};
const state = { stagePack: fallbackPack, stage: 1, playerCount: 1, demoMode: false };
const runtime = modules.stageRuntime.createStageRuntime({
  getState: () => state,
  builtInStagePack
});

const fallbackRows = modules.stageGrid.gridToRows(runtime.createStageGrid(1));
const proceduralRows = modules.stageGrid.gridToRows(modules.proceduralStage.buildProceduralStage(1));
assert.deepEqual(fallbackRows, proceduralRows);
assert.notDeepEqual(
  fallbackRows,
  modules.stageGrid.gridToRows(modules.originalStageData.buildOriginalStageGrid(1))
);
assert(source.includes('createStageRuntime'));

console.log("procedural-stage integration test passed");
