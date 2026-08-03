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
assert.equal(Object.isFrozen(modules.screenFlowNavigationDiagnostics), true);
assert.equal(Object.isFrozen(modules.screenFlowTitleDemoDiagnostics), true);
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

const inputHarness = createBrowserGameHarness(root);
const inputContext = inputHarness.context;
const inputApi = inputContext.window.TankDefender8;
const inputListeners = inputHarness.listeners;
const inputButtons = inputHarness.buttons;
const inputAnimationFrameCallback = inputHarness.animationFrameCallback;

function inputKeyDown(code, options = {}) {
  inputListeners.keydown({
    code,
    repeat: false,
    shiftKey: false,
    preventDefault() {},
    ...options
  });
}

function inputKeyUp(code) {
  inputListeners.keyup({ code });
}

function inputKeyPress(code, options = {}) {
  inputKeyDown(code, options);
  inputKeyUp(code);
}

function finishInputStageSelectClosing() {
  const snapshot = inputApi.debugSnapshot();
  if (snapshot.screen === "stageSelectClosing") inputApi.debugAdvanceStageTransition(16);
}

assert(typeof inputAnimationFrameCallback === "function");
inputHarness.canvasContext.calls.length = 0;
inputAnimationFrameCallback(16);
assert(inputHarness.canvasContext.calls.some((call) =>
  call.op === "fillRect" && call.style === "#e3c64e" && call.w === 4 && call.h === 10
), "title should render the menu tank cursor through the browser input harness");
let inputSnapshot = inputApi.debugSnapshot();
assert(inputSnapshot.titleMenu === 0 && inputSnapshot.titleMenuAction === "one", "title menu should default to one-player through the browser input harness");
inputKeyPress("ArrowDown");
inputKeyPress("ArrowDown");
for (let visit = 0; visit < 7; visit += 1) {
  inputKeyPress("Enter");
  inputKeyPress("Escape");
}
inputSnapshot = inputApi.debugSnapshot();
assert(inputSnapshot.screen === "title" && inputSnapshot.titleMenuAction === "construction" && inputSnapshot.constructionVisits === 7, "real title/editor key events should arm the seventh Construction exit");
inputKeyDown("ArrowDown");
for (let press = 0; press < 8; press += 1) inputKeyPress("KeyF");
inputKeyUp("ArrowDown");
inputKeyDown("ArrowRight");
for (let press = 0; press < 12; press += 1) inputKeyPress("KeyG");
inputKeyUp("ArrowRight");
inputSnapshot = inputApi.debugSnapshot();
assert(inputSnapshot.titleMenuAction === "construction" && inputSnapshot.hiddenInputCount === 0x74, "real two-controller key events should preserve the Construction selection and reach the hidden byte total");
inputKeyPress("Enter");
inputSnapshot = inputApi.debugSnapshot();
assert(inputSnapshot.screen === "hiddenMessage" && inputSnapshot.hiddenMessageElapsed === 0, "Start should enter the hidden message through the real key listener");
inputButtons.find((button) => button.dataset.action === "reset").click();
inputSnapshot = inputApi.debugSnapshot();
assert(inputSnapshot.screen === "title" && inputSnapshot.constructionVisits === 0 && inputSnapshot.hiddenInputCount === 0, "reset should clear hidden-message progress after the end-to-end input test");
inputKeyPress("ArrowDown");
inputSnapshot = inputApi.debugSnapshot();
assert(inputSnapshot.titleMenu === 1 && inputSnapshot.titleMenuAction === "two", "title menu down should select two-player");
inputKeyPress("ArrowDown");
inputSnapshot = inputApi.debugSnapshot();
assert(inputSnapshot.titleMenu === 2 && inputSnapshot.titleMenuAction === "construction", "title menu down should select Construction");
inputKeyPress("Enter");
inputSnapshot = inputApi.debugSnapshot();
assert(inputSnapshot.screen === "editor" && inputSnapshot.titleMenuAction === "construction", "title menu Construction should enter the editor on Enter");
inputKeyPress("Escape");
inputKeyPress("ArrowUp");
inputKeyPress("ArrowUp");
inputSnapshot = inputApi.debugSnapshot();
assert(inputSnapshot.screen === "title" && inputSnapshot.titleMenu === 0 && inputSnapshot.titleMenuAction === "one", "title menu should return to one-player after navigating back up");
inputKeyPress("Digit1");
inputSnapshot = inputApi.debugSnapshot();
assert(inputSnapshot.screen === "stageSelectClosing" && inputSnapshot.stageSelectPlayers === 1, "one-player shortcut should begin the original stage-selection curtain close");
finishInputStageSelectClosing();
inputSnapshot = inputApi.debugSnapshot();
assert(inputSnapshot.screen === "stageSelect", "the stage-selection screen should appear after the sixteen-frame curtain close");
assert(inputSnapshot.stage === 1 && inputSnapshot.stageSelectLimit === 35, "stage selection should start at stage 1 and stop at the original stage 35 limit");
inputKeyPress("Space");
inputApi.debugAdvanceStageSelect(1);
inputSnapshot = inputApi.debugSnapshot();
assert(inputSnapshot.stage === 2, "stage-selection A should increment the stage");
inputKeyPress("KeyF");
inputApi.debugAdvanceStageSelect(1);
inputSnapshot = inputApi.debugSnapshot();
assert(inputSnapshot.stage === 1, "stage-selection B should decrement the stage");
inputKeyPress("KeyF");
inputApi.debugAdvanceStageSelect(1);
inputSnapshot = inputApi.debugSnapshot();
assert(inputSnapshot.stage === 1, "stage-selection B should remain clamped at stage 1");
const stageSelectInputCadenceProbe = inputApi.debugStageSelectInputCadenceProbe();
assert(stageSelectInputCadenceProbe.initialPress.stage === 11 && stageSelectInputCadenceProbe.initialPress.frameLow === 0, "a fresh stage-selection press should apply on its first sampled frame and reset only the low frame counter");
assert(stageSelectInputCadenceProbe.initialPress.frameHigh === 0x22, "stage-selection input must preserve the independent high frame counter");
assert(stageSelectInputCadenceProbe.beforeHeldRepeat.stage === 11 && stageSelectInputCadenceProbe.beforeHeldRepeat.frameLow === 7, "a held stage-selection button should not repeat during the first seven frames after a change");
assert(stageSelectInputCadenceProbe.heldRepeat.stage === 12 && stageSelectInputCadenceProbe.heldRepeat.frameLow === 0, "a held stage-selection button should repeat on the eighth low-counter frame and restart its cadence");
assert(stageSelectInputCadenceProbe.upperBoundary.stage === 35 && stageSelectInputCadenceProbe.upperBoundary.frameLow === 0, "stage-selection A should clamp at stage 35 while still resetting the low frame counter");
assert(stageSelectInputCadenceProbe.lowerBoundary.stage === 1 && stageSelectInputCadenceProbe.lowerBoundary.frameLow === 0, "stage-selection B should clamp at stage 1 while still resetting the low frame counter");
assert(stageSelectInputCadenceProbe.heldBeforeBoundary.stage === 20 && stageSelectInputCadenceProbe.heldBeforeBoundary.frameLow === 7, "an already-held stage-selection button should wait for the next divisible-by-eight low-counter frame");
assert(stageSelectInputCadenceProbe.heldAtBoundary.stage === 21 && stageSelectInputCadenceProbe.heldAtBoundary.frameLow === 0, "an already-held stage-selection button should trigger exactly at that low-counter boundary");
assert(stageSelectInputCadenceProbe.simultaneousPress.stage === 21, "stage-selection A should retain priority when A and B are newly sampled together");
assert(stageSelectInputCadenceProbe.heldAPriority.stage === 21, "an A hold repeat should retain priority over a fresh B press on the same low-counter boundary");
assert(stageSelectInputCadenceProbe.freshBOutsideARepeat.stage === 19, "a fresh B press should be accepted while A is held outside its repeat boundary");
inputKeyPress("Enter");
inputSnapshot = inputApi.debugSnapshot();
assert(inputSnapshot.screen === "stageIntro" && inputSnapshot.stage === 1 && inputSnapshot.paused === false, "stage-selection Start should begin the selected stage intro");
assert(inputSnapshot.stageStartAudio.active === true && inputSnapshot.stageStartAudio.frame === 0, "starting a stage should trigger all stage-start voices at frame zero");
assert(inputSnapshot.movementAudioMode === "none", "stage-start audio should initially suppress the movement pulse channel");
inputKeyPress("Enter");
inputSnapshot = inputApi.debugSnapshot();
assert(inputSnapshot.screen === "stageIntro" && inputSnapshot.paused === false, "Start-equivalent Enter should not pause before active gameplay begins");
const stageIntroBeforeFinalFrame = inputApi.debugAdvanceStageTransition(94);
assert(stageIntroBeforeFinalFrame.screen === "stageIntro" && stageIntroBeforeFinalFrame.transitionTimer === 1, "stage intro should remain inactive through its first ninety-four frames");
inputSnapshot = inputApi.debugSnapshot();
assert(inputSnapshot.stageStartAudio.active === true && inputSnapshot.stageStartAudio.frame === 94, "stage-start audio should advance with each fixed stage-intro frame");
const stageIntroAfterFinalFrame = inputApi.debugAdvanceStageTransition(1);
assert(stageIntroAfterFinalFrame.screen === "playing" && stageIntroAfterFinalFrame.transitionTimer === 0, "the ninety-fifth stage-intro frame should prepare the active battle screen");
inputSnapshot = inputApi.debugSnapshot();
assert(inputSnapshot.stageStartAudio.active === true && inputSnapshot.stageStartAudio.frame === 95 && inputSnapshot.movementAudioMode === "none", "the stage fanfare should continue into battle and keep movement audio suppressed");
inputKeyPress("Enter");
const pausedStageStartAudio = inputApi.debugAdvanceStageStartAudio(10);
assert(pausedStageStartAudio.paused === true && pausedStageStartAudio.frame === 95, "pause should mute and freeze the stage-start audio frame");
inputKeyPress("Enter");
const stageStartBeforeEnd = inputApi.debugAdvanceStageStartAudio(168);
assert(stageStartBeforeEnd.active === true && stageStartBeforeEnd.frame === 263 && stageStartBeforeEnd.movementAudioMode === "none", "stage-start audio should span the first 169 battle frames and retain movement-channel priority through frame 263");
const stageStartAfterEnd = inputApi.debugAdvanceStageStartAudio(1);
assert(stageStartAfterEnd.active === false && stageStartAfterEnd.frame === 264 && stageStartAfterEnd.movementAudioMode === "enemy", "frame 264 should end the stage fanfare and restore the enemy movement loop");

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
const navigationDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/screen-flow-navigation-diagnostics.js"),
  "utf8"
);
const titleDemoDiagnosticsSource = fs.readFileSync(
  path.join(root, "src/runtime/screen-flow-title-demo-diagnostics.js"),
  "utf8"
);
assert(debugSource.includes("...createScreenFlowDiagnostics(state, deps)"));
assert.equal(diagnosticsSource.includes("eval("), false);
assert.equal(navigationDiagnosticsSource.includes("eval("), false);
assert.equal(titleDemoDiagnosticsSource.includes("eval("), false);
for (const name of SCREEN_FLOW_DIAGNOSTIC_METHODS) {
  assert.equal(debugSource.includes(`${name}(`), false);
  assert.equal(
    diagnosticsSource.includes(`${name}(`) ||
      navigationDiagnosticsSource.includes(`${name}(`) ||
      titleDemoDiagnosticsSource.includes(`${name}(`),
    true
  );
}
assert(debugSource.split(/\r?\n/).length < 4900);

console.log("screen-flow-diagnostics integration test passed");
