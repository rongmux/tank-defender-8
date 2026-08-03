const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/player-movement-motion-diagnostics");

const PLAYER_MOVEMENT_MOTION_DIAGNOSTIC_METHODS = [
  "debugPlayerMovementCadenceProbe",
  "debugTankTrackAnimationProbe",
  "debugFriendlyFireDurationProbe",
  "debugFriendlyFireRefreshProbe",
  "debugPlayerStunProbe"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createPlayerMovementMotionDiagnostics(),
  /scope must be an object/
);

const scope = {
  game: { tick: 9 },
  gameSettings() {
    return {
      playerMovement: {
        speed: 7,
        frameCadence: [0, 1]
      },
      friendlyFire: {
        stunFrames: 4
      }
    };
  },
  isPlayerMovementFrame(tick) {
    return tick % 2 === 0;
  },
  isPlayerTankVisible(player, tick) {
    return player.stun === 0 || tick % 2 === 0;
  }
};

const api = diagnostics.createPlayerMovementMotionDiagnostics(scope);
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), PLAYER_MOVEMENT_MOTION_DIAGNOSTIC_METHODS);

const cadence = api.debugPlayerMovementCadenceProbe();
assert.equal(cadence.speed, 7);
assert.equal(cadence.activeFrames, 4);
assert.equal(cadence.distanceOverEightFrames, 28);
assert.equal(scope.game.tick, 9);

const friendlyFire = api.debugFriendlyFireDurationProbe();
assert.equal(friendlyFire.stunTicks, 4);
assert.equal(friendlyFire.displayFrames, 8);
assert.equal(friendlyFire.remaining, 0);

console.log("player-movement-motion-diagnostics unit test passed");
