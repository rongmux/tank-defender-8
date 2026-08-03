const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/player-movement-surface-diagnostics");

const PLAYER_MOVEMENT_SURFACE_DIAGNOSTIC_METHODS = [
  "debugIceMovementProbe",
  "debugIceCoverRenderProbe",
  "debugForestPowerUpLayerProbe"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createPlayerMovementSurfaceDiagnostics(),
  /scope must be an object/
);

const api = diagnostics.createPlayerMovementSurfaceDiagnostics({});
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), PLAYER_MOVEMENT_SURFACE_DIAGNOSTIC_METHODS);

let renderCalls = 0;
const scope = {
  game: {
    grid: "previous-grid",
    base: "previous-base",
    players: ["previous-player"],
    enemies: ["previous-enemy"],
    bullets: ["previous-bullet"],
    powerUp: "previous-power-up",
    playerCount: 2
  },
  ICE: "ice",
  TILE: 16,
  makeGrid() {
    return "grid";
  },
  setTile(grid, x, y, type, mask) {
    assert.equal(grid, "grid");
    assert.equal(x, 6);
    assert.equal(y, 6);
    assert.equal(type, "ice");
    assert.equal(mask, 0);
  },
  renderGame() {
    renderCalls += 1;
  }
};
const renderApi = diagnostics.createPlayerMovementSurfaceDiagnostics(scope);
assert.deepEqual(renderApi.debugIceCoverRenderProbe(), {
  bulletColor: "#f8e08b",
  iceCoverColor: "rgba(241, 248, 255, 0.72)"
});
assert.equal(renderCalls, 1);
assert.deepEqual(scope.game, {
  grid: "previous-grid",
  base: "previous-base",
  players: ["previous-player"],
  enemies: ["previous-enemy"],
  bullets: ["previous-bullet"],
  powerUp: "previous-power-up",
  playerCount: 2
});

console.log("player-movement-surface-diagnostics unit test passed");
