(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.screenFlowTitleDemoDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /** Builds title-demo and hidden-message lifecycle probes. */
  function createScreenFlowTitleDemoDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");

    var applyPowerUp = scope.applyPowerUp;
    var clearTransientBattleState = scope.clearTransientBattleState;
    var DEMO_DISPLAY_STAGE = scope.DEMO_DISPLAY_STAGE;
    var demoControlForPlayer = scope.demoControlForPlayer;
    var destroyEnemy = scope.destroyEnemy;
    var endTitleDemo = scope.endTitleDemo;
    var enemyTypeDefinitions = scope.enemyTypeDefinitions;
    var exitEditorToTitle = scope.exitEditorToTitle;
    var game = scope.game;
    var hiddenMessagePresentation = scope.hiddenMessagePresentation;
    var HIDDEN_MESSAGE_A_PRESSES = scope.HIDDEN_MESSAGE_A_PRESSES;
    var HIDDEN_MESSAGE_B_PRESSES = scope.HIDDEN_MESSAGE_B_PRESSES;
    var HIDDEN_MESSAGE_END_FRAME = scope.HIDDEN_MESSAGE_END_FRAME;
    var HIDDEN_MESSAGE_REQUIRED_VISITS = scope.HIDDEN_MESSAGE_REQUIRED_VISITS;
    var hiddenMessageTriggerReady = scope.hiddenMessageTriggerReady;
    var keys = scope.keys;
    var makeOriginalConstructionGrid = scope.makeOriginalConstructionGrid;
    var maxActiveEnemies = scope.maxActiveEnemies;
    var POWERUP_SIZE = scope.POWERUP_SIZE;
    var recordHiddenTitleInput = scope.recordHiddenTitleInput;
    var resetFrameCounters = scope.resetFrameCounters;
    var resetTitleIdleHighByte = scope.resetTitleIdleHighByte;
    var startHiddenMessage = scope.startHiddenMessage;
    var TITLE_DEMO_IDLE_FRAMES = scope.TITLE_DEMO_IDLE_FRAMES;
    var update = scope.update;

    return Object.freeze({
      debugTitleDemoLifecycleProbe() {
        var previous = Object.assign({}, game);
        try {
          game.screen = "title";
          game.stage = 1;
          game.titleIdleFrames = 0;
          resetFrameCounters();
          game.demoMode = false;
          game.constructionUsed = false;
          clearTransientBattleState();
          game.screen = "title";

          game.frameLow = 0xab;
          game.frameHigh = 0x05;
          game.titleIdleFrames = 0x05ab;
          resetTitleIdleHighByte();
          var selectionReset = {
            idleFrames: game.titleIdleFrames,
            frameLow: game.frameLow,
            frameHigh: game.frameHigh
          };
          resetFrameCounters();
          game.titleIdleFrames = 0;

          for (var frame = 0; frame < TITLE_DEMO_IDLE_FRAMES - 1; frame += 1) update();
          var beforeTimeout = {
            screen: game.screen,
            idleFrames: game.titleIdleFrames,
            frameLow: game.frameLow,
            frameHigh: game.frameHigh,
            demoMode: game.demoMode
          };
          update();
          var afterTimeout = {
            screen: game.screen,
            stage: game.stage,
            playerCount: game.playerCount,
            playerIds: game.players.map(function (player) { return player.id; }),
            maxActiveEnemies: maxActiveEnemies(),
            transitionTimer: game.transitionTimer,
            frameLow: game.frameLow,
            frameHigh: game.frameHigh,
            demoMode: game.demoMode
          };

          var player1 = game.players[0];
          var player2 = game.players[1];
          player1.spawnFlash = 0;
          player2.spawnFlash = 0;
          player1.x = 80;
          player1.y = 160;
          player2.x = 112;
          player2.y = 160;
          game.enemies = [
            { id: 202, slotIndex: 2, alive: true, spawnFlash: 0, x: 32, y: 32, w: 14, h: 14 },
            { id: 203, slotIndex: 3, alive: true, spawnFlash: 0, x: 160, y: 32, w: 14, h: 14 },
            { id: 204, slotIndex: 4, alive: true, spawnFlash: 0, x: 96, y: 48, w: 14, h: 14 }
          ];
          game.powerUp = null;
          var enemyTargets = [demoControlForPlayer(player1), demoControlForPlayer(player2)];
          game.frameHigh = 2;
          var axisPhaseTwoTargets = [demoControlForPlayer(player1), demoControlForPlayer(player2)];
          game.powerUp = { type: "star", x: 64, y: 64, w: POWERUP_SIZE, h: POWERUP_SIZE, ttl: 0 };
          var powerUpTarget = demoControlForPlayer(player1);

          player1.score = 0;
          player1.stagePoints = 0;
          player1.level = 0;
          player1.stageKills = Array(enemyTypeDefinitions().length).fill(0);
          game.scorePopups = [];
          applyPowerUp(player1, "star");
          var scoredEnemy = {
            id: 299,
            alive: true,
            score: 400,
            typeIndex: 3,
            x: 80,
            y: 80,
            w: 14,
            h: 14
          };
          destroyEnemy(scoredEnemy, player1.id);
          var scoreIsolation = {
            score: player1.score,
            stagePoints: player1.stagePoints,
            stageKills: player1.stageKills.slice(),
            level: player1.level,
            scorePopupCount: game.scorePopups.length
          };

          endTitleDemo();
          var afterExit = {
            screen: game.screen,
            stage: game.stage,
            demoMode: game.demoMode,
            playerCount: game.players.length,
            idleFrames: game.titleIdleFrames
          };

          game.constructionUsed = true;
          game.frameLow = 0x3f;
          game.frameHigh = 0x09;
          game.titleIdleFrames = TITLE_DEMO_IDLE_FRAMES - 1;
          update();
          var afterConstruction = {
            screen: game.screen,
            idleFrames: game.titleIdleFrames,
            frameLow: game.frameLow,
            frameHigh: game.frameHigh,
            demoMode: game.demoMode
          };
          return {
            timeoutFrames: TITLE_DEMO_IDLE_FRAMES,
            displayStage: DEMO_DISPLAY_STAGE,
            selectionReset: selectionReset,
            beforeTimeout: beforeTimeout,
            afterTimeout: afterTimeout,
            enemyTargets: enemyTargets,
            axisPhaseTwoTargets: axisPhaseTwoTargets,
            powerUpTarget: powerUpTarget,
            scoreIsolation: scoreIsolation,
            afterExit: afterExit,
            afterConstruction: afterConstruction
          };
        } finally {
          Object.assign(game, previous);
        }
      },
      debugHiddenMessageLifecycleProbe() {
        var previous = Object.assign({}, game);
        var previousKeys = new Set(keys);
        try {
          game.screen = "editor";
          game.titleMenu = 2;
          game.constructionVisits = HIDDEN_MESSAGE_REQUIRED_VISITS - 1;
          game.constructionUsed = true;
          game.hiddenInputCount = 0;
          if (!game.editorGrid) game.editorGrid = makeOriginalConstructionGrid();
          exitEditorToTitle();
          var afterSeventhExit = {
            screen: game.screen,
            visits: game.constructionVisits,
            constructionUsed: game.constructionUsed,
            inputCount: game.hiddenInputCount
          };

          keys.clear();
          keys.add("ArrowDown");
          for (var press = 0; press < HIDDEN_MESSAGE_A_PRESSES; press += 1) {
            recordHiddenTitleInput("KeyF");
          }
          var afterA = game.hiddenInputCount;
          keys.delete("ArrowDown");
          keys.add("ArrowRight");
          for (var bPress = 0; bPress < HIDDEN_MESSAGE_B_PRESSES; bPress += 1) {
            recordHiddenTitleInput("KeyG");
          }
          var afterB = game.hiddenInputCount;
          var triggerReady = hiddenMessageTriggerReady();

          startHiddenMessage();
          var presentations = [127, 128, 320, 383, 384, 640, 641, 668, 669, 886]
            .map(function (frame) { return hiddenMessagePresentation(frame); });
          game.hiddenMessageElapsed = HIDDEN_MESSAGE_END_FRAME - 1;
          update();
          var afterCutscene = {
            screen: game.screen,
            visits: game.constructionVisits,
            elapsed: game.hiddenMessageElapsed,
            inputCount: game.hiddenInputCount
          };
          game.constructionVisits = 0xff;
          exitEditorToTitle();
          var wrappedVisits = game.constructionVisits;
          game.titleMenu = 0;
          game.constructionVisits = HIDDEN_MESSAGE_REQUIRED_VISITS;
          game.hiddenInputCount = 0x74;
          startHiddenMessage();
          game.hiddenMessageElapsed = HIDDEN_MESSAGE_END_FRAME - 1;
          update();
          var alternateSelection = {
            screen: game.screen,
            players: game.stageSelectPlayers
          };
          return {
            requiredVisits: HIDDEN_MESSAGE_REQUIRED_VISITS,
            requiredAPresses: HIDDEN_MESSAGE_A_PRESSES,
            requiredBPresses: HIDDEN_MESSAGE_B_PRESSES,
            expectedInputCount: 0x74,
            endFrame: HIDDEN_MESSAGE_END_FRAME,
            afterSeventhExit: afterSeventhExit,
            afterA: afterA,
            afterB: afterB,
            triggerReady: triggerReady,
            presentations: presentations,
            afterCutscene: afterCutscene,
            wrappedVisits: wrappedVisits,
            alternateSelection: alternateSelection
          };
        } finally {
          keys.clear();
          previousKeys.forEach(function (key) { keys.add(key); });
          Object.assign(game, previous);
        }
      }
    });
  }

  return Object.freeze({
    createScreenFlowTitleDemoDiagnostics: createScreenFlowTitleDemoDiagnostics
  });
});
