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
  var GRID = sh.GRID;
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
  var PLAYER_GAME_OVER_MESSAGE_TIMER = sh.PLAYER_GAME_OVER_MESSAGE_TIMER;
  var PLAYER_GAME_OVER_MESSAGE_MOVE_THRESHOLD = sh.PLAYER_GAME_OVER_MESSAGE_MOVE_THRESHOLD;
  var PLAYER_GAME_OVER_MESSAGE_Y = sh.PLAYER_GAME_OVER_MESSAGE_Y;
  var PLAYER_GAME_OVER_MESSAGE_HIDDEN_Y = sh.PLAYER_GAME_OVER_MESSAGE_HIDDEN_Y;
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
  var BRICK_QUARTER_FRAGMENT_MASKS = deps.BRICK_QUARTER_FRAGMENT_MASKS;
  var CARRIER_FLASH_COLOR = deps.CARRIER_FLASH_COLOR;
  var CARRIER_FLASH_PHASE_FRAMES = deps.CARRIER_FLASH_PHASE_FRAMES;
  var DEFAULT_ENEMY_TOTAL = deps.DEFAULT_ENEMY_TOTAL;
  var DEFAULT_ENEMY_TYPES = deps.DEFAULT_ENEMY_TYPES;
  var DEFAULT_EXPLOSION_CORE_COLOR = deps.DEFAULT_EXPLOSION_CORE_COLOR;
  var DEFAULT_ORIGINAL_STAGE_COUNT = deps.DEFAULT_ORIGINAL_STAGE_COUNT;
  var DEFAULT_PLAYER_MOVEMENT = deps.DEFAULT_PLAYER_MOVEMENT;
  var DEFAULT_PLAYER_UPGRADE_RULES = deps.DEFAULT_PLAYER_UPGRADE_RULES;
  var DIR_X = deps.DIR_X;
  var DIR_Y = deps.DIR_Y;
  var DOWN = deps.DOWN;
  var EDITOR_TILE_TYPES = deps.EDITOR_TILE_TYPES;
  var EMPTY = deps.EMPTY;
  var ENEMY_DESTRUCTION_SCORE_TICKS = deps.ENEMY_DESTRUCTION_SCORE_TICKS;
  var ENEMY_FIRE_CHANCE = deps.ENEMY_FIRE_CHANCE;
  var FIXED_FRAME_AUDIO_UPDATE_MODE = deps.FIXED_FRAME_AUDIO_UPDATE_MODE;
  var FOREST = deps.FOREST;
  var FREE_AUDIO_MANIFEST = deps.FREE_AUDIO_MANIFEST;
  var FREE_SPRITE_MANIFEST = deps.FREE_SPRITE_MANIFEST;
  var FULL_BRICK_FRAGMENT_MASK = deps.FULL_BRICK_FRAGMENT_MASK;
  var FULL_GAME_OVER_SCREEN_FRAMES = deps.FULL_GAME_OVER_SCREEN_FRAMES;
  var GRID = deps.GRID;
  var HIGH_SCORE_SCREEN_FRAMES = deps.HIGH_SCORE_SCREEN_FRAMES;
  var ICE = deps.ICE;
  var LEFT = deps.LEFT;
  var ORIGINAL_EDITOR_PATTERNS = deps.ORIGINAL_EDITOR_PATTERNS;
  var PLAYER_UPGRADE_OVERLAY_COLORS = deps.PLAYER_UPGRADE_OVERLAY_COLORS;
  var POWERUP_SIZE = deps.POWER_UP_SIZE;
  var QUAD_GRID = deps.QUAD_GRID;
  var RIGHT = deps.RIGHT;
  var STAGE_CURTAIN_CLOSE_FRAMES = deps.STAGE_CURTAIN_CLOSE_FRAMES;
  var STEEL = deps.STEEL;
  var TILE_TYPES = deps.TILE_TYPES;
  var UP = deps.UP;
  var WALL_FRAGMENT = deps.WALL_FRAGMENT;
  var WATER = deps.WATER;
  var addScorePoints = deps.addScorePoints;
  var advanceBattleRandom = deps.advanceBattleRandom;
  var advanceEnemyDestructionState = deps.advanceEnemyDestructionState;
  var advanceFixedFrameAudioState = deps.advanceFixedFrameAudioState;
  var advanceFrameCounter = deps.advanceFrameCounter;
  var advancePlayerDestructionState = deps.advancePlayerDestructionState;
  var awardBonusLives = deps.awardBonusLives;
  // (baseDestructionPresentation — local wrapper, not deps alias)
  var beginFixedFrameAudioState = deps.beginFixedFrameAudioState;
  var beginPlayerDestructionState = deps.beginPlayerDestructionState;
  var brickFragmentRect = deps.brickFragmentRect;
  var brickFragmentsFromQuarterMask = deps.brickFragmentsFromQuarterMask;
  var buildBaseWall = deps.buildBaseWall;
  var bulletHitsTankByCenter = deps.bulletHitsTankByCenter;
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
  var createStageResultPresentation = deps.createStageResultPresentation;
  var createStageRuntime = deps.createStageRuntime;
  var damageWall = deps.damageWall;
  var directionName = deps.directionName;
  var directionTowardTarget = deps.directionTowardTarget;
  var editorBrushAt = deps.editorBrushAt;
  var editorCellForCursor = deps.editorCellForCursor;
  var editorDirectionForCode = deps.editorDirectionForCode;
  var editorPatternAt = deps.editorPatternAt;
  var enemyAiChanceMatches = deps.enemyAiChanceMatches;
  var enemyAiPhaseForInterval = deps.enemyAiPhaseForInterval;
  var enemyAiSettings = deps.enemyAiSettings;
  var enemyColor = deps.enemyColor;
  // (enemyDestructionPresentation — local wrapper, not deps alias)
  var entityRect = deps.entityRect;
  // (explosionPresentation — local wrapper, not deps alias)
  var fixedFrameAudioPresentation = deps.fixedFrameAudioPresentation;
  var fixedFrameAudioUpdateMode = deps.fixedFrameAudioUpdateMode;
  var fixedFrameVoiceDuration = deps.fixedFrameVoiceDuration;
  var fixedFrameVoiceIsAudible = deps.fixedFrameVoiceIsAudible;
  // (fullGameOverPresentation — local wrapper, not deps alias)
  var gameOverBannerPresentation = deps.gameOverBannerPresentation;
  var gameSessionSettings = deps.gameSessionSettings;
  var gridToQuadrants = deps.gridToQuadrants;
  var heldEditorDirection = deps.heldEditorDirection;
  // (highScorePresentation — local wrapper, not deps alias)
  var isEditorDirectionCode = deps.isEditorDirectionCode;
  var isEnemyAtTurnIntersection = deps.isEnemyAtTurnIntersection;
  var isEnemyMovementFrame = deps.isEnemyMovementFrame;
  var isMovementAudioBlocked = deps.isMovementAudioBlocked;
  var isPlayerShieldVisible = deps.isPlayerShieldVisible;
  var isPlayerTankVisible = deps.isPlayerTankVisible;
  var isTankDestructionStyle = deps.isTankDestructionStyle;
  var makeCell = deps.makeCell;
  var makeGrid = deps.makeGrid;
  var makeOriginalConstructionGrid = deps.makeOriginalConstructionGrid;
  // (moveEditorCursor — local wrapper, not deps alias)
  var movementAudioPresentation = deps.movementAudioPresentation;
  var nextEditorPatternIndex = deps.nextEditorPatternIndex;
  var nextEditorTileType = deps.nextEditorTileType;
  var normalizeBrickFragmentMask = deps.normalizeBrickFragmentMask;
  var originalEditorButtonHeld = deps.originalEditorButtonHeld;
  var overlappedBrickFragments = deps.overlappedBrickFragments;
  var overlappedQuarters = deps.overlappedQuarters;
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
  var projectileBoundaryImpactPoint = deps.projectileBoundaryImpactPoint;
  var projectileOutsideField = deps.projectileOutsideField;
  var quadrantType = deps.quadrantType;
  var quarterMaskFromBrickFragments = deps.quarterMaskFromBrickFragments;
  var quarterRect = deps.quarterRect;
  var rectOverlapArea = deps.rectOverlapArea;
  var rectsOverlap = deps.rectsOverlap;
  var resetFixedFrameAudioState = deps.resetFixedFrameAudioState;
  var resetFrameCounter = deps.resetFrameCounter;
  var resetPlayerState = deps.resetPlayerState;
  var resolveAudioAudibility = deps.resolveAudioAudibility;
  var resolveBulletCollisions = deps.resolveBulletCollisions;
  var resolveMovementAudioMode = deps.resolveMovementAudioMode;
  var resolvePlayerDeathState = deps.resolvePlayerDeathState;
  var rightAlignedPixelTextX = deps.rightAlignedPixelTextX;
  // (scorePopupPresentation — local wrapper, not deps alias)
  var selectEnemyTargetPlayer = deps.selectEnemyTargetPlayer;
  var selectStageClearBonusRecipients = deps.selectStageClearBonusRecipients;
  var serializeEditorStage = deps.serializeEditorStage;
  var serializeEditorStagePack = deps.serializeEditorStagePack;
  var setEditorQuadrant = deps.setEditorQuadrant;
  var setTile = deps.setTile;
  var sharedState = deps.sharedState;
  var shieldColorForTick = deps.shieldColorForTick;
  var shouldEnemyFireForByte = deps.shouldEnemyFireForByte;
  var shouldReleaseCarrierPowerUp = deps.shouldReleaseCarrierPowerUp;
  var shovelWallTypeForTimer = deps.shovelWallTypeForTimer;
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
  var wallHitSoundName = deps.wallHitSoundName;

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
  var selectEditorCursorMove = deps.moveEditorCursor;
  var defaultEnemyTypes = deps.DEFAULT_ENEMY_TYPES;

  deps.requireRuntimeModule("tankMovementRuntime").setupTankMovementRuntime(state, deps);
  deps.requireRuntimeModule("transientEffectsRuntime").setupTransientEffectsRuntime(state, deps, {
    gameSettings: gameSettings
  });
  deps.requireRuntimeModule("projectileRuntime").setupProjectileRuntime(state, deps, {
    gameSettings: gameSettings,
    playSound: playSound
  });
  deps.requireRuntimeModule("projectileMotionRuntime").setupProjectileMotionRuntime(state, deps, {
    resolveBullet: resolveBullet
  });
  deps.requireRuntimeModule("powerUpRuntime").setupPowerUpRuntime(state, deps, {
    addPlayerScore: addPlayerScore,
    addScorePopup: fn.addScorePopup,
    buildBaseWall: buildBaseWall,
    canTankOccupy: fn.canTankOccupy,
    destroyEnemy: destroyEnemy,
    gameSettings: gameSettings,
    playSound: playSound,
    randomByte: randomByte,
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
      stageEnemiesCleared()
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

  function moveEditorFromCode(code) {
    const direction = editorDirectionForCode(code);
    if (!direction) return;
    game.editorMoveHoldTimer = 0;
    moveEditorCursor(direction.dx, direction.dy);
    if (originalEditorButtonHeld(keys)) pasteOriginalEditorPattern();
  }

  function moveEditorCursor(dx, dy) {
    if (game.screen !== "editor") return;
    game.editorCursor = selectEditorCursorMove(game.editorCursor, dx, dy);
    game.editorPatternArmed = false;
  }

  function useOriginalEditorButton(delta) {
    if (!game.editorGrid) return;
    if (game.editorPatternArmed) {
      game.editorPattern = nextEditorPatternIndex(game.editorPattern, delta);
    } else {
      game.editorPatternArmed = true;
    }
    const pattern = editorPatternAt(game.editorPattern);
    game.editorBrush = pattern.type;
    pasteOriginalEditorPattern();
  }

  function pasteOriginalEditorPattern() {
    if (!game.editorGrid) return;
    const cell = editorCellForCursor(game.editorCursor);
    if (!cell) return;
    const pattern = editorPatternAt(game.editorPattern);
    setTile(game.editorGrid, cell.c, cell.r, pattern.type, pattern.mask);
    playSound("editorPaint", { brush: pattern.type });
  }

  function editAtEditorCursor(fullTile) {
    const cursor = game.editorCursor;
    if (cursor.qc < 0 || cursor.qr < 0) return;
    if (fullTile) {
      paintEditorCell(Math.floor(cursor.qc / 2), Math.floor(cursor.qr / 2));
    } else {
      paintEditorQuadrant(cursor.qc, cursor.qr);
    }
  }

  function paintEditorCell(c, r) {
    if (!game.editorGrid || c < 0 || c >= GRID || r < 0 || r >= GRID) return;
    setTile(game.editorGrid, c, r, game.editorBrush, 15);
    playSound("editorPaint", { brush: game.editorBrush });
  }

  function paintEditorQuadrant(qc, qr) {
    if (!game.editorGrid || qc < 0 || qc >= QUAD_GRID || qr < 0 || qr >= QUAD_GRID) return;
    setEditorQuadrant(game.editorGrid, qc, qr, game.editorBrush);
    playSound("editorPaintSubtile", { brush: game.editorBrush });
  }

  function selectEditorBrush(type) {
    if (!EDITOR_TILE_TYPES.includes(type)) return;
    game.editorBrush = type;
    showEditorMessage(tileTypeName(type).toUpperCase().slice(0, 6));
    playSound("editorBrush", { brush: type });
  }

  function selectEditorBrushFromPanel(x, y) {
    const type = editorBrushAt(x, y, PANEL_X + 12, 176);
    if (type !== null) selectEditorBrush(type);
  }

  function cycleEditorCell(c, r) {
    if (!game.editorGrid || c < 0 || c >= GRID || r < 0 || r >= GRID) return;
    const current = game.editorGrid[r][c].type;
    const nextType = nextEditorTileType(current);
    setTile(game.editorGrid, c, r, nextType, 15);
    playSound("editorPaint", { brush: nextType });
  }

  function cycleEditorQuadrant(qc, qr) {
    if (!game.editorGrid || qc < 0 || qc >= QUAD_GRID || qr < 0 || qr >= QUAD_GRID) return;
    const c = Math.floor(qc / 2);
    const r = Math.floor(qr / 2);
    const q = (qr % 2) * 2 + (qc % 2);
    const cell = game.editorGrid[r][c];
    const current = quadrantType(cell, q);
    const nextType = nextEditorTileType(current);
    setEditorQuadrant(game.editorGrid, qc, qr, nextType);
    playSound("editorPaintSubtile", { brush: nextType });
  }

  function updateEditorControls() {
    game.editorTick += 1;
    const direction = heldEditorDirection(keys);
    if (!direction) {
      game.editorMoveHoldTimer = 0;
      return;
    }
    game.editorPatternArmed = false;
    game.editorMoveHoldTimer += 1;
    if (game.editorMoveHoldTimer < 20) return;
    game.editorMoveHoldTimer = 15;
    moveEditorCursor(direction.dx, direction.dy);
    if (originalEditorButtonHeld(keys)) pasteOriginalEditorPattern();
  }

  function stageSelectAHeld(input) {
    return input.has("Space") || input.has("KeyZ");
  }

  function stageSelectBHeld(input) {
    return input.has("KeyF") || input.has("KeyX");
  }

  function updateStageSelectControls() {
    const aPressed = stageSelectAHeld(pendingStageSelectPresses);
    const bPressed = stageSelectBHeld(pendingStageSelectPresses);
    pendingStageSelectPresses.clear();
    const repeatFrame = (game.frameLow & 0x07) === 0;
    if (aPressed || (repeatFrame && stageSelectAHeld(keys))) {
      changeStageSelection(1);
      return;
    }
    if (bPressed || (repeatFrame && stageSelectBHeld(keys))) changeStageSelection(-1);
  }

  function update() {
    advanceFrameCounters();
    if (game.editorMessageTimer > 0) game.editorMessageTimer -= 1;
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

    if (game.screen === "title") {
      updateTitleIdle();
      return;
    }

    if (game.screen === "hiddenMessage") {
      updateHiddenMessage();
      return;
    }

    if (game.screen === "highScore") {
      updateHighScoreScreen();
      return;
    }

    if (game.screen === "fullGameOver") {
      updateFullGameOverScreen();
      return;
    }

    if (game.screen === "stageSelectClosing") {
      game.transitionTimer -= 1;
      if (game.transitionTimer <= 0) game.screen = "stageSelect";
      return;
    }

    if (game.screen === "stageSelect") {
      updateStageSelectControls();
      return;
    }

    if (game.screen === "stageClearClosing") {
      game.transitionTimer -= 1;
      if (game.transitionTimer <= 0) finishStageClearClosing();
      return;
    }

    if (game.screen === "stageIntro") {
      game.transitionTimer -= 1;
      if (game.transitionTimer <= 0) {
        game.screen = "playing";
        resetFrameCounterHigh();
        syncMovementAudio();
      }
      return;
    }

    if (game.screen === "stageClear") {
      const previousVisibleKills = stageResultVisibleKillCount(stageClearPresentation());
      game.stageClearElapsed += 1;
      const presentation = stageClearPresentation();
      if (stageResultVisibleKillCount(presentation) > previousVisibleKills) playSound("scoreCount");
      if (
        game.stageResultReason === "clear" &&
        !game.stageClearBonusAwarded &&
        game.stageClearElapsed >= presentation.bonusRevealFrame
      ) {
        awardPendingStageClearBonus();
      }
      game.transitionTimer -= 1;
      fn.updateExplosions();
      fn.updateScorePopups();
      if (game.transitionTimer <= 0) finishStageResult();
      return;
    }

    if (game.screen === "gameOver") {
      if (game.gameOverTimer <= 0) {
        finishGameOverScreen();
        return;
      }
      updateBattle({ playerInputEnabled: false, checkEnding: false });
      game.gameOverTimer -= 1;
      return;
    }

    if (game.screen === "editor") {
      updateEditorControls();
      return;
    }

    if (game.screen !== "playing") return;
    if (game.paused) {
      game.pauseElapsed += 1;
      fn.updateScorePopups();
      checkEndState();
      syncMovementAudio();
      return;
    }

    updateBattle();
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

  /**
   * Advances one active battle frame. Post-game field frames use the same
   * simulation with controller input cleared and end detection disabled.
   * @param {{playerInputEnabled?: boolean, checkEnding?: boolean}} [options]
   */
  function updateBattle(options) {
    const opts = options || {};
    const playerInputEnabled = opts.playerInputEnabled !== false && game.baseDestroyTimer <= 0;
    const checkEnding = opts.checkEnding !== false;
    game.tick += 1;
    updateFreezeTimer();

    updatePlayers(playerInputEnabled);
    updateEnemies();
    updateShovelTimer();
    updatePlayerInvulnerabilityTimers();
    fn.updateExplosions();
    updateBaseDestructionTimer();
    fn.updateBullets();
    fn.updateScorePopups();
    fn.updatePowerUp();
    updatePlayerGameOverMessage();
    if (shouldSpawnEnemies()) fn.spawnEnemies();
    if (checkEnding) checkEndState();
    syncMovementAudio();
  }

  function isGlobalTimerTick(tick) {
    return (Math.max(0, Math.floor(Number(tick) || 0)) & 63) === 0;
  }

  function updateFreezeTimer() {
    if (game.freezeTimer > 0 && isGlobalTimerTick(game.frameLow)) game.freezeTimer -= 1;
  }

  function updateShovelTimer() {
    if (game.shovelTimer <= 0 || (game.frameLow & 15) !== 0) return;
    if (isGlobalTimerTick(game.frameLow)) {
      game.shovelTimer -= 1;
      if (game.shovelTimer <= 0) {
        buildBaseWall(game.grid, BRICK);
        return;
      }
    }
    if (game.shovelTimer < gameSettings().powerUpDurations.shovelFlash) {
      buildBaseWall(game.grid, shovelWallTypeForTimer(
        game.shovelTimer,
        game.frameLow,
        gameSettings().powerUpDurations.shovelFlash
      ));
    }
  }

  function updatePlayerInvulnerabilityTimers() {
    if (!isGlobalTimerTick(game.frameLow)) return;
    for (const player of game.players) {
      if (player.invuln > 0) player.invuln -= 1;
    }
  }

  function tileTypeName(type) {
    if (type === BRICK) return "brick";
    if (type === STEEL) return "steel";
    if (type === WATER) return "water";
    if (type === FOREST) return "forest";
    if (type === ICE) return "ice";
    return "empty";
  }

  function updatePlayers(inputEnabled) {
    if (game.demoMode) {
      updateDemoPlayers();
      return;
    }
    const controlsEnabled = inputEnabled !== false;
    const firePresses = controlsEnabled ? new Set(pendingFirePresses) : new Set();
    const movementFrame = isPlayerMovementFrame(game.frameLow);
    pendingFirePresses.clear();
    for (const player of game.players) {
      const control = getPlayerControl(player.id);
      const firePressed = controlsEnabled && hasControlKey(control.fire, firePresses);
      if (player.respawn > 0) {
        if (advancePlayerDestructionState(player, movementFrame)) finishPlayerDeath(player);
        continue;
      }
      if (!player.alive) continue;

      if (player.reload > 0) player.reload -= 1;
      if (player.spawnFlash > 0) {
        player.spawnFlash -= 1;
        if (player.spawnFlash === 0) player.invuln = gameSettings().timings.playerInvulnerability;
        continue;
      }
      if (movementFrame) {
        if (player.stun > 0) {
          player.stun -= 1;
          updatePlayerMovement(player, -1, true);
        } else {
          let desiredDir = -1;
          if (controlsEnabled && hasControlKey(control.up)) desiredDir = UP;
          else if (controlsEnabled && hasControlKey(control.right)) desiredDir = RIGHT;
          else if (controlsEnabled && hasControlKey(control.down)) desiredDir = DOWN;
          else if (controlsEnabled && hasControlKey(control.left)) desiredDir = LEFT;
          updatePlayerMovement(player, desiredDir);
        }
      }

      if (firePressed) fn.shoot(player);
    }
  }

  function updateDemoPlayers() {
    pendingFirePresses.clear();
    for (const player of game.players) {
      const movementFrame = isPlayerMovementFrame(game.frameLow);
      if (player.respawn > 0) {
        if (advancePlayerDestructionState(player, movementFrame)) finishPlayerDeath(player);
        continue;
      }
      if (!player.alive) continue;
      if (player.reload > 0) player.reload -= 1;
      if (player.spawnFlash > 0) {
        player.spawnFlash -= 1;
        if (player.spawnFlash === 0) player.invuln = gameSettings().timings.playerInvulnerability;
        continue;
      }

      const control = demoControlForPlayer(player);
      if (movementFrame) {
        if (player.stun > 0) {
          player.stun -= 1;
          updatePlayerMovement(player, -1, true);
        } else {
          updatePlayerMovement(player, control.direction);
        }
      }
      if (control.fire) fn.shoot(player);
    }
  }

  function demoControlForPlayer(player) {
    const target = demoTargetForPlayer(player);
    if (!target) return { direction: -1, fire: false, targetKind: "none", targetId: null };
    const horizontalFirst = ((((player.id - 1) << 1) ^ game.frameHigh) & 2) !== 0;
    return {
      direction: directionTowardTarget(player, target, horizontalFirst),
      fire: player.y < FIELD_H - 32,
      targetKind: target.kind,
      targetId: target.id === undefined ? null : target.id
    };
  }

  function demoTargetForPlayer(player) {
    if (game.powerUp) {
      return {
        kind: "powerUp",
        id: game.powerUp.type,
        x: game.powerUp.x + game.powerUp.w / 2,
        y: game.powerUp.y + game.powerUp.h / 2
      };
    }
    const slotOrder = player.id === 2 ? [3, 5, 4] : [2, 4, 3];
    for (const slotIndex of slotOrder) {
      const enemy = game.enemies.find((candidate) =>
        candidate.alive && !candidate.destroying && candidate.spawnFlash <= 0 && candidate.slotIndex === slotIndex
      );
      if (enemy) {
        return {
          kind: "enemy",
          id: enemy.id,
          x: enemy.x + enemy.w / 2,
          y: enemy.y + enemy.h / 2
        };
      }
    }
    return null;
  }

  function isPlayerMovementFrame(tick) {
    const cadence = gameSettings().playerMovement.frameCadence || DEFAULT_PLAYER_MOVEMENT.frameCadence;
    const frame = Math.max(0, Math.floor(Number(tick) || 0));
    return cadence[frame % cadence.length];
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

  function getPlayerControl(id) {
    if (id === 1) {
      const control = { up: "ArrowUp", right: "ArrowRight", down: "ArrowDown", left: "ArrowLeft", fire: "Space" };
      if (game.playerCount < 2) {
        control.up = ["ArrowUp", "KeyW"];
        control.right = ["ArrowRight", "KeyD"];
        control.down = ["ArrowDown", "KeyS"];
        control.left = ["ArrowLeft", "KeyA"];
      }
      return control;
    }
    return { up: "KeyW", right: "KeyD", down: "KeyS", left: "KeyA", fire: "KeyF" };
  }

  function hasControlKey(binding, source) {
    const pressed = source || keys;
    if (Array.isArray(binding)) return binding.some((key) => pressed.has(key));
    return pressed.has(binding);
  }

  function updateEnemies() {
    const enemyTimeFrozen = isEnemyTimeFrozen();

    for (const enemy of game.enemies) {
      if (!enemy.alive) continue;
      if (enemy.destroying) {
        updateEnemyDestruction(enemy);
        continue;
      }
      if (enemy.spawnFlash > 0) {
        enemy.spawnFlash -= 1;
        continue;
      }
      if (enemyTimeFrozen) continue;
      if (enemy.reload > 0) enemy.reload -= 1;
      updateEnemyMovement(enemy);
      if (enemy.reload <= 0 && shouldEnemyFire(enemy)) fn.shoot(enemy);
    }
  }

  function isEnemyTimeFrozen() {
    return game.freezeTimer > 0 && gameSettings().timerFreezesEnemyTime;
  }

  /** Advances the original $73 enemy explosion timer on that tank's movement cadence. */
  function updateEnemyDestruction(enemy) {
    const released = advanceEnemyDestructionState(
      enemy,
      isEnemyMovementFrame(enemy, game.frameLow),
      fn.explosionRule("enemyDestroy").ttl
    );
    if (released) game.enemyKilled += 1;
  }

  function shouldSpawnEnemies() {
    return true;
  }

  function updateEnemyMovement(enemy, random) {
    const nextRandom = typeof random === "function" ? random : undefined;
    if (!isEnemyMovementFrame(enemy, game.frameLow)) return;

    if (recoverEnemyTankOverlap(enemy)) return;

    if (enemy.blockedPauseTicks > 0) {
      enemy.blockedPauseTicks -= 1;
      return;
    }

    if (enemy.pendingTurn) {
      enemy.pendingTurn = false;
      if ((randomByte(nextRandom) & 1) === 0) {
        chooseEnemyDirectionByPhase(enemy, nextRandom);
      } else {
        enemy.dir = (enemy.dir + ((randomByte(nextRandom) & 1) === 0 ? 3 : 1)) & 3;
      }
      return;
    }

    const ai = gameSettings().enemyAi;
    if (isEnemyAtTurnIntersection(enemy) && aiRoll(ai.intersectionTurnChance, nextRandom)) {
      chooseEnemyDirectionByPhase(enemy, nextRandom);
      return;
    }

    const distance = enemy.alternateMovement ? 1 : enemy.speed;
    const moved = fn.moveTank(enemy, DIR_X[enemy.dir] * distance, DIR_Y[enemy.dir] * distance);
    fn.advanceTankTracks(enemy);
    if (moved) return;

    if (aiRoll(ai.blockedRetryChance, nextRandom)) {
      enemy.blockedPauseTicks = ai.blockedRetryTicks;
      return;
    }

    if (isEnemyAtTurnIntersection(enemy)) enemy.pendingTurn = true;
    enemy.dir ^= 2;
  }

  /**
   * Moves an enemy out of an invalid tank overlap before normal blocked-state
   * handling can keep both tanks trapped inside each other's collision boxes.
   */
  function recoverEnemyTankOverlap(enemy) {
    const currentRect = entityRect(enemy);
    const currentArea = fn.totalTankOverlapArea(enemy, currentRect);
    if (currentArea <= 0) return false;

    const distance = enemy.alternateMovement ? 1 : Math.max(1, Number(enemy.speed) || 1);
    const directions = [enemy.dir, enemy.dir ^ 2, (enemy.dir + 1) & 3, (enemy.dir + 3) & 3];
    let best = null;
    for (const dir of directions) {
      const x = enemy.x + DIR_X[dir] * distance;
      const y = enemy.y + DIR_Y[dir] * distance;
      if (!fn.canTankOccupy(enemy, x, y)) continue;
      const area = fn.totalTankOverlapArea(enemy, { x, y, w: enemy.w, h: enemy.h });
      if (area >= currentArea || (best && area >= best.area)) continue;
      best = { x, y, dir, area };
    }
    if (!best) return false;

    enemy.x = best.x;
    enemy.y = best.y;
    enemy.dir = best.dir;
    enemy.blockedPauseTicks = 0;
    enemy.pendingTurn = false;
    fn.advanceTankTracks(enemy);
    return true;
  }

  function chooseEnemyDirectionByPhase(enemy, random) {
    const nextRandom = typeof random === "function" ? random : undefined;
    const phase = enemyAiPhase(game.stage, game.frameHigh);
    if (phase === "random") {
      enemy.dir = randomByte(nextRandom) & 3;
      return phase;
    }

    let target = { x: game.base.x + game.base.w / 2, y: game.base.y + game.base.h / 2 };
    if (phase === "player") {
      const player = selectEnemyTargetPlayer(enemy, game.players);
      if (player) target = { x: player.x + player.w / 2, y: player.y + player.h / 2 };
    }
    const horizontalFirst = aiRoll(gameSettings().enemyAi.horizontalFirstChance, nextRandom);
    enemy.dir = directionTowardTarget(enemy, target, horizontalFirst);
    return phase;
  }

  function enemyAiPhase(stage, frameHigh) {
    const interval = fn.scaleEnemySpawnDelayForPlayers(fn.defaultEnemySpawnDelay(stage), game.playerCount);
    return enemyAiPhaseForInterval(interval, frameHigh);
  }

  function shouldEnemyFire(enemy) {
    return shouldEnemyFireForByte(enemy.fireChance, ENEMY_FIRE_CHANCE, randomByte());
  }

  function aiRoll(chance, random) {
    return enemyAiChanceMatches(chance, randomByte(random));
  }

  function randomByte(random) {
    if (typeof random === "function") return Math.floor(random() * 256) & 0xff;
    return nextBattleRandomByte();
  }

  function nextBattleRandomByte() {
    const nextIndex = (game.randomIndex + 1) & 0xff;
    const next = advanceBattleRandom(
      game.randomValue,
      game.randomIndex,
      game.frameHigh,
      battleRandomZeroPageByte(nextIndex, game.randomValue)
    );
    game.randomValue = next.value;
    game.randomIndex = next.index;
    return next.value;
  }

  function resetBattleRandom() {
    game.randomValue = 0;
    game.randomIndex = 0;
  }

  /**
   * Projects the live browser battle into the zero-page addresses sampled by D44D.
   * Unmodelled scratch bytes retain the cold-start value used by the original RAM clear.
   */
  function battleRandomZeroPageByte(index, previousRandomValue) {
    const address = Math.floor(Number(index) || 0) & 0xff;
    if (address === 0x0a) return game.frameHigh;
    if (address === 0x0b) return game.frameLow;
    if (address === 0x0f) return previousRandomValue;
    if (address === 0x10) return address;
    if (address === 0x6a) return currentEnemySpawnPositionIndex();
    if (address === 0x7f) return Math.max(0, enemyTotal() - game.enemySpawned);
    if (address === 0x82) return game.nextSpawn;
    if (address === 0x84) {
      return fn.scaleEnemySpawnDelayForPlayers(fn.defaultEnemySpawnDelay(game.stage), game.playerCount);
    }
    if (address >= 0x90 && address <= 0x97) {
      return tankRandomMemoryByte(address - 0x90, "x");
    }
    if (address >= 0x98 && address <= 0x9f) {
      return tankRandomMemoryByte(address - 0x98, "y");
    }
    if (address >= 0xa8 && address <= 0xaf) {
      return tankRandomTypeByte(address - 0xa8);
    }
    return 0;
  }

  function currentEnemySpawnPositionIndex() {
    if (game.enemySpawned <= 0) return 0;
    const spec = getEnemySpec(game.stage, game.enemySpawned - 1);
    return spec.spawnIndex === undefined ? game.enemySpawned % 3 : spec.spawnIndex;
  }

  function tankForOriginalSlot(slotIndex) {
    if (slotIndex < 2) return game.players.find((player) => player.id === slotIndex + 1) || null;
    return game.enemies.find((enemy) => enemy.alive && enemy.slotIndex === slotIndex) || null;
  }

  function tankRandomMemoryByte(slotIndex, axis) {
    const tank = tankForOriginalSlot(slotIndex);
    if (!tank) return 0;
    const fieldOffset = axis === "x" ? FIELD_X : FIELD_Y;
    return (Math.round(Number(tank[axis]) || 0) + fieldOffset) & 0xff;
  }

  function tankRandomTypeByte(slotIndex) {
    const tank = tankForOriginalSlot(slotIndex);
    if (!tank) return 0;
    if (tank.kind === "player") return ((tank.level & 3) << 4) | (tank.dir & 3);
    return 0x80 | ((tank.typeIndex & 3) << 5) | (tank.carrier ? 0x04 : 0) | (tank.dir & 3);
  }

  function resolveBullet(bullet) {
    const padding = gameSettings().projectileRules.boundsPadding;
    if (projectileOutsideField(bullet, FIELD_W, FIELD_H, padding)) {
      const impact = projectileBoundaryImpactPoint(bullet, FIELD_W, FIELD_H);
      bullet.remove = true;
      fn.addRuleExplosion("steelBlocked", impact.x, impact.y);
      const sound = wallHitSoundName(bullet, true, false);
      if (sound) playSound(sound);
      return;
    }

    if (hitTerrain(bullet)) return;
    if (hitBase(bullet)) return;
    hitTank(bullet);
  }

  function hitBase(bullet) {
    if (!game.base.alive) return false;
    if (!rectsOverlap(entityRect(bullet), game.base)) return false;
    game.base.alive = false;
    game.baseDestroyTimer = game.demoMode ? 0 : fn.baseDestructionDuration();
    bullet.remove = true;
    playSound("baseHit");
    playSound("playerDestroy");
    return true;
  }

  function hitTerrain(bullet) {
    const rect = entityRect(bullet);
    const c0 = clamp(Math.floor(rect.x / TILE), 0, GRID - 1);
    const r0 = clamp(Math.floor(rect.y / TILE), 0, GRID - 1);
    const c1 = clamp(Math.floor((rect.x + rect.w - 1) / TILE), 0, GRID - 1);
    const r1 = clamp(Math.floor((rect.y + rect.h - 1) / TILE), 0, GRID - 1);

    for (let r = r0; r <= r1; r += 1) {
      for (let c = c0; c <= c1; c += 1) {
        const cell = game.grid[r][c];
        if ((cell.type !== BRICK && cell.type !== STEEL) || cell.mask === 0) continue;
        const hitMask = cell.type === BRICK
          ? overlappedBrickFragments(rect, c, r, cell)
          : overlappedQuarters(rect, c, r, cell.mask);
        if (!hitMask) continue;
        const wasSteel = cell.type === STEEL;
        let damaged = false;
        if (cell.type === BRICK || bullet.power >= 3) {
          damaged = damageWall(cell, c, r, bullet, hitMask);
          fn.addRuleExplosion(damaged ? (wasSteel ? "steelHit" : "brickHit") : "steelBlocked", bullet.x, bullet.y);
        } else {
          fn.addRuleExplosion("steelBlocked", bullet.x, bullet.y);
        }
        bullet.remove = true;
        const sound = wallHitSoundName(bullet, wasSteel, damaged);
        if (sound) playSound(sound);
        return true;
      }
    }
    return false;
  }

  function hitTank(bullet) {
    if (bullet.ownerKind === "player") {
      for (const enemy of game.enemies) {
        if (!enemy.alive || enemy.destroying || enemy.spawnFlash > 0) continue;
        if (bulletHitsTankByCenter(bullet, enemy)) {
          const wasCarrier = enemy.carrier;
          enemy.hp -= 1;
          bullet.remove = true;
          fn.addRuleExplosion("enemyHit", bullet.x + bullet.w / 2, bullet.y + bullet.h / 2);
          playSound(enemy.hp <= 0 ? "enemyDestroy" : "enemyHit");
          if (shouldReleaseCarrierPowerUp(
            wasCarrier,
            enemy.hp <= 0,
            gameSettings().powerUpRules.carrierRelease
          )) fn.releaseCarrierPowerUp(enemy);
          if (enemy.hp <= 0) destroyEnemy(enemy, bullet.ownerId);
          return true;
        }
      }

      for (const player of game.players) {
        if (!player.alive || player.id === bullet.ownerId || player.spawnFlash > 0) continue;
        if (bulletHitsTankByCenter(bullet, player)) {
          if (player.invuln > 0) {
            bullet.remove = true;
            return true;
          }
          if (gameSettings().friendlyFire.enabled && player.stun <= 0) player.stun = gameSettings().friendlyFire.stunFrames;
          bullet.remove = true;
          fn.addRuleExplosion("playerStun", bullet.x + bullet.w / 2, bullet.y + bullet.h / 2);
          return true;
        }
      }
    } else {
      for (const player of game.players) {
        if (!player.alive || player.spawnFlash > 0) continue;
        if (bulletHitsTankByCenter(bullet, player)) {
          if (player.invuln > 0) {
            bullet.remove = true;
            return true;
          }
          bullet.remove = true;
          fn.addRuleExplosion(
            "steelBlocked",
            bullet.x + bullet.w / 2,
            bullet.y + bullet.h / 2
          );
          killPlayer(player);
          return true;
        }
      }
    }
    return false;
  }

  function destroyEnemy(enemy, ownerId, options) {
    if (!enemy.alive || enemy.destroying) return;
    const opts = options || {};
    const awardScore = !game.demoMode && opts.awardScore !== false;
    const trackKill = !game.demoMode && opts.trackKill !== false;
    enemy.destroying = true;
    enemy.destroyTicks = 0;
    enemy.destroyExplosionTicks = fn.explosionRule("enemyDestroy").ttl;
    enemy.destroyShowScore = opts.showScore !== false;
    const player = game.players.find((candidate) => candidate.id === ownerId);
    if (player) {
      if (awardScore) {
        addPlayerScore(player, enemy.score);
        player.stagePoints += enemy.score;
      }
      if (trackKill) {
        player.stageKills[enemy.typeIndex] = (player.stageKills[enemy.typeIndex] || 0) + 1;
        player.totalKills[enemy.typeIndex] = (player.totalKills[enemy.typeIndex] || 0) + 1;
      }
    }
  }

  function addPlayerScore(player, points) {
    const { previousScore, nextScore } = addScorePoints(player, points);
    updateHighScore(nextScore);
    const awarded = awardBonusLives(player, previousScore, nextScore, gameSettings().bonusLifeScores);
    for (let index = 0; index < awarded; index += 1) playSound("bonusLife");
  }

  function killPlayer(player) {
    const started = beginPlayerDestructionState(player, {
      deathPowerLevel: gameSettings().deathPowerLevel,
      explosionTicks: fn.explosionRule("playerDestroy").ttl,
      respawnTicks: gameSettings().timings.playerRespawn
    });
    if (!started) return;
    playSound("playerDestroy");
    if (player.respawn === 0) finishPlayerDeath(player);
  }

  function finishPlayerDeath(player) {
    const outcome = resolvePlayerDeathState(player);
    if (!outcome.eliminated) {
      resetPlayerPosition(player);
      return;
    }
    startPlayerGameOverMessage(player);
  }

  function startPlayerGameOverMessage(player) {
    if (game.demoMode || game.screen !== "playing") return;
    if (!game.players.some((candidate) => candidate.id !== player.id && candidate.lives > 0)) return;
    const isPlayerTwo = player.id === 2;
    game.playerGameOverMessage = {
      playerId: player.id,
      timer: PLAYER_GAME_OVER_MESSAGE_TIMER,
      x: isPlayerTwo ? 0xc0 : 0x20,
      y: PLAYER_GAME_OVER_MESSAGE_Y,
      dx: isPlayerTwo ? -1 : 1
    };
    resetFrameCounterLow();
  }

  function playerGameOverMessageActive() {
    return Boolean(game.playerGameOverMessage && game.playerGameOverMessage.timer > 0);
  }

  function updatePlayerGameOverMessage() {
    const message = game.playerGameOverMessage;
    if (!message || message.timer <= 0 || game.demoMode) return;
    if ((game.frameLow & 0x0f) === 0) {
      message.timer -= 1;
      if (message.timer <= 0) {
        message.timer = 0;
        message.y = PLAYER_GAME_OVER_MESSAGE_HIDDEN_Y;
        return;
      }
    }
    if (message.timer >= PLAYER_GAME_OVER_MESSAGE_MOVE_THRESHOLD) message.x += message.dx;
  }

  /** Runs before bullet collision so a newly hit base retains its full loaded $27 counter for the hit frame. */
  function updateBaseDestructionTimer() {
    if (game.baseDestroyTimer > 0) game.baseDestroyTimer -= 1;
  }

  function stageEnemiesCleared() {
    return game.enemySpawned >= enemyTotal() && game.enemies.length === 0;
  }

  function checkEndState() {
    game.enemies = game.enemies.filter((enemy) => enemy.alive);
    if (game.demoMode) {
      const demoPlayersDone = game.players.every((player) => !player.alive && player.respawn <= 0 && player.lives <= 0);
      if (!game.base.alive || demoPlayersDone || stageEnemiesCleared()) endTitleDemo();
      return;
    }
    if (!game.base.alive) {
      if (game.baseDestroyTimer > 0) return;
      enterGameOver();
      return;
    }
    const playersDone = game.players.every((player) => !player.alive && player.respawn <= 0 && player.lives <= 0);
    if (playersDone) {
      enterGameOver();
      return;
    }
    if (stageEnemiesCleared()) {
      game.paused = false;
      game.pauseElapsed = 0;
      if (game.clearPendingTimer <= 0) {
        const extendedStageEnd = playerGameOverMessageActive();
        game.clearPendingTimer = Math.max(
          gameSettings().timings.stageClearDelay,
          extendedStageEnd ? PLAYER_GAME_OVER_STAGE_END_DELAY : 0
        );
        game.tick = 0;
        resetFrameCounters();
        if (extendedStageEnd) game.frameHigh = EXTENDED_STAGE_END_FRAME_HIGH;
        if (game.clearPendingTimer > 0) return;
      }
      if (game.clearPendingTimer > 0) {
        game.clearPendingTimer -= 1;
        if (game.clearPendingTimer > 0) return;
      }
      enterStageClear();
    }
  }

  function enterStageClear() {
    enterStageResult("clear");
  }

  /**
   * Starts the shared result count-up while preserving the distinct clear and game-over exits.
   * @param {"clear" | "gameOver"} reason
   */
  function enterStageResult(reason) {
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
    const resultReason = reason === "gameOver" ? "gameOver" : "clear";
    game.clearPendingTimer = 0;
    game.playerGameOverMessage = null;
    game.stageResultReason = resultReason;
    game.stageClearElapsed = 0;
    game.stageClearBonusPlayerIds = resultReason === "clear"
      ? stageClearBonusRecipients(game.players).map((player) => player.id)
      : [];
    game.stageClearBonusAwarded = false;
    game.screen = "stageClear";
    game.transitionTimer = stageResultDuration(game.players);
  }

  function finishStageResult() {
    stopScoreCountAudio();
    stopStageBonusAudio();
    if (game.stageResultReason === "gameOver") {
      const advance = stageAdvanceResult(game.stage);
      if (!game.customGrid && !advance.stops) game.stage = advance.stage;
      startFullGameOverScreen();
      return;
    }
    awardPendingStageClearBonus();
    const advance = stageAdvanceResult(game.stage);
    if (!game.customGrid && advance.stops) {
      game.screen = "title";
      resetTitleIdleTimer();
      return;
    }
    game.constructionStageActive = false;
    game.screen = "stageClearClosing";
    game.transitionTimer = STAGE_CURTAIN_CLOSE_FRAMES;
  }

  function finishStageClearClosing() {
    if (!game.customGrid) game.stage = stageAdvanceResult(game.stage).stage;
    startStage(game.stage);
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

  function gameOverFieldDuration() {
    const timings = gameSettings().timings;
    return timings.gameOverSlide + timings.gameOverHold;
  }

  function finishGameOverScreen() {
    enterStageResult("gameOver");
  }

  function startFullGameOverScreen() {
    stopScoreCountAudio();
    stopStageBonusAudio();
    game.screen = "fullGameOver";
    game.paused = false;
    game.fullGameOverElapsed = 0;
    playSound("gameOver");
  }

  function updateFullGameOverScreen() {
    game.fullGameOverElapsed += 1;
    if (game.fullGameOverElapsed < FULL_GAME_OVER_SCREEN_FRAMES) return;
    finishFullGameOverScreen();
  }

  function handleFullGameOverInput(code) {
    if (code !== "Enter" && code !== "Escape") return false;
    finishFullGameOverScreen();
    return true;
  }

  function finishFullGameOverScreen() {
    stopGameOverAudio();
    if (game.newHighScoreAtGameOver) {
      startHighScoreScreen();
      return;
    }
    returnToTitleAfterGame();
  }

  function startHighScoreScreen() {
    game.screen = "highScore";
    game.paused = false;
    game.highScoreScreenElapsed = 0;
    playSound("highScore");
  }

  function updateHighScoreScreen() {
    game.highScoreScreenElapsed += 1;
    if (game.highScoreScreenElapsed < HIGH_SCORE_SCREEN_FRAMES) return;
    returnToTitleAfterGame();
  }

  function returnToTitleAfterGame() {
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
    game.screen = "title";
    game.paused = false;
    game.newHighScoreAtGameOver = false;
    game.fullGameOverElapsed = 0;
    game.highScoreScreenElapsed = 0;
    game.stageResultReason = "clear";
    game.constructionUsed = false;
    game.constructionVisits = 0;
    game.hiddenInputCount = 0;
    resetTitleIdleTimer();
  }

  function stageAdvanceResult(stage) {
    const current = Math.max(1, Math.floor(Number(stage) || 1));
    const limit = stageCycleLimit();
    if (current < limit) {
      const next = current + 1;
      return {
        stage: next,
        wraps: false,
        stops: false,
        stageCycleLimit: limit,
        mapDataStage: mapDataStage(next),
        enemyDataStage: enemyDataStage(next)
      };
    }
    if (gameSettings().stageAdvance.loopAfterFinalStage) {
      return {
        stage: 1,
        wraps: true,
        stops: false,
        stageCycleLimit: limit,
        mapDataStage: mapDataStage(1),
        enemyDataStage: enemyDataStage(1)
      };
    }
    return {
      stage: current,
      wraps: false,
      stops: true,
      stageCycleLimit: limit,
      mapDataStage: mapDataStage(current),
      enemyDataStage: enemyDataStage(current)
    };
  }

  function awardPendingStageClearBonus() {
    if (game.stageClearBonusAwarded) return;
    game.stageClearBonusAwarded = true;
    const bonus = gameSettings().stageClearBonus;
    let awarded = false;
    for (const player of game.players) {
      if (!game.stageClearBonusPlayerIds.includes(player.id)) continue;
      addPlayerScore(player, bonus.points);
      player.stagePoints += bonus.points;
      awarded = true;
    }
    if (awarded) playSound("stageBonus");
  }

  /**
   * Builds the original result-table timeline, including its final empty count loop per row.
   * @param {Array<object>} players Result participants with per-type stage kill counts.
   * @param {number} elapsed Display frames elapsed since entering the result screen.
   * @returns {object} Visible row values and reveal-frame boundaries for the supplied frame.
   */
  function stageClearPresentation(players, elapsed) {
    const frame = Math.max(0, Math.floor(elapsed === undefined ? game.stageClearElapsed : elapsed));
    return createStageResultPresentation(
      players || game.players,
      enemyTypeDefinitions(),
      frame,
      game.stageClearBonusAwarded
    );
  }

  function stageResultDuration(players) {
    const override = gameSettings().timings.stageClear;
    return override > 0 ? override : stageClearPresentation(players, 0).endFrame;
  }

  function stageClearBonusRecipients(players) {
    return selectStageClearBonusRecipients(players, gameSettings().stageClearBonus);
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
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    for (const item of titleScoreLayout()) drawText(item.text, item.x, item.y, 1, "#f05a42");
    drawStripedTitleText("TANK", 68, 46, 5);
    drawStripedTitleText("DEFENDER", 56, 86, 3);
    for (let i = 0; i < TITLE_MENU_ITEMS.length; i += 1) {
      const item = TITLE_MENU_ITEMS[i];
      if (i === game.titleMenu) drawTitleMenuCursor(item);
      drawText(item.label, item.x, item.y, 1, item.color);
    }
    drawText("PIXEL LAB", 88, 184, 1, "#f05a42");
    drawText("2026 OPEN PIXEL LAB", 32, 200, 1, "#f3f0d4");
    drawText("ALL RIGHTS RESERVED", 48, 216, 1, "#f3f0d4");
  }

  function renderHiddenMessage() {
    const presentation = hiddenMessagePresentation(game.hiddenMessageElapsed);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    for (let index = 0; index < presentation.visibleLines.length; index += 1) {
      drawText(presentation.visibleLines[index], 64, 64 + index * 16, 1, "#f3f0d4");
    }
    if (presentation.dots > 0) drawText(".".repeat(presentation.dots), 64, 128, 1, "#f3f0d4");
    if (presentation.drop) {
      drawManifestSprite("hiddenDrop", presentation.drop.frame, presentation.drop.x, presentation.drop.y, {
        primary: "#55b96a",
        light: "#b7ffbd",
        shadow: "#245c33"
      });
    }
  }

  function renderHighScore() {
    const presentation = highScorePresentation(game.highScoreScreenElapsed, game.highScore);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    const palette = {
      dark: "#1b1512",
      primary: presentation.color,
      highlight: "#f7f1c6"
    };
    drawStripedTitleText("HISCORE", 23, 50, 5, palette);
    drawStripedTitleText(presentation.scoreText, presentation.scoreX, 100, 5, palette);
  }

  function renderFullGameOver() {
    const presentation = fullGameOverPresentation(game.fullGameOverElapsed);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    for (let index = 0; index < presentation.gameText.length; index += 1) {
      drawStripedTitleText(
        presentation.gameText[index],
        presentation.x + index * presentation.letterAdvance,
        presentation.gameY,
        presentation.scale
      );
    }
    for (let index = 0; index < presentation.overText.length; index += 1) {
      drawStripedTitleText(
        presentation.overText[index],
        presentation.x + index * presentation.letterAdvance,
        presentation.overY,
        presentation.scale
      );
    }
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
    const size = Math.max(2, Math.floor(scale || 2));
    const colors = palette || { dark: "#a8322c", primary: "#f05a42", highlight: "#f3f0d4" };
    let cursorX = Math.round(x);
    const top = Math.round(y);
    for (const ch of String(text).toUpperCase()) {
      const glyph = pixelGlyph(ch);
      for (let row = 0; row < glyph.length; row += 1) {
        for (let col = 0; col < glyph[row].length; col += 1) {
          if (glyph[row][col] !== "1") continue;
          const px = cursorX + col * size;
          const py = top + row * size;
          ctx.fillStyle = colors.dark;
          ctx.fillRect(px, py, size, size);
          ctx.fillStyle = colors.primary;
          ctx.fillRect(px, py, size, Math.max(1, size - 1));
          ctx.fillStyle = colors.highlight;
          ctx.fillRect(px, py + Math.floor(size / 2), size, 1);
        }
      }
      cursorX += 6 * size;
    }
  }

  function drawTitleMenuCursor(item) {
    drawMiniTank(item.x - 20, item.y - 4, "#e3c64e");
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
    ctx.fillStyle = "#6b6f78";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    ctx.fillStyle = "#000";
    ctx.fillRect(FIELD_X, FIELD_Y, FIELD_W, FIELD_H);
    renderTerrain(false, grid);
    renderTerrain(true, grid);
  }

  function renderTerrain(topLayer, grid) {
    for (let r = 0; r < GRID; r += 1) {
      for (let c = 0; c < GRID; c += 1) {
        const cell = grid[r][c];
        const x = FIELD_X + c * TILE;
        const y = FIELD_Y + r * TILE;
        if (topLayer) {
          if (cell.type === FOREST) drawForest(x, y);
          continue;
        }
        if (cell.type === BRICK) drawBrickCell(x, y, cell);
        else if (cell.type === STEEL) drawWallCell(x, y, cell.mask, "#626a76", "#c9d0d9");
        else if (cell.type === WATER) drawWater(x, y);
        else if (cell.type === ICE) drawIce(x, y);
      }
    }
  }

  function drawWallCell(x, y, mask, dark, light) {
    const frameName = dark === "#a24f32" ? "brick" : "steel";
    for (let q = 0; q < 4; q += 1) {
      if (!(mask & (1 << q))) continue;
      const qx = x + (q % 2) * HALF;
      const qy = y + (q >= 2 ? HALF : 0);
      drawManifestSprite("wallQuarter", frameName, qx, qy, {
        dark,
        light,
        seam: frameName === "steel" ? "#5a6370" : light,
        bolt: frameName === "steel" ? "#333943" : dark,
        shadow: "#1b1512"
      });
    }
  }

  function drawBrickCell(x, y, cell) {
    const fragments = normalizeBrickFragmentMask(cell.brickMask, cell.mask);
    drawWallCell(x, y, quarterMaskFromBrickFragments(fragments), "#a24f32", "#d38658");
    ctx.fillStyle = "#000000";
    for (let fragment = 0; fragment < 16; fragment += 1) {
      const quarter = Math.floor(fragment / 8) * 2 + Math.floor((fragment % 4) / 2);
      if (!(fragments & BRICK_QUARTER_FRAGMENT_MASKS[quarter])) continue;
      if (fragments & (1 << fragment)) continue;
      ctx.fillRect(
        x + (fragment % 4) * WALL_FRAGMENT,
        y + Math.floor(fragment / 4) * WALL_FRAGMENT,
        WALL_FRAGMENT,
        WALL_FRAGMENT
      );
    }
  }

  function drawWater(x, y) {
    const frame = waterFrameName(game.frameLow);
    drawManifestSprite("terrain", frame, x, y, {
      base: "#173b67",
      wave: frame === "waterA" ? "#56a6d5" : "#2d789e"
    });
  }

  function waterFrameName(tick) {
    return (Math.max(0, Math.floor(Number(tick) || 0)) & 32) === 0 ? "waterA" : "waterB";
  }

  function drawIce(x, y) {
    drawManifestSprite("terrain", "ice", x, y, {
      base: "#b7c8d8",
      highlight: "#f1f8ff",
      shadow: "#7e96aa"
    });
  }

  function renderProjectileTerrainCover(grid) {
    for (let r = 0; r < GRID; r += 1) {
      for (let c = 0; c < GRID; c += 1) {
        if (grid[r][c].type === ICE) drawIceProjectileCover(FIELD_X + c * TILE, FIELD_Y + r * TILE);
      }
    }
  }

  function drawIceProjectileCover(x, y) {
    ctx.fillStyle = "rgba(241, 248, 255, 0.72)";
    ctx.fillRect(x + 2, y + 2, 10, 1);
    ctx.fillRect(x + 4, y + 7, 9, 1);
    ctx.fillStyle = "rgba(126, 150, 170, 0.42)";
    ctx.fillRect(x + 1, y + 14, 14, 1);
  }

  function drawForest(x, y) {
    drawManifestSprite("terrain", "forest", x, y, {
      base: "#315b34",
      light: "#3f7f42",
      dark: "#244327"
    });
  }

  function renderBase() {
    const x = FIELD_X + game.base.x;
    const y = FIELD_Y + game.base.y;
    drawManifestSprite("base", game.base.alive ? "alive" : "dead", x, y, {
      primary: game.base.alive ? "#d8c17a" : "#5c514a",
      shadow: game.base.alive ? "#181818" : "#2e2624"
    });
  }

  function drawTank(tank, color, accent) {
    const x = Math.round(FIELD_X + tank.x);
    const y = Math.round(FIELD_Y + tank.y);
    const primary = tankPrimaryColor(tank, color, battleDisplayFrame());
    drawManifestSprite("tank", directionName(tank.dir), x, y, {
      primary,
      accent,
      shadow: "#111111"
    });
    drawManifestSprite("tankTracks", tankTrackFrameName(tank), x, y, {
      primary,
      shadow: "#111111"
    });
    if (tank.kind === "player") drawPlayerUpgradeOverlay(tank, x, y, accent);
  }

  function drawPlayerUpgradeOverlay(tank, x, y, accent) {
    const parts = playerUpgradeOverlayParts(tank.level, tank.dir);
    if (!parts.length) return;
    const palette = {
      level1: accent || PLAYER_UPGRADE_OVERLAY_COLORS.level1,
      level2: PLAYER_UPGRADE_OVERLAY_COLORS.level2,
      level3: PLAYER_UPGRADE_OVERLAY_COLORS.level3
    };
    for (const part of parts) {
      const rect = part.rect;
      ctx.fillStyle = palette[part.role] || PLAYER_UPGRADE_OVERLAY_COLORS.level1;
      ctx.fillRect(x + rect[0], y + rect[1], rect[2], rect[3]);
    }
  }

  function drawShield(tank) {
    const x = Math.round(FIELD_X + tank.x - 2);
    const y = Math.round(FIELD_Y + tank.y - 2);
    ctx.lineWidth = 1;
    drawManifestSprite("shield", "box", x, y, {
      primary: shieldColorForTick(game.frameLow)
    });
  }

  function drawSpawn(tank) {
    const x = Math.round(FIELD_X + tank.x + 7);
    const y = Math.round(FIELD_Y + tank.y + 7);
    const total = tank.kind === "player"
      ? gameSettings().timings.playerSpawnFlash
      : gameSettings().timings.enemySpawnFlash;
    const presentation = spawnAnimationPresentation(tank.spawnFlash, total);
    const scale = presentation.size / 14;
    drawScaledManifestSprite(
      "spawn",
      "box",
      x - presentation.size / 2,
      y - presentation.size / 2,
      scale,
      { primary: "#f3f0d4" }
    );
  }

  function drawBullet(bullet) {
    const sprite = FREE_SPRITE_MANIFEST.sprites.bullet;
    const scale = bullet.w / (sprite && sprite.size ? sprite.size : bullet.w);
    drawScaledManifestSprite("bullet", "default", Math.round(FIELD_X + bullet.x), Math.round(FIELD_Y + bullet.y), scale, {
      primary: bullet.ownerKind === "player" ? "#f8e08b" : "#f7f1c6"
    });
  }

  function drawPowerUp(power) {
    if (!isPowerUpVisible(battleDisplayFrame())) return;
    const visual = powerUpVisualRect(power);
    const x = visual.x;
    const y = visual.y;
    ctx.fillStyle = "#102748";
    ctx.fillRect(x, y, visual.w, visual.h);
    ctx.fillStyle = "#aab4c2";
    ctx.fillRect(x + 2, y + 2, visual.w - 4, visual.h - 4);
    ctx.fillStyle = "#dbe1e8";
    ctx.fillRect(x + 3, y + 3, visual.w - 6, 1);
    drawManifestSprite("powerUp", power.type, x, y, {
      outline: "#102748",
      primary: "#f3f0d4",
      shade: "#77869a",
      cutout: "#aab4c2"
    });
  }

  function isPowerUpVisible(tick) {
    return (Math.max(0, Math.floor(Number(tick) || 0)) & 8) !== 0;
  }

  /**
   * Returns the visual frame phase used by display handlers that keep running
   * while the battle simulation is paused.
   */
  function battleDisplayFrame() {
    return game.frameLow;
  }

  function powerUpVisualRect(power) {
    const sprite = FREE_SPRITE_MANIFEST.sprites.powerUp;
    const size = sprite && sprite.size ? sprite.size : POWERUP_SIZE;
    const inset = (size - power.w) / 2;
    return {
      x: FIELD_X + power.x - inset,
      y: FIELD_Y + power.y - inset,
      w: size,
      h: size
    };
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
    const presentation = stageClearPresentation();
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
  state.fn.moveEditorFromCode = moveEditorFromCode;
  state.fn.moveEditorCursor = moveEditorCursor;
  state.fn.useOriginalEditorButton = useOriginalEditorButton;
  state.fn.pasteOriginalEditorPattern = pasteOriginalEditorPattern;
  state.fn.editAtEditorCursor = editAtEditorCursor;
  state.fn.paintEditorCell = paintEditorCell;
  state.fn.paintEditorQuadrant = paintEditorQuadrant;
  state.fn.selectEditorBrush = selectEditorBrush;
  state.fn.selectEditorBrushFromPanel = selectEditorBrushFromPanel;
  state.fn.cycleEditorCell = cycleEditorCell;
  state.fn.cycleEditorQuadrant = cycleEditorQuadrant;
  state.fn.updateEditorControls = updateEditorControls;
  state.fn.stageSelectAHeld = stageSelectAHeld;
  state.fn.stageSelectBHeld = stageSelectBHeld;
  state.fn.updateStageSelectControls = updateStageSelectControls;
  state.fn.updateBattle = updateBattle;
  state.fn.isGlobalTimerTick = isGlobalTimerTick;
  state.fn.updateFreezeTimer = updateFreezeTimer;
  state.fn.updateShovelTimer = updateShovelTimer;
  state.fn.updatePlayerInvulnerabilityTimers = updatePlayerInvulnerabilityTimers;
  state.fn.tileTypeName = tileTypeName;
  state.fn.updatePlayers = updatePlayers;
  state.fn.updateDemoPlayers = updateDemoPlayers;
  state.fn.demoControlForPlayer = demoControlForPlayer;
  state.fn.demoTargetForPlayer = demoTargetForPlayer;
  state.fn.isPlayerMovementFrame = isPlayerMovementFrame;
  state.fn.updatePlayerMovement = updatePlayerMovement;
  state.fn.getPlayerControl = getPlayerControl;
  state.fn.hasControlKey = hasControlKey;
  state.fn.updateEnemies = updateEnemies;
  state.fn.isEnemyTimeFrozen = isEnemyTimeFrozen;
  state.fn.updateEnemyDestruction = updateEnemyDestruction;
  state.fn.shouldSpawnEnemies = shouldSpawnEnemies;
  state.fn.updateEnemyMovement = updateEnemyMovement;
  state.fn.recoverEnemyTankOverlap = recoverEnemyTankOverlap;
  state.fn.chooseEnemyDirectionByPhase = chooseEnemyDirectionByPhase;
  state.fn.enemyAiPhase = enemyAiPhase;
  state.fn.shouldEnemyFire = shouldEnemyFire;
  state.fn.aiRoll = aiRoll;
  state.fn.randomByte = randomByte;
  state.fn.nextBattleRandomByte = nextBattleRandomByte;
  state.fn.resetBattleRandom = resetBattleRandom;
  state.fn.battleRandomZeroPageByte = battleRandomZeroPageByte;
  state.fn.currentEnemySpawnPositionIndex = currentEnemySpawnPositionIndex;
  state.fn.tankForOriginalSlot = tankForOriginalSlot;
  state.fn.tankRandomMemoryByte = tankRandomMemoryByte;
  state.fn.tankRandomTypeByte = tankRandomTypeByte;
  state.fn.resolveBullet = resolveBullet;
  state.fn.hitBase = hitBase;
  state.fn.hitTerrain = hitTerrain;
  state.fn.hitTank = hitTank;
  state.fn.destroyEnemy = destroyEnemy;
  state.fn.addPlayerScore = addPlayerScore;
  state.fn.killPlayer = killPlayer;
  state.fn.finishPlayerDeath = finishPlayerDeath;
  state.fn.startPlayerGameOverMessage = startPlayerGameOverMessage;
  state.fn.playerGameOverMessageActive = playerGameOverMessageActive;
  state.fn.updatePlayerGameOverMessage = updatePlayerGameOverMessage;
  state.fn.updateBaseDestructionTimer = updateBaseDestructionTimer;
  state.fn.stageEnemiesCleared = stageEnemiesCleared;
  state.fn.checkEndState = checkEndState;
  state.fn.enterStageClear = enterStageClear;
  state.fn.enterStageResult = enterStageResult;
  state.fn.finishStageResult = finishStageResult;
  state.fn.finishStageClearClosing = finishStageClearClosing;
  state.fn.enterGameOver = enterGameOver;
  state.fn.gameOverFieldDuration = gameOverFieldDuration;
  state.fn.finishGameOverScreen = finishGameOverScreen;
  state.fn.startFullGameOverScreen = startFullGameOverScreen;
  state.fn.updateFullGameOverScreen = updateFullGameOverScreen;
  state.fn.handleFullGameOverInput = handleFullGameOverInput;
  state.fn.finishFullGameOverScreen = finishFullGameOverScreen;
  state.fn.startHighScoreScreen = startHighScoreScreen;
  state.fn.updateHighScoreScreen = updateHighScoreScreen;
  state.fn.returnToTitleAfterGame = returnToTitleAfterGame;
  state.fn.stageAdvanceResult = stageAdvanceResult;
  state.fn.awardPendingStageClearBonus = awardPendingStageClearBonus;
  state.fn.stageClearPresentation = stageClearPresentation;
  state.fn.stageResultDuration = stageResultDuration;
  state.fn.stageClearBonusRecipients = stageClearBonusRecipients;
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
  var last = performance.now();
  var accumulator = 0;

  function frame(now) {
    var elapsed = Math.min(80, now - last);
    last = now;
    accumulator += elapsed;
    while (accumulator >= sh.STEP_MS) {
      update();
      accumulator -= sh.STEP_MS;
    }
    render();
    requestAnimationFrame(frame);
  }

  loadHighScore();
  state.game.grid = createStageGrid(state.game.stage);
  requestAnimationFrame(frame);
})();
