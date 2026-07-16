const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");

function keyPress(listeners, code) {
  listeners.keydown({
    code,
    repeat: false,
    shiftKey: false,
    preventDefault() {}
  });
  listeners.keyup({ code });
}

function finishStageSelectClosing(api) {
  if (api.debugSnapshot().screen === "stageSelectClosing") {
    api.debugAdvanceStageTransition(16);
  }
}

(async () => {
  const {
    buttons,
    canvas,
    clipboard,
    context,
    fileInput,
    listeners,
    storage
  } = createBrowserGameHarness(root);
  const modules = context.window.TankDefender8Modules;
  const api = context.window.TankDefender8;
  const action = (name) => buttons.find((button) => button.dataset.action === name);

  assert(modules.editorStageFormat, "editor stage format module should register before game.js");
  assert.equal(Object.isFrozen(modules.editorStageFormat), true);

  action("edit").click();
  action("clear").click();
  let snapshot = JSON.parse(JSON.stringify(api.debugSnapshot()));
  assert.deepEqual(snapshot.fieldGeometry, {
    x: 16,
    y: 16,
    width: 208,
    height: 208,
    panelX: 224,
    panelWidth: 32
  });
  keyPress(listeners, "Space");
  keyPress(listeners, "Space");
  keyPress(listeners, "ArrowRight");
  keyPress(listeners, "KeyF");
  keyPress(listeners, "KeyF");
  keyPress(listeners, "KeyD");
  keyPress(listeners, "KeyS");
  keyPress(listeners, "Digit2");
  canvas.listeners.click({
    clientX: 57,
    clientY: 57,
    shiftKey: false,
    altKey: false
  });

  action("save").click();
  const savedDocument = JSON.parse(storage["tank-defender-8-editor-stage"]);
  assert.equal(savedDocument.version, 2);
  assert.equal(savedDocument.quadrants[0].slice(0, 4), "...B");
  assert.equal(savedDocument.quadrants[5][5], "S");

  action("clear").click();
  action("load").click();
  snapshot = JSON.parse(JSON.stringify(api.debugSnapshot()));
  assert.equal(snapshot.editorQuadrants[0].slice(0, 4), "...B");
  assert.equal(snapshot.editorQuadrants[5][5], "S");

  await action("export").click();
  const exportedPack = JSON.parse(clipboard.text);
  assert.equal(exportedPack.id, "custom-stage");
  assert.equal(exportedPack.quadrants[0].length, 26);
  assert.equal(exportedPack.quadrants[0][0].length, 26);
  assert.equal(exportedPack.quadrants[0][0].slice(0, 4), "...B");
  assert.equal(exportedPack.quadrants[0][5][5], "S");
  assert.equal(exportedPack.stageSettings[0].powerUpSpawns.length, 16);

  action("import").click();
  assert.equal(fileInput.clicked, true);
  fileInput.files = [{
    async text() {
      return clipboard.text;
    }
  }];
  fileInput.value = "custom-stage.json";
  await fileInput.listeners.change();
  assert.equal(api.currentPackInfo().id, "custom-stage");
  assert.equal(fileInput.value, "");

  action("reset").click();
  action("edit").click();
  action("load").click();
  keyPress(listeners, "Enter");
  snapshot = JSON.parse(JSON.stringify(api.debugSnapshot()));
  assert.equal(snapshot.screen, "title");
  assert.equal(snapshot.stage, 1);
  assert.equal(snapshot.hasConstructedStage, true);

  action("one").click();
  finishStageSelectClosing(api);
  keyPress(listeners, "Enter");
  snapshot = JSON.parse(JSON.stringify(api.debugSnapshot()));
  assert.equal(snapshot.screen, "stageIntro");
  assert.equal(snapshot.constructionStageActive, true);
  assert.equal(snapshot.battleQuadrants[0].slice(0, 4), "...B");
  assert.equal(snapshot.battleQuadrants[5][5], "S");
  const constructionAdvance = api.debugStageClearAdvanceProbe(1);
  assert.equal(constructionAdvance.stage, 2);
  assert.equal(constructionAdvance.constructionStageActive, false);

  action("edit").click();
  action("load").click();
  action("test").click();
  snapshot = JSON.parse(JSON.stringify(api.debugSnapshot()));
  assert.equal(snapshot.players.length, 1);
  assert.deepEqual(snapshot.playerSpawns[0], { x: 4, y: 12 });
  assert.deepEqual(snapshot.powerUpSpawns[0], { x: 1, y: 1 });
  assert.equal(snapshot.players[0].stageKills.length, 4);
  assert.equal(snapshot.players[0].totalKills.length, 4);
  assert.equal(api.currentPackInfo().id, "custom-stage");

  action("reset").click();
  snapshot = JSON.parse(JSON.stringify(api.debugSnapshot()));
  assert.equal(api.currentPackInfo().id, "original-style");
  assert.equal(snapshot.screen, "title");
  assert.equal(snapshot.stage, 1);
  assert.equal(snapshot.stageCycleLimit, 70);
  assert.equal(snapshot.players.length, 0);
  assert.equal(snapshot.enemySpawned, 0);

  console.log("editor-stage-format integration test passed");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
