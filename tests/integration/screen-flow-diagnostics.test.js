const assert = require("assert").strict;
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const SCREEN_FLOW_DIAGNOSTIC_METHODS = [
  "debugTitleScoreLayoutProbe",
  "debugFrameCounterProbe",
  "debugStageSelectInputCadenceProbe",
  "debugTitleDemoLifecycleProbe",
  "debugHiddenMessageLifecycleProbe",
  "debugHighScoreScreenProbe",
  "debugHighScoreAudioProbe",
  "debugFullGameOverScreenProbe",
  "debugGameOverAudioProbe",
  "debugRenderFullGameOverFrame",
  "debugRenderHighScoreFrame"
];

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const modules = context.window.TankDefender8Modules;
const api = context.window.TankDefender8;

assert(modules.screenFlowDiagnostics, "screen-flow diagnostics should register before game.js");
assert.equal(Object.isFrozen(modules.screenFlowDiagnostics), true);
assert(modules.stageSelectRuntime, "stage select runtime should register before game.js");
assert.equal(Object.isFrozen(modules.stageSelectRuntime), true);
assert(modules.postGameRuntime, "post-game runtime should register before game.js");
assert.equal(Object.isFrozen(modules.postGameRuntime), true);
assert.deepEqual(
  JSON.parse(JSON.stringify(Object.keys(api).slice(39, 50))),
  SCREEN_FLOW_DIAGNOSTIC_METHODS
);

const outputs = {
  debugTitleScoreLayoutProbe: api.debugTitleScoreLayoutProbe(1),
  debugFrameCounterProbe: api.debugFrameCounterProbe(),
  debugStageSelectInputCadenceProbe: api.debugStageSelectInputCadenceProbe(),
  debugTitleDemoLifecycleProbe: api.debugTitleDemoLifecycleProbe(),
  debugHiddenMessageLifecycleProbe: api.debugHiddenMessageLifecycleProbe(),
  debugHighScoreScreenProbe: api.debugHighScoreScreenProbe(),
  debugHighScoreAudioProbe: api.debugHighScoreAudioProbe(),
  debugFullGameOverScreenProbe: api.debugFullGameOverScreenProbe(),
  debugGameOverAudioProbe: api.debugGameOverAudioProbe(),
  debugRenderFullGameOverFrame: api.debugRenderFullGameOverFrame(42),
  debugRenderHighScoreFrame: api.debugRenderHighScoreFrame(1, 1234567)
};
const json = JSON.stringify(outputs);
assert.equal(Buffer.byteLength(json), 25534);
assert.equal(
  crypto.createHash("sha256").update(json).digest("hex"),
  "ddd9c8ea4b58435070c220d2437471a0e97992852c564fb3bf209f705220a37c"
);

