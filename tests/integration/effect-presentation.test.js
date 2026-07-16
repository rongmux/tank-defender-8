const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { canvasContext, context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.effectPresentation, "effect presentation module should register before game.js");
assert.equal(Object.isFrozen(modules.effectPresentation), true);

const impact = JSON.parse(JSON.stringify(api.debugBulletImpactExplosionProbe()));
assert.equal(Object.values(impact.ruleTtls).every((ttl) => ttl === 9), true);
assert.equal(impact.beforePause, 9);
assert.equal(impact.afterPause, 9);
assert.deepEqual(impact.frames.map((frame) => frame.ttl), [9, 8, 7, 6, 5, 4, 3, 2, 1]);
assert.deepEqual(impact.frames.map((frame) => frame.phase), [0, 0, 0, 1, 1, 1, 2, 2, 2]);
assert.deepEqual(impact.frames.map((frame) => frame.size), [8, 8, 8, 12, 12, 12, 16, 16, 16]);

const tanks = JSON.parse(JSON.stringify(api.debugTankDestructionExplosionProbe()));
const collapsePhases = (frames) => frames
  .map((frame) => frame.phase)
  .filter((phase, index, phases) => index === 0 || phase !== phases[index - 1]);
assert.equal(tanks.enemy.length, 18);
assert.equal(tanks.player.length, 24);
assert.equal(tanks.enemy.every((frame) => frame.style === "enemyDestroy"), true);
assert.equal(tanks.player.every((frame) => frame.style === "playerDestroy"), true);
assert.deepEqual(collapsePhases(tanks.enemy), [1, 2, 3, 4, 5, 3]);
assert.deepEqual(collapsePhases(tanks.player), [1, 2, 3, 4, 5, 3, 1]);
assert.equal(tanks.player.slice(0, 18).every((frame) => frame.kind === "explosion"), true);
assert.equal(tanks.player.slice(18).every((frame) => frame.kind === "final" && frame.phase === 1), true);
assert.equal(tanks.enemy.every((frame) => frame.frameName === `phase${frame.phase}`), true);
assert.equal(tanks.player.every((frame) => frame.frameName === `phase${frame.phase}`), true);
assert.equal(tanks.enemy.every((frame) => frame.phase >= 4
  ? frame.width === 32 && frame.height === 32
  : frame.width === 16 && frame.height === 8), true);
assert.equal(tanks.player.every((frame) => frame.phase >= 4
  ? frame.width === 32 && frame.height === 32
  : frame.width === 16 && frame.height === 8), true);

const tankSignatures = [1, 2, 3, 4, 5].map((phase) => {
  canvasContext.calls.length = 0;
  const sample = tanks.enemy.find((frame) => frame.phase === phase);
  const presentation = api.debugRenderTankDestructionExplosionFrame("enemyDestroy", sample.elapsed);
  const signature = canvasContext.calls
    .filter((call) => call.op === "fillRect" && (call.style === "#f0b546" || call.style === "#f7f1c6"))
    .map((call) => `${call.style}:${call.x},${call.y},${call.w},${call.h}`)
    .join("|");
  return { phase: presentation.phase, signature };
});
assert.deepEqual(tankSignatures.map((entry) => entry.phase), [1, 2, 3, 4, 5]);
assert.equal(new Set(tankSignatures.map((entry) => entry.signature)).size, 5);
canvasContext.calls.length = 0;
const smallTank = JSON.parse(JSON.stringify(api.debugRenderTankDestructionExplosionFrame("enemyDestroy", 0)));
const smallTankCalls = canvasContext.calls.filter(
  (call) => call.op === "fillRect" && call.style === "#f0b546"
);
assert.deepEqual({
  x: smallTank.x,
  y: smallTank.y,
  width: smallTank.width,
  height: smallTank.height
}, { x: 72, y: 72, width: 16, height: 8 });
assert.deepEqual({
  x: Math.min(...smallTankCalls.map((call) => call.x)),
  y: Math.min(...smallTankCalls.map((call) => call.y)),
  right: Math.max(...smallTankCalls.map((call) => call.x + call.w)),
  bottom: Math.max(...smallTankCalls.map((call) => call.y + call.h))
}, { x: 72, y: 72, right: 88, bottom: 80 });

const score = JSON.parse(JSON.stringify(api.debugScorePopupProbe()));
assert.equal(score.enemyPopup, null);
assert.equal(score.enemyScoreAward.score, score.armorScore);
assert.equal(score.enemyScoreAward.stagePoints, score.armorScore);
assert.equal(score.enemyScoreAward.stageKills.reduce((total, count) => total + count, 0), 1);
assert.equal(score.enemyPresentation.kind, "score");
assert.equal(Number(score.enemyPresentation.text), score.armorScore);
const pausedScore = JSON.parse(JSON.stringify(api.debugPausedScorePopupProbe()));
assert.equal(pausedScore.afterOneFrame.tick, 27);
assert.equal(pausedScore.afterOneFrame.ttl, 1);
assert.equal(pausedScore.afterTwoFrames.tick, 27);
assert.equal(pausedScore.afterTwoFrames.popupCount, 0);

