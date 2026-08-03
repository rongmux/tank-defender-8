const assert = require("assert").strict;
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const EFFECT_DIAGNOSTIC_METHODS = [
  "debugExplosionRuleProbe",
  "debugTankDestructionExplosionProbe",
  "debugEnemyDestructionLifecycleProbe",
  "debugRenderTankDestructionExplosionFrame",
  "debugBulletImpactExplosionProbe"
];

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.effectDiagnostics, "effect diagnostics should register before game.js");
assert.equal(Object.isFrozen(modules.effectDiagnostics), true);
assert.equal(Object.isFrozen(modules.effectExplosionDiagnostics), true);
assert.equal(Object.isFrozen(modules.effectEnemyDestructionDiagnostics), true);
assert.deepEqual(
  JSON.parse(JSON.stringify(Object.keys(api).slice(130, 135))),
  EFFECT_DIAGNOSTIC_METHODS
);

const outputs = {
  debugExplosionRuleProbe: api.debugExplosionRuleProbe("enemyDestroy"),
  debugTankDestructionExplosionProbe: api.debugTankDestructionExplosionProbe(),
  debugEnemyDestructionLifecycleProbe: api.debugEnemyDestructionLifecycleProbe(),
  debugRenderTankDestructionExplosionFrame:
    api.debugRenderTankDestructionExplosionFrame("enemyDestroy", 0),
  debugBulletImpactExplosionProbe: api.debugBulletImpactExplosionProbe()
};
const json = JSON.stringify(outputs);
assert.equal(Buffer.byteLength(json), 6548);
assert.equal(
  crypto.createHash("sha256").update(json).digest("hex"),
  "7723d988dc0c766b0e58257ec1d43dbbbb8d0ffbfcedb04091f6a67e9e1b4356"
);

const debugSource = fs.readFileSync(path.join(root, "src/runtime/debug-api.js"), "utf8");
const diagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/effect-diagnostics.js"),
  "utf8"
);
const explosionDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/effect-explosion-diagnostics.js"),
  "utf8"
);
const enemyDestructionDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/effect-enemy-destruction-diagnostics.js"),
  "utf8"
);
assert(debugSource.includes("...createEffectDiagnostics(state, deps)"));
assert.equal(diagnosticsSource.includes("eval("), false);
assert.equal(explosionDiagnosticsSource.includes("eval("), false);
assert.equal(enemyDestructionDiagnosticsSource.includes("eval("), false);
for (const name of EFFECT_DIAGNOSTIC_METHODS) {
  assert.equal(debugSource.includes(`${name}(`), false);
  assert.equal(
    diagnosticsSource.includes(`${name}(`) ||
      explosionDiagnosticsSource.includes(`${name}(`) ||
      enemyDestructionDiagnosticsSource.includes(`${name}(`),
    true
  );
}
assert(debugSource.split(/\r?\n/).length < 4200);

console.log("effect-diagnostics integration test passed");
