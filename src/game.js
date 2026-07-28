(function () {
  "use strict";

  // ── Module imports ─────────────────────────────────────────────────────
  var deps = (window.TankDefender8Modules || {}).moduleDeps;
  if (!deps) throw new Error("module-deps.js must load before game.js");
  var sh = deps.sharedState;

  // ── Shared-state constant aliases ───────────────────────────────────────
  var SCREEN_W = sh.SCREEN_W;
  var SCREEN_H = sh.SCREEN_H;
  var TILE = sh.TILE;
  var HALF = sh.HALF;
  var FIELD_X = sh.FIELD_X;
  var FIELD_Y = sh.FIELD_Y;
  var FIELD_W = sh.FIELD_W;
  var FIELD_H = sh.FIELD_H;
  var PANEL_X = sh.PANEL_X;
  var STEP_MS = sh.STEP_MS;
  var DEFAULT_HIGH_SCORE = sh.DEFAULT_HIGH_SCORE;
  var TITLE_DEMO_IDLE_FRAMES = sh.TITLE_DEMO_IDLE_FRAMES;
  var DEMO_DISPLAY_STAGE = sh.DEMO_DISPLAY_STAGE;
  var DEMO_MAX_ACTIVE_ENEMIES = sh.DEMO_MAX_ACTIVE_ENEMIES;
  var HIDDEN_MESSAGE_REQUIRED_VISITS = sh.HIDDEN_MESSAGE_REQUIRED_VISITS;
  var HIDDEN_MESSAGE_A_PRESSES = sh.HIDDEN_MESSAGE_A_PRESSES;
  var HIDDEN_MESSAGE_B_PRESSES = sh.HIDDEN_MESSAGE_B_PRESSES;
  var HIDDEN_MESSAGE_TEXT_START = sh.HIDDEN_MESSAGE_TEXT_START;
  var HIDDEN_MESSAGE_STEP_FRAMES = sh.HIDDEN_MESSAGE_STEP_FRAMES;
  var HIDDEN_MESSAGE_DROP_START = sh.HIDDEN_MESSAGE_DROP_START;
  var HIDDEN_MESSAGE_DROP_MORPH_FRAMES = sh.HIDDEN_MESSAGE_DROP_MORPH_FRAMES;
  var HIDDEN_MESSAGE_DROP_FALL_FRAMES = sh.HIDDEN_MESSAGE_DROP_FALL_FRAMES;
  var HIDDEN_MESSAGE_END_FRAME = sh.HIDDEN_MESSAGE_END_FRAME;
  var PLAYER_GAME_OVER_STAGE_END_DELAY = sh.PLAYER_GAME_OVER_STAGE_END_DELAY;
  var EXTENDED_STAGE_END_FRAME_HIGH = sh.EXTENDED_STAGE_END_FRAME_HIGH;
  var DEMO_INITIAL_FRAME_LOW = sh.DEMO_INITIAL_FRAME_LOW;
  var STAGE_MAP_DRAW_FRAMES = sh.STAGE_MAP_DRAW_FRAMES;
  var STAGE_ATTRIBUTE_COPY_FRAMES = sh.STAGE_ATTRIBUTE_COPY_FRAMES;
  var TITLE_MENU_ITEMS = sh.TITLE_MENU_ITEMS;
  var EDITOR_STORAGE_KEY = sh.EDITOR_STORAGE_KEY;
  var HIGH_SCORE_STORAGE_KEY = sh.HIGH_SCORE_STORAGE_KEY;

  // ── DOM references ─────────────────────────────────────────────────────
  var canvas = document.getElementById("game");
  var packFileInput = document.getElementById("stage-pack-file");
  var ctx = canvas.getContext("2d");

  // ── Shared state ───────────────────────────────────────────────────────
  var state = sh.createSharedState({
    canvas: canvas,
    packFileInput: packFileInput,
    ctx: ctx,
    builtInStagePack: deps.createBuiltInStagePack()
  });
  state.fn = {};

  // ── Initialize game state ──────────────────────────────────────────────
  state.game.stagePack = state.builtInStagePack;

  // ── Stage runtime (must be before lifecycle/audio setups) ──────────────
  var stageExports = deps.createStageRuntime({
    getState: function () { return state.game; },
    builtInStagePack: state.builtInStagePack,
    demoMaxActiveEnemies: sh.DEMO_MAX_ACTIVE_ENEMIES
  });
  state.stageRuntime = stageExports;

  var createStageGrid = stageExports.createStageGrid;
  var currentEnemySpawns = stageExports.currentEnemySpawns;
  var currentPlayerSpawns = stageExports.currentPlayerSpawns;
  var currentPowerUpSpawns = stageExports.currentPowerUpSpawns;
  var enemyDataStage = stageExports.enemyDataStage;
  var enemySequenceForStage = stageExports.enemySequenceForStage;
  var enemySpawnPoint = stageExports.enemySpawnPoint;
  var enemyTotal = stageExports.enemyTotal;
  var enemyTypeDefinitions = stageExports.enemyTypeDefinitions;
  var gameSettings = stageExports.gameSettings;
  var getEnemySpec = stageExports.getEnemySpec;
  var isExtendedLoopStage = stageExports.isExtendedLoopStage;
  var mapDataStage = stageExports.mapDataStage;
  var maxActiveEnemies = stageExports.maxActiveEnemies;
  var playerSpawnPoint = stageExports.playerSpawnPoint;
  var stageCount = stageExports.stageCount;
  var stageCycleLimit = stageExports.stageCycleLimit;
  var stageRoute = stageExports.stageRoute;
  var stageSettings = stageExports.stageSettings;

  // ── Setup runtime modules ──────────────────────────────────────────────
  deps.requireRuntimeModule("gameLifecycle").setupGameLifecycle(state, deps);
  deps.requireRuntimeModule("audioBridge").setupAudioBridge(state, deps);
  deps.requireRuntimeModule("editorInputRuntime").setupEditorInputRuntime(state, deps, {
    playSound: playSound,
    showEditorMessage: showEditorMessage,
    tileTypeName: tileTypeName
  });
  deps.requireRuntimeModule("stageSelectRuntime").setupStageSelectRuntime(state, deps, {
    changeStageSelection: changeStageSelection
  });
  deps.requireRuntimeModule("postGameRuntime").setupPostGameRuntime(state, deps, {
    fullGameOverScreenFrames: function () { return FULL_GAME_OVER_SCREEN_FRAMES; },
    highScoreScreenFrames: function () { return HIGH_SCORE_SCREEN_FRAMES; },
    playSound: playSound,
    resetTitleIdleTimer: resetTitleIdleTimer,
    stopAllAudio: function () {
      stopMovementAudio();
      stopStageStartAudio();
      stopBonusLifeAudio();
      stopPowerUpPickupAudio();
      stopPowerUpAppearAudio();
      stopPauseAudio();
      stopBrickHitAudio();
      stopEnemyHitAudio();
      stopBaseHitAudio();
      stopEnemyDestroyAudio();
      stopPlayerDestroyAudio();
      stopSteelHitAudio();
      stopPlayerShootAudio();
      stopMovementIceAudio();
      stopScoreCountAudio();
      stopStageBonusAudio();
      stopGameOverAudio();
      stopHighScoreAudio();
    },
    stopGameOverAudio: stopGameOverAudio,
    stopStageResultAudio: function () {
      stopScoreCountAudio();
      stopStageBonusAudio();
    }
  });

  // ── Stage runtime ──────────────────────────────────────────────────────

  // ── Local aliases (so existing code works unchanged) ────────────────────
  var game = state.game;
  var keys = state.keys;
  var pendingFirePresses = state.pendingFirePresses;
  var pendingStageSelectPresses = state.pendingStageSelectPresses;
  var movementAudio = state.movementAudio;

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

  // ── Tile type constants ────────────────────────────────────────────────
  var BRICK = deps.TILE_TYPES.BRICK;
  var STEEL = deps.TILE_TYPES.STEEL;
  var WATER = deps.TILE_TYPES.WATER;
  var FOREST = deps.TILE_TYPES.FOREST;
  var ICE = deps.TILE_TYPES.ICE;

  // ── Function aliases (delegate to state.fn for extracted modules) ──────
  var fn = state.fn;
  function loadHighScore() { return fn.loadHighScore(); }
  function saveHighScore() { return fn.saveHighScore(); }
  function updateHighScore(s) { return fn.updateHighScore(s); }
  function createPlayer(id) { return fn.createPlayer(id); }
  function resetPlayerPosition(p) { return fn.resetPlayerPosition(p); }
  function startGame(pl, opts) { return fn.startGame(pl, opts); }
  function startTitleDemo() { return fn.startTitleDemo(); }
  function endTitleDemo() { return fn.endTitleDemo(); }
  function updateTitleIdle() { return fn.updateTitleIdle(); }
  function resetTitleIdleTimer() { return fn.resetTitleIdleTimer(); }
  function resetTitleIdleHighByte() { return fn.resetTitleIdleHighByte(); }
  function hiddenMessageTriggerReady() { return fn.hiddenMessageTriggerReady(); }
  function reserveTitleDirectionForHiddenInput(c) { return fn.reserveTitleDirectionForHiddenInput(c); }
  function recordHiddenTitleInput(c) { return fn.recordHiddenTitleInput(c); }
  function startHiddenMessage() { return fn.startHiddenMessage(); }
  function updateHiddenMessage() { return fn.updateHiddenMessage(); }
  function hiddenMessagePresentation(e) { return fn.hiddenMessagePresentation(e); }
  function beginStageSelect(pl) { return fn.beginStageSelect(pl); }
  function startSelectedGame() { return fn.startSelectedGame(); }
  function stageSelectLimit() { return fn.stageSelectLimit(); }
  function changeStageSelection(d) { return fn.changeStageSelection(d); }
  function startStage(st) { return fn.startStage(st); }
  function resetStageStats(p) { return fn.resetStageStats(p); }
  function enterEditor() { return fn.enterEditor(); }
  function exitEditorToTitle() { return fn.exitEditorToTitle(); }
  function moveTitleMenu(d) { return fn.moveTitleMenu(d); }
  function setTitleMenu(i) { return fn.setTitleMenu(i); }
  function activateTitleMenu() { return fn.activateTitleMenu(); }
  function testEditorStage() { return fn.testEditorStage(); }
  function saveEditorStage() { return fn.saveEditorStage(); }
  function loadEditorStage() { return fn.loadEditorStage(); }
  function clearEditorStage() { return fn.clearEditorStage(); }
  function exportEditorStage() { return fn.exportEditorStage(); }
  function importStagePackFile() { return fn.importStagePackFile(); }
  function loadStagePackJsonText(t) { return fn.loadStagePackJsonText(t); }
  function loadStagePackObject(p) { return fn.loadStagePackObject(p); }
  function applyStagePack(p) { return fn.applyStagePack(p); }
  function clearTransientBattleState() { return fn.clearTransientBattleState(); }
  function restoreBuiltInStagePack() { return fn.restoreBuiltInStagePack(); }
  function showEditorMessage(m) { return fn.showEditorMessage(m); }
  function nextStage(d) { return fn.nextStage(d); }
  function moveEditorFromCode(c) { return fn.moveEditorFromCode(c); }
  function moveEditorCursor(dx, dy) { return fn.moveEditorCursor(dx, dy); }
  function useOriginalEditorButton(d) { return fn.useOriginalEditorButton(d); }
  function pasteOriginalEditorPattern() { return fn.pasteOriginalEditorPattern(); }
  function editAtEditorCursor(fullTile) { return fn.editAtEditorCursor(fullTile); }
  function paintEditorCell(c, r) { return fn.paintEditorCell(c, r); }
  function paintEditorQuadrant(qc, qr) { return fn.paintEditorQuadrant(qc, qr); }
  function selectEditorBrush(type) { return fn.selectEditorBrush(type); }
  function selectEditorBrushFromPanel(x, y) { return fn.selectEditorBrushFromPanel(x, y); }
  function cycleEditorCell(c, r) { return fn.cycleEditorCell(c, r); }
  function cycleEditorQuadrant(qc, qr) { return fn.cycleEditorQuadrant(qc, qr); }
  function updateEditorControls() { return fn.updateEditorControls(); }
  function stageSelectAHeld(input) { return fn.stageSelectAHeld(input); }
  function stageSelectBHeld(input) { return fn.stageSelectBHeld(input); }
  function updateStageSelectControls() { return fn.updateStageSelectControls(); }
  function startFullGameOverScreen() { return fn.startFullGameOverScreen(); }
  function updateFullGameOverScreen() { return fn.updateFullGameOverScreen(); }
  function handleFullGameOverInput(code) { return fn.handleFullGameOverInput(code); }
  function finishFullGameOverScreen() { return fn.finishFullGameOverScreen(); }
  function startHighScoreScreen() { return fn.startHighScoreScreen(); }
  function updateHighScoreScreen() { return fn.updateHighScoreScreen(); }
  function returnToTitleAfterGame() { return fn.returnToTitleAfterGame(); }
  function enterStageClear() { return fn.enterStageClear(); }
  function enterStageResult(reason) { return fn.enterStageResult(reason); }
  function finishStageResult() { return fn.finishStageResult(); }
  function finishStageClearClosing() { return fn.finishStageClearClosing(); }
  function finishGameOverScreen() { return fn.finishGameOverScreen(); }
  function gameOverFieldDuration() { return fn.gameOverFieldDuration(); }
  function checkEndState() { return fn.checkEndState(); }
  function updateBattle(options) { return fn.updateBattle(options); }

  // Audio function aliases
  function initAudio() { return fn.initAudio(); }
  function trackSequencedSound(n, o) { return fn.trackSequencedSound(n, o); }
  function stopSound(n) { return fn.stopSound(n); }
  function fixedFrameAudioPresentation(ev, fr) { return fn.fixedFrameAudioPresentation(ev, fr); }
  function shortNoiseBuffer(cr) { return fn.shortNoiseBuffer(cr); }
  function longNoiseBuffer(cr) { return fn.longNoiseBuffer(cr); }
  function createFixedFrameAudioSource(v) { return fn.createFixedFrameAudioSource(v); }
  function stopFixedFrameAudioNodes(aud) { return fn.stopFixedFrameAudioNodes(aud); }
  function syncFixedFrameAudioNodes(aud, ev, audb, rwp) { return fn.syncFixedFrameAudioNodes(aud, ev, audb, rwp); }
  function startFixedFrameAudio(aud, ev, audb, rwp) { return fn.startFixedFrameAudio(aud, ev, audb, rwp); }
  function stopFixedFrameAudio(aud) { return fn.stopFixedFrameAudio(aud); }
  function updateFixedFrameAudio(aud, ev, audb, rwp) { return fn.updateFixedFrameAudio(aud, ev, audb, rwp); }

  function stageStartAudioPresentation(fr) { return fn.stageStartAudioPresentation(fr); }
  function currentAudioMixState() { return fn.currentAudioMixState(); }
  function currentAudioAudibility() { return fn.currentAudioAudibility(); }
  function stageStartAudioAudibility() { return fn.stageStartAudioAudibility(); }
  function syncStageStartAudioNodes() { return fn.syncStageStartAudioNodes(); }
  function startStageStartAudio() { return fn.startStageStartAudio(); }
  function stopStageStartAudio() { return fn.stopStageStartAudio(); }
  function updateStageStartAudio() { return fn.updateStageStartAudio(); }

  function bonusLifeAudioPresentation(fr) { return fn.bonusLifeAudioPresentation(fr); }
  function bonusLifeAudioAudibility() { return fn.bonusLifeAudioAudibility(); }
  function syncBonusLifeAudioNodes() { return fn.syncBonusLifeAudioNodes(); }
  function startBonusLifeAudio() { return fn.startBonusLifeAudio(); }
  function stopBonusLifeAudio() { return fn.stopBonusLifeAudio(); }
  function updateBonusLifeAudio() { return fn.updateBonusLifeAudio(); }
  function bonusLifePulse1Active() { return fn.bonusLifePulse1Active(); }
  function bonusLifePulse2Active() { return fn.bonusLifePulse2Active(); }

  function powerUpPickupAudioPresentation(fr) { return fn.powerUpPickupAudioPresentation(fr); }
  function powerUpPickupAudioAudible() { return fn.powerUpPickupAudioAudible(); }
  function syncPowerUpPickupAudioNodes() { return fn.syncPowerUpPickupAudioNodes(); }
  function startPowerUpPickupAudio() { return fn.startPowerUpPickupAudio(); }
  function stopPowerUpPickupAudio() { return fn.stopPowerUpPickupAudio(); }
  function updatePowerUpPickupAudio() { return fn.updatePowerUpPickupAudio(); }

  function powerUpAppearAudioPresentation(fr) { return fn.powerUpAppearAudioPresentation(fr); }
  function powerUpAppearAudioAudible() { return fn.powerUpAppearAudioAudible(); }
  function syncPowerUpAppearAudioNodes() { return fn.syncPowerUpAppearAudioNodes(); }
  function startPowerUpAppearAudio() { return fn.startPowerUpAppearAudio(); }
  function stopPowerUpAppearAudio() { return fn.stopPowerUpAppearAudio(); }
  function updatePowerUpAppearAudio() { return fn.updatePowerUpAppearAudio(); }

  function brickHitAudioPresentation(fr) { return fn.brickHitAudioPresentation(fr); }
  function brickHitAudioAudible() { return fn.brickHitAudioAudible(); }
  function syncBrickHitAudioNodes() { return fn.syncBrickHitAudioNodes(); }
  function startBrickHitAudio() { return fn.startBrickHitAudio(); }
  function stopBrickHitAudio() { return fn.stopBrickHitAudio(); }
  function updateBrickHitAudio() { return fn.updateBrickHitAudio(); }

  function baseHitAudioPresentation(fr) { return fn.baseHitAudioPresentation(fr); }
  function baseHitAudioAudible() { return fn.baseHitAudioAudible(); }
  function syncBaseHitAudioNodes() { return fn.syncBaseHitAudioNodes(); }
  function syncLowerPriorityPulse2AudioNodes() { return fn.syncLowerPriorityPulse2AudioNodes(); }
  function startBaseHitAudio() { return fn.startBaseHitAudio(); }
  function stopBaseHitAudio() { return fn.stopBaseHitAudio(); }
  function updateBaseHitAudio() { return fn.updateBaseHitAudio(); }

  function steelHitAudioPresentation(fr) { return fn.steelHitAudioPresentation(fr); }
  function steelHitAudioAudible() { return fn.steelHitAudioAudible(); }
  function syncSteelHitAudioNodes() { return fn.syncSteelHitAudioNodes(); }
  function startSteelHitAudio() { return fn.startSteelHitAudio(); }
  function stopSteelHitAudio() { return fn.stopSteelHitAudio(); }
  function updateSteelHitAudio() { return fn.updateSteelHitAudio(); }

  function enemyHitAudioPresentation(fr) { return fn.enemyHitAudioPresentation(fr); }
  function enemyHitAudioAudible() { return fn.enemyHitAudioAudible(); }
  function syncEnemyHitAudioNodes() { return fn.syncEnemyHitAudioNodes(); }
  function startEnemyHitAudio() { return fn.startEnemyHitAudio(); }
  function stopEnemyHitAudio() { return fn.stopEnemyHitAudio(); }
  function updateEnemyHitAudio() { return fn.updateEnemyHitAudio(); }

  function enemyDestroyAudioPresentation(fr) { return fn.enemyDestroyAudioPresentation(fr); }
  function enemyDestroyAudioAudible() { return fn.enemyDestroyAudioAudible(); }
  function syncEnemyDestroyAudioNodes() { return fn.syncEnemyDestroyAudioNodes(); }
  function startEnemyDestroyAudio() { return fn.startEnemyDestroyAudio(); }
  function stopEnemyDestroyAudio() { return fn.stopEnemyDestroyAudio(); }
  function updateEnemyDestroyAudio() { return fn.updateEnemyDestroyAudio(); }

  function playerDestroyAudioPresentation(fr) { return fn.playerDestroyAudioPresentation(fr); }
  function syncPlayerDestroyAudioNodes() { return fn.syncPlayerDestroyAudioNodes(); }
  function startPlayerDestroyAudio() { return fn.startPlayerDestroyAudio(); }
  function stopPlayerDestroyAudio() { return fn.stopPlayerDestroyAudio(); }
  function updatePlayerDestroyAudio() { return fn.updatePlayerDestroyAudio(); }

  function playerShootAudioPresentation(fr) { return fn.playerShootAudioPresentation(fr); }
  function playerShootAudioAudible() { return fn.playerShootAudioAudible(); }
  function syncPlayerShootAudioNodes() { return fn.syncPlayerShootAudioNodes(); }
  function startPlayerShootAudio() { return fn.startPlayerShootAudio(); }
  function stopPlayerShootAudio() { return fn.stopPlayerShootAudio(); }
  function updatePlayerShootAudio() { return fn.updatePlayerShootAudio(); }

  function movementIceAudioPresentation(fr) { return fn.movementIceAudioPresentation(fr); }
  function movementIceAudioAudible() { return fn.movementIceAudioAudible(); }
  function syncMovementIceAudioNodes() { return fn.syncMovementIceAudioNodes(); }
  function startMovementIceAudio() { return fn.startMovementIceAudio(); }
  function stopMovementIceAudio() { return fn.stopMovementIceAudio(); }
  function updateMovementIceAudio() { return fn.updateMovementIceAudio(); }

  function pauseAudioPresentation(fr) { return fn.pauseAudioPresentation(fr); }
  function syncPauseAudioNodes() { return fn.syncPauseAudioNodes(); }
  function startPauseAudio() { return fn.startPauseAudio(); }
  function stopPauseAudio() { return fn.stopPauseAudio(); }
  function updatePauseAudio() { return fn.updatePauseAudio(); }

  function scoreCountAudioPresentation(fr) { return fn.scoreCountAudioPresentation(fr); }
  function syncScoreCountAudioNodes() { return fn.syncScoreCountAudioNodes(); }
  function startScoreCountAudio() { return fn.startScoreCountAudio(); }
  function stopScoreCountAudio() { return fn.stopScoreCountAudio(); }
  function updateScoreCountAudio() { return fn.updateScoreCountAudio(); }

  function stageBonusAudioPresentation(fr) { return fn.stageBonusAudioPresentation(fr); }
  function stageBonusAudioAudible() { return fn.stageBonusAudioAudible(); }
  function syncStageBonusAudioNodes() { return fn.syncStageBonusAudioNodes(); }
  function startStageBonusAudio() { return fn.startStageBonusAudio(); }
  function stopStageBonusAudio() { return fn.stopStageBonusAudio(); }
  function updateStageBonusAudio() { return fn.updateStageBonusAudio(); }

  function gameOverAudioPresentation(fr) { return fn.gameOverAudioPresentation(fr); }
  function syncGameOverAudioNodes() { return fn.syncGameOverAudioNodes(); }
  function startGameOverAudio() { return fn.startGameOverAudio(); }
  function stopGameOverAudio() { return fn.stopGameOverAudio(); }
  function updateGameOverAudio() { return fn.updateGameOverAudio(); }

  function highScoreAudioPresentation(fr) { return fn.highScoreAudioPresentation(fr); }
  function syncHighScoreAudioNodes() { return fn.syncHighScoreAudioNodes(); }
  function startHighScoreAudio() { return fn.startHighScoreAudio(); }
  function stopHighScoreAudio() { return fn.stopHighScoreAudio(); }
  function updateHighScoreAudio() { return fn.updateHighScoreAudio(); }

  function movementAudioPresentation(m, t) { return fn.movementAudioPresentation(m, t); }
  function stopMovementAudioNode() { return fn.stopMovementAudioNode(); }
  function startMovementAudioNode() { return fn.startMovementAudioNode(); }
  function setMovementAudioMode(m) { return fn.setMovementAudioMode(m); }
  function stopMovementAudio() { return fn.stopMovementAudio(); }
  function playerHasMovementSoundState(p) { return fn.playerHasMovementSoundState(p); }
  function playerMovementAudioRequested() { return fn.playerMovementAudioRequested(); }
  function movementAudioModeForState() { return fn.movementAudioModeForState(); }
  function syncMovementAudio() { return fn.syncMovementAudio(); }
  function beep(fr, dur, g, t, d, sn) { return fn.beep(fr, dur, g, t, d, sn); }
  function playSoundVoice(n, v, defs) { return fn.playSoundVoice(n, v, defs); }
  function playSound(n, opts) { return fn.playSound(n, opts); }


  // Deps module aliases
  var CARRIER_FLASH_COLOR = deps.CARRIER_FLASH_COLOR;
  var CARRIER_FLASH_PHASE_FRAMES = deps.CARRIER_FLASH_PHASE_FRAMES;
  var DEFAULT_ENEMY_TOTAL = deps.DEFAULT_ENEMY_TOTAL;
  var DEFAULT_ENEMY_TYPES = deps.DEFAULT_ENEMY_TYPES;
  var DEFAULT_ORIGINAL_STAGE_COUNT = deps.DEFAULT_ORIGINAL_STAGE_COUNT;
  var DEFAULT_PLAYER_UPGRADE_RULES = deps.DEFAULT_PLAYER_UPGRADE_RULES;
  var DIR_X = deps.DIR_X;
  var DIR_Y = deps.DIR_Y;
  var DOWN = deps.DOWN;
  var FIXED_FRAME_AUDIO_UPDATE_MODE = deps.FIXED_FRAME_AUDIO_UPDATE_MODE;
  var FREE_AUDIO_MANIFEST = deps.FREE_AUDIO_MANIFEST;
  var FULL_BRICK_FRAGMENT_MASK = deps.FULL_BRICK_FRAGMENT_MASK;
  var FULL_GAME_OVER_SCREEN_FRAMES = deps.FULL_GAME_OVER_SCREEN_FRAMES;
  var HIGH_SCORE_SCREEN_FRAMES = deps.HIGH_SCORE_SCREEN_FRAMES;
  var LEFT = deps.LEFT;
  var ORIGINAL_EDITOR_PATTERNS = deps.ORIGINAL_EDITOR_PATTERNS;
  var RIGHT = deps.RIGHT;
  var STAGE_CURTAIN_CLOSE_FRAMES = deps.STAGE_CURTAIN_CLOSE_FRAMES;
  var UP = deps.UP;
  var advanceFixedFrameAudioState = deps.advanceFixedFrameAudioState;
  var advanceFrameCounter = deps.advanceFrameCounter;
  // (baseDestructionPresentation — local wrapper, not deps alias)
  var beginFixedFrameAudioState = deps.beginFixedFrameAudioState;
  var brickFragmentRect = deps.brickFragmentRect;
  var brickFragmentsFromQuarterMask = deps.brickFragmentsFromQuarterMask;
  var buildBaseWall = deps.buildBaseWall;
  var canPlayerCollectPowerUp = deps.canPlayerCollectPowerUp;
  var clamp = deps.clamp;
  var clearTile = deps.clearTile;
  var cloneAudioManifest = deps.cloneAudioManifest;
  var cloneEnemyTypes = deps.cloneEnemyTypes;
  var cloneExplosionRules = deps.cloneExplosionRules;
  var cloneGrid = deps.cloneGrid;
  var clonePlayerMovementSettings = deps.clonePlayerMovementSettings;
  var clonePlayerUpgradeRules = deps.clonePlayerUpgradeRules;
  var cloneSpriteManifest = deps.cloneSpriteManifest;
  var cloneWallRules = deps.cloneWallRules;
  var combatSettings = deps.combatSettings;
  var createBuiltInStagePack = deps.createBuiltInStagePack;
  var createEditorStagePack = deps.createEditorStagePack;
  var createFixedFrameAudioState = deps.createFixedFrameAudioState;
  var createPlayerState = deps.createPlayerState;
  var createStagePackSchema = deps.createStagePackSchema;
  var createStageRuntime = deps.createStageRuntime;
  var directionName = deps.directionName;
  var directionTowardTarget = deps.directionTowardTarget;
  var enemyAiSettings = deps.enemyAiSettings;
  var enemyColor = deps.enemyColor;
  // (enemyDestructionPresentation — local wrapper, not deps alias)
  // (explosionPresentation — local wrapper, not deps alias)
  var fixedFrameAudioPresentation = deps.fixedFrameAudioPresentation;
  var fixedFrameAudioUpdateMode = deps.fixedFrameAudioUpdateMode;
  var fixedFrameVoiceDuration = deps.fixedFrameVoiceDuration;
  var fixedFrameVoiceIsAudible = deps.fixedFrameVoiceIsAudible;
  // (fullGameOverPresentation — local wrapper, not deps alias)
  var gameOverBannerPresentation = deps.gameOverBannerPresentation;
  var gameSessionSettings = deps.gameSessionSettings;
  var gridToQuadrants = deps.gridToQuadrants;
  // (highScorePresentation — local wrapper, not deps alias)
  var isEditorDirectionCode = deps.isEditorDirectionCode;
  var isEnemyAtTurnIntersection = deps.isEnemyAtTurnIntersection;
  var isMovementAudioBlocked = deps.isMovementAudioBlocked;
  var isPlayerShieldVisible = deps.isPlayerShieldVisible;
  var isPlayerTankVisible = deps.isPlayerTankVisible;
  var makeCell = deps.makeCell;
  var makeGrid = deps.makeGrid;
  var makeOriginalConstructionGrid = deps.makeOriginalConstructionGrid;
  // (moveEditorCursor — local wrapper, not deps alias)
  var movementAudioPresentation = deps.movementAudioPresentation;
  var normalizeBrickFragmentMask = deps.normalizeBrickFragmentMask;
  // (panelEnemyCounterRemaining — local wrapper, not deps alias)
  // (panelLifeCount — local wrapper, not deps alias)
  var parseEditorStageText = deps.parseEditorStageText;
  var parseJsonText = deps.parseJsonText;
  var parseStageQuadrants = deps.parseStageQuadrants;
  // (pausePresentation — local wrapper, not deps alias)
  var pixelGlyph = deps.pixelGlyph;
  // (playerDestructionPresentation — local wrapper, not deps alias)
  // (playerGameOverMessagePresentation — local wrapper, not deps alias)
  var playerUpgradeOverlayParts = deps.playerUpgradeOverlayParts;
  var powerUpPixelToTilePoint = deps.powerUpPixelToTilePoint;
  var prepareBattleGrid = deps.prepareBattleGrid;
  var prepareConstructedBattleGrid = deps.prepareConstructedBattleGrid;
  var proceduralStage = deps.proceduralStage;
  var quarterMaskFromBrickFragments = deps.quarterMaskFromBrickFragments;
  var quarterRect = deps.quarterRect;
  var rectOverlapArea = deps.rectOverlapArea;
  var resetFixedFrameAudioState = deps.resetFixedFrameAudioState;
  var resetFrameCounter = deps.resetFrameCounter;
  var resetPlayerState = deps.resetPlayerState;
  var resolveAudioAudibility = deps.resolveAudioAudibility;
  var resolveMovementAudioMode = deps.resolveMovementAudioMode;
  // (scorePopupPresentation — local wrapper, not deps alias)
  var serializeEditorStage = deps.serializeEditorStage;
  var serializeEditorStagePack = deps.serializeEditorStagePack;
  var sharedState = deps.sharedState;
  var shieldColorForTick = deps.shieldColorForTick;
  var spawnAnimationPresentation = deps.spawnAnimationPresentation;
  var stageFlowSettings = deps.stageFlowSettings;
  // (stageIntroCurtainState — local wrapper, not deps alias)
  var stageResultVisibleKillCount = deps.stageResultVisibleKillCount;
  var stageRouting = deps.stageRouting;
  // (stageSelectCurtainState — local wrapper, not deps alias)
  var summarizeEnemySequences = deps.summarizeEnemySequences;
  // (tankDestructionPresentation — local wrapper, not deps alias)
  var tankPrimaryColor = deps.tankPrimaryColor;
  var tankTrackFrameName = deps.tankTrackFrameName;
  var targetableEnemyPlayers = deps.targetableEnemyPlayers;
  var timingSettings = deps.timingSettings;
  // (titleScoreLayout — local wrapper, not deps alias)
  var tryNormalizeStagePack = deps.tryNormalizeStagePack;
  var valueNormalization = deps.valueNormalization;

  // Renamed import aliases (original → local name)
  var selectFixedFrameAudioPresentation = deps.fixedFrameAudioPresentation;
  var selectMovementAudioPresentation = deps.movementAudioPresentation;
  var selectAudioAudibility = deps.resolveAudioAudibility;
  var selectMovementAudioMode = deps.resolveMovementAudioMode;
  var selectFullGameOverPresentation = deps.fullGameOverPresentation;
  var selectHighScorePresentation = deps.highScorePresentation;
  var selectTitleScoreLayout = deps.titleScoreLayout;
  var defaultEnemyTypes = deps.DEFAULT_ENEMY_TYPES;

  var textRenderRuntime = deps.requireRuntimeModule("textRenderRuntime").setupTextRenderRuntime(state, deps);
  var spriteRenderRuntime = deps.requireRuntimeModule("spriteRenderRuntime").setupSpriteRenderRuntime(state, deps);
  var battleSceneRenderRuntime = deps.requireRuntimeModule("battleSceneRenderRuntime").setupBattleSceneRenderRuntime(state, deps, {
    battleDisplayFrame: battleDisplayFrame,
    drawBullet: drawBullet,
    drawPowerUp: drawPowerUp,
    drawShield: drawShield,
    drawSpawn: drawSpawn,
    drawTank: drawTank,
    enemyColor: enemyColor,
    isPlayerShieldVisible: isPlayerShieldVisible,
    isPlayerTankVisible: isPlayerTankVisible,
    renderBase: renderBase,
    renderBaseDestruction: renderBaseDestruction,
    renderEnemyDestructions: renderEnemyDestructions,
    renderExplosions: renderExplosions,
    renderPanel: renderPanel,
    renderPlayerDestructions: renderPlayerDestructions,
    renderPlayerGameOverMessage: renderPlayerGameOverMessage,
    renderProjectileTerrainCover: renderProjectileTerrainCover,
    renderScorePopups: renderScorePopups,
    renderTerrain: renderTerrain
  });
  deps.requireRuntimeModule("tankMovementRuntime").setupTankMovementRuntime(state, deps);
  deps.requireRuntimeModule("playerMovementRuntime").setupPlayerMovementRuntime(state, deps, {
    advanceTankTracks: fn.advanceTankTracks,
    gameSettings: gameSettings,
    isPerpendicularTurn: fn.isPerpendicularTurn,
    isTankOnIce: fn.isTankOnIce,
    moveTank: fn.moveTank,
    playSound: playSound,
    snapForDirection: fn.snapForDirection
  });
  deps.requireRuntimeModule("transientEffectsRuntime").setupTransientEffectsRuntime(state, deps, {
    gameSettings: gameSettings
  });
  deps.requireRuntimeModule("projectileRuntime").setupProjectileRuntime(state, deps, {
    gameSettings: gameSettings,
    playSound: playSound
  });
  deps.requireRuntimeModule("battleCombatRuntime").setupBattleCombatRuntime(state, deps, {
    explosionRule: fn.explosionRule,
    gameSettings: gameSettings,
    playSound: playSound,
    resetFrameCounterLow: resetFrameCounterLow,
    resetPlayerPosition: resetPlayerPosition,
    updateHighScore: updateHighScore
  });
  deps.requireRuntimeModule("stageResultRuntime").setupStageResultRuntime(state, deps, {
    addPlayerScore: fn.addPlayerScore,
    enemyDataStage: enemyDataStage,
    enemyTypeDefinitions: enemyTypeDefinitions,
    gameSettings: gameSettings,
    mapDataStage: mapDataStage,
    playSound: playSound,
    stageCycleLimit: stageCycleLimit
  });
  deps.requireRuntimeModule("stageFlowRuntime").setupStageFlowRuntime(state, deps, {
    awardPendingStageClearBonus: fn.awardPendingStageClearBonus,
    gameSettings: gameSettings,
    resetTitleIdleTimer: resetTitleIdleTimer,
    stageAdvanceResult: fn.stageAdvanceResult,
    stageClearBonusRecipients: fn.stageClearBonusRecipients,
    stageCurtainCloseFrames: function () { return STAGE_CURTAIN_CLOSE_FRAMES; },
    stageResultDuration: fn.stageResultDuration,
    startFullGameOverScreen: startFullGameOverScreen,
    startStage: startStage,
    stopGameplayAudioBeforeResult: function () {
      stopMovementAudio();
      stopStageStartAudio();
      stopBonusLifeAudio();
      stopPowerUpPickupAudio();
      stopPowerUpAppearAudio();
      stopPauseAudio();
      stopBrickHitAudio();
      stopEnemyHitAudio();
      stopBaseHitAudio();
      stopEnemyDestroyAudio();
      stopPlayerDestroyAudio();
      stopSteelHitAudio();
      stopPlayerShootAudio();
      stopMovementIceAudio();
      stopScoreCountAudio();
      stopStageBonusAudio();
    },
    stopStageResultAudio: function () {
      stopScoreCountAudio();
      stopStageBonusAudio();
    }
  });
  var gameOverEntryRuntime = deps.requireRuntimeModule("gameOverEntryRuntime").setupGameOverEntryRuntime(state, deps, {
    endTitleDemo: endTitleDemo,
    extendedStageEndFrameHigh: function () { return EXTENDED_STAGE_END_FRAME_HIGH; },
    gameOverFieldDuration: gameOverFieldDuration,
    resetFrameCounters: resetFrameCounters,
    stopBonusLifeAudio: stopBonusLifeAudio,
    stopBrickHitAudio: stopBrickHitAudio,
    stopEnemyDestroyAudio: stopEnemyDestroyAudio,
    stopEnemyHitAudio: stopEnemyHitAudio,
    stopMovementAudio: stopMovementAudio,
    stopMovementIceAudio: stopMovementIceAudio,
    stopPauseAudio: stopPauseAudio,
    stopPlayerShootAudio: stopPlayerShootAudio,
    stopPowerUpAppearAudio: stopPowerUpAppearAudio,
    stopPowerUpPickupAudio: stopPowerUpPickupAudio,
    stopScoreCountAudio: stopScoreCountAudio,
    stopStageBonusAudio: stopStageBonusAudio,
    stopStageStartAudio: stopStageStartAudio,
    stopSteelHitAudio: stopSteelHitAudio
  });
  deps.requireRuntimeModule("battleOutcomeRuntime").setupBattleOutcomeRuntime(state, deps, {
    endTitleDemo: endTitleDemo,
    enterGameOver: gameOverEntryRuntime.enterGameOver,
    enterStageClear: enterStageClear,
    extendedStageEndFrameHigh: function () { return EXTENDED_STAGE_END_FRAME_HIGH; },
    gameSettings: gameSettings,
    playerGameOverMessageActive: function () { return fn.playerGameOverMessageActive(); },
    playerGameOverStageEndDelay: function () { return PLAYER_GAME_OVER_STAGE_END_DELAY; },
    resetFrameCounters: resetFrameCounters,
    stageEnemiesCleared: function () { return fn.stageEnemiesCleared(); }
  });
  deps.requireRuntimeModule("playerUpdateRuntime").setupPlayerUpdateRuntime(state, deps, {
    directionTowardTarget: directionTowardTarget,
    finishPlayerDeath: fn.finishPlayerDeath,
    gameSettings: gameSettings,
    shoot: fn.shoot,
    updatePlayerMovement: fn.updatePlayerMovement
  });
  deps.requireRuntimeModule("battleTimingRuntime").setupBattleTimingRuntime(state, deps, {
    enemyTotal: enemyTotal,
    gameSettings: gameSettings
  });
  deps.requireRuntimeModule("battleRandomRuntime").setupBattleRandomRuntime(state, deps, {
    enemyTotal: enemyTotal,
    getEnemySpec: getEnemySpec
  });
  deps.requireRuntimeModule("powerUpRuntime").setupPowerUpRuntime(state, deps, {
    addPlayerScore: fn.addPlayerScore,
    addScorePopup: fn.addScorePopup,
    buildBaseWall: buildBaseWall,
    canTankOccupy: fn.canTankOccupy,
    destroyEnemy: fn.destroyEnemy,
    gameSettings: gameSettings,
    playSound: playSound,
    randomByte: fn.randomByte,
    rectHitsSolidTerrain: fn.rectHitsSolidTerrain,
    stageSettings: stageSettings
  });
  deps.requireRuntimeModule("enemySpawnRuntime").setupEnemySpawnRuntime(state, deps, {
    clearPowerUpForCarrierSpawn: function (carrier) {
      return fn.clearPowerUpForCarrierSpawn(carrier);
    },
    enemyTypeDefinitions: enemyTypeDefinitions,
    enemySpawnPoint: enemySpawnPoint,
    enemyTotal: enemyTotal,
    gameSettings: gameSettings,
    getEnemySpec: getEnemySpec,
    isExtendedLoopStage: isExtendedLoopStage,
    maxActiveEnemies: maxActiveEnemies,
    stageCycleLimit: stageCycleLimit
  });
  deps.requireRuntimeModule("enemyAiRuntime").setupEnemyAiRuntime(state, deps, {
    defaultEnemySpawnDelay: fn.defaultEnemySpawnDelay,
    directionTowardTarget: directionTowardTarget,
    gameSettings: gameSettings,
    randomByte: fn.randomByte,
    scaleEnemySpawnDelayForPlayers: fn.scaleEnemySpawnDelayForPlayers,
    selectEnemyTargetPlayer: deps.selectEnemyTargetPlayer
  });
  deps.requireRuntimeModule("enemyMovementRuntime").setupEnemyMovementRuntime(state, deps, {
    advanceTankTracks: fn.advanceTankTracks,
    aiRoll: fn.aiRoll,
    canTankOccupy: fn.canTankOccupy,
    chooseEnemyDirectionByPhase: fn.chooseEnemyDirectionByPhase,
    gameSettings: gameSettings,
    isEnemyAtTurnIntersection: isEnemyAtTurnIntersection,
    moveTank: fn.moveTank,
    randomByte: fn.randomByte,
    totalTankOverlapArea: fn.totalTankOverlapArea
  });
  deps.requireRuntimeModule("enemyUpdateRuntime").setupEnemyUpdateRuntime(state, deps, {
    explosionRule: fn.explosionRule,
    gameSettings: gameSettings,
    shoot: fn.shoot,
    shouldEnemyFire: fn.shouldEnemyFire,
    updateEnemyMovement: fn.updateEnemyMovement
  });
  deps.requireRuntimeModule("projectileTargetRuntime").setupProjectileTargetRuntime(state, deps, {
    addRuleExplosion: fn.addRuleExplosion,
    baseDestructionDuration: fn.baseDestructionDuration,
    destroyEnemy: fn.destroyEnemy,
    gameSettings: gameSettings,
    killPlayer: fn.killPlayer,
    playSound: playSound,
    releaseCarrierPowerUp: fn.releaseCarrierPowerUp
  });
  deps.requireRuntimeModule("projectileResolutionRuntime").setupProjectileResolutionRuntime(state, deps, {
    addRuleExplosion: fn.addRuleExplosion,
    gameSettings: gameSettings,
    hitBase: fn.hitBase,
    hitTank: fn.hitTank,
    hitTerrain: fn.hitTerrain,
    playSound: playSound
  });
  deps.requireRuntimeModule("projectileMotionRuntime").setupProjectileMotionRuntime(state, deps, {
    resolveBullet: fn.resolveBullet
  });
  deps.requireRuntimeModule("battleLoopRuntime").setupBattleLoopRuntime(state, deps, {
    checkEndState: checkEndState,
    spawnEnemies: fn.spawnEnemies,
    shouldSpawnEnemies: shouldSpawnEnemies,
    syncMovementAudio: syncMovementAudio,
    updateBaseDestructionTimer: fn.updateBaseDestructionTimer,
    updateBullets: fn.updateBullets,
    updateEnemies: fn.updateEnemies,
    updateExplosions: fn.updateExplosions,
    updateFreezeTimer: fn.updateFreezeTimer,
    updatePlayerGameOverMessage: fn.updatePlayerGameOverMessage,
    updatePlayerInvulnerabilityTimers: fn.updatePlayerInvulnerabilityTimers,
    updatePlayers: fn.updatePlayers,
    updatePowerUp: fn.updatePowerUp,
    updateScorePopups: fn.updateScorePopups,
    updateShovelTimer: fn.updateShovelTimer
  });
  var frameLoopRuntime = deps.requireRuntimeModule("frameLoopRuntime").setupFrameLoopRuntime(state, deps, {
    now: function () { return performance.now(); },
    render: render,
    requestAnimationFrame: function (callback) { return requestAnimationFrame(callback); },
    stepMs: function () { return sh.STEP_MS; },
    update: update
  });
  var screenUpdateRuntime = deps.requireRuntimeModule("screenUpdateRuntime").setupScreenUpdateRuntime(state, deps, {
    advanceFrameCounters: advanceFrameCounters,
    awardPendingStageClearBonus: fn.awardPendingStageClearBonus,
    checkEndState: checkEndState,
    finishGameOverScreen: finishGameOverScreen,
    finishStageClearClosing: finishStageClearClosing,
    finishStageResult: finishStageResult,
    playSound: playSound,
    resetFrameCounterHigh: resetFrameCounterHigh,
    stageClearPresentation: fn.stageClearPresentation,
    stageResultVisibleKillCount: stageResultVisibleKillCount,
    syncMovementAudio: syncMovementAudio,
    updateAudio: function () {
      updateStageStartAudio();
      updateBonusLifeAudio();
      updatePowerUpPickupAudio();
      updatePowerUpAppearAudio();
      updateBrickHitAudio();
      updateBaseHitAudio();
      updateSteelHitAudio();
      updateEnemyHitAudio();
      updateEnemyDestroyAudio();
      updatePlayerDestroyAudio();
      updatePlayerShootAudio();
      updateMovementIceAudio();
      updatePauseAudio();
      updateScoreCountAudio();
      updateStageBonusAudio();
      updateGameOverAudio();
      updateHighScoreAudio();
    },
    updateBattle: updateBattle,
    updateEditorControls: updateEditorControls,
    updateExplosions: fn.updateExplosions,
    updateFullGameOverScreen: updateFullGameOverScreen,
    updateHighScoreScreen: updateHighScoreScreen,
    updateHiddenMessage: updateHiddenMessage,
    updateScorePopups: fn.updateScorePopups,
    updateStageSelectControls: updateStageSelectControls,
    updateTitleIdle: updateTitleIdle
  });
  var titleRenderRuntime = deps.requireRuntimeModule("titleRenderRuntime").setupTitleRenderRuntime(state, deps, {
    drawManifestSprite: drawManifestSprite,
    drawMiniTank: drawMiniTank,
    drawText: drawText,
    fullGameOverPresentation: fullGameOverPresentation,
    highScorePresentation: highScorePresentation,
    hiddenMessagePresentation: hiddenMessagePresentation,
    pixelGlyph: pixelGlyph,
    titleScoreLayout: titleScoreLayout
  });
  var terrainRenderRuntime = deps.requireRuntimeModule("terrainRenderRuntime").setupTerrainRenderRuntime(state, deps, {
    drawManifestSprite: drawManifestSprite,
    normalizeBrickFragmentMask: normalizeBrickFragmentMask,
    quarterMaskFromBrickFragments: quarterMaskFromBrickFragments
  });
  var tankRenderRuntime = deps.requireRuntimeModule("tankRenderRuntime").setupTankRenderRuntime(state, deps, {
    battleDisplayFrame: battleDisplayFrame,
    directionName: directionName,
    drawManifestSprite: drawManifestSprite,
    drawScaledManifestSprite: drawScaledManifestSprite,
    gameSettings: gameSettings,
    playerUpgradeOverlayParts: playerUpgradeOverlayParts,
    shieldColorForTick: shieldColorForTick,
    spawnAnimationPresentation: spawnAnimationPresentation,
    tankPrimaryColor: tankPrimaryColor,
    tankTrackFrameName: tankTrackFrameName
  });
  var powerUpRenderRuntime = deps.requireRuntimeModule("powerUpRenderRuntime").setupPowerUpRenderRuntime(state, deps, {
    battleDisplayFrame: battleDisplayFrame,
    drawManifestSprite: drawManifestSprite
  });
  var projectileRenderRuntime = deps.requireRuntimeModule("projectileRenderRuntime").setupProjectileRenderRuntime(state, deps, {
    drawScaledManifestSprite: drawScaledManifestSprite
  });
  var effectRenderRuntime = deps.requireRuntimeModule("effectRenderRuntime").setupEffectRenderRuntime(state, deps, {
    drawManifestSprite: drawManifestSprite,
    drawScaledManifestSprite: drawScaledManifestSprite,
    drawText: drawText,
    explosionRule: fn.explosionRule,
    gameSettings: gameSettings
  });
  var stageResultRenderRuntime = deps.requireRuntimeModule("stageResultRenderRuntime").setupStageResultRenderRuntime(state, deps, {
    drawMiniTank: drawMiniTank,
    drawText: drawText,
    drawTextRight: drawTextRight,
    gameSettings: gameSettings,
    renderCurtain: renderCurtain,
    stageClearPresentation: fn.stageClearPresentation,
    stageSelectCurtainState: stageSelectCurtainState
  });
  var battleHudRenderRuntime = deps.requireRuntimeModule("battleHudRenderRuntime").setupBattleHudRenderRuntime(state, deps, {
    battleDisplayFrame: battleDisplayFrame,
    drawManifestSprite: drawManifestSprite,
    drawScaledManifestSprite: drawScaledManifestSprite,
    drawText: drawText,
    enemyTotal: enemyTotal,
    gameSettings: gameSettings
  });
  var editorRenderRuntime = deps.requireRuntimeModule("editorRenderRuntime").setupEditorRenderRuntime(state, deps, {
    createStageGrid: createStageGrid,
    drawBrickCell: drawBrickCell,
    drawForest: drawForest,
    drawIce: drawIce,
    drawManifestSprite: drawManifestSprite,
    drawWallCell: drawWallCell,
    drawWater: drawWater,
    renderBase: renderBase,
    renderTerrain: renderTerrain
  });
  var screenTransitionRenderRuntime = deps.requireRuntimeModule("screenTransitionRenderRuntime").setupScreenTransitionRenderRuntime(state, deps, {
    drawText: drawText,
    drawTextClipped: drawTextClipped,
    gameSettings: gameSettings,
    renderBase: renderBase,
    renderGameBackdrop: renderGameBackdrop,
    renderTitle: renderTitle
  });
  var screenRenderRuntime = deps.requireRuntimeModule("screenRenderRuntime").setupScreenRenderRuntime(state, deps, {
    renderEditor: renderEditor,
    renderFullGameOver: renderFullGameOver,
    renderGame: renderGame,
    renderGameOver: renderGameOver,
    renderHighScore: renderHighScore,
    renderHiddenMessage: renderHiddenMessage,
    renderPause: renderPause,
    renderStageClear: renderStageClear,
    renderStageClearClosing: renderStageClearClosing,
    renderStageIntro: renderStageIntro,
    renderStageSelect: renderStageSelect,
    renderStageSelectClosing: renderStageSelectClosing,
    renderTitle: renderTitle
  });

  deps.requireRuntimeModule("inputRuntime").setupInputRuntime(state, {
    dom: { document: document, window: window },
    isEditorDirectionCode: isEditorDirectionCode,
    sharedState: sh
  }, {
    activateTitleMenu: activateTitleMenu,
    beginStageSelect: beginStageSelect,
    clearEditorStage: clearEditorStage,
    cycleEditorCell: cycleEditorCell,
    cycleEditorQuadrant: cycleEditorQuadrant,
    endTitleDemo: endTitleDemo,
    enterEditor: enterEditor,
    exitEditorToTitle: exitEditorToTitle,
    exportEditorStage: exportEditorStage,
    handleFullGameOverInput: handleFullGameOverInput,
    hiddenMessageTriggerReady: hiddenMessageTriggerReady,
    importStagePackFile: importStagePackFile,
    initAudio: initAudio,
    loadEditorStage: loadEditorStage,
    loadStagePackJsonText: loadStagePackJsonText,
    moveEditorFromCode: moveEditorFromCode,
    moveTitleMenu: moveTitleMenu,
    nextStage: nextStage,
    paintEditorCell: paintEditorCell,
    paintEditorQuadrant: paintEditorQuadrant,
    playSound: playSound,
    recordHiddenTitleInput: recordHiddenTitleInput,
    reserveTitleDirectionForHiddenInput: reserveTitleDirectionForHiddenInput,
    restoreBuiltInStagePack: restoreBuiltInStagePack,
    saveEditorStage: saveEditorStage,
    selectEditorBrush: selectEditorBrush,
    setTitleMenu: setTitleMenu,
    showEditorMessage: showEditorMessage,
    stageEnemiesCleared: function () { return fn.stageEnemiesCleared(); },
    startHiddenMessage: startHiddenMessage,
    startSelectedGame: startSelectedGame,
    syncBaseHitAudioNodes: syncBaseHitAudioNodes,
    syncBonusLifeAudioNodes: syncBonusLifeAudioNodes,
    syncBrickHitAudioNodes: syncBrickHitAudioNodes,
    syncEnemyDestroyAudioNodes: syncEnemyDestroyAudioNodes,
    syncEnemyHitAudioNodes: syncEnemyHitAudioNodes,
    syncMovementAudio: syncMovementAudio,
    syncMovementIceAudioNodes: syncMovementIceAudioNodes,
    syncPauseAudioNodes: syncPauseAudioNodes,
    syncPlayerDestroyAudioNodes: syncPlayerDestroyAudioNodes,
    syncPlayerShootAudioNodes: syncPlayerShootAudioNodes,
    syncPowerUpAppearAudioNodes: syncPowerUpAppearAudioNodes,
    syncPowerUpPickupAudioNodes: syncPowerUpPickupAudioNodes,
    syncStageStartAudioNodes: syncStageStartAudioNodes,
    syncSteelHitAudioNodes: syncSteelHitAudioNodes,
    testEditorStage: testEditorStage,
    useOriginalEditorButton: useOriginalEditorButton
  });

  function update() {
    return screenUpdateRuntime.updateFrame();
  }

  function advanceFrameCounters() {
    applyFrameCounter(advanceFrameCounter(game));
  }

  function resetFrameCounterLow() {
    applyFrameCounter(resetFrameCounter(game, true, false));
  }

  function resetFrameCounterHigh() {
    applyFrameCounter(resetFrameCounter(game, false, true));
  }

  function resetFrameCounters() {
    applyFrameCounter(resetFrameCounter(game));
  }

  function applyFrameCounter(counter) {
    game.frameLow = counter.frameLow;
    game.frameHigh = counter.frameHigh;
  }

  function tileTypeName(type) {
    if (type === BRICK) return "brick";
    if (type === STEEL) return "steel";
    if (type === WATER) return "water";
    if (type === FOREST) return "forest";
    if (type === ICE) return "ice";
    return "empty";
  }

  function shouldSpawnEnemies() {
    return true;
  }

  function render() {
    return screenRenderRuntime.render();
  }

  function renderTitle() {
    return titleRenderRuntime.renderTitle();
  }

  function renderHiddenMessage() {
    return titleRenderRuntime.renderHiddenMessage();
  }

  function renderHighScore() {
    return titleRenderRuntime.renderHighScore();
  }

  function renderFullGameOver() {
    return titleRenderRuntime.renderFullGameOver();
  }

  function fullGameOverPresentation(elapsed) {
    return selectFullGameOverPresentation(elapsed);
  }

  function highScorePresentation(elapsed, score) {
    return selectHighScorePresentation(elapsed, score, { screenWidth: SCREEN_W });
  }

  function titleScoreLayout(menuIndex) {
    const selected = menuIndex === undefined ? game.titleMenu : menuIndex;
    return selectTitleScoreLayout(selected, game.highScore);
  }

  function drawStripedTitleText(text, x, y, scale, palette) {
    return titleRenderRuntime.drawStripedTitleText(text, x, y, scale, palette);
  }

  function drawTitleMenuCursor(item) {
    return titleRenderRuntime.drawTitleMenuCursor(item);
  }

  function renderStageSelect() {
    return screenTransitionRenderRuntime.renderStageSelect();
  }

  function renderStageSelectClosing() {
    return screenTransitionRenderRuntime.renderStageSelectClosing();
  }

  function renderGame() {
    return battleSceneRenderRuntime.renderGame();
  }

  function renderGameBackdrop(grid) {
    return terrainRenderRuntime.renderGameBackdrop(grid);
  }

  function renderTerrain(topLayer, grid) {
    return terrainRenderRuntime.renderTerrain(topLayer, grid);
  }

  function drawWallCell(x, y, mask, dark, light) {
    return terrainRenderRuntime.drawWallCell(x, y, mask, dark, light);
  }

  function drawBrickCell(x, y, cell) {
    return terrainRenderRuntime.drawBrickCell(x, y, cell);
  }

  function drawWater(x, y) {
    return terrainRenderRuntime.drawWater(x, y);
  }

  function waterFrameName(tick) {
    return terrainRenderRuntime.waterFrameName(tick);
  }

  function drawIce(x, y) {
    return terrainRenderRuntime.drawIce(x, y);
  }

  function renderProjectileTerrainCover(grid) {
    return terrainRenderRuntime.renderProjectileTerrainCover(grid);
  }

  function drawIceProjectileCover(x, y) {
    return terrainRenderRuntime.drawIceProjectileCover(x, y);
  }

  function drawForest(x, y) {
    return terrainRenderRuntime.drawForest(x, y);
  }

  function renderBase() {
    return terrainRenderRuntime.renderBase();
  }

  function drawTank(tank, color, accent) {
    return tankRenderRuntime.drawTank(tank, color, accent);
  }

  function drawPlayerUpgradeOverlay(tank, x, y, accent) {
    return tankRenderRuntime.drawPlayerUpgradeOverlay(tank, x, y, accent);
  }

  function drawShield(tank) {
    return tankRenderRuntime.drawShield(tank);
  }

  function drawSpawn(tank) {
    return tankRenderRuntime.drawSpawn(tank);
  }

  function drawBullet(bullet) {
    return projectileRenderRuntime.drawBullet(bullet);
  }

  function drawPowerUp(power) {
    return powerUpRenderRuntime.drawPowerUp(power);
  }

  function isPowerUpVisible(tick) {
    return powerUpRenderRuntime.isPowerUpVisible(tick);
  }

  /**
   * Returns the visual frame phase used by display handlers that keep running
   * while the battle simulation is paused.
   */
  function battleDisplayFrame() {
    return game.frameLow;
  }

  function powerUpVisualRect(power) {
    return powerUpRenderRuntime.powerUpVisualRect(power);
  }

  function drawManifestSprite(spriteName, frameName, x, y, palette) {
    return spriteRenderRuntime.drawManifestSprite(spriteName, frameName, x, y, palette);
  }

  function drawScaledManifestSprite(spriteName, frameName, x, y, scale, palette) {
    return spriteRenderRuntime.drawScaledManifestSprite(spriteName, frameName, x, y, scale, palette);
  }

  function renderExplosions() {
    return effectRenderRuntime.renderExplosions();
  }

  function drawTankDestructionExplosion(explosion) {
    return effectRenderRuntime.drawTankDestructionExplosion(explosion);
  }

  function renderPlayerDestructions() {
    return effectRenderRuntime.renderPlayerDestructions();
  }

  function playerDestructionPresentation(player) {
    return effectRenderRuntime.playerDestructionPresentation(player);
  }

  function renderEnemyDestructions() {
    return effectRenderRuntime.renderEnemyDestructions();
  }

  function enemyDestructionPresentation(enemy) {
    return effectRenderRuntime.enemyDestructionPresentation(enemy);
  }

  function renderBaseDestruction() {
    return effectRenderRuntime.renderBaseDestruction();
  }

  function baseDestructionPresentation(timer) {
    return effectRenderRuntime.baseDestructionPresentation(timer);
  }

  function tankDestructionPresentation(explosion) {
    return effectRenderRuntime.tankDestructionPresentation(explosion);
  }

  function explosionPresentation(explosion) {
    return effectRenderRuntime.explosionPresentation(explosion);
  }

  function renderScorePopups() {
    return effectRenderRuntime.renderScorePopups();
  }

  function scorePopupPresentation(popup) {
    return effectRenderRuntime.scorePopupPresentation(popup);
  }

  function renderPanel() {
    return battleHudRenderRuntime.renderPanel();
  }

  function drawStageFlag(x, y) {
    return battleHudRenderRuntime.drawStageFlag(x, y);
  }

  function panelEnemyCounterRemaining(total, spawned) {
    return battleHudRenderRuntime.panelEnemyCounterRemaining(total, spawned);
  }

  function panelLifeCount(player) {
    return battleHudRenderRuntime.panelLifeCount(player);
  }

  function drawSmallScore(score, x, y, color) {
    return stageResultRenderRuntime.drawSmallScore(score, x, y, color);
  }

  function formatScore5(score) {
    return stageResultRenderRuntime.formatScore5(score);
  }

  function renderStageIntro() {
    return screenTransitionRenderRuntime.renderStageIntro();
  }

  function renderCurtain(curtain) {
    return screenTransitionRenderRuntime.renderCurtain(curtain);
  }

  function stageSelectCurtainState(timer) {
    return screenTransitionRenderRuntime.stageSelectCurtainState(timer);
  }

  function stageIntroCurtainState(timer) {
    return screenTransitionRenderRuntime.stageIntroCurtainState(timer);
  }

  function renderStageClear() {
    return stageResultRenderRuntime.renderStageClear();
  }

  function renderStageClearClosing() {
    return stageResultRenderRuntime.renderStageClearClosing();
  }

  function totalStageKills(player) {
    return stageResultRenderRuntime.totalStageKills(player);
  }

  function drawResultArrow(x, y, direction) {
    return stageResultRenderRuntime.drawResultArrow(x, y, direction);
  }

  function drawMiniTank(x, y, color) {
    drawManifestSprite("miniTank", "up", x, y, {
      primary: color,
      shadow: "#111111"
    });
  }

  function renderGameOver() {
    return battleHudRenderRuntime.renderGameOver();
  }

  function renderPlayerGameOverMessage() {
    return battleHudRenderRuntime.renderPlayerGameOverMessage();
  }

  function playerGameOverMessagePresentation() {
    return battleHudRenderRuntime.playerGameOverMessagePresentation();
  }

  function drawCompactGameOverWord(word, x, y) {
    return battleHudRenderRuntime.drawCompactGameOverWord(word, x, y);
  }

  function gameOverBannerY(timer) {
    return battleHudRenderRuntime.gameOverBannerY(timer);
  }

  function renderPause() {
    return battleHudRenderRuntime.renderPause();
  }

  function pausePresentation(frame) {
    return battleHudRenderRuntime.pausePresentation(frame);
  }

  function renderEditor() {
    return editorRenderRuntime.renderEditor();
  }

  function drawTileLegend(x, y) {
    return editorRenderRuntime.drawTileLegend(x, y);
  }

  function drawText(text, x, y, scale, color, advance) {
    return textRenderRuntime.drawText(text, x, y, scale, color, advance);
  }

  function drawTextClipped(text, x, y, scale, color, clips) {
    return textRenderRuntime.drawTextClipped(text, x, y, scale, color, clips);
  }

  function drawTextRight(text, right, y, scale, color) {
    return textRenderRuntime.drawTextRight(text, right, y, scale, color);
  }

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function preparePausedDebugBattle(tick) {
    game.screen = "playing";
    game.demoMode = false;
    game.paused = true;
    game.pauseElapsed = 0;
    game.tick = Math.max(0, Math.floor(Number(tick) || 0));
    game.frameLow = game.tick & 0xff;
    game.frameHigh = Math.floor(game.tick / 0x40) & 0xff;
    game.base = { x: 6 * sh.TILE, y: 12 * sh.TILE, w: sh.TILE, h: sh.TILE, alive: true };
    game.players = [{ alive: true, lives: 1, respawn: 0 }];
    game.enemies = [];
    game.enemySpawned = 0;
    game.clearPendingTimer = 0;
    game.scorePopups = [];
  }


  // ── Register local functions on state.fn (for debug-api access) ──────
  state.fn.update = update;
  state.fn.render = render;
  state.fn.tileTypeName = tileTypeName;
  state.fn.shouldSpawnEnemies = shouldSpawnEnemies;
  state.fn.renderTitle = renderTitle;
  state.fn.renderHiddenMessage = renderHiddenMessage;
  state.fn.renderHighScore = renderHighScore;
  state.fn.renderFullGameOver = renderFullGameOver;
  state.fn.fullGameOverPresentation = fullGameOverPresentation;
  state.fn.highScorePresentation = highScorePresentation;
  state.fn.titleScoreLayout = titleScoreLayout;
  state.fn.drawStripedTitleText = drawStripedTitleText;
  state.fn.drawTitleMenuCursor = drawTitleMenuCursor;
  state.fn.renderStageSelect = renderStageSelect;
  state.fn.renderStageSelectClosing = renderStageSelectClosing;
  state.fn.renderGame = renderGame;
  state.fn.renderGameBackdrop = renderGameBackdrop;
  state.fn.renderTerrain = renderTerrain;
  state.fn.drawWallCell = drawWallCell;
  state.fn.drawBrickCell = drawBrickCell;
  state.fn.drawWater = drawWater;
  state.fn.waterFrameName = waterFrameName;
  state.fn.drawIce = drawIce;
  state.fn.renderProjectileTerrainCover = renderProjectileTerrainCover;
  state.fn.drawIceProjectileCover = drawIceProjectileCover;
  state.fn.drawForest = drawForest;
  state.fn.renderBase = renderBase;
  state.fn.drawTank = drawTank;
  state.fn.drawPlayerUpgradeOverlay = drawPlayerUpgradeOverlay;
  state.fn.drawShield = drawShield;
  state.fn.drawSpawn = drawSpawn;
  state.fn.drawBullet = drawBullet;
  state.fn.drawPowerUp = drawPowerUp;
  state.fn.isPowerUpVisible = isPowerUpVisible;
  state.fn.battleDisplayFrame = battleDisplayFrame;
  state.fn.powerUpVisualRect = powerUpVisualRect;
  state.fn.drawManifestSprite = drawManifestSprite;
  state.fn.drawScaledManifestSprite = drawScaledManifestSprite;
  state.fn.renderExplosions = renderExplosions;
  state.fn.drawTankDestructionExplosion = drawTankDestructionExplosion;
  state.fn.renderPlayerDestructions = renderPlayerDestructions;
  state.fn.playerDestructionPresentation = playerDestructionPresentation;
  state.fn.renderEnemyDestructions = renderEnemyDestructions;
  state.fn.enemyDestructionPresentation = enemyDestructionPresentation;
  state.fn.renderBaseDestruction = renderBaseDestruction;
  state.fn.baseDestructionPresentation = baseDestructionPresentation;
  state.fn.tankDestructionPresentation = tankDestructionPresentation;
  state.fn.explosionPresentation = explosionPresentation;
  state.fn.renderScorePopups = renderScorePopups;
  state.fn.scorePopupPresentation = scorePopupPresentation;
  state.fn.renderPanel = renderPanel;
  state.fn.drawStageFlag = drawStageFlag;
  state.fn.panelEnemyCounterRemaining = panelEnemyCounterRemaining;
  state.fn.panelLifeCount = panelLifeCount;
  state.fn.drawSmallScore = drawSmallScore;
  state.fn.formatScore5 = formatScore5;
  state.fn.renderStageIntro = renderStageIntro;
  state.fn.renderCurtain = renderCurtain;
  state.fn.stageSelectCurtainState = stageSelectCurtainState;
  state.fn.stageIntroCurtainState = stageIntroCurtainState;
  state.fn.renderStageClear = renderStageClear;
  state.fn.renderStageClearClosing = renderStageClearClosing;
  state.fn.totalStageKills = totalStageKills;
  state.fn.drawResultArrow = drawResultArrow;
  state.fn.drawMiniTank = drawMiniTank;
  state.fn.renderGameOver = renderGameOver;
  state.fn.renderPlayerGameOverMessage = renderPlayerGameOverMessage;
  state.fn.playerGameOverMessagePresentation = playerGameOverMessagePresentation;
  state.fn.drawCompactGameOverWord = drawCompactGameOverWord;
  state.fn.gameOverBannerY = gameOverBannerY;
  state.fn.renderPause = renderPause;
  state.fn.pausePresentation = pausePresentation;
  state.fn.renderEditor = renderEditor;
  state.fn.drawTileLegend = drawTileLegend;
  state.fn.drawText = drawText;
  state.fn.drawTextClipped = drawTextClipped;
  state.fn.drawTextRight = drawTextRight;
  state.fn.pad2 = pad2;
  state.fn.preparePausedDebugBattle = preparePausedDebugBattle;
  state.fn.advanceFrameCounters = advanceFrameCounters;
  state.fn.resetFrameCounterLow = resetFrameCounterLow;
  state.fn.resetFrameCounterHigh = resetFrameCounterHigh;
  state.fn.resetFrameCounters = resetFrameCounters;
  state.fn.applyFrameCounter = applyFrameCounter;

  // Stage-runtime functions (used by debug-api)
  state.fn.gameSettings = gameSettings;
  state.fn.enemyTypeDefinitions = enemyTypeDefinitions;
  state.fn.stageCount = stageCount;
  state.fn.stageCycleLimit = stageCycleLimit;
  state.fn.stageRoute = stageRoute;
  state.fn.enemySequenceForStage = enemySequenceForStage;
  state.fn.enemyTotal = enemyTotal;
  state.fn.enemySpawnPoint = enemySpawnPoint;
  state.fn.maxActiveEnemies = maxActiveEnemies;
  state.fn.getEnemySpec = getEnemySpec;
  state.fn.currentEnemySpawns = currentEnemySpawns;
  state.fn.currentPlayerSpawns = currentPlayerSpawns;
  state.fn.currentPowerUpSpawns = currentPowerUpSpawns;
  state.fn.enemyDataStage = enemyDataStage;
  state.fn.mapDataStage = mapDataStage;
  state.fn.playerSpawnPoint = playerSpawnPoint;
  state.fn.isExtendedLoopStage = isExtendedLoopStage;
  state.fn.stageSettings = stageSettings;
  state.fn.createStageGrid = createStageGrid;

  // ── Debug API (must be last) ───────────────────────────────────────────
  deps.requireRuntimeModule("debugApi").setupDebugApi(state, deps);

  // ── Main loop ──────────────────────────────────────────────────────────
  loadHighScore();
  state.game.grid = createStageGrid(state.game.stage);
  frameLoopRuntime.start();
})();
