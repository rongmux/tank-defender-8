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
  var BATTLE_PRESENTATION_LAYOUT = sh.BATTLE_PRESENTATION_LAYOUT;
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
  var GAME_OVER_TEXT = sh.GAME_OVER_TEXT;
  var PLAYER_GAME_OVER_STAGE_END_DELAY = sh.PLAYER_GAME_OVER_STAGE_END_DELAY;
  var EXTENDED_STAGE_END_FRAME_HIGH = sh.EXTENDED_STAGE_END_FRAME_HIGH;
  var DEMO_INITIAL_FRAME_LOW = sh.DEMO_INITIAL_FRAME_LOW;
  var STAGE_MAP_DRAW_FRAMES = sh.STAGE_MAP_DRAW_FRAMES;
  var STAGE_ATTRIBUTE_COPY_FRAMES = sh.STAGE_ATTRIBUTE_COPY_FRAMES;
  var STAGE_RESULT_ROW_LAYOUT = sh.STAGE_RESULT_ROW_LAYOUT;
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
  var TILE_TYPES = deps.TILE_TYPES;
  var EMPTY = TILE_TYPES.EMPTY;
  var BRICK = TILE_TYPES.BRICK;
  var STEEL = TILE_TYPES.STEEL;
  var WATER = TILE_TYPES.WATER;
  var FOREST = TILE_TYPES.FOREST;
  var ICE = TILE_TYPES.ICE;

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
  var BASE_DESTRUCTION_TAIL_FRAMES = deps.BASE_DESTRUCTION_TAIL_FRAMES;
  var BRICK = deps.BRICK;
  var CARRIER_FLASH_COLOR = deps.CARRIER_FLASH_COLOR;
  var CARRIER_FLASH_PHASE_FRAMES = deps.CARRIER_FLASH_PHASE_FRAMES;
  var DEFAULT_ENEMY_TOTAL = deps.DEFAULT_ENEMY_TOTAL;
  var DEFAULT_ENEMY_TYPES = deps.DEFAULT_ENEMY_TYPES;
  var DEFAULT_EXPLOSION_CORE_COLOR = deps.DEFAULT_EXPLOSION_CORE_COLOR;
  var DEFAULT_ORIGINAL_STAGE_COUNT = deps.DEFAULT_ORIGINAL_STAGE_COUNT;
  var DEFAULT_PLAYER_UPGRADE_RULES = deps.DEFAULT_PLAYER_UPGRADE_RULES;
  var DIR_X = deps.DIR_X;
  var DIR_Y = deps.DIR_Y;
  var DOWN = deps.DOWN;
  var EDITOR_TILE_TYPES = deps.EDITOR_TILE_TYPES;
  var EMPTY = deps.EMPTY;
  var ENEMY_DESTRUCTION_SCORE_TICKS = deps.ENEMY_DESTRUCTION_SCORE_TICKS;
  var FIXED_FRAME_AUDIO_UPDATE_MODE = deps.FIXED_FRAME_AUDIO_UPDATE_MODE;
  var FOREST = deps.FOREST;
  var FREE_AUDIO_MANIFEST = deps.FREE_AUDIO_MANIFEST;
  var FREE_SPRITE_MANIFEST = deps.FREE_SPRITE_MANIFEST;
  var FULL_BRICK_FRAGMENT_MASK = deps.FULL_BRICK_FRAGMENT_MASK;
  var FULL_GAME_OVER_SCREEN_FRAMES = deps.FULL_GAME_OVER_SCREEN_FRAMES;
  var HIGH_SCORE_SCREEN_FRAMES = deps.HIGH_SCORE_SCREEN_FRAMES;
  var ICE = deps.ICE;
  var LEFT = deps.LEFT;
  var ORIGINAL_EDITOR_PATTERNS = deps.ORIGINAL_EDITOR_PATTERNS;
  var QUAD_GRID = deps.QUAD_GRID;
  var RIGHT = deps.RIGHT;
  var STAGE_CURTAIN_CLOSE_FRAMES = deps.STAGE_CURTAIN_CLOSE_FRAMES;
  var STEEL = deps.STEEL;
  var TILE_TYPES = deps.TILE_TYPES;
  var UP = deps.UP;
  var WATER = deps.WATER;
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
  var compactGameOverGlyph = deps.compactGameOverGlyph;
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
  var isTankDestructionStyle = deps.isTankDestructionStyle;
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
  var rightAlignedPixelTextX = deps.rightAlignedPixelTextX;
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
  var selectBaseDestructionPresentation = deps.baseDestructionPresentation;
  var selectEnemyDestructionPresentation = deps.enemyDestructionPresentation;
  var selectExplosionPresentation = deps.explosionPresentation;
  var selectPlayerDestructionPresentation = deps.playerDestructionPresentation;
  var selectScorePopupPresentation = deps.scorePopupPresentation;
  var selectTankDestructionPresentation = deps.tankDestructionPresentation;
  var selectFullGameOverPresentation = deps.fullGameOverPresentation;
  var selectHighScorePresentation = deps.highScorePresentation;
  var selectStageIntroCurtainState = deps.stageIntroCurtainState;
  var selectStageSelectCurtainState = deps.stageSelectCurtainState;
  var selectTitleScoreLayout = deps.titleScoreLayout;
  var selectGameOverBannerPresentation = deps.gameOverBannerPresentation;
  var selectPanelEnemyCounterRemaining = deps.panelEnemyCounterRemaining;
  var selectPanelLifeCount = deps.panelLifeCount;
  var selectPausePresentation = deps.pausePresentation;
  var selectPlayerGameOverMessagePresentation = deps.playerGameOverMessagePresentation;
  var defaultEnemyTypes = deps.DEFAULT_ENEMY_TYPES;

  deps.requireRuntimeModule("tankMovementRuntime").setupTankMovementRuntime(state, deps);
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
  deps.requireRuntimeModule("battleOutcomeRuntime").setupBattleOutcomeRuntime(state, deps, {
    endTitleDemo: endTitleDemo,
    enterGameOver: enterGameOver,
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
    updatePlayerMovement: updatePlayerMovement
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

  function handleAction(action) {
    initAudio();
    if (action === "one") {
      setTitleMenu(0);
      beginStageSelect(1);
    } else if (action === "two") {
      setTitleMenu(1);
      beginStageSelect(2);
    }
    else if (action === "prev") nextStage(-1);
    else if (action === "next") nextStage(1);
    else if (action === "edit") {
      setTitleMenu(2);
      enterEditor();
    }
    else if (action === "test" && game.screen === "editor") testEditorStage();
    else if (action === "save" && game.screen === "editor") saveEditorStage();
    else if (action === "load" && game.screen === "editor") loadEditorStage();
    else if (action === "clear" && game.screen === "editor") clearEditorStage();
    else if (action === "export" && game.screen === "editor") exportEditorStage();
    else if (action === "import") importStagePackFile();
    else if (action === "pause") togglePause();
    else if (action === "reset") {
      restoreBuiltInStagePack();
    }
  }

  function isPauseInputCode(code) {
    return code === "Enter" || code === "KeyP";
  }

  /**
   * Toggles the active battle pause state. The original pause sound is triggered only on entry.
   * @returns {boolean} Whether an active battle accepted the pause input.
   */
  function togglePause() {
    if (
      game.screen !== "playing" ||
      game.demoMode ||
      game.clearPendingTimer > 0 ||
      game.baseDestroyTimer > 0 ||
      fn.stageEnemiesCleared()
    ) return false;
    game.paused = !game.paused;
    game.pauseElapsed = 0;
    pendingFirePresses.clear();
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
    syncMovementAudio();
    if (game.paused) {
      playSound("pause");
    }
    return true;
  }

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => handleAction(button.dataset.action));
  });

  if (packFileInput) {
    packFileInput.addEventListener("change", async () => {
      const file = packFileInput.files && packFileInput.files[0];
      if (!file) return;
      try {
        const result = loadStagePackJsonText(await file.text());
        showEditorMessage(result.ok ? "IMPORTED" : "BAD");
        if (!result.ok) console.warn(result.error);
      } catch (error) {
        showEditorMessage("ERR");
        console.warn(error);
      } finally {
        packFileInput.value = "";
      }
    });
  }

  window.addEventListener("keydown", (event) => {
    const wasHeld = keys.has(event.code);
    keys.add(event.code);
    const handledCodes = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Space",
      "Enter",
      "KeyW",
      "KeyA",
      "KeyS",
      "KeyD",
      "KeyF",
      "KeyG",
      "KeyZ",
      "Digit1",
      "Digit2",
      "KeyC",
      "KeyE",
      "KeyL",
      "KeyP",
      "KeyR",
      "KeyX",
      "Digit0",
      "Digit3",
      "Digit4",
      "Digit5",
      "Escape"
    ];
    if (handledCodes.includes(event.code)) event.preventDefault();
    if (event.repeat || wasHeld) return;

    if (game.demoMode && (event.code === "Enter" || event.code === "Space" || event.code === "Escape")) {
      keys.delete(event.code);
      endTitleDemo();
      return;
    }
    initAudio();

    if (game.screen === "playing" && !game.paused) pendingFirePresses.add(event.code);

    if (game.screen === "title") {
      if (recordHiddenTitleInput(event.code)) return;
      if (event.code === "Enter" && hiddenMessageTriggerReady()) startHiddenMessage();
      else if (event.code === "Enter" || event.code === "Space") activateTitleMenu();
      else if (event.code === "Digit1") {
        setTitleMenu(0);
        beginStageSelect(1);
      } else if (event.code === "Digit2") {
        setTitleMenu(1);
        beginStageSelect(2);
      }
      else if (event.code === "ArrowUp" || event.code === "KeyW") moveTitleMenu(-1);
      else if (event.code === "ArrowDown" || event.code === "KeyS") {
        if (!reserveTitleDirectionForHiddenInput(event.code)) moveTitleMenu(1);
      }
      else if (event.code === "KeyC" || event.code === "KeyE") {
        setTitleMenu(2);
        enterEditor();
      }
    } else if (game.screen === "stageSelect") {
      if (event.code === "Enter") startSelectedGame();
      else if (event.code === "Space" || event.code === "KeyZ") {
        pendingStageSelectPresses.add(event.code);
      } else if (event.code === "KeyF" || event.code === "KeyX") {
        pendingStageSelectPresses.add(event.code);
      } else if (event.code === "Escape") {
        pendingStageSelectPresses.clear();
        game.screen = "title";
        game.stage = 1;
      }
    } else if (game.screen === "editor") {
      if (event.ctrlKey && event.code === "KeyS") {
        keys.delete(event.code);
        saveEditorStage();
      } else if (event.ctrlKey && event.code === "KeyX") {
        keys.delete(event.code);
        exportEditorStage();
      } else if (isEditorDirectionCode(event.code)) {
        moveEditorFromCode(event.code);
      } else if (event.code === "Space" || event.code === "KeyZ") useOriginalEditorButton(1);
      else if (event.code === "KeyF" || event.code === "KeyX") useOriginalEditorButton(-1);
      else if (event.code === "Enter") exitEditorToTitle();
      else if (event.code === "KeyE") testEditorStage();
      else if (event.code === "KeyL") loadEditorStage();
      else if (event.code === "KeyR") clearEditorStage();
      else if (/^Digit[0-5]$/.test(event.code)) selectEditorBrush(Number(event.code.slice(-1)));
      else if (event.code === "Escape") exitEditorToTitle();
    } else if (game.screen === "gameOver") {
      return;
    } else if (game.screen === "fullGameOver") {
      handleFullGameOverInput(event.code);
    } else if (game.screen === "highScore" || game.screen === "hiddenMessage") {
      return;
    } else if (game.screen === "stageClear" || game.screen === "stageClearClosing") {
      return;
    } else if (isPauseInputCode(event.code)) {
      togglePause();
    }
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(event.code);
  });

  canvas.addEventListener("mousemove", (event) => {
    if (game.screen !== "editor") return;
    const pos = canvasToGame(event);
    game.editorCursor = {
      qc: Math.floor((pos.x - FIELD_X) / HALF),
      qr: Math.floor((pos.y - FIELD_Y) / HALF)
    };
  });

  canvas.addEventListener("mouseleave", () => {
    game.editorCursor = { qc: -1, qr: -1 };
  });

  canvas.addEventListener("click", (event) => {
    if (game.screen !== "editor") return;
    initAudio();
    const pos = canvasToGame(event);
    if (pos.x >= PANEL_X) {
      return;
    }
    if (event.shiftKey) {
      if (event.altKey) {
        cycleEditorCell(Math.floor((pos.x - FIELD_X) / TILE), Math.floor((pos.y - FIELD_Y) / TILE));
      } else {
        paintEditorCell(Math.floor((pos.x - FIELD_X) / TILE), Math.floor((pos.y - FIELD_Y) / TILE));
      }
    } else if (event.altKey) {
      cycleEditorQuadrant(Math.floor((pos.x - FIELD_X) / HALF), Math.floor((pos.y - FIELD_Y) / HALF));
    } else {
      paintEditorQuadrant(Math.floor((pos.x - FIELD_X) / HALF), Math.floor((pos.y - FIELD_Y) / HALF));
    }
  });

  function canvasToGame(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * SCREEN_W,
      y: ((event.clientY - rect.top) / rect.height) * SCREEN_H
    };
  }

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

  function updatePlayerMovement(player, desiredDir, stunned) {
    if (player.stun > 0 && !stunned) return;
    const onIce = fn.isTankOnIce(player);
    const inputDir = stunned || (onIce && (player.slide & 16) !== 0) ? -1 : desiredDir;
    if (inputDir !== -1) {
      if (onIce && (player.slide & 31) === 0) {
        player.slide = gameSettings().playerMovement.iceSlideFrames;
        playSound("movementIce");
      }
      if (player.dir !== inputDir) {
        player.pendingSnap = fn.isPerpendicularTurn(player.dir, inputDir);
        player.dir = inputDir;
      }
      if (player.pendingSnap) {
        fn.snapForDirection(player);
        player.pendingSnap = false;
      }
      fn.moveTank(player, DIR_X[player.dir] * player.speed, DIR_Y[player.dir] * player.speed);
      fn.advanceTankTracks(player);
    } else if (player.slide > 0 && onIce) {
      player.slide -= 1;
      fn.moveTank(
        player,
        DIR_X[player.dir] * gameSettings().playerMovement.iceSlideSpeed,
        DIR_Y[player.dir] * gameSettings().playerMovement.iceSlideSpeed
      );
      fn.advanceTankTracks(player);
    }
  }

  function shouldSpawnEnemies() {
    return true;
  }

  function enterGameOver() {
    if (game.demoMode) {
      endTitleDemo();
      return;
    }
    if (game.screen === "gameOver" || game.screen === "fullGameOver") return;
    stopMovementAudio();
    stopStageStartAudio();
    stopBonusLifeAudio();
    stopPowerUpPickupAudio();
    stopPowerUpAppearAudio();
    stopPauseAudio();
    stopBrickHitAudio();
    stopEnemyHitAudio();
    stopEnemyDestroyAudio();
    stopSteelHitAudio();
    stopPlayerShootAudio();
    stopMovementIceAudio();
    stopScoreCountAudio();
    stopStageBonusAudio();
    game.screen = "gameOver";
    game.paused = false;
    game.tick = 0;
    resetFrameCounters();
    game.frameHigh = EXTENDED_STAGE_END_FRAME_HIGH;
    game.baseDestroyTimer = 0;
    game.playerGameOverMessage = null;
    game.newHighScoreAtGameOver = game.players.some((player) => player.score > game.runHighScoreBaseline);
    game.gameOverTimer = gameOverFieldDuration();
  }

  function render() {
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

    if (game.screen === "title") renderTitle();
    else if (game.screen === "hiddenMessage") renderHiddenMessage();
    else if (game.screen === "highScore") renderHighScore();
    else if (game.screen === "fullGameOver") renderFullGameOver();
    else if (game.screen === "stageSelectClosing") renderStageSelectClosing();
    else if (game.screen === "stageSelect") renderStageSelect();
    else if (game.screen === "editor") renderEditor();
    else if (game.screen === "stageClear") renderStageClear();
    else if (game.screen === "stageClearClosing") renderStageClearClosing();
    else if (game.screen === "stageIntro") renderStageIntro();
    else {
      renderGame();
      if (game.screen === "gameOver") renderGameOver();
      if (game.paused) renderPause();
    }
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
    ctx.fillStyle = "#6b6f78";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    drawText("STAGE", 96, 112, 1, "#15161a");
    drawText(String(game.stage), 152, 112, 1, "#15161a");
  }

  function renderStageSelectClosing() {
    renderTitle();
    renderCurtain(stageSelectCurtainState());
  }

  function renderGame() {
    ctx.fillStyle = "#6b6f78";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    ctx.fillStyle = "#000000";
    ctx.fillRect(FIELD_X, FIELD_Y, FIELD_W, FIELD_H);
    renderTerrain(false, game.grid);
    renderBase();

    for (const player of game.players) {
      if (!player.alive || player.respawn > 0) continue;
      if (player.spawnFlash > 0) {
        drawSpawn(player);
      } else {
        if (isPlayerShieldVisible(player, game.paused)) drawShield(player);
        if (isPlayerTankVisible(player, battleDisplayFrame())) drawTank(player, player.color, player.accent);
      }
    }

    for (const enemy of game.enemies) {
      if (!enemy.alive) continue;
      if (enemy.destroying) continue;
      if (enemy.spawnFlash > 0) drawSpawn(enemy);
      else drawTank(enemy, enemyColor(enemy), enemy.accent);
    }

    for (const bullet of game.bullets) drawBullet(bullet);
    renderProjectileTerrainCover(game.grid);
    renderTerrain(true, game.grid);
    if (game.powerUp) drawPowerUp(game.powerUp);
    renderExplosions();
    renderPlayerDestructions();
    renderEnemyDestructions();
    renderBaseDestruction();
    renderScorePopups();
    renderPlayerGameOverMessage();
    renderPanel();
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
    const sprite = FREE_SPRITE_MANIFEST.sprites.bullet;
    const scale = bullet.w / (sprite && sprite.size ? sprite.size : bullet.w);
    drawScaledManifestSprite("bullet", "default", Math.round(FIELD_X + bullet.x), Math.round(FIELD_Y + bullet.y), scale, {
      primary: bullet.ownerKind === "player" ? "#f8e08b" : "#f7f1c6"
    });
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
    const sprite = FREE_SPRITE_MANIFEST.sprites[spriteName];
    const frame = sprite && sprite.frames[frameName];
    if (!frame) return;
    for (const part of frame) {
      const rect = part.rect;
      const color = palette[part.role] || part.color || "#ffffff";
      if (part.op === "stroke") {
        ctx.strokeStyle = color;
        ctx.strokeRect(x + rect[0], y + rect[1], rect[2], rect[3]);
      } else {
        ctx.fillStyle = color;
        ctx.fillRect(x + rect[0], y + rect[1], rect[2], rect[3]);
      }
    }
  }

  function drawScaledManifestSprite(spriteName, frameName, x, y, scale, palette) {
    const sprite = FREE_SPRITE_MANIFEST.sprites[spriteName];
    const frame = sprite && sprite.frames[frameName];
    if (!frame) return;
    for (const part of frame) {
      const rect = part.rect;
      const color = palette[part.role] || part.color || "#ffffff";
      const rx = x + rect[0] * scale;
      const ry = y + rect[1] * scale;
      const rw = rect[2] * scale;
      const rh = rect[3] * scale;
      if (part.op === "stroke") {
        ctx.strokeStyle = color;
        ctx.strokeRect(rx, ry, rw, rh);
      } else {
        ctx.fillStyle = color;
        ctx.fillRect(rx, ry, rw, rh);
      }
    }
  }

  function renderExplosions() {
    for (const explosion of game.explosions) {
      if (isTankDestructionStyle(explosion.style)) {
        drawTankDestructionExplosion(explosion);
        continue;
      }
      const presentation = explosionPresentation(explosion);
      drawScaledManifestSprite("explosion", "burst", presentation.x, presentation.y, presentation.size / 16, {
        primary: explosion.color,
        core: explosion.coreColor || DEFAULT_EXPLOSION_CORE_COLOR
      });
    }
  }

  function drawTankDestructionExplosion(explosion) {
    const presentation = tankDestructionPresentation(explosion);
    drawManifestSprite("destructionExplosion", presentation.frameName, presentation.spriteX, presentation.spriteY, {
      primary: explosion.color,
      core: explosion.coreColor || DEFAULT_EXPLOSION_CORE_COLOR
    });
    return presentation;
  }

  function renderPlayerDestructions() {
    const rule = fn.explosionRule("playerDestroy");
    for (const player of game.players) {
      if (!player.destroying || player.respawn <= 0) continue;
      const presentation = playerDestructionPresentation(player);
      drawManifestSprite("destructionExplosion", presentation.frameName, presentation.spriteX, presentation.spriteY, {
        primary: rule.color,
        core: rule.coreColor || DEFAULT_EXPLOSION_CORE_COLOR
      });
    }
  }

  function playerDestructionPresentation(player) {
    return selectPlayerDestructionPresentation(player, {
      layout: BATTLE_PRESENTATION_LAYOUT,
      totalTicks: gameSettings().timings.playerRespawn,
      explosionTicks: fn.explosionRule("playerDestroy").ttl
    });
  }

  function renderEnemyDestructions() {
    const rule = fn.explosionRule("enemyDestroy");
    for (const enemy of game.enemies) {
      if (!enemy.alive || !enemy.destroying) continue;
      const presentation = enemyDestructionPresentation(enemy);
      if (presentation.kind === "score") {
        drawText(presentation.text, presentation.x, presentation.y, 1, DEFAULT_EXPLOSION_CORE_COLOR, 5);
        continue;
      }
      drawManifestSprite("destructionExplosion", presentation.frameName, presentation.spriteX, presentation.spriteY, {
        primary: rule.color,
        core: rule.coreColor || DEFAULT_EXPLOSION_CORE_COLOR
      });
    }
  }

  function enemyDestructionPresentation(enemy) {
    return selectEnemyDestructionPresentation(enemy, {
      layout: BATTLE_PRESENTATION_LAYOUT,
      explosionTicks: fn.explosionRule("enemyDestroy").ttl,
      scoreTicks: ENEMY_DESTRUCTION_SCORE_TICKS
    });
  }

  function renderBaseDestruction() {
    const presentation = baseDestructionPresentation(game.baseDestroyTimer);
    if (!presentation) return;
    const rule = fn.explosionRule("baseDestroy");
    drawManifestSprite("destructionExplosion", presentation.frameName, presentation.spriteX, presentation.spriteY, {
      primary: rule.color,
      core: rule.coreColor || DEFAULT_EXPLOSION_CORE_COLOR
    });
  }

  function baseDestructionPresentation(timer) {
    return selectBaseDestructionPresentation(timer, game.base, {
      layout: BATTLE_PRESENTATION_LAYOUT,
      visibleFrames: fn.explosionRule("baseDestroy").ttl,
      tailFrames: BASE_DESTRUCTION_TAIL_FRAMES
    });
  }

  function tankDestructionPresentation(explosion) {
    return selectTankDestructionPresentation(explosion, BATTLE_PRESENTATION_LAYOUT);
  }

  function explosionPresentation(explosion) {
    return selectExplosionPresentation(explosion, BATTLE_PRESENTATION_LAYOUT);
  }

  function renderScorePopups() {
    for (const popup of game.scorePopups) {
      const presentation = scorePopupPresentation(popup);
      drawText(presentation.text, presentation.x, presentation.y, 1, presentation.color, presentation.advance);
    }
  }

  function scorePopupPresentation(popup) {
    return selectScorePopupPresentation(popup, BATTLE_PRESENTATION_LAYOUT);
  }

  function renderPanel() {
    const count = panelEnemyCounterRemaining();
    for (let i = 0; i < enemyTotal(); i += 1) {
      const x = PANEL_X + 8 + (i % 2) * 8;
      const y = 24 + Math.floor(i / 2) * 8;
      drawManifestSprite("enemyCounter", i < count ? "remaining" : "cleared", x, y, {
        primary: i < count ? "#15161a" : "#686c75"
      });
    }
    drawText("1P", PANEL_X + 8, 112, 1, "#15161a");
    drawScaledManifestSprite("miniTank", "up", PANEL_X + 8, 124, 0.57, {
      primary: "#15161a",
      shadow: "#6b6f78"
    });
    drawText(String(panelLifeCount(game.players[0])), PANEL_X + 20, 125, 1, "#15161a");
    if (game.playerCount > 1) {
      drawText("2P", PANEL_X + 8, 144, 1, "#15161a");
      drawScaledManifestSprite("miniTank", "up", PANEL_X + 8, 156, 0.57, {
        primary: "#15161a",
        shadow: "#6b6f78"
      });
      drawText(String(panelLifeCount(game.players[1])), PANEL_X + 20, 157, 1, "#15161a");
    }
    drawStageFlag(PANEL_X + 8, 192);
    drawText(pad2(game.stage), PANEL_X + 10, 211, 1, "#15161a");
    if (game.freezeTimer > 0) drawText("TM", PANEL_X + 8, 176, 1, "#173b67");
  }

  function drawStageFlag(x, y) {
    ctx.fillStyle = "#15161a";
    ctx.fillRect(x, y, 2, 15);
    ctx.fillRect(x + 2, y + 1, 10, 7);
    ctx.fillStyle = "#6b6f78";
    ctx.fillRect(x + 4, y + 3, 6, 3);
  }

  function panelEnemyCounterRemaining(total, spawned) {
    const countTotal = total === undefined ? enemyTotal() : Math.max(0, Math.floor(Number(total) || 0));
    const spawnedCount = spawned === undefined ? game.enemySpawned : Math.max(0, Math.floor(Number(spawned) || 0));
    return selectPanelEnemyCounterRemaining(countTotal, spawnedCount);
  }

  function panelLifeCount(player) {
    return selectPanelLifeCount(player);
  }

  function drawSmallScore(score, x, y, color) {
    drawText(formatScore5(score), x, y, 1, color);
  }

  function formatScore5(score) {
    return String(Math.min(99999, Math.max(0, Math.floor(score || 0)))).padStart(5, "0");
  }

  function renderStageIntro() {
    renderGameBackdrop(game.grid);
    renderBase();
    const curtain = stageIntroCurtainState();
    renderCurtain(curtain);
    const clips = [curtain.top, curtain.bottom].filter((rect) => rect.h > 0);
    drawTextClipped("STAGE", 96, 112, 1, "#15161a", clips);
    drawTextClipped(String(game.stage), 152, 112, 1, "#15161a", clips);
  }

  function renderCurtain(curtain) {
    ctx.fillStyle = "#6b6f78";
    if (curtain.top.h > 0) ctx.fillRect(curtain.top.x, curtain.top.y, curtain.top.w, curtain.top.h);
    if (curtain.bottom.h > 0) ctx.fillRect(curtain.bottom.x, curtain.bottom.y, curtain.bottom.w, curtain.bottom.h);
  }

  function stageSelectCurtainState(timer) {
    const remaining = timer === undefined ? game.transitionTimer : timer;
    return selectStageSelectCurtainState(remaining, {
      screenWidth: SCREEN_W,
      screenHeight: SCREEN_H
    });
  }

  function stageIntroCurtainState(timer) {
    const duration = Math.max(1, gameSettings().timings.stageIntro);
    const remaining = timer === undefined ? game.transitionTimer : timer;
    return selectStageIntroCurtainState(remaining, game.stage, {
      duration,
      screenWidth: SCREEN_W,
      screenHeight: SCREEN_H
    });
  }

  function renderStageClear() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    const presentation = fn.stageClearPresentation();
    const result = presentation.result;
    const p1 = result.p1;
    const p2 = result.p2;

    drawText("HI-SCORE", 64, 24, 1, "#f05a42");
    drawText(formatScore5(game.highScore), 152, 24, 1, "#f05a42");
    drawText("STAGE", 96, 40, 1, "#f3f0d4");
    drawText(String(game.stage), 152, 40, 1, "#f3f0d4");
    drawText("I-PLAYER", 24, 56, 1, "#f05a42");
    drawTextRight(String(p1.score || 0), 88, 72, 1, "#d08b52");
    if (game.playerCount > 1) {
      drawText("II-PLAYER", 168, 56, 1, "#f05a42");
      drawTextRight(String(p2.score || 0), 232, 72, 1, "#d08b52");
    }

    for (const row of presentation.rows) {
      const y = 96 + row.typeIndex * 24;
      drawTextRight(String(row.p1VisiblePoints), 56, y, 1, "#f3f0d4");
      drawText("PTS", 64, y, 1, "#f3f0d4");
      drawTextRight(String(row.p1VisibleKills), STAGE_RESULT_ROW_LAYOUT.p1KillsRightX, y, 1, "#f3f0d4");
      drawResultArrow(STAGE_RESULT_ROW_LAYOUT.leftArrowX, y + 2, -1);
      drawMiniTank(STAGE_RESULT_ROW_LAYOUT.miniTankX, y - 3, row.color);
      if (game.playerCount > 1) {
        drawResultArrow(STAGE_RESULT_ROW_LAYOUT.rightArrowX, y + 2, 1);
        drawText(String(row.p2VisibleKills), STAGE_RESULT_ROW_LAYOUT.p2KillsX, y, 1, "#f3f0d4");
        drawTextRight(String(row.p2VisiblePoints), 200, y, 1, "#f3f0d4");
        drawText("PTS", 208, y, 1, "#f3f0d4");
      }
    }

    ctx.fillStyle = "#f3f0d4";
    ctx.fillRect(96, 180, 64, 1);
    drawText("TOTAL", 48, 184, 1, "#f3f0d4");
    if (presentation.showTotals) {
      drawTextRight(String(totalStageKills(p1)), 104, 184, 1, "#f3f0d4");
      if (game.playerCount > 1) drawText(String(totalStageKills(p2)), 152, 184, 1, "#f3f0d4");
    }

    if (presentation.showBonus && game.stageClearBonusPlayerIds.includes(1)) {
      drawText("BONUS!", 24, 200, 1, "#f05a42");
      drawTextRight(String(gameSettings().stageClearBonus.points), 56, 208, 1, "#f3f0d4");
      drawText("PTS", 64, 208, 1, "#f3f0d4");
    }
    if (presentation.showBonus && game.stageClearBonusPlayerIds.includes(2)) {
      drawText("BONUS!", 176, 200, 1, "#f05a42");
      drawTextRight(String(gameSettings().stageClearBonus.points), 200, 208, 1, "#f3f0d4");
      drawText("PTS", 216, 208, 1, "#f3f0d4");
    }
  }

  function renderStageClearClosing() {
    renderStageClear();
    renderCurtain(stageSelectCurtainState());
  }

  function totalStageKills(player) {
    return player && Array.isArray(player.stageKills)
      ? player.stageKills.reduce((sum, value) => sum + Math.max(0, Math.floor(Number(value) || 0)), 0)
      : 0;
  }

  function drawResultArrow(x, y, direction) {
    ctx.fillStyle = "#f3f0d4";
    if (direction < 0) {
      ctx.fillRect(x, y + 2, 8, 1);
      ctx.fillRect(x, y + 1, 2, 3);
      ctx.fillRect(x + 2, y, 2, 5);
    } else {
      ctx.fillRect(x, y + 2, 8, 1);
      ctx.fillRect(x + 6, y + 1, 2, 3);
      ctx.fillRect(x + 4, y, 2, 5);
    }
  }

  function drawMiniTank(x, y, color) {
    drawManifestSprite("miniTank", "up", x, y, {
      primary: color,
      shadow: "#111111"
    });
  }

  function renderGameOver() {
    const y = gameOverBannerY(game.gameOverTimer);
    const width = GAME_OVER_TEXT.length * 6 - 1;
    drawText(GAME_OVER_TEXT, Math.round((SCREEN_W - width) / 2), y, 1, "#f05a42");
  }

  function renderPlayerGameOverMessage() {
    const presentation = playerGameOverMessagePresentation();
    if (!presentation || !presentation.visible) return;
    drawCompactGameOverWord("GAME", presentation.left, presentation.y + 1);
    drawCompactGameOverWord("OVER", presentation.left + 16, presentation.y + 1);
  }

  function playerGameOverMessagePresentation() {
    return selectPlayerGameOverMessagePresentation(game.playerGameOverMessage, {
      paused: game.paused,
      demoMode: game.demoMode
    });
  }

  function drawCompactGameOverWord(word, x, y) {
    ctx.fillStyle = "#f05a42";
    let cursorX = Math.round(x);
    const top = Math.round(y);
    for (const char of word) {
      const glyph = compactGameOverGlyph(char);
      for (let row = 0; row < glyph.length; row += 1) {
        for (let column = 0; column < glyph[row].length; column += 1) {
          if (glyph[row][column] === "1") ctx.fillRect(cursorX + column, top + row, 1, 1);
        }
      }
      cursorX += 4;
    }
  }

  function gameOverBannerY(timer) {
    const timings = gameSettings().timings;
    return selectGameOverBannerPresentation(timer, {
      slideFrames: timings.gameOverSlide,
      holdFrames: timings.gameOverHold
    }).y;
  }

  function renderPause() {
    const presentation = pausePresentation(battleDisplayFrame());
    if (!presentation.visible) return;
    drawText(presentation.text, presentation.x, presentation.y, 1, "#f3f0d4");
  }

  function pausePresentation(frame) {
    return selectPausePresentation(frame);
  }

  function renderEditor() {
    const grid = game.editorGrid || createStageGrid(game.stage);
    ctx.fillStyle = "#6b6f78";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    ctx.fillStyle = "#000";
    ctx.fillRect(FIELD_X, FIELD_Y, FIELD_W, FIELD_H);
    renderTerrain(false, grid);
    renderBase();
    renderTerrain(true, grid);

    const cursor = game.editorCursor;
    if (
      cursor.qc >= 0 && cursor.qc < QUAD_GRID &&
      cursor.qr >= 0 && cursor.qr < QUAD_GRID &&
      Math.floor(game.editorTick / 16) % 2 === 0
    ) {
      const c = Math.floor(cursor.qc / 2);
      const r = Math.floor(cursor.qr / 2);
      drawManifestSprite("tank", "up", FIELD_X + c * TILE + 1, FIELD_Y + r * TILE + 1, {
        primary: "#e3c64e",
        accent: "#fff0a8",
        shadow: "#111111"
      });
    }
  }

  function drawTileLegend(x, y) {
    for (let i = 0; i < EDITOR_TILE_TYPES.length; i += 1) {
      const px = x + (i % 2) * 14;
      const py = y + Math.floor(i / 2) * 18;
      ctx.fillStyle = "#000";
      ctx.fillRect(px, py, 10, 10);
      const cell = { type: EDITOR_TILE_TYPES[i], mask: 15 };
      if (cell.type === BRICK) drawBrickCell(px, py, cell);
      else if (cell.type === STEEL) drawWallCell(px, py, cell.mask, "#626a76", "#c9d0d9");
      else if (cell.type === WATER) drawWater(px, py);
      else if (cell.type === FOREST) drawForest(px, py);
      else if (cell.type === ICE) drawIce(px, py);
      else {
        ctx.strokeStyle = "#575b64";
        ctx.strokeRect(px, py, 10, 10);
      }
      if (cell.type === game.editorBrush) {
        ctx.strokeStyle = "#e0b84b";
        ctx.strokeRect(px, py, 10, 10);
      }
    }
  }

  function drawText(text, x, y, scale, color, advance) {
    ctx.fillStyle = color || "#ffffff";
    const size = Math.max(1, Math.floor(scale || 1));
    const glyphAdvance = Math.max(5, Math.floor(advance || 6));
    let cursorX = Math.round(x);
    const top = Math.round(y);
    const value = String(text).toUpperCase();
    for (const ch of value) {
      const glyph = pixelGlyph(ch);
      for (let row = 0; row < glyph.length; row += 1) {
        for (let col = 0; col < glyph[row].length; col += 1) {
          if (glyph[row][col] === "1") {
            ctx.fillRect(cursorX + col * size, top + row * size, size, size);
          }
        }
      }
      cursorX += glyphAdvance * size;
    }
  }

  function drawTextClipped(text, x, y, scale, color, clips) {
    if (!clips || !clips.length) return;
    ctx.fillStyle = color || "#ffffff";
    const size = Math.max(1, Math.floor(scale || 1));
    let cursorX = Math.round(x);
    const top = Math.round(y);
    for (const ch of String(text).toUpperCase()) {
      const glyph = pixelGlyph(ch);
      for (let row = 0; row < glyph.length; row += 1) {
        for (let col = 0; col < glyph[row].length; col += 1) {
          if (glyph[row][col] !== "1") continue;
          const px = cursorX + col * size;
          const py = top + row * size;
          for (const clip of clips) {
            const left = Math.max(px, clip.x);
            const right = Math.min(px + size, clip.x + clip.w);
            const clipTop = Math.max(py, clip.y);
            const bottom = Math.min(py + size, clip.y + clip.h);
            if (right > left && bottom > clipTop) ctx.fillRect(left, clipTop, right - left, bottom - clipTop);
          }
        }
      }
      cursorX += 6 * size;
    }
  }

  function drawTextRight(text, right, y, scale, color) {
    const value = String(text);
    const size = Math.max(1, Math.floor(scale || 1));
    drawText(value, rightAlignedPixelTextX(value, right, size), y, size, color);
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
  state.fn.handleAction = handleAction;
  state.fn.isPauseInputCode = isPauseInputCode;
  state.fn.togglePause = togglePause;
  state.fn.canvasToGame = canvasToGame;
  state.fn.tileTypeName = tileTypeName;
  state.fn.updatePlayerMovement = updatePlayerMovement;
  state.fn.shouldSpawnEnemies = shouldSpawnEnemies;
  state.fn.enterGameOver = enterGameOver;
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
