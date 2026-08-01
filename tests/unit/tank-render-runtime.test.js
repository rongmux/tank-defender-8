const assert = require("assert").strict;
const runtime = require("../../src/runtime/tank-render-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupTankRenderRuntime({}, {}, {}),
  /state\.game must be an object/
);

const calls = [];
const state = {
  ctx: {
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 0,
    fillRect(...args) {
      calls.push(["fillRect", ...args]);
    },
    strokeRect(...args) {
      calls.push(["strokeRect", ...args]);
    }
  },
  game: { frameLow: 5 },
  fn: {}
};
const callbacks = {
  battleDisplayFrame() {
    calls.push(["displayFrame"]);
    return 12;
  },
  directionName(dir) {
    calls.push(["direction", dir]);
    return "right";
  },
  drawManifestSprite(...args) {
    calls.push(["sprite", ...args]);
  },
  drawScaledManifestSprite(...args) {
    calls.push(["scaled", ...args]);
  },
  gameSettings() {
    return { timings: { playerSpawnFlash: 28, enemySpawnFlash: 32 } };
  },
  playerUpgradeOverlayParts(level, dir) {
    calls.push(["overlayParts", level, dir]);
    return [
      { role: "level1", rect: [1, 2, 3, 4] },
      { role: "level3", rect: [5, 6, 7, 8] }
    ];
  },
  shieldColorForTick(frame) {
    calls.push(["shieldColor", frame]);
    return "#shield";
  },
  spawnAnimationPresentation(elapsed, total) {
    calls.push(["spawnPresentation", elapsed, total]);
    return { size: 10 };
  },
  tankPrimaryColor(tank, color, frame) {
    calls.push(["primary", tank.kind, color, frame]);
    return "#primary";
  },
  tankTrackFrameName(tank) {
    calls.push(["tracks", tank.trackPhase]);
    return "tracksB";
  }
};
const deps = {
  sharedState: { FIELD_X: 16, FIELD_Y: 8 },
  PLAYER_UPGRADE_OVERLAY_COLORS: {
    level1: "#level1",
    level2: "#level2",
    level3: "#level3"
  }
};
const api = runtime.setupTankRenderRuntime(state, deps, callbacks);

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), [
  "drawPlayerUpgradeOverlay",
  "drawShield",
  "drawSpawn",
  "drawTank",
  "drawTankForestOutline"
]);
assert.equal(state.fn.drawTank, api.drawTank);
assert.equal(state.fn.drawTankForestOutline, api.drawTankForestOutline);

const player = { kind: "player", x: 3.2, y: 4.7, dir: 2, level: 3, trackPhase: 1, spawnFlash: 0 };
api.drawTank(player, "#tank", "#accent");
assert.deepEqual(calls.slice(0, 8), [
  ["displayFrame"],
  ["primary", "player", "#tank", 12],
  ["direction", 2],
  ["sprite", "tank", "right", 19, 13, { primary: "#primary", accent: "#accent", shadow: "#111111" }],
  ["tracks", 1],
  ["sprite", "tankTracks", "tracksB", 19, 13, { primary: "#primary", shadow: "#111111" }],
  ["overlayParts", 3, 2],
  ["fillRect", 20, 15, 3, 4]
]);
assert.deepEqual(calls[8], ["fillRect", 24, 19, 7, 8]);

calls.length = 0;
const armorEnemy = { kind: "enemy", typeIndex: 3, x: 3.2, y: 4.7, dir: 2, trackPhase: 1 };
api.drawTank(armorEnemy, "#tank", "#accent");
assert(calls.some((call) => call[0] === "strokeRect" && call[1] === 22 && call[2] === 16 && call[3] === 8 && call[4] === 8));

calls.length = 0;
const powerEnemy = { kind: "enemy", typeIndex: 2, x: 3.2, y: 4.7, dir: 2, trackPhase: 1 };
api.drawTank(powerEnemy, "#tank", "#accent");
assert(calls.some((call) => call[0] === "fillRect" && call[1] === 28 && call[2] === 18 && call[3] === 5 && call[4] === 1));

calls.length = 0;
api.drawShield(player);
assert.deepEqual(calls, [
  ["shieldColor", 5],
  ["sprite", "shield", "box", 17, 11, { primary: "#shield" }]
]);

calls.length = 0;
api.drawSpawn(player);
assert.deepEqual(calls, [
  ["spawnPresentation", 0, 28],
  ["scaled", "spawn", "box", 21, 15, 10 / 14, { primary: "#f3f0d4" }]
]);

calls.length = 0;
api.drawTankForestOutline(player);
assert(calls.some((call) => call[0] === "strokeRect" && call[1] === 20 && call[2] === 14));

console.log("tank-render-runtime unit test passed");