const titleDemoProbe = api.debugTitleDemoLifecycleProbe();
assert(titleDemoProbe.timeoutFrames === 640, "title demo should use ten original 64-frame high-counter intervals");
assert(titleDemoProbe.selectionReset.idleFrames === 0 && titleDemoProbe.selectionReset.frameLow === 0xab && titleDemoProbe.selectionReset.frameHigh === 0, "changing the title selection should clear only the high frame counter and preserve the full low-byte phase");
assert(titleDemoProbe.beforeTimeout.screen === "title" && titleDemoProbe.beforeTimeout.idleFrames === 639 && titleDemoProbe.beforeTimeout.frameLow === 0x7f && titleDemoProbe.beforeTimeout.frameHigh === 9, "title should remain visible through idle frame 639 with high counter nine");
assert(titleDemoProbe.beforeTimeout.demoMode === false, "title should not enter demo before the timeout boundary");
assert(titleDemoProbe.afterTimeout.screen === "playing" && titleDemoProbe.afterTimeout.demoMode === true && titleDemoProbe.afterTimeout.frameLow === 2 && titleDemoProbe.afterTimeout.frameHigh === 0, "idle frame 640 should enter the attract demo after its two original preparation waits");
assert(titleDemoProbe.afterTimeout.stage === 30 && titleDemoProbe.afterTimeout.transitionTimer === 0, "the demo should display stage 30 without a stage-intro curtain");
assert(titleDemoProbe.afterTimeout.playerCount === 2 && titleDemoProbe.afterTimeout.playerIds.join(",") === "1,2", "the demo should spawn both AI-controlled players");
assert(titleDemoProbe.afterTimeout.maxActiveEnemies === 4, "the demo should retain the original four-active-enemy limit");
assert(titleDemoProbe.enemyTargets[0].targetId === 202 && titleDemoProbe.enemyTargets[1].targetId === 203, "demo players should use their original slot-priority enemy targets");
assert(titleDemoProbe.enemyTargets[0].direction === 0 && titleDemoProbe.enemyTargets[1].direction === 1 && titleDemoProbe.axisPhaseTwoTargets[0].direction === 3 && titleDemoProbe.axisPhaseTwoTargets[1].direction === 0, "demo route axis priority should swap when the independent high counter reaches two after 128 display frames");
assert(titleDemoProbe.powerUpTarget.targetKind === "powerUp" && titleDemoProbe.powerUpTarget.targetId === "star", "demo AI should prioritize an available power-up over enemies");
assert(titleDemoProbe.scoreIsolation.score === 0 && titleDemoProbe.scoreIsolation.stagePoints === 0, "demo kills and pickups should not change player scores");
assert(titleDemoProbe.scoreIsolation.stageKills.every((count) => count === 0), "demo kills should not enter stage result counters");
assert(titleDemoProbe.scoreIsolation.level === 1 && titleDemoProbe.scoreIsolation.scorePopupCount === 0, "demo pickups should apply effects without showing score popups");
assert(titleDemoProbe.afterExit.screen === "title" && titleDemoProbe.afterExit.stage === 1 && titleDemoProbe.afterExit.demoMode === false, "leaving the demo should restore a clean stage-1 title state");
assert(titleDemoProbe.afterExit.playerCount === 0 && titleDemoProbe.afterExit.idleFrames === 0, "leaving the demo should clear demo actors and reset its idle timer");
assert(titleDemoProbe.afterConstruction.screen === "title" && titleDemoProbe.afterConstruction.idleFrames === 639 && titleDemoProbe.afterConstruction.frameLow === 0x40 && titleDemoProbe.afterConstruction.frameHigh === 10, "an active Construction-use cycle should suppress the automatic demo without stopping the global counters");
const hiddenMessageProbe = api.debugHiddenMessageLifecycleProbe();
assert(hiddenMessageProbe.requiredVisits === 7 && hiddenMessageProbe.requiredAPresses === 8 && hiddenMessageProbe.requiredBPresses === 12, "hidden message should retain the original seven-visit, eight-A, twelve-B sequence");
assert(hiddenMessageProbe.afterSeventhExit.screen === "title" && hiddenMessageProbe.afterSeventhExit.visits === 7, "the seventh Construction exit should arm hidden title input");
assert(hiddenMessageProbe.afterSeventhExit.inputCount === 0, "each Construction exit should reset the hidden input accumulator");
assert(hiddenMessageProbe.afterA === 0x80 && hiddenMessageProbe.afterB === 0x74, "hidden controller input should use the original +0x10 and -1 byte arithmetic");
assert(hiddenMessageProbe.afterB === hiddenMessageProbe.expectedInputCount && hiddenMessageProbe.triggerReady === true, "the exact hidden input total should arm Start");
assert(hiddenMessageProbe.presentations[0].visibleLines.length === 0 && hiddenMessageProbe.presentations[1].visibleLines.length === 1, "the first hidden-message line should appear on frame 128");
assert(hiddenMessageProbe.presentations[2].visibleLines.length === 4, "all four hidden-message lines should be visible on frame 320");
assert(hiddenMessageProbe.presentations[3].dots === 0 && hiddenMessageProbe.presentations[4].dots === 1 && hiddenMessageProbe.presentations[5].dots === 5, "the five trailing dots should appear one per 64 frames");
assert(hiddenMessageProbe.presentations[5].drop === null && hiddenMessageProbe.presentations[6].drop.frame === "morph3", "the replacement green drop should start one frame after the fifth dot");
assert(hiddenMessageProbe.presentations[7].drop.frame === "morph3" && hiddenMessageProbe.presentations[7].drop.y === 30, "the seven-step drop morph should last 28 frames at the top");
assert(hiddenMessageProbe.presentations[8].drop.frame === "fall" && hiddenMessageProbe.presentations[8].drop.y === 31, "the drop should begin falling after its 28-frame morph");
assert(hiddenMessageProbe.presentations[9].drop.y === 248 && hiddenMessageProbe.endFrame === 887, "the drop should reach the original terminal Y before frame 887 ends the cutscene");
assert(hiddenMessageProbe.afterCutscene.screen === "editor" && hiddenMessageProbe.afterCutscene.visits === 7, "the hidden cutscene should continue into Construction without adding another exit");
assert(hiddenMessageProbe.afterCutscene.inputCount === 0, "finishing the hidden cutscene should clear its input accumulator");
assert(hiddenMessageProbe.wrappedVisits === 0, "Construction visit tracking should preserve the original eight-bit wraparound");
assert(hiddenMessageProbe.alternateSelection.screen === "stageSelectClosing" && hiddenMessageProbe.alternateSelection.players === 1, "the hidden cutscene should continue through the selected title handler and its curtain close");
const gameOverAudioProbe = api.debugGameOverAudioProbe();
assert(gameOverAudioProbe.durationFrames === 108 && gameOverAudioProbe.voiceDurations.join(",") === "108,108,108", "all three game-over voices should cover the complete 108-frame interstitial");
assert(gameOverAudioProbe.waves.join(",") === "square,square,triangle", "game-over audio should expose its two pulse replacements and triangle voice");
const gameOverBoundaryFrames = gameOverAudioProbe.frames.filter((_frame, index) => index % 2 === 0 && index < 20);
assert(gameOverBoundaryFrames.map((frame) => frame.voices[0].frequency).join(",") === "523,464,523,391,348,311,261,261,261,261", "game-over pulse one should preserve the original note order at each segment boundary");
assert(gameOverBoundaryFrames.map((frame) => frame.voices[1].frequency).join(",") === "391,391,391,311,293,246,261,261,261,261", "game-over pulse two should preserve the original note order at each segment boundary");
assert(gameOverBoundaryFrames.map((frame) => frame.voices[2].frequency).join(",") === "329,311,329,261,232,196,196,196,196,196", "game-over triangle should preserve the original note order at each segment boundary");
assert(gameOverAudioProbe.frames[0].voices[0].frequency === gameOverAudioProbe.frames[1].voices[0].frequency && gameOverAudioProbe.frames[4].voices[0].frequency === gameOverAudioProbe.frames[5].voices[0].frequency && gameOverAudioProbe.frames[18].voices[0].frequency === gameOverAudioProbe.frames[19].voices[0].frequency, "game-over notes should remain held through their 6-, 24-, and final 24-frame spans");
assert(gameOverAudioProbe.frames[20].voices.every((voice) => voice === null), "all game-over voices should stop exactly on frame 108");
const highScoreAudioProbe = api.debugHighScoreAudioProbe();
assert(highScoreAudioProbe.durationFrames === 460 && highScoreAudioProbe.voiceDurations.join(",") === "460,460,380", "high-score pulse voices should last 460 frames while triangle ends on frame 380");
assert(highScoreAudioProbe.waves.join(",") === "square,square,triangle", "high-score audio should expose both pulse replacements and its triangle voice");
const highScoreAudioFrames = new Map(highScoreAudioProbe.frames.map((frame) => [frame.frame, frame]));
assert(highScoreAudioFrames.get(0).voices[0].frequency === 924 && highScoreAudioFrames.get(4).voices[0].frequency === 924 && highScoreAudioFrames.get(5).voices[0].frequency === 782 && highScoreAudioFrames.get(10).voices[0].frequency === 924, "high-score pulse one should alternate its opening pair every five frames");
assert(highScoreAudioFrames.get(240).voices[0].frequency === 1243 && highScoreAudioFrames.get(245).voices[0].frequency === 1108 && highScoreAudioFrames.get(319).voices[0].frequency === 1108, "high-score pulse one should preserve its eight repeated upper pairs");
assert(highScoreAudioFrames.get(320).voices[0] === null && highScoreAudioFrames.get(399).voices[0] === null, "high-score pulse one should retain its original eighty-frame muted interval");
assert(highScoreAudioFrames.get(400).voices[0].frequency === 1554 && highScoreAudioFrames.get(459).voices[0].frequency === 1554 && highScoreAudioFrames.get(460).voices[0] === null, "high-score pulse one should hold its final note for sixty frames and stop on frame 460");
assert(highScoreAudioFrames.get(0).voices[1].frequency === 695 && highScoreAudioFrames.get(5).voices[1].frequency === 621 && highScoreAudioFrames.get(240).voices[1].frequency === 981 && highScoreAudioFrames.get(245).voices[1].frequency === 736, "high-score pulse two should preserve both repeated opening pairs");
assert(highScoreAudioFrames.get(320).voices[1].frequency === 78 && highScoreAudioFrames.get(325).voices[1].frequency === 98 && highScoreAudioFrames.get(399).voices[1].frequency === 1165, "high-score pulse two should preserve its sixteen-note five-frame rise");
assert(highScoreAudioFrames.get(400).voices[1].frequency === 1165 && highScoreAudioFrames.get(459).voices[1].frequency === 1165 && highScoreAudioFrames.get(460).voices[1] === null, "high-score pulse two should retain its sixty-frame ending");
assert(highScoreAudioFrames.get(0).voices[2] === null && highScoreAudioFrames.get(129).voices[2] === null && highScoreAudioFrames.get(130).voices[2].frequency === 232, "high-score triangle should retain its initial 130-frame disabled interval");
assert(highScoreAudioFrames.get(160).voices[2].frequency === 311 && highScoreAudioFrames.get(175).voices[2].frequency === 347 && highScoreAudioFrames.get(180).voices[2].frequency === 391, "high-score triangle should preserve its first 15-, 5-, and 30-frame notes");
assert(highScoreAudioFrames.get(320).voices[2].frequency === 155 && highScoreAudioFrames.get(379).voices[2].frequency === 155 && highScoreAudioFrames.get(380).voices[2] === null, "high-score triangle should hold its final note through frame 379 and stop on frame 380");
const debugSource = fs.readFileSync(path.join(root, "src/runtime/debug-api.js"), "utf8");
const diagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/screen-flow-diagnostics.js"),
  "utf8"
);
assert(debugSource.includes("...createScreenFlowDiagnostics(state, deps)"));
assert.equal(diagnosticsSource.includes("eval("), false);
for (const name of SCREEN_FLOW_DIAGNOSTIC_METHODS) {
  assert.equal(debugSource.includes(`${name}(`), false);
  assert.equal(diagnosticsSource.includes(`${name}(`), true);
}
assert(debugSource.split(/\r?\n/).length < 4900);

console.log("screen-flow-diagnostics integration test passed");
