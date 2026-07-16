const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { canvasContext, context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.tankPresentation, "tank presentation module should register before game.js");
assert.equal(Object.isFrozen(modules.tankPresentation), true);

const spawn = JSON.parse(JSON.stringify(api.debugSpawnAnimationCadenceProbe()));
assert.equal(spawn.playerDuration, 28);
assert.equal(spawn.enemyDuration, 28);
assert.equal(spawn.playerDisplayFrames, 28);
assert.equal(spawn.enemyDisplayFrames, 28);
assert.equal(spawn.beforeSkippedCadenceFrame, 28);
assert.equal(spawn.afterSkippedCadenceFrame, 27);
assert.deepEqual(spawn.lows, [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13
]);
assert.deepEqual(spawn.phases, [
  3, 3, 2, 2, 1, 1, 0, 0, 0, 1, 1, 2, 2, 3,
  3, 3, 2, 2, 1, 1, 0, 0, 0, 1, 1, 2, 2, 3
]);
assert.deepEqual(spawn.sizes, [
  14, 14, 11, 11, 8, 8, 6, 6, 6, 8, 8, 11, 11, 14,
  14, 14, 11, 11, 8, 8, 6, 6, 6, 8, 8, 11, 11, 14
]);

const carrier = JSON.parse(JSON.stringify(api.debugCarrierFlashProbe()));
assert.equal(carrier.flashColor, carrier.flashColorValue);
assert.equal(carrier.normalPhaseColor, carrier.baseColor);
assert.equal(carrier.phaseFrames, modules.tankPresentation.CARRIER_FLASH_PHASE_FRAMES);

const pausedTank = JSON.parse(JSON.stringify(api.debugPausedTankVisualProbe()));
assert.equal(pausedTank.initial.displayFrame, 7);
assert.equal(pausedTank.initial.carrierColor, pausedTank.initial.carrierFlashColor);
assert.equal(pausedTank.initial.stunnedVisible, true);
assert.equal(pausedTank.afterOneFrame.tick, 7);
assert.equal(pausedTank.afterOneFrame.displayFrame, 8);
assert.equal(pausedTank.afterOneFrame.carrierColor, pausedTank.afterOneFrame.carrierBaseColor);
assert.equal(pausedTank.afterOneFrame.stunnedVisible, false);
assert.equal(pausedTank.afterNineFrames.displayFrame, 16);
assert.equal(pausedTank.afterNineFrames.carrierColor, pausedTank.afterNineFrames.carrierFlashColor);
assert.equal(pausedTank.afterNineFrames.stunnedVisible, true);
assert.equal(pausedTank.afterResume.tick, 23);
assert.equal(pausedTank.afterResume.displayFrame, 16);

const shield = JSON.parse(JSON.stringify(api.debugShieldCadenceProbe()));
assert.equal(shield.every((entry) => entry.visible), true);
assert.deepEqual(shield.map((entry) => entry.color), [
  "#78d9ff",
  "#78d9ff",
  "#ffffff",
  "#ffffff",
  "#78d9ff",
  "#78d9ff",
  "#ffffff",
  "#ffffff"
]);
const pausedShield = JSON.parse(JSON.stringify(api.debugPausedShieldProbe()));
assert.equal(pausedShield.activeVisible, true);
assert.equal(pausedShield.pausedVisible, false);
assert.equal(pausedShield.afterPausedUpdate.tick, pausedShield.beforePausedUpdate.tick);
assert.equal(pausedShield.afterPausedUpdate.invuln, pausedShield.beforePausedUpdate.invuln);
assert.equal(pausedShield.afterPausedUpdate.pauseElapsed, 1);
assert.equal(pausedShield.resumedVisible, true);
assert.equal(pausedShield.expiredVisible, false);

const starVisualLevels = [0, 1, 2, 3].map((level) => {
  canvasContext.calls.length = 0;
  const probe = api.debugPlayerUpgradeVisualProbe(level);
  return {
    ...probe,
    maxPowerDraws: canvasContext.calls.filter(
      (call) => call.op === "fillRect" && call.style === probe.maxPowerColor
    ).length
  };
});
assert.equal(starVisualLevels[0].overlayParts, 0);
assert.equal(new Set(starVisualLevels.map((probe) => probe.overlaySignature)).size, 4);
assert.equal(starVisualLevels[3].maxPowerParts > 0, true);
assert.equal(starVisualLevels[3].maxPowerDraws, starVisualLevels[3].maxPowerParts);

canvasContext.calls.length = 0;
canvasContext.resetPixels();
const tracks = JSON.parse(JSON.stringify(api.debugTankTrackAnimationProbe()));
assert.deepEqual(tracks.frames, ["verticalA", "verticalB", "horizontalA", "horizontalB"]);
assert.deepEqual(tracks.player.initial, { x: 32, phase: 0, frame: "horizontalA" });
assert.equal(tracks.player.moved.x, 33);
assert.equal(tracks.player.moved.phase, 1);
assert.equal(tracks.player.blocked.x, 0);
assert.equal(tracks.player.blocked.phase, 0);
assert.equal(tracks.player.idle.phase, tracks.player.blocked.phase);
assert.equal(tracks.player.iceCoast.x, 33);
assert.equal(tracks.player.iceCoast.slide, 1);
assert.equal(tracks.player.iceCoast.phase, 1);
assert.equal(tracks.enemy.moved.x, 33);
assert.equal(tracks.enemy.moved.phase, 1);
assert.equal(tracks.enemy.blocked.phase, 0);
assert.equal(tracks.enemy.blocked.blockedPauseTicks, 2);
assert.equal(tracks.render.frame, "verticalB");
assert.equal(canvasContext.pixelColors({
  x: tracks.render.x + 1,
  y: tracks.render.y + 3,
  w: 2,
  h: 2
})[tracks.render.primary], 4);
assert.equal(canvasContext.pixelColors({
  x: tracks.render.x + 1,
  y: tracks.render.y + 9,
  w: 2,
  h: 2
})[tracks.render.shadow], 4);

const stun = JSON.parse(JSON.stringify(api.debugFriendlyFireDurationProbe()));
assert.equal(stun.stunTicks, 200);
assert.equal(stun.displayFrames, 267);
assert.equal(stun.remaining, 0);
assert.deepEqual(stun.visibility.map((frame) => frame.visible), [true, true, false, false, true]);

console.log("tank-presentation integration test passed");
