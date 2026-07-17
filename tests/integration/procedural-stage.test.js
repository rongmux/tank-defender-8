const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");

function startBuiltInStage(stage) {
  const harness = createBrowserGameHarness(root);
  const { buttons, context, listeners } = harness;
  const api = context.window.TankDefender8;
  const action = (name) => buttons.find((button) => button.dataset.action === name);
  const press = (code) => {
    listeners.keydown({ code, repeat: false, shiftKey: false, preventDefault() {} });
    listeners.keyup({ code });
  };

  action("one").click();
  api.debugAdvanceStageTransition(16);
  for (let selected = 1; selected < stage; selected += 1) {
    press("Space");
    api.debugAdvanceStageSelect(1);
  }
  press("Enter");

  return harness;
}

for (const stage of [1, 2]) {
  const { context, source } = startBuiltInStage(stage);
  const modules = context.window.TankDefender8Modules;
  const snapshot = JSON.parse(JSON.stringify(context.window.TankDefender8.debugSnapshot()));

  assert(modules.proceduralStage, "procedural stage module should register before game.js");
  assert.equal(Object.isFrozen(modules.proceduralStage), true);
  assert.equal(snapshot.screen, "stageIntro");
  assert.equal(snapshot.stage, stage);
  assert.deepEqual(
    snapshot.battleQuadrants,
    JSON.parse(JSON.stringify(modules.stageGrid.gridToQuadrants(
      modules.proceduralStage.buildProceduralStage(stage)
    )))
  );
  assert(source.includes('requireRuntimeModule("proceduralStage")'));
}

console.log("procedural-stage integration test passed");
