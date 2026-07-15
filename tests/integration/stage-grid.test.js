const assert = require("assert").strict;
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");
const {
  gridToQuadrants,
  normalizeStageQuadrants,
  normalizeStageRows,
  parseStageRows
} = require("../../src/stages/stage-grid");

const root = path.resolve(__dirname, "../..");
const samplePack = JSON.parse(fs.readFileSync(path.join(root, "data/sample-stage-pack.json"), "utf8"));
const quadrantPack = JSON.parse(fs.readFileSync(path.join(root, "data/sample-quadrant-stage-pack.json"), "utf8"));
const { context } = createBrowserGameHarness(root);
const api = context.window.TankDefender8;

assert.equal(api.validateStagePack(samplePack).ok, true, "the 13x13 sample stage pack should validate");
assert.equal(api.loadStagePack(samplePack), true, "the 13x13 sample stage pack should load");
const expectedSample = gridToQuadrants(parseStageRows(normalizeStageRows(samplePack.maps[0], "maps[0]")));
assert.equal(JSON.stringify(api.debugSnapshot().battleQuadrants), JSON.stringify(expectedSample));

assert.equal(api.validateStagePack(quadrantPack).ok, true, "the 26x26 sample stage pack should validate");
assert.equal(api.loadStagePack(quadrantPack), true, "the 26x26 sample stage pack should load");
const expectedQuadrants = normalizeStageQuadrants(quadrantPack.quadrants[0], "quadrants[0]");
assert.equal(JSON.stringify(api.debugSnapshot().battleQuadrants), JSON.stringify(expectedQuadrants));

console.log("stage-grid integration test passed");
