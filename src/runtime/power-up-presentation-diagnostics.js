(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.powerUpPresentationDiagnostics = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  /** Builds power-up type, shared-random, and presentation probes. */
  function createPowerUpPresentationDiagnostics(scope) {
    if (!scope || typeof scope !== "object") throw new Error("scope must be an object");

    var aiRoll = scope.aiRoll;
    var battleDisplayFrame = scope.battleDisplayFrame;
    var FREE_SPRITE_MANIFEST = scope.FREE_SPRITE_MANIFEST;
    var game = scope.game;
    var isPowerUpVisible = scope.isPowerUpVisible;
    var originalPowerUpRandomTable = scope.originalPowerUpRandomTable;
    var powerTypes = scope.powerTypes;
    var preparePausedDebugBattle = scope.preparePausedDebugBattle;
    var randomByte = scope.randomByte;
    var randomPowerUpType = scope.randomPowerUpType;
    var selectPowerUpSpawnSpot = scope.selectPowerUpSpawnSpot;
    var update = scope.update;
    var waterFrameName = scope.waterFrameName;

    return Object.freeze({
      debugPowerUpTypePoolProbe() {
        var starFrame = FREE_SPRITE_MANIFEST.sprites.powerUp.frames.star || [];
        var weights = Object.fromEntries(powerTypes.map(function (type) { return [type, 0]; }));
        for (var tableIndex = 0; tableIndex < originalPowerUpRandomTable.length; tableIndex += 1) {
          weights[originalPowerUpRandomTable[tableIndex]] += 1;
        }
        return {
          types: powerTypes.slice(),
          randomTable: originalPowerUpRandomTable.slice(),
          sampledTable: Array.from({ length: 8 }, function (_, byte) {
            return randomPowerUpType(function () { return byte / 256; });
          }),
          weights: weights,
          starFrameParts: starFrame.length,
          starPrimaryParts: starFrame.filter(function (part) { return part.role === "primary"; }).length
        };
      },
      debugBattleRandomProbe() {
        var previous = {
          randomValue: game.randomValue,
          randomIndex: game.randomIndex,
          frameHigh: game.frameHigh
        };
        try {
          game.randomValue = 0x5a;
          game.randomIndex = 0xfe;
          game.frameHigh = 0x22;
          var aiDecision = aiRoll(1 / 16);
          var afterAiIndex = game.randomIndex;
          var secondType = randomPowerUpType();
          var afterPowerUpIndex = game.randomIndex;
          var location = selectPowerUpSpawnSpot(
            [{ id: 0 }, { id: 1 }],
            (randomByte() << 8) | randomByte(),
            null
          );
          var afterLocationIndex = game.randomIndex;
          var beforeInjected = { value: game.randomValue, index: game.randomIndex };
          var injected = randomByte(function () { return 0.5; });
          return {
            shared: {
              aiDecision: aiDecision,
              afterAiIndex: afterAiIndex,
              secondType: secondType,
              afterPowerUpIndex: afterPowerUpIndex,
              locationId: location.id,
              afterLocationIndex: afterLocationIndex
            },
            injected: injected,
            injectedPreservedState: (
              game.randomValue === beforeInjected.value && game.randomIndex === beforeInjected.index
            )
          };
        } finally {
          Object.assign(game, previous);
        }
      },
      debugPowerUpFlashCadenceProbe() {
        return Array.from({ length: 32 }, function (_, tick) {
          return { tick: tick, visible: isPowerUpVisible(tick) };
        });
      },
      debugPausedPowerUpVisualProbe() {
        var previous = Object.assign({}, game);
        try {
          preparePausedDebugBattle(7);

          var snapshot = function () {
            return {
              tick: game.tick,
              pauseElapsed: game.pauseElapsed,
              displayFrame: battleDisplayFrame(),
              powerUpVisible: isPowerUpVisible(battleDisplayFrame()),
              waterFrame: waterFrameName(game.frameLow)
            };
          };
          var initial = snapshot();
          update();
          var afterOneFrame = snapshot();
          for (var frame = 0; frame < 8; frame += 1) update();
          var afterNineFrames = snapshot();

          game.paused = false;
          game.tick = 23;
          var afterResume = snapshot();
          return { initial: initial, afterOneFrame: afterOneFrame, afterNineFrames: afterNineFrames, afterResume: afterResume };
        } finally {
          Object.assign(game, previous);
        }
      },
      debugWaterAnimationCadenceProbe() {
        return [0, 31, 32, 63, 64, 95, 96].map(function (tick) {
          return { tick: tick, frame: waterFrameName(tick) };
        });
      }
    });
  }

  return Object.freeze({
    createPowerUpPresentationDiagnostics: createPowerUpPresentationDiagnostics
  });
});
