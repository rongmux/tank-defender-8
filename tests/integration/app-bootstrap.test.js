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

(async () => {
  const harness = createBrowserGameHarness(root);
  const { animationFrameCallback, buttons, canvasContext, context, fileInput, listeners } = harness;
  const api = context.window.TankDefender8;

  assert(api, "the browser bootstrap should expose the public game API");
  assert.equal(Object.isFrozen(context.window.TankDefender8Modules.gameSessionRuntime), true);
  assert.equal(Object.isFrozen(context.window.TankDefender8Modules.highScoreRuntime), true);
  assert.equal(Object.isFrozen(context.window.TankDefender8Modules.playerSessionRuntime), true);
  assert.equal(Object.isFrozen(context.window.TankDefender8Modules.stageLifecycleRuntime), true);
  assert.equal(Object.isFrozen(context.window.TankDefender8Modules.titleFlowRuntime), true);
  assert.equal(Object.isFrozen(context.window.TankDefender8Modules.titleMenuRuntime), true);
  assert.equal(Object.isFrozen(context.window.TankDefender8Modules.inputCommandRuntime), true);
  assert.equal(Object.isFrozen(context.window.TankDefender8Modules.combatProjectileDiagnostics), true);
  assert.equal(Object.isFrozen(context.window.TankDefender8Modules.combatFireLimitDiagnostics), true);
  assert.equal(Object.isFrozen(context.window.TankDefender8Modules.combatCrossingDiagnostics), true);
  assert.equal(typeof animationFrameCallback, "function");
  for (const button of buttons) {
    assert.equal(typeof button.listeners.click, "function", `${button.dataset.action} should have a toolbar listener`);
  }

  canvasContext.calls.length = 0;
  animationFrameCallback(16);
  assert(canvasContext.calls.some((call) =>
    call.op === "fillRect" && call.style === "#e3c64e" && call.w === 4 && call.h === 10
  ), "the first rendered title frame should draw the menu cursor");

  buttons.find((button) => button.dataset.action === "one").click();
  assert.equal(api.debugSnapshot().screen, "stageSelectClosing");
  api.debugAdvanceStageTransition(16);
  keyPress(listeners, "Enter");
  assert.equal(api.debugSnapshot().screen, "stageIntro");

  canvasContext.calls.length = 0;
  animationFrameCallback(1000);
  assert(!canvasContext.calls.some((call) =>
    call.op === "strokeRect" && (call.style === "#f3f0d4" || call.style === "#e0b84b") && call.w <= 14 && call.h <= 14
  ), "stage intro loading should not draw player spawn sprites before preparation completes");
  const terrainPalette = new Set([
    "#a24f32", "#d38658", "#1b1512",
    "#626a76", "#c9d0d9", "#5a6370", "#333943",
    "#173b67", "#56a6d5", "#2d789e",
    "#b7c8d8", "#f1f8ff", "#7e96aa",
    "#315b34", "#3f7f42", "#244327", "#d8c17a", "#181818"
  ]);
  assert(canvasContext.calls.some((call) =>
    call.op === "fillRect" && terrainPalette.has(call.style) && call.w > 0 && call.h > 0
  ), "stage intro loading should render terrain from the sprite manifest");

  const remainingIntro = api.debugStageIntroCurtainProbe().remaining;
  api.debugAdvanceStageTransition(remainingIntro);
  canvasContext.calls.length = 0;
  animationFrameCallback(1017);
  assert(canvasContext.calls.some((call) =>
    call.op === "strokeRect" && (call.style === "#f3f0d4" || call.style === "#e0b84b") && call.w <= 14 && call.h <= 14
  ), "the prepared battle frame should render the player spawn sprite");
  assert(canvasContext.calls.some((call) =>
    call.op === "fillRect" && call.style === "#15161a" && call.w === 7 && call.h === 6
  ), "the prepared battle frame should render the reserve enemy counter");

  const schema = api.stagePackSchema();
  const importPack = {
    id: "app-bootstrap-import",
    totalStages: 1,
    enemyTotal: 20,
    maps: [schema.maps[0]],
    enemies: [schema.enemies[0]]
  };
  fileInput.files = [{
    async text() {
      return JSON.stringify(importPack);
    }
  }];
  fileInput.value = "app-bootstrap-import.json";
  await fileInput.listeners.change();
  assert.equal(api.currentPackInfo().id, importPack.id);
  assert.equal(fileInput.value, "", "file input value should clear after a successful import");

  console.log("app-bootstrap integration test passed");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
