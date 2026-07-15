const assert = require("assert").strict;
const path = require("path");
const { createBrowserGameHarness } = require("../helpers/browser-game-harness");

const root = path.resolve(__dirname, "../..");
const { context } = createBrowserGameHarness(root);
const probe = context.window.TankDefender8.debugFrameCounterProbe();

assert(probe.initial.frameLow === 0 && probe.initial.frameHigh === 0, "the original frame counters should support an exact zero reset");
assert(probe.frame63.frameLow === 0x3f && probe.frame63.frameHigh === 0, "the high frame counter should remain zero through low frame 63");
assert(probe.frame64.frameLow === 0x40 && probe.frame64.frameHigh === 1, "low frame 64 should advance the independent high frame counter");
assert(probe.frame128.frameLow === 0x80 && probe.frame128.frameHigh === 2 && probe.frame192.frameLow === 0xc0 && probe.frame192.frameHigh === 3, "the high frame counter should advance at every 64-frame quarter boundary");
assert(probe.frame256.frameLow === 0 && probe.frame256.frameHigh === 4, "wrapping the eight-bit low counter should advance rather than wrap the independent high counter");
assert(probe.highReset.frameLow === 0xab && probe.highReset.frameHigh === 0, "resetting only the high frame counter should preserve the full low byte");
assert(probe.nextQuarterBoundary.frameLow === 0xc0 && probe.nextQuarterBoundary.frameHigh === 1, "a preserved low phase should reach its next high-counter increment after the remaining quarter interval");
assert(probe.lowReset.frameLow === 0 && probe.lowReset.frameHigh === 5, "resetting only the low frame counter should preserve the high counter");
assert(probe.extendedStageEndStart.frameLow === 0 && probe.extendedStageEndStart.frameHigh === 0xfe && probe.extendedStageEndFinish.frameLow === 0 && probe.extendedStageEndFinish.frameHigh === 2, "an extended stage ending should wrap the original high counter from FE to 02 over exactly 256 frames");
assert(probe.paused.frameLow === 0x40 && probe.paused.frameHigh === 8 && probe.paused.tick === 31 && probe.paused.pauseElapsed === 1, "the NMI-style counters should advance during pause while active battle time remains frozen");
assert(probe.stageActivation.screen === "playing" && probe.stageActivation.frameLow === 0x40 && probe.stageActivation.frameHigh === 0, "activating a stage should reset only the high counter after the global low counter advances");

console.log("frame-counter integration test passed");