const base = JSON.parse(JSON.stringify(api.debugBaseDestructionSequenceProbe()));
assert.equal(base.entry.hit, true);
assert.equal(base.entry.baseAlive, false);
assert.equal(base.entry.bulletRemoved, true);
assert.equal(base.entry.duration, 39);
assert.equal(base.entry.timer, 39);
assert.equal(base.entry.presentation, null);
assert.equal(base.entry.explosionCount, 0);
assert.equal(base.pauseAccepted, false);
assert.equal(base.playerEndX, base.playerStartX);
assert.equal(base.playerBulletCount, 0);
assert.equal(base.bulletEndX > base.bulletStartX, true);
assert.equal(base.enemyEndFlash, base.enemyStartFlash - 39);
assert.deepEqual(base.frames.slice(0, 35).map((frame) => frame.phase), [
  1, 1, 1,
  2, 2, 2, 2,
  3, 3, 3, 3,
  4, 4, 4, 4,
  5, 5, 5, 5,
  4, 4, 4, 4,
  3, 3, 3, 3,
  2, 2, 2, 2,
  1, 1, 1, 1
]);
assert.equal(base.frames.slice(0, 35).every((frame) => frame.frameName === `phase${frame.phase}`), true);
assert.equal(base.frames.slice(0, 35).every((frame) => frame.phase >= 4
  ? frame.width === 32 && frame.height === 32
  : frame.width === 16 && frame.height === 8), true);
assert.equal(base.frames.slice(35).every((frame) =>
  frame.phase === 0 && frame.width === 0 && frame.height === 0 && frame.frameName === null
), true);
assert.equal(base.frames[26].movementAudioMode, "enemy");
assert.equal(base.frames.some((frame) => frame.movementAudioMode === "player"), false);
assert.equal(base.frames.slice(0, 38).every((frame) => frame.screen === "playing"), true);
assert.equal(base.frames[38].screen, "gameOver");
assert.equal(base.gameOverTimer, 256);

canvasContext.calls.length = 0;
assert.equal(api.debugRenderBaseDestructionFrame(39), null);
assert.equal(canvasContext.calls.some((call) => call.op === "fillRect" && call.style === "#f05a42"), false);
canvasContext.calls.length = 0;
const small = JSON.parse(JSON.stringify(api.debugRenderBaseDestructionFrame(38)));
const smallCalls = canvasContext.calls.filter((call) => call.op === "fillRect" && call.style === "#f05a42");
const smallBounds = {
  x: Math.min(...smallCalls.map((call) => call.x)),
  y: Math.min(...smallCalls.map((call) => call.y)),
  right: Math.max(...smallCalls.map((call) => call.x + call.w)),
  bottom: Math.max(...smallCalls.map((call) => call.y + call.h))
};
assert.deepEqual({
  phase: small.phase,
  frameName: small.frameName,
  x: small.x,
  y: small.y,
  width: small.width,
  height: small.height
}, {
  phase: 1,
  frameName: "phase1",
  x: 112,
  y: 208,
  width: 16,
  height: 8
});
assert.deepEqual(smallBounds, { x: 112, y: 208, right: 128, bottom: 216 });

canvasContext.calls.length = 0;
const large = JSON.parse(JSON.stringify(api.debugRenderBaseDestructionFrame(27)));
const largeCalls = canvasContext.calls.filter((call) => call.op === "fillRect" && call.style === "#f05a42");
const largeBounds = {
  x: Math.min(...largeCalls.map((call) => call.x)),
  y: Math.min(...largeCalls.map((call) => call.y)),
  right: Math.max(...largeCalls.map((call) => call.x + call.w)),
  bottom: Math.max(...largeCalls.map((call) => call.y + call.h))
};
assert.deepEqual({
  phase: large.phase,
  frameName: large.frameName,
  x: large.x,
  y: large.y,
  width: large.width,
  height: large.height
}, {
  phase: 4,
  frameName: "phase4",
  x: 104,
  y: 200,
  width: 32,
  height: 32
});
assert.deepEqual(largeBounds, { x: 104, y: 200, right: 136, bottom: 232 });

const signatures = [38, 35, 31, 27, 23].map((timer) => {
  canvasContext.calls.length = 0;
  const presentation = api.debugRenderBaseDestructionFrame(timer);
  const signature = canvasContext.calls
    .filter((call) => call.op === "fillRect" && (call.style === "#f05a42" || call.style === "#f7f1c6"))
    .map((call) => `${call.style}:${call.x},${call.y},${call.w},${call.h}`)
    .join("|");
  return { phase: presentation.phase, frameName: presentation.frameName, signature };
});
assert.deepEqual(signatures.map((entry) => entry.phase), [1, 2, 3, 4, 5]);
assert.equal(new Set(signatures.map((entry) => entry.frameName)).size, 5);
assert.equal(new Set(signatures.map((entry) => entry.signature)).size, 5);
canvasContext.calls.length = 0;
assert.equal(api.debugRenderBaseDestructionFrame(3), null);
assert.equal(canvasContext.calls.some((call) => call.op === "fillRect" && call.style === "#f05a42"), false);

console.log("effect-presentation integration test passed");
