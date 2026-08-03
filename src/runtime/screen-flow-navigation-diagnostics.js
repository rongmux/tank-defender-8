(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.screenFlowNavigationDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /** Builds title-layout, frame-counter, and stage-select input probes. */
  function createScreenFlowNavigationDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");

    var advanceFrameCounters = scope.advanceFrameCounters;
    var EXTENDED_STAGE_END_FRAME_HIGH = scope.EXTENDED_STAGE_END_FRAME_HIGH;
    var game = scope.game;
    var keys = scope.keys;
    var pendingStageSelectPresses = scope.pendingStageSelectPresses;
    var PLAYER_GAME_OVER_STAGE_END_DELAY = scope.PLAYER_GAME_OVER_STAGE_END_DELAY;
    var resetFrameCounterHigh = scope.resetFrameCounterHigh;
    var resetFrameCounterLow = scope.resetFrameCounterLow;
    var resetFrameCounters = scope.resetFrameCounters;
    var stageSelectLimit = scope.stageSelectLimit;
    var syncMovementAudio = scope.syncMovementAudio;
    var TILE = scope.TILE;
    var titleScoreLayout = scope.titleScoreLayout;
    var update = scope.update;
    var updateStageSelectControls = scope.updateStageSelectControls;

    return Object.freeze({
      debugTitleScoreLayoutProbe(menuIndex) {
        return titleScoreLayout(menuIndex).map(function (item) { return Object.assign({}, item); });
      },
      debugFrameCounterProbe() {
        var previous = Object.assign({}, game);
        var snapshot = function () {
          return { frameLow: game.frameLow, frameHigh: game.frameHigh };
        };
        var advance = function (frames) {
          for (var frame = 0; frame < frames; frame += 1) advanceFrameCounters();
          return snapshot();
        };
        try {
          resetFrameCounters();
          var initial = snapshot();
          var frame63 = advance(63);
          var frame64 = advance(1);
          var frame128 = advance(64);
          var frame192 = advance(64);
          var frame256 = advance(64);

          game.frameLow = 0xab;
          game.frameHigh = 0x05;
          resetFrameCounterHigh();
          var highReset = snapshot();
          var nextQuarterBoundary = advance(0x15);

          game.frameLow = 0xab;
          game.frameHigh = 0x05;
          resetFrameCounterLow();
          var lowReset = snapshot();

          game.frameLow = 0;
          game.frameHigh = EXTENDED_STAGE_END_FRAME_HIGH;
          var extendedStageEndStart = snapshot();
          var extendedStageEndFinish = advance(PLAYER_GAME_OVER_STAGE_END_DELAY);

          game.screen = "playing";
          game.demoMode = false;
          game.paused = true;
          game.pauseElapsed = 0;
          game.tick = 31;
          game.frameLow = 0x3f;
          game.frameHigh = 0x07;
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
          game.players = [{ alive: true, lives: 1, respawn: 0 }];
          game.enemies = [];
          game.enemySpawned = 0;
          game.clearPendingTimer = 0;
          game.scorePopups = [];
          update();
          var paused = Object.assign(snapshot(), {
            tick: game.tick,
            pauseElapsed: game.pauseElapsed
          });

          game.screen = "stageIntro";
          game.transitionTimer = 1;
          game.paused = false;
          game.frameLow = 0x3f;
          game.frameHigh = 0x09;
          update();
          var stageActivation = Object.assign(snapshot(), {
            screen: game.screen
          });

          return {
            initial: initial,
            frame63: frame63,
            frame64: frame64,
            frame128: frame128,
            frame192: frame192,
            frame256: frame256,
            highReset: highReset,
            nextQuarterBoundary: nextQuarterBoundary,
            lowReset: lowReset,
            extendedStageEndStart: extendedStageEndStart,
            extendedStageEndFinish: extendedStageEndFinish,
            paused: paused,
            stageActivation: stageActivation
          };
        } finally {
          Object.assign(game, previous);
          syncMovementAudio();
        }
      },
      debugStageSelectInputCadenceProbe() {
        var previous = Object.assign({}, game);
        var previousKeys = Array.from(keys);
        var previousPresses = Array.from(pendingStageSelectPresses);
        var snapshot = function () {
          return { stage: game.stage, frameLow: game.frameLow, frameHigh: game.frameHigh };
        };
        var step = function () {
          advanceFrameCounters();
          updateStageSelectControls();
        };
        try {
          keys.clear();
          pendingStageSelectPresses.clear();
          game.screen = "stageSelect";
          game.stage = 10;
          game.frameLow = 5;
          game.frameHigh = 0x22;

          keys.add("Space");
          pendingStageSelectPresses.add("Space");
          step();
          var initialPress = snapshot();
          for (var frame = 0; frame < 7; frame += 1) step();
          var beforeHeldRepeat = snapshot();
          step();
          var heldRepeat = snapshot();

          keys.clear();
          game.stage = stageSelectLimit();
          game.frameLow = 3;
          game.frameHigh = 0x22;
          pendingStageSelectPresses.add("Space");
          step();
          var upperBoundary = snapshot();

          game.stage = 1;
          game.frameLow = 3;
          game.frameHigh = 0x22;
          pendingStageSelectPresses.add("KeyF");
          step();
          var lowerBoundary = snapshot();

          game.stage = 20;
          game.frameLow = 6;
          game.frameHigh = 0x22;
          keys.add("Space");
          step();
          var heldBeforeBoundary = snapshot();
          step();
          var heldAtBoundary = snapshot();

          keys.clear();
          game.stage = 20;
          game.frameLow = 4;
          game.frameHigh = 0x22;
          pendingStageSelectPresses.add("Space");
          pendingStageSelectPresses.add("KeyF");
          step();
          var simultaneousPress = snapshot();

          keys.clear();
          keys.add("Space");
          game.stage = 20;
          game.frameLow = 7;
          game.frameHigh = 0x22;
          pendingStageSelectPresses.add("KeyF");
          step();
          var heldAPriority = snapshot();

          game.stage = 20;
          game.frameLow = 6;
          game.frameHigh = 0x22;
          pendingStageSelectPresses.add("KeyF");
          step();
          var freshBOutsideARepeat = snapshot();

          return {
            initialPress: initialPress,
            beforeHeldRepeat: beforeHeldRepeat,
            heldRepeat: heldRepeat,
            upperBoundary: upperBoundary,
            lowerBoundary: lowerBoundary,
            heldBeforeBoundary: heldBeforeBoundary,
            heldAtBoundary: heldAtBoundary,
            simultaneousPress: simultaneousPress,
            heldAPriority: heldAPriority,
            freshBOutsideARepeat: freshBOutsideARepeat
          };
        } finally {
          Object.assign(game, previous);
          keys.clear();
          for (var keyIndex = 0; keyIndex < previousKeys.length; keyIndex += 1) keys.add(previousKeys[keyIndex]);
          pendingStageSelectPresses.clear();
          for (var pressIndex = 0; pressIndex < previousPresses.length; pressIndex += 1) {
            pendingStageSelectPresses.add(previousPresses[pressIndex]);
          }
        }
      }
    });
  }

  return Object.freeze({
    createScreenFlowNavigationDiagnostics: createScreenFlowNavigationDiagnostics
  });
});
