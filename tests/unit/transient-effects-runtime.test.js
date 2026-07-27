const assert = require("assert").strict;
const transientEffectState = require("../../src/entities/transient-effect-state");
const transientEffectsRuntime = require("../../src/runtime/transient-effects-runtime");

assert.equal(Object.isFrozen(transientEffectsRuntime), true);
assert.throws(
  () => transientEffectsRuntime.setupTransientEffectsRuntime(),
  /state must be an object/
);
assert.throws(
  () => transientEffectsRuntime.setupTransientEffectsRuntime(
    { game: {}, fn: {} },
    { sharedState: {} },
    { gameSettings: () => ({}) }
  ),
  /deps\.isTankDestructionStyle must be a function/
);

const state = {
  game: { explosions: [], scorePopups: [] },
  fn: {}
};
const deps = {
  sharedState: {
    FIELD_W: 208,
    FIELD_H: 208,
    BULLET_IMPACT_EXPLOSION_RULES: new Set(["brickHit", "steelBlocked"])
  },
  DEFAULT_EXPLOSION_CORE_COLOR: "#ffffff",
  DEFAULT_EXPLOSION_RULES: {
    enemyHit: { ttl: 2, color: "#fallback", coreColor: "#fallback-core" },
    baseDestroy: { ttl: 8, color: "#base", coreColor: "#base-core" }
  },
  BASE_DESTRUCTION_TAIL_FRAMES: 3,
  isTankDestructionStyle(name) {
    return name === "enemyDestroy";
  },
  ...transientEffectState
};
const settings = () => ({
  explosionRules: {
    brickHit: { ttl: 5, color: "#brick", coreColor: "#brick-core" },
    baseDestroy: { ttl: 10, color: "#custom-base", coreColor: "#custom-base-core" }
  }
});

const api = transientEffectsRuntime.setupTransientEffectsRuntime(state, deps, {
  gameSettings: settings
});
assert.deepEqual(Object.keys(api), [
  "addRuleExplosion",
  "explosionRule",
  "baseDestructionDuration",
  "addExplosion",
  "updateExplosions",
  "addScorePopup",
  "updateScorePopups"
]);
assert.equal(state.fn.addRuleExplosion, api.addRuleExplosion);
assert.deepEqual(api.explosionRule("brickHit"), settings().explosionRules.brickHit);
assert.deepEqual(api.explosionRule("missing"), deps.DEFAULT_EXPLOSION_RULES.enemyHit);
assert.equal(api.baseDestructionDuration(), 13);

api.addRuleExplosion("brickHit", 4, 6);
api.addRuleExplosion("enemyDestroy", 8, 10);
assert.deepEqual(state.game.explosions, [
  { x: 4, y: 6, ttl: 5, max: 5, color: "#brick", coreColor: "#brick-core", style: "bulletImpact" },
  { x: 8, y: 10, ttl: 2, max: 2, color: "#fallback", coreColor: "#fallback-core", style: "enemyDestroy" }
]);

api.addScorePopup(500.9, undefined, undefined, { ttl: 4, style: "powerUp" });
assert.deepEqual(state.game.scorePopups, [{
  value: 500,
  x: 104,
  y: 104,
  ttl: 4,
  max: 4,
  style: "powerUp"
}]);
const survivor = state.game.explosions[0];
api.updateExplosions();
api.updateScorePopups();
assert.equal(state.game.explosions[0], survivor);
assert.equal(state.game.explosions[0].ttl, 4);
assert.equal(state.game.explosions[1].ttl, 1);
assert.equal(state.game.scorePopups[0].ttl, 3);
api.updateExplosions();
assert.equal(state.game.explosions.length, 1);

console.log("transient-effects-runtime unit test passed");
