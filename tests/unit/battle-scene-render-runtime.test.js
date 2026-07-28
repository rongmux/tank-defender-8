const assert = require("assert").strict;
const runtime = require("../../src/runtime/battle-scene-render-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupBattleSceneRenderRuntime({}, {}, {}),
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
    grid: "grid",
    paused: true,
    players: [
      { id: 1, alive: true, respawn: 0, spawnFlash: 0, color: "p1", accent: "a1" },
      { id: 2, alive: true, respawn: 0, spawnFlash: 2, color: "p2", accent: "a2" },
      { id: 3, alive: false, respawn: 0, spawnFlash: 0 }
    ],
    enemies: [
      { id: 1, alive: true, destroying: false, spawnFlash: 0, accent: "e1" },
      { id: 2, alive: true, destroying: false, spawnFlash: 2, accent: "e2" },
      { id: 3, alive: true, destroying: true, spawnFlash: 0 },
      { id: 4, alive: false, destroying: false, spawnFlash: 0 }
    ],
    bullets: ["b1", "b2"],
    powerUp: "power"
  },
  fn: {}
};
const api = runtime.setupBattleSceneRenderRuntime(state, {
  sharedState: {
    SCREEN_W: 256,
    SCREEN_H: 240,
    FIELD_X: 16,
    FIELD_Y: 16,
    FIELD_W: 208,
    FIELD_H: 208
  }
}, {
  battleDisplayFrame() {
    calls.push(["displayFrame"]);
    return 16;
  },
  drawBullet(...args) {
    calls.push(["bullet", ...args]);
  },
  drawPowerUp(...args) {
    calls.push(["powerUp", ...args]);
  },
  drawShield(...args) {
    calls.push(["shield", ...args]);
  },
  drawSpawn(...args) {
    calls.push(["spawn", ...args]);
  },
  drawTank(...args) {
    calls.push(["tank", ...args]);
  },
  enemyColor(enemy) {
    calls.push(["enemyColor", enemy.id]);
    return `enemy-${enemy.id}`;
  },
  isPlayerShieldVisible(player, paused) {
    calls.push(["shieldVisible", player.id, paused]);
    return player.id === 1;
  },
  isPlayerTankVisible(player, frame) {
    calls.push(["tankVisible", player.id, frame]);
    return true;
  },
  renderBase() {
    calls.push(["base"]);
  },
  renderBaseDestruction() {
    calls.push(["baseDestruction"]);
  },
  renderEnemyDestructions() {
    calls.push(["enemyDestructions"]);
  },
  renderExplosions() {
    calls.push(["explosions"]);
  },
  renderPanel() {
    calls.push(["panel"]);
  },
  renderPlayerDestructions() {
    calls.push(["playerDestructions"]);
  },
  renderPlayerGameOverMessage() {
    calls.push(["playerGameOver"]);
  },
  renderProjectileTerrainCover(...args) {
    calls.push(["projectileCover", ...args]);
  },
  renderScorePopups() {
    calls.push(["scorePopups"]);
  },
  renderTerrain(...args) {
    calls.push(["terrain", ...args]);
  }
});

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), ["renderGame"]);
assert.equal(state.fn.renderGame, api.renderGame);

api.renderGame();
assert.deepEqual(calls, [
  ["fillRect", 0, 0, 256, 240],
  ["fillRect", 16, 16, 208, 208],
  ["terrain", false, "grid"],
  ["base"],
  ["shieldVisible", 1, true],
  ["shield", state.game.players[0]],
  ["displayFrame"],
  ["tankVisible", 1, 16],
  ["tank", state.game.players[0], "p1", "a1"],
  ["spawn", state.game.players[1]],
  ["enemyColor", 1],
  ["tank", state.game.enemies[0], "enemy-1", "e1"],
  ["spawn", state.game.enemies[1]],
  ["bullet", "b1"],
  ["bullet", "b2"],
  ["projectileCover", "grid"],
  ["terrain", true, "grid"],
  ["powerUp", "power"],
  ["explosions"],
  ["playerDestructions"],
  ["enemyDestructions"],
  ["baseDestruction"],
  ["scorePopups"],
  ["playerGameOver"],
  ["panel"]
]);

console.log("battle-scene-render-runtime unit test passed");
