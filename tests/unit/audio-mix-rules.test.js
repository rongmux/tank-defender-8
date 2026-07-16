const assert = require("assert").strict;
const audioMixRules = require("../../src/audio/audio-mix-rules");

const {
  isMovementAudioBlocked,
  resolveAudioAudibility,
  resolveMovementAudioMode
} = audioMixRules;

function state(overrides = {}) {
  return {
    screen: "playing",
    paused: false,
    clearPendingTimer: 0,
    baseDestroyTimer: 0,
    bonusLifePulse1Active: false,
    bonusLifePulse2Active: false,
    playerMovementRequested: false,
    active: {},
    ...overrides,
    active: { ...(overrides.active || {}) }
  };
}

assert.equal(Object.isFrozen(audioMixRules), true);
assert.deepEqual(resolveAudioAudibility(), {
  stageStartAudibility: [true, true, true],
  bonusLifeAudibility: [true, true],
  powerUpPickupAudible: true,
  powerUpAppearAudible: true,
  brickHitAudible: true,
  baseHitAudible: true,
  steelHitAudible: true,
  enemyHitAudible: true,
  enemyDestroyAudible: true,
  playerShootAudible: true,
  movementIceAudible: true,
  stageBonusAudible: true
});

const pauseCue = resolveAudioAudibility(state({ active: { pause: true } }));
assert.deepEqual(pauseCue.stageStartAudibility, [true, true, false]);
assert.deepEqual(pauseCue.bonusLifeAudibility, [true, false]);
assert.equal(pauseCue.powerUpPickupAudible, false);
assert.equal(pauseCue.powerUpAppearAudible, false);
assert.equal(pauseCue.baseHitAudible, false);
assert.equal(pauseCue.steelHitAudible, false);
assert.equal(pauseCue.enemyHitAudible, false);
assert.equal(pauseCue.brickHitAudible, true);
assert.equal(pauseCue.enemyDestroyAudible, true);
assert.equal(pauseCue.playerShootAudible, true);

const paused = resolveAudioAudibility(state({ paused: true }));
assert.equal(paused.brickHitAudible, false);
assert.equal(paused.powerUpPickupAudible, true);

const stageStart = resolveAudioAudibility(state({ active: { stageStart: true } }));
assert.equal(stageStart.powerUpPickupAudible, false);
assert.equal(stageStart.powerUpAppearAudible, false);
assert.equal(stageStart.brickHitAudible, false);
assert.equal(stageStart.baseHitAudible, false);
assert.equal(stageStart.steelHitAudible, false);
assert.equal(stageStart.enemyHitAudible, false);
assert.equal(stageStart.playerShootAudible, false);
assert.equal(stageStart.movementIceAudible, false);
assert.equal(stageStart.enemyDestroyAudible, true);
assert.equal(stageStart.stageBonusAudible, true);

const bonusPulseOne = resolveAudioAudibility(state({ bonusLifePulse1Active: true }));
assert.equal(bonusPulseOne.playerShootAudible, false);
assert.equal(bonusPulseOne.movementIceAudible, false);
assert.equal(bonusPulseOne.powerUpPickupAudible, true);

const bonusPulseTwo = resolveAudioAudibility(state({ bonusLifePulse2Active: true }));
assert.equal(bonusPulseTwo.powerUpPickupAudible, false);
assert.equal(bonusPulseTwo.powerUpAppearAudible, false);
assert.equal(bonusPulseTwo.baseHitAudible, false);
assert.equal(bonusPulseTwo.steelHitAudible, false);
assert.equal(bonusPulseTwo.enemyHitAudible, false);
assert.equal(bonusPulseTwo.stageBonusAudible, false);
assert.equal(bonusPulseTwo.playerShootAudible, true);

const pickup = resolveAudioAudibility(state({ active: { powerUpPickup: true } }));
assert.equal(pickup.powerUpPickupAudible, true);
assert.equal(pickup.powerUpAppearAudible, false);
assert.equal(pickup.baseHitAudible, false);
assert.equal(pickup.steelHitAudible, false);
assert.equal(pickup.enemyHitAudible, false);

const appearance = resolveAudioAudibility(state({ active: { powerUpAppear: true } }));
assert.equal(appearance.powerUpAppearAudible, true);
assert.equal(appearance.baseHitAudible, false);
assert.equal(appearance.steelHitAudible, false);
assert.equal(appearance.enemyHitAudible, false);

const baseHit = resolveAudioAudibility(state({ active: { baseHit: true } }));
assert.equal(baseHit.baseHitAudible, true);
assert.equal(baseHit.steelHitAudible, false);
assert.equal(baseHit.enemyHitAudible, false);

const steelHit = resolveAudioAudibility(state({ active: { steelHit: true } }));
assert.equal(steelHit.steelHitAudible, true);
assert.equal(steelHit.enemyHitAudible, false);

assert.equal(
  resolveAudioAudibility(state({ active: { playerDestroy: true } })).enemyDestroyAudible,
  false
);
assert.equal(
  resolveAudioAudibility(state({ active: { playerShoot: true } })).movementIceAudible,
  false
);

const idleBattle = state();
assert.equal(isMovementAudioBlocked(idleBattle), false);
assert.equal(resolveMovementAudioMode(idleBattle), "enemy");
assert.equal(resolveMovementAudioMode(state({ playerMovementRequested: true })), "player");
assert.equal(
  resolveMovementAudioMode(state({ playerMovementRequested: true, baseDestroyTimer: 1 })),
  "enemy"
);

const movementBlockers = [
  { screen: "title" },
  { paused: true },
  { clearPendingTimer: 1 },
  { bonusLifePulse2Active: true },
  { active: { stageStart: true } },
  { active: { powerUpPickup: true } },
  { active: { powerUpAppear: true } },
  { active: { baseHit: true } },
  { active: { steelHit: true } },
  { active: { enemyHit: true } },
  { active: { pause: true } }
];
for (const blocker of movementBlockers) {
  const blockedState = state({ ...blocker, playerMovementRequested: true });
  assert.equal(isMovementAudioBlocked(blockedState), true);
  assert.equal(resolveMovementAudioMode(blockedState), "none");
}

assert.equal(
  resolveMovementAudioMode(state({
    bonusLifePulse1Active: true,
    playerMovementRequested: true,
    active: { playerShoot: true }
  })),
  "player"
);

console.log("audio-mix-rules unit test passed");
