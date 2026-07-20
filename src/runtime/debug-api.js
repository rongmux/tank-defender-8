(function (root, factory) {
  "use strict";

  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }

  var modules = root.TankDefender8Modules || (root.TankDefender8Modules = {});
  modules.debugApi = api;
})(typeof window !== "undefined" ? window : globalThis, function () {

  function setupDebugApi(state, deps) {
    // State aliases
    var game = state.game;
    var audioCtx = state.audioCtx;
    var canvas = state.canvas;
    var ctx = state.ctx;
    var builtInStagePack = state.builtInStagePack;
    var keys = state.keys;
    var pendingFirePresses = state.pendingFirePresses;
    var pendingStageSelectPresses = state.pendingStageSelectPresses;
    var movementAudio = state.movementAudio;
    var packFileInput = state.packFileInput;
    var activeSequencedSounds = state.activeSequencedSounds;
    var noiseBufferCache = state.noiseBufferCache;

    // Audio state aliases
    var movementIceAudio = state.audio.movementIce;
    var playerShootAudio = state.audio.playerShoot;
    var steelHitAudio = state.audio.steelHit;
    var enemyHitAudio = state.audio.enemyHit;
    var enemyDestroyAudio = state.audio.enemyDestroy;
    var playerDestroyAudio = state.audio.playerDestroy;
    var baseHitAudio = state.audio.baseHit;
    var brickHitAudio = state.audio.brickHit;
    var stageStartAudio = state.audio.stageStart;
    var bonusLifeAudio = state.audio.bonusLife;
    var powerUpPickupAudio = state.audio.powerUpPickup;
    var powerUpAppearAudio = state.audio.powerUpAppear;
    var pauseAudio = state.audio.pause;
    var scoreCountAudio = state.audio.scoreCount;
    var stageBonusAudio = state.audio.stageBonus;
    var gameOverAudio = state.audio.gameOver;
    var highScoreAudio = state.audio.highScore;

    // Deps aliases (all non-function properties from module-deps)
    var depsAliases = '';
    for (var key in deps) {
      if (deps.hasOwnProperty(key) && typeof deps[key] !== 'function' && key !== 'sharedState') {
        depsAliases += 'var ' + key + ' = deps["' + key.replace(/"/g, '\\"') + '"];';
      }
    }
    eval(depsAliases);

    // CamelCase renames for debug probes (used alongside UPPER_CASE aliases)
    var powerTypes = deps.POWER_UP_TYPES;
    var defaultEnemyTypes = deps.DEFAULT_ENEMY_TYPES;
    var defaultPlayerUpgradeRules = deps.DEFAULT_PLAYER_UPGRADE_RULES;
    var originalPowerUpRandomTable = deps.ORIGINAL_POWER_UP_RANDOM_TABLE;

    // sharedState property aliases (TILE, SCREEN_W, etc.)
    var shAliases = '';
    var sh = deps.sharedState;
    for (var shKey in sh) {
      if (sh.hasOwnProperty(shKey) && typeof sh[shKey] !== 'function') {
        shAliases += 'var ' + shKey + ' = sh["' + shKey.replace(/"/g, '\\"') + '"];';
      }
    }
    eval(shAliases);

    // Deps function aliases (for functions like clamp, cloneGrid, etc.)
    // Skip functions that already have state.fn versions (manual aliases)
    for (var key2 in deps) {
      if (deps.hasOwnProperty(key2) && typeof deps[key2] === 'function' && key2 !== 'requireRuntimeModule' && !state.fn.hasOwnProperty(key2)) {
        depsAliases += 'function ' + key2 + '() { return deps["' + key2.replace(/"/g, '\\"') + '"].apply(deps, arguments); }';
      }
    }
    eval(depsAliases);

    // Stage-runtime function aliases (from state.stageRuntime)
    var stageAliases = '';
    var sr = state.stageRuntime;
    if (sr) {
      for (var srKey in sr) {
        if (sr.hasOwnProperty(srKey) && typeof sr[srKey] === 'function') {
          stageAliases += 'function ' + srKey + '() { return sr["' + srKey.replace(/"/g, '\\"') + '"].apply(sr, arguments); }';
        }
      }
    }
    eval(stageAliases);

    // Function aliases (delegate to state.fn)
    function update() { return state.fn.update.apply(state.fn, arguments); }
    function render() { return state.fn.render.apply(state.fn, arguments); }
    function startGame() { return state.fn.startGame.apply(state.fn, arguments); }
    function playSound() { return state.fn.playSound.apply(state.fn, arguments); }
    function createPlayer() { return state.fn.createPlayer.apply(state.fn, arguments); }
    function gameSettings() { return state.fn.gameSettings.apply(state.fn, arguments); }
    function enemyTypeDefinitions() { return state.fn.enemyTypeDefinitions.apply(state.fn, arguments); }
    function stageCount() { return state.fn.stageCount.apply(state.fn, arguments); }
    function makeGrid() { return state.fn.makeGrid.apply(state.fn, arguments); }
    function makeCell() { return state.fn.makeCell.apply(state.fn, arguments); }
    function setTile() { return state.fn.setTile.apply(state.fn, arguments); }
    function cloneGrid() { return state.fn.cloneGrid.apply(state.fn, arguments); }
    function createStageGrid() { return state.fn.createStageGrid.apply(state.fn, arguments); }
    function prepareBattleGrid() { return state.fn.prepareBattleGrid.apply(state.fn, arguments); }
    function clearTransientBattleState() { return state.fn.clearTransientBattleState.apply(state.fn, arguments); }
    function resetBattleRandom() { return state.fn.resetBattleRandom.apply(state.fn, arguments); }
    function movementAudioModeForState() { return state.fn.movementAudioModeForState.apply(state.fn, arguments); }
    function movementAudioPresentation() { return state.fn.movementAudioPresentation.apply(state.fn, arguments); }
    function currentAudioMixState() { return state.fn.currentAudioMixState.apply(state.fn, arguments); }
    function currentAudioAudibility() { return state.fn.currentAudioAudibility.apply(state.fn, arguments); }
    function syncMovementAudio() { return state.fn.syncMovementAudio.apply(state.fn, arguments); }
    function stopMovementAudio() { return state.fn.stopMovementAudio.apply(state.fn, arguments); }
    function initAudio() { return state.fn.initAudio.apply(state.fn, arguments); }
    function trackSequencedSound() { return state.fn.trackSequencedSound.apply(state.fn, arguments); }
    function stopSound() { return state.fn.stopSound.apply(state.fn, arguments); }
    function beep() { return state.fn.beep.apply(state.fn, arguments); }
    function playSoundVoice() { return state.fn.playSoundVoice.apply(state.fn, arguments); }
    function fixedFrameAudioPresentation() { return state.fn.fixedFrameAudioPresentation.apply(state.fn, arguments); }
    function startFixedFrameAudio() { return state.fn.startFixedFrameAudio.apply(state.fn, arguments); }
    function stopFixedFrameAudio() { return state.fn.stopFixedFrameAudio.apply(state.fn, arguments); }
    function updateFixedFrameAudio() { return state.fn.updateFixedFrameAudio.apply(state.fn, arguments); }
    function syncFixedFrameAudioNodes() { return state.fn.syncFixedFrameAudioNodes.apply(state.fn, arguments); }
    function stopFixedFrameAudioNodes() { return state.fn.stopFixedFrameAudioNodes.apply(state.fn, arguments); }
    function createFixedFrameAudioSource() { return state.fn.createFixedFrameAudioSource.apply(state.fn, arguments); }
    function shortNoiseBuffer() { return state.fn.shortNoiseBuffer.apply(state.fn, arguments); }
    function longNoiseBuffer() { return state.fn.longNoiseBuffer.apply(state.fn, arguments); }
    function startStageStartAudio() { return state.fn.startStageStartAudio.apply(state.fn, arguments); }
    function stopStageStartAudio() { return state.fn.stopStageStartAudio.apply(state.fn, arguments); }
    function updateStageStartAudio() { return state.fn.updateStageStartAudio.apply(state.fn, arguments); }
    function stageStartAudioPresentation() { return state.fn.stageStartAudioPresentation.apply(state.fn, arguments); }
    function stageStartAudioAudibility() { return state.fn.stageStartAudioAudibility.apply(state.fn, arguments); }
    function syncStageStartAudioNodes() { return state.fn.syncStageStartAudioNodes.apply(state.fn, arguments); }
    function startBonusLifeAudio() { return state.fn.startBonusLifeAudio.apply(state.fn, arguments); }
    function stopBonusLifeAudio() { return state.fn.stopBonusLifeAudio.apply(state.fn, arguments); }
    function updateBonusLifeAudio() { return state.fn.updateBonusLifeAudio.apply(state.fn, arguments); }
    function bonusLifeAudioPresentation() { return state.fn.bonusLifeAudioPresentation.apply(state.fn, arguments); }
    function bonusLifeAudioAudibility() { return state.fn.bonusLifeAudioAudibility.apply(state.fn, arguments); }
    function syncBonusLifeAudioNodes() { return state.fn.syncBonusLifeAudioNodes.apply(state.fn, arguments); }
    function bonusLifePulse1Active() { return state.fn.bonusLifePulse1Active.apply(state.fn, arguments); }
    function bonusLifePulse2Active() { return state.fn.bonusLifePulse2Active.apply(state.fn, arguments); }
    function startPowerUpPickupAudio() { return state.fn.startPowerUpPickupAudio.apply(state.fn, arguments); }
    function stopPowerUpPickupAudio() { return state.fn.stopPowerUpPickupAudio.apply(state.fn, arguments); }
    function updatePowerUpPickupAudio() { return state.fn.updatePowerUpPickupAudio.apply(state.fn, arguments); }
    function powerUpPickupAudioPresentation() { return state.fn.powerUpPickupAudioPresentation.apply(state.fn, arguments); }
    function powerUpPickupAudioAudible() { return state.fn.powerUpPickupAudioAudible.apply(state.fn, arguments); }
    function syncPowerUpPickupAudioNodes() { return state.fn.syncPowerUpPickupAudioNodes.apply(state.fn, arguments); }
    function startPowerUpAppearAudio() { return state.fn.startPowerUpAppearAudio.apply(state.fn, arguments); }
    function stopPowerUpAppearAudio() { return state.fn.stopPowerUpAppearAudio.apply(state.fn, arguments); }
    function updatePowerUpAppearAudio() { return state.fn.updatePowerUpAppearAudio.apply(state.fn, arguments); }
    function powerUpAppearAudioPresentation() { return state.fn.powerUpAppearAudioPresentation.apply(state.fn, arguments); }
    function powerUpAppearAudioAudible() { return state.fn.powerUpAppearAudioAudible.apply(state.fn, arguments); }
    function syncPowerUpAppearAudioNodes() { return state.fn.syncPowerUpAppearAudioNodes.apply(state.fn, arguments); }
    function startBrickHitAudio() { return state.fn.startBrickHitAudio.apply(state.fn, arguments); }
    function stopBrickHitAudio() { return state.fn.stopBrickHitAudio.apply(state.fn, arguments); }
    function updateBrickHitAudio() { return state.fn.updateBrickHitAudio.apply(state.fn, arguments); }
    function brickHitAudioPresentation() { return state.fn.brickHitAudioPresentation.apply(state.fn, arguments); }
    function brickHitAudioAudible() { return state.fn.brickHitAudioAudible.apply(state.fn, arguments); }
    function syncBrickHitAudioNodes() { return state.fn.syncBrickHitAudioNodes.apply(state.fn, arguments); }
    function startBaseHitAudio() { return state.fn.startBaseHitAudio.apply(state.fn, arguments); }
    function stopBaseHitAudio() { return state.fn.stopBaseHitAudio.apply(state.fn, arguments); }
    function updateBaseHitAudio() { return state.fn.updateBaseHitAudio.apply(state.fn, arguments); }
    function baseHitAudioPresentation() { return state.fn.baseHitAudioPresentation.apply(state.fn, arguments); }
    function baseHitAudioAudible() { return state.fn.baseHitAudioAudible.apply(state.fn, arguments); }
    function syncBaseHitAudioNodes() { return state.fn.syncBaseHitAudioNodes.apply(state.fn, arguments); }
    function syncLowerPriorityPulse2AudioNodes() { return state.fn.syncLowerPriorityPulse2AudioNodes.apply(state.fn, arguments); }
    function startSteelHitAudio() { return state.fn.startSteelHitAudio.apply(state.fn, arguments); }
    function stopSteelHitAudio() { return state.fn.stopSteelHitAudio.apply(state.fn, arguments); }
    function updateSteelHitAudio() { return state.fn.updateSteelHitAudio.apply(state.fn, arguments); }
    function steelHitAudioPresentation() { return state.fn.steelHitAudioPresentation.apply(state.fn, arguments); }
    function steelHitAudioAudible() { return state.fn.steelHitAudioAudible.apply(state.fn, arguments); }
    function syncSteelHitAudioNodes() { return state.fn.syncSteelHitAudioNodes.apply(state.fn, arguments); }
    function startEnemyHitAudio() { return state.fn.startEnemyHitAudio.apply(state.fn, arguments); }
    function stopEnemyHitAudio() { return state.fn.stopEnemyHitAudio.apply(state.fn, arguments); }
    function updateEnemyHitAudio() { return state.fn.updateEnemyHitAudio.apply(state.fn, arguments); }
    function enemyHitAudioPresentation() { return state.fn.enemyHitAudioPresentation.apply(state.fn, arguments); }
    function enemyHitAudioAudible() { return state.fn.enemyHitAudioAudible.apply(state.fn, arguments); }
    function syncEnemyHitAudioNodes() { return state.fn.syncEnemyHitAudioNodes.apply(state.fn, arguments); }
    function startEnemyDestroyAudio() { return state.fn.startEnemyDestroyAudio.apply(state.fn, arguments); }
    function stopEnemyDestroyAudio() { return state.fn.stopEnemyDestroyAudio.apply(state.fn, arguments); }
    function updateEnemyDestroyAudio() { return state.fn.updateEnemyDestroyAudio.apply(state.fn, arguments); }
    function enemyDestroyAudioPresentation() { return state.fn.enemyDestroyAudioPresentation.apply(state.fn, arguments); }
    function enemyDestroyAudioAudible() { return state.fn.enemyDestroyAudioAudible.apply(state.fn, arguments); }
    function syncEnemyDestroyAudioNodes() { return state.fn.syncEnemyDestroyAudioNodes.apply(state.fn, arguments); }
    function startPlayerDestroyAudio() { return state.fn.startPlayerDestroyAudio.apply(state.fn, arguments); }
    function stopPlayerDestroyAudio() { return state.fn.stopPlayerDestroyAudio.apply(state.fn, arguments); }
    function updatePlayerDestroyAudio() { return state.fn.updatePlayerDestroyAudio.apply(state.fn, arguments); }
    function playerDestroyAudioPresentation() { return state.fn.playerDestroyAudioPresentation.apply(state.fn, arguments); }
    function syncPlayerDestroyAudioNodes() { return state.fn.syncPlayerDestroyAudioNodes.apply(state.fn, arguments); }
    function startPlayerShootAudio() { return state.fn.startPlayerShootAudio.apply(state.fn, arguments); }
    function stopPlayerShootAudio() { return state.fn.stopPlayerShootAudio.apply(state.fn, arguments); }
    function updatePlayerShootAudio() { return state.fn.updatePlayerShootAudio.apply(state.fn, arguments); }
    function playerShootAudioPresentation() { return state.fn.playerShootAudioPresentation.apply(state.fn, arguments); }
    function playerShootAudioAudible() { return state.fn.playerShootAudioAudible.apply(state.fn, arguments); }
    function syncPlayerShootAudioNodes() { return state.fn.syncPlayerShootAudioNodes.apply(state.fn, arguments); }
    function startMovementIceAudio() { return state.fn.startMovementIceAudio.apply(state.fn, arguments); }
    function stopMovementIceAudio() { return state.fn.stopMovementIceAudio.apply(state.fn, arguments); }
    function updateMovementIceAudio() { return state.fn.updateMovementIceAudio.apply(state.fn, arguments); }
    function movementIceAudioPresentation() { return state.fn.movementIceAudioPresentation.apply(state.fn, arguments); }
    function movementIceAudioAudible() { return state.fn.movementIceAudioAudible.apply(state.fn, arguments); }
    function syncMovementIceAudioNodes() { return state.fn.syncMovementIceAudioNodes.apply(state.fn, arguments); }
    function startPauseAudio() { return state.fn.startPauseAudio.apply(state.fn, arguments); }
    function stopPauseAudio() { return state.fn.stopPauseAudio.apply(state.fn, arguments); }
    function updatePauseAudio() { return state.fn.updatePauseAudio.apply(state.fn, arguments); }
    function pauseAudioPresentation() { return state.fn.pauseAudioPresentation.apply(state.fn, arguments); }
    function syncPauseAudioNodes() { return state.fn.syncPauseAudioNodes.apply(state.fn, arguments); }
    function startScoreCountAudio() { return state.fn.startScoreCountAudio.apply(state.fn, arguments); }
    function stopScoreCountAudio() { return state.fn.stopScoreCountAudio.apply(state.fn, arguments); }
    function updateScoreCountAudio() { return state.fn.updateScoreCountAudio.apply(state.fn, arguments); }
    function scoreCountAudioPresentation() { return state.fn.scoreCountAudioPresentation.apply(state.fn, arguments); }
    function syncScoreCountAudioNodes() { return state.fn.syncScoreCountAudioNodes.apply(state.fn, arguments); }
    function startStageBonusAudio() { return state.fn.startStageBonusAudio.apply(state.fn, arguments); }
    function stopStageBonusAudio() { return state.fn.stopStageBonusAudio.apply(state.fn, arguments); }
    function updateStageBonusAudio() { return state.fn.updateStageBonusAudio.apply(state.fn, arguments); }
    function stageBonusAudioPresentation() { return state.fn.stageBonusAudioPresentation.apply(state.fn, arguments); }
    function stageBonusAudioAudible() { return state.fn.stageBonusAudioAudible.apply(state.fn, arguments); }
    function syncStageBonusAudioNodes() { return state.fn.syncStageBonusAudioNodes.apply(state.fn, arguments); }
    function startGameOverAudio() { return state.fn.startGameOverAudio.apply(state.fn, arguments); }
    function stopGameOverAudio() { return state.fn.stopGameOverAudio.apply(state.fn, arguments); }
    function updateGameOverAudio() { return state.fn.updateGameOverAudio.apply(state.fn, arguments); }
    function gameOverAudioPresentation() { return state.fn.gameOverAudioPresentation.apply(state.fn, arguments); }
    function syncGameOverAudioNodes() { return state.fn.syncGameOverAudioNodes.apply(state.fn, arguments); }
    function startHighScoreAudio() { return state.fn.startHighScoreAudio.apply(state.fn, arguments); }
    function stopHighScoreAudio() { return state.fn.stopHighScoreAudio.apply(state.fn, arguments); }
    function updateHighScoreAudio() { return state.fn.updateHighScoreAudio.apply(state.fn, arguments); }
    function highScoreAudioPresentation() { return state.fn.highScoreAudioPresentation.apply(state.fn, arguments); }
    function syncHighScoreAudioNodes() { return state.fn.syncHighScoreAudioNodes.apply(state.fn, arguments); }
    function setMovementAudioMode() { return state.fn.setMovementAudioMode.apply(state.fn, arguments); }
    function stopMovementAudioNode() { return state.fn.stopMovementAudioNode.apply(state.fn, arguments); }
    function startMovementAudioNode() { return state.fn.startMovementAudioNode.apply(state.fn, arguments); }
    function playerHasMovementSoundState() { return state.fn.playerHasMovementSoundState.apply(state.fn, arguments); }
    function playerMovementAudioRequested() { return state.fn.playerMovementAudioRequested.apply(state.fn, arguments); }
    function loadHighScore() { return state.fn.loadHighScore.apply(state.fn, arguments); }
    function saveHighScore() { return state.fn.saveHighScore.apply(state.fn, arguments); }
    function updateHighScore() { return state.fn.updateHighScore.apply(state.fn, arguments); }
    function resetPlayerPosition() { return state.fn.resetPlayerPosition.apply(state.fn, arguments); }
    function startTitleDemo() { return state.fn.startTitleDemo.apply(state.fn, arguments); }
    function endTitleDemo() { return state.fn.endTitleDemo.apply(state.fn, arguments); }
    function updateTitleIdle() { return state.fn.updateTitleIdle.apply(state.fn, arguments); }
    function resetTitleIdleTimer() { return state.fn.resetTitleIdleTimer.apply(state.fn, arguments); }
    function resetTitleIdleHighByte() { return state.fn.resetTitleIdleHighByte.apply(state.fn, arguments); }
    function hiddenMessageTriggerReady() { return state.fn.hiddenMessageTriggerReady.apply(state.fn, arguments); }
    function reserveTitleDirectionForHiddenInput() { return state.fn.reserveTitleDirectionForHiddenInput.apply(state.fn, arguments); }
    function recordHiddenTitleInput() { return state.fn.recordHiddenTitleInput.apply(state.fn, arguments); }
    function startHiddenMessage() { return state.fn.startHiddenMessage.apply(state.fn, arguments); }
    function updateHiddenMessage() { return state.fn.updateHiddenMessage.apply(state.fn, arguments); }
    function hiddenMessagePresentation() { return state.fn.hiddenMessagePresentation.apply(state.fn, arguments); }
    function beginStageSelect() { return state.fn.beginStageSelect.apply(state.fn, arguments); }
    function startSelectedGame() { return state.fn.startSelectedGame.apply(state.fn, arguments); }
    function stageSelectLimit() { return state.fn.stageSelectLimit.apply(state.fn, arguments); }
    function changeStageSelection() { return state.fn.changeStageSelection.apply(state.fn, arguments); }
    function startStage() { return state.fn.startStage.apply(state.fn, arguments); }
    function resetStageStats() { return state.fn.resetStageStats.apply(state.fn, arguments); }
    function enterEditor() { return state.fn.enterEditor.apply(state.fn, arguments); }
    function exitEditorToTitle() { return state.fn.exitEditorToTitle.apply(state.fn, arguments); }
    function moveTitleMenu() { return state.fn.moveTitleMenu.apply(state.fn, arguments); }
    function setTitleMenu() { return state.fn.setTitleMenu.apply(state.fn, arguments); }
    function activateTitleMenu() { return state.fn.activateTitleMenu.apply(state.fn, arguments); }
    function testEditorStage() { return state.fn.testEditorStage.apply(state.fn, arguments); }
    function saveEditorStage() { return state.fn.saveEditorStage.apply(state.fn, arguments); }
    function loadEditorStage() { return state.fn.loadEditorStage.apply(state.fn, arguments); }
    function clearEditorStage() { return state.fn.clearEditorStage.apply(state.fn, arguments); }
    function exportEditorStage() { return state.fn.exportEditorStage.apply(state.fn, arguments); }
    function importStagePackFile() { return state.fn.importStagePackFile.apply(state.fn, arguments); }
    function loadStagePackJsonText() { return state.fn.loadStagePackJsonText.apply(state.fn, arguments); }
    function loadStagePackObject() { return state.fn.loadStagePackObject.apply(state.fn, arguments); }
    function applyStagePack() { return state.fn.applyStagePack.apply(state.fn, arguments); }
    function restoreBuiltInStagePack() { return state.fn.restoreBuiltInStagePack.apply(state.fn, arguments); }
    function showEditorMessage() { return state.fn.showEditorMessage.apply(state.fn, arguments); }
    function nextStage() { return state.fn.nextStage.apply(state.fn, arguments); }
    function updatePlayers() { return state.fn.updatePlayers.apply(state.fn, arguments); }
    function updateDemoPlayers() { return state.fn.updateDemoPlayers.apply(state.fn, arguments); }
    function demoControlForPlayer() { return state.fn.demoControlForPlayer.apply(state.fn, arguments); }
    function demoTargetForPlayer() { return state.fn.demoTargetForPlayer.apply(state.fn, arguments); }
    function isPlayerMovementFrame() { return state.fn.isPlayerMovementFrame.apply(state.fn, arguments); }
    function updatePlayerMovement() { return state.fn.updatePlayerMovement.apply(state.fn, arguments); }
    function getPlayerControl() { return state.fn.getPlayerControl.apply(state.fn, arguments); }
    function hasControlKey() { return state.fn.hasControlKey.apply(state.fn, arguments); }
    function updateEnemies() { return state.fn.updateEnemies.apply(state.fn, arguments); }
    function isEnemyTimeFrozen() { return state.fn.isEnemyTimeFrozen.apply(state.fn, arguments); }
    function updateEnemyDestruction() { return state.fn.updateEnemyDestruction.apply(state.fn, arguments); }
    function shouldSpawnEnemies() { return state.fn.shouldSpawnEnemies.apply(state.fn, arguments); }
    function updateEnemyMovement() { return state.fn.updateEnemyMovement.apply(state.fn, arguments); }
    function recoverEnemyTankOverlap() { return state.fn.recoverEnemyTankOverlap.apply(state.fn, arguments); }
    function chooseEnemyDirectionByPhase() { return state.fn.chooseEnemyDirectionByPhase.apply(state.fn, arguments); }
    function enemyAiPhase() { return state.fn.enemyAiPhase.apply(state.fn, arguments); }
    function shouldEnemyFire() { return state.fn.shouldEnemyFire.apply(state.fn, arguments); }
    function aiRoll() { return state.fn.aiRoll.apply(state.fn, arguments); }
    function randomByte() { return state.fn.randomByte.apply(state.fn, arguments); }
    function nextBattleRandomByte() { return state.fn.nextBattleRandomByte.apply(state.fn, arguments); }
    function currentEnemySpawnPositionIndex() { return state.fn.currentEnemySpawnPositionIndex.apply(state.fn, arguments); }
    function tankForOriginalSlot() { return state.fn.tankForOriginalSlot.apply(state.fn, arguments); }
    function tankRandomMemoryByte() { return state.fn.tankRandomMemoryByte.apply(state.fn, arguments); }
    function tankRandomTypeByte() { return state.fn.tankRandomTypeByte.apply(state.fn, arguments); }
    function updateBullets() { return state.fn.updateBullets.apply(state.fn, arguments); }
    function resolveBullet() { return state.fn.resolveBullet.apply(state.fn, arguments); }
    function hitBase() { return state.fn.hitBase.apply(state.fn, arguments); }
    function hitTerrain() { return state.fn.hitTerrain.apply(state.fn, arguments); }
    function hitTank() { return state.fn.hitTank.apply(state.fn, arguments); }
    function destroyEnemy() { return state.fn.destroyEnemy.apply(state.fn, arguments); }
    function addPlayerScore() { return state.fn.addPlayerScore.apply(state.fn, arguments); }
    function killPlayer() { return state.fn.killPlayer.apply(state.fn, arguments); }
    function finishPlayerDeath() { return state.fn.finishPlayerDeath.apply(state.fn, arguments); }
    function startPlayerGameOverMessage() { return state.fn.startPlayerGameOverMessage.apply(state.fn, arguments); }
    function playerGameOverMessageActive() { return state.fn.playerGameOverMessageActive.apply(state.fn, arguments); }
    function updatePlayerGameOverMessage() { return state.fn.updatePlayerGameOverMessage.apply(state.fn, arguments); }
    function releaseCarrierPowerUp() { return state.fn.releaseCarrierPowerUp.apply(state.fn, arguments); }
    function clearPowerUpForCarrierSpawn() { return state.fn.clearPowerUpForCarrierSpawn.apply(state.fn, arguments); }
    function spawnPowerUp() { return state.fn.spawnPowerUp.apply(state.fn, arguments); }
    function randomPowerUpType() { return state.fn.randomPowerUpType.apply(state.fn, arguments); }
    function pickPowerUpSpawnSpot() { return state.fn.pickPowerUpSpawnSpot.apply(state.fn, arguments); }
    function resetPowerUpSpawnBag() { return state.fn.resetPowerUpSpawnBag.apply(state.fn, arguments); }
    function powerUpSpawnCandidates() { return state.fn.powerUpSpawnCandidates.apply(state.fn, arguments); }
    function fallbackPowerUpSpawnSpots() { return state.fn.fallbackPowerUpSpawnSpots.apply(state.fn, arguments); }
    function canPowerUpSpawnAt() { return state.fn.canPowerUpSpawnAt.apply(state.fn, arguments); }
    function updatePowerUp() { return state.fn.updatePowerUp.apply(state.fn, arguments); }
    function collectPowerUp() { return state.fn.collectPowerUp.apply(state.fn, arguments); }
    function applyPowerUp() { return state.fn.applyPowerUp.apply(state.fn, arguments); }
    function spawnEnemies() { return state.fn.spawnEnemies.apply(state.fn, arguments); }
    function enemySpawnDelay() { return state.fn.enemySpawnDelay.apply(state.fn, arguments); }
    function defaultEnemySpawnDelay() { return state.fn.defaultEnemySpawnDelay.apply(state.fn, arguments); }
    function scaleEnemySpawnDelayForPlayers() { return state.fn.scaleEnemySpawnDelayForPlayers.apply(state.fn, arguments); }
    function shoot() { return state.fn.shoot.apply(state.fn, arguments); }
    function createBullet() { return state.fn.createBullet.apply(state.fn, arguments); }
    function playerUpgradeRule() { return state.fn.playerUpgradeRule.apply(state.fn, arguments); }
    function moveTank() { return state.fn.moveTank.apply(state.fn, arguments); }
    function advanceTankTracks() { return state.fn.advanceTankTracks.apply(state.fn, arguments); }
    function canTankOccupy() { return state.fn.canTankOccupy.apply(state.fn, arguments); }
    function activeTankCollisionPeers() { return state.fn.activeTankCollisionPeers.apply(state.fn, arguments); }
    function totalTankOverlapArea() { return state.fn.totalTankOverlapArea.apply(state.fn, arguments); }
    function rectHitsSolidTerrain() { return state.fn.rectHitsSolidTerrain.apply(state.fn, arguments); }
    function solidTerrainOverlapArea() { return state.fn.solidTerrainOverlapArea.apply(state.fn, arguments); }
    function isTankOnIce() { return state.fn.isTankOnIce.apply(state.fn, arguments); }
    function snapForDirection() { return state.fn.snapForDirection.apply(state.fn, arguments); }
    function isPerpendicularTurn() { return state.fn.isPerpendicularTurn.apply(state.fn, arguments); }
    function addRuleExplosion() { return state.fn.addRuleExplosion.apply(state.fn, arguments); }
    function explosionRule() { return state.fn.explosionRule.apply(state.fn, arguments); }
    function baseDestructionDuration() { return state.fn.baseDestructionDuration.apply(state.fn, arguments); }
    function addExplosion() { return state.fn.addExplosion.apply(state.fn, arguments); }
    function updateExplosions() { return state.fn.updateExplosions.apply(state.fn, arguments); }
    function updateBaseDestructionTimer() { return state.fn.updateBaseDestructionTimer.apply(state.fn, arguments); }
    function addScorePopup() { return state.fn.addScorePopup.apply(state.fn, arguments); }
    function updateScorePopups() { return state.fn.updateScorePopups.apply(state.fn, arguments); }
    function stageEnemiesCleared() { return state.fn.stageEnemiesCleared.apply(state.fn, arguments); }
    function checkEndState() { return state.fn.checkEndState.apply(state.fn, arguments); }
    function enterStageClear() { return state.fn.enterStageClear.apply(state.fn, arguments); }
    function enterStageResult() { return state.fn.enterStageResult.apply(state.fn, arguments); }
    function finishStageResult() { return state.fn.finishStageResult.apply(state.fn, arguments); }
    function finishStageClearClosing() { return state.fn.finishStageClearClosing.apply(state.fn, arguments); }
    function enterGameOver() { return state.fn.enterGameOver.apply(state.fn, arguments); }
    function gameOverFieldDuration() { return state.fn.gameOverFieldDuration.apply(state.fn, arguments); }
    function finishGameOverScreen() { return state.fn.finishGameOverScreen.apply(state.fn, arguments); }
    function startFullGameOverScreen() { return state.fn.startFullGameOverScreen.apply(state.fn, arguments); }
    function updateFullGameOverScreen() { return state.fn.updateFullGameOverScreen.apply(state.fn, arguments); }
    function handleFullGameOverInput() { return state.fn.handleFullGameOverInput.apply(state.fn, arguments); }
    function finishFullGameOverScreen() { return state.fn.finishFullGameOverScreen.apply(state.fn, arguments); }
    function startHighScoreScreen() { return state.fn.startHighScoreScreen.apply(state.fn, arguments); }
    function updateHighScoreScreen() { return state.fn.updateHighScoreScreen.apply(state.fn, arguments); }
    function returnToTitleAfterGame() { return state.fn.returnToTitleAfterGame.apply(state.fn, arguments); }
    function stageAdvanceResult() { return state.fn.stageAdvanceResult.apply(state.fn, arguments); }
    function awardPendingStageClearBonus() { return state.fn.awardPendingStageClearBonus.apply(state.fn, arguments); }
    function stageClearPresentation() { return state.fn.stageClearPresentation.apply(state.fn, arguments); }
    function stageResultDuration() { return state.fn.stageResultDuration.apply(state.fn, arguments); }
    function stageClearBonusRecipients() { return state.fn.stageClearBonusRecipients.apply(state.fn, arguments); }
    function stageClearResultSummary() { return state.fn.stageClearResultSummary.apply(state.fn, arguments); }
    function makeStageClearResultProbePlayer() { return state.fn.makeStageClearResultProbePlayer.apply(state.fn, arguments); }
    function renderTitle() { return state.fn.renderTitle.apply(state.fn, arguments); }
    function renderHiddenMessage() { return state.fn.renderHiddenMessage.apply(state.fn, arguments); }
    function renderHighScore() { return state.fn.renderHighScore.apply(state.fn, arguments); }
    function renderFullGameOver() { return state.fn.renderFullGameOver.apply(state.fn, arguments); }
    function fullGameOverPresentation() { return state.fn.fullGameOverPresentation.apply(state.fn, arguments); }
    function highScorePresentation() { return state.fn.highScorePresentation.apply(state.fn, arguments); }
    function titleScoreLayout() { return state.fn.titleScoreLayout.apply(state.fn, arguments); }
    function drawStripedTitleText() { return state.fn.drawStripedTitleText.apply(state.fn, arguments); }
    function drawTitleMenuCursor() { return state.fn.drawTitleMenuCursor.apply(state.fn, arguments); }
    function renderStageSelect() { return state.fn.renderStageSelect.apply(state.fn, arguments); }
    function renderStageSelectClosing() { return state.fn.renderStageSelectClosing.apply(state.fn, arguments); }
    function renderGame() { return state.fn.renderGame.apply(state.fn, arguments); }
    function renderGameBackdrop() { return state.fn.renderGameBackdrop.apply(state.fn, arguments); }
    function renderTerrain() { return state.fn.renderTerrain.apply(state.fn, arguments); }
    function drawWallCell() { return state.fn.drawWallCell.apply(state.fn, arguments); }
    function drawBrickCell() { return state.fn.drawBrickCell.apply(state.fn, arguments); }
    function drawWater() { return state.fn.drawWater.apply(state.fn, arguments); }
    function waterFrameName() { return state.fn.waterFrameName.apply(state.fn, arguments); }
    function drawIce() { return state.fn.drawIce.apply(state.fn, arguments); }
    function renderProjectileTerrainCover() { return state.fn.renderProjectileTerrainCover.apply(state.fn, arguments); }
    function drawIceProjectileCover() { return state.fn.drawIceProjectileCover.apply(state.fn, arguments); }
    function drawForest() { return state.fn.drawForest.apply(state.fn, arguments); }
    function renderBase() { return state.fn.renderBase.apply(state.fn, arguments); }
    function drawTank() { return state.fn.drawTank.apply(state.fn, arguments); }
    function drawPlayerUpgradeOverlay() { return state.fn.drawPlayerUpgradeOverlay.apply(state.fn, arguments); }
    function drawShield() { return state.fn.drawShield.apply(state.fn, arguments); }
    function drawSpawn() { return state.fn.drawSpawn.apply(state.fn, arguments); }
    function drawBullet() { return state.fn.drawBullet.apply(state.fn, arguments); }
    function drawPowerUp() { return state.fn.drawPowerUp.apply(state.fn, arguments); }
    function isPowerUpVisible() { return state.fn.isPowerUpVisible.apply(state.fn, arguments); }
    function battleDisplayFrame() { return state.fn.battleDisplayFrame.apply(state.fn, arguments); }
    function powerUpVisualRect() { return state.fn.powerUpVisualRect.apply(state.fn, arguments); }
    function drawManifestSprite() { return state.fn.drawManifestSprite.apply(state.fn, arguments); }
    function drawScaledManifestSprite() { return state.fn.drawScaledManifestSprite.apply(state.fn, arguments); }
    function renderExplosions() { return state.fn.renderExplosions.apply(state.fn, arguments); }
    function drawTankDestructionExplosion() { return state.fn.drawTankDestructionExplosion.apply(state.fn, arguments); }
    function renderPlayerDestructions() { return state.fn.renderPlayerDestructions.apply(state.fn, arguments); }
    function playerDestructionPresentation() { return state.fn.playerDestructionPresentation.apply(state.fn, arguments); }
    function renderEnemyDestructions() { return state.fn.renderEnemyDestructions.apply(state.fn, arguments); }
    function enemyDestructionPresentation() { return state.fn.enemyDestructionPresentation.apply(state.fn, arguments); }
    function renderBaseDestruction() { return state.fn.renderBaseDestruction.apply(state.fn, arguments); }
    function baseDestructionPresentation() { return state.fn.baseDestructionPresentation.apply(state.fn, arguments); }
    function tankDestructionPresentation() { return state.fn.tankDestructionPresentation.apply(state.fn, arguments); }
    function explosionPresentation() { return state.fn.explosionPresentation.apply(state.fn, arguments); }
    function renderScorePopups() { return state.fn.renderScorePopups.apply(state.fn, arguments); }
    function scorePopupPresentation() { return state.fn.scorePopupPresentation.apply(state.fn, arguments); }
    function renderPanel() { return state.fn.renderPanel.apply(state.fn, arguments); }
    function drawStageFlag() { return state.fn.drawStageFlag.apply(state.fn, arguments); }
    function panelEnemyCounterRemaining() { return state.fn.panelEnemyCounterRemaining.apply(state.fn, arguments); }
    function panelLifeCount() { return state.fn.panelLifeCount.apply(state.fn, arguments); }
    function drawSmallScore() { return state.fn.drawSmallScore.apply(state.fn, arguments); }
    function formatScore5() { return state.fn.formatScore5.apply(state.fn, arguments); }
    function renderStageIntro() { return state.fn.renderStageIntro.apply(state.fn, arguments); }
    function renderCurtain() { return state.fn.renderCurtain.apply(state.fn, arguments); }
    function stageSelectCurtainState() { return state.fn.stageSelectCurtainState.apply(state.fn, arguments); }
    function stageIntroCurtainState() { return state.fn.stageIntroCurtainState.apply(state.fn, arguments); }
    function renderStageClear() { return state.fn.renderStageClear.apply(state.fn, arguments); }
    function renderStageClearClosing() { return state.fn.renderStageClearClosing.apply(state.fn, arguments); }
    function totalStageKills() { return state.fn.totalStageKills.apply(state.fn, arguments); }
    function drawResultArrow() { return state.fn.drawResultArrow.apply(state.fn, arguments); }
    function drawMiniTank() { return state.fn.drawMiniTank.apply(state.fn, arguments); }
    function renderGameOver() { return state.fn.renderGameOver.apply(state.fn, arguments); }
    function renderPlayerGameOverMessage() { return state.fn.renderPlayerGameOverMessage.apply(state.fn, arguments); }
    function playerGameOverMessagePresentation() { return state.fn.playerGameOverMessagePresentation.apply(state.fn, arguments); }
    function drawCompactGameOverWord() { return state.fn.drawCompactGameOverWord.apply(state.fn, arguments); }
    function gameOverBannerY() { return state.fn.gameOverBannerY.apply(state.fn, arguments); }
    function renderPause() { return state.fn.renderPause.apply(state.fn, arguments); }
    function pausePresentation() { return state.fn.pausePresentation.apply(state.fn, arguments); }
    function renderEditor() { return state.fn.renderEditor.apply(state.fn, arguments); }
    function drawTileLegend() { return state.fn.drawTileLegend.apply(state.fn, arguments); }
    function drawText() { return state.fn.drawText.apply(state.fn, arguments); }
    function drawTextClipped() { return state.fn.drawTextClipped.apply(state.fn, arguments); }
    function drawTextRight() { return state.fn.drawTextRight.apply(state.fn, arguments); }
    function pad2() { return state.fn.pad2.apply(state.fn, arguments); }
    function preparePausedDebugBattle() { return state.fn.preparePausedDebugBattle.apply(state.fn, arguments); }
    function handleAction() { return state.fn.handleAction.apply(state.fn, arguments); }
    function isPauseInputCode() { return state.fn.isPauseInputCode.apply(state.fn, arguments); }
    function togglePause() { return state.fn.togglePause.apply(state.fn, arguments); }
    function canvasToGame() { return state.fn.canvasToGame.apply(state.fn, arguments); }
    function moveEditorFromCode() { return state.fn.moveEditorFromCode.apply(state.fn, arguments); }
    function moveEditorCursor() { return state.fn.moveEditorCursor.apply(state.fn, arguments); }
    function useOriginalEditorButton() { return state.fn.useOriginalEditorButton.apply(state.fn, arguments); }
    function pasteOriginalEditorPattern() { return state.fn.pasteOriginalEditorPattern.apply(state.fn, arguments); }
    function editAtEditorCursor() { return state.fn.editAtEditorCursor.apply(state.fn, arguments); }
    function paintEditorCell() { return state.fn.paintEditorCell.apply(state.fn, arguments); }
    function paintEditorQuadrant() { return state.fn.paintEditorQuadrant.apply(state.fn, arguments); }
    function selectEditorBrush() { return state.fn.selectEditorBrush.apply(state.fn, arguments); }
    function selectEditorBrushFromPanel() { return state.fn.selectEditorBrushFromPanel.apply(state.fn, arguments); }
    function cycleEditorCell() { return state.fn.cycleEditorCell.apply(state.fn, arguments); }
    function cycleEditorQuadrant() { return state.fn.cycleEditorQuadrant.apply(state.fn, arguments); }
    function updateEditorControls() { return state.fn.updateEditorControls.apply(state.fn, arguments); }
    function stageSelectAHeld() { return state.fn.stageSelectAHeld.apply(state.fn, arguments); }
    function stageSelectBHeld() { return state.fn.stageSelectBHeld.apply(state.fn, arguments); }
    function updateStageSelectControls() { return state.fn.updateStageSelectControls.apply(state.fn, arguments); }
    function advanceFrameCounters() { return state.fn.advanceFrameCounters.apply(state.fn, arguments); }
    function resetFrameCounterLow() { return state.fn.resetFrameCounterLow.apply(state.fn, arguments); }
    function resetFrameCounterHigh() { return state.fn.resetFrameCounterHigh.apply(state.fn, arguments); }
    function resetFrameCounters() { return state.fn.resetFrameCounters.apply(state.fn, arguments); }
    function applyFrameCounter() { return state.fn.applyFrameCounter.apply(state.fn, arguments); }
    function updateBattle() { return state.fn.updateBattle.apply(state.fn, arguments); }
    function isGlobalTimerTick() { return state.fn.isGlobalTimerTick.apply(state.fn, arguments); }
    function updateFreezeTimer() { return state.fn.updateFreezeTimer.apply(state.fn, arguments); }
    function updateShovelTimer() { return state.fn.updateShovelTimer.apply(state.fn, arguments); }
    function updatePlayerInvulnerabilityTimers() { return state.fn.updatePlayerInvulnerabilityTimers.apply(state.fn, arguments); }
    function tileTypeName() { return state.fn.tileTypeName.apply(state.fn, arguments); }
      window.TankDefender8 = {
        loadStagePack(pack) {
          return loadStagePackObject(pack).ok;
        },
        loadStagePackJson(text) {
          return loadStagePackJsonText(text);
        },
        validateStagePack(pack) {
          const result = tryNormalizeStagePack(pack);
          return { ok: result.ok, error: result.error };
        },
        audioManifest() {
          return cloneAudioManifest();
        },
        debugScoreCountAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.scoreCount;
          const frames = [0, 1];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map((voice) => fixedFrameVoiceDuration(voice)),
            frames: frames.map((frame) => {
              const presentation = scoreCountAudioPresentation(frame);
              return {
                frame,
                voices: presentation.voices.map((voice) => voice
                  ? { frequency: voice.frequency, gain: voice.gain, wave: voice.wave }
                  : null)
              };
            })
          };
        },
        debugScoreCountAudioLifecycleProbe() {
          const previous = { ...game };
          const audioStates = [
            stageStartAudio,
            bonusLifeAudio,
            powerUpPickupAudio,
            powerUpAppearAudio,
            brickHitAudio,
            baseHitAudio,
            steelHitAudio,
            enemyHitAudio,
            enemyDestroyAudio,
            playerDestroyAudio,
            playerShootAudio,
            movementIceAudio,
            pauseAudio,
            scoreCountAudio,
            stageBonusAudio
          ];
          const previousAudio = audioStates.map((state) => ({ active: state.active, frame: state.frame }));
          const state = () => {
            const presentation = scoreCountAudioPresentation(scoreCountAudio.frame);
            return {
              active: scoreCountAudio.active,
              frame: scoreCountAudio.frame,
              voices: presentation.voices.map((voice) => voice
                ? { frequency: voice.frequency, wave: voice.wave }
                : null)
            };
          };
          try {
            stopMovementAudio();
            for (const audioState of audioStates) stopFixedFrameAudio(audioState);
            game.screen = "stageClear";
            game.paused = false;
            game.stageResultReason = "clear";
            game.stageClearBonusAwarded = true;
            game.stageClearBonusPlayerIds = [];
            game.stageClearElapsed = 31;
            game.transitionTimer = 999;
            game.players = [
              makeStageClearResultProbePlayer(1, [2, 0, 0, 0], 0),
              makeStageClearResultProbePlayer(2, [1, 0, 0, 0], 0)
            ];
    
            update();
            const firstPresentation = stageClearPresentation();
            const simultaneous = {
              ...state(),
              elapsed: game.stageClearElapsed,
              visibleKills: stageResultVisibleKillCount(firstPresentation)
            };
            update();
            const afterOneFrame = state();
    
            game.stageClearElapsed = 40;
            update();
            const nextCadence = {
              ...state(),
              elapsed: game.stageClearElapsed,
              visibleKills: stageResultVisibleKillCount(stageClearPresentation())
            };
    
            stopScoreCountAudio();
            game.players = [
              makeStageClearResultProbePlayer(1, [0, 0, 0, 0], 0),
              makeStageClearResultProbePlayer(2, [0, 0, 0, 0], 0)
            ];
            game.stageClearElapsed = 31;
            update();
            const zeroKills = state();
    
            game.players = [createPlayer(1)];
            startScoreCountAudio();
            startStage(game.stage);
            const stageCleanup = state();
    
            return { simultaneous, afterOneFrame, nextCadence, zeroKills, stageCleanup };
          } finally {
            for (const audioState of audioStates) stopFixedFrameAudio(audioState);
            Object.assign(game, previous);
            audioStates.forEach((audioState, index) => {
              audioState.active = previousAudio[index].active;
              audioState.frame = previousAudio[index].frame;
            });
            syncStageStartAudioNodes();
            syncBonusLifeAudioNodes();
            syncPowerUpPickupAudioNodes();
            syncPowerUpAppearAudioNodes();
            syncBrickHitAudioNodes();
            syncBaseHitAudioNodes();
            syncSteelHitAudioNodes();
            syncEnemyHitAudioNodes();
            syncEnemyDestroyAudioNodes();
            syncPlayerDestroyAudioNodes();
            syncPlayerShootAudioNodes();
            syncMovementIceAudioNodes();
            syncPauseAudioNodes();
            syncScoreCountAudioNodes();
            syncStageBonusAudioNodes();
            syncMovementAudio();
          }
        },
        debugStageBonusAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.stageBonus;
          const frames = [0, 2, 3, 5, 6, 8, 9, 11, 12, 14, 15, 17, 18, 27, 28];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map((voice) => fixedFrameVoiceDuration(voice)),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => {
              const presentation = stageBonusAudioPresentation(frame);
              return {
                frame,
                voices: presentation.voices.map((voice) => voice
                  ? { frequency: voice.frequency, gain: voice.gain, wave: voice.wave }
                  : null)
              };
            })
          };
        },
        debugStageBonusAudioLifecycleProbe() {
          const previous = { ...game };
          const audioStates = [
            stageStartAudio,
            bonusLifeAudio,
            powerUpPickupAudio,
            powerUpAppearAudio,
            brickHitAudio,
            baseHitAudio,
            steelHitAudio,
            enemyHitAudio,
            enemyDestroyAudio,
            playerDestroyAudio,
            playerShootAudio,
            movementIceAudio,
            pauseAudio,
            scoreCountAudio,
            stageBonusAudio
          ];
          const previousAudio = audioStates.map((state) => ({ active: state.active, frame: state.frame }));
          const makeResultPlayer = (id, kills) => {
            const player = createPlayer(id);
            return Object.assign(player, makeStageClearResultProbePlayer(id, kills, 0));
          };
          const state = () => {
            const presentation = stageBonusAudioPresentation(stageBonusAudio.frame);
            return {
              active: stageBonusAudio.active,
              frame: stageBonusAudio.frame,
              frequency: presentation.voices[0] ? presentation.voices[0].frequency : null,
              audible: stageBonusAudio.active && Boolean(presentation.voices[0]) && stageBonusAudioAudible()
            };
          };
          try {
            stopMovementAudio();
            for (const audioState of audioStates) stopFixedFrameAudio(audioState);
            game.screen = "stageClear";
            game.paused = false;
            game.stageResultReason = "clear";
            game.stageClearBonusAwarded = false;
            game.transitionTimer = 999;
            game.players = [
              makeResultPlayer(1, [4, 0, 0, 0]),
              makeResultPlayer(2, [3, 0, 0, 0])
            ];
            game.stageClearBonusPlayerIds = stageClearBonusRecipients(game.players).map((player) => player.id);
            const bonusRevealFrame = stageClearPresentation(game.players, 0).bonusRevealFrame;
            game.stageClearElapsed = bonusRevealFrame - 1;
            const scoreBefore = game.players[0].score;
    
            update();
            const awarded = {
              ...state(),
              elapsed: game.stageClearElapsed,
              recipients: game.stageClearBonusPlayerIds.slice(),
              scoreDelta: game.players[0].score - scoreBefore,
              bonusAwarded: game.stageClearBonusAwarded
            };
            for (let frame = 0; frame < 27; frame += 1) update();
            const finalFrame = state();
            update();
            const end = {
              ...state(),
              scoreDelta: game.players[0].score - scoreBefore
            };
    
            stopStageBonusAudio();
            stopBonusLifeAudio();
            game.players = [
              makeResultPlayer(1, [4, 0, 0, 0]),
              makeResultPlayer(2, [3, 0, 0, 0])
            ];
            game.players[0].score = 19000;
            game.stageClearBonusPlayerIds = stageClearBonusRecipients(game.players).map((player) => player.id);
            game.stageClearBonusAwarded = false;
            game.stageClearElapsed = stageClearPresentation(game.players, 0).bonusRevealFrame - 1;
            const thresholdScoreBefore = game.players[0].score;
            const thresholdLivesBefore = game.players[0].lives;
            update();
            const bonusLifePriority = {
              ...state(),
              bonusLifeActive: bonusLifeAudio.active,
              bonusLifeFrame: bonusLifeAudio.frame,
              scoreDelta: game.players[0].score - thresholdScoreBefore,
              livesDelta: game.players[0].lives - thresholdLivesBefore
            };
    
            stopStageBonusAudio();
            stopBonusLifeAudio();
            game.players = [
              makeResultPlayer(1, [3, 0, 0, 0]),
              makeResultPlayer(2, [3, 0, 0, 0])
            ];
            game.stageClearBonusPlayerIds = stageClearBonusRecipients(game.players).map((player) => player.id);
            game.stageClearBonusAwarded = false;
            game.stageClearElapsed = stageClearPresentation(game.players, 0).bonusRevealFrame - 1;
            update();
            const tied = {
              ...state(),
              recipients: game.stageClearBonusPlayerIds.slice(),
              score: game.players[0].score + game.players[1].score
            };
    
            stopStageBonusAudio();
            game.players = [
              makeResultPlayer(1, [4, 0, 0, 0]),
              makeResultPlayer(2, [3, 0, 0, 0])
            ];
            game.stageResultReason = "gameOver";
            game.stageClearBonusPlayerIds = [];
            game.stageClearBonusAwarded = false;
            game.stageClearElapsed = stageClearPresentation(game.players, 0).bonusRevealFrame - 1;
            update();
            const gameOver = {
              ...state(),
              bonusAwarded: game.stageClearBonusAwarded,
              score: game.players[0].score + game.players[1].score
            };
    
            game.players = [createPlayer(1)];
            startStageBonusAudio();
            startStage(game.stage);
            const stageCleanup = state();
    
            return { bonusRevealFrame, awarded, finalFrame, end, bonusLifePriority, tied, gameOver, stageCleanup };
          } finally {
            for (const audioState of audioStates) stopFixedFrameAudio(audioState);
            Object.assign(game, previous);
            audioStates.forEach((audioState, index) => {
              audioState.active = previousAudio[index].active;
              audioState.frame = previousAudio[index].frame;
            });
            syncStageStartAudioNodes();
            syncBonusLifeAudioNodes();
            syncPowerUpPickupAudioNodes();
            syncPowerUpAppearAudioNodes();
            syncBrickHitAudioNodes();
            syncBaseHitAudioNodes();
            syncSteelHitAudioNodes();
            syncEnemyHitAudioNodes();
            syncEnemyDestroyAudioNodes();
            syncPlayerDestroyAudioNodes();
            syncPlayerShootAudioNodes();
            syncMovementIceAudioNodes();
            syncPauseAudioNodes();
            syncScoreCountAudioNodes();
            syncStageBonusAudioNodes();
            syncMovementAudio();
          }
        },
        debugMovementAudioProbe() {
          const previous = { ...game };
          const previousKeys = Array.from(keys);
          const previousStageStart = {
            active: stageStartAudio.active,
            frame: stageStartAudio.frame
          };
          const previousBonusLife = {
            active: bonusLifeAudio.active,
            frame: bonusLifeAudio.frame
          };
          const previousPowerUpPickup = {
            active: powerUpPickupAudio.active,
            frame: powerUpPickupAudio.frame
          };
          const previousPowerUpAppear = {
            active: powerUpAppearAudio.active,
            frame: powerUpAppearAudio.frame
          };
          const previousBaseHit = {
            active: baseHitAudio.active,
            frame: baseHitAudio.frame
          };
          const previousMovementIce = {
            active: movementIceAudio.active,
            frame: movementIceAudio.frame
          };
          const previousPlayerShoot = {
            active: playerShootAudio.active,
            frame: playerShootAudio.frame
          };
          const previousSteelHit = {
            active: steelHitAudio.active,
            frame: steelHitAudio.frame
          };
          const previousEnemyHit = {
            active: enemyHitAudio.active,
            frame: enemyHitAudio.frame
          };
          const previousPause = {
            active: pauseAudio.active,
            frame: pauseAudio.frame
          };
          try {
            const player = createPlayer(1);
            player.spawnFlash = 0;
            player.invuln = 0;
            player.respawn = 0;
            game.playerCount = 1;
            game.players = [player];
            game.enemies = [];
            game.demoMode = false;
            game.paused = false;
            game.clearPendingTimer = 0;
            game.screen = "title";
            stageStartAudio.active = false;
            bonusLifeAudio.active = false;
            powerUpPickupAudio.active = false;
            powerUpAppearAudio.active = false;
            baseHitAudio.active = false;
            movementIceAudio.active = false;
            playerShootAudio.active = false;
            steelHitAudio.active = false;
            enemyHitAudio.active = false;
            pauseAudio.active = false;
            keys.clear();
            const title = movementAudioModeForState();
    
            game.screen = "playing";
            const idleBattle = movementAudioModeForState();
            stageStartAudio.active = true;
            const stageStart = movementAudioModeForState();
            stageStartAudio.active = false;
            bonusLifeAudio.active = true;
            bonusLifeAudio.frame = 0;
            const bonusLifePulse2 = movementAudioModeForState();
            bonusLifeAudio.frame = 54;
            const bonusLifePulse1Tail = movementAudioModeForState();
            bonusLifeAudio.active = false;
            powerUpPickupAudio.active = true;
            powerUpPickupAudio.frame = 0;
            const powerUpPickup = movementAudioModeForState();
            powerUpPickupAudio.active = false;
            powerUpAppearAudio.active = true;
            const powerUpAppear = movementAudioModeForState();
            powerUpAppearAudio.active = false;
            baseHitAudio.active = true;
            const baseHit = movementAudioModeForState();
            baseHitAudio.active = false;
            enemyHitAudio.active = true;
            const enemyHit = movementAudioModeForState();
            enemyHitAudio.active = false;
            pauseAudio.active = true;
            const pauseCue = movementAudioModeForState();
            pauseAudio.active = false;
            keys.add("ArrowUp");
            const heldDirection = movementAudioModeForState();
            player.alive = false;
            player.respawn = 12;
            const heldDuringDeathState = movementAudioModeForState();
            player.respawn = 0;
            const heldAfterTankRemoved = movementAudioModeForState();
            player.alive = true;
            game.paused = true;
            const paused = movementAudioModeForState();
            game.paused = false;
            game.clearPendingTimer = 128;
            const clearDelay = movementAudioModeForState();
            game.clearPendingTimer = 0;
            game.screen = "gameOver";
            const gameOver = movementAudioModeForState();
    
            return {
              modes: {
                title,
                idleBattle,
                stageStart,
                bonusLifePulse2,
                bonusLifePulse1Tail,
                powerUpPickup,
                powerUpAppear,
                baseHit,
                enemyHit,
                pauseCue,
                heldDirection,
                heldDuringDeathState,
                heldAfterTankRemoved,
                paused,
                clearDelay,
                gameOver
              },
              enemyFrames: [0, 3, 4, 7, 8].map((tick) => movementAudioPresentation("enemy", tick)),
              playerFrames: [0, 15, 16, 31, 32].map((tick) => movementAudioPresentation("player", tick)),
              ice: { ...FREE_AUDIO_MANIFEST.events.movementIce }
            };
          } finally {
            keys.clear();
            for (const code of previousKeys) keys.add(code);
            stageStartAudio.active = previousStageStart.active;
            stageStartAudio.frame = previousStageStart.frame;
            bonusLifeAudio.active = previousBonusLife.active;
            bonusLifeAudio.frame = previousBonusLife.frame;
            powerUpPickupAudio.active = previousPowerUpPickup.active;
            powerUpPickupAudio.frame = previousPowerUpPickup.frame;
            powerUpAppearAudio.active = previousPowerUpAppear.active;
            powerUpAppearAudio.frame = previousPowerUpAppear.frame;
            baseHitAudio.active = previousBaseHit.active;
            baseHitAudio.frame = previousBaseHit.frame;
            movementIceAudio.active = previousMovementIce.active;
            movementIceAudio.frame = previousMovementIce.frame;
            playerShootAudio.active = previousPlayerShoot.active;
            playerShootAudio.frame = previousPlayerShoot.frame;
            steelHitAudio.active = previousSteelHit.active;
            steelHitAudio.frame = previousSteelHit.frame;
            enemyHitAudio.active = previousEnemyHit.active;
            enemyHitAudio.frame = previousEnemyHit.frame;
            pauseAudio.active = previousPause.active;
            pauseAudio.frame = previousPause.frame;
            Object.assign(game, previous);
          }
        },
        debugMovementIceAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.movementIce;
          const frames = [0, 1, 2, 3, 4];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map(fixedFrameVoiceDuration),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => movementIceAudioPresentation(frame))
          };
        },
        debugBrickHitAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.brickHit;
          const frames = [0, 1, 2, 3];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map(fixedFrameVoiceDuration),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => brickHitAudioPresentation(frame))
          };
        },
        debugBrickHitAudioLifecycleProbe() {
          const previous = { ...game };
          const previousKeys = Array.from(keys);
          const previousStageStart = { active: stageStartAudio.active, frame: stageStartAudio.frame };
          const previousBonusLife = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
          const previousPowerUpPickup = { active: powerUpPickupAudio.active, frame: powerUpPickupAudio.frame };
          const previousPowerUpAppear = { active: powerUpAppearAudio.active, frame: powerUpAppearAudio.frame };
          const previousBrickHit = { active: brickHitAudio.active, frame: brickHitAudio.frame };
          const previousSteelHit = { active: steelHitAudio.active, frame: steelHitAudio.frame };
          const previousEnemyHit = { active: enemyHitAudio.active, frame: enemyHitAudio.frame };
          const previousPlayerShoot = { active: playerShootAudio.active, frame: playerShootAudio.frame };
          const previousMovementIce = { active: movementIceAudio.active, frame: movementIceAudio.frame };
          const previousPause = { active: pauseAudio.active, frame: pauseAudio.frame };
          const state = () => ({
            active: brickHitAudio.active,
            frame: brickHitAudio.frame,
            paused: game.paused,
            audible: brickHitAudio.active && brickHitAudioAudible(),
            movementAudioMode: movementAudio.mode,
            steelHitActive: steelHitAudio.active,
            steelHitAudible: steelHitAudio.active && steelHitAudioAudible(),
            playerShootActive: playerShootAudio.active,
            playerShootAudible: playerShootAudio.active && playerShootAudioAudible(),
            pauseActive: pauseAudio.active,
            pauseFrame: pauseAudio.frame,
            stageStartActive: stageStartAudio.active
          });
          const wallBullet = (ownerKind, power) => ({
            x: TILE,
            y: TILE,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            dir: RIGHT,
            speed: 0,
            power,
            ownerKind,
            ownerId: 1,
            ownerKey: `${ownerKind}:1`,
            remove: false
          });
          const prepareWall = (type) => {
            game.grid = makeGrid();
            game.grid[1][1] = makeCell(type, 15);
            game.explosions = [];
          };
          try {
            stopMovementAudio();
            stopStageStartAudio();
            stopBonusLifeAudio();
            stopPowerUpPickupAudio();
            stopPowerUpAppearAudio();
            stopBrickHitAudio();
            stopEnemyHitAudio();
            stopSteelHitAudio();
            stopPlayerShootAudio();
            stopMovementIceAudio();
            stopPauseAudio();
            game.screen = "playing";
            game.demoMode = false;
            game.paused = false;
            game.clearPendingTimer = 0;
            game.players = [];
            game.enemies = [];
            game.bullets = [];
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            keys.clear();
            syncMovementAudio();
    
            prepareWall(BRICK);
            const playerBrickBullet = wallBullet("player", 1);
            const playerBrickHit = hitTerrain(playerBrickBullet);
            const playerBrick = {
              ...state(),
              hit: playerBrickHit,
              bulletRemoved: playerBrickBullet.remove,
              wallMask: game.grid[1][1].mask,
              wallBrickMask: game.grid[1][1].brickMask,
              explosionCount: game.explosions.length
            };
            for (let frame = 0; frame < 2; frame += 1) updateBrickHitAudio();
            const beforePause = state();
            game.paused = true;
            startPauseAudio();
            syncBrickHitAudioNodes();
            syncMovementAudio();
            for (let frame = 0; frame < 10; frame += 1) {
              updateBrickHitAudio();
              updatePauseAudio();
            }
            const paused = state();
            game.paused = false;
            syncBrickHitAudioNodes();
            syncMovementAudio();
            updateBrickHitAudio();
            const end = state();
    
            stopPauseAudio();
            stopBrickHitAudio();
            syncMovementAudio();
            prepareWall(BRICK);
            const enemyBrickBullet = wallBullet("enemy", 1);
            const enemyBrickHit = hitTerrain(enemyBrickBullet);
            const enemyBrick = {
              ...state(),
              hit: enemyBrickHit,
              bulletRemoved: enemyBrickBullet.remove,
              wallMask: game.grid[1][1].mask,
              explosionCount: game.explosions.length
            };
    
            prepareWall(STEEL);
            const maxPowerSteelBullet = wallBullet("player", 3);
            const maxPowerSteelHit = hitTerrain(maxPowerSteelBullet);
            const destructibleSteel = {
              ...state(),
              hit: maxPowerSteelHit,
              bulletRemoved: maxPowerSteelBullet.remove,
              wallMask: game.grid[1][1].mask,
              explosionCount: game.explosions.length
            };
    
            startSteelHitAudio();
            startPlayerShootAudio();
            const separateChannels = state();
    
            stopSteelHitAudio();
            stopPlayerShootAudio();
            stopBrickHitAudio();
            startBrickHitAudio();
            startStageStartAudio();
            const stageStartPriority = state();
            for (let frame = 0; frame < 3; frame += 1) updateBrickHitAudio();
            const stageStartSuppressedEnd = state();
    
            stopStageStartAudio();
            startBrickHitAudio();
            startStage(game.stage);
            const stageCleanup = state();
            return {
              playerBrick,
              beforePause,
              paused,
              end,
              enemyBrick,
              destructibleSteel,
              separateChannels,
              stageStartPriority,
              stageStartSuppressedEnd,
              stageCleanup
            };
          } finally {
            stopMovementAudio();
            stopStageStartAudio();
            stopBonusLifeAudio();
            stopPowerUpPickupAudio();
            stopPowerUpAppearAudio();
            stopBrickHitAudio();
            stopEnemyHitAudio();
            stopSteelHitAudio();
            stopPlayerShootAudio();
            stopMovementIceAudio();
            stopPauseAudio();
            Object.assign(game, previous);
            keys.clear();
            for (const code of previousKeys) keys.add(code);
            stageStartAudio.active = previousStageStart.active;
            stageStartAudio.frame = previousStageStart.frame;
            bonusLifeAudio.active = previousBonusLife.active;
            bonusLifeAudio.frame = previousBonusLife.frame;
            powerUpPickupAudio.active = previousPowerUpPickup.active;
            powerUpPickupAudio.frame = previousPowerUpPickup.frame;
            powerUpAppearAudio.active = previousPowerUpAppear.active;
            powerUpAppearAudio.frame = previousPowerUpAppear.frame;
            brickHitAudio.active = previousBrickHit.active;
            brickHitAudio.frame = previousBrickHit.frame;
            steelHitAudio.active = previousSteelHit.active;
            steelHitAudio.frame = previousSteelHit.frame;
            enemyHitAudio.active = previousEnemyHit.active;
            enemyHitAudio.frame = previousEnemyHit.frame;
            playerShootAudio.active = previousPlayerShoot.active;
            playerShootAudio.frame = previousPlayerShoot.frame;
            movementIceAudio.active = previousMovementIce.active;
            movementIceAudio.frame = previousMovementIce.frame;
            pauseAudio.active = previousPause.active;
            pauseAudio.frame = previousPause.frame;
            syncStageStartAudioNodes();
            syncBonusLifeAudioNodes();
            syncPowerUpPickupAudioNodes();
            syncPowerUpAppearAudioNodes();
            syncBrickHitAudioNodes();
            syncSteelHitAudioNodes();
            syncEnemyHitAudioNodes();
            syncPlayerShootAudioNodes();
            syncMovementIceAudioNodes();
            syncPauseAudioNodes();
            syncMovementAudio();
          }
        },
        debugSteelHitAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.steelHit;
          const frames = [0, 1, 2, 3, 4];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map(fixedFrameVoiceDuration),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => steelHitAudioPresentation(frame))
          };
        },
        debugSteelHitAudioLifecycleProbe() {
          const previous = { ...game };
          const previousKeys = Array.from(keys);
          const previousStageStart = { active: stageStartAudio.active, frame: stageStartAudio.frame };
          const previousBonusLife = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
          const previousPowerUpPickup = { active: powerUpPickupAudio.active, frame: powerUpPickupAudio.frame };
          const previousPowerUpAppear = { active: powerUpAppearAudio.active, frame: powerUpAppearAudio.frame };
          const previousBrickHit = { active: brickHitAudio.active, frame: brickHitAudio.frame };
          const previousSteelHit = { active: steelHitAudio.active, frame: steelHitAudio.frame };
          const previousEnemyHit = { active: enemyHitAudio.active, frame: enemyHitAudio.frame };
          const previousPlayerShoot = { active: playerShootAudio.active, frame: playerShootAudio.frame };
          const previousMovementIce = { active: movementIceAudio.active, frame: movementIceAudio.frame };
          const previousPause = { active: pauseAudio.active, frame: pauseAudio.frame };
          const state = () => ({
            active: steelHitAudio.active,
            frame: steelHitAudio.frame,
            paused: game.paused,
            audible: steelHitAudio.active && steelHitAudioAudible(),
            movementAudioMode: movementAudio.mode,
            powerUpAppearActive: powerUpAppearAudio.active,
            playerShootActive: playerShootAudio.active,
            playerShootAudible: playerShootAudio.active && playerShootAudioAudible(),
            pauseActive: pauseAudio.active,
            pauseFrame: pauseAudio.frame
          });
          const boundaryBullet = (ownerKind) => {
            const rules = gameSettings().projectileRules;
            return {
              x: -rules.boundsPadding - 1,
              y: FIELD_H / 2,
              w: rules.bulletSize,
              h: rules.bulletSize,
              dir: LEFT,
              speed: 0,
              power: 1,
              ownerKind,
              ownerId: 1,
              ownerKey: `${ownerKind}:1`,
              remove: false
            };
          };
          try {
            stopMovementAudio();
            stopStageStartAudio();
            stopBonusLifeAudio();
            stopPowerUpPickupAudio();
            stopPowerUpAppearAudio();
            stopBrickHitAudio();
            stopEnemyHitAudio();
            stopSteelHitAudio();
            stopPlayerShootAudio();
            stopMovementIceAudio();
            stopPauseAudio();
            game.screen = "playing";
            game.demoMode = false;
            game.paused = false;
            game.clearPendingTimer = 0;
            game.players = [];
            game.enemies = [];
            game.bullets = [];
            game.explosions = [];
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            keys.clear();
            syncMovementAudio();
    
            const playerBullet = boundaryBullet("player");
            resolveBullet(playerBullet);
            const playerBoundary = {
              ...state(),
              bulletRemoved: playerBullet.remove,
              explosionCount: game.explosions.length
            };
            for (let frame = 0; frame < 3; frame += 1) updateSteelHitAudio();
            const beforePause = state();
            game.paused = true;
            startPauseAudio();
            syncSteelHitAudioNodes();
            syncMovementAudio();
            for (let frame = 0; frame < 10; frame += 1) {
              updateSteelHitAudio();
              updatePauseAudio();
            }
            const paused = state();
            game.paused = false;
            syncSteelHitAudioNodes();
            syncMovementAudio();
            updateSteelHitAudio();
            const end = state();
    
            stopPauseAudio();
            stopSteelHitAudio();
            syncMovementAudio();
            game.explosions = [];
            const enemyBullet = boundaryBullet("enemy");
            resolveBullet(enemyBullet);
            const enemyBoundary = {
              ...state(),
              bulletRemoved: enemyBullet.remove,
              explosionCount: game.explosions.length
            };
    
            startSteelHitAudio();
            startPlayerShootAudio();
            const separatePulseChannels = state();
    
            stopPlayerShootAudio();
            stopSteelHitAudio();
            startSteelHitAudio();
            startPowerUpAppearAudio();
            const appearancePriority = state();
            for (let frame = 0; frame < 4; frame += 1) updateSteelHitAudio();
            const appearanceSuppressedEnd = state();
    
            stopPowerUpAppearAudio();
            startSteelHitAudio();
            startStageStartAudio();
            syncSteelHitAudioNodes();
            const stageStartPriority = state();
            for (let frame = 0; frame < 4; frame += 1) updateSteelHitAudio();
            const stageStartSuppressedEnd = state();
    
            stopStageStartAudio();
            startSteelHitAudio();
            startStage(game.stage);
            const stageCleanup = state();
            return {
              playerBoundary,
              beforePause,
              paused,
              end,
              enemyBoundary,
              separatePulseChannels,
              appearancePriority,
              appearanceSuppressedEnd,
              stageStartPriority,
              stageStartSuppressedEnd,
              stageCleanup
            };
          } finally {
            stopMovementAudio();
            stopStageStartAudio();
            stopBonusLifeAudio();
            stopPowerUpPickupAudio();
            stopPowerUpAppearAudio();
            stopBrickHitAudio();
            stopEnemyHitAudio();
            stopSteelHitAudio();
            stopPlayerShootAudio();
            stopMovementIceAudio();
            stopPauseAudio();
            Object.assign(game, previous);
            keys.clear();
            for (const code of previousKeys) keys.add(code);
            stageStartAudio.active = previousStageStart.active;
            stageStartAudio.frame = previousStageStart.frame;
            bonusLifeAudio.active = previousBonusLife.active;
            bonusLifeAudio.frame = previousBonusLife.frame;
            powerUpPickupAudio.active = previousPowerUpPickup.active;
            powerUpPickupAudio.frame = previousPowerUpPickup.frame;
            powerUpAppearAudio.active = previousPowerUpAppear.active;
            powerUpAppearAudio.frame = previousPowerUpAppear.frame;
            brickHitAudio.active = previousBrickHit.active;
            brickHitAudio.frame = previousBrickHit.frame;
            steelHitAudio.active = previousSteelHit.active;
            steelHitAudio.frame = previousSteelHit.frame;
            enemyHitAudio.active = previousEnemyHit.active;
            enemyHitAudio.frame = previousEnemyHit.frame;
            playerShootAudio.active = previousPlayerShoot.active;
            playerShootAudio.frame = previousPlayerShoot.frame;
            movementIceAudio.active = previousMovementIce.active;
            movementIceAudio.frame = previousMovementIce.frame;
            pauseAudio.active = previousPause.active;
            pauseAudio.frame = previousPause.frame;
            syncStageStartAudioNodes();
            syncBonusLifeAudioNodes();
            syncPowerUpPickupAudioNodes();
            syncPowerUpAppearAudioNodes();
            syncBrickHitAudioNodes();
            syncSteelHitAudioNodes();
            syncEnemyHitAudioNodes();
            syncPlayerShootAudioNodes();
            syncMovementIceAudioNodes();
            syncPauseAudioNodes();
            syncMovementAudio();
          }
        },
        debugEnemyHitAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.enemyHit;
          const frames = [0, 1, 2, 3, 4, 5];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map(fixedFrameVoiceDuration),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => enemyHitAudioPresentation(frame))
          };
        },
        debugEnemyHitAudioLifecycleProbe() {
          const previous = { ...game };
          const previousKeys = Array.from(keys);
          const previousStageStart = { active: stageStartAudio.active, frame: stageStartAudio.frame };
          const previousBonusLife = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
          const previousPowerUpPickup = { active: powerUpPickupAudio.active, frame: powerUpPickupAudio.frame };
          const previousPowerUpAppear = { active: powerUpAppearAudio.active, frame: powerUpAppearAudio.frame };
          const previousBrickHit = { active: brickHitAudio.active, frame: brickHitAudio.frame };
          const previousSteelHit = { active: steelHitAudio.active, frame: steelHitAudio.frame };
          const previousEnemyHit = { active: enemyHitAudio.active, frame: enemyHitAudio.frame };
          const previousEnemyDestroy = { active: enemyDestroyAudio.active, frame: enemyDestroyAudio.frame };
          const previousPlayerDestroy = { active: playerDestroyAudio.active, frame: playerDestroyAudio.frame };
          const previousPlayerShoot = { active: playerShootAudio.active, frame: playerShootAudio.frame };
          const previousMovementIce = { active: movementIceAudio.active, frame: movementIceAudio.frame };
          const previousPause = { active: pauseAudio.active, frame: pauseAudio.frame };
          const state = () => {
            const voice = enemyHitAudioPresentation(enemyHitAudio.frame).voices[0];
            const voiceActive = Boolean(voice);
            return {
              active: enemyHitAudio.active,
              frame: enemyHitAudio.frame,
              paused: game.paused,
              voiceActive,
              frequency: voice ? voice.frequency : null,
              audible: enemyHitAudio.active && voiceActive && enemyHitAudioAudible(),
              movementAudioMode: movementAudio.mode,
              brickHitActive: brickHitAudio.active,
              brickHitAudible: brickHitAudio.active && brickHitAudioAudible(),
              steelHitActive: steelHitAudio.active,
              enemyDestroyActive: enemyDestroyAudio.active,
              enemyDestroyFrame: enemyDestroyAudio.frame,
              playerDestroyActive: playerDestroyAudio.active,
              playerDestroyFrame: playerDestroyAudio.frame,
              playerShootActive: playerShootAudio.active,
              playerShootAudible: playerShootAudio.active && playerShootAudioAudible(),
              pauseActive: pauseAudio.active,
              pauseFrame: pauseAudio.frame
            };
          };
          const makeEnemy = (hp) => ({
            kind: "enemy",
            id: 100,
            x: 64,
            y: 64,
            w: 14,
            h: 14,
            alive: true,
            hp,
            spawnFlash: 0,
            carrier: false,
            typeIndex: 3,
            score: enemyTypeDefinitions()[3].score
          });
          const makeBullet = (ownerKind, ownerId) => ({
            x: 69,
            y: 69,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            dir: RIGHT,
            speed: 0,
            power: 1,
            ownerKind,
            ownerId,
            ownerKey: `${ownerKind}:${ownerId}`,
            remove: false
          });
          try {
            stopMovementAudio();
            stopStageStartAudio();
            stopBonusLifeAudio();
            stopPowerUpPickupAudio();
            stopPowerUpAppearAudio();
            stopBrickHitAudio();
            stopEnemyHitAudio();
            stopEnemyDestroyAudio();
            stopPlayerDestroyAudio();
            stopSteelHitAudio();
            stopPlayerShootAudio();
            stopMovementIceAudio();
            stopPauseAudio();
            game.screen = "playing";
            game.demoMode = false;
            game.paused = false;
            game.clearPendingTimer = 0;
            game.players = [];
            game.enemies = [];
            game.bullets = [];
            game.explosions = [];
            game.scorePopups = [];
            game.enemyKilled = 0;
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            keys.clear();
            syncMovementAudio();
    
            const armoredEnemy = makeEnemy(2);
            const armoredBullet = makeBullet("player", 1);
            game.enemies = [armoredEnemy];
            const armoredHitResult = hitTank(armoredBullet);
            const armoredHit = {
              ...state(),
              hit: armoredHitResult,
              bulletRemoved: armoredBullet.remove,
              enemyAlive: armoredEnemy.alive,
              enemyHp: armoredEnemy.hp,
              explosionCount: game.explosions.length
            };
            updateEnemyHitAudio();
            const secondPitch = state();
            updateEnemyHitAudio();
            updateEnemyHitAudio();
            const silentTail = state();
    
            game.paused = true;
            startPauseAudio();
            syncEnemyHitAudioNodes();
            syncMovementAudio();
            for (let frame = 0; frame < 10; frame += 1) {
              updateEnemyHitAudio();
              updatePauseAudio();
            }
            const paused = state();
            game.paused = false;
            syncEnemyHitAudioNodes();
            syncMovementAudio();
            updateEnemyHitAudio();
            updateEnemyHitAudio();
            const end = state();
    
            stopPauseAudio();
            stopEnemyHitAudio();
            syncMovementAudio();
            game.explosions = [];
            game.enemyKilled = 0;
            const lethalEnemy = makeEnemy(1);
            const lethalBullet = makeBullet("player", 1);
            game.enemies = [lethalEnemy];
            const lethalHitResult = hitTank(lethalBullet);
            const lethalHit = {
              ...state(),
              hit: lethalHitResult,
              bulletRemoved: lethalBullet.remove,
              enemyAlive: lethalEnemy.alive,
              enemyDestroying: lethalEnemy.destroying,
              enemyHp: lethalEnemy.hp,
              enemyKilled: game.enemyKilled,
              explosionCount: game.explosions.length
            };
    
            stopEnemyDestroyAudio();
    
            game.explosions = [];
            game.enemies = [];
            const teammate = createPlayer(2);
            teammate.x = 64;
            teammate.y = 64;
            teammate.spawnFlash = 0;
            teammate.invuln = 0;
            teammate.stun = 0;
            game.players = [teammate];
            const friendlyBullet = makeBullet("player", 1);
            const friendlyHitResult = hitTank(friendlyBullet);
            const friendlyHit = {
              ...state(),
              hit: friendlyHitResult,
              bulletRemoved: friendlyBullet.remove,
              stun: teammate.stun,
              explosionCount: game.explosions.length
            };
    
            game.explosions = [];
            const targetPlayer = createPlayer(1);
            targetPlayer.x = 64;
            targetPlayer.y = 64;
            targetPlayer.spawnFlash = 0;
            targetPlayer.invuln = 0;
            game.players = [targetPlayer];
            const enemyBullet = makeBullet("enemy", 100);
            const playerHitResult = hitTank(enemyBullet);
            const playerHit = {
              ...state(),
              hit: playerHitResult,
              bulletRemoved: enemyBullet.remove,
              playerAlive: targetPlayer.alive,
              playerDestroying: targetPlayer.destroying,
              playerRespawn: targetPlayer.respawn,
              explosionCount: game.explosions.length
            };
            stopPlayerDestroyAudio();
    
            stopEnemyHitAudio();
            startEnemyHitAudio();
            startBrickHitAudio();
            startPlayerShootAudio();
            const separateChannels = state();
    
            stopBrickHitAudio();
            stopPlayerShootAudio();
            stopEnemyHitAudio();
            startEnemyHitAudio();
            startSteelHitAudio();
            const steelPriority = state();
            for (let frame = 0; frame < 5; frame += 1) {
              updateSteelHitAudio();
              updateEnemyHitAudio();
            }
            const steelSuppressedEnd = state();
    
            stopSteelHitAudio();
            startEnemyHitAudio();
            startStage(game.stage);
            const stageCleanup = state();
            return {
              armoredHit,
              secondPitch,
              silentTail,
              paused,
              end,
              lethalHit,
              friendlyHit,
              playerHit,
              separateChannels,
              steelPriority,
              steelSuppressedEnd,
              stageCleanup
            };
          } finally {
            stopMovementAudio();
            stopStageStartAudio();
            stopBonusLifeAudio();
            stopPowerUpPickupAudio();
            stopPowerUpAppearAudio();
            stopBrickHitAudio();
            stopEnemyHitAudio();
            stopEnemyDestroyAudio();
            stopPlayerDestroyAudio();
            stopSteelHitAudio();
            stopPlayerShootAudio();
            stopMovementIceAudio();
            stopPauseAudio();
            Object.assign(game, previous);
            keys.clear();
            for (const code of previousKeys) keys.add(code);
            stageStartAudio.active = previousStageStart.active;
            stageStartAudio.frame = previousStageStart.frame;
            bonusLifeAudio.active = previousBonusLife.active;
            bonusLifeAudio.frame = previousBonusLife.frame;
            powerUpPickupAudio.active = previousPowerUpPickup.active;
            powerUpPickupAudio.frame = previousPowerUpPickup.frame;
            powerUpAppearAudio.active = previousPowerUpAppear.active;
            powerUpAppearAudio.frame = previousPowerUpAppear.frame;
            brickHitAudio.active = previousBrickHit.active;
            brickHitAudio.frame = previousBrickHit.frame;
            steelHitAudio.active = previousSteelHit.active;
            steelHitAudio.frame = previousSteelHit.frame;
            enemyHitAudio.active = previousEnemyHit.active;
            enemyHitAudio.frame = previousEnemyHit.frame;
            enemyDestroyAudio.active = previousEnemyDestroy.active;
            enemyDestroyAudio.frame = previousEnemyDestroy.frame;
            playerDestroyAudio.active = previousPlayerDestroy.active;
            playerDestroyAudio.frame = previousPlayerDestroy.frame;
            playerShootAudio.active = previousPlayerShoot.active;
            playerShootAudio.frame = previousPlayerShoot.frame;
            movementIceAudio.active = previousMovementIce.active;
            movementIceAudio.frame = previousMovementIce.frame;
            pauseAudio.active = previousPause.active;
            pauseAudio.frame = previousPause.frame;
            syncStageStartAudioNodes();
            syncBonusLifeAudioNodes();
            syncPowerUpPickupAudioNodes();
            syncPowerUpAppearAudioNodes();
            syncBrickHitAudioNodes();
            syncSteelHitAudioNodes();
            syncEnemyHitAudioNodes();
            syncEnemyDestroyAudioNodes();
            syncPlayerDestroyAudioNodes();
            syncPlayerShootAudioNodes();
            syncMovementIceAudioNodes();
            syncPauseAudioNodes();
            syncMovementAudio();
          }
        },
        debugEnemyDestroyAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.enemyDestroy;
          const frames = [0, 1, 2, 3, 4, 13, 14];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map(fixedFrameVoiceDuration),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => enemyDestroyAudioPresentation(frame))
          };
        },
        debugEnemyDestroyAudioLifecycleProbe() {
          const previous = { ...game };
          const audioStates = [
            stageStartAudio,
            bonusLifeAudio,
            powerUpPickupAudio,
            powerUpAppearAudio,
            brickHitAudio,
            baseHitAudio,
            steelHitAudio,
            enemyHitAudio,
            enemyDestroyAudio,
            playerDestroyAudio,
            playerShootAudio,
            movementIceAudio,
            pauseAudio,
            scoreCountAudio,
            stageBonusAudio
          ];
          const previousAudio = audioStates.map((audioState) => ({
            active: audioState.active,
            frame: audioState.frame
          }));
          const state = () => {
            const voice = enemyDestroyAudioPresentation(enemyDestroyAudio.frame).voices[0];
            return {
              active: enemyDestroyAudio.active,
              frame: enemyDestroyAudio.frame,
              frequency: voice ? voice.frequency : null,
              gain: voice ? voice.gain : null,
              wave: voice ? voice.wave : null,
              audible: enemyDestroyAudio.active && Boolean(voice) && !game.paused,
              paused: game.paused,
              enemyHitActive: enemyHitAudio.active
            };
          };
          const makeEnemy = (id, spawnFlash) => ({
            kind: "enemy",
            id,
            x: 64 + id * 16,
            y: 64,
            w: 14,
            h: 14,
            alive: true,
            hp: 1,
            spawnFlash: Math.max(0, Math.floor(Number(spawnFlash) || 0)),
            carrier: false,
            typeIndex: 0,
            score: enemyTypeDefinitions()[0].score
          });
          const makeBullet = () => ({
            x: 85,
            y: 69,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            dir: RIGHT,
            speed: 0,
            power: 1,
            ownerKind: "player",
            ownerId: 1,
            ownerKey: "player:1",
            remove: false
          });
          try {
            stopMovementAudio();
            for (const audioState of audioStates) stopFixedFrameAudio(audioState);
            game.screen = "playing";
            game.demoMode = false;
            game.paused = false;
            game.clearPendingTimer = 0;
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [createPlayer(1)];
            game.enemies = [makeEnemy(1, 0)];
            game.bullets = [];
            game.explosions = [];
            game.scorePopups = [];
            game.enemyKilled = 0;
            const lethalBullet = makeBullet();
            const lethalHitResult = hitTank(lethalBullet);
            const lethalHit = {
              ...state(),
              hit: lethalHitResult,
              bulletRemoved: lethalBullet.remove,
              enemyAlive: game.enemies[0].alive,
              enemyDestroying: game.enemies[0].destroying,
              enemyKilled: game.enemyKilled,
              explosionCount: game.explosions.length
            };
    
            updateEnemyDestroyAudio();
            updateEnemyDestroyAudio();
            const secondEnvelope = state();
            updateEnemyDestroyAudio();
            updateEnemyDestroyAudio();
            const tailEnvelope = state();
    
            game.paused = true;
            startPauseAudio();
            syncEnemyDestroyAudioNodes();
            for (let frame = 0; frame < 10; frame += 1) {
              updateEnemyDestroyAudio();
              updatePauseAudio();
            }
            const paused = state();
            game.paused = false;
            syncEnemyDestroyAudioNodes();
            for (let frame = 0; frame < 9; frame += 1) updateEnemyDestroyAudio();
            const finalFrame = state();
            updateEnemyDestroyAudio();
            const end = state();
    
            stopPauseAudio();
            stopEnemyDestroyAudio();
            game.players = [createPlayer(1)];
            const grenadeTargets = [makeEnemy(1, 0), makeEnemy(2, 0), makeEnemy(3, 12)];
            game.enemies = grenadeTargets;
            game.enemyKilled = 0;
            game.explosions = [];
            applyPowerUp(game.players[0], "grenade");
            const grenade = {
              ...state(),
              activeEnemies: grenadeTargets.filter((enemy) => enemy.alive && !enemy.destroying && enemy.spawnFlash <= 0).length,
              destroyingEnemies: grenadeTargets.filter((enemy) => enemy.destroying).length,
              spawningAlive: grenadeTargets[2].alive,
              enemyKilled: game.enemyKilled,
              explosionCount: game.explosions.length
            };
    
            stopEnemyDestroyAudio();
            game.enemies = [makeEnemy(1, 12)];
            game.enemyKilled = 0;
            game.explosions = [];
            applyPowerUp(game.players[0], "grenade");
            const noActiveTargets = {
              ...state(),
              spawningAlive: game.enemies[0].alive,
              enemyKilled: game.enemyKilled,
              explosionCount: game.explosions.length
            };
    
            startEnemyDestroyAudio();
            startStage(game.stage);
            const stageCleanup = state();
    
            return { lethalHit, secondEnvelope, tailEnvelope, paused, finalFrame, end, grenade, noActiveTargets, stageCleanup };
          } finally {
            for (const audioState of audioStates) stopFixedFrameAudio(audioState);
            Object.assign(game, previous);
            audioStates.forEach((audioState, index) => {
              audioState.active = previousAudio[index].active;
              audioState.frame = previousAudio[index].frame;
            });
            syncStageStartAudioNodes();
            syncBonusLifeAudioNodes();
            syncPowerUpPickupAudioNodes();
            syncPowerUpAppearAudioNodes();
            syncBrickHitAudioNodes();
            syncBaseHitAudioNodes();
            syncSteelHitAudioNodes();
            syncEnemyHitAudioNodes();
            syncEnemyDestroyAudioNodes();
            syncPlayerDestroyAudioNodes();
            syncPlayerShootAudioNodes();
            syncMovementIceAudioNodes();
            syncPauseAudioNodes();
            syncScoreCountAudioNodes();
            syncStageBonusAudioNodes();
            syncMovementAudio();
          }
        },
        debugPlayerDestroyAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.playerDestroy;
          const frames = [0, 3, 4, 7, 8, 11, 12, 15, 16, 19, 20, 21, 22, 23, 24, 25, 26];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map(fixedFrameVoiceDuration),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => playerDestroyAudioPresentation(frame))
          };
        },
        debugPlayerDestroyAudioLifecycleProbe() {
          const previous = { ...game };
          const audioStates = [
            stageStartAudio,
            bonusLifeAudio,
            powerUpPickupAudio,
            powerUpAppearAudio,
            brickHitAudio,
            baseHitAudio,
            steelHitAudio,
            enemyHitAudio,
            enemyDestroyAudio,
            playerDestroyAudio,
            playerShootAudio,
            movementIceAudio,
            pauseAudio,
            scoreCountAudio,
            stageBonusAudio
          ];
          const previousAudio = audioStates.map((audioState) => ({
            active: audioState.active,
            frame: audioState.frame
          }));
          const state = () => {
            const voice = playerDestroyAudioPresentation(playerDestroyAudio.frame).voices[0];
            const enemyVoice = enemyDestroyAudioPresentation(enemyDestroyAudio.frame).voices[0];
            return {
              active: playerDestroyAudio.active,
              frame: playerDestroyAudio.frame,
              frequency: voice ? voice.frequency : null,
              gain: voice ? voice.gain : null,
              wave: voice ? voice.wave : null,
              audible: playerDestroyAudio.active && Boolean(voice) && !game.paused,
              paused: game.paused,
              baseHitActive: baseHitAudio.active,
              baseHitFrame: baseHitAudio.frame,
              baseHitAudible: baseHitAudio.active && baseHitAudioAudible() && !game.paused,
              enemyDestroyActive: enemyDestroyAudio.active,
              enemyDestroyFrame: enemyDestroyAudio.frame,
              enemyDestroyAudible: enemyDestroyAudio.active && Boolean(enemyVoice) && enemyDestroyAudioAudible() && !game.paused,
              baseDestroyTimer: game.baseDestroyTimer,
              screen: game.screen
            };
          };
          const makePlayer = (invuln) => {
            const player = createPlayer(1);
            player.x = 64;
            player.y = 64;
            player.alive = true;
            player.lives = 2;
            player.level = 3;
            player.respawn = 0;
            player.spawnFlash = 0;
            player.invuln = Math.max(0, Math.floor(Number(invuln) || 0));
            return player;
          };
          const makeEnemyBullet = (x, y) => ({
            x,
            y,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            dir: DOWN,
            speed: 0,
            power: 1,
            ownerKind: "enemy",
            ownerId: 100,
            ownerKey: "enemy:100",
            remove: false
          });
          try {
            stopMovementAudio();
            for (const audioState of audioStates) stopFixedFrameAudio(audioState);
            game.screen = "playing";
            game.demoMode = false;
            game.paused = false;
            game.clearPendingTimer = 0;
            game.baseDestroyTimer = 0;
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.enemies = [];
            game.bullets = [];
            game.explosions = [];
            game.scorePopups = [];
            const player = makePlayer(0);
            game.players = [player];
            const lethalBullet = makeEnemyBullet(player.x + 5, player.y + 5);
            const lethalHitResult = hitTank(lethalBullet);
            const playerHit = {
              ...state(),
              hit: lethalHitResult,
              bulletRemoved: lethalBullet.remove,
              playerAlive: player.alive,
              playerDestroying: player.destroying,
              playerRespawn: player.respawn,
              playerLevel: player.level,
              explosionCount: game.explosions.length
            };
    
            for (let frame = 0; frame < 4; frame += 1) updatePlayerDestroyAudio();
            const volume14 = state();
            for (let frame = 0; frame < 4; frame += 1) updatePlayerDestroyAudio();
            const volume13 = state();
    
            game.paused = true;
            startPauseAudio();
            syncPlayerDestroyAudioNodes();
            for (let frame = 0; frame < 10; frame += 1) {
              updatePlayerDestroyAudio();
              updatePauseAudio();
            }
            const paused = state();
            game.paused = false;
            syncPlayerDestroyAudioNodes();
            for (let frame = 0; frame < 17; frame += 1) updatePlayerDestroyAudio();
            const finalFrame = state();
            updatePlayerDestroyAudio();
            const end = state();
    
            stopPauseAudio();
            stopPlayerDestroyAudio();
            game.players = [makePlayer(1)];
            game.explosions = [];
            const shieldedBullet = makeEnemyBullet(game.players[0].x + 5, game.players[0].y + 5);
            const shieldedHitResult = hitTank(shieldedBullet);
            const shielded = {
              ...state(),
              hit: shieldedHitResult,
              bulletRemoved: shieldedBullet.remove,
              playerAlive: game.players[0].alive,
              explosionCount: game.explosions.length
            };
    
            stopPlayerDestroyAudio();
            game.screen = "playing";
            game.players = [makePlayer(0)];
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.explosions = [];
            const baseBullet = makeEnemyBullet(game.base.x + 5, game.base.y + 5);
            resolveBullet(baseBullet);
            const baseHit = {
              ...state(),
              baseAlive: game.base.alive,
              bulletRemoved: baseBullet.remove,
              explosionCount: game.explosions.length
            };
            update();
            const gameOverContinuation = state();
            stopBaseHitAudio();
    
            stopPlayerDestroyAudio();
            stopEnemyDestroyAudio();
            game.screen = "playing";
            game.paused = false;
            startEnemyDestroyAudio();
            for (let frame = 0; frame < 3; frame += 1) updateEnemyDestroyAudio();
            const enemyBeforePriority = state();
            startPlayerDestroyAudio();
            const playerPriority = state();
            for (let frame = 0; frame < 10; frame += 1) {
              updateEnemyDestroyAudio();
              updatePlayerDestroyAudio();
            }
            const simultaneousProgress = state();
            updateEnemyDestroyAudio();
            updatePlayerDestroyAudio();
            const enemySuppressedEnd = state();
    
            startPlayerDestroyAudio();
            startStage(game.stage);
            const stageCleanup = state();
    
            return {
              playerHit,
              volume14,
              volume13,
              paused,
              finalFrame,
              end,
              shielded,
              baseHit,
              gameOverContinuation,
              enemyBeforePriority,
              playerPriority,
              simultaneousProgress,
              enemySuppressedEnd,
              stageCleanup
            };
          } finally {
            for (const audioState of audioStates) stopFixedFrameAudio(audioState);
            Object.assign(game, previous);
            audioStates.forEach((audioState, index) => {
              audioState.active = previousAudio[index].active;
              audioState.frame = previousAudio[index].frame;
            });
            syncStageStartAudioNodes();
            syncBonusLifeAudioNodes();
            syncPowerUpPickupAudioNodes();
            syncPowerUpAppearAudioNodes();
            syncBrickHitAudioNodes();
            syncBaseHitAudioNodes();
            syncSteelHitAudioNodes();
            syncEnemyHitAudioNodes();
            syncEnemyDestroyAudioNodes();
            syncPlayerDestroyAudioNodes();
            syncPlayerShootAudioNodes();
            syncMovementIceAudioNodes();
            syncPauseAudioNodes();
            syncScoreCountAudioNodes();
            syncStageBonusAudioNodes();
            syncMovementAudio();
          }
        },
        debugBaseHitAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.baseHit;
          const frames = [0, 2, 3, 5, 6, 8, 9, 11, 12, 14, 15, 17, 18, 20, 21, 23, 24, 26, 27];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map(fixedFrameVoiceDuration),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => baseHitAudioPresentation(frame))
          };
        },
        debugBaseHitAudioLifecycleProbe() {
          const previous = { ...game };
          const audioStates = [
            stageStartAudio,
            bonusLifeAudio,
            powerUpPickupAudio,
            powerUpAppearAudio,
            brickHitAudio,
            baseHitAudio,
            steelHitAudio,
            enemyHitAudio,
            enemyDestroyAudio,
            playerDestroyAudio,
            playerShootAudio,
            movementIceAudio,
            pauseAudio,
            scoreCountAudio,
            stageBonusAudio
          ];
          const previousAudio = audioStates.map((audioState) => ({
            active: audioState.active,
            frame: audioState.frame
          }));
          const state = () => {
            const voice = baseHitAudioPresentation(baseHitAudio.frame).voices[0];
            return {
              active: baseHitAudio.active,
              frame: baseHitAudio.frame,
              frequency: voice ? voice.frequency : null,
              audible: baseHitAudio.active && Boolean(voice) && baseHitAudioAudible() && !game.paused,
              paused: game.paused,
              playerDestroyActive: playerDestroyAudio.active,
              playerDestroyFrame: playerDestroyAudio.frame,
              powerUpAppearActive: powerUpAppearAudio.active,
              powerUpAppearFrame: powerUpAppearAudio.frame,
              steelHitActive: steelHitAudio.active,
              steelHitFrame: steelHitAudio.frame,
              steelHitAudible: steelHitAudio.active && steelHitAudioAudible(),
              enemyHitActive: enemyHitAudio.active,
              enemyHitFrame: enemyHitAudio.frame,
              enemyHitAudible: enemyHitAudio.active && enemyHitAudioAudible(),
              movementAudioMode: movementAudio.mode,
              baseDestroyTimer: game.baseDestroyTimer,
              screen: game.screen
            };
          };
          const makePlayer = () => {
            const player = createPlayer(1);
            player.spawnFlash = 0;
            player.invuln = 0;
            return player;
          };
          const makeBaseBullet = () => ({
            x: 6 * TILE + 5,
            y: 12 * TILE + 5,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            dir: DOWN,
            speed: 0,
            power: 1,
            ownerKind: "enemy",
            ownerId: 100,
            ownerKey: "enemy:100",
            remove: false
          });
          try {
            stopMovementAudio();
            for (const audioState of audioStates) stopFixedFrameAudio(audioState);
            game.screen = "playing";
            game.demoMode = false;
            game.paused = false;
            game.clearPendingTimer = 0;
            game.baseDestroyTimer = 0;
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [makePlayer()];
            game.enemies = [];
            game.bullets = [];
            game.explosions = [];
            game.scorePopups = [];
            const baseBullet = makeBaseBullet();
            const baseHitResult = hitBase(baseBullet);
            const triggered = {
              ...state(),
              hit: baseHitResult,
              baseAlive: game.base.alive,
              bulletRemoved: baseBullet.remove,
              explosionCount: game.explosions.length
            };
            update();
            const gameOverContinuation = state();
            for (let frame = 0; frame < 25; frame += 1) update();
            const finalFrame = state();
            update();
            const end = state();
    
            stopBaseHitAudio();
            stopPlayerDestroyAudio();
            stopSteelHitAudio();
            stopEnemyHitAudio();
            game.screen = "playing";
            game.paused = false;
            startSteelHitAudio();
            startEnemyHitAudio();
            startBaseHitAudio();
            const lowerPriority = state();
            for (let frame = 0; frame < 4; frame += 1) {
              updateBaseHitAudio();
              updateSteelHitAudio();
              updateEnemyHitAudio();
            }
            const lowerPriorityProgress = state();
            updateBaseHitAudio();
            updateEnemyHitAudio();
            const lowerPriorityEnd = state();
    
            stopBaseHitAudio();
            game.paused = false;
            startBaseHitAudio();
            game.paused = true;
            syncBaseHitAudioNodes();
            for (let frame = 0; frame < 10; frame += 1) updateBaseHitAudio();
            const paused = state();
            game.paused = false;
            syncBaseHitAudioNodes();
            const resumed = state();
    
            stopBaseHitAudio();
            stopPowerUpAppearAudio();
            startBaseHitAudio();
            startPowerUpAppearAudio();
            const appearancePriority = state();
            for (let frame = 0; frame < 26; frame += 1) {
              updateBaseHitAudio();
              updatePowerUpAppearAudio();
            }
            const appearanceMaskedFinalFrame = state();
            updateBaseHitAudio();
            updatePowerUpAppearAudio();
            const appearanceMaskedEnd = state();
    
            stopPowerUpAppearAudio();
            startBaseHitAudio();
            startStage(game.stage);
            const stageCleanup = state();
    
            return {
              triggered,
              gameOverContinuation,
              finalFrame,
              end,
              lowerPriority,
              lowerPriorityProgress,
              lowerPriorityEnd,
              paused,
              resumed,
              appearancePriority,
              appearanceMaskedFinalFrame,
              appearanceMaskedEnd,
              stageCleanup
            };
          } finally {
            for (const audioState of audioStates) stopFixedFrameAudio(audioState);
            Object.assign(game, previous);
            audioStates.forEach((audioState, index) => {
              audioState.active = previousAudio[index].active;
              audioState.frame = previousAudio[index].frame;
            });
            syncStageStartAudioNodes();
            syncBonusLifeAudioNodes();
            syncPowerUpPickupAudioNodes();
            syncPowerUpAppearAudioNodes();
            syncBrickHitAudioNodes();
            syncBaseHitAudioNodes();
            syncSteelHitAudioNodes();
            syncEnemyHitAudioNodes();
            syncEnemyDestroyAudioNodes();
            syncPlayerDestroyAudioNodes();
            syncPlayerShootAudioNodes();
            syncMovementIceAudioNodes();
            syncPauseAudioNodes();
            syncScoreCountAudioNodes();
            syncStageBonusAudioNodes();
            syncMovementAudio();
          }
        },
        debugPlayerShootAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.playerShoot;
          const frames = [0, 14, 15];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map(fixedFrameVoiceDuration),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => playerShootAudioPresentation(frame))
          };
        },
        debugPlayerShootAudioLifecycleProbe() {
          const previous = { ...game };
          const previousKeys = Array.from(keys);
          const previousStageStart = { active: stageStartAudio.active, frame: stageStartAudio.frame };
          const previousBonusLife = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
          const previousPowerUpPickup = { active: powerUpPickupAudio.active, frame: powerUpPickupAudio.frame };
          const previousPowerUpAppear = { active: powerUpAppearAudio.active, frame: powerUpAppearAudio.frame };
          const previousBrickHit = { active: brickHitAudio.active, frame: brickHitAudio.frame };
          const previousSteelHit = { active: steelHitAudio.active, frame: steelHitAudio.frame };
          const previousEnemyHit = { active: enemyHitAudio.active, frame: enemyHitAudio.frame };
          const previousPlayerShoot = { active: playerShootAudio.active, frame: playerShootAudio.frame };
          const previousMovementIce = { active: movementIceAudio.active, frame: movementIceAudio.frame };
          const previousPause = { active: pauseAudio.active, frame: pauseAudio.frame };
          const state = () => ({
            active: playerShootAudio.active,
            frame: playerShootAudio.frame,
            paused: game.paused,
            audible: playerShootAudio.active && playerShootAudioAudible(),
            iceActive: movementIceAudio.active,
            iceFrame: movementIceAudio.frame,
            iceAudible: movementIceAudio.active && movementIceAudioAudible()
          });
          try {
            stopMovementAudio();
            stopStageStartAudio();
            stopBonusLifeAudio();
            stopPowerUpPickupAudio();
            stopPowerUpAppearAudio();
            stopBrickHitAudio();
            stopEnemyHitAudio();
            stopSteelHitAudio();
            stopPlayerShootAudio();
            stopMovementIceAudio();
            stopPauseAudio();
            const player = createPlayer(1);
            player.x = 32;
            player.y = 32;
            player.dir = RIGHT;
            player.spawnFlash = 0;
            player.invuln = 0;
            player.respawn = 0;
            player.reload = 0;
            const enemyType = enemyTypeDefinitions()[0];
            const enemy = {
              kind: "enemy",
              id: 100,
              x: 64,
              y: 32,
              w: 14,
              h: 14,
              dir: LEFT,
              alive: true,
              spawnFlash: 0,
              reload: 0,
              reloadBase: enemyType.reload,
              bulletSpeed: enemyType.bullet,
              bulletPower: enemyType.wallPower
            };
            game.screen = "playing";
            game.demoMode = false;
            game.paused = false;
            game.clearPendingTimer = 0;
            game.players = [player];
            game.enemies = [enemy];
            game.bullets = [];
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            keys.clear();
    
            shoot(player);
            const playerStart = { ...state(), bulletCount: game.bullets.length };
            for (let frame = 0; frame < 5; frame += 1) updatePlayerShootAudio();
            player.reload = 0;
            shoot(player);
            const failedRetrigger = { ...state(), bulletCount: game.bullets.length };
            for (let frame = 0; frame < 9; frame += 1) updatePlayerShootAudio();
            const beforePause = state();
            game.paused = true;
            syncPlayerShootAudioNodes();
            for (let frame = 0; frame < 10; frame += 1) updatePlayerShootAudio();
            const paused = state();
            game.paused = false;
            syncPlayerShootAudioNodes();
            updatePlayerShootAudio();
            const end = state();
    
            stopPlayerShootAudio();
            game.bullets = [];
            shoot(enemy);
            const enemyShot = { ...state(), bulletCount: game.bullets.length };
    
            game.bullets = [];
            player.reload = 0;
            shoot(player);
            startMovementIceAudio();
            const shotPriority = state();
            for (let frame = 0; frame < 4; frame += 1) {
              updatePlayerShootAudio();
              updateMovementIceAudio();
            }
            const iceSuppressedEnd = state();
    
            stopPlayerShootAudio();
            player.reload = 0;
            game.bullets = [];
            shoot(player);
            startStageStartAudio();
            syncPlayerShootAudioNodes();
            const stageStartPriority = state();
            for (let frame = 0; frame < 15; frame += 1) updatePlayerShootAudio();
            const stageStartSuppressedEnd = state();
    
            stopStageStartAudio();
            player.reload = 0;
            game.bullets = [];
            shoot(player);
            startBonusLifeAudio();
            const bonusLifePriority = state();
            for (let frame = 0; frame < 15; frame += 1) updatePlayerShootAudio();
            const bonusLifeSuppressedEnd = state();
    
            stopBonusLifeAudio();
            player.reload = 0;
            game.bullets = [];
            shoot(player);
            startStage(game.stage);
            const stageCleanup = state();
            return {
              playerStart,
              failedRetrigger,
              beforePause,
              paused,
              end,
              enemyShot,
              shotPriority,
              iceSuppressedEnd,
              stageStartPriority,
              stageStartSuppressedEnd,
              bonusLifePriority,
              bonusLifeSuppressedEnd,
              stageCleanup
            };
          } finally {
            stopMovementAudio();
            stopStageStartAudio();
            stopBonusLifeAudio();
            stopPowerUpPickupAudio();
            stopPowerUpAppearAudio();
            stopBrickHitAudio();
            stopEnemyHitAudio();
            stopSteelHitAudio();
            stopPlayerShootAudio();
            stopMovementIceAudio();
            stopPauseAudio();
            Object.assign(game, previous);
            keys.clear();
            for (const code of previousKeys) keys.add(code);
            stageStartAudio.active = previousStageStart.active;
            stageStartAudio.frame = previousStageStart.frame;
            bonusLifeAudio.active = previousBonusLife.active;
            bonusLifeAudio.frame = previousBonusLife.frame;
            powerUpPickupAudio.active = previousPowerUpPickup.active;
            powerUpPickupAudio.frame = previousPowerUpPickup.frame;
            powerUpAppearAudio.active = previousPowerUpAppear.active;
            powerUpAppearAudio.frame = previousPowerUpAppear.frame;
            brickHitAudio.active = previousBrickHit.active;
            brickHitAudio.frame = previousBrickHit.frame;
            steelHitAudio.active = previousSteelHit.active;
            steelHitAudio.frame = previousSteelHit.frame;
            enemyHitAudio.active = previousEnemyHit.active;
            enemyHitAudio.frame = previousEnemyHit.frame;
            playerShootAudio.active = previousPlayerShoot.active;
            playerShootAudio.frame = previousPlayerShoot.frame;
            movementIceAudio.active = previousMovementIce.active;
            movementIceAudio.frame = previousMovementIce.frame;
            pauseAudio.active = previousPause.active;
            pauseAudio.frame = previousPause.frame;
            syncStageStartAudioNodes();
            syncBonusLifeAudioNodes();
            syncPowerUpPickupAudioNodes();
            syncPowerUpAppearAudioNodes();
            syncBrickHitAudioNodes();
            syncSteelHitAudioNodes();
            syncEnemyHitAudioNodes();
            syncPlayerShootAudioNodes();
            syncMovementIceAudioNodes();
            syncPauseAudioNodes();
            syncMovementAudio();
          }
        },
        debugMovementIceAudioLifecycleProbe() {
          const previous = { ...game };
          const previousKeys = Array.from(keys);
          const previousStageStart = { active: stageStartAudio.active, frame: stageStartAudio.frame };
          const previousBonusLife = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
          const previousPowerUpPickup = { active: powerUpPickupAudio.active, frame: powerUpPickupAudio.frame };
          const previousPowerUpAppear = { active: powerUpAppearAudio.active, frame: powerUpAppearAudio.frame };
          const previousBrickHit = { active: brickHitAudio.active, frame: brickHitAudio.frame };
          const previousSteelHit = { active: steelHitAudio.active, frame: steelHitAudio.frame };
          const previousEnemyHit = { active: enemyHitAudio.active, frame: enemyHitAudio.frame };
          const previousPlayerShoot = { active: playerShootAudio.active, frame: playerShootAudio.frame };
          const previousMovementIce = { active: movementIceAudio.active, frame: movementIceAudio.frame };
          const previousPause = { active: pauseAudio.active, frame: pauseAudio.frame };
          const state = () => ({
            active: movementIceAudio.active,
            frame: movementIceAudio.frame,
            paused: game.paused,
            audible: movementIceAudio.active && movementIceAudioAudible(),
            movementAudioMode: movementAudio.mode
          });
          try {
            stopMovementAudio();
            stopStageStartAudio();
            stopBonusLifeAudio();
            stopPowerUpPickupAudio();
            stopPowerUpAppearAudio();
            stopBrickHitAudio();
            stopEnemyHitAudio();
            stopSteelHitAudio();
            stopPlayerShootAudio();
            stopMovementIceAudio();
            stopPauseAudio();
            const player = createPlayer(1);
            player.x = 32;
            player.y = 32;
            player.dir = RIGHT;
            player.spawnFlash = 0;
            player.invuln = 0;
            player.respawn = 0;
            player.slide = 0;
            game.screen = "playing";
            game.demoMode = false;
            game.paused = false;
            game.clearPendingTimer = 0;
            game.players = [player];
            game.enemies = [];
            game.grid = Array.from(
              { length: GRID },
              () => Array.from({ length: GRID }, () => makeCell(ICE, 0))
            );
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            keys.clear();
            syncMovementAudio();
    
            updatePlayerMovement(player, RIGHT);
            const start = state();
            for (let frame = 0; frame < 3; frame += 1) updateMovementIceAudio();
            const beforePause = state();
            game.paused = true;
            syncMovementIceAudioNodes();
            syncMovementAudio();
            for (let frame = 0; frame < 10; frame += 1) updateMovementIceAudio();
            const paused = state();
            game.paused = false;
            syncMovementIceAudioNodes();
            syncMovementAudio();
            updateMovementIceAudio();
            const end = state();
    
            player.slide = 0;
            updatePlayerMovement(player, RIGHT);
            const retriggered = state();
            startStageStartAudio();
            syncMovementIceAudioNodes();
            const stageStartPriority = state();
            for (let frame = 0; frame < 4; frame += 1) updateMovementIceAudio();
            const stageStartSuppressedEnd = state();
    
            stopStageStartAudio();
            startMovementIceAudio();
            startBonusLifeAudio();
            const bonusLifePriority = state();
            for (let frame = 0; frame < 4; frame += 1) updateMovementIceAudio();
            const bonusLifeSuppressedEnd = state();
    
            stopBonusLifeAudio();
            startMovementIceAudio();
            startStage(game.stage);
            const stageCleanup = state();
            return {
              start,
              beforePause,
              paused,
              end,
              retriggered,
              stageStartPriority,
              stageStartSuppressedEnd,
              bonusLifePriority,
              bonusLifeSuppressedEnd,
              stageCleanup
            };
          } finally {
            stopMovementAudio();
            stopStageStartAudio();
            stopBonusLifeAudio();
            stopPowerUpPickupAudio();
            stopPowerUpAppearAudio();
            stopBrickHitAudio();
            stopEnemyHitAudio();
            stopSteelHitAudio();
            stopPlayerShootAudio();
            stopMovementIceAudio();
            stopPauseAudio();
            Object.assign(game, previous);
            keys.clear();
            for (const code of previousKeys) keys.add(code);
            stageStartAudio.active = previousStageStart.active;
            stageStartAudio.frame = previousStageStart.frame;
            bonusLifeAudio.active = previousBonusLife.active;
            bonusLifeAudio.frame = previousBonusLife.frame;
            powerUpPickupAudio.active = previousPowerUpPickup.active;
            powerUpPickupAudio.frame = previousPowerUpPickup.frame;
            powerUpAppearAudio.active = previousPowerUpAppear.active;
            powerUpAppearAudio.frame = previousPowerUpAppear.frame;
            brickHitAudio.active = previousBrickHit.active;
            brickHitAudio.frame = previousBrickHit.frame;
            steelHitAudio.active = previousSteelHit.active;
            steelHitAudio.frame = previousSteelHit.frame;
            enemyHitAudio.active = previousEnemyHit.active;
            enemyHitAudio.frame = previousEnemyHit.frame;
            playerShootAudio.active = previousPlayerShoot.active;
            playerShootAudio.frame = previousPlayerShoot.frame;
            movementIceAudio.active = previousMovementIce.active;
            movementIceAudio.frame = previousMovementIce.frame;
            pauseAudio.active = previousPause.active;
            pauseAudio.frame = previousPause.frame;
            syncStageStartAudioNodes();
            syncBonusLifeAudioNodes();
            syncPowerUpPickupAudioNodes();
            syncPowerUpAppearAudioNodes();
            syncBrickHitAudioNodes();
            syncSteelHitAudioNodes();
            syncEnemyHitAudioNodes();
            syncPlayerShootAudioNodes();
            syncMovementIceAudioNodes();
            syncPauseAudioNodes();
            syncMovementAudio();
          }
        },
        debugStageStartAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.stageStart;
          const frames = [0, 7, 8, 47, 48, 94, 95, 263, 264];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map(fixedFrameVoiceDuration),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => stageStartAudioPresentation(frame))
          };
        },
        debugBonusLifeAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.bonusLife;
          const frames = [0, 1, 2, 5, 6, 41, 42, 53, 54, 59, 60];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map(fixedFrameVoiceDuration),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => bonusLifeAudioPresentation(frame))
          };
        },
        debugPowerUpPickupAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.powerUp;
          const frames = [0, 2, 3, 35, 36, 38, 39];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map(fixedFrameVoiceDuration),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => powerUpPickupAudioPresentation(frame))
          };
        },
        debugPowerUpAppearAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.powerUpAppear;
          const frames = [0, 3, 4, 7, 8, 27, 28, 31, 32];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map(fixedFrameVoiceDuration),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => powerUpAppearAudioPresentation(frame))
          };
        },
        debugPowerUpAppearAudioLifecycleProbe() {
          const previous = { ...game };
          const previousKeys = Array.from(keys);
          const previousStageStart = { active: stageStartAudio.active, frame: stageStartAudio.frame };
          const previousBonusLife = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
          const previousPowerUpPickup = { active: powerUpPickupAudio.active, frame: powerUpPickupAudio.frame };
          const previousPowerUpAppear = { active: powerUpAppearAudio.active, frame: powerUpAppearAudio.frame };
          const previousPause = { active: pauseAudio.active, frame: pauseAudio.frame };
          const state = () => ({
            active: powerUpAppearAudio.active,
            frame: powerUpAppearAudio.frame,
            paused: game.paused,
            audible: powerUpAppearAudioAudible(),
            movementAudioMode: movementAudio.mode,
            powerUpType: game.powerUp ? game.powerUp.type : null,
            powerUp: game.powerUp ? { ...game.powerUp } : null
          });
          try {
            stopMovementAudio();
            stopStageStartAudio();
            stopBonusLifeAudio();
            stopPowerUpPickupAudio();
            stopPowerUpAppearAudio();
            stopPauseAudio();
            const player = createPlayer(1);
            player.spawnFlash = 0;
            player.respawn = 0;
            game.screen = "playing";
            game.demoMode = false;
            game.paused = false;
            game.pauseElapsed = 0;
            game.tick = 25;
            game.clearPendingTimer = 0;
            game.players = [player];
            game.enemies = [];
            game.enemySpawned = 0;
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.powerUp = null;
            game.lastPowerUpSpawn = null;
            keys.clear();
    
            const carrier = { carrier: true, powerUpType: "star" };
            releaseCarrierPowerUp(carrier);
            const spawned = !carrier.carrier && Boolean(game.powerUp) && game.powerUp.type === "star";
            const start = state();
            for (let frame = 0; frame < 15; frame += 1) updatePowerUpAppearAudio();
            const beforePause = state();
            game.paused = true;
            syncPowerUpAppearAudioNodes();
            syncMovementAudio();
            for (let frame = 0; frame < 10; frame += 1) updatePowerUpAppearAudio();
            const paused = state();
            game.paused = false;
            syncPowerUpAppearAudioNodes();
            syncMovementAudio();
            for (let frame = 0; frame < 16; frame += 1) updatePowerUpAppearAudio();
            const beforeEnd = state();
            updatePowerUpAppearAudio();
            const end = state();
    
            spawnPowerUp("helmet");
            stageStartAudio.active = true;
            const stageStartPriority = state();
            stageStartAudio.active = false;
            bonusLifeAudio.active = true;
            bonusLifeAudio.frame = 0;
            const bonusLifePriority = state();
            bonusLifeAudio.active = false;
            startPowerUpPickupAudio();
            const pickupPriority = state();
            for (let frame = 0; frame < 32; frame += 1) {
              updatePowerUpPickupAudio();
              updatePowerUpAppearAudio();
            }
            const suppressedEnd = {
              ...state(),
              pickupActive: powerUpPickupAudio.active,
              pickupFrame: powerUpPickupAudio.frame
            };
    
            stopPowerUpPickupAudio();
            stopPowerUpAppearAudio();
            game.powerUp = null;
            game.base.alive = false;
            for (let r = 0; r < GRID; r += 1) {
              for (let c = 0; c < GRID; c += 1) setTile(game.grid, c, r, STEEL, 15);
            }
            const noSpotSpawned = spawnPowerUp("timer");
            const noSpot = state();
    
            return {
              spawned,
              start,
              beforePause,
              paused,
              beforeEnd,
              end,
              stageStartPriority,
              bonusLifePriority,
              pickupPriority,
              suppressedEnd,
              noSpotSpawned,
              noSpot
            };
          } finally {
            stopMovementAudio();
            stopStageStartAudio();
            stopBonusLifeAudio();
            stopPowerUpPickupAudio();
            stopPowerUpAppearAudio();
            stopPauseAudio();
            Object.assign(game, previous);
            keys.clear();
            for (const code of previousKeys) keys.add(code);
            stageStartAudio.active = previousStageStart.active;
            stageStartAudio.frame = previousStageStart.frame;
            bonusLifeAudio.active = previousBonusLife.active;
            bonusLifeAudio.frame = previousBonusLife.frame;
            powerUpPickupAudio.active = previousPowerUpPickup.active;
            powerUpPickupAudio.frame = previousPowerUpPickup.frame;
            powerUpAppearAudio.active = previousPowerUpAppear.active;
            powerUpAppearAudio.frame = previousPowerUpAppear.frame;
            pauseAudio.active = previousPause.active;
            pauseAudio.frame = previousPause.frame;
            syncStageStartAudioNodes();
            syncBonusLifeAudioNodes();
            syncPowerUpPickupAudioNodes();
            syncPowerUpAppearAudioNodes();
            syncEnemyHitAudioNodes();
            syncPauseAudioNodes();
            syncMovementAudio();
          }
        },
        debugPauseAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.pause;
          const frames = [0, 3, 4, 7, 8, 23, 24, 35, 36];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map(fixedFrameVoiceDuration),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => pauseAudioPresentation(frame))
          };
        },
        debugPauseAudioLifecycleProbe() {
          const previous = { ...game };
          const previousKeys = Array.from(keys);
          const previousStageStart = { active: stageStartAudio.active, frame: stageStartAudio.frame };
          const previousBonusLife = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
          const previousPowerUpPickup = { active: powerUpPickupAudio.active, frame: powerUpPickupAudio.frame };
          const previousPowerUpAppear = { active: powerUpAppearAudio.active, frame: powerUpAppearAudio.frame };
          const previousPause = { active: pauseAudio.active, frame: pauseAudio.frame };
          const state = () => ({
            paused: game.paused,
            pauseElapsed: game.pauseElapsed,
            tick: game.tick,
            active: pauseAudio.active,
            frame: pauseAudio.frame,
            stageStartFrame: stageStartAudio.frame,
            bonusLifeFrame: bonusLifeAudio.frame,
            powerUpPickupFrame: powerUpPickupAudio.frame,
            powerUpAppearFrame: powerUpAppearAudio.frame,
            stageStartAudibility: stageStartAudioAudibility(),
            bonusLifeAudibility: bonusLifeAudioAudibility(),
            powerUpPickupAudible: powerUpPickupAudioAudible(),
            powerUpAppearAudible: powerUpAppearAudioAudible(),
            movementAudioMode: movementAudio.mode
          });
          try {
            stopMovementAudio();
            stopStageStartAudio();
            stopBonusLifeAudio();
            stopPowerUpPickupAudio();
            stopPowerUpAppearAudio();
            stopPauseAudio();
            const player = createPlayer(1);
            player.spawnFlash = 0;
            player.respawn = 0;
            game.screen = "playing";
            game.demoMode = false;
            game.paused = false;
            game.pauseElapsed = 0;
            game.tick = 25;
            game.clearPendingTimer = 0;
            game.players = [player];
            game.enemies = [];
            game.enemySpawned = 0;
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            keys.clear();
    
            startStageStartAudio();
            startBonusLifeAudio();
            startPowerUpPickupAudio();
            startPowerUpAppearAudio();
            const entered = togglePause();
            const entry = state();
            for (let frame = 0; frame < 10; frame += 1) update();
            const paused = state();
            const exitedEarly = togglePause();
            const earlyResume = state();
            const reentered = togglePause();
            const restart = state();
    
            stopStageStartAudio();
            stopBonusLifeAudio();
            stopPowerUpPickupAudio();
            stopPowerUpAppearAudio();
            for (let frame = 0; frame < 35; frame += 1) update();
            const finalPausedFrame = state();
            const exitedBeforeEnd = togglePause();
            const finalActiveFrame = state();
            update();
            const ended = state();
    
            return {
              entered,
              exitedEarly,
              reentered,
              exitedBeforeEnd,
              entry,
              paused,
              earlyResume,
              restart,
              finalPausedFrame,
              finalActiveFrame,
              ended
            };
          } finally {
            stopMovementAudio();
            stopStageStartAudio();
            stopBonusLifeAudio();
            stopPowerUpPickupAudio();
            stopPowerUpAppearAudio();
            stopPauseAudio();
            Object.assign(game, previous);
            keys.clear();
            for (const code of previousKeys) keys.add(code);
            stageStartAudio.active = previousStageStart.active;
            stageStartAudio.frame = previousStageStart.frame;
            bonusLifeAudio.active = previousBonusLife.active;
            bonusLifeAudio.frame = previousBonusLife.frame;
            powerUpPickupAudio.active = previousPowerUpPickup.active;
            powerUpPickupAudio.frame = previousPowerUpPickup.frame;
            powerUpAppearAudio.active = previousPowerUpAppear.active;
            powerUpAppearAudio.frame = previousPowerUpAppear.frame;
            pauseAudio.active = previousPause.active;
            pauseAudio.frame = previousPause.frame;
            syncStageStartAudioNodes();
            syncBonusLifeAudioNodes();
            syncPowerUpPickupAudioNodes();
            syncPowerUpAppearAudioNodes();
            syncEnemyHitAudioNodes();
            syncPauseAudioNodes();
            syncMovementAudio();
          }
        },
        debugPowerUpPickupAudioLifecycleProbe() {
          const previous = { ...game };
          const previousKeys = Array.from(keys);
          const previousStageStart = { active: stageStartAudio.active, frame: stageStartAudio.frame };
          const previousBonusLife = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
          const previousPowerUpPickup = { active: powerUpPickupAudio.active, frame: powerUpPickupAudio.frame };
          const previousPowerUpAppear = { active: powerUpAppearAudio.active, frame: powerUpAppearAudio.frame };
          const state = () => ({
            active: powerUpPickupAudio.active,
            frame: powerUpPickupAudio.frame,
            paused: game.paused,
            audible: powerUpPickupAudioAudible(),
            movementAudioMode: movementAudio.mode
          });
          try {
            stopMovementAudio();
            stopStageStartAudio();
            stopBonusLifeAudio();
            stopPowerUpPickupAudio();
            stopPowerUpAppearAudio();
            const player = createPlayer(1);
            player.spawnFlash = 0;
            player.respawn = 0;
            game.screen = "playing";
            game.demoMode = false;
            game.paused = false;
            game.clearPendingTimer = 0;
            game.players = [player];
            game.enemies = [];
            keys.clear();
    
            startPowerUpPickupAudio();
            const start = state();
            for (let frame = 0; frame < 38; frame += 1) updatePowerUpPickupAudio();
            const beforePause = state();
            game.paused = true;
            syncPowerUpPickupAudioNodes();
            syncMovementAudio();
            for (let frame = 0; frame < 10; frame += 1) updatePowerUpPickupAudio();
            const paused = state();
            game.paused = false;
            syncPowerUpPickupAudioNodes();
            syncMovementAudio();
            updatePowerUpPickupAudio();
            const end = state();
    
            startPowerUpPickupAudio();
            startBonusLifeAudio();
            const suppressedStart = state();
            for (let frame = 0; frame < 39; frame += 1) {
              updateBonusLifeAudio();
              updatePowerUpPickupAudio();
            }
            const suppressedEnd = {
              ...state(),
              bonusLifeActive: bonusLifeAudio.active,
              bonusLifeFrame: bonusLifeAudio.frame
            };
            return { start, beforePause, paused, end, suppressedStart, suppressedEnd };
          } finally {
            stopMovementAudio();
            stopStageStartAudio();
            stopBonusLifeAudio();
            stopPowerUpPickupAudio();
            stopPowerUpAppearAudio();
            Object.assign(game, previous);
            keys.clear();
            for (const code of previousKeys) keys.add(code);
            stageStartAudio.active = previousStageStart.active;
            stageStartAudio.frame = previousStageStart.frame;
            bonusLifeAudio.active = previousBonusLife.active;
            bonusLifeAudio.frame = previousBonusLife.frame;
            powerUpPickupAudio.active = previousPowerUpPickup.active;
            powerUpPickupAudio.frame = previousPowerUpPickup.frame;
            powerUpAppearAudio.active = previousPowerUpAppear.active;
            powerUpAppearAudio.frame = previousPowerUpAppear.frame;
            syncStageStartAudioNodes();
            syncBonusLifeAudioNodes();
            syncPowerUpPickupAudioNodes();
            syncPowerUpAppearAudioNodes();
            syncEnemyHitAudioNodes();
            syncMovementAudio();
          }
        },
        debugBonusLifeAudioLifecycleProbe() {
          const previous = { ...game };
          const previousKeys = Array.from(keys);
          const previousStageStart = { active: stageStartAudio.active, frame: stageStartAudio.frame };
          const previousBonusLife = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
          const previousPowerUpAppear = { active: powerUpAppearAudio.active, frame: powerUpAppearAudio.frame };
          const state = () => ({
            active: bonusLifeAudio.active,
            frame: bonusLifeAudio.frame,
            paused: game.paused,
            pulse2Active: bonusLifePulse2Active(),
            movementAudioMode: movementAudio.mode
          });
          try {
            stopMovementAudio();
            stopStageStartAudio();
            stopBonusLifeAudio();
            stopPowerUpAppearAudio();
            const player = createPlayer(1);
            player.spawnFlash = 0;
            player.respawn = 0;
            game.screen = "playing";
            game.demoMode = false;
            game.paused = false;
            game.clearPendingTimer = 0;
            game.players = [player];
            game.enemies = [];
            keys.clear();
    
            startBonusLifeAudio();
            const start = state();
            for (let frame = 0; frame < 53; frame += 1) updateBonusLifeAudio();
            const beforePulse2End = state();
            updateBonusLifeAudio();
            const pulse2End = state();
    
            game.paused = true;
            syncBonusLifeAudioNodes();
            syncMovementAudio();
            for (let frame = 0; frame < 10; frame += 1) updateBonusLifeAudio();
            const paused = state();
    
            game.paused = false;
            syncBonusLifeAudioNodes();
            syncMovementAudio();
            for (let frame = 0; frame < 5; frame += 1) updateBonusLifeAudio();
            const beforeEnd = state();
            updateBonusLifeAudio();
            const end = state();
            return { start, beforePulse2End, pulse2End, paused, beforeEnd, end };
          } finally {
            stopMovementAudio();
            stopStageStartAudio();
            stopBonusLifeAudio();
            stopPowerUpAppearAudio();
            Object.assign(game, previous);
            keys.clear();
            for (const code of previousKeys) keys.add(code);
            stageStartAudio.active = previousStageStart.active;
            stageStartAudio.frame = previousStageStart.frame;
            bonusLifeAudio.active = previousBonusLife.active;
            bonusLifeAudio.frame = previousBonusLife.frame;
            powerUpAppearAudio.active = previousPowerUpAppear.active;
            powerUpAppearAudio.frame = previousPowerUpAppear.frame;
            syncStageStartAudioNodes();
            syncBonusLifeAudioNodes();
            syncPowerUpAppearAudioNodes();
            syncEnemyHitAudioNodes();
            syncMovementAudio();
          }
        },
        spriteManifest() {
          return cloneSpriteManifest();
        },
        currentPackInfo() {
          return createCurrentPackInfo(game, state.stageRuntime);
        },
        debugPauseBehaviorProbe() {
          const previous = { ...game };
          const previousFirePresses = Array.from(pendingFirePresses);
          const previousPause = { active: pauseAudio.active, frame: pauseAudio.frame };
          try {
            stopPauseAudio();
            game.screen = "playing";
            game.demoMode = false;
            game.paused = false;
            game.pauseElapsed = 99;
            game.tick = 15;
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [{ alive: true, lives: 1, respawn: 0 }];
            game.enemies = [];
            game.enemySpawned = 0;
            game.clearPendingTimer = 0;
            game.scorePopups = [];
            pendingFirePresses.clear();
            pendingFirePresses.add("Space");
    
            const entered = togglePause();
            const entry = {
              paused: game.paused,
              pauseElapsed: game.pauseElapsed,
              pendingFirePresses: pendingFirePresses.size,
              pauseAudioActive: pauseAudio.active,
              pauseAudioFrame: pauseAudio.frame
            };
            update();
            const pausedUpdate = {
              tick: game.tick,
              pauseElapsed: game.pauseElapsed,
              pauseAudioFrame: pauseAudio.frame
            };
            const exited = togglePause();
            const exit = {
              paused: game.paused,
              pauseAudioActive: pauseAudio.active,
              pauseAudioFrame: pauseAudio.frame
            };
    
            game.screen = "stageIntro";
            game.paused = false;
            game.demoMode = false;
            const stageIntroAccepted = togglePause();
            game.screen = "playing";
            game.demoMode = true;
            const demoAccepted = togglePause();
    
            return {
              entered,
              exited,
              entry,
              exit,
              pausedUpdate,
              stageIntroAccepted,
              demoAccepted,
              inputs: ["Enter", "KeyP", "Escape"].map((code) => ({ code, accepted: isPauseInputCode(code) })),
              frames: [15, 16, 31, 32].map(pausePresentation)
            };
          } finally {
            stopPauseAudio();
            pendingFirePresses.clear();
            for (const code of previousFirePresses) pendingFirePresses.add(code);
            Object.assign(game, previous);
            pauseAudio.active = previousPause.active;
            pauseAudio.frame = previousPause.frame;
            syncPauseAudioNodes();
            syncMovementAudio();
          }
        },
        debugPausedStageEndProbe() {
          const previous = { ...game };
          const total = enemyTotal();
          const player = { alive: true, lives: 1, respawn: 0 };
          try {
            game.screen = "playing";
            game.demoMode = false;
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [player];
            game.enemies = [];
            game.enemySpawned = Math.max(0, total - 1);
            game.clearPendingTimer = 0;
            game.paused = true;
            game.pauseElapsed = 0;
            game.tick = 41;
            game.scorePopups = [];
            update();
            const incomplete = {
              screen: game.screen,
              paused: game.paused,
              pauseElapsed: game.pauseElapsed,
              tick: game.tick
            };
    
            game.screen = "playing";
            game.enemies = [{ alive: false }];
            game.enemySpawned = total;
            game.clearPendingTimer = 0;
            game.paused = true;
            game.pauseElapsed = 0;
            game.tick = 41;
            game.scorePopups = [];
            update();
            const detected = {
              screen: game.screen,
              paused: game.paused,
              pauseElapsed: game.pauseElapsed,
              tick: game.tick,
              enemyCount: game.enemies.length,
              clearPendingTimer: game.clearPendingTimer
            };
            const pauseAcceptedDuringDelay = togglePause();
            return {
              delay: gameSettings().timings.stageClearDelay,
              incomplete,
              detected,
              pauseAcceptedDuringDelay
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugRenderPauseFrame(frame) {
          const previous = {
            paused: game.paused,
            pauseElapsed: game.pauseElapsed,
            tick: game.tick,
            frameLow: game.frameLow,
            frameHigh: game.frameHigh
          };
          try {
            game.paused = true;
            game.pauseElapsed = 0;
            game.tick = Math.max(0, Math.floor(Number(frame) || 0));
            game.frameLow = game.tick & 0xff;
            renderPause();
            return pausePresentation(game.frameLow);
          } finally {
            Object.assign(game, previous);
          }
        },
        debugTitleScoreLayoutProbe(menuIndex) {
          return titleScoreLayout(menuIndex).map((item) => ({ ...item }));
        },
        debugFrameCounterProbe() {
          const previous = { ...game };
          const snapshot = () => ({ frameLow: game.frameLow, frameHigh: game.frameHigh });
          const advance = (frames) => {
            for (let frame = 0; frame < frames; frame += 1) advanceFrameCounters();
            return snapshot();
          };
          try {
            resetFrameCounters();
            const initial = snapshot();
            const frame63 = advance(63);
            const frame64 = advance(1);
            const frame128 = advance(64);
            const frame192 = advance(64);
            const frame256 = advance(64);
    
            game.frameLow = 0xab;
            game.frameHigh = 0x05;
            resetFrameCounterHigh();
            const highReset = snapshot();
            const nextQuarterBoundary = advance(0x15);
    
            game.frameLow = 0xab;
            game.frameHigh = 0x05;
            resetFrameCounterLow();
            const lowReset = snapshot();
    
            game.frameLow = 0;
            game.frameHigh = EXTENDED_STAGE_END_FRAME_HIGH;
            const extendedStageEndStart = snapshot();
            const extendedStageEndFinish = advance(PLAYER_GAME_OVER_STAGE_END_DELAY);
    
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
            const paused = {
              ...snapshot(),
              tick: game.tick,
              pauseElapsed: game.pauseElapsed
            };
    
            game.screen = "stageIntro";
            game.transitionTimer = 1;
            game.paused = false;
            game.frameLow = 0x3f;
            game.frameHigh = 0x09;
            update();
            const stageActivation = {
              ...snapshot(),
              screen: game.screen
            };
    
            return {
              initial,
              frame63,
              frame64,
              frame128,
              frame192,
              frame256,
              highReset,
              nextQuarterBoundary,
              lowReset,
              extendedStageEndStart,
              extendedStageEndFinish,
              paused,
              stageActivation
            };
          } finally {
            Object.assign(game, previous);
            syncMovementAudio();
          }
        },
        debugStageSelectInputCadenceProbe() {
          const previous = { ...game };
          const previousKeys = Array.from(keys);
          const previousPresses = Array.from(pendingStageSelectPresses);
          const snapshot = () => ({ stage: game.stage, frameLow: game.frameLow, frameHigh: game.frameHigh });
          const step = () => {
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
            const initialPress = snapshot();
            for (let frame = 0; frame < 7; frame += 1) step();
            const beforeHeldRepeat = snapshot();
            step();
            const heldRepeat = snapshot();
    
            keys.clear();
            game.stage = stageSelectLimit();
            game.frameLow = 3;
            game.frameHigh = 0x22;
            pendingStageSelectPresses.add("Space");
            step();
            const upperBoundary = snapshot();
    
            game.stage = 1;
            game.frameLow = 3;
            game.frameHigh = 0x22;
            pendingStageSelectPresses.add("KeyF");
            step();
            const lowerBoundary = snapshot();
    
            game.stage = 20;
            game.frameLow = 6;
            game.frameHigh = 0x22;
            keys.add("Space");
            step();
            const heldBeforeBoundary = snapshot();
            step();
            const heldAtBoundary = snapshot();
    
            keys.clear();
            game.stage = 20;
            game.frameLow = 4;
            game.frameHigh = 0x22;
            pendingStageSelectPresses.add("Space");
            pendingStageSelectPresses.add("KeyF");
            step();
            const simultaneousPress = snapshot();
    
            keys.clear();
            keys.add("Space");
            game.stage = 20;
            game.frameLow = 7;
            game.frameHigh = 0x22;
            pendingStageSelectPresses.add("KeyF");
            step();
            const heldAPriority = snapshot();
    
            game.stage = 20;
            game.frameLow = 6;
            game.frameHigh = 0x22;
            pendingStageSelectPresses.add("KeyF");
            step();
            const freshBOutsideARepeat = snapshot();
    
            return {
              initialPress,
              beforeHeldRepeat,
              heldRepeat,
              upperBoundary,
              lowerBoundary,
              heldBeforeBoundary,
              heldAtBoundary,
              simultaneousPress,
              heldAPriority,
              freshBOutsideARepeat
            };
          } finally {
            Object.assign(game, previous);
            keys.clear();
            for (const code of previousKeys) keys.add(code);
            pendingStageSelectPresses.clear();
            for (const code of previousPresses) pendingStageSelectPresses.add(code);
          }
        },
        debugTitleDemoLifecycleProbe() {
          const previous = { ...game };
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
            const selectionReset = {
              idleFrames: game.titleIdleFrames,
              frameLow: game.frameLow,
              frameHigh: game.frameHigh
            };
            resetFrameCounters();
            game.titleIdleFrames = 0;
    
            for (let frame = 0; frame < TITLE_DEMO_IDLE_FRAMES - 1; frame += 1) update();
            const beforeTimeout = {
              screen: game.screen,
              idleFrames: game.titleIdleFrames,
              frameLow: game.frameLow,
              frameHigh: game.frameHigh,
              demoMode: game.demoMode
            };
            update();
            const afterTimeout = {
              screen: game.screen,
              stage: game.stage,
              playerCount: game.playerCount,
              playerIds: game.players.map((player) => player.id),
              maxActiveEnemies: maxActiveEnemies(),
              transitionTimer: game.transitionTimer,
              frameLow: game.frameLow,
              frameHigh: game.frameHigh,
              demoMode: game.demoMode
            };
    
            const player1 = game.players[0];
            const player2 = game.players[1];
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
            const enemyTargets = [demoControlForPlayer(player1), demoControlForPlayer(player2)];
            game.frameHigh = 2;
            const axisPhaseTwoTargets = [demoControlForPlayer(player1), demoControlForPlayer(player2)];
            game.powerUp = { type: "star", x: 64, y: 64, w: POWERUP_SIZE, h: POWERUP_SIZE, ttl: 0 };
            const powerUpTarget = demoControlForPlayer(player1);
    
            player1.score = 0;
            player1.stagePoints = 0;
            player1.level = 0;
            player1.stageKills = Array(enemyTypeDefinitions().length).fill(0);
            game.scorePopups = [];
            applyPowerUp(player1, "star");
            const scoredEnemy = {
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
            const scoreIsolation = {
              score: player1.score,
              stagePoints: player1.stagePoints,
              stageKills: player1.stageKills.slice(),
              level: player1.level,
              scorePopupCount: game.scorePopups.length
            };
    
            endTitleDemo();
            const afterExit = {
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
            const afterConstruction = {
              screen: game.screen,
              idleFrames: game.titleIdleFrames,
              frameLow: game.frameLow,
              frameHigh: game.frameHigh,
              demoMode: game.demoMode
            };
            return {
              timeoutFrames: TITLE_DEMO_IDLE_FRAMES,
              displayStage: DEMO_DISPLAY_STAGE,
              selectionReset,
              beforeTimeout,
              afterTimeout,
              enemyTargets,
              axisPhaseTwoTargets,
              powerUpTarget,
              scoreIsolation,
              afterExit,
              afterConstruction
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugHiddenMessageLifecycleProbe() {
          const previous = { ...game };
          const previousKeys = new Set(keys);
          try {
            game.screen = "editor";
            game.titleMenu = 2;
            game.constructionVisits = HIDDEN_MESSAGE_REQUIRED_VISITS - 1;
            game.constructionUsed = true;
            game.hiddenInputCount = 0;
            if (!game.editorGrid) game.editorGrid = makeOriginalConstructionGrid();
            exitEditorToTitle();
            const afterSeventhExit = {
              screen: game.screen,
              visits: game.constructionVisits,
              constructionUsed: game.constructionUsed,
              inputCount: game.hiddenInputCount
            };
    
            keys.clear();
            keys.add("ArrowDown");
            for (let press = 0; press < HIDDEN_MESSAGE_A_PRESSES; press += 1) recordHiddenTitleInput("KeyF");
            const afterA = game.hiddenInputCount;
            keys.delete("ArrowDown");
            keys.add("ArrowRight");
            for (let press = 0; press < HIDDEN_MESSAGE_B_PRESSES; press += 1) recordHiddenTitleInput("KeyG");
            const afterB = game.hiddenInputCount;
            const triggerReady = hiddenMessageTriggerReady();
    
            startHiddenMessage();
            const presentations = [127, 128, 320, 383, 384, 640, 641, 668, 669, 886]
              .map((frame) => hiddenMessagePresentation(frame));
            game.hiddenMessageElapsed = HIDDEN_MESSAGE_END_FRAME - 1;
            update();
            const afterCutscene = {
              screen: game.screen,
              visits: game.constructionVisits,
              elapsed: game.hiddenMessageElapsed,
              inputCount: game.hiddenInputCount
            };
            game.constructionVisits = 0xff;
            exitEditorToTitle();
            const wrappedVisits = game.constructionVisits;
            game.titleMenu = 0;
            game.constructionVisits = HIDDEN_MESSAGE_REQUIRED_VISITS;
            game.hiddenInputCount = 0x74;
            startHiddenMessage();
            game.hiddenMessageElapsed = HIDDEN_MESSAGE_END_FRAME - 1;
            update();
            const alternateSelection = {
              screen: game.screen,
              players: game.stageSelectPlayers
            };
            return {
              requiredVisits: HIDDEN_MESSAGE_REQUIRED_VISITS,
              requiredAPresses: HIDDEN_MESSAGE_A_PRESSES,
              requiredBPresses: HIDDEN_MESSAGE_B_PRESSES,
              expectedInputCount: 0x74,
              endFrame: HIDDEN_MESSAGE_END_FRAME,
              afterSeventhExit,
              afterA,
              afterB,
              triggerReady,
              presentations,
              afterCutscene,
              wrappedVisits,
              alternateSelection
            };
          } finally {
            keys.clear();
            for (const key of previousKeys) keys.add(key);
            Object.assign(game, previous);
          }
        },
        debugHighScoreScreenProbe() {
          const previous = { ...game };
          const previousGameOverAudio = {
            active: gameOverAudio.active,
            frame: gameOverAudio.frame
          };
          const previousHighScoreAudio = {
            active: highScoreAudio.active,
            frame: highScoreAudio.frame
          };
          try {
            const player = (score) => ({ id: 1, score, alive: false, respawn: 0, lives: 0 });
            game.runHighScoreBaseline = 20000;
            game.highScore = 20000;
            game.players = [player(20000)];
            game.screen = "playing";
            enterGameOver();
            const tie = {
              triggered: game.newHighScoreAtGameOver,
              screen: game.screen
            };
    
            game.players = [player(20100)];
            game.highScore = 20100;
            game.screen = "playing";
            enterGameOver();
            const strictBeat = {
              triggered: game.newHighScoreAtGameOver,
              screen: game.screen
            };
            finishGameOverScreen();
            finishStageResult();
            finishFullGameOverScreen();
            const started = {
              screen: game.screen,
              elapsed: game.highScoreScreenElapsed,
              audioActive: highScoreAudio.active,
              audioFrame: highScoreAudio.frame
            };
            const paletteFrames = [0, 1, 2, 3, 4].map((frame) => highScorePresentation(frame, 20100));
            const sevenDigit = highScorePresentation(0, 1234567);
            game.highScoreScreenElapsed = HIGH_SCORE_SCREEN_FRAMES - 2;
            highScoreAudio.frame = HIGH_SCORE_SCREEN_FRAMES - 2;
            syncHighScoreAudioNodes();
            update();
            const beforeEnd = {
              screen: game.screen,
              elapsed: game.highScoreScreenElapsed,
              audioActive: highScoreAudio.active,
              audioFrame: highScoreAudio.frame
            };
            update();
            const afterEnd = {
              screen: game.screen,
              elapsed: game.highScoreScreenElapsed,
              triggered: game.newHighScoreAtGameOver,
              audioActive: highScoreAudio.active
            };
    
            game.players = [player(19900)];
            game.runHighScoreBaseline = 20000;
            game.screen = "playing";
            enterGameOver();
            finishGameOverScreen();
            finishStageResult();
            finishFullGameOverScreen();
            const belowRecord = {
              screen: game.screen,
              triggered: game.newHighScoreAtGameOver
            };
            return {
              duration: HIGH_SCORE_SCREEN_FRAMES,
              tie,
              strictBeat,
              started,
              paletteFrames,
              sevenDigit,
              beforeEnd,
              afterEnd,
              belowRecord
            };
          } finally {
            stopGameOverAudio();
            stopHighScoreAudio();
            Object.assign(game, previous);
            gameOverAudio.active = previousGameOverAudio.active;
            gameOverAudio.frame = previousGameOverAudio.frame;
            highScoreAudio.active = previousHighScoreAudio.active;
            highScoreAudio.frame = previousHighScoreAudio.frame;
            syncGameOverAudioNodes();
            syncHighScoreAudioNodes();
          }
        },
        debugHighScoreAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.highScore;
          const frames = [
            0, 4, 5, 9, 10, 129, 130, 159, 160, 174, 175, 179, 180, 209, 210, 239, 240,
            244, 245, 254, 255, 259, 260, 289, 290, 319, 320, 324, 325, 379, 380, 399,
            400, 459, 460
          ];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map(fixedFrameVoiceDuration),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => highScoreAudioPresentation(frame))
          };
        },
        debugFullGameOverScreenProbe() {
          const previous = { ...game };
          const previousAudio = {
            active: gameOverAudio.active,
            frame: gameOverAudio.frame
          };
          const previousHighScoreAudio = {
            active: highScoreAudio.active,
            frame: highScoreAudio.frame
          };
          try {
            game.newHighScoreAtGameOver = false;
            startFullGameOverScreen();
            const entry = {
              screen: game.screen,
              elapsed: game.fullGameOverElapsed,
              paused: game.paused,
              audioActive: gameOverAudio.active,
              audioFrame: gameOverAudio.frame
            };
            const presentation = fullGameOverPresentation(game.fullGameOverElapsed);
            game.fullGameOverElapsed = FULL_GAME_OVER_SCREEN_FRAMES - 2;
            gameOverAudio.frame = FULL_GAME_OVER_SCREEN_FRAMES - 2;
            syncGameOverAudioNodes();
            update();
            const beforeEnd = {
              screen: game.screen,
              elapsed: game.fullGameOverElapsed,
              audioActive: gameOverAudio.active,
              audioFrame: gameOverAudio.frame
            };
            update();
            const afterEnd = {
              screen: game.screen,
              elapsed: game.fullGameOverElapsed,
              audioActive: gameOverAudio.active,
              audioFrame: gameOverAudio.frame
            };
    
            game.newHighScoreAtGameOver = false;
            startFullGameOverScreen();
            const ignoredInput = {
              handled: handleFullGameOverInput("KeyA"),
              screen: game.screen
            };
            const startSkip = {
              handled: handleFullGameOverInput("Enter"),
              screen: game.screen,
              audioActive: gameOverAudio.active
            };
    
            game.newHighScoreAtGameOver = false;
            startFullGameOverScreen();
            const selectSkip = {
              handled: handleFullGameOverInput("Escape"),
              screen: game.screen,
              audioActive: gameOverAudio.active
            };
    
            game.newHighScoreAtGameOver = true;
            startFullGameOverScreen();
            finishFullGameOverScreen();
            const highScoreRoute = {
              screen: game.screen,
              elapsed: game.highScoreScreenElapsed,
              audioActive: gameOverAudio.active
            };
            return {
              duration: FULL_GAME_OVER_SCREEN_FRAMES,
              entry,
              presentation,
              beforeEnd,
              afterEnd,
              ignoredInput,
              startSkip,
              selectSkip,
              highScoreRoute
            };
          } finally {
            stopGameOverAudio();
            stopHighScoreAudio();
            Object.assign(game, previous);
            gameOverAudio.active = previousAudio.active;
            gameOverAudio.frame = previousAudio.frame;
            highScoreAudio.active = previousHighScoreAudio.active;
            highScoreAudio.frame = previousHighScoreAudio.frame;
            syncGameOverAudioNodes();
            syncHighScoreAudioNodes();
          }
        },
        debugGameOverAudioProbe() {
          const event = FREE_AUDIO_MANIFEST.events.gameOver;
          const frames = [0, 5, 6, 11, 12, 35, 36, 43, 44, 51, 52, 59, 60, 67, 68, 75, 76, 83, 84, 107, 108];
          return {
            durationFrames: event.durationFrames,
            voiceDurations: event.voices.map(fixedFrameVoiceDuration),
            waves: event.voices.map((voice) => voice.wave),
            frames: frames.map((frame) => gameOverAudioPresentation(frame))
          };
        },
        debugRenderFullGameOverFrame(frame) {
          const previous = {
            screen: game.screen,
            fullGameOverElapsed: game.fullGameOverElapsed
          };
          try {
            game.screen = "fullGameOver";
            game.fullGameOverElapsed = Math.max(0, Math.floor(Number(frame) || 0));
            render();
            return fullGameOverPresentation(game.fullGameOverElapsed);
          } finally {
            Object.assign(game, previous);
          }
        },
        debugRenderHighScoreFrame(frame, score) {
          const previous = {
            screen: game.screen,
            highScore: game.highScore,
            highScoreScreenElapsed: game.highScoreScreenElapsed
          };
          try {
            game.screen = "highScore";
            game.highScore = Math.max(0, Math.floor(Number(score) || 0));
            game.highScoreScreenElapsed = Math.max(0, Math.floor(Number(frame) || 0));
            render();
            return highScorePresentation(game.highScoreScreenElapsed, game.highScore);
          } finally {
            Object.assign(game, previous);
          }
        },
        debugSnapshot() {
          return {
            screen: game.screen,
            paused: game.paused,
            pauseElapsed: game.pauseElapsed,
            titleMenu: game.titleMenu,
            titleMenuAction: (TITLE_MENU_ITEMS[game.titleMenu] || TITLE_MENU_ITEMS[0]).action,
            titleIdleFrames: game.titleIdleFrames,
            titleDemoIdleFrames: TITLE_DEMO_IDLE_FRAMES,
            battleTick: game.tick,
            frameLow: game.frameLow,
            frameHigh: game.frameHigh,
            randomValue: game.randomValue,
            randomIndex: game.randomIndex,
            demoMode: game.demoMode,
            constructionUsed: game.constructionUsed,
            constructionVisits: game.constructionVisits,
            hiddenInputCount: game.hiddenInputCount,
            hiddenMessageElapsed: game.hiddenMessageElapsed,
            stage: game.stage,
            stageSelectPlayers: game.stageSelectPlayers,
            stageSelectLimit: stageSelectLimit(),
            stageCycleLimit: stageCycleLimit(),
            mapDataStage: mapDataStage(game.stage),
            enemyDataStage: enemyDataStage(game.stage),
            highScore: game.highScore,
            runHighScoreBaseline: game.runHighScoreBaseline,
            newHighScoreAtGameOver: game.newHighScoreAtGameOver,
            fullGameOverElapsed: game.fullGameOverElapsed,
            highScoreScreenElapsed: game.highScoreScreenElapsed,
            enemySpawned: game.enemySpawned,
            enemyKilled: game.enemyKilled,
            panelEnemyCounter: panelEnemyCounterRemaining(),
            nextSpawn: game.nextSpawn,
            clearPendingTimer: game.clearPendingTimer,
            baseDestroyTimer: game.baseDestroyTimer,
            stageResultReason: game.stageResultReason,
            stageClearElapsed: game.stageClearElapsed,
            stageClearBonusPlayerIds: game.stageClearBonusPlayerIds.slice(),
            stageClearBonusAwarded: game.stageClearBonusAwarded,
            gameOverTimer: game.gameOverTimer,
            playerGameOverMessage: game.playerGameOverMessage
              ? { ...game.playerGameOverMessage, active: playerGameOverMessageActive() }
              : null,
            freezeTimer: game.freezeTimer,
            shovelTimer: game.shovelTimer,
            movementAudioMode: movementAudio.mode,
            stageStartAudio: {
              active: stageStartAudio.active,
              frame: stageStartAudio.frame,
              durationFrames: FREE_AUDIO_MANIFEST.events.stageStart.durationFrames
            },
            bonusLifeAudio: {
              active: bonusLifeAudio.active,
              frame: bonusLifeAudio.frame,
              durationFrames: FREE_AUDIO_MANIFEST.events.bonusLife.durationFrames
            },
            powerUpPickupAudio: {
              active: powerUpPickupAudio.active,
              frame: powerUpPickupAudio.frame,
              durationFrames: FREE_AUDIO_MANIFEST.events.powerUp.durationFrames
            },
            powerUpAppearAudio: {
              active: powerUpAppearAudio.active,
              frame: powerUpAppearAudio.frame,
              durationFrames: FREE_AUDIO_MANIFEST.events.powerUpAppear.durationFrames
            },
            brickHitAudio: {
              active: brickHitAudio.active,
              frame: brickHitAudio.frame,
              durationFrames: FREE_AUDIO_MANIFEST.events.brickHit.durationFrames
            },
            steelHitAudio: {
              active: steelHitAudio.active,
              frame: steelHitAudio.frame,
              durationFrames: FREE_AUDIO_MANIFEST.events.steelHit.durationFrames
            },
            enemyHitAudio: {
              active: enemyHitAudio.active,
              frame: enemyHitAudio.frame,
              durationFrames: FREE_AUDIO_MANIFEST.events.enemyHit.durationFrames
            },
            baseHitAudio: {
              active: baseHitAudio.active,
              frame: baseHitAudio.frame,
              durationFrames: FREE_AUDIO_MANIFEST.events.baseHit.durationFrames
            },
            enemyDestroyAudio: {
              active: enemyDestroyAudio.active,
              frame: enemyDestroyAudio.frame,
              durationFrames: FREE_AUDIO_MANIFEST.events.enemyDestroy.durationFrames
            },
            playerDestroyAudio: {
              active: playerDestroyAudio.active,
              frame: playerDestroyAudio.frame,
              durationFrames: FREE_AUDIO_MANIFEST.events.playerDestroy.durationFrames
            },
            playerShootAudio: {
              active: playerShootAudio.active,
              frame: playerShootAudio.frame,
              durationFrames: FREE_AUDIO_MANIFEST.events.playerShoot.durationFrames
            },
            movementIceAudio: {
              active: movementIceAudio.active,
              frame: movementIceAudio.frame,
              durationFrames: FREE_AUDIO_MANIFEST.events.movementIce.durationFrames
            },
            pauseAudio: {
              active: pauseAudio.active,
              frame: pauseAudio.frame,
              durationFrames: FREE_AUDIO_MANIFEST.events.pause.durationFrames
            },
            scoreCountAudio: {
              active: scoreCountAudio.active,
              frame: scoreCountAudio.frame,
              durationFrames: FREE_AUDIO_MANIFEST.events.scoreCount.durationFrames
            },
            stageBonusAudio: {
              active: stageBonusAudio.active,
              frame: stageBonusAudio.frame,
              durationFrames: FREE_AUDIO_MANIFEST.events.stageBonus.durationFrames
            },
            gameOverAudio: {
              active: gameOverAudio.active,
              frame: gameOverAudio.frame,
              durationFrames: FREE_AUDIO_MANIFEST.events.gameOver.durationFrames
            },
            highScoreAudio: {
              active: highScoreAudio.active,
              frame: highScoreAudio.frame,
              durationFrames: FREE_AUDIO_MANIFEST.events.highScore.durationFrames
            },
            ...createDebugPackInfo(game, state.stageRuntime),
            scorePopups: game.scorePopups.map((popup) => ({ ...popup })),
            battleQuadrants: gridToQuadrants(game.grid),
            fieldGeometry: {
              x: FIELD_X,
              y: FIELD_Y,
              width: FIELD_W,
              height: FIELD_H,
              panelX: PANEL_X,
              panelWidth: SCREEN_W - PANEL_X
            },
            editorCursor: { ...game.editorCursor },
            editorBrush: tileTypeName(game.editorBrush),
            editorPattern: game.editorPattern,
            editorPatternArmed: game.editorPatternArmed,
            editorQuadrants: game.editorGrid ? gridToQuadrants(game.editorGrid) : null,
            hasConstructedStage: Boolean(game.constructedGrid),
            constructionStageActive: game.constructionStageActive,
            powerUpType: game.powerUp ? game.powerUp.type : null,
            players: game.players.map((player) => ({
              id: player.id,
              score: player.score,
              stagePoints: player.stagePoints,
              stageKills: player.stageKills.slice(),
              totalKills: player.totalKills.slice(),
              nextBonusLifeIndex: player.nextBonusLifeIndex,
              level: player.level,
              lives: player.lives,
              respawn: player.respawn,
              spawnFlash: player.spawnFlash || 0,
              invuln: player.invuln,
              x: player.x,
              y: player.y,
              speed: player.speed,
              slide: player.slide,
              pendingSnap: player.pendingSnap
            }))
          };
        },
        debugSteelRuleProbe() {
          const blockedCell = makeCell(STEEL, 15);
          const blocked = damageWall(blockedCell, 0, 0, { power: 2, dir: UP }, 1 << 2);
          const cell = makeCell(STEEL, 15);
          const first = damageWall(cell, 0, 0, { power: 3, dir: UP }, 1 << 2);
          const afterFirst = { type: cell.type, mask: cell.mask, steelHits: cell.steelHits.slice() };
          const second = damageWall(cell, 0, 0, { power: 3, dir: UP }, 1 << 3);
          return {
            blocked,
            blockedMask: blockedCell.mask,
            first,
            afterFirst,
            second,
            afterSecond: { type: cell.type, mask: cell.mask, steelHits: cell.steelHits.slice() }
          };
        },
        debugBrickWallPowerProbe() {
          const previousBrickHit = { active: brickHitAudio.active, frame: brickHitAudio.frame };
          const normalCell = makeCell(BRICK, 15);
          const powerCell = makeCell(BRICK, 15);
          const powerTwoCell = makeCell(BRICK, 15);
          const normalMasks = [];
          const normalBrickMasks = [];
          for (const hitFragment of [0, 1, 2, 3]) {
            damageWall(normalCell, 0, 0, { power: 1, dir: RIGHT }, 1 << hitFragment);
            normalMasks.push(normalCell.mask);
            normalBrickMasks.push(normalCell.brickMask);
          }
          damageWall(powerCell, 0, 0, { power: 3, dir: RIGHT }, 1 << 0);
          damageWall(powerTwoCell, 0, 0, { power: 2, dir: RIGHT }, 1 << 0);
    
          const directionMasks = {};
          const directions = [
            ["up", UP, 12, 8],
            ["down", DOWN, 0, 4],
            ["left", LEFT, 3, 2],
            ["right", RIGHT, 0, 1]
          ];
          for (const [name, dir, firstHit, secondHit] of directions) {
            const cell = makeCell(BRICK, 15);
            damageWall(cell, 0, 0, { power: 1, dir }, 1 << firstHit);
            const first = cell.mask;
            const firstBrickMask = cell.brickMask;
            damageWall(cell, 0, 0, { power: 1, dir }, 1 << secondHit);
            directionMasks[name] = {
              first,
              firstBrickMask,
              firstRemovedFragments: FULL_BRICK_FRAGMENT_MASK ^ firstBrickMask,
              second: cell.mask,
              removedAfterTwo: 15 ^ cell.mask
            };
          }
    
          const collisionCell = makeCell(BRICK, 15);
          damageWall(collisionCell, 0, 0, { power: 1, dir: RIGHT }, 1 << 0);
          const removedStripHit = overlappedBrickFragments({ x: 0, y: 0, w: 4, h: 8 }, 0, 0, collisionCell);
          const remainingStripHit = overlappedBrickFragments({ x: 4, y: 0, w: 4, h: 8 }, 0, 0, collisionCell);
          const previousGrid = game.grid;
          const collisionGrid = makeGrid();
          collisionGrid[0][0] = collisionCell;
          let removedStripSolid;
          let remainingStripSolid;
          try {
            game.grid = collisionGrid;
            removedStripSolid = rectHitsSolidTerrain({ x: 0, y: 0, w: 4, h: 8 });
            remainingStripSolid = rectHitsSolidTerrain({ x: 4, y: 0, w: 4, h: 8 });
          } finally {
            game.grid = previousGrid;
          }
    
          const previousExplosions = game.explosions;
          const integrationGrid = makeGrid();
          integrationGrid[1][1] = makeCell(BRICK, 15);
          const integrationBullet = {
            x: TILE,
            y: TILE,
            w: WALL_FRAGMENT,
            h: WALL_FRAGMENT,
            dir: RIGHT,
            power: 1,
            ownerKind: "player",
            remove: false
          };
          let integration;
          try {
            stopBrickHitAudio();
            game.grid = integrationGrid;
            game.explosions = [];
            const hit = hitTerrain(integrationBullet);
            integration = {
              hit,
              bulletRemoved: integrationBullet.remove,
              mask: integrationGrid[1][1].mask,
              brickMask: integrationGrid[1][1].brickMask,
              explosions: game.explosions.length
            };
          } finally {
            stopBrickHitAudio();
            game.grid = previousGrid;
            game.explosions = previousExplosions;
            brickHitAudio.active = previousBrickHit.active;
            brickHitAudio.frame = previousBrickHit.frame;
            syncBrickHitAudioNodes();
          }
    
          return {
            normalMasks,
            normalBrickMasks,
            normalTypeAfterFour: tileTypeName(normalCell.type),
            powerMask: powerCell.mask,
            powerBrickMask: powerCell.brickMask,
            powerTwoMask: powerTwoCell.mask,
            powerTwoBrickMask: powerTwoCell.brickMask,
            powerRemoved: 15 ^ powerCell.mask,
            directionMasks,
            removedStripHit,
            remainingStripHit,
            removedStripSolid,
            remainingStripSolid,
            integration,
            rules: cloneWallRules()
          };
        },
        debugBrickFragmentRenderProbe() {
          const cell = makeCell(BRICK, 15);
          damageWall(cell, 0, 0, { power: 1, dir: RIGHT }, 1 << 0);
          drawBrickCell(FIELD_X, FIELD_Y, cell);
          return {
            removed: { x: FIELD_X, y: FIELD_Y, w: WALL_FRAGMENT, h: HALF },
            remaining: { x: FIELD_X + WALL_FRAGMENT, y: FIELD_Y, w: WALL_FRAGMENT, h: HALF },
            mask: cell.mask,
            brickMask: cell.brickMask
          };
        },
        debugShovelWallProbe() {
          const durations = gameSettings().powerUpDurations;
          const grid = makeGrid();
          buildBaseWall(grid, STEEL);
          const cells = [
            [5, 11],
            [6, 11],
            [7, 11],
            [5, 12],
            [6, 12],
            [7, 12]
          ].map(([c, r]) => ({ c, r, type: tileTypeName(grid[r][c].type), mask: grid[r][c].mask }));
          const flashingTimer = Math.max(1, durations.shovelFlash - 1);
          const wallTypeForTimer = (timer, tick) => tileTypeName(
            shovelWallTypeForTimer(timer, tick, durations.shovelFlash)
          );
          return {
            durationUnits: durations.shovel,
            flashThreshold: durations.shovelFlash,
            protected: wallTypeForTimer(durations.shovelFlash, 0),
            flashA: wallTypeForTimer(flashingTimer, 0),
            flashB: wallTypeForTimer(flashingTimer, 16),
            expired: wallTypeForTimer(0, 0),
            cells
          };
        },
        debugShovelDestroyedBaseProbe() {
          const previous = {
            grid: game.grid,
            base: game.base,
            shovelTimer: game.shovelTimer,
            scorePopups: game.scorePopups,
            highScore: game.highScore
          };
          const player = {
            id: 1,
            x: 64,
            y: 64,
            w: 14,
            h: 14,
            score: 0,
            nextBonusLifeIndex: 0,
            lives: 2
          };
          const wallTypes = () => [[5, 11], [6, 11], [7, 11], [5, 12], [7, 12]].map(([c, r]) => tileTypeName(game.grid[r][c].type));
          try {
            game.grid = makeGrid();
            buildBaseWall(game.grid, BRICK);
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: false };
            game.shovelTimer = 0;
            game.scorePopups = [];
            applyPowerUp(player, "shovel");
            return {
              score: player.score,
              pickupScore: gameSettings().powerUpRules.pickupScore,
              shovelTimer: game.shovelTimer,
              wallTypes: wallTypes(),
              popupCount: game.scorePopups.length
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugCarrierReleaseProbe(hpBeforeHit) {
          const hp = Math.max(1, Math.floor(Number(hpBeforeHit) || 1));
          return {
            rule: gameSettings().powerUpRules.carrierRelease,
            clearUncollectedOnCarrierSpawn: gameSettings().powerUpRules.clearUncollectedOnCarrierSpawn,
            pickupScore: gameSettings().powerUpRules.pickupScore,
            releaseOnThisHit: shouldReleaseCarrierPowerUp(
              true,
              hp - 1 <= 0,
              gameSettings().powerUpRules.carrierRelease
            )
          };
        },
        debugCarrierFlashProbe() {
          const type = enemyTypeDefinitions()[0];
          const baseTank = { carrier: false, stun: 0 };
          const carrierTank = { carrier: true, stun: 0 };
          return {
            baseColor: tankPrimaryColor(baseTank, type.color, 0),
            flashColor: tankPrimaryColor(carrierTank, type.color, 0),
            normalPhaseColor: tankPrimaryColor(carrierTank, type.color, 8),
            flashColorValue: CARRIER_FLASH_COLOR,
            phaseFrames: CARRIER_FLASH_PHASE_FRAMES
          };
        },
        debugPausedTankVisualProbe() {
          const previous = { ...game };
          const type = enemyTypeDefinitions()[0];
          const carrier = { carrier: true };
          const stunnedPlayer = { stun: 1 };
          try {
            preparePausedDebugBattle(7);
    
            const snapshot = () => {
              const displayFrame = battleDisplayFrame();
              return {
                tick: game.tick,
                pauseElapsed: game.pauseElapsed,
                displayFrame,
                carrierColor: tankPrimaryColor(carrier, type.color, displayFrame),
                carrierBaseColor: type.color,
                carrierFlashColor: CARRIER_FLASH_COLOR,
                stunnedVisible: isPlayerTankVisible(stunnedPlayer, displayFrame)
              };
            };
            const initial = snapshot();
            update();
            const afterOneFrame = snapshot();
            for (let frame = 0; frame < 8; frame += 1) update();
            const afterNineFrames = snapshot();
    
            game.paused = false;
            game.tick = 23;
            const afterResume = snapshot();
            return { initial, afterOneFrame, afterNineFrames, afterResume };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugEnemyColorProbe(typeIndex, hp) {
          const type = enemyTypeDefinitions()[clamp(Math.floor(Number(typeIndex) || 0), 0, enemyTypeDefinitions().length - 1)];
          return enemyColor({
            hp: Math.max(1, Math.floor(Number(hp) || type.hp)),
            maxHp: type.hp,
            color: type.color,
            hitColors: type.hitColors ? type.hitColors.slice() : null
          });
        },
        debugEnemyTargetEligibilityProbe() {
          const previousPlayers = game.players;
          try {
            game.players = [
              { id: 1, alive: true, spawnFlash: 0, respawn: 0 },
              { id: 2, alive: true, spawnFlash: gameSettings().timings.playerSpawnFlash, respawn: 0 },
              { id: 3, alive: false, spawnFlash: 0, respawn: gameSettings().timings.playerRespawn },
              { id: 4, alive: false, spawnFlash: 0, respawn: 0 }
            ];
            return {
              targetableIds: targetableEnemyPlayers(game.players).map((player) => player.id),
              spawningId: 2,
              respawningId: 3
            };
          } finally {
            game.players = previousPlayers;
          }
        },
        debugEnemyAiPhaseProbe(stage, players) {
          const previousPlayerCount = game.playerCount;
          const stageValue = Math.max(1, Math.floor(Number(stage) || 1));
          try {
            game.playerCount = Math.max(1, Math.min(2, Math.floor(Number(players) || 1)));
            const interval = scaleEnemySpawnDelayForPlayers(defaultEnemySpawnDelay(stageValue), game.playerCount);
            const randomEnd = Math.floor(interval / 8);
            const playerEnd = Math.floor(interval / 4);
            return {
              stage: stageValue,
              players: game.playerCount,
              interval,
              randomEnd,
              playerEnd,
              phases: [
                { frameHigh: randomEnd, displayFrames: randomEnd * 64, phase: enemyAiPhase(stageValue, randomEnd) },
                { frameHigh: randomEnd + 1, displayFrames: (randomEnd + 1) * 64, phase: enemyAiPhase(stageValue, randomEnd + 1) },
                { frameHigh: playerEnd + 1, displayFrames: (playerEnd + 1) * 64, phase: enemyAiPhase(stageValue, playerEnd + 1) }
              ]
            };
          } finally {
            game.playerCount = previousPlayerCount;
          }
        },
        debugEnemyTargetingProbe() {
          const previousPlayers = game.players;
          const enemy = { x: 73, y: 73, w: 14, h: 14, slotIndex: 7 };
          const upperLeft = { x: 64, y: 64 };
          const lowerRight = { x: 96, y: 96 };
          try {
            game.players = [
              { id: 1, alive: true, x: 32, y: 160, w: 14, h: 14 },
              { id: 2, alive: true, x: 128, y: 160, w: 14, h: 14 }
            ];
            const oddSlotTarget = selectEnemyTargetPlayer(enemy, game.players);
            enemy.slotIndex = 6;
            const evenSlotTarget = selectEnemyTargetPlayer(enemy, game.players);
            game.players[1].alive = false;
            enemy.slotIndex = 7;
            const fallbackTarget = selectEnemyTargetPlayer(enemy, game.players);
            return {
              oddSlotTargetId: oddSlotTarget ? oddSlotTarget.id : null,
              evenSlotTargetId: evenSlotTarget ? evenSlotTarget.id : null,
              fallbackTargetId: fallbackTarget ? fallbackTarget.id : null,
              upperLeftVerticalFirst: directionName(directionTowardTarget(enemy, upperLeft, false)),
              upperLeftHorizontalFirst: directionName(directionTowardTarget(enemy, upperLeft, true)),
              lowerRightVerticalFirst: directionName(directionTowardTarget(enemy, lowerRight, false)),
              lowerRightHorizontalFirst: directionName(directionTowardTarget(enemy, lowerRight, true))
            };
          } finally {
            game.players = previousPlayers;
          }
        },
        debugEnemyMovementCadenceProbe() {
          const previous = { tick: game.tick, frameLow: game.frameLow };
          const normal = { slotIndex: 5, alternateMovement: true };
          const fast = { slotIndex: 5, alternateMovement: false };
          try {
            const frames = [];
            for (let tick = 0; tick < 4; tick += 1) {
              game.tick = tick;
              game.frameLow = tick;
              frames.push({
                tick,
                normal: isEnemyMovementFrame(normal, game.frameLow),
                fast: isEnemyMovementFrame(fast, game.frameLow)
              });
            }
            return frames;
          } finally {
            Object.assign(game, previous);
          }
        },
        debugEnemyBlockedStateProbe() {
          const previous = {
            tick: game.tick,
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies
          };
          const makeEnemy = () => ({
            kind: "enemy",
            id: 100,
            slotIndex: 5,
            x: 1,
            y: 17,
            w: 14,
            h: 14,
            dir: UP,
            speed: 8,
            alternateMovement: false,
            blockedPauseTicks: 0,
            pendingTurn: false,
            alive: true,
            respawn: 0
          });
          const byteSequence = (bytes) => {
            let index = 0;
            return () => ((bytes[Math.min(index++, bytes.length - 1)] || 0) + 0.01) / 256;
          };
          try {
            game.tick = 0;
            game.grid = makeGrid();
            setTile(game.grid, 0, 0, BRICK);
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [];
            const retryEnemy = makeEnemy();
            game.enemies = [retryEnemy];
            updateEnemyMovement(retryEnemy, byteSequence([1, 3]));
            const retry = { dir: retryEnemy.dir, blockedPauseTicks: retryEnemy.blockedPauseTicks, pendingTurn: retryEnemy.pendingTurn };
            updateEnemyMovement(retryEnemy, byteSequence([0]));
            const retryPause1 = retryEnemy.blockedPauseTicks;
            updateEnemyMovement(retryEnemy, byteSequence([0]));
            const retryPause2 = retryEnemy.blockedPauseTicks;
    
            const turnEnemy = makeEnemy();
            game.enemies = [turnEnemy];
            updateEnemyMovement(turnEnemy, byteSequence([1, 0]));
            const turn = { dir: turnEnemy.dir, blockedPauseTicks: turnEnemy.blockedPauseTicks, pendingTurn: turnEnemy.pendingTurn };
            return { retry, retryPause1, retryPause2, turn };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugEnemySpawnTimelineProbe(players, count) {
          const previous = {
            stage: game.stage,
            playerCount: game.playerCount,
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            bullets: game.bullets,
            explosions: game.explosions,
            powerUp: game.powerUp,
            enemySpawned: game.enemySpawned,
            nextSpawn: game.nextSpawn
          };
          const targetCount = Math.max(1, Math.min(6, Math.floor(Number(count) || 3)));
          try {
            game.stage = 1;
            game.playerCount = Math.max(1, Math.min(2, Math.floor(Number(players) || 1)));
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [];
            game.enemies = [];
            game.bullets = [];
            game.explosions = [];
            game.powerUp = null;
            game.enemySpawned = 0;
            game.nextSpawn = enemySpawnDelay(game.stage, 0);
            const frames = [];
            for (let frame = 1; frame <= 1200 && frames.length < targetCount; frame += 1) {
              const before = game.enemySpawned;
              spawnEnemies();
              if (game.enemySpawned > before) frames.push(frame);
            }
            return {
              players: game.playerCount,
              interval: scaleEnemySpawnDelayForPlayers(defaultEnemySpawnDelay(1), game.playerCount),
              frames,
              slots: game.enemies.map((enemy) => enemy.slotIndex),
              spawnIndices: game.enemies.map((enemy) => getEnemySpec(1, enemy.id - 100).spawnIndex),
              states: game.enemies.map((enemy) => ({
                ...enemy,
                hitColors: enemy.hitColors ? enemy.hitColors.slice() : null
              }))
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugSpawnAnimationCadenceProbe() {
          const playerDuration = gameSettings().timings.playerSpawnFlash;
          const enemyDuration = gameSettings().timings.enemySpawnFlash;
          const frames = Array.from({ length: enemyDuration }, (_, elapsed) =>
            spawnAnimationPresentation(enemyDuration - elapsed, enemyDuration)
          );
          const previous = {
            players: game.players,
            enemies: game.enemies,
            grid: game.grid,
            tick: game.tick,
            frameLow: game.frameLow,
            frameHigh: game.frameHigh,
            freezeTimer: game.freezeTimer,
            firePresses: Array.from(pendingFirePresses)
          };
          try {
            game.grid = makeGrid();
            game.freezeTimer = 0;
            game.enemies = [];
            const player = {
              kind: "player",
              id: 1,
              alive: true,
              respawn: 0,
              spawnFlash: playerDuration,
              invuln: 0,
              reload: 0
            };
            game.players = [player];
            game.tick = 2;
            game.frameLow = 2;
            game.frameHigh = 0;
            const beforeSkippedCadenceFrame = player.spawnFlash;
            updatePlayers();
            const afterSkippedCadenceFrame = player.spawnFlash;
            let playerDisplayFrames = 1;
            while (player.spawnFlash > 0 && playerDisplayFrames < 1000) {
              game.tick += 1;
              game.frameLow = (game.frameLow + 1) & 0xff;
              updatePlayers();
              playerDisplayFrames += 1;
            }
    
            const enemy = { kind: "enemy", id: 100, alive: true, spawnFlash: enemyDuration };
            game.enemies = [enemy];
            let enemyDisplayFrames = 0;
            while (enemy.spawnFlash > 0 && enemyDisplayFrames < 1000) {
              updateEnemies();
              enemyDisplayFrames += 1;
            }
            return {
              playerDuration,
              enemyDuration,
              playerDisplayFrames,
              enemyDisplayFrames,
              beforeSkippedCadenceFrame,
              afterSkippedCadenceFrame,
              lows: frames.map((frame) => frame.low),
              phases: frames.map((frame) => frame.phase),
              sizes: frames.map((frame) => frame.size)
            };
          } finally {
            game.players = previous.players;
            game.enemies = previous.enemies;
            game.grid = previous.grid;
            game.tick = previous.tick;
            game.frameLow = previous.frameLow;
            game.frameHigh = previous.frameHigh;
            game.freezeTimer = previous.freezeTimer;
            pendingFirePresses.clear();
            for (const code of previous.firePresses) pendingFirePresses.add(code);
          }
        },
        debugTimerRuleProbe() {
          const previousFreezeTimer = game.freezeTimer;
          game.freezeTimer = 1;
          const frozen = isEnemyTimeFrozen();
          const canSpawn = shouldSpawnEnemies();
          game.freezeTimer = previousFreezeTimer;
          return { frozen, canSpawn };
        },
        debugGlobalTimerCadenceProbe() {
          const countdownFrames = (units, startTick) => {
            let remaining = units;
            let tick = startTick;
            let frames = 0;
            while (remaining > 0 && frames < 100000) {
              tick += 1;
              frames += 1;
              if (isGlobalTimerTick(tick)) remaining -= 1;
            }
            return frames;
          };
          return {
            unitFrames: 64,
            boundaries: [62, 63, 64, 65, 127, 128].map((tick) => ({ tick, active: isGlobalTimerTick(tick) })),
            durations: { ...gameSettings().powerUpDurations },
            spawnShieldUnits: gameSettings().timings.playerInvulnerability,
            timerDisplayFrames: {
              phase0: countdownFrames(gameSettings().powerUpDurations.timer, 0),
              phase63: countdownFrames(gameSettings().powerUpDurations.timer, 63)
            },
            spawnShieldDisplayFrames: {
              phase0: countdownFrames(gameSettings().timings.playerInvulnerability, 0),
              phase63: countdownFrames(gameSettings().timings.playerInvulnerability, 63)
            }
          };
        },
        debugShieldCadenceProbe() {
          return Array.from({ length: 8 }, (_, tick) => ({ tick, color: shieldColorForTick(tick), visible: true }));
        },
        debugPausedShieldProbe() {
          const previous = { ...game };
          const player = { alive: true, lives: 1, respawn: 0, invuln: 2 };
          try {
            preparePausedDebugBattle(63);
            game.paused = false;
            game.players = [player];
    
            const activeVisible = isPlayerShieldVisible(player, game.paused);
            game.paused = true;
            const pausedVisible = isPlayerShieldVisible(player, game.paused);
            const beforePausedUpdate = { tick: game.tick, invuln: player.invuln };
            update();
            const afterPausedUpdate = {
              tick: game.tick,
              pauseElapsed: game.pauseElapsed,
              invuln: player.invuln
            };
            game.paused = false;
            const resumedVisible = isPlayerShieldVisible(player, game.paused);
            player.invuln = 0;
            const expiredVisible = isPlayerShieldVisible(player, game.paused);
            return { activeVisible, pausedVisible, resumedVisible, expiredVisible, beforePausedUpdate, afterPausedUpdate };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugTimerFreezeBehaviorProbe() {
          const previous = {
            grid: game.grid,
            players: game.players,
            enemies: game.enemies,
            bullets: game.bullets,
            explosions: game.explosions,
            scorePopups: game.scorePopups,
            freezeTimer: game.freezeTimer,
            highScore: game.highScore
          };
          const player = {
            id: 1,
            score: 0,
            stagePoints: 0,
            stageKills: Array(enemyTypeDefinitions().length).fill(0),
            totalKills: Array(enemyTypeDefinitions().length).fill(0),
            nextBonusLifeIndex: 0,
            lives: 2,
            alive: true
          };
          const enemy = {
            kind: "enemy",
            id: 100,
            x: 64,
            y: 64,
            w: 14,
            h: 14,
            dir: RIGHT,
            speed: 1,
            reload: 9,
            reloadBase: 9,
            blockedPauseTicks: 0,
            pendingTurn: false,
            alternateMovement: false,
            spawnFlash: 0,
            fireChance: 0,
            alive: true
          };
          const bullet = {
            x: 16,
            y: 144,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            dir: RIGHT,
            speed: 2,
            power: 1,
            ownerKind: "player",
            ownerId: 1,
            ownerKey: "player:1",
            remove: false
          };
    
          try {
            game.grid = makeGrid();
            game.players = [player];
            game.enemies = [enemy];
            game.bullets = [bullet];
            game.explosions = [];
            game.scorePopups = [];
            applyPowerUp(player, "timer");
            const before = {
              enemyX: enemy.x,
              enemyReload: enemy.reload,
              bulletX: bullet.x,
              freezeTimer: game.freezeTimer,
              score: player.score
            };
            updateEnemies();
            updateBullets();
            return {
              duration: gameSettings().powerUpDurations.timer,
              pickupScore: gameSettings().powerUpRules.pickupScore,
              before,
              after: {
                enemyX: enemy.x,
                enemyReload: enemy.reload,
                bulletX: bullet.x,
                freezeTimer: game.freezeTimer,
                score: player.score
              }
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugTimerFinalFrameFreezeProbe() {
          const previous = {
            screen: game.screen,
            paused: game.paused,
            stage: game.stage,
            tick: game.tick,
            frameLow: game.frameLow,
            frameHigh: game.frameHigh,
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            bullets: game.bullets,
            explosions: game.explosions,
            powerUp: game.powerUp,
            enemySpawned: game.enemySpawned,
            nextSpawn: game.nextSpawn,
            clearPendingTimer: game.clearPendingTimer,
            gameOverTimer: game.gameOverTimer,
            freezeTimer: game.freezeTimer,
            shovelTimer: game.shovelTimer
          };
          const player = {
            kind: "player",
            id: 1,
            x: 32,
            y: 160,
            w: 14,
            h: 14,
            dir: UP,
            speed: gameSettings().playerMovement.speed,
            alive: true,
            lives: 1,
            respawn: 0,
            spawnFlash: 0,
            invuln: 0,
            stun: 0,
            pendingSnap: false,
            level: 0,
            reload: 0,
            score: 0,
            stagePoints: 0,
            stageKills: Array(enemyTypeDefinitions().length).fill(0),
            totalKills: Array(enemyTypeDefinitions().length).fill(0),
            nextBonusLifeIndex: 0,
            slide: 0
          };
          const activeEnemy = {
            kind: "enemy",
            id: 100,
            x: 64,
            y: 64,
            w: 14,
            h: 14,
            dir: RIGHT,
            speed: 1,
            hp: 1,
            reload: 9,
            reloadBase: 9,
            blockedPauseTicks: 0,
            pendingTurn: false,
            alternateMovement: false,
            spawnFlash: 0,
            fireChance: 0,
            alive: true
          };
          const spawningEnemy = {
            kind: "enemy",
            id: 101,
            x: 96,
            y: 16,
            w: 14,
            h: 14,
            dir: DOWN,
            speed: 1,
            hp: 1,
            reload: 9,
            reloadBase: 9,
            blockedPauseTicks: 2,
            pendingTurn: false,
            alternateMovement: false,
            spawnFlash: 5,
            fireChance: 0,
            alive: true
          };
          const bullet = {
            x: 16,
            y: 144,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            dir: RIGHT,
            speed: 2,
            power: 1,
            ownerKind: "player",
            ownerId: 1,
            ownerKey: "player:1",
            remove: false
          };
          try {
            game.screen = "playing";
            game.paused = false;
            game.stage = 1;
            game.tick = 63;
            game.frameLow = 0x3f;
            game.frameHigh = 0;
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [player];
            game.enemies = [activeEnemy, spawningEnemy];
            game.bullets = [bullet];
            game.explosions = [];
            game.powerUp = null;
            game.enemySpawned = 0;
            game.nextSpawn = 5;
            game.clearPendingTimer = 0;
            game.gameOverTimer = 0;
            game.freezeTimer = 1;
            game.shovelTimer = 0;
            const before = {
              activeEnemyX: activeEnemy.x,
              activeEnemyReload: activeEnemy.reload,
              activeEnemyBlockedPauseTicks: activeEnemy.blockedPauseTicks,
              spawningEnemyFlash: spawningEnemy.spawnFlash,
              nextSpawn: game.nextSpawn,
              bulletX: bullet.x,
              freezeTimer: game.freezeTimer
            };
            update();
            return {
              before,
              after: {
                activeEnemyX: activeEnemy.x,
                activeEnemyReload: activeEnemy.reload,
                activeEnemyBlockedPauseTicks: activeEnemy.blockedPauseTicks,
                spawningEnemyFlash: spawningEnemy.spawnFlash,
                nextSpawn: game.nextSpawn,
                bulletX: game.bullets[0] ? game.bullets[0].x : null,
                freezeTimer: game.freezeTimer
              }
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugTimerSpawnDuringFreezeProbe() {
          const previous = {
            screen: game.screen,
            paused: game.paused,
            stage: game.stage,
            tick: game.tick,
            frameLow: game.frameLow,
            frameHigh: game.frameHigh,
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            bullets: game.bullets,
            explosions: game.explosions,
            powerUp: game.powerUp,
            enemySpawned: game.enemySpawned,
            nextSpawn: game.nextSpawn,
            clearPendingTimer: game.clearPendingTimer,
            gameOverTimer: game.gameOverTimer,
            freezeTimer: game.freezeTimer,
            shovelTimer: game.shovelTimer
          };
          const player = {
            kind: "player",
            id: 1,
            x: 32,
            y: 160,
            w: 14,
            h: 14,
            dir: UP,
            speed: gameSettings().playerMovement.speed,
            alive: true,
            lives: 1,
            respawn: 0,
            spawnFlash: 0,
            invuln: 0,
            stun: 0,
            pendingSnap: false,
            level: 0,
            reload: 0,
            score: 0,
            stagePoints: 0,
            stageKills: Array(enemyTypeDefinitions().length).fill(0),
            totalKills: Array(enemyTypeDefinitions().length).fill(0),
            nextBonusLifeIndex: 0,
            slide: 0
          };
    
          try {
            game.screen = "playing";
            game.paused = false;
            game.stage = 1;
            game.tick = 0;
            game.frameLow = 0;
            game.frameHigh = 0;
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [player];
            game.enemies = [];
            game.bullets = [];
            game.explosions = [];
            game.powerUp = null;
            game.enemySpawned = 0;
            game.nextSpawn = 0;
            game.clearPendingTimer = 0;
            game.gameOverTimer = 0;
            game.freezeTimer = 2;
            game.shovelTimer = 0;
    
            update();
            const spawnedEnemy = game.enemies[0];
            const afterSpawn = {
              enemyCount: game.enemies.length,
              enemySpawned: game.enemySpawned,
              spawnedEnemyFlash: spawnedEnemy ? spawnedEnemy.spawnFlash : null,
              freezeTimer: game.freezeTimer,
              nextSpawn: game.nextSpawn
            };
    
            update();
            const afterFrozenFrame = {
              enemyCount: game.enemies.length,
              enemySpawned: game.enemySpawned,
              spawnedEnemyFlash: spawnedEnemy ? spawnedEnemy.spawnFlash : null,
              freezeTimer: game.freezeTimer,
              nextSpawn: game.nextSpawn
            };
            for (let frame = 1; frame < gameSettings().timings.enemySpawnFlash; frame += 1) update();
            if (spawnedEnemy) {
              spawnedEnemy.reload = 0;
              spawnedEnemy.fireChance = 1;
            }
            const afterSpawnAnimation = {
              spawnedEnemyFlash: spawnedEnemy ? spawnedEnemy.spawnFlash : null,
              enemyX: spawnedEnemy ? spawnedEnemy.x : null,
              enemyY: spawnedEnemy ? spawnedEnemy.y : null,
              enemyReload: spawnedEnemy ? spawnedEnemy.reload : null,
              enemyBulletCount: spawnedEnemy
                ? game.bullets.filter((bullet) => bullet.ownerKey === `enemy:${spawnedEnemy.id}`).length
                : null,
              freezeTimer: game.freezeTimer,
              nextSpawn: game.nextSpawn
            };
            update();
            return {
              expectedSpawnFlash: gameSettings().timings.enemySpawnFlash,
              afterSpawn,
              afterFrozenFrame,
              afterSpawnAnimation,
              afterFrozenActiveFrame: {
                spawnedEnemyFlash: spawnedEnemy ? spawnedEnemy.spawnFlash : null,
                enemyX: spawnedEnemy ? spawnedEnemy.x : null,
                enemyY: spawnedEnemy ? spawnedEnemy.y : null,
                enemyReload: spawnedEnemy ? spawnedEnemy.reload : null,
                enemyBulletCount: spawnedEnemy
                  ? game.bullets.filter((bullet) => bullet.ownerKey === `enemy:${spawnedEnemy.id}`).length
                  : null,
                freezeTimer: game.freezeTimer,
                nextSpawn: game.nextSpawn
              }
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugEnemySpawnOverlapProbe() {
          const previous = {
            stage: game.stage,
            playerCount: game.playerCount,
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            bullets: game.bullets,
            explosions: game.explosions,
            powerUp: game.powerUp,
            enemySpawned: game.enemySpawned,
            nextSpawn: game.nextSpawn
          };
          try {
            game.stage = 1;
            game.playerCount = 1;
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            const spec = getEnemySpec(game.stage, 0);
            const point = enemySpawnPoint(spec.spawnIndex);
            const blocker = {
              kind: "enemy",
              id: 200,
              slotIndex: 2,
              x: point.x,
              y: point.y,
              w: 14,
              h: 14,
              alive: true,
              respawn: 0,
              spawnFlash: gameSettings().timings.enemySpawnFlash
            };
            game.players = [];
            game.enemies = [blocker];
            game.bullets = [];
            game.explosions = [];
            game.powerUp = null;
            game.enemySpawned = 0;
            game.nextSpawn = 0;
            spawnEnemies();
            const blocked = {
              enemyCount: game.enemies.length,
              enemySpawned: game.enemySpawned,
              retry: game.nextSpawn
            };
            blocker.x = HALF * 2;
            blocker.y = HALF * 2;
            for (let frame = 0; frame < gameSettings().timings.enemySpawnRetry; frame += 1) spawnEnemies();
            const beforeRetry = {
              enemyCount: game.enemies.length,
              enemySpawned: game.enemySpawned,
              retry: game.nextSpawn
            };
            spawnEnemies();
            const spawnedEnemy = game.enemies.find((enemy) => enemy !== blocker);
            return {
              blocked,
              beforeRetry,
              afterRetry: {
                enemyCount: game.enemies.length,
                enemySpawned: game.enemySpawned,
                enemyOverlap: Boolean(spawnedEnemy && rectsOverlap(blocker, spawnedEnemy))
              },
              spawnIndex: spec.spawnIndex,
              enemyPosition: spawnedEnemy ? { x: spawnedEnemy.x, y: spawnedEnemy.y } : null
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugPowerUpTypePoolProbe() {
          const starFrame = FREE_SPRITE_MANIFEST.sprites.powerUp.frames.star || [];
          const weights = Object.fromEntries(powerTypes.map((type) => [type, 0]));
          for (const type of originalPowerUpRandomTable) weights[type] += 1;
          return {
            types: powerTypes.slice(),
            randomTable: originalPowerUpRandomTable.slice(),
            sampledTable: Array.from({ length: 8 }, (_, byte) => randomPowerUpType(() => byte / 256)),
            weights,
            starFrameParts: starFrame.length,
            starPrimaryParts: starFrame.filter((part) => part.role === "primary").length
          };
        },
        debugBattleRandomProbe() {
          const previous = {
            randomValue: game.randomValue,
            randomIndex: game.randomIndex,
            frameHigh: game.frameHigh
          };
          try {
            game.randomValue = 0x5a;
            game.randomIndex = 0xfe;
            game.frameHigh = 0x22;
            const aiDecision = aiRoll(1 / 16);
            const afterAiIndex = game.randomIndex;
            const secondType = randomPowerUpType();
            const afterPowerUpIndex = game.randomIndex;
            const location = selectPowerUpSpawnSpot(
              [{ id: 0 }, { id: 1 }],
              (randomByte() << 8) | randomByte(),
              null
            );
            const afterLocationIndex = game.randomIndex;
            const beforeInjected = { value: game.randomValue, index: game.randomIndex };
            const injected = randomByte(() => 0.5);
            return {
              shared: { aiDecision, afterAiIndex, secondType, afterPowerUpIndex, locationId: location.id, afterLocationIndex },
              injected,
              injectedPreservedState: game.randomValue === beforeInjected.value && game.randomIndex === beforeInjected.index
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugPowerUpFlashCadenceProbe() {
          return Array.from({ length: 32 }, (_, tick) => ({ tick, visible: isPowerUpVisible(tick) }));
        },
        debugPausedPowerUpVisualProbe() {
          const previous = { ...game };
          try {
            preparePausedDebugBattle(7);
    
            const snapshot = () => ({
              tick: game.tick,
              pauseElapsed: game.pauseElapsed,
              displayFrame: battleDisplayFrame(),
              powerUpVisible: isPowerUpVisible(battleDisplayFrame()),
              waterFrame: waterFrameName(game.frameLow)
            });
            const initial = snapshot();
            update();
            const afterOneFrame = snapshot();
            for (let frame = 0; frame < 8; frame += 1) update();
            const afterNineFrames = snapshot();
    
            game.paused = false;
            game.tick = 23;
            const afterResume = snapshot();
            return { initial, afterOneFrame, afterNineFrames, afterResume };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugWaterAnimationCadenceProbe() {
          return [0, 31, 32, 63, 64, 95, 96].map((tick) => ({ tick, frame: waterFrameName(tick) }));
        },
        debugPowerUpTtlProbe(ttl) {
          const previousPowerUp = game.powerUp;
          game.powerUp = { type: "helmet", x: 0, y: 0, w: POWERUP_SIZE, h: POWERUP_SIZE, ttl: Math.max(0, Math.floor(Number(ttl) || 0)) };
          updatePowerUp();
          const result = {
            survives: Boolean(game.powerUp),
            ttl: game.powerUp ? game.powerUp.ttl : 0
          };
          game.powerUp = previousPowerUp;
          return result;
        },
        debugPowerUpPickupBoundaryProbe() {
          const player = { alive: true, respawn: 0, spawnFlash: 0, stun: 0, invuln: 0, x: 63, y: 63, w: 14, h: 14 };
          const power = { type: "star", x: 64, y: 64, w: POWERUP_SIZE, h: POWERUP_SIZE };
          const check = (centerDx, centerDy) => canPlayerCollectPowerUp({
            ...player,
            x: power.x + power.w / 2 - player.w / 2 + centerDx,
            y: power.y + power.h / 2 - player.h / 2 + centerDy
          }, power);
          return {
            samePosition: check(0, 0),
            positiveEleven: check(11, 11),
            negativeEleven: check(-11, -11),
            positiveTwelveX: check(12, 0),
            negativeTwelveX: check(-12, 0),
            positiveTwelveY: check(0, 12),
            negativeTwelveY: check(0, -12),
            spawning: canPlayerCollectPowerUp({ ...player, spawnFlash: 1 }, power),
            respawning: canPlayerCollectPowerUp({ ...player, respawn: 1 }, power),
            dead: canPlayerCollectPowerUp({ ...player, alive: false }, power),
            stunned: canPlayerCollectPowerUp({ ...player, stun: 1 }, power),
            invulnerable: canPlayerCollectPowerUp({ ...player, invuln: 1 }, power)
          };
        },
        debugPowerUpPickupPriorityProbe() {
          const previousPlayers = game.players;
          const makePlayer = (id, spawnFlash) => ({ id, alive: true, respawn: 0, spawnFlash: spawnFlash || 0, x: 63, y: 63, w: 14, h: 14 });
          const power = { type: "star", x: 64, y: 64, w: POWERUP_SIZE, h: POWERUP_SIZE };
          try {
            const player1 = makePlayer(1);
            const player2 = makePlayer(2);
            game.players = [player1, player2];
            const simultaneous = findPowerUpCollector(game.players, power);
            player2.spawnFlash = 1;
            const player2Spawning = findPowerUpCollector(game.players, power);
            game.players = [player1];
            const onePlayer = findPowerUpCollector(game.players, power);
            return {
              simultaneousPlayerId: simultaneous ? simultaneous.id : null,
              player2SpawningPlayerId: player2Spawning ? player2Spawning.id : null,
              onePlayerId: onePlayer ? onePlayer.id : null
            };
          } finally {
            game.players = previousPlayers;
          }
        },
        debugPowerUpPickupRenderProbe() {
          const previous = {
            screen: game.screen,
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            bullets: game.bullets,
            explosions: game.explosions,
            scorePopups: game.scorePopups,
            powerUp: game.powerUp,
            highScore: game.highScore,
            tick: game.tick,
            frameLow: game.frameLow,
            frameHigh: game.frameHigh
          };
          const previousPowerUpPickup = {
            active: powerUpPickupAudio.active,
            frame: powerUpPickupAudio.frame
          };
          const power = { type: "star", x: 34, y: 50, w: POWERUP_SIZE, h: POWERUP_SIZE, ttl: 0 };
          const player = {
            kind: "player",
            id: 1,
            x: power.x,
            y: power.y,
            w: 14,
            h: 14,
            dir: UP,
            speed: gameSettings().playerMovement.speed,
            alive: true,
            lives: 3,
            nextBonusLifeIndex: 0,
            respawn: 0,
            invuln: 0,
            stun: 0,
            pendingSnap: false,
            level: 0,
            reload: 0,
            score: 0,
            stagePoints: 0,
            stageKills: Array(enemyTypeDefinitions().length).fill(0),
            totalKills: Array(enemyTypeDefinitions().length).fill(0),
            slide: 0,
            color: "#e3c64e",
            accent: "#fff0a8"
          };
    
          try {
            stopPowerUpPickupAudio();
            game.screen = "playing";
            game.grid = makeGrid();
            buildBaseWall(game.grid, BRICK);
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [player];
            game.enemies = [];
            game.bullets = [];
            game.explosions = [];
            game.scorePopups = [];
            game.powerUp = power;
    
            updatePowerUp();
            const pickupAudio = {
              active: powerUpPickupAudio.active,
              frame: powerUpPickupAudio.frame,
              audible: powerUpPickupAudioAudible()
            };
            const popup = game.scorePopups[0] ? { ...game.scorePopups[0] } : null;
            const presentation = popup ? scorePopupPresentation(popup) : null;
            const laterPresentation = popup ? scorePopupPresentation({ ...popup, ttl: Math.max(1, popup.ttl - 24) }) : null;
            renderGame();
            let visibleFrames = 0;
            while (game.scorePopups.length) {
              visibleFrames += 1;
              updateScorePopups();
            }
    
            return {
              powerUpType: game.powerUp ? game.powerUp.type : null,
              playerLevel: player.level,
              playerScore: player.score,
              pickupScore: gameSettings().powerUpRules.pickupScore,
              popup,
              presentation,
              laterPresentation,
              pickupAudio,
              visibleFrames,
              powerCenter: { x: power.x + power.w / 2, y: power.y + power.h / 2 },
              drawRect: { x: FIELD_X + power.x, y: FIELD_Y + power.y, w: power.w, h: power.h }
            };
          } finally {
            stopPowerUpPickupAudio();
            Object.assign(game, previous);
            powerUpPickupAudio.active = previousPowerUpPickup.active;
            powerUpPickupAudio.frame = previousPowerUpPickup.frame;
            syncPowerUpPickupAudioNodes();
            syncMovementAudio();
          }
        },
        debugPowerUpFootprintClearProbe() {
          const previous = {
            screen: game.screen,
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            bullets: game.bullets,
            explosions: game.explosions,
            scorePopups: game.scorePopups,
            powerUp: game.powerUp,
            highScore: game.highScore
          };
          const power = { type: "star", x: 48, y: 64, w: POWERUP_SIZE, h: POWERUP_SIZE, ttl: 0 };
          const player = {
            kind: "player",
            id: 1,
            x: power.x,
            y: power.y,
            w: 14,
            h: 14,
            dir: UP,
            speed: gameSettings().playerMovement.speed,
            alive: true,
            lives: 3,
            nextBonusLifeIndex: 0,
            respawn: 0,
            spawnFlash: 0,
            invuln: 0,
            stun: 0,
            pendingSnap: false,
            level: 0,
            reload: 0,
            score: 0,
            stagePoints: 0,
            stageKills: Array(enemyTypeDefinitions().length).fill(0),
            totalKills: Array(enemyTypeDefinitions().length).fill(0),
            slide: 0,
            color: "#e3c64e",
            accent: "#fff0a8"
          };
    
          try {
            game.screen = "playing";
            game.grid = makeGrid();
            game.grid[4][3] = makeCell(FOREST);
            buildBaseWall(game.grid, BRICK);
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [player];
            game.enemies = [];
            game.bullets = [];
            game.explosions = [];
            game.scorePopups = [];
            game.powerUp = power;
    
            renderGame();
            updatePowerUp();
            player.x = 160;
            player.y = 160;
            renderGame();
    
            return {
              powerUpType: game.powerUp ? game.powerUp.type : null,
              playerLevel: player.level,
              playerScore: player.score,
              pickupScore: gameSettings().powerUpRules.pickupScore,
              drawRect: { x: FIELD_X + power.x, y: FIELD_Y + power.y, w: power.w, h: power.h }
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugPowerUpTerrainMutationProbe() {
          const previous = {
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            explosions: game.explosions,
            scorePopups: game.scorePopups,
            powerUp: game.powerUp,
            freezeTimer: game.freezeTimer,
            shovelTimer: game.shovelTimer,
            highScore: game.highScore,
            tick: game.tick,
            frameLow: game.frameLow,
            frameHigh: game.frameHigh
          };
          const baseline = makeGrid();
          buildBaseWall(baseline, BRICK);
          setTile(baseline, 2, 8, ICE, 0);
          setTile(baseline, 10, 9, ICE, 0);
          const countIce = (grid) => grid.reduce(
            (total, row) => total + row.filter((cell) => cell.type === ICE).length,
            0
          );
          const changesFrom = (before, after) => {
            const changes = [];
            for (let r = 0; r < GRID; r += 1) {
              for (let c = 0; c < GRID; c += 1) {
                const a = before[r][c];
                const b = after[r][c];
                if (a.type === b.type && a.mask === b.mask) continue;
                changes.push({ c, r, before: tileTypeName(a.type), after: tileTypeName(b.type) });
              }
            }
            return changes;
          };
    
          try {
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.enemies = [];
            game.explosions = [];
            game.scorePopups = [];
            game.freezeTimer = 0;
            game.shovelTimer = 0;
            return powerTypes.map((type) => {
              game.tick = 0;
              game.frameLow = 0;
              game.frameHigh = 0;
              const before = cloneGrid(baseline);
              const player = createPlayer(1);
              player.spawnFlash = 0;
              player.invuln = 0;
              player.score = 0;
              player.stagePoints = 0;
              game.grid = cloneGrid(before);
              game.players = [player];
              game.powerUp = { type, x: player.x, y: player.y, w: POWERUP_SIZE, h: POWERUP_SIZE, ttl: 0 };
              collectPowerUp(player, game.powerUp);
              const changes = changesFrom(before, game.grid);
              const afterIce = countIce(game.grid);
              let expiredIce = afterIce;
              let expiryChanges = changes;
              if (type === "shovel") {
                let guard = 0;
                while (game.shovelTimer > 0 && guard < 1000) {
                  game.tick += 16;
                  game.frameLow = (game.frameLow + 16) & 0xff;
                  guard += 1;
                  updateShovelTimer();
                }
                expiredIce = countIce(game.grid);
                expiryChanges = changesFrom(before, game.grid);
              }
              return {
                type,
                beforeIce: countIce(before),
                afterIce,
                expiredIce,
                addedIce: changes.filter((change) => change.after === "ice"),
                changes,
                expiryChanges
              };
            });
          } finally {
            Object.assign(game, previous);
          }
        },
        debugPowerUpSpawnTerrainProbe() {
          const previous = {
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            powerUp: game.powerUp,
            lastPowerUpSpawn: game.lastPowerUpSpawn,
            powerUpSpawnBag: game.powerUpSpawnBag.slice(),
            powerUpSpawnBagKey: game.powerUpSpawnBagKey
          };
          const steelSpot = { x: 1 * TILE + 2, y: 1 * TILE + 2 };
          const waterSpot = { x: 5 * TILE + 2, y: 5 * TILE + 2 };
          const brickSpot = { x: 9 * TILE + 2, y: 9 * TILE + 2 };
          const openSpot = { x: 2 * TILE + 2, y: 1 * TILE + 2 };
    
          try {
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [];
            game.enemies = [];
            game.powerUp = null;
            setTile(game.grid, 1, 1, STEEL);
            setTile(game.grid, 5, 5, WATER);
            setTile(game.grid, 9, 9, BRICK);
    
            const candidates = [steelSpot, waterSpot, brickSpot, openSpot];
            const openTiles = candidates.filter(canPowerUpSpawnAt).map(powerUpPixelToTilePoint);
            const candidateTiles = powerUpSpawnCandidates(candidates).map(powerUpPixelToTilePoint);
            game.lastPowerUpSpawn = powerUpSpawnKey(openSpot);
            const nonRepeatPick = pickPowerUpSpawnSpot(candidates);
    
            game.grid = Array.from({ length: GRID }, () =>
              Array.from({ length: GRID }, () => makeCell(STEEL, 15))
            );
            clearTile(game.grid, 3, 3);
            const fallback = pickPowerUpSpawnSpot([steelSpot]);
    
            return {
              openTiles,
              candidateTiles,
              nonRepeatTile: nonRepeatPick ? powerUpPixelToTilePoint(nonRepeatPick) : null,
              fallbackTile: fallback ? powerUpPixelToTilePoint(fallback) : null
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugPowerUpSpawnRandomProbe(count) {
          const previous = {
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            powerUp: game.powerUp,
            lastPowerUpSpawn: game.lastPowerUpSpawn,
            powerUpSpawnBag: game.powerUpSpawnBag.slice(),
            powerUpSpawnBagKey: game.powerUpSpawnBagKey
          };
          const spots = [
            { x: 2 * TILE + 2, y: 2 * TILE + 2 },
            { x: 4 * TILE + 2, y: 2 * TILE + 2 },
            { x: 8 * TILE + 2, y: 2 * TILE + 2 },
            { x: 10 * TILE + 2, y: 2 * TILE + 2 }
          ];
    
          try {
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [];
            game.enemies = [];
            game.powerUp = null;
            game.lastPowerUpSpawn = null;
            resetPowerUpSpawnBag();
            const candidateTiles = powerUpSpawnCandidates(spots).map(powerUpPixelToTilePoint);
            const pickCount = Math.max(1, Math.floor(Number(count) || spots.length * 2));
            const picks = [];
            for (let i = 0; i < pickCount; i += 1) {
              const picked = pickPowerUpSpawnSpot(spots, () => 0);
              if (picked) picks.push(powerUpPixelToTilePoint(picked));
            }
    
            return {
              candidateTiles,
              picks,
              candidateCount: candidateTiles.length,
              pickedFromCandidates: picks.every((tile) =>
                candidateTiles.some((candidate) => candidate.x === tile.x && candidate.y === tile.y)
              ),
              uniquePickCount: new Set(picks.map((tile) => `${tile.x},${tile.y}`)).size,
              immediateRepeats: picks.some((tile, index) =>
                index > 0 && tile.x === picks[index - 1].x && tile.y === picks[index - 1].y
              )
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugPowerUpSpawnRotationProbe(count) {
          return this.debugPowerUpSpawnRandomProbe(count);
        },
        debugCarrierSpawnClearsPowerUpProbe(carrier) {
          const previousPowerUp = game.powerUp;
          game.powerUp = { type: "helmet", x: 0, y: 0, w: POWERUP_SIZE, h: POWERUP_SIZE, ttl: 0 };
          const cleared = clearPowerUpForCarrierSpawn(carrier !== false);
          const result = {
            cleared,
            hasPowerUp: Boolean(game.powerUp),
            rule: gameSettings().powerUpRules.clearUncollectedOnCarrierSpawn
          };
          game.powerUp = previousPowerUp;
          return result;
        },
        debugGrenadeScoreProbe() {
          const previousEnemyDestroy = { active: enemyDestroyAudio.active, frame: enemyDestroyAudio.frame };
          const previousPlayers = game.players;
          const previousEnemies = game.enemies;
          const previousEnemyKilled = game.enemyKilled;
          const previousExplosions = game.explosions;
          const previousScorePopups = game.scorePopups;
          const previousHighScore = game.highScore;
          const types = enemyTypeDefinitions();
          const player = {
            id: 1,
            score: 1000,
            stagePoints: 0,
            stageKills: Array(types.length).fill(0),
            totalKills: Array(types.length).fill(0),
            nextBonusLifeIndex: 0,
            lives: 2
          };
    
          game.players = [player];
          game.enemies = [0, Math.min(2, types.length - 1)].map((typeIndex, index) => ({
            alive: true,
            hp: 1,
            typeIndex,
            score: types[typeIndex].score,
            x: 32 + index * 16,
            y: 32
          }));
          game.enemyKilled = 0;
          game.explosions = [];
          game.scorePopups = [];
          stopEnemyDestroyAudio();
    
          try {
            applyPowerUp(player, "grenade");
            const beforeRelease = {
              enemyKilled: game.enemyKilled,
              aliveEnemies: game.enemies.filter((enemy) => enemy.alive).length,
              destroyingEnemies: game.enemies.filter((enemy) => enemy.destroying).length
            };
            for (let tick = 0; tick < explosionRule("enemyDestroy").ttl + ENEMY_DESTRUCTION_SCORE_TICKS; tick += 1) {
              updateEnemies();
            }
            return {
              scoreGain: player.score - 1000,
              pickupScore: gameSettings().powerUpRules.pickupScore,
              stagePoints: player.stagePoints,
              stageKills: player.stageKills.slice(),
              totalKills: player.totalKills.slice(),
              beforeRelease,
              enemyKilled: game.enemyKilled,
              aliveEnemies: game.enemies.filter((enemy) => enemy.alive).length
            };
          } finally {
            game.players = previousPlayers;
            game.enemies = previousEnemies;
            game.enemyKilled = previousEnemyKilled;
            game.explosions = previousExplosions;
            game.scorePopups = previousScorePopups;
            game.highScore = previousHighScore;
            stopEnemyDestroyAudio();
            enemyDestroyAudio.active = previousEnemyDestroy.active;
            enemyDestroyAudio.frame = previousEnemyDestroy.frame;
            syncEnemyDestroyAudioNodes();
          }
        },
        debugGrenadeSpawnProtectionProbe() {
          const previousEnemyDestroy = { active: enemyDestroyAudio.active, frame: enemyDestroyAudio.frame };
          const previous = {
            players: game.players,
            enemies: game.enemies,
            enemyKilled: game.enemyKilled,
            explosions: game.explosions,
            scorePopups: game.scorePopups,
            highScore: game.highScore
          };
          const types = enemyTypeDefinitions();
          const player = {
            id: 1,
            x: 64,
            y: 64,
            w: 14,
            h: 14,
            score: 0,
            stagePoints: 0,
            stageKills: Array(types.length).fill(0),
            totalKills: Array(types.length).fill(0),
            nextBonusLifeIndex: 0,
            lives: 2
          };
          const makeEnemy = (id, spawnFlash) => ({
            id,
            alive: true,
            hp: 1,
            spawnFlash,
            typeIndex: 0,
            score: types[0].score,
            x: 32 + id * 16,
            y: 32,
            w: 14,
            h: 14
          });
          const active = makeEnemy(0, 0);
          const spawning = makeEnemy(1, 12);
          try {
            stopEnemyDestroyAudio();
            game.players = [player];
            game.enemies = [active, spawning];
            game.enemyKilled = 0;
            game.explosions = [];
            game.scorePopups = [];
            applyPowerUp(player, "grenade");
            const beforeRelease = {
              activeAlive: active.alive,
              activeDestroying: active.destroying,
              spawningAlive: spawning.alive,
              spawningHp: spawning.hp,
              spawningFlash: spawning.spawnFlash,
              enemyKilled: game.enemyKilled,
              explosionCount: game.explosions.length
            };
            for (let tick = 0; tick < explosionRule("enemyDestroy").ttl + ENEMY_DESTRUCTION_SCORE_TICKS; tick += 1) {
              updateEnemies();
            }
            return {
              activeAlive: active.alive,
              activeDestroying: active.destroying,
              spawningAlive: beforeRelease.spawningAlive,
              spawningHp: beforeRelease.spawningHp,
              spawningFlash: beforeRelease.spawningFlash,
              spawningFlashAfterLifecycle: spawning.spawnFlash,
              enemyKilled: game.enemyKilled,
              explosionCount: game.explosions.length,
              beforeRelease,
              stageKills: player.stageKills.slice(),
              totalKills: player.totalKills.slice()
            };
          } finally {
            Object.assign(game, previous);
            stopEnemyDestroyAudio();
            enemyDestroyAudio.active = previousEnemyDestroy.active;
            enemyDestroyAudio.frame = previousEnemyDestroy.frame;
            syncEnemyDestroyAudioNodes();
          }
        },
        debugScorePopupProbe() {
          const previousEnemyDestroy = { active: enemyDestroyAudio.active, frame: enemyDestroyAudio.frame };
          const previousPlayers = game.players;
          const previousEnemies = game.enemies;
          const previousEnemyKilled = game.enemyKilled;
          const previousExplosions = game.explosions;
          const previousScorePopups = game.scorePopups;
          const previousHighScore = game.highScore;
          const types = enemyTypeDefinitions();
          const armorIndex = Math.min(3, types.length - 1);
          const player = {
            id: 1,
            kind: "player",
            x: 72,
            y: 72,
            w: 14,
            h: 14,
            score: 0,
            stagePoints: 0,
            stageKills: Array(types.length).fill(0),
            totalKills: Array(types.length).fill(0),
            nextBonusLifeIndex: 0,
            lives: 2,
            level: 0,
            invuln: 0,
            alive: true
          };
          const enemy = {
            alive: true,
            hp: 1,
            typeIndex: armorIndex,
            score: types[armorIndex].score,
            x: 64,
            y: 64,
            w: 14,
            h: 14
          };
    
          try {
            stopEnemyDestroyAudio();
            game.players = [player];
            game.enemies = [enemy];
            game.enemyKilled = 0;
            game.explosions = [];
            game.scorePopups = [];
            destroyEnemy(enemy, player.id);
            const enemyScoreAward = {
              score: player.score,
              stagePoints: player.stagePoints,
              stageKills: player.stageKills.slice()
            };
            enemy.destroyTicks = enemy.destroyExplosionTicks;
            const enemyPresentation = enemyDestructionPresentation(enemy);
            const enemyPopup = game.scorePopups[0] ? { ...game.scorePopups[0] } : null;
    
            game.scorePopups = [];
            applyPowerUp(player, "star");
            const pickupPopup = game.scorePopups[0] ? { ...game.scorePopups[0] } : null;
    
            game.scorePopups = [];
            game.enemies = [0, Math.min(2, types.length - 1)].map((typeIndex, index) => ({
              alive: true,
              hp: 1,
              typeIndex,
              score: types[typeIndex].score,
              x: 32 + index * 16,
              y: 32,
              w: 14,
              h: 14
            }));
            applyPowerUp(player, "grenade");
            const grenadePopups = game.scorePopups.map((popup) => ({ ...popup }));
    
            updateScorePopups();
            const afterUpdate = game.scorePopups.map((popup) => ({ ...popup }));
    
            return {
              enemyPopup,
              enemyScoreAward,
              enemyPresentation,
              pickupPopup,
              grenadePopups,
              afterUpdate,
              pickupScore: gameSettings().powerUpRules.pickupScore,
              armorScore: types[armorIndex].score
            };
          } finally {
            game.players = previousPlayers;
            game.enemies = previousEnemies;
            game.enemyKilled = previousEnemyKilled;
            game.explosions = previousExplosions;
            game.scorePopups = previousScorePopups;
            game.highScore = previousHighScore;
            stopEnemyDestroyAudio();
            enemyDestroyAudio.active = previousEnemyDestroy.active;
            enemyDestroyAudio.frame = previousEnemyDestroy.frame;
            syncEnemyDestroyAudioNodes();
          }
        },
        debugPausedScorePopupProbe() {
          const previous = { ...game };
          try {
            preparePausedDebugBattle(27);
            game.scorePopups = [{ value: 500, x: 64, y: 64, ttl: 2, max: 2, style: "powerUp" }];
            update();
            const afterOneFrame = { tick: game.tick, ttl: game.scorePopups[0] ? game.scorePopups[0].ttl : 0 };
            update();
            return {
              afterOneFrame,
              afterTwoFrames: { tick: game.tick, popupCount: game.scorePopups.length }
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugStarUpgradeProbe() {
          const previousPlayerDestroy = { active: playerDestroyAudio.active, frame: playerDestroyAudio.frame };
          const previousExplosions = game.explosions;
          const previousScorePopups = game.scorePopups;
          const previousHighScore = game.highScore;
          const player = {
            id: 1,
            score: 0,
            stagePoints: 0,
            stageKills: Array(enemyTypeDefinitions().length).fill(0),
            totalKills: Array(enemyTypeDefinitions().length).fill(0),
            nextBonusLifeIndex: 0,
            lives: 2,
            level: 0,
            invuln: 0,
            alive: true,
            x: 16,
            y: 16
          };
          const tiers = [];
    
          try {
            stopPlayerDestroyAudio();
            game.explosions = [];
            game.scorePopups = [];
            for (let i = 0; i < 4; i += 1) {
              const rule = playerUpgradeRule(player.level);
              tiers.push({
                level: player.level,
                maxBullets: rule.maxBullets,
                bulletSpeed: rule.bulletSpeed,
                wallPower: rule.wallPower
              });
              applyPowerUp(player, "star");
            }
            const cappedRule = playerUpgradeRule(player.level);
            const beforeDeathLevel = player.level;
            const cappedLevel = player.level;
            killPlayer(player);
            return {
              tiers,
              capped: {
                level: cappedLevel,
                beforeDeathLevel,
                maxBullets: cappedRule.maxBullets,
                bulletSpeed: cappedRule.bulletSpeed,
                wallPower: cappedRule.wallPower
              },
              afterDeath: {
                alive: player.alive,
                destroying: player.destroying,
                lives: player.lives,
                level: player.level,
                respawn: player.respawn || 0
              },
              powerTankBulletSpeed: enemyTypeDefinitions()[2].bullet,
              pickupScore: gameSettings().powerUpRules.pickupScore
            };
          } finally {
            stopPlayerDestroyAudio();
            game.explosions = previousExplosions;
            game.scorePopups = previousScorePopups;
            game.highScore = previousHighScore;
            playerDestroyAudio.active = previousPlayerDestroy.active;
            playerDestroyAudio.frame = previousPlayerDestroy.frame;
            syncPlayerDestroyAudioNodes();
            syncEnemyDestroyAudioNodes();
          }
        },
        debugPlayerUpgradeVisualProbe(level) {
          const value = clamp(Math.floor(Number(level) || 0), 0, 3);
          const tank = {
            kind: "player",
            id: 1,
            x: 16,
            y: 16,
            w: 14,
            h: 14,
            dir: UP,
            level: value,
            stun: 0
          };
          const parts = playerUpgradeOverlayParts(value, UP);
          drawTank(tank, "#e3c64e", "#fff0a8");
          return {
            level: value,
            overlayParts: parts.length,
            overlaySignature: parts.map((part) => `${part.role}:${part.rect.join(",")}`).join(";"),
            maxPowerColor: PLAYER_UPGRADE_OVERLAY_COLORS.level3,
            maxPowerParts: parts.filter((part) => part.role === "level3").length
          };
        },
        debugStarSurvivabilityProbe() {
          const previousPlayerDestroy = { active: playerDestroyAudio.active, frame: playerDestroyAudio.frame };
          const previousPlayers = game.players;
          const previousExplosions = game.explosions;
          const player = {
            id: 1,
            kind: "player",
            x: 16,
            y: 16,
            w: 14,
            h: 14,
            alive: true,
            invuln: 0,
            lives: 2,
            respawn: 0,
            spawnFlash: 0,
            level: 3,
            score: 0,
            stagePoints: 0,
            stageKills: Array(enemyTypeDefinitions().length).fill(0),
            totalKills: Array(enemyTypeDefinitions().length).fill(0),
            nextBonusLifeIndex: 0
          };
          const bullet = {
            x: 18,
            y: 18,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            dir: LEFT,
            ownerKind: "enemy",
            ownerId: 100,
            ownerKey: "enemy:100",
            remove: false
          };
    
          try {
            stopPlayerDestroyAudio();
            game.players = [player];
            game.explosions = [];
            hitTank(bullet);
            return {
              level: player.level,
              alive: player.alive,
              lives: player.lives,
              respawn: player.respawn || 0,
              bulletRemoved: bullet.remove
            };
          } finally {
            stopPlayerDestroyAudio();
            game.players = previousPlayers;
            game.explosions = previousExplosions;
            playerDestroyAudio.active = previousPlayerDestroy.active;
            playerDestroyAudio.frame = previousPlayerDestroy.frame;
            syncPlayerDestroyAudioNodes();
            syncEnemyDestroyAudioNodes();
          }
        },
        debugPlayerDeathRespawnProbe() {
          const previousPlayerDestroy = { active: playerDestroyAudio.active, frame: playerDestroyAudio.frame };
          const previous = {
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            bullets: game.bullets,
            explosions: game.explosions,
            powerUp: game.powerUp,
            playerCount: game.playerCount,
            tick: game.tick,
            frameLow: game.frameLow,
            frameHigh: game.frameHigh
          };
          const previousKeys = Array.from(keys);
          const makePlayer = (lives) => {
            const player = createPlayer(1);
            player.lives = lives;
            player.level = 3;
            player.alive = true;
            player.respawn = 0;
            player.spawnFlash = 0;
            player.invuln = 0;
            player.stun = 0;
            player.reload = 0;
            player.slide = 0;
            return player;
          };
    
          try {
            stopPlayerDestroyAudio();
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.enemies = [];
            game.bullets = [];
            game.explosions = [];
            game.powerUp = null;
            game.playerCount = 1;
            game.tick = 0;
            game.frameLow = 0;
            game.frameHigh = 0;
            keys.clear();
    
            const player = makePlayer(2);
            game.players = [player];
            killPlayer(player);
            const afterHit = {
              alive: player.alive,
              destroying: player.destroying,
              lives: player.lives,
              level: player.level,
              respawn: player.respawn,
              spawnFlash: player.spawnFlash,
              invuln: player.invuln
            };
    
            let deathDisplayFrames = 0;
            const deathPresentations = [];
            while (!player.alive && player.respawn > 0 && deathDisplayFrames < 1000) {
              deathPresentations.push(playerDestructionPresentation(player));
              game.tick += 1;
              game.frameLow = (game.frameLow + 1) & 0xff;
              deathDisplayFrames += 1;
              updatePlayers();
            }
            const deathResolved = {
              tick: game.tick,
              alive: player.alive,
              destroying: player.destroying,
              lives: player.lives,
              respawn: player.respawn,
              spawnFlash: player.spawnFlash,
              invuln: player.invuln
            };
    
            let spawnDisplayFrames = 0;
            while (player.spawnFlash > 0 && spawnDisplayFrames < 1000) {
              game.tick += 1;
              game.frameLow = (game.frameLow + 1) & 0xff;
              spawnDisplayFrames += 1;
              updatePlayers();
            }
            const activated = {
              tick: game.tick,
              alive: player.alive,
              lives: player.lives,
              respawn: player.respawn,
              spawnFlash: player.spawnFlash,
              invuln: player.invuln
            };
    
            const lastLifePlayer = makePlayer(1);
            game.players = [lastLifePlayer];
            game.tick = 0;
            game.frameLow = 0;
            game.frameHigh = 0;
            killPlayer(lastLifePlayer);
            let lastLifeDisplayFrames = 0;
            while (lastLifePlayer.respawn > 0 && lastLifeDisplayFrames < 1000) {
              game.tick += 1;
              game.frameLow = (game.frameLow + 1) & 0xff;
              lastLifeDisplayFrames += 1;
              updatePlayers();
            }
    
            return {
              deathTicks: gameSettings().timings.playerRespawn,
              spawnTicks: gameSettings().timings.playerSpawnFlash,
              afterHit,
              deathDisplayFrames,
              destructionExplosionFrames: deathPresentations.filter((presentation) => presentation.kind === "explosion").length,
              destructionFinalFrames: deathPresentations.filter((presentation) => presentation.kind === "final").length,
              destructionPhases: deathPresentations
                .map((presentation) => presentation.phase)
                .filter((phase, index, phases) => index === 0 || phase !== phases[index - 1]),
              deathResolved,
              spawnDisplayFrames,
              totalDisplayFrames: deathDisplayFrames + spawnDisplayFrames,
              activated,
              lastLife: {
                displayFrames: lastLifeDisplayFrames,
                alive: lastLifePlayer.alive,
                destroying: lastLifePlayer.destroying,
                lives: lastLifePlayer.lives,
                respawn: lastLifePlayer.respawn
              }
            };
          } finally {
            stopPlayerDestroyAudio();
            keys.clear();
            for (const key of previousKeys) keys.add(key);
            Object.assign(game, previous);
            playerDestroyAudio.active = previousPlayerDestroy.active;
            playerDestroyAudio.frame = previousPlayerDestroy.frame;
            syncPlayerDestroyAudioNodes();
            syncEnemyDestroyAudioNodes();
          }
        },
        debugPlayerGameOverMessageProbe() {
          const previous = {
            screen: game.screen,
            paused: game.paused,
            pauseElapsed: game.pauseElapsed,
            demoMode: game.demoMode,
            tick: game.tick,
            frameLow: game.frameLow,
            frameHigh: game.frameHigh,
            playerCount: game.playerCount,
            players: game.players,
            enemies: game.enemies,
            enemySpawned: game.enemySpawned,
            enemyKilled: game.enemyKilled,
            base: game.base,
            clearPendingTimer: game.clearPendingTimer,
            playerGameOverMessage: game.playerGameOverMessage
          };
          const state = () => {
            const message = game.playerGameOverMessage;
            return message
              ? {
                playerId: message.playerId,
                timer: message.timer,
                x: message.x,
                y: message.y,
                dx: message.dx,
                presentation: playerGameOverMessagePresentation()
              }
              : null;
          };
          const setup = (eliminatedId, partnerLives) => {
            const p1 = createPlayer(1);
            const p2 = createPlayer(2);
            for (const player of [p1, p2]) {
              player.spawnFlash = 0;
              player.invuln = 0;
              player.respawn = 0;
              player.destroying = false;
            }
            const eliminated = eliminatedId === 2 ? p2 : p1;
            const partner = eliminatedId === 2 ? p1 : p2;
            eliminated.alive = false;
            eliminated.destroying = true;
            eliminated.lives = 1;
            partner.lives = Math.max(0, Math.floor(Number(partnerLives) || 0));
            partner.alive = partner.lives > 0;
            game.screen = "playing";
            game.paused = false;
            game.pauseElapsed = 0;
            game.demoMode = false;
            game.tick = 0x123;
            game.frameLow = 0x23;
            game.frameHigh = 0x45;
            game.playerCount = 2;
            game.players = [p1, p2];
            game.enemies = [];
            game.enemySpawned = 0;
            game.enemyKilled = 0;
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.clearPendingTimer = 0;
            game.playerGameOverMessage = null;
            finishPlayerDeath(eliminated);
            return { eliminated, partner, baseTick: game.tick, baseFrameHigh: game.frameHigh };
          };
          const run = (playerId) => {
            const context = setup(playerId, 2);
            const initial = { ...state(), frameLow: game.frameLow, frameHigh: game.frameHigh };
            const frames = [];
            const sampleFrames = new Set([0, 15, 16, 31, 32, 47, 48, 191, 192]);
            for (let frame = 0; frame <= 192; frame += 1) {
              game.tick = context.baseTick + frame;
              game.frameLow = frame & 0xff;
              updatePlayerGameOverMessage();
              if (sampleFrames.has(frame)) frames.push({ frame, ...state() });
            }
            return {
              initial,
              frames,
              eliminatedLives: context.eliminated.lives,
              partnerAlive: context.partner.alive
            };
          };
    
          try {
            const p1 = run(1);
            const p2 = run(2);
    
            setup(1, 2);
            game.paused = true;
            const pausedBefore = { ...state(), frameLow: game.frameLow, frameHigh: game.frameHigh };
            update();
            const pausedAfter = { ...state(), frameLow: game.frameLow, frameHigh: game.frameHigh };
    
            setup(1, 2);
            game.enemySpawned = enemyTotal();
            checkEndState();
            const clearDelay = {
              screen: game.screen,
              timer: game.clearPendingTimer,
              tick: game.tick,
              frameLow: game.frameLow,
              frameHigh: game.frameHigh,
              message: state()
            };
    
            setup(1, 0);
            const noSurvivingPartner = state();
    
            game.players = [game.players[0]];
            game.playerGameOverMessage = null;
            const solo = game.players[0];
            solo.lives = 1;
            solo.alive = false;
            solo.destroying = true;
            finishPlayerDeath(solo);
            const onePlayer = state();
    
            setup(1, 2);
            enterGameOver();
            const commonGameOver = {
              screen: game.screen,
              frameLow: game.frameLow,
              frameHigh: game.frameHigh,
              message: state()
            };
    
            return {
              initialTimer: PLAYER_GAME_OVER_MESSAGE_TIMER,
              moveThreshold: PLAYER_GAME_OVER_MESSAGE_MOVE_THRESHOLD,
              stageEndDelay: PLAYER_GAME_OVER_STAGE_END_DELAY,
              p1,
              p2,
              pausedBefore,
              pausedAfter,
              clearDelay,
              noSurvivingPartner,
              onePlayer,
              commonGameOver
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugRenderPlayerGameOverMessage(playerId, elapsed) {
          const previous = {
            paused: game.paused,
            demoMode: game.demoMode,
            tick: game.tick,
            frameLow: game.frameLow,
            frameHigh: game.frameHigh,
            playerGameOverMessage: game.playerGameOverMessage
          };
          const id = playerId === 2 ? 2 : 1;
          const frame = clamp(Math.floor(Number(elapsed) || 0), 0, 191);
          try {
            game.paused = false;
            game.demoMode = false;
            game.playerGameOverMessage = {
              playerId: id,
              timer: PLAYER_GAME_OVER_MESSAGE_TIMER,
              x: id === 2 ? 0xc0 : 0x20,
              y: PLAYER_GAME_OVER_MESSAGE_Y,
              dx: id === 2 ? -1 : 1
            };
            for (let current = 0; current <= frame; current += 1) {
              game.tick = current;
              game.frameLow = current & 0xff;
              updatePlayerGameOverMessage();
            }
            const presentation = playerGameOverMessagePresentation();
            renderPlayerGameOverMessage();
            return presentation;
          } finally {
            Object.assign(game, previous);
          }
        },
        debugLifeAwardProbe() {
          const previousHighScore = game.highScore;
          const previousScorePopups = game.scorePopups;
          const previousDemoMode = game.demoMode;
          const previousPowerUp = game.powerUp;
          const previousBonusLife = {
            active: bonusLifeAudio.active,
            frame: bonusLifeAudio.frame
          };
          const previousPowerUpPickup = {
            active: powerUpPickupAudio.active,
            frame: powerUpPickupAudio.frame
          };
          const threshold = gameSettings().bonusLifeScores[0];
          const player = {
            id: 1,
            score: Math.max(0, threshold - 1),
            stagePoints: 0,
            stageKills: Array(enemyTypeDefinitions().length).fill(0),
            totalKills: Array(enemyTypeDefinitions().length).fill(0),
            nextBonusLifeIndex: 0,
            lives: 1,
            level: 0,
            invuln: 0,
            alive: true
          };
          const tankPlayer = {
            ...player,
            score: 0,
            lives: 1,
            nextBonusLifeIndex: 0
          };
    
          try {
            stopBonusLifeAudio();
            stopPowerUpPickupAudio();
            game.demoMode = false;
            game.scorePopups = [];
            addPlayerScore(player, 0);
            const beforeCrossing = { score: player.score, lives: player.lives, nextBonusLifeIndex: player.nextBonusLifeIndex };
            addPlayerScore(player, 1);
            const afterCrossing = { score: player.score, lives: player.lives, nextBonusLifeIndex: player.nextBonusLifeIndex };
            const thresholdAudio = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
            addPlayerScore(player, 1);
            const afterRepeat = { score: player.score, lives: player.lives, nextBonusLifeIndex: player.nextBonusLifeIndex };
            stopBonusLifeAudio();
            const tankPowerUp = { type: "tank", x: 32, y: 48, w: POWERUP_SIZE, h: POWERUP_SIZE, ttl: 0 };
            game.powerUp = tankPowerUp;
            collectPowerUp(tankPlayer, tankPowerUp);
            const tankAudio = { active: bonusLifeAudio.active, frame: bonusLifeAudio.frame };
            const tankPickupAudio = {
              active: powerUpPickupAudio.active,
              frame: powerUpPickupAudio.frame,
              audible: powerUpPickupAudioAudible()
            };
            return {
              threshold,
              pickupScore: gameSettings().powerUpRules.pickupScore,
              beforeCrossing,
              afterCrossing,
              afterRepeat,
              thresholdAudio,
              tankAudio,
              tankPickupAudio,
              tank: {
                score: tankPlayer.score,
                lives: tankPlayer.lives
              }
            };
          } finally {
            stopBonusLifeAudio();
            stopPowerUpPickupAudio();
            game.demoMode = previousDemoMode;
            game.powerUp = previousPowerUp;
            bonusLifeAudio.active = previousBonusLife.active;
            bonusLifeAudio.frame = previousBonusLife.frame;
            powerUpPickupAudio.active = previousPowerUpPickup.active;
            powerUpPickupAudio.frame = previousPowerUpPickup.frame;
            syncBonusLifeAudioNodes();
            syncPowerUpPickupAudioNodes();
            syncMovementAudio();
            game.highScore = previousHighScore;
            game.scorePopups = previousScorePopups;
          }
        },
        debugHelmetProtectionProbe() {
          const previousPlayerDestroy = { active: playerDestroyAudio.active, frame: playerDestroyAudio.frame };
          const previousPlayers = game.players;
          const previousExplosions = game.explosions;
          const previousScorePopups = game.scorePopups;
          const previousHighScore = game.highScore;
          const makePlayer = () => ({
            id: 1,
            kind: "player",
            x: 16,
            y: 16,
            w: 14,
            h: 14,
            alive: true,
            invuln: 0,
            lives: 2,
            respawn: 0,
            level: 0,
            score: 0,
            stagePoints: 0,
            stageKills: Array(enemyTypeDefinitions().length).fill(0),
            totalKills: Array(enemyTypeDefinitions().length).fill(0),
            nextBonusLifeIndex: 0
          });
          const makeBullet = () => ({
            x: 18,
            y: 18,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            dir: LEFT,
            ownerKind: "enemy",
            ownerId: 100,
            ownerKey: "enemy:100",
            remove: false
          });
    
          try {
            stopPlayerDestroyAudio();
            game.explosions = [];
            game.scorePopups = [];
            const unprotectedPlayer = makePlayer();
            const unprotectedBullet = makeBullet();
            game.players = [unprotectedPlayer];
            hitTank(unprotectedBullet);
    
            const protectedPlayer = makePlayer();
            applyPowerUp(protectedPlayer, "helmet");
            const protectedBullet = makeBullet();
            game.players = [protectedPlayer];
            hitTank(protectedBullet);
    
            return {
              duration: gameSettings().powerUpDurations.helmet,
              pickupScore: gameSettings().powerUpRules.pickupScore,
              unprotected: {
                alive: unprotectedPlayer.alive,
                lives: unprotectedPlayer.lives,
                bulletRemoved: unprotectedBullet.remove
              },
              protected: {
                alive: protectedPlayer.alive,
                lives: protectedPlayer.lives,
                invuln: protectedPlayer.invuln,
                score: protectedPlayer.score,
                bulletRemoved: protectedBullet.remove,
                explosions: game.explosions.length
              }
            };
          } finally {
            stopPlayerDestroyAudio();
            game.players = previousPlayers;
            game.explosions = previousExplosions;
            game.scorePopups = previousScorePopups;
            game.highScore = previousHighScore;
            playerDestroyAudio.active = previousPlayerDestroy.active;
            playerDestroyAudio.frame = previousPlayerDestroy.frame;
            syncPlayerDestroyAudioNodes();
            syncEnemyDestroyAudioNodes();
          }
        },
        debugEnemyBulletPlayerCollisionProbe() {
          const previousPlayerDestroy = { active: playerDestroyAudio.active, frame: playerDestroyAudio.frame };
          const previous = {
            players: game.players,
            explosions: game.explosions
          };
          const makePlayer = (invuln) => ({
            kind: "player",
            id: 1,
            x: 64,
            y: 64,
            w: 14,
            h: 14,
            alive: true,
            lives: 2,
            respawn: 0,
            spawnFlash: 0,
            invuln,
            stun: 0,
            level: 0
          });
          const makeBullet = (centerDx, centerDy) => ({
            x: 64 + 7 + centerDx - gameSettings().projectileRules.bulletSize / 2,
            y: 64 + 7 + centerDy - gameSettings().projectileRules.bulletSize / 2,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            ownerKind: "enemy",
            ownerId: 100,
            ownerKey: "enemy:100",
            remove: false
          });
          const run = (invuln, centerDx, centerDy) => {
            const player = makePlayer(invuln);
            const bullet = makeBullet(centerDx, centerDy);
            game.players = [player];
            game.explosions = [];
            hitTank(bullet);
            const explosionDetails = game.explosions.map((explosion) => ({
              x: explosion.x,
              y: explosion.y,
              ttl: explosion.ttl,
              style: explosion.style
            }));
            return {
              bulletRemoved: bullet.remove,
              alive: player.alive,
              destroying: Boolean(player.destroying),
              respawn: player.respawn,
              explosions: explosionDetails.length,
              explosionDetails
            };
          };
          try {
            stopPlayerDestroyAudio();
            return {
              protected: run(1, 0, 0),
              positiveNine: run(0, 9, 9),
              negativeNine: run(0, -9, -9),
              positiveTen: run(0, 10, 0),
              negativeTen: run(0, -10, 0)
            };
          } finally {
            stopPlayerDestroyAudio();
            Object.assign(game, previous);
            playerDestroyAudio.active = previousPlayerDestroy.active;
            playerDestroyAudio.frame = previousPlayerDestroy.frame;
            syncPlayerDestroyAudioNodes();
            syncEnemyDestroyAudioNodes();
          }
        },
        debugPlayerBulletEnemyCollisionProbe() {
          const previousEnemyHit = { active: enemyHitAudio.active, frame: enemyHitAudio.frame };
          const previousEnemyDestroy = { active: enemyDestroyAudio.active, frame: enemyDestroyAudio.frame };
          const previousPlayerDestroy = { active: playerDestroyAudio.active, frame: playerDestroyAudio.frame };
          const previous = {
            players: game.players,
            enemies: game.enemies,
            enemyKilled: game.enemyKilled,
            explosions: game.explosions
          };
          const type = enemyTypeDefinitions()[0];
          const makeEnemy = (spawnFlash, hp) => ({
            kind: "enemy",
            id: 100,
            x: 64,
            y: 64,
            w: 14,
            h: 14,
            alive: true,
            hp,
            spawnFlash,
            carrier: false,
            typeIndex: 0,
            score: type.score
          });
          const makeBullet = (centerDx, centerDy) => ({
            x: 64 + 7 + centerDx - gameSettings().projectileRules.bulletSize / 2,
            y: 64 + 7 + centerDy - gameSettings().projectileRules.bulletSize / 2,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            ownerKind: "player",
            ownerId: 1,
            ownerKey: "player:1",
            remove: false
          });
          const run = (spawnFlash, centerDx, centerDy, hp) => {
            const enemy = makeEnemy(spawnFlash, hp === undefined ? 1 : hp);
            const bullet = makeBullet(centerDx, centerDy);
            game.players = [];
            game.enemies = [enemy];
            game.enemyKilled = 0;
            game.explosions = [];
            hitTank(bullet);
            const explosionDetails = game.explosions.map((explosion) => ({
              x: explosion.x,
              y: explosion.y,
              ttl: explosion.ttl,
              style: explosion.style
            }));
            return {
              bulletRemoved: bullet.remove,
              enemyAlive: enemy.alive,
              enemyDestroying: Boolean(enemy.destroying),
              enemyHp: enemy.hp,
              enemyKilled: game.enemyKilled,
              explosions: explosionDetails.length,
              explosionDetails
            };
          };
          try {
            stopEnemyHitAudio();
            stopEnemyDestroyAudio();
            stopPlayerDestroyAudio();
            return {
              positiveNine: run(0, 9, 9),
              negativeNine: run(0, -9, -9),
              positiveTen: run(0, 10, 0),
              negativeTen: run(0, -10, 0),
              spawning: run(12, 0, 0),
              armored: run(0, 9, 9, 2)
            };
          } finally {
            stopEnemyHitAudio();
            stopEnemyDestroyAudio();
            stopPlayerDestroyAudio();
            Object.assign(game, previous);
            enemyHitAudio.active = previousEnemyHit.active;
            enemyHitAudio.frame = previousEnemyHit.frame;
            enemyDestroyAudio.active = previousEnemyDestroy.active;
            enemyDestroyAudio.frame = previousEnemyDestroy.frame;
            playerDestroyAudio.active = previousPlayerDestroy.active;
            playerDestroyAudio.frame = previousPlayerDestroy.frame;
            syncEnemyHitAudioNodes();
            syncEnemyDestroyAudioNodes();
            syncPlayerDestroyAudioNodes();
            syncMovementAudio();
          }
        },
        debugPlayerSpawnLockProbe() {
          const previous = {
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            bullets: game.bullets,
            explosions: game.explosions,
            powerUp: game.powerUp,
            highScore: game.highScore,
            tick: game.tick
          };
          const previousKeys = Array.from(keys);
          const previousFirePresses = Array.from(pendingFirePresses);
          const player = {
            kind: "player",
            id: 1,
            x: 64,
            y: 64,
            w: 14,
            h: 14,
            dir: UP,
            speed: gameSettings().playerMovement.speed,
            alive: true,
            lives: 3,
            nextBonusLifeIndex: 0,
            respawn: 0,
            spawnFlash: gameSettings().timings.playerSpawnFlash,
            invuln: 0,
            stun: 0,
            pendingSnap: false,
            level: 0,
            reload: 0,
            score: 0,
            stagePoints: 0,
            stageKills: Array(enemyTypeDefinitions().length).fill(0),
            totalKills: Array(enemyTypeDefinitions().length).fill(0),
            slide: 0,
            color: "#e3c64e",
            accent: "#fff0a8"
          };
    
          try {
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [player];
            game.enemies = [];
            game.bullets = [];
            game.explosions = [];
            game.powerUp = null;
            game.tick = 1;
            keys.clear();
            keys.add("ArrowRight");
            keys.add("Space");
            pendingFirePresses.clear();
            pendingFirePresses.add("Space");
    
            const before = {
              x: player.x,
              y: player.y,
              dir: player.dir,
              spawnFlash: player.spawnFlash,
              invuln: player.invuln,
              bullets: game.bullets.length
            };
            updatePlayers();
            const locked = {
              x: player.x,
              y: player.y,
              dir: player.dir,
              spawnFlash: player.spawnFlash,
              invuln: player.invuln,
              bullets: game.bullets.length
            };
            const friendlyBullet = () => ({
              x: player.x + 2,
              y: player.y + 2,
              w: gameSettings().projectileRules.bulletSize,
              h: gameSettings().projectileRules.bulletSize,
              dir: RIGHT,
              ownerKind: "player",
              ownerId: 2,
              ownerKey: "player:2",
              remove: false
            });
            const enemyBullet = () => ({
              x: player.x + 2,
              y: player.y + 2,
              w: gameSettings().projectileRules.bulletSize,
              h: gameSettings().projectileRules.bulletSize,
              dir: LEFT,
              ownerKind: "enemy",
              ownerId: 100,
              ownerKey: "enemy:100",
              remove: false
            });
            const spawningFriendlyBullet = friendlyBullet();
            hitTank(spawningFriendlyBullet);
            const friendlyDuringSpawn = {
              stun: player.stun,
              bulletRemoved: spawningFriendlyBullet.remove
            };
            const spawningEnemyBullet = enemyBullet();
            hitTank(spawningEnemyBullet);
            const enemyDuringSpawn = {
              alive: player.alive,
              lives: player.lives,
              invuln: player.invuln,
              bulletRemoved: spawningEnemyBullet.remove
            };
    
            player.spawnFlash = 1;
            game.tick = 3;
            player.reload = 0;
            updatePlayers();
            const activated = {
              x: player.x,
              y: player.y,
              dir: player.dir,
              spawnFlash: player.spawnFlash,
              invuln: player.invuln,
              bullets: game.bullets.length
            };
            game.tick = 4;
            pendingFirePresses.add("Space");
            updatePlayers();
            const released = {
              x: player.x,
              y: player.y,
              dir: player.dir,
              spawnFlash: player.spawnFlash,
              invuln: player.invuln,
              bullets: game.bullets.length
            };
            player.stun = 0;
            const activeFriendlyBullet = friendlyBullet();
            hitTank(activeFriendlyBullet);
            const protectedFriendlyAfterSpawn = {
              stun: player.stun,
              bulletRemoved: activeFriendlyBullet.remove
            };
            const postSpawnInvuln = player.invuln;
            player.invuln = 0;
            const unprotectedFriendlyBullet = friendlyBullet();
            hitTank(unprotectedFriendlyBullet);
            const friendlyAfterProtection = {
              stun: player.stun,
              bulletRemoved: unprotectedFriendlyBullet.remove
            };
            player.invuln = postSpawnInvuln;
            player.stun = 0;
            const activeEnemyBullet = enemyBullet();
            hitTank(activeEnemyBullet);
            const enemyAfterSpawn = {
              alive: player.alive,
              lives: player.lives,
              invuln: player.invuln,
              bulletRemoved: activeEnemyBullet.remove
            };
    
            return {
              duration: gameSettings().timings.playerSpawnFlash,
              before,
              locked,
              activated,
              released,
              friendlyDuringSpawn,
              protectedFriendlyAfterSpawn,
              friendlyAfterProtection,
              enemyDuringSpawn,
              enemyAfterSpawn,
              friendlyFireStunFrames: gameSettings().friendlyFire.enabled ? gameSettings().friendlyFire.stunFrames : 0
            };
          } finally {
            keys.clear();
            for (const key of previousKeys) keys.add(key);
            pendingFirePresses.clear();
            for (const key of previousFirePresses) pendingFirePresses.add(key);
            Object.assign(game, previous);
          }
        },
        debugActiveBulletLimitProbe() {
          const previousBullets = game.bullets;
          const previousPlayerShoot = { active: playerShootAudio.active, frame: playerShootAudio.frame };
          const makePlayer = (level) => ({
            kind: "player",
            id: 1,
            x: 16,
            y: 16,
            w: 14,
            h: 14,
            dir: RIGHT,
            alive: true,
            spawnFlash: 0,
            reload: 0,
            level
          });
          const attempt = (level, shots) => {
            const player = makePlayer(level);
            game.bullets = [];
            const counts = [];
            for (let i = 0; i < shots; i += 1) {
              player.reload = 0;
              shoot(player);
              counts.push(game.bullets.filter((bullet) => bullet.ownerKey === "player:1").length);
            }
            return {
              level,
              maxBullets: playerUpgradeRule(level).maxBullets,
              counts,
              speeds: game.bullets.map((bullet) => bullet.speed),
              powers: game.bullets.map((bullet) => bullet.power)
            };
          };
          const attemptEnemy = (shots) => {
            const type = enemyTypeDefinitions()[2];
            const enemy = {
              kind: "enemy",
              id: 100,
              x: 48,
              y: 16,
              w: 14,
              h: 14,
              dir: DOWN,
              alive: true,
              spawnFlash: 0,
              reload: 0,
              reloadBase: type.reload,
              bulletSpeed: type.bullet,
              bulletPower: type.wallPower
            };
            game.bullets = [];
            const counts = [];
            for (let i = 0; i < shots; i += 1) {
              enemy.reload = 0;
              shoot(enemy);
              counts.push(game.bullets.filter((bullet) => bullet.ownerKey === "enemy:100").length);
            }
            return {
              maxBullets: 1,
              counts,
              speeds: game.bullets.map((bullet) => bullet.speed),
              powers: game.bullets.map((bullet) => bullet.power)
            };
          };
    
          try {
            stopPlayerShootAudio();
            return {
              base: attempt(0, 2),
              upgraded: attempt(2, 3),
              enemy: attemptEnemy(2)
            };
          } finally {
            stopPlayerShootAudio();
            game.bullets = previousBullets;
            playerShootAudio.active = previousPlayerShoot.active;
            playerShootAudio.frame = previousPlayerShoot.frame;
            syncPlayerShootAudioNodes();
            syncMovementIceAudioNodes();
          }
        },
        debugPlayerFireInputProbe() {
          const previous = {
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            bullets: game.bullets,
            explosions: game.explosions,
            powerUp: game.powerUp,
            playerCount: game.playerCount,
            tick: game.tick
          };
          const previousKeys = Array.from(keys);
          const previousFirePresses = Array.from(pendingFirePresses);
          const previousPlayerShoot = { active: playerShootAudio.active, frame: playerShootAudio.frame };
          const player = createPlayer(1);
          const bulletCount = () => game.bullets.filter((bullet) => bullet.ownerKey === "player:1").length;
          const updateWithPress = () => {
            pendingFirePresses.add("Space");
            game.tick += 1;
            updatePlayers();
            return bulletCount();
          };
          const updateWithoutPress = () => {
            game.tick += 1;
            updatePlayers();
            return bulletCount();
          };
    
          try {
            stopPlayerShootAudio();
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [player];
            game.enemies = [];
            game.bullets = [];
            game.explosions = [];
            game.powerUp = null;
            game.playerCount = 1;
            game.tick = 0;
            keys.clear();
            keys.add("Space");
            pendingFirePresses.clear();
            player.x = 64;
            player.y = 64;
            player.spawnX = 64;
            player.spawnY = 64;
            player.alive = true;
            player.respawn = 0;
            player.spawnFlash = 0;
            player.reload = 0;
            player.stun = 0;
            player.level = 0;
    
            const firstPress = updateWithPress();
            game.bullets = [];
            player.reload = 0;
            const heldAfterBulletClears = updateWithoutPress();
            const repressAfterRelease = updateWithPress();
    
            player.reload = 0;
            const fullSlotPress = updateWithPress();
            game.bullets = [];
            player.reload = 0;
            const fullSlotPressAfterClear = updateWithoutPress();
            const fullSlotRepress = updateWithPress();
    
            game.bullets = [];
            player.level = 2;
            player.reload = 0;
            const doubleShotCounts = [updateWithPress(), updateWithPress(), updateWithPress()];
    
            game.bullets = [];
            player.level = 0;
            player.reload = 0;
            player.spawnFlash = 2;
            const spawnPress = updateWithPress();
            player.spawnFlash = 0;
            const spawnPressAfterUnlock = updateWithoutPress();
    
            player.stun = 10;
            player.reload = 0;
            const stunnedPress = updateWithPress();
    
            return {
              firstPress,
              heldAfterBulletClears,
              repressAfterRelease,
              fullSlotPress,
              fullSlotPressAfterClear,
              fullSlotRepress,
              doubleShotCounts,
              spawnPress,
              spawnPressAfterUnlock,
              stunnedPress
            };
          } finally {
            stopPlayerShootAudio();
            keys.clear();
            for (const key of previousKeys) keys.add(key);
            pendingFirePresses.clear();
            for (const key of previousFirePresses) pendingFirePresses.add(key);
            Object.assign(game, previous);
            playerShootAudio.active = previousPlayerShoot.active;
            playerShootAudio.frame = previousPlayerShoot.frame;
            syncPlayerShootAudioNodes();
            syncMovementIceAudioNodes();
          }
        },
        debugCrossingBulletCancelProbe() {
          const previousBullets = game.bullets;
          const previousExplosions = game.explosions;
          const previousGrid = game.grid;
          const previousPlayers = game.players;
          const previousEnemies = game.enemies;
          const speed = 6;
          try {
            game.grid = makeGrid();
            game.players = [];
            game.enemies = [];
            game.explosions = [];
            game.bullets = [
              {
                x: 40,
                y: 80,
                w: gameSettings().projectileRules.bulletSize,
                h: gameSettings().projectileRules.bulletSize,
                dir: RIGHT,
                speed,
                power: 1,
                ownerKind: "player",
                ownerId: 1,
                ownerKey: "player:1"
              },
              {
                x: 46,
                y: 80,
                w: gameSettings().projectileRules.bulletSize,
                h: gameSettings().projectileRules.bulletSize,
                dir: LEFT,
                speed,
                power: 1,
                ownerKind: "enemy",
                ownerId: 100,
                ownerKey: "enemy:100"
              }
            ];
            updateBullets();
            const crossingRemaining = game.bullets.length;
            const crossingPositions = game.bullets.map((bullet) => ({ x: bullet.x, y: bullet.y }));
    
            const makeStaticPair = (difference, sameOwner) => [
              {
                x: 40,
                y: 96,
                w: gameSettings().projectileRules.bulletSize,
                h: gameSettings().projectileRules.bulletSize,
                ownerKey: "player:1",
                remove: false
              },
              {
                x: 40 + difference,
                y: 96,
                w: gameSettings().projectileRules.bulletSize,
                h: gameSettings().projectileRules.bulletSize,
                ownerKey: sameOwner ? "player:1" : "enemy:100",
                remove: false
              }
            ];
            game.bullets = makeStaticPair(5, false);
            resolveBulletCollisions(game.bullets);
            const thresholdFiveCanceled = game.bullets.every((bullet) => bullet.remove);
            game.bullets = makeStaticPair(6, false);
            resolveBulletCollisions(game.bullets);
            const thresholdSixCanceled = game.bullets.some((bullet) => bullet.remove);
            game.bullets = makeStaticPair(0, true);
            resolveBulletCollisions(game.bullets);
            const sameOwnerCanceled = game.bullets.some((bullet) => bullet.remove);
            return {
              remainingBullets: crossingRemaining,
              crossingPositions,
              speed,
              explosionCount: game.explosions.length,
              thresholdFiveCanceled,
              thresholdSixCanceled,
              sameOwnerCanceled
            };
          } finally {
            game.bullets = previousBullets;
            game.explosions = previousExplosions;
            game.grid = previousGrid;
            game.players = previousPlayers;
            game.enemies = previousEnemies;
          }
        },
        debugProjectileRuleProbe() {
          const bullet = createBullet(
            { kind: "player", id: 1, x: 16, y: 16, w: 14, h: 14, dir: RIGHT, bulletSpeed: 2.25, bulletPower: 1 },
            "player:1",
            playerUpgradeRule(0)
          );
          return {
            x: bullet.x,
            y: bullet.y,
            w: bullet.w,
            h: bullet.h,
            speed: bullet.speed,
            power: bullet.power,
            spawnOffset: gameSettings().projectileRules.spawnOffset,
            boundsPadding: gameSettings().projectileRules.boundsPadding
          };
        },
        debugFieldBoundaryBulletProbe() {
          const previousBullets = game.bullets;
          const previousExplosions = game.explosions;
          const previousSteelHit = { active: steelHitAudio.active, frame: steelHitAudio.frame };
          const rules = gameSettings().projectileRules;
          const makeBullet = (x, y, ownerKind) => ({
            x,
            y,
            w: rules.bulletSize,
            h: rules.bulletSize,
            dir: UP,
            speed: 0,
            power: 1,
            ownerKind,
            ownerId: 1,
            ownerKey: `${ownerKind}:1`,
            remove: false
          });
          const cases = [
            ["left", -rules.boundsPadding - 1, FIELD_H / 2],
            ["right", FIELD_W + rules.boundsPadding + 1, FIELD_H / 2],
            ["top", FIELD_W / 2, -rules.boundsPadding - 1],
            ["bottom", FIELD_W / 2, FIELD_H + rules.boundsPadding + 1]
          ];
          try {
            stopSteelHitAudio();
            return ["player", "enemy"].flatMap((ownerKind) => cases.map(([edge, x, y]) => {
              const bullet = makeBullet(x, y, ownerKind);
              game.bullets = [bullet];
              game.explosions = [];
              resolveBullet(bullet);
              const explosion = game.explosions[0] || null;
              return {
                edge,
                ownerKind,
                removed: bullet.remove,
                explosionCount: game.explosions.length,
                explosion: explosion ? { x: explosion.x, y: explosion.y, ttl: explosion.ttl } : null,
                sound: wallHitSoundName(bullet, true, false)
              };
            }));
          } finally {
            stopSteelHitAudio();
            game.bullets = previousBullets;
            game.explosions = previousExplosions;
            steelHitAudio.active = previousSteelHit.active;
            steelHitAudio.frame = previousSteelHit.frame;
            syncSteelHitAudioNodes();
            syncMovementAudio();
          }
        },
        debugTerrainHitSoundProbe() {
          const impacts = [
            { terrain: "brick", wasSteel: false, damaged: true },
            { terrain: "steelBlocked", wasSteel: true, damaged: false },
            { terrain: "steelDestroyed", wasSteel: true, damaged: true }
          ];
          return ["player", "enemy"].flatMap((ownerKind) => impacts.map((impact) => ({
            ownerKind,
            terrain: impact.terrain,
            sound: wallHitSoundName({ ownerKind }, impact.wasSteel, impact.damaged)
          })));
        },
        debugFriendlyFireProbe() {
          return {
            enabled: gameSettings().friendlyFire.enabled,
            stunFrames: gameSettings().friendlyFire.enabled ? gameSettings().friendlyFire.stunFrames : 0
          };
        },
        debugFriendlyFireProtectionProbe() {
          const previous = {
            players: game.players,
            enemies: game.enemies,
            explosions: game.explosions
          };
          const makeTarget = (invuln) => ({
            kind: "player",
            id: 1,
            x: 64,
            y: 64,
            w: 14,
            h: 14,
            alive: true,
            spawnFlash: 0,
            invuln,
            stun: 0
          });
          const makeBullet = (centerDx, centerDy) => ({
            x: 64 + 7 + centerDx - gameSettings().projectileRules.bulletSize / 2,
            y: 64 + 7 + centerDy - gameSettings().projectileRules.bulletSize / 2,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            ownerKind: "player",
            ownerId: 2,
            ownerKey: "player:2",
            remove: false
          });
          const run = (invuln, centerDx, centerDy) => {
            const target = makeTarget(invuln);
            const bullet = makeBullet(centerDx, centerDy);
            game.players = [target];
            game.enemies = [];
            game.explosions = [];
            hitTank(bullet);
            const explosion = game.explosions[0] || null;
            return {
              bulletRemoved: bullet.remove,
              stun: target.stun,
              explosions: game.explosions.length,
              explosion: explosion ? {
                x: explosion.x,
                y: explosion.y,
                ttl: explosion.ttl,
                style: explosion.style
              } : null
            };
          };
          try {
            return {
              protected: run(1, 0, 0),
              positiveNine: run(0, 9, 9),
              negativeNine: run(0, -9, -9),
              positiveTen: run(0, 10, 0),
              negativeTen: run(0, -10, 0)
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugPlayerMovementCadenceProbe() {
          const previousTick = game.tick;
          try {
            const frames = [];
            for (let tick = 0; tick < 8; tick += 1) {
              game.tick = tick;
              frames.push({ tick, active: isPlayerMovementFrame(tick) });
            }
            return {
              speed: gameSettings().playerMovement.speed,
              cadence: gameSettings().playerMovement.frameCadence.slice(),
              frames,
              activeFrames: frames.filter((frame) => frame.active).length,
              distanceOverEightFrames: frames.filter((frame) => frame.active).length * gameSettings().playerMovement.speed
            };
          } finally {
            game.tick = previousTick;
          }
        },
        debugTankTrackAnimationProbe() {
          const previous = {
            tick: game.tick,
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies
          };
          try {
            game.tick = 0;
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.enemies = [];
    
            const player = createPlayer(1);
            Object.assign(player, {
              x: 32,
              y: 32,
              dir: RIGHT,
              alive: true,
              respawn: 0,
              spawnFlash: 0,
              invuln: 0,
              stun: 0,
              slide: 0,
              trackPhase: 0
            });
            game.players = [player];
            const playerInitial = { x: player.x, phase: player.trackPhase, frame: tankTrackFrameName(player) };
            updatePlayerMovement(player, RIGHT);
            const playerMoved = { x: player.x, phase: player.trackPhase, frame: tankTrackFrameName(player) };
            player.x = 0;
            player.dir = LEFT;
            updatePlayerMovement(player, LEFT);
            const playerBlocked = { x: player.x, phase: player.trackPhase, frame: tankTrackFrameName(player) };
            updatePlayerMovement(player, -1);
            const playerIdle = { x: player.x, phase: player.trackPhase, frame: tankTrackFrameName(player) };
    
            setTile(game.grid, 2, 2, ICE, 15);
            Object.assign(player, { x: 32, y: 32, dir: RIGHT, slide: 2, trackPhase: 0 });
            updatePlayerMovement(player, -1);
            const playerIceCoast = {
              x: player.x,
              slide: player.slide,
              phase: player.trackPhase,
              frame: tankTrackFrameName(player)
            };
    
            game.players = [];
            const enemy = {
              kind: "enemy",
              id: 100,
              slotIndex: 2,
              x: 32,
              y: 48,
              w: 14,
              h: 14,
              dir: RIGHT,
              speed: 1,
              alternateMovement: false,
              blockedPauseTicks: 0,
              pendingTurn: false,
              trackPhase: 0,
              alive: true
            };
            game.enemies = [enemy];
            updateEnemyMovement(enemy, () => 1 / 256);
            const enemyMoved = { x: enemy.x, phase: enemy.trackPhase, frame: tankTrackFrameName(enemy) };
            Object.assign(enemy, { x: FIELD_W - enemy.w, dir: RIGHT, blockedPauseTicks: 0, pendingTurn: false });
            updateEnemyMovement(enemy, () => 1 / 256);
            const enemyBlocked = {
              x: enemy.x,
              phase: enemy.trackPhase,
              frame: tankTrackFrameName(enemy),
              blockedPauseTicks: enemy.blockedPauseTicks
            };
            const renderedTank = {
              kind: "enemy",
              x: 0,
              y: 0,
              dir: UP,
              trackPhase: 1
            };
            drawTank(renderedTank, "#e3c64e", "#fff0a8");
    
            return {
              player: {
                initial: playerInitial,
                moved: playerMoved,
                blocked: playerBlocked,
                idle: playerIdle,
                iceCoast: playerIceCoast
              },
              enemy: { moved: enemyMoved, blocked: enemyBlocked },
              render: {
                x: FIELD_X,
                y: FIELD_Y,
                frame: tankTrackFrameName(renderedTank),
                primary: "#e3c64e",
                shadow: "#111111"
              },
              frames: [
                tankTrackFrameName({ dir: UP, trackPhase: 0 }),
                tankTrackFrameName({ dir: UP, trackPhase: 1 }),
                tankTrackFrameName({ dir: LEFT, trackPhase: 0 }),
                tankTrackFrameName({ dir: LEFT, trackPhase: 1 })
              ]
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugFriendlyFireDurationProbe() {
          let remaining = gameSettings().friendlyFire.stunFrames;
          let displayFrames = 0;
          while (remaining > 0 && displayFrames < 10000) {
            displayFrames += 1;
            if (isPlayerMovementFrame(displayFrames)) remaining -= 1;
          }
          return {
            stunTicks: gameSettings().friendlyFire.stunFrames,
            displayFrames,
            remaining,
            visibility: [0, 7, 8, 15, 16].map((tick) => ({
              tick,
              visible: isPlayerTankVisible({ stun: 1 }, tick)
            }))
          };
        },
        debugFriendlyFireRefreshProbe() {
          const previous = {
            players: game.players,
            enemies: game.enemies,
            bullets: game.bullets,
            explosions: game.explosions
          };
          const target = {
            kind: "player",
            id: 1,
            x: 32,
            y: 32,
            w: 14,
            h: 14,
            alive: true,
            spawnFlash: 0,
            stun: 37
          };
          try {
            game.players = [target];
            game.enemies = [];
            game.bullets = [];
            game.explosions = [];
            const bullet = {
              x: target.x + 2,
              y: target.y + 2,
              w: gameSettings().projectileRules.bulletSize,
              h: gameSettings().projectileRules.bulletSize,
              ownerKind: "player",
              ownerId: 2,
              ownerKey: "player:2",
              remove: false
            };
            hitTank(bullet);
            return { before: 37, after: target.stun, bulletRemoved: bullet.remove };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugPlayerStunProbe() {
          const previousPlayerShoot = { active: playerShootAudio.active, frame: playerShootAudio.frame };
          const player = {
            kind: "player",
            id: 1,
            x: 16,
            y: 16,
            w: 14,
            h: 14,
            dir: UP,
            speed: gameSettings().playerMovement.speed,
            stun: gameSettings().friendlyFire.stunFrames || 1,
            slide: gameSettings().playerMovement.iceSlideFrames,
            pendingSnap: false,
            alive: true,
            reload: 0,
            spawnFlash: 0,
            level: 0
          };
          const before = { x: player.x, y: player.y, dir: player.dir, slide: player.slide };
          updatePlayerMovement(player, RIGHT);
          const previousBullets = game.bullets;
          game.bullets = [];
          stopPlayerShootAudio();
          shoot(player);
          const fired = game.bullets.length === 1;
          game.bullets = previousBullets;
          const result = {
            before,
            after: { x: player.x, y: player.y, dir: player.dir, slide: player.slide, pendingSnap: player.pendingSnap },
            turned: player.dir === RIGHT,
            moved: player.x !== before.x || player.y !== before.y,
            fired
          };
          stopPlayerShootAudio();
          playerShootAudio.active = previousPlayerShoot.active;
          playerShootAudio.frame = previousPlayerShoot.frame;
          syncPlayerShootAudioNodes();
          syncMovementIceAudioNodes();
          return result;
        },
        debugWasdDirectionProbe() {
          const previous = {
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            bullets: game.bullets,
            powerUp: game.powerUp,
            playerCount: game.playerCount,
            tick: game.tick
          };
          const previousKeys = Array.from(keys);
          const makeReadyPlayer = (id, x, y) => {
            const player = createPlayer(id);
            player.x = x;
            player.y = y;
            player.spawnX = x;
            player.spawnY = y;
            player.dir = UP;
            player.alive = true;
            player.respawn = 0;
            player.spawnFlash = 0;
            player.invuln = 0;
            player.stun = 0;
            player.reload = 0;
            player.slide = 0;
            player.pendingSnap = false;
            return player;
          };
    
          try {
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.enemies = [];
            game.bullets = [];
            game.powerUp = null;
            game.tick = 1;
    
            keys.clear();
            game.playerCount = 1;
            const singlePlayer = makeReadyPlayer(1, 32, 32);
            game.players = [singlePlayer];
            const singleBefore = { x: singlePlayer.x, y: singlePlayer.y, dir: singlePlayer.dir };
            keys.add("KeyD");
            updatePlayers();
            const singleAfter = { x: singlePlayer.x, y: singlePlayer.y, dir: singlePlayer.dir };
    
            keys.clear();
            game.playerCount = 2;
            const p1 = makeReadyPlayer(1, 32, 32);
            const p2 = makeReadyPlayer(2, 80, 32);
            game.players = [p1, p2];
            const twoBefore = {
              p1: { x: p1.x, y: p1.y, dir: p1.dir },
              p2: { x: p2.x, y: p2.y, dir: p2.dir }
            };
            keys.add("KeyD");
            updatePlayers();
            const twoAfter = {
              p1: { x: p1.x, y: p1.y, dir: p1.dir },
              p2: { x: p2.x, y: p2.y, dir: p2.dir }
            };
    
            return {
              singleBefore,
              singleAfter,
              twoBefore,
              twoAfter
            };
          } finally {
            keys.clear();
            for (const key of previousKeys) keys.add(key);
            Object.assign(game, previous);
          }
        },
        debugPlayerTurnAlignmentProbe() {
          const previous = {
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies
          };
          const makePlayer = (dir) => {
            const player = createPlayer(1);
            player.x = 67;
            player.y = 70;
            player.dir = dir;
            player.alive = true;
            player.respawn = 0;
            player.spawnFlash = 0;
            player.invuln = 0;
            player.stun = 0;
            player.slide = 0;
            player.pendingSnap = false;
            return player;
          };
          const run = (fromDir, toDir) => {
            const player = makePlayer(fromDir);
            game.players = [player];
            updatePlayerMovement(player, toDir);
            return { x: player.x, y: player.y, dir: player.dir, pendingSnap: player.pendingSnap };
          };
    
          try {
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.enemies = [];
            return {
              perpendicular: run(RIGHT, DOWN),
              reverse: run(RIGHT, LEFT),
              same: run(RIGHT, RIGHT),
              gridSize: HALF
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugPlayerBrickRecoveryProbe() {
          const previous = {
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies
          };
          const makePlayer = (x, y, dir) => {
            const player = createPlayer(1);
            player.x = x;
            player.y = y;
            player.dir = dir;
            player.alive = true;
            player.respawn = 0;
            player.spawnFlash = 0;
            player.invuln = 0;
            player.stun = 0;
            player.slide = 0;
            player.pendingSnap = false;
            return player;
          };
    
          try {
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.enemies = [];
    
            game.grid = makeGrid();
            const turnCell = makeCell(BRICK, 1);
            turnCell.brickMask = 1 << 1;
            turnCell.mask = quarterMaskFromBrickFragments(turnCell.brickMask);
            game.grid[5][5] = turnCell;
            const turningPlayer = makePlayer(69, 70, RIGHT);
            game.players = [turningPlayer];
            const turnBefore = {
              x: turningPlayer.x,
              y: turningPlayer.y,
              overlap: solidTerrainOverlapArea(entityRect(turningPlayer))
            };
            updatePlayerMovement(turningPlayer, DOWN);
            const turnAfter = {
              x: turningPlayer.x,
              y: turningPlayer.y,
              dir: turningPlayer.dir,
              overlap: solidTerrainOverlapArea(entityRect(turningPlayer))
            };
    
            game.grid = makeGrid();
            setTile(game.grid, 5, 11, BRICK, 15);
            const coveredPlayer = makePlayer(90, 177, RIGHT);
            game.players = [coveredPlayer];
            const overlapHistory = [solidTerrainOverlapArea(entityRect(coveredPlayer))];
            for (let step = 0; step < 6; step += 1) {
              updatePlayerMovement(coveredPlayer, RIGHT);
              overlapHistory.push(solidTerrainOverlapArea(entityRect(coveredPlayer)));
            }
    
            return {
              blockedTurnSnap: { before: turnBefore, after: turnAfter },
              restoredWallEscape: {
                x: coveredPlayer.x,
                y: coveredPlayer.y,
                overlapHistory
              }
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugIceMovementProbe() {
          const previous = {
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            bullets: game.bullets,
            powerUp: game.powerUp,
            playerCount: game.playerCount
          };
          const previousMovementIce = {
            active: movementIceAudio.active,
            frame: movementIceAudio.frame
          };
          const makePlayer = (x, y, dir, slide) => {
            const player = createPlayer(1);
            player.x = x;
            player.y = y;
            player.spawnX = x;
            player.spawnY = y;
            player.dir = dir;
            player.alive = true;
            player.respawn = 0;
            player.spawnFlash = 0;
            player.invuln = 0;
            player.stun = 0;
            player.reload = 0;
            player.slide = slide;
            player.pendingSnap = false;
            return player;
          };
          const iceGrid = () => Array.from(
            { length: GRID },
            () => Array.from({ length: GRID }, () => makeCell(ICE, 0))
          );
    
          try {
            stopMovementIceAudio();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.enemies = [];
            game.bullets = [];
            game.powerUp = null;
            game.playerCount = 1;
    
            game.grid = iceGrid();
            const entry = makePlayer(32, 32, RIGHT, 0);
            game.players = [entry];
            updatePlayerMovement(entry, RIGHT);
            const afterEntry = { x: entry.x, y: entry.y, dir: entry.dir, slide: entry.slide };
            for (let tick = 0; tick < 13; tick += 1) updatePlayerMovement(entry, LEFT);
            const afterForcedWindow = { x: entry.x, y: entry.y, dir: entry.dir, slide: entry.slide };
            updatePlayerMovement(entry, DOWN);
            const afterControlReturns = { x: entry.x, y: entry.y, dir: entry.dir, slide: entry.slide };
    
            const tail = makePlayer(64, 64, RIGHT, 15);
            game.players = [tail];
            const tailStartX = tail.x;
            for (let tick = 0; tick < 15; tick += 1) updatePlayerMovement(tail, -1);
            const tailResult = { distance: tail.x - tailStartX, slide: tail.slide };
    
            game.grid = makeGrid();
            const offIce = makePlayer(64, 64, RIGHT, 10);
            game.players = [offIce];
            updatePlayerMovement(offIce, -1);
            const offIceResult = { x: offIce.x, slide: offIce.slide };
            setTile(game.grid, 4, 4, ICE, 0);
            updatePlayerMovement(offIce, -1);
            const reentered = { x: offIce.x, slide: offIce.slide };
    
            game.grid = makeGrid();
            setTile(game.grid, 2, 2, ICE, 0);
            setTile(game.grid, 3, 2, STEEL, 15);
            const blocked = makePlayer(34, 32, RIGHT, 5);
            game.players = [blocked];
            updatePlayerMovement(blocked, -1);
            const blockedResult = { x: blocked.x, slide: blocked.slide };
    
            game.grid = iceGrid();
            const stunned = makePlayer(32, 32, RIGHT, 3);
            stunned.stun = 5;
            game.players = [stunned];
            updatePlayerMovement(stunned, -1, true);
            const stunnedResult = { x: stunned.x, dir: stunned.dir, slide: stunned.slide };
    
            return {
              configuredTicks: gameSettings().playerMovement.iceSlideFrames,
              configuredSpeed: gameSettings().playerMovement.iceSlideSpeed,
              afterEntry,
              afterForcedWindow,
              afterControlReturns,
              tailResult,
              offIceResult,
              reentered,
              blockedResult,
              stunnedResult
            };
          } finally {
            stopMovementIceAudio();
            Object.assign(game, previous);
            movementIceAudio.active = previousMovementIce.active;
            movementIceAudio.frame = previousMovementIce.frame;
            syncMovementIceAudioNodes();
          }
        },
        debugIceCoverRenderProbe() {
          const previous = {
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            bullets: game.bullets,
            powerUp: game.powerUp,
            playerCount: game.playerCount
          };
          const grid = makeGrid();
          setTile(grid, 6, 6, ICE, 0);
          game.grid = grid;
          game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
          game.players = [];
          game.enemies = [];
          game.bullets = [{ x: 6 * TILE + 6, y: 6 * TILE + 6, w: 4, h: 4, ownerKind: "player" }];
          game.powerUp = null;
          game.playerCount = 1;
          renderGame();
          Object.assign(game, previous);
          return {
            bulletColor: "#f8e08b",
            iceCoverColor: "rgba(241, 248, 255, 0.72)"
          };
        },
        debugForestPowerUpLayerProbe() {
          const previous = {
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            bullets: game.bullets,
            powerUp: game.powerUp,
            playerCount: game.playerCount,
            tick: game.tick
          };
          const grid = makeGrid();
          setTile(grid, 6, 6, FOREST, 0);
          const power = { type: "star", x: 6 * TILE + 2, y: 6 * TILE + 2, w: POWERUP_SIZE, h: POWERUP_SIZE, ttl: 0 };
          try {
            game.grid = grid;
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [];
            game.enemies = [];
            game.bullets = [{ x: 6 * TILE + 6, y: 6 * TILE + 6, w: 4, h: 4, ownerKind: "player" }];
            game.powerUp = power;
            game.playerCount = 1;
            game.tick = 8;
            renderGame();
            return {
              forestColor: "#315b34",
              bulletColor: "#f8e08b",
              powerFrameColor: "#102748",
              powerRect: powerUpVisualRect(power)
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugTerrainCollisionProbe() {
          const previous = {
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            explosions: game.explosions
          };
          const types = [
            ["water", WATER],
            ["forest", FOREST],
            ["ice", ICE]
          ];
          const result = {};
    
          try {
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [];
            game.enemies = [];
            game.explosions = [];
    
            for (const [name, type] of types) {
              const grid = makeGrid();
              setTile(grid, 6, 6, type, 0);
              game.grid = grid;
              const tank = { kind: "player", x: 6 * TILE + 1, y: 6 * TILE + 1, w: 14, h: 14, alive: true };
              const bullet = {
                x: 6 * TILE + 6,
                y: 6 * TILE + 6,
                w: gameSettings().projectileRules.bulletSize,
                h: gameSettings().projectileRules.bulletSize,
                dir: RIGHT,
                power: 1,
                ownerKind: "player",
                ownerId: 1,
                ownerKey: "player:1",
                remove: false
              };
              resolveBullet(bullet);
              result[name] = {
                tankCanOccupy: canTankOccupy(tank, tank.x, tank.y),
                bulletRemoved: bullet.remove
              };
            }
          } finally {
            Object.assign(game, previous);
          }
    
          return result;
        },
        debugBaseWallPriorityProbe() {
          const previousBrickHit = { active: brickHitAudio.active, frame: brickHitAudio.frame };
          const previousBaseHit = { active: baseHitAudio.active, frame: baseHitAudio.frame };
          const previousPlayerDestroy = { active: playerDestroyAudio.active, frame: playerDestroyAudio.frame };
          const previous = {
            screen: game.screen,
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            explosions: game.explosions,
            baseDestroyTimer: game.baseDestroyTimer,
            gameOverTimer: game.gameOverTimer
          };
          const makeBaseBullet = () => ({
            x: 6 * TILE + 6,
            y: 12 * TILE - 2,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            dir: DOWN,
            power: 1,
            ownerKind: "player",
            ownerId: 1,
            ownerKey: "player:1",
            remove: false
          });
          try {
            stopBrickHitAudio();
            stopBaseHitAudio();
            stopPlayerDestroyAudio();
            game.screen = "playing";
            game.players = [];
            game.enemies = [];
            game.explosions = [];
            game.baseDestroyTimer = 0;
    
            game.grid = makeGrid();
            setTile(game.grid, 6, 11, BRICK);
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            const shieldedBullet = makeBaseBullet();
            resolveBullet(shieldedBullet);
            const shielded = {
              baseAlive: game.base.alive,
              bulletRemoved: shieldedBullet.remove,
              topWallMask: game.grid[11][6].mask,
              screen: game.screen,
              baseDestroyTimer: game.baseDestroyTimer,
              explosions: game.explosions.map(({ x, y, ttl, style }) => ({ x, y, ttl, style }))
            };
    
            game.screen = "playing";
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.explosions = [];
            game.baseDestroyTimer = 0;
            const exposedBullet = makeBaseBullet();
            resolveBullet(exposedBullet);
            const exposed = {
              baseAlive: game.base.alive,
              bulletRemoved: exposedBullet.remove,
              screen: game.screen,
              baseDestroyTimer: game.baseDestroyTimer,
              presentation: baseDestructionPresentation(game.baseDestroyTimer),
              explosions: game.explosions.map(({ x, y, ttl, style }) => ({ x, y, ttl, style }))
            };
    
            return { shielded, exposed };
          } finally {
            stopBrickHitAudio();
            stopBaseHitAudio();
            stopPlayerDestroyAudio();
            Object.assign(game, previous);
            brickHitAudio.active = previousBrickHit.active;
            brickHitAudio.frame = previousBrickHit.frame;
            baseHitAudio.active = previousBaseHit.active;
            baseHitAudio.frame = previousBaseHit.frame;
            playerDestroyAudio.active = previousPlayerDestroy.active;
            playerDestroyAudio.frame = previousPlayerDestroy.frame;
            syncBrickHitAudioNodes();
            syncBaseHitAudioNodes();
            syncPlayerDestroyAudioNodes();
            syncEnemyDestroyAudioNodes();
            syncMovementAudio();
          }
        },
        debugBaseDestructionSequenceProbe() {
          const previous = { ...game };
          const previousFirePresses = new Set(pendingFirePresses);
          const rightWasHeld = keys.has("ArrowRight");
          const previousBaseHit = { active: baseHitAudio.active, frame: baseHitAudio.frame };
          const previousPlayerDestroy = { active: playerDestroyAudio.active, frame: playerDestroyAudio.frame };
          const player = createPlayer(1);
          const spawningEnemy = { alive: true, spawnFlash: 40 };
          const fieldBullet = {
            x: 32,
            y: 120,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            dir: RIGHT,
            speed: 1,
            power: 1,
            ownerKind: "enemy",
            ownerId: 100,
            ownerKey: "enemy:100",
            remove: false
          };
          const baseBullet = {
            x: 6 * TILE + 5,
            y: 12 * TILE + 5,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            dir: DOWN,
            speed: 0,
            power: 1,
            ownerKind: "enemy",
            ownerId: 101,
            ownerKey: "enemy:101",
            remove: false
          };
          try {
            stopMovementAudio();
            stopBaseHitAudio();
            stopPlayerDestroyAudio();
            player.x = 48;
            player.y = 48;
            player.spawnFlash = 0;
            player.invuln = 0;
            player.reload = 0;
            game.screen = "playing";
            game.demoMode = false;
            game.paused = false;
            game.playerCount = 1;
            game.tick = 0;
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [player];
            game.enemies = [spawningEnemy];
            game.bullets = [fieldBullet];
            game.explosions = [];
            game.scorePopups = [];
            game.powerUp = null;
            game.enemySpawned = enemyTotal();
            game.enemyKilled = 0;
            game.nextSpawn = 0;
            game.clearPendingTimer = 0;
            game.baseDestroyTimer = 0;
            game.gameOverTimer = 0;
            game.freezeTimer = 0;
            game.shovelTimer = 0;
    
            const hit = hitBase(baseBullet);
            const entry = {
              hit,
              screen: game.screen,
              timer: game.baseDestroyTimer,
              duration: baseDestructionDuration(),
              baseAlive: game.base.alive,
              bulletRemoved: baseBullet.remove,
              explosionCount: game.explosions.length,
              presentation: baseDestructionPresentation(game.baseDestroyTimer)
            };
            const pauseAccepted = togglePause();
            keys.add("ArrowRight");
            pendingFirePresses.add("Space");
            const playerStartX = player.x;
            const bulletStartX = fieldBullet.x;
            const enemyStartFlash = spawningEnemy.spawnFlash;
            const frames = [];
            for (let frame = 1; frame <= entry.duration; frame += 1) {
              update();
              const presentation = baseDestructionPresentation(game.baseDestroyTimer);
              frames.push({
                frame,
                timer: game.baseDestroyTimer,
                screen: game.screen,
                phase: presentation ? presentation.phase : 0,
                size: presentation ? presentation.size : 0,
                width: presentation ? presentation.width : 0,
                height: presentation ? presentation.height : 0,
                frameName: presentation ? presentation.frameName : null,
                movementAudioMode: movementAudio.mode
              });
            }
            return {
              entry,
              pauseAccepted,
              playerStartX,
              playerEndX: player.x,
              bulletStartX,
              bulletEndX: fieldBullet.x,
              enemyStartFlash,
              enemyEndFlash: spawningEnemy.spawnFlash,
              playerBulletCount: game.bullets.filter((bullet) => bullet.ownerKind === "player").length,
              gameOverTimer: game.gameOverTimer,
              frames
            };
          } finally {
            stopBaseHitAudio();
            stopPlayerDestroyAudio();
            Object.assign(game, previous);
            baseHitAudio.active = previousBaseHit.active;
            baseHitAudio.frame = previousBaseHit.frame;
            playerDestroyAudio.active = previousPlayerDestroy.active;
            playerDestroyAudio.frame = previousPlayerDestroy.frame;
            pendingFirePresses.clear();
            for (const code of previousFirePresses) pendingFirePresses.add(code);
            if (!rightWasHeld) keys.delete("ArrowRight");
            syncBaseHitAudioNodes();
            syncPlayerDestroyAudioNodes();
            syncMovementAudio();
          }
        },
        debugRenderBaseDestructionFrame(timer) {
          const previous = { ...game };
          try {
            game.screen = "playing";
            game.playerCount = 1;
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: false };
            game.players = [];
            game.enemies = [];
            game.bullets = [];
            game.explosions = [];
            game.scorePopups = [];
            game.powerUp = null;
            game.baseDestroyTimer = clamp(Math.floor(Number(timer) || 0), 0, baseDestructionDuration());
            renderGame();
            return baseDestructionPresentation(game.baseDestroyTimer);
          } finally {
            Object.assign(game, previous);
          }
        },
        debugTankCollisionProbe() {
          const previous = {
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies
          };
          const player = { kind: "player", id: 1, x: 32, y: 32, w: 14, h: 14, alive: true, respawn: 0 };
          const teammate = { kind: "player", id: 2, x: 46, y: 32, w: 14, h: 14, alive: true, respawn: 0 };
          const enemy = { kind: "enemy", id: 100, x: 46, y: 32, w: 14, h: 14, alive: true, respawn: 0 };
          try {
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
    
            game.players = [player];
            game.enemies = [enemy];
            const enemyBlocks = !canTankOccupy(player, player.x + 1, player.y);
            const movingAwayFromEnemyAllowed = moveTank(player, -1, 0);
    
            player.x = 32;
            player.y = 32;
            game.players = [player, teammate];
            game.enemies = [];
            const teammateBlocks = !canTankOccupy(player, player.x + 1, player.y);
    
            return {
              enemyBlocks,
              teammateBlocks,
              movingAwayFromEnemyAllowed,
              finalX: player.x
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugEnemyOverlapRecoveryProbe() {
          const previous = {
            tick: game.tick,
            grid: game.grid,
            base: game.base,
            players: game.players,
            enemies: game.enemies
          };
          const makeEnemy = (id, x) => ({
            kind: "enemy",
            id,
            slotIndex: id - 98,
            x,
            y: 32,
            w: 14,
            h: 14,
            dir: RIGHT,
            speed: 1,
            alternateMovement: false,
            blockedPauseTicks: 2,
            pendingTurn: true,
            alive: true,
            respawn: 0,
            spawnFlash: 0
          });
          try {
            game.tick = 0;
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [];
            const blocker = makeEnemy(100, 32);
            const recovering = makeEnemy(101, 40);
            game.enemies = [blocker, recovering];
            const startOverlapArea = rectOverlapArea(blocker, recovering);
            updateEnemyMovement(recovering, () => 0);
            const firstTick = {
              x: recovering.x,
              dir: recovering.dir,
              overlapArea: rectOverlapArea(blocker, recovering),
              blockedPauseTicks: recovering.blockedPauseTicks,
              pendingTurn: recovering.pendingTurn
            };
            for (let tick = 1; tick < 6; tick += 1) updateEnemyMovement(recovering, () => 0);
            const finalOverlapArea = rectOverlapArea(blocker, recovering);
            const contactMoveBlocked = !canTankOccupy(recovering, recovering.x - 1, recovering.y);
            return {
              startOverlapArea,
              firstTick,
              finalX: recovering.x,
              finalOverlapArea,
              contactMoveBlocked
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugExplosionRuleProbe(ruleName) {
          const key = String(ruleName || "enemyDestroy");
          return { key, ...explosionRule(key) };
        },
        debugTankDestructionExplosionProbe() {
          const enemyFrames = () => {
            const ruleName = "enemyDestroy";
            addRuleExplosion(ruleName, 64, 64);
            const explosion = game.explosions.pop();
            return Array.from({ length: explosion.max }, (_, elapsed) => {
              explosion.ttl = explosion.max - elapsed;
              const presentation = tankDestructionPresentation(explosion);
              return {
                elapsed,
                style: explosion.style,
                phase: presentation.phase,
                frameName: presentation.frameName,
                width: presentation.width,
                height: presentation.height,
                x: presentation.x,
                y: presentation.y
              };
            });
          };
          const playerFrames = () => {
            const rule = explosionRule("playerDestroy");
            const totalTicks = Math.max(1, gameSettings().timings.playerRespawn);
            const player = {
              x: 57,
              y: 57,
              w: 14,
              h: 14,
              respawn: totalTicks,
              destroyTotalTicks: totalTicks,
              destroyExplosionTicks: Math.min(totalTicks, rule.ttl)
            };
            return Array.from({ length: totalTicks }, (_, elapsed) => {
              player.respawn = totalTicks - elapsed;
              const presentation = playerDestructionPresentation(player);
              return {
                elapsed,
                style: "playerDestroy",
                kind: presentation.kind,
                phase: presentation.phase,
                frameName: presentation.frameName,
                width: presentation.width,
                height: presentation.height,
                x: presentation.x,
                y: presentation.y
              };
            });
          };
          const previousExplosions = game.explosions;
          try {
            game.explosions = [];
            return {
              enemy: enemyFrames(),
              player: playerFrames()
            };
          } finally {
            game.explosions = previousExplosions;
          }
        },
        debugEnemyDestructionLifecycleProbe() {
          const previous = { ...game };
          const type = enemyTypeDefinitions()[0];
          const player = createPlayer(1);
          player.spawnFlash = 0;
          player.invuln = 0;
          const makeEnemy = (id, slotIndex, alternateMovement, x) => ({
            kind: "enemy",
            id,
            slotIndex,
            x: x === undefined ? 64 : x,
            y: 64,
            w: 14,
            h: 14,
            dir: DOWN,
            speed: type.speed,
            hp: 1,
            maxHp: 1,
            bulletSpeed: type.bullet,
            bulletPower: type.wallPower,
            reloadBase: type.reload,
            reload: 0,
            score: type.score,
            color: type.color,
            accent: "#2b2a28",
            typeIndex: 0,
            carrier: false,
            fireChance: 0,
            alternateMovement,
            blockedPauseTicks: 0,
            pendingTurn: false,
            spawnFlash: 0,
            alive: true,
            destroying: false,
            destroyTicks: 0,
            slide: 0,
            trackPhase: 0
          });
          const runLifecycle = (enemy) => {
            game.tick = 0;
            game.frameLow = 0;
            game.enemies = [enemy];
            game.enemyKilled = 0;
            destroyEnemy(enemy, player.id, { awardScore: false, trackKill: false });
            const frames = [];
            while (enemy.alive && frames.length < 200) {
              const presentation = enemyDestructionPresentation(enemy);
              frames.push({
                destroyTicks: enemy.destroyTicks,
                kind: presentation.kind,
                phase: presentation.phase || null,
                text: presentation.text || null
              });
              game.tick += 1;
              game.frameLow = (game.frameLow + 1) & 0xff;
              updateEnemyDestruction(enemy);
            }
            return {
              displayFrames: frames.length,
              explosionFrames: frames.filter((frame) => frame.kind === "explosion").length,
              scoreFrames: frames.filter((frame) => frame.kind === "score").length,
              phases: frames
                .map((frame) => frame.phase)
                .filter((phase, index, phases) => phase && (index === 0 || phase !== phases[index - 1])),
              scoreText: frames.find((frame) => frame.kind === "score")?.text || null,
              released: !enemy.alive,
              enemyKilled: game.enemyKilled
            };
          };
    
          try {
            game.screen = "playing";
            game.demoMode = false;
            game.paused = false;
            game.playerCount = 1;
            game.stage = 1;
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.players = [player];
            game.bullets = [];
            game.explosions = [];
            game.scorePopups = [];
            game.powerUp = null;
    
            const fast = runLifecycle(makeEnemy(100, 2, false));
            const normal = runLifecycle(makeEnemy(101, 2, true));
    
            const frozenEnemy = makeEnemy(102, 2, false);
            game.enemies = [frozenEnemy];
            game.enemyKilled = 0;
            game.freezeTimer = 999;
            destroyEnemy(frozenEnemy, player.id, { awardScore: false, trackKill: false });
            for (let tick = 0; tick < frozenEnemy.destroyExplosionTicks + ENEMY_DESTRUCTION_SCORE_TICKS; tick += 1) {
              updateEnemies();
            }
            const timerFrozen = {
              released: !frozenEnemy.alive,
              enemyKilled: game.enemyKilled,
              freezeTimer: game.freezeTimer
            };
            game.freezeTimer = 0;
    
            const collisionEnemy = makeEnemy(103, 2, false, 40);
            const collisionPlayer = createPlayer(1);
            collisionPlayer.x = 26;
            collisionPlayer.y = 64;
            collisionPlayer.spawnFlash = 0;
            collisionPlayer.invuln = 0;
            game.players = [collisionPlayer];
            game.enemies = [collisionEnemy];
            destroyEnemy(collisionEnemy, collisionPlayer.id, { awardScore: false, trackKill: false });
            const collisionIgnored = canTankOccupy(collisionPlayer, collisionPlayer.x + 1, collisionPlayer.y);
            const duplicateBullet = {
              x: collisionEnemy.x + 5,
              y: collisionEnemy.y + 5,
              w: 4,
              h: 4,
              ownerKind: "player",
              ownerId: collisionPlayer.id,
              ownerKey: `player:${collisionPlayer.id}`,
              remove: false
            };
            const duplicateHit = hitTank(duplicateBullet);
    
            game.players = [player];
            const capacity = maxActiveEnemies();
            const capacityEnemies = Array.from({ length: capacity }, (_, index) =>
              makeEnemy(200 + index, capacity + 1 - index, false, 24 + index * 24)
            );
            for (const enemy of capacityEnemies) {
              destroyEnemy(enemy, player.id, { awardScore: false, trackKill: false });
            }
            game.enemies = capacityEnemies;
            game.enemyKilled = 0;
            game.enemySpawned = capacity;
            game.nextSpawn = 0;
            spawnEnemies();
            const capacityBeforeRelease = {
              enemySpawned: game.enemySpawned,
              aliveSlots: game.enemies.filter((enemy) => enemy.alive).length
            };
            const releasedSlot = capacityEnemies[0].slotIndex;
            for (let tick = 0; tick < capacityEnemies[0].destroyExplosionTicks + ENEMY_DESTRUCTION_SCORE_TICKS; tick += 1) {
              updateEnemyDestruction(capacityEnemies[0]);
            }
            spawnEnemies();
            const spawnedAfterRelease = game.enemies.find((enemy) => enemy.id === 100 + capacity);
            const capacityAfterRelease = {
              enemySpawned: game.enemySpawned,
              activeSlots: game.enemies.filter((enemy) => enemy.alive).length,
              reusedSlot: spawnedAfterRelease ? spawnedAfterRelease.slotIndex : null,
              releasedSlot
            };
    
            const grenadeEnemy = makeEnemy(300, 2, false);
            game.players = [player];
            game.enemies = [grenadeEnemy];
            game.scorePopups = [];
            destroyEnemy(grenadeEnemy, player.id, { awardScore: false, trackKill: false, showScore: false });
            grenadeEnemy.destroyTicks = grenadeEnemy.destroyExplosionTicks;
            const grenadeFinalState = enemyDestructionPresentation(grenadeEnemy);
    
            const lastEnemy = makeEnemy(400, 2, false);
            game.screen = "playing";
            game.players = [player];
            game.enemies = [lastEnemy];
            game.enemySpawned = enemyTotal();
            game.enemyKilled = enemyTotal() - 1;
            game.clearPendingTimer = 0;
            destroyEnemy(lastEnemy, player.id, { awardScore: false, trackKill: false });
            checkEndState();
            const clearOnHit = game.clearPendingTimer;
            for (let tick = 0; tick < lastEnemy.destroyExplosionTicks + ENEMY_DESTRUCTION_SCORE_TICKS - 1; tick += 1) {
              updateEnemyDestruction(lastEnemy);
            }
            checkEndState();
            const clearBeforeRelease = game.clearPendingTimer;
            updateEnemyDestruction(lastEnemy);
            checkEndState();
            const clearAfterRelease = {
              timer: game.clearPendingTimer,
              screen: game.screen,
              enemyKilled: game.enemyKilled
            };
    
            return {
              explosionTicks: explosionRule("enemyDestroy").ttl,
              scoreTicks: ENEMY_DESTRUCTION_SCORE_TICKS,
              fast,
              normal,
              timerFrozen,
              collisionIgnored,
              duplicateHit,
              duplicateBulletRemoved: duplicateBullet.remove,
              capacityBeforeRelease,
              capacityAfterRelease,
              grenadeFinalState,
              clearOnHit,
              clearBeforeRelease,
              clearAfterRelease
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugRenderTankDestructionExplosionFrame(ruleName, elapsed) {
          const key = ruleName === "playerDestroy" ? "playerDestroy" : "enemyDestroy";
          const rule = explosionRule(key);
          if (key === "playerDestroy") {
            const totalTicks = Math.max(1, gameSettings().timings.playerRespawn);
            const frame = clamp(Math.floor(Number(elapsed) || 0), 0, totalTicks - 1);
            const player = {
              x: 57,
              y: 57,
              w: 14,
              h: 14,
              respawn: totalTicks - frame,
              destroyTotalTicks: totalTicks,
              destroyExplosionTicks: Math.min(totalTicks, rule.ttl)
            };
            const presentation = playerDestructionPresentation(player);
            drawManifestSprite("destructionExplosion", presentation.frameName, presentation.spriteX, presentation.spriteY, {
              primary: rule.color,
              core: rule.coreColor || DEFAULT_EXPLOSION_CORE_COLOR
            });
            return presentation;
          }
          const frame = clamp(Math.floor(Number(elapsed) || 0), 0, rule.ttl - 1);
          const explosion = {
            x: 64,
            y: 64,
            ttl: rule.ttl - frame,
            max: rule.ttl,
            color: rule.color,
            coreColor: rule.coreColor,
            style: key
          };
          return drawTankDestructionExplosion(explosion);
        },
        debugBulletImpactExplosionProbe() {
          const previous = { ...game };
          try {
            preparePausedDebugBattle(0);
            game.explosions = [];
            addRuleExplosion("brickHit", 64, 64);
            const beforePause = game.explosions[0].ttl;
            update();
            const afterPause = game.explosions[0].ttl;
            const frames = [];
            while (game.explosions.length) {
              const explosion = game.explosions[0];
              const presentation = explosionPresentation(explosion);
              frames.push({ ttl: explosion.ttl, phase: presentation.phase, size: presentation.size });
              updateExplosions();
            }
            return {
              ruleTtls: Object.fromEntries(Array.from(BULLET_IMPACT_EXPLOSION_RULES, (key) => [key, explosionRule(key).ttl])),
              beforePause,
              afterPause,
              frames
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugEnemyPanelCounterProbe(spawned, killed, total) {
          const spawnedCount = Math.max(0, Math.floor(Number(spawned) || 0));
          const killedCount = Math.max(0, Math.floor(Number(killed) || 0));
          const totalCount = total === undefined ? DEFAULT_ENEMY_TOTAL : Math.max(0, Math.floor(Number(total) || 0));
          return {
            spawned: spawnedCount,
            killed: killedCount,
            remaining: panelEnemyCounterRemaining(totalCount, spawnedCount)
          };
        },
        debugPanelLifeCountProbe(lives) {
          const internalLives = Math.max(0, Math.floor(Number(lives) || 0));
          return {
            internalLives,
            panelLives: panelLifeCount({ lives: internalLives })
          };
        },
        debugStageIntroCurtainProbe(timer) {
          return stageIntroCurtainState(timer);
        },
        debugStageSelectCurtainProbe(timer) {
          return stageSelectCurtainState(timer);
        },
        debugRenderStageClearClosingFrame(timer) {
          const previous = {
            screen: game.screen,
            stage: game.stage,
            playerCount: game.playerCount,
            transitionTimer: game.transitionTimer,
            players: game.players,
            stageResultReason: game.stageResultReason,
            stageClearElapsed: game.stageClearElapsed,
            stageClearBonusPlayerIds: game.stageClearBonusPlayerIds.slice(),
            stageClearBonusAwarded: game.stageClearBonusAwarded
          };
          try {
            const player = createPlayer(1);
            player.score = 12300;
            player.stageKills = [1, 2, 3, 4];
            game.screen = "stageClearClosing";
            game.stage = 1;
            game.playerCount = 1;
            game.transitionTimer = clamp(Math.floor(Number(timer) || 0), 0, STAGE_CURTAIN_CLOSE_FRAMES);
            game.players = [player];
            game.stageResultReason = "clear";
            game.stageClearElapsed = stageResultDuration(game.players);
            game.stageClearBonusPlayerIds = [];
            game.stageClearBonusAwarded = true;
            render();
            return stageSelectCurtainState();
          } finally {
            Object.assign(game, previous);
          }
        },
        debugAdvanceStageTransition(frames) {
          const count = Math.max(0, Math.floor(Number(frames) || 0));
          for (let index = 0; index < count; index += 1) {
            if (game.screen !== "stageSelectClosing" && game.screen !== "stageIntro") break;
            update();
          }
          return {
            screen: game.screen,
            transitionTimer: game.transitionTimer,
            stage: game.stage,
            players: game.players.length
          };
        },
        debugAdvanceStageSelect(frames) {
          const count = Math.max(0, Math.floor(Number(frames) || 0));
          for (let index = 0; index < count; index += 1) {
            if (game.screen !== "stageSelect") break;
            update();
          }
          return {
            screen: game.screen,
            stage: game.stage,
            frameLow: game.frameLow,
            frameHigh: game.frameHigh
          };
        },
        debugAdvanceStageStartAudio(frames) {
          const count = Math.max(0, Math.floor(Number(frames) || 0));
          for (let index = 0; index < count; index += 1) {
            updateStageStartAudio();
            updatePauseAudio();
          }
          return {
            active: stageStartAudio.active,
            frame: stageStartAudio.frame,
            durationFrames: FREE_AUDIO_MANIFEST.events.stageStart.durationFrames,
            movementAudioMode: movementAudio.mode,
            paused: game.paused,
            pauseAudioActive: pauseAudio.active,
            pauseAudioFrame: pauseAudio.frame
          };
        },
        debugStageAdvanceProbe(stage) {
          return stageAdvanceResult(stage === undefined ? stageCount() : Number(stage));
        },
        debugStageCycleProbe(stage) {
          const value = Math.max(1, Math.floor(Number(stage) || game.stage || 1));
          const sequence = enemySequenceForStage(value);
          const counts = sequence.reduce((result, enemy) => {
            result[enemy.typeIndex] = (result[enemy.typeIndex] || 0) + 1;
            return result;
          }, {});
          return {
            stage: value,
            stageCount: stageCount(),
            stageCycleLimit: stageCycleLimit(),
            mapDataStage: mapDataStage(value),
            enemyDataStage: enemyDataStage(value),
            enemyTotal: enemyTotal(value),
            carrierNumbers: sequence.map((enemy, index) => enemy.carrier ? index + 1 : null).filter(Boolean),
            enemyTypeCounts: counts,
            spawnIndices: sequence.map((enemy) => enemy.spawnIndex),
            onePlayerMaxActiveEnemies: maxActiveEnemies(value, 1),
            twoPlayerMaxActiveEnemies: maxActiveEnemies(value, 2),
            defaultEnemySpawnDelay: defaultEnemySpawnDelay(value),
            twoPlayerDefaultEnemySpawnDelay: scaleEnemySpawnDelayForPlayers(defaultEnemySpawnDelay(value), 2),
            firstEnemySpawnDelay: scaleEnemySpawnDelayForPlayers((gameSettings().enemySpawnPacing || DEFAULT_ENEMY_SPAWN_PACING).firstDelay, 1),
            twoPlayerFirstEnemySpawnDelay: scaleEnemySpawnDelayForPlayers((gameSettings().enemySpawnPacing || DEFAULT_ENEMY_SPAWN_PACING).firstDelay, 2),
            advance: stageAdvanceResult(value)
          };
        },
        debugOriginalEnemyGroupsProbe() {
          const names = defaultEnemyTypes.map((type) => type.name);
          return summarizeEnemySequences(builtInStagePack.enemies, names);
        },
        debugStageClearDelayProbe(framesLeft, baseAlive, killedCount) {
          const timer = Math.max(0, Math.floor(Number(framesLeft) || 0));
          const previous = {
            screen: game.screen,
            paused: game.paused,
            base: game.base,
            players: game.players,
            enemies: game.enemies,
            enemyKilled: game.enemyKilled,
            enemySpawned: game.enemySpawned,
            clearPendingTimer: game.clearPendingTimer,
            transitionTimer: game.transitionTimer,
            gameOverTimer: game.gameOverTimer,
            stageClearElapsed: game.stageClearElapsed,
            stageClearBonusPlayerIds: game.stageClearBonusPlayerIds.slice(),
            stageClearBonusAwarded: game.stageClearBonusAwarded
          };
          const total = enemyTotal();
          const player = {
            id: 1,
            alive: true,
            lives: 1,
            respawn: 0,
            score: 0,
            nextBonusLifeIndex: 0,
            stagePoints: 0,
            stageKills: Array(enemyTypeDefinitions().length).fill(0)
          };
          try {
            game.screen = "playing";
            game.paused = false;
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: baseAlive !== false };
            game.players = [player];
            game.enemies = [];
            game.enemyKilled = killedCount === undefined ? total : Math.max(0, Math.floor(Number(killedCount) || 0));
            game.enemySpawned = total;
            game.clearPendingTimer = timer;
            game.transitionTimer = 0;
            checkEndState();
            return {
              screen: game.screen,
              enemyKilled: game.enemyKilled,
              enemySpawned: game.enemySpawned,
              clearPendingTimer: game.clearPendingTimer,
              transitionTimer: game.transitionTimer,
              gameOverTimer: game.gameOverTimer
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugStageClearAdvanceProbe(stage) {
          const previous = {
            screen: game.screen,
            paused: game.paused,
            stage: game.stage,
            tick: game.tick,
            transitionTimer: game.transitionTimer,
            grid: game.grid,
            customGrid: game.customGrid,
            constructedGrid: game.constructedGrid,
            constructionStageActive: game.constructionStageActive,
            players: game.players,
            enemies: game.enemies,
            bullets: game.bullets,
            explosions: game.explosions,
            powerUp: game.powerUp,
            lastPowerUpSpawn: game.lastPowerUpSpawn,
            powerUpSpawnBag: game.powerUpSpawnBag.slice(),
            powerUpSpawnBagKey: game.powerUpSpawnBagKey,
            base: game.base,
            enemySpawned: game.enemySpawned,
            enemyKilled: game.enemyKilled,
            nextSpawn: game.nextSpawn,
            clearPendingTimer: game.clearPendingTimer,
            gameOverTimer: game.gameOverTimer,
            freezeTimer: game.freezeTimer,
            shovelTimer: game.shovelTimer,
            stageClearElapsed: game.stageClearElapsed,
            stageClearBonusPlayerIds: game.stageClearBonusPlayerIds.slice(),
            stageClearBonusAwarded: game.stageClearBonusAwarded
          };
          try {
            game.screen = "stageClear";
            game.paused = false;
            game.stage = Math.max(1, Math.floor(Number(stage) || 1));
            game.customGrid = null;
            game.players = [createPlayer(1)];
            game.stageClearElapsed = 0;
            game.stageClearBonusPlayerIds = [];
            game.stageClearBonusAwarded = true;
            game.transitionTimer = 1;
            update();
            const closingStart = {
              screen: game.screen,
              stage: game.stage,
              transitionTimer: game.transitionTimer,
              curtain: stageSelectCurtainState()
            };
            update();
            const closingFirstStep = {
              screen: game.screen,
              stage: game.stage,
              transitionTimer: game.transitionTimer,
              curtain: stageSelectCurtainState()
            };
            while (game.screen === "stageClearClosing" && game.transitionTimer > 1) update();
            const closingLastStep = {
              screen: game.screen,
              stage: game.stage,
              transitionTimer: game.transitionTimer,
              curtain: stageSelectCurtainState()
            };
            if (game.screen === "stageClearClosing") update();
            return {
              screen: game.screen,
              stage: game.stage,
              transitionTimer: game.transitionTimer,
              clearPendingTimer: game.clearPendingTimer,
              enemySpawned: game.enemySpawned,
              nextSpawn: game.nextSpawn,
              constructionStageActive: game.constructionStageActive,
              closingStart,
              closingFirstStep,
              closingLastStep
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugStageCyclePreservesPlayerStateProbe(stage) {
          const previous = {
            screen: game.screen,
            paused: game.paused,
            stage: game.stage,
            tick: game.tick,
            transitionTimer: game.transitionTimer,
            grid: game.grid,
            customGrid: game.customGrid,
            constructedGrid: game.constructedGrid,
            constructionStageActive: game.constructionStageActive,
            players: game.players,
            enemies: game.enemies,
            bullets: game.bullets,
            explosions: game.explosions,
            powerUp: game.powerUp,
            lastPowerUpSpawn: game.lastPowerUpSpawn,
            powerUpSpawnBag: game.powerUpSpawnBag.slice(),
            powerUpSpawnBagKey: game.powerUpSpawnBagKey,
            base: game.base,
            enemySpawned: game.enemySpawned,
            enemyKilled: game.enemyKilled,
            nextSpawn: game.nextSpawn,
            clearPendingTimer: game.clearPendingTimer,
            gameOverTimer: game.gameOverTimer,
            freezeTimer: game.freezeTimer,
            shovelTimer: game.shovelTimer,
            stageClearElapsed: game.stageClearElapsed,
            stageClearBonusPlayerIds: game.stageClearBonusPlayerIds.slice(),
            stageClearBonusAwarded: game.stageClearBonusAwarded
          };
          const player = createPlayer(1);
          player.score = 54321;
          player.level = 3;
          player.lives = 4;
          player.nextBonusLifeIndex = 1;
          player.stagePoints = 1200;
          player.stageKills = [2, 1, 0, 0];
          player.totalKills = [7, 5, 3, 1];
          try {
            game.screen = "stageClear";
            game.paused = false;
            game.stage = Math.max(1, Math.floor(Number(stage) || stageCycleLimit()));
            game.customGrid = null;
            game.players = [player];
            game.enemies = [];
            game.bullets = [];
            game.explosions = [];
            game.powerUp = null;
            game.lastPowerUpSpawn = "6,6";
            resetPowerUpSpawnBag();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.enemySpawned = enemyTotal(game.stage);
            game.enemyKilled = enemyTotal(game.stage);
            game.nextSpawn = 0;
            game.clearPendingTimer = 0;
            game.gameOverTimer = 0;
            game.freezeTimer = 0;
            game.shovelTimer = 0;
            game.stageClearElapsed = 0;
            game.stageClearBonusPlayerIds = [];
            game.stageClearBonusAwarded = true;
            game.transitionTimer = 1;
    
            update();
            while (game.screen === "stageClearClosing") update();
            const after = game.players[0];
            return {
              screen: game.screen,
              stage: game.stage,
              mapDataStage: mapDataStage(game.stage),
              enemyDataStage: enemyDataStage(game.stage),
              score: after.score,
              level: after.level,
              lives: after.lives,
              nextBonusLifeIndex: after.nextBonusLifeIndex,
              stagePoints: after.stagePoints,
              stageKills: after.stageKills.slice(),
              totalKills: after.totalKills.slice(),
              enemySpawned: game.enemySpawned,
              clearPendingTimer: game.clearPendingTimer,
              powerUp: game.powerUp,
              lastPowerUpSpawn: game.lastPowerUpSpawn,
              powerUpSpawnBagLength: game.powerUpSpawnBag.length
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugCompletedStageAdvanceProbe(stage, killedCount) {
          const previous = {
            screen: game.screen,
            paused: game.paused,
            stage: game.stage,
            tick: game.tick,
            transitionTimer: game.transitionTimer,
            grid: game.grid,
            customGrid: game.customGrid,
            constructedGrid: game.constructedGrid,
            constructionStageActive: game.constructionStageActive,
            players: game.players,
            enemies: game.enemies,
            bullets: game.bullets,
            explosions: game.explosions,
            powerUp: game.powerUp,
            lastPowerUpSpawn: game.lastPowerUpSpawn,
            powerUpSpawnBag: game.powerUpSpawnBag.slice(),
            powerUpSpawnBagKey: game.powerUpSpawnBagKey,
            base: game.base,
            enemySpawned: game.enemySpawned,
            enemyKilled: game.enemyKilled,
            nextSpawn: game.nextSpawn,
            clearPendingTimer: game.clearPendingTimer,
            gameOverTimer: game.gameOverTimer,
            freezeTimer: game.freezeTimer,
            shovelTimer: game.shovelTimer,
            stageClearElapsed: game.stageClearElapsed,
            stageClearBonusPlayerIds: game.stageClearBonusPlayerIds.slice(),
            stageClearBonusAwarded: game.stageClearBonusAwarded
          };
          const stageValue = Math.max(1, Math.floor(Number(stage) || 1));
          const total = enemyTotal(stageValue);
          const timings = gameSettings().timings;
          const transitions = [];
          try {
            game.screen = "playing";
            game.paused = false;
            game.stage = stageValue;
            game.tick = 0;
            game.transitionTimer = 0;
            game.grid = createStageGrid(stageValue);
            prepareBattleGrid(game.grid);
            game.customGrid = null;
            game.players = [createPlayer(1)];
            const maxFrames = timings.stageClearDelay + stageResultDuration(game.players) + STAGE_CURTAIN_CLOSE_FRAMES + timings.stageIntro + 5;
            game.enemies = [];
            game.bullets = [];
            game.explosions = [];
            game.powerUp = null;
            game.lastPowerUpSpawn = null;
            resetPowerUpSpawnBag();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: true };
            game.enemySpawned = total;
            game.enemyKilled = killedCount === undefined ? total : Math.max(0, Math.floor(Number(killedCount) || 0));
            game.nextSpawn = 0;
            game.clearPendingTimer = 0;
            game.gameOverTimer = 0;
            game.freezeTimer = 0;
            game.shovelTimer = 0;
    
            let frames = 0;
            for (; frames < maxFrames;) {
              const before = game.screen;
              update();
              frames += 1;
              if (game.screen !== before) {
                transitions.push({
                  frame: frames,
                  screen: game.screen,
                  stage: game.stage,
                  clearPendingTimer: game.clearPendingTimer,
                  transitionTimer: game.transitionTimer
                });
              }
              if (game.screen === "stageIntro" && game.stage !== stageValue) break;
            }
    
            return {
              screen: game.screen,
              stage: game.stage,
              frames,
              transitions,
              enemySpawned: game.enemySpawned,
              enemyKilled: game.enemyKilled,
              clearPendingTimer: game.clearPendingTimer,
              transitionTimer: game.transitionTimer
            };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugGameOverSlideProbe() {
          const previous = {
            screen: game.screen,
            paused: game.paused,
            gameOverTimer: game.gameOverTimer
          };
          const timings = gameSettings().timings;
          const slideDuration = timings.gameOverSlide;
          const holdDuration = timings.gameOverHold;
          const duration = gameOverFieldDuration();
          const timers = [
            { phase: "start", timer: duration },
            { phase: "firstMove", timer: Math.max(0, duration - 1) },
            { phase: "slideEnd", timer: holdDuration },
            { phase: "firstHold", timer: Math.max(0, holdDuration - 1) },
            { phase: "end", timer: 0 }
          ];
          try {
            game.screen = "playing";
            game.paused = true;
            game.gameOverTimer = 0;
            enterGameOver();
            const entry = {
              screen: game.screen,
              paused: game.paused,
              timer: game.gameOverTimer
            };
            const frames = timers.map(({ phase, timer }) => {
              game.gameOverTimer = timer;
              renderGameOver();
              return { phase, timer, y: gameOverBannerY(timer) };
            });
            return { slideDuration, holdDuration, duration, entry, frames };
          } finally {
            Object.assign(game, previous);
          }
        },
        debugGameOverBattleProbe() {
          const previous = { ...game };
          const previousFirePresses = new Set(pendingFirePresses);
          const rightWasHeld = keys.has("ArrowRight");
          const player = createPlayer(1);
          const enemy = { alive: true, spawnFlash: 2 };
          const bullet = {
            x: 96,
            y: 96,
            w: gameSettings().projectileRules.bulletSize,
            h: gameSettings().projectileRules.bulletSize,
            dir: RIGHT,
            speed: 1,
            power: 1,
            ownerKind: "enemy",
            ownerId: 100,
            ownerKey: "enemy:100",
            remove: false
          };
          try {
            player.x = 48;
            player.y = 48;
            player.spawnFlash = 0;
            player.invuln = 0;
            player.reload = 2;
            game.screen = "gameOver";
            game.demoMode = false;
            game.paused = false;
            game.tick = 0;
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: false };
            game.players = [player];
            game.enemies = [enemy];
            game.bullets = [bullet];
            game.explosions = [{ x: 80, y: 80, ttl: 2, max: 2, rule: "enemyHit" }];
            game.scorePopups = [{ value: 100, x: 80, y: 80, ttl: 2, max: 2, style: "float" }];
            game.powerUp = { type: "helmet", x: 8, y: 8, w: 16, h: 16, ttl: 2 };
            game.enemySpawned = enemyTotal();
            game.nextSpawn = 0;
            game.gameOverTimer = 2;
            game.freezeTimer = 0;
            game.shovelTimer = 0;
            keys.add("ArrowRight");
            pendingFirePresses.add("Space");
    
            const before = {
              tick: game.tick,
              timer: game.gameOverTimer,
              playerX: player.x,
              playerReload: player.reload,
              enemySpawnFlash: enemy.spawnFlash,
              bulletX: bullet.x,
              explosionTtl: game.explosions[0].ttl,
              popupTtl: game.scorePopups[0].ttl,
              powerUpTtl: game.powerUp.ttl,
              bulletCount: game.bullets.length
            };
            update();
            return {
              before,
              after: {
                screen: game.screen,
                tick: game.tick,
                timer: game.gameOverTimer,
                playerX: player.x,
                playerReload: player.reload,
                enemySpawnFlash: enemy.spawnFlash,
                bulletX: bullet.x,
                explosionTtl: game.explosions[0] ? game.explosions[0].ttl : 0,
                popupTtl: game.scorePopups[0] ? game.scorePopups[0].ttl : 0,
                powerUpTtl: game.powerUp ? game.powerUp.ttl : 0,
                bulletCount: game.bullets.length
              }
            };
          } finally {
            Object.assign(game, previous);
            pendingFirePresses.clear();
            for (const code of previousFirePresses) pendingFirePresses.add(code);
            if (!rightWasHeld) keys.delete("ArrowRight");
          }
        },
        debugGameOverReturnProbe() {
          const previous = { ...game };
          try {
            game.screen = "gameOver";
            game.paused = false;
            game.tick = 0;
            game.grid = makeGrid();
            game.base = { x: 6 * TILE, y: 12 * TILE, w: TILE, h: TILE, alive: false };
            game.players = [];
            game.enemies = [];
            game.bullets = [];
            game.explosions = [];
            game.scorePopups = [];
            game.powerUp = null;
            game.enemySpawned = enemyTotal();
            game.nextSpawn = 0;
            game.gameOverTimer = 1;
            game.fullGameOverElapsed = 0;
            game.newHighScoreAtGameOver = false;
            update();
            const finalFrame = {
              screen: game.screen,
              timer: game.gameOverTimer
            };
            update();
            const afterFinalFrame = {
              screen: game.screen,
              timer: game.gameOverTimer,
              reason: game.stageResultReason
            };
            return { finalFrame, afterFinalFrame };
          } finally {
            stopGameOverAudio();
            Object.assign(game, previous);
          }
        },
        debugGameOverStageResultProbe() {
          const previous = { ...game };
          const p1 = createPlayer(1);
          const p2 = createPlayer(2);
          p1.alive = false;
          p1.lives = 0;
          p1.score = 21000;
          p1.stageKills = [5, 1, 0, 0];
          p1.stagePoints = 700;
          p2.alive = false;
          p2.lives = 0;
          p2.score = 800;
          p2.stageKills = [2, 0, 1, 0];
          p2.stagePoints = 500;
          try {
            game.stagePack = builtInStagePack;
            game.screen = "playing";
            game.paused = false;
            game.stage = 5;
            game.playerCount = 2;
            game.customGrid = null;
            game.players = [p1, p2];
            game.runHighScoreBaseline = 20000;
            game.newHighScoreAtGameOver = false;
            enterGameOver();
            game.gameOverTimer = 0;
            finishGameOverScreen();
            const entry = {
              screen: game.screen,
              reason: game.stageResultReason,
              stage: game.stage,
              elapsed: game.stageClearElapsed,
              timer: game.transitionTimer,
              bonusPlayerIds: game.stageClearBonusPlayerIds.slice(),
              bonusAwarded: game.stageClearBonusAwarded,
              newHighScore: game.newHighScoreAtGameOver
            };
            const counted = stageClearPresentation(game.players, 200);
            const scoreBeforeFinish = p1.score;
            game.transitionTimer = 2;
            update();
            const beforeEnd = {
              screen: game.screen,
              reason: game.stageResultReason,
              stage: game.stage,
              timer: game.transitionTimer,
              score: p1.score,
              bonusAwarded: game.stageClearBonusAwarded
            };
            update();
            const afterEnd = {
              screen: game.screen,
              stage: game.stage,
              elapsed: game.fullGameOverElapsed,
              score: p1.score,
              bonusAwarded: game.stageClearBonusAwarded,
              newHighScore: game.newHighScoreAtGameOver
            };
            finishFullGameOverScreen();
            const highScoreRoute = {
              screen: game.screen,
              elapsed: game.highScoreScreenElapsed
            };
    
            stopHighScoreAudio();
            game.stage = gameSettings().stageAdvance.extendedLoopEndStage;
            game.customGrid = null;
            game.newHighScoreAtGameOver = false;
            enterStageResult("gameOver");
            game.transitionTimer = 1;
            update();
            const wrappedStage = {
              screen: game.screen,
              stage: game.stage
            };
            return {
              duration: entry.timer,
              entry,
              visibleRows: counted.rows.map((row) => ({
                typeIndex: row.typeIndex,
                p1VisibleKills: row.p1VisibleKills,
                p2VisibleKills: row.p2VisibleKills
              })),
              scoreBeforeFinish,
              beforeEnd,
              afterEnd,
              highScoreRoute,
              wrappedStage
            };
          } finally {
            stopGameOverAudio();
            stopHighScoreAudio();
            Object.assign(game, previous);
          }
        },
        debugStageClearBonusProbe(p1Kills, p2Kills, p1Lives, p2Lives) {
          const players = [
            {
              id: 1,
              lives: p1Lives === undefined ? 1 : Math.max(0, Math.floor(Number(p1Lives) || 0)),
              stageKills: [Math.max(0, Math.floor(Number(p1Kills) || 0))]
            },
            {
              id: 2,
              lives: p2Lives === undefined ? 1 : Math.max(0, Math.floor(Number(p2Lives) || 0)),
              stageKills: [Math.max(0, Math.floor(Number(p2Kills) || 0))]
            }
          ];
          return {
            points: gameSettings().stageClearBonus.points,
            recipients: stageClearBonusRecipients(players).map((player) => player.id)
          };
        },
        debugStageClearResultRowsProbe(p1Kills, p2Kills, p1BonusPoints, p2BonusPoints) {
          const summary = stageClearResultSummary([
            makeStageClearResultProbePlayer(1, p1Kills, p1BonusPoints),
            makeStageClearResultProbePlayer(2, p2Kills, p2BonusPoints)
          ]);
          return {
            rows: summary.rows.map((row) => ({
              typeIndex: row.typeIndex,
              score: row.score,
              p1Kills: row.p1Kills,
              p1Points: row.p1Points,
              p2Kills: row.p2Kills,
              p2Points: row.p2Points
            })),
            p1EnemyPoints: summary.p1EnemyPoints,
            p2EnemyPoints: summary.p2EnemyPoints,
            p1BonusPoints: summary.p1BonusPoints,
            p2BonusPoints: summary.p2BonusPoints,
            p1StagePoints: summary.p1StagePoints,
            p2StagePoints: summary.p2StagePoints
          };
        },
        debugStageClearRowLayoutProbe() {
          const layout = STAGE_RESULT_ROW_LAYOUT;
          const leftArrowRight = layout.leftArrowX + layout.arrowWidth;
          const miniTankRight = layout.miniTankX + layout.miniTankWidth;
          return {
            ...layout,
            leftGap: layout.miniTankX - leftArrowRight,
            rightGap: layout.rightArrowX - miniTankRight,
            leftOverlapsTank: leftArrowRight > layout.miniTankX,
            tankOverlapsRight: miniTankRight > layout.rightArrowX
          };
        },
        debugStageClearPresentationProbe(p1Kills, p2Kills, elapsed) {
          const players = [
            makeStageClearResultProbePlayer(1, p1Kills, 0),
            makeStageClearResultProbePlayer(2, p2Kills, 0)
          ];
          const presentation = stageClearPresentation(players, elapsed);
          return {
            rows: presentation.rows.map((row) => ({
              typeIndex: row.typeIndex,
              p1Kills: row.p1Kills,
              p2Kills: row.p2Kills,
              firstCountFrame: row.firstCountFrame,
              countStep: row.countStep,
              p1VisibleKills: row.p1VisibleKills,
              p2VisibleKills: row.p2VisibleKills,
              p1VisiblePoints: row.p1VisiblePoints,
              p2VisiblePoints: row.p2VisiblePoints
            })),
            totalsRevealFrame: presentation.totalsRevealFrame,
            bonusRevealFrame: presentation.bonusRevealFrame,
            endFrame: presentation.endFrame,
            duration: stageResultDuration(players),
            showTotals: presentation.showTotals,
            showBonus: presentation.showBonus
          };
        },
        stagePackSchema() {
          return createStagePackSchema();
        }
      };

  }

  return { setupDebugApi: setupDebugApi };
});
