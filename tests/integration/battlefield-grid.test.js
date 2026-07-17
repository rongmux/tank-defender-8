const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { buttons, context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;
const action = (name) => buttons.find((button) => button.dataset.action === name);

assert(modules.battlefieldGrid, "battlefield grid module should register before game.js");
assert.equal(Object.isFrozen(modules.battlefieldGrid), true);

action("edit").click();
action("clear").click();
const snapshot = JSON.parse(JSON.stringify(api.debugSnapshot()));
const wallCells = [[5, 11], [6, 11], [7, 11], [5, 12], [7, 12]];
for (const [c, r] of wallCells) {
  assert.equal(snapshot.editorQuadrants[r * 2].slice(c * 2, c * 2 + 2), "BB");
  assert.equal(snapshot.editorQuadrants[r * 2 + 1].slice(c * 2, c * 2 + 2), "BB");
}
assert.equal(snapshot.editorQuadrants[24].slice(12, 14), "..");
assert.equal(snapshot.editorQuadrants[25].slice(12, 14), "..");

const shovel = JSON.parse(JSON.stringify(api.debugShovelWallProbe()));
assert.equal(shovel.durationUnits, 20);
assert.equal(shovel.flashThreshold, 4);
assert.equal(shovel.protected, "steel");
assert.notEqual(shovel.flashA, shovel.flashB);
assert.equal(shovel.expired, "brick");
assert.equal(
  shovel.cells.filter((cell) => cell.type === "steel" && cell.mask === 15).length,
  5
);
assert.equal(
  shovel.cells.some((cell) => cell.c === 6 && cell.r === 12 && cell.type === "empty"),
  true
);

console.log("battlefield-grid integration test passed");
