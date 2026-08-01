const assert = require("assert").strict;
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");
const source = fs.readFileSync(path.join(root, "src/game.js"), "utf8");
const applicationFlowSource = fs.readFileSync(
  path.join(root, "src/runtime/application-flow-composition-runtime.js"),
  "utf8"
);
const inputCompositionSource = fs.readFileSync(
  path.join(root, "src/runtime/input-composition-runtime.js"),
  "utf8"
);
const audioBridgeSource = fs.readFileSync(
  path.join(root, "src/runtime/audio-bridge.js"),
  "utf8"
);
const audioVoiceRuntimeSource = fs.readFileSync(
  path.join(root, "src/runtime/audio-voice-runtime.js"),
  "utf8"
);
assert(!/\bvar [A-Za-z0-9_]+ = fn\.[A-Za-z0-9_]+;/.test(source), "game.js should not copy registered methods into local aliases");
assert(!/\bvar [A-Za-z0-9_]+ = state\.fn\.[A-Za-z0-9_]+;/.test(source), "game.js should not keep deferred state.fn aliases");
assert(source.includes("state.fn.loadHighScore();"), "the main loop should call the registered high-score method directly");
assert(audioBridgeSource.includes('setupAudioVoiceRuntime(state, deps)'), "audio bridge should compose the extracted voice runtime");
assert(audioVoiceRuntimeSource.includes("fn.initAudio = function"), "voice runtime should own Web Audio initialization");
assert(audioVoiceRuntimeSource.includes("fn.playSound = function"), "voice runtime should own generic sound dispatch");
assert(applicationFlowSource.includes("playSound: fn.playSound"), "startup callbacks should use registered audio methods");
assert(applicationFlowSource.includes("stopGameOverAudio: fn.stopGameOverAudio"), "post-game startup should use registered audio methods");
assert(inputCompositionSource.includes("activateTitleMenu: fn.activateTitleMenu"), "input callbacks should use registered state.fn methods");
assert(inputCompositionSource.includes("stageEnemiesCleared: function () { return fn.stageEnemiesCleared(); }"), "dynamic input callbacks should preserve state.fn lookup");

console.log("game-audio-aliases unit test passed");
