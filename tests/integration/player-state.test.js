const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const harness = createBrowserGameHarness(root);
const { context, buttons, listeners } = harness;
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;
const schema = JSON.parse(JSON.stringify(api.stagePackSchema()));

function press(code) {
  listeners.keydown({ code, repeat: false, shiftKey: false, preventDefault() {} });
  listeners.keyup({ code });
}

function startFromToolbar(action) {
  buttons.find((button) => button.dataset.action === action).click();
  api.debugAdvanceStageTransition(16);
  press("Enter");
  return JSON.parse(JSON.stringify(api.debugSnapshot()));
}

assert(modules.playerState, "player state module should register before game.js");
assert.equal(Object.isFrozen(modules.playerState), true);
assert(modules.playerUpdateRuntime, "player update runtime should register before game.js");
assert.equal(Object.isFrozen(modules.playerUpdateRuntime), true);
assert(modules.battleTimingRuntime, "battle timing runtime should register before game.js");
assert.equal(Object.isFrozen(modules.battleTimingRuntime), true);
assert(modules.battleRandomRuntime, "battle random runtime should register before game.js");
assert.equal(Object.isFrozen(modules.battleRandomRuntime), true);

const defaultRespawn = JSON.parse(JSON.stringify(api.debugPlayerDeathRespawnProbe()));
assert.equal(defaultRespawn.deathTicks, 24);
assert.equal(defaultRespawn.spawnTicks, 28);
assert.deepEqual(defaultRespawn.afterHit, {
  alive: false,
  destroying: true,
  lives: 2,
  level: schema.gameSettings.deathPowerLevel,
  respawn: 24,
  spawnFlash: 0,
  invuln: 0
});
assert.equal(defaultRespawn.deathDisplayFrames, 32);
assert.equal(defaultRespawn.destructionExplosionFrames, 24);
assert.equal(defaultRespawn.destructionFinalFrames, 8);
assert.deepEqual(defaultRespawn.destructionPhases, [1, 2, 3, 4, 5, 3, 1]);
assert.equal(defaultRespawn.deathResolved.alive, true);
assert.equal(defaultRespawn.deathResolved.destroying, false);
assert.equal(defaultRespawn.deathResolved.lives, 1);
assert.equal(defaultRespawn.deathResolved.spawnFlash, 28);
assert.equal(defaultRespawn.deathResolved.invuln, 0);
assert.equal(defaultRespawn.spawnDisplayFrames, 28);
assert.equal(defaultRespawn.totalDisplayFrames, 60);
assert.equal(defaultRespawn.activated.spawnFlash, 0);
assert.equal(defaultRespawn.activated.invuln, schema.gameSettings.timings.playerInvulnerability);
assert.deepEqual(defaultRespawn.lastLife, {
  displayFrames: 32,
  alive: false,
  destroying: false,
  lives: 0,
  respawn: 0
});

const customPack = {
  id: "player-state-integration",
  totalStages: 1,
  maps: [schema.maps[0]],
  enemies: [schema.enemies[0].slice(0, 3)],
  stageSettings: [{
    playerSpawns: [{ x: 3, y: 12 }, { x: 9, y: 12 }]
  }],
  gameSettings: {
    initialLives: 5,
    playerMovement: { speed: 1.5, frameCadence: [true] },
    timings: { playerSpawnFlash: 7, playerInvulnerability: 11 }
  }
};
assert.equal(api.loadStagePack(customPack), true);

const onePlayer = startFromToolbar("one");
assert.equal(onePlayer.screen, "stageIntro");
assert.equal(onePlayer.players.length, 1);
assert.equal(onePlayer.players[0].id, 1);
assert.equal(onePlayer.players[0].x, 3 * 16 + 1);
assert.equal(onePlayer.players[0].y, 12 * 16 + 1);
assert.equal(onePlayer.players[0].lives, 5);
assert.equal(onePlayer.players[0].speed, 1.5);
assert.equal(onePlayer.players[0].spawnFlash, 7);
assert.equal(onePlayer.players[0].invuln, 0);
assert.deepEqual(onePlayer.players[0].stageKills, [0, 0, 0, 0]);
assert.deepEqual(onePlayer.players[0].totalKills, [0, 0, 0, 0]);

const respawn = JSON.parse(JSON.stringify(api.debugPlayerDeathRespawnProbe()));
assert.equal(respawn.deathResolved.spawnFlash, 7);
assert.equal(respawn.deathResolved.invuln, 0);
assert.equal(respawn.spawnDisplayFrames, 7);
assert.equal(respawn.activated.spawnFlash, 0);
assert.equal(respawn.activated.invuln, 11);

assert.equal(api.loadStagePack(customPack), true);
const twoPlayers = startFromToolbar("two");
assert.equal(twoPlayers.players.length, 2);
assert.equal(twoPlayers.players[0].x, 3 * 16 + 1);
assert.equal(twoPlayers.players[1].x, 9 * 16 + 1);
assert.equal(twoPlayers.players[1].lives, 5);
assert.equal(twoPlayers.players[1].speed, 1.5);
assert.deepEqual(twoPlayers.players[1].stageKills, [0, 0, 0, 0]);

console.log("player-state integration test passed");
