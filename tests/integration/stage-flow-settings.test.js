const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;
const schema = JSON.parse(JSON.stringify(api.stagePackSchema()));

assert(modules.stageFlowSettings, "stage flow settings module should register before game.js");
assert.deepEqual(schema.gameSettings.stageAdvance, {
  loopAfterFinalStage: true,
  extendedLoopEndStage: 70,
  extendedLoopEnemyStage: 35
});
assert.deepEqual(schema.gameSettings.stageClearBonus, {
  points: 1000,
  twoPlayerOnly: true,
  requireStrictLead: true
});
const stage35Advance = JSON.parse(JSON.stringify(api.debugStageAdvanceProbe(35)));
const stage70Advance = JSON.parse(JSON.stringify(api.debugStageAdvanceProbe(70)));
assert.equal(stage35Advance.stage, 36);
assert.equal(stage35Advance.mapDataStage, 1);
assert.equal(stage35Advance.enemyDataStage, 35);
assert.equal(stage70Advance.stage, 1);
assert.equal(stage70Advance.wraps, true);
const defaultBonus = JSON.parse(JSON.stringify(api.debugStageClearBonusProbe(4, 3)));
assert.equal(defaultBonus.points, 1000);
assert.deepEqual(defaultBonus.recipients, [1]);

const customPack = {
  id: "stage-flow-settings-integration",
  totalStages: 1,
  maps: [schema.maps[0]],
  enemies: [schema.enemies[0].slice(0, 3)],
  gameSettings: {
    stageAdvance: { loopAfterFinalStage: false, extendedLoopEndStage: 80, extendedLoopEnemyStage: 34 },
    stageClearBonus: { points: 777, twoPlayerOnly: true, requireStrictLead: true }
  }
};
assert.equal(api.validateStagePack(customPack).ok, true);
assert.equal(api.loadStagePack(customPack), true);
const current = JSON.parse(JSON.stringify(api.currentPackInfo()));
assert.deepEqual(current.stageAdvance, customPack.gameSettings.stageAdvance);
assert.deepEqual(current.stageClearBonus, customPack.gameSettings.stageClearBonus);
const finiteAdvance = JSON.parse(JSON.stringify(api.debugStageAdvanceProbe()));
assert.equal(finiteAdvance.stage, 1);
assert.equal(finiteAdvance.stops, true);
const customBonus = JSON.parse(JSON.stringify(api.debugStageClearBonusProbe(4, 3)));
assert.equal(customBonus.points, 777);
assert.deepEqual(customBonus.recipients, [1]);
assert.deepEqual(JSON.parse(JSON.stringify(api.debugStageClearBonusProbe(4, 4).recipients)), []);
assert.deepEqual(JSON.parse(JSON.stringify(api.debugStageClearBonusProbe(4, 3, 0, 1).recipients)), []);

const invalidSettings = [
  { stageAdvance: { loopAfterFinalStage: "yes" } },
  { stageAdvance: { extendedLoopEndStage: 0 } },
  { stageClearBonus: { points: -1 } },
  { stageClearBonus: { requireStrictLead: "yes" } }
];
for (const [index, gameSettings] of invalidSettings.entries()) {
  const pack = { ...customPack, id: `bad-stage-flow-settings-${index}`, gameSettings };
  assert.equal(api.validateStagePack(pack).ok, false);
}

console.log("stage-flow-settings integration test passed");
