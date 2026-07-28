const assert = require("assert").strict;
const runtime = require("../../src/runtime/battle-hud-render-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupBattleHudRenderRuntime({}, {}, {}),
  /state\.game must be an object/
);

const calls = [];
const state = {
  ctx: {
    fillStyle: "",
    fillRect(...args) {
      calls.push(["fillRect", ...args]);
    }
  },
  game: {
    enemySpawned: 1,
    players: [{ lives: 3 }, { lives: 1 }],
    playerCount: 2,
    stage: 7,
    freezeTimer: 4,
    gameOverTimer: 10,
    playerGameOverMessage: { playerId: 2, timer: 3, x: 40, y: 50 },
    paused: false,
    demoMode: false
  },
  fn: {}
};
const settings = { timings: { gameOverSlide: 127, gameOverHold: 129 } };
const api = runtime.setupBattleHudRenderRuntime(state, {
  sharedState: { PANEL_X: 208, SCREEN_W: 256, GAME_OVER_TEXT: "GAME OVER" },
  compactGameOverGlyph(char) {
    return char === "G" ? ["1"] : ["11"];
  },
  gameOverBannerPresentation(timer, options) {
    calls.push(["banner", timer, options]);
    return { y: 71 };
  },
  panelEnemyCounterRemaining(total, spawned) {
    return total - spawned;
  },
  panelLifeCount(player) {
    return player.lives - 1;
  },
  pausePresentation(frame) {
    return { visible: frame === 16, text: "PAUSE", x: 100, y: 128 };
  },
  playerGameOverMessagePresentation(message, options) {
    calls.push(["playerMessage", message, options]);
    return { visible: true, left: 20, y: 30 };
  }
}, {
  battleDisplayFrame() {
    return 16;
  },
  drawManifestSprite(...args) {
    calls.push(["sprite", ...args]);
  },
  drawScaledManifestSprite(...args) {
    calls.push(["scaled", ...args]);
  },
  drawText(...args) {
    calls.push(["text", ...args]);
  },
  enemyTotal() {
    return 4;
  },
  gameSettings() {
    return settings;
  }
});

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), [
  "drawCompactGameOverWord",
  "drawStageFlag",
  "gameOverBannerY",
  "panelEnemyCounterRemaining",
  "panelLifeCount",
  "pausePresentation",
  "playerGameOverMessagePresentation",
  "renderGameOver",
  "renderPanel",
  "renderPlayerGameOverMessage",
  "renderPause"
]);
assert.equal(state.fn.renderPanel, api.renderPanel);
assert.equal(api.panelEnemyCounterRemaining(), 3);
assert.equal(api.panelEnemyCounterRemaining(10, 3), 7);
assert.equal(api.panelLifeCount({ lives: 3 }), 2);

api.renderPanel();
assert.deepEqual(calls.slice(0, 6), [
  ["sprite", "enemyCounter", "remaining", 216, 24, { primary: "#15161a" }],
  ["sprite", "enemyCounter", "remaining", 224, 24, { primary: "#15161a" }],
  ["sprite", "enemyCounter", "remaining", 216, 32, { primary: "#15161a" }],
  ["sprite", "enemyCounter", "cleared", 224, 32, { primary: "#686c75" }],
  ["text", "1P", 216, 112, 1, "#15161a"],
  ["scaled", "miniTank", "up", 216, 124, 0.57, { primary: "#15161a", shadow: "#6b6f78" }]
]);
assert(calls.some((call) => call[0] === "text" && call[1] === "2P" && call[2] === 216));
assert(calls.some((call) => call[0] === "text" && call[1] === "TM" && call[2] === 216));

calls.length = 0;
api.renderGameOver();
assert.deepEqual(calls, [
  ["banner", 10, { slideFrames: 127, holdFrames: 129 }],
  ["text", "GAME OVER", 102, 71, 1, "#f05a42"]
]);

calls.length = 0;
api.renderPause();
assert.deepEqual(calls, [["text", "PAUSE", 100, 128, 1, "#f3f0d4"]]);

calls.length = 0;
api.renderPlayerGameOverMessage();
assert.equal(calls[0][0], "playerMessage");
assert(calls.some((call) => call[0] === "fillRect"));

calls.length = 0;
api.drawStageFlag(10, 20);
assert.deepEqual(calls, [
  ["fillRect", 10, 20, 2, 15],
  ["fillRect", 12, 21, 10, 7],
  ["fillRect", 14, 23, 6, 3]
]);

console.log("battle-hud-render-runtime unit test passed");
