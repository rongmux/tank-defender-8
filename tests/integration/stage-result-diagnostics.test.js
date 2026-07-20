const assert = require("assert").strict;
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.stageResultDiagnostics, "stage-result diagnostics should register before game.js");
assert.equal(Object.isFrozen(modules.stageResultDiagnostics), true);

const probeNames = [
  "debugStageClearBonusProbe",
  "debugStageClearResultRowsProbe",
  "debugStageClearRowLayoutProbe",
  "debugStageClearPresentationProbe"
];
assert.deepEqual(
  JSON.parse(JSON.stringify(Object.keys(api).slice(154, 158))),
  probeNames
);

const outputs = {
  bonus: api.debugStageClearBonusProbe(4, 3, 1, 1),
  rows: api.debugStageClearResultRowsProbe(
    [1, 2, 3, 4],
    [4, 3, 2, 1],
    500,
    250
  ),
  layout: api.debugStageClearRowLayoutProbe(),
  presentation: api.debugStageClearPresentationProbe(
    [2, 1, 0, 0],
    [1, 0, 0, 0],
    40
  )
};
const json = JSON.stringify(outputs);
assert.equal(Buffer.byteLength(json), 1478);
assert.equal(
  crypto.createHash("sha256").update(json).digest("hex"),
  "1d8e9ae50e52d15ca97540047493e54e09b6c0d537504731791d278d28f3d631"
);

outputs.rows.rows[0].p1Kills = 99;
assert.equal(
  api.debugStageClearResultRowsProbe([1, 0, 0, 0], [0, 0, 0, 0], 0, 0).rows[0].p1Kills,
  1
);

const debugSource = fs.readFileSync(path.join(root, "src/runtime/debug-api.js"), "utf8");
const gameSource = fs.readFileSync(path.join(root, "src/game.js"), "utf8");
assert(debugSource.includes("...createStageResultDiagnostics({"));
for (const name of probeNames) {
  assert.equal(debugSource.includes(`${name}(`), false);
}
assert.equal(gameSource.includes("function makeStageClearResultProbePlayer("), false);
assert.equal(gameSource.includes("function stageClearResultSummary("), false);

console.log("stage-result-diagnostics integration test passed");
