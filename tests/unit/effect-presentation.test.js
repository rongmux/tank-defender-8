const assert = require("assert").strict;
const effectPresentation = require("../../src/presentation/effect-presentation");

const {
  BASE_DESTRUCTION_REFERENCE_PHASES,
  BASE_DESTRUCTION_TAIL_FRAMES,
  BULLET_IMPACT_PHASE_SIZES,
  ENEMY_DESTRUCTION_REFERENCE_PHASES,
  PLAYER_DESTRUCTION_REFERENCE_PHASES,
  baseDestructionPresentation,
  destructionExplosionGeometry,
  enemyDestructionPresentation,
  explosionPresentation,
  isTankDestructionStyle,
  playerDestructionPresentation,
  scorePopupPresentation,
  tankDestructionPresentation
} = effectPresentation;

const layout = Object.freeze({ x: 16, y: 16, width: 208, height: 208 });
const collapsePhases = (frames) => frames
  .map((frame) => frame.phase)
  .filter((phase, index, phases) => index === 0 || phase !== phases[index - 1]);

assert.equal(Object.isFrozen(effectPresentation), true);
assert.equal(Object.isFrozen(BASE_DESTRUCTION_REFERENCE_PHASES), true);
assert.equal(Object.isFrozen(ENEMY_DESTRUCTION_REFERENCE_PHASES), true);
assert.equal(Object.isFrozen(PLAYER_DESTRUCTION_REFERENCE_PHASES), true);
assert.equal(Object.isFrozen(BULLET_IMPACT_PHASE_SIZES), true);
assert.equal(BASE_DESTRUCTION_TAIL_FRAMES, 4);
assert.equal(BASE_DESTRUCTION_REFERENCE_PHASES.length, 35);
assert.equal(ENEMY_DESTRUCTION_REFERENCE_PHASES.length, 18);
assert.equal(PLAYER_DESTRUCTION_REFERENCE_PHASES.length, 24);
assert.deepEqual(Array.from(BULLET_IMPACT_PHASE_SIZES), [8, 12, 16]);
assert.equal(isTankDestructionStyle("enemyDestroy"), true);
assert.equal(isTankDestructionStyle("playerDestroy"), true);
assert.equal(isTankDestructionStyle("bulletImpact"), false);

assert.deepEqual(destructionExplosionGeometry(1, 120, 216), {
  phase: 1,
  frameName: "phase1",
  size: 16,
  width: 16,
  height: 8,
  x: 112,
  y: 208,
  spriteX: 104,
  spriteY: 200
});
assert.deepEqual(destructionExplosionGeometry(4, 120, 216), {
  phase: 4,
  frameName: "phase4",
  size: 32,
  width: 32,
  height: 32,
  x: 104,
  y: 200,
  spriteX: 104,
  spriteY: 200
});

const base = { x: 96, y: 192, w: 16, h: 16 };
const baseOptions = { layout, visibleFrames: 35, tailFrames: 4 };
assert.equal(baseDestructionPresentation(39, base, baseOptions), null);
const baseFrames = Array.from({ length: 35 }, (_, frame) =>
  baseDestructionPresentation(38 - frame, base, baseOptions)
);
assert.deepEqual(baseFrames.map((frame) => frame.phase), Array.from(BASE_DESTRUCTION_REFERENCE_PHASES));
assert.equal(baseFrames.every((frame) => frame.frameName === `phase${frame.phase}`), true);
assert.equal(baseFrames[0].x, 112);
assert.equal(baseFrames[0].y, 208);
assert.equal(baseFrames[11].x, 104);
assert.equal(baseFrames[11].y, 200);
assert.equal(baseDestructionPresentation(3, base, baseOptions), null);

const player = {
  x: 57,
  y: 57,
  w: 14,
  h: 14,
  respawn: 24,
  destroyTotalTicks: 24,
  destroyExplosionTicks: 18
};
const playerFrames = Array.from({ length: 24 }, (_, elapsed) => {
  player.respawn = 24 - elapsed;
  return playerDestructionPresentation(player, { layout, totalTicks: 24, explosionTicks: 18 });
});
assert.deepEqual(collapsePhases(playerFrames), [1, 2, 3, 4, 5, 3, 1]);
assert.equal(playerFrames.slice(0, 18).every((frame) => frame.kind === "explosion"), true);
assert.equal(playerFrames.slice(18).every((frame) => frame.kind === "final" && frame.phase === 1), true);

const enemy = {
  x: 57,
  y: 57,
  w: 14,
  h: 14,
  destroyTicks: 0,
  destroyExplosionTicks: 18,
  score: 400
};
const enemyFrames = Array.from({ length: 24 }, (_, tick) => {
  enemy.destroyTicks = tick;
  return enemyDestructionPresentation(enemy, { layout, explosionTicks: 18, scoreTicks: 6 });
});
assert.deepEqual(collapsePhases(enemyFrames.slice(0, 18)), [1, 2, 3, 4, 5, 3]);
assert.equal(enemyFrames.slice(0, 18).every((frame) => frame.kind === "explosion"), true);
assert.equal(enemyFrames.slice(18).every((frame) => frame.kind === "score" && frame.text === "400"), true);
enemy.destroyShowScore = false;
enemy.destroyTicks = 18;
assert.equal(enemyDestructionPresentation(enemy, {
  layout,
  explosionTicks: 18,
  scoreTicks: 6
}).kind, "explosion");

const enemyExplosion = { x: 64, y: 64, ttl: 18, max: 18, style: "enemyDestroy" };
const enemyTankFrames = Array.from({ length: 18 }, (_, elapsed) => {
  enemyExplosion.ttl = 18 - elapsed;
  return tankDestructionPresentation(enemyExplosion, layout);
});
assert.deepEqual(collapsePhases(enemyTankFrames), [1, 2, 3, 4, 5, 3]);
const playerExplosion = { x: 64, y: 64, ttl: 24, max: 24, style: "playerDestroy" };
const playerTankFrames = Array.from({ length: 24 }, (_, elapsed) => {
  playerExplosion.ttl = 24 - elapsed;
  return tankDestructionPresentation(playerExplosion, layout);
});
assert.deepEqual(collapsePhases(playerTankFrames), [1, 2, 3, 4, 5, 3, 1]);

const impact = { x: 64, y: 64, ttl: 9, max: 9, style: "bulletImpact" };
const impactFrames = Array.from({ length: 9 }, (_, elapsed) => {
  impact.ttl = 9 - elapsed;
  return explosionPresentation(impact, layout);
});
assert.deepEqual(impactFrames.map((frame) => frame.phase), [0, 0, 0, 1, 1, 1, 2, 2, 2]);
assert.deepEqual(impactFrames.map((frame) => frame.size), [8, 8, 8, 12, 12, 12, 16, 16, 16]);

assert.deepEqual(scorePopupPresentation({
  value: 500,
  x: 79,
  y: 79,
  ttl: 49,
  max: 49,
  style: "powerUp"
}, layout), {
  text: "500",
  width: 15,
  advance: 5,
  x: 88,
  y: 91,
  color: "#f7f1c6"
});
assert.deepEqual(scorePopupPresentation({
  value: 100,
  x: -20,
  y: -20,
  ttl: 6,
  max: 10,
  style: "default"
}, layout), {
  text: "100",
  width: 18,
  advance: 6,
  x: 16,
  y: 16,
  color: "#e0b84b"
});

console.log("effect-presentation unit test passed");
