const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.projectileImpactRules, "projectile impact rules module should register before game.js");
assert.equal(Object.isFrozen(modules.projectileImpactRules), true);

const boundaries = JSON.parse(JSON.stringify(api.debugFieldBoundaryBulletProbe()));
assert.equal(boundaries.length, 8);
assert.equal(boundaries.every((entry) => entry.removed && entry.explosionCount === 1), true);
assert.equal(boundaries.filter((entry) => entry.ownerKind === "player").every((entry) => entry.sound === "steelHit"), true);
assert.equal(boundaries.filter((entry) => entry.ownerKind === "enemy").every((entry) => entry.sound === null), true);
assert.equal(boundaries.filter((entry) => entry.edge === "left").every((entry) => entry.explosion.x === 0), true);
assert.equal(boundaries.filter((entry) => entry.edge === "right").every((entry) => entry.explosion.x === 208), true);
assert.equal(boundaries.filter((entry) => entry.edge === "top").every((entry) => entry.explosion.y === 0), true);
assert.equal(boundaries.filter((entry) => entry.edge === "bottom").every((entry) => entry.explosion.y === 208), true);

const sounds = JSON.parse(JSON.stringify(api.debugTerrainHitSoundProbe()));
assert.equal(sounds.find((entry) => entry.ownerKind === "player" && entry.terrain === "brick").sound, "brickHit");
assert.equal(sounds.find((entry) => entry.ownerKind === "player" && entry.terrain === "steelBlocked").sound, "steelHit");
assert.equal(sounds.find((entry) => entry.ownerKind === "player" && entry.terrain === "steelDestroyed").sound, "brickHit");
assert.equal(sounds.filter((entry) => entry.ownerKind === "enemy").every((entry) => entry.sound === null), true);

console.log("projectile-impact-rules integration test passed");
