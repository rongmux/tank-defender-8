const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { buttons, context, listeners, source } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;
const action = (name) => buttons.find((button) => button.dataset.action === name);

assert(modules.builtInStagePack, "built-in stage pack module should register before game.js");
assert.equal(Object.isFrozen(modules.builtInStagePack), true);

const pack = modules.builtInStagePack.createBuiltInStagePack();
const schema = JSON.parse(JSON.stringify(api.stagePackSchema()));
assert.deepEqual(schema.enemyTypes, JSON.parse(JSON.stringify(pack.enemyTypes)));
assert.deepEqual(schema.gameSettings, JSON.parse(JSON.stringify(pack.gameSettings)));

const names = pack.enemyTypes.map((enemyType) => enemyType.name);
const expectedGroups = JSON.parse(JSON.stringify(
  modules.enemySequences.summarizeEnemySequences(pack.enemies, names)
));
assert.deepEqual(JSON.parse(JSON.stringify(api.debugOriginalEnemyGroupsProbe())), expectedGroups);

action("one").click();
api.debugAdvanceStageTransition(16);
listeners.keydown({ code: "Enter", repeat: false, shiftKey: false, preventDefault() {} });
listeners.keyup({ code: "Enter" });
const snapshot = JSON.parse(JSON.stringify(api.debugSnapshot()));
assert.equal(snapshot.screen, "stageIntro");
const preparedGrid = modules.stageGrid.cloneGrid(pack.createGrid(1));
modules.battlefieldGrid.prepareBattleGrid(preparedGrid);
assert.deepEqual(
  snapshot.battleQuadrants,
  JSON.parse(JSON.stringify(modules.stageGrid.gridToQuadrants(preparedGrid)))
);

assert(source.includes('builtInStagePack'));
assert(source.includes('deps.createBuiltInStagePack'));
assert(!source.includes("const builtInStagePack = {"));

console.log("built-in-stage-pack integration test passed");
