const assert = require("assert").strict;
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const POWER_UP_DIAGNOSTIC_METHODS = [
  "debugPowerUpTypePoolProbe",
  "debugBattleRandomProbe",
  "debugPowerUpFlashCadenceProbe",
  "debugPausedPowerUpVisualProbe",
  "debugWaterAnimationCadenceProbe",
  "debugPowerUpTtlProbe",
  "debugPowerUpPickupBoundaryProbe",
  "debugPowerUpPickupPriorityProbe",
  "debugPowerUpPickupRenderProbe",
  "debugPowerUpFootprintClearProbe",
  "debugPowerUpTerrainMutationProbe",
  "debugPowerUpSpawnTerrainProbe",
  "debugPowerUpSpawnRandomProbe",
  "debugPowerUpSpawnRotationProbe",
  "debugCarrierSpawnClearsPowerUpProbe"
];

const root = path.resolve(__dirname, "../..");
const { context, canvasContext } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.powerUpDiagnostics, "power-up diagnostics should register before game.js");
assert.equal(Object.isFrozen(modules.powerUpDiagnostics), true);
assert.equal(Object.isFrozen(modules.powerUpPresentationDiagnostics), true);
assert.equal(Object.isFrozen(modules.powerUpSpawnDiagnostics), true);
assert.deepEqual(
  JSON.parse(JSON.stringify(Object.keys(api).slice(75, 90))),
  POWER_UP_DIAGNOSTIC_METHODS
);

const outputs = Object.fromEntries(
  POWER_UP_DIAGNOSTIC_METHODS.map((name) => [name, api[name]()])
);
const json = JSON.stringify(outputs);
assert.equal(Buffer.byteLength(json), 7420);
assert.equal(
  crypto.createHash("sha256").update(json).digest("hex"),
  "e0af19122317cf100882ed36619614462c89429036c27695f51c161ab8392faf"
);

