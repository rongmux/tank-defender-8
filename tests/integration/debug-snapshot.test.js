const assert = require("assert").strict;
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.debugSnapshot, "debug snapshot module should register before game.js");
assert.equal(Object.isFrozen(modules.debugSnapshot), true);
assert.equal(modules.debugSnapshot.AUDIO_SNAPSHOT_FIELDS.length, 17);

const first = api.debugSnapshot();
assert.equal(first.titleMenuAction, "one");
assert.equal(first.stageSelectLimit, 35);
assert.equal(first.panelEnemyCounter, 20);
assert.equal(first.stageStartAudio.durationFrames, 264);
assert.equal(first.powerUpPickupAudio.durationFrames, 39);
assert.deepEqual(JSON.parse(JSON.stringify(first.fieldGeometry)), {
  x: 16,
  y: 16,
  width: 208,
  height: 208,
  panelX: 224,
  panelWidth: 32
});

first.stageClearBonusPlayerIds.push(-1);
first.stageStartAudio.active = !first.stageStartAudio.active;
first.battleQuadrants[0] = "changed";
first.editorCursor.qc = 999;
first.enemyTypes[0].hp = -1;

const second = api.debugSnapshot();
assert.equal(second.stageClearBonusPlayerIds.includes(-1), false);
assert.notEqual(second.stageStartAudio.active, first.stageStartAudio.active);
assert.notEqual(second.battleQuadrants[0], "changed");
assert.equal(second.editorCursor.qc, -1);
assert.notEqual(second.enemyTypes[0].hp, -1);

const debugSource = fs.readFileSync(path.join(root, "src/runtime/debug-api.js"), "utf8");
assert(debugSource.includes("var publicAdapters = createPublicApiAdapters(state, deps);"));
assert(debugSource.includes("...publicAdapters.snapshot,"));
assert.equal(debugSource.includes("debugSnapshot() {"), false);
assert.equal(debugSource.includes("return createDebugSnapshot(state);"), false);
assert.equal(debugSource.includes("movementAudioMode:"), false);
assert.equal(debugSource.includes("battleQuadrants:"), false);

console.log("debug-snapshot integration test passed");
