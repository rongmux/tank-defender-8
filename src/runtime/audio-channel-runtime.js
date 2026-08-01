(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.audioChannelRuntime = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function setupAudioChannelRuntime(state) {
    var fn = state.fn;

    // Fixed-frame event channel bindings stay together so their cross-channel priority updates remain visible.
    fn.stageStartAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("stageStart", frame); };
    fn.stageStartAudioAudibility = function () { return fn.currentAudioAudibility().stageStartAudibility; };
    fn.syncStageStartAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.stageStart, "stageStart", fn.stageStartAudioAudibility()); };
    fn.startStageStartAudio = function () { fn.startFixedFrameAudio(state.audio.stageStart, "stageStart"); fn.syncBrickHitAudioNodes(); fn.syncBaseHitAudioNodes(); fn.syncEnemyHitAudioNodes(); };
    fn.stopStageStartAudio = function () { fn.stopFixedFrameAudio(state.audio.stageStart); fn.syncBaseHitAudioNodes(); };
    fn.updateStageStartAudio = function () { fn.updateFixedFrameAudio(state.audio.stageStart, "stageStart"); fn.syncBrickHitAudioNodes(); fn.syncBaseHitAudioNodes(); fn.syncEnemyHitAudioNodes(); };

    fn.bonusLifeAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("bonusLife", frame); };
    fn.bonusLifeAudioAudibility = function () { return fn.currentAudioAudibility().bonusLifeAudibility; };
    fn.syncBonusLifeAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.bonusLife, "bonusLife", fn.bonusLifeAudioAudibility()); };
    fn.startBonusLifeAudio = function () { fn.startFixedFrameAudio(state.audio.bonusLife, "bonusLife"); fn.syncPowerUpPickupAudioNodes(); fn.syncPowerUpAppearAudioNodes(); fn.syncBaseHitAudioNodes(); fn.syncSteelHitAudioNodes(); fn.syncEnemyHitAudioNodes(); fn.syncPlayerShootAudioNodes(); fn.syncMovementIceAudioNodes(); fn.syncStageBonusAudioNodes(); };
    fn.stopBonusLifeAudio = function () { fn.stopFixedFrameAudio(state.audio.bonusLife); fn.syncBaseHitAudioNodes(); fn.syncStageBonusAudioNodes(); };
    fn.updateBonusLifeAudio = function () { fn.updateFixedFrameAudio(state.audio.bonusLife, "bonusLife"); fn.syncPowerUpPickupAudioNodes(); fn.syncPowerUpAppearAudioNodes(); fn.syncBaseHitAudioNodes(); fn.syncSteelHitAudioNodes(); fn.syncEnemyHitAudioNodes(); fn.syncPlayerShootAudioNodes(); fn.syncMovementIceAudioNodes(); fn.syncStageBonusAudioNodes(); };
    fn.bonusLifePulse1Active = function () { return state.audio.bonusLife.active && Boolean(fn.bonusLifeAudioPresentation(state.audio.bonusLife.frame).voices[0]); };
    fn.bonusLifePulse2Active = function () { return state.audio.bonusLife.active && Boolean(fn.bonusLifeAudioPresentation(state.audio.bonusLife.frame).voices[1]); };

    fn.powerUpPickupAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("powerUp", frame); };
    fn.powerUpPickupAudioAudible = function () { return fn.currentAudioAudibility().powerUpPickupAudible; };
    fn.syncPowerUpPickupAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.powerUpPickup, "powerUp", fn.powerUpPickupAudioAudible()); };
    fn.startPowerUpPickupAudio = function () { fn.startFixedFrameAudio(state.audio.powerUpPickup, "powerUp", fn.powerUpPickupAudioAudible()); fn.syncPowerUpAppearAudioNodes(); fn.syncBaseHitAudioNodes(); fn.syncSteelHitAudioNodes(); fn.syncEnemyHitAudioNodes(); };
    fn.stopPowerUpPickupAudio = function () { fn.stopFixedFrameAudio(state.audio.powerUpPickup); fn.syncBaseHitAudioNodes(); };
    fn.updatePowerUpPickupAudio = function () { fn.updateFixedFrameAudio(state.audio.powerUpPickup, "powerUp", fn.powerUpPickupAudioAudible()); fn.syncPowerUpAppearAudioNodes(); fn.syncBaseHitAudioNodes(); fn.syncSteelHitAudioNodes(); fn.syncEnemyHitAudioNodes(); };

    fn.powerUpAppearAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("powerUpAppear", frame); };
    fn.powerUpAppearAudioAudible = function () { return fn.currentAudioAudibility().powerUpAppearAudible; };
    fn.syncPowerUpAppearAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.powerUpAppear, "powerUpAppear", fn.powerUpAppearAudioAudible()); };
    fn.startPowerUpAppearAudio = function () { fn.startFixedFrameAudio(state.audio.powerUpAppear, "powerUpAppear", fn.powerUpAppearAudioAudible()); fn.syncBaseHitAudioNodes(); fn.syncSteelHitAudioNodes(); fn.syncEnemyHitAudioNodes(); };
    fn.stopPowerUpAppearAudio = function () { fn.stopFixedFrameAudio(state.audio.powerUpAppear); fn.syncBaseHitAudioNodes(); };
    fn.updatePowerUpAppearAudio = function () { fn.updateFixedFrameAudio(state.audio.powerUpAppear, "powerUpAppear", fn.powerUpAppearAudioAudible()); fn.syncBaseHitAudioNodes(); fn.syncSteelHitAudioNodes(); fn.syncEnemyHitAudioNodes(); };

    fn.brickHitAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("brickHit", frame); };
    fn.brickHitAudioAudible = function () { return fn.currentAudioAudibility().brickHitAudible; };
    fn.syncBrickHitAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.brickHit, "brickHit", fn.brickHitAudioAudible()); };
    fn.startBrickHitAudio = function () { fn.startFixedFrameAudio(state.audio.brickHit, "brickHit", fn.brickHitAudioAudible()); };
    fn.stopBrickHitAudio = function () { fn.stopFixedFrameAudio(state.audio.brickHit); };
    fn.updateBrickHitAudio = function () { fn.updateFixedFrameAudio(state.audio.brickHit, "brickHit", fn.brickHitAudioAudible()); };

    fn.baseHitAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("baseHit", frame); };
    fn.baseHitAudioAudible = function () { return fn.currentAudioAudibility().baseHitAudible; };
    fn.syncBaseHitAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.baseHit, "baseHit", fn.baseHitAudioAudible()); };
    fn.syncLowerPriorityPulse2AudioNodes = function () { fn.syncStageBonusAudioNodes(); };
    fn.startBaseHitAudio = function () { fn.startFixedFrameAudio(state.audio.baseHit, "baseHit", fn.baseHitAudioAudible()); fn.syncStageBonusAudioNodes(); };
    fn.stopBaseHitAudio = function () { fn.stopFixedFrameAudio(state.audio.baseHit); fn.syncStageBonusAudioNodes(); };
    fn.updateBaseHitAudio = function () { fn.updateFixedFrameAudio(state.audio.baseHit, "baseHit", fn.baseHitAudioAudible()); fn.syncStageBonusAudioNodes(); };

    fn.steelHitAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("steelHit", frame); };
    fn.steelHitAudioAudible = function () { return fn.currentAudioAudibility().steelHitAudible; };
    fn.syncSteelHitAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.steelHit, "steelHit", fn.steelHitAudioAudible()); };
    fn.startSteelHitAudio = function () { fn.startFixedFrameAudio(state.audio.steelHit, "steelHit", fn.steelHitAudioAudible()); };
    fn.stopSteelHitAudio = function () { fn.stopFixedFrameAudio(state.audio.steelHit); };
    fn.updateSteelHitAudio = function () { fn.updateFixedFrameAudio(state.audio.steelHit, "steelHit", fn.steelHitAudioAudible()); };

    fn.enemyHitAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("enemyHit", frame); };
    fn.enemyHitAudioAudible = function () { return fn.currentAudioAudibility().enemyHitAudible; };
    fn.syncEnemyHitAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.enemyHit, "enemyHit", fn.enemyHitAudioAudible()); };
    fn.startEnemyHitAudio = function () { fn.startFixedFrameAudio(state.audio.enemyHit, "enemyHit", fn.enemyHitAudioAudible()); };
    fn.stopEnemyHitAudio = function () { fn.stopFixedFrameAudio(state.audio.enemyHit); };
    fn.updateEnemyHitAudio = function () { fn.updateFixedFrameAudio(state.audio.enemyHit, "enemyHit", fn.enemyHitAudioAudible()); };

    fn.enemyDestroyAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("enemyDestroy", frame); };
    fn.enemyDestroyAudioAudible = function () { return fn.currentAudioAudibility().enemyDestroyAudible; };
    fn.syncEnemyDestroyAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.enemyDestroy, "enemyDestroy", fn.enemyDestroyAudioAudible()); };
    fn.startEnemyDestroyAudio = function () { fn.startFixedFrameAudio(state.audio.enemyDestroy, "enemyDestroy", fn.enemyDestroyAudioAudible()); };
    fn.stopEnemyDestroyAudio = function () { fn.stopFixedFrameAudio(state.audio.enemyDestroy); };
    fn.updateEnemyDestroyAudio = function () { fn.updateFixedFrameAudio(state.audio.enemyDestroy, "enemyDestroy", fn.enemyDestroyAudioAudible()); };

    fn.playerDestroyAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("playerDestroy", frame); };
    fn.syncPlayerDestroyAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.playerDestroy, "playerDestroy", true); };
    fn.startPlayerDestroyAudio = function () { fn.startFixedFrameAudio(state.audio.playerDestroy, "playerDestroy", true); fn.syncEnemyDestroyAudioNodes(); };
    fn.stopPlayerDestroyAudio = function () { fn.stopFixedFrameAudio(state.audio.playerDestroy); fn.syncEnemyDestroyAudioNodes(); };
    fn.updatePlayerDestroyAudio = function () { fn.updateFixedFrameAudio(state.audio.playerDestroy, "playerDestroy", true); fn.syncEnemyDestroyAudioNodes(); };

    fn.playerShootAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("playerShoot", frame); };
    fn.playerShootAudioAudible = function () { return fn.currentAudioAudibility().playerShootAudible; };
    fn.syncPlayerShootAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.playerShoot, "playerShoot", fn.playerShootAudioAudible()); };
    fn.startPlayerShootAudio = function () { fn.startFixedFrameAudio(state.audio.playerShoot, "playerShoot", fn.playerShootAudioAudible()); fn.syncMovementIceAudioNodes(); };
    fn.stopPlayerShootAudio = function () { fn.stopFixedFrameAudio(state.audio.playerShoot); };
    fn.updatePlayerShootAudio = function () { fn.updateFixedFrameAudio(state.audio.playerShoot, "playerShoot", fn.playerShootAudioAudible()); fn.syncMovementIceAudioNodes(); };

    fn.movementIceAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("movementIce", frame); };
    fn.movementIceAudioAudible = function () { return fn.currentAudioAudibility().movementIceAudible; };
    fn.syncMovementIceAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.movementIce, "movementIce", fn.movementIceAudioAudible()); };
    fn.startMovementIceAudio = function () { fn.startFixedFrameAudio(state.audio.movementIce, "movementIce", fn.movementIceAudioAudible()); };
    fn.stopMovementIceAudio = function () { fn.stopFixedFrameAudio(state.audio.movementIce); };
    fn.updateMovementIceAudio = function () { fn.updateFixedFrameAudio(state.audio.movementIce, "movementIce", fn.movementIceAudioAudible()); };

    fn.pauseAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("pause", frame); };
    fn.syncPauseAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.pause, "pause", true, true); };
    fn.startPauseAudio = function () {
      fn.startFixedFrameAudio(state.audio.pause, "pause", true, true);
      fn.syncStageStartAudioNodes(); fn.syncBonusLifeAudioNodes(); fn.syncPowerUpPickupAudioNodes(); fn.syncPowerUpAppearAudioNodes();
      fn.syncBrickHitAudioNodes(); fn.syncBaseHitAudioNodes(); fn.syncSteelHitAudioNodes(); fn.syncEnemyHitAudioNodes();
      fn.syncEnemyDestroyAudioNodes(); fn.syncPlayerDestroyAudioNodes(); fn.syncPlayerShootAudioNodes(); fn.syncMovementIceAudioNodes();
    };
    fn.stopPauseAudio = function () { fn.stopFixedFrameAudio(state.audio.pause); };
    fn.updatePauseAudio = function () {
      var wasActive = state.audio.pause.active;
      fn.updateFixedFrameAudio(state.audio.pause, "pause", true, true);
      if (!wasActive || state.audio.pause.active) return;
      fn.syncStageStartAudioNodes(); fn.syncBonusLifeAudioNodes(); fn.syncPowerUpPickupAudioNodes(); fn.syncPowerUpAppearAudioNodes();
      fn.syncBrickHitAudioNodes(); fn.syncBaseHitAudioNodes(); fn.syncSteelHitAudioNodes(); fn.syncEnemyHitAudioNodes();
      fn.syncEnemyDestroyAudioNodes(); fn.syncPlayerDestroyAudioNodes(); fn.syncPlayerShootAudioNodes(); fn.syncMovementIceAudioNodes();
      fn.syncMovementAudio();
    };

    fn.scoreCountAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("scoreCount", frame); };
    fn.syncScoreCountAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.scoreCount, "scoreCount", true); };
    fn.startScoreCountAudio = function () { fn.startFixedFrameAudio(state.audio.scoreCount, "scoreCount", true); };
    fn.stopScoreCountAudio = function () { fn.stopFixedFrameAudio(state.audio.scoreCount); };
    fn.updateScoreCountAudio = function () { fn.updateFixedFrameAudio(state.audio.scoreCount, "scoreCount", true); };

    fn.stageBonusAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("stageBonus", frame); };
    fn.stageBonusAudioAudible = function () { return fn.currentAudioAudibility().stageBonusAudible; };
    fn.syncStageBonusAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.stageBonus, "stageBonus", fn.stageBonusAudioAudible()); };
    fn.startStageBonusAudio = function () { fn.startFixedFrameAudio(state.audio.stageBonus, "stageBonus", fn.stageBonusAudioAudible()); };
    fn.stopStageBonusAudio = function () { fn.stopFixedFrameAudio(state.audio.stageBonus); };
    fn.updateStageBonusAudio = function () { fn.updateFixedFrameAudio(state.audio.stageBonus, "stageBonus", fn.stageBonusAudioAudible()); };

    fn.gameOverAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("gameOver", frame); };
    fn.syncGameOverAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.gameOver, "gameOver", true); };
    fn.startGameOverAudio = function () { fn.startFixedFrameAudio(state.audio.gameOver, "gameOver", true); };
    fn.stopGameOverAudio = function () { fn.stopFixedFrameAudio(state.audio.gameOver); };
    fn.updateGameOverAudio = function () { fn.updateFixedFrameAudio(state.audio.gameOver, "gameOver", true); };

    fn.highScoreAudioPresentation = function (frame) { return fn.fixedFrameAudioPresentation("highScore", frame); };
    fn.syncHighScoreAudioNodes = function () { fn.syncFixedFrameAudioNodes(state.audio.highScore, "highScore", true); };
    fn.startHighScoreAudio = function () { fn.startFixedFrameAudio(state.audio.highScore, "highScore", true); };
    fn.stopHighScoreAudio = function () { fn.stopFixedFrameAudio(state.audio.highScore); };
    fn.updateHighScoreAudio = function () { fn.updateFixedFrameAudio(state.audio.highScore, "highScore", true); };
  }

  return Object.freeze({ setupAudioChannelRuntime: setupAudioChannelRuntime });
});