const debugSource = fs.readFileSync(path.join(root, "src/runtime/debug-api.js"), "utf8");
const detailedHarness = createBrowserGameHarness(root);
const detailedApi = detailedHarness.context.window.TankDefender8;
const detailedCanvasContext = detailedHarness.canvasContext;
detailedCanvasContext.calls.length = 0;
detailedCanvasContext.resetPixels();
const pickupRenderProbe = detailedApi.debugPowerUpPickupRenderProbe();
assert(pickupRenderProbe.powerUpType === null, "collected power-up should be cleared from game state");
assert(pickupRenderProbe.playerLevel === 1, "star pickup should still apply after clearing the power-up object");
assert(pickupRenderProbe.playerScore === pickupRenderProbe.pickupScore, "power-up pickup should still award score");
assert(pickupRenderProbe.popup.style === "powerUp" && pickupRenderProbe.popup.ttl === 49, "power-up pickup should create the original-style fixed score state for 49 visible frames");
assert(pickupRenderProbe.popup.x === pickupRenderProbe.powerCenter.x && pickupRenderProbe.popup.y === pickupRenderProbe.powerCenter.y, "power-up score should remain centered on the collected item position");
assert(pickupRenderProbe.pickupAudio.active && pickupRenderProbe.pickupAudio.frame === 0 && pickupRenderProbe.pickupAudio.audible, "an ordinary star pickup should start the audible thirty-nine-frame pickup event");
assert(pickupRenderProbe.presentation.x === pickupRenderProbe.laterPresentation.x && pickupRenderProbe.presentation.y === pickupRenderProbe.laterPresentation.y, "power-up score should not drift while its timer counts down");
assert(pickupRenderProbe.presentation.color === "#f7f1c6" && pickupRenderProbe.laterPresentation.color === "#f7f1c6", "power-up score should use one stable palette color instead of flashing");
assert(pickupRenderProbe.presentation.width === 15 && pickupRenderProbe.presentation.advance === 5, "the three-digit pickup score should use a compact width close to the original two-sprite graphic");
assert(pickupRenderProbe.visibleFrames === 49, "power-up score should remain visible for exactly 49 rendered frame states");
assert(!detailedCanvasContext.calls.some((call) =>
  call.op === "strokeRect" &&
  call.x === pickupRenderProbe.drawRect.x &&
  call.y === pickupRenderProbe.drawRect.y &&
  call.w === pickupRenderProbe.drawRect.w &&
  call.h === pickupRenderProbe.drawRect.h
), "rendering immediately after pickup should not draw the collected power-up frame");
detailedCanvasContext.calls.length = 0;
detailedCanvasContext.resetPixels();
const footprintProbe = detailedApi.debugPowerUpFootprintClearProbe();
const footprintColors = detailedCanvasContext.pixelColors(footprintProbe.drawRect);
assert(footprintProbe.powerUpType === null, "collected power-up should stay cleared after applying its effect");
assert(footprintProbe.playerLevel === 1, "footprint probe should still apply the star effect");
assert(footprintProbe.playerScore === footprintProbe.pickupScore, "footprint probe should award the pickup score");
assert(footprintColors["#315b34"] > 0, "collected power-up footprint should redraw the terrain underneath");
assert(!footprintColors["#101114"], "collected power-up footprint should not leave its black backing");
assert(!footprintColors["#f3f0d4"], "collected power-up footprint should not leave its border");
assert(!footprintColors["#e0b84b"], "collected power-up footprint should not leave its sprite color");
assert(footprintColors["#f7f1c6"] > 0, "collected power-up footprint should contain the fixed pickup-score pixels");
const terrainMutationProbe = detailedApi.debugPowerUpTerrainMutationProbe();
assert(terrainMutationProbe.length === 6, "terrain mutation probe should cover all six original power-up types");
assert(terrainMutationProbe.every((entry) => entry.beforeIce === entry.afterIce && entry.addedIce.length === 0), "collecting any power-up must never add ice terrain");
assert(terrainMutationProbe.filter((entry) => entry.type !== "shovel").every((entry) => entry.changes.length === 0), "non-shovel power-ups must not mutate terrain cells");
const shovelTerrainMutation = terrainMutationProbe.find((entry) => entry.type === "shovel");
assert(shovelTerrainMutation.changes.length === 5, "shovel should change only the five original base-wall cells");
assert(shovelTerrainMutation.changes.every((change) => change.before === "brick" && change.after === "steel"), "shovel base-wall changes should be brick-to-steel, never ice");
assert(shovelTerrainMutation.expiredIce === shovelTerrainMutation.beforeIce, "shovel flashing and expiry must preserve all existing ice cells without adding any");
assert(shovelTerrainMutation.expiryChanges.length === 0, "shovel expiry should restore the five base-wall cells to their original brick state");
const powerUpTypePoolProbe = detailedApi.debugPowerUpTypePoolProbe();
assert(powerUpTypePoolProbe.starFrameParts >= 8 && powerUpTypePoolProbe.starPrimaryParts >= 5, "star power-up should use a recognizable multi-part frame");
const powerUpFlashProbe = detailedApi.debugPowerUpFlashCadenceProbe();
assert(powerUpFlashProbe.slice(0, 8).every((frame) => frame.visible === false), "uncollected power-ups should be hidden for the first eight-frame band");
assert(powerUpFlashProbe.slice(8, 16).every((frame) => frame.visible === true), "uncollected power-ups should be visible for the second eight-frame band");
assert(powerUpFlashProbe.slice(16, 24).every((frame) => frame.visible === false), "power-up visibility should repeat with another eight hidden frames");
assert(powerUpFlashProbe.slice(24, 32).every((frame) => frame.visible === true), "power-up visibility should repeat with another eight visible frames");
const pausedPowerUpVisualProbe = detailedApi.debugPausedPowerUpVisualProbe();
assert(pausedPowerUpVisualProbe.initial.displayFrame === 7 && pausedPowerUpVisualProbe.initial.powerUpVisible === false, "a paused power-up should start from the current battle display phase");
assert(pausedPowerUpVisualProbe.afterOneFrame.tick === 7 && pausedPowerUpVisualProbe.afterOneFrame.displayFrame === 8 && pausedPowerUpVisualProbe.afterOneFrame.powerUpVisible === true, "paused display frames should keep an uncollected power-up flashing without advancing battle time");
assert(pausedPowerUpVisualProbe.afterNineFrames.displayFrame === 16 && pausedPowerUpVisualProbe.afterNineFrames.powerUpVisible === false, "paused power-up flashing should repeat across the next eight-frame boundary");
assert(pausedPowerUpVisualProbe.initial.waterFrame === pausedPowerUpVisualProbe.afterNineFrames.waterFrame, "water should remain in the same 32-frame animation band across these nine paused frames");
assert(pausedPowerUpVisualProbe.afterResume.tick === 23 && pausedPowerUpVisualProbe.afterResume.displayFrame === 16, "resumed power-up animation should retain the independently advanced NMI-style display phase");
const waterAnimationProbe = detailedApi.debugWaterAnimationCadenceProbe();
assert(waterAnimationProbe.map((entry) => entry.frame).join(",") === "waterA,waterA,waterB,waterB,waterA,waterA,waterB", "water animation should switch on bit five of the global frame counter");
const diagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/power-up-diagnostics.js"),
  "utf8"
);
const presentationDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/power-up-presentation-diagnostics.js"),
  "utf8"
);
const spawnDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/power-up-spawn-diagnostics.js"),
  "utf8"
);
assert(debugSource.includes("...createPowerUpDiagnostics(state, deps)"));
assert.equal(diagnosticsSource.includes("eval("), false);
assert.equal(presentationDiagnosticsSource.includes("eval("), false);
assert.equal(spawnDiagnosticsSource.includes("eval("), false);
for (const name of POWER_UP_DIAGNOSTIC_METHODS) {
  assert.equal(debugSource.includes(`${name}(`), false);
  assert.equal(
    diagnosticsSource.includes(`${name}(`) ||
      presentationDiagnosticsSource.includes(`${name}(`) ||
      spawnDiagnosticsSource.includes(`${name}(`),
    true
  );
}
assert(debugSource.split(/\r?\n/).length < 3050);

console.log("power-up-diagnostics integration test passed");
