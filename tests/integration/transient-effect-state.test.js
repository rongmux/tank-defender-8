const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;
const schema = JSON.parse(JSON.stringify(api.stagePackSchema()));

assert(modules.transientEffectState, "transient effect state module should register before game.js");
assert.equal(Object.isFrozen(modules.transientEffectState), true);
assert(modules.transientEffectsRuntime, "transient effects runtime should register before game.js");
assert.equal(Object.isFrozen(modules.transientEffectsRuntime), true);

const defaultImpact = JSON.parse(JSON.stringify(api.debugBulletImpactExplosionProbe()));
assert.equal(defaultImpact.beforePause, schema.gameSettings.explosionRules.brickHit.ttl);
assert.equal(defaultImpact.afterPause, defaultImpact.beforePause);
assert.equal(defaultImpact.frames.length, defaultImpact.beforePause);
assert.equal(defaultImpact.frames[0].ttl, defaultImpact.beforePause);
assert.equal(defaultImpact.frames.at(-1).ttl, 1);

const customPack = {
  id: "transient-effect-state-integration",
  totalStages: 1,
  maps: [schema.maps[0]],
  enemies: [schema.enemies[0].slice(0, 3)],
  gameSettings: {
    explosionRules: {
      brickHit: { ttl: 5, color: "#123456", coreColor: "#abcdef" }
    },
    powerUpRules: { pickupScore: 750 }
  }
};
assert.equal(api.validateStagePack(customPack).ok, true);
assert.equal(api.loadStagePack(customPack), true);

const customImpact = JSON.parse(JSON.stringify(api.debugBulletImpactExplosionProbe()));
assert.equal(customImpact.beforePause, 5);
assert.equal(customImpact.afterPause, 5);
assert.deepEqual(customImpact.frames.map((frame) => frame.ttl), [5, 4, 3, 2, 1]);

const scorePopups = JSON.parse(JSON.stringify(api.debugScorePopupProbe()));
assert.equal(scorePopups.pickupScore, 750);
assert.deepEqual(scorePopups.pickupPopup, {
  value: 750,
  x: 79,
  y: 79,
  ttl: 49,
  max: 49,
  style: "powerUp"
});
assert.equal(scorePopups.grenadePopups.length, 1);
assert.equal(scorePopups.grenadePopups[0].value, 750);
assert.equal(scorePopups.afterUpdate[0].ttl, scorePopups.grenadePopups[0].ttl - 1);

const direct = modules.transientEffectState.createExplosionState({
  x: 18,
  y: 30,
  ttl: 5,
  color: "#123456",
  coreColor: "#abcdef",
  style: "bulletImpact"
});
assert.deepEqual(JSON.parse(JSON.stringify(direct)), {
  x: 18,
  y: 30,
  ttl: 5,
  max: 5,
  color: "#123456",
  coreColor: "#abcdef",
  style: "bulletImpact"
});

console.log("transient-effect-state integration test passed");
