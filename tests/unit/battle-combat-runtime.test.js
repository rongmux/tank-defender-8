const assert = require("assert").strict;
const runtime = require("../../src/runtime/battle-combat-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupBattleCombatRuntime({}, {}, {}),
  /state\.game must be an object/
);

const events = [];
const player = {
  id: 1,
  kind: "player",
  alive: true,
  destroying: false,
  invuln: 0,
  level: 0,
  lives: 1,
  nextBonusLifeIndex: 0,
  score: 0,
  stageKills: [0],
  stagePoints: 0,
  totalKills: [0]
};
const partner = { id: 2, lives: 2 };
const state = {
  game: {
    demoMode: false,
    enemies: [],
    frameLow: 0,
    playerGameOverMessage: null,
    players: [player, partner],
    screen: "playing"
  },
  fn: {}
};
const settings = {
  bonusLifeScores: [10],
  deathPowerLevel: 0,
  timings: { playerRespawn: 3 }
};
const api = runtime.setupBattleCombatRuntime(state, {
  addScorePoints(currentPlayer, points) {
    const previousScore = currentPlayer.score;
    currentPlayer.score += points;
    return { previousScore, nextScore: currentPlayer.score };
  },
  awardBonusLives(currentPlayer, previousScore, nextScore, thresholds) {
    if (previousScore < thresholds[0] && nextScore >= thresholds[0]) {
      currentPlayer.lives += 1;
      return 1;
    }
    return 0;
  },
  beginPlayerDestructionState(currentPlayer, options) {
    events.push(["begin", currentPlayer.id, options]);
    if (!currentPlayer.alive || currentPlayer.invuln > 0) return false;
    currentPlayer.alive = false;
    currentPlayer.respawn = 0;
    return true;
  },
  resolvePlayerDeathState(currentPlayer) {
    events.push(["resolve", currentPlayer.id]);
    if (currentPlayer.forceEliminate) return { eliminated: true, lives: 0 };
    currentPlayer.lives = Math.max(0, currentPlayer.lives - 1);
    return { eliminated: false, lives: currentPlayer.lives };
  },
  sharedState: {
    PLAYER_GAME_OVER_MESSAGE_HIDDEN_Y: 240,
    PLAYER_GAME_OVER_MESSAGE_MOVE_THRESHOLD: 10,
    PLAYER_GAME_OVER_MESSAGE_TIMER: 13,
    PLAYER_GAME_OVER_MESSAGE_Y: 216
  }
}, {
  explosionRule(name) {
    return { ttl: name === "enemyDestroy" ? 18 : 24 };
  },
  gameSettings() {
    return settings;
  },
  playSound(name) {
    events.push(["sound", name]);
  },
  resetFrameCounterLow() {
    events.push(["reset-low"]);
  },
  resetPlayerPosition(currentPlayer) {
    events.push(["reset", currentPlayer.id]);
    currentPlayer.alive = true;
  },
  updateHighScore(score) {
    events.push(["high-score", score]);
  }
});

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), [
  "destroyEnemy",
  "addPlayerScore",
  "killPlayer",
  "finishPlayerDeath",
  "startPlayerGameOverMessage",
  "playerGameOverMessageActive",
  "updatePlayerGameOverMessage"
]);
assert.equal(state.fn.destroyEnemy, api.destroyEnemy);
assert.equal(state.fn.updatePlayerGameOverMessage, api.updatePlayerGameOverMessage);

api.addPlayerScore(player, 5);
assert.equal(player.score, 5);
assert.deepEqual(events, [["high-score", 5]]);
api.addPlayerScore(player, 5);
assert.equal(player.lives, 2);
assert.deepEqual(events.slice(-2), [["high-score", 10], ["sound", "bonusLife"]]);

events.length = 0;
const enemy = {
  alive: true,
  carrier: false,
  destroying: false,
  score: 100,
  stagePoints: 0,
  typeIndex: 0
};
api.destroyEnemy(enemy, 1);
assert.equal(enemy.destroying, true);
assert.equal(enemy.destroyTicks, 0);
assert.equal(enemy.destroyExplosionTicks, 18);
assert.equal(enemy.destroyShowScore, true);
assert.equal(player.score, 110);
assert.equal(player.stagePoints, 100);
assert.equal(player.stageKills[0], 1);
assert.equal(player.totalKills[0], 1);
assert.deepEqual(events, [["high-score", 110]]);

events.length = 0;
player.alive = true;
player.forceEliminate = false;
api.killPlayer(player);
assert.equal(player.alive, true);
assert.deepEqual(events.map((event) => event[0]), ["begin", "sound", "resolve", "reset"]);

events.length = 0;
player.alive = true;
player.forceEliminate = true;
api.killPlayer(player);
assert.equal(api.playerGameOverMessageActive(), true);
assert.deepEqual(state.game.playerGameOverMessage, {
  playerId: 1,
  timer: 13,
  x: 32,
  y: 216,
  dx: 1
});
assert.deepEqual(events.map((event) => event[0]), ["begin", "sound", "resolve", "reset-low"]);

api.updatePlayerGameOverMessage();
assert.equal(state.game.playerGameOverMessage.timer, 12);
assert.equal(state.game.playerGameOverMessage.x, 33);
state.game.playerGameOverMessage.timer = 1;
api.updatePlayerGameOverMessage();
assert.equal(state.game.playerGameOverMessage.timer, 0);
assert.equal(state.game.playerGameOverMessage.y, 240);
assert.equal(api.playerGameOverMessageActive(), false);

console.log("battle-combat-runtime unit test passed");
