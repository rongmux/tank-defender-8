const assert = require("assert").strict;
const runtime = require("../../src/runtime/effect-render-runtime");

assert(Object.isFrozen(runtime));
assert.throws(
  () => runtime.setupEffectRenderRuntime({}, {}, {}),
  /state\.game must be an object/
);

const calls = [];
const selected = [];
const state = {
  ctx: {},
  game: {
    explosions: [
      { style: "bulletImpact", color: "#impact", x: 8, y: 12 }
    ],
    players: [
      { destroying: true, respawn: 4 }
    ],
    enemies: [
      { alive: true, destroying: true, id: "score" },
      { alive: true, destroying: true, id: "explosion" },
      { alive: false, destroying: true, id: "skip" }
    ],
    base: { x: 32, y: 48, w: 16, h: 16 },
    baseDestroyTimer: 10,
    scorePopups: [{ value: 100, id: "popup" }]
  },
  fn: {}
};
const api = runtime.setupEffectRenderRuntime(state, {
  sharedState: {
    BATTLE_PRESENTATION_LAYOUT: { x: 16, y: 16, width: 208, height: 208 }
  },
  DEFAULT_EXPLOSION_CORE_COLOR: "#core",
  BASE_DESTRUCTION_TAIL_FRAMES: 4,
  ENEMY_DESTRUCTION_SCORE_TICKS: 6,
  isTankDestructionStyle(style) {
    return style === "tankDestroy";
  },
  baseDestructionPresentation(timer, base, options) {
    selected.push(["base", timer, base, options]);
    return { frameName: "phase2", spriteX: 40, spriteY: 56 };
  },
  enemyDestructionPresentation(enemy, options) {
    selected.push(["enemy", enemy.id, options]);
    return enemy.id === "score"
      ? { kind: "score", text: "100", x: 20, y: 24 }
      : { kind: "explosion", frameName: "phase3", spriteX: 24, spriteY: 32 };
  },
  explosionPresentation(explosion, layout) {
    selected.push(["explosion", explosion, layout]);
    return { x: 20, y: 24, size: 8 };
  },
  playerDestructionPresentation(player, options) {
    selected.push(["player", player, options]);
    return { frameName: "phase1", spriteX: 16, spriteY: 16 };
  },
  scorePopupPresentation(popup, layout) {
    selected.push(["popup", popup, layout]);
    return { text: "100", x: 30, y: 40, color: "#popup", advance: 5 };
  },
  tankDestructionPresentation(explosion, layout) {
    selected.push(["tank", explosion, layout]);
    return { frameName: "phase4", spriteX: 8, spriteY: 12 };
  }
}, {
  drawManifestSprite(...args) {
    calls.push(["sprite", ...args]);
  },
  drawScaledManifestSprite(...args) {
    calls.push(["scaled", ...args]);
  },
  drawText(...args) {
    calls.push(["text", ...args]);
  },
  explosionRule(name) {
    return {
      playerDestroy: { ttl: 18, color: "#player", coreColor: "#playerCore" },
      enemyDestroy: { ttl: 18, color: "#enemy", coreColor: "#enemyCore" },
      baseDestroy: { ttl: 35, color: "#base", coreColor: "#baseCore" }
    }[name];
  },
  gameSettings() {
    return { timings: { playerRespawn: 24 } };
  }
});

assert(Object.isFrozen(api));
assert.deepEqual(Object.keys(api), [
  "drawTankDestructionExplosion",
  "enemyDestructionPresentation",
  "explosionPresentation",
  "baseDestructionPresentation",
  "playerDestructionPresentation",
  "renderBaseDestruction",
  "renderEnemyDestructions",
  "renderExplosions",
  "renderPlayerDestructions",
  "renderScorePopups",
  "scorePopupPresentation",
  "tankDestructionPresentation"
]);
assert.equal(state.fn.renderExplosions, api.renderExplosions);

api.renderExplosions();
api.renderPlayerDestructions();
api.renderEnemyDestructions();
api.renderBaseDestruction();
api.renderScorePopups();

assert.deepEqual(calls, [
  ["scaled", "explosion", "burst", 20, 24, 0.5, { primary: "#impact", core: "#core" }],
  ["sprite", "destructionExplosion", "phase1", 16, 16, { primary: "#player", core: "#playerCore" }],
  ["text", "100", 20, 24, 1, "#core", 5],
  ["sprite", "destructionExplosion", "phase3", 24, 32, { primary: "#enemy", core: "#enemyCore" }],
  ["sprite", "destructionExplosion", "phase2", 40, 56, { primary: "#base", core: "#baseCore" }],
  ["text", "100", 30, 40, 1, "#popup", 5]
]);
assert.equal(selected[0][0], "explosion");
assert.equal(selected[1][0], "player");
assert.equal(selected[2][0], "enemy");
assert.equal(selected[4][0], "base");
assert.equal(selected[5][0], "popup");
assert.deepEqual(api.tankDestructionPresentation({ style: "tankDestroy" }), {
  frameName: "phase4", spriteX: 8, spriteY: 12
});

console.log("effect-render-runtime unit test passed");
