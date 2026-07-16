const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;
const clone = (value) => JSON.parse(JSON.stringify(value));

assert(modules.audioMixRules, "audio mix rules module should register before game.js");
assert.equal(Object.isFrozen(modules.audioMixRules), true);

const movement = clone(api.debugMovementAudioProbe());
assert.deepEqual(movement.modes, {
  title: "none",
  idleBattle: "enemy",
  stageStart: "none",
  bonusLifePulse2: "none",
  bonusLifePulse1Tail: "enemy",
  powerUpPickup: "none",
  powerUpAppear: "none",
  baseHit: "none",
  enemyHit: "none",
  pauseCue: "none",
  heldDirection: "player",
  heldDuringDeathState: "player",
  heldAfterTankRemoved: "enemy",
  paused: "none",
  clearDelay: "none",
  gameOver: "none"
});

const stageBonus = clone(api.debugStageBonusAudioLifecycleProbe());
assert.equal(stageBonus.bonusLifePriority.active, true);
assert.equal(stageBonus.bonusLifePriority.audible, false);
assert.equal(stageBonus.bonusLifePriority.bonusLifeActive, true);
assert.equal(stageBonus.bonusLifePriority.bonusLifeFrame, 0);

const brickHit = clone(api.debugBrickHitAudioLifecycleProbe());
assert.equal(brickHit.separateChannels.active, true);
assert.equal(brickHit.separateChannels.audible, true);
assert.equal(brickHit.separateChannels.steelHitAudible, true);
assert.equal(brickHit.separateChannels.playerShootAudible, true);
assert.equal(brickHit.stageStartPriority.active, true);
assert.equal(brickHit.stageStartPriority.audible, false);

const steelHit = clone(api.debugSteelHitAudioLifecycleProbe());
assert.equal(steelHit.separatePulseChannels.active, true);
assert.equal(steelHit.separatePulseChannels.audible, true);
assert.equal(steelHit.separatePulseChannels.playerShootAudible, true);
assert.equal(steelHit.appearancePriority.active, true);
assert.equal(steelHit.appearancePriority.audible, false);
assert.equal(steelHit.stageStartPriority.active, true);
assert.equal(steelHit.stageStartPriority.audible, false);

const enemyHit = clone(api.debugEnemyHitAudioLifecycleProbe());
assert.equal(enemyHit.separateChannels.active, true);
assert.equal(enemyHit.separateChannels.audible, true);
assert.equal(enemyHit.separateChannels.brickHitAudible, true);
assert.equal(enemyHit.separateChannels.playerShootAudible, true);
assert.equal(enemyHit.steelPriority.active, true);
assert.equal(enemyHit.steelPriority.audible, false);

const playerDestroy = clone(api.debugPlayerDestroyAudioLifecycleProbe());
assert.equal(playerDestroy.enemyBeforePriority.active, false);
assert.equal(playerDestroy.enemyBeforePriority.enemyDestroyAudible, true);
assert.equal(playerDestroy.playerPriority.active, true);
assert.equal(playerDestroy.playerPriority.enemyDestroyAudible, false);

const baseHit = clone(api.debugBaseHitAudioLifecycleProbe());
assert.equal(baseHit.lowerPriority.active, true);
assert.equal(baseHit.lowerPriority.audible, true);
assert.equal(baseHit.lowerPriority.steelHitAudible, false);
assert.equal(baseHit.lowerPriority.enemyHitAudible, false);
assert.equal(baseHit.lowerPriority.movementAudioMode, "none");
assert.equal(baseHit.appearancePriority.active, true);
assert.equal(baseHit.appearancePriority.audible, false);

const playerShoot = clone(api.debugPlayerShootAudioLifecycleProbe());
assert.equal(playerShoot.shotPriority.active, true);
assert.equal(playerShoot.shotPriority.iceActive, true);
assert.equal(playerShoot.shotPriority.iceAudible, false);
assert.equal(playerShoot.stageStartPriority.active, true);
assert.equal(playerShoot.stageStartPriority.audible, false);
assert.equal(playerShoot.bonusLifePriority.active, true);
assert.equal(playerShoot.bonusLifePriority.audible, false);

const movementIce = clone(api.debugMovementIceAudioLifecycleProbe());
assert.equal(movementIce.stageStartPriority.active, true);
assert.equal(movementIce.stageStartPriority.audible, false);
assert.equal(movementIce.stageStartPriority.movementAudioMode, "none");
assert.equal(movementIce.bonusLifePriority.active, true);
assert.equal(movementIce.bonusLifePriority.audible, false);
assert.equal(movementIce.bonusLifePriority.movementAudioMode, "none");

const powerUpPickup = clone(api.debugPowerUpPickupAudioLifecycleProbe());
assert.equal(powerUpPickup.suppressedStart.active, true);
assert.equal(powerUpPickup.suppressedStart.audible, false);

const powerUpAppear = clone(api.debugPowerUpAppearAudioLifecycleProbe());
assert.equal(powerUpAppear.stageStartPriority.audible, false);
assert.equal(powerUpAppear.bonusLifePriority.audible, false);
assert.equal(powerUpAppear.pickupPriority.audible, false);

console.log("audio-mix-rules integration test passed");
