const assert = require("assert").strict;
const diagnostics = require("../../src/runtime/panel-diagnostics");

const PANEL_DIAGNOSTIC_METHODS = [
  "debugEnemyPanelCounterProbe",
  "debugPanelLifeCountProbe"
];

assert.equal(Object.isFrozen(diagnostics), true);
assert.throws(
  () => diagnostics.createPanelDiagnostics(),
  /state must be an object/
);
assert.throws(
  () => diagnostics.createPanelDiagnostics({}, {}),
  /state\.game must be an object/
);
assert.throws(
  () => diagnostics.createPanelDiagnostics({ game: {} }, {}),
  /state\.fn must be an object/
);
assert.throws(
  () => diagnostics.createPanelDiagnostics({ game: {}, fn: {} }, null),
  /deps must be an object/
);
assert.throws(
  () => diagnostics.createPanelDiagnostics({ game: {}, fn: {} }, {}),
  /deps\.sharedState must be an object/
);

const state = {
  game: {},
  fn: {
    label: "state-fn",
    panelEnemyCounterRemaining(total, spawned) {
      return { receiver: this.label, total, spawned };
    },
    panelLifeCount(player) {
      return { receiver: this.label, lives: player.lives };
    }
  }
};
const deps = {
  DEFAULT_ENEMY_TOTAL: 20,
  sharedState: {},
  label: "deps",
  panelEnemyCounterRemaining() {
    return "wrong receiver";
  },
  panelLifeCount() {
    return "wrong receiver";
  }
};

const api = diagnostics.createPanelDiagnostics(state, deps);
assert.equal(Object.isFrozen(api), true);
assert.deepEqual(Object.keys(api), PANEL_DIAGNOSTIC_METHODS);
assert.deepEqual(api.debugEnemyPanelCounterProbe(4, 2), {
  spawned: 4,
  killed: 2,
  remaining: { receiver: "state-fn", total: 20, spawned: 4 }
});
assert.deepEqual(api.debugEnemyPanelCounterProbe(-1, "bad", -4), {
  spawned: 0,
  killed: 0,
  remaining: { receiver: "state-fn", total: 0, spawned: 0 }
});
assert.deepEqual(api.debugPanelLifeCountProbe(3), {
  internalLives: 3,
  panelLives: { receiver: "state-fn", lives: 3 }
});

console.log("panel-diagnostics unit test passed");
