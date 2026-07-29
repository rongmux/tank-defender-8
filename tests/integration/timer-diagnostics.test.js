const assert = require("assert").strict;
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const TIMER_DIAGNOSTIC_METHODS = [
  "debugTimerRuleProbe",
  "debugGlobalTimerCadenceProbe",
  "debugShieldCadenceProbe",
  "debugPausedShieldProbe",
  "debugTimerFreezeBehaviorProbe",
  "debugTimerFinalFrameFreezeProbe",
  "debugTimerSpawnDuringFreezeProbe"
];

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.timerDiagnostics, "timer diagnostics should register before game.js");
assert.equal(Object.isFrozen(modules.timerDiagnostics), true);
assert.deepEqual(
  JSON.parse(JSON.stringify(Object.keys(api).slice(67, 74))),
  TIMER_DIAGNOSTIC_METHODS
);

const outputs = Object.fromEntries(
  TIMER_DIAGNOSTIC_METHODS.map((name) => [name, api[name]()])
);
const json = JSON.stringify(outputs);
assert.equal(Buffer.byteLength(json), 2184);
assert.equal(
  crypto.createHash("sha256").update(json).digest("hex"),
  "351c57d19ca53645e641f1cca2a4777288e8692e4056842f34117cafc4d90430"
);

const debugSource = fs.readFileSync(path.join(root, "src/runtime/debug-api.js"), "utf8");
const detailedHarness = createBrowserGameHarness(root);
const detailedApi = detailedHarness.context.window.TankDefender8;
const globalTimerProbe = detailedApi.debugGlobalTimerCadenceProbe();
assert(globalTimerProbe.unitFrames === 64, "original long-duration timers should use 64-frame units");
assert(globalTimerProbe.boundaries.map((entry) => entry.active).join(",") === "false,false,true,false,false,true", "global timers should tick only when the low frame counter is zero modulo 64");
assert(globalTimerProbe.durations.helmet === 10 && globalTimerProbe.durations.timer === 10 && globalTimerProbe.durations.shovel === 20, "global timer probe should expose original item counter values");
assert(globalTimerProbe.timerDisplayFrames.phase0 === 640 && globalTimerProbe.timerDisplayFrames.phase63 === 577, "ten timer units should last 577 through 640 display frames depending on pickup phase");
assert(globalTimerProbe.spawnShieldDisplayFrames.phase0 === 192 && globalTimerProbe.spawnShieldDisplayFrames.phase63 === 129, "three shield units should last 129 through 192 display frames depending on activation phase");
const timerFinalFrameProbe = detailedApi.debugTimerFinalFrameFreezeProbe();
assert(timerFinalFrameProbe.after.activeEnemyX > timerFinalFrameProbe.before.activeEnemyX, "enemies should resume movement on the 64-frame boundary that expires the timer");
assert(timerFinalFrameProbe.after.activeEnemyReload === timerFinalFrameProbe.before.activeEnemyReload - 1, "enemy reload should resume on the timer expiration boundary");
assert(timerFinalFrameProbe.after.spawningEnemyFlash === timerFinalFrameProbe.before.spawningEnemyFlash - 1, "enemy spawn animation should resume on the timer expiration boundary");
assert(timerFinalFrameProbe.after.nextSpawn === timerFinalFrameProbe.before.nextSpawn - 1, "enemy spawn countdown should continue through timer expiration");
assert(timerFinalFrameProbe.after.bulletX > timerFinalFrameProbe.before.bulletX, "timer expiration should not affect player bullets");
assert(timerFinalFrameProbe.after.freezeTimer === 0, "timer should reach zero at the global 64-frame boundary before enemy updates");
const timerSpawnProbe = detailedApi.debugTimerSpawnDuringFreezeProbe();
assert(timerSpawnProbe.afterSpawn.enemyCount === 1 && timerSpawnProbe.afterSpawn.enemySpawned === 1, "timer should not block an enemy from spawning");
assert(timerSpawnProbe.afterSpawn.spawnedEnemyFlash === timerSpawnProbe.expectedSpawnFlash, "enemy spawned during timer should enter its normal spawn flash");
assert(timerSpawnProbe.afterFrozenFrame.spawnedEnemyFlash === timerSpawnProbe.afterSpawn.spawnedEnemyFlash - 1, "enemy spawn animation should continue while the timer is active");
assert(timerSpawnProbe.afterSpawnAnimation.spawnedEnemyFlash === 0 && timerSpawnProbe.afterSpawnAnimation.freezeTimer > 0, "an enemy should finish spawning before an active timer expires");
assert(timerSpawnProbe.afterFrozenActiveFrame.enemyX === timerSpawnProbe.afterSpawnAnimation.enemyX && timerSpawnProbe.afterFrozenActiveFrame.enemyY === timerSpawnProbe.afterSpawnAnimation.enemyY, "a newly active enemy should remain stationary while the timer is active");
assert(timerSpawnProbe.afterFrozenActiveFrame.enemyReload === timerSpawnProbe.afterSpawnAnimation.enemyReload, "a newly active enemy should keep its reload timer frozen");
assert(timerSpawnProbe.afterSpawnAnimation.enemyBulletCount === 0 && timerSpawnProbe.afterFrozenActiveFrame.enemyBulletCount === 0, "a newly active enemy should not fire while the timer is active");
const diagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/timer-diagnostics.js"),
  "utf8"
);
assert(debugSource.includes("...createTimerDiagnostics(state, deps)"));
assert.equal(diagnosticsSource.includes("eval("), false);
for (const name of TIMER_DIAGNOSTIC_METHODS) {
  assert.equal(debugSource.includes(`${name}(`), false);
  assert.equal(diagnosticsSource.includes(`${name}(`), true);
}
assert(debugSource.split(/\r?\n/).length < 3600);

console.log("timer-diagnostics integration test passed");
